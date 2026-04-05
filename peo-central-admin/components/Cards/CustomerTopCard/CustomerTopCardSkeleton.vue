<template>
  <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-py-3 tw-px-3 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 tw-m-2 tw-min-w-[140px] tw-min-h-[56px]">
    <div class="tw-flex tw-flex-col tw-space-y-1 tw-flex-grow">
      <div class="tw-h-4 tw-w-20 tw-bg-gradient-to-r tw-from-gray-200 tw-to-gray-300 tw-rounded-md skeleton-shimmer"></div>
      <div class="tw-h-8 tw-w-24 tw-bg-gradient-to-r tw-from-gray-300 tw-to-gray-200 tw-rounded-md skeleton-shimmer" style="animation-delay: 0.1s"></div>
      <div class="tw-h-3 tw-w-16 tw-bg-gradient-to-r tw-from-gray-100 tw-to-gray-200 tw-rounded-md skeleton-shimmer" style="animation-delay: 0.2s"></div>
    </div>
    <div class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-gradient-to-br tw-from-violet-100 tw-to-blue-100 tw-flex tw-items-center tw-justify-center tw-ml-2 skeleton-shimmer" style="animation-delay: 0.3s">
      <div class="tw-w-7 tw-h-7 tw-rounded-full tw-bg-gradient-to-br tw-from-gray-200 tw-to-gray-300 skeleton-shimmer"></div>
    </div>
    <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-gradient-to-r tw-from-blue-200 tw-to-blue-400 tw-rounded-b-xl skeleton-shimmer" style="animation-delay: 0.4s"></div>
  </div>
</template>

<script>
export default {
  name: 'CustomerTopCardSkeleton'
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
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
