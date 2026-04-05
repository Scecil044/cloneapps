
<template>
    <v-row>
        <TotalsCard :data="total_reimbursement" />
        <v-row class="row1">
            <v-col sm="12" md="12" lg="12">
                <v-card color='card_bg'  id="card">
                    <v-card-text id="card-text" style="margin-top: 0 !important;">
                        <v-data-table id="REIMBURSEMENT"
                            class="main__table elevation-0"
                            :v-model="reimbursement_data"
                            :headers="reimbursement_headers"
                            :items="reimbursement_data"
                            :search="reimbursement_search"
                            hide-default-footer
                            >
                            <template v-slot:top>
                            <h4 class="mb-5">Reimbursement Request</h4>
                            <div class="top__con">
                                <v-text-field
                                class="search_bar"
                                v-model="reimbursement_search"
                                label="Search By"
                                color="outline"
                                outlined
                                solo
                                flat
                                hide-details
                                dense
                                height="45px"
                                >
                                <template slot="prepend-inner">
                                    <v-btn icon><v-icon small>fa-search</v-icon></v-btn>
                                </template>
                                </v-text-field>
                                <div class="action__btn">
                                <v-btn class="tall__btn ml-2 subtext--text" color="subtext" outlined @click="filterDialog=true">
                                    <v-icon class="mr-2" small>fa-filter</v-icon>
                                    Filter
                                </v-btn>
                                </div>
                            </div>
                            </template>
                            <template v-slot:item="{ item,index }">
                            <tr style="">
                                <td class="pa-0 ma-0">{{ item.employee }}</td>
                                <td class="pa-0 ma-0">{{ item.type }}</td>
                                <td class="pa-0 ma-0">{{ item.memo }}</td>
                                <td class="pa-0 ma-0">{{ item.date }}</td>
                                <td class="pa-0 ma-0">{{ item.amount }}</td>
                                <td class="pa-0 ma-0" style="min-width: fit-content !important;max-width: 100px !important;">
                                <div class="status__con">
                                    <span class="status light_accent4 accent4--text" v-if="item.status=='paid'">{{ item.status }}</span>
                                    <span class="status light_accent3 accent3--text" v-if="item.status=='closed'">{{ item.status }}</span>
                                    <span class="status light_primary primary--text" v-if="item.status=='converted'">{{ item.status }}</span>
                                    <span class="status light_accent1 accent1--text" v-if="item.status=='partially paid'">{{ item.status }}</span>
                                </div>
                                </td>
                                <td class="pa-0 ma-0 text-right">
                                    <v-btn class="short__btn text--text ml-2" color="subtext" outlined>View Receipt</v-btn>
                                    <v-btn class="short__btn text_light--text ml-2" color="success">Approve</v-btn>
                                    <v-btn class="short__btn text_light--text ml-2" color="error">Decline</v-btn>
                                </td>
                            </tr>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-row>
</template>

<script>
// import '@/assets/scss/_suppliers.scss'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
export default {
    components: { TotalsCard },
    data() {
        return {
            // Reimbursement
            reimbursement_search: '',
            reimbursement_selected: [],
            reimbursement_data: [
                { 
                id: 0,
                employee: 'Apollo Nida',
                type: 'Reimbursement expense',
                memo: 'Client meeting- saudi',
                date: '00-00-0000',
                amount: 'AED 5232',
                status: 'paid',
                color: '#1AD598',
                action: '',
                },
            ],
            reimbursement_headers: [
                { text: 'Employee', value: 'employee' },
                { text: 'Type', value: 'type' },
                { text: 'Memo', value: 'memo' },
                { text: 'Request Date', value: 'date' },
                { text: 'Amount', value: 'amount' },
                { text: 'Status', value: 'status' },
                { text: 'Action', value: 'action', sortable: false, align: 'center' },
            ],
            total_reimbursement: [
                { name: 'Total Reimbursement this year', amount: '06' },
                { name: 'Most Reimbursed category', amount: '-' },
                { name: 'Avg Reimbursement', amount: '0' },
            ],
        }
    }
}