<template>
  <div class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-overflow-hidden tw-h-[90vh]">
    <!-- Header Skeleton -->
    <div class="tw-p-4 tw-border-b tw-border-gray-100">
      <div class="tw-flex tw-justify-between tw-items-center">
        <!-- Search Input Skeleton -->
        <div class="tw-w-3/4 tw-h-10 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer"></div>
        
        <!-- Filter Button Skeleton -->
        <div class="tw-w-10 tw-h-10 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer" style="animation-delay: 0.1s"></div>
      </div>
    </div>
    
    <!-- List Items Skeletons -->
    <div class="tw-overflow-auto tw-h-[calc(90vh-64px)]">
      <div v-for="i in 12" :key="i" class="tw-p-4 tw-border-b tw-border-gray-100 tw-transition-colors hover:tw-bg-gray-50">
        <div class="tw-flex tw-items-center tw-space-x-3">
          <!-- Company Logo Skeleton -->
          <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 skeleton-shimmer"
               :style="{ animationDelay: (i * 0.1) + 's' }"></div>
          
          <!-- Company Details Skeleton -->
          <div class="tw-flex-1">
            <!-- Company Name -->
            <div class="tw-h-5 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-mb-2"
                 :class="i % 3 === 0 ? 'tw-w-3/4' : i % 2 === 0 ? 'tw-w-1/2' : 'tw-w-2/3'"
                 :style="{ animationDelay: (i * 0.1 + 0.05) + 's' }"></div>
            
            <!-- Email -->
            <div class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md"
                 :class="i % 3 === 0 ? 'tw-w-2/3' : i % 2 === 0 ? 'tw-w-3/5' : 'tw-w-1/2'"
                 :style="{ animationDelay: (i * 0.1 + 0.1) + 's' }"></div>
          </div>
          
          <!-- Status Badge Skeleton -->
          <div class="tw-h-6 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-full tw-px-3"
               :class="i % 3 === 0 ? 'tw-w-16' : i % 2 === 0 ? 'tw-w-20' : 'tw-w-14'"
               :style="{ animationDelay: (i * 0.1 + 0.15) + 's' }"></div>
        </div>
      </div>
    </div>
    
    <!-- Wave effect -->
    <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-transparent tw-via-white/10 tw-to-transparent skeleton-wave tw-pointer-events-none"></div>
  </div>
</template>

<script>
export default {
  name: 'CusListSkeleton'
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
</style>
