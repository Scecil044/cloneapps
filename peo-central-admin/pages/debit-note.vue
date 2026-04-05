<template lang="">
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card id="card">
          <v-card-title id="card-title" class="mb-4 pa-2">
            <h4 class="text--text">New Debit Note</h4>
            <div class="d-flex align-center">
              <v-btn
                @click="handleClose"
                class="mr-5 tall__btn"
                color="primary"
                outlined
              >
                Cancel
              </v-btn>
              <v-btn color="primary" class="tall__btn" @click="handleSubmit"
                >Submit</v-btn
              >
            </div>
          </v-card-title>
          <v-form ref="journalForm" v-model="valid" lazy-validation>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Company" :mandatory="true">
                    <div slot="input">
                      <v-select
                        v-model="company_id"
                        :items="companySelection"
                        placeholder="Current Company"
                        return-object
                        outlined
                        dense
                        item-text="name"
                        :rules="main_rule"
                        v-if="companySelection.length >= 1"
                        append-icon="fa-chevron-down"
                      ></v-select>
                      <p v-else class="error--text mb-5 mt-5">
                        Please Select Company
                      </p>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Customer" :mandatory="true">
                    <div slot="input">
                      <v-autocomplete
                        v-model="customer"
                        :items="getCustomers"
                        item-text="customer_name"
                        placeholder="Enter Customer Name"
                        @change="onCustomerChanged"
                        return-object
                        outlined
                        dense
                        :rules="main_rule"
                        append-icon="fa-chevron-down"
                      ></v-autocomplete>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="2">
                  <CustomInputContainer label="Invoice Number">
                    <div slot="input">
                      <v-text-field
                        v-model="invoice_number"
                        placeholder="Invoice Number"
                        outlined
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="4">
                  <CustomInputContainer label="Terms" :mandatory="true">
                    <div slot="input">
                      <v-select
                        v-model="term"
                        :items="terms_menu"
                        item-text="name"
                        placeholder="Select Terms"
                        @change="onTermsChanged"
                        return-object
                        outlined
                        hide-details
                        dense
                        :rules="main_rule"
                        append-icon="fa-chevron-down"
                      ></v-select>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="3">
                  <CustomInputContainer
                    label="Debit Note Date"
                    :mandatory="true"
                  >
                    <div slot="input">
                      <v-menu
                        v-model="debit_date_menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="debit_date"
                            placeholder="Enter Date"
                            outlined
                            dense
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            :rules="main_rule"
                          />
                        </template>
                        <v-date-picker
                          v-model="debit_date"
                          @input="
                            debit_date_menu = false
                            onTermsChanged(term)
                          "
                        />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="3">
                  <CustomInputContainer label="Due Date" :mandatory="true">
                    <div slot="input">
                      <v-menu
                        v-model="due_date_menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="due_date"
                            placeholder="Enter Due Date"
                            outlined
                            dense
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            :rules="main_rule"
                          />
                        </template>
                        <v-date-picker
                          v-model="due_date"
                          @input="due_date_menu = false"
                        />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Reference#">
                    <div slot="input">
                      <v-text-field
                        v-model="reference"
                        placeholder="Give your Reference"
                        outlined
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Invoice Created Date">
                    <div slot="input">
                      <v-text-field
                        v-model="invoice_date"
                        placeholder="Invoice Date"
                        outlined
                        dense
                        readonly
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Salesperson" :mandatory="true">
                    <div slot="input">
                      <v-text-field
                        v-model="sale_person"
                        placeholder="Enter Salesperson Name"
                        outlined
                        dense
                        readonly
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Subject" :mandatory="true">
                    <div slot="input">
                      <v-text-field
                        v-model="subject"
                        placeholder="Let your customer know what this Debit Note is for"
                        outlined
                        dense
                        readonly
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12">
                  <v-simple-table dense class="dynamic_table">
                    <template v-slot:default>
                      <thead class="dynamic_table_thead">
                        <tr class="" style="height: 35px !important">
                          <th
                            v-for="item in productsHeaders"
                            :key="item"
                            class="text-center text--text font-weight-bold"
                            style="
                              font-size: 12px !important;
                              font-weight: 500 !important;
                            "
                          >
                            {{ item }}
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        class="dynamic_table_tbody"
                        v-for="(item, index) in products"
                        :key="index"
                      >
                        <tr
                          :key="index"
                          class="dynamic_table_body_rows"
                          style="border-bottom: 0.5 solid red !important"
                        >
                          <td class="py-2 text-center">
                            <v-select
                              class="rounded-lg"
                              :items="productItems"
                              placeholder="Select Product/Service"
                              solo
                              flat
                              hide-details
                              :value="item.service_name"
                              dense
                              :rules="main_rule"
                              append-icon="fa-chevron-down"
                              @change="
                                (value) => {
                                  handleProduct(
                                    value.name,
                                    index,
                                    'service_name'
                                  )
                                  handleProduct(value._id, index, 'service')
                                  handlePrefillProductValues(value, index)
                                }
                              "
                              item-text="name"
                              return-object
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              placeholder="Enter Description"
                              solo
                              flat
                              hide-details
                              dense
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              placeholder=""
                              solo
                              flat
                              hide-details
                              dense
                              type="number"
                              min="1"
                              step="1"
                              :rules="numberRule"
                              :value="item?.quantity ?? 0"
                              @input="
                                ($event) =>
                                  handleProduct($event, index, 'quantity')
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              :rules="main_rule"
                              :value="item?.rate ?? 0.0"
                              @input="
                                ($event) => handleProduct($event, index, 'rate')
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              disabled
                              :rules="main_rule"
                              :value="item?.amount ?? 0.0"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              :rules="main_rule"
                              :value="item?.discount ?? 0.0"
                              @input="
                                ($event) =>
                                  handleProduct($event, index, 'discount')
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              :rules="main_rule"
                              :value="item?.vat_rate ?? 0.0"
                              @input="
                                ($event) =>
                                  handleProduct($event, index, 'vat_rate')
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              disabled
                              :rules="main_rule"
                              :value="item?.vat_amount ?? 0.0"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg text-center"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              disabled
                              :rules="main_rule"
                              :value="item?.net_total ?? 0.0"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-btn
                              icon
                              color="error"
                              class="mx-3 text-center"
                              @click="handleDeleteLine(item?.id, item)"
                              ><v-icon class="" color="error" x-small
                                >fa-light fa-trash-can</v-icon
                              ></v-btn
                            >
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr
                          v-if="
                            products.some((item) => item.service_name === '')
                          "
                        >
                          <td colspan="2" style="color: red">
                            Please fill the products
                          </td>
                        </tr>
                      </tfoot>
                    </template>
                  </v-simple-table>
                </v-col>
                <v-col cols="12">
                  <div class="action__btn flex_row">
                    <v-btn
                      @click="handleAddProduct"
                      class="small__btn"
                      outlined
                      color="subtext"
                    >
                      <v-icon x-small color="subtext" class="mr-2"
                        >fa-plus</v-icon
                      >
                      <span class="text--text">Add Product</span>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Customer Notes">
                    <div slot="input">
                      <v-textarea
                        v-model="notes"
                        placeholder="Enter Customer Notes"
                        outlined
                        dense
                        hide-details
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="4" offset-md="2">
                  <div class="total__container mt-3">
                    <div class="flex_column">
                      <span class="text--text font-weight-bold mb-2"
                        >Sub Total</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >Discount</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >VAT Amount</span
                      >
                      <span class="text--text font-weight-bold">Total</span>
                    </div>
                    <div class="flex_column">
                      <span class="text--text font-weight-bold mb-2"
                        >AED {{ SubTotal | twoDecimals }}</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >AED {{ DiscountTotal | twoDecimals }}</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >AED {{ VATAmountTotal | twoDecimals }}</span
                      >
                      <span class="text--text font-weight-bold"
                        >AED {{ Total | twoDecimals }}</span
                      >
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-form>
        </v-card>
      </v-col>
      <SnackBar :data="snackbar_data" />
    </v-row>
  </v-container>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import { mapState, mapMutations, mapGetters } from 'vuex'
import SnackBar from '@/components/utils/SnackBar.vue'
import moment from 'moment'

export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    SnackBar,
  },
  computed: {
    ...mapState(['companySelection']),
    ...mapGetters(['getSelectedCompanies', 'getCustomers']),
    SubTotal() {
      return this.products
        .map((item) => parseFloat(item?.amount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    DiscountTotal() {
      return this.products
        .map((item) => parseFloat(item?.discount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    VATAmountTotal() {
      return this.products
        .map((item) => parseFloat(item?.vat_amount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    Total() {
      return this.products
        .map((item) => parseFloat(item?.net_total ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
  },
  data() {
    return {
      valid: true,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      customer: '',
      company_id: '',
      customer_id: '',
      customer_email: '',
      main_rule: [(v) => !!v || 'This filed is required'],
      invoice_number: '',
      debit_date_menu: false,
      debit_date: new Date().toISOString().substr(0, 10),
      term: '',
      terms_menu: [],
      due_date_menu: false,
      due_date: new Date().toISOString().substr(0, 10),
      reference: '',
      invoice_date: new moment().format('YYYY-MM-DD'),
      sale_person: '',
      subject: '',
      productsHeaders: [
        'Product/Service',
        'Description',
        'QTY',
        'Rate',
        'Amount',
        'Discount',
        'VAT Rate %',
        'VAT Amount',
        'NET Total',
        'Actions',
      ],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      productItems: [],
      products: [
        {
          id: Math.random(),
          service: '',
          service_name: '',
          quantity: 0,
          rate: 0,
          amount: 0,
          discount: 0,
          vat_rate: 0,
          vat_amount: 0,
          net_total: 0,
        },
      ],
      notes: '',
    }
  },
  methods: {
    ...mapMutations(['setShowLoader']),
    handleClose() {},
    handleSubmit() {},
    onTermsChanged(value) {
      const invoice_date = this.new_invoice.date
      switch (value.name) {
        case 'Net 15':
          this.new_invoice.due_date = new Date(
            moment(invoice_date).add(15, 'days')
          )
            .toISOString()
            .substr(0, 10)
          break
        case 'Net 30':
          this.new_invoice.due_date = new Date(
            moment(invoice_date).add(30, 'days')
          )
            .toISOString()
            .substr(0, 10)
          break
        case 'Net 45':
          this.new_invoice.due_date = new Date(
            moment(invoice_date).add(45, 'days')
          )
            .toISOString()
            .substr(0, 10)
          break
        case 'Net 60':
          this.new_invoice.due_date = new Date(
            moment(invoice_date).add(60, 'days')
          )
            .toISOString()
            .substr(0, 10)
          break
        case 'Due end of next month':
          this.new_invoice.due_date = new Date(
            moment(invoice_date).add(1, 'months').endOf('month')
          )
            .toISOString()
            .substr(0, 10)
          break
        case 'Due end of the month':
          this.new_invoice.due_date = new Date(
            moment(invoice_date).endOf('month')
          )
            .toISOString()
            .substr(0, 10)
          break
        case 'Due on Receipt':
          this.new_invoice.due_date = this.new_invoice.date
          break
        default:
          value.days !== null
            ? (this.new_invoice.due_date = this.new_invoice.due_date =
                new Date(moment(invoice_date).add(value.days, 'days'))
                  .toISOString()
                  .substr(0, 10))
            : (this.new_invoice.due_date = this.new_invoice.date)

          break
      }
    },

    async onCustomerChanged(value) {
      //retrieve information on customer selected

      if (value !== null) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        let id = value._id
        this.setShowLoader(true)
        await this.$axios
          .$post(
            `customer/by-id/${id}`,
            {},
            {
              headers: { Authorization: AuthStr },
            }
          )
          .then((res) => {
            this.customer_id = id
            this.customer = res.data.customer.customer_name
            if (res.data.customer.primary_contact)
              this.customer_email = res.data.customer.primary_contact.email
            this.setShowLoader(false)
          })
          .catch((err) => {
            console.log(err)
            this.snackbar_data = {
              snackbar: true,
              text: 'Failed to Load Customer Details',
              color: 'danger',
              icon: 'check',
              timeout: 2000,
            }
            this.setShowLoader(false)
          })
      }
    },
    async retrieveTerm() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          'term/all',
          {},
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          this.terms_menu = res.data.terms
          this.term = res.data.terms.filter(
            (item) => item.name === 'Due on Receipt'
          )[0]
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Retrieve Terms',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },
    handleProduct(value, rowIndex, productKey) {
      let tempProducts = this.products
      switch (productKey) {
        case 'quantity':
          value = Math.round(parseInt(value))
          tempProducts = tempProducts?.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  amount: item?.rate * value,
                  vat_amount: ((item?.rate * value) / 100) * item?.vat_rate,
                  net_total:
                    item?.rate * value +
                    ((item?.rate * value) / 100) * item?.vat_rate,
                }
              : item
          )
          break

        case 'rate':
          tempProducts = tempProducts.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  amount: value * item.quantity,
                  vat_amount: ((value * item.quantity) / 100) * item.vat_rate,
                  net_total:
                    value * item.quantity +
                    ((value * item.quantity) / 100) * item.vat_rate,
                }
              : item
          )
          break

        case 'discount':
          tempProducts = tempProducts.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  amount: item.rate * item.quantity - value,
                  vat_amount:
                    ((item.rate * item.quantity - value) / 100) * item.vat_rate,
                  net_total:
                    item.rate * item.quantity -
                    value +
                    ((item.rate * item.quantity - value) / 100) * item.vat_rate,
                }
              : item
          )
          break

        case 'vat_rate':
          tempProducts = tempProducts.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  vat_amount: (item.amount / 100) * value,
                  net_total: item.amount + (item.amount / 100) * value,
                }
              : item
          )
          break
        default:
          tempProducts[rowIndex] = {
            ...tempProducts[rowIndex],
            [productKey]: value,
          }
          break
      }
      this.products = tempProducts
    },
    handlePrefillProductValues(value, rowIndex) {
      let tempProducts = this.products
      tempProducts = tempProducts.map((item, index) => {
        if (index === rowIndex) {
          return {
            ...item,
            quantity: 1,
            rate: value.price,
            amount: value.price,
            type: 'Product',
            date: new Date().toISOString().substr(0, 10),
            discount: 0,
            isInventory: value.isInventory,
            vat_rate: value.tax_code.rate,
            vat_amount: (value.price / 100) * value.tax_code.rate,
            net_total: value.price + (value.price / 100) * value.tax_code.rate,
          }
        }
        return item
      })
      this.products = tempProducts
    },
    handleDeleteLine(id, item) {
      this.products = this.products.filter((el, index) => el.id !== id)
    },
    handleAddProduct() {
      let obj = {
        id: Math.random(),
        service: '',
        service_name: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        discount: 0,
        vat_rate: 0,
        vat_amount: 0,
        net_total: 0,
      }
      this.products.push(obj)
    },
    async fetchProducts(companyObj) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const payload = {
        company: [companyObj.id],
      }
      this.setShowLoader(true)
      await this.$axios
        .$post('service/list', payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          // res.data.products
          this.productItems = res.data.products
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Load Product Details',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
        })
        .finally(() => {
          this.setShowLoader(false)
        })
    },
  },
  mounted() {
    this.retrieveTerm()
    console.log('params', this.$route.params)
  },
  watch: {
    company_id: {
      handler(newVal) {
        this.fetchProducts(newVal)
      },
      deep: true,
    },
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
      // border-bottom: 0.5 solid red !important;
      &:hover {
        background: #e2e7f142 !important;
      }
    }
  }
}
.total__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  // width: 400px;
  height: 150px;
}
</style>
