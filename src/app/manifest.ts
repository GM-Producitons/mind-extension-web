import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MindExtension",
    short_name: "MindExt",
    description: "Your personal mind dashboard and productivity system.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f1419",
    theme_color: "#8b5cf6",
    orientation: "portrait",
    display_override: ["standalone", "window-controls-overlay"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
