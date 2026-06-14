import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Statstrive",
    short_name: "Statstrive",
    description: "AI exam intelligence and practice platform",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7ff",
    theme_color: "#0755b5",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/statstrive-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/statstrive-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}