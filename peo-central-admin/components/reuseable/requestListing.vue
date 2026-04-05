<template>
    <v-row justify="center" class=" mx-0 scroll" style="width:100%;max-height:388px">
        <v-list two-line class="py-0" style="width:100%">
            <v-list-item class="leaveList pa-0" @click="getTeamRequestPreview(data)"
                :style="getStatusBorderColor(data.status)">
                <v-list-item-avatar size="40" class="mx-4">
                    <v-img :src="getImage(data.user_id)" v-if="!selfService"></v-img>
                    <v-img :src="getRequestImage(data)" v-else></v-img>
                </v-list-item-avatar>
                <v-list-item-content class="py-0" style="max-width:35%">
                    <v-list-item-title class="pt-0 font-weight-medium textFontSize mb-0 darkBlue-heading-text"
                        v-if="!selfService">
                        {{ getUserName(data.user_id) }}
                    </v-list-item-title>
                    <v-list-item-title class="pt-0 font-weight-medium textFontSize mb-0 darkBlue-heading-text" v-else>
                        <p v-if="data.hasOwnProperty('leave_type')" class="mb-0 " color="#5C7EEF">Leave</p>
                        <p v-else-if="data.request_type == 'wfh'" class="mb-0 " color="#94BC8C">WFH
                        </p>
                        <p v-else-if="data.request_type == 'attendance'" class="mb-0 " color="#66B8FF">Attendance</p>
                        <p v-else-if="data.request_type == 'letters'" class="mb-0 " color="#EFAE90">Letter</p>
                        <p v-else-if="data.request_type == 'claims'" class="mb-0 " color="#8C9BFF">Claim</p>
                        <p v-else-if="data.request_type == 'loan'" class="mb-0 " color="#8C9BFF">
                            Loan</p>
                        <p v-else-if="data.request_type == 'education'" class="mb-0 " color="#8C9BFF">Education</p>
                        <p v-else-if="data.request_type == 'passport release'" class="mb-0 " color="#8C9BFF">Passport
                            Release</p>
                        <p v-else-if="data.request_type == 'passport safekeep'" class="mb-0 " color="#8C9BFF">Passport
                            Safekeep</p>
                        <p v-else class="mb-0 " color="#8C9BFF">Salary</p>
                    </v-list-item-title>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }"
                        v-if="data.hasOwnProperty('leave_type')">{{ data.leave_type }}</h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }" v-else-if="data.request_type == 'wfh'">
                        WFH</h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }"
                        v-else-if="data.request_type == 'attendance'">{{ data.letter_fields.startTime | requestsDateFormat
                        }}
                        - {{ data.letter_fields.endTime | requestsDateFormat }}</h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }"
                        v-else-if="data.request_type == 'letters' && data.letter_type">{{ data.letter_type }}</h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }"
                        v-else-if="data.request_type == 'claims' && data.letter_sub_type">{{ data.letter_sub_type }}</h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }" v-else-if="data.request_type == 'loan'">
                        {{ data.letter_fields.loan_type }}</h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }"
                        v-else-if="data.request_type == 'education'">{{ data.letter_fields.education_start_year }}</h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }"
                        v-else-if="data.request_type == 'passport release'">{{ data.letter_fields.passport_release_Date }}
                    </h5>
                    <h5 class="grey-heading-text font-weight-normal text-truncate"
                        :class="{ 'caption': !hideUserInfo, 'ml-3': hideUserInfo }" v-else>{{ data.date_created |
                            payrollPayprocess }}</h5>
                </v-list-item-content>
                <v-list-item-content class="py-0" style="align-self:start">
                    <div>
                        <v-chip x-small v-if="data.hasOwnProperty('leave_type')" class="vChipBorderRadius white--text"
                            color="#5C7EEF" style="height:20px;font-size: 11px;">Leave</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'wfh'" class="vChipBorderRadius white--text"
                            color="#94BC8C" style="height:20px;font-size: 11px;">WFH</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'attendance'" class="vChipBorderRadius white--text"
                            color="#66B8FF" style="height:20px;font-size: 11px;">Attendance</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'letters'" class="vChipBorderRadius white--text"
                            color="#EFAE90" style="height:20px;font-size: 11px;">Letter</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'claims'" class="vChipBorderRadius white--text"
                            color="#8C9BFF" style="height:20px;font-size: 11px;">Claim</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'loan'" class="vChipBorderRadius white--text"
                            color="#8C9BFF" style="height:20px;font-size: 11px;">Loan</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'education'" class="vChipBorderRadius white--text"
                            color="#8C9BFF" style="height:20px;font-size: 11px;">Education</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'passport release'"
                            class="vChipBorderRadius white--text" color="#8C9BFF"
                            style="height:20px;font-size: 11px;">Passport Release</v-chip>
                        <v-chip x-small v-else-if="data.request_type == 'passport safekeep'"
                            class="vChipBorderRadius white--text" color="#8C9BFF"
                            style="height:20px;font-size: 11px;">Passport Safekeep</v-chip>
                        <v-chip x-small v-else class="vChipBorderRadius white--text" color="#8C9BFF"
                            style="height:20px;font-size: 11px;">Salary
                            Adjustment</v-chip>
                    </div>
                </v-list-item-content>

                <v-list-item-action class="ma-0">
                    <v-list-item-action-text class="caption mt-2 ml-4">
                        <v-list-item-action-text class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                            style="min-width: 90px;" v-if="data.hasOwnProperty('leave_type')">
                            <div>
                                <div class="d-flex">
                                    <v-img src="/hr/calendar-linear.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                    <div style="min-width:45px" class="darkBlue-heading-text">
                                        <v-card-text class="mb-0 pa-0 font-weight-medium"
                                            style="font-size:18px !important">{{ numberFormat(data.no_of_days)
                                            }}</v-card-text>
                                        <v-card-text class="mb-0 pa-0 textFontSize customLineHeight"
                                            v-if="data.no_of_days == 1">day</v-card-text>
                                        <v-card-text class="mb-0 pa-0 textFontSize customLineHeight"
                                            v-else>days</v-card-text>
                                    </div>
                                </div>
                                <!-- <div>
                                    <v-chip x-small  class="rounded-lg white--text" :color="getLeaveColor(data.leave_type)" style="height:20px;font-size: 11px;"  >{{data.leave_type.slice(0,-6)}}</v-chip>
                                </div> -->
                            </div>
                        </v-list-item-action-text>
                        <v-list-item-action-text class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                            style="min-width: 90px;" v-else-if="data.request_type == 'wfh'">
                            <div>
                                <div class="d-flex">
                                    <v-img src="/hr/calendar-linear.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                    <div style="min-width:45px" class="darkBlue-heading-text">
                                        <v-card-text class="mb-0 pa-0 font-weight-medium"
                                            style="font-size:18px !important">{{ numberFormat(data.no_of_days)
                                            }}</v-card-text>
                                        <v-card-text class="mb-0 pa-0 textFontSize customLineHeight"
                                            v-if="data.no_of_days == 1">day</v-card-text>
                                        <v-card-text class="mb-0 pa-0 textFontSize customLineHeight"
                                            v-else>days</v-card-text>
                                    </div>
                                </div>
                                <!-- <div>
                                    <v-chip x-small  class="rounded-lg white--text" color="#94BC8C" style="height:20px;font-size: 11px;"  >WFH</v-chip>
                                </div> -->
                            </div>
                        </v-list-item-action-text>
                        <v-list-item-action-text class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                            style="min-width: 90px;" v-else-if="data.request_type == 'attendance'">
                            <div>
                                <div class="d-flex">
                                    <v-img src="/hr/calendar-linear.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                    <div style="min-width:45px" class="darkBlue-heading-text">
                                        <!-- <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size:18px !important">{{numberFormat(getDaysBetweenDates(data.letter_fields.startTime,data.letter_fields.endTime))}}</v-card-text>  -->
                                        <!-- <v-card-text class="mb-0 pa-0 textFontSize customLineHeight" v-if="getDaysBetweenDates(data.letter_fields.startTime,data.letter_fields.endTime) == 1">day</v-card-text>  -->
                                        <!-- <v-card-text class="mb-0 pa-0 textFontSize customLineHeight" v-else>days</v-card-text>  -->
                                    </div>
                                </div>
                                <!-- <div>
                                    <v-chip x-small  class="rounded-lg white--text" color="#0064D7" style="height:20px;font-size: 11px;"  >Attendance</v-chip>
                                </div> -->
                            </div>
                        </v-list-item-action-text>
                        <v-list-item-action-text class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                            style="align-items:center;min-width: 90px;" v-else-if="data.request_type == 'claims'">
                            <v-img src="/team/wallet.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <div style="min-width:45px" class="darkBlue-heading-text">
                                <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size:18px !important">
                                    {{ data.letter_fields.amount }}</v-card-text>
                                <v-card-text class="mb-0 pa-0 textFontSize customLineHeight">AED</v-card-text>
                            </div>
                        </v-list-item-action-text>
                        <v-list-item-action-text class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                            style="align-items:center;min-width: 90px;" v-else-if="data.request_type == 'loan'">
                            <v-img src="/team/wallet.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <div style="min-width:45px" class="darkBlue-heading-text">
                                <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size:18px !important">
                                    {{ data.letter_fields.loan_amount }}</v-card-text>
                                <v-card-text class="mb-0 pa-0 textFontSize customLineHeight">AED</v-card-text>
                            </div>
                        </v-list-item-action-text>
                        <v-list-item-action-text class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                            style="align-items:center;min-width: 90px;" v-else-if="data.request_type == 'education'">
                            <v-img src="/team/wallet.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <div style="min-width:45px" class="darkBlue-heading-text">
                                <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size:18px !important">
                                    {{ data.letter_fields.education_amount }}</v-card-text>
                                <v-card-text class="mb-0 pa-0 textFontSize customLineHeight">AED</v-card-text>
                            </div>
                        </v-list-item-action-text>

                        <v-list-item-action-text class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                            style="min-width: 90px;" v-else-if="!(data.request_type)">
                            <v-img src="/hr/calendar-linear.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <div style="min-width:45px" class="darkBlue-heading-text">
                                <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size:18px !important">
                                    {{ data.effective_date | day }}</v-card-text>
                                <v-card-text class="mb-0 pa-0 textFontSize customLineHeight">{{ data.effective_date |
                                    month }}</v-card-text>
                            </div>
                        </v-list-item-action-text>
                    </v-list-item-action-text>
                </v-list-item-action>
            </v-list-item>
            <v-divider class="" :key="data._id"></v-divider>
        </v-list>
    </v-row>
</template>
<script>

export default {
    layout: 'dashboard',
    props: ['data', "salaryData", 'users', 'user', 'emailBody', 'computedServiceList', 'history', ' viewRequestHistory', 'hideUserInfo', 'selfService'],
    data() {
        return {
            downloadLetters: false,
            letterUpload: false,
            selectedService: '',
            selectedFilter: 'ALL'
        }
    },
    methods: {
        getUserName(id) {
            let abc = this.users.filter(a => a._id == id)
            if (abc.length == 0) {
                return ''
            } else {
                return abc[0].first_name + ' ' + abc[0].last_name
            }
        },
        getImage(val) {
            let image = 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
            if (this.users.length > 0) {
                let abc = this.users.filter(a => a._id == val)
                if (abc.length > 0) {
                    if (abc[0].hasOwnProperty('image_url')) {
                        if (abc[0].image_url != '') image = abc[0].image_url
                    }
                }
            }
            return image
        },
        getRequestImage(val) {
            if (val && val.hasOwnProperty('leave_type')) {
                if (val == 'Annual Leave' || val == 'Annual Leaves') return '/hr/annual.svg'
                else if (val == 'Medical Leaves') return '/hr/medical.svg'
                else return '/hr/other_leave.svg'
            } else {
                if (val.request_type == 'letters') return '/team/letterReq.svg'
                else if (val.request_type == 'claims') return '/team/claimsReq.svg'
                else if (val.request_type == 'wfh') return '/hr/wfh-history.svg'
                else if (val.request_type == 'loan') return '/team/claimsReq.svg'
                else if (val.request_type == 'education') return '/team/claimsReq.svg'
                else if ((val.request_type == 'passport release' || val.request_type == 'passport safekeep')) return '/team/claimsReq.svg'
                else if (val.request_type == 'attendance') return '/team/attendanceReq.svg'
            }
        },
        getLeaveColor(val) {
            if (val == "Annual Leave" || val == "Annual Leaves") return '#5C7EEF'
            if (val == "Medical Leave" || val == "Medical Leaves") return '#6869AC'
            if (val == "Emergency Leave" || val == "Emergency Leaves") return '#7B658B'
            if (val == "Parental Leave" || val == "Parental Leaves") return '#978E9A'
            if (val == "Maternity Leave" || val == "Maternity Leaves") return '#958E9A'
        },
        getDaysBetweenDates(startDate, endDate) {
            if (typeof startDate !== 'string' && typeof endDate !== 'string') return 0;

            startDate = startDate.substr(0, 10);
            endDate = endDate.substr(0, 10);

            let dates = [];
            startDate = new Date(startDate.replace(/-/g, '/'));
            endDate = new Date(endDate.replace(/-/g, '/'));

            let now = new Date(startDate)
            while (now <= endDate) {
                let a = `${now}`
                dates.push(a);
                now.setDate(now.getDate() + 1);
            }
            return dates.length;
        },
        numberFormat(n) {
            return parseInt(n) > 9 ? parseInt(n) : parseInt(n) < 1 ? n : ("0" + parseInt(n));
        },
        getTeamRequestPreview(data) {
            this.$emit("getTeamRequestPreview", data);
        },
        getStatusBorderColor(val) {
            if (val == 'Processing' || val == 'processing' || val == "pending") return 'border-left: #F2B626 solid 3px;'
            else if (val == 'Active' || val == 'active') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Completed') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Withdrawn' || val == 'withdrawn') return 'border-left: grey solid 3px;'
            else if (val == 'Rejected' || val == 'rejected') return 'border-left: #FD5959 solid 3px;'
            else if (val == 'Cancelled') return 'border-left: #FD5959 solid 3px;'
            else if (val == 'completed') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Approved') return 'border-left: #00E67A solid 3px;'
            else return 'border-left: grey solid 3px;'
        },
        getColor(val) {
            if (val == 'Submitted') return 'teal'
            else if (val == 'Processing' || val == 'processing') return '#FCF3D8'
            else if (val == 'Active' || val == 'active') return '#CAF8E9'
            else if (val == 'Completed') return '#CAF8E9'
            else if (val == 'Withdrawn' || val == 'withdrawn') return '#FFEBEC'
            else if (val == 'Rejected' || val == 'rejected') return '#FFEBEC'
            else if (val == 'Cancelled') return '#FFEBEC'
            else return 'grey'
        },
    },
    computed: {

    }
}
</script>