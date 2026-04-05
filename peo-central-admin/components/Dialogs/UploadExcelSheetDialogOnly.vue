<template>
  <!-- <div class="d-inline"> -->
  <!-- <v-btn class="tall__btn ml-2 subtext--text" color="subtext" outlined @click="upload_excel_sheet_dialog=true">
      <v-icon class="mr-2" small>fa-upload</v-icon>
      Upload Excel Sheet
    </v-btn> -->
  <v-dialog v-model="data" class="ma-0 pa-0">
    <div class="my_dialog">
      <v-card id="tall_dialog">
        <v-card-title id="card-title">
          <h4 class="text--text">Upload Excel Sheet</h4>
          <div class="flex_row justify-lg-space-between">
            <v-btn
              class="tall__btn mr-2 px-5"
              color="subtext"
              outlined
              @click="close"
              >Cancel</v-btn
            >
            <v-btn
              class="tall__btn px-9"
              color="primary"
              @click="handleUploadExcelSheet"
              min-width="150px"
              >Upload</v-btn
            >
          </div>
        </v-card-title>
        <v-divider id="divider" class="mt-5"></v-divider>
        <v-card-text id="card-text" class="text-center">
          <v-btn class="excel-btn">
            <excelIcon />
          </v-btn>
          <div class="mb-9">
            <h5 class="text--text pb-2">Drag & Drop your Excel Sheet</h5>
          </div>
          <FileDropzone class="ma-9" @fileHandler="fileHandler" />
        </v-card-text>
      </v-card>
    </div>
  </v-dialog>
  <!-- </div> -->
</template>

<script>
import FileDropzone from '~/components/utils/FileDropzone.vue'
import excelIcon from '@/assets/images/icons/excel.svg'
export default {
  props: {
    data: Boolean,
  },
  components: { FileDropzone, excelIcon },
  data() {
    return {
      upload_excel_sheet_dialog: false,
      uploaded_excel_sheet: null,
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleUploadExcelSheet() {
      this.upload_excel_sheet_dialog = false
      this.$emit('save', this.uploaded_excel_sheet)
    },
    fileHandler(file) {
      this.uploaded_excel_sheet = file
    },
  },
}
</script>

<style></style>
