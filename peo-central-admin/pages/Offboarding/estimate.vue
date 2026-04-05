<template lang="">
  <v-card id="card" style="margin-bottom: 1rem !important">
    <v-container fluid v-if="!view_estimate">
      <v-row>
        <v-col cols="12" md="4" offset-md="8">
          <div
            class="d-flex align-center justify-space-between"
            style="gap: 2rem"
          >
            <h6>
              Balance Due &nbsp;
              <span class="font-weight-bold text-h5">0.00</span>
            </h6>
            <v-btn
              class="tall__btn px-9"
              color="primary"
              min-width="150px"
              @click.prevent="handleViewEstimate"
            >
              View Estimate</v-btn
            >
          </div>
        </v-col>
      </v-row>
      <v-row class="not_recurring_row_3 py-0 my-0" style="gap: 20px">
        <v-form ref="estimateForm" v-model="valid" lazy-validation class="row">
          <v-col cols="12" md="5" class="px-0" style="height: fit-content">
            <v-row>
              <v-col cols="12">
                <CustomInputContainer
                  label="Company Identification"
                  :mandatory="true"
                >
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
            </v-row>
            <v-row>
              <v-col cols="6">
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
              <v-col cols="6">
                <CustomInputContainer label="Customer Email" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="customer_email"
                      placeholder="Enter Customer Email"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <CustomInputContainer label="Billing Address" :mandatory="true">
                  <div slot="input">
                    <v-textarea
                      v-model="billing_address"
                      placeholder="Enter Customer Billing Address"
                      outlined
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
                  label="Message on invoice"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-textarea
                      placeholder="Enter Message on invoice"
                      outlined
                      dense
                      v-model="customer_note"
                      height="80px"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer
                  label="Message on Statement"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-textarea
                      placeholder="Enter Message on Statement"
                      outlined
                      dense
                      v-model="customer_statement"
                      height="80px"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" md="5" class="px-0" style="height: fit-content">
            <v-row>
              <!-- <v-col cols="6">
                <CustomInputContainer label="Terms">
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
              </v-col> -->
              <v-col cols="6">
                <CustomInputContainer label="Sale Location" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      placeholder="Enter Sale Location"
                      outlined
                      dense
                      v-model="sale_location"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="Estimate Date" :mandatory="true">
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
                          v-model="estimate_date"
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
                        v-model="estimate_date"
                        @input="date_menu = false"
                      />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Expiration Date" :mandatory="true">
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
                          v-model="exp_date"
                          placeholder="Enter Expiration Date"
                          outlined
                          dense
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          :rules="main_rule"
                        />
                      </template>
                      <v-date-picker
                        v-model="exp_date"
                        @input="exp_date_menu = false"
                      />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
        </v-form>
        <v-col cols="12">
          <v-simple-table dense class="dynamic_table">
            <template v-slot:default>
              <thead class="dynamic_table_thead">
                <tr class="" style="height: 35px !important">
                  <th
                    v-for="item in table_headers"
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
                v-for="(item, index) in table_products"
                :key="index"
              >
                <tr
                  class="dynamic_table_body_rows"
                  style="border-bottom: 0.5 solid red !important"
                >
                  <td class="py-2 text-center">
                    <v-select
                      class="rounded-lg"
                      :items="products"
                      placeholder="Select Product/Service"
                      solo
                      flat
                      hide-details
                      :value="item.service_name"
                      dense
                      append-icon="fa-chevron-down"
                      @change="
                        (value) => {
                          handleProduct(value.name, index, 'service_name')
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
                      @input="
                        (value) => {
                          handleProduct(value, index, 'description')
                        }
                      "
                      :value="item.description"
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
                        (value) => {
                          handleProduct(value, index, 'quantity')
                        }
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
                        (value) => {
                          handleProduct(value, index, 'rate')
                        }
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
                      :value="item?.vat_rate ?? 0.0"
                      @input="
                        (value) => handleProduct(value, index, 'vat_rate')
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
                      @click="handleDeleteProduct(item?.id)"
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
                    table_products.some((item) => item.service_name === '') ||
                    !table_products.length
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
          <div class="d-flex justify-space-between align-start">
            <v-btn
              @click="handleAddProduct"
              class="small__btn"
              outlined
              color="subtext"
            >
              <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
              <span class="text--text">Add Product</span>
            </v-btn>
            <div class="estimate__container">
              <div class="flex_column">
                <span class="text--text font-weight-bold mb-2">Sub Total</span>
                <span class="text--text font-weight-bold mb-2">VAT Amount</span>
                <span class="text--text font-weight-bold">Total</span>
              </div>
              <div class="flex_column">
                <span class="text--text font-weight-bold mb-2"
                  >AED {{ SubTotal | twoDecimals }}</span
                >
                <span class="text--text font-weight-bold mb-2"
                  >AED {{ VATAmount | twoDecimals }}</span
                >
                <span class="text--text font-weight-bold"
                  >AED {{ Total | twoDecimals }}</span
                >
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-else>
      <v-row>
        <v-col cols="12" class="d-flex align-center justify-space-between">
          <v-btn
            text
            color="subtext"
            @click.prevent="view_estimate = false"
            style="text-transform: capitalize"
          >
            <v-icon small color="subtext">fa-arrow-left</v-icon>&nbsp; Estimate
          </v-btn>
          <div class="d-flex align-center">
            <v-btn
              class="tall__btn px-9"
              color="primary"
              min-width="150px"
              @click.prevent=""
            >
              Create Estimate</v-btn
            >
          </div>
        </v-col>
        <v-col cols="12">
          <v-card id="card">
            <PreviewDocument
              :company_name="company_id.name"
              street_name="Levels 41 & 42, Emirates Towers"
              city_name="Sheikh Zayed Rd - Dubai"
              company_email="eatanddrink@gmail.com"
              vat_trn="100323347300003"
              type="Estimate"
              :customer_name="customer"
              :customer_address="billing_address"
              document_text="Estimate"
              document_number="--"
              :document_date="estimate_date"
              :document_due_date="exp_date"
              :products="table_products"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <SnackBar :data="snackbar_data" />
  </v-card>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import PreviewDocument from '@/components/utils/PreviewDocument.vue'
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    SnackBar,
    PreviewDocument,
  },
  computed: {
    ...mapState(['companySelection']),
    ...mapGetters(['getCustomers']),
    SubTotal() {
      return this.table_products
        .map((item) => parseFloat(item?.amount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    VATAmount() {
      return this.table_products
        .map((item) => parseFloat(item?.vat_amount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    Total() {
      return this.table_products
        .map((item) => parseFloat(item?.net_total ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
  },
  data() {
    return {
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },

      //rules
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],

      //estimate details
      valid: true,
      company_id: {
        name: '',
        _id: '',
      },
      customer_id: '',
      customer: '',
      customer_email: '',
      billing_address: '',
      customer_note: '',
      customer_statement: '',
      sale_location: '',
      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),
      table_headers: [
        'Product/Service',
        'Description',
        'QTY',
        'Rate',
        'Amount',
        'VAT Rate %',
        'VAT Amount',
        'NET Total',
        'Actions',
      ],
      table_products: [
        {
          id: Math.random(),
          service: '',
          service_name: '',
          description: '',
          quantity: 0,
          rate: 0,
          amount: 0,
          vat_rate: 0,
          vat_amount: 0,
          net_total: 0,
        },
      ],
      products: [],

      //view estimate
      view_estimate: false,
    }
  },
  methods: {
    ...mapMutations(['setShowLoader']),
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
            this.billing_address = res?.data?.customer?.billing_address ?? ''
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
    async fetchProducts(customerObj) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.setShowLoader(true)
      await this.$axios
        .post(
          'service/list',
          { company: this.companySelection.map((item) => item.id) },
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          // res.data.products
          this.products = res.data.data.products
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

    handleAddProduct() {
      let obj = {
        id: Math.random(),
        service: '',
        service_name: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        description: '',
        vat_rate: 0,
        vat_amount: 0,
        net_total: 0,
      }
      this.table_products.push(obj)
    },

    //fn to handle changes of table_products
    handleProduct(value, rowIndex, productKey) {
      let tempProducts = JSON.parse(JSON.stringify(this.table_products))

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

      this.table_products = tempProducts
    },

    //fn to prefill product table values on selecting a product from dropdown
    handlePrefillProductValues(value, rowIndex) {
      let tempProducts = this.table_products
      console.log('product prefill', value)
      tempProducts = tempProducts.map((item, index) => {
        if (index === rowIndex) {
          return {
            ...item,
            quantity: 1,
            rate: value.price,
            amount: value.price,
            type: 'Product',
            date: new Date().toISOString().substr(0, 10),
            isInventory: value.isInventory,
            vat_rate: value.tax_code.rate,
            vat_amount: (value.price / 100) * value.tax_code.rate,
            net_total: value.price + (value.price / 100) * value.tax_code.rate,
          }
        }
        return item
      })
      this.table_products = tempProducts
    },
    handleDeleteProduct(id) {
      this.table_products = this.table_products.filter(
        (el, index) => el.id !== id
      )
    },
    handleViewEstimate() {
      this.$refs.estimateForm.validate()
      console.log('validate', this.$refs.estimateForm.validate())
      if (
        this.$refs.estimateForm.validate() &&
        this.table_products.every(
          (item) => item.service_name !== '' && this.table_products.length >= 1
        )
      ) {
        this.view_estimate = true
      }
    },
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
.estimate__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  width: 400px;
  height: 120px;
}
</style>
