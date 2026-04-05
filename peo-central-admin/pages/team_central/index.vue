<template fluid>
    <div class="pt-0">
        <v-expand-transition>
            <v-row v-show="!expandedShift" class="pt-0 mr-5 pl-lg-5 pl-1" height="auto"
                style="overflow:hidden;height: 100px;" v-if="userSelected == false">
                <span v-if="firstLoad == true" class="d-flex">
                    <v-skeleton-loader v-for="(data, index) in cards" :key="index" class="spotlightSwiperSkeleton mb-5 ml-5"
                        :loading="loading" type="button">
                    </v-skeleton-loader>
                </span>
                <swiper :options="swiperOptions" v-else class="mx-0 pl-3 swiperOverflow"
                    style="overflow:unset;max-width:1200px">
                    <div v-for="(data, index) in computedCards" :key="index" class="swiper-slide swiperCustom"
                        style="min-width:180px;max-width:180px;max-height:110px; margin-top: 10px;">
                        <v-card min-height="80" min-width="170" max-width="170" class="mr-5 borderRadiusTabs"
                            :style="selectedCard == data.id ? 'background:transparent linear-gradient(295deg, #6488EE 0%, #0918F7 100%) 0% 0% no-repeat padding-box;' : ''"
                            style="box-shadow: rgb(149 158 164 / 10%) 5px 12px 20px;;overflow: hidden;"
                            @click="selectCard(data.href, data.id)" :href="data.id">
                            <!-- <v-card min-height="80" min-width="170" max-width="170" class="mr-5 borderRadiusTabs" :style="selectedCard == data.id ?'background:transparent linear-gradient(295deg, #6488EE 0%, #0918F7 100%) 0% 0% no-repeat padding-box;':'' " style="box-shadow: rgb(149 158 164 / 10%) 5px 12px 20px;;overflow: hidden;" @click="selectCard(data.href,data.id)"> -->
                            <v-row style="height:100%" width="100%" align="center" justify="center" class="">
                                <v-col cols="2" class=" pr-0 text-right">
                                    <img :src="selectedCard == data.id ? data.icon2 : data.icon" alt="" class=" mt-2">
                                </v-col>
                                <v-col cols="7" :class="selectedCard == data.id ? 'white--text' : ''" class="my-auto "
                                    v-if="data.name != 'date'">{{ data.name }}</v-col>
                                <v-col cols="7" :class="selectedCard == data.id ? 'white--text' : ''" class="my-auto "
                                    v-else style="line-height: 1;font-weight:800">
                                    {{ date | day }}
                                    <p class="mb-0" style="font-weight:300">{{ date | month }}</p>
                                </v-col>
                            </v-row>
                        </v-card>
                    </div>
                </swiper>
            </v-row>
        </v-expand-transition>


        <v-row class="pt-0 pl-lg-5 pl-1" style="width:100%">
            <v-col class="pt-0">
                <Team v-if="selectedCard == '#teamCentral'" :userType='"MANAGER"' :configData='configData'
                    :companyData='companyData' :users='users' :user='user' :teamList='teamList' :currentYear='currentYear'
                    @openRequests="openRequests($event)" @userSelectedFn="userSelectedFn($event)" />
                <!-- <EmploymentManagement v-if="selectedCard == '#empManage'" :teamCentral='true' :configData='configData' :teamList='teamList'  :companyData='companyData' :managers='managers' :roles='roles'/>
                <Shifts v-if="selectedCard == '#shift'" :configData='configData' :companyData='companyData' :currentYear='currentYear' :users='users' :user='user' @cardExpanded="cardExpanded($event)" /> -->
                <Requests v-if="selectedCard == '#requests'" :configData='configData' :companyData='companyData'
                    :user='user' :users='users' :teamList='teamList' />
                <!-- <PerformanceListingModule v-if="selectedCard == '#performance' "  :user="user" :users="users" :teamList='teamList' />  -->
                <TeamCalendar v-if="selectedCard == '#teamcalendar'" :teamCalendarPage="isTeamCalendarPage"
                    :wfhList.sync='wfhList_team' :leaveList.sync='leaveList_team' :users="users"
                    :companyData='companyData' />
            </v-col>
        </v-row>


        <!-- Snackbar -->
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
import Avatar from "~/components/reuseable/avatar"
import { directive } from "vue-awesome-swiper";
import Team from '~/components/team-central/team.vue'
// import Shifts from '~/components/team-central/shift.vue'
import Requests from '~/components/team-central/requests.vue'
// import EmploymentManagement from '~/components/admin-central/employment.vue'
// import PerformanceListingModule from '~/components/performance/hrmanagerPerformanceListingModule.vue'
import TeamCalendar from '~/components/reuseable/teamCalendar.vue'

export default {
    layout: 'dashboard',
    components: {

        Requests,
        TeamCalendar,
        Team,
        // Shifts,,EmploymentManagement,PerformanceListingModule,
    },
    name: "Slider",
    directives: {
        swiper: directive,
    },
    data() {
        return {
            roles: [],
            managers: [],
            userSelected: false,
            currentYear: "",
            user: "",
            cards: [
                { name: 'My Team Central', id: "#teamCentral", color: 'brown', icon: '/hr/hr.svg', icon2: '/hr/hr-white.svg', href: '#hrselfservice' },
                // {
                //     "name" : "Employee Profile",
                //     "id" : "#empManage",
                //     "color" : "brown",
                //     "icon" : "/hr/hr.svg",
                //     "icon2" : "/hr/hr-white.svg",
                //     "href" : "#adminCentral",
                //     "order" : 2
                // }, 
                // {name:'Shift Manager',id:"#shift",color:'primary',icon:'/team/shift.svg',icon2:'/team/shift-white.svg',href:'#shifts'},
                // {name:'Performance Cycles',card_name:"Performance Cycles",id:"#performance",color:'primary',icon:'/hr/claim.svg',icon2:'/hr/claim-white.svg',href:'#performance'},
                { name: 'Requests', id: "#requests", color: 'green', icon: '/team/requests.svg', icon2: '/team/requests-white.svg', href: '#hrselfservice' },
                { name: 'Team Calendar', id: "#teamcalendar", color: 'green', icon: '/team/shift.svg', icon2: '/team/shift-white.svg', href: '#teamcalendar' },
            ],
            firstLoad: true,
            loading: true,
            totalReq: [],
            userRequests: [],
            userLeaveRequests: [],
            swiperOptions: {
                loop: false,
                spaceBetween: 15,
                slidesPerView: 5,
                autoplay: false,


                breakpoints: {
                    320: {
                        slidesPerView: 2
                    },
                    480: {
                        slidesPerView: 3
                    },
                    768: {
                        slidesPerView: 6
                    },
                    1800: {
                        slidesPerView: 8
                    }
                }
            },
            selectedCard: "",
            snack: false,
            snackText: '',
            snackColor: '',
            teamList: [],
            leavesD: [],
            users: [],
            expandedShift: false,
            configData: [],
            companyData: [],
            wfhList_team: [],
            leaveList_team: [],
        }
    },


    async beforeMount() {
        this.user = this.$store.getters.getUserInfo
        await this.getTeamList()
    },
    created() {
        this.$nuxt.$on('reloadTeamCalendar', async ($event) => {
            // let filter = $event;
            this.getTeamLeaveList();
            this.getTeamWfhList();
        })
    },
    mounted() {
        this.getData()

        // this.getTeamList(),
        setInterval(() => {
            this.firstLoad = false
        })
        // this.pageAccess('/dashboards/my-team')
    },
    methods: {
        async getTeamWfhList() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            // if(filter == 'Department') {
            //     const body = {
            //         "dept": this.user.reporting.department,
            //         "user_id": this.user._id
            //     }
            //     this.$axios.$post("/wfh/dept", body, { headers: { Authorization: AuthStr } }).then((res) => {
            //         this.wfhList_team = res;
            //     }).catch();
            // } else {
            //     await this.$axios.$post("/wfh/get-reporting-wfh/all", { id: this.user._id }, { headers: { Authorization: AuthStr } })
            //     .then(res => {
            //         this.wfhList_team = res;
            //     }).catch()
            // }
            let body = {
                "user_id": this.user._id,
            }

            await this.$axios.$post("/wfh/get_all_requests", body, { headers: { Authorization: AuthStr } })
                .then(res => {
                    // console.log(res && res.data[0] && res.data[0].users_wfhs, "--------------response WFH")
                    if (res && res.data[0] && res.data[0].users_wfhs) {

                        this.wfhList_team = res.data[0].users_wfhs
                        // this.leaveList_team = res;
                    }
                }).catch()
        },
        async getTeamLeaveList() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            // if(filter == 'Department') {
            //     await this.$axios.$get("/leaves/department/" + this.user.reporting.department, {headers: { Authorization: AuthStr },})
            //     .then((res) => {
            //         this.leaveList_team = res;
            //     }).catch();
            // } else {
            //     await this.$axios.$post("/leaves/get-reporting-leave/all", { id: this.user._id }, { headers: { Authorization: AuthStr } })
            //     .then(res => {
            //         this.leaveList_team = res;
            //     }).catch()
            // }
            let body = {
                "user_id": this.user._id,
            }

            await this.$axios.$post("/leaves/get_all_requests", body, { headers: { Authorization: AuthStr } })
                .then(res => {
                    // console.log(res && res.data[0] && res.data[0].users_leaves, "--------------response LEAVE")
                    if (res && res.data[0] && res.data[0].users_leaves) {

                        this.leaveList_team = res.data[0].users_leaves
                        // this.leaveList_team = res;
                    }
                }).catch()
        },
        reloadTeamCalendar() {
            this.getTeamLeaveList()
            // this.getTeamWfhList()
        },
        async getFeedbackQuestions() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            await this.$axios.$get('performancefeedback/all', { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.performanceFeedbackQuestion = res
                }).catch()
        },
        async getData() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            let body = {
                "dept": 1,
                "letterRequest": 1,
                "holiday_calendar": 1,
                "leaveTypes": 1,
                "company_work_schedules": 1,
                "shifts": 1,
                "work_locations": 1,
                "costCenterOptions": 1,
                "bankNameOptions": 1,
                "comp_access_arr": 1,
                "leaveList": 1,
                "fixed": 1,
                "work_schedule": 1,
                'designations': 1,
                'emp_type_key': 1
            }
            // this.configData = await this.$axios.$post('configuration/get-req-conf', body, { headers: { Authorization: AuthStr }})
            this.configData = this.$store.getters.getConf
            this.companyData = await this.$axios.$get("/companies/all", { headers: { Authorization: AuthStr } })
            // this.managers = await this.$axios.$get("users/manager", {headers: { Authorization: AuthStr }})
            // this.managers = await this.$axios.$get("users/managerEmpManagement", {headers: { Authorization: AuthStr }})
            // this.roles = await this.$axios.$get("/roles/all", {headers: { Authorization: AuthStr }})
            this.expandedShift = false

            // this.getLeavesData(),
            this.getUserInfo()
            // this.getUserRequests()


        },
        pageAccess(route) {
            let cards = []
            if (this.$store.getters.getUser) {
                if (route) {
                    let pages = this.$store.getters.getLogin.access_pages[0].pages
                    let special = this.$store.getters.getUser.accessTag

                    let access = pages.filter(page => {
                        return String(route) == page.url.trim()
                    })

                    let special_access = special.filter(page => {
                        return String(route) == page.url.trim()
                    })

                    if (access.length == 0 && special_access.length == 0) {
                        return false
                    } else {
                        if (access.length > 0 && special_access.length > 0) {

                            let role_sub_pages = access[0].sub_pages
                            let special_sub_pages = special_access[0].sub_pages

                            cards.push(...role_sub_pages)
                            cards.push(...special_sub_pages)

                            const obj = {};

                            for (let i = 0, len = cards.length; i < len; i++) {
                                obj[cards[i]['id']] = cards[i];
                            }

                            cards = new Array();

                            for (const key in obj) {
                                cards.push(obj[key]);
                            }

                        } else {
                            if (special_access.length > 0) {
                                let sub_pages = special_access[0].sub_pages
                                cards.push(...sub_pages)
                            } else if (access.length > 0) {
                                let role_sub_pages = access[0].sub_pages
                                cards.push(...role_sub_pages)
                            }

                        }
                        _.uniq(cards)
                        this.cards = cards

                    }
                }
            }
        },
        cardExpanded() {
            this.expandedShift = !this.expandedShift
        },
        getLeavesData() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.leavesD = this.$axios.$get("/leaves/all", { headers: { Authorization: AuthStr } })
        },
        async getTeamList() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.teamList = await this.$axios
                .$get("/users/team/" + this.user._id, {
                    headers: { Authorization: AuthStr },
                })

        },
        async getUserInfo() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);


            this.currentYear = new Date().toISOString().substr(0, 10)
            if (this.$route.hash) {
                this.selectedCard = this.$route.hash
            } else this.selectedCard = '#teamCentral'

            this.users = this.$store.getters.getUsers
        },
        openRequests(data) {
            this.selectedCard = '#requests';
        },
        userSelectedFn(data) {
            this.userSelected = !this.userSelected;
        },

        selectCard(href, id) {
            this.selectedCard = id
            if (id == '#teamcalendar') {
                this.getTeamLeaveList()
                this.getTeamWfhList()
            }
        },
        getUserRequests() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            this.$axios.$get("/requests/users/" + this.user._id, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.userRequests = res
                }).catch()

            this.$axios.$get("/leaves/users/" + this.user._id, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.userLeaveRequests = res
                }).catch()

        },
        route(val) { }
    },
    computed: {
        isTeamCalendarPage() {
            return this.$route.hash == '#teamcalendar' ? true : false
        },
        visiblerequests() {
            this.totalReq = [...this.userRequests, ...this.userLeaveRequests]
            let abc = _.orderBy(this.totalReq, ['date_created'], ['asc']).slice(0, 10)
            return abc
        },
        computedCards() {
            // const tags = Object.keys(this.user.accessTag);
            // const cards = tags.map(a=>
            //     this.user.accessTag[a].name
            // )
            // if(cards.includes('Shifts')){
            return this.cards
            // }else{
            //     return this.cards.filter(card => card.name !== 'Shift Manager')
            // }
        },
        // pageAccess() {
        //     let pages = this.$store.getters.getLogin.access_pages[0].pages
        //     let special = this.$store.getters.getUser.accessTag

        //     let access = pages.filter(page => {
        //     return String('/shifts') == page.url
        //     })

        //     let special_access = special.filter(page => {
        //     return String('/shifts') == page.url
        //     })

        //     if (access.length == 0 && special_access.length == 0) {
        //         return false
        //     } else {
        //         return true
        //     }
        // },
    }
}
</script>
<style>
.swiperCustom {
    max-height: fit-content;
}

@media screen and (max-width:900px) {
    .swiperOverflow {
        overflow: hidden !important;
    }

}
</style>
<style lang="scss"></style>