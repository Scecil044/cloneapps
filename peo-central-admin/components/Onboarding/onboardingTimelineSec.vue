<template>
  <v-row class="px-0 py-0">

    <!-- Create Proposal Dialog -->
    <OnboardingDialog :activeStage="activeStage" :currentObj="currentObj" :dialogData="proposalDialog" @close="closeOnboardingvDialog" v-if="proposalDialog" />
    <!-- Create Invoice Dialog -->
    <OnboardingInvoiceDialog :activeStage="activeStage" :dialogData="createInvoiceDialog" @close="closeOnboardingvDialog" v-if="createInvoiceDialog"/>
    <!-- Send Email Dialog -->
    <SendMailDialog v-if="sendEmailDialog" :emailBody="emailBody" @close="closeEosbDialog" :is-loading="!emailBody.content" />


    <v-col cols="12">
      <!-- style="min-height: 90vh !important" -->
      <v-card color="card_bg" id="card">
        <div class="timeline_wrapper px-6"
          v-if="ShowDetails && employeeDetails && employeeDetails[0].processes && selectedEmployeeStatus">
          <div class="timeline d-flex" dense>
            <div class="item" v-for="(item, index) in employeeDetails[0].processes" :class="item.process_status == 'completed' ? 'active' : ''" :key="index">
              <div class="icon d-flex align-center justify-center+">
                <checkBoxSvg v-if="item.process_status == 'completed'" style=" background-color: #0a94ff;" />
              </div>
              <span>{{ item.stage_name }}</span>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12">
      <!-- style="min-height: 90vh !important" -->
      <v-card color="card_bg" id="card" active-class="">
        <div class="contact_lead">
          <div class="d-flex align-center justify-lg-space-between">
            <div class="d-flex align-center">
              <InfoDIcon v-if="selectedEmployeeStatus == 'On Hold'" class="mr-2" />
              <div v-else>
                <InfoSVG class="mr-2" />
              </div>

              <h6 v-if="selectedEmployeeStatus == 'On Hold'" style="color: #000000 !important">On hold by employer</h6>
              <h6 v-else style="color: #000000 !important">{{ currentObj.message }}</h6>
            </div>
            <div class="lead_buttons">
              <template v-if="selectedEmployeeStatus == 'On Hold'">
                <v-btn disabled value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(currentObj.button_name); }">
                  <span>{{ currentObj.button_name }}</span>
                </v-btn>
              </template>
              <template v-else>
                <v-btn v-for="(item,index) in currentObj.actions" :key="index" v-if="clickedSendForApproval && currentObj.button_name == 'Send for Approval' && currentObj.process_status == 'progress'" value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(item.button); }">
                  <span>{{ item.button ? item.button : 'Click Next' }}</span>
                </v-btn>
                <v-btn v-for="(item,index) in currentObj.actions" :key="index" v-if="clickedSendForSign && currentObj.button_name == 'Send for sign' && currentObj.process_status == 'progress'" value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(item.button); }">
                  <span>{{ item.button ? item.button : 'Click Next' }}</span>
                </v-btn>
                <v-btn v-for="(item,index) in currentObj.actions" :key="index" v-if="clickedSendInvoice && currentObj.button_name == 'Create Invoice' && currentObj.process_status == 'progress' && item.status == 'progress'" value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(item.button); }">
                  <span>{{ item.button ? item.button : 'Click Next' }}</span>
                </v-btn>



                <!-- <v-btn v-if="currentObj.button_name == 'Create Invoice' && currentObj.process_status == 'progress'" value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(currentObj.button_name);}">
                  <span>{{ currentObj.button_name ? currentObj.button_name : 'Click Next' }}</span>
                </v-btn> -->

                <v-btn v-if="currentObj.button_name == 'Create Invoice' && currentObj.process_status == 'progress' && progressAction && employeeDetails[0].hasOwnProperty('create_invoice') == true" value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(progressAction.button);}">
                  <span>{{ getButtonValue() }}</span>
                </v-btn>

                <v-btn v-else-if="currentObj.button_name == 'Create Invoice' && currentObj.process_status == 'progress' && employeeDetails[0].create_invoice" value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(currentObj.button_name);}">
                  <span>{{ currentObj.button_name ? currentObj.button_name : 'Click Next' }}</span>
                </v-btn>

                <!-- <v-btn v-else-if="currentObj && progressAction && clickedSendForApproval == false && clickedSendForSign == false && clickedSendInvoice == false" value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(progressAction.button);}">
                  <span>{{ getButtonValue() }}</span>
                </v-btn> -->

                <v-btn v-else value="contacted" class="tall__btn" color="primary" @click="() => { handleLeadProgressButton(0); showProposalDialog(currentObj.button_name);}">
                  <span>{{ currentObj.button_name ? currentObj.button_name : 'Click Next' }}</span>
                </v-btn>

              </template>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <OnboardingEmployeeDetails :employeeDetails="employeeDetails" v-if="currentObjIndex === 0 && ShowDetails" />
    <OnboardingDownload v-if="currentObjIndex === 1" />
    <OnboardingDownload v-if="currentObjIndex === 2" />
    <OnboardingDownload v-if="currentObjIndex === 3" />
    <OnboardingDownload v-if="currentObjIndex === 4" />
    <OnboardingDownload v-if="currentObjIndex === 5" />
    <OnboardingHistory v-if="currentObjIndex === 11" />
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_leadTimeLine.scss'
import InfoSVG from '@/assets/images/Customer/info.svg'
import checkBoxSvg from '@/assets/images/icons/check-box.svg'
import InfoDIcon from '@/assets/images/icons/infoD-icon.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import OnboardingEmployeeDetails from '@/components/Onboarding/onboardingEmployeeDetails.vue'
import OnboardingHistory from '@/components/Onboarding/onboardingHistory.vue'
import OnboardingDownload from '@/components/Onboarding/onboardingDownload.vue'
import OnboardingDialog from '@/components/Dialogs/onboardindDialog.vue'
import OnboardingInvoiceDialog from '@/components/Dialogs/onboardingInvoiceDialog.vue'
import SendMailDialog from '@/components/Dialogs/sendMail-dialog.vue'
import { mapState, mapActions, mapGetters } from 'vuex'



export default {
  components: {
    checkBoxSvg,
    CustomInputContainer,
    InfoSVG,
    OnboardingEmployeeDetails,
    OnboardingDownload,
    InfoDIcon,
    OnboardingDialog,
    SendMailDialog,
    OnboardingHistory,
    OnboardingInvoiceDialog,
  },
  props: { selectedEmployeeStatus: String },
  data() {
    return {
      //rules
      emailBody:{},
      main_rule: [(v) => !!v || 'This filed is required'],
      //Unsuccessful Dialog
      unsuccessfulDialog: false,
      proposalDialog: false,
      createInvoiceDialog: false,
      sendEmailDialog: false,
      workOrderDialog: false,
      currentObjIndex: 0,
      activeStage: '',
      ShowDetails: false,
      currentObj:{},
      leadHeadingButtons: [
        {
          title: 'Next Step',
          // unsuccess: 'Unsuccessful',
          btnName: 'Create Emp Contract',
          btnValue: 'createEmpCont'
        },
        {
          title: 'Send employment contract for employers sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Send for signsd',
          btnValue: 'employerSign'

        },
        {
          title: 'Waiting for employers sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Mark as signed',
          btnValue: 'waitEmployerSign'

        },
        {
          title: 'Send employment contract for employees sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Send for sign',
          btnValue: 'employeeSign'

        },
        {
          title: 'Waiting for employees sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Mark as signed',
          btnValue: 'waitEmployeeSign'

        },
        {
          title: 'Next Step',
          unsuccess: 'Unsuccessful',
          btnName: 'Create Work Order',
          btnValue: 'workOrder'

        },
        {
          title: 'Send Work order for employers approval sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Send for sign',
          btnValue: 'workEmployerSign'

        },
        {
          title: 'Waiting for employers approval sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Mark as signed',
          btnValue: 'workEmployerSigned'

        },
        {
          title: 'Next step',
          unsuccess: 'Unsuccessful',
          btnName: 'Create Invoice',
          btnValue: 'createInvoice'

        },
        {
          title: 'Next step',
          unsuccess: 'Unsuccessful',
          btnName: 'Send Invoice',
          btnValue: 'sendInvoice'

        },
        {
          title: 'Waiting for payment',
          unsuccess: 'Unsuccessful',
          btnName: 'Record Payment',
          btnValue: 'recordPayment'

        },
        {
          title: 'All Payments Complete',
          unsuccess: 'Unsuccessful',
          btnName: 'Start Visa Process',
          btnValue: 'startVisaProcess'

        },
      ],
      progressBar: [
        {
          title: 'Employee Details',
          active: true,
        },
        {
          title: 'Create Employ. Contract',
          active: false,
        },
        {
          title: 'Employers Sign',
          active: false,
        },
        {
          title: 'Employees Sign',
          active: false,
        },
        {
          title: 'Create Work Order',
          active: false,
        },
        {
          title: 'Work Order Approval',
          active: false,
        },
        {
          title: 'Invoice & Debit Note',
          active: false,
        },
      ],
      proposalDialogButtons: [
        { text: 'A-Level', clicked: false },
        { text: 'B-Level', clicked: false },
        { text: 'C-Level', clicked: false },
        { text: 'Custom', clicked: false },
      ],
      employeeDetails: [],
      selectedButton: '',
      selectedIndex: 0,
      clickedSendForApproval: false,
      clickedSendForSign: false,
      clickedSendInvoice: false,
      progressAction: {}
    }
  },
  computed: {
    ...mapState(['sendEmailForm']),
    ...mapGetters(['getSendEmailForm', 'getProgressStep']),
  },
  mounted() {
    if (this.getProgressStep === 1) {
      this.handleLeadProgressButton(1)
    }
    this.getOnboardingEmpDetails(this.selectedEmployeeStatus)
  },
  created(){
    this.$nuxt.$on('fetchUpdatedOnboardingProcess', ($event) => {
      this.getOnboardingEmpDetails($event._id)
      this.$emit('OnboardingEmployeeClicked', $event)
    })
  },
  methods: {
    ...mapActions(['setProgressStep']),
    handleLeadProgressButton(index) {
      // Progressbar for Lead
      for (let i = 0; i < this.progressBar.length; i++) {
        if (i === index) {
          this.progressBar[i].active = true;
        } else if (i < index) {
          this.progressBar[i].active = true;
        }
        else {
          this.progressBar[i].active = false;
        }
      }
      //onclick changed data on button
      this.currentObjIndex = Math.min(
        this.currentObjIndex + 1,
        this.leadHeadingButtons.length - 1
      )
    },
    showProposalDialog(name) {
      this.selectedButton = name
      // this.selectedIndex = index
      this.activeStage = name

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.$axios.$post(`/onboardings/process/forward/${this.selectedEmployeeStatus}`, { button: this.selectedButton }, { headers: { Authorization: AuthStr } })
      .then((res) => {

        // let obj = {
        //   process: this.employeeDetails[0],
        //   selectedIndex: this.employeeDetails[0].processes.filter((a) => a.button_name == this.activeStage)[0].actions.filter(a => a.status == 'progress')[0]
        // }

        let obj = {}
        if(this.currentObj.button_name == 'Create Invoice') {
          obj = {
            process: this.employeeDetails[0],
            // selectedIndex: this.employeeDetails[0].processes.filter((a) => a.actions.find(action => action.status == 'progress'))[0].actions.filter(a => a.status == 'process') //change pending to progress after logic change
            selectedIndex: this.employeeDetails[0].processes.filter((a) => a.actions.find(action => action.status == 'progress'))[0].actions.filter(a => a.status == 'progress')
          }
        } else {
          obj = {
            process: this.employeeDetails[0],
            selectedIndex: this.employeeDetails[0].processes.filter((a) => a.button_name == this.activeStage)[0].actions.filter(a => a.status == 'progress')
          }
        }

        console.log(obj,'-------obj')
        if(obj) {
          this.$nuxt.$emit('retrieveOnboardData', obj)
        }


        // this.$emit('OnboardingEmployeeClicked', this.employeeDetails[0])
      })

      if (this.activeStage == 'createEmpCont' || this.activeStage == 'Create Emp Contract') {
        this.proposalDialog = true
      }
      if (this.activeStage == 'workOrder' || this.activeStage == 'Create Work Order') {
        this.proposalDialog = true
      }
      if (this.activeStage == 'createInvoice' || this.activeStage == 'Create Invoice') {
        this.createInvoiceDialog = true
      }
      if (this.activeStage == 'sendInvoice' || this.activeStage == 'Send Invoice') {
        this.sendEmailDialog = true
      }
      if (this.activeStage == 'recordPayment' || this.activeStage == 'Record Payment') {
        this.proposalDialog = true
      }
      if (this.activeStage == 'startVisaProcess') {
        this.$router.push('/visa-process')
      }

      // if (index === 0) {
      //     this.proposalDialog = true
      // }
      // if (index === 5) {
      //     this.workOrderDialog = true
      // }

      if(this.activeStage == 'Send for Approval'){
        this.clickedSendForApproval= true;
      }else if(this.activeStage == 'Send for sign'){
        this.clickedSendForSign = true;
      }else if(this.activeStage == 'Create Invoice'){
        this.clickedSendInvoice = true
      }
    },
    //CloseEOSB Dialaog
    closeOnboardingvDialog(value) {
      this.proposalDialog = false
      this.sendEmailDialog = false
      this.createInvoiceDialog = false
      // this.ShowList= false
    },
    //proposal dialog toggler
    handleClick(index) {
      this.proposalDialogButtons[index].clicked = !this.proposalDialogButtons[index].clicked
    },
    getOnboardingEmpDetails(user) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post(`/onboardings/employee/details/${user}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.ShowDetails = false
          setTimeout(() => {
            this.employeeDetails = response

            let completedCount = 0
            for(const process of this.employeeDetails[0].processes){
              if(process.process_status === 'completed') {
                completedCount++;
              }
            }
            this.currentObjIndex = this.currentObjIndex + completedCount


            this.currentObj = this.employeeDetails[0].processes.filter((a) => a.process_status == 'progress').map(obj => obj)[0]

            console.log(this.currentObj, '----------this.currnetObj')

            this.ShowDetails = true
          }, 1);
        })
    },
    //Mail Approval Corporation route method
    // mailApprovalRoute(index){
    //   if(index === 2){
    //       this.$router.push('/Leads/mailApproval-lead')
    //   }

    // },
    getButtonValue() {
      this.progressAction = this.currentObj.actions.find(action => action.status === 'progress');
      console.log(this.progressAction, '------------this.progressAction')
      return this.progressAction ? this.progressAction.button : this.currentObj.button_name;
    },
  },
}
</script>
