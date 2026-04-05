<template>
  <div v-if="contact" class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-6 tw-h-full tw-flex tw-flex-col">
    <!-- Contact Information -->
    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
      <!-- Personal Information -->
      <div class="tw-space-y-4">
        <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-border-b tw-border-gray-200 tw-pb-2">
          Contact Information
        </h3>

        <div class="tw-space-y-3">
          <div class="tw-flex tw-items-center tw-space-x-3">
            <v-icon color="primary" small>mdi-email</v-icon>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-gray-500">Email</div>
              <div class="tw-text-gray-800">{{ contact.email || 'Not provided' }}</div>
            </div>
          </div>

          <div class="tw-flex tw-items-center tw-space-x-3">
            <v-icon color="primary" small>mdi-phone</v-icon>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-gray-500">Phone</div>
              <div class="tw-text-gray-800">{{ contact.phone || 'Not provided' }}</div>
            </div>
          </div>

          <div class="tw-flex tw-items-center tw-space-x-3">
            <v-icon color="primary" small>mdi-briefcase</v-icon>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-gray-500">Department</div>
              <div class="tw-text-gray-800">{{ contact.department || 'Not specified' }}</div>
            </div>
          </div>

          <div class="tw-flex tw-items-center tw-space-x-3">
            <v-icon color="primary" small>mdi-account-tie</v-icon>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-gray-500">Designation</div>
              <div class="tw-text-gray-800">{{ contact.designation || 'Not specified' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Company Information -->
      <div class="tw-space-y-4">
        <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-border-b tw-border-gray-200 tw-pb-2">
          Company Information
        </h3>

        <div v-if="contact.companyDetails" class="tw-space-y-3">
          <div class="tw-flex tw-items-center tw-space-x-3">
            <v-icon color="primary" small>mdi-office-building</v-icon>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-gray-500">Company</div>
              <div class="tw-text-gray-800 tw-font-medium">{{ contact.companyDetails.company_name }}</div>
            </div>
          </div>

          <div class="tw-flex tw-items-center tw-space-x-3">
            <v-icon color="primary" small>mdi-calendar</v-icon>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-gray-500">Added On</div>
              <div class="tw-text-gray-800">{{ formatDate(contact.createdAt) }}</div>
            </div>
          </div>

          <div v-if="contact.createdBy" class="tw-flex tw-items-center tw-space-x-3">
            <v-icon color="primary" small>mdi-account-plus</v-icon>
            <div>
              <div class="tw-text-sm tw-font-medium tw-text-gray-500">Added By</div>
              <div class="tw-text-gray-800">{{ contact.createdBy.first_name }} {{ contact.createdBy.last_name }}</div>
            </div>
          </div>
        </div>

        <div v-else class="tw-text-center tw-py-4 tw-text-gray-500">
          <v-icon size="48" color="grey lighten-1">mdi-office-building-outline</v-icon>
          <p class="tw-mt-2">No company information available</p>
        </div>
      </div>
    </div>

    <!-- Additional Information -->
    <div class="tw-mt-auto tw-pt-6 tw-border-t tw-border-gray-200">
      <div class="tw-flex tw-justify-between tw-items-center tw-text-sm tw-text-gray-500">
        <span>Last updated: {{ formatDate(contact.updatedAt) }}</span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PointsOfContactDetails',
  props: {
    contact: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    revoking: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleAvatarError(event) {
      event.target.style.display = 'none'
      event.target.nextElementSibling.style.display = 'block'
    },
    formatDate(dateString) {
      if (!dateString) return 'Not available'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    confirmRevoke() {
      this.$emit('revoke', this.contact)
    }
  }
}
</script>
