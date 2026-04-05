<template>
    <v-card id="card">
        <v-card-title id="card-title">
        <h4>Sales Forecast</h4>
        <div class="flex_row">
            <div class="flex_row align-center pa-2 mr-2" v-for="item in topData" :key="item.id">
                <div :class="item.color" class="dote mr-2" style="min-width: 15px;min-height: 6px;border-radius: 3px;"></div>
                <span class="subtext--text">{{ item.name }}</span>
            </div>
        </div>
        </v-card-title>
        <v-card-text id="card-text">

            
            <!-- vuechart.js -->
            <!-- <v-col cols="12">
                <line-chart
                class="text--text"
                ref="lineChart"
                :chart-data="data"
                :colors="colors"
                :chart-options="options"
                />
            </v-col> -->


            <!-- chart.js -->
                <v-col cols="12" class="pa-0">
                    <chartjs-line
                    :height="150"
                    :bind="true"
                    :datasets="datasets"
                    :labels="labels"
                    :option="option_distribution"
                    />
                </v-col>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: [
        'topData',
        'data', 
        'options', 
        'colors' 
    ],
    data() {
        return {


        labels: ["Jan", "Apr", "Jul", "Sep", "Dec"],
      datasets: [
            {
            type: 'bar',
            label: 'Dataset 1',
            backgroundColor: '#ddd',
            borderColor: '#ddd' ,
            data: {count: 7, min: 0, max: 100},
        }, {
            type: 'bar',
            label: 'Dataset 2',
            backgroundColor: '#ddd',
            borderColor: '#ddd' ,
            data: {count: 7, min: 0, max: 100},
        }, {
            type: 'line',
            label: 'Dataset 3',
            backgroundColor: '#ddd',
            borderColor: '#ddd' ,
            fill: false,
            data: {count: 7, min: 0, max: 100},
        }
      ],
      option_distribution: {
        legend: {
          display: true,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    
        }
    }

}
</script>

<style>

</style>