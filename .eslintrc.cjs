module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'jsdoc'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsdoc/recommended-typescript',
    'prettier'
  ],
  env: { node: true, es2022: true, jest: true },
  rules: {
    'jsdoc/require-jsdoc': [
      'warn',
      {
        publicOnly: true,
        require: { FunctionDeclaration: true, MethodDefinition: true }
      }
    ]
  }
};

