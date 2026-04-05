<template>
  <div>
    <SnackBar :data="snackbar_data" />
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
                          <v-text-field v-model="estimate_date" placeholder="mm/dd/yy" class="proposalDialog_date_field2"
                            solo dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
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
                          <v-text-field v-model="exp_date" placeholder="mm/dd/yy" class="proposalDialog_date_field2" solo
                            dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
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
                  <h5 class="text--text pb-0">Assigned to person</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                  <div slot="input">
                    <v-select :items="employees" placeholder="Select Employee" solo dense multiple v-model="selectedEmployees" item-text="first_name" item-value="_id"
                      class="proposalDialog_date_field2" v-if="employees.length >= 1" append-icon="fa-chevron-down">
                    </v-select>
                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Employee
                    </p>
                  </div>
                </v-col>

                <v-col cols="12" class="pa-0">
                  <h5 class="text--text">Employers</h5>
                </v-col>
                <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                  <div slot="input">
                    <v-select :items="employers" placeholder="Select Employers" solo dense multiple v-model="selectedEmployers" item-text="company_name" item-value="_id" class="proposalDialog_date_field2" v-if="employers.length >= 1" append-icon="fa-chevron-down"></v-select>
                    <p v-else class="error--text mb-5 mt-5">Please Select Employers </p>
                  </div>
                </v-col>

                <v-col cols="12" class="ma-0 pa-0">
                  <div class="d-flex align-center justify-end">
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined @click="filterDialog = false; clearFilter()"><span class="">Clear All</span></v-btn>
                    <v-btn class="tall__btn pl-6 pr-6" color="primary" @click="filterDialog = false, handleFilterLeads()">Done</v-btn>
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
        <v-card color="card_bg" id="card" style="min-height: 90vh !important" v-if="visibleData.length > 0">
          <v-card-title id="card-title" class="mb-4">
            <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
              <div style="width: 50% !important">
                <div class="d-flex">
                  <span class="span_btnB" v-if="leadsMenu">All Unsuccessful Leads</span>
                  <h4 class="text--text" v-else>{{ sectionTitle }}</h4>
                </div>
              </div>

              <div class="d-flex align-center justify-end" style="width: 50%">
                <v-btn style="min-width: 45px !important" class="short__btn mr-2 pl-0 pr-0" color="subtext" outlined @click="filterDialog = true">
                  <filterIcon />
                </v-btn>
                <v-btn @click="handleNewLead()" v-if="showNewLeadButton" class="short__btn" color="primary">New</v-btn>
              </div>
            </div>
          </v-card-title>

          <div class="flex_row align-center top_barCustomer">
            <div class="search__bar">
              <v-text-field v-model="searchQuery" class="ml-1" @input="handleFilterSearch()" label="Search" solo flat hide-details background-color="#f9fafc"></v-text-field>
            </div>
          </div>

          <v-card-text id="card-text2" style="max-height: 68vh" class="dl__list overflow-y-auto">
            <v-list class="customers_list__con" v-if="visibleData.length > 0">
              <v-list-item-group>
                <ProcessListItem
                    v-for="(item, index) in visibleData"
                    :class="index !== (visibleData.length - 1) ? 'border-b-sm' : '' "
                    :key="index"
                    @clicked="LeadsClicked(item._id)"
                    :avatarSrc="item.company_logo">

                  <template v-slot:title>
                    <v-row justify="space-between">
                      {{ item.company_name}}&nbsp;
                    </v-row>
                  </template>

                  <template v-slot:tags>
                    <Chip
                      :chipClass="'red'"
                      :tooltipColor="'red'"
                      v-if="item.status"
                      :tooltipText="item.employment_type"
                    >
                      {{ item.status | shorten_tag }}
                    </Chip>
                  </template>
                  <template v-slot:action>
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
                      </v-list>
                    </v-menu>
                  </template>
                </ProcessListItem>
              </v-list-item-group>
            </v-list>
          </v-card-text>
        </v-card>
        <v-card color="card_bg" id="card" style="min-height:90vh !important" v-else>
          <v-card-title id="card-title" class="mb-4">
            <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
              <div style="width: 50% !important">
                <span class="span_btnB">No List Available</span>
              </div>
              <div class="d-flex align-center justify-end" style="width: 50%;">
                <v-btn class="short__btn subtext--text mr-2" color="subtext" outlined @click="filterDialog = true">
                  <filterIcon />
                </v-btn>
              </div>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- New Lead Dialog -->
    <v-dialog
      v-model="showNewLeadDialog"
      max-width="900px"
      persistent
      content-class="proposal_dialog"
    >
      <v-card class="rounded-xl pa-0 pt-0 scroll" flat>
        <v-form ref="newLeadForm" lazy-validation>
          <v-row class="tw-px-3 tw-py-2">
            <div class="tw-flex tw-items-center">
              <v-img
                src="/shift/build.svg"
                max-width="fit-content"
                height="fit-content"
                class="tw-mr-2"
                contain
              ></v-img>
              <span
                class="darkBlue-heading-text font-weight-normal subHeadingFontSize"
              >
                Create New Lead</span
              >
            </div>
            <v-spacer />
            <v-btn @click="showNewLeadDialog = false" outlined icon color="red accent-4">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <!-- Tabs -->
          <v-tabs v-model="newLeadTab" background-color="transparent" color="primary" class="tw-border-b tw-border-gray-200">
            <v-tab class="tw-font-medium">Single Lead</v-tab>
            <v-tab class="tw-font-medium">Bulk Upload</v-tab>
          </v-tabs>

          <!-- Tab Content -->
          <v-tabs-items v-model="newLeadTab">
            <!-- Single Lead Tab -->
            <v-tab-item>
              <div class="tw-p-6">
                <AddLeadsForm
                  :is-page="false"
                  :hide-header="true"
                  :handleModel="() => showNewLeadDialog = false"
                  @close="handleSingleLeadClose"
                />
              </div>
            </v-tab-item>

            <!-- Bulk Upload Tab -->
            <v-tab-item>
              <div class="tw-p-6">
                <div class="tw-text-center tw-mb-6">
                  <v-icon size="64" color="primary" class="tw-mb-4">mdi-upload-multiple</v-icon>
                  <h3 class="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Bulk Upload Leads</h3>
                  <p class="tw-text-gray-600">Upload multiple leads at once using an Excel file</p>
                </div>

                <!-- Download Template Section -->
                <div class="tw-bg-blue-50 tw-rounded-lg tw-p-4 tw-mb-6">
                  <div class="tw-flex tw-items-center tw-justify-between">
                    <div>
                      <h4 class="tw-font-semibold tw-text-blue-900 tw-mb-1">Download Template</h4>
                      <p class="tw-text-blue-700 tw-text-sm">Get the Excel template with the correct format for bulk upload</p>
                    </div>
                    <v-btn
                      color="primary"
                      outlined
                      @click="downloadTemplate"
                      class="tw-rounded-lg"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Download Template
                    </v-btn>
                  </div>
                </div>

                <!-- Upload Section -->
                <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6 tw-border-2 tw-border-dashed tw-border-gray-300">
                  <div class="tw-text-center">
                    <v-icon size="48" color="gray" class="tw-mb-4">mdi-file-excel</v-icon>
                    <h4 class="tw-font-semibold tw-text-gray-900 tw-mb-2">Upload Excel File</h4>
                    <p class="tw-text-gray-600 tw-mb-4">Drag and drop your Excel file here or click to browse</p>

                    <v-file-input
                      v-model="bulkUploadFile"
                      accept=".xlsx,.xls"
                      label="Choose Excel file"
                      prepend-icon="mdi-file-excel"
                      outlined
                      class="tw-max-w-md tw-mx-auto"
                      :rules="[v => !!v || 'Please select an Excel file']"
                      @change="handleFileChange"
                    ></v-file-input>

                    <div v-if="bulkUploadFile" class="tw-mt-4">
                      <v-btn
                        color="primary"
                        :loading="uploadingBulk"
                        :disabled="uploadingBulk"
                        @click="uploadBulkLeads"
                        class="tw-rounded-lg"
                      >
                        <v-icon left>mdi-upload</v-icon>
                        Upload Leads
                      </v-btn>
                    </div>
                  </div>
                </div>

                <!-- Instructions -->
                <div class="tw-mt-6 tw-bg-yellow-50 tw-rounded-lg tw-p-4">
                  <h4 class="tw-font-semibold tw-text-yellow-900 tw-mb-2 tw-flex tw-items-center">
                    <v-icon small class="tw-mr-2">mdi-information</v-icon>
                    Instructions
                  </h4>
                  <ul class="tw-text-yellow-800 tw-text-sm tw-space-y-1">
                    <li>• Download the template first to ensure correct format</li>
                    <li>• Fill in all required fields marked with asterisk (*)</li>
                    <li>• Save the file as .xlsx or .xls format</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Maximum 1000 leads per upload</li>
                  </ul>
                </div>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </v-form>
      </v-card>
    </v-dialog>
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
import SnackBar from '@/components/utils/SnackBar.vue'
import ProcessListItem from '@/components/reuseable/ProcessListItem.vue'
import Chip from '@/components/reuseable/Chip.vue'
import AddLeadsForm from '@/components/EditModel/editLeads.vue'


export default {
  components: {
    customerDefaultIcon,
    DarkArrow,
    Tabs,
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
    SnackBar,
    ProcessListItem,
    Chip,
    AddLeadsForm
  },
  props: {
    selectedCustomer: Object,
    showNewLeadButton: Boolean,
    status: String,
    leadsMenu: Boolean,
    sectionTitle: String
  },
  data() {
    return {
      new_Lead_menu: [
        { title: 'All Leads' },
        { title: 'New Leads' },
        { title: 'Contacted' },
        { title: 'Not Contacted' },
      ],
      searchQuery: '',
      date_menu: false,
      estimate_date: '',
      exp_date_menu: false,
      exp_date: '',
      leadsList: [],
      buttons: [
        { text: 'all', clicked: false },
        { text: 'new', clicked: false },
        { text: 'Not Contacted', clicked: false },
        { text: 'Contacted', clicked: false },
      ],
      datefrom: new Date().toISOString().substr(0, 10),
      dateto: new Date().toISOString().substr(0, 10),
      dateFrom: null,
      dateTo: null,
      date: '',
      filterDialog: false,
      tab_current_val: 'all',
      customer_tabs: {
        Customer: [
          { title: 'Details', value: 'all' },
          { title: 'Employees', value: 'employees' },
          { title: 'Documents', value: 'documents' },
          { title: 'Invoices', value: 'invoices' },
          { title: 'Insight', value: 'insight' },
          { title: 'Payroll Schedule', value: 'payroll' },
        ],
      },
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      limit: '10',
      page: 0,
      comPage:0,
      selectedStatus: '',
      employers: [],
      selectedEmployers: [],
      employees: [],
      selectedEmployees:[],
      snackbar_data: {
        snackbar: false,
        text: '',
        color: '',
        icon: '',
        timeout: 2000,
      },
      showNewLeadDialog: false,
      newLeadTab: null,
      bulkUploadFile: null,
      uploadingBulk: false,
    }
  },
  methods: {
    handleNewLead() {
      this.showNewLeadDialog = true
    },
    async getUnsuccessfulLeadsList() {
      this.page++;

      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/leads/list/unsuccessful`, { module: "leads" }, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.leadsList = response
        if(this.leadsList.length > 0) {
          this.LeadsClicked(this.leadsList[0]._id)
        }
      })
    },
    async handleFilterSearch(){
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/leads/unsuccessful/search/filter?page=${this.page}&limit=${this.limit}`, { search: this.searchQuery }, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.leadsList = response.results
      })
    },
    handleClick(index) {
      this.buttons[index].clicked = !this.buttons[index].clicked
      this.selectedStatus = this.buttons[index].text
    },
    handleTabValue(payload) {
      // Setting the payload value
      this.tab_current_val = payload
      // console.log('Emitted Value from HeaderTabs Component  ==> ', payload)
      // Setting the payload value
      this.tab_current_val = payload
      // Setting the payload value in the localStorage under name selected_tab
      localStorage.setItem('selected_tab', payload)
      // Emitting an event call tabChanged with the tab current value
      this.$nuxt.$emit('tabChanged', payload)
    },
    handleOpenCustomerForm() {
      this.$emit('handleToggleCustomerForm', 'add')
    },
    async getEmployersList() {
      this.comPage++;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/companies/list/dropdown?page=${this.comPage}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
      .then((response) => {
        const lists = response;
        this.employers = [...this.employers, ...lists];
        // this.employers = response
      })
    },
    async getEmployeesList(){
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/users/list/dropdown?page=${this.page}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
      .then((response) => {
        const lists = response;
        this.employees = [...this.employees, ...lists];
        // this.employees = response
      })
    },
    handleFilterLeads(){
      this.page = 1

      const params = {
      //   "module": "leads",
        "start_date": typeof this.estimate_date == 'string' ? [this.estimate_date]:this.estimate_date,
        "end_date": typeof this.exp_date == 'string' ? [this.exp_date]:this.exp_date,
        // "status": this.selectedStatus,
        "company_id": typeof this.selectedEmployers == 'string' ? [this.selectedEmployers]:this.selectedEmployers,
        "user_id": typeof this.selectedEmployees == 'string' ? [this.selectedEmployees] : this.selectedEmployees
      }

      this.$emit("fetchedUnsuccessfulLeads", params)
    },
    clearFilter(){
      this.estimate_date = ''
      this.exp_date == ''
      this.selectedStatus = ''
      this.selectedEmployees = []
      this.selectedEmployers = []

      const params = {
      //   "module": "leads"
      }
      this.$emit('fetchedUnsuccessfulLeads', params)
    },
    LeadsClicked(val){
      this.$emit('UnsuccessfulLeadsListClicked', val)
    },
    handleSingleLeadClose() {
      this.showNewLeadDialog = false
      this.getUnsuccessfulLeadsList() // Refresh the leads list
    },
    downloadTemplate() {
      // Download template from API with cache-busting
      const timestamp = new Date().getTime()
      const url = `http://localhost:4100/leads/bulk/template?t=${timestamp}`

      // Use fetch to get the file and then create a download
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.blob()
        })
        .then(blob => {
          // Create a blob URL and download
          const blobUrl = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = 'leads_bulk_upload_template.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(blobUrl)

          this.snackbar_data = {
            snackbar: true,
            text: 'Template downloaded successfully!',
            color: 'success',
            icon: 'info',
            timeout: 2000,
          }
        })
        .catch(error => {
          console.error('Download error:', error)
          this.snackbar_data = {
            snackbar: true,
            text: 'Error downloading template. Please try again.',
            color: 'error',
            icon: 'error',
            timeout: 2000,
          }
        })
    },
    handleFileChange(file) {
      if (file) {
        // Validate file type
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ]

        if (!allowedTypes.includes(file.type)) {
          this.snackbar_data = {
            snackbar: true,
            text: 'Please select a valid Excel or CSV file',
            color: 'error',
            icon: 'error',
            timeout: 2000,
          }
          this.bulkUploadFile = null
          return
        }

        // Validate file size (25MB limit)
        const maxSize = 25 * 1024 * 1024 // 25MB
        if (file.size > maxSize) {
          this.snackbar_data = {
            snackbar: true,
            text: 'File size must be less than 25MB',
            color: 'error',
            icon: 'error',
            timeout: 2000,
          }
          this.bulkUploadFile = null
          return
        }
      }
    },
    async uploadBulkLeads() {
      if (!this.bulkUploadFile) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Please select a file to upload',
          color: 'error',
          icon: 'error',
          timeout: 2000,
        }
        return
      }

      try {
        this.uploadingBulk = true

        const formData = new FormData()
        formData.append('file', this.bulkUploadFile)

        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Use the correct API endpoint for bulk upload
        await this.$axios.$post('http://localhost:4100/leads/bulk/upload', formData, {
          headers: {
            Authorization: AuthStr,
            'Content-Type': 'multipart/form-data'
          }
        })

        this.snackbar_data = {
          snackbar: true,
          text: 'Bulk upload completed successfully!',
          color: 'success',
          icon: 'info',
          timeout: 2000,
        }

        // Reset form and close dialog
        this.bulkUploadFile = null
        this.showNewLeadDialog = false
        this.getUnsuccessfulLeadsList() // Refresh the leads list

      } catch (error) {
        console.error('Bulk upload error:', error)
        this.snackbar_data = {
          snackbar: true,
          text: error.response?.data?.message || 'Error uploading file. Please try again.',
          color: 'error',
          icon: 'error',
          timeout: 2000,
        }
      } finally {
        this.uploadingBulk = false
      }
    },
  },
  mounted() {
    this.getUnsuccessfulLeadsList()
    this.getEmployersList()
    this.getEmployeesList()
  },
  created(){
    this.$nuxt.$on('receivedUnsuccessfulLeads', ($event) => {
      this.leadsList = $event
    })
    this.$nuxt.$on('reloadUnsuccessfulLeadsList', ($event) => {
      this.page = 0
      this.leadsList = []
      this.getUnsuccessfulLeadsList()

      this.snackbar_data = {
        snackbar: true,
        text: 'Successfully Updated Lead Status.',
        color: 'success',
        icon: 'info',
        timeout: 2000,
      }
    })
  },
  computed: {
    //find element
    myObject() {
      return this.filteredCustomersList.find(
        (obj) => obj.id === this.selectedCustomer
      )
    },
    clicked() {
      return this.clicked ? 'clicked' : ''
    },
    filteredCustomersList() {
      return this.leadsList.filter((post) => {
        return post.legal_name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase())
      })
    },
    visibleData() {
      let lists = [];

      lists = _.orderBy(this.leadsList, ['createdAt'], ['desc']);
      return lists;
    }
  },
}
</script>
