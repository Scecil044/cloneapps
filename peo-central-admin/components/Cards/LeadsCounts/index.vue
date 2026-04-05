<template>
  <!-- <v-col cols="2" class=" pl-0"> -->
    <div class="" style="padding: 2px; width: 100%;" >

        <div
          @click="() => {
                toggleActiveTab(title)
          }
          "
          class="tw-transition-all tw-duration-300 tw-ease-in-out tw-transform hover:tw-scale-105"
          :class="[
            activeTab === title
              ? 'tw-bg-blue-50 tw-border-blue-200 tw-shadow-md'
              : 'tw-bg-white hover:tw-bg-gray-50 tw-border-gray-100',
            'tw-rounded-lg tw-border-2 tw-cursor-pointer tw-overflow-hidden tw-flex-[0_0_calc(16.28%-16px)] tw-max-w-[calc(16.28%-16px)]'
          ]"
        >
          <div class="tw-p-4 tw-flex tw-items-center tw-justify-between tw-w-full">
            <!-- Count Section -->
            <div class="tw-flex tw-flex-col tw-space-y-1">
              <span class="tw-text-gray-500 tw-text-sm tw-font-medium tw-truncate tw-capitalize">{{ title == 'completed' ? 'Closed Successful' : title }}</span>
              <span
                class="tw-text-xl tw-font-bold"
                :class="[
                  activeTab === title
                    ? 'tw-text-blue-600'
                    : 'tw-text-gray-700'
                ]"
              >
                {{ leadValue | currencyFormatter }}
              </span>
            </div>

            <!-- Icon/Indicator Section -->
            <div
              class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-ml-2"
              :class="[
                activeTab === title
                  ? 'tw-bg-blue-100'
                  : 'tw-bg-gray-100',
                getStatusColor(title)
              ]"
            >
              <span
                class="tw-text-lg tw-font-semibold"
                :class="[
                  activeTab === title
                    ? 'tw-text-blue-600'
                    : 'tw-text-gray-600'
                ]"
              >
                {{ data }}
              </span>
            </div>
          </div>

          <!-- Active Indicator -->
          <div
            v-if="activeTab == title"
            class="tw-h-1 tw-bg-blue-500 tw-w-full tw-transition-all tw-duration-300"
          ></div>
        </div>
      </div>
      <!-- <v-card color="card_bg" class="exsmal_card" style="border: 0.5px solid #e2e7f1 !important">
        <div class="d-flex align-items-center">
          <div class="d-flex align-items-center" >
            <h1 class="pl-3">{{ data }}</h1>
            <p class="subtext--text align-self-center pl-3">{{title}}</p>
          </div>
        </div>
      </v-card> -->
  <!-- </v-col> -->
</template>

<script>
export default {
  props: {
    title: String,
    activeTab: String,
    data: Number,
    leadValue: Number
  },
  data() {
    return {

    }
  },
  methods: {
    toggleActiveTab(tab){
      this.$emit('toggle-active', tab)
    },
    getStatusColor(status) {
      const colors = {
        'Waiting for Approval': 'tw-bg-red-50',
        'Lead Received': 'tw-bg-orange-50',
        'Send Proposal': 'tw-bg-green-50',
        'Contact Client': 'tw-bg-purple-50',
        'Collect Documents': 'tw-bg-indigo-50',
        'Service Agreement': 'tw-bg-yellow-50',
        'Total': 'tw-bg-pink-50',
        'Total Amount Due': 'tw-bg-blue-50'
      };
      return colors[status] || 'tw-bg-gray-50';
    },
    getStatusIcon(status) {
      const icons = {
        'Waiting for Approval': '💰',
        'Lead Received': '⚠️',
        'Contact Client': '✅',
        'Collect Documents': '📄',
        'Service Agreement': '📅',
        'Total': '📝',
        'Unapproved Invoices': '❌',
        'Total Amount Due': '💵'
      };
      return icons[status] || '📊';
    }
  }
}
</script>
