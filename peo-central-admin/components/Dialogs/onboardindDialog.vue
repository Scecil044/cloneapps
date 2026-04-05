<template>
  <!-- Create EOSB  Dialog -->
  <v-dialog id="custom_dialog" v-model="dialogData" width="45vw" height="100vh" content-class="proposal_dialog">
    <div class="dialog_proposal">
      <v-card id="card" style="padding: 20px 30px !important; height: 100vh !important">
        <v-card-title id="card-title">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <h4 class="text--text">
                  {{ activeStage == 'Create Emp Contract' ? 'Create Employment Contract' : '' }}
                  {{ activeStage == 'Create Work Order' ? 'Create Work Order' : '' }}
                  {{ activeStage == 'Record Payment' ? 'Record Payment' : '' }}
                </h4>
                <div class="d-flex align-center justify-end">
                  <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined @click="proposalDialog = false; close()"><span class="">Cancel</span></v-btn>
                  <v-btn v-if="activeStage == 'Create Emp Contract'" class="tall__btn mr-4 pl-6 pr-6" color="primary" outlined @click="proposalDialog = false"><span class="">Save as draft</span></v-btn>
                  <v-btn class="tall__btn pl-6 pr-6" color="primary" @click="createRequest()">
                    {{ activeStage == 'Create Emp Contract' ? 'Create' : '' }}
                    {{ activeStage == 'Create Work Order' ? 'Create' : '' }}
                    {{ activeStage == 'Record Payment' ? 'Record' : '' }}
                  </v-btn>
                </div>
              </div>

            </v-col>
          </v-row>
        </v-card-title>
        <v-container class="ma-0 pa-0">

          <!-- Create Employment Contract -->
          <div v-if="activeStage == 'Create Emp Contract'">
            <v-row class=" pt-0">
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">PERSONAL DETAILS</span>
                </div>
              </v-col>
              <v-col cols="4" class="pl-0 pt-0 pb-0">
                <CustomInputContainer label="Agreement Date">
                  <div slot="input">
                    <v-menu v-model="selected_agreement_day" :close-on-content-click="false" :nudge-right="40"
                      transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="employment_contract.agreement_date" placeholder="Enter Date" solo
                          class="proposalDialog_date_field2" dense hide-detail v-bind="attrs" v-on="on"
                          :rules="main_rule">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="employment_contract.agreement_date" @input="selected_agreement_day = false" />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4" class=" pl-0 pt-0 pb-0">
                <CustomInputContainer label="Agreement No.">
                  <div slot="input">
                    <v-text-field v-model="employment_contract.agreement_no" hide-details placeholder="Enter Number" solo dense class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">AGREEMENT WITH</span>
                </div>
              </v-col>
              <v-col cols="4" class=" pl-0 pt-0 pb-0">
                <CustomInputContainer label="Company Name">
                  <div slot="input">
                    <v-text-field v-model="employment_contract.company_name" hide-details placeholder="company name" solo dense
                      class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4" class=" pl-0 pt-0 pb-0">
                <CustomInputContainer label="Phone Number">
                  <div slot="input">
                    <v-text-field v-model="employment_contract.phone_number" hide-details placeholder="company name" solo dense class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
                <CustomInputContainer label="Place of Registration:">
                  <div slot="input">
                    <v-text-field v-model="employment_contract.place_of_regestration" placeholder="Marina, Dubai" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
                <CustomInputContainer label="Company Office Address:">
                  <div slot="input">
                    <v-text-field v-model="employment_contract.company_office_address" placeholder="Office 1006 Marina, Dubai" class="proposalDialog_date_field2" hide-details solo dense readonly :rules="main_rule">
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">AND</span>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Self Company">
                  <div slot="input">
                    <v-text-field v-model="employment_contract.self_company" placeholder="Dynamic Employment Services .LLC" class="proposalDialog_date_field2" solo readonly hide-details dense :rules="main_rule">
                    </v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </div>

          <!-- Create work order  -->
          <div v-if="activeStage == 'Create Work Order'">
            <v-row class=" pt-0">
              <v-col cols="12" class="pl-0 pr-12">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">MONTHLY COSTS</span>
                </div>
              </v-col>
              <v-col cols="12" class="pl-0 pr-12">
                <div style="width: 48% !important;">
                  <CustomInputContainer label="Company Name">
                    <div slot="input">
                      <v-text-field v-model="create_work_order.company_name" placeholder="" solo dense class="proposalDialog_date_field2">
                        <template #prepend-inner>
                          <div style="width: 50px" class="d-flex align-center">
                            <v-avatar size="30">
                              <v-img style="margin: auto 0" max-height="25" max-width="25" src="/1.jpg" />
                            </v-avatar>
                          </div>
                        </template>
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </div>
              </v-col>
              <v-col cols="6" class=" pl-0 pr-12">
                <CustomInputContainer label="Order Date">
                  <div slot="input">
                    <v-menu v-model="order_date" :close-on-content-click="false" :nudge-right="40"
                      transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="create_work_order.order_date" placeholder="Enter Date" solo
                          class="proposalDialog_date_field2" dense hide-detail v-bind="attrs" v-on="on"
                          :rules="main_rule">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="create_work_order.order_date" @input="order_date = false" />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" class=" pl-0 pr-12">
                <CustomInputContainer label="Ref to Agreement No.">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.ref_to_agreement_no" hide-details placeholder="2022-10-31" solo dense
                      class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" class=" pl-0 pr-12">
                <CustomInputContainer label="Work Order No.">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.work_order_no" hide-details placeholder="Enter Number" solo dense
                      class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pr-12">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">CONTACT PERSON</span>
                </div>
              </v-col>
              <v-col cols="6" class=" pl-0 pr-12">
                <CustomInputContainer label="Contact Name">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.contact_name" placeholder="2022-10-31" solo dense
                      class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" class=" pl-0 pr-12">
                <CustomInputContainer label="Phone No.">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.contact_phone_number" placeholder="2022-10-31" solo dense
                      class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" class=" pl-0 pr-12">
                <CustomInputContainer label="Designation">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.contact_designation" placeholder="Enter Designation" solo dense
                      class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" class=" pl-0  pr-12">
                <CustomInputContainer label="Email">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.email" placeholder="Enter Email" solo dense :rules="email_rule"
                      class="proposalDialog_date_field2" />
                  </div>
                </CustomInputContainer>
              </v-col>


              <v-col cols="12" class="pl-0 pr-12">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">EMPLOYEE DETAILS</span>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Employee Name">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.employee_name" placeholder="name " class="proposalDialog_date_field2" solo
                      dense :rules="main_rule">
                    </v-text-field>
                  </div>
                </CustomInputContainer>

              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Duration of service">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.employee_duration_of_service" placeholder="Services " class="proposalDialog_date_field2"
                      solo dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Internal Offer letter Designation">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.internal_offer_letter_designation" placeholder="offer letter " class="proposalDialog_date_field2"
                      solo dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Visa Designation">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.visa_designation" placeholder="visa des " class="proposalDialog_date_field2"
                      solo dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" class=" pl-0 pl-0 pr-12">
                <CustomInputContainer label="Start date">
                  <div slot="input">
                    <v-menu v-model="contract_start_date" :close-on-content-click="false" :nudge-right="40"
                      transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="create_work_order.start_date" placeholder="Enter Date" solo
                          class="proposalDialog_date_field2" dense hide-detail v-bind="attrs" v-on="on"
                          :rules="main_rule">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="create_work_order.start_date" @input="contract_start_date = false" />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" class=" pl-0 pl-0 pr-12">
                <CustomInputContainer label="Contract End (if applicable)">
                  <div slot="input">
                    <v-menu v-model="contract_end_date" :close-on-content-click="false" :nudge-right="40"
                      transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="create_work_order.contract_end_date" placeholder="Enter Date" solo
                          class="proposalDialog_date_field2" dense hide-detail v-bind="attrs" v-on="on"
                          :rules="main_rule">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="create_work_order.contract_end_date" @input="contract_end_date = false" />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pl-0 pr-12">
                <CustomInputContainer label="Working days">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.working_days" placeholder="Sun - Thu / Mon - Fri / 5 Days per week"
                      class="proposalDialog_date_field2" solo dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col cols="12" class="pl-0  pl-0 pr-12">
                <CustomInputContainer label="Working Hours">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.working_hours" placeholder="9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Probation Period">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.probation_period" placeholder="pro/..... " class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Notice Period">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.notice_period" placeholder="visa des " class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">UPFRONT MOBILIZATION FEES</span>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Employment Visa">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.employee_visa" placeholder="enter amount" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Emiratization Cost">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.emiratization_cost" placeholder="enter cost " class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Medical Insurance">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.medical_insurance" placeholder="enter amount" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Security Deposit">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.security_deposit" placeholder="enter amount" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Total Mobilization Fee">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.total_mobilization_fee" placeholder="enter cost" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">MONTHLY COMPENSATION AND EXPENSES</span>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Allowances">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.allowances" placeholder="Allowances" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Basic Salary">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.basic_salary" placeholder="enter amount" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">TOTAL SALARY</span>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Emiratization fee">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.total_emiratization_fee" placeholder="enter amount" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Dynamic Empl. Administration Fee">
                  <div slot="input">
                    <v-text-field v-model="create_work_order.dynamic_employment_administration_fee" placeholder="enter amount" class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </div>

          <!--Record Payment Dialog  -->
          <div v-if="activeStage == 'Record Payment'">
            <v-row class=" pt-0">
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Invoice Number " :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="record_payments.invoice_number" placeholder="MN-98VB-MUTYUJ-BNY" class="proposalDialog_date_field3" hide-details solo dense :rules="main_rule"></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Ref No. " :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="record_payments.ref_no" placeholder="Enter Reference Number" class="proposalDialog_date_field2" solo hide-details dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Payment Date" :mandatory="true">
                  <div slot="input">
                    <v-menu v-model="recordedPayment_date" :close-on-content-click="false" :nudge-right="40"
                      transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="record_payments.payment_date" placeholder="mm/dd/yy" class="proposalDialog_date_field2"
                          solo dense readonly hide-details v-bind="attrs" v-on="on" :rules="main_rule">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="record_payments.payment_date" @input="recordedPayment_date = false" />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Payment Method" :mandatory="true">
                  <div slot="input">
                    <v-select :items="paymentMethods" v-model="record_payments.payment_method" placeholder="End of Contract" solo dense hide-details class="proposalDialog_date_field2" v-if="paymentMethods.length >= 1" append-icon="fa-chevron-down">
                    </v-select>
                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Company
                    </p>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Amount Received">
                  <div slot="input">
                    <v-text-field v-model="record_payments.amount_received" placeholder="Enter Amount" class="proposalDialog_date_field2" solo hide-details dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">Upload Transfer Script</span>
                </div>
              </v-col>
              <v-col cols="12" class="py-0 px-0">
                <FileDropzone @fileHandler="clickedDocument($event)" />
              </v-col>
            </v-row>
          </div>
        </v-container>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'




export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    FileDropzone,
  },
  props: {
    dialogData: Boolean,
    activeStage: String,
    currentObj: Object
  },
  data() {
    return {
      paymentMethods: ['Bank', 'Cash', 'Other'],
      agreement_number: '',
      company_id: '',
      company_number: '',
      company_location: '',
      company_address: '',
      self_company: '',
      customer_email: '',
      agreement_num: '',
      workOrder_num: '',
      contact_name: '',
      contact_phone_num: '',
      security_cost: '',
      contact_designation: '',
      contact_email: '',
      employee_name: '',
      service_duration: '',
      offer_letter: '',
      visa_designation: '',
      working_days: '',
      working_hours: '',
      probation: '',
      notice_period: '',
      employment_visa: '',
      emirati_cost: '',
      insurance_amount: '',
      moblize_amount: '',
      Allowances_basic: '',
      basic_salary: '',
      emirati_fee: '',
      amins_fee: '',
      amount_received: '',
      ref_num: '',
      Invoice_number: '',
      // date
      contract_end_date: false,
      selected_ended_contract_date: new Date().toISOString().substr(0, 10),
      contract_start_date: false,
      selected_contract_date: new Date().toISOString().substr(0, 10),
      order_date: false,
      selected_order_date: new Date().toISOString().substr(0, 10),
      selected_agreement_day: false,
      selected_agreement_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),
      recordedPayment_date: false,
      recorded_date: new Date().toISOString().substr(0, 10),

      //exit reason list
      exitReason: ['Termination', 'Resignation', 'End Of Contract'],
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
        
      ],
      phone_rule: [],
      employment_contract: {
        agreement_date: new Date().toISOString().substr(0, 10),
        agreement_no: "",
        company_name: "",
        phone_number: "",
        place_of_regestration: "",
        company_office_address: "",
        self_company: ""
      },
      create_work_order: {
        company_name: "",
        company_logo: "",
        order_date: "",
        ref_to_agreement_no: "",
        work_order_no: "",
        contact_name: "",
        contact_phone_number: "",
        contact_designation: "",
        email: "",
        employee_name: "",
        employee_duration_of_service: "",
        internal_offer_letter_designation: "",
        visa_designation: "",
        start_date: new Date().toISOString().substr(0, 10),
        end_date: new Date().toISOString().substr(0, 10),
        working_days: "",
        working_hours: "",
        probation_period: "",
        notice_period: "",
        employee_visa: "",
        emiratization_cost: "",
        medical_insurance: "",
        security_deposit: "",
        total_mobilization_fee: "",
        basic_salary: "",
        allowances: "",
        total_emiratization_fee: "",
        dynamic_employment_administration_fee: ""
      },
      currentOnboardingObj:{},
      currentObjIndex:[],
      record_payments: {
        invoice_number: "",
        ref_no: "",
        payment_date: new Date().toISOString().substr(0, 10),
        payment_method: "",
        amount_received: "",
        attachments: []
      }
    }
  },
  mounted() {
    console.log(this.dialogData, '--------dialogData')
    console.log(this.activeStage, '-------this.activeStage')
    console.log(this.currentObj, '-------props obj')
  },
  watch:{
    dialogData(val){
      // console.log(val, '----dal')
      if(val == 'false' || val == false){
        this.currentObj = {}
        this.currentObj = ''
        this.close()
      }
    }
  },
  created(){
    this.$nuxt.$on('retrieveOnboardData', ($event) => {
      this.currentOnboardingObj = $event.process
      this.currentObjIndex = $event.selectedIndex
    })
  },
  methods: {
    close() {
      this.$emit('close')
    },
    createRequest(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      console.log(this.currentObjIndex, '-------currentObjIndex')
      for(let i = 0; i < this.currentObjIndex.length; i++) {
        const element = this.currentObjIndex[i]

        if(this.activeStage == 'Create Emp Contract'){
          console.log('1')
          this.$axios.$post(`/onboardings/process/forward/${this.currentOnboardingObj._id}`, { button: element.button, employment_contract: this.employment_contract }, { headers: { Authorization: AuthStr } })
          .then((res) => {
            this.close()
            this.$nuxt.$emit('fetchUpdatedOnboardingProcess', this.currentOnboardingObj)
          })
        }else if(this.activeStage == 'Create Work Order'){
          console.log('2');
          this.$axios.$post(`/onboardings/process/forward/${this.currentOnboardingObj._id}`,{ button: element.button, create_work_order: this.create_work_order }, { headers: { Authorization: AuthStr } })
          .then((res) => {
            this.close()
            this.$nuxt.$emit('fetchUpdatedOnboardingProcess', this.currentOnboardingObj)
          })
        }else if(this.activeStage == 'Record Payment'){
          console.log(this.record_payments, '-03')
          this.$axios.$post(`/onboardings/process/forward/${this.currentOnboardingObj._id}`,{ button: element.button, record_payments: this.record_payments }, { headers: { Authorization: AuthStr } })
          .then((res) => {
            this.close()
            this.$nuxt.$emit('fetchUpdatedOnboardingProcess', this.currentOnboardingObj)
          })
        }
      }
    },
    async clickedDocument(event){
      if(event == undefined || !event.name) return
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      const fd = new FormData()
      fd.append('documents', event)

      await this.$axios.$post(`/documents/simpleupload`,fd, { headers: { Authorization: AuthStr } })
      .then((res)=> {
        this.record_payments.attachments = []
        this.record_payments.attachments.push(res[0])
      })
    }
  },
}
</script>
