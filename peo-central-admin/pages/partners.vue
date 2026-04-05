<template>
    <div class="vs_custom px-5 py-0">
      <v-col class="d-flex align-center justify-space-between">
        <h1>Partners</h1>
        <v-divider class="mx-4"></v-divider>
      </v-col>
      <!-- Child route content will render here -->
      <div>
        <nuxt-child />
      </div>
    </div>
  </template>

  <script>
  import AllPartners from '~/components/Partners/PartnersList.vue';

  export default {
    layout: 'dashboard',
    components: {
      AllPartners
    },
    mounted() {
      this.$router.push("/partners/all")
    },
    computed: {
      route_to() {
        return {
          path: this.$route.path.includes('add') ? '/partners/all' : '/partners/add',
          text: this.$route.path.includes('add') ? 'All Partners':'Add Partner',
          icon: this.$route.path.includes('add') ? 'handshake':'plus',
        }
      }
    }
  }
  </script>

  <style scoped>
  .mb-6 {
    margin-bottom: 24px;
  }
  </style>
