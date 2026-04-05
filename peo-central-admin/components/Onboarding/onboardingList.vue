<template>
  <div>
    <v-row class="Leads_list_wrapper">
      <!-- FILTER DIALOG -->
      <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="550px" content-class="allDocs_dialog">
        <v-card id="card" style="padding: 20px 30px !important">
          <v-card-title id="card-title">
            <h4 class="text--text">Filter By</h4>
            <v-icon small color="subtext" class="ml-5" @click="filterDialog = false">fa-close</v-icon>
          </v-card-title>
          <v-card-text id="card-text">
            <v-container class="ma-0 pa-0">
              <v-row class="pb-0">
                <!-- Status filter section commented out -->
                <!-- <v-col cols="12" class="pa-0">
                  <h5 class="text--text pb-0">Status</h5>
                </v-col>
                <v-col cols="12" class="pl-0 pr-0 mb-4">
                  <v-btn v-for="(button, index) in buttons" :key="index" @click="handleClick(index)"
                    :class="{ clicked: button.clicked }" class="customer_table_btn pa-2 mr-1" value="inactive" outlined>
                    <span class="filter_btn pa-0">{{ button.text }}</span>
                  </v-btn>
                </v-col> -->
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text">Employers Added date</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                  <CustomInputContainer label="From">
                    <div slot="input">
                      <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                        transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="estimate_date" placeholder="mm/dd/yy" class="proposalDialog_date_field2"
                            solo dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker v-model="estimate_date" @input="date_menu = false" />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pr-0 pb-0">
                  <CustomInputContainer label="To">
                    <div slot="input">
                      <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40"
                        transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="exp_date" placeholder="mm/dd/yy" class="proposalDialog_date_field2" solo
                            dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker v-model="exp_date" @input="exp_date_menu = false" />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text">
                    Employees (filter out people under any specific onboarding
                    step)
                  </h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                  <div slot="input">
                    <v-select :items="employees" placeholder="Select Employee" solo dense multiple
                      v-model="selectedEmployees" item-text="first_name" item-value="_id"
                      class="proposalDialog_date_field2" v-if="employees.length >= 1" append-icon="fa-chevron-down">
                    </v-select>

                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Employee
                    </p>
                  </div>
                </v-col>
                <v-col cols="12" class="pa-0" v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)
                  ">
                  <h5 class="text--text">Employers</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0" v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)
                  ">
                  <div slot="input">
                    <v-select :items="employers" placeholder="Select Employers" solo dense multiple
                      v-model="selectedEmployers" item-text="company_name" item-value="_id"
                      class="proposalDialog_date_field2" v-if="employers.length >= 1" append-icon="fa-chevron-down">
                    </v-select>

                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Employers
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" class="ma-0 pa-0">
                  <div class="d-flex align-center justify-end">
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined><span class="" @click="
                      filterDialog = false
                    clearFilter()
                      ">Clear All</span></v-btn>
                    <v-btn class="tall__btn pl-6 pr-6" color="primary"
                      @click="; (filterDialog = false), handleFilterOnboarding()">Done</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- / FILTER DIALOG -->

      <!-- list column -->
      <v-col sm="12" md="12" lg="12">
        <v-card flat class="no-border_shadow" color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-title id="card-title" class="mb-4">
            <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
              <div style="width: 50% !important">
                <v-select label="All" class="ma-0 pa-0" flat solo append-icon="fa-chevron-down" hide-details dense
                  multiple :items="onboardingStatusList" v-model="selectedOnboardingType"
                  @change="handleFilterOnboardings(selectedOnboardingType)"></v-select>
              </div>
              <div class="d-flex align-center justify-end" style="width: 50%">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      class="short__btn mr-2"
                      :color="hasModalFilters ? 'primary' : 'subtext'"
                      :outlined="!hasModalFilters"
                      @click="filterDialog = true"
                      v-bind="attrs"
                      v-on="on"
                    >
                  <filterIcon />
                </v-btn>
                  </template>
                  <span v-if="hasModalFilters">Modal filters applied - Click to modify</span>
                  <span v-else>Click to apply filters</span>
                </v-tooltip>
                <v-btn @click="addNewEmployee()" class="short__btn" color="primary">New</v-btn>
              </div>
            </div>
          </v-card-title>
          <!-- Search Bar -->
          <div class="flex_row align-center top_barCustomer">
            <div class="search__bar">
              <v-text-field v-model="searchQuery" class="ml-1" @input="searchDebounceAction()" label="Search" solo flat
                hide-details background-color="searchbar"></v-text-field>
            </div>
          </div>
          <div class="dl__list">
            <v-card-text id="card-text2" style="max-height: 68vh" class="dl__list overflow-y-auto">
              <!-- selected Employer ID -->
              <v-list class="customers_list__con" v-if="loadingProcessList || !onboardingList.length || !selectedEmployeeLoaded">
                <ProcessListItemSkeleton v-for="i in 5" :key="i" />
              </v-list>
              <!-- Empty State for No Results -->
              <div v-else-if="visibleData.length === 0" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-px-8">
                <div class="tw-w-32 tw-h-32 tw-mb-6 tw-bg-gradient-to-br tw-from-blue-50 tw-to-indigo-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <svg class="tw-w-16 tw-h-16 tw-text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 class="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">No Onboardings Found</h3>
                <p class="tw-text-gray-500 tw-text-center tw-max-w-md tw-mb-6">
                  {{ searchQuery ?
                    `No onboardings match your search "${searchQuery}". Try adjusting your search terms.` :
                    'No onboardings match your current filters. Try adjusting your filter criteria or clear all filters to see all onboardings.'
                  }}
                </p>
                <div class="tw-flex tw-gap-3">
                  <v-btn
                    v-if="searchQuery || selectedOnboardingType.length > 0 || selectedStatus.length > 0"
                    @click="clearAllFiltersAndSearch()"
                    color="primary"
                    outlined
                    class="tw-px-6 tw-py-2"
                  >
                    <v-icon left small>fa-refresh</v-icon>
                    Clear Filters
                  </v-btn>
                  <v-btn
                    @click="addNewEmployee()"
                    color="primary"
                    class="tw-px-6 tw-py-2"
                  >
                    <v-icon left small>fa-plus</v-icon>
                    Add New Employee
                  </v-btn>
                </div>
              </div>
              <v-list class="customers_list__con" v-else-if="visibleData.length > 0">
                <v-list-item-group>
                  <ProcessListItem
                      v-for="(item, index) in visibleData"
                      :class="index !== (visibleData.length - 1) ? 'border-b-sm' : '' "
                      :key="index"
                      @clicked="EmployeeClicked(item)"
                      :avatarSrc='item.user_image_url || "https://shorturl.at/h9ROo"'>

                    <template v-slot:title>
                      <v-row justify="space-between">
                        <h5> {{`${item.first_name} ${item.last_name}` }}&nbsp; </h5>
                      </v-row>
                    </template>
                    <template v-slot:subtitle>
                      {{ item.company_name }}
                    </template>

                    <template v-slot:tags>

                      <Chip
                          :chipClass="'pink'"
                          :tooltipColor="'pink'"
                          v-if="
                            item.user_location &&
                            item.user_location === 'Inside UAE'
                          "
                          :tooltipText="item.user_location"
                        >
                          <v-icon x-small class="white--text"
                            >mdi-map-marker</v-icon
                          >
                        </Chip>

                        <Chip
                          :chipClass="'orange'"
                          :tooltipColor="'orange'"
                          v-if="
                            item.user_location &&
                            item.user_location === 'Outside UAE'
                          "
                          :tooltipText="item.user_location"
                        >
                          <v-icon x-small class="white--text"
                            >mdi-airplane</v-icon
                          >
                        </Chip>

                        <!-- status chip -->
                        <Chip
                          v-if="item.status == 'completed'"
                          :tooltipColor="'green'"
                          :chipClass="'green white--text'"
                          :tooltipText="item.status"
                        >
                          {{ item.status }}
                        </Chip>
                        <Chip
                          v-if="item.status == 'new'"
                          :tooltipColor="'amber'"
                          :chipClass="'amber white--text'"
                          :tooltipText="item.status"
                        >
                          {{ item.status }}
                        </Chip>

                        <Chip
                          :chipClass="'blue'"
                          :tooltipColor="'blue'"
                          v-if="
                            item.employment_type &&
                            item.employment_type.includes('Work Permit')
                          "
                          :tooltipText="item.employment_type"
                        >
                          {{ item.employment_type | shorten_tag }}
                        </Chip>
                        <Chip
                          :tooltipColor="'purple'"
                          v-if="
                            item.employment_type &&
                            item.employment_type.includes('Mission Visa')
                          "
                          :tooltipText="item.employment_type"
                        >
                          {{ item.employment_type | shorten_tag }}
                        </Chip>
                        <Chip
                          :chipClass="'blue-grey'"
                          :tooltipColor="'blue-grey'"
                          v-if="
                            item.employment_type &&
                            item.employment_type.includes('Employment')
                          "
                          :tooltipText="item.employment_type"
                        >
                          {{ item.employment_type | shorten_tag }}
                        </Chip>

                        <!-- Support Agent Icon with Tooltip -->
                        <v-tooltip bottom v-if="item.support_agent && item.support_agent !== 'No Support Agent Assigned'">
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                              size="18"
                              class="ml-2 grey--text text--darken-1"
                              v-bind="attrs"
                              v-on="on"
                            >
                              mdi-account-tie
                            </v-icon>
                          </template>
                          <span class="pa-2">
                            <strong>Support Agent:</strong> {{ item.support_agent }}
                          </span>
                        </v-tooltip>
                    </template>

                    <!-- <template v-slot:action>
                      <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                        <template v-slot:activator="{ attrs, on }">
                          <v-btn v-bind="attrs" v-on="on" color="subtext" icon>
                            <v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                        </template>
                      </v-menu>
                    </template> -->
                  </ProcessListItem>

                  <Observer @intersect="IntersectGetOnboardingList" />
                </v-list-item-group>
              </v-list>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
// calender.svg
import '@/assets/scss/utils/_customerListDetails.scss'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import EditSvg from '@/assets/images/Customer/edit.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import Observer from '~/components/Observer.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import ProcessListItem from '@/components/reuseable/ProcessListItem.vue'
import ProcessListItemSkeleton from '@/components/reuseable/ProcessListItemSkeleton.vue'
import Chip from '@/components/reuseable/Chip.vue'

export default {
  components: {
    customerDefaultIcon,
    DarkArrow,
    LightArrow,
    EditSvg,
    filterIcon,
    CalenderSvg,
    Observer,
    CustomInputContainer,
    ProcessListItem,
    ProcessListItemSkeleton,
    Chip
  },
  props: {
    selectedEmployee: String,
    activeFilter: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      searchQuery: '',
      all_onboarding_menu: [
        { title: 'All', value: 'all', locked: false },
        { title: 'Pending', value: 'active', locked: false },
        { title: 'Not Started', value: 'not_started', locked: false },
      ],
      //FILTER DIALOG BUTTONS
      buttons: [
        { text: 'All ', clicked: false, value: '' },
        { text: 'Expired', clicked: false, value: 'expired' },
        { text: 'Valid', clicked: false, value: 'valid' },
        { text: 'Soon Expiring', clicked: false, value: 'soon' },
      ],
      selected: 'All Leaves',
      months: 'Select',
      year: 'Select',
      leaves: ['All Leaves', 'Annual Leave', 'Sick Leave', 'Half Leave'],
      month: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      all_leaves_menu: [
        // { title: 'Invoice', value: 'new invoice', locked: false },
        { title: 'All Leave', value: 'all', locked: false },
        { title: 'Sick Leave', value: 'sick', locked: false },
        { title: 'Annual Leave', value: 'annual', locked: false },
      ],
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      listing: 'search',
      filter: {},
      filterDialog: false,
      date: '',
      companyStatus: '',
      date_menu: false,
      estimate_date: '',
      exp_date_menu: false,
      exp_date: '',
      limit: 1000,
      page: 1,
      employerPage: 0,
      employeePage: 0,
      onboardingList: [],
      selectedStatus: [],
      employers: [],
      selectedEmployers: [],
      employees: [],
      selectedEmployees: [],
      onboardingStatusList: [],
      selectedOnboardingType: [],
      enableObserver: true,
      loadingProcessList: true,
      selectedEmployeeLoaded: false,
      isApplyingFilter: false,
    }
  },
  computed: {
    hasActiveFilters() {
      return this.activeFilter ||
             this.searchQuery ||
             this.selectedOnboardingType.length > 0 ||
             this.selectedStatus.length > 0 ||
             this.selectedEmployers.length > 0 ||
             this.selectedEmployees.length > 0 ||
             this.estimate_date ||
             this.exp_date
    },
    hasModalFilters() {
      // Check specifically for modal filter dialog filters
      return this.selectedStatus.length > 0 ||
             this.selectedEmployers.length > 0 ||
             this.selectedEmployees.length > 0 ||
             this.estimate_date ||
             this.exp_date
    }
  },
  watch: {
    activeFilter(newValue, oldValue) {
      // Only apply filter if it's actually different from current state
      if (newValue && newValue !== oldValue) {
        this.applyFilterFromStats(newValue)
      } else if (!newValue && oldValue) {
        this.clearAllFiltersAndSearch()
      }
    }
  },
  methods: {
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleFilterSearch()
    }, 500),
    //Add New Employee Handle
    addNewEmployee() {
      this.$router.push('/Onboarding/new-employee')
    },
    //filterdialog
    handleClick(index) {
      this.buttons[index].clicked = !this.buttons[index].clicked
      this.selectedStatus = this.buttons
        .filter((button) => button.clicked)
        .map((button) => button.value)
    },
    //card handle id
    EmployeeClicked(val) {
      this.$emit('OnboardingEmployeeClicked', val)
      this.selectedEmployeeLoaded = true;
    },
    //listing
    async IntersectGetOnboardingList() {
      if (this.enableObserver == true) {
        this.page++
        this.enableObserver = false
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (this.listing == 'search') {
          await this.$axios
            .$post(
              `/generic/search?page=${this.page}&limit=${this.limit}`,
              { module: 'onboarding', search: this.searchQuery },
              { headers: { Authorization: AuthStr } }
            )
            .then((response) => {
              if (response.results.length > 0) {
                const lists = response.results
                this.onboardingList = [...this.onboardingList, ...lists]
                this.enableObserver = true // Re-enable only if we got results
              } else {
                this.page-- // No more results, stop infinite scroll
                // Don't re-enable observer - no more data to load
              }
            })
            .catch((error) => {
              this.page-- // Handle errors gracefully
              console.error('Search error:', error)
            })
        } else {
          await this.$axios
            .$post(
              `/generic/filter?page=${this.page}&limit=${this.limit}`,
              this.filter,
              { headers: { Authorization: AuthStr } }
            )
            .then((response) => {
              if (response.results.length > 0) {
                const lists = response.results
                this.onboardingList = [...this.onboardingList, ...lists]
                this.enableObserver = true // Re-enable only if we got results
              } else {
                this.page-- // No more results, stop infinite scroll
                // Don't re-enable observer - no more data to load
              }
            })
            .catch((error) => {
              this.page-- // Handle errors gracefully
              console.error('Filter error:', error)
            })
        }
      }
    },
    async getOnboardingList() {
      this.page = 0
      this.searchQuery = ''
      this.onboardingList = []
      this.listing = 'search'
      await this.IntersectGetOnboardingList()
      this.EmployeeClicked(this.onboardingList[0])
    },
    handleFilterSearch() {
      this.page = 0
      this.onboardingList = []
      this.listing = 'search'
      this.enableObserver = true // Reset observer for new search
      this.IntersectGetOnboardingList()
    },
    handleFilterOnboarding() {
      this.page = 0
      this.onboardingList = []
      this.listing = 'filter'
      this.enableObserver = true // Reset observer for new filter
      this.filter = {
        module: 'onboarding',
        start_date:
          typeof this.estimate_date == 'string'
            ? [this.estimate_date]
            : this.estimate_date,
        end_date:
          typeof this.exp_date == 'string' ? [this.exp_date] : this.exp_date,
        status: this.selectedStatus,
        company_id:
          typeof this.selectedEmployers == 'string'
            ? [this.selectedEmployers]
            : this.selectedEmployers,
        user_id:
          typeof this.selectedEmployees == 'string'
            ? [this.selectedEmployees]
            : this.selectedEmployees,
      }

      // Update dropdown to match modal filter
      if (this.selectedStatus.length > 0) {
        this.selectedOnboardingType = [...this.selectedStatus]
      } else {
        this.selectedOnboardingType = []
      }

      // Emit filter change to parent (use first status if available)
      const filterValue = this.selectedStatus.length > 0 ? this.selectedStatus[0] : null
      this.$emit('filterChanged', filterValue)

      this.IntersectGetOnboardingList()
    },
    clearFilter() {
      for (let index = 0; index < this.buttons.length; index++) {
        this.buttons[index].clicked = false
      }
      this.estimate_date = ''
      this.exp_date = ''
      this.selectedStatus = []
      this.selectedEmployees = []
      this.selectedEmployers = []
      this.filter = {
        module: 'onboarding',
      }
    },
    clearAllFiltersAndSearch() {
      // Reset pagination and observer
      this.page = 0
      this.enableObserver = true

      // Clear search
      this.searchQuery = ''

      // Clear dropdown filter
      this.selectedOnboardingType = []

      // Clear filter dialog
      this.clearFilter()

      // Reset listing type and clear list
      this.listing = 'search'
      this.onboardingList = []

      // Emit filter change to parent (this will clear activeFilter in parent)
      this.$emit('filterChanged', null)

      // Load fresh data
      this.IntersectGetOnboardingList()
    },
    applyFilterFromStats(filterValue) {
      // Prevent duplicate calls
      if (this.isApplyingFilter) return
      this.isApplyingFilter = true

      // Clear ALL existing filters first (without emitting)
      this.clearAllFiltersSilently()

      // Apply ONLY the stats card filter
      this.page = 0
      this.onboardingList = []
      this.listing = 'filter'
      this.enableObserver = true

      // Set ONLY the stats filter
      this.filter = { module: 'onboarding', status: [filterValue] }

      // Update dropdown selection
      this.selectedOnboardingType = [filterValue]

      // Load filtered data
      this.IntersectGetOnboardingList().finally(() => {
        this.isApplyingFilter = false
      })
    },
    clearAllFiltersSilently() {
      // Clear all filters without emitting events
      this.page = 0
      this.enableObserver = true

      // Clear search
      this.searchQuery = ''

      // Clear dropdown filter
      this.selectedOnboardingType = []

      // Clear all modal filters
      this.selectedStatus = []
      this.selectedEmployers = []
      this.selectedEmployees = []
      this.estimate_date = ''
      this.exp_date = ''

      // Reset filter dialog buttons
      for (let index = 0; index < this.buttons.length; index++) {
        this.buttons[index].clicked = false
      }

      // Reset filter object
      this.filter = {
        module: 'onboarding',
      }
    },
    async handleFilterOnboardings(data) {
      this.page = 0
      this.onboardingList = []
      this.listing = 'filter'
      this.enableObserver = true // Reset observer for new filter
      this.filter = { module: 'onboarding', status: data }

      // Emit filter change to parent
      this.$emit('filterChanged', data && data.length > 0 ? data[0] : null)

      this.IntersectGetOnboardingList()
    },
    async getOnboardingStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/onboardings/list/status`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.onboardingStatusList = response

          this.buttons = this.onboardingStatusList.map((value) => {
            return {
              text: value.charAt(0).toUpperCase() + value.slice(1),
              value: value,
              clicked: false,
            }
          })
        })
    },
    async getEmployersList() {
      this.employerPage++
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/companies/list/dropdown?page=${this.employerPage}&limit=${10000}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.employers = response
        })
    },
    async getEmployeesList() {
      this.employeePage = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/users/list/dropdown?page=${this.employeePage}&limit=${10000}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.employees = response
        })
    },
  },
  mounted() {
    this.getOnboardingList()
    this.getEmployersList()
    this.getEmployeesList()
    this.getOnboardingStatusList()

    setTimeout(() => { this.loadingProcessList = false }, 1200);
  },
  computed: {
    clicked() {
      return this.clicked ? 'clicked' : ''
    },
    visibleData() {
      let lists = []
      lists = _.orderBy(this.onboardingList, ['createdAt'], ['desc'])
      return lists
    },
  },
}
</script>
<style lang="scss">
.status__chip {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 1rem !important;

  .chip__custom {
    font-size: 0.79rem !important;
    padding-bottom: 6px !important;
    padding-top: 6px !important;
  }
}
</style>
