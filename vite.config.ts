import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React core
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react";
            }
            // Radix UI primitives
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // Icons
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            // Charts & visualization
            if (id.includes("chart.js") || id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            // Data fetching
            if (id.includes("@trpc") || id.includes("@tanstack")) {
              return "vendor-data";
            }
            // Date/validation utilities
            if (id.includes("date-fns") || id.includes("zod") || id.includes("superjson")) {
              return "vendor-utils";
            }
            // UI animation & interaction
            if (id.includes("framer-motion") || id.includes("cmdk") || id.includes("sonner")) {
              return "vendor-ui";
            }
            // Stripe
            if (id.includes("stripe") || id.includes("@stripe")) {
              return "vendor-stripe";
            }
            // AWS/S3
            if (id.includes("@aws-sdk") || id.includes("@smithy")) {
              return "vendor-aws";
            }
            // Markdown/editor
            if (id.includes("markdown") || id.includes("remark") || id.includes("rehype") || id.includes("unified") || id.includes("mdast") || id.includes("hast") || id.includes("streamdown")) {
              return "vendor-markdown";
            }
            // PDF generation
            if (id.includes("pdf") || id.includes("jspdf") || id.includes("html2canvas")) {
              return "vendor-pdf";
            }
            // Remaining vendor - let Rollup handle naturally
            return "vendor-other";
          }
          // App code splitting
          if (id.includes("/pages/games/")) {
            return "games";
          }
          if (id.includes("Simulator") && id.includes("/pages/")) {
            return "simulators";
          }
          if (id.includes("/pages/HR") || id.includes("/pages/Employee") || id.includes("/pages/Position") || id.includes("/pages/Career") || id.includes("/pages/Contractor") || id.includes("/pages/Performance")) {
            return "hr-pages";
          }
          // Split dashboard pages more granularly
          if (id.includes("/pages/") && id.includes("Grant")) {
            return "grant-pages";
          }
          if (id.includes("/pages/") && (id.includes("House") || id.includes("Trust") || id.includes("Board") || id.includes("Governance"))) {
            return "house-pages";
          }
          if (id.includes("/pages/") && (id.includes("Finance") || id.includes("Revenue") || id.includes("Banking") || id.includes("Tax"))) {
            return "finance-pages";
          }
          if (id.includes("/pages/") && (id.includes("International") || id.includes("Compliance") || id.includes("Contract"))) {
            return "operations-pages";
          }
          if (id.includes("Dashboard") && id.includes("/pages/")) {
            return "dashboard-pages";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
