<template>
    <div>
        <v-progress-linear indeterminate v-if="newLoanProgress"></v-progress-linear>
        <v-row class="mx-auto" style="max-width:80%">
            <v-col cols="12" sm="12" md="12">
                <v-form ref="form">
                    <v-row class="pt-4">
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Loan Type</span> <span
                                    class="red--text">*</span></p>
                            <v-select class="customMdiMenuDown redTextForm" :items="loanTypes"
                                @change="fetchLoanRequirements()" item-text="loan_type" :persistent-hint="true"
                                :rules="genericRule" return-object v-model="selectedLoan" dense>
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize "><span>Amount</span><span
                                    class="red--text">*</span></p>
                            <div style="position:relative">
                                <v-text-field
                                    class="grey-heading-text font-weight-medium textFontSize textFontSize redTextForm"
                                    :disabled='selectedLoan == ""' type="number" v-model="loan_amount"
                                    :rules="computedLoanPercentageRule ? [loanPercentRules] : []"><span>Loan
                                        Amount</span><span class="red--text">*</span></v-text-field>
                                <!-- class="grey-heading-text font-weight-medium textFontSize textFontSize redTextForm" :disabled='selectedLoan == ""' v-model="loan_amount" :rules="computedLoanPercentageRule ? [loanPercentRules] : []">Loan Percentage<span class="red--text">*</span></v-text-field> -->
                            </div>
                        </v-col>
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Loan Months</span> <span
                                    class="red--text">*</span></p>
                            <div style="position:relative">
                                <v-text-field class="grey-heading-text font-weight-medium textFontSize redTextForm"
                                    type="number" :disabled='selectedLoan == ""'
                                    :rules="computedLoanMonthRule ? [loanMonthRules] : []" v-model="loan_months"><span>Loan
                                        Months</span><span class="red--text">*</span></v-text-field>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row v-if="existingLoanInfo.length > 0">
                        <v-col class="" cols="12" sm="12" md="12">
                            <v-card class="rounded-xl allRequests pa-3"
                                style="box-shadow: 0px  24px 30px #959EA51A;border:solid 0.5px #ececec" min-height="220px">
                                <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                                    <v-col cols="12" class="pb-0">
                                        <p class="grey-heading-text font-weight-medium textFontSize "><span>Total Amount
                                                that can be availed</span> : <span class="darkBlue-heading-text">
                                                {{ totalAvailbleAmount }} <span>AED</span> </span></p>
                                    </v-col>
                                </v-row>
                                <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                                    <v-col cols="12">
                                        <p class="grey-heading-text font-weight-medium textFontSize pb-2">Existing Active
                                            Loan : <span class="darkBlue-heading-text"
                                                v-if="existingLoanInfo[0].array_recursives.length == 0">0
                                                <span>AED</span></span></p>
                                        <div v-for="(data, index) in existingLoanInfo[0].array_recursives" :key="index">
                                            <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                                                <v-col cols="7" class="pa-0">
                                                    <p class="grey-heading-text font-weight-medium textFontSize ">
                                                        <span>Category</span> : <span
                                                            class="darkBlue-heading-text">{{ data.category }}</span></p>
                                                </v-col>
                                                <v-col cols="5" class="pa-0">
                                                    <p class="grey-heading-text font-weight-medium textFontSize ">
                                                        <span>Amount</span> : <span
                                                            class="darkBlue-heading-text">{{ data.amount }}</span></p>
                                                </v-col>
                                            </v-row>
                                            <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                                                <v-col cols="12" class="pa-0">
                                                    <p class="grey-heading-text font-weight-medium textFontSize ">
                                                        <span>Total due</span> : <span
                                                            class="darkBlue-heading-text">{{ data.remaining_bal_due &&
                                                                data.remaining_bal_due.$numberDecimal }}</span></p>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <!-- <v-col class="" cols="12" sm="12" md="6" >
                <p class="grey-heading-text font-weight-medium textFontSize ">Total Loan Amount<span class="red--text">*</span></p>
                <div style="position:relative">
                    <p class="mb-0">{{computedLoanAmount}}</p>
                </div>
            </v-col> -->
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Monthly payment</span><span
                                    class="red--text">*</span></p>
                            <div style="position:relative">
                                <p class="mb-0">{{ computedMonthlyPayment }}</p>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row class="">
                        <v-col class="" cols="12" sm="12" md="12">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span>Loan Description</span> <span
                                    class="red--text">*</span></p>
                            <v-textarea dense rows="2" v-model="request.letter_fields.description" class="redTextForm"
                                :rules="genericRule"></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-right">
                            <v-btn dark color="primary" @click.prevent="createLoanRequest()" v-if="!loanAdding"
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
            loanTypes: [],
            loanAdding: false,
            loan_percentage: '',
            loan_amount: 1,
            loan_months: 1,
            loan_type: '',
            loanMonthRules: (value) => {
                return value <= 0 ? 'Should be greater than 0' : `Exceeds max allowed months of ${this.existingLoanInfo[0].max_months}`
            },
            loanPercentRules: (value) => {
                return value <= 0 ? 'Should be greater than 0' : `Balance available is ${this.totalAvailbleAmount}`
            },
            selectedLoan: "",
            existingLoanInfo: '',
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
        this.loanTypes = this.$store.getters.getConf[0].loanTypes
        this.getData(this.user._id)
    },
    created() {

    },
    methods: {
        async fetchLoanRequirements() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            let body = {
                loan_type: this.selectedLoan.loan_type,
                user_id: this.selectedEmp._id,
                current_year: moment().year()
            }

            let get_loan_info = await this.$axios.$post("/loan/get_loan_requirements", body, { headers: { Authorization: AuthStr } }).then(res => {
                this.existingLoanInfo = res
            })

        },
        async createLoanRequest() {
            if (this.$refs.form.validate()) {

                this.loanAdding = true
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                let body = {
                    loan_type: this.selectedLoan.loan_type,
                    loan_percentage: this.existingLoanInfo[0].max_percentage,
                    loan_months: this.loan_months,
                    loan_amount: this.loan_amount,
                    date: moment(new Date()).format("YYYY-MM-DD"),
                    monthly_payment: this.computedMonthlyPayment,
                    loan_description: this.request.letter_fields.description,
                    userType: this.userType,
                    applied_manager: this.user._id,
                    user_id: this.selectedEmp._id
                }

                let apply_loan = await this.$axios.$post("/loan/add_loan", body, { headers: { Authorization: AuthStr } })

                if (apply_loan && apply_loan.success) {
                    this.snack = true
                    this.snackText = 'Your request is on its way!'
                    this.snackColor = 'green'
                    this.getData(this.user._id)
                    this.$refs.form.reset()
                    this.loanAdding = false
                    this.loan_percentage = ''
                    this.loan_months = ''
                    this.selectedLoan = "",
                        this.$nuxt.$emit("refreshRequests", false);
                    notificationMethod.new(this.user._id, body.user_id, body.loan_type, 'New Loan Request Submitted', '/dashboards/myhr#loan')
                } else {
                    if (apply_loan && !apply_loan.success) {
                        this.snack = true
                        this.snackText = apply_loan.message
                        this.snackColor = 'error'
                        this.loanAdding = false
                    } else {
                        this.snack = true
                        this.snackText = 'Failed to apply loan'
                        this.snackColor = 'error'
                        this.loanAdding = false
                    }
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
        totalAvailbleAmount() {
            if (this.existingLoanInfo.length > 0) {
                let totalAvailableFromSalary = parseFloat((this.existingLoanInfo[0].salary_per_anum * (Number(this.existingLoanInfo[0].max_total_percentage) / 100)).toFixed(2))
                let availableFromSalaryForSelected = parseFloat((this.existingLoanInfo[0].salary_per_anum * (this.existingLoanInfo[0].max_percentage / 100)).toFixed(2))
                let totalTypeTotalArr = this.existingLoanInfo[0].array_recursives.map(a => a.remaining_bal_due ? a.remaining_bal_due.$numberDecimal : 0)
                let totalTypeTotalSum = totalTypeTotalArr.length > 0 ? totalTypeTotalArr.map(function (elt) {
                    return parseInt(elt)
                }).reduce((partialSum, a) => partialSum + a, 0) : 0
                let availableBalanceForSelected = parseFloat(availableFromSalaryForSelected.toFixed(2))
                let totalAvailableBalanceFromSalary = parseFloat((totalAvailableFromSalary - totalTypeTotalSum).toFixed(2))
                if (totalAvailableBalanceFromSalary < availableBalanceForSelected) {
                    return totalAvailableBalanceFromSalary
                } else {
                    return availableBalanceForSelected
                }
            } else {
                return 0
            }
        },
        computedLoanAmount() {
            if (this.loan_amount != '' && this.loan_months != '') {
                let loanAmount = this.loan_amount
                return loanAmount.toFixed(2)
            } else {
                return 0
            }
        },
        computedMonthlyPayment() {
            console.log()
            if (this.loan_amount != '' && this.loan_months != '') {
                let monthly = this.loan_amount / this.loan_months
                return monthly.toFixed(2)
            } else {
                return 0
            }
        },
        computedLoanPercentageRule() {
            if (this.selectedLoan) {
                if (this.loan_amount > this.totalAvailbleAmount) return true
                else if (this.loan_amount <= 0) { return true }
                else return false
            }
        },
        computedLoanMonthRule() {
            if (this.selectedLoan) {
                let loan_selected = this.$store.getters.getConf[0].loanTypes.filter(a => a.loan_type == this.selectedLoan.loan_type)
                if (loan_selected.length == 0) { return true }
                else if (loan_selected.length > 0) {
                    if (this.loan_months > loan_selected[0].max_months) { return true }
                    else if (this.loan_months <= 0) { return true }
                    else {
                        return false
                    }
                }
            }
        },
    }
};
</script>
<style  lang="scss">.redTextForm {
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