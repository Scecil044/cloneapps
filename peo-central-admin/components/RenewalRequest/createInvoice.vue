<template>
  <!-- Create Work Order Dialog -->
  <v-dialog v-model="createInvoiceDialog" persistent height="100vh" >
    <div class="workOrderDialog" >
      <v-card id="card" style="padding: 20px 30px !important; width: 100%">
        <v-card-title id="card-title">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <h4 class="text--text">Create Invoice & Debit Note</h4>
                <div class="d-flex align-center justify-end">
                  <v-btn
                    class="tall__btn mr-4 pl-6 pr-6"
                    color="subtext"
                    outlined
                    @click="$emit('closeCreateInvoiceDialog')"
                    ><span class="">Cancel</span></v-btn
                  >
                  <v-btn
                    class="tall__btn pl-6 pr-6"
                    color="primary"
                    @click="$emit('closeCreateInvoiceDialog')"
                    >Create</v-btn
                  >
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <v-tabs v-model="tab" align-with-title class="mt-10">
            <v-tabs-slider color="primary"></v-tabs-slider>
            <v-tab class="m-0">Sam Albert</v-tab>
            <v-tab>+ Invoice Another Employee</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab" class="mt-4">
            <v-tab-item>
              <v-row>
                <v-col cols="6" class="pl-0 py-0">
                  <CustomInputContainer label="Currency">
                    <div slot="input">
                      <v-select
                        v-model="currency"
                        :items="currencyList"
                        item-text="name"
                        item-value="id"
                        placeholder="Select currency"
                        outlined
                        dense
                        class="inputField"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="pl-0 py-0">
                  <CustomInputContainer label="Exchange Rate">
                    <div slot="input">
                      <v-text-field
                        class="inputField"
                        placeholder="Enter Rate"
                        solo
                        dense
                        :disabled="notApplicable"
                      />
                    </div>
                  </CustomInputContainer>
                  <v-checkbox
                    v-model="notApplicable"
                    color="primary"
                    label="Not Applicable"
                    dense
                  />
                </v-col>
              </v-row>
              <v-row class="pt-0">
                <v-col cols="12" class="pl-0 py-0 mb-4 d-flex align-center justify-space-between" style="border-bottom: 1px solid #CED6E3">
                  <div class="my-3">
                    <h5>INVOICE</h5>
                  </div>
                  <div>
                    <span>TOTAL : 0 AED</span>
                  </div>
                </v-col>
                <v-col cols="6" class="pl-0 py-0">
                  <CustomInputContainer label="Type Visa">
                    <div slot="input">
                      <v-select
                        v-model="typeVisa"
                        :items="typeVisaList"
                        item-text="name"
                        item-value="id"
                        placeholder="Select type"
                        outlined
                        dense
                        class="inputField"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="pl-0 py-0">
                  <CustomInputContainer label="Emiratization Cost">
                    <div slot="input">
                      <v-text-field
                        class="inputField"
                        placeholder="Enter Cost"
                        solo
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="othersCheckBox"
                    color="primary"
                    label="Others"
                    dense
                  />
                </v-col>
                <v-col cols="6" class="pl-0 py-0" v-if="othersCheckBox">
                  <CustomInputContainer label="Onboarding">
                    <div slot="input">
                      <v-text-field
                        class="inputField"
                        placeholder="Enter cost"
                        solo
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="pl-0 py-0" v-if="othersCheckBox">
                  <CustomInputContainer label="Family Visa Cost">
                    <div slot="input">
                      <v-text-field
                        class="inputField"
                        placeholder="Enter cost"
                        solo
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
              <v-row class="pt-0">
                <v-col cols="12" class="pl-0 py-0 mb-4 d-flex align-center justify-space-between" style="border-bottom: 1px solid #CED6E3">
                  <div class="my-3">
                    <h5>DEBIT NOTE</h5>
                  </div>
                  <div>
                    <span>TOTAL : 0 AED</span>
                  </div>
                </v-col>
                <v-col cols="6" class="pl-0 py-0">
                  <CustomInputContainer label="Security Deposit">
                    <div slot="input">
                      <v-text-field
                        class="inputField"
                        placeholder="Enter Deposit"
                        solo
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6"></v-col>
                <v-col cols="6" class="py-0 pl-0">
                  <CustomInputContainer label="Descriptions">
                    <div slot="input">
                      <v-textarea
                        v-model="descriptions"
                        placeholder="Descriptions"
                        outlined
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-tab-item>
            <v-tab-item>
              <p color="subtext" class="my-4">Select Another Employee that you will be invoicing</p>
              <v-row>
                <v-col cols="6" class="pl-0 py-0">
                  <CustomInputContainer label="Employee">
                    <div slot="input">
                      <v-select
                        v-model="employee"
                        :items="employeeList"
                        item-text="name"
                        item-value="id"
                        placeholder="Select Employee"
                        outlined
                        dense
                        hide-details
                        class="inputField"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="pl-0 py-0 d-flex align-end">
                  <v-btn class="tall__btn pl-6 pr-6" color="primary"
                    >Add Employee</v-btn
                  >
                </v-col>
              </v-row>
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
  props: { createInvoiceDialog: Boolean },
  data() {
    return {
      currency: '',
      currencyList: ['AED', 'EUR'],
      notApplicable: false,
      typeVisa: '',
      typeVisaList: [],
      othersCheckBox: true,
      employee: 'Nijad Razin',
      employeeList: ['Nijad Razin'],
      descriptions: '',
      tab: null,
    }
  },
}
</script>
