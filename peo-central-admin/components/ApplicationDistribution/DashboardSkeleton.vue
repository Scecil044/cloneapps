<template>
  <div class="tw-space-y-8">
    <!-- Tabs Skeleton -->
    <div class="tw-flex tw-border-b tw-border-gray-200 tw-mb-6">
      <div v-for="i in 2" :key="'tab-skel-' + i" class="tw-px-5 tw-py-3 tw-mr-4">
        <div class="tw-h-6 tw-w-24 tw-rounded-md skeleton-shimmer"></div>
      </div>
    </div>
    
    <!-- Main content for active tab -->
    <div v-if="activeTab === 'overview'">
      <!-- Stat Cards Skeleton -->
      <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6 tw-mb-8">
        <div v-for="i in 4" :key="'stat-skel-' + i" class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-5 tw-flex tw-items-center tw-gap-4 tw-relative tw-overflow-hidden">
          <div class="tw-w-12 tw-h-12 tw-rounded-full skeleton-shimmer"></div>
          <div class="tw-flex-1 tw-space-y-2">
            <div class="tw-h-4 tw-w-1/2 tw-rounded-md skeleton-shimmer"></div>
            <div class="tw-h-7 tw-w-1/3 tw-rounded-md skeleton-shimmer"></div>
            <div class="tw-h-3 tw-w-1/4 tw-rounded-md skeleton-shimmer"></div>
          </div>
          <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full skeleton-shimmer"></div>
        </div>
      </div>
    </div>
    
    <!-- Clients tab skeleton -->
    <div v-else-if="activeTab === 'clients'">
      <div class="tw-h-8 tw-w-40 tw-rounded-md mb-6 skeleton-shimmer"></div>
      <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6 tw-mb-8 tw-pl-6">
        <div v-for="i in 5" :key="'client-stat-skel-' + i" class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-5 tw-flex tw-items-center tw-gap-4 tw-relative tw-overflow-hidden">
          <div class="tw-w-12 tw-h-12 tw-rounded-full skeleton-shimmer"></div>
          <div class="tw-flex-1 tw-space-y-2">
            <div class="tw-h-4 tw-w-1/2 tw-rounded-md skeleton-shimmer"></div>
            <div class="tw-h-7 tw-w-1/3 tw-rounded-md skeleton-shimmer"></div>
            <div class="tw-h-3 tw-w-1/4 tw-rounded-md skeleton-shimmer"></div>
          </div>
          <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full skeleton-shimmer"></div>
        </div>
      </div>
    </div>
    <!-- Chart Skeletons -->
    <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
      <div v-for="i in 2" :key="'chart-skel-' + i" class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-8 tw-overflow-hidden tw-relative">
        <div class="tw-h-7 tw-w-1/3 tw-rounded-md mb-6 skeleton-shimmer"></div>
        <div class="tw-h-48 tw-bg-gradient-to-br tw-from-gray-50 tw-via-gray-100 tw-to-gray-150 tw-rounded-lg tw-relative tw-overflow-hidden">
          <div class="tw-absolute tw-inset-0 skeleton-wave"></div>
          <div v-if="i === 1" class="tw-absolute tw-bottom-4 tw-left-4 tw-right-4 tw-flex tw-items-end tw-justify-between">
            <div v-for="j in 6" :key="'bar-' + j" class="tw-w-8 tw-bg-gray-200 tw-rounded-t skeleton-shimmer" :style="{ height: (40 + j*8) + '%', animationDelay: (0.5 + j*0.1) + 's' }"></div>
          </div>
          <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-full">
            <div class="tw-w-32 tw-h-32 tw-rounded-full tw-border-8 tw-border-gray-200 tw-border-t-gray-300 skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Table/List Skeletons: Recent Onboardings & Recent Tickets -->
    <div class="tw-flex tw-flex-col lg:tw-flex-row tw-gap-6 tw-w-full">
      <div v-for="i in 2" :key="'table-skel-' + i" class="tw-flex-1 tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-6 tw-overflow-hidden tw-relative">
        <div class="tw-h-6 tw-w-1/3 tw-rounded-md mb-4 skeleton-shimmer"></div>
        <div class="tw-flex tw-gap-2 mb-2">
          <div v-for="j in 5" :key="'thead-' + j" class="tw-h-4 tw-w-1/6 tw-rounded-md skeleton-shimmer"></div>
        </div>
        <div class="tw-space-y-4">
          <div v-for="k in 3" :key="'row-' + k" class="tw-flex tw-items-center tw-gap-3">
            <div class="tw-w-7 tw-h-7 tw-rounded-full skeleton-shimmer"></div>
            <div class="tw-flex-1 tw-space-y-1">
              <div class="tw-h-4 tw-w-2/3 tw-rounded-md skeleton-shimmer"></div>
              <div class="tw-h-3 tw-w-1/2 tw-rounded-md skeleton-shimmer"></div>
            </div>
            <div class="tw-w-12 tw-h-3 tw-rounded-md skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Bottom Row: Mobile Users and Placeholder -->
    <div class="tw-flex tw-gap-6 tw-mt-6 tw-w-full">
      <div class="tw-flex-1 tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-6 tw-overflow-hidden tw-relative">
        <div class="tw-h-6 tw-w-1/3 tw-rounded-md mb-4 skeleton-shimmer"></div>
        <div class="tw-flex tw-gap-2 mb-2">
          <div v-for="j in 4" :key="'thead-mob-' + j" class="tw-h-4 tw-w-1/6 tw-rounded-md skeleton-shimmer"></div>
        </div>
        <div class="tw-space-y-4">
          <div v-for="k in 3" :key="'mob-row-' + k" class="tw-flex tw-items-center tw-gap-3">
            <div class="tw-w-7 tw-h-7 tw-rounded-full skeleton-shimmer"></div>
            <div class="tw-flex-1 tw-space-y-1">
              <div class="tw-h-4 tw-w-2/3 tw-rounded-md skeleton-shimmer"></div>
              <div class="tw-h-3 tw-w-1/2 tw-rounded-md skeleton-shimmer"></div>
            </div>
            <div class="tw-w-12 tw-h-3 tw-rounded-md skeleton-shimmer"></div>
          </div>
        </div>
      </div>
      <div class="tw-flex-1 tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-6 tw-flex tw-items-center tw-justify-center tw-h-full">
        <div class="tw-h-10 tw-w-1/2 tw-rounded-md skeleton-shimmer"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardSkeleton',
  props: {
    activeTab: {
      type: String,
      default: 'overview'
    }
  },
}
</script>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}
.skeleton-wave {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  background-size: 200% 100%;
  animation: wave 2.5s ease-in-out infinite;
}
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
@keyframes wave {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>