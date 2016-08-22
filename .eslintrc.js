module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  globals: {
    fetch: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'max-len': [2, { code: 100 }],
    'consistent-return': [0],
    'no-console': [1],
    'no-underscore-dangle': [0],
    'prefer-template': [0],
  },
};
