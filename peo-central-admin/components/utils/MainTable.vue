<template>
    
    <!-- Sales Table -->
    <!-- obj: all_data_headers /  all_data / all_data_search / selected -->
    <v-col sm="12" md="12" lg="12">
        <v-card color='card_bg'  id="card">
            <v-card-text id="card-text" style="margin-top: 0 !important;">
            <v-data-table
            class="main__table elevation-0"
            :v-model="all_data"
            :headers="all_data_headers"
            :items="all_data"
            :search="all_data_search"
            item-key="selected"
            selectable-key="id"
            show-select
            hide-default-footer
            >
            
            <!-- Top -->
            <template v-slot:top>
                <div class="top__con">

                <!-- Search Bar -->
                <v-text-field
                    class="search_bar"
                    v-model="all_data_search"
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

                <!-- Action Buttons -->
                <div class="action__btn">
                    <v-menu
                    transition="slide-y-transition"
                    rounded="lg"
                    offset-y
                    >
                    <template v-slot:activator="{ attrs, on }">
                        <v-btn class="tall__btn" color="primary" v-bind="attrs" v-on="on">
                        New
                        <LightArrow class="ml-2" style="max-width: 10px;"/>
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item v-for="(item, index) in new_transaction_menu" :key="index" link>
                        <v-list-item-title class="">
                            <span class="n_text text--text ml-2">{{ item. title }}</span>
                        </v-list-item-title>
                        </v-list-item>
                    </v-list>
                    </v-menu>
                    
                    <v-btn class="tall__btn ml-2 subtext--text" color="subtext" outlined>
                    <v-icon class="mr-2" small>fa-filter</v-icon>
                    Filter
                    </v-btn>
                </div>

                </div>
            </template>

            <!-- Table Header -->
            <!-- <template v-slot:header="{ props }">
                <th v-for="head in props.all_data_headers" :key="head">{{ head.text }}</th>
            </template> -->

            <!-- Table Rows -->
            <template v-slot:item="{ item,index }">
                <tr style="">
                <td class="pa-0 ma-0 status__remark">
                    <div class="flex_row align-center justify-center  ">
                    <v-checkbox color="info" on-icon="fa-light fa-square-check" off-icon="fa-regular fa-square" class="mx-auto mb-2" dense hide-details :v-model="selected" ></v-checkbox>
                    </div>
                </td>
                <td class="pa-0 ma-0">{{ item.date }}</td>
                <td class="pa-0 ma-0">{{ item.customer }}</td>
                <td class="pa-0 ma-0">{{ item.type }}</td>
                <td class="pa-0 ma-0">{{ item.dueDate }}</td>
                <td class="pa-0 ma-0">{{ item.b_tax }}</td>
                <td class="pa-0 ma-0">{{ item.tax }}</td>
                <td class="pa-0 ma-0">{{ item.total }}</td>
                <td class="pa-0 ma-0" style="min-width: fit-content !important;max-width: 130px !important;">
                    <div class="status__con">
                    <span class="status light_accent4 accent4--text" v-if="item.status=='paid'">{{ item.status }}</span>
                    <span class="status light_accent3 accent3--text" v-if="item.status=='closed'">{{ item.status }}</span>
                    <span class="status light_primary primary--text" v-if="item.status=='converted'">{{ item.status }}</span>
                    <span class="status light_accent1 accent1--text" v-if="item.status=='partially paid'">{{ item.status }}</span>
                    </div>
                </td>
                <td class="pa-0 ma-0 status_end__remark" style="width: 30px;">
                    <div class="actions__con">
                    <span class="print primary--text">Print</span>
                    <v-btn color="subtext" icon><v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                    </div>
                </td>
                </tr>
            </template>

            </v-data-table>
            </v-card-text>
        </v-card>
    </v-col>

</template>

<script>
 
export default {
    data() {
        return {
            new_transaction_menu: [
                { title: 'Invoice', value: 'invoice' },
                { title: 'Payment', value: 'payment' },
                { title: 'Estimate', value: 'estimate' },
                { title: 'Sales Reciept', value: 'sales_reciept' },
                { title: 'Tax Credit Note', value: 'tax_credit' },
                { title: 'Time Activity', value: 'time_activity' },
                { title: 'Journal Entry', value: 'journal_entry' },
            ],
            selected: [],
            all_data_search: '',
            all_data: [
                { 
                id: 0,
                date: '',
                action: '',
                },
            ],
            all_data_headers: [
                { text: 'Date', value: 'date', align: 'start' },
                { text: 'Action', value: 'action', sortable: false },
            ],
        }
    }
}
</script>
