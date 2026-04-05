<template>
  <v-card class="tw-p-0 tw-rounded-xl tw-shadow-sm tw-bg-white tw-flex tw-flex-col tw-h-full">
    <div class="tw-px-4 sm:tw-px-6 tw-pt-6 tw-flex-col tw-w-full tw-gap-2">
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <h2 class="tw-text-lg tw-font-semibold tw-text-gray-800">Internal Employees</h2>
        <v-btn color="primary" small class="tw-ml-2" @click="$emit('create')" v-if="permissions.canAddUsers">
          <v-icon left>mdi-plus</v-icon>
          <span class="hidden sm:inline">Add</span>
        </v-btn>
      </div>
      <v-text-field
        v-model="search"
        placeholder="Search employees..."
        prepend-inner-icon="mdi-magnify"
        dense
        outlined
        clearable
        class="tw-mb-2"
        @input="handleSearchInput"
      />

      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 tw-mb-3">
        <v-select
          v-model="accessFilter"
          :items="accessFilterOptions"
          label="Access"
          dense
          outlined
          class="sm:tw-max-w-[180px]"
          @change="handleFilterChange"
          hide-details
        />
        <v-select
          v-model="departmentFilter"
          :items="departmentOptions"
          label="Department"
          dense
          outlined
          class="tw-flex-1"
          @change="handleFilterChange"
          hide-details
        />
      </div>
    </div>

    <div
      v-if="!loading && filteredEmployees.length === 0"
      class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-8 tw-text-center"
    >
      <v-icon size="64" color="grey lighten-1">mdi-account-search</v-icon>
      <div class="tw-text-gray-500 tw-mt-4">No employees found matching your search</div>
      <v-btn text color="primary" class="tw-mt-2" @click="search = ''">Clear search</v-btn>
    </div>

    <div
            v-else
        class="tw-px-4 tw-py-2 tw-overflow-y-auto tw-flex-grow scrollable-content"
        v-infinite-scroll="loadMoreEmployees"
        :infinite-scroll-disabled="loading || !hasMoreEmployees"
        ref="employeeList"
    >
      <div v-if="loading" class="tw-py-2">
        <InternalEmployeeSkeleton />
      </div>

      <template v-else>          <div
          v-for="employee in filteredEmployees"
          :key="employee.id"
          @click="selectEmployee(employee)"
          class="tw-flex tw-items-start sm:tw-items-center tw-p-3 tw-border tw-border-gray-100 tw-rounded-lg tw-mb-2 tw-cursor-pointer tw-transition-all tw-duration-200 hover:tw-bg-gray-50"
          :class="{ 'tw-bg-blue-50 tw-border-blue-200': selectedEmployee && selectedEmployee.id === employee.id }"
        >
          <v-avatar size="40" sm:size="48" class="tw-mr-3 sm:tw-mr-4 tw-mt-1 sm:tw-mt-0">
            <img
              :src="employee.avatar"
              :alt="`${employee.firstName} ${employee.lastName}`"
              @error="handleAvatarError"
            />
          </v-avatar>
          <div class="tw-flex-1 tw-min-w-0">
            <div class="tw-flex tw-justify-between tw-items-start">
              <div class="tw-font-semibold tw-text-gray-800 tw-truncate">
                {{ employee.firstName }} {{ employee.middleName ? employee.middleName + ' ' : '' }}{{ employee.lastName }}
              </div>
              <v-chip
                x-small
                :color="employee.access ? 'success' : 'error'"
                text-color="white"
                class="tw-ml-1 tw-mt-0.5"
              >
                {{ employee.access ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
            <div class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-text-xs tw-text-gray-500 tw-mt-0.5">
              <span class="tw-truncate">{{ employee?.employment?.employment_type }}</span>
              <span class="tw-hidden sm:inline tw-mx-1">•</span>
              <span class="tw-truncate tw-text-gray-400">{{ employee.department || 'No Department' }}</span>
            </div>
            <div v-if="employee.phone" class="tw-text-xs tw-text-gray-400">
              {{ employee.phone }}
            </div>
          </div>
        </div>

        <div v-if="loadingMore" class="tw-flex tw-justify-center tw-py-4">
          <v-progress-circular indeterminate color="primary" size="24" />
        </div>
      </template>
    </div>
  </v-card>
</template>

<script>
import InternalEmployeeSkeleton from '@/components/admin-central/InternalEmployeeSkeleton.vue'

export default {
  components: {
    InternalEmployeeSkeleton
  },
  props: {
    employees: Array,
    loading: Boolean,
    loadingMore: {
      type: Boolean,
      default: false
    },
    selectedEmployee: Object,
    hasMoreEmployees: {
      type: Boolean,
      default: false
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
    },
    filteredEmployees() {
      if (!this.employees) return [];

      let result = this.employees;

      // Apply search filtering
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        result = result.filter(e =>
          e.firstName?.toLowerCase().includes(searchLower) ||
          e.lastName?.toLowerCase().includes(searchLower) ||
          e.company?.toLowerCase().includes(searchLower) ||
          e.email?.toLowerCase().includes(searchLower) ||
          e.phone?.toLowerCase().includes(searchLower) ||
          e.department?.toLowerCase().includes(searchLower) ||
          e.designation?.toLowerCase().includes(searchLower) ||
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchLower)
        );
      }

      // Apply access status filtering
      if (this.accessFilter !== 'all') {
        const isActive = this.accessFilter === 'active';
        result = result.filter(e => e.access === isActive);
      }

      // Apply department filtering
      if (this.departmentFilter !== 'all') {
        result = result.filter(e => e.department === this.departmentFilter);
      }

      return result;
    }
  },
  data() {
    return {
      search: '',
      searchTimeout: null,
      accessFilter: 'all',
      departmentFilter: 'all',
      accessFilterOptions: [
        { text: 'All', value: 'all' },
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ],
      departmentOptions: [
        { text: 'All Departments', value: 'all' }
      ],
    };
  },
  // Filtered employees now handled in main computed property above
  methods: {
    selectEmployee(employee) {
      this.$emit('select', employee);
    },
    handleSearchInput() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.$emit('search', this.search);
      }, 300);
    },
    loadMoreEmployees() {
      // Only emit the load-more event if we're not already loading and there are more employees to load
      if (!this.loading && !this.loadingMore && this.hasMoreEmployees) {
        this.$emit('load-more');
      }
    },
    handleAvatarError(e) {
      // Fallback to a default avatar if image fails to load
      e.target.src = 'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg';
    },

    handleFilterChange() {
      // Emit event to inform parent that filters changed
      this.$emit('filter-change', {
        accessFilter: this.accessFilter,
        departmentFilter: this.departmentFilter
      });
    },

    // Update department options based on available departments
    updateDepartmentOptions() {
      if (!this.employees || this.employees.length === 0) return;

      // Get unique departments
      const departments = [...new Set(this.employees
        .map(emp => emp.department)
        .filter(Boolean))];

      // Update department options
      this.departmentOptions = [
        { text: 'All Departments', value: 'all' },
        ...departments.map(dept => ({ text: dept, value: dept }))
      ];
    }
  },
  watch: {
    employees: {
      handler: 'updateDepartmentOptions',
      immediate: true
    }
  },
  directives: {
    infiniteScroll: {
      inserted: (el, binding) => {
        const loadMore = binding.value;
        const distance = 10;

        const handleScroll = () => {
          const scrollHeight = el.scrollHeight;
          const scrollTop = el.scrollTop;
          const clientHeight = el.clientHeight;

          // Check if infinite scroll is disabled
          const isDisabled = el.getAttribute('infinite-scroll-disabled') === 'true';

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
  }
};
</script>

<style scoped>
.scrollable-content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Smoother scrolling on iOS */
  max-height: calc(100vh - 280px); /* Default for desktop */
  min-height: 400px; /* Ensure minimum height for scrolling */
}

@media (max-width: 600px) {
  .scrollable-content {
    max-height: calc(100vh - 240px); /* Smaller height on mobile */
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-skeleton-loader {
  animation: fadeInUp 0.3s ease-out forwards;
}

/* Hide text on small screens but show icon */
@media (max-width: 600px) {
  .hidden {
    display: none;
  }
}
</style>
