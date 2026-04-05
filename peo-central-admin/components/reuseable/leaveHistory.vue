<template>
    <v-card
        class="px-0 leaveHistory"
        style="box-shadow: 0px  24px 30px #959EA51A;overflow:hidden"
        :class="leaveBuddy == true ? 'borderRadiusCards' : 'borderRadiusCards'"
        :min-height="leaveSelfService == true ? '720' : teamCentral == true ? '450' : teamCentralUser == true ? '270' : '505'"
        :max-height="leaveBuddy == true && teamCentral != true ? '566' : leaveBuddy == true && teamCentral == true ? '450' : teamCentralUser == true ? '270' :'720'"
    >
        <v-card-title class=" px-6" v-if="leaveBuddy != true && teamCentralUser != true">
            <v-img src="/profile/leave_balance.svg" max-width="fit-content" height="fit-content" class="mr-2" contain ></v-img>
            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize" >Leave History</span>
            <v-spacer></v-spacer>
            <v-menu ref="menu_calendar_button" v-model="menu_calendar_button" :close-on-content-click="false" :return-value.sync="date_calendar" transition="scale-transition" min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        attach solo flat dense readonly
                        v-model="dateRangeText"
                        hide-details
                        label="Date range"
                        class="rounded-xl text-field__small"
                        prepend-inner-icon="mdi-calendar-outline"
                        v-bind="attrs"
                        v-on="on"
                        style="background: #FFFFFF 0% 0% no-repeat padding-box;box-shadow: 0px 24px 30px #959EA51A;border: 0.5px solid #000;border-radius: 18px;opacity: 1;max-width:150px">
                    </v-text-field>
                </template>
                <v-date-picker range v-model="date_calendar" no-title scrollable>
                    <v-btn text color="red" @click="resetCalendarFilterDate">Clear</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn text color="grey" @click="menu_calendar_button = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.menu_calendar_button.save(date_calendar)">OK</v-btn>
                </v-date-picker>
            </v-menu>
            <v-select
                attach outlined dense
                :items="computeLeaveTypes"
                v-model="selectedFilter"
                item-text="All"
                item-value="All"
                append-icon="mdi-chevron-down"
                class="pl-1 rounded-xl mb-0 select-field__small"
                style="min-width: 26%;max-width: 26%; font-size: 14px;">
            </v-select>
            <v-img src="/directory/add_plus.svg" v-if="leaveSelfService == true"  @click="addLeaveMenu()" max-width="35" height="auto" class="ml-2 cursor-pointer" contain></v-img> 
        </v-card-title>
        <v-card-title class="leavesSelectTeam px-4" v-if="teamCentral == true ">
            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize" >Upcoming Leave </span>
            <v-spacer></v-spacer>
            <v-select class="rounded-xl customMdiMenuDown" :items="computeLeaveTypes" dense v-model="selectedFilter" item-text="All" item-value="All" style="width: 1%;"></v-select>
        </v-card-title>
        <v-card-title class=" px-6" v-if="teamCentralUser == true ">
            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize" >Upcoming Leave</span>
            <v-spacer></v-spacer>
            <v-btn color="#5C7EEF" class="rounded-xl" small outlined>View History</v-btn>
        </v-card-title>
        <v-divider class=""></v-divider>
        <v-row justify="center" class="mt-3 mx-0 scroll" style="width:100%;" :style="leaveSelfService == true ? 'max-height:620px' : teamCentralUser == true ? 'max-height: 190px': 'max-height:375px'">
           <div  v-if="visibleData != '' && leaveBuddy != true " >
                <v-list two-line class="mt-n3" style="width:100%">
                    <template v-for="(data, index) in visibleData" >
                        <v-list-item :key="index" class="leaveList" justify='center' :style="getStatusBorderColor(data.status)" @click="getLeavePreview(data)">
                            <v-list-item-action class="my-auto mr-0">
                                <v-list-item-action-text class="caption ml-0">
                                    <v-list-item-action-text class="caption mt-0 d-flex">
                                        <v-img :src="getLeaveImage(data.leave_type)" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                    </v-list-item-action-text>
                                </v-list-item-action-text>                      
                            </v-list-item-action>
                            <v-list-item-content class="py-0 customLineHeight">
                                <v-list-item-title  v-if="teamCentralUser == true" class="pt-0 font-weight-normal darkBlue-heading-text" :style="{ 'font-size': '14px' }">{{data.leave_type}}&nbsp;
                                </v-list-item-title>
                                <v-list-item-title v-else class="pt-0 font-weight-normal body-1 darkBlue-heading-text">{{data.leave_type}}&nbsp;
                                    <v-chip x-small :color="getColor(data.status)" class="rounded-lg" style="height:20px;font-size: 11px;"  :style="getTextColor(data.status)">{{updateStatus(data.status)}}</v-chip>
                                </v-list-item-title>
                                <h5 class="grey-heading-text caption font-weight-normal pt-1" v-if="teamCentralUser == true" >{{data.from_date | TeamLeaveDateFormatter}} - {{data.to_date | TeamLeaveDateFormatter}}</h5>
                                <h5 class="grey-heading-text caption font-weight-normal pt-1" v-else>{{data.from_date | leaveRequestDateFormatter}} - {{data.to_date | leaveRequestDateFormatter}}</h5>
                            </v-list-item-content>
                            <v-list-item-action class="my-auto ">
                                <v-list-item-action-text class="caption mt-2 ml-4">
                                    <v-list-item-action-text class="caption mt-0 d-flex">
                                        <v-img src="/hr/calendar-linear.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                        <div style="min-width:45px" class="darkBlue-heading-text">
                                            <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size:18px !important">{{numberFormat(data.no_of_days)}}</v-card-text> 
                                            <v-card-text class="mb-0 pa-0 textFontSize customLineHeight" v-if="data.no_of_days <= 1">day</v-card-text> 
                                            <v-card-text class="mb-0 pa-0 textFontSize customLineHeight" v-else>days</v-card-text> 
                                        </div>
                                    </v-list-item-action-text>
                                </v-list-item-action-text>                      
                            </v-list-item-action>
                        </v-list-item>
                        <v-divider class="my-2" :key="data._id"></v-divider>
                    </template>
                </v-list>
                <Observer  @intersect="leavesListScrollerObserver( )"/>
           </div>
            
            <div v-else-if="visibleData == ''" :style="hrSelfService == true ? 'max-width:100%;min-height:170px;':teamCentralUser == true?'max-width:100%;min-height:170px':teamCentral == true ?'max-width:100%;min-height:180px':'max-width:100%;min-height:100%;'">
                <v-row class="mx-0" :style="hrSelfService == true ? 'max-width:100%;min-height:170px;':teamCentralUser == true?'max-width:100%;min-height:170px;':teamCentral == true?'max-width:100%;min-height:170px;':'max-width:100%;min-height:620px'" A>
                    <v-col cols="12" justify="center" align="center" class="ma-auto">
                        <v-img src="/hr/empty.svg" max-width="fit-content" height="fit-content" class="" contain></v-img>
                        <!-- <p class="font-weight-normal largeHeadingFontSize mt-3">No Request </p>
                        <p class="mb-0 grey-heading-text textFontSize mt-5">You did not apply any Letter request yet!</p> -->
                    </v-col>
                </v-row>
            </div>
            <v-list two-line  v-if="visibleData != '' && leaveBuddy == true " class="mt-n3" style="width:100%">
                <template v-for="(data, index) in visibleData" >
                    <v-list-item :key="index" class="leaveList" justify='center' :style="teamCentral != true ? getStatusBorderColor(data.status) : ''" >
                        <v-list-item-action class=" " :class="teamCentral == true ? 'my-0 py-1 pr-2 mr-0':'my-auto'">
                            <v-list-item-action-text class="caption " :class="teamCentral == true ? 'ml-0':'ml-4'">
                                <v-list-item-action-text class="caption mt-0 d-flex">
                                    <v-avatar class=""  size="45" >
                                        <v-img aspect-ratio="1" :src="getImage(data.user_id)" alt="user" ></v-img>
                                    </v-avatar>
                                </v-list-item-action-text>
                            </v-list-item-action-text>                      
                        </v-list-item-action>
                        <v-list-item-content class="py-1 customLineHeight">
                            <v-list-item-title class="pt-0 font-weight-medium textFontSize darkBlue-heading-text">{{getUserName(data.user_id)}}
                                &nbsp;<v-chip  v-if="teamCentral != true" x-small :color="getColor(data.status)" class="rounded-lg" style="height:20px;font-size: 11px;"  :style="getTextColor(data.status)">{{data.status}}</v-chip>
                            </v-list-item-title>
                            <h5 class="grey-heading-text caption font-weight-normal pt-1" v-if="teamCentral == true" >{{data.from_date | TeamLeaveDateFormatter}} - {{data.to_date | TeamLeaveDateFormatter}}</h5>
                            <h5 class="grey-heading-text caption font-weight-normal pt-1" v-else >{{data.from_date | leaveRequestDateFormatter}} - {{data.to_date | leaveRequestDateFormatter}}</h5>
                        </v-list-item-content>
                        <v-list-item-action class="my-auto ">
                            <v-list-item-action-text class="caption mt-2 ml-4">
                                <v-list-item-action-text class="caption mt-0 d-flex">
                                    <v-img src="/hr/calendar-linear.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                    <div :style="teamCentral != true ?' min-width:45px':'min-width:19px' " class="darkBlue-heading-text">
                                        <v-card-text class="mb-0 pa-0 font-weight-medium" style="font-size:18px !important">{{numberFormat(data.no_of_days)}}</v-card-text> 
                                        <v-card-text class="mb-0 pa-0 textFontSize customLineHeight" v-if="data.no_of_days == 1">day</v-card-text> 
                                        <v-card-text class="mb-0 pa-0 textFontSize customLineHeight" v-else>days</v-card-text> 
                                    </div>
                                </v-list-item-action-text>
                                <v-list-item-action-text class="caption mt-1 d-flex">
                                    <v-chip x-small :color="getLeaveColor(data.leave_type)" class="rounded-lg white--text" style="height:20px;font-size: 11px;"  >{{data.leave_type.slice(0,-6)}}</v-chip>
                                </v-list-item-action-text>
                            </v-list-item-action-text>                      
                        </v-list-item-action>
                    </v-list-item>
                    <v-divider class="my-2" :key="data._id"></v-divider>
                </template>
            </v-list>
            
        </v-row>
    </v-card>
</template>

<script>
import moment from 'moment'
import Observer from '~/components/Observer.vue'
import { Leave } from "@nathangroup/leave";


export default {
    components: { Observer },
    props:['leaveSelfService','leaveBuddy','users','leaveList_team','configuration','selectedEmp','teamCentral','teamCentralUser','selectedUser','hrSelfService','user'],
    data () {
        return {
            pageLimit:50,
            skipCount:0,
            date_calendar: [],
            filter_start_date: new Date(),
            filter_end_date: new Date(),
            menu_calendar_button : false,
            addLeave:false,
            selectedFilter:'All',
            leave_type:["All", "Annual Leaves", "Emergency Leaves", "Half Day Leave", "Maternity Leaves", "Medical Leaves", "Parental Leaves", "Unpaid Leaves"],
            leavedates:[],
            leaveList:[]
        }
    },
    async asyncData({app, store}){
        const token =  store.getters.getToken
        const AuthStr = 'Bearer '.concat(token);
        let usersData = await store.getters.getUsers
        return {
            users: usersData,
        }
    },
    created() {
        this.$nuxt.$on('leaveList', (data) => {
            this.leaveList = []
            this.skipCount = 0,
            this.pageLimit = 50,
            this.getUserLeaveList()
        })
    },
    mounted(){
        this.getUserInfo()
        this.getUserLeaveList()
    },
    methods:{
        updateStatus(val){
            if(val == 'Cancelled'){
                return 'Rejected'
            }
            else{
                return val
            }
        },
        leavesListScrollerObserver(){
            // console.log("------------leave history obser")
            if(this.leaveList.length > 0) this.getUserLeaveList()
        },
        resetCalendarFilterDate(){
            this.date_calendar = []
            this.$refs.menu_calendar_button.save(this.date_calendar)
        },
        getLeavePreview(data){
            this.$emit("getLeavePreview", data);
        },
        addLeaveMenu(data){
            this.$emit("addLeaveMenu", data);
        },
        getUserName(val){
            let abc = this.users.filter(a => a._id == val)
            if(abc.length > 0){
                return abc[0].first_name + " " + abc[0].last_name
            }
            else{
                return ''
            }
        },
        getLeaveColor(val){
            if(val == "Annual Leave" || val == "Annual Leaves") return '#5C7EEF'
            if(val == "Medical Leave" || val == "Medical Leaves") return '#6869AC'
            if(val == "Emergency Leave" || val == "Emergency Leaves") return '#7B658B'
            if(val == "Parental Leave" || val == "Parental Leaves") return '#978E9A'
            if(val == "Maternity Leave" || val == "Maternity Leaves") return '#958E9A'
        },
        getImage(val){
            let image = 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
            if(this.users.length > 0){
                let abc = this.users.filter(a => a._id == val)
                if(abc.length > 0){
                    if(abc[0].hasOwnProperty('image_url')){
                        if(abc[0].image_url != '') image = abc[0].image_url
                    }
                }
            }
            return image
        },
        getStatusBorderColor(val){
            if (val == 'Processing'||val == 'processing') return 'border-left: #F2B626 solid 3px;'
            else if (val == 'Completed') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Cancelled') return 'border-left: #FD5959 solid 3px;'
            else if (val == 'completed') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Approved') return 'border-left: #00E67A solid 3px;'
            else return 'border-left: grey solid 3px;'
        },
        getUserInfo() {
            // this.user = this.$store.getters.getUser
        },
        getUserLeaveList(){
            const token =  this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
                // let abc = this.$axios.$get("/leaves/users/"+ this.user._id, {headers: { Authorization: AuthStr }})
                
                let body = {
                    skipCount: this.skipCount,
                    pageLimit: this.pageLimit,
                }
                let abc = this.$axios.$post("/leaves/hrself/users/"+ this.user._id, body,{headers: { Authorization: AuthStr }})
                .then(res =>{

                    if(res && res.length > 0){
                        (this.leaveList.length > 0 ) ? this.leaveList = this.leaveList.concat(res) : this.leaveList = res
                    }
                    this.skipCount += this.pageLimit
                }).catch(err => console.log(err))
        },
        getColor (val) {
            if (val == 'Submitted') return 'teal'
            else if (val == 'Processing' || val == 'processing') return '#FCF3D8'
            else if (val == 'Completed'|| val == 'completed' || val == 'Approved' ||val == 'Approved by Admin') return '#CAF8E9'
            else if (val == 'Cancelled'|| val == 'cancelled' || val == 'Rejected') return '#FFEBEC'
            else return '#DCE1E6'
        }, 
        getTextColor(val){
            if (val == 'Submitted') return 'teal'
            else if (val == 'Processing' || val == 'processing') return 'color:#EAAE00'
            else if (val == 'Completed'|| val == 'completed' || val == 'Approved' ||val == 'Approved by Admin') return 'color:#0DC98A'
            else if (val == 'Cancelled'|| val == 'cancelled' || val == 'Rejected') return 'color:#E5252A'
            else return 'color:#516A81'

        },
        changeName(status){
            if(status =='completed') return 'Approved'
            if(status =='Completed') return 'Approved'
            if(status =='Cancelled') return 'Rejected'
            if(status =='Processing') return 'In Progress'
            if(status =='Withdrawn') return 'Withdrawn'
        },
        getStatusColorTooltip(val){
            if (val == 'completed') return '#00E67A'
            else if (val == 'Processing') return '#F2B626'
            else if (val == 'Cancelled') return '#FD5959'
            else return 'grey'
        },
        numberFormat(n){
            return parseInt(n) > 9 ? parseInt(n) : parseInt(n) < 1 ? n : ("0" + parseInt(n));
        },
        getLeaveImage(val){
            if (val == 'Annual Leave' || val == 'Annual Leaves') return '/hr/annual.svg'
            else if (val == 'Medical Leaves') return '/hr/medical.svg'
            else return '/hr/other_leave.svg'
        },
        
    },
    computed:{
        computeLeaveTypes() {
            if(this.teamCentral == true){
                 let getLeave = _.cloneDeep(this.configuration[0].leaveTypes)
                  getLeave.push({'leave_name':'All'})
                  return _.sortBy(getLeave,'leave_name').map(a => a.leave_name);
            }
            else{
                if (this.configuration.length > 0) {
                    let array_leaves_conditons = this.configuration[0].leaveTypes;
                    let obj_user_data = {
                    date_of_joining: this.selectedEmp.date_of_joining,
                    employment: this.selectedEmp.employment,
                    reporting: this.selectedEmp.reporting,
                    personal: this.selectedEmp.personal,
                    };


                    const LeaveObj = new Leave();

                    let getLeave = LeaveObj.computingLeaveTypes(
                    obj_user_data,
                    array_leaves_conditons,
                    []
                    );
                    getLeave.push({'leave_name':'All'})
                    return _.sortBy(getLeave,'leave_name').map(a => a.leave_name);
                }
            }
        },
        dateRangeText () {
            var formatDate = function(date) {
                return moment(String(date)).format('DD MMM YYYY')
            }
            if(this.date_calendar.length == 1){
                return `${formatDate(this.date_calendar[0])} - ${formatDate(this.date_calendar[0])}`
            }
            else  if(this.date_calendar.length > 1){
                let abc = _.orderBy(this.date_calendar)
                return `${formatDate(abc[0])} - ${formatDate(abc[1])}`
            }
            else{
                return ''
            }
        },
        visibleData () {
            let abc = _.orderBy(this.filterValue,['date_created'],['desc'])
            if(this.date_calendar.length > 0){
                if(this.date_calendar.length == 1){
                    let to_date = new Date(this.date_calendar[0]).toISOString()
                    abc = abc.filter(a => a.to_date == to_date)
                    // return `${formatDate(this.date_calendar[0])} - ${formatDate(this.date_calendar[0])}`
                }
                else  if(this.date_calendar.length > 1){
                    let date1 = new Date(this.date_calendar[0])
                    let date2 = new Date(this.date_calendar[1])

                    if(date1.getTime()<date2.getTime())
                    {
                        this.filter_start_date = date1
                        this.filter_end_date = date2
                    }
                    else{
                        this.filter_start_date = date2
                        this.filter_end_date = date1
                    }
                    abc = abc.filter(value=>{
                        var from_date = new Date(value.from_date)
                        var to_date = new Date(value.to_date)
                    // console.log(from_date.getTime(),to_date.getTime(),"herer")

                        return from_date.getTime() >= this.filter_start_date.getTime() && from_date.getTime() <= this.filter_end_date.getTime()
                    })
                    // return `${formatDate(abc[0])} - ${formatDate(abc[1])}`
                }
            }
            return abc
        },  
        filterValue() {
            if (this.leaveBuddy != true && this.teamCentralUser != true) {
                if (this.selectedFilter == "All") {
                    return this.leaveList;
                }
                else if (this.selectedFilter == "Half Day Leave") {
                    return this.leaveList.filter(leave => leave.no_of_days < 1);
                }
                else{
                    let leaves
                    leaves = this.leaveList.filter(value=>{
                        return value.leave_type == this.selectedFilter
                    })
                    return leaves
                }
            } else if (this.teamCentral == true && this.teamCentralUser != true) {    
                if (this.selectedFilter == "All") {
                    return this.leaveList_team
                } 
                else if (this.selectedFilter == "Half Day Leave") {
                    return this.leaveList_team.filter(leave => leave.no_of_days < 1);
                }
                else {
                    const selectedFilteredLeaves = this.leaveList_team.filter(value => (value.leave_type === this.selectedFilter));
                    return selectedFilteredLeaves;
                }
            } else if(this.teamCentralUser == true) {
                if (this.selectedFilter == "All") {
                    return this.leaveList_team.filter(a=>a.user_id == this.selectedUser._id)
                }
                else if (this.selectedFilter == "Half Day Leave") {
                    return this.leaveList_team.filter(leave => leave.no_of_days < 1);
                }
                else{
                    let leaves
                    leaves = this.leaveList_team.filter(value=>{
                        return (value.leave_type == this.selectedFilter && value.user_id == this.selectedUser._id)
                    })
                    return   leaves
                }
            } else {
                return this.leaveList_team
            }
        },
    }
}
</script>

<style>
.v-input--dense > .v-input__control > .v-input__slot {
    margin-bottom: 0;
}
.text-field__small .v-input__icon {
    width: 18px;
    height: 18px;
    min-width: 18px;
}
.text-field__small .v-label,
.text-field__small .v-text-field__slot > input {
    font-size: 14px !important;
}
.leaveHistory .v-text-field__details{
    display: none;
}
.leaveList .priority-tooltip {
    position: absolute;
    margin-left: -4%;
    height: 62px;
    width: 28px;
}
.leavesSelectTeam .v-select__selections{
    font-size: 13px !important;
}
.leavesSelectTeam .v-input__slot{
    margin-bottom: 0px !important;
}
.leavesSelectTeam .v-input__slot::before{
    border-color: #fff !important;
}
.leavesSelectTeam .v-text-field__details,.teamSelect .v-text-field__details{
    display: none !important;
}
.leavesSelectTeam .v-text-field__slot{
    border-right: solid 1px !important;
}
</style>