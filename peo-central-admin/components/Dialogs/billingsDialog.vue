<template>
  <!-- Billings  Dialog -->
  <v-dialog
    id="custom_dialog"
    v-model="dialogData"
    persistent
    width="45vw"
    height="100vh"
    content-class="proposal_dialog"
  >
    <div class="dialog_proposal">
      <v-card flat style="height: 100vh !important">
        <v-row>
          <v-col cols="12" class="ma-0 pa-0">
            <div
              class="tw-flex tw-items-center tw-justify-between tw-py-3 tw-px-3"
            >
              <v-card-title class="py-0">
                <v-img
                  src="/shift/build.svg"
                  max-width="fit-content"
                  height="fit-content"
                  class="mr-2"
                  contain
                ></v-img>
                <span
                  class="darkBlue-heading-text font-weight-normal subHeadingFontSize"
                >
                  {{
                    clickedButton == 'debit_note'
                      ? 'Debit Note'
                      : 'Manage Products'
                  }}</span
                >
              </v-card-title>
              <div
                v-if="clickedButton == 'debit_note'"
                class="d-flex align-center justify-end"
              >
                <v-btn
                  class="tall__btn mr-4 pl-6 pr-6 span_data"
                  color="subtext"
                  outlined
                  @click="close()"
                >
                  <span class="">Cancel</span>
                </v-btn>
                <v-btn
                  class="tall__btn pl-6 pr-6 span_data"
                  color="primary"
                  @click="handleButtonClick()"
                  >{{
                    clickedButton == 'debit_note' ? 'Create' : 'Add Products'
                  }}</v-btn
                >
              </div>

              <div v-else>
                <v-btn icon color="red" outlined @click="close()">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-divider></v-divider>

        <div
          v-if="clickedButton == 'products'"
          class="tw-px-5 tw-py-5 tw-flex tw-justify-end"
        >
          <v-btn
            class="tall__btn pl-6 pr-6 span_data"
            color="primary"
            @click="handleButtonClick()"
            >{{ 'Add Products' }}</v-btn
          >
        </div>
        <v-container class="ma-0 tw-px-5 tw-py-10">
          <div v-if="clickedButton == 'debit_note'">
            <v-row class="pt-0">
              <v-col cols="4" class="pl-0 pb-0">
                <CustomInputContainer label="Employer" :mandatory="true">
                  <template v-slot:input>
                    <v-autocomplete
                      :items="employers"
                      v-model="invoiceObj.customer"
                      placeholder="Current Company"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      item-text="company_name"
                      item-value="_id"
                      :rules="main_rule"
                      v-if="employers.length >= 1"
                      append-icon="fa-chevron-down"
                      @change="getCompanyInvoices(invoiceObj.customer)"
                    >
                    </v-autocomplete>
                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Company
                    </p>
                  </template>
                </CustomInputContainer>
                <CustomInputContainer label="Invoice">
                  <div slot="input">
                    <v-select
                      v-model="selectedInvoice"
                      :items="invoiceList"
                      placeholder="Select Invoices"
                      class="proposalDialog_date_field2"
                      return-object
                      solo
                      dense
                      item-text="invoice_number"
                      item-value="_id"
                      :rules="main_rule"
                      append-icon="fa-chevron-down"
                      @change="getInvoiceDetails(selectedInvoice._id)"
                    >
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="12" lg="12" class="pl-0">
                <div style="width: 35%">
                  <CustomInputContainer label="Deposit Amount">
                    <div slot="input">
                      <v-text-field
                        v-model="invoiceObj.items[0].amount"
                        placeholder="Enter amount"
                        class="proposalDialog_date_field2"
                        hide-details
                        solo
                        dense
                        :rules="main_rule"
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </div>
              </v-col>
              <v-col cols="12" class="pl-0">
                <CustomInputContainer label="Description">
                  <div slot="input">
                    <v-textarea
                      v-model="invoiceObj.items[0].service_name"
                      placeholder="Enter Description"
                      solo
                      hide-details
                      class="proposalDialog_date_field2"
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </div>
          <div v-if="clickedButton == 'products'">
            <v-container fluid>
              <v-data-table
                id="coa_table"
                :headers="products_headers"
                bordered
                :items="productsAndServices"
                :loading="fetch_loading"
                :loading-text="'loading products ... please wait'"
                :items-per-page="15"
                :hide-default-footer="true"
              >
                <template v-slot:item.actions="{ item }">
                  <div class="tw-flex tw-gap-3">
                    <v-btn
                      outlined
                      color="primary"
                      @click="handleProductUpdate(item)"
                      >Edit</v-btn
                    >
                    <v-btn icon outlined color="red" @click="handleRemoveProduct(item)">
                      <v-icon> mdi-trash-can </v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-container>

            <!-- <v-simple-table dense class="dynamic_table">
              <template v-slot:default>
                <thead class="dynamic_table_thead">
                  <tr style="height: 48px !important; background-color: #f5f5f5;">
                    <th class="text-center text--text font-weight-bold" style="font-size: 14px; width: 5%;">
                      #
                    </th>
                    <th class="text-center text--text font-weight-bold" style="font-size: 14px;">
                      Product/Service Name
                    </th>
                    <th class="text-center text--text font-weight-bold" style="font-size: 14px;">
                      Description
                    </th>
                    <th class="text-center text--text font-weight-bold" style="font-size: 14px; width: 80px;">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="dynamic_table_tbody" v-for="(product, index) in productsAndServices" :key="index">
                  <tr class="dynamic_table_body_rows">
                    <td class="py-3 text-center" style="width: 5%;">
                      {{ index + 1 }}
                    </td>
                    <td class="py-3 text-center" style="min-width: 150px;">
                      <span v-if="!product.isEditing">{{ product?.name }}</span>
                      <v-text-field
                        v-else
                        class="rounded-lg"
                        placeholder="Enter Product/Service"
                        solo
                        flat
                        hide-details
                        v-model="product.name"
                        height="45"
                        @input="validateAndSave"
                      />
                    </td>
                    <td class="py-3 text-center" style="min-width: 300px;">
                      <span v-if="!product.isEditing">{{ product?.description }}</span>
                      <v-textarea
                        v-else
                        class="rounded-lg"
                        placeholder="Enter Description"
                        solo
                        flat
                        hide-details
                        v-model="product.description"
                        rows="3"
                        auto-grow
                        style="font-size: 14px;"
                        height="85"
                        @input="validateAndSave"
                      />
                    </td>
                    <td class="py-3 text-center" style="width: 80px;">
                      <v-btn
                        icon
                        color="error"
                        @click="toggleEdit(index, product.isEditing)"
                      >
                        <v-icon color="error">{{ product.isEditing ? 'fa-solid fa-check' : 'fa-solid fa-pencil' }}</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="product.isEditing"
                        icon
                        color="error"
                        @click="handleDeleteProduct(index)"
                      >
                        <v-icon color="error">fa-light fa-trash-can</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                  <tr :key="`spacer-${index}`" class="spacer-row" @click="handleAddProductAt(index + 1)"
                    style="height: 12px; cursor: pointer; background-color: #f8f9fa;">
                    <td colspan="100%" class="hover-area"></td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table> -->

            <!-- <v-container fluid v-else> </v-container> -->
          </div>
        </v-container>
      </v-card>
    </div>
    <DialogsAddProducts
      :open="show_add_product"
      :products="productsAndServices"
      :is_edit="is_edit"
      :product="selectedProduct"
      :is_deleting="is_deleting"
      @reload="fetchProducts"
      @close="handleAddClose"
    />
  </v-dialog>
</template>

<script>
import '@/assets/scss/utils/_invoiceTable.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'

export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    FileDropzone,
  },
  props: {
    dialogData: Boolean,
    clickedButton: String,
  },
  data() {
    return {
      isEditing: false,
      edit: false,
      is_edit: false,
      is_deleting: false,
      employersList: ['Binance', 'Coke', 'EirBlue', 'Fly Dubai'],
      paymentMethods: ['Bank', 'Cash', 'Other'],
      show_add_product: false,

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
      products_headers: [
        {
          text: 'Product/Service Name',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        { text: 'Description', value: 'description', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      selectedProduct: {},
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      phone_rule: [],
      invoiceList: [],
      products: [
        {
          name: '',
          description: '',
        },
      ],
      main_rule: [(v) => !!v || 'Field is required'],
      isSaving: false,
      defaultProduct: {
        name: '',
        description: '',
      },
      newProduct: {
        name: '',
        description: '',
      },
      productsAndServices: [],
      selectedInvoice: {},
      selectedCompany: {},
      companyList: [],
      employers: [],
      selectedInvoiceDetails: [],
      invoiceObj: {
        customer: '',
        invoice: '',
        branch: 'test',
        reference: 'test',
        created_date: '',
        debit_note_date: '',
        due_date: '',
        sale_person: 'jui',
        subject: 'test',
        notes: 'test',
        terms: '',
        terms_name: '',
        items: [
          {
            date: new Date().toISOString().substr(0, 10),
            service_name: '',
            amount: 0,
          },
        ],
        sub_total: 0,
        vat_total: 0,
        total: 0,
        fetch_loading: false
      },
    }
  },
  watch: {
    dialogData(val) {
      if (val) {
        this.fetchProducts()
        this.getEmployersList()
        if (this.products.length === 0) {
          this.products.push({ ...this.defaultProduct })
        }
      }
    },
  },
  mounted() {
    this.fetchProducts()
    this.getEmployersList()
    if (this.products.length === 0) {
      this.products.push({ ...this.defaultProduct })
    }
  },
  beforeDestroy() {
    this.validateAndSave()
  },
  methods: {
    handleAddClose() {
      this.show_add_product = false
      this.is_edit = false
      this.is_deleting = false
    },
    handleRemoveProduct(item) {
      this.selectedProduct = item
      this.is_deleting = true
      this.show_add_product = true
    },
    toggleEdit(index, isEditing) {
      this.productsAndServices[index].isEditing = !isEditing
    },
    async fetchProducts() {
      try {
        this.fetch_loading = true
        const response = await this.$axios.get(
          'configuration/?q=products_and_services',
          {
            headers: { Authorization: `Bearer ${this.$store.state.token}` },
          }
        )
        this.productsAndServices =
          response.data.data[0].products_and_services.map((product) => ({
            ...product,
            isEditing: false,
          }))
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        this.fetch_loading = false
      }
    },
    close() {
      this.$emit('close')
    },
    async getInvoiceList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`/invoice`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.invoiceList = response
        })
    },
    async getInvoiceDetails(invoice_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/invoice/id/${invoice_id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.selectedInvoiceDetails = response

          this.invoiceObj.invoice = this.selectedInvoice._id
          this.invoiceObj.customer = this.selectedInvoiceDetails[0].customer
          this.invoiceObj.created_date = new Date().toISOString().substr(0, 10)
          this.invoiceObj.debit_note_date = new Date()
            .toISOString()
            .substr(0, 10)
          this.invoiceObj.due_date =
            this.selectedInvoiceDetails[0].due_date.substr(0, 10)
          this.invoiceObj.terms = this.selectedInvoiceDetails[0].terms
          this.invoiceObj.terms_name = this.selectedInvoiceDetails[0].terms_name
          this.invoiceObj.sub_total = this.selectedInvoiceDetails[0].sub_total
          this.invoiceObj.vat_total = this.selectedInvoiceDetails[0].vat_total
          this.invoiceObj.total = this.selectedInvoiceDetails[0].total
        })
    },
    async createDebitNote() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`/invoice/create/debit-note`, this.invoiceObj, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.close()
          this.clearFields()
        })
    },
    handleProductUpdate(item) {
      this.selectedProduct = item
      this.is_edit = true
      this.show_add_product = true
    },
    async handleButtonClick() {
      if (this.clickedButton === 'debit_note') {
        await this.createDebitNote()
      } else {
        this.show_add_product = true
        // await this.saveProducts()
      }
    },
    handleDeleteProduct(index) {
      if (
        this.products.length === 1 &&
        !this.products[0].name &&
        !this.products[0].description
      ) {
        return
      }
      if (this.products.length === 1) {
        this.products = [{ ...this.defaultProduct }]
        return
      }
      this.products.splice(index, 1)

      if (this.products.length === 0) {
        this.products.push({ ...this.defaultProduct })
      }

      // Trigger validation
      this.validateAndSave()
    },
    clearFields() {
      this.invoiceObj = {
        customer: '',
        invoice: '',
        branch: 'test',
        reference: 'test',
        created_date: '',
        debit_note_date: '',
        due_date: '',
        sale_person: 'jui',
        subject: 'test',
        notes: 'test',
        terms: '',
        terms_name: '',
        items: [
          {
            date: new Date().toISOString().substr(0, 10),
            service_name: '',
            amount: 0,
          },
        ],
        sub_total: 0,
        vat_total: 0,
        total: 0,
      }

      this.selectedInvoice = {}
      this.selectedInvoiceDetails = []
    },
    async getEmployersList() {
      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        const response = await this.$axios.$post(
          `/companies/list/filter/search?page=1&limit=100000`,
          { search: '' },
          {
            headers: { Authorization: AuthStr },
          }
        )
        this.employers = response
      } catch (error) {
        console.error('Error fetching employers list:', error)
      }
    },
    async getCompanyInvoices(company_id) {
      console.log('What is the company id', company_id)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        let list = await this.$axios.$post(
          `/invoice/list?page=1&limit=1000`,
          {
            company_id: company_id,
          },
          { headers: { Authorization: AuthStr } }
        )
        this.invoiceList = list.results
      } catch (error) {
        throw new Error(error)
      }
    },
    handleAddProductAt(index) {
      this.productsAndServices.splice(index, 0, {
        name: '',
        description: '',
        isEditing: true,
      })
    },
    validateAndSave() {
      this.products = this.products.filter((product, index) => {
        return (
          index === this.products.length - 1 ||
          product.name.trim() !== '' ||
          product.description.trim() !== ''
        )
      })
    },
    async saveProducts() {
      try {
        this.isSaving = true

        // const productNames = this.products
        //   .filter((product) => product.name.trim() !== '')
        //   .map((product) => product.name.trim())
        const products = this.productsAndServices.map((pr) => {
          return { name: pr.name, description: pr.description }
        })

        products.push(this.newProduct)
        if (products.length === 0) {
          this.$notify({
            type: 'error',
            text: 'Please add at least one product name',
          })
          return
        }

        await this.$axios.put('configuration/update/products/and/services', {
          products_and_services: products,
        })
      } catch (error) {
        console.error('Error saving products:', error)
      } finally {
        this.isSaving = false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
// .dynamic_table {
//   .dynamic_table_thead {
//     tr {
//       background: #e2e7f180 !important;
//     }
//   }

//   .dynamic_table_tbody {
//     .dynamic_table_body_rows {
//       // border-bottom: 0.5 solid red !important;
//       &:hover {
//         background: #e2e7f142 !important;
//       }
//     }
//   }
// }

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

.v-data-table {
  background: white !important;
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table ::v-deep tr {
  border-left: 5px solid #000;
}

.v-data-table ::v-deep th {
  background-color: #f8fafc !important;
  color: #1f2937 !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.v-data-table ::v-deep td {
  white-space: nowrap;
  font-size: 0.875rem;
}

.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.v-data-table ::v-deep .v-data-footer {
  border-top: 1px solid #e5e7eb;
}
</style>
