<template>
  <div class="tw-h-screen tw-bg-dashboard_bg">
    <dashboardSkeleton v-if="showSkeleton" />
    <template v-else>
      <!-- Mobile sidebar overlay -->
      <div
        v-if="mobileSidebarOpen"
        class="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-40 lg:tw-hidden"
        @click="closeMobileSidebar"
      ></div>

      <div class="tw-flex tw-h-full">
        <!-- Sidebar -->
        <aside
          :class="[
            'tw-bg-gradient-to-b tw-from-gray-50 tw-to-white dark:tw-bg-gradient-to-b dark:tw-from-gray-900 dark:tw-to-gray-800 tw-bg-opacity-95 tw-h-full tw-flex-shrink-0 tw-transition-all tw-duration-300 tw-z-50 tw-shadow-lg',
            'lg:tw-relative',
            mini && !mobileSidebarOpen ? 'tw-w-20' : 'tw-w-80',
            'tw-border-r tw-border-gray-200 dark:tw-border-gray-700',
            mobileSidebarOpen ? 'tw-fixed tw-top-0 tw-left-0 tw-h-full tw-shadow-xl' : '',
            mobileSidebarOpen ? 'tw-block' : 'tw-hidden lg:tw-block'
          ]"
        >
          <!-- Logo Section -->
          <div
            class="tw-flex tw-items-center tw-justify-between tw-h-16 tw-px-4 tw-border-b tw-border-gray-200 dark:tw-border-gray-700 tw-bg-nathan-blue/5"
          >
            <NuxtLink to="/dashboard-v2" class="tw-flex tw-items-center">
              <img src="/eor_central_logo.svg" class="tw-object-cover tw-h-8" v-if="!mini || mobileSidebarOpen" alt="Logo" />
              <div v-else class="tw-w-8 tw-h-8 tw-bg-nathan-blue tw-rounded-full tw-flex tw-items-center tw-justify-center">
                <span class="tw-text-white tw-font-bold tw-text-sm">P</span>
              </div>
            </NuxtLink>

            <button
              v-if="mobileSidebarOpen"
              @click="closeMobileSidebar"
              class="tw-p-2 tw-rounded-full tw-text-gray-400 hover:tw-text-gray-600 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition-colors"
            >
              <svg class="tw-w-6 tw-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Navigation -->
          <nav class="tw-flex-1 tw-overflow-y-auto tw-pt-4 tw-px-2">
            <div v-for="(group, groupIndex) in navGroups" :key="groupIndex" class="tw-mb-3">
              <div
                v-if="!mini || mobileSidebarOpen"
                class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-cursor-pointer tw-text-xs tw-font-extrabold tw-uppercase tw-tracking-wider tw-text-gray-400 dark:tw-text-gray-400 tw-mt-6"
                :title="group.title"
                @click="toggleGroupCollapse(group.title)"
              >
                <div class="tw-flex tw-items-center tw-gap-2 tw-truncate tw-max-w-xs">
                  <span>{{ group.title }}</span>
                </div>
                <svg
                  v-if="group.items.length > 0"
                  :class="[
                    'tw-w-5 tw-h-5 tw-transition-transform tw-duration-200',
                    groupStates[group.title] ? 'tw-rotate-180' : ''
                  ]"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <transition name="fade">
                <div v-show="isGroupExpanded(group.title)" class="tw-ml-2 tw-mt-2">
                  <div v-for="(item, itemIndex) in group.items" :key="`${groupIndex}-${itemIndex}`" class="tw-mb-1">
                    <NuxtLink
                      v-if="item.route"
                      :to="item.route"
                      class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-mx-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-ease-in-out tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-nathan-blue/10 hover:tw-scale-105 tw-group"
                      :class="{
                        'tw-bg-nathan-blue/10 tw-text-nathan-blue tw-font-bold tw-border-l-8 tw-border-nathan-blue tw-shadow-lg': isRouteActive(item.route)
                      }"
                      @click.native="closeMobileSidebar"
                    >
                      <div class="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center">
                        <div
                          class="tw-w-2.5 tw-h-2.5 tw-bg-gray-400 tw-rounded-full group-hover:tw-bg-nathan-blue tw-transition-colors"
                          :class="{ 'tw-bg-nathan-blue': isRouteActive(item.route) }"
                        ></div>
                      </div>
                      <span v-if="!mini || mobileSidebarOpen" class="tw-text-sm tw-font-medium tw-truncate">{{ item.text }}</span>
                    </NuxtLink>
                    <div
                      v-else
                      class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-mx-2 tw-rounded-lg tw-text-gray-400 tw-cursor-not-allowed"
                    >
                      <div class="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center">
                        <div class="tw-w-2.5 tw-h-2.5 tw-bg-gray-300 tw-rounded-full"></div>
                      </div>
                      <span v-if="!mini || mobileSidebarOpen" class="tw-text-sm tw-font-medium tw-truncate">{{ item.text }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </nav>

          <!-- Sidebar Footer -->
          <div
            class="tw-hidden lg:tw-flex tw-items-center tw-justify-between tw-h-16 tw-px-4 tw-border-t tw-border-gray-200 dark:tw-border-gray-700 tw-bg-nathan-blue/5"
          >
            <button
              @click="toggleMiniSidebar"
              class="tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10 tw-rounded-full tw-text-gray-500 hover:tw-text-nathan-blue hover:tw-bg-nathan-blue/10 tw-transition-all tw-duration-200 hover:tw-scale-110"
              :title="mini ? 'Expand sidebar' : 'Collapse sidebar'"
            >
              <svg v-if="mini" class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <svg v-else class="tw-w-5 tw-h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="tw-flex-1 tw-flex tw-flex-col tw-h-full tw-min-w-0">
          <!-- Top Bar -->
          <header
            class="tw-flex tw-items-center tw-h-16 tw-px-4 md:tw-px-6 tw-bg-white dark:tw-bg-dashboard_bg tw-border-b tw-border-gray-200 tw-shadow-sm dark:tw-border-gray-700 tw-z-30"
          >
            <div class="tw-flex tw-items-center tw-gap-4">
              <button
                class="tw-lg:hidden tw-p-2 tw-rounded-md tw-text-gray-500 hover:tw-text-gray-700 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700"
                @click="openMobileSidebar"
              >
                <svg class="tw-w-6 tw-h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span class="tw-text-lg tw-font-bold tw-text-gray-800 dark:tw-text-gray-100">HR Dashboard</span>
            </div>

            <div class="tw-ml-auto tw-flex tw-items-center tw-gap-4">
              <div class="tw-relative" v-click-outside="closeUserMenu">
                <button
                  @click="toggleUserMenu"
                  class="tw-flex tw-items-center tw-gap-2 tw-p-1 tw-rounded-full tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition-colors"
                >
                  <div
                    class="tw-w-8 tw-h-8 tw-bg-gradient-to-r tw-from-blue-500 tw-to-purple-600 tw-rounded-full tw-flex tw-items-center tw-justify-center"
                  >
                    <span class="tw-text-white tw-font-medium tw-text-sm">JD</span>
                  </div>
                  <svg
                    :class="['tw-w-4 tw-h-4 tw-transition-transform tw-duration-200', userMenuOpen ? 'tw-rotate-180' : '']"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <transition name="dropdown">
                  <div
                    v-if="userMenuOpen"
                    class="tw-absolute tw-right-0 tw-mt-2 tw-w-48 tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700 tw-py-1 tw-z-50"
                  >
                    <div class="tw-px-4 tw-py-2 tw-border-b tw-border-gray-200 dark:tw-border-gray-700">
                      <p class="tw-text-sm tw-font-medium tw-text-gray-900 dark:tw-text-gray-100">John Doe</p>
                      <p class="tw-text-xs tw-text-gray-500 dark:tw-text-gray-400">john@example.com</p>
                    </div>
                    <button
                      @click="openConfigurator"
                      class="tw-w-full tw-text-left tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-flex tw-items-center tw-gap-2"
                    >
                      <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configurator
                    </button>
                    <button
                      @click="handleLogout"
                      class="tw-w-full tw-text-left tw-px-4 tw-py-2 tw-text-sm tw-text-red-600 dark:tw-text-red-400 hover:tw-bg-red-50 dark:hover:tw-bg-red-900/20 tw-flex tw-items-center tw-gap-2"
                    >
                      <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </header>
          <HeaderTabs
            v-if="filteredTabs.length > 0"
            :data="filteredTabs"
            :value="tab_current_val"
            @tabValue="handleTabValue"
          />

          <!-- Dashboard Content -->
          <main class="tw-flex-1 tw-overflow-y-auto tw-p-4 md:tw-p-6 tw-bg-gray-50 dark:tw-bg-dashboard_bg">
            <!-- Stats Cards -->
            <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-5 tw-gap-4 tw-mb-6">
              <div
                v-for="(card, idx) in statsCards"
                :key="idx"
                class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-4 tw-shadow-md tw-border tw-border-gray-400 dark:tw-border-gray-700 tw-shadow-nathan-blue/60 tw-transition-all tw-duration-300 tw-ease-in-out tw-cursor-pointer hover:tw-shadow-2xl hover:tw--translate-y-1 hover:tw-shadow-nathan-blue/40"
              >
                <div class="tw-text-gray-500 tw-text-sm tw-mb-1">
                  {{ card.label }}
                </div>
                <div class="tw-text-2xl tw-font-bold tw-text-gray-900 dark:tw-text-white">
                  {{ card.value }}
                </div>
                <div v-if="card.sub" class="tw-text-xs tw-text-gray-400">
                  {{ card.sub }}
                </div>
                <div v-if="card.change" class="tw-flex tw-items-center tw-mt-2">
                  <span :class="card.changeColor + ' tw-text-sm tw-font-medium'">{{ card.change }}</span>
                </div>
              </div>
            </div>

            <!-- Charts Row -->
            <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6 tw-mb-6">
              <!-- Onboarding Distribution Chart -->
              <div class="lg:tw-col-span-2 tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
                <h3 class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-mb-4">Onboarding Distribution</h3>
                <apexchart
                  type="bar"
                  height="300"
                  :options="onboardingDistributionChartOptions"
                  :series="onboardingDistributionChartSeries"
                ></apexchart>
              </div>

              <!-- Visa Distribution Donut Chart -->
              <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
                <h3 class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-mb-4">Visa Distribution</h3>
                <apexchart
                  type="donut"
                  height="300"
                  :options="candidateSourceChartOptions"
                  :series="candidateSourceChartSeries"
                ></apexchart>
              </div>
            </div>

            <!-- Offboarding Distribution Chart -->
            <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm tw-mb-6">
              <h3 class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-mb-4">Offboarding Distribution</h3>
              <apexchart
                type="bar"
                height="350"
                :options="offboardingDistributionChartOptions"
                :series="offboardingDistributionChartSeries"
              ></apexchart>
            </div>

            <!-- Tables Row -->
            <div class="tw-grid tw-grid-cols-1 xl:tw-grid-cols-2 tw-gap-6 tw-mb-6">
              <!-- Recruiters Rating Table -->
              <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
                <h3 class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-mb-4">Mobile Users</h3>
                <div class="tw-overflow-y-auto" style="max-height: 340px">
                  <table class="tw-w-full tw-text-sm">
                    <thead>
                      <tr class="tw-border-b tw-border-gray-200 dark:tw-border-gray-700">
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">User</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Company</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">First Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(user, idx) in mobile_users"
                        :key="user._id"
                        class="tw-border-b tw-border-gray-100 dark:tw-border-gray-700"
                        :style="{ borderLeft: `6px solid ${accentColors[idx % accentColors.length]}` }"
                      >
                        <td class="tw-py-4">
                          <div class="tw-flex tw-items-center tw-gap-3">
                            <img
                              v-if="user.image_url"
                              :src="user.image_url"
                              class="tw-w-8 tw-h-8 tw-rounded-full tw-object-cover tw-flex-shrink-0"
                              :style="{ border: `2.5px solid ${accentColors[idx % accentColors.length]}` }"
                              alt="User"
                            />
                            <div
                              v-else
                              class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-flex-shrink-0"
                              :style="{ border: `2.5px solid ${accentColors[idx % accentColors.length]}` }"
                            ></div>
                            <span class="tw-font-medium tw-text-gray-900 dark:tw-text-white">{{ user.fullName }}</span>
                          </div>
                        </td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">{{ user.companyName }}</td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">
                          {{ new Date(user.firstMobileLoginDate).toLocaleDateString() }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Recent Onboardings-->
              <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
                <h3 class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-mb-4">
                  Recent Onboardings
                </h3>
                <div class="tw-overflow-x-auto tw-overflow-y-auto" style="max-height: 340px;">
                  <table class="tw-w-full tw-text-sm">
                    <thead>
                      <tr class="tw-border-b tw-border-gray-200 dark:tw-border-gray-700">
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">User</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Company</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Status</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(onboarding, idx) in recent.onboardings"
                        :key="onboarding._id"
                        class="tw-border-b tw-border-gray-100 dark:tw-border-gray-700"
                        :style="{ borderLeft: `6px solid ${accentColors[idx % accentColors.length]}` }"
                      >
                        <td class="tw-py-4">
                          <div class="tw-flex tw-items-center tw-gap-3">
                            <img
                              v-if="onboarding.userDetails && onboarding.userDetails.image_url"
                              :src="onboarding.userDetails.image_url"
                              class="tw-w-8 tw-h-8 tw-rounded-full tw-object-cover tw-flex-shrink-0"
                              :style="{ border: `2.5px solid ${accentColors[idx % accentColors.length]}` }"
                              alt="User"
                            />
                            <div
                              v-else
                              class="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-flex-shrink-0"
                              :style="{ border: `2.5px solid ${accentColors[idx % accentColors.length]}` }"
                            ></div>
                            <span class="tw-font-medium tw-text-gray-900 dark:tw-text-white">
                              {{ onboarding.userDetails ? onboarding.userDetails.first_name + ' ' + onboarding.userDetails.last_name : 'N/A' }}
                            </span>
                          </div>
                        </td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">{{ onboarding.company_name }}</td>
                        <td class="tw-py-4">
                          <span
                            :class="[
                              'tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold',
                              onboarding.status === 'completed'
                                ? 'tw-bg-green-100 tw-text-green-700'
                                : onboarding.status === 'unsuccessful'
                                ? 'tw-bg-red-100 tw-text-red-700'
                                : 'tw-bg-gray-100 tw-text-gray-700'
                            ]"
                          >
                            {{ onboarding.status.charAt(0).toUpperCase() + onboarding.status.slice(1) }}
                          </span>
                        </td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">
                          {{ new Date(onboarding.createdAt).toLocaleDateString() }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Bottom Row -->
            <div class="tw-grid tw-grid-cols-1 xl:tw-grid-cols-2 tw-gap-6">
              <!-- Leads Distribution -->
              <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm">
                <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
                  <h3 class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white">Leads Distribution</h3>
                  <span class="tw-text-sm tw-text-gray-500">{{ leadsDistribution.length }} Stages</span>
                </div>
                <div class="tw-space-y-3">
                  <div v-for="(stage, idx) in leadsDistribution" :key="stage.status" class="tw-flex tw-items-center tw-justify-between">
                    <div class="tw-flex tw-items-center tw-gap-4 tw-flex-1">
                      <div class="tw-w-40 tw-text-sm tw-text-gray-700 dark:tw-text-gray-300">
                        {{ stage.status }}
                      </div>
                      <div class="tw-flex-1 tw-bg-gray-200 tw-rounded-full tw-h-2">
                        <div :class="`tw-h-2 tw-rounded-full`" :style="{ width: stage.percentage + '%', background: accentColors[idx % accentColors.length] }"></div>
                      </div>
                    </div>
                    <div class="tw-flex tw-gap-8 tw-text-sm tw-items-center">
                      <span class="tw-text-gray-900 dark:tw-text-white tw-font-medium">{{ stage.count }}</span>
                      <span class="tw-text-gray-500 tw-w-8">{{ stage.percentage }}%</span>
                      <span v-if="stage.totalOrderValue && stage.totalOrderValue > 0" class="tw-text-gray-500">AED {{ stage.totalOrderValue.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Tickets Table -->
              <div class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-p-6 tw-shadow-sm tw-mt-6">
                <h3 class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-mb-4">
                  Recent Tickets
                </h3>
                <div class="tw-overflow-x-auto tw-overflow-y-auto" style="max-height: 340px;">
                  <table class="tw-w-full tw-text-sm">
                    <thead>
                      <tr class="tw-border-b tw-border-gray-200 dark:tw-border-gray-700">
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Incident #</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Company</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Type</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Status</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Assigned To</th>
                        <th class="tw-text-left tw-py-3 tw-text-gray-500 tw-font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(ticket, idx) in recent.tickets"
                        :key="ticket._id"
                        class="tw-border-b tw-border-gray-100 dark:tw-border-gray-700"
                        :style="{
                          borderLeft: `6px solid ${accentColors[idx % accentColors.length]}`,
                          background: (!ticket.assignedToName || ticket.assignedToName === '' || ticket.assignedToId === null)
                            ? 'rgba(225, 65, 126, 0.12)' : ''
                        }"
                      >
                        <td class="tw-py-4 tw-font-medium tw-text-gray-900 dark:tw-text-white">{{ ticket.incident_number }}</td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">{{ ticket.company_name }}</td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">{{ ticket.type }}</td>
                        <td class="tw-py-4">
                          <span
                            :class="[
                              'tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold',
                              ticket.status === 'Completed'
                                ? 'tw-bg-green-100 tw-text-green-700'
                                : ticket.status === 'Ongoing'
                                ? 'tw-bg-yellow-100 tw-text-yellow-700'
                                : 'tw-bg-blue-100 tw-text-blue-700'
                            ]"
                          >
                            {{ ticket.status }}
                          </span>
                        </td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">
                          {{ (!ticket.assignedToName || ticket.assignedToName === '' || ticket.assignedToId === null) ? 'Unassigned' : ticket.assignedToName }}
                        </td>
                        <td class="tw-py-4 tw-text-gray-700 dark:tw-text-gray-300">
                          {{ new Date(ticket.createdAt).toLocaleDateString() }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import dashboardSkeleton from '@/components/Common/dashboardSkeleton.vue'
import HeaderTabs from '@/components/Layout/HeaderTabs/index.vue'
export default {
  name: 'dashboardv2',
  components: {
    dashboardSkeleton,
    HeaderTabs
  },
  data() {
    return {
      showSkeleton: false,
      mini: false,
      mobileSidebarOpen: false,
      userMenuOpen: false,
      groupStates: {
        'Dashboard': true,
        'Business Development': true,
        'HR Management': true,
        'Visa & Immigration': true
      },
      navGroups: [
        // {
        //   title: 'Dashboard',
        //   items: [{ text: 'Dashboard', route: '/dashboard-v2' }]
        // },
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
            { text: 'Renewal Request', route: '/renewalRequest' }
          ]
        },
        {
          title: 'Visa & Immigration',
          items: [
            { text: 'New Process', route: '/visa-process?tab=new' },
            { text: 'Renewal Process', route: '/visa-process?tab=renewal' },
            {
              text: 'Cancellation Process',
              route: '/visa-process?tab=cancellation'
            }
          ]
        },
        {
          title: 'Repositories',
          items: [
            {
              text: 'Internal Resources',
              route: '/documents?tab=central-repository'
            },
            { text: 'Client Documents', route: '/documents?tab=companies' },
            { text: 'Employee Documents', route: '/documents?tab=users' }
          ]
        },
        {
          title: 'Finance',
          items: [{ text: 'Billing', route: '/billings' }, 
          // { text: 'Payroll', route: '/payroll' }
        ]
        },
        {
          title: 'Support Center',
          items: [
            { text: 'Support Tickets', route: '/support' },
            { text: 'PaySlips', route: '/payslips' }
          ]
        },
        {
          title: 'Admin Central',
          items: [
            { text: 'Internal Access', route: null },
            { text: 'Client Access', route: null },
            { text: 'Employee Access', route: null },
            { text: 'Client Announcement', route: null },
            { text: 'Employee Announcement', route: null }
          ]
        },
        {
          title: 'Projects',
          items: [{ text: `Ejari- ${new Date().getFullYear()}`, route: '/projects' }]
        }
      ],
      recruiters: [
        {
          name: 'John Smith',
          vacancies: 8,
          responses: 283,
          responseChange: '+36',
          hired: '8 из 10',
          percentage: 80
        },
        {
          name: 'Helga Miller',
          vacancies: 3,
          responses: 280,
          responseChange: '+42',
          hired: '2 из 4',
          percentage: 50
        },
        {
          name: 'Elena Harris',
          vacancies: 6,
          responses: 85,
          responseChange: '+15',
          hired: '3 из 9',
          percentage: 33
        },
        {
          name: 'Jacob Bold',
          vacancies: 12,
          responses: 154,
          responseChange: '+3',
          hired: '8 из 36',
          percentage: 22
        },
        {
          name: 'Anna Walker',
          vacancies: 7,
          responses: 450,
          responseChange: '+19',
          hired: '4 из 20',
          percentage: 20
        },
        {
          name: 'Michael Brown',
          vacancies: 8,
          responses: 33,
          responseChange: '+2',
          hired: '0 из 8',
          percentage: 0
        }
      ],
      closingTimes: [
        { name: 'John Smith', days: 45 },
        { name: 'Helga Miller', days: 60 },
        { name: 'Elena Harris', days: 30 },
        { name: 'Jacob Bold', days: 75 },
        { name: 'Anna Walker', days: 50 },
        { name: 'Michael Brown', days: 90 }
      ],
      candidateFunnel: [
        {
          status: 'Application',
          candidates: 2436,
          percentage: 100,
          averageTime: '2 days'
        },
        {
          status: 'Screening',
          candidates: 1800,
          percentage: 74,
          averageTime: '5 days'
        },
        {
          status: 'Interview',
          candidates: 900,
          percentage: 37,
          averageTime: '7 days'
        },
        {
          status: 'Offer',
          candidates: 300,
          percentage: 12,
          averageTime: '3 days'
        },
        {
          status: 'Hired',
          candidates: 150,
          percentage: 6,
          averageTime: '1 day'
        }
      ],
      vacancyClosingData: [
        {
          position: 'Software Engineer',
          statusColor: 'tw-bg-green-500',
          daysBeforeDeadline: 10,
          activeDays: 30,
          openPositions: 2
        },
        {
          position: 'Product Manager',
          statusColor: 'tw-bg-yellow-500',
          daysBeforeDeadline: 5,
          activeDays: 45,
          openPositions: 1
        },
        {
          position: 'Data Analyst',
          statusColor: 'tw-bg-red-500',
          daysBeforeDeadline: -3,
          activeDays: 60,
          openPositions: 3
        },
        {
          position: 'UX Designer',
          statusColor: 'tw-bg-green-500',
          daysBeforeDeadline: 15,
          activeDays: 25,
          openPositions: 1
        },
        {
          position: 'DevOps Engineer',
          statusColor: 'tw-bg-yellow-500',
          daysBeforeDeadline: 2,
          activeDays: 50,
          openPositions: 2
        }
      ],
      candidateStatsChartOptions: {
        chart: { type: 'bar', height: 300 },
        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
        colors: ['#3B82F6'],
        dataLabels: { enabled: false },
        plotOptions: { bar: { horizontal: false } }
      },
      candidateStatsChartSeries: [{ name: 'Candidates', data: [400, 300, 500, 700, 600, 800] }],
      candidateSourceChartOptions: {
        chart: { type: 'donut', height: 300 },
        labels: ['Job Boards', 'Referrals', 'Social Media', 'Direct'],
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        legend: { position: 'bottom' }
      },
      candidateSourceChartSeries: [1200, 800, 300, 136],
      mobile_users: [],
      stats: {
        employees: '--',
        onboardings: '--',
        offboardings: '--',
        renewals: '--',
        tickets: '--',
        visaProcesses: '--',
        mobileUsersCount: '--'
      },
      recent: {
        tickets: [],
        renewals: [],
        onboardings: [],
        offboardings: [],
        visaProcesses: []
      },
      accentColors: [
        '#673ab8', // pinkish
        '#1798ff', // bright blue
        '#0A2C4F', // nathan blue
        '#e1417e', // faded red
        '#4eac66', // green
        '#fba50d' // yellow
      ],
      leadsDistribution: [],
      onboardingDistributionData: [],
      onboardingDistributionCategories: [],
      onboardingDistributionChartOptions: {
        chart: { type: 'bar', height: 300 },
        xaxis: { categories: [] },
        colors: ['#673ab8', '#1798ff', '#0A2C4F', '#e1417e', '#4eac66', '#fba50d'],
        dataLabels: { enabled: false },
        plotOptions: { bar: { horizontal: false } }
      },
      onboardingDistributionChartSeries: [{ name: 'Onboardings', data: [] }],
      offboardingDistributionCategories: [],
      offboardingDistributionData: [],
      offboardingDistributionChartOptions: {
        chart: { type: 'bar', height: 300 },
        xaxis: { categories: [] },
        colors: ['#673ab8', '#1798ff', '#0A2C4F', '#e1417e', '#4eac66', '#fba50d'],
        dataLabels: { enabled: true },
        plotOptions: {
          bar: {
            horizontal: true,
            borderRadius: 6,
            barHeight: '60%',
          }
        },
        legend: { show: false },
        grid: { show: false },
        tooltip: { enabled: true },
        responsive: [
          {
            breakpoint: 768,
            options: {
              chart: { height: 400 },
              plotOptions: { bar: { barHeight: '40%' } }
            }
          }
        ]
      },
      offboardingDistributionChartSeries: [{ name: 'Offboardings', data: [] }],
      tab_current_val: 'all',
      tabs_data: {
        accounts: [
          { title: 'Chart of Accounts', value: 'all' },
          { title: 'Cost Center', value: 'cost' },
        ],
        Leads: [
          { title: 'Tasks', value: 'all' },
          { title: 'Leads', value: 'leads' },
          { title: 'Pipeline', value: 'pipeline' },
          { title: 'Unsuccessful', value: 'unsuccessful' },
        ],
        Customer: [],
        Employees: [
          { title: 'Employees', value: 'all' },
        ],
        Onboarding: [
          { title: 'Currently Onboarding', value: 'all' },
          { title: 'Pipeline', value: 'onboardingPipeline' },
        ],
        VisaProcess: [
          { title: 'New Process', value: 'new visa process' },
          { title: 'Renewal Process', value: 'visa renewal' },
          { title: 'Cancellation Process', value: 'visa cancellation' },
        ],
        Documents: [
          { title: 'Internal Resources', value: 'central-repository' },
          { title: 'Client Documents', value: 'companies' },
          { title: 'Employee Documents', value: 'users' },
        ],
        Offboarding: [
          { title: 'Currently Offboarding', value: 'all' },
          { title: 'Pipeline', value: 'offBoardingPipeline' },
        ],
        Billings: [
          { title: 'All Invoices', value: 'all' },
          { title: 'Credit Notes', value: 'creditNotes' },
          { title: 'Payment Schedule', value: 'paymentSchedule' },
          { title: 'Additions & Reductions', value: 'additionsReductions' },
        ],
        //  Billings: [
        //   { title: 'All Invoices', value: 'all' },
        //   { title: 'Payment Schedule', value: 'paymentSchedule' },
        //   { title: 'Additions & Reductions', value: 'additionsReductions' },
        // ], 
        // Payroll: [
        //   { title: 'WPS Payout', value: 'wps-payout' },
        //   { title: 'Commissions', value: 'commissions' },
        //   { title: 'Service Fee Refunds', value: 'serviceFeeRefunds' },
        // ],
        Email: [
          { title: 'Inbox', value: 'Inbox' },
          { title: 'Sent', value: 'Sent Items' },
        ],
      },
    }
  },
  async mounted() {
    this.getMobileUsersCount();
    this.fetchRecentOnboardings();
    this.fetchRecentTickets();
    this.fetchLeadsStats();
    this.onboardingDistribution();
    this.visaDistribution();
    this.offboardingDistribution();
    this.fetchDashboardStats();
    this.handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
      import('vue-apexcharts').then(module => {
        this.$options.components = this.$options.components || {};
        this.$options.components.apexchart = module.default;
      });
    }
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
  },
  computed: {
    statsCards() {
      return [
        {
          label: 'Employees',
          value: this.stats.employees,
          sub: 'Total employees'
        },
        {
          label: 'Onboardings',
          value: this.stats.onboardings,
          sub: 'Active onboardings'
        },
        {
          label: 'Renewals',
          value: this.stats.renewals,
          sub: 'Renewal requests'
        },
        {
          label: 'Offboardings',
          value: this.stats.offboardings,
          sub: 'Active offboardings'
        },
        {
          label: 'Visa Processes',
          value: this.stats.visaProcesses,
          sub: 'Visa processes in progress'
        },
        {
          label: 'Tickets',
          value: this.stats.tickets,
          sub: 'Support tickets'
        },
        {
          label: 'Mobile Users',
          value: this.stats.mobileUsersCount,
          sub: 'Users on mobile app'
        }
      ]
    },
    filteredTabs() {
      const routeName = this.$route.name;
      if (routeName === 'Leads') return this.tabs_data.Leads;
      if (routeName === 'Employees') return this.tabs_data.Employees;
      if (routeName === 'Onboarding') return this.tabs_data.Onboarding;
      if (routeName === 'Offboarding') return this.tabs_data.Offboarding;
      if (routeName === 'visa-process') return this.tabs_data.VisaProcess;
      if (routeName === 'Documents' && !this.$route.query.tab) return this.tabs_data.Documents;
      if (routeName === 'Billings') return this.tabs_data.Billings;
      // if (routeName === 'Payroll') return this.tabs_data.Payroll;
      if (routeName === 'Email') return this.tabs_data.Email;
      return [];
    },
  },
  methods: {
    async fetchLeadsStats() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$get(`http://localhost:4100/leads/get_status_count`, {
          headers: { Authorization: AuthStr }
        });
        if (Array.isArray(response)) {
          const totalObj = response.find(x => x._id === 'Total');
          const total = totalObj ? totalObj.count : 1;
          this.leadsDistribution = response
            .filter(x => x._id !== 'Total')
            .map(x => ({
              status: x._id,
              count: x.count,
              percentage: total ? Math.round((x.count / total) * 100) : 0,
              totalOrderValue: x.total_order_value
            }));
        }
      } catch (error) {
        console.error('Error fetching leads stats:', error);
        this.leadsDistribution = [];
      }
    },
    async fetchRecentOnboardings() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post(
          'http://localhost:4100/dashboard/recent/onboardings',
          {},
          { headers: { Authorization: AuthStr } }
        );
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
    async fetchRecentTickets() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post('http://localhost:4100/dashboard/recent/tickets', {}, { headers: { Authorization: AuthStr } });
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
    async getMobileUsersCount() {
      const token = this.$store.state.token;
      const AuthStr = 'Bearer '.concat(token);
      let count = await this.$axios.$get('/users/mobile/login/stats', {
        headers: { Authorization: AuthStr }
      });
      console.log('This is the count of items', count);
      this.stats.mobileUsersCount = count.count;
      this.mobile_users = count.users;
    },
    async fetchDashboardStats() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post(
          `http://localhost:4100/dashboard/stats`,
          {},
          { headers: { Authorization: AuthStr } }
        );
        this.stats.employees = response.users ?? '--';
        this.stats.onboardings = response.onboardings ?? '--';
        this.stats.renewals = response.renewals ?? '--';
        this.stats.offboardings = response.offboardings ?? '--';
        this.stats.visaProcesses = response.visaProcesses ?? '--';
        this.stats.tickets = response.tickets ?? '--';
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    },
    async onboardingDistribution() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post('http://localhost:4100/onboardings/get_status_count', {}, { headers: { Authorization: AuthStr } });
        if (Array.isArray(response)) {
          const filtered = response.filter(x => x._id !== 'Total');
          this.onboardingDistributionCategories = filtered.map(x => x._id);
          this.onboardingDistributionData = filtered.map(x => x.count);
          this.onboardingDistributionChartOptions = {
            ...this.onboardingDistributionChartOptions,
            xaxis: { categories: this.onboardingDistributionCategories }
          };
          this.onboardingDistributionChartSeries = [{ name: 'Onboardings', data: this.onboardingDistributionData }];
        }
      } catch (error) {
        console.error('Error fetching onboarding distribution:', error);
        this.onboardingDistributionCategories = [];
        this.onboardingDistributionData = [];
        this.onboardingDistributionChartSeries = [{ name: 'Onboardings', data: [] }];
      }
    },
    async visaDistribution() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post('http://localhost:4100/visaprocess/distribution', {}, { headers: { Authorization: AuthStr } });
        if (Array.isArray(response)) {
          const filtered = response.filter(x => x._id !== 'Total');
          const labels = filtered.map(x => x._id);
          const data = filtered.map(x => x.count);
          const colors = labels.map((_, idx) => this.accentColors[idx % this.accentColors.length]);
          this.candidateSourceChartOptions = {
            ...this.candidateSourceChartOptions,
            labels,
            colors,
            legend: { position: 'bottom' }
          };
          this.candidateSourceChartSeries = data;
        }
      } catch (error) {
        console.error('Error fetching visa distribution:', error);
        this.candidateSourceChartOptions = {
          ...this.candidateSourceChartOptions,
          labels: [],
          colors: this.accentColors,
          legend: { position: 'bottom' }
        };
        this.candidateSourceChartSeries = [];
      }
    },
    async offboardingDistribution() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$post('http://localhost:4100/offboardings/get_status_count', {}, { headers: { Authorization: AuthStr } });
        if (Array.isArray(response)) {
          const filtered = response.filter(x => x._id !== 'Total');
          this.offboardingDistributionCategories = filtered.map(x => x._id);
          this.offboardingDistributionData = filtered.map(x => x.count);
          const colors = filtered.map((_, idx) => this.accentColors[idx % this.accentColors.length]);
          this.offboardingDistributionChartOptions = {
            ...this.offboardingDistributionChartOptions,
            xaxis: { categories: this.offboardingDistributionCategories },
            colors
          };
          this.offboardingDistributionChartSeries = [{ name: 'Offboardings', data: this.offboardingDistributionData }];
        }
      } catch (error) {
        console.error('Error fetching offboarding distribution:', error);
        this.offboardingDistributionCategories = [];
        this.offboardingDistributionData = [];
        this.offboardingDistributionChartSeries = [{ name: 'Offboardings', data: [] }];
      }
    },
    toggleMiniSidebar() {
      this.mini = !this.mini;
    },
    openMobileSidebar() {
      this.mobileSidebarOpen = true;
    },
    closeMobileSidebar() {
      this.mobileSidebarOpen = false;
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },
    closeUserMenu() {
      this.userMenuOpen = false;
    },
    handleLogout() {
      this.closeUserMenu();
      this.closeMobileSidebar();
      alert('Logging out...');
    },
    openConfigurator() {
      this.closeUserMenu();
      alert('Opening configurator...');
    },
    handleResize() {
      if (window.innerWidth >= 1024) {
        this.mobileSidebarOpen = false;
      } else {
        this.mini = false;
      }
    },
    toggleGroupCollapse(title) {
      this.$set(this.groupStates, title, !this.groupStates[title]);
    },
    isGroupExpanded(title) {
      return this.groupStates[title] || false;
    },
    isRouteActive(route) {
      return (this.$route && this.$route.path === route) || (route && this.$route.path.startsWith(route.split('?')[0]));
    },
    handleTabValue(tabValue) {
      this.tab_current_val = tabValue;
      localStorage.setItem('selected_tab', tabValue);
      this.$emit('tabChanged', tabValue);
    },
  },
  directives: {
    'click-outside': {
      bind(el, binding) {
        el._clickOutside = event => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el._clickOutside);
      },
      unbind(el) {
        document.removeEventListener('click', el._clickOutside);
      }
    }
  }
}
</script>

<style scoped>
.tw-nathan-blue {
  background-color: #0a2c4f !important;
  box-shadow: 0 8px 32px 0 #0a2c4f33 !important;
}
.hover\:tw-shadow-nathan-blue\/40:hover {
  box-shadow: 0 8px 32px 0 #0a2c4f66 !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter,
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top right;
}
.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
@media (max-width: 1023px) {
  .tw-w-80 {
    width: 100% !important;
  }
  .tw-w-20 {
    width: 4.5rem !important;
  }
}
</style>
