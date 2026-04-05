<template>
  <div>
    <v-progress-linear
        indeterminate
        v-if="editAttendanceProgress == true">
    </v-progress-linear>
    <v-row class="mx-auto attendancetabs" style="max-width:80%">
        <v-col cols="12" sm="12" md="12">
            <v-form ref="form">
                <v-row class="pt-5 px-5">
                    <v-col cols="12" sm="12" class="pl-0">
                        <v-list-item class="" >
                            <v-list-item-action class="my-auto mr-0">
                                <v-list-item-action-text class="caption mt-2 ml-4">
                                    <v-list-item-action-text class="caption mt-0 d-flex">
                                        <v-img src="/hr/calendar-linear.svg" max-width="fit-content" height="fit-content" class="mr-2 mt-1" contain></v-img>
                                        <div style="min-width:45px" class="darkBlue-heading-text">
                                            <v-card-text class="mb-0 pa-0 font-weight-medium grey-heading-text" style="font-size:18px !important">{{data.date | dateToDay}}</v-card-text> 
                                            <v-card-text class="mb-0 pa-0 textFontSize grey-heading-text" >{{data.date | dateToMonth}}</v-card-text> 
                                        </div>
                                    </v-list-item-action-text>
                                </v-list-item-action-text>                      
                            </v-list-item-action>
                            <v-list-item-content class="py-0">
                                <v-list-item-title class="pt-0 font-weight-medium textFontSize darkBlue-heading-text"><p>{{getDayOfWeek(data.day)}}</p></v-list-item-title>
                                <h5 class="grey-heading-text caption font-weight-normal" >Check in <span style="color:#00CC86 !important">{{data.startTime | time_with_ampm}}</span> | Check out 
                                    <span v-if="data.endTime != ''" style="color:#FA484C !important">{{data.endTime | time_with_ampm}}</span>
                                    <span v-else>00:00</span>
                                </h5>
                            </v-list-item-content>
                        </v-list-item>  
                    </v-col>
                <v-row>
                    <v-col cols="12" sm="12" class="px-0">
                        <v-row>
                            <v-col cols="12" sm="6" class="pb-0">

                                <v-text-field v-model="start_date" disabled label="Clock in Date" prepend-icon="mdi-calendar" readonly></v-text-field>

                                <v-menu
                                    v-model="menu2"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    min-width="290px"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Edit Start Time </p>
                                        <v-text-field
                                            readonly
                                            v-model="editAttendanceData.startTime"
                                            v-bind="attrs"
                                            v-on="on"
                                            :rules="genericRule">
                                        </v-text-field>
                                    </template>
                                    <v-time-picker
                                        v-if="menu2"
                                        no-title
                                        full-width
                                        format="ampm"
                                        v-model="editAttendanceData.startTime"
                                    >
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="menu2 = false"> OK</v-btn>
                                    </v-time-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12" sm="6" class="pb-0">
                                <v-menu v-model="end_time_date" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="formatEndDate" label="Clock out Date" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="end_date" @input="end_time_date = false"></v-date-picker>
                                </v-menu>
                                <v-menu
                                    v-model="menu3"
                                    :close-on-content-click="false"
                                    transition="scale-transition"
                                    min-width="290px"
                                    >
                                    <template v-slot:activator="{ on, attrs }">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Edit End Time</p>
                                        <v-text-field v-model="editAttendanceData.endTime"  readonly v-bind="attrs" v-on="on" :rules="genericRule"></v-text-field>
                                    </template>
                                    <v-time-picker
                                        v-if="menu3"
                                        no-title
                                        full-width
                                        format="ampm"
                                        v-model="editAttendanceData.endTime"
                                    >
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="menu3 = false"> OK</v-btn>
                                    </v-time-picker>
                                </v-menu>
                            </v-col>
                        </v-row>
                        </v-col>
                        <v-col cols="12" sm="12" class="pb-0">
                            <p class="mb-0 grey-heading-text font-weight-medium textFontSize">Add Reason <span class="red--text">*</span></p>
                        </v-col>
                        <v-col cols="12" sm="12" class="py-0">
                            <v-textarea rows="2" auto-grow placeholder="" v-model="editAttendanceData.comments" :rules="genericRule"></v-textarea>
                        </v-col>                                    
                    </v-row>
                </v-row>
            </v-form>
            <v-row class="pt-8 pr-3">
                <v-col cols="12" class="text-right pt-0">
                    <v-btn
                        color="primary"
                        style="min-width:150px"
                        @click.prevent="submitEditAttendance()"
                        :disabled="editAttendanceData.dates.length <= 0 || computeLevelApprover"
                        depressed
                        elevation="0"
                        class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset"
                        dark
                        >Submit</v-btn
                    >
                </v-col>
            </v-row>
        </v-col>
    </v-row>
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
import moment from 'moment'
// import { AttendanceEmail } from "@nathangroup/attendance-email"
// import notificationMethod from "~/plugins/notification";

    export default {
    layout: "dashboard",
    props: [
        "data",
        "request",
        'user',
        'users',
        'selectedEmp',
        'companyData',
        'userType'
    ],
    data() {
        return {
            menu1: false,
            menu2: false,
            menu3: false,
            snack: false,
            snackText: '',
            snackColor:'',
            attendancefiles1:[],
            duplicate_alert_flag:false,
            added_alert_flag:false,
            alertTextForDuplicate:'',
            alertTextForAdded:'',
            tab:"",
            genericRule: [
                v => !!v || 'This field is Required'
            ],
            editAttendanceData: {
                dates: [new Date().toISOString().substr(0, 10)],
                startTime: null,
                endTime: null,
                comments: ""
            },
            editAttendanceProgress:false,
            end_date: '',
            end_time_date: false,
            start_time_date: false,
            config_details: {},
            emailBodyHR: {
                hr_email: "",
                email: "",
                subjectMsg: "",
                eMessage: "",
                email: ""
            },
            emailBody: {
                hr_email: "",
                email: "",
                subjectMsg: "",
                eMessage: "",
                email: ""
            },
        };
    },
    created() {
        /** Initialize data for datepicker. */
        this.editAttendanceData.startTime = this.data.startTime ? moment(String(this.data.startTime)).format('HH:mm') : null
        this.editAttendanceData.endTime = this.data.endTime ? moment(String(this.data.endTime)).format('HH:mm') : null
    },
    mounted() {
        // this.getData(this.user._id);

        this.end_date = new Date(this.data.date).toISOString().substr(0, 10)
        this.start_time_date = new Date(this.data.date).toISOString().substr(0, 10)
    },
    methods: {
        time_with_ampm(value) {
            if (value) {
                return moment(String(value)).format('hh:mm A')
            }
        },
        getCompanyInformation(){
            let company = this.companyData.filter((a) => a._id == this.selectedEmp.company_ID)          
            return company.length > 0 ? company[0] :''
        },
        getDayOfWeek(val){
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (val) {
                return days[val]
            }
        },
        async submitEditAttendance() {
            const token =  this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            
            if (this.$refs.form.validate()) {
                this.editAttendanceProgress = true;               

                let editAttendancePayload = {
                    application_log: [],
                    approvals: [],
                    assigned_to: "",
                    letter_fields: {
                        day: "",
                        date: "",
                        prev_startTime: "",
                        prev_endTime: "",
                        startTime: "",
                        endTime: "",
                        comments: ""
                    },
                    letter_sub_type: "",
                    letter_type: "New Attendance Request",
                    request_type: "attendance",
                    status: "processing",
                    user_id: ""
                };
                
                let start_time = this.data.startTime ? moment(String(this.data.startTime)).format('HH:mm') : moment(String(this.data.date)).format('HH:mm');
                let end_time = this.data.endTime ? moment(String(this.data.endTime)).format('HH:mm') : moment(String(this.data.date)).format('HH:mm');

                if (this.editAttendanceData.startTime == start_time) {
                    editAttendancePayload.letter_fields.startTime = this.data.startTime
                } else {
                    editAttendancePayload.letter_fields.startTime = this.editAttendanceData.startTime !== null
                    ? new Date(moment(`${ this.start_time_date } ${ this.editAttendanceData.startTime }`,'YYYY-MM-DD HH:mm:ss').format()).toISOString()
                    : this.data.startTime;
                }

                if (this.editAttendanceData.endTime == end_time) {
                    editAttendancePayload.letter_fields.endTime = this.data.endTime
                } else {
                    editAttendancePayload.letter_fields.endTime = this.editAttendanceData.endTime !== null
                    ? new Date(moment(`${ this.end_date}  ${ this.editAttendanceData.endTime }`,'YYYY-MM-DD HH:mm:ss').format()).toISOString()
                    : this.data.endTime;
                }

                let body = {
                    prev_startTime: this.data.startTime,
                    prev_endTime: this.data.endTime,
                    startTime: editAttendancePayload.letter_fields.startTime,
                    endTime: editAttendancePayload.letter_fields.endTime,
                    date: this.data.date,
                    comments: this.editAttendanceData.comments,
                    user_id: this.selectedEmp._id,
                    applied_manager: this.user._id,
                    userType: this.userType,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }

                let apply_attendance = await this.$axios.$post('/attendance/add_attendance', body, {headers: { Authorization: AuthStr }})

                if (apply_attendance && apply_attendance.success) {
                        this.editAttendanceProgress = false;
                        this.$emit("close-form")
                        this.$emit("on-submitted");
                        this.snack = true
                        this.snackText = 'Your Attendance request is on its way!'
                        this.snackColor = 'green'
                    } else {
                        if (apply_attendance && !apply_attendance.success) {
                            this.snack = true
                            this.snackText = apply_attendance.message
                            this.snackColor = 'error'
                            this.editAttendanceProgress = false;
                            this.$emit("close-form")
                        } else {
                            this.snack = true
                            this.snackText = 'Failed to apply.'
                            this.snackColor = 'error'
                            this.editAttendanceProgress = false;
                            this.$emit("close-form")
                        }
                    }
            }
        },
        async getData(id) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.userRequests = await this.$axios.$get("/requests/users/claims/" + id, {headers: { Authorization: AuthStr }});
            this.selectedService = _.orderBy(this.userRequests,['date_created'],['desc'])[0];
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
                .catch((e) => console.log(e));
        },
    },
    computed: {
        computeLevelApprover() {
            if (this.user.reporting.attendance_approvals.level_1 == '') {
                this.snack = true;
                this.snackText = "Please contact your HR Department as this request is not linked with an approver.";
                this.snackColor = "red";
                return true;
            }
        },
        start_date() {
            return moment(this.start_time_date).format('MMM DD')
        },
        formatEndDate(){
            return moment(this.end_date).format('MMM DD')
        },
    }
};
</script>
<style>
    .attendancetabs .v-tabs-slider-wrapper{
        display: none;
    }
    .attendancetabs .v-tab--active{
        color:#0064D7 !important ;
        background-color: #F0F8FF !important;
    }
</style>