import type { Config } from 'tailwindcss';
const v = (n: string) => `var(--${n})`;
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        surface: v('surface'), raised: v('surface-raised'), sunken: v('surface-sunken'),
        line: v('line'), 'line-strong': v('line-strong'),
        ink: v('ink'), muted: v('ink-muted'),
        brand: v('maroon'), 'brand-hover': v('maroon-hover'), 'brand-soft': v('maroon-soft'), 'brand-ink': v('maroon-soft-ink'),
        'on-brand': v('on-maroon'), blush: v('blush'), peach: v('peach'), gold: v('gold'),
        success: v('success-ink'), 'success-soft': v('success-soft'),
        warning: v('warning-ink'), 'warning-soft': v('warning-soft'),
        info: v('info-ink'), 'info-soft': v('info-soft'),
        danger: v('danger-ink'), 'danger-soft': v('danger-soft'), 'danger-fill': v('danger-fill'),
        focus: v('focus-ring'),
      },
      borderRadius: { md: '16px', lg: '22px', xl: '28px' },
      fontFamily: { display: ['var(--font-display)'], sans: ['var(--font-sans)'] },
      boxShadow: { card: v('shadow-card') },
    },
  },
  plugins: [],
};
export default config;
