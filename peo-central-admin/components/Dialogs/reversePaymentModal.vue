<template>
  <v-dialog v-model="open" max-width="600px" persistent>
    <v-card class="rounded-xl">
      <v-card-title class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4">
        <div class="tw-flex tw-items-center">
          <div class="tw-w-12 tw-h-12 tw-mr-4 tw-bg-red-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
            <svg class="tw-w-6 tw-h-6 tw-text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 class="tw-text-xl tw-font-bold tw-text-gray-900">Reverse Payment</h3>
            <p class="tw-text-sm tw-text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        <v-btn icon @click="close" :disabled="loading">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="tw-px-6 tw-py-4">
        <!-- Payment Details -->
        <div class="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-mb-6">
          <h4 class="tw-font-semibold tw-text-gray-900 tw-mb-3">Payment Details</h4>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <span class="tw-text-sm tw-text-gray-600">Payment ID:</span>
              <p class="tw-font-medium">{{ payment?.payment_number || '-' }}</p>
            </div>
            <div>
              <span class="tw-text-sm tw-text-gray-600">Amount:</span>
              <p class="tw-font-medium">{{ payment?.amount | currencyFormatter || '-' }}</p>
            </div>
            <div>
              <span class="tw-text-sm tw-text-gray-600">Payment Method:</span>
              <p class="tw-font-medium">{{ payment?.payment_mode || '-' }}</p>
            </div>
            <div>
              <span class="tw-text-sm tw-text-gray-600">Payment Date:</span>
              <p class="tw-font-medium">{{ payment?.createdAt | formatDateWithoutTime || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Impact Warning -->
        <div class="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg tw-p-4 tw-mb-6">
          <div class="tw-flex">
            <div class="tw-flex-shrink-0">
              <svg class="tw-h-5 tw-w-5 tw-text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="tw-ml-3">
              <h3 class="tw-text-sm tw-font-medium tw-text-yellow-800">Impact of Reversal</h3>
              <div class="tw-mt-2 tw-text-sm tw-text-yellow-700">
                <ul class="tw-list-disc tw-list-inside tw-space-y-1">
                  <li>Invoice status will be updated based on remaining balance</li>
                  <li>Payment will be marked as reversed and hidden from active records</li>
                  <li>All related journal entries will be reversed</li>
                  <li>This action will be logged for audit purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Reason Input -->
        <div class="tw-mb-4">
          <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
            Reason for Reversal <span class="tw-text-red-500">*</span>
          </label>
          <v-textarea
            v-model="reason"
            placeholder="Please provide a detailed reason for reversing this payment (minimum 10 characters)..."
            :rules="reasonRules"
            :counter="500"
            outlined
            rows="4"
            :disabled="loading"
            class="tw-text-sm"
          ></v-textarea>
          <p class="tw-text-xs tw-text-gray-500 tw-mt-1">
            This reason will be recorded in the audit log and cannot be changed.
          </p>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="tw-px-6 tw-py-4 tw-bg-gray-50">
        <v-spacer></v-spacer>
        <v-btn
          @click="close"
          :disabled="loading"
          outlined
          class="tw-mr-3"
        >
          Cancel
        </v-btn>
        <v-btn
          @click="confirm"
          :loading="loading"
          :disabled="!isFormValid"
          color="error"
          class="tw-px-6"
        >
          Reverse Payment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ReversePaymentModal',
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
      reason: '',
      reasonRules: [
        v => !!v || 'Reason is required',
        v => (v && v.length >= 10) || 'Reason must be at least 10 characters long',
        v => (v && v.length <= 500) || 'Reason cannot exceed 500 characters'
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.reason && this.reason.length >= 10 && this.reason.length <= 500;
    }
  },
  watch: {
    open(newVal) {
      if (newVal) {
        this.reason = '';
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    confirm() {
      if (this.isFormValid) {
        this.$emit('confirm', this.reason.trim());
      }
    }
  }
}
</script>
