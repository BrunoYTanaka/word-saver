/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mjs}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Core Colors */
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        /* Surfaces */
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          hover: 'var(--surface-hover)'
        },

        muted: {
          DEFAULT: 'var(--surface-muted)',
          foreground: 'var(--foreground-muted)'
        },

        /* Interactive Colors */
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
          soft: 'var(--primary-soft)'
        },

        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
          foreground: 'var(--secondary-foreground)',
          soft: 'var(--secondary-soft)'
        },

        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          foreground: 'var(--accent-foreground)',
          soft: 'var(--accent-soft)'
        },

        /* Status Colors */
        destructive: {
          DEFAULT: 'var(--destructive)',
          hover: 'var(--destructive-hover)',
          foreground: 'var(--destructive-foreground)',
          soft: 'var(--destructive-soft)'
        },

        success: {
          DEFAULT: 'var(--success)',
          hover: 'var(--success-hover)',
          foreground: 'var(--success-foreground)',
          soft: 'var(--success-soft)'
        },

        warning: {
          DEFAULT: 'var(--warning)',
          hover: 'var(--warning-hover)',
          foreground: 'var(--warning-foreground)',
          soft: 'var(--warning-soft)'
        },

        /* Interactive States */
        ghost: {
          hover: 'var(--ghost-hover)'
        },

        outline: {
          hover: 'var(--outline-hover)'
        },

        /* Interface Elements */
        border: {
          DEFAULT: 'var(--border)',
          focus: 'var(--border-focus)',
          error: 'var(--border-error)'
        },

        ring: 'var(--border-focus)'
      }
    },

    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out'
    }
  },
  plugins: []
}
