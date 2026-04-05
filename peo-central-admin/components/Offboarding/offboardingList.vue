<template>
  <div>
    <v-row>
      <!-- FILTER DIALOG -->
      <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="550px" content-class="allLeads_dialog">
        <v-card id="card" style="padding: 20px 30px !important">
          <v-card-title id="card-title">
            <h4 class="text--text">Filter</h4>
            <v-icon small color="subtext" class="ml-5" @click="filterDialog = false">fa-close</v-icon>
          </v-card-title>
          <v-card-text id="card-text">
            <v-container class="ma-0 pa-0">
              <v-row class="pb-0">
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text pb-0">Status</h5>
                </v-col>
                <v-col cols="12" class="pl-0 pr-0 mb-4">
                  <v-btn v-for="(button, index) in buttons" :key="index" @click="handleClick(index)"
                    :class="{ clicked: button.clicked }" class="customer_table_btn pa-2 mr-1" value="inactive" outlined>
                    <span class="filter_btn pa-0">{{ button.text }}</span>
                  </v-btn>
                </v-col>
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text">By Added date</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                  <CustomInputContainer label="From" :mandatory="true">
                    <div slot="input">
                      <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                        transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="estimate_date" placeholder="mm/dd/yy"
                            class="proposalDialog_date_field2" solo dense readonly v-bind="attrs" v-on="on"
                            :rules="main_rule">
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
                  <CustomInputContainer label="To" :mandatory="true">
                    <div slot="input">
                      <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40"
                        transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="exp_date" placeholder="mm/dd/yy" class="proposalDialog_date_field2"
                            solo dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
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
                  <h5 class="text--text">By Employees</h5>
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
                  <h5 class="text--text">By Employers</h5>
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
                    <v-btn @click="
                      filterDialog = false
                    clearFilter()
                      " class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined><span class="">Clear
                        All</span></v-btn>
                    <v-btn @click="
                                                                ; (filterDialog = false), handleFilterOffboarding()
                      " class="tall__btn pl-8 pr-8" color="primary">Done</v-btn>
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
        <v-card class="no-border_shadow" color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-title id="card-title" class="mb-4">
            <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
              <div style="width: 50% !important">
                <!-- <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                  <template v-slot:activator="{ attrs, on }">
                    <v-btn class="tall__btn pa-0 pr-2" color="transparent" v-bind="attrs" v-on="on">
                      <span class="span_btnB">To Offboard</span>
                      <LightArrow class="ml-7" style="max-width: 10px" />
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item v-for="(item, index) in all_offboarding_menu" :key="index" link
                      :class="item.locked ? 'disabledItem' : ''">
                      <v-list-item-title class="">
                        <v-icon v-if="item.locked" x-small class="pr-1">fa fa-lock</v-icon>
                        <span class="n_text text--text ml-2">{{
                          item.title
                        }}</span>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu> -->

                <v-select label="All" class="ma-0 pa-0" flat solo append-icon="fa-chevron-down" hide-details dense
                  multiple :items="computedOffboardingStatusListByOrder" item-text="type" item-value="type"
                  v-model="selectedOffboardingType"
                  @change="handleFilterOffboardings(selectedOffboardingType)"></v-select>
              </div>
              <div class="d-flex align-center justify-end" style="width: 50%">
                <v-btn class="short__btn subtext--text mr-2" color="subtext" outlined @click="filterDialog = true">
                  <filterIcon />
                </v-btn>
                <v-btn @click="addNewOffboardData()" class="short__btn" color="primary">New</v-btn>
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
            <v-card-text id="card-text2" style="max-height: 65vh" class="">
              <!-- selected Employer ID -->
              <v-list class="customers_list__con" v-if="loadingProcessList">
                <ProcessListItemSkeleton v-for="i in 5" :key="i" />
              </v-list>
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
                        <h5> {{ `${item.first_name} ${item.last_name}` }}&nbsp; </h5>
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
                      <template>
                        <Chip
                          v-if="item.status == 'completed'"
                          :tooltipColor="'green'"
                          :chipClass="'green white--text'"
                          :tooltipText="item.status"
                        >
                          {{ item.status }}
                        </Chip>
                        <Chip
                          v-else-if="item.status == 'new'"
                          :tooltipColor="'amber'"
                          :chipClass="'amber white--text'"
                          :tooltipText="item.status"
                        >
                          {{ item.status }}
                        </Chip>
                        <Chip
                          v-else
                          :tooltipColor="'deep-purple'"
                          :chipClass="'deep-purple'"
                          :tooltipText="item.status"
                        >
                          {{ item.status }}
                        </Chip>
                      </template>

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

                  <Observer @intersect="IntersectGetOffboardingList" />
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
  props: { selectedEmployee: String },
  data() {
    return {
      searchDebounceAction: _.debounce(async function (e) {
        await this.handleFilterSearch()
      }, 500),
      exitReason: ['Termination', 'Resignation', 'End Of Contract'],
      selectedOffboardingType: [],
      //all employees list
      all_offboarding_menu: [],
      //observer handle
      //pagination
      limit: '10',
      page: 0,
      //filtering List Customers
      searchQuery: '',

      // APIs Data
      companiesList: [],
      filteredCompanies: [],

      //rules
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      buttons: [
        { text: 'All ', clicked: false, value: '' },
        { text: 'Expired', clicked: false, value: 'expired' },
        { text: 'Valid', clicked: false, value: 'valid' },
        { text: 'Soon Expiring', clicked: false, value: 'soon' },
      ],

      //date pickers
      exp_date_menu: false,
      offboardingList: [],
      exp_date: '',
      date_menu: false,
      estimate_date: '',
      filterDialog: false,
      limit: '1000',
      page: 1,
      employerPage: 0,
      employeePage: 0,
      OffboardingList: [],
      selectedStatus: [],
      employers: [],
      selectedEmployers: [],
      employees: [],
      selectedEmployees: [],
      offboardingStatusList: [],
      enableObserver: true,
      loadingProcessList: true,
    }
  },
  methods: {
    addNewOffboardData() {
      this.$router.push('/Offboarding/new-EmployeeProcess')
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
      this.$emit('OffboardingEmployeeClicked', val)
    },
    //listing
    async IntersectGetOffboardingList() {
      if (this.enableObserver == true) {
        this.enableObserver = false
        this.page++
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (this.listing == 'search') {
          await this.$axios
            .$post(
              `/generic/search?page=${this.page}&limit=${this.limit}`,
              { module: 'offboarding', search: this.searchQuery },
              { headers: { Authorization: AuthStr } }
            )
            .then((response) => {
              this.enableObserver = true
              if (response.results.length > 0) {
                const lists = response.results
                this.offboardingList = [...this.offboardingList, ...lists]
              } else {
                this.page--
              }
            })
        } else {
          await this.$axios
            .$post(
              `/generic/filter?page=${this.page}&limit=${this.limit}`,
              this.filter,
              { headers: { Authorization: AuthStr } }
            )
            .then((response) => {
              this.enableObserver = true
              if (response.results.length > 0) {
                const lists = response.results
                this.offboardingList = [...this.offboardingList, ...lists]
              } else {
                this.page--
              }
            })
        }
      }
    },
    async getOffboardingList() {
      this.page = 0
      this.searchQuery = ''
      this.offboardingList = []
      this.listing = 'search'
      await this.IntersectGetOffboardingList()
      this.EmployeeClicked(this.offboardingList[0])
    },
    handleFilterSearch() {
      this.page = 0
      this.offboardingList = []
      this.listing = 'search'
      this.IntersectGetOffboardingList()
    },
    handleFilterOffboarding() {
      this.page = 0
      this.offboardingList = []
      this.listing = 'filter'
      this.filter = {
        module: 'offboarding',
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
      this.IntersectGetOffboardingList()
    },
    clearFilter() {
      this.estimate_date = ''
      this.exp_date == ''
      this.selectedStatus = []
      this.selectedEmployees = []
      this.selectedEmployers = []
      this.filter = {
        module: 'offboarding',
      }
      this.getOffboardingList()
    },
    async handleFilterOffboardings(data) {
      this.page = 0
      this.offboardingList = []
      this.listing = 'filter'
      this.filter = { module: 'offboarding', status: data }
      this.IntersectGetOffboardingList()
    },
    async getOffboardingStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/offboardings/list/status`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.offboardingStatusList = response

          this.buttons = this.offboardingStatusList.map((value) => {
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
    this.getEmployersList()
    this.getEmployeesList()
    this.getOffboardingList()
    this.getOffboardingStatusList()
    setTimeout(() => { this.loadingProcessList = false }, 1200);
  },
  computed: {
    clicked() {
      return this.clicked ? 'clicked' : ''
    },
    visibleData() {
      let lists = []
      lists = _.orderBy(this.offboardingList, ['createdAt'], ['desc'])
      return lists
    },
    computedOffboardingStatusListByOrder() {
      return this.offboardingStatusList.length > 0
        ? this.offboardingStatusList.sort()
        : []
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
