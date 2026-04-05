<template>
  <v-row>
    <v-col cols="12" class="pa-0">
      <div class="mb-6 d-flex align-center customer_icon">
        <v-avatar class="" size="90px" v-if="EmployeeDetails && EmployeeDetails.image_url != ''">
          <v-avatar size="90">
            <v-img alt="Avatar" :src="EmployeeDetails.image_url" v-if="EmployeeDetails.image_url" />
            <customerDefaultIcon style="border-radius: 50px" v-else />
          </v-avatar>
        </v-avatar>
        <h4 class="ml-5">{{ EmployeeDetails.first_name }} {{ EmployeeDetails.middle_name }} {{ EmployeeDetails.last_name
        }}</h4>
      </div>
    </v-col>
    <v-row>
      <!-- Employer DETAILS TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
        :headers="companyHeaders" :items="companyDetails" hide-default-footer default-sort="false">
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
        <template v-slot:header.action="{ header }">
          <th class=" d-flex justify-end ">
            <!-- <v-btn class="customer_table_btn" outlined color="primary">{{ header.text }}</v-btn> -->
          </th>
        </template>
        <template v-slot:item="{ item, index }">
          <tr>
            <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
            <td class=" d-flex align-center">{{ item.description }}</td>
            <td class=""> </td>
          </tr>
        </template>
      </v-data-table>
      <!-- Employee DETAILS TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
        :headers="EmployeeHeaders" :items="EmployeeDetail" hide-default-footer>
        <template v-slot:header.title="{ header }">
          <div class="d-flex align-center pa-0 ">
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
            <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
            <!-- <div class=" d-flex  align-center pa-0 ">
                         <div> <InfoSVG/>  </div>
                          <div> <td class="pb-2">{{ item.description }}</td> </div>
                     </div> -->
            <td class=" d-flex align-center">
              {{ item.description }}
            </td>
            <td class=""> </td>
          </tr>
        </template>

      </v-data-table>
      <!-- Payroll DETAILS TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
        :headers="payrollHeaders" :items="payrollDetails" hide-default-footer>
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
            <!-- <v-btn class="customer_table_btn" outlined color="primary">{{ header.text
          }}</v-btn> -->
          </th>
        </template>


        <template v-slot:item="{ item, }">
          <tr>
            <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
            <!-- <div class=" d-flex  align-center pa-0 ">
                         <div> <InfoSVG/> </div>
                          <div> <td class="pb-2">{{ item.description }}</td> </div>
                     </div> -->
            <td class=" d-flex align-center">
              {{ item.description.display }}
            </td>
            <td class=""> </td>
          </tr>
        </template>

      </v-data-table>
      <!-- CONTACTS TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5"
        :headers="contact_headers" :items="contact_details" hide-default-footer>
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
            <!-- <v-btn class="customer_table_btn" outlined color="primary">{{ header.text
          }}</v-btn> -->
          </th>
        </template>

        <template v-slot:item="{ item, }">
          <tr>
            <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
            <td class="pb-2 pt-2">{{ item.description }} </td>
            <td class=""> </td>
          </tr>
        </template>
      </v-data-table>
      <!--Emergency contact -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5"
        :headers="emergencyContact_headers" :items="emergencyContact_details" hide-default-footer>

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
            <!-- <v-btn class="customer_table_btn" outlined color="primary">{{ header.text
          }}</v-btn> -->
          </th>
        </template>

        <template v-slot:item="{ item, }">
          <tr>

            <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
            <td class="pb-2 pt-2" style="width: 68% !important;">
              <div class="d-flex" style="gap: 4px;">
                <div class=""> {{ item.nameTitle }} <br> {{ item.relationTitle }} <br> {{ item.mobileTitle }} <br> {{
                  item.countryTitle }}</div>
                <div class="account_details ml-9"> {{ item.name }} <br> {{ item.relation }} <br> {{ item.mobile }} <br> {{
                  item.country }} </div>
              </div>
            </td>
            <td class=""> </td>

          </tr>
        </template>
      </v-data-table>
      <!-- COMPANY BANK TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5"
        :headers="bank_headers" :items="bank_details" hide-default-footer>

        <template v-slot:header.title="{ header }">
          <div class=" d-flex  align-center pa-0 ">
            <div>
              <bankSVG />
            </div>
            <div>
              <th class="pl-2">{{ header.text }}</th>
            </div>
          </div>
        </template>
        <template v-slot:header.action="{ header }">
          <th class=" d-flex justify-end ">
            <!-- <v-btn class="customer_table_btn" outlined color="primary">{{ header.text
          }}</v-btn> -->
          </th>
        </template>

        <template v-slot:item="{ item, }">
          <tr>

            <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
            <td class="pb-2 pt-2" style="width: 68% !important;">
              <div class="d-flex" style="gap: 4px;">
                <div>{{ item.accTitle }} <br> {{ item.itemTitle }}</div>
                <div class="account_details"> {{ item.accountNo }} <br> {{ item.itemValue }} </div>
              </div>
            </td>
            <td class=""> </td>

          </tr>
        </template>
      </v-data-table>
      <!-- insurance DETAILS TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
        :headers="insuranceHeaders" :items="insuranceDetails" hide-default-footer>
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
        <template v-slot:header.action="{ header }">
          <th class=" d-flex justify-end ">
            <!-- <v-btn class="customer_table_btn" outlined color="primary">{{ header.text
          }}</v-btn> -->
          </th>
        </template>
        <template v-slot:item="{ item }">
          <tr>
            <td class="" style="width: 25% !important">{{ item.title }}</td>
            <td class="" v-if="item.title == 'Insurance Card' && item.description !== '-'">
              <v-btn color="#fc6060" small class="rounded-xl" outlined @click="openDocumentURL(item.description)"><v-icon
                  small>mdi-file-document-outline</v-icon>File {{ 1 }}</v-btn>
            </td>
            <td class="" v-else>{{ item.description }}</td>
            <td class=""></td>
          </tr>
        </template>


      </v-data-table>
      <!-- Dependent DETAILS TABLE -->
      <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5"
        :headers="dependentHeaders" :items="dependentDetails" hide-default-footer>
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
        <template v-slot:header.action="{ header }">
          <th class=" d-flex justify-end ">
            <!-- <v-btn class="customer_table_btn" outlined color="primary">{{ header.text
          }}</v-btn> -->
          </th>
        </template>


        <template v-slot:item="{ item, }">
          <tr>
            <td class="pr-0" style="width: 215px !important;">{{ item.title }}</td>
            <!-- <div class=" d-flex  align-center pa-0 ">
                         <div> <InfoSVG/> </div>
                          <div> <td class="pb-2">{{ item.description }}</td> </div>
                     </div> -->
            <td class=" d-flex align-center">
              {{ item.description }}
            </td>
            <td class=""> </td>
          </tr>
        </template>

      </v-data-table>
    </v-row>


  </v-row>
</template>
<script>
import '@/assets/scss/utils/_customerListDetails.scss'
import InfoSVG from '@/assets/images/Customer/info.svg'
import WalletSVG from '@/assets/images/Customer/wallet.svg'
import BinanceSVG from '@/assets/images/icons/binance-logo.svg'
import phoneSVG from '@/assets/images/Customer/phone.svg'
import settingSVG from '@/assets/images/Customer/setting.svg'
import locationSVG from '@/assets/images/Customer/location.svg'
import bankSVG from '@/assets/images/Customer/bank.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import CustomerCard from '~/components/Cards/CustomerDetailCard/index.vue'

export default {
  components: {
    CustomerCard,
    customerDefaultIcon,
    InfoSVG,
    phoneSVG,
    settingSVG,
    locationSVG,
    bankSVG,
    BinanceSVG,
    WalletSVG,
  },
  props: {
    selectedCustomer: String,
    selectedEmployee: String
  },
  data() {
    return {
      companyHeaders: [
        { text: 'EMPLOYER', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: 'Edit', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      companyDetails: [
        {
          title: 'Customer / Employer',
          description: '',
        },
        {
          title: 'Legal Entity',
          description: '',
        },
        {
          title: 'Employee ID',
          description: '',
        },
      ],

      EmployeeHeaders: [
        { text: 'EMPLOYEE DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      EmployeeDetail: [
        {
          title: 'First Name',
          description: '',
        },
        {
          title: 'Middle Name',
          description: '',
        },
        {
          title: 'Last Name',
          description: '',
        },
        {
          title: 'Employee Legal Name',
          description: '',
        },
        {
          title: 'Password',
          description: '********',
        },
        {
          title: 'Date of Birth',
          description: '',
        },
        {
          title: 'Gender',
          description: '',
        },
        {
          title: 'Marital Status',
          description: '',
        },
        {
          title: 'Nationality',
          description: '',
        },
        {
          title: 'Allergies',
          description: '',
        },
        {
          title: 'Designation',
          description: '',
        },
        {
          title: 'DOJ',
          description: '',
        },
        {
          title: 'Work Location',
          description: '',
        },
        {
          title: 'Address',
          description: '',
        },
        {
          title: 'Specialty',
          description: '',
        },
        {
          title: 'Skill Sets',
          description: '',
        },
      ],
      payrollHeaders: [
        { text: 'PAYROLL DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: 'Edit', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
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
        { text: 'CONTACT', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'start', hideSortIcon: true, sortable: false },
        { text: 'Edit', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      contact_details: [
        {
          title: 'Work Email',
          description: '',
        },
        {
          title: 'Personal Email',
          description: '',
        },
        {
          title: 'Mobile Number',
          description: '',
        },
        {
          title: 'Personal Mobile',
          description: '',
        },
        {
          title: 'Whatsapp Number',
          description: 'Same as Personal Mobile',
        },
        {
          title: 'Office Extension',
          description: '',
        },
        {
          title: 'Speed Dial',
          description: '',
        },
      ],
      bank_headers: [
        { text: 'BANK DETAILS', value: 'title', align: 'start', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'start', hideSortIcon: true, sortable: false },
        { text: 'Edit', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      bank_details: [
        {
          title: '',
          accTitle: 'AC No.',
          accountNo: '',
          itemTitle: 'Bank Address',
          itemValue: '',
          itemTitle1: 'IBan',
          itemValue1: '',
          itemTitle2: 'Payment Mode',
          itemValue2: '',
        },
      ],
      emergencyContact_headers: [
        { text: 'EMERGENCY CONTACT', value: 'title', align: 'start', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'start', hideSortIcon: true, sortable: false },
        { text: 'Edit', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      emergencyContact_details: [],
      insuranceHeaders: [
        { text: 'INSURANCE DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: 'Add', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      insuranceDetails: [
        {
          title: 'Insurance Name',
          description: '',
          align: 'start',
        },
        {
          title: 'Insurance Card No',
          description: '',
        },
        {
          title: 'Network Name',
          description: '',
        },
        {
          title: 'Insurance Card',
          description: '',
        },
      ],
      dependentHeaders: [
        { text: 'DEPENDENT DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: 'Edit', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      dependentDetails: [],
      EmployeeDetails: []
    }
  },
  mounted() {
    this.getEmployeeDetails(this.selectedEmployee)
    // console.log(this.selectedCustomer, '--------------selectedCustomer props')
    // console.log(this.selectedEmployee, '----------selectedEmployee props')
  },
  methods: {
    async getEmployeeDetails(user_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(`/users/employee/details/${user_id}`, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.EmployeeDetails = response[0];
          // console.log(this.EmployeeDetails, '-----------------this.EmployeeDetails' )

          await this.getCompanyDetails()
          await this.getEmpDetails()
          await this.getPayrollDetails()
          await this.getContactDetails()
          await this.getBankDetails()
          await this.getInsuranceDetails()
          await this.getDependentDetails()
          await this.getEmergencyContactDetails()
        })
        .catch((err) => console.log(err))
    },
    getCompanyDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails !== undefined) {
        this.companyDetails[0].description = this.EmployeeDetails.company_name ? this.EmployeeDetails.company_name : '-'
        this.companyDetails[1].description = this.EmployeeDetails.legal_name ? this.EmployeeDetails.legal_name : '-'
        this.companyDetails[2].description = this.EmployeeDetails.emp_id ? this.EmployeeDetails.emp_id : '-'
      }
    },
    getEmpDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails !== undefined) {
        this.EmployeeDetail[0].description = this.EmployeeDetails.first_name ? this.EmployeeDetails.first_name : '-'
        this.EmployeeDetail[1].description = this.EmployeeDetails.middle_name ? this.EmployeeDetails.middle_name : '-'
        this.EmployeeDetail[2].description = this.EmployeeDetails.last_name ? this.EmployeeDetails.last_name : '-'
        this.EmployeeDetail[3].description = this.EmployeeDetails.legal_name ? this.EmployeeDetails.legal_name : '-',
          this.EmployeeDetail[4].description = this.EmployeeDetails.password ? this.EmployeeDetails.password : '********',
          this.EmployeeDetail[5].description = this.EmployeeDetails.personal.dob ? this.EmployeeDetails.personal.dob : '-'
        this.EmployeeDetail[6].description = this.EmployeeDetails.personal.gender ? this.EmployeeDetails.personal.gender : '-'
        this.EmployeeDetail[7].description = this.EmployeeDetails.personal.marital_status ? this.EmployeeDetails.personal.marital_status : '-'
        this.EmployeeDetail[8].description = this.EmployeeDetails.personal.nationality ? this.EmployeeDetails.personal.nationality : '-'
        this.EmployeeDetail[9].description = this.EmployeeDetails.personal.allergies ? this.EmployeeDetails.personal.allergies : '-'
        this.EmployeeDetail[10].description = this.EmployeeDetails.employment.designation ? this.EmployeeDetails.employment.designation : '-'
        this.EmployeeDetail[11].description = this.EmployeeDetails.date_of_joining ? this.EmployeeDetails.date_of_joining : '-'
        this.EmployeeDetail[12].description = this.EmployeeDetails.company_country ? this.EmployeeDetails.company_country : '-'
        this.EmployeeDetail[13].description = this.EmployeeDetails.company_address ? this.EmployeeDetails.company_address : '-'
        this.EmployeeDetail[14].description = this.EmployeeDetails.personal.speciality ? this.EmployeeDetails.personal.speciality : '-'
        this.EmployeeDetail[15].description = this.EmployeeDetails.personal.skill_sets ? this.EmployeeDetails.personal.skill_sets : '-'
      }
    },
    getPayrollDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails !== undefined) {
        if (this.EmployeeDetails.payroll_details !== undefined) {
          this.payrollDetails[0].description = this.EmployeeDetails.payroll_details.invoice_date
          this.payrollDetails[1].description = this.EmployeeDetails.payroll_details.payment_due_notification
          this.payrollDetails[2].description = this.EmployeeDetails.payroll_details.salary_payment_date
        }
      }
    },
    getContactDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails !== undefined) {
        this.contact_details[0].description = this.EmployeeDetails.email ? this.EmployeeDetails.email : '-'
        this.contact_details[1].description = this.EmployeeDetails.email ? this.EmployeeDetails.email : '-'
        this.contact_details[2].description = this.EmployeeDetails.contact_number ? this.EmployeeDetails.contact_number : '-'
        this.contact_details[3].description = this.EmployeeDetails.contact_number ? this.EmployeeDetails.contact_number : '-'
        this.contact_details[5].description = this.EmployeeDetails.ext ? this.EmployeeDetails.ext : '-'
        this.contact_details[6].description = this.EmployeeDetails.speed_dial ? this.EmployeeDetails.speed_dial : '-'
      }
    },
    getEmergencyContactDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails !== undefined && this.EmployeeDetails.hasOwnProperty('emergency')) {
        const keys = Object.keys(this.EmployeeDetails.emergency);
        const numberOfObjects = (keys.length - 3) / 3;
        for (let i = 1; i <= numberOfObjects; i++) {
          const newObject = {
            title: this.EmployeeDetails.emergency[`name_${i}`],
            mobile: this.EmployeeDetails.emergency[`phone_${i}`],
            relation: this.EmployeeDetails.emergency[`relationship_${i}`],
          };
          this.emergencyContact_details.push(newObject);
        }
      }
    },
    getBankDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails !== undefined && this.EmployeeDetails.bank !== undefined) {

        const allFieldsEmpty = this.areAllFieldsEmpty(this.EmployeeDetails.bank);

        if (allFieldsEmpty == false || allFieldsEmpty == 'false') {

          const updatedBankArray = [
            {
              title: this.EmployeeDetails.bank.bank_name || 'N/A',
              accTitle: this.bank_details[0].accTitle,
              accountNo: ' ' + (this.EmployeeDetails.bank.account_number || '-'),
              itemTitle: this.bank_details[0].itemTitle,
              itemValue: ' ' + (this.EmployeeDetails.bank.bank_address || '-'),
              itemTitle1: this.bank_details[0].itemTitle1,
              itemValue1: this.EmployeeDetails.bank.iban || '-',
              itemTitle2: this.bank_details[0].itemTitle2,
              itemValue2: this.EmployeeDetails.bank.salary_payment_mode || '-'
            }
          ]
          this.bank_details = updatedBankArray
        } else {
          this.bank_details = []
        }
      }
    },
    getInsuranceDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails !== undefined) {
        for (const item of this.insuranceDetails) {
          const title = item.title.toLowerCase().replace(/ /g, '_');
          if (this.EmployeeDetails.insurance.hasOwnProperty(title)) {
            item.description = this.EmployeeDetails.insurance[title] ? this.EmployeeDetails.insurance[title] : '-';
          }
        }
      }
    },
    openDocumentURL(val) {
      window.open(val)
    },
    getDependentDetails() {
      if (this.EmployeeDetails && this.EmployeeDetails.dependent_details.length > 0) {

        this.dependentDetails = this.EmployeeDetails.dependent_details.map(dependent => ({
          title: dependent.dependent_name,
          description: dependent.relation
        }));

      }
    },
    areAllFieldsEmpty(data) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          if (data[key].trim() !== "") {
            return false;
          }
        }
      }
      return true;
    }
  }
}
</script>
