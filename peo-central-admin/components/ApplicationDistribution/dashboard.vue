<template>
  <div>
    <DashboardSkeleton v-if="loading" :activeTab="activeTab" />
    <div v-else class="tw-px-6 tw-py-4">
      <!-- Dashboard Tabs -->
      <div class="tw-flex tw-border-b tw-border-gray-200 tw-mb-6 tw-pl-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          :class="[
            'tw-px-5 tw-py-3 tw-font-medium tw-text-sm tw-transition-colors tw-duration-200 tw-border-b-2 tw-mr-4',
            activeTab === tab.id
              ? 'tw-border-blue-500 tw-text-blue-600'
              : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
          ]"
        >
          <v-icon :color="activeTab === tab.id ? 'primary' : 'grey'" size="18" class="mr-2">{{ tab.icon }}</v-icon>
          {{ tab.name }}
        </button>
      </div>

      <!-- Client Stats Section (Only on Clients Tab) -->
      <div v-if="activeTab === 'clients'">
        <div v-if="clientStatsLoading">
          <div class="tw-flex tw-items-center tw-mb-4">
            <v-icon color="primary" size="24" class="mr-2">mdi-chart-box</v-icon>
            <h2 class="tw-text-xl tw-font-semibold">Client Statistics</h2>
          </div>
          <div class="tw-animate-pulse tw-space-y-4">
            <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 lg:tw-grid-cols-5 tw-gap-6 tw-mb-8">
              <div v-for="i in 5" :key="i" class="tw-bg-gray-100 tw-h-32 tw-rounded-xl"></div>
            </div>
            <div class="tw-h-72 tw-bg-gray-100 tw-rounded-xl"></div>
          </div>
        </div>
        <div v-else-if="clientStats">
          <ClientStatsCards :clientStats="clientStats" />
        </div>
      </div>

      <!-- Main Dashboard Content (Only on Overview Tab) -->
      <div v-if="activeTab === 'overview'">
        <!-- Modern Stat Cards Grid -->
        <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 lg:tw-grid-cols-4 tw-gap-6 tw-mb-8">
          <div v-for="(card, idx) in statsCards" :key="idx" class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
            <div class="tw-flex tw-flex-col tw-space-y-1">
              <span class="tw-text-sm tw-font-medium tw-text-gray-500">{{ card.label }}</span>
              <span class="tw-text-3xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-blue-600">{{ card.value }}</span>
              <span class="tw-text-xs tw-text-gray-400">{{ card.sub }}</span>
            </div>
            <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2"
              :class="card.iconBg">
              <v-icon :color="card.iconColor" size="28">{{ card.icon }}</v-icon>
            </div>
            <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-blue-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-blue-600"></div>
          </div>
        </div>
      <v-row class="pt-0 pl-1 mr-5 ml-0">
        <v-col cols="12" md="6">
          <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
            <div class="d-flex">
              <svg id="chart-success_outline" data-name="chart-success/outline" xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="statCardBlue" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#1798ff"></stop>
                    <stop offset="100%" stop-color="#673ab8"></stop>
                  </linearGradient>
                </defs>
                <g id="vuesax_outline_chart-success" data-name="vuesax/outline/chart-success">
                  <g id="chart-success">
                    <path id="Vector"
                      d="M11.75,21.5h-4C2.32,21.5,0,19.18,0,13.75v-6C0,2.32,2.32,0,7.75,0h6c5.43,0,7.75,2.32,7.75,7.75v4a.75.75,0,0,1-1.5,0v-4c0-4.61-1.64-6.25-6.25-6.25h-6C3.14,1.5,1.5,3.14,1.5,7.75v6C1.5,18.36,3.14,20,7.75,20h4a.75.75,0,0,1,0,1.5Z"
                      transform="translate(1.25 1.25)" fill="url(#statCardBlue)"></path>
                    <path id="Vector-2" data-name="Vector"
                      d="M11.75,21.5h-4C2.32,21.5,0,19.18,0,13.75v-6C0,2.32,2.32,0,7.75,0h6c5.43,0,7.75,2.32,7.75,7.75v4a.75.75,0,0,1-1.5,0v-4c0-4.61-1.64-6.25-6.25-6.25h-6C3.14,1.5,1.5,3.14,1.5,7.75v6C1.5,18.36,3.14,20,7.75,20h4a.75.75,0,0,1,0,1.5Z"
                      transform="translate(1.25 1.25)" fill="url(#statCardBlue)"></path>
                    <path id="Vector-3" data-name="Vector"
                      d="M.75,4.71A.755.755,0,0,1,0,3.96V.75A.755.755,0,0,1,.75,0,.755.755,0,0,1,1.5.75V3.96A.749.749,0,0,1,.75,4.71Z"
                      transform="translate(6.25 9.98)" fill="url(#statCardBlue)"></path>
                    <path id="Vector-4" data-name="Vector"
                      d="M.75,4.71A.755.755,0,0,1,0,3.96V.75A.755.755,0,0,1,.75,0,.755.755,0,0,1,1.5.75V3.96A.749.749,0,0,1,.75,4.71Z"
                      transform="translate(16.25 9.98)" fill="url(#statCardBlue)"></path>
                    <path id="Vector-5" data-name="Vector"
                      d="M11.75,21.5h-4C2.32,21.5,0,19.18,0,13.75v-6C0,2.32,2.32,0,7.75,0h6c5.43,0,7.75,2.32,7.75,7.75v4a.75.75,0,0,1-1.5,0v-4c0-4.61-1.64-6.25-6.25-6.25h-6C3.14,1.5,1.5,3.14,1.5,7.75v6C1.5,18.36,3.14,20,7.75,20h4a.75.75,0,0,1,0,1.5Z"
                      transform="translate(1.25 1.25)" fill="url(#statCardBlue)"></path>
                    <path id="Vector-6" data-name="Vector"
                      d="M2.331,5.5a.749.749,0,0,1-.53-.22L.221,3.713a.75.75,0,0,1,1.06-1.06l1.01,1,2.9-3.39a.747.747,0,0,1,1.06-.08.756.756,0,0,1,.08,1.06l-3.42,4a.754.754,0,0,1-.54.26Z"
                      transform="translate(15.249 16.247)" fill="url(#statCardBlue)"></path>
                    <path id="Vector-7" data-name="Vector"
                      d="M.75,4.5A.755.755,0,0,1,0,3.75v-3A.755.755,0,0,1,.75,0,.755.755,0,0,1,1.5.75v3A.755.755,0,0,1,.75,4.5Z"
                      transform="translate(11.25 9.75)" fill="url(#statCardBlue)"></path>
                    <path id="Vector-8" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0"></path>
                  </g>
                </g>
              </svg>
              <h3 class="ml-3">Onboarding Applications Distribution</h3>
            </div>
            <client-only>
              <chartjs-bar :height="300" :bind="true" :datasets="datasets_onboarding_process"
                :labels="labels_onboarding_process" :option="option_onboarding_process" :width="500" />
            </client-only>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
            <div class="d-flex items-center mb-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#1798ff" stroke-width="2" fill="#eaf6ff"></circle>
                <path d="M7 12h10M12 7v10" stroke="#1798ff" stroke-width="2" stroke-linecap="round"></path>
              </svg>
              <h3 class="ml-3 font-semibold text-lg">Leads Distribution</h3>
            </div>
            <div v-if="leadsLoading">
              <div class="animate-pulse space-y-4">
                <div v-for="i in 5" :key="i" class="h-6 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div v-else>
              <div v-if="leadsChartLabels.length === 0" class="text-gray-400 text-center py-8">No leads data available</div>
              <client-only v-else>
                <chartjs-bar
                  :height="300"
                  :bind="true"
                  :labels="leadsChartLabels"
                  :datasets="leadsChartDatasets"
                  :option="leadsChartOptions"
                  :width="500"
                />
              </client-only>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="pt-4 pl-1 mr-5 ml-0">
        <!-- Renewals Distribution Chart -->
        <v-col cols="12" md="6" lg="6">
          <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
            <div class="d-flex items-center mb-3">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="renewalsGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#fba50d"/>
                    <stop offset="100%" stop-color="#e1417e"/>
                  </linearGradient>
                </defs>
                <path d="M20 4V16.2C20 17.8802 20 18.7202 19.673 19.362C19.3854 19.9265 18.9265 20.3854 18.362 20.673C17.7202 21 16.8802 21 15.2 21H8.8C7.11984 21 6.27976 21 5.63803 20.673C5.07354 20.3854 4.6146 19.9265 4.32698 19.362C4 18.7202 4 17.8802 4 16.2V4" stroke="url(#renewalsGradient)" stroke-width="2" stroke-linecap="round"/>
                <path d="M16 11.5L12 15.5L8 11.5" stroke="url(#renewalsGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 3V15" stroke="url(#renewalsGradient)" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h3 class="ml-3 font-semibold text-lg">Renewals Distribution</h3>
            </div>
            <div v-if="renewalsLoading">
              <div class="animate-pulse space-y-4">
                <div v-for="i in 5" :key="i" class="h-6 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div v-else>
              <div v-if="renewalsData.length === 0" class="text-gray-400 text-center py-8">No renewals data available</div>
              <client-only v-else>
                <chartjs-bar
                  :height="300"
                  :bind="true"
                  :datasets="renewalsDatasets"
                  :labels="renewalsLabels"
                  :option="renewalsChartOptions"
                />
              </client-only>
            </div>
          </v-card>
        </v-col>

        <!-- Mobile Users Card -->
        <v-col cols="12" md="6" lg="6">
          <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
            <div class="d-flex items-center justify-between mb-3">
              <div class="d-flex items-center">
                <v-icon color="success" size="22">mdi-cellphone</v-icon>
                <span class="ml-3 font-semibold text-lg text-green-700">Mobile Users</span>
              </div>
              <v-btn text small color="primary" @click="openDialog">View All</v-btn>
            </div>
            <div class="tw-overflow-x-auto" style="max-height: 300px;">
              <table class="tw-min-w-full tw-text-sm tw-text-gray-700">
                <thead>
                  <tr class="tw-bg-green-50">
                    <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Avatar</th>
                    <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Full Name</th>
                    <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Company</th>
                    <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">First Login Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in mobile_users" :key="user._id" class="hover:tw-bg-green-100 tw-transition">
                    <td class="tw-py-2 tw-px-3">
                      <img v-if="user.image_url" :src="user.image_url" class="tw-w-7 tw-h-7 tw-rounded-full tw-object-cover" alt="avatar" />
                    </td>
                    <td class="tw-py-2 tw-px-3">{{ user.fullName }}</td>
                    <td class="tw-py-2 tw-px-3">{{ user.companyName || '-' }}</td>
                    <td class="tw-py-2 tw-px-3">{{ formatDate(user.firstMobileLoginDate) }}</td>
                  </tr>
                  <tr v-if="!mobile_users.length">
                    <td colspan="4" class="tw-text-center tw-text-gray-400 tw-py-4">No mobile users</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="pt-0 pl-1 mr-5 ml-0">
        <v-col cols="12" md="5">
          <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4" min-height="360"
            max-height="360">
            <div class="d-flex">
              <svg id="video-tick_linear" data-name="video-tick/linear" xmlns="http://www.w3.org/2000/svg" width="24"
                height="24" viewBox="0 0 24 24">
                <g id="vuesax_linear_video-tick" data-name="vuesax/linear/video-tick">
                  <g id="video-tick">
                    <path id="Vector"
                      d="M20,7v6c0,.22,0,.44-.02.65a4.5,4.5,0,0,0-7.33,5.17,4.334,4.334,0,0,0,1.01,1.16c-.21.02-.43.02-.66.02H7c-5,0-7-2-7-7V7C0,2,2,0,7,0h6C18,0,20,2,20,7Z"
                      transform="translate(2 2)" fill="none" stroke="#292d32" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="1.5" />
                    <path id="Vector-2" data-name="Vector" d="M0,0H18.96" transform="translate(2.52 7.11)" fill="none"
                      stroke="#292d32" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                    <g id="Group">
                      <path id="Vector-3" data-name="Vector" d="M0,0V4.86" transform="translate(8.52 2.11)" fill="none"
                        stroke="#292d32" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                      <path id="Vector-4" data-name="Vector" d="M0,0V4.41" transform="translate(15.48 2.11)" fill="none"
                        stroke="#292d32" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                    </g>
                    <g id="Group-2" data-name="Group">
                      <path id="Vector-5" data-name="Vector"
                        d="M9,4.5a4.5,4.5,0,0,1-.65,2.32,4.327,4.327,0,0,1-.89,1.06,4.454,4.454,0,0,1-5.79.1H1.66A4.334,4.334,0,0,1,.65,6.82,4.5,4.5,0,0,1,0,4.5,4.448,4.448,0,0,1,1.69.99a4.49,4.49,0,0,1,6.29.66A4.451,4.451,0,0,1,9,4.5Z"
                        transform="translate(14 14)" fill="none" stroke="#292d32" stroke-linecap="round"
                        stroke-linejoin="round" stroke-width="1.5" />
                      <path id="Vector-6" data-name="Vector" d="M0,1.11,1.11,2.22,3.51,0" transform="translate(16.75 17.39)"
                        fill="none" stroke="#292d32" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                    </g>
                    <path id="Vector-7" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
                  </g>
                </g>
              </svg>
              <h3 class="ml-3">Visa Applications</h3>
            </div>
            <client-only>
              <chartjs-pie :height="300" :bind="true" :datasets="datasets_visa_process" :labels="labels_visa_process"
                :option="option_visa_process" class="d-flex" />
            </client-only>
          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4" min-height="360"
            max-height="360">
            <div class="d-flex">
              <svg id="clipboard-import" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path id="Vector"
                  d="M6.75,5.5h-4C1.79,5.5,0,5.5,0,2.75S1.79,0,2.75,0h4C7.71,0,9.5,0,9.5,2.75,9.5,3.71,9.5,5.5,6.75,5.5Zm-4-4c-.99,0-1.25,0-1.25,1.25S1.76,4,2.75,4h4C8,4,8,3.74,8,2.75,8,1.5,7.74,1.5,6.75,1.5Z"
                  transform="translate(7.25 1.25)" fill="#292d32" />
                <path id="Vector-2" data-name="Vector"
                  d="M11.75,19.471h-5c-5.62,0-6.75-2.58-6.75-6.75v-6C0,2.161,1.65.211,5.71,0a.756.756,0,0,1,.79.71.742.742,0,0,1-.71.78C2.95,1.651,1.5,2.5,1.5,6.721v6c0,3.7.73,5.25,5.25,5.25h5a.75.75,0,0,1,0,1.5Z"
                  transform="translate(2.25 3.279)" fill="#292d32" />
                <path id="Vector-3" data-name="Vector"
                  d="M5.751,12.481a.755.755,0,0,1-.75-.75v-5c0-4.22-1.45-5.07-4.29-5.23A.757.757,0,0,1,0,.711.763.763,0,0,1,.791,0c4.06.22,5.71,2.17,5.71,6.72v5A.758.758,0,0,1,5.751,12.481Z"
                  transform="translate(15.249 3.27)" fill="#292d32" />
                <path id="Vector-4" data-name="Vector"
                  d="M3.75,4.5h-3A.75.75,0,0,1,.75,3H3V.75a.75.75,0,0,1,1.5,0v3A.755.755,0,0,1,3.75,4.5Z"
                  transform="translate(17.25 18.25)" fill="#292d32" />
                <path id="Vector-5" data-name="Vector"
                  d="M6.707,7.457a.742.742,0,0,1-.53-.22L.218,1.278A.75.75,0,0,1,1.277.218l5.96,5.96a.754.754,0,0,1,0,1.06A.786.786,0,0,1,6.707,7.457Z"
                  transform="translate(14.252 15.253)" fill="#292d32" />
                <path id="Vector-6" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
              </svg>
              <h3 class="ml-3 mb-2">Offboarding Applications Distribution</h3>
            </div>
            <client-only>
              <chartjs-bar :height="300" :width="100" :bind="true" :datasets="datasets_offboarding_process"
                :labels="labels_offboarding_process" :option="option_offboarding_process" class="d-flex" />
            </client-only>
          </v-card>
        </v-col>
      </v-row>
      <v-row class="tw-gap-6 tw-mb-8 lg:tw-mb-10">
        <!-- Top Row: Recent Onboardings & Recent Tickets side-by-side -->
        <div class="tw-flex tw-flex-col lg:tw-flex-row tw-gap-6 tw-w-full">
          <!-- Recent Onboardings Card -->
          <div class="tw-flex-1">
            <v-card class="tw-bg-white tw-rounded-xl tw-shadow tw-p-0 tw-overflow-hidden tw-border-t-4 tw-border-violet-400">
              <div class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-pt-5 tw-pb-2">
                <div class="tw-flex tw-items-center tw-gap-2">
                  <v-icon color="deep-purple accent-4" size="22">mdi-account-plus</v-icon>
                  <span class="tw-font-semibold tw-text-lg tw-text-violet-700">Recent Onboardings</span>
                </div>
                <v-btn text small color="primary" @click="$router.push('/onboarding')">View All</v-btn>
              </div>
              <div class="tw-overflow-x-auto tw-max-h-72 tw-overflow-y-auto tw-px-4 tw-pb-4">
                <table class="tw-min-w-full tw-text-sm tw-text-gray-700">
                  <thead>
                    <tr class="tw-bg-violet-50">
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Name</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Email</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Company</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Created Date</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in recentOnboardings" :key="user._id" class="hover:tw-bg-violet-100 tw-transition">
                      <td class="tw-py-2 tw-px-3 tw-flex tw-items-center tw-gap-2">
                        <img v-if="user.userDetails?.image_url" :src="user.userDetails.image_url" class="tw-w-7 tw-h-7 tw-rounded-full tw-object-cover" alt="avatar" />
                        <span>{{ [user.userDetails?.first_name, user.userDetails?.middle_name, user.userDetails?.last_name].filter(Boolean).join(' ') }}</span>
                      </td>
                      <td class="tw-py-2 tw-px-3">{{ user.userDetails?.email || '-' }}</td>
                      <td class="tw-py-2 tw-px-3">{{ user.company_name || '-' }}</td>
                      <td class="tw-py-2 tw-px-3">{{ formatDate(user.createdAt) }}</td>
                      <td class="tw-py-2 tw-px-3">
                        <span :class="['tw-px-2 tw-py-1 tw-rounded tw-text-xs',
                          user.status === 'Active' ? 'tw-bg-green-100 tw-text-green-700' :
                          user.status === 'Pending' ? 'tw-bg-yellow-100 tw-text-yellow-700' :
                          user.status === 'Withdrawn' ? 'tw-bg-red-100 tw-text-red-700' :
                          'tw-bg-gray-100 tw-text-gray-700']">
                          {{ user.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="!recentOnboardings.length">
                      <td colspan="5" class="tw-text-center tw-text-gray-400 tw-py-4">No recent onboardings</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-card>
          </div>
          <!-- Recent Tickets Card -->
          <div class="tw-flex-1">
            <v-card class="tw-bg-white tw-rounded-xl tw-shadow tw-p-0 tw-overflow-hidden tw-border-t-4 tw-border-blue-400">
              <div class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-pt-5 tw-pb-2">
                <div class="tw-flex tw-items-center tw-gap-2">
                  <v-icon color="primary" size="22">mdi-ticket</v-icon>
                  <span class="tw-font-semibold tw-text-lg tw-text-blue-700">Recent Tickets</span>
                </div>
                <v-btn text small color="primary" @click="$router.push('/support')">View All</v-btn>
              </div>
              <div class="tw-overflow-x-auto tw-max-h-72 tw-overflow-y-auto tw-px-4 tw-pb-4">
                <table class="tw-min-w-full tw-text-sm tw-text-gray-700">
                  <thead>
                    <tr class="tw-bg-blue-50">
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Ticket #</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Priority</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Type</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Assigned To</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Company</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Date</th>
                      <th class="tw-py-2 tw-px-3 tw-font-semibold tw-text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ticket in recentTickets" :key="ticket._id" class="hover:tw-bg-blue-100 tw-transition">
                      <td class="tw-py-2 tw-px-3"><p class="tw-text-nowrap">{{ ticket.incident_number || '-' }}</p></td>
                      <td class="tw-py-2 tw-px-3">
                        <span :class="['tw-px-2 tw-py-1 tw-rounded tw-text-xs',
                          ticket.priority === 'High' ? 'tw-bg-red-100 tw-text-red-700' :
                          ticket.priority === 'Medium' ? 'tw-bg-yellow-100 tw-text-yellow-700' :
                          ticket.priority === 'Low' ? 'tw-bg-green-100 tw-text-green-700' :
                          'tw-bg-gray-100 tw-text-gray-700']">
                          {{ ticket.priority || '-' }}
                        </span>
                      </td>
                      <td class="tw-py-2 tw-px-3">
                        <span :class="['tw-px-2 tw-py-1 tw-rounded tw-text-xs',
                          ticket.type === 'Application Status' ? 'tw-bg-violet-100 tw-text-violet-700' :
                          ticket.type === 'Invoice' ? 'tw-bg-blue-100 tw-text-blue-700' :
                          ticket.type === 'Letter Request' ? 'tw-bg-yellow-100 tw-text-yellow-700' :
                          ticket.type === 'Other' ? 'tw-bg-gray-200 tw-text-gray-700' :
                          'tw-bg-gray-100 tw-text-gray-700']">
                          {{ ticket.type || '-' }}
                        </span>
                      </td>
                      <td class="tw-py-2 tw-px-3">{{ ticket.assignedToName || '-' }}</td>
                      <td class="tw-py-2 tw-px-3">{{ ticket.company_name || '-' }}</td>
                      <td class="tw-py-2 tw-px-3">{{ formatDate(ticket.createdAt) }}</td>
                      <td class="tw-py-2 tw-px-3">
                        <span :class="['tw-px-2 tw-py-1 tw-rounded tw-text-xs',
                          ticket.status === 'Completed' ? 'tw-bg-green-100 tw-text-green-700' :
                          ticket.status === 'Ongoing' ? 'tw-bg-yellow-100 tw-text-yellow-700' :
                          ticket.status === 'New' ? 'tw-bg-blue-100 tw-text-blue-700' :
                          'tw-bg-gray-100 tw-text-gray-700']">
                          {{ ticket.status }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="!recentTickets.length">
                      <td colspan="8" class="tw-text-center tw-text-gray-400 tw-py-4">No recent tickets</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-card>
          </div>
        </div>
        <!-- Additional space for future content if needed -->
        <div class="tw-mt-6 tw-w-full"></div>
      </v-row>
    </div>
  </div>
  </div>
</template>

<script>
import DashboardSkeleton from './DashboardSkeleton.vue'
import ClientStatsCards from '../ClientStats/ClientStatsCards.vue'
export default {
  props: ['users', 'companies', 'configuration'],
  components: {
    DashboardSkeleton,
    ClientStatsCards
  },
  data() {
    return {
      loading: true,
      dialog: false,
      dialogWidth: '50%',
      mobile_users: [],
      leadsLoading: true,
      leadsDistribution: [],
      leadsChartLabels: [],
      leadsChartDatasets: [],
      recentOnboardings: [],
      recentTickets: [],
      clientStats: null,
      clientStatsLoading: true,
      activeTab: 'overview',
      tabs: [
        { id: 'overview', name: 'Overview', icon: 'mdi-view-dashboard' },
        { id: 'clients', name: 'Clients', icon: 'mdi-account-group' }
      ],
      renewalsLoading: true,
      renewalsData: [],
      renewalsLabels: [],
      renewalsDatasets: [],
      renewalsChartOptions: {
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: false
            },
            gridLines: {
              drawOnChartArea: false
            }
          }],
          yAxes: [{
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: true,
              maxTicksLimit: 6
            },
            gridLines: {
              drawOnChartArea: false
            }
          }]
        }
      },
      stats: {
        employees: '--',
        onboardings: '--',
        renewals: '--',
        offboardings: '--',
        visaProcesses: '--',
        tickets: '--',
        mobileUsersCount: '--',
        leads: '--'
      },
      accentColors: [
        '#673ab8', '#1798ff', '#0A2C4F', '#e1417e', '#4eac66', '#fba50d'
      ],
      chartPalette: [
        '#1798ff', // Blue
        '#673ab8', // Purple
        '#4eac66', // Green
        '#e1417e', // Red
        '#fba50d', // Yellow
        '#0A2C4F', // Navy
      ],
      option_onboarding_process: {
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex];
            }
          },
          legend: {
            align: 'start'
          },
          title: {

          }
        },
        legend: {
          display: false,
          align: 'start'

        },
        title: {
          display: false,
          text: 'Department Distribution',
          align: 'start'
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: false,
              display: true
            },
            stacked: true,
            gridLines: {
              drawOnChartArea: false
            }
          }],
          yAxes: [{
            stacked: true,
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: false,
              maxTicksLimit: 6
            },
            gridLines: {
              drawOnChartArea: false
            }
          }]
        }
      },
      option_offboarding_process: {
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex];
            }
          },
          legend: {
            align: 'start'
          },
          title: {

          }
        },
        legend: {
          display: false,
          align: 'start'

        },
        title: {
          display: false,
          align: 'start'
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: false,
              display: true
            },
            stacked: true,
            gridLines: {
              drawOnChartArea: false
            }
          }],
          yAxes: [{
            stacked: true,
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: false,
              maxTicksLimit: 6
            },
            gridLines: {
              drawOnChartArea: false
            }
          }]
        }
      },
      option_visa_process: {
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex];
            }
          },
          legend: {
            align: 'start'
          },
          title: {

          }
        },
        legend: {
          display: true,
          align: 'start',
          position: 'bottom',

        },
        title: {
          display: false,
          align: 'start'
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            display: false,
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: false,
              display: true
            },
            stacked: true,
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            display: false,
            stacked: true,
            ticks: {
              fontFamily: "sans-serif",
              fontSize: 11,
              beginAtZero: false,
              maxTicksLimit: 6
            },
            gridLines: {
              display: false
            }
          }]
        }
      },
      labels_onboarding_process: [],
      labels_offboarding_process: [],
      labels_visa_process: [],
      datasets_onboarding_process: [],
      datasets_offboarding_process: [],
      datasets_visa_process: [],
      onboarding_count: 0,
      offboarding_count: 0,
      visaprocess_count: 0,
      mobile_count: 0
    }
  },
  computed: {
    statsCards() {
      return [
        {
          label: 'Employees',
          value: this.stats.employees,
          sub: 'Total employees',
          icon: 'mdi-account-group',
          iconBg: 'tw-bg-blue-100',
          iconColor: 'primary',
        },
        {
          label: 'Onboardings',
          value: this.stats.onboardings,
          sub: 'Active onboardings',
          icon: 'mdi-account-plus',
          iconBg: 'tw-bg-violet-100',
          iconColor: 'deep-purple accent-4',
        },
        {
          label: 'Renewals',
          value: this.stats.renewals,
          sub: 'Renewal requests',
          icon: 'mdi-autorenew',
          iconBg: 'tw-bg-yellow-100',
          iconColor: 'warning',
        },
        {
          label: 'Offboardings',
          value: this.stats.offboardings,
          sub: 'Active offboardings',
          icon: 'mdi-account-minus',
          iconBg: 'tw-bg-red-100',
          iconColor: 'error',
        },
        {
          label: 'Visa Processes',
          value: this.stats.visaProcesses,
          sub: 'Visa processes in progress',
          icon: 'mdi-passport',
          iconBg: 'tw-bg-blue-100',
          iconColor: 'primary',
        },
        {
          label: 'Tickets',
          value: this.stats.tickets,
          sub: 'Support tickets',
          icon: 'mdi-ticket',
          iconBg: 'tw-bg-blue-100',
          iconColor: 'primary',
        },
        {
          label: 'Leads',
          value: this.stats.leads,
          sub: 'New leads',
          icon: 'mdi-lead-pencil',
          iconBg: 'tw-bg-green-100',
          iconColor: 'success',
        },
        {
          label: 'Mobile Users',
          value: this.stats.mobileUsersCount,
          sub: 'Users on mobile app',
          icon: 'mdi-cellphone',
          iconBg: 'tw-bg-green-100',
          iconColor: 'success',
        }
      ]
    },
  },
  async mounted() {
    await this.fetchDashboardStats();
    await Promise.all([
      this.getOnBoardingApplicationCount(),
      this.getOffBoardingApplicationCount(),
      this.getVisaProcess(),
      this.getMobileUsersCount(),
      this.fetchRecentOnboardings(),
      this.fetchRecentTickets(),
      this.fetchConsolidatedClientStats(),
      this.renewalsDistribution()
    ])
    await this.fetchLeadsStats();
    this.loading = false;
  },
  methods: {
    setActiveTab(tabId) {
      this.activeTab = tabId;
    },
    async renewalsDistribution(){
      this.renewalsLoading = true;
      try{
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$get(
          `/renewals/get_status_count`,
          {},
          { headers: { Authorization: AuthStr } }
        );

        if (Array.isArray(response)) {
          // Filter out the total count if it exists
          const totalObj = response.find(x => x._id === 'Total');
          const filteredData = response.filter(x => x._id !== 'Total');

          // Set up chart data
          this.renewalsLabels = filteredData.map(x => x._id);
          this.renewalsDatasets = [{
            label: 'Renewals',
            data: filteredData.map(x => x.count),
            backgroundColor: this.chartPalette.slice(0, filteredData.length),
            borderRadius: 8,
            barThickness: 24
          }];

          this.renewalsData = filteredData;
        }
      } catch(error) {
        console.error('Error fetching renewals distribution:', error);
        this.renewalsLabels = [];
        this.renewalsDatasets = [];
        this.renewalsData = [];
      } finally {
        this.renewalsLoading = false;
      }
    },
    async fetchConsolidatedClientStats(){
      try{
         const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post(
          `/dashboard/clientstats`,
          {},
          { headers: { Authorization: AuthStr } }
        );
        this.clientStats = response;
      }catch(error){
        console.error('Error fetching consolidated client stats:', error);
        this.clientStats = null;
      } finally {
        this.clientStatsLoading = false;
      }
    },
    async fetchDashboardStats() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post(
          `/dashboard/stats`,
          {},
          { headers: { Authorization: AuthStr } }
        );
        this.stats.employees = response.users ?? '--';
        this.stats.onboardings = response.onboardings ?? '--';
        this.stats.renewals = response.renewals ?? '--';
        this.stats.offboardings = response.offboardings ?? '--';
        this.stats.visaProcesses = response.visaProcesses ?? '--';
        this.stats.tickets = response.tickets ?? '--';
        this.stats.leads = response.leads ?? '--';
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    },
    async getOnBoardingApplicationCount() {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token);
      await this.$axios.$post("/onboardings/get_status_count", { headers: { Authorization: AuthStr } })
        .then(res => {
          this.onboardings = res
          this.onboarding_count = res[res.length - 1].count
          this.onboardings.pop()
          const array = []
          this.onboardings.forEach((element, idx) => {
            this.labels_onboarding_process.push(element._id)
            array.push(JSON.parse(element.count))
          });
          this.datasets_onboarding_process = [{
            barThickness: 40,
            data: array,
            backgroundColor: this.chartPalette.slice(0, array.length),
            borderRadius: 8
          }]
        })
        .catch((err) => {
          console.log(err)
        })
    },
    openDialog() {
      this.dialog = true
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async getMobileUsersCount(){
      const token = this.$store.state.token;
      const AuthStr = 'Bearer '.concat(token);
      let count = await this.$axios.$get("/users/mobile/login/stats", {headers: {Authorization: AuthStr} })
      console.log("This is the count of items", count)
      this.mobile_count = count.count
      this.mobile_users = count.users
      this.stats.mobileUsersCount = count.count
    },
    async getOffBoardingApplicationCount() {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token);
      await this.$axios.$post("/offboardings/get_status_count", { headers: { Authorization: AuthStr } })
        .then(res => {
          this.offboardings = res
          this.offboarding_count = res[res.length - 1].count
          this.offboardings.pop()
          const array = []
          this.offboardings.forEach((element, idx) => {
            this.labels_offboarding_process.push(element._id)
            array.push(JSON.parse(element.count))
          });
          this.datasets_offboarding_process = [{
            barThickness: 40,
            data: array,
            backgroundColor: this.chartPalette.slice(0, array.length),
            borderRadius: 8
          }]
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async getVisaProcess() {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token);
      await this.$axios.$post("/visaprocess/distribution", { headers: { Authorization: AuthStr } })
        .then(res => {
          const array = []
          res.forEach((element, idx) => {
            this.labels_visa_process.push(element._id)
            array.push(JSON.parse(element.count))
          });
          this.visaprocess_count = res[res.length - 1].count
          res.pop()
          this.datasets_visa_process = [{
            data: array,
            backgroundColor: this.chartPalette.slice(0, array.length),
            borderRadius: 8
          }]
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async fetchLeadsStats() {
      this.leadsLoading = true;
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$get('/leads/get_status_count', { headers: { Authorization: AuthStr } });
        if (Array.isArray(response)) {
          const totalObj = response.find(x => x._id === 'Total');
          const total = totalObj ? totalObj.count : 1;
          this.leadsDistribution = response.filter(x => x._id !== 'Total');
          this.leadsChartLabels = this.leadsDistribution.map(x => x._id);
          this.leadsChartDatasets = [
            {
              label: 'Leads',
              data: this.leadsDistribution.map(x => x.count),
              backgroundColor: this.chartPalette.slice(0, this.leadsDistribution.length),
              borderRadius: 8,
              barThickness: 24
            }
          ];
        } else {
          this.leadsChartLabels = [];
          this.leadsChartDatasets = [];
        }
      } catch (error) {
        this.leadsChartLabels = [];
        this.leadsChartDatasets = [];
      }
      this.leadsLoading = false;
    },
    async fetchRecentOnboardings() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const res = await this.$axios.$post('/dashboard/recent/onboardings', {}, { headers: { Authorization: AuthStr } });
        this.recentOnboardings = Array.isArray(res.results) ? res.results : [];
      } catch (e) {
        this.recentOnboardings = [];
      }
    },
    async fetchRecentTickets() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const res = await this.$axios.$post('/dashboard/recent/tickets', {}, { headers: { Authorization: AuthStr } });
        this.recentTickets = Array.isArray(res.results) ? res.results : [];
      } catch (e) {
        this.recentTickets = [];
      }
    },
  }
}
</script>

<style scoped>
.curve {
  position: absolute;
  transform: rotate(-45deg);
  border-radius: 0 50% 0 50%;
  box-shadow: 0 0 0 10px #fff;
  background: #fff;
  top: -10%;
  left: 10%;
}

.curve::before {
  border-bottom-right-radius: 20px;
}

.curve2 {
  position: absolute;
  transform: rotate(-45deg);
  border-radius: 0 50% 0 50%;
  box-shadow: 0 0 0 10px #0A2C4F;
  background: #0A2C4F;
  top: -10%;
  left: 10%;
}

.curve2::before {
  border-bottom-right-radius: 20px;
}

.curve-parent {
  position: relative;
}

.curveImage {
  transform: rotate(45deg);
  z-index: 6;
}

@media screen and (max-width:1540px) {
  .eventCard {
    max-height: 420px !important;
    min-height: 420px !important;
  }

  .eventCardImg {
    max-height: 240px !important;
  }

  .newsCardText,
  .newsCardTitle {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
}
</style>
