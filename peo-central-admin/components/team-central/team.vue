<template>
    <div class="pt-3">

        <!-- <TeamIndividualInfo :currentYear='currentYear' :leaveList_team='leaveList_team' :user='user' :users='users' :selectedUser='selectedUser' v-if="selectedUser" @viewTeam="viewTeam($event)" /> -->
        <div v-if="ViewTeamCentral">

            <v-row class="pt-0 ml-0 " v-if="!attendance_button">
                <v-col cols="12" md="4" class="pa-0 pr-3">
                    <v-card class="borderRadiusCards letterRequests boxShadowCard pa-6" min-height="450px"
                        max-height="450px">
                        <v-row class="mx-0 teamSelect" style="max-width:100%">
                            <v-col cols="8">
                                <v-menu v-model="menu1" :close-on-content-click="false" transition="scale-transition"
                                    min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-if="date === currentYear" outlined dense readonly class="rounded-xl"
                                            v-model="formattedDateString" v-bind="attrs" v-on="on"
                                            prepend-inner-icon="mdi-chevron-left" append-icon="mdi-chevron-right"
                                            :disabled="isGetReportingWFHLoading || isGetReportingLeaveLoading"
                                            @click:prepend-inner="toggleCalendarDate(false)"
                                            @click:append="toggleCalendarDate()">
                                        </v-text-field>
                                        <v-text-field v-else outlined dense readonly class="rounded-xl" v-model="date"
                                            v-bind="attrs" v-on="on" prepend-inner-icon="mdi-chevron-left"
                                            append-icon="mdi-chevron-right"
                                            :disabled="isGetReportingWFHLoading || isGetReportingLeaveLoading"
                                            @click:prepend-inner="toggleCalendarDate(false)"
                                            @click:append="toggleCalendarDate()">
                                        </v-text-field>
                                    </template>
                                    <v-date-picker v-if="menu1 == true" v-model="date"
                                        @change="getTeamAttendance(), getTeamList(), getCounts()" no-title scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="menu1 = false">OK</v-btn>
                                    </v-date-picker>
                                </v-menu>
                                <!-- <v-select small  placeholder="All" outlined class="pa-0 ma-0 teamSelect rounded-xl customMdiMenuDown" style="max-width:180px !important"></v-select> -->
                            </v-col>
                            <v-col cols="4" :align-self="'center'">
                                <v-progress-circular v-show="isGetReportingWFHLoading || isGetReportingLeaveLoading"
                                    indeterminate color="primary" :size="26" :width="3" class="mb-2">
                                </v-progress-circular>
                            </v-col>
                        </v-row>
                        <v-row class="mx-0" style="max-width:100%">
                            <v-col cols="12" class="pt-0">
                                <p class="headingFontSize mb-0 fontWeight300 grey-heading-text">Overview, <span
                                        class="headingFontSize font-weight-medium darkBlue-heading-text">{{ date |
                                            ticketingDateFormatter }}</span></p>
                                <!-- <p class="fontSize2 mb-0 fontWeight500 darkBlue-heading-text" v-if="date == currentYear">Your team has <span class="fontSize2 font-weight-medium customRed" >24 deadlines </span>{{formattedDateString }}</p>
                            <p class="fontSize2 mb-0 fontWeight500 darkBlue-heading-text" v-else>Your team has <span class="fontSize2 font-weight-medium customRed" >24 deadlines </span>{{date |ticketingDateFormatter }}</p> -->
                            </v-col>
                        </v-row>
                        <v-row class="mx-0" style="max-width:100%">
                            <v-col cols="12" class="pt-0">
                                <div style="border:solid 1px #E59B96;background-color:#FFF6F5"
                                    class="borderRadiusInfo d-flex align-center justify-space-between pa-3">
                                    <p class=" mb-0 font-weight-medium fontSize2 darkBlue-heading-text">
                                        {{ totalPendingRequestCount }}
                                        {{ totalPendingRequestCount > 1
                                            ? 'Approval Requests are pending'
                                            : 'Approval Request is pending' }}
                                    </p>
                                    <v-icon color="#D82018" style="background-color:#E59B96;border-radius:7px"
                                        @click="openRequests()">mdi-chevron-right</v-icon>
                                </div>
                            </v-col>
                        </v-row>
                        <v-row class="mx-0" style="max-width:100%">
                            <v-col cols="12" md="6">
                                <v-row class="mx-0 flex-nowrap flex-shrink-0" style="max-width:100%">
                                    <v-col cols="12" sm="auto">
                                        <v-img src="/team/leave.svg" max-width="fit-content" height="fit-content"
                                            class="mr-2" contain></v-img>
                                    </v-col>
                                    <v-col cols="12" sm="auto" class="pl-0">
                                        <p class="mb-0">{{ this.todayLeaveteam }}</p>
                                        <p class="mb-0">On leave</p>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row class="mx-0 flex-nowrap flex-shrink-0" style="max-width:100%">
                                    <v-col cols="12" sm="auto">
                                        <v-img src="/team/wfh.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                            contain></v-img>
                                    </v-col>
                                    <v-col cols="12" sm="7" class="pl-0">
                                        <p class="mb-0">{{ this.todayWfhTeam }}</p>
                                        <p class="mb-0">WFH</p>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row class="mx-0 flex-nowrap flex-shrink-0" style="max-width:100%">
                                    <v-col cols="12" sm="auto">
                                        <v-img src="/team/leave.svg" max-width="fit-content" height="fit-content"
                                            class="mr-2" contain></v-img>
                                    </v-col>
                                    <v-col cols="12" sm="auto" class="pl-0">
                                        <p class="mb-0">{{ todayAbsent }}</p>
                                        <p class="mb-0">Absent</p>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row class="mx-0 flex-nowrap flex-shrink-0" style="max-width:100%">
                                    <v-col cols="12" sm="auto">
                                        <v-img src="/team/wfh.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                            contain></v-img>
                                    </v-col>
                                    <v-col cols="12" sm="7" class="pl-0">
                                        <p class="mb-0">{{ todayLate }}</p>
                                        <p class="mb-0">Late</p>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                        <!-- <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12" class="pt-0">
                            <div style="border:solid 1px #BFC8D1;" class="borderRadiusInfo align-center justify-space-between pa-3">
                                <p class=" mb-0 font-weight-medium fontSize2 grey-heading-text mb-3">Overall Progress</p>
                                <div class="d-flex align-center">
                                    <p class="mb-0 font-weight-medium darkBlue-heading-text flex-shirk-0 pr-3 mr-3" style="font-size:35px;border-right:solid 1px #BFC8D1">85%</p>
                                    <div>
                                        <span class="d-flex align-center">
                                            <v-img src="/team/epic.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                            <p class="mb-0 font-weight-medium darkBlue-heading-text fontSize15">Epic</p>   
                                        </span>
                                    </div> 
                                </div>
                            </div>
                        </v-col>
                    </v-row> -->

                    </v-card>
                </v-col>
                <v-col cols="12" md="4" class="pa-0 px-3">
                    <LeaveHistory :teamCentralUser='false' :teamCentral='teamCentral' :leaveBuddy='true'
                        :leaveList_team='leaveList_team' :users='users' :user='user' :selectedEmp="user"
                        :configuration="configData" @getLeavePreview="getLeavePreview($event)" />
                </v-col>
                <v-col cols="12" md="4" class="pa-0 pl-3">
                    <v-card class="borderRadiusCards letterRequests boxShadowCard" min-height="450px" max-height="450px">
                        <v-card-title class="">
                            <span class="darkBlue-heading-text subHeadingFontSize" v-if="userType == 'ADMIN'">Organization
                                ({{ filterTeamListByDept.length }})</span>
                            <span class="darkBlue-heading-text subHeadingFontSize" v-else>My Team
                                ({{ filterTeamListByDept.length }})</span>
                            <v-spacer></v-spacer>
                            <v-select :items='departmentsForFilter' v-model="deptFilter" item-text="name" placeholder="All"
                                class="pa-0 ma-0 leavesSelect customMdiMenuDown" style="max-width:175px !important"
                                v-if="userType == 'ADMIN'"></v-select>
                            <v-text-field v-else solo flat dense hide-details v-model="deptSearch"
                                prepend-inner-icon="mdi-magnify" class="rounded-xl" placeholder="Search by Name or Tags"
                                style="background: #FFFFFF 0% 0% no-repeat padding-box;box-shadow: 0px 24px 30px #959EA51A;border: 0.5px solid #EFF1F3;border-radius: 18px;opacity: 1;"></v-text-field>
                        </v-card-title>
                        <v-divider></v-divider>
                        <v-list two-line v-if="filterTeamListByDept" class="scroll" style="width:100%;max-height:380px">
                            <template v-for="(data, index) in filterTeamListByDept">
                                <v-list-item :key="index" class="leaveList" justify='center' @click="userSelectedFn(data)">
                                    <v-list-item-action class="my-0 py-1 px-2 pr-4 mr-0">
                                        <v-list-item-action-text class="caption ml-0">
                                            <v-avatar class="" size="45">
                                                <v-img aspect-ratio="1" :src="getImage(data._id)" alt="user"></v-img>
                                            </v-avatar>
                                        </v-list-item-action-text>
                                    </v-list-item-action>
                                    <v-list-item-content class="py-1 customLineHeight">
                                        <v-list-item-title
                                            class="pt-0 font-weight-medium textFontSize darkBlue-heading-text">{{
                                                getUserName(data._id) }}
                                        </v-list-item-title>
                                        <h5 class="grey-heading-text caption font-weight-normal pt-1">
                                            {{ data.personal.designation }}</h5>
                                    </v-list-item-content>
                                </v-list-item>
                                <v-divider class="my-2" :key="data._id"></v-divider>
                            </template>
                        </v-list>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="pt-0 ml-0 " v-if="!attendance_button">
                <v-col cols="12" md="12" class="pa-0">
                    <!-- <TaskStats :user='selectedUser' :users='users' :selectedUser='true' v-if="selectedUser" :userType='userType' />
                <TaskStats :user='user' :users='users' :userType='userType'  v-else /> -->
                </v-col>
            </v-row>
            <v-row class="mt-4 pt-0 ml-0 " v-if="!selectedUser && !attendance_button">

                <v-col cols="12" md="12" class="pa-0 pl-3">
                    <v-card class="mb-5 rounded-xl scroll" style="box-shadow: 0px 24px 30px #959EA51A;" min-height="380"
                        max-height="380">
                        <v-row class="mx-0">
                            <v-col cols="12">
                                <h3>Login Trends - Current Month</h3>
                            </v-col>
                            <!-- <v-col cols="12" sm="12" md="12" v-if="delay_10">
                            <chartjs-line :height=250 :bind="true" :datasets="datasets_cost_center" :labels="cost_center_labels" :option="options_cost_center" class="d-flex"/>
                        </v-col> -->
                            <v-col cols="12" sm="12" md="12" class="mt-2" :align-self="'center'" v-if="delay_10">
                                <apexchart type="area" height="280px" :options="options" :series="series"></apexchart>
                            </v-col>

                        </v-row>
                    </v-card>
                </v-col>
            </v-row>
            <v-row class="pt-0 ml-0 " v-model="attendance_button" v-if="attendance_button">
                <v-col cols="12" md="12" class="pa-0">
                    <!-- <TeamViewAttendance /> -->
                </v-col>
            </v-row>
        </div>



        <div v-else>
            <v-row>

                <v-col cols="12" md="4" lg="4" class="pa-0">
                    <EmployeesList class="" :selectedEmployee="selectedEmployee"
                        @employeeClicked="changeEmployee($event)" />
                </v-col>
                <!-- Customer-Details-Tabs -->
                <v-col cols="12" md="8" lg="8" class="pa-0">
                    <EmployeesTabs v-if="ShowDetails" :selectedEmployee="selectedEmployee" :tab_current="tab_current_val"
                        @EmployeeTabClicked="handleTabValue" @close="closeEmployeeTabs()" />
                </v-col>
            </v-row>

        </div>



        <!-- report download dialog -->
        <v-dialog v-model="download_attendance_dialog" max-width="600px">
            <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
                <v-row>
                    <v-col cols="12" class="pb-2">
                        <v-card-title class="py-0">
                            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">Download Report -
                                Attendance</span>
                        </v-card-title>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-progress-linear v-show="attendace_report" color="primary" indeterminate></v-progress-linear>
                <v-row justify="center" class="px-5 mt-7">
                    <v-col cols="12" class="pb-2 ">
                        <v-card-title class="py-0">
                            <!-- Department  -->
                            <v-col cols="12" v-if="userType == 'ADMIN'">
                                <v-row>
                                    <v-col cols="4">
                                        <div class="darkBlue-heading-text font-weight-normal subHeadingFontSize mr-5">
                                            Department</div>
                                    </v-col>
                                    <v-col cols="8">
                                        <v-autocomplete class="rounded-xl"
                                            @input="getAttendanceReport(), getReportingEmployees()" placeholder="All"
                                            multiple :items="sortDepartments" item-text="name" dense flat item-value="name"
                                            v-model="selectedDepts" outlined
                                            style="border-radius: 18px; border-color: #000"></v-autocomplete>
                                    </v-col>
                                </v-row>
                            </v-col>

                            <!-- Employee -->
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="4">
                                        <div class="darkBlue-heading-text font-weight-normal subHeadingFontSize mr-5">
                                            Employee</div>
                                    </v-col>
                                    <v-col cols="8">
                                        <v-autocomplete class="rounded-xl" @input="getAttendanceReport()" placeholder="All"
                                            dense flat multiple :items="sortEmployees"
                                            :item-text="item => `${item.first_name} ${item.last_name}`" item-value="_id"
                                            v-model="selectedEmployees" outlined
                                            style="border-radius: 18px; border-color: #000"></v-autocomplete>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <!-- Date range -->
                            <v-col cols="12">
                                <v-row>
                                    <v-col cols="4">
                                        <div class="darkBlue-heading-text font-weight-normal subHeadingFontSize mr-5">Date
                                            Range</div>
                                    </v-col>
                                    <v-col cols="8">
                                        <v-menu ref="menu_calendar_button" v-model="menu_calendar_button"
                                            :close-on-content-click="false" :return-value.sync="date_calendar"
                                            transition="scale-transition" min-width="auto">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-text-field attach solo flat dense readonly v-model="dateRangeText"
                                                    hide-details label="Date range" class="rounded-xl"
                                                    prepend-inner-icon="mdi-calendar-outline" v-bind="attrs" v-on="on"
                                                    style="background: #FFFFFF 0% 0% no-repeat padding-box;box-shadow: 0px 24px 30px #959EA51A;border: 0.5px solid rgb(164 164 164) !important;border-radius: 18px;opacity: 1;">
                                                </v-text-field>
                                            </template>
                                            <v-date-picker range v-model="date_calendar" no-title scrollable
                                                :min="date_calendar[0]">
                                                <v-btn text color="red" @click="resetCalendarFilterDate">Clear</v-btn>
                                                <v-spacer></v-spacer>
                                                <v-btn text color="grey"
                                                    @click="menu_calendar_button = false">Cancel</v-btn>
                                                <v-btn text color="primary"
                                                    @click="$refs.menu_calendar_button.save(date_calendar), getAttendanceReport()">OK</v-btn>
                                            </v-date-picker>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card-title>
                    </v-col>
                    <v-col cols="11" class="pb-2" style="text-align: end;" v-if="attendance_report_data.length > 0">
                        <download-excel
                            :name="'Attendance report (' + date_calendar[0] + ' - ' + (date_calendar[1] == undefined ? date_calendar[0] : date_calendar[1]) + ')'"
                            :data="attendance_report_data" :fields='json_fields_attendance'>
                            <v-btn outlined
                                @click="download_attendance_dialog = false, selectedEmployees = [], selectedDepts = [], resetCalendarFilterDate()"
                                elevation="0" :disabled="dateRangeText == ''"
                                class="border-radius-medium fontWeight300 fontSize7"
                                style="min-width:105px; color:#0059ff;height: 35px;text-align: center;text-transform: unset !important;">
                                Download Report
                            </v-btn>
                        </download-excel>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>

        <!-- Leave Details Dialog -->
        <v-dialog v-model="showReqDetailsDialog" max-width="720">
            <v-card tile>
                <v-card-title class="text-h5">
                    <div class="d-flex align-center justify-space-between" :style="{ 'width': '100%' }">
                        <span>Leave Information</span>
                        <v-btn icon color="primary" @click="showReqDetailsDialog = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </div>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pt-5">
                    <!-- <TeamRequestInfo
                        :data="selectedRequest"
                        :users="users"
                        :user="user"
                    /> -->
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import LeaveHistory from '~/components/reuseable/leaveHistory.vue'
import EmployeesList from '~/components/Employees/employeesList.vue'
import EmployeesTabs from '~/components/Employees/employeesTabs.vue'

// import TaskStats from '~/components/stats/tasks.vue'
// import TeamIndividualInfo from '~/components/stats/teamIndividualInfo.vue'
// import TodayTasks from '~/components/stats/todayTasks.vue'
// import FullCalendar from '@fullcalendar/vue'
// import {resourceTimelinePlugin }from '@fullcalendar/resource-timeline';
// import ProjectSummary from "~/components/reuseable/projectSummary.vue";
// import TeamRequestInfo from '~/components/reuseable/teamRequestInfo.vue';
// import TeamViewAttendance from '~/pages/attendance/indexm.vue';
import moment from 'moment'
import Observer from '~/components/Observer.vue'


export default {
    components: {
        LeaveHistory, Observer, EmployeesList, EmployeesTabs
        // FullCalendar
        // , TaskStats,  TodayTasks, , TeamIndividualInfo, ProjectSummary, TeamRequestInfo, , TeamViewAttendance 

    },
    props: ['users', 'user', 'currentYear', 'userType', 'configData'],
    data() {
        return {
            selectedEmployee: '',
            ShowDetails: false,
            tab_current_val: 'all',
            pageLimit: 50,
            ViewTeamCentral: true,
            tasksSkipCount: 0,
            projectsSkipCount: 0,
            tasksList_inprogress_today_count: 0,
            teamList: [],
            todayWfhTeam: 0,
            todayLeaveteam: 0,
            activeProjectList: {
                projectdata: [
                    {
                        task_id: [],
                        task_completed_count: [
                            {
                                "count": 0
                            }
                        ]
                    }
                ],
                projectCount: [
                    {
                        "count": 0
                    }
                ]
            },
            attendance_report_data: [],
            json_fields_attendance: {
                EMP_ID: "emp_id",
                FULL_NAME: "full_name",
                DESIGNATION: "designation",
                DEPARTMENT: "department",
                WORK_SCHEDULE: "shift",
                ON_DUTY: "duty_start_time",
                OFF_DUTY: "duty_end_time",
                DUTY_HOURS: "duty_hours",
                CLOCK_IN_DATE: "clock_in_date",
                CLOCK_IN_DAY: "clock_in_day",
                CLOCK_IN_LOCATION: "clock_in_location",
                CLOCK_IN: "clock_in_time",
                LATE: "late",
                CLOCK_OUT_DATE: "clock_out_date",
                CLOCK_OUT_DAY: "clock_out_day",
                CLOCK_OUT_LOCATION: "clock_out_location",
                CLOCK_OUT: "clock_out_time",
                EARLY: "early",
                ATT_TIME: "att_time",
                OT_TIME: "ot_time",
                ATTENDANCE: 'attendance',
                REMARKS: "remarks",
                REQUIRED: 'required',
                TOTAL_PRESENT: "total_present",
                TOTAL_WEEKEND: "total_weekend",
                TOTAL_ABSENT: "total_absent",
                TOTAL_SICK_LEAVE_DAYS: "total_sick_leave",
                TOTAL_ANNUAL_LEAVE_DAYS: "total_annual_leave",
                TOTAL_OTHER_LEAVE_DAYS: "total_other_leave",
                TOTAL_LEAVE_DAYS: "total_leave"
            },
            date_calendar: [],
            attTotal: 0,
            otTotal: 0,
            earlyTotal: 0,
            lateTotal: 0,
            todayAbsent: 0,
            todayLate: 0,
            menu_calendar_button: false,
            attendance_button: false,
            download_attendance_dialog: false,
            deptSearch: '',
            deptFilter: '',
            deptFilterWork: '',
            priority_details: [],
            progress_circular: [],
            // activeProjectList:0,
            project_priority_details: [],
            tasksList_inprogress: [],
            upComingTask: 0,
            upCommingProject: 0,
            selectedProject: {
                task_id: [],
                replies: []
            },
            showProjectSummaryDialog: false,
            selectedRequest: {},
            showReqDetailsDialog: false,
            crossedDeadlineTasks: 0,
            crossedDeadlineProjects: 0,
            projectList: [],
            completedTaskCouter: 0,
            options: {
                chart: {
                    id: 'avg-login',
                    width: '100%',
                    toolbar: {
                        show: false
                    }
                },
                // xaxis: {
                //     categories: ['', '8AM', '10AM', '12AM', '2PM', '4Pm', '6PM', '8PM']
                // },
                xaxis: {
                    categories: ['6AM', '', '8AM', '', '10AM', '', '12PM', '', '2PM', '', '4PM', '', '6PM', '', '8PM']
                },
                grid: {
                    show: true,      // you can either change hear to disable all grids
                    xaxis: {
                        lines: {
                            show: false  //or just here to disable only x axis grids
                        }
                    },
                    yaxis: {
                        lines: {
                            show: false  //or just here to disable only y axis
                        }
                    }
                },
                colors: ["#025252"],
                fill: {
                    type: "gradient",
                    gradient: {
                        shadeIntensity: 2,
                        gradientToColors: ["#289F9E", "#4DFFAD"],
                        opacityFrom: 0.7,
                        opacityTo: 0.9,
                        stops: [0, 50, 100]
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth'
                },
                yaxis: {
                    labels: {
                        show: false
                    }
                }
            },
            series: [{
                name: 'Employees',
                data: [0, 20, 25, 30, 49, 60, 50, 0]
            }],
            delay_10: false,
            // calendarOptions: {
            //     headerToolbar: false,
            //     scrollTime: "08:00",
            //     resourceAreaHeaderContent: "Employee Name",
            //     resourceAreaWidth: "38%",
            //     height: 250,
            //     resourceOrder: "-start",
            //     plugins: [resourceTimelinePlugin],
            //     initialView: 'resourceTimeline',
            //     schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
            //     resources:[],
            //     events: [],
            //     slotDuration: '02:00',
            //     slotMinTime: "08:00:00",
            //     lazyFetching:false,
            //     selectable: true,
            //     selectHelper: true,
            // },

            // calendarEvents: [
            //     // initial event data
            //     {"id":'Arnold',"start":"2022-03-09T08:00:00.000Z","end":"2022-03-09T20:00:00.000Z"}
            // ],
            tasksList_inprogress_today: [],
            projectList_inprogress: '',
            projectList: [],
            upCommingProject: 0,
            crossedDeadlineProjects: 0,
            teamCentral: true,
            leaveList_team: [],
            menu1: "",
            date: "",
            allTasks: [],
            tasksList: [],
            associatedTasks: [],
            team_attendance: [],
            month_attendance: [],
            totalTaskList: [],
            totalPendingRequestCount: 0,
            selectedUser: '',
            isGetReportingWFHLoading: false,
            isGetReportingLeaveLoading: false,
            isTeamAttendanceLoading: false,
            days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            selectedEmployees: [],
            selectedDepts: [],
            arr_reporting_employees: [],
            departments: [],
            attendace_report: false
        }
    },

    created() {
        this.$nuxt.$on('getUserTasksListUpdate', async ($event) => {
            this.tasksSkipCount = 0
            this.tasksList_inprogress_today = []
            this.getUserTasksTodayList()
        })
        this.$nuxt.$on('getUserProjectListUpdated', async ($event) => {
            this.projectsSkipCount = 0
            this.activeProjectList.projectdata = []
            this.getUserProjectList()
        })
        this.$nuxt.$on('tasksScrollerObserver', () => {
            if (this.tasksList_inprogress_today.length > 0) this.getUserTasksTodayList()
        })
        this.$nuxt.$on('showTeam', () => {
            this.attendance_button = false
        })
    },
    beforeDestroy() {
        this.tasksSkipCount = 0
        this.projectsSkipCount = 0
        this.$nuxt.$off('tasksScrollerObserver')
    },
    async mounted() {
        // await this.fetchAllTaskList()
        this.getCounts()
        this.getRequestCount()

        this.getTeamList()
        this.getTodayDate()
        // this.getTeamLeaveList() // remove it after intTotalAbsent being added in other function
        // this.getTeamAttendance()
        // this.getUserTasksTodayList()
        // this.getCompletedTasks()
        // this.getUserProjectList()
        setTimeout(() => {
            this.delay_10 = true
        }, 1000)
        this.departments = this.$store.getters.getConf[0].dept
        this.getReportingEmployees()
    },
    watch: {
        users(newUsers, oldUsers) {
            this.updateTeamAttendaceResources()
        }
    },
    methods: {
        changeEmployee($event) {
            this.ShowDetails = false
            this.selectedEmployee = $event
            setTimeout(() => {
                this.ShowDetails = true
            }, 1);
        },
        handleTabValue(event) {
            this.tab_current_val = event
        },
        closeEmployeeTabs() {
            this.ShowDetails = false
            this.ViewTeamCentral = true
        },
        formatTime(date) {
            const time = new Date(date)
            const hours = String(time.getUTCHours()).padStart(2, "0");
            const minutes = String(time.getUTCMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
        },
        // async fetchAllTaskList() {
        // 	const token = this.$store.getters.getToken;
        // 	const AuthStr = "Bearer ".concat(token);

        // 	// fetches tasks with ["InProgress", "Created"] regardless if current user is assigned or not
        // 	await this.$axios.$get('/tasks/all-tasks', { headers: { Authorization: AuthStr }})
        // 					.then(res => {
        // 						this.tasksList = res.tasks
        // 					})
        // 					.catch(err => console.log({ error: err.message }))
        // },
        async teamAttendance() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            this.calendarOptions.resources = []
            this.calendarOptions.events = []
            let filterTeamAttend = []
            let filterTeamAttendMonth = []
            this.deptFilterWork != "All" ? filterTeamAttend = this.team_attendance.filter((emp) => emp.reporting == this.deptFilterWork) : filterTeamAttend = this.team_attendance
            const localtz = moment(new Date()).format('ZZ');  // returns user's timezone
            let body = {
                "date": new Date(this.date),
                "id": this.user._id,
                "userType": this.userType,
                "fields": {
                    date: 1,
                    endTime: 1,
                    startTime: 1,
                    user_id: 1,
                    hour: { $hour: { date: '$convertedStartTime', timezone: localtz } },
                }
            };
            this.deptFilterWork != "All" ? filterTeamAttendMonth = await this.$axios.$post('/attendance/month/get-reporting-team-attendance/' + this.deptFilterWork, body, { headers: { Authorization: AuthStr } }) : filterTeamAttendMonth = this.month_attendance
            filterTeamAttend = _.orderBy(filterTeamAttend, ['user_name'], ['asc'])
            this.populateTeamAttendance(filterTeamAttend)
            this.populateLoginTrends(filterTeamAttendMonth)
        },
        projectListScrollerObserver() {
            if (this.activeProjectList.projectdata.length > 1) this.getUserProjectList()
        },
        getTeamList() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.teamList = this.$store.getters.getUsers.filter((user) => user.user_status == "active" || user.user_status == "Active" || user.user_status == "Hold" || user.user_status == "Onboarding")

            if (this.userType == "MANAGER") {
                this.teamList = this.$store.getters.getUsers.filter(((user) => user.reporting?.manager == this.user._id && user.user_status == "Active" || user.user_status == "active" || user.user_status == "Hold" || user.user_status == "Onboarding"))
            }
            this.getTeamLeaveList()
        },
        getReportName() {
            let deptName = this.departments.filter((ele) => ele._id == '')
            let employeeName = this.users.filter((ele) => { })
            if (this.selectedDepts.length > 0 && this.selectedEmployees.length > 0) {
                return 'Attendance report (' + this.date_calendar[0] + ' - ' + this.date_calendar[1] + ')'
            } else if (this.selectedDepts.length > 0) {
                return 'Attendance report (' + this.date_calendar[0] + ' - ' + this.date_calendar[1] + ')'
            } else if (this.selectedEmployees.length > 0) {
                return 'Attendance report (' + this.date_calendar[0] + ' - ' + this.date_calendar[1] + ')'
            } else {
                return 'Attendance report (' + this.date_calendar[0] + ' - ' + this.date_calendar[1] + ')'
            }
        },
        getReportingEmployees() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            let arr_reporting_employees = []

            if (this.selectedDepts && this.selectedDepts.length > 0) {

                if (this.userType == "ADMIN") {
                    for (let index = 0; index < this.selectedDepts.length; index++) {
                        const element = this.selectedDepts[index];
                        let employees = this.users.filter((ele) => ele.reporting.department == element)
                        arr_reporting_employees = arr_reporting_employees.concat(employees)

                        let employees_dept = []
                        for (let index = 0; index < this.selectedDepts.length; index++) {
                            const element = this.selectedDepts[index];
                            let employees = arr_reporting_employees.filter((ele) => ele.reporting.department == element)
                            employees_dept = employees_dept.concat(employees)
                        }

                        this.arr_reporting_employees = employees_dept
                    }
                } else {
                    for (let index = 0; index < this.users.length; index++) {
                        const element = this.users[index];
                        if (element.reporting?.manager == this.user._id) {
                            arr_reporting_employees.push(element)
                        }
                    }

                    let employees_dept = []
                    for (let index = 0; index < this.selectedDepts.length; index++) {
                        const element = this.selectedDepts[index];
                        let employees = arr_reporting_employees.filter((ele) => ele.reporting.department == element)
                        employees_dept = employees_dept.concat(employees)
                    }

                    this.arr_reporting_employees = employees_dept
                }

            } else {
                if (this.userType == "ADMIN") {
                    this.arr_reporting_employees = this.users
                } else {
                    for (let index = 0; index < this.users.length; index++) {
                        const element = this.users[index];
                        if (element.reporting?.manager == this.user._id) {
                            arr_reporting_employees.push(element)
                        }
                    }

                    this.arr_reporting_employees = arr_reporting_employees
                }
            }

        },
        async getAttendanceReport() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.attendace_report = true
            this.attendance_report_data = []
            let userType = "MANAGER"

            if (this.userType == "ADMIN") {
                userType = 'ADMIN'
            }

            let from_date = ""
            let to_date = ""

            if (this.date_calendar.length == 1) {
                from_date = this.date_calendar[0]
                to_date = this.date_calendar[0]
            } else if (this.date_calendar.length > 1) {
                from_date = this.date_calendar[0]
                to_date = this.date_calendar[1]
            }

            let body = {
                userType: userType,
                user_id: this.user._id,
                from_date: from_date,
                to_date: to_date,
                departments: this.selectedDepts,
                selectedEmployees: this.selectedEmployees
            }

            let attendnace_report = await this.$axios.$post('/attendance/attendance_report', body, {
                headers: {
                    Authorization: AuthStr
                }
            })

            /* Function: Return Username */
            function funGetUserName(obj_userInfo) {
                var name = "";
                if (obj_userInfo.first_name != undefined) {
                    name += obj_userInfo.first_name + ' ';
                }
                if (obj_userInfo.middle_name != undefined) {
                    name += obj_userInfo.middle_name + ' ';
                }
                if (obj_userInfo.last_name != undefined) {
                    name += obj_userInfo.last_name;
                }
                return name;
            }
            /* Function: Convert minute to hours */
            function getTimeFromMins(n) {
                let num = n;
                let hours = (num / 60);
                let rhours = Math.floor(hours);
                let minutes = (hours - rhours) * 60;
                let rminutes = Math.round(minutes);
                return rhours + ":" + rminutes;
            }

            function getTimeFromHour(n) {
                let num = n;
                let hours = num;
                let rhours = Math.floor(hours);
                let minutes = (hours - rhours) * 60;
                let rminutes = Math.round(minutes);
                return rhours + ":" + rminutes;
            }

            this.attendance_report_data = []

            if (attendnace_report && attendnace_report.success) {
                for (let index = 0; index < attendnace_report.data.length; index++) {
                    const user = attendnace_report.data[index];

                    let attendance_count = 0
                    this.earlyTotal = 0
                    this.lateTotal = 0
                    this.attTotal = 0
                    this.otTotal = 0

                    let attendace_data = user.array_attendance.length > 0 ? user.array_attendance[0].array_count : []
                    let leave_data = user.array_leaves.length > 0 ? user.array_leaves[0] : {}
                    let work_schedule_data = user.array_work_schedule.length > 0 ? user.array_work_schedule[0].company_work_schedules : {}
                    for (let i = 0; i < attendace_data.length; i++) {
                        const attendance = attendace_data[i];
                        let att_report = {
                            emp_id: "",
                            full_name: "",
                            department: "",
                            shift: "",
                            duty_start_time: "",
                            duty_end_time: "",
                            duty_hours: "",
                            clock_in_date: "",
                            clock_in_day: "",
                            clock_in_location: "",
                            clock_out_date: "",
                            clock_out_day: "",
                            clock_out_location: "",
                            clock_in_time: "",
                            clock_out_time: "",
                            late: "",
                            early: "",
                            att_time: "",
                            ot_time: "",
                            attendance: "",
                            remarks: "",
                            required: "",
                            total_present: "",
                            total_absent: "",
                            total_weekend: "",
                            total_sick_leave: "",
                            total_annual_leave: "",
                            total_other_leave: "",
                            total_leave: "",
                        }

                        /* Attendance calculation*/
                        if (attendance.totalHours > 7) {
                            attendance_count = '1'
                        } else if (attendance.totalHours >= 5 && attendance.totalHours <= 7) {
                            attendance_count = '0.5'
                        } else {
                            attendance_count = '0'
                        }


                        att_report.emp_id = user.emp_id || ""
                        att_report.full_name = funGetUserName(user) || ""
                        att_report.department = user.department || ""
                        att_report.designation = user.designation || ""
                        att_report.shift = user.work_schedule || ""
                        att_report.duty_start_time = work_schedule_data.normal_days.from || ""
                        att_report.duty_end_time = work_schedule_data.normal_days.to || ""
                        att_report.duty_hours = '09:00' || ""
                        att_report.clock_in_date = attendance.clockInDate != null ? moment(attendance.clockInDate).format('D MMM YYYY') : "" || ""
                        att_report.clock_in_location = attendance.in_address || ""
                        att_report.clock_out_location = attendance.out_address || ""
                        att_report.clock_in_day = this.days[parseInt(attendance.clockInDay)] || ""
                        att_report.clock_out_date = attendance.clockOutDate != null ? moment(attendance.clockOutDate).format('D MMM YYYY') : '' || ""
                        att_report.clock_out_day = this.days[parseInt(attendance.clockOutDay)] || ""
                        att_report.clock_in_time = attendance.startTime ? this.formatTime(attendance.startTime) : '' || ""
                        att_report.clock_out_time = attendance.endTime ? this.formatTime(attendance.endTime) : '' || ""
                        att_report.late = Math.sign(attendance.lateMinutes) == 1 ? getTimeFromMins(attendance.lateMinutes) : '0.00' || ""
                        att_report.early = Math.sign(attendance.earlyMinutes) == 1 ? getTimeFromMins(attendance.earlyMinutes) : '0.00' || ""
                        att_report.att_time = attendance.totalHours ? getTimeFromHour(attendance.totalHours.toFixed(2)) : '0.00' || ""
                        att_report.ot_time = Math.sign(attendance.overtime) == 1 ? getTimeFromHour(attendance.overtime.toFixed(2)) : '0.00' || ""
                        att_report.attendance = attendance_count || ""
                        att_report.remarks = attendance.remarks ? attendance.remarks : '' || ""
                        if (Math.sign(attendance.earlyMinutes) == 1) {
                            this.earlyTotal += parseFloat(attendance.earlyMinutes)
                        }

                        if (Math.sign(attendance.lateMinutes) == 1) {
                            this.lateTotal += parseFloat(attendance.lateMinutes)
                        }

                        if (Math.sign(attendance.totalHours) == 1) {
                            this.attTotal += parseFloat(attendance.totalHours)
                        }

                        if (Math.sign(attendance.overtime) == 1) {
                            this.otTotal += parseFloat(attendance.overtime)
                        }

                        this.attendance_report_data.push(att_report)
                    }

                    let att_report = {
                        emp_id: "",
                        full_name: funGetUserName(user) || "",
                        department: "",
                        shift: "",
                        duty_start_time: "",
                        duty_end_time: "",
                        duty_hours: "",
                        clock_in_date: "",
                        clock_in_day: "",
                        clock_in_location: "",
                        clock_out_date: "",
                        clock_out_day: "",
                        clock_out_location: "",
                        clock_in_time: "",
                        clock_out_time: "",
                        late: getTimeFromMins(this.lateTotal) || '0',
                        early: getTimeFromMins(this.earlyTotal) || '0',
                        att_time: getTimeFromHour(this.attTotal) || '0',
                        ot_time: getTimeFromHour(this.otTotal) || '0',
                        attendance: '',
                        remarks: "",
                        required: user.array_attendance.length > 0 ? user.array_attendance[0].intTotalDays + '' : '0' || "0",
                        total_present: user.array_attendance.length > 0 ? user.array_attendance[0].intTotalPresent + '' : '0' || "0",
                        total_absent: user.array_attendance.length > 0 ? user.array_attendance[0].intTotalAbsent + '' : '0' || "0",
                        total_weekend: user.array_attendance.length > 0 ? user.array_attendance[0].intTotalWeekend + '' : '0' || "0",
                        total_sick_leave: leave_data.intMedicalLeaves ? leave_data.intMedicalLeaves + '' : '0' || "0",
                        total_annual_leave: leave_data.intAnnualLeaves ? leave_data.intAnnualLeaves + '' : '0' || "0",
                        total_other_leave: leave_data.intOtherLeaves ? leave_data.intOtherLeaves + '' : '0' || "0",
                        total_leave: leave_data.totalLeaves ? leave_data.totalLeaves + '' : '0' || "0",
                    }

                    this.attendance_report_data.push(att_report)

                    if (attendnace_report.data.length == index + 1) {
                        this.attendace_report = false
                        return this.attendance_report_data
                    }

                }
            } else {
                // this.$toast.error(attendnace_report.message)
            }
        },
        resetCalendarFilterDate() {
            setTimeout(() => {
                this.date_calendar = []
                this.$refs.menu_calendar_button.save(this.date_calendar)
            }, 300);
        },
        openRequests() {
            this.$router.push("/admin_central");
        },
        userSelectedFn(data) {
            this.selectedUser = data
            this.selectedEmployee = data._id
            // this.$emit("userSelectedFn");
            localStorage.setItem('employeeInfoUserId', this.selectedUser._id)

            this.ViewTeamCentral = false
            this.ShowDetails = true
            // this.$nuxt.$emit("employeeSelectedFn",this.selectedUser);
            // this.$router.push('/dashboards/employee-info')
            // this.getUserTasksTodayList()
            // this.getUserProjectList()
        },


        viewTeam() {
            this.$emit("userSelectedFn");
            this.selectedUser = ''
            this.getUserTasksTodayList()
            this.getUserProjectList()
        },
        async getRequestCount() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            let body = {
                "userType": this.userType,
                "user_id": this.user._id
            }
            let count = await this.$axios.$post('requests/get_all_processing_requests_count', body, { headers: { Authorization: AuthStr } })
            this.totalPendingRequestCount = count.data.totalCount;
        },
        // getTaskProgess(id){
        //     let count = 0
        //     let arr_task = []
        //     for(let i=0;i<id.length;i++){
        //         arr_task =  this.totalTaskList.filter(a=>a._id == id[i])
        //         if(arr_task.status == 'Completed'){
        //             count += 1
        //         }
        //     }
        //     return count
        // },
        route() {
            if (this.userType == "ADMIN") {
                this.$router.push('/attendance')
            }
            else {
                // this.$router.push('/attendance/indexm')
                this.attendance_button = true
            }
        },
        deleteEvent() {
            let calendarApi = this.$refs.fullCalendar.getApi()
            var eventSourcess = calendarApi.getEvents();
            //  var len = eventSourcess.length;
            //     for (var i = 0; i < len; i++) { 
            //         eventSourcess[i].remove(); 
            //     } 
        },
        async getUserProjectList() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            let body = {
                userType: this.userType,
                user_id: this.user._id,
                projectStatus: ["Completed", "completed", "Inactive", "inactive"],
                skipCount: this.projectsSkipCount,
                pageLimit: this.pageLimit
            }
            if (this.selectedUser) {
                this.projectList = await this.$axios.$get("projects/users/" + this.selectedUser._id, { headers: { Authorization: AuthStr } })
            } else {
                let projectstats = await this.$axios.$post("projects/users_projects", body, { headers: { Authorization: AuthStr } })
                if (projectstats.data.projectdata && projectstats.data.projectdata.length > 0) {
                    // adding the count for skipCount with the pageLimit count
                    this.projectsSkipCount += this.pageLimit
                    // if the project already contain the data then we are concating the new data to the array else directly adding the value in project data
                    this.activeProjectList.projectdata.length > 1 ? this.activeProjectList.projectdata = this.activeProjectList.projectdata.concat(projectstats.data.projectdata) : this.activeProjectList = projectstats.data
                }
            }
        },
        async showProjectDetails(project) {
            await this.$axios.$get("/projects/" + project._id)
                .then((res) => {
                    this.selectedProject = res[0];
                })
                .catch((error) => console.log(error))
            this.showProjectSummaryDialog = true;
            const taskId = this.selectedProject.task_id && this.selectedProject.task_id.length > 0 ? this.selectedProject.task_id : '';
            await this.getAssociatedTaskInfo(taskId);
        },
        async getAssociatedTaskInfo(taskId) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            // loop through the tasks as there can be multiple tasks associated with a project
            // first check if the task ID is present in the taskList
            // If not the fetch it from DB
            // check if user is part of the task

            this.associatedTasks = []
            if (taskId && taskId.length > 0) {
                for (let index = 0; index < taskId.length; index++) {
                    const associatedTask = this.tasksList.find(task => task._id === taskId[index]);
                    if (associatedTask) {
                        this.associatedTasks.push(associatedTask)
                    } else {
                        this.$axios.$get("/tasks/" + taskId[index], { headers: { Authorization: AuthStr } })
                            .then(res => {
                                if (res != '') {
                                    const resTask = res[0];
                                    if (resTask.assigned_to.includes(this.user._id)) {
                                        this.associatedTasks.push(resTask);
                                    }
                                }
                            }).catch()
                    }
                }
            }
        },
        async getUserTasksTodayList() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            let body = {
                "userType": this.userType,
                "user_id": this.user._id,
                "taskStatus": ["Created", "InProgress"],
                "date": this.currentYear,
                "pageLimit": this.pageLimit,
                "skipCount": this.tasksSkipCount,
            }
            let abc = []

            if (this.selectedUser) {
                abc = await this.$axios.$get("tasks/today/" + this.selectedUser._id, { headers: { Authorization: AuthStr } })

            }
            else {
                let tasksDeatils = await this.$axios.$post("tasks/users_tasks", body, { headers: { Authorization: AuthStr } })
                // checking the data
                if (tasksDeatils.data) {
                    // adding the count for skipCount with the pageLimit count
                    this.tasksSkipCount += this.pageLimit
                    // if the tasks already contain the data then we are concating the new data to the tasks else directly adding the value in tasks data
                    this.tasksList_inprogress_today.length > 0 ? this.tasksList_inprogress_today = this.tasksList_inprogress_today.concat(tasksDeatils.data.tasks[0].tasksdetail) : this.tasksList_inprogress_today = tasksDeatils.data.tasks[0].tasksdetail
                    this.tasksList_inprogress_today_count = tasksDeatils.data.tasks[0].tasksdetailCount
                }

            }
        },
        getCompletedTasks(id) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            let abc = this.$axios.$get("/tasks/all", { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.totalTaskList = res
                    this.tasksList = res.filter(a => a.status != 'Completed')
                }).catch()

        },
        async getTeamAttendance() {
            this.menu1 = false;
            this.isTeamAttendanceLoading = true
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            const localtz = moment(new Date()).format('ZZ');  // returns user's timezone
            let body = {
                "date": new Date(this.date),
                "id": this.user._id,
                "userType": this.userType,
                "fields": {
                    date: 1,
                    endTime: 1,
                    startTime: 1,
                    user_id: 1,
                    hour: { $hour: { date: '$convertedStartTime', timezone: localtz } },
                }
            };
            this.calendarOptions.events = [];
            let calendarApi = this.$refs.fullCalendar.getApi();
            // calendarApi.refetchEvents()
            let new_date = new Date(this.date)
            // calendarApi.currentData.currentDate = new_date
            calendarApi.gotoDate(new_date)
            this.team_attendance = await this.$axios.$post('/attendance/get-reporting-team-attendance', body, { headers: { Authorization: AuthStr } });
            this.month_attendance = await this.$axios.$post('/attendance/month/get-reporting-team-attendance', body, { headers: { Authorization: AuthStr } });
            const ownAttendance = await this.$axios.$post('/attendance/get-user-attendance', { "date": this.date, "user": this.user }, { headers: { Authorization: AuthStr } });
            /** Make sure to include your own attendance
             * If your own attendance does not in the team_attendance variable, push your own attendance.
             */
            // if(this.userType != "ADMIN" && this.team_attendance.length>0 && !this.team_attendance.includes(ownAttendance[0]._id)) this.team_attendance.push(ownAttendance[0]);

            this.team_attendance = _.orderBy(this.team_attendance, ['user_name'], ['asc'])
            this.populateTeamAttendance(this.team_attendance)
            this.populateLoginTrends(this.month_attendance)
        },
        populateLoginTrends(data) {
            // console.log(data,"--------data")
            const groupByHour = data.reduce((r, a) => {
                r[a.hour] = [...r[a.hour] || [], a];
                return r;
            }, {});
            // categories: ['6AM', '8AM', '10AM', '12AM', '2PM', '4Pm', '6PM', '8PM'] // categories value declared above.
            let categories = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] // categories converted to integer and 24 hr format
            let xaxis = []
            for (var key in categories) {
                if (groupByHour.hasOwnProperty(categories[key])) xaxis.push(groupByHour[categories[key]].length)
                else xaxis.push(0)
            }
            this.series = [{
                name: 'Employees',
                data: xaxis
            }]
        },
        populateTeamAttendance(teamAttendanceData) {
            // console.log(this.calendarOptions.resources,"---this.calendarOptions.resources,")
            let endTime = new Date().toISOString();
            // for (let i = 0; i < teamAttendanceData.length; i++) {
            //     let timeDiff = 0;
            //     if (teamAttendanceData[i].endTime != null) {
            //     timeDiff = new Date(teamAttendanceData[i].endTime).getTime() - new Date(teamAttendanceData[i].startTime).getTime();
            //     }else{
            //          timeDiff = new Date(endTime).getTime() - new Date(teamAttendanceData[i].startTime).getTime();
            //     }


            //     this.calendarOptions.resources = [
            //         ...this.calendarOptions.resources,
            //         {
            //             id: teamAttendanceData[i].user_id,
            //             title:teamAttendanceData[i].user_name,
            //             start: teamAttendanceData[i].startTime /** Add start property for resource for sorting purposes. */
            //         }
            //     ]
            //     this.calendarOptions.events.push({
            //         "resourceId": teamAttendanceData[i].user_id,
            //         title: this.secondsToHms(timeDiff),
            //         "start": teamAttendanceData[i].startTime,
            //         "end": endTime 
            //     })

            //     this.calendarOptions.eventMouseEnter = function(event, element) {}
            // }

            for (let i = 0; i < teamAttendanceData.length; i++) {

                let todayAtt = new Date(teamAttendanceData[i].startTime).toISOString().substring(0, 10);

                let timeDiff = 0;

                if (teamAttendanceData[i].endTime == null && todayAtt == endTime.substring(0, 10)) {

                    timeDiff = new Date(endTime).getTime() - new Date(teamAttendanceData[i].startTime).getTime();

                } else if (teamAttendanceData[i].endTime != null) {

                    timeDiff = new Date(teamAttendanceData[i].endTime).getTime() - new Date(teamAttendanceData[i].startTime).getTime();

                } else {

                    timeDiff = new Date(teamAttendanceData[i].startTime).getTime() - new Date(teamAttendanceData[i].startTime).getTime();

                }




                this.calendarOptions.resources = [

                    ...this.calendarOptions.resources,

                    {

                        id: teamAttendanceData[i].user_id,

                        title: teamAttendanceData[i].user_name,

                        // start: teamAttendanceData[i].startTime /** Add start property for resource for sorting purposes. */

                    }

                ]

                this.calendarOptions.events.push({

                    "resourceId": teamAttendanceData[i].user_id,

                    title: this.secondsToHms(timeDiff),

                    "start": teamAttendanceData[i].startTime,

                    "end": teamAttendanceData[i].endTime == null ? todayAtt == endTime.substring(0, 10) ? endTime : teamAttendanceData[i].startTime : teamAttendanceData[i].endTime

                })



                this.calendarOptions.eventMouseEnter = function (event, element) { }

            }
            if (teamAttendanceData.length == 0) {
                this.calendarOptions.events = []
                this.calendarOptions.resources = []
                this.isTeamAttendanceLoading = false
            }
            this.isTeamAttendanceLoading = false
        },
        updateTeamAttendaceResources() {
            this.isTeamAttendanceLoading = false
            /** Updates resources on calendar if users prop has changes */
            this.calendarOptions.resources.forEach((resource) => {
                resource.title = this.getUserName(resource.id);
            })

            // this.populateTeamUsersDontLoginTodayToTimelineCalendar();
        },
        populateTeamUsersDontLoginTodayToTimelineCalendar() {
            // console.log(" --------populateTeamUsersDontLoginTodayToTimelineCalendar")
            /** Populate users who don't have time attendance from team users prop.
             * Condition: if calendar resources id (which is the user id) is not in the team users prop, then display user to calendar.
             */
            const teamUserNotLoggedIn = this.teamList.filter((user) => !this.calendarOptions.resources.map((resource) => resource.id).includes(user._id));
            teamUserNotLoggedIn.forEach((user) => {
                this.calendarOptions.resources = [...this.calendarOptions.resources, { id: user._id, title: this.getUserName(user._id), start: 0 }] /** add start property to 0 since this user does not login today. This is for sorting purposes. */
                this.calendarOptions.events.push({ "resourceId": user._id, title: "", "start": "", "end": "" })
            })
            this.isTeamAttendanceLoading = false
        },
        getLeavePreview(leaveData) {
            // console.log(leaveData,"------------leavedata")
            this.selectedRequest = leaveData;
            this.showReqDetailsDialog = true;
        },
        secondsToHms(duration) {
            var milliseconds = Math.floor((duration % 1000) / 100),
                seconds = Math.floor((duration / 1000) % 60),
                minutes = Math.floor((duration / (1000 * 60)) % 60),
                hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? hours : hours;
            minutes = (minutes < 10) ? minutes : minutes;
            seconds = (seconds < 10) ? seconds : seconds;

            return hours + "h " + minutes + "m"
        },

        getUserName(val) {
            let abc = this.users.filter(a => a._id == val)
            if (abc.length > 0) {
                return abc[0].full_name ? abc[0].full_name : abc[0].first_name
            } else return ""
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
        getCounts() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.date == "" ? this.date = new Date() : this.date
            let countBody = {
                "userType": this.userType,
                "user_id": this.user._id,
                "date": this.date

            }
            this.$axios.$post("/requests/get_all_requests_count_bydate", countBody, { headers: { Authorization: AuthStr } })
                .then(counts => {
                    this.todayWfhTeam = counts.data.wfhCount
                    this.todayLeaveteam = counts.data.leaveCount
                    this.isGetReportingWFHLoading = false
                    this.isGetReportingLeaveLoading = false
                }).catch()
            let body = {
                date: this.date,
                userType: this.userType,
                user_id: this.user._id,
            }
            // this.$axios.$post("/attendance/attendance_count",body, { headers: { Authorization: AuthStr } })
            // .then(res => {
            //     if(res[0].array_attendance.length > 0){
            //         this.todayAbsent = res[0].array_attendance[0].intTotalAbsent
            //         this.todayLate = res[0].array_attendance[0].intTotalLate
            //     }
            //     else{
            //         this.todayAbsent = 0
            //         this.todayLate = 0
            //     }
            // }).catch(err => console.log(err))
        },
        getTeamLeaveList() {
            this.menu1 = false;

            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.isGetReportingWFHLoading = true;
            this.isGetReportingLeaveLoading = true;

            const teamListIds = this.teamList.map(team => team._id);
            teamListIds.push(this.user._id); /** Includes Reporter User */

            let body = {
                "status": ["Completed"],
                "date": this.currentYear,
                "userListIds": teamListIds,
                "userType": this.userType,
                "user_id": this.user._id
            }

            this.$axios.$post("/leaves/users_leaves", body).then((res) => {
                this.leaveList_team = res
            })

            // let teamLeavesList = this.$axios.$get("/leaves/users_active_leave/all", {
            //     headers: { Authorization: AuthStr },
            // }).then( (res) => {
            //     // console.log(res,"-----------------leaveli;st team res")
            //     /** Get all teams ids to filter leaves under the Reporting User */
            //     const teamListIds = this.teamList.map(team => team._id);
            //     teamListIds.push(this.user._id); /** Includes Reporter User */
            //     console.log(teamListIds,"---------------teamListIds")
            //     this.leaveList_team = res.filter(leave => (leave.status == 'Completed') && (leave.from_date.substr(0, 10) > this.currentYear) && teamListIds.includes(leave.user_id));
            //     // console.log(this.leaveList_team,"------------------leaveList_team")
            // }).catch();

            // 17s API response time replace with the new one
            // this.$axios.$post("/wfh/get-reporting-wfh", { id: this.user._id, date: this.date,"userType":this.userType }, { headers: { Authorization: AuthStr } })
            // .then(wfhUsers => {
            //     this.todayWfhTeam = [];
            //     const wfhUsersCompleted = wfhUsers.filter((wfh) => wfh.status === "Completed");
            //     wfhUsersCompleted.forEach((user) => this.todayWfhTeam.push(user.user_id));
            //     this.isGetReportingWFHLoading = false;
            // }).catch()

            // this.$axios.$post("/leaves/get-reporting-leave", { id: this.user._id, date: this.date,"userType":this.userType, }, { headers: { Authorization: AuthStr } })
            // .then(leaveTeamUsers => {
            //     this.todayLeaveteam = [];
            //     const teamLeavesCompleted = leaveTeamUsers.filter((user) => user.status === "Completed")
            //     teamLeavesCompleted.forEach((user) => this.todayLeaveteam.push(user.user_id));
            //     this.isGetReportingLeaveLoading = false;
            // }).catch()          

        },
        toggleCalendarDate(increment = true) {
            const date = new Date(this.date);
            const incrementedOrDecrementedDate = increment ? date.setDate(date.getDate() + 1) : date.setDate(date.getDate() - 1);
            this.date = moment(incrementedOrDecrementedDate).format("YYYY-MM-DD");
            this.getTeamAttendance();
            this.getTeamList();
            this.getCounts();
        },
        getTodayDate() {
            this.date = this.currentYear
        },
    },
    computed: {
        sortDepartments() {
            return this.departments.slice().sort((a, b) => a.name.localeCompare(b.name))
        },
        sortEmployees() {
            return this.arr_reporting_employees.slice().sort((a, b) => a.first_name.localeCompare(b.first_name))
        },
        dateRangeText() {
            var formatDate = function (date) {
                return moment(String(date)).format('DD MMM YYYY')
            }
            if (this.date_calendar.length == 1) {
                return `${formatDate(this.date_calendar[0])} - ${formatDate(this.date_calendar[0])}`
            }
            else if (this.date_calendar.length > 1) {
                let abc = _.orderBy(this.date_calendar)
                return `${formatDate(abc[0])} - ${formatDate(abc[1])}`
            }
            else {
                return ''
            }
        },
        departmentsForFilter() {
            let allFilter = [{ name: 'All' }]
            return this.configData && this.configData[0] && allFilter.concat(_.sortBy(this.configData[0].dept, 'name'))
        },
        formattedDateString() {
            if (this.date == this.currentYear) return 'Today'
            else return moment(new Date(this.date)).format("MMM DD, YYYY");
        },
        filterTeamListByDept() {
            let users = this.teamList
            // console.log(this.teamList)
            if (this.deptSearch != '') {
                var s = this.deptSearch;
                let returnData = _.filter(users, function (value) {

                    return (
                        value.first_name.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
                        value.last_name.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
                        value.personal?.designation?.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
                        value.reporting.department.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
                        value.reporting.team.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
                        value.email.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
                        value.emp_id.toLowerCase().indexOf(s.toLowerCase()) > -1
                    )
                })
                console.log(returnData, "returns Data")
                return returnData
            }
            else {
                if (this.deptFilter == '' || this.deptFilter == 'All') {
                    users = this.teamList
                } else {
                    users = this.teamList.filter(a => a.reporting.department == this.deptFilter)
                }
            }
            return _.orderBy(users, 'first_name', 'asc')
        },
    },
}
</script>
<!-- <style>
.leavesSelect .v-select__selections{
    font-size: 13px !important;
}
.leavesSelect .v-input__slot{
    margin-bottom: 0px !important;
}
.leavesSelect .v-input__slot::before{
    border-color: #fff !important;
}
.leavesSelect .v-text-field__details,.teamSelect .v-text-field__details{
    display: none !important;
}
.teamSelect .v-text-field__slot {
    border-right: solid 1px !important;
    border-left: solid 1px !important;
}
.teamSelect .v-text-field__slot > input {
    text-align: center !important;
}
.fc .fc-timeline-slot-minor {
    border-left: none;
}
.fc .fc-scrollgrid-liquid {
    border-left: none;
}
.fc-scroller .fc-scroller-liquid-absolute .fc-datagrid-cell .fc-resource{
    border-bottom: none !important;
}
.fc-theme-standard td, .fc-theme-standard th {
    border-right: none !important;
}
.fc .fc-timeline-slot-cushion {
   color: #8798AD !important;
   font-weight: 400;
   font-size: 14px;
}
.fc-datagrid-cell-main{
    color: #0A2C4F !important;
   font-weight: 400;
   font-size: 16px;
}
.fc-scrollgrid-section-body .fc-scrollgrid-sync-inner .fc-datagrid-cell-main{
    font-weight: 500 !important;
}

.timeLine .fc-theme-standard td {
    border-bottom: none !important;
    border-top: none !important;
}
.fc-timeline-event.fc-event-end .fc-h-event.fc-event{
    background:linear-gradient(45deg, black, transparent) !important;
    border-color: none !important;
    background-color:black !important;
    /* background: linear-gradient(to right, #F76509, #EEBE64) !important;
    border: none !important;
    border-radius: 19px !important;
    margin-top: 3px !important;
    margin-right:50px; */
} 
.fc-direction-ltr .fc-timeline-event.fc-event-end, .fc-direction-ltr .fc-timeline-more-link ,.fc-timeline-event{
    background: linear-gradient(to right, #F76509, #EEBE64) !important;
    border: none !important;
    border-radius: 20px !important;
    margin-top: 3px !important;
    margin-right:52px;
}

.fc-timeline-event .fc-event-time, .fc-timeline-event .fc-event-title {
    padding: 0 10px;

    background: linear-gradient(to right, #F76509, #EEBE64) !important;
    border: none !important;
    border-radius: 16px !important;
    margin-top: 3px !important;
    margin-right:50px;
}
.apexcharts-svg{
    max-width: 100% !important;
}
.apexcharts-canvas{
    max-width: 100% !important;
}
.timeLine .fc-media-screen { 
    max-height: 390px !important;
}
</style> -->









<style>
.leavesSelect .v-select__selections {
    font-size: 13px !important;
}

.leavesSelect .v-input__slot {
    margin-bottom: 0px !important;
}

.leavesSelect .v-input__slot::before {
    border-color: #fff !important;
}

.leavesSelect .v-text-field__details,
.teamSelect .v-text-field__details {
    display: none !important;
}

.teamSelect .v-text-field__slot {
    border-right: solid 1px !important;
    border-left: solid 1px !important;
}

.teamSelect .v-text-field__slot>input {
    text-align: center !important;
}

.fc .fc-timeline-slot-minor {
    border-left: none;
}

.fc .fc-scrollgrid-liquid {
    border-left: none;
}

.fc-scroller .fc-scroller-liquid-absolute .fc-datagrid-cell .fc-resource {
    border-bottom: none !important;
}

.fc-theme-standard td,
.fc-theme-standard th {
    border-right: none !important;
}

.fc .fc-timeline-slot-cushion {
    color: #8798AD !important;
    font-weight: 400;
    font-size: 14px;
}

.fc-datagrid-cell-main {
    color: #0A2C4F !important;
    font-weight: 400;
    font-size: 16px;
}

.fc-scrollgrid-section-body .fc-scrollgrid-sync-inner .fc-datagrid-cell-main {
    font-weight: 500 !important;
}

.timeLine .fc-theme-standard td {
    border-bottom: none !important;
    border-top: none !important;
}

.fc-timeline-event .fc-h-event .fc-event {
    background: linear-gradient(45deg, black, transparent) !important;
    border-color: none !important;
    background-color: none !important;
}

.fc-direction-ltr .fc-timeline-event.fc-event-end,
.fc-direction-ltr .fc-timeline-more-link,
.fc-timeline-event {
    background: linear-gradient(to right, #F76509, #EEBE64);
    border: none !important;
    border-radius: 16px !important;
    margin-top: 3px !important;
}

.fc-timeline-event .fc-event-time,
.fc-timeline-event .fc-event-title {
    padding: 0 10px;
}

.apexcharts-svg {
    max-width: 100% !important;
}

.apexcharts-canvas {
    max-width: 100% !important;
}

.timeLine2 .fc-media-screen {
    max-height: 390px !important;
}
</style>