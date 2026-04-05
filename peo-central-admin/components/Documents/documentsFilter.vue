<template>
  <v-row class="px-0 py-0">
    <!-- FILTER DIALOG -->
    <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="500px" content-class="allDocs_dialog">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Filter </h4>
          <v-icon small color="subtext" class="ml-5" @click="filterDialog = false">fa-close</v-icon>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-row class="pb-0">
              <v-col cols="12" class="pa-0">
                <h5 class="text--text">By Employer</h5>
              </v-col>
              <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                <div slot="input">
                  <v-select :items="employers" placeholder="Select Employer" solo dense multiple item-text="company_name"
                    item-value="_id" class="proposalDialog_date_field2" v-model="selectedEmployers"
                    v-if="employers.length >= 1" append-icon="fa-chevron-down">
                  </v-select>

                  <p v-else class="error--text mb-5 mt-5">
                    Please Select Company
                  </p>
                </div>
              </v-col>
              <v-col cols="12" class="pa-0">
                <h5 class="text--text">By Type</h5>
              </v-col>
              <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                <div slot="input">
                  <v-autocomplete :items="documentTypesList" placeholder="Select Type" item-text="type" item-value="id"
                    solo dense multiple v-model="selectedDocumentType" class="proposalDialog_date_field2"
                    v-if="documentTypesList.length >= 1" append-icon="fa-chevron-down">
                  </v-autocomplete>

                  <p v-else class="error--text mb-5 mt-5">
                    Please Select Type
                  </p>
                </div>
              </v-col>
              <v-col cols="12" class="pa-0">
                <h5 class="text--text">By Employee</h5>
              </v-col>
              <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                <div slot="input">
                  <v-autocomplete :items="employees" placeholder="Select Employee"
                    :item-text="item => item.first_name + ' ' + item.last_name" item-value="_id" solo dense multiple
                    v-model="selectedEmployees" class="proposalDialog_date_field2" v-if="employees.length >= 1"
                    append-icon="fa-chevron-down">
                  </v-autocomplete>

                  <p v-else class="error--text mb-5 mt-5">
                    Please Select Company
                  </p>
                </div>
              </v-col>

              <v-col cols="12" class="pa-0">
                <h5 class="text--text pb-0">By Status</h5>
              </v-col>
              <v-col cols="12" class="pl-0 pr-0 mb-4">
                <v-btn v-for="(button, index) in buttons" :key="index" @click="handleClick(index)"
                  :class="{ clicked: button.clicked }" class="customer_table_btn pa-2 mr-1" value="inactive" outlined>
                  <span class="filter_btn pa-0">{{ button.text }}</span>
                </v-btn>
              </v-col>

              <v-col cols="12" class="ma-0 pa-0">
                <div class="d-flex align-center justify-end">
                  <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined><span class=""
                      @click="filterDialog = false; clearFilter()">Clear ALL</span></v-btn>
                  <v-btn class="tall__btn pl-6 pr-6" color="primary"
                    @click="filterDialog = false, page = 0, handleFilterEmployee()">Done</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- / FILTER DIALOG -->
    <v-col cols="12">
      <!-- style="min-height: 90vh !important" -->
      <v-card color="card_bg" id="card">
        <v-row class="">
          <v-col cols="6">
            <div class=" d-flex align-center" style="gap: 12px;">
              <span class="span_data" v-if="currentTab == 'companies'">
                Customer
              </span>
              <div slot="input" v-if="currentTab == 'companies'">
                <v-autocomplete @change="handleFilterEmployee" multiple :items="employers" placeholder="All Customers"
                  solo dense hide-details v-model="selectedEmployers" item-text="company_name" item-value="_id"
                  class="proposalDialog_date_field2" v-if="employers.length >= 1" append-icon="fa-chevron-down">
                </v-autocomplete>

                <p v-else class="error--text mb-5 mt-5">
                  Please Select Company
                </p>
              </div>
              <span class="span_data" v-if="currentTab == 'users'">
                Employee
              </span>
              <div slot="input" v-if="currentTab == 'users'">
                <v-autocomplete @change="handleFilterEmployee" multiple :items="employees" placeholder="All Employees"
                  solo dense hide-details class="proposalDialog_date_field2"
                  :item-text="item => item.first_name + ' ' + item.last_name" v-model="selectedEmployees" item-value="_id"
                  v-if="employees.length >= 1" append-icon="fa-chevron-down">
                </v-autocomplete>

                <p v-else class="error--text mb-5 mt-5">
                  Please Select Company
                </p>
              </div>

            </div>


          </v-col>
          <v-col cols="6">
            <div class="d-flex align-center justify-end">
              <v-btn style="min-width: 45px !important" class="short__btn mr-2 pl-0 pr-0" color="subtext" outlined
                @click="filterDialog = true">
                <filterIcon />
              </v-btn>
            </div>
          </v-col>

        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_leadTimeLine.scss'
import checkBoxSvg from '@/assets/images/icons/check-box.svg'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'

import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'

export default {

  props: ['currentTab'],
  components: {
    checkBoxSvg,
    CustomInputContainer,
    LightArrow,
    filterIcon,
  },
  data() {
    return {
      //FilterDialog
      filterDialog: false,
      //date pickers
      datefrom: new Date().toISOString().substr(0, 10),
      dateto: new Date().toISOString().substr(0, 10),
      dateFrom: null,
      dateTo: null,
      date: '',
      //FILTER DIALOG BUTTONS
      buttons: [
        { text: 'All ', value: '', clicked: false },
        { text: 'Expired', value: 'expired', clicked: false },
        { text: 'Valid', value: 'valid', clicked: false },
        { text: 'Soon Expiring', value: 'soon', clicked: false },
      ],
      selected: 'All Leaves',
      months: 'Select',
      year: 'Select',
      leaves: ['All Leaves', 'Annual Leave', 'Sick Leave', 'Half Leave'],
      month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',],
      all_leaves_menu: [
        // { title: 'Invoice', value: 'new invoice', locked: false },
        { title: 'All Leave', value: 'all', locked: false },
        { title: 'Sick Leave', value: 'sick', locked: false },
        { title: 'Annual Leave', value: 'annual', locked: false },
      ],
      limit: '10',
      page: 0,
      comPage: 0,
      employers: [],
      selectedEmployers: [],
      employees: [],
      selectedEmployees: [],
      selectedStatus: [],
      documentTypesList: [],
      selectedDocumentType: [],
      documentStatusList: [],
    }
  },
  mounted() {
    this.getEmployersList()
    this.getEmployeesList()
    this.getDocumentsTypeList()
    this.getDocumentsStatusList();

  },
  methods: {
    //filterdialog
    handleClick(index) {

      // this.selectedStatus = selectedButton.value
      // this.buttons.forEach(button => {
      //   button.clicked = false;
      // });

      // selectedButton.clicked = !selectedButton.clicked;

      this.buttons[index].clicked = !this.buttons[index].clicked

      this.selectedStatus = this.buttons.filter(button => button.clicked).map(button => button.value)
    },
    getEmployersList() {
      this.comPage++;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post(`/companies/list/dropdown?page=${this.comPage}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          if (['isSuperAdmin'].includes(this.$store.getters.getThisUserRole)) {
            this.employers = response
          }
          else {
            this.employers = response.filter(company => company._id == this.$store.getters.getSelectedCompany)
          }
        })
    },
    getEmployeesList() {
      this.page++;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post(`/users/list/dropdown?page=${this.page}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.employees = response
        })
    },
    getDocumentsTypeList() {
      const AuthStr = 'Beared '.concat(this.$store.state.token)
      this.$axios.$get(`/documenttypes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentTypesList = response
        })
    },
    handleFilterEmployee() {
      this.page++;

      const params = {
        "company_id": typeof this.selectedEmployers == 'string' ? [this.selectedEmployers] : this.selectedEmployers,
        "user_id": typeof this.selectedEmployees == 'string' ? [this.selectedEmployees] : this.selectedEmployees,
        "type": typeof this.selectedDocumentType == 'string' ? [this.selectedDocumentType] : this.selectedDocumentType,
        "status": this.selectedStatus
      }

      this.$emit('fetchedDocuments', params)
    },
    clearFilter() {
      this.selectedEmployees = []
      this.selectedEmployers = []
      this.selectedDocumentType = []
      this.selectedStatus = []

      const params = {}

      this.$emit('fetchedDocuments', params)

      if (this.selectedStatus.length === 0) {
        this.buttons.forEach(button => {
          button.clicked = false;
        });
      }
    },
    getDocumentsStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.$axios.$post(`/documents/list/status`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentStatusList = response

          this.buttons = this.documentStatusList.map((value) => {
            return {
              text: value.charAt(0).toUpperCase() + value.slice(1),
              value: value,
              clicked: false
            }
          })
        })
    }
  },
  computed: {
    years() {
      const year = new Date().getFullYear()
      return Array.from({ length: year - 1900 }, (value, index) => 1901 + index)
    },
    computedDocumentsStatusListByOrder() {
      if (this.documentStatusList.length > 0) {
        this.documentStatusList = this.documentStatusList.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
        this.documentStatusList.sort();
        return this.documentStatusList;
      }
    }
  },
}
</script>
  