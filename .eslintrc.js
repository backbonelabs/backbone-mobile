module.exports = {
  extends: [
    'airbnb',
  ],
  parser: 'babel-eslint',
  rules: {
    'react/jsx-filename-extension': [1, {'extensions': ['.js', 'jsx']}],
    'max-len': [2, { 'code': 100 }],
    'consistent-return': [0],
    'no-console': [1],
  },
};
