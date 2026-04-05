<template>
  <div>
    <v-row justify="center">
      <v-dialog v-model="dialog_add_category" persistent max-width="1000">
        <v-card>
          <v-card-title dark color="primary">
            <span class="darkBlue-heading-text subHeadingFontSize">{{
              modalTitle
            }}</span>
            <v-spacer></v-spacer>
            <v-img @click="close()" src="/dashboard/close.svg" style="cursor: pointer" justify-self="end" max-width="25"
              height="auto" contain></v-img>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text v-if="!pageLoading">
            <v-form class="pb-8" ref="edit_category">
              <v-row class="pt-2 scrollDark" :style="$vuetify.breakpoint.md || $vuetify.breakpoint.lg
                ? 'max-height:300px'
                : 'max-height:460px'
                ">
                <template v-if="identifier == 'MOL Pre Approval'">
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Temporary Work Permit Number
                    </p>
                    <v-text-field placeholder="Work Permit Number" solo dense class="proposalDialog_date_field2"
                      v-model="documentObj.work_permit_number" s></v-text-field>
                  </v-col>
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Mol WPS Number
                    </p>
                    <v-text-field placeholder="Mol WPS Number" solo dense class="proposalDialog_date_field2"
                      v-model="documentObj.mol_wps_number" s></v-text-field>
                  </v-col>
                </template>
                <!-- <template v-else-if="
                  identifier == 'MOL Approval' && !labour_card_not_found && Object.keys(labourCardDoc).length
                ">
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Labour Card Number
                    </p>
                    <v-text-field placeholder="Labour Card Number" solo dense class="proposalDialog_date_field2"
                      v-model="documentObj.labour_card_number" s></v-text-field>
                  </v-col>
                </template> -->
                <template v-else>
                  <v-col v-if="labour_card_not_found" class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Document Type
                    </p>
                    <v-text-field placeholder="Document Type" solo dense class="proposalDialog_date_field2"
                      v-model="singleDocumentType.name" readonly></v-text-field>
                  </v-col>
                  <v-col v-else class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Document Type
                    </p>
                    <v-autocomplete :items="documentTypesList" placeholder="Select Type" item-text="name"
                      item-value="id" solo dense v-model="documentObj.type" class="proposalDialog_date_field2"
                      :rules="identifier == 'MOL Approval' ? [] :main_rule" append-icon="fa-chevron-down">
                    </v-autocomplete>
                  </v-col>
                  <v-col v-if="identifier == 'MOL Offer Letter'" class="py-0 px-12 mb-5" cols="12" sm="12" md="4"
                    xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Visa Application Platform
                    </p>
                    <v-autocomplete :items="visApplicationPlatforms" placeholder="Select Platform" solo dense
                      v-model="documentObj.visa_application_platform" class="proposalDialog_date_field2"
                      :rules="main_rule" append-icon="fa-chevron-down">
                    </v-autocomplete>
                  </v-col>
                  <!-- <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Select Modules</p>
                                    <v-select
                                        :items="[{ key: 'Employees', value: 'users' }, { key: 'Employers', value: 'companies' }]"
                                        item-text="key" item-value="value" placeholder="Select Modules" solo dense
                                        v-model="documentObj.module" class="proposalDialog_date_field2"
                                        :readonly="readonly_module" append-icon="fa-chevron-down"></v-select>
                                </v-col> -->
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4" v-if="documentObj.module == 'users'">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Select Employees
                    </p>
                    <v-autocomplete :items="employees" placeholder="Select Employee" item-text="first_name"
                      item-value="_id" solo dense v-model="documentObj.foreign_id" :readonly="readonly_foreign_id"
                      class="proposalDialog_date_field2" append-icon="fa-chevron-down"></v-autocomplete>
                  </v-col>
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4"
                    v-if="documentObj.module == 'companies'">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Select Employers
                    </p>
                    <v-autocomplete :items="employers" placeholder="Select Employer" solo dense
                      :readonly="readonly_foreign_id" item-text="company_name" item-value="_id"
                      class="proposalDialog_date_field2" v-model="documentObj.foreign_id"
                      append-icon="fa-chevron-down"></v-autocomplete>
                  </v-col>
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Select Document Status
                    </p>
                    <v-select :items="documentStatusList" placeholder="Select Document Status" solo dense
                      class="proposalDialog_date_field2" v-model="documentObj.doc_status"
                      append-icon="fa-chevron-down"></v-select>
                  </v-col>
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Document Number
                    </p>
                    <v-text-field placeholder="Document Number" solo dense class="proposalDialog_date_field2"
                      v-model="documentObj.document_number" s></v-text-field>
                  </v-col>
                  <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" xl="4">
                    <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                      Select Expiry Date
                    </p>
                    <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40"
                      transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="documentObj.expiry" placeholder="mm/dd/yy"
                          class="proposalDialog_date_field3" solo dense readonly v-bind="attrs" v-on="on">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="documentObj.expiry" @input="exp_date_menu = false" />
                    </v-menu>
                  </v-col>
                  <v-col class="tw-py-4 px-12 mb-5" cols="12" sm="12" md="12" xl="12">
                    <v-row>
                        <v-col auto align-self="center" v-if="type == 'edit'">
                        <span v-for="(items, i) in documentObj.documents" :key="i" class="mx-2">
                          <v-btn color="#F9A825" small class="rounded-xl" outlined @click="openDocument(items)">
                            <v-icon small>mdi-file-document-outline</v-icon>{{ items.filename | truncateText(30, '..')
                            }}
                          </v-btn>
                          <v-icon small color="red" style="margin-left: -17px; margin-top: -20px"
                            @click="deleteDocument(i)">fa-sharp
                            fa-regular fa-circle-xmark</v-icon>
                        </span>
                      </v-col>
                        <v-col auto align-self="center" v-if="type == 'new'">
                        <span v-for="(items, i) in documentObj.documents" :key="i" class="mx-2">
                          <v-btn color="#F9A825" small class="rounded-xl" outlined>
                            <v-icon small>mdi-file-document-outline</v-icon>{{ items.filename }}
                          </v-btn>
                          <v-icon small color="red" style="margin-left: -17px; margin-top: -20px"
                            @click="deleteDocument(i)">fa-sharp
                            fa-regular fa-circle-xmark</v-icon>
                        </span>
                      </v-col>
                      <v-col cols="12" class="pa-0">
                        <p class="mb-1 font-weight-medium textFontSize grey-heading-text">
                          Upload Document
                        </p>
                        <div class="pt-2" v-if="!uploadFile">
                          <div :class="[
                            'dropZone',
                            dragging ? 'dropZone-over' : '',
                          ]" @dragenter="dragging = true" @dragleave="dragging = false">
                            <div class="dropZone-info" @drag="onUploadFile">
                              <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
                              <span class="dropZone-title">Drop file or click to upload</span>
                              <div class="dropZone-upload-limit-info">
                                <div>maximum file size: 10 MB</div>
                              </div>
                            </div>
                            <input type="file" @change="onUploadFile" multiple />
                          </div>
                        </div>
                        <div v-else class="dropZone-uploaded">
                          <div class="dropZone-uploaded-info">
                            <span class="dropZone-title">Added</span>
                            <button type="button" class="btn btn-primary removeFile" @click="removeFile('uploadDoc')">
                              Remove File
                            </button>
                          </div>
                        </div>
                      </v-col>



                    </v-row>
                  </v-col>
                </template>
              </v-row>
              <v-row>
                <v-col class="py-0 px-0 text-right" cols="12" sm="12" md="12" xl="12">
                  <v-btn elevation="0" width="150px" color="#0064D7" @click="updatedDocument()" v-if="!loading"
                    class="white--text border-radius-medium">{{ buttonLabel }}</v-btn>
                  <img src="/animated/refresh.svg" max-width="40" height="40" v-else />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-text v-else>
            <LoaderAddDocuments />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>

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
import CalenderSvg from '@/assets/images/icons/calender.svg'
export default {
  props: [
    'type',
    'document',
    'module',
    'foreign_id',
    'identifier',
    'allowedTypes',
    'selectedVisaProcess',
    'typeName'
  ],
  components: {
    CalenderSvg,
  },
  data() {
    return {
      dialog_add_category: true,
      documentObj: {
        documents: [],
        type: '',
        identifier: '',
        foreign_id: '',
        doc_status: '',
        expiry: '',
        module: 'users',
        visa_application_platform: '',
        // these only apply for mol pre-approval stage
        work_permit_number: '',
        mol_wps_number: '',
        labour_card_number: 0,
      },
      employers: [],
      employees: [],
      visApplicationPlatforms: ['Work Bundle', 'Manual Visa Process'],
      documentTypesList: [],
      documentStatusList: [],
      limit: '10',
      page: 0,
      comPage: 0,
      main_rule: [(v) => !!v || 'This filed is required'],
      exp_date_menu: false,
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      link_url: '',
      link_filename: '',
      attachFiles: {
        uploadDoc: {},
      },
      uploading: false,
      loading: false,
      snack: false,
      snackText: '',
      snackColor: '',
      readonly_foreign_id: false,
      readonly_module: false,
      labourCardDoc: {},
      singleDocumentType: {},
      labour_card_not_found: false,
      labourCardIdentifier: 'Labour Card and Contract ',
      pageLoading: false,
    }
  },
  computed: {
    buttonLabel() {
      let label = this.type == 'edit' ? 'Update' : 'Add'
      if (this.identifier == 'MOL Pre Approval') {
        label = 'Update'
      }
      return label
    },
    modalTitle() {
      let header = this.type == 'edit' ? 'Update Document' : 'Add New Document'
      if (this.identifier == 'MOL Pre Approval') {
        header = 'Update Visa Process'
      }
      return header
    },
  },
  async mounted() {
    this.pageLoading = true
    if (this.foreign_id) {
      this.readonly_foreign_id = true
      this.documentObj.foreign_id = this.foreign_id
    }
    if (this.module) {
      this.readonly_module = true
      this.documentObj.module = this.module
    }

    if (this.documentObj.module == 'companies') {
      await this.getEmployersList()
    }

    if (this.foreign_id && this.module == 'users') {
      // documentObj.foreign_id
      if (this.foreign_id && this.userPayload) {
        this.employees = [this.userPayload]
      } else {
        await this.getEmployeesList()
      }
    }
    await Promise.all([
      this.getDocumentsTypeList(),
      this.getDocumentStatusList()
    ]);

    if (this.typeName) {
      this.documentTypesList = this.documentTypesList.filter((doc) => doc.type == this.typeName)
      this.documentObj.type = this.documentTypesList[0].id
    }

    // add the
    if (this.selectedVisaProcess) {
      this.documentObj.visa_application_platform = this.selectedVisaProcess?.visa_application_platform || ''
      this.documentObj.work_permit_number = this.selectedVisaProcess?.work_permit_number || ''
      this.documentObj.mol_wps_number = this.selectedVisaProcess?.mol_wps_number || ''
    }

    if (this.type == 'edit') {
      if (this.document.url) {
        var blobURL = await fetch(this.document.url).then((r) => r.blob())
        this.documentObj.documents.push({
          file: blobURL,
          filename:
            this.document.url.split('/')[
            this.document.url.split('/').length - 1
            ],
        })
      }
      this.documentObj.type = this.document.type
      this.documentObj.doc_status = this.document.doc_status
      this.documentObj.expiry = this.document.expiry
        ? this.document.expiry.split('T')[0]
        : ''
      this.documentObj.module = this.document.module
      this.documentObj.foreign_id = this.document.foreign_id
      this.documentObj.document_number = this.document.document_number

    }
    this.pageLoading = false
  },
  methods: {
    close() {
      this.$emit('close', false)
    },
    openDocument(url) {
      window.open(url)
    },
    getDocumentListItem(title) {
      return this.documentTypesList.find(
        (documentType) => documentType.name == title
      )
    },
    async getLaborCardDetails() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        const payload = {
          identifier: this.labourCardIdentifier,
          foreign_id: this.foreign_id,
        }
        const response = await this.$axios.$post(
          `/documents/identifier/foreignid`,
          payload,
          { headers: { Authorization: AuthStr } }
        )
        if (response.length == 0) {
          this.snack = true
          this.snackText =
            'No record found for Temporary Labour Card and Contract'
          this.snackColor = 'error'
          this.labour_card_not_found = true
          console.log('document list patch', this.documentTypesList)
          this.singleDocumentType = this.getDocumentListItem('Labour Contract')
          console.log('Labour card found ...', this.singleDocumentType)
          // this.close()
        } else {
          this.labour_card_not_found = false
          const objectResponse = response[response.length - 1]
          this.labourCardDoc = objectResponse
          this.documentObj.labour_card_number = objectResponse.document_number
        }
      } catch (error) {
        this.snack = true
        this.snackText = error.message
        this.snackColor = 'error'
      } finally {
        this.loading = false
      }
    },
    async updateLabourCardNumber() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const payload = {
          document_number: this.documentObj.labour_card_number,
        }
        const response = await this.$axios
          .$patch(`/documents/${this.labourCardDoc._id}`, payload, {
            headers: { Authorization: AuthStr },
          })

        this.snack = true
        this.snackText = 'Visa Process updated successfully'
        this.snackColor = 'success'
        this.loading = false
      }
      catch (error) {
        this.snack = true
        this.snackText = error.response.data.message
        this.snackColor = 'error'
      } finally {
        this.loading = false
      }
    },
    async updateVisaProcess() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const payload = {
        work_permit_number: this.documentObj.work_permit_number,
        mol_wps_number: this.documentObj.mol_wps_number,
      }

      await this.$axios
        .$patch(`/visaprocess/${this.foreign_id}`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.snack = true
          this.snackText = 'Visa Process updated successfully'
          this.snackColor = 'success'
          this.loading = false
        })
        .catch((error) => {
          this.snack = true
          this.snackText = error.response.data.message
          this.snackColor = 'error'
          this.loading = false
        })
    },
    async getEmployersList() {
      this.comPage++
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/companies/list/dropdown?page=${this.comPage}&limit=${10000}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          if (['isSuperAdmin'].includes(this.$store.getters.getThisUserRole)) {
            this.employers = response
          } else {
            this.employers = response.filter(
              (company) => company._id == this.$store.getters.getSelectedCompany
            )
          }
        })
    },
    async getEmployeesList() {
      this.page++
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/users/list/dropdown?page=${this.page}&limit=${10000}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.employees = response
        })
    },
    async getDocumentsTypeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$get(`/documenttypes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          if (this.allowedTypes && this.allowedTypes.length > 0) {
            this.documentTypesList = _.orderBy(
              response.filter((a) => this.allowedTypes.includes(a.type)),
              ['name']
            )
          } else {
            this.documentTypesList = _.orderBy(response, ['name'])
          }
        })
    },
    async getDocumentStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/documents/list/status`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.documentStatusList = response
        })
    },
    async onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
      if (this.uploadFiles) {
        await this.attachFile()
      }
    },
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        this.dragging = false
        return
      }
      this.createFile(e, files, type)
    },
    removeFile(val) {
      if (val == 'uploadDoc') this.uploadFile = ''
      this.filename_attach = []
    },
    createFile(e, file, type) {
      if (file.size > 26214400) {
        alert('please check file size is not more than 25 MB.')
        this.dragging = false
        return
      }
      this.onUpldFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file
      this.dragging = false
    },
    onUpldFiles(event) {
      this.uploadFiles = event
      this.dragging = false
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    async attachFile() {
      this.uploading = true
      let attach = {}

      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      // if(this.type == 'new') {
      for (var key in this.attachFiles) {
        if (!_.isEmpty(this.attachFiles[key])) {
          for (let i = 0; i < this.attachFiles[key].length; i++) {
            if (this.attachFiles[key][i].name != undefined) {
              let upload_meta = {
                file: this.attachFiles[key][i],
                filename: this.attachFiles[key][i].name,
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
    deleteDocument(index) {
      this.documentObj.documents.splice(index, 1)
    },

    async updatedDocument() {
      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      if (this.$refs.edit_category.validate()) {
        // labour_card_number
        if (this.identifier == 'MOL Pre Approval') {
          await this.updateVisaProcess()
        }
        // else if (this.identifier == 'MOL Approval' && !this.labour_card_not_found) {
        //   await this.updateLabourCardNumber()
        // }
        else if (this.type == 'new') {
          this.loading = true
          this.documentObj.identifier = this.identifier
            ? this.identifier
            : this.documentObj.module

          const fd = new FormData()
          for (
            let index = 0;
            index < this.documentObj.documents.length;
            index++
          ) {
            const element = this.documentObj.documents[index]
            fd.append('documents', element.file, element.filename)
          }

          // fd.append('documents',this.documentObj.documents)
          const docType = !this.labour_card_not_found
            ? this.documentObj.type
            : this.singleDocumentType.id
          fd.append('type', docType)
          fd.append('identifier', this.labour_card_not_found ? this.labourCardIdentifier : this.documentObj.identifier)
          fd.append('foreign_id', this.documentObj.foreign_id)
          fd.append('doc_status', this.documentObj.doc_status)
          fd.append('expiry', this.documentObj.expiry)
          fd.append('module', this.documentObj.module)
          fd.append('document_number', this.documentObj.document_number)

          if (this.identifier == 'MOL Offer Letter') {
            fd.append(
              'visa_application_platform',
              this.documentObj.visa_application_platform
            )
          }

          try {
            console.log('sending documents')
            const response = await this.$axios
              .$post(`/documents`, fd, { headers: { Authorization: AuthStr } })

            this.snack = true
            this.snackColor = 'success'
            this.snackText = 'Successfully Added New Document.'
            // update parent
            this.$emit('added-document', true)
            // this.loading = false
          } catch (error) {
            console.log('upload error: ', error.message)
            this.snack = true
            this.snackColor = 'error'
            this.snackText = 'Failed to Add New Document.'
            this.$emit('added-document', false)

            // this.loading = false
          }
          finally {
            this.loading = false
          }
        } else if (this.type == 'edit') {
          this.loading = true
          this.documentObj.identifier = this.identifier
            ? this.identifier
            : this.documentObj.module

          if (this.documentObj.documents.length > 0) {
            const fd = new FormData()
            for (
              let index = 0;
              index < this.documentObj.documents.length;
              index++
            ) {
              const element = this.documentObj.documents[index]
              element.file && element.filename != ''
                ? fd.append('documents', element.file, element.filename)
                : ''
              // fd.append('documents',this.documentObj.documents)
              fd.append('type', this.documentObj.type)
              fd.append('identifier', this.documentObj.identifier)
              fd.append('foreign_id', this.documentObj.foreign_id)
              fd.append('document_id', this.document.id)
              fd.append('doc_status', this.documentObj.doc_status)
              fd.append('expiry', this.documentObj.expiry)
              fd.append('module', this.documentObj.module)
              fd.append('document_number', this.documentObj.document_number)

              await this.$axios
                .$post(`/documents/upload/docid/foreignid`, fd, {
                  headers: { Authorization: AuthStr },
                })
                .then((response) => {
                  this.snack = true
                  this.snackColor = 'success'
                  this.snackText = 'Successfully Added New Document.'
                  this.loading = false
                })
            }
          } else {
            const fd = new FormData()
            // fd.append('documents',this.documentObj.documents)
            fd.append('type', this.document.type)
            fd.append('identifier', this.documentObj.identifier)
            fd.append('foreign_id', this.document.foreign_id)
            fd.append('document_id', this.document.id)
            fd.append('doc_status', this.documentObj.doc_status)
            fd.append('expiry', this.documentObj.expiry)
            fd.append('module', this.documentObj.module)
            fd.append('document_number', this.documentObj.document_number)

            await this.$axios
              .$post(`/documents/upload/docid/foreignid`, fd, {
                headers: { Authorization: AuthStr },
              })
              .then((response) => {
                this.snack = true
                this.snackColor = 'success'
                this.snackText = 'Successfully Added New Document.'
                this.loading = false
              })
          }
        }
        this.$emit('updated', true)
      }
    },
  },
}
</script>
<style>
.dropZone {
  width: 250px;
  height: 80px;
  padding: 20px;
  position: relative;
  border: 2px dashed #eee;
}

.dropZone:hover {
  border: 2px solid #2e94c4;
}

.dropZone:hover .dropZone-title {
  color: #1975a0;
}

.dropZone-info {
  color: #a8a8a8;
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
  background: #5c5c5c;
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
  color: #a8a8a8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>
