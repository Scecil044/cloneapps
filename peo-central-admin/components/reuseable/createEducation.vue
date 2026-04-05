<template>
    <div>
        <v-progress-linear indeterminate v-if="newLoanProgress"></v-progress-linear>
        <v-row class="mx-auto" style="max-width:80%">
            <v-col cols="12" sm="12" md="12">
                <v-form ref="form">
                    <v-row class="pt-4">
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Number of Children</span>
                                <span class="red--text">*</span></p>
                            <v-select class="customMdiMenuDown redTextForm" :items="childrenCountOptions"
                                @change="fetchEducationRequirements()" :persistent-hint="true" :rules="genericRule"
                                return-object v-model="childrenCount" dense>
                            </v-select>
                        </v-col>
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Education Start Year</span>
                                <span class="red--text">*</span></p>
                            <v-select class="customMdiMenuDown redTextForm" :items="years"
                                @change="fetchEducationRequirements()" :persistent-hint="true" :rules="genericRule"
                                v-model="selectedStartYear" dense>
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="" cols="12" sm="12" md="5">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Amount</span><span
                                    class="red--text">*</span></p>
                            <div style="position:relative">
                                <p class="mb-0">{{ computedEducationAmount }}</p>
                            </div>
                        </v-col>
                        <v-col class="" cols="12" sm="6" md="7">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Attachments</span> <span
                                    class="red--text">*</span></p>
                            <v-file-input dense v-model="request.letter_fields.files" class="redTextForm"
                                :rules="[
                                    v => !!v || 'File is required',
                                    v => (v && v.length > 0) || 'File is required',
                                    (files => !files || !files.some(file => file.size > 2e6) || 'File size should be less than 2 MB!')]" @change="onUploadFiles" multiple>
                                <template v-slot:selection="{ text }">
                                    <v-chip small label color="primary">
                                        {{ text }}
                                    </v-chip>
                                </template>
                            </v-file-input>
                        </v-col>
                    </v-row>
                    <v-row v-if="existingEducation.length > 0 && isPayrollExisting">
                        <v-col class="" cols="12" sm="12" md="12">
                            <v-card class="rounded-xl allRequests pa-3"
                                style="box-shadow: 0px  24px 30px #959EA51A;border:solid 0.5px #ececec" min-height="220px">
                                <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                                    <v-col cols="12" class="pb-0">
                                        <p class="grey-heading-text font-weight-medium textFontSize "><span>Total Amount
                                                that can be
                                                availed</span> : <span class="darkBlue-heading-text">
                                                {{ computedEducationAmount }} <span>AED</span> </span>
                                        </p>
                                    </v-col>
                                </v-row>
                                <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                                    <v-col cols="12">
                                        <p class="grey-heading-text font-weight-medium textFontSize pb-2">Existing Active
                                            Education
                                            Payitem</p>
                                        <div v-for="(data, index) in existingEducation" :key="index">
                                            <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                                                <v-col cols="6" class="pa-0">
                                                    <p class="grey-heading-text font-weight-medium textFontSize ">
                                                        <span>Amount</span> : <span class="darkBlue-heading-text">{{
                                                            data.amount }}</span></p>
                                                </v-col>
                                                <v-col cols="6" class="pa-0">
                                                    <p class="grey-heading-text font-weight-medium textFontSize ">
                                                        <span>Education Start
                                                            Year</span> : <span class="darkBlue-heading-text">{{
                                                                data.education_year }}</span></p>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row class="">
                        <v-col class="" cols="12" sm="12" md="12">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Description</span> <span
                                    class="red--text">*</span></p>
                            <v-textarea dense rows="2" v-model="request.letter_fields.description" class="redTextForm"
                                :rules="genericRule"></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-right">
                            <v-btn dark color="primary" @click.prevent="createEducationRequest()" v-if="!loanAdding"
                                class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset"
                                elevation="0">Submit</v-btn>
                            <v-progress-circular indeterminate color="primary" v-if="loanAdding"></v-progress-circular>
                        </v-col>
                    </v-row>
                </v-form>
                <!-- snackbar -->
                <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
                    {{ snackText }}

                    <template v-slot:action="{ attrs }">
                        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
                    </template>
                </v-snackbar>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import notificationMethod from "~/plugins/notification";
import moment from 'moment'

export default {
    layout: "dashboard",
    props: [
        "request",
        'user',
        'selectedEmp',
        'companyData',
        'userType'
    ],
    data() {
        return {
            isPayrollExisting: false,
            educationTypes: [],
            childrenCountOptions: [],
            childrenCount: '',
            selectedStartYear: '',
            existingEducation: '',


            loanTypes: [],
            loanAdding: false,
            loan_percentage: '',
            loan_amount: 0,
            loan_months: '',
            loan_type: '',
            loanMonthRules: (value) => {
                return `Exceeds max allowed months of ${this.existingEducation[0].max_months}`
            },
            loanPercentRules: (value) => {
                return `Balance available is ${this.totalAvailbleAmount}`
            },
            selectedLoan: "",
            snack: false,
            snackColor: "",
            snackText: "",
            newLoanProgress: false,
            genericRule: [(v) => !!v || "This field is Required"],
            uploadFiles: '',
            snack: false,
            snackColor: "",
            snackText: "",
            userRequests: [],
            selectedService: {
                letter_fields: {}
            },
        };
    },
    mounted() {
        this.educationTypes = this.$store.getters.getConf[0].education
        this.childrenCountOptions = this.educationTypes.map(a => a.no_of_children)
        // this.getData(this.user._id)
    },
    created() {

    },
    methods: {
        async fetchEducationRequirements() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            if (this.childrenCount != '' && this.selectedStartYear != '') {
                let body = {
                    childrenCount: this.childrenCount,
                    user_id: this.selectedEmp._id,
                    selectedStartYear: this.selectedStartYear + ''
                }

                let get_loan_info = await this.$axios.$post("/loan/get_education_requirements", body, { headers: { Authorization: AuthStr } }).then(res => {
                    if (res.success == true) {
                        this.existingEducation = res.data
                        this.isPayrollExisting = res.payroll
                    }
                })
            }

        },
        async createEducationRequest() {
            if (this.$refs.form.validate()) {
                if (this.computedEducationAmount > 0) {
                    this.loanAdding = true
                    const token = this.$store.getters.getToken
                    const AuthStr = 'Bearer '.concat(token);

                    let attachments = []
                    for (let i = 0; i < this.uploadFiles.length; i++) {
                        if (this.uploadFiles[i].name != undefined) {
                            let upload_meta = {
                                file: this.uploadFiles[i],
                                filename: this.uploadFiles[i].name
                            }
                            await this.uploadFile(upload_meta)
                            let attach = {
                                link: this.link_url,
                                filename: this.link_filename,
                                time: new Date()
                            }
                            attachments.push(attach)
                        }
                    }


                    let body = {
                        education_start_year: this.selectedStartYear,
                        education_amount: this.computedEducationAmount,
                        date: moment(new Date()).format("YYYY-MM-DD"),
                        attachments: attachments,
                        education_description: this.request.letter_fields.description,
                        userType: this.userType,
                        applied_manager: this.user._id,
                        user_id: this.selectedEmp._id
                    }

                    let apply_education = await this.$axios.$post("/loan/add_education", body, { headers: { Authorization: AuthStr } })

                    if (apply_education && apply_education.success) {
                        this.snack = true
                        this.snackText = 'Your request is on its way!'
                        this.snackColor = 'green'
                        this.getData(this.user._id)
                        this.$refs.form.reset()
                        this.loanAdding = false
                        this.education_start_year = ''
                        this.childrenCount != ''
                        this.selectedStartYear != ''
                        this.education_amount = ''
                        this.$nuxt.$emit("refreshRequests", false);
                        notificationMethod.new(this.user._id, body.user_id, body.loan_type, 'New Loan Request Submitted', '/dashboards/myhr#loan')
                    } else {
                        if (apply_education && !apply_education.success) {
                            this.snack = true
                            this.snackText = apply_education.message
                            this.snackColor = 'error'
                            this.loanAdding = false
                        } else {
                            this.snack = true
                            this.snackText = 'Failed to apply loan'
                            this.snackColor = 'error'
                            this.loanAdding = false
                        }
                    }
                }
                else {
                    this.snack = true
                    this.snackText = 'Cannot apply'
                    this.snackColor = 'error'
                }
            } else {
                this.snack = true
                this.snackText = 'Required fields cannot be empty'
                this.snackColor = 'error'
            }
        },

        onUploadFiles(event) {
            this.uploadFiles = event;
        },
        async getData(id) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.userRequests = await this.$axios.$get("/loan/users/loans/" + id, { headers: { Authorization: AuthStr } });
            this.selectedService = _.orderBy(this.userRequests, ['date_created'], ['desc'])[0];
        },
        async uploadFile(val) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            const fd = new FormData();
            fd.append("a", val.file, val.name);
            fd.append("b", this.selectedEmp._id + Date.now() + val.file.name);
            fd.append("folder", "loans");

            await this.$axios
                .$post("/requests/upload-file", fd, {
                    headers: { Authorization: AuthStr },
                })
                .then((res) => {
                    this.link_url = res.url;
                    this.link_filename = res.name;
                })
                .catch((e) => console.log(e));
        },

    },

    computed: {
        computedEducationAmount() {
            if (this.childrenCount != '' && this.selectedStartYear != '') {
                if (this.isPayrollExisting) {
                    let totalUsedThisYearArr = this.existingEducation.map(a => a.amount)
                    let totalUsedThisYearSum = totalUsedThisYearArr.length > 0 ? totalUsedThisYearArr.map(function (elt) {
                        return parseInt(elt)
                    }).reduce((partialSum, a) => partialSum + a, 0) : 0
                    let limitForCurrentSelected = this.existingEducation[0].array_config[0].education[0].amount
                    let balanceThisYear = this.existingEducation[0].array_config[0].max - totalUsedThisYearSum
                    return balanceThisYear > limitForCurrentSelected ? limitForCurrentSelected : balanceThisYear

                } else {
                    if (this.existingEducation.length > 0) {
                        let selectedNumberAvailableAmount = this.existingEducation[0].education[0].amount
                        let maximumAvailableFromTotal = this.existingEducation[0].max
                        return selectedNumberAvailableAmount > maximumAvailableFromTotal ? maximumAvailableFromTotal : selectedNumberAvailableAmount
                    }
                }
            }
        },
        years() {
            const year = new Date().getFullYear()
            return Array.from({ length: year - 2000 }, (value, index) => 2022 + index)
        }
    }
};
</script>
<style  lang="scss">
.redTextForm {
    .v-text-field__details {
        display: block !important;

        .v-messages {
            .v-messages__wrapper {
                .v-messages__message {
                    color: #f42121 !important;
                }
            }
        }
    }
}</style>