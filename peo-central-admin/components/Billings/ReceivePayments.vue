<template>
  <v-card id="card" style="margin-bottom: 1rem !important;" scrollable>
    <v-container fluid>
      <v-card-title id="card-title">
        <h4 class="text--text">Receive Payments</h4>
        <div class="flex_row justify-lg-space-between">
          <v-btn class="tall__btn mr-2 px-8" color="lightgray" outlined @click="closeEstimate()">Cancel</v-btn>
          <v-img src="/animated/ring.svg" v-if="submitLoading" max-width="30" height="30" contain></v-img>
          <v-btn class="tall__btn px-8" color="primary" @click="receivePayments()" v-else>Receive</v-btn>
        </div>
      </v-card-title>
      <v-row
        class="not_recurring_row_3 py-0 my-0 d-flex"
        style="gap: 20px"
      >
        <v-form
          ref="estimateForm"
          v-model="valid"
          lazy-validation
          class="row"
        >
          <v-col
            cols="12"
            class="px-0"
            style="height: fit-content"
            gap="2"
          >
            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="Employer" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="invoiceObj.customer_name"
                      placeholder="Current Company"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      :style="{ color: '#000000 !important' }"
                      :rules="main_rule"
                      disabled
                    >
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer
                  label="Employer Email"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="invoiceObj.email"
                      placeholder="Enter Email"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <CustomInputContainer label="Payment Date" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="payment_date"
                      placeholder="Payment Date"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      :style="{ color: '#000000 !important' }"
                      :rules="main_rule"
                      disabled
                    >
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer
                  label="Reference Number"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="reference_number"
                      placeholder="Enter Reference Number"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Payment Method" :mandatory="true">
                  <div slot="input">
                    <v-autocomplete
                      v-model="payment_method"
                      :items="payment_methods"
                      placeholder="Select Payment Method"
                      solo
                      dense
                      class="proposalDialog_date_field2"
                      clearable
                    >
                    </v-autocomplete>
                  </div>
                </CustomInputContainer>
              </v-col>

            </v-row>
            <v-row>
              <v-col cols="6">
                <CustomInputContainer
                  label="Deposit To"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="deposit_to"
                      placeholder="Deposit To"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <h4>Outstanding Transactions</h4>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="Search Invoice">
                  <div slot="input">
                    <v-text-field
                      v-model="search_invoice"
                      placeholder="Find By Invoice Number"
                      solo
                      dense
                      clearable
                      prepend-inner-icon="mdi-magnify"
                      hide-details
                      :style="{ color: '#000000 !important' }"
                      class="proposalDialog_date_field2"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <CustomInputContainer>
                  <div slot="input">
                    <v-data-table
                      v-model="selected"
                      :headers="headers"
                      :items="sortedInvoices"
                      :items-per-page="10"
                      show-select
                      :loading="isLoading"
                      class="main__table elevation-0 document_table"
                      :style="{ color: '#000000 !important' }"
                      dense
                    >
                      <template v-slot:loading>
                        <v-skeleton-loader
                          v-for="i in 3"
                          :key="i"
                          type="table-row"
                          class="mb-2"
                        ></v-skeleton-loader>
                      </template>
                      <template v-slot:item.description="{ item }">
                      <a
                        href="#"
                        @click.prevent="handleDescriptionClick(item)"
                        class="text-decoration-none"
                        >
                        {{ item.invoice_number }}
                        </a>
                      </template>

                      <template v-slot:item.due_date="{ item }">
                        {{ formatDate(item.due_date) }}
                      </template>


                      <template v-slot:item.amount_due="{ item }">
                        <span class="font-weight-medium">{{ formatCurrency(item.amount_due) }}</span>
                      </template>


                      <template v-slot:item.total="{ item }">
                        <span class="font-weight-medium">{{ formatCurrency(item.total) }}</span>
                      </template>


                      <template v-slot:item.paid_amount="{ item }">
                        <span class="font-weight-medium">{{ formatCurrency(item.paid_amount) }}</span>
                      </template>


                      <template v-slot:item.received_amount="{ item }">
                        <v-text-field
                          v-model="item.received_amount"
                          solo
                          dense
                          prefix="AED"
                          type="number"
                          step="0.01"
                          min="0"
                          :max="item.total"
                          hide-details
                          class="proposalDialog_date_field2 currency-input"
                          :class="{ 'error-input': isAmountExceeded(item) }"
                          :style="{ color: '#000000 !important' }"
                          @input="validateAmount($event, item)"
                          @blur="formatCurrencyAmount(item)"
                        ></v-text-field>
                      </template>
                    </v-data-table>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

          </v-col>

        </v-form>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import PreviewDocument from '@/components/utils/PreviewDocument.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import CreditNote from './CreditNote.vue'
import moment from 'moment'

export default {
  layout: 'dashboard',
  props: {
    selectedBilling: Object,
    handleModel: Function,
  },
  components: {
    CustomInputContainer,
    SnackBar,
    PreviewDocument,
    CalenderSvg,
    CreditNote
  },
  mounted(){

  },

  computed: {
    computedSubTotal() {
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const amount = parseFloat(item.amount)

        if (!isNaN(amount)) {
          total += amount
        }
      }
      return total
    },
    computedDiscount() {
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const amount = parseFloat(item.discount)

        if (isNaN(amount)) {
          total += amount
        }
      }
      return total
    },
    computedVATAmount() {
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const amount = parseFloat(item.vat_amount)

        if (!isNaN(amount)) {
          total += amount
        }
      }
      return total
    },
    computedTotal() {
      return (
        this.computedSubTotal + this.computedDiscount + this.computedVATAmount
      )
    },
    initialSelectedInvoices() {
      return this.invoices.filter(invoice =>
        invoice.invoice_number === this.selectedBilling.invoice_number
      );
    },
    sortedInvoices() {
      return [...this.invoices].sort((a, b) => {
        if (a.invoice_number === this.selectedBilling.invoice_number) return -1;
        if (b.invoice_number === this.selectedBilling.invoice_number) return 1;
        return 0;
      });
    }
  },
  data() {
    return {
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      main_rule: [(v) => !!v || 'This filed is required'],
      valid: true,
      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      timesheet: null,
      timesheet_url: null,
      confirmDialog: false,
      payment_date: new Date().toISOString().substr(0, 10),
      reference_number: '',
      deposit_to: '',
      isLoading: false,
      payment_method: null,
      payment_methods: [
        'Cash',
        'Cheque',
        'Bank Transfer'
      ],
      search_invoice: '',
      selected: [],
      headers: [
        {
          text: 'Description',
          align: 'start',
          sortable: true,
          value: 'description',
        },
        {
          text: 'Due Date',
          value: 'due_date',
          align: 'center'
        },
        {
          text: 'Amount Due',
          value: 'amount_due',
          align: 'end'
        },
        {
          text: 'Original Amount',
          value: 'total',
          align: 'end'
        },
        {
          text: 'Paid Amount',
          value: 'paid_amount',
          align: 'end'
        },
        {
          text: 'Received Amount',
          value: 'received_amount',
          align: 'end'
        },
      ],
      invoices: [
      ],
      originalInvoices: [],
      exp_date: new Date().toISOString().substr(0, 10),
      table_headers: [
        'Product/Service',
        'Description',
        'Rate',
        'Amount',
        'Tax Code',
        'VAT Rate %',
        'VAT Amount',
        'NET Total',
        'Actions',
      ],

      limit: '10',
      page: 0,
      employers: [],
      termsList: [],
      termsDays: '',
      taxCodesList: [],
      taxRate: '',
      invoiceObj: {
        customer: '',
        customer_name: '',
        customer_address: ' ',
        email: '',
        billing_address: '',
        shipping_address: '',
        terms: '',
        terms_name: '',
        memo: '',
        invoice_date: new Date().toISOString().substr(0, 10),
        due_date: '',
        sale_location: '',
        type: 'general invoice',
        items: [
          {
            id: '',
            service: '',
            service_name: '',
            description: '',
            quantity: '',
            rate: '',
            amount: '',
            discount: 0,
            tax_name: '',
            tax_code: '',
            vat_rate: '',
            vat_amount: '',
            net_total: '',
            type: 'Service',
            date: new Date().toISOString().substr(0, 10),
            isInventory: 'false',
            city: 'Dubai',
          },
        ],
        sub_total: '',
        vat_total: '',
        total: '',
        customer_notes: '',
        terms_condition: '',
        is_recurring: false,
        is_draft: false,
      },
      submitLoading: false,
    }
  },
  mounted() {
    this.invoiceObj = this.selectedBilling
    this.getEmployersList()
    this.getTermsList()
    this.getTaxCodeList()
    this.getCompanyInvoices()
  },
  methods: {
    async getEmployersList() {
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token);

      try {
        const response = await this.$axios.$post(`/companies/list/filter/search?page=1&limit=100000`,{
          search: ""
        }, {
          headers: { Authorization: AuthStr }
        });
        console.log("The response now ", response);
        this.employers = response;
      } catch (error) {
        console.error("Error fetching employers list:", error);
      }
    },
    async getTermsList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/terms`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.termsList = response
        })
    },
    async getTaxCodeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/taxcodes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.taxCodesList = response
        })
    },
    changeEmail(customer) {
      console.log("Who is the customer", customer)
      const employer = this.employers.find((a) => a._id === customer);

      if (employer) {
        this.invoiceObj.customer_name = employer.company_name || 'N/A';
        this.invoiceObj.email = employer.email || 'N/A';
        console.log("This is the employer", employer)

        const formatAddress = (address) => {
          console.log("What is the address", address)
          const addressLines = [
            address.address_line1 ? address.address_line1 : 'N/A',
            address.address_line2 ? address.address_line2 : 'N/A',
            `${address.city ? address.city : ''}${address.state ? `, ${address.state}` : ''} ${address.zip ? address.zip : ''}`,
            address.country
          ].filter(line => line.trim() !== '');

          return addressLines.join('\n');
        };
        if (employer.billing_address && employer.shippn)
          this.invoiceObj.billing_address = formatAddress(employer.billing_address);
        this.invoiceObj.shipping_address = formatAddress(employer.shipping_address);
      }
    },
    getTermsName(terms) {
      this.invoiceObj.terms_name = this.termsList.filter(
        (a) => a._id == terms
      )[0].name
      this.termsDays = this.termsList.filter((a) => a._id == terms)[0].days
        ? this.termsList.filter((a) => a._id == terms)[0].days
        : '0'
      this.invoiceObj.due_date = this.generateFutureDate(this.termsDays)
    },
    getTaxRate(tax_id, index) {
      this.taxRate = this.taxCodesList.filter((a) => a._id == tax_id)[0].rate
        ? this.taxCodesList.filter((a) => a._id == tax_id)[0].rate
        : '0'

      this.invoiceObj.items[index].tax_name = this.taxCodesList.filter(
        (a) => a._id == tax_id
      )[0].name
        ? this.taxCodesList.filter((a) => a._id == tax_id)[0].name
        : ''
      this.invoiceObj.items[index].vat_rate = this.taxRate
      this.invoiceObj.items[index].vat_amount = this.calculatePercentage(
        this.taxRate,
        this.invoiceObj.items[index].amount
      )
      this.invoiceObj.items[index].net_total = this.addNumbers(
        this.invoiceObj.items[index].amount,
        this.invoiceObj.items[index].vat_amount
      )
    },
    assignAmountValue(rate, index) {
      this.invoiceObj.items[index].amount = rate
      this.invoiceObj.items[index].vat_amount = this.calculatePercentage(
        this.taxRate,
        this.invoiceObj.items[index].amount
      )
      this.invoiceObj.items[index].net_total = this.addNumbers(
        this.invoiceObj.items[index].amount,
        this.invoiceObj.items[index].vat_amount
      )
    },
    generateFutureDate(days) {
      const today = new Date() // Get the current date
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000) // Add the specified number of days

      return futureDate.toISOString().substr(0, 10) // Return the future date in a readable format
    },
    calculatePercentage(percent, number) {
      return (percent / 100) * number
    },
    addNumbers(num1, num2) {
      const parsedNum1 = parseFloat(num1)
      const parsedNum2 = parseFloat(num2)

      return parsedNum1 + parsedNum2
    },
    closeEstimate() {
      this.$emit('close')
    },
    getSelectedInvoicesAmounts() {
      return this.selected.map(item => ({
        invoice_id: item.id,
        received_amount: item.received_amount || 0
      }));
    },
    async receivePayments(){
      try {
        let AuthStr = 'Bearer '.concat(this.$store.state.token)
        let selected_items = this.getSelectedInvoicesAmounts()
        // console.log("These are the selected items", selected_items)
      //   TODO: Make APi Call
      } catch (error){
        throw new Error(error)
      }
    },

    async getCompanyInvoices(){

      this.isLoading = true;
      console.log("This is the selected billing item", this.selectedBilling)
      try {
        let AuthStr = 'Bearer '.concat(this.$store.state.token)
        let response = await this.$axios.$post(
          `/invoice/list?page=${this.page}&limit=1000`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        console.log("The response is ", response.results)
        this.invoices = response.results.filter((invoice) =>
          invoice.customer === this.selectedBilling.customer
        );
        this.originalInvoices = this.invoices
        console.log("The invoices are", this.invoices)
        return this.invoices
      } catch (error){
        throw new Error(error.message)
      } finally {
        this.isLoading = false
      }
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    formatCurrency(value) {
      if (value === null || value === undefined) return 'AED 0.00';
      return `AED ${parseFloat(value).toFixed(2)}`;
    },
    handleAddProduct() {
      this.handleAddProductAt(this.invoiceObj.items.length);
    },

    handleAddProductAt(index) {
      const newItem = {
        id: '',
        service: '',
        service_name: '',
        quantity: '',
        rate: '',
        amount: '',
        discount: 0,
        tax_name: '',
        tax_code: '',
        vat_rate: '',
        vat_amount: '',
        net_total: '',
        type: 'Service',
        date: new Date().toISOString().substr(0, 10),
        isInventory: 'false',
        city: 'Dubai',
      };

      this.invoiceObj.items.splice(index, 0, newItem);
    },
    handleDeleteProduct(index) {
      this.invoiceObj.items.splice(index, 1)
    },
    handleFileUpload() {
      if (this.timesheet) {
        this.confirmDialog = true;
      }
    },
    async confirmUpload() {
      this.confirmDialog = false;

      const formData = new FormData();
      formData.append('file', this.timesheet);

      try {
        const response = await this.$axios.post('/documents/mimetype/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.timesheet_url = response?.url
        this.timesheet = null;
      } catch (error) {
        console.error(error);
      }
    },
    handleDescriptionClick(item) {
      console.log('Description clicked:', item)
    },
    validateAmount(value, item) {
      let formattedValue = value.toString().replace(/[^\d.]/g, '');
      const parts = formattedValue.split('.');
      if (parts.length > 2) {
        formattedValue = parts[0] + '.' + parts.slice(1).join('');
      }

      if (parts[1]?.length > 2) {
        formattedValue = parseFloat(formattedValue).toFixed(2);
      }

      const numericValue = parseFloat(formattedValue);

      if (numericValue > item.amount_due) {
        console.error("The amount is excess")
        formattedValue = item.amount_due.toFixed(2);
      }

      item.received_amount = formattedValue;
    },

    formatCurrencyAmount(item) {
      if (item.received_amount) {
        item.received_amount = parseFloat(item.received_amount).toFixed(2);
      }
    },
    isAmountExceeded(item) {
      return parseFloat(item.received_amount) > item.amount_due;
    }
  },
  watch: {
    search_invoice(val) {
      if (!val) {
        this.invoices = this.originalInvoices;
      } else {
        this.invoices = this.originalInvoices.filter(invoice =>
          invoice.invoice_number.toLowerCase().includes(val.toLowerCase())
        );
      }
    },
    invoices: {
      immediate: true,
      handler(newInvoices) {
        this.selected = this.initialSelectedInvoices;
      }
    }
  },
}
</script>
<style lang="scss">
.dynamic_table {
  .dynamic_table_thead {
    tr {
      background: #e2e7f180 !important;
    }
  }

  .dynamic_table_tbody {
    .dynamic_table_body_rows {
      // border-bottom: 0.5 solid red !important;
      &:hover {
        background: #e2e7f142 !important;
      }
    }
  }
}

.estimate__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  width: 400px;
  // height: 120px;
}
.hover-area {
  height: 10px;
  transition: background-color 0.2s;
}
.currency-input ::v-deep .v-input__slot {
  min-height: 32px !important;
  border-radius: 4px !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  box-shadow: none !important;
}

.currency-input.error-input ::v-deep .v-input__slot {
  border-color: #ff5252 !important;
}

.currency-input ::v-deep .v-input__slot:hover {
  border-color: rgba(0, 0, 0, 0.24) !important;
}

.currency-input ::v-deep .v-input__slot:focus-within {
  border-color: var(--v-primary-base) !important;
}

.error-input ::v-deep .v-input__slot:focus-within {
  border-color: #ff5252 !important;
}

.currency-input ::v-deep input {
  padding: 4px 8px !important;
  text-align: right;
}

.currency-input ::v-deep .v-input__prepend-inner {
  margin-top: 6px !important;
  padding-right: 0 !important;
}
</style>
