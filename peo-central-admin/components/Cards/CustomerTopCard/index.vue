<template>
  <div
    class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-py-3 tw-px-3 tw-flex tw-items-center tw-justify-between tw-transition-all tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in tw-m-2 tw-min-w-[140px] tw-min-h-[56px]"
    :class="{
      'tw-border-blue-500 tw-bg-blue-50': isActive,
      'tw-border-gray-200': !isActive
    }"
    @click="$emit('click', { title, value })"
  >
    <div class="tw-flex tw-flex-col tw-space-y-1">
      <span
        class="tw-text-sm tw-font-medium tw-transition-colors tw-duration-300"
        :class="{
          'tw-text-blue-600': isActive,
          'tw-text-gray-500': !isActive
        }"
      >{{ title }}</span>
      <span
        class="tw-text-3xl tw-font-bold tw-transition-all tw-duration-500"
        :class="{
          'tw-text-blue-600': isActive,
          'tw-text-gray-800 group-hover:tw-text-blue-600': !isActive
        }"
      >{{ data }}</span>
      <slot name="sub"><span class="tw-text-xs tw-text-gray-400">&nbsp;</span></slot>
    </div>
    <div v-if="icon" class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2" :class="iconBg">
      <v-icon :color="iconColor" size="28">{{ icon }}</v-icon>
    </div>
    <div
      class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-rounded-b-xl tw-transition-all tw-duration-300"
      :class="{
        'tw-bg-blue-600': isActive,
        'tw-bg-blue-400 group-hover:tw-bg-blue-600': !isActive
      }"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    data: [Number, String],
    value: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    },
    iconBg: {
      type: String,
      default: 'tw-bg-violet-100'
    },
    iconColor: {
      type: String,
      default: 'deep-purple accent-4'
    }
  }
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
