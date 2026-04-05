<template>
  <v-card class="tw-p-0 tw-rounded-xl tw-shadow-sm tw-bg-white tw-flex tw-flex-col tw-h-full">
    <div class="tw-px-4 sm:tw-px-6 tw-pt-6 tw-flex-col tw-w-full tw-gap-2">
      <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <h2 class="tw-text-lg tw-font-semibold tw-text-gray-800">Points of Contact</h2>
        <v-btn color="primary" small class="tw-ml-2" @click="$emit('create')">
          <v-icon left>mdi-plus</v-icon>
          <span class="hidden sm:inline">Add Contact</span>
        </v-btn>
      </div>

      <!-- Search Bar -->
      <v-text-field
        v-model="search"
        placeholder="Search contacts..."
        prepend-inner-icon="mdi-magnify"
        dense
        outlined
        clearable
        class="tw-mb-3"
        @input="handleSearchInput"
      />

      <!-- Filters -->
      <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-3 tw-mb-3">
        <v-select
          v-model="statusFilter"
          :items="statusFilterOptions"
          label="Status"
          dense
          outlined
          @change="handleFilterChange"
          hide-details
        />
        <v-select
          v-model="departmentFilter"
          :items="departmentOptions"
          label="Department"
          dense
          outlined
          @change="handleFilterChange"
          hide-details
        />
        <v-select
          v-model="companyFilter"
          :items="companyOptions"
          label="Company"
          dense
          outlined
          @change="handleFilterChange"
          hide-details
          :loading="loadingCompanies"
          class="sm:tw-col-span-2 lg:tw-col-span-1"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && filteredContacts.length === 0"
      class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-8 tw-text-center"
    >
      <v-icon size="64" color="grey lighten-1">mdi-account-search</v-icon>
      <div class="tw-text-gray-500 tw-mt-4">No contacts found matching your search</div>
      <v-btn text color="primary" class="tw-mt-2" @click="clearFilters">Clear filters</v-btn>
    </div>

    <!-- Contact List -->
    <div
      v-else
      class="tw-px-4 tw-py-2 tw-overflow-y-auto tw-flex-grow scrollable-content"
      v-infinite-scroll="loadMoreContacts"
      :infinite-scroll-disabled="loading || !hasMoreContacts"
      ref="contactList"
    >
      <!-- Skeleton Loaders -->
      <div v-if="loading" class="tw-py-2">
        <PointsOfContactSkeleton />
      </div>

      <!-- Contact Items -->
      <template v-else>
        <div
          v-for="contact in filteredContacts"
          :key="contact._id"
          @click="selectContact(contact)"
          class="tw-flex tw-items-start sm:tw-items-center tw-p-3 tw-border tw-border-gray-100 tw-rounded-lg tw-mb-2 tw-cursor-pointer tw-transition-all tw-duration-200 hover:tw-bg-gray-50"
          :class="{ 'tw-bg-blue-50 tw-border-blue-200': selectedContact && selectedContact._id === contact._id }"
        >
          <!-- Avatar -->
          <v-avatar size="40" sm:size="48" class="tw-mr-3 sm:tw-mr-4 tw-mt-1 sm:tw-mt-0">
            <img
              v-if="contact.image_url"
              :src="contact.image_url"
              :alt="contact.name"
              @error="handleAvatarError"
            />
            <v-icon v-else color="grey lighten-1">mdi-account</v-icon>
          </v-avatar>

          <!-- Contact Info -->
          <div class="tw-flex-1 tw-min-w-0">
            <div class="tw-flex tw-justify-between tw-items-start">
              <div class="tw-font-semibold tw-text-gray-800 tw-truncate">
                {{ contact.name }}
              </div>
              <v-chip
                x-small
                :color="contact.status === 'active' ? 'success' : 'error'"
                text-color="white"
                class="tw-ml-1 tw-mt-0.5"
              >
                {{ contact.status === 'active' ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>

            <div class="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-text-xs tw-text-gray-500 tw-mt-0.5">
              <span class="tw-truncate">{{ contact.designation || 'No Designation' }}</span>
              <span class="tw-hidden sm:inline tw-mx-1">•</span>
              <span class="tw-truncate tw-text-gray-400">{{ contact.department || 'No Department' }}</span>
            </div>

            <div v-if="contact.companyDetails" class="tw-text-xs tw-text-gray-400 tw-mt-0.5">
              <span class="tw-truncate">{{ contact.companyDetails.company_name }}</span>
            </div>
          </div>
        </div>

        <!-- Load More Indicator -->
        <div v-if="loadingMore" class="tw-flex tw-justify-center tw-py-4">
          <v-progress-circular indeterminate color="primary" size="24" />
        </div>
      </template>
    </div>
  </v-card>
</template>

<script>
import PointsOfContactSkeleton from '@/components/admin-central/PointsOfContactSkeleton.vue'

export default {
  name: 'PointsOfContactList',
  components: {
    PointsOfContactSkeleton
  },
  props: {
    contacts: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingMore: {
      type: Boolean,
      default: false
    },
    selectedContact: {
      type: Object,
      default: null
    },
    hasMoreContacts: {
      type: Boolean,
      default: false
    },
    stats: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      search: '',
      statusFilter: 'all',
      departmentFilter: 'all',
      companyFilter: 'all',
      loadingCompanies: false,
      companies: [],
      searchTimeout: null
    }
  },
  computed: {
    statusFilterOptions() {
      return [
        { text: 'All Status', value: 'all' },
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ]
    },
    departmentOptions() {
      const options = [{ text: 'All Departments', value: 'all' }]
      if (this.stats.byDepartment) {
        this.stats.byDepartment.forEach(dept => {
          options.push({
            text: dept.department || 'Unknown',
            value: dept.department || 'unknown'
          })
        })
      }
      return options
    },
    companyOptions() {
      const options = [{ text: 'All Companies', value: 'all' }]
      this.companies.forEach(company => {
        options.push({
          text: company.company_name,
          value: company._id
        })
      })
      return options
    },
    filteredContacts() {
      if (!this.contacts) return []

      let result = this.contacts

      // Apply search filtering
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        result = result.filter(contact =>
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.phone?.toLowerCase().includes(searchLower) ||
          contact.designation?.toLowerCase().includes(searchLower) ||
          contact.department?.toLowerCase().includes(searchLower) ||
          contact.companyDetails?.company_name?.toLowerCase().includes(searchLower)
        )
      }

      // Apply status filter
      if (this.statusFilter !== 'all') {
        result = result.filter(contact => contact.status === this.statusFilter)
      }

      // Apply department filter
      if (this.departmentFilter !== 'all') {
        result = result.filter(contact => contact.department === this.departmentFilter)
      }

      // Apply company filter
      if (this.companyFilter !== 'all') {
        result = result.filter(contact => contact.company_id === this.companyFilter)
      }

      return result
    }
  },
  async mounted() {
    await this.loadCompanies()
  },
  methods: {
    selectContact(contact) {
      this.$emit('select', contact)
    },
    handleSearchInput() {
      // Debounce search
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.$emit('search', this.search)
      }, 300)
    },
    handleFilterChange() {
      this.$emit('filter-change', {
        status: this.statusFilter,
        department: this.departmentFilter,
        company: this.companyFilter
      })
    },
    loadMoreContacts() {
      if (!this.loading && !this.loadingMore && this.hasMoreContacts) {
        this.$emit('load-more');
      }
    },
    clearFilters() {
      this.search = ''
      this.statusFilter = 'all'
      this.departmentFilter = 'all'
      this.companyFilter = 'all'
      this.handleFilterChange()
    },
    handleAvatarError(event) {
      event.target.style.display = 'none'
      event.target.nextElementSibling.style.display = 'block'
    },
    async loadCompanies() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        this.loadingCompanies = true
        const response = await this.$axios.$get('/companies/paginated/list', {
          params: { limit: 100 },
          headers: { Authorization: AuthStr }
        })
        this.companies = response.results || []
      } catch (error) {
        console.error('Error loading companies:', error)
        this.$emit('error', 'Failed to load companies')
      } finally {
        this.loadingCompanies = false
      }
    }
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
  }
}
</script>

<style scoped>
.scrollable-content {
  max-height: calc(100vh - 300px);
}
</style>
