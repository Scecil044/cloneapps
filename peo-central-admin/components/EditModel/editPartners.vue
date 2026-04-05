<template>
  <v-row>
    <v-col cols="12">
      <v-card id="tall_dialog">
        <v-card-title id="card-title">
          <h4 class="text--text">{{ headerTitle }}</h4>
          <div class="flex_row justify-end">
            <v-btn
              class="tall__btn mr-2 px-5"
              color="subtext"
              outlined
              @click="close()"
              >Cancel</v-btn
            >
            <v-btn
              class="tall__btn px-9"
              color="primary"
              min-width="100px"
              @click="editPartnerDetails"
              >Update</v-btn
            >
          </div>
        </v-card-title>
        <v-divider id="divider" class="mt-5"></v-divider>
        <v-card-text id="card-text">
          <v-snackbar v-model="snackbar.visible" :timeout="3000" :color="snackbar.color" top>
            {{ snackbar.message }}
            <v-btn color="pink" text @click="snackbar.visible = false">Close</v-btn>
          </v-snackbar>
          <v-row class="pa-0 ma-0" v-if="headerTitle == 'summary'">
            <v-col cols="4">
              <CustomInputContainer label="Company Name">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.company_name"
                    placeholder="name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Company Name">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.company_email"
                    placeholder="company email"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Headquarters">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.headquarters"
                    placeholder="Headquarters"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Phone Number">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.phone"
                    type="phone"
                    placeholder="Phone Number"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Remarks">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.remarks"
                    placeholder="Remarks"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Follow Up Date">
                <div slot="input">
                  <v-menu
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="partnersDetailsObj.follow_up_date"
                        label="Follow Up Date"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        outlined
                        dense
                      ></v-text-field>
                    </template>

                    <v-date-picker
                      v-model="formattedFollowUpDate"
                      @input="dateMenu = false"
                      :first-day-of-week="1"
                      scrollable
                    >
                      <v-spacer></v-spacer>
                      <v-btn text color="primary" @click="dateMenu = false">Cancel</v-btn>
                      <v-btn text color="primary" @click="applyDate">OK</v-btn>
                    </v-date-picker>
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6">
              <CustomInputContainer label="Service Countries">
                <div slot="input">
                  <v-autocomplete
                    label="Service Countries"
                    :items="countryList"
                    placeholder="EOR Service Countries"
                    outlined
                    dense
                    v-model="partnersDetailsObj.eor_services_countries"
                    :rules="main_rule"
                    multiple
                  >
                    <template v-slot:selection="{ item, index }">
                      <v-chip v-if="index < 3" small>
                        {{ item }}
                      </v-chip>
                      <span v-if="index === 3" class="grey--text caption">
            (+{{ partnersDetailsObj.eor_services_countries.length - 3 }} others)
          </span>
                    </template>
                    <template v-slot:item="{ item, attrs, on }">
                      <v-list-item v-bind="attrs" v-on="on">
                        <template v-slot:default>
                          <v-list-item-action>
                            <v-checkbox
                              :input-value="partnersDetailsObj.eor_services_countries.includes(item)"
                              color="primary"
                            ></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>{{ item }}</v-list-item-title>
                          </v-list-item-content>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>

                  <v-autocomplete
                    label="EOR Service Countries For Expats"
                    :items="countryList"
                    placeholder="EOR Services For Expats"
                    outlined
                    dense
                    v-model="partnersDetailsObj.eor_services_for_expats"
                    :rules="main_rule"
                    multiple
                  >
                    <template v-slot:selection="{ item, index }">
                      <v-chip v-if="index < 3" small>
                        {{ item }}
                      </v-chip>
                      <span v-if="index === 3" class="grey--text caption">
        (+{{ partnersDetailsObj.eor_services_for_expats.length - 3 }} others)
      </span>
                    </template>
                    <template v-slot:item="{ item, attrs, on }">
                      <v-list-item v-bind="attrs" v-on="on">
                        <template v-slot:default>
                          <v-list-item-action>
                            <v-checkbox
                              :input-value="partnersDetailsObj.eor_services_for_expats.includes(item)"
                              color="primary"
                            ></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>{{ item }}</v-list-item-title>
                          </v-list-item-content>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>

                  <v-autocomplete
                    label="Own Entity Countries"
                    :items="countryList"
                    placeholder="Own Entity Countries"
                    outlined
                    dense
                    v-model="partnersDetailsObj.own_entity_countries"
                    :rules="main_rule"
                    multiple

                  >
                    <template v-slot:selection="{ item, index }">
                      <v-chip v-if="index < 3" small>
                        {{ item }}
                      </v-chip>
                      <span v-if="index === 3" class="grey--text caption">
        (+{{ partnersDetailsObj.own_entity_countries.length - 3 }} others)
      </span>
                    </template>
                    <template v-slot:item="{ item, attrs, on }">
                      <v-list-item v-bind="attrs" v-on="on">
                        <template v-slot:default>
                          <v-list-item-action>
                            <v-checkbox
                              :input-value="partnersDetailsObj.own_entity_countries.includes(item)"
                              color="primary"
                            ></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>{{ item }}</v-list-item-title>
                          </v-list-item-content>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>

                  <v-autocomplete
                    label="Global EOR Provider Countries"
                    :items="countryList"
                    placeholder="Global EOR Provider Countries"
                    outlined
                    dense
                    v-model="partnersDetailsObj.global_eor_provider_countries"
                    :rules="main_rule"
                    multiple

                  >
                    <template v-slot:selection="{ item, index }">
                      <v-chip v-if="index < 3" small>
                        {{ item }}
                      </v-chip>
                      <span v-if="index === 3" class="grey--text caption">
        (+{{ partnersDetailsObj.global_eor_provider_countries.length - 3 }} others)
      </span>
                    </template>
                    <template v-slot:item="{ item, attrs, on }">
                      <v-list-item v-bind="attrs" v-on="on">
                        <template v-slot:default>
                          <v-list-item-action>
                            <v-checkbox
                              :input-value="partnersDetailsObj.global_eor_provider_countries.includes(item)"
                              color="primary"
                            ></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>{{ item }}</v-list-item-title>
                          </v-list-item-content>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </div>
              </CustomInputContainer>

            </v-col>
            <v-col cols="6">
              <CustomInputContainer label="service fees">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.pricing_details.service_fees"
                    placeholder="Service Fees"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6">
              <CustomInputContainer label="Contract Length">
                <div slot="input">
                  <v-select
                    v-if="!showCustomLength"
                    v-model="partnersDetailsObj.pricing_details.contract_length"
                    :items="contractLengthOptions"
                    outlined
                    dense
                    @change="handleContractLengthChange"
                    :rules="main_rule"
                  />
                  <v-text-field
                    v-else
                    v-model="partnersDetailsObj.pricing_details.contract_length"
                    placeholder="Enter contract length"
                    outlined
                    dense
                    :rules="main_rule"
                    @blur="validateCustomLength"
                  />
                </div>
              </CustomInputContainer>
            </v-col>



          </v-row>
          <v-cols cols="6">
            <v-card elevation="0" class="mb-6 pa-0">
              <v-card-title class="px-7">Partnership Stages</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      label="Partnership Stage"
                      v-model="partnersDetailsObj.partnership_stage"
                      :rules="main_rule"
                      :items="partnership_stages_options"
                      outlined
                      dense

                      persistent-placeholder
                      required
                    ></v-select>
                  </v-col>
                  <v-col
                    cols="12"
                    v-if="partnersDetailsObj.partnership_stage === partnership_stages_options[4]"
                  >
                    <v-textarea
                      label="Reason for unsuccessful partnership"
                      v-model="partnersDetailsObj.reason_for_unsuccessful"
                      :rules="main_rule"
                      outlined
                      required
                      dense
                      persistent-placeholder
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-cols>
          <v-row
            class="pa-0 ma-0"
            v-if="headerTitle == 'points of contact' && partnersDetailsObj"
          >
            <v-col cols="4">
              <CustomInputContainer label="Primary Contact">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.points_of_contact.primary.name"
                    placeholder="Primary Contact Name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Primary Email">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.points_of_contact.primary.email"
                    placeholder="Primary Email"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Primary Phone">
                <div slot="input">
                  <v-text-field
                    v-model="partnersDetailsObj.points_of_contact.primary.phone"
                    placeholder="Primary Phone Number"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Secondary Contact Name">
                <div slot="input">
                  <v-text-field
                    v-model="
                      partnersDetailsObj.points_of_contact.secondary.name
                    "
                    placeholder="Secondary Contact Name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Secondary Contact Email">
                <div slot="input">
                  <v-text-field
                    v-model="
                      partnersDetailsObj.points_of_contact.secondary.email
                    "
                    placeholder="Secondary Contact Email"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Secondary Contact Phone">
                <div slot="input">
                  <v-text-field
                    v-model="
                      partnersDetailsObj.points_of_contact.secondary.phone
                    "
                    placeholder="Secondary Contact Phone"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>

          <v-row class="pa-0 ma-0" v-if="headerTitle == 'documents'">
            <div class="flex_column align-start">
              <h4 class="text--text">Upload Documents</h4>
            </div>

            <v-card-text id="card-text">
              <v-container class="ma-0 pa-0">
                <v-form ref="decisionForm" lazy-validation>
                  <v-row class="ma-0 pa-0">
                    <v-col cols="12" class="pl-0">
                      <CustomInputContainer label="PARTNERS DOCUMENTS">
                        <div slot="input">
                          <v-file-input
                            v-model="documents"
                            placeholder="Upload All Partner Documents Here"
                            outlined
                            multiple
                            prepend-icon=""
                            append-icon="fa-paperclip"
                            @change="fileAdded"
                            clearable
                          >
                            <template v-slot:selection="{ text, index, file }">
                              <div>

<!--                                <v-chip-->
<!--                                  v-for="(file, index) in documents"-->
<!--                                  :key="index"-->
<!--                                  small-->
<!--                                  label-->
<!--                                  color="outline"-->
<!--                                  style="margin-right: 4px;"-->
<!--                                >-->
<!--                                  {{ documents }}-->
<!--                                </v-chip>-->
                                <v-chip small color="outline" label style="margin-right: 4px;" close @click:close="remove(index)">
                                  {{ text }}
                                </v-chip>
                              </div>
                            </template>
                          </v-file-input>
                        </div>
                      </CustomInputContainer>

                      <div v-if="uploadedFiles.length">
                        <h4>Uploaded Files</h4>
                        <ul>
                          <li v-for="(file, index) in uploadedFiles[0]" :key="index">

                            <a :href="file.url" target="_blank">{{ file.file_name }}</a>
                            <v-btn icon @click="removeFile(index)" style="margin-left: 20px;">
                              <v-icon size="medium">mdi-delete</v-icon>
                            </v-btn>
                          </li>
                        </ul>
                      </div>
                    </v-col>
                  </v-row>
                </v-form>
              </v-container>
            </v-card-text>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import UploadDocuments from '@/components/ProcessFlow/UploadDocuments'
import countries from 'countries-list'

export default {
  components: {
    CustomInputContainer,
    UploadDocuments,
  },
  props: {
    handleModel: Function,
    partnersDetails: Array,
    headerTitle: String,
    selectedPartner: String,
  },

  data() {
    return {
      partnersDetailsObj: {
        points_of_contact: {
          primary: {
            name: null,
            phone: null,
            email: null,
          },
          secondary: {
            name: null,
            phone: null,
            email: null,
          },
        },
        pricing_details: {
          contract_length: '',
          service_fees: null,
        },
        follow_up_date: null,
        phone: ''
      },
      selectedDate: null,
      showCustomLength: false,
      contractLengthOptions: [
        { text: '1 year', value: '1 year' },
        { text: '2 years', value: '2 years' },
        { text: 'Other', value: 'other' }
      ],
      snackbar: {
        visible: false,
        message: '',
        color:''
      },
      newModule: [],
      upload_document_dialog: false,
      documents: [],
      peo_services_countries: [],
      eor_services_countries: [],
      eor_services_for_expats: [],
      own_entity_countries: [],
      dateMenu:false,
      global_eor_provider_countries: [],
      uploadedFiles: [],
      currFiles: [],
      previousFiles: [],
      countrySearch: '',
      partnership_stages_options: [
        'Contacted',
        'Discussion In Process',
        'Signed Partnership',
        'Successful Partnership',
        'Unsuccessful Partnership',
      ],
      reason_for_unsuccessful: '',
      main_rule: [(v) => !!v || 'This field is required'],
    }
  },
  mounted() {
    console.log('what are the partners details', this.partnersDetails[0])
    console.log('What is the selected partner', this.selectedPartner)
    let selectedObject = this.partnersDetails.find(
      (partner) => partner._id == this.selectedPartner
    )
    console.log('The found partner object is', selectedObject)
    this.partnersDetailsObj = selectedObject
  },
  created() {
    if (!this.partnersDetailsObj.points_of_contact) {
      this.$set(this.partnersDetailsObj, 'points_of_contact', {
        primary: { name: '', phone: '', email: '' },
      })
    } else if (!this.partnersDetailsObj.points_of_contact.primary) {
      this.$set(this.partnersDetailsObj.points_of_contact, 'primary', {
        name: '',
        phone: '',
        email: '',
      })
    } else if (!this.partnersDetailsObj.points_of_contact.secondary) {
      this.$set(this.partnersDetailsObj.points_of_contact, 'secondary', {
        name: '',
        phone: '',
        email: '',
      })
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },


    preparePartnerObject() {
      const objectMappings = {
        'summary': {
          company_name: this.partnersDetailsObj.company_name,
          company_email: this.partnersDetailsObj.company_email,
          headquarters: this.partnersDetailsObj.headquarters,
          partnership_stage: this.partnersDetailsObj.partnership_stage,
          remarks: this.partnersDetailsObj.remarks,
          peo_services_countries: this.partnersDetailsObj.peo_services_countries,
          eor_services_countries: this.partnersDetailsObj.eor_services_countries,
          own_entity_countries: this.partnersDetailsObj.own_entity_countries,
          global_eor_provider_countries: this.partnersDetailsObj.global_eor_provider_countries,
          pricing_details: {
            service_fees: this.partnersDetailsObj.pricing_details.service_fees,
            contract_length: this.partnersDetailsObj.pricing_details.contract_length,
          },
          follow_up_date: this.partnersDetailsObj.follow_up_date,
          phone: this.partnersDetailsObj.phone,


        },
        'points of contact': {
          points_of_contact: {
            primary: {
              name: this.partnersDetailsObj.points_of_contact.primary.name,
              email: this.partnersDetailsObj.points_of_contact.primary.email,
              phone: this.partnersDetailsObj.points_of_contact.primary.phone,
            },
            secondary: {
              name: this.partnersDetailsObj.points_of_contact.secondary.name,
              email: this.partnersDetailsObj.points_of_contact.secondary.email,
              phone: this.partnersDetailsObj.points_of_contact.secondary.phone,
            },
          }
        },
        'documents': {
          attachments: this.documents,
        }
      };

      return objectMappings[this.headerTitle.toLowerCase()] || {};
    },
    updateFollowUpDate(date) {
      if (date) {
        const jsDate = new Date(date);
        const day = String(jsDate.getDate()).padStart(2, '0');
        const month = String(jsDate.getMonth() + 1).padStart(2, '0');
        const year = jsDate.getFullYear();
        this.formattedFollowUpDate = `${day}-${month}-${year}`;
      } else {
        this.formattedFollowUpDate = '';
      }
    },
    applyDate() {
      this.dateMenu = false;
      this.updateFollowUpDate(this.selectedDate);
    },
    async editPartnerDetails() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token);
      const obj = this.preparePartnerObject();
      try {
        if (this.headerTitle.toLowerCase() === 'documents') {
          console.log("what us the objs", obj)
          await this.uploadPartnerDocuments(obj);
          // this.$router.go()
        }

        await this.$axios.$put(`/partners/${this.selectedPartner}`, obj, {
          headers: { Authorization: AuthStr },
        });
        this.close();

        this.snackbar.message = 'Partner details updated successfully!';
        this.snackbar.color = 'green';
        this.snackbar.visible = true;

        await this.fetchPartnerDetails();
        this.close()
      } catch (error) {
        console.error(error);
        this.snackbar.message = 'Failed to update partner details. Please try again.';
        this.snackbar.color = 'red';
        this.snackbar.visible = true;
      }
    },

    removeFile(index) {
      this.uploadedFiles.splice(index, 1);
    },
    handleClose() {
      this.showUploadDialog = false
      this.uploadDocuments = false
    },
    onSearchInput(val) {
      console.log(val);
      this.search = val;

    },
    handleSuccess() {
      this.showUploadDialog = false
    },
    uploadCustomerDocuments(value) {
      this.upload_document_dialog = false
      this.$emit('submitDoc', this.documents)
    },
    customFilter(item, queryText) {
      console.log("I AM EXECUTED")
      const searchText = queryText.toLowerCase()
      const countryName = item.toLowerCase()
      return countryName.includes(searchText)
    },
    async uploadPartnerDocuments(obj) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token);
      console.log("What are the attachments", obj.attachments);
      let data = new FormData();
      obj.attachments.forEach(file => {
        data.append('attachments', file);
      });

      try {
        console.log("What is the payload", data);
        const response = await this.$axios.post('/documents/mimetype/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });


        this.uploadedFiles.push(response.data);

        this.documents = [];

        let obj = {
          attachments: this.uploadedFiles[0]
        }

        try {
          let updatedPartner = await this.$axios.$put(`/partners/${this.selectedPartner}`, obj, {
            headers: { Authorization: AuthStr },
          });

          this.snackbar.message = 'Partner details updated successfully!';
          this.snackbar.color = 'green';
          this.snackbar.visible = true;
          await this.fetchPartnerDetails();
          await this.getUserDocuments(this.selectedPartner);
          this.close()
        } catch (error){
          console.error(error)
          this.snackbar.message = 'Failed to update partner details, check the documents';
          this.snackbar.color = 'red';
          this.snackbar.visible = true;
        }

      } catch (error) {
        console.error("Error uploading files:", error);
      }
    },
    async fetchPartnerDetails() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.$get(`/partners/${this.selectedPartner}`, {
          headers: { Authorization: AuthStr },
        });
        console.log("WHat us the response", response)
        this.partnersDetailsObj = response;
      } catch (error) {
        console.error('Failed to fetch partner details:', error);
        this.snackbar.message = 'Failed to fetch updated partner details.';
        this.snackbar.color = 'red';
        this.snackbar.visible = true;
      }
    },

    async getUserDocuments(user_id){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        let response = await this.$axios.$get(`/partners/${user_id}`, {
          headers: { Authorization: AuthStr },
        })
        console.log("Who is the response", response)
        return response.documents

      } catch (error){
        throw new Error(error)
      }
    },
    remove (index) {
      this.documents.splice(index, 1)
    },
    fileAdded () {
      console.log(this.files)
      if (this.previousFiles.length > 0) {
        this.documents.push(...this.previousFiles)
      }
    },
    handleContractLengthChange(value) {
      if (value === 'other') {
        this.showCustomLength = true;
        this.partnersDetailsObj.pricing_details.contract_length = '';
      } else {
        this.showCustomLength = false;
      }
    },
    validateCustomLength() {
      const value = this.partnersDetailsObj.pricing_details.contract_length;
      if (value && !isNaN(value)) {
        this.partnersDetailsObj.pricing_details.contract_length = value.toString();
      }
    }

  },
  computed: {
    countryList() {
      const countryCodes = Object.keys(countries.countries)
      const countryNames = countryCodes.map(
        (code) => countries.countries[code].name
      )
      return countryNames
    },
    formattedFollowUpDate: {
      get() {
        return new Date(this.partnersDetailsObj.follow_up_date).toISOString().split('T')[0] || '';
      },
      set(value) {
        this.partnersDetailsObj.follow_up_date = value;
      },
    },
    filteredCountries() {
      const countryCodes = Object.keys(countries.countries);
      const countryNames = countryCodes.map(
        (code) => countries.countries[code].name
      );
      return countryNames;
    },



  },
  watch: {
    files(val) {
      this.previousFiles = val
    }
  },
}
</script>
