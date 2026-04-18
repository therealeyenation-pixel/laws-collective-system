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
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React core - needed on every page
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react";
            }
            // Radix UI primitives
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // Data fetching - needed on every page
            if (id.includes("@trpc") || id.includes("@tanstack")) {
              return "vendor-data";
            }
            // Date/validation utilities
            if (id.includes("date-fns") || id.includes("zod") || id.includes("superjson")) {
              return "vendor-utils";
            }
            // ISOLATE heavy libs so they only load on-demand
            if (id.includes("shiki") || id.includes("oniguruma")) {
              return "vendor-shiki";
            }
            if (id.includes("mermaid") || id.includes("dagre") || id.includes("cytoscape") || id.includes("elkjs")) {
              return "vendor-diagrams";
            }
            if (id.includes("hls.js")) {
              return "vendor-media";
            }
            if (id.includes("katex")) {
              return "vendor-katex";
            }
            // Let Rollup decide for everything else - no catch-all
            return undefined;
          }
          // App code splitting - only group large feature areas
          if (id.includes("/pages/games/")) {
            return "games";
          }
          if (id.includes("Simulator") && id.includes("/pages/")) {
            return "simulators";
          }
          if (id.includes("/pages/HR") || id.includes("/pages/Employee") || id.includes("/pages/Position") || id.includes("/pages/Career") || id.includes("/pages/Contractor") || id.includes("/pages/Performance")) {
            return "hr-pages";
          }
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
          // NO dashboard-pages catch-all - let Rollup split naturally
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
