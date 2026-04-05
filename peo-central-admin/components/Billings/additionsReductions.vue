<template>
    <v-row >
      <v-col cols="12" md="4" lg="4" class="pa-0" >
        <BillingsInvoiceList class="" @InvoiceListClicked="clickedDetailInvoice($event)" />
      </v-col>
      <v-col cols="12" md="8" lg="8" class="pa-0" >
        <BillingsEmployerDetails class="" :selectedInvoice="selectedInvoice" v-if="ShowDetails" />
       </v-col>
    </v-row>
  </template>
  
  <script>
  import '@/assets/scss/_customers.scss'
  import BillingsInvoiceList from '~/components/Billings/billingsInvoiceList.vue'
  import BillingsEmployerDetails from '~/components/Billings/billingsEmployerDetails.vue'
  
  export default {
    layout: 'dashboard',
    components: {
      BillingsInvoiceList,
      BillingsEmployerDetails,
    },
    data() {
      return {
        tab_current_val :  'all',
        ShowList: false,
        ShowDetails: false,
        currentTab: 'all',
        privacyMood: false,
        selectedInvoice:'',
      }
    },
    methods: {
      handleTabValue(event){
        this.tab_current_val = event
      },
      showListEmployees() {
        this.ShowList = !this.ShowList
      },
      clickedDetailInvoice($event){
        this.ShowDetails = false
        setTimeout(() => {
          this.selectedInvoice = $event
          this.ShowDetails = true
        }, 1);
      }
    },
    computed: {

    },
    mounted() {
    },
  }
  </script>
  