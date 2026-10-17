// Konfigurasi ESLint flat config untuk ESLint 9.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    // Berkas yang tidak perlu dilint.
    ignores: ["**/dist/**", "**/node_modules/**", "web/build/**", "coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      // Tambahkan aturan khusus tim di sini bila perlu.
    },
  },
];
