<template>
  <v-row class="px-0 py-0">
    <!-- FILTER DIALOG -->
    <v-dialog id="custom_dialog" v-model="filterDialog" max-width="700px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Filter</h4>
          <div class="d-flex align-center justify-end">
            <v-btn
              class="tall__btn mr-4 pl-4 pr-4"
              color="subtext"
              outlined
              @click=";(filterDialog = false), clearFilter()"
              ><span class="">Clear All</span></v-btn
            >
            <v-btn
              class="tall__btn pl-6 pr-6"
              color="primary"
              @click=";(filterDialog = false), handleFilterPaymentSchedules()"
              >Apply</v-btn
            >
          </div>
        </v-card-title>
        <v-card-text id="card-dialog">
          <v-container class="ma-0 pa-0">
            <v-row class="pb-0">
              <v-col cols="12" class="pa-0">
                <div class="d-flex align-center">
                  <div style="width: 25% !important">
                    <v-radio-group v-model="ex8" column>
                      <v-radio
                        label="By Employer"
                        color="success"
                        value="byEmployer"
                      ></v-radio>
                    </v-radio-group>
                  </div>
                  <div slot="input" style="width: 30% !important">
                    <v-select
                      :items="employers"
                      placeholder="Select Employer"
                      v-model="selectedEmployers"
                      solo
                      dense
                      hide-details
                      item-text="company_name"
                      item-value="_id"
                      class="proposalDialog_date_field2 ml-2"
                      v-if="employers.length >= 1"
                      append-icon="fa-chevron-down"
                    />
                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Company
                    </p>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <div style="width: 25% !important">
                    <v-radio-group v-model="ex8" column>
                      <v-radio
                        label="By Employee"
                        color="success"
                        value="byEmployee"
                      ></v-radio>
                    </v-radio-group>
                  </div>
                  <div slot="input" style="width: 30% !important">
                    <v-select
                      :items="employees"
                      placeholder="Select Employee"
                      v-model="selectedEmployees"
                      solo
                      dense
                      hide-details
                      class="proposalDialog_date_field2 ml-2"
                      item-text="first_name"
                      item-value="_id"
                      v-if="employees.length >= 1"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </div>
                <div class="d-flex align-center justify-space-between">
                  <div
                    class="d-flex align-center"
                    style="width: 60% !important"
                  >
                    <div style="width: 42% !important">
                      <v-radio-group v-model="ex8" column>
                        <v-radio
                          label="From"
                          color="success"
                          value="from"
                        ></v-radio>
                      </v-radio-group>
                    </div>
                    <div slot="input" style="width: 50% !important">
                      <v-menu
                        v-model="date_menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="estimate_date"
                            placeholder="mm/dd/yy"
                            class="proposalDialog_date_field2 ml-2"
                            solo
                            dense
                            hide-details
                            v-bind="attrs"
                            v-on="on"
                          >
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker
                          v-model="estimate_date"
                          @input="date_menu = false"
                        />
                      </v-menu>
                    </div>
                  </div>
                  <!-- Date To -->
                  <div
                    class="d-flex align-center"
                    style="width: 40% !important"
                  >
                    <div style="width: 15% !important">
                      <span class="span_data">To</span>
                    </div>
                    <div slot="input" style="width: 70% !important">
                      <v-menu
                        v-model="exp_date_menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="exp_date"
                            placeholder="mm/dd/yy"
                            class="proposalDialog_date_field2 ml-2"
                            solo
                            dense
                            hide-details
                            v-bind="attrs"
                            v-on="on"
                          >
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker
                          v-model="exp_date"
                          @input="exp_date_menu = false"
                        />
                      </v-menu>
                    </div>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <div style="width: 25% !important">
                    <v-radio-group v-model="ex8" column>
                      <v-radio
                        label="Payment Status"
                        color="success"
                        value="paymentStatus"
                      ></v-radio>
                    </v-radio-group>
                  </div>
                  <div slot="input" style="width: 30% !important">
                    <v-select
                      :items="billingStatusList"
                      v-model="selectedStatus"
                      placeholder="Select Status"
                      solo
                      dense
                      hide-details
                      class="proposalDialog_date_field2 ml-2"
                      v-if="billingStatusList.length >= 1"
                      append-icon="fa-chevron-down"
                    />
                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Status
                    </p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- / FILTER DIALOG -->
    <v-col cols="12">
      <!-- Top Filter Card -->
      <v-card color="card_bg" id="card">
        <v-row class="">
          <v-col cols="6">
            <div class="d-flex align-center" style="gap: 12px">
              <div slot="input">
                <v-select
                  :items="employers"
                  placeholder="Select Employers"
                  v-model="selectedEmployers"
                  item-text="company_name"
                  item-value="_id"
                  solo
                  dense
                  multiple
                  hide-details
                  class="proposalDialog_date_field2"
                  v-if="employers.length >= 1"
                  append-icon="fa-chevron-down"
                  @change="handleFilterPaymentSchedules"
                />
                <p v-else class="error--text mb-5 mt-5">
                  Please Select Employers
                </p>
              </div>
              <div slot="input">
                <v-select
                  :items="employees"
                  :loading="isLoading"
                  :disabled="isLoading"
                  :error-messages="error"
                  placeholder="Select Employee"
                  solo
                  multiple
                  v-model="selectedEmployees"
                  dense
                  hide-details
                  :item-text="getEmployeeFullName"
                  item-value="_id"
                  class="proposalDialog_date_field2"
                  v-if="employees.length >= 1"
                  append-icon="fa-chevron-down"
                  @change="handleFilterPaymentSchedules"
                />
                <p v-else-if="error" class="error--text mb-5 mt-5">
                  {{ error }}
                </p>
                <p v-else class="error--text mb-5 mt-5">
                  Please Select Employee
                </p>
              </div>
              <v-btn
                style="min-width: 45px !important"
                class="short__btn mr-2 pl-0 pr-0"
                color="subtext"
                outlined
                @click="filterDialog = true"
              >
                <filterIcon />
              </v-btn>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="d-flex align-center justify-end">
              <span class="span_data mr-3">Showing</span>
              <v-btn
                v-for="(button, index) in FilterButtons"
                :key="index"
                @click="handleClick(index)"
                :class="{ clicked: button.clicked }"
                class="customer_table_btn pa-2 mr-2"
                value="inactive"
                outlined
              >
                <span class="filter_btn pa-0">{{ button.text }}</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
      <div class="my-3 ml-1">
        <span class="span_data">{{ today_date | ticketingDateFormatter }}</span>
      </div>
      <!-- Salary steps Card -->
      <v-card color="card_bg" class="" id="card">
        <v-data-table
          id="coa_table"
          class="main__table elevation-0 document_table custom_table"
          :headers="paymentScheduleHeaders"
          :items="paymentScheduleList"
          :single-expand="singleExpand"
          :expanded.sync="expanded"
          item-key="_id"
          show-expand
          style="cursor: pointer; border-radius: 20px !important"
        >
          <template v-slot:item="{ item, expand, isExpanded }">
            <tr>
              <td class="pr-0" style="width: 215px !important; height: 12vh">
                {{ item.customer_name }} <br />
                {{ item.invoice_number }}
              </td>
              <td class="d-flex align-center" style="height: 10vh !important">
                <v-row>
                  <v-col cols="12" sm="12" md="12" xl="12" class="py-0 px-0">
                    <div id="content" class="custom_content">
                      <div class="custom_timeline">
                        <div class="custom_line"></div>
                        <div class="custom_timeline__points">
                          <div
                            class="custom_point"
                            v-for="(event, index) in item.schedules"
                            :key="index"
                          >
                            <div
                              class="custom_circle"
                              v-bind:ref="'circle' + index"
                              :style="getIconColorBG(event.status)"
                            >
                              <v-icon
                                color="white"
                                :small="getIconSize(event.status)"
                                >{{ getIcon(event.status) }}</v-icon
                              >
                            </div>
                            <div class="bottom-content">
                              <div
                                class="custom_tooltip"
                                v-bind:ref="'tooltip' + index"
                              ></div>
                            </div>
                            <div class="upper-content">
                              <p class="font-weight-bold">
                                {{ event.name }}
                              </p>
                              <span
                                v-if="
                                  event.name == 'Invoice Sent' &&
                                  event.status == 'Completed'
                                "
                                class="date-display"
                              >
                                {{ formatDateCompact(event.date) }}
                              </span>
                              <span
                                v-if="
                                  event.name == 'Partially Paid' &&
                                  event.status == 'Completed'
                                "
                                class="date-display"
                                >{{
                                  formatDateCompact(event.partially_paid_date)
                                }}</span
                              >
                              <span
                                v-if="
                                  event.name == 'Payment Received' &&
                                  event.status == 'Completed'
                                "
                                class="date-display"
                                >{{
                                  formatDateCompact(event.payment_received_date)
                                }}</span>

                              <span
                                v-if="
                                  event.name == 'Invoice Expired' &&
                                  event.status == 'Completed'
                                "
                                class="date-display"
                                >{{
                                  formatDateCompact(event.invoice_expired_date)
                                }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </td>
              <td>
                <v-icon
                  v-if="
                    item.hasOwnProperty('associated_users') &&
                    item.associated_users.length > 0
                  "
                  @click="expand(!isExpanded)"
                  >fa-solid fa-chevron-down</v-icon
                >
              </td>
            </tr>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" style="height: 10vh !important">
              <p class="font-weight-bold pt-2">
                Employees With Different Schedule
              </p>
              <v-row>
                <v-col cols="12" sm="10" md="10" lg="10">
                  <div
                    class="pt-5"
                    v-for="(event, index) in item.associated_users"
                    :key="index"
                  >
                    <h5>{{ event.first_name }} {{ event.last_name }}</h5>
                  </div>
                </v-col>
              </v-row>
            </td>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_leadTimeLine.scss'
import checkBoxSvg from '@/assets/images/icons/check-box.svg'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'

export default {
  components: {
    checkBoxSvg,
    CustomInputContainer,
    LightArrow,
    filterIcon,
    CalenderSvg,
  },
  data() {
    return {
      ex8: 'primary',
      // emp_rad: 'primary',
      //FilterDialog
      filterDialog: false,
      //date pickers
      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      exp_date: '',
      date: '',
      //FILTER DIALOG BUTTONS
      FilterButtons: [
        // { text: 'All ', clicked: true },
        // { text: 'not paid', clicked: false },
        // { text: 'Valid', clicked: false },
        // { text: 'Soon Expiring', clicked: false },
      ],
      year: 'Select',

      main_rule: [(v) => !!v || 'This filed is required'],
      paymentScheduleHeaders: [
        {
          text: 'Customer Name',
          value: 'customer_name',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: 'Schedules',
          value: 'schedules',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'data-table-expand',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      paymentScheduleList: [],
      expanded: [],
      singleExpand: true,
      today_date: new Date().toISOString().substr(0, 10),
      limit: '10',
      page: 0,
      comPage: 0,
      selectedStatus: [],
      employers: [],
      selectedEmployers: [],
      employees: [],
      allEmployees: [],
      isLoading: false,
      error: null,
      selectedEmployees: [],
      billingStatusList: [],
      selectedBillingStatusType: [],
    }
  },
  mounted() {
    this.getPaymentScheduleList()
    this.getEmployersList()
    this.getEmployeesList()
    this.getBillingStatus()
  },
  methods: {
    handleClick(index) {
      this.FilterButtons[index].clicked = !this.FilterButtons[index].clicked
      this.selectedStatus = this.FilterButtons.filter(
        (button) => button.clicked
      ).map((button) => button.value)
      this.handleFilterPaymentSchedules()
    },
    getEmployersList() {
      this.comPage++
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios
        .$post(
          `/companies/list/dropdown?page=${this.comPage}&limit=${10000}`,
          { isInvoiceFilter: true },
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.employers = response
        })
    },
    async getEmployeesList() {
      this.loading = true
      this.error = null
      this.page++

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        let response = await this.$axios.$post(
          `/users/list/dropdown?page=${this.page}&limit=${10000}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        this.allEmployees = response
        this.employees = response
      } catch (error) {
        throw new Error(error)
      } finally {
        this.loading = false
      }
    },
    filterEmployeesByEmployer() {
      if (!this.selectedEmployers || this.selectedEmployers.length == 0) {
        this.employees = this.allEmployees
        this.selectedEmployees = []
        return
      }
      let employerIds =
        typeof this.employerIds === 'String'
          ? [this.selectedEmployers]
          : this.selectedEmployers
      this.employees = this.allEmployees.filter((employee) => {
        return employerIds.includes(employee.company_id)
      })
      this.selectedEmployees = this.selectedEmployees.filter((employeeId) => {
        return this.selectedEmployees.some((emp) => {
          emp._id === employeeId
        })
      })
    },
    async getBillingStatus() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`/invoice/status/list`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.billingStatusList = response
          this.FilterButtons = this.billingStatusList.map((value) => {
            return {
              text: value.charAt(0).toUpperCase() + value.slice(1),
              value: value,
              clicked: false,
            }
          })
        })
    },
    async handleFilterPaymentSchedules() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      const params = {
        company_id:
          typeof this.selectedEmployers == 'string'
            ? [this.selectedEmployers]
            : this.selectedEmployers,
        user_id:
          typeof this.selectedEmployees == 'string'
            ? [this.selectedEmployees]
            : this.selectedEmployees,
        status: this.selectedStatus,
        start_date: this.estimate_date,
        end_date: this.exp_date,
      }

      await this.$axios
        .$post(`/invoice/schedule/status`, params, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.paymentScheduleList = response
        })
    },
    clearFilter() {
      this.selectedEmployees = []
      this.selectedEmployers = []
      this.selectedStatus = []
      this.estimate_date = ''
      this.exp_date = ''
      this.employees = this.allEmployees

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const params = {}

      this.$axios
        .$post(`/invoice/schedule/status`, params, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.paymentScheduleList = response
        })

      if (this.selectedStatus.length === 0) {
        this.FilterButtons.forEach((button) => {
          button.clicked = false
        })
      }
    },
    getEmployeeFullName(employee) {
      const parts = [
        employee.first_name,
        employee.middle_name,
        employee.last_name,
      ].filter(Boolean) // This removes any null/undefined/empty values

      return parts.join(' ')
    },
    async getPaymentScheduleList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`/invoice/schedule/status`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.paymentScheduleList = response
        })
    },
    getIconSize(val) {
      if (val == 'Not Completed') return false
      else return true
    },
    getIconColorBG(val) {
      if (val == 'Completed') return 'background: #82E0AA; !important'
      else if (val == 'Inprogress') return 'background: #FFC107; !important'
      else if (val == 'Not Completed') return 'background: #ff4d4d; !important'
      else return 'background: #F1948A; !important'
    },
    getIcon(val) {
      if (val == 'Completed') return 'fa-duotone fa-check'
      else if (val == 'Inprogress') return 'mdi-exclamation'
      else if (val == 'Not Completed') return 'fa-thin fa-xmark'
      else return 'mdi-close'
    },
    formatDateCompact(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    },
  },
  computed: {
    completedStyles() {
      return {
        stroke: ' #0a94ff',
        border: '2px solid #0a94ff',
      }
    },
    notCompletedStyles() {
      return {
        stroke: '#0a94ff',
        border: '2px solid #0a94ff',
      }
    },
    lineCompletedStyle() {
      return {
        backgroundColor: '#0a94ff',
      }
    },
    lineNotCompletedStyle() {
      return {
        backgroundColor: '#0a94ff',
      }
    },
    years() {
      const year = new Date().getFullYear()
      return Array.from({ length: year - 1900 }, (value, index) => 1901 + index)
    },
  },
  watch: {
    selectedEmployers: {
      handler(newVal) {
        this.filterEmployeesByEmployer()
      },
      deep: true,
    },
  },
}
</script>
<style lang="scss" scoped>
@import url(https://fonts.googleapis.com/css?family=Roboto);
@mixin flex($dir, $jus: flex-start, $ali: flex-start, $wrap: nowrap) {
  display: flex;
  flex-direction: $dir;
  justify-content: $jus;
  align-items: $ali;
  flex-wrap: $wrap;
}

$timeline-container-h: 100px;
$point-w: 60px;
$point-h: 100px;
$circle-size: 40px;

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: 'Roboto';
}

.custom_content {
  height: 120px !important;
  @include flex(row, center, flex-end);
}

.custom_timeline {
  padding: 20px 0;
  position: relative;
  width: 100%;
}

.custom_line {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 3px;
  background: linear-gradient(90deg, #e0e0e0 50%, #ddd 100%);
  width: 100%;
  z-index: 1;
}

.custom_timeline__points {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}
.custom_point {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: all 0.3s ease;
}
.custom_circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.custom_point .upper-content {
  position: absolute;
  top: -45px;
  text-align: center;
  min-width: 120px;
}
.short-line {
  background: linear-gradient(white 70%, rgba(0, 0, 0, 0.5) 90%);
  width: 2px;
  height: 50px;
  border-radius: 50%;
  margin-bottom: 36px;
}

.date-display {
  font-size: 11px;
  color: #666;
  display: block;
  margin-top: 2px;
  white-space: nowrap;
  font-weight: 500;
}

.date-display:hover {
  color: #333;
}

.custom_circle {
  background: orange;
  width: 30px;
  height: 30px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  /* border: 7px solid white; */
  border-radius: 50%;
  color: white;
  font-weight: bold;
  &::after {
    content: '';

    border: 5px solid rgb(224 224 224);
    width: $circle-size * 1.7;
    height: $circle-size * 1.7;
    border-radius: inherit;
    position: absolute;
    transition: all 0.3s ease-out;
    display: none;
  }
  &.active {
    &::after {
      display: inline-block;
    }
  }
  &:hover {
    cursor: pointer;
  }
}

.custom_tooltip {
  background-color: #fff;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  padding: 16px;
  border-radius: 16px;
  margin-top: 24px;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
  display: none;
  &.active {
    display: none;
  }
  &::before {
    content: '';
    display: inline-block;
    background: rgb(224 224 224);
    width: 5px;
    z-index: 1;
    height: 22px;
    position: absolute;
    top: -22px;
    left: 49%;
  }
}

.custom_table tbody tr td {
  font-size: 14px !important;

  border: none !important;

  border-spacing: 0.5rem !important;
}
</style>
