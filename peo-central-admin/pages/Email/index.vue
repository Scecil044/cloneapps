<template>
  <v-row class="sales_wrapper">
    <v-col cols="12" class="pa-0" v-if="loading">
      <div class="">
        <v-img src="/animated/ring.svg" max-width="1500" height="200" min-height="400" contain class="mr-3"></v-img>
      </div>
    </v-col>
    <v-col cols="12" class="pa-0" v-else>
      <div>
        <EmailInbox :currentTab="currentTab" :folder_id="folderId" v-if="showDetails" />
      </div>
    </v-col>
  </v-row>
</template>
  
<script>
//   import '@/assets/scss/_billings.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import EmailInbox from '~/components/Email/emailInbox.vue'
import paymentSchedule from '@/components/Billings/paymentSchedule.vue'
import SentEmail from '@/components/Email/sentEmail.vue'

export default {
  layout: 'dashboard',
  components: {
    SnackBar,
    paymentSchedule,
    EmailInbox,
    SentEmail,
  },
  data() {
    return {
      currentTab: 'Inbox',
      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },


      folderList:[],
      folderId:'',
      showDetails: false,
      loading: false
    }
  },
  methods: {
    changeTab(event) {
      // console.log(event, '-------event')
      this.currentTab = event
      if(event != undefined && this.folderList.length > 0) {
        const foundFolder = this.folderList.find(folder => folder.displayName === this.currentTab);
        this.showDetails = false
        setTimeout(() => {
          this.folderId = foundFolder.id
          // console.log(this.folderId, '---------fold id not mounted')
          this.showDetails = true
        }, 1);
      }
    },
    async getFolderList(){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true

      await this.$axios.$get(`/graph/mail/fetchEmailsFolders`,{ headers: { Authorization: AuthStr } })
      .then((response) => {
        this.folderList = response.data.value
        this.loading = false
        // console.log(this.folderList, "------------------------this.folderList")
      })
    },
  },
  computed: {
  },
  async mounted() {
    await this.getFolderList();


    if(this.folderList.length > 0) {
      const foundFolder = this.folderList.find(folder => folder.displayName === this.currentTab);
      this.folderId = foundFolder.id
      // console.log(this.folderId, '---------fold id mounted')
      this.showDetails = true
    }
    // console.log(this.currentTab, '----------------this.currentTab mounted')
  },
  created() {
    this.$nuxt.$on('tabChanged', ($event) => {
      this.changeTab($event)
    })
  },
  beforeDestroy() {
    this.$nuxt.$off('tabChanged')
  },
}
</script>
  