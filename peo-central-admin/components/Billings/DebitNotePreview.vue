<template>
  <div>
    <v-row>
      <v-col cols="12" v-if="loading">
        <div style="justify-content: center;align-items: center;display: flex;">
          <v-img src="/animated/refresh.svg" max-width="fit-content" height="40" contain class="mr-3"></v-img>
        </div>
      </v-col>
      <v-col cols="12" v-else>
        <!-- Preview Document -->
        <PreviewDocument :content='replacedContent' height='75vh' width='100%' />
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  components: {
    PreviewDocument: () => { if (process.client) { return import('@/components/configurations/word-editor/wordsimplepreview.vue') } }
  },
  props: ['debit_id'],
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
    console.log("Mounted replacedContent:")
  },
  methods: {
    async getDocumentContent() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        // Fetch both preview content and debit note data
        const [previewResponse, debitNoteResponse] = await Promise.all([
          this.$axios.$get(`/debit/notes/preview/${this.debit_id}`, { headers: { Authorization: AuthStr } }),
          this.$axios.$get(`/debit/notes/${this.debit_id}`, { headers: { Authorization: AuthStr } })
        ])

        console.log("Preview response:", previewResponse)
        console.log("Debit note data:", debitNoteResponse)

        this.replacedContent = previewResponse
        this.debitNoteData = debitNoteResponse

        setTimeout(() => {
          this.loading = false
        }, 100);
      } catch (error){
        console.error('Error fetching debit note data:', error)
        throw new Error(error)
      }
    },

  },
  watch: {
    debit_id: {
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
