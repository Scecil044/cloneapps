<template>
    <div>
        <v-dialog id="custom_dialog" v-model="uploadDocument" persistent width="60vw">
            <v-card color="card_bg" id="card">
                <v-card-title id="card-title" class="mb-4">
                    <v-row>
                        <v-col cols="12" class="ma-0 pa-0">
                            <div class=" d-flex align-center justify-end">
                                <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" :disabled="loading"
                                    @click="close"><span class="">Cancel</span></v-btn>
                                <v-btn :disabled="isButtonDisabled" @click="successfull()"
                                    class="unsuccessful_btn_dialog" color="primary">
                                    Completed
                                    <span v-if="loading" class="ml-2">(Loading...)</span>
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text id="card-text2" style="max-height: 10vh !important" class="dl__l overflow-y-auto">
                    <v-row>
                        <v-col :cols="module == 'leads' ? 12 : 6">
                            <div class=" pa-8">
                                <h4 class="mb-8 span_col ">{{  module == 'leads' ? (isProposalStage ? 'Upload Proposal' : isServiceAgreementStage ? 'Upload Service Agreement' : 'Upload Documents') : 'Collect Documents' }}</h4>
                             
                                <!-- Custom info for Proposal stage -->
                                <div v-if="(isProposalStage || isServiceAgreementStage) && customInfo" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div class="flex items-start">
                                        <v-icon color="blue" class="mr-3 mt-1">mdi-information</v-icon>
                                        <div>
                                            <p class="text-blue-800 font-medium mb-2">Important Information</p>
                                            <p class="text-blue-700 text-sm">{{ customInfo }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div :class="['drop_Zone', dragging ? 'dropZone_over' : '']"
                                    @dragenter="dragging = true" @dragleave="dragging = false"
                                    @click="uploadDocsDialog = true"
                                    class="mb-4 d-flex align-center justify-center flex-column curser_pointer">
                                    <v-btn icon class="mr-5 " color="primary" small>
                                        <v-icon small color="primary">fa-plus</v-icon>
                                    </v-btn>
                                    <span>Add Document</span>
                                </div>
                                <div class="mt-2 d-flex flex-column  justify-start" v-for=" docs in pdfDocumentTypes"
                                    :key="docs.id">
                                    <div class="docs_upload pa-2 d-flex align-center justify-space-between  ">
                                        <div class=" d-flex align-center curser_pointer">
                                            <PdfSvg class="mr-1" v-if="docs.type == 'pdf'" />
                                            <span>{{ docs.name }}</span>
                                        </div>
                                        <CancelSvg class="curser_pointer" />
                                    </div>
                                </div>
                            </div>
                            <!-- Modern Grid Layout for Uploaded Documents -->
                            <div v-if="documentsUploaded.length > 0 && module == 'leads'" class="tw-mt-4">
                                <h6 class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-3">Uploaded Documents</h6>
                                <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-3">
                                    <div v-for="(docs, index) in documentsUploaded" :key="index"
                                         class="tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-p-3 tw-shadow-sm hover:tw-shadow-md tw-transition-shadow">
                                        <div class="tw-flex tw-items-start tw-justify-between">
                                            <div class="tw-flex-1 tw-min-w-0">
                                                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                                                    <PdfSvg class="tw-w-5 tw-h-5 tw-text-red-500" />
                                                    <span class="tw-text-sm tw-font-medium tw-text-gray-900 tw-truncate">{{ docs.name }}</span>
                                                </div>

                                                <!-- Document Type Badge -->
                                                <div class="tw-mb-2">
                                                    <span :class="getDocumentTypeBadgeClass(docs.type)" class="tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full">
                                                        {{ getDocumentTypeLabel(docs.type) }}
                                                    </span>
                                                </div>

                                                <!-- Creation Date -->
                                                <div v-if="docs.createdAt" class="tw-text-xs tw-text-gray-500">
                                                    Uploaded: {{ formatDate(docs.createdAt) }}
                                                </div>
                                                <div v-else-if="docs.created_date" class="tw-text-xs tw-text-gray-500">
                                                    Uploaded: {{ formatDate(docs.created_date) }}
                                                </div>
                                            </div>

                                            <!-- Actions -->
                                            <div class="tw-flex tw-items-center tw-gap-2 tw-ml-2">
                                                <v-btn small icon @click="openDocument(docs.url)" class="tw-text-blue-600 hover:tw-text-blue-800">
                                                    <v-icon small>mdi-eye</v-icon>
                                                </v-btn>
                                                <v-btn small icon :loading="documentsUploaded[index].loading" :disabled="documentsUploaded[index].loading" @click="removeDoc(index)" class="tw-text-red-600 hover:tw-text-red-800">
                                                    <v-icon small>mdi-delete</v-icon>
                                                </v-btn>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-col>
                        <v-col v-if="module != 'leads'" cols="6">
                            <div class="pa-8">
                                <p class="span_subtext">Required Documents for UAE Clients</p>
                                <div v-for="(item, index) in documentTypes" :key="index">
                                    <span class=" mr-2"> {{ index + 1 }} </span> <span>{{ item.name }}</span>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <v-dialog id="custom_dialog" v-model="uploadDocsDialog" persistent max-width="500px">
                <v-card id="card" style="padding: 20px 30px !important">
                    <v-card-title id="card-title">
                        <h4 class="text--text">Add Document</h4>
                        <v-icon small color="subtext" class="ml-5" v-if="!uploading"
                            @click="uploadDocsDialog = false">fa-close</v-icon>
                    </v-card-title>
                    <v-container class="ma-0 mt-6 pa-0">
                        <v-row class="pb-0">
                            <v-form ref="uploadForm">
                                <v-col cols="12" class="pl-0 py-0">
                                    <span class="sub_reg"> Document Type </span>
                                    <v-autocomplete
                                        v-model="documentObj.type"
                                        :items="documentTypes"
                                        item-text="name"
                                        item-value="id"
                                        placeholder="Search and select document type..."
                                        :rules="genericRule"
                                        solo
                                        dense
                                        class="tw-mt-2"
                                        hide-details="auto"
                                        clearable
                                        no-data-text="No document types found"
                                        :filter="filterDocumentTypes"
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="12" class="pl-0 pr-12">
                                    <CustomInputContainer label="Expiry Date" :mandatory="true">
                                        <div slot="input">
                                            <v-menu v-model="date_menu" :close-on-content-click="false"
                                                :nudge-right="40" transition="scale-transition" offset-y
                                                min-width="auto">
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field v-model="documentObj.expiry" placeholder="Enter Date"
                                                        solo class="proposalDialog_date_field2" dense hide-detail
                                                        v-bind="attrs" v-on="on" :rules="main_rule">
                                                        <template v-slot:append>
                                                            <div class="">
                                                                <CalenderSvg />
                                                            </div>
                                                        </template>
                                                    </v-text-field>
                                                </template>
                                                <v-date-picker v-model="documentObj.expiry"
                                                    @input="date_menu = false" />
                                            </v-menu>
                                        </div>
                                    </CustomInputContainer>
                                </v-col>
                                <v-col cols="auto" class="pa-0">
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
                                            <input type="file" @change="onUploadFile" :rules="fileRules">
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
                                    <span v-for="(items, i) in documentObj.documents" :key="i" class="mx-2">
                                        <v-btn @click="openDocument(items)" color="#F9A825" small class="rounded-xl"
                                            outlined>
                                            <v-icon small>mdi-file-document-outline</v-icon> {{ items.filename }}
                                        </v-btn>
                                        <v-icon small color="red" style="margin-left:-10px;margin-top:-20px"
                                            @click="deleteDocument(i)">fa-sharp
                                            fa-regular fa-circle-xmark</v-icon>
                                    </span>
                                </v-col>
                            </v-form>
                            <v-col cols="12" class="ma-0 pa-0">
                                <div class=" d-flex align-center justify-end">
                                    <v-btn :disabled="uploading" @click="notApplicable()" class="tall__btn  mr-3"
                                        outlined>Not
                                        Applicable</v-btn>
                                    <v-btn :disabled="uploading" :loading="uploading" @click="confirm()" class="unsuccessful_btn_dialog"
                                        color="primary">Confirm</v-btn>
                                </div>

                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-dialog>
            <SnackBar :data="snackbar_data" />


        </v-dialog>
    </div>
</template>
<script>
import CalenderSvg from '@/assets/images/icons/calender.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import PdfSvg from '@/assets/images/icons/pdf.svg'
import CancelSvg from '@/assets/images/icons/cancel.svg'
export default {
    components: {
        CalenderSvg, CustomInputContainer, SnackBar, CancelSvg, PdfSvg
    },
    props: {
        uploadDocuments: {
            type: Boolean,
            default: false,
        },
        requiredDocuments: {
            type: Array,
            default: () => [],
        },
        module: {
            type: String,
            default: '',
        },
        identifier: {
            type: String,
            default: '',
        },
        foreign_id: {
            type: String,
            default: '',
        },
        // New props for Proposal stage
        isProposalStage: {
            type: Boolean,
            default: false,
        },
        customInfo: {
            type: String,
            default: '',
        },
        requiredSignedProposal: {
            type: Boolean,
            default: false,
        },
        isServiceAgreementStage: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            fileRules: [
                (v) => !!v || 'File is required',
                (v) => (v && v.size > 0) || 'File is required',
            ],
            genericRule: [(v) => !!v || 'This field is Required'],
            uploading: false,
            loading: false,
            dragging: false,
            uploadDocument: this.uploadDocuments,
            uploadDocsDialog: false,
            date_menu: false,
            uploadFile: '',
            attachFiles: {
                uploadDoc: {},
            },
            filename_attach: [],
            documentObj: {
                documents: [],
                type: '',
                identifier: '',
                foreign_id: '',
                doc_status: '',
                expiry: '',
                module: '',
            },
            documentTypes: [],
            main_rule: [(v) => !!v || 'This filed is required'],
            documentsUploaded: [],
            snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
            documentTypeNames: {}, // Cache for document type names
        }
    },
    async mounted() {
        console.log('=== UPLOAD DOCUMENTS COMPONENT MOUNTED ===');
        console.log('All props received:');
        console.log('- uploadDocuments:', this.uploadDocuments);
        console.log('- requiredDocuments:', this.requiredDocuments);
        console.log('- module:', this.module);
        console.log('- identifier:', this.identifier);
        console.log('- foreign_id:', this.foreign_id);
        console.log('- isProposalStage:', this.isProposalStage);
        console.log('- isServiceAgreementStage:', this.isServiceAgreementStage);

        // Set the documentObj values from props
        this.documentObj.identifier = this.identifier;
        this.documentObj.foreign_id = this.foreign_id;
        this.documentObj.module = this.module;

        console.log('DocumentObj after setting props:');
        console.log('- identifier:', this.documentObj.identifier);
        console.log('- foreign_id:', this.documentObj.foreign_id);
        console.log('- module:', this.documentObj.module);

        await this.getDocumentList()

        // Fetch existing documents if this is for leads module
        if (this.module === 'leads' && this.foreign_id) {
            console.log('fetching documents ....')
            await this.fetchExistingDocuments()
        }


    },
    watch: {
        // Watch for changes in foreign_id prop and update documentObj
        foreign_id: {
            handler(newVal) {
                console.log('Foreign ID prop changed to:', newVal);
                this.documentObj.foreign_id = newVal;
            },
            immediate: true
        },
        // Watch for changes in identifier prop and update documentObj
        identifier: {
            handler(newVal) {
                console.log('Identifier prop changed to:', newVal);
                this.documentObj.identifier = newVal;
            },
            immediate: true
        },
        // Watch for changes in module prop and update documentObj
        module: {
            handler(newVal) {
                console.log('Module prop changed to:', newVal);
                this.documentObj.module = newVal;
            },
            immediate: true
        },
        // uploadDocuments: {
        //     handler(newVal) {
        //         console.log('UploadDocuments: uploadDocuments prop changed to:', newVal);
        //         this.uploadDocument = newVal;

        //         // Fetch existing documents when modal opens for leads
        //         if (newVal && this.module === 'leads' && this.foreign_id) {
        //             this.fetchExistingDocuments()
        //         }
        //     },
        //     immediate: true
        // },
        // uploadDocument: {
        //     handler(newVal) {
        //         console.log('UploadDocuments: uploadDocument internal changed to:', newVal);
        //         // Emit the change back to parent if it's different from prop
        //         if (newVal !== this.uploadDocuments) {
        //             this.$emit('update:uploadDocuments', newVal);
        //         }
        //     }
        // },


    },
    beforeDestroy() {
        console.log('UploadDocuments component being destroyed');
    },
    methods: {
        // Safely check if a document matches a given document type by name (case-insensitive)
        // or by ID resolved from the fetched documentTypes/documentTypeNames cache.
        matchesDocType(doc, expectedName) {
            if (!doc || !expectedName) return false;
            const nameLc = String(expectedName).toLowerCase();

            // Direct name match (common in Leads API where doc.type is a name)
            if (typeof doc.type === 'string' && String(doc.type).toLowerCase() === nameLc) return true;

            // If doc.type is an ID, try to resolve to name using local caches
            const typeId = doc.type;
            let resolvedName = '';

            // From documentTypes list
            const dt = this.documentTypes && this.documentTypes.find(t => t && (t.id === typeId || String(t.name).toLowerCase() === nameLc));
            if (dt) {
                resolvedName = dt.name;
                if (String(resolvedName).toLowerCase() === nameLc) return true;
            }

            // From cached documentTypeNames mapping (id -> name)
            if (this.documentTypeNames && this.documentTypeNames[typeId]) {
                resolvedName = this.documentTypeNames[typeId];
                if (String(resolvedName).toLowerCase() === nameLc) return true;
            }

            return false;
        },
        async removeDoc(index) {
            const doc = this.documentsUploaded[index]
            if (!doc) {
                console.warn('Document not found at index:', index)
                return
            }

            // Prevent multiple simultaneous deletions
            if (doc.loading) {
                console.warn('Document deletion already in progress')
                return
            }

            // Confirm deletion
            if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
                return
            }

            try {
                // Set loading state
                this.$set(this.documentsUploaded[index], 'loading', true)

                // Make the API call to delete the document
                await this.$axios.$delete(`/documents/${doc.id || doc._id}`)

                // Remove from local array
                this.documentsUploaded.splice(index, 1)

                // Show success message
                this.snackbar_data = {
                    snackbar: true,
                    text: 'Document deleted successfully',
                    color: 'success',
                    icon: 'check',
                    timeout: 2000,
                }

            } catch (error) {
                console.error('Error removing document:', error)

                // Show error message to user
                this.snackbar_data = {
                    snackbar: true,
                    text: 'Failed to delete document. Please try again.',
                    color: 'error',
                    icon: 'error',
                    timeout: 3000,
                }

                // Reset loading state on error
                this.$set(this.documentsUploaded[index], 'loading', false)

            }
        },
        findIndex(array, key, value) {
            var index = array.findIndex(function (element) {
                return element[key] == value
            });
            return index
        },
        notApplicable() {
            if (this.documentObj.type) {
                let index = this.findIndex(this.documentTypes, 'id', this.documentObj.type)
                this.documentTypes.splice(index, 1)
                this.uploadDocsDialog = false
            }

        },
        close() {
            console.log('UploadDocuments close method called');
            this.uploadDocument = false
            this.$emit('close')
        },
        async getDocumentList() {
            console.log('=== GET DOCUMENT LIST CALLED ===');
            console.log('Required documents prop:', this.requiredDocuments);
            console.log('Module:', this.module);
            console.log('Is proposal stage:', this.isProposalStage);

            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.loading = true

            try {
                // For proposal stage, use search to find Proposal and Signed Proposal specifically
                if (this.isProposalStage) {
                    console.log('=== PROPOSAL STAGE - SEARCHING FOR PROPOSAL TYPES ===');

                    // Search for "Proposal" to get both "Proposal" and "Signed Proposal"
                    const response = await this.$axios.$get(`/documenttypes?search=Proposal`, { headers: { Authorization: AuthStr } })
                    console.log('=== DOCUMENT TYPES SEARCH RESPONSE ===');
                    console.log('Response:', response);
                    console.log('Response length:', response.length);
                    console.log('All document names in response:', response.map(doc => doc.name));

                    // Filter to ensure we only get exact matches (case-insensitive)
                    const proposalTypes = response.filter(doc =>
                        doc.name.toLowerCase() === 'proposal' || doc.name.toLowerCase() === 'signed proposal'
                    );

                    console.log('Filtered proposal types:', proposalTypes);
                    console.log('Filtered proposal types length:', proposalTypes.length);
                    console.log('Filtered proposal type names:', proposalTypes.map(doc => doc.name));

                    // If search didn't find both types, try fetching all document types
                    if (proposalTypes.length < 2) {
                        console.log('⚠️ Search didn\'t find both types, trying to fetch all document types...');
                        const allResponse = await this.$axios.$get(`/documenttypes`, { headers: { Authorization: AuthStr } })
                        console.log('All document types response:', allResponse);
                        console.log('All document type names:', allResponse.map(doc => doc.name));

                        // Filter for Proposal and Signed Proposal from all types (case-insensitive)
                        const allProposalTypes = allResponse.filter(doc =>
                            doc.name.toLowerCase() === 'proposal' || doc.name.toLowerCase() === 'signed proposal'
                        );

                        console.log('All proposal types found:', allProposalTypes);
                        this.documentTypes = allProposalTypes;
                    } else {
                        this.documentTypes = proposalTypes;
                    }

                    // Check if both types are found (case-insensitive)
                    const hasProposal = this.documentTypes.some(doc => doc.name.toLowerCase() === 'proposal');
                    const hasSignedProposal = this.documentTypes.some(doc => doc.name.toLowerCase() === 'signed proposal');

                    console.log('Final check - Has Proposal:', hasProposal);
                    console.log('Final check - Has Signed Proposal:', hasSignedProposal);
                    console.log('Final document types array:', this.documentTypes);
                    console.log('Final document type names:', this.documentTypes.map(doc => doc.name));

                    if (!hasSignedProposal) {
                        console.warn('⚠️ Signed Proposal document type not found in API response');
                        console.warn('⚠️ This needs to be created in the backend database');
                        console.warn('⚠️ For now, the completion logic will not work properly');
                    }
                } else {
                    // For other modules, use the original logic with requiredDocuments
                    if (this.requiredDocuments && this.requiredDocuments.length > 0) {
                        const response = await this.$axios.$post(`/documenttypes/list`, { list: this.requiredDocuments }, { headers: { Authorization: AuthStr } })
                        this.documentTypes = response;
                    } else {
                        const response = await this.$axios.$get(`/documenttypes`, { headers: { Authorization: AuthStr } })
                        this.documentTypes = response;
                    }
                }

                this.loading = false
                console.log('Final document types array:', this.documentTypes);
                console.log('Available document type names:', this.documentTypes.map(doc => doc.name));
            } catch (error) {
                console.error('Error fetching document types:', error);
                this.loading = false
            } finally {
                // Ensure loading is always false
                this.loading = false
                console.log('Loading state after getDocumentList:', this.loading);
            }
        },
        async fetchExistingDocuments() {
            console.log('=== FETCH EXISTING DOCUMENTS CALLED ===');
            console.log('Module:', this.module);
            console.log('Foreign ID:', this.foreign_id);

            // Only fetch existing documents for leads module to maintain component reusability
            if (this.module !== 'leads') {
                console.log('Not leads module, skipping document fetch');
                return;
            }

            if (!this.foreign_id) {
                console.log('No foreign_id provided, skipping document fetch');
                return;
            }

            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.loading = true

            try {
                const response = await this.$axios.$get(`/documents/foreignid/${this.foreign_id}?module=${this.module}`, { headers: { Authorization: AuthStr } })
                console.log('=== EXISTING DOCUMENTS API RESPONSE ===');
                console.log('Response:', response);
                console.log('Response length:', response.length);
                if (response.length > 0) {
                    console.log('Document types in response:', response.map(doc => ({ name: doc.name, type: doc.type })));
                }
                console.log('Documents received:', response);

                if (response && Array.isArray(response)) {
                    // Filter for proposal-related documents only


                    if (this.module == 'leads') {
                         const proposalDocuments = response.filter(doc =>
                            doc.type_name === 'Proposal' || doc.type_name === 'Signed Proposal'
                        );

                        this.documentsUploaded = proposalDocuments.map(doc => ({
                            type: doc.type,
                            url: doc.url,
                            name: doc.name,
                            type: doc.type_name,
                            ref_id: doc.type,
                            expiry: doc.expiry,
                            doc_status: doc.doc_status,
                            identifier: doc.identifier,
                            foreign_id: doc.foreign_id,
                            module: doc.module,
                            id: doc._id,
                            createdAt: doc.createdAt || doc.created_date,
                            loading: false,
                        }));



                    } else {
                        this.documentsUploaded = proposalDocuments.map(doc => ({
                            type: doc.type,
                            url: doc.url,
                            name: doc.name,
                            expiry: doc.expiry,
                            doc_status: doc.doc_status,
                            identifier: doc.identifier,
                            foreign_id: doc.foreign_id,
                            module: doc.module,
                            id: doc._id,
                            createdAt: doc.createdAt || doc.created_date,
                            loading: false,
                        }));

                    }


                    console.log('Filtered proposal documents:', this.documentsUploaded);

                    // Fetch document type names for better display
                    await this.fetchDocumentTypeNames();
                } else {
                    console.log('No documents found or invalid response format');
                    this.documentsUploaded = [];
                }
            } catch (error) {
                console.error('Error fetching existing documents:', error);
                // Don't break the component if document fetch fails
                this.documentsUploaded = [];
            } finally {
                this.loading = false
                console.log('Loading state after fetchExistingDocuments:', this.loading);
            }
        },
        // Fetch document type names for better display
        async fetchDocumentTypeNames() {
            const AuthStr = 'Bearer '.concat(this.$store.state.token)

            // Get all document types once and cache them
            if (Object.keys(this.documentTypeNames).length === 0) {
                try {
                    const response = await this.$axios.$get(`/documenttypes`, { headers: { Authorization: AuthStr } })

                    // Create a mapping of type IDs to names
                    response.forEach(doc => {
                        this.documentTypeNames[doc.id] = doc.name;
                    });

                    console.log('Document type names cached:', this.documentTypeNames);
                } catch (error) {
                    console.error('Error fetching document types for caching:', error);
                }
            }

            // Now we can use the cached names for all documents
            for (const doc of this.documentsUploaded) {
                if (doc.type && !this.documentTypeNames[doc.type]) {
                    // Fallback: if not in cache, use the type as is
                    this.documentTypeNames[doc.type] = doc.type;
                }
            }
        },
        confirm() {
            if (this.$refs.uploadForm.validate()) {
                this.documentObj.doc_status = new Date(this.documentObj.expiry) >= new Date() ? 'valid' : 'expired'
                this.addDocument()
            } else {
                this.snackbar_data = {
                    snackbar: true,
                    text: 'Fill all required Data',
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
            console.log('UploadDocuments successfull method called - document upload completed');
            this.$emit('successfull')
        },





        //upload Support Functions
        async addDocument() {
            try {

                this.uploading = true
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                this.documentObj.identifier = this.documentObj.module

                const fd = new FormData()
                for (let index = 0; index < this.documentObj.documents.length; index++) {
                    const element = this.documentObj.documents[index];
                    fd.append('documents', element.file, element.filename)
                }

                // fd.append('documents',this.documentObj.documents)
                fd.append('type', this.documentObj.type)
                fd.append('identifier', this.documentObj.identifier)
                fd.append('foreign_id', this.documentObj.foreign_id)
                fd.append('doc_status', this.documentObj.doc_status)
                fd.append('expiry', this.documentObj.expiry)
                fd.append('module', this.documentObj.module)

                // Debug logging
                console.log('=== DOCUMENT UPLOAD PAYLOAD ===');
                console.log('Type:', this.documentObj.type);
                console.log('Identifier:', this.documentObj.identifier);
                console.log('Foreign ID:', this.documentObj.foreign_id);
                console.log('Module:', this.documentObj.module);
                console.log('Doc Status:', this.documentObj.doc_status);
                console.log('Expiry:', this.documentObj.expiry);

                await this.$axios.$post(`/documents`, fd, { headers: { Authorization: AuthStr } })
                    .then((response) => {
                        console.log(response)
                        for (let index = 0; index < response.length; index++) {
                            const element = response[index];
                            this.documentsUploaded.push({ ...element, type: element.type, ref_id: element.type_id, loading: false, })
                        }
                        console.log(this.documentsUploaded)
                        this.uploadDocsDialog = false
                        this.snackbar_data = {
                            snackbar: true,
                            text: 'Your File Has Uploaded Successfully',
                            color: 'success',
                            icon: 'check',
                            timeout: 2000,
                        }
                        this.documentObj = {
                            documents: [],
                            type: '',
                            identifier: this.identifier,
                            foreign_id: this.foreign_id,
                            doc_status: '',
                            expiry: '',
                            module: this.module,
                        }
                    })
            }catch(error) {
                console.error('Error uploading document:', error);
                this.snackbar_data = {
                    snackbar: true,
                    text: 'Error uploading document. Please try again.',
                    color: 'error',
                    icon: 'error',
                    timeout: 3000,
                }
            } finally {
                this.uploading = false
            }
        },
        async attachFile() {
            let attach = {}

            this.page = 1;
            const AuthStr = 'Bearer '.concat(this.$store.state.token)

            // if(this.type == 'new') {
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
                        }
                    }
                }
                this.removeFile(key)
            }
        },
        onChange(e, type) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) {
                this.dragging = false;
                return;
            }
            this.createFile(e, files, type);
        },
        createFile(e, file, type) {
            if (file.size > 10000000) {
                alert('please check file size is not more than 10 MB.')
                this.dragging = false;
                return;
            }
            this.onUpldFiles(file)
            if (type == 'uploadDoc') this.uploadFile = file;
            this.dragging = false;

        },
        onUpldFiles(event) {
            this.uploadFiles = event;
            this.dragging = false;
            for (let i = 0; i < this.uploadFiles.length; i++) {
                this.filename_attach.push(event[i].name)
            }
        },
        removeFile(val) {
            if (val == 'uploadDoc') this.uploadFile = '';
        },
        onUploadFile(event) {
            this.onChange(event, 'uploadDoc')
            this.attachFiles.uploadDoc = this.uploadFiles
            if (this.uploadFiles) {
                this.attachFile();
            }
        },
        deleteDocument(index) {
            this.documentObj.documents.splice(index, 1)
        },
        openDocument(url) {
            window.open(url)
        },
        // Helper method to get Signed Proposal document type ID
        getSignedProposalTypeId() {
            // First try to find by name in the fetched document types
            const signedProposalType = this.documentTypes.find(doc => doc.name === 'Signed Proposal');
            if (signedProposalType) {
                return signedProposalType.id;
            }

            // Fallback to hardcoded ID if not found in fetched types
            return '68a47396aa3b27699c836c1b';
        },
        // Helper method to format dates
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                // Use moment for better formatting
                const moment = require('moment');
                return moment(dateString).format('MMM DD, YYYY, h:mm A');
            } catch (error) {
                // Fallback to native date formatting
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (fallbackError) {
                    return dateString;
                }
            }
        },
        // Helper method to get document type label
        getDocumentTypeLabel(docType) {
            // Use the cached document type name if available
            if (docType && this.documentTypeNames[docType]) {
                return this.documentTypeNames[docType];
            }

            // Fallback to the old logic
            if (docType === 'Proposal') return 'Proposal';
            if (docType === 'Signed Proposal') return 'Signed Proposal';
            if (docType === 'Service Agreement') return 'Service Agreement';
            if (docType === 'Signed Service Agreement') return 'Signed Service Agreement';
            return docType || 'Document';
        },
        // Helper method to get document type badge styling
        getDocumentTypeBadgeClass(docType) {
            // Get the actual document type name from cache
            const typeName = this.documentTypeNames[docType] || docType;

            if (typeName === 'Proposal') {
                return 'tw-bg-blue-100 tw-text-blue-800';
            } else if (typeName === 'Signed Proposal') {
                return 'tw-bg-green-100 tw-text-green-800';
            } else if (typeName === 'Service Agreement') {
                return 'tw-bg-purple-100 tw-text-purple-800';
            } else if (typeName === 'Signed Service Agreement') {
                return 'tw-bg-orange-100 tw-text-orange-800';
            } else {
                return 'tw-bg-gray-100 tw-text-gray-800';
            }
        },
        // Custom filter for document types search
        filterDocumentTypes(item, queryText, itemText) {
            if (!queryText) return true;

            const searchText = queryText.toLowerCase();
            const itemName = itemText.toLowerCase();

            // Search by document name
            if (itemName.includes(searchText)) return true;

            // Also search by document ID if it's a string
            if (item.id && typeof item.id === 'string' && item.id.toLowerCase().includes(searchText)) {
                return true;
            }

            return false;
        },
        ////////////////////////////////
    },
    computed: {
        allDocumentsPresent() {
            let checkSubset = (parentArray, subsetArray) => {
                return subsetArray.every((el) => {
                    return parentArray.includes(el)
                })
            }

            // Leads-specific behavior: For Proposal Sent stage, consider completion when
            // a Proposal (or Signed Proposal) exists. If requiredSignedProposal=true, require Signed Proposal.
            // This is resilient to API returning names or IDs for doc.type.
            if (this.module === 'leads') {
                const hasProposal = this.documentsUploaded.some(doc => this.matchesDocType(doc, 'Proposal'));
                const hasSignedProposal = this.documentsUploaded.some(doc => this.matchesDocType(doc, 'Signed Proposal'));
                const hasServiceAgreement = this.documentsUploaded.some(doc => this.matchesDocType(doc, 'Service Agreement'));
                const hasSignedServiceAgreement = this.documentsUploaded.some(doc => this.matchesDocType(doc, 'Signed Service Agreement'));

                // Check if we're in Service Agreement stage
                if (this.isServiceAgreementStage) {
                    if (this.requiredSignedProposal) {
                        console.log('Service Agreement stage check: requiring Signed Service Agreement. Found:', hasSignedServiceAgreement);
                        return hasSignedServiceAgreement;
                    }
                    console.log('Service Agreement stage check: Service Agreement or Signed Service Agreement. Found Service Agreement:', hasServiceAgreement, 'Signed:', hasSignedServiceAgreement);
                    return hasServiceAgreement || hasSignedServiceAgreement;
                }

                // Check if we're in Proposal stage
                if (this.isProposalStage) {
                    if (this.requiredSignedProposal) {
                        console.log('Proposal stage check: requiring Signed Proposal. Found:', hasSignedProposal);
                        return hasSignedProposal;
                    }
                    console.log('Proposal stage check: Proposal or Signed Proposal. Found Proposal:', hasProposal, 'Signed:', hasSignedProposal);
                    return hasProposal || hasSignedProposal;
                }

                // Default behavior for other stages
                console.log('Leads check: default behavior');
                return this.documentsUploaded.length > 0;
            }

            // Default logic for other cases
            if (this.documentTypes.length > 0) {
                if (this.documentsUploaded.length > 0 && checkSubset(this.documentsUploaded.map(a => a.type), this.documentTypes.map(a => a.id))) {
                    return true
                }
                else {
                    return false
                }
            }
            else {
                return true
            }
        },
        pdfDocumentTypes() {
            return this.documentTypes.filter(doc => doc.type === 'pdf')
        },
        // Computed property specifically for button disabled state
        isButtonDisabled() {
            if (this.module == 'leads') {
                const requiredCount = this.requiredDocuments.length;
                console.log(requiredCount, "the count------------->", this.documentsUploaded, "iii")
                const uploadedCount = this.requiredDocuments.filter(req =>
                    this.documentsUploaded.some(doc => doc.ref_id === req)
                ).length;

                console.log(uploadedCount, "something else", requiredCount)
                // return uploadedCount !== requiredCount;
                return uploadedCount == 0
            }
            const disabled = !this.allDocumentsPresent || this.loading;
            console.log('Button disabled computed - allDocumentsPresent:', this.allDocumentsPresent, 'loading:', this.loading, 'disabled:', disabled);
            return disabled;
        }
    }
}
</script>
