<template>
    <div>
        <div v-if="type!='forecast'" class="flex_row flex-wrap">
            <v-card color='card_bg' class="totals_card flex_column" v-for="item in data" :key="item.name">
                <div class="flex_row justify-lg-space-between">
                    <span class="subtext--text">{{ item.name }} <span class="ml-2" v-if="item.num > 0">({{ item.num }})</span></span>
                    <div v-if="type==='allSales'">
                        <v-btn v-if="item.name === 'Invoices Paid In'" class="filter__btn" outlined x-small  rounded="0" color="primary" @click="handleChangeFilter" style="border-radius: 5px !important;border: 1px solid #E3E4E6 !important;">{{ filter_by }}</v-btn>
                    </div>
                </div>
                <h1 class="pt-2"><h1 class="ma-0 pa-0 d-inline subtext--text font-weight-thin pr-1">{{ type=='product'||item.name==="Requests Invoice" ? "" : "AED " }}</h1>{{ item.amount | twoDecimals}}</h1>
            </v-card>
        </div>
        <div v-if="type==='forecast'" class="flex_row flex-wrap">
            <!-- card-1 -->
            <v-card color='card_bg' class="totals_forecast_card">
                <h1>98%</h1>
                <v-divider id="divider" vertical></v-divider>
                <span>Probability of achieving sales target for this month</span>
            </v-card>
            <!-- card-2 -->
            <v-card color='card_bg' class="totals_card flex_column">
                <div class="flex_row justify-lg-space-between">
                    <span class="subtext--text">Sales forecast<span class="ml-2">(next 30d)</span></span>
                </div>
                <h1 class="pt-2 flex_row justify-space-between">
                    <h1 class="pt-2"><h1 class="ma-0 pa-0 d-inline subtext--text font-weight-thin pr-1">AED</h1>0</h1>
                    <div class="flex_row justify-space-between align-center">
                        <v-btn class="small__btn" style="border-radius: 5px !important;" color="primary" x-small>M</v-btn>
                        <v-btn class="small__btn ml-1" style="border-radius: 5px !important;" outlined color="outline" x-small>W</v-btn>
                        <v-btn class="small__btn ml-1" style="border-radius: 5px !important;" outlined color="outline" x-small>Y</v-btn>
                    </div>
                </h1>
            </v-card>
            <!-- card-3 -->
            <v-card color='card_bg' class="totals_card flex_column" v-for="item in 2" :key="item.name">
                <div class="flex_row justify-lg-space-between">
                    <span class="subtext--text">Sales forecast<span class="ml-2">(next 30d)</span></span>
                </div>
                <h1 class="pt-2"><h1 class="ma-0 pa-0 d-inline subtext--text font-weight-thin pr-1">AED</h1>0</h1>
            </v-card>
        </div>
    </div>
</template>

<script>
import '@/assets/scss/utils/_totalsCard.scss'
export default {
    props: { data: Array, type: String },
    data() {
        return {
            all_filters: [ 'W', 'M', 'Y' ],
            i: 0,
            filter_by: 'W',
        }
    },
    methods: {
        handleChangeFilter() {
            if(this.i >= 2){
                this.i = 0
                this.i = this.i + 1
            } else {
                this.i = this.i + 1
            }
            this.filter_by = this.all_filters[this.i]
            // changing data depend on the filter_by value W/M/Y
        }
    }
}
</script>
