<template>
  <div class="tw-space-y-4 tw-h-full tw-flex tw-flex-col tw-max-h-96">
    <!-- Header -->
    <div class="tw-flex tw-items-center tw-justify-between tw-flex-shrink-0">
      <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800">Email History</h3>
      <v-btn
        color="primary"
        outlined
        small
        @click="refreshEmails"
        :loading="loading"
      >
        <v-icon left small>mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </div>

    <!-- Initial Loading State -->
    <div v-if="loading && emailHistory.length === 0" class="tw-flex-1 tw-overflow-y-auto tw-pr-2 tw-max-h-80">
      <div class="tw-space-y-3">
        <div v-for="i in 5" :key="i" class="tw-bg-gray-50 tw-rounded-lg tw-p-4">
          <!-- Skeleton Header -->
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
            <div class="tw-flex tw-items-center tw-space-x-3">
              <v-skeleton-loader type="text" class="tw-w-8" />
              <v-skeleton-loader type="avatar" class="tw-w-4 tw-h-4" />
              <v-skeleton-loader type="text" class="tw-w-48" />
            </div>
            <v-skeleton-loader type="text" class="tw-w-24" />
          </div>
          <!-- Skeleton Content -->
          <div class="tw-space-y-2">
            <v-skeleton-loader type="text" class="tw-w-full" />
            <v-skeleton-loader type="text" class="tw-w-3/4" />
            <v-skeleton-loader type="text" class="tw-w-1/2" />
          </div>
        </div>
      </div>
    </div>

    <!-- No Emails State -->
    <div v-else-if="emailHistory.length === 0 && !loading" class="tw-text-center tw-py-8 tw-flex-1 tw-max-h-80">
      <v-icon color="gray" size="48" class="tw-mb-4">mdi-email-outline</v-icon>
      <p class="tw-text-gray-500 tw-text-lg">No emails sent to this contact</p>
      <p class="tw-text-gray-400 tw-text-sm tw-mt-2">Email history will appear here once emails are sent</p>
    </div>

    <!-- Email List -->
    <div v-else class="tw-flex-1 tw-overflow-y-auto tw-pr-2 tw-max-h-80">
      <div class="tw-space-y-3">
        <v-expansion-panels>
          <v-expansion-panel
            v-for="(email, index) in emailHistory"
            :key="email._id || index"
            class="tw-mb-2"
          >
            <v-expansion-panel-header class="tw-bg-gray-50">
              <div class="tw-flex tw-items-center tw-justify-between tw-w-full">
                <div class="tw-flex tw-items-center tw-space-x-3">
                  <span class="tw-text-sm tw-font-medium tw-text-gray-600">#{{ (currentPage - 1) * pageSize + index + 1 }}</span>
                  <v-icon color="primary" small>mdi-email</v-icon>
                  <span class="tw-font-medium tw-text-gray-800">{{ email.subject }}</span>
                </div>
                <span class="tw-text-xs tw-text-gray-500">{{ formatDate(email.createdAt) }}</span>
              </div>
            </v-expansion-panel-header>

            <v-expansion-panel-content class="tw-bg-white">
              <div class="tw-space-y-3 tw-p-4">
                <!-- Email Details -->
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                  <div>
                    <p class="tw-text-sm tw-font-semibold tw-text-gray-700">From:</p>
                    <p class="tw-text-sm tw-text-gray-600">{{ email.from || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="tw-text-sm tw-font-semibold tw-text-gray-700">To:</p>
                    <p class="tw-text-sm tw-text-gray-600">{{ email.to || 'N/A' }}</p>
                  </div>
                  <div v-if="email.cc">
                    <p class="tw-text-sm tw-font-semibold tw-text-gray-700">CC:</p>
                    <p class="tw-text-sm tw-text-gray-600">{{ email.cc }}</p>
                  </div>
                  <div>
                    <p class="tw-text-sm tw-font-semibold tw-text-gray-700">Date Sent:</p>
                    <p class="tw-text-sm tw-text-gray-600">{{ formatDate(email.createdAt) }}</p>
                  </div>
                </div>

                <!-- Subject -->
                <div>
                  <p class="tw-text-sm tw-font-semibold tw-text-gray-700">Subject:</p>
                  <p class="tw-text-sm tw-text-gray-800 tw-font-medium">{{ email.subject }}</p>
                </div>

                <!-- Email Body -->
                <div v-if="email.body">
                  <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Content:</p>
                  <div
                    class="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-text-sm tw-text-gray-700 tw-max-h-64 tw-overflow-y-auto"
                    v-html="email.body"
                  ></div>
                </div>

                <!-- Attachments -->
                <div v-if="email.attachments && email.attachments.length > 0">
                  <p class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Attachments:</p>
                  <div class="tw-flex tw-flex-wrap tw-gap-2">
                    <v-chip
                      v-for="(attachment, idx) in email.attachments"
                      :key="idx"
                      color="blue"
                      outlined
                      small
                      @click="openAttachment(attachment)"
                    >
                      <v-icon left small>mdi-paperclip</v-icon>
                      {{ attachment.filename || 'Attachment' }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Load More Section -->
        <div v-if="hasMoreEmails" class="tw-text-center tw-py-4 tw-flex-shrink-0">
          <v-btn
            v-if="!loadingMore"
            color="primary"
            outlined
            @click="loadMoreEmails"
            class="tw-mx-auto"
          >
            <v-icon left small>mdi-chevron-down</v-icon>
            Load More Emails
          </v-btn>
          <div v-else class="tw-flex tw-items-center tw-justify-center tw-space-x-2">
            <v-progress-circular indeterminate size="20" color="primary"></v-progress-circular>
            <span class="tw-text-sm tw-text-gray-500">Loading more emails...</span>
          </div>
        </div>

        <!-- End of List Indicator -->
        <div v-else-if="emailHistory.length > 0" class="tw-text-center tw-py-4 tw-flex-shrink-0">
          <div class="tw-text-sm tw-text-gray-400 tw-border-t tw-border-gray-200 tw-pt-4">
            <v-icon small color="gray">mdi-check-circle</v-icon>
            <span class="tw-ml-2">All emails loaded</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'POCEmailsLog',
  props: {
    contactEmail: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      emailHistory: [],
      currentPage: 1,
      pageSize: 10,
      hasMoreEmails: true,
      loadingMore: false,
      totalEmails: 0
    }
  },
  watch: {
    contactEmail: {
      handler(newEmail) {
        if (newEmail) {
          this.resetAndLoadEmails()
        } else {
          this.emailHistory = []
        }
      },
      immediate: true
    }
  },
  methods: {
    formatDate(value) {
      if (!value) return 'N/A'
      const date = new Date(value)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    resetAndLoadEmails() {
      this.currentPage = 1
      this.emailHistory = []
      this.hasMoreEmails = true
      this.getAllEmails()
    },

    async getAllEmails() {
      if (!this.contactEmail) {
        this.emailHistory = []
        return
      }

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$post(
          `/points/of/contacts/email/logs`,
          {
            email: this.contactEmail,
            page: this.currentPage,
            limit: this.pageSize
          },
          { headers: { Authorization: AuthStr } }
        )

        // Handle new pagination structure
        if (response && response.results) {
          this.emailHistory = response.results
          this.totalEmails = response.totalResults || 0
          this.hasMoreEmails = response.results.length === this.pageSize
        } else {
          // Fallback for old structure
          this.emailHistory = response || []
          this.hasMoreEmails = false
        }
      } catch (error) {
        console.error('Error fetching email logs:', error)
        this.emailHistory = []
        this.hasMoreEmails = false
      }
    },

    async loadMoreEmails() {
      if (this.loadingMore || !this.hasMoreEmails) return

      this.loadingMore = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const nextPage = this.currentPage + 1

        const response = await this.$axios.$post(
          `/points/of/contacts/email/logs`,
          {
            email: this.contactEmail,
            page: nextPage,
            limit: this.pageSize
          },
          { headers: { Authorization: AuthStr } }
        )

        if (response && response.results && response.results.length > 0) {
          this.emailHistory = [...this.emailHistory, ...response.results]
          this.currentPage = nextPage
          this.hasMoreEmails = response.results.length === this.pageSize
        } else {
          this.hasMoreEmails = false
        }
      } catch (error) {
        console.error('Error loading more emails:', error)
        this.hasMoreEmails = false
      } finally {
        this.loadingMore = false
      }
    },

    async refreshEmails() {
      this.resetAndLoadEmails()
    },

    openAttachment(attachment) {
      if (attachment.path) {
        window.open(attachment.path, '_blank')
      }
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for email content */
.tw-overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.tw-overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tw-overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tw-overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Skeleton loader animations */
.v-skeleton-loader {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
