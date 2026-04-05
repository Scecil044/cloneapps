<template>
    <v-row>
      <SnackBar :data="snackbar_data" />

      <v-col cols="12" md="11" lg="11" class="py-0 pr-0">
        <!-- CUSTOMER TOP CARDS -->
        <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 xl:tw-grid-cols-5 tw-gap-6 tw-mb-4" v-if="!ShowList">
          <CustomerTopCard v-for="(data, index) in statusList" :key="index" :title="data._id" :data="data.count" />
        </div>
      </v-col>
      <v-col cols="12" md="1" lg="1">
        <v-btn
        @click="handleBack"
        color="orange-darken-2"
      >
        <v-icon
          start
          icon="mdi-arrow-left"
        ></v-icon>
        Back
      </v-btn>
      </v-col>
      <!-- Employees List  -->
      <v-col cols="12" md="5" lg="5" class="pa-0">
        <RenewalList class="" :selectedRenewal="renewalDetails" @RenewalEmployeeClicked="clickedRenewalStatus($event)" v-if="!ShowList" />
      </v-col>
      <!-- Customer-Details-Tabs -->
      <v-col cols="12" md="7" lg="7" class="pa-0">
        <ProcessFlow module='renewals' :selectedEmployee="selectedEmployee" @reload="showListEmployees" v-if="ShowDetails" />
      </v-col>
    </v-row>
  </template>

  <script>
  import '@/assets/scss/_customers.scss'
  import SnackBar from '@/components/utils/SnackBar.vue'
  import CustomerTopCard from '~/components/Cards/CustomerTopCard/index.vue'
  import RenewalList from '~/components/RenewalRequest/renewalsList.vue'
  import ProcessFlow from '@/components/ProcessFlow/index.vue'


  export default {
    props:['renewalDetails'],
    layout: 'dashboard',
    components: {
      SnackBar,
      CustomerTopCard,
      RenewalList,
      ProcessFlow,
    },
    data() {
      return {
        //selected employee status
        selectedEmployee: null,
        //card data
        statusList:[],
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
    mounted() {
      this.getRenewalStatusCount()
    },
    methods: {
      clickedRenewalStatus($event) {
        console.log($event , "Event ")
        this.ShowDetails = false
        setTimeout(() => {
          this.selectedEmployee = $event
          this.ShowDetails = true
        }, 1);
      },
      handleBack() {
          this.$emit('back')
      },
      showListEmployees() {
        this.ShowList = true

        setTimeout(() => {
          this.ShowList = false

        }, 200);
      },
      getRenewalStatusCount() {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        this.$axios.$get('/renewals/get_status_count', { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.statusList = response
          })
      },
    },
  }
  </script>
