<template lang="">
  <v-dialog id="custom_dialog" v-model="emailDialog" persistent width="83vw">
    <v-card id="card" style="margin-bottom: 1rem !important; height: 92vh !important">
      <v-container fluid>
        <v-card-title id="card-title" class="mb-4">
          <h4 class="span_btnB">Send Email</h4>
          <div class="flex_row justify-lg-space-between">
            <v-btn class="tall__btn mr-2" color="lightgray" :disabled="loading? true:false" outlined @click="close()">
              <span class="pl-3 pr-3 span_data"> Cancel </span>
            </v-btn>
            <!-- v-if="estimate_in_pdf == false" -->
            <v-btn class="tall__btn" color="primary" :disabled="loading? true:false" @click="sendMail()">
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
                <v-text-field v-model="localEmailBody.from"  :disabled="!isEditable"  solo dense type="input" class="proposalDialog_date_field2" hide-details ></v-text-field>
              </v-responsive>
            </div>
            <div class="d-flex align-center mb-6">
              <div style="width: 5% !important" class="d-flex align-center">
                <span class="">Send to</span>
              </div>
              <v-responsive class="" max-width="344">
                <v-text-field v-model="toField" solo dense type="input" class="proposalDialog_date_field2" hide-details></v-text-field>
              </v-responsive>
            </div>
            <div class="d-flex align-center mb-6">
              <div style="width: 5% !important" class="d-flex align-center">
                <span class="">Cc</span>
              </div>
              <v-responsive class="" max-width="344">
                <v-text-field v-model="ccField" solo dense type="input" class="proposalDialog_date_field2" hide-details></v-text-field>
              </v-responsive>
            </div>
            <div class="d-flex align-center mb-6">
              <div style="width: 5% !important" class="d-flex align-center">
                <span class="">Subject</span>
              </div>

              <v-responsive class="" max-width="344">
                <v-text-field v-model="localEmailBody.subject"  solo dense type="input" class="proposalDialog_date_field2" hide-details></v-text-field>
              </v-responsive>
            </div>
            <div class="d-flex align-center mb-6 ml-16">
              <div class="ml-6" v-if="attachments && attachments.length > 0">
                  <span v-for="(item, idx) in attachments" :key="idx">
                    <v-btn color="#fc6060" small class="rounded-xl mx-1" outlined @click="openDocument(item.url)"><v-icon
                        small>mdi-file-document-outline</v-icon>{{ item.name }}
                      </v-btn>
                      <v-icon small color="red" style="margin-left:-10px;margin-top:-20px"
                            @click="deleteDocument(idx)">fa-sharp fa-regular fa-circle-xmark</v-icon>
                  </span>
              </div>
            </div>
            <v-row class="ml-12 py-0 pt-0">
              <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                <quill-editor
                  ref="myQuillEditor"
                  v-model="localEmailBody.content"
                  :style="{ border: '2px solid #E2E7F1', 'border-radius': '10px' }"
                  @change="emitChanges"
                  @blur="emitChanges"
                ></quill-editor>
                <!-- Billings: Additional file upload -->
                <div v-if="module === 'billings'" class="mt-6">
                  <v-divider></v-divider>
                  <div class="mt-4 mb-2 tw-font-semibold">Attach an additional file?</div>
                  <v-file-input
                    label="Select file to attach"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    :disabled="attachment_loading"
                    @change="handleAdditionalFileUpload"
                    prepend-icon="mdi-paperclip"
                    outlined
                    dense
                  ></v-file-input>
                  <div v-if="attachment_loading" class="tw-text-xs tw-text-gray-500 tw-mt-2">Uploading...</div>
                  <!-- <div v-if="additionalAttachment" class="mt-2">
                    <v-btn color="#fc6060" small class="rounded-xl mx-1" outlined @click="openDocument(additionalAttachment.url)">
                      <v-icon small>mdi-file-document-outline</v-icon>{{ additionalAttachment.name }}
                    </v-btn>
                    <v-icon small color="red" style="margin-left:-10px;margin-top:-20px" @click="removeAdditionalAttachment">fa-sharp fa-regular fa-circle-xmark</v-icon>
                  </div> -->
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
    attachments: Array,
    automateCurrentAction: Boolean,
    module: String,
  },
  components: {
    CustomInputContainer,
  },
  data() {
    return {
      loading: false,
      attachment_loading: false,
      emailDialog: true,
      // Initialize with empty object to avoid reactivity warnings
      localEmailBody: {
        from: '',
        to: [],
        cc: [],
        subject: '',
        content: '',
        body: ''
      },
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
      additionalAttachment: null,
    }
  },
  mounted() {
    console.log(this.automateCurrentAction, "automateCurrentAction");

    // Initialize the local emailBody from props
    this.$nextTick(() => {
      this.syncEmailBodyFromProps();

      // Only send automatically after data is synced
      if(this.automateCurrentAction) {
        // Add a small delay to ensure data is properly synced
        setTimeout(() => {
          this.sendMail();
        }, 100);
      }
    });
  },
  computed: {
    isEditable() {
      return this.module == 'leads'
    },
    // Computed properties to handle array-to-string conversion for v-text-field
    toField: {
      get() {
        if (this.attachments && this.attachments.length > 0) {
          console.log('Current attachments:', this.attachments);
          if (this.attachments[0] && this.attachments[0]?.invoiceData) {
            // if this.localEmailBody.to has companies replace companies with invoiceData.email
            const toArray = Array.isArray(this.localEmailBody.to) ? this.localEmailBody.to : [];
            const updatedToArray = toArray.map(email => {
              if (email && email.toLowerCase() === 'companies') {
                return this.attachments[0].invoiceData.email || email;
              }
              return email;
            });
            // Update the actual localEmailBody.to array
            this.localEmailBody.to = updatedToArray;
            return updatedToArray.join(', ');
          }
        }
        return Array.isArray(this.localEmailBody.to) ? this.localEmailBody.to.join(', ') : '';
      },
      set(value) {
        if (typeof value === 'string') {
          this.localEmailBody.to = value.split(',').map(email => email.trim()).filter(Boolean);
        } else {
          this.localEmailBody.to = [];
        }
      }
    },
    ccField: {
      get() {
        return Array.isArray(this.localEmailBody.cc) ? this.localEmailBody.cc.join(', ') : '';
      },
      set(value) {
        if (typeof value === 'string') {
          this.localEmailBody.cc = value.split(',').map(email => email.trim()).filter(Boolean);
        } else {
          this.localEmailBody.cc = [];
        }
      }
    }
  },
  watch: {
    // Watch for prop changes to update local copy
    emailBody: {
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.syncEmailBodyFromProps();
          });
        }
      },
      deep: true,
      immediate: true
    },
    // Watch local changes to emit updates
    'localEmailBody.subject'() {
      this.emitChanges();
    },
    'localEmailBody.content'() {
      this.emitChanges();
    },
    // Skip deep watcher to avoid recursion issues with Vue reactivity
    // Instead, rely on individual property watchers
  },
  methods: {
    // Synchronize local copy with props
    syncEmailBodyFromProps() {
      // Create a deep clone of the email body from props
      if (this.emailBody) {
        console.log('Syncing email body from props:', this.emailBody);

        // Properly set each property to maintain reactivity
        this.localEmailBody.from = this.emailBody.from || 'donotreply@nathanhr.ae';

        // Handle 'to' field - ensure it's always an array for consistency
        if (Array.isArray(this.emailBody.to)) {
          this.localEmailBody.to = [...this.emailBody.to]; // Create a copy of the array
        } else if (typeof this.emailBody.to === 'string') {
          this.localEmailBody.to = this.emailBody.to.split(',').map(email => email.trim()).filter(Boolean);
        } else {
          this.localEmailBody.to = [];
        }

        // Handle 'cc' field - ensure it's always an array for consistency
        if (Array.isArray(this.emailBody.cc)) {
          this.localEmailBody.cc = [...this.emailBody.cc]; // Create a copy of the array
        } else if (typeof this.emailBody.cc === 'string') {
          this.localEmailBody.cc = this.emailBody.cc.split(',').map(email => email.trim()).filter(Boolean);
        } else {
          this.localEmailBody.cc = [];
        }

        // Preserve the original content and subject
        this.localEmailBody.subject = this.emailBody.subject || '';
        this.localEmailBody.content = this.emailBody.content || this.emailBody.body || '';
        this.localEmailBody.body = this.emailBody.body || this.emailBody.content || '';

        console.log('Synced local email body:', this.localEmailBody);
      }
    },

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

    // Emit changes to parent whenever content or subject changes
    emitChanges() {
      if (this.localEmailBody) {
        this.$emit('content-updated', {
          subject: this.localEmailBody.subject || '',
          content: this.localEmailBody.content || ''
        });
      }
    },

    sendMail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true

      // Ensure we have valid email data before proceeding
      if (!this.localEmailBody || !this.localEmailBody.to || !this.localEmailBody.subject || !this.localEmailBody.content) {
        console.error('Missing required email data:', this.localEmailBody);
        this.loading = false;
        return;
      }

      // Create a copy of the email body for sending
      const emailToSend = JSON.parse(JSON.stringify(this.localEmailBody));

      console.log('Email to send before processing:', emailToSend);

      // Ensure content and body are synchronized - preserve original content
      if (emailToSend.content && !emailToSend.body) {
        emailToSend.body = emailToSend.content;
      } else if (emailToSend.body && !emailToSend.content) {
        emailToSend.content = emailToSend.body;
      }

      // Emit changes one last time before sending
      this.emitChanges();

      // Process to field - ensure it's always an array but preserve data
      if (!Array.isArray(emailToSend.to)) {
        if (typeof emailToSend.to === 'string' && emailToSend.to.trim()) {
          emailToSend.to = emailToSend.to.split(',').map(email => email.trim()).filter(Boolean);
        } else {
          emailToSend.to = [];
        }
      }

      // Process cc field - ensure it's always an array but preserve data
      if (!Array.isArray(emailToSend.cc)) {
        if (typeof emailToSend.cc === 'string' && emailToSend.cc.trim()) {
          emailToSend.cc = emailToSend.cc.split(',').map(email => email.trim()).filter(Boolean);
        } else {
          emailToSend.cc = [];
        }
      }

      // Process attachments
      if (this.attachments && this.attachments.length > 0) {
        emailToSend.attachments = []
        for (let index = 0; index < this.attachments.length; index++) {
          const element = this.attachments[index];
          if (element && element.url) {
            try {
              emailToSend.attachments.push({
                "filename": element?.name || element.url.toString().split('/').pop(),
                "path": element.url
              });
            } catch (e) {
              console.error('Error processing attachment:', e);
            }
          }
        }
      }

      console.log('Final email to send:', emailToSend);

      // Validate email data before sending
      if (!emailToSend.to || emailToSend.to.length === 0) {
        console.error('No recipients specified');
        this.loading = false;
        return;
      }

      if (!emailToSend.subject || !emailToSend.content) {
        console.error('Missing subject or content');
        this.loading = false;
        return;
      }

      this.$axios.$post(`/generic/send/emailraw`, emailToSend, { headers: { Authorization: AuthStr } })
        .then((res) => {
          console.log('Email sent successfully:', res);
          this.loading = false;
          this.successfull();
        })
        .catch(e => {
          this.loading = false;
          console.error('Error sending email:', e);
          // Show error notification if possible
          if (this.$store && this.$store.commit) {
            try {
              this.$store.commit('snackbar/showSnackbar', {
                text: 'Failed to send email: ' + (e.response?.data?.message || e.message || 'Unknown error'),
                color: 'error'
              });
            } catch (err) {
              console.warn('Could not show error notification:', err);
            }
          }
        })
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
    },
    async handleAdditionalFileUpload(file) {
      if (!file) return;
      this.attachment_loading = true;
      const AuthStr = 'Bearer '.concat(this.$store.state.token);
      const fd = new FormData();
      fd.append('documents', file);
      try {
        const res = await this.$axios.$post('/documents/simpleupload', fd, { headers: { Authorization: AuthStr } });
        if (Array.isArray(res) && res[0]) {
          // Extract filename from URL
          let url = res[0];
          let name = 'Attachment';
          try {
            const urlParts = url.split('/');
            name = decodeURIComponent(urlParts[urlParts.length - 1] || 'Attachment');
          } catch (e) {}
          const attachmentObj = { url, name };
          this.additionalAttachment = attachmentObj;
          if (!this.attachments) this.attachments = [];
          this.attachments.push(attachmentObj);
        }
      } catch (e) {
        console.error('Error uploading additional file:', e);
      }
      this.attachment_loading = false;
    },
    removeAdditionalAttachment() {
      if (this.additionalAttachment) {
        const idx = this.attachments.findIndex(a => a.url === this.additionalAttachment.url);
        if (idx !== -1) this.attachments.splice(idx, 1);
        this.additionalAttachment = null;
      }
    }
  },
}
</script>

<style scoped>
/* Preview styles - only used when component is used for invoices */
.preview-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.preview-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.preview-not-available {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 48px 0;
}

/* Text styles */
.text-muted {
  color: #757575;
}

/* Field layout styles */
.proposalDialog_date_field2 >>> .v-input__control {
  min-height: 40px !important;
}

.proposalDialog_date_field2 >>> .v-input__slot {
  min-height: 40px !important;
  box-shadow: none !important;
  border: 1px solid #E0E0E0 !important;
}
</style>
