<template>
  <div class="tw-flex tw-flex-col tw-h-full tw-min-h-screen tw-max-w-full">
    <!-- Stats Card -->
    <ClientAccessStatsCard
      :stats="stats"
      :loading="loading"
      :active-filter="activeStatsFilter"
      @filter-change="handleStatsFilterChange"
    />

    <div class="tw-flex tw-flex-col md:tw-flex-row tw-flex-1 md:tw-space-x-6">
      <!-- Contact List (Mobile: Conditionally displayed) -->
      <div
        v-if="!isMobile || (isMobile && !selectedContact && !editMode)"
        class="tw-w-full md:tw-w-2/5 lg:tw-w-1/3 tw-mb-6 md:tw-mb-0"
      >
        <PointsOfContactList
          :contacts="displayContacts"
          :loading="loading"
          :loadingMore="loadingMore"
          :selectedContact="selectedContact"
          :hasMoreContacts="hasMoreContacts"
          :stats="stats"
          @select="handleSelect"
          @create="createContact"
          @search="handleSearch"
          @load-more="loadMoreContacts"
          @filter-change="handleFilterChange"
          @error="handleError"
        />
      </div>

      <!-- Details/Edit Pane (Mobile: Conditionally displayed) -->
      <div
        v-if="!isMobile || (isMobile && (selectedContact || editMode))"
        class="tw-w-full md:tw-w-3/5 lg:tw-w-2/3 tw-relative"
      >
        <!-- Back button (Mobile only) -->
        <v-btn
          v-if="isMobile && (selectedContact || editMode)"
          icon
          small
          color="primary"
          class="tw-absolute tw-left-2 tw-top-2 tw-z-10"
          @click="backToList"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <transition name="fade" mode="out-in">
          <PointsOfContactEditForm
            v-if="editMode"
            :contact="editMode === 'edit' ? selectedContact : null"
            :submitting="submitting"
            @save="handleSave"
            @cancel="cancelEdit"
            @error="handleError"
            @success="handleSuccess"
            @showEmailModal="handleSendMail"
          />
          <PointsOfContactDetailsWithTabs
            v-else
            :contact="selectedContact"
            :loading="detailsLoading"
            :revoking="revoking"
            @edit="startEdit"
            @revoke="confirmRevoke"
            @sendMail="handleSendMail"
          />
        </transition>
      </div>
    </div>

    <!-- Confirmation Modal for Revoking Access -->
    <RevokeContactAccessModal
      :open="showRevokeModal"
      @confirm="handleRevoke"
      @cancel="showRevokeModal = false"
    />

    <!-- Email Modal -->
    <POCEmailModal
      :open="showEmailModal"
      :contact="selectedContact"
      @close="showEmailModal = false"
      @success="handleEmailSuccess"
      @error="handleEmailError"
    />

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      :timeout="4000"
      color="success"
      top
    >
      {{ successMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="showSuccessSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showErrorSnackbar"
      :timeout="6000"
      color="error"
      top
    >
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="showErrorSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import ClientAccessStatsCard from '@/components/admin-central/ClientAccessStatsCard.vue';
import PointsOfContactList from '@/components/admin-central/PointsOfContactList.vue';
import PointsOfContactDetails from '@/components/admin-central/PointsOfContactDetails.vue';
import PointsOfContactDetailsWithTabs from '@/components/admin-central/PointsOfContactDetailsWithTabs.vue';
import PointsOfContactEditForm from '@/components/admin-central/PointsOfContactEditForm.vue';
import RevokeContactAccessModal from '@/components/admin-central/RevokeContactAccessModal.vue';
import POCEmailModal from '@/components/admin-central/POCEmailModal.vue';

export default {
  layout: 'dashboard',
  components: {
    ClientAccessStatsCard,
    PointsOfContactList,
    PointsOfContactDetails,
    PointsOfContactDetailsWithTabs,
    PointsOfContactEditForm,
    RevokeContactAccessModal,
    POCEmailModal,
  },
  data() {
    return {
      // UI state
      loading: true,
      loadingMore: false,
      detailsLoading: false,
      editMode: null, // null, 'edit', or 'create'
      submitting: false,
      revoking: false,
      showRevokeModal: false,
      isMobile: false,
      activeStatsFilter: null,
      showEmailModal: false,

      // Data
      allContacts: [],
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
        byDepartment: [],
        byCompany: [],
        recentlyAdded: 0,
        missingEmail: 0,
        missingPhone: 0
      },

      // Pagination
      currentPage: 1,
      hasMoreContacts: true,
      pageSize: 20,

      // Filters
      currentFilters: {
        search: '',
        status: 'all',
        department: 'all',
        company: 'all'
      },

      // Selected contact
      selectedContact: null,

      // Notifications
      showSuccessSnackbar: false,
      showErrorSnackbar: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  computed: {
    displayContacts() {
      return this.allContacts
    }
  },
  async mounted() {
    this.checkMobile()
    window.addEventListener('resize', this.checkMobile)

    await this.loadStats()
    await this.loadContacts()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile)
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768
    },

    // Stats loading
    async loadStats() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const response = await this.$axios.$get('/points/of/contacts/stats', {headers: { Authorization: AuthStr }} )
        this.stats = response
      } catch (error) {
        console.error('Error loading stats:', error)
        this.handleError('Failed to load statistics')
      }
    },

    // Contacts loading
    async loadContacts(reset = true) {
      try {

        if (reset) {
          this.loading = true
          this.currentPage = 1
          this.allContacts = []
          this.hasMoreContacts = true
        } else {
          this.loadingMore = true
        }

        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          ...this.currentFilters
        }

        // Remove 'all' values from filters
        Object.keys(params).forEach(key => {
          if (params[key] === 'all') {
            delete params[key]
          }
        })

             const token = this.$store.state.token;
         const AuthStr = 'Bearer '.concat(token);
         const response = await this.$axios.$get('/points/of/contacts', {
           params,
           headers: { Authorization: AuthStr }
         })

        if (reset) {
          this.allContacts = response.results || []
        } else {
          this.allContacts = [...this.allContacts, ...(response.results || [])]
        }

        this.hasMoreContacts = response.results && response.results.length === this.pageSize
        this.currentPage++

      } catch (error) {
        console.error('Error loading contacts:', error)
        this.handleError('Failed to load contacts')
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    // Event handlers
    handleSelect(contact) {
      this.selectedContact = contact
      this.editMode = null
    },

    createContact() {
      this.selectedContact = null
      this.editMode = 'create'
    },

    startEdit() {
      this.editMode = 'edit'
    },

    cancelEdit() {
      this.editMode = null
      if (this.isMobile && !this.selectedContact) {
        this.backToList()
      }
    },

    backToList() {
      this.selectedContact = null
      this.editMode = null
    },

    handleSearch(searchTerm) {
      this.currentFilters.search = searchTerm
      this.loadContacts(true)
    },

    handleFilterChange(filters) {
      this.currentFilters = { ...this.currentFilters, ...filters }
      this.loadContacts(true)
    },

    loadMoreContacts() {
      if (!this.loading && this.hasMoreContacts) {
        this.loadContacts(false)
      }
    },

    // Save contact
    async handleSave(contactData, options = {}) {
      try {
        this.submitting = true
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        let response;

        if (this.editMode === 'edit') {
          // Update existing contact
          response = await this.$axios.$put(`/points/of/contacts/${this.selectedContact._id}`, contactData, {headers: { Authorization: AuthStr } })
          this.handleSuccess('Contact updated successfully')

          // Update the selectedContact with the response data to reflect changes immediately
          if (response) {
            this.selectedContact = {
              ...this.selectedContact,
              ...response
            }
          }

          // Check if status changed to inactive
          if (options.statusChanged && contactData.email) {
            // Show revoked access email modal
            this.selectedContact = {
              ...this.selectedContact,
              ...contactData,
              emailType: 'revoked'
            }
            this.showEmailModal = true
          }
          // For other updates, show regular email modal if needed
          else if (contactData.email && !this.showEmailModal) {
            // Keep using the selected contact but update its data
            const updatedContact = {
              ...this.selectedContact,
              email: contactData.email,
              name: contactData.name
            }
            this.selectedContact = updatedContact
            this.showEmailModal = true
          }
        } else {
          // Create new contact
          response = await this.$axios.$post('/points/of/contacts', contactData, {headers: { Authorization: AuthStr }} )
          this.handleSuccess('Contact created successfully')

          // For new contacts, always show the email modal
          if (response && contactData.email) {
            this.selectedContact = {
              ...response,
              email: contactData.email,
              name: contactData.name
            }
            this.showEmailModal = true
          }
        }

        // Reload data
        await this.loadStats()
        await this.loadContacts(true)

        // Reset UI (but don't reset selectedContact if email modal is showing)
        this.editMode = null
        if (!this.showEmailModal) {
          this.selectedContact = null
        }

      } catch (error) {
        console.error('Error saving contact:', error)
        this.handleError(error.response?.data?.message || 'Failed to save contact')
      } finally {
        this.submitting = false
      }
    },

    // Send Mail
    handleSendMail() {
      this.showEmailModal = true
    },

    // Handle stats card filter changes
    handleStatsFilterChange(filterType) {
      // If clicking the same filter, clear it
      if (this.activeStatsFilter === filterType) {
        this.activeStatsFilter = null
        this.currentFilters = {
          search: '',
          status: 'all',
          department: 'all',
          company: 'all'
        }
        this.loadContacts(true)
        return
      }

      // Set the active filter
      this.activeStatsFilter = filterType

      // Apply the appropriate filter based on the card type
      let newFilters = {
        search: '',
        status: 'all',
        department: 'all',
        company: 'all'
      }

      switch (filterType) {
        case 'active':
          newFilters.status = 'active'
          break
        case 'escalationPOC':
          newFilters.department = 'Escalation Point of Contact'
          break
        case 'financialPOC':
          newFilters.department = 'Financial Point of Contact'
          break
        case 'hrPOC':
          newFilters.department = 'HR Point of Contact'
          break
        case 'recentlyAdded':
          // For recently added, we'll need to handle this in the API
          // For now, just show all contacts
          break
        case 'total':
        default:
          // Show all contacts
          break
      }

      this.currentFilters = newFilters
      this.loadContacts(true)
    },

    // Revoke access
    confirmRevoke() {
      this.showRevokeModal = true
    },

    async handleRevoke() {
      try {
        this.revoking = true
        this.showRevokeModal = false
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        // Update the contact's is_deleted field to true
        await this.$axios.$put(`/points/of/contacts/${this.selectedContact._id}`, {
          status: 'inactive'
        },
        {headers: { Authorization: AuthStr } }
      )

        this.handleSuccess('Contact access revoked successfully')

        // Mark the contact with emailType to indicate revoked access notification
        if (this.selectedContact && this.selectedContact.email) {
          // Update the selected contact to include the email type
          this.selectedContact = {
            ...this.selectedContact,
            emailType: 'revoked'
          }
          // Show the email modal with revoked access message
          this.showEmailModal = true
        }

        // Reload data
        await this.loadStats()
        await this.loadContacts(true)

        // Don't reset UI yet if the email modal is showing
        if (!this.showEmailModal) {
          this.selectedContact = null
        }

      } catch (error) {
        console.error('Error revoking access:', error)
        this.handleError(error.response?.data?.message || 'Failed to revoke access')
      } finally {
        this.revoking = false
      }
    },

    // Email handling
    handleEmailSuccess(message) {
      this.handleSuccess(message)
      // Reset selectedContact if it was a new contact (not in edit mode)
      if (!this.editMode) {
        this.selectedContact = null
      }
    },

    handleEmailError(message) {
      this.handleError(message)
      // Reset selectedContact if it was a new contact (not in edit mode)
      if (!this.editMode) {
        this.selectedContact = null
      }
    },

    // Notifications
    handleSuccess(message) {
      this.successMessage = message
      this.showSuccessSnackbar = true
    },

    handleError(message) {
      this.errorMessage = message
      this.showErrorSnackbar = true
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
