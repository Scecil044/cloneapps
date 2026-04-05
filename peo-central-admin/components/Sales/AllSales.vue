<template>
  <div style="width: 100%">
    <!-- TOP TOTAL CARD -->
    <!-- <TotalsCard :data="total_sales" type="allSales" :class=" privacyMood ? 'privacyMood' : '' " /> -->
    <!-- ALL SALES DATA TABLE -->
    <v-row class="row1">
      <v-col cols="12">
        <v-card color="card_bg" id="card">
          <v-card-text
            id="card-text"
            style="margin-top: 0 !important"
            :class="privacyMood ? 'privacyMood' : ''"
          >
            <v-data-table
              id="ALL_SALES"
              class="main__table elevation-0"
              :headers="sales_headers"
              :items="invoices"
              :page="page"
              :pageCount="totalPage"
              :options.sync="options"
              :server-items-length="totalCount"
              :footer-props="{ 'items-per-page-options': [10, 20] }"
              hide-default-footer
            >
              <template v-slot:top>
                <div class="top__con">
                  <v-text-field
                    class="search_bar"
                    v-model="search"
                    label="Search By"
                    color="outline"
                    outlined
                    solo
                    flat
                    hide-details
                    dense
                    height="45px"
                    @keyup="handleData"
                  >
                    <template slot="prepend-inner">
                      <v-btn icon><v-icon small>fa-search</v-icon></v-btn>
                    </template>
                  </v-text-field>
                  <div class="action__btn">
                    <!-- <v-menu
                      transition="slide-y-transition"
                      rounded="lg"
                      offset-y
                    >
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn
                          class="tall__btn"
                          color="primary"
                          v-bind="attrs"
                          v-on="on"
                        >
                          New
                          <LightArrow class="ml-2" style="max-width: 10px" />
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          v-for="(item, index) in new_transaction_menu"
                          :key="index"
                          link
                          @click="handleNewTransaction(item.title)"
                        >
                          <v-list-item-title class="">
                            <span class="n_text text--text ml-2">{{
                              item.title
                            }}</span>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu> -->
                    <!-- <v-btn
                      class="tall__btn ml-2 subtext--text"
                      color="subtext"
                      outlined
                      @click="filterDialog = true"
                    >
                      <v-icon class="mr-2" small>fa-filter</v-icon>
                      Filter
                    </v-btn> -->
                  </div>
                </div>
              </template>
              <template v-slot:item="{ item, index }">
                <tr style="">
                  <!-- <td class="pa-0 ma-0">
                    <div
                      class="flex_row align-center justify-center"
                      :style="{ borderLeft: '4px solid' + item.color }"
                    >
                      <v-checkbox
                        color="info"
                        on-icon="fa-light fa-square-check"
                        off-icon="fa-regular fa-square"
                        class="mx-auto mb-2"
                        dense
                        hide-details
                        :v-model="sales_selected"
                      ></v-checkbox>
                    </div>
                  </td> -->
                  <td>
                    {{ item.invoice_date | formatDateWithoutTime }}
                  </td>
                  <td>{{ item.customer }}</td>
                  <td>
                    {{ item.due_date | formatDateWithoutTime }}
                  </td>
                  <td>{{ item.sub_total }}</td>
                  <td>{{ item.vat_total }}</td>
                  <td>{{ item.total }}</td>
                  <td>
                    <div class="status__con">
                      <span
                        :class="
                          item.paid
                            ? 'light_accent4 accent4--text'
                            : item.status === 'Partially Paid'
                            ? 'light_accent3 accent3--text'
                            : 'light_accent2 accent2--text'
                        "
                        class="status"
                      >
                        {{ item.status }}
                      </span>
                    </div>
                  </td>
                  <td style="width: 30px">
                    <div class="actions__con">
                      <span class="print primary--text">Print</span>
                      <v-btn color="subtext" icon
                        ><v-icon small
                          >fa-solid fa-ellipsis-vertical</v-icon
                        ></v-btn
                      >
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '@/components/utils/FileDropzone.vue'
import LightArrow from '@/assets/images/White-Light-Arrow-icon.svg'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  components: {
    CustomInputContainer,
    FileDropzone,
    TotalsCard,
    LightArrow,
  },
  props: [],
  mounted() {
    this.fetchInvoices()
  },
  computed: {
    ...mapState(['companySelection']),
  },
  data() {
    return {
      stage: null,
      // ******************** New Transactions Dialogs Data ********************
      // ADD INVOICE DIALOG (1)
      addNewInvoiceDialog: false,
      InvoiceDialogStage: 'default',
      new_invoice: { filed_full: false },
      new_invoice_data: [],
      page: 1,
      totalCount: 0,
      totalPage: 0,
      invoices: [],
      options: { itemsPerPage: 10 },
      invoice_pdf: {
        invoice_no: 'DF-2206-663',
        date: '2022-06-23',
        due_date: '2022-06-23',
        po_no: '460695',
        c_name: 'EasyBox',
        address: 'San Francisco, CA 94114-8777',
        country: 'United States',
        vat_no: 'Vat No. 86-2769183',
        input: ['Item 1', '1%', '12023', '1', 'AED 10,900'],
      },
      InvoiceDialogLineOne: true,
      InvoiceDialogLineTwo: false,
      InvoiceDialogLineThree: false,
      addNewInvoicePreviewTableHeaders: [
        '#',
        'Service Date',
        'Product/Service',
        'Description',
        'QTY',
        'Rate',
        'Amount',
        'Tax',
        'Actions',
      ],
      addNewPaymentTableHeaders: [
        '#',
        'Description',
        'Due date',
        'Original Amt',
        'Open Bal',
        'Payment',
        'Actions',
      ],
      // ADD PAYMENT DIALOG (2)
      addNewPaymentDialog: false,
      PaymentDialogStage: 'default',
      new_payment: { filed_full: false },
      new_payment_data: [],
      OT_PaymentDialogLineOne: true,
      OT_PaymentDialogLineTwo: false,
      CR_PaymentDialogLineOne: true,
      CR_PaymentDialogLineTwo: false,
      outstandingTransactionsTableHeaders: [
        '#',
        'Description',
        'Due date',
        'Original Amt',
        'Open Bal',
        'Payment',
        'Actions',
      ],
      CreditsTableHeaders: [
        '#',
        'Description',
        'Original Amount',
        'Open Bal',
        'Payment',
        'Actions',
      ],
      // ADD ESTIMATE DIALOG (3)
      addNewEstimateDialog: false,
      new_estimate: [{ tax: '', filed_full: false }],
      addNewEstimateTableHeaders: [
        '#',
        'Service Date',
        'Product/Service',
        'Description',
        'QTY',
        'Rate',
        'Amount',
        'Actions',
      ],
      PaymentDialogLineOne: true,

      // ADD SALES RECEIPT (4)
      addNewSalesRecieptDialog: false,

      // ADD TAX CREDIT NOTE DIALOG (5)
      addNewTaxCreditNoteDialog: false,

      // ADD TIME ACTIVITY DIALOG (6)
      addNewTimeActivityDialog: false,

      // ADD JOURNAL ENTRY DIALOG (7)
      addNewJournalEntryDialog: false,

      // ******************** / New Transactions Dialogs Data ********************

      // ******************** Data Tables Data ********************
      search: '',
      sales_selected: [],
      sales_headers: [
        { text: 'Date', value: 'invoice_date', align: 'start' },
        { text: 'Customer', value: 'customer' },
        { text: 'Due Date', value: 'due_date' },
        { text: 'Before Tax', value: 'sub_total' },
        { text: 'Tax', value: 'vat_total' },
        { text: 'Total', value: 'total' },
        { text: 'Status', value: 'paid', align: 'center' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      sales_data: [
        {
          id: 0,
          date: '23-01-2022',
          customer: 'Soylent Corp',
          type: 'Invoice',
          dueDate: '18-01-2022',
          b_tax: 'AED 65,500',
          tax: 'Exempt -0%',
          total: 'AED 65,500',
          status: 'paid',
          color: '#1AD598',
          action: '',
        },
        {
          id: 1,
          date: '24-01-2022',
          customer: 'BGoylent Corp',
          type: 'Invoice',
          dueDate: '18-01-2022',
          b_tax: 'AED 65,500',
          tax: 'Exempt -0%',
          total: 'AED 65,500',
          status: 'closed',
          color: '#FFB536',
          action: '',
        },
        {
          id: 2,
          date: '26-01-2022',
          customer: 'Mylent Corp',
          type: 'Invoice',
          dueDate: '18-01-2022',
          b_tax: 'AED 65,500',
          tax: 'Exempt -0%',
          total: 'AED 65,500',
          status: 'converted',
          color: '#0A94FF',
          action: '',
        },
        {
          id: 3,
          date: '26-01-2022',
          customer: 'Lif Corp',
          type: 'Invoice',
          dueDate: '18-01-2022',
          b_tax: 'AED 65,500',
          tax: 'Exempt -0%',
          total: 'AED 65,500',
          status: 'partially paid',
          color: '#895BF1',
          action: '',
        },
      ],
      all_sales_data: [
        {
          no: '1001',
          data: '22-05-2022',
          customer: 'bushra aboubida',
          amount: '5,730.00',
          type: 'invoice',
          status: 'paid',
        },
        {
          no: '1002',
          data: '22-05-2022',
          customer: 'bushra aboubida',
          amount: '7,730.00',
          type: 'payment',
          status: 'paid',
        },
      ],

      // FILTER DIALOG
      filterDialog: false,
      filter_by: [
        'All',
        'Week to date',
        'This month to date',
        'This quarter to date',
        'This year to date',
        'Specific dates',
      ],
      customerFilter: ['All', 'Other'],
      statusFilter: ['Paid', 'Unpaid'],
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      monthsOfYear: ['Jan', 'Feb', 'Mar', 'Apr'],
      Years: [2022, 2021, 2020],
      customDataDisabled: true,
      // ******************** / Data Tables Data ********************

      // ******************** Others Data ********************
      all_customers: [
        'Soylent Corp',
        'BGoylent Corp',
        'Mylent Corp',
        'Lif Corp',
      ], // all_customer is coming from customer page
      // NEW TRANSACTION MENU
      new_transaction_menu: [
        { title: 'Invoice', value: 'invoice' },
        { title: 'Payment', value: 'payment' },
        { title: 'Estimate', value: 'estimate' },
        { title: 'Sales Reciept', value: 'sales_reciept' },
        { title: 'Tax Credit Note', value: 'tax_credit' },
        { title: 'Time Activity', value: 'time_activity' },
        { title: 'Journal Entry', value: 'journal_entry' },
      ],
      total_sales: [
        { name: 'Total Sales', num: '06', amount: '0' },
        { name: 'Overdue - Unpaid Invoices', num: '0', amount: '0' },
        { name: 'Invoices Paid In', num: '0', amount: '0' },
      ],
    }
  },
  methods: {
    handleAddNewPayment() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Payment Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewPaymentDialog = false
    },

    handleSaveInvoice(value) {
      this.snackbar_data = {
        snackbar: true,
        text: 'Invoices Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewInvoiceDialog = false
    },

    handleSavePayment() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Payment Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewPaymentDialog = false
    },

    handleSaveEstimate() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Estimate Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewEstimateDialog = false
    },

    handleSaveSalesRecieptDialog() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Sales Reciept Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewSalesRecieptDialog = false
    },

    handleSaveTaxCreditNoteDialog() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Tax Credit Note Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewTaxCreditNoteDialog = false
    },

    handleSaveTimeActivityDialog() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Time Activity Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewTimeActivityDialog = false
    },

    handleSaveJournalEntryDialog() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Journal Entry Added Successfully',
        color: 'success',
        timeout: 2000,
      }
      this.addNewJournalEntryDialog = false
    },

    handleAddInvoiceToThePreviewTable(value) {
      this.new_invoice_data.push(this.new_invoice)
      this.new_invoice = {}
    },

    handleShowInvoice() {
      this.addNewInvoicePreviewTableData.push({
        no: '#',
        service: '0-0-2020',
        product: 'ERP',
        description: 'lorem ipsum..',
        qty: '1',
        rate: '1044',
        amount: '20,890',
        tax: '1%',
      })
      this.invoices_data.push(this.addNewInvoicePreviewTableData)
    },

    handleApplyFilter() {
      this.filterDialog = false
    },

    clear() {
      this.new_invoice = {}
    },

    async handleData(field) {
      const { page, itemsPerPage } = this.options
      let pageNumber = page - 1
      var data = {
        page: pageNumber,
        search: this.search,
        limit: itemsPerPage,
      }
      field && (data[field.name] = field.value)
      await this.fetchInvoices(data)
    },

    async fetchInvoices({ page = 0, type, search = '', limit = 10 }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const list = this.companySelection.map((item) => item.id)

      const payload = { company: list }
      await this.$axios
        .$post(
          `invoice/all?&search=${search}&limit=${limit}&page=${page}`,
          payload,
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { invoices, total_page, total_count } = res.data
          this.invoices = invoices
          this.totalPage = total_page
          this.totalCount = total_count
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },

    handleNewTransaction(value) {
      // user clicked selection from new transaction menu
      // this.user_selected_transaction_dialog = value
      // console.log('User Dialog Clicked: ', this.selected_transaction)
      if (value == 'Invoice') {
        this.addNewInvoiceDialog = !this.addNewInvoiceDialog
      } else if (value == 'Payment') {
        this.addNewPaymentDialog = !this.addNewPaymentDialog
      } else if (value == 'Estimate') {
        this.addNewEstimateDialog = !this.addNewEstimateDialog
      } else if (value == 'Sales Reciept') {
        this.addNewSalesRecieptDialog = !this.addNewSalesRecieptDialog
      } else if (value == 'Tax Credit Note') {
        this.addNewTaxCreditNoteDialog = !this.addNewTaxCreditNoteDialog
      } else if (value == 'Time Activity') {
        this.addNewTimeActivityDialog = !this.addNewTimeActivityDialog
      } else if (value == 'Journal Entry') {
        this.addNewJournalEntryDialog = !this.addNewJournalEntryDialog
      }
    },
  },
  watch: {
    options: {
      handler() {
        this.handleData()
      },
      deep: true,
    },
  },
}
</script>
