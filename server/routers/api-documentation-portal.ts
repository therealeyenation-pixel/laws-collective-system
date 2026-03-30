import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

/**
 * Phase 50: API Documentation Portal Router
 * 
 * Procedures for:
 * - API documentation retrieval
 * - Code examples
 * - Sandbox testing
 * - Webhook management
 * - SDK downloads
 * - Authentication guides
 */

export const apiDocumentationPortalRouter = router({
  /**
   * Get all API endpoints documentation
   */
  getEndpoints: publicProcedure.query(async () => {
    return {
      endpoints: [
        {
          id: "ep_1",
          name: "Get Campaigns",
          method: "GET",
          path: "/api/trpc/emailCampaignDashboard.getCampaigns",
          description: "Retrieve all email campaigns",
          auth: "required",
          rateLimit: "100 req/min",
          tags: ["campaigns", "email"],
        },
        {
          id: "ep_2",
          name: "Create Campaign",
          method: "POST",
          path: "/api/trpc/emailCampaignDashboard.createCampaign",
          description: "Create a new email campaign",
          auth: "required",
          rateLimit: "10 req/min",
          tags: ["campaigns", "email"],
        },
        {
          id: "ep_3",
          name: "Send SMS",
          method: "POST",
          path: "/api/trpc/smsNotificationSystem.sendSMS",
          description: "Send SMS notification",
          auth: "required",
          rateLimit: "1000 req/min",
          tags: ["sms", "notifications"],
        },
      ],
      total: 3,
    };
  }),

  /**
   * Get endpoint details
   */
  getEndpointDetails: publicProcedure
    .input(z.object({ endpointId: z.string() }))
    .query(async ({ input }) => {
      return {
        id: input.endpointId,
        name: "Get Campaigns",
        method: "GET",
        path: "/api/trpc/emailCampaignDashboard.getCampaigns",
        description: "Retrieve all email campaigns with pagination",
        auth: "required",
        rateLimit: "100 req/min",
        parameters: [
          {
            name: "limit",
            type: "integer",
            required: false,
            description: "Number of results per page",
            default: 50,
          },
          {
            name: "offset",
            type: "integer",
            required: false,
            description: "Number of results to skip",
            default: 0,
          },
        ],
        response: {
          status: 200,
          schema: {
            campaigns: "array",
            total: "integer",
          },
        },
      };
    }),

  /**
   * Get code examples
   */
  getCodeExamples: publicProcedure
    .input(z.object({ endpointId: z.string(), language: z.string() }))
    .query(async ({ input }) => {
      const examples: Record<string, Record<string, string>> = {
        ep_1: {
          javascript: `const campaigns = await trpc.emailCampaignDashboard.getCampaigns.useQuery({
  limit: 50,
  offset: 0
});`,
          python: `campaigns = client.email_campaign_dashboard.get_campaigns(
    limit=50,
    offset=0
)`,
          curl: `curl -X GET https://api.finmap.com/api/trpc/emailCampaignDashboard.getCampaigns \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
        },
      };

      return {
        endpointId: input.endpointId,
        language: input.language,
        code: examples[input.endpointId]?.[input.language] || "// Code example not available",
      };
    }),

  /**
   * Get authentication guide
   */
  getAuthenticationGuide: publicProcedure.query(async () => {
    return {
      title: "API Authentication",
      description: "How to authenticate requests to the API",
      methods: [
        {
          name: "Bearer Token",
          description: "Use JWT bearer token in Authorization header",
          example: "Authorization: Bearer YOUR_JWT_TOKEN",
          recommended: true,
        },
        {
          name: "API Key",
          description: "Use API key for server-to-server communication",
          example: "X-API-Key: YOUR_API_KEY",
          recommended: false,
        },
      ],
      steps: [
        "Obtain your API credentials from the dashboard",
        "Include credentials in request headers",
        "Tokens expire after 24 hours",
        "Use refresh tokens to get new access tokens",
      ],
    };
  }),

  /**
   * Get rate limiting information
   */
  getRateLimitInfo: publicProcedure.query(async () => {
    return {
      title: "Rate Limiting",
      description: "API rate limits and quotas",
      limits: [
        {
          tier: "Free",
          requestsPerMinute: 100,
          requestsPerDay: 10000,
          concurrent: 5,
        },
        {
          tier: "Pro",
          requestsPerMinute: 1000,
          requestsPerDay: 100000,
          concurrent: 50,
        },
        {
          tier: "Enterprise",
          requestsPerMinute: 10000,
          requestsPerDay: 1000000,
          concurrent: 500,
        },
      ],
      headers: [
        "X-RateLimit-Limit: Total requests allowed",
        "X-RateLimit-Remaining: Requests remaining",
        "X-RateLimit-Reset: Unix timestamp of reset time",
      ],
    };
  }),

  /**
   * Get webhook documentation
   */
  getWebhookDocumentation: publicProcedure.query(async () => {
    return {
      title: "Webhooks",
      description: "Set up real-time event notifications",
      events: [
        {
          name: "campaign.created",
          description: "Triggered when a campaign is created",
          payload: {
            eventId: "evt_123",
            eventType: "campaign.created",
            resourceId: "camp_123",
            timestamp: "2026-03-30T23:00:00Z",
          },
        },
        {
          name: "campaign.completed",
          description: "Triggered when a campaign completes",
          payload: {
            eventId: "evt_124",
            eventType: "campaign.completed",
            resourceId: "camp_123",
            timestamp: "2026-03-30T23:00:00Z",
          },
        },
      ],
      security: {
        signatureHeader: "X-Webhook-Signature",
        algorithm: "sha256",
        format: "sha256=SIGNATURE",
      },
    };
  }),

  /**
   * Get error handling guide
   */
  getErrorHandlingGuide: publicProcedure.query(async () => {
    return {
      title: "Error Handling",
      description: "How to handle API errors",
      statusCodes: [
        {
          code: 200,
          name: "OK",
          description: "Request succeeded",
        },
        {
          code: 400,
          name: "Bad Request",
          description: "Invalid parameters or malformed request",
        },
        {
          code: 401,
          name: "Unauthorized",
          description: "Missing or invalid authentication",
        },
        {
          code: 403,
          name: "Forbidden",
          description: "Insufficient permissions",
        },
        {
          code: 404,
          name: "Not Found",
          description: "Resource not found",
        },
        {
          code: 429,
          name: "Too Many Requests",
          description: "Rate limit exceeded",
        },
        {
          code: 500,
          name: "Internal Server Error",
          description: "Server error occurred",
        },
      ],
      errorResponse: {
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid request parameters",
          details: {
            field: "email",
            reason: "Invalid email format",
          },
        },
      },
    };
  }),

  /**
   * Get SDK information
   */
  getSDKInfo: publicProcedure
    .input(z.object({ language: z.string() }))
    .query(async ({ input }) => {
      const sdks: Record<string, any> = {
        javascript: {
          name: "JavaScript SDK",
          package: "@finmap/sdk",
          installCommand: "npm install @finmap/sdk",
          repository: "https://github.com/finmap/sdk-js",
          documentation: "https://docs.finmap.com/js",
          version: "1.0.0",
        },
        python: {
          name: "Python SDK",
          package: "finmap-sdk",
          installCommand: "pip install finmap-sdk",
          repository: "https://github.com/finmap/sdk-python",
          documentation: "https://docs.finmap.com/python",
          version: "1.0.0",
        },
        go: {
          name: "Go SDK",
          package: "github.com/finmap/sdk",
          installCommand: "go get github.com/finmap/sdk",
          repository: "https://github.com/finmap/sdk-go",
          documentation: "https://docs.finmap.com/go",
          version: "1.0.0",
        },
      };

      return sdks[input.language] || sdks.javascript;
    }),

  /**
   * Test API endpoint (sandbox)
   */
  testEndpoint: protectedProcedure
    .input(
      z.object({
        method: z.enum(["GET", "POST", "PUT", "DELETE"]),
        path: z.string(),
        headers: z.record(z.string()).optional(),
        body: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Simulate API call
      const startTime = Date.now();

      // Mock response
      const response = {
        status: 200,
        statusText: "OK",
        headers: {
          "content-type": "application/json",
          "x-ratelimit-remaining": "99",
        },
        body: {
          data: { success: true },
        },
      };

      const endTime = Date.now();

      return {
        request: {
          method: input.method,
          path: input.path,
          headers: input.headers,
          body: input.body,
        },
        response,
        timing: endTime - startTime,
        timestamp: new Date(),
      };
    }),

  /**
   * Get API changelog
   */
  getChangelog: publicProcedure.query(async () => {
    return {
      entries: [
        {
          version: "1.5.0",
          date: "2026-03-30",
          changes: [
            "Added advanced analytics endpoints",
            "Improved webhook delivery reliability",
            "Added member segmentation API",
          ],
        },
        {
          version: "1.4.0",
          date: "2026-03-15",
          changes: [
            "Added SMS notification system",
            "Improved rate limiting",
            "Added mobile app support",
          ],
        },
      ],
    };
  }),

  /**
   * Get API status
   */
  getAPIStatus: publicProcedure.query(async () => {
    return {
      status: "operational",
      lastUpdated: new Date(),
      services: [
        {
          name: "API Gateway",
          status: "operational",
          uptime: 0.9999,
        },
        {
          name: "Email Service",
          status: "operational",
          uptime: 0.9998,
        },
        {
          name: "SMS Service",
          status: "operational",
          uptime: 0.9997,
        },
        {
          name: "Analytics",
          status: "operational",
          uptime: 0.9996,
        },
      ],
    };
  }),

  /**
   * Get best practices guide
   */
  getBestPractices: publicProcedure.query(async () => {
    return {
      title: "API Best Practices",
      practices: [
        {
          title: "Use Pagination",
          description: "Always use limit and offset for large datasets",
          example: "?limit=50&offset=0",
        },
        {
          title: "Handle Rate Limits",
          description: "Implement exponential backoff for retries",
          example: "Check X-RateLimit-Remaining header",
        },
        {
          title: "Validate Input",
          description: "Always validate and sanitize user input",
          example: "Check parameter types and formats",
        },
        {
          title: "Use Webhooks",
          description: "Use webhooks instead of polling for real-time updates",
          example: "Register webhook endpoint",
        },
        {
          title: "Cache Responses",
          description: "Cache responses when appropriate to reduce API calls",
          example: "Cache campaign data for 5 minutes",
        },
      ],
    };
  }),
});
