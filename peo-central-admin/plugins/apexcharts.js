import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'

if (process.client) {
  Vue.component('apexchart', VueApexCharts)
}

