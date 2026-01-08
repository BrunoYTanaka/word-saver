/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mjs}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        foreground: 'var(--text-foreground)',
        muted: {
          DEFAULT: 'var(--bg-muted)',
          foreground: 'var(--text-muted-foreground)'
        },
        card: {
          DEFAULT: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
          foreground: 'var(--text-foreground)'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          disabled: 'var(--primary-disabled)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          hover: 'var(--destructive-hover)'
        },
        success: {
          DEFAULT: 'var(--success)',
          hover: 'var(--success-hover)'
        },
        ghost: {
          hover: 'var(--ghost-hover)'
        },
        outline: {
          hover: 'var(--outline-hover)'
        },
        border: 'var(--border)',
        ring: 'var(--ring)'
      }
    },

    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out'
    }
  },
  plugins: []
}
