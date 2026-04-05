/**
 * AI Provider Interface - Modular LLM Support
 * 
 * This module provides a unified interface for integrating multiple AI providers.
 * The system is designed to be:
 * - Provider-agnostic: Swap between OpenAI, Anthropic, Google, local models, etc.
 * - Future-proof: Easy to add new providers as they emerge
 * - Configurable: Per-agent or per-request provider selection
 * - Fallback-capable: Automatic failover between providers
 */

import { ENV } from "./env";
import { Message, InvokeParams, InvokeResult, Tool, ToolChoice } from "./llm";

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export type AIProviderType = 
  | "manus"           // Default Manus Forge API (current)
  | "openai"          // OpenAI GPT models
  | "anthropic"       // Anthropic Claude models
  | "google"          // Google Gemini models
  | "mistral"         // Mistral AI models
  | "cohere"          // Cohere Command models
  | "huggingface"     // Hugging Face Inference API
  | "ollama"          // Local Ollama models
  | "lmstudio"        // Local LM Studio models
  | "custom";         // Custom provider endpoint

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
  headers?: Record<string, string>;
  enabled: boolean;
  priority: number;  // Lower = higher priority for fallback
}

export interface AIProviderRegistry {
  providers: Map<string, AIProviderConfig>;
  defaultProvider: string;
  fallbackEnabled: boolean;
}

// ============================================================================
// DEFAULT PROVIDER CONFIGURATIONS
// ============================================================================

const DEFAULT_PROVIDERS: Record<AIProviderType, Partial<AIProviderConfig>> = {
  manus: {
    type: "manus",
    baseUrl: "https://forge.manus.im/v1",
    model: "gemini-2.5-flash",
    maxTokens: 32768,
    enabled: true,
    priority: 1,
  },
  openai: {
    type: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    maxTokens: 16384,
    enabled: false,
    priority: 2,
  },
  anthropic: {
    type: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-3-5-sonnet-20241022",
    maxTokens: 8192,
    enabled: false,
    priority: 3,
  },
  google: {
    type: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-1.5-pro",
    maxTokens: 8192,
    enabled: false,
    priority: 4,
  },
  mistral: {
    type: "mistral",
    baseUrl: "https://api.mistral.ai/v1",
    model: "mistral-large-latest",
    maxTokens: 8192,
    enabled: false,
    priority: 5,
  },
  cohere: {
    type: "cohere",
    baseUrl: "https://api.cohere.ai/v1",
    model: "command-r-plus",
    maxTokens: 4096,
    enabled: false,
    priority: 6,
  },
  huggingface: {
    type: "huggingface",
    baseUrl: "https://api-inference.huggingface.co/models",
    model: "meta-llama/Llama-3.1-70B-Instruct",
    maxTokens: 4096,
    enabled: false,
    priority: 7,
  },
  ollama: {
    type: "ollama",
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.1",
    maxTokens: 4096,
    enabled: false,
    priority: 8,
  },
  lmstudio: {
    type: "lmstudio",
    baseUrl: "http://localhost:1234/v1",
    model: "local-model",
    maxTokens: 4096,
    enabled: false,
    priority: 9,
  },
  custom: {
    type: "custom",
    enabled: false,
    priority: 10,
  },
};

// ============================================================================
// PROVIDER REGISTRY
// ============================================================================

class AIProviderManager {
  private registry: AIProviderRegistry;
  
  constructor() {
    this.registry = {
      providers: new Map(),
      defaultProvider: "manus",
      fallbackEnabled: true,
    };
    
    // Initialize with default Manus provider
    this.registerProvider("manus", {
      ...DEFAULT_PROVIDERS.manus,
      apiKey: ENV.forgeApiKey,
      baseUrl: ENV.forgeApiUrl || DEFAULT_PROVIDERS.manus.baseUrl,
    } as AIProviderConfig);
  }
  
  /**
   * Register a new AI provider
   */
  registerProvider(id: string, config: AIProviderConfig): void {
    this.registry.providers.set(id, config);
  }
  
  /**
   * Get a provider by ID
   */
  getProvider(id: string): AIProviderConfig | undefined {
    return this.registry.providers.get(id);
  }
  
  /**
   * Get all enabled providers sorted by priority
   */
  getEnabledProviders(): AIProviderConfig[] {
    return Array.from(this.registry.providers.values())
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Set the default provider
   */
  setDefaultProvider(id: string): void {
    if (!this.registry.providers.has(id)) {
      throw new Error(`Provider ${id} not registered`);
    }
    this.registry.defaultProvider = id;
  }
  
  /**
   * Enable or disable fallback behavior
   */
  setFallbackEnabled(enabled: boolean): void {
    this.registry.fallbackEnabled = enabled;
  }
  
  /**
   * Get provider configuration for a specific type
   */
  getDefaultConfig(type: AIProviderType): Partial<AIProviderConfig> {
    return DEFAULT_PROVIDERS[type] || DEFAULT_PROVIDERS.custom;
  }
}

// Singleton instance
export const aiProviderManager = new AIProviderManager();

// ============================================================================
// PROVIDER-SPECIFIC ADAPTERS
// ============================================================================

interface ProviderAdapter {
  formatRequest(params: InvokeParams, config: AIProviderConfig): Record<string, unknown>;
  parseResponse(response: any): InvokeResult;
  getEndpoint(config: AIProviderConfig): string;
  getHeaders(config: AIProviderConfig): Record<string, string>;
}

const openAICompatibleAdapter: ProviderAdapter = {
  formatRequest(params: InvokeParams, config: AIProviderConfig) {
    return {
      model: config.model,
      messages: params.messages,
      max_tokens: params.maxTokens || config.maxTokens,
      tools: params.tools,
      tool_choice: params.toolChoice || params.tool_choice,
      response_format: params.responseFormat || params.response_format,
    };
  },
  
  parseResponse(response: any): InvokeResult {
    return response as InvokeResult;
  },
  
  getEndpoint(config: AIProviderConfig): string {
    return `${config.baseUrl}/chat/completions`;
  },
  
  getHeaders(config: AIProviderConfig): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
      ...config.headers,
    };
  },
};

const anthropicAdapter: ProviderAdapter = {
  formatRequest(params: InvokeParams, config: AIProviderConfig) {
    // Convert OpenAI-style messages to Anthropic format
    const systemMessage = params.messages.find(m => m.role === "system");
    const otherMessages = params.messages.filter(m => m.role !== "system");
    
    return {
      model: config.model,
      max_tokens: params.maxTokens || config.maxTokens || 4096,
      system: systemMessage ? (typeof systemMessage.content === "string" ? systemMessage.content : JSON.stringify(systemMessage.content)) : undefined,
      messages: otherMessages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      })),
    };
  },
  
  parseResponse(response: any): InvokeResult {
    // Convert Anthropic response to OpenAI format
    return {
      id: response.id,
      created: Date.now(),
      model: response.model,
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: response.content?.[0]?.text || "",
        },
        finish_reason: response.stop_reason || "stop",
      }],
      usage: {
        prompt_tokens: response.usage?.input_tokens || 0,
        completion_tokens: response.usage?.output_tokens || 0,
        total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      },
    };
  },
  
  getEndpoint(config: AIProviderConfig): string {
    return `${config.baseUrl}/messages`;
  },
  
  getHeaders(config: AIProviderConfig): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey || "",
      "anthropic-version": "2023-06-01",
      ...config.headers,
    };
  },
};

const PROVIDER_ADAPTERS: Partial<Record<AIProviderType, ProviderAdapter>> = {
  manus: openAICompatibleAdapter,
  openai: openAICompatibleAdapter,
  anthropic: anthropicAdapter,
  google: openAICompatibleAdapter,  // Gemini uses OpenAI-compatible API
  mistral: openAICompatibleAdapter,
  ollama: openAICompatibleAdapter,
  lmstudio: openAICompatibleAdapter,
  custom: openAICompatibleAdapter,
};

// ============================================================================
// UNIFIED INVOKE FUNCTION
// ============================================================================

export interface InvokeWithProviderParams extends InvokeParams {
  providerId?: string;
  providerType?: AIProviderType;
}

/**
 * Invoke LLM with automatic provider selection and fallback
 */
export async function invokeWithProvider(
  params: InvokeWithProviderParams
): Promise<InvokeResult> {
  const { providerId, providerType, ...invokeParams } = params;
  
  // Get providers to try
  let providersToTry: AIProviderConfig[] = [];
  
  if (providerId) {
    const provider = aiProviderManager.getProvider(providerId);
    if (provider) {
      providersToTry = [provider];
    }
  } else if (providerType) {
    const provider = aiProviderManager.getProvider(providerType);
    if (provider) {
      providersToTry = [provider];
    }
  }
  
  // If no specific provider, use enabled providers with fallback
  if (providersToTry.length === 0) {
    providersToTry = aiProviderManager.getEnabledProviders();
  }
  
  if (providersToTry.length === 0) {
    throw new Error("No AI providers available");
  }
  
  let lastError: Error | null = null;
  
  for (const provider of providersToTry) {
    try {
      const result = await invokeProvider(invokeParams, provider);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Provider ${provider.type} failed:`, lastError.message);
      
      // If fallback is disabled, throw immediately
      if (!aiProviderManager.getEnabledProviders().length) {
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error("All providers failed");
}

async function invokeProvider(
  params: InvokeParams,
  config: AIProviderConfig
): Promise<InvokeResult> {
  const adapter = PROVIDER_ADAPTERS[config.type] || openAICompatibleAdapter;
  
  const endpoint = adapter.getEndpoint(config);
  const headers = adapter.getHeaders(config);
  const body = adapter.formatRequest(params, config);
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${config.type} API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return adapter.parseResponse(data);
}

// ============================================================================
// CAPABILITY DETECTION
// ============================================================================

export interface ProviderCapabilities {
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  audio: boolean;
  embeddings: boolean;
  jsonMode: boolean;
  maxContextLength: number;
}

const PROVIDER_CAPABILITIES: Record<AIProviderType, ProviderCapabilities> = {
  manus: {
    streaming: true,
    functionCalling: true,
    vision: true,
    audio: true,
    embeddings: true,
    jsonMode: true,
    maxContextLength: 128000,
  },
  openai: {
    streaming: true,
    functionCalling: true,
    vision: true,
    audio: true,
    embeddings: true,
    jsonMode: true,
    maxContextLength: 128000,
  },
  anthropic: {
    streaming: true,
    functionCalling: true,
    vision: true,
    audio: false,
    embeddings: false,
    jsonMode: true,
    maxContextLength: 200000,
  },
  google: {
    streaming: true,
    functionCalling: true,
    vision: true,
    audio: true,
    embeddings: true,
    jsonMode: true,
    maxContextLength: 1000000,
  },
  mistral: {
    streaming: true,
    functionCalling: true,
    vision: false,
    audio: false,
    embeddings: true,
    jsonMode: true,
    maxContextLength: 32000,
  },
  cohere: {
    streaming: true,
    functionCalling: true,
    vision: false,
    audio: false,
    embeddings: true,
    jsonMode: true,
    maxContextLength: 128000,
  },
  huggingface: {
    streaming: false,
    functionCalling: false,
    vision: true,
    audio: false,
    embeddings: true,
    jsonMode: false,
    maxContextLength: 32000,
  },
  ollama: {
    streaming: true,
    functionCalling: true,
    vision: true,
    audio: false,
    embeddings: true,
    jsonMode: true,
    maxContextLength: 32000,
  },
  lmstudio: {
    streaming: true,
    functionCalling: true,
    vision: true,
    audio: false,
    embeddings: true,
    jsonMode: true,
    maxContextLength: 32000,
  },
  custom: {
    streaming: true,
    functionCalling: true,
    vision: false,
    audio: false,
    embeddings: false,
    jsonMode: true,
    maxContextLength: 8000,
  },
};

export function getProviderCapabilities(type: AIProviderType): ProviderCapabilities {
  return PROVIDER_CAPABILITIES[type] || PROVIDER_CAPABILITIES.custom;
}

// ============================================================================
// EXPORT TYPES FOR EXTERNAL USE
// ============================================================================

export type {
  Message,
  InvokeParams,
  InvokeResult,
  Tool,
  ToolChoice,
};
