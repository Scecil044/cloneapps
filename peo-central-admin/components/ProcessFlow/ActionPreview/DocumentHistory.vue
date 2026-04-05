<template>
  <v-navigation-drawer v-model="docHistory" temporary right app width="800">
    <v-container v-if="loading" class="ma-0 pa-0">
      <v-row>
        <v-col cols="12" v-if="loading">
          <div style="justify-content: center;align-items: center;display: flex;">
            <v-img src="/animated/refresh.svg" max-width="fit-content" height="40" contain class="mr-3"></v-img>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <div class="new vs_custom" v-else>
      <v-toolbar elevation="0" dark class="blue darken-2">
        <v-toolbar-title>Document History</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <div class="d-flex align-center">
            <v-btn icon rounded fab dark @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-toolbar-items>
      </v-toolbar>
    </div>
  </v-navigation-drawer>
</template>

<script>

export default {
  props: {
    action: Object,
    processIndex: Number,
    actionIndex: Number
  },
  data() {
    return {
      docHistory: true,
      loading: true,
      selectedDocument: {}
    }
  },

  methods: {
    async getDocumentHistory() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 1000);
    },
    close() {
      this.docHistory = false
      this.$emit('close', {})
    }
  },

  mounted() {
    this.getDocumentHistory()
  }
}
</script>
