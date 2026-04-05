<template>
  <div>
    <v-form ref="form" v-if="computedAll" class="pa-0 ma-0" style="display: contents !important;">
      <v-row class=" pt-0">

        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">EMPLOYEE INFORMATION</span>
          </div>
        </v-col>
        <v-col cols="6" class="pl-0 pt-0 pb-0">
          <CustomInputContainer label="First Name">
            <div slot="input">
              <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'First Name')].value"
                placeholder="First Name" solo dense class="proposalDialog_date_field2" hide-details
                @keyup="computedAll()" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pl-0 pt-0 pb-0">
          <CustomInputContainer label="Middle Name">
            <div slot="input">
              <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Middle Name')].value"
                @keyup="computedAll()" placeholder="Middle Name" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pl-0 pt-0 pb-0">
          <CustomInputContainer label="Last Name">
            <div slot="input">
              <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Last Name')].value"
                @keyup="computedAll()" placeholder="Last Name" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Contract Type">
            <div slot="input">
              <v-select v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Contract Type')].value"
                :items="['Limited', 'Unlimited']" placeholder="Contract Type" solo dense
                class="proposalDialog_date_field2" append-icon="fa-chevron-down" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Last Working Day">
            <div slot="input">
              <v-menu v-model="last_working_day" :close-on-content-click="false" :nudge-right="40"
                transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Last Working Day')].value"
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
                  v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Last Working Day')].value"
                  @input="last_working_day = false" />
              </v-menu>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Date of Joining">
            <div slot="input">
              <v-menu v-model="doj" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Date of Joining')].value"
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
                  v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Date of Joining')].value"
                  @input="doj = false" />
              </v-menu>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Exit Reason">
            <div slot="input">
              <v-select v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Exit Reason')].value"
                :items="['Termination', 'Resignation', 'End of Contract']" placeholder="Exit Reason" solo dense
                class="proposalDialog_date_field2" append-icon="fa-chevron-down">
              </v-select>
            </div>
          </CustomInputContainer>
        </v-col>

        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">SALARY PAYABLE</span>
          </div>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <div style="width:55%">
            <CustomInputContainer label="Number of Unpaid Days">
              <div slot="input">
                <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Salary Unpaid')].value"
                  @keyup="computedAll()" placeholder="Salary Unpaid" class="proposalDialog_date_field2" hide-details
                  solo dense :rules="main_rule">
                </v-text-field>
              </div>
            </CustomInputContainer>

          </div>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">

          <CustomInputContainer
            :label="`Basic Salary (${eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Old Basic')].value}) Monthly`">
            <div slot="input">
              <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Basic Salary')].value"
                @keyup="computedAll()" placeholder="Basic Salary" class="proposalDialog_date_field2" solo hide-details
                dense :rules="main_rule" />
            </div>
          </CustomInputContainer>




        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer
            :label="`Housing Allowance (${eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Old House')].value}) Monthly`">
            <div slot="input">
              <v-text-field
                v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Housing Allowance')].value"
                @keyup="computedAll()" placeholder="Housing Allowance" class="proposalDialog_date_field2" hide-details
                solo dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer
            :label="`Other Allowance (${eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Old Other')].value}) Monthly`">
            <div slot="input">
              <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Other Allowance')].value"
                @keyup="computedAll()" placeholder="Other Allowance" class="proposalDialog_date_field2" solo
                hide-details dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer
            :label="`Car Allowance (${eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Old Car')].value}) Monthly`">
            <div slot="input">
              <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Car Allowance')].value"
                @keyup="computedAll()" placeholder="Car Allowance" class="proposalDialog_date_field2" solo hide-details
                dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer
            :label="`Petrol Allowance (${eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Old Petrol')].value} )Monthly`">
            <div slot="input">
              <v-text-field
                v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Petrol Allowance')].value"
                @keyup="computedAll()" placeholder="Petrol Allowance" class="proposalDialog_date_field2" solo
                hide-details dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer
            :label="`Total Salary Payable (${eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Total Fixed')].value}) Monthly`">
            <div slot="input">
              <v-text-field
                v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Total Salary Payable')].value"
                disabled placeholder="Total Salary Payable" class="proposalDialog_date_field2" solo hide-details dense
                :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>

        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">LEAVE ENCASHMENT</span>
          </div>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <div style="width:55%">
            <CustomInputContainer label="Leave Balance">
              <div slot="input">
                <v-text-field
                  v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Leave Balances')].value"
                  placeholder="Enter Days " class="proposalDialog_date_field2" solo dense>
                  <template v-slot:append>
                    <div class="">
                      <span>Days</span>
                    </div>
                  </template>

                </v-text-field>
              </div>
            </CustomInputContainer>

          </div>
        </v-col>

        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Amount">
            <div slot="input">
              <v-text-field
                v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Leave Encashments')].value"
                @keyup="computedAll()" placeholder="Enter  Amount " class="proposalDialog_date_field2" solo hideDetails
                dense>
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>

        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">GRATUITY</span>
          </div>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <div style="width:55%">
            <CustomInputContainer label="Gratuity Period">
              <div slot="input">
                <v-text-field
                  v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Gratuity Period')].value"
                  @keyup="computedAll()" placeholder="Enter Days " class="proposalDialog_date_field2" solo dense>
                  <template v-slot:append>
                    <div class="">
                      <span>Days</span>
                    </div>
                  </template>

                </v-text-field>
              </div>
            </CustomInputContainer>

          </div>
        </v-col>

        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Gratuity Amount">
            <div slot="input">
              <v-text-field v-model="eosb.auto_replace_keys[findIndex(eosb.auto_replace_keys, 'Gratuity Amount')].value"
                placeholder="Enter  Amount " class="proposalDialog_date_field2" solo hideDetails dense>
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">Additions / Deductions</span>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" color="primary" @click="addItem = true">mdi-plus</v-icon>
              </template>
              <span>Add Item</span><br>
            </v-tooltip>
          </div>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12" v-for="(item, index ) in additionalItems" :key="index">
          <CustomInputContainer :label="item.type + ' : ' + item.name">
            <div slot="input">
              <v-text-field placeholder="Enter Amount "
                v-model="eosb.additional_input_keys[findIndex(eosb.additional_input_keys, item.name)].value"
                @keyup="keyTrigger(eosb.additional_input_keys[findIndex(eosb.additional_input_keys, item.name)].value, item.name, item.type)"
                class="proposalDialog_date_field2" solo hideDetails dense>
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>

        <!--<v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">LEAVE ENCASEMENT</span>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <div style="width:55%">
                  <CustomInputContainer label="Leave Balance">
                    <div slot="input">
                      <v-text-field v-model="leave_balance" placeholder="Enter Days " class="proposalDialog_date_field3"
                        solo readonly hide-details dense :rules="main_rule">
                        <template v-slot:append>
                          <div class="">
                            <span>Days</span>
                          </div>

                        </template>

                      </v-text-field>
                    </div>
                  </CustomInputContainer>

                </div>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">

                <CustomInputContainer label="Leave Encasement">
                  <div slot="input">
                    <v-text-field v-model="leave_Encasement" placeholder="-5465465656 " class="proposalDialog_date_field3"
                      solo readonly hide-details dense :rules="main_rule">
                    </v-text-field>
                  </div>
                </CustomInputContainer>


              </v-col>-->

        <!-- <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                <CustomInputContainer label="Gratuity Amount">
                  <div slot="input">
                    <v-text-field v-model="gratuity_amount" placeholder="00.00 " class="proposalDialog_date_field3" solo
                      readonly hide-details dense :rules="main_rule"> </v-text-field>
                  </div>
                </CustomInputContainer>

              </v-col>
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">VARIABLE ELEMENTS</span>
                </div>
                <v-btn class="short__btn pl-5 pr-5" color="primary">Add elements</v-btn>
              </v-col> -->


      </v-row>
    </v-form>
    <v-dialog id="custom_dialog" v-model="addItem" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Add Item</h4>
          <v-icon small color="subtext" class="ml-5" @click="addItem = false">fa-close</v-icon>
        </v-card-title>
        <v-card-text>
          <v-row class=" d-flex justify-end">
            <v-col cols="12">
              <div slot="input">
                Add Item Name
              </div>
            </v-col>
            <v-col cols="6">
              <v-form ref="AddItemForm">
                <v-text-field v-model="extraItem" hide-details placeholder="Enter Item Name" solo dense
                  class="proposalDialog_date_field2" :rules="main_rule" />
              </v-form>
            </v-col>
            <v-col cols="6">
              <v-select v-model="extraItemType" :items="['Addition', 'Deduction']" placeholder="Type" solo dense
                class="proposalDialog_date_field2" append-icon="fa-chevron-down" />
            </v-col>
            <v-col cols="12" class=" d-flex justify-end">
              <v-btn @click="addItemFunc()" class="unsuccessful_btn_dialog" color="primary">Confirm</v-btn>
            </v-col>
          </v-row>
        </v-card-text>

      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import converter from 'number-to-words'

export default {
  components: {
    CustomInputContainer, FileDropzone, CalenderSvg
  },
  props: {
    eosb: Object,
  },
  data() {
    return {
      addItem: false,
      extraItem: "",
      extraItemType: "Addition",
      additionalItems: [],
      last_working_day: false,
      doj: false,
      main_rule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      main_rule: [(v) => !!v || 'This filed is required'],
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
    this.eosb['additional_input_keys'] = []
    this.changeDetection()
  },
  methods: {
    keyTrigger(val, name, type) {
      this.eosb.additional_input_keys[this.findIndex(this.eosb.additional_input_keys, name)].value = type == 'Deduction' ? -this.eosb.additional_input_keys[this.findIndex(this.eosb.additional_input_keys, name)].value : this.eosb.additional_input_keys[this.findIndex(this.eosb.additional_input_keys, name)].value
      this.computedAll()
    },
    addItemFunc() {
      if (this.$refs.AddItemForm.validate()) {
        this.additionalItems.push({
          name: this.extraItem,
          type: this.extraItemType
        })
        this.eosb.additional_input_keys.push({
          key: this.extraItem.replace(/ /g, '_').toLowerCase(),
          label: this.extraItem,
          type: this.extraItemType,
          value: 0
        })
        this.addItem = false
        this.extraItem = ''
        this.extraItemType = 'Addition'
      }
    },

    changeDetection() {
      this.computedAll()
      this.$emit('changeDetection', this.eosb, this.$refs.form)
    },
    findIndex(array, value) {
      var index = array.findIndex(function (element) {
        return element.label.toString().trim().toLowerCase() == value.toString().trim().toLowerCase()
      });
      return index
    },
    // computedAll() {
    //   let full_name = ""
    //   if (this.eosb && this.eosb.auto_replace_keys) {
    //     this.eosb.auto_replace_keys.forEach((element) => {
    //       if (element.label === 'First Name' && element.value !== null && element.value !== "") {
    //         full_name += element.value
    //       }
    //       if (element.label === 'Middle Name' && element.value !== null && element.value !== "") {
    //         full_name += (" " + element.value)
    //       }
    //       if (element.label === 'Last Name' && element.value !== null && element.value !== "") {
    //         full_name += (" " + element.value)
    //       }
    //     })
    //     this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Full Name')].value = full_name
    //   }
    //   let totalAmount = 0
    //   let totalSalary = 0
    //   if (this.eosb && this.eosb.additional_input_keys) {
    //     this.eosb.additional_input_keys.forEach((element) => {
    //       totalAmount += parseFloat(element.value)
    //     })
    //   }
    //   if (this.eosb && this.eosb.auto_replace_keys) {
    //     this.eosb.auto_replace_keys.forEach((element) => {
    //       if (element.label === 'Basic Salary') {
    //         totalSalary += parseFloat(element.value)
    //       }
    //       if (element.label === 'Housing Allowance') {
    //         totalSalary += parseFloat(element.value)
    //       }
    //       if (element.label === 'Other Allowance') {
    //         totalSalary += parseFloat(element.value)
    //       }
    //       if (element.label === 'Other Allowance') {
    //         totalSalary += parseFloat(element.value)
    //       }
    //       if (element.label === 'Other Allowance') {
    //         totalSalary += parseFloat(element.value)
    //       }
    //     })
    //     this.eosb.auto_replace_keys[this.findIndex(this.eosb.auto_replace_keys, 'Total Salary Payable')].value = totalSalary.toFixed(2)
    //     this.eosb.auto_replace_keys.forEach((element) => {
    //       if (element.label === 'Total Salary Payable') {
    //         totalAmount += parseFloat(element.value)
    //       }
    //       if (element.label === 'Leave Encashments') {
    //         totalAmount += parseFloat(element.value)
    //       }
    //       if (element.label === 'Gratuity Amount') {
    //         totalAmount += parseFloat(element.value)
    //       }
    //     })

    //   }
    //   this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Total Amount')].value = totalAmount.toFixed(2)
    //   let toWords = converter.toWords(totalAmount)
    //   this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Total Word')].value = toWords + ' dirhams only'
    //   return true
    // },
    computedAll() {
      try {
        let full_name = ''
        if (this.eosb && this.eosb.auto_replace_keys) {
          // Name handling code remains the same
          this.eosb.auto_replace_keys.forEach(element => {
            if (element.label === 'First Name' && element.value !== null && element.value !== '') {
              full_name += element.value
            }
            if (element.label === 'Middle Name' && element.value !== null && element.value !== '') {
              full_name += ' ' + element.value
            }
            if (element.label === 'Last Name' && element.value !== null && element.value !== '') {
              full_name += ' ' + element.value
            }
          })
          this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Full Name')].value = full_name
        }

        // Initialize with safe default values
        let totalAmount = 0
        let totalSalary = 0

        // Handle additional input keys safely
        if (this.eosb && this.eosb.additional_input_keys) {
          this.eosb.additional_input_keys.forEach(element => {
            // Make sure the value is a valid number
            const value = parseFloat(element.value) || 0
            if (!isNaN(value)) {
              totalAmount += value
            }
          })
        }

        // Handle auto replace keys safely
        if (this.eosb && this.eosb.auto_replace_keys) {
          this.eosb.auto_replace_keys.forEach(element => {
            // Get values safely with fallback to 0
            const value = parseFloat(element.value) || 0

            if (!isNaN(value)) {
              if (element.label === 'Basic Salary') {
                totalSalary += value
              }
              if (element.label === 'Housing Allowance') {
                totalSalary += value
              }
              if (element.label === 'Other Allowance') {
                totalSalary += value
              }
              if (element.label === 'Car Allowance') {
                totalSalary += value
              }
              if (element.label === 'Petrol Allowance') {
                totalSalary += value
              }
            }
          })

          // Set total salary payable safely
          this.eosb.auto_replace_keys[this.findIndex(this.eosb.auto_replace_keys, 'Total Salary Payable')].value =
            totalSalary.toFixed(2)

          // Process other values that contribute to total amount
          this.eosb.auto_replace_keys.forEach(element => {
            const value = parseFloat(element.value) || 0

            if (!isNaN(value)) {
              if (element.label === 'Total Salary Payable') {
                totalAmount += value
              }
              if (element.label === 'Leave Encashments') {
                totalAmount += value
              }
              if (element.label === 'Gratuity Amount') {
                totalAmount += value
              }
            }
          })
        }

        // Update total amount
        this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Total Amount')].value = totalAmount.toFixed(2)

        // CRITICAL FIX: Check for valid number before converting to words
        if (!isNaN(totalAmount) && isFinite(totalAmount)) {
          // Round to the nearest integer before converting to words
          const roundedTotal = Math.round(totalAmount)
          let toWords = converter.toWords(roundedTotal)
          this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Total Word')].value = toWords + ' dirhams only'
        } else {
          // Default fallback when total is not a valid number
          this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Total Word')].value = 'zero dirhams only'
        }

        return true
      } catch (error) {
        console.error('Error in computedAll:', error)
        // Set a default value in case of error
        if (this.eosb && this.eosb.user_input_keys) {
          this.eosb.user_input_keys[this.findIndex(this.eosb.user_input_keys, 'Total Word')].value = 'zero dirhams only'
        }
        return false
      }
    }
  }
}
</script>