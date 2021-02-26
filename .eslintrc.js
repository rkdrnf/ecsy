module.exports = {
  parser: "babel-eslint",
  env: {
    es2020: true,
    browser: true,
    es6: true,
    node: true,
    mocha: true
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-console": "off"
  },
  extends: ["prettier", "eslint:recommended"]
};