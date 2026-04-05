<template>
    <div>
        <v-progress-linear indeterminate v-if="wfhReqAdding"></v-progress-linear>
        <v-row class="mx-auto" style="max-width:80%">
            <v-col cols="12" sm="12" md="12">
                <v-form ref="form">
                    <v-row class="pt-5 mx-0 mx-auto" style="max-width:80%" v-if="wfhRequest">
                        <v-col cols="6" class="pb-0 my-0">
                            <v-select class="customMdiMenuDown" dense :items="employees"
                                :item-text="(item) => `${item.first_name} ${item.last_name}`" item-value="_id"
                                hint="Employee" persistent-hint placeholder="Employee Preview"
                                v-model="request.user_id"></v-select>
                        </v-col>
                    </v-row>
                    <v-row class="rounded-xl ml-1 my-5" style="border: solid 1px #DBE0E5;max-width:50%">
                        <v-col cols="12" class="" style="">
                            <v-row class=" mx-0" style="max-width:100%" align="center">
                                <v-col cols="1" class="pa-0" align-self="center" style="max-width:40px">
                                    <v-img src="/hr/calendarLinear.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="5" class="pa-0 pl-1">
                                    <v-card-text class="pa-0 darkBlue-heading-text" style="color:#EA4A4F;"
                                       >No of Days</v-card-text>
                                </v-col>
                                <v-col cols="1" class="pa-0" style="color:#5C7EEF;max-width: 40px;">
                                    <v-card-text class="mb-0 pa-0 font-weight-medium fontSize18" style="color:#EA4A4F;">{{
                                        wfh_count.no_of_days }} </v-card-text>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-row class="pt-4">
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize" >From
                                Date</p>
                            <v-menu ref="menu1" v-model="from" class="testt" :close-on-content-click="true"
                                transition="scale-transition" min-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field dense class="pt-2 mt-0 pr-0 display-1 font-weight-light text-sm"
                                        @blur="date = parseDate(request.from_date)" v-model="computedDateFormatted_fromDate"
                                        readonly v-bind="attrs" v-on="on" persistent-hint :rules="genericRule">
                                    </v-text-field>
                                </template>
                                <v-date-picker class="testt2" v-model="request.from_date" no-title scrollable
                                    @input="changeToDate(), (from = false), halfDayCheck()">
                                    <v-spacer></v-spacer>
                                    <!-- <v-btn text color="primary" @click="menu1 = false"> Cancel</v-btn>
                        <v-btn text color="primary" @click="$refs.menu1.save(request.from_date)"> OK </v-btn> -->
                                </v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col class="" cols="12" sm="12" md="6">
                            <p class="grey-heading-text font-weight-medium textFontSize" >To Date
                            </p>
                            <v-menu ref="menu2" v-model="to" :close-on-content-click="true" transition="scale-transition"
                                min-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field dense class="pt-2 mt-0 pr-0 display-1 font-weight-light text-sm"
                                        v-model="computedDateFormatted_toDate" readonly v-bind="attrs" v-on="on"
                                        :rules="genericRule">
                                    </v-text-field>
                                </template>
                                <v-date-picker :min="request.from_date" v-model="request.to_date" no-title scrollable
                                    @input=" (to = false), halfDayCheck()">
                                    <!-- <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="menu2 = false"> Cancel</v-btn>
                        <v-btn text color="primary" @click="$refs.menu2.save(request.to_date)"> OK </v-btn> -->
                                </v-date-picker>
                            </v-menu>
                        </v-col>
                    </v-row>
                    <v-row class="pt-4">
                        <v-col class="" cols="6">
                            <p class="grey-heading-text font-weight-medium textFontSize" >
                                WFH Option
                            </p>
                            <v-select class="pt-0 mt-0 rounded-lg customMdiMenuDown" :items="halfDay"
                                :item-text="(item) => item.name" :item-value="(item) => item.value" @input="halfDayCheck()"
                                dense v-model="half_day"></v-select>
                        </v-col>
                    </v-row>
                    <v-row class="pt-4">
                        <v-col class="" cols="12" sm="12" md="12">
                            <p class="grey-heading-text font-weight-medium textFontSize"><span
                                    >Reason</span> <span class="red--text">*</span></p>
                            <v-col class="py-0 px-0" cols="12"><v-textarea dense rows="1" placeholder="Add Reason`"
                                    v-model="request.reason" class="redTextForm" :rules="genericRule"></v-textarea></v-col>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-right">
                            <!-- <v-btn v-if="no_conflict && wfh_count.no_of_days>0" dark color="primary" @click.prevent="addWFHRequest()" :disabled="wfhReqAdding && computeAddRequestButton" class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset" elevation="0">Submit</v-btn> -->
                            <v-progress-circular indeterminate color="primary" v-if="wfhAdding"></v-progress-circular>
                            <v-btn v-else-if="no_conflict && wfh_count.no_of_days > 0" dark color="primary"
                                @click.prevent="addWFHRequest()" :disabled="computeAddRequestButton || computeLevelApprover"
                                class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset"
                                elevation="0">Submit</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
                <!-- snackbar -->
                <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
                    {{ snackText }}

                    <template v-slot:action="{ attrs }">
                        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
                    </template>
                </v-snackbar>
            </v-col>
        </v-row>
    </div>
</template>

<script>

export default {
    layout: "dashboard",
    props: [
        "wfhRequest",
        "userType",
        "request",
        'user',
        'users',
        'selectedEmp',
        'configuration',
        'addWfh'
    ],
    data() {
        return {
            halfDay: [
                { name: "Half Day", value: true },
                { name: "Full Day", value: false },
            ],
            half_day: false,
            no_conflict: false,
            wfh_count: {
                no_of_days: 0,
            },
            delcared_holidays: [],
            newWfhProgress: false,
            menu1: '',
            menu2: '',
            genericRule: [(v) => !!v || "This field is Required"],

            dialog: false,
            wfhAdding: false,
            snack: false,
            snackColor: "",
            snackText: "",
            userRequests: [],
            wfhReqAdding: false,
            selectedService: {
                letter_fields: {}
            },
            from: false,
            to: false,
            user_leaves: [],
        };
    },
    mounted() {
        // this.getData(this.user._id)
        this.getHolidays()
        this.getNumberOfDays()
        this.funGetUserPreviosLeaves(this.selectedEmp);
    },
    created() {
        this.$nuxt.$on("user_changed", ($event) => {
            this.funGetUserPreviosLeaves($event);
            // this.getLeaveRemaining();
        });
    },
    beforeDestroy() {
        this.$nuxt.$off("user_changed");
    },
    methods: {
        halfDayCheck() {
            setTimeout(() => {
                const date1 = new Date(this.request.from_date);
                const date2 = new Date(this.request.to_date);
                const diffTime = Math.abs(date2 - date1);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (this.half_day == true && diffDays > 0) {
                    this.half_day = false
                }
                this.getNumberOfDays()
                this.hasExistingLeaveCheck()
            }, 100)
        },
        /* setting to date equal to from date whenever from date is changed before call getnumberofdays */
        changeToDate() {
            this.request.to_date = this.request.from_date
        },
        /* Getting number days based on the date selected and checking from package is there any WFH already applied */
        async getNumberOfDays() {
            this.no_conflict = false
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            let body = {
                user_id: this.selectedEmp._id,
                from_date: this.request.from_date,
                to_date: this.request.to_date,
                half_day: this.half_day,
                obj_wfh_type: {
                    wfh_type: "Working day"
                }
            };

            let wfh_days_count = await this.$axios.$post(
                "/wfh/get_number_of_days",
                body,
                { headers: { Authorization: AuthStr } }
            );

            if (wfh_days_count && wfh_days_count.success) {
                this.wfh_count.no_of_days = wfh_days_count.data.no_of_days;
                this.no_conflict = true
            } else {
                this.snack = true;
                this.snackText = wfh_days_count.message;
                this.snackColor = "red";
                this.wfh_count.no_of_days = 0;
            }
        },
        async funGetUserPreviosLeaves(selectedEmp) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.user_leaves = await this.$axios.$get("/leaves/user_leaves/" + this.selectedEmp._id, { headers: { Authorization: AuthStr } });
        },
        hasExistingLeaveCheck() {
            let flag = [];
            let existing_half_leave = this.user_leaves.filter(a => a.no_of_days == '0.5')
            if (this.user_leaves.length > 0) {
                for (let i = 0; i < this.user_leaves.length; i++) {
                    let currentleave = this.user_leaves[i];
                    if (
                        (new Date(currentleave.from_date) <=
                            new Date(this.request.from_date) &&
                            new Date(this.request.from_date) <=
                            new Date(currentleave.to_date)) ||
                        (new Date(currentleave.from_date) <= new Date(this.request.to_date) &&
                            new Date(this.request.to_date) <= new Date(currentleave.to_date)) ||
                        (new Date(this.request.from_date) <=
                            new Date(currentleave.from_date) &&
                            new Date(currentleave.from_date) <=
                            new Date(this.request.to_date)) ||
                        (new Date(this.request.from_date) <= new Date(currentleave.to_date) &&
                            new Date(currentleave.to_date) <= new Date(this.request.to_date))
                    ) {


                        /**
                         * Push true value to indicate that there is an existing leave.
                         * If all array values are false, then there is no exisiting leave.
                         * Else, if all array values has at least one true value, then there is exisiting leave.
                         * */
                        // console.log(currentleave,'currentleave')
                        // let leave_with_half_day = currentleave.a.no_of_days == '0.5'
                        if (existing_half_leave.length != 1 && this.half_day != true) {
                            flag.push(true);
                        }
                        // if(existing_leave.filter(a=>a.no_of_days))
                        // existing_leave.push(currentleave)
                        if (!this.half_day && currentleave.no_of_days == '0.5') flag.push(true)
                        if (this.request.no_of_days != '0.5' && currentleave.no_of_days != '0.5') flag.push(true)
                    }
                }
            }
            if (flag.length > 0 && flag.includes(true)) {
                this.snack = true;
                this.snackColor = "red";
                this.snackText = "There is already a leave application for this period. So, you cannot apply for WFH.";
            }
            const result = flag.length < 1 || !flag.includes(true) ? false : true;

            return result;
        },
        /* Adding WFH from new API with package usage
            {
                "request_type": "wfh",
                "from_date": "2022-09-02",
                "to_date": "2022-09-02",
                "no_of_days": 1,
                "user_id": "632d552a0e852a48808bb8d6",
                "userType": "SELF",
                "applied_manager": "632d552a0e852a48808bb8d6",
                "reason": "Test",
                "obj_wfh_type": {                    
                    "wfh_type": "Working day"                    
                }
            }
        */
        async addWFHRequest() {
            if (this.$refs.form.validate()) {
                this.wfhReqAdding = true
                this.wfhAdding = true
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                let body = {
                    request_type: 'wfh',
                    from_date: this.request.from_date,
                    to_date: this.request.to_date,
                    reason: this.request.reason,
                    no_of_days: this.wfh_count.no_of_days,
                    user_id: this.selectedEmp._id,
                    userType: this.userType,
                    applied_manager: this.user._id,
                    obj_wfh_type: {
                        wfh_type: "Working day"
                    }
                }

                this.$axios.$post('/wfh/apply_wfh', body, { headers: { Authorization: AuthStr } })
                    .then(res => {
                        this.snack = true
                        this.snackText = 'Your request is on its way!'
                        this.snackColor = 'green'
                        this.wfhReqAdding = false
                        this.wfhAdding = false
                        this.no_conflict = false
                        this.$nuxt.$emit("newWfhRequestCreated", this.request);
                        this.$nuxt.$emit("reloadAllPendingRequests", this.request)
                        // this.$router.go()
                    }).catch(err => console.log(err))
            }
        },

        getHolidays() {
            var getDays = function (startDate, endDate) {
                const duration = endDate - startDate;
                const interval = 1000 * 60 * 60 * 24 // calculation for a day
                const steps = duration / interval
                return Array.from({ length: steps + 1 }, (v, i) => new Date(startDate.valueOf() + (interval * i)));
            }

            let abc = this.configuration[0].holiday_calendar
            let arr = []
            for (let index = 0; index < abc.length; index++) {
                if (abc[index].from_date == abc[index].to_date) {
                    arr.push(abc[index].from_date)
                }
                else {
                    let a = getDays(new Date(abc[index].from_date), new Date(abc[index].to_date))
                    for (let i = 0; i < a.length; i++) {
                        arr.push(a[i].toISOString().substr(0, 10))
                    }
                }
            }
            this.delcared_holidays = arr
        },
        parseDate(date) {
            if (!date) return null;
            const [year, month, day] = date.split("-");
            return `${month}/${day}/${year}`;
        },
        formatDate(date) {
            if (!date) return null;

            const [year, month, day] = date.split("-");
            return `${day}/${month}`;
        },

    },
    computed: {
        computeAddRequestButton() {
            return this.hasExistingLeaveCheck();
        },
        computeLevelApprover() {
            if (this.user.reporting.wfh_approvals.level_1 == '') {
                this.snack = true;
                this.snackText = "Please contact your HR Department as this request is not linked with an approver.";
                this.snackColor = "red";
                return true;
            }
        },
        computedDateFormatted_toDate() {
            return this.formatDate(this.request.to_date.substr(0, 10));
        },
        computedDateFormatted_fromDate() {
            return this.formatDate(this.request.from_date.substr(0, 10));
        },
        getWFHDays() {
            let no_of_days = 0.0
            let weekend_counter = 0
            let delcared_counter = 0
            let dt1 = new Date(this.request.from_date)
            let dt2 = new Date(this.request.to_date)

            // Calculating number of days
            no_of_days = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24)) + 1;

            // Calculating Weekend Off
            var getDaysArray = function (s, e) { for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) { a.push(new Date(d)); } return a; };
            var daylist = getDaysArray(dt1, dt2);
            daylist.map((v) => v.toISOString().slice(0, 10)).join("")

            for (let index = 0; index < daylist.length; index++) {
                // select which day is off. 1-Monday, 2-Tuesday, 3- Wednesday etc. Here Fri and Saturday is considered off. hence 5 and 6
                if (daylist[index].getDay() == 0 || daylist[index].getDay() == 6) {
                    weekend_counter += 1
                }
            }
            // exclude holidays  --- need to add conditions for unpaid leaves etc
            var dateFormat = function (value) {
                let abc = new Date(value)
                return abc.getDate() + '/' + (abc.getMonth() + 1) + '/' + abc.getFullYear()
            };

            for (let i = 0; i < this.delcared_holidays.length; i++) {
                for (let j = 0; j < daylist.length; j++) {
                    if (dateFormat(this.delcared_holidays[i]) == dateFormat(daylist[j])) {
                        delcared_counter += 1
                    }
                }
            }

            this.request.no_of_days = parseFloat(no_of_days) - weekend_counter - delcared_counter

            return this.request.no_of_days
        },


    },
};
</script>
<style  lang="scss">
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