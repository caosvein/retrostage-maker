import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "docs/**",
      "apps/editor-electron/.vite/**",
      "apps/editor-electron/out/**",
    ],
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: [
      "tooling/**/*.ts",
      "packages/renderer-babylon9/**/*.ts",
      "apps/editor-electron/src/**/*.ts",
    ],
  })),
  {
    files: [
      "tooling/**/*.ts",
      "packages/renderer-babylon9/**/*.ts",
      "apps/editor-electron/src/**/*.ts",
    ],
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./packages/renderer-babylon9/tsconfig.json",
          "./apps/editor-electron/tsconfig.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["tooling/**/*.mjs", "*.config.mjs", "apps/editor-electron/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      eqeqeq: "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
