<template>
  <!-- Billings  Dialog -->
  <v-dialog id="custom_dialog" v-model="dialogData" persistent width="50vw" height="100vh" content-class="proposal_dialog">
    <div class="dialog_proposal">
      <v-card id="card" style="padding: 20px 30px !important; height: 100vh !important">
        <v-card-title id="card-title" class="mb-5">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <h4 class="text--text">Additions & Deductions</h4>
                <div class="d-flex align-center justify-end">
                  <v-btn class="tall__btn mr-4 pl-6 pr-6 span_data" color="subtext" outlined @click="close()"><span class="">Cancel</span></v-btn>
                  <v-btn class="tall__btn pl-6 pr-6 span_data" color="primary" @click="createNewPayItem()">Create</v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <div>
            <v-form ref="billingForm">
              <v-row class="">
                <v-col cols="5" class="pl-0 pb-0">
                  <CustomInputContainer label="Invoice">
                    <div slot="input">
                      <v-select :items="invoiceList" placeholder="Select Invoice" solo dense v-model="payItemObj.invoice_id" item-text="invoice_number" item-value="_id" class="proposalDialog_date_field2" v-if="invoiceList.length >= 1" append-icon="fa-chevron-down" @change="intersectedGetEmployersList(payItemObj.invoice_id),getEmployeesList(payItemObj.invoice_id)" />
                      <p v-else class="error--text mb-5 mt-5">Please Select Invoice</p>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="5" class="pl-0 pb-0" v-if="employers.length > 0">
                  <CustomInputContainer label="Employer">
                    <div slot="input">
                      <v-select :items="employers" placeholder="Select Employers" solo dense v-model="payItemObj.company_id" item-text="customer_name" item-value="customer" class="proposalDialog_date_field2" v-if="employers.length >= 1" append-icon="fa-chevron-down" />
                      <p v-else class="error--text mb-5 mt-5">Please Select Employers</p>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="5" class="pl-0 pb-0" v-if="employees.length > 0">
                  <CustomInputContainer label="Employee">
                    <div slot="input">
                      <v-select :items="employees" placeholder="Select Employee" solo dense v-model="payItemObj.user_id" :item-text="item => `${item.first_name} ${item.last_name}`" item-value="id"
                        class="proposalDialog_date_field2" v-if="employees.length >= 1" append-icon="fa-chevron-down" />
                      <p v-else class="error--text mb-5 mt-5">Please Select Employees</p>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="5" class="pl-0 pb-0">
                  <CustomInputContainer label="Inclusion Month">
                    <div slot="input">
                      <v-menu  v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="payItemObj.pay_month" placeholder="Enter Inclusion Date" solo class="proposalDialog_date_field2" hide-details dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker v-model="payItemObj.pay_month" @input="exp_date_menu = false" />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" class="py-0 px-0">
                  <div class="d-flex flex-column">
                    <span class="span_subtext my-6">INVOICE ADDITIONS & DEDUCTIONS</span>
                  </div>
                  <v-simple-table dense class="dynamic_table">
                    <template v-slot:default>
                      <thead class="dynamic_table_thead">
                        <tr class="" style="height: 35px !important">
                          <th v-for="item in table_headers" :key="item" class="text-center text--text font-weight-bold" style="font-size: 12px !important;font-weight: 500 !important;">{{ item }}</th>
                        </tr>
                      </thead>
                      <tbody class="dynamic_table_tbody" v-for="(item, index) in payItems" :key="index">
                        <tr class="dynamic_table_body_rows" style="border-bottom: 0.5 solid red !important">
                          <td class="py-2 text-center">
                            <v-text-field class="rounded-lg" placeholder="Addition/Deduction" solo flat hide-details dense v-model="item.type" />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field class="rounded-lg" placeholder="Category" solo flat hide-details dense v-model="item.category" />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field class="rounded-lg" placeholder="Remarks" solo flat hide-details dense v-model="item.remarks" />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field class="rounded-lg" type="number" placeholder="Amount" solo flat hide-details dense v-model="item.amount" />
                          </td>
                          <td class="py-2 text-center">
                            <v-select class="rounded-lg" :items="currencyList" placeholder="Select Currency" solo flat hide-details dense append-icon="fa-chevron-down" v-model="item.currency" />
                          </td>
                          <td class="py-2 text-center">
                            <v-btn icon color="error" class="mx-3 text-center" @click="handleDeleteProduct(item.id)">
                              <v-icon class="" color="error" x-small>fa-light fa-trash-can</v-icon>
                            </v-btn>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr v-if="!payItems.length > 0">
                          <td colspan="4" style="color: red">Please fill the products</td>
                        </tr>
                      </tfoot>
                    </template>
                  </v-simple-table>
                </v-col>
                <v-col cols="12">
                  <div class="d-flex justify-space-between align-start">
                    <v-btn @click="handleAddProduct" class="small__btn" outlined color="subtext">
                      <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
                      <span class="text--text">Add Product</span>
                    </v-btn>
                    <div class="estimate__container">
                      <div class="flex_column">
                        <span class="text--text font-weight-bold pb-2">Total Amount</span>
                      </div>
                      <div class="flex_column">
                        <span class="text--text font-weight-bold mb-2">AED {{ computedSubTotal | twoDecimals }}</span>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
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
    FileDropzone,
    CalenderSvg
  },
  props: {
    dialogData: Boolean,
  },
  data() {
    return {
      payItems: [
        {
          type: '',
          category: '',
          remarks: '',
          amount: '',
          currency:'',
        },
      ],
      table_headers: ['Type','Category','Remarks','Amount','Currency','Actions'],
      main_rule: [(v) => !!v || 'This filed is required'],
      employers: [],
      employees: [],
      invoiceList: [],
      currencyList: [],
      exp_date_menu: false,
      payItemObj: {
        user_id: "",
        company_id: "",
        pay_month: "",
        type: "",
        category: "",
        remarks: "",
        amount: "",
        currency: "",
        unpaid: "0",
        ot_type: "n/a",
        hours: "",
        invoice_id: ""
      }
    }
  },
  mounted(){
    this.getInvoiceList()
    this.getCurrencyList()
  },
  computed:{
    computedSubTotal() {
      let total = 0;
      for (let i = 0; i < this.payItems.length; i++) {
        const item = this.payItems[i];
        const amount = parseFloat(item.amount);

        if (!isNaN(amount)) {
          total += amount;
        }
      }
      return total;
    },
  },
  methods: {
    async getCurrencyList(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/invoice/currency/list`, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.currencyList = response
      })
    },
    async getInvoiceList(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/invoice/type/?invoiceType=payroll invoice`, {}, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.invoiceList = response
      })
    },
    async intersectedGetEmployersList(invoice_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/invoice/id/${invoice_id}`, {}, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.employers = response
      })
    },
    async getEmployeesList(invoice_id){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/invoice/users/${invoice_id}`, {}, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.employees = response
      })
    },
    handleAddProduct() {
      this.payItems.push({
        type: '',
        category: '',
        remarks: '',
        amount: '',
        currency:'',
      })
    },
    handleDeleteProduct(index) {
      this.payItems.splice(index, 1)
    },
    close() {
      this.$emit('close')
      this.$refs.billingForm.reset()
      
      this.payItemObj = {
        user_id: "",
        company_id: "",
        pay_month: "",
        type: "",
        category: "",
        remarks: "",
        amount: "",
        currency: "",
        unpaid: "0",
        ot_type: "n/a",
        hours: "",
        invoice_id: ""
      }
      this.payItemObj.company_id = ""
      this.payItemObj.user_id = ""
      this.employees = []
      this.employers = []
      this.payItems = [
        {
          type: '',
          category: '',
          remarks: '',
          amount: '',
          currency:'',
        },
      ]
    },
    async createNewPayItem(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      let arr = []
      for(let i = 0; i < this.payItems.length;i++) {
        const element = this.payItems[i]

        const newObj = {
          "user_id": this.payItemObj.user_id,
          "company_id": this.payItemObj.company_id,
          "pay_month": this.payItemObj.pay_month,
          "type": element.type,
          "category": element.category,
          "remarks": element.remarks,
          "amount": element.amount,
          "currency": element.currency,
          "unpaid": this.payItemObj.unpaid,
          "ot_type": this.payItemObj.ot_type,
          "hours": this.payItemObj.hours,
          "invoice_id": this.payItemObj.invoice_id,
        }

        arr.push(newObj)
      }

      await this.$axios.$post(`/payitem`, arr, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.close()
      })
    }
  },
}
</script>
<style lang="scss">
.dynamic_table {
  .dynamic_table_thead {
    tr {
      background: #e2e7f180 !important;
    }
  }

  .dynamic_table_tbody {
    .dynamic_table_body_rows {
      &:hover {
        background: #e2e7f142 !important;
      }
    }
  }
}

.estimate__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  width: 400px;
  // height: 120px;
}
</style>
