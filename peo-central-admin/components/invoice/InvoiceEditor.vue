<template>
  <div>
    <v-row>
      <v-col cols="12" v-if="loading">
        <div style="justify-content: center;align-items: center;display: flex;">
          <v-img src="/animated/refresh.svg" max-width="fit-content" height="40" contain class="mr-3"></v-img>
        </div>
      </v-col>
      <v-col cols="12" v-else>
        <EditDocument :content='replacedContent' height='620px' width='620px' @close="handleClose" :activities="activityIDs"  />
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  components: {
    EditDocument: () => { if (process.client) { return import('@/components/invoice/wordsimpleeditor.vue') } }
  },
  props: ['invoice_id'],
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
      },
      activityIDs: [],
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
        await this.$axios.$post(`/invoice/getpreview`, { "invoice_id": this.invoice_id }, { headers: { Authorization: AuthStr } })
          .then(async (response) => {
            console.log("What do i get now", response.ids)
            this.replacedContent = response.data
            this.activityIDs = response.ids
            setTimeout(() => {
              this.loading = false
            }, 100);
          })
      } catch (error){
        throw new Error(error)
      }
    },
    handleClose() {
      this.$router.go(0)
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
