import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "manifest.webmanifest"
      ],
      manifest: {
        name: "CycleSideChick — Cycle & Wellness Companion",
        short_name: "CycleSideChick",
        description: "100% on-device, privacy-first reproductive health and cycle tracking companion.",
        theme_color: "#FAF5F7",
        background_color: "#FAF5F7",
        display: "standalone",
        orientation: "portrait",
        start_url: "./index.html",
        scope: "./",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"]
      }
    })
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext"
  }
});
