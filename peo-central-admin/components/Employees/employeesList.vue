<template>
  <div>
    <v-row>
      <!-- FILTER DIALOG -->
      <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="500px">
        <v-card id="card" style="padding: 20px 30px !important">
          <v-card-title id="card-title">
            <h4 class="text--text">Filter By</h4>
            <v-icon small color="subtext" class="ml-5" @click="filterDialog = false">fa-close</v-icon>
          </v-card-title>
          <v-card-text id="card-text">
            <v-container class="ma-0 pa-0">
              <v-row class="pb-0">
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text">Status</h5>
                </v-col>
                <v-col cols="12" class="pl-0 pr-0 mb-4">
                  <v-btn v-for="(button, index) in buttons" :key="index" @click="handleClick(index)"
                    :class="{ clicked: button.clicked }" :value="button.value" class="customer_table_btn pa-2 mr-1"
                    outlined>
                    <span class="filter_btn pa-0">{{ button.text }}</span>
                  </v-btn>
                </v-col>
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text pb-5">Employee Added Date</h5>
                </v-col>
                <v-col cols="6" class="filter_date_column pl-0 pr-0 pt-0 pb-0">
                  <div class="filter_date_icon">
                    <CalenderSvg />
                  </div>
                  <v-dialog ref="from" v-model="dateFrom" :return-value.sync="date" persistent width="290px">
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="startDate" label="From" outlined v-on="on" Append-inner="fa-calendar">
                      </v-text-field>
                    </template>

                    <v-date-picker v-model="startDate" scrollable>
                      <v-spacer></v-spacer>
                      <v-btn flat color="primary" @click="dateFrom = false">Cancel</v-btn>
                      <v-btn flat color="primary" @click="$refs.from.save(date)">OK</v-btn>
                    </v-date-picker>
                  </v-dialog>
                </v-col>
                <v-col cols="6" class="filter_date_column pr-0 pt-0 pb-0">
                  <div class="filter_date_icon">
                    <CalenderSvg />
                  </div>
                  <v-dialog ref="to" v-model="dateTo" :return-value.sync="date" persistent width="290px">
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="endDate" label="To" outlined v-on="on"></v-text-field>
                    </template>

                    <v-date-picker v-model="endDate" scrollable>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" @click="dateTo = false">Cancel</v-btn>
                      <v-btn color="primary" @click="$refs.to.save(date)">OK</v-btn>
                    </v-date-picker>
                  </v-dialog>
                </v-col>
                <v-col cols="12" class="ma-0 pa-0">
                  <div class="d-flex align-center justify-end">
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined
                      @click="filterDialog = false; clearFilter()"><span class="">Clear All</span></v-btn>
                    <v-btn class="tall__btn pl-6 pr-6" color="primary"
                      @click="page = 0, handleFilterEmployeeList(), filterDialog = false">Done</v-btn>
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
        <v-card color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-title id="card-title" class="mb-4">
            <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
              <div style="width: 50% !important">
                <v-select label="All" class="ma-0 pa-0" flat solo append-icon="fa-chevron-down" hide-details dense
                  multiple :items="computedUserStatusListByOrder" v-model="employeeStatus"
                  @change="handleFilterEmployees" />
              </div>
              <div class="d-flex align-center justify-end" style="width: 50%">
                <v-btn class="tall__btn subtext--text" color="subtext" outlined @click="filterDialog = true">
                  <filterIcon />
                </v-btn>
              </div>
            </div>

          </v-card-title>
          <!-- Search Bar -->
          <div class="flex_row align-center top_barCustomer">
            <div class="search__bar">
              <v-text-field v-model="searchQuery" class="ml-1" label="Search" solo flat hide-details
                background-color="searchbar" @keyup="searchDebounceAction">
              </v-text-field>
            </div>
          </div>
          <!-- loader -->
          <div class="mt-2">
            <v-progress-linear :active="loading" :indeterminate="loading" color="primary"></v-progress-linear>
          </div>
          <div class="dl__list">
            <v-card-text id="card-text2" style="max-height: 65vh; overflow-y: auto;" class="scrollable-content">
              <!-- Skeleton loader for side list -->
              <ProcessListItemSkeleton v-if="loading && (!employeeList || employeeList.length === 0)" />
              <!-- selected Employee ID -->
              <v-list class="customers_list__con" ref="employeeListing" v-if="!loading || (employeeList && employeeList.length > 0)">
                <v-list-item-group v-model="model_select_list">
                  <v-list-item class="pa-0 employee-card" v-for="(item, index) in employeeList" :key="index"
                    @click="employeeClicked(item._id)">
                    <v-list-item-icon class="mx-1">
                      <v-img :src="item.image_url" style="border-radius: 50px" width="60" height="60"
                        v-if="item.image_url" />
                      <customerDefaultIcon style="border-radius: 50px" v-else />
                    </v-list-item-icon>
                    <v-list-item-content class="d-flex justify-md-space-between align-center">
                      <v-list-item-title class="ml-3 d-flex flex-column">
                        <h5>{{ item.first_name }} {{ item.last_name }}</h5>
                        <span class="span_text">{{ item.company_name }}</span>
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                      <template v-slot:activator="{ }">
                        <v-btn color="subtext" icon>
                          <v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                      </template>
                    </v-menu>
                  </v-list-item>
                  <!-- Infinite scroll loading indicator -->
                  <div id="infinite-scroll-trigger" class="full-width" v-if="employeeList.length > 0"
                    v-intersect="{ handler: loadMore, options: { threshold: 0.5 } }">
                    <template v-if="loadingMore">
                      <div class="pa-2 text-center">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="24"
                          class="mr-2"
                        ></v-progress-circular>
                        <span class="caption grey--text">Loading more employees...</span>
                      </div>
                      <v-skeleton-loader v-for="number in 3" :key="number" type="list-item-avatar-three-line" />
                    </template>
                    <template v-else-if="employeeList.length >= pagination.totalCount">
                      <div class="pa-3 text-center">
                        <span class="caption grey--text">All employees loaded ({{ pagination.totalCount }} records)</span>
                      </div>
                    </template>
                  </div>
                </v-list-item-group>
              </v-list>
              <!-- <div>
                <v-skeleton-loader v-for="number in 8" :key="number" type="list-item-avatar-three-line" />
              </div> -->
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
import '@/assets/scss/utils/_infiniteScroll.scss' // Import infinite scroll styles
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import EditSvg from '@/assets/images/Customer/edit.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import Observer from '~/components/Observer.vue'
import ProcessListItemSkeleton from '@/components/reuseable/ProcessListItemSkeleton.vue'


export default {
  components: {
    customerDefaultIcon,
    DarkArrow,
    LightArrow,
    EditSvg,
    filterIcon,
    CalenderSvg,
    Observer,
    ProcessListItemSkeleton
  },
  props: { selectedEmployee: String },
  data() {
    return {
      //all employees list
      all_employees_menu: [
        // { title: 'Invoice', value: 'new invoice', locked: false },
        { title: 'All', value: 'all', locked: false },
        { title: 'Active', value: 'active', locked: false },
        { title: 'Inactive', value: 'inactive', locked: false },
        { title: 'Onboarding', value: 'onboarding', locked: false }

      ],
      //pagination
      limit: '10',
      page: 0,
      //filtering List Customers
      searchQuery: '',

      // APIs Data
      employeeList: [],
      filteredCompanies: [],
      buttons: [
        { text: 'All Status', value: '', clicked: false },
        { text: 'Active', value: 'active', clicked: false },
        { text: 'Inactive', value: 'inactive', clicked: false }
      ],
      //date pickers
      startDate: new Date().toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      dateFrom: false,
      dateTo: false,
      startDate: '',
      endDate: '',
      filterDialog: false,
      date: '',
      employeeStatus: [],
      userStatusList: [],
      model_select_list: null,
      filter: {},
      listing: 'search',
      enableObserver: true,
      loadingMore: false,
      loading: true,
      employeeListing: null,
      pagination: {
        page: 1,
        totalCount: 100,
        limit: 20,
        itemStartIndex: 0,
        itemEndIndex: 20,
      },
    }
  },
  methods: {
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleSearchEmployeeList()
    }, 500),
    findIndex(array, key, value) {
      var index = array.findIndex(function (element) {
        return element[key] == value
      })
      return index
    },
    scrollToUserCard(index) {
      const employeeCard = this.$refs.employeeListing.$el.querySelector(".employee-card");
      const row = employeeCard[index];
      if (row) {
        row.scrollIntoView(true);
      }
    },
    async loadMore(entries, observer, isIntersecting) {
      // Only trigger if:
      // 1. Element is intersecting viewport
      // 2. We're not already loading data
      // 3. We haven't loaded all records yet
      if (isIntersecting && !this.loadingMore) {
        const indexesLeft = this.pagination.totalCount - this.pagination.itemEndIndex;
        if (indexesLeft > 0) {
          this.loadingMore = true

          // Increment the page number
          this.pagination.page += 1

          try {
            await this.intersectedEmployeeList();
            // Update pagination tracking
            this.pagination.itemStartIndex = this.pagination.itemEndIndex;
            this.pagination.itemEndIndex = this.employeeList.length;

            // Debugging info
            console.log(`Loaded more employees: ${this.employeeList.length} of ${this.pagination.totalCount} total`);
          } catch (error) {
            console.error('Error loading more employees:', error);
          } finally {
            this.loadingMore = false;
          }
        } else {
          console.log('All employees loaded, no more to fetch');
        }
      }
    },
    async intersectedEmployeeList() {
      // Only show main loading indicator on initial load
      if (this.pagination.page === 1) {
        this.loading = true;
      }

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const url = `/users/list/sort/filter?page=${this.pagination.page}&limit=${this.pagination.limit}`
        let response;

        if (this.listing === 'search') {
          response = await this.$axios.$post(url, { 'search': this.searchQuery }, { headers: { Authorization: AuthStr } })
          if (response?.results && response.results.length > 0) {
            this.$set(this, 'employeeList', [...this.employeeList, ...response.results])
          }
        } else {
          response = await this.$axios.$post(url, this.filter, { headers: { Authorization: AuthStr } })
          if (response?.results && response.results.length > 0) {
            this.$set(this, 'employeeList', [...this.employeeList, ...response.results])
          }
        }

        // Update pagination values from API response
        if (response) {
          this.pagination.page = Number(response.page)
          this.pagination.totalCount = Number(response.totalResults)
          this.pagination.limit = Number(response.limit)

          // Log pagination info for debugging
          console.log(`Loaded page ${this.pagination.page} of ${Math.ceil(this.pagination.totalCount / this.pagination.limit)}, ${this.employeeList.length} of ${this.pagination.totalCount} total records`)
        }

        this.model_select_list = this.findIndex(this.employeeList, '_id', this.selectedEmployee)
      } catch (error) {
        console.error('Failed to load employee list:', error.message)
      }
      finally {
        this.loading = false
      }

    },
   async getEmployeeList() {
      this.page = 0
      this.searchQuery = ''
      this.employeeList = []
      this.listing = 'search'
      // Reset pagination for new data fetch
      this.pagination.page = 1
      this.pagination.itemStartIndex = 0
      this.pagination.itemEndIndex = 0
      await this.intersectedEmployeeList()
    },
   async handleSearchEmployeeList() {
      this.page = 0
      this.employeeList = []
      this.listing = 'search'
      // Reset pagination for search
      this.pagination.page = 1
      this.pagination.itemStartIndex = 0
      this.pagination.itemEndIndex = 0
      await this.intersectedEmployeeList()
    },

    //FILTER EMPLOYERS ON DATE *************************************************************************************
    handleFilterEmployeeList() {
      this.page = 0
      this.employeeList = []
      this.listing = 'filter'
      // Reset pagination for filter
      this.pagination.page = 1
      this.pagination.itemStartIndex = 0
      this.pagination.itemEndIndex = 0
      this.filter = {
        'startDate': typeof this.startDate == 'string' ? [this.startDate] : this.startDate,
        'endDate': typeof this.endDate == 'string' ? [this.endDate] : this.endDate,
        'status': this.employeeStatus
      }
      this.intersectedEmployeeList()
    },

    async handleFilterEmployees() {
      this.page = 0
      this.employeeList = []
      this.listing = 'filter'
      // Reset pagination for filter
      this.pagination.page = 1
      this.pagination.itemStartIndex = 0
      this.pagination.itemEndIndex = 0
      this.filter = {
        'status': this.employeeStatus
      }
      this.intersectedEmployeeList()
    },

    async clearFilter() {
      this.startDate = ''
      this.endDate = '' // Fixed comparison operator (was ==)
      this.employeeStatus = []
      this.params = {}
      this.filter = {}
      // Reset pagination
      this.pagination.page = 1
      this.pagination.itemStartIndex = 0
      this.pagination.itemEndIndex = 0
      await this.getEmployeeList()
    },

    //filter dialog
    handleClick(index) {
      this.buttons[index].clicked = !this.buttons[index].clicked

      this.employeeStatus = this.buttons.filter(button => button.clicked).map(button => button.value)
    },
    employeeClicked(value) {
      this.$emit('employeeClicked', value)
    },
    async getUsersStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/users/list/status`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.userStatusList = response
          this.buttons = this.userStatusList
            .filter((value) => value && typeof value === 'string' && value.trim() !== '')
            .map((value) => {
              return {
                text: value.charAt(0).toUpperCase() + value.slice(1),
                value: value,
                clicked: false
              }
            })
        })
    }
  },
  async mounted() {
    await Promise.all([
      this.getUsersStatusList(),
      this.getEmployeeList()
    ])
  },
  computed: {
    computedUserStatusListByOrder() {
      if (this.userStatusList.length > 0) {
        this.userStatusList = this.userStatusList
          .filter((item) => item && typeof item === 'string' && item.trim() !== '')
          .map((item) => item.charAt(0).toLowerCase() + item.slice(1))
        this.userStatusList.sort()
        return this.userStatusList
      }
    }
  }
}
</script>
