import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import sharedConfig from '../../eslint.config.shared.js'

export default [
  ...sharedConfig,

  // Project-specific overrides for lib-vue3/vue
  {
    name: 'lib-vue3-vue/project-specific',
    files: ['src/**/*.{js,mjs,jsx,ts,tsx,vue}'],
    rules: {
      // Lib-specific rules (stricter for library code)
      'no-unused-vars': 'error', // More strict for library code
      'no-console': 'warn', // Libraries shouldn't have console logs
    },
  },

  skipFormatting,
]
