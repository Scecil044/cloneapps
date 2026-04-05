<template>
  <div style="width: 100%">
    <v-row class="row1">
      <v-dialog id="custom_dialog" v-model="addNewEmployee" persistent scrollable>
        <v-card id="card" style="padding: 20px 30px !important">
          <v-card-title id="card-title">
            <h4 class="text--text">Add Employee</h4>
            <v-icon small color="subtext" class="ml-5" @click="addNewEmployee = false">fa-close</v-icon>
          </v-card-title>
          <v-card-text id="card-text">
            <AddEmployee @close="closeAddEmployee" @employee-created="refreshEmployeeList" />
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
                      @click="handleFilterEmployeeList(), filterDialog = false">Done</v-btn>
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
                <div class="top__con d-flex justify-lg-space-between align-center">
                  <div class="flex_row align-center top_barCustomer">
                    <div class="search__bar">
                      <v-text-field v-model="searchQuery" value="value" class="ml-1" label="Search Employees" solo flat
                        hide-details dense background-color="searchbar" @input="debouncedSearch"></v-text-field>
                    </div>
                  </div>
                  <div class="d-flex">
                    <div class="ml-6" v-if="reportLoading">
                      <v-img src="/animated/refresh.svg" max-width="28" height="28" class="mr-2" contain></v-img>
                    </div>
                    <v-btn class="tall__btn subtext--text mr-4" color="subtext" outlined v-else>
                      <DownloadExcel :get-data="handleDownloadExcel" type="xls" :name="excel_date"
                        :fields="employeeFields">
                        Download Excel
                      </DownloadExcel>
                    </v-btn>
                    <v-btn class="tall__btn mr-2 subtext--text" color="subtext" outlined @click="filterDialog = true">
                      <filterIcon />
                    </v-btn>
                    <v-btn
                      class="tall__btn mr-2"
                      color="primary"
                      icon
                      @click="refreshEmployeeList"
                      :loading="isRefreshing"
                      :disabled="isRefreshing"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                    <v-btn v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)" class="tall__btn"
                      color="primary" @click="addNewEmployee = true">Add Employee</v-btn>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" class="pl-0 pr-0">
                <div class="d-flex custom_Employer_cards flex-wrap">
                  <template v-if="!loading">
                    <v-card v-for="data in employeeList" :key="data._id"
                      class="employer_card mb-5 tw-bg-white tw-rounded-2xl tw-shadow-lg tw-border tw-border-gray-100 tw-transition-all tw-duration-300 hover:tw-shadow-2xl hover:tw--translate-y-1 tw-cursor-pointer tw-group tw-flex tw-flex-col tw-items-center tw-px-4 tw-pt-6 tw-pb-4"
                      style="text-align: center"
                      @click="employeeClicked(data._id)">
                      <div class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-w-full">
                        <v-avatar class="tw-mt-2 tw-shadow-md tw-border-2 tw-border-white group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                          size="100px">
                          <v-img
                            alt="Avatar"
                            :src="data.image_url && data.image_url.trim() !== '' ? data.image_url : 'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg'"
                            class="tw-bg-gray-100 tw-object-cover tw-rounded-full"
                          />
                        </v-avatar>
                        <div class="tw-mt-2 tw-space-x-1">
                          <span class="cardBtn accent4 white--text" v-if="data.user_status == 'active'">{{ data.user_status }}</span>
                          <span class="cardBtn accent2 white--text" v-if="data.user_status == 'inactive'">{{ data.user_status }}</span>
                          <span class="cardBtn accent3 white--text" v-if="data.user_status == 'onboarding'">{{ data.user_status }}</span>
                          <span class="cardBtn accent5 white--text" v-if="data.user_status == 'offboarding'">{{ data.user_status }}</span>
                          <span class="cardBtn secondary white--text" v-if="data.user_status == 'visa process'">{{ data.user_status }}</span>
                        </div>
                      </div>
                      <v-card-title class="tw-flex tw-items-center tw-justify-center tw-pt-3 tw-px-0 tw-text-lg tw-font-semibold tw-text-gray-800 tw-w-full">
                        {{ data.first_name }} {{ data.last_name }}
                      </v-card-title>
                      <v-card-subtitle class="tw-pb-1 tw-text-sm tw-text-gray-500 tw-w-full">
                        {{ data?.employment?.designation || '' }}
                      </v-card-subtitle>
                      <v-card-text class="tw-text-sm tw-text-gray-400 tw-w-full">
                        {{ data.contact_number }}
                      </v-card-text>
                    </v-card>

                    <!-- Infinite scroll trigger -->
                    <div id="infinite-scroll-observer" class="w-100 text-center py-4"
                      v-if="employeeList.length > 0 && employeeList.length < pagination.totalCount"
                      v-intersect="{
                        handler: loadMore,
                        options: { threshold: 0.5 }
                      }">
                      <template v-if="loadingMore">
                        <v-row justify="center" align="center" class="py-4">
                          <v-col cols="12" class="text-center">
                            <v-progress-circular
                              indeterminate
                              color="primary"
                              size="32"
                              class="mr-3"
                            ></v-progress-circular>
                            <span class="subtitle-1 grey--text text--darken-1">Loading more employees...</span>
                          </v-col>
                        </v-row>
                      </template>
                    </div>

                    <!-- End of list message -->
                    <div v-if="employeeList.length >= pagination.totalCount && pagination.totalCount > 0" class="w-100 text-center py-4">
                      <v-chip color="grey lighten-3" class="caption">
                        All employees loaded ({{ pagination.totalCount }} total)
                      </v-chip>
                    </div>
                  </template>
                  <template v-else>
                    <EmployeeCardSkeleton v-for="n in 8" :key="n" class="tw-mb-5 tw-mx-2" />
                  </template>
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
import moment from 'moment'
import '@/assets/scss/utils/_customerCard.scss'
import '@/assets/scss/utils/_infiniteScroll.scss' // Import infinite scroll styles
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import Observer from '~/components/Observer.vue'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import AddEmployee from './addEmployee.vue'
import DownloadExcel from '~/components/ExcelExport/DownloadExcel.vue'
import _ from 'lodash'
import EmployeeCardSkeleton from '@/components/reuseable/EmployeeCardSkeleton.vue'

export default {
  components: {
    CalenderSvg,
    filterIcon,
    Observer,
    customerDefaultIcon,
    AddEmployee,
    DownloadExcel,
    EmployeeCardSkeleton
  },
  data() {
    return {
      downloadExcel: false,
      ExcelReport: [],
      excel_date: "Employees List " + moment(Date.now()).format('MM/DD/YYYY'),
      employeeFields: {
        "Company Name": 'companyDetails.company_name',
        "Status": 'user_status',
        "Visa Issuance Authority": 'visaSponsor',
        "Employment Type": 'employmentType',
        "First Name": 'first_name',
        "Middle Name": 'middle_name',
        "Last Name": 'last_name',
        "Email": 'email',
        "Gender": 'personal.gender',
        "Address": 'personal.address',
        // "Internal Designation":'',
        "Phone": 'personal.phone',
        "Nationality": 'personal.nationality',
        "Date of Joining": 'date_of_joining',
        "Visa Designation": 'designation',
        "Bank Name": 'bank.bank_name',
        "Account Number": 'bank.account_number',
        "IBAN Number": 'bank.iban',
        "Salary Rotation Required": 'salary_rotation_required',
        "Bank Post Office": 'bank.bank_post_office',
        "Bank Address": 'bank.bank_address',
        "Salary Payment Mode": 'bank.salary_payment_mode',
        "Basic Salary": "salary.basic_salary",
        "House Allowance": "salary.housing_allowance",
        "other Allowance": "salary.other_allowance",
        "Car Allowance": "salary.car_allowance",
        "Petrol Allowance": "salary.petrol_allowance",
        "Total Salary": "salary.total_fixed",
        "Insurance Card ": "insurance.insurance_card",
        "Insurance CardName ": "insurance.insurance_name",
        "Insurance Card No. ": "insurance.insurance_card_no",
        "Insurance Network Name ": "insurance.network_name",
        "Insurance Network List ": "insurance.network_list",
        "Assigned PRO": 'assignedPro.full_name',
        "Assigned Support": "assigned_support_agent.full_name",
        "Assigned Insurance Aggent": "assigned_insurance_agent.full_name",
        "Assigned Escalation Manager": "assigned_escalation_manager.full_name",
      },
      addNewEmployee: false,
      startDate: new Date().toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      dateFrom: false,
      dateTo: false,
      startDate: '',
      endDate: '',
      filterDialog: false,
      date: '',
      employeeStatus: [],
      buttons: [
        { text: 'All Status', value: '', clicked: false },
        { text: 'Active', value: 'active', clicked: false },
        { text: 'Inactive', value: 'inactive', clicked: false },
      ],
      limit: '12',
      page: 0,
      searchQuery: '',
      employeeList: [],
      userStatusList: [],
      filter: {},
      listing: 'search',
      enableObserver: true,
      reportLoading: false,
      loading: false,
      isRefreshing: false,
      loadingMore: false,
      pagination: {
        page: 1,
        totalCount: 0,
        limit: 12,
        itemStartIndex: 0,
        itemEndIndex: 0,
      },
    }
  },
  created() {
    // Debounce the search handler to avoid multiple API calls
    this.debouncedSearch = _.debounce(this.handleSearchEmployeeList, 400)
  },
  methods: {
    async handleDownloadExcelone() {
      let count = 0;
      this.reportLoading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      return await this.$axios.$post(`/users/excelvisa`, this.f, { headers: { Authorization: AuthStr } })
        .then((response) => {
          console.log(response[5], "this is the response from db")
          if (response && response.length > 0) {
            for (let index = 0; index < (response || []).length; index++) {
              count += 1;
              console.log(count, "==========>", response[index]);
              if (response[index]?.visa_process) {
                console.log("length of visa peocess is greater than 0", response[index])
                response[index].visa_status = response[index].visa_process.status
              }
              else {
                console.log("length of visa is not greater than 0", count)
                response[index].visa_status = 'No Visa Process'
              }
              if (response[index].userDocs.length > 0) {
                response[index].userDocs.forEach((item) => {
                  this.employeeFields[item.DocumentType] = item.DocumentType.
                    response[index][item.DocumentType] = item.document_number

                  // response[index][`${item.DocumentType} Expiry`] = item.expiry;
                  // console.log(item.expiry, "expiry appended");
                  this.employeeFields[`${item.DocumentType} Expiry`] = item.expiry;
                  console.log(this.employeeFields[`${item.DocumentType} Expiry`], '===============> value of expiry')
                });
              }
            }
            // console.log(response, "response")
            this.reportLoading = false
            return response
          }
        })
        .catch((err) => console.log(err))
    },
    /*************  ✨ Codeium Command ⭐  *************/
    /**
     * Resets the addNewEmployee flag to false when the user closes the add employee dialog
     */
    /******  6c9d63fe-abd5-419d-9471-3a35b7da5160 *******/
    async handleDownloadExcel() {
      try {
        this.reportLoading = true;
        const AuthStr = 'Bearer '.concat(this.$store.state.token);

        const response = await this.$axios.$post(`/users/excelvisa`, this.filter, {
          headers: { Authorization: AuthStr }
        });

        if (!response || response.length === 0) {
          this.reportLoading = false;
          return [];
        }

        // Add Internal Designation field to employeeFields first
        this.employeeFields['Internal Designation'] = 'Internal Designation';

        // Create a deep copy to avoid modifying the original response
        const processedData = response.map(user => {
          const processedUser = { ...user };

          // Format phone number as string with a leading apostrophe to force Excel to treat it as text
          if (processedUser.personal && processedUser.personal.phone) {
            const phoneValue = Array.isArray(processedUser.personal.phone)
              ? processedUser.personal.phone[0]
              : processedUser.personal.phone;

            // Convert to string and add leading apostrophe
            processedUser.personal.phone = `'${phoneValue.toString()}`;

          }
          // Handle visa process status
          if (processedUser.visa_process && processedUser.visa_process.status) {
            processedUser.visa_status = processedUser.visa_process.status;
          } else {
            processedUser.visa_status = 'No Visa Process';
          }

          // Handle Internal Designation
          if (processedUser.designation && processedUser.designation.trim().toLowerCase() === 'telecommunication assistant') {
            processedUser['Internal Designation'] = 'Not Applicable';
          } else {
            processedUser['Internal Designation'] = processedUser.designation; // Set empty string for other designations
          }

          // Handle user documents
          if (Array.isArray(processedUser.userDocs) && processedUser.userDocs.length > 0) {
            processedUser.userDocs.forEach(doc => {
              if (doc && doc.DocumentType) {
                // Only add the field if it doesn't already exist
                if (!this.employeeFields[doc.DocumentType]) {
                  this.employeeFields[doc.DocumentType] = doc.DocumentType;
                }

                // Add the document number to the user object
                processedUser[doc.DocumentType] = doc.document_number || '';

                // Handle expiry date if it exists
                if (doc.expiry) {
                  const expiryFieldName = `${doc.DocumentType} Expiry`;
                  if (!this.employeeFields[expiryFieldName]) {
                    this.employeeFields[expiryFieldName] = expiryFieldName;
                  }
                  processedUser[expiryFieldName] = doc.expiry;
                }
              }
            });
          }

          return processedUser;
        });

        this.reportLoading = false;
        return processedData;

      } catch (error) {
        console.error('Error in handleDownloadExcel:', error);
        this.reportLoading = false;
        return [];
      }
    },

    closeAddEmployee() {
      this.addNewEmployee = false
    },
    // Replace searchDebounceAction with debouncedSearch
    async intersectedEmployeeList() {
      // Only show main loading indicator on initial load
      if (this.pagination.page === 1) {
        this.loading = true;
      }

      const AuthStr = `Bearer ${this.$store.state.token}`;
      const url = `/users/list/sort/filter?page=${this.pagination.page}&limit=${this.pagination.limit}`;
      const payload = this.listing === 'search' ? { search: this.searchQuery } : this.filter;

      try {
        const response = await this.$axios.$post(url, payload, { headers: { Authorization: AuthStr } });

        if (response?.results && response.results.length > 0) {
          this.employeeList = [...this.employeeList, ...response.results];
        }

        // Update pagination values from API response
        if (response) {
          this.pagination.page = Number(response.page);
          this.pagination.totalCount = Number(response.totalResults);
          this.pagination.limit = Number(response.limit);

          // Log pagination info for debugging
          console.log(`Loaded page ${this.pagination.page} of ${Math.ceil(this.pagination.totalCount / this.pagination.limit)}, ${this.employeeList.length} of ${this.pagination.totalCount} total records`);
        }

      } catch (err) {
        console.error('Failed to load employee list:', err);
      } finally {
        this.loading = false;
      }
    },
    async getEmployeeList() {
      this.page = 0;
      this.searchQuery = '';
      this.employeeList = [];
      this.listing = 'search';
      // Reset pagination for new data fetch
      this.pagination.page = 1;
      this.pagination.itemStartIndex = 0;
      this.pagination.itemEndIndex = 0;
      await this.intersectedEmployeeList();
    },
    handleSearchEmployeeList() {
      this.page = 0;
      this.employeeList = [];
      this.listing = 'search';
      // Reset pagination for search
      this.pagination.page = 1;
      this.pagination.itemStartIndex = 0;
      this.pagination.itemEndIndex = 0;
      this.intersectedEmployeeList();
    },

    //FILTER EMPLOYERS ON DATE *************************************************************************************
    handleFilterEmployeeList() {
      this.page = 0;
      this.employeeList = [];
      this.listing = 'filter';
      // Reset pagination for filter
      this.pagination.page = 1;
      this.pagination.itemStartIndex = 0;
      this.pagination.itemEndIndex = 0;
      this.filter = {
        "startDate": typeof this.startDate == 'string' ? [this.startDate] : this.startDate,
        "endDate": typeof this.endDate == 'string' ? [this.endDate] : this.endDate,
        "status": this.employeeStatus
      };
      this.intersectedEmployeeList();
    },

    async handleFilterEmployees() {
      this.page = 0;
      this.employeeList = [];
      this.listing = 'filter';
      // Reset pagination for filter
      this.pagination.page = 1;
      this.pagination.itemStartIndex = 0;
      this.pagination.itemEndIndex = 0;
      this.filter = {
        "status": this.employeeStatus
      };
      this.intersectedEmployeeList();
    },

    async clearFilter() {
      this.startDate = '';
      this.endDate = ''; // Fixed comparison operator (was ==)
      this.employeeStatus = [];
      this.params = {};
      this.filter = {};
      // Reset pagination
      this.pagination.page = 1;
      this.pagination.itemStartIndex = 0;
      this.pagination.itemEndIndex = 0;
      await this.getEmployeeList();
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

      const response = await this.$axios.$post(`/users/list/status`, { headers: { Authorization: AuthStr } })
      this.userStatusList = response
      this.buttons = this.userStatusList
        .filter((value) => value && typeof value === 'string' && value.trim() !== '' && value !== 'visa process')
        .map((value) => {
          return {
            text: value.charAt(0).toUpperCase() + value.slice(1),
            value: value,
            clicked: false
          }
        })
    },
    async refreshEmployeeList() {
      this.isRefreshing = true;
      try {
        await this.getEmployeeList();
      } finally {
        this.isRefreshing = false;
      }
    },

    async loadMore() {
      // Only trigger if:
      // 1. We're not already loading data
      // 2. We haven't loaded all records yet
      if (!this.loadingMore) {
        const indexesLeft = this.pagination.totalCount - this.employeeList.length;
        if (indexesLeft > 0) {
          this.loadingMore = true;

          // Increment the page number
          this.pagination.page += 1;

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
  },
  async mounted() {
    this.loading = true
    await Promise.all([
      this.getUsersStatusList(),
      this.getEmployeeList()
    ])
    this.loading = false
  },
  computed: {
    computedUserStatusListByOrder() {
      if (this.userStatusList.length > 0) {
        this.userStatusList = this.userStatusList
          .filter((item) => item && typeof item === 'string' && item.trim() !== '')
          .map((item) => item.charAt(0).toLowerCase() + item.slice(1));
        this.userStatusList.sort()
        return this.userStatusList;
      }
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

/* Infinite scroll styles */
#infinite-scroll-observer {
  width: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom_Employer_cards {
  overflow-y: auto;
  max-height: 75vh;
  padding-bottom: 50px;
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

  .custom_Employer_cards {
    max-height: 70vh;
  }
}

@media (max-width: 600px) {
  .employer_card {
    width: calc(100% - 20px);
  }

  .custom_Employer_cards {
    max-height: 65vh;
  }
}

.v-btn.v-btn--loading {
  opacity: 0.8;
}

.v-btn.v-btn--loading .v-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.v-btn.v-btn--icon {
  width: 48px !important;
  height: 48px !important;
}

.v-btn.v-btn--loading.v-btn--icon .v-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
