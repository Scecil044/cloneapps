<template>
    <div class="pt-0">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="11">
                <h2 class="darkBlue-heading-text subHeadingFontSize">Document Templates</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="4">
                <v-card class="pa-5 rounded-xl overflow-y-auto" height="800" style="overflow: hidden">
                    <v-card-title class="px-3">
                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model="searchQuery" class="ml-1" label="Search" solo flat hide-details background-color="searchbar"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="text-right">
                                <v-icon color="primary" class="mr-2" @click="newMail = true">fa-plus</v-icon>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-divider class="mt-0"></v-divider>

                    <div class="scroll mt-0" style="max-height:680px;min-height:680px;">
                        <div v-if="alldocumentloading == false && visibleDocuments.length > 0">
                            <v-list two-line class="mt-n3" style="width:100%" v-if="visibleDocuments.length > 0">
                                <v-list-item-group color="primary" v-for="(data, index) in visibleDocuments" :key="index">
                                    <template>
                                        <v-list-item @click="loadServiceList(data)" class="mt-3">
                                            <v-list-item-content class="py-0">
                                                <h5 class="grey--text caption">{{ data.name }}</h5>
                                            </v-list-item-content>
                                        </v-list-item>
                                        <v-divider class="mt-3" :key="data._id"></v-divider>
                                    </template>
                                </v-list-item-group>
                            </v-list>
                        </div>
                        <v-row v-else style="min-height:100%;align-items:center;justify-content:center;">
                            <v-col cols="auto">
                                <v-img src="/animated/refresh.svg" max-width="fit-content" height="200" contain
                                    class="mr-3"></v-img>
                            </v-col>
                        </v-row>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="12" md="8">
                <v-row v-if="documentloading" style="min-height:100%;align-items:center;justify-content:center;">
                    <v-col cols="auto">
                        <v-img src="/animated/refresh.svg" max-width="fit-content" height="200" contain
                            class="mr-3"></v-img>
                    </v-col>
                </v-row>
                <v-card class="pa-5 rounded-xl" height="800" style="overflow: hidden" v-else>
                    <v-card-title class="px-3">
                        <v-row>
                            <v-col cols="12" sm="6">
                                <span class="px-0 pt-1 darkBlue-heading-text subHeadingFontSize">{{ documentedit ?
                                    'Edit' : '' }}{{
                                    selectedDocument.name }}</span>
                            </v-col>
                            <v-col cols="12" sm="6" class="text-right pt-0">
                                <v-btn elevation="'0" width="150px" color="primary" class="border-radius-medium"
                                    v-if="documentedit && !documentUpdateLoading"
                                    @click="saveDocumentTemplate(selectedDocument)">Update</v-btn>
                                <v-img src="/animated/refresh.svg" max-width="24" height="24"
                                    v-if="documentedit && documentUpdateLoading" contain class="mr-3"></v-img>
                                <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="documentedit"
                                    @click="loadServiceList(selectedDocument); documentedit = !documentedit">Cancel</v-btn>
                                <v-btn color="#5C7EEF" v-else-if="!empdetEdit" class="rounded-xl" small outlined
                                    @click="documentedit = true">Edit</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-divider class="mt-0"></v-divider>
                    <v-row>
                        <v-col cols="6">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Module</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                selectedDocument.module }}</span>
                        </v-col>
                        <v-col cols="6">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Name</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0"
                                v-if="!documentedit">{{
                                    selectedDocument.name }}</span>
                            <v-text-field v-model="selectedDocument.name" :rules="genericRule" v-else></v-text-field>
                        </v-col>

                        <template v-if="documentedit && selectedDocument && selectedDocument.condition">
                            <v-col class="align-center" cols="12">
                                <h5 class="mr-2">Condition ? </h5>
                                <v-switch
                                v-model="isConditionActive"
                                inset
                                ></v-switch>
                            </v-col>
                            <template v-if="isConditionActive">
                                <v-col cols="6">
                                    <span class="grey-heading-text textFontSize font-weight-medium">Condition Type</span>
                                    <v-autocomplete :items="typeOptions" v-model="selectedDocument.condition.type"
                                        >
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="6">
                                    <span class="grey-heading-text textFontSize font-weight-medium">Employment Type</span>
                                    <v-autocomplete :items="employmentTypeOptions" v-model="selectedDocument.condition.employment_type"
                                    >
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <span class="grey-heading-text textFontSize font-weight-medium">Document Name</span>
                                    <v-text-field v-model="selectedDocument.condition.document_name"></v-text-field>
                                </v-col>
                            </template>
                        </template>
                    </v-row>
                    <v-divider class="mt-0"></v-divider>
                    <v-tabs v-model="tab" grow class="justify-center grey--text">
                        <v-tab href="#preview">Preview</v-tab>
                        <v-tab href="#rkeys">Replace Keys</v-tab>
                        <v-tab href="#ikeys">Input Keys</v-tab>
                        <!-- <v-tab href="#ikeys">Condition</v-tab> -->

                    </v-tabs>
                    <v-divider></v-divider>
                    <v-tabs-items v-model="tab">
                        <v-tab-item id="preview" class="">
                            <div>
                                <client-only v-if="selectedDocument && !documentedit">
                                    <PreviewDocument v-if="selectedDocument && !documentedit"
                                        :content='selectedDocument.content' />
                                </client-only>
                                <client-only v-if="selectedDocument && documentedit">
                                    <v-btn class="short__btn " color="primary" @click="docEditor = true">Open
                                        Editor</v-btn>
                                </client-only>
                            </div>
                        </v-tab-item>
                        <v-tab-item id="rkeys" class="">
                            <div class="pt-0 overflow-y-auto" style="max-height: 400px">
                                <client-only v-if="selectedDocument">
                                    <ModifyReplaceKeys :keys="selectedDocument.auto_replace_keys"
                                        :module="selectedDocument.module" :edit="documentedit"
                                        @updatefeilds="updateReplaceKeys" />
                                </client-only>
                            </div>
                        </v-tab-item>
                        <v-tab-item id="ikeys" class="">
                            <div class="pt-0 overflow-y-auto" style="max-height: 400px">
                                <client-only v-if="selectedDocument">
                                    <ModifyInputKeys :keys="selectedDocument.user_input_keys"
                                        :module="selectedDocument.module" :edit="documentedit"
                                        @updatefeilds="updateInputKeys" />
                                </client-only>
                            </div>
                        </v-tab-item>

                    </v-tabs-items>
                </v-card>
            </v-col>
        </v-row>



        <v-dialog v-model="newMail" max-width="600px">
            <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
                <v-card-title class="py-0">
                    <v-row>
                        <v-col cols="10">
                            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">New
                                Document</span>
                        </v-col>
                        <v-col cols="2" class="text-right">
                            <v-icon color="red" class="mr-2" @click="newMail = false">fa-close</v-icon>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text class="py-0">
                    <v-form ref="newDocument">
                        <v-row class="pb-0">
                            <v-col cols="6">
                                <span class="grey-heading-text textFontSize font-weight-medium">Template Name</span>
                            </v-col>
                            <v-col cols="6">
                                <span class="grey-heading-text textFontSize font-weight-medium">Module</span>
                            </v-col>
                        </v-row>
                        <v-row v-if="system_modules.length > 0" class="pt-0">
                            <v-col cols="6">
                                <v-text-field v-model="newDocument.name" :rules="genericRule"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-autocomplete :items="system_modules" v-model="newDocument.module"
                                    :rules="genericRule">
                                </v-autocomplete>
                            </v-col>
                        </v-row>

                        <v-row class="align-center">
                            <h5 class="mr-2 mb-2">Condition ? </h5>
                            <v-switch
                            v-model="isConditionActive"
                            inset
                            ></v-switch>
                        </v-row>

                        <template v-if="isConditionActive">
                            <v-row class="pb-0">
                                <v-col cols="6">
                                    <span class="grey-heading-text textFontSize font-weight-medium">Condition Type</span>
                                </v-col>
                                <v-col cols="6">
                                    <span class="grey-heading-text textFontSize font-weight-medium">Employment Type</span>
                                </v-col>
                            </v-row>
                            <v-row class="pt-0">
                                <v-col cols="6">
                                    <v-autocomplete :items="typeOptions" v-model="newDocument.condition.type"
                                        >
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="6">
                                    <v-autocomplete :items="employmentTypeOptions" v-model="newDocument.condition.employment_type"
                                        >
                                    </v-autocomplete>
                                </v-col>
                            </v-row>
                            <v-row class="pb-0">
                                <v-col cols="12">
                                    <span class="grey-heading-text textFontSize font-weight-medium">Document Name</span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field v-model="newDocument.condition.document_name"></v-text-field>
                                </v-col>
                            </v-row>
                        </template>
                    </v-form>
                </v-card-text>
                <v-card-actions class="py-0">
                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-img src="/profile/edit.svg" max-width="24px" height="24px" class="mr-2"
                                v-if="newDocumentLoading"></v-img>
                            <v-btn class="short__btn " color="primary" v-else @click="addNewDocument()">Add</v-btn>
                        </v-col>
                    </v-row>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackBar :data="snackbar_data" />

        <v-dialog fullscreen v-model="docEditor">
            <v-card background="white">
                <client-only v-if="docEditor">
                    <ModifyDocument v-if="docEditor" :documentName='selectedDocument.name'
                        :content='selectedDocument.content'
                        :elements="{ 'text': dynamicVariables.map(a => a.key), table: [], image: [], }" @save='save'
                        @close="docEditor = false" />
                </client-only>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

import SnackBar from '@/components/utils/SnackBar.vue'

export default {
    components: {
        SnackBar,
        ModifyDocument: () => { if (process.client) { return import('../word-editor/wordeditor.vue') } },
        PreviewDocument: () => { if (process.client) { return import('../word-editor/wordsimplepreview.vue') } },
        ModifyInputKeys: () => { if (process.client) { return import('./inputKeys.vue') } },
        ModifyReplaceKeys: () => { if (process.client) { return import('./replaceKeys.vue') } }
    },
    data() {
        return {
            docEditor: false,
            snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
            isConditionActive: false,
            typeOptions: ["DES", "EES"],
            employmentTypeOptions: ['Mission Visa (3 Months Single Entry)', 'Work Permit (for UAE Resident visa holders)','Employment Visa (2-Year)'],
            genericRule: [(v) => !!v || 'This field is Required'],
            newDocumentLoading: false,
            documentUpdateLoading: false,
            tab: 'preview',
            empdetEdit: false,
            alldocumentloading: false,
            documentloading: false,
            documentedit: false,
            newMail: false,
            newMailLoading: false,
            documentlist: [],
            dynamicVariables: [],
            selectedDocument: {},
            system_modules: [],
            searchQuery: '',
            newDocument: {
                module: '',
                content: `{
                    "sections": [
                        {
                            "blocks": [
                                {
                                    "inlines": [
                                        {
                                            "characterFormat": {
                                                "bold": true,
                                                "italic": true
                                            },
                                            "text": ""
                                        }
                                    ]
                                }
                            ],
                            "headersFooters": {
                            }
                        }
                    ]
                }`,
                name: '',
                user_input_keys: [],
                auto_replace_keys: [],
                condition: {
                    type: "",
                    document_name: "",
                    employment_type: ""
                }
            }
        }
    },
    async mounted() {
        this.getallmodules()
        await this.getalldocuments()
        this.loadServiceList(this.documentlist[0])
    },
    computed: {
        visibleDocuments() {
            if (!this.searchQuery) return this.documentlist;
            const s = this.searchQuery.toLowerCase();
            return this.documentlist.filter(doc => doc.name && doc.name.toLowerCase().includes(s));
        },
    },
    methods: {
        save(event) {
            this.selectedDocument.content = event.content
            this.docEditor = false
        },
        async saveDocumentTemplate() {
            const findDuplicates = (arr) => {
                let sorted_arr = arr.slice().sort();
                let results = [];
                for (let i = 0; i < sorted_arr.length - 1; i++) {
                    if (sorted_arr[i + 1] == sorted_arr[i]) {
                        results.push(sorted_arr[i]);
                    }
                }
                return results;
            }

            let keysArrays = this.selectedDocument.auto_replace_keys.map(a => a.key).concat(this.selectedDocument.user_input_keys.map(a => a.key))

            if (findDuplicates(keysArrays).length > 0) {
                this.snackbar_data = {
                    snackbar: true,
                    text: 'Duplicate Keys Found',
                    color: 'danger',
                    icon: 'info',
                    timeout: 1200,
                }
            }
            else if (keysArrays.includes('')) {
                this.snackbar_data = {
                    snackbar: true,
                    text: 'Empty Keys Found',
                    color: 'danger',
                    icon: 'info',
                    timeout: 1200,
                }
            }
            else {
                this.documentUpdateLoading = true
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                await this.$axios.patch(`/document_template/${this.selectedDocument.id}`, this.selectedDocument, { headers: { Authorization: AuthStr } })
                    .then(async (response) => {
                        this.documentedit = false
                        this.documentUpdateLoading = false
                        this.loadServiceList(this.selectedDocument)
                    })
                    .catch(e => console.log(e))
            }

        },
        async addNewDocument() {
            this.addNewDocumentTemplate = true
            if (this.$refs.newDocument.validate()) {
                this.newMailLoading = true
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                await this.$axios.post(`/document_template/add/`, this.newDocument, { headers: { Authorization: AuthStr } })
                    .then(async (response) => {
                        this.documentedit = false
                        this.newDocument = {
                            module: '',
                            content: `<html></html>`,
                            name: '',
                            user_input_keys: [],
                            auto_replace_keys: [],
                            condition: {
                                document_name: "",
                                type: "",
                                employment_type: ""
                            }
                        }
                        this.addNewDocumentTemplate = false
                        this.newMail = false
                        this.newMailLoading = false
                        await this.getalldocuments()
                    })
                    .catch(e => console.log(e))
            }
        },
        updateReplaceKeys(event) {
            this.selectedDocument.auto_replace_keys = event.keys
            this.dynamicVariables = this.selectedDocument.auto_replace_keys.map((a) => { return { 'key': a.key, 'label': a.label } }).concat(this.selectedDocument.user_input_keys.map((a) => { return { 'key': a.key, 'label': a.label } }))
        },
        updateInputKeys(event) {
            this.selectedDocument.user_input_keys = event.keys
        },
        updateContent(event) {
            this.selectedDocument.content = event
        },
        async loadServiceList(data) {
            this.documentloading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.$axios.get(`/document_template/templateid/${data.id}`, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.documentloading = false
                    this.selectedDocument = response.data
                    this.dynamicVariables = this.selectedDocument.auto_replace_keys.map((a) => { return { 'key': a.key, 'label': a.label } }).concat(this.selectedDocument.user_input_keys.map((a) => { return { 'key': a.key, 'label': a.label } }))
                })
                .catch(e => console.log(e))
        },
        async getalldocuments() {
            this.alldocumentloading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.post(`/document_template/list/all`, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.alldocumentloading = false
                    this.documentlist = response.data
                })
                .catch(e => console.log(e))
        },
        getallmodules() {
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.$axios.get(`configuration/modules`, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.system_modules = response.data.data.modules
                })
                .catch(e => console.log(e))
        },

    },
}
</script>
