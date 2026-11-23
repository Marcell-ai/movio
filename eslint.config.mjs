import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescriptConfig from "eslint-config-next/typescript";

const config = [
  ...nextConfig,
  ...nextTypescriptConfig,
  {
    ignores: ["android/**/build/**", "android/.gradle/**", "artifacts/**"],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default config;
