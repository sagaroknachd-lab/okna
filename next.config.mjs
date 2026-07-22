/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: emits a fully client-side site into `out/`, which Capacitor
  // packages into the Android APK. No Node server runs on the device — all data
  // lives client-side (localStorage), honouring the local-only privacy guardrail.
  output: "export",
  // next/image optimisation needs a server; disable it for the static/APK build.
  images: { unoptimized: true },
  // Emit /app/index.html style paths so the WebView resolves routes from file://.
  trailingSlash: true,
};

export default nextConfig;
