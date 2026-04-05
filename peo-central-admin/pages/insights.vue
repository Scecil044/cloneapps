<template>
  <div>
    <div>
      <div class="d-flex justify-space-between">
        <h2>Leads</h2>
        <v-btn class="short__btn subtext--text mr-2" color="subtext" outlined>
          <filterIcon />
        </v-btn>
      </div>
      <div class="d-flex justify-space-between">
        <v-card
          class="d-flex justify-space-between no-shadow"
          style="width: 55%"
        >
          <div
            v-for="lead in new_leads"
            :key="lead.id"
            class="stats-card"
            style="width: 33.33%"
          >
            <span
              class="line"
              :style="{ backgroundColor: getBackgroundColor(lead.color) }"
            ></span>
            <div>
              <span>{{ lead.title }}</span>
              <strong>{{ lead.number }}</strong>
            </div>
          </div>
        </v-card>
        <v-card style="width: 21%" class="no-shadow">
          <div class="stats-card">
            <span class="line" style="background-color: #1ad598"></span>
            <div>
              <span>Leads conversion</span>
              <strong>30%</strong>
            </div>
          </div>
        </v-card>
        <v-card style="width: 21%" class="no-shadow">
          <div class="stats-card">
            <span class="line" style="background-color: #895bf1"></span>
            <div>
              <span>Leads cycle length</span>
              <strong>1+ weeks</strong>
            </div>
          </div>
        </v-card>
      </div>
    </div>
    <v-row>
      <v-col cols="6" class="pl-0">
        <v-card class="pa-5 no-shadow">
          <div class="d-flex justify-space-between mb-4">
            <h4>New leads growth</h4>
            <div>
              <v-btn class="short__btn">Month</v-btn>
              <v-btn class="short__btn" color="primary">Year</v-btn>
            </div>
          </div>
          <chartjs-bar
            :height="300"
            :width="100"
            :bind="true"
            :datasets="new_leads_growth_datasets"
            :labels="new_leads_growth_labels"
            :option="new_leads_options"
            class="d-flex"
          />
        </v-card>
      </v-col>
      <v-col cols="6" class="pl-0">
        <v-card class="pa-5 no-shadow">
          <h4 class="mb-4">Leads sources by category (in %)</h4>
          <chartjs-horizontal-bar
            :height="300"
            :width="100"
            :bind="true"
            :datasets="leads_categories_datasets"
            :labels="leads_categories_labels"
            :option="leads_categories_options"
            class="d-flex"
          />
        </v-card>
      </v-col>
      <v-col cols="6" class="pl-0">
        <v-card class="pa-5 no-shadow">
          <div class="d-flex justify-space-between mb-4">
            <h4>Leads responses</h4>
            <div>
              <v-btn class="short__btn">Month</v-btn>
              <v-btn class="short__btn" color="primary">Year</v-btn>
            </div>
          </div>
          <div class="d-flex align-center mb-6">
            <span class="point mr-1" style="background-color: #ffb536"></span>
            <span>Response Rate</span>
          </div>
          <chartjs-line
            :height="250"
            :bind="true"
            :datasets="leads_responses_datasets"
            :labels="leads_responses_labels"
            :option="leads_responses_options"
            class="d-flex"
          />
        </v-card>
      </v-col>
      <v-col cols="6" class="pl-0">
        <v-card class="pa-5 no-shadow">
          <div class="d-flex align-center mb-4">
            <h4>Leads velocity</h4>
            <div class="d-flex ml-5 chart-lines">
              <div>
                <span class="line" style="background-color: #1ad598"></span>
                <strong>Closed</strong>
              </div>
              <div>
                <span class="line" style="background-color: #d3f7ec"></span>
                <strong>Pending</strong>
              </div>
            </div>
          </div>
          <chartjs-bar
            :height="300"
            :width="100"
            :bind="true"
            :datasets="leads_velocity_growth_datasets"
            :labels="leads_velocity_growth_labels"
            :option="leads_velocity_options"
            class="d-flex"
          />
        </v-card>
      </v-col>
      <v-col cols="9" class="pl-0">
        <v-card class="pa-5 no-shadow" style="min-height: 165px;">
          <h4 class="mb-4">Leads Pipeline</h4>
          <div class="d-flex flex-wrap">
            <div
              class="pipeline-box mb-4"
              v-for="pipeline in leads_pipeline"
              :key="pipeline.id"
              style="width: 160px; height: 32px"
              :style="getBorderColor(pipeline)"
            >
              <span>{{ pipeline.title }}</span>
              <strong class="num" :style="getBgColor(pipeline)">{{
                pipeline.num
              }}</strong>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="3" class="pl-0">
        <v-card class="pa-5 no-shadow leads-rating" style="min-height: 180px;">
          <span class="line"></span>
          <div>
            <span>Leads service rating</span>
            <strong>4.5</strong>
            <div class="starts my-3">
                <v-icon color="#FFB536" v-for="n in 5" :key="n">fa-star</v-icon>
            </div>
            <span>( 590 Review )</span>
          </div>
        </v-card>
      </v-col>
      <h2 class="mt-7">Employers</h2>
      <v-col cols="12" class="pl-0">
        <div class="d-flex justify-space-between">
          <v-card
            class="d-flex justify-space-between no-shadow"
            style="width: 55%"
          >
            <div
              v-for="lead in new_leads"
              :key="lead.id"
              class="stats-card"
              style="width: 33.33%"
            >
              <span
                class="line"
                :style="{ backgroundColor: getBackgroundColor(lead.color) }"
              ></span>
              <div>
                <span>{{ lead.title }}</span>
                <strong>{{ lead.number }}</strong>
              </div>
            </div>
          </v-card>
          <v-card style="width: 21%" class="no-shadow">
            <div class="stats-card">
              <span class="line" style="background-color: #1ad598"></span>
              <div>
                <span>Leads conversion</span>
                <strong>30%</strong>
              </div>
            </div>
          </v-card>
          <v-card style="width: 21%" class="no-shadow">
            <div class="stats-card">
              <span class="line" style="background-color: #895bf1"></span>
              <div>
                <span>Leads cycle length</span>
                <strong>1+ weeks</strong>
              </div>
            </div>
          </v-card>
        </div>
      </v-col>
      <v-col cols="6" class="pl-0">
        <v-card class="pa-5 no-shadow">
          <h4 class="mb-4">Top employers by Revenue</h4>
          <chartjs-horizontal-bar
            :height="300"
            :width="100"
            :bind="true"
            :datasets="top_employers_revenue_datasets"
            :labels="leads_categories_labels"
            :option="leads_categories_options"
            class="d-flex"
          />
        </v-card>
      </v-col>
      <v-col cols="6" class="pl-0">
        <v-card class="pa-5 no-shadow">
          <h4 class="mb-4">Top employers with highest no. of Employees</h4>
          <chartjs-horizontal-bar
            :height="300"
            :width="100"
            :bind="true"
            :datasets="top_employers_highest_datasets"
            :labels="leads_categories_labels"
            :option="leads_categories_options"
            class="d-flex"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import '@/assets/scss/_insights.scss'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
export default {
  layout: 'dashboard',
  components: {
    filterIcon,
  },
  data() {
    return {
      new_leads: [
        {
          id: 1,
          title: 'New leads this week',
          number: '21',
          color: '#0a94ff',
        },
        {
          id: 2,
          title: 'New leads this month',
          number: '325',
          color: '#895bf1',
        },
        {
          id: 3,
          title: 'New leads this year',
          number: '1552',
          color: '#ffb536',
        },
      ],
      new_leads_growth_datasets: [
        {
          barPercentage: 0.5,
          data: [
            '800',
            '600',
            '700',
            '1000',
            '500',
            '700',
            '900',
            '350',
            '500',
            '700',
            '900',
            '350',
          ],
          backgroundColor: '#0A94FF',
        },
        {
          barPercentage: 0.5,
          data: [
            '800',
            '600',
            '700',
            '1000',
            '500',
            '700',
            '900',
            '350',
            '500',
            '700',
            '900',
            '350',
          ],
          backgroundColor: '#E3E4E6',
        },
      ],
      new_leads_growth_labels: [
        '2011',
        '2012',
        '2013',
        '2014',
        '2015',
        '2016',
        '2017',
        '2018',
        '2019',
        '2020',
        '2021',
        '2022',
      ],
      new_leads_options: {
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex]
            },
          },
          legend: {
            align: 'start',
          },
          title: {},
        },
        legend: {
          display: false,
          align: 'start',
        },
        title: {
          display: false,
          align: 'start',
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                display: true,
              },
              stacked: true,
              gridLines: {
                drawOnChartArea: false,
              },
            },
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                maxTicksLimit: 6,
              },
              gridLines: {
                drawOnChartArea: false,
              },
            },
          ],
        },
      },
      leads_categories_datasets: [
        {
          barPercentage: 0.5,
          data: ['80', '90', '70', '80', '50'],
          backgroundColor: '#1AD598',
        },
      ],
      leads_categories_labels: [
        'Manual',
        'Website',
        'Social Media',
        'Advertisement',
        'Others',
      ],
      leads_categories_options: {
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex]
            },
          },
          legend: {
            align: 'start',
          },
          title: {},
        },
        legend: {
          display: false,
          align: 'start',
        },
        title: {
          display: false,
          align: 'start',
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                display: true,
              },
              stacked: true,
              gridLines: {
                drawOnChartArea: false,
              },
            },
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                maxTicksLimit: 6,
              },
              gridLines: {
                drawOnChartArea: false,
              },
            },
          ],
        },
      },
      leads_responses_datasets: [
        {
          data: ['3', '7', '20', '15', '2', '16', '14'],
          fill: false,
          barThickness: 30,
          borderColor: '#FFB536',
        },
      ],
      leads_responses_labels: ['Jan', 'Fab', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      leads_responses_options: {
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex]
            },
          },
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0, // This property determines the curve of the line
            borderWidth: 3, // This property determines the thickness of the line
            borderColor: 'red', // This property determines the color of the line
            borderRadius: 0, // This property determines the sharpness of the edges of the line
          },
          point: {
            radius: 4, // This property determines the size of the points on the line
          },
        },
        scales: {
          xAxes: [
            {
              type: 'category',
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                display: true,
              },
            },
          ],
          yAxes: [
            {
              // stacked: true,
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                maxTicksLimit: 6,
              },
              gridLines: {
                display: false,
              },
            },
          ],
        },
      },
      leads_velocity_growth_datasets: [
        {
          barPercentage: 0.5,
          data: [
            '1400',
            '1800',
            '1500',
            '1700',
            '800',
            '1200',
            '900',
            '550',
            '1000',
            '700',
            '1200',
            '1800',
          ],
          backgroundColor: '#1ad598',
        },
        {
          barPercentage: 0.5,
          data: [
            '800',
            '600',
            '700',
            '1000',
            '500',
            '700',
            '900',
            '350',
            '500',
            '700',
            '900',
            '350',
          ],
          backgroundColor: '#D3F7EC',
        },
      ],
      leads_velocity_growth_labels: [
        'Jan',
        'Fab',
        'Mar',
        'Apr',
        'Mar',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      leads_velocity_options: {
        plugins: {
          datalabels: {
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex]
            },
          },
          legend: {
            align: 'start',
          },
          title: {},
        },
        legend: {
          display: false,
          align: 'start',
        },
        title: {
          display: false,
          align: 'start',
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                display: true,
              },
              stacked: true,
              gridLines: {
                drawOnChartArea: false,
              },
            },
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                fontFamily: 'sans-serif',
                fontSize: 11,
                beginAtZero: false,
                maxTicksLimit: 6,
              },
              gridLines: {
                drawOnChartArea: false,
              },
            },
          ],
        },
      },
      leads_pipeline: [
        {
          id: '1',
          title: 'Lead Recieved',
          num: '8',
          color: '#0A94FF',
          bgColor: '#CEEAFF4D',
          numBgColor: '#CEEAFF',
        },
        {
          id: '1',
          title: 'Contract Client',
          num: '5',
          color: '#895BF1',
          bgColor: '#E7DEFC4D',
          numBgColor: '#CEEAFF',
        },
        {
          id: '1',
          title: 'Send Proposals',
          num: '7',
          color: '#FFB536',
          bgColor: '#FFF0D64D',
          numBgColor: '#FFF0D6',
        },
        {
          id: '1',
          title: 'Waiting Approval',
          num: '2',
          color: '#FFB536',
          bgColor: '#FFF0D64D',
          numBgColor: '#FFF0D6',
        },
        {
          id: '1',
          title: 'Doc Collection',
          num: '5',
          color: '#FFB536',
          bgColor: '#FFF0D64D',
          numBgColor: '#FFF0D6',
        },
        {
          id: '1',
          title: 'Send Agreement',
          num: '5',
          color: '#FFB536',
          bgColor: '#FFF0D64D',
          numBgColor: '#FFF0D6',
        },
        {
          id: '1',
          title: 'Waiting Approval',
          num: '4',
          color: '#FFB536',
          bgColor: '#FFF0D64D',
          numBgColor: '#FFF0D6',
        },
      ],
      top_employers_revenue_datasets: [
        {
          barPercentage: 0.5,
          data: ['80', '90', '70', '80', '50'],
          backgroundColor: '#0A94FF',
        },
      ],
      top_employers_highest_datasets: [
        {
          barPercentage: 0.5,
          data: ['80', '90', '70', '80', '50'],
          backgroundColor: '#895BF1',
        },
      ],
    }
  },
  methods: {
    getBackgroundColor(value) {
      return value
    },
    getBorderColor(pipeline) {
      return {
        borderLeft: `3px solid ${pipeline.color}`,
        backgroundColor: pipeline.bgColor,
      }
    },
    getBgColor(pipeline) {
      return {
        backgroundColor: pipeline.numBgColor,
        color: pipeline.color,
      }
    },
  },
}
</script>
