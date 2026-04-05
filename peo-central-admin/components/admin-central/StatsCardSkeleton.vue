<template>
  <div class="tw-mb-6">
    <!-- Stats Cards Grid -->
    <div :class="gridClass">
      <div
        v-for="i in cardCount"
        :key="'stats-card-' + i"
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 tw-relative tw-overflow-hidden tw-group hover:tw-shadow-md"
      >
        <!-- Content Area -->
        <div class="tw-flex tw-flex-col tw-space-y-1 tw-flex-1">
          <!-- Title -->
          <div
            class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md skeleton-shimmer tw-w-24"
            :style="{ animationDelay: (i * 0.1) + 's' }"
          ></div>

          <!-- Main Number -->
          <div
            class="tw-h-8 tw-bg-gradient-to-r tw-from-gray-300 tw-to-gray-400 tw-rounded-md skeleton-shimmer tw-w-16 tw-mt-1"
            :style="{ animationDelay: (i * 0.1 + 0.05) + 's' }"
          ></div>

          <!-- Subtitle -->
          <div
            class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer tw-w-20"
            :style="{ animationDelay: (i * 0.1 + 0.1) + 's' }"
          ></div>
        </div>

        <!-- Icon Area -->
        <div
          class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-gradient-to-br tw-from-gray-200 tw-to-gray-300 skeleton-shimmer tw-ml-2 tw-flex-shrink-0"
          :style="{ animationDelay: (i * 0.1 + 0.15) + 's' }"
        ></div>

        <!-- Bottom Border -->
        <div
          class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 skeleton-shimmer tw-rounded-b-xl"
          :style="{ animationDelay: (i * 0.1 + 0.2) + 's' }"
        ></div>

        <!-- Subtle wave overlay for premium feel -->
        <div
          class="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-transparent tw-via-white/20 tw-to-transparent skeleton-wave tw-pointer-events-none"
          :style="{ animationDelay: (i * 0.2) + 's' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCardSkeleton',
  props: {
    cardCount: {
      type: Number,
      default: 3
    },
    layout: {
      type: String,
      default: 'internal', // 'internal' or 'client'
      validator: value => ['internal', 'client'].includes(value)
    }
  },
  computed: {
    gridClass() {
      if (this.layout === 'client') {
        return 'tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-3 tw-mb-6'
      } else {
        return 'tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-3'
      }
    }
  }
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
    rgba(255, 255, 255, 0.3),
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
.tw-group:hover .skeleton-shimmer {
  animation-duration: 1.5s;
}

.tw-group:hover .skeleton-wave {
  animation-duration: 2s;
}

/* Subtle micro-interactions */
.tw-group:hover {
  transform: translateY(-1px);
}
</style>
