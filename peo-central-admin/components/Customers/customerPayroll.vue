<template>
  <!-- PAYROLL DETAILS TABLE -->
  <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-8"
    :headers="PayrollHeaders" :items="payrollDetails" :footer-props="{ 'items-per-page-options': [30, 40] }"
    hide-default-footer>
    <template v-slot:header.title="{ header }">
      <div class=" d-flex  align-center pa-0 ">
        <div>
          <InfoSVG />
        </div>
        <div>
          <th class="pl-2">{{ header.text }}</th>
        </div>
      </div>
    </template>


    <template v-slot:item="{ item, }">
      <tr>
        <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>

        <td class=" d-flex align-center">
          {{ item.description.display }}
        </td>
        <td class=""> </td>
      </tr>
    </template>

  </v-data-table>
</template>
<script>
import InfoSVG from '@/assets/images/Customer/info.svg'

export default {
  components: {

    InfoSVG,

  },
  props: { selectedCustomer: String },
  data() {
    return {
      companiesDetails:[],
      PayrollHeaders: [
        { text: 'PAYROLL SCHEDULE', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      payrollDetails: [
        {
          title: 'Invoice date',
          description: '',
        },
        {
          title: 'Payment Due Date',
          description: '',
        },
        {
          title: 'Salary Date',
          description: '',
        },
      ],

    }
  },
  mounted(){
    this.employersDetails(this.selectedCustomer)
  },
  methods: {
    async employersDetails(user_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/companies/detailsonid/${user_id}`, { headers: { Authorization: AuthStr } })
      .then((response) => {
        // new arr obj
        this.companiesDetails = response;
        // console.log('employer details', this.companiesDetails)
        this.getPayrollDetails()
      })
      .catch((err) => console.log(err))
    },
    getPayrollDetails(){
      if(this.companiesDetails && this.companiesDetails.length > 0) {
        this.payrollDetails.forEach((item) => {
          const lowercaseTitle = item.title.toLowerCase();
          switch (lowercaseTitle) {
            case 'invoice date':
              item.description = this.companiesDetails[0].payroll_schedule.invoice_date;
              break;
            case 'payment due date':
              item.description = this.companiesDetails[0].payroll_schedule.payment_due_notification;
              break;
            case 'salary date':
              item.description = this.companiesDetails[0].payroll_schedule.salary_payment_date;
              break;
            default:
              break;
          }
        })
      }
    },
  }
}
</script>
