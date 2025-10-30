import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      warn: true
    })
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'text-primary': 'text-[#1989fa]',
    'text-secondary': 'text-[#646566]',
    'bg-primary': 'bg-[#1989fa]',
    'border-base': 'border-[#ebedf0]'
  },
  theme: {
    colors: {
      primary: '#1989fa',
      success: '#07c160',
      warning: '#ff976a',
      danger: '#ee0a24',
      text: {
        primary: '#323233',
        secondary: '#646566',
        disabled: '#c8c9cc'
      },
      border: {
        base: '#ebedf0',
        light: '#f7f8fa'
      },
      background: {
        base: '#f7f8fa',
        white: '#ffffff'
      }
    },
    breakpoints: {
      xs: '320px',
      sm: '375px',
      md: '414px',
      lg: '768px',
      xl: '1024px'
    }
  }
})
