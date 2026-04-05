import { useEffect, useRef, useCallback, useState } from "react";

export type ChatEventType = 
  | "message" 
  | "typing" 
  | "presence" 
  | "read" 
  | "reaction"
  | "connected"
  | "heartbeat";

export interface ChatEvent {
  type: ChatEventType;
  chatId?: number;
  data: Record<string, unknown>;
  timestamp: number;
}

interface UseSSEOptions {
  onMessage?: (event: ChatEvent) => void;
  onTyping?: (event: ChatEvent) => void;
  onPresence?: (event: ChatEvent) => void;
  onRead?: (event: ChatEvent) => void;
  onReaction?: (event: ChatEvent) => void;
  onConnected?: (event: ChatEvent) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
}

export function useSSE(options: UseSSEOptions = {}) {
  const {
    onMessage,
    onTyping,
    onPresence,
    onRead,
    onReaction,
    onConnected,
    onError,
    enabled = true,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource("/api/chat/events", {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ChatEvent = JSON.parse(event.data);
          
          switch (data.type) {
            case "message":
              onMessage?.(data);
              break;
            case "typing":
              onTyping?.(data);
              break;
            case "presence":
              onPresence?.(data);
              break;
            case "read":
              onRead?.(data);
              break;
            case "reaction":
              onReaction?.(data);
              break;
            case "connected":
              onConnected?.(data);
              break;
            case "heartbeat":
              // Heartbeat received, connection is alive
              break;
          }
        } catch (error) {
          console.error("Error parsing SSE event:", error);
        }
      };

      eventSource.onerror = (error) => {
        setIsConnected(false);
        onError?.(error);
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          reconnectAttempts.current++;
          setConnectionError(`Connection lost. Reconnecting in ${delay / 1000}s...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionError("Unable to connect to real-time updates. Please refresh the page.");
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Error creating EventSource:", error);
      setConnectionError("Failed to establish real-time connection");
    }
  }, [onMessage, onTyping, onPresence, onRead, onReaction, onConnected, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    reconnect: connect,
    disconnect,
  };
}

// Hook for typing indicator with debounce
export function useTypingIndicator(chatId: number | null, sendTyping: (chatId: number, isTyping: boolean) => void) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const startTyping = useCallback(() => {
    if (!chatId) return;
    
    // Send typing indicator if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(chatId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current && chatId) {
        isTypingRef.current = false;
        sendTyping(chatId, false);
      }
    }, 3000);
  }, [chatId, sendTyping]);

  const stopTyping = useCallback(() => {
    if (!chatId) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTyping(chatId, false);
    }
  }, [chatId, sendTyping]);

  // Cleanup on unmount or chat change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  return { startTyping, stopTyping };
}
