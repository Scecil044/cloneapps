<template>
  <div>
    <v-row v-if="!showEditModel">
      <v-col cols="12" class="pa-0">
        <!-- Salary Details-->
        <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
          :headers="salaryDetails_headers" :items="salaryDetails_data"
          :footer-props="{ 'items-per-page-options': [50] }" hide-default-footer>
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
              <v-btn class="customer_table_btn" @click="handleEditModel(salaryDetails_headers[0].text)" outlined
                color="primary">{{
      header.text
    }}</v-btn>
            </th>
          </template>

          <template v-slot:item="{ item }">
            <tr>
              <td class="" style="width: 25% !important">{{ item.title }}</td>
              <td class="">{{  item.title == 'Rotation Required' ?  getMessage(item.description) : item.description }}</td>
              <td class=""></td>
            </tr>
          </template>
        </v-data-table>


         <div class="d-flex align-center pa-0 ">
          <v-alert
            prominent
            dense
            text
            :color="'info'"
          >
            <v-row align="center">
              <v-col class="grow">
                <!-- <p class="tw-mb-2">The Edit option for banking details has been {{ !salary_rotation_required ? 'disabled' : 'enabled' }}.</p> -->
                <v-switch :loading="salary_rotation_loading" :disabled="salary_rotation_loading" @change="handleSalaryToggle($event)" v-model="salary_rotation_required">
                  <template v-slot:label>
                    {{  salary_rotation_required ? 'Salary Rotation Enabled' : 'Salary Rotation Disabled' }}
                  </template>
                </v-switch>
              </v-col>
            </v-row>
          </v-alert>
        </div>


        <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
          :headers="nonWps_salaryDetails_headers" :items="nonWps_salaryDetails_data" :footer-props="{ 'items-per-page-options': [50] }"
          hide-default-footer>
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
              <v-btn class="customer_table_btn" @click="handleEditModel(nonWps_salaryDetails_headers[0].text)" outlined
                color="primary">{{
                  header.text
                }}</v-btn>
            </th>
          </template>

          <template v-slot:item="{ item }">
            <tr>
              <td class="" style="width: 25% !important">{{ item.title }}</td>
              <td class="">{{ item.description }}</td>
              <td class=""></td>
            </tr>
          </template>
        </v-data-table>
        <!-- <div class=" d-flex align-center  py-6">
          <InfoSVG />
          <span class=" span_heading pl-2">SALARY CHANGE LOG</span>
        </div> -->
        <!-- salary change logo -->
        <!-- <v-data-table
          id="coa_table"
          class="main__table elevation-0 document_table"
          :headers="salaryChangeLog_header"
          :items="salaryChangeLog_table"
          :footer-props="{ 'items-per-page-options': [10, 20] }"
          hide-default-footer
        >
          <template v-slot:item="{ item }">
            <tr class="table_row">
              <td class="">
                <div class="d-flex align-center">
                  <a href="">{{ item.type }}</a>
                </div>
              </td>
              <td class="">
                <div class="d-flex align-center " >
                  <v-avatar class="mr-2" size="30px">
                  <v-img
                    alt="Avatar"
                    :src="avatar"
                  ></v-img>
                </v-avatar>
                <div class=" d-flex  flex-column">
                  <span class="n_text">
                {{ item.applied_by }}

                  </span>
                  <span class="span_text">
                {{ item.applied_on }}

                  </span>
                </div>
                </div>

              </td>
              <td class="pa-0 ma-0 pl-3">
                <div class="">

                  <span
                    class="table_btn light_accent3 accent3--text"
                    v-if="item.status == 'pending'"
                    >{{ item.status_pending }}</span>

                  <div  v-if="item.status == 'approved'" class="d-flex align-center " >
                  <v-avatar class="mr-2" size="30px">
                  <v-img
                    alt="Avatar"
                    :src="avatar"
                  ></v-img>
                </v-avatar>
                <div class=" d-flex  flex-column">
                  <span class="n_text">
                {{ item.approved_by }}

                  </span>
                  <span class="span_text">
                {{ item.approved_on }}

                  </span>
                </div>
                </div>
                </div>
              </td>
              <td class="">
              <div class="d-flex align-center">
                  <span class="pr-2">
                    <PdfSvg />
                  </span >
                  <span class="sub_text">
                  {{ item.file_name }}
                  </span>
                </div>
              </td>
              <td class="pa-0 ma-0"> -->

        <!-- Mark as Approved View letter history -->
        <!-- <v-menu transition="slide-y-transition" rounded="lg" offset-x>
                  <template v-slot:activator="{ attrs, on }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      color="subtext"

                      max-width="10px"
                      class=" px-0 ml-2"
                      icon
                    >
                      <v-icon x-small class="px-0 mx-0" color="subtext"
                        >fa-solid fa-ellipsis-vertical</v-icon
                      ></v-btn
                    >
                  </template>
                  <v-list>
                    <v-list-item link >
                      <span class="n_text text--text ml-2">

                        Mark as Approved
                      </span>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item link >
                      <span class="n_text text--text ml-2">

                        View letter history
                      </span>
                    </v-list-item>
                  </v-list>
                </v-menu>
            </td>
            </tr>
          </template>
        </v-data-table> -->
        <div class=" d-flex align-center  py-6">
          <InfoSVG />
          <span class=" span_heading pl-2">SALARY LOG</span>
        </div>
        <!-- salary log -->
        <v-data-table id="coa_table" class="main__table elevation-0 document_table" :headers="salaryLog_header"
          :items="salaryLog_table" :footer-props="{ 'items-per-page-options': [5, 10, 20] }" :items-per-page="5">
          <template v-slot:item="{ item }">
            <tr class="table_row">
              <td class="">
                <span class=" d-flex align-center justify-center "> {{ item.updated_user_name }} </span>
              </td>
              <td class="">
                <span class=" d-flex align-center justify-center "> {{ item.updated_on | ticketingDateFormatter }}
                </span>
              </td>
              <td class="">
                <div class="">
                  <span class=" d-flex align-center justify-center table_btn light_accent4 accent4--text"
                    v-if="item.status == 'completed'">{{ item.status }}</span>
                  <span class=" d-flex align-center justify-center table_btn light_accent3 accent3--text" v-else>{{
      item.status }}</span>
                </div>
              </td>
              <td class="pl-16">
                <span class=" d-flex align-center justify-center ">
                  {{ item.message }}
                </span>

              </td>

            </tr>
          </template>
        </v-data-table>


      </v-col>
    </v-row>

    <EditModel v-if="showEditModel" :selectedCustomer="employeeDetails[0]._id" :headerTitle="headerTitle"
      :companiesDetails="employeeDetails" @close="updateEmployeeData()" :handleModel="handleEditModel" />

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
import '@/assets/scss/utils/_customerListDetails.scss'
import InfoSVG from '@/assets/images/Customer/info.svg'
import PdfSvg from '@/assets/images/icons/pdf.svg'
import settingSVG from '@/assets/images/Customer/setting.svg'
import InsightCard from '~/components/Cards/InsightCard/index.vue'
import EditModel from '~/components/EditModel/editEmployees.vue'


export default {
  components: {
    InfoSVG,
    settingSVG,
    InsightCard,
    PdfSvg,
    EditModel
  },
  props: { employeeDetails: Array },
  data() {
    return {
      avatar: '/1.jpg',
      salary_transfer_letter_required: false,
      showEditModel: false,
      salaryChangeLog_header: [
        { text: 'Type', value: 'type', align: 'start' },
        { text: 'Applied by', value: 'applied_by', align: 'start' },
        { text: 'Approved by', value: 'approved_by', align: 'start' },
        { text: 'Letter', value: 'letter', align: 'start' },
        { text: '', value: '', align: 'start' },
      ],
      salaryChangeLog_table: [
        {
          type: 'TradeLicense',
          applied_by: 'Sahiba Tanwani',
          approved_by: 'Shirin Khan',
          letter: 'Upload',
          applied_on: '23-05-2022',
          approved_on: '12-04-2021',
          status: 'pending',
          status_pending: 'Pending Approval',
          file_name: 'dummy.pdf',
        },
        {
          type: 'TradeLicense',
          applied_by: 'Sahiba Tanwani',
          approved_by: 'Shirin Khan',
          letter: 'Upload',
          applied_on: '23-05-2022',
          approved_on: '12-04-2021',
          status: 'approved',
          status_pending: 'Pending Approval',
          file_name: 'dummy.pdf',
        },
        {
          type: 'TradeLicense',
          applied_by: 'Sahiba Tanwani',
          approved_by: 'Shirin Khan',
          letter: 'Upload',
          applied_on: '23-05-2022',
          approved_on: '12-04-2021',
          status: 'pending',
          status_pending: 'Pending Approval',
          file_name: 'dummy.pdf',
        },
        {
          type: 'TradeLicense',
          applied_by: 'Sahiba Tanwani',
          approved_by: 'Shirin Khan',
          letter: 'Upload',
          applied_on: '23-05-2022',
          approved_on: '12-04-2021',
          status: 'approved',
          status_pending: 'Pending Approval',
          file_name: 'dummy.pdf',
        },
        ,
      ],
      salaryLog_header: [
        { text: 'User Name', value: 'updated_user_name', align: 'center' },
        { text: 'Salary Updated Date', value: 'updated_on', align: 'center' },
        { text: 'Status', value: 'status', align: 'center' },
        { text: 'Description', value: 'message', align: 'center' },
      ],
      salaryLog_table: [],
      salaryDetails_headers: [
        {
          text: 'SALARY  DETAILS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      nonWps_salaryDetails_headers: [
        {
          text: 'FIXED NON WPS SALARY DETAILS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      salaryDetails_data: [
        {
          title: 'Basic Salary',
          description: '',
          align: 'start',
        },
        {
          title: 'Housing Allowance',
          description: '',
        },
        {
          title: 'Food Allowance',
          description: '',
        },
        {
          title: 'Other Allowance',
          description: '',
        },
        // {
        //   title: 'Car Allowance',
        //   description: '',
        // },
        {
          title: 'Petrol Allowance',
          description: '',
        },
        {
          title: 'Transportation Allowance',
          description: '',
        },
        {
          title: 'Mobile Allowance',
          description: '',
        },

        {
          title: 'Total Fixed',
          description: '',
        },
      ],
      nonWps_salaryDetails_data: [
        {
          title: 'Basic Salary',
          description: '',
          align: 'start',
        },
        {
          title: 'Housing Allowance',
          description: '',
        },
        {
          title: 'Other Allowance',
          description: '',
        },
        // {
        //   title: 'Car Allowance',
        //   description: '',
        // },
        {
          title: 'Petrol Allowance',
          description: '',
        },
         {
          title: 'Rotation Required',
          description: '',
        },
        {
          title: 'Total Fixed',
          description: '',
        },
      ],
      headerTitle: '',
      snack: false,
      snackText: '',
      snackColor: '',
      salary_rotation_required: false,
      salary_rotation_loading: false
    }
  },
  methods: {
    async handleSalaryToggle(){
      try {
        this.salary_rotation_loading = true
        const userId = this.employeeDetails[0]?._id
        await this.$axios.patch(`/users/${userId}`, { salary_rotation_required: this.salary_rotation_required })
      }catch(error) {
        console.log('salary update failed error', error.message)
      }finally {
        this.salary_rotation_loading = false
      }

    },
     stringToBoolean(str) {
      if (typeof str === 'string') {
        return str.toLowerCase() === 'true';
      }
      return Boolean(str);
    },
    getMessage(status) {
      // console.log('rotation status: ', typeof status)
      return this.stringToBoolean(status) ? 'YES' : 'NO'
    },
    getSalaryDetailsData() {
      if (this.employeeDetails.length > 0 && this.employeeDetails[0].salary) {
        Object.keys(this.employeeDetails[0].salary).forEach(key => {
          if (this.employeeDetails[0].salary[key] === null) {
            this.employeeDetails[0].salary[key] = 0;
          }
        });
      }

      if (this.employeeDetails.length > 0 && this.employeeDetails[0].nonwps_salary) {
        Object.keys(this.employeeDetails[0].nonwps_salary).forEach(key => {
          if (this.employeeDetails[0].nonwps_salary[key] === null) {
            this.employeeDetails[0].nonwps_salary[key] = 0;
          }
        });
      }

      if (this.employeeDetails.length > 0 && this.employeeDetails[0].salary !== undefined) {
        for (let i = 0; i < this.salaryDetails_data.length; i++) {
          const title = this.salaryDetails_data[i].title.toLowerCase().replace(/\s+/g, '_');
          if (this.employeeDetails[0].salary.hasOwnProperty(title)) {
            this.salaryDetails_data[i].description = '';
            this.salaryDetails_data[i].description = this.employeeDetails[0]?.salary[title].toString();
          }
        }
      }

      if (this.employeeDetails.length > 0 && this.employeeDetails[0].nonwps_salary !== undefined) {
        for (let i = 0; i < this.nonWps_salaryDetails_data.length; i++) {
          const title = this.nonWps_salaryDetails_data[i].title.toLowerCase().replace(/\s+/g, '_');
          if (this.employeeDetails[0].salary.hasOwnProperty(title)) {
            this.nonWps_salaryDetails_data[i].description = '';
            this.nonWps_salaryDetails_data[i].description = this.employeeDetails[0].nonwps_salary[title];
          }
        }
      }
    },
    getSalaryLogs() {
      if (this.employeeDetails.length > 0 && this.employeeDetails[0].hasOwnProperty('salary_change_log') && this.employeeDetails[0].salary_change_log.length > 0) {
        this.salaryLog_table = []
        this.employeeDetails[0].salary_change_log.forEach((item) => {
          this.salaryLog_table.push({
            updated_user_name: item.updated_user_name,
            updated_on: item.updated_on,
            status: item.status,
            message: item.message,
          })
        })
      }
    },
    handleEditModel(title) {
      this.headerTitle = title
      this.showEditModel = !this.showEditModel
    },
    async updateEmployeeData() {
      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Details Has Been Updated Successfully.'
      this.showEditModel = !this.showEditModel
      this.headerTitle = ''
      this.$emit('updatedEmployeeClicked', this.employeeDetails[0]._id)
      await this.initialize()
    },
    async initialize() {
      await this.getSalaryDetailsData()
      await this.getSalaryLogs()

      if (this.employeeDetails[0]?.salary_rotation_required) {
        this.salary_rotation_required = true
      }
    }
  },

  async mounted() {
    // console.log(this.employeeDetails, '-----------employeeDetails props')
    await this.initialize()
  },
  computed: {},
}
</script>
