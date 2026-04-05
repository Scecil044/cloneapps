<template>
  <div class="dialog-container">
    <v-row>
      <v-col cols="12">
        <v-card id="card" style="margin-bottom: 1rem !important">
          <v-container fluid scroll height="auto">
            <v-card-title id="card-title" class="mb-4">
              <h4 class="text--text">Edit Invoices</h4>
              <div class="d-flex justify-lg-space-between">
                <v-btn
                  class="tall__btn mr-2"
                  color="lightgray"
                  outlined
                  @click="handleModel"
                  >Cancel</v-btn
                >
                <v-btn
                  class="tall__btn mr-2"
                  color="primary"
                  @click="openReceivePayments()"
                  >Receive Payments</v-btn
                >
                <v-btn
                  class="tall__btn"
                  color="primary"
                  @click="updateBillings()"
                  >Update</v-btn
                >
              </div>
            </v-card-title>
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="primary"
            ></v-progress-circular>
            <v-row
              class="not_recurring_row_3 py-0 my-0 d-flex"
              style="gap: 20px"
            >
              <v-form
                ref="estimateForm"
                v-model="valid"
                lazy-validation
                class="row"
              >
                <v-col
                  cols="12"
                  class="px-0"
                  style="height: fit-content"
                  gap="2"
                >
                  <v-row>
                    <v-col cols="6">
                      <CustomInputContainer label="Employer" :mandatory="true">
                        <div slot="input">
                          <v-text-field
                            v-model="invoiceObj.customer_name"
                            placeholder="Current Company"
                            class="proposalDialog_date_field2"
                            solo
                            dense
                            :style="{ color: '#000000 !important' }"
                            :rules="main_rule"
                            disabled
                          >
                          </v-text-field>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="6">
                      <CustomInputContainer
                        label="Employer Email"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-text-field
                            v-model="invoiceObj.email"
                            placeholder="Enter Email"
                            class="proposalDialog_date_field2"
                            solo
                            dense
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <CustomInputContainer
                        label="Billing Address"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-textarea
                            v-model="invoiceObj.billing_address"
                            placeholder="Enter Customer Billing Address"
                            solo
                            class="proposalDialog_date_field2"
                            dense
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="6">
                      <CustomInputContainer label="Memo" :mandatory="true">
                        <template v-slot:input>
                          <v-textarea
                            placeholder="Enter Invoice Memo"
                            solo
                            class="proposalDialog_date_field2"
                            dense
                            v-model="invoiceObj.memo"
                          />
                        </template>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" gap="2">
                      <v-row>
                        <v-col cols="4">
                          <CustomInputContainer label="Terms" :mandatory="true">
                            <div slot="input">
                              <v-select
                                :items="termsList"
                                v-model="invoiceObj.terms"
                                placeholder="Terms"
                                class="proposalDialog_date_field2"
                                solo
                                dense
                                item-text="name"
                                item-value="_id"
                                :rules="main_rule"
                                v-if="termsList.length >= 1"
                                append-icon="fa-chevron-down"
                                @change="getTermsName(invoiceObj.terms)"
                              >
                              </v-select>
                              <p v-else class="error--text mb-5 mt-5">
                                Please Select Terms
                              </p>
                            </div>
                          </CustomInputContainer>
                        </v-col>
                        <v-col cols="4">
                          <CustomInputContainer
                            label="Invoice Date"
                            :mandatory="true"
                          >
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
                                  <v-text-field
                                    v-model="invoiceObj.invoice_date"
                                    placeholder="Enter Date"
                                    solo
                                    class="proposalDialog_date_field2"
                                    dense
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    :rules="main_rule"
                                  >
                                    <template v-slot:append>
                                      <div class="">
                                        <CalenderSvg />
                                      </div>
                                    </template>
                                  </v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="invoiceObj.invoice_date"
                                  @input="date_menu = false"
                                />
                              </v-menu>
                            </div>
                          </CustomInputContainer>
                        </v-col>
                        <v-col cols="4">
                          <CustomInputContainer label="Due date">
                            <div slot="input">
                              <v-menu
                                v-model="exp_date_menu"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="auto"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="invoiceObj.due_date"
                                    placeholder="Enter Due Date"
                                    solo
                                    class="proposalDialog_date_field2"
                                    hide-details
                                    dense
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    :rules="main_rule"
                                  >
                                    <template v-slot:append>
                                      <div class="">
                                        <CalenderSvg />
                                      </div>
                                    </template>
                                  </v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="invoiceObj.due_date"
                                  @input="exp_date_menu = false"
                                />
                              </v-menu>
                            </div>
                          </CustomInputContainer>
                        </v-col>
                        <v-col cols="4">
                          <CustomInputContainer label="Attach Timesheet">
                            <template v-slot:input>
                              <v-file-input
                                v-model="timesheet"
                                placeholder="Upload Timesheet(s)"
                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                outlined
                                multiple
                                dense
                                @change="handleFileUpload"
                              />
                            </template>
                          </CustomInputContainer>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" gap="2">
                      <v-row>
                        <v-col cols="6">
                          <CustomInputContainer
                            label="Customer Notes"
                            :mandatory="true"
                          >
                            <div slot="input">
                              <v-textarea
                                placeholder="Enter Customer Notes"
                                solo
                                class="proposalDialog_date_field2"
                                dense
                                v-model="invoiceObj.customer_notes"
                                height="80px"
                              />
                            </div>
                          </CustomInputContainer>
                        </v-col>
                        <v-col cols="6">
                          <CustomInputContainer
                            label="Terms and Condition"
                            :mandatory="true"
                          >
                            <div slot="input">
                              <v-textarea
                                placeholder="Enter Terms and Condition"
                                solo
                                class="proposalDialog_date_field2"
                                dense
                                v-model="invoiceObj.terms_condition"
                                height="80px"
                              />
                            </div>
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
                      <tr style="height: 48px; background-color: #f5f5f5;">
                        <th class="text-center text--text font-weight-bold" style="font-size: 14px; width: 5%">
                          #
                        </th>
                        <th v-for="item in table_headers" :key="item" class="text-center text--text font-weight-bold" style="font-size: 14px;">
                          {{ item }}
                        </th>
                      </tr>
                      </thead>
                      <tbody class="dynamic_table_tbody" v-for="(item, index) in invoiceObj.items" :key="index">
                      <tr class="dynamic_table_body_rows">
                        <td class="py-3 text-center" style="width: 5%">
                          {{ index + 1 }}
                        </td>
                        <td class="py-3 text-center" style="min-width: 180px">
                          <v-text-field
                            class="rounded-lg"
                            placeholder="Enter Service"
                            solo
                            flat
                            hide-details
                            v-model="item.service_name"
                            height="45"
                            style="min-width: 100%"
                          />
                        </td>
                        <td class="py-3 text-center" style="min-width: 300px">
                          <v-textarea
                            class="rounded-lg"
                            placeholder="Enter Description"
                            solo
                            flat
                            hide-details
                            v-model="item.description"
                            rows="3"
                            auto-grow
                            style="min-width: 100%; font-size: 14px"
                            height="85"
                          />
                        </td>
                        <td class="py-3 text-center" style="min-width: 120px">
                          <v-text-field
                            class="rounded-lg"
                            type="number"
                            placeholder="0.00"
                            solo
                            flat
                            hide-details
                            :rules="main_rule"
                            v-model="item.rate"
                            @input="assignAmountValue(item.rate, index)"
                            height="45"
                            style="min-width: 100%"
                          />
                        </td>
                        <td class="py-3 text-center" style="min-width: 120px">
                          <v-text-field
                            class="rounded-lg"
                            type="number"
                            placeholder="0.00"
                            solo
                            flat
                            hide-details
                            disabled
                            :rules="main_rule"
                            v-model="item.amount"
                            height="45"
                            style="min-width: 100%"
                          />
                        </td>
                        <td class="py-3 text-center" style="min-width: 150px">
                          <v-select
                            class="rounded-lg"
                            :items="taxCodesList"
                            placeholder="Select Tax Codes"
                            solo
                            flat
                            hide-details
                            item-text="code"
                            item-value="_id"
                            append-icon="fa-chevron-down"
                            v-model="item.tax_code"
                            @change="getTaxRate(item.tax_code, index)"
                            height="45"
                            style="min-width: 100%"
                          />
                        </td>
                        <td class="py-3 text-center" style="min-width: 100px">
                          <v-text-field
                            class="rounded-lg"
                            disabled
                            type="number"
                            placeholder="0.00"
                            solo
                            flat
                            hide-details
                            :rules="main_rule"
                            v-model="item.vat_rate"
                            height="45"
                            style="min-width: 100%"
                          />
                        </td>
                        <td class="py-3 text-center" style="min-width: 120px">
                          <v-text-field
                            class="rounded-lg"
                            type="number"
                            placeholder="0.00"
                            solo
                            flat
                            hide-details
                            disabled
                            :rules="main_rule"
                            v-model="item.vat_amount"
                            height="45"
                            style="min-width: 100%"
                          />
                        </td>
                        <td class="py-3 text-center" style="min-width: 120px">
                          <v-text-field
                            class="rounded-lg"
                            type="number"
                            placeholder="0.00"
                            solo
                            flat
                            hide-details
                            disabled
                            :rules="main_rule"
                            v-model="item.net_total"
                            height="45"
                            style="min-width: 100%"
                          />
                        </td>
                        <td class="py-3 text-center" style="width: 80px">
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
                    <v-btn
                      @click="handleAddProduct()"
                      class="small__btn"
                      outlined
                      color="subtext"
                    >
                      <v-icon x-small color="subtext" class="mr-2"
                        >fa-plus</v-icon
                      >
                      <span class="text--text">Add Product</span>
                    </v-btn>
                    <div class="estimate__container">
                      <div class="flex_column">
                        <span class="text--text font-weight-bold pb-2"
                          >Sub Total</span
                        >
                        <span class="text--text font-weight-bold pb-2"
                          >Discount</span
                        >
                        <span class="text--text font-weight-bold pb-2"
                          >VAT Amount</span
                        >
                        <span class="text--text font-weight-bold">Total</span>
                      </div>
                      <div class="flex_column">
                        <span class="text--text font-weight-bold mb-2"
                          >AED {{ computedSubTotal | twoDecimals }}</span
                        >
                        <span class="text--text font-weight-bold mb-2"
                          >AED {{ computedDiscount | twoDecimals }}</span
                        >
                        <span class="text--text font-weight-bold mb-2"
                          >AED {{ computedVATAmount | twoDecimals }}</span
                        >
                        <span class="text--text font-weight-bold"
                          >AED {{ computedTotal | twoDecimals }}</span
                        >
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-form>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Upload</v-card-title>
        <v-card-text> Are you sure you want to upload this file? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="confirmUpload"
            >Yes</v-btn
          >
          <v-btn color="red darken-1" text @click="confirmDialog = false"
            >No</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="openReceivePaymentsDialog"
      persistent
      width="50vw"
      content-class="proposal_dialog"
    >
      <div class="dialog_proposal" style="overflow-x: hidden">
<!--        <CreditNote @close="handleClose" :selectedBilling="selectedItem" />-->
        <ReceivePayments @close="closeReceivePayments" :selectedBilling="selectedBilling"/>
      </div>
    </v-dialog>
    <SnackBar :data="snackbar_data" v-if="showSnack" />
  </div>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import CreditNote from '~/components/Billings/CreditNote.vue'
import ReceivePayments from '~/components/Billings/ReceivePayments.vue'

export default {
  components: {
    CreditNote,
    CustomInputContainer,
    SnackBar,
    CalenderSvg,
    ReceivePayments
  },
  props: {
    selectedBilling: Object,
    handleModel: Function,
  },
  data() {
    return {
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      main_rule: [(v) => !!v || 'This filed is required'],
      valid: true,
      loading: false,
      openReceivePaymentsDialog: false,
      date_menu: false,
      receivePayments: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      confirmDialog: false,
      timesheet_url: null,
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
      timesheet: null,
      employers: [],
      termsList: [],
      termsDays: '',
      taxCodesList: [],
      taxRate: '',
      invoiceObj: {
        _id: '',
        customer: '',
        customer_name: '',
        customer_address: ' ',
        email: '',
        billing_address: '',
        shipping_address: '',
        terms: '',
        terms_name: '',
        memo: '',
        invoice_date: new Date().toISOString().substr(0, 10),
        due_date: '',
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
      showSnack: false,
    }
  },
  mounted() {
    // console.log(this.selectedBilling, '----------this.selectedBilling props')
    this.invoiceObj = this.selectedBilling

    this.getEmployersList()
    this.getTermsList()
    this.getTaxCodeList()
  },
  methods: {
    close() {
      this.$emit('close')
    },
    closeReceivePayments() {
      this.openReceivePaymentsDialog = false
    },
    openReceivePayments() {
      this.openReceivePaymentsDialog = true
    },
    async getEmployersList() {
      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/companies`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.employers = response
        })
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
          console.log('What are the tax codes as at now', response)
          this.taxCodesList = response
        })
    },
    changeEmail(customer) {
      this.invoiceObj.customer_name = this.employers.filter(
        (a) => a.id == customer
      )[0].company_name
      this.invoiceObj.customer_address = this.employers.filter(
        (a) => a.id == customer
      )[0].address
      this.invoiceObj.email = this.employers.filter(
        (a) => a.id == customer
      )[0].email
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
    async updateBillings() {
      this.loading = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        this.invoiceObj.sub_total = this.computedSubTotal
        this.invoiceObj.discount_total = this.computedDiscount
        this.invoiceObj.vat_total = this.computedVATAmount
        this.invoiceObj.total = this.computedTotal
        this.invoiceObj.time_sheet = this.timesheet_url
          ? this.timesheet_url
          : ''
        this.invoiceObj.memo = this.invoiceObj.memo ? this.invoiceObj.memo : ''
        console.log('What is the invoice object', this.invoiceObj)

        const response = await this.$axios.$patch(
          `/invoice/update/${this.invoiceObj._id}`,
          this.invoiceObj,
          {
            headers: { Authorization: AuthStr },
          }
        )

        if (this.handleModel && typeof this.handleModel === 'function') {
          this.handleModel()
          this.$emit('update-success')
        }
      } catch (error) {
        console.error('Error updating invoice:', error)
        this.snackbar_data.snackbar = true
        this.snackbar_data.text =
          error.response?.data?.message || 'Error updating invoice'
        this.snackbar_data.color = 'error'
        this.snackbar_data.timeout = 2000
        this.showSnack = true
      } finally {
        this.loading = false
      }
    },
    handleAddProduct() {
      this.handleAddProductAt(this.invoiceObj.items.length)
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
      }

      this.invoiceObj.items.splice(index, 0, newItem)
    },
    handleDeleteProduct(index) {
      this.invoiceObj.items.splice(index, 1)
    },
    handleFileUpload() {
      if (this.timesheet) {
        this.confirmDialog = true
      }
    },
    async confirmUpload() {
      this.confirmDialog = false

      const formData = new FormData()
      formData.append('file', this.timesheet)

      try {
        const response = await this.$axios.post(
          '/documents/mimetype/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        this.timesheet_url = response?.url
        this.timesheet = null
      } catch (error) {
        console.error(error)
      }
    },
  },
  computed: {
    computedSubTotal() {
      if (!this.invoiceObj?.items) return 0
      console.log('What are the items ***', this.invoiceObj.items)
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
      if (!this.invoiceObj?.items) return 0
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const discount = parseFloat(item.discount)

        if (!isNaN(discount)) {
          total -= discount
        }
      }
      return total
    },
    computedVATAmount() {
      if (!this.invoiceObj?.items) return 0
      let total = 0
      for (let i = 0; i < this.invoiceObj.items.length; i++) {
        const item = this.invoiceObj.items[i]
        const amount = parseFloat(item.vat_amount)

        if (!isNaN(amount)) {
          total += amount
        } else {
          total += amount
        }
      }
      return total
    },
    computedTotal() {
      if (!this.invoiceObj?.items) return 0
      return (
        this.computedSubTotal + this.computedDiscount + this.computedVATAmount
      )
    },
  },
}
</script>
<style scoped>
.dialog-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
}

.hover-area {
  height: 10px;
  transition: background-color 0.2s;
}

.spacer-row:hover .hover-area {
  background-color: rgba(0, 0, 0, 0.05);
}

#card {
  height: 100%;
  margin: 0 !important;
  border-radius: 0;
}

.v-container {
  height: 100%;
  padding: 1rem;
}
.dynamic_table {
  width: 100%;
}

.dynamic_table_thead th {
  background-color: #f0f0f0;
  border-bottom: 2px solid #ccc;
}

.dynamic_table_body_rows {
  height: 50px;
}

.dynamic_table_body_rows td {
  padding: 5px;
}

/* Add responsive behavior */
@media (max-width: 960px) {
  .dialog-container {
    width: 90%;
  }
}

@media (max-width: 600px) {
  .dialog-container {
    width: 100%;
  }
}
</style>
