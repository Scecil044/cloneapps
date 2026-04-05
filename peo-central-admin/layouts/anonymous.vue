<template>
  <div>
    <Loader v-if="pageLoading" />
    <v-app v-else>
      <v-card color="dashboard_bg" class="dl__main_card" style="border-radius: 0 !important">
        <main class="dl__main">
          <div
            class="tw-flex tw-bg-white tw-py-4 tw-items-center tw-justify-between tw-px-16 tw-border-b tw-border-gray-100 dark:tw-border-gray-50">
            <div class="d-flex py- align-center justify-center  tw-pl-1 tw-pb-1" style="height: 7%">
              <NuxtLink to="/dashboard">
                <img src="/eor_central_logo.svg" class="tw-object-cover" v-if="!mini" />
              </NuxtLink>
            </div>
            <v-btn outlined color="primary" @click="Logout()">
              <v-icon>mdi-logout</v-icon>
              Close
            </v-btn>
          </div>
          <div class="dl__content">
            <Nuxt />
          </div>
        </main>
      </v-card>
    </v-app>
  </div>
</template>

<script>
import Loader from '@/components/utils/Loader.vue'

export default {
  components: {
    Loader
  },
  data() {
    return {
      pageLoading: true,
      darkMood: false,
      showAppButtons: false,
    }
  },
  methods: {
    Logout() { }
  },
  mounted() {
    setTimeout(() => {
      this.pageLoading = false
    }, 1500)
  }
}
</script>

<style lang="scss" scoped></style>
