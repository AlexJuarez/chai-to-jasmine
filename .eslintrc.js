module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  parser: 'babel-eslint',
  rules: {
    'comma-dangle': ['error', 'never'],
    'no-plusplus': 'off',
    'no-console': 'off',
    'no-param-reassign': 'off'
  },
  env: {
    node: true,
    jest: true,
  }
};
