<template>
  <v-dialog v-model="isVisible" max-width="800" persistent>
    <v-card class="applyDebitDialog">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <h2 class="text-h5 font-weight-bold">Apply Debit Note</h2>
        <v-btn icon color="grey" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-form ref="applyForm" v-model="valid" lazy-validation>
        <v-card-text class="pa-4">
          <v-row>
            <!-- Left Column - Debit Note Info -->
            <v-col cols="12" md="6">
              <v-card outlined class="pa-3 mb-3" color="blue lighten-5">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text--primary">
                  <v-icon small class="mr-2">mdi-receipt</v-icon>
                  Debit Note Details
                </h4>
                <v-row>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Number:</span>
                      <span class="font-weight-bold">{{ debitNoteData.debit_note_number }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Date:</span>
                      <span class="font-weight-bold">{{ formatDate(debitNoteData.debit_date) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" class="py-1">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Available Balance:</span>
                      <span class="font-weight-bold text--success">{{ debitNoteCurrency }} {{ formatAmount(availableBalance) }}</span>
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
                      <span class="font-weight-bold text--error">{{ debitNoteCurrency }} {{ formatAmount(invoiceData.balance_due) }}</span>
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
                :label="`Amount to Apply (${debitNoteCurrency})`"
                outlined
                dense
                type="number"
                step="0.01"
                :rules="amountRules"
                :hint="`Full debit balance: ${debitNoteCurrency} ${formatAmount(availableBalance)}`"
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
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="applicationDate"
                    label="Application Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    outlined
                    dense
                    :rules="[v => !!v || 'Application date is required']"
                  />
                </template>
                <v-date-picker
                  v-model="applicationDate"
                  no-title
                  scrollable
                  @input="date_menu = false"
                />
              </v-menu>
            </v-col>
          </v-row>

          <!-- Notes Section -->
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="applicationNotes"
                label="Application Notes (Optional)"
                outlined
                dense
                rows="3"
                placeholder="Add any notes about this debit note application..."
                counter="500"
                :rules="[v => !v || v.length <= 500 || 'Notes must be less than 500 characters']"
              />
            </v-col>
          </v-row>

          <!-- Summary Section -->
          <v-row>
            <v-col cols="12">
              <v-card outlined class="pa-4" color="grey lighten-5">
                <h4 class="text-subtitle-1 font-weight-bold mb-3 text--primary">
                  <v-icon small class="mr-2">mdi-calculator</v-icon>
                  Application Summary
                </h4>
                <v-row>
                  <v-col cols="6">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Amount to Apply:</span>
                      <span class="font-weight-bold text--primary">{{ debitNoteCurrency }} {{ formatAmount(amountToApply) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">New Invoice Balance:</span>
                      <span class="font-weight-bold text--error">{{ debitNoteCurrency }} {{ formatAmount(newInvoiceBalance) }}</span>
                    </div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Remaining Debit Balance:</span>
                      <span class="font-weight-bold text--success">{{ debitNoteCurrency }} {{ formatAmount(remainingDebitBalance) }}</span>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="d-flex justify-space-between">
                      <span class="text--secondary">Application Date:</span>
                      <span class="font-weight-bold">{{ formatDate(applicationDate) }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <!-- Action Buttons -->
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            @click="handleClose"
            :disabled="loading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!valid || loading || amountToApply <= 0"
            @click="applyDebitNote"
          >
            <v-icon left>mdi-check</v-icon>
            Apply Debit Note
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ApplyDebitNoteModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    debitNoteData: {
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
      valid: false,
      loading: false,
      date_menu: false,
      amountToApply: 0,
      applicationDate: moment().format('YYYY-MM-DD'),
      applicationNotes: '',
      amountRules: [
        v => !!v || 'Amount is required',
        v => v > 0 || 'Amount must be greater than 0',
        v => v <= this.availableBalance || 'Amount cannot exceed available balance'
      ]
    }
  },
  computed: {
    // Get currency from debit note data, fallback to invoice currency, then AED
    debitNoteCurrency() {
      return this.debitNoteData?.currency || this.invoiceData?.currency || 'AED'
    },
    availableBalance() {
      return this.debitNoteData.debit_balance || 0
    },
    newInvoiceBalance() {
      return (this.invoiceData.balance_due || 0) + this.amountToApply
    },
    remainingDebitBalance() {
      return Math.max(0, this.availableBalance - this.amountToApply)
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.initializeModal()
      } else {
        this.resetForm()
      }
    },
    availableBalance: {
      handler(newVal) {
        if (newVal > 0) {
          // Set amount to apply to the full available debit balance (debit notes add to invoice amount)
          this.amountToApply = newVal
        }
      },
      immediate: true
    }
  },
  methods: {
    initializeModal() {
      this.amountToApply = this.availableBalance
      this.applicationDate = moment().format('YYYY-MM-DD')
      this.applicationNotes = ''
      this.loading = false
    },

    resetForm() {
      this.amountToApply = 0
      this.applicationDate = moment().format('YYYY-MM-DD')
      this.applicationNotes = ''
      this.loading = false
      this.valid = false
    },

    async applyDebitNote() {
      if (!this.valid || this.amountToApply <= 0) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Please fill in all required fields correctly',
          type: 'warning'
        })
        return
      }

      try {
        this.loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.$post(
          `/debit/notes/apply/debit/${this.debitNoteData._id}`,
          {
            debitNoteId: this.debitNoteData._id,
            invoiceId: this.invoiceData._id,
            amountToApply: this.amountToApply,
            applicationDate: this.applicationDate,
            applicationNotes: this.applicationNotes
          },
          {
            headers: { Authorization: AuthStr }
          }
        )

        if (response) {
          this.$nuxt.$emit('show-snackbar', {
            message: `Debit note applied successfully! Amount: ${this.debitNoteCurrency} ${this.formatAmount(this.amountToApply)}`,
            type: 'success'
          })

          // Emit success event with response data
          this.$emit('application-success', {
            debitNote: this.debitNoteData,
            invoice: this.invoiceData,
            amountToApply: this.amountToApply,
            response: response
          })

          this.handleClose()
        }
      } catch (error) {
        console.error('Error applying debit note:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to apply debit note. Please try again.',
          type: 'error'
        })

        // Emit error event
        this.$emit('application-error', {
          error: error?.response?.data?.message || error?.message || 'Unknown error occurred',
          debitNote: this.debitNoteData,
          invoice: this.invoiceData
        })
      } finally {
        this.loading = false
      }
    },

    handleClose() {
      this.$emit('handleClose')
    },

    formatAmount(amount) {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: this.debitNoteCurrency,
        minimumFractionDigits: 2,
      }).format(amount || 0)
    },

    formatDate(dateString) {
      if (!dateString) return ''
      return moment(dateString).format('DD MMM YYYY')
    }
  }
}
</script>

<style scoped>
.applyDebitDialog {
  border-radius: 8px;
}

.v-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.v-text-field--outlined >>> fieldset {
  border-color: #e0e0e0;
}

.v-text-field--outlined.v-input--is-focused >>> fieldset {
  border-color: #1976d2;
}

.v-btn--outlined {
  border-width: 1px;
}

.v-btn--outlined.primary {
  border-color: #1976d2;
  color: #1976d2;
}

.v-btn--outlined.primary:hover {
  background-color: #1976d2;
  color: white;
}
</style>
