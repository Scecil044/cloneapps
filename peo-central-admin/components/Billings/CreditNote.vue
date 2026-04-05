<template>
  <v-card id="card" style="margin-bottom: 1rem !important;" scrollable>
    <v-container fluid>
      <v-card-title id="card-title">
        <h4 class="text--text">New Credit Note</h4>
        <div class="flex_row justify-lg-space-between">
          <v-btn class="tall__btn mr-2 px-8" color="lightgray" outlined @click="closeEstimate()">Cancel</v-btn>
          <v-img src="/animated/ring.svg" v-if="submitLoading" max-width="30" height="30" contain></v-img>
          <v-btn class="tall__btn px-8" color="primary" @click="createCreditNote()" v-else>Create</v-btn>
        </div>
      </v-card-title>
      <v-row class="not_recurring_row_3 py-0 my-0" style="gap: 20px">
        <v-form ref="estimateForm" v-model="valid" lazy-validation class="row">
          <v-col cols="12" class="px-0" style="height: fit-content">
            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="Employer" :mandatory="true">
                  <template v-slot:input>
                    <v-select :items="employers" v-model="invoiceObj.customer" placeholder="Current Company" class="proposalDialog_date_field2" solo disabled dense item-text="company_name" item-value="_id" :rules="main_rule" v-if="employers.length >= 1" append-icon="fa-chevron-down" @change="changeEmail(invoiceObj.customer)">
                    </v-select>
                    <p v-else class="error--text mb-5 mt-5">Please Select Company</p>
                  </template>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Employer Email" :mandatory="true">
                  <template v-slot:input>
                    <v-text-field v-model="invoiceObj.email" placeholder="Enter Email" class="proposalDialog_date_field2" solo dense :rules="main_rule" />
                  </template>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="Billing Address" :mandatory="true">
                  <template v-slot:input>
                    <v-textarea v-model="invoiceObj.billing_address" placeholder="Enter Customer Billing Address" solo class="proposalDialog_date_field2" dense :rules="main_rule" />
                  </template>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Memo" :mandatory="true">
                  <template v-slot:input>
                    <v-textarea placeholder="Enter Invoice Memo" solo class="proposalDialog_date_field2" dense v-model="invoiceObj.memo"/>
                  </template>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <v-row>
                  <v-col cols="6">
                    <CustomInputContainer label="Terms" :mandatory="true">
                      <template v-slot:input>
                        <v-select :items="termsList" v-model="invoiceObj.terms" placeholder="Terms" class="proposalDialog_date_field2" solo dense item-text="name" item-value="_id" :rules="main_rule" v-if="termsList.length >= 1" append-icon="fa-chevron-down" @change="getTermsName(invoiceObj.terms)">
                        </v-select>
                        <p v-else class="error--text mb-5 mt-5">Please Select Terms</p>
                      </template>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Invoice Date" :mandatory="true">
                      <template v-slot:input>
                        <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="invoiceObj.invoice_date" placeholder="Enter Date" solo class="proposalDialog_date_field2" dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                              <template v-slot:append>
                                <div class="">
                                  <CalenderSvg />
                                </div>
                              </template>
                            </v-text-field>
                          </template>
                          <v-date-picker v-model="invoiceObj.invoice_date" @input="date_menu = false" />
                        </v-menu>
                      </template>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Due date">
                      <template v-slot:input>
                        <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="invoiceObj.due_date" placeholder="Enter Due Date" solo class="proposalDialog_date_field2" hide-details dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                              <template v-slot:append>
                                <div class="">
                                  <CalenderSvg />
                                </div>
                              </template>
                            </v-text-field>
                          </template>
                          <v-date-picker v-model="invoiceObj.due_date" @input="exp_date_menu = false" />
                        </v-menu>
                      </template>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="6">
                <v-row>
                  <v-col cols="6">
                    <CustomInputContainer label="Customer Notes" :mandatory="false">
                      <template v-slot:input>
                        <v-textarea placeholder="Enter Customer Notes" solo class="proposalDialog_date_field2" dense v-model="invoiceObj.customer_notes" height="80px" />
                      </template>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Terms and Condition" :mandatory="false">
                      <template v-slot:input>
                        <v-textarea placeholder="Enter Terms and Condition" solo class="proposalDialog_date_field2" dense v-model="invoiceObj.terms_condition" height="80px" />
                      </template>
                    </CustomInputContainer>
                  </v-col>
                </v-row>

              </v-col>
            </v-row>

          </v-col>

          <v-col cols="12">
            <v-simple-table dense class="dynamic_table">
              <template v-slot:default>
                <thead class="dynamic_table_thead">
                <tr style="height: 48px !important; background-color: #f5f5f5;">
                  <th class="text-center text--text font-weight-bold" style="font-size: 14px; width: 5%;">
                    #
                  </th>
                  <th v-for="item in table_headers" :key="item" class="text-center text--text font-weight-bold" style="font-size: 14px;">
                    {{ item }}
                  </th>
                </tr>
                </thead>
                <tbody class="dynamic_table_tbody" v-for="(item, index) in invoiceObj.items" :key="index">
                <tr class="dynamic_table_body_rows">
                  <td class="py-3 text-center" style="width: 5%;">
                    {{ index + 1 }}
                  </td>
                  <td class="py-3 text-center" style="min-width: 150px;">
                    <v-text-field
                      class="rounded-lg"
                      placeholder="Enter Service"
                      solo
                      flat
                      hide-details
                      v-model="item.service_name"
                      height="45"
                    />
                  </td>
                  <td class="py-3 text-center" style="min-width: 300px;">
                    <v-textarea
                      class="rounded-lg"
                      placeholder="Enter Description"
                      solo
                      flat
                      hide-details
                      v-model="item.description"
                      rows="3"
                      auto-grow
                      style="font-size: 14px;"
                      height="85"
                    />
                  </td>
                  <td class="py-3 text-center" style="min-width: 120px;">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      placeholder="0.00"
                      solo
                      flat
                      hide-details
                      v-model="item.rate"
                      height="45"
                      @input="assignAmountValue(item.rate, index)"
                    />
                  </td>
                  <td class="py-3 text-center" style="min-width: 120px;">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      placeholder="0.00"
                      solo
                      flat
                      hide-details
                      disabled
                      v-model="item.amount"
                      height="45"
                    />
                  </td>
                  <td class="py-3 text-center" style="min-width: 150px;">
                    <v-select
                      class="rounded-lg"
                      :items="taxCodesList"
                      placeholder="Select Tax Codes"
                      solo
                      flat
                      hide-details
                      item-text="code"
                      item-value="_id"
                      height="45"
                      append-icon="fa-chevron-down"
                      v-model="item.tax_code"
                      @change="getTaxRate(item.tax_code, index)"
                    />
                  </td>
                  <td class="py-3 text-center" style="min-width: 100px;">
                    <v-text-field
                      class="rounded-lg"
                      disabled
                      type="number"
                      placeholder="0.00"
                      solo
                      flat
                      hide-details
                      v-model="item.vat_rate"
                      height="45"
                    />
                  </td>
                  <td class="py-3 text-center" style="min-width: 120px;">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      placeholder="0.00"
                      solo
                      flat
                      hide-details
                      disabled
                      v-model="item?.vat_amount ?? 0.0"
                      height="45"
                    />
                  </td>
                  <td class="py-3 text-center" style="min-width: 120px;">
                    <v-text-field
                      class="rounded-lg text-center"
                      type="number"
                      placeholder="0.00"
                      solo
                      flat
                      hide-details
                      disabled
                      v-model="item?.net_total ?? 0.0"
                      height="45"
                    />
                  </td>
                  <td class="py-3 text-center" style="width: 80px;">
                    <v-btn icon color="error" @click="handleDeleteProduct(index)">
                      <v-icon color="error">fa-light fa-trash-can</v-icon>
                    </v-btn>
                  </td>
                </tr>
                <tr
                  :key="`spacer-${index}`"
                  class="spacer-row"
                  @click="handleAddProductAt(index + 1)"
                  style="height: 12px; cursor: pointer; background-color: #f8f9fa;"
                >
                  <td colspan="100%" class="hover-area"></td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
          <v-col cols="12">
            <div class="d-flex justify-space-between align-start">
              <v-btn @click="handleAddProduct()" class="small__btn" outlined color="subtext">
                <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
                <span class="text--text">Add Product</span>
              </v-btn>
              <div class="estimate__container">
                <div class="flex_column">
                  <span class="text--text font-weight-bold pb-2">Sub Total</span>
                  <span class="text--text font-weight-bold pb-2">Discount</span>
                  <span class="text--text font-weight-bold pb-2">VAT Amount</span>
                  <span class="text--text font-weight-bold">Total</span>
                </div>
                <div class="flex_column">
                  <span class="text--text font-weight-bold mb-2">AED {{ computedSubTotal | twoDecimals }}</span>
                  <span class="text--text font-weight-bold mb-2">AED {{ computedDiscount | twoDecimals }}</span>
                  <span class="text--text font-weight-bold mb-2">AED {{ computedVATAmount | twoDecimals }}</span>
                  <span class="text--text font-weight-bold">AED {{ computedTotal | twoDecimals }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-form>
      </v-row>
    </v-container>
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Upload</v-card-title>
        <v-card-text>
          Are you sure you want to upload this file?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="confirmUpload">Yes</v-btn>
          <v-btn color="red darken-1" text @click="confirmDialog = false">No</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SnackBar :data="snackbar_data" />
  </v-card>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import PreviewDocument from '@/components/utils/PreviewDocument.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import CreditNote from './CreditNote.vue'
import moment from 'moment'

export default {
  layout: 'dashboard',
  props: {
    selectedBilling: Object,
    handleModel: Function,
  },
  components: {
    CustomInputContainer,
    SnackBar,
    PreviewDocument,
    CalenderSvg,
    CreditNote
  },

  computed: {
    computedSubTotal() {
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const amount = parseFloat(item.amount)

        if (!isNaN(amount)) {
          total += amount
        }
      }
      return total
    },
    computedDiscount() {
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const amount = parseFloat(item.discount)

        if (isNaN(amount)) {
          total += amount
        }
      }
      return total
    },
    computedVATAmount() {
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const amount = parseFloat(item.vat_amount)

        if (!isNaN(amount)) {
          total += amount
        }
      }
      return total
    },
    computedTotal() {
      return (
        this.computedSubTotal + this.computedDiscount + this.computedVATAmount
      )
    },
  },
  data() {
    return {
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      main_rule: [(v) => !!v || 'This filed is required'],
      valid: true,
      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      timesheet: null,
      timesheet_url: null,
      confirmDialog: false,
      exp_date: new Date().toISOString().substr(0, 10),
      table_headers: [
        'Product/Service',
        'Description',
        'Rate',
        'Amount',
        'Tax Code',
        'VAT Rate %',
        'VAT Amount',
        'NET Total',
        'Actions',
      ],

      limit: '10',
      page: 0,
      employers: [],
      termsList: [],
      termsDays: '',
      taxCodesList: [],
      taxRate: '',
      invoiceObj: {
        customer: '',
        customer_name: '',
        customer_address: ' ',
        email: '',
        billing_address: '',
        shipping_address: '',
        terms: '',
        terms_name: '',
        memo: '',
        credit_date: new Date().toISOString().substr(0, 10),
        due_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        sale_location: '',
        type: 'general invoice',
        items: [
          {
            id: '',
            service: '',
            service_name: '',
            description: '',
            quantity: '',
            rate: '',
            amount: '',
            discount: 0,
            tax_name: '',
            tax_code: '',
            vat_rate: '',
            vat_amount: '',
            net_total: '',
            type: 'Service',
            date: new Date().toISOString().substr(0, 10),
            isInventory: 'false',
            city: 'Dubai',
          },
        ],
        sub_total: '',
        vat_total: '',
        total: '',
        customer_notes: '',
        terms_condition: '',
        is_recurring: false,
        is_draft: false,
      },
      submitLoading: false,
    }
  },
  mounted() {
    this.invoiceObj = this.selectedBilling
    this.getEmployersList()
    this.getTermsList()
    this.getTaxCodeList()
  },
  methods: {
    async getEmployersList() {
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token);

      try {
        const response = await this.$axios.$post(`/companies/list/filter/search?page=1&limit=100000`,{
          search: ""
        }, {
          headers: { Authorization: AuthStr }
        });
        console.log("The response now ", response);
        this.employers = response;
      } catch (error) {
        console.error("Error fetching employers list:", error);
      }
    },
    async getTermsList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/terms`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.termsList = response
        })
    },
    async getTaxCodeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/taxcodes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.taxCodesList = response
        })
    },
    changeEmail(customer) {
      console.log("Who is the customer", customer)
      const employer = this.employers.find((a) => a._id === customer);

      if (employer) {
        this.invoiceObj.customer_name = employer.company_name || 'N/A';
        this.invoiceObj.email = employer.email || 'N/A';
        console.log("This is the employer", employer)

        const formatAddress = (address) => {
          console.log("What is the address", address)
          const addressLines = [
            address.address_line1 ? address.address_line1 : 'N/A',
            address.address_line2 ? address.address_line2 : 'N/A',
            `${address.city ? address.city : ''}${address.state ? `, ${address.state}` : ''} ${address.zip ? address.zip : ''}`,
            address.country
          ].filter(line => line.trim() !== '');

          return addressLines.join('\n');
        };
        if (employer.billing_address && employer.shippn)
          this.invoiceObj.billing_address = formatAddress(employer.billing_address);
        this.invoiceObj.shipping_address = formatAddress(employer.shipping_address);
      }
    },
    getTermsName(terms) {
      this.invoiceObj.terms_name = this.termsList.filter(
        (a) => a._id == terms
      )[0].name
      this.termsDays = this.termsList.filter((a) => a._id == terms)[0].days
        ? this.termsList.filter((a) => a._id == terms)[0].days
        : '0'
      this.invoiceObj.due_date = this.generateFutureDate(this.termsDays)
    },
    getTaxRate(tax_id, index) {
      this.taxRate = this.taxCodesList.filter((a) => a._id == tax_id)[0].rate
        ? this.taxCodesList.filter((a) => a._id == tax_id)[0].rate
        : '0'

      this.invoiceObj.items[index].tax_name = this.taxCodesList.filter(
        (a) => a._id == tax_id
      )[0].name
        ? this.taxCodesList.filter((a) => a._id == tax_id)[0].name
        : ''
      this.invoiceObj.items[index].vat_rate = this.taxRate
      this.invoiceObj.items[index].vat_amount = this.calculatePercentage(
        this.taxRate,
        this.invoiceObj.items[index].amount
      )
      this.invoiceObj.items[index].net_total = this.addNumbers(
        this.invoiceObj.items[index].amount,
        this.invoiceObj.items[index].vat_amount
      )
    },
    assignAmountValue(rate, index) {
      this.invoiceObj.items[index].amount = rate
      this.invoiceObj.items[index].vat_amount = this.calculatePercentage(
        this.taxRate,
        this.invoiceObj.items[index].amount
      )
      this.invoiceObj.items[index].net_total = this.addNumbers(
        this.invoiceObj.items[index].amount,
        this.invoiceObj.items[index].vat_amount
      )
    },
    generateFutureDate(days) {
      const today = new Date() // Get the current date
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000) // Add the specified number of days

      return futureDate.toISOString().substr(0, 10) // Return the future date in a readable format
    },
    calculatePercentage(percent, number) {
      return (percent / 100) * number
    },
    addNumbers(num1, num2) {
      const parsedNum1 = parseFloat(num1)
      const parsedNum2 = parseFloat(num2)

      return parsedNum1 + parsedNum2
    },
    closeEstimate() {
      this.$emit('close')
    },
    async createCreditNote() {
      try {
        if (this.$refs.estimateForm.validate()) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.submitLoading = true

        console.log("WHat is the selected billing", this.selectedBilling)
        console.log("The sent invoice is", this.invoiceObj)
        this.invoiceObj.invoice_id = this.selectedBilling._id
        this.invoiceObj['status'] = ''
        this.invoiceObj['credit_date'] = new Date(Date.now())
        this.invoiceObj.type = 'credit note'
        this.invoiceObj['memo'] = ''
        this.invoiceObj['credit_balance'] = this.computedTotal
        this.invoiceObj['credit_amount'] = this.computedTotal
        this.invoiceObj['applied_amount'] = this.computedTotal
        this.invoiceObj['total'] = this.computedTotal
        this.invoiceObj['sub_total'] = this.computedTotal
        this.invoiceObj['vat_total'] = this.computedVATAmount
        await this.$axios
          .$post(`/credit/notes/create`, this.invoiceObj, {
            headers: { Authorization: AuthStr },
          })
          this.$nuxt.$emit('record-payment-status', {
            success: true,
            message: 'A new credit note has been created successfully',
          })
          this.closeEstimate()
      }
      } catch (error) {
        this.$nuxt.$emit('record-payment-status', {
            success: false,
            message: 'Failed to create invoice for Invoice',
          })
      }
      finally {
        this.submitLoading = false

       }
    },
    handleAddProduct() {
      this.handleAddProductAt(this.invoiceObj.items.length);
    },

    handleAddProductAt(index) {
      const newItem = {
        id: '',
        service: '',
        service_name: '',
        quantity: '',
        rate: '',
        amount: '',
        discount: 0,
        tax_name: '',
        tax_code: '',
        vat_rate: '',
        vat_amount: '',
        net_total: '',
        type: 'Service',
        date: new Date().toISOString().substr(0, 10),
        isInventory: 'false',
        city: 'Dubai',
      };

      this.invoiceObj.items.splice(index, 0, newItem);
    },
    handleDeleteProduct(index) {
      this.invoiceObj.items.splice(index, 1)
    },
    handleFileUpload() {
      if (this.timesheet) {
        this.confirmDialog = true;
      }
    },
    async confirmUpload() {
      this.confirmDialog = false;

      const formData = new FormData();
      formData.append('file', this.timesheet);

      try {
        const response = await this.$axios.post('/documents/mimetype/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.timesheet_url = response?.url
        this.timesheet = null;
      } catch (error) {
        console.error(error);
      }
    },
  },
  watch: {},
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
      // border-bottom: 0.5 solid red !important;
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
.hover-area {
  height: 10px;
  transition: background-color 0.2s;
}

.spacer-row:hover .hover-area {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
