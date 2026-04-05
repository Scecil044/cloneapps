<template>
  <div>
    <v-row v-if="action.status == 'pending' && module != 'leads'">
      <v-col cols="12">
        <v-card class="no-border_shadow" color="card_bg" id="card">
          <div class="pa-8">
            <p class="span_subtext">Required Documents for UAE Clients</p>
            <div v-for="(item, index) in documentTypes" :key="index">
              <span class=" mr-2"> {{ index + 1 }} </span> <span>{{ item.name }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else-if="action.status == 'progress'">
      <v-col cols="12">
        <UploadDocuments :requiredDocuments="action.required_documents" :module="module" :identifier="identifier"
          :foreign_id="foreign_id" @successfull="successfull" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import UploadDocuments from '../UploadDocuments'
export default {
  components: {
    UploadDocuments
  },
  props: {
    action: Object,
    module: String,
    foreign_id: String,
    identifier: String,
  },
  data() {
    return {
      documentTypes: [],
    }
  },
  async mounted() {
    await this.getDocumentList()
  },
  methods: {
    successfull() {
      this.$emit('successfull')
    },
    async getDocumentList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true
      await this.$axios.$post(`/documenttypes/list`, { list: this.action.required_documents }, { headers: { Authorization: AuthStr } })
        .then(response => {
          this.documentTypes = response
          this.loading = false
        })
        .catch(e => console.log(e))
    }
  }
}
</script>
