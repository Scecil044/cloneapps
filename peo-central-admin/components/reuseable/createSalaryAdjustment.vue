<template>
    <div class="scroll" style="max-height: 720px">
        <v-card-text class="pt-4 mt-5 d-flex justify-center">
            <div style="max-width: 80%">
                <v-divider class="mb-3"></v-divider>
                <v-row class="rounded-xl mx-auto mb-5">
                    <v-col cols="12" sm="12" md="12" class="py-0">
                        <h2 class="grey-heading-text subHeadingFontSize">Old Salary</h2>
                    </v-col>
                    <template v-for="(sal, key) in salaryCloned">
                        <v-col :key="key" v-if="key != 'total_fixed'" cols="4" sm="4" md="4" class="pb-0">
                            <span class="grey-heading-text textFontSize font-weight-medium">{{ keyNameRegex(key) }}</span>
                            <p class="pb-0">{{ salaryCloned[key] | thousandSeparator }}</p>
                        </v-col>
                    </template>

                    <template v-for="(sal, key) in salaryCloned">
                        <v-col :key="key" v-if="key == 'total_fixed'" cols="4" sm="4" md="4" class="pb-0">
                            <span class="grey-heading-text textFontSize font-weight-medium">{{ keyNameRegex(key) }}</span>
                            <p class="pb-0">{{ salaryCloned[key] | thousandSeparator }}</p>
                        </v-col>
                    </template>
                </v-row>
                <v-divider class="mb-3"></v-divider>

                <v-row>
                    <v-col cols="12" sm="12" md="12" class="py-0">
                        <h2 class="grey-heading-text subHeadingFontSize">Adjustment</h2>
                    </v-col>
                    <v-col cols="6" sm="6" md="6">
                        <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Effected as on Date</p>

                        <v-menu v-model="menu13" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="290px">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field hide-details v-model="salaryAdjustmentBody.effective_date"
                                    placeholder="Effected as on Date" dense v-bind="attrs" v-on="on"
                                    :rules="genericRule"></v-text-field>
                            </template>
                            <v-date-picker hide-details v-model="salaryAdjustmentBody.effective_date"
                                @input="menu13 = false" no-title scrollable></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="6" sm="6" md="6">
                        <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Change Type</p>
                        <v-select :disabled="salaryAdjustmentBody.effective_date == ''" hide-details dense
                            :items="changeType" v-model="changeTypeValue" placeholder="Change Type"
                            @change="salaryAdjustmentBody.percentage = 0, clonePreviousData(), calculateTotal(false, true), salarykeyChangeDetect()"
                            :rules="genericRule"></v-select>
                    </v-col>
                    <v-col cols="12" v-if="changeTypeValue == 'Amount'" class="d-flex flex-row">
                        <p class="mb-0 font-weight-medium textFontSize grey-heading-text mr-5">Adjustment Type</p>
                        <v-switch class="pt-0 mt-0" inset color="indigo darken-3" v-model="enableIncreaseBy"
                            hide-details></v-switch>
                    </v-col>
                </v-row>

                <div class="pb-3" v-if="changeTypeValue != ''">

                    <template v-for="(data, index) in salaryPercentageChanges">
                        <v-row v-if="changeTypeValue != 'Amount'" :key="index">
                            <v-col cols="3" sm="3" md="3">
                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Adjustment Type</p>
                                <v-select hide-details dense :items="adjustmentType" placeholder="Adjustment Type"
                                    v-model="salaryPercentageChanges[index].adjustment_type"
                                    @change="salaryPercentageChanges[index].percentage = 0" :rules="genericRule"></v-select>
                            </v-col>
                            <v-col :cols="salaryPercentageChanges[index].salary_key == 'All' ? 6 : 4"
                                :sm="salaryPercentageChanges[index].salary_key == 'All' ? 6 : 4"
                                :md="salaryPercentageChanges[index].salary_key == 'All' ? 6 : 4">
                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Salary Key</p>
                                <v-select hide-details dense :items="userSalaryKeysItem" item-disabled="disable"
                                    item-title="text" item-value="value" placeholder="Salary Key"
                                    @change="salaryPercentageChanges[index].percentage = 0, salarykeyChangeDetect(salaryPercentageChanges[index].salary_key), calculateTotal(true)"
                                    v-model="salaryPercentageChanges[index].salary_key" :rules="genericRule"></v-select>
                            </v-col>

                            <v-col cols="3" sm="3" md="3">
                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Change (%)</p>
                                <v-text-field hide-details type="number" dense :placeholder="'Percentage'"
                                    v-model="salaryPercentageChanges[index].percentage"
                                    @input="calculateTotal(true)"></v-text-field>
                            </v-col>
                            <v-col cols="2" sm="2" md="2" class="d-flex justify-center align-center"
                                v-if="salaryPercentageChanges[index].salary_key != 'All'">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn v-bind="attrs" v-on="on" class="" text icon
                                            @click="addSalaryPercentageFields(index)" :disabled="disableAddBtnSalary">
                                            <v-icon>mdi-plus-circle-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Add New Input</span>
                                </v-tooltip>

                                <v-tooltip bottom v-if="salaryPercentageChanges.length > 1">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn v-bind="attrs" v-on="on" class="" text icon color="red lighten-2"
                                            @click="salaryPercentageChanges.splice(index, 1), calculateTotal(true)">
                                            <v-icon>mdi-delete-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Delete Input</span>
                                </v-tooltip>
                            </v-col>
                        </v-row>
                    </template>
                </div>
                <v-divider class="mb-3"></v-divider>

                <v-row>
                    <v-col cols="12" sm="12" md="12" class="py-0">
                        <h2 class="grey-heading-text subHeadingFontSize">{{ enableIncreaseBy ? "Increase/Decrease by" :
                            "Salary Elements" }}</h2>
                    </v-col>


                    <template v-if="changeTypeValue != 'Amount'">
                        <template v-for="(sal, key) in employee.salary">
                            <v-col :key="key" v-if="key != 'total_fixed' && key != ''" cols="4" sm="4" md="4" class="pb-0">
                                <span class="grey-heading-text textFontSize font-weight-medium">{{ keyNameRegex(key)
                                }}</span>
                                <p class="pb-0">{{ sal | thousandSeparator }}</p>
                            </v-col>
                        </template>
                        <template v-for="(sal, key) in employee.salary">
                            <v-col :key="key" v-if="key == 'total_fixed'" cols="4" sm="4" md="4" class="pb-0">
                                <span class="grey-heading-text textFontSize font-weight-medium">{{ keyNameRegex(key)
                                }}</span>
                                <p class="pb-0">{{ sal | thousandSeparator }}</p>
                            </v-col>
                        </template>

                    </template>
                    <template v-else-if="enableIncreaseBy">
                        <template v-for="(sal, key) in salaryChangeByValue">
                            <v-col cols="4" sm="4" md="4" :key="key" class="p-0" v-if="key != 'total_fixed' && key != ''">
                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">{{ keyNameRegex(key) }}
                                </p>
                                <v-text-field type="number" dense :placeholder="keyNameRegex(key)"
                                    v-model="salaryChangeByValue[key]" @input="calculateTotal"></v-text-field>
                            </v-col>
                        </template>
                        <v-col class="p-0">
                            <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Total Fixed</p>
                            <v-text-field type="number" dense :placeholder="'Total Fixed'" :value="totalsalary"
                                disabled></v-text-field>
                        </v-col>
                    </template>
                    <template v-else>
                        <template v-for="(sal, key) in employee.salary">
                            <v-col cols="4" sm="4" md="4" :key="key" class="p-0" v-if="key != 'total_fixed' && key != ''">
                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">{{ keyNameRegex(key) }}
                                </p>
                                <v-text-field type="number" dense :placeholder="keyNameRegex(key)"
                                    v-model="employee.salary[key]" @input="calculateTotal"
                                    :disabled="changeTypeValue != 'Amount' && changeTypeValue != ''"></v-text-field>
                            </v-col>
                        </template>
                        <v-col class="p-0">
                            <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Total Fixed</p>
                            <v-text-field type="number" dense :placeholder="'Total Fixed'" :value="totalsalary"
                                disabled></v-text-field>
                        </v-col>
                    </template>
                </v-row>

                <v-row justify="end" class="mx-auto" style="max-width: 80%">
                    <v-col sm="3" xl="2">
                        <div class="pb-3" style="position: absolute; bottom: 0">

                            <v-tooltip bottom :disabled="!SalaryAdjustmentCreateDisable">
                                <template v-slot:activator="{ on }">
                                    <div v-on="on" class="d-inline-block">

                                        <v-btn elevation="0" width="150px" color="#0064D7"
                                            @click="prevSalaryAdjustment = !prevSalaryAdjustment"
                                            v-if="!prevSalaryAdjustment" class="mr-2 white--text border-radius-medium"
                                            :disabled="SalaryAdjustmentCreateDisable">
                                            Preview
                                        </v-btn>
                                    </div>
                                </template>
                                <span>There is pending salary adjustment request</span>
                            </v-tooltip>


                        </div>
                    </v-col>
                </v-row>
            </div>
            <v-dialog v-model="prevSalaryAdjustment" v-if="employee" max-width="1200">
                <v-card class="rounded-lg scroll" min-width="900">

                    <v-card-title class="pa-6">
                        <span class="darkBlue-heading-text">Salary Adjustment {{ !prevSalaryAdjustment ? "Request" :
                            "Preview" }}</span>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-divider></v-divider>
                    <DataTable v-if="employee && employee.salary" :newsalary="employee.salary"
                        :oldsalary="selectedEmp.salary"
                        :salaryPercentageChanges="changeTypeValue != 'Amount' ? salaryPercentageChanges : ''"></DataTable>
                    <v-divider></v-divider>
                    <v-spacer></v-spacer>
                    <v-container class="p-3 d-flex flex-row-reverse">

                        <v-btn elevation="0" width="150px" color="border-radius-medium"
                            @click="prevSalaryAdjustment = !prevSalaryAdjustment" v-if="prevSalaryAdjustment"
                            class="mr-2 border-radius-medium">
                            Back
                        </v-btn>
                        <v-btn elevation="0" width="150px" color="#0064D7" @click="createSalaryAdjustment()"
                            v-if="prevSalaryAdjustment" class="mr-2 white--text border-radius-medium">
                            Confirm
                        </v-btn>
                    </v-container>
                </v-card>
            </v-dialog>
        </v-card-text>

        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}
            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
<script>
import general from "~/plugins/general";
import DataTable from "~/components/datatables/salaryAdjustmentDataTable.vue";
export default {
    props: ["selectedEmp"],
    components: { DataTable },
    data() {
        return {
            SalaryAdjustmentCreateDisable: true,
            enableIncreaseBy: false,
            salaryChangeByValue: {},
            adjustmentType: ["Increase", "Decrease"],
            changeType: ["Amount", "Percentage (%)"],
            changeTypeValue: "",
            userSalaryKeys: [],
            userSalaryKeysItem: [],
            employee: {},
            salaryCloned: {},
            prevSalaryAdjustment: false,
            salaryAdjustmentBody: {
                logs: [],
                user_id: "",
                company_id: "",
                old_salary: {},
                new_salary: {},
                isPercentage: false,
                isAmount: true,
                isUpdated: false,
                effective_date: "",
                approvals: [],
                status: "pending",
                createdBy: "",
                pay_month: "",
            },
            salaryPercentageChanges: [{
                salary_key: "All",
                percentage: 0,
                adjustment_type: "Increase",
            }],
            menu13: '',
            genericRule: [
                v => !!v || 'This field is Required'
            ],
            snack: false,
            snackText: '',
            snackColor: '',
            totalsalary: 0,
            services_general: general,
            loggedInUser: {
                personal: {},
                bank: {},
                education: {},
                work_experience: {},
                documents: {},
                emergency: {},
                reporting: {},
                leaves: {},
                salary: {}
            },
            configuration: {},
            disableAddBtnSalary: false
        }
    },
    async mounted() {

        const token = this.$store.getters.getToken
        const AuthStr = 'Bearer '.concat(token)
        this.employee = _.cloneDeep(this.selectedEmp)
        this.totalsalary = this.employee.salary.total_fixed;
        this.salaryCloned = _.cloneDeep(this.selectedEmp.salary)

        let tempObjSal = _.cloneDeep(this.selectedEmp.salary)
        for (const [key, value] of Object.entries(tempObjSal)) {
            this.salaryChangeByValue[key] = 0
        }
        this.getUserSalaryKeys(this.employee.salary)
        this.loggedInUser = this.$store.getters.getUser

        let body = {
            "salaryAdjustmentApprover": 1
        }

        this.configuration = await this.$axios.$post('configuration/payrollConfig/get-req-conf', body, { headers: { Authorization: AuthStr } })
        let pendingCount = await this.$axios.$get('salaryAdjustment/pending/' + this.employee._id, body, { headers: { Authorization: AuthStr } })
        if (pendingCount && pendingCount > 0) {
            this.SalaryAdjustmentCreateDisable = true
        } else {
            this.SalaryAdjustmentCreateDisable = false

        }
        // console.log(this.selectedEmp)
    },
    methods: {

        clonePreviousData() {
            this.disableAddBtnSalary = false
            this.enableIncreaseBy = false

            let tempObjSal = _.cloneDeep(this.selectedEmp.salary)
            for (const [key, value] of Object.entries(tempObjSal)) {
                this.salaryChangeByValue[key] = 0
            }
            this.employee = _.cloneDeep(this.selectedEmp)
            this.getUserSalaryKeys(this.employee.salary)
        },
        keyNameRegex(val) {
            return val ? _.startCase(val.replace(/_/g, " ")) : ''
        },

        getUserSalaryKeys(data) {
            let arr = [{ text: 'All', value: 'All', disable: false }]
            for (const [key, value] of Object.entries(data)) {
                if (key != "total_fixed")
                    arr.push({ text: this.keyNameRegex(key), value: key, disable: false })

            }
            this.userSalaryKeys = arr
            this.userSalaryKeysItem = arr
        },
        addSalaryPercentageFields(index) {
            let abc = {
                salary_key: "",
                percentage: 0,
                adjustment_type: "Increase",
            }
            this.salaryPercentageChanges.splice(index, 0, abc);
            this.calculateTotal(true)

            this.disableAddBtnSalary = this.salaryPercentageChanges.length <= this.userSalaryKeysItem.length - 2 ? false : true
        },

        salarykeyChangeDetect(text) {
            if (text == "All") {
                this.salaryPercentageChanges = [{
                    salary_key: "All",
                    percentage: 0,
                    adjustment_type: "Increase",
                }]
                for (let i = 0; i < this.userSalaryKeysItem.length; i++) {
                    this.userSalaryKeysItem[i].disable = false
                }
                this.disableAddBtnSalary = false
            } else {
                let mapped = this.salaryPercentageChanges.map(a => a.salary_key)

                for (let i = 0; i < mapped.length; i++) {
                    const element = mapped[i];
                    let objIndex = this.userSalaryKeysItem.findIndex(e => e.value == element)
                    if (objIndex && this.userSalaryKeysItem[objIndex] && this.userSalaryKeysItem[objIndex].hasOwnProperty("disable"))
                        this.userSalaryKeysItem[objIndex].disable = true
                }

                for (let i = 0; i < this.userSalaryKeysItem.length; i++) {
                    const element = this.userSalaryKeysItem[i];
                    if (!mapped.includes(element.value)) {
                        this.userSalaryKeysItem[i].disable = false
                    }
                }
            }
        },
        calculateTotal(calculatePercentage = false, isChangeType = false) {
            if (this.enableIncreaseBy && this.changeTypeValue == 'Amount') {
                this.employee.salary = _.cloneDeep(this.salaryCloned)

                for (const [key1, value1] of Object.entries(this.employee.salary)) {
                    for (const [key2, value2] of Object.entries(this.salaryChangeByValue)) {
                        if (key1 == key2) {
                            this.employee.salary[key1] = Number((Number(this.employee.salary[key1]) + Number(value2)).toFixed(2))
                        }
                    }
                }
            }
            else if ((this.changeTypeValue != 'Amount' && calculatePercentage) || isChangeType) {
                if (isChangeType && this.changeTypeValue == 'Amount') {
                    this.employee.salary = _.cloneDeep(this.salaryCloned)

                } else {
                    this.employee.salary = _.cloneDeep(this.salaryCloned)
                    let clonedDataTemp = this.employee;
                    for (let i = 0; i < this.salaryPercentageChanges.length; i++) {
                        const obj = this.salaryPercentageChanges[i];
                        let key = obj.salary_key
                        if (key != "All") {
                            if (obj.adjustment_type == "Increase")
                                clonedDataTemp.salary[key] = Number(parseFloat((obj.percentage / 100 * Number(clonedDataTemp.salary[key])) + Number(clonedDataTemp.salary[key])).toFixed(2))
                            else
                                clonedDataTemp.salary[key] = Number(parseFloat(clonedDataTemp.salary[key] - (obj.percentage / 100 * Number(clonedDataTemp.salary[key]))).toFixed(2))
                        }
                        else if (key == "All") {

                            for (var el in clonedDataTemp.salary) {
                                if (clonedDataTemp.salary.hasOwnProperty(el) && el != 'total_fixed') {
                                    if (obj.adjustment_type == "Increase") {
                                        clonedDataTemp.salary[el] = Number(parseFloat((obj.percentage / 100 * clonedDataTemp.salary[el]) + Number(clonedDataTemp.salary[el])).toFixed(2))
                                    }
                                    else
                                        clonedDataTemp.salary[el] = Number(parseFloat(clonedDataTemp.salary[el] - (obj.percentage / 100 * Number(clonedDataTemp.salary[el]))).toFixed(2))
                                }
                            }
                        }
                    }
                }
            }

            var sum = 0;
            for (var el in this.employee.salary) {
                if (this.employee.salary.hasOwnProperty(el) && el != 'total_fixed') {
                    sum = +this.employee.salary[el] + sum
                }
            }
            this.employee.salary.total_fixed = Number(parseFloat(sum).toFixed(2))
            this.totalsalary = Number(parseFloat(sum).toFixed(2))
        },



        async createSalaryAdjustment() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)
            let selectedEmp = this.employee

            for (const [key, value] of Object.entries(selectedEmp.salary)) {
                this.salaryAdjustmentBody.new_salary[key] = Number((Number(value)).toFixed(2))
            }

            this.salaryAdjustmentBody.old_salary = this.selectedEmp.salary
            this.salaryAdjustmentBody.user_id = selectedEmp._id
            this.salaryAdjustmentBody.company_id = selectedEmp.company_ID
            this.salaryAdjustmentBody.createdBy = this.loggedInUser._id
            if (this.changeTypeValue == "Amount") {
                this.salaryAdjustmentBody.isAmount = true
                this.salaryAdjustmentBody.isPercentage = false
            } else {
                this.salaryAdjustmentBody.isAmount = false
                this.salaryAdjustmentBody.isPercentage = true
            }
            let objectToParse = this.configuration[0].salaryAdjustmentApprover;
            for (let index = 0; index < objectToParse.length; index++) {

                let approval_obj = {
                    approver_id: objectToParse[index],
                    status: "",
                    approved_date: "",
                    comments: ""
                };

                index == 0
                    ? (approval_obj.status = "Processing")
                    : (approval_obj.status = "Pending");
                this.salaryAdjustmentBody.approvals.push(approval_obj);
            }
            this.salaryAdjustmentBody.salaryPercentageChanges = this.salaryPercentageChanges;

            let log_obj = {
                created_by: this.loggedInUser._id,
                status: 'Created',
                createdDate: new Date().toISOString(),
            }
            this.salaryAdjustmentBody.logs.push(log_obj)
            this.$axios.$post('salaryAdjustment/add-item', this.salaryAdjustmentBody, { headers: { Authorization: AuthStr } })
                .then(async res => {
                    this.snack = true
                    this.snackColor = 'success'
                    this.snackText = 'Salary Adjustment Has Been Requested Successfully'
                    this.compEdit = false
                    this.prevSalaryAdjustment = false
                    this.salaryAdjustmentBody = {
                        logs: [],
                        user_id: "",
                        old_salary: {},
                        new_salary: {},
                        adjustment_type: "Increase",
                        type: "Amount",
                        percentage: "",
                        isUpdated: false,
                        effective_date: "",
                        approvals: [],
                        status: "pending",
                    }

                    this.salaryPercentageChanges = [{
                        salary_key: "All",
                        percentage: 0,
                        adjustment_type: "Increase",
                    }]
                    this.changeTypeValue = ""

                    await this.$axios.$get("payrollprocess/active/pay_month/" + selectedEmp.company_ID, { headers: { Authorization: AuthStr } })
                        .then(async res => {
                            this.active_paymonthUser = res[0].pay_month
                        }).catch()
                    await this.$axios.$get('salaryAdjustment/user/' + selectedEmp._id, { headers: { Authorization: AuthStr } })
                        .then(res => {
                            this.salaryAdjustmentList = res
                        })
                    this.clonePreviousData()
                    this.totalsalary = this.employee.salary.total_fixed;
                    this.salaryCloned = _.cloneDeep(this.selectedEmp.salary)
                    this.dialog_overlay = false
                    setTimeout(() => {
                        this.$nuxt.$emit("addNewSalaryAdjustment", res);
                    }, 2000)


                }).catch(err => console.log(err))
        },
    }
}
</script>
<style lang="">
    
</style>