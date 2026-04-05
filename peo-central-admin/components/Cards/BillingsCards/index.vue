<template>
  <v-row>
    <v-col cols="12">
      <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-py-2 tw-w-full">
        <div
          v-for="(item, index) in data"
          :key="index"
          @click="() => {
              if (item.name != 'Total Amount Due') {
                toggleActiveTab(item)
              }
          }
          "
          class="tw-transition-all tw-duration-300 tw-ease-in-out tw-transform hover:tw-scale-105"
          :class="[
            activeTab === item.name
              ? 'tw-bg-blue-50 tw-border-blue-200 tw-shadow-md'
              : 'tw-bg-white hover:tw-bg-gray-50 tw-border-gray-100',
            'tw-rounded-lg tw-border-2 tw-cursor-pointer tw-overflow-hidden tw-flex-[0_0_calc(16.28%-16px)] tw-max-w-[calc(16.28%-16px)]'
          ]"
        >
          <div class="tw-p-4 tw-flex tw-items-center tw-justify-between tw-w-full">
            <!-- Count Section -->
            <div class="tw-flex tw-flex-col tw-space-y-1">
              <span class="tw-text-gray-500 tw-text-sm tw-font-medium tw-truncate">{{ item.name }}</span>
              <span
                class="tw-text-xl tw-font-bold"
                :class="[
                  activeTab === item.name
                    ? 'tw-text-blue-600'
                    : 'tw-text-gray-700'
                ]"
              >
                {{ item.totals | currencyFormatter }}
              </span>
              <span
                v-if="item.amount !== undefined && item.amount !== null && item.amount !== ''"
                class="tw-text-sm tw-font-medium tw-text-gray-600"
                :class="[
                  activeTab === index ? 'tw-text-blue-500' : 'tw-text-gray-600'
                ]"
              >
                {{ formatCurrency(item.amount) }}
              </span>
            </div>

            <!-- Icon/Indicator Section -->
            <div
             v-if="item.name != 'Total Amount Due'"
              class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-ml-2"
              :class="[
                activeTab === item.name
                  ? 'tw-bg-blue-100'
                  : 'tw-bg-gray-100',
                getStatusColor(item.name)
              ]"
            >
              <span
                class="tw-text-lg tw-font-semibold"
                :class="[
                  activeTab === item.name
                    ? 'tw-text-blue-600'
                    : 'tw-text-gray-600'
                ]"
              >
                {{  item.count }}
              </span>
            </div>
          </div>

          <!-- Active Indicator -->
          <div
            v-if="activeTab == item.name"
            class="tw-h-1 tw-bg-blue-500 tw-w-full tw-transition-all tw-duration-300"
          ></div>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    activeTab: {
      type: String
    }
  },
  data() {
    return {
    };
  },
  methods: {
    toggleActiveTab(status) {
      this.$emit('statusToggle', status)
    },
    getStatusColor(status) {
      const colors = {
        'Unpaid Invoices': 'tw-bg-red-50',
        'Expiring Soon': 'tw-bg-orange-50',
        'Paid Invoices': 'tw-bg-green-50',
        'General Invoices': 'tw-bg-purple-50',
        'Monthly Invoices': 'tw-bg-indigo-50',
        'Draft Invoices': 'tw-bg-yellow-50',
        'Unapproved Invoices': 'tw-bg-pink-50',
        'Total Amount Due': 'tw-bg-blue-50'
      };
      return colors[status] || 'tw-bg-gray-50';
    },
    getStatusIcon(status) {
      const icons = {
        'Unpaid Invoices': '💰',
        'Expiring Soon': '⚠️',
        'Paid Invoices': '✅',
        'General Invoices': '📄',
        'Monthly Invoices': '📅',
        'Draft Invoices': '📝',
        'Unapproved Invoices': '❌',
        'Total Amount Due': '💵'
      };
      return icons[status] || '📊';
    }
  }
};
</script>

<style scoped>
/* Add any custom styles that can't be handled by Tailwind here */
.tw-transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Optional: Add a subtle hover effect */
.hover\:tw-scale-105:hover {
  transform: scale(1.05);
}

/* Ensure cards maintain equal width and wrap after 7 items */
@media (min-width: 1280px) {
  .tw-flex-\[0_0_calc\(14\.28\%-16px\)\] {
    flex-basis: calc(14.28% - 16px);
    max-width: calc(14.28% - 16px);
  }
}

/* Responsive adjustments for smaller screens */
@media (max-width: 1279px) {
  .tw-flex-\[0_0_calc\(14\.28\%-16px\)\] {
    flex-basis: calc(33.33% - 16px);
    max-width: calc(33.33% - 16px);
  }
}

@media (max-width: 768px) {
  .tw-flex-\[0_0_calc\(14\.28\%-16px\)\] {
    flex-basis: calc(50% - 16px);
    max-width: calc(50% - 16px);
  }
}

@media (max-width: 480px) {
  .tw-flex-\[0_0_calc\(14\.28\%-16px\)\] {
    flex-basis: 100%;
    max-width: 100%;
  }
}
</style>
