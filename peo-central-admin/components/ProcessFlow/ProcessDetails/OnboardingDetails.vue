<template>
  <v-row>
    <v-col cols="12" v-if="loading && employeeDetails.length <= 0">
      <v-card class="d-flex align-center no-border_shadow"  color="card_bg" id="card" style="max-height: 600px">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-card>
    </v-col>
    <v-col cols="12" v-else>
      <v-card class="no-border_shadow" color="card_bg" id="card" style="max-height: 600px">
        <v-tabs v-model="tab" bg-color="primary">
          <v-tab href="#employee_details">Employee Details</v-tab>
          <v-tab href="#documents">Documents</v-tab>
        </v-tabs>
        <v-card-title id="card-title" class="mb-4">
        </v-card-title>
        <v-card-text id="card-text2" style="max-height: 10vh !important" class="dl__l overflow-y-auto">
          <v-tabs-items v-model="tab">
            <v-tab-item id="employee_details">
              <v-col cols="12" class="py-0 px-0">
                <div class="d-flex align-center">
                  <span class="span_btnB"> Employee Details</span>

                </div>
              </v-col>
              <!-- Employer DETAILS TABLE -->
              <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
                :headers="companyHeaders" :items="employeeDetails" hide-default-footer default-sort="false">
                <template v-slot:header.title="{ header }">
                  <div class=" d-flex  align-center pa-0 ">
                    <div>
                      <InfoSVG />
                    </div>
                    <div>
                      <th class="pl-2">{{ header.text }}</th>
                    </div>
                  </div>
                </template>
                <template v-slot:item="{ item, index }">
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Customer / Employer</td>
                    <td class=" d-flex align-center">
                      <img :src="item.company_logo" style="border-radius: 10px" width="30" height="30"
                        v-if="index === 0" class="mr-2" />
                      <!-- <BinanceSVG v-if="index === 0" class="mr-2" /> -->
                      {{ item.company_name }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">First Name</td>
                    <td class=" d-flex align-center">
                      {{ item.first_name }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Middle Name</td>
                    <td class=" d-flex align-center">
                      {{ item.middle_name ? item.middle_name : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Last Name</td>
                    <td class=" d-flex align-center">
                      {{ item.last_name ? item.last_name : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Place of Registration</td>
                    <td class=" d-flex align-center">
                      {{ item.place_of_registration ? item.place_of_registration : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                </template>
              </v-data-table>
              <!-- Employee CONTACTS TABLE -->
              <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5"
                :headers="contact_headers" :items="employeeDetails" hide-default-footer>
                <template v-slot:header.title="{ header }">
                  <div class=" d-flex  align-center pa-0 ">
                    <div>
                      <phoneSVG />
                    </div>
                    <div>
                      <th class="pl-2">{{ header.text }}</th>
                    </div>
                  </div>
                </template>
                <template v-slot:header.action="{ header }">
                  <th class=" d-flex justify-end ">
                    <v-btn class="customer_table_btn" outlined color="primary">{{ header.text }}</v-btn>
                  </th>
                </template>

                <template v-slot:item="{ item, }">
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Employee Email</td>
                    <td class="pb-2 pt-2">{{ item.email }} </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Phone</td>
                    <td class="pb-2 pt-2">{{ item.personal.phone ? item.personal.phone : '-' }} </td>
                    <td class=""> </td>
                  </tr>
                </template>
              </v-data-table>
              <!-- Employee DETAILS TABLE -->
              <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
                :headers="EmployeeHeaders" :items="employeeDetails" hide-default-footer>
                <template v-slot:header.title="{ header }">
                  <div class=" d-flex  align-center pa-0 ">
                    <div>
                      <InfoSVG />
                    </div>
                    <div>
                      <th class="pl-2">{{ header.text }}</th>
                    </div>
                  </div>
                </template>


                <template v-slot:item="{ item, }">
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Designation</td>
                    <td class=" d-flex align-center">
                      {{ item.employment.designation }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Date of Join</td>
                    <td class=" d-flex align-center">
                      {{ item.date_of_joining }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                <td class="pr-0" style="width: 215px !important;">End of Contract</td>
                <td class=" d-flex align-center">
                  {{ item.end_date }}
                </td>
                <td class=""> </td>
              </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Probation Period</td>
                    <td class=" d-flex align-center" v-if="item.employment">
                      {{ item.employment.probation_period ? item.employment.probation_period : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Notice Period</td>
                    <td class=" d-flex align-center" v-if="item.employment">
                      {{ item.employment.notice_period ? item.employment.notice_period : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Working Days</td>
                    <td class=" d-flex align-center" v-if="item.employment">
                      {{ item.employment.working_days ? item.employment.working_days : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Contract Type</td>
                    <td class=" d-flex align-center" v-if="item.employment">
                      {{ item.employment.contract_type ? item.employment.contract_type : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Visa Issuance Authority</td>
                    <td class=" d-flex align-center">
                      {{ item.visa_sponsor ? item.visa_sponsor : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Current Location</td>
                    <td class=" d-flex align-center">
                      {{ item.user_location ? item.user_location : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">VIP Status</td>
                    <td class=" d-flex align-center">
                      {{ item.vip ? item.vip : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Type of Visa</td>
                    <td class=" d-flex align-center">
                      {{ item.visa_type ? item.visa_type : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Employment Type</td>
                    <td class=" d-flex align-center">
                      {{ item.employment.employment_type ? item.employment.employment_type : '-' }}
                    </td>
                    <td class=""> </td>
                  </tr>
                </template>

              </v-data-table>
              <!-- Payroll DETAILS TABLE -->
              <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
                :headers="payrollHeaders" :items="employeeDetails" hide-default-footer>
                <template v-slot:header.title="{ header }">
                  <div class=" d-flex  align-center pa-0 ">
                    <div>
                      <WalletSVG />
                    </div>
                    <div>
                      <th class="pl-2">{{ header.text }}</th>
                    </div>
                  </div>
                </template>
                <template v-slot:header.action="{ header }">
                  <th class=" d-flex justify-end ">
                    <v-btn class="customer_table_btn" outlined color="primary">{{ header.text }}</v-btn>
                  </th>
                </template>


                <template v-slot:item="{ item, }">
                  <tr>

                    <td class="pr-0" style="width: 215px !important;">Invoice Date</td>
                    <td class=" d-flex align-center" v-if="item.payroll_details">
                      {{ item.payroll_details.invoice_date }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Payment Due Date</td>
                    <td class=" d-flex align-center" v-if="item.payroll_details">
                      {{ item.payroll_details.payment_due_notification }}
                    </td>
                    <td class=""> </td>
                  </tr>
                  <tr>
                    <td class="pr-0" style="width: 215px !important;">Salary Date</td>
                    <td class=" d-flex align-center" v-if="item.payroll_details">
                      {{ item.payroll_details.salary_payment_date }}
                    </td>
                    <td class=""> </td>
                  </tr>
                </template>

              </v-data-table>
            </v-tab-item>

            <v-tab-item id="documents">
              <Document :employeeDetails="selectedEmployeeDetails" />
            </v-tab-item>


          </v-tabs-items>



        </v-card-text>

      </v-card>
    </v-col>

  </v-row>
</template>

<script>
import EditSvg from '@/assets/images/Customer/edit.svg'
import InfoSVG from '@/assets/images/Customer/info.svg'
import phoneSVG from '@/assets/images/Customer/phone.svg'
import WalletSVG from '@/assets/images/Customer/wallet.svg'
import FlagSVG from '@/assets/images/FlagUae.svg'
import BinanceSVG from '@/assets/images/icons/binance-logo.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import Document from '~/components/Visa/ProcessDetails/Documents.vue'


export default {
  props: { process_id: String },
  components: {
    InfoSVG,
    BinanceSVG,
    customerDefaultIcon,
    FlagSVG,
    EditSvg,
    phoneSVG,
    WalletSVG,
    Document
  },
  data() {
    return {
      tab: 'employee_details',
      selectedEmployeeDetails: [],
      legal_entity: '',
      parent_company_id: '',
      parent_company: '',
      companyHeaders: [
        { text: 'EMPLOYEE DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      companyDetails: [
        {
          title: 'Customer / Employer',
          description: 'company_name',

        },
        {
          title: 'First Name',
          description: 'Sam',
        },
        {
          title: 'Middle Name',
          description: '-',
        },
        {
          title: 'Last Name',
          description: '-',
        },
        {
          title: 'Place of Registration',
          description: 'Marina, Dubai',
        },

      ],
      EmployeeHeaders: [
        { text: 'EMPLOYMENT DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      EmployeeDetail: [

        {
          title: 'Designation',
          description: 'Front-End-Dev',

        },
        {
          title: 'Date of Join',
          description: '01/01/2023',
        },
        {
          title: 'Probation Period',
          description: '6 months',
        },
        {
          title: 'Notice Period',
          description: '3 months',

        },
        {
          title: 'Working days',
          description: 'Mon - Fri',
        },
        {
          title: 'Contract Duration',
          description: '2 Years',
        },
        {
          title: 'Gender',
          description: 'Male',

        },
        {
          title: 'Marital Status',
          description: 'Married',
        },
        {
          title: 'Nationality',
          description: 'Swiss',
        },
        {
          title: 'Allergies',
          description: 'Peanut, Gluten',

        },
        {
          title: 'Designation',
          description: 'Admin',
        },
        {
          title: 'DOJ',
          description: '21-2-2022',
        },
        {
          title: 'Work Location',
          description: 'UAE',
        },
        {
          title: 'Address',
          description: 'Marina, Dubai',
        },
        {
          title: 'Specialty',
          description: 'React, Vue',
        },
        {
          title: 'Skill Sets',
          description: 'JavaScript, CSS, HTML, React, Vuejs',
        },



      ],
      payrollHeaders: [
        { text: 'PAYROLL SCHEDULE', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
      ],
      payrollDetails: [

        {
          title: 'Invoice Date ',
          description: 'Every 14th',

        },
        {
          title: 'Payment Due Date',
          description: 'Every 20th',
        },
        {
          title: 'Salary Date',
          description: 'Every 28th',
        },


      ],
      contact_headers: [
        { text: 'CONTACT', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'start', hideSortIcon: true, sortable: false },

      ],
      contact_details: [
        {
          title: 'Employee Email',
          description: 'akshay@nathanhr.com',
          phone: '0578-545-895',
          email: 'akshay@nathanhr.com',

        },

        {
          title: 'Phone',
          description: '+971 5897545262',
          phone: '0578-545-895',
          email: ' operation@binance.com',

        },

      ],
      loading: false,
      employeeDetails: []
    }
  },
  // @click="handleNewLead()"
  methods: {
    async getEmployeeDetails(id) {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/onboardings/employee/details/${this.process_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.loading = false
          this.employeeDetails = response
          this.employersDetails(this.employeeDetails[0].user_id)
        })
    },
    async employersDetails(user_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      // this.showDetails = false
      await this.$axios.$post(`/users/employee/details/${user_id}`, {}, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.selectedEmployeeDetails = response

          if (this.selectedEmployeeDetails && this.selectedEmployeeDetails.length > 0 && this.selectedEmployeeDetails[0].hasOwnProperty('employment') && this.selectedEmployeeDetails[0].employment.visa_sponsor_type != '') {
            if (this.selectedEmployeeDetails[0].employment.visa_sponsor_type == 'Dynamic Employment Services') {
              this.parent_company_id = '62fb3df39f14e35fe7ed9c9a'
              this.parent_company = '63493cb4491224c1c039536a'
              this.legal_entity = 'Dynamic Employment Services'
            }

            if (this.selectedEmployeeDetails[0].employment.visa_sponsor_type == 'Executive Employment Services') {
              this.parent_company_id = '62fb68ad9f14e35fe7eda269'
              this.parent_company = '64bf8fb96829e12b2ce7ff98'
              this.legal_entity = 'Executive Employment Services'
            }
          }

          this.selectedEmployeeDetails[0].parent_company = this.parent_company
          this.selectedEmployeeDetails[0].legal_entity = this.legal_entity
          this.selectedEmployeeDetails[0].parent_company_id = this.parent_company_id


          // this.showDetails = true

          // this.selectedEmployeeEmail = this.selectedEmployeeDetails[0].email
          // await this.getInsurance(user_id)
        })
        .catch((err) => console.log(err))
    },
  },
  mounted() {
    this.getEmployeeDetails(this.process_id)
  }
}
</script>
