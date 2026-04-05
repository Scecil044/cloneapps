<template>
  <v-row class="sales_wrapper">
    <!-- <SnackBar :data="snackbar_data" /> -->
    <AllInvoices v-if="currentTab == 'all'" />
    <AllCreditNotes v-if="currentTab == 'creditNotes'" />
    <paymentSchedule v-if="currentTab == 'paymentSchedule'" />
    <AdditionsReduction v-if="currentTab == 'additionsReductions'" />
  </v-row>
</template>

<script>
import '@/assets/scss/_billings.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import AllInvoices from '~/components/Billings/allInvoices.vue'
import AllCreditNotes from '~/components/Billings/allCreditNotes.vue'
import AdditionsReduction from '@/components/Billings/additionsReductions.vue'
import paymentSchedule from '@/components/Billings/paymentSchedule.vue'
import LightArrow from '@/assets/images/White-Light-Arrow-icon.svg'

export default {
  layout: 'dashboard',
  components: {
    LightArrow,
    SnackBar,
    AllInvoices,
    AllCreditNotes,
    AdditionsReduction,
    paymentSchedule,
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
