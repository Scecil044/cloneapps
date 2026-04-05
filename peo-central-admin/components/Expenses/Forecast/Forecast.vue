<template>
    <v-row>
        <v-col cols="12">
        <!-- FILTER DIALOG -->
        <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="500px">
            <v-card id="card" style="padding: 20px 30px !important">
                <v-card-title id="card-title">
                    <h4 class="text--text">Filter</h4>
                    <v-icon small color="subtext" class="ml-5" @click="filterDialog=false">fa-close</v-icon>
                </v-card-title>
                <v-card-text id="card-text">
                    <v-container class="ma-0 pa-0">
                        <v-radio-group>
                            <v-radio value="all">
                                <template v-slot:label>
                                    <span class="text--text">All</span>
                                </template>
                            </v-radio>
                            <v-radio value="week">
                                <template v-slot:label>
                                    <span class="text--text">Week to date</span>
                                </template>
                            </v-radio>
                            <v-radio value="month">
                                <template v-slot:label>
                                    <span class="text--text">This month to date</span>
                                </template>
                            </v-radio>
                            <v-radio value="quarter">
                                <template v-slot:label>
                                    <span class="text--text">This quarter to date</span>
                                </template>
                            </v-radio>
                            <v-radio value="year">
                                <template v-slot:label>
                                    <span class="text--text">This year to date</span>
                                </template>
                            </v-radio>
                            <v-radio value="specific">
                                <template v-slot:label>
                                <span class="text--text" @click="customDataDisabled=!customDataDisabled">Specific dates</span>
                                </template>
                            </v-radio>
                        </v-radio-group>
                        <div class="custom_data">
                            <v-row class="ma-0 pa-0">
                                <v-spacer></v-spacer>
                                <v-col cols="8" class="ma-0 pa-0">
                                <div class="flex_row align-baseline ">
                                    <span>From</span>
                                    <div><v-select :disabled="customDataDisabled" :items="daysOfWeek" placeholder="12" style="max-width: 90px !important" class="ml-9"></v-select></div>
                                    <div><v-select :disabled="customDataDisabled" :items="monthsOfYear" placeholder="Jan" style="max-width: 90px !important" class="ml-3"></v-select></div>
                                    <div><v-select :disabled="customDataDisabled" :items="Years" placeholder="2022" style="max-width: 120px !important" class="ml-3"></v-select></div>
                                </div>
                                </v-col>
                            </v-row>
                            <v-row class="ma-0 pa-0">
                                <v-spacer></v-spacer>
                                <v-col cols="8" class="ma-0 pa-0">
                                <div class="flex_row align-baseline ">
                                    <span>Till</span>
                                    <div><v-select :disabled="customDataDisabled" :items="daysOfWeek" placeholder="14" style="max-width: 90px !important" class="ml-9"></v-select></div>
                                    <div><v-select :disabled="customDataDisabled" :items="monthsOfYear" placeholder="Mar" style="max-width: 90px !important" class="ml-3"></v-select></div>
                                    <div><v-select :disabled="customDataDisabled" :items="Years" placeholder="2022" style="max-width: 120px !important" class="ml-3"></v-select></div>
                                </div>
                                </v-col>
                            </v-row>
                        </div>
                        <div class="other_filters mt-2">
                            <v-row>
                                <v-col cols="6" class="ma-0 pa-0"><v-checkbox color="primary" label="Customer"></v-checkbox></v-col>
                                <v-col cols="6" class="ma-0 pa-0"><v-select :items="customerFilter" label="All"></v-select></v-col>
                                <v-col cols="6" class="ma-0 pa-0"><v-checkbox color="primary" label="Status"></v-checkbox></v-col>
                                <v-col cols="6" class="ma-0 pa-0"><v-select :items="statusFilter" label="Paid"></v-select></v-col>
                            </v-row>
                        </div>
                        <v-row class="action_btn mt-5">
                            <v-col cols="5" class="ma-0 pa-0"><v-btn class="tall__btn" color="subtext" block outlined><span class="primary--text">Clear All</span></v-btn></v-col>
                            <v-spacer></v-spacer>
                            <v-col cols="6" class="ma-0 pa-0"><v-btn class="tall__btn" color="primary" block @click="handleApplyFilter">Apply</v-btn></v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- TOP TOTALS CARDS -->
        <!-- <TotalsCard :data="total_forecast" type="forecast" :class=" privacyMood ? 'privacyMood' : '' " /> -->
        <!-- FORECAST CHARTS -->
        <v-row class="mid_row">
            <v-col sm="12" md="4" lg="4">
                <ForecastedChart />
            </v-col>
            <v-col sm="12" md="8" lg="8">
                <!-- <SalesForecastChart :topData="forecast_titles" :data="forecastSalesChartData" :options="forecastSalesChartOptions" :colors="forecastSalesChartColors" /> -->
                <SalesForecastChart :topData="forecast_titles" />
            </v-col>
        </v-row>
        <!-- FORECAST DATA TABLE -->
        <v-row class="row1">
            <v-col cols="12">
                <v-card color="card_bg" id="card">
                    <v-card-text id="card-text" style="margin-top: 0 !important;" :class="privacyMood?'privacyMood':''">
                        <v-data-table 
                        id="FORECAST"
                        class="main__table elevation-0"
                        :v-model="data"
                        :headers="headers"
                        :items="data"
                        :search="search"
                        item-key="selected"
                        selectable-key="id"
                        hide-default-footer
                        >
                        <template v-slot:top>
                            <div class="top__con">
                                <v-text-field
                                class="search_bar"
                                v-model="search"
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
                        <template v-slot:item.status="{ item }">
                        <div class="status__con">
                        <span :class="item.status == 'Open' ? 'light_accent4 accent4--text' : 'light_accent2 accent2--text'" class="status">
                            {{ item.status == 'Open' ? 'Open' : 'Close' }}
                        </span>
                        </div>
                    </template>
                        <template v-slot:item.action="{ item }">
                            <td class="pa-0 ma-0" style="width: 30px">
                                <div class="actions__con">
                                    <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                                    <template v-slot:activator="{ attrs, on }">
                                        <v-btn v-bind="attrs" v-on="on" color="subtext" class="mx-2" icon >
                                        <v-icon small>fa-solid fa-ellipsis-vertical</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item>
                                        <v-list-item-title class="">
                                            <span class="n_text text--text mx-auto">No Action </span>
                                        </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                    </v-menu>
                                </div>
                            </td>
                        </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        </v-col>
    </v-row>
</template>
  
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import ForecastedChart from '@/components/Sales/Forecast/ForecastedChart.vue'
import SalesForecastChart from '@/components/Sales/Forecast/SalesForecastChart.vue'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
  
  export default {
      components:{ CustomInputContainer, ForecastedChart, SalesForecastChart, TotalsCard },
      props: { data: Object },
      data() {
        return {
            privacyMood: false,
            // Forecast Sales Chart Data
            forecastSalesChartData: {
                labels: ['Jan', 'Feb', 'Mar', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [
                {
                    label: "Monthly-invoice",
                    data: [50, 100, 30, 60, 10, 30, 90, 20],
                    borderColor: "rgba(72,255,0,0.31)",
                    pointBackgroundColor: "white",
                    borderWidth: 2,
                    pointBorderColor: "gray",
                    backgroundColor: "#ABF9B5"
                }
                ]
            },
            forecastSalesChartColors: {
                start: "rgba(255, 0, 0, 0.5)",
                middle: "rgba(255, 0, 0, 0.25)",
                end: "rgba(255, 0, 0, 0)"
            },
            forecastSalesChartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                display: false
                },
                title: {
                display: true,
                text: "Total Invoices",
                fontSize: 24,
                fontColor: "#6b7280"
                },
                tooltips: {
                backgroundColor: "#f95050"
                },
                scales: {
                xAxes: [
                    {
                    gridLines: {
                        display: false
                    }
                    }
                ],
                yAxes: [
                    {
                    ticks: {
                        beginAtZero: true
                    },
                    gridLines: {
                        display: true
                    }
                    }
                ]
                }
            },
        
            // FILTER DIALOG
            filterDialog: false,
            filter_by: [ 'All', 'Week to date', 'This month to date', 'This quarter to date', 'This year to date', 'Specific dates'], 
            customerFilter: ['All', 'Other',],
            statusFilter: ['Paid', 'Unpaid'],
            daysOfWeek: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            monthsOfYear: ['Jan', 'Feb', 'Mar', 'Apr'],
            Years: [2022, 2021, 2020],
            customDataDisabled: true,
            // DATA TABLE
            search: '',
            selected: [],
            headers: [
                { text: 'Expected Close Date', value: 'date', align: 'start' },
                { text: 'Customer', value: 'customer' },
                { text: 'Value', value: 'value' },
                { text: 'Status', value: 'status', align: 'center' },
                { text: 'Action', value: 'action', sortable: false },
            ],
            // TOTALS TOP CARDS + FORECASTED CHART
            total_forecast: [
                { name: 'Sales forecast (next 30d)', amount: '0' },
                { name: 'Sales pipeline forecast', amount: '0' },
                { name: 'Monthly Reoccurring Revenue', amount: '50,896' },
            ],
            forecast_titles: [
                { name: 'Sales', color: 'accent2' },
                { name: 'Forecasted sales', color: 'accent1' },
                { name: 'Reoccurring Revenue', color: 'primary' },
                { name: 'Sales Target', color: 'accent3' },
            ],
        }
    },
    methods: {
        handleApplyFilter(){
            console.log("add function for handleApplyFilter here")
        }
    },
    watch: {},
  }
</script>