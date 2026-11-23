import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.movio.app",
  appName: "Movio",
  webDir: "dist",
  server: {
    url: "https://movio-five.vercel.app/",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
