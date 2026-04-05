<template>
  <v-col sm="12" md="8" lg="8">
    <!-- Loading skeleton -->
    <ClientDetailsSkeleton v-if="loading" />
    
    <!-- UPLOAD DOCUMENT DIALOG -->
    <v-dialog v-model="upload_document_dialog" persistent max-width="800px">
      <v-card id="card" style="padding: 30px 40px !important">
        <v-card-title id="card-title">
          <div class="flex_column align-start">
            <h4 class="text--text">Upload Documents</h4>
          </div>
          <div class="flex_row align-center justify-space-between">
            <v-btn class="text_light--text tall__btn" color="primary" @click="uploadCustomerDocuments">Add</v-btn>
            <v-icon small color="subtext" class="ml-5" @click="upload_document_dialog = false">fa-close</v-icon>
          </div>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-form ref="decisionForm" lazy-validation>
              <v-row class="ma-0 pa-0">
                <v-col cols="12" class="pl-0">
                  <CustomInputContainer label="CUSTOMER DOCUMENTS">
                    <div slot="input">
                      <v-file-input v-model="documents" placeholder="Upload All Customer Documents Here" outlined
                        multiple prepend-icon="" append-icon="fa-paperclip">
                        <template v-slot:selection="{ text }">
                          <v-chip small label color="outline">
                            {{ text }}
                          </v-chip>
                        </template>
                      </v-file-input>
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- CUSTOMER DETAILS -->
    <v-card v-if="!loading && data.primary_contact" color='card_bg' class="carddd" id="card" style=" max-height: 90vh !important;overflow: auto;">
      <v-card-text id="card-text" style="margin-top: 0 !important">
        <v-row class="first_contact_information__row">
          <v-col cols="auto">
            <h5 class="text--text"><v-icon class="mr-3" color="outline" x-small>fa-circle</v-icon>{{ data.customer_name }}<span class="ml-3 outline--text caption">[{{ data.customer_id }}]</span></h5>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn class="px-8 rounded-xl" color="primary" outlined small @click="handleEditCustomer">Edit</v-btn>
          </v-col>
          <v-row>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Customer Name</span>
                <h6 class="text--text">{{ data.customer_name }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text" >Customer Phone</span>
                <h6 class="text--text">{{ data.phone?data.phone: null }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Customer Email</span>
                <h6 class="text--text">{{ data.email?data.email: null }}</h6>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Customer Type</span>
                <h6 class="text--text">{{ data.is_business?'Business':'Individual' }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Currency</span>
                <h6 class="text--text">{{ data.currency?data.currency:null }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">VAT</span>
                <h6 class="text--text">{{ data.trn_number?data.trn_number:null }}</h6>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Primary Contact</span>
                <h6 class="text--text">{{ data.primary_contact.name }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Primary Contact Phone</span>
                <h6 class="text--text">+971{{ data.primary_contact.phone }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Primary Contact Email</span>
                <h6 class="text--text">{{ data.primary_contact.email }}</h6>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Additional Contact</span>
                <h6 class="text--text">{{ (data.additional_contact &&data.additional_contact.name )?data.additional_contact.name:null }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Additional Contact Phone</span>
                <h6 class="text--text">{{ (data.additional_contact &&data.additional_contact.phone )?data.additional_contact.phone:null }}</h6>
              </div>
            </v-col>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Additional Contact Email</span>
                <h6 class="text--text">{{ (data.additional_contact &&data.additional_contact.email )?data.additional_contact.email:null }}</h6>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Billing Address</span>
                <h6 class="text--text">{{ data.billing_address?data.billing_address:null }}</h6>
              </div>
            </v-col>
            <v-spacer></v-spacer>
            <v-col sm="12" md="4" lg="4">
              <div class="text-left">
                <span class=" caption subtext--text">Shipping Address</span>
                <h6 class="text--text">{{ data.shipping_address?data.shipping_address:null }}</h6>
              </div>
            </v-col>
          </v-row>
        </v-row>
        <v-divider id="divider" class="my-6"></v-divider>
        <!-- CUSTOMER DOCUMENTS -->
        <v-row class="documents_information__row" v-if="data.documents.length">
          <v-col cols="auto">
            <h5 class="text--text">Documents Information</h5>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn icon class="mr-5 rounded-xl" color="primary" outlined small @click="upload_document_dialog = true">
              <v-icon small color="primary">fa-plus</v-icon>
            </v-btn>
          </v-col>
          <v-row>
            <v-col cols="12">
              <v-simple-table class="documents_information__docs">
                <template v-slot:default>
                  <tbody>
                    <tr v-for="item in data.documents" :key="item.name">
                      <td>{{ item.replace(/^.*[\\\/]/, '') }}</td>
                      <td class="text-end">
                        <v-btn icon color="primary" @click="downloadUserDocument(item)">
                          <v-icon small color="primary">fa-download</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-row>
        <v-row class="documents_information__row" v-if="!data.documents.length">
          <v-col cols="auto">
            <h5 class="text--text">Documents Information</h5>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn icon class="mr-5 rounded-xl" color="primary" outlined small @click="upload_document_dialog = true">
              <v-icon small color="primary">fa-plus</v-icon>
            </v-btn>
          </v-col>
          <v-row>
            <span class="caption mt-5 mx-auto">This user has no document to show...</span>
          </v-row>
        </v-row>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import ClientDetailsSkeleton from '@/components/reuseable/ClientDetailsSkeleton.vue'

export default {
  components: { 
    CustomInputContainer,
    ClientDetailsSkeleton
  },
  props: {
    data: Object,
    new_customer: Object
  },
  data() {
    return {
      loading: true,
      documents: [],
      upload_document_dialog: false
    }
  },
  mounted() {
    // Simulate loading delay
    setTimeout(() => {
      this.loading = false
    }, 1200)
  },
  methods: {
    handleEditCustomer(){
      this.$emit('editCustomerHandler')
    },
    downloadUserDocument(imageSrc) {
      const link = document.createElement('a')
      link.href = imageSrc
      link.dispatchEvent(new MouseEvent('click'))
    },
    uploadCustomerDocuments(value) {
      this.upload_document_dialog = false
      this.$emit('submitDoc', this.documents)
    },
  }
}
</script>

<style lang="scss">
.carddd::-webkit-scrollbar {
  width: 0px;
  background-color: #ECF4F8;
}
.carddd::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
  background-color: #ECF4F8;
  border-radius: 10px;
}
.carddd::-webkit-scrollbar-thumb {
  background-image: -webkit-gradient(linear, left bottom, top,
    color-stop(0.44, #0A94FF),
    color-stop(0.72, #0A94FF),
    color-stop(0.86, #0A94FF)
  );
}
</style>