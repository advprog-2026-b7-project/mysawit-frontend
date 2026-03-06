import type { ESLint } from "eslint";

const config: ESLint.ConfigData = {
  extends: "next/core-web-vitals",
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};

export default config;
