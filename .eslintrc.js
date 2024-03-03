module.exports = {
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  extends: [
    "plugin:prettier/recommended",
  ],
  plugins: ["prettier", "only-warn"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
      },
      typescript: {},
    },
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/no-magic-numbers": "off",
    "no-plusplus": "off",
    "class-methods-use-this": "off",
    "max-classes-per-file": "off",
    camelcase: "off",
    "max-classes-per-file": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.js",
          "**/*.spec.js",
          "**/*.e2e-spec.js",
          "**/*.test.ts",
          "**/*.spec.ts",
          "**/*.e2e-spec.ts",
        ],
      },
    ],
  },
  ignorePatterns: [".eslintrc.js"],
};
