<template>
  <div style="width: 100%">
    <!-- # Invoices Data Table -->
    <div>
      <v-btn class="short__btn" color="primary" @click="openAddDocumentComponent()">New</v-btn>
    </div>
    <v-row class="row1" v-if="documentsList.length > 0">
      <v-col cols="12" class="pt-3 pb-0">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h5>{{ employee_documents_data.length }} Docs</h5>
          </div>
        </div>
      </v-col>
      <v-col cols="12" class="pt-6 pb-0">
        <div class="search__bar d-flex align-center  ">
          <v-text-field value="value" class="ml-1" label="Search" solo flat hide-details dense
            background-color="searchbar" v-model="search"></v-text-field>
        </div>
        <v-data-table id="coa_table" :search="search" class="main__table elevation-0 document_table"
          :headers="employee_documents_headers" :items="employee_documents_data">
          <template v-slot:item="{ item, index }">
            <tr class="table_row">
              <!-- <td class="" @click="openDocument(item.url)">
                <div class="d-flex align-center">
                  <span class="pr-2">
                    <PdfSvg />
                  </span>
                  {{ item.documents }}
                </div>
              </td> -->
              <td class="" @click="openDocument(item.url)"><v-icon :color="item.url == '' ? 'grey' : 'red'"
                  small>fa-file</v-icon></td>
              <td class="" @click="openDocument(item.url)">{{ item.type }}</td>
              <td class="" @click="openDocument(item.url)">{{ item.document_number }}</td>
              <td class="" @click="openDocument(item.url)">{{ item.issuance_date | formatDateWithoutTime }}</td>
              <td class="" @click="openDocument(item.url)">{{ item.expiry_date | formatDateWithoutTime }}</td>
              <td class="pa-0 ma-0 pl-3">
                <div class="">
                  <span class="table_btn light_accent4 accent4--text" v-if="item.status == 'valid'">{{ item.status
                  }}</span>
                  <span class="table_btn light_accent3 accent3--text" v-if="item.status == 'Soon Expiring'">{{ item.status
                  }}</span>
                  <span class="table_btn light_accent2 accent2--text"
                    v-if="item.status == 'Expired' || item.status == 'expired'">{{ item.status }}</span>
                </div>
              </td>
              <td class="">
                <div class="d-flex align-center justify-space-between">
                  <span class="">
                    <v-tooltip top color="red">
                      <template v-slot:activator="{ on, attrs }">
                        <DeleteSvg v-bind="attrs" v-on="on" @click="deleteDocument(item)" />
                      </template>
                      Delete
                    </v-tooltip>
                  </span>


                  <!-- <span class="" v-if="item.status == 'Expired' || item.status == 'expired'">
                    <UploadSvg />
                  </span>
                  <span class="" v-if="item.status == 'Soon Expiring' || item.status == 'soon expiring'">
                    <UploadSvg />
                  </span> -->

                  <div class="" v-if="uploading && selectedIndex == index">
                    <v-img src="/animated/refresh.svg" height="20" width="20" class="mr-2" contain></v-img>
                  </div>
                  <span class="" v-else>
                    <v-tooltip top color="blue">
                      <template v-slot:activator="{ on, attrs }">
                        <UploadSvg v-bind="attrs" v-on="on" @click="uploadDocument(item, index)" />
                      </template>
                      {{ item.action }}
                    </v-tooltip>
                  </span>

                  <span class="">
                    <v-tooltip top color="grey">
                      <template v-slot:activator="{ on, attrs }">
                        <DownloadSvg v-bind="attrs" v-on="on" @click="initiateDownload(item.url)" />
                      </template>
                      Download
                    </v-tooltip>
                  </span>

                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row class="row1" v-else>
      <div class="justify-content-center">
        <p>No Documents Available For This User.</p>
      </div>
    </v-row>



    <!---Delete Document-->
    <v-dialog v-model="deleteDialog" transition="dialog-top-transition" max-width="600">
      <v-card>
        <v-card-title color="grey lighten-2" class="font-weight-bold">
          Are you sure you want to delete this {{ selectedItem.type }}?
        </v-card-title>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn text color="blue" class="body-2 font-weight-bold" outlined dark
            @click="deleteDocumentConfirm()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--Document ADD-->
    <DocumentAddition @close="documentAdd = false" :type="'new'" @updated="updatedDocument()" v-if="documentAdd"
      :module="'users'" :foreign_id="this.employeeDetails[0].id" :allowedTypes="allowedTypes" />

    <!---Replace or Upload Document-->
    <v-dialog v-model="uploadDocumentDialog" max-width="600">
      <v-card max-width="600" style="overflow-x:hidden">
        <v-row class="pt-4 pl-4 pr-4">
          <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
            <p class="mb-0 caption blue-grey--text font-weight-bold">Upload/Replace Document</p>
            <v-col class="pt-2" v-if="filename_attach.length > 0">
              <p class="mb-0">File Name: {{ filename_attach[0] }}</p>
            </v-col>
            <div class="pt-2" v-if="!uploadFile">
              <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true"
                @dragleave="dragging = false">
                <div class="dropZone-info" @drag="onUploadFile">
                  <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
                  <span class="dropZone-title">Drop file or click to upload</span>
                  <div class="dropZone-upload-limit-info">
                    <div>maximum file size: 10 MB</div>
                  </div>
                </div>
                <input type="file" @change="onUploadFile">
              </div>
            </div>
            <div v-else class="dropZone-uploaded">
              <div class="dropZone-uploaded-info">
                <span class="dropZone-title">Added</span>
                <button type="button" class="btn btn-primary removeFile" @click="removeFile('uploadDoc')">Remove
                  File</button>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row class="pa-4">
          <v-col class="text-right pt-0">
            <v-btn color="grey" text @click="uploadDocumentDialog = false">Close</v-btn>
            <v-btn color="blue darken-1" text v-if="!uploading" @click="attachFile()">Upload Document</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>


    <!-- Snack -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import '@/assets/scss/utils/_customerDocumentsTable.scss'
import PdfSvg from '@/assets/images/icons/pdf.svg'
import DeleteSvg from '@/assets/images/icons/delete-icon.svg'
import UploadSvg from '@/assets/images/icons/upload-icon.svg'
import DownloadSvg from '@/assets/images/icons/download-icon.svg'
import SnackBar from '~/components/utils/SnackBar.vue'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import DocumentAddition from '@/components/Dialogs/documentAddDialog.vue'

export default {
  components: {
    SnackBar,
    DocumentAddition,
    DarkArrow,
    PdfSvg,
    DeleteSvg,
    UploadSvg,
    DownloadSvg,
  },
  props: { employeeDetails: Array, allowedTypes: Array },
  data() {
    return {
      search: "",
      documentAdd: false,
      titles: ['Invoice No', 'Customer', 'Type', 'Type', 'Status', 'Action'],
      employee_documents_headers: [
        { text: 'Document', value: 'icon', align: 'center' },
        { text: 'Type', value: 'type', align: 'start' },
        { text: 'Document Number', value: 'document_number', align: 'start' },
        { text: 'issuance Date', value: 'issuance_date', align: 'start' },
        { text: 'Expiry Date', value: 'expiry_date', align: 'start' },
        { text: 'Expiry Status', value: 'status', align: 'start' },
        { text: 'Action', value: 'action', align: 'start' },
      ],
      employee_documents_data: [
        // {
        //   documents: 'TradeLicense',
        //   url: '',
        //   expiry_date: 'Binance',
        //   status: 'valid',
        //   action: 'Upload',
        //   del: 'Delete',
        // },
        // {
        //   documents: 'TradeLicense',
        //   url: '',
        //   expiry_date: 'Binance',
        //   status: 'Expired',
        //   action: 'Upload',
        //   del: 'Delete',
        // },
        // {
        //   documents: 'TradeLicense',
        //   url: '',
        //   expiry_date: 'Binance',
        //   status: 'Soon Expiring',
        //   action: 'Upload',
        //   del: 'Delete',
        // },
      ],
      documentsList: [],
      selectedItem: {},
      deleteDialog: false,
      snack: false,
      snackText: '',
      snackColor: '',
      selectedIndex: 0,
      uploadDocumentDialog: false,
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      link_url: '',
      link_filename: '',
      attachFiles: {
        uploadDoc: {},
        ecard: {}
      },
      uploading: false,
    }
  },
  methods: {
    updatedDocument() {
      this.documentAdd = false
      setTimeout(() => {
        this.documentAdd = true
      }, 1);
      this.getDocumentsById(this.employeeDetails[0].id)
    },
    openAddDocumentComponent() {
      this.documentAdd = true
    },
    async getDocumentsById(user_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/documents/foreignid/${user_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentsList = []
          this.employee_documents_data = []
          this.documentsList = response
          if (this.documentsList.length > 0) {
            for (const doc of this.documentsList) {
              const employeeDocument = {
                id: doc._id,
                icon: 'fa-file-o',
                documents: doc.name,
                module: doc.module,
                type: doc.type,
                foreign_id: doc.foreign_id,
                url: doc.url,
                expiry_date: doc.expiry,
                issuance_date: doc.issuance,
                document_number: doc.document_number,
                status: doc.doc_status,
                action: doc.url == '' ? 'Upload' : 'Replace',
                del: 'Delete',
              };

              this.employee_documents_data.push(employeeDocument)
            }
          }
        })
    },
    openDocument(val) {
      window.open(val)
    },
    initiateDownload(url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'downloaded_file';
      link.target = '_blank';
      link.click();
      // this.close();
    },
    deleteDocument(item) {
      this.selectedItem = item
      this.deleteDialog = true
      console.log(this.selectedItem)

    },
    deleteDocumentConfirm() {
      console.log(this.selectedItem)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.$axios.$delete(`/documents/${this.selectedItem.id}`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          if (response) {
            this.snack = true
            this.snackColor = 'success'
            this.snackText = 'Document Deleted Successfully.'
            this.getDocumentsById(this.employeeDetails[0].id)
            this.deleteDialog = false
            this.selectedItem = {}
          }
        })
    },
    uploadDocument(item, index) {
      this.selectedItem = item
      this.selectedIndex = index
      this.uploadDocumentDialog = true
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
    },
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        this.dragging = false;
        return;
      }
      this.createFile(e, files, type);
    },
    removeFile(val) {
      if (val == 'uploadDoc') this.uploadFile = '';
      this.filename_attach = []
      // if (val == 'ecard') this.ecardFile = '';
      // if (val == 'bulk') this.bulkFile = '';
    },
    createFile(e, file, type) {
      if (file.size > 26214400) {
        alert('please check file size is not more than 25 MB.')
        this.dragging = false;
        return;
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file;
      // if (type == 'ecard') this.ecardFile = file
      // if (type == 'bulk') this.bulkFile = file
      this.dragging = false;
    },
    onUploadFiles(event) {
      this.uploadFiles = event;
      this.dragging = false;
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    async attachFile() {
      this.uploading = true
      let attach = {}

      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      for (var key in this.attachFiles) {
        if (!_.isEmpty(this.attachFiles[key])) {
          for (let i = 0; i < this.attachFiles[key].length; i++) {
            if (this.attachFiles[key][i].name != undefined) {
              // let upload_meta = {
              //   file: this.attachFiles[key][i],
              //   filename: this.attachFiles[key][i].name
              // }

              attach.file = this.attachFiles[key][i]

            } else {
              console.log('null')
            }
          }
        }
        this.removeFile(key)
      }

      const fd = new FormData();

      fd.append('documents', attach.file)
      fd.append('foreign_id', this.selectedItem.foreign_id)
      fd.append('document_id', this.selectedItem.id)
      fd.append('expiry', this.selectedItem.expiry_date)

      this.uploadDocumentDialog = false

      await this.$axios.$post(`/documents/upload/docid/foreignid/`, fd, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Successfully Uploaded Document.'
        })
      this.getDocumentsById(this.employeeDetails[0].id)
      this.uploading = false
      this.selectedItem = {}
    },
  },
  mounted() {
    // console.log(this.employeeDetails, '-------------this.employeeDetails Documents')

    if (this.employeeDetails && this.employeeDetails.length > 0) {
      this.getDocumentsById(this.employeeDetails[0].id)
    }
  },
}
</script>
<style lang="scss" scoped>
.dropZone {
  width: 220px;
  height: 80px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone:hover {
  border: 2px solid #2e94c4;
}

.dropZone:hover .dropZone-title {
  color: #1975A0;
}

.dropZone-info {
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}

.dropZone-title {
  color: #787878;
}

.dropZone input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.dropZone-upload-limit-info {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.dropZone-over {
  background: #5C5C5C;
  opacity: 0.8;
}

.dropZone-uploaded {
  width: 220px;
  height: 75px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone-uploaded-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>
