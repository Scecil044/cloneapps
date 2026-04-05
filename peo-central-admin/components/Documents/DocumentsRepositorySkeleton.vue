<template>
  <div class="tw-flex tw-flex-col tw-bg-white tw-border tw-rounded-xl tw-py-2 tw-px-2 tw-p-2 tw-space-y-4 tw-h-[50vh] md:tw-h-[85vh] tw-w-full md:tw-w-[45%] lg:tw-w-[42%] xl:tw-w-[35%] tw-min-w-[280px] tw-overflow-hidden">
    <!-- Search bar skeleton -->
    <div class="tw-flex tw-flex-row tw-mx-2 tw-justify-between tw-items-center tw-gap-1 tw-border-b tw-pb-2.5">
      <div class="tw-bg-[#F5F6F785] tw-px-2 tw-py-2 tw-my-2 tw-rounded-lg tw-text-xs tw-flex-1 tw-h-8 skeleton-shimmer"></div>
      <div class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-200 skeleton-shimmer"></div>
    </div>

    <!-- Folder list skeleton -->
    <div class="tw-flex tw-flex-col tw-h-[80vh] tw-overflow-y-auto">
      <div v-for="n in skeletonCount" :key="n" class="tw-relative tw-mb-1">
        <div class="tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-border-b tw-border-b-gray-200 tw-rounded-lg tw-my-1">
          <div class="tw-flex tw-flex-row tw-py-2 tw-flex-1">
            <!-- Folder icon skeleton -->
            <div class="tw-folder-icon tw-flex-shrink-0 tw-mr-4">
              <div class="tw-w-7 tw-h-7 tw-rounded tw-bg-gray-200 skeleton-shimmer"></div>
            </div>

            <!-- Folder content skeleton -->
            <div class="tw-flex tw-flex-col tw-flex-1">
              <!-- Folder name skeleton -->
              <div
                class="tw-h-4 tw-bg-gray-200 tw-rounded skeleton-shimmer tw-mb-1"
                :class="n % 3 === 0 ? 'tw-w-32' : n % 2 === 0 ? 'tw-w-28' : 'tw-w-36'"
                :style="{ animationDelay: (n * 0.1) + 's' }"
              ></div>

              <!-- Folder type skeleton -->
              <div class="tw-flex tw-items-center tw-gap-1">
                <div class="tw-w-3 tw-h-3 tw-rounded tw-bg-gray-200 skeleton-shimmer tw-mr-1"></div>
                <div
                  class="tw-h-3 tw-bg-gray-200 tw-rounded skeleton-shimmer"
                  :class="n % 2 === 0 ? 'tw-w-24' : 'tw-w-20'"
                  :style="{ animationDelay: (n * 0.1 + 0.05) + 's' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Dropdown button skeleton -->
          <div class="tw-flex tw-items-center">
            <div class="tw-bg-gray-100 tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentsRepositorySkeleton',
  props: {
    count: {
      type: Number,
      default: 8
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

/* Smooth shimmer keyframes */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Enhanced hover interactions */
.skeleton-shimmer:hover {
  animation-duration: 1.5s;
}

/* Responsive adjustments for mobile optimization */
@media (max-width: 640px) {
  .skeleton-shimmer {
    animation-duration: 2.2s;
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
  .skeleton-shimmer {
    animation-duration: 4s;
  }
}
</style>
