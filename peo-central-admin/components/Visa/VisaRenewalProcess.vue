<template>
  <v-row class="visa-renewal pb-4">
    <v-col cols="12" class="d-flex">
      <Steps
        @updated="getVisaProcessList"
        @stage-change="handleStageChange"
      />
    </v-col>
    <v-col cols="12" md="6" class="px-0 pt-0">
      <VisaProcessList
        :currentTab="currentTab"
        :newProList="newProList"
        @VisaProcessListClicked="clickedVisaProcessList($event)"
        @fetchedVisaProcessList="generateVisaProcessList($event)"
        :key="newProList.length"
      />
    </v-col>
    <v-col cols="12" md="6" class="px-0 position-relative">
      <template v-if="ShowDetails">
        <VisaProcessTimeline
          :visa-process-timeline-data="selectedVisaProcess"
          class="position-absolute-fit-overflow"
          update-process="updateProcess"
        />
      </template>
      <template v-else>
        <v-card
          class="d-flex align-items-center"
          height="fit-content"
          variant="outlined"
          flat
        >
          <v-card-title>No details to display</v-card-title>
        </v-card>
      </template>
    </v-col>
  </v-row>
</template>

<script>
import Steps from '~/components/Visa/visaRenewalSteps.vue'
import VisaProcessList from '~/components/Visa/VisaProcessList.vue'
import VisaProcessTimeline from '~/components/Visa/VisaProcessTimeline.vue'

export default {
  components: {
    Steps,
    VisaProcessList,
    VisaProcessTimeline,
  },
  props: {
    visaProcessTimelineData: Array,
    currentTab: String,
  },
  data() {
    return {
      status: 'preApproved',
      subStageName: '',
      selectedStageName: '',
      sectionTitle: 'All Requests',
      visa_renewal: [
        {
          title: 'MOL Letter',
          text: 'No attachments',
          completed: false,
          buttonText: 'Create MOL',
        },
        {
          title: 'Medical test application',
          text: 'No attachments',
          completed: false,
          buttonText: 'Upload application',
        },
        {
          title: 'Medical test completed',
          text: 'Mark as Completed',
          completed: false,
          buttonText: 'Create MOL',
        },
        {
          title: 'Medical test result',
          text: 'No attachments',
          completed: false,
          buttonText: 'Upload Result',
        },
        {
          title: 'Emirates ID Application',
          text: 'No attachments',
          completed: false,
          buttonText: 'Upload application',
        },
        {
          title: 'Residency Approval',
          text: 'No attachments',
          completed: false,
          buttonText: 'Mark as approved',
        },
        {
          title: 'Stamped residence Visa',
          text: 'No attachments',
          completed: false,
          buttonText: 'Mark as received',
        },
        {
          title: 'Emirates Id issuance',
          text: 'No attachments',
          completed: false,
          buttonText: 'Mark as issued',
        },
        {
          title: 'Labor contract issuance',
          text: 'No attachments',
          completed: false,
          buttonText: 'Mark as issued',
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
    this.subStageName = "MOL Letter";
    this.$nextTick(() => {
      this.handleStageChange(this.subStageName);
    });
  },
  methods: {
    async handleStageChange(stageName) {
      console.log("handleStageChange called with:", stageName);
      this.page = 1;
      const params = {
        stage_name: stageName,
        section_name: "visa renewal"
      };

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.$post(
          `/visaprocess/list/section/stage?page=${this.page}&limit=${this.limit}`,
          params,
          { headers: { Authorization: AuthStr } }
        );

        console.log('Response received:', response.results);

        // Set data first
        this.newProList = response.results;
        this.ShowList = true;

        // Then emit after a tick to ensure data is set
        this.$nextTick(() => {
          this.$nuxt.$emit('receivedVisaProcessList', response.results);
        });
      } catch (error) {
        console.error('Error fetching list:', error);
      }
    },
    async getVisaProcessList(event) {
      console.log("getVisaProcessList called with:", event);
      if (event && event.lists) {
        this.newProList = event.lists;
        this.$emit('fetchedVisaProcessList', event);
      }
    },
    clickedVisaProcessList($event) {
      console.log($event, '----------$event')
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
    async generateVisaProcessList($event) {
      console.log("generateVisaProcessList called with:", $event);
      this.page = 1;

      if ($event.lists) {
        const params = {
          stage_name: "MOL Letter",
          section_name: "visa renewal"
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
