<template>
  <div>
    <v-row justify="center">
      <v-dialog v-model="dialog_add_category" persistent fullscreen>
        <v-card id="card" style="margin-bottom: 1rem !important; height: 100vh !important">
          <v-icon color="black" dense class="mr-5" @click="closeLead()">fa-arrow-left</v-icon>
          <v-container fluid>
            <v-card-title id="card-title" class="mb-1">
              <v-row class=" d-flex align-center " style=" background-color: #f4f5f6; border-radius: 8px !important">
                <v-col cols="12" class=" d-flex">
                  <div class=" d-flex " style=" width: 14% !important">
                    <v-btn class="mail__btn" color="lightgray" outlined @click="sendMail()">
                      <div class=" d-flex align-center flex-column justify-space-between ">
                        <Sendmail class="" />
                        <span class="mt-3 text--navbar-bg" color="">send</span>
                      </div>
                    </v-btn>
                    <div class=" d-flex flex-column justify-space-between ml-4" style="gap: 4px !important">
                      <v-btn class="mailcc__btn" color="lightgray" outlined>
                        <span class="text--navbar-bg" color="">To</span>
                      </v-btn>
                      <v-btn class="mailcc__btn" color="lightgray" outlined>
                        <span class="text--navbar-bg" color="">Cc</span>
                      </v-btn>
                      <span class="">Subject:</span>
                    </div>
                  </div>
                  <div style="width: 85% !important">
                    <!-- add mail To  -->
                    <div slot="input">
                      <v-text-field v-model="mail_to" placeholder=" Mail To" hide-details dense />
                    </div>
                    <!-- add mail Cc  -->
                    <div slot="input" class="mt-4">
                      <v-text-field v-model="mail_Cc" placeholder="Mail Cc" hide-details dense />
                    </div>
                    <!-- Mail Subject -->
                    <div slot="input" class="mt-2">
                      <v-text-field v-model="mail_subject" placeholder="subject" hide-details dense />
                    </div>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class=" d-flex align-center mb-6 ml-16">
                    <v-responsive max-width="auto">
                      <v-file-input label="Attach Files" color="primary" v-model="uploaded_File" show-size counter
                        multiple clearable solo dense class="mail_Approval_FileAttach"
                        background-color="transparent"></v-file-input>
                    </v-responsive>
                  </div>
                  <span>Note: <strong style="color: crimson;">*</strong><i>To add multiple address for 'To' and 'CC',
                      Please add semicolon ';' after each email.</i> </span>
                </v-col>
                <!-- <v-col cols="12" sm="12" md="12">
                </v-col> -->
              </v-row>
            </v-card-title>
            <v-card-text class=" px-0 mt-6">
              <v-row class="pl-0 pr-0">
                <v-col cols="12" sm="6" md="6" lg="12" class="py-0 px-0">
                  <quill-editor ref="myQuillEditor" v-model="mail_data"
                    :style="{ 'border': '2px solid #E2E7F1', 'border-radius': '10px' }"
                    style="min-height: 50vh !important"></quill-editor>
                </v-col>
              </v-row>
            </v-card-text>
          </v-container>
        </v-card>
      </v-dialog>
    </v-row>


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
import '@/assets/scss/utils/_newMail.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import SendIcon from '@/assets/images/DashboardLayout/send.svg'
import Sendmail from '@/assets/images/icons/white-send.svg'


export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    CalenderSvg,
    SendIcon,
    Sendmail
  },
  props: { type: String, emailDetails: Object, currentTab: String },
  data() {
    return {
      dialog_add_category: true,
      mail_subject: '',
      mail_to: '',
      mail_Cc: '',
      mail_data: '',
      uploaded_File: [],
      snack: false,
      snackText: '',
      snackColor: '',
    }
  },
  mounted() {

    // console.log(this.emailDetails, '---------------new mail emailDetails')

    if (this.currentTab == 'Inbox' && this.type == 'replyAll') {

      //Fetching To recipients
      const senderEmail = this.emailDetails.sender.emailAddress.address
      // const toList = this.emailDetails.toRecipients ? this.emailDetails.toRecipients.map(recipient => recipient.emailAddress.address) : ""

      // const newMail_to = senderEmail

      this.mail_to = [senderEmail].join(';')

      //Fetching Body
      this.mail_data = this.emailDetails.body.content

      //Fetching CC Recipients

      this.mail_Cc = this.emailDetails.ccRecipients ? this.emailDetails.ccRecipients.map(recipient => recipient.emailAddress.address) : ""
      this.mail_Cc = this.mail_Cc.join(';')

      //Fetching Subject
      this.mail_subject = this.emailDetails.subject

    } else if ((this.currentTab == 'Inbox' || this.currentTab == 'Sent Items') && this.type == 'forwardMail') {

      //Fetching Subject
      this.mail_subject = this.emailDetails.subject

      //Fetching Body
      this.mail_data = this.emailDetails.body.content
    } else if((this.currentTab == 'Inbox' || this.currentTab == 'Sent Items') && this.type == 'reply') {

      //Fetching To recipients
      const senderEmail = this.emailDetails.sender.emailAddress.address

      this.mail_to = [senderEmail].join(';')

      //Fetching Body
      this.mail_data = this.emailDetails.body.content

      //Fetching Subject
      this.mail_subject = this.emailDetails.subject
    } else if(this.currentTab == 'Sent Items' && this.type == 'replyAll') {
      //Fetching To recipients
      // const senderEmail = this.emailDetails.sender.emailAddress.address
      const toList = this.emailDetails.toRecipients ? this.emailDetails.toRecipients.map(recipient => recipient.emailAddress.address) : ""

      // const newMail_to = senderEmail

      this.mail_to = [toList].join(';')

      //Fetching Body
      this.mail_data = this.emailDetails.body.content

      //Fetching CC Recipients

      this.mail_Cc = this.emailDetails.ccRecipients ? this.emailDetails.ccRecipients.map(recipient => recipient.emailAddress.address) : ""
      this.mail_Cc = this.mail_Cc.join(';')

      //Fetching Subject
      this.mail_subject = this.emailDetails.subject
    }
  },
  methods: {
    closeLead() {
      this.$router.push('/Email')
      this.close()
    },
    close() {
      this.$emit('close', false)
    },
    async sendMail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      if (this.currentTab == 'Inbox' && this.type == 'new') {
        const params = {
          // "recieverAddresses": [this.mail_to],
          // "ccAddresses": [this.mail_Cc],
          "subject": this.mail_subject,
          "content": this.mail_data,
          // "attachments":this.uploaded_File
        }

        const toBase64 = file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });

        const attach = [];
        for (const file of this.uploaded_File) {
          const base64URL = await toBase64(file);
          const attachment = {
            name: file.name,
            contentType: file.type,
            contentBytes: base64URL.split(',')[1] // Remove the data URL prefix
          };
          attach.push(attachment);
        }


        params.attachments = attach
        params.recieverAddresses = this.mail_to.split(';')
        params.ccAddresses = this.mail_Cc.split(';')

        await this.$axios.$post(`/graph/mail/sendMail`, params, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Email Has Been Sent Successfully.'
          this.closeLead()
        })
      } else if((this.currentTab == 'Inbox' || this.currentTab == 'Sent Items') && this.type == 'replyAll') {
        const params = {
          // "recieverAddresses": [this.mail_to],
          // "ccAddresses": [this.mail_Cc],
          "subject": this.mail_subject,
          "content": this.mail_data,
          // "attachments":this.uploaded_File
        }

        const toBase64 = file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });

        const attach = [];
        for (const file of this.uploaded_File) {
          const base64URL = await toBase64(file);
          const attachment = {
            name: file.name,
            contentType: file.type,
            contentBytes: base64URL.split(',')[1] // Remove the data URL prefix
          };
          attach.push(attachment);
        }

        params.attachments = attach
        params.recieverAddresses = this.mail_to.split(';')
        params.ccAddresses = this.mail_Cc.split(';')

        await this.$axios.$post(`/graph/mail/${this.emailDetails.id}/replyAll`, { "content": this.mail_data }, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Reply All Email Has Been Sent Successfully.'
          this.closeLead()
        })
      } else if((this.currentTab == 'Inbox' || this.currentTab == 'Sent Items') && this.type == 'forwardMail') {
        const params = {
          "content": this.mail_data,
        }

        params.recieverAddresses = this.mail_to.split(';')

        await this.$axios.$post(`/graph/mail/${this.emailDetails.id}/forward`, params, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Forward Email Has Been Sent Successfully.'
          this.closeLead()
        })
      } else if(this.currentTab == 'Inbox' && this.type == 'reply'){
        const params = {
          "content": this.mail_data,
        }

        params.recieverAddresses = this.mail_to.split(';')

        await this.$axios.$post(`/graph/mail/${this.emailDetails.id}/reply`, params, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Reply Email Has Been Sent Successfully.'
          this.closeLead()
        })
      }
    }
  },
}
</script>
  