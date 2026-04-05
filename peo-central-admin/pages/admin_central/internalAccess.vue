<template>
  <div class="tw-flex tw-flex-col tw-h-full tw-min-h-screen tw-max-w-full">
    <!-- Custom Toast/Snackbar -->
    <v-snackbar
      v-model="showToast"
      :color="toastColor"
      :timeout="toastTimeout"
      top
      right
    >
      {{ toastMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="showToast = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Stats Card -->
    <InternalAccessStatsCard :stats="stats" :loading="loading" />

    <div class="tw-flex tw-flex-col md:tw-flex-row tw-flex-1 md:tw-space-x-6">
      <!-- Employee List (Mobile: Conditionally displayed) -->
      <div
        v-if="!isMobile || (isMobile && !selectedEmployee && !editMode)"
        class="tw-w-full md:tw-w-2/5 lg:tw-w-1/3 tw-mb-6 md:tw-mb-0"
      >
        <InternalEmployeeList
          :employees="displayEmployees"
          :loading="loading"
          :loadingMore="loadingMore"
          :selectedEmployee="selectedEmployee"
          :hasMoreEmployees="hasMoreEmployees"
          @select="handleSelect"
          @create="createEmployee"
          @search="handleSearch"
          @load-more="loadMoreEmployees"
          @filter-change="handleFilterChange"
        />
      </div>

      <!-- Details/Edit Pane (Mobile: Conditionally displayed) -->
      <div
        v-if="!isMobile || (isMobile && (selectedEmployee || editMode))"
        class="tw-w-full md:tw-w-3/5 lg:tw-w-2/3 tw-relative"
      >
        <!-- Back button (Mobile only) -->
        <v-btn
          v-if="isMobile && (selectedEmployee || editMode)"
          icon
          small
          color="primary"
          class="tw-absolute tw-left-2 tw-top-2 tw-z-10"
          @click="backToList"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <transition name="fade" mode="out-in">
          <InternalEmployeeEditForm
            v-if="editMode"
            :employee="editMode === 'edit' ? selectedEmployee : null"
            :submitting="submitting"
            @save="handleSave"
            @cancel="cancelEdit"
          />
          <InternalEmployeeDetails
            v-else
            :employee="selectedEmployee"
            :loading="detailsLoading"
            @edit="startEdit"
            @revoke="confirmRevoke"
            @grant="handleGrant"
          />
        </transition>
      </div>
    </div>

    <!-- Confirmation Modal for Revoking Access -->
    <RevokeAccessModal
      :open="showRevokeModal"
      :employee="selectedEmployee"
      @confirm="handleRevoke"
      @cancel="showRevokeModal = false"
    />

    <!-- Internal Employee Email Modal -->
    <InternalEmployeeEmailModal
      :open="showInternalEmailModal"
      :employee="emailEmployee"
      :is-new-employee="isNewEmployee"
      @close="showInternalEmailModal = false"
      @success="handleInternalEmailSuccess"
      @error="handleInternalEmailError"
    />
  </div>
</template>

<script>
import InternalEmployeeList from '@/components/admin-central/InternalEmployeeList.vue';
import InternalEmployeeDetails from '@/components/admin-central/InternalEmployeeDetails.vue';
import InternalEmployeeEditForm from '@/components/admin-central/InternalEmployeeEditForm.vue';
import InternalAccessStatsCard from '@/components/admin-central/InternalAccessStatsCard.vue';
import RevokeAccessModal from '@/components/admin-central/RevokeAccessModal.vue';
import InternalEmployeeEmailModal from '@/components/admin-central/InternalEmployeeEmailModal.vue';

export default {
  layout: 'dashboard',
  // middleware: ['check-admin-access'],
  components: {
    InternalEmployeeList,
    InternalEmployeeDetails,
    InternalEmployeeEditForm,
    InternalAccessStatsCard,
    RevokeAccessModal,
    InternalEmployeeEmailModal,
  },
  data() {
    return {
      // Toast/Snackbar state
      showToast: false,
      toastMessage: '',
      toastColor: 'success',
      toastTimeout: 4000,

      // UI state
      loading: true,
      loadingMore: false,
      detailsLoading: false,
      editMode: null, // null, 'edit', or 'create'
      submitting: false,
      showRevokeModal: false,
      showInternalEmailModal: false,
      emailEmployee: null,
      isNewEmployee: false,

      // Data
      allEmployees: [],
      displayEmployees: [], // Employees currently displayed (for infinite scroll)
      searchQuery: '',
              pageSize: 10, // Match clientAccess page size for better infinite scroll
      currentPage: 1,
      hasMoreEmployees: true,
      selectedEmployee: null,
      stats: {
        total: 0,
        active: 0,
        access: 0,
        recentlyAdded: 0,
      },

      // Filter data
      accessFilter: 'all',
      departmentFilter: 'all',
      departments: [],

      // Fallback sample data if API fails
      sampleEmployees: [
        {
          id: 1,
          company: 'Nathan & Nathan',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          access: true,
          firstName: 'John',
          lastName: 'Doe',
          middleName: 'A.',
          email: 'john.doe@nathans.com',
          designation: 'HR Manager',
          department: 'Human Resources'
        },
        {
          id: 2,
          company: 'Nathan & Nathan',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          access: true,
          firstName: 'Jane',
          lastName: 'Smith',
          middleName: '',
          email: 'jane.smith@nathans.com',
          designation: 'Financial Analyst',
          department: 'Finance'
        },
        {
          id: 3,
          company: 'Acme Corp',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          access: false,
          firstName: 'Mike',
          lastName: 'Brown',
          middleName: 'B.',
          email: 'mike.brown@acmecorp.com',
          designation: 'Operations Director',
          department: 'Operations'
        },
      ],
    };
  },
  computed: {
    // Check if the current viewport is mobile size
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    }
  },
  async mounted() {
    // Load data when component is mounted (like clientAccess)
    await this.loadEmployees();
  },
  methods: {
    // Custom toast methods
    showSuccessToast(message) {
      this.toastMessage = message;
      this.toastColor = 'success';
      this.toastTimeout = 4000;
      this.showToast = true;
    },

    showErrorToast(message) {
      this.toastMessage = message;
      this.toastColor = 'error';
      this.toastTimeout = 6000;
      this.showToast = true;
    },

    showWarningToast(message) {
      this.toastMessage = message;
      this.toastColor = 'warning';
      this.toastTimeout = 5000;
      this.showToast = true;
    },

    // Load employees (simplified like clientAccess)
    async loadEmployees(reset = true) {
      try {
        if (reset) {
          this.loading = true;
          this.currentPage = 1;
          this.allEmployees = [];
          this.hasMoreEmployees = true;
        } else {
          this.loadingMore = true;
        }

        const params = {
          page: this.currentPage,
          limit: this.pageSize
        };

        // Add search query if provided
        if (this.searchQuery) {
          params.search = this.searchQuery;
        }

        // Add access filter if specific value is selected
        if (this.accessFilter !== 'all') {
          params.access = this.accessFilter === 'active' ? 'true' : 'false';
        }

        // Add department filter if specific value is selected
        if (this.departmentFilter !== 'all') {
          params.department = this.departmentFilter;
        }

        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);

        const response = await this.$axios.get('/users/get/internal/staff', {
          params,
          headers: { Authorization: AuthStr }
        });

        if (response && response.data && response.data.results && Array.isArray(response.data.results)) {
          // Process employee data from API response
          const employees = response.data.results.map(employee => {
            return {
              id: employee._id || '',
              firstName: employee.first_name || '',
              lastName: employee.last_name || '',
              middleName: employee.middle_name || '',
              email: employee.email || '',
              company: employee.company_ID || 'Nathan & Nathan',
              avatar: employee.image_url || 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
              access: employee.is_internal_staff || false,
              designation: employee.employment?.designation || 'Staff',
              department: employee.reporting?.department || employee.department || employee.employment.designation || 'Administration',
              phone: employee.personal?.personal_mobile || '',
              company_ID: employee.company_ID || '',
              company_id: employee.company_id || '',
              // Store original response data for any additional fields needed
              originalData: employee
            };
          });

          if (reset) {
            this.allEmployees = employees;
            this.displayEmployees = employees;
          } else {
            this.allEmployees = [...this.allEmployees, ...employees];
            this.displayEmployees = [...this.displayEmployees, ...employees];
          }

          this.hasMoreEmployees = response.data.results && response.data.results.length === this.pageSize;
          this.currentPage++;

          // Update stats only on initial load
          if (reset) {
            this.stats = {
              total: response.data.totalResults || employees.length,
              active: employees.filter(e => e.access === true).length,
              access: employees.filter(e => e.access === true).length,
              recentlyAdded: response.data.recentlyAdded || 0
            };
          }
        } else {
          // Use sample data if API response is empty
          if (reset) {
            this.allEmployees = [...this.sampleEmployees];
            this.displayEmployees = [...this.sampleEmployees];

            // Update stats based on sample data
            this.stats = {
              total: this.sampleEmployees.length,
              active: this.sampleEmployees.filter(e => e.access === true).length,
              access: this.sampleEmployees.filter(e => e.access === true).length,
              recentlyAdded: 0
            };

            this.showWarningToast('Using sample data. API returned no results.');
          }
        }
      } catch (error) {
        console.error('Error loading employees:', error);
        let errorMessage = 'Failed to load employees.';

        // Extract more specific error message if available
        try {
          if (error && typeof error === 'object') {
            if (error.response && error.response.data && typeof error.response.data === 'object') {
              if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
              } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
              }
            } else if (error.message && typeof error.message === 'string') {
              errorMessage = error.message;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
          errorMessage = 'Failed to load employees. Using sample data instead.';
        }

        this.showErrorToast(errorMessage);

        // Fallback to sample data on error
        if (reset) {
          this.allEmployees = [...this.sampleEmployees];
          this.displayEmployees = [...this.sampleEmployees];

          // Update stats based on sample data
          this.stats = {
            total: this.sampleEmployees.length,
            active: this.sampleEmployees.filter(e => e.access === true).length,
            access: this.sampleEmployees.filter(e => e.access === true).length,
            recentlyAdded: 0
          };
        }
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    // Load more employees for infinite scroll (simplified like clientAccess)
    loadMoreEmployees() {
      if (!this.loading && this.hasMoreEmployees) {
        this.loadEmployees(false);
      }
    },

    // Handle search input
    handleSearch(query) {
      // Reset pagination and store search query
      this.searchQuery = query;

      // Debounce the search to avoid too many API calls
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        this.loadEmployees(true);
      }, 500);
    },

    // Handle filter changes
    handleFilterChange(filters) {
      this.accessFilter = filters.accessFilter;
      this.departmentFilter = filters.departmentFilter;

      // Reload employees with filters
      this.loadEmployees(true);
    },

    // Update statistics based on employee data
    updateStats() {
      const total = this.totalResults || this.allEmployees.length;
      const active = this.allEmployees.filter(e => e.access === true).length;

      this.stats = {
        total,
        active,
        access: active,
        recentlyAdded: 0 // This will be updated from API response
      };
    },

    // Select an employee to view details
    async handleSelect(employee) {
      if (!employee) return;

      this.detailsLoading = true;
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);

        // Fetch detailed employee information if needed
        const response = await this.$axios.get(`/users/${employee.id}`, {
          headers: { Authorization: AuthStr }
        });

        if (response && response.data) {
          // Enrich the employee data with details from the API
          const detailedEmployee = {
            ...employee,
            // Add any additional fields from the detailed API response if needed
          };
          this.selectedEmployee = detailedEmployee;
        } else {
          this.selectedEmployee = employee;
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
        let errorMessage = 'Failed to load employee details.';

        try {
          if (error && typeof error === 'object') {
            if (error.response && error.response.data && typeof error.response.data === 'object') {
              if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
              } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
              }
            } else if (error.message && typeof error.message === 'string') {
              errorMessage = error.message;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
          errorMessage = 'Failed to load employee details.';
        }

        this.showErrorToast(errorMessage);
        this.selectedEmployee = employee;
      } finally {
        this.detailsLoading = false;
      }
    },

    // Start editing an employee
    startEdit() {
      // Permission check removed to allow all users to edit
      this.editMode = 'edit';
    },

    // Create a new employee
    createEmployee() {
      // Permission check removed to allow all users to add new employees
      this.selectedEmployee = null;
      this.editMode = 'create';
    },

    // Cancel editing
    cancelEdit() {
      this.editMode = null;

      // On mobile, clear selected employee to return to list view
      if (this.isMobile) {
        this.selectedEmployee = null;
      }
    },

    // Back to list (for mobile)
    backToList() {
      this.selectedEmployee = null;
      this.editMode = null;
    },

    // Show confirmation modal for revoking access
    confirmRevoke(employee) {
      // Permission check removed to allow all users to revoke access

      if (!employee && this.selectedEmployee) {
        employee = this.selectedEmployee;
      }

      if (employee && employee.access) {
        this.showRevokeModal = true;
      } else {
        this.showWarningToast('This employee does not have active access to revoke.');
      }
    },

    // Handle employee data save
    async handleSave(updatedEmployee) {
      this.submitting = true;
      const token = this.$store.state.token;
      const AuthStr = 'Bearer '.concat(token);

      try {
        // Prepare API payload with only necessary fields
        const apiPayload = {
          first_name: updatedEmployee.firstName,
          last_name: updatedEmployee.lastName,
          middle_name: updatedEmployee.middleName || '',
          email: updatedEmployee.email
        };

        // Add password for creation or if provided for update
        if (updatedEmployee.password) {
          apiPayload.password = updatedEmployee.password;
        }

        // Add phone if provided
        if (updatedEmployee.phone) {
          apiPayload.phone = updatedEmployee.phone;
        }

        // Add designation if provided
        if (updatedEmployee.designation) {
          apiPayload.designation = updatedEmployee.designation;
        } else {
          // Set default designation if not provided
          apiPayload.designation = 'Staff';
        }

        // Add department if provided
        if (updatedEmployee.department) {
          apiPayload.department = updatedEmployee.department;
          console.log('Department being sent in payload:', updatedEmployee.department);
        }

        // Add internal staff access status if provided
        if (updatedEmployee.access !== undefined) {
          apiPayload.is_internal_staff = updatedEmployee.access;
        }

        // Add email automation preference if provided for existing employee updates
        if (updatedEmployee.emailAutomation) {
          apiPayload.emailAutomation = updatedEmployee.emailAutomation;
        }

        // Handle avatar/image upload if provided
        if (updatedEmployee.newAvatar && updatedEmployee.newAvatar instanceof File) {
          // Verify that it's an image file
          if (!updatedEmployee.newAvatar.type.startsWith('image/')) {
            this.showErrorToast('Avatar must be an image file');
            this.submitting = false;
            return;
          }

          try {
            const fd = new FormData();
            fd.append('documents', updatedEmployee.newAvatar);

            // Call the documents/simpleupload API to upload the image
            const uploadResponse = await this.$axios.post('/documents/simpleupload', fd, {
              headers: {
                Authorization: AuthStr,
                'Content-Type': 'multipart/form-data'
              }
            });

            // Check if we have a valid response with the image URL
            if (uploadResponse && uploadResponse.data && Array.isArray(uploadResponse.data) && uploadResponse.data.length > 0) {
              apiPayload.image_url = uploadResponse.data[0];
              console.log('Image uploaded successfully:', apiPayload.image_url);
            } else {
              console.error('Invalid upload response:', uploadResponse);
              throw new Error('No image URL returned from upload');
            }
          } catch (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            this.showErrorToast('Failed to upload avatar. Continuing with other updates.');
            // Don't return here, continue with the rest of the operation
          }
        }

        let response;

        if (this.editMode === 'edit' && this.selectedEmployee) {
          // Before update, check if email should be sent (directly from the form data)
          const shouldSendEmail = updatedEmployee.emailAutomation === 'send';

          // Debug: Log the complete payload being sent
          console.log('Complete API payload being sent:', apiPayload);

          // Update existing employee
          response = await this.$axios.put(
            `/users/update/internal/staff/${this.selectedEmployee.id}`,
            apiPayload,
            { headers: { Authorization: AuthStr } }
          );

          if (response && response.data) {
            this.showSuccessToast('Employee information updated successfully.');

            // If email notification was selected, show the email modal immediately
            if (shouldSendEmail) {
              try {
                this.emailEmployee = {
                  ...updatedEmployee,
                  id: this.selectedEmployee.id,
                  firstName: updatedEmployee.firstName,
                  lastName: updatedEmployee.lastName,
                  email: updatedEmployee.email,
                  password: updatedEmployee.password || 'Admin@123',
                  avatar: updatedEmployee.avatar || this.selectedEmployee.avatar
                };
                this.isNewEmployee = false;
                this.showInternalEmailModal = true;
              } catch (emailError) {
                console.error('Error setting up email modal for update:', emailError);
                // Continue without showing email modal if there's an error
              }
            }

            // Update the selected employee data immediately with the response data
            console.log('Update response:', response.data);
            console.log('Response employment:', response.data.employment);
            console.log('Updated designation:', updatedEmployee.designation);
            if (response.data && this.selectedEmployee) {
              // Update the selected employee with the response data
              this.selectedEmployee = {
                ...this.selectedEmployee,
                first_name: response.data.first_name || updatedEmployee.firstName,
                last_name: response.data.last_name || updatedEmployee.lastName,
                middle_name: response.data.middle_name || updatedEmployee.middleName,
                email: response.data.email || updatedEmployee.email,
                phone: response.data.personal?.personal_mobile || updatedEmployee.phone,
                employment: {
                  ...this.selectedEmployee.employment,
                  designation: response.data.employment?.designation || updatedEmployee.designation
                },
                personal: {
                  ...this.selectedEmployee.personal,
                  phone: response.data.personal?.personal_mobile || updatedEmployee.phone
                },
                image_url: response.data.image_url || this.selectedEmployee.image_url,
                // Update the reporting.department field for proper display
                reporting: {
                  ...this.selectedEmployee.reporting,
                  department: response.data.reporting?.department || updatedEmployee.department
                }
              };

              // Also update the employee in the allEmployees array
              const employeeIndex = this.allEmployees.findIndex(e => e.id === this.selectedEmployee.id);
              if (employeeIndex !== -1) {
                this.allEmployees[employeeIndex] = { ...this.selectedEmployee };
              }

              console.log('Updated selected employee:', this.selectedEmployee);
              console.log('Updated employment:', this.selectedEmployee.employment);

              // Update the displayEmployees array as well
              const displayIndex = this.displayEmployees.findIndex(e => e.id === this.selectedEmployee.id);
              if (displayIndex !== -1) {
                this.displayEmployees[displayIndex] = { ...this.selectedEmployee };
              }
            }

            // Refresh the employee list and stats to ensure everything is up to date
            await this.loadEmployees();
          }
        } else {
          // Create new employee
          response = await this.$axios.post(
            '/users/create/internal/staff',
            apiPayload,
            { headers: { Authorization: AuthStr } }
          );

          if (response && response.data) {
            this.showSuccessToast('New employee created successfully.');

            // Reset pagination and search to show the new employee
            this.currentPage = 0;
            this.searchQuery = '';
            this.accessFilter = 'all';
            this.departmentFilter = 'all';

            // Refresh the employee list and stats to include the new employee
            await this.loadEmployees();

            // Select the newly created employee if available
            if (response.data && response.data._id) {
              const newEmployee = this.allEmployees.find(e => e.id === response.data._id);
              if (newEmployee) {
                this.selectedEmployee = newEmployee;
              }
            }

            // Automatically show email modal for new employees
            try {
              if (apiPayload && apiPayload.email && apiPayload.email.trim()) {
                this.emailEmployee = {
                  ...apiPayload,
                  firstName: apiPayload.first_name || '',
                  lastName: apiPayload.last_name || '',
                  email: apiPayload.email.trim(),
                  password: apiPayload.password || 'Admin@123',
                  // Add fallback values for required fields
                  designation: apiPayload.designation || 'Staff',
                  department: apiPayload.department || 'Administration',
                  avatar: apiPayload.avatar || 'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg'
                };
                this.isNewEmployee = true;
                this.showInternalEmailModal = true;
              } else {
                console.warn('No valid email provided for new employee, skipping email modal');
              }
            } catch (emailError) {
              console.error('Error setting up email modal:', emailError);
              // Continue without showing email modal if there's an error
            }
          }
        }
      } catch (error) {
        console.error('Error saving employee data:', error);
        let errorMessage = 'Failed to save employee data.';

        // Extract more specific error message if available
        try {
          if (error && typeof error === 'object') {
            if (error.response && error.response.data && typeof error.response.data === 'object') {
              if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
              } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
              }
            } else if (error.message && typeof error.message === 'string') {
              errorMessage = error.message;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
          errorMessage = 'Failed to save employee data.';
        }

        this.showErrorToast(errorMessage);
      } finally {
        this.submitting = false;
        this.editMode = null;
      }
    },

    // Handle revoking access
    async handleRevoke() {
      if (!this.selectedEmployee) return;

      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);

        // Update user to revoke internal staff access
        const response = await this.$axios.put(
          `/users/update/internal/staff/${this.selectedEmployee.id}`,
          { is_internal_staff: false },
          { headers: { Authorization: AuthStr } }
        );

        if (response && response.data) {
          this.showSuccessToast('Access revoked successfully.');

          // Refresh the employee list and stats to ensure everything is up to date
          await this.loadEmployees();

          // Update selected employee with the refreshed data
          if (this.selectedEmployee) {
            const updatedEmployee = this.allEmployees.find(e => e.id === this.selectedEmployee.id);
            if (updatedEmployee) {
              this.selectedEmployee = updatedEmployee;
            }
          }
        }
      } catch (error) {
        console.error('Error revoking access:', error);
        let errorMessage = 'Failed to revoke access.';

        // Extract more specific error message if available
        try {
          if (error && typeof error === 'object') {
            if (error.response && error.response.data && typeof error.response.data === 'object') {
              if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
              } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
              }
            } else if (error.message && typeof error.message === 'string') {
              errorMessage = error.message;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
          errorMessage = 'Failed to revoke access.';
        }

        this.showErrorToast(errorMessage);
      } finally {
        this.showRevokeModal = false;
      }
    },

    // Handle granting access
    async handleGrant(employee) {
      // Permission check removed to allow all users to grant access

      if (!employee) return;

      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);

        // Update user to grant internal staff access
        const response = await this.$axios.put(
          `/users/update/internal/staff/${employee.id}`,
          { is_internal_staff: true },
          { headers: { Authorization: AuthStr } }
        );

        if (response && response.data) {
          this.showSuccessToast('Access granted successfully.');

          // Refresh the employee list and stats to ensure everything is up to date
          await this.loadEmployees();

          // Update selected employee with the refreshed data if it's the same employee
          if (this.selectedEmployee && this.selectedEmployee.id === employee.id) {
            const updatedEmployee = this.allEmployees.find(e => e.id === employee.id);
            if (updatedEmployee) {
              this.selectedEmployee = updatedEmployee;
            }
          }
        }
      } catch (error) {
        console.error('Error granting access:', error);
        let errorMessage = 'Failed to grant access.';

        // Extract more specific error message if available
        try {
          if (error && typeof error === 'object') {
            if (error.response && error.response.data && typeof error.response.data === 'object') {
              if (error.response.data.message && typeof error.response.data.message === 'string') {
                errorMessage = error.response.data.message;
              } else if (error.response.data.error && typeof error.response.data.error === 'string') {
                errorMessage = error.response.data.error;
              }
            } else if (error.message && typeof error.message === 'string') {
              errorMessage = error.message;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
          errorMessage = 'Failed to grant access.';
        }

        this.showErrorToast(errorMessage);
      }
    },

    // Handle internal email success
    handleInternalEmailSuccess(message) {
      this.showSuccessToast(message);
      this.showInternalEmailModal = false;
      this.emailEmployee = null;
      this.isNewEmployee = false;
    },

    // Handle internal email error
    handleInternalEmailError(message) {
      this.showErrorToast(message);
      // Ensure modal is closed on error
      this.showInternalEmailModal = false;
      this.emailEmployee = null;
      this.isNewEmployee = false;
    }
  },
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .tw-flex-wrap > div {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>

