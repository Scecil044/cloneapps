<template>
  <div class="tw-space-y-3">
    <div
      v-for="i in 6"
      :key="'contact-item-' + i"
      class="tw-flex tw-items-start sm:tw-items-center tw-p-3 tw-border tw-border-gray-100 tw-rounded-lg tw-mb-2 tw-bg-white tw-overflow-hidden tw-relative tw-group hover:tw-shadow-md tw-transition-shadow tw-duration-200"
    >
      <!-- Profile Avatar -->
      <div
        class="tw-w-10 tw-h-10 sm:tw-w-12 sm:tw-h-12 tw-rounded-full tw-bg-gradient-to-br tw-from-gray-200 tw-to-gray-300 skeleton-shimmer tw-mr-3 sm:tw-mr-4 tw-mt-1 sm:tw-mt-0 tw-flex-shrink-0"
        :style="{ animationDelay: (i * 0.1) + 's' }"
      ></div>

      <!-- Main Content Area -->
      <div class="tw-flex-1 tw-min-w-0 tw-space-y-2">
        <!-- Name and Status -->
        <div class="tw-flex tw-justify-between tw-items-start">
          <div
            class="tw-h-4 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md skeleton-shimmer"
            :class="i % 3 === 0 ? 'tw-w-2/3' : i % 2 === 0 ? 'tw-w-1/2' : 'tw-w-3/5'"
            :style="{ animationDelay: (i * 0.1 + 0.05) + 's' }"
          ></div>
          <div
            class="tw-h-5 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-full tw-w-16 skeleton-shimmer tw-ml-1 tw-mt-0.5"
            :style="{ animationDelay: (i * 0.1 + 0.1) + 's' }"
          ></div>
        </div>

        <!-- Designation and Department -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-space-y-1 sm:tw-space-y-0">
          <div
            class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer"
            :class="i % 4 === 0 ? 'tw-w-2/5' : i % 3 === 0 ? 'tw-w-1/3' : 'tw-w-1/2'"
            :style="{ animationDelay: (i * 0.1 + 0.15) + 's' }"
          ></div>
          <div
            class="tw-hidden sm:block tw-w-1 tw-h-1 tw-bg-gray-300 tw-rounded-full tw-mx-1"
            :style="{ animationDelay: (i * 0.1 + 0.2) + 's' }"
          ></div>
          <div
            class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer tw-text-gray-400"
            :class="i % 3 === 0 ? 'tw-w-1/3' : 'tw-w-1/2'"
            :style="{ animationDelay: (i * 0.1 + 0.25) + 's' }"
          ></div>
        </div>

        <!-- Contact Info -->
        <div class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-space-y-1 sm:tw-space-y-0">
          <div
            class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer"
            :class="i % 2 === 0 ? 'tw-w-1/2' : 'tw-w-2/3'"
            :style="{ animationDelay: (i * 0.1 + 0.3) + 's' }"
          ></div>
          <div
            class="tw-hidden sm:block tw-w-1 tw-h-1 tw-bg-gray-300 tw-rounded-full tw-mx-2"
            :style="{ animationDelay: (i * 0.1 + 0.35) + 's' }"
          ></div>
          <div
            class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer"
            :class="i % 3 === 0 ? 'tw-w-1/3' : 'tw-w-1/2'"
            :style="{ animationDelay: (i * 0.1 + 0.4) + 's' }"
          ></div>
        </div>

        <!-- Company Info -->
        <div
          class="tw-h-3 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer"
          :class="i % 4 === 0 ? 'tw-w-2/5' : i % 3 === 0 ? 'tw-w-1/3' : 'tw-w-1/2'"
          :style="{ animationDelay: (i * 0.1 + 0.45) + 's' }"
        ></div>
      </div>

      <!-- Subtle wave overlay for premium feel -->
      <div
        class="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-transparent tw-via-white/20 tw-to-transparent skeleton-wave tw-pointer-events-none"
        :style="{ animationDelay: (i * 0.2) + 's' }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PointsOfContactSkeleton'
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
