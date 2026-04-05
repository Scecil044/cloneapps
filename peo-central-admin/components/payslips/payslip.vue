<template>
  <v-container class="pb-0">
    <v-row>
      <v-col cols="6" class="text-left" v-if="company_data">
        <v-img width="250" src="https://payroll-central-nathanhr.s3.amazonaws.com/companies/1708415861275-dynamic-new-logo.png" />
      </v-col>
      <v-col cols="6" class="text-right">
        <p class="headline font-weight-bold">Payslip <span class="subtitle-1">{{ payslipData.pay_month | PayslipDateFormatter }}</span></p>

      </v-col>
    </v-row>
    <v-divider color="black"></v-divider>
    <v-row>
      <v-col cols="6" class=" pb-0 text-left">
        <span class="font-weight-bold">Employee: </span> {{ user.first_name }} {{ user.last_name }}
      </v-col>
      <v-col cols="6" class="text-right pb-0 pr-5">
        <span class="font-weight-bold">Total Working Days: </span>{{ payslipData.days_in_month }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class=" pb-0 text-left">
        <span class="font-weight-bold">Designation: </span> {{ payslipData.designation }}
      </v-col>
      <v-col cols="6" class="text-right pb-0 pr-5 ">
        <span class="font-weight-bold">Present Days: </span>{{ payslipData.present_days }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class=" pb-0 text-left">
        <span class="font-weight-bold">DOJ: </span> {{ payslipData.date_of_joining | nocDateFormatter }}
      </v-col>
      <v-col cols="6" class="text-right pb-0 pr-5">
        <span class="font-weight-bold">Absent Days: </span>{{ payslipData.absent_days }}
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class=" pb-0 text-left">
        <span class="font-weight-bold">IBAN: </span> {{ payslipData.iban }}
      </v-col>
      <v-col cols="12" class="text-left pb-0">
        <span class="font-weight-bold">Bank Name:</span>{{ payslipData.bank_name }}
      </v-col>
    </v-row>
    <br>
    <v-row class="border grey lighten-3 mt-1">
      <v-col class="py-0">
        <p class="font-weight-bold mb-0 ">Fixed Compensation (in AED)</p>
      </v-col>
    </v-row>
    <v-row v-for="(data, index) in payslipData.fixed" :key="index">
      <v-col cols="6" class="pb-0 text-left" v-if="data && data !== '0' && data !== 0">
        <span class="">{{ fixed_salary_config[index] }} </span>
      </v-col>
      <v-col cols="6" class="text-right pb-0" v-if="data && data !== '0' && data !== 0">
        <span class="">{{ data | amountFormatter }}</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" class="pb-0 text-left">
        <span class="">Total Fixed </span>
      </v-col>
      <v-col cols="6" class="text-right pb-0">
        <span class="">{{ payslipData && payslipData.fixed ? (getTotalFixed) : "" | amountFormatter }}</span>
      </v-col>
    </v-row>
    <br>
    <v-row v-if="otherExpenseExists(payslipData.variable)" class="border grey lighten-3 mt-1">
      <v-col class="py-0">
        <p class="font-weight-bold mb-0 ">Addition and Deduction (in AED)</p>
      </v-col>
    </v-row>

    <v-row v-for="(data, index) in payslipData.variable" :key="index">
      <v-col cols="6" class="pb-0 text-left" v-if="data !== '0' && data !== 0">
        <span class="">{{ variable_salary_config[index] }} </span>
      </v-col>
      <v-col cols="6" class="text-right pb-0" v-if="data !== '0' && data !== 0">
        <span class="">{{ data | amountFormatter }}</span>
      </v-col>
    </v-row>
    <br>

    <v-row class="border-inside grey lighten-3 mt-1">
      <v-col cols="9" class="py-0 text-left">
        <span class="font-weight-bold mb-0 ">NET PAY AED: </span>{{ payslipData.total_salary_text }}
      </v-col>
      <v-col cols="3" class="py-0 text-right">
        <p class="font-weight-bold mb-0 ">AED {{ payslipData.total_salary | amountFormatter }}</p>
      </v-col>
    </v-row>
    <br>
    <p class="text-left pt-2 pb-0 mb-0 font-italic" style="font-size:9px;">Note: This is a computer generated Payslip and does not require signature.</p>
    <br>
    <hr style="color: #1976D2;">
  </v-container>
</template>
<script>
export default {
  props: ['payslipData', 'user', 'fixed_salary_config', 'variable_salary_config', 'company_data'],
  data() {
    return {
      tel_dubai: "",
      office_email: "",
      website: "",
      off_address_dubai: "",
    }
  },

  computed: {
    getTotalFixed() {
      let total_salary = 0
      for (const [key, value] of Object.entries(this.payslipData.fixed)) {
        if (value && value > 0)
          total_salary = total_salary + parseFloat(value)
      }
      return total_salary
    },
  },
  methods: {
    otherExpenseExists(obj) {
      let valExist = false
      if (obj === null || obj === undefined) {
        return valExist
      }
      for (const key of Object.keys(obj)) {
        if (obj[key] !== 0 & obj[key] !== "0" && obj[key] !== undefined) {
          valExist = true
          break
        }
      }
      return valExist
    }
  }
}
</script>

<style scoped></style>
