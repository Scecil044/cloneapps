<template lang="">
  <v-container class="preview_container ma-0 pa-0">
    <div class="a4__con mx-auto">
      <div class="ribbon" v-if="showRibbon">
        <span
          class="ribbon_inner"
          v-html="ribbonText"
          :style="{
            background: ribbonColor,
          }"
        ></span>
      </div>
      <v-row class="pdf_heder ma-2 pa-0">
        <v-col cols="8">
          <h4>{{ company_name }}</h4>
          <p class="ma-0 pa-0 text--text" v-if="street_name !== ''">
            {{ street_name }}
          </p>
          <p class="ma-0 pa-0 text--text" v-if="city_name !== ''">
            {{ city_name }}
          </p>
          <p class="ma-0 pa-0 text--text" v-if="email !== ''">
            {{ company_email }}
          </p>
          <p class="ma-0 pa-0 text--text" v-if="vat_trn !== ''">
            VAT TRN:
            <b>{{ vat_trn }}</b>
          </p>
        </v-col>
        <v-col cols="4">
          <div class="n__logo">
            <img :src="companyLogo" alt="logo" class="preview___logo" />
          </div>
        </v-col>
      </v-row>
      <v-row class="pdf_header_2 ma-0 pa-0"> </v-row>
      <h1 class="ml-3 py-3 text--text">{{ type }}</h1>
      <v-row class="invoice_details ma-0 pa-0">
        <v-col cols="7">
          <h5 class="ma-0 pa-0 pb-2 subtext--text">BILL TO</h5>
          <p class="ma-0 pa-0 text--text">{{ customer_name }}</p>
          <p class="ma-0 pa-0 text--text">
            {{ customer_address }}
          </p>
          <p class="ma-0 pa-0 text--text">
            {{ customer_country }}
          </p>
          <p class="ma-0 pa-0 text--text">{{ customer_vat_no }}</p>
        </v-col>
        <v-col cols="5">
          <v-col cols="auto">
            <h5 class="ma-0 pa-0 pb-2 subtext--text">{{document_text}} No.</h5>
            <p class="ma-0 pa-0 text--text">
              {{ document_number }}
            </p>
          </v-col>
          <v-row>
            <v-col cols="6">
              <h5 class="ma-0 pa-0 pb-2 subtext--text">{{document_text}} Date</h5>
              <p class="ma-0 pa-0 text--text">
                {{ document_date }}
              </p>
            </v-col>
            <v-col cols="6">
              <h5 class="ma-0 pa-0 pb-2 subtext--text">{{document_text}} Due Date</h5>
              <p class="ma-0 pa-0 text--text">
                {{ document_due_date }}
              </p>
            </v-col>
          </v-row>
        </v-col>
          </v-row>
        </v-col>
        
      </v-row>
      <v-row class="pdf_input mt-9 mb-0 pb-0">
        <v-spacer></v-spacer>
        <v-col cols="12">
          <v-simple-table fixed-header>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-center text--text">Product/Service</th>
                  <th class="text-center text--text">Qty</th>
                  <th class="text-center text--text">Price</th>
                  <th class="text-center text--text">Amount</th>
                  <th class="text-center text--text">VAT %</th>
                  <th class="text-center text--text">VAT Amount</th>
                  <th class="text-center text--text">Net Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  class="outline"
                  v-for="(product, pIndex) in products"
                  :key="pIndex"
                >
                  <td class="text-center font-weight-medium">
                    {{ product.service_name }}
                  </td>
                  <td class="text-center font-weight-medium">
                    {{ product.quantity }}
                  </td>
                  <td class="text-center font-weight-medium">
                    {{ product.rate }}
                  </td>
                  <td class="text-center font-weight-medium">
                    {{ product.amount }}
                  </td>
                  <td class="text-center font-weight-medium">
                    {{ product.vat_rate }}
                  </td>
                  <td class="text-center font-weight-medium">
                    {{ product.vat_amount }}
                  </td>
                  <td class="text-center font-weight-medium">
                    {{ product.net_total }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <div class="invoice_footer mx-auto mt-9 pt-9 text-left row">
        <div class="col-6">
          <h6 class="mb-2" style="font-size: 10px">Terms & Conditions</h6>
          <p class="terms_paragraph">
            The following terminology applies to these Terms and Conditions,
            Privacy Statement and Disclaimer Notice and all Agreements:
            “Client”, “You” and “Your” refers to you, the person log on this
            website and compliant to the Company's terms and conditions. “The
            Company”, “Ourselves”, “We”, “Our” and “Us”.
          </p>
          <h6 class="mb-2" style="font-size: 10px">
            Kindly pay the above amount by: Cheque or Bank Transfer
          </h6>
          <p class="terms_paragraph">
            Name of Beneficiary: {{company_name}}
            <br />Consultancies Bank Name: Emirates Islamic Bank PJSC <br />A/C
            No: 3708213919301 (AED Account)<br />
            IBAN number: AE 950340003708213919301 <br />Swift Code: MEBLAEAD<br /><br />
            Kindly provide the proof of transfer.<br /><br />**This is a
            computer Generated Invoice & does not require signature
          </p>
        </div>
      </div>
    </div>
  </v-container>
</template>
<script>
export default {
  props: {
    showRibbon: {
      default: false,
    },
    ribbonText: {
      default: '',
    },
    ribbonColor: {
      default: 'lightgray',
    },
    company_name: {
      default: 'Company Name',
    },
    street_name: {
      default: '',
    },
    city_name: {
      default: '',
    },
    company_email: {
      default: '',
    },
    vat_trn: {
      default: '',
    },
    companyLogo: {
      default: '/eat_and_drink_logo2.webp',
    },
    type: {
      default: 'Tax Invoice',
    },
    customer_name: {
      default: 'Customer Name',
    },
    customer_address: {
      default: 'Customer Address',
    },
    customer_country: {
      default: '',
    },
    customer_vat_no: {
      default: '',
    },
    document_text:{
      default:"Invoice"
    },
    document_number: {
      default: '',
    },
    document_date:{
      default:""
    },
    document_due_date:{
      default:""
    },
    products:{
      default:[]
    }
  },
}
</script>
<style lang="scss">
.preview_container {
  padding: 33px !important;
  padding-top: 5px !important;
}
.preview___logo{
  width: 190px;
  height: 80px;
  margin-left: auto;
}
</style>
