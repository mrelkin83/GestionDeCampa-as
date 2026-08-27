module.exports = {
  root: true,
  extends: '@react-native-community',
  ignorePatterns: ['node_modules/', 'dist/', 'e2e/'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
};
