module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  globals: {
    fetch: true,
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js'] }],
    'consistent-return': [0],
    'no-console': [1],
    'no-underscore-dangle': [0],
    'prefer-template': [1],
    'max-len': [2, {"code": 100}],

    // New rules added by latest eslint-config-airbnb

    // Functions that don't use `this` have to be static
    'class-methods-use-this': [1],

    // Not sure how to use with "vague" props like style
    'react/forbid-prop-types': [1],

    // Causes issues with prop destructuring assignment
    'react/no-unused-prop-types': [1],
  },
};
