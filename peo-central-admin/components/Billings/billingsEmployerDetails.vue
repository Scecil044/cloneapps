<template>
  <v-row>
    <v-col cols="12">
      <v-card color="card_bg" id="card" style="min-height: 90vh !important">
        <v-card-title id="card-title" class="mb-4"></v-card-title>
        <v-card-text id="card-text2" class="dl__l overflow-y-auto">
          <v-col cols="12" class="py-0 px-0"></v-col>
          <!-- Employee DETAILS TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
            :headers="companyHeaders" :items="companyDetails" hide-default-footer default-sort="false">
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
            <template v-slot:item="{ item, index }">
              <tr>
                <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
                <td class=" d-flex align-center">
                  <a href="/employer" v-if="index === 0">{{ item.description }}</a>
                  <span v-else>{{ item.description }}</span>
                </td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table>
          <!-- INVOICE ADDITIONS & DEDUCTIONS -->
          <div class="d-flex align-center mb-6" v-if="invoiceDetails.hasOwnProperty('additionsOrDeductions') && invoiceDetails.additionsOrDeductions.length > 0">
            <InfoSVG class="mr-2" />
            <span class="span_heading" style="color: #000000">INVOICE ADDITIONS & DEDUCTIONS</span>
          </div>
          <v-data-table id="coa_table" class="main__table elevation-0 document_table" :headers="employee_documents_headers" :items="employee_documents_data" :footer-props="{ 'items-per-page-options': [10, 20] }" hide-default-footer v-if="invoiceDetails.hasOwnProperty('additionsOrDeductions') && invoiceDetails.additionsOrDeductions.length > 0">
            <template v-slot:item="{ item }">
              <tr class="table_row">
                <td class="pr-0" style="width: 215px !important;">
                  <span class=" subtext--text">{{ item.title }}</span>
                </td>
                <td class="">{{ item.amount }}</td>
                <td class="pa-0 ma-0 pl-3">
                  <div class="">{{ item.type }}</div>
                </td>
                <td class="">{{ item.currency }}</td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import InfoSVG from '@/assets/images/Customer/info.svg'
import BinanceSVG from '@/assets/images/icons/binance-logo.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'


export default {
  components: {
    InfoSVG,
    BinanceSVG,
    customerDefaultIcon,
  },
  props: {
    selectedInvoice: String
  },
  data() {
    return {
      companyHeaders: [
        { text: 'EMPLOYER DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      companyDetails: [
        {
          title: 'Customer / Employer',
          description: '',

        },
        {
          title: 'Applied on',
          description: '',
        },
        {
          title: 'Invoice Type',
          description: '',
        },
      ],
      employee_documents_headers: [
        { text: 'Category', value: 'title', align: 'start' },
        { text: 'Amount', value: 'amount', align: 'start' },
        { text: 'Type', value: 'type', align: 'start' },
        { text: 'Currency', value: 'currency', align: 'start' },
      ],
      employee_documents_data:[],
      invoiceDetails:{}
    }
  },
  mounted(){
    this.getInvoiceDetails(this.selectedInvoice)
  },
  methods: {
    async getInvoiceDetails(id){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/payitem/invoice/${id}`, { }, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.invoiceDetails = response

        if(this.invoiceDetails != undefined && this.invoiceDetails.invoiceData != 'undefined') {
          this.companyDetails[0].description = this.invoiceDetails.invoiceData.customer_name
          this.companyDetails[1].description = this.invoiceDetails.invoiceData.invoice_date.substr(0,10)
          this.companyDetails[2].description = this.invoiceDetails.invoiceData.type ? this.invoiceDetails.invoiceData.type : '-'
        }

        if(this.invoiceDetails != undefined && this.invoiceDetails.hasOwnProperty('additionsOrDeductions') && this.invoiceDetails.additionsOrDeductions.length > 0){
          this.employee_documents_data = this.invoiceDetails.additionsOrDeductions.map((invoice) => {
            const { type, amount, currency} = invoice;
            return { title: invoice.category, amount, type, currency }
          })
        }
      })
    }
  },
}
</script>