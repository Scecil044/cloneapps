<template>
  <div class="client-stats-container">
    <!-- Modern Stat Cards Grid -->
    <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-5 tw-gap-3 tw-mb-8 tw-pl-3">
      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Active Clients</span>
          <span class="tw-text-3xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-blue-600">{{ clientStats.activeClients || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Ready for operations</span>
        </div>
        <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-blue-100">
          <v-icon color="primary" size="28">mdi-briefcase-check</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-blue-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-blue-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Inactive Clients</span>
          <span class="tw-text-3xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-amber-600">{{ clientStats.inactiveClients || 0 }}</span>
          <span class="tw-text-xs tw-text-gray-400">Pending activation</span>
        </div>
        <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-amber-100">
          <v-icon color="amber darken-2" size="28">mdi-briefcase-clock</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-amber-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-amber-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Top Industry</span>
          <span class="tw-text-xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-teal-600 tw-truncate">{{ clientStats.topIndustry?._id || 'N/A' }}</span>
          <span class="tw-text-xs tw-text-gray-400">{{ clientStats.topIndustry?.count || 0 }} clients</span>
        </div>
        <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-teal-100">
          <v-icon color="teal" size="28">mdi-domain</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-teal-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-teal-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Active Employees</span>
          <span class="tw-text-3xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-green-600">{{ getStatusCount('active') }}</span>
          <span class="tw-text-xs tw-text-gray-400">Currently working</span>
        </div>
        <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-green-100">
          <v-icon color="success" size="28">mdi-account-check</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-green-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-green-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Onboarding</span>
          <span class="tw-text-3xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-indigo-600">{{ getStatusCount('onboarding') }}</span>
          <span class="tw-text-xs tw-text-gray-400">In pipeline</span>
        </div>
        <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-indigo-100">
          <v-icon color="indigo" size="28">mdi-account-arrow-right</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-indigo-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-indigo-600"></div>
      </div>

      <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-5 tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative animate-fade-in">
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">Top Client</span>
          <span class="tw-text-xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-purple-600 tw-truncate">{{ (clientStats.highestPayingClient?.company_name?.split(' ').slice(0, 2).join(' ')) || 'N/A' }}
</span>
          <span class="tw-text-xs tw-text-gray-400">${{ clientStats.highestPayingClient?.serviceFee || '0' }} service fee</span>
        </div>
        <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-ml-2 tw-bg-purple-100">
          <v-icon color="deep-purple" size="28">mdi-crown</v-icon>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-purple-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-purple-600"></div>
      </div>
    </div>

    <!-- Charts Row -->
    <v-row class="pt-0 pl-1 mr-5 ml-0">
      <!-- Employment Type Distribution Chart -->
      <v-col cols="12" md="6">
        <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
          <div class="d-flex">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="employmentGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#1798ff"/>
                  <stop offset="100%" stop-color="#673ab8"/>
                </linearGradient>
              </defs>
              <path d="M21 21H5C3.895 21 3 20.105 3 19V3" stroke="url(#employmentGradient)" stroke-width="2" stroke-linecap="round"/>
              <path d="M7 15L11 10L15 13L19 7" stroke="url(#employmentGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 class="ml-3">Employment Type Distribution</h3>
          </div>
          <client-only>
            <chartjs-doughnut
              :height="250"
              :bind="true"
              :datasets="employmentTypeDatasets"
              :labels="employmentTypeLabels"
              :option="chartOptions"
            />
          </client-only>
        </v-card>
      </v-col>

      <!-- Visa Sponsor Type Distribution Chart -->
      <v-col cols="12" md="6">
        <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
          <div class="d-flex items-center mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="visaGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#FF416C"/>
                  <stop offset="100%" stop-color="#FF4B2B"/>
                </linearGradient>
              </defs>
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="url(#visaGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 22V12" stroke="url(#visaGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M20 7L12 12L4 7" stroke="url(#visaGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h3 class="ml-3 font-semibold text-lg">Visa Sponsor Type Distribution</h3>
          </div>
          <client-only>
            <chartjs-pie
              :height="250"
              :bind="true"
              :datasets="visaSponsorTypeDatasets"
              :labels="visaSponsorTypeLabels"
              :option="chartOptions"
            />
          </client-only>
        </v-card>
      </v-col>
    </v-row>

    <!-- Second Row of Charts -->
    <v-row class="pt-4 pl-3 mr-5 ml-0">
      <!-- Top Countries -->
      <v-col cols="12" md="6">
        <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
          <div class="d-flex">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="countryGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#00c6ff"/>
                  <stop offset="100%" stop-color="#0072ff"/>
                </linearGradient>
              </defs>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#countryGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.99961 3H8.99961C7.04961 8.84 7.04961 15.16 8.99961 21H7.99961" stroke="url(#countryGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 3C16.95 8.84 16.95 15.16 15 21" stroke="url(#countryGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 16V15C8.84 16.95 15.16 16.95 21 15V16" stroke="url(#countryGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 9.00001C8.84 7.05001 15.16 7.05001 21 9.00001" stroke="url(#countryGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 class="ml-3">Top 10 Nationalities</h3>
          </div>
          <client-only>
            <chartjs-horizontal-bar
              :height="300"
              :bind="true"
              :datasets="nationalityDatasets"
              :labels="nationalityLabels"
              :option="horizontalBarOptions"
            />
          </client-only>
        </v-card>
      </v-col>

      <!-- Employee Status Distribution -->
      <v-col cols="12" md="6">
        <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
          <div class="d-flex items-center mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="statusGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#1D976C"/>
                  <stop offset="100%" stop-color="#93F9B9"/>
                </linearGradient>
              </defs>
              <path d="M16 16L12 12L8 16" stroke="url(#statusGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 12V21" stroke="url(#statusGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.39 18.39C21.3653 17.8583 22.1358 17.0169 22.5799 15.9986C23.024 14.9804 23.1162 13.8432 22.8422 12.7667C22.5682 11.6901 21.9435 10.7355 21.0667 10.0534C20.1899 9.37137 19.1109 9.00072 18 8.99998H16.74C16.4373 7.82923 15.8731 6.74232 15.0899 5.82098C14.3067 4.89964 13.3248 4.16785 12.2181 3.68061C11.1114 3.19336 9.90856 2.96584 8.70012 3.01638C7.49169 3.06691 6.30907 3.39338 5.24114 3.96792C4.17322 4.54246 3.24772 5.35080 2.53073 6.3248C1.81375 7.29879 1.32458 8.41690 1.10063 9.60180C0.876686 10.7867 0.924059 12.0074 1.23853 13.1703C1.55301 14.3332 2.12859 15.4047 2.92 16.3" stroke="url(#statusGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="ml-3">
              <h3 class="font-semibold text-lg">Employee Status Distribution</h3>
              <p class="text-xs text-gray-500 mt-1">Hover over a bar to see definitions, totals and net active</p>
            </div>
          </div>
          <client-only>
            <chartjs-bar
              :height="300"
              :bind="true"
              :datasets="userStatusDatasets"
              :labels="userStatusLabels"
              :option="barChartOptions"
            />
          </client-only>
        </v-card>
      </v-col>
    </v-row>

    <!-- Third Row - Employees Per Client Table and Industry Distribution Chart -->
    <v-row class="pt-4 pl-3 mr-5 ml-0">
      <!-- Employees Per Client Table -->
      <v-col cols="12" md="7" lg="7">
        <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4">
          <div class="d-flex mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="clientGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#6D5BBA"/>
                  <stop offset="100%" stop-color="#8D72E6"/>
                </linearGradient>
              </defs>
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="url(#clientGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="url(#clientGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="url(#clientGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="url(#clientGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 class="ml-3">Top Clients by Employee Count</h3>
          </div>

          <div class="tw-overflow-x-auto">
            <table class="tw-min-w-full tw-border-collapse tw-text-sm">
              <thead>
                <tr class="tw-bg-purple-50">
                  <th class="tw-py-3 tw-px-4 tw-font-semibold tw-text-left tw-text-purple-800">Company Name</th>
                  <th class="tw-py-3 tw-px-4 tw-font-semibold tw-text-center tw-text-purple-800">Active</th>
                  <th class="tw-py-3 tw-px-4 tw-font-semibold tw-text-center tw-text-purple-800">Onboarding</th>
                  <th class="tw-py-3 tw-px-4 tw-font-semibold tw-text-center tw-text-purple-800">Inactive</th>
                  <th class="tw-py-3 tw-px-4 tw-font-semibold tw-text-center tw-text-purple-800">Other</th>
                  <th class="tw-py-3 tw-px-4 tw-font-semibold tw-text-center tw-text-purple-800">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="company in topCompanies" :key="company.company_id" class="tw-border-b tw-border-gray-200 hover:tw-bg-purple-50">
                  <td class="tw-py-3 tw-px-4 tw-font-medium">{{ company.company_name || 'Unknown' }}</td>
                  <td class="tw-py-3 tw-px-4 tw-text-center">
                    <span class="tw-px-2 tw-py-1 tw-rounded tw-bg-green-100 tw-text-green-700">{{ company.active || 0 }}</span>
                  </td>
                  <td class="tw-py-3 tw-px-4 tw-text-center">
                    <span class="tw-px-2 tw-py-1 tw-rounded tw-bg-blue-100 tw-text-blue-700">{{ company.onboarding || 0 }}</span>
                  </td>
                  <td class="tw-py-3 tw-px-4 tw-text-center">
                    <span class="tw-px-2 tw-py-1 tw-rounded tw-bg-red-100 tw-text-red-700">{{ company.inactive || 0 }}</span>
                  </td>
                  <td class="tw-py-3 tw-px-4 tw-text-center">
                    <span class="tw-px-2 tw-py-1 tw-rounded tw-bg-gray-100 tw-text-gray-700">{{ company.other || 0 }}</span>
                  </td>
                  <td class="tw-py-3 tw-px-4 tw-font-medium tw-text-center">
                    <span class="tw-px-3 tw-py-1 tw-rounded-full tw-bg-purple-100 tw-text-purple-700">{{ company.total }}</span>
                  </td>
                </tr>
                <tr v-if="topCompanies.length === 0">
                  <td colspan="6" class="tw-py-6 tw-text-center tw-text-gray-500">No company data available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card>
      </v-col>

      <!-- Industry Distribution Chart -->
      <v-col cols="12" md="5" lg="5">
        <ClientIndustryChart :industryData="clientStats.industryCounts || []" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ClientIndustryChart from './ClientIndustryChart.vue'

export default {
  components: {
    ClientIndustryChart
  },
  data() {
    return {
      showLegend: false
    };
  },
  props: {
    clientStats: {
      type: Object,
      required: true
    }
  },
  computed: {
    // Employment Type datasets for doughnut chart
    employmentTypeLabels() {
      return this.clientStats.employmentTypeCounts?.map(item => item._id) || [];
    },
    employmentTypeDatasets() {
      return [{
        data: this.clientStats.employmentTypeCounts?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ]
      }];
    },

    // Visa Sponsor Type datasets for pie chart
    visaSponsorTypeLabels() {
      return this.clientStats.visaSponsorTypeCounts?.map(item => item._id) || [];
    },
    visaSponsorTypeDatasets() {
      return [{
        data: this.clientStats.visaSponsorTypeCounts?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)'
        ]
      }];
    },

    // User Status datasets for bar chart
    userStatusLabels() {
      return this.clientStats.userStatusCounts?.map(item => item._id) || [];
    },
    userStatusDatasets() {
      return [{
        label: 'Employee Count',
        data: this.clientStats.userStatusCounts?.map(item => item.count) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ]
      }];
    },

    // Top nationalities for horizontal bar
    nationalityLabels() {
      return this.clientStats.topCountries?.map(item => item._id) || [];
    },
    nationalityDatasets() {
      return [{
        label: 'Employee Count',
        data: this.clientStats.topCountries?.map(item => item.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }];
    },

    // Top companies by employee count
    topCompanies() {
      // Group by company_id and aggregate counts
      const companyMap = {};

      if (!this.clientStats.employeesPerClient) {
        return [];
      }

      this.clientStats.employeesPerClient.forEach(item => {
        const companyId = item._id?.company_id;
        const status = (item._id?.user_status || '').toLowerCase();
        const count = item.count || 0;

        if (!companyId) return;

        if (!companyMap[companyId]) {
          companyMap[companyId] = {
            company_id: companyId,
            company_name: item.company_name || 'Unknown',
            active: 0,
            onboarding: 0,
            inactive: 0,
            other: 0,
            total: 0
          };
        }

        if (status === 'active') {
          companyMap[companyId].active += count;
        } else if (status === 'onboarding') {
          companyMap[companyId].onboarding += count;
        } else if (status === 'inactive') {
          companyMap[companyId].inactive += count;
        } else {
          companyMap[companyId].other += count;
        }

        companyMap[companyId].total += count;
      });

      // Convert to array and sort by total
      return Object.values(companyMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    },

    // Chart options
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Roboto'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw + ' employees';
              }
            }
          }
        }
      };
    },

    horizontalBarOptions() {
      return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      };
    },

    barChartOptions() {
      const self = this;
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            gridLines: { display: false },
            ticks: { fontSize: 11 }
          }],
          yAxes: [{
            ticks: { beginAtZero: true, fontSize: 11 },
            gridLines: { color: 'rgba(0,0,0,0.05)' }
          }]
        },
        legend: { display: false },
        tooltips: {
          enabled: true,
          displayColors: false,
          callbacks: {
            title: function(tooltipItems, data) {
              return tooltipItems[0] && tooltipItems[0].label ? tooltipItems[0].label : 'Unknown Status';
            },
            label: function(tooltipItem, data) {
              const status = data.labels[tooltipItem.index];
              const count = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              const descriptions = {
                'active': 'Currently working',
                'onboarding': 'In pipeline',
                'new visa process': 'Visa application in progress',
                'inactive': 'Employees we no longer do business with',
                'withdrawn': 'No longer employed',
                'offboarding': 'Leaving the company',
                'null': 'Status not specified'
              };
              const desc = descriptions[(status || '').toLowerCase()] || descriptions['null'];
              const total = self.totalEmployees;
              const net = self.calculatedNetActive;
              return [
                `${status || 'Unknown'}: ${count} employees`,
                `Definition: ${desc}`,
                `Total: ${total} | Net Active: ${net}`
              ];
            }
          }
        },
        animation: { duration: 800, easing: 'easeInOutQuad' },
        elements: { rectangle: { borderSkipped: 'bottom' } }
      };
    },

    // Status legend for Employee Status Distribution chart
    statusLegend() {
      const statusMap = {
        'active': { label: 'Active', description: 'Currently working' },
        'onboarding': { label: 'Onboarding', description: 'In pipeline' },
        'new visa process': { label: 'New Visa Process', description: 'Visa application in progress' },
        'inactive': { label: 'Inactive', description: 'Employees we no longer do business with' },
        'withdrawn': { label: 'Withdrawn', description: 'No longer employed' },
        'offboarding': { label: 'Offboarding', description: 'Leaving the company' },
        'null': { label: 'Unspecified', description: 'Status not specified' }
      };

      const chartColors = [
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ];

      // Only show statuses that exist in the data
      return this.userStatusLabels
        .map((label, index) => {
          const status = statusMap[label] || statusMap['null'];
          return {
            key: label,
            label: status.label,
            description: status.description,
            color: chartColors[index % chartColors.length]
          };
        })
        .filter(item => item.key !== undefined);
    },

    // Calculated Net Active Employees
    calculatedNetActive() {
      const active = this.getStatusCount('active');
      const onboarding = this.getStatusCount('onboarding');
      const newVisaProcess = this.getStatusCount('new visa process');
      const withdrawn = this.getStatusCount('withdrawn');
      const inactive = this.getStatusCount('inactive');
      const offboarding = this.getStatusCount('offboarding');

      return active + onboarding + newVisaProcess - withdrawn - inactive - offboarding;
    },

    // Total Employees for the first status legend
    totalEmployees() {
      return this.clientStats.userStatusCounts?.reduce((sum, item) => sum + item.count, 0) || 0;
    }
  },
  methods: {
    // Get count for a specific user status
    getStatusCount(status) {
      if (status === null || status === undefined) {
        const found = this.clientStats.userStatusCounts?.find(item => item._id === null);
        return found ? found.count : 0;
      }

      const found = this.clientStats.userStatusCounts?.find(item =>
        item._id?.toLowerCase() === status.toLowerCase()
      );
      return found ? found.count : 0;
    }
  }
};
</script>

<style scoped>
.client-stats-container {
  margin-bottom: 20px;
}

/* Animation for fade-in effect */
.animate-fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for the legend */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth transitions for the hover legend */
.hover-legend-enter-active,
.hover-legend-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-legend-enter-from,
.hover-legend-leave-to {
  opacity: 0;
  transform: scale(0.95) translateX(8px);
}

/* Enhanced hover effects for chart bars */
.chart-container:hover .chart-bar {
  transition: all 0.2s ease-in-out;
}

/* Responsive positioning for the hover legend */
@media (max-width: 768px) {
  .hover-legend {
    right: 0;
    left: 0;
    margin: 0 1rem;
    min-width: auto;
  }
}

/* Smooth animations for the hover legend */
.hover-legend {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Enhanced hover effects for legend items */
.legend-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.legend-item:hover {
  transform: translateX(4px);
}

/* Glow effect for the legend */
.legend-glow {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Backdrop blur effect */
.backdrop-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
