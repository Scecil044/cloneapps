<template>
  <div style="width: 100% !important;">
    <!-- <BillingsCard :data="InvoiceCard" v-if="showCounts"/> -->
    <BillingsInvoiceWrapper />
  </div>
</template>
<script>
import BillingsCard from '~/components/Cards/BillingsCards/index.vue'
import BillingsInvoiceWrapper from '@/components/Billings/billingsInvoiceWrapper.vue'

export default {
  components: {
    BillingsCard,
    BillingsInvoiceWrapper,
  },
  data() {
    return {
      InvoiceCard: [
        {
          status: 'Unpaid Invoices',
          count: '',
          amount: ''
        },
        {
          status: 'OverDue Invoices',
          count: '',
          amount: ''
        },
        {
          status: 'Paid Invoices',
          count: '',
          amount: ''
        },
        {
          status: 'General Invoices',
          count: '',
          amount: ''
        },
        {
          status: 'Monthly Invoices',
          count: '',
          amount: ''
        },
        {
          status: 'Draft Invoices',
          count: '',
          amount: ''
        },
        {
          status: 'Unapproved Invoices',
          count: '',
          amount: ''
        },
        {
          status: 'Total Amount Due',
          count: ''
        },
      ],
      invoiceCount: [],
      showCounts: false,
    }
  },
  mounted(){
    // this.getInvoiceCardCount()
    // this.getTotalAmountDue()
  },
  methods:{
    async getInvoiceCardCount(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/invoice/counts`, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.invoiceCount = response
        if(this.invoiceCount.length > 0) {
          // Map the response data to our card data
          const statusMapping = {
            'Unpaid Invoices': 0,
            'OverDue Invoices': 1,
            'Paid Invoices': 2,
            'General Invoices': 3,
            'Monthly Invoices': 4,
            'Draft Invoices': 5,
            'Unapproved Invoices': 6
          };

          this.invoiceCount.forEach(item => {
            const index = statusMapping[item.name];
            if (index !== undefined) {
              this.InvoiceCard[index].count = item.count;
              this.InvoiceCard[index].amount = item.amount;
            }
          });

          this.showCounts = true;
        }
      })
    },

    async getTotalAmountDue(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(`/invoice/amount/due/companies?limit=1`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          const formattedAmount = new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(response.totalAmount)

          this.InvoiceCard[7].count = formattedAmount
        })
    }
  }
}
</script>
