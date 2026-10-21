import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/CycleSideChick/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "public/favicon.svg",
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
        start_url: "/CycleSideChick/",
        scope: "/CycleSideChick/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
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
