<template lang="">
  <div class="row">
    <v-row class="row2" v-if="!add_new_supplier_pop">
      <v-col sm="12" md="12" lg="12">
        <v-card color="card_bg" id="card">
          <v-card-text id="card-text" style="margin-top: 0 !important">
            <v-data-table
              class="main__table elevation-0"
              :v-model="suppliers_data"
              :headers="suppliers_headers"
              :items="suppliers_data"
              hide-default-footer
            >
              <template v-slot:top>
                <div class="top__con">
                  <v-text-field
                    class="search_bar"
                    label="Search By"
                    color="outline"
                    outlined
                    solo
                    flat
                    hide-details
                    dense
                    height="45px"
                  >
                    <template slot="prepend-inner">
                      <v-btn icon><v-icon small>fa-search</v-icon></v-btn>
                    </template>
                  </v-text-field>
                  <div class="action__btn">
                    <v-btn
                      class="tall__btn text_light--text"
                      color="primary"
                      @click="handleOpenCloseAddSupplierPop"
                    >
                      Add Supplier
                    </v-btn>
                    <v-btn
                      class="tall__btn ml-2 subtext--text"
                      color="subtext"
                      outlined
                      @click="filterDialog = true"
                    >
                      <v-icon class="mr-2" small>fa-filter</v-icon>
                      Filter
                    </v-btn>
                  </div>
                </div>
              </template>
              <template v-slot:item="{ item, index }">
                <tr style="">
                  <td class="pa-0 ma-0">{{ item.company_name }}</td>
                  <td class="pa-0 ma-0">{{ item.bank_account }}</td>
                  <td class="pa-0 ma-0">{{ item.email }}</td>
                  <td class="pa-0 ma-0">{{ item.phone }}</td>
                  <td class="pa-0 ma-0" style="width: 150px">
                    <div class="actions__con">
                      <span class="print primary--text">Create Expense</span>
                      <v-btn color="subtext" icon
                        ><v-icon small
                          >fa-solid fa-ellipsis-vertical</v-icon
                        ></v-btn
                      >
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="row1" v-else>
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: 80vh !important">
          <v-card-title id="card-title">
            <h4>Supplier Information</h4>
            <div class="d-flex" style="gap: 10px">
              <v-btn
                class="tall__btn px-9"
                color="primary"
                outlined
                min-width="150px"
                @click="handleCloseAddSupplier"
              >
                Cancel
              </v-btn>
              <v-btn
                class="tall__btn px-9"
                color="primary"
                min-width="150px"
                @click="handleOpenCloseAddSupplierPop"
              >
                Save
              </v-btn>
            </div>
          </v-card-title>
          <v-divider id="divider" class="my-5"></v-divider>
          <v-card-text id="card-text">
            <v-row class="py-0 my-0 align-start">
              <v-col cols="12" md="6" class="pa-0">
                <v-row class="mb-0 py-0 my-0">
                  <v-col cols="4" md="4">
                    <CustomInputContainer label="First Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter First Name"
                          outlined
                          v-model="supplier.primary_contact.first_name"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4" md="4">
                    <CustomInputContainer label="Middle Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Middle Name"
                          outlined
                          v-model="supplier.primary_contact.middle_name"
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="4" md="4">
                    <CustomInputContainer label="Last Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Last Name"
                          outlined
                          hide-details
                          v-model="supplier.primary_contact.last_name"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Company Name">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Company Name"
                          outlined
                          hide-details
                          v-model="supplier.company_name"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Company">
                      <div slot="input">
                        <v-select
                          placeholder="Select Company"
                          return-object
                          outlined
                          v-model="supplier.company"
                          item-text="name"
                          item-value="id"
                          :items="companies"
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Account No.">
                      <div slot="input">
                        <v-select
                          placeholder="Select Account No."
                          return-object
                          v-model="supplier.bank_account"
                          :items="accountLIst"
                          item-text="name"
                          item-value="_id"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Nickname">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Nickname"
                          outlined
                          hide-details
                          v-model="supplier.nick_name"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>

                  <v-col cols="12" class="mb-0 pb-0">
                    <CustomInputContainer label="Address">
                      <div slot="input">
                        <v-textarea
                          placeholder="Enter address"
                          outlined
                          v-model="supplier.address"
                          dense
                          style="min-width: 23vw !important"
                        ></v-textarea>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12" md="6" class="pa-0">
                <v-row class="mb py-0 my-0">
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Email">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Email"
                          outlined
                          hide-details
                          v-model="supplier.email"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Phone">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Phone"
                          outlined
                          hide-details
                          v-model="supplier.phone"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Mobile">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Mobile"
                          outlined
                          hide-details
                          v-model="supplier.mobile"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="6">
                    <CustomInputContainer label="Fax">
                      <div slot="input">
                        <v-text-field
                          placeholder="Enter Fax"
                          outlined
                          hide-details
                          v-model="supplier.fax"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="Website URL">
                      <div slot="input">
                        <v-text-field
                          placeholder="http://"
                          outlined
                          hide-details
                          v-model="supplier.website"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="6">
                    <CustomInputContainer label="TRN">
                      <div slot="input">
                        <v-text-field
                          placeholder=" "
                          outlined
                          hide-details
                          v-model="supplier.trn_number"
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12">
                    <CustomInputContainer label="Note">
                      <div slot="input">
                        <v-textarea
                          placeholder="Enter note"
                          outlined
                          dense
                          style="min-width: 23vw !important"
                        ></v-textarea>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'

export default {
  components: {
    TotalsCard,
    CustomInputContainer,
  },
  props: [
    'companies',
    'accountLIst',
    'supplierCustomers',
    'taxCodes',
    'vatCodes',
  ],
  computed: {
    ...mapState(['companySelection']),
  },
  mounted() {
    this.fetchSuppliers()
  },
  data() {
    return {
      add_new_supplier_pop: false,
      // Suppliers
      suppliers_search: '',
      suppliers_selected: [],
      total_count: 0,
      total_page: 1,
      suppliers_data: [
        // {
        //   id: 0,
        //   supplier: 'Globex Corp',
        //   phone: '+97 52 365 9885',
        //   email: 'contact@globexcorp.com',
        //   color: '#1AD598',
        //   action: '',
        // },
        // {
        //   id: 1,
        //   supplier: ' Corp',
        //   phone: '+97 52 365 9885',
        //   email: 'contact@globexcorp.com',
        //   color: '#1AD598',
        //   action: '',
        // },
      ],
      suppliers_headers: [
        { text: 'Supplier/Company', value: 'company_name' },
        { text: 'Bank Account', value: 'bank_account' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      total_suppliers: [
        { name: 'Purchase Order (15)', amount: '0' },
        { name: 'Overdue (10)', amount: '0' },
        { name: 'Open bill (5)', amount: '0' },
        { name: '1 Paid in the last 30 days (15)', amount: '0' },
      ],
      supplier: {
        company_name: '',
        primary_contact: {
          first_name: '',
          middle_name: '',
          last_name: '',
        },
        bank_account: '',
        nick_name: '',
        email: '',
        phone: '',
        website: '',
        mobile: '',
        fax: '',
        address: '',
        documents: [],
        company: '',
        trn_number: '',
      },
    }
  },
  methods: {
    ...mapMutations(['setShowLoader']),
    handleCloseAddSupplier() {
      this.add_new_supplier_pop = false
    },
    async fetchSuppliers() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.setShowLoader(true)
      await this.$axios
        .$post(
          'supplier/all?search=&limit=100&page=0',
          { company: this.companySelection.map((item) => item.id) },
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          this.suppliers_data = res.data.suppliers
          this.total_count = res.data.total_count
          this.total_page = res.data.total_page
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to load Suppliers.',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
        .finally(() => {
          this.setShowLoader(false)
        })
    },
    async handleOpenCloseAddSupplierPop() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.setShowLoader(true)
      await this.$axios
        .$post(
          `/supplier`,
          { ...this.supplier, bank_account: this.supplier.bank_account._id },
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then(async (res) => {
          this.$nuxt.$emit('supplierAddFormSubmitted', true)
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
        .finally(() => {
          this.add_new_supplier_pop = !this.add_new_supplier_pop
          this.setShowLoader(false)
          this.fetchSuppliers()
        })
    },
  },
}
</script>
<style lang="scss"></style>
