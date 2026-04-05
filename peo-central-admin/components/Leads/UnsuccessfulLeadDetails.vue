<template>
  <div>
    <v-row v-if="leadsDetails.length > 0">
      <v-col cols="12">
        <v-card color="card_bg" id="card">
          <v-card-title id="card-title" class="mb-4"> </v-card-title>
          <v-card-text id="card-text2" style="max-height: 600px !important" class="dl__l overflow-y-auto">
            <v-col cols="12" class="py-0">
              <div class="d-flex align-center justify-space-between">
                <h6 style="color: #000000 !important">Unsuccessful Lead Details</h6>
                <v-btn class="short__btn" color="primary" @click="removeSelectedLeads(selectedLeads)">Remove</v-btn>
              </div>
            </v-col>

            <!-- LEAD STATUS & SCORING TABLE -->
            <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
              :headers="leadStatusHeaders" :items="leadsDetails" :footer-props="{ 'items-per-page-options': [10, 20] }"
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
                  <td class="pr-0" style="width: 215px !important">Unsuccessful on</td>
                  <td class="d-flex align-center" v-if="item.unsuccessful_on">{{ convertDateFormat(item.unsuccessful_on) }}</td>
                  <td class="d-flex align-center" v-else>-</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Lead Received</td>
                  <td class="d-flex align-center">{{ item.createdAt ? convertDateFormat(item.createdAt) : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Archive Reason</td>
                  <td class="d-flex align-center">{{ item.reason_for_unsuccessful ? item.reason_for_unsuccessful : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Lead Score</td>
                  <td class="d-flex align-center">
                    <span :class="getScoreColorClass(item)">{{ calculateLeadScore(item) }}/100</span>
                    <span class="ml-2" :class="getPriorityColorClass(item)">{{ getPriorityLevel(item) }}</span>
                  </td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Timeline to Hire</td>
                  <td class="d-flex align-center">{{ item.timeline_to_hire ? item.timeline_to_hire : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Engagement Level</td>
                  <td class="d-flex align-center">{{ item.engagement_level ? item.engagement_level : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Decision Maker</td>
                  <td class="d-flex align-center">{{ item.decision_maker_involvement ? item.decision_maker_involvement : '-' }}</td>
                  <td class=""></td>
                </tr>
              </template>
            </v-data-table>

            <!-- COMPANY INFORMATION TABLE -->
            <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
              :headers="leadCompanyHeaders" :items="leadsDetails" :footer-props="{ 'items-per-page-options': [10, 20] }"
              hide-default-footer default-sort="false">
              <template #[`header.title`]="{ header }">
                <div class="d-flex align-center pa-0">
                  <div>
                    <InfoSVG />
                  </div>
                  <div>
                    <th class="pl-2">{{ header.text }}</th>
                  </div>
                </div>
              </template>

              <template #[`item`]="{ item }">
                <tr>
                  <td class="pr-0" style="width: 215px !important">Company Name</td>
                  <td class="d-flex align-center">{{ item.company_name ? item.company_name : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Contact Name</td>
                  <td class="d-flex align-center">{{ item.contact_person && item.contact_person.name ? item.contact_person.name : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Email ID</td>
                  <td class="d-flex align-center">{{ item.contact_person && item.contact_person.email ? item.contact_person.email : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Phone No.</td>
                  <td class="d-flex align-center">{{ item.contact_person && item.contact_person.phone ? item.contact_person.phone : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Business Industry</td>
                  <td class="d-flex align-center">{{ item.lead_details && item.lead_details.business_industry ? item.lead_details.business_industry : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Company Website</td>
                  <td class="d-flex align-center">{{ item.lead_details && item.lead_details.company_website ? item.lead_details.company_website : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Default Currency</td>
                  <td class="d-flex align-center">AED</td>
                  <td class=""></td>
                </tr>
              </template>
            </v-data-table>
            <!-- LEAD REQUIREMENTS TABLE -->
            <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
              :headers="leadRequirementsHeaders" :items="leadsDetails" :footer-props="{ 'items-per-page-options': [10, 20] }"
              hide-default-footer default-sort="false">
              <template #[`header.title`]="{ header }">
                <div class="d-flex align-center pa-0">
                  <div>
                    <ListCheckSvg />
                  </div>
                  <div>
                    <th class="pl-2">{{ header.text }}</th>
                  </div>
                </div>
              </template>

              <template #[`item`]="{ item }">
                <tr>
                  <td class="pr-0" style="width: 215px !important">No of Employees</td>
                  <td class="d-flex align-center">{{ item.lead_details && item.lead_details.deal_size ? item.lead_details.deal_size : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">EOR Requirements</td>
                  <td class="d-flex align-center">{{ item.lead_details && item.lead_details.eor_requirements ? item.lead_details.eor_requirements : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Service Type</td>
                  <td class="d-flex align-center">{{ item.service_type ? item.service_type : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Requirements Detail</td>
                  <td class="d-flex align-center">{{ item.lead_details && item.lead_details.detail ? item.lead_details.detail : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Inquiry Type</td>
                  <td class="d-flex align-center">{{ item.lead_details && item.lead_details.inquiry_type ? item.lead_details.inquiry_type : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Opportunity Type</td>
                  <td class="d-flex align-center">{{ item.lead_details && item.lead_details.opportunity_type ? item.lead_details.opportunity_type : '-' }}</td>
                  <td class=""></td>
                </tr>
              </template>
            </v-data-table>

            <!-- DOCUMENT ATTACHMENTS -->
            <v-data-table v-if="leadsDetails.length > 0 && leadsDetails[0].attachments && leadsDetails[0].attachments.length > 0"
              id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
              :headers="documentHeaders" :items="leadsDetails[0].attachments" :footer-props="{ 'items-per-page-options': [10, 20] }"
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
                  <td class="pr-0" style="width: 215px !important">Document Type</td>
                  <td class="d-flex align-center">{{ getDocumentDisplayName(item) }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">File Name</td>
                  <td class="d-flex align-center">{{ item.file_name ? item.file_name : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Upload Date</td>
                  <td class="d-flex align-center">{{ item.uploaded_date ? convertDateFormat(item.uploaded_date) : '-' }}</td>
                  <td class=""></td>
                </tr>
                <tr>
                  <td class="pr-0" style="width: 215px !important">Actions</td>
                  <td class="d-flex align-center">
                    <v-btn v-if="item.file_url" small color="primary" outlined @click="downloadDocument(item.file_url, item.file_name)">
                      Download
                    </v-btn>
                    <span v-else>-</span>
                  </td>
                  <td class=""></td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-title id="card-title" class="mb-4"></v-card-title>
          <v-card-text id="card-text2" style="max-height: 75vh !important" class="dl__l overflow-y-auto">
            <v-col cols="12" class="py-0 px-0">
              <div class="d-flex align-center justify-space-between">
                <h6 style="color: #000000 !important">No Details to display</h6>
              </div>
            </v-col>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import EditSvg from '@/assets/images/Customer/edit.svg'
import InfoSVG from '@/assets/images/Customer/info.svg'
import ListCheckSvg from '@/assets/images/icons/list-check.svg'
import FlagSVG from '@/assets/images/FlagUae.svg'
import BinanceSVG from '@/assets/images/icons/binance-logo.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'


export default {
  props: { selectedLeads: String },
  components: {
    InfoSVG,
    BinanceSVG,
    customerDefaultIcon,
    FlagSVG,
    EditSvg,
    ListCheckSvg
  },
  data() {
    return {
      leadStatusHeaders: [
        { text: 'LEAD STATUS & SCORING', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      leadCompanyHeaders: [
        { text: 'COMPANY INFORMATION', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      documentHeaders: [
        { text: 'DOCUMENT ATTACHMENTS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },
      ],
      leadCompanyDetails: [
        {
          title: 'Full Name',
          description: 'Acme Corporation',

        },
        {
          title: 'Email ID',
          description: 'Rickysmith@gmail.com',
        },
        {
          title: 'Phone Number',
          description: '+971-52 6813408',

        },
        {
          title: 'Default Currency ',
          description: 'AED',

        },


      ],
      leadRequirementsHeaders: [
        { text: 'REQUIREMENTS', value: 'title', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'description', align: 'center', hideSortIcon: true, sortable: false },
        { text: '', value: 'action', align: 'start', hideSortIcon: true, sortable: false },

      ],
      leadRequirementsDetails: [
        {
          title: 'No of employees',
          description: '3',

        },

        {
          title: 'Detail',
          description: 'Value',

        },



      ],
      leadsDetails: [],
      ShowDetails: false,
      limit: '10',
      page: 0,
      documentTypes: [], // Array to hold document types
      documentTypesLoading: true, // Boolean to track loading state
    }
  },
  methods: {
    async getLeadsDetails(id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/leads/unsuccessful/details/${id}`, { }, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.ShowDetails = false
        setTimeout(() => {
          // console.log(response, '-----resposne detaisl')
          this.leadsDetails = response
          this.ShowDetails = true
        }, 1);
      })
    },
    async getUnsuccessfulLeadsList() {

      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/leads/list/unsuccessful`, {  }, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.ShowDetails = false
        setTimeout(() => {
          this.leadsDetails = response
          if(this.leadsDetails.length > 0) {
            this.getLeadsDetails(this.leadsDetails[0]._id)
          }
          this.ShowDetails = true
        }, 1);
      })
    },
    convertDateFormat(dateTimeString) {
      const date = new Date(dateTimeString);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      return `${month} ${day} ${year}`;
    },
    async removeSelectedLeads(id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/leads/remove/unsuccessful/${id}`, {}, { headers : { Authorization: AuthStr } })
      .then((response) => {
        this.$nuxt.$emit('reloadUnsuccessfulLeadsList', true)
        this.getUnsuccessfulLeadsList()
      })
    },
    // Lead scoring calculation (same as AllLeadsList)
    calculateLeadScore(lead) {
      let score = 0;

      // 1. Employee Count (deal_size)
      const dealSize = lead.lead_details?.deal_size;
      switch(dealSize) {
        case '1-10':
        case '1 - 10': score += 10; break;
        case '11-50':
        case '11 - 50': score += 15; break;
        case '51-100':
        case '51 - 100': score += 20; break;
        case '51-200':
        case '51 - 200': score += 25; break;
        case '100+':
        case '200+': score += 25; break;
      }

      // 2. Region of Interest (eor_requirements)
      const eorReq = lead.lead_details?.eor_requirements;
      switch(eorReq) {
        case 'UAE EOR': score += 25; break;
        case 'Mission Visa UAE': score += 15; break;
        case 'GCC EOR':
        case 'Various': score += 10; break;
      }

      // 3. Timeline to Hire
      const timeline = lead.timeline_to_hire;
      switch(timeline) {
        case '0-1 month': score += 20; break;
        case '1-3 months': score += 15; break;
        case '3-6 months': score += 10; break;
        case '6-12 months': score += 5; break;
        case '12+ months': score += 0; break;
      }

      // 4. Engagement Level
      const engagement = lead.engagement_level;
      switch(engagement) {
        case 'Highly Engaged': score += 15; break;
        case 'Occasional': score += 10; break;
        case 'Low': score += 5; break;
      }

      // 5. Decision Maker Involvement
      const decisionMaker = lead.decision_maker_involvement;
      switch(decisionMaker) {
        case 'Direct Contact With Decision Maker': score += 15; break;
        case 'Indirect or Unsure': score += 5; break;
      }

      return score;
    },
    // Get priority level text
    getPriorityLevel(lead) {
      const score = this.calculateLeadScore(lead);
      if (score >= 80) return 'Hot Lead';
      if (score >= 60) return 'Warm Lead';
      if (score >= 40) return 'Cold Lead';
      return 'Unqualified/Archive';
    },
    // Get score color class
    getScoreColorClass(lead) {
      const score = this.calculateLeadScore(lead);
      if (score >= 80) return 'text-red font-weight-bold';
      if (score >= 60) return 'text-orange font-weight-bold';
      if (score >= 40) return 'text-blue font-weight-bold';
      return 'text-grey font-weight-bold';
    },
    // Get priority color class
    getPriorityColorClass(lead) {
      const score = this.calculateLeadScore(lead);
      if (score >= 80) return 'red--text';
      if (score >= 60) return 'orange--text';
      if (score >= 40) return 'blue--text';
      return 'grey--text';
    },
    // Document handling methods
    getDocumentDisplayName(document) {
      if (!document.type || this.isDocumentTypeId(document.type)) {
        const docTypeName = this.getDocumentTypeName(document.type);
        if (!docTypeName) {
          return '';
        }
        return docTypeName;
      }
      return document.type || '';
    },
    getDocumentTypeName(typeId) {
      if (this.documentTypesLoading || !this.documentTypes.length) {
        return null;
      }
      if (!typeId) return null;
      const docType = this.documentTypes.find(dt => dt._id === typeId);
      return docType ? docType.name : null;
    },
    isDocumentTypeId(type) {
      return type && /^[0-9a-fA-F]{24}$/.test(type);
    },
    async fetchDocumentTypes() {
      if (this.documentTypes.length > 0) return;
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
    downloadDocument(fileUrl, fileName) {
      if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },
  mounted() {
    this.getLeadsDetails(this.selectedLeads)
    this.fetchDocumentTypes() // Fetch document types when component mounts
  }
}
</script>

<style lang="scss" scoped>
// Ensure table cells maintain proper alignment
.v-data-table td {
  vertical-align: top;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

// Lead scoring color classes
.text-red {
  color: #f44336 !important;
}

.text-orange {
  color: #ff9800 !important;
}

.text-blue {
  color: #2196f3 !important;
}

.text-grey {
  color: #9e9e9e !important;
}

.font-weight-bold {
  font-weight: 600 !important;
}

// Priority color classes
.red--text {
  color: #f44336 !important;
}

.orange--text {
  color: #ff9800 !important;
}

.blue--text {
  color: #2196f3 !important;
}

.grey--text {
  color: #9e9e9e !important;
}
</style>

