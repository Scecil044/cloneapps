<template>
  <v-row class="leads_wrapper">
    <!-- <SnackBar :data="snackbar_data" /> -->
    <CurrentlyOnboarding v-if="currentTab == 'all'" />
    <OnboardingPipeline v-if="currentTab == 'onboardingPipeline'" />

  </v-row>
</template>

<script>

import '@/assets/scss/_onboarding.scss'
// import Leads from '~/components/Leads/leads.vue'
import CurrentlyOnboarding from '~/components/Onboarding/currentlyOnboarding.vue'
import OnboardingPipeline from '~/components/Onboarding/onboardingPipeline.vue'

export default {
  layout: 'dashboard',
  components: {
    CurrentlyOnboarding,
    OnboardingPipeline,
  },
  data() {
    return {
      currentTab: 'all',
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
    }
  },
  methods: {
    changeTab(event) {
      this.currentTab = event
    },
  },
  computed: {
  },
  mounted() {
  },
  created() {
    this.$nuxt.$on('tabChanged', ($event) => {
      this.changeTab($event)
    })
  },
  beforeDestroy() {
    this.$nuxt.$off('tabChanged')
  },
}
</script>
