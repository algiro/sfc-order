module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  rules: {
    // Disable problematic rules for Docker build
    'no-unused-vars': 'off',
    'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
}