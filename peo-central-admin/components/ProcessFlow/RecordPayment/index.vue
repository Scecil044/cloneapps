<template>
    <!-- Create Onboarding  Dialog -->
    <v-dialog id="custom_dialog" v-model="dialogPayment" width="45vw" height="100vh" content-class="proposal_dialog">
        <v-card color="card_bg" id="card">
            <v-card-title id="card-title">
                <v-row>
                    <v-col cols="12" class="ma-0 pa-0">
                        <div class="d-flex align-center justify-space-between">
                            <h4 class="text--text">Record Payment</h4>
                            <div class="d-flex align-center justify-end">
                                <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" :disabled="loading"
                                    @click="close"><span class="">Cancel</span></v-btn>
                                <v-btn v-if="currentPreviewAction?.uploaded_document_id" class="tall__btn pl-6 pr-6"
                                    color="primary" :disabled="loading" @click="successfull">Move Forward</v-btn>
                                <v-btn v-else class="tall__btn pl-6 pr-6" color="primary" :disabled="loading"
                                    @click="generatePayment">Create</v-btn>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text id="card-text2" style="max-height: 10vh !important" class="dl__l overflow-y-auto"
                v-if="currentPreviewAction?.uploaded_document_id">
                Cannot record payment for uploaded invoice
            </v-card-text>
            <v-card-text v-else id="card-text2" style="max-height: 10vh !important" class="dl__l overflow-y-auto">
                <v-form ref="paymentForm">
                    <v-row class="pt-0">
                        <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer label="Invoice Number" :mandatory="true">
                                <div slot="input">
                                    <v-text-field class="inputField" placeholder="Invoice Number"
                                        v-model="paymentDetails.invoice_number" solo dense :rules="genericRule" />
                                </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer label="Ref No." :mandatory="true">
                                <div slot="input">
                                    <v-text-field class="inputField" v-model="paymentDetails.invoice_ref_number"
                                        placeholder="Enter Reference Number" solo dense :rules="genericRule" />
                                </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="6" class="py-0 pl-0">
                            <CustomInputContainer label="Payment Date" :mandatory="true">
                                <div slot="input">
                                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                                        transition="scale-transition" offset-y min-width="auto">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field class="inputField" v-model="paymentDetails.payment_date"
                                                :rules="genericRule" placeholder="DD/MM/YYYY" outlined dense readonly
                                                v-bind="attrs" v-on="on" />
                                        </template>
                                        <v-date-picker v-model="paymentDetails.payment_date"
                                            @input="date_menu = false" />
                                    </v-menu>
                                </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer label="Payment Method">
                                <div slot="input">
                                    <v-select v-model="paymentDetails.payment_method" :items="paymentMethodList"
                                        item-text="name" item-value="id" placeholder="Enter Payment Method" outlined
                                        dense class="inputField" :rules="genericRule" />
                                </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="6" class="pl-0 pb-0">
                            <CustomInputContainer label="Amount Received">
                                <div slot="input">
                                    <v-text-field class="inputField" :rules="genericRule"
                                        v-model="paymentDetails.amount_recieved" placeholder="Enter Amount" solo
                                        dense />
                                </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="6" class="pl-0 pb-0">
                            <CustomInputContainer label="Bank Charges">
                                <div slot="input">
                                    <v-text-field class="inputField" :rules="genericRule"
                                        v-model="paymentDetails.bank_charge" placeholder="0.00" solo
                                        dense type="number" step="0.01" min="0" />
                                </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="12" class="pl-0 pb-0">
                            <CustomInputContainer label="Attachments">
                                <div slot="input">
                                    <div class="pt-2" v-if="!uploadFile">
                                        <div :class="['dropZone', dragging ? 'dropZone-over' : '']"
                                            @dragenter="dragging = true" @dragleave="dragging = false">
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
                                            <button type="button" class="btn btn-primary removeFile"
                                                @click="removeFile('uploadDoc')">Remove
                                                File</button>
                                        </div>
                                    </div>
                                </div>
                            </CustomInputContainer>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
export default {
    components: {
        CustomInputContainer
    },
    props: {
        module: String,
        foreign_id: String,
        identifier: String,
        currentPreviewAction: Object
    },
    data() {
        return {
            fileRules: [
                (v) => !!v || 'File is required',
                (v) => (v && v.size > 0) || 'File is required',
            ],
            genericRule: [(v) => !!v || 'This field is Required'],
            paymentDetails: {
                bank_charge: 0
            },
            date_menu: false,
            loading: false,
            dialogPayment: true,
            paymentMethodList: ['Cash', 'Cheque', 'Credit Card', 'Direct Debit'],

            //upload Documents

            uploadDocumentDialog: false,
            uploadFile: '',
            dragging: false,
            paymentAmount: 0,
            file: '',
            uploadFiles: '',
            filename_attach: [],
            link_url: '',
            link_filename: '',
            attachFiles: {
                uploadDoc: {},
            },
        }
    },
    async mounted() {
        await this.getInvoiceDetails()
    },
    methods: {
        async generatePayment() {
            if (this.$refs.paymentForm.validate()) {
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                this.loading = true
                let obj = {
                    "customer": this.paymentDetails.customer,
                    "invoice": this.paymentDetails.invoice_id,
                    "amount": this.paymentDetails.amount_recieved,
                    "bank_charge": Number(this.paymentDetails.bank_charge || 0),
                    "payment_date": this.paymentDetails.payment_date,
                    "payment_mode": this.paymentDetails.payment_method,
                    "reference": this.paymentDetails.invoice_ref_number,
                    "invoice_number": this.paymentDetails.invoice_number,
                }
                await this.$axios.$post(`/invoice/record/payment`, obj, { headers: { Authorization: AuthStr } })
                    .then(response => {
                        this.successfull()
                    })
                    .catch(e => console.log(e))
                this.loading = false
            }
            else {
                this.snackbar_data = {
                    snackbar: true,
                    text: 'Fill all required Data',
                    color: 'error',
                    icon: 'check',
                    timeout: 2000,
                }

            }
        },
        async getInvoiceDetails() {
            if (this.currentPreviewAction?.uploaded_document_id) {
                this.loading = false

            } else {

                let obj = {
                    "module": this.module,
                    "id": this.foreign_id,
                    "identifier": this.identifier
                }
                // console.log()
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                this.loading = true
                await this.$axios.$post(`generic/process/getInvoiceDetails`, obj, { headers: { Authorization: AuthStr } })
                    .then(response => {
                        this.paymentAmount = response.total
                        this.paymentDetails.invoice_number = response.invoice_number
                        this.paymentDetails.customer = response.customer
                        this.paymentDetails.invoice_id = response.id
                        this.paymentDetails.amount_recieved = response.total
                    })
                    .catch(e => console.log(e))
                this.loading = false
            }
        },
        close() {
            this.$emit('close')
        },
        successfull() {
            this.$emit('successfull')
        },

        //upload Documents
        onChange(e, type) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) {
                this.dragging = false;
                return;
            }
            this.createFile(e, files, type);
        },
        onUploadFile(event) {
            this.onChange(event, 'uploadDoc')
            this.attachFiles.uploadDoc = this.uploadFiles
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
        removeFile(val) {
            if (val == 'uploadDoc') this.uploadFile = '';
        },
    },
    computed: {
    }
}
</script>
