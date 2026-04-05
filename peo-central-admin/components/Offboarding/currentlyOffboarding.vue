<template>
  <v-row>
    <SnackBar :data="snackbar_data" />

    <v-col cols="12" md="12" lg="12" class="py-0 pr-0">
      <!-- CUSTOMER TOP CARDS -->
      <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 xl:tw-grid-cols-5 tw-gap-6 tw-mb-4" v-if="!ShowList">
        <CustomerTopCard v-for="(data, index) in statusList" :key="index" :title="data._id" :data="data.count" />
      </div>
    </v-col>
    <!-- Employees List  -->
    <v-col cols="12" md="5" lg="5" class="pa-0">
      <OffboardingList class="" @OffboardingEmployeeClicked="clickedOffboardingStatus($event)" v-if="!ShowList" />
    </v-col>
    <!-- Customer-Details-Tabs -->
    <v-col cols="12" md="7" lg="7" class="pa-0">
      <ProcessFlow module='offboardings' :selectedEmployee="selectedEmployee" @reload="showListEmployees" v-if="ShowDetails" />
    </v-col>
  </v-row>
</template>
  
<script>
import '@/assets/scss/_customers.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import CustomerTopCard from '~/components/Cards/CustomerTopCard/index.vue'
import OffboardingList from '~/components/Offboarding/offboardingList.vue'
import ProcessFlow from '@/components/ProcessFlow/index.vue'


export default {
  layout: 'dashboard',
  components: {
    SnackBar,
    CustomerTopCard,
    OffboardingList,
    ProcessFlow,
  },
  data() {
    return {
      //selected employee status
      selectedEmployee: null,
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
    }
  },
  methods: {
    clickedOffboardingStatus(event) {
      this.ShowDetails = false
      setTimeout(() => {
        this.selectedEmployee = event
        this.ShowDetails = true
      });
    },
    showListEmployees() {
      this.ShowList = true
        setTimeout(() => {
          this.ShowList = false
          
        }, 200);
    },
    getOffboardingStatusCount() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post('/offboardings/get_status_count', { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.statusList = response
        })
    },
  },

  computed: {


  },

  mounted() {
    this.getOffboardingStatusCount()
  },


}
</script>
