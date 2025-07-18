import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        components: {
          buttons: {
            primary: '#00BB7B',
            secondary: '#9178FF',
            error: '#EA4141',
          },
        },
        background: {
          main: '#01090D',
          primary: '#011118',
          secondary: '#E2E2E2',
          third: '#2A2A2A',
          box: '#122D38',
          action: '#363636',
          'action-input': '#EFEFEF',
          'rich-black': '#051820',
          dark: '#1F2030',
          gray: '#424242',
        },
        action: {
          modal: '#0E3647',
        },
        text: {
          primary: '#1C6E68',
          secondary: '#58ABE5',
          third: '#767E7A',
          fourth: '#3DA888',
          error: '#FF6B6B',
          alpha: 'rgba(255, 255, 255, 0.72)',
          gray: '#687A76',
          'primary-light': '#23D472',
          'red-dot': '#FF554F',
        },
        'old-silver': '#828282',
        border: {
          primary: '#00BB7B',
          secondary: '#656D67',
          green: '#A1FFB9',
          divider: '#202A2F',
          menu: '#3F4B52',
          focus: '#647969',
          leaderboard: '#AAFFAD',
          ranking: '#40B05D',
        },
      },
      boxShadow: {
        dialog: '0px 4px 16px 0px rgba(0, 0, 0, 0.25)',
      },
      maxWidth: {
        'full-hd': '1920px',
      },
    },
  },
  plugins: [],
} satisfies Config;
