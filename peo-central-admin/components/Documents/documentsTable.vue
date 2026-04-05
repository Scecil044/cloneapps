<template>
  <div style="width: 100%">
    <!-- # Invoices Data Table -->
    <v-row class="row1">
      <!-- employee details dialog -->
      <v-dialog v-model="ShowDialog" width="45vw" content-class="employee_dialog">
        <div class="dialog_emp pt-7">
          <!-- <EmployeeDialog :EmployeeDetails="EmployeeDetails" /> -->
        </div>

      </v-dialog>
      <!-- FILTER DIALOG -->
      <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="350px"
        content-class="allDocsTable_dialog">
        <v-card id="card" style="padding: 15px 15px !important">
          <v-card-title id="card-title">
            <h4 class="text--text">Companies</h4>
            <v-btn class="short__btn pl-4 pr-4" color="subtext" outlined><span class=""
                @click="filterDialog = false">Clear All</span></v-btn>

          </v-card-title>
          <v-card-text id="card-text2">
            <v-container class="ma-0 pa-0">
              <v-row class="pa-0">
                <v-col cols="12">
                  <div class=" d-flex align-center mb-4 " v-for="(com, index) in companiesNames" :key="index">
                    <v-checkbox hide-details class="mx-0 my-0 pa-0" />

                    <v-avatar class="mr-2 ml-5" size="30px">
                      <v-img alt="Avatar" :src="'/1.jpg'" />
                    </v-avatar>
                    <span class="span_btnNew">{{ com.title }}</span>


                  </div>
                </v-col>
                <v-col cols="12" class="ma-0 pa-0">
                  <div class="d-flex align-center justify-end">
                    <v-btn class="short__btn mr-4 pl-4 pr-4" color="subtext" outlined><span class=""
                        @click="filterDialog = false">Cancel</span></v-btn>
                    <v-btn class="short__btn mr-4 pl-4 pr-4" color="primary" @click="handleDocsDialogs">Send Mail</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- / FILTER DIALOG -->
      <!-- Send Email Dialog -->
      <SendMailDialog v-if="sendEmailDialog" :emailBody="emailBody" @close="closeEosbDialog" :is-loading="!emailBody.content" />
      <!-- download document dialog -->
      <DocumentsDownloadDialog @close="closeEosbDialog" :selectedDoc="selectedDoc" v-if="documentDownloadDialogs" />
      <!--Document ADD-->
      <DocumentAddition @close="documentAdd = false" :type="'new'" @updated="updatedDocument()" v-if="documentAdd" />
      <!--Document Edit-->
      <DocumentAddition :document="selectedDocument" :type="'edit'" @close="documentEdit = false"
        @updated="updatedDocument()" v-if="documentEdit" />

      <v-col cols="12" class="">
        <v-card color="card_bg" id="card">
          <v-card-text id="card-text" style="margin-top: 0 !important" :class="privacyMood ? 'privacyMood' : ''">
            <v-row>
              <v-col cols="12" class="pl-0 pr-0 pb-4">
                <div class="flex_row align-center top_barCustomer">
                  <div class=" d-flex align-center ">
                    <!-- top Search Bar -->
                    <div class="flex_row align-center mr-4">
                      <v-select label="All Documents" class="ma-0 pa-0" flat solo append-icon="fa-chevron-down"
                        hide-details dense multiple :items="documentTypesList" item-text="name" item-value="id"
                        v-model="selectedDocumentType" @change="handleFilterDocuments(selectedDocumentType)"></v-select>
                    </div>
                    <div class="search__bar d-flex align-center  ">
                      <v-text-field value="value" class="ml-1" label="Search" solo flat hide-details dense
                        background-color="searchbar" v-model="search_Document"
                        @keyup="searchDebounceAction(search_Document)"></v-text-field>
                    </div>
                  </div>


                  <!-- top Buttons -->
                  <div>
                    <v-btn v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)"
                      class="short__btn mr-4 pl-6 pr-6" color="subtext" outlined @click="filterDialog = true">
                      <span class="primary--text span_leadHeading">Notify Expired</span>
                    </v-btn>
                    <v-btn class="short__btn" color="primary" @click="openAddDocumentComponent()">New</v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-data-table
            id="coa_table"
            class="main__table document_table tw-rounded-xl tw-shadow-sm tw-bg-white tw-text-gray-800 tw-text-sm tw-border-l-8 tw-border-gray-400"
            :loading="dataLoading"
            loading-text="Loading... Please wait"
            :headers="employee_documents_headers"
            :items="documentsList"
            :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-header
            style="border-radius: 16px;"
          >
            <template v-slot:header>
              <thead class="tw-bg-gray-50">
                <tr>
                  <th v-for="header in employee_documents_headers" :key="header.value" class="tw-px-4 tw-py-2 tw-font-semibold tw-text-left tw-text-xs tw-uppercase tw-text-gray-500">
                    {{ header.text }}
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item="{ item, index }">
              <tr class="tw-border-b tw-border-gray-100 hover:tw-bg-gray-50 tw-transition tw-duration-150">
                <td class="tw-px-4 tw-py-2 tw-cursor-pointer" @click="handleDocumentDownload(item)">
                  <div class="tw-flex tw-items-center">
                    <span class="tw-mr-2" v-if="item.url">
                      <PdfSvg v-if="getFileFormat(item.url) == 'pdf'" />
                      <WordSvg v-if="getFileFormat(item.url) == 'word'" />
                      <ImageSvg v-if="getFileFormat(item.url) == 'image'" />
                      <ExcelSvg v-if="getFileFormat(item.url) == 'excel'" />
                      <PowerPointSvg v-if="getFileFormat(item.url) == 'powerpoint'" />
                      <OtherSvg v-if="getFileFormat(item.url) == 'other'" />
                    </span>
                    <span class="tw-font-medium">{{ item.name }}</span>
                  </div>
                </td>
                <td class="tw-px-4 tw-py-2">{{ item.type_name }}</td>
                <td class="tw-px-4 tw-py-2">{{ item.document_number }}</td>
                <td class="tw-px-4 tw-py-2">{{ item.expiry | ticketingDateFormatter }}</td>
                <td class="tw-px-4 tw-py-2">
                  <div class="tw-flex tw-items-center">
                    <v-avatar class="tw-mr-2" size="30px">
                      <v-img alt="Avatar" :src="item.owner_logo" />
                    </v-avatar>
                    <span>{{ item.owner_name }}</span>
                  </div>
                </td>
                <td class="tw-px-4 tw-py-2">
                  <span v-if="item.doc_status == 'valid'" class="tw-bg-green-100 tw-text-green-700 tw-px-2 tw-py-1 tw-rounded tw-text-xs">{{ item.doc_status }}</span>
                  <span v-else-if="item.doc_status == 'Soon Expiring' || item.doc_status == 'soon expiring'" class="tw-bg-yellow-100 tw-text-yellow-800 tw-px-2 tw-py-1 tw-rounded tw-text-xs">{{ item.doc_status }}</span>
                  <span v-else-if="item.doc_status == 'Expired' || item.doc_status == 'expired'" class="tw-bg-red-100 tw-text-red-700 tw-px-2 tw-py-1 tw-rounded tw-text-xs">{{ item.doc_status }}</span>
                </td>
                <td class="tw-px-4 tw-py-2">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <v-btn v-if="uploading && selectedIndex == index" icon small class="tw-animate-spin">
                      <v-img src="/animated/refresh.svg" height="20" width="20" contain></v-img>
                    </v-btn>
                    <template v-else>
                      <a v-if="item.doc_status == 'valid' || item.doc_status == 'Valid'" class="tw-text-blue-600 hover:tw-underline tw-cursor-pointer" @click="uploadDocument(item, index)">Replace</a>
                      <a v-if="item.doc_status == 'Expired' || item.doc_status == 'expired' || item.doc_status == 'Soon Expiring' || item.doc_status == 'soon expiring'" class="tw-text-blue-600 hover:tw-underline tw-cursor-pointer" @click="uploadDocument(item, index)">Upload</a>
                    </template>
                    <v-tooltip top color="grey">
                      <template v-slot:activator="{ on, attrs }">
                        <EditSvg v-bind="attrs" v-on="on" class="tw-cursor-pointer" @click="editDocument(item)" />
                      </template>
                      Edit
                    </v-tooltip>
                    <v-tooltip top color="grey">
                      <template v-slot:activator="{ on, attrs }">
                        <DownloadSvg v-bind="attrs" v-on="on" class="tw-cursor-pointer" @click="downloadFile(item.url)" />
                      </template>
                      Download
                    </v-tooltip>
                    <v-tooltip top color="red">
                      <template v-slot:activator="{ on, attrs }">
                        <DeleteSvg v-bind="attrs" v-on="on" class="tw-cursor-pointer" @click="deleteDocument(item)" />
                      </template>
                      Delete
                    </v-tooltip>
                  </div>
                </td>
              </tr>
            </template>

            <Observer v-if="loadObserver" @intersect="getDocumentsList" />
          </v-data-table>
        </v-card>

      </v-col>
    </v-row>

    <!---Replace or Upload Document-->
    <v-dialog v-model="uploadDocumentDialog" max-width="600">
      <v-card max-width="600" style="overflow-x:hidden">
        <v-row class="pt-4 pl-4 pr-4">
          <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
            <p class="mb-0 caption blue-grey--text font-weight-bold">Upload/Replace Document</p>
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


    <!-- <v-dialog v-model="documentAdd">
    </v-dialog> -->

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
import WordSvg from '@/assets/images/icons/word2.svg'
import ImageSvg from '@/assets/images/icons/image-icon.svg'
import ExcelSvg from '@/assets/images/icons/excel2.svg'
import PowerPointSvg from '@/assets/images/icons/powerpoint.svg'
import OtherSvg from '@/assets/images/icons/otherfile.svg'
import DeleteSvg from '@/assets/images/icons/delete-icon.svg'
import UploadSvg from '@/assets/images/icons/upload-icon.svg'
import DownloadSvg from '@/assets/images/icons/download-icon.svg'
import EditSvg from '@/assets/images/Customer/edit.svg'
import SnackBar from '~/components/utils/SnackBar.vue'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import SendMailDialog from '@/components/Dialogs/sendMail-dialog.vue'
import DocumentsDownloadDialog from '@/components/Dialogs/documentDownloadDialog.vue'
import DocumentAddition from '@/components/Dialogs/documentAddDialog.vue'
import Observer from '~/components/Observer.vue'


export default {
  components: {
    SnackBar,
    DarkArrow,
    PdfSvg,
    WordSvg,
    ImageSvg,
    ExcelSvg,
    PowerPointSvg,
    OtherSvg,
    EditSvg,
    DeleteSvg,
    UploadSvg,
    DownloadSvg,
    SendMailDialog,
    DocumentsDownloadDialog,
    DocumentAddition,
    Observer
  },
  props: ['documentsArray', 'currentTab'],
  data() {
    return {
      loadObserver: true,
      selectedDoc: '',
      //Dialogs
      emailBody: {},
      filterDialog: false,
      sendEmailDialog: false,
      documentDownloadDialogs: false,
      ShowDialog: false,
      search_Document: '',

      companiesNames: [
        { title: 'binance', },
        { title: 'Nathan & Nathan', },
        { title: 'AirBlue' },
        { title: 'Tata' },
        { title: 'Royal Challengers' },
        { title: 'Royal Challengers' },
        { title: 'binance', },
        { title: 'Nathan & Nathan', },
        { title: 'AirBlue' },
        { title: 'Tata' },
        { title: 'Royal Challengers' },

      ],

      employee_documents_headers: [
        { text: 'Document', value: 'name', align: 'start' },
        { text: 'Type', value: 'type', align: 'start' },
        { text: 'Document Number', value: 'document_number', align: 'start' },
        { text: 'Expiry Date', value: 'expiry', align: 'start' },
        { text: 'Owner', value: 'company_name', align: 'start' },
        { text: 'Expiry Status', value: 'doc_status', align: 'start' },
        { text: 'Action', value: 'action', align: 'start' },
      ],
      limit: '10',
      page: 0,
      documentsList: [],
      documentTypesList: [],
      selectedDocumentType: [],
      privacyMood: '',
      selectedItem: {},
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
      snack: false,
      snackText: '',
      snackColor: '',
      deleteDialog: false,
      documentAdd: false,
      documentEdit: false,
      selectedDocument: {},
      selectedParams: {},
      dataLoading: false,
    }
  },
  created() {
    this.$nuxt.$on('receivedDocuments', ($event) => {
      this.documentsList = $event.documents
      this.selectedParams = $event.params
    })
  },
  methods: {
    getFileFormat(url) {
      const fileExtension = url.split('.').pop().toLowerCase();
      let fileFormat = '';
      if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'gif') {
        fileFormat = 'image';
      } else if (fileExtension === 'pdf') {
        fileFormat = 'pdf';
      } else if (fileExtension === 'doc' || fileExtension === 'docx') {
        fileFormat = 'word';
      } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
        fileFormat = 'excel';
      } else if (fileExtension === 'ppt' || fileExtension === 'pptx') {
        fileFormat = 'powerpoint';
      } else {
        fileFormat = 'other';
      }

      return fileFormat;
    },
    handleDocumentDownload(val) {
      this.selectedDoc = val
      this.documentDownloadDialogs = true
    },
    closeEosbDialog(value) {
      //   this.proposalDialog = false
      this.sendEmailDialog = false
      this.documentDownloadDialogs = false
      // this.ShowList= false
    },
    handleDocsDialogs() {
      this.sendEmailDialog = true
      this.filterDialog = false
    },
    async getDocumentsList() {
      this.page = 1;
      this.dataLoading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      const params = {
        "company_id": this.selectedParams.company_id,
        "user_id": this.selectedParams.user_id,
      }
      params['module'] = this.currentTab

      await this.$axios.$post(`/documents/filter/foreignid/userid?page=${this.page}&limit=10000`, params, { headers: { Authorization: AuthStr } }).
        then((response) => {
          this.documentsList = response.results
          this.dataLoading = false
        })
    },
    deleteDocument(item) {
      this.selectedItem = item
      this.deleteDialog = true
    },
    async deleteDocumentConfirm() {
      this.dataLoading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$delete(`/documents/${this.selectedItem.id}`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          if (response) {
            this.snack = true
            this.snackColor = 'success'
            this.snackText = 'Document Deleted Successfully.'
            this.getDocumentsList()
            this.deleteDialog = false
            this.selectedItem = {}
            this.dataLoading = false
          }
        })
    },
    async getDocumentsTypeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/documenttypes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentTypesList = response
        })
    },
    async handleFilterDocuments(data) {
      this.dataLoading = true
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let params = { 'type': data }
      params['module'] = this.currentTab
      await this.$axios.$post(`/documents/filter/foreignid/userid?page=${this.page}&limit=10000`, params, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentsList = response.results
          this.dataLoading = false
        })
    },
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleSearchFilter(e)
    }, 500),
    async handleSearchFilter(text) {
      this.dataLoading = true
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let params = { 'search': text }
      params['module'] = this.currentTab
      await this.$axios.$post(`/documents/filter/foreignid/userid?page=${this.page}&limit=10000`, params, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentsList = response.results
          this.dataLoading = false
        })
    },
    initiateDownload(url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'downloaded_file';
      link.target = '_blank';
      link.click();
      // this.close();
    },
    async downloadFile(url) {
      var blobURL = await fetch(url).then(r => r.blob());
      const aElement = document.createElement('a');
      let filename = url.split('/')[url.split('/').length - 1]
      aElement.setAttribute('download', filename);
      const href = URL.createObjectURL(blobURL);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
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
      fd.append('expiry', this.selectedItem.expiry)
      fd.append('module', this.selectedItem.module)

      this.uploadDocumentDialog = false

      await this.$axios.$post(`/documents/upload/docid/foreignid/`, fd, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Successfully Uploaded Document.'
        })
      this.getDocumentsList()
      this.uploading = false
      this.selectedItem = {}
    },
    openAddDocumentComponent() {
      this.documentAdd = true
    },
    updatedDocument() {
      this.documentAdd = false
      this.documentEdit = false
      this.getDocumentsList()
    },
    editDocument(item) {
      this.selectedDocument = item
      this.documentEdit = true
    }
  },
  mounted() {
    if (this.documentsArray && this.documentsArray.length > 0) {
      this.documentsList = this.documentsArray
    } else {
      this.getDocumentsList()
    }
    this.getDocumentsTypeList()
  },
}
</script>
<style lang="scss" scoped>
.dropZone {
  width: 220px;
  height: 60px;
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
  height: 60px;
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
