<template>
  <div class="tw-mb-6">
    <!-- Skeleton Loader -->
    <StatsCardSkeleton
      v-if="loading"
      :card-count="7"
      layout="client"
    />

    <!-- Actual Stats Cards -->
    <div v-else class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-3 tw-mb-6">
      <!-- Total Points of Contact -->
      <div
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in"
        :class="{ 'tw-border-blue-500 tw-bg-blue-50': activeFilter === 'total' }"
        @click="handleCardClick('total')"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Total Points of Contact</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-blue-600">{{ stats.total || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">All contacts</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-blue-100">
          <v-icon color="primary" size="24">mdi-account-group</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-blue-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-blue-600"></div>
      </div>

      <!-- Active Points of Contact -->
      <div
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in"
        :class="{ 'tw-border-green-500 tw-bg-green-50': activeFilter === 'active' }"
        @click="handleCardClick('active')"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Active Contacts</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-green-600">{{ stats.active || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Currently active</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-green-100">
          <v-icon color="success" size="24">mdi-account-check</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-green-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-green-600"></div>
      </div>

      <!-- Inactive Points of Contact -->
      <div
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in"
        :class="{ 'tw-border-red-500 tw-bg-red-50': activeFilter === 'inactive' }"
        @click="handleCardClick('inactive')"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Inactive Contacts</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-red-600">{{ stats.inactive || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Currently inactive</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-red-100">
          <v-icon color="error" size="24">mdi-account-off</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-red-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-red-600"></div>
      </div>

      <!-- Recently Added -->
      <div
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in"
        :class="{ 'tw-border-purple-500 tw-bg-purple-50': activeFilter === 'recentlyAdded' }"
        @click="handleCardClick('recentlyAdded')"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Recently Added</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-purple-600">{{ stats.recentlyAdded || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Last 30 days</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-purple-100">
          <v-icon color="deep-purple" size="24">mdi-trending-up</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-purple-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-purple-600"></div>
      </div>

      <!-- Escalation Point of Contact -->
      <div
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in"
        :class="{ 'tw-border-red-500 tw-bg-red-50': activeFilter === 'escalationPOC' }"
        @click="handleCardClick('escalationPOC')"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Escalation POC</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-red-600">{{ stats.escalationPOC || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Escalation contacts</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-red-100">
          <v-icon color="error" size="24">mdi-phone-alert</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-red-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-red-600"></div>
      </div>

      <!-- Financial Point of Contact -->
      <div
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in"
        :class="{ 'tw-border-green-500 tw-bg-green-50': activeFilter === 'financialPOC' }"
        @click="handleCardClick('financialPOC')"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Financial POC</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-green-600">{{ stats.financialPOC || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Financial contacts</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-green-100">
          <v-icon color="success" size="24">mdi-currency-usd</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-green-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-green-600"></div>
      </div>

      <!-- HR Point of Contact -->
      <div
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-4 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in"
        :class="{ 'tw-border-blue-500 tw-bg-blue-50': activeFilter === 'hrPOC' }"
        @click="handleCardClick('hrPOC')"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">HR POC</span>
          <span class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-blue-600">{{ stats.hrPOC || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">HR contacts</span>
        </div>
        <div class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-blue-100">
          <v-icon color="primary" size="24">mdi-account-tie</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-blue-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-blue-600"></div>
      </div>
    </div>
  </div>
</template>

<script>
import StatsCardSkeleton from '@/components/admin-central/StatsCardSkeleton.vue'

export default {
  name: 'ClientAccessStatsCard',
  components: {
    StatsCardSkeleton
  },
  props: {
    stats: {
      type: Object,
      default: () => ({
        total: 0,
        active: 0,
        inactive: 0,
        byDepartment: [],
        byCompany: [],
        recentlyAdded: 0,
        missingEmail: 0,
        missingPhone: 0,
        escalationPOC: 0,
        financialPOC: 0,
        hrPOC: 0
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    activeFilter: {
      type: String,
      default: null
    }
  },
  methods: {
    getDepartmentColor(department) {
      const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ];
      const index = department ? department.charCodeAt(0) % colors.length : 0;
      return colors[index];
    },
    getCompanyColor(companyName) {
      const colors = [
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899',
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'
      ];
      const index = companyName ? companyName.charCodeAt(0) % colors.length : 0;
      return colors[index];
    },
    handleCardClick(filterType) {
      this.$emit('filterChange', filterType)
    }
  }
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
