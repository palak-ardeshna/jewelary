/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a fully static site in /out for upload to Hostinger shared hosting.
  output: "export",
  // No Next image optimizer on static hosting — serve images as-is.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Emit /path/index.html so Apache/LiteSpeed serves clean URLs without rewrites.
  trailingSlash: true,
};

export default nextConfig;
