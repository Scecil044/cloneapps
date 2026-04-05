<template>
  <v-row>
    <v-col cols="12" class="pt-0 pb-0">
      <!-- <div class="d-flex align-center justify-end pb-3">
        <v-btn class="ml-1 pl-3 pr-3" color="#000027" outlined :height="30" style="border: solid 3px #f9fafc !important">
          <EditSvg />
          <span class="edit_btnNew pl-1">Edit</span>
        </v-btn>
      </div> -->
      <!-- Top-Cards -->
      <InsightCard class="mb-6" :data="DetailsCard" v-if="showDetails" />

    </v-col>
  </v-row>
</template>

<script>
import InsightCard from '~/components/Cards/InsightCard/index.vue'
import EditSvg from '@/assets/images/Customer/edit.svg'


export default {
  props: {
    selectedCustomer: String,
  },
  components: {
    InsightCard,
    EditSvg,
  },
  data() {
    return {
      DetailsCard: [
        {
          status: 'Unpaid Invoice',
          count: '',
        },
        {
          status: 'Active Users',
          count: '',
        },
        {
          status: 'Onboarding Inprogress',
          count: '',
        },
        {
          status: 'New Visa Process',
          count: '',
        },
        {
          status: 'Offboarding Users',
          count: '',
        },
      ],
      details_counts:[],
      showDetails: false
    }
  },
  mounted(){
    this.getDetailsCardDetailsCount()
  },
  methods:{
    async getDetailsCardDetailsCount(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/users/counts/companyid/${this.selectedCustomer}`, { headers: {Authorization : AuthStr} })
      .then((response) =>{
        this.details_counts = response
        if(this.details_counts && this.details_counts.length > 0) {
          this.DetailsCard[0].count = this.details_counts[0].unpaid_invoice
          this.DetailsCard[1].count = this.details_counts[0].active_users
          this.DetailsCard[2].count = this.details_counts[0].onboarding_users
          this.DetailsCard[3].count = this.details_counts[0].active_visa_process
          this.DetailsCard[4].count = this.details_counts[0].offboarding_users
          this.showDetails = true
        }
      })
    }
  }
}
</script>