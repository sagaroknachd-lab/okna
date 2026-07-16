/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export a fully static site so it can be packaged inside a native
  // (Capacitor) Android shell — the whole app is client-side already.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
