<template>
  <v-row class="row1">
    <!-- ADD /EDIT  DIALOG -->
    <v-dialog v-model="add_dialog" class="ma-0 pa-0">
      <div class="my_dialog">
        <v-card id="tall_dialog">
          <v-card-title id="card-title">
            <h4 class="text--text">{{ edit ? 'Edit' : 'Add' }} Tax Rate</h4>
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
                <CustomInputContainer label="Name">
                  <div slot="input">
                    <v-text-field
                      v-model="taxCode.name"
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
                      v-model="taxCode.code"
                      placeholder="Code"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Rate">
                  <div slot="input">
                    <v-text-field
                      v-model="taxCode.rate"
                      placeholder="Rate"
                      type="number"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </v-dialog>

    <!-- DELETE DIALOG -->
    <v-dialog v-model="delete_dialog" class="ma-0 pa-0" max-width="500">
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
    </v-dialog>

    <!-- DATA TABLE -->
    <v-col sm="12" md="12" lg="12">
      <v-card color="card_bg" id="card">
        <v-card-text id="card-text" style="margin-top: 0 !important">
          <v-data-table
            class="main__table elevation-0 customDataTabel"
            :headers="headers"
            :items="data"
            :page="page"
            :pageCount="totalPage"
            :options.sync="options"
            :server-items-length="totalCount"
            :loading="loading"
            :footer-props="{ 'items-per-page-options': [10, 20] }"
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
                  <UploadExcelSheetDialog
                    @file="handleUploadExcelSheet($event)"
                  />
                </div>
              </div>
            </template>
            <template v-slot:item.action="{ item }">
              <td class="pa-0 ma-0" style="width: 30px">
                <div class="actions__con">
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
                            >Delete</span
                          >
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// import '@/assets/scss/accounts/_taxRate.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import UploadExcelSheetDialog from '@/components/Accounts/UploadExcelSheetDialog.vue'

export default {
  props: {
    data: Array,
    taxCode: Object,
    totalCount: Number,
    totalPage: Number,
  },
  components: { CustomInputContainer, UploadExcelSheetDialog },
  data() {
    return {
      // UPLOAD EXCEL SHEET DIALOG
      upload_excel_sheet_dialog: false,

      // DELETE DIALOG
      delete_dialog: false,

      // ADD / EDIT DIALOG
      add_dialog: false,
      edit: false,

      // DATA TABLE
      search: '',
      headers: [
        { text: 'Code', value: 'code', align: 'start' },
        { text: 'Name', value: 'name' },
        { text: 'Rating', value: 'rate' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      options: { itemsPerPage: 10 },
      page: 1,

      // OTHERS
      main_rule: [(v) => !!v || 'This filed is required'],
      number_rule: [(v) => !!v || 'Only numeric values'],
      email_rule: [],
      phone_rule: [],
    }
  },

  // this one will populate new data set when user changes current page.
  watch: {
    options: {
      handler() {
        this.emitHandler('getData')
      },
    },
    deep: true,
  },

  methods: {
    async emitHandler(type, field) {
      const { page, itemsPerPage } = this.options
      let pageNumber = page - 1
      var data = {
        type: this.type,
        page: pageNumber,
        search: this.search,
        limit: itemsPerPage,
      }
      field && (data[field.name] = field.value)
      this.$emit(type, data)
    },

    handleUploadExcelSheet(file) {
      this.emitHandler('bulkUpload', { name: 'file', value: file })
    },

    searchAccounts() {
      this.emitHandler('getData')
      this.filter_dialog = false
    },

    handleAdd() {
      this.add_dialog = true
      this.taxCode = { name: '', code: '', rate: '', _id: '' }
      this.edit = false
    },

    handleAddData(edit) {
      var type = edit ? 'edit' : 'add'
      this.emitHandler(type, { name: 'taxCode', value: this.taxCode })
      this.add_dialog = false
    },

    handleDeleteData() {
      this.emitHandler('delete', { name: 'taxCode', value: this.taxCode })
      this.delete_dialog = false
    },

    handleActions(value, action) {
      if (action == 'edit') {
        this.add_dialog = true
        this.edit = true
        this.taxCode = value
      } else {
        this.delete_dialog = true
        this.taxCode = value
      }
    },
  },
  computed: {
    handleDisabled() {
      return !this.taxCode.name || !this.taxCode.code || !this.taxCode.rate
    },
  },
}
</script>
