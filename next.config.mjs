/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dynamic backend: the app now runs on a Node server (Prisma/SQLite), reading
  // live catalog data from the database. (Previously output: "export" static.)
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Keep the Prisma engine out of the server bundle tracing noise.
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Allow loading the dev server over the LAN IP without the cross-origin warning.
  allowedDevOrigins: ["192.168.1.21"],
};

export default nextConfig;
