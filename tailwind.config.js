/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      items: 'var(--color-items)',
      menu: 'var(--color-menu)',
      white: '#FFF',
      html: 'var(--color-html)',
    },
    spacing: {
      1: '8px',
      2: '12px',
      3: '16px',
      4: '24px',
      5: '32px',
      6: '48px',
      item: 'var(--size-item)',
    },
  },
  plugins: [],
};
