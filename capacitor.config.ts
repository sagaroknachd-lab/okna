import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor packages the static export in `out/` into a native Android WebView
// shell. Everything runs on-device and offline — no server, no network calls,
// data stays in localStorage — matching okna's local-only privacy guardrail.
const config: CapacitorConfig = {
  appId: "com.okna.app",
  appName: "okna",
  webDir: "out",
  android: {
    // Allow the WebView to load the bundled static assets from the app package.
    allowMixedContent: false,
  },
};

export default config;
