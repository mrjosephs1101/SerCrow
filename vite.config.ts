import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { PluginOption } from "vite";

// Async function to gather plugins safely
const getPlugins = async (): Promise<PluginOption[]> => {
  const plugins: PluginOption[] = [react()];

  const isReplit = process.env.REPL_ID !== undefined;

  if (isReplit) {
    const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
    const cartographer = await import("@replit/vite-plugin-cartographer");

    plugins.push(runtimeErrorOverlay.default());
    plugins.push(cartographer.cartographer());
  }

  return plugins;
};

// Export full config with async plugins
export default defineConfig(async () => ({
  plugins: await getPlugins(),
  base: "/",

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  root: path.resolve(import.meta.dirname, "client"),

  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    assetsDir: 'assets',
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: false, // Disables Vite’s default error overlay
    },
  },
}));
