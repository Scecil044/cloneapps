<template>
  <div>
    <v-row>
      <v-col cols="12" v-if="loading">
        <div style="justify-content: center;align-items: center;display: flex;">
          <v-img src="/animated/refresh.svg" max-width="fit-content" height="40" contain class="mr-3"></v-img>
        </div>
      </v-col>
      <v-col cols="12" v-else>
        <PreviewDocument :content='replacedContent' height='620px' />
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  components: {
    PreviewDocument: () => { if (process.client) { return import('@/components/configurations/word-editor/wordsimplepreview.vue') } }
  },
  props: ['action'],
  data() {
    return {
      loading: true,
      replacedContent: {
        "sections": [
          {
            "blocks": [
              {
                "inlines": [
                  {
                    "characterFormat": {
                      "bold": true,
                      "italic": true
                    },
                    "text": ""
                  }
                ]
              }
            ],
            "headersFooters": {
            }
          }
        ]
      }
    }

  },
  async mounted() {
    await this.getDocumentContent()
  },
  methods: {
    async getDocumentContent() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(`/documenttemplateclone/get/replacedcontent/${this.action.template_id}`, {}, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.replacedContent = response
          setTimeout(() => {
            this.loading = false
          }, 100);
        })
    }
  }
}
</script>
