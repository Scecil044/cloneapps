<template>
    <div class="pt-0">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="11">
                <h2 class="darkBlue-heading-text subHeadingFontSize">Document Templates</h2>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="4">
                <v-card class="pa-5 rounded-xl overflow-y-auto" height="800">
                    <v-card-title class="px-3">
                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model="searchQuery" class="ml-1" label="Search" solo flat hide-details
                                    background-color="searchbar"></v-text-field>
                            </v-col>
                            <v-col cols="6" class="text-right">
                                <v-icon color="primary" class="mr-2" @click="newDoc = true">fa-plus</v-icon>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-divider class="mt-0"></v-divider>

                    <div class="scroll mt-0" style="max-height:680px;min-height:680px;">
                        <div v-if="alldocumentloading == false && visiblePages.length > 0">
                            <v-list two-line class="mt-n3" style="width:100%" v-if="visiblePages != ''">
                                <v-list-item-group color="primary">
                                    <v-list-item :class="getClass(data.flag)" v-for="(data, index) in visiblePages"
                                        :key="index">
                                        <v-list-item-content class="py-0">
                                            <h5 class="dark--text caption">{{ data.name }}</h5>
                                        </v-list-item-content>
                                    </v-list-item>
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
        </v-row>



        <v-dialog v-model="newDoc" max-width="600px">
            <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
                <v-card-title class="py-0">
                    <v-row>
                        <v-col cols="10">
                            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">New Document
                                Type</span>
                        </v-col>
                        <v-col cols="2" class="text-right">
                            <v-icon color="red" class="mr-2" @click="newDoc = false">fa-close</v-icon>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text class="py-0">
                    <v-form ref="newDocument">
                        <v-row class="pb-0">
                            <v-col cols="6">
                                <span class="grey-heading-text textFontSize font-weight-medium">Document Type Name</span>
                            </v-col>

                        </v-row>
                        <v-row class="pt-0">
                            <v-col cols="6">
                                <v-text-field v-model="newDocument.name" :rules="genericRule"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions class="py-0">
                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-img src="/animated/refresh.svg" max-width="24px" height="24px" class="mr-2"
                                v-if="newDocumentLoading"></v-img>
                            <v-btn class="short__btn " color="primary" v-else @click="addNewDocument()">Add</v-btn>
                        </v-col>
                    </v-row>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackBar :data="snackbar_data" />
    </div>
</template>

<script>

import SnackBar from '@/components/utils/SnackBar.vue'

export default {
    components: {
        SnackBar,
    },
    data() {
        return {
            newDoc: false,
            searchQuery: '',
            snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
            genericRule: [(v) => !!v || 'This field is Required'],
            newDocumentLoading: false,
            alldocumentloading: false,
            documentlist: [],
            newDocument: {
                name: "",
                type: ""
            }
        }
    },
    async mounted() {
        await this.getalldocuments()
    },
    methods: {
        getClass(val) {
            if (val == 'Important') return 'red lighten-5 mt-3'
            else if (val == 'Completed') return 'green lighten-5 mt-3'
            else if (val == 'In Progress') return 'yellow lighten-5 mt-3'
            else if (val == 'Pending') return 'purple lighten-5 mt-3'
            else return 'mt-3'
        },
        async saveDocumentTemplate() {

        },
        findIndex(array, key, value) {
            var index = array.findIndex(function (element) {
                return element[key] == value
            });
            return index
        },
        async addNewDocument() {
            this.newDocumentLoading = true;
            let doctype = this.newDocument.name.replaceAll(" ", "").toLowerCase()
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            let docObj = {
                'name': this.newDocument.name,
                "type": doctype,
                "view": ["Users", "Admin", "Super-Admin"],
                "edit": ["Admin", "Super-Admin"]

            }
            await this.$axios.get(`/documenttypes/type/${doctype}`, { headers: { Authorization: AuthStr } })
                .then(async (response) => {
                    if (response.data.length > 0) {
                        this.newDocumentLoading = false;
                        this.snackbar_data = {
                            snackbar: true,
                            text: 'Duplicate Type',
                            color: 'danger',
                            icon: 'info',
                            timeout: 1200,
                        }
                    } else {
                        await this.$axios.post(`/documenttypes`, docObj, { headers: { Authorization: AuthStr } })
                            .then(async (response) => {
                                this.newDocumentLoading = false;
                                this.newDoc = false
                                this.snackbar_data = {
                                    snackbar: true,
                                    text: 'Document Type Added Successfully',
                                    color: 'success',
                                    icon: 'info',
                                    timeout: 1200,
                                }
                                this.getalldocuments()
                            })
                            .catch(e => console.log(e))
                    }
                })
                .catch(e => console.log(e))

        },
        async getalldocuments() {
            this.alldocumentloading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.get(`/documenttypes`, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.alldocumentloading = false
                    this.documentlist = response.data
                })
                .catch(e => console.log(e))
        },

    },
    computed: {
        visiblePages() {
            let data = _.cloneDeep(this.documentlist)
            let returnData = []
            if (this.searchQuery) {
                var s = this.searchQuery;
                returnData = _.filter(data, function (value) {
                    return (
                        value.name && value.name.toLowerCase().indexOf(s.toLowerCase()) > -1
                    )
                })
                return _.orderBy(returnData, ['name'], ['asc'])
            }
            return _.orderBy(data, ['name'], ['asc'])
        },
    },
}
</script>
