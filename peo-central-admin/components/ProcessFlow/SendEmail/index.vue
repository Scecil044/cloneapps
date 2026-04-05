<template lang="">
  <div>
    <span v-if="attachment_loading"></span>
    <SendRawMailDialog v-else :emailBody="emailBody" @close="close()"
      :attachments="selectedAttachments" @successfull="successfull()" />
  </div>
</template>

<script>
import '@/assets/scss/utils/_mailApprovalLead.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SendRawMailDialog from '@/components/ProcessFlow/SendEmail/sendRawEmail.vue'

export default {
  props: {
    dialogData: Boolean,
    emailBody: Object,
    foreign_id: String,
    identifier: String
  },
  components: {
    CustomInputContainer,
    SendRawMailDialog
  },
  data() {
    return {
      loading: false,
      attachment_loading: false,
      emailDialog: true,
      //rules
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],

      currentOnboardingObj: {},
      currentObjIndex: [],
      selectedAttachments: [],
    }
  },
  mounted() {
    this.getDocuments()
  },
  methods: {
    async getDocuments() {
      this.attachment_loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let obj = {
        "foreign_id": this.foreign_id,
        "identifier": this.identifier
      }
      let documentsList = await this.$axios.$post('/documents/identifier/foreignid', obj, { headers: { Authorization: AuthStr } })
      if (documentsList.length > 0) {
        this.attachment_loading = false
        documentsList.forEach(item => {
          this.selectedAttachments.push(item)
        });
      }
    },
    close() {
      this.attachment_loading = false
      this.$emit('close')
    },
    successfull() {
      this.attachment_loading = false
      this.$emit('successfull')
    },
    sendMail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true
      this.emailBody.body = this.emailBody.content
      if (typeof this.emailBody.to == 'string') {
        this.emailBody.to = this.emailBody.to.split(',')
      }
      if (typeof this.emailBody.cc == 'string') {
        this.emailBody.cc = this.emailBody.cc.split(',')
      }
      this.$axios.$post(`/generic/send/email`, this.emailBody, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.loading = false,
            this.successfull()
        })
        .catch(e => console.log(e))
    },
    async clickedDocument(event) {
      if (event[0] == undefined || !event[0].name) return

      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      const fd = new FormData()
      fd.append('documents', event[0])

      await this.$axios.$post(`/documents/simpleupload`, fd, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.attachment = res[0]
        })
        .catch(e => console.log(e))
    }
  },
}
</script>
