<template>
    <div>
        <v-card class="selected-step">
            <v-card-text>
                <div>
                    <div class="d-flex align-center mb-4">
                        <h6>SELECT STEP</h6>
                        <div class="d-flex justify-space-evenly">
                            <span v-if="stageList.length > 0" class="step py-2 px-3 mr-2">
                                <v-col cols="12" class="d-flex justify-space-evenly flex-wrap">
                                    <template v-for="(data) in stageList">
                                        <v-btn :key="data._id"
                                            :class="SectionType == data.stage_name ? 'primary' : ''"
                                            :outlined="SectionType !== data.stage_name"
                                            class="mr-1 mb-2 pill-button"
                                            small
                                            rounded
                                            elevation="0"
                                               @click="handleStepClick(data.stage_name)">
                                            <span class="button-text">{{ data.stage_name }}</span>
                                            <span
                                               :class = "[
                                                'count-badge',
                                                 SectionType == data.stage_name ? 'black--text count-badge-active' : 'red--text text--darken-2'
                                               ]"
                                            >
                                        {{ data.count }}
                                        </span>
                                        </v-btn>
                                    </template>
                                </v-col>
                            </span>
                        </div>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
export default {
    data() {
        return {
            stageList: [],
            visaProcessList: [],
            SectionType: 'Labor Cancellation Typing',
            filterType: 'All',
            limit: '10',
            page: 0,
        }
    },
    mounted() {
      this.stageNames()
      this.SectionType = 'Labor Cancellation Typing';
    },
    methods: {
        async stageNames() {
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.$post(`/stages/visaprocess/stages/section/Visa Cancellation`, {}, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.stageList = response
                    // console.log(this.stageList, '----------this.stageList Visa Cancellation')
                    // console.log(this.stageList[0].stage_name, '----------this.stageList[0].stage_name')
                    this.getVisaProcessList(this.stageList[0].stage_name)
                })
        },
        async getVisaProcessList(subStageName) {
            this.$emit('updated', subStageName)
            // this.page = 1;
            // const AuthStr = 'Bearer '.concat(this.$store.state.token)

            // await this.$axios.$post(`/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`, { "section_name": "visa cancellation", "stage_name": subStageName.toLowerCase() }, { headers: { Authorization: AuthStr } })
            //     .then((response) => {
            //         this.visaProcessList = response.results

            //     })
        },
      async handleStepClick(stageName) {
        console.log("handleStepClick called with:", stageName);
        this.SectionType = stageName;
        this.filterType = stageName;

        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        try {
          const response = await this.$axios.$post(
            `/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`,
            {
              "section_name": "visa cancellation",
              "stage_name": stageName
            },
            { headers: { Authorization: AuthStr } }
          );

          this.$emit('stage-change', stageName);
          this.$nuxt.$emit('receivedVisaProcessList', response.results);
        } catch (error) {
          console.error('Error fetching visa list:', error);
        }
      }
    }
}
</script>

<style scoped>

.pill-button {
  border-radius: 9999px !important;
  padding: 0 12px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  min-width: 120px !important;
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
