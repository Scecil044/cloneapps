<template>
  <v-row>
    <SnackBar :data="snackbar_data" />

    <v-col cols="12" md="12" lg="12" class="py-0 pr-0">
      <!-- CUSTOMER TOP CARDS -->
      <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 xl:tw-grid-cols-5 tw-gap-6 tw-mb-4" v-if="!ShowList">
        <CustomerTopCard
          v-for="(data, index) in statusList"
          :key="index"
          :title="data._id === 'Withdraw' ? 'Withdrawn' : data._id"
          :data="data.count"
          :value="data._id"
          :isActive="isStatsCardActive(data._id)"
          @click="handleStatsCardClick"
        >
          <template v-slot:sub>
            <span v-if="data.inactiveCount > 0" class="tw-text-xs tw-text-orange-500 tw-font-medium">
              ({{ data.inactiveCount }} inactive)
            </span>
            <span v-else class="tw-text-xs tw-text-gray-400">
              &nbsp;
            </span>
          </template>
        </CustomerTopCard>
      </div>
    </v-col>
    <!-- Employees List  -->
    <v-col cols="12" md="5" lg="5" class="pa-0">
      <OnboardingList
        ref="onboardingList"
        class=""
        :activeFilter="activeFilter"
        @OnboardingEmployeeClicked="clickedOnboardingStatus($event)"
        @filterChanged="handleFilterChanged"
        v-if="!ShowList"
      />
    </v-col>
    <!-- Customer-Details-Tabs -->
    <v-col cols="12" md="7" lg="7" class="pa-0">
      <ProcessFlow module='onboardings' :selectedEmployee="selectedEmployee" @reload="showListEmployees" v-if="ShowDetails" />

    </v-col>
  </v-row>
</template>

<script>
import '@/assets/scss/_customers.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import CustomerTopCard from '~/components/Cards/CustomerTopCard/index.vue'
import OnboardingList from '~/components/Onboarding/onboardingList.vue'
import ProcessFlow from '@/components/ProcessFlow/index.vue'


export default {
  layout: 'dashboard',
  components: {
    SnackBar,
    CustomerTopCard,
    OnboardingList,
    ProcessFlow,
  },
  data() {
    return {
      //selected employee status
      selectedEmployee: {},
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
      // Active filter tracking
      activeFilter: null,
    }
  },
  mounted() {
    this.getOnboardingStatusCount()
  },
  methods: {
    clickedOnboardingStatus($event) {
      this.ShowDetails = false
      setTimeout(() => {
        this.selectedEmployee = $event
        this.ShowDetails = true
      }, 1);
    },
    showListEmployees() {
      // console.log('Hist Here')
      this.ShowList = true

      setTimeout(() => {
        this.ShowList = false

      }, 200);
    },
    getOnboardingStatusCount() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post('/onboardings/get_status_count', { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.statusList = response
        })
    },
    handleStatsCardClick(cardData) {
      // Toggle filter - if same card clicked, clear filter
      if (this.activeFilter === cardData.value) {
        this.activeFilter = null
      } else {
        this.activeFilter = cardData.value
      }

      // Don't call applyFilter directly - let the watcher handle it
      // This prevents duplicate API calls
    },
    handleFilterChanged(filterValue) {
      this.activeFilter = filterValue
    },
    isStatsCardActive(cardValue) {
      return this.activeFilter === cardValue
    },
  },
}
</script>
