<template>
  <!-- Create Onboarding  Dialog -->
  <v-dialog id="custom_dialog" v-model="dialogData" width="45vw" height="100vh" content-class="proposal_dialog">
    <div class="dialog_proposal">
      <v-card id="card" style="padding: 20px 30px !important; height: 100vh !important">
        <v-card-title id="card-title">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <h4 class="text--text">
                  {{ activeStage == 'Create Invoice' ? 'Create Invoice & Debit Note' : '' }}
                </h4>
                <div class="d-flex align-center justify-end">
                  <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined @click="proposalDialog = false">
                    <span class="" @click="close()">Cancel</span>
                  </v-btn>
                  <v-btn class="tall__btn pl-6 pr-6" color="primary" @click="createRequest()">
                    {{ activeStage == 'Create Invoice' ? 'Create' : '' }}
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <div class="d-flex align-center justify-space-between">
            <v-tabs v-model="tab_val" class="tabs_wrapper">
              <v-tab class="tabs_single" v-for="item in finalTab" :key="item.value" @click.native="handleTabValue(item.value)" :href="getTabName(item.value)">{{ item.title }}</v-tab>
            </v-tabs>
          </div>
          <v-divider></v-divider>
          <v-tabs-items v-model="tab_val">
            <v-tab-item v-for="(data, index) in finalTab" :key="index" :id="data.value">
              <div v-if="data.value == 'addanother'">
                <v-row class="pt-0">
                  <v-col cols="12" class="pl-0 pr-12">
                    <div class="mt-6">
                      <span class="subtext--text">Select Another Employee that you will be invoicing</span>
                    </div>
                  </v-col>
                  <v-col cols="12" class="pl-0 pr-12">
                    <div class="d-flex align-center" style="gap: 16px">
                      <CustomInputContainer label="Employee">
                        <div slot="input">
                          <v-select :items="paymentMethods" placeholder="select employee" solo dense hide-details class="proposalDialog_date_field2" v-if="paymentMethods.length >= 1" append-icon="fa-chevron-down" v-model="create_invoice.currency">
                            <template #prepend-inner>
                              <div style="width: 50px" class="d-flex align-center">
                                <v-avatar size="30">
                                  <v-img style="margin: auto 0" max-height="25" max-width="25" src="/1.jpg" />
                                </v-avatar>
                              </div>
                            </template>
                          </v-select>
                          <p v-else class="error--text mb-5 mt-5">
                            Please Select
                          </p>
                        </div>
                      </CustomInputContainer>
                      <v-btn class="tall__btn pl-6 pr-6 mt-5" color="primary" @click="addEmp()">
                        Add Employee
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </div>
              <div v-else>
                <v-row class="pt-0">
                  <!-- <v-col cols="12" class="pl-0 pt-0 pb-0">
                       <div class="mt-6 mb-4">
                       <span class="span_leadHeading">PERSONAL DETAILS</span>
                       </div>
                   </v-col> -->

                  <!-- currency exchange  -->
                  <v-col cols="4" class="pl-0 pt-6 pb-0">
                    <CustomInputContainer label="Currency">
                      <div slot="input">
                        <v-select :items="paymentMethods" v-model="create_invoice.currency" placeholder="select currency" solo dense hide-details class="proposalDialog_date_field2" v-if="paymentMethods.length >= 1" append-icon="fa-chevron-down">
                        </v-select>
                        <p v-else class="error--text mb-5 mt-5">
                          Please Select
                        </p>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4" class="pl-0 pt-6 pb-0">
                    <CustomInputContainer label="Exchange Rate">
                      <div slot="input">
                        <v-text-field v-model="create_invoice.exchange_rate" hide-details placeholder="Enter rate" solo dense class="proposalDialog_date_field2" :disabled="isTextExchangeDisabled" :class="{ proposalDialog_date_field3: isTextExchangeDisabled,}" />
                        <v-checkbox @change="toggleTextField" v-model="create_invoice.not_applicable_exchange_rate" color="primary" label="Not Applicable" hide-details></v-checkbox>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" class="pl-0 pt-0 pb-0">
                    <div class="d-flex align-center justify-space-between mt-4 mb-2">
                      <span class="span_leadHeading">INVOICE</span>
                      <span class="span_leadHeading">TOTAL : 0 AED</span>
                    </div>
                    <v-divider></v-divider>
                  </v-col>

                  <!-- Debit Note  -->
                  <v-col cols="4" class="pl-0 pt-6 pb-0">
                    <CustomInputContainer label="Type Visa">
                      <div slot="input">
                        <v-text-field v-model="create_invoice.type_visa" hide-details placeholder="Enter Type of Visa" solo dense class="proposalDialog_date_field2"  />
                        <!-- <v-select :items="paymentMethods" placeholder="Select type" solo dense hide-details
                          class="proposalDialog_date_field2" v-if="paymentMethods.length >= 1"
                          append-icon="fa-chevron-down">
                        </v-select> -->
                        <!-- <p v-else class="error--text mb-5 mt-5">
                          Please Select Type of Visa
                        </p> -->
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4" class="pl-0 pt-6 pb-0">
                    <CustomInputContainer label="Emiratization Cost">
                      <div slot="input">
                        <v-text-field v-model="create_invoice.emiratization_cost" hide-details placeholder="Enter cost" solo dense
                          class="proposalDialog_date_field2" />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox @change="toggleHideField" v-model="create_invoice.others" color="primary" label="Others" hide-details></v-checkbox>
                  </v-col>
                  <v-col cols="4" class="pl-0 pb-0">
                    <CustomInputContainer :class="{ hide_text_field: hideFields }" label="Onboarding">
                      <div slot="input">
                        <v-text-field v-model="create_invoice.onboarding" hide-details placeholder="Enter cost" solo dense class="proposalDialog_date_field2" />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4" class="pl-0 pb-0">
                    <CustomInputContainer :class="{ hide_text_field: hideFields }" label="Family Visa Cost">
                      <div slot="input">
                        <v-text-field v-model="create_invoice.family_visa_cost" hide-details placeholder="Enter cost" solo dense
                          class="proposalDialog_date_field2" :disabled="hideFields" />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" class="pl-0 pt-0 pb-0">
                    <div class="d-flex align-center justify-space-between mt-4 mb-2">
                      <span class="span_leadHeading">DEBIT NOTE</span>
                      <span class="span_leadHeading">TOTAL : 0 AED</span>
                    </div>
                    <v-divider></v-divider>
                  </v-col>

                  <v-col cols="4" class="pl-0 pt-6 pb-0">
                    <CustomInputContainer label="Security Deposit">
                      <div slot="input">
                        <v-text-field v-model="create_invoice.security_deposit" hide-details placeholder="Enter Deposit" solo dense class="proposalDialog_date_field2" />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" class="pl-0 pt-6 pb-0">
                    <div style="width: 60% !important">
                      <CustomInputContainer label="Description">
                        <div slot="input">
                          <v-textarea placeholder="Enter description" solo dense v-model="create_invoice.details" height="80px"
                            :rules="main_rule" class="proposalDialog_date_field2" />
                        </div>
                      </CustomInputContainer>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </v-container>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

export default {
  components: {
    CustomInputContainer,
  },
  props: {
    dialogData: Boolean,
    activeStage: String,
  },
  data() {
    return {
      //text fields models
      exchange_rate: '',
      emiatri_cost: '',
      onboarding_invoice: '',
      familyVisa_cost: '',
      security_deposit: '',
      emp_des: '',
      isTextExchangeDisabled: false,
      hideFields: true,
      exchangeCheckbox: false,
      hideDataCheckbox: false,
      //Tabs Data
      tab_val: '',
      selectedEmployee: {},
      tab_current_val: 'all',
      finalTab: [],
      customerTab: [{ title: 'Employee Name', value: 'all' }],
      otherTabs: [{ title: '+ Invoice Another Employee', value: 'addanother' }],

      paymentMethods: ['UAE Dirham (AED)', 'Euro (EUR)', 'Indian Rupee (INR)', 'Brazilian Real (BRL)'],
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
      currentOnboardingObj:{},
      currentObjIndex:[],
      create_invoice: {
        currency: "",
        exchange_rate: "",
        not_applicable_exchange_rate: false,
        type_visa: "",
        emiratization_cost: "",
        others: false,
        onboarding: "",
        family_visa_cost: "",
        security_deposit: "",
        details: "",
        user_id: ""
      },
    }
  },
  mounted() {
    this.finalTab = []
    this.finalTab = this.customerTab.concat(this.otherTabs)
  },
  watch:{
    dialogData(val){
      // console.log(val, '----dal')
      if(val == 'false' || val == false){
        this.close()
      }
    }
  },
  created(){
    this.$nuxt.$on('retrieveOnboardData', ($event) => {
      console.log($event, '------ere')
      this.currentOnboardingObj = $event.process
      this.currentObjIndex = $event.selectedIndex


      console.log(this.currentOnboardingObj, '------currentOnboardingObj')
      console.log(this.currentObjIndex, '-------currentObjIndex')
    })
  },
  methods: {
    getTabName(val) {
      return '#' + val
    },
    addEmp() {
      this.customerTab.push({
        title: this.selectedEmployee,
        value: this.selectedEmployee,
      })
      this.finalTab = this.customerTab.concat(this.otherTabs)
    },
    //checkbox toggler handler
    toggleTextField() {
      this.isTextExchangeDisabled = !this.isTextExchangeDisabled
    },
    toggleHideField() {
      this.hideFields = !this.hideFields
    },
    //Tabs
    handleTabValue(payload) {
      console.log(payload, 'payload')
      // Setting the payload value
      this.tab_current_val = payload

    },
    close() {
      this.$emit('close')
    },
    createRequest(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      if(this.activeStage == 'Create Invoice'){
        this.$axios.$post(`/onboardings/process/forward/${this.currentOnboardingObj._id}`,{ button: this.currentObjIndex[0].button, create_invoice: this.create_invoice }, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.close()
          this.$nuxt.$emit('fetchOnboardingList', true)
          this.$nuxt.$emit('fetchUpdatedOnboardingProcess', this.currentOnboardingObj)
        })
      }
    }
  },
}
</script>
