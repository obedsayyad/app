// Vite configuration tuned for Cordova/WKWebView (file://) loading.
// Important: base: "./" ensures built asset URLs are relative, so WKWebView
// can load /www/index.html and resolve ./assets/... correctly.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],

  // Development server configuration
  server: {
    host: true, // Allow external connections
    port: 3000,
    strictPort: true, // Exit if port is already in use
    open: false, // Don't auto-open browser
    cors: true,
    // Proxy API calls to the native bridge (for development)
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Native bridge server
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration - Output directly to Cordova www directory
  build: {
    outDir: "../www",
    assetsDir: "assets",
    sourcemap: true,
    // Generate manifest for asset loading
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    // Optimize for Cordova/WebView environment
    target: "es2020",
    minify: "esbuild",
    // Ensure consistent chunk naming
    chunkSizeWarningLimit: 1000,
    // Empty the output directory before building
    emptyOutDir: false, // Don't clear www/ as it contains Cordova files
  },

  // Path resolution for cleaner imports
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@services": resolve(__dirname, "./src/services"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@types": resolve(__dirname, "./src/types"),
      "@constants": resolve(__dirname, "./src/constants"),
    },
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Add any SCSS/LESS options if needed later
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: [],
  },
});
