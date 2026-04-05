<template>
  <div>
    <v-form ref="form" v-if="computedTotalSalary" class="pa-0 ma-0" style="display: contents !important;">
      <v-row class=" pt-0">
        <v-col cols="12" class="pl-0 pr-12">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">Contract Information</span>
          </div>
        </v-col>
        <v-col cols="6" class="pl-0 pr-12">
          <CustomInputContainer label="Company Name">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Company Name')].value"
                placeholder="" solo dense class="proposalDialog_date_field2">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pr-12">
          <CustomInputContainer label="Order Date" :mandatory="true">
            <div slot="input">
              <v-menu v-model="order_date" :close-on-content-click="false" :nudge-right="40"
                transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Order Date')].value"
                    placeholder="Enter Date" solo class="proposalDialog_date_field2" dense hide-detail v-bind="attrs"
                    v-on="on" :rules="main_rule">
                    <template v-slot:append>
                      <div class="">
                        <CalenderSvg />
                      </div>
                    </template>
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Order Date')].value"
                  @input="order_date = false" />
              </v-menu>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pr-12">
          <CustomInputContainer label="Ref to Agreement No.">
            <div slot="input">
              <v-text-field
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Reference to Agreement No.')].value"
                hide-details placeholder="" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pr-12">
          <CustomInputContainer label="Work Order No." :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Work Order No.')].value"
                hide-details placeholder="Enter Number" solo dense class="proposalDialog_date_field2"
                :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pr-12">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">CONTACT PERSON</span>
          </div>
        </v-col>
        <v-col cols="6" class=" pl-0 pr-12">
          <CustomInputContainer label="Contact Name" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Contact Person Name')].value"
                placeholder="" solo dense class="proposalDialog_date_field2" :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="3" class=" pl-0 pr-12" v-if="countryCode.length > 0">
          <CustomInputContainer label="Country Code" :mandatory="true">
            <div slot="input">
              <v-autocomplete 
                @change="updatePhone" 
                v-if="countryCode.length > 0" 
                color="black" auto-select-first
                class="autoCompleteCustomClass hide-select-input" 
                :items="countryCode" 
                :item-text="item => item.dialCode + item.country"
                return-object style="max-width:150px"
                dense
                solo
                outlined placeholder="Country Code"
                >
                <template v-slot:selection="slotProps">
                  {{ slotProps.item.dialCode }}
                </template>
                <template v-slot:item="slotProps">
                  <v-avatar left class="mr-3">
                    <svg v-html="slotProps.item.flag"></svg>
                  </v-avatar>
                  {{ slotProps.item.dialCode }}
                  {{ slotProps.item.country }}
                </template>
              </v-autocomplete>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="3" class=" pl-0 pr-12">
          <CustomInputContainer label="Phone" :mandatory="true">
            <div slot="input">
              <v-text-field @change="updatePhone"
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Contact Person Phone Number')].value"
                placeholder="" solo dense class="proposalDialog_date_field2" :rules="phoneNumberRule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pr-12">
          <CustomInputContainer label="Contact Person Designation">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Contact Person Designation')].value"
                placeholder="Enter Contact Person Designation" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0  pr-12">
          <CustomInputContainer label="Contact Person Email" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Contact Person Email')].value"
                placeholder="Enter Contact Person Email" solo dense :rules="email_rule"
                class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pr-12">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">EMPLOYEE DETAILS</span>
          </div>
        </v-col>
        <v-col cols="12" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="First Name" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'First Name')].value"
                placeholder="name " class="proposalDialog_date_field2" solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>

        </v-col>
        <v-col cols="12" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Middle Name">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Middle Name')].value"
                placeholder="name " class="proposalDialog_date_field2" solo dense>
              </v-text-field>
            </div>
          </CustomInputContainer>

        </v-col>
        <v-col cols="12" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Last Name" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Last Name')].value"
                placeholder="name " class="proposalDialog_date_field2" solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>

        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Internal Designation" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Internal Designation')].value"
                placeholder="Designation" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Visa Designation" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Visa Designation')].value"
                placeholder="Visa Designation" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Type of Visa" :mandatory="true">
            <div slot="input">
              <v-autocomplete :items="['Unskilled Visa', 'Skilled Visa']"
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Type of Visa')].value"
                placeholder="Type of Visa" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pl-0 pr-12">
          <CustomInputContainer label="Start date" :mandatory="true">
            <div slot="input">
              <v-menu v-model="contract_start_date" :close-on-content-click="false" :nudge-right="40"
                transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Start Date')].value"
                    placeholder="Enter Date" solo class="proposalDialog_date_field2" dense hide-detail v-bind="attrs"
                    v-on="on" :rules="main_rule">
                    <template v-slot:append>
                      <div class="">
                        <CalenderSvg />
                      </div>
                    </template>
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Start Date')].value"
                  @input="contract_start_date = false" />
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
                  <v-text-field
                    v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'End of Contract')].value"
                    placeholder="Enter Date" solo class="proposalDialog_date_field2" dense hide-detail v-bind="attrs"
                    v-on="on">
                    <template v-slot:append>
                      <div class="">
                        <CalenderSvg />
                      </div>
                    </template>
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'End of Contract')].value"
                  @input="contract_end_date = false" />
              </v-menu>
            </div>
          </CustomInputContainer>
        </v-col>
        <!--<v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
         <CustomInputContainer label="Duration of Service" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Duration of Service')].value"
                placeholder="visa des " class="proposalDialog_date_field2" solo dense hide-details :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col> -->
        <v-col cols="6" class="pl-0 pl-0 pr-12">
          <CustomInputContainer label="Working days" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Working Days')].value"
                placeholder="Sun - Thu / Mon - Fri / 5 Days per week" class="proposalDialog_date_field2" solo dense
                :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>

        <v-col cols="6" class="pl-0  pl-0 pr-12">
          <CustomInputContainer label="Working Hours" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Working Hours')].value"
                placeholder="9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)"
                class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Probation Date" :mandatory="true">
            <div slot="input">
              <v-autocomplete
                :items="['0 Months', '1 Month', '2 Months', '3 Months', '4 Months', '5 Months', '6 Months']"
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Probation Date')].value"
                placeholder="Probation Date" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Notice Period" :mandatory="true">
            <div slot="input">
              <v-autocomplete :items="['1 Month', '2 Months', '3 Months']"
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Notice Period')].value"
                placeholder="visa des " class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">UPFRONT MOBILIZATION FEES</span>
          </div>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Employment Visa Fee" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Employment Visa Fee')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Emiratization Fee" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Emiratization Fee')].value"
                placeholder="enter cost" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Medical Insurance Fee" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Medical Insurance Fee')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Security Deposit" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Security Deposit')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Total Mobilization Fee" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Total Mobilization Fee')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">MONTHLY COMPENSATION AND EXPENSES</span>
          </div>
        </v-col>

        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Basic Salary" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Basic Salary')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12" :mandatory="true">
          <CustomInputContainer label="Allowances">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Allowances')].value"
                placeholder="Allowances" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12" :mandatory="true">
          <CustomInputContainer label="Total Salary">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Total Salary')].value"
                placeholder="Total Salary" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Emiratization Fee Monthly" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Emiratization Fee Monthly')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Dynamic Employment Fee" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.auto_replace_keys[findIndex(workOrder.auto_replace_keys, 'Dynamic Employment Fee')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Total Monthly Fee" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Total Monthly Fee')].value"
                placeholder="enter amount" class="proposalDialog_date_field2" solo dense :rules="number_rule" />
            </div>
          </CustomInputContainer>
        </v-col>

        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">Others</span>
          </div>
        </v-col>
        <v-col cols="6" class="pl-0 pl-0 pr-12">
          <CustomInputContainer label="Payment Due Date" :mandatory="true">
            <div slot="input">
              <v-autocomplete
                :items="['Seven (7) calendar days', 'Five (5) calendar days', 'Fifteen (15) calendar days', 'Thirty (30) calendar days']"
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Payment Due Date')].value"
                placeholder="" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pl-0 pl-0 pr-12">
          <CustomInputContainer label="Security Deposit" :mandatory="true">
            <div slot="input">
              <v-autocomplete :items="['Zero (0) month', 'One (1) month', 'Two (2) months', 'Three (3) months']"
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Security Deposit')].value"
                placeholder="" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <!-- <v-col cols="6" class="pl-0 pl-0 pr-12">
          <CustomInputContainer label="Purchase / Work Order" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Purchase / Work Order')].value"
                placeholder="" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col> -->
        <v-col cols="6" class="pl-0 pl-0 pr-12">
          <CustomInputContainer label="Minimum Duration of Deployment" :mandatory="true">
            <div slot="input">
              <v-autocomplete
                :items="['Zero (0) month', 'One (1) month', 'Two (2) months', 'Three (3) months', 'Four (4) months', 'Five (5) months', 'Six (6) months', 'Seven (7) months', 'Eight (8) months', 'Nine (9) months', 'Ten (10) months', 'Eleven (11) months', 'Twelve (12) months']"
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Minimum Duration of Deployment')].value"
                placeholder="" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pl-0 pl-0 pr-12">
          <CustomInputContainer label="Termination Period" :mandatory="true">
            <div slot="input">
              <v-autocomplete :items="['1 Month', '2 Months', '3 Months']"
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Termination Period')].value"
                placeholder="" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <!-- <v-col cols="6" class="pl-0 pl-0 pr-12">
          <CustomInputContainer label="Termination Fee" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="workOrder.user_input_keys[findIndex(workOrder.user_input_keys, 'Termination fee')].value"
                placeholder="" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col> -->
      </v-row>
    </v-form>
  </div>
</div></template>
<script>
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import countryFlagsDialCode from "country-flags-dial-code";
export default {
  components: {
    CustomInputContainer, FileDropzone, CalenderSvg
  },
  props: {
    workOrder: Object,
  },
  data() {
    return {
      countryCode: [],
      countryList: countryFlagsDialCode.getCountryListMap(),
      phoneNumberRule: [
        (value) => {
          return !isNaN(value) || "Invalid phone number."
        },
      ],
      phoneNumberText: '',
      main_rule: [(v) => !!v || 'This filed is required'],
      number_rule: [
        (value) => {
          return !isNaN(value) || "Only numeric values"
        },
      ],
      order_date: false,
      contract_start_date: false,
      contract_end_date: false,
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
    }
  },
  async mounted() {

    this.AutomateWorkOrder()
    this.changeDetection()
    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }

  },
  methods: {
    async AutomateWorkOrder() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(`/documenttemplateclone/workOrderCount/${this.workOrder.condition.type}`, this.workOrder, { headers: { Authorization: AuthStr } })
        .then(response => {
          this.workOrder.user_input_keys[this.findIndex(this.workOrder.user_input_keys, 'Work Order No.')].value = response.Total
        })
        .catch(e => console.log(e))
    },
    updatePhone() {
      if (this.workOrder.auto_replace_keys && this.findIndex(this.workOrder.auto_replace_keys, 'Contact Person Phone Number')) {
        // this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Phone')].value = this.phoneNumberText.dialCode + this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Phone')].value
      }
    },
    changeDetection() {
      this.$emit('changeDetection', this.workOrder, this.$refs.form)
    },
    findIndex(array, value) {
      var index = array.findIndex(function (element) {
        return element.label == value
      });
      return index
    }
  },
  computed: {
    computedTotalSalary() {
      if (this.workOrder && this.workOrder.auto_replace_keys) {
        if (this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Start Date')] && this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'End of Contract')]) {
          this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Duration of Service')].value = this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Start Date')].value + " to " + this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'End of Contract')].value
        }
        else {
          this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Duration of Service')].value = "N/A"
        }
      }
      if (this.workOrder && this.workOrder.auto_replace_keys) {
        let total = 0
        this.workOrder.auto_replace_keys.forEach((element) => {
          if (element.label === 'Employment Visa' || element.label === 'Employment Visa Fee' || element.label === 'Emiratization Fee' || element.label === 'Medical Insurance Fee' || element.label === 'Security Deposit') {
            total += parseFloat(element.value)
          }
        })
        if (total > 0) {
          this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Total Mobilization Fee')].value = total
        }
      }
      if (this.workOrder && this.workOrder.auto_replace_keys) {
        let total = 0
        this.workOrder.auto_replace_keys.forEach((element) => {
          if (element.label === 'Basic Salary' || element.label === 'Allowances') {
            total += parseFloat(element.value)
          }
        })
        if (total > 0) {
          this.workOrder.auto_replace_keys[this.findIndex(this.workOrder.auto_replace_keys, 'Total Salary')].value = total
        }
      }
      if (this.workOrder && this.workOrder.auto_replace_keys) {
        let total = 0
        this.workOrder.auto_replace_keys.forEach((element) => {
          if (element.label === 'Total Salary' || element.label === 'Dynamic Employment Fee' || element.label === 'Emiratization Fee Monthly') {
            total += parseFloat(element.value)
          }
        })
        if (total > 0) {
          this.workOrder.user_input_keys[this.findIndex(this.workOrder.user_input_keys, 'Total Monthly Fee')].value = total
        }
      }
      if (this.workOrder && this.workOrder.auto_replace_keys) {
        let full_name = ""
        this.workOrder.auto_replace_keys.forEach((element) => {
          if (element.label === 'First Name' && element.value !== null && element.value !== "") {
            full_name += element.value
          }
          if (element.label === 'Middle Name' && element.value !== null && element.value !== "") {
            full_name += (" " + element.value)
          }
          if (element.label === 'Last Name' && element.value !== null && element.value !== "") {
            full_name += (" " + element.value)
          }
        })
        this.workOrder.user_input_keys[this.findIndex(this.workOrder.user_input_keys, 'Full Name')].value = full_name
      }
      return true
    }


  }
}
</script>