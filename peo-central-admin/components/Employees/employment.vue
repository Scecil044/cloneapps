<template>
  <div>
    <v-row v-if="!showEditModel">
      <!-- EMPLOYMENT DETAILS TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
        :headers="employmentHeaders" :items="employeeDetails" :items-per-page="30" hide-default-footer>
        <template v-slot:header.title="{ header }">
          <div class="d-flex align-center pa-0">
            <div>
              <InfoSVG />
            </div>
            <div>
              <th class="pl-2">{{ header.text }}</th>
            </div>
          </div>
        </template>
        <template v-slot:header.action="{ header }">
          <th class="d-flex justify-end">
            <v-btn class="customer_table_btn" outlined color="primary"
              @click="handleEditModel(employmentHeaders[0].text)">{{ header.text }}</v-btn>
          </th>
        </template>

        <template v-slot:item="{ item }">
          <!-- <tr>
            <td class="pr-0">{{ item.title }}</td>
            <td class="pb-2">
              <div>
                <span class="pl-2 pr-2 table_btn light_accent4 accent4--text"
                  v-if="item.status == 'Active'"
                  >{{ item.status }}</span
                >
                <span class="pl-2 pr-2 table_btn light_accent1 accent1--text"
                  v-if="item.status == 'super Admin'"
                  >{{ item.status }}</span
                >
                <span class="table_btn" v-if="employeeDetails != '' && employeeDetails.length > 0"> {{ getItemValue(employeeDetails, item.description) }}</span>
              </div>
            </td>
            <td class=""></td>
          </tr> -->

          <tr>
            <td class="pr-0" style="width: 215px !important;">Company Name</td>
            <td class=" d-flex align-center">{{ item.company_name }}</td>
            <td class=""></td>
          </tr>
          <!-- <tr>
            <td class="pr-0" style="width: 215px !important;">Manager Name</td>
            <td class=" d-flex align-center">{{ item.manager_name ? item.manager_name : '-' }}</td>
            <td class=""></td>
          </tr> -->
          <tr>
            <td class="pr-0" style="width: 215px !important;">Employee Status</td>
            <td class="d-flex align-center">
              <span class=" table_btn light_accent4 accent4--text rounded-xl mx-2">{{ item.user_status ? item.user_status
                : '-' }}</span>
            </td>
            <td class=""></td>
          </tr>
          <!-- <tr>
            <td class="pr-0" style="width: 215px !important;">Employee Level</td>
            <td class=" d-flex align-center">{{ item.employment.designation ? item.employment.designation : '-' }}</td>
            <td class=""></td>
          </tr> -->
          <tr>
            <td class="pr-0" style="width: 215px !important;">Role Type</td>
            <td class="d-flex align-center">
              <span class="table_btn light_accent3 accent3--text rounded-xl mx-2">{{ item.role_name ? item.role_name : '-'
              }}</span>
            </td>
            <td class=""></td>
          </tr>
          <!-- <tr>
            <td class="pr-0" style="width: 215px !important;">Department</td>
            <td class=" d-flex align-center">{{ item.department ? item.department : '-' }}</td>
            <td class=""></td>
          </tr> -->
          <!-- <tr>
            <td class="pr-0" style="width: 215px !important;">Team</td>
            <td class=" d-flex align-center">{{ item.team ? item.team : '-' }}</td>
            <td class=""></td>
          </tr> -->
          <tr>
            <td class="pr-0" style="width: 215px !important;">Work Schedule</td>
            <td class=" d-flex align-center">{{ item.work_schedule ? item.work_schedule : '-' }}</td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Work Location</td>
            <td class=" d-flex align-center">{{ item.employment.work_location ? item.employment.work_location : '-' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Visa Issuance Authority</td>
            <td class=" d-flex align-center">{{ item.employment.visa_sponsor_type ?
              item.employment.visa_sponsor_type : '-' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Date Of Joining</td>
            <td class=" d-flex align-center">{{ item.date_of_joining ? item.date_of_joining : '-' }}</td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Probation</td>
            <td class=" d-flex align-center">{{ item.probation_period ? item.probation_period : '-' }} Days</td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Probation Ends</td>
            <td class=" d-flex align-center">{{ item.probation_period_end ? item.probation_period_end : '-' }} Days</td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Employment Type</td>
            <td class=" d-flex align-center">{{ item.employment.employment_type ?
              item.employment.employment_type : '-' }}</td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Contract Type</td>
            <td class=" d-flex align-center">{{ item.employment.contract_type ? item.employment.contract_type : '-' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Assigned PRO:</td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.assignedPro?.name ? item.onBoardingDetails.assignedPro.name : '-' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Medical Center:</td>
            <td class=" d-flex align-center"> {{ item.onBoardingDetails.medical_center ? item.onBoardingDetails.medical_center.name : '-' }}
            </td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.medical_center ? item.onBoardingDetails.medical_center.address : '-' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">EID Center:</td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.eid_center ? item.onBoardingDetails.eid_center.name : '-' }}
            </td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.eid_center ? item.onBoardingDetails.eid_center.address : '-' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Tajweeh Center:</td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.tawjeeh_center ? item.onBoardingDetails.tawjeeh_center.name : '-' }}
            </td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.tawjeeh_center ? item.onBoardingDetails.tawjeeh_center.address : '-' }}
            </td>
            <td class=""></td>
          </tr>

          <tr>
            <td class="pr-0" style="width: 215px !important;">Assigned HR Specialist and Support Agent:</td>

            <td class=" d-flex align-center">{{ item.onBoardingDetails.assigned_support_agent.name !== " " ? item.onBoardingDetails.assigned_support_agent.name : 'None' }}
            </td>
            <td class=""></td>
          </tr>
          <!-- <tr>
            <td class="pr-0" style="width: 215px !important;">Assigned HR Specialist:</td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.assigned_hr_specialist.name !== " "  ? item.onBoardingDetails.assigned_hr_specialist.name : 'None' }}
            </td>
            <td class=""></td>
          </tr> -->
          <tr>
            <td class="pr-0" style="width: 215px !important;">Assigned Escalation Manager:</td>
            <td class=" d-flex align-center">{{ item.onBoardingDetails.assigned_escalation_manager.name !== ' ' ? item.onBoardingDetails.assigned_escalation_manager.name : 'None' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Assigned Insurance Agent:</td>
            <td class=" d-flex align-center">{{ item?.assigned_insurance_agent?.full_name !== ' ' ? item?.assigned_insurance_agent?.full_name : 'None' }}
            </td>
            <td class=""></td>
          </tr>
          <tr>
            <td class="pr-0" style="width: 215px !important;">Internal Team</td>
            <td class="d-flex align-center">
              {{ item.is_internal_staff === true ? 'Yes' : 'No' }}
            </td>
            <td class=""></td>
          </tr>
          <!-- <tr>
            <td class="pr-0" style="width: 215px !important;">Cost Center</td>
            <td class=" d-flex align-center">{{ item.cost_center ? item.cost_center : '-' }}</td>
            <td class=""></td>
          </tr> -->
        </template>

        <!-- <template v-slot:item="{ item }">
            <tr>
              <td class="pr-0">{{ item.title}}</td>
              <td class="pb-2">{{ item.description}}</td>
              <td class=""></td>
            </tr>
          </template> -->
      </v-data-table>
    </v-row>

    <EditModel v-if="showEditModel" :selectedCustomer="employeeDetails[0]._id" :headerTitle="headerTitle"
      :companiesDetails="employeeDetails" @close="updateEmployeeData" :handleModel="handleEditModel" />


    <!-- Snack -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script>
import InfoSVG from '@/assets/images/Customer/info.svg'
import { all } from 'q';
import EditModel from '~/components/EditModel/editEmployees.vue'



export default {
  components: {
    InfoSVG,
    EditModel
  },
  props: {
    employeeDetails: Array
  },
  data() {
    return {
      showEditModel: false,
      employmentHeaders: [
        {
          text: 'EMPLOYMENT DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: 'Edit',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      companyDetails: [

        {
          title: 'Company Name',
          description: 'company_name',
        },
        {
          title: 'Manager Name',
          description: '--',
        },
        {
          title: 'Employee Status',
          description: 'user_status'
        },
        {
          title: 'Employee Level',
          description: 'Manager',
        },
        {
          title: 'Role Type',
          description: 'role_name'


        },
        {
          title: 'Department',
          description: 'Admin',
        },
        {
          title: 'Team',
          description:
            'Administration',
        },
        {
          title: 'Work Schedule ',
          description: '9-6',
        },
        {
          title: 'Work Location ',
          description: 'Dubai',
        },
        {
          title: 'Date of joining',
          description: 'date_of_joining',
        },
        {
          title: 'Probation',
          description: '0 Days',
        },
        {
          title: 'Probation Ends',
          description: 'Jan 03, 2012',
        },
        {
          title: 'Employment Type',
          description: 'employment_type',
        },
        {
          title: 'Contract Type',
          description: 'contract_type',
        },
        {
          title: 'Cost Center',
          description: 'indirect',
        },
      ],
      headerTitle: '',
      showEditModel: false,
      snack: false,
      snackText: '',
      snackColor: '',
    }
  },
  methods: {
    getItemValue(employeeDetails, companyDetailsDescription) {
      if (Array.isArray(employeeDetails) && Array.isArray(this.companyDetails)) {
        const employeeDetail = employeeDetails[0]; // Assuming there's only one employee detail
        const companyDetail = this.companyDetails.find(detail => detail.title === 'Company Name');
        if (companyDetail && employeeDetail.hasOwnProperty(companyDetailsDescription)) {
          companyDetail.description = employeeDetail[companyDetailsDescription];
          return companyDetail.description || '';
        }
      }
      return companyDetailsDescription;
    },
    handleEditModel(title) {
      this.headerTitle = title
      this.showEditModel = !this.showEditModel
    },
    updateEmployeeData() {
      this.showEditModel = !this.showEditModel
      this.headerTitle = ''
      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Details Has Been Updated Successfully.'
      this.$emit('updatedEmployeeClicked', this.employeeDetails[0]._id)
    }
  },

  mounted() {
  },
}
</script>
