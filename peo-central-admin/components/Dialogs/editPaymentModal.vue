<template>
  <v-dialog v-model="open" max-width="800px" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4">
        <div class="tw-flex tw-items-center">
          <div class="tw-w-12 tw-h-12 tw-mr-4 tw-bg-blue-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
            <svg class="tw-w-6 tw-h-6 tw-text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 class="tw-text-xl tw-font-bold tw-text-gray-900">Edit Payment</h3>
            <p class="tw-text-sm tw-text-gray-600">Update payment details</p>
          </div>
        </div>
        <v-btn icon @click="close" :disabled="loading">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="tw-px-6 tw-py-4" style="max-height: 70vh; overflow-y: auto;">
        <v-form ref="editPaymentForm" v-model="isFormValid" lazy-validation>
          <!-- Current Payment Details -->
          <div class="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-mb-6">
            <h4 class="tw-font-semibold tw-text-gray-900 tw-mb-3">Current Payment Details</h4>
            <div class="tw-grid tw-grid-cols-3 tw-gap-4">
              <div>
                <span class="tw-text-sm tw-text-gray-600">Payment ID:</span>
                <p class="tw-font-medium">{{ payment?.payment_number || '-' }}</p>
              </div>
              <div v-if="payment?.company_name">
                <span class="tw-text-sm tw-text-gray-600">Company:</span>
                <p class="tw-font-medium">{{ payment?.company_name || '-' }}</p>
              </div>
              <div v-if="payment?.visa_sponsor">
                <span class="tw-text-sm tw-text-gray-600">Visa Sponsor:</span>
                <p class="tw-font-medium">{{ payment?.visa_sponsor || '-' }}</p>
              </div>
              <div>
                <span class="tw-text-sm tw-text-gray-600">Current Amount:</span>
                <p class="tw-font-medium">{{ payment?.amount | currencyFormatter(payment?.currency || 'AED') }}</p>
              </div>
              <div v-if="payment?.currency && payment?.currency !== 'AED'">
                <span class="tw-text-sm tw-text-gray-600">Currency:</span>
                <p class="tw-font-medium tw-text-blue-600">{{ payment?.currency }}</p>
              </div>
              <div v-if="payment?.conversion_rate && payment?.conversion_rate !== 1">
                <span class="tw-text-sm tw-text-gray-600">Exchange Rate:</span>
                <p class="tw-font-medium">1 {{ payment?.currency }} = {{ payment?.conversion_rate }} AED</p>
              </div>
              <div v-if="payment?.converted_amount_aed && payment?.currency !== 'AED'">
                <span class="tw-text-sm tw-text-gray-600">AED Equivalent:</span>
                <p class="tw-font-medium">{{ payment?.converted_amount_aed | currencyFormatter('AED') }}</p>
              </div>
              <div>
                <span class="tw-text-sm tw-text-gray-600">Payment Method:</span>
                <p class="tw-font-medium">{{ payment?.payment_mode || '-' }}</p>
              </div>
              <div>
                <span class="tw-text-sm tw-text-gray-600">Payment Date:</span>
                <p class="tw-font-medium">{{ formatDisplayDate(payment?.createdAt) || '-' }}</p>
              </div>
              <div v-if="payment?.bank_name">
                <span class="tw-text-sm tw-text-gray-600">Bank Name:</span>
                <p class="tw-font-medium">{{ payment?.bank_name || '-' }}</p>
              </div>
              <div v-if="payment?.reference">
                <span class="tw-text-sm tw-text-gray-600">Reference Number:</span>
                <p class="tw-font-medium">{{ payment?.reference || '-' }}</p>
              </div>
              <div v-if="payment?.bank_name">
                <span class="tw-text-sm tw-text-gray-600">Bank Name:</span>
                <p class="tw-font-medium">{{ payment?.bank_name || '-' }}</p>
              </div>
              <div v-if="payment?.bank_charge">
                <span class="tw-text-sm tw-text-gray-600">Bank Charges:</span>
                <p class="tw-font-medium">{{ payment?.bank_charge | currencyFormatter(payment?.currency || 'AED') }}</p>
              </div>
            </div>
          </div>

          <!-- Edit Form -->
          <div class="tw-space-y-4">
            <v-row>
              <v-col cols="12" md="6">
                <CustomInputContainer :label="`Payment Amount (${payment?.currency || 'AED'})`" required>
                  <div slot="input">
                    <v-text-field
                      v-model="formData.amount"
                      :rules="amountRules"
                      type="number"
                      step="0.01"
                      min="0"
                      outlined
                      dense
                      :disabled="loading"
                      :placeholder="`Enter amount in ${payment?.currency || 'AED'}`"
                      :prefix="payment?.currency || 'AED'"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6">
                <CustomInputContainer label="Payment Method" required>
                  <div slot="input">
                    <v-select
                      v-model="formData.payment_mode"
                      :items="paymentMethods"
                      :rules="paymentModeRules"
                      outlined
                      dense
                      :disabled="loading"
                      placeholder="Select payment method"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <CustomInputContainer label="Payment Date" required>
                  <div slot="input">
                    <v-menu
                      v-model="dateMenu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="formattedPaymentDate"
                          :rules="dateRules"
                          readonly
                          outlined
                          dense
                          :disabled="loading"
                          placeholder="Select payment date"
                          v-bind="attrs"
                          v-on="on"
                        >
                          <template v-slot:append>
                            <v-icon>mdi-calendar</v-icon>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker
                        v-model="formData.payment_date"
                        @input="dateMenu = false"
                        :max="new Date().toISOString().split('T')[0]"
                      ></v-date-picker>
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6">
                <CustomInputContainer :label="`Bank Charges (${payment?.currency || 'AED'})`">
                  <div slot="input">
                    <v-text-field
                      v-model="formData.bank_charge"
                      type="number"
                      step="0.01"
                      min="0"
                      outlined
                      dense
                      :disabled="loading"
                      :placeholder="`Enter charges in ${payment?.currency || 'AED'}`"
                      :prefix="payment?.currency || 'AED'"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <!-- Exchange Rate Field (only show for non-AED currencies) -->
            <v-row v-if="payment?.currency && payment?.currency !== 'AED'">
              <v-col cols="12" md="6">
                <CustomInputContainer :label="`Exchange Rate (1 ${payment?.currency} = ? AED)`">
                  <div slot="input">
                    <v-text-field
                      v-model="formData.conversion_rate"
                      type="number"
                      step="0.0001"
                      min="0"
                      outlined
                      dense
                      :disabled="loading"
                      :placeholder="`Enter rate for ${payment?.currency}`"
                      @input="updateConvertedAmount"
                    >
                      <template v-slot:append>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                              small
                              v-bind="attrs"
                              v-on="on"
                              @click="showExchangeRateModal = true"
                              :disabled="loading"
                              color="primary"
                            >
                              mdi-refresh
                            </v-icon>
                          </template>
                          <span>Fetch latest exchange rate from API</span>
                        </v-tooltip>
                      </template>
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6">
                <CustomInputContainer label="AED Equivalent (Auto-calculated)">
                  <div slot="input">
                    <v-text-field
                      :value="formData.converted_amount_aed"
                      type="number"
                      outlined
                      dense
                      disabled
                      readonly
                      prefix="AED"
                      placeholder="Calculated automatically"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <v-row v-if="formData.payment_mode === 'Bank Transfer'">
              <v-col cols="12" md="6">
                <CustomInputContainer label="Bank Name">
                  <div slot="input">
                    <v-select
                      v-model="formData.bank_name"
                      :items="computedBankList"
                      outlined
                      dense
                      :disabled="loading"
                      placeholder="Select bank"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6">
                <CustomInputContainer label="Payment Link">
                  <div slot="input">
                    <v-text-field
                      v-model="formData.payment_link"
                      outlined
                      dense
                      :disabled="loading"
                      placeholder="Enter payment link (optional)"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <CustomInputContainer label="Reference Number" required>
                  <div slot="input">
                    <v-text-field
                      v-model="formData.reference"
                      :rules="referenceRules"
                      outlined
                      dense
                      :disabled="loading"
                      placeholder="Enter reference number"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" v-if="formData.payment_mode === 'Others'">
                <CustomInputContainer label="Remarks">
                  <div slot="input">
                    <v-text-field
                      v-model="formData.notes"
                      outlined
                      dense
                      :disabled="loading"
                      placeholder="Enter remarks"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <!-- Impact Information - Collapsible -->
            <v-expansion-panels v-model="impactPanel" flat>
              <v-expansion-panel>
                <v-expansion-panel-header class="tw-bg-blue-50 tw-rounded-lg">
                  <div class="tw-flex tw-items-center">
                    <v-icon color="blue" class="tw-mr-2">mdi-information</v-icon>
                    <span class="tw-font-medium tw-text-blue-800">What happens when you edit this payment?</span>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="tw-bg-blue-50 tw-px-4 tw-pb-4">
                  <div class="tw-space-y-3">
                    <div class="tw-flex tw-items-start">
                      <v-icon small color="blue" class="tw-mr-2 tw-mt-1">mdi-check-circle</v-icon>
                      <div>
                        <p class="tw-font-medium tw-text-blue-900">Invoice Status Update</p>
                        <p class="tw-text-sm tw-text-blue-700">The invoice status will be automatically recalculated based on the new payment amount (Paid/Partially Paid/Overdue)</p>
                      </div>
                    </div>
                    <div class="tw-flex tw-items-start">
                      <v-icon small color="blue" class="tw-mr-2 tw-mt-1">mdi-check-circle</v-icon>
                      <div>
                        <p class="tw-font-medium tw-text-blue-900">Accounting Records</p>
                        <p class="tw-text-sm tw-text-blue-700">Journal entries will be adjusted to reflect the payment amount change</p>
                      </div>
                    </div>
                    <div class="tw-flex tw-items-start">
                      <v-icon small color="blue" class="tw-mr-2 tw-mt-1">mdi-check-circle</v-icon>
                      <div>
                        <p class="tw-font-medium tw-text-blue-900">Audit Trail</p>
                        <p class="tw-text-sm tw-text-blue-700">All changes will be logged with timestamps and user information for compliance</p>
                      </div>
                    </div>
                    <div class="tw-flex tw-items-start">
                      <v-icon small color="blue" class="tw-mr-2 tw-mt-1">mdi-check-circle</v-icon>
                      <div>
                        <p class="tw-font-medium tw-text-blue-900">Financial Reports</p>
                        <p class="tw-text-sm tw-text-blue-700">Updated payment data will appear in all relevant financial reports and statements</p>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="tw-px-6 tw-py-4">
        <v-spacer></v-spacer>
        <v-btn
          @click="close"
          :disabled="loading"
          class="tw-mr-3"
        >
          Cancel
        </v-btn>
        <v-btn
          @click="confirm"
          :loading="loading"
          :disabled="!isFormValid || loading"
          color="primary"
          class="tw-px-6"
        >
          Update Payment
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Exchange Rate Refresh Confirmation Modal -->
    <CommonModal
      :open="showExchangeRateModal"
      title="Update Exchange Rate"
      :message="`This will fetch the latest exchange rate for ${payment?.currency}  and update the current rate of ${formData.conversion_rate}. This will also recalculate the AED equivalent amount.`"
      confirm-text="Update Rate"
      cancel-text="Cancel"
      type="warning"
      @confirm="confirmExchangeRateRefresh"
      @cancel="showExchangeRateModal = false"
    >
      <template #icon>
        <svg class="tw-w-full tw-h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </template>
    </CommonModal>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CommonModal from '@/components/Common/CommonModal.vue'

export default {
  name: 'EditPaymentModal',
  components: {
    CustomInputContainer,
    CommonModal
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    payment: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isFormValid: false,
      dateMenu: false,
      impactPanel: null,
      showExchangeRateModal: false,
      exchangeRateLoading: false,
      formData: {
        amount: '',
        payment_mode: '',
        payment_date: '',
        bank_charge: '',
        bank_name: '',
        payment_link: '',
        reference: '',
        notes: ''
      },
      paymentMethods: [
        'Cash',
        'Bank Transfer',
        'Cheque',
        'Credit Card',
        'Others'
      ],
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
      amountRules: [
        v => !!v || 'Amount is required',
        v => (v && v > 0) || 'Amount must be greater than 0'
      ],
      paymentModeRules: [
        v => !!v || 'Payment method is required'
      ],
      dateRules: [
        v => !!v || 'Payment date is required'
      ],
      referenceRules: [
        v => !!v || 'Reference number is required'
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.formData.amount &&
             this.formData.payment_mode &&
             this.formData.payment_date &&
             this.formData.reference &&
             this.formData.amount > 0;
    },
    formattedPaymentDate() {
      if (!this.formData.payment_date) return '';
      return new Date(this.formData.payment_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    computedBankList() {
      const visa_sponsor = this.payment?.visa_sponsor || 'Dynamic Employment Services';
      if (visa_sponsor === 'Executive Employment Services') {
        return this.ExecutiveBanksList;
      }
      return this.DynamicBankList;
    }
  },
  watch: {
    open(newVal) {
      if (newVal && this.payment) {
        this.initializeForm()
      }
    },
    'formData.amount'() {
      this.updateConvertedAmount();
    },
    'formData.bank_charge'() {
      this.updateConvertedAmount();
    },
    'formData.conversion_rate'() {
      this.updateConvertedAmount();
    }
  },
  methods: {
    initializeForm() {
      this.formData = {
        amount: this.payment?.amount || '',
        payment_mode: this.payment?.payment_mode || '',
        payment_date: this.payment?.createdAt ? new Date(this.payment.createdAt).toISOString().split('T')[0] : '',
        bank_charge: this.payment?.bank_charge || 0,
        bank_name: this.payment?.bank_name || '',
        payment_link: this.payment?.payment_link || '',
        reference: this.payment?.reference || '',
        notes: this.payment?.notes || '',
        // Currency fields for multi-currency support
        currency: this.payment?.currency || 'AED',
        conversion_rate: this.payment?.conversion_rate || 1.0,
        base_currency: this.payment?.base_currency || 'AED',
        converted_amount_aed: this.payment?.converted_amount_aed || 0
      }
    },
    close() {
      this.$emit('close')
    },
    confirm() {
      if (this.$refs.editPaymentForm.validate()) {
        // Recalculate converted_amount_aed based on current amount and bank charges
        const paymentAmount = parseFloat(this.formData.amount) || 0;
        const bankCharge = parseFloat(this.formData.bank_charge) || 0;
        const totalAmount = paymentAmount + bankCharge;
        const convertedAmountAED = totalAmount * (this.formData.conversion_rate || 1.0);

        const formDataWithCurrency = {
          ...this.formData,
          converted_amount_aed: convertedAmountAED
        };

        this.$emit('confirm', formDataWithCurrency);
      }
    },
    async confirmExchangeRateRefresh() {
      this.showExchangeRateModal = false;
      await this.fetchLatestExchangeRate();
    },
    async fetchLatestExchangeRate() {
      try {
        if (!this.payment?.currency || this.payment.currency === 'AED') {
          this.formData.conversion_rate = 1.0;
          this.updateConvertedAmount();
          return;
        }

        // Show loading state
        this.exchangeRateLoading = true;

        // Fetch latest exchange rates from API
        const response = await this.$axios.get('/exchange-rates/latest');

        if (response.data.success && response.data.data) {
          const rates = response.data.data.rates;
          const newRate = rates[this.payment.currency] || 1.0;

          // Update the conversion rate
          this.formData.conversion_rate = newRate;
          this.updateConvertedAmount();

          // Show success message
          this.$emit('show-snackbar', {
            text: `Updated ${this.payment.currency} exchange rate to ${newRate}`,
            color: 'success'
          });
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        this.$emit('show-snackbar', {
          text: 'Failed to fetch latest exchange rate. Please try again.',
          color: 'error'
        });
      } finally {
        this.exchangeRateLoading = false;
      }
    },
    updateConvertedAmount() {
      // Recalculate converted_amount_aed when amount or bank charge changes
      const paymentAmount = parseFloat(this.formData.amount) || 0;
      const bankCharge = parseFloat(this.formData.bank_charge) || 0;
      const totalAmount = paymentAmount + bankCharge;
      this.formData.converted_amount_aed = totalAmount * (this.formData.conversion_rate || 1.0);
    },
    formatDisplayDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.v-expansion-panel {
  border: 1px solid #e5e7eb;
}

.v-expansion-panel-header {
  padding: 12px 16px;
}

.v-expansion-panel-content {
  padding: 0 16px 16px 16px;
}
</style>
