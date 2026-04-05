<template>
  <div v-if="open" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center overlay-dark tw-backdrop-blur-sm tw-transition-all tw-duration-300 modal-topmost">
    <div :class="['tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-border tw-px-8 tw-py-10 tw-max-w-lg tw-w-full tw-relative tw-animate-fadeIn', borderColor]">
      <div class="tw-flex tw-flex-col tw-items-center tw-mb-6">
        <div :class="['tw-w-14 tw-h-14 tw-mb-2', iconColor]">
          <slot name="icon">
            <svg class="tw-w-full tw-h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </slot>
        </div>
        <h3 class="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-1">{{ title }}</h3>
        <p class="tw-text-gray-600 tw-text-center tw-mb-2 tw-max-w-md">{{ message }}</p>
      </div>
      <div class="tw-flex tw-justify-end tw-gap-4">
        <button @click="$emit('cancel')" class="tw-px-6 tw-py-2 tw-rounded-lg tw-bg-gray-100 tw-text-gray-700 tw-font-semibold tw-border tw-border-gray-200 tw-shadow-sm tw-hover:bg-gray-200 tw-transition-all">{{ cancelText }}</button>
        <button @click="$emit('confirm')" :class="['tw-px-6 tw-py-2 tw-rounded-lg tw-text-white tw-font-semibold tw-shadow-md tw-border tw-transition-all', confirmButtonClasses]">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommonModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirmation'
    },
    message: {
      type: String,
      default: 'Are you sure you want to proceed with this action?'
    },
    confirmText: {
      type: String,
      default: 'Proceed'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    type: {
      type: String,
      default: 'info', // info, warning, success, error
      validator: value => ['info', 'warning', 'success', 'error'].includes(value)
    }
  },
  computed: {
    iconColor() {
      const colors = {
        info: 'tw-text-blue-500',
        warning: 'tw-text-yellow-500',
        success: 'tw-text-green-500',
        error: 'tw-text-red-500'
      };
      return colors[this.type] || colors.info;
    },
    borderColor() {
      const colors = {
        info: 'tw-border-blue-100',
        warning: 'tw-border-yellow-100',
        success: 'tw-border-green-100',
        error: 'tw-border-red-100'
      };
      return colors[this.type] || colors.info;
    },
    confirmButtonClasses() {
      const baseClasses = {
        info: 'tw-bg-blue-500 tw-border-blue-400 tw-hover:bg-blue-600',
        warning: 'tw-bg-yellow-500 tw-border-yellow-400 tw-hover:bg-yellow-600',
        success: 'tw-bg-green-500 tw-border-green-400 tw-hover:bg-green-600',
        error: 'tw-bg-red-500 tw-border-red-400 tw-hover:bg-red-600'
      };
      return baseClasses[this.type] || baseClasses.info;
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
.overlay-dark {
    background-color: rgba(0, 0, 0, 0.4) !important;
}
/* Ensure the modal is always on top */
.modal-topmost {
  z-index: 99999 !important;
}
</style>
