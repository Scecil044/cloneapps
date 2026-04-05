<template lang="">
  <v-card
    id="card"
    style="margin-bottom: 1rem !important; height: 90vh !important"
  >
    <v-container fluid v-if="!view_estimate">
      <v-card-title id="card-title" class="mb-4">
        <h4 class="span_btnB">Email to Acme Corporation</h4>

        <div class="flex_row justify-lg-space-between">
          <v-btn
            class="tall__btn mr-2"
            color="lightgray"
            outlined
            @click="closeMailApproval"
          >
            <span class="pl-3 pr-3 span_data"> Cancel </span>
          </v-btn>
          <!-- v-if="estimate_in_pdf == false" -->

          <v-btn class="tall__btn" color="primary" @click="sendMail">
            <span class="pl-6 pr-6 span_data"> Send Mail</span>
          </v-btn>
        </div>
      </v-card-title>

      <v-row class="py-0 mb-5" style="gap: 20px">
        <v-col cols="12">
          <div class="d-flex align-center mb-6">
            <div style="width: 5% !important" class="d-flex align-center">
              <span class="">From</span>
            </div>

            <v-responsive class="" max-width="344">
              <v-text-field
                placeholder="contact@email.com"
                solo
                dense
                type="input"
                class="proposalDialog_date_field2"
                hide-details
                v-model="from"
              ></v-text-field>
            </v-responsive>
          </div>

          <div class="d-flex align-center mb-6">
            <div style="width: 5% !important" class="d-flex align-center">
              <span class="">Send to</span>
            </div>

            <v-responsive class="" max-width="344">
              <v-text-field
                placeholder="Ricky@email.com"
                solo
                dense
                type="input"
                class="proposalDialog_date_field2"
                hide-details
                v-for="(item,index) in to" :key="index"
                v-model="to[index]"
              ></v-text-field>
            </v-responsive>
          </div>
          <div class="d-flex align-center mb-6">
            <div style="width: 5% !important" class="d-flex align-center">
              <span class="">Cc</span>
            </div>

            <v-responsive class="" max-width="344">
              <v-text-field
                solo
                dense
                type="input"
                class="proposalDialog_date_field2"
                hide-details
                v-for="(item,index) in cc" :key="index"
                v-model="cc[index]"
              ></v-text-field>
            </v-responsive>
          </div>
          <div class="d-flex align-center mb-6">
            <div style="width: 5% !important" class="d-flex align-center">
              <span class="">Subject</span>
            </div>

            <v-responsive class="" max-width="344">
              <v-text-field
                placeholder="Proposal from NathanHR"
                solo
                dense
                type="input"
                class="proposalDialog_date_field2"
                hide-details
                v-model="subject"
              ></v-text-field>
            </v-responsive>
          </div>

          <div class="d-flex align-center mb-6 ml-16">
            <v-responsive class="" max-width="auto">
              <v-file-input
                label="Attach Files"
                color="primary"
                multiple
                hide-details
                clearable
                solo
                dense
                class="mail_Approval_FileAttach"
              ></v-file-input>
            </v-responsive>
          </div>

          <v-row class="ml-12 py-0 pt-0">
            <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
              <quill-editor
                ref="myQuillEditor"
                :style="{
                  border: '2px solid #E2E7F1',
                  'border-radius': '10px',
                }"
                v-model="body"
              ></quill-editor>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import '@/assets/scss/utils/_mailApprovalLead.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
  },
  computed: {
    ...mapState(['sendEmailForm', 'progressStep']),
    ...mapGetters(['getSendEmailForm']),
  },
  created(){
    this.$nuxt.$on('retrieveData', ($event) => {
      this.leadsDetail = $event.process
      this.selectedIndex = $event.selectedIndex
      this.btnName = this.leadsDetail.processes[this.selectedIndex].actions[0].button
      this.leadsID = this.leadsDetail._id
      // console.log($event, '-------$event 1')

      // console.log(this.leadsID, '-------', this.btnName)

    })
  },
  mounted(){
  },
  data() {
    return {
      AssignedTeam: ['Sahiba Tanwani', 'Shirin Khan'],
      view_estimate: false,
      //rules
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      from:"donotreply@nathanhr.ae",
      to: [''],
      cc: [''],
      subject: "",
      body: "",
      btnName: '',
      leadsDetail: {},
      selectedIndex: 0,
      leadsID: ''
    }
  },
  methods: {
    ...mapActions(['setProgressStep']),
    closeMailApproval() {
      if (this.getSendEmailForm === 'renewalRequest') {
        this.$router.push('../renewalRequest')
      } else {
        this.$router.push('../leads')
      }
    },
    sendMail() {

      if (this.getSendEmailForm === 'renewalRequest') {
        this.$router.push('../renewalRequest')
        this.setProgressStep(1)
      } else {

        // console.log(this.leadsID ,'---------this.leadsIDsd')
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.$axios.$post(`/leads/process/moveforward/${this.leadsID}`, { "button": this.btnName, from: this.from, to: this.to, cc: this.cc, subject: this.subject, body: this.body }, { headers: { Authorization: AuthStr } })
        .then((res) => {
          // console.log(res, '--------res')

          // this.$nuxt.$emit('fetchUpdatedLeadsProcess', this.leadsDetail._id)
          this.$nuxt.$emit('fetchUpdatedLeadsProcess', this.leadsDetail)
        })
        // console.log(this.from, this.to, this.cc, this.subject, this.body)

        // this.$router.push('../leads')
      }
    },
  },
}
</script>
