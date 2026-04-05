<template>
  <v-dialog v-model="isVisible" max-width="800" persistent>
    <v-card class="applyCreditDialog">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <h2 class="text-h5 font-weight-bold">Apply Credit Note</h2>
        <v-btn icon color="grey" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-form ref="applyForm" v-model="valid" lazy-validation>
        <v-card-text class="pa-4">
          <v-row>
            <!-- Left Column - Credit Note Info -->
            <v-col cols="12" md="6">
              <v-card outlined class="pa-3 mb-3" color="blue lighten-5">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text--primary">
                  <v-icon small class="mr-2">mdi-receipt</v-icon>
                  Credit Note Details
                </h4>
                <v-row>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Number:</span>
                      <span class="font-weight-bold">{{ creditNoteData.credit_note_number }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Date:</span>
                      <span class="font-weight-bold">{{ formatDate(creditNoteData.credit_date) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Available Balance:</span>
                      <span class="font-weight-bold text--success">{{ creditNoteCurrency }} {{ formatAmount(availableBalance) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <!-- Right Column - Invoice Info -->
            <v-col cols="12" md="6">
              <v-card outlined class="pa-3 mb-3" color="orange lighten-5">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text--primary">
                  <v-icon small class="mr-2">mdi-file-document</v-icon>
                  Invoice Details
                </h4>
                <v-row>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Number:</span>
                      <span class="font-weight-bold">{{ invoiceData.invoice_number }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Customer:</span>
                      <span class="font-weight-bold">{{ invoiceData.customer_name }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Balance Due:</span>
                      <span class="font-weight-bold text--error">{{ creditNoteCurrency }} {{ formatAmount(invoiceData.balance_due) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <!-- Application Form - Amount and Date Row -->
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="amountToApply"
                :label="`Amount to Apply (${creditNoteCurrency})`"
                outlined
                dense
                type="number"
                step="0.01"
                :rules="amountRules"
                :hint="`Full credit balance: ${creditNoteCurrency} ${formatAmount(availableBalance)}`"
                persistent-hint
                readonly
                color="primary"
                class="font-weight-bold"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-menu
                v-model="date_menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="applicationDate"
                    label="Application Date"
                    outlined
                    dense
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    :rules="[...rules.required]"
                  />
                </template>
                <v-date-picker
                  v-model="applicationDate"
                  @input="date_menu = false"
                />
              </v-menu>
            </v-col>
          </v-row>

          <!-- Notes Row -->
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="notes"
                label="Notes (Optional)"
                outlined
                dense
                rows="2"
                placeholder="Enter any additional notes..."
              />
            </v-col>
          </v-row>

          <!-- Confirmation Row -->
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="confirmationAmount"
                label="Type the exact amount to confirm application"
                outlined
                dense
                type="number"
                step="0.01"
                :rules="confirmationRules"
                :hint="`Type exactly: ${creditNoteCurrency} ${formatAmount(amountToApply)}`"
                persistent-hint
                color="primary"
                class="font-weight-bold"
                placeholder="Enter the exact amount to proceed"
              />
            </v-col>
          </v-row>

          <!-- Compact Summary -->
          <v-row>
            <v-col cols="12">
              <v-card outlined class="pa-3" color="green lighten-5">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text--primary">
                  <v-icon small class="mr-2">mdi-calculator</v-icon>
                  Application Summary
                </h4>
                <v-row>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-caption text--secondary">Applying</div>
                      <div class="text-h6 font-weight-bold text--primary">{{ creditNoteCurrency }} {{ formatAmount(amountToApply) }}</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-caption text--secondary">Remaining Credit</div>
                      <div class="text-h6 font-weight-bold text--success">{{ creditNoteCurrency }} {{ formatAmount(remainingCreditBalance) }}</div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <div class="text-caption text--secondary">Remaining Invoice</div>
                      <div class="text-h6 font-weight-bold" :class="remainingInvoiceBalance > 0 ? 'text--error' : 'text--success'">
                        {{ creditNoteCurrency }} {{ formatAmount(remainingInvoiceBalance) }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="6" md="3">
                    <div class="text-center">
                      <v-chip v-if="remainingInvoiceBalance <= 0" color="success" small>
                        <v-icon small left>mdi-check</v-icon>
                        Fully Paid
                      </v-chip>
                      <v-chip v-else color="warning" small>
                        <v-icon small left>mdi-clock</v-icon>
                        Partial
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <!-- Success Display -->
          <v-col cols="12" v-if="success.status">
            <v-alert
              type="success"
              dismissible
              @input="success.status = false"
              class="mb-4"
            >
              <div class="d-flex align-center">
                <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                <div>
                  <div class="font-weight-bold">{{ success.message }}</div>
                  <div class="text-caption">Credit note applied successfully to invoice.</div>
                </div>
              </div>
            </v-alert>
          </v-col>

          <!-- Error Display -->
          <v-col cols="12" v-if="error.status">
            <v-alert
              type="error"
              dismissible
              @input="error.status = false"
              class="mb-4"
            >
              <div class="d-flex align-center">
                <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                <div>
                  <div class="font-weight-bold">Application Failed</div>
                  <div class="text-caption">{{ error.message }}</div>
                </div>
              </div>
            </v-alert>
          </v-col>

        </v-card-text>

        <!-- Action Buttons -->
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            outlined
            @click="handleClose"
            :disabled="loading"
            class="mr-2"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click.prevent="handleSubmit"
            :loading="loading"
            :disabled="!valid || !amountToApply || !confirmationAmount || Math.abs(parseFloat(confirmationAmount) - parseFloat(amountToApply)) > 0.01 || loading || success.status"
          >
            <template v-if="loading">
              <v-progress-circular
                indeterminate
                size="20"
                width="2"
                color="white"
                class="mr-2"
              ></v-progress-circular>
              Applying Credit...
            </template>
            <template v-else-if="success.status">
              <v-icon left color="white">mdi-check</v-icon>
              Applied Successfully
            </template>
            <template v-else>
              <v-icon left>mdi-check</v-icon>
              Apply Credit
            </template>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

export default {
  components: {
    CustomInputContainer
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    creditNoteData: {
      type: Object,
      default: () => ({})
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      valid: true,
      loading: false,
      amountToApply: 0,
      applicationDate: new Date().toISOString().substr(0, 10),
      notes: '',
      confirmationAmount: '',
      date_menu: false,
      error: {
        status: false,
        message: ''
      },
      success: {
        status: false,
        message: ''
      },
      rules: {
        required: [(v) => !!v || 'This field is required']
      }
    }
  },
  computed: {
    // Get currency from credit note data, fallback to invoice currency, then AED
    creditNoteCurrency() {
      return this.creditNoteData?.currency || this.invoiceData?.currency || 'AED'
    },
    availableBalance() {
      console.log('Computing available balance for credit note:', this.creditNoteData)

      // Use credit_balance if available (calculated by backend), otherwise calculate manually
      if (this.creditNoteData.credit_balance !== undefined && this.creditNoteData.credit_balance !== null) {
        console.log('Using credit_balance:', this.creditNoteData.credit_balance)
        return parseFloat(this.creditNoteData.credit_balance)
      }

      // Fallback calculation: total - applied_amount
      const total = parseFloat(this.creditNoteData.total) || 0
      const applied = parseFloat(this.creditNoteData.applied_amount) || 0
      const calculated = parseFloat(Math.max(0, total - applied).toFixed(2))
      console.log('Calculated available balance:', calculated, 'from total:', total, 'applied:', applied)
      return calculated
    },
    remainingCreditBalance() {
      const applied = parseFloat(this.amountToApply) || 0
      return parseFloat(Math.max(0, this.availableBalance - applied).toFixed(2))
    },
    remainingInvoiceBalance() {
      const invoiceBalance = parseFloat(this.invoiceData.balance_due) || 0
      const applied = parseFloat(this.amountToApply) || 0
      return parseFloat(Math.max(0, invoiceBalance - applied).toFixed(2))
    },
    maxAmountToApply() {
      // Restrict to applying the full credit balance
      return this.availableBalance
    },
    amountRules() {
      return [
        (v) => !!v || 'Amount is required',
        (v) => {
          const amount = parseFloat(v)
          if (isNaN(amount)) return 'Amount must be a valid number'
          if (amount <= 0) return 'Amount must be greater than 0'
          if (amount > this.maxAmountToApply) return `Amount must be exactly ${this.creditNoteCurrency} ${this.formatAmount(this.maxAmountToApply)} (full credit balance)`
          if (amount !== this.maxAmountToApply) return `Credit must be applied in full. Amount must be ${this.creditNoteCurrency} ${this.formatAmount(this.maxAmountToApply)}`
          return true
        }
      ]
    },
    confirmationRules() {
      return [
        (v) => !!v || 'Confirmation amount is required',
        (v) => {
          const amount = parseFloat(v)
          const expectedAmount = parseFloat(this.amountToApply)
          console.log('Confirmation validation:', { amount, expectedAmount, difference: Math.abs(amount - expectedAmount) })
          if (isNaN(amount)) return 'Amount must be a valid number'
          if (Math.abs(amount - expectedAmount) > 0.01) return `Amount must be exactly ${this.creditNoteCurrency} ${this.formatAmount(this.amountToApply)}`
          return true
        }
      ]
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.initializeModal()
      }
    },
    creditNoteData: {
      handler(newVal) {
        console.log('Credit note data changed:', newVal)
        if (newVal && this.isVisible) {
          // Update amount when credit note data changes
          this.amountToApply = this.availableBalance.toFixed(2)
          console.log('Updated amount to apply:', this.amountToApply)
        }
      },
      deep: true,
      immediate: true
    },
    availableBalance(newVal) {
      console.log('Available balance changed to:', newVal)
      if (this.isVisible && newVal > 0) {
        this.amountToApply = newVal.toFixed(2)
        console.log('Updated amount to apply from available balance:', this.amountToApply)
      }
    }
  },
  methods: {
    initializeModal() {
      console.log('Initializing modal with credit note data:', this.creditNoteData)
      console.log('Available balance:', this.availableBalance)

      // Always pre-fill amount with available balance (full application required)
      this.amountToApply = this.availableBalance.toFixed(2)
      this.applicationDate = new Date().toISOString().substr(0, 10)
      this.notes = ''
      this.confirmationAmount = ''
      this.error = { status: false, message: '' }
      this.success = { status: false, message: '' }
      this.loading = false

      console.log('Amount to apply set to:', this.amountToApply)

      // Reset form validation
      this.$nextTick(() => {
        this.$refs.applyForm?.resetValidation()
      })
    },
    formatAmount(amount) {
      if (!amount || isNaN(amount)) return '0.00'
      return parseFloat(amount).toFixed(2)
    },
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-GB')
    },
    formatAmountField() {
      if (this.amountToApply && this.amountToApply !== '') {
        const amount = parseFloat(this.amountToApply)
        if (!isNaN(amount)) {
          this.amountToApply = amount.toFixed(2)
        }
      }
    },
    validateAmount() {
      // Real-time validation
      this.$refs.applyForm?.validate()
    },
    async handleSubmit(e) {
      e.preventDefault()

      if (!this.$refs.applyForm.validate()) {
        return
      }

      // Ensure amount is exactly the available balance (full application)
      if (parseFloat(this.amountToApply) !== this.availableBalance) {
        this.error = {
          status: true,
          message: `Credit must be applied in full. Please apply the complete available balance of ${this.creditNoteCurrency} ${this.formatAmount(this.availableBalance)}.`
        }
        return
      }

      this.loading = true
      this.error = { status: false, message: '' }
      this.success = { status: false, message: '' }

      try {
        const payload = {
          creditNoteId: this.creditNoteData._id || this.creditNoteData.id,
          invoiceId: this.invoiceData._id || this.invoiceData.id,
          amountToApply: parseFloat(this.amountToApply),
          applicationDate: this.applicationDate,
          notes: this.notes.trim() || null
        }

        console.log('Applying credit note with payload:', payload)

        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$post(
          `/credit/notes/apply/credit/${payload.creditNoteId}`,
          payload,
          { headers: { Authorization: AuthStr } }
        )

        // Show success message
        this.success = {
          status: true,
          message: `Successfully applied ${this.creditNoteCurrency} ${this.formatAmount(this.amountToApply)} from Credit Note ${this.creditNoteData.credit_note_number}`
        }

        // Emit success event to parent with response data
        this.$emit('application-success', {
          ...payload,
          response,
          creditNote: this.creditNoteData,
          invoice: this.invoiceData
        })

        // Auto-close after showing success for 2 seconds
        setTimeout(() => {
          this.handleClose()
        }, 2000)

      } catch (error) {
        console.error('Error applying credit note:', error)

        let errorMessage = 'An unexpected error occurred while applying the credit note. Please try again.'

        // Handle specific error responses from backend
        if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        this.error = {
          status: true,
          message: errorMessage
        }

        // Emit error event to parent
        this.$emit('application-error', {
          error: errorMessage,
          originalError: error
        })
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      if (this.loading) {
        return // Prevent closing while operation is in progress
      }

      this.amountToApply = 0
      this.notes = ''
      this.error = { status: false, message: '' }
      this.success = { status: false, message: '' }
      this.loading = false

      // Reset form validation
      this.$nextTick(() => {
        this.$refs.applyForm?.resetValidation()
      })

      this.$emit('handleClose')
    }
  }
}
</script>

<style lang="scss" scoped>
.applyCreditDialog {
  background: #fff;
}

.btn_container {
  .v-btn {
    min-width: 120px;
  }
}

.v-card {
  border-radius: 8px;
}

.text--success {
  color: #4caf50 !important;
}

.text--error {
  color: #f44336 !important;
}

.text--primary {
  color: #1976d2 !important;
}

.text--secondary {
  color: #666 !important;
}

.v-progress-circular {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.v-btn--loading {
  pointer-events: none;
}

.v-btn--disabled {
  opacity: 0.6 !important;
}

.v-alert {
  border-radius: 8px;
}

.v-alert .v-icon {
  margin-right: 8px;
}
</style>
