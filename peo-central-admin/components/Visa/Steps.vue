<template>
  <div class="d-flex justify-space-evenly" elevation="0">
    <div cols>
      <div class="d-flex align-center mb-2 justify-space-evenly">
        <!-- <h6>SELECT STEP</h6> -->
        <div class="d-flex justify-space-evenly">
          <span v-if="stageList.length > 0" class="step py-2 px-3 mr-2">
            <div class="d-flex justify-space-evenly flex-wrap">
              <template v-for="(data) in stageList">
                <v-btn :key="data._id" :color="SectionType == data.stage_name ? 'pink lighten-1' : ''"
                  :outlined="SectionType !== data.stage_name" class="mr-1 mb-2 pill-button" elevation="0" small rounded
                  @click="handleStepClick(data.stage_name)"><span class="button-text">{{ data.stage_name
                    }}</span>
                  <span :class="[
                        'count-badge',
                        SectionType == data.stage_name ? 'black--text count-badge-active' : 'red--text text--darken-2'
                      ]">
                    {{ data.count }}
                  </span>
                </v-btn>
              </template>
            </div>
          </span>
        </div>
      </div>

      <div class="d-flex align-center  bg-">
        <!-- <h6>SUB STEP</h6> -->
        <div class="d-flex">
          <span v-if="subStageList.length > 0" class="step py-2 px-3 mr-2">
            <div class="d-flex justify-space-evenly flex-wrap">
              <template v-for="(data) in subStageList">

                <v-btn :color="subFilterType === data.stage_name ? 'pink lighten-1' : ''"
                  :outlined="subFilterType !== data.stage_name" class="mr-1 mb-2 pill-button" small elevation="0"
                  rounded @click="handleStepClick(data.stage_name, 'sub')">
                  <span class="button-text">{{ data.stage_name }}</span>
                  <span :class="[
                        'count-badge',
                        subFilterType === data.stage_name ? 'black--text count-badge-active' : 'red--text text--darken-2'
                      ]">
                    {{ data.count }}
                  </span>
                </v-btn>
              </template>
            </div>
          </span>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import '@/assets/scss/_billings.scss'
import letterEditVue from '../reuseable/letterEdit.vue'
const _ = require('lodash')

export default {
  props: {
    count: {
      default: 2,
      type: Number,
    },
    module: {
      type: String,
      default: 'new visa process'
    }
  },
  data() {
    return {
      activeIndex: 0,
      activeIndex2: 0,
      SectionType: 'MOL Application',
      filterType: 'All',
      subFilterType: 'User Acceptance',
      section_new: '',
      stageList: [],
      subStageList: [],
      limit: '10',
      page: 0,
      clickedSteps: {
        mainStep: '',
        subStep: ''
      }
    }
  },
  async mounted() {
    this.SectionType = this.defaultActiveSection
    await this.stageNames()
  },
  computed: {
    // processName(){
    //   let process_data = []
    //   if( this.SectionType == 'MOL Application'){
    //     process_data = this.stageList
    //   }

    //   return process_data
    // },
    getModule() {
      if (this.module == 'visa cancellation') {
        return 'Visa Cancellation'
      } else {
        return 'Visa Renewal'
      }
    },
    defaultActiveSection() {
      if (this.module == 'new visa process') {
        return 'MOL Application'
      }
      if (this.module == 'visa renewal') {
        return 'MOL Letter'
      }
      if (this.module == 'visa cancellation') {
        return 'Labor Cancellation Typing'
      }
      return 'MOL Application'
    }
  },
  methods: {
    selectStep(index) {
      this.activeIndex === index
        ? (this.activeIndex = null)
        : (this.activeIndex = index)
    },
    selectSubStep(index) {
      this.activeIndex2 === index
        ? (this.activeIndex2 = null)
        : (this.activeIndex2 = index)
    },
    async stageNames() {
      try {
        console.log("this is the new function to get stage counts%%%%%%%%%%%%%%%%%%%%")
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const url = ['new visa process', ''].includes(this.module) ? `/stages/visaprocess/stages` : `/stages/visaprocess/stages/section/${this.getModule}`
        const response = await this.$axios.$post(url, {process_type: this.module}, { headers: { Authorization: AuthStr } })

        this.stageList = response
        console.log('getting main stage list: ', response)
        this.SectionType = this.stageList[0].stage_name
        console.log('section List: ', this.stageList[0].stage_name)
        console.log('section List: ', this.SectionType)

        // select first stage
        await this.getSubStages(this.SectionType)
        // handle auto selection of first step
        this.requestVisaProcessListUpdate()
      }
      catch (error) {
        console.log('An error occurred while getting main stages: ', error)
      }
    },
    async getSubStages(stage_name) {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$post(`/stages/visaprocess/stages/section/${stage_name}`, {process_type: this.module}, { headers: { Authorization: AuthStr } })
        this.subStageList = response
        console.log('checking substages: ', response)
        this.subFilterType = this.subStageList[0].stage_name
        // console.log(this.subStageList, '-----------this.subStageList')
      } catch (error) {
        console.log('An error occurred: ', error)
      }
    },
    async handleStepClick(stageName, step_type = 'main') {
      // this.clickedSteps.mainStep = stageName;
      if (step_type == 'main') {
        this.SectionType = stageName;
        await this.getSubStages(stageName);
      } else {
        this.subFilterType = stageName;
      }

      this.requestVisaProcessListUpdate()
    },
    async handleSubStepClick(stageName) {
      this.clickedSteps.subStep = stageName;
      this.subFilterType = stageName;
      this.filterType = stageName;

      // const AuthStr = 'Bearer '.concat(this.$store.state.token)
      // try {
      //   const response = await this.$axios.$post(
      //     `/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`,
      //     {
      //       "section_name": this.module,
      //       "stage_name": stageName.toLowerCase()
      //     },
      //     { headers: { Authorization: AuthStr } }
      //   );

      //   this.$nuxt.$emit('receivedVisaProcessList', response.results);
      // } catch (error) {
      //   console.error('Error fetching visa list:', error);
      // }
    },
    requestVisaProcessListUpdate() {
      let payload = {
        section_name: this.module,
        stage_name: this.SectionType.toLowerCase(),
      }
      if (this.subStageList.length > 0) {
        payload['stage_name'] = this.subFilterType.toLowerCase()
      }
      this.$nuxt.$emit('update-process-list', payload);
      // this.$emit('stage-change', subStageName.toLowerCase());
    }
  },

}
</script>
<style scoped>
.pill-button {
  border-radius: 50%;
  padding: 0 12px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  /* min-width: 120px !important; */
}

.button-text {
  flex: 1;
  text-align: left;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count-badge {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.75rem;
  min-width: 20px;
  text-align: center;
  display: inline-block;
  line-height: 1.5;
  flex-shrink: 0;
  font-weight: 600;
}

.count-badge-active {
  background-color: white;
  font-weight: 700;
}
</style>
