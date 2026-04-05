<template>
    <div style="width : 100%">
        <v-card >
            <v-card-text>
                <v-row>
                    <v-col cols="12" sm="6" md="6" style="display: flex; flex-direction: row;">
                        <v-btn v-for="(button, index) in filterStatusOptions" :key="index" @click="handleClick(index)"
                            :class="{ clicked: button.clicked }" class="tall__btn ml-3" color="subtext" value="inactive"
                            outlined>
                            <span class="filter_btn pa-0">{{ button.text }}</span>
                        </v-btn>
                    </v-col>
                    <v-col cols="12" sm="5" md="5" style="display: flex; flex-direction: row;">
    
                        <v-text-field label="Search Employee" v-model="search" @input="getAllRenewals"
                            style="border-radius: 20px; margin-top: -10px;"></v-text-field>
                        <v-btn class="tall__btn ml-3" color="subtext" outlined @click="addDialog = true">
                            <span class="primary--text">Add New</span></v-btn>

                    <v-btn class="tall__btn ml-3" color="subtext" outlined @click="ShowRenewalsList">
                            <span class="primary--text">Move forward</span></v-btn>
                    </v-col>
    
                </v-row>
                <v-row>
                    <v-col cols="12" sm="12" md="12">
                        <v-data-table :headers="MainHeader" :items="renewalsList" :items-per-page="10"  @click:row="ViewRenewals"
                            :server-items-length="TotalRenewals" @update:options="GetPagination"
                            class="customTableRec customDownloadExcelButton">
    
    
                            <template v-slot:[`item.process`]="{ item }">
                                <v-chip x-small dark :color="getStatusColor(item.process)"
                                    :style="'background:' + getStatusColor(item.process) + '1f;' + 'color:' + getStatusColor(item.process)">{{
                                        item.process }}</v-chip>
                            </template>
    
    
                            <template v-slot:[`item.LabourCard`]="{ item }">
                                <div v-if="item.LabourCard && item.LabourCard.length > 0">
                                    <p> {{ item.LabourCard[0].expiry }}</p>
                                </div>
                                <div v-else>
                                    <p style="font-weight: bold; align-items: center;">{{ "--" }}</p>
                                </div>
                            </template>
    
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        
        <AddRenewals v-if="addDialog" @closeDialog="handleCloseDialog" />
    </div>




</template>



<script>

import AddRenewals from './AddRenewals.vue'
export default {
    components : {
        AddRenewals
    },
    data() {
        return {
            MainHeader: [{
                text: 'Employee',
                align: 'start',
                value: 'userDetails.full_name',
            },
            {
                text: 'Client',
                value: 'companyDetails.company_name',
            },
            {
                text: 'Labour Card Expiry',
                value: 'LabourCard',
            },
            {
                text: 'Visa Expiry',
                value: 'expiry'
            },
            {
                text: 'Processs',
                value: 'process',
            },
            {
                text: 'Actions',
                value: 'candidates',
            }
            ],
            filterStatusOptions: [
                { text: 'All Renewals ', clicked: true, value: 'allRenewals' },
                { text: 'Upcoming Renewals', clicked: false, value: 'Upcoming' },
                { text: 'Expired', clicked: false, value: 'Expired' },
                { text: 'Initiated', clicked: false, value: 'Initiated' },
            ],
            renewalsList: [],
            TotalRenewals: 0,
            type: "allRenewals",
            previousIndex: 0,
            page: 1,
            itemsPerPage: 10,
            search: '',
            addDialog : false, 
            employeeId : '', 
            CompanyId : '',
        }
    },
    async mounted() {
        await this.getAllRenewals();
    },
    methods: {
        async getAllRenewals() {
            this.renewalsList = []
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.$post(`/renewals/AllRenewals/${this.type}?page=${this.page}&perPage=${this.itemsPerPage}&Search=${this.search}`, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    // console.log(response, "Response")
                    this.renewalsList = response.renewals
                    this.TotalRenewals = response.TotalRenewals
                })
                .catch((err) => console.log(err))
        },
        handleCloseDialog(){
            this.addDialog = false
            this.CompanyId = ''
            this.employeeId = ''
        },  
        ViewRenewals(item) {
            if(item.process == 'Initiated') {
                this.$emit('renewalDetails' , item)
            } else {
                this.CompanyId = item.companyDetails._id
                this.employeeId = item.userDetails._id
                this.addDialog = true
            }
        }, 
        async GetPagination({ page, itemsPerPage, sortBy }) {

            this.page = page
            this.itemsPerPage = itemsPerPage
            this.getAllRenewals();

        },
        viewRequest() {

        },
        handleClick(index) {
            this.filterStatusOptions[index].clicked = true
            this.type = this.filterStatusOptions[index].value
            this.filterStatusOptions[this.previousIndex].clicked = false
            this.previousIndex = index
            this.getAllRenewals()
        },
        getStatusColor(val) {
            if (val == 'Not Started') return '#FABC2A'
            if (val == 'Pending') return '#028090'
            if (val == 'Initiated') return '#5B2E48'
        },
        async handleRenewals() {

        },
        ShowRenewalsList() {
            this.$emit('renewalDetails')
        }
    }
}



</script>



<style></style>