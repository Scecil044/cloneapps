<template>
  <div class="tw-bg-gray-50 tw-h-screen tw-w-screen tw-overflow-hidden tw-flex">
    <!-- Sidebar overlay for mobile -->
    <div v-if="sidebarMobileOpen" class="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-40 tw-z-40 md:tw-hidden" @click="closeSidebarMobile"></div>
    <!-- Sidebar -->
    <aside :class="[
      'tw-fixed tw-z-50 tw-inset-y-0 tw-left-0 tw-bg-white tw-shadow-lg tw-transition-all tw-duration-300 tw-flex tw-flex-col tw-justify-between tw-h-full tw-border-r tw-border-gray-100 tw-pr-3',
      sidebarOpen ? 'tw-w-64' : 'tw-w-16',
      sidebarMobileOpen ? 'tw-translate-x-0' : '-tw-translate-x-full',
      'md:tw-translate-x-0',
      'tw-transform'
    ]">
      <!-- Sidebar logo -->
      <div v-if="sidebarOpen" class="tw-flex tw-items-center tw-justify-center tw-h-16 tw-border-b tw-border-gray-100 tw-px-4">
        <img src="/eor_central_logo.svg" class="tw-object-cover tw-h-8" />
      </div>
      <div v-else class="tw-h-16"></div>
      <!-- Sidebar menu -->
      <nav class="tw-flex-1 tw-overflow-y-auto tw-py-4">
        <ul class="tw-space-y-2">
          <li v-for="group in navGroups" :key="group.title">
            <!-- Group Title -->
            <div :class="['tw-flex tw-items-center tw-justify-between tw-cursor-pointer tw-py-2 tw-rounded tw-transition hover:tw-bg-gray-50 tw-px-2', sidebarOpen ? '' : 'tw-justify-center tw-px-0']" @click="toggleGroupCollapse(group.title)">
              <div :class="['tw-flex tw-gap-2', sidebarOpen ? '' : 'tw-justify-center tw-w-full']">
                <component :is="getGroupIcon(group.title)" :color="getGroupColor(group.title)" class="tw-w-5 tw-h-5" />
                <span v-if="sidebarOpen" class="tw-uppercase tw-font-semibold tw-text-xs tw-tracking-wide tw-text-nowrap" :style="{ color: getGroupColor(group.title) }">{{ group.title }}</span>
              </div>
              <span v-if="sidebarOpen" class="tw-ml-2">
                <i :class="isGroupExpanded(group.title) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" />
              </span>
            </div>
            <!-- Group Items -->
            <transition name="fade">
              <ul v-show="isGroupExpanded(group.title) && sidebarOpen" class="tw-ml-2 tw-mt-1 tw-space-y-1">
                <li v-for="item in group.items" :key="item.text">
                  <nuxt-link v-if="item.route" :to="item.route" :class="['tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-2 tw-rounded tw-text-gray-700 hover:tw-bg-blue-50 tw-transition tw-text-sm', sidebarOpen ? '' : 'tw-justify-center tw-px-0']">
                    <component :is="getItemIcon(item.text)" :color="getGroupColor(group.title)" class="tw-w-4 tw-h-4" />
                    <span v-if="sidebarOpen">{{ item.text }}</span>
                  </nuxt-link>
                  <span v-else :class="['tw-flex tw-items-center tw-gap-2 tw-px-2 tw-py-2 tw-rounded tw-text-gray-400 tw-cursor-not-allowed tw-text-sm', sidebarOpen ? '' : 'tw-justify-center tw-px-0']">
                    <component :is="getItemIcon(item.text)" :color="getGroupColor(group.title)" class="tw-w-4 tw-h-4" />
                    <span v-if="sidebarOpen">{{ item.text }}</span>
                  </span>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>
      <!-- Sidebar footer (optional) -->
      <div class="tw-p-4 tw-text-xs tw-text-gray-400 tw-text-center">v1.0.0</div>
    </aside>

    <!-- Main content area -->
    <div :class="[
      'tw-flex-1 tw-flex tw-flex-col tw-h-screen tw-transition-all tw-duration-300 tw-pl-4',
      sidebarOpen ? 'md:tw-ml-64' : 'md:tw-ml-16',
      'tw-ml-0'
    ]">
      <!-- TopNav -->
      <header class="tw-flex tw-items-center tw-justify-between tw-bg-white tw-shadow tw-px-4 tw-h-16 tw-sticky tw-top-0 tw-z-30">
        <!-- Hamburger for mobile -->
        <button class="tw-inline-flex md:tw-hidden tw-p-2 tw-rounded-full tw-bg-gray-100 hover:tw-bg-blue-100 tw-transition" @click="openSidebarMobile">
          <i class="fas fa-bars" />
        </button>
        <!-- Page Title -->
        <div class="tw-font-semibold tw-text-lg tw-text-gray-800 tw-ml-2">Dashboard</div>
        <!-- User Dropdown -->
        <div class="tw-relative">
          <button @click="userDropdownOpen = !userDropdownOpen" class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-bg-gray-100 tw-rounded-full hover:tw-bg-blue-100 tw-transition">
            <div class="tw-w-8 tw-h-8 tw-rounded-full">N</div>
            <i class="fas fa-chevron-down tw-text-gray-500" />
          </button>
          <div v-if="userDropdownOpen" class="tw-absolute tw-right-0 tw-mt-2 tw-w-40 tw-bg-white tw-shadow-lg tw-rounded-lg tw-py-2 tw-z-50">
            <a href="#" class="tw-block tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-100" @click.prevent="goToSetting">Configurations</a>
            <a href="#" class="tw-block tw-px-4 tw-py-2 tw-text-gray-700 hover:tw-bg-gray-100" @click.prevent="handleLogout">Logout</a>
          </div>
        </div>
      </header>
      <!-- Dashboard Content -->
      <main class="tw-flex-1 tw-overflow-y-auto tw-p-4 md:tw-p-6">
        <div>
          <!-- Stat Cards -->
          <div v-if="loading" class="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-6 tw-gap-6 tw-mb-8">
            <SkeletonStatCard v-for="i in 6" :key="i" />
          </div>
          <div v-else class="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-6 tw-gap-6 tw-mb-8">
            <StatCard icon="users" label="Employees" :value="stats.employees" />
            <StatCard icon="user-plus" label="Onboardings" :value="stats.onboardings" />
            <StatCard icon="user-minus" label="Offboardings" :value="stats.offboardings" />
            <StatCard icon="sync-alt" label="Renewals" :value="stats.renewals" />
            <StatCard icon="ticket-alt" label="Tickets" :value="stats.tickets" />
            <StatCard icon="passport" label="Visa Processes" :value="stats.visaProcesses" />
          </div>

          <!-- Charts Section -->
          <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 tw-mb-8">
            <!-- Onboarding Status Chart -->
            <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6">
              <h3 class="tw-text-lg tw-font-semibold tw-mb-4 tw-text-gray-800">Onboarding Status Distribution</h3>
              <div v-if="loading">
                <SkeletonChart />
              </div>
              <client-only v-else>
                <apexchart
                  v-if="onboardingChartData.series.length > 0"
                  type="donut"
                  :options="onboardingChartOptions"
                  :series="onboardingChartData.series"
                  height="350"
                />
                <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-64 tw-text-gray-400">
                  No onboarding data available
                </div>
              </client-only>
            </div>

            <!-- Offboarding Status Chart -->
            <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6">
              <h3 class="tw-text-lg tw-font-semibold tw-mb-4 tw-text-gray-800">Offboarding Status Distribution</h3>
              <div v-if="loading">
                <SkeletonChart />
              </div>
              <client-only v-else>
                <apexchart
                  v-if="offboardingChartData.series.length > 0"
                  type="bar"
                  :options="offboardingChartOptions"
                  :series="offboardingChartData.series"
                  height="350"
                />
                <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-64 tw-text-gray-400">
                  No offboarding data available
                </div>
              </client-only>
            </div>

            <!-- Renewal Status Chart -->
            <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6">
              <h3 class="tw-text-lg tw-font-semibold tw-mb-4 tw-text-gray-800">Renewal Status Overview</h3>
              <div v-if="loading">
                <SkeletonChart />
              </div>
              <client-only v-else>
                <apexchart
                  v-if="renewalChartData.series.length > 0"
                  type="pie"
                  :options="renewalChartOptions"
                  :series="renewalChartData.series"
                  height="350"
                />
                <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-64 tw-text-gray-400">
                  No renewal data available
                </div>
              </client-only>
            </div>

            <!-- Visa Process Status Chart -->
            <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6">
              <h3 class="tw-text-lg tw-font-semibold tw-mb-4 tw-text-gray-800">Visa Process Status</h3>
              <div v-if="loading">
                <SkeletonChart />
              </div>
              <client-only v-else>
                <apexchart
                  v-if="visaChartData.series.length > 0"
                  type="radialBar"
                  :options="visaChartOptions"
                  :series="visaChartData.series"
                  height="350"
                />
                <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-64 tw-text-gray-400">
                  No visa process data available
                </div>
              </client-only>
            </div>
          </div>

          <!-- Recent Activity Tables -->
          <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8">
            <div v-if="loading">
              <SkeletonTable />
            </div>
            <RecentTable v-else title="Recent Tickets" :columns="ticketColumns" :rows="recent.tickets" />
            <div v-if="loading">
              <SkeletonTable />
            </div>
            <RecentTable v-else title="Recent Onboardings" :columns="onboardingColumns" :rows="recent.onboardings" />
            <!--
            <RecentTable title="Recent Renewals" :columns="renewalColumns" :rows="recent.renewals" />
            <RecentTable title="Recent Offboardings" :columns="offboardingColumns" :rows="recent.offboardings" />
            <RecentTable title="Recent Visa Processes" :columns="visaColumns" :rows="recent.visaProcesses" />
            -->
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { Home, Users, Briefcase, FileText, UserCheck, UserPlus, UserMinus, RefreshCcw, Globe, Folder, File, User, DollarSign, HelpCircle, Settings, Layers, Mail, Shield, BarChart2 } from 'lucide-vue';

// Dummy stat card and table components for structure
const iconMap = {
  users: 'fas fa-users',
  'user-plus': 'fas fa-user-plus',
  'user-minus': 'fas fa-user-minus',
  'sync-alt': 'fas fa-sync-alt',
  'ticket-alt': 'fas fa-ticket-alt',
  passport: 'fas fa-passport',
  dashboard: 'fas fa-tachometer-alt',
  settings: 'fas fa-cog',
};

const groupIconMap = {
  'Dashboard': Home,
  'Business Development': Briefcase,
  'HR Management': Users,
  'Visa & Immigration': Globe,
  'Repositories': Folder,
  'Finance': DollarSign,
  'Support Center': HelpCircle,
  'Admin Central': Settings,
  'HR Administration': Settings,
  'HR Self Service': UserCheck,
  'Projects': Layers,
};
const itemIconMap = {
  Dashboard: Home,
  Partners: Users,
  Inquiries: FileText,
  Leads: UserPlus,
  Clients: User,
  Employees: Users,
  Onboarding: UserPlus,
  Offboarding: UserMinus,
  'Renewal Request': RefreshCcw,
  'New Process': Globe,
  'Renewal Process': RefreshCcw,
  'Cancellation Process': UserMinus,
  'Internal Resources': FileText,
  'Client Documents': File,
  'Employee Documents': User,
  Billing: DollarSign,
  'Support Tickets': HelpCircle,
  PaySlips: BarChart2,
  'Internal Access': Shield,
  'Client Access': User,
  'Employee Access': Users,
  'Client Announcement': Mail,
  'Employee Announcement': Mail,
  'Ejari-': Layers,
};
const groupColorMap = {
  'Dashboard': '#3B82F6',
  'Business Development': '#8B5CF6',
  'HR Management': '#22C55E',
  'Visa & Immigration': '#F59E42',
  'Repositories': '#EC4899',
  'Finance': '#F97316',
  'Support Center': '#06B6D4',
  'Admin Central': '#64748B',
  'Projects': '#6366F1',
  'HR Administration': '#64748B',
  'HR Self Service': '#22D3EE',
};

export default {
  name: 'ModernDashboard',
  components: {
    // apexchart: VueApexCharts, // REMOVE THIS
    StatCard: {
      props: ['icon', 'label', 'value'],
      render(h) {
        return h('div', {
          class: 'tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-transition hover:tw-scale-105 hover:tw-shadow-2xl tw-cursor-pointer tw-border tw-border-gray-100',
        }, [
          h('div', { class: 'tw-flex tw-items-center tw-gap-2' }, [
            h('span', { class: `tw-bg-gray-100 tw-text-gray-600 tw-p-2 tw-rounded-full tw-shadow` }, [
              h('i', { class: iconMap[this.icon] + ' tw-text-lg' })
            ]),
            h('div', { class: 'tw-text-3xl tw-font-bold tw-text-gray-900' }, this.value != null ? this.value : '--')
          ]),
          h('div', { class: 'tw-mt-2 tw-text-gray-700 tw-font-medium tw-text-center' }, this.label)
        ]);
      }
    },
    RecentTable: {
      props: ['title', 'columns', 'rows'],
      render(h) {
        return h('div', { class: 'tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-overflow-x-auto tw-mb-6' }, [
          h('h3', { class: 'tw-text-lg tw-font-semibold tw-mb-4' }, this.title),
          h('table', { class: 'tw-min-w-full tw-text-sm tw-text-left' }, [
            h('thead', [
              h('tr', { class: 'tw-border-b tw-bg-gray-100' },
                this.columns.map(col => h('th', { class: 'tw-py-2 tw-px-3 tw-whitespace-nowrap' }, col.label))
              )
            ]),
            h('tbody',
              this.rows.length
                ? this.rows.map((row, idx) =>
                  h('tr', { key: idx, class: 'tw-border-b hover:tw-bg-gray-50' },
                    this.columns.map(col => {
                      let cellContent = typeof col.render === 'function' ? col.render(row) : row[col.key];
                      // If the cellContent is a string and looks like HTML, use domProps.innerHTML
                      if (typeof cellContent === 'string' && /<.+?>/.test(cellContent)) {
                        return h('td', { class: 'tw-py-2 tw-px-3 tw-max-w-xs tw-truncate tw-whitespace-nowrap', domProps: { innerHTML: cellContent } });
                      } else {
                        return h('td', { class: 'tw-py-2 tw-px-3 tw-max-w-xs tw-truncate tw-whitespace-nowrap' }, cellContent);
                      }
                    })
                  )
                )
                : [h('tr', [h('td', { attrs: { colspan: this.columns.length }, class: 'tw-text-center tw-py-4 tw-text-gray-400' }, 'No data')])]
            )
          ])
        ]);
      }
    },
    SkeletonStatCard: {
      render(h) {
        return h('div', { class: 'tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-border tw-border-gray-100 tw-animate-pulse' }, [
          h('div', { class: 'tw-flex tw-items-center tw-gap-2' }, [
            h('span', { class: 'tw-bg-gray-200 tw-p-2 tw-rounded-full tw-shadow tw-w-10 tw-h-10 tw-block shimmer' }),
            h('div', { class: 'tw-bg-gray-200 tw-h-8 tw-w-16 tw-rounded shimmer' })
          ]),
          h('div', { class: 'tw-mt-2 tw-bg-gray-200 tw-h-4 tw-w-20 tw-rounded shimmer' })
        ]);
      }
    },
    SkeletonChart: {
      render(h) {
        return h('div', { class: 'tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-64 tw-w-full tw-animate-pulse' }, [
          h('div', { class: 'tw-bg-gray-200 tw-rounded-2xl tw-h-48 tw-w-48 shimmer' }),
          h('div', { class: 'tw-mt-4 tw-bg-gray-200 tw-h-4 tw-w-32 tw-rounded shimmer' })
        ]);
      }
    },
    SkeletonTable: {
      render(h) {
        return h('div', { class: 'tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-6 tw-overflow-x-auto tw-mb-6 tw-animate-pulse' }, [
          h('div', { class: 'tw-bg-gray-200 tw-h-6 tw-w-32 tw-mb-4 tw-rounded shimmer' }),
          h('table', { class: 'tw-min-w-full tw-text-sm tw-text-left' }, [
            h('thead', [
              h('tr', { class: 'tw-border-b tw-bg-gray-100' },
                Array.from({ length: 6 }).map((_, i) => h('th', { class: 'tw-py-2 tw-px-3 tw-whitespace-nowrap' }, [h('div', { class: 'tw-bg-gray-200 tw-h-4 tw-w-16 tw-rounded shimmer' })]))
              )
            ]),
            h('tbody',
              Array.from({ length: 5 }).map(() =>
                h('tr', { class: 'tw-border-b' },
                  Array.from({ length: 6 }).map(() => h('td', { class: 'tw-py-2 tw-px-3' }, [h('div', { class: 'tw-bg-gray-200 tw-h-4 tw-w-20 tw-rounded shimmer' })]))
                )
              )
            )
          ])
        ]);
      }
    }
  },
  data() {
    return {
      userData: this.$store.state.users,
      stats: {
        employees: '--',
        onboardings: '--',
        offboardings: '--',
        renewals: '--',
        tickets: '--',
        visaProcesses: '--',
      },
      recent: {
        tickets: [],
        renewals: [],
        onboardings: [],
        offboardings: [],
        visaProcesses: [],
      },
      // Chart data
      onboardingChartData: {
        series: [],
        labels: []
      },
      offboardingChartData: {
        series: [],
        categories: []
      },
      renewalChartData: {
        series: [],
        labels: []
      },
      visaChartData: {
        series: [],
        labels: []
      },
      // Chart options
      onboardingChartOptions: {
        chart: {
          type: 'donut',
          fontFamily: 'Inter, sans-serif'
        },
        labels: [],
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return Math.round(val) + '%'
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total',
                  fontSize: '16px',
                  fontWeight: 600
                }
              }
            }
          }
        },
        legend: {
          position: 'bottom',
          fontSize: '12px'
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
      offboardingChartOptions: {
        chart: {
          type: 'bar',
          fontFamily: 'Inter, sans-serif',
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: false, // changed from true to false
            borderRadius: 4,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          offsetX: -6,
          style: {
            fontSize: '12px',
            colors: ['#fff']
          }
        },
        xaxis: {
          categories: []
        },
        colors: ['#3B82F6'],
        grid: {
          show: true,
          strokeDashArray: 3
        }
      },
      renewalChartOptions: {
        chart: {
          type: 'pie',
          fontFamily: 'Inter, sans-serif'
        },
        labels: [],
        colors: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return Math.round(val) + '%'
          }
        },
        legend: {
          position: 'bottom',
          fontSize: '12px'
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },
      visaChartOptions: {
        chart: {
          type: 'radialBar',
          fontFamily: 'Inter, sans-serif'
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: {
              margin: 5,
              size: '30%',
              background: 'transparent',
              image: undefined,
            },
            dataLabels: {
              name: {
                show: true,
                fontSize: '16px',
                fontWeight: 600,
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '14px',
                offsetY: 16,
                formatter: function (val) {
                  return parseInt(val) + '%'
                }
              }
            }
          }
        },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'],
        labels: [],
        legend: {
          show: true,
          floating: true,
          fontSize: '12px',
          position: 'left',
          offsetX: 50,
          offsetY: 10,
          labels: {
            useSeriesColors: true,
          },
          markers: {
            size: 0
          },
          formatter: function(seriesName, opts) {
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%"
          },
          itemMargin: {
            horizontal: 1,
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              show: false
            }
          }
        }]
      },
      // Table columns (existing)
      ticketColumns: [
        { label: 'Incident #', key: 'incident_number' },
        { label: 'Type', key: 'type' },
        { label: 'Company', key: 'company_name' },
        { label: 'Status', key: 'status', render: row => `<span class='tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-bg-gray-100 tw-text-gray-700'>${row.status}</span>` },
        { label: 'Priority', key: 'priority' },
        { label: 'Assigned To', key: 'assignedToName' },
        { label: 'Last Message', key: 'lastMessage' },
        { label: 'Created', key: 'createdAt', render: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
        { label: 'Updated', key: 'updatedAt', render: row => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '' }
      ],
      renewalColumns: [
        { label: 'Employee', key: 'employee', render: row => row.userDetails ? `${row.userDetails.first_name} ${row.userDetails.last_name}` : '' },
        { label: 'Company', key: 'company_name' },
        { label: 'Status', key: 'status' },
        { label: 'Created', key: 'createdAt', render: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
        { label: 'Updated', key: 'updatedAt', render: row => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '' }
      ],
      onboardingColumns: [
        {
          label: 'Employee',
          key: 'employee',
          render: row => row.userDetails ? `<div class='tw-flex tw-items-center tw-gap-2'><img src='${row.userDetails.image_url}' alt='avatar' class='tw-w-6 tw-h-6 tw-rounded-full tw-object-cover' /><span>${row.userDetails.first_name} ${row.userDetails.last_name}</span></div>` : ''
        },
        { label: 'Company', key: 'company_name' },
        { label: 'Status', key: 'status' },
        { label: 'Email', key: 'email', render: row => row.userDetails?.email || '' },
        { label: 'Created', key: 'createdAt', render: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
        { label: 'Updated', key: 'updatedAt', render: row => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '' }
      ],
      offboardingColumns: [
        {
          label: 'Employee',
          key: 'employee',
          render: row => row.userDetails ? `<div class='tw-flex tw-items-center tw-gap-2'><img src='${row.userDetails.image_url}' alt='avatar' class='tw-w-6 tw-h-6 tw-rounded-full tw-object-cover' /><span>${row.userDetails.first_name} ${row.userDetails.last_name}</span></div>` : ''
        },
        { label: 'Company', key: 'company_name' },
        { label: 'Status', key: 'status' },
        { label: 'Email', key: 'email', render: row => row.userDetails?.email || '' },
        { label: 'Created', key: 'createdAt', render: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
        { label: 'Updated', key: 'updatedAt', render: row => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '' }
      ],
      visaColumns: [
        {
          label: 'Employee',
          key: 'employee',
          render: row => row.userDetails ? `<div class='tw-flex tw-items-center tw-gap-2'><img src='${row.userDetails.image_url}' alt='avatar' class='tw-w-6 tw-h-6 tw-rounded-full tw-object-cover' /><span>${row.userDetails.first_name} ${row.userDetails.last_name}</span></div>` : ''
        },
        { label: 'Company', key: 'company_name' },
        { label: 'Status', key: 'status' },
        { label: 'Email', key: 'email', render: row => row.userDetails?.email || '' },
        { label: 'Created', key: 'createdAt', render: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
        { label: 'Updated', key: 'updatedAt', render: row => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '' }
      ],
      sidebarOpen: true, // desktop sidebar state
      sidebarMobileOpen: false, // mobile sidebar overlay state
      userDropdownOpen: false,
      navGroups: [
        {
          title: 'Dashboard',
          items: [
            { text: 'Dashboard', route: '/ModernDashboard' }
          ]
        },
        {
          title: 'Business Development',
          items: [
            { text: 'Partners', route: '/partners' },
            { text: 'Inquiries', route: '/inquiries' },
            { text: 'Leads', route: '/leads' },
            { text: 'Clients', route: '/employer' }
          ]
        },
        {
          title: 'HR Management',
          items: [
            { text: 'Employees', route: '/employees' },
            { text: 'Onboarding', route: '/onboarding' },
            { text: 'Offboarding', route: '/offboarding' },
            { text: 'Renewal Request', route: '/renewalRequest' },
          ]
        },
        {
          title: 'Visa & Immigration',
          items: [
            { text: 'New Process', route: '/visa-process?tab=new' },
            { text: 'Renewal Process', route: '/visa-process?tab=renewal' },
            { text: 'Cancellation Process', route: '/visa-process?tab=cancellation' },
          ]
        },
        {
          title: 'Repositories',
          items: [
            { text: 'Internal Resources', route: '/documents?tab=central-repository' },
            { text: 'Client Documents', route: '/documents?tab=companies' },
            { text: 'Employee Documents', route: '/documents?tab=users' },
          ]
        },
        {
          title: 'Finance',
          items: [
            { text: 'Billing', route: '/billings' }
          ]
        },
        {
          title: 'Support Center',
          items: [
            { text: 'Support Tickets', route: '/support' },
            { text: 'PaySlips', route: '/payslips' },
          ]
        },
      ],
      groupStates: {},
      loading: true,
    };
  },
  methods: {
    // Process chart data
    processOnboardingChartData(data) {
      if (!Array.isArray(data)) return;

      // Filter out 'Total' and entries with 0 count
      const filtered = data.filter(item => item._id !== 'Total' && item.count > 0);

      this.onboardingChartData.series = filtered.map(item => item.count);
      this.onboardingChartData.labels = filtered.map(item => item._id);
      this.onboardingChartOptions.labels = filtered.map(item => item._id);
    },

    processOffboardingChartData(data) {
      if (!Array.isArray(data)) return;

      // Filter out 'Total' and entries with 0 count
      const filtered = data.filter(item => item._id !== 'Total');

      this.offboardingChartData.series = [{
        name: 'Count',
        data: filtered.map(item => item.count)
      }];
      this.offboardingChartData.categories = filtered.map(item => item._id);
      this.offboardingChartOptions.xaxis.categories = filtered.map(item => item._id);
    },

    processRenewalChartData(data) {
      if (!Array.isArray(data)) return;

      // Filter out 'Total' entries and entries with 0 count
      const filtered = data.filter(item =>
        !item._id.includes('Total') && item.count > 0
      );

      this.renewalChartData.series = filtered.map(item => item.count);
      this.renewalChartData.labels = filtered.map(item => item._id);
      this.renewalChartOptions.labels = filtered.map(item => item._id);
    },

    processVisaChartData(data) {
      if (!Array.isArray(data)) return;

      // Filter out 'Total' and calculate percentages
      const filtered = data.filter(item => item._id !== 'Total');
      const total = filtered.reduce((sum, item) => sum + item.count, 0);

      if (total > 0) {
        this.visaChartData.series = filtered.map(item =>
          Math.round((item.count / total) * 100)
        );
        this.visaChartData.labels = filtered.map(item => item._id);
        this.visaChartOptions.labels = filtered.map(item => item._id);
      }
    },

    // Existing methods
    async fetchEmployeeStats(headers) {
      try {
        // Use the dashboard stats endpoint instead
        const userStats = await this.$axios.$post('http://localhost:4100/dashboard/stats', {}, { headers });
        // Replace all stats properties with response
        if (userStats) {
          this.stats.employees = userStats.users ?? '--';
          this.stats.onboardings = userStats.onboardings ?? '--';
          this.stats.renewals = userStats.renewals ?? '--';
          this.stats.offboardings = userStats.offboardings ?? '--';
          this.stats.visaProcesses = userStats.visaProcesses ?? '--';
          this.stats.tickets = userStats.tickets ?? '--';
        } else {
          this.stats = {
            employees: '--',
            onboardings: '--',
            offboardings: '--',
            renewals: '--',
            tickets: '--',
            visaProcesses: '--',
          };
        }
      } catch (e) {
        this.stats = {
          employees: '--',
          onboardings: '--',
          offboardings: '--',
          renewals: '--',
          tickets: '--',
          visaProcesses: '--',
        };
      }
    },
    async fetchOnboardingStats(headers) {
      try {
        const onboardingStats = await this.$axios.$post('http://localhost:4100/onboardings/get_status_count', {}, { headers });
        this.stats.onboardings = onboardingStats?.reduce((sum, s) => sum + (s.count || 0), 0) ?? '--';

        // Process chart data
        this.processOnboardingChartData(onboardingStats);
      } catch (e) {
        this.stats.onboardings = '--';
      }
    },
    async fetchOffboardingStats(headers) {
      try {
        const offboardingStats = await this.$axios.$post('http://localhost:4100/offboardings/get_status_count', {}, { headers });
        this.stats.offboardings = offboardingStats?.reduce((sum, s) => sum + (s.count || 0), 0) ?? '--';

        // Process chart data
        this.processOffboardingChartData(offboardingStats);
      } catch (e) {
        this.stats.offboardings = '--';
      }
    },
    async fetchRenewalStats(headers) {
      try {
        const renewalStats = await this.$axios.$get('http://localhost:4100/renewals/get_status_count', {}, { headers });
        this.stats.renewals = renewalStats?.reduce((sum, s) => sum + (s.count || 0), 0) ?? '--';

        // Process chart data
        this.processRenewalChartData(renewalStats);
      } catch (e) {
        this.stats.renewals = '--';
      }
    },
    async fetchTicketStats(headers) {
      try {
        const ticketCounts = await this.$axios.$post('http://localhost:4100/dashboard/recent/tickets-count', {}, { headers });
        this.stats.tickets = ticketCounts?.totalCount ?? '--';
      } catch (e) {
        this.stats.tickets = '--';
      }
    },
    async fetchRecentTickets(headers) {
      try {
        const response = await this.$axios.$post('http://localhost:4100/dashboard/recent/tickets', {}, { headers });
        this.recent.tickets = Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.docs)
            ? response.docs
            : Array.isArray(response)
              ? response
              : [];
      } catch (e) {
        this.recent.tickets = [];
      }
    },
    async fetchRecentRenewals(headers) {
      try {
        const response = await this.$axios.$post('http://localhost:4100/dashboard/recent/renewals', {}, { headers });
        this.recent.renewals = Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];
      } catch (e) {
        this.recent.renewals = [];
      }
    },
    async fetchRecentOnboardings(headers) {
      try {
        const response = await this.$axios.$post('http://localhost:4100/dashboard/recent/onboardings', {}, { headers });
        this.recent.onboardings = Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.docs)
            ? response.docs
            : Array.isArray(response)
              ? response
              : [];
      } catch (e) {
        this.recent.onboardings = [];
      }
    },
    async fetchRecentOffboardings(headers) {
      try {
        const response = await this.$axios.$post('http://localhost:4100/dashboard/recent/offboardings', {}, { headers });
        this.recent.offboardings = Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.docs)
            ? response.docs
            : Array.isArray(response)
              ? response
              : [];
      } catch (e) {
        this.recent.offboardings = [];
      }
    },
    async fetchRecentVisaProcesses(headers) {
      try {
        const response = await this.$axios.$post('http://localhost:4100/dashboard/recent/visa-processes', {}, { headers });
        this.stats.visaProcesses = Array.isArray(response?.results) ? response.results.length : (response?.length ?? '--');
        this.recent.visaProcesses = Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response?.docs)
            ? response.docs
            : Array.isArray(response)
              ? response
              : [];
      } catch (e) {
        this.stats.visaProcesses = '--';
        this.recent.visaProcesses = [];
      }
    },
    async fetchDashboardStats(){
      try{
        const response = await this.$axios.$post(`http://localhost:4100/dashboard/stats`);
        this.stats.employees = response.users ?? '--';
        this.stats.onboardings = response.onboardings ?? '--';
        this.stats.renewals = response.renewals ?? '--';
        this.stats.offboardings = response.offboardings ?? '--';
        this.stats.visaProcesses = response.visaProcesses ?? '--';
        this.stats.tickets = response.tickets ?? '--';
      }catch(error){
        console.error('Error fetching dashboard stats:', error);
      }
    },
    async fetchVisaProcessStats(headers) {
      try {
        const visaStats = await this.$axios.$post('http://localhost:4100/visaprocess/distribution', { headers });

        // Process chart data
        this.processVisaChartData(visaStats);
      } catch (e) {
        console.error('Error fetching visa process stats:', e);
      }
    },
    async fetchAllDashboardData() {
      const token = this.$store?.state?.token;
      const AuthStr = token ? 'Bearer ' + token : '';
      const headers = AuthStr ? { Authorization: AuthStr } : {};
      this.loading = true;
      await Promise.all([
        this.fetchEmployeeStats(headers),
        this.fetchOnboardingStats(headers),
        this.fetchOffboardingStats(headers),
        this.fetchRenewalStats(headers),
        this.fetchTicketStats(headers),
        this.fetchVisaProcessStats(headers),
        this.fetchRecentTickets(headers),
        this.fetchRecentRenewals(headers),
        this.fetchRecentOnboardings(headers),
        this.fetchRecentOffboardings(headers),
        this.fetchRecentVisaProcesses(headers),
        this.fetchDashboardStats(headers),
      ]);
      this.loading = false;
    },
    async handleLogout() {
      await this.$store.dispatch('logout');
      await this.$auth.logout();
      this.$router.push('/');
      this.confirmLogoutDialog = false;
    },
    goToSetting() {
      this.$router.push('/settings');
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    openSidebarMobile() {
      this.sidebarMobileOpen = true;
    },
    closeSidebarMobile() {
      this.sidebarMobileOpen = false;
    },
    handleClickOutsideDropdown(event) {
      if (!this.$el.contains(event.target)) {
        this.userDropdownOpen = false;
      }
    },
    toggleGroupCollapse(groupTitle) {
      this.$set(this.groupStates, groupTitle, !this.groupStates[groupTitle]);
    },
    isGroupExpanded(groupTitle) {
      return this.groupStates[groupTitle] !== false;
    },
    getGroupColor(title) {
      return groupColorMap[title] || '#A3A3A3';
    },
    getGroupIcon(title) {
      return groupIconMap[title] || Home;
    },
    getItemIcon(text) {
      // For Ejari, match prefix
      if (text.startsWith('Ejari-')) return Layers;
      return itemIconMap[text] || FileText;
    },
  },
  mounted() {
    if (process.client) {
      const self = this;
      document.addEventListener('click', function (e) {
        if (self.userDropdownOpen && !self.$el.querySelector('.tw-relative').contains(e.target)) {
          self.userDropdownOpen = false;
        }
      });
      (async () => {
        const VueApexCharts = (await import('vue-apexcharts')).default
        this.$options.components.apexchart = VueApexCharts
      })();
    }
    // Expand first 3 groups by default
    this.groupStates = {};
    this.navGroups.forEach((g, i) => {
      this.$set(this.groupStates, g.title, i < 3);
    });
    this.fetchAllDashboardData();
  }
};
</script>

<style scoped>
/***** Sidebar overlay for mobile *****/
@media (max-width: 768px) {
  aside.tw-fixed {
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 50;
  }
}

/* Skeleton shimmer effect */
.shimmer {
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  100% {
    left: 100%;
  }
}
</style>
