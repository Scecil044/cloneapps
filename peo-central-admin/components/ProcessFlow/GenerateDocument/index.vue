<template>
  <div>
    <v-dialog id="custom_dialog" v-model="generateDocument" persistent width="45vw" height="100vh"
      content-class="proposal_dialog">
      <div class="dialog_proposal">
        <v-card id="card" class="dialog_custom">
          <v-card-title id="card-title">
            <v-row>
              <v-col cols="12" class="ma-0 pa-0">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text--text">Create {{ selectedDocument ? selectedDocument.name : '' }}</h4>
                  <div class="d-flex align-center justify-end">
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" :disabled="loading" @click="close"><span
                        class="">Cancel</span></v-btn>
                    <v-btn class="tall__btn pl-6 pr-6" color="primary" :disabled="loading"
                      @click="createDocument">Create</v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-title>
          <v-container v-if="loading" class="ma-0 pa-0">
            <v-row style="min-height:100%;align-items:center;justify-content:center;">
              <v-col cols="auto">
                <v-img src="/animated/ring.svg" max-width="fit-content" height="200" contain class="mr-3"></v-img>
                <span>Please Wait... This may take a while</span>
              </v-col>
            </v-row>
          </v-container>
          <v-container v-else class="ma-0 pa-0">
            <proposalDocument :proposal="selectedDocument"
              v-if="selectedDocument && selectedDocument.name == 'Leads Proposal Creation'"
              @changeDetection="updateDocument" />
            <agreementDocument :agreement="selectedDocument"
              v-if="selectedDocument && selectedDocument.name == 'Leads Agreement Creation'"
              @changeDetection="updateDocument" />
            <employementContract :contract="selectedDocument"
              v-if="selectedDocument && selectedDocument.condition && selectedDocument.condition.document_name == 'employment_contract'"
              @changeDetection="updateContractDocument" />
            <!-- {{ selectedDocument }} -->
            <workOrder :workOrder="selectedDocument"
              v-if="selectedDocument && selectedDocument.condition && (selectedDocument.condition.document_name == 'work_order' || selectedDocument.condition.document_name == 'work_order_renewals_des' || selectedDocument.condition.document_name == 'work_order_renewals_ees' )"
              @changeDetection="updateDocument" />
            <eosb :eosb="selectedDocument"
              v-if="selectedDocument && selectedDocument.name == 'End of Service Settlement'"
              @changeDetection="updateDocument" />
            <v-row>
              <v-col cols="12" class="pl-0 pt-0" style="display: flex !important; justify-content: center !important;">
                <div class="mb-3">
                  <span class="span_leadHeading">OR</span>
                </div>
              </v-col>
              <v-divider></v-divider>

              <v-col cols="12">
                <v-form ref="edit_category">
                  <v-row class="pt-2 scrollDark"
                    :style="$vuetify.breakpoint.md || $vuetify.breakpoint.lg ? 'max-height:300px' : 'max-height:460px'">
                    <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="6" xl="6">
                      <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Document Number (If Any)</p>
                      <v-text-field :items="documentTypesList" placeholder="Document Number (If Any)" solo dense
                        v-model="documentObj.document_number" class="proposalDialog_date_field2"></v-text-field>
                    </v-col>

                    <v-col class=" py-0 px-12 mb-5" cols="12" sm="12" md="6" xl="6">
                      <p class="mb-1 font-weight-medium textFontSize grey-heading-text">Upload Document</p>
                      <v-row>
                        <v-col cols="12" class="pa-0">
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
                              <input type="file" accept="application/pdf" @change="onUploadFile" :rules="fileRules">
                            </div>
                          </div>
                          <div v-else class="dropZone-uploaded">
                            <div class="dropZone-uploaded-info">
                              <span class="dropZone-title">Added</span>
                              <button type="button" class="btn btn-primary removeFile"
                                @click="removeFile('uploadDoc')">Remove
                                File</button>
                            </div>
                          </div>
                        </v-col>
                        <v-col auto align-self="center">
                          <span v-for="(items, i) in filename_attach" :key="i" class="mx-2">
                            <v-btn color="#F9A825" small class="rounded-xl" outlined>
                              <v-icon small>mdi-file-document-outline</v-icon>{{ items }}
                            </v-btn>
                            <v-icon small color="red" style="margin-left:-10px;margin-top:-20px"
                              @click="deleteDocument(i)">fa-sharp fa-regular fa-circle-xmark</v-icon>
                          </span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="py-0 px-0 text-right" cols="12" sm="12" md="12" xl="12">
                      <v-btn elevation="0" width="150px" color="#0064D7" @click="updatedProcess()" v-if="!loading"
                        class="white--text border-radius-medium">Upload</v-btn>
                      <img src="/animated/refresh.svg" max-width="40" height="40" v-else />
                    </v-col>
                  </v-row>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </div>
    </v-dialog>
    <SnackBar :data="snackbar_data" />
  </div>
</template>
<script>
import proposalDocument from "./proposalDocument.vue"
import agreementDocument from "./agreementDocument.vue"
import employementContract from "./employementContractDocument.vue"
import workOrder from "./workOrderDocument.vue"
import eosb from "./eosb.vue"
import SnackBar from '~/components/utils/SnackBar.vue'
export default {
  components: {
    proposalDocument, agreementDocument, employementContract, workOrder, eosb, SnackBar
  },
  props: {
    proposalDialog: Boolean,
    documentID: String,
    foreign_id: String,
    identifier: String,
    module: String,
    current_action: Object,
    // for uploading documents
    process: Object,
    processIndex: Number,
    actionIndex: Number,
    user_id: String
  },
  data() {
    return {
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      loading: false,
      form: "",
      selectedDocument: {},
      proposal_creation: {},
      generateDocument: true,


      selectedAttachments: [],
      onBoardingDetails: {},
      documentTypesList: [],
      documentObj: {
        documents: [],
        type: '',
        identifier: '',
        foreign_id: '',
        doc_status: '',
        expiry: '',
        module: this.module,
      },
      documentStatusList: [],
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      loading: false,
      attachFiles: {
        uploadDoc: {},
        ecard: {}
      },
      main_rule: [(v) => !!v || 'This filed is required'],
      fileRules: [
        (v) => !!v || 'File is required',
        (v) => (v && v.size > 0) || 'File is required',
      ],

      deleteDialog: false,
      selectedItem: {},

      employee_documents_headers: [
        { text: 'Document', value: 'icon', align: 'center' },
        { text: 'Type', value: 'type', align: 'start' },
        { text: 'Document Number', value: 'document_number', align: 'start' },
        { text: 'issuance Date', value: 'issuance_date', align: 'start' },
        { text: 'Expiry Date', value: 'expiry_date', align: 'start' },
        { text: 'Expiry Status', value: 'status', align: 'start' },
        { text: 'Action', value: 'action', align: 'start' },
      ],

    }
  },
  async mounted() {
    console.log(this.current_action, this.actionIndex, this.processIndex, "Current")

    this.getDocumentsTypeList()
    this.getDocumentStatusList()
    await this.getDocumentDetails()
  },
  methods: {
    updateDocument(event, form) {
      this.selectedDocument = event
      this.form = form
    },
    areOnboardingValuesPresent(obj) {
      return Object.values(obj).every(value => value !== '');
    },

    async updateContractDocument(event, form) {
      this.form = form
      console.log("The current employment values are", event.employment);

      if (!this.areOnboardingValuesPresent(event.employment)){
        this.onBoardingDetails = {
          onboardingDetails: {
            assigned_hr_specialist: event.employment.hr_specialist?.id || '',
            assigned_escalation_manager: event.employment.escalation_manager?.id || '',
            assigned_support_agent: event.employment.support_agent?.id || '',
            assigned_insurance_agent: event.employment.insurance_agent?._id || '',
            assigned_pro: event.employment.assigned_pro?.id || ''
          }
        };

      }
    },
    async submitOnboardingDetails(data) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token);

      const filteredData = this.filterEmptyValues(data.onboardingDetails);
      try {
        let response = await this.$axios.$patch(`/users/${this.user_id}`, { onboardingDetails: filteredData }, { headers: { Authorization: AuthStr } });
        console.log('What is the response for updating an employee?', response);
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },
    filterEmptyValues(obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== '')
      );
    },
    async getDocumentDetails() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true
      await this.$axios.$post(`/documenttemplateclone/get/id/${this.documentID}`, {}, { headers: { Authorization: AuthStr } })
        .then(response => {
          this.selectedDocument = response
          this.loading = false
        })
        .catch(e => console.log(e))
    },
    async createDocument() {
      if (this.form.validate()) {
        if (Object.keys(this.onBoardingDetails).length > 0) {
          await this.submitOnboardingDetails(this.onBoardingDetails);
        }
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.loading = true
        this.selectedDocument.document_details = {
          uploadable_document: this.current_action.uploadable_document,
          processIndex: this.processIndex,
          actionIndex: this.actionIndex
        }
        console.log(this.selectedDocument)
        await this.$axios.$post(`/documenttemplateclone/updatevalue/${this.documentID}`, this.selectedDocument, { headers: { Authorization: AuthStr } })
          .then(response => {
            this.loading = false
            this.successfull()
          })
          .catch(e => console.log(e))
      }
      else {
        this.snackbar_data = {
          snackbar: true,
          text: 'Looks like you missed something. Please fill in all required fields with valid information.',
          color: 'error',
          icon: 'check',
          timeout: 2000,
        }
      }
    },
    close() {
      this.$emit('close')
    },
    successfull() {
      this.$emit('successfull')
    },

    //upload Document
    async getDocumentsTypeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/documenttypes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentTypesList = _.orderBy(response, ['name'])
          // this.documentObj.type = this.documentTypesList.filter(a => a.name == this.selectedDocument.name.replace(/Create/g, '').trim()).length > 0 ? this.documentTypesList.filter(a => a.name == this.selectedDocument.name.replace(/Create/g, '').trim())[0].id : ""
        })
    },
    async getDocumentStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(`/documents/list/status`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentStatusList = response
        })
    },
    async openAttachments(process) {
      this.selectedStage = process
      this.attachmentsDialog = true
      this.selectedAttachments = []
      this.documentsLoading = true
      this.newDocument = false
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let obj = {
        "foreign_id": this.processsDetails[0]._id,
        "identifier": process._id
      }
      let documentsList = await this.$axios.$post('/documents/identifier/foreignid', obj, { headers: { Authorization: AuthStr } })
      if (documentsList.length > 0) {
        documentsList.forEach(item => {
          this.selectedAttachments.push(item)
        });
      }
      this.documentsLoading = false
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
      // if(this.uploadFiles) {
      //   this.attachFile();
      // }
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

              let upload_meta = {
                file: this.attachFiles[key][i],
                filename: this.attachFiles[key][i].name
              }
              this.documentObj.documents.push(upload_meta)

            } else {
              console.log('null')
            }
          }
        }
        this.removeFile(key)
      }
      this.uploading = false
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
    },
    createFile(e, file, type) {
      if (file.size > 26214400) {
        alert('please check file size is not more than 25 MB.')
        this.dragging = false;
        return;
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file;
      this.dragging = false;
    },
    onUploadFiles(event) {
      this.uploadFiles = event;
      this.dragging = false;
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    async updatedProcess() {
      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      if (this.$refs.edit_category.validate()) {

        this.loading = true
        this.documentObj.identifier = this.identifier
        this.documentObj.foreign_id = this.foreign_id
        await this.attachFile()
        if (this.documentObj.documents == null || this.documentObj.documents.length <= 0) {
          this.loading = false
          this.snackbar_data = {
            snackbar: true,
            text: 'Attachment is Mandatory',
            color: 'error',
            icon: 'check',
            timeout: 2000,
          }
        }
        else {

          const fd = new FormData()
          for (let index = 0; index < this.documentObj.documents.length; index++) {
            const element = this.documentObj.documents[index];
            fd.append('documents', element.file, element.filename)
          }

          // Find document type and use its _id for the type field
          let documentTypeId = this.process?.processes[this.processIndex]?.actions[this.actionIndex].uploadable_document

          // If uploadable_document is not available, try to find the appropriate document type
          if (!documentTypeId && this.documentTypesList && this.documentTypesList.length > 0) {
            // Get current stage and action for more precise checking
            const currentStage = this.process?.processes[this.processIndex]
            const currentAction = currentStage?.actions[this.actionIndex]
            const stageName = currentStage?.stage_name
            const actionType = currentAction?.action_type

            // Check if this is an EOSB document (for offboarding module)
            // Specifically check for "Create EOSB" stage with "document" action type
            const isEOSBDocument =
              this.module === 'offboardings' ||
              (this.selectedDocument && this.selectedDocument.name === 'End of Service Settlement') ||
              (stageName === 'Create EOSB' && actionType === 'document')

            if (isEOSBDocument) {
              // Find EOSB document type from the list
              const eosbDocumentType = this.documentTypesList.find(doc =>
                doc.name === 'EOSB' || doc.name === 'End of Service Settlement'
              )
              if (eosbDocumentType) {
                // Use _id or id (depending on how the API returns it)
                documentTypeId = eosbDocumentType._id || eosbDocumentType.id
              }
            }
            // For other modules (onboarding, leads, etc.), the uploadable_document should be set
            // If it's still not available, we don't set a default to avoid breaking existing flows
          }

          fd.append('type', documentTypeId)
          fd.append('identifier', this.documentObj.identifier)
          fd.append('foreign_id', this.documentObj.foreign_id)
          fd.append('doc_status', this.documentObj.doc_status)
          fd.append('expiry', this.documentObj.expiry)
          fd.append('module', this.documentObj.module)

          await this.$axios.$post(`/documents`, fd, { headers: { Authorization: AuthStr } })
            .then(async (response) => {
              this.snack = true
              this.snackColor = 'success'
              this.snackText = 'Successfully Added New Document.'

              if (this.process?.processes[this.processIndex]?.actions[this.actionIndex]) {
                let obj = {
                  "id": this.process._id,
                  "module": this.module,
                  "processIndex": this.processIndex,
                  "actionIndex": this.actionIndex,
                  "document_id": response[0].id
                }
                await this.$axios.$put(`/generic/process/action/document`, obj, { headers: { Authorization: AuthStr } })
                  .then((response) => {
                    this.loading = false
                    this.successfull()

                  });
              }
              else {
                this.loading = false
                console.log(this.process)
                this.successfull()
              }

            })

        }
      }
    },
    deleteDocument(index) {
      this.filename_attach.splice(index, 1)
    },
    deleteAttachment(item) {
      this.selectedItem = item
      this.deleteDialog = true

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
            this.getDocumentsById(this.employeeDetails[0]._id)
            this.deleteDialog = false
            this.selectedItem = {}
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
    getDocumentType(id) {
      let type = this.documentTypesList.filter(a => a.id == id)
      if (type.length > 0) {
        return type[0].name
      } else {
        return ""
      }
    },
  }
}
</script>
