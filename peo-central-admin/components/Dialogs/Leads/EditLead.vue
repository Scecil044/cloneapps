<template>
  <!-- Create Onboarding  Dialog -->
  <v-dialog
    v-model="open"
    max-width="900px"
    persistent
    height="100vh"
    content-class="proposal_dialog"
  >
    <v-card class="rounded-xl pa-0 pt-0 scroll" flat height="100vh" >
      <v-form ref="paymentForm" lazy-validation>
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
              Create New Lead</span
            >
          </div>
          <v-spacer />
          <v-btn @click="handleClose" outlined icon color="red accent-4">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-divider></v-divider>

        <v-alert v-if="alert_info.should_show_status" dense text :type="alert_info.success ? 'success' : 'error'">
            {{ alert_info.message }}
          </v-alert>
          <CreateLeadForm :is-page="true" :hide-header="true" :selectedLeads="selectedLead" :inquiry="selectedInquiry" :handleModel="handleModel" :isEditMode="true" @close="handleClose" />

        <!-- <v-card-text>
          <v-row class="py-0 px-0">
          </v-row>
          <v-card-actions class="tw-py-5 tw-mt-3 tw-pr-4">
            <v-spacer />
            <v-btn flat text :disabled="loading" @click="handleClose" large
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
        </v-card-text> -->
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CreateLeadForm from '@/components/EditModel/editLeads.vue'

export default {
  components: {
    CustomInputContainer,
    CreateLeadForm
  },
  props: {
    open: Boolean,
    selectedLead: Object,
    selectedInquiry: Object,
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
        amount: 0,
        payment_date: '',
        payment_mode: '',
        invoices: [],
        invoice_id: '',
        payment_method: '',
        invoice_ref_number: '',
        charges: 0,
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
       return this.company_invoices.filter(el => el.visa_sponsor == this.selected_sponsorship)
    }
  },
  async mounted() {
    // this.getEmployersList()
    // if (this.invoice_id) {
    //   await this.fetchInvoicePayments().then(async () => {
    //     await this.getInvoiceDetails()
    //   })
    // }
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
        this.paymentDetails.total_payment_amount = totals
      },
      deep: true,
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleModel() {
      console.log('should close model');
      this.handleClose()
      this.$emit('reload')
    },
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
      return this.$options.filters.currencyFormatter(amount);
    },
    handleInvoiceSelection(change) {
      console.log('change detected: ', this.paymentDetails.invoices)

      if (this.paymentDetails.invoices.length) {
        const [total_due, invoice_mapping] = this.calculateTotalToBeSettled(
          this.paymentDetails.invoices
        )
        this.paymentDetails.total_payment_amount = total_due
        // create invoice mapping
        this.$set(this, 'invoice_amounts_mapping', invoice_mapping)
      }
    },
    handleClientChange() {
      this.invoice_amounts_mapping = []
      this.getCompanyInvoices()
    },
    calculateTotalToBeSettled(selection) {
      console.log('selection: ', selection)
      let total = 0
      let invoiceMappingArray = []
      selection.forEach((el) => {
        console.log('inv test: ', el)
        console.log('invoices list: ', this.company_invoices)
        const invoice = this.company_invoices.find((inv) => {
          console.log('el: ', inv)
          return inv._id == el
        })
        console.log('inv test: ', invoice)
        const maxAmount = invoice?.balance_due - (invoice?.partial_amount || 0)
        // add totals
        total += maxAmount
        invoiceMappingArray.push({
          _id: invoice?._id,
          maxAmount: maxAmount,
          invoice_number: invoice?.invoice_number,
          amount: maxAmount,
        })
        console.log('calculated total: ', total)
      })
      return [total, invoiceMappingArray]
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
          let obj = {
            customer: this.paymentDetails.customer,
            total_payment_amount: this.paymentDetails.total_payment_amount,
            bank_charge: this.paymentDetails.charges || 0,
            invoices: this.invoice_amounts_mapping.map((el) => {
              return {
                _id: el._id,
                amount: el.amount
              }
            }),
            bank_name: this.paymentDetails?.bank_name || '',
            payment_link: this.paymentDetails?.payment_link || '',
            reference: this.paymentDetails.reference,
            payment_date: this.paymentDetails.payment_date,
            payment_mode: this.paymentDetails.payment_method,
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

      return amountToBePaid > 0 ? amountToBePaid : 0
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      // Format as YYYY-MM-DD for v-date-picker
      return date.toISOString().split('T')[0]
    },
    close() {
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
      if (file.size > 26214400) {
        alert('please check file size is not more than 25 MB.')
        this.dragging = false;
        return;
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file;
      this.dragging = false;
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
  },
}
</script>
