<template>
  <v-row>
    <SnackBar :data="snackbar_data" />

    <v-col cols="12" md="12" lg="12" class="py-0 pr-0">
      <!-- CUSTOMER TOP CARDS -->
      <div class="tw-flex tw-flex-row tw-flex-wrap tw-gap-4 tw-py-2 tw-w-full" v-if="!ShowList">
        <!-- Skeleton loader for lead stats -->
        <LeadStatsSkeleton v-if="loadingStats" :count="6" />

        <!-- Actual lead stats -->
        <div v-else v-for="(data, index) in statusList" :key="index">
          <LeadsCounts :active-tab="activeTab" @toggle-active="setActiveTab" :title="data._id" :data="data.count"
            :lead-value="data.total_order_value" />
        </div>
      </div>
    </v-col>
    <v-col cols="12" md="4" lg="4" class="pl-0 pr-0 pt-0">
      <AllLeadsList class="" :active-status="activeTab" @LeadsListClicked="clickedLeadStatus($event)"
        v-if="!ShowList" />
    </v-col>
    <v-col cols="12" md="8" lg="8" class="pl-0 pr-0 pt-0">
      <ProcessFlow module='leads' :selectedEmployee="selectedLeads" v-if="ShowDetails" />
    </v-col>
  </v-row>
</template>
<script>
import '@/assets/scss/_customers.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import LeadsCounts from '~/components/Cards/LeadsCounts/index.vue'
import AllLeadsList from '~/components/Leads/AllLeadsList.vue'
import ProcessFlow from '@/components/ProcessFlow/index.vue'
import LeadStatsSkeleton from '@/components/reuseable/LeadStatsSkeleton.vue'
export default {
  components: {
    SnackBar,
    LeadsCounts,
    AllLeadsList,
    ProcessFlow,
    LeadStatsSkeleton,
  },
  data() {
    return {
      //selected employee status
      selectedLeads: '',
      //card data
      statusList: [],
      ShowList: false,
      ShowDetails: false,
      countStatus: {},
      currentTab: 'all',
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      limit: '10',
      page: 0,
      activeTab: '',
      loadingStats: true
    }
  },

  async mounted() {
    await this.getLeadStatusCount()
    this.handleLeadsUpdates()
    this.handleGlobalLeadUpdates()
  },
  beforeDestroy() {
    this.$nuxt.$off('reload-lead-stats')
    this.$nuxt.$off('lead-data-updated')
  },
  methods: {
    handleLeadsUpdates() {
      this.$nuxt.$on('reload-lead-stats', async ({ stageName, selectNext }) => {
        await this.getLeadStatusCount()

        const activeIndex = this.statusList.findIndex(el => el._id == stageName)
        if (activeIndex != -1) {
          this.activeTab = this.statusList[activeIndex]._id
        } else {
          this.activeTab = this.statusList[0]._id
        }
      })
    },

    handleGlobalLeadUpdates() {
      this.$nuxt.$on('lead-data-updated', async (eventData) => {
        // Store the current active tab before refreshing
        const currentActiveTab = this.activeTab
        // Refresh lead status counts when leads are updated
        await this.getLeadStatusCount()
        // Restore the previous active tab if it still exists
        if (currentActiveTab && this.statusList.find(status => status._id === currentActiveTab)) {
          this.activeTab = currentActiveTab
        }
      })
    },
    clickedLeadStatus($event) {
      this.ShowDetails = false
      setTimeout(() => {
        this.selectedLeads = $event
        this.ShowDetails = true
      }, 1);
    },
    setActiveTab(tab) {
      this.activeTab = tab
    },
    showListEmployees() {
      this.ShowList = !this.ShowList
    },
    async getLeadStatusCount() {
      try {
        this.loadingStats = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.$get('/leads/get_status_count', { headers: { Authorization: AuthStr } })

        this.statusList = response

        // Only set activeTab to first status if no active tab is currently selected
        if (this.statusList.length && !this.activeTab) {
          this.activeTab = this.statusList[0]._id
        }
      } catch (error) {
        console.error('Error loading lead stats:', error)
      } finally {
        this.loadingStats = false
      }
    },
  },
}
</script>
