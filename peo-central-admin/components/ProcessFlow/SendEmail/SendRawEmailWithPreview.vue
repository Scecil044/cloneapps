nice <template lang="">
  <v-dialog id="custom_dialog" v-model="emailDialog" persistent width="83vw">
    <v-card id="card" style="margin-bottom: 1rem !important; height: 92vh !important">
      <v-container fluid>
        <v-card-title id="card-title" class="mb-4">
          <h4 class="span_btnB">Send Email</h4>
          <div class="flex_row justify-lg-space-between">
            <v-btn class="tall__btn mr-2" color="lightgray" :disabled="loading? true:false" outlined @click="close()">
              <span class="pl-3 pr-3 span_data"> Cancel </span>
            </v-btn>
            <v-btn class="tall__btn" color="primary" :disabled="loading? true:false" @click="sendMail()">
              <span class="pl-6 pr-6 span_data"> Send Mail</span>
            </v-btn>
          </div>
        </v-card-title>
        <v-row class="py-0 mb-5" style="gap: 20px">
          <v-col cols="12">
            <div v-if="isBackendHtmlEmail" class="tw-flex tw-flex-col md:tw-flex-row tw-gap-8">
              <!-- Left: Editable Form -->
              <div class="tw-flex-1 tw-bg-white tw-p-8 tw-rounded-xl tw-shadow-lg tw-border tw-border-gray-200 tw-space-y-8">
                <div>
                  <h3 class="tw-font-bold tw-text-lg tw-mb-4 tw-text-gray-800">Email Details</h3>
                  <div class="tw-space-y-4">
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">From</label>
                      <v-text-field v-model="localEmailBody.from" :disabled="!isEditable" solo dense class="tw-w-full proposalDialog_date_field2" hide-details />
                    </div>
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">Send to</label>
                      <v-text-field v-model="toField" solo dense class="tw-w-full proposalDialog_date_field2" hide-details />
                    </div>
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">Cc</label>
                      <v-text-field v-model="ccField" solo dense class="tw-w-full proposalDialog_date_field2" hide-details />
                    </div>
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">Subject</label>
                      <v-text-field v-model="localEmailBody.subject" solo dense class="tw-w-full proposalDialog_date_field2" hide-details />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 class="tw-font-bold tw-text-lg tw-mb-4 tw-text-gray-800">Email Content</h3>
                  <div class="tw-space-y-4">
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">Title</label>
                      <v-text-field v-model="editableFields.title" solo dense class="tw-w-full proposalDialog_date_field2" hide-details @input="emitChanges" />
                    </div>
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">Intro Text</label>
                      <v-textarea v-model="editableFields.intro" solo dense class="tw-w-full proposalDialog_date_field2" hide-details @input="emitChanges" />
                    </div>
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">Instructions</label>
                      <v-textarea v-model="editableFields.instructions" solo dense class="tw-w-full proposalDialog_date_field2" hide-details @input="emitChanges" />
                    </div>
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1">Support Message</label>
                      <v-textarea v-model="editableFields.support" solo dense disabled class="tw-w-full tw-cursor-not-allowed proposalDialog_date_field2" hide-details @input="emitChanges" />
                    </div>
                    <div>
                      <label class="tw-block tw-font-semibold tw-text-gray-700 tw-mb-1 ">Footer</label>
                      <v-text-field v-model="editableFields.footer" solo dense disabled class="tw-w-full tw-cursor-not-allowed proposalDialog_date_field2" hide-details @input="emitChanges" />
                    </div>
                  </div>
                </div>
                <div v-if="attachments && attachments.length > 0" class="tw-pt-4">
                  <h4 class="tw-font-semibold tw-text-gray-700 tw-mb-2">Attachments</h4>
                  <div class="tw-flex tw-flex-wrap tw-gap-2">
                    <span v-for="(item, idx) in attachments" :key="idx">
                      <v-btn color="#fc6060" small class="rounded-xl mx-1" outlined @click="openDocument(item.url)">
                        <v-icon small>mdi-file-document-outline</v-icon>{{ item.name }}
                      </v-btn>
                      <v-icon small color="red" style="margin-left:-10px;margin-top:-20px" @click="deleteDocument(idx)">
                        fa-sharp fa-regular fa-circle-xmark
                      </v-icon>
                    </span>
                  </div>
                </div>
              </div>
              <!-- Divider for desktop -->
              <div class="tw-hidden md:tw-block tw-w-px tw-bg-gray-200 tw-mx-2"></div>
              <!-- Right: Preview -->
              <div class="tw-flex-1 tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-xl tw-border tw-border-gray-200 tw-max-h-[70vh] tw-overflow-y-auto">
                <div class="tw-font-semibold tw-mb-2">Preview</div>
                <iframe
                  :srcdoc="constructedHtml"
                  class="tw-w-full tw-border-none"
                  style="height: 80vh; min-height: 600px; border: none; background: transparent;"
                ></iframe>
              </div>
            </div>
            <!-- Fallback: original layout for all other cases -->
            <div v-else>
              <v-row class="ml-12 py-0 pt-0">
                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                  <quill-editor
                    ref="myQuillEditor"
                    v-model="localEmailBody.content"
                    :style="{ border: '2px solid #E2E7F1', 'border-radius': '10px' }"
                    @change="emitChanges"
                    @blur="emitChanges"
                  ></quill-editor>
                </v-col>
              </v-row>
            </div>
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
    isBackendHtmlEmail: {
      type: Boolean,
      default: false,
    },
    enrollmentId: String, // Pass this from parent if available
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
        content: ''
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
      // Editable fields for backend HTML email
      editableFields: {
        title: 'Welcome to NathanHR EOR Central',
        intro: 'To proceed with your setup, we need some details about your company.',
        instructions: 'Please fill out the form using the link below so we can verify your company information.',
        support: 'If you have any questions, feel free to reach out to our support team.',
        footer: 'Need assistance? Contact Support',
      },
    }
  },
  mounted() {
    console.log(this.automateCurrentAction, "automateCurrentAction");

    // Initialize the local emailBody from props
    this.$nextTick(() => {
      this.syncEmailBodyFromProps();
    });

    if(this.automateCurrentAction) {
      this.sendMail();
    }
  },
  computed: {
    isEditable() {
      return this.module == 'leads'
    },
    // Computed properties to handle array-to-string conversion for v-text-field
    toField: {
      get() {
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
    },
    constructedHtml() {
      if (!this.isBackendHtmlEmail) {

        const link = `https://peo-central.nathanhr.ae/enrollment-form?id=${this.enrollmentId || ''}`;
        return `<!DOCTYPE html>
          <html>
          <head>
            <meta charset=\"UTF-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>Complete Your Company Information</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); overflow: hidden; }
              .header { background: #004A99; color: #ffffff; text-align: center; padding: 20px; }
              .header img { max-width: 150px; }
              .content { padding: 30px; text-align: center; color: #333333; }
              .content h2 { color: #333333; }
              .content p { font-size: 16px; color: #555555; margin: 20px 0; }
              .cta-button { display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background: #004A99; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .cta-button:hover { background: #003570; }
              .footer { text-align: center; padding: 20px; font-size: 14px; color: #888888; background: #f4f4f4; }
              .footer a { color: #004A99; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class=\"container\">
              <div class=\"header\">
                <img src=\"https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1738235562677_logo.svg/logo.svg\" alt=\"NathanHR EOR Central\">
                <h1>Complete Your Company Information</h1>
              </div>
              <div class=\"content\">
                <h2>Welcome to NathanHR EOR Central</h2>
                <p>To proceed with your setup, we need some details about your company.</p>
                <p>Please fill out the form using the link below so we can verify your company information.</p>
                <a href=\"${link}\" class=\"cta-button\">Fill the Form</a>
                <p>If you have any questions, feel free to reach out to our support team.</p>
              </div>
              <div class=\"footer\">
                <p>Need assistance? <a href=\"mailto:peosupport@nathanhr.com\">Contact Support</a></p>
                <p>&copy; 2024 NathanHR EOR Central. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>`;
      }
      const link = `https://peo-central.nathanhr.ae/enrollment-form?id=${this.enrollmentId || ''}`;
      return `<!DOCTYPE html>
        <html>
        <head>
          <meta charset=\"UTF-8\">
          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
          <title>Complete Your Company Information</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: #004A99; color: #ffffff; text-align: center; padding: 20px; }
            .header img { max-width: 150px; }
            .content { padding: 30px; text-align: center; color: #333333; }
            .content h2 { color: #333333; }
            .content p { font-size: 16px; color: #555555; margin: 20px 0; }
            .cta-button { display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; background: #004A99; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .cta-button:hover { background: #003570; }
            .footer { text-align: center; padding: 20px; font-size: 14px; color: #888888; background: #f4f4f4; }
            .footer a { color: #004A99; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class=\"container\">
            <div class=\"header\">
              <img src=\"https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1738235562677_logo.svg/logo.svg\" alt=\"NathanHR EOR Central\">
              <h1>Complete Your Company Information</h1>
            </div>
            <div class=\"content\">
              <h2>${this.editableFields.title}</h2>
              <p>${this.editableFields.intro}</p>
              <p>${this.editableFields.instructions}</p>
              <a href=\"${link}\" class=\"cta-button\">Fill the Form</a>
              <p>${this.editableFields.support}</p>
            </div>
            <div class=\"footer\">
              <p>${this.editableFields.footer.replace('Contact Support', '<a href=\"mailto:peosupport@nathanhr.com\">Contact Support</a>')}</p>
              <p>&copy; 2024 NathanHR EOR Central. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>`;
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
        // Properly set each property to maintain reactivity
        this.localEmailBody.from = this.emailBody.from || '';

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

        this.localEmailBody.subject = this.emailBody.subject || '';
        this.localEmailBody.content = this.emailBody.content || '';
        this.localEmailBody.body = this.emailBody.body || '';
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
          content: this.localEmailBody.content || '',
          editableFields: this.isBackendHtmlEmail ? { ...this.editableFields } : undefined
        });
      }
    },

    sendMail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true

      // Make sure localEmailBody exists and has required properties
      if (!this.localEmailBody) {
        this.localEmailBody = {
          from: '',
          to: '',
          cc: '',
          subject: '',
          content: '',
          body: ''
        };
      }

      // Create a copy of the email body for sending
      const emailToSend = JSON.parse(JSON.stringify(this.localEmailBody));

      // Ensure content and body are synchronized
      if (this.isBackendHtmlEmail) {
        // Use the constructed HTML for both content and body
        emailToSend.content = this.constructedHtml;
        emailToSend.body = this.constructedHtml;
      } else {
        emailToSend.body = emailToSend.content || '';
      }

      // Emit changes one last time before sending
      this.emitChanges();

      // Process to field - ensure it's always an array
      if (!Array.isArray(emailToSend.to)) {
        emailToSend.to = [];
      }

      // Process cc field - ensure it's always an array
      if (!Array.isArray(emailToSend.cc)) {
        emailToSend.cc = [];
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

      this.$axios.$post(`/generic/send/emailraw`, emailToSend, { headers: { Authorization: AuthStr } })
        .then((res) => {
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
