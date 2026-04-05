<template>
  <div class="tw-h-screen tw-bg-dashboard_bg tw-animate-pulse">
    <div class="tw-flex tw-h-full">
      <!-- Sidebar Skeleton -->
      <aside class="tw-bg-white dark:tw-bg-navbar_bg tw-h-full tw-w-80 tw-border-r tw-border-gray-200 dark:tw-border-gray-700 tw-hidden lg:tw-block">
        <div class="tw-h-16 tw-px-4 tw-border-b tw-border-gray-200 dark:tw-border-gray-700 tw-flex tw-items-center">
          <div class="tw-w-32 tw-h-8 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded"></div>
        </div>
        <div class="tw-px-4 tw-pt-4">
          <div v-for="i in 6" :key="i" class="tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-mb-4 tw-w-3/4"></div>
        </div>
      </aside>
      <!-- Main Content Skeleton -->
      <div class="tw-flex-1 tw-flex tw-flex-col tw-h-full tw-min-w-0">
        <!-- Top Bar Skeleton -->
        <header class="tw-flex tw-items-center tw-h-16 tw-px-4 md:tw-px-6 tw-bg-white dark:tw-bg-dashboard_bg tw-border-b tw-border-gray-200 tw-shadow-sm dark:tw-border-gray-700 tw-z-30">
          <div class="tw-w-40 tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded"></div>
          <div class="tw-ml-auto tw-flex tw-items-center tw-gap-4">
            <div class="tw-w-8 tw-h-8 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded-full"></div>
            <div class="tw-w-24 tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded"></div>
          </div>
        </header>
        <main class="tw-flex-1 tw-overflow-y-auto tw-p-4 md:tw-p-6 tw-bg-gray-50 dark:tw-bg-dashboard_bg">
          <!-- Stats Cards Skeleton -->
          <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-5 tw-gap-4 tw-mb-6">
            <div v-for="i in 5" :key="i" class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-4 tw-shadow-md tw-border tw-border-gray-200 dark:tw-border-gray-700 tw-flex tw-flex-col tw-gap-2">
              <div class="tw-h-4 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/2"></div>
              <div class="tw-h-8 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-2/3"></div>
              <div class="tw-h-3 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded tw-w-1/3"></div>
              <div class="tw-h-2 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded tw-w-full"></div>
            </div>
          </div>
          <!-- Charts Row Skeleton -->
          <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6 tw-mb-6">
            <div class="lg:tw-col-span-2 tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
              <div class="tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/3 tw-mb-4"></div>
              <div class="tw-h-48 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded"></div>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
              <div class="tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/2 tw-mb-4"></div>
              <div class="tw-h-48 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded"></div>
            </div>
          </div>
          <!-- Tables Row Skeleton -->
          <div class="tw-grid tw-grid-cols-1 xl:tw-grid-cols-2 tw-gap-6 tw-mb-6">
            <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
              <div class="tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/3 tw-mb-4"></div>
              <div class="tw-space-y-2">
                <div v-for="i in 5" :key="i" class="tw-h-6 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded"></div>
              </div>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
              <div class="tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/3 tw-mb-4"></div>
              <div class="tw-space-y-2">
                <div v-for="i in 5" :key="i" class="tw-h-6 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded"></div>
              </div>
            </div>
          </div>
          <!-- Bottom Row Skeleton -->
          <div class="tw-grid tw-grid-cols-1 xl:tw-grid-cols-2 tw-gap-6">
            <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
              <div class="tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/3 tw-mb-4"></div>
              <div class="tw-space-y-2">
                <div v-for="i in 5" :key="i" class="tw-h-6 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded"></div>
              </div>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
              <div class="tw-h-6 tw-bg-gray-200 dark:tw-bg-gray-700 tw-rounded tw-w-1/3 tw-mb-4"></div>
              <div class="tw-space-y-2">
                <div v-for="i in 5" :key="i" class="tw-h-6 tw-bg-gray-100 dark:tw-bg-gray-800 tw-rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardSkeleton',
  data() {
    return {
      loading: true
    }
  },
  mounted() {
  
  }
}
</script>
