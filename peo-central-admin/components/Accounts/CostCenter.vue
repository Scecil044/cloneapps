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

    <!-- DELETE DIALOG -->
    <!-- <v-dialog v-model="delete_dialog" class="ma-0 pa-0" max-width="500">
      <v-card id="card">
        <v-card-title id="card-title"
          >Are you sure you want to delete this field?</v-card-title
        >
        <v-card-text id="card-text">
          <div class="flex_row">
            <v-spacer />
            <v-btn
              class="tall__btn"
              color="subtext"
              outlined
              @click="delete_dialog = false"
              >Cancel</v-btn
            >
            <v-btn
              class="tall__btn ml-3"
              color="error"
              @click="handleDeleteData"
            >
              <v-icon color="white" class="mr-2" small>fa-trash</v-icon>
              Delete
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog> -->
    <statusDialog
      :dialogStatus="status_dialog"
      :status="account.status"
      name="cost center"
      @handleStatus="handleStatus"
      @handleCloseStatus="handleCloseStatus"
    />
    <SnackBar :data="snackbar_data" />
    <!-- DATA TABLE -->
    <v-col sm="12" md="12" lg="12">
      <v-card color="card_bg" id="card">
        <v-card-text
          id="card-text"
          style="margin-top: 0 !important"
          @scroll="onScroll"
        >
          <v-data-table
            v-if="!add_dialog"
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
                    @keyup="searchAccounts"
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
                          Import Customers
                        </span>
                      </v-list-item>
                      <v-divider></v-divider>
                      <v-list-item link @click="export_cof_dialog = true">
                        <span class="n_text text--text ml-2">
                          <v-icon x-small color="subtitle" class="mr-3"
                            >fa-upload</v-icon
                          >
                          Export Customers
                        </span>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <!-- <UploadExcelSheetDialog @file="handleUploadExcelSheet($event)"/> -->
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
                  {{ item.status === 1 ? 'Active' : 'InActive' }}
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
                              item.status === 1 ? 'Inactive' : 'Active'
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
                    {{ edit ? 'Edit' : 'Add' }} Cost Center
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
                      <CustomInputContainer label="Name">
                        <div slot="input">
                          <v-text-field
                            v-model="cost_center.name"
                            placeholder="Name"
                            outlined
                            dense
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="4">
                      <CustomInputContainer label="Code">
                        <div slot="input">
                          <v-text-field
                            v-model="cost_center.code"
                            placeholder="Code"
                            outlined
                            dense
                            :rules="number_rule"
                            :error-messages="uidError"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="4">
                      <CustomInputContainer label="Description">
                        <div slot="input">
                          <v-text-field
                            v-model="cost_center.description"
                            placeholder="Description"
                            outlined
                            dense
                            :rules="number_rule"
                            :error-messages="uidError"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// import '@/assets/scss/accounts/_chartOfAccounts.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import UploadExcelSheetDialog from '@/components/Accounts/UploadExcelSheetDialog.vue'
import UploadExcelSheetDialogOnly from '@/components/Dialogs/UploadExcelSheetDialogOnly.vue'
import ExportFileDialog from '@/components/Dialogs/exportFileDialog.vue'
import statusDialog from '@/components/Dialogs/statusDialog.vue'
import SnackBar from '~/components/utils/SnackBar.vue'

export default {
  props: {
    data: Array,
    cost_center: Object,
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
      account: {},
      // ACTION BUTTON
      import_cof_dialog: false,
      export_cof_dialog: false,

      // UPLOAD EXCEL SHEET DIALOG
      upload_excel_sheet_dialog: false,

      // DELETE DIALOG
      delete_dialog: false,
      status_dialog: false,

      // EDIT DIALOG
      edit_dialog: false,

      // ADD DIALOG
      add_dialog: false,

      search: '',
      headers: [
        { text: 'Code', value: 'code' },
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Status', value: 'status' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      main_rule: [(v) => !!v || 'This filed is required'],
      number_rule: [(v) => !!v || 'Only numeric values'],
      email_rule: [],
      phone_rule: [],
      options: { itemsPerPage: 15 },
      page: 0,
      edit: false,
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
  mounted() {
    this.emitHandler('getData')
  },
  methods: {
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
    async emitHandler(type, field) {
      const { page, itemsPerPage } = this.options
      // let pageNumber = page - 1
      var data = { page: page, search: this.search, limit: itemsPerPage }
      this.page = this.page + 1
      field && (data[field.name] = field.value)

      this.$emit(type, data)
    },

    handleUploadExcelSheet(file) {
      this.emitHandler('bulkUpload', { name: 'file', value: file })
    },
    searchAccounts() {
      this.options.page = 1
      this.emitHandler('getData')
      this.filter_dialog = false
    },
    handleAdd() {
      this.add_dialog = true
      this.cost_center = { name: '', code: '', description: '', _id: '' }
      this.edit = false
    },
    async handleAddData(edit) {
      var type = edit ? 'edit' : 'add'
      this.emitHandler(type, { name: 'costCenter', value: this.cost_center })
      this.add_dialog = false
    },

    handleDeleteData() {
      this.delete_dialog = false
      this.emitHandler('delete', {
        name: 'costCenter',
        value: this.cost_center,
      })
    },
    handleActions(value, action) {
      if (action == 'edit') {
        this.add_dialog = true
        this.edit = true
        this.cost_center = value
      } else {
        this.status_dialog = true
        this.account = value
        this.status_dialog = true
        this.cost_center = value
      }
    },
    handleCloseStatus() {
      this.status_dialog = false
    },
    handlePrint() {
      window.print()
    },
    saveExportFileDialogData(value) {
      console.log('Here is the exported files =>', value)
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
    async saveUploadExcelSheetDialogOnlyData(file) {
      const formData = new FormData()
      formData.append('file', file)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/cost-center/bulk-upload`, formData, {
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
        })
      // console.log('Here is the file that user upload =>', value)
      this.import_cof_dialog = false
      this.snackbar_data = {
        snackbar: true,
        text: 'Your Excel Sheet Has Uploaded Successfully',
        color: 'success',
        icon: 'check',
        timeout: 2000,
      }
    },
    closeUploadExcelSheetDialogOnly(value) {
      this.import_cof_dialog = false
    },
    handleStatus() {
      this.status_dialog = false
      const { _id, status } = this.account
      var data = { _id: _id, status: !status }
      this.emitHandler('edit', { name: 'costCenter', value: data })
    },
    emitSelected() {
      this.$emit('emitSelected', this.selectedCompany)
    },
  },
  computed: {
    handleDisabled() {
      return (
        !this.cost_center.name ||
        !this.cost_center.code ||
        !this.cost_center.description
      )
    },
  },
}
</script>
