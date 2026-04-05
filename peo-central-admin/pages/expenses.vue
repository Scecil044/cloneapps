<template>
  <div class="expenses_wrapper">
    <SnackBar :data="snackbar_data" />
    <AllExpenses
      v-if="currentTab == 'all' && accountsLoaded == true"
      :companies="companies"
      :accountLIst="accountLIst"
      :supplierCustomers="supplierCustomers"
      :taxCodes="taxCodes"
      :vatCodes="vatCodes"
    />
    <Suppliers
      v-if="currentTab == 'suppliers'"
      :companies="companies"
      :accountLIst="accountLIst"
      :supplierCustomers="supplierCustomers"
      :taxCodes="taxCodes"
      :vatCodes="vatCodes"
    />
    <Forecast v-if="currentTab == 'forecast'" />
    <ExpenseBreakdown v-if="currentTab == 'breakdown'" />
    <Reimbursement v-if="currentTab == 'reimbursement'" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import '@/assets/scss/_expenses.scss'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
import LightArrow from '@/assets/images/White-Light-Arrow-icon.svg'
import AllExpenses from '@/components/Expenses/AllExpenses.vue'
import Suppliers from '@/components/Expenses/Suppliers.vue'
import Reimbursement from '@/components/Expenses/Reimbursement.vue'
import ExpenseBreakdown from '@/components/Expenses/ExpenseBreakdown.vue'
import Forecast from '@/components/Expenses/Forecast/Forecast.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

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
    CustomInputContainer,
  },
  data() {
    return {
      companies: [],
      // SNACKBAR
      snackbar_data: {
        snackbar: false,
        text: 'Successfully',
        color: 'success',
        timeout: 2000,
      },

      // INVOICE VIEW
      invoiceView: false,

      // FILTER
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

      forecast_titles: [
        { name: 'Sales', color: 'accent2' },
        { name: 'Forecasted sales', color: 'accent1' },
        { name: 'Reoccurring Revenue', color: 'primary' },
        { name: 'Sales Target', color: 'accent3' },
      ],
      breakdown_data: [
        {
          name: 'Business',
          amount: '35.1k',
          percentage: '43',
          color: 'accent2',
        },
        {
          name: 'Office maintained',
          amount: '5.1k',
          percentage: '30',
          color: 'primary',
        },
        { name: 'Salary', amount: '102k', percentage: '25', color: 'accent4' },
        { name: 'DEWA', amount: '10k', percentage: '2', color: 'accent1' },
        {
          name: 'Office Rent',
          amount: '10k',
          percentage: '5',
          color: 'accent3',
        },
      ],
      currentTab: 'all',
      new_transaction_menu: [
        { title: 'Invoice', value: 'invoice' },
        { title: 'Payment', value: 'payment' },
        { title: 'Estimate', value: 'estimate' },
        { title: 'Sales Reciept', value: 'sales_reciept' },
        { title: 'Tax Credit Note', value: 'tax_credit' },
        { title: 'Time Activity', value: 'time_activity' },
        { title: 'Journal Entry', value: 'journal_entry' },
      ],

      // Expenses
      expenses_search: '',
      expenses_selected: [],
      expenses_data: [
        {
          id: 0,
          dueDate: '12-07-2022',
          type: 'Business Expense',
          payee: 'Payee',
          category: 'Bank',
          tax: 'Exempt -0%',
          total: '1050',
          color: '#1AD598',
          action: '',
        },
      ],
      expenses_headers: [
        { text: 'Due Date', value: 'dueDate' },
        { text: 'Type', value: 'type' },
        { text: 'Payee', value: 'payee' },
        { text: 'Category', value: 'category' },
        { text: 'Tax', value: 'tax' },
        { text: 'Total Amount', value: 'total' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      total_expenses: [
        { name: 'Total Expenses (10)', amount: '109,186' },
        { name: 'Approved Expenses (10)', amount: '540,500' },
        { name: 'Paid Expenses (5)', amount: '3,27,970.0' },
        { name: 'New expense this week (15)', amount: '540,500' },
      ],

      // Suppliers
      suppliers_search: '',
      suppliers_selected: [],
      suppliers_data: [
        {
          id: 0,
          supplier: 'Globex Corp',
          w_phone: '+97 52 365 9885',
          h_phone: '+97 52 365 9885',
          email: 'contact@globexcorp.com',
          color: '#1AD598',
          action: '',
        },
      ],
      suppliers_headers: [
        { text: 'Supplier/Company', value: 'supplier' },
        { text: 'Work Phone', value: 'w_phone' },
        { text: 'Home Phone', value: 'h_phone' },
        { text: 'Email', value: 'email' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      total_suppliers: [
        { name: 'Purchase Order (15)', amount: '0' },
        { name: 'Overdue (10)', amount: '10,500' },
        { name: 'Open bill (5)', amount: '300,137' },
        { name: '1 Paid in the last 30 days (15)', amount: '604,200' },
      ],

      // Forecast
      forecast_search: '',
      forecast_selected: [],
      forecast_data: [
        {
          id: 0,
          date: '12-12-2022',
          expense: 'Rent',
          value: 'AED8,000',
          status: 'paid',
          color: '#1AD598',
          action: '',
        },
      ],
      forecast_headers: [
        { text: 'Date', value: 'date' },
        { text: 'Expense', value: 'expense' },
        { text: 'Value', value: 'value' },
        { text: 'Status', value: 'status' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      total_forecast: [
        { name: 'Expense forecast (Year End)', amount: '2,150,523' },
      ],

      // Reimbursement
      reimbursement_search: '',
      reimbursement_selected: [],
      reimbursement_data: [
        {
          id: 0,
          employee: 'Apollo Nida',
          type: 'Reimbursement expense',
          memo: 'Client meeting- saudi',
          date: '00-00-0000',
          amount: 'AED 5232',
          status: 'paid',
          color: '#1AD598',
          action: '',
        },
      ],
      reimbursement_headers: [
        { text: 'Employee', value: 'employee' },
        { text: 'Type', value: 'type' },
        { text: 'Memo', value: 'memo' },
        { text: 'Request Date', value: 'date' },
        { text: 'Amount', value: 'amount' },
        { text: 'Status', value: 'status' },
        { text: 'Action', value: 'action', sortable: false, align: 'center' },
      ],
      total_reimbursement: [
        { name: 'Total Reimbursement this year', amount: '06' },
        { name: 'Most Reimbursed category', amount: '-' },
        { name: 'Avg Reimbursement', amount: '0' },
      ],
      selectedCustomer: {},
      customers_list: [],
      accountLIst: [],
      supplierCustomers: [],
      accountsLoaded: false,
      taxCodes: [],
      vatCodes: {},
    }
  },
  watch: {
    companySelection: {
      handler() {
        console.log('ok')
        this.customers_list = []
        this.selectedCustomer = {}
        this.fetchAccountList()
        if (this.companySelection.length > 1) {
          this.companyLable = true
          this.companies = this.companySelection
        } else {
          this.companyLable = false
          this.companies = this.companySelection[0]
        }
      },
    },
    deep: true,
  },
  created() {
    this.$nuxt.$on('tabChanged', ($event) => {
      this.changeTab($event)
    })
    this.$nuxt.$on('supplierAddFormSubmitted', ($event) => {
      this.changeTab('all')
    })
  },
  beforeDestroy() {
    this.$nuxt.$off('tabChanged')
    this.$nuxt.$off('supplierAddFormSubmitted')
  },
  mounted() {
    if (this.companySelection.length > 1) {
      this.companyLable = true
      this.companies = this.companySelection
    } else {
      this.companyLable = false
      this.companies = this.companySelection[0]
    }
    this.fetchAccountList()
    this.fetchTaxCodes()
    this.fetchVatCodes()
  },
  methods: {
    async fetchVatCodes() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `account/account-by-code`,
          { code: 'VP' },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const vatCodes = res.data

          this.vatCodes = vatCodes
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },
    async fetchTaxCodes() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `tax-code/list`,
          { company: this.companySelection.map((item) => item.id) },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const taxCodes = res.data.taxCodes

          this.taxCodes = taxCodes
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
    async fetchAllSupplierCustomer() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `supplier/list-all-supplier-customer`,
          {
            company: this.companySelection.map((item) => item.id),
            conditionSupplier: true,
          },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const customers = res.data
          this.supplierCustomers = customers
          console.log(this.supplierCustomers)
          this.accountsLoaded = true
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
    async fetchAccountList() {
      this.accountsLoaded = false
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `account/list`,
          { company: this.companySelection.map((item) => item.id) },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { accounts } = res.data
          this.accountLIst = accounts

          this.fetchAllSupplierCustomer()
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

    handlePrint() {
      this.snackbar_data = {
        snackbar: true,
        text: 'Printed Successfully',
        color: 'success',
        timeout: 2000,
      }
    },
    handleInvoiceView() {
      this.invoiceView = true
    },
    handleApplyFilter() {
      this.filterDialog = false
    },
    changeTab(event) {
      console.log('Ex Clicked Tab is =>', event)
      this.currentTab = event
    },
  },
  computed: {
    ...mapState(['companySelection']),
    ...mapGetters([
      'getCustomers',
      'getParentSelectedCompanyId',
      'getParentSelectedCompanyName',
    ]),

    computedTab() {},
  },
}
</script>
