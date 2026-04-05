<template>
  <div class="tw-min-h-screen">
    <!-- Header Section with Residency Update Banner -->
    <v-row class="ma-0 pa-0">
      <v-col cols="12" class="ma-0 pa-4">
          <v-card elevation="2" class="tw-mb-6 tw-rounded-lg tw-overflow-hidden">
            <!-- Gold header similar to the screenshot -->
            <div class="residency-update-banner">
              Residency Update
            </div>
            <v-card-title class="text-h5 tw-flex tw-items-center">
              <v-icon left class="mr-2">mdi-home-city</v-icon>
              Tenancy and Residency Data Export
            </v-card-title>
            <v-card-text class="tw-pt-2">
              <p class="tw-text-gray-600">
                Export tenancy and residence address update data for residents that have been collected through the system.
                This data can be used for submission to the Dubai Land Department Ejari system.
              </p>
            </v-card-text>
          </v-card>
      </v-col>
    </v-row>
    
    <!-- Statistics Cards Row -->
    <v-row class="ma-0 pa-0">
      <!-- Stats date range header -->
      <v-col cols="12" class="pa-4 pb-0">
          <div class="tw-mb-2 tw-flex tw-items-center tw-justify-between">
            <h3 class="tw-text-lg tw-font-medium tw-text-gray-600">
              <v-icon small class="mr-1">mdi-chart-bar</v-icon>
              Statistics 
              <span v-if="stats.dateRange" class="tw-text-sm tw-font-normal tw-text-gray-500 tw-ml-2">
                ({{ stats.dateRange.start }} to {{ stats.dateRange.end }})
              </span>
            </h3>
            <v-btn
              small
              text
              color="primary"
              @click="fetchStats"
              :loading="isLoadingStats"
              :disabled="isLoadingStats"
            >
              <v-icon small left>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="pa-4">
          <v-card 
            elevation="2" 
            class="tw-rounded-lg stats-card stats-card-ejari"
            :class="{ 'stats-card-loading': isLoadingStats }"
          >
            <v-card-text class="tw-py-6">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="stat-value tw-pr-3">
                  <h3 class="tw-text-3xl tw-font-bold">{{ isLoadingStats ? '...' : stats.totalEjari }}</h3>
                  <p class="tw-text-sm tw-font-medium tw-mt-1">Total EJARI</p>
                </div>
                <div class="stat-icon tw-p-3 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <v-icon size="36" color="white">mdi-file-document-outline</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3" class="pa-4">
          <v-card 
            elevation="2" 
            class="tw-rounded-lg stats-card stats-card-deeds"
            :class="{ 'stats-card-loading': isLoadingStats }"
          >
            <v-card-text class="tw-py-6">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="stat-value tw-pr-3">
                  <h3 class="tw-text-3xl tw-font-bold">{{ isLoadingStats ? '...' : stats.totalTitleDeeds }}</h3>
                  <p class="tw-text-sm tw-font-medium tw-mt-1">Title Deeds</p>
                </div>
                <div class="stat-icon tw-p-3 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <v-icon size="36" color="white">mdi-certificate-outline</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3" class="pa-4">
          <v-card 
            elevation="2" 
            class="tw-rounded-lg stats-card stats-card-dewa"
            :class="{ 'stats-card-loading': isLoadingStats }"
          >
            <v-card-text class="tw-py-6">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="stat-value tw-pr-3">
                  <h3 class="tw-text-3xl tw-font-bold tw-text-white">{{ isLoadingStats ? '...' : stats.totalDewa }}</h3>
                  <p class="tw-text-sm tw-font-medium tw-mt-1 tw-text-white">Total DEWA</p>
                </div>
                <div class="stat-icon tw-p-3 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <v-icon size="36" color="white">mdi-lightning-bolt</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3" class="pa-4">
          <v-card 
            elevation="2" 
            class="tw-rounded-lg stats-card stats-card-uae"
            :class="{ 'stats-card-loading': isLoadingStats }"
          >
            <v-card-text class="tw-py-6">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="stat-value tw-pr-3">
                  <h3 class="tw-text-3xl tw-font-bold">{{ isLoadingStats ? '...' : stats.totalOutsideUAE }}</h3>
                  <p class="tw-text-sm tw-font-medium tw-mt-1">Other Emirates</p>
                </div>
                <div class="stat-icon tw-p-3 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                  <v-icon size="36" color="white">mdi-airplane</v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="ma-0 pa-0">
        <!-- Left Column: Export Form -->
        <v-col cols="12" sm="12" md="6" lg="6" class="pa-4">
          <v-card elevation="2" class="tw-rounded-lg">
            <v-card-title class="tw-border-b tw-pb-3">
              <v-icon left class="mr-2">mdi-filter</v-icon>
              Data Filter
            </v-card-title>
            <v-card-text class="tw-pt-4">
              <!-- Date Range Filter -->
              <v-row>
                <v-col cols="12">
                  <p class="tw-text-gray-600 tw-mb-3">Select a date range to filter data:</p>
                  <ReuseableCustomDateFilter 
                    label="Date Range" 
                    initialFilter="custom"
                    :fullWidth="true"
                    :enableClearDateFilter="true"
                    :initialStartDate="dateRange.start"
                    :initialEndDate="dateRange.end"
                    @selectedDateRanges="handleDateRangeChange" 
                  />
                </v-col>
              </v-row>

              <!-- Export Button -->
              <v-row class="tw-mt-6">
                <v-col cols="12" class="tw-flex tw-justify-end">
                  <v-btn 
                    color="" 
                    :loading="isExporting" 
                    :disabled="!dateRange.start || !dateRange.end || isExporting" 
                    @click="exportData"
                    class="tw-rounded-lg tw-nathan-blue tw-text-white"
                    x-large
                    min-width="150"
                  >
                    <v-icon left>mdi-download</v-icon>
                    Export Data
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Information Card -->
          <v-card elevation="1" class="tw-rounded-lg tw-bg-blue-50 tw-border tw-border-blue-200 tw-mt-6">
            <v-card-text>
              <div class="tw-flex tw-items-start">
                <v-icon color="info" class="mr-3 tw-mt-1">mdi-information-outline</v-icon>
                <div>
                  <p class="tw-font-semibold tw-text-blue-800 tw-mb-2">About Ejari 2025 Data Export</p>
                  <p class="tw-text-gray-700">
                    This tool allows you to export updated tenancy and residence address data in Excel format. The data is collected from users who have provided their residence details through the system.
                  </p>
                  <p class="tw-text-gray-700 tw-mt-2">
                    <span class="tw-font-medium">Note:</span> Only changes made within the selected date range will be included in the export.
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- Right Column: User Selection Interface -->
        <v-col cols="12" sm="12" md="6" lg="6" class="pa-4">
          <v-card elevation="3" class="tw-rounded-lg user-selection-card">
            <v-card-title class="tw-border-b tw-pb-3">
              <v-icon left class="mr-2">mdi-account-multiple</v-icon>
              User Selection
            </v-card-title>
            
            <v-card-text class="tw-pt-4">
              <!-- Search and Select Options -->
              <div class="tw-mb-4">
                <v-text-field
                  v-model="userSearchQuery"
                  label="Search users"
                  prepend-icon="mdi-magnify"
                  outlined
                  dense
                  clearable
                  @input="debounceSearch"
                ></v-text-field>
              </div>
              
              <!-- Selection Controls -->
              <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <v-checkbox
                  v-model="selectAllUsers"
                  label="Select All"
                  @change="toggleSelectAllUsers"
                  hide-details
                  dense
                ></v-checkbox>
                
                <div class="tw-text-sm tw-text-gray-600">
                  {{ selectedUsers.length }} users selected
                </div>
              </div>
              
              <!-- User List with Infinite Scroll -->
              <div 
                class="user-list-container tw-border tw-border-gray-200 tw-rounded-lg tw-h-64 tw-overflow-y-auto"
                v-infinite-scroll="loadMoreUsers"
                infinite-scroll-disabled="isLoadingUsers || !hasMoreUsers"
                infinite-scroll-distance="10"
              >
                <v-list dense>
                  <template v-if="users && users.length > 0">
                    <v-list-item
                      v-for="user in users"
                      :key="user._id"
                      class="user-list-item"
                      @click="toggleUserSelection(user)"
                    >
                      <v-list-item-action>
                        <v-checkbox
                          v-model="user.selected"
                          @click.stop
                          dense
                          hide-details
                        ></v-checkbox>
                      </v-list-item-action>
                      
                      <v-list-item-avatar size="32">
                        <v-icon v-if="!user.profile_image">mdi-account-circle</v-icon>
                        <img 
                          v-else 
                          :src="user.profile_image" 
                          :alt="`${user.first_name || ''} ${user.last_name || ''}`"
                        >
                      </v-list-item-avatar>
                      
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ user.first_name || '' }} {{ user.last_name || '' }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="tw-text-xs">
                          {{ user.email || '' }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      
                      <v-list-item-action>
                        <v-chip
                          small
                          :color="getUserStatusColor(user.user_status)"
                          text-color="white"
                          class="tw-text-xs"
                        >
                          {{ user.user_status }}
                        </v-chip>
                      </v-list-item-action>
                    </v-list-item>
                  </template>
                  
                  <div v-if="isLoadingUsers" class="tw-p-4 tw-text-center">
                    <v-progress-circular indeterminate color="primary" size="20" width="2"></v-progress-circular>
                    <div class="tw-text-sm tw-mt-2">Loading users...</div>
                  </div>
                  
                  <div v-else-if="users.length === 0" class="tw-p-4 tw-text-center tw-text-gray-500">
                    No users found
                  </div>
                </v-list>
              </div>
              
              <!-- Send Email Button -->
              <v-btn
                color=""
                class="tw-rounded-lg tw-mt-5 tw-nathan-blue tw-text-white"
                large
                block
                :disabled="selectedUsers.length === 0 || isSendingEmail"
                :loading="isSendingEmail"
                @click="sendEmail"
              >
                <v-icon left>mdi-email-send</v-icon>
                Send Email to {{ selectedUsers.length }} User{{ selectedUsers.length !== 1 ? 's' : '' }}
              </v-btn>
            </v-card-text>
          </v-card>
          
          <!-- Information text -->
          <v-card elevation="1" class="tw-rounded-lg tw-bg-blue-50 tw-border tw-border-blue-200 tw-mt-3">
            <v-card-text class="tw-py-3">
              <div class="tw-flex tw-items-start">
                <v-icon color="info" class="mr-3 tw-mt-1">mdi-information-outline</v-icon>
                <div class="tw-text-sm">
                  <p class="tw-font-semibold tw-text-blue-800 tw-mb-1">User Email Management</p>
                  <p class="tw-text-gray-700">
                    Select users and send them emails regarding their residence information updates or reminders.
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="4000" top>
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Export Success Dialog (similar to the screenshot) -->
    <v-dialog v-model="showSuccessDialog" max-width="400" persistent>
      <v-card class="tw-rounded-lg">
        <v-card-text class="text-center tw-py-8">
          <!-- Circular Checkmark -->
          <div class="circular-checkmark-container">
            <v-icon size="50" color="white">mdi-check</v-icon>
          </div>
          
          <h2 class="text-h4 tw-mt-6 tw-mb-4">Success!</h2>
          
          <p class="tw-text-gray-700 tw-mb-6">
            Your export has been completed successfully. The file has been downloaded to your device.
          </p>
          
          <v-btn 
            color="warning" 
            class="tw-rounded-lg" 
            large 
            @click="showSuccessDialog = false"
          >
            <v-icon left>mdi-check</v-icon>
            Done
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Email Dialog -->
    <v-dialog v-model="emailDialog" max-width="500" persistent>
      <v-card class="tw-rounded-lg">
        <v-card-title class="tw-border-b tw-pb-3">
          <v-icon left class="mr-2">mdi-email-outline</v-icon>
          Send Email to Selected Users
        </v-card-title>
        
        <v-card-text class="tw-pt-4">
          <v-form ref="emailForm" v-model="emailFormValid">
            <div class="tw-mb-4">
              <p class="tw-font-medium tw-text-gray-700">Subject:</p>
              <p class="tw-text-gray-900">REMINDER: Dubai Tenancy Contract (EJARI) and Electricity Bill (DEWA) Update</p>
            </div>
            
            <v-alert
              dense
              type="info"
              text
              class="tw-mt-3 tw-mb-0"
            >
              <strong>Recipients:</strong> {{ selectedUsers.length }} user(s) selected
            </v-alert>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="tw-px-4 tw-pb-4">
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="emailDialog = false"
            :disabled="isSendingEmail"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmSendEmail"
            :loading="isSendingEmail"
            :disabled="isSendingEmail"
          >
            <v-icon left>mdi-send</v-icon>
            Send Email
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  layout: 'dashboard',
  components: {
    ReuseableCustomDateFilter: () => import('@/components/reuseable/CustomDateFilter')
  },
  directives: {
    infiniteScroll: {
      inserted: (el, binding) => {
        const loadMore = binding.value;
        const isDisabled = binding.arg === 'disabled';
        const distance = binding.arg === 'distance' ? binding.value : 10;

        const handleScroll = () => {
          const scrollHeight = el.scrollHeight;
          const scrollTop = el.scrollTop;
          const clientHeight = el.clientHeight;
          
          if (!isDisabled && scrollTop + clientHeight >= scrollHeight - distance) {
            loadMore();
          }
        };
        
        el.addEventListener('scroll', handleScroll);
        el._onScroll = handleScroll;
      },
      unbind: (el) => {
        if (el._onScroll) {
          el.removeEventListener('scroll', el._onScroll);
          delete el._onScroll;
        }
      }
    }
  },
  data() {
    // Get current year default date range
    const currentYear = new Date().getFullYear();
    const defaultStartDate = `${currentYear}-01-01`;
    const defaultEndDate = `${currentYear}-12-31`;
    
    return {
      // Date range and stats data
      dateRange: {
        start: defaultStartDate,
        end: defaultEndDate
      },
      isExporting: false,
      showSnackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      showSuccessDialog: false,
      totalRecords: 0,
      stats: {
        totalEjari: 0,
        totalTitleDeeds: 0,
        totalDewa: 0,
        totalOutsideUAE: 0,
        totalDubaiResidence: 0,
        totalUpdates: 0,
        dateRange: {
          start: defaultStartDate,
          end: defaultEndDate
        }
      },
      isLoadingStats: false,
      
      // User selection data
      users: [],
      userSearchQuery: '',
      selectAllUsers: false,
      userPage: 1,
      userLimit: 2000,
      hasMoreUsers: true,
      isLoadingUsers: false,
      searchTimeout: null,
      isSendingEmail: false,
      selectedUserStatuses: ['onboarding', 'active', 'new visa process'],
      emailDialog: false,
      emailFormValid: true,
    }
  },
  computed: {
    selectedUsers() {
      return this.users.filter(user => user.selected);
    }
  },
  mounted() {
    // Fetch stats as soon as the component is mounted using the default date range
    this.fetchStats();
    
    // Fetch users with the default statuses
    this.fetchUsers();
  },
  methods: {
    handleDateRangeChange(range) {
      this.dateRange = { ...range }
      this.fetchStats();
    },
    
    async fetchStats() {
      this.isLoadingStats = true;
      
      try {
        const baseUrl = `${this.$axios.defaults.baseURL}users/stats/tenancy-and-residence`;
        const url = `${baseUrl}?startDate=${this.dateRange.start}&endDate=${this.dateRange.end}`;
        
        const response = await this.$axios.get(url);
        
        if (response.data) {
          this.stats = response.data;
          
          // Update the date range display if it's returned from the API
          if (response.data.dateRange) {
            this.stats.dateRange = response.data.dateRange;
          } else {
            // Ensure we have a date range in stats even if API doesn't return one
            this.stats.dateRange = {
              start: this.dateRange.start,
              end: this.dateRange.end
            };
          }
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        this.showError('Failed to load statistics');
      } finally {
        this.isLoadingStats = false;
      }
    },
    
    // User selection methods
    async fetchUsers(reset = false) {
      if (reset) {
        this.users = [];
        this.userPage = 1;
        this.hasMoreUsers = true;
      }
      
      if (!this.hasMoreUsers || this.isLoadingUsers) return;
      
      this.isLoadingUsers = true;
      
      try {
        // Build URL with query parameters
        let url = `${this.$axios.defaults.baseURL}users?limit=${this.userLimit}&page=${this.userPage}`;
        
        // Add user status filters
        if (this.selectedUserStatuses && this.selectedUserStatuses.length > 0) {
          this.selectedUserStatuses.forEach(status => {
            url += `&user_status=${encodeURIComponent(status)}`;
          });
        }
        
        // Add search query if present
        if (this.userSearchQuery) {
          url += `&search=${encodeURIComponent(this.userSearchQuery)}`;
        }
        
        console.log('Fetching users from URL:', url);
        
        const response = await this.$axios.get(url);
        console.log('API response:', response.data);
        
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
          // Map the results to add selected property
          const mappedUsers = response.data.results.map(user => ({
            ...user,
            selected: false
          }));
          
          console.log('Mapped users:', mappedUsers);
          
          // Append to existing users or replace them
          this.users = reset ? mappedUsers : [...this.users, ...mappedUsers];
          
          // Update pagination info
          this.userPage += 1;
          this.hasMoreUsers = this.users.length < response.data.totalResults;
          
          console.log('Current users list:', this.users);
        } else {
          console.log('No results found or invalid response structure:', response.data);
          this.hasMoreUsers = false;
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        this.showError('Failed to load users. Please try again.');
      } finally {
        this.isLoadingUsers = false;
      }
    },
    
    debounceSearch() {
      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // Set new timeout
      this.searchTimeout = setTimeout(() => {
        this.fetchUsers(true);
      }, 500); // Wait 500ms before searching
    },
    
    toggleUserSelection(user) {
      user.selected = !user.selected;
      
      // Check if all users are selected
      this.selectAllUsers = this.users.every(u => u.selected);
    },
    
    toggleSelectAllUsers() {
      // Apply selectAllUsers value to all users
      this.users.forEach(user => {
        user.selected = this.selectAllUsers;
      });
    },
    
    loadMoreUsers() {
      this.fetchUsers();
    },
    
    getUserStatusColor(status) {
      const statusColors = {
        'active': 'success',
        'inactive': 'error',
        'onboarding': 'primary',
        'offboarding': 'warning',
        'new visa process': 'info'
      };
      
      return statusColors[status.toLowerCase()] || 'grey';
    },
    
    sendEmail() {
      // Prepare email recipients
      const selectedUserIds = this.selectedUsers.map(user => user._id);
      
      if (selectedUserIds.length === 0) {
        this.showError('Please select at least one user');
        return;
      }
      
      // Open email dialog
      this.emailDialog = true;
    },
    
    // confirmSendEmail method is implemented further down in the code
    
    async exportData() {
      if (!this.dateRange.start || !this.dateRange.end) {
        this.showError('Please select a date range first')
        return
      }
      
      this.isExporting = true
      
      try {
        // Format the URL with query parameters
        const baseUrl = `${this.$axios.defaults.baseURL}users/export/tenancy-and-residence-details`
        const url = `${baseUrl}?startDate=${this.dateRange.start}&endDate=${this.dateRange.end}`
        
        // Fetch the file as a blob
        const response = await this.$axios({
          url,
          method: 'GET',
          responseType: 'blob'
        })
        
        // Create a download link and trigger download
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        
        // Generate a filename with the current date
        const currentDate = new Date().toISOString().split('T')[0]
        link.download = `tenancy-residence-data-${currentDate}.xlsx`
        
        // Trigger download and cleanup
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(link.href)
        document.body.removeChild(link)
        
        // Show success dialog instead of just a snackbar
        this.showSuccessDialog = true
      } catch (error) {
        console.error('Export error:', error)
        this.showError('Failed to export data. Please try again.')
      } finally {
        this.isExporting = false
      }
    },
    
    async confirmSendEmail() {
      // Proceed with sending email
      this.isSendingEmail = true;
      
      const selectedUserIds = this.selectedUsers.map(user => user._id);
      
      try {
        // Call the API endpoint to request tenancy and residence update
        // Pass the users array as required by the genericRequestTenancyAndResidenceUpdate function
        await this.$axios.post(`${this.$axios.defaults.baseURL}generic/send/emailraw/tenancy/update`, {
          users: selectedUserIds,
          subject: "REMINDER: Dubai Tenancy Contract (EJARI) and Electricity Bill (DEWA) Update"
        });
        
        // Close dialog and show success message
        this.emailDialog = false;
        this.showSuccess(`Email sent successfully to ${selectedUserIds.length} user(s)`);
        
        // Reset selections
        this.selectAllUsers = false;
        this.users.forEach(user => {
          user.selected = false;
        });
        
      } catch (error) {
        console.error('Error sending email:', error);
        this.showError('Failed to send email. Please try again.');
      } finally {
        this.isSendingEmail = false;
      }
    },
    
    showSuccess(message) {
      this.snackbarMessage = message
      this.snackbarColor = 'success'
      this.showSnackbar = true
    },
    
    showError(message) {
      this.snackbarMessage = message
      this.snackbarColor = 'error'
      this.showSnackbar = true
    }
  },
  head() {
    return {
      title: 'Ejari 2025 - Data Export'
    }
  }
}
</script>

<style>
.v-application .text-primary {
  color: #0A94FF !important;
}

/* Custom styling for the Ejari 2025 page */
.tw-rounded-lg {
  border-radius: 0.5rem !important;
}

.tw-bg-primary {
  background-color: #0A94FF !important;
}

.tw-bg-blue-50 {
  background-color: #EFF6FF !important;
}

.tw-border-blue-200 {
  border-color: #BFDBFE !important;
}

.tw-text-blue-800 {
  color: #1E40AF !important;
}
.tw-nathan-blue {
  background-color: #0A2C4F !important;
}
/* Residency Update Banner (matching the screenshot) */
.residency-update-banner {
  background-color: #0A2C4F;
  color: #ffffff;
  padding: 1rem;
  font-weight: 600;
  font-size: 1.2rem;
}

/* Circular checkmark container (matching the screenshot) */
.circular-checkmark-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #0A2C4F;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Confirmation preview card styling */
.confirmation-preview-card {
  border: 1px solid #e0e0e0;
  background-color: #FFFFFF;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Amber (golden) styling for confirmation box */
.tw-bg-amber-50 {
  background-color: #FFFBEB;
}

.tw-border-amber-200 {
  border-color: #FDE68A;
}

/* Transition effects */
.v-card {
  transition: all 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
}

/* Stats Card Styles */
.stats-card {
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.stats-card:hover {
  transform: translateY(-5px);
}

.stats-card .stat-value {
  flex: 1;
}

.stats-card .stat-icon {
  width: 64px;
  height: 64px;
}

/* Colors for different stats cards */
.stats-card-ejari {
  background: linear-gradient(135deg, #4299E1 0%, #3182CE 100%);
  color: white;
}

.stats-card-deeds {
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
  color: white;
}

.stats-card-dewa {
  background: linear-gradient(135deg, #0A2C4F 0%, #4682B4 100%);
  color: white;
}

.stats-card-uae {
  background: linear-gradient(135deg, #4FD1C5 0%, #38B2AC 100%);
  color: white;
}

/* Stats card loading animation */
.stats-card-loading {
  position: relative;
}

.stats-card-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  background-size: 200% 100%;
  animation: loadingShimmer 1.5s infinite;
  z-index: 1;
}

@keyframes loadingShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.stats-card .stat-icon {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Loading animation for stats */
.stats-card-loading {
  position: relative;
}

.stats-card-loading::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: loading-shine 1.5s infinite;
}

@keyframes loading-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* User list styles */
.user-list-container {
  background-color: #fff;
}

.user-list-item {
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: all 0.15s ease-in-out;
}

.user-list-item:hover {
  background-color: rgba(10, 148, 255, 0.05);
}

.user-list-item:last-child {
  border-bottom: none;
}

/* Email dialog styles */
.v-dialog .v-card {
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-card-title {
    font-size: 1.2rem !important;
  }
  
  .confirmation-preview-card {
    margin-top: 2rem;
  }
  
  .user-list-container {
    max-height: 300px;
  }
}
</style>
