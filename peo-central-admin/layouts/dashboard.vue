<template>
  <div>
    <Loader v-if="pageLoading" />
    <v-app v-else>
      <v-card color="dashboard_bg" class="dl__main_card" style="border-radius: 0 !important">
        <!-- SIDE NAVIGATION BAR -->
        <v-navigation-drawer
          class="dl__drawer tw-w-80 modern-sidebar"
          color="transparent"
          v-model="drawer"
          :mini-variant.sync="mini"
          permanent
          :style="{
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            borderRight: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }"
        >
          <div
            class="d-flex align-center justify-center tw-border-b tw-border-gray-200 tw-pl-4 tw-pr-4 tw-py-4 tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50"
            style="height: 7%; min-height: 80px;">
            <NuxtLink to="/dashboard" class="tw-transition-transform tw-duration-200 hover:tw-scale-105">
              <img src="/eor_central_logo.svg" class="tw-object-cover tw-h-10 tw-drop-shadow-sm" v-if="!mini" />
              <div v-else class="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-blue-600 tw-to-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                <span class="tw-text-white tw-font-bold tw-text-lg">P</span>
              </div>
            </NuxtLink>
          </div>

          <!-- SIDE NAVIGATION BAR ITEMS LIST WITH GROUPS -->
          <v-list class="tw-overflow-y-auto" style="height: 93%;max-height: 93%">
            <!-- Loop through nav groups based on user role -->
            <div v-for="(group, groupIndex) in navGroups" :key="groupIndex">
              <!-- Group Title with Icon and Collapse/Expand Button (only visible when not mini) -->
              <div
                v-if="!mini"
                class="nav-group-title tw-flex tw-items-center tw-justify-between tw-cursor-pointer tw-px-4 tw-py-3 tw-mx-2 tw-mt-4 tw-mb-2 tw-rounded-lg tw-bg-gradient-to-r tw-from-gray-50 tw-to-gray-100 tw-border tw-border-gray-200 tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-200 tw-group"
                :title="group.title"
                @click="toggleGroupCollapse(group.title)"
              >
                <div class="tw-flex tw-items-center tw-gap-3 tw-truncate tw-max-w-xs">
                  <div class="tw-p-2 tw-rounded-lg tw-bg-white tw-shadow-sm group-hover:tw-shadow-md tw-transition-all tw-duration-200">
                    <component :is="categoryIcons[group.title]" class="tw-w-4 tw-h-4" :color="getGroupColor(group.title)" />
                  </div>
                  <span class="tw-text-sm tw-font-medium tw-text-gray-700 tw-uppercase tw-tracking-wider">{{ group.title }}</span>
                </div>
                <div class="tw-p-1 tw-rounded-full tw-bg-white tw-shadow-sm group-hover:tw-bg-gray-50 tw-transition-all tw-duration-200">
                  <v-icon size="14" class="tw-text-gray-500 group-hover:tw-text-gray-700 tw-transition-colors tw-duration-200" :class="groupStates[group.title] ? 'tw-rotate-180' : ''">
                    {{ groupStates[group.title] ? 'fa-chevron-down' : 'fa-chevron-right' }}
                  </v-icon>
                </div>
              </div>

              <!-- Group Items with Collapse Animation -->
              <v-expand-transition>
                <div v-show="isGroupExpanded(group.title)" class="tw-ml-4 tw-border-l-2 tw-border-gray-300 tw-pl-2 tw-bg-gray-50/30 tw-rounded-r-lg tw-mr-2">
                  <div class="dl__list_div" v-for="(item, itemIndex) in group.items" :key="`${groupIndex}-${itemIndex}`">
                    <div v-if="group.title === 'Admin Central' && item.route === null" class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-mx-2 tw-rounded-lg tw-text-gray-400 tw-cursor-not-allowed tw-opacity-60 tw-bg-gray-50 tw-ml-2">
                      <div class="tw-p-2 tw-rounded-lg tw-bg-gray-100">
                        <component :is="item.icon" class="tw-w-4 tw-h-4" :color="getGroupColor(group.title)" />
                      </div>
                      <span class="tw-text-sm tw-font-medium">{{ item.text }}</span>
                    </div>
                    <NuxtLink
                      v-else
                      class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-mx-2 tw-rounded-lg tw-transition-all tw-duration-200 tw-ease-in-out tw-group tw-relative tw-overflow-hidden tw-ml-2"
                      :to="item.route"
                      :class="{
                        'tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-text-blue-700 tw-font-medium tw-shadow-md tw-border-l-4 tw-border-blue-500':
                          (group.title === 'Repositories' && isRepositoryActive(group.title, item.route)) ||
                          (group.title === 'Visa & Immigration' && isVisaProcessActive(item.route)) ||
                          (group.title !== 'Repositories' && group.title !== 'Visa & Immigration' && isRouteActive(item.route)),
                        'tw-text-gray-700 hover:tw-bg-gray-50 hover:tw-text-gray-900 hover:tw-shadow-sm':
                          !((group.title === 'Repositories' && isRepositoryActive(group.title, item.route)) ||
                          (group.title === 'Visa & Immigration' && isVisaProcessActive(item.route)) ||
                          (group.title !== 'Repositories' && group.title !== 'Visa & Immigration' && isRouteActive(item.route)))
                      }"
                    >
                      <!-- Active indicator -->
                      <div
                        v-if="(group.title === 'Repositories' && isRepositoryActive(group.title, item.route)) ||
                              (group.title === 'Visa & Immigration' && isVisaProcessActive(item.route)) ||
                              (group.title !== 'Repositories' && group.title !== 'Visa & Immigration' && isRouteActive(item.route))"
                        class="tw-absolute tw-left-0 tw-top-0 tw-bottom-0 tw-w-1 tw-bg-gradient-to-b tw-from-blue-500 tw-to-indigo-500 tw-rounded-r-full"
                      ></div>

                      <div class="tw-p-2 tw-rounded-lg tw-bg-white tw-shadow-sm group-hover:tw-shadow-md tw-transition-all tw-duration-200"
                           :class="{
                             'tw-bg-blue-100': (group.title === 'Repositories' && isRepositoryActive(group.title, item.route)) ||
                                             (group.title === 'Visa & Immigration' && isVisaProcessActive(item.route)) ||
                                             (group.title !== 'Repositories' && group.title !== 'Visa & Immigration' && isRouteActive(item.route)),
                             'group-hover:tw-bg-gray-100': !((group.title === 'Repositories' && isRepositoryActive(group.title, item.route)) ||
                                                           (group.title === 'Visa & Immigration' && isVisaProcessActive(item.route)) ||
                                                           (group.title !== 'Repositories' && group.title !== 'Visa & Immigration' && isRouteActive(item.route)))
                           }">
                        <component
                          :is="item.icon"
                          class="tw-w-4 tw-h-4"
                          :color="(group.title === 'Repositories' && isRepositoryActive(group.title, item.route)) ||
                                  (group.title === 'Visa & Immigration' && isVisaProcessActive(item.route)) ||
                                  (group.title !== 'Repositories' && group.title !== 'Visa & Immigration' && isRouteActive(item.route))
                                  ? '#3b82f6' : getGroupColor(group.title)"
                        />
                      </div>
                      <span class="tw-text-sm tw-font-medium tw-truncate">{{ item.text }}</span>
                    </NuxtLink>
                  </div>
                </div>
              </v-expand-transition>
            </div>

            <!-- Logout button -->
            <!-- <div class="logout__container flex_row justify-center mx-3 mt-5">
              <v-tooltip top color="grey">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn class="tall__btn" v-bind="attrs" v-on="on" color="primary" outlined icon block
                    @click="showLogoutDialog">
                    <v-icon class="mr-5" color="subtext" small>fa-duotone fa-right-from-bracket</v-icon>
                  </v-btn>
                </template>
Logout
</v-tooltip>
</div> -->

            <!-- Footer -->
            <!-- <div class="dl__side_footer" :class="{ minLogout: mini }">
              <div class="dl__side_footer_brand_wrap" :class="{ 'd-none': mini }">
                <span>
                  Powered By<br />
                  <v-img src="/DashboardLayout/nathan_acc.png" alt="nathan" class="powered__logo" />
                </span>
              </div>
              <div class="pb-0 side_nav_toggler_con">
                <v-btn class="" icon @click.stop="mini = !mini" small>
                  <v-icon v-if="mini == true" color="text" small>fa-chevron-right</v-icon>
                  <v-icon v-else color="text" small>fa-chevron-left</v-icon>
                </v-btn>
              </div>
            </div> -->
          </v-list>
        </v-navigation-drawer>
        <!-- / SIDE NAVIGATION BAR -->
        <!-- TOP NAVIGATION BAR -->
        <main class="dl__main">
          <div class="dl__headNav" :class="darkMood == false ? 'white' : 'dashboard_bg'">
            <div class="dl__header flex_row">
              <div v-if="showAppButtons" cols="2" class="pa-0 mt-0 pr-4">
                <AppBtn v-if="(open = true)" :data="productAccess" @productitem="baseurl($event)" />
              </div>

              <!-- MOBILE OPEN NAV BTN -->
              <!-- <v-btn class="openDrawerOnMobileBtn" icon @click="openDrawerOnMobileBtn">
                              <v-icon color="text">fa-chevron-right</v-icon>
                              </v-btn> -->
              <!-- / MOBILE OPEN NAV BTN -->
              <!-- <div class="flex_column mr-4">
                <p
                  v-if="$nuxt.$route.name == 'dashboard'"
                  class="subtext--text ma-0 pa-0"
                >
                  {{ formattedDate }}
                </p>
                <h2
                  v-if="
                    $nuxt.$route.name != 'dashboard' &&
                    $nuxt.$route.name != 'accounts'
                  "
                  class="text--text ma-0 pa-0"
                  style="text-transform: capitalize"
                >
                  {{ $nuxt.$route.name }}
                </h2>
                <h2
                  v-if="$nuxt.$route.name === 'accounts'"
                  class="text--text ma-0 pa-0"
                  style="text-transform: capitalize"
                >
                  Accounting
                </h2>
              </div> -->
              <div class="tabs__header_con">
                <!--CUSTOMER TOP BAR TABS  -->
                <!-- <HeaderTabs
                  @tabValue="handleTabValue($event)"
                  v-if="$nuxt.$route.name == 'Customer'"
                  :data="tabs_data.Customer"
                /> -->
                <!-- LEADS TOP-BAR TABS  -->
                <HeaderTabs @tabValue="handleTabValue($event)" v-if="$nuxt.$route.name == 'Leads'"
                  :data="tabs_data.Leads" />
                <!-- OFFBARDING TOP-BAR TABS  -->
                <HeaderTabs @tabValue="handleTabValue($event)" v-if="$nuxt.$route.name == 'Offboarding'"
                  :data="tabs_data.Offboarding" />
                <!-- employees TOP-BAR TABS  -->
                <HeaderTabs @tabValue="handleTabValue($event)" v-if="$nuxt.$route.name == 'Employees'"
                  :data="tabs_data.Employees" />
                <!-- Onboarding TOP-BAR TABS  -->
                <HeaderTabs @tabValue="handleTabValue($event)" v-if="$nuxt.$route.name == 'Onboarding'"
                  :data="tabs_data.Onboarding" />
                <!-- Visa Process TOP-BAR TABS  -->
                <HeaderTabs @tabValue="handleTabValue($event)"
                  v-if="$nuxt.$route.name == 'visa-process'"
                  :data="filteredVisaTabs" />
                <!-- Documents TOP-BAR TABS - Only show when there's no tab parameter in URL -->
                <HeaderTabs @tabValue="handleTabValue($event)"
                  v-if="$nuxt.$route.name == 'Documents' && !$route.query.tab"
                  :data="tabs_data.Documents" />
                <!-- Billings Tabs -->
                <HeaderTabs @tabValue="handleTabValue($event)" v-if="$nuxt.$route.name == 'Billings'"
                  :data="tabs_data.Billings" />
                <HeaderTabs @tabValue="handleTabValue($event)" v-if="$nuxt.$route.name == 'payroll'"
                  :data="tabs_data.Payroll" />
                <!-- Email Tabs -->
                <HeaderTabs @tabValue="handleTabValue($event)" v-if="$nuxt.$route.name == 'Email'"
                  :data="tabs_data.Email" />
              </div>
              <v-spacer></v-spacer>
              <div class="dl__header_actions flex_row">
                <!-- <v-btn icon color="outline"
                  ><ReloadIcon class="them_icon" @click.stop="refresh"
                /></v-btn> -->
                <!-- <ThemeIconLight class="them_icon" /> -->
                <!-- <component :is="'DotedMenu'" /> -->
                <!-- <v-btn icon color="outline" @click.stop="toggleTheme">
                  <img style="width: 30px;object-fit: cover;"
                    :src="$vuetify.theme.dark ? 'https://freelancerdxb.s3.eu-central-1.amazonaws.com/whatsapp/theme_dark.png' : 'https://freelancerdxb.s3.eu-central-1.amazonaws.com/whatsapp/theme_light.png' />

                </v-btn> -->
                <!-- <v-btn v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)" icon color="outline"
                  @click="goToSetting()">

                  <img style="width: 30px;object-fit: cover;"
                    src="https://freelancerdxb.s3.eu-central-1.amazonaws.com/whatsapp/configurator.png" />



                </v-btn> -->

                <header-user-icon @logout="showLogoutDialog" />

                <!-- <v-btn class="tall__btn" color="primary" outlined>
                  <div class="flex_row justify-space-around">
                    <span class="n_text text--text mx-2" @click="handlePrivacy"
                      >Privacy Mode</span
                    >
                    <PrivacyIcon />
                  </div>
                </v-btn> -->
                <!-- <AccountsDropDownMenu :accounts="accounts" /> -->
              </div>
            </div>
            <!-- <div v-if="$nuxt.$route.name == 'dashboard'">
              <CardWithIcon :data="balance_cards" :darkMood="darkMood" :class="privacyMood ? 'privacyMood' : ''" />
            </div> -->
          </div>
          <div class="dl__content">
            <!-- New Transaction Menu -->
            <v-sheet v-if="new_transaction_menu" elevation="0" rounded="xl" min-width="900" max-width="900"
              class="new_transaction_menu" style="box-shadow: 0px 0px 20px 0px #ccc !important">
              <v-row class="flex_row justify-space-between align-start">
                <v-col cols="auto" class="flex_column" v-for="(item, index) in new_transaction_menu_data" :key="index">
                  <span class="menu_title">{{ item.main_title }}</span>
                  <span @click="() => handleCloseNewTransactionMenu(subItem.to)" class="menu_link"
                    v-for="(subItem, index) in item.links" :key="index" :to="subItem.to">
                    {{ subItem.subtitle }}
                  </span>
                </v-col>
              </v-row>
            </v-sheet>
            <!-- / New Transaction Menu -->

            <Nuxt />
          </div>
        </main>

        <!-- Custom Logout Modal (DeleteModal style, not reused) -->
        <transition name="fade">
          <div v-if="confirmLogoutDialog" class="tw-fixed tw-min-h-screen tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-backdrop-blur-sm tw-transition-all tw-duration-300 logout-modal-backdrop">
            <div class="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-border tw-border-red-100 tw-px-8 tw-py-10 tw-max-w-lg tw-w-full tw-relative tw-animate-fadeIn">
              <div class="tw-flex tw-flex-col tw-items-center tw-mb-6">
                <svg class="tw-w-14 tw-h-14 tw-text-red-500 tw-mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                </svg>
                <h3 class="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-1">Log out?</h3>
                <p class="tw-text-gray-600 tw-text-center tw-mb-2 tw-max-w-xs">Are you sure you want to log out? This will end your current session.</p>
              </div>
              <div class="tw-flex tw-justify-end tw-gap-4">
                <button @click="confirmLogoutDialog = false" class="tw-px-6 tw-py-2 tw-rounded-lg tw-bg-gray-100 tw-text-gray-700 tw-font-semibold tw-border tw-border-gray-200 tw-shadow-sm tw-hover:bg-gray-200 tw-transition-all">Cancel</button>
                <button @click="handleLogout()" class="tw-px-6 tw-py-2 tw-rounded-lg tw-bg-red-500 tw-text-white tw-font-semibold tw-shadow-md tw-border tw-border-red-400 tw-hover:bg-red-600 tw-transition-all">Log out</button>
              </div>
            </div>
          </div>
        </transition>
        <!-- / Custom Logout Modal -->
        <!-- / TOP NAVIGATION BAR -->
      </v-card>
    </v-app>

  </div>
</template>

<script>
import '@/assets/scss/layouts/_dashboardLayout.scss'
import DB_SideNavMasker from '@/assets/images/DashboardLayout/SideNavMasker/Dashboard.svg'
import VisaP_SideNavMasker from '@/assets/images/DashboardLayout/SideNavMasker/Banking.svg'
import SAL_SideNavMasker from '@/assets/images/DashboardLayout/SideNavMasker/Sales.svg'
import EXP_SideNavMasker from '@/assets/images/DashboardLayout/SideNavMasker/Expenses.svg'
import COA_SideNavMasker from '@/assets/images/DashboardLayout/SideNavMasker/ChartOfAccounts.svg'
import CUS_SideNavMasker from '@/assets/images/DashboardLayout/SideNavMasker/Customers.svg'
import DashboardIcon from '@/assets/images/DashboardLayout/Dashboard-icon.svg'
import CustomerIcon from '@/assets/images/DashboardLayout/Customer-icon.svg'
import BillingIcon from '@/assets/images/DashboardLayout/Billing-icon.svg'
import DocumentsIcon from '@/assets/images/DashboardLayout/Documents-icon.svg'
import InsightsIcon from '@/assets/images/DashboardLayout/insights-icon.svg'
import SupportIcon2 from '@/assets/images/DashboardLayout/support-icon2.svg'
import EmailIcon from '@/assets/images/DashboardLayout/email-icon.svg'
import OffboardingIcon from '@/assets/images/DashboardLayout/Offboarding-icon.svg'
import LeadsIcon from '@/assets/images/DashboardLayout/leads-icon.svg'
import EmployeesIcon from '@/assets/images/DashboardLayout/Employees-icon.svg'
import OnboardingIcon from '@/assets/images/DashboardLayout/onboarding-icon.svg'
import VisaProcessIcon from '@/assets/images/DashboardLayout/visaProcess-icon.svg'
import RenewalReqIcon from '@/assets/images/DashboardLayout/RenewalReq-icon.svg'
import SalesIcon from '@/assets/images/DashboardLayout/Sales-icon.svg'
import ExpensesIcon from '@/assets/images/DashboardLayout/Expenses-icon.svg'
import ChartOfAccountsIcon from '@/assets/images/DashboardLayout/ChartOfAccounts-icon.svg'
import ReportsIcon from '@/assets/images/DashboardLayout/Reports-icon.svg'
import BankingIcon from '@/assets/images/DashboardLayout/Banking-icon.svg'
import AlertsIcon from '@/assets/images/DashboardLayout/Alerts-icon.svg'
import SupportIcon from '@/assets/images/DashboardLayout/Support-icon.svg'
import AccountingLogo from '@/assets/images/DashboardLayout/Accounting-logo-Copy.svg'
import NDlogo from '@/assets/images/DashboardLayout/Accounting-logo-Copy.svg'
import PoweredByIcon from '@/assets/images/DashboardLayout/PoweredBy-icon.svg'
import ThemeIcon from '@/assets/images/DashboardLayout/Theme-icon.svg'
import ReloadIcon from '@/assets/images/DashboardLayout/Reload-icon.svg'
import SettingIcon from '@/assets/images/DashboardLayout/setting-icon.svg'
import PrivacyIcon from '@/assets/images/DashboardLayout/Privacy-icon.svg'
import DotedMenu from '@/assets/images/DashboardLayout/DotsMenu.svg'
import InquiryIcon from '@/assets/images/DashboardLayout/Inquiry.svg'
import ProjectsIcon from '@/assets/images/DashboardLayout/Projects-icon.svg'
import EjariIcon from '@/assets/images/DashboardLayout/Ejari-icon.svg'

// Feather icon imports
import { HomeIcon, UsersIcon, BriefcaseIcon, FileTextIcon, UserCheckIcon, UserPlusIcon, UserMinusIcon, RefreshCwIcon, GlobeIcon, FolderIcon, FileIcon, UserIcon, DollarSignIcon, HelpCircleIcon, SettingsIcon, BellIcon, MailIcon, BarChart2Icon, BookOpenIcon, LayersIcon, ArchiveIcon, ClipboardIcon, ShieldIcon, CalendarIcon, CreditCardIcon, MessageCircleIcon, DatabaseIcon, BuildingIcon, TrendingUpIcon, ClipboardCheckIcon, AwardIcon, TargetIcon, CheckCircleIcon, AlertCircleIcon } from 'vue-feather-icons'

import AccountsDropDownMenu from '@/components/Layout/AccountsDropDownMenu/index.vue'
import Loader from '@/components/utils/Loader.vue'
import HeaderTabs from '@/components/Layout/HeaderTabs/index.vue'
import CardWithIcon from '@/components/Cards/CardWithIcon/index.vue'

import AppBtn from '@/components/apps-button'

export default {
  name: 'dashboard',
  components: {
    DotedMenu,
    DB_SideNavMasker,
    SAL_SideNavMasker,
    EXP_SideNavMasker,
    COA_SideNavMasker,
    CUS_SideNavMasker,
    AccountingLogo,
    NDlogo,
    DashboardIcon,
    CustomerIcon,
    BillingIcon,
    InquiryIcon,
    OffboardingIcon,
    LeadsIcon,
    AlertsIcon,
    BankingIcon,
    ChartOfAccountsIcon,
    ExpensesIcon,
    PoweredByIcon,
    ReportsIcon,
    SalesIcon,
    SettingsIcon,
    SupportIcon,
    SupportIcon2,
    ReloadIcon,
    SettingIcon,
    ThemeIcon,
    PrivacyIcon,
    DocumentsIcon,
    InsightsIcon,
    EmailIcon,
    AccountsDropDownMenu,
    HeaderTabs,
    CardWithIcon,
    Loader,
    EmployeesIcon,
    OnboardingIcon,
    VisaProcessIcon,
    VisaP_SideNavMasker,
    RenewalReqIcon,
    AppBtn,
    ProjectsIcon,
    EjariIcon,
    HomeIcon, UsersIcon, BriefcaseIcon, FileTextIcon, UserCheckIcon, UserPlusIcon, UserMinusIcon, RefreshCwIcon, GlobeIcon, FolderIcon, FileIcon, UserIcon, DollarSignIcon, HelpCircleIcon, SettingsIcon, BellIcon, MailIcon, BarChart2Icon, BookOpenIcon, LayersIcon, ArchiveIcon, ClipboardIcon, ShieldIcon, CalendarIcon, CreditCardIcon, MessageCircleIcon, DatabaseIcon, BuildingIcon, TrendingUpIcon, ClipboardCheckIcon, AwardIcon, TargetIcon, CheckCircleIcon, AlertCircleIcon,
  },
  data() {
    return {
      userRole: this.$store.getters.getThisUserRole,
      selectedCompany: this.$store.getters.getSelectedCompany,
      date: new Date(),
      // Track expanded/collapsed state of sidebar groups (first 3 open by default)
      groupStates: {},
      new_transaction_menu_data: [
        {
          main_title: 'Customers',
          links: [
            { subtitle: 'Invoice', to: '/sales' },
            { subtitle: 'Receive Payments', to: '/sales' },
            { subtitle: 'Estimate', to: '/sales' },
            { subtitle: 'Tax Credit Note', to: '/sales' },
            { subtitle: 'Sales Receipt', to: '/salesReceipt' },
            { subtitle: 'Refund Receipt', to: '/sales' },
            { subtitle: 'Delayed Credit', to: '/sales' },
            { subtitle: 'Delayed Charge', to: '/sales' },
          ],
        },
        {
          main_title: 'Suppliers',
          links: [
            { subtitle: 'Expense', to: '/sales' },
            { subtitle: 'Cheque', to: '/sales' },
            { subtitle: 'Bill', to: '/sales' },
            { subtitle: 'Pay Bills', to: '/sales' },
            { subtitle: 'Purchase Order', to: '/sales' },
            { subtitle: 'Supplier Credit', to: '/sales' },
            { subtitle: 'Credit Card Credit', to: '/sales' },
          ],
        },
        {
          main_title: 'Employees',
          links: [
            { subtitle: 'Single Time Activity', to: '/sales' },
            { subtitle: 'Weekly Timesheet', to: '/sales' },
          ],
        },
        {
          main_title: 'Other',
          links: [
            { subtitle: 'Bank Deposit', to: '/sales' },
            { subtitle: 'Transfer', to: '/sales' },
            { subtitle: 'Journal Entry', to: '/journal-entry' },
            { subtitle: 'Statement', to: '/sales' },
            { subtitle: 'Inventory Quantity Adjustment', to: '/sales' },
            { subtitle: 'Pay Down Credit Card', to: '/sales' },
          ],
        },
      ],
      new_transaction_menu: false,
      news: [
        'New version of CRM',
        'Traders on Fires..',
        'Updating UX',
        'Monthly Challenges',
        'Jain Updates',
      ],
      softwares: [
        {
          name: 'Accounting Software',
          img: 'https://cdn-icons-png.flaticon.com/512/5971/5971887.png',
        },
        {
          name: 'Full CRM Software',
          img: 'https://cdn-icons-png.flaticon.com/512/3930/3930395.png',
        },
        {
          name: 'Tasks Management',
          img: 'https://cdn-icons-png.flaticon.com/512/6477/6477765.png',
        },
      ],
      // drawer: null,
      items: [
        { title: 'Home', icon: 'mdi-view-dashboard' },
        { title: 'About', icon: 'mdi-forum' },
      ],
      // Navigation groups for different user roles
      navGroupsBySuperAdmin: [
        {
          title: 'Dashboard',
          items: [
            { text: 'Home', icon: 'HomeIcon', route: '/dashboard', bgH: '' }
          ]
        },
        {
          title: 'Business Development',
          items: [
            { text: 'Partners', icon: 'UsersIcon', route: '/partners', bgH: '' },
            { text: 'Inquiries', icon: 'UserPlusIcon', route: '/inquiries', bgH: 'bgH_one' },
            { text: 'Leads', icon: 'UserPlusIcon', route: '/leads', bgH: 'bgH_one' },
            { text: 'Clients', icon: 'UserPlusIcon', route: '/employer', bgH: 'bgH_four' }
          ]
        },
        {
          title: 'HR Management',
          items: [
            { text: 'Employees', icon: 'UsersIcon', route: '/employees', bgH: 'bgH_three' },
            { text: 'Onboarding', icon: 'UserPlusIcon', route: '/onboarding', bgH: 'bgH_five' },
            { text: 'Offboarding', icon: 'UserMinusIcon', route: '/offboarding', bgH: 'bgH_one' },
            { text: 'Renewal Request', icon: 'RefreshCwIcon', route: '/renewalRequest', bgH: 'bgH_two' },
          ]
        },
        {
          title: 'Visa & Immigration',
          items: [
            { text: 'New Process', icon: 'GlobeIcon', route: '/visa-process?tab=new', bgH: 'bgH_two' },
            { text: 'Renewal Process', icon: 'RefreshCwIcon', route: '/visa-process?tab=renewal', bgH: 'bgH_two' },
            { text: 'Cancellation Process', icon: 'UserMinusIcon', route: '/visa-process?tab=cancellation', bgH: 'bgH_two' },
          ]
        },
        {
          title: 'Repositories',
          items: [
            { text: 'Internal Resources', icon: 'DatabaseIcon', route: '/documents?tab=central-repository', bgH: 'bgH_five' },
            { text: 'Client Documents', icon: 'DatabaseIcon', route: '/documents?tab=companies', bgH: 'bgH_four' },
            { text: 'Employee Documents', icon: 'UserIcon', route: '/documents?tab=users', bgH: 'bgH_three' },
          ]
        },
        {
          title: 'Finance',
          items: [
            { text: 'Billing', icon: 'CreditCardIcon', route: '/billings', bgH: 'bgH_three' },
            { text: 'Payroll', icon: 'CreditCardIcon', route: '/payroll', bgH: 'bgH_three' }
          ]
        },
        {
          title: 'Support Center',
          items: [
            { text: 'Support Tickets', icon: 'MessageCircleIcon', route: '/support', bgH: 'bgH_four' },
            { text: 'PaySlips', icon: 'TrendingUpIcon', route: '/payslips', bgH: 'bgH_three' },
          ]
        },
        {
          title: 'Admin Central',
          items: [
            { text: 'Internal Access', icon: 'ShieldIcon', route: '/admin_central/internalAccess', bgH: 'bgH_three' },
            { text: 'Client Access', icon: 'ShieldIcon', route: '/admin_central/clientAccess', bgH: 'bgH_three' },
            { text: 'Employee Access', icon: 'UsersIcon', route: null, bgH: 'bgH_three' },
            { text: 'Client Announcement', icon: 'MailIcon', route: null, bgH: 'bgH_three' },
            { text: 'Employee Announcement', icon: 'MailIcon', route: null, bgH: 'bgH_three' },
          ]
        },
        {
          title: 'Projects',
          items: [
            { text: `Ejari- ${new Date().getFullYear() }`, icon: 'TargetIcon', route: '/projects', bgH: 'bgH_three' },
          ]
        }
      ],

      navGroupsByAdmin: [
        {
          title: 'Dashboard',
          items: [
            {
              text: 'Dashboard',
              icon: 'HomeIcon',
              route: '/dashboard',
              bgH: ''
            }
          ]
        },
        {
          title: 'HR Management',
          items: [
            {
              text: 'Employees',
              icon: 'UsersIcon',
              route: '/employees',
              bgH: 'bgH_three'
            },
            {
              text: 'Onboarding',
              icon: 'UserPlusIcon',
              route: '/onboarding',
              bgH: 'bgH_five'

            },
            {
              text: 'Offboarding',
              icon: 'UserMinusIcon',
              route: '/offboarding',
              bgH: 'bgH_one'
            }
          ]
        },
        {
          title: 'Repositories',
          items: [
            {
              text: 'Internal Resources',
              icon: 'DatabaseIcon',
              route: '/documents?tab=central-repository',
              bgH: 'bgH_five'
            },
            {
              text: 'Client Documents',
              icon: 'BuildingIcon',
              route: '/documents?tab=companies',
              bgH: 'bgH_four'
            },
            {
              text: 'Employee Documents',
              icon: 'UserIcon',
              route: '/documents?tab=users',
              bgH: 'bgH_three'
            },
          ]
        },
        {
          title: 'Finance',
          items: [
            {
              text: 'PaySlips',
              icon: 'TrendingUpIcon',
              route: '/payslips',
              bgH: 'bgH_three'
            }
          ]
        },
        {
          title: 'HR Administration',
          items: [
            {
              text: 'HR Self Service',
              icon: 'UserCheckIcon',
              route: '/hr',
              bgH: 'bgH_three'
            },
            {
              text: 'Admin Central',
              icon: 'SettingsIcon',
              route: '/admin_central',
              bgH: 'bgH_three'
            }
          ]
        }
      ],

      navGroupsByEmployee: [
        {
          title: 'HR Self Service',
          items: [
            {
              text: 'Employees',
              icon: 'UsersIcon',
              route: '/employees',
              bgH: 'bgH_three'
            },
            {
              text: 'HR Self Service',
              icon: 'UserCheckIcon',
              route: '/hr',
              bgH: 'bgH_three'
            }
          ]
        },
        {
          title: 'Repositories',
          items: [
            {
              text: 'Internal Resources',
              icon: 'DatabaseIcon',
              route: '/documents?tab=central-repository',
              bgH: 'bgH_five'
            },
            {
              text: 'Client Documents',
              icon: 'BuildingIcon',
              route: '/documents?tab=companies',
              bgH: 'bgH_four'
            },
            {
              text: 'Employee Documents',
              icon: 'UserIcon',
              route: '/documents?tab=users',
              bgH: 'bgH_three'
            },
          ]
        }
      ],
      swMenuDialog: false,
      privacyMood: false,
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
        Customer: [
          // { title: 'Customer', value: 'all' },
          // { title: 'Documents', value: 'documents' },
        ],
        Employees: [
          { title: 'Employees', value: 'all' },
          // { title: 'HR Services', value: 'hrServices' },
        ],
        Onboarding: [
          { title: 'Currently Onboarding', value: 'all' },
          // { title: 'Pipeline', value: 'onboardingPipeline' },
        ],
        VisaProcess: [
          { title: 'New Process', value: 'new visa process' },
          { title: 'Renewal Process', value: 'visa renewal' },
          { title: 'Cancellation Process', value: 'visa cancellation' },
          // { title: 'Pipeline', value: 'pipeline' },
        ],
        Documents: [
          { title: "Internal Resources", value: "central-repository" },
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
        Payroll: [
          { title: 'WPS Payout', value: 'wps-payout' },
          { title: 'Commissions', value: 'commissions' },
          { title: 'Service Fee Refunds', value: 'serviceFeeRefunds' },
        ],
        Email: [
          { title: 'Inbox', value: 'Inbox' },
          { title: 'Sent', value: 'Sent Items' },
        ],
      },
      darkMood: false,
      balance_cards: [
        { name: 'EmiratesNBD', amount: '259,218.18 ', color: 'accent3' },
        { name: 'Dubai Islamic', amount: '6,578,625.69', color: 'accent2' },
        { name: 'RAK Bank', amount: '7,858,500.28', color: 'primary' },
        { name: 'ADCB Bank', amount: '1,245,135.13 ', color: 'accent1' },
      ],
      SideNavMaskerValue: 'Dashboard',
      drawer: true,
      drawer2: false,
      mini: false,
      isSuperAdminitems: [
        {
          group: 'MENU',
          links: [
            {
              text: 'Dashboard',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Reports-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/dashboard',
            },
            {
              text: 'Partners',
              icon: 'DashboardIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'DB_SideNavMasker',
              route: '/partners',
            },
            {
              text: 'Leads',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/leads',
              bgH: 'bgH_one',
            },
            {
              text: 'Clients',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/employer',
              bgH: 'bgH_four',
            },
            {
              text: 'Employees',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/employees',
              bgH: 'bgH_three',
            },
            {
              text: 'Onboarding',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/onboarding',
              bgH: 'bgH_five'
,
            },
            {
              text: 'Renewal Request',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/renewalRequest',
              bgH: 'bgH_two',
            },
            {
              text: 'Offboarding',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/offboarding',
              bgH: 'bgH_one',
            },
            {
              text: 'Visa Process',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/visa-process',
              bgH: 'bgH_two',
            },
            {
              text: 'Billings',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/billings',
              bgH: 'bgH_three',
            },
            // Documents moved to Repositories section

            // {
            //   text: 'Insights',
            //   icon: 'SalesIcon',
            //   iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
            //   marker: 'SAL_SideNavMasker',
            //   route: '/insights',
            //   bgH: 'bgH_one',
            // },
            {
              text: 'Support',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/support',
              bgH: 'bgH_four',
            },
            {
              text: 'Email',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/email',
              bgH: 'bgH_four',
            },
            {
              text: 'PaySlips',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/admincentral.svg',
              marker: 'EXP_SideNavMasker',
              route: '/payslips',
              bgH: 'bgH_three',
            },
            {
              text: 'HR Self Service',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/hrselfservice.svg',
              marker: 'EXP_SideNavMasker',
              route: '/hr',
              bgH: 'bgH_three',
            },
            {
              text: 'Reports',
              icon: 'SalesIcon',
              iconsrc: 'https://hrdirect-staging.devnhr.com/header/reports.svg',
              marker: 'EXP_SideNavMasker',
              route: '/reports',
              bgH: 'bgH_three',
            },
            {
              text: 'Team Central',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/teamcentral.svg',
              marker: 'EXP_SideNavMasker',
              route: '/team_central',
              bgH: 'bgH_three',
            },
            {
              text: 'Admin Central',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/admincentral.svg',
              marker: 'EXP_SideNavMasker',
              route: '/admin_central',
              bgH: 'bgH_three',
            },
          ],
        },
      ],
      isAdminitems: [
        {
          group: 'MENU',
          links: [
            {
              text: 'Dashboard',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Reports-icon.svg',
              marker: 'DB_SideNavMasker',
              route: '/dashboard',
            },
            // {
            //   text: 'Dashboard',
            //   icon: 'DashboardIcon',
            //   iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
            //   marker: 'DB_SideNavMasker',
            //   route: '/dashboard',
            // },
            {
              text: 'Employees',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/employees',
              bgH: 'bgH_three',
            },
            {
              text: 'Onboarding',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/onboarding',
              bgH: 'bgH_five'
,
            },

            {
              text: 'Offboarding',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/offboarding',
              bgH: 'bgH_one'
            },
            {
              text: 'PaySlips',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/admincentral.svg',
              marker: 'EXP_SideNavMasker',
              route: '/payslips',
              bgH: 'bgH_three',
            },
            {
              text: 'HR Self Service',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/hrselfservice.svg',
              marker: 'EXP_SideNavMasker',
              route: '/hr',
              bgH: 'bgH_three',
            },
            {
              text: 'Admin Central',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/admincentral.svg',
              marker: 'EXP_SideNavMasker',
              route: '/admin_central',
              bgH: 'bgH_three',
            },
            // {
            //   text: 'Insights',
            //   icon: 'SalesIcon',
            //   iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
            //   marker: 'SAL_SideNavMasker',
            //   route: '/insights',
            //   bgH: 'bgH_one',
            // },
            // {
            //   text: 'Support',
            //   icon: 'SalesIcon',
            //   iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
            //   marker: 'SAL_SideNavMasker',
            //   route: '/support',
            //   bgH: 'bgH_four',
            // },
            // {
            //   text: 'Email',
            //   icon: 'SalesIcon',
            //   iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
            //   marker: 'SAL_SideNavMasker',
            //   route: '/email',
            //   bgH: 'bgH_four'
            // },
          ],
        },
      ],
      isEmployeeitems: [
        {
          group: 'MENU',
          links: [
            {
              text: 'Employees',
              icon: 'SalesIcon',
              iconsrc: '@/assets/images/DashboardLayout/Dashboard-icon.svg',
              marker: 'SAL_SideNavMasker',
              route: '/employees',
              bgH: 'bgH_three',
            },
            {
              text: 'HR Self Service',
              icon: 'SalesIcon',
              iconsrc:
                'https://hrdirect-staging.devnhr.com/header/hrselfservice.svg',
              marker: 'EXP_SideNavMasker',
              route: '/hr',
              bgH: 'bgH_three',
            },
          ],
        },
      ],
      accounts: [
        { name: 'Account One' },
        { name: 'Account Two' },
        { name: 'Account Three' },
        { name: 'Add New' },
      ],
      showAppButtons: false,
      productAccess: [],
      user: {},
      loadingProduct: false,
      confirmLogoutDialog: false,
      pageLoading: true,
      categoryIcons: {
        'Dashboard': 'HomeIcon',
        'Business Development': 'TargetIcon',
        'HR Management': 'UsersIcon',
        'Visa & Immigration': 'GlobeIcon',
        'Repositories': 'DatabaseIcon',
        'Finance': 'CreditCardIcon',
        'Support Center': 'MessageCircleIcon',
        'Admin Central': 'SettingsIcon',
        'HR Administration': 'CheckCircleIcon',
        'HR Self Service': 'UserCheckIcon',
        'Projects': 'TargetIcon',
      },
    }
  },
  methods: {
    toggleGroupCollapse(groupTitle) {
      // When in mini mode, don't toggle
      if (this.mini) return;

      // Toggle the expansion state of the clicked group
      this.$set(this.groupStates, groupTitle, !this.groupStates[groupTitle]);

      // Save group states to localStorage
      this.saveGroupStates();
    },

    saveGroupStates() {
      try {
        localStorage.setItem('peo_central_menu_states', JSON.stringify(this.groupStates));
      } catch (e) {
        console.error('Could not save menu states to localStorage', e);
      }
    },

    loadGroupStates() {
      try {
        const savedStates = localStorage.getItem('peo_central_menu_states');
        if (savedStates) {
          // Merge saved states with default states
          const parsedStates = JSON.parse(savedStates);
          this.groupStates = { ...this.getDefaultGroupStates(), ...parsedStates };
        } else {
          // Set default states (first 3 groups open)
          this.groupStates = this.getDefaultGroupStates();
        }

        // Also expand the group containing the current route
        this.expandGroupContainingRoute(this.$route.path);
      } catch (e) {
        console.error('Could not load menu states from localStorage', e);
        // Fallback to default states
        this.groupStates = this.getDefaultGroupStates();
      }
    },

    getDefaultGroupStates() {
      const defaultStates = {};
      this.navGroups.forEach((group, index) => {
        // First 3 groups open by default
        defaultStates[group.title] = index < 6;
      });
      return defaultStates;
    },

    expandGroupContainingRoute(routePath) {
      if (!routePath || this.mini) return;

      // Find which group contains this route
      for (const group of this.navGroups) {
        const hasRouteInGroup = group.items.some(item =>
          item.route && routePath.startsWith(item.route)
        );

        if (hasRouteInGroup) {
          this.$set(this.groupStates, group.title, true);
        }
      }

      // Save the updated states
      this.saveGroupStates();
    },

    isGroupExpanded(groupTitle) {
      // Groups are always "expanded" in mini mode (we just show icons)
      if (this.mini) return true;

      // Get the current route
      const currentRoute = this.$route.path;

      // Find if any of the group's items matches the current route
      const group = this.navGroups.find(g => g.title === groupTitle);
      const hasActiveRoute = group?.items.some(item =>
        item.route && currentRoute.startsWith(item.route)
      );

      // Auto-expand the group if it contains the active route
      if (hasActiveRoute && !this.groupStates[groupTitle]) {
        this.$set(this.groupStates, groupTitle, true);
      }

      // Otherwise check the stored state
      return this.groupStates[groupTitle] === true;
    },

    showLogoutDialog() {
      this.confirmLogoutDialog = true
    },
    goToSetting() {
      this.$router.push('/settings')
    },
    goToHomePage() {
      // logic to navigate to home page
      this.$router.push('/')
    },
    handleCloseNewTransactionMenu(toLink) {
      this.new_transaction_menu = false
      this.$router.push(toLink)
    },
    handleNewTransactionMainBtn() {
      this.new_transaction_menu = !this.new_transaction_menu
    },
    async handleLogout() {
      await this.$store.dispatch('logout')
      await this.$auth.logout()
      this.$router.push('/')
      this.confirmLogoutDialog = false
    },
    handleSWMenuDialog() {
      this.swMenuDialog = true
    },
    handlePrivacy() {
      this.$nuxt.$emit('togglePrivacyMood')
      this.privacyMood = !this.privacyMood
    },
    handleTabValue(tabValue) {
      // Only allow navigation if the tab value matches the current tab
      // This disables switching tabs from the top bar for visa-process
      if (this.$route.name === 'visa-process') {
        // Only allow the current tab to be selected
        const allowed = this.tabs_data.VisaProcess.find(t => t.value === this.visaModule)
        if (allowed && tabValue === allowed.value) return;
        // Otherwise, force the tab back to the current one
        this.$router.replace({ path: '/visa-process', query: { tab: this.currentTab } })
        return;
      }
      // Setting the payload value
      this.tab_current_val = tabValue
      // console.log('Emitted Value from HeaderTabs Component  ==> ', payload)
      // Setting the payload value
      this.tab_current_val = tabValue
      // Setting the payload value in the localStorage under name selected_tab
      localStorage.setItem('selected_tab', tabValue)
      // Emitting an event call tabChanged with the tab current value
      this.$nuxt.$emit('tabChanged', tabValue)
    },

    handleClickedLink(value) {
      if (value == 'Employers') {
        this.$router.push('/Employer')
      }
      if (value == 'Leads') {
        this.$router.push('/Leads')
      }
      if (value == 'Employees') {
        this.$router.push('/Employees')
      }
      if (value == 'Onboarding') {
        this.$router.push('/Onboarding')
      }
      if (value == 'Offboarding') {
        this.$router.push('/Offboarding')
      }
    },
    handleLinks(value) {
      this.SideNavMaskerValue = value.text
    },
    refresh() {
      console.log('page refreshed...')
    },
    toggleTheme() {
      if (!this.$vuetify.theme.dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      this.bg = !this.bg
    },
    async navigateToNewApp(data) {
      this.loadingProduct = true
      const token = this.$store.getters.getToken
      const email = this.$store.state.user.email
      var AuthStr = 'Bearer '.concat(token)
      let body = {
        email: email,
      }
      await this.$axios
        .$post('auth/centralValidation', body, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          // this.$store.dispatch('logout')
          window.location = data + '?email=' + email + '&otp=' + res.data
        })
        .catch((e) => {
          console.log(e)
        })
    },
    getProductAccess() {
      this.productAccess = this.$store.getters.getProductAccess
      /**
       * 63a93a1c85541d4d9afca616 -> PRODUCT ID from the central DB
       */
      this.productAccess = this.productAccess.filter(
        (prod) => prod.product_id != '63a93a1c85541d4d9afca616'
      )
      this.productAccess.length > 0
        ? (this.showAppButtons = true)
        : (this.showAppButtons = false)
    },
    async baseurl(data) {
      this.loadingProduct = true
      const token = this.$store.getters.getToken
      var AuthStr = 'Bearer '.concat(token)

      let body = {
        // email : "ashritha@nathandigi.com"
        email: this.user,
      }
      await this.$axios
        .$post('/users/validate/centralValidation', body, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.$store.dispatch('logout')
          window.location = data + '?email=' + this.user + '&otp=' + res.data
        })
        .catch((e) => {
          console.log(e)
        })
      // this.$store.dispatch('logout')
      // window.location = data+"?email="+this.user.email
    },
    getUserInfo() {
      this.user = this.$store.getters.getThisUser
    },
    async checkAuthentication() {
      try {
        // Check if token exists in store
        const token = this.$store.getters.getToken
        const user = this.$store.getters.getThisUser

        // If no token or no user data, redirect to login
        if (!token || !user || !user.email) {
          console.log('No valid token or user data found, redirecting to login')
          this.$store.dispatch('logout')
          this.$router.push('/')
          return
        }

        // Validate token by making a test API call
        const AuthStr = 'Bearer '.concat(token)
        await this.$axios.$get('/users/getLogin', {
          headers: { Authorization: AuthStr },
        })

        console.log('Authentication check passed')
      } catch (error) {
        console.log('Authentication check failed:', error.message)
        // Token is invalid or expired, redirect to login
        this.$store.dispatch('logout')
        this.$router.push('/')
      }
    },
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
      const base64 = (base64String + padding)
        ?.replace(/-/g, '+')
        ?.replace(/_/g, '/')
      const rawData = atob(base64)
      const outputArray = new Uint8Array(rawData.length)
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
      }
      return outputArray
    },
    async subscribeFn() {
      if ('serviceWorker' in navigator) {
        const permissions = await Notification.requestPermission()
        if (permissions === 'granted') {
          const register = await navigator.serviceWorker.register('/worker.js')

          if (register) {
            await register.update()
            window.subscription = await register.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlBase64ToUint8Array(this.$config.push_public_key),
            })

            await this.$axios.$post(`${this.$config.push_api_url}/webpusher/subscribe`, {
              userId: this.$store.state.userInfo.id,
              subscription: window.subscription,
            })
          }
        }
      }
    },
    isRepositoryActive(groupTitle, itemRoute) {
      if (groupTitle !== 'Repositories') return false;
      const [repoPath, repoQueryString] = itemRoute.split('?');
      const repoTabParam = repoQueryString ? new URLSearchParams(repoQueryString).get('tab') : null;
      return (
        this.$route.path === repoPath &&
        this.$route.query.tab === repoTabParam
      );
    },
    isRouteActive(itemRoute) {
      // For non-repository/visa-process links, match by path only
      if (!itemRoute) return false;
      const [simplePath] = itemRoute.split('?');
      return this.$route.path === simplePath;
    },
    isVisaProcessActive(itemRoute) {
      // For visa-process links, match by path and tab param
      if (!itemRoute) return false;
      const [visaPath, visaQueryString] = itemRoute.split('?');
      const visaTabParam = visaQueryString ? new URLSearchParams(visaQueryString).get('tab') : null;
      return (
        this.$route.path === visaPath &&
        this.$route.query.tab === visaTabParam
      );
    },
    getGroupColor(groupTitle) {
      // Assign a unique accent color per group (hex for feather icons)
      switch (groupTitle) {
        case 'Dashboard': return '#3B82F6'; // blue-500
        case 'Business Development': return '#8B5CF6'; // purple-500
        case 'HR Management': return '#22C55E'; // green-500
        case 'Visa & Immigration': return '#F59E42'; // yellow-500
        case 'Repositories': return '#EC4899'; // pink-500
        case 'Finance': return '#F97316'; // orange-500
        case 'Support Center': return '#06B6D4'; // cyan-500
        case 'Admin Central': return '#64748B'; // gray-500
        case 'Projects': return '#6366F1'; // indigo-500
        case 'HR Administration': return '#64748B'; // gray-500
        case 'HR Self Service': return '#22D3EE'; // cyan-400
        default: return '#A3A3A3'; // gray-400
      }
    },
  },
  watch: {
    mini(newValue) {
      // When switching to mini mode, we don't need to do anything
      // When switching back from mini mode, restore the group states
      if (!newValue) {
        // Restore default states (first 3 groups open)
        const defaultStates = this.getDefaultGroupStates();
        this.groupStates = { ...this.groupStates, ...defaultStates };
        this.saveGroupStates();
      }
    },
    $route(newRoute, oldRoute) {
      // When route changes, expand the group containing the new route
      if (newRoute.path !== oldRoute.path) {
        this.expandGroupContainingRoute(newRoute.path);
      }
    }
  },
  async mounted() {
    this.pageLoading = true

    // Check authentication first
    await this.checkAuthentication()

    this.getProductAccess()
    this.subscribeFn()
    this.getUserInfo();

    // Load saved menu states when component mounts
    this.loadGroupStates();

    // Save current route to localStorage for refresh handling
    if (process.client) {
      localStorage.setItem('lastRoute', this.$route.path)
    }

    // Watch for route changes to save the current route
    this.$router.afterEach((to) => {
      if (process.client) {
        localStorage.setItem('lastRoute', to.path)
      }
    })

    setTimeout(() => {
      this.pageLoading = false
    }, 1500)
  },
  computed: {
    navGroups() {
      switch (this.userRole) {
        case 'isSuperAdmin':
          return this.navGroupsBySuperAdmin;
        case 'isAdmin':
          return this.navGroupsByAdmin;
        case 'isEmployee':
          return this.navGroupsByEmployee;
        default:
          return this.navGroupsBySuperAdmin; // Default to SuperAdmin view
      }
    },
    formattedDate() {
      // 23/02/2023
      // return this.date.toLocaleDateString()
      // Thursday, February 23
      return this.date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    },
    // productAccess() {
    //   /*** 63aae33885541d4d9afca61f -> PRODUCT ID from the central DB */
    //   return this.$store.state.productAccess.filter(
    //     (prod) => prod.product_id != '63aae33885541d4d9afca61f'
    //   )
    // },
    filteredVisaTabs() {
      // Only show the current tab in the top bar for visa-process
      if (this.$route.name === 'visa-process') {
        // Find the current tab value from the route query or default
        let tab = this.$route.query.tab || 'new';
        let visaTabValue = '';
        switch (tab) {
          case 'new': visaTabValue = 'new visa process'; break;
          case 'renewal': visaTabValue = 'visa renewal'; break;
          case 'cancellation': visaTabValue = 'visa cancellation'; break;
          default: visaTabValue = 'new visa process';
        }
        return this.tabs_data.VisaProcess.filter(t => t.value === visaTabValue)
      }
      return this.tabs_data.VisaProcess
    },
  },
}
</script>
<style lang="css" scoped>
.nav__list_item {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.2px;
  line-height: 18px;
  cursor: pointer;
  display: flex;
  text-decoration: none;
  transition: all .3s linear;
  color: #495057;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px 6px 16px;
}

.nav__list_item:hover {
  background-color: #f5f5f5;
}

.active {
  background-color: #f5f5f5;
  border-left: 4px solid #4164e2;
}

/* More compact sidebar styling */
.dl__list_div {
  margin-bottom: 1px;
}

.v-list {
  padding-top: 4px !important;
}

.side_nav_icons {
  font-size: 20px !important;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  /* Remove color classes, color is now set via prop */
}

/* Collapsible menu styling */
.nav-group-title {
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.nav-group-title:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.group-toggle-icon {
  opacity: 0.7;
  transition: transform 0.3s ease;
}

.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.3s ease;
  overflow: hidden !important;
}

.v-expand-transition-enter,
.v-expand-transition-leave-to {
  height: 0 !important;
  opacity: 0;
}

/* Mobile responsiveness for the sidebar */
@media screen and (max-width: 960px) {
  .v-navigation-drawer {
    width: 100% !important;
    max-width: 260px;
  }

  .nav-group-title {
    font-size: 12px !important;
    padding: 6px 8px;
  }

  .nav__list_item {
    font-size: 13px;
    padding: 8px 12px 8px 16px;
  }

  .side_nav_icons {
    font-size: 16px !important;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.tw-animate-fadeIn {
  animation: fadeIn 0.25s cubic-bezier(0.4,0,0.2,1);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Custom logout modal backdrop with !important to override Vuetify conflicts */
.logout-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.6) !important;
}
</style>
