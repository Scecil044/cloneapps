<template>
  <div class="leads_wrapper">
    <!-- Show only the current process title at the top -->
    <!-- <div class="text-xl font-semibold mb-4 px-2 py-2 border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
      {{ currentTabTitle }}
    </div> -->
    <VisaProcessWrapper :module="visaModule" />
    <!--
    <OnboardingVisaProcess v-if="currentTab === 'new'" />
    <VisaRenewalProcess v-if="currentTab === 'renewal'" />
    <VisaCancellationProcess v-if="currentTab === 'cancellation'" />
    -->
    <Pipeline v-if="currentTab === 'pipeline'" />
  </div>
</template>

<script>
import '@/assets/scss/_visa.scss'
import OnboardingVisaProcess from '~/components/Visa/OnboardingVisaProcess.vue'
import VisaRenewalProcess from '~/components/Visa/VisaRenewalProcess.vue'
import VisaCancellationProcess from '~/components/Visa/visaCancellationProcess.vue'
import Pipeline from '~/components/Visa/VisaProcessPipeline.vue'
// import HeaderTabs from '@/components/Layout/HeaderTabs/index.vue' // Uncomment if needed

export default {
  layout: 'dashboard',
  components: {
    OnboardingVisaProcess,
    Pipeline,
    VisaRenewalProcess,
    VisaCancellationProcess,
    // HeaderTabs, // Uncomment if needed
  },
  data() {
    return {
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      visaTabs: [
        { title: 'New Process', value: 'new' },
        { title: 'Renewal Process', value: 'renewal' },
        { title: 'Cancellation Process', value: 'cancellation' },
      ],
    }
  },
  computed: {
    currentTab() {
      // Use the tab param from the URL, default to 'new'
      return this.$route.query.tab || 'new'
    },
    visaModule() {
      // Map tab value to process type string expected by VisaProcessWrapper
      switch (this.currentTab) {
        case 'new': return 'new visa process';
        case 'renewal': return 'visa renewal';
        case 'cancellation': return 'visa cancellation';
        default: return 'new visa process';
      }
    },
    currentTabTitle() {
      // Return the title for the current tab only
      const tab = this.currentTab;
      const found = this.visaTabs.find(t => t.value === tab);
      return found ? found.title : '';
    }
  },
  methods: {
    onTabChange(tabValue) {
      // Update the URL query param, which will also update the sidebar and content
      this.$router.push({ path: '/visa-process', query: { tab: tabValue } })
    },
  },
  watch: {
    // If you want to react to tab changes, you can add a watcher here
    // currentTab(newVal) { ... }
  },
  mounted() {
    // Optionally, listen for global tabChanged event if still used elsewhere
    this.$nuxt.$on('tabChanged', ($event) => {
      this.onTabChange($event)
    })
  },
  beforeDestroy() {
    this.$nuxt.$off('tabChanged')
  },
}
</script>
