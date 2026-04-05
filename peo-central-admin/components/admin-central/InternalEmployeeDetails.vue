<template>
  <v-card class="tw-p-0 tw-rounded-xl tw-shadow-sm tw-bg-white tw-h-full tw-flex tw-flex-col">
    <div v-if="loading" class="tw-p-6">
      <div class="tw-flex tw-flex-col tw-items-center tw-mb-6">
        <v-skeleton-loader type="avatar" class="tw-w-24 tw-h-24 tw-mb-4" />
        <v-skeleton-loader type="text" class="tw-w-48 tw-mb-2" />
        <v-skeleton-loader type="text" class="tw-w-32 tw-mb-2" />
      </div>

      <v-skeleton-loader type="card" class="tw-mb-6" />

      <div class="tw-flex tw-justify-center tw-space-x-3">
        <v-skeleton-loader type="button" class="tw-w-28" />
        <v-skeleton-loader type="button" class="tw-w-28" />
      </div>
    </div>

    <div v-else-if="employee" class="tw-flex tw-flex-col tw-h-full">
      <!-- Header Section with Avatar and Basic Info -->
      <div class="tw-p-6 tw-border-b tw-border-gray-200">
        <div class="tw-flex tw-flex-col sm:tw-flex-row tw-items-start tw-space-y-4 sm:tw-space-y-0 sm:tw-space-x-4">
          <!-- Avatar Section -->
          <div class="tw-flex-shrink-0 tw-self-center sm:tw-self-start">
            <div class="tw-relative">
              <v-avatar size="80" class="tw-border-4" :class="employee.access ? 'tw-border-green-200' : 'tw-border-red-200'">
                <img
                  :src="employee.avatar"
                  :alt="`${employee.firstName} ${employee.lastName}`"
                  @error="handleAvatarError"
                />
              </v-avatar>
              <div
                :class="[
                  'tw-absolute tw-bottom-1 tw-right-1 tw-w-4 tw-h-4 tw-rounded-full tw-border-2 tw-border-white',
                  employee.access ? 'tw-bg-green-500' : 'tw-bg-red-500'
                ]"
                :title="employee.access ? 'Active Account' : 'Inactive Account'"
              ></div>
            </div>
          </div>

          <!-- Employee Info Section -->
          <div class="tw-flex-1 tw-min-w-0 tw-text-center sm:tw-text-left">
            <h2 class="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-1">
              {{ employee.firstName }} {{ employee.middleName ? employee.middleName + ' ' : '' }}{{ employee.lastName }}
            </h2>
                            <p class="tw-text-sm tw-text-gray-600 tw-mb-2">{{ employee.employment?.designation || employee.designation || 'Staff' }}</p>
            <p class="tw-text-sm tw-text-gray-500 tw-mb-3">{{ employee.company }}</p>
            <div class="tw-flex tw-justify-center sm:tw-justify-start">
              <v-chip
                small
                :color="employee.access ? 'success' : 'error'"
                text-color="white"
                class="tw-text-xs"
              >
                {{ employee.access ? 'Portal Access Granted' : 'Portal Access Revoked' }}
              </v-chip>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="tw-flex tw-flex-col tw-space-y-2 tw-w-full sm:tw-w-auto">
            <v-btn
              color="primary"
              outlined
              small
              @click="$emit('edit', employee)"
              :disabled="!permissions.canEditUsers"
              class="tw-w-full sm:tw-w-auto"
            >
              <v-icon left small>mdi-pencil</v-icon>
              Edit Details
            </v-btn>
            <v-btn
              color="error"
              outlined
              small
              @click="$emit('revoke', employee)"
              v-if="employee.access"
              :disabled="!permissions.canRevokeAccess"
              class="tw-w-full sm:tw-w-auto"
            >
              <v-icon left small>mdi-shield-off</v-icon>
              Revoke Access
            </v-btn>
            <v-btn
              color="success"
              outlined
              small
              @click="$emit('grant', employee)"
              v-else
              :disabled="!permissions.canGrantAccess"
              class="tw-w-full sm:tw-w-auto"
            >
              <v-icon left small>mdi-shield-check</v-icon>
              Grant Access
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tw-border-b tw-border-gray-200">
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
        <div v-if="activeTab === 'details'" class="tw-p-6">
          <div class="tw-bg-gray-50 tw-p-5 tw-rounded-lg tw-h-full tw-overflow-y-auto">
            <h3 class="tw-text-lg tw-font-semibold tw-mb-4 tw-text-gray-800 tw-flex tw-items-center">
              <v-icon size="20" class="tw-mr-2" color="primary">mdi-account-details</v-icon>
              Employee Details
            </h3>

            <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
              <div class="tw-space-y-1">
                <div class="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide">First Name</div>
                <div class="tw-text-sm tw-text-gray-800 tw-font-medium">{{ employee.firstName }}</div>
              </div>

              <div class="tw-space-y-1">
                <div class="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide">Last Name</div>
                <div class="tw-text-sm tw-text-gray-800 tw-font-medium">{{ employee.lastName }}</div>
              </div>

              <div class="tw-space-y-1">
                <div class="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide">Middle Name</div>
                <div class="tw-text-sm tw-text-gray-800">{{ employee.middleName || 'Not provided' }}</div>
              </div>

              <div class="tw-space-y-1">
                <div class="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide">Email</div>
                <div class="tw-text-sm tw-text-gray-800 tw-break-all">{{ employee.email || 'Not provided' }}</div>
              </div>

              <div class="tw-space-y-1">
                <div class="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide">Phone</div>
                <div class="tw-text-sm tw-text-gray-800">{{ employee.phone || 'Not provided' }}</div>
              </div>

              <div class="tw-space-y-1">
                <div class="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide">Internal Designation</div>
                <div class="tw-text-sm tw-text-gray-800">{{ employee.employment?.designation || employee.designation || 'Not specified' }}</div>
              </div>

              <div class="sm:tw-col-span-2 tw-space-y-1">
                <div class="tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wide">Department</div>
                <div class="tw-text-sm tw-text-gray-800">{{ employee.department || 'Not specified' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Emails Tab -->
        <div v-if="activeTab === 'emails'" class="tw-p-6">
          <InternalEmployeeEmailsLog
            :employee-email="employee?.email"
            :loading="emailsLoading"
          />
        </div>
      </div>
    </div>

    <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-6 tw-text-gray-400 tw-text-center tw-h-full">
      <v-icon size="64" color="grey lighten-2">mdi-account-question</v-icon>
      <div class="tw-mt-4 tw-text-lg tw-font-medium">Select an employee to view details</div>
      <div class="tw-mt-2 tw-text-sm tw-max-w-md">
        Click on an employee from the list to view their complete profile information and manage their portal access.
      </div>
    </div>
  </v-card>
</template>

<script>
import InternalEmployeeEmailsLog from './InternalEmployeeEmailsLog.vue'

export default {
  components: {
    InternalEmployeeEmailsLog
  },
  props: {
    employee: Object,
    loading: Boolean,
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
  computed: {
    permissions() {
      // Always return true values to remove restrictions
      return {
        canAddUsers: true,
        canEditUsers: true,
        canRevokeAccess: true,
        canGrantAccess: true,
        canViewOnly: false
      };
    }
  },
  methods: {
    handleAvatarError(e) {
      // Fallback to a default avatar if image fails to load
      e.target.src = 'https://cdn.vuetifyjs.com/images/lists/1.jpg';
    }
  }
};
</script>

<style scoped>
.v-skeleton-loader {
  margin-bottom: 8px;
}

/* Responsive styles */
@media (max-width: 600px) {
  .xs\:hidden {
    display: none;
  }
}

@media (min-width: 601px) {
  .sm\:block {
    display: block;
  }
}

@media (max-width: 600px) {
  .tw-grid-cols-1 > div {
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .tw-grid-cols-1 > div:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}
</style>
