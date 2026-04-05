<template>
    <div class="pt-0">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="11">
                <h2 class="darkBlue-heading-text subHeadingFontSize">SMS Templates</h2>
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
                                <v-icon color="primary" class="mr-2" @click="newMail = true">fa-plus</v-icon>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-divider class="mt-0"></v-divider>

                    <div class="scroll mt-0" style="max-height:680px;min-height:680px;">
                        <!-- {{ visiblePages }} -->
                        <div v-if="allemailloading == false && visiblePages.length > 0">
                            <v-list two-line class="mt-n3" style="width:100%" v-if="visiblePages != ''">
                                <v-list-item-group color="primary">
                                    <v-list-item @click="loadServiceList(data)" :class="getClass(data.flag)"
                                        v-for="(data, index) in visiblePages" :key="index">
                                        <v-list-item-action>

                                            <v-icon small v-if="data.flag == 'Important'" color="red darken-4"
                                                class="mr-2">fa-exclamation </v-icon>
                                            <v-icon small v-if="data.flag == 'Completed'" color="green darken-4"
                                                class="mr-2">fa-check </v-icon>
                                            <v-icon small v-if="data.flag == 'In Progress'" color="yellow darken-4"
                                                class="mr-2">fa-spinner </v-icon>
                                            <v-icon small v-if="data.flag == 'Pending'" color="purple darken-4"
                                                class="mr-2">fa-hourglass </v-icon>

                                        </v-list-item-action>
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
            <v-col cols="12" sm="12" md="8">
                <v-row v-if="smsloading" style="min-height:100%;align-items:center;justify-content:center;">
                    <v-col cols="auto">
                        <v-img src="/animated/refresh.svg" max-width="fit-content" height="200" contain
                            class="mr-3"></v-img>
                    </v-col>
                </v-row>
                <v-card class="pa-5 rounded-xl" height="800" style="overflow: hidden" v-else>
                    <v-card-title class="px-3">
                        <v-row>
                            <v-col cols="12" sm="6">
                                <span class="px-0 pt-1 darkBlue-heading-text subHeadingFontSize">{{ emailedit ? 'Edit ' :
                                    '' }}{{ selectedSms.name }}</span>
                            </v-col>
                            <v-col cols="12" sm="6" class="text-right pt-0">
                                <v-btn elevation="'0" width="150px" color="primary" class="border-radius-medium"
                                    v-if="emailedit && !newEmailLoading"
                                    @click="saveEmailTemplate(selectedSms)">Update</v-btn>
                                <v-img src="/animated/refresh.svg" max-width="24" height="24"
                                    v-if="emailedit && newEmailLoading" contain class="mr-3"></v-img>
                                <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="emailedit"
                                    @click="loadServiceList(selectedSms); emailedit = !emailedit">Cancel</v-btn>
                                <v-btn color="#5C7EEF" v-else-if="!empdetEdit" class="rounded-xl" small outlined
                                    @click="emailedit = true">Edit</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-divider class="mt-0"></v-divider>
                    <v-row>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Flag</p>
                            <span v-if="!emailedit"
                                class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                    selectedSms.flag }}</span>
                            <v-select v-model="selectedSms.flag"
                                :items="['Important', 'Completed', 'In Progress', 'Pending']" v-else></v-select>
                        </v-col>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Module</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                selectedSms.module }}</span>
                        </v-col>
                        <v-col cols="6">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Name</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0"
                                v-if="!emailedit">{{ selectedSms.name }}</span>
                            <v-text-field v-model="selectedSms.name" :rules="genericRule" v-else></v-text-field>
                        </v-col>
                        <!-- <v-col cols="6">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">To</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0"
                                v-if="!emailedit">{{ toEmails }}</span>
                            <v-text-field v-model="toEmails" :rules="genericRule" v-else>
                                <template v-slot:append>
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on }">
                                            <v-icon v-on="on">fa-info</v-icon>
                                        </template>
                                        <span>Email IDs Separated by comma</span><br>
                                        <span>Note: Use Module name if email should be triggered to connected module</span>
                                    </v-tooltip>
                                </template>
                            </v-text-field>
                        </v-col> -->
                        <!-- <v-col cols="6">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">CC</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0"
                                v-if="!emailedit">{{ ccEmails }}</span>
                            <v-text-field v-model="ccEmails" :rules="genericRule" v-else>
                                <template v-slot:append>
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on }">
                                            <v-icon v-on="on">fa-info</v-icon>
                                        </template>
                                        <span>Email IDs Separated by comma</span><br>
                                        <span>Note: Use Module name if email should be triggered to connected
                                            module</span>
                                    </v-tooltip>
                                </template>
                            </v-text-field>
                        </v-col> -->
                        <v-col cols="12">
                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Subject</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0"
                                v-if="!emailedit">{{ selectedSms.subject }}</span>
                            <v-text-field v-model="selectedSms.subject" :rules="genericRule" v-else></v-text-field>
                        </v-col>
                    </v-row>
                    <v-divider class="mt-0"></v-divider>
                    <v-tabs v-model="tab" grow class="justify-center grey--text">
                        <v-tab href="#preview">Preview</v-tab>
                        <v-tab href="#rkeys">Replace Keys</v-tab>
                        <v-tab href="#ikeys">Input Keys</v-tab>
                    </v-tabs>
                    <v-divider></v-divider>
                    <v-tabs-items v-model="tab">
                        <v-tab-item id="preview" class="">
                            <div class="pt-0 overflow-y-auto" style="max-height: 400px">
                                <div v-if="selectedSms && !emailedit" v-html="selectedSms.content"
                                    :style="{ 'height': '340px' }"></div>
                                <client-only v-if="selectedSms && emailedit">
                                    <Modifyemail :body="selectedSms.content" :dynamicVariables="dynamicVariables"
                                        @texteditor="updateContent" />
                                </client-only>

                            </div>
                        </v-tab-item>
                        <v-tab-item id="rkeys" class="">
                            <div class="pt-0 overflow-y-auto" style="max-height: 270px">
                                <client-only v-if="selectedSms">
                                    <!-- <ModifyReplaceKeys :keys="selectedSms.auto_replace_keys"
                                        :module="selectedSms.module" :edit="emailedit"
                                        @updatefeilds="updateReplaceKeys" /> -->
                                </client-only>
                            </div>
                        </v-tab-item>
                        <v-tab-item id="ikeys" class="">
                            <div class="pt-0 overflow-y-auto" style="max-height: 270px">
                                <client-only v-if="selectedSms">
                                    <!-- <ModifyInputKeys :keys="selectedSms.user_input_keys" :module="selectedSms.module"
                                        :edit="emailedit" @updatefeilds="updateInputKeys" /> -->
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
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">New SMS</span>
                        </v-col>
                        <v-col cols="2" class="text-right">
                            <v-icon color="red" class="mr-2" @click="newMail = false">fa-close</v-icon>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text class="py-0">
                    <v-form ref="newEmail">
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
                                <v-text-field v-model="newEmail.name" :rules="genericRule"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-autocomplete :items="system_modules" v-model="newEmail.module" :rules="genericRule">
                                </v-autocomplete>
                            </v-col>
                        </v-row>
                        <!-- <v-row class="pb-0">
                            <v-col cols="6">
                                <span class="grey-heading-text textFontSize font-weight-medium">To Emails</span>
                            </v-col>
                            <v-col cols="6">
                                <span class="grey-heading-text textFontSize font-weight-medium">CC Emails</span>
                            </v-col>
                        </v-row> -->
                        <v-row v-if="system_modules.length > 0" class="pt-0">
                            <v-col cols="6">
                                <v-text-field v-model="toEmails" :rules="genericRule">
                                    <template v-slot:append>
                                        <v-tooltip top>
                                            <template v-slot:activator="{ on }">
                                                <v-icon v-on="on">fa-info</v-icon>
                                            </template>
                                            <span>Phone Numbers Separated by comma</span><br>
                                            <span>Note: Use key word "users" to trigger SMS to parent user </span>
                                        </v-tooltip>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <!-- <v-col cols="6">
                                <v-text-field v-model="ccEmails">
                                    <template v-slot:append>
                                        <v-tooltip top>
                                            <template v-slot:activator="{ on }">
                                                <v-icon v-on="on">fa-info</v-icon>
                                            </template>
                                            <span>Phone Numbers Separated by comma</span><br>
                                            <span>Note: Use Module name if SMS should be triggered to connected
                                                module</span>
                                        </v-tooltip>
                                    </template>
                                </v-text-field>
                            </v-col> -->
                        </v-row>
                        <v-row class="pb-0">
                            <v-col cols="12">
                                <span class="grey-heading-text textFontSize font-weight-medium">Subject</span>
                            </v-col>
                        </v-row>
                        <v-row class="pt-0">
                            <v-col cols="12">
                                <v-text-field v-model="newEmail.subject" :rules="genericRule"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions class="py-0">
                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-img src="/profile/edit.svg" max-width="24px" height="24px" class="mr-2"
                                v-if="newEmailLoading"></v-img>
                            <v-btn class="short__btn " color="primary" v-else @click="addNewEmail()">Add</v-btn>
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
        ModifyInputKeys: () => { if (process.client) { return import('@/components/configurations/EmailConfigurator/inputKeys.vue') } },
        Modifyemail: () => { if (process.client) { return import('@/components/configurations/EmailConfigurator/text-editor-quill.vue') } },
        ModifyReplaceKeys: () => { if (process.client) { return import('@/components/configurations/EmailConfigurator/replaceKeys.vue') } }
    },
    data() {
        return {

            model_select_list: null,
            searchQuery: '',
            snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
            genericRule: [(v) => !!v || 'This field is Required'],
            newEmailLoading: false,
            tab: 'preview',
            empdetEdit: false,
            toEmails: '',
            ccEmails: '',
            allemailloading: false,
            smsloading: false,
            emailedit: false,
            newMail: false,
            newMailLoading: false,
            smslist: [],
            dynamicVariables: [],
            selectedSms: {},
            system_modules: [],
            newEmail: {
                module: '',
                to: [],
                cc: [],
                content: `<html></html>`,
                name: '',
                user_input_keys: [],
                auto_replace_keys: [],
            }
        }
    },
    async mounted() {
        this.getallmodules()
        await this.getallemails()
        this.loadServiceList(this.smslist[0])
    },
    methods: {
        getClass(val) {
            if (val == 'Important') return 'red lighten-5 mt-3'
            else if (val == 'Completed') return 'green lighten-5 mt-3'
            else if (val == 'In Progress') return 'yellow lighten-5 mt-3'
            else if (val == 'Pending') return 'purple lighten-5 mt-3'
            else return 'mt-3'
        },
        async saveEmailTemplate() {
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
            let keysArrays = this.selectedSms.auto_replace_keys.map(a => a.key).concat(this.selectedSms.user_input_keys.map(a => a.key))

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
                this.newEmailLoading = true
                // this.selectedSms.to = this.toEmails.split(',')
                // this.selectedSms.cc = this.ccEmails.split(',')
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                console.log(this.selectedSms, "selectedSms")
                await await this.$axios.patch(`/sms_template/${this.selectedSms._id}`, this.selectedSms, { headers: { Authorization: AuthStr } })
                    .then(async (response) => {
                        let index = this.findIndex(this.smslist, 'id', this.selectedSms.id)
                        this.smslist[index].flag = this.selectedSms.flag
                        this.smslist[index].name = this.selectedSms.name
                        console.log(this.smslist[index])
                        this.emailedit = false
                        this.newEmailLoading = false
                        this.toEmails = ''
                        this.ccEmails = ''
                        await this.loadServiceList(this.selectedSms)

                    })
                    .catch(e => console.log(e))
            }

        },
        findIndex(array, key, value) {
            var index = array.findIndex(function (element) {
                return element[key] == value
            });
            return index
        },
        async addNewEmail() {
            this.addNewEmailTemplate = true
            if (this.$refs.newEmail.validate()) {
                this.newMailLoading = true
                this.newEmail.to = this.toEmails.split(',')
                this.newEmail.cc = this.ccEmails.split(',')
                const AuthStr = 'Bearer '.concat(this.$store.state.token)
                await this.$axios.post(`/sms_template/add/`, this.newEmail, { headers: { Authorization: AuthStr } })
                    .then(async (response) => {
                        this.emailedit = false
                        this.newEmail = {
                            module: '',
                            to: [],
                            cc: [],
                            content: `<html></html>`,
                            name: '',
                            user_input_keys: [],
                            auto_replace_keys: [],
                        }
                        this.toEmails = ''
                        this.ccEmails = ''
                        this.addNewEmailTemplate = false
                        this.newMail = false
                        this.newMailLoading = false
                        await this.getallemails()
                    })
                    .catch(e => console.log(e))
            }
        },
        getDynamicVariables() {
            this.dynamicVariables = this.selectedSms.auto_replace_keys.map((a) => { return { 'key': a.key, 'label': a.label } }).concat(this.selectedSms.user_input_keys.map((a) => { return { 'key': a.key, 'label': a.label } }))
        },
        updateReplaceKeys(event) {
            this.selectedSms.auto_replace_keys = event.keys
            this.getDynamicVariables()
        },
        updateInputKeys(event) {
            this.selectedSms.user_input_keys = event.keys
            this.getDynamicVariables()
        },
        updateContent(event) {
            this.selectedSms.content = event
        },
        async loadServiceList(data) {
            this.smsloading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.$axios.get(`/sms_template/id/${data.id}`, { headers: { Authorization: AuthStr } })
                .then((response) => {

                    this.smsloading = false
                    this.selectedSms = response.data
                    this.toEmails = this.selectedSms.to.join(",")
                    this.ccEmails = this.selectedSms.cc.join(",")
                    this.getDynamicVariables()
                })
                .catch(e => console.log(e))
        },
        async getallemails() {
            this.allemailloading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.get(`/sms_template/get/all`, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.allemailloading = false
                    this.smslist = response.data
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
    computed: {
        visiblePages() {
            let data = _.cloneDeep(this.smslist)
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
