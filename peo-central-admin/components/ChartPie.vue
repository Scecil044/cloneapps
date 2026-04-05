<template>
  <div>
    <pie-chart :chart-data="data" :options="options" :height="height" />
  </div>
</template>

<script>
import { Pie, mixins } from 'vue-chartjs'
export default {
  name: 'ChartPie',
  extends: Pie,
  props: {
    data: { type: Object, required: true },
    options: { type: Object, default: () => ({}) },
    height: { type: [Number, String], default: 300 }
  },
  mounted() {
    this.renderChart(this.data, this.options)
  },
  watch: {
    data: {
      handler(newData) {
        this.renderChart(newData, this.options)
      },
      deep: true
    }
  }
}
</script>
