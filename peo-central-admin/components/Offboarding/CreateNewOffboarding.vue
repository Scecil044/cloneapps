<template>
  <v-card id="card" style="margin-bottom: 1rem !important">
    <v-container fluid>
      <v-card-title id="card-title" class="mb-4">
        <h4 class="text--text">Create New Offboarding</h4>
        <div class="flex_row justify-lg-space-between">
          <v-btn class="tall__btn mr-2" color="lightgray" outlined @click="closeProcess"
            :disabled="loading">Cancel</v-btn>
          <v-img src="/animated/ring.svg" v-if="loading" width="40px" height="40px" contain class=""></v-img>
          <v-btn v-else class="tall__btn px-6" :disabled="!this.has_valid_date_of_joining" color="primary"
            @click="processRequest()">
            Submit</v-btn>
        </div>
      </v-card-title>
      <v-row class="mb-2">
        <v-col cols="12" class="py-0 px-0">
          <span class="span_leadHeading">EMPLOYEE DETAILS</span>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <template v-if="!is_modal">
              <v-col  cols="12" md="3" lg="3" class="pl-0 pr-12">
                <CustomInputContainer label="Employer Name">
                  <div slot="input">
                    <v-autocomplete ref="first_name" :items="employers" class="proposalDialog_date_field2"
                      :disabled="!['isSuperAdmin'].includes(userRole)"
                      item-text="company_name" :return-object="false" item-value="_id"
                      v-model.trim="offboarding.company_id" placeholder="Select Employer"
                      :menu-props="{ closeOnContentClick: true }" dense solo
                      @change="getEmployeesList(offboarding.company_id)" dense></v-autocomplete>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col  cols="12" md="3" lg="3" class="pl-0 pr-12">
                <CustomInputContainer label="Full Name">
                  <div slot="input">
                    <v-select :items="employees" placeholder="Select Employee" v-model="offboarding.user_id" solo dense
                      :item-text="(item) => `${item.first_name} ${item.last_name}`
                        " item-value="_id" class="proposalDialog_date_field2" append-icon="fa-chevron-down"
                      @change="getUserDetails(offboarding.user_id)"></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
            </template>
            <v-col v-else cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer label="Full Name">
                <div slot="input">
                  <v-text-field disabled v-model="employeeFullName"  dense
                    solo  :readonly="true" class="proposalDialog_date_field2" />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer label="Last Working Day" :mandatory="true">
                <div slot="input">
                  <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="offboarding.last_working_day" placeholder="mm/dd/yy"
                        class="proposalDialog_date_field2" solo dense readonly v-bind="attrs" v-on="on"
                        :rules="main_rule">
                        <template v-slot:append>
                          <div>
                            <CalenderSvg />
                          </div>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker v-model="offboarding.last_working_day"
                      @change="getEmployeeInfo(), eligibleNumberOfLeaves" @input="date_menu = false" />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer label="Exit Reason">
                <div slot="input">
                  <v-select :items="exitReason" placeholder="End of Contract" solo dense
                    class="proposalDialog_date_field2" v-if="exitReason.length >= 1" v-model="offboarding.exit_reason"
                    append-icon="fa-chevron-down">
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer label="`Joining Date" :mandatory="true">
                <div slot="input">
                  <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-model="offboarding.date_of_joining" placeholder="mm/dd/yy"

                        class="proposalDialog_date_field2" solo dense readonly v-bind="attrs" v-on="on"
                        :rules="main_rule">
                        <template v-slot:append>
                          <div>
                            <CalenderSvg />
                          </div>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker @change="getEmployeeInfo(), eligibleNumberOfLeaves" v-model="offboarding.date_of_joining" @input="exp_date_menu = false" />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12" v-if="userDetails && userDetails.employment">
              <CustomInputContainer label="Employment Type">
                <div slot="input">
                  <v-text-field disabled v-model="userDetails.employment.employment_type" placeholder="Unlimited" dense
                    solo :rules="main_rule" class="proposalDialog_date_field2" />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row v-if="offboarding.exit_reason == 'Termination'">
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer label="Reasons for Termination">
                <div slot="input">
                  <v-select :items="[
                    'Probation Termination',
                    'Redundancy',
                    'Employee Misconduct',
                    'Performance',
                  ]" placeholder="End of Contract" solo dense class="proposalDialog_date_field2"
                    v-model="offboarding.terminationReason" append-icon="fa-chevron-down">
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="
        userDetails &&
        userDetails.employment &&
        userDetails.employment.employment_type &&
        !userDetails.employment.employment_type.includes('Mission Visa')
      ">
        <v-col cols="12" class="py-0 px-0">
          <span class="span_leadHeading">SALARY PAYABLE</span>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <div style="width: 55%">
                <CustomInputContainer label="Salary Unpaid">
                  <div slot="input">
                    <v-text-field v-model="offboarding.salary_payable.salary_unpaid" placeholder="Enter Days "
                      @change="getSelectedEmpSalary()" class="proposalDialog_date_field2" solo dense>
                      <template v-slot:append>
                        <div>
                          <span>Days</span>
                        </div>
                      </template>
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </div>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer :label="'Basic Salary (Monthly:' +
                old_salary_payable.basic_salary +
                ') '
                ">
                <div slot="input">
                  <v-text-field v-model="offboarding.salary_payable.basic_salary" placeholder="Enter Basic Salary "
                    class="proposalDialog_date_field2" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer :label="'Other Allowance (Monthly:' +
                old_salary_payable.other_allowance +
                ') '
                ">
                <div slot="input">
                  <v-text-field v-model="offboarding.salary_payable.other_allowance" placeholder="Add Allowance"
                    class="proposalDialog_date_field2" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer :label="'Total Fixed (Monthly:' +
                offboarding.salary_payable.total_fixed +
                ') '
                ">
                <div slot="input">
                  <v-text-field v-model="offboarding.salary_payable.total_fixed" placeholder="total"
                    class="proposalDialog_date_field2" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer :label="'Total Salary Payable (Monthly:' +
                offboarding.salary_payable.total_salary_payable +
                ') '
                ">
                <div slot="input">
                  <v-text-field v-model="offboarding.salary_payable.total_salary_payable" placeholder="Total Salary"
                    class="proposalDialog_date_field2" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <span class="span_leadHeading">LEAVE ENCASEMENT</span>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer label="Leave Type">
                <div slot="input">
                  <v-select :items="['Working Days', 'Calendar Days']" @change="eligibleNumberOfLeaves"
                    placeholder="Leave Type" solo dense class="proposalDialog_date_field2" v-if="exitReason.length >= 1"
                    v-model="offboarding.leave_encashment.leavetype" append-icon="fa-chevron-down">
                  </v-select>
                  <p v-else class="error--text mb-5 mt-5">
                    Please Select Exit Reason
                  </p>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <div style="width: 55%">
                <CustomInputContainer label="Leave Balance">
                  <div slot="input">
                    <v-text-field @change="eligibleNumberOfLeaves" v-model="offboarding.leave_encashment.leave_balance"
                      placeholder="Enter Days " class="proposalDialog_date_field2" solo dense>
                      <template v-slot:append>
                        <div>
                          <span>Days</span>
                        </div>
                      </template>
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </div>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <CustomInputContainer label="Amount">
                <div slot="input">
                  <v-text-field v-model="offboarding.leave_encashment.amount" placeholder="Enter Amount "
                    class="proposalDialog_date_field2" solo hideDetails dense>
                  </v-text-field>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <span class="span_leadHeading">GRATUITY {{ !offboarding.gratuity?.eligible ? '( Not Applicable: Less than 1 year of service)': '' }}</span>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <div style="width: 55%">
                <CustomInputContainer label="Gratuity Days">
                  <div slot="input">
                    <v-text-field v-model="offboarding.gratuity.gratuity_days" placeholder="Enter days"
                      class="proposalDialog_date_field2" solo disabled dense></v-text-field>
                  </div>
                </CustomInputContainer>
              </div>
            </v-col>
            <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
              <div style="width: 55%">
                <CustomInputContainer label="Gratuity Amount">
                  <div slot="input">
                    <v-text-field v-model="offboarding.gratuity.gratuity_amount" placeholder="Enter Amount "
                      class="proposalDialog_date_field2" solo disabled dense></v-text-field>
                  </div>
                </CustomInputContainer>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <div v-if="offboarding.support_letter.length > 0">
        <v-col cols="12" class="py-0 px-0">
          <span class="span_leadHeading">Support Letter</span>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
              <div class="d-flex align-center"
                @click="openDocument(offboarding.support_letter.length.support_letter[0])">
                <span class="pr-2">
                  <PdfSvg />
                </span>
                File
              </div>
            </v-col>
          </v-row>
        </v-col>
      </div>
      <template
        v-if="offboarding.support_letter.length == 0 && ['Mission Visa (3 Months Single Entry)'].includes(userDetails.employment.employment_type)">
        <v-col cols="12" class="py-0 px-0">
          <span class="span_leadHeading">Exit Stamp (if any)</span>
        </v-col>
        <v-col cols="12" class="py-0 px-0">
          <v-row>
            <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
              <FileDropzone @fileHandler="clickedDocument($event)" />
            </v-col>
          </v-row>
        </v-col>
      </template>
    </v-container>
  </v-card>
</template>

<script>
import '@/assets/scss/utils/_newLead.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import gratuity from '~/plugins/gratuity'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import PdfSvg from '@/assets/images/icons/pdf.svg'

export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    CalenderSvg,
    FileDropzone,
    PdfSvg,
  },
  props: {
    is_modal: {
      type: Boolean,
      default: false,
    },
    selectedRenewal: {
      type: Object,
      required: false,
    },
    reason_for_unsuccessful: {
      type: String,
      required: false,
    }
  },
  data() {
    return {
      gratuityCal: gratuity,
      empFull_name: '',
      employer_name: '',
      contract_type: '',
      basic_salary: '',
      housing_allowance: '',
      other_allowance: '',
      car_allowance: '',
      total_allowance: '',
      petrol_allowance: '',
      total_salaryPayable: '',
      leave_balance: '',
      amount_balance: '',
      gratuity_amount: '',
      newLogo: '1.jpg',
      loading: false,

      exitReason: ['Termination', 'Resignation', 'End of Contract'],

      //rules
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],

      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),
      limit: '10',
      page: 0,
      employees: [],
      userDetails: {
        employment: {},
      },
      companyDetails: {},
      old_salary_payable: {
        salary_unpaid: '',
        basic_salary: '',
        housing_allowance: '',
        other_allowance: '',
        car_allowance: '',
        total_fixed: '',
        petrol_allowance: '',
        total_salary_payable: '',
      },
      offboarding: {
        user_id: '',
        company_id: this.$store.getters.getSelectedCompany,
        process_type: 'offboarding',
        attachments: [],
        comments: '',
        status: 'new',
        last_working_day: new Date().toISOString().substr(0, 10),
        exit_reason: '',
        salary_payable: {
          salary_unpaid: '',
          basic_salary: '',
          housing_allowance: '',
          other_allowance: '',
          car_allowance: '',
          total_fixed: '',
          petrol_allowance: '',
          total_salary_payable: '',
        },
        leave_encashment: {
          leave_balance: '',
          amount: '',
        },
        gratuity: {
          gratuity_amount: '',
          eligible: true,
        },
        support_letter: [],
      },
      employers: [],
      employeeFullName: ''
    }
  },
  methods: {
    closeProcess() {
      if (this.is_modal) {
        this.$emit('close')
        this.$emit('refresh')
      } else {
        this.$router.push('/offboarding')
      }
    },
    async getEmployeesList(company_id) {
      this.page = 1
      this.employees = []
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      if (company_id) {
        await this.$axios
          .$post(
            `/users/list/users/companyid/${company_id}?page=${this.page
            }&limit=${10000}`,
            { headers: { Authorization: AuthStr } }
          )
          .then((response) => {
            this.employees = response.usersResult.filter(
              (a) => a.user_status == 'active'
            )
          })
      }
    },
    async getEmployersList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.page = 1
      const response = await this.$axios
        .$post(`/companies/list/dropdown?page=${this.page}&limit=10000`, {
          headers: { Authorization: AuthStr },
        })
      this.employers = response
    },
    isValidDate(dateString) {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;

      // Format as YYYY-MM-DD for v-date-picker
      return date.toISOString().split('T')[0];
    },
    async getUserDetails(user_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        const response = await this.$axios
          .$get(`/users/${user_id}`, { headers: { Authorization: AuthStr } })
        // validate date_of_joining
        const date_of_joining = response?.employment?.date_of_joining || response.date_of_joining
        if (!this.isValidDate(date_of_joining)) {
          response.date_of_joining = ''
        } else {
          this.offboarding.date_of_joining = this.formatDate(date_of_joining)
          response.date_of_joining = date_of_joining
        }



        this.userDetails = response
        console.log("*** These are the response at this point ***", this.userDetails)


        // this.old_salary_payable.salary_unpaid = this.userDetails.salary.salary_unpaid ? this.userDetails.salary.salary_unpaid : '0'
        this.old_salary_payable.basic_salary = this.userDetails.salary
          .basic_salary
          ? this.userDetails.salary.basic_salary
          : '0'
        this.old_salary_payable.housing_allowance = this.userDetails.salary
          .housing_allowance
          ? this.userDetails.salary.housing_allowance
          : '0'
        this.old_salary_payable.other_allowance = this.userDetails.salary
          .other_allowance
          ? this.userDetails.salary.other_allowance
          : '0'
        this.old_salary_payable.car_allowance = this.userDetails.salary
          .car_allowance
          ? this.userDetails.salary.car_allowance
          : '0'
        this.old_salary_payable.total_fixed = this.userDetails.salary
          .total_fixed
          ? this.userDetails.salary.total_fixed
          : '0'
        this.old_salary_payable.petrol_allowance = this.userDetails.salary
          .petrol_allowance
          ? this.userDetails.salary.petrol_allowance
          : '0'
        this.old_salary_payable.total_salary_payable = this.userDetails.salary
          .total_salary_payable
          ? this.userDetails.salary.total_salary_payable
          : '0'

        // this.getCompanyDetails(this.userDetails.company_id)

      } catch (error) {
        console.log("*** Error at getUserDetails ***", error)
      }

    },
    // getCompanyDetails(company_id) {
    //   const AuthStr = 'Bearer '.concat(this.$store.state.token)

    //   this.$axios.$get(`/companies/comp/${company_id}`, { headers: { Authorization: AuthStr } })
    //     .then((response) => {
    //       this.companyDetails = response
    //     })
    // },
    clickedDocument($event) {
      this.documentUpload($event)
    },
    async documentUpload(event) {
      if (event == undefined || !event.name) return
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      const fd = new FormData()
      fd.append('documents', event)

      await this.$axios
        .$post(`/documents/simpleupload`, fd, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.offboarding.support_letter = []
          this.offboarding.support_letter.push(response[0])
        })
    },
    openDocument(val) {
      window.open(val)
    },
    async processRequest() {
      if (this.is_modal) {
        await this.createOffboardingFromRenewal()
      } else {
        await this.createNewOffboarding()
      }
    },
    async createNewOffboarding() {
      try {
        this.loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.offboarding.employment_type =
          this.userDetails.employment.employment_type
        // this.offboarding.date_of_joining = this.userDetails.date_of_joining

        const response = await this.$axios
          .$post('/offboardings/', this.offboarding, {
            headers: { Authorization: AuthStr },
          })
        this.loading = false
        this.$nuxt.$emit('fetchOffboardingList', true)
        this.closeProcess()
      } catch (error) {
        console.log('Error: ', error.message)
      } finally {
        this.loading = false
      }
    },
    async createOffboardingFromRenewal() {
      try {
        this.loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.offboarding.employment_type =
          this.userDetails.employment.employment_type
        this.offboarding.date_of_joining = this.formatDate(this.userDetails.date_of_joining)

        this.offboarding.user_id = this.selectedRenewal.user_id,
          this.offboarding.id = this.selectedRenewal._id,
          this.offboarding.module = 'renewals'
        this.offboarding.reason_for_unsuccessful = this.reason_for_unsuccessful


        const response = await this.$axios
          .$post('/generic/process/mark/unsuccessfull/', this.offboarding, {
            headers: { Authorization: AuthStr },
          })
        this.loading = false
        // this.$nuxt.$emit('fetchOffboardingList', true)
        this.closeProcess()
      } catch (error) {
        console.log('Error: ', error.message)
      } finally {
        this.loading = false
      }
    },
    async getEmployeeInfo() {
      await this.getEmpGratuityCal()
      await this.getSelectedEmpSalary()
    },
    calculateGratuityFromDate(basicSalary, joiningDateString) {
      const joiningDate = new Date(joiningDateString);
      const today = new Date();

      const diffTime = Math.abs(today - joiningDate);
      const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const yearsOfService = totalDays / 365;

      if (yearsOfService < 1) {
        return {
          daysWorked: totalDays,
          years: yearsOfService.toFixed(2),
          amount: 0,
          eligible: false
        };
      }

      let gratuity = 0;

      if (yearsOfService >= 1 && yearsOfService < 5) {
        gratuity = (basicSalary * 21 / 30) * yearsOfService;
      } else if (yearsOfService >= 5) {
        const firstFive = (basicSalary * 21 / 30) * 5;
        const additionalYears = yearsOfService - 5;
        const additionalGratuity = (basicSalary * 30 / 30) * additionalYears;
        gratuity = firstFive + additionalGratuity;

        // Cap at 2 years' basic salary
        const maxGratuity = basicSalary * 24;
        if (gratuity > maxGratuity) {
          gratuity = maxGratuity;
        }
      }

      return {
        daysWorked: totalDays,
        years: yearsOfService.toFixed(2),
        amount: gratuity.toFixed(2),
        eligible: true,
      };
    },
    getEmpGratuityCal() {
      if (this.offboarding.last_working_day && this.userDetails?.salary) {
        // let abc = this.userDetails
        // let gratuityArr = []
        // gratuityArr.push(abc)
        // let gratuityCal = this.gratuityCal.getGratuityCalculations(
        //   gratuityArr,
        //   new Date(this.offboarding.last_working_day),
        //   [],
        //   ''
        // )
        // console.log('gratuity updated: ', )
        // console.log('gratuity days: ', gratuityCal[0].days_current_month)
        // console.log("What is the gratuity cal", gratuityCal)
        const gratuity = this.gratuityCal.calculateGratuityFromDate(this.userDetails?.salary?.basic_salary,  new Date(this.offboarding.date_of_joining))
        console.log('gratuity cal: ', gratuity)
        this.offboarding.gratuity.gratuity_amount =
          gratuity.amount
        this.offboarding.gratuity.eligible = gratuity.eligible
        this.offboarding.gratuity.gratuity_days =
          gratuity.daysWorked
      }
    },
    eligibleNumberOfLeaves() {
      const oneDay = 24 * 60 * 60 * 1000
      const firstDate = new Date(new Date().getFullYear(), 0, 1)
      const secondDate = new Date(this.offboarding.last_working_day)
      const leavesPerDay = 22 / 365
     // const userPendingLeaves = this.userDetails.leaves.annual_leaves - 22

      const diffDays = this.offboarding.leave_encashment.leave_balance

      const divfactor =
        this.offboarding.leave_encashment.leavetype == 'Working Days' ? 264 : 365

      // this.offboarding.leave_encashment.leave_balance = diffDays.toFixed(1)
      this.offboarding.leave_encashment.amount = (
        (this.old_salary_payable.basic_salary) * (12 / divfactor) *
        diffDays
      ).toFixed(2)
    },
    getSelectedEmpSalary() {
      let abc = {}
      console.log("*** old salary being ***", this.old_salary_payable)
      for (var key in this.old_salary_payable) {
        abc[key] = ''
      }

      let a = this.offboarding.last_working_day
      let year = a.substr(0, 4)
      let mon = a.substr(0, 7).substr(5)
      let number_of_days_in_month = new Date(year, mon, 0).getDate()
      var no_of_days = parseInt(a.substr(8, 10)).toString()

      for (var key in abc) {
        abc[key] = (
          (this.old_salary_payable[key] / number_of_days_in_month) *
          no_of_days
        ).toFixed(2)
      }

      this.offboarding.salary_payable.salary_unpaid = no_of_days
      this.offboarding.salary_payable.basic_salary = abc.basic_salary
      this.offboarding.salary_payable.car_allowance = abc.car_allowance
      this.offboarding.salary_payable.housing_allowance = abc.housing_allowance
      this.offboarding.salary_payable.other_allowance = abc.other_allowance
      this.offboarding.salary_payable.petrol_allowance = abc.petrol_allowance
      this.offboarding.salary_payable.total_fixed = this.userDetails.salary
        .total_fixed
        ? this.userDetails.salary.total_fixed
        : '0'
      this.offboarding.salary_payable.total_salary_payable = abc.total_fixed

      this.eligibleNumberOfLeaves
    },
  },
  async mounted() {
    if (this.is_modal) {
      await this.getEmployeesList(this.selectedRenewal.company_id)
      // await this.getEmployersList()
      // if (this.employees.length) {
      //   this.offboarding.user_id = this.employees.find((el) => el._id == this.selectedRenewal.user_id)
      await this.getUserDetails(this.selectedRenewal.user_id)
        .then(() => {
          this.employeeFullName = this.userDetails?.first_name + " " + this.userDetails?.last_name
          this.offboarding.company_id = this.selectedRenewal.company_id
          this.offboarding.user_id = this.selectedRenewal.user_id
      })

      // }
    } else {
      await this.getEmployeesList(this.$store.getters.getSelectedCompany)
      await this.getEmployersList()
    }
  },
  computed: {
    has_valid_date_of_joining() {
      return this.isValidDate(this.userDetails.date_of_joining)
    },
    userRole() {
      return this.$store.getters.getThisUserRole
    }
  },
  watch: {
    'offboarding.user_id': {
      handler(newValue) {
        if (newValue == '' && this.employees.length == 0) {
          this.offboarding.salary_payable.salary_unpaid = ''
          this.offboarding.salary_payable.basic_salary = ''
          this.offboarding.salary_payable.car_allowance = ''
          this.offboarding.salary_payable.housing_allowance = ''
          this.offboarding.salary_payable.other_allowance = ''
          this.offboarding.salary_payable.petrol_allowance = ''
          this.offboarding.salary_payable.total_fixed = ''
          this.offboarding.salary_payable.total_salary_payable = ''
        }
      },
    },
    'userDetails.date_of_joining': {
      immediate: true,
      handler(newValue) {
        console.log('date_of_joining change detected', newValue)
        if (this.isValidDate(newValue)) {
          // calculate gratuity if valid date.
          this.getEmployeeInfo()
        }
      },
    }
  },
}
</script>
