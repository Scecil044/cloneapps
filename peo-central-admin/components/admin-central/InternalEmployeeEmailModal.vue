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
          <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800">Send Credentials Email</h3>
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
          <!-- Employee Info Banner -->
          <div v-if="employee" class="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
            <div class="tw-flex tw-items-center tw-space-x-3">
              <v-avatar size="40" color="primary" class="tw-bg-blue-100">
                <v-icon color="primary" size="20" v-if="!employee?.avatar">mdi-account</v-icon>
                <img v-else :src="employee.avatar" :alt="employee?.firstName" />
              </v-avatar>
              <div>
                <h4 class="tw-text-sm tw-font-semibold tw-text-gray-800">{{ employee?.firstName || 'User' }} {{ employee?.lastName || '' }}</h4>
                <p class="tw-text-xs tw-text-gray-600">{{ employee?.email || 'No email provided' }}</p>
                <p class="tw-text-xs tw-text-gray-500">{{ employee?.designation || 'Staff' }}</p>
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
                :placeholder="employee?.email || 'Enter email address'"
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
            Send Email
          </v-btn>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'InternalEmployeeEmailModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    employee: {
      type: Object,
      default: null
    },
    isNewEmployee: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
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
    employee: {
      handler(newEmployee) {
        if (newEmployee && this.open) {
          this.initializeEmailData()
        }
      },
      immediate: true
    }
  },
  methods: {
    initializeEmailData() {
      if (this.employee && this.employee.email) {
        this.emailData.to = this.employee.email || ''
        this.emailData.subject = this.isNewEmployee
          ? `Welcome to EOR Central - Your Portal Credentials`
          : `Updated Portal Credentials - EOR Central`
        this.emailData.content = this.getDefaultEmailContent()
      }
    },
    getDefaultEmailContent() {
      if (!this.employee || !this.employee.email) return ''

      const portalUrl = 'https://eor-central.nathanhr.ae/'
      const defaultPassword = 'Admin@123'
      const firstName = this.employee.firstName || 'User'
      const email = this.employee.email || ''
      const password = this.employee.password || defaultPassword

      if (this.isNewEmployee) {
        return `
          <p>Hello ${firstName},</p>

          <p>Welcome to the EOR Central team! We're excited to have you on board.</p>

          <p>Please find herein your credentials for the EOR-Central portal. Feel free to change your password from the Login screen.</p>

          <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: 600; color: #495057;">Portal URL:</p>
            <p style="margin: 4px 0 12px 0;"><a href="${portalUrl}" style="color: #007bff; text-decoration: none;">${portalUrl}</a></p>

            <p style="margin: 0; font-weight: 600; color: #495057;">Email:</p>
            <p style="margin: 4px 0 12px 0;">${email}</p>

            <p style="margin: 0; font-weight: 600; color: #495057;">Password:</p>
            <p style="margin: 4px 0 0 0;">${password}</p>
          </div>

          <p><strong>Important Security Notes:</strong></p>
          <ul>
            <li>Please change your password immediately after your first login</li>
            <li>Keep your credentials secure and do not share them with anyone</li>
            <li>If you have any issues accessing the portal, please contact support via peosupport@nathanhr.com</li>
          </ul>

          <p>If you have any questions or need assistance, our support team is here to help.</p>

          <p>Best regards,<br>
          <strong>The EOR Central Team</strong></p>

          <p><strong>Contact Information:</strong><br>
          Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>
        `
      } else {
        return `
          <p>Hello ${firstName},</p>

          <p>Your EOR Central portal credentials have been updated. Please find your new login information below.</p>

          <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: 600; color: #495057;">Portal URL:</p>
            <p style="margin: 4px 0 12px 0;"><a href="${portalUrl}" style="color: #007bff; text-decoration: none;">${portalUrl}</a></p>

            <p style="margin: 0; font-weight: 600; color: #495057;">Email:</p>
            <p style="margin: 4px 0 12px 0;">${email}</p>

            <p style="margin: 0; font-weight: 600; color: #495057;">New Password:</p>
            <p style="margin: 4px 0 0 0;">${password}</p>
          </div>

          <p><strong>Security Reminder:</strong></p>
          <ul>
            <li>Please change your password after logging in</li>
            <li>Keep your credentials secure and do not share them</li>
            <li>If you didn't request this change, please contact IT immediately</li>
          </ul>

          <p>If you have any questions or need assistance, please don't hesitate to reach out to us.</p>

          <p>Best regards,<br>
          <strong>The EOR Central Team</strong></p>

          <p><strong>Contact Information:</strong><br>
          Main office: Office No. 1006, 10th Floor, Marina Plaza, Dubai, United Arab Emirates<br>
        `
      }
    },
    async sendEmail() {
      if (!this.emailData.to || !this.emailData.subject || !this.emailData.content) {
        this.$emit('error', 'Please fill in all required fields')
        return
      }

      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        // Validate email addresses
        const toEmails = this.emailData.to.split(',').map(email => email.trim()).filter(email => email)
        const ccEmails = this.emailData.cc ? this.emailData.cc.split(',').map(email => email.trim()).filter(email => email) : []

        if (toEmails.length === 0) {
          throw new Error('No valid email addresses provided')
        }

        const emailPayload = {
          from: this.emailData.from || 'donotreply@nathanhr.ae',
          to: toEmails,
          cc: ccEmails,
          subject: this.emailData.subject || 'EOR Central Portal Credentials',
          content: this.emailData.content,
          body: this.emailData.content
        }

        await this.$axios.$post('/generic/send/emailraw', emailPayload, {
          headers: { Authorization: AuthStr }
        })

        this.$emit('success', 'Credentials email sent successfully')
        this.closeDrawer()
      } catch (error) {
        console.error('Error sending email:', error)
        let errorMessage = 'Failed to send email'

        try {
          if (error && typeof error === 'object') {
            if (error.response && error.response.data && typeof error.response.data === 'object') {
              if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message
              } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error
              }
            } else if (error.message && typeof error.message === 'string') {
              errorMessage = error.message
            }
          }
        } catch (parseError) {
          console.error('Error parsing email error message:', parseError)
          errorMessage = 'Failed to send email'
        }

        this.$emit('error', errorMessage)
      } finally {
        this.loading = false
      }
    },
    closeDrawer() {
      this.showDrawer = false
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
