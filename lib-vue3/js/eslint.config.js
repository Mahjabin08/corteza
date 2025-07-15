import sharedConfig from '../../eslint.config.shared.js'

export default [
  ...sharedConfig,

  // Project-specific overrides for lib-vue3/js
  {
    name: 'lib-vue3-js/project-specific',
    files: ['src/**/*.{js,mjs,jsx,ts,tsx}'],
    rules: {
      // Library-specific rules (from original config)
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': 'off', // Handled by TypeScript
    },
  },
]
