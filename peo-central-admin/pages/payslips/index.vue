<template>
  <div class="pa-5">
    <v-row class="mr-2">
      <v-col cols="3" class="text-center">
        <h3 class="headline font-weight-light primary--text">PAYSLIPS <span
            class="display-1 font-weight-bold primary--text">&nbsp;CENTRAL</span></h3>
      </v-col>
      <v-col cols="3"></v-col>
      <v-col cols="4" class="text-center">
        <v-autocomplete v-model="company" :items="companies" label="Select Company" item-text="company_name"
          item-value="_id" solo @change="onChangeLoadCompanyPayslipData()">
        </v-autocomplete>
      </v-col>
      <v-col cols="2" class="text-right">
        <v-btn small :class="employeeWise ? 'primary' : 'purple'" dark
          @click="employeeWise = !employeeWise, onChangeLoadCompanyPayslipData()">{{ employeeWise ? 'Month Wise' :
            'Employee Wise' }}</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="employeeWise">
      <v-col cols="12" sm="12" md="6" class="pt-2">
        <v-card class="rounded-xl" flat min-height="800">
          <v-card-title class="py-1">
            <h4 class="blue-grey--text font-weight-bold">Employees ({{ filterText ? filterText.length : 0 }})</h4>
            <v-spacer></v-spacer>
            <v-text-field solo dense persistent-hint prepend-icon="mdi-magnify" placeholder="Search..."
              @input="handleSearch" class="pt-3" v-model="searchText"></v-text-field>
          </v-card-title>
          <v-divider class="mx-6 mt-n3"></v-divider>
          <v-list class="scroll" style="max-height : 700px;" v-if="filterText && filterText.length > 0">
            <template v-for="(data, index) in filterText">
              <v-divider :key="data._id" v-if="index != 0"></v-divider>
              <v-list-item :key="index" @click="selectEmp(data)">
                <v-list-item-avatar size="50" class="">
                  <v-img :src="services_general.getImage(data._id, users)" cover></v-img>
                </v-list-item-avatar>
                <v-list-item-content class="pl-2">
                  <v-list-item-title>{{ data.first_name }} {{ data.last_name }}</v-list-item-title>
                  <v-list-item-subtitle class="">{{ data.personal.designation }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action class="pl-2 text-right">
                  <v-list-item-title><span class="grey--text caption">{{ data.reporting.department }} - {{
                    data.reporting.team }}</span> </v-list-item-title>
                  <v-list-item-subtitle class=""><v-icon small color="pink"
                      class="mt-n1">mdi-calendar-clock-outline</v-icon>&nbsp;DOJ : {{ data.date_of_joining |
                        ticketingDateFormatter }}</v-list-item-subtitle>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
          <v-list v-else>
            <p class="px-5 pt-3 primary--text text-center">Currently, there are no employees in the organization!</p>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" sm="12" md="6" class="pt-2">
        <v-card class="rounded-xl" flat min-height="800" v-if="showPayslipsList">
          <v-card-title class="">
            <h4 class="blue-grey--text font-weight-bold">Payslips <span v-if="selectedUser && selectedUser.first_name">
                for {{ selectedUser.first_name }} {{ selectedUser.last_name }}</span></h4>
            <v-spacer></v-spacer>
          </v-card-title>
          <v-divider class="mx-6 mt-2"></v-divider>
          <v-list two-line v-if="userPayslips && userPayslips.length > 0" class="px-3">
            <template v-for="(data, index) in userPayslips">
              <v-list-item :key="index" @click="loadPayslipsForPreview(data)">
                <v-list-item-content class="py-0">
                  <v-list-item-title class="font-weight-bold body-1 blue-grey--text"><v-icon class="mt-n1" color="pink"
                      size="25">mdi-calendar-outline</v-icon>&nbsp;
                    <span class="mt-3">{{ data.pay_month | PayslipDateFormatter }} </span>
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action class="py-0 ">
                  <p class="mb-1 font-weight-light caption blue-grey--text"><v-icon class="mt-n1" color="green"
                      size="20">mdi-cash</v-icon>&nbsp;AED {{ data.total_salary | amountFormatter }} </p>
                </v-list-item-action>
              </v-list-item>
              <v-divider :key="data._id" class="mx-2"></v-divider>
            </template>
          </v-list>
          <div v-else>
            <p class="px-5 pt-5 primary--text text-center">No Playslips found.</p>
          </div>
        </v-card>
        <v-card class="rounded-xl" flat min-height="800" v-else>
          <v-card-title class="">
            <h4 class="blue-grey--text font-weight-bold">Payslips Preview</h4>
            <v-spacer></v-spacer>
            <span v-if="payslipData" class="mx-3">
              <v-tooltip top color="pink">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon small color="pink" @click.prevent="downloadPDF_payslip(payslipData)" class="" v-bind="attrs"
                    v-on="on">
                    <v-icon>mdi-download-outline</v-icon>
                  </v-btn>
                </template>
                Download Payslip
              </v-tooltip>
            </span>

            <v-btn color="red" icon
              @click="showPayslipsList = !showPayslipsList"><v-icon>mdi-close-circle</v-icon></v-btn>
          </v-card-title>
          <v-divider class="mx-6 mt-2"></v-divider>

          <v-row v-if="payslipData">
            <v-col cols="12" sm="12" md="12" class="text-center">
              <Payslip :payslipData='payslipData' :user="selectedUser"
                :fixed_salary_config="services_general.getFixedSalaryConfig(this.configuration)"
                :variable_salary_config="services_general.variableSalaryConfig(this.configuration)"
                :company_data="getCompanyData(payslipData.company_id)" v-if="services_general" />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12" sm="12" md="6" class="pt-2">
        <v-card class="rounded-xl" flat min-height="800">
          <v-card-title class="">
            <h4 class="blue-grey--text font-weight-bold">Monthwise Payslips</h4>
            <v-spacer></v-spacer>
          </v-card-title>
          <v-divider class="mx-6 mt-n2"></v-divider>
          <v-list two-line v-if="payrollProcess.length > 0" class="scroll" style="max-height : 700px;">
            <template v-for="(data, index) in payrollProcess">
              <v-list-item :key="index" @click="selectEmpForMonthwise(data)">
                <v-list-item-content class="py-0 ml-3">
                  <v-list-item-title class="font-weight-bold body-1 blue-grey--text"><v-icon class="mt-n1" color="pink"
                      size="25">mdi-calendar-outline</v-icon>&nbsp;
                    <span class="mt-3">{{ data._id | PayslipDateFormatter }} </span>
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action class="font-weight-bold caption blue-grey--text">&nbsp;
                  <p class="mr-3 mb-1 mt-n2 font-weight-bold blue-grey--text"><v-icon class="mt-n2" color="green"
                      size="20">mdi-account-outline</v-icon>&nbsp; {{ data.TotalEMployees }} Employees</p>
                </v-list-item-action>
              </v-list-item>
              <v-divider :key="data._id" class="mx-8"></v-divider>
            </template>
          </v-list>
          <p v-else class="px-5 pt-3 primary--text text-center"> No Payslips Found.</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="12" md="6" class="pt-2">
        <v-card class="rounded-xl" flat min-height="800" v-if="showPayslipsList">
          <v-card-title>
            <h4 class="blue-grey--text font-weight-bold">Payslips <span
                v-if="selectedPayMonth && selectedPayMonth.pay_month">for {{ selectedPayMonth.pay_month |
                  payslipDateFormatter }} </span></h4>
            <v-spacer></v-spacer>
            <PayslipAllUserTemplate :allUsersPayslipData="monthwisePayslips" :users="users"
              :fixed_salary_config="services_general.getFixedSalaryConfig(this.configuration)"
              :variable_salary_config="services_general.variableSalaryConfig(this.configuration)"
              :companiesAll="companies" :company="company" v-if="monthwisePayslips && monthwisePayslips.length > 0" />

            <v-tooltip top color="primary" v-if="monthwisePayslips && monthwisePayslips.length > 0">
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="bulkEmailDialog = true" elevation="0" fab dark x-small color="grey lighten-3"
                  class="mb-5 ml-3" v-bind="attrs" v-on="on">
                  <v-icon color="primary">mdi-email-outline</v-icon>
                </v-btn>
              </template>
              Send Bulk Email
            </v-tooltip>
          </v-card-title>
          <v-divider class="mx-6 mt-n2"></v-divider>
          <v-text-field v-if="monthwisePayslips && monthwisePayslips.length > 0" solo dense persistent-hint
            prepend-inner-icon="mdi-magnify" placeholder="Search..." class="mx-3 mt-1"
            v-model="searchTextMonthwise"></v-text-field>
          <v-list two-line v-if="monthwisePayslips.length > 0" class="scroll mt-n5 px-3" style="max-height : 675px;">
            <template v-for="(data, index) in monthwisePayslips">
              <v-list-item :key="index" @click="loadPayslipsForPreview(data)">
                <v-list-item-content class="py-0">
                  <v-list-item-title class="font-weight-bold body-1 blue-grey--text"><v-icon class="mt-n1" color="pink"
                      size="25">mdi-calendar-outline</v-icon>&nbsp;
                    <span class="mt-3">{{ data.users.full_name }} </span>
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action class="py-0 ">
                  <p class="mb-1 font-weight-light caption blue-grey--text"><v-icon class="mt-n1" color="green"
                      size="20">mdi-cash</v-icon>&nbsp;AED {{ data.users.total_fixed | amountFormatter }}</p>
                </v-list-item-action>
              </v-list-item>
              <v-divider :key="data._id" class="mx-2"></v-divider>
            </template>
          </v-list>
          <div v-else>
            <p class="px-5 pt-3 primary--text text-center">No Playslips found.</p>
          </div>
        </v-card>
        <v-card class="rounded-xl" flat min-height="800" v-else>
          <div v-if="selectedPayMonth">
            <v-card-title class="">
              <h4 class="blue-grey--text font-weight-bold">Payslips Preview</h4>
              <v-spacer></v-spacer>
              <span v-if="payslipData && payslipData.user_id" class="mx-3">
                <v-tooltip top color="pink">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon small color="pink" @click.prevent="downloadPDF_payslip(payslipData)" class=""
                      v-bind="attrs" v-on="on">
                      <v-icon>mdi-download-outline</v-icon>
                    </v-btn>
                  </template>
                  Download Payslip
                </v-tooltip>
              </span>
              <v-btn color="red" icon
                @click="showPayslipsList = !showPayslipsList"><v-icon>mdi-close-circle</v-icon></v-btn>
            </v-card-title>
            <v-divider class="mx-6 mt-2"></v-divider>

            <v-row v-if="payslipData && payslipData.user_id">
              <v-col cols="12" sm="12" md="12" class="text-center scroll" style="max-height : 675px;">
                <Payslip :payslipData='payslipData' :user="services_general.getUserDetails(payslipData.user_id, users)"
                  :fixed_salary_config="services_general.getFixedSalaryConfig(this.configuration)"
                  :variable_salary_config="services_general.variableSalaryConfig(this.configuration)"
                  :company_data="getCompanyData(payslipData.company_id)" v-if="services_general" />
              </v-col>
            </v-row>
          </div>
          <div v-else>
            <p class="px-5 pt-3 primary--text">No Playslips found.</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Send Bulk Email -->
    <v-dialog v-model="bulkEmailDialog" width="600">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" color="primary mt-5 mb-5 mx-2" outlined><v-icon>mdi-email-send-outline</v-icon> &nbsp;Send
          Payslips to All</v-btn>
      </template>
      <v-card class="py-3">
        <v-card-title class="body-1">
          Are you sure you want to send Payslips to all?
        </v-card-title>
        <v-card-text class="pb-2">
          <v-row>
            <v-col cols="12" class="text-right pb-0">
              <v-btn @click="bulkEmailDialog = false" small class="mr-3 grey--text" text>cancel</v-btn>
              <v-btn class="" color="teal" small outlined
                @click.prevent="send_payslip_all()"><v-icon>mdi-email-send-outline</v-icon> &nbsp;Send</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Snackbar -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Dialog overlay -->
    <v-row justify="center">
      <v-dialog v-model="overlay_dialog" persistent max-width="500">
        <v-card color="primary" dark class="pa-10">
          <v-card-text>
            <p class="white--text">Generating Your Payslip File. Hang on tight.</p>
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import general from "~/plugins/general";
import moment from "moment";
import emails from "~/plugins/emails";
import PayslipTemplate from '~/components/invoice/template_payslip'
import Payslip from '~/components/payslips/payslip'
import PayslipAllUserTemplate from '~/components/invoice/template_payslip_all.vue'

export default {
  components: { PayslipTemplate, Payslip, PayslipAllUserTemplate },
  layout: 'dashboard',
  data() {
    return {
      services_general: general,
      services_email: emails,
      snack: false,
      snackText: '',
      snackColor: '',
      overlay_dialog: false,
      showPayslipsList: true,
      bulkEmailDialog: false,
      employeeWise: true,
      searchText: '',
      searchTextMonthwise: '',
      users: [],
      userPayslips: [],
      monthwisePayslips: [],
      filterText: [],
      selectedUser: {
        personal: {},
        bank: {},
        education: {},
        work_experience: {},
        documents: {},
        emergency: {},
        reporting: {},
        leaves: {},
        salary: {},
        config: {}
      },
      selectedPayMonth: {
        compensation: {}
      },
      payslipData: {},
      company_data: {
        letterDetail: {}
      },
      users: [],
      company: "647891f4db2d9a5f80b45179",
      payrollProcess: [],
      configuration: {},
      companies: [],
    }
  },
  async asyncData({ app, store }) {
    const token = store.getters.getToken
    const AuthStr = 'Bearer '.concat(token);
    let config = {
      fixed: 1,
      earning: 1,
      deduction: 1,
      recurring_earning: 1,
      recurring_deduction: 1,
      PAYSLIP_DOWNLOAD_BASE_URL: 1,
      SYSTEM_EMAIL_ID: 1,
      DEV_EMAIL: 1,
    }





    return {
      // configuration: payroll_config,
      // payrollProcess : payrollProcessData,
    }
  },
  async mounted() {
    await this.getAllCompanies();
    await this.getPayrollDetails();
    this.users = this.$store.getters.getUsers.filter(a => a.company_id == this.company) //FIXME - This might need to be fetched if needed
    // Load payslip data on mount to ensure filterText is populated
    await this.onChangeLoadCompanyPayslipData()
    // await this.selectEmp(this.selectedUser)
    // await this.selectEmpForMonthwise(this.selectedPayMonth)
  },
  methods: {
    async getMonthlyPaySlips() {
      const token = this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)
      // this.employeeWise = !this.employeeWise
      await this.$axios.$post('payslip/monthlyPaySlips/' + this.company, { headers: { Authorization: AuthStr } })
        .then(res => {
          if (res && res.success) {
            this.payrollProcess = res.data
            this.monthwisePayslips = this.payrollProcess[0].PaySlips
          }
        }).catch();
    },
    async getAllCompanies() {
      const token = this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)
      let body = {
        company_name: 1,
        _id: 1,
        logo: 1
      }
      await this.$axios.$post('companies/all/companies_req_fields', body, { headers: { Authorization: AuthStr } })
        .then(async res => {
          this.companies = res.data
          this.company = res.data[0]._id
          await this.onChangeLoadCompanyPayslipData();
        }).catch(err => {
          console.log(err)
        })
    },
    async getPayrollDetails() {
      const token = this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)
      const payroll_body = {
        fixed: 1,
        earning: 1,
        deduction: 1,
        recurring_earning: 1,
        recurring_deduction: 1,
        PAYSLIP_DOWNLOAD_BASE_URL: 1,
        SYSTEM_EMAIL_ID: 1,
        company_ID: "All"
      }
      await this.$axios.$post('payrollconfig/getPayrollConfig', payroll_body, { headers: { Authorization: AuthStr } })
        .then(res => {
          this.configuration = res.data
        }).catch(err => console.log(err))
    },
    async downloadPDF_payslip(payslipData) {
      console.log(payslipData, "payslipData")
      const token = this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)
      this.overlay_dialog = true
      if (payslipData && payslipData.hasOwnProperty('payslip_url') && payslipData.payslip_url.length > 0) {
        this.overlay_dialog = false
        window.open(payslipData.payslip_url)
      } else {
        await this.$axios.$get('payslip/downloadPaySlip/' + payslipData._id, { headers: { Authorization: AuthStr } })
          .then(res => {
            if (res && res.hasOwnProperty('payslip_url') && res.payslip_url.length > 0) {
              window.open(res.payslip_url)
              this.overlay_dialog = false
              // this.$router.go()
            }
          }).catch(e => console.log(e));
      }
    },
    async onChangeLoadCompanyPayslipData() {
      const token = this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)

      this.filterText = []
      if (this.employeeWise) {
        await this.$axios.$post('payslip/getPlaySlips/' + this.company, { headers: { Authorization: AuthStr } })
          .then(async res => {
            if (res && res.success) {
              this.filterText = res.data
            }
          }).catch();
      } else {
        this.getMonthlyPaySlips();
      }




    },
    // companyDetails(val){
    //     let abc = this.companies.filter(a=>a._id == val)
    //     return abc.length>0 ? abc[0] :[]
    // },
    handleSearch() {
      if (this.searchText) {
        var s = this.searchText;
        // Add null check for filterText
        if (!this.filterText || !Array.isArray(this.filterText)) {
          console.warn('filterText is not available for search');
          return;
        }
        let returnData = _.filter(this.filterText, function (value) {
          return (
            value.first_name.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            value.last_name.toLowerCase().indexOf(s.toLowerCase()) > -1
            // value.personal.designation.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // value.reporting.department.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // value.reporting.team.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // value.email.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // value.emp_id.toLowerCase().indexOf(s.toLowerCase()) > -1
          )
        })
        this.filterText = _.orderBy(returnData, ['first_name'], ['asc'])
        // return
      }
      else {
        this.onChangeLoadCompanyPayslipData();
      }
    },
    getCompanyData(id) {
      if (this.companies.length > 0) {
        let abc = this.companies.filter(a => a._id == id)

        return abc.length > 0 ? abc[0] : {}
      }
    },
    reset() {
      this.$refs.form.reset()
    },
    loadPayslipsForPreview(data) {
      this.showPayslipsList = false
      this.payslipData = data;
    },
    async selectEmp(data) {
      // const token = this.$store.getters.getToken
      // const AuthStr = 'Bearer '.concat(token)
      // // console.log(data , "data")
      // this.selectedUser = data
      // await this.$axios.$get('payslip/' + data._id + "/" + this.company, { headers: { Authorization: AuthStr } })
      //   .then(res => {
      //     if(res && res.success){
      //       this.userPayslips = res.data;
      //       this.payslipData = res.data.length > 0 ? res.data[0] : {}
      //     }
      //   }).catch();

      this.selectedUser = data
      // Add null check for filterText
      if (!this.filterText || !Array.isArray(this.filterText)) {
        console.warn('filterText is not available for selectEmp');
        return;
      }
      const filteredUser = this.filterText.filter((user) => user._id == data._id);
      if (filteredUser.length > 0) {
        this.userPayslips = filteredUser[0].paySlips || [];
        this.payslipData = this.userPayslips[0] || {};
      } else {
        console.warn('User not found in filterText');
        this.userPayslips = [];
        this.payslipData = {};
      }



    },
    async selectEmpForMonthwise(data) {
      this.monthwisePayslips = data.PaySlips;
      // this.payslipData = res.data.length > 0 ? res.data[0] : {}
    },
    send_payslip_all() {
      const token = this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)

      var dateFormat = function (value) {
        if (value) {
          return moment(String(value), 'YYYY/MM').format('MMM, YYYY')
        }
      }

      let arr = this.monthwisePayslips

      for (let index = 0; index < arr.length; index++) {
        let emailBody = {
          hr_email: '',
          email: '',
          subjectMsg: '',
          eMessage: ''
        }
        let abc = arr[index]
        console.log(abc, "ABC")
        let url = this.configuration.PAYSLIP_DOWNLOAD_BASE_URL + '/payslips/preview/' + abc.user_id


        emailBody.email = [abc.user.email],
          // emailBody.email =  ["abhishek@nathandigital.com"]
          emailBody.subjectMsg = "Payslip for the month of " + dateFormat(abc.pay_month)
        emailBody.eMessage = this.services_email.getBulkPayslipEmailTemplate(url, dateFormat(abc.pay_month), abc.users.full_name)
        this.$axios.$post('payslip/send-email', emailBody, { headers: { Authorization: AuthStr } })
          .then(res => { console.log(res) })
          .catch();
      }

      this.bulkEmailDialog = false
    },
  },
  computed: {
    // computedCompanies() {
    //   if (this.companies && this.companies.length > 0) {
    //     return _.orderBy(this.companies, ['company_name'], ['asc'])
    //   } else return []
    // },
    // filterText() {
    //   let users = this.users.filter(a => a.company_ID == this.company)
    //   if (this.searchText) {
    //     var s = this.searchText;
    //     let returnData = _.filter(users, function (value) {
    //       return (
    //         value.first_name.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
    //         value.last_name.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
    //         value.personal.designation.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
    //         value.reporting.department.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
    //         value.reporting.team.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
    //         value.email.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
    //         value.emp_id.toLowerCase().indexOf(s.toLowerCase()) > -1
    //       )
    //     })
    //     return _.orderBy(returnData, ['first_name'], ['asc'])
    //   }
    //   else {
    //     return _.orderBy(users, ['first_name'], ['asc'])
    //   }
    // },
    filterTextMonthWise() {
      let monthwise = this.monthwisePayslips
      let users = this.users
      var getUserName = function (val) {
        if (val) {
          let abc = users.filter(a => a._id == val)
          return abc.length > 0 ? abc[0].first_name + ' ' + abc[0].last_name : ''
        }
        else {
          return ''
        }
      }

      if (this.searchTextMonthwise) {
        var s = this.searchTextMonthwise
        let returnData = _.filter(monthwise, function (value) {
          return (
            getUserName(value.user_id).toLowerCase().indexOf(s.toLowerCase()) > -1
          )
        })
        return _.orderBy(returnData, ['full_name'], ['asc'])
      }
      else {
        return _.orderBy(monthwise, ['full_name'], ['asc'])
      }
    }
  }
}
</script>
