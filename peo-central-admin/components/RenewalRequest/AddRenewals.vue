<template>
    <v-dialog id="custom_dialog" value="true" persistent max-width="500px">
        <v-card id="card" style="padding: 20px 30px !important">
            <v-card-title id="card-title">
                <h4 class="text--text">New Renewal Request</h4>
                <v-icon small color="subtext" class="ml-5" @click="handleClose">fa-close</v-icon>
                <v-progress-linear class="mt-2" height="2px" v-if="isLoadingList" indeterminate color="primary"></v-progress-linear>
            </v-card-title>
            <v-card-text id="card-text">
                <v-container class="ma-0 pa-0">
                    <v-row class="pb-0">
                        <v-col cols="12" class="pa-0">
                            <h6 class="pb-5">Select Company</h6>
                        </v-col>
                        <v-col cols="12" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                            <div slot="input">
                                <v-select :items="employers" placeholder="Select Client" solo dense
                                    v-model="selectedEmployers" item-text="company_name" item-value="_id"
                                    class="proposalDialog_date_field2" v-if="employers.length > 0"
                                    append-icon="fa-chevron-down" @change="getEmployeesList(selectedEmployers)" />
                            </div>
                        </v-col>
                        <v-col cols="12" class="pa-0" v-if="employees.length > 0">
                            <h6 class="pb-5">Employee Name</h6>
                        </v-col>
                        <v-col cols="12" class="Leads_filter_date_column pl-0 pr-0 pb-0" v-if="employees.length > 0">
                            <div slot="input">
                                <v-select :items="employeesWithFullNames" placeholder="Select Employee" solo dense
                                    v-model="selectedEmployees" item-text="full_name" item-value="_id"
                                    class="proposalDialog_date_field2" v-if="employees.length > 0"
                                    append-icon="fa-chevron-down">
                                    <template #item="{ item }">
                                        {{ item.first_name }} {{ item.last_name }}
                                    </template>
                                </v-select>
                            </div>
                        </v-col>

                        <v-col cols="12" class="ma-0 pa-0">
                            <div class="d-flex align-center justify-end">
                                <v-btn class="tall__btn pl-6 pr-6" color="primary" :loading="isAddingNewRenewal" @click="addNewRenewals()">
                                    Add Renewal
                                    <template v-slot:loader>
                                        <v-progress-circular color="white" indeterminate :value="10" style="height: 18px !important"></v-progress-circular>
                                    </template>
                                </v-btn>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
        <SnackBar :data="snackbar_data" />
    </v-dialog>
</template>



<script>
import SnackBar from '@/components/utils/SnackBar.vue'


export default {
    components: { SnackBar },
    data() {
        return {
            snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
            employers: [],
            employerPage: 0,
            selectedEmployees: "",
            employees: [],
            limit: '1000',
            selectedEmployers: "",
            Flag : true,
            isLoadingList: false,
            isAddingNewRenewal: false
        }
    },
    mounted() {
            this.getEmployersList();
    },
    methods: {
        async getEmployersList() {
            console.log("Hits Here")
            this.isLoadingList = true
            this.employerPage++;
            const AuthStr = 'Bearer '.concat(this.$store.state.token)

            await this.$axios.$post(`/companies/list/dropdown?page=${this.employerPage}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.employers = response
                })
            this.isLoadingList = false
        },
        async getEmployeesList(company) {
            this.employeePage = 1;
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.isLoadingList = true

            await this.$axios.$post(`/users/list/sort/filter?page=${this.employeePage}&limit=${this.limit}`, { 'company_id': [company] }, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.employees = response.results || []
                    if(this.CompanyId && this.employeeId) {
                        this.selectedEmployees = this.employees.filter(value => value._id == this.employeeId)[0]
                    }
                })

            this.isLoadingList = false
        },
        async addNewRenewals() {

            if(!this.selectedEmployers || !this.selectedEmployees) {
                this.snackbar_data.snackbar = true
                this.snackbar_data.text = 'Please fill in all the fields!'
                this.snackbar_data.color = 'warning'
                return
            }

            this.isAddingNewRenewal = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.$post('/renewals', {
                'user_id': this.selectedEmployees,
                'company_id': this.selectedEmployers,
                'visa_sponsor_type': this.selectedEmployeeVisaSponsorType,
                'employment_type': this.selectedEmployeeEmploymentType
            }, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.snackbar_data.snackbar = true
                    this.snackbar_data.text = 'Renewal request added successfully'
                    this.snackbar_data.color = 'success'
                    this.$emit("closeDialog")
                })
            this.isAddingNewRenewal = false
        },
        handleClose() {
            this.selectedEmployees = "";
            this.selectedEmployers = ""
            this.$emit("closeDialog")
        }
    },
    computed: {
        employeesWithFullNames() {
            return this.employees.map(emp => ({...emp, full_name: `${emp.first_name} ${emp.last_name}`}))
        },
        selectedEmployeeVisaSponsorType() {
            return this.employees.find((it) => it._id == this.selectedEmployees).employment.visa_sponsor_type
        },
        selectedEmployeeEmploymentType() {
            return this.employees.find((it) => it._id == this.selectedEmployees).employment.employment_type
        },
    }
}


</script>


<style></style>
