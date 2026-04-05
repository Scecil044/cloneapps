<template>
  <v-card id="card" style="margin-bottom: 1rem !important">
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="5" offset-md="7">
          <div
            class="d-flex align-center justify-space-between"
            style="gap: 2rem"
          >
            <h6 class="text-h5 font-weight-bold">Amount 10,588</h6>
            <v-btn
              class="tall__btn px-9"
              color="white"
              style="border: 1px solid #e2e7f1 !important"
              min-width="150px"
            >
              Make Recurring</v-btn
            >
            <v-btn
              class="tall__btn px-9"
              color="primary"
              min-width="150px"
              @click="handleProceedToView"
            >
              Proceed to preview</v-btn
            >
          </div>
        </v-col>
      </v-row>
      <v-row class="not_recurring_row_3 py-0 my-0" style="gap: 20px">
        <v-form
          ref="salesReceiptForm"
          v-model="valid"
          lazy-validation
          class="row"
        >
          <v-col cols="12" class="px-0" style="height: fit-content">
            <v-row>
              <v-col cols="3">
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
              <v-col cols="3">
                <CustomInputContainer label="Email" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="customer_email"
                      placeholder="Enter Email"
                      outlined
                      dense
                      :rules="emailRules"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- <v-col cols="3">
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
              </v-col> -->
              <v-col cols="3">
                <CustomInputContainer label="Payment Method" :mandatory="true">
                  <div slot="input">
                    <v-autocomplete
                      v-model="payment_method"
                      :items="payment_items"
                      placeholder="Enter Payment Method"
                      return-object
                      outlined
                      dense
                      :rules="main_rule"
                      append-icon="fa-chevron-down"
                    ></v-autocomplete>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="3">
                <CustomInputContainer label="Billing Address" :mandatory="true">
                  <div slot="input">
                    <v-textarea
                      v-model="billing_address"
                      placeholder="Enter Billing Address"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="3">
                <CustomInputContainer
                  label="Sales Receipt Date"
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
                          v-model="receipt_date"
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
                        v-model="receipt_date"
                        @input="date_menu = false"
                      />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="3">
                <CustomInputContainer label="Reference No." :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      placeholder="Enter Reference No."
                      outlined
                      dense
                      v-model="reference_no"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="3">
                <CustomInputContainer label="Deposit to" :mandatory="true">
                  <div slot="input">
                    <v-autocomplete
                      v-model="depositTo"
                      :items="accountList"
                      item-text="name"
                      placeholder="Enter Deposit to"
                      return-object
                      outlined
                      dense
                      :rules="main_rule"
                      append-icon="fa-chevron-down"
                    ></v-autocomplete>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="3">
                <CustomInputContainer label="Amounts are" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      placeholder="Enter Amounts"
                      outlined
                      dense
                      v-model="amounts"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-simple-table dense class="dynamic_table mt-4 mb-10">
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
                      <!-- <v-text-field
                        class="rounded-lg"
                        placeholder="Enter Service Date"
                        solo
                        flat
                        hide-details
                        dense
                        :value="item.service_date"
                      /> -->
                      <v-menu
                        v-model="date_menu2"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="service_date"
                            placeholder="Enter Date"
                            class="rounded-lg"
                            flat
                            solo
                            dense
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            :rules="main_rule"
                            hide-details
                          />
                        </template>
                        <v-date-picker
                          v-model="service_date"
                          @input="date_menu2 = false"
                        />
                      </v-menu>
                    </td>
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
                        :value="item?.tax ?? 0.0"
                      />
                    </td>
                    <td class="py-2 text-center">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="subtext"
                        class="mx-2"
                        icon
                      >
                        <v-icon small
                          >fa-solid fa-ellipsis-vertical</v-icon
                        ></v-btn
                      >
                    </td>
                  </tr>
                </tbody>
                <!-- <tfoot>
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
                </tfoot> -->
              </template>
            </v-simple-table>
          </v-col>
          <v-col cols="3">
            <CustomInputContainer label="Message on invoice" :mandatory="true">
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
          <v-col cols="3">
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
          <v-col cols="6">
            <div class="total__container2 d-flex flex-wrap">
              <div class="text--text font-weight-bold mb-2 total">
                <span>Sub Total</span>
                <span>00.00</span>
              </div>
              <div class="text--text font-weight-bold mb-2 total">
                <span>Balance Due</span>
                <span>00.00</span>
              </div>
              <div class="text--text font-weight-bold total">
                <span>Total</span>
                <span>00.00</span>
              </div>
            </div>
          </v-col>
        </v-form>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    SnackBar,
  },
  computed: {
    ...mapState(['companySelection']),
    ...mapGetters(['getCustomers']),
    // SubTotal() {
    //   return this.table_products
    //     .map((item) => parseFloat(item?.amount ?? 0))
    //     .reduce((partial, acc) => partial + acc, 0)
    // },
    // VATAmount() {
    //   return this.table_products
    //     .map((item) => parseFloat(item?.vat_amount ?? 0))
    //     .reduce((partial, acc) => partial + acc, 0)
    // },
    // Total() {
    //   return this.table_products
    //     .map((item) => parseFloat(item?.net_total ?? 0))
    //     .reduce((partial, acc) => partial + acc, 0)
    // },
  },
  watch: {
    companySelection: {
      handler(newVal) {
        this.fetchProducts(newVal)
      },
      deep: true,
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
      emailRules: [
        (v) => !!v || 'This field is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      valid: true,
      customer_id: '',
      customer: '',
      customer_email: '',
      billing_address: '',
      sale_location: '',
      payment_items: ['Credit', 'cheque', 'cash'],
      payment_method: '',
      date_menu: false,
      receipt_date: new Date().toISOString().substr(0, 10),
      reference_no: '',
      accountList: [],
      depositTo: '',
      amounts: '',
      customer_note: '',
      customer_statement: '',
      table_headers: [
        'Service Date',
        'Products/Service',
        'Description',
        'Qty',
        'Rate',
        'Amount',
        'Tax',
        'actions',
      ],
      table_products: [
        {
          id: Math.random(),
          service_date: '',
          service_name: '',
          description: '',
          quantity: 0,
          rate: 0,
          amount: 0,
          tax: 0,
        },
      ],
      date_menu2: false,
      products: [],
    }
  },
  mounted() {
    this.fetchAccountList()
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
    async fetchAccountList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `account/list`,
          { company: this.companySelection.map((item) => item.id) },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { accounts } = res.data
          this.accountList = accounts
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
    handleProceedToView() {
      this.$refs.salesReceiptForm.validate()
      // console.log('validate', this.$refs.estimateForm.validate())
      // if (
      //   this.$refs.estimateForm.validate() &&
      //   this.table_products.every(
      //     (item) => item.service_name !== '' && this.table_products.length >= 1
      //   )
      // ) {
      //   this.view_estimate = true
      // }
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
  },
}
</script>

<style lang="scss">
.total__container2 {
  width: 500px;
  margin-left: auto;
}
.total {
  display: flex;
  justify-content: space-between;
  width: 48%;
  margin: 10px 1%;
  padding: 10px;
  background-color: #f9fafc;
  border: 1px solid #ced6e3;
  border-radius: 10px;
  &:last-of-type {
    width: 100%;
  }
  span {
    font-weight: bold !important;
  }
}
</style>
