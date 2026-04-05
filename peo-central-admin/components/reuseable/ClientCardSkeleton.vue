<template>
  <div class="tw-container tw-mx-auto tw-px-4 tw-py-6">
    <!-- Grid Container with responsive columns -->
    <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-4 md:tw-gap-6">
      <!-- Individual Skeleton Cards -->
      <div 
        v-for="n in skeletonCount" 
        :key="n"
        class="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-gray-100 tw-transition-all tw-duration-300 tw-flex tw-flex-col tw-items-center tw-px-6 tw-pt-8 tw-pb-6 tw-w-full tw-min-h-[280px] tw-relative tw-overflow-hidden tw-group hover:tw-shadow-md hover:tw-transform hover:tw--translate-y-1"
      >
        <!-- Company Logo Skeleton -->
        <div class="tw-relative tw-mb-4">
          <div 
            class="tw-w-20 tw-h-20 tw-rounded-full tw-bg-gradient-to-br tw-from-gray-200 tw-to-gray-300 skeleton-shimmer tw-shadow-sm tw-border-2 tw-border-white tw-flex-shrink-0"
            :style="{ animationDelay: (n * 0.1) + 's' }"
          ></div>
        </div>
        
        <!-- Status Badge -->
        <div class="tw-mb-4">
          <div 
            class="tw-h-6 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-full skeleton-shimmer tw-px-4"
            :class="n % 3 === 0 ? 'tw-w-16' : n % 2 === 0 ? 'tw-w-20' : 'tw-w-14'"
            :style="{ animationDelay: (n * 0.1 + 0.05) + 's' }"
          ></div>
        </div>
        
        <!-- Company Name Skeleton -->
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-mb-4 tw-w-full">
          <div 
            class="tw-h-5 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md skeleton-shimmer tw-max-w-full"
            :class="n % 3 === 0 ? 'tw-w-36' : n % 2 === 0 ? 'tw-w-32' : 'tw-w-28'"
            :style="{ animationDelay: (n * 0.1 + 0.1) + 's' }"
          ></div>
        </div>
        
        <!-- Email Skeleton -->
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-w-full tw-mb-2">
          <div 
            class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer tw-max-w-full"
            :class="n % 4 === 0 ? 'tw-w-40' : n % 3 === 0 ? 'tw-w-36' : 'tw-w-32'"
            :style="{ animationDelay: (n * 0.1 + 0.15) + 's' }"
          ></div>
        </div>
        
        <!-- Phone Skeleton -->
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-w-full">
          <div 
            class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer tw-max-w-full"
            :class="n % 3 === 0 ? 'tw-w-28' : n % 2 === 0 ? 'tw-w-32' : 'tw-w-24'"
            :style="{ animationDelay: (n * 0.1 + 0.2) + 's' }"
          ></div>
        </div>
        
        <!-- Premium wave overlay for enhanced visual appeal -->
        <div 
          class="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-transparent tw-via-white/20 tw-to-transparent skeleton-wave tw-pointer-events-none tw-rounded-2xl"
          :style="{ animationDelay: (n * 0.15) + 's' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientCardSkeleton',
  props: {
    count: {
      type: Number,
      default: 12
    }
  },
  computed: {
    skeletonCount() {
      return this.count;
    }
  }
}
</script>

<style scoped>
/* High-quality shimmer animation with precise gradient stops */
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

/* Premium wave overlay effect */
.skeleton-wave {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  background-size: 300% 100%;
  animation: wave 3s ease-in-out infinite;
}

/* Smooth shimmer keyframes */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Elegant wave animation */
@keyframes wave {
  0% {
    background-position: -300% 0;
  }
  100% {
    background-position: 300% 0;
  }
}

/* Enhanced hover interactions */
.tw-group:hover .skeleton-shimmer {
  animation-duration: 1.5s;
}

.tw-group:hover .skeleton-wave {
  animation-duration: 2s;
}

/* Subtle micro-interactions for premium feel */
.tw-group:hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive adjustments for mobile optimization */
@media (max-width: 640px) {
  .skeleton-shimmer {
    animation-duration: 2.2s;
  }
  
  .skeleton-wave {
    animation-duration: 3.5s;
  }
}

/* Ensure proper rendering on high-DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .skeleton-shimmer {
    background-size: 400% 100%;
  }
}

/* Performance optimization for reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .skeleton-wave {
    animation-duration: 4s;
  }
  
  .tw-group:hover {
    transform: none;
  }
}
</style>
