/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /* ---------------------------------------------------------------- */
      /*  Colors                                                           */
      /* ---------------------------------------------------------------- */
      colors: {
        bg:       '#10110F',
        bg2:      '#171815',
        panel:    '#1D1E1A',
        elevated: '#25251F',
        ink:      '#E8E3D7',
        ink2:     '#AAA496',
        muted:    '#77746B',
        gold:     '#B79A65',
        goldSoft: '#D2C3A0',
        crimson:  '#873F3B',
        forest:   '#536B52',

        /* Semantic tokens used by combat + factions */
        hp:       '#873F3B',
        mana:     '#6C8CC2',
        shadow:   '#A97AC4',

        /* Material color uses these as accents */
        whisper:  '#B79A65',
      },

      /* ---------------------------------------------------------------- */
      /*  Fonts                                                            */
      /* ---------------------------------------------------------------- */
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['"Inter"', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      /* ---------------------------------------------------------------- */
      /*  Borders                                                          */
      /* ---------------------------------------------------------------- */
      borderColor: {
        DEFAULT: 'rgba(210,195,160,0.12)',
        gold:    'rgba(183,154,101,0.35)',
        goldSoft:'rgba(210,195,160,0.25)',
      },

      /* ---------------------------------------------------------------- */
      /*  Shadows                                                          */
      /* ---------------------------------------------------------------- */
      boxShadow: {
        inset: 'inset 0 1px 0 rgba(255,255,255,0.03)',
        panel: '0 10px 40px rgba(0,0,0,0.5)',
        gold:  '0 0 20px -8px rgba(183,154,101,0.6)',
        glow:  '0 0 30px rgba(183,154,101,0.15)',
      },

      /* ---------------------------------------------------------------- */
      /*  Animations                                                       */
      /* ---------------------------------------------------------------- */
      keyframes: {
        'fade-in':    { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in':    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-soft': { '0%, 100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
        'pulse-glow': { '0%,100%': { boxShadow: '0 0 10px rgba(183,154,101,0.3)' }, '50%': { boxShadow: '0 0 30px rgba(183,154,101,0.7)' } },
        shimmer:      { '0%': { backgroundPosition: '-300% 0' }, '100%': { backgroundPosition: '300% 0' } },
        shake:        { '0%,100%': { transform: 'translateX(0)' }, '10%,50%,90%': { transform: 'translateX(-6px)' }, '30%,70%': { transform: 'translateX(6px)' } },
        flash:        { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.1' } },
        'combat-enter': { '0%': { opacity: '0', transform: 'scale(0.8) translateY(30px)' }, '100%': { opacity: '1', transform: 'scale(1) translateY(0)' } },
        'stagger-in': { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'beacon-pulse': { '0%,100%': { transform: 'scale(1)', opacity: '0.8' }, '50%': { transform: 'scale(1.4)', opacity: '1' } },
        'float-up':   { from: { opacity: '1', transform: 'translate(0,0)' }, to: { opacity: '0', transform: 'translateY(-60px)' } },
        'spin-slow':  { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-in':      'fade-in 0.4s ease-out',
        'rise-in':      'rise-in 0.35s ease-out',
        'pulse-soft':   'pulse-soft 2.5s ease-in-out infinite',
        'pulse-glow':   'pulse-glow 2s ease-in-out infinite',
        'shimmer':      'shimmer 3s linear infinite',
        'shake':        'shake 0.4s ease-in-out',
        'flash':        'flash 0.3s ease-in-out',
        'combat':       'combat-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'stagger':      'stagger-in 0.4s ease-out both',
        'beacon':       'beacon-pulse 1.8s ease-in-out infinite',
        'float-up':     'float-up 2s ease-out forwards',
        'spin-slow':    'spin-slow 8s linear infinite',
      },

      /* ---------------------------------------------------------------- */
      /*  Z-index scale                                                    */
      /* ---------------------------------------------------------------- */
      zIndex: {
        45: '45',
        55: '55',
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },

      /* ---------------------------------------------------------------- */
      /*  Screens (used by responsive rules)                              */
      /* ---------------------------------------------------------------- */
      screens: {
        xs: '400px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },

      /* ---------------------------------------------------------------- */
      /*  Spacing (small additions)                                       */
      /* ---------------------------------------------------------------- */
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },

      /* ---------------------------------------------------------------- */
      /*  Border radius                                                    */
      /* ---------------------------------------------------------------- */
      borderRadius: {
        // The game uses a restrained sharp aesthetic.
        // Adding `sm` variants to match.
        DEFAULT: '2px',
        sm:      '2px',
        md:      '3px',
        lg:      '4px',
      },
    },
  },

  /* -------------------------------------------------------------------- */
  /*  Safelist — dynamic class names generated at runtime                 */
  /*  (rarity colors, difficulty colors)                                  */
  /* -------------------------------------------------------------------- */
  safelist: [
    // Rarity text colors
    'text-ink2', 'text-forest', 'text-[#6c8cc2]', 'text-[#a97ac4]', 'text-gold', 'text-crimson', 'text-goldSoft',
    // Rarity border colors
    'border-[#4a4a42]', 'border-[#536B52]', 'border-[#6c8cc2]', 'border-[#a97ac4]', 'border-[#B79A65]', 'border-[#873F3B]',
    // Difficulty
    'text-[#B7793A]',
    // Effects
    'bg-forest', 'bg-crimson', 'bg-gold',
    // New animations
    'animate-shake', 'animate-flash', 'animate-beacon', 'animate-spin-slow',
    'animate-pulse-soft', 'animate-pulse-glow', 'animate-combat', 'animate-stagger',
    'animate-float-up', 'animate-shimmer', 'animate-rise-in', 'animate-fade-in',
    // Delay utilities
    'delay-100', 'delay-200', 'delay-300', 'delay-400', 'delay-500', 'delay-600', 'delay-700', 'delay-800',
    // Glow utilities  
    'glow-gold', 'glow-red', 'glow-blue', 'glow-purple', 'glow-green',
    'text-glow-gold', 'text-glow-crimson', 'text-glow-blue',
    // Glass utilities
    'glass-panel', 'glass-dark',
    // Typography
    'h-cinzel', 'h-cinzel-deco', 'h-serif',
    // Combat
    'combat-hit-flash', 'monster-idle', 'monster-container',
    // Map
    'map-node-current', 'map-node-discovered',
    // Portrait
    'portrait-frame',
    // Bars
    'bar-track', 'bar-fill-hp', 'bar-fill-mana', 'bar-fill-xp',
    // Buttons
    'btn-epic', 'ability-card', 'choice-btn', 'rune-border',
    // Shimmer text
    'shimmer-text',
    // Nav
    'nav-tab',
    // Grid overrides for map
    'scale-98',
  ],

  plugins: [
    /* -------------------------------------------------------------- */
    /*  Custom scrollbar plugin (thin variant)                         */
    /* -------------------------------------------------------------- */
    function ({ addUtilities, theme }) {
      addUtilities({
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme('colors.gold')}33 ${theme('colors.bg2')}`,
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: theme('colors.bg2'),
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: `${theme('colors.gold')}33`,
          borderRadius: '3px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: `${theme('colors.gold')}55`,
        },
        '.scrollbar-none': {
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
        },
        '.scrollbar-none::-webkit-scrollbar': {
          display: 'none',
        },
      });
    },
  ],
};