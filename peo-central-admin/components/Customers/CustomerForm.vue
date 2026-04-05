<template>
  <v-col sm="12" md="8" lg="8">
    <v-card
      color="card_bg"
      class="carddd"
      id="card"
      style="max-height: 90vh !important; overflow: auto"
      v-if="customer"
    >
      <v-card-title id="card-title">
        <h4 class="text--text">
          {{ type == 'edit' ? 'Editing' : 'New' }} Customer
        </h4>
        <div class="flex_row">
          <v-btn
            class="tall__btn mr-3"
            color="subtext"
            outlined
            @click="handleCloseCustomerForm"
          >
            {{ type === 'edit' ? 'Cancel Changes' : 'Cancel' }}
          </v-btn>
          <v-btn class="tall__btn" color="primary" @click="submit">
            {{ type === 'edit' ? 'Save Changes' : 'Add' }}
          </v-btn>
        </div>
      </v-card-title>
      <v-divider id="divider" class="mx-0 px-0 mt-5"></v-divider>
      <v-card-text id="card-text" style="margin-top: 0 !important">
        <v-form ref="customerForm" class="mt-9" v-model="valid">
          <!-- customer type -->
          <div class="d-flex">
            <CustomInputContainer label="Company" v-if="companyLable">
              <div slot="input">
                <v-select
                  v-model="selectedCompany2"
                  :items="companies"
                  item-text="name"
                  item-value="id"
                  placeholder="select company"
                  dense
                  outlined
                  @change="emitSelected"
                  style="min-width: 15vw !important"
                ></v-select>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Company" v-else>
              <div slot="input">
                <v-text-field
                  v-model="companyName"
                  placeholder="Company"
                  outlined
                  dense
                  readonly
                  disabled
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <v-radio-group
              v-model="customer.is_business"
              row
              dense
              hide-details=""
              mandatory
              class="ml-7"
            >
              <template v-slot:label>
                <strong class="text--text mr-3">Customer Type:</strong>
              </template>
              <v-radio :value="true">
                <template v-slot:label>
                  <span class="text--text">Business</span>
                </template>
              </v-radio>
              <v-radio :value="false">
                <template v-slot:label>
                  <span class="text--text">Individual</span>
                </template>
              </v-radio>
            </v-radio-group>
          </div>
          <!-- customer name+email+phone -->
          <div class="flex_row mt-9">
            <CustomInputContainer label="Name" class="required">
              <div slot="input">
                <v-text-field
                  placeholder="Enter name"
                  outlined
                  dense
                  :rules="nameRules"
                  required
                  style="min-width: 15vw !important"
                  v-model="customer.customer_name"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Email" class="ml-4">
              <div slot="input">
                <v-text-field
                  placeholder="Enter e-mail"
                  outlined
                  dense
                  type="email"
                  style="min-width: 15vw !important"
                  required
                  :rules="emailValid"
                  v-model="customer.email"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Phone" class="ml-4">
              <div slot="input">
                <v-text-field
                  placeholder="Enter phone number"
                  outlined
                  dense
                  :rules="phoneValid"
                  style="min-width: 15vw !important"
                  v-model="customer.phone"
                ></v-text-field>
              </div>
            </CustomInputContainer>
          </div>
          <!-- primary contact name+email+phone -->
          <div class="flex_row mt-3">
            <CustomInputContainer label="Primary Contact" class="required">
              <div slot="input">
                <v-text-field
                  v-model="customer.primary_contact.name"
                  placeholder="Enter primary contact name"
                  outlined
                  dense
                  :rules="nameRules"
                  required
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Email" class="ml-4 required">
              <div slot="input">
                <v-text-field
                  v-model="customer.primary_contact.email"
                  placeholder="Enter primary contact e-mail"
                  outlined
                  dense
                  type="email"
                  :rules="emailRules"
                  required
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Phone" class="ml-4 required">
              <div slot="input">
                <v-text-field
                  v-model="customer.primary_contact.phone"
                  placeholder="Enter primary contact phone number"
                  outlined
                  dense
                  :rules="phoneRules"
                  required
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <v-tooltip top v-if="additionalContact == false">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="ml-3"
                  color="primary"
                  small
                  icon
                  @click="additionalContact = true"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon x-small color="primary">fa-plus</v-icon>
                </v-btn>
              </template>
              <span>Add Additional Contact</span>
            </v-tooltip>
          </div>
          <!-- additional contact -->
          <div class="flex_row mt-3" v-if="additionalContact">
            <CustomInputContainer label="Additional Contact">
              <div slot="input">
                <v-text-field
                  v-model="customer.additional_contact.name"
                  placeholder="Enter contact name"
                  outlined
                  dense
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Email" class="ml-4">
              <div slot="input">
                <v-text-field
                  v-model="customer.additional_contact.email"
                  placeholder="Enter contact e-mail"
                  outlined
                  dense
                  type="email"
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Phone" class="ml-4">
              <div slot="input">
                <v-text-field
                  v-model="customer.additional_contact.phone"
                  placeholder="Enter primary contact phone number"
                  outlined
                  dense
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="ml-3"
                  color="red"
                  small
                  icon
                  @click="additionalContact = false"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon x-small color="red">fa-minus</v-icon>
                </v-btn>
              </template>
              <span>Remove Additional Contact</span>
            </v-tooltip>
          </div>
          <!-- trn box -->
          <div class="flex_row mt-3">
            <CustomInputContainer label="VAT TRN">
              <div slot="input">
                <v-text-field
                  v-model="customer.trn_number"
                  placeholder="Enter customer VAT TRN"
                  outlined
                  dense
                  type="number"
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Lead Source" class="ml-4">
              <div slot="input">
                <v-text-field
                  v-model="customer.lead_source"
                  placeholder="Enter lead source"
                  outlined
                  dense
                  style="min-width: 15vw !important"
                ></v-text-field>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Currency" class="ml-4">
              <div slot="input">
                <v-select
                  v-model="customer.currency"
                  :items="all_currency"
                  placeholder="select currency"
                  dense
                  outlined
                  style="min-width: 15vw !important"
                ></v-select>
              </div>
            </CustomInputContainer>
          </div>
          <div class="flex_row mt-3">
            <CustomInputContainer label="Payment Terms">
              <div slot="input">
                <v-select
                  v-model="customer.terms"
                  :items="all_terms"
                  item-text="name"
                  item-value="_id"
                  placeholder="Terms"
                  dense
                  outlined
                  @input="configureTerms"
                  :style="
                    type === 'edit'
                      ? 'width: 23vw !important'
                      : 'width: 15vw !important'
                  "
                ></v-select>
              </div>
            </CustomInputContainer>
            <CustomInputContainer
              label="Documents"
              class="ml-4"
              v-if="type != 'edit'"
            >
              <div slot="input">
                <v-file-input
                  v-model="documents"
                  placeholder="Upload all customer documents here"
                  outlined
                  dense
                  style="min-width: 15vw !important"
                  multiple
                  prepend-icon=""
                  append-icon="fa-file"
                >
                  <template v-slot:selection="{ text }">
                    <v-chip small label color="outline">
                      {{ text }}
                    </v-chip>
                  </template>
                </v-file-input>
              </div>
            </CustomInputContainer>
            <CustomInputContainer label="Logo" class="ml-4">
              <div slot="input">
                <v-file-input
                  v-model="logo"
                  placeholder="Upload Logo here"
                  outlined
                  dense
                  required
                  :style="
                    type === 'edit'
                      ? 'width: 23vw !important'
                      : 'width: 15vw !important'
                  "
                  prepend-icon=""
                  append-icon="fa-paperclip"
                >
                  <template v-slot:selection="{ text }">
                    <v-chip small label color="outline">
                      {{ text }}
                    </v-chip>
                  </template>
                </v-file-input>
              </div>
            </CustomInputContainer>
          </div>
          <!-- address -->
          <div class="flex_row mt-3 align-start">
            <CustomInputContainer label="Billing Address">
              <div slot="input">
                <v-textarea
                  v-model="customer.billing_address"
                  placeholder="Enter billing address"
                  outlined
                  dense
                  style="min-width: 23vw !important"
                ></v-textarea>
              </div>
            </CustomInputContainer>
            <div class="ml-4">
              <CustomInputContainer label="Shipping Address">
                <div slot="input">
                  <v-textarea
                    v-model="customer.shipping_address"
                    placeholder="Enter shipping address"
                    outlined
                    dense
                    :disabled="customer.isAddressSame"
                    style="min-width: 23vw !important"
                  ></v-textarea>
                </div>
              </CustomInputContainer>
              <v-checkbox
                v-model="customer.isAddressSame"
                @click="shoppingSameAsBilling"
                label="Same as billing address"
                dense
                color="primary"
                class=""
              />
            </div>
          </div>
          <div class="flex_row justify-space-between mt-0 pt-0">
            <span><span style="color: red">*</span> Mandatory fields</span>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
    <termsDialog :dialog="dialog" @close="termHandler" />
  </v-col>
</template>

<script>
import { mapState } from 'vuex'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import termsDialog from '@/components/Dialogs/termsDialog.vue'

export default {
  components: { CustomInputContainer, termsDialog },
  props: {
    customer: Object,
    type: String,
    companyLable: Boolean,
    companies: Array,
    companyName: String,
  },
  data() {
    return {
      dialog: false,
      additionalContact: false,
      logo: '',
      documents: [],
      all_currency: ['AED', 'USD', 'SDG', 'EGY'],
      terms: '',
      // companies: [],
      // all_terms: ['1', '2', '3', '4', 'Configure Terms'],
      all_terms: [],
      valid: false,
      companyLabel: true,
      selectedCompany2: null,
      nameRules: [(v) => !!v || 'Name is required'],
      emailValid: [(v) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      // fileValid: [(v) => !!v || 'This field is required'],
      phoneValid: [
        (value) =>
          !value ||
          (!isNaN(value) && value.length > 7) ||
          'Phone number must be valid.',
      ],
      phoneRules: [
        (v) => !!v || 'Phone number is required',
        (value) =>
          (!isNaN(value) && value.length > 7) || 'Phone number must be valid.',
      ],
      fileRules: [
        (v) => !!v || 'File is required',
        (v) => (v && v.size > 0) || 'File is required',
      ],
      // rules: {
      //   required: [(v) => !!v || 'This filed is required'],
      //   email_rule: [
      //     (v) =>
      //       /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
      //       'E-mail must be valid',
      //   ],
      //   phone_rule: [
      //     (value) => {
      //       return (
      //         (!isNaN(value) && value.length > 7) || 'Invalid phone number.'
      //       )
      //     },
      //   ],
      // },
    }
  },
  computed: {
    ...mapState(['companySelection']),
    handleDisabled() {
      return true
    },
  },
  mounted() {
    this.getTerms()
  },
  methods: {
    shoppingSameAsBilling() {
      this.customer.shipping_address = this.customer.billing_address
    },

    handleCloseCustomerForm() {
      this.$emit('handleToggleCustomerForm')
    },
    configureTerms() {
      if (this.customer.terms === 'config') {
        this.dialog = true
        this.customer.terms = ''
      }
    },
    submit() {
      if (this.$refs.customerForm.validate()) {
        const data = {
          logo: this.logo,
          documents: this.documents,
          type: this.type,
        }
        this.$emit('submitForm', data)
      }
    },
    async getTerms() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`term/all`, {}, { headers: { Authorization: AuthStr } })
        .then(async (res) => {
          const { terms } = res.data
          this.all_terms = [
            ...terms,
            { _id: 'config', name: 'Configure Terms' },
          ]
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },
    termHandler(term) {
      this.getTerms()
      this.dialog = false
    },
    emitSelected() {
      this.$emit('emitSelected', this.selectedCompany2)
    },
  },
}
</script>
