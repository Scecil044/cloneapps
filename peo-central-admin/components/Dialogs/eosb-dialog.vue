
<template>
  <!-- Create EOSB Dialog -->
  <v-dialog
    id="custom_dialog"
    v-model="dialogData"
    persistent
    width="45vw"
    height="100vh"
    content-class="proposal_dialog"
  >
    <div class="dialog_proposal">
      <v-card id="card" style="padding: 20px 30px !important; height: 100vh !important">
        <v-card-title id="card-title">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <h4 class="text--text">
                  {{ buttonVal == 'createEosb' ? 'Create EOSB' : '' }}
                  {{ buttonVal == 'createInvoice' ? 'Create Invoice' : '' }}
                  {{ buttonVal == 'recordPayment' ? 'Record Payment' : '' }}
                </h4>
                <div class="d-flex align-center justify-end">
                  <v-btn
                    class="tall__btn mr-4 pl-6 pr-6"
                    color="subtext"
                    outlined
                    @click="proposalDialog = false"
                  ><span class="" @click="close()">Cancel</span></v-btn>
                  <v-btn
                    class="tall__btn pl-6 pr-6"
                    color="primary"
                    @click="submitForm"
                  >
                    {{ buttonVal == 'createEosb' ? 'Create' : '' }}
                    {{ buttonVal == 'createInvoice' ? 'Create' : '' }}
                    {{ buttonVal == 'recordPayment' ? 'Record' : '' }}
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <ValidationObserver ref="observer" v-slot="{ invalid }">
            <!-- create EOSB -->
            <div v-if="buttonVal =='createEosb'">
              <v-row class="pt-0">
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">EMPLOYEE INFORMATION</span>
                  </div>
                </v-col>
                <v-col cols="6" class="pl-0 pt-0 pb-0">
                  <ValidationProvider name="Employee Name" rules="required" v-slot="{ errors }">
                    <CustomInputContainer label="Employee Name">
                      <div slot="input">
                        <v-text-field
                          v-model="emp_name"
                          placeholder="Akshay Dasgupta"
                          solo
                          dense
                          class="proposalDialog_date_field3"
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="6" class="pt-0 pb-0">
                  <ValidationProvider name="Contract Type" rules="required" v-slot="{ errors }">
                    <CustomInputContainer label="Contract Type">
                      <div slot="input">
                        <v-text-field
                          v-model="contract_type"
                          placeholder="Unlimited"
                          solo
                          dense
                          class="proposalDialog_date_field3"
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">EMPLOYEE INFORMATION</span>
                  </div>
                </v-col>
                <v-col cols="6" class="pl-0 pt-0 pb-0">
                  <ValidationProvider name="Last Working Day" rules="required" v-slot="{ errors }">
                    <CustomInputContainer label="Last Working Day">
                      <div slot="input">
                        <v-text-field
                          v-model="last_work"
                          placeholder="2022-10-31"
                          solo
                          dense
                          class="proposalDialog_date_field2"
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="6" class="pl-0 pt-0 pb-0">
                  <ValidationProvider name="Exit Reason" rules="required" v-slot="{ errors }">
                    <CustomInputContainer label="Exit Reason">
                      <div slot="input">
                        <v-select
                          :items="exitReason"
                          v-model="left_reason"
                          placeholder="End of Contract"
                          solo
                          dense
                          class="proposalDialog_date_field2"
                          v-if="exitReason.length >= 1"
                          append-icon="fa-chevron-down"
                          :error-messages="errors"
                        >
                        </v-select>
                        <p v-else class="error--text mb-5 mt-5">
                          Please Select Company
                        </p>
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>

                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">SALARY PAYABLE</span>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <div style="width:55%">
                    <ValidationProvider name="Salary Unpaid" rules="required|numeric" v-slot="{ errors }">
                      <CustomInputContainer label="Salary Unpaid">
                        <div slot="input">
                          <v-text-field
                            v-model="salary_unpaid"
                            placeholder="31 "
                            class="proposalDialog_date_field3"
                            solo
                            dense
                            readonly
                            :error-messages="errors"
                          >
                            <template v-slot:append>
                              <div class="">
                                <span>Days</span>
                              </div>
                            </template>
                          </v-text-field>
                        </div>
                      </CustomInputContainer>
                    </ValidationProvider>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Basic Salary" rules="required|numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Basic Salary">
                      <div slot="input">
                        <v-text-field
                          v-model="basic_salary"
                          placeholder="100000 "
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Housing Allowance" rules="required|numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Housing Allowance">
                      <div slot="input">
                        <v-text-field
                          v-model="housing_allowance"
                          placeholder="1000000"
                          class="proposalDialog_date_field3"
                          readonly
                          solo
                          dense
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Other Allowance" rules="numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Other Allowance">
                      <div slot="input">
                        <v-text-field
                          v-model="other_allowance"
                          placeholder="Add Allowance"
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Car Allowance" rules="numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Car Allowance">
                      <div slot="input">
                        <v-text-field
                          v-model="car_allowance"
                          placeholder="Add Allowance"
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Total Fixed" rules="numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Total Fixed">
                      <div slot="input">
                        <v-text-field
                          v-model="total_allowance"
                          placeholder="total"
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Petrol Allowance" rules="numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Petrol Allowance">
                      <div slot="input">
                        <v-text-field
                          v-model="petrol_allowance"
                          placeholder="Add petrol Allowance"
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Total Salary Payable" rules="numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Total Salary Payable">
                      <div slot="input">
                        <v-text-field
                          v-model="total_salaryPayable"
                          placeholder="2598464"
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        />
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">LEAVE ENCASEMENT</span>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <div style="width:55%">
                    <ValidationProvider name="Leave Balance" rules="numeric" v-slot="{ errors }">
                      <CustomInputContainer label="Leave Balance">
                        <div slot="input">
                          <v-text-field
                            v-model="leave_balance"
                            placeholder="Enter Days "
                            class="proposalDialog_date_field3"
                            solo
                            readonly
                            dense
                            :error-messages="errors"
                          >
                            <template v-slot:append>
                              <div class="">
                                <span>Days</span>
                              </div>
                            </template>
                          </v-text-field>
                        </div>
                      </CustomInputContainer>
                    </ValidationProvider>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Leave Encasement" rules="numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Leave Encasement">
                      <div slot="input">
                        <v-text-field
                          v-model="leave_Encasement"
                          placeholder="-5465465656 "
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        >
                        </v-text-field>
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">GRATUITY</span>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Gratuity Amount" rules="numeric" v-slot="{ errors }">
                    <CustomInputContainer label="Gratuity Amount">
                      <div slot="input">
                        <v-text-field
                          v-model="gratuity_amount"
                          placeholder="00.00 "
                          class="proposalDialog_date_field3"
                          solo
                          readonly
                          dense
                          :error-messages="errors"
                        > </v-text-field>
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">VARIABLE ELEMENTS</span>
                  </div>
                  <v-btn
                    class="short__btn pl-5 pr-5"
                    color="primary"
                  >Add elements</v-btn>
                </v-col>
              </v-row>
            </div>

            <!--Create Invoice  -->
            <div v-if="buttonVal =='createInvoice'">
              <v-row class="pt-0">
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">SALARY PAYABLE</span>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <div style="width:55%">
                    <ValidationProvider name="Salary Unpaid" rules="required|numeric" v-slot="{ errors }">
                      <CustomInputContainer label="Salary Unpaid">
                        <div slot="input">
                          <v-text-field
                            v-model="total_salaryPayable"
                            placeholder="31 "
                            class="proposalDialog_date_field3"
                            solo
                            dense
                            readonly
                            :error-messages="errors"
                          >
                            <template v-slot:append>
                              <div class="">
                                <span>Days</span>
                              </div>
                            </template>
                          </v-text-field>
                        </div>
                      </CustomInputContainer>
                    </ValidationProvider>
                  </div>
                </v-col>
                
                <!-- Rest of the invoice form fields with ValidationProvider wrappers -->
                <!-- Similar pattern for all other form fields -->
              </v-row>
            </div>
            
            <!--Record Payment Dialog  -->
            <div v-if="buttonVal =='recordPayment'">
              <v-row class="pt-0">
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">SALARY PAYABLE</span>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                  <ValidationProvider name="Invoice Number" rules="required" v-slot="{ errors }">
                    <CustomInputContainer label="Invoice Number " :mandatory="true">
                      <div slot="input">
                        <v-text-field
                          v-model="invoice_number"
                          placeholder="MN-98VB-MUTYUJ-BNY"
                          class="proposalDialog_date_field3"
                          solo
                          dense
                          readonly
                          :error-messages="errors"
                        >
                        </v-text-field>
                      </div>
                    </CustomInputContainer>
                  </ValidationProvider>
                </v-col>
                
                <!-- Rest of the payment form fields with ValidationProvider wrappers -->
                <!-- Similar pattern for all other form fields -->
              </v-row>
            </div>
          </ValidationObserver>
        </v-container>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import { required, email, numeric } from 'vee-validate/dist/rules'

// Register validation rules
extend('required', {
  ...required,
  message: 'This field is required'
})

extend('email', {
  ...email,
  message: 'Please enter a valid email'
})

extend('numeric', {
  ...numeric,
  message: 'This field must be a number'
})

export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    FileDropzone,
    ValidationProvider,
    ValidationObserver
  },
  props: {
    dialogData: Boolean,
    buttonVal: String,
  },
  data() {
    return {
      emp_name: '',
      contract_type: '',
      last_work: '',
      left_reason: '',
      salary_unpaid: '',
      basic_salary: '',
      housing_allowance: '',
      other_allowance: '',
      car_allowance: '',
      total_allowance: '',
      petrol_allowance: '',
      total_salaryPayable: '',
      leave_Encasement: '',
      leave_balance: '',
      amount_balance: '',
      gratuity_amount: '',
      reimbursement: '',
      reimbursement_dec: '',
      invoice_number: '',
      amount_received: '',
      paymentMethods: ['Bank', 'Cash', 'Other'],
      // date 
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),
      //exit reason list
      exitReason: ['Termination', 'Resignation', 'End Of Contract'],
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async submitForm() {
      try {
        // Validate all fields
        const isValid = await this.$refs.observer.validate()
        
        if (isValid) {
          // Form is valid, proceed with submission
          console.log('Form is valid, submitting data...')
          // Add your form submission logic here
          
          // Close the dialog after successful submission
          this.close()
        } else {
          console.log('Form validation failed')
        }
      } catch (error) {
        console.error('Error validating form:', error)
      }
    }
  }
}
</script>

<style scoped>
/* Add your component styles here */
</style>