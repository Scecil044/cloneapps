<template>
  <div>
    <v-container>
      <!-- *** LAYOUT (1) *** -->
      <!-- <v-row>
        <v-col cols="6">
          <v-btn color="primary">Primary</v-btn>
          <v-btn color="green">Secondary</v-btn>
          <v-btn color="btn_green">Accent</v-btn>
          <v-switch v-model="$vuetify.theme.dark" hint="This toggles the global state of the Vuetify theme" inset
            label="Vuetify Theme Dark" persistent-hint></v-switch>
          <ul>
            <li v-for="(theme,index) in themes" :key="index">
              <v-btn @click="setTheme(theme)">{{theme.name}}</v-btn>
            </li>
          </ul>
        </v-col>
        <v-col cols="6">section 2</v-col>
      </v-row> -->
      <!-- *** LAYOUT (2) *** -->
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          nudge-width="200"
          offset-y
          class="ThemeSwitcher"
        >
        <template v-slot:activator="{ on }">
          <v-btn large icon dark v-on="on"><v-icon size="30" color="text">fa-palette</v-icon></v-btn>
        </template>
        <v-card class="">
          <div class="py-2 mx-auto d-flex flex-row align-center justify-space-around">
            <v-switch v-model="$vuetify.theme.dark" inset label="Dark" persistent-hint></v-switch>
          </div>
          <v-divider />
          <v-card class="d-block text-center" v-for="(theme,index) in themes" :key="index">
            <v-btn text block min-width="100%" rounded="0" class="rounded-0 py-9"  @click="setTheme(theme)">{{theme.name}}</v-btn>         
            <v-divider />
          </v-card>
        </v-card>
      </v-menu>
    </v-container>
  </div>
</template>

<script>
import { Theme1 } from '@/plugins/vuetify'

export default {
  setup() {

  },
  data() {
    return {
      menu: '',
      themes: [
        Theme1
      ]
    }
  },
  methods: {
    setTheme(theme) {
      // close menu
      this.menu = false;
      const name = theme.name;
      const dark = theme.dark;
      const light = theme.light;
      // set themes
      Object.keys(dark).forEach(i => {
        this.$vuetify.theme.themes.dark[i] = dark[i];
      });
      Object.keys(light).forEach(i => {
        this.$vuetify.theme.themes.light[i] = light[i];
      });
      // also save theme name to disable selection
      this.$vuetify.theme.themes.name = name;
    }
  },
}
</script>

<style>
.ThemeSwitcher {
  z-index: 5000;
}
</style>