<template>
  <div class="tw-p-2 tw-flex tw-items-center tw-gap-4 tw-w-full">
    <v-card
      v-for="(cards, index) in LeadsCardData"
      :key="index"
      color="card_bg"
      class="tw-relative tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-shadow-lg hover:tw-scale-105"
      style="border: 1px solid #e2e7f1"
    >
      <div class="tw-flex tw-items-center tw-p-4 tw-min-h-[100px]">
        <!-- Icon/Value Container -->
        <div class="tw-flex tw-items-center tw-justify-center tw-min-w-[80px] tw-h-16 tw-bg-gradient-to-br  tw-rounded-full tw-mr-4">
          <h1
            v-if="!loading"
            class="tw-text-lg tw-font-bold tw-text-blue-600 tw-mb-0"
          >
            {{ cards.cardVal }}
          </h1>
          <v-progress-circular
            v-else
            indeterminate
            size="24"
            color="primary"
          />
        </div>

        <!-- Title Container -->
        <div class="tw-flex tw-flex-col tw-justify-center tw-flex-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-600 tw-leading-tight tw-max-w-[120px]">
            {{ cards.title }}
          </span>
        </div>
      </div>

      <!-- Enhanced Conversion Rate Tooltip -->
      <v-tooltip
        v-if="cards.title === 'Conversion Rate' && conversionRateDetails"
        bottom
        max-width="550px"
        z-index="9999"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
            class="tw-absolute tw-inset-0 tw-cursor-help"
          />
          <!-- Info Icon Indicator -->
          <div class="tw-absolute tw-top-2 tw-right-2 tw-opacity-60 hover:tw-opacity-100 tw-transition-opacity">
            <svg class="tw-w-4 tw-h-4 tw-text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
        </template>

        <div class="conversion-rate-tooltip">
          <div class="tw-mb-4">
            <h4 class="tw-text-lg tw-font-semibold tw-text-blue-400 tw-mb-0">
              Conversion Rate Calculation
            </h4>
          </div>

          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-text-white tw-mb-2">Formula:</div>
            <div class="tw-bg-gray-800 tw-p-3 tw-rounded-lg tw-border tw-border-gray-600">
              <code class="tw-text-green-400 tw-font-mono tw-text-sm">
                Conversion Rate = (Successful Leads ÷ Total Leads) × 100
              </code>
            </div>
          </div>

          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-text-white tw-mb-2">Current Data:</div>
            <div class="tw-space-y-1 tw-text-sm">
              <div class="tw-flex tw-justify-between">
                <span class="tw-text-gray-300">Total Leads:</span>
                <span class="tw-font-semibold tw-text-white">{{ conversionRateDetails.total_leads }}</span>
              </div>
              <div class="tw-flex tw-justify-between">
                <span class="tw-text-gray-300">Unsuccessful Leads:</span>
                <span class="tw-font-semibold tw-text-red-400">{{ conversionRateDetails.unsuccessful_leads }}</span>
              </div>
              <div class="tw-flex tw-justify-between">
                <span class="tw-text-gray-300">Successful Leads:</span>
                <span class="tw-font-semibold tw-text-green-400">{{ conversionRateDetails.successful_leads }}</span>
              </div>
              <div class="tw-flex tw-justify-between tw-pt-2 tw-border-t tw-border-gray-600">
                <span class="tw-text-gray-300">Conversion Rate:</span>
                <span class="tw-font-bold tw-text-blue-400">{{ Math.round(conversionRateDetails.conversion_rate) }}%</span>
              </div>
            </div>
          </div>

          <div class="tw-mb-4">
            <div class="tw-font-semibold tw-text-white tw-mb-2">Calculation:</div>
            <div class="tw-bg-gray-800 tw-p-3 tw-rounded-lg tw-border tw-border-gray-600">
              <code class="tw-text-yellow-400 tw-font-mono tw-text-sm">
                ({{ conversionRateDetails.successful_leads }} ÷ {{ conversionRateDetails.total_leads }}) × 100 = {{ Math.round(conversionRateDetails.conversion_rate) }}%
              </code>
            </div>
          </div>

          <div class="tw-text-xs tw-text-gray-400 tw-italic tw-border-t tw-border-gray-600 tw-pt-2">
            Note: Only non-deleted leads are included in this calculation.
          </div>
        </div>
      </v-tooltip>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    LeadsCardData: Array,
    conversionRateDetails: Object,
    loading: Boolean
  },
  data() {
    return {}
  }
}
</script>

<style scoped>
.conversion-rate-tooltip {
  text-align: left;
  line-height: 1.6;
  padding: 16px;
  background-color: #1f2937;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  min-width: 450px;
  max-width: 550px;
  color: white;
  border: 1px solid #374151;
}

.conversion-rate-tooltip code {
  background-color: #111827;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  display: inline-block;
  margin: 4px 0;
  word-break: break-all;
  border: 1px solid #4b5563;
}

/* Ensure tooltip is visible above other elements */
.v-tooltip__content {
  z-index: 9999 !important;
  max-width: 550px !important;
}

/* Custom card hover effects */
.v-card {
  backdrop-filter: blur(4px);
}

.v-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}
</style>
