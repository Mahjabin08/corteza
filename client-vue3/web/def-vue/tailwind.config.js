/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    '../../../lib-vue3/vue/src/**/*.{vue,js,ts}',
  ],
  plugins: [PrimeUI]
};
