<template>
  <!-- Create Onboarding  Dialog -->
  <v-dialog
    v-model="open"
    max-width="700px"
    persistent
    height="100vh"
    content-class="proposal_dialog"
  >
    <v-card class="rounded-xl pa-0 pt-0" flat height="100vh" style="display: flex; flex-direction: column;">
      <v-form ref="paymentForm" lazy-validation style="display: flex; flex-direction: column; height: 100%;">
        <!-- Fixed Header -->
        <div class="tw-flex-shrink-0">
          <v-row class="tw-px-3 tw-py-2">
            <div class="tw-flex tw-items-center">
              <v-img
                src="/shift/build.svg"
                max-width="fit-content"
                height="fit-content"
                class="tw-mr-2"
                contain
              ></v-img>
              <span
                class="darkBlue-heading-text font-weight-normal subHeadingFontSize"
              >
                Bulk Invoice Payment</span
              >
            </div>
            <v-spacer />
            <v-btn @click="close" outlined icon color="red accent-4">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-alert v-if="alert_info.should_show_status" dense text :type="alert_info.success ? 'success' : 'error'">
              {{ alert_info.message }}
            </v-alert>

          <v-alert v-if="selectedInvoices && selectedInvoices.length > 0" dense text type="info">
            Processing {{ selectedInvoices.length }} selected invoice(s) for bulk payment
          </v-alert>
        </div>

        <!-- Scrollable Content -->
        <v-card-text class="tw-flex-grow tw-overflow-y-auto" style="flex: 1; overflow-y: auto;">
          <v-row class="py-0 px-0">
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Select Client" :mandatory="true">
                <template v-slot:input>
                  <v-autocomplete
                    :items="employers"
                    v-model="paymentDetails.customer"
                    placeholder="Search and select company..."
                    class="proposalDialog_date_field2"
                    solo
                    dense
                    item-text="company_name"
                    item-value="_id"
                    :rules="genericRule"
                    :loading="loading_clients"
                    @change="handleClientChange"
                    :disabled="selectedInvoices && selectedInvoices.length > 0"
                    clearable
                    no-data-text="No companies found"
                    :filter="customFilter"
                  >
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>{{ item.company_name }}</v-list-item-title>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </template>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Visa Sponsorship Type" :mandatory="true">
                <template v-slot:input>
                  <v-select
                    :items="visa_sponsorships"
                    v-model="selected_sponsorship"
                    class="proposalDialog_date_field2"
                    solo
                    dense
                    :loading="loading_clients"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </template>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Currency" :mandatory="false">
                <template v-slot:input>
                  <v-select
                    :items="currencyOptions"
                    v-model="selectedCurrency"
                    placeholder="Select Currency (defaults to AED)"
                    class="proposalDialog_date_field2"
                    solo
                    dense
                    append-icon="fa-chevron-down"
                    @change="handleCurrencyChange"
                    clearable
                  >
                  </v-select>
                </template>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Select Invoices" :mandatory="false">
                <template v-slot:input>
                  <v-select
                    :items="computedCompanyInvoices"
                    v-model="paymentDetails.invoices"
                    placeholder="INV-XXXX"
                    class="proposalDialog_date_field2"
                    solo
                    dense
                    multiple
                    @change="handleInvoiceSelection"
                    item-text="invoice_number"
                    item-value="_id"
                    :rules="genericRule"
                    :loading="loading_company_invoices"
                    append-icon="fa-chevron-down"
                    :disabled="selectedInvoices && selectedInvoices.length > 0"
                  >
                  </v-select>
                </template>
              </CustomInputContainer>
            </v-col>
            <v-col
              cols="12"
              class="tw-border tw-border-gray-300  tw-rounded-md tw-px-2 tw-py-3 tw-mb-5 pl-0"
              v-if="invoice_amounts_mapping.length"
            >
              <v-row
                align="center"
                v-for="invoice in invoice_amounts_mapping"
                :key="invoice.invoice_number"
              >
                <v-col cols="6" class="py-0">
                  <div class="tw-font-medium">
                    Amount  to settle
                  </div>
                  <div class="tw-font-semibold">
                    {{ invoice.invoice_number }}
                  </div>
                </v-col>
                <v-col cols="6" class="pl-0 py-0">
                  <CustomInputContainer
                    :label="`Payment Amount - (${formatAmount(invoice.maxAmount) })`"
                    :mandatory="true"
                  >
                    <div slot="input">
                      <v-text-field
                        class="inputField"
                        type="number"
                        v-model="invoice.amount"
                        :placeholder="`${formatToTwoDecimals(invoice.amount)}`"
                        solo
                        dense
                        @input="invoice.amount = formatToTwoDecimals($event)"
                        :rules="[
                          value => !!value || 'Amount is required',
                          value => parseFloat(value) > 0 || `Amount must not be negative`,
                          value => parseFloat(value) <= parseFloat(invoice.maxAmount) || `Amount must not exceed ${formatToTwoDecimals(invoice.maxAmount)}`
                        ]"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Ref No." :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    v-model="paymentDetails.reference"
                    placeholder="Enter Reference Number"
                    solo
                    dense
                    :rules="genericRule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="py-0 pl-0">
              <CustomInputContainer label="Payment Date" :mandatory="true">
                <div slot="input">
                  <v-menu
                    v-model="date_menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        class="inputField"
                        v-model="paymentDetails.payment_date"
                        :rules="genericRule"
                        placeholder="DD/MM/YYYY"
                        outlined
                        dense
                        solo
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="paymentDetails.payment_date"
                      @input="date_menu = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Payment Method" :mandatory="true">
                <div slot="input">
                  <v-select
                    v-model="paymentDetails.payment_method"
                    :items="paymentMethodList"
                    placeholder="Select Payment Method"
                    outlined
                    dense
                    :rules="genericRule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer :label="`Bank Charges (${selectedCurrency || 'AED'})`" :mandatory="false">
                <div slot="input">
                  <v-text-field
                                            v-model="paymentDetails.charges"
                        :placeholder="`Enter charges in ${selectedCurrency || 'AED'}`"
                        @input="paymentDetails.charges = Number($event).toFixed(2)"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    min="0"
                    :rules="optionalNumberRule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col
              cols="6"
              v-if="
                ['Bank Transfer', 'Payment Link'].includes(
                  paymentDetails.payment_method
                )
              "
              class="pl-0 py-0"
            >
              <CustomInputContainer
                :label="getInputLabel(paymentDetails.payment_method)"
              >
                <div slot="input">
                  <v-select
                    v-if="paymentDetails.payment_method == 'Bank Transfer'"
                    v-model="
                    paymentDetails[
                        getInputLabel(paymentDetails.payment_method)
                          .toLowerCase()
                          .split(' ')
                          .join('_')
                      ]"
                    :items="computedBankList"
                    outlined
                    solo
                    dense
                    class="inputField"
                    :rules="genericRule"
                  />
                  <v-text-field
                    v-else
                    class="inputField"
                    :rules="genericRule"
                    v-model="
                       paymentDetails[
                        getInputLabel(paymentDetails.payment_method)
                          .toLowerCase()
                          .split(' ')
                          .join('_')
                      ]
                    "
                    solo
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="6" v-if="paymentDetails.payment_method === 'Others'" class="pl-0 py-0">
              <CustomInputContainer label="Remarks" :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    v-model="paymentDetails.remarks"
                    placeholder="Enter payment method details"
                    solo
                    dense
                    :rules="genericRule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>



            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer :label="`Amount Received (${selectedCurrency || 'AED'})`">
                <div slot="input">
                                      <v-text-field
                      class="inputField"
                      :rules="genericRule"
                      :disabled="true"
                      :value="formatToTwoDecimals(paymentDetails.total_payment_amount)"
                      :placeholder="`Enter amount in ${selectedCurrency || 'AED'}`"
                      solo
                      dense
                    />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="pl-0 pb-0">
              <CustomInputContainer label="Attachments">
                <div slot="input">
                  <div class="pt-2" v-if="!uploadFile">
                    <div
                      :class="['dropZone', dragging ? 'dropZone-over' : '']"
                      @dragenter="dragging = true"
                      @dragleave="dragging = false"
                    >
                      <div class="dropZone-info" @drag="onUploadFile">
                        <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
                        <span class="dropZone-title"
                          >Drop file or click to upload</span
                        >
                        <div class="dropZone-upload-limit-info">
                          <div>maximum file size: 10 MB</div>
                        </div>
                      </div>
                      <input type="file" @change="onUploadFile" />
                    </div>
                  </div>
                  <div v-else class="dropZone-uploaded">
                    <div class="dropZone-uploaded-info">
                      <span class="dropZone-title">Added</span>
                      <button
                        type="button"
                        class="btn btn-primary removeFile"
                        @click="removeFile('uploadDoc')"
                      >
                        Remove File
                      </button>
                    </div>
                  </div>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Fixed Footer -->
        <v-card-actions class="tw-flex-shrink-0 tw-py-5 tw-mt-3 tw-pr-4 tw-bg-white tw-border-t tw-border-gray-200">
          <v-spacer />
          <v-btn flat text :disabled="loading" @click="close" large
            ><span class="">Cancel</span></v-btn
          >

          <v-btn
            color="primary"
            outlined
            large
            :disabled="loading"
            :loading="loading"
            @click="generatePayment"
            >Create</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
export default {
  components: {
    CustomInputContainer,
  },
  props: {
    invoice_id: String,
    open: Boolean,
    selectedInvoices: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fileRules: [
        (v) => !!v || 'File is required',
        (v) => (v && v.size > 0) || 'File is required',
      ],
      genericRule: [(v) => !!v || 'This field is Required'],
      optionalNumberRule: [
        value => parseFloat(value) >= 0 || `Amount must not be negative`,
      ],
      paymentDetails: {
        customer: '',
        invoice: '',
        amount: '0.00',
        payment_date: '',
        payment_mode: '',
        invoices: [],
        invoice_id: '',
        payment_method: '',
        reference: '',
        invoice_ref_number: '',
        charges: '0.00',
        remarks: '',
        bank_name: '',
        payment_link: '',
      },
      date_menu: false,
      loading: false,
      dialogPayment: true,
      paymentMethodList: [
        'Cash',
        'Cheque',
        'Credit Card',
        'Direct Debit',
        'Bank Transfer',
        'Payment Link',
        'Others',
      ],

      //upload Documents

      uploadDocumentDialog: false,
      uploadFile: '',
      dragging: false,
      paymentAmount: 0,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      link_url: '',
      link_filename: '',
      attachFiles: {
        uploadDoc: {},
      },
      DynamicBankList: [
       'ADCB EUR',
        'ADCB USD',
        'ADCB AED',
        'EIB AED'
      ],
      ExecutiveBanksList: [
        'ADCB USD',
        'ADCB AED',
      ],
      invoice_payments: [],
      employers: [],
      loading_clients: false,
      loading_company_invoices: false,
      company_invoices: [],
      invoice_amounts_mapping: [],
      visa_sponsorships: [
        'Dynamic Employment Services',
        'Executive Employment Services'
      ],
      selected_sponsorship: 'Dynamic Employment Services',
      currencyOptions: ['AED', 'USD', 'EUR'],
      selectedCurrency: null, // null means show all currencies (backward compatibility)
      alert_info: {
        should_show_status: false,
        success: true,
        message: '',
      },
    }
  },
  computed: {
    computedBankList(){
      if (this.selected_sponsorship == 'Executive Employment Services') {
        return this.ExecutiveBanksList
      }
      return this.DynamicBankList
    },
    computedCompanyInvoices(){
      let filtered = this.company_invoices.filter(el => el.visa_sponsor == this.selected_sponsorship)

      // If currency is selected, filter by currency (backward compatibility: null shows all)
      if (this.selectedCurrency) {
        filtered = filtered.filter(el => (el.currency || 'AED') === this.selectedCurrency)
      }

      return filtered
    }
  },
  async mounted() {
    this.getEmployersList()
    if (this.invoice_id) {
      await this.fetchInvoicePayments().then(async () => {
        await this.getInvoiceDetails()
      })
    }
    // If we have selected invoices, get their details to populate the form
    if (this.selectedInvoices && this.selectedInvoices.length > 0) {
      await this.getSelectedInvoicesDetails()
    }
  },
  watch: {
    'paymentDetails.invoices'() {
      console.log('selected invoices: ', this.paymentDetails.invoices)
    },
    invoice_amounts_mapping: {
      handler(new_items, old_items) {
        let totals = 0
        new_items.forEach(el => {
          totals += Number(el.amount)
        })
        this.paymentDetails.total_payment_amount = Number(totals).toFixed(2)
      },
      deep: true,
    },
    selectedInvoices: {
      handler(newSelectedInvoices) {
        if (!newSelectedInvoices || newSelectedInvoices.length === 0) {
          // Clear form when no invoices are selected
          this.paymentDetails.invoices = []
          this.invoice_amounts_mapping = []
          this.paymentDetails.total_payment_amount = '0.00'
          return
        }

        if (newSelectedInvoices && newSelectedInvoices.length > 0) {
          // Pre-populate with selected invoices
          this.paymentDetails.invoices = newSelectedInvoices.map(invoice => invoice._id)
          this.handleInvoiceSelection()
        }
      },
      immediate: false
    },
    selected_sponsorship: {
      handler(newSponsorship, oldSponsorship) {
        // Only refresh if we have a company selected and the sponsorship actually changed
        if (this.paymentDetails.customer && newSponsorship !== oldSponsorship) {
          console.log('Visa sponsor changed from', oldSponsorship, 'to', newSponsorship, '- refreshing invoice list')
          // Clear current invoice selections when visa sponsor changes
          this.paymentDetails.invoices = []
          this.invoice_amounts_mapping = []
          // Refresh the invoice list to show only invoices matching the new visa sponsor
          this.getCompanyInvoices()
        }
      }
    }
  },
  methods: {
    showSnackStatus(message, success = true, timeout = 5000) {
      this.alert_info.should_show_status = true
      this.alert_info.message = message
      this.alert_info.success = success
      setTimeout(() => {
        this.alert_info.should_show_status = false
        this.alert_info.message = message
        this.alert_info.success = success
      }, timeout)
    },
    formatAmount(amount) {
      const currency = this.selectedCurrency || 'AED';
      return this.$options.filters.currencyFormatter(amount, currency);
    },
    formatToTwoDecimals(value) {
      if (value === null || value === undefined || value === '') return '0.00';
      return Number(value).toFixed(2);
    },
    handleInvoiceSelection(change) {
      console.log('change detected: ', this.paymentDetails.invoices)

      if (this.paymentDetails.invoices.length === 0) {
        // Clear everything when no invoices selected
        this.invoice_amounts_mapping = []
        this.paymentDetails.total_payment_amount = '0.00'
        return
      }

      if (this.paymentDetails.invoices.length) {
        const [total_due, invoice_mapping] = this.calculateTotalToBeSettled(
          this.paymentDetails.invoices
        )
        this.paymentDetails.total_payment_amount = Number(total_due).toFixed(2)
        // create invoice mapping
        this.$set(this, 'invoice_amounts_mapping', invoice_mapping)
      }
    },
    handleClientChange() {
      this.invoice_amounts_mapping = []
      this.paymentDetails.invoices = []
      this.paymentDetails.total_payment_amount = '0.00'
      this.getCompanyInvoices()
    },
    handleCurrencyChange() {
      // Clear invoice selections when currency changes
      this.invoice_amounts_mapping = []
      this.paymentDetails.invoices = []
      this.paymentDetails.total_payment_amount = '0.00'

      // If we have a client selected, refresh the invoice list to show filtered results
      if (this.paymentDetails.customer) {
        this.getCompanyInvoices()
      }
    },
    customFilter(item, queryText, itemText) {
      // Custom filter for better search functionality
      const searchText = queryText.toLowerCase()
      const companyName = item.company_name.toLowerCase()

      // Check if the search text matches the company name
      return companyName.includes(searchText)
    },
    calculateTotalToBeSettled(selection) {
      console.log('selection: ', selection)
      let total = 0
      let invoiceMappingArray = []

      if (!selection || !Array.isArray(selection) || selection.length === 0) {
        return [0, []]
      }

      selection.forEach((el) => {
        console.log('inv test: ', el)
        console.log('invoices list: ', this.company_invoices)
        const invoice = this.company_invoices.find((inv) => {
          console.log('el: ', inv)
          return inv._id == el
        })
        console.log('inv test: ', invoice)

        if (invoice) {
                  const maxAmount = Math.max(0, (invoice?.balance_due || 0) - (invoice?.partial_amount || 0))
        // add totals
        total += maxAmount
        invoiceMappingArray.push({
          _id: invoice._id,
          maxAmount: Number(maxAmount).toFixed(2),
          invoice_number: invoice.invoice_number,
          amount: Number(maxAmount).toFixed(2),
        })
        }
        console.log('calculated total: ', total)
      })
              return [Number(total).toFixed(2), invoiceMappingArray]
    },
    getInputLabel(label) {
      if (label == 'Bank Transfer') {
        return 'Bank Name'
      } else {
        return label
      }
    },
    async getEmployersList() {
      this.loading_clients = true

      try {
        const response = await this.$axios.$post(
          `/companies/list/filter/search?page=1&limit=100000`,
          {
            search: '',
            isInvoiceFilter: true,
          }
        )
        this.employers = response
      } catch (error) {
        console.error('Error fetching employers list:', error)
      } finally {
        this.loading_clients = false
      }
    },
    async getCompanyInvoices() {
      try {
        this.loading_company_invoices = true
        const response = await this.$axios.$post(
          `/invoice/list?page=1&limit=100000`,
          {
            company_id: this.paymentDetails.customer,
            status: ['Due', 'Partially Paid', 'Overdue'],
          }
        )
        this.company_invoices = response.results || []
      } catch (error) {
        console.log('Fixture check: ', error?.message)
      } finally {
        this.loading_company_invoices = false
      }
    },
    async generatePayment() {
      if (this.$refs.paymentForm.validate()) {
        this.loading = true
        try {
          // Determine currency from selected invoices or dropdown
          const effectiveCurrency = this.selectedCurrency || 'AED'

          let obj = {
            customer: this.paymentDetails.customer,
            total_payment_amount: Number(this.paymentDetails.total_payment_amount).toFixed(2),
            bank_charge: Number(this.paymentDetails.charges || 0).toFixed(2),
            invoices: this.invoice_amounts_mapping.map((el) => {
              return {
                _id: el._id,
                amount: Number(el.amount).toFixed(2)
              }
            }),
            bank_name: this.paymentDetails?.bank_name || '',
            payment_link: this.paymentDetails?.payment_link || '',
            reference: this.paymentDetails.reference,
            payment_date: this.paymentDetails.payment_date,
            payment_mode: this.paymentDetails.payment_method,
            notes: this.paymentDetails.payment_method === 'Others' ? this.paymentDetails.remarks : '',
            // Currency fields for multi-currency support
            currency: effectiveCurrency,
            conversion_rate: this.getConversionRate(effectiveCurrency),
            base_currency: 'AED',
            converted_amount_aed: this.calculateConvertedAmountAED(),
          }
          await this.$axios.$post(`/invoice/record/multiple/payments`, obj)
          // this.successfull()
          this.showSnackStatus(`Payment added successfully`, true)
          this.handleAutoClose()
        } catch (error) {
          this.errorOccurred()
          this.showSnackStatus(`Could not add payment due to: ${error?.response?.data?.message || error?.message}`, false)
        } finally {
          this.loading = false
        }
      } else {
        this.snackbar_data = {
          snackbar: true,
          text: 'Fill all required Data',
          color: 'error',
          icon: 'check',
          timeout: 2000,
        }
      }
    },
    handleAutoClose() {
      setTimeout(() => {
        this.close()
      }, 5000)
    },
    initForm() {
      this.payment_date = this.formatDate(new Date(Date.now()))
    },
    async fetchInvoicePayments() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        const response = await this.$axios.get(
          `payments/invoice/${this.invoice_id}`,
          {
            headers: { Authorization: AuthStr },
          }
        )
        if (response) {
          this.invoice_payments = response.data
        }
      } catch (error) {
        console.log('error occurred: ', error)
      }
    },
    async getSelectedInvoicesDetails() {
      try {
        if (this.selectedInvoices && this.selectedInvoices.length > 0) {
          // Get the first invoice to determine the customer
          const firstInvoice = this.selectedInvoices[0]
          if (firstInvoice.customer) {
            this.paymentDetails.customer = firstInvoice.customer
            await this.getCompanyInvoices()
          }
        }
      } catch (error) {
        console.log('Error getting selected invoices details: ', error?.message)
      }
    },
    async getInvoiceDetails() {
      try {
        console.log('called mounted on details modal: ', this.invoice_id)
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.loading = true
        const result = await this.$axios.$post(
          `invoice/id/${this.invoice_id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )

        if (result.length) {
          const response = result[0]
          this.paymentAmount = response.total
          this.paymentDetails.invoice_number = response.invoice_number
          this.paymentDetails.customer = response.customer
          this.paymentDetails.invoice_id = response.id
          this.paymentDetails.amount = this.calculateAmountToBePaid(response)
        }
        this.initForm()
      } catch (error) {
        console.log('Fetching Invoice Details Error: ', error?.message)
      } finally {
        this.loading = false
      }
    },
    calculateAmountToBePaid(response) {
      // All credit notes
      const credit_notes = response?.creditNoteDetails || []
      const debit_notes = response?.debitNoteDetails || []
      const balanceDue = response?.balance_due || 0

      // All payments (assumed stored in component data or passed in another way)
      const payments = this.invoice_payments || []

      // Sum of credit notes
      const totalCredits = credit_notes.reduce((sum, note) => {
        return sum + (note.applied_amount || 0)
      }, 0)

      // Sum of debit notes
      const totalDebits = credit_notes.reduce((sum, note) => {
        return sum + (note.applied_amount || 0)
      }, 0)

      // Sum of payments
      const totalPayments = payments.reduce((sum, payment) => {
        return sum + (payment.amount || 0)
      }, 0)

      // Final amount to be paid
      const amountToBePaid =
        balanceDue + totalDebits - (totalCredits + totalPayments)

      return amountToBePaid > 0 ? Number(amountToBePaid).toFixed(2) : '0.00'
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      // Format as YYYY-MM-DD for v-date-picker
      return date.toISOString().split('T')[0]
    },
    close() {
      // Reset form state before closing
      this.invoice_amounts_mapping = []
      this.paymentDetails.invoices = []
      this.paymentDetails.total_payment_amount = '0.00'
      this.paymentDetails.customer = ''
      this.selectedCurrency = null // Reset currency selection

      this.$emit('reload')
      this.$emit('close')
    },
    successfull() {
      this.$emit('successfull')
      this.$nuxt.$emit('record-payment-status', {
        success: true,
        message: 'A payment record has been created successfully',
      })
      this.$emit('close')
    },
    errorOccurred() {
      this.$emit('error')
      this.$nuxt.$emit('record-payment-status', {
        success: false,
        message: 'An Error occurred when adding payment',
      })
    },
    //upload Documents
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        this.dragging = false
        return
      }
      this.createFile(e, files, type)
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
    },
    createFile(e, file, type) {
      if (file.size > 10000000) {
        alert('please check file size is not more than 10 MB.')
        this.dragging = false
        return
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file
      this.dragging = false
    },
    onUploadFiles(event) {
      this.uploadFiles = event
      this.dragging = false
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    removeFile(val) {
      if (val == 'uploadDoc') this.uploadFile = ''
    },
    getConversionRate(currency) {
      // For now, return default rates. In production, you might want to fetch from exchange rate service
      const rates = {
        'AED': 1.0,
        'USD': 3.67, // Example rate - should be fetched from exchange rate service
        'EUR': 4.0   // Example rate - should be fetched from exchange rate service
      }
      return rates[currency] || 1.0
    },
    calculateConvertedAmountAED() {
      const effectiveCurrency = this.selectedCurrency || 'AED'
      const totalAmount = parseFloat(this.paymentDetails.total_payment_amount) || 0
      const bankCharge = parseFloat(this.paymentDetails.charges) || 0
      const totalAmountWithCharges = totalAmount + bankCharge

      if (effectiveCurrency === 'AED') {
        return totalAmountWithCharges
      }

      const conversionRate = this.getConversionRate(effectiveCurrency)
      return totalAmountWithCharges * conversionRate
    },
  },
}
</script>
