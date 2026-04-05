<template lang="">
    <v-dialog id="custom_dialog" v-model="smsDialog" persistent width="83vw">
      <v-card id="card" style="margin-bottom: 1rem !important; height: 92vh !important">
        <v-container fluid>
          <v-card-title id="card-title" class="mb-4">
            <h4 class="span_btnB">Send Sms</h4>
            <div class="flex_row justify-lg-space-between">
              <v-btn class="tall__btn mr-2" color="lightgray" :disabled="loading? true:false" outlined @click="close()">
                <span class="pl-3 pr-3 span_data"> Cancel </span>
              </v-btn>
              <!-- v-if="estimate_in_pdf == false" -->
              <v-btn class="tall__btn" color="primary" :disabled="loading? true:false" @click="sendSms()">
                <span class="pl-6 pr-6 span_data"> Send Sms</span>
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
                  <v-text-field v-model="smsBody.from"  disabled solo dense type="input" class="proposalDialog_date_field2" hide-details ></v-text-field>
                </v-responsive>
              </div>
              <div class="d-flex align-center mb-6">
                <div style="width: 5% !important" class="d-flex align-center">
                  <span class="">Send to</span>
                </div>
                <v-responsive class="" max-width="344">
                  <v-text-field v-model="smsBody.to"  solo dense type="input" class="proposalDialog_date_field2" hide-details></v-text-field>
                </v-responsive>
              </div>
              <!-- <div class="d-flex align-center mb-6">
                <div style="width: 5% !important" class="d-flex align-center">
                  <span class="">Cc</span>
                </div>
                <v-responsive class="" max-width="344">
                  <v-text-field v-model="smsBody.cc" solo dense type="input" class="proposalDialog_date_field2" hide-details></v-text-field>
                </v-responsive>
              </div> -->
              <div class="d-flex align-center mb-6">
                <div style="width: 5% !important" class="d-flex align-center">
                  <span class="">Subject</span> 
                </div>
  
                <v-responsive class="" max-width="344">
                  <v-text-field v-model="smsBody.subject"  solo dense type="input" class="proposalDialog_date_field2" hide-details></v-text-field>
                </v-responsive>
              </div>
              <!-- <div class="d-flex align-center mb-6 ml-16">
                <div class="ml-6" attachments.length > 
                    <span v-for="(item, idx) in attachments" :key="idx">
                      <v-btn color="#fc6060" small class="rounded-xl mx-1" outlined @click="openDocument(item.url)"><v-icon
                          small>mdi-file-document-outline</v-icon>{{ item.name }}
                        </v-btn>
                        <v-icon small color="red" style="margin-left:-10px;margin-top:-20px"
                              @click="deleteDocument(idx)">fa-sharp fa-regular fa-circle-xmark</v-icon>
                    </span>
                  </div>
              </v-responsive>
            </div> -->
              <v-row class="ml-12 py-0 pt-0">
                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                  <quill-editor  ref="myQuillEditor" v-model="smsBody.content" :style="{ border: '2px solid #E2E7F1', 'border-radius': '10px', }" ></quill-editor>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import '@/assets/scss/utils/_mailApprovalLead.scss'
  import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
  
  export default {
    props: {
      dialogData: Boolean,
      smsBody: Object,
      automateCurrentAction : Boolean, 
    },
    components: {
      CustomInputContainer,
    },
    data() {
      return {
        loading: false,
        attachment_loading: false,
        smsDialog: true,
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
      }
    },
    mounted() {
      console.log(this.automateCurrentAction, "automateCurrentAction")
      if(this.automateCurrentAction) {
        this.sendSms()
      }
    },
    methods: {
      deleteDocument(index) {
        this.attachments.splice(index, 1)
      },
  
      openDocument(url) {
        window.open(url)
      },
      close() {
        this.$emit('close')
      },
      successfull() {
        this.$emit('successfull')
      },
      sendSms() {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.loading = true
        this.smsBody.body = this.smsBody.content
        // if (typeof this.smsBody.to == 'string') {
        //   this.smsBody.to = this.smsBody.to.split(',')
        // }
        // if (typeof this.smsBody.cc == 'string') {
        //   this.smsBody.cc = this.smsBody.cc.split(',')
        // }
        // if (this.attachments.length > 0) {
        //   this.smsBody.attachments = []
        //   for (let index = 0; index < this.attachments.length; index++) {
        //     const element = this.attachments[index];
        //     this.smsBody.attachments.push(
        //       {
        //         "filename": element.url.toString().split('/')[-1], //to get the file name with file format
        //         "path": element.url
        //       }
        //     )
        //   }
        // }
        this.$axios.$post(`/sms_template/sendSms`, this.smsBody, { headers: { Authorization: AuthStr } })
          .then((res) => {
            this.loading = false,
              this.successfull()
          })
          .catch(e => console.log(e))
      },
    //   async clickedDocument(event) {
    //     if (event[0] == undefined || !event[0].name) return
  
    //     const AuthStr = 'Bearer '.concat(this.$store.state.token)
  
    //     const fd = new FormData()
    //     fd.append('documents', event[0])
  
    //     await this.$axios.$post(`/documents/simpleupload`, fd, { headers: { Authorization: AuthStr } })
    //       .then((res) => {
    //         this.attachment = res[0]
    //       })
    //       .catch(e => console.log(e))
    //   }
    },
  }
  </script>
  