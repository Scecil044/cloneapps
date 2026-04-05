<template>
  <v-row>
    <!-- form column -->

    <v-col sm="12" md="12" lg="12">
      <v-card
        color="card_bg"
        class="carddd"
        id="card"
        style="
          max-height: 92vh !important;
          min-height: 92vh !important;
          overflow: auto;
        "
      >
        <v-row>
          <v-col sm="12" md="12" lg="12" class="d-flex align-right justify-end">
            <v-img
              @click="close()"
              src="/dashboard/close.svg"
              style="cursor: pointer"
              justify-self="end"
              max-width="25"
              height="auto"
              contain
            ></v-img>
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="12" md="12" lg="12">
            <div class="d-flex align-center justify-space-between">
              <Tabs
                @tabValue="handleTabValue($event)"
                :data="employees_tabs.employee"
                :tab_value="tab_current_val"
              />
            </div>
            <hr class="mb-3" style="color: #e2e7f1 !important" />
            <EmployeeDetails
              :employeeDetails="selectedEmployeeDetails"
              @updatedEmployeeClicked="clickedEvent($event)"
              v-if="tab_current_val == 'all' && showDetails"
            />

            <Employment
              :employeeDetails="selectedEmployeeDetails"
              @updatedEmployeeClicked="clickedEvent($event)"
              v-if="tab_current_val == 'employment' && showDetails"
            />
            <HR
              :employeeDetails="selectedEmployeeDetails"
              :userInsuranceDetails="userInsuranceDetails"
              :parent_company="parent_company"
              :legal_entity="legal_entity"
              :parent_company_id="parent_company_id"
              :insuranceAgent="insurance_agent"
              @updatedEmployeeClicked="clickedEvent($event)"
              v-if="tab_current_val == 'hr' && showDetails"
            />
            <EmployeeCompensation
              :employeeDetails="selectedEmployeeDetails"
              @updatedEmployeeClicked="clickedEvent($event)"
              v-if="tab_current_val == 'compensation' && showDetails"
            />
            <EmployeeDocument
              :employeeDetails="selectedEmployeeDetails"
              v-if="tab_current_val == 'documents' && showDetails"
            />
            <EmailsLog
              :employeeEmail="selectedEmployeeEmail"
              v-if="tab_current_val == 'emails' && showDetails"
            />
            <DependentList
              :employee="selectedEmployeeDetails[0]"
              :parent_company="parent_company"
              :legal_entity="legal_entity"
              :parent_company_id="parent_company_id"
              @update="updateDependent"
              v-if="tab_current_val == 'dependents' && showDetails"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- Snack -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-row>
</template>
<script>
import Tabs from '@/components/Tabs/index.vue'
import EmployeeDetails from '@/components/Employees/employeeDetails.vue'
import Employment from '@/components/Employees/employment.vue'
import HR from '@/components/Employees/hr.vue'
import EmployeeCompensation from '@/components/Employees/employeeCompensation.vue'
import EmployeeDocument from '@/components/Employees/employeeDocument.vue'
import EmployeeDependent from '@/components/Employees/employeeDependent.vue'
import EmailsLog from '@/components/Email/emaillogs.vue'
import DependentList from '@/components/Employees/dependents.vue'

export default {
  components: {
    Tabs,
    EmployeeDetails,
    Employment,
    HR,
    EmployeeCompensation,
    EmployeeDocument,
    EmployeeDependent,
    EmailsLog,
    DependentList,
  },
  props: {
    tab_current: String,
    selectedEmployee: String,
  },

  data() {
    return {
      //Tabs Data
      tab_current_val: this.tab_current,
      selectedEmployeeEmail: '',
      selectedEmployeeDetails: [],
      showDetails: false,
      employees_tabs: {
        employee: [
          { title: 'Details', value: 'all' },
          { title: 'Employment', value: 'employment' },
          { title: 'HR', value: 'hr' },
          { title: 'Compensation', value: 'compensation' },
          { title: 'Documents', value: 'documents' },
          { title: 'Dependents', value: 'dependents' },
          { title: 'Emails', value: 'emails' },
        ],
      },

      userInsuranceDetails: [],
      parent_company_id: '',
      parent_company: '',
      legal_entity: '',
      snack: false,
      snackColor: '',
      snackText: '',
      insurance_agent: '',
    }
  },
  mounted() {
    this.employersDetails(this.selectedEmployee)
    // console.log(this.selectedEmployee, '------------this.selectedEmployee')
  },
  methods: {
    close() {
      this.$emit('close', {})
    },
    updateDependent() {
      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Dependent Details Updated Successfully'
    },
    async clickedEvent(event) {
      await this.employersDetails(event)
    },
    async employersDetails(user_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.showDetails = false
      try {
        this.selectedEmployeeDetails = await this.$axios.$post(
          `/users/employee/details/${user_id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )

        try {
          const onBoardingDetails = await this.$axios.$get(
            `/users/${user_id}`,
            { headers: { Authorization: AuthStr } }
          )
          if (onBoardingDetails.salary && !onBoardingDetails.salary.hasOwnProperty('transportation_allowance')) {
            onBoardingDetails.salary.transportation_allowance = 0;
            this.selectedEmployeeDetails[0].salary.transportation_allowance = 0;
          }

          if (onBoardingDetails) {
            this.selectedEmployeeDetails[0].last_working_day = onBoardingDetails.last_working_day
          }

          if (onBoardingDetails && onBoardingDetails.onboardingDetails) {
            this.selectedEmployeeDetails[0].hasMobileLoggedIn = onBoardingDetails.hasMobileLoggedIn
              this.selectedEmployeeDetails[0].onBoardingDetails =
              onBoardingDetails.onboardingDetails
            this.selectedEmployeeDetails[0].has_escalation_manager_role =
              onBoardingDetails.has_escalation_manager_role
            this.selectedEmployeeDetails[0].has_hr_specialist_role =
              onBoardingDetails.has_hr_specialist_role
            this.selectedEmployeeDetails[0].has_insurance_agent_role =
              onBoardingDetails.has_insurance_agent_role
            this.selectedEmployeeDetails[0].has_support_agent_role =
              onBoardingDetails.has_support_agent_role
          } else {
            console.warn('onboardingDetails not found in response')
            this.selectedEmployeeDetails[0].onBoardingDetails = {}
          }
        } catch (error) {
          console.error('Error fetching onboarding details:', error)
          this.selectedEmployeeDetails[0].onBoardingDetails = {}
        }
        if (
          this.selectedEmployeeDetails &&
          this.selectedEmployeeDetails.length > 0 &&
          this.selectedEmployeeDetails[0].hasOwnProperty('employment') &&
          this.selectedEmployeeDetails[0].employment.visa_sponsor_type != ''
        ) {
          if (
            this.selectedEmployeeDetails[0].employment.visa_sponsor_type ==
            'Dynamic Employment Services'
          ) {
            this.parent_company_id = '62fb3df39f14e35fe7ed9c9a'
            this.parent_company = '63493cb4491224c1c039536a'
            this.legal_entity = 'Dynamic Employment Services'
          }

          if (
            this.selectedEmployeeDetails[0].employment.visa_sponsor_type ==
            'Executive Employment Services'
          ) {
            this.parent_company_id = '62fb68ad9f14e35fe7eda269'
            this.parent_company = '64bf8fb96829e12b2ce7ff98'
            this.legal_entity = 'Executive Employment Services'
          }
        }

        this.selectedEmployeeDetails[0].parent_company = this.parent_company
        this.selectedEmployeeDetails[0].parent_company = this.parent_company
        this.selectedEmployeeDetails[0].parent_company_id =
          this.parent_company_id

        this.showDetails = true

        this.selectedEmployeeEmail = this.selectedEmployeeDetails[0].email
        console.log("The final object is", this.selectedEmployeeDetails[0].salary)
        await this.getInsurance(user_id)
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    async getInsurance(user) {
      console.log("What user is", user)
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.$post(
          `${process.env.insurancePortalUrl}insurance/cycles/external/getdetails`,
          {
            user_id: user,
            parent_company: this.parent_company,
          },
          {
            headers: { Authorization: AuthStr }
          }
        );
        this.userInsuranceDetails = response;
        this.insurance_agent = response[0]?.insurance_agent || '';
        return response;
      } catch (error) {
        console.error('Error fetching insurance details:', error);
        throw error;
      }
    },
    handleTabValue(payload) {
      this.tab_current_val = payload
      this.$emit('EmployeeTabClicked', payload)
    },
  },
}
</script>
