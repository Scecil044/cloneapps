<template>
  <v-row class="onboarding-visa pb-4">
    <v-col
      cols="12"
      class="d-flex"
    >
      <Steps
        @stage-change="handleStageChange"
        @updated="getVisaProcessList"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
      class="px-0 py-0"
    >
      <VisaProcessList
        :currentTab="currentTab"
        :newProList="newProList"
        @VisaProcessListClicked="clickedVisaProcessList($event)"
        @fetchedVisaProcessList="generateVisaProcessList($event)"
        :key="newProList.length"
      />
    </v-col>
    <v-col
      cols="12"
      md="6"
      class="px-0 position-relative"
    >

      <template v-if="ShowDetails">
        <VisaProcessTimeline
          :visa-process-timeline-data="selectedVisaProcess"
          class="position-absolute-fit-overflow"
          update-process="updateProcess"
        />
      </template>
      <template v-else>
        <v-card class="d-flex align-items-center" height="fit-content" variant="outlined" flat>
          <v-card-title>No details to display</v-card-title>
        </v-card>
      </template>
    </v-col>
  </v-row>
</template>


<script>
import Steps from '~/components/Visa/VisaCancellationSteps.vue'
// import AllLeadsList from '~/components/Leads/AllLeadsList.vue'
import VisaProcessTimeline from '~/components/Visa/VisaProcessTimeline.vue'
import VisaProcessList from '~/components/Visa/VisaProcessList.vue'

export default {
  components: {
    Steps,
    // AllLeadsList,
    VisaProcessTimeline,
    VisaProcessList,
  },
  props: { currentTab: String },
  data() {
    return {
      subStageName: '',
      showsteps: true,
      status: 'preApproved',
      sectionTitle: 'All Requests',
      visa_process_timeline: [
        {
          title: 'MOL Offer Letter',
          text: 'Complete at Feb 8, 2.30pm',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'User Accept. of Job Offer',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'MOL Pre-Approval',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'E-Visa Application',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'Stamped E-Visa',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'Medical Test Application',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'E-ID Registration',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'Health Insurance',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'Passport Collections',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
        {
          title: 'Visa Stamping',
          text: 'Not started',
          completed: false,
          buttonText: 'Completed',
        },
      ],
      selectedVisaProcess: '',
      ShowDetails: false,
      ShowList: false,
      limit: '10',
      page: 0,
      newProList: [],
    }
  },
  mounted() {
    this.subStageName = "Labor Cancellation Typing";
    this.$nextTick(() => {
      this.handleStageChange(this.subStageName);
    });
  },



    // Update gen,
  methods: {
    updateProcess(event) {
      this.showsteps = false
      setTimeout(() => {
        this.showsteps = true
      }, 100)
    },
    async handleStageChange(stageName) {
      console.log("handleStageChange called with:", stageName);
      this.page = 1;
      const params = {
        stage_name: stageName,
        section_name: "visa cancellation"
      };

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.$post(
          `/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`,
          params,
          { headers: { Authorization: AuthStr } }
        );

        console.log('Response received:', response.results);
        this.newProList = response.results;
        this.ShowList = true;

        this.$nextTick(() => {
          this.$nuxt.$emit('receivedVisaProcessList', response.results);
        });
      } catch (error) {
        console.error('Error fetching list:', error);
      }
    },
    clickedVisaProcessList($event) {
      // console.log($event, '----------$event')
      this.ShowDetails = false

      if ($event != undefined) {
        this.selectedVisaProcess = $event
        setTimeout(() => {
          this.ShowDetails = true
        }, 1)
      } else {
        this.selectedVisaProcess = $event
        setTimeout(() => {
          this.ShowDetails = true
        }, 1)
      }
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
      if ($event.lists) {
        const params = {
          stage_name: "Labor Cancellation Typing",
          section_name: "visa cancellation"
        };

        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        try {
          const response = await this.$axios.$post(
            `/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`,
            params,
            { headers: { Authorization: AuthStr } }
          );

          this.ShowList = false;
          await this.$nextTick();
          this.newProList = response.results;
          this.ShowList = true;
        } catch (error) {
          console.error("Detailed error:", error);
        }
      }
    }
  },
}
</script>
