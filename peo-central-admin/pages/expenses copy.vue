<template>
  <v-row class="">
    <!-- <SnackBar :data="snackbar_data" /> -->
    <AllExpenses v-if="currentTab == 'all'" />
    <Suppliers />
    <Forecast v-if="currentTab == 'forecast'" />
    <ExpenseBreakdown v-if="currentTab == 'breakdown'" />
    <Reimbursement v-if="currentTab == 'reimbursement'" />
  </v-row>
</template>

<script>
import '@/assets/scss/_expenses.scss'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
import LightArrow from '@/assets/images/White-Light-Arrow-icon.svg'
import AllExpenses from '@/components/Expenses/AllExpenses.vue'
import Suppliers from '@/components/Expenses/Suppliers.vue'
import Reimbursement from '@/components/Expenses/Reimbursement.vue'
import ExpenseBreakdown from '@/components/Expenses/ExpenseBreakdown.vue'
import Forecast from '@/components/Expenses/Forecast/Forecast.vue'

export default {
  layout: 'dashboard',
  components: { 
    TotalsCard, 
    LightArrow,
    Forecast,
    ExpenseBreakdown,
    Reimbursement,
    Suppliers,
    AllExpenses,
  }, 
  data() { 
    return {
      // SNACKBAR
      snackbar_data: { snackbar: false, text: 'Successfully', color: 'success', timeout: 2000 },
      // INVOICE VIEW
      invoiceView: false,
      currentTab: 'all',
    }
  },
  created() {
    this.$nuxt.$on('tabChanged', ($event) => {
			this.changeTab($event)
    })
  },
	beforeDestroy(){
    this.$nuxt.$off('tabChanged')
  },
  methods: {
    handlePrint() {
      this.snackbar_data = { snackbar: true, text: 'Printed Successfully', color: 'success', timeout: 2000 }
    },
    handleInvoiceView() {
      this.invoiceView = true
    },
    handleApplyFilter() {
      this.filterDialog = false
    },
    changeTab(event){
      console.log("Ex Clicked Tab is =>",  event)
      this.currentTab = event
    }
  },
  computed: {
    computedTab(){}
  }
}
</script>