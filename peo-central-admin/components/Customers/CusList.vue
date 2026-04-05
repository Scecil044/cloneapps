<template>
  <div>
    <!-- Show skeleton loader while loading -->
    <CusListSkeleton v-if="loading" />
    
    <v-row v-else>
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
                  <h5 class="text--text pb-5">Employer Added Date</h5>
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
                      @click="page = 0, handleFilterEmployerList(), filterDialog = false">Done</v-btn>
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
                  multiple :items="computedUserStatusListByOrder" v-model="employerStatus"
                  @change="handleFilterEmployers" />
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
          <div class="dl__list">

            <v-card-text id="card-text2" style="max-height: 65vh" class="">
              <!-- selected Employer ID -->
              <v-list class="customers_list__con">
                <v-list-item-group v-model="model_select_list">
                  <v-list-item class="pa-0" v-for="(item, index) in employerList" :key="index"
                    @click="employerClicked(item._id)">
                    <v-list-item-icon class="mx-1">
                      <v-img :src="item.logo" style="border-radius: 50px" width="60" height="60" v-if="item.logo" />
                      <customerDefaultIcon style="border-radius: 50px" v-else />
                    </v-list-item-icon>
                    <v-list-item-content class="d-flex justify-md-space-between align-center">
                      <v-list-item-title class="ml-3">
                        <h5>{{ item.company_name }}</h5>
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                      <template v-slot:activator="{}">
                        <v-btn color="subtext" icon>
                          <v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                      </template>
                    </v-menu>
                  </v-list-item>
                  <Observer @intersect="intersectedEmployerList" />
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
import CusListSkeleton from '~/components/reuseable/CusListSkeleton.vue'


export default {
  components: {
    customerDefaultIcon,
    DarkArrow,
    LightArrow,
    EditSvg,
    filterIcon,
    CalenderSvg,
    Observer,
    CusListSkeleton,
  },
  props: { selectedEmployer: String },
  data() {
    return {
      loading: true,
      //all employers list
      all_employers_menu: [
        // { title: 'Invoice', value: 'new invoice', locked: false },
        { title: 'All', value: 'all', locked: false },
        { title: 'Active', value: 'active', locked: false },
        { title: 'Inactive', value: 'inactive', locked: false },
        { title: 'Onboarding', value: 'onboarding', locked: false },

      ],
      //pagination
      limit: '10',
      page: 0,
      //filtering List Customers
      searchQuery: '',

      // APIs Data
      employerList: [],
      filteredCompanies: [],
      buttons: [
        { text: 'All Status', value: '', clicked: false },
        { text: 'Active', value: 'active', clicked: false },
        { text: 'Inactive', value: 'inactive', clicked: false },
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
      employerStatus: [],
      userStatusList: [],
      model_select_list: null,
      filter: {},
      listing: 'search',
      enableObserver: true,
    }
  },
  methods: {
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleSearchEmployerList()
    }, 500),
    findIndex(array, key, value) {
      var index = array.findIndex(function (element) {
        return element[key] == value
      });
      return index
    },

    async intersectedEmployerList() {
      if (this.enableObserver == true) {
        this.page++;
        this.enableObserver = false
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (this.listing == 'search') {
          await this.$axios.$post(`companies/list/filter/search?page=1&limit=10000`, { "search": this.searchQuery }, { headers: { Authorization: AuthStr } })
            .then((response) => {
              this.loading = false
              this.enableObserver = true
              if (response.length > 0) {
                const lists = response;
                this.employerList = [...this.employerList, ...lists];
              }
              else {
                this.page--;
              }
            })
            .catch((err) => {
              this.loading = false
              console.log(err)
            })
        }
        else {
          await this.$axios.$post(`companies/list/filter/search?page=1&limit=10000`, this.filter, { headers: { Authorization: AuthStr } })
            .then((response) => {
              this.loading = false
              this.enableObserver = true
              if (response.length > 0) {
                const lists = response;
                this.employerList = [...this.employerList, ...lists];
              }
              else {
                this.page--;
              }
            })
            .catch((err) => {
              this.loading = false
              console.log(err)
            })
        }
        this.model_select_list = this.findIndex(this.employerList, '_id', this.selectedEmployer)
      }
    },
    getEmployerList() {
      this.page = 0;
      this.searchQuery = ''
      this.employerList = []
      this.listing = 'search'
      this.loading = true
      setTimeout(() => {
        this.intersectedEmployerList()
      }, 800)
    },
    handleSearchEmployerList() {
      this.page = 0;
      this.employerList = []
      this.listing = 'search'
      this.loading = true
      setTimeout(() => {
        this.intersectedEmployerList()
      }, 500)
    },

    //FILTER EMPLOYERS ON DATE *************************************************************************************
    handleFilterEmployerList() {
      this.page = 0;
      this.employerList = []
      this.listing = 'filter'
      this.loading = true
      this.filter = {
        "start_date": typeof this.startDate == 'string' ? [this.startDate] : this.startDate,
        "end_date": typeof this.endDate == 'string' ? [this.endDate] : this.endDate,
        "status": this.employerStatus
      };
      setTimeout(() => {
        this.intersectedEmployerList()
      }, 500)
    },

    async handleFilterEmployers() {
      this.page = 0;
      this.employerList = []
      this.loading = true
      this.listing = 'filter'
      this.filter = {
        "status": this.employerStatus
      };
      setTimeout(() => {
        this.intersectedEmployerList()
      }, 500)
    },

    async clearFilter() {
      this.startDate = ''
      this.endDate == ''
      this.employerStatus = []
      this.params = {}
      this.getEmployerList()
    },

    //filter dialog
    handleClick(index) {
      this.buttons[index].clicked = !this.buttons[index].clicked

      this.employerStatus = this.buttons.filter(button => button.clicked).map(button => button.value)
    },
    employerClicked(value) {
      this.$emit('employerClicked', value)
    },
    async getUsersStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/companies/status/list`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.userStatusList = response
          this.buttons = this.userStatusList.map((value) => {
            return {
              text: value.charAt(0).toUpperCase() + value.slice(1),
              value: value,
              clicked: false
            }
          })
        })
    },
  },
  mounted() {
    this.getUsersStatusList()
    this.getEmployerList()
  },
  computed: {
    computedUserStatusListByOrder() {
      if (this.userStatusList.length > 0) {
        this.userStatusList = this.userStatusList.map((item) => item.charAt(0).toLowerCase() + item.slice(1));
        this.userStatusList.sort()
        return this.userStatusList;
      }
    }
  },
}
</script>
