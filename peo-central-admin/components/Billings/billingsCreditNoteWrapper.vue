<template>
  <div style="width: 100%">
    <v-row class="row1">
      <CustomCreditNoteDialog
        v-if="newCustomCreditNote"
        :show="newCustomCreditNote"
        :creditNoteToEdit="selectedCustomCreditNote"
        :key="creditNoteKey"
        @close="closeDialogs"
        @reload="handleReload"
      />

      <!-- Credit Notes List column -->
      <v-col>
        <v-card color="card_bg" id="card" style="height: 80vh !important">
          <v-card-text
            id="card-text"
            style="margin-top: 0 !important"
            :class="privacyMood ? 'privacyMood' : ''"
          >
            <v-row>
              <v-col cols="12" class="pl-0 pr-0 pb-4">
                <div class="flex_row align-center justify-space-between top_barCustomer">
                  <!-- Filter Buttons -->
                  <div>
                    <v-btn
                      v-for="(button, index) in filterButtons"
                      :key="index"
                      @click="handleFilterClick(index)"
                      :class="{ clicked: button.clicked }"
                      class="customer_table_btn pa-2 mr-1 mb-2"
                      value="inactive"
                      outlined
                    >
                      <span class="filter_btn pa-0">{{ button.text }}</span>
                    </v-btn>
                  </div>
                  
                  <!-- New Button and Search on the right -->
                  <div class="tw-flex tw-items-center tw-gap-3">
                    <!-- Search Input -->
                    <div class="tw-w-[250px]">
                      <v-text-field
                        v-model="filter.searchQuery"
                        placeholder="Search credit notes..."
                        solo
                        dense
                        clearable
                        hide-details
                        class="tw-bg-white tw-rounded"
                        @input="handleSearchInput"
                        @click:clear="handleSearchClear"
                        @keyup.enter="executeSearchImmediately"
                        :loading="isSearchPending"
                      >
                        <template v-slot:append>
                          <v-btn
                            icon
                            small
                            @click="handleSearchClick"
                            :loading="dataLoading"
                            class="tw-ml-1"
                            :color="isSearchPending ? 'warning' : 'primary'"
                          >
                            <v-icon v-if="isSearchPending">mdi-clock-outline</v-icon>
                            <v-icon v-else>mdi-magnify</v-icon>
                          </v-btn>
                        </template>
                      </v-text-field>
                    </div>
                    
                    <!-- New Button -->
                    <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn color="primary" v-bind="attrs" v-on="on">
                          New
                          <v-divider vertical class="mx-2"></v-divider>
                          <LightArrow class="ml-2" style="max-width: 10px" />
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          link
                          @click="handleNewCustomCreditNote"
                        >
                          <v-list-item-title class="">
                            <span class="n_text text--text ml-2">Custom Credit Note</span>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Credit Notes Table -->
            <v-data-table
              id="coa_table"
              :loading="dataLoading"
              :options.sync="options"
              :server-items-length="filter.totalResults"
              loading-text="Loading... Please wait"
              :headers="headers"
              :items="creditNotesList"
              hide-default-header
            >
              <template v-slot:header>
                <thead class="dynamic_table_thead">
                  <tr style="height: 35px !important">
                    <th
                      v-for="header in headers"
                      :key="header.value"
                      :class="[
                        header.align ? `text-${header.align}` : '',
                        'text-center text--text font-weight-bold',
                      ]"
                      style="
                        font-size: 12px !important;
                        font-weight: 500 !important;
                      "
                    >
                      {{ header.text }}
                    </th>
                  </tr>
                </thead>
              </template>
              <template v-slot:item="{ item }">
                <tr
                  :class="{
                    'draft-row': item.status === 'Draft',
                    'custom-credit-note-row': item.type === 'custom',
                  }"
                >
                  <td
                    style="height: 100%; cursor: pointer"
                    @click="handleCreditNoteClick(item)"
                    :style="{
                      borderLeft: item.type === 'custom' 
                        ? `5px solid #9c27b0` 
                        : `5px solid ${getStatusColor(item.status)}`,
                    }"
                  >
                    <div class="d-flex align-items-center">
                      {{ item.credit_note_number }}
                      <v-chip
                        v-if="item.type === 'custom'"
                        x-small
                        color="purple"
                        text-color="white"
                        class="ml-2"
                      >
                        Custom
                      </v-chip>
                      <v-chip
                        v-if="!item.invoice_number"
                        x-small
                        color="orange"
                        text-color="white"
                        class="ml-2"
                      >
                        Unlinked
                      </v-chip>
                    </div>
                  </td>
                  <td class="cursor-pointer" @click="handleCreditNoteClick(item)">
                    {{ item.credit_date | formatDateWithoutTime }}
                  </td>
                  <td class="cursor-pointer" @click="handleCreditNoteClick(item)">
                    <div class="d-flex align-center">
                      <v-avatar class="mr-2" size="30px">
                        <v-img
                          v-if="item.companyDetails && item.companyDetails.logo"
                          alt="Company Logo"
                          :src="item.companyDetails.logo"
                        ></v-img>
                        <div
                          v-else
                          class="d-flex align-center justify-center"
                          style="background-color: #E3F2FD; color: #1976D2; font-weight: 500; font-size: 14px; width: 100%; height: 100%;"
                        >
                          {{ getClientInitials(item) }}
                        </div>
                      </v-avatar>
                      {{ item.customer_name || 'N/A' }}
                    </div>
                  </td>
                  <td class="cursor-pointer" @click="handleCreditNoteClick(item)">
                    {{ item.invoice_number || 'N/A' }}
                  </td>
                  <td class="cursor-pointer" @click="handleCreditNoteClick(item)">
                    <b>{{ formatCurrency(item.total, item.currency || 'AED') }}</b>
                  </td>
                  <td class="cursor-pointer" @click="handleCreditNoteClick(item)">
                    <b>{{ formatCurrency(item.credit_balance || 0, item.currency || 'AED') }}</b>
                  </td>
                  <td class="pa-0 ma-0 pl-3 cursor-pointer" @click="handleCreditNoteClick(item)">
                    <v-chip
                      small
                      label
                      :color="getStatusColor(item.status)"
                      :text-color="getStatusTextColor(item.status)"
                      class="font-weight-medium"
                    >
                      {{ item.status }}
                    </v-chip>
                  </td>
                  <td class="">
                    <div class="d-flex align-center justify-end">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            small
                            color="primary"
                            @click.stop="editCreditNote(item)"
                            class="mr-2"
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-icon small>mdi-pencil</v-icon>
                          </v-btn>
                        </template>
                        <span>Edit Credit Note</span>
                      </v-tooltip>
                      <v-tooltip bottom v-if="item.type === 'custom' && !item.invoice_number">
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            icon
                            small
                            color="orange"
                            @click.stop="attachInvoiceToCreditNote(item)"
                            class="mr-2"
                            v-bind="attrs"
                            v-on="on"
                          >
                            <v-icon small>mdi-link</v-icon>
                          </v-btn>
                        </template>
                        <span>Attach Invoice to Credit Note</span>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Preview Drawer -->
    <v-navigation-drawer
      v-model="previewDrawer"
      right
      fixed
      temporary
      width="800"
      class="elevation-10"
    >
      <div class="d-flex justify-space-between align-center pa-4 border-bottom">
        <div class="text-h6">Credit Note Preview</div>
        <div>
          <v-btn
            color="primary"
            @click="editCreditNoteFromPreview"
            class="mr-2"
            small
          >
            <v-icon left small>mdi-pencil</v-icon>
            Edit
          </v-btn>
          <v-btn icon @click="previewDrawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      
      <div class="pa-4" v-if="selectedCreditNoteId">
        <CreditNotePreview :credit_id="selectedCreditNoteId" />
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import '@/assets/scss/utils/_invoiceTable.scss'
import SnackBar from '~/components/utils/SnackBar.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import CustomCreditNoteDialog from '@/components/Dialogs/customCreditNoteDialog.vue'
import CreditNotePreview from './CreditNotePreview.vue'
import moment from 'moment'

export default {
  components: {
    SnackBar,
    CustomInputContainer,
    LightArrow,
    CustomCreditNoteDialog,
    CreditNotePreview,
  },
  filters: {
    formatDateWithoutTime(dateString) {
      if (!dateString) return ''
      return moment(dateString).format('DD MMM YYYY')
    },
  },
  data() {
    return {
      privacyMood: false,
      snackbar_data: {},
      newCustomCreditNote: false,
      selectedCustomCreditNote: null,
      creditNoteKey: 0,
      dataLoading: false,
      creditNotesList: [],
      filter: {
        searchQuery: null,
        totalResults: 0,
        type: null, // 'custom' or null for all
        status: null, // status filter
        unlinked: false, // true to show only unlinked
      },
      options: {
        sortBy: [],
        page: 1,
        limit: 50,
        itemsPerPage: 10,
      },
      headers: [
        { text: 'Credit Note #', value: 'credit_note_number', align: 'start' },
        { text: 'Date', value: 'credit_date', align: 'start' },
        { text: 'Customer', value: 'customer_name', align: 'start' },
        { text: 'Invoice', value: 'invoice_number', align: 'start' },
        { text: 'Total', value: 'total', align: 'start' },
        { text: 'Balance', value: 'credit_balance', align: 'start' },
        { text: 'Status', value: 'status', align: 'start' },
        { text: 'Action', value: 'action', align: 'center', sortable: false },
      ],
      filterButtons: [
        { text: 'All Credit Notes', value: 'all', clicked: false },
        { text: 'Custom Credit Notes', value: 'custom', clicked: false },
        { text: 'Unlinked Custom', value: 'unlinked', clicked: false },
        { text: 'Draft', value: 'draft', clicked: false },
        { text: 'Approved', value: 'approved', clicked: false },
      ],
      searchDebounceTimer: null,
      isSearchPending: false,
      previewDrawer: false,
      selectedCreditNoteId: null,
      selectedCreditNote: null,
    }
  },
  computed: {
    computedSortBy() {
      return this.options.sortBy
        .map(
          (field, index) =>
            `${field}:${this.options.sortDesc[index] ? 'desc' : 'asc'}`
        )
        .join(',')
    },
  },
  watch: {
    options: {
      handler() {
        this.getCreditNotesList()
      },
      deep: true,
    },
  },
  methods: {
    async getCreditNotesList() {
      try {
        this.dataLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Build query params with filters
        const queryParams = {
          page: this.options.page,
          limit: this.options.itemsPerPage === -1 ? 100000 : this.options.itemsPerPage,
          sortBy: this.computedSortBy || 'createdAt',
          sort: -1, // descending
        }

        // Add search to query params
        if (this.filter.searchQuery && this.filter.searchQuery.trim() !== '') {
          queryParams.search = this.filter.searchQuery.trim()
        }

        // Add type filter to query params (backend will handle this)
        if (this.filter.type === 'custom') {
          queryParams.type = 'custom'
        }

        // Add status filter to query params
        if (this.filter.status) {
          queryParams.status = this.filter.status
        }

        const response = await this.$axios.$get(
          `/credit/notes/get/all`,
          {
            headers: { Authorization: AuthStr },
            params: queryParams,
          }
        )

        let results = response.results || response.data || []

        // Apply frontend filters that backend doesn't handle yet
        // Filter by unlinked (only applies to custom credit notes)
        if (this.filter.unlinked) {
          results = results.filter((cn) => {
            // Check if invoice is null, undefined, empty string, or invoice_number is missing
            const hasNoInvoice = (!cn.invoice || cn.invoice === null || cn.invoice === undefined || cn.invoice === '') && 
                                  (!cn.invoice_number || cn.invoice_number === null || cn.invoice_number === undefined || cn.invoice_number === '')
            return hasNoInvoice
          })
        }

        this.creditNotesList = results
        // Update total results to reflect filtered count
        this.filter.totalResults = results.length
      } catch (error) {
        console.error('Error fetching credit notes list:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to load credit notes.',
          type: 'error',
        })
        this.creditNotesList = []
      } finally {
        this.dataLoading = false
      }
    },
    handleFilterClick(index) {
      const button = this.filterButtons[index]
      const wasClicked = button.clicked
      button.clicked = !button.clicked

      // Reset all filters when "All" is clicked
      if (button.value === 'all') {
        if (button.clicked) {
          // Uncheck all other filters
          this.filterButtons.forEach((b, i) => {
            if (i !== index) b.clicked = false
          })
          this.filter.type = null
          this.filter.status = null
          this.filter.unlinked = false
        }
      } else {
        // When any other filter is clicked, uncheck "All"
        this.filterButtons[0].clicked = false

        // Handle filter state changes
        if (button.value === 'custom') {
          if (button.clicked) {
            this.filter.type = 'custom'
          } else {
            // If unchecking custom, also uncheck unlinked if it depends on custom
            if (this.filter.unlinked) {
              this.filter.unlinked = false
              this.filterButtons.find(b => b.value === 'unlinked').clicked = false
            }
            // Only clear type if no other custom-related filter is active
            if (!this.filter.unlinked) {
              this.filter.type = null
            }
          }
        } else if (button.value === 'unlinked') {
          if (button.clicked) {
            this.filter.unlinked = true
            this.filter.type = 'custom' // Unlinked only applies to custom
            // Ensure custom filter is also checked
            const customButton = this.filterButtons.find(b => b.value === 'custom')
            if (customButton) customButton.clicked = true
          } else {
            this.filter.unlinked = false
            // If custom is not checked, clear type
            const customButton = this.filterButtons.find(b => b.value === 'custom')
            if (!customButton || !customButton.clicked) {
              this.filter.type = null
            }
          }
        } else if (button.value === 'draft') {
          if (button.clicked) {
            this.filter.status = 'draft'
          } else {
            this.filter.status = null
          }
        } else if (button.value === 'approved') {
          if (button.clicked) {
            this.filter.status = 'approved'
          } else {
            this.filter.status = null
          }
        }
      }

      // If no filters are active, show all
      const hasActiveFilter = this.filterButtons.some((b, i) => i !== 0 && b.clicked)
      if (!hasActiveFilter) {
        this.filter.type = null
        this.filter.status = null
        this.filter.unlinked = false
        this.filterButtons[0].clicked = true
      }

      this.getCreditNotesList()
    },
    handleCreditNoteClick(item) {
      // Open preview drawer instead of editing directly
      this.selectedCreditNoteId = item._id
      this.selectedCreditNote = item
      this.previewDrawer = true
    },
    editCreditNoteFromPreview() {
      if (this.selectedCreditNote) {
        this.previewDrawer = false
        this.editCreditNote(this.selectedCreditNote)
      }
    },
    editCreditNote(creditNote) {
      if (creditNote.type === 'custom') {
        this.selectedCustomCreditNote = creditNote
        this.newCustomCreditNote = true
        this.creditNoteKey++
      } else {
        // For standard credit notes, you might want to open a different dialog
        this.$nuxt.$emit('show-snackbar', {
          message: 'Standard credit notes can be edited from the invoice preview.',
          type: 'info',
        })
      }
    },
    attachInvoiceToCreditNote(creditNote) {
      // Open edit dialog to attach invoice
      this.selectedCustomCreditNote = creditNote
      this.newCustomCreditNote = true
      this.creditNoteKey++
    },
    handleNewCustomCreditNote() {
      this.selectedCustomCreditNote = null
      this.newCustomCreditNote = true
      this.creditNoteKey++
    },
    closeDialogs() {
      this.newCustomCreditNote = false
      this.selectedCustomCreditNote = null
    },
    handleReload() {
      this.getCreditNotesList()
      this.closeDialogs()
    },
    formatCurrency(amount, currency = 'AED') {
      if (amount === null || amount === undefined || amount === '') {
        return `${currency} 0.00`
      }
      const num = parseFloat(amount)
      if (isNaN(num)) {
        return `${currency} 0.00`
      }
      return `${currency} ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },
    handleSearchInput() {
      // Debounce search
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      this.isSearchPending = true
      this.searchDebounceTimer = setTimeout(() => {
        this.executeSearchImmediately()
        this.isSearchPending = false
      }, 500)
    },
    handleSearchClear() {
      this.filter.searchQuery = null
      this.getCreditNotesList()
    },
    handleSearchClick() {
      this.executeSearchImmediately()
    },
    executeSearchImmediately() {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }
      this.isSearchPending = false
      this.getCreditNotesList()
    },
    getStatusColor(status) {
      switch (status) {
        case 'Approved': return '#E8F5E9' // Light Green
        case 'Applied': return '#E8F5E9' // Light Green
        case 'Draft': return '#F5F5F5' // Light Grey
        case 'Unapproved': return '#FFF3E0' // Light Orange
        case 'Void': return '#FFEBEE' // Light Red
        default: return '#E3F2FD' // Light Blue
      }
    },
    getStatusTextColor(status) {
      switch (status) {
        case 'Approved': return '#2E7D32' // Dark Green
        case 'Applied': return '#2E7D32' // Dark Green
        case 'Draft': return '#757575' // Dark Grey
        case 'Unapproved': return '#EF6C00' // Dark Orange
        case 'Void': return '#C62828' // Dark Red
        default: return '#1565C0' // Dark Blue
      }
    },
    getClientInitials(item) {
      const name = item.customer_name
      if (!name) return '?'

      const words = name.trim().split(' ')
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase()
      }
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
    },
  },
  async mounted() {
    await this.getCreditNotesList()
  },
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.draft-row {
  opacity: 0.7;
}

/* Highlight custom credit notes with a subtle purple/indigo background */
.custom-credit-note-row {
  background-color: #f3e5f5 !important; /* Light purple background */
}

.custom-credit-note-row:hover {
  background-color: #e1bee7 !important; /* Slightly darker purple on hover */
}

/* Ensure the highlight works even with draft rows */
.draft-row.custom-credit-note-row {
  background-color: #f3e5f5 !important;
  opacity: 0.85; /* Slightly less opacity for draft custom notes */
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
</style>

