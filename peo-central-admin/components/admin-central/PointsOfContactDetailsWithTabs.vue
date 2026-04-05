<template>
  <div class="tw-bg-white tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-h-full tw-flex tw-flex-col">
    <!-- Header - Only show when contact is selected -->
    <div v-if="contact" class="tw-p-6 tw-border-b tw-border-gray-200">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-space-x-4">
          <v-avatar size="60" color="primary" class="tw-bg-blue-100">
            <v-icon color="primary" size="32" v-if="!contact?.image_url">mdi-account</v-icon>
            <img v-else :src="contact.image_url" :alt="contact?.name" />
          </v-avatar>
          <div>
            <h3 class="tw-text-xl tw-font-semibold tw-text-gray-800">{{ contact?.name }}</h3>
            <p class="tw-text-sm tw-text-gray-500 tw-mt-1">{{ contact?.designation }}</p>
            <v-chip
              x-small
              :color="contact?.status === 'active' ? 'success' : 'error'"
              text-color="white"
              class="tw-mt-2"
            >
              {{ contact?.status === 'active' ? 'Active' : 'Inactive' }}
            </v-chip>
          </div>
        </div>
        <div class="tw-flex tw-space-x-2">
          <v-btn
            color="primary"
            outlined
            small
            @click="$emit('edit')"
            :loading="loading"
          >
            <v-icon left small>mdi-pencil</v-icon>
            Edit
          </v-btn>
          <v-btn
            color="info"
            outlined
            small
            @click="$emit('sendMail')"
          >
            <v-icon left small>mdi-email</v-icon>
            Send Mail
          </v-btn>
          <v-btn
            color="error"
            outlined
            small
            @click="confirmRevoke"
            :loading="revoking"
          >
            <v-icon left small>mdi-account-remove</v-icon>
            Revoke Access
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Tabs - Only show when contact is selected -->
    <div v-if="contact" class="tw-border-b tw-border-gray-200">
      <div class="tw-flex tw-space-x-8 tw-px-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'tw-py-3 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm tw-transition-colors tw-duration-200',
            activeTab === tab.value
              ? 'tw-border-blue-500 tw-text-blue-600'
              : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
          ]"
        >
          {{ tab.title }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tw-flex-1 tw-overflow-y-auto">
      <!-- Details Tab -->
      <div v-if="contact && activeTab === 'details'" class="tw-p-6">
        <PointsOfContactDetails
          :contact="contact"
          :loading="loading"
          :revoking="revoking"
          @edit="$emit('edit')"
          @revoke="confirmRevoke"
          @sendMail="$emit('sendMail')"
        />
      </div>

      <!-- Emails Tab -->
      <div v-if="contact && activeTab === 'emails'" class="tw-p-6">
        <POCEmailsLog
          :contact-email="contact?.email"
          :loading="emailsLoading"
        />
      </div>

      <!-- Empty State - Show when no contact is selected -->
      <div v-if="!contact" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-center tw-p-6">
        <v-icon size="64" color="grey lighten-1">mdi-account-search</v-icon>
        <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mt-4">No Contact Selected</h3>
        <p class="tw-text-gray-500 tw-mt-2">Select a contact from the list to view their details</p>
      </div>
    </div>
  </div>
</template>

<script>
import PointsOfContactDetails from './PointsOfContactDetails.vue'
import POCEmailsLog from './POCEmailsLog.vue'

export default {
  name: 'PointsOfContactDetailsWithTabs',
  components: {
    PointsOfContactDetails,
    POCEmailsLog
  },
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
  data() {
    return {
      activeTab: 'details',
      emailsLoading: false,
      tabs: [
        { title: 'Details', value: 'details' },
        { title: 'Emails', value: 'emails' }
      ]
    }
  },
  methods: {
    confirmRevoke() {
      this.$emit('revoke')
    }
  }
}
</script>
