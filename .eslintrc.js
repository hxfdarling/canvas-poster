module.exports = {
  root: true,
  plugins: ['prettier'],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  extends: ['@webpack-contrib/eslint-config-webpack'],
  rules: {
    "no-param-reassign":0,
    "line-comment-position":0,
    "no-use-before-define":0,
    "import/prefer-default-export":0,
    'prettier/prettier': [
      'error',
      { singleQuote: true, trailingComma: 'es5', arrowParens: 'always' },
    ],
  },
};
