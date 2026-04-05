<template>
  <div class="tw-mb-6">
    <!-- Skeleton Loader -->
    <StatsCardSkeleton
      v-if="loading"
      :card-count="4"
      layout="internal"
    />

    <!-- Actual Stats Cards -->
    <div v-else class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3">
      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Total Employees</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-blue-600">{{ stats.total }}</span>
          <span class="tw-text-xs tw-text-gray-400">Internal Staff</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-blue-100">
          <v-icon color="primary" size="24">mdi-account-group</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-blue-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-blue-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Active Employees</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-green-600">{{ stats.active }}</span>
          <span class="tw-text-xs tw-text-gray-400">Currently working</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-green-100">
          <v-icon color="success" size="24">mdi-account-check</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-green-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-green-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">With Portal Access</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-purple-600">{{ stats.access }}</span>
          <span class="tw-text-xs tw-text-gray-400">Admin portal privileges</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-purple-100">
          <v-icon color="deep-purple" size="24">mdi-shield-account</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-purple-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-purple-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Recently Added</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-orange-600">{{ stats.recentlyAdded || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Last 30 days</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-orange-100">
          <v-icon color="orange" size="24">mdi-account-plus</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-orange-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-orange-600"></div>
      </div>
    </div>
  </div>
</template>

<script>
import StatsCardSkeleton from '@/components/admin-central/StatsCardSkeleton.vue'

export default {
  components: {
    StatsCardSkeleton
  },
  props: {
    stats: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1);
}
</style>
