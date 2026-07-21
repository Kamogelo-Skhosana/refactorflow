import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // RefactorFlow hydrates theme, session, and authentication state from
      // browser-only storage after mount. That is external state
      // synchronization, not React-derived state, so this rule is not useful
      // for these client boundaries. Keep all other React Hook rules enabled.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "coverage/**",
    "dist/**",
    "node_modules/**",
  ]),
]);
