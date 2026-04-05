<template>
  <div>
    <v-row v-if="!showEditModel">
      <div v-for="(employeeData, index) in employeeDetails" :key="index">
        <v-row>
          <v-col cols="12" class="pa-0">
            <!-- Top-Cards -->
            <CustomerCard class="mb-6" :data="DetailsCard" />
          </v-col>
          <v-col cols="12" class="pa-0">
            <div class="mb-6 d-flex align-center customer_icon">
              <v-hover v-slot="{ hover }">
                <v-avatar size="100" class="lighten-5 mr-0 mt-0 pt-0" v-if="employeeData.image_url">
                  <v-img :src="employeeData.image_url" contain>
                    <v-expand-transition>
                      <div v-if="hover" @click="imageEdit = true"
                        class="d-flex transition-fast-in-fast-out black v-card--reveal white--text" style="height: 35%;">
                        Edit
                      </div>
                    </v-expand-transition>
                  </v-img>
                </v-avatar>
                <v-avatar size="100" class="lighten-5 mr-0 mt-0 pt-0" v-else>
                  <v-img src="./customer_default_icon.svg" contain>
                    <v-expand-transition>
                      <div v-if="hover" @click="imageEdit = true"
                        class="d-flex transition-fast-in-fast-out black v-card--reveal white--text" style="height: 35%;">
                        Edit
                      </div>
                    </v-expand-transition>
                  </v-img>
                </v-avatar>
              </v-hover>
              <div>
                <h4 class="ml-5">{{ employeeData.first_name }} {{ employeeData.last_name }}</h4>
                <span class="cardBtn accent4 white--text" v-if="employeeData.user_status == 'active'">{{
                  employeeData.user_status }}</span>
                <span class="cardBtn accent2 white--text" v-if="employeeData.user_status == 'inactive'">{{
                  employeeData.user_status }}</span>
                <span class="cardBtn accent3 white--text" v-if="employeeData.user_status == 'onboarding'">{{
                  employeeData.user_status }}</span>
                <span class="cardBtn accent5 white--text" v-if="employeeData.user_status == 'offboarding'">{{
                  employeeData.user_status }}</span>
                <span class="cardBtn secondary white--text" v-if="employeeData.user_status == 'visa process'">{{
                  employeeData.user_status }}</span>
              </div>

            </div>
          </v-col>
        </v-row>

        <v-row>
          <!-- COMPANY DETAILS TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
            :headers="companyHeaders" :items="employeeDetails" hide-default-footer>
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
                  @click="handleEditModel(companyHeaders[0].text)">{{ header.text }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">Legal Name</td>
                <td class="pb-2">{{ item.legal_name }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Company Name</td>
                <td class="pb-2">{{ item.company_name }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Registration Number</td>
                <td class="pb-2">{{ item.company_registration_number }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Company Phone No</td>
                <td class="pb-2">{{ item.company_phone }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Company Email Address</td>
                <td class="pb-2">{{ item.company_email }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Company Address</td>
                <td class="pb-2">{{ item.company_address }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Company Country</td>
                <td class="pb-2">{{ item.company_country }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Website</td>
                <td class="pb-2">{{ item.company_website }}</td>
                <td class=""></td>
              </tr>
            </template>

            <!-- <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">{{ item.title}}</td>
                <td class="pb-2">{{ item.description}}</td>
                <td class=""></td>
              </tr>
            </template> -->
          </v-data-table>
          <!-- Employer DETAILS TABLE -->
          <!-- Employee DETAILS TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
            :headers="employeeHeaders" :items="employeeDetails" hide-default-footer>
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
                <v-btn class="customer_table_btn" outlined color="primary"
                  @click="handleEditModel(employeeHeaders[0].text)">{{ header.text }}</v-btn>
              </th>
            </template>
            <template v-slot:item="{ item, }">
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
                <td class="pr-0" style="width: 215px !important;">Date of Birth</td>
                <td class="pb-2 pt-2">{{ item.personal?.dob }} </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Email</td>
                <td class="pb-2 pt-2">{{ item.email }} </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Phone No</td>
                <td class="pb-2 pt-2">{{ item.personal?.phone }} </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Gender</td>
                <td class="pb-2 pt-2">{{ item.personal?.gender }} </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Marital Status</td>
                <td class="pb-2 pt-2">{{ item.personal?.marital_status }} </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Nationality</td>
                <td class="pb-2 pt-2">{{ item.personal?.nationality }} </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Allergies</td>
                <td class="pb-2 pt-2">{{ item.personal?.allergies }} </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Internal Designation</td>
                <td class=" d-flex align-center">
                  {{ item.employment.designation }}
                </td>
                <td class=""> </td>
              </tr>
              <tr v-if="item.user_status == 'offboarding'">
                <td class="pr-0" style="width: 215px !important;">Last Working Day</td>
                <td class=" d-flex align-center">
                  {{ item.last_working_day }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Visa Designation</td>
                <td class=" d-flex align-center">
                  {{ item.employment.visa_designation }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">DOJ</td>
                <td class=" d-flex align-center">
                  {{ item.date_of_joining }}
                </td>
                <td class=""> </td>
              </tr>

              <tr>
                <td class="pr-0" style="width: 215px !important;">Work Location</td>
                <td class=" d-flex align-center">
                  {{ item.employment.work_location }}
                </td>
                <td class=""> </td>
              </tr>

              <tr>
                <td class="pr-0" style="width: 215px !important;">Address</td>
                <td class=" d-flex align-center" v-if="item.personal">
                  {{ item.personal.address ? item.personal.address : '-' }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Specialty</td>
                <td class=" d-flex align-center" v-if="item.personal">
                  {{ item.personal.speciality ? item.personal.speciality : '-' }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Logged In Via</td>
                <td class=" d-flex align-center">
                  {{item.hasMobileLoggedIn ? 'mobile': 'web'}}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Skill Sets</td>
                <td class=" d-flex align-center" v-if="item.personal">
                  {{ item.personal.skill_sets ? item.personal.skill_sets : '-' }}
                </td>
                <td class=""> </td>
              </tr>
            </template>

          </v-data-table>
          <!-- PAYROLL DETAILS TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
            :headers="payrollHeaders" :items="payrollDetails" :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <WalletSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
                <v-btn class="customer_table_btn" @click="handleEditModel(payrollHeaders[0].text)" outlined
                  color="primary">{{ header.text }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">{{ item.title }}</td>
                <td class="pb-2">{{ item.description.display }}</td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table>
          <!-- COMPANY CONTACTS TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
            :headers="contact_headers" :items="contact_details" :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <phoneSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
                <v-btn class="customer_table_btn" @click="handleEditModel(contact_headers[0].text)" outlined
                  color="primary">{{ header.text }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">{{ item.title }}</td>
                <td class="pb-2 pt-2">
                  <!-- {{ item.description }} <br /> -->
                  {{ item.phone }} <br />
                  {{ item.relationship }}
                </td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table>
          <!-- COMPANY BANK TABLE -->
          <!-- <v-data-table
            id="coa_table"
            class="main__table elevation-0 customDataTabel th_customer mb-5"
            :headers="bank_headers"
            :items="bank_details"
            :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-footer
          >
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div><bankSVG /></div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">{{ item.title }}</td>
                <td class="pb-2 pt-2" style="width: 68% !important">
                  <div class="d-flex" style="gap: 4px">
                    <div>
                      {{ item.accTitle }} <br />
                      {{ item.itemTitle }} <br />
                      {{ item.itemTitle1 }} <br />
                      {{ item.itemTitle2 }}
                    </div>
                    <div class="account_details mx-3">
                      {{ item.accountNo }} <br />
                      {{ item.itemValue }} <br />
                      {{ item.itemValue1 }} <br />
                      {{ item.itemValue2 }}
                    </div>
                  </div>
                </td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table> -->
        </v-row>
      </div>
    </v-row>

    <!-- Upload Picture-->
    <ImageCrop @croped-image="imagecroped" @close-corp="closecrop" :show="imageEdit" v-if="imageEdit" />
    <v-dialog v-model="uploadPicture" max-width="600">
      <v-card max-width="600" style="overflow-x:hidden">
        <v-row class="pt-4 pl-4 pr-4">
          <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
            <p class="mb-0 caption blue-grey--text font-weight-bold">Upload Profile Pic</p>
            <v-col class="pt-2" v-if="filename_attach.length > 0">
              <p class="mb-0">File Name: {{ filename_attach[0] }}</p>
            </v-col>
            <div class="pt-2" v-if="!uploadFile">
              <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true"
                @dragleave="dragging = false">
                <div class="dropZone-info" @drag="onUploadFile">
                  <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
                  <span class="dropZone-title">Drop file or click to upload</span>
                  <div class="dropZone-upload-limit-info">
                    <div>maximum file size: 10 MB</div>
                  </div>
                </div>
                <input type="file" @change="onUploadFile">
              </div>
            </div>
            <div v-else class="dropZone-uploaded">
              <div class="dropZone-uploaded-info">
                <span class="dropZone-title">Added</span>
                <button type="button" class="btn btn-primary removeFile" @click="removeFile('uploadDoc')">Remove
                  File</button>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row class="pa-4">
          <v-col class="text-right pt-0">
            <v-btn color="grey" text @click="uploadPicture = false">Close</v-btn>
            <v-btn color="blue darken-1" text v-if="uploading">
              <v-img src="/animated/refresh.svg" height="20" width="20" class="mr-2" contain></v-img>
            </v-btn>
            <v-btn color="blue darken-1" text v-else @click="attachFile()">Upload Profile</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

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
import ImageCrop from "~/components/utils/imageCrop.vue"
import '@/assets/scss/utils/_customerListDetails.scss'
import InfoSVG from '@/assets/images/Customer/info.svg'
import WalletSVG from '@/assets/images/Customer/wallet.svg'
import phoneSVG from '@/assets/images/Customer/phone.svg'
import settingSVG from '@/assets/images/Customer/setting.svg'
import locationSVG from '@/assets/images/Customer/location.svg'
import bankSVG from '@/assets/images/Customer/bank.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import CustomerCard from '~/components/Cards/CustomerDetailCard/index.vue'
import EditModel from '~/components/EditModel/editEmployees.vue'

export default {
  components: {
    CustomerCard,
    ImageCrop,
    EditModel,
    customerDefaultIcon,
    InfoSVG,
    phoneSVG,
    settingSVG,
    locationSVG,
    bankSVG,
    WalletSVG,
  },
  props: { employeeDetails: Array, selectedEmployerList: String },
  data() {
    return {
      imageEdit: false,
      avatar: '/1.jpg',
      showEditModel: false,
      uploadPicture: false,
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      link_url: '',
      link_filename: '',
      attachFiles: {
        uploadDoc: {},
        ecard: {}
      },
      uploading: false,
      snack: false,
      snackText: '',
      snackColor: '',
      Modules: [
        'My Work',
        'HR Self Services',
        'Team Central',
        'Reports',
        'Onboardings',
        'Invoice Central',
        'Payroll Central',
        'Offboardings',
      ],

      companyHeaders: [
        {
          text: 'COMPANY DETAILS',
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
      employeeHeaders: [
        {
          text: 'EMPLOYEE DETAILS',
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
          title: 'Legal Name',
          description: '',
        },
        {
          title: 'Company Name',
          description: '',
        },
        {
          title: 'Registration Number',
          description: '',
        },
        {
          title: 'Phone No',
          description: '',
        },
        {
          title: 'Email Address',
          description: '',
        },
        {
          title: 'Registration Number',
          description: '',
        },
        {
          title: 'Company Address',
          description: '',
        },
        {
          title: 'Company Country',
          description: '',
        },
        {
          title: 'Website',
          description: '',
        },
      ],
      payrollHeaders: [
        {
          text: 'PAYROLL DETAILS',
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
      payrollDetails: [
        {
          title: 'Invoice date',
          description: '',
        },
        {
          title: 'Payment Due Notification',
          description: '',
        },
        {
          title: 'Salary Payment Date',
          description: '',
        },
      ],
      contact_headers: [
        { text: 'EMERGENCY CONTACT', value: 'title', align: 'center', sortable: false },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      contact_details: [],
      configuration_headers: [
        {
          text: 'CONFIGURATIONS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'New', value: 'action', align: 'start', sortable: false },
      ],
      configuration_details: [
        {
          title: 'Portal Type',
          description: 'Internal Portal',
          align: 'start',
        },
        {
          title: 'Customer Type',
          description: 'Child',
        },
        {
          title: 'parent Company',
          description: 'Binance Inc',
        },
        {
          title: 'Category',
          description: 'PEO',
        },
      ],
      location_headers: [
        {
          text: 'COMPANY LOCATIONS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      location_details: [
        {
          title: '',
          address: '',
          phone: '',
          email: '',
        },
        // {
        //   title: 'KSA',
        //   address:
        //     'Al Khobar Business Center, King Faisal Street, Al Khobar, Eastern Province, Saudi Arabia.',
        //   phone: '0578-545-895',
        //   email: ' operation@binance.com',
        // },
      ],
      bank_headers: [
        {
          text: 'BANK DETAILS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: '', value: 'action', align: 'start', sortable: false },
      ],
      bank_details: [
        {
          title: 'Emirates NBD',
          accTitle: 'AC No.',
          accountNo: ' 0000000000',
          itemTitle: 'Bank Address',
          itemValue: 'value',
          itemTitle1: 'IBan',
          itemValue1: '',
          itemTitle2: 'Payment Mode',
          itemValue2: '',
        },
      ],

      DetailsCard: [
        {
          status: 'Annual leaves taken',
          count: '01',
        },
        {
          status: 'Leave Taken (Mon)',
          count: '01',
        },

      ],
      headerTitle: '',
    }
  },
  mounted() {
    // console.log(this.employeeDetails, '---------employeeDetails')

    this.initialize()
  },
  methods: {

    async imagecroped(event) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let obj = {
        "name": `${this.employeeDetails[0].first_name}_logo.png`,
        "base64": event,
        "mimetype": "application/png"
      }
      await this.$axios.$post(`/documents/simpleuploadbase64`, obj, { headers: { Authorization: AuthStr } })
        .then(async (response) => {

          let obj = {
            image_url: response
          }

          await this.$axios.$patch(`/users/${this.employeeDetails[0]._id}`, obj, { headers: { Authorization: AuthStr } })
            .then((res) => {
              this.snack = true
              this.snackColor = 'success'
              this.snackText = 'Profile Has Been Updated Successfully.'
              this.$emit('updatedEmployeeClicked', this.employeeDetails[0]._id)
            })
        })
    },
    closecrop(event) {
      this.imageEdit = event
    },
    async initialize() {
      await this.getDetailsCardCount()
      await this.getPayrollDetails()
      // await this.getBankDetails()
      await this.getCompanyLocations()
      await this.getEmergencyContactDetails()
    },
    handleEditModel(title) {
      console.log(title)
      this.headerTitle = title
      this.showEditModel = !this.showEditModel
    },
    updateEmployeeData() {
      this.showEditModel = !this.showEditModel
      this.headerTitle = ''
      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Details Has Been Updated Successfully.'
      this.initialize()
      this.$emit('updatedEmployeeClicked', this.employeeDetails[0]._id)
    },
    getDetailsCardCount() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {
        this.DetailsCard[0].count = this.employeeDetails[0].leaves.annual_leaves ? this.employeeDetails[0].leaves.annual_leaves : '0'
        this.DetailsCard[1].count = this.employeeDetails[0].leaves.leave_taken ? this.employeeDetails[0].leaves.leave_taken : '0'
      }
    },
    getPayrollDetails() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {
        for (let i = 0; i < this.payrollDetails.length; i++) {
          const title = this.payrollDetails[i].title.toLowerCase().replace(/ /g, '_');
          if (this.employeeDetails[0].payroll_details.hasOwnProperty(title)) {
            this.payrollDetails[i].description = this.employeeDetails[0].payroll_details[title] ? this.employeeDetails[0].payroll_details[title] : '-';
          }
        }
      }
    },
    getBankDetails() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {
        const updatedBankArray = [
          {
            title: this.employeeDetails[0].bank.bank_name || '-',
            accTitle: this.bank_details[0].accTitle,
            accountNo: ' ' + (this.employeeDetails[0].bank.account_number || '-'),
            itemTitle: this.bank_details[0].itemTitle,
            itemValue: ' ' + (this.employeeDetails[0].bank.bank_address || '-'),
            itemTitle1: this.bank_details[0].itemTitle1,
            itemValue1: this.employeeDetails[0].bank.iban || '-',
            itemTitle2: this.bank_details[0].itemTitle2,
            itemValue2: this.employeeDetails[0].bank.salary_payment_mode || '-'
          }
        ]
        this.bank_details = updatedBankArray
      }
    },
    getCompanyLocations() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {
        this.location_details[0].title = this.employeeDetails[0].company_country;
        this.location_details[0].address = this.employeeDetails[0].company_address;
        this.location_details[0].phone = this.employeeDetails[0].company_phone;
        this.location_details[0].email = this.employeeDetails[0].company_email;
      }
    },
    getEmergencyContactDetails() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {

        this.contact_details = []
        for (let i = 0; i < 2; i++) {
          const title = this.employeeDetails[0].emergency[`name${i !== 0 ? "_" + i : ""}`];
          const phone = this.employeeDetails[0].emergency[`phone${i !== 0 ? "_" + i : ""}`];
          const relationship = this.employeeDetails[0].emergency[`relationship${i !== 0 ? "_" + i : ""}`];
          this.contact_details.push({ title, phone, relationship })
        }


        // const keys = Object.keys(this.employeeDetails[0].emergency);
        // const numberOfObjects = (keys.length - 3) / 3;
        // for (let i = 1; i <= numberOfObjects; i++) {
        //   const newObject = {
        //     title: this.employeeDetails[0].emergency[`name_${i}`],
        //     phone: this.employeeDetails[0].emergency[`phone_${i}`],
        //     relationship: this.employeeDetails[0].emergency[`relationship_${i}`],
        //   };

        //   this.contact_details.push(newObject);
        // }
      }
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
    },
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        this.dragging = false;
        return;
      }
      this.createFile(e, files, type);
    },
    removeFile(val) {
      if (val == 'uploadDoc') this.uploadFile = '';
      this.filename_attach = []
      // if (val == 'ecard') this.ecardFile = '';
      // if (val == 'bulk') this.bulkFile = '';
    },
    createFile(e, file, type) {
      if (file.size > 10000000) {
        alert('please check file size is not more than 10 MB.')
        this.dragging = false;
        return;
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file;
      // if (type == 'ecard') this.ecardFile = file
      // if (type == 'bulk') this.bulkFile = file
      this.dragging = false;
    },
    onUploadFiles(event) {
      this.uploadFiles = event;
      this.dragging = false;
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    async attachFile() {
      this.uploading = true
      let attach = {}

      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      for (var key in this.attachFiles) {
        if (!_.isEmpty(this.attachFiles[key])) {
          for (let i = 0; i < this.attachFiles[key].length; i++) {
            if (this.attachFiles[key][i].name != undefined) {
              // let upload_meta = {
              //   file: this.attachFiles[key][i],
              //   filename: this.attachFiles[key][i].name
              // }

              attach.file = this.attachFiles[key][i]

            } else {
              console.log('null')
            }
          }
        }
        this.removeFile(key)
      }

      const fd = new FormData();

      fd.append('documents', attach.file)


      await this.$axios.$post(`/documents/simpleupload`, fd, { headers: { Authorization: AuthStr } })
        .then(async (response) => {

          let obj = {
            image_url: response[0]
          }

          await this.$axios.$patch(`/users/${this.employeeDetails[0]._id}`, obj, { headers: { Authorization: AuthStr } })
            .then((res) => {
              this.snack = true
              this.snackColor = 'success'
              this.snackText = 'Profile Has Been Updated Successfully.'
              this.$emit('updatedEmployeeClicked', this.employeeDetails[0]._id)
              this.uploadPicture = false
              this.uploading = false
            })
        })
    },
  },
  computed: {

  },
}
</script>
<style lang="scss" scoped>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: .5;
  position: absolute;
  width: 100%;
}

.dropZone {
  width: 220px;
  height: 80px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone:hover {
  border: 2px solid #2e94c4;
}

.dropZone:hover .dropZone-title {
  color: #1975A0;
}

.dropZone-info {
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}

.dropZone-title {
  color: #787878;
}

.dropZone input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.dropZone-upload-limit-info {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.dropZone-over {
  background: #5C5C5C;
  opacity: 0.8;
}

.dropZone-uploaded {
  width: 220px;
  height: 75px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone-uploaded-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>
