<template>
  <v-container fluid fill-height>
    <v-card class="no-border_shadow" color="card_bg" id="card">
      <v-card-title id="card-title" class="mb-4">
        <v-row class="vs_custom-list-header">
          <v-col cols="12" class="pa-0">
            <v-row class="d-flex justify-end align-center">
              <v-col cols="12" md="4">
                <h4 class="text--text h2 font-weight-bold">
                  Visa List
                </h4>
              </v-col>

              <v-col cols="12" md="8">
                <v-row class="d-flex justify-end align-center">
                  <v-col cols="auto" class="ma-0 pa-0">
                    <!-- clear all filters -->
                    <v-col class="d-flex justify-end ma-0 pa-0" cols="12">
                      <v-tooltip color="deep-purple lighten-5" top>
                        <template #activator="{ on, attrs }">
                          <v-btn color="blue-grey" class="white--text mx-2" fab v-on="on" v-bind="attrs" elevation="0"
                            @click="
                              filterDialog = false
                            clearFilter()
                              " small>
                            <v-icon small dark>
                              mdi-filter-remove-outline
                            </v-icon>
                          </v-btn>
                        </template>
                        <span class="deep-purple--text text--lighten-1">Clear all filters</span>
                      </v-tooltip>
                    </v-col>
                  </v-col>

                  <v-col cols="auto" class="ma-0 pa-0">
                    <v-btn v-for="(button, index) in filterStatusOptions" :key="index"
                      @click="handleClick(index, button.text)" :class="{ clicked: button.clicked }"
                      class="status_customer_btn pa-2 mr-1" value="inactive" outlined>
                      <span class="filter_btn pa-0">{{ button.text }}</span>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>

          <!-- filter visa list -->
          <v-col class="vs_custom-filter pa-0" cols="12">
            <v-row>
              <!-- sort by newest or oldest -->
              <v-col cols="12" sm="12" md="4">
                <v-select v-model="SelectedSort" :items="SortList" dense outlined label="Sort"
                  @change="handleFilterVisaProcess()" item-text="name" append-icon="mdi-menu-down" item-value="value"
                  persistent-hint />
              </v-col>
              <!-- sort by month -->
              <!-- <v-col cols="12" sm="12" md="4">
                    <v-autocomplete v-model="selectedMonth" :items="monthList" dense multiple outlined label="Month"
                      @change="handleFilterVisaProcess()" append-icon="mdi-menu-down" item-text="name"
                      item-value="value" persistent-hint />
                  </v-col> -->
              <!-- filter by employers -->
              <v-col cols="12" sm="12" md="4">
                <v-autocomplete v-model="selectedEmployers" :items="employers" :menu-props="{ maxHeight: '400' }"
                  label="Employers" dense @change="handleFilterVisaProcess()" outlined append-icon="mdi-menu-down"
                  item-text="company_name" item-value="_id" multiple persistent-hint />
              </v-col>
              <!-- filter by pro -->
              <v-col cols="12" sm="12" md="4">
                <v-select v-model="selectedPro" :items="proList" :menu-props="{ maxHeight: '400' }" label="Assign Pro"
                  dense item-text="first_name" item-value="_id" append-icon="mdi-menu-down"
                  @change="handleFilterVisaProcess()" multiple outlined persistent-hint />
              </v-col>
              <!-- filter by employees -->
              <!-- <v-col cols="12" sm="12" md="4">
                    <v-select v-model="selectedEmployees" :items="proList" :menu-props="{ maxHeight: '400' }"
                      label="Employees" multiple item-text="first_name" @change="handleFilterVisaProcess()"
                      item-value="_id" append-icon="mdi-menu-down" outlined dense persistent-hint />
                  </v-col> -->

              <v-col cols="12" sm="12" md="4">
                <!-- filter by date range -->
                <CustomDateFilter full-width enable-clear-date-filter :popup-nudge-left="0" append-icon="mdi-menu-down"
                  @selectedDateRanges="handleCustomDateFilter" label="Date Range" initial-filter="month" />
              </v-col>

              <v-col cols="12" sm="12" md="8">
                <v-text-field v-model="searchQuery" @keydown="searchDebounceAction" dense outlined
                  placeholder="Search here.." />
              </v-col>
            </v-row>

            <!-- <v-row class="pt-3">
                  <v-col class="ma-0 pa-0" @click="IntersectGetVisaProcessList">
                    <v-pagination v-model="PageNo" :length="totalPage" />
                  </v-col>
                </v-row> -->
          </v-col>

          <!-- filter visa list -->
        </v-row>
      </v-card-title>

      <v-progress-linear v-if="loadingUsers" indeterminate color="blue" />

      <div class="dl__list">
        <v-card-text id="card-text2" style="min-height: 600px; max-height:600px;" class=""
          v-if="visaProcessList.length > 0">
          <v-list class="customers_list_con">
            <v-list class="customers_list__con">
              <v-list-item-group>
                <ProcessListItem v-for="(item, index) in visaProcessList"
                  :class="[index !== visaProcessList.length - 1 ? 'border-b-sm' : '', selectedUser?._id == item._id ? 'selected' : '']"
                  :key="index" @clicked="VisaProcessClicked(item)" :avatar-src='item.user_image_url || "https://shorturl.at/h9ROo"'>
                  <template #title>
                    {{ `${item.first_name} ${item.last_name}` }}&nbsp;
                  </template>
                  <template #subtitle>
                    {{ item.company_name }}
                  </template>

                  <template #tags>
                    <Chip :chip-class="'pink'" :tooltip-color="'pink'" v-if="
                      item.user_location &&
                      item.user_location === 'Inside UAE'
                    " :tooltip-text="item.user_location">
                      <v-icon x-small class="white--text">
                        mdi-map-marker
                      </v-icon>
                    </Chip>

                    <Chip :chip-class="'cyan-darken-1'" :tooltip-color="'indigo-darken-3'" v-if="
                      item.visa_application_platform
                    " :tooltip-text="'Visa Application Platform'">
                    {{ item.visa_application_platform }}
                    </Chip>

                    <Chip :chip-class="'orange'" :tooltip-color="'orange'" v-if="
                      item.user_location &&
                      item.user_location === 'Outside UAE'
                    " :tooltip-text="item.user_location">
                      <v-icon x-small class="white--text">
                        mdi-airplane
                      </v-icon>
                    </Chip>

                    <Chip :chip-class="'blue'" :tooltip-color="'blue'" v-if="
                      item.employment_type &&
                      item.employment_type.includes('Work Permit')
                    " :tooltip-text="item.employment_type">
                      {{ item.employment_type | shorten_tag }}
                    </Chip>
                    <Chip :tooltip-color="'purple'" v-if="
                      item.employment_type &&
                      item.employment_type.includes('Mission Visa')
                    " :tooltip-text="item.employment_type">
                      {{ item.employment_type | shorten_tag }}
                    </Chip>
                    <Chip :chip-class="'blue-grey'" :tooltip-color="'blue-grey'" v-if="
                      item.employment_type &&
                      item.employment_type.includes('Employment')
                    " :tooltip-text="item.employment_type">
                      {{ item.employment_type | shorten_tag }}
                    </Chip>

                    <!-- Support Agent Display -->
                    <span v-if="item.support_agent && item.support_agent !== 'No Support Agent Assigned'"
                          class="text-xs italic grey--text text--darken-1 ml-2">
                      Support Agent: {{ item.support_agent }}
                    </span>
                  </template>

                  <template #action>
                    <v-row class="pa-0 ma-0">
                      <v-col class="pa-0 pa-0 d-flex justify-end" cols="12">
                        <v-icon small class="mr-2" color="primary">
                          mdi-calendar
                        </v-icon>
                        <span class="grey--text text--darken-1">{{
                          item.createdAt | formatDateWithoutTime
                          }}</span>
                      </v-col>
                      <v-col class="pa-0 d-flex justify-end mt-2" cols="12">
                        <Chip v-if="item.status == 'completed'" :tooltip-color="'green'"
                          :chip-class="'green white--text'" :tooltip-text="item.status">
                          {{ item.status }}
                        </Chip>
                        <Chip v-else-if="item.status == 'new'" :tooltip-color="'amber'"
                          :chip-class="'amber white--text'" :tooltip-text="item.status">
                          {{ item.status }}
                        </Chip>
                        <Chip v-else :tooltip-color="'deep-purple'" :chip-class="'deep-purple'"
                          :tooltip-text="item.status">
                          {{ item.status }}
                        </Chip>
                      </v-col>
                    </v-row>
                  </template>
                </ProcessListItem>
              </v-list-item-group>
            </v-list>
          </v-list>
        </v-card-text>
        <v-card-text style="min-height: 600px; max-height:600px;" v-if="!loadingUsers && visaProcessList.length == 0"
          id="card-text2" class="">
          <div style="width: 50% !important">
            <span class="span_btnB text-center">
              No users Found.
            </span>
          </div>
        </v-card-text>
      </div>
    </v-card>
    <v-snackbar :color="snackbar.color" v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.message }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CustomDateFilter from '@/components/reuseable/CustomDateFilter.vue'
import ProcessListItem from '../reuseable/ProcessListItem.vue'
import Chip from '../reuseable/Chip.vue'

export default {
  components: {
    filterIcon,
    customerDefaultIcon,
    LightArrow,
    CalenderSvg,
    CustomInputContainer,
    ProcessListItem,
    CustomDateFilter,
    Chip,
  },
  props: {
    currentTab: String,
    newProList: {
      type: Array,
      default: () => []
    },
    stageName: String,
    module: String,
  },
  watch: {
    searchQuery: {
      handler(val) {
        console.log('search is changing ...: ', val)
        if (val.length > 0) {
          this.searchDebounceAction()
        } else {
          this.getVisaProcessStatusList()
        }
      },
      immediate: true,
    }
  },
  data() {
    return {
      proList: [],
      filterSelectedStages: [],
      filterStatusOptions: [
        { text: 'New ', clicked: true, value: 'New' },
        { text: 'In Progress', clicked: false, value: 'In Progress' },
        { text: 'Completed', clicked: false, value: 'Completed' },
      ],
      searchQuery: '',
      filterDialog: false,
      PageNo: 1,
      totalResults: 0,
      totalPages: 0,
      limit: 10,
      comPage: 0,
      visaProcessList: [],
      selectedUser: {},
      allVisaProcessList: [],
      buttons: [
        { text: 'All ', clicked: false, value: '' },
        { text: 'Expired', clicked: false, value: 'expired' },
        { text: 'Valid', clicked: false, value: 'valid' },
        { text: 'Soon Expiring', clicked: false, value: 'soon' },
      ],
      selectedStatus: [],
      employers: [],
      selectedEmployers: [],
      selectedDateRange: {
        start: null,
        end: null,
      },
      employees: [],
      selectedEmployees: [],
      date_menu: false,
      estimate_date: '',
      exp_date_menu: false,
      exp_date: '',
      main_rule: [(v) => !!v || 'This filed is required'],
      SortList: [
        { name: 'Oldest to Newest', value: 'createdAt:asc' },
        { name: 'Newest to Oldest', value: 'createdAt:desc' },
      ],
      monthList: [
        { name: 'January', value: 1 },
        { name: 'February', value: 2 },
        { name: 'March', value: 3 },
        { name: 'April', value: 4 },
        { name: 'May', value: 5 },
        { name: 'June', value: 6 },
        { name: 'July', value: 7 },
        { name: 'August', value: 8 },
        { name: 'September', value: 9 },
        { name: 'October', value: 10 },
        { name: 'November', value: 11 },
        { name: 'December', value: 12 },
      ],
      SelectedSort: 'createdAt:desc',
      selectedMonth: '',
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      visaProcessStatusList: [],
      enableObserver: true,
      listing: 'search',
      selectedPro: '',
      totalPage: 0,
      loadingUsers: false,
      snackbar: {
        show: false,
        timeout: 3000,
        message: '',
        color: 'success',
      },
      pagination: {
        page: 1,
        limit: 30,
        totalPages: 0
      },
    }
  },
  methods: {
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleFilterSearch()
    }, 500),
    async getAllPro() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios
          .$get(`/users?role=PRO`, { headers: { Authorization: AuthStr } })
        this.proList = response

      } catch (error) {
        console.log('Error fetching PRO list: ', error)
        this.showMessage('Error fetching PRO list', false)
      }
    },
    showMessage(message, success = true) {
      this.snackbar = {
        show: true,
        timeout: 3000,
        message: message,
        color: success ? 'success' : 'red',
      };
    },
    handleClick(index, buttonText) {
      console.log("What is the button text", buttonText)
      this.filterStatusOptions[index].clicked =
        !this.filterStatusOptions[index].clicked
      this.filterSelectedStages = this.filterStatusOptions
        .filter((button) => button.clicked)
        .map((button) => button.value)
      this.handleFilterVisaProcess(buttonText)
    },
    async IntersectGetVisaProcessList() {
      this.loadingUsers = true;
      const AuthStr = 'Bearer '.concat(this.$store.state.token);

      try {
        let response;
        if (this.listing === 'search') {
          response = await this.$axios.$post(
            `/generic/search?page=${this.PageNo}&limit=${this.limit}`,
            {
              module: this.resolveModule(),
              search: this.searchQuery,
            },
            { headers: { Authorization: AuthStr } }
          );
        } else {
          response = await this.$axios.$post(
            `/generic/search?sortBy=${this.SelectedSort}&page=${this.PageNo}&limit=${this.limit}`,
            this.filter,
            { headers: { Authorization: AuthStr } }
          );
        }

        if (response.results && response.results.length > 0) {
          this.totalPages = response.totalPages;
          console.log("What are the total pages for this *****", response)
          this.totalResults = response.totalResults;
          this.visaProcessList = response.results;

          // check if selected process is in the new
          if (this.visaProcessList.length > 0) {
            this.VisaProcessClicked(this.visaProcessList[0])
          }

          // Emit updated list
          // this.$emit('fetchedVisaProcessList', this.visaProcessList);
        }
      } catch (error) {
        console.error('Error fetching visa process list:', error);
      } finally {
        this.loadingUsers = false;
      }
    },
    async handlePagination() {
      if (this.PageNo <= this.totalPage) {
        await this.IntersectGetVisaProcessList()
      }
    },
    // handleClick(index) {
    //     this.buttons[index].clicked = !this.buttons[index].clicked

    //     this.selectedStatus = this.buttons.filter(button => button.clicked).map(button => button.value)
    // },
    handleFilterSearch() {
      this.page = 0
      this.visaProcessList = []
      if (this.searchQuery != '') {
        this.listing = 'search'
        this.IntersectGetVisaProcessList()
      } else {
        this.listing = 'filter'
        this.filter = {
          // status: this.subStageName,
          module: this.module,
        }
        this.IntersectGetVisaProcessList()
      }
    },
    VisaProcessClicked(val) {
      this.$nuxt.$emit('VisaProcessListClicked', val)
      console.log('sending event: VisaProcessListClicked')
      this.selectedUser = val
      // this.$nuxt.$emit('VisaProcessListClicked', val)
    },
    async getEmployersList() {
      try {
        this.comPage++
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios
          .$post(
            `/companies/list/dropdown?page=${this.comPage}&limit=${10000}`,
            {},
            { headers: { Authorization: AuthStr } }
          )

        this.employers = response
      } catch (error) {
        console.error('Error fetching employers list:', error)
        this.showMessage('Error fetching employers list', false)
      }
    },
    async getEmployeesList() {
      try {
        this.page++
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = this.$axios
          .$post(
            `/users/list/dropdown?page=${this.page}&limit=${10000}`,
            {},
            { headers: { Authorization: AuthStr } }
          )
        this.employees = response
      } catch (error) {
        console.error('Error fetching employees list:', error)
        this.showMessage('Error fetching employees list', false)
      }
    },

    handleCustomDateFilter(ev) {
      this.selectedDateRange.start = ev.start
      this.selectedDateRange.end = ev.end
      this.handleFilterVisaProcess()
    },
    resolveModule() {
      if (this.module == 'new visa process') {
        return 'visa process'
      }
      if (this.module == 'visa renewal') {
        return 'visa renewal process'
      }
      return this.module
    },
    async handleFilterVisaProcess(buttonText) {
      try {
        this.PageNo = 1;
        this.visaProcessList = [];
        this.listing = 'filter';

        this.filter = {
          module: this.resolveModule(),
          start_date: this.selectedDateRange.start,
          end_date: this.selectedDateRange.end,
          selected_company_id: typeof this.selectedEmployers == 'string'
            ? [this.selectedEmployers]
            : this.selectedEmployers,
          // user_id: typeof this.selectedEmployees == 'string'
          //   ? [this.selectedEmployees]
          //   : this.selectedEmployees,
          status: this.filterSelectedStages,
          selected_pro: this.selectedPro,
          // selectedMonth: this.selectedMonth,
        };


        if (this.stageName) {
          this.filter.status = this.stageName.toLowerCase();
        }

        await this.IntersectGetVisaProcessList();

        if (this.visaProcessList.length > 0) {
          this.VisaProcessClicked(this.visaProcessList[0]);
        }
      } catch (error) {
        console.error('Error filtering visa process:', error.message)
        this.showMessage('Error filtering visa process', false)
      }
    },

    clearFilter() {
      this.selectedStatus = []
      this.selectedEmployees = []
      this.selectedEmployers = []
      this.selectedDateRange = {
        start: null,
        end: null,
      }
      this.selectedMonth = ''
      this.SelectedSort = 'createdAt:desc'
      this.selectedPro = ''

        //use default new tab after clear filters
        ; (this.filterStatusOptions = [
          { text: 'New ', clicked: true, value: 'New' },
          { text: 'In Progress', clicked: false, value: 'In Progress' },
          { text: 'Completed', clicked: false, value: 'Completed' },
        ]),
          (this.filterSelectedStages = this.filterStatusOptions
            .filter((button) => button.clicked)
            .map((button) => button.value))

      this.filter = {
        // status: this.subStageName,
        module: this.currentTab,
        filterStatus: this.filterSelectedStages,
      }

      this.initGetVisaProcessList()
    },
    async getVisaProcessStatusList(payload) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      const params = payload ? payload : {
        "stage_name": this.stageName,
        "section_name": this.module
      }
      this.loadingUsers = true
      try {
        const response = await this.$axios.$post(
          `/visaprocess/list/section/stage?page=${this.pagination.page}&limit=${this.pagination.limit}`,
          params,
          { headers: { Authorization: AuthStr } }
        );

        this.ShowList = false;
        this.visaProcessList = response.results;
        if (this.visaProcessList.length > 0) {
          console.log('clicked active user: ', this.visaProcessList)
          this.VisaProcessClicked(this.visaProcessList[0]);
        }
        this.ShowList = true;
        this.buttons = this.visaProcessStatusList.map((value) => {
          return {
            text:
              value.length > 0
                ? value.charAt(0).toUpperCase() + value.slice(1)
                : '',
            value: value,
            clicked: false,
          }
        })
      } catch (error) {
        console.error('Error generating visa process list:', error);
        this.ShowDetails = false;
      } finally {
        this.loadingUsers = false;
      }

    },

    async initGetVisaProcessList() {
      //use default new tab
      this.filterSelectedStages = this.filterStatusOptions
        .filter((button) => button.clicked)
        .map((button) => button.value)

      await this.handleFilterVisaProcess()
    },
    handleListingRefresh() {
      this.$nuxt.$emit('refresh-visa-listing');
    },
  },
  async mounted() {
    this.$nuxt.$on('update-process-list', async (payload) => {
      console.log('should call update-process-list', payload)
      // this.handleFilterVisaProcess()
      await this.getVisaProcessStatusList(payload)
    });


    await this.getEmployersList()
    await this.getEmployeesList()
    await this.getAllPro()
  },
  beforeDestroy() {
    this.$nuxt.$off('update-process-list');
  },
  computed: {
    clicked() {
      return this.clicked ? 'clicked' : ''
    },
  },
  watch: {
    // stageName: {
    //   immediate: true,
    //   handler(newValue) {
    //     if (newValue) {
    //       this.handleFilterVisaProcess()
    //     }
    //   },
    // },
    // PageNo: {
    //   handler(newPage) {
    //     if (newPage <= this.totalPages) {
    //       this.IntersectGetVisaProcessList();
    //     }
    //   }
    // }
  },
}
</script>
<style lang="css">
.chip__custom {
  font-size: 0.79rem !important;
  padding-bottom: 8px !important;
  padding-top: 8px !important;
}

.selected {
  background-color: #f0f0f0;
}
</style>
