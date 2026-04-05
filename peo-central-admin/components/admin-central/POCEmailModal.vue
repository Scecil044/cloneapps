<template>
  <!-- Email Drawer -->
  <v-navigation-drawer
    v-model="showDrawer"
    app
    right
    temporary
    width="600"
    class="tw-border-l tw-border-gray-200"
    :disable-resize-watcher="true"
  >
    <!-- Drawer Header -->
    <div class="tw-flex tw-flex-col tw-h-full">
      <!-- Header -->
      <div class="tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-border-b tw-border-gray-200 tw-bg-gray-50">
        <div class="tw-flex tw-items-center tw-space-x-3">
          <v-icon color="primary" size="24">mdi-email</v-icon>
          <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800">Send Email</h3>
        </div>
        <v-btn
          icon
          small
          @click="closeDrawer"
          :disabled="loading"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Drawer Content -->
      <div class="tw-flex-1 tw-overflow-y-auto">
        <div class="tw-p-6 tw-space-y-6">
          <!-- Contact Info Banner -->
          <div v-if="contact" class="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
            <div class="tw-flex tw-items-center tw-space-x-3">
              <v-avatar size="40" color="primary" class="tw-bg-blue-100">
                <v-icon color="primary" size="20" v-if="!contact?.image_url">mdi-account</v-icon>
                <img v-else :src="contact.image_url" :alt="contact?.name" />
              </v-avatar>
              <div>
                <h4 class="tw-text-sm tw-font-semibold tw-text-gray-800">{{ contact?.name }}</h4>
                <p class="tw-text-xs tw-text-gray-600">{{ contact?.email }}</p>
                <p class="tw-text-xs tw-text-gray-500">{{ contact?.designation }}</p>
              </div>
            </div>
          </div>

          <!-- Email Form -->
          <div class="tw-space-y-4">
            <!-- From Field -->
            <div>
              <label class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2 tw-block">From</label>
              <v-text-field
                v-model="emailData.from"
                outlined
                dense
                hide-details
                placeholder="donotreply@nathanhr.ae"
                prepend-inner-icon="mdi-account"
              ></v-text-field>
            </div>

            <!-- To Field -->
            <div>
              <label class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2 tw-block">Send to</label>
              <v-text-field
                v-model="emailData.to"
                outlined
                dense
                hide-details
                :placeholder="contact?.email || 'Enter email address'"
                prepend-inner-icon="mdi-email"
              ></v-text-field>
            </div>

            <!-- Cc Field -->
            <div>
              <label class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2 tw-block">Cc</label>
              <v-text-field
                v-model="emailData.cc"
                outlined
                dense
                hide-details
                placeholder="Enter CC email addresses (comma separated)"
                prepend-inner-icon="mdi-email-multiple"
              ></v-text-field>
            </div>

            <!-- Subject Field -->
            <div>
              <label class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2 tw-block">Subject</label>
              <v-text-field
                v-model="emailData.subject"
                outlined
                dense
                hide-details
                placeholder="Enter email subject"
                prepend-inner-icon="mdi-format-title"
              ></v-text-field>
            </div>

            <!-- Attachments Section -->
            <div>
              <label class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2 tw-block">Attachments</label>

              <!-- File Upload -->
              <v-file-input
                v-model="newAttachment"
                label="Attach file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                :disabled="attachmentLoading"
                @change="handleFileUpload"
                prepend-icon="mdi-paperclip"
                outlined
                dense
                hide-details
                class="tw-mb-3"
              ></v-file-input>

              <!-- Upload Progress -->
              <div v-if="attachmentLoading" class="tw-flex tw-items-center tw-space-x-2 tw-text-xs tw-text-gray-500">
                <v-progress-circular indeterminate size="16" color="primary"></v-progress-circular>
                <span>Uploading...</span>
              </div>

              <!-- Attachments List -->
              <div v-if="attachments.length > 0" class="tw-space-y-2">
                <div
                  v-for="(attachment, index) in attachments"
                  :key="index"
                  class="tw-flex tw-items-center tw-justify-between tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-p-3"
                >
                  <div class="tw-flex tw-items-center tw-space-x-2">
                    <v-icon color="gray" size="20">mdi-file-document-outline</v-icon>
                    <span class="tw-text-sm tw-text-gray-700">{{ attachment.name }}</span>
                  </div>
                  <v-btn
                    icon
                    x-small
                    color="red"
                    @click="removeAttachment(index)"
                  >
                    <v-icon size="16">mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- Email Content -->
            <div>
              <label class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2 tw-block">Email Content</label>
              <div class="tw-border tw-border-gray-300 tw-rounded-lg tw-overflow-hidden">
                <quill-editor
                  ref="quillEditor"
                  v-model="emailData.content"
                  :style="{ minHeight: '300px' }"
                ></quill-editor>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="tw-border-t tw-border-gray-200 tw-bg-gray-50 tw-p-4">
        <div class="tw-flex tw-justify-end tw-space-x-3">
          <v-btn
            color="grey"
            outlined
            :disabled="loading"
            @click="closeDrawer"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            @click="sendEmail"
            :disabled="!emailData.to || !emailData.subject || !emailData.content"
          >
            <v-icon left small>mdi-send</v-icon>
            Send Mail
          </v-btn>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'POCEmailModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    contact: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      attachmentLoading: false,
      newAttachment: null,
      attachments: [],
      emailData: {
        from: 'donotreply@nathanhr.ae',
        to: '',
        cc: '',
        subject: '',
        content: ''
      }
    }
  },
  computed: {
    showDrawer: {
      get() {
        return this.open
      },
      set(value) {
        this.$emit('update:open', value)
      }
    }
  },
  watch: {
    open(newVal) {
      if (newVal) {
        this.initializeEmailData()
      }
    },
    contact: {
      handler(newContact) {
        if (newContact && this.open) {
          this.initializeEmailData()
        }
      },
      immediate: true
    }
  },
  methods: {
    initializeEmailData() {
      if (this.contact) {
        this.emailData.to = this.contact.email || ''

        // Check if this is a revoked access notification
        if (this.$route.query.emailType === 'revoked' || this.contact.emailType === 'revoked') {
          this.emailData.subject = `EOR Central Portal - Access Revocation Notice`
          this.emailData.content = this.getRevokedAccessEmailContent()
        } else {
          this.emailData.subject = `Welcome to EOR Central - Your Portal Credentials`
          this.emailData.content = this.getDefaultEmailContent()
        }
      }
    },
    getDefaultEmailContent() {
      if (!this.contact) return ''

      const portalUrl = 'https://eor-central-client.nathanhr.ae/'
      const firstName = this.contact.name ? this.contact.name.split(' ')[0] : 'User'
      const email = this.contact.email || ''
      const password = this.contact.password || 'Admin@123'

      return `
        <p>Hello ${firstName},</p>

        <p>Welcome to the EOR Central portal! We're excited to have you on board.</p>

        <p>Please find below your credentials for accessing the EOR Central client portal.</p>

        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-weight: 600; color: #495057;">Client Portal URL:</p>
          <p style="margin: 4px 0 12px 0;"><a href="${portalUrl}" style="color: #007bff; text-decoration: none;">${portalUrl}</a></p>

          <p style="margin: 0; font-weight: 600; color: #495057;">Your Email (use this to log in):</p>
          <p style="margin: 4px 0 12px 0;"><strong>${email}</strong></p>

          <p style="margin: 0; font-weight: 600; color: #495057;">Password:</p>
          <p style="margin: 4px 0 0 0;">${password}</p>
        </div>

        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please use your email address as your login username</li>
          <li>We recommend changing your password after your first login</li>
          <li>The portal provides access to all your EOR Central services and documents</li>
        </ul>

        <p><strong>Important Security Notes:</strong></p>
        <ul>
          <li>If you have any issues accessing the portal, please contact support via: peosupport@nathanhr.com</li>
        </ul>

        <p>If you have any questions or need assistance, our support team is here to help.</p>

        <p>Best regards,<br>
        <strong>The EOR Central Team</strong></p>

        <p><strong>Contact Information:</strong><br>
        Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>
      `
    },
    getRevokedAccessEmailContent() {
      if (!this.contact) return ''

      const firstName = this.contact.name ? this.contact.name.split(' ')[0] : 'User'

      return `
        <p>Hello ${firstName},</p>

        <p>This is to inform you that your access to the EOR Central portal has been revoked, effective immediately.</p>

        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-weight: 600; color: #495057;">Access Status:</p>
          <p style="margin: 4px 0 12px 0; color: #dc3545;"><strong>Revoked</strong></p>

          <p style="margin: 0; font-weight: 600; color: #495057;">User Email:</p>
          <p style="margin: 4px 0 12px 0;"><strong>${this.contact.email || ''}</strong></p>

          <p style="margin: 0; font-weight: 600; color: #495057;">Effective Date:</p>
          <p style="margin: 4px 0 0 0;">${new Date().toLocaleDateString()}</p>
        </div>

        <p>If you believe this has been done in error or if you have any questions regarding this action, please contact your company administrator or reach out to our support team.</p>

        <p><strong>Support Contact:</strong></p>
        <ul>
          <li>Email: peosupport@nathanhr.com</li>
          <li>Phone: +971 4 354 4466</li>
        </ul>

        <p>Thank you for your understanding.</p>

        <p>Best regards,<br>
        <strong>The EOR Central Team</strong></p>

        <p><strong>Contact Information:</strong><br>
        Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>
      `
    },
    async handleFileUpload(file) {
      if (!file) return

      this.attachmentLoading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const formData = new FormData()
      formData.append('documents', file)

      try {
        const response = await this.$axios.$post('/documents/simpleupload', formData, {
          headers: { Authorization: AuthStr }
        })

        if (Array.isArray(response) && response[0]) {
          const url = response[0]
          const name = file.name || 'Attachment'
          this.attachments.push({ url, name })
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        this.$emit('error', 'Failed to upload attachment')
      } finally {
        this.attachmentLoading = false
        this.newAttachment = null
      }
    },
    removeAttachment(index) {
      this.attachments.splice(index, 1)
    },
    async sendEmail() {
      if (!this.emailData.to || !this.emailData.subject || !this.emailData.content) {
        this.$emit('error', 'Please fill in all required fields')
        return
      }

      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        const emailPayload = {
          from: this.emailData.from,
          to: this.emailData.to.split(',').map(email => email.trim()).filter(email => email),
          cc: this.emailData.cc ? this.emailData.cc.split(',').map(email => email.trim()).filter(email => email) : [],
          subject: this.emailData.subject,
          content: this.emailData.content,
          body: this.emailData.content
        }

        // Add attachments if any
        if (this.attachments.length > 0) {
          emailPayload.attachments = this.attachments.map(attachment => ({
            filename: attachment.name,
            path: attachment.url
          }))
        }

        await this.$axios.$post('/generic/send/emailraw', emailPayload, {
          headers: { Authorization: AuthStr }
        })

        this.$emit('success', 'Email sent successfully')
        this.closeDrawer()
      } catch (error) {
        console.error('Error sending email:', error)
        this.$emit('error', error.response?.data?.message || 'Failed to send email')
      } finally {
        this.loading = false
      }
    },
    closeDrawer() {
      this.showDrawer = false
      this.attachments = []
      this.newAttachment = null
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/* Quill editor custom styles */
.ql-editor {
  min-height: 250px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.ql-toolbar {
  border-top: 1px solid #E2E7F1;
  border-left: 1px solid #E2E7F1;
  border-right: 1px solid #E2E7F1;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.ql-container {
  border-bottom: 1px solid #E2E7F1;
  border-left: 1px solid #E2E7F1;
  border-right: 1px solid #E2E7F1;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

/* Custom drawer styles */
.v-navigation-drawer {
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}
</style>
