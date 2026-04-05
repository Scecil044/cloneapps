<template>
  <v-row>
    <!-- <SnackBar :data="snackbar_data" /> -->
    <!-- Email List  -->
    <v-col cols="12" md="4" lg="4" class="pa-0">
      <EmailListSent @ClickedSender="senderClicked($event)" class="" />
    </v-col>
    <!-- Email-Details-Tabs -->
    <v-col cols="12" md="8" lg="8" class="pa-0">
      <EmailBodySent :selectedEmailSender="selectedEmailSender" />
    </v-col>
  </v-row>
</template>

<script>
//   import '@/assets/scss/_customers.scss'
//   import SnackBar from '@/components/utils/SnackBar.vue'
import EmailListInbox from '~/components/Email/emailListInbox.vue'
import EmailListSent from '~/components/Email/emailListSent.vue'
// import EmailBody from '~/components/Email/emailBody.vue'
import EmailBodySent from '~/components/Email/emailBodySent.vue'

export default {
  layout: 'dashboard',
  components: {
    EmailBodySent,
    EmailListSent,
    EmailListInbox,
    // EmailBody,
  },
  data() {
    return {
      //selected employee status
      selectedEmailSender: {},
      currentTab: 'all',
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
    }
  },
  methods: {
    //email sender Object
    senderClicked($event) {
      this.selectedEmailSender = $event
      //   console.log('selected sender ==>', this.selectedEmailSender)
    },
  },

  computed: {},

  mounted() { },
}
</script>
