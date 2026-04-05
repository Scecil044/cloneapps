<template>
  <v-row class="ma-0 pa-0">
    <v-col class="ma-0 pa-0">
      <!-- {{ ShowCards }} -->
      <SnackBar :data="snackbar_data" />
      <!-- All Employees  -->
      <v-row class="ma-0 pa-0">
        <v-col cols="12" md="12" lg="12" class="py-0 pr-0">
          <!-- CUSTOMER TOP CARDS -->
          <div class="d-flex align-items-center justify-space-between">
            <!-- Stats Cards -->
            <div class="tw-flex tw-flex-wrap tw-gap-4 tw-mb-4 tw-w-full">
              <div
                v-for="(elem, index) in usersCount"
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
          </div>
        </v-col>
      </v-row>
      <v-row v-if="ShowCards" class="ma-0 pa-0">
        <!-- Employees List  -->
        <v-col cols="12" md="12" lg="12" class="pa-0">
          <EmployeesCard @employeeClicked="clickedID($event)" />
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12" md="4" lg="4" class="pa-0">
          <EmployeesList class="" :selectedEmployee="selectedEmployee" @employeeClicked="changeEmployee($event)" />
        </v-col>
        <!-- Customer-Details-Tabs -->
        <v-col cols="12" md="8" lg="8" class="pa-0">
          <EmployeesTabs v-if="ShowDetails" :selectedEmployee="selectedEmployee" :tab_current="tab_current_val"
            @EmployeeTabClicked="handleTabValue" @close="closeEmployeeTabs()" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import '@/assets/scss/_customers.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import CustomerTopCard from '~/components/Cards/CustomerTopCard/index.vue'
import EmployeesCard from '~/components/Employees/employeesCard.vue'
import EmployeesList from '~/components/Employees/employeesList.vue'
import EmployeesTabs from '~/components/Employees/employeesTabs.vue'

export default {
  layout: 'dashboard',
  components: {
    SnackBar,
    CustomerTopCard,
    EmployeesCard,
    EmployeesList,
    EmployeesTabs,
  },
  data() {
    return {
      //card data
      tab_current_val: 'all',
      ShowList: false,
      ShowCards: true,
      ShowDetails: true,
      selectedEmployee: '',
      selectedInsuranceDetails: [],

      currentTab: 'all',
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      usersCount: []
    }
  },
  methods: {
    closeEmployeeTabs() {
      this.ShowCards = true
    },
    handleTabValue(event) {
      this.tab_current_val = event
    },
    clickedID($event) {
      this.ShowCards = false
      this.selectedEmployee = $event
    },
    changeEmployee($event) {
      this.ShowDetails = false
      this.selectedEmployee = $event
      setTimeout(() => {
        this.ShowDetails = true
      }, 1);
    },

    getTotalCounts() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post('/users/count/details', {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          for (const key in response[0]) {
            if (response[0].hasOwnProperty(key)) {
              if (key.split("_")[0].length > 0) {
                this.usersCount.push(
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
    }

  },

  computed: {

  },

  mounted() {
    this.getTotalCounts()
  },


}
</script>
