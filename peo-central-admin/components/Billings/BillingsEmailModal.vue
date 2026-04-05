<template>
  <!-- Using SendRawEmail component as a base with extended functionality for invoice emails -->
  <SendRawEmail
    v-if="emailDialog"
    :dialogData="dialogData"
    :emailBody="enhancedEmailBody"
    :attachments="attachments"
    :automateCurrentAction="automateCurrentAction"
    :module="'billings'"
    :editableTo="true"
    @close="close"
    @successfull="successfull"
    @content-updated="handleContentUpdated"
    @to-updated="handleToUpdated"
    ref="sendRawEmailRef"
  />
</template>

<script>
import '@/assets/scss/utils/_mailApprovalLead.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SendRawEmail from '@/components/ProcessFlow/SendEmail/sendRawEmail.vue'

export default {
  props: {
    dialogData: Boolean,
    emailBody: Object,
    attachments: Array,
    automateCurrentAction: Boolean,
    module: String,
    invoices: Array
  },
  components: {
    CustomInputContainer,
    SendRawEmail
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
    }
  },
  computed: {
    // Process email body with enhanced invoice functionality
    enhancedEmailBody() {
      const baseEmailBody = this.emailBody || {};
      // If subject is empty or undefined, set a default subject for invoices
      const defaultSubject = this.invoices && this.invoices.length === 1 ?
        `Invoice ${this.invoices[0].invoice_number || ''} - Payment Due` :
        'Invoice Payment Due';
      // Set from address based on module, but always override if billings
      let fromAddress = baseEmailBody.from || 'donotreply@nathanhr.ae';
      if (this.module === 'billings') {
        // console.log("condition for module met. this is the console---------->")
        fromAddress = 'accounts@nathanhr.com';
      }
      return {
        ...baseEmailBody,
        from: fromAddress,
        to: baseEmailBody.to || '',
        cc: baseEmailBody.cc || '',
        subject: baseEmailBody.subject || defaultSubject,
        content: baseEmailBody.content || '',
        body: baseEmailBody.body || ''
      };
    },
    isEditable() {
      return this.module == 'leads'
    },
    isMultipleAttachments() {
      return this.attachments && this.attachments.length > 1
    }
  },
  mounted() {
    // Enhanced, visible console log for attachments
    console.log("==============================");
    console.log("[BillingsEmailModal] Attachments:", this.attachments);
    console.log(`[BillingsEmailModal] Attachments count: ${this.attachments ? this.attachments.length : 0}`);
    console.log("==============================");
    console.log(this.module, "this is the module we want to check");

    // Monkeypatch the SendRawEmail component to use our enhanced methods
    if (this.$refs.sendRawEmailRef) {
      // Override methods to use our enhanced versions
      const originalSendMail = this.$refs.sendRawEmailRef.sendMail;
      this.$refs.sendRawEmailRef.sendMail = this.sendMail;

      // Add our methods that don't exist in SendRawEmail
      this.$refs.sendRawEmailRef.getInvoiceNumber = this.getInvoiceNumber;
      this.$refs.sendRawEmailRef.isPdfUrl = this.isPdfUrl;
      this.$refs.sendRawEmailRef.downloadInvoice = this.downloadInvoice;
    }

    if (this.automateCurrentAction) {
      this.sendMail()
    }
  },
  methods: {
    handleContentUpdated(updatedContent) {
      console.log('Content updated:', updatedContent);
      if (updatedContent) {
        if (!this.emailBody) {
          this.emailBody = {
            subject: '',
            content: '',
            to: '',
            cc: '',
            from: '',
            body: ''
          };
        }
        if (updatedContent.subject !== undefined) {
          this.emailBody.subject = updatedContent.subject;
        }
        if (updatedContent.content !== undefined) {
          this.emailBody.content = updatedContent.content;
        }
        // Also update 'to' if present
        if (updatedContent.to !== undefined) {
          this.emailBody.to = updatedContent.to;
        }
      }
    },
    // New handler for 'to' field updates from SendRawEmail
    handleToUpdated(newTo) {
      if (!this.emailBody) this.emailBody = {};
      this.emailBody.to = newTo;
      console.log('[BillingsEmailModal] Updated TO:', newTo);
    },
    isPdfUrl(url) {
      if (!url) return false;
      try {
        return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('pdf');
      } catch (e) {
        console.error('Error checking PDF URL:', e);
        return false;
      }
    },
    getInvoiceNumber(item) {
      if (!item) return 'Invoice';

      // Try to extract invoice number from name
      if (item.name) {
        // Check if name contains pattern like INV-25-00136
        const match = item.name.match(/inv-?\d+-\d+/i);
        if (match) return match[0].toUpperCase();

        // Look for any pattern that might be an invoice number
        const numberMatch = item.name.match(/[A-Z]+-\d+-\d+/i);
        if (numberMatch) return numberMatch[0].toUpperCase();
      }

      // Try to extract from URL
      if (item.url) {
        try {
          const urlParts = item.url.toString().split('/');
          const lastPart = urlParts[urlParts.length - 1];

          // Check for invoice number pattern in URL
          const match = lastPart.match(/inv-?\d+-\d+/i);
          if (match) return match[0].toUpperCase();

          return lastPart.split('.')[0] || 'Invoice';
        } catch (e) {
          console.error('Error extracting invoice number from URL:', e);
        }
      }

      // If we have invoices data, try to get number from there
      if (this.invoices && this.invoices.length === 1) {
        return this.invoices[0].invoice_number || 'Invoice';
      }

      return 'Invoice';
    },
    deleteDocument(index) {
      this.attachments.splice(index, 1)
    },
    openDocument(url) {
      // Open document in a new tab
      window.open(url, '_blank')
    },
    downloadInvoice(url) {
      try {
        // Create a hidden anchor element
        const link = document.createElement('a');
        link.href = url;

        // Extract filename from URL or use default
        let filename = 'invoice.pdf';
        try {
          const urlParts = url.split('/');
          if (urlParts.length > 0) {
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart) {
              filename = decodeURIComponent(lastPart);
            }
          }
        } catch (e) {
          console.error('Error extracting filename:', e);
        }

        // Set download attribute and trigger click
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } catch (error) {
        console.error('Error downloading file:', error);
        // Fallback to opening in a new tab
        this.openDocument(url);
      }
    },
    close() {
      this.$emit('close')
    },
    successfull() {
      this.$emit('successfull')
    },
    sendMail() {
      // Initialize emailBody if it doesn't exist
      if (!this.emailBody) {
        this.emailBody = {
          subject: '',
          content: '',
          to: '',
          cc: '',
          from: 'donotreply@nathanhr.ae',
          body: ''
        };
      }

      // First, always make sure we have the most recent content
      if (this.$refs.sendRawEmailRef && this.$refs.sendRawEmailRef.localEmailBody) {
        // Get the latest content and subject from the child component
        this.emailBody.subject = this.$refs.sendRawEmailRef.localEmailBody.subject || '';
        this.emailBody.content = this.$refs.sendRawEmailRef.localEmailBody.content || '';
        // Handle to field - convert array to string if needed
        if (Array.isArray(this.$refs.sendRawEmailRef.localEmailBody.to)) {
          this.emailBody.to = this.$refs.sendRawEmailRef.localEmailBody.to.join(', ');
        } else {
          this.emailBody.to = this.$refs.sendRawEmailRef.localEmailBody.to || '';
        }

        // Handle cc field - convert array to string if needed
        if (Array.isArray(this.$refs.sendRawEmailRef.localEmailBody.cc)) {
          this.emailBody.cc = this.$refs.sendRawEmailRef.localEmailBody.cc.join(', ');
        } else {
          this.emailBody.cc = this.$refs.sendRawEmailRef.localEmailBody.cc || '';
        }
        this.emailBody.from = this.$refs.sendRawEmailRef.localEmailBody.from || 'donotreply@nathanhr.ae';
      }

      // If using the child component's sendMail method
      if (this.$refs.sendRawEmailRef && this.$refs.sendRawEmailRef.sendMail !== this.sendMail) {
        console.log('Using child sendMail with updated content:', this.emailBody.subject);
        // Let the child component handle sending with its own data
        return this.$refs.sendRawEmailRef.sendMail();
      }

      // Otherwise use our own implementation
      console.log('Using parent sendMail with content:', this.emailBody.subject);
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true
      // Ensure body is set to the latest content
      this.emailBody.body = this.emailBody.content

      try {
        // Handle to field - ensure unique email addresses
        if (typeof this.emailBody.to == 'string') {
          // Split by comma, trim whitespace, filter empty strings, and create a unique set
          const emailsArray = this.emailBody.to.split(',')
            .map(email => email.trim())
            .filter(email => email);

          // Remove duplicates using a Set
          this.emailBody.to = [...new Set(emailsArray)];
        }

        // Handle cc field
        if (typeof this.emailBody.cc == 'string') {
          this.emailBody.cc = this.emailBody.cc.split(',')
            .map(email => email.trim())
            .filter(email => email);

          // Remove duplicates using a Set
          this.emailBody.cc = [...new Set(this.emailBody.cc)];
        }

        // Handle attachments
        if (this.attachments && this.attachments.length > 0) {
          this.emailBody.attachments = []
          for (let index = 0; index < this.attachments.length; index++) {
            const element = this.attachments[index];
            if (element && element.url) {
              let filename = 'invoice.pdf';
              try {
                // Try to extract filename from URL
                const urlParts = element.url.toString().split('/');
                if (urlParts.length > 0) {
                  filename = element.name || urlParts[urlParts.length - 1] || 'invoice.pdf';
                  // Decode URI components if needed
                  try {
                    filename = decodeURIComponent(filename);
                  } catch (e) {
                    console.warn('Could not decode filename URI component:', e);
                  }
                }
              } catch (e) {
                console.error('Error extracting filename:', e);
              }

              this.emailBody.attachments.push({
                filename: filename,
                path: element.url
              });
            }
          }
        }

        this.emailBody = {...this.emailBody, isClientEmail: true}
        this.$axios.$post(`/generic/send/emailraw`, this.emailBody, { headers: { Authorization: AuthStr } })
          .then((res) => {
            this.loading = false;
            this.successfull();
          })
          .catch(e => {
            console.error('Error sending email:', e);
            this.loading = false;
            // Show error notification using Vuetify snackbar if available
            if (this.$store.commit && typeof this.$store.commit === 'function') {
              try {
                this.$store.commit('snackbar/showSnackbar', {
                  text: 'Failed to send email: ' + (e.response?.data?.message || e.message || 'Unknown error'),
                  color: 'error'
                });
              } catch (err) {
                console.warn('Could not show error notification:', err);
              }
            }
          });
      } catch (error) {
        console.error('Error preparing email data:', error);
        this.loading = false;
        // Show error notification
        if (this.$store.commit && typeof this.$store.commit === 'function') {
          try {
            this.$store.commit('snackbar/showSnackbar', {
              text: 'Error preparing email: ' + (error.message || 'Unknown error'),
              color: 'error'
            });
          } catch (err) {
            console.warn('Could not show error notification:', err);
          }
        }
      }
    }
  },
  updated() {
    // Re-apply our methods when component updates
    if (this.$refs.sendRawEmailRef) {
      this.$refs.sendRawEmailRef.getInvoiceNumber = this.getInvoiceNumber;
      this.$refs.sendRawEmailRef.isPdfUrl = this.isPdfUrl;
      this.$refs.sendRawEmailRef.downloadInvoice = this.downloadInvoice;
    }
  }
}
</script>

<style scoped>
/* Vuetify override styles from sendRawEmail are used automatically */
/* Some additional invoice-specific styles that might be needed */
:deep(.v-chip) {
  font-weight: 500;
}

/* Preview related styles removed as requested */
</style>
