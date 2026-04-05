<template>
  <v-row class="ma-0 pa-0">
    <v-col class="ma-0 pa-0">
      <!-- {{ ShowCards }} -->
      <SnackBar :data="snackbar_data" />
      <!-- All Employees  -->
      <v-row class="ma-0 pa-0">
        <v-col cols="12" md="12" lg="12" class="py-0 pr-0">
          <!-- CUSTOMER TOP CARDS -->
          <div class="tw-flex tw-flex-wrap tw-gap-4 tw-mb-4 tw-w-full">
            <div
              v-for="(elem, index) in topCards"
              :key="index"
              class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-py-3 tw-px-3 tw-flex tw-flex-1 tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative tw-m-2 tw-min-w-[160px] tw-max-w-[220px]"
            >
              <div class="tw-flex tw-flex-col tw-space-y-1">
                <span class="tw-text-sm tw-font-medium tw-text-gray-500">{{ elem.field }}</span>
                <span class="tw-text-3xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-blue-600">{{ elem.value }}</span>
              </div>
              <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-blue-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-blue-600"></div>
            </div>
          </div>
        </v-col>
      </v-row>
      <v-row v-if="ShowCards" class="ma-0 pa-0">
        <!-- Employees List  -->
        <v-col cols="12" md="12" lg="12" class="pa-0">
          <CustomersCard :AllCustomers="showListCustomer" @SelectedCustomer="clickedID($event)" />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12" md="4" lg="4" class="pa-0">
          <CusList class="" @employerClicked="changeEmployer($event)" :selectedEmployer="selectedCustomer" />
        </v-col>
        <!-- Customer-Details-Tabs -->
        <v-col cols="12" md="8" lg="8" class="pa-0">
          <CusTabs :selectedCustomer="selectedCustomer" :tab_current="tab_current_val"
            @EmployerTabClicked="handleTabValue" v-if="ShowDetails" @close="closeCusTabs()" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import '@/assets/scss/_customers.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import Customer from '@/components/Customers/Customer.vue'
import CustomersCard from '~/components/Customers/CustomerCard.vue'
// import InfiniteScroll from '~/components/infiniteLoading/index.vue'
import CustomerTopCard from '~/components/Cards/CustomerTopCard/index.vue'
import CusList from '~/components/Customers/CusList.vue'
import CusTabs from '~/components/Customers/cusTabs.vue'

export default {
  layout: 'dashboard',
  components: {
    SnackBar,
    Customer,
    CustomersCard,
    CustomerTopCard,
    CusList,
    CusTabs,
    // InfiniteScroll,
  },
  data() {
    return {
      ShowCards: true,
      ShowDetails: true,
      selectedCustomer: '',
      // companies: [],
      topCards: [],
      currentTab: 'all',
      tab_current_val: 'all',
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
    }
  },
  methods: {
    closeCusTabs() {
      this.ShowCards = true
    },
    handleTabValue(event) {
      this.tab_current_val = event
    },
    clickedID($event) {
      this.ShowCards = false
      this.selectedCustomer = $event
    },
    changeEmployer($event) {
      this.ShowDetails = false
      this.selectedCustomer = $event
      setTimeout(() => {
        this.ShowDetails = true
      }, 1);
    },
    showListCustomer() {
      this.ShowList = !this.ShowList
    },
    async getTopCards() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/companies/counts/all`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          for (const key in response[0]) {
            if (response[0].hasOwnProperty(key)) {
              if (key.split("_")[0].length > 0) {
                this.topCards.push(
                  {
                    field: key.split("_").map((word) => {
                      return word[0] ? word[0].toUpperCase() + word.substring(1) : ''
                    }).join(" "),
                    value: response[0][key]
                  }
                )
              }
            }
          }
        })
    },
    changeTab(event) {
      this.currentTab = event
    },
  },
  mounted() {
    this.getTopCards();
  },
}
</script>
