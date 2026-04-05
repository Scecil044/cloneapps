<template>
  <v-col sm="12" md="4" lg="4">
    <SnackBar :data="snackbar_data" />
    <ExportFileDialog
      :data="export_cof_dialog"
      @save="saveExportFileDialogData($event)"
      @close="closeExportFileDialog"
    />
    <UploadExcelSheetDialogOnly
      :data="import_cof_dialog"
      @save="saveUploadExcelSheetDialogOnlyData($event)"
      @close="closeUploadExcelSheetDialogOnly"
    />
    <v-card color="card_bg" id="card">
      <v-card-title id="card-title">
        <h4>Customers</h4>
        <div class="flex_row">
          <v-tooltip text="Add Customer" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                class="tall__btn mr-3"
                color="primary"
                @click="handleOpenCustomerForm"
                v-bind="props"
              >
                <v-icon small>fa-plus</v-icon>
                <!-- Add Customer -->
              </v-btn>
            </template>
          </v-tooltip>
          <v-menu transition="slide-y-transition" rounded="lg" offset-x>
            <template v-slot:activator="{ attrs, on }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                color="subtext"
                outlined
                max-width="10px"
                class="tall__btn px-0"
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
        </div>
      </v-card-title>
      <v-divider id="divider" class="mx-0 px-0 mt-5"></v-divider>
      <v-card-text
        id="card-text"
        style="max-height: 70vh"
        class="dl__list overflow-y-auto"
      >
        <v-list class="customers_list__con">
          <v-list-item-group>
            <v-list-item
              v-for="(item, index) in data"
              :key="index"
              @click="handleCustomer(item._id)"
              :class="
                item._id == customerId
                  ? 'v-item--active v-list-item--active'
                  : null
              "
            >
              <v-list-item-icon class="mx-4">
                <v-img
                  :src="item.logo"
                  style="border-radius: 50px"
                  width="60"
                  height="60"
                  v-if="item.logo"
                />
                <customerDefaultIcon style="border-radius: 50px" v-else />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  <h4>{{ item.customer_name }}</h4>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <Observer @intersect="attendanceScrollerObserver(false)" />
        </v-list>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import UploadExcelSheetDialogOnly from '@/components/Dialogs/UploadExcelSheetDialogOnly.vue'
import ExportFileDialog from '@/components/Dialogs/exportFileDialog.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import Observer from '~/components/Observer.vue'

export default {
  components: {
    CustomInputContainer,
    FileDropzone,
    UploadExcelSheetDialogOnly,
    ExportFileDialog,
    SnackBar,
    customerDefaultIcon,
    Observer,
  },
  props: {
    data: Array,
    customerId: String,
  },
  data() {
    return {
      uploaded_excel_sheet: null,
      import_customers_dialog: false,
      export_customers_dialog: false,
      import_cof_dialog: false,
      export_cof_dialog: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      page: 0,
      limit: 8,
    }
  },
  methods: {
    fileHandler(file) {
      this.uploaded_excel_sheet = file
    },

    handleOpenCustomerForm() {
      this.$emit('handleToggleCustomerForm', 'add')
    },

    handleCustomer(id) {
      this.$emit('getInfo', id)
    },
    async saveExportFileDialogData(value) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const payload = { type: value }
      await this.$axios
        .$post(`customer/export`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          const link = document.createElement('a')
          link.href = res.data
          link.dispatchEvent(new MouseEvent('click'))
          this.export_cof_dialog = false

          this.snackbar_data = {
            snackbar: true,
            text: 'Your File Has Exported Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
        })
        .catch((err) => {
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
    async saveUploadExcelSheetDialogOnlyData(file) {
      const formData = new FormData()
      formData.append('file', file)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/customer/bulk-upload`, formData, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          if (res.error != null) {
            var message =
              'Your File Has Been Uploaded, But Duplicate Entries Found' +
              ' (' +
              res.error.customer.join(',') +
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
          this.$emit('getData')
          this.import_cof_dialog = false
        })
        .catch((err) => {
          // console.log(err)
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
    closeExportFileDialog() {
      this.export_cof_dialog = false
    },
    closeUploadExcelSheetDialogOnly(value) {
      this.import_cof_dialog = false
    },
    attendanceScrollerObserver() {
      this.$nuxt.$emit('attendanceScrollerObserver')
    },
  },
}
</script>

<style scoped>
.customers_list__con h4 {
  text-transform: lowercase;
  font-size: 16px !important;
}
a.theme--light.v-list-item--active:hover::before,
.theme--light.v-list-item--active::before {
  height: 90%;
  width: 95%;
}
</style>
