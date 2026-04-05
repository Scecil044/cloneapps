<template>
  <v-row>
    <!-- <SnackBar :data="snackbar_data" /> -->
    <!-- Email List  -->
    <v-col cols="12" sm="4" md="4" lg="4" class="pa-0">
      <EmailListInbox :currentTab="currentTab" :folder_id="folder_id" :newMailInboxList="emailInboxList"
        @ClickedSender="senderClicked($event)" @fetchUpdatedList="getNewFolderList($event)" v-if="showList" />
    </v-col>
    <!-- Email-Details -->
    <v-col cols="12" sm="8" md="8" lg="8" class="pa-0">
      <EmailBodyInbox :currentTab="currentTab" :selectedEmailSender="selectedEmailSender" v-if="showDetails" />
    </v-col>
  </v-row>
</template>

<script>
//   import '@/assets/scss/_customers.scss'
//   import SnackBar from '@/components/utils/SnackBar.vue'
import '@/assets/scss/utils/_mailInbox.scss'
import EmailListInbox from '~/components/Email/emailListInbox.vue'
import EmailBodyInbox from '~/components/Email/emailBodyInbox.vue'

export default {
  layout: 'dashboard',
  components: {
    EmailListInbox,
    EmailBodyInbox,
  },
  props: { folder_id: String, currentTab: String },
  data() {
    return {
      selectedEmailSender: {},
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },


      limit: '30',
      emailInboxList: [],
      showList: false,
      showDetails: false
    }
  },
  methods: {
    senderClicked($event) {
      this.showDetails = false
      this.selectedEmailSender = $event
      setTimeout(() => {
        this.showDetails = true
      }, 1);
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) {
        return text;
      } else {
        return text.substring(0, maxLength) + '...';
      }
    },
    async getNewFolderList($event) {
      await this.fetchEmailsIdByFolderId($event)
    },
    async fetchEmailsIdByFolderId(folder_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/graph/mail/fetchEmailsByFolder?limit=${this.limit}&folder_id=${folder_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          // console.log(response.data.value, '---------------fetch Email List Id')

          this.showList = false


          if (this.currentTab == 'Inbox') {
            this.emailInboxList = response.data.value.map((msg) => {

              const currentTime = new Date();
              const sentTime = new Date(msg.sentDateTime);
              const currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
              const sentDate = new Date(sentTime.getFullYear(), sentTime.getMonth(), sentTime.getDate());
              const timeDiff = Math.floor((currentDate - sentDate) / (1000 * 60 * 60 * 24));

              let day;
              if (timeDiff === 0) {
                day = 'Today';
              } else if (timeDiff === 1) {
                day = 'Yesterday';
              } else if (timeDiff === -1) {
                day = 'Tomorrow';
              } else {
                day = sentDate.toLocaleDateString('en-US', { weekday: 'long' });
              }

              const toRecipient = msg.toRecipients[0].emailAddress.name || '-';
              const ccRecipient = msg.ccRecipients ? msg.ccRecipients[0].emailAddress.name || '-' : '-';

              return {
                id: msg.id,
                sender_name: msg.sender.emailAddress.name,
                subject: msg.subject,
                time: new Date(msg.sentDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                day: day,
                to: toRecipient,
                cc: ccRecipient
              };
            });
          } else if (this.currentTab == 'Sent Items') {
            this.emailInboxList = response.data.value.map((msg) => {

              const currentTime = new Date();
              const sentTime = new Date(msg.sentDateTime);
              const currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
              const sentDate = new Date(sentTime.getFullYear(), sentTime.getMonth(), sentTime.getDate());
              const timeDiff = Math.floor((currentDate - sentDate) / (1000 * 60 * 60 * 24));

              let day;
              if (timeDiff === 0) {
                day = 'Today';
              } else if (timeDiff === 1) {
                day = 'Yesterday';
              } else if (timeDiff === -1) {
                day = 'Tomorrow';
              } else {
                day = sentDate.toLocaleDateString('en-US', { weekday: 'long' });
              }

              // const toRecipient = msg.toRecipients[0].emailAddress.name || '-';
              const toRecipient = msg.from.emailAddress.name || '-';


              const ccRecipient = msg.ccRecipients ? msg.ccRecipients[0].emailAddress.name || '-' : '-';

              const sender_name = msg.toRecipients.map(recipient => recipient.emailAddress.name);
              const concatenatedEmails = sender_name.join(';');

              return {
                id: msg.id,
                sender_name: concatenatedEmails,
                subject: msg.subject,
                time: new Date(msg.sentDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                day: day,
                to: toRecipient,
                cc: ccRecipient
              };
            });
          }


          // console.log(this.emailInboxList, '-----------------------this.emailInboxList')
        })
      this.showList = true
    },
  },

  computed: {},

  mounted() {
    // console.log(this.folder_id, '-------------------folder_id props')
    // console.log(this.currentTab, '---------------currentTab props')
    if (this.folder_id != '') {
      this.fetchEmailsIdByFolderId(this.folder_id)
    }
  },

  created() {
  }
}
</script>
