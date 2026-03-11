/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 120,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  plugins: [require.resolve("prettier-plugin-organize-imports")],
};
