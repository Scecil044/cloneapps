<template>
  <div>
    <v-row>
      <v-col cols="12" v-if="loading">
        <div style="justify-content: center;align-items: center;display: flex;">
          <v-img src="/animated/refresh.svg" max-width="fit-content" height="40" contain class="mr-3"></v-img>
        </div>
      </v-col>
      <v-col cols="12" v-else>
        <v-card class="visa-process-timeline overflow-y-auto scroll" style="max-height: 58vh"
          v-if="visa_process_timeline != undefined">
          <v-card-text>
            <h5 class="mb-6">Onboarding History</h5>
            <div class="d-flex justify-space-between box py-4" v-for="(step, index) in visa_process_timeline"
              :key="index">
              <span class="before"
                :style="step.process_status == 'completed' ? lineCompletedStyle : lineNotCompletedStyle"></span>
              <div class="d-flex align-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" stroke-width="3"
                  fill="none" stroke-linecap="round" stroke-linejoin="round"
                  style="border-radius: 50%; background-color: #fff"
                  :style="step.process_status == 'completed' ? completedStyles : notCompletedStyles">
                  <path d="M0 0h24v24H0z" stroke="none"></path>
                  <path d="M5 12l5 5L20 7"></path>
                </svg>
                <div class="ml-6">
                  <h5>{{ step.stage_name }}</h5>
                  <span v-if="step.process_status == 'completed'">{{ 'Completed on ' +
                    convertDateFormat(step.completed_date) }}</span>
                  <span v-else>{{ 'Not Completed' }}</span>
                </div>
                <div class="ml-6" v-if="!visaProcessLoading[index]">
                  <v-img src="/animated/refresh.svg" max-width="28" height="28" class="mr-2" contain></v-img>
                </div>
                <div class="ml-6" v-else-if="step.hasOwnProperty('attachments') && step.attachments.length > 0">
                  <span v-for="(item, idx) in step.attachments" :key="idx">
                    <v-btn color="#fc6060" small class="rounded-xl mx-1" outlined @click="openDocument(item.url)"><v-icon
                        small>mdi-file-document-outline</v-icon>{{ item.type_name }}</v-btn>
                  </span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import '@/assets/scss/_visa.scss'
export default {
  props: ['identifier', 'foreign_id', 'module'],
  data() {
    return {
      loading: true,
      processDetails: {},
      visa_process_timeline: {},
      documentsList: [],
      visaProcessLoading: [],
      visaProcessDataLoaded: false
    }

  },
  async mounted() {
    await this.getProcessDetails()
  },
  methods: {
    convertDateFormat(dateTimeString) {
      const date = new Date(dateTimeString);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      return `${month} ${day} ${year}`;
    },
    openDocument(url) {
      window.open(url)
    },
    async getProcessDetails() {
      if (this.visaProcessDataLoaded){
        console.log("The visa process data has already been loaded")
        return
      }
      this.loading = true
      this.visaProcessLoading = []
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        let response = await this.$axios.$post(`/visaprocess/findbyprocess`, {
          module: this.module,
          foreign_id: this.foreign_id,
          identifier: this.identifier
        }, { headers: { Authorization: AuthStr } })

        this.processDetails = response
        this.visa_process_timeline = response.processes
        this.loading = false

        for (let i = 0; i < this.visa_process_timeline.length; i++) {
          let element = this.visa_process_timeline[i];
          element.attachments = [];
          let obj = {
            foreign_id: this.processDetails.id,
            identifier: element.stage_name,
          }

          this.documentsList = await this.$axios.$post('/documents/identifier/foreignid', obj, { headers: { Authorization: AuthStr } })
          if (this.documentsList.length > 0) {
            this.documentsList.forEach(item => {
              element.attachments.push(item)
            })
          }
          this.visaProcessLoading.splice(i, 1, true)
          this.visaProcessDataLoaded = true
        }
      } catch (error) {
        console.error(error)
        throw new Error(error)
      }

    }
  },
  computed: {
    completedStyles() {
      return {
        stroke: '#1ad598',
        border: '2px solid #1ad598',
      }
    },
    notCompletedStyles() {
      return {
        stroke: '#E2E7F1',
        border: '2px solid #E2E7F1',
      }
    },
    lineCompletedStyle() {
      return {
        backgroundColor: '#1ad598',
      }
    },
    lineNotCompletedStyle() {
      return {
        backgroundColor: '#E2E7F1',
      }
    },
  },
}
</script>
