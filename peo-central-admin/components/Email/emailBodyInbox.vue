<template>
  <div>
    <NewEmail :currentTab="currentTab" :type="'replyAll'" :emailDetails="selectedEmail" @close="replyAllMail = false"
      @updated="updatedMail()" v-if="replyAllMail" />

    <NewEmail :currentTab="currentTab" :type="'forwardMail'" :emailDetails="selectedEmail" @close="forwardMail = false"
      @updated="updatedMail()" v-if="forwardMail" />

    <NewEmail :currentTab="currentTab" :type="'reply'" :emailDetails="selectedEmail" @close="replyMail = false"
      @updated="updatedMail()" v-if="replyMail" />

    <v-row>
      <v-col cols="12" v-if="loading">
        <v-card color="card_bg" id="card" class="d-flex justify-center align-center" style="min-height: 90vh;">
          <v-img src="/animated/ring.svg" max-width="fit-content" height="200" contain class="mr-3"></v-img>
        </v-card>

      </v-col>
      <v-col cols="12" v-else>
        <v-card color="card_bg" id="card">
          <v-card-title id="card-title" class="mb-4">
            <v-row class="pa-0">
              <v-col class="pa-0" cols="12">
                <div class="d-flex align-center justify-space-between">
                  <span class="span_btnB">{{ selectedEmailSender.subject }}</span>
                </div>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text id="card-text2" style="height: 80vh !important" class="dl__l overflow-y-auto">
            <v-container class="px-0">
              <v-row class="px-0">
                <v-col class="px-0" cols="12" md="6" lg="6">
                  <div class="d-flex align-center">
                    <v-avatar size="60">
                      <v-img alt="Avatar" src="/1.jpg" />
                    </v-avatar>
                    <div class="ml-2 d-flex flex-column" v-if="currentTab == 'Inbox'">
                      <span class="sub_reg">{{ selectedEmailSender.sender_name }}</span>
                      <span class="span_subtext">To:{{ selectedEmailSender.to }}</span>
                      <span class="span_subtext">cc:{{ ccRecipients ? ccRecipients : '-' }}</span>
                    </div>
                    <div class="ml-2 d-flex flex-column" v-else>
                      <span class="sub_reg">{{ selectedEmailSender.to}}</span>
                      <span class="span_subtext">To:{{ selectedEmailSender.sender_name}}</span>
                      <span class="span_subtext">cc:{{ ccRecipients ? ccRecipients : '-' }}</span>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="px-0">
                  <div class="d-flex align-center justify-end">
                    <v-btn @click="sendNewMail('Reply')" style="min-width: 40px !important" class="short__btn mr-2"
                      color="subtext" outlined>
                      <ArrowBackSvg />
                      <span class="span_subtext"> reply </span>
                    </v-btn>
                    <v-btn @click="sendNewMail('Reply All')" style="min-width: 40px !important" class="short__btn mr-2"
                      color="subtext" outlined>
                      <ArrowBackDoubleSvg />
                      <span class="span_subtext"> reply all </span>
                    </v-btn>
                    <v-btn @click="sendNewMail('Forward')" style="min-width: 40px !important" class="short__btn mr-2"
                      color="subtext" outlined>
                      <ArrowNarrowRightSvg />
                      <span class="span_subtext"> forward </span>
                    </v-btn>
                    <v-btn style="min-width: 40px !important" class="short__btn mr-2" color="subtext" outlined
                      @click="initiateDownload(body)">
                      <PrinterSvg />
                    </v-btn>
                  </div>
                  <div class="d-flex align-center justify-end pa-2">
                    <span class="span_text">{{ selectedEmailSender.day }} {{ selectedEmailSender.time }}</span>
                  </div>
                </v-col>
                <v-col cols="auto" class="px-0">
                  <v-row>
                    <div class="mt-5 ml-5 " v-for=" docs in selectedEmail.attachments" :key="docs.id">
                      <div @click="downloadDocumentFromBytes(docs.contentBytes, docs.contentType, docs.name)"
                        class="docs_upload pa-2 d-flex align-center justify-space-between"
                        style=" width: 100% !important; gap: 30px !important;">
                        <div class=" d-flex align-center curser_pointer">
                          <PdfSvg class="mr-2" v-if="getFileFormat(docs.contentType) == 'pdf'" />
                          <div class=" d-flex align-start flex-column">
                            <span class="span_subtext">{{ docs.name }}</span>
                            <span class="span_text">{{ Math.floor(docs.size / 1000) }} KB</span>
                          </div>
                        </div>
                        <v-btn color="subtext" icon>
                          <v-icon small>fa-duotone fa-ellipsis-vertical fa-rotate-90</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <div class="pa-6">
                    <span v-html="body" style="font-weight: bold;"></span>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
// fa-regular fa-ellipsis-vertical fa-beat fa-2xs <i class="fa-regular fa-ellipsis-vertical fa-rotate-90 fa-2xs"></i> <i class="fa-duotone fa-ellipsis-vertical fa-rotate-90"></i>
import ArrowBackSvg from '@/assets/images/icons/arrow-back.svg'
import ArrowBackDoubleSvg from '@/assets/images/icons/arrow-back-double.svg'
import ArrowNarrowRightSvg from '@/assets/images/icons/arrow-narrow-right.svg'
import PrinterSvg from '@/assets/images/icons/printer.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import PdfSvg from '@/assets/images/icons/pdf.svg'
import CancelSvg from '@/assets/images/icons/cancel.svg'
import NewEmail from '~/pages/Email/newmail.vue'



export default {
  components: {
    customerDefaultIcon,
    ArrowBackSvg,
    ArrowBackDoubleSvg,
    ArrowNarrowRightSvg,
    PrinterSvg,
    PdfSvg,
    CancelSvg,
    NewEmail
  },
  props: {
    selectedEmailSender: Object,
    currentTab: String
  },
  data() {
    return {
      loading: false,
      selectedEmail: {},
      body: '',
      ccRecipients: '',
      replyAllMail: false,
      forwardMail: false,
      replyMail: false,
    }
  },
  methods: {
    downloadDocumentFromBytes(byte, applicationType, name) {
      var a = document.createElement("a"); //Create <a>
      a.href = `data:${applicationType};base64, ${byte}`
      a.download = name;
      a.click();
    },
    sendNewMail(val) {
      if (val == 'Reply All') {
        this.replyAllMail = true
      } else if (val == 'Forward') {
        this.forwardMail = true
      } else if(val == 'Reply'){
        this.replyMail = true
      }
      // this.$router.push('/Email/newMail')
    },
    updatedMail() {
      this.replyAllMail = false
      this.forwardMail = false
      this.replyMail = false
    },
    handleEditLead() {
      this.$router.push('/Leads/new-lead')
    },
    async getEmailListById(email_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.loading = true
      await this.$axios.$get(`/graph/mail/getEmailById/${email_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.selectedEmail = response.data
          this.body = this.selectedEmail.body.content

          this.ccRecipients = this.selectedEmail.ccRecipients.map(recipient => recipient.emailAddress.name)
          this.ccRecipients = this.ccRecipients.join(';')
          // console.log(this.selectedEmail, '--------------------Email Details')
          this.loading = false
        })
    },
    getFileFormat(mimeType) {
      let fileFormat = '';

      if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/jpg' || mimeType === 'image/gif') {
        fileFormat = 'image';
      } else if (mimeType === 'application/pdf') {
        fileFormat = 'pdf';
      } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileFormat = 'word';
      } else if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        fileFormat = 'excel';
      } else if (mimeType === 'application/vnd.ms-powerpoint' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        fileFormat = 'powerpoint';
      } else {
        fileFormat = 'other';
      }

      return fileFormat;
    },
    initiateDownload(htmlCode) {
      window.onbeforeprint = function () {
        // console.log("Capturing page content...");
      };
      window.print(htmlCode);
    }
  },
  async mounted() {
    // console.log(this.selectedEmailSender, '----------------this.selectedEmailSender mounted')
    if (this.selectedEmailSender != '' || this.selectedEmailSender != undefined) {
      await this.getEmailListById(this.selectedEmailSender.id)
    }
  },
}
</script>
