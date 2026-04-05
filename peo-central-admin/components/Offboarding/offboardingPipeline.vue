<template>
  <v-row class=" d-flex flex-nowrap pipeline_cards" v-if="!loading">
    <v-col cols="3" v-for="(item, index)  in offboardingPipeline" :key="index">
      <pipelineCard :leadsData="item" :index="index" module="offboardings"/>
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
      offboardingPipeline: [],
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
      await this.$axios.$get('/offboardings/pipeline', { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.offboardingPipeline = response
          this.loading = false
        })
    }
  }
}
</script>