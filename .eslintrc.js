module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["airbnb-base", "eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["import", "simple-import-sort"],
  ignorePatterns: ["/dist", "/node_modules", " .eslintrc.js"],
  // settings: {
  //   "import/parsers": {
  //     "@typescript-eslint/parser": [".ts", ".tsx"],
  //   },
  //   "import/resolver": {
  //     typescript: {
  //       alwaysTryTypes: true,
  //       project: ["packages/*/tsconfig.json", "tsconfig.json"],
  //     },
  //   },
  // },
  rules: {
    // Prettier issues are shown as warnings
    "prettier/prettier": "warn",

    // Add import sorting
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          // Side effect imports.
          ["^\\u0000"],
          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` | `.` followed by a letter (excluding src/)
          ["^(@|.)?(?!src)\\w"],
          // Absolute imports and other imports such as Vue-style `@/foo`.
          // Anything not matched in another group.
          ["^"],
          // Relative imports.
          // Anything that starts with a dot.
          ["^\\."],
        ],
      },
    ],
    "simple-import-sort/exports": "warn",
    "import/order": "off",

    // Too restrictive, writing ugly code to defend against a very unlikely scenario: https://eslint.org/docs/rules/no-prototype-builtins
    "no-prototype-builtins": "off",

    // https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
    "import/prefer-default-export": "off",
    "import/no-default-export": "error",

    // Makes no sense to allow type inferrence for expression parameters, but require typing the response
    // "@typescript-eslint/explicit-function-return-type": [
    //   "error",
    //   { allowExpressions: true, allowTypedFunctionExpressions: true },
    // ],

    // Disable built-in no use before define: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md#how-to-use
    "no-use-before-define": "off",

    // Use function hoisting to improve code readability
    // "@typescript-eslint/no-use-before-define": [
    //   "error",
    //   { functions: false, classes: true, variables: true, typedefs: true },
    // ],
  },
};
