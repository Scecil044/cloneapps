<template>
  <v-dialog v-model="isVisible" max-width="1000" persistent>
    <v-card class="selectCustomCreditNoteDialog">
      <!-- Header -->
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <h2 class="text-h5 font-weight-bold">Select Custom Credit Note</h2>
        <v-btn icon color="grey" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <div class="mt-4 text--secondary">Loading available credit notes...</div>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="errorMessage"
          type="error"
          dismissible
          @input="errorMessage = ''"
          class="mb-4"
        >
          <div class="d-flex align-center">
            <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
            <div>
              <div class="font-weight-bold">Failed to Load Credit Notes</div>
              <div class="text-caption">{{ errorMessage }}</div>
            </div>
          </div>
        </v-alert>

        <!-- Empty State -->
        <v-alert
          v-else-if="!loading && availableCreditNotes.length === 0"
          type="info"
          outlined
          class="mb-4"
        >
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="info">mdi-information</v-icon>
            <div>
              <div class="font-weight-medium">No Custom Credit Notes Available</div>
              <div class="text-caption">
                There are no unlinked custom credit notes available for this customer.
              </div>
            </div>
          </div>
        </v-alert>

        <!-- Credit Notes List -->
        <v-data-table
          v-else
          :headers="headers"
          :items="availableCreditNotes"
          :items-per-page="10"
          class="elevation-1"
          :loading="loading"
        >
          <template v-slot:[`item.credit_date`]="{ item }">
            {{ formatDate(item.credit_date) }}
          </template>

          <template v-slot:[`item.total`]="{ item }">
            <span :class="item.total < 0 ? 'tw-text-red-600 tw-font-bold' : 'tw-text-green-600'">
              {{ item.currency || 'AED' }} {{ formatAmount(item.total) }}
            </span>
          </template>

          <template v-slot:[`item.credit_balance`]="{ item }">
            <span :class="item.credit_balance < 0 ? 'tw-text-red-600 tw-font-bold' : 'tw-text-green-600'">
              {{ item.currency || 'AED' }} {{ formatAmount(item.credit_balance) }}
            </span>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <span class="table_btn light_accent1 accent1--text">{{ item.status }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="tw-flex tw-gap-2">
              <v-btn
                small
                color="info"
                outlined
                @click="editCreditNote(item)"
                :disabled="selecting"
              >
                <v-icon small left>mdi-pencil</v-icon>
                Edit
              </v-btn>
              <v-btn
                small
                color="primary"
                outlined
                @click="selectCreditNote(item)"
                :disabled="selecting"
              >
                <v-icon small left>mdi-check</v-icon>
                Select & Apply
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Action Buttons -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          text
          @click="handleClose"
          :disabled="selecting"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
  name: 'SelectCustomCreditNoteModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    invoiceData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      selecting: false,
      errorMessage: '',
      availableCreditNotes: [],
      headers: [
        { text: 'Credit Note Number', value: 'credit_note_number', sortable: true },
        { text: 'Date', value: 'credit_date', sortable: true },
        { text: 'Total Amount', value: 'total', sortable: true },
        { text: 'Available Balance', value: 'credit_balance', sortable: true },
        { text: 'Currency', value: 'currency', sortable: true },
        { text: 'Status', value: 'status', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, align: 'center' }
      ]
    }
  },
  watch: {
    isVisible(newVal) {
      console.log('selectCustomCreditNoteModal isVisible changed:', newVal)
      if (newVal) {
        // Small delay to ensure modal is fully rendered and invoiceData is available
        this.$nextTick(() => {
          console.log('Modal opened, fetching credit notes. invoiceData:', this.invoiceData)
          this.fetchAvailableCreditNotes()
        })
      } else {
        this.resetModal()
      }
    },
    'invoiceData.customer': {
      handler() {
        // Refetch if customer changes while modal is open
        if (this.isVisible) {
          this.fetchAvailableCreditNotes()
        }
      },
      deep: true
    }
  },
  mounted() {
    // Also fetch when component is mounted if visible
    if (this.isVisible) {
      this.$nextTick(() => {
        this.fetchAvailableCreditNotes()
      })
    }
  },
  methods: {
    async fetchAvailableCreditNotes() {
      if (!this.invoiceData?.customer) {
        this.errorMessage = 'Invoice customer information is missing'
        return
      }

      try {
        this.loading = true
        this.errorMessage = ''
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Extract customer ID (handle both string and object)
        const customerId = typeof this.invoiceData.customer === 'object' 
          ? this.invoiceData.customer._id || this.invoiceData.customer
          : this.invoiceData.customer

        // Extract invoice ID (handle both string and object)
        const invoiceId = typeof this.invoiceData._id === 'object'
          ? this.invoiceData._id._id || this.invoiceData._id
          : this.invoiceData._id

        console.log('Fetching available custom credit notes:', { customerId, invoiceId })

        const response = await this.$axios.$get(
          `/credit/notes/available/custom?customerId=${customerId}&invoiceId=${invoiceId}`,
          { headers: { Authorization: AuthStr } }
        )

        console.log('Available custom credit notes response:', response)
        this.availableCreditNotes = response.results || []
      } catch (error) {
        console.error('Error fetching available custom credit notes:', error)
        this.errorMessage = error?.response?.data?.message || 'Failed to load available credit notes. Please try again.'
        this.availableCreditNotes = []
      } finally {
        this.loading = false
      }
    },

    async selectCreditNote(creditNote) {
      try {
        this.selecting = true

        // Emit event with selected credit note
        // The parent will handle opening the apply modal
        this.$emit('credit-note-selected', {
          creditNote,
          invoice: this.invoiceData
        })

        // Close this modal
        this.handleClose()
      } catch (error) {
        console.error('Error selecting credit note:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to select credit note. Please try again.',
          type: 'error'
        })
      } finally {
        this.selecting = false
      }
    },

    editCreditNote(creditNote) {
      // Emit event to open custom credit note dialog for editing
      this.$emit('edit-custom-credit-note', creditNote)
      // Close this modal
      this.handleClose()
    },

    handleClose() {
      this.$emit('close')
    },

    resetModal() {
      this.availableCreditNotes = []
      this.errorMessage = ''
      this.loading = false
      this.selecting = false
    },

    formatAmount(amount) {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0).replace('AED', '').trim()
    },

    formatDate(dateString) {
      if (!dateString) return ''
      return moment(dateString).format('DD MMM YYYY')
    }
  }
}
</script>

<style scoped>
.selectCustomCreditNoteDialog {
  border-radius: 8px;
}

.v-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>

