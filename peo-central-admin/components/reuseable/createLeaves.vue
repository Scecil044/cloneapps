<template>
  <div class="scroll" style="max-height: 720px">
    <!-- <Leaves
      :leaves="selectedEmp.leaves"
      :leaveApply="true"
      :computeLeaveTypes="computeLeaveTypes"
      v-if="selectedEmp"
    /> -->
    <v-progress-linear indeterminate v-if="newLeaveProgress"></v-progress-linear>
    <v-card-text class="pt-4 mt-5">
      <v-row class="rounded-xl mx-auto mb-5" style="border: solid 1px #dbe0e5; max-width: 80%">
        <v-col cols="6" class="" style="border-right: solid 1px #dbe0e5">
          <v-row class="mx-0" style="max-width: 100%" align="center">
            <v-col cols="1" class="pa-0" align-self="center" style="max-width: 40px">
              <v-img src="/hr/calendarLinear.svg" max-width="fit-content" height="fit-content" class="mr-2"
                contain></v-img>
            </v-col>
            <v-col cols="2" class="pa-0" style="color: #5c7eef; max-width: 80px">
              <v-card-text class="mb-0 pa-0 font-weight-medium fontSize18" style="color: #ea4a4f">{{
                leaves_count.no_of_days }}</v-card-text>
            </v-col>
            <v-col cols="7" class="pa-0 pl-1">
              <v-card-text class="pa-0 darkBlue-heading-text" style="color: #ea4a4f">
                No of Days
              </v-card-text>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6" align-self="center" v-if="leave.leave_type.leave_name != 'Unpaid Leaves'">
          <v-row class="mx-0" style="max-width: 100%" align="center">
            <v-col cols="2" class="pa-0" style="color: #5c7eef; max-width: 80px" align-self="center">
              <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size: 18px !important">{{
                leaves_count.remaining_leaves }}</v-card-text>
            </v-col>
            <v-col cols="8" class="pa-0 pl-1">
              <v-card-text class="pa-0 darkBlue-heading-text">Leave
                Remaining</v-card-text>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-form ref="form" v-model="valid">
        <v-row justify="start" class="mx-auto mb-5" style="max-width: 80%">
          <v-col class="" cols="12" sm="12" md="6">
            <p class="grey-heading-text font-weight-medium textFontSize">
              Leave Type
            </p>
            <v-select @change="funRemainingLeaves" @input="getLeaveRemaining"
              class="pt-0 mt-0 rounded-lg customMdiMenuDown" :items="computeLeaveTypes"
              :item-text="(item) => item.leave_name" :item-value="(item) => item.leave_name" dense return-object
              v-model="leave.leave_type" placeholder="Select Leave Type" :rules="genericRule"></v-select>
          </v-col>
          <v-col class="" cols="6">
            <p class="grey-heading-text font-weight-medium textFontSize">
              Leave Option
            </p>
            <v-select class="pt-0 mt-0 rounded-lg customMdiMenuDown" :items="computeLeaveOption()"
              :item-text="(item) => item.name" :item-value="(item) => item.value" dense @input="halfDayCheck()"
              v-model="half_day"></v-select>
          </v-col>
          <!-- <v-col class="text-right" cols="5" v-if="remaining_leaves_count">
            <h1 class="blue-grey--text text-h4">
              {{ getRemainingLeaves.remaining_leaves_count }}
              <span class="caption grey--text">Leaves Remaining</span>
            </h1>
          </v-col> -->
        </v-row>
        <v-row class="mx-auto mb-5" style="max-width: 80%">
          <v-col class="py-0" cols="12" sm="12" md="6">
            <p class="grey-heading-text font-weight-medium textFontSize">Start Date</p>
            <v-menu v-model="from" :close-on-content-click="false" transition="scale-transition" min-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="computedDateFormatted_fromDate"
                  class="pt-2 mt-0 pr-0 display-1 font-weight-light text-sm" v-bind="attrs" v-on="on"
                  @blur="date = parseDate(leave.from_date)" hint="Start Date" persistent-hint
                  :rules="genericRule"></v-text-field>
              </template>
              <v-date-picker v-model="leave.from_date" @input="
                changeToDate(),
                (from = false),
                halfDayCheck();
              " no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <v-col class="py-0" cols="12" sm="12" md="6">
            <p class="grey-heading-text font-weight-medium textFontSize">End Date</p>
            <v-menu v-model="to" :close-on-content-click="false" transition="scale-transition" min-width="290px">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="computedDateFormatted_toDate" class="pt-2 mt-0 display-1 font-weight-light text-sm"
                  v-bind="attrs" v-on="on" hint="End Date" persistent-hint :rules="genericRule">{{
                    computedDateFormatted_toDate | nocDateFormatterNew }}</v-text-field>
              </template>
              <v-date-picker :min="leave.from_date" v-model="leave.to_date" @input="
                (to = false), halfDayCheck();
              " no-title scrollable></v-date-picker>
            </v-menu>
          </v-col>
          <!-- <v-col class="py-0" cols="4"
            ><v-text-field
              class="pt-2 mt-0 px-3 display-1"
              v-model="getRemainingLeaves.no_of_days"
              disabled
              hint="No. of Days"
              persistent-hint
            ></v-text-field
          ></v-col> -->
        </v-row>
        <v-row class="mx-auto mb-5" style="max-width: 80%">
          <v-col cols="12" sm="12" md="12" class="">
            <p class="grey-heading-text font-weight-medium textFontSize">
              Upload Documents</p>
            <v-file-input v-model="leave.certificate" class="redTextForm" color="primary" multiple
              placeholder="Attach multiple files" @change="onUploadFiles"
              :rules="leave.leave_type.leave_name == 'Medical Leaves' && checkLeaveDays ? fileRules : []">
              <template v-slot:selection="{ text }">
                <v-chip color="primary" dark label small>{{ text }}</v-chip>
              </template>
            </v-file-input>
          </v-col>
          <v-col class="" cols="12"
            v-if="(selectedEmp.role_ID == '5e2ec39af3185a0b5036ef03' || selectedEmp.role_ID == '5e2ec39af3185a0b5036ef01') && hrss">
            <p class="grey-heading-text font-weight-medium textFontSize">Approval
              Substitute</p>
            <v-select class="rounded-lg customMdiMenuDown" :items="managersList"
              :item-text="(item) => `${item.first_name} ${item.last_name}`" :item-value="(item) => item._id" dense
              color="primary" @input="checkApprovalSubsLeave()" v-model="leave.approval_substitute"
              placeholder="Approval Substitute" :rules="genericRule"></v-select>
          </v-col>
        </v-row>
        <v-row class="mx-auto mb-5" style="max-width: 80%">
          <v-col cols="12">
            <p class="grey-heading-text font-weight-medium textFontSize">Reason</p>
            <v-textarea rows="1" placeholder="Enter Reason" class="redTextForm" dense auto-grow v-model="leave.reason"
              persistent-hint :rules="genericRule"></v-textarea>
          </v-col>
        </v-row>
        <v-row justify="end" class="mx-auto" style="max-width: 80%">
          <v-col sm="3" xl="2">
            <div class="pb-3">
              <v-btn v-if="no_balance" color="primary" @click.prevent="applyLeave()" depressed elevation="0"
                :disabled="(computeAddRequestButton ||
                  ComputeCheckWFHRequesButton || computeAddRequestButtonInitial || computeHajjLeave || computeAddRequestButtonForApprovalSubs || computeLevelApprover)"
                class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset" dark>Submit
              </v-btn>
            </div>
          </v-col>
        </v-row>
        <v-alert dismissible class="caption" type="success" v-if="isSent">
          Leave Request Submitted
        </v-alert>
      </v-form>
    </v-card-text>

    <!-- snackbar -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import Leaves from "./leaves.vue";
import notificationMethod from "~/plugins/notification";
import moment from "moment";
import { Leave } from "@nathangroup/leave";
import { LeaveEmail } from "@nathangroup/leave_email";

export default {
  components: { Leaves },
  props: [
    "selectedEmp",
    "configuration",
    "users",
    "addLeaves",
    "userCompany",
    "user",
    "leave",
    "userType",
    "hrss",
  ],

  data() {
    return {
      leaves_count: {
        no_of_days: 0,
        remaining_leaves: 0,
      },
      newLeaveProgress: false,
      remaining_leaves_count: true,
      config_details: {},
      valid: true,
      genericRule: [(v) => !!v || "This field is Required"],
      fileRules: [
        (v) => !!v || "File is required",
        (v) => (v && v.length > 0) || "File is required",
      ],
      snack: false,
      snackColor: "",
      snackText: "",
      from: false,
      to: false,
      isSent: false,
      half_day: false,
      emailBody: {
        hr_email: "",
        email: "",
        subjectMsg: "",
        eMessage: "",
      },
      emailBodyHR: {
        hr_email: "",
        email: "",
        subjectMsg: "",
        eMessage: "",
      },
      halfDay: [
        { name: "Half Day", value: true },
        { name: "Full Day", value: false },
      ],
      nohalfDay: [
        { name: "Full Day", value: false },
      ],
      user_leaves: [],
      user_wfh: [],
      approval_subs_leaves: [],
      approval_subs_wfh: [],
      delcared_holidays: [],
      no_balance: true
    };
  },
  async mounted() {
    this.config_details = this.configuration[0];
    await this.getHolidays();
    // await this.getLeaveRemaining();  
    await this.funGetUserPreviosLeaves(this.selectedEmp);
  },
  created() {
    // this.$nuxt.$on("user_changed", ($event) => {
    //   console.log($event)
    //   this.funGetUserPreviosLeaves($event);
    //   this.getLeaveRemaining();
    // });
  },
  beforeDestroy() {
    this.$nuxt.$off("user_changed");
  },
  methods: {
    computeLeaveOption() {
      return this.leave.from_date == this.leave.to_date ? this.halfDay : this.nohalfDay
    },
    changeToDate() {
      this.leave.to_date = this.leave.from_date;
    },
    async getLeaveRemaining() {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);

      let body = {
        user_id: this.selectedEmp._id,
        obj_leave_type: this.leave.leave_type,
        half_day: this.half_day,
        from_date: this.leave.from_date,
        to_date: this.leave.to_date,
        company_id: this.selectedEmp.company_id,
      };

      let leave_count = await this.$axios.$post(
        "/leaves/get_remaining_leaves",
        body,
        { headers: { Authorization: AuthStr } }
      );

      if (leave_count && leave_count.success) {
        this.leaves_count.no_of_days = leave_count.data.no_of_days;
        this.leaves_count.remaining_leaves =
          leave_count.data.remaining_leaves_count;
        this.no_balance = true;
      } else if (!!this.leave.leave_type) {
        this.no_balance = false;
        this.snack = true;
        this.snackText = leave_count.message;
        this.snackColor = "red";
        this.leaves_count.no_of_days = 0;
        this.leaves_count.remaining_leaves = 0;
      }
      this.hasExistingLeaveCheck()
    },
    async funGetUserPreviosLeaves(selectedEmp) {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      this.user_leaves = await this.$axios.$get("/leaves/user_leaves/" + this.selectedEmp._id, { headers: { Authorization: AuthStr } });
      this.user_wfh = await this.$axios.$get("/wfh/user_wfh/" + this.selectedEmp._id, { headers: { Authorization: AuthStr } })
      this.hasExistingLeaveCheck()
    },
    async funGetApprovalSubsPreviosLeaves(selectedEmp) {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      this.approval_subs_leaves = await this.$axios.$get("/leaves/user_leaves/" + selectedEmp._id, { headers: { Authorization: AuthStr } });
      this.approval_subs_wfh = await this.$axios.$get("/wfh/user_wfh/" + selectedEmp._id, { headers: { Authorization: AuthStr } })
      this.checkApprovalSubsHasExistingLeaveCheck()
      this.checkApprovalSubsHasExistingWFHCheck()
    },
    halfDayCheck() {
      setTimeout(() => {
        const date1 = new Date(this.leave.from_date);
        const date2 = new Date(this.leave.to_date);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (this.half_day == true && diffDays > 0) {
          this.half_day = false
        }
        this.funRemainingLeaves()
        this.getLeaveRemaining()
      }, 100)
    },
    checkApprovalSubsLeave() {
      let approvalSubs = this.users.filter((employee) => employee._id == this.leave.approval_substitute)
      this.funGetApprovalSubsPreviosLeaves(approvalSubs[0])
    },
    hasExistingWFHCheck() {
      let flag = [];
      let existing_half_wfh = this.user_wfh.filter(a => a.no_of_days == '0.5')
      if (this.user_wfh.length > 0) {
        for (let i = 0; i < this.user_wfh.length; i++) {
          let currentWFH = this.user_wfh[i];
          if (
            (new Date(currentWFH.from_date) <=
              new Date(this.leave.from_date) &&
              new Date(this.leave.from_date) <=
              new Date(currentWFH.to_date)) ||
            (new Date(currentWFH.from_date) <= new Date(this.leave.to_date) &&
              new Date(this.leave.to_date) <= new Date(currentWFH.to_date)) ||
            (new Date(this.leave.from_date) <=
              new Date(currentWFH.from_date) &&
              new Date(currentWFH.from_date) <=
              new Date(this.leave.to_date)) ||
            (new Date(this.leave.from_date) <= new Date(currentWFH.to_date) &&
              new Date(currentWFH.to_date) <= new Date(this.leave.to_date))
          ) {
            /**
             * Push true value to indicate that there is an existing leave.
             * If all array values are false, then there is no exisiting leave.
             * Else, if all array values has at least one true value, then there is exisiting leave.
             * */
            if (existing_half_wfh.length != 1 && this.half_day != true) {
              flag.push(true);
            }
            if (!this.half_day && currentWFH.no_of_days == '0.5') flag.push(true)
            if (this.leave.no_of_days != '0.5' && currentWFH.no_of_days != '0.5') flag.push(true)
          }
        }
      }
      if (flag.length > 0 && flag.includes(true)) {
        this.snack = true;
        this.snackColor = "red";
        this.snackText =
          "There is already a WFH application for this period. So, You cannot apply for a leave.";
      }
      const result = flag.length < 1 || !flag.includes(true) ? false : true;

      return result;
    },
    checkApprovalSubsHasExistingWFHCheck() {
      this.snack = false;
      let flag = [];
      let existing_half_wfh = this.approval_subs_wfh.filter(a => a.no_of_days == '0.5')
      if (this.approval_subs_wfh.length > 0) {
        for (let i = 0; i < this.approval_subs_wfh.length; i++) {
          let currentWFH = this.approval_subs_wfh[i];
          if (
            (new Date(currentWFH.from_date) <=
              new Date(this.leave.from_date) &&
              new Date(this.leave.from_date) <=
              new Date(currentWFH.to_date)) ||
            (new Date(currentWFH.from_date) <= new Date(this.leave.to_date) &&
              new Date(this.leave.to_date) <= new Date(currentWFH.to_date)) ||
            (new Date(this.leave.from_date) <=
              new Date(currentWFH.from_date) &&
              new Date(currentWFH.from_date) <=
              new Date(this.leave.to_date)) ||
            (new Date(this.leave.from_date) <= new Date(currentWFH.to_date) &&
              new Date(currentWFH.to_date) <= new Date(this.leave.to_date))
          ) {
            /**
             * Push true value to indicate that there is an existing leave.
             * If all array values are false, then there is no exisiting leave.
             * Else, if all array values has at least one true value, then there is exisiting leave.
             * */
            if (existing_half_wfh.length != 1 && this.half_day != true) {
              flag.push(true);
            }
          }
        }
      }
      if (flag.length > 0 && flag.includes(true)) {
        this.snack = true;
        this.snackColor = "red";
        this.snackText =
          "There is already a WFH application for this period of the selected substitute approver.";
      }
      const result = flag.length < 1 || !flag.includes(true) ? false : true;

      return result;
    },
    hasExistingLeaveCheck() {
      let flag = [];
      let existing_half_leave = this.user_leaves.filter(a => a.no_of_days == '0.5')
      if (this.user_leaves.length > 0) {
        for (let i = 0; i < this.user_leaves.length; i++) {
          let currentleave = this.user_leaves[i];
          if (
            (new Date(currentleave.from_date) <=
              new Date(this.leave.from_date) &&
              new Date(this.leave.from_date) <=
              new Date(currentleave.to_date)) ||
            (new Date(currentleave.from_date) <= new Date(this.leave.to_date) &&
              new Date(this.leave.to_date) <= new Date(currentleave.to_date)) ||
            (new Date(this.leave.from_date) <=
              new Date(currentleave.from_date) &&
              new Date(currentleave.from_date) <=
              new Date(this.leave.to_date)) ||
            (new Date(this.leave.from_date) <= new Date(currentleave.to_date) &&
              new Date(currentleave.to_date) <= new Date(this.leave.to_date))
          ) {
            /**
             * Push true value to indicate that there is an existing leave.
             * If all array values are false, then there is no exisiting leave.
             * Else, if all array values has at least one true value, then there is exisiting leave.
             * */
            if (existing_half_leave.length != 1 && this.half_day != true) {
              flag.push(true);
            }
            if (this.half_day) flag.push(true)
          }
        }
      }

      if (flag.length > 0 && flag.includes(true)) {
        this.snack = true;
        this.snackColor = "red";
        this.snackText =
          "There is already a leave application for this period!";
      }
      const result = flag.length < 1 || !flag.includes(true) ? false : true;
      this.hasExistingWFHCheck()
      return result;
    },
    checkApprovalSubsHasExistingLeaveCheck() {
      this.snack = false;
      let flag = [];
      let existing_half_leave = this.approval_subs_leaves.filter(a => a.no_of_days == '0.5')
      if (this.approval_subs_leaves.length > 0) {
        for (let i = 0; i < this.approval_subs_leaves.length; i++) {
          let currentleave = this.approval_subs_leaves[i];
          if (
            (new Date(currentleave.from_date) <=
              new Date(this.leave.from_date) &&
              new Date(this.leave.from_date) <=
              new Date(currentleave.to_date)) ||
            (new Date(currentleave.from_date) <= new Date(this.leave.to_date) &&
              new Date(this.leave.to_date) <= new Date(currentleave.to_date)) ||
            (new Date(this.leave.from_date) <=
              new Date(currentleave.from_date) &&
              new Date(currentleave.from_date) <=
              new Date(this.leave.to_date)) ||
            (new Date(this.leave.from_date) <= new Date(currentleave.to_date) &&
              new Date(currentleave.to_date) <= new Date(this.leave.to_date))
          ) {
            /**
             * Push true value to indicate that there is an existing leave.
             * If all array values are false, then there is no exisiting leave.
             * Else, if all array values has at least one true value, then there is exisiting leave.
             * */
            if (existing_half_leave.length != 1 && this.half_day != true) {
              flag.push(true);
            }
          }
        }
      }

      if (flag.length > 0 && flag.includes(true)) {
        this.snack = true;
        this.snackColor = "red";
        this.snackText =
          "There is already a leave application applied of the selected substitute approver for this period!";
      }
      const result = flag.length < 1 || !flag.includes(true) ? false : true;
      // this.checkApprovalSubsHasExistingWFHCheck()
      return result;
    },
    funRemainingLeaves() {
      let selectedLeave = this.computeLeaveTypes.filter(
        (ele) => ele.leave_name == this.leave.leave_type
      );

      if (selectedLeave.length > 0 && !selectedLeave[0].unpaid_leave_capped) {
        this.remaining_leaves_count = false;
      } else {
        this.remaining_leaves_count = true;
      }
      this.hasExistingLeaveCheck()
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}`;
    },
    getHolidays() {
      var getDays = function (startDate, endDate) {
        const duration = endDate - startDate;
        const interval = 1000 * 60 * 60 * 24; // calculation for a day
        const steps = duration / interval;
        return Array.from(
          { length: steps + 1 },
          (v, i) => new Date(startDate.valueOf() + interval * i)
        );
      };

      let abc = this.configuration[0].holiday_calendar;
      let arr = [];
      for (let index = 0; index < abc.length; index++) {
        if (abc[index].from_date == abc[index].to_date) {
          arr.push(abc[index].from_date);
        } else {
          let a = getDays(
            new Date(abc[index].from_date),
            new Date(abc[index].to_date)
          );
          for (let i = 0; i < a.length; i++) {
            arr.push(a[i].toISOString().substr(0, 10));
          }
        }
      }
      this.delcared_holidays = arr;
    },
    parseDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    },
    dateFormatter(val) {
      return val ? moment(val).format("DD-MM-YYYY") : "";
    },
    onUploadFiles(event) {
      this.uploadFiles = event;
      this.disableSubmitButton = false;
      this.attachmentRequired = false;
    },
    async uploadFile(val) {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);

      const fd = new FormData();
      fd.append("a", val.file, val.name);
      fd.append("b", this.selectedEmp._id + Date.now() + val.file.name);
      fd.append("folder", "claims");

      await this.$axios
        .$post("/requests/upload-file", fd, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.link_url = res.url;
          this.link_filename = res.name;
        })
        .catch();
    },
    async applyLeave() {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);

      if (this.$refs.form.validate()) {
        let flag = this.hasExistingLeaveCheck();
        if (flag) return;

        // if (this.leave.leave_type.leave_name.toLowerCase() == "hajj leaves" && this.leaves_count.no_of_days != 30) {
        //   this.snack = true;
        //   this.snackText = "Hajj Leave should not be less than or more than 30 days.";
        //   this.snackColor = "red";
        //   return;
        // }

        this.newLeaveProgress = true;
        let attachments = [];
        if (this.uploadFiles) {
          for (let i = 0; i < this.uploadFiles.length; i++) {
            if (this.uploadFiles[i].name != undefined) {
              let upload_meta = {
                file: this.uploadFiles[i],
                filename: this.uploadFiles[i].name,
              };
              await this.uploadFile(upload_meta);
              let attach = {
                link: this.link_url,
                filename: this.uploadFiles[i].name,
                time: new Date(),
              };
              attachments.push(attach);
            }
          }
        }

        let body = {
          certificate: attachments,
          leave_type: this.leave.leave_type.leave_name,
          half_day: this.half_day,
          from_date: this.leave.from_date,
          to_date: this.leave.to_date,
          reason: this.leave.reason,
          no_of_days: this.leaves_count.no_of_days,
          remaining_leaves: this.leaves_count.remaining_leaves,
          user_id: this.selectedEmp._id,
          userType: this.userType,
          applied_manager: this.user._id,
          obj_leave_type: this.leave.leave_type,
          approval_substitute: this.leave.approval_substitute,
        };

        let apply_leave = await this.$axios.$post("/leaves/apply_leave", body, {
          headers: { Authorization: AuthStr },
        });

        if (apply_leave && apply_leave.success) {
          this.leave.leave_type = ''
          this.leave.from_date = moment().format('YYYY-MM-DD')
          this.leave.to_date = moment().format('YYYY-MM-DD')
          this.newLeaveProgress = false;
          this.isSent = false;
          this.$nuxt.$emit("resetLeaveForm");
          this.$nuxt.$emit("userUpdated");
          this.$nuxt.$emit("resetLeaveForm_admin");
          notificationMethod.new(this.user._id, body.user_id, body.leave_type, 'New Leave Request Submitted', '/dashboards/myhr#leave')
          // if (this.$route.path.startsWith("/admin-central") || this.$route.path.startsWith("/dashboards/my-team") ) {
          //   this.$nuxt.$emit("resetLeaveForm_admin");
          // }
        } else {
          if (apply_leave && !apply_leave.success) {
            this.newLeaveProgress = false
            this.snack = true;
            this.snackText = apply_leave.message;
            this.snackColor = "red";
          } else {
            this.newLeaveProgress = false
            this.snack = true;
            this.snackText = "Unable to apply leave, Please try again later.";
            this.snackColor = "red";
          }
        }
      }
    },
  },
  computed: {
    managersList() {
      return this.users.filter(a => (a.role_ID == '5e2ec39af3185a0b5036ef03' || a.role_ID == '5e2ec39af3185a0b5036ef01') && a._id != this.selectedEmp._id).sort((a, b) => a.first_name.localeCompare(b.first_name))
    },
    checkLeaveDays() {
      if (this.leaves_count.no_of_days >= this.configuration[0].leave_types.filter((a) => a.leave_duration)[0].leave_duration) {
        this.snack = true;
        this.snackText = "Attachment of file is required.";
        this.snackColor = "red";
        return true
      } else {
        return false
      }
    },
    computeLeaveTypes() {
      if (this.configuration.length > 0) {
        let array_leaves_conditons = this.configuration[0].leave_types;
        let obj_user_data = {
          date_of_joining: this.selectedEmp.date_of_joining,
          employment: this.selectedEmp.employment,
          reporting: this.selectedEmp.reporting,
          personal: this.selectedEmp.personal,
        };

        let array_user_previous_leave = this.user_leaves.filter(
          (a) => a.user_id == this.selectedEmp._id
        );

        const LeaveObj = new Leave();

        let getLeave = LeaveObj.computingLeaveTypes(
          obj_user_data,
          array_leaves_conditons,
          array_user_previous_leave
        );
        return getLeave.sort((a, b) => a.leave_name.localeCompare(b.leave_name))
      }
    },
    computeAddRequestButton() {
      return this.hasExistingLeaveCheck();
    },
    computeAddRequestButtonForApprovalSubs() {
      if ((this.selectedEmp.role_ID == '5e2ec39af3185a0b5036ef03' || this.selectedEmp.role_ID == '5e2ec39af3185a0b5036ef01') && this.hrss) {
        if (this.leave.approval_substitute) {
          if (this.checkApprovalSubsHasExistingLeaveCheck() || this.checkApprovalSubsHasExistingWFHCheck()) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      } else {
        return false
      }
    },
    computeAddRequestButtonInitial() {
      if (this.leave.leave_type == '') {
        return true
      }
    },
    computeHajjLeave() {
      if (this.leave && this.leave.leave_type && this.leave.leave_type.leave_name && this.leave.leave_type.leave_name.toLowerCase() == "hajj leaves" && this.leaves_count.no_of_days != 30) {
        this.snack = true;
        this.snackText = "Hajj Leave should not be less than or more than 30 days.";
        this.snackColor = "red";
        return true;
      }
    },
    computeLevelApprover() {
      if (this.user.reporting.leaves_approvals.level_1 == '') {
        this.snack = true;
        this.snackText = "Please contact your HR Department as this request is not linked with an approver.";
        this.snackColor = "red";
        return true;
      } else {
        return false
      }
    },
    ComputeCheckWFHRequesButton() {
      return this.hasExistingWFHCheck();
    },
    computedDateFormatted_toDate() {
      return this.formatDate(this.leave.to_date.substr(0, 10));
    },
    computedDateFormatted_fromDate() {
      // this.computedDateFormatted_toDate = this.formatDate(this.leave.from_date.substr(0, 10));
      // this.leave.to_date = this.leave.from_date.substr(0, 10)
      return this.formatDate(this.leave.from_date.substr(0, 10));
    },
  },
};
</script>

<style>
.v-text-field__details {
  display: block;
}

.v-messages__message {
  padding: 0.5rem 0;
}

.redTextForm {
  .v-text-field__details {
    display: block !important;

    .v-messages {
      .v-messages__wrapper {
        .v-messages__message {
          color: #f42121 !important;
        }
      }
    }
  }
}
</style>

