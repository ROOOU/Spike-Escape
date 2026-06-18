import { defineConfig } from "vite";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/phaser")) {
            return "phaser";
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      phaser: "phaser/dist/phaser.esm.js"
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5623,
    strictPort: true
  },
  preview: {
    host: "127.0.0.1",
    port: 5623,
    strictPort: true
  },
  optimizeDeps: {
    exclude: ["phaser"]
  }
});
