<template>
  <v-row class="px-0 py-0">

    <!-- Create EOSB  Dialog -->
    <EOSBDialog :buttonVal="buttonVal" :dialogData="proposalDialog" @close="closeEosbDialog" />
    <!-- Send Email Dialog -->
    <SendMailDialog v-if="sendEmailDialog" :emailBody="emailBody" @close="closeEosbDialog" :is-loading="!emailBody.content" />


    <v-col cols="12" v-if="!ShowList">
      <!-- style="min-height: 90vh !important" -->
      <v-card color="card_bg" id="card">
        <div class="timeline_wrapper px-6">
          <div class="timeline d-flex" dense v-if="ShowDetails && employeeDetails &&  employeeDetails[0].processes && employeeDetails[0].status == 'cancel insurance'">
            <div class="item" v-for="(item, index) in employeeDetails[0].processes" :class="item.active ? 'active' : ''" :key="index">
              <div class="icon d-flex align-center justify-center+">
                <checkBoxSvg v-if="item.process_status == 'progress'" style=" background-color: #0a94ff;" />
              </div>
              <span>{{ item.stage_name }}</span>
            </div>
          </div>
          <div class="timeline d-flex" dense v-else-if="ShowDetails && employeeDetails &&  employeeDetails[0].processes">
            <div class="item" v-for="(item, index) in employeeDetails[0].processes" :class="item.active ? 'active' : ''"
              :key="index">
              <div class="icon d-flex align-center justify-center+">
                <checkBoxSvg v-if="item.process_status == 'progress'" style=" background-color: #0a94ff;" />
              </div>
              <span>{{ item.stage_name }}</span>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" v-if="!ShowList">
      <!-- style="min-height: 90vh !important" -->
      <v-card color="card_bg" id="card" active-class="">

        <div v-if="selectedEmployeeStatus == 'visa canc'">
          <div class="contact_lead" v-for="(leadBarData, index) in offBButtons" :key="index">
            <div class="d-flex align-center justify-lg-space-between" v-if="index === currentObjIndex">
              <div class=" d-flex align-center  ">
                <InfoDIcon v-if="selectedEmployeeStatus == 'On Hold'" class="mr-2" />
                <div v-else>
                  <InfoSVG v-if="currentObjIndex === 2" class="mr-2" />
                  <InfoSVG v-if="currentObjIndex === 4" class="mr-2" />
                  <InfoSVG v-if="currentObjIndex === 7" class="mr-2" />
                  <InfoSVG v-if="currentObjIndex === 10" class="mr-2" />
                  <checkBoxSvg class="mr-2 paymentSvg" v-if="currentObjIndex === 11" />
                </div>

                <!-- <h6  v-if="selectedEmployeeStatus == 'visa canc'" style="color: #000000 !important">Termination Received</h6> -->
                <h6 style="color: #000000 !important">{{ leadBarData.title }}</h6>
              </div>

              <!-- <h6 style="color: #000000 !important;">Create Proposal</h6> -->
              <div class="lead_buttons">
                <v-btn class="tall__btn mr-4 accent2--text" outlined @click="unsuccessfulDialog = true">
                  <span class="span_data">
                    {{ leadBarData.unsuccess }}

                  </span>
                </v-btn>
                <template>
                  <v-btn value="contacted" class="tall__btn" color="primary"
                    @click="() => { handleLeadProgressButton(index); }">
                    <span>
                      {{ leadBarData.btnName }}
                    </span>

                  </v-btn>
                </template>
              </div>

            </div>
          </div>
        </div>
        <div v-else>
          <div class="contact_lead" v-for="(leadBarData, index) in leadHeadingButtons" :key="index">
            <div class="d-flex align-center justify-lg-space-between" v-if="index === currentObjIndex">
              <div class=" d-flex align-center  ">
                <InfoDIcon v-if="selectedEmployeeStatus == 'On Hold'" class="mr-2" />
                <div v-else class=" d-flex align-center ">
                  <InfoSVG v-if="currentObjIndex === 2" class="mr-2" />
                  <InfoSVG v-if="currentObjIndex === 3" class="mr-2" />
                  <InfoSVG v-if="currentObjIndex === 4" class="mr-2" />
                  <InfoSVG v-if="currentObjIndex === 5" class="mr-2" />
                  <InfoSVG v-if="currentObjIndex === 7" class="mr-2" />
                  <checkBoxSvg class="mr-2 paymentSvg" v-if="currentObjIndex === 8" />
                  <checkBoxSvg class="mr-2 paymentSvg" v-if="currentObjIndex === 6" />
                  <InfoSVG v-if="currentObjIndex === 10" class="mr-2" />
                  <checkBoxSvg class="mr-2 paymentSvg" v-if="currentObjIndex === 11" />
                  <checkBoxSvg class="mr-2 paymentSvg" v-if="currentObjIndex === 13" />
                  <checkBoxSvg class="mr-2 paymentSvg" v-if="currentObjIndex === 15" />
                </div>

                <h6 style="color: #000000 !important">{{ leadBarData.title }}</h6>
              </div>

              <div class="lead_buttons">
                <v-btn v-if="currentObjIndex === 0" class="tall__btn mr-4 accent2--text" outlined>
                  <span class="span_data">
                    Decline

                  </span>
                </v-btn>
                <v-btn v-if="currentObjIndex === 3" class="tall__btn mr-4 accent2--text" outlined>
                  <span class="span_data">
                    Rejected
                  </span>
                </v-btn>
                <v-btn v-if="currentObjIndex === 5" class="tall__btn mr-4 accent2--text" outlined>
                  <span class="span_data">
                    Rejected
                  </span>
                </v-btn>
                <template v-if="currentObjIndex === 10">
                  <v-btn style="opacity: 0 !important;" value="contacted" class="tall__btn" color="primary"
                    @click="() => { handleLeadProgressButton(index); showProposalDialog(leadBarData.btnValue); }">
                    <span>
                      {{ leadBarData.btnName }}
                    </span>

                  </v-btn>
                </template>
                <template v-else>
                  <v-btn value="contacted" class="tall__btn" color="primary"
                    @click="() => { handleLeadProgressButton(index); showProposalDialog(leadBarData.btnValue); }">
                    <span>
                      {{ leadBarData.btnName }}
                    </span>

                  </v-btn>
                </template>

              </div>

            </div>
          </div>
        </div>


      </v-card>
    </v-col>
    <OffboardingEmployeeDetails :employeeDetails="employeeDetails" v-if="currentObjIndex === 0 && ShowDetails" />
    <OffboardingEmployeeDetails v-if="currentObjIndex === 1" />
    <OffboardingDownload v-if="currentObjIndex === 2" />
    <OffboardingDownload v-if="currentObjIndex === 4" />
    <OffboardingDownload v-if="currentObjIndex === 5" />
    <OffboardingDownload v-if="currentObjIndex === 6" />
    <OffboardingDownload v-if="currentObjIndex === 7" />
    <OnboardingHistory v-if="currentObjIndex === 15" />
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_leadTimeLine.scss'
import InfoSVG from '@/assets/images/Customer/info.svg'
import checkBoxSvg from '@/assets/images/icons/check-box.svg'
import InfoDIcon from '@/assets/images/icons/infoD-icon.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import EOSBDialog from '@/components/Dialogs/eosb-dialog.vue'
import SendMailDialog from '@/components/Dialogs/sendMail-dialog.vue'
import OffboardingEmployeeDetails from '@/components/Offboarding/offboardingEmployeeDetails.vue'
import OffboardingDownload from '@/components/Offboarding/offboardingDownload.vue'
import OnboardingHistory from '@/components/Onboarding/onboardingHistory.vue'


export default {
  components: {
    checkBoxSvg,
    CustomInputContainer,
    InfoSVG,
    OffboardingEmployeeDetails,
    InfoDIcon,
    EOSBDialog,
    OffboardingDownload,
    SendMailDialog,
    OnboardingHistory,


  },
  props: {
    selectedEmployeeStatus: String,
    selectedStage: String,
    ShowList: Boolean
  },
  data() {
    return {
      //rules
      emailBody:{},
      main_rule: [(v) => !!v || 'This filed is required'],
      //Unsuccessful Dialog
      unsuccessfulDialog: false,
      proposalDialog: false,
      sendEmailDialog: false,
      workOrderDialog: false,

      currentObjIndex: 0,
      buttonVal: '',
      leadHeadingButtons: [
        {
          title: 'Resignation Received',
          btnName: 'Approve',
          btnValue: 'approved',
        },
        {
          title: 'Next Step',
          btnName: 'Create EOSB',
          btnValue: 'createEosb',

        },
        {
          title: 'Send EOSB for employers approval sign',
          btnName: 'Send EOSB for sign',
          btnValue: 'sendEosb',

        },
        {
          title: 'Waiting for employers approval sign',
          btnName: 'Approved',
          btnValue: 'EmployerApproved',

        },
        {
          title: 'Send EOSB for employees approval sign',
          btnName: 'Send EOSB for sign',
          btnValue: 'sendEosbEmp',

        },
        {
          title: 'Waiting for employees approval sign',
          btnName: 'Approved',
          btnValue: 'approvedEmp',

        },
        {
          title: 'EOSB approved by employer and employee.',
          btnName: 'Create Invoice',
          btnValue: 'createInvoice',


        },
        {
          title: 'Next Step',
          btnName: 'Send Invoice',
          btnValue: 'sendInvoice',


        },
        {
          title: 'Invoice sent to Employer on 12 Jan 2023',
          btnName: 'Record Payment',
          btnValue: 'recordPayment',
        },
        {
          title: 'Send for Visa Cancellation',
          btnName: 'Add to visa cancellation',
          btnValue: 'addCancel',

        },
        {
          title: 'Waiting for visa cancellation',
          btnName: 'waiting',
          btnValue: 'waitCancel',

        },
        {
          title: 'Visa Cancellation completed, Proceed to Release Payment',
          btnName: 'Release Payment',
          btnValue: 'releasePayment',

        },
        {
          title: 'Is the payment released?',
          btnName: 'Mark as Paid',
          btnValue: 'markPaid',
        },
        {
          title: 'Payment released',
          btnName: 'Cancel Insurance',
          btnValue: 'cancelInsurance',

        },
        {
          title: 'Is insurance canceled?',
          btnName: 'Mark as cancelled',
          btnValue: 'markInsuCancel',

        },
        {
          title: 'Employee offboarded on 29th Jan, 2022',
          btnName: 'Mark as cancelled',
          btnValue: 'cancelOffboarded',
        },
      ],
      offBButtons: [

        {
          title: 'Resignation Received',
          unsuccess: 'Decline',
          btnName: 'Approve',
        },
        {
          title: 'Send employment contract for employers sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Send for sign',
        },
        {
          title: 'Waiting for employers sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Mark as signed',
        },
        {
          title: 'Send employment contract for employees sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Send for sign',
        },
        {
          title: 'Waiting for employees sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Mark as signed',
        },
        {
          title: 'Next Step',
          unsuccess: 'Unsuccessful',
          btnName: 'Create Work Order',
        },
        {
          title: 'Send Work order for employers approval sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Send for sign',
        },
        {
          title: 'Waiting for employers approval sign',
          unsuccess: 'Unsuccessful',
          btnName: 'Mark as signed',
        },
        {
          title: 'Next step',
          unsuccess: 'Unsuccessful',
          btnName: 'Create Invoice',
        },
        {
          title: 'Next step',
          unsuccess: 'Unsuccessful',
          btnName: 'Send Invoice',
        },
        {
          title: 'Waiting for payment',
          unsuccess: 'Unsuccessful',
          btnName: 'Record Payment',
        },
        {
          title: 'All Payments Complete',
          unsuccess: 'Unsuccessful',
          btnName: 'Start Visa Process',
        },
      ],

      receivedResignation: [
        {
          title: 'Resignation Received',
          value: 'resignation received',
          active: true,
        },
        {
          title: 'Create EOSB',
          value: 'create eosb',
          active: false,
        },
        {
          title: 'EOSB sign by Employer',
          value: 'eosb employer signed',
          active: false,
        },
        {
          title: 'EOSB sign by Employee',
          value: 'eosb employee signed',
          active: false,
        },
        {
          title: 'Create Invoice',
          value: 'create invoice',
          active: false,
        },
        {
          title: 'Record Payment',
          value: 'record payment',
          active: false,
        },
        {
          title: 'Visa Cancellation',
          value: 'visa cancellation',
          active: false,
        },
        {
          title: 'Release Payment',
          value: 'release payment',
          active: false,
        },
        {
          title: 'Cancel Insurance',
          value: 'cancel insurance',
          active: false,
        },
      ],
      visaCancelBar: [
        {
          title: 'Termination Received',
          value: 'termination received',
          active: true,
        },
        {
          title: 'Send for Employee Sign',
          value: 'send employeeSign',
          active: false,
        },
        {
          title: 'Create EOSB',
          value: 'create eosb',
          active: false,
        },
        {
          title: 'EOSB sign by Employer',
          value: 'eosb employer signed',
          active: false,
        },
        {
          title: 'EOSB sign by Employee',
          value: 'eosb employee signed',
          active: false,
        },
        {
          title: 'Create Invoice',
          value: 'create invoice',
          active: false,
        },
        {
          title: 'Record Payment',
          value: 'record payment',
          active: false,
        },
        {
          title: 'Visa Cancellation',
          value: 'visa cancellation',
          active: false,
        },
        {
          title: 'Release Payment',
          value: 'release payment',
          active: false,
        },
        {
          title: 'Cancel Insurance',
          value: 'cancel insurance',
          active: false,
        },
      ],
      employeeDetails: [],
      ShowDetails: false,
      proposalDialogButtons: [
        { text: 'A-Level', clicked: false },
        { text: 'B-Level', clicked: false },
        { text: 'C-Level', clicked: false },
        { text: 'Custom', clicked: false },
      ],
    }
  },
  methods: {

    //CloseEOSB Dialaog
    closeEosbDialog(value) {
      this.proposalDialog = false
      this.sendEmailDialog = false
      // this.ShowList= false
    },
    handleLeadProgressButton(index) {
      // Progressbar for offboarding
      for (let i = 0; i < this.receivedResignation.length; i++) {
        if (i === index) {
          this.receivedResignation[i].active = true;
        } else if (i < index) {
          this.receivedResignation[i].active = true;
        }
        else {
          this.receivedResignation[i].active = false;
        }
      }

      for (let i = 0; i < this.visaCancelBar.length; i++) {

        if (i === index) {
          this.visaCancelBar[i].active = true;
        } else if (i < index) {
          this.visaCancelBar[i].active = true;
        }
        else {
          this.visaCancelBar[i].active = false;
        }
      }



      //onclick changed data on button
      this.currentObjIndex = Math.min(
        this.currentObjIndex + 1,
        this.leadHeadingButtons.length - 1
      )
    },
    showProposalDialog(val) {
      this.buttonVal = val
      if (this.buttonVal == 'createEosb') {
        this.proposalDialog = true
      }
      if (this.buttonVal == 'sendEosb') {
        this.sendEmailDialog = true
      }
      if (this.buttonVal == 'createInvoice') {
        this.proposalDialog = true
      }
      if (this.buttonVal == 'sendInvoice') {
        this.sendEmailDialog = true
      }
      if (this.buttonVal == 'recordPayment') {
        this.proposalDialog = true
      }
    },
    //proposal dialog toggler
    handleClick(index) {
      this.proposalDialogButtons[index].clicked = !this.proposalDialogButtons[index].clicked
    },
    //Mail Approval Corporation route method
    // mailApprovalRoute(index){
    //   if(index === 2){
    //       this.$router.push('/Leads/mailApproval-lead')
    //   }

    // },
    getOffboardingEmpDetails(user) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$post(`/offboardings/details/id/${user}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.ShowDetails = false
          setTimeout(() => {
            this.employeeDetails = response
            // console.log(this.employeeDetails, '------------thhis.employeeDeualt')
            this.ShowDetails = true
          }, 1);
        })
    }
  },
  mounted() {
    this.getOffboardingEmpDetails(this.selectedEmployeeStatus)
  }
}
</script>
