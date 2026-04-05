<template>
  <v-row class="leads_wrapper">
    <!-- <SnackBar :data="snackbar_data" /> -->
    <LeadTasks v-if="currentTab == 'all'" />
    <Leads v-if="currentTab == 'leads'" :topCards="true" :progressBar="progressBar" :leadHeadingButtons="leadHeadingButtons" />
    <Pipeline v-if="currentTab == 'pipeline'" />
    <Unsuccessful v-if="currentTab == 'unsuccessful'" />
  </v-row>
</template>

<script>
import '@/assets/scss/_billings.scss'
import Leads from '~/components/Leads/leads.vue'
import Pipeline from '~/components/Leads/pipeline.vue'
import LeadTasks from '~/components/Leads/TasksOverview.vue'
import Unsuccessful from '~/components/Leads/unsuccessful.vue'

import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import { mapState, mapActions } from 'vuex'

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
    Leads,
    Pipeline,
    Unsuccessful,
    CustomInputContainer,
    LeadTasks
  },
  data() {
    return {
      currentTab: 'all',
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      progressBar: [
        {
          title: 'Lead Received',
          active: true,
        },
        {
          title: 'Contact Client',
          active: false,
        },
        {
          title: 'Send Proposal',
          active: false,
        },
        {
          title: 'Waiting for Approval',
          active: false,
        },
        {
          title: 'Collect Documents',
          active: false,
        },
        {
          title: 'Service Agreement',
          active: false,
        },
      ],
      leadHeadingButtons: [
        {
          title: 'Has the lead been contacted ?',
          unsuccess: 'Unsuccessful',
          btnName: 'Mark Contacted',
        },
        {
          title: 'Create Proposal',
          unsuccess: 'Unsuccessful',
          btnName: 'Create Proposal',
        },
        {
          title: 'Send proposal for approval to customer',
          unsuccess: 'Unsuccessful',
          btnName: 'Mail For Approval',
        },
        {
          title: 'Was the Proposal Accepted?',
          unsuccess: 'Unsuccessful',
          btnName: 'Accepted',
        },
        {
          title: 'Send mail to customer for required documents',
          unsuccess: 'Unsuccessful',
          btnName: 'Send Mail',
        },
        {
          title: 'Upload the Document Below',
          unsuccess: 'Unsuccessful',
          btnName: 'Proceed to Create Agreement',
        },
        {
          title: 'Next Step',
          unsuccess: 'Unsuccessful',
          btnName: 'Send for Signing',
        },
        {
          title: 'Waiting To Be Signed',
          unsuccess: 'Unsuccessful',
          btnName: 'Signed',
        },
        {
          title: 'Signed',
          unsuccess: 'Unsuccessful',
          btnName: 'Add to Employer',
        },
      ],
    }
  },
  methods: {
    ...mapActions(['setSendEmailForm']),
    changeTab(event) {
      this.currentTab = event
    },
  },
  computed: {
    ...mapState(['sendEmailForm']),
  },
  mounted() {
    this.setSendEmailForm('leads');

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
