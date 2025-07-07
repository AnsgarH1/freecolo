import antfu from '@antfu/eslint-config'
import sonarjs from 'eslint-plugin-sonarjs'

export default antfu({
  react: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },

  rules: {
    'ts/no-redeclare': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],
    'no-console': ['warn'],
    'node/no-process-env': ['error'],
    'perfectionist/sort-imports': ['error', {
      tsconfigRootDir: '.',
    }],
    'unicorn/filename-case': ['error', {
      case: 'kebabCase',
      ignore: ['README.md'],
    }],
  },

}, {
  ...sonarjs.configs.recommended,
})
