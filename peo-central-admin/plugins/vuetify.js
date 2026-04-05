import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import '@mdi/font/css/materialdesignicons.css'
Vue.use(Vuetify)

export const Theme1 = {
  name:'Yellow',
  light:{
    // main colors
    primary: '#0A94FF',
    secondary: '#707070',
    accent1: '#895BF1',
    accent2: '#F3654A',
    accent3: '#FFB536',
    accent4: '#1AD598',
    accent5: '#5bc8eb',
    accent6: '#D1F7EA',
    navbar_bg : '#fff',
    dashboard_bg: '#F4F5F6',
    table_bg: '#F9FAFC',
    card_bg: '#fff',
    text: '#000027',
    text_light: '#fff',
    subtext: '#8D98A9',
    hint: '#B3BCCB',
    outline: '#E2E7F1',
    outline_dark: '#CED6E3',
    search_bar: '#F9FAFC',
    white: '#fff',
    black: '#000',
    searchbar:'#f9fafc',

    // light colors
    light_primary: '#CEEAFF',
    light_accent1: '#E7DEFC',
    light_accent2: '#FDE0DB',
    light_accent3: '#FFF0D6',
    light_accent4: '#D1F7EA',
  },
  dark:{
    // main colors
    primary: '#0A94FF',
    secondary: '#707070',
    accent1: '#895BF1',
    accent2: '#F3654A',
    accent3: '#FFB536',
    accent4: '#1AD598',
    accent5: '#5bc8eb',
    accent6: '#D1F7EA',
    navbar_bg : '#121212.',
    dashboard_bg: '#121212',
    table_bg: '#121212',
    card_bg: '#121212',
    text: '#fff',
    text_light: '#fff',
    subtext: '#8D98A9',
    hint: '#B3BCCB',
    outline: '#E2E7F1',
    outline_dark: '#CED6E3',
    white: '#000',
    black: '#fff',

    // light colors
    light_primary: '#CEEAFF',
    light_accent1: '#E7DEFC',
    light_accent2: '#FDE0DB',
    light_accent3: '#FFF0D6',
    light_accent4: '#D1F7EA',
  }
}

export default new Vuetify({
  breakpoint:{
    scrollBarWidth:5,
  },
  icons:{
    iconfont:'fa'
  },
  theme: { 
    themes:{
      light:Theme1.light,
      dark:Theme1.dark
    }
  },
})