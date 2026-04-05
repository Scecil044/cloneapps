<template>
  <div>
    <v-row v-if="!showEditModel">
      <!-- <v-col cols="12" class="pa-0"> -->
      <!-- Top-Cards -->
      <!-- <InsightCard class="mb-6" :data="DetailsCard" />
      </v-col> -->
      <v-col cols="12" class="pa-0">
        <!-- Banking Details-->
        <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
          :headers="bankingDetails_headers" :items="bankingDetails_data"
          :footer-props="{ 'items-per-page-options': [10, 20] }" hide-default-footer>
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
              <v-btn class="customer_table_btn" @click="handleEditModalWrapper(bankingDetails_headers[0].text)" outlined
                color="primary">{{ header.text }}</v-btn>
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

        <!-- salary transfer letter -->
       <v-col cols="12">
         <div class="d-flex align-center pa-0 ">
          <v-alert
            prominent
            dense
            text
            :color="!salary_transfer_letter_required ? 'error': 'info'"
            :icon="!salary_transfer_letter_required ? 'mdi-cloud-alert': 'mdi-shield-lock-outline'"
          >
            <v-row align="center">
              <v-col  class="grow">
                <p class="tw-mb-2" v-if="salary_transfer_letter_required">
                  Salary clearance certificate is mandatory to edit banking details
                </p>
                <v-switch @change="handleSalaryToggle($event)" v-model="salary_transfer_letter_required">
                  <template v-slot:label>
                    {{  salary_transfer_letter_required ? 'Salary Transfer Letter Added' : 'Salary Transfer Letter Not Provided' }}
                  </template>
                </v-switch>
              </v-col>
              <v-col class="shrink" v-if="salary_transfer_letter_required && employeeUserInfo?.uploadedSalaryTransfer">
                <v-btn link :href="employeeUserInfo?.salaryTransferDocument[0]?.url" target="_blank">
                  <v-icon>mdi-open-in-new</v-icon>
                  Preview
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>
        </div>

       </v-col>
        <!-- Insurance Details-->


        <v-row class="pt-5">
          <v-col cols="12" sm="6" class="px-5 font weight-bold pt-0 text-left">
            <v-card-title class=" pa-0">
              <v-img src="/adminCentral/employment.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
              <h2 class="darkBlue-heading-text subHeadingFontSize">Insurance Details</h2>
              <v-spacer></v-spacer>
            </v-card-title>
          </v-col>
          <v-col cols="12" sm="6" class="text-right pt-0 d-flex justify-end align-center">
            <v-tooltip top color="grey" v-if="parent_company_id == '62fb3df39f14e35fe7ed9c9a' && userInsuranceDetails && userInsuranceDetails.length > 0 && userInsuranceDetails[0].update_flag">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="#5C7EEF" class="mr-2 rounded-xl" small outlined v-bind="attrs" v-on="on">
                  <v-img src="/adminCentral/add.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Upgrade Insurance
                </v-btn>
              </template>
                Please Contact Insurance Broker for Upgrade Request As Your Plan Has Already Been Updated Once.
            </v-tooltip>
            <!--&& calculateNoOfDays(userInsuranceDetails[0].start_date.toString().slice(0,10)) > 90 && calculateNoOfDays(userInsuranceDetails[0].user_start_date.toString().slice(0,10)) > 90-->
            <v-btn color="#5C7EEF" class="mr-2 rounded-xl" small outlined @click="upgradeDialogOpen = true;getDependentDetails(employeeDetails[0]);" v-else-if="parent_company_id == '62fb3df39f14e35fe7ed9c9a' && userInsuranceDetails && userInsuranceDetails.length > 0 ">
              <v-img src="/adminCentral/add.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Upgrade Insurance
            </v-btn>
            <v-btn color="#ff4d4d" class="mr-2 rounded-xl" @click="dialogDeleteRequest = true;" small outlined v-if="userInsuranceDetails && userInsuranceDetails.length > 0">
              <v-img src="/client/inactive.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Cancel Insurance
            </v-btn>
            <v-btn color="#5C7EEF" class="mr-2 rounded-xl" @click="insuranceAdditionFlag = true" small outlined v-else>
              <!-- <v-progress-circular v-if="userLoading" indeterminate color="secondary"></v-progress-circular> -->
              <v-img src="/adminCentral/add.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Add Insurance
            </v-btn>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row>

          <v-col cols="12" class="mx-auto" v-if="insuranceAgent">
            <v-row>
              <v-col cols="12" sm="12" md="12" class="pb-0">
                <div class="d-flex flex-row align-items-start">
                  <span class="mb-0 caption blue-grey--text font-weight-light" style="font-size: 16px!important;">Insurance Agent: </span>
                  <span class="mb-0 ml-2 caption blue-grey--text font-weight-bold" style="font-size: 16px!important;">
                    {{ Object.values(insuranceAgent)[0] }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="8" class="mx-auto">
            <v-card class="borderRadiusCards pa-6 mt-6" style="box-shadow: 0px 24px 30px #959EA51A;background-image:url('/profile/insurance_background.svg');background-size:cover;position:relative" min-height="240" color="#99C8FE" v-if="userInsuranceDetails && userInsuranceDetails.length > 0">
              <v-row>
                <v-col cols="2" class="pa-0" style="position:absolute;top:10%;z-index: 2;right:5%">
                  <v-img :src="userInsuranceDetails[0].logo"  max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                </v-col>
              </v-row>
              <v-row :style="{ 'margin-top': '3.75rem' }">
                <v-col cols="6">
                  <v-card-text class="py-0 pl-1 mb-3">
                    <p class="white--text mb-0">Network Name</p>
                    <p class="darkBlue-heading-text mb-0">{{ userInsuranceDetails[0].network }}</p>
                  </v-card-text>
                </v-col>
                <v-col cols="6">
                  <v-card-text class="py-0 pl-1">
                    <p class="white--text mb-0">Expiry Date</p>
                    <p class="darkBlue-heading-text mb-0">{{ userInsuranceDetails[0].expiry_date | textDate}}</p>
                  </v-card-text>
                </v-col>
              </v-row>
              <v-row class="px-4 pl-1">
                  <v-col cols="auto" class="py-0">
                      <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="userInsuranceDetails[0].attachments && userInsuranceDetails[0].attachments.length > 0 ">
                          <v-btn elevation="0" small :href="userInsuranceDetails[0].attachments.filter((a) => a.documentType == 'ecard')[0].link" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">E-Card</v-btn>
                      </v-btn>
                  </v-col>
                  <v-col cols="auto" class="py-0">
                      <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="userInsuranceDetails[0].tob">
                          <v-btn elevation="0" small :href="userInsuranceDetails[0].tob" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Coverage</v-btn>
                      </v-btn>
                  </v-col>
                  <v-col cols="auto" class="py-0">
                    <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="userInsuranceDetails[0].networklist">
                      <v-btn elevation="0" small :href="userInsuranceDetails[0].networklist" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Network</v-btn>
                    </v-btn>
                </v-col>
              </v-row>
            </v-card>
            <v-card class="borderRadiusCards  pa-6 mt-6" style="box-shadow: 0px  24px 30px #959EA51A;background-image:url('/profile/insurance_background.svg');background-size:cover;position:relative" min-height="240" color="#99C8FE" v-else>
              <v-row>
                <v-spacer></v-spacer>
                <v-col cols="2" class="pa-0" style="position:absolute;top:10%;z-index: 2;right:5%">
                  <v-img src="/profile/lorem.png"  max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                </v-col>
              </v-row>
              <v-row :style="{ 'margin-top': '3.75rem' }">
                <v-col cols="6">
                  <v-card-text class="py-0 pl-1 mb-3">
                    <p class="white--text mb-0">Network Name</p>
                    <p class="darkBlue-heading-text mb-0">{{employeeDetails[0].insurance.network_name}}</p>
                  </v-card-text>
                </v-col>
                <v-col cols="6">
                  <v-card-text class="py-0 pl-1">
                    <p class="white--text mb-0">Expiry Date</p>
                    <p class="darkBlue-heading-text mb-0">{{employeeDetails[0].insurance.expiry_date | textDate}}</p>
                  </v-card-text>
                </v-col>
              </v-row>
              <v-row class="px-4 pl-1">
                <v-col cols="auto" class="py-0">
                  <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0">
                    <v-btn elevation="0" small :href="employeeDetails[0].insurance && employeeDetails[0].insurance.insurance_card" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">E-Card</v-btn>
                    <!-- <v-card-text style="font-size:13px;color:#0064D7" class="py-0">E-card</v-card-text > -->
                  </v-btn>
                </v-col>
                <v-col cols="auto" class="py-0">
                  <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0">
                    <v-btn elevation="0" small :href="employeeDetails[0].insurance && employeeDetails[0].insurance.coverage_list" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Coverage</v-btn>
                  </v-btn>
                </v-col>
                <v-col cols="auto" class="py-0">
                  <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0">
                    <v-btn elevation="0" small :href="employeeDetails[0].insurance && employeeDetails[0].insurance.network_list" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Network</v-btn>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

    </v-row>
    <EditModel v-if="showEditModel" :selectedCustomer="employeeDetails[0]._id" :headerTitle="headerTitle"
      :companiesDetails="employeeDetails" @close="updateEmployeeData(false)" :handleModel="handleEditModel" />
      <DialogsDocumentAddDialog
        v-if="document_upload_required"
        :type="'new'"
        :type-name="document_type"
        :module="'users'"
        :documentPayload="this.salary_transfer_letter"
        :foreign_id="employeeDetails[0]._id"
        :identifier="'users'"
        @added-document='attached_document_event_handler($event)'
        @close="addDocumentClose"
      />


      <v-dialog v-model="insuranceAdditionFlag" max-width="1000" min-width='1000' max-height="900" style="overflow-x : hidden;">
        <InsuranceAddition :employee="employeeDetails[0]" :principal_type="'Principal'" :insuranceAgent="insuranceAgent" :parent_company_id="parent_company_id" :parent_company="parent_company" :legal_entity="legal_entity" @close="closeInsuranceAddition" @add="addInsuranceRequest" v-if="insuranceAdditionFlag"/>
      </v-dialog>

      <v-dialog v-model="dialogDeleteRequest" max-width="720" max-height="350px" style="overflow-x : hidden;">
        <InsuranceCancellation :employee="employeeDetails[0]" :principal_type="'Principal'" :parent_company_id="parent_company_id" :parent_company="parent_company" :userInsuranceDetails="userInsuranceDetails" @close="closeInsuranceCancellation" v-if="dialogDeleteRequest"/>
      </v-dialog>

      <v-dialog v-model="upgradeDialogOpen" max-width="1000" min-width='1000' max-height="1000px" style="overflow-x : hidden;">
        <InsuranceUpgradation :employee="employeeDetails[0]" :principal_type="'Principal'" :parent_company_id="parent_company_id" :parent_company="parent_company" :dependentList="dependentList" :userInsuranceDetails="userInsuranceDetails" :clonedDependentList="clonedDependentList" @close="closeInsuranceUpgradation" v-if="upgradeDialogOpen" />
      </v-dialog>



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
import settingSVG from '@/assets/images/Customer/setting.svg'
import InsightCard from '~/components/Cards/InsightCard/index.vue'
import EditModel from '~/components/EditModel/editEmployees.vue'

import InsuranceAddition from "~/components/Insurance/insuranceAddition.vue";
import InsuranceCancellation from "~/components/Insurance/insuranceCancellation.vue";
import InsuranceUpgradation from "~/components/Insurance/insuranceUpgradation.vue";

export default {
  components: {
    InfoSVG,
    settingSVG,
    InsightCard,
    EditModel,
    InsuranceAddition,
    InsuranceCancellation,
    InsuranceUpgradation
  },
  props: { employeeDetails: Array,userInsuranceDetails: Array, parent_company_id: String, legal_entity: String, parent_company: String, insuranceAgent: [Object, String] },
  data() {
    return {
      avatar: '/1.jpg',
      salary_transfer_letter_required: false,
      transfer_clearance_letter_required: false,
      bankingDetails_headers: [
        {
          text: 'BANKING DETAILS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      document_type: '',
      document_upload_required: false,
      bankingDetails_data: [
        {
          title: 'Bank Name',
          description: 'World Bank',
          align: 'start',
        },
        {
          title: 'Routing Code',
          description: '000000000',
          align: 'start',
        },
        {
          title: 'Account Number',
          description: 'E1237516186316126312',
          align: 'start',
        },
        {
          title: 'IBAN',
          description: 'IBAN128735612371273581',
        },
        {
          title: 'Bank Post Office',
          description: '31219',
        },
        {
          title: 'Bank Address',
          description: 'Burjman',
        },
        {
          title: 'Salary Payment Mode',
          description: 'Account',
        },

      ],
      insurance_headers: [
        {
          text: 'INSURANCE DETAILS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      insuranceDetails_data: [
        {
          title: 'Insurance Name',
          description: 'Value',
          align: 'start',
        },
        {
          title: 'Insurance Card No',
          description: 'Value',
        },
        {
          title: 'Network Name',
          description: 'Value',
        },
        {
          title: 'Insurance Card',
          description: 'Value',
        },
      ],
      medical_headers: [
        {
          text: 'MEDICAL DETAILS ',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      DetailsCard: [
        {
          status: 'Annual Leaves',
          count: '',
        },
        {
          status: 'Medical Leaves',
          count: '',
        },
        {
          status: 'Maternity Leaves',
          count: '',
        },
        {
          status: 'Emergency Leaves',
          count: '',
        },
        {
          status: 'Parental Leaves',
          count: '',
        },
      ],
      headerTitle: '',
      showEditModel: false,
      snack: false,
      snackText: '',
      snackColor: '',
      // parent_company_id: '',
      upgradeDialogOpen: false,
      dependentsLoading: false,
      dependentList: [],
      clonedDependentList:[],
      dialogDeleteRequest:false,
      insuranceAdditionFlag: false,
      require_salary_transfer_document: false,
      attached_salary_clearance_doc: false,
      modal_title: '',
      salary_transfer_letter: null
    }
  },

  methods: {
    addNewDocument(doc_name) {
      this.document_type = doc_name
      this.document_upload_required = true
    },
    handleSalaryToggle(event) {
      this.addNewDocument('Salary Transfer Letter')
      // if (this.salary_transfer_letter_required) {
      //   this.require_salary_transfer_document = true
      // }
    },
    attached_document_event_handler(status) {
      console.log('added document callback ----: ', status)
      this.document_upload_required = false
      if (status) {
        if (this.document_type == 'Salary Clearance Letter') {
          this.attached_salary_clearance_doc = true
          this.updateEmployeeData(true)
          console.log('should show edit section ...')
          this.handleEditModalWrapper(this.modal_title)
        } else {
          this.updateEmployeeData(false)
        }
      } else {
        // show error
        this.snack = true
        this.snackColor = 'error'
        this.snackText = 'Failed to add document, please try again!'
      }
        // this.has_attached_salary_transfer_document = status
    },
    addDocumentClose() {
      this.document_upload_required = false
      if (this.document_type == 'Salary Transfer Letter') {
        this.salary_transfer_letter_required = !this.salary_transfer_letter_required
      }
    },
    async getDependentDetails(user){
      const token =  this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token);

      let obj = {
        parent_id: '63493cb4491224c1c039536a',
        user_id: user._id
      }

      this.dependentsLoading = true

      await this.$axios.$post(process.env.insurancePortalUrl+ 'company/insurance/upgradation/' + this.parent_company_id + '/getdependentsdetails', obj, { headers: { Authorization: AuthStr } })
        .then(res => {
        if(res.length > 0) {
            this.dependentList = res
            this.clonedDependentList = _.cloneDeep(this.dependentList)
        }
        this.dependentsLoading = false
      })
    },
    calculateNoOfDays(dateString){
      const currentDate = new Date();
      const inputDate = new Date(dateString);
      const oneDay = 24 * 60 * 60 * 1000; // number of milliseconds in one day

      // Calculate the difference in days between the input date and the current date
      const diffDays = Math.round(Math.abs((currentDate - inputDate) / oneDay));

      return diffDays;
    },
    closeInsuranceUpgradation(event) {
      if(event == 'Upgrade Request Has Been Successfully Created.'){
        this.upgradeDialogOpen = false
        this.snack = true
        this.snackColor = 'primary'
        this.snackText = 'Upgrade Request Has Been Successfully Created.'
      }else {
        this.upgradeDialogOpen = false
      }
    },
    closeInsuranceCancellation(event){
      if(event == 'Already Request Is Existing') {
        this.dialogDeleteRequest = false
        this.snack = true
        this.snackColor = 'error'
        this.snackText = 'Already Request Is Existing'
      } else if(event == 'Insurance Delete request successfully created') {
        this.dialogDeleteRequest = false
        this.snack = true
        this.snackColor = 'success'
        this.snackText = 'Insurance Delete request successfully created'
      } else if(event == 'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !') {
        this.dialogDeleteRequest = false
        this.snack = true
        this.snackColor = 'error'
        this.snackText = 'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !'
      }
      else {
        this.dialogDeleteRequest = false
      }
    },
    closeInsuranceAddition(event){
      this.insuranceAdditionFlag = false
    },
    addInsuranceRequest(event){
      this.insuranceAdditionFlag = false
      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Insurance request successfully created'
    },


    getDetailsCardCount() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {
        this.DetailsCard[0].count = this.employeeDetails[0].leaves.annual_leaves ? this.employeeDetails[0].leaves.annual_leaves : '0'
        this.DetailsCard[1].count = this.employeeDetails[0].leaves.medical_leaves ? this.employeeDetails[0].leaves.medical_leaves : '0'
        this.DetailsCard[2].count = this.employeeDetails[0].leaves.maternity_leaves ? this.employeeDetails[0].leaves.maternity_leaves : '0'
        this.DetailsCard[3].count = this.employeeDetails[0].leaves.emergency_leaves ? this.employeeDetails[0].leaves.emergency_leaves : '0'
        this.DetailsCard[4].count = this.employeeDetails[0].leaves.parental_leaves ? this.employeeDetails[0].leaves.parental_leaves : '0'
      }
    },
    getBankDetailsData() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {
        for (const item of this.bankingDetails_data) {
          const title = item.title.toLowerCase().replace(/ /g, '_');
          if (this.employeeDetails[0].bank.hasOwnProperty(title)) {
            item.description = this.employeeDetails[0].bank[title] ? this.employeeDetails[0].bank[title] : '-';
          }
        }
      }
    },
    getInsuranceData() {
      if (this.employeeDetails && this.employeeDetails.length > 0) {
        for (const item of this.insuranceDetails_data) {
          const title = item.title.toLowerCase().replace(/ /g, '_');
          if (this.employeeDetails[0].insurance.hasOwnProperty(title)) {
            item.description = this.employeeDetails[0].insurance[title] ? this.employeeDetails[0].insurance[title] : '-';
          }
        }
      }
    },
    openDocumentURL(val) {
      window.open(val)
    },
    handleEditModalWrapper(title) {
      if (!this.salary_transfer_letter_required) {
        this.handleEditModel(title)
      } else if (this.salary_transfer_letter_required && (this.attached_salary_clearance_doc || this.has_attached_clearance_document)) {
        this.handleEditModel(title)
      } else {
        // show document modal
          this.modal_title = title
         this.addNewDocument('Salary Clearance Letter')
      }
    },
    handleEditModel(title) {
      this.headerTitle = title
      this.showEditModel = !this.showEditModel
    },
    updateEmployeeData(disable = false) {
      console.log('calling update here and shoul reload')
      if (disable) {
        console.log('only closed the modal here ...')
        // this.showEditModel = !this.showEditModel
        this.headerTitle = ''
        this.snack = true
        this.snackColor = 'success'
        this.snackText = 'Document Added successfully.'
      } else {
        console.log('should reload update ...')
        this.$emit('updatedEmployeeClicked', this.employeeDetails[0]._id)
        this.initialize()
        this.headerTitle = ''
        this.snack = true
        this.snackColor = 'success'
        this.snackText = 'Details Has Been Updated Successfully.'
      }
    },
    async initialize() {
      await this.getDetailsCardCount()
      await this.getBankDetailsData()
      // await this.getInsuranceData()
      if (this.salaryRotationsStatus) {
        this.salary_transfer_letter = {
          "_id": "6807442ad98c51e323d0b4ff",
          "id": "6807442ad98c51e323d0b4ff",
          "type": "Salary Transfer Letter",
          "name": "Salary Transfer Letter",
        }
      }
      // tourist.
      if (this.employeeUserInfo && this.employeeUserInfo?.uploadedSalaryTransfer) {
        this.salary_transfer_letter_required = true
      }


      // if(this.employeeDetails && this.employeeDetails.length > 0 && this.employeeDetails[0].hasOwnProperty('employment') && this.employeeDetails[0].employment.visa_sponsor_type != ''){
      //   if(this.employeeDetails[0].employment.visa_sponsor_type == 'Dynamic Employment Services') {
      //     this.parent_company_id = '62fb3df39f14e35fe7ed9c9a'
      //   }

      //   if(this.employeeDetails[0].employment.visa_sponsor_type == 'Executive Employment Services') {
      //     this.parent_company_id = '62fb68ad9f14e35fe7eda269'
      //   }

      //   console.log(this.employeeDetails, '---------employeeDetails HR')
      // console.log(this.parent_company_id,'-----this.parent_company_id')
      // }




    }
  },

  async mounted() {
    await this.initialize()
  },
  computed: {
    salaryRotationsStatus() {
      if (this.employeeDetails[0]?.salary?.rotation_required && this.employeeDetails[0]?.uploadedSalaryTransfer) {
        return false
      }
      return this.employeeDetails[0]?.salary?.rotation_required || false
    },
    employeeUserInfo() {
      return this.employeeDetails[0]
    },
    has_attached_clearance_document() {
      if (this.employeeUserInfo && this.employeeUserInfo?.uploadedSalaryClearance) {
        return true
      }
      return false
    }
  },
}
</script>
