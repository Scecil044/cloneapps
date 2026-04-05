<template>
  <v-dialog v-model="data" class="ma-0 pa-0">
    <div class="my_dialog">
      <v-card id="tall_dialog">
        <v-card-title id="card-title">
          <h4 class="text--text">Export</h4>
          <div class="flex_row justify-lg-space-between">
            <v-btn
              class="tall__btn mr-2 px-5"
              color="subtext"
              outlined
              @click="close"
              >Cancel</v-btn
            >
            <v-btn class="tall__btn px-9" color="primary" @click="exportDocument"
              >Export</v-btn
            >
          </div>
        </v-card-title>
        <v-divider id="divider" class="mt-5"></v-divider>
        <v-card-text id="card-text" class="">
          <!-- <div class="flex_row justify-space-between">
                    <CustomInputContainer label="Select Module" class="">
                    <div slot="input">
                        <v-select
                        :items="all_modules"
                        v-model="module"
                        placeholder="Select Module"
                        outlined
                        hide-details=""
                        dense
                        style="width: 30vw"
                        />
                    </div>
                    </CustomInputContainer>
                    <CustomInputContainer label="Fields in Export File" class="">
                    <div slot="input">
                        <v-select
                        :items="fields_in_export_file"
                        v-model="field_in_export_file"
                        placeholder="Select an Export Template"
                        outlined
                        hide-details=""
                        dense
                        style="width: 30vw"
                        />
                    </div>
                    </CustomInputContainer>
                </div>

                <v-divider id="divider" class="my-5"></v-divider> -->

          <span class="subtext--text ml-2">Export As *</span>
          <v-radio-group dense v-model="excelType" class="mt-2" mandatory>
            <v-radio
              v-for="n in export_as"
              :key="n.value"
              :label="n.name"
              :value="n.value"
              color="subtext"
            ></v-radio>
          </v-radio-group>

          <v-divider id="divider" class="my-5"></v-divider>

          <!-- <CustomInputContainer label="Password to protect the file" class="mb-5">
                  <div slot="input">
                    <v-text-field
                      placeholder="Password"
                      outlined
                      dense
                    />
                  </div>
                </CustomInputContainer> -->

          <!-- <span class="text--text mt-9 caption">
                    NOTE:  You can export only the first 50,000 rows. If you have more rows, please initiate a backup for the data in your Zoho Books organization, and download it. Backup Your Data
                </span> -->
        </v-card-text>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'

export default {
  props: {
    data: Boolean,
  },
  components: { FileDropzone, CustomInputContainer },
  data() {
    return {
      all_modules: ['module-1', 'module-2', 'module-3'],
      module: '',
      fields_in_export_file: ['field no 1', 'field no 2', 'field no 3'],
      field_in_export_file: '',
      export_as: [
        { name: 'CSV (Comma Separated Value)', value: 'csv' },
        { name: 'XLS (Microsoft Excel 1997-2004 Compatible)', value: 'xls' },
        { name: 'XLSX (Microsoft Excel)', value: 'xlsx' },
      ],
      excelType:null,
      // ---
      upload_excel_sheet_dialog: false,
      uploaded_excel_sheet: null,
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    exportDocument(){
      this.$emit('save',this.excelType)
    },
    handleUploadExcelSheet() {
      this.upload_excel_sheet_dialog = false
      this.$emit('file', this.uploaded_excel_sheet)
    },
    fileHandler(file) {
      this.uploaded_excel_sheet = file
    },
  },
}
</script>

<style></style>
