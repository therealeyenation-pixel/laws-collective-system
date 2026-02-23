import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// Auto-redirect authenticated users to dashboard to prevent login loops
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "success") {
    const query = event.query;
    // Check if this is the auth.me query and user is authenticated
    if (query.queryKey[0] === "auth" && query.queryKey[1] === "me" && query.state.data) {
      // User is authenticated, redirect to dashboard if on home page
      if (typeof window !== "undefined" && window.location.pathname === "/") {
        window.location.href = "/dashboard";
      }
    }
  }
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    // Just log errors, don't redirect
    if (error instanceof TRPCClientError) {
      console.log("[API Query]", error.message);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    // Just log errors, don't redirect
    if (error instanceof TRPCClientError) {
      console.log("[API Mutation]", error.message);
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
