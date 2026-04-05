<template>
  <div class="tw-fixed tw-inset-0 tw-bg-white tw-z-50 tw-flex tw-items-center tw-justify-center">
    <!-- Success Content -->
    <div class="tw-text-center tw-px-6 tw-py-12">
      <!-- Success Icon -->
      <div class="tw-mx-auto tw-w-20 tw-h-20 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-8">
        <v-icon size="48" color="white">mdi-check</v-icon>
      </div>

      <!-- Success Message -->
      <h1 class="tw-text-3xl tw-font-bold tw-text-green-600 tw-mb-6">
        Form submitted successfully!
      </h1>

      <!-- Thank You Message -->
      <div class="tw-text-gray-600 tw-mb-8 tw-max-w-md tw-mx-auto">
        <p class="tw-text-lg tw-mb-2">Thank you! The form has been submitted successfully.</p>
        <p class="tw-text-base">We will reply to you soon!</p>
      </div>

      <!-- Close Window Button -->
      <button
        @click="closeWindow"
        class="tw-bg-blue-600 tw-text-white tw-px-8 tw-py-3 tw-rounded-lg tw-font-semibold tw-hover:bg-blue-700 tw-transition-colors tw-duration-200 tw-cursor-pointer"
      >
        Close Window
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KycSuccessPage',
  layout: 'login',
  methods: {
    closeWindow() {
      // Close the current window/tab
      window.close();

      // Fallback: If window.close() doesn't work (some browsers block it),
      // redirect to a blank page or show a message
      setTimeout(() => {
        if (!window.closed) {
          // Alternative: redirect to a blank page
          window.location.href = 'about:blank';
        }
      }, 100);
    }
  },

  // Optional: Auto-close after a delay
  mounted() {
    // Uncomment the line below if you want to auto-close after 10 seconds
    // setTimeout(() => this.closeWindow(), 10000);
  }
}
</script>

<style scoped>
/* Ensure the component takes full screen */
.tw-fixed {
  position: fixed;
}

.tw-inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.tw-z-50 {
  z-index: 50;
}

/* Smooth transitions */
.tw-transition-colors {
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Hover effects */
.tw-hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}
</style>
