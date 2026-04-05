<template>
    <div>
        <v-sheet height="64">
            <v-toolbar flat>
                <!-- <v-btn text class="mr-4" color="grey darken-2" @click="setToday">Today</v-btn> -->
                <v-btn fab text color="#258BFF" @click="prev">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-toolbar-title class="darkBlue-heading-text" v-if="$refs.calendar" align-center>
                    &nbsp;{{ $refs.calendar.title }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn
                    @click="type = 'month'"
                    class="blue-grey--text"
                    outlined
                    dense
                    small
                    v-if="type == 'day'">
                    Month
                </v-btn>
                <div class="d-flex align-center justify-space-between">
                    <!-- <v-btn-toggle
                        v-if="teamCalendarPage"
                        v-model="selectedFilter"
                        color="blue accent 3"
                        borderless
                        :mandatory="true"
                        @change="reloadData()"
                    >
                        <v-btn value="Department">
                            <v-img src="/shift/users.svg" max-width="40" height="40" class="mr-2" contain></v-img>
                            <span class="caption">Department</span>
                        </v-btn>

                        <v-btn value="Subordinates">
                            <v-img src="/header/contact.svg" max-width="40" height="40" class="mr-2" contain></v-img>
                            <span class="caption">Subordinates</span>
                        </v-btn>
                    </v-btn-toggle> -->
                    <v-btn fab text color="#258BFF" @click="next">
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                </div>
            </v-toolbar>
        </v-sheet>
        <v-sheet class="rounded-lg mt-2" height="590" max-heigh="590">
            <v-calendar
                ref="calendar"
                v-model="focus"
                color="primary"
                :events="events"
                :event-color="getEventColor"
                :type="type"
                @click:event="showEvent"
                @click:more="viewDay"
                @click:date="viewDay"
                @change="updateRange"
                title-position="right">
            </v-calendar>
            <v-menu
                v-model="selectedOpen"
                :close-on-content-click="false"
                :activator="selectedElement"
                offset-x
                max-width="300px"
            >
            <v-card color="grey lighten-5" min-width="300px" max-width="300px" flat>
                <v-toolbar :color="selectedEvent.color" dark>
                <v-toolbar-title
                    v-html="selectedEvent.name">
                </v-toolbar-title>
                <span class="pt-1 flex-shrink-0">&nbsp; - {{ changeName(selectedEvent.status) }}</span>
                </v-toolbar>
                <v-row class="px-2 py-4">
                    <v-col cols="12" class="py-1">
                            <v-chip class="mb-1" color="#263238" label outlined >
                                <v-icon left small>mdi-label</v-icon>
                                {{selectedEvent.request_type == 'leave' ? 'Leave Request' : 'Work From Home Request'}}
                            </v-chip>
                    </v-col>
                    <v-col cols="3" class="py-1">
                        <p class="grey-heading-text font-weight-medium textFontSize">Type: </p>
                    </v-col>
                    <v-col cols="8" class="py-1">
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{selectedEvent.request_sub_type}}</span>
                    </v-col>
                    <v-col cols="3" class="py-1">
                        <p class="grey-heading-text font-weight-medium textFontSize">From:</p>
                    </v-col>
                    <v-col cols="8" class="py-1">
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{selectedEvent.start | ticketingDateFormatter}}</span>
                    </v-col>
                        <v-col cols="3" class="py-1">
                        <p class="grey-heading-text font-weight-medium textFontSize">To:</p>
                    </v-col>
                    <v-col cols="8" class="py-1">
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{selectedEvent.end | ticketingDateFormatter}}</span>
                    </v-col>
                </v-row>
            </v-card>
            </v-menu>
        </v-sheet>
    </div>  
</template>
  
<script>
export default {
    props:['wfhList', 'leaveList', 'currentYear','users', 'companyData', 'teamCalendarPage'],
    data () {
        return {
            type: "month",
            events: [],
            viewWfhInfo:false,
            focus: "",
            selectedElement: null,
            selectedOpen: false,
            selectedEvent: {},
            selectedFilter: 'Subordinates',
        }
    },
    watch: {
        wfhList: {
            handler:function(newVal) {
                this.updateRange();
            },
            deep:true
        },
        leaveList: {
            handler:function(newVal) {
                this.updateRange();
            },
            deep:true
        }
    },
    mounted(){
        this.updateRange()
    },
    methods: {
        reloadData(){
            this.$nuxt.$emit('reloadTeamCalendar', this.selectedFilter)
        },
        changeName(status) {
            if (status && status.toLowerCase() == "completed") return "Approved";
            if (status && status.toLowerCase() == "cancelled") return "Rejected";
            if (status && status.toLowerCase() == "processing") return "In Progress";
            if (status && status.toLowerCase() == "withdrawn") return "Withdrawn";
        },
        setToday() {
            this.focus = "";
        },
        viewDay({ date }) {
            this.focus = date;
            this.type = "day";
        },
        getEventColor(event) {
            return event.color;
        },
        showEvent({ nativeEvent, event }) {
            const open = () => {
                this.selectedEvent = event;
                this.selectedElement = nativeEvent.target;
                setTimeout(() => {
                this.selectedOpen = true;
                }, 10);
            };

            if (this.selectedOpen) {
                this.selectedOpen = false;
                setTimeout(open, 10);
            } else {
                open();
            }

            nativeEvent.stopPropagation();
        },
        updateRange() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            let events = [];
            setTimeout(() => {
                for (let i = 0; i < this.wfhList.length; i++) {
                    const first = this.wfhList[i].from_date.substr(0, 10);
                    const second = this.wfhList[i].to_date.substr(0, 10);
                    events.push({
                        name: this.getName(this.wfhList[i].user_id),
                        start: first,
                        end: second,
                        request_sub_type: this.wfhList[i].request_sub_type,
                        status: this.wfhList[i].status,
                        color: this.getCalendarColorWfh(this.wfhList[i].status),
                        request_type: 'wfh'
                    });
                }
                for (let i = 0; i < this.leaveList.length; i++) {
                    const first = this.leaveList[i].from_date.substr(0, 10);
                    const second = this.leaveList[i].to_date.substr(0, 10);
                    events.push({
                        name: this.getName(this.leaveList[i].user_id),
                        start: first,
                        end: second,
                        request_sub_type: this.leaveList[i].leave_type,
                        status: this.leaveList[i].status,
                        color: this.getCalendarColor(this.leaveList[i].status),
                        request_type: 'leave'
                    });
                }
            }, 1000);
            this.events = events;
        },
        getName(val) {
            let abc = this.users.filter((a) => a._id == val);
            return abc[0].first_name + " " + abc[0].last_name;
        },
        getCalendarColor(val) {
            if (val == "Submitted") return "teal--text";
            else if (val == "Processing" || val == "processing") return "amber";
            else if (val == "Completed" || val == "completed") return "green";
            else if (val == "Cancelled" || val == "cancelled") return "red";
            else if (val == "Withdrawn" || val == "withdrawn") return "grey";
            else return "white";
        },
        getCalendarColorWfh(val) {
            if (val == "Submitted") return "teal--text";
            else if (val == "Processing" || val == "processing") return "deep-orange";
            else if (val == "Completed" || val == "completed") return "blue";
            else if (val == "Cancelled" || val == "cancelled") return "red";
            else if (val == "Withdrawn" || val == "withdrawn") return "grey";
            else return "white";
        },
        prev() {
            this.$refs.calendar.prev();
        },
        next() {
            this.$refs.calendar.next();
        },
        getWfhPreview(data){
            this.viewWfhInfo = true
            this.selectedService = data;
        },
        getUserInfo() {
            // this.user = this.$store.getters.getUser
            this.emp = this.user
        },
    },
    computed: { 
    },
  }
</script>