<template>
    <div>
        <!-- Create Onboarding  Dialog -->
        <v-dialog id="custom_dialog" v-model="dialogInvoice" width="45vw" content-class="proposal_dialog">
            <div class="dialog_proposal" style="overflow-x: hidden;" v-if="Other_VisaProcessFlag">
                <v-card color="card_bg" id="card">
                    <v-card-title id="card-title">
                        <v-row>
                            <v-col cols="12" class="ma-0 pa-0">
                                <div class="d-flex align-center justify-space-between">
                                    <h4 class="text--text">Create Invoice & Debit Note</h4>
                                    <div class="d-flex align-center justify-end">
                                        <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" :disabled="loading"
                                            @click="close"><span class="">Cancel</span></v-btn>
                                        <v-btn class="tall__btn pl-6 pr-6" color="primary" :disabled="loading"
                                            @click="createInvoice">Create</v-btn>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text id="card-text2" class="dl__l overflow-y-auto">
                        <v-form ref="form" class="pa-0 ma-0" style="display: contents !important;">
                            <v-row class="pt-0">
                                <v-col cols="4" class="pl-0 pt-6 pb-0">
                                    <CustomInputContainer label="Currency" :mandatory="true">
                                        <div slot="input">
                                            <v-select :items="paymentMethods" v-model="currentInvoice.currency"
                                                placeholder="select currency" solo dense hide-details
                                                class="proposalDialog_date_field2" v-if="paymentMethods.length >= 1"
                                                append-icon="fa-chevron-down" :rules="main_rule">
                                            </v-select>
                                            <p v-else class="error--text mb-5 mt-5">
                                                Please Select
                                            </p>
                                        </div>
                                    </CustomInputContainer>
                                </v-col>
                                <v-col cols="4" class="pl-0 pt-6 pb-0">
                                    <CustomInputContainer label="Exchange Rate" :mandatory="true">
                                        <div slot="input">
                                            <v-text-field v-model="currentInvoice.exchange_rate" hide-details
                                                placeholder="Enter rate" solo dense class="proposalDialog_date_field2"
                                                :disabled="isTextExchangeDisabled"
                                                :class="{ proposalDialog_date_field3: isTextExchangeDisabled, }"
                                                :rules="main_rule" />
                                            <v-checkbox @change="toggleTextField"
                                                v-model="currentInvoice.not_applicable_exchange_rate" color="primary"
                                                label="Not Applicable" hide-details></v-checkbox>
                                        </div>
                                    </CustomInputContainer>
                                </v-col>

                            </v-row>
                            <v-row v-for="(group, index) in invoice" :key="index" class="mr-20px">
                                <v-col cols="12" class="pl-0 pt-0 pb-0">
                                    <div class="d-flex align-center justify-space-between mt-4 mb-2">
                                        <span class="span_leadHeading">{{ group.header }}</span>
                                        <span class="span_leadHeading">TOTAL : {{ computeTotalInvoiceAmount.filter(a =>
                                            a.header == group.header)[0].sum }} AED</span>
                                    </div>
                                    <v-divider></v-divider>
                                </v-col>

                                <v-col cols="6" class="pl-0 pt-6 pb-0" v-for="(item, i) in group.items" :key="i">
                                    <CustomInputContainer :label="item.name" :mandatory="true">
                                        <div slot="input"
                                            v-if="currentInvoice.invoice[findIndex(currentInvoice.invoice, item.name)]">
                                            <v-text-field
                                                v-model="currentInvoice.invoice[findIndex(currentInvoice.invoice, item.name)].amount"
                                                hide-details placeholder="Enter Type of Visa" solo dense
                                                class="proposalDialog_date_field2" :rules="main_rule" />
                                        </div>
                                    </CustomInputContainer>
                                </v-col>
                                <v-col cols="6" class="pl-0 pt-6 pb-0 d-flex justify-center">
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on }">
                                            <v-icon v-on="on" color="primary" @click="addItem = true">mdi-plus</v-icon>
                                        </template>
                                        <span>Add Item</span><br>
                                    </v-tooltip>
                                </v-col>
                            </v-row>
                            <v-row v-for="(group, index) in debit" :key="index" class="mr-20px">
                                <v-col cols="12" class="pl-0 pt-0 pb-0">
                                    <div class="d-flex align-center justify-space-between mt-4 mb-2">
                                        <span class="span_leadHeading">{{ group.header }}</span>
                                        <span class="span_leadHeading">TOTAL : {{ computedTotalDebitamount.filter(a =>
                                            a.header ==
                                            group.header)[0].sum }} AED</span>
                                    </div>
                                    <v-divider></v-divider>
                                </v-col>

                                <v-col cols="6" class="pl-0 pt-6 pb-0" v-for="(item, i) in group.items" :key="i">
                                    <CustomInputContainer :label="item" :mandatory="true">
                                        <div slot="input">
                                            <v-text-field
                                                v-model="currentInvoice.debit[findIndex(currentInvoice.debit, item)].amount"
                                                hide-details placeholder="Enter Type of Visa" solo dense
                                                class="proposalDialog_date_field2" :rules="main_rule" />
                                        </div>
                                    </CustomInputContainer>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" class="pl-0 pt-10"
                                    style="display: flex !important; justify-content: center !important;">
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
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                                                    Document
                                                    Number (If Any)</p>
                                                <v-text-field :items="documentTypesList"
                                                    placeholder="Document Number (If Any)" solo dense
                                                    v-model="documentObj.document_number"
                                                    class="proposalDialog_date_field2"></v-text-field>
                                            </v-col>

                                            <v-col class=" py-0 px-12 mb-5" cols="12" sm="12" md="6" xl="6">
                                                <p class="mb-1 font-weight-medium textFontSize grey-heading-text">Upload
                                                    Document</p>
                                                <v-row>
                                                    <v-col cols="12" class="pa-0">
                                                        <div class="pt-2" v-if="!uploadFile">
                                                            <div :class="['dropZone', dragging ? 'dropZone-over' : '']"
                                                                @dragenter="dragging = true"
                                                                @dragleave="dragging = false">
                                                                <div class="dropZone-info" @drag="onUploadFile">
                                                                    <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
                                                                    <span class="dropZone-title">Drop file or click to
                                                                        upload</span>
                                                                    <div class="dropZone-upload-limit-info">
                                                                        <div>maximum file size: 10 MB</div>
                                                                    </div>
                                                                </div>
                                                                <input type="file" accept="application/pdf"
                                                                    @change="onUploadFile" :rules="fileRules">
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
                                                        <span v-for="(items, i) in filename_attach" :key="i"
                                                            class="mx-2">
                                                            <v-btn color="#F9A825" small class="rounded-xl" outlined>
                                                                <v-icon small>mdi-file-document-outline</v-icon>{{ items
                                                                }}
                                                            </v-btn>
                                                            <v-icon small color="red"
                                                                style="margin-left:-10px;margin-top:-20px"
                                                                @click="deleteDocument(i)">fa-sharp fa-regular
                                                                fa-circle-xmark</v-icon>
                                                        </span>
                                                    </v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="py-0 px-0 text-right" cols="12" sm="12" md="12" xl="12">
                                                <v-btn elevation="0" width="150px" color="#0064D7"
                                                    @click="updatedProcess()" v-if="!loading"
                                                    class="white--text border-radius-medium">Upload</v-btn>
                                                <img src="/animated/refresh.svg" max-width="40" height="40" v-else />
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </div>
            <div v-else>
                <v-card color="card_bg" id="card" height="100vh">
                    <v-card-title id="card-title">
                        <v-row>
                            <v-col cols="12" class="ma-0 pa-0">
                                <div class="d-flex align-center justify-space-between">
                                    <h4 class="text--text">Add /Edit Visa Process</h4>
                                    <div class="d-flex align-center justify-end">
                                        <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" :disabled="loading"
                                            @click="Other_VisaProcessFlag = true"><span class="">Back</span></v-btn>
                                        <v-btn class="tall__btn pl-6 pr-6" color="primary" :disabled="loading"
                                            @click="Other_VisaProcessFlag = true">Save</v-btn>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-text id="card-text2" class="dl__l overflow-y-auto">
                        <v-form ref="form" class="pa-0 ma-0" style="display: contents !important;">

                            <v-row class="mr-20px">
                                <v-col cols="11" class="pl-0 pt-0 pb-0">
                                    <div class="d-flex align-center justify-space-between mt-4 mb-2 font-bold">
                                        <span class="span_leadHeading font-bold">Add Other Visa Process</span>
                                    </div>
                                    <v-divider></v-divider>
                                </v-col>

                                <v-col cols="1" class="pl-0 pt-0 pb-0" style="margin-top: 25px;">
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on }">
                                            <v-icon v-on="on" color="primary"
                                                @click="AddOtherVisaProcess">mdi-plus</v-icon>
                                        </template>
                                        <span>Add Visa processing Charges</span><br>
                                    </v-tooltip>
                                </v-col>
                            </v-row>
                            <v-row v-for="(data, index) in currentInvoice.OtherVisaProcessCharges"
                                v-if="currentInvoice.OtherVisaProcessCharges.length > 0" :key="index">
                                <v-col cols="11" class="pl-0 pt-6 pb-0">
                                    <CustomInputContainer label="Type Name here" :mandatory="true">
                                        <div slot="input">
                                            <v-text-field v-model="data.name" hide-details placeholder="Enter Name here"
                                                solo dense class="proposalDialog_date_field2"
                                                :disabled="isTextExchangeDisabled"
                                                :class="{ proposalDialog_date_field3: isTextExchangeDisabled, }"
                                                :rules="main_rule" />
                                        </div>
                                    </CustomInputContainer>
                                </v-col>
                                <v-col cols="1" class="pl-0 pt-6 pb-0" style="margin-top: 30px;">
                                    <v-icon v-on="on" color="red"
                                        @click="RemoveOtherVisaProcess(index)">mdi-delete</v-icon>
                                </v-col>

                            </v-row>



                        </v-form>
                    </v-card-text>
                </v-card>
            </div>
        </v-dialog>
        <v-dialog id="custom_dialog" v-model="addItem" persistent max-width="500px">
            <v-card id="card" style="padding: 20px 30px !important">
                <v-card-title id="card-title">
                    <h4 class="text--text">Add Item</h4>
                    <v-icon small color="subtext" class="ml-5" @click="addItem = false">fa-close</v-icon>
                </v-card-title>
                <v-card-text>
                    <v-row class="pb-0">
                        <v-form ref="AddItemForm">
                            <v-col cols="6">
                                <div slot="input">
                                    Add Item Name
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="extraItem" hide-details placeholder="Enter Item Name" solo dense
                                    class="proposalDialog_date_field2" :rules="main_rule" />
                            </v-col>
                            <v-col cols="6" class=" d-flex justify-end">
                                <v-btn @click="addItemFunc()" class="unsuccessful_btn_dialog"
                                    color="primary">Confirm</v-btn>
                            </v-col>
                        </v-form>
                    </v-row>
                </v-card-text>

            </v-card>
        </v-dialog>

        <SnackBar :data="snackbar_data" />
    </div>
</template>
<script>
import SnackBar from '~/components/utils/SnackBar.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
export default {
    components: {
        CustomInputContainer, SnackBar
    },
    props: {
        invoiceElements: Object,
        module: String,
        foreign_id: String,
        identifier: String,
        selectedEmployee: Object,

        // for uploading documents
        process: Object,
        processIndex: Number,
        actionIndex: Number,
    },
    data() {
        return {
            tooltipFlag: false,
            addItem: false,
            extraItem: "",
            fileRules: [
                (v) => !!v || 'File is required',
                (v) => (v && v.size > 0) || 'File is required',
            ],
            loading: false,
            snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
            isTextExchangeDisabled: false,
            paymentMethods: ['UAE Dirham (AED)', 'Euro (EUR)', 'Indian Rupee (INR)', 'Brazilian Real (BRL)'],
            dialogInvoice: true,
            invoice: this.invoiceElements.invoice,
            debit: this.invoiceElements.debit,
            currentInvoice: {
                currency: "UAE Dirham (AED)",
                exchange_rate: 1,
                invoice: [],
                debit: [],
                OtherVisaProcessCharges: []
            },
            Other_VisaProcessFlag: true,
            email_rule: [
                (v) => !!v || 'Email is required',
                (v) => /.+@.+/.test(v) || 'E-mail must be valid',
                (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
            ],
            main_rule: [(v) => !!v || 'This filed is required'],


            // for uploading documents

            selectedAttachments: [],
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
            invoiceLoading: false,
            attachFiles: {
                uploadDoc: {},
                ecard: {}
            },
            main_rule: [(v) => !!v || 'This filed is required'],

            deleteDialog: false,
            pdfFile: '',
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
        this.getDocumentsTypeList()
        this.getDocumentStatusList()
        if (this.module == 'onboardings') {
            if (this.invoice && this.currentInvoice) {
                this.currentInvoice.invoice = []
                for (let index = 0; index < this.invoice.length; index++) {
                    const element = this.invoice[index];
                    for (let i = 0; i < element.items.length; i++) {
                        const elem = element.items[i];
                        console.log(elem, "elem")
                        this.currentInvoice.invoice.push({
                            text: elem.name,
                            amount: this.process?.upfront_costs ? this.process.upfront_costs[elem.field] : 0
                        })
                    }
                }
            }
        }
        else if (this.module == 'renewals') {
            if (this.invoice && this.currentInvoice) {
                this.currentInvoice.invoice = []
                for (let index = 0; index < this.invoice.length; index++) {
                    const element = this.invoice[index];
                    for (let i = 0; i < element.items.length; i++) {
                        const elem = element.items[i];
                        this.currentInvoice.invoice.push({
                            text: elem.name,
                            amount: this.process?.upfront_costs ? this.process.upfront_costs[elem.field] : 0
                        })
                    }
                }
            }
        }
        else if (this.module == 'offboardings') {
            if (this.invoice && this.currentInvoice) {
                this.currentInvoice.invoice = []
                for (let index = 0; index < this.invoice.length; index++) {
                    const element = this.invoice[index];
                    console.log(this.process["salary_payable.basic_salary"])
                    for (let i = 0; i < element.items.length; i++) {
                        const elem = element.items[i];
                        let primaryField = elem.field.split(".")[0]
                        let secondaryField = elem.field.split(".")[1]
                        this.currentInvoice.invoice.push({
                            text: elem.name,
                            amount: this.process[primaryField] ? this.process[primaryField][secondaryField] : 0
                        })
                    }
                }
            }
        }
    },
    methods: {
        addItemFunc() {
            if (this.$refs.AddItemForm.validate()) {
                this.invoiceLoading = true
                this.invoice[0].items.push({
                    name: this.extraItem,
                    field: this.extraItem.replace(/ /g, '_').toLowerCase()
                })
                this.currentInvoice.invoice.push({
                    text: this.extraItem,
                    amount: 0
                })
                this.extraItem = ''
                this.addItem = false
                setTimeout(() => {
                    this.invoiceLoading = false
                }, 1);
            }
        },
        AddVisaProcessCharges() {
            this.Other_VisaProcessFlag = false
        },
        RemoveOtherVisaProcess(index) {
            this.currentInvoice.OtherVisaProcessCharges.splice(index, 1)
        },
        AddOtherVisaProcess() {
            this.currentInvoice.OtherVisaProcessCharges.push({ name: '', value: '', })
        },
        async getDocumentContent(id, invoice_number) {
            this.loading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.$post(`/invoice/getpreviewpdf`, { "invoice_id": id, "userId":this.selectedEmployee?.user_id }, { headers: { Authorization: AuthStr } })
                .then(async (response) => {
                    this.pdfFile = response
                    let documentObj = {
                        url: response.url,
                        name: response.name,
                        type: this.process?.processes[this.processIndex]?.actions[this.actionIndex].uploadable_document,
                        identifier: this.identifier,
                        foreign_id: this.foreign_id,
                        doc_status: '',
                        expiry: '',
                        module: this.module,
                    }
                    await this.generateDocument(documentObj)
                })
        },
        async generateDocument(documentObj) {
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.$put(`/documents`, documentObj, { headers: { Authorization: AuthStr } })
                .then(async response => {
                    if (this.process?.processes[this.processIndex]?.actions[this.actionIndex]) {
                        let obj = {
                            "id": this.process._id,
                            "module": this.module,
                            "processIndex": this.processIndex,
                            "actionIndex": this.actionIndex,
                            "document_id": response.id
                        }
                        await this.$axios.$put(`/generic/process/action/generatedocument`, obj, { headers: { Authorization: AuthStr } })
                            .then((response) => {
                                this.loading = false
                                this.successfull()
                            });
                    }
                    else {
                        this.loading = false
                        this.successfull()
                    }
                })
                .catch(e => console.log(e))
        },
        async createInvoice() {
            console.log(this.process, "process", "this is it", this.selectedEmployee.user_id)
            if (this.$refs.form.validate()) {
                let obj = {
                    data: this.currentInvoice,
                    module: this.module,
                    id: this.foreign_id,
                    process_id: this.identifier,
                    userId: this.selectedEmployee?.user_id,
                    // visa_sponsor: this.selectedEmployee.employment.visa_sponsor_type
                }
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                this.loading = true
                console.log(obj, "OBJ")
                await this.$axios.$post(`/generic/process/createInvoice`, obj, { headers: { Authorization: AuthStr } })
                    .then(response => {
                        this.selectedDocument = response
                        this.loading = false
                        this.currentInvoice.OtherVisaProcessCharges = []
                        this.getDocumentContent(response._id, response.invoice_number)
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
        findIndex(array, value) {
            var index = array.findIndex(function (person) {
                return person.text == value
            });
            return index
        },
        close() {
            this.$emit('close')
        },
        successfull() {
            this.$emit('successfull')
        },
        toggleTextField() {
            this.currentInvoice.exchange_rate = 1
            this.isTextExchangeDisabled = !this.isTextExchangeDisabled
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
            console.log(this.uploadFiles)
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

                    fd.append('type', this.process?.processes[this.processIndex]?.actions[this.actionIndex].uploadable_document)
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
    },
    computed: {
        computeTotalInvoiceAmount() {
            function add(accumulator, a) {
                return accumulator + parseInt(a);
            }
            let sumArr = []
            if (this.invoice && this.currentInvoice) {
                let copy = _.cloneDeep(this.currentInvoice.invoice)
                for (let index = 0; index < this.invoice.length; index++) {
                    const element = this.invoice[index];
                    if (this.currentInvoice.invoice.length <= 0) {
                        for (let i = 0; i < element.items.length; i++) {
                            const elem = element.items[i];
                            this.currentInvoice.invoice.push({
                                text: elem,
                                amount: 0
                            })
                        }
                    }
                    sumArr.push(
                        {
                            header: element.header,
                            sum: this.currentInvoice.invoice.filter(item => element.items.includes(item.text)).map(elem => elem.amount).reduce(add, 0)
                        }
                    )

                }

            }
            return sumArr
        },
        computedTotalDebitamount() {

            function add(accumulator, a) {
                return accumulator + parseInt(a);
            }
            let sumArr = []
            if (this.debit && this.currentInvoice) {

                for (let index = 0; index < this.debit.length; index++) {
                    const element = this.debit[index];
                    if (this.currentInvoice.debit.length <= 0) {
                        for (let i = 0; i < element.items.length; i++) {
                            const elem = element.items[i];
                            this.currentInvoice.debit.push({
                                text: elem,
                                amount: 0
                            })
                        }
                    }
                    sumArr.push(
                        {
                            header: element.header,
                            sum: this.currentInvoice.debit.filter(item => element.items.includes(item.text)).map(elem => elem.amount).reduce(add, 0)
                        }
                    )
                }
            }
            return sumArr
        },
    }
}
</script>
