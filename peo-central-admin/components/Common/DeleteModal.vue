<template>
  <div v-if="open" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black/40 tw-backdrop-blur-sm tw-transition-all tw-duration-300">
    <div class="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-border tw-border-red-100 tw-px-8 tw-py-10 tw-max-w-lg tw-w-full tw-relative tw-animate-fadeIn">
      <div class="tw-flex tw-flex-col tw-items-center tw-mb-6">
        <svg class="tw-w-14 tw-h-14 tw-text-red-500 tw-mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
        <h3 class="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-1">{{ title || 'Delete Item?' }}</h3>
        <p class="tw-text-gray-600 tw-text-center tw-mb-2 tw-max-w-xs">{{ message || 'This action cannot be undone. Are you sure you want to proceed?' }}</p>
      </div>
      <div class="tw-flex tw-justify-end tw-gap-4">
        <button @click="$emit('cancel')" class="tw-px-6 tw-py-2 tw-rounded-lg tw-bg-gray-100 tw-text-gray-700 tw-font-semibold tw-border tw-border-gray-200 tw-shadow-sm tw-hover:bg-gray-200 tw-transition-all">Cancel</button>
        <button @click="$emit('confirm')" class="tw-px-6 tw-py-2 tw-rounded-lg tw-bg-red-500 tw-text-white tw-font-semibold tw-shadow-md tw-border tw-border-red-400 tw-hover:bg-red-600 tw-transition-all">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.tw-animate-fadeIn {
  animation: fadeIn 0.25s cubic-bezier(0.4,0,0.2,1);
}
</style>
