<template>
  <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-orange-100 tw-px-4 tw-py-8">
    <div class="tw-w-full tw-max-w-3xl   tw-p-8 ">
      <!-- Error icon -->
      <div class="tw-mb-6 tw-flex tw-justify-center">
        <div class="tw-rounded-full  tw-p-3">
          <img style="max-width: 200px;"
            src="https://freelancerdxb.s3.eu-central-1.amazonaws.com/whatsapp/weeping_9350482.png" />
        </div>
      </div>

      <!-- Error title -->
      <h1 v-if="error.statusCode === 404" class="tw-mb-4 tw-text-center tw-text-3xl tw-font-bold tw-text-gray-800">
        Page not found
      </h1>
      <h1 v-else class="tw-mb-4 tw-text-center tw-text-3xl tw-font-bold tw-text-gray-800">
        Whoops! Something Unexpected Happened
      </h1>

      <!-- Error message -->
      <p class="tw-mb-6 tw-text-center tw-text-gray-600">
        {{ error.message || 'Sorry, something went wrong on our end.' }}
      </p>



      <!-- Action buttons -->
      <div class="tw-flex tw-justify-center tw-space-x-4">
        <v-btn v-if="error.statusCode === 404" @click="$router.push('/')" color="primary">
          Go Home
        </v-btn>
        <v-btn @click="handlePageReload()" color="primary">
          Try Again
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
  layout: 'dashboard', // Changed from 'empty' to 'default'
  props: {
    error: {
      type: Object,
      default: () => ({})
    }
  },
  head() {
    return {
      title: this.error.statusCode === 404 ? 'Page not found' : 'An error occurred'
    }
  },
  methods: {
    handlePageReload() {
      window.location.reload()
    }
  }
}
</script>
