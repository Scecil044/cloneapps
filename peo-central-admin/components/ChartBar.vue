<template>
  <div>
    <bar-chart :chart-data="data" :options="options" :height="height" />
  </div>
</template>

<script>
import { Bar, mixins } from 'vue-chartjs'
export default {
  name: 'ChartBar',
  extends: Bar,
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
