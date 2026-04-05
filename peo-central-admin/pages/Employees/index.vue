<template>
  <v-row class="leads_wrapper">
    <!-- <SnackBar :data="snackbar_data" /> -->
    <Employees v-if="currentTab == 'all'" />
    <HRServices v-if="currentTab == 'hrServices'" />

  </v-row>
</template>
  
<script>

import '@/assets/scss/_billings.scss'
// import Leads from '~/components/Leads/leads.vue'
import Employees from '~/components/Employees/employees.vue'
import HRServices from '~/components/Employees/hrServices.vue'


import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
//   import SnackBar from '@/components/utils/SnackBar.vue'
//   import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
//   import Products from '@/components/Sales/Products.vue'
//   import LightArrow from '@/assets/images/White-Light-Arrow-icon.svg'

export default {
  layout: 'dashboard',
  components: {
    //FileDropzone, 
    //TotalsCard, 
    //SnackBar, 
    //AllSales,
    //Invoices,
    //Products,
    //OffBoarding,
    //LightArrow,
    Employees,
    HRServices,
    CustomInputContainer,
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
  