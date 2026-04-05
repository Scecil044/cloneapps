<template>
  <v-row class="px-0 py-0">
    <!-- email Dialog -->
    <SendMailDialog v-if="sendEmailDialog" :emailBody="emailBody" @close="closeDialogs" @successfull="actionSuccess" :is-loading="!emailBody.content" />
    <GenerateDocument v-if="generateDocument" :documentID="documentID" @close="closeDialogs"
      @successfull="actionSuccess" />
    <UploadDocuments v-if="uploadDocuments" :requiredDocuments="requiredDocuments" :module="currentModule"
      :identifier="currentidentifier" :foreign_id="selectedLeads" @successfull="actionSuccess" />

    <!-- Unsuccessful Dialog -->
    <v-dialog id="custom_dialog" v-model="unsuccessfulDialog" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Lead Unsuccessful Reason</h4>
          <v-icon small color="subtext" class="ml-5"
            @click="unsuccessfulDialog = false; ShowDetails = true">fa-close</v-icon>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <v-row class="pb-0">
            <v-col cols="12" class="pl-0 py-0">
              <v-radio-group class="dialog_radioButton" v-model="reason_for_unsuccessful">
                <v-radio class="pb-6" label="Price Too High" value="Price Too High"></v-radio>
                <v-radio class="pb-6" label="Just Wanted To Enquire" value="Just Wanted To Enquire"></v-radio>
                <v-radio class="pb-6" label="Unqualified Lead" value="Unqualified Lead"></v-radio>
                <v-radio class="pb-6" label="Not Registered Company" value="Not Registered Company"></v-radio>
                <div class="d-flex align-center">
                  <v-radio class="pb-6" label="Other" value="Other"></v-radio>
                  <template>
                    <v-text-field v-model="otherReason" solo dense placeholder="Enter Reason"
                      class="unsuccessfulDialog_date_field mx-3">
                    </v-text-field>
                  </template>
                </div>
              </v-radio-group>
            </v-col>
            <v-col cols="12" class="ma-0 pa-0">
              <v-btn style="width: 100% !important" class="unsuccessful_btn_dialog" color="primary"
                @click="createUnsuccessful();">Save as unsuccessful</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>


    <v-col cols="12" v-if="ShowDetails">
      <v-card color="card_bg" id="card">
        <div class="timeline_wrapper px-6" v-if="ShowDetails && leadsDetails && leadsDetails[0].processes">
          <div class="timeline d-flex" dense>
            <div class="item" v-for="(item, index) in leadsDetails[0].processes"
              :class="item.process_status == 'progress' ? 'processing' : item.process_status == 'completed' ? 'active' : ''"
              :key="index">
              <div class="icon d-flex align-center justify-center+">
                <checkBoxSvg v-if="item.process_status == 'completed'" style="background-color: #0a94ff" />
              </div>
              <span>{{ item.stage_name }}</span>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" v-else>
      <v-card color="card_bg" class="d-flex align-center" id="card" height="100px">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-card>
    </v-col>
    <v-col cols="12" v-if="ShowDetails">
      <v-card color="card_bg" id="card" @click="confirm" v-if="leadsDetails && leadsDetails[0].processes">
        <v-row v-if="currentAction && currentAction != {}">
          <v-col cols='8' class="d-flex align-center">
            <h6 style="color: #000000 !important">{{ currentAction.message }}</h6>
          </v-col>
          <v-col cols='4' class="d-flex align-center" style="justify-content: right;">
            <v-btn v-if="currentAction.reject_button && currentAction.reject_button != ''"
              class="tall__btn mr-4 primary--text" outlined @click="unsuccessfulDialog = true"> <span>
                {{ currentAction.reject_button }} </span> </v-btn>
            <v-btn v-if="currentAction.button && currentAction.button != ''" class="tall__btn" color="primary"
              @click="tiggerAction(currentAction, leadsDetails[0]._id)"> <span> {{ currentAction.button }} </span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="12" v-else>
      <v-card class="d-flex align-center" color="card_bg" id="card" height="100px">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-card>
    </v-col>
    <!-- Lead Details -->
    <div style="width: 100%">
      <LeadDetails :leadsDetails="leadsDetails" @lead-updated="handleLeadUpdated" />
    </div>
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_leadTimeLine.scss'
import InfoSVG from '@/assets/images/Customer/info.svg'
import checkBoxSvg from '@/assets/images/icons/check-box.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import LeadDetails from '@/components/Leads/LeadDetails.vue'
import SendMailDialog from '@/components/ProcessFlow/SendEmail'
import GenerateDocument from '@/components/ProcessFlow/GenerateDocument'
import UploadDocuments from '@/components/ProcessFlow/UploadDocuments'
export default {
  components: {
    checkBoxSvg,
    InfoSVG,
    CustomInputContainer,
    LeadDetails,
    SendMailDialog,
    GenerateDocument,
    UploadDocuments
  },
  props: {
    progressBar: Array,
    leadHeadingButtons: Array,
    renewalRequest: Boolean,
    selectedLeads: String
  },
  data() {
    return {
      // dynamic Variable should be props
      currentModule: 'leads',
      //////
      currentidentifier: '',
      currentforeign_id: '',
      generateDocument: false,
      uploadDocuments: false,
      sendEmailDialog: false,
      documentID: '',
      requiredDocuments: [],
      currentAction: {},
      currentProcess: {},
      main_rule: [(v) => !!v || 'This filed is required'],
      unsuccessfulDialog: false,
      declinedDialog: false,
      leadsDetails: [],
      ShowDetails: false,
      reason_for_unsuccessful: '',
      otherReason: '',
      emailBody: {},
    }
  },
  watch: {
    otherReason(val) {
      if (val) {
        this.reason_for_unsuccessful = val;
      }
    }
  },
  mounted() {
    this.getLeadsDetails(this.selectedLeads)
  },
  methods: {
    actionSuccess() {
      this.tiggerAction({ action_type: 'no action' }, this.leadsDetails[0]._id)
      this.closeDialogs()
    },
    async tiggerAction(action, process_id) {
      this.ShowDetails = false
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      if (action.action_type == 'no action') {
        await this.$axios.$post(`/leads/process/moveforward/${this.selectedLeads}`, { button: this.selectedButton }, { headers: { Authorization: AuthStr } })
        this.getLeadsDetails(process_id)
      }
      else if (action.action_type == 'email') {
        this.emailBody = await this.$axios.$get(`/email_template/?templateId=${action.template_id}&moduleId=${process_id}`, { headers: { Authorization: AuthStr } })
        this.emailBody.from = 'donotreply@nathanhr.ae'
        this.sendEmailDialog = true
      }
      else if (action.action_type == 'document') {
        this.documentID = action.template_id
        this.generateDocument = true
      }
      else if (action.action_type == 'document upload') {
        this.requiredDocuments = action.required_documents
        this.uploadDocuments = true
      }
    },
    closeDialogs() {
      this.sendEmailDialog = false
      this.generateDocument = false
      this.uploadDocuments = false
      this.ShowDetails = true
    },
    createUnsuccessful() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post(`/leads/mark/unsuccessful/${this.selectedLeads}`, { 'reason_for_unsuccessful': this.reason_for_unsuccessful }, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.$nuxt.$emit('reloadLeadsList', true)
        })
      this.unsuccessfulDialog = false;

    },
    confirm() {
      // this.tiggerAction(this.currentAction,this.leadsDetails[0]._id)
    },
    async getLeadsDetails(id) {
      this.ShowDetails = false
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post('/leads/details/leadsid', { "leads_id": id }, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.ShowDetails = false
          this.leadsDetails = response
          this.currentProcess = this.leadsDetails[0].processes.filter(process => process.process_status === "progress")[0]
          if (this.currentProcess) {
            this.currentidentifier = this.currentProcess._id
            this.currentAction = this.currentProcess.actions.filter(action => action.status === "progress")[0]
          }
          else this.currentAction = {}

          this.ShowDetails = true
        })
    },
    async handleLeadUpdated(leadId) {
      // Refetch lead details when lead is updated
      await this.getLeadsDetails(leadId || this.selectedLeads)
    },
  },
}
</script>
