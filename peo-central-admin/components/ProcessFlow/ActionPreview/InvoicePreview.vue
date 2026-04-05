<template>
  <div>
    <v-row>
      <v-col cols="12" v-if="loading">
         <div style="height: 820px;">
            <div class="h-full tw-flex tw-justify-center tw-flex-col tw-items-center tw-gap-5">
              <v-img src="/animated/refresh.svg" max-width="fit-content" height="80" contain class="mr-3"></v-img>
              <div class="tw-gray-800">Loading Preview</div>
            </div>
         </div>
      </v-col>
      <v-col cols="12" v-else>
        <PreviewDocument :content='replacedContent' height='820px' width='620px' />
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  components: {
    PreviewDocument: () => { if (process.client) { return import('@/components/configurations/word-editor/wordsimplepreview.vue') } }
  },
  props: ['invoice_id', 'userId'],
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
  // async mounted() {
  //   await this.getDocumentContent()
  // },
  methods: {
    async getDocumentContent() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
         await this.$axios.$post(`/invoice/getpreview`, { "invoice_id": this.invoice_id, userId: this.userId }, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.replacedContent = response
          setTimeout(() => {
            this.loading = false
          }, 100);
        })
      } catch (error){
        throw new Error(error)
      }
    }
  },
  watch: {
  invoice_id: {
    immediate: true,
    handler: async function(newVal, oldVal) {
      if (newVal !== oldVal) {
        await this.getDocumentContent();
      }
    }
  }
},
}
</script>
