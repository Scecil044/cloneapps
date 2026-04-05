<template>
  <!-- Create Onboarding  Dialog -->
  <v-dialog v-model="open" max-width="700px" persistent>
    <v-card class="rounded-xl pa-0 pt-0" flat min-height="400">
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
              Add Payment</span
            >
          </div>
          <v-spacer />
          <v-btn @click="close" outlined icon color="red accent-4">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-divider></v-divider>

        <!-- Currency Information Alert -->
        <v-alert
          v-if="invoiceCurrency && invoiceCurrency !== 'AED'"
          type="info"
          outlined
          class="tw-mx-4 tw-my-2"
          border="left"
          colored-border
          dense
        >
          <div class="tw-flex tw-items-center">
            <v-icon color="primary" class="tw-mr-2 tw-text-sm">mdi-currency-exchange</v-icon>
            <div>
              <div class="tw-font-semibold tw-text-sm tw-mb-0">
                Multi-Currency Invoice Payment
              </div>
              <div class="tw-text-xs tw-text-gray-700">
                This invoice is in <strong>{{ invoiceCurrency }}</strong> currency.
                <span v-if="conversionRate && conversionRate !== 1">
                  Rate: <strong>1 {{ invoiceCurrency }} = {{ conversionRate }} AED</strong>
                </span>
                | 💡 Enter amounts in {{ invoiceCurrency }}.
              </div>
            </div>
          </div>
        </v-alert>

        <!-- <v-card-title id="card-title">
        <v-row>
          <v-col cols="12" class="ma-0 pa-0">
            <div class="d-flex align-center justify-space-between">
              <h4 class="text--text">Record Payment</h4>
              <div class="d-flex align-center justify-end">
                <v-btn
                  class="tall__btn mr-4 pl-6 pr-6"
                  color="subtext"
                  :disabled="loading"
                  @click="close"
                  ><span class="">Cancel</span></v-btn
                >

                <v-btn
                  class="tall__btn pl-6 pr-6"
                  color="primary"
                  :disabled="loading"
                  @click="generatePayment"
                  >Create</v-btn
                >
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-title> -->
        <v-card-text>
          <v-row class="pt-0">
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Invoice Number" :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    placeholder="Invoice Number"
                    v-model="paymentDetails.invoice_number"
                    solo
                    dense
                    :rules="genericRule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Ref No." :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    v-model="paymentDetails.invoice_ref_number"
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
              <CustomInputContainer label="Payment Method">
                <div slot="input">
                  <v-select
                    v-model="paymentDetails.payment_method"
                    :items="paymentMethodList"
                    item-text="name"
                    item-value="id"
                    placeholder="Enter Payment Method"
                    outlined
                    solo
                    dense
                    class="inputField"
                    :rules="genericRule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="6" v-if="['Bank Transfer','Payment Link'].includes(paymentDetails.payment_method)" class="pl-0 py-0">
              <CustomInputContainer :label="getInputLabel(paymentDetails.payment_method || '')">
                <div slot="input">
                  <v-select
                    v-if="paymentDetails.payment_method == 'Bank Transfer'"
                    v-model="
                    paymentDetails[
                        getInputLabel(paymentDetails.payment_method || '')
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
                        getInputLabel(paymentDetails.payment_method || '')
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
              <CustomInputContainer label="Charges">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    :rules="optionalNumberRule"
                    v-model="paymentDetails.charges"
                    :placeholder="`Enter charges in ${invoiceCurrency || 'AED'}`"
                    solo
                    dense
                    type="number"
                    step="0.01"
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer :mandatory="true" label="Amount Received">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    :rules="genericRule"
                    v-model="paymentDetails.amount"
                    :placeholder="`Enter amount in ${invoiceCurrency || 'AED'}`"
                    solo
                    dense
                    type="number"
                    step="0.01"
                    @blur="formatAmount"
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
          <v-card-actions class="tw-py-5 tw-mt-3 tw-pr-4">
            <v-spacer />
            <!-- <div class="d-flex align-center justify-end"> -->
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
            <!-- </div> -->
          </v-card-actions>
        </v-card-text>
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
      invoiceCurrency: 'AED', // Default currency
      conversionRate: 1.0, // Default conversion rate
      invoiceBaseCurrency: 'AED', // Default base currency
      paymentDetails: {
        customer: '',
        invoice: '',
        amount: 0,
        bank_charge: 0,
        payment_date: '',
        payment_mode: '',
        invoice_id: '',
        payment_method: '',
        invoice_ref_number: '',
        charges: 0,
        remarks: '',
        bank_name: '',
        payment_link: '',
      },
      date_menu: false,
      loading: false,
      dialogPayment: true,
      paymentMethodList: ['Cash', 'Cheque', 'Credit Card', 'Direct Debit', 'Bank Transfer', 'Payment Link', 'Others'],

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
      attachFiles: {
        uploadDoc: {},
      },
      invoice_payments: [],
      fetchedInvoice: null,
    }
  },
  computed: {
    computedBankList(){
      let visa_sponsor = this.fetchedInvoice?.visa_sponsor || 'Dynamic Employment Services'
      if (visa_sponsor == 'Executive Employment Services') {
        return this.ExecutiveBanksList
      }
      return this.DynamicBankList
    }
  },
  async mounted() {
    await this.fetchInvoicePayments().then(async () => {
      await this.getInvoiceDetails()
    })
  },
  methods: {
    getInputLabel(label) {
      if (!label) return ''; // Return empty string if label is null/undefined
      if (label == 'Bank Transfer') {
        return 'Bank Name'
      } else {
        return label
      }
    },
    async generatePayment() {
      if (this.$refs.paymentForm.validate()) {
        this.loading = true
        try {
          const AuthStr = 'Bearer '.concat(this.$store.state.token)
          let obj = {
            customer: this.paymentDetails.customer,
            invoice: this.invoice_id,
            amount: this.paymentDetails.amount,
            invoice_number: this.paymentDetails.invoice_number,
            reference: this.paymentDetails.invoice_ref_number,
            bank_charge: this.paymentDetails.charges || 0,
            bank_name: this.paymentDetails?.bank_name || '',
            payment_link: this.paymentDetails?.payment_link || '',
            payment_date: this.paymentDetails.payment_date,
            payment_mode: this.paymentDetails.payment_method,
            notes: this.paymentDetails.payment_method === 'Others' ? this.paymentDetails.remarks : '',
            // Include currency information
            currency: this.invoiceCurrency,
            conversion_rate: this.conversionRate,
            base_currency: this.invoiceBaseCurrency || 'AED',
            converted_amount_aed: this.calculateConvertedAmountAED(),
          }
          await this.$axios.$post(`/invoice/record/payment`, obj, {
            headers: { Authorization: AuthStr },
          })
          this.successfull()
        } catch (error) {
          this.errorOccurred()
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

          // Store currency information
          this.invoiceCurrency = response.currency || 'AED'
          this.conversionRate = response.conversion_rate || 1.0
          this.invoiceBaseCurrency = response.base_currency || 'AED'
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
      const partial_amount = response?.partial_amount || 0

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
      const amountToBePaid = balanceDue  - partial_amount

      // Format to 2 decimal places
      return amountToBePaid > 0 ? parseFloat(amountToBePaid).toFixed(2) : '0.00'
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      // Format as YYYY-MM-DD for v-date-picker
      return date.toISOString().split('T')[0]
    },
    formatAmount() {
      if (this.paymentDetails.amount && this.paymentDetails.amount !== '') {
        const amount = parseFloat(this.paymentDetails.amount)
        if (!isNaN(amount)) {
          this.paymentDetails.amount = amount.toFixed(2)
        }
      }
    },
    calculateConvertedAmountAED() {
      // Calculate AED equivalent based on payment amount and bank charges
      const paymentAmount = parseFloat(this.paymentDetails.amount) || 0
      const bankCharge = parseFloat(this.paymentDetails.charges) || 0
      const totalAmount = paymentAmount + bankCharge
      return totalAmount * this.conversionRate
    },
    close() {
      this.$emit('close')
    },
    successfull() {
      this.resetForm()
      this.$emit('successfull')
      this.$nuxt.$emit('record-payment-status', {
        success: true,
        message: 'A payment record has been created successfully',
      })
      this.$emit('close')
    },
    resetForm() {
      this.invoiceCurrency = 'AED'
      this.conversionRate = 1.0
      this.paymentDetails = {
        customer: '',
        invoice: '',
        amount: 0,
        bank_charge: 0,
        payment_date: '',
        payment_mode: '',
        invoice_id: '',
        payment_method: '', // Ensure this is never null
        invoice_ref_number: '',
        charges: 0,
        remarks: '',
        bank_name: '',
        payment_link: '',
      }
      if (this.$refs.paymentForm) {
        this.$refs.paymentForm.reset()
      }
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
  },
}
</script>
