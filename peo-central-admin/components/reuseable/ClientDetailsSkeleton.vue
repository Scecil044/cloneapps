<template>
  <div class="tw-p-6">
    <div class="tw-space-y-4">
      <!-- Header Skeleton -->
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <div class="tw-flex tw-space-x-3 tw-items-center">
          <div class="tw-w-10 tw-h-10 tw-rounded-full tw-bg-gradient-to-br tw-from-gray-200 tw-to-gray-300 skeleton-shimmer"></div>
          <div class="tw-space-y-2">
            <div class="tw-h-5 tw-w-32 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md skeleton-shimmer"></div>
            <div class="tw-h-3 tw-w-24 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer" style="animation-delay: 0.1s"></div>
          </div>
        </div>
        <div class="tw-h-10 tw-w-24 tw-bg-gradient-to-r tw-from-blue-200 tw-to-blue-300 tw-rounded-lg skeleton-shimmer" style="animation-delay: 0.2s"></div>
      </div>

      <!-- Tabs Skeleton -->
      <div class="tw-border-b tw-border-gray-200">
        <div class="tw-flex tw-space-x-6 tw-pb-2">
          <div class="tw-h-8 tw-w-20 tw-bg-gradient-to-r tw-from-blue-200 tw-to-blue-300 tw-rounded-t-lg skeleton-shimmer tw-border-b-2 tw-border-blue-500" style="animation-delay: 0.3s"></div>
          <div class="tw-h-8 tw-w-24 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-t-lg skeleton-shimmer" style="animation-delay: 0.4s"></div>
          <div class="tw-h-8 tw-w-16 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-t-lg skeleton-shimmer" style="animation-delay: 0.5s"></div>
        </div>
      </div>

      <!-- List Item Skeletons -->
      <div class="tw-space-y-4 tw-mt-6">
        <div v-for="i in 5" :key="i" class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-4 tw-transition-all tw-duration-300 hover:tw-shadow-md tw-relative tw-overflow-hidden">
          <div class="tw-flex tw-justify-between tw-items-center">
            <div class="tw-flex tw-space-x-3">
              <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-gradient-to-br tw-from-gray-200 tw-to-gray-300 skeleton-shimmer" 
                   :style="{ animationDelay: (i * 0.1) + 's' }"></div>
              <div class="tw-space-y-2">
                <div class="tw-h-5 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-w-40 skeleton-shimmer"
                     :style="{ animationDelay: (i * 0.1 + 0.05) + 's' }"></div>
                <div class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md tw-w-32 skeleton-shimmer"
                     :style="{ animationDelay: (i * 0.1 + 0.1) + 's' }"></div>
              </div>
            </div>
            <div class="tw-flex tw-space-x-2">
              <div class="tw-h-8 tw-w-8 tw-rounded-full tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 skeleton-shimmer"
                   :style="{ animationDelay: (i * 0.1 + 0.15) + 's' }"></div>
              <div class="tw-h-8 tw-w-8 tw-rounded-full tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 skeleton-shimmer"
                   :style="{ animationDelay: (i * 0.1 + 0.2) + 's' }"></div>
            </div>
          </div>
          
          <!-- List item details -->
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mt-4">
            <div class="tw-space-y-1" v-for="j in 2" :key="j">
              <div class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md"
                   :class="j % 2 === 0 ? 'tw-w-20' : 'tw-w-24'" 
                   :style="{ animationDelay: (i * 0.1 + 0.25 + j * 0.05) + 's' }"></div>
              <div class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md" 
                   :class="j % 2 === 0 ? 'tw-w-32' : 'tw-w-28'"
                   :style="{ animationDelay: (i * 0.1 + 0.3 + j * 0.05) + 's' }"></div>
            </div>
          </div>
          
          <!-- Wave effect -->
          <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-transparent tw-via-white/20 tw-to-transparent skeleton-wave tw-pointer-events-none"
               :style="{ animationDelay: (i * 0.2) + 's' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientDetailsSkeleton'
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
    rgba(255, 255, 255, 0.2),
    transparent
  );
  background-size: 300% 100%;
  animation: wave 3s ease-in-out infinite;
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
    background-position: -300% 0;
  }
  100% {
    background-position: 300% 0;
  }
}

/* Enhanced hover effects */
.tw-rounded-xl:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease-in-out;
}
</style>
