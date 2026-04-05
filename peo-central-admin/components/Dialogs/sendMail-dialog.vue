<template>
  <v-dialog id="custom_dialog" v-model="emailDialog" persistent width="83vw">
    <v-card id="card" style="margin-bottom: 1rem !important; height: 92vh !important">
      <v-container fluid>
        <v-card-title id="card-title" class="mb-4">
          <h4 class="span_btnB">Send Email</h4>
          <div class="flex_row justify-lg-space-between">
            <v-btn class="tall__btn mr-2" color="lightgray" :disabled="isLoading || loading" outlined @click="close()">
              <span class="pl-3 pr-3 span_data">Cancel</span>
            </v-btn>
            <v-btn class="tall__btn" color="primary" :loading="loading" :disabled="isLoading || loading" @click="sendMail()">
              <span class="pl-6 pr-6 span_data">Send Mail</span>
            </v-btn>
          </div>
        </v-card-title>
        <v-row class="py-0 mb-5" style="gap: 20px">
          <v-col cols="12">
            <div class="d-flex align-center mb-6">
              <div style="width: 5% !important" class="d-flex align-center">
                <span>From</span>
              </div>
              <v-responsive max-width="344">
                <div class="loading-field-container">
                  <v-text-field :value="isLoading ? '' : emailBody.from" disabled solo dense type="input"
                    class="proposalDialog_date_field2" hide-details>
                    <template v-if="isLoading" v-slot:append>
                      <v-skeleton-loader type="text" class="skeleton-in-field"></v-skeleton-loader>
                    </template>
                  </v-text-field>
                </div>
              </v-responsive>
            </div>
            <div class="d-flex align-center mb-6">
              <div style="width: 5% !important" class="d-flex align-center">
                <span>Send to</span>
              </div>
              <v-responsive max-width="344">
                <v-combobox
                  v-model="localEmailBody.to"
                  :items="[]"
                  chips
                  multiple
                  clearable
                  small-chips
                  hide-selected
                  label="Add email and press enter"
                  :disabled="isLoading"
                  :rules="[validateEmailArray]"
                  @keydown.enter.native.prevent="onEmailInput('to')"
                  @blur="onEmailInput('to')"
                ></v-combobox>
              </v-responsive>
            </div>
            <div class="d-flex align-center mb-6">
              <div style="width: 5% !important" class="d-flex align-center">
                <span>Cc</span>
              </div>
              <v-responsive max-width="344">
                <v-combobox
                  v-model="localEmailBody.cc"
                  :items="[]"
                  chips
                  multiple
                  clearable
                  small-chips
                  hide-selected
                  label="Add email and press enter"
                  :disabled="isLoading"
                  :rules="[validateEmailArray]"
                  @keydown.enter.native.prevent="onEmailInput('cc')"
                  @blur="onEmailInput('cc')"
                ></v-combobox>
              </v-responsive>
            </div>
            <div class="d-flex align-center mb-6">
              <div style="width: 5% !important" class="d-flex align-center">
                <span>Subject</span>
              </div>
              <v-responsive max-width="344">
                <div class="loading-field-container">
                  <v-text-field :value="isLoading ? '' : emailBody.subject" :disabled="isLoading" solo dense
                    type="input" class="proposalDialog_date_field2" hide-details>
                    <template v-if="isLoading" v-slot:append>
                      <v-skeleton-loader type="text" class="skeleton-in-field"></v-skeleton-loader>
                    </template>
                  </v-text-field>
                </div>
              </v-responsive>
            </div>
            <v-row class="ml-12 py-0 pt-0">
              <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                <div class="loading-field-container">
                  <div v-if="isLoading" class="editor-skeleton">
                    <v-skeleton-loader type="article" class="skeleton-in-editor"></v-skeleton-loader>
                  </div>
                  <quill-editor v-else ref="myQuillEditor" v-model="emailBody.content"
                    :style="{ border: '2px solid #E2E7F1', borderRadius: '10px' }"></quill-editor>
                </div>
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
    emailBody: Object,
    isLoading: {
      type: Boolean,
      default: true
    }
  },
  components: {
    CustomInputContainer,
  },
  data() {
    return {
      loading: false,
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
      localEmailBody: {
        from: '',
        to: [],
        cc: [],
        subject: '',
        content: '',
        body: ''
      },
    }
  },
  watch: {
    emailBody: {
      immediate: true,
      handler(val) {
        this.localEmailBody = {
          from: val.from || '',
          to: Array.isArray(val.to)
            ? val.to
            : (typeof val.to === 'string' ? val.to.split(',').map(e => e.trim()).filter(Boolean) : []),
          cc: Array.isArray(val.cc)
            ? val.cc
            : (typeof val.cc === 'string' ? val.cc.split(',').map(e => e.trim()).filter(Boolean) : []),
          subject: val.subject || '',
          content: val.content || '',
          body: val.body || ''
        }
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    successfull() {
      this.$emit('successfull')
    },
    showError(message) {
      this.$emit('error', message)
    },
    validateEmailArray(arr) {
      if (!arr || !arr.length) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return arr.every(e => emailRegex.test(e)) || 'Invalid email address';
    },
    onEmailInput(field) {
      this.localEmailBody[field] = (this.localEmailBody[field] || [])
        .map(e => (typeof e === 'string' ? e.trim() : e))
        .filter((e, i, arr) => e && arr.indexOf(e) === i);
    },
    async sendMail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        this.loading = true
        this.emailBody.from = this.localEmailBody.from
        // Ensure to and cc are arrays of emails (not comma-separated strings)
        this.emailBody.to = Array.isArray(this.localEmailBody.to) ? this.localEmailBody.to : []
        this.emailBody.cc = Array.isArray(this.localEmailBody.cc) ? this.localEmailBody.cc : []
        this.emailBody.subject = this.localEmailBody.subject
        this.emailBody.content = this.localEmailBody.content
        this.emailBody.body = this.localEmailBody.content
        await this.$axios.$post(`/generic/send/email`, this.emailBody, { headers: { Authorization: AuthStr } })
        this.successfull()
      } catch (error) {
        console.log('Failed to send mail: ', error.message)
        this.showError(error.message)
      } finally {
        this.loading = false
      }
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

<style scoped>
.loading-field-container {
  position: relative;
  width: 100%;
}

.skeleton-in-field {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 12px;
  right: 12px;
  z-index: 1;
}

.editor-skeleton {
  border: 2px solid #E2E7F1;
  border-radius: 10px;
  min-height: 200px;
  padding: 12px;
}

.skeleton-in-editor {
  height: 200px;
}

:deep(.v-skeleton-loader__text) {
  height: 20px !important;
  border-radius: 4px;
}

:deep(.v-skeleton-loader__article) {
  min-height: 200px;
}

:deep(.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot) {
  background: #f5f5f5;
}

:deep(.v-text-field--is-disabled) {
  background: #f5f5f5;
}
</style>
