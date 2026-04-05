<template>
  <div class="tw-p-6 tw-bg-gray-50 tw-min-h-screen">
    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-mb-8">
      <!-- Onboarding Card -->
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center">
        <div class="tw-text-3xl tw-font-bold tw-text-blue-600">{{ onboardingStats.count }}</div>
        <div class="tw-mt-2 tw-text-gray-500 tw-font-medium">Onboarding</div>
      </div>
      <!-- Visa Process Card -->
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center">
        <div class="tw-text-3xl tw-font-bold tw-text-green-600">{{ visaStats.count }}</div>
        <div class="tw-mt-2 tw-text-gray-500 tw-font-medium">Visa Process</div>
      </div>
      <!-- Tickets Card -->
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center">
        <div class="tw-text-3xl tw-font-bold tw-text-yellow-600">{{ ticketStats.count }}</div>
        <div class="tw-mt-2 tw-text-gray-500 tw-font-medium">Tickets</div>
      </div>
      <!-- Renewals Card -->
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center">
        <div class="tw-text-3xl tw-font-bold tw-text-purple-600">{{ renewalStats.count }}</div>
        <div class="tw-mt-2 tw-text-gray-500 tw-font-medium">Renewals</div>
      </div>
      <!-- Offboarding Card -->
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center md:tw-col-span-2 lg:tw-col-span-1">
        <div class="tw-text-3xl tw-font-bold tw-text-red-600">{{ offboardingStats.count }}</div>
        <div class="tw-mt-2 tw-text-gray-500 tw-font-medium">Offboarding</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8">
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6">
        <h3 class="tw-text-lg tw-font-semibold tw-mb-4">Onboarding Applications Distribution</h3>
        <chartjs-bar :height="300" :data="onboardingChartData" :options="chartOptions" />
      </div>
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6">
        <h3 class="tw-text-lg tw-font-semibold tw-mb-4">Visa Process Distribution</h3>
        <chartjs-pie :height="300" :data="visaChartData" :options="chartOptions" />
      </div>
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 lg:tw-col-span-2">
        <h3 class="tw-text-lg tw-font-semibold tw-mb-4">Offboarding Applications Distribution</h3>
        <chartjs-bar :height="300" :data="offboardingChartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script>
import { Bar, Pie } from 'vue-chartjs'

export default {
  name: 'ModernDashboard',
  layout: 'dashboard',
  components: {
    chartjsBar: Bar,
    chartjsPie: Pie
  },
  data() {
    return {
      onboardingStats: {
        count: 0,
        labels: [],
        datasets: []
      },
      visaStats: {
        count: 0,
        labels: [],
        datasets: []
      },
      ticketStats: {
        count: 0
      },
      renewalStats: {
        count: 0
      },
      offboardingStats: {
        count: 0,
        labels: [],
        datasets: []
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        title: { display: false }
      }
    }
  },
  computed: {
    onboardingChartData() {
      return {
        labels: this.onboardingStats.labels,
        datasets: this.onboardingStats.datasets
      }
    },
    visaChartData() {
      return {
        labels: this.visaStats.labels,
        datasets: this.visaStats.datasets
      }
    },
    offboardingChartData() {
      return {
        labels: this.offboardingStats.labels,
        datasets: this.offboardingStats.datasets
      }
    }
  },
  async mounted() {
    await Promise.all([
      this.fetchOnboardingStats(),
      this.fetchVisaStats(),
      this.fetchTicketStats(),
      this.fetchRenewalStats(),
      this.fetchOffboardingStats()
    ])
  },
  methods: {
    async fetchOnboardingStats() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const res = await this.$axios.$post('/onboardings/get_status_count', { }, { headers: { Authorization: AuthStr } })
      this.onboardingStats.count = res[res.length - 1]?.count || 0
      this.onboardingStats.labels = res.slice(0, -1).map(e => e._id)
      this.onboardingStats.datasets = [{
        barThickness: 40,
        data: res.slice(0, -1).map(e => Number(e.count)),
        backgroundColor: ['#06A3B9', '#E246A8', '#AFEF70', '#A57A97', '#DCDE0B']
      }]
    },
    async fetchVisaStats() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const res = await this.$axios.$post('/visaprocess/distribution', {}, { headers: { Authorization: AuthStr } })
      this.visaStats.count = res[res.length - 1]?.count || 0
      this.visaStats.labels = res.slice(0, -1).map(e => e._id)
      this.visaStats.datasets = [{
        data: res.slice(0, -1).map(e => Number(e.count)),
        backgroundColor: ['#0096C7', '#FFCB77', '#57CC99', '#CE4257']
      }]
    },
    async fetchTicketStats() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const res = await this.$axios.$get('/tickets/stats', { headers: { Authorization: AuthStr } })
      this.ticketStats.count = res?.count || 0
    },
    async fetchRenewalStats() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const res = await this.$axios.$get('/renewals/get_status_count', { headers: { Authorization: AuthStr } })
      this.renewalStats.count = res?.count || 0
    },
    async fetchOffboardingStats() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const res = await this.$axios.$post('/offboardings/get_status_count', {}, { headers: { Authorization: AuthStr } })
      this.offboardingStats.count = res[res.length - 1]?.count || 0
      this.offboardingStats.labels = res.slice(0, -1).map(e => e._id)
      this.offboardingStats.datasets = [{
        barThickness: 40,
        data: res.slice(0, -1).map(e => Number(e.count)),
        backgroundColor: ['#06A3B9', '#E246A8', '#AFEF70', '#A57A97', '#DCDE0B']
      }]
    }
  }
}
</script>

<style scoped>
</style>
