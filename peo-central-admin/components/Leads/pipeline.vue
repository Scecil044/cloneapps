<template>
  <v-row class=" d-flex flex-nowrap pipeline_cards" v-if="!loading">
    <v-col cols="3" v-for="(item, index)  in leadPipeline" :key="index">
      <pipelineCard :leadsData="item" :index="index" module="leads"/>
    </v-col>
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_leadsPipeline.scss'
import pipelineCard from '~/components/Cards/PipelineCard/index.vue'

export default {
  components: { pipelineCard },
  data() {
    return {
      loading: false,
      leadPipeline: [],
    }
  },
  mounted() {
    this.getPipelineCount()
  },
  methods: {
    async getPipelineCount() {
      this.loading = true
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get('/leads/pipeline', { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.leadPipeline = response
          this.loading = false
        })
    }
  }
}
</script>