<template>
  <v-dialog fullscreen v-model="docEditor">
    <v-row>
      <v-container v-if="loading" class="ma-0 pa-0">
        <v-row style="min-height:100%;align-items:center;justify-content:center;">
          <v-col cols="auto">
            <v-img src="/animated/ring.svg" max-width="fit-content" height="200" contain class="mr-3"></v-img>
            <span>Please Wait... This may take a while</span>
          </v-col>
        </v-row>
      </v-container>
      <v-col cols="12" v-else>
        <v-card background="white">
          <client-only v-if="docEditor">
            <ModifyDocument v-if="docEditor" :documentName='selectedDocument.name' :content='selectedDocument.content'
              :hideDownload="true" :elements="{ 'text': [], table: [], image: [], }" @save='save' @close="close()" />
          </client-only>
        </v-card>
      </v-col>
    </v-row>
  </v-dialog>
</template>

<script>

export default {
  props: {
    action: Object,
    processIndex: Number,
    actionIndex: Number
  },
  components: {
    ModifyDocument: () => { if (process.client) { return import('@/components/configurations/word-editor/wordeditor.vue') } },
  },
  data() {
    return {
      docEditor: true,
      loading: true,
      selectedDocument: {}
    }
  },

  methods: {
    async getDocument() {
      this.loading = true
      let document_id = this.action.template_id
      let response = await this.$axios.get(`/documenttemplateclone/cloneid/${document_id}`)
      this.selectedDocument = response.data
      this.loading = false
    },
    async save(event) {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.selectedDocument.content = event.content
      this.selectedDocument.document_details = {
        processIndex: this.processIndex,
        actionIndex: this.actionIndex
      }
      _.unset(this.selectedDocument, '_id');
      _.unset(this.selectedDocument, 'id');

      await this.$axios.$post(`/documenttemplateclone/editdocument`, this.selectedDocument, { headers: { Authorization: AuthStr } })
        .then(response => {
          this.loading = false
          this.docEditor = false
          this.$emit('editSuccess', response)
        })
        .catch(e => console.log(e))
    },
    close() {
      this.docEditor = false
      this.$emit('close', {})
    }
  },

  mounted() {
    this.getDocument()
  }
}
</script>
