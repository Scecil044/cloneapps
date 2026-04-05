<template>
  <v-row class="onboarding-visa pb-4">
    <v-col cols="12" class="d-flex">
      <Steps :module="module" :key="module"
        @stage-change="handleStageChange" />
    </v-col>
    <v-col cols="12" md="6" class="px-0 py-0">
      <VisaProcessList :current-tab="module" :module="module" :stage-name="subStageName"
        @VisaProcessListClicked="clickedVisaProcessList($event)"
        :key="module" />
    </v-col>
    <v-col cols="12" md="6" class="px-0  py-0 position-relative">

      <!-- <template v-if="ShowDetails"> -->
        <VisaProcessTimeline :visa-process-timeline-data="selectedVisaProcess" class="position-absolute-fit-overflow"
          update-process="updateProcess" />
      <!-- </template> -->
      <!-- <template v-else>
        <v-card class="d-flex align-items-center" height="fit-content" variant="outlined" flat>
          <v-card-title>No details to display</v-card-title>
        </v-card>
      </template> -->
    </v-col>
  </v-row>
</template>

<script>
import Steps from '~/components/Visa/Steps.vue'
// import AllLeadsList from '~/components/Leads/AllLeadsList.vue'
import VisaProcessTimeline from '~/components/Visa/VisaProcessTimeline.vue'
import VisaProcessList from '~/components/Visa/VisaProcessList.vue'

export default {
  components: {
    Steps,
    // AllLeadsList,
    VisaProcessTimeline,
    VisaProcessList
  },
  props: { module: String },
  data() {
    return {
      subStageName: "",
      showsteps: true,
      status: 'preApproved',
      sectionTitle: 'All Requests',
      selectedVisaProcess: '',
      ShowDetails: false,
      ShowList: false,
      limit: '10',
      page: 0,
      newProList: []
    }
  },
  mounted() {
    this.subStageName = this.getDefaultStageName();
  },
  methods: {
    updateProcess(event) {
      this.showsteps = false
      setTimeout(() => {
        this.showsteps = true
      }, 100);
    },
    getDefaultStageName() {
      switch (this.module?.toLowerCase()) {
        case 'new visa process':
          return 'mol offer letter';
        case 'visa renewal':
          return 'MOL Letter';
        case 'visa cancellation':
          return 'Labor Cancellation Typing';
        default:
          return 'mol offer letter';
      }
    },
    clickedVisaProcessList($event) {
      this.selectedVisaProcess = []
      // console.log($event, '----------$event')
      // this.ShowDetails = false

      if ($event != undefined) {
        this.selectedVisaProcess = $event
        setTimeout(() => {
          this.ShowDetails = true
        }, 1);
      } else {

        this.selectedVisaProcess = $event
        setTimeout(() => {
          this.ShowDetails = true
        }, 1);
      }
    },
    // async handleStageChange(stageName = null) {
    //   console.log("Executing handle stage change", stageName)
    //   this.page = 1;
    //   const params = {
    //     "stage_name": stageName || this.subStageName,
    //     "section_name": this.module
    //   }

    //   try {
    //     const AuthStr = 'Bearer '.concat(this.$store.state.token);
    //     const response = await this.$axios.$post(
    //       `/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`,
    //       params,
    //       { headers: { Authorization: AuthStr } }
    //     );
    //     console.log("The results happened to be **** ", response.results)
    //     this.$nuxt.$emit('receivedVisaProcessList', response.results);

    //     this.ShowList = false;
    //     this.newProList = response.results;
    //     this.ShowList = true;
    //   } catch (error) {
    //     console.error('Error fetching list:', error);
    //   }
    // },
    handleStageChange(stage) {
      this.subStageName = stage
    },
    async getVisaProcessList(event) {
      if (event && event.lists) {
        this.newProList = event.lists;
        await this.$nextTick();
        this.$emit('fetchedVisaProcessList', event)
      }
    },
    async generateVisaProcessList($event) {
      this.page = 1;

      const params = {
        "stage_name": this.subStageName,
        "section_name": "new visa process"
      }



      console.log('called by nuxt emit: ', params)

      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        const response = await this.$axios.$post(
          `/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`,
          params,
          { headers: { Authorization: AuthStr } }
        );
        console.log("The onboarding generated visa process list is", response)
        this.ShowList = false;
        this.newProList = response.results;
        this.ShowList = true;
      } catch (error) {
        console.error('Error generating visa process list:', error);
        this.ShowDetails = false;
      }
    }
  }
}
</script>
