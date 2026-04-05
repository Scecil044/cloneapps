<template>
  <div>
    <Loader v-if="pageLoading" />
    <div v-else class="tw-flex tw-h-screen tw-bg-dashboard_bg">
      <!-- Sidebar -->
      <aside
        :class="[
          'tw-bg-navbar_bg tw-h-full tw-flex-shrink-0 tw-transition-all tw-duration-300',
          mini ? 'tw-w-16' : 'tw-w-64',
          'tw-border-r tw-border-gray-100 dark:tw-border-gray-800'
        ]"
      >
        <div class="tw-flex tw-items-center tw-justify-center tw-h-16 tw-border-b tw-border-gray-100 dark:tw-border-gray-800">
          <NuxtLink to="/dashboard">
            <img src="/eor_central_logo.svg" class="tw-object-cover tw-h-8" v-if="!mini" />
          </NuxtLink>
        </div>
        <nav class="tw-flex-1 tw-overflow-y-auto tw-pt-2">
          <div v-for="(group, groupIndex) in navGroups" :key="groupIndex" class="tw-mb-2">
            <div
              v-if="!mini"
              class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-cursor-pointer tw-text-xs tw-font-bold tw-uppercase tw-tracking-wide tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-50 dark:hover:tw-bg-gray-700 tw-rounded"
              :title="group.title"
              @click="toggleGroupCollapse(group.title)"
            >
              <div class="tw-flex tw-items-center tw-gap-2 tw-truncate tw-max-w-xs">
                <component :is="categoryIcons[group.title]" class="tw-w-5 tw-h-5" :color="getGroupColor(group.title)" />
                <span>{{ group.title }}</span>
              </div>
              <svg v-if="group.items.length > 0" :class="['tw-w-4 tw-h-4 tw-transition-transform', groupStates[group.title] ? 'tw-rotate-180' : '']" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
            <transition name="fade">
              <div v-show="isGroupExpanded(group.title)" class="tw-ml-2">
                <div v-for="(item, itemIndex) in group.items" :key="`${groupIndex}-${itemIndex}`" class="tw-mb-1">
                  <div v-if="group.title === 'Admin Central' && item.route === null" class="tw-flex tw-items-center tw-opacity-60 tw-cursor-not-allowed tw-px-4 tw-py-2 tw-text-gray-400">
                    <component :is="item.icon" class="tw-w-5 tw-h-5 tw-mr-2" :color="getGroupColor(group.title)" />
                    <span>{{ item.text }}</span>
                  </div>
                  <NuxtLink
                    v-else
                    :to="item.route"
                    class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded tw-transition tw-duration-150 tw-ease-in-out tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-800"
                    :class="{
                      'tw-bg-gray-100 dark:tw-bg-gray-800 tw-text-blue-700 dark:tw-text-blue-300 tw-font-semibold':
                        (group.title === 'Repositories' && isRepositoryActive(group.title, item.route)) ||
                        (group.title === 'Visa & Immigration' && isVisaProcessActive(item.route)) ||
                        (group.title !== 'Repositories' && group.title !== 'Visa & Immigration' && isRouteActive(item.route)),
                    }"
                  >
                    <component :is="item.icon" class="tw-w-5 tw-h-5 tw-mr-2" :color="getGroupColor(group.title)" />
                    <span>{{ item.text }}</span>
                  </NuxtLink>
                </div>
              </div>
            </transition>
          </div>
        </nav>
        <div class="tw-flex tw-items-center tw-justify-center tw-h-12 tw-border-t tw-border-gray-100 dark:tw-border-gray-800">
          <button @click.stop="mini = !mini" class="tw-p-2 tw-rounded hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700">
            <svg v-if="mini" class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            <svg v-else class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </aside>
      <!-- Main Content -->
      <div class="tw-flex-1 tw-flex tw-flex-col tw-h-full">
        <!-- Top Bar -->
        <header class="tw-flex tw-items-center tw-h-16 tw-px-6 tw-bg-white dark:tw-bg-dashboard_bg tw-border-b tw-border-gray-100 dark:tw-border-gray-800 tw-z-10">
          <div class="tw-flex-1 tw-flex tw-items-center tw-gap-4">
            <slot name="header-left"></slot>
            <span class="tw-text-lg tw-font-bold tw-text-gray-800 dark:tw-text-gray-100">Dashboard</span>
          </div>
          <div class="tw-flex tw-items-center tw-gap-4">
            <header-user-icon @logout="showLogoutDialog" />
          </div>
        </header>
        <!-- Content Area -->
        <main class="tw-flex-1 tw-overflow-y-auto tw-p-6 tw-bg-gray-50 dark:tw-bg-dashboard_bg">
          <!-- Example: Dashboard Cards Row -->
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-mb-6">
            <div class="tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-flex-col tw-items-start">
              <span class="tw-text-xs tw-text-gray-500">Total responses</span>
              <span class="tw-text-2xl tw-font-bold tw-mt-1">2,436</span>
              <span class="tw-text-xs tw-text-green-500 tw-mt-1">+15%</span>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-flex-col tw-items-start">
              <span class="tw-text-xs tw-text-gray-500">Responses today</span>
              <span class="tw-text-2xl tw-font-bold tw-mt-1">98</span>
              <span class="tw-text-xs tw-text-red-500 tw-mt-1">-10%</span>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-flex-col tw-items-start">
              <span class="tw-text-xs tw-text-gray-500">Total vacancies</span>
              <span class="tw-text-2xl tw-font-bold tw-mt-1">49</span>
              <span class="tw-text-xs tw-text-red-500 tw-mt-1">-10%</span>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-flex-col tw-items-start">
              <span class="tw-text-xs tw-text-gray-500">Closed vacancies</span>
              <span class="tw-text-2xl tw-font-bold tw-mt-1">18 from 49</span>
            </div>
          </div>
          <!-- Example: Chart Area (SSR-safe placeholder) -->
          <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6">
            <div class="tw-col-span-2 tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-6">
              <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
                <span class="tw-font-semibold tw-text-gray-700 dark:tw-text-gray-200">Candidate statistics</span>
                <span class="tw-text-xs tw-text-gray-400">(Chart placeholder)</span>
              </div>
              <client-only>
                <!-- Place ApexCharts here, SSR-safe -->
                <!-- <apexchart v-if="showCharts" type="bar" :options="chartOptions" :series="chartSeries" /> -->
              </client-only>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-6">
              <div class="tw-font-semibold tw-text-gray-700 dark:tw-text-gray-200 tw-mb-4">Candidate Source</div>
              <client-only>
                <!-- Place ApexCharts donut here, SSR-safe -->
                <!-- <apexchart v-if="showCharts" type="donut" :options="donutOptions" :series="donutSeries" /> -->
              </client-only>
            </div>
          </div>
          <!-- Example: Table/Stats Area -->
          <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6 tw-mt-6">
            <div class="tw-col-span-2 tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-6">
              <div class="tw-font-semibold tw-text-gray-700 dark:tw-text-gray-200 tw-mb-4">Recruiters rating</div>
              <!-- Table placeholder -->
              <div class="tw-text-xs tw-text-gray-400">(Table placeholder)</div>
            </div>
            <div class="tw-bg-white dark:tw-bg-gray-900 tw-rounded-xl tw-shadow-sm tw-p-6">
              <div class="tw-font-semibold tw-text-gray-700 dark:tw-text-gray-200 tw-mb-4">Average vacancy closing time</div>
              <!-- List placeholder -->
              <div class="tw-text-xs tw-text-gray-400">(List placeholder)</div>
            </div>
          </div>
        </main>
      </div>
    </div>
    <!-- Logout Dialog -->
    <v-dialog v-model="confirmLogoutDialog" max-width="315px" overlay-opacity="0.6" overlay-color="black" class="logout-dialog-backdrop">
      <v-card max-width="315" style="overflow-x: hidden">
        <v-row class="pt-4 pl-4 pr-4">
          <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
            <h5 class="mb-0 blue-grey--text font-weight-bold">
              Are you sure, You want to logout?
            </h5>
          </v-col>
        </v-row>
        <v-card-actions>
          <v-col cols="12" class="text-center">
            <v-btn color="grey" text @click="confirmLogoutDialog = false">No</v-btn>
            <v-btn color="primary darken-1" text @click="handleLogout()">Yes</v-btn>
          </v-col>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'dashboard-v2',
  data() {
    return {
      mini: false,
      mobileSidebarOpen: false,
      groupStates: {},
      navGroups: [
        {
          title: 'Main',
          items: [
            { text: 'Dashboard', route: '/dashboard-v2' },
            { text: 'Onboardings', route: '/onboardings' },
            { text: 'Employees', route: '/employees' },
            { text: 'Mock Home', route: '/mock-home' },
            { text: 'Mock Analytics', route: '/mock-analytics' },
          ],
        },
        {
          title: 'HR',
          items: [
            { text: 'Leads', route: '/leads' },
            { text: 'Offboarding', route: '/offboarding' },
            { text: 'Mock HR Reports', route: '/mock-hr-reports' },
          ],
        },
        {
          title: 'Finance',
          items: [
            { text: 'Invoices', route: '/invoices' },
            { text: 'Payments', route: '/payments' },
            { text: 'Mock Budget', route: '/mock-budget' },
          ],
        },
        {
          title: 'Settings',
          items: [
            { text: 'Profile', route: '/profile' },
            { text: 'Preferences', route: '/preferences' },
            { text: 'Mock Admin', route: '/mock-admin' },
          ],
        },
      ],
    }
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    toggleMiniSidebar() {
      this.mini = !this.mini
    },
    openMobileSidebar() {
      this.mobileSidebarOpen = true
    },
    closeMobileSidebar() {
      this.mobileSidebarOpen = false
    },
    handleResize() {
      if (window.innerWidth < 1024) {
        this.mini = false
        this.mobileSidebarOpen = false
      } else {
        this.mobileSidebarOpen = false
      }
    },
    toggleGroupCollapse(title) {
      this.$set(this.groupStates, title, !this.groupStates[title])
    },
    isGroupExpanded(title) {
      if (this.groupStates[title] === undefined) {
        return (
          Object.keys(this.groupStates).length === 0 &&
          this.navGroups[0].title === title
        )
      }
      return this.groupStates[title]
    },
    isRouteActive(route) {
      return this.$route.path === route
    },
  },
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Custom logout dialog backdrop with !important to override Vuetify conflicts */
.logout-dialog-backdrop >>> .v-overlay {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

.logout-dialog-backdrop >>> .v-overlay__scrim {
  background-color: rgba(0, 0, 0, 0.6) !important;
}
</style>
