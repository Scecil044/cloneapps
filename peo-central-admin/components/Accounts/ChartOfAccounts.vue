<template>
  <v-row class="row1 accounts-container">
    <!-- BULK UPLOAD DIALOGS -->
    <UploadExcelSheetDialogOnly
      :data="import_cof_dialog"
      @save="saveUploadExcelSheetDialogOnlyData($event)"
      @close="closeUploadExcelSheetDialogOnly"
    />

    <!-- EXPORT FILE DIALOG -->
    <ExportFileDialog
      :data="export_cof_dialog"
      @save="saveExportFileDialogData($event)"
      @close="closeExportFileDialog"
    />

    <!-- FILTER DIALOG -->
    <v-dialog
      id="custom_dialog"
      v-model="filter_dialog"
      persistent
      max-width="500px"
    >
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Filter</h4>
          <v-icon
            small
            color="subtext"
            class="ml-5"
            @click="filter_dialog = false"
            >fa-close</v-icon
          >
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <div class="other_filters mt-2">
              <v-row>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-checkbox
                    v-model="code_filter_checkbox"
                    color="subtext"
                    label="Code"
                    dense
                    @click="handleCheckboxChange('code', code_filter_checkbox)"
                  />
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-text-field
                    v-model="code"
                    class="rounded-lg"
                    placeholder="1001"
                    color="subtext"
                    outlined
                    dense
                    :disabled="!code_filter_checkbox"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-checkbox
                    v-model="filter_checkbox"
                    color="subtext"
                    label="Type"
                    dense
                    @click="handleCheckboxChange('type', filter_checkbox)"
                  />
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-select
                    class="rounded-lg"
                    v-model="type"
                    :items="accountsTypes"
                    placeholder="Account Type Detail"
                    color="subtext"
                    item-text="name"
                    item-value="name"
                    flat
                    outlined
                    dense
                    :disabled="!filter_checkbox"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-checkbox
                    v-model="status_filter_checkbox"
                    color="subtext"
                    label="Status"
                    dense
                    @click="
                      handleCheckboxChange('status', status_filter_checkbox)
                    "
                  />
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <v-select
                    class="rounded-lg"
                    v-model="status"
                    :items="all_status"
                    item-text="name"
                    item-value="value"
                    placeholder="All"
                    color="subtext"
                    flat
                    outlined
                    dense
                    :disabled="!status_filter_checkbox"
                  ></v-select>
                </v-col>
              </v-row>
            </div>
            <v-row class="action_btn mt-5">
              <v-col cols="5" class="ma-0 pa-0">
                <v-btn
                  class="tall__btn"
                  color="subtext"
                  block
                  outlined
                  @click="handleClearFilter"
                >
                  <span class="primary--text">Clear All</span></v-btn
                >
              </v-col>
              <v-spacer />
              <v-col cols="6" class="ma-0 pa-0">
                <v-btn
                  class="tall__btn"
                  color="primary"
                  block
                  @click="handleFilterData"
                  >Apply</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- STATUS DIALOG -->
    <statusDialog
      :dialogStatus="status_dialog"
      :status="account.status"
      name="account"
      @handleStatus="handleStatus"
      @handleCloseStatus="handleCloseStatus"
    />
    <SnackBar :data="snackbar_data" />
    <!-- DATA TABLE -->
    <v-col sm="12" md="12" lg="12">
      <v-skeleton-loader
        v-if="skeleton_loading"
        height="100%"
        type="table-heading, table-thead, table-tbody, table-tfoot"
      >
      </v-skeleton-loader>
      <v-card color="card_bg" id="card" v-if="!skeleton_loading">
        <!-- <v-card-text
          id="card-text"
          style="margin-top: 0 !important;border-radius: 0 !important;"
          @scroll="onScroll"
        > -->
        <v-layout column style="max-height: 800px">     
        <v-flex md6 style="overflow: auto">  
          <v-data-table
            v-if="!add_dialog"
            id="coa_table"
            class="main__table elevation-0 customDataTabel"
            :headers="headers"
            :items="data"
            :page="page"
            :pageCount="totalPage"
            :options.sync="options"
            :server-items-length="totalCount"
            hide-default-footer
          >
            <template v-slot:top>
              <div class="top__con">
                <div class="flex_row">
                  <v-btn class="tall__btn" color="primary" @click="handleAdd">
                    <v-icon x-small color="white" class="mr-2">fa-plus</v-icon>
                    Add New
                  </v-btn>
                  <v-text-field
                    class="search_bar ml-2"
                    v-model="search"
                    label="Search By"
                    color="outline"
                    outlined
                    solo
                    flat
                    hide-details
                    dense
                    height="45px"
                    @keyup="debouncedSearchAccounts"
                  >
                    <template slot="prepend-inner">
                      <v-btn icon><v-icon small>fa-search</v-icon></v-btn>
                    </template>
                  </v-text-field>
                </div>
                <div class="action__btn">
                  <v-btn
                    class="tall__btn subtext--text"
                    color="subtext"
                    outlined
                    @click="handlePrint"
                  >
                    <v-icon class="mr-2" small>fa-print</v-icon>
                    Print
                  </v-btn>
                  <v-btn
                    class="tall__btn ml-2 subtext--text"
                    color="subtext"
                    outlined
                    @click="filter_dialog = true"
                  >
                    <v-icon class="mr-2" small>fa-filter</v-icon>
                    Filter
                  </v-btn>
                  <!-- import customer and export -->
                  <v-menu transition="slide-y-transition" rounded="lg" offset-x>
                    <template v-slot:activator="{ attrs, on }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="subtext"
                        outlined
                        max-width="10px"
                        class="tall__btn px-0 ml-2"
                      >
                        <v-icon x-small class="px-0 mx-0" color="subtext"
                          >fa-solid fa-ellipsis-vertical</v-icon
                        ></v-btn
                      >
                    </template>
                    <v-list>
                      <v-list-item link @click="import_cof_dialog = true">
                        <span class="n_text text--text ml-2">
                          <v-icon x-small color="subtitle" class="mr-3"
                            >fa-upload</v-icon
                          >
                          Import Accounts
                        </span>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item link @click="export_cof_dialog = true">
                        <span class="n_text text--text ml-2">
                          <v-icon x-small color="subtitle" class="mr-3"
                            >fa-upload</v-icon
                          >
                          Export Accounts
                        </span>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <!-- <UploadExcelSheetDialog @file="handleUploadExcelSheet($event)" /> -->
                </div>
              </div>
            </template>
            <template v-slot:item.status="{ item }">
              <div class="status__con">
                <span
                  :class="
                    item.status == 1
                      ? 'light_accent4 accent4--text'
                      : 'light_accent2 accent2--text'
                  "
                  class="status"
                >
                  {{ item.status == 1 ? 'Active' : 'InActive' }}
                </span>
              </div>
            </template>
            <template v-slot:item.action="{ item }">
              <td class="pa-0 ma-0" style="width: 30px">
                <div class="actions__con">
                  <!-- <span class="print primary--text">Acc_History</span> -->
                  <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                    <template v-slot:activator="{ attrs, on }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="subtext"
                        class="mx-2"
                        icon
                      >
                        <v-icon small
                          >fa-solid fa-ellipsis-vertical</v-icon
                        ></v-btn
                      >
                    </template>
                    <v-list>
                      <v-list-item link>
                        <v-list-item-title class="">
                          <span
                            class="n_text text--text ml-2"
                            @click="handleActions(item, `edit`)"
                            >Edit</span
                          >
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item link>
                        <v-list-item-title class="">
                          <span
                            class="n_text text--text ml-2"
                            @click="handleActions(item)"
                            >{{
                              item.status == 0 ? 'Active' : 'Inactive'
                            }}</span
                          >
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item link @click="handlePrint">
                        <v-list-item-title class="">
                          <span class="n_text text--text ml-2">Print</span>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item link>
                        <v-list-item-title class="">
                          <span class="n_text text--text ml-2">Run Report</span>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </td>
            </template>
          </v-data-table>
          <!-- ADD /EDIT  DIALOG -->
          <div class="ma-0 pa-0" v-else>
            <div>
              <v-card id="tall_dialog">
                <v-card-title id="card-title">
                  <h4 class="text--text">
                    {{ edit ? 'Edit' : 'Add' }} Chart Of Accounts
                  </h4>
                  <div class="flex_row justify-lg-space-between">
                    <v-btn
                      class="tall__btn mr-2 px-5"
                      color="subtext"
                      outlined
                      @click="add_dialog = false"
                      >Cancel</v-btn
                    >
                    <v-btn
                      class="tall__btn px-9"
                      color="primary"
                      min-width="150px"
                      @click="handleAddData(edit)"
                      :disabled="handleDisabled"
                      >{{ edit ? 'Edit' : 'Add' }}</v-btn
                    >
                  </div>
                </v-card-title>
                <v-divider id="divider" class="mt-5"></v-divider>
                <v-card-text id="card-text">
                  <v-row class="pa-0 ma-0">
                    <v-col cols="4">
                      <CustomInputContainer label="Company" v-if="companyLable">
                        <div slot="input">
                          <v-select
                            v-model="selectedCompany"
                            :items="companies"
                            placeholder="select company"
                            dense
                            outlined
                            @change="emitSelected"
                            style="min-width: 15vw !important"
                          ></v-select>
                        </div>
                      </CustomInputContainer>
                      <CustomInputContainer label="Company" v-else>
                        <div slot="input">
                          <v-text-field
                            v-model="companyName"
                            placeholder="Company"
                            outlined
                            dense
                            readonly
                            disabled
                            style="min-width: 15vw !important"
                          ></v-text-field>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="4">
                      <CustomInputContainer label="Name" :mandatory="true">
                        <div slot="input">
                          <v-text-field
                            v-model="account.name"
                            placeholder="Name"
                            outlined
                            dense
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="4">
                      <CustomInputContainer
                        label="Account type"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-select
                            v-model="account.account_type"
                            :items="accountsTypes"
                            item-text="AccountType"
                            item-value="id"
                            placeholder="Select Account Type"
                            outlined
                            dense
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="4" v-if="account.account_type.length">
                      <CustomInputContainer
                        label="Select Account Detail"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-select
                            v-model="account.details_type"
                            :items="getSubType(account.account_type)"
                            item-text="name"
                            item-value="id"
                            placeholder="Select Account Detail"
                            outlined
                            dense
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="4">
                      <CustomInputContainer
                        label="Account ID"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-text-field
                            v-model="account.uid_number"
                            placeholder="Account ID"
                            outlined
                            dense
                            :rules="main_rule"
                            :error-messages="uidError"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="6">
                      <CustomInputContainer label="Description">
                        <div slot="input">
                          <v-text-field
                            v-model="account.description"
                            placeholder="Enter Desc"
                            outlined
                            dense
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="2">
                      <CustomInputContainer label="Currency" :mandatory="true">
                        <div slot="input">
                          <v-select
                            v-model="account.currency"
                            placeholder="Enter Currency"
                            outlined
                            :rules="main_rule"
                            :items="['AED', 'USD', 'INR', 'EUR']"
                            dense
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="4">
                      <v-checkbox
                        class="mt-7"
                        label="Make this a sub-account"
                        v-model="account.is_sub"
                        dense
                      />
                    </v-col>
                    <v-col cols="8" v-if="account.is_sub">
                      <CustomInputContainer label="Parent Account">
                        <div slot="input">
                          <v-select
                            :items="data"
                            item-text="name"
                            item-value="_id"
                            v-model="account.sub_account"
                            placeholder="Select Parent Type"
                            outlined
                            hide-details=""
                            dense
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="9">
                      <v-checkbox
                        class="mt-7"
                        label="Balance sheet"
                        v-model="account.is_balance_sheet"
                        dense
                      />
                    </v-col>
                    <v-col cols="6" v-if="account.is_balance_sheet">
                      <CustomInputContainer label="Level1" :mandatory="true">
                        <div slot="input">
                          <v-select
                            :items="level1Items"
                            v-model="account.level1"
                            placeholder="Select level"
                            outlined
                            hide-details=""
                            :rules="main_rule"
                            dense
                            @change="selectedLevel1"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="6" v-if="account.level1" :mandatory="true">
                      <CustomInputContainer label="Level2">
                        <div slot="input">
                          <v-select
                            :items="level2Items"
                            item-text="name"
                            item-value="_id"
                            v-model="account.level2"
                            placeholder="Select level"
                            :rules="main_rule"
                            outlined
                            hide-details=""
                            dense
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </div>
    </v-flex>
        </v-layout>
        <!-- </v-card-text> -->
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// import '@/assets/scss/accounts/_chartOfAccounts.scss'
import { mapState } from 'vuex'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import UploadExcelSheetDialog from '@/components/Accounts/UploadExcelSheetDialog.vue'
import UploadExcelSheetDialogOnly from '@/components/Dialogs/UploadExcelSheetDialogOnly.vue'
import ExportFileDialog from '@/components/Dialogs/exportFileDialog.vue'
import statusDialog from '@/components/Dialogs/statusDialog.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import _ from 'lodash'

export default {
  props: {
    data: Array,
    accountsTypes: Array,
    codeList: Array,
    account: Object,
    totalCount: Number,
    totalPage: Number,
    companyLable: Boolean,
    companies: Array,
    companyName: String,
  },
  components: {
    CustomInputContainer,
    UploadExcelSheetDialog,
    UploadExcelSheetDialogOnly,
    ExportFileDialog,
    statusDialog,
    SnackBar,
  },
  data() {
    return {
      skeleton_loading: true,
      // ACTION BUTTONall_status
      import_cof_dialog: false,
      export_cof_dialog: false,

      // UPLOAD EXCEL SHEET DIALOG
      upload_excel_sheet_dialog: false,

      // FILTER DIALOG
      filter_dialog: false,
      code_filter_checkbox: false,
      filter_checkbox: false,
      status_filter_checkbox: false,
      code: '',
      type: '',
      status: '',
      all_status: [
        { value: 1, name: 'Active' },
        { value: 0, name: 'Inactive' },
      ],
      level1Items: [
        'Assets',
        "Liabilities & Shareholder's Equity",
        'Income',
        'Cost of Sales',
        'Expenses',
      ],
      level2Items: [],
      // Status DIALOG
      status_dialog: false,

      // EDIT DIALOG
      edit_dialog: false,

      // ADD DIALOG
      add_dialog: false,
      sub_account: [],

      selected: [],
      single_select: '',
      search: '',
      headers: [
        { text: 'Account Code', value: 'account_id', align: 'start' },
        { text: 'Account Name', value: 'name' },
        { text: 'Account Type', value: 'account_type.name' },
        { text: 'Details Type', value: 'details_type.name' },
        { text: 'Status', value: 'status' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      main_rule: [(v) => !!v || 'This filed is required'],

      number_rule: [(v) => !!v || 'Only numeric values'],
      email_rule: [],
      phone_rule: [],
      options: { page: 0, itemsPerPage: 15 },
      page: 0,
      edit: false,
      uidError: '',
      uidNumber: '',
      loading: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      selectedCompany: null,
    }
  },

  // this one will populate new data set when user changes current page.
  // watch: {
  //   options: {
  //     handler() {
  //       this.emitHandler('getData')
  //     },
  //   },
  //   deep: true,
  // },
  watch: {
    companySelection: {
      handler() {
        this.emitHandler('getData')
      },
    },
    deep: true,
  },
  mounted() {
    this.emitHandler('getData')
    this.handleSkeletonLoading()
  },
  methods: {
    selectedLevel1(value) {
      if (value === 'Assets') {
        this.level2Items = [
          'Current Assets',
          'Other Current Assets',
          'Fixed Assets',
        ]
      } else if (value === "Liabilities & Shareholder's Equity") {
        this.level2Items = [
          'Current Liabilities',
          'Non-Current Liabilities',
          'Long Term Liabilities',
          "Shareholders' Equity",
        ]
      } else {
        this.level2Items = []
      }
    },
    handleSkeletonLoading() {
      setTimeout(() => {
        this.skeleton_loading = false
      }, 1000)
    },
    onScroll() {
      const container = document.getElementById('card-text')
      const contentHeight = container.scrollHeight
      const currentScrollPos = container.scrollTop + container.offsetHeight
      if (currentScrollPos >= contentHeight && !this.loading) {
        this.loading = true
        this.emitHandler('getData')
        this.loading = false
      }
    },
    saveExportFileDialogData(value) {
      this.import_cof_dialog = false
      this.snackbar_data = {
        snackbar: true,
        text: 'Your File Has Exported Successfully',
        color: 'success',
        icon: 'check',
        timeout: 2000,
      }
    },
    closeExportFileDialog() {
      this.export_cof_dialog = false
    },
    handlePrint() {
      const printContents = document.getElementById('coa_table').innerHTML
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents
    },
    async saveUploadExcelSheetDialogOnlyData(file) {
      const formData = new FormData()
      formData.append('file', file)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/account/bulk-upload`, formData, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          if (res.error != null) {
            var message =
              'Your File Has Been Uploaded, But Duplicate Entries Found' +
              ' (' +
              res.error.accounts.join(',') +
              ')'
            this.snackbar_data = {
              snackbar: true,
              text: message,
              color: 'success',
              icon: 'check',
              timeout: 2000,
            }
          } else {
            this.snackbar_data = {
              snackbar: true,
              text: 'Your File Has Been Uploaded Successfully',
              color: 'success',
              icon: 'check',
              timeout: 2000,
            }
          }
          this.emitHandler('getData')
          this.import_cof_dialog = false
        })
        .catch((err) => {
          console.log(err)
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
    closeUploadExcelSheetDialogOnly(value) {
      this.import_cof_dialog = false
    },

    // ----
    async emitHandler(type, field) {
      const { page, itemsPerPage } = this.options
      // let pageNumber = page - 1
      var data = {
        type: this.type,
        status: this.status,
        code: this.code,
        page: page,
        search: this.search,
        limit: itemsPerPage,
      }
      this.page = this.page + 1
      field && (data[field.name] = field.value)
      this.$emit(type, data)
    },

    handleUploadExcelSheet(file) {
      this.emitHandler('bulkUpload', { name: 'file', value: file })
    },
    handleFilterData() {
      this.emitHandler('getData')
      this.filter_dialog = false
    },
    async handleClearFilter() {
      this.type = ''
      this.code = ''
      this.status = ''
      this.filter_dialog = false
      await this.emitHandler('getData')
    },
    searchAccounts() {
      this.options.page = 0
      this.$emit('clearData')
      this.emitHandler('getData')
      this.filter_dialog = false
    },
    debouncedSearchAccounts() {
      this.searchAccounts()
    },
    handleAdd() {
      this.add_dialog = true
      this.account = {
        name: '',
        account_type: '',
        details_type: '',
        uid_number: '',
        description: '',
        is_sub: '',
        _id: '',
      }
      this.edit = false
    },
    async handleAddData(edit) {
      this.uidError = ''
      var type = edit ? 'edit' : 'add'
      if (this.uidNumber != this.account.uid_number) {
        var payload = { uid_number: this.account.uid_number }
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios
          .$post('account/verify-uid', payload, {
            headers: { Authorization: AuthStr },
          })
          .then(async (res) => {
            if (!res) {
              this.emitHandler(type, { name: 'account', value: this.account })
              this.add_dialog = false
            } else {
              this.uidError = 'Code is already used'
            }
          })
          .catch((err) => {
            console.log(err)
          })
      } else {
        this.emitHandler(type, { name: 'account', value: this.account })
        this.add_dialog = false
      }
    },

    handleStatus() {
      this.status_dialog = false
      const { _id, status } = this.account
      var data = { _id: _id, status: !status }
      this.emitHandler('edit', { name: 'account', value: data })
    },
    handleCloseStatus() {
      this.status_dialog = false
    },
    handleActions(value, action) {
      if (action == 'edit') {
        this.add_dialog = true
        this.edit = true
        this.account = value
        this.uidNumber = value.uid_number
      } else {
        this.status_dialog = true
        this.account = value
      }
    },
    handleCheckboxChange(label, value) {
      if (!value) {
        this[label] = ''
      }
    },
    getSubType(type) {
      console.log(this.accountsTypes.find((item) => item.id == type))
      return this.accountsTypes.find((item) => item.id == type).DetailType
    },
    emitSelected() {
      this.$emit('emitSelected', this.selectedCompany)
    },
  },
  computed: {
    ...mapState(['companySelection']),
    handleDisabled() {
      var subAccount = this.account.is_sub ? this.account.sub_account : true
      var accBalanceSheet1 = this.account.is_balance_sheet
        ? this.account.level1
        : true
      var accBalanceSheet2 = this.account.is_balance_sheet
        ? this.account.level2
        : true
      return (
        !this.account.name ||
        !this.account.currency ||
        !this.account.uid_number ||
        !this.account.details_type ||
        !this.account.account_type ||
        !this.account.details_type ||
        !this.account.uid_number ||
        !subAccount ||
        !accBalanceSheet1 ||
        !accBalanceSheet2
      )
    },
  },
}
</script>

<style>
.accounts-container #card-text {
  max-height: 85vh;
  overflow-y: auto;
}
</style>
