<template>
  <v-row>
    <v-col cols="12">
      <v-card color="card_bg" id="card">
        <v-card-title id="card-title" class="mb-4">
        </v-card-title>
        <v-card-text id="card-text2" style="max-height: 10vh !important" class="dl__l overflow-y-auto">
          <v-col cols="12" class="py-0 px-0">
            <div class="d-flex align-center">
              <span class="span_btnB"> Employee Details</span>

            </div>
          </v-col>
          <!-- Employee DETAILS TABLE -->
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
                <td class="pr-0" style="width: 215px !important;">Full Name</td>

                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.user_name }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Employer</td>

                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.company_name }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Last Working Day</td>

                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.last_working_day }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Exit Type</td>

                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.exit_type ? item.exit_type : '-' }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Reason</td>

                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.exit_reason ? item.exit_reason : '-' }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Joining Date</td>
                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.joining_date ? item.joining_date : '-' }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Contract Type</td>
                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.employment.contract_type ? item.employment.contract_type : '-' }}
                </td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Support Letter</td>
                <td class=" d-flex align-center">
                  <PdfSvg v-if="index === 6" class="mr-2" />
                  {{ item.support_letter[0] ? item.support_letter[0] : '-' }}
                </td>
                <td class=""> </td>
              </tr>
            </template>

          </v-data-table>
          <!-- Salary Payable -->
          <v-data-table v-if="employeeDetails && employeeDetails[0].status == 'new'" id="coa_table"
            class="main__table elevation-0 customDataTabel  th_customer mb-5" :headers="contact_headers"
            :items="employeeDetails" hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class=" d-flex  align-center pa-0 ">
                <div>
                  <CashSvg />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class=" d-flex justify-end "><v-btn class="customer_table_btn" outlined color="primary">{{ header.text
              }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item, }">
              <tr>
                <td class="pr-0" style="width: 215px !important;">Salary Unpaid</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.salary_unpaid }} </td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Basic Salary</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.basic_salary }} AED </td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Housing Allowance</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.housing_allowance }} AED</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Other Allowance</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.other_allowance }} AED</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Car Allowance</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.car_allowance }} AED</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Total Fixed</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.total_fixed }} AED</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Petrol Allowance</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.petrol_allowance }} AED</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Total Salary Payable</td>
                <td class="pb-2 pt-2">{{ item.salary_payable.total_salary_payable }} AED</td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table>
          <!-- Leave Encashment -->
          <v-data-table v-if="employeeDetails[0].status == 'new'" id="coa_table"
            class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5" :headers="leave_encash_headers"
            :items="employeeDetails" hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class=" d-flex  align-center pa-0 ">
                <div>
                  <CashSvg />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>

            <template v-slot:item="{ item, }">
              <tr>
                <td class="pr-0" style="width: 215px !important;">Leave Balance</td>
                <td class=" d-flex align-center">{{ item.leave_encashment.leave_balance }}</td>
                <td class=""> </td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Amount</td>
                <td class=" d-flex align-center">{{ item.leave_encashment.amount }} AED</td>
                <td class=""> </td>
              </tr>
            </template>

          </v-data-table>
          <!-- Gratuity -->
          <v-data-table v-if="employeeDetails[0].status == 'new'" id="coa_table"
            class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5" :headers="payrollHeaders"
            :items="employeeDetails" hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class=" d-flex  align-center pa-0 ">
                <div>
                  <CashSvg />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class=" d-flex justify-end "><v-btn class="customer_table_btn" outlined color="primary">{{ header.text
              }}</v-btn></th>
            </template>

            <template v-slot:item="{ item, }">
              <tr>
                <td class="pr-0" style="width: 215px !important;">Gratuity Amount</td>
                <td class=" d-flex align-center">{{ item.gratuity.gratuity_amount }} AED</td>
                <td class=""></td>
              </tr>
            </template>

          </v-data-table>
          <!-- Final Settlement / EOSB Details -->
          <v-data-table v-if="employeeDetails[0].status == 'cancel insurance'" id="coa_table"
            class="main__table elevation-0 customDataTabel  th_customer mb-5 mt-5" :headers="EOSBHeaders"
            :items="employeeDetails" hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class=" d-flex  align-center pa-0 ">
                <div>
                  <CashSvg />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class=" d-flex justify-end "><v-btn class="customer_table_btn" outlined color="primary">{{ header.text
              }}</v-btn></th>
            </template>

            <template v-slot:item="{ item, }">
              <tr>
                <td class="pr-0" style="width: 215px !important;">Total Gross Salary</td>
                <td class=" d-flex align-center">{{ item.salary_payable.gross ? item.salary_payable.gross : '-' }} AED
                </td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Salary Unpaid</td>
                <td class=" d-flex align-center">{{ item.salary_payable.salary_unpaid ? item.salary_payable.salary_unpaid
                  : '-' }} AED</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Leave Balance</td>
                <td class=" d-flex align-center">{{ item.leave_encashment.leave_balance ?
                  item.leave_encashment.leave_balance : '-' }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Leave Encashment</td>
                <td class=" d-flex align-center">{{ item.leave_encashment.amount ? item.leave_encashment.amount : '-' }}
                  AED</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0" style="width: 215px !important;">Absent from Work</td>
                <td class=" d-flex align-center">{{ item.leave_encashment.amount ? item.leave_encashment.amount : '-' }}
                  AED</td>
                <td class=""></td>
              </tr>
            </template>

          </v-data-table>
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
import PdfSvg from '@/assets/images/icons/pdf.svg'
import CashSvg from '@/assets/images/icons/cash-icon.svg'
import FlagSVG from '@/assets/images/FlagUae.svg'
import BinanceSVG from '@/assets/images/icons/binance-logo.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'


export default {
  props: { employeeDetails: Array },
  components: {
    InfoSVG,
    BinanceSVG,
    customerDefaultIcon,
    FlagSVG,
    EditSvg,
    phoneSVG,
    WalletSVG,
    PdfSvg,
    CashSvg,
  },
  data() {
    return {
      companyHeaders: [
        { text: 'EMPLOYEE DETAILS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      EOSBHeaders: [
        { text: 'Final Settlement / EOSB Details', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      companyDetails: [
        {
          title: 'Full Name',
          description: 'Sam Albert',

        },
        {
          title: 'Employer',
          description: 'Globex Corp',
        },
        {
          title: 'Last Working Day',
          description: '25-03-2023',
        },
        {
          title: 'Exit Reason',
          description: 'Resignation',
        },
        {
          title: 'Joining Date',
          description: '14-04-2021',
        },
        {
          title: 'Contract Type',
          description: 'Unlimited',
        },
        {
          title: 'Support Letter',
          description: 'Resignation_Sam.pdf',
        },

      ],

      EmployeeDetail: [

        {
          title: 'Leave Balance',
          description: '-11 Days',

        },
        {
          title: 'Amount',
          description: '-8,286.67 AED',
        },
      ],
      payrollHeaders: [
        { text: 'GRATUITY', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      payrollDetails: [

        {
          title: 'GRATUITY ',
          description: '0.00 AED',

        },



      ],
      contact_headers: [
        { text: 'SALARY PAYABLE', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'start', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      leave_encash_headers: [
        { text: 'Leave Encashment', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'start', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      contact_details: [
        {
          title: 'Salary Unpaid',
          description: '31 Days',


        },
        {
          title: 'Basic Salary',
          description: '10,000.00 AED',
        },
        {
          title: 'Housing Allowance',
          description: '8,000.00 AED',
        },
        {
          title: 'Other Allowance',
          description: '4,000.00 AED',
        },
        {
          title: 'Car Allowance',
          description: '2,000.00 AED',
        },
        {
          title: 'Total Fixed',
          description: '22,000.00 AED',
        },
        {
          title: 'Petrol Allowance',
          description: '10,000.00 AED',
        },
        {
          title: 'Total Salary Payable',
          description: '22,000.00 AED',
        },

      ],

    }
  },
  // @click="handleNewLead()"
  methods: {
    handleEditLead() {
      this.$router.push('/Leads/new-lead')
    },
  },
}
</script>