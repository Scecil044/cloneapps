<template>
  <div class="tw-bg-gradient-to-br tw-from-blue-500 tw-to-blue-700 tw-rounded-2xl tw-shadow-lg tw-p-6 tw-flex tw-flex-col tw-justify-between tw-h-36 tw-transition-transform tw-transform hover:tw-scale-105 tw-cursor-pointer tw-group">
    <div class="tw-flex tw-items-center tw-justify-between">
      <div>
        <div class="tw-text-white tw-text-lg tw-font-semibold tw-tracking-tight">{{ label }}</div>
        <div class="tw-text-3xl tw-font-bold tw-text-white tw-mt-1 tw-animate-pulse" v-if="loading">...</div>
        <div class="tw-text-3xl tw-font-bold tw-text-white tw-mt-1 tw-transition-all tw-duration-500" v-else>{{ value }}</div>
      </div>
      <div class="tw-bg-white/20 tw-rounded-full tw-p-3 tw-flex tw-items-center tw-justify-center tw-shadow group-hover:tw-bg-white/30 tw-transition">
        <component :is="iconComponent" class="tw-text-white tw-text-2xl" />
      </div>
    </div>
    <div class="tw-flex tw-items-center tw-mt-3">
      <span class="tw-text-white/80 tw-text-xs">{{ subtitle }}</span>
      <span v-if="trend !== undefined" :class="trend >= 0 ? 'tw-text-green-300' : 'tw-text-red-300'" class="tw-ml-2 tw-font-semibold tw-text-xs">
        <svg v-if="trend >= 0" class="tw-inline tw-w-3 tw-h-3 tw-mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
        <svg v-else class="tw-inline tw-w-3 tw-h-3 tw-mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        {{ Math.abs(trend) }}%
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElegantStatCard',
  props: {
    label: String,
    value: [String, Number],
    subtitle: String,
    iconComponent: [Object, Function, String],
    loading: Boolean,
    trend: Number // positive or negative percentage
  }
}
</script>

<style scoped>
.tw-animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
