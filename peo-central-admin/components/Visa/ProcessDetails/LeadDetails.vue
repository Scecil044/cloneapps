<template>
  <div>
    <v-row v-if="!showEditModel">
      <v-col cols="12" v-if="loading && leadsDetails.length <= 0">
        <v-card class="d-flex align-center" color="card_bg" id="card" height="600px">
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </v-card>
      </v-col>
      <v-col cols="12" v-else>
        <v-card color="card_bg" id="card">
          <v-card-title id="card-title" class="mb-4"> </v-card-title>
          <v-card-text id="card-text2" style="max-height: 600px !important" class="dl__l overflow-y-auto">
            <v-col cols="12" class="py-0">
              <div class="d-flex align-center justify-end">
                <v-btn class="ml-1 pl-3 pr-3" color="#000027" outlined :height="30"
                  style="border: solid 3px #f9fafc !important" @click="handleEditModel()">
                  <EditSvg />
                  <span class="edit_btnNew pl-1">Edit</span>
                </v-btn>
              </div>
            </v-col>
            <!-- LEAD DETAILS TABLE -->
            <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
              :headers="leadHeaders" :items="leadsDetails" :footer-props="{ 'items-per-page-options': [10, 20] }"
              hide-default-footer default-sort="false">
              <template #[`header.title`]="{ header }">
                <div class="d-flex align-center pa-0">
                  <div>
                    <th class="pl-2">{{ header.text }}</th>
                  </div>
                </div>
              </template>

              <template #[`item`]="{ item }">
                <tr>
                  <td class="pr-0" style="width: 215px !important">Lead Assigned to</td>
                  <td class="d-flex align-center">
                    <div style="position: relative !important">
                      <v-avatar class="mr-2" size="30px" style="position: absolute !important">
                        <v-img alt="Avatar" :src="item.user_image_url" v-if="index === 0" />
                      </v-avatar>
                      <span v-if="index === 0" class="ml-9">
                        <a href="#">{{ item.first_name }} {{ item.last_name }}</a>
                      </span>
                      <span class="span_data" v-else>{{ item.first_name }} {{ item.last_name }}</span>
                    </div>
                  </td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Client Type</td>
                  <td class="d-flex align-center">{{ item.client_type }}</td>
                  <td class=""> </td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Service Type</td>
                  <td class="d-flex align-center">{{ item.service_type }}</td>
                  <td class=""> </td>
                </tr>
              </template>
            </v-data-table>

            <!-- LEAD REQUIREMENT TABLE -->
            <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
              :headers="leadRequirementHeaders" :items="leadsDetails"
              :footer-props="{ 'items-per-page-options': [10, 20] }" hide-default-footer default-sort="false">
              <template #[`header.title`]="{ header }">
                <div class="d-flex align-center pa-0">
                  <div>
                    <th class="pl-2">{{ header.text }}</th>
                  </div>
                </div>
              </template>
              <template #[`header.action`]="{ header }">
                <th class="d-flex justify-end">
                  <v-btn class="customer_table_btn" outlined color="primary">{{ header.text }}</v-btn>
                </th>
              </template>

              <template #[`item`]="{ item }">
                <tr>
                  <td class="pr-0" style="width: 215px !important">Head Count</td>
                  <td class="d-flex align-center">{{ item.lead_details.head_count }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Lead Received on</td>
                  <td class="d-flex align-center">{{ item.lead_details.committed_date }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Days since Lead Received</td>
                  <td class="d-flex align-center">{{ item.lead_details.lead_received ? item.lead_details.lead_received :
                    '-'
                  }} Days</td>
                  <td class=""></td>
                </tr>
              </template>
            </v-data-table>

            <!-- LEAD COMPANY DETAILS -->
            <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
              :headers="leadCompanyHeaders" :items="leadsDetails" :footer-props="{ 'items-per-page-options': [10, 20] }"
              hide-default-footer default-sort="false">
              <template #[`header.title`]="{ header }">
                <div class="d-flex align-center pa-0">
                  <div>
                    <th class="pl-2">{{ header.text }}</th>
                  </div>
                </div>
              </template>
              <template #[`header.action`]="{ header }">
                <th class="d-flex justify-end">
                  <v-btn class="customer_table_btn" outlined color="primary">{{
                    header.text
                  }}</v-btn>
                </th>
              </template>

              <template #[`item`]="{ item }">
                <tr>
                  <td class="pr-0" style="width: 215px !important">Company Name</td>
                  <td class="d-flex align-center">{{ item.company_name ? item.company_name : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Contact Name</td>
                  <td class="d-flex align-center">{{ item.contact_person.name ? item.contact_person.name : '-'
                  }}</td>
                  <td class=""></td>
                </tr>                  <tr>
                  <td class="pr-0" style="width: 215px !important">Phone Number</td>
                  <td class="d-flex align-center">
                    <div style="position: relative !important">
                      <v-img style=" position: absolute !important; width: 30px; bottom: 4px;" alt="Avatar"
                        :src="getCountryFlag(item.company_phone)" />
                      <span class="ml-9">{{ item.company_phone }}</span>
                    </div>
                  </td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Email Address</td>
                  <td class="d-flex align-center">{{ item.company_email ? item.company_email : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Company Website</td>
                  <td class="d-flex align-center">{{ item.company_website ? item.company_website : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Business Industry</td>
                  <td class="d-flex align-center">{{ item.business_industry ? item.business_industry : 'N/A' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Type of Business</td>
                  <td class="d-flex align-center">{{ item.type_of_business ? item.type_of_business : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Registration Number</td>
                  <td class="d-flex align-center">{{ item.registration_number ? item.registration_number : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Number of Employees</td>
                  <td class="d-flex align-center">{{ item.no_of_employees ? item.no_of_employees : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Company Notes</td>
                  <td class="d-flex align-center">{{ item.company_notes ? item.company_notes : '-' }}</td>
                  <td class=""></td>
                </tr>
              </template>
            </v-data-table>

            <!-- LEAD details TABLE -->
            <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
              :headers="leadExtraDetailsHeaders" :items="leadsDetails"
              :footer-props="{ 'items-per-page-options': [20, 40] }" hide-default-footer default-sort="false">
              <template #[`header.title`]="{ header }">
                <div class="d-flex align-center pa-0">
                  <div>
                    <th class="pl-2">{{ header.text }}</th>
                  </div>
                </div>
              </template>
              <template #[`header.action`]="{ header }">
                <th class="d-flex justify-end">
                  <v-btn class="customer_table_btn" outlined color="primary">{{
                    header.text
                  }}</v-btn>
                </th>
              </template>

              <template #[`item`]="{ item }">
                <tr>
                  <td class="pr-0" style="width: 215px !important">Inquiry Type</td>
                  <td class="d-flex align-center">{{ item.lead_details.inquiry_type ? item.lead_details.inquiry_type : '-'
                  }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Opportunity Type</td>
                  <td class="d-flex align-center">{{ item.lead_details.opportunity_type ?
                    item.lead_details.opportunity_type
                    : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Status</td>
                  <td class="d-flex align-center">{{ item.lead_details.status ? item.lead_details.status : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Action</td>
                  <td class="d-flex align-center">{{ item.lead_details.action ? item.lead_details.action : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Rate the Lead</td>
                  <td class="d-flex align-center">{{ item.lead_details.rate_the_lead ? item.lead_details.rate_the_lead :
                    '-'
                  }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Overall Total Order Value</td>
                  <td class="d-flex align-center">{{ item.lead_details.overall_total_order_value ?
                    item.lead_details.overall_total_order_value : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">EOR Requirements</td>
                  <td class="d-flex align-center">
                    <v-textarea
                      :value="item.lead_details.eor_requirements || '-'"
                      readonly
                      outlined
                      dense
                      auto-grow
                      rows="2"
                      max-rows="3"
                      class="requirements-textarea"
                      style="max-height: 80px; overflow-y: auto; min-height: 60px;"
                      hide-details
                    ></v-textarea>
                  </td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Requirements</td>
                  <td class="d-flex align-center">
                    <v-textarea
                      :value="item.lead_details.requirements || '-'"
                      readonly
                      outlined
                      dense
                      auto-grow
                      rows="3"
                      max-rows="4"
                      class="requirements-textarea"
                      style="max-height: 100px; overflow-y: auto; min-height: 80px;"
                      hide-details
                    ></v-textarea>
                  </td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Term</td>
                  <td class="d-flex align-center">{{ item.lead_details.term ? item.lead_details.term : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Chance Rate (%)</td>
                  <td class="d-flex align-center">{{ item.lead_details.chance_rate ? item.lead_details.chance_rate : '-'
                  }}
                    %</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Committed Date</td>
                  <td class="d-flex align-center">{{ item.lead_details.committed_date ? item.lead_details.committed_date :
                    '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Mobilization Date</td>
                  <td class="d-flex align-center">{{ item.lead_details.mobilization_date ?
                    item.lead_details.mobilization_date : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Opportunity Nick Name</td>
                  <td class="d-flex align-center">{{ item.lead_details.opportunity_nick_name ?
                    item.lead_details.opportunity_nick_name : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Service Location</td>
                  <td class="d-flex align-center">{{ item.lead_details.service_location ?
                    item.lead_details.service_location
                    : '-' }}</td>
                  <td class=""></td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <EditLeadsModel v-if="showEditModel" :selectedLeads="leadsDetails" :handleModel="handleEditLead" :isEditMode="true" @close="updateLeadsData()" />



    <!-- Snack -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import EditSvg from '@/assets/images/Customer/edit.svg'
import InfoSVG from '@/assets/images/Customer/info.svg'
import FlagSVG from '@/assets/images/FlagUae.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import EditLeadsModel from '~/components/EditModel/editLeads.vue'

export default {
  components: {
    InfoSVG,
    customerDefaultIcon,
    FlagSVG,
    EditSvg,
    EditLeadsModel
  },
  props: {
    process_id: String
  },
  data() {
    return {
      loading: false,
      leadsDetails: [],
      leadRequirementHeaders: [
        {
          text: 'LEAD REQUIREMENT',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadCompanyHeaders: [
        {
          text: 'COMPANY DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadExtraDetailsHeaders: [
        {
          text: 'LEAD DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadHeaders: [
        {
          text: 'DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      showEditModel: false,
      snack: false,
      snackColor: "",
      snackText: "",
      documentTypes: [], // To store document types
      documentTypesLoading: false, // To track loading state for document types
    }
  },
  mounted() {
    this.getLeadDetails(this.process_id)
    this.fetchDocumentTypes() // Fetch document types on mount
  },
  methods: {
    // Phone number country flag detection
    getCountryFlag(phoneNumber) {
      if (!phoneNumber) return '/FlagUae.png'; // Default to UAE flag

      // Remove spaces and ensure it starts with +
      const cleanPhone = phoneNumber.replace(/\s+/g, '');

      // Country code mappings with their flag images
      const countryFlags = {
        '+971': '/FlagUae.png',    // UAE
        '+1': '/FlagUsa.png',      // USA/Canada
        '+44': '/FlagUk.png',      // UK
        '+91': '/FlagIndia.png',   // India
        '+966': '/FlagSaudi.png',  // Saudi Arabia
        '+974': '/FlagQatar.png',  // Qatar
        '+965': '/FlagKuwait.png', // Kuwait
        '+973': '/FlagBahrain.png',// Bahrain
        '+968': '/FlagOman.png',   // Oman
        '+20': '/FlagEgypt.png',   // Egypt
        '+962': '/FlagJordan.png', // Jordan
        '+961': '/FlagLebanon.png',// Lebanon
        '+254': '/FlagUae.png',    // Kenya (placeholder flag)
        '+234': '/FlagUae.png',    // Nigeria (placeholder flag)
        '+27': '/FlagUae.png',     // South Africa (placeholder flag)
        '+256': '/FlagUae.png',    // Uganda (placeholder flag)
        '+255': '/FlagUae.png',    // Tanzania (placeholder flag)
        '+250': '/FlagUae.png',    // Rwanda (placeholder flag)
        '+233': '/FlagUae.png',    // Ghana (placeholder flag)
        '+212': '/FlagUae.png',    // Morocco (placeholder flag)
        '+213': '/FlagUae.png',    // Algeria (placeholder flag)
        '+216': '/FlagUae.png',    // Tunisia (placeholder flag)
      };

      // Check for country codes (sort by length to match longest first)
      const sortedCodes = Object.keys(countryFlags).sort((a, b) => b.length - a.length);

      for (const code of sortedCodes) {
        if (cleanPhone.startsWith(code)) {
          return countryFlags[code];
        }
      }

      return '/FlagUae.png'; // Default fallback
    },

    async getLeadDetails(id) {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post('/leads/details/leadsid', { "leads_id": id }, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.loading = false
          this.leadsDetails = response
        })
    },
    handleEditLead() {
      this.showEditModel = !this.showEditModel
    },
    handleEditModel() {
      this.showEditModel = !this.showEditModel
    },
    async updateLeadsData() {
      this.showEditModel = !this.showEditModel
      this.snack = true;
      this.snackColor = "green";
      this.snackText = "Lead Updated Successfully!";
      await this.getLeadDetails(this.process_id)
      this.$nuxt.$emit('LeadsListClicked', this.leadsDetails)
    },
    getDocumentDisplayName(document) {
      // If document type is not loaded yet, return empty string instead of ObjectId
      if (!document.type || this.isDocumentTypeId(document.type)) {
        const docTypeName = this.getDocumentTypeName(document.type);
        if (!docTypeName) {
          return ''; // Return empty string instead of ObjectId
        }
        return docTypeName;
      }

      // If type is already a string name, return it
      return document.type || '';
    },

    getDocumentTypeName(typeId) {
      // If document types are still loading, return null to prevent ObjectId display
      if (this.documentTypesLoading || !this.documentTypes.length) {
        return null;
      }

      if (!typeId) return null;

      const docType = this.documentTypes.find(dt => dt._id === typeId);
      return docType ? docType.name : null;
    },

    isDocumentTypeId(type) {
      // Check if the type is a MongoDB ObjectId (24 character hex string)
      return type && /^[0-9a-fA-F]{24}$/.test(type);
    },

    async fetchDocumentTypes() {
      if (this.documentTypes.length > 0) return; // Already loaded

      try {
        this.documentTypesLoading = true;
        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.$get('/documenttypes', {
          headers: { Authorization: AuthStr }
        });
        this.documentTypes = response || [];
      } catch (error) {
        console.warn('Failed to fetch document types:', error);
        this.documentTypes = [];
      } finally {
        this.documentTypesLoading = false;
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.requirements-textarea {
  .v-text-field__details {
    display: none; // Hide the details line
  }

  .v-input__slot {
    min-height: 60px;
    max-height: 100px;
    overflow-y: auto;
  }

  // Ensure consistent width
  width: 100%;
  max-width: 400px;
}

// Ensure table cells maintain proper alignment
.v-data-table td {
  vertical-align: top;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

// Add extra spacing for requirements fields specifically
.v-data-table td .requirements-textarea {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
