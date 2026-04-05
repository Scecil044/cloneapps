<template>
  <v-dialog
    v-model="internalDialog"
    max-width="900px"
    persistent
    content-class="proposal_dialog"
  >
    <v-card class="rounded-xl pa-0 pt-0 " min-height="100vh" flat>
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
          <v-btn @click="closeDialog" outlined icon color="red accent-4">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-divider></v-divider>

        <!-- Tabs -->
        <v-tabs v-model="activeTab" background-color="transparent" color="primary" class="tw-border-b tw-border-gray-200">
          <v-tab class="tw-font-medium">Single Lead</v-tab>
          <v-tab class="tw-font-medium">Bulk Upload</v-tab>
        </v-tabs>

        <!-- Tab Content -->
        <v-tabs-items v-model="activeTab">
          <!-- Single Lead Tab -->
          <v-tab-item>
              <AddLeadsForm
                :is-page="true"
                :hide-header="true"
                :handleModel="closeDialog"
                @close="handleSingleLeadClose"
              />
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
                  <li>�� Save the file as .xlsx or .xls format</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Maximum 1000 leads per upload</li>
                </ul>
              </div>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-form>
    </v-card>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </v-dialog>
</template>

<script>
import AddLeadsForm from '@/components/EditModel/editLeads.vue'

export default {
  name: 'NewLeadDialog',
  components: {
    AddLeadsForm
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTab: null,
      bulkUploadFile: null,
      uploadingBulk: false,
      snack: false,
      snackText: '',
      snackColor: ''
    }
  },
  computed: {
    internalDialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    closeDialog() {
      this.internalDialog = false
      this.resetForm()
      this.$emit('lead-created')
    },
    resetForm() {
      this.activeTab = null
      this.bulkUploadFile = null
      this.uploadingBulk = false
      this.snack = false
      this.snackText = ''
      this.snackColor = ''
    },
    handleSingleLeadClose() {
      this.closeDialog()
      this.$emit('lead-created')
    },
    async downloadTemplate() {
      try {
        const timestamp = new Date().getTime()
        const url = `/leads/bulk/template?t=${timestamp}`
        
        // Use axios to download the file as blob
        const response = await this.$axios.get(url, {
          responseType: 'blob'
        })

        // Create a blob URL and download
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const blobUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = 'leads_bulk_upload_template.xlsx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)

        this.showNotification('Template downloaded successfully!', 'success')
      } catch (error) {
        console.error('Download error:', error)
        this.showNotification('Error downloading template. Please try again.', 'error')
      }
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
          this.showNotification('Please select a valid Excel or CSV file', 'error')
          this.bulkUploadFile = null
          return
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          this.showNotification('File size must be less than 5MB', 'error')
          this.bulkUploadFile = null
          return
        }
      }
    },
    async uploadBulkLeads() {
      if (!this.bulkUploadFile) {
        this.showNotification('Please select a file to upload', 'error')
        return
      }

      try {
        this.uploadingBulk = true

        const formData = new FormData()
        formData.append('file', this.bulkUploadFile)

        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Use the correct API endpoint for bulk upload
        await this.$axios.$post('/leads/bulk/upload', formData, {
          headers: {
            Authorization: AuthStr,
            'Content-Type': 'multipart/form-data'
          }
        })

        this.showNotification('Bulk upload completed successfully!', 'success')

        // Reset form and close dialog
        this.bulkUploadFile = null
        this.closeDialog()
        this.$emit('lead-created')

      } catch (error) {
        console.error('Bulk upload error:', error)
        this.showNotification(
          error.response?.data?.message || 'Error uploading file. Please try again.',
          'error'
        )
      } finally {
        this.uploadingBulk = false
      }
    },
    showNotification(message, color) {
      this.snackText = message
      this.snackColor = color
      this.snack = true
    }
  }
}
</script>

<style scoped>
/* Add any specific styles for the dialog here if needed */
</style>