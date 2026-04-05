<template>
  <v-row class="leads_wrapper">
    <AllRenewals v-if="ShowAllRenewals" @renewalDetails="changeRenewals" />
    <Renewals v-if="!ShowAllRenewals" @back="ShowAllRenewals = true" :renewalDetails="renewalDetails" />
  </v-row>
</template>

<script>
import AllRenewals from '~/components/RenewalRequest/allRenewals.vue';
import '@/assets/scss/_renewal.scss'
import Renewals from '~/components/RenewalRequest/renewals.vue'
import { mapState, mapActions } from 'vuex'


export default {
  layout: 'dashboard',
  components: {
    Renewals, 
    AllRenewals
  },
  data() {
    return {
      privacyMood: false,
      ShowAllRenewals : true, 
      progressBar: [
        {
          title: 'Notify Employer',
          active: true,
        },
        {
          title: 'Create Work Order',
          active: false,
        },
        {
          title: 'Work Order Approval',
          active: false,
        },
        {
          title: 'Create Invoice',
          active: false,
        },
        {
          title: 'Record Payment',
          active: false,
        },
        {
          title: 'Start Renewal',
          active: false,
        },
      ],
      leadHeadingButtons: [
        {
          title: 'Next Step',
          btnName: 'Notify employer',
        },
        {
          title: 'Waiting for employer\'s confirmation',
          svg: 'fa-circle-info',
        },
        {
          id: 'workOrder',
          title: 'Next Step',
          btnName: 'Create Work Order',
        },
        {
          title: 'Next Step',
          btnName: 'Send for Sign',
        },
        {
          title: 'Waiting for Employer\'s approval',
          svg: 'fa-circle-info',
          btnName: 'Mark as signed',
        },
        {
          id: 'createInvoice',
          title: 'Next Step',
          btnName: 'Create Invoice',
        },
        {
          title: 'Next Step',
          btnName: 'Send Invoice',
        },
        {
          id: 'recordPayment',
          title: 'Waiting for payment',
          svg: 'fa-circle-info',
          btnName: 'Record Payment',
        },
        {
          id: 'visaRenewal',
          title: 'Next Step',
          btnName: 'Start Visa Renewal',
        },
      ],
      renewalDetails : null,
    }
  },
  mounted() {
    
  },
  methods: {
    ...mapActions(['setSendEmailForm']),
    changeTab(event) {
      this.currentTab = event
    },
    changeRenewals(ev) {
      console.log("ev", ev)
      // console.log(JSON.parse(JSON.stringify(ev)))
      this.renewalDetails = ev
      this.ShowAllRenewals = false
    },
     
  },
  computed: {
    ...mapState(['sendEmailForm']),
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
