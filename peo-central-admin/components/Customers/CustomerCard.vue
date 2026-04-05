<template>
  <div style="width: 100%">
    <v-row class="row1">
      <v-dialog id="custom_dialog" v-model="addNewEmployer" persistent scrollable>
        <v-card id="card" style="padding: 20px 30px !important">
          <v-card-title id="card-title">
            <h4 class="text--text">Add Client</h4>
            <v-icon small color="subtext" class="ml-5" @click="addNewEmployer = false">fa-close</v-icon>
          </v-card-title>
          <v-card-text id="card-text">
            <AddEmployer @close="closeAddEmployer" />
          </v-card-text>
        </v-card>
      </v-dialog>
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
                  <h5 class="text--text pb-5">Employers Added Date</h5>
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
                      @click="handleFilterEmployerList(), filterDialog = false">Done</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- / FILTER DIALOG -->
      <!-- Employers List column (12 - 5) -->
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-text id="card-text" style="margin-top: 0 !important">
            <v-row>
              <v-col cols="12" class="pl-0 pr-0">
                <div class="tw-flex tw-justify-between tw-items-center tw-w-full tw-flex-wrap tw-gap-4">
                  <!-- Search Bar Section -->
                  <div class="tw-flex tw-items-center">
                    <div class="search__bar">
                      <v-text-field
                        v-model="searchQuery"
                        value="value"
                        label="Search Employers"
                        solo
                        flat
                        hide-details
                        dense
                        background-color="searchbar"
                        @keyup="searchDebounceAction"
                        class="tw-w-[300px] tw-min-w-[250px]"
                      ></v-text-field>
                    </div>
                  </div>
                  <div class="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                    <!-- Download Excel Button -->
                    <div v-if="downloadInProgress" class="tw-flex tw-items-center">
                      <v-img src="/animated/refresh.svg" max-width="28" height="28" class="tw-mr-2" contain></v-img>
                    </div>
                    <v-btn v-else class="tall__btn subtext--text" color="subtext" outlined>
                      <DownloadExcel :get-data="handleDownloadExcel" type="xls" :name="excel_date"
                        @error="handleDownloadError">
                        <template #default>
                          <span class="tw-flex tw-items-center">
                            <v-icon left>mdi-download</v-icon>
                            Download Excel
                          </span>
                        </template>
                      </DownloadExcel>
                    </v-btn>

                    <!-- Filter Button -->
                    <v-btn class="tall__btn subtext--text" color="subtext" outlined @click="filterDialog = true">
                      <filterIcon />
                    </v-btn>

                    <!-- Onboarding Client Button -->
                    <v-btn class="tall__btn" color="primary" @click="goToOnboardings()">
                      Onboarding Client
                    </v-btn>

                    <!-- Add Client Button -->
                    <v-btn class="tall__btn" color="primary" @click="addNewEmployer = true">
                      Add Client
                    </v-btn>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" class="pl-0 pr-0">
                <!-- Skeleton loader -->
                <ClientCardSkeleton v-if="loading" />

                <!-- Actual client cards -->
                <div v-else class="d-flex custom_Employer_cards">
                  <template>
                    <v-card v-for="data in employerList" :key="data._id" class="employer_card mb-5"
                      style="text-align: center" @click="employerClicked(data._id)">
                      <template>
                        <div class="d-flex align-center flex-column justify-center">
                          <v-avatar class="mt-6" size="100px">
                            <v-img alt="Avatar" :src="data.logo" v-if="data.logo" />
                            <customerDefaultIcon style="border-radius: 50px" v-else />
                          </v-avatar>
                          <div class="ma-0 pa-0">
                            <span class="cardBtn accent4 white--text" v-if="data.status == 'active'">{{ data.status
                              }}</span>
                            <span class="cardBtn accent2 white--text" v-if="data.status == 'inactive'">{{ data.status
                              }}</span>
                            <span class="cardBtn accent3 white--text" v-if="data.status == 'new'">{{ data.status
                              }}</span>
                          </div>
                        </div>
                      </template>
                      <v-card-title class="d-flex align-center justify-center pt-3 pl-0 pr-0 employerCard__title">
                        {{ data.company_name }}
                      </v-card-title>
                      <v-card-subtitle class="pb-1 employerCard__subtitle">
                        {{ data.email }}
                      </v-card-subtitle>
                      <v-card-text class="employerCard__subtitle">
                        {{ data.phone }}
                      </v-card-text>
                    </v-card>
                  </template>
                  <!-- Observer -->
                  <Observer @intersect="intersectedEmployerList" />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>


<script>
import '@/assets/scss/utils/_customerCard.scss'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import Observer from '~/components/Observer.vue'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import AddEmployer from './AddEmployer.vue'
import moment from 'moment/moment'
import DownloadExcel from '~/components/ExcelExport/DownloadExcel.vue'
import goTo from 'vuetify/lib/services/goto'
import ClientCardSkeleton from '~/components/reuseable/ClientCardSkeleton.vue'
export default {
  components: {
    CalenderSvg,
    AddEmployer,
    filterIcon,
    Observer,
    customerDefaultIcon,
    DownloadExcel,
    ClientCardSkeleton,
  },
  data() {
    return {
      loading: true,
      addNewEmployer: false,
      startDate: new Date().toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      dateFrom: false,
      dateTo: false,
      startDate: '',
      endDate: '',
      reportLoading: false,
      filterDialog: false,
      downloadProgress: 0,
      downloadInProgress: false,
      date: '',
      employerStatus: [],
      buttons: [
        { text: 'All Status', value: '', clicked: false },
        { text: 'Active', value: 'active', clicked: false },
        { text: 'Inactive', value: 'inactive', clicked: false },
      ],
      filterDialog: false,
      limit: '12',
      page: 0,
      searchQuery: '',
      employerList: [],
      userStatusList: [],
      filter: {},
      listing: 'search',
      enableObserver: true,
    }
  },
  methods: {
    goToOnboardings() {
      this.$router.push('/enrollments')
    },
    closeAddEmployer() {
      this.addNewEmployer = false
    },
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleSearchEmployerList()
    }, 500),

    async intersectedEmployerList() {
      if (this.enableObserver == true) {
        this.page++;
        this.enableObserver = false
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (this.listing == 'search') {
          await this.$axios.$post(`/companies/list/filter/search?page=${this.page}&limit=${this.limit}`, { "search": this.searchQuery }, { headers: { Authorization: AuthStr } })
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
          await this.$axios.$post(`/companies/list/filter/search?page=${this.page}&limit=${this.limit}`, this.filter, { headers: { Authorization: AuthStr } })
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
      }
    },
    handleDownloadError(error) {
      this.$toast.error('Download failed. Please try again.')
      console.error('Download error:', error)
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
    async handleDownloadExcel() {
      try {
        this.downloadInProgress = true;
        this.downloadProgress = 0;

        const AuthStr = 'Bearer '.concat(this.$store.state.token);

        const response = await this.$axios({
          url: '/companies/export/data',
          method: 'GET',
          responseType: 'blob',
          headers: {
            Authorization: AuthStr
          },
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              this.downloadProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            }
          }
        });

        const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

      } catch (error) {
        console.error('Download failed:', error);
        this.$toast?.error?.('Download failed. Please try again.');
      } finally {
        this.downloadInProgress = false;
        this.downloadProgress = 0;
      }
    },
    //FILTER EMPLOYERS ON DATE *************************************************************************************
    handleFilterEmployerList() {
      this.page = 0;
      this.employerList = []
      this.listing = 'filter'
      this.loading = true
      this.filter = {
        "start_date": typeof this.startDate == 'string' ? [this.startDate] : this.startDate,
        "start_date": typeof this.endDate == 'string' ? [this.endDate] : this.endDate,
        "status": this.employerStatus
      };
      setTimeout(() => {
        this.intersectedEmployerList()
      }, 500)
    },

    async handleFilterEmployers() {
      this.page = 0;
      this.employerList = []
      this.listing = 'filter'
      this.loading = true
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
      this.$emit('SelectedCustomer', value)
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
    },
    excel_date() {
      return `clients_export_${new Date().toISOString().split('T')[0]}.xls`
    }
  },
}
</script>
<style scoped>
/* General styles */
.v-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

/* Dialog styles */
#custom_dialog .v-card {
  border-radius: 16px;
  overflow: hidden;
}

#card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e0e0e0;
}

#card-title h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

#card-text {
  padding: 30px;
}

/* Button styles */
.v-btn {
  text-transform: none;
  letter-spacing: 0.5px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.v-btn:hover {
  opacity: 0.9;
}

.tall__btn {
  height: 48px !important;
}

.customer_table_btn {
  border-radius: 20px;
  margin-right: 8px;
  padding: 0 16px;
}

.customer_table_btn.clicked {
  background-color: #e0e0e0;
}

/* Input styles */
.v-text-field.v-text-field--solo .v-input__control {
  min-height: 48px;
}

.v-text-field--outlined fieldset {
  border-color: #e0e0e0;
}

/* Employer card styles */
.employer_card {
  width: calc(25% - 20px);
  margin: 10px;
  transition: all 0.3s ease;
}

.employer_card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.employer_card .v-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cardBtn {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  margin-top: 10px;
}

.employerCard__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-top: 10px;
}

.employerCard__subtitle {
  font-size: 0.9rem;
  color: #666;
}

/* Responsive design */
@media (max-width: 1264px) {
  .employer_card {
    width: calc(33.33% - 20px);
  }
}

@media (max-width: 960px) {
  .employer_card {
    width: calc(50% - 20px);
  }
}

@media (max-width: 600px) {
  .employer_card {
    width: calc(100% - 20px);
  }
}
</style>
