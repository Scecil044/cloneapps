<template>
  <div class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-p-6 tw-transition-transform tw-duration-300 hover:tw-shadow-md">
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
      <h3 class="tw-text-lg tw-font-semibold tw-text-gray-800">Client Industries Distribution</h3>
      <div class="tw-flex tw-items-center tw-space-x-2">
        <v-icon color="primary" size="20">mdi-chart-pie</v-icon>
      </div>
    </div>
    <div class="chart-container tw-h-80">
      <apexchart
        type="pie"
        height="100%"
        :options="chartOptions"
        :series="chartSeries"
      ></apexchart>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientIndustryChart',
  props: {
    industryData: {
      type: Array,
      required: true
    }
  },
  computed: {
    processedData() {
      if (!this.industryData || this.industryData.length === 0) {
        return [];
      }
      
      // Transform data and handle null/empty values
      const transformedData = this.industryData.map(item => ({
        name: item._id === null || item._id === '' || item._id === 'NA' ? 'Not Specified' : item._id,
        value: item.count
      }));
      
      // Sort by count in descending order
      transformedData.sort((a, b) => b.value - a.value);
      
      // Take the top 10 industries and group the rest as "Others"
      if (transformedData.length > 10) {
        const topIndustries = transformedData.slice(0, 9);
        const otherIndustries = transformedData.slice(9);
        
        const othersTotal = otherIndustries.reduce((sum, item) => sum + item.value, 0);
        
        if (othersTotal > 0) {
          topIndustries.push({
            name: 'Others',
            value: othersTotal
          });
        }
        
        return topIndustries;
      }
      
      return transformedData;
    },
    chartSeries() {
      return this.processedData.map(item => item.value);
    },
    chartLabels() {
      return this.processedData.map(item => item.name);
    },
    chartOptions() {
      return {
        chart: {
          type: 'pie',
          fontFamily: 'Poppins, Arial, sans-serif',
          toolbar: {
            show: false
          }
        },
        labels: this.chartLabels,
        dataLabels: {
          enabled: true,
          formatter: function (val, opts) {
            return opts.w.config.series[opts.seriesIndex]
          }
        },
        legend: {
          position: 'bottom',
          fontFamily: 'Poppins, Arial, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          offsetY: 10
        },
        plotOptions: {
          pie: {
            expandOnClick: true,
            donut: {
              size: '55%',
              background: 'transparent'
            }
          }
        },
        colors: [
          '#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
          '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'
        ],
        tooltip: {
          y: {
            formatter: function(val, { seriesIndex, w }) {
              // Calculate percentage
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              const percentage = ((val * 100) / total).toFixed(1);
              return `${val} clients (${percentage}%)`
            }
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom'
            }
          }
        }],
        stroke: {
          width: 2,
          colors: ['#fff']
        }
      };
    }
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
