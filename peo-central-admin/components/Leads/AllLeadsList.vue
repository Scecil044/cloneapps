<template>
  <div>
    <v-row class="Leads_list_wrapper">
      <!-- FILTER DIALOG -->
      <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="550px" content-class="allLeads_dialog">
        <v-card id="card" style="padding: 20px 30px !important">
          <v-card-title id="card-title">
            <h4 class="text--text">Filter By</h4>
            <v-icon small color="subtext" class="ml-5" @click="filterDialog = false">fa-close</v-icon>
          </v-card-title>
          <v-card-text id="card-text">
            <v-container class="ma-0 pa-0">
              <v-row class="pb-0">
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text">Leads received date range</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0  pb-0">
                  <CustomInputContainer label="From">
                    <div slot="input">
                      <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                        transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="estimate_date" placeholder="mm/dd/yy"
                            class="proposalDialog_date_field2" solo dense readonly v-bind="attrs" v-on="on"
                            :rules="main_rule">
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker v-model="estimate_date" @input="date_menu = false" />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pr-0  pb-0">
                  <CustomInputContainer label="To">
                    <div slot="input">
                      <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40"
                        transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field v-model="exp_date" placeholder="mm/dd/yy" class="proposalDialog_date_field2"
                            solo dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker v-model="exp_date" @input="exp_date_menu = false" />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text pb-0">Progress</h5>
                </v-col>
                <v-col cols="12" class="pl-0 pr-0 mb-4">
                  <v-btn v-for="(button, index) in buttons" :key="index" @click="handleClick(index)"
                    :class="{ clicked: button.clicked }" class="customer_table_btn pa-2 mr-1" value="inactive" outlined>
                    <span class="filter_btn pa-0">{{ button.text }}</span>
                  </v-btn>
                </v-col>
                <v-col cols="12" class="pa-0">
                  <h5 class="text--text pb-0">Assigned to person</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                  <div slot="input">
                    <v-select :items="computedPROList" placeholder="Select Lead Owner" solo dense multiple
                      v-model="selectedEmployees" item-text="full_name" item-value="_id"
                      class="proposalDialog_date_field2" v-if="computedPROList.length >= 1" append-icon="fa-chevron-down">
                    </v-select>
                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Lead Owner
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" class="pa-0">
                  <h5 class="text--text">Employers</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                  <div slot="input">
                    <v-select :items="employers" placeholder="Select Employers" solo dense multiple
                      v-model="selectedEmployers" item-text="company_name" item-value="_id"
                      class="proposalDialog_date_field2" v-if="employers.length >= 1"
                      append-icon="fa-chevron-down"></v-select>
                    <p v-else class="error--text mb-5 mt-5">Please Select Employers </p>
                  </div>
                </v-col>

                <v-col cols="12" class="ma-0 pa-0">
                  <div class="d-flex align-center justify-end">
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined
                      @click="filterDialog = false; clearFilter()"><span class="">Clear All</span></v-btn>
                    <v-btn class="tall__btn pl-6 pr-6" color="primary"
                      @click="filterDialog = false, handleFilterLeads()">Done</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- / FILTER DIALOG -->
      <!-- list column -->
      <v-col sm="12" md="12" lg="12">
        <v-card class="no-border_shadow" color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-title id="card-title" class="mb-4">
            <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
              <div style="width: 50% !important">
                <div class="d-flex">
                  <v-select label="All" class="ma-0 pa-0" flat solo append-icon="fa-chevron-down" hide-details dense
                    multiple :items="computedLeadsStatusListByOrder" item-text="type" item-value="type"
                    v-model="selectedLeadsType" @change="handleFilterLeadsStatus(selectedLeadsType)" v-if="leadsMenu" />
                  <h4 class="text--text" v-else>{{ sectionTitle }}</h4>
                </div>
              </div>

              <div class="d-flex align-center justify-end" style="width: 50%">
                <v-btn style="min-width: 45px !important" class="short__btn mr-2 pl-0 pr-0" color="subtext" outlined
                  @click="filterDialog = true">
                  <filterIcon />
                </v-btn>
                <v-btn @click="handleNewLead()" class="short__btn" color="primary">New</v-btn>
              </div>
            </div>
          </v-card-title>

          <div class="flex_row align-center top_barCustomer">
            <div class="search__bar">
              <v-text-field v-model="searchQuery" class="ml-1" @input="searchDebounceAction()" label="Search" solo flat
                hide-details background-color="#f9fafc"></v-text-field>
            </div>
          </div>

          <!-- Priority Level Filter Pills -->
          <div class="tw-flex tw-flex-wrap tw-gap-2 tw-mb-4 tw-px-4">
            <v-chip
              v-for="priority in priorityFilters"
              :key="priority.value"
              :color="priority.active ? priority.color : 'grey'"
              :text-color="priority.active ? 'white' : 'grey'"
              :outlined="!priority.active"
              class="tw-cursor-pointer tw-transition-all tw-duration-200"
              @click="togglePriorityFilter(priority.value)"
            >
              <v-icon left small :color="priority.active ? 'white' : priority.color">
                mdi-flag
              </v-icon>
              {{ priority.label }}
              <span v-if="priority.count > 0" class="tw-ml-1 tw-text-xs">
                ({{ priority.count }})
              </span>
            </v-chip>
          </div>

          <div class="dl__list">
            <v-card-text id="card-text2" style="max-height: 90vh" class="dl__list overflow-y-auto">
              <!-- Skeleton loader for leads list -->
              <LeadCardSkeleton v-if="loading_leads && (!visibleData || visibleData.length === 0)" :count="8" />

              <v-progress-linear class="mt-2" indeterminate
                v-if="loading_leads && visibleData.length > 0"></v-progress-linear>

              <v-list class="customers_list__con" v-if="visibleData.length > 0">
                <v-list-item-group>
                  <ProcessListItem v-for="(item, index) in visibleData"
                    :class="index !== (visibleData.length - 1) ? 'border-b-sm' : ''" :key="index"
                    @clicked="LeadsClicked(item)" :active="activeItem?._id == item?._id" :avatarSrc="item.company_logo"
                    :companyName="item.company_name">

                    <template v-slot:title>
                      <v-row justify="space-between">
                        {{ item.company_name }}&nbsp;
                      </v-row>
                      <span class="tw-mt-1 tw-text-gray-400">
                        {{ `${item.first_name} ${item.last_name}` }}
                      </span>
                    </template>

                    <template v-slot:tags>
                      <!-- status chip -->
                      <Chip v-if="item.status == 'completed'" :tooltipColor="'green'" :chipClass="'green white--text'"
                        :tooltipText="item.status">
                        {{ item.status }}
                      </Chip>
                      <Chip v-else-if="item.status == 'new'" :tooltipColor="'amber'" :chipClass="'amber white--text'"
                        :tooltipText="item.status">
                        {{ item.status }}
                      </Chip>
                      <Chip v-else :tooltipColor="'deep-purple'" :chipClass="'deep-purple'" :tooltipText="item.status">
                        {{ item.status }}
                      </Chip>
                    </template>
                    <template v-slot:action-text>
                      {{ item.createdAt | formatDateWithoutTime }}
                    </template>
                    <template v-slot:action>
                      <!-- Red flag icon and three dots dropdown on same line -->
                      <div class="d-flex align-center">
                        <!-- Dynamic flag icon for lead scoring -->
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              :color="getFlagColor(item)"
                              icon
                              small
                              class="mr-1"
                              v-bind="attrs"
                              v-on="on"
                            >
                              <v-icon small>mdi-flag</v-icon>
                            </v-btn>
                          </template>
                          <span style="white-space: pre-line">{{ getTooltipText(item) }}</span>
                        </v-tooltip>

                        <v-menu transition="slide-y-transition" class="ml-auto" rounded="lg" offset-y>
                          <template v-slot:activator="{ attrs, on }">
                            <v-btn v-bind="attrs" v-on="on" color="subtext" icon>
                              <v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                          </template>
                          <v-list>
                            <v-list-item @click="updateLeadsStatus(item)">
                              <span class="n_text text--text">
                                Hold
                              </span>
                            </v-list-item>
                            <v-list-item @click="setReassignItem(item)">
                              <span class="n_text text--text">
                                Reassign Lead
                              </span>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>
                    </template>
                  </ProcessListItem>

                  <Observer v-if="enableObserver" @intersect="IntersectGetLeadsList" />
                </v-list-item-group>
              </v-list>

              <!-- Infinite scroll loading indicator -->
              <div v-if="loadingMore && visibleData.length > 0" class="tw-flex tw-items-center tw-justify-center tw-py-4">
                <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                <span class="tw-ml-2 text-sm text-gray-600">Loading more leads...</span>
              </div>

              <div v-if="visibleData.length == 0 && loading_leads" class="tw-flex tw-items-center tw-justify-center "
                style="max-width:100%;min-height:170px;">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>

              <v-row v-if="!loading_leads && visibleData.length == 0" class="mx-0"
                style="max-width:100%;min-height:170px;">
                <v-col cols="12" justify="center" align="center" class="ma-auto">
                  <v-img src="/hr/empty.svg" max-width="fit-content" height="fit-content" class="" contain></v-img>
                  <p class="font-weight-normal largeHeadingFontSize mt-3">No Leads</p>
                  <p class="mb-0 grey-heading-text textFontSize mt-5">No leads found for this filter!</p>
                </v-col>
              </v-row>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>


    <!-- reassign lead -->

    <v-dialog v-model="reassign_inquiry_dialog" max-width="500px" min-width="350px" persistent>
      <v-card class="rounded-xl pa-0 pt-0" flat max-height="400" min-height="200">
        <v-form ref="invoiceForm" v-model="validPRO" lazy-validation>
          <v-row class="tw-py-3 tx-pr-3">
            <v-card-title class="py-0">
              <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
              <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
                Re-Assign Lead </span>
            </v-card-title>
            <v-spacer />
            <v-btn @click="reassign_inquiry_dialog = false" outlined icon color="red accent-4" class="tw-mr-3">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="tw-px-6 tw-py-8">
            <v-row>
              <v-col cols="12">
                <CustomInputContainer :mandatory="true" label="Select Lead Owner">
                  <div slot="input">
                    <v-select :items="computedPROList" solo v-model="selected_pro" item-text="full_name"
                      :loading="loading_pro" item-value="_id" class="proposalDialog_date_field2"
                      append-icon="fa-chevron-down">
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <!-- <div class="d-flex align-center justify-end"> -->
            <v-btn flat text :disabled="assign_pro_loading" @click="reassign_inquiry_dialog = false" large><span
                class="">Cancel</span></v-btn>

            <v-btn color="primary" outlined large :disabled="assign_pro_loading" :loading="assign_pro_loading"
              @click="reassignLead"> Re-Assign </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <SnackBar :data="snackbar_data" />

    <!-- Snackbar -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>

    <!-- New Lead Dialog -->
    <NewLeadDialog v-model="showNewLeadDialog" @lead-created="handleLeadCreated" />
  </div>
</template>
<script>
// calender.svg
import '@/assets/scss/utils/_allLeadsList.scss'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import EditSvg from '@/assets/images/Customer/edit.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import Tabs from '@/components/Tabs/index.vue'
import CustomerDetails from '@/components/Customers/CusDetails.vue'
import EmployeesDetails from '@/components/Customers/EmployeesDetails.vue'
import customerInvoices from '@/components/Customers/CustomerInvoices.vue'
import customerInsight from '@/components/Customers/CustomerInsight.vue'
import customerPayroll from '@/components/Customers/customerPayroll.vue'
import customerDocuments from '@/components/Customers/CustomerDocuments.vue'
import Invoices from '../Sales/Invoices.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import Observer from '~/components/Observer.vue'
import ProcessListItem from '@/components/reuseable/ProcessListItem.vue'
import Chip from '@/components/reuseable/Chip.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import AddLeadsForm from '@/components/EditModel/editLeads.vue'
import NewLeadDialog from '@/components/Dialogs/Leads/NewLeadDialog.vue'
import LeadCardSkeleton from '@/components/reuseable/LeadCardSkeleton.vue'

export default {
  components: {
    customerDefaultIcon,
    DarkArrow,
    Tabs,
    SnackBar,
    CustomerDetails,
    EmployeesDetails,
    customerInvoices,
    customerInsight,
    customerDocuments,
    customerPayroll,
    Invoices,
    EditSvg,
    filterIcon,
    CalenderSvg,
    LightArrow,
    CustomInputContainer,
    Observer,
    ProcessListItem,
    Chip,
    AddLeadsForm,
    NewLeadDialog,
    LeadCardSkeleton
  },
  props: {
    selectedCustomer: Object,
    showNewLeadButton: Boolean,
    status: String,
    leadsMenu: Boolean,
    sectionTitle: String,
    activeStatus: String,
  },
  data() {
    return {
      searchQuery: '',
      date_menu: false,
      estimate_date: '',
      exp_date_menu: false,
      reassign_inquiry_dialog: false,
      assign_pro_loading: false,
      selected_pro: false,
      loading_pro: false,
      validPRO: false,
      snackbar_data: {
        snackbar: false,
        text: '',
        color: 'success',
        icon: 'spinner fa-spin',
        timeout: 1000,
      },
      pro_list: [],
      exp_date: '',
      leadsList: [],
      buttons: [
        { text: 'All Leads', clicked: false },
        { text: 'New Leads', clicked: false },
        { text: 'Not Contacted', clicked: false },
        { text: 'Contacted', clicked: false },
      ],
      date: '',
      filterDialog: false,
      tab_current_val: 'all',
      main_rule: [(v) => !!v || 'This filed is required'],
              limit: 6,
        page: 1,
      employerPage: 0,
      employeePage: 0,
      selectedStatus: '',
      employers: [],
      selectedEmployers: [],
      employees: [],
      selectedEmployees: [],
      leadsStatusList: [],
      selectedLeadsType: [],
      snack: false,
      snackText: '',
      snackColor: '',
      filter: {},
      listing: 'search',
      enableObserver: true,
      selected_lead: {},
      loading_leads: false,
      loadingMore: false, // Track infinite scroll loading state
      showNewLeadDialog: false,
      newLeadTab: null,
      bulkUploadFile: null,
      uploadingBulk: false,
      activeItem: null,
      selectedLeadId: null,
      // Priority filter data
      selectedPriorityFilter: null,
      priorityFilters: [
        { label: 'All', value: 'all', color: 'primary', active: true, count: 0 },
        { label: 'Hot Lead', value: 'hot', color: 'red darken-2', active: false, count: 0 },
        { label: 'Warm Lead', value: 'warm', color: 'orange darken-2', active: false, count: 0 },
        { label: 'Cold Lead', value: 'cold', color: 'blue darken-2', active: false, count: 0 },
        { label: 'Unqualified', value: 'unqualified', color: 'grey darken-2', active: false, count: 0 }
      ]
    }
  },
  watch: {
    activeStatus(val) {
      if (val) {
        // Always fetch new leads when active status changes to apply filter
        this.getLeadsList()
      }
    },
    reassign_inquiry_dialog(val) {
      if (val) {
        this.fetchPROs()
      }
    },
    leadsList: {
      handler() {
        // Update priority filter counts whenever leads list changes
        this.$nextTick(() => {
          this.updatePriorityFilterCounts();
        });
      },
      deep: true
    }
  },
  beforeDestroy() {
    this.$nuxt.$off('lead-auto-select')
    this.$nuxt.$off('lead-data-updated')
  },
  methods: {
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleFilterSearch()
    }, 500),
    handleAutoSelection() {
            this.$nuxt.$on('lead-auto-select', (leadId) => {
        this.selectedLeadId = leadId
      })

      // Listen for global lead update events
      this.$nuxt.$on('lead-data-updated', (eventData) => {
        if (eventData.action === 'update') {
          // Store current selected lead ID before refresh
          const currentSelectedId = this.activeItem?._id
          if (currentSelectedId) {
            this.selectedLeadId = currentSelectedId
          }
          // Refresh the leads list to show updated data
          this.getLeadsList()
        }
      })
    },
    handleNewLead() {
      this.showNewLeadDialog = true
    },
    async fetchPROs() {
      try {
        this.loading_pro = true
        const response = await this.$axios.post('/users/pro', {
          module: 'leads'
        })
        this.pro_list = response.data || []
      } catch (error) {
        console.error('Error when fetching inquiries: ', error.message)
        this.showNotificationStatus(
          `Error when fetching inquiries: ${error.message}`,
          false
        )
      } finally {
        this.loading_pro = false
      }
    },
    handleLeadCreated() {
      this.selectedLeadId = null
      this.getLeadsList()
    },
    handleClick(index) {
      this.buttons[index].clicked = !this.buttons[index].clicked
      this.selectedStatus = this.buttons.filter(button => button.clicked).map(button => button.value)
    },
    LeadsClicked(val) {
      this.$emit('LeadsListClicked', val)
      this.activeItem = val
      // Store the selected lead ID for re-selection after updates
      this.selectedLeadId = val?._id
    },
    async IntersectGetLeadsList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      // Prepare request body - don't include status if activeStatus is "Total"
      const getRequestBody = (baseBody) => {
        if (this.activeStatus === 'Total') {
          return baseBody;
        }
        return { ...baseBody, status: this.activeStatus };
      };

              // Check if we should load more data (infinite scroll)
        if (this.enableObserver === true) {
          this.page++;
          this.loadingMore = true;

          try {
            let response;
            const requestBody = this.listing === 'search'
              ? getRequestBody({ module: "leads", search: this.searchQuery })
              : getRequestBody(this.filter);



            if (this.listing === 'search') {
              response = await this.$axios.$post(`/generic/search?page=${this.page}&limit=${this.limit}`, requestBody, { headers: { Authorization: AuthStr } });
            } else {
              response = await this.$axios.$post(`/generic/filter?page=${this.page}&limit=${this.limit}`, requestBody, { headers: { Authorization: AuthStr } });
            }

            // Check if we have more results
            if (response.results && response.results.length > 0) {
              const lists = response.results;
              this.leadsList = [...this.leadsList, ...lists];

              // Update priority filter counts after more leads are loaded
              this.$nextTick(() => {
                this.updatePriorityFilterCounts();
              });

              // Check if we've reached the end of pagination
              if (response.results.length < this.limit || this.page >= response.totalPages) {
                this.enableObserver = false;
              } else {
                // Re-enable observer for next scroll
                this.enableObserver = true;
              }
            } else {
              // No more results, disable infinite scroll
              this.page--;
              this.enableObserver = false;
            }
          } catch (error) {
            console.error('Error loading more leads:', error);
            this.page--;
            this.enableObserver = false;
          } finally {
            this.loadingMore = false;
          }
      } else {
        // Initial load or filter change - reset and load first page
        this.leadsList = [];
        this.page = 1;
        this.loading_leads = true;

        try {
          let response;
          const requestBody = this.listing === 'search'
            ? getRequestBody({ module: "leads", search: this.searchQuery })
            : getRequestBody(this.filter);



          if (this.listing === 'search') {
            response = await this.$axios.$post(`/generic/search?page=${this.page}&limit=${this.limit}`, requestBody, { headers: { Authorization: AuthStr } });
          } else {
            response = await this.$axios.$post(`/generic/filter?page=${this.page}&limit=${this.limit}`, requestBody, { headers: { Authorization: AuthStr } });
          }

          const lists = response.results || [];
          this.leadsList = [...lists];

          // Update priority filter counts after leads list is loaded
          this.$nextTick(() => {
            this.updatePriorityFilterCounts();
          });

          // Enable infinite scroll if there are more pages
          if (response.results && response.results.length > 0 && this.page < response.totalPages) {
            this.enableObserver = true;
          } else {
            this.enableObserver = false;
          }
        } catch (error) {
          console.error('Error loading leads:', error);
          this.enableObserver = false;
        } finally {
          this.loading_leads = false;
        }
      }
    },
    showNotificationStatus(message, status) {
      this.snackbar_data = {
        snackbar: true,
        text: message,
        color: status ? 'success' : 'error',
        icon: 'spinner fa-spin',
        timeout: 3000,
      }
    },
    setReassignItem(item) {
      this.selected_lead = item
      this.reassign_inquiry_dialog = true
    },
    async reassignLead() {
      try {
        this.assign_pro_loading = true
        const response = await this.$axios.post(`/leads/reassign/${this.selected_lead?._id}`, {
          user_id: this.selected_pro,
        })
        this.showNotificationStatus(`Lead Reassigned Successfully`, true)
        // this.reloadInquiries()
        this.getLeadsList()


      } catch (error) {
        console.error('Error when Reassigned Lead: ', error.message)
        this.showNotificationStatus(
          `Error when Reassigned Lead: ${error.message}`,
          false
        )
      } finally {
        this.reassign_inquiry_dialog = false
        this.assign_pro_loading = false
      }
    },
    async getLeadsList() {
      try {
        this.page = 1;
        this.searchQuery = ''
        this.listing = 'search'
        this.enableObserver = false // Reset infinite scroll state

        await this.IntersectGetLeadsList()
        if (this.leadsList.length) {
          if (this.selectedLeadId) {
            const lead = this.leadsList.find((el) => el?._id == this.selectedLeadId)
            if (lead) {
              this.LeadsClicked(lead)
            } else {
              this.LeadsClicked(this.leadsList[0])
            }
          } else {
            this.LeadsClicked(this.leadsList[0])
          }
        }
      } catch (error) {
        throw new Error(`Could Not Fetch Leads: ${error.message}`)
      }
    },
    async handleFilterSearch() {
      this.page = 1;
      this.leadsList = []
      this.listing = 'search'
      this.enableObserver = false // Reset infinite scroll state

      this.IntersectGetLeadsList()
    },
    async handleFilterLeads() {
      try {
        this.loading_leads = true;
        this.page = 1;
        this.leadsList = [];

        const AuthStr = 'Bearer '.concat(this.$store.state.token);

        // Build filter object
        const filterData = {
          module: 'leads',
          start_date: this.estimate_date,
          end_date: this.exp_date,
          selected_company_id: this.selectedEmployers,
          user_id: this.selectedEmployees,
          status: this.buttons.filter(btn => btn.clicked).map(btn => btn.text)
        };

        // Add priority filter if selected
        if (this.selectedPriorityFilter) {
          filterData.priority = this.selectedPriorityFilter;
        }

        const response = await this.$axios.$post(`/generic/filter?page=${this.page}&limit=${this.limit}`, filterData, {
          headers: { Authorization: AuthStr }
        });

        const lists = response.results || [];
        this.leadsList = [...lists];

        // Enable infinite scroll if there are more pages
        if (response.results && response.results.length > 0 && this.page < response.totalPages) {
          this.enableObserver = true;
        } else {
          this.enableObserver = false;
        }

      } catch (error) {
        console.error('Error filtering leads:', error);
        this.enableObserver = false;
      } finally {
        this.loading_leads = false;
      }
    },
    clearFilter() {
      this.estimate_date = ''
      this.exp_date = ''
      this.selectedStatus = ''
      this.selectedEmployees = []
      this.selectedEmployers = []
      this.filter = {
        "module": "leads"
      }
      this.enableObserver = false // Reset infinite scroll state

      this.IntersectGetLeadsList()
    },
    async handleFilterLeadsStatus(data) {
      try {
        this.page = 1;
        this.leadsList = []
        this.listing = 'filter'
        this.enableObserver = false // Reset infinite scroll state

        // Don't include status filter if data is "Total"
        if (data === 'Total') {
          this.filter = { 'module': 'leads' }
        } else {
          this.filter = { 'module': 'leads', 'status': data }
        }
        await this.IntersectGetLeadsList()
      } catch (error) {
        throw new Error(`Could Filter Lead Statuses: ${error.message}`)
      }
    },
    async getLeadsStatusList() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.page = 1;

        await this.$axios.$post(`/leads/status/list?page=${this.page}&limit=${this.limit}`, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.leadsStatusList = response

            this.buttons = this.leadsStatusList.map((value) => {
              return {
                text: value.charAt(0).toUpperCase() + value.slice(1),
                value: value,
                clicked: false
              }
            })
          })
      } catch (error) {
        throw error;
      }
    },
    async getEmployersList() {
      try {
        this.employerPage++;
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        await this.$axios.$post(`/companies/list/dropdown?page=${this.employerPage}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.employers = response
          })
      } catch (error) {
        throw new Error(`Could not fetch employers list: ${error.message}`)
      }
    },
    async getEmployeesList() {
      try {
        this.employeePage = 1;
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        await this.$axios.$post(`/users/list/dropdown?page=${this.employeePage}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.employees = response
          })
      } catch (error) {
        throw new Error(`Could not fetch employees list: ${error.message}`)
      }
    },
    async updateLeadsStatus(item) {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        await this.$axios.$post(`/leads/hold/${item.id}`, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.snack = true
            this.snackText = 'Status Has Been Updated to Hold.'
            this.snackColor = 'success'
            this.getLeadsList()
          })
      }
      catch (error) {
        throw new Error(`Something happened when updating lead status: ${error.message}`)
      }
    },
    handleSingleLeadClose() {
      this.showNewLeadDialog = false
      this.getLeadsList() // Refresh the leads list
    },
    togglePriorityFilter(priorityValue) {
      // Handle "All" filter - clear priority filter
      if (priorityValue === 'all') {
        this.selectedPriorityFilter = null;
        this.priorityFilters.forEach(filter => {
          filter.active = filter.value === 'all';
        });
      } else {
        // If clicking the same filter, clear it
        if (this.selectedPriorityFilter === priorityValue) {
          this.selectedPriorityFilter = null;
          this.priorityFilters.forEach(filter => {
            filter.active = filter.value === 'all';
          });
        } else {
          // Set the new filter
          this.selectedPriorityFilter = priorityValue;
          this.priorityFilters.forEach(filter => {
            filter.active = filter.value === priorityValue;
          });
        }
      }

      // No need to call getLeadsList() - the visibleData computed property will handle the filtering
    },

    updatePriorityFilterCounts() {
      // Get the current filtered data (without priority filter applied)
      let currentFilteredData = _.orderBy(this.leadsList, ['createdAt'], ['desc']);

      // Count leads in each priority category
      const counts = {
        all: currentFilteredData.length, // Total count
        hot: 0,
        warm: 0,
        cold: 0,
        unqualified: 0
      };

      currentFilteredData.forEach(lead => {
        const score = this.calculateLeadScore(lead);
        if (score >= 80) counts.hot++;
        else if (score >= 60) counts.warm++;
        else if (score >= 40) counts.cold++;
        else counts.unqualified++;
      });

      // Update the priority filter counts
      this.priorityFilters.forEach(filter => {
        filter.count = counts[filter.value] || 0;
      });
    },
  },
  async mounted() {
    try {
      this.getEmployersList()
      this.getEmployeesList()
      this.getLeadsStatusList();
      this.handleAutoSelection()

      // Load initial leads after a short delay to ensure everything is initialized
      setTimeout(() => {
        this.getLeadsList();
      }, 100);
    } catch (error) {
      throw error;
    }
  },
  computed: {
    visibleData() {
      let lists = [];
      lists = _.orderBy(this.leadsList, ['createdAt'], ['desc']);

      // Validate and fix any missing company names for proper icon display
      let filteredLists = lists.map(lead => {
        if (!lead.company_name || typeof lead.company_name !== 'string' || lead.company_name.trim() === '') {
          console.warn('Lead missing company name:', lead._id, 'using fallback');
          return {
            ...lead,
            company_name: lead.lead_name || 'Unknown Company'
          };
        }
        return lead;
      });

      // Apply priority filter if selected
      if (this.selectedPriorityFilter && this.selectedPriorityFilter !== 'all') {
        filteredLists = filteredLists.filter(lead => {
          const score = this.calculateLeadScore(lead);
          switch (this.selectedPriorityFilter) {
            case 'hot':
              return score >= 80;
            case 'warm':
              return score >= 60 && score < 80;
            case 'cold':
              return score >= 40 && score < 60;
            case 'unqualified':
              return score < 40;
            default:
              return true;
          }
        });
      }

      return filteredLists;
    },


    computedPROList() {
      return this.pro_list.map((el) => {
        return {
          full_name: `${el.first_name} ${el.last_name}`,
          email: el.email,
          _id: el._id,
        }
      })
    },
    // Lead scoring calculation
    calculateLeadScore() {
      return (lead) => {
        let score = 0;
        let breakdown = [];

        // 1. Employee Count (deal_size)
        const dealSize = lead.lead_details?.deal_size;
        let dealSizePoints = 0;
        switch(dealSize) {
          case '1-10':
          case '1 - 10': dealSizePoints = 10; break;
          case '11-50':
          case '11 - 50': dealSizePoints = 15; break;
          case '51-100':
          case '51 - 100': dealSizePoints = 20; break;
          case '51-200':
          case '51 - 200': dealSizePoints = 25; break; // Handle the 51-200 range as 25 points
          case '100+':
          case '200+': dealSizePoints = 25; break; // Handle both 100+ and 200+
        }
        score += dealSizePoints;
        breakdown.push(`Employee Count: ${dealSizePoints} points`);

        // 2. Region of Interest (eor_requirements)
        const eorReq = lead.lead_details?.eor_requirements;
        let eorPoints = 0;
        switch(eorReq) {
          case 'UAE EOR': eorPoints = 25; break;
          case 'Mission Visa UAE': eorPoints = 15; break;
          case 'GCC EOR':
          case 'Various': eorPoints = 10; break;
        }
        score += eorPoints;
        breakdown.push(`Region of Interest: ${eorPoints} points`);

        // 3. Timeline to Hire
        const timeline = lead.timeline_to_hire;
        let timelinePoints = 0;
        switch(timeline) {
          case '0-1 month': timelinePoints = 20; break;
          case '1-3 months': timelinePoints = 15; break;
          case '3-6 months': timelinePoints = 10; break;
          case '6-12 months': timelinePoints = 5; break;
          case '12+ months': timelinePoints = 0; break;
        }
        score += timelinePoints;
        breakdown.push(`Timeline to Hire: ${timelinePoints} points`);

        // 4. Engagement Level
        const engagement = lead.engagement_level;
        let engagementPoints = 0;
        switch(engagement) {
          case 'Higly Engaged': // Handle the typo in the enum
          case 'Highly Engaged': engagementPoints = 15; break;
          case 'Occasional': engagementPoints = 10; break;
          case 'Low': engagementPoints = 5; break;
        }
        score += engagementPoints;
        breakdown.push(`Engagement Level: ${engagementPoints} points`);

        // 5. Decision Maker Involvement
        const decisionMaker = lead.decision_maker_involvement;
        let decisionPoints = 0;
        switch(decisionMaker) {
          case 'Direct Contact With Decision Maker': decisionPoints = 15; break;
          case 'Indirect or Unsure': decisionPoints = 5; break;
        }
        score += decisionPoints;
        breakdown.push(`Decision Maker Involvement: ${decisionPoints} points`);

        // Store breakdown for debugging
        lead._scoreBreakdown = breakdown;
        return score;
      }
    },
    // Get flag color based on score
    getFlagColor() {
      return (lead) => {
        const score = this.calculateLeadScore(lead);

        if (score >= 80) return 'red'; // Hot Lead
        if (score >= 60) return 'orange'; // Warm Lead
        if (score >= 40) return 'blue'; // Cold Lead
        return 'grey'; // Unqualified/Archive
      }
    },
    // Get priority level text
    getPriorityLevel() {
      return (lead) => {
        const score = this.calculateLeadScore(lead);

        if (score >= 80) return 'Hot Lead';
        if (score >= 60) return 'Warm Lead';
        if (score >= 40) return 'Cold Lead';
        return 'Unqualified/Archive';
      }
    },
    // Get tooltip text with score breakdown
    getTooltipText() {
      return (lead) => {
        const score = this.calculateLeadScore(lead);
        const priority = this.getPriorityLevel(lead);

        let breakdown = `Score: ${score}/100\nPriority: ${priority}\n\nBreakdown:`;

        // Show the actual points breakdown if available
        if (lead._scoreBreakdown) {
          lead._scoreBreakdown.forEach(item => {
            breakdown += `\n• ${item}`;
          });
        } else {
          // Fallback to showing field values
          const dealSize = lead.lead_details?.deal_size || 'Not specified';
          breakdown += `\n• Employee Count (${dealSize})`;

          const eorReq = lead.lead_details?.eor_requirements || 'Not specified';
          breakdown += `\n• Region of Interest (${eorReq})`;

          const timeline = lead.timeline_to_hire || 'Not specified';
          breakdown += `\n• Timeline to Hire (${timeline})`;

          const engagement = lead.engagement_level || 'Not specified';
          breakdown += `\n• Engagement Level (${engagement})`;

          const decisionMaker = lead.decision_maker_involvement || 'Not specified';
          breakdown += `\n• Decision Maker Involvement (${decisionMaker})`;
        }

        return breakdown;
      }
    },
    clicked() {
      return this.clicked ? 'clicked' : ''
    },
    computedLeadsStatusListByOrder() {
      if (this.leadsStatusList.length > 0) {
        // this.leadsStatusList = this.leadsStatusList.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
        this.leadsStatusList.sort();
        return this.leadsStatusList;
      }
    }
  },
}

</script>
