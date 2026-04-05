<template>
  <div class="application-log-list__container py-3">
    <h3 v-if="applicationLogs.length === 0" class="my-5 text-center">No
      Application Logs</h3>

    <template v-else v-for="(item, index) in newApplicationLog">
      <div class="d-flex flex-nowrap" :key="index" :style="{ 'column-gap': '1rem' }">
        <div class="application-log-list__avatar-container">
          <v-avatar size="64">
            <v-img v-if="item.hasOwnProperty('approver_id')" :src="getUserImageFromUsers(item.approver_id)"
              alt=""></v-img>
            <v-img v-else-if="item.hasOwnProperty('created_by')" :src="getUserImageFromUsers(item.created_by)"
              alt=""></v-img>
            <v-img v-else src="/dashboard/date.svg" alt=""></v-img>
          </v-avatar>
        </div>

        <div class="application-log-list__details-container">
          <div class="subtitle-1"><span>Name</span>:
            {{ item.approver_id ? getUserNameFromUsers(item.approver_id) : getUserNameFromUsers(item.created_by) }}</div>
          <div class="subtitle-1"><span>Status</span>:
            {{ getApplicationStatusName(item.status) }}</div>
          <div class="subtitle-1"><span>Date</span>: {{ dateCreatedFormatted(item.date_created)
          }}</div>
          <div v-if="item.assigned_to" class="subtitle-1">
            <span>Assigned To</span>: {{ getUserNameFromUsers(item.assigned_to) }}
          </div>
          <div v-if="item.reason !== ''" class="subtitle-1">
            <span>Remarks</span>: {{ item.reason }}
          </div>

          <!-- First log of leave request -->
          <div
            v-if="item.status.includes('Created') && request && request.leave_type && request.leave_type == 'Unpaid Leaves'"
            class="subtitle-1">
            <span>Total Unpaid leaves taken</span>: {{ item.remaining_leave }}
          </div>
          <div v-else-if="item.remaining_leave && item.status.includes('Created')" class="subtitle-1">
            <span>Balance</span>: {{ item.remaining_leave }}
          </div>

          <!-- Approved Leave final log -->
          <!-- <div v-if="item.status == 'Leave Request Approved' && request.leave_type == 'Unpaid Leaves'" class="subtitle-1">
            Credited Days: {{ request.no_of_days }}
          </div>
          <div v-if="item.status == 'Leave Request Approved' && request.leave_type != 'Unpaid Leaves'" class="subtitle-1">
            Deducted Days: {{ request.no_of_days }}
          </div> -->

          <!-- Rejected Leave final log -->
          <div
            v-if="(item.status == 'Leave Request Rejected' || item.status == 'Leave Request Withdrawn.') && request.leave_type == 'Unpaid Leaves'"
            class="subtitle-1">
            <span>Deducted Days</span>: {{ request.no_of_days }}
          </div>
          <div
            v-else-if="(item.status == 'Leave Request Rejected' || item.status == 'Leave Request Withdrawn.') && request.leave_type != 'Unpaid Leaves'"
            class="subtitle-1">
            <span>Credited Days</span>: {{ request.no_of_days }}
          </div>
        </div>
      </div>
      <v-divider v-if="applicationLogs.length !== index + 1" :key="`Divider ${index}`" class="my-4"></v-divider>
      <!-- <v-divider v-if="item.status == 'Rejected by Admin' || item.status == 'Rejected By Admin' || item.status == 'Leave Request Withdrawn by Employee.'"></v-divider>
      <div class="row pt-3">
        <div cols="12" col="2">
          <v-img v-if="item.status == 'Rejected by Admin' || item.status == 'Rejected By Admin'" src="/hr/claim.svg" size="10" style="height:35px;width:25px"></v-img>
        </div>
        <div cols="12" col="9" >
          <div class="subtitle-1 ma-2" v-if="item.status == 'Rejected by Admin' || item.status == 'Rejected By Admin'">
            <p class="ma-2">Status: Request rejected by Admin</p>
          </div>
        </div>
      </div>
      <div class="row pt-3">
        <div cols="12" col="2">
          <v-img v-if="item.status == 'Leave Request Withdrawn by Employee.'" src="/hr/claim.svg" size="10" style="height:35px;width:25px"></v-img>
        </div>
        <div class="12" col="9">
          <div class="subtitle-1 ma-2" v-if="item.status == 'Leave Request Withdrawn by Employee.'">
            <p class="ma-2">Status: Letter Request Rejected.</p>
          </div>
        </div> 
      </div>-->
    </template>
    <v-divider></v-divider>
    <div class="d-flex flex-nowrap my-5" :style="{ 'column-gap': '1rem' }" v-if="request.request_type">
      <div class="application-log-list__avatar-container">
        <v-avatar size="50">
          <v-img :src="getIcon(request.request_type)" alt=""></v-img>
        </v-avatar>
      </div>
      <div class="application-log-list__details-container mt-3">
        <div class="subtitle-1"><span>Status</span>: {{
          `${getRequestName(request.request_type)} Request is
                  ${updateStatus(requestStatus)}` }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  props: {
    applicationLogs: {
      type: Array,
      default: () => ([])
    },
    requestStatus: {
      type: String
    },
    request_type: {
      type: String
    },
    request: {
      type: Object
    }
  },
  data() {
    return {
      users: []
    }
  },
  created() {
    this.getUsers();
  },
  methods: {
    updateStatus(val) {
      if (val == 'Cancelled') {
        return 'Rejected'
      }
      else {
        return val.replaceAll('Cancelled', 'Rejected')
      }
    },
    getIcon(request) {
      if (request.toLowerCase() == 'leaves') return '/team/leaveReq.svg'
      if (request.toLowerCase() == 'wfh') return '/team/wfhReq.svg'
      if (request.toLowerCase() == 'letters') return '/team/letterReq.svg'
      if (request.toLowerCase() == 'claims') return '/team/claimsReq.svg'
      if (request.toLowerCase() == 'attendance') return '/team/attendanceReq.svg'
      else return "/dashboard/date.svg"
    },
    getRequestName(request) {
      if (request == 'leaves') return 'Leave'
      if (request == 'wfh') return 'Work from home'
      if (request == 'letters') return 'Letter'
      if (request == 'claims') return 'Claim'
      if (request == 'attendance') return 'Attendance '
      else return request
    },
    getUserImageFromUsers(id) {
      let image = 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png';
      if (this.users.length > 0) {
        const users = this.users.filter(a => a._id == id)
        if (users.length > 0) {
          if (users[0].hasOwnProperty('image_url')) {
            if (users[0].image_url != '') image = users[0].image_url;
          }
        }
      }

      return image;
    },
    getUserNameFromUsers(id) {
      const filteredUsers = this.users.filter((user) => user._id === id);
      return filteredUsers.length > 0 ? `${filteredUsers[0].first_name} ${filteredUsers[0].last_name}` : '';
    },
    getApplicationStatusName(approvalStatus) {
      return this.requestStatus == 'withdrawn' && approvalStatus == 'Pending' ? 'Withdrawn by User' : approvalStatus;
    },
    dateCreatedFormatted(dateString) {
      return moment(dateString).format('MMM DD, YYYY, LT');
    },
    async getUsers() {
            const token = this.$store.getters.getToken
            const AuthStr = "Bearer " + token

            const getLogin = this.$store.getters.getLogin

            this.users = await this.$axios.$get("/users/", { headers: { Authorization: AuthStr } });
        },
  },
  computed: {
    newApplicationLog() {
      if (this.request.request_type) {
        return this.applicationLogs = this.applicationLogs.filter(obj => obj.status !== 'Leave Request Approved' && obj.status !== 'Claim Request Approved' && obj.status !== 'Attendance Request Approved' && obj.status !== 'Letter Request Approved' && obj.status !== 'WFH Request Approved' && obj.status !== 'WFH Request Rejected' && obj.status !== 'Leave Request Rejected' && obj.status !== 'Attendance Request Rejected' && obj.status !== 'Rejected' && obj.status !== 'Claim Request Rejected' && obj.status !== 'Letter Request Rejected');
      } else {
        return this.applicationLogs = this.applicationLogs.filter(obj => obj.status !== 'Leave Request Approved' && obj.status !== 'Claim Request Approved' && obj.status !== 'Attendance Request Approved' && obj.status !== 'Letter Request Approved' && obj.status !== 'WFH Request Approved' && obj.status !== 'WFH Request Rejected' && obj.status !== 'Leave Request Rejected' && obj.status !== 'Attendance Request Rejected' && obj.status !== 'Claim Request Rejected' && obj.status !== 'Letter Request Rejected');
      }
    }
  }

}
</script>

<style scoped></style>