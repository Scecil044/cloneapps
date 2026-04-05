<template>
  <div class="tw-p-4 tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-gray-100 tw-space-y-4 tw-mb-4 tw-overflow-hidden tw-relative">
    
    <!-- Delete Icon - Top Right -->
    <div class="tw-flex tw-justify-end tw-mb-2">
      <div class="tw-w-6 tw-h-6 tw-rounded tw-bg-gradient-to-r tw-from-red-100 tw-to-red-200 skeleton-shimmer"></div>
    </div>
    
    <!-- Progress Stepper Skeleton -->
    <div class="tw-relative">
      <!-- Progress Line -->
      <div class="tw-absolute tw-top-4 tw-left-4 tw-right-4 tw-h-0.5 tw-bg-gray-200">
        <!-- Active Progress Line -->
        <div class="tw-h-full tw-bg-gradient-to-r tw-from-blue-200 tw-to-blue-300 tw-w-1/5 skeleton-progress-fill"></div>
      </div>
      
      <!-- Steps Container -->
      <div class="tw-flex tw-justify-between tw-items-start tw-relative tw-z-10">
        <!-- Step 1 - Active/Completed -->
        <div class="tw-flex tw-flex-col tw-items-center tw-w-1/5">
          <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-blue-200 tw-flex tw-items-center tw-justify-center tw-mb-2 tw-shadow-sm">
            <div class="tw-w-4 tw-h-4 tw-text-white tw-rounded tw-bg-white/20 skeleton-shimmer"></div>
          </div>
          <div class="tw-text-center tw-space-y-1">
            <div class="tw-h-3 tw-bg-gradient-to-r tw-from-blue-200 tw-to-blue-300 tw-rounded-md tw-w-14 skeleton-shimmer"></div>
            <div class="tw-h-2 tw-bg-gradient-to-r tw-from-blue-100 tw-to-blue-200 tw-rounded-md tw-w-10 skeleton-shimmer" style="animation-delay: 0.1s"></div>
          </div>
        </div>
        
        <!-- Step 2 - Current -->
        <div class="tw-flex tw-flex-col tw-items-center tw-w-1/5">
          <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white tw-border-3 tw-border-blue-200 tw-flex tw-items-center tw-justify-center tw-mb-2 tw-shadow-sm skeleton-pulse">
            <div class="tw-w-2 tw-h-2 tw-bg-blue-200 tw-rounded-full skeleton-shimmer"></div>
          </div>
          <div class="tw-text-center tw-space-y-1">
            <div class="tw-h-3 tw-bg-gradient-to-r tw-from-blue-200 tw-to-blue-300 tw-rounded-md tw-w-16 skeleton-shimmer" style="animation-delay: 0.2s"></div>
            <div class="tw-h-2 tw-bg-gradient-to-r tw-from-blue-100 tw-to-blue-200 tw-rounded-md tw-w-12 skeleton-shimmer" style="animation-delay: 0.3s"></div>
          </div>
        </div>
        
        <!-- Step 3 - Pending -->
        <div class="tw-flex tw-flex-col tw-items-center tw-w-1/5">
          <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white tw-border-2 tw-border-gray-300 tw-flex tw-items-center tw-justify-center tw-mb-2">
            <div class="tw-w-2 tw-h-2 tw-bg-gray-300 tw-rounded-full skeleton-shimmer" style="animation-delay: 0.4s"></div>
          </div>
          <div class="tw-text-center tw-space-y-1">
            <div class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-w-14 skeleton-shimmer" style="animation-delay: 0.5s"></div>
            <div class="tw-h-2 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md tw-w-12 skeleton-shimmer" style="animation-delay: 0.6s"></div>
          </div>
        </div>
        
        <!-- Step 4 - Pending -->
        <div class="tw-flex tw-flex-col tw-items-center tw-w-1/5">
          <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white tw-border-2 tw-border-gray-300 tw-flex tw-items-center tw-justify-center tw-mb-2">
            <div class="tw-w-2 tw-h-2 tw-bg-gray-300 tw-rounded-full skeleton-shimmer" style="animation-delay: 0.7s"></div>
          </div>
          <div class="tw-text-center tw-space-y-1">
            <div class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-w-14 skeleton-shimmer" style="animation-delay: 0.8s"></div>
            <div class="tw-h-2 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md tw-w-8 skeleton-shimmer" style="animation-delay: 0.9s"></div>
          </div>
        </div>
        
        <!-- Step 5 - Pending -->
        <div class="tw-flex tw-flex-col tw-items-center tw-w-1/5">
          <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white tw-border-2 tw-border-gray-300 tw-flex tw-items-center tw-justify-center tw-mb-2">
            <div class="tw-w-2 tw-h-2 tw-bg-gray-300 tw-rounded-full skeleton-shimmer" style="animation-delay: 1s"></div>
          </div>
          <div class="tw-text-center tw-space-y-1">
            <div class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-w-12 skeleton-shimmer" style="animation-delay: 1.1s"></div>
            <div class="tw-h-2 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md tw-w-16 skeleton-shimmer" style="animation-delay: 1.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area Skeleton -->
    <div class="tw-space-y-3 tw-mt-6">
      <!-- Header Section -->
      <div class="tw-flex tw-items-center tw-gap-3">
        <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-gradient-to-br tw-from-gray-200 tw-to-gray-300 skeleton-shimmer" style="animation-delay: 1.3s"></div>
        <div class="tw-space-y-1">
          <div class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-w-40 skeleton-shimmer" style="animation-delay: 1.4s"></div>
          <div class="tw-h-2 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md tw-w-24 skeleton-shimmer" style="animation-delay: 1.5s"></div>
        </div>
      </div>

      <!-- Form Fields Skeleton -->
      <div class="tw-grid tw-grid-cols-2 tw-gap-3">
        <div v-for="i in 4" :key="'field-'+i" class="tw-space-y-1">
          <div class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-w-20 skeleton-shimmer" 
               :style="{ animationDelay: (1.6 + i * 0.1) + 's' }"></div>
          <div class="tw-h-8 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md tw-w-full skeleton-shimmer"
               :style="{ animationDelay: (1.7 + i * 0.1) + 's' }"></div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="tw-flex tw-justify-end tw-gap-2 tw-pt-3 tw-border-t tw-border-gray-100">
      <div class="tw-h-8 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md tw-w-16 skeleton-shimmer" style="animation-delay: 2.2s"></div>
      <div class="tw-h-8 tw-bg-gradient-to-r tw-from-blue-200 tw-to-blue-300 tw-rounded-md tw-w-12 skeleton-shimmer" style="animation-delay: 2.3s"></div>
    </div>

    <!-- Overall wave effect -->
    <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-transparent tw-via-white/10 tw-to-transparent skeleton-wave tw-pointer-events-none"></div>
  </div>
</template>

<script>
export default {
  name: 'OnboardingEmployeeDetailsSkeleton'
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
  animation: wave 4s ease-in-out infinite;
}

.skeleton-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.skeleton-progress-fill {
  background: linear-gradient(
    90deg,
    #bfdbfe,
    #93c5fd,
    #bfdbfe
  );
  background-size: 200% 100%;
  animation: progressShimmer 3s ease-in-out infinite;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes progressShimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Enhanced micro-interactions */
.tw-rounded-xl:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease-in-out;
}
</style>