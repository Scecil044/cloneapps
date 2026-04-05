<template>
  <!-- Create Work Order Dialog -->
  <v-dialog v-model="workOrderDialog" persistent height="100vh">
    ABC
    <div class="workOrderDialog">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <h4 class="text--text">Create Work Order</h4>
                <div class="d-flex align-center justify-end">
                  <v-btn
                    class="tall__btn mr-4 pl-6 pr-6"
                    color="subtext"
                    outlined
                    @click="$emit('closeWorkOrderDialog')"
                    ><span class="">Cancel</span></v-btn
                  >
                  <v-btn
                    class="tall__btn pl-6 pr-6"
                    color="primary"
                    @click="$emit('closeWorkOrderDialog')"
                    >Create</v-btn
                  >
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <v-row class="pt-0">
            <v-col cols="12" class="pl-0 py-0">
              <div class="mt-6 mb-4">
                <span class="span_leadHeading"> MONTHLY COSTS</span>
              </div>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Company Name">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Binance" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6"></v-col>
            <v-col cols="6" class="py-0 pl-0">
              <CustomInputContainer label="Order Date">
                <div slot="input">
                  <v-menu
                    v-model="date_menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field class="inputField"
                        v-model="order_date"
                        placeholder="DD/MM/YYYY"
                        outlined
                        dense
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="order_date"
                      @input="date_menu = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Ref to Agreement No.">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Number" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-col cols="6" class="pl-0 py-0">
            <CustomInputContainer label="Work Order No.">
              <div slot="input">
                <v-text-field class="inputField"
                  placeholder="Enter Work Order Number"
                  solo
                  dense
                />
              </div>
            </CustomInputContainer>
          </v-col>

          <v-row>
            <v-col cols="12" class="pl-0 pt-0">
              <div class="mb-3">
                <span class="span_leadHeading">CONTACT PERSON</span>
              </div>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Contact Name">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Name" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Phone No.">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Phone Number" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Designation">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Designation" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Email">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Email" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="pl-0 py-0">
              <div class="mt-6 mb-4">
                <span class="span_leadHeading">EMPLOYEE DETAILS</span>
              </div>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Employee Name">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter name" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Duration of service">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Duration" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Internal Offer letter Designation">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Designation" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Visa Designation">
                <div slot="input">
                  <v-text-field class="inputField"
                    placeholder="Enter Visa Designation"
                    solo
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="py-0 pl-0">
              <CustomInputContainer label="Start date">
                <div slot="input">
                  <v-menu
                    v-model="date_menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field class="inputField"
                        v-model="start_date"
                        placeholder="DD/MM/YYYY"
                        outlined
                        dense
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="start_date"
                      @input="date_menu2 = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="py-0 pl-0">
              <CustomInputContainer label="Contract End (if applicable)">
                <div slot="input">
                  <v-menu
                    v-model="date_menu3"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field class="inputField"
                        v-model="contract_end_date"
                        placeholder="DD/MM/YYYY"
                        outlined
                        dense
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="contract_end_date"
                      @input="date_menu = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="py-0 pl-0">
              <CustomInputContainer label="Working days">
                <div slot="input">
                  <v-textarea
                    v-model="working_days"
                    placeholder="Sun - Thu / Mon - Fri / 5 Days per week"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="py-0 pl-0">
              <CustomInputContainer label="Working Hours">
                <div slot="input">
                  <v-textarea
                    v-model="working_hours"
                    placeholder="9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Probation Period">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Period" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Notice Period">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Period" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="pl-0 pt-0">
              <div class="mb-3">
                <span class="span_leadHeading">UPFRONT MOBILISATION FEES</span>
              </div>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Employment Visa">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Amount" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Emiratization Cost">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Cost" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Medical Insurance">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Amount" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Security Deposit">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Amount" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Total Mobilization Fee">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Cost" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="pl-0 pt-0">
              <div class="mb-3">
                <span class="span_leadHeading"
                  >MONTHLY COMPENSATION AND EXPENSES</span
                >
              </div>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Basic Salary">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Amount" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Allowances">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Amount" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="pl-0 pt-0">
              <div class="mb-3">
                <span class="span_leadHeading">TOTAL SALARY</span>
              </div>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Emiratization fee">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Amount" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Dynamic Empl. Administration Fee">
                <div slot="input">
                  <v-text-field class="inputField" placeholder="Enter Amount" solo dense />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
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
  props: { workOrderDialog: Boolean },
  data() {
    return {
      date_menu: false,
      order_date: '',
      date_menu2: false,
      start_date: '',
      date_menu3: false,
      contract_end_date: '',
      working_days: '',
      working_hours: '',
    }
  },
}
</script>
