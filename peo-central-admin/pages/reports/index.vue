<template fluid>
    <div class="pt-5">
      <v-row v-if="firstLoad == true" class="reportSkeleton">
        <v-col cols="12" md="7" class="pa-0 pr-0">
          <v-skeleton-loader class="" width="900" :loading="loading" type="card"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" md="5" class="pa-0 pr-0 pb-5">
          <v-skeleton-loader class="" width="600" :loading="loading" type="card"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row v-if="firstLoad == true" class="reportSkeleton">
        <v-col cols="12" md="7" class="pa-0 pr-0">
          <v-skeleton-loader class="" width="900" :loading="loading" type="card"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" md="5" class="pa-0 pr-0 pb-5">
          <v-skeleton-loader class="" width="600" :loading="loading" type="card"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row class="pt-0 ml-0 pr-5" style="max-width: 100%" v-else>
        <v-col cols="12" md="12" class="pa-0 pr-3">
          <v-row class="pt-0 mr-5 ml-lg-5 ml-1" height="auto">
            <swiper :options="swiperOptions" class="mx-0">
              <div v-for="(data, index) in cards" :key="index" class="swiper-slide swiperCustom"
                style="min-width: 180px; max-width: 180px; max-height: 110px">
                <v-card min-height="80" min-width="170" max-width="170" class="mr-5 borderRadiusTabs" :style="
                  selectedCard == data.id
                    ? 'background:transparent linear-gradient(295deg, #6488EE 0%, #0918F7 100%) 0% 0% no-repeat padding-box;'
                    : ''
                " style="
                      box-shadow: rgb(149 158 164 / 10%) 5px 12px 20px;
                      overflow: hidden;
                    " @click="selectCard(data.href, data.id)" :href="data.id">
                  <v-row style="height: 100%" width="100%" align="center" justify="center" class="">
                    <v-col cols="2" class="pr-0 text-right">
                      <img :src="selectedCard == data.id ? data.icon2 : data.icon" alt="" class="mt-2" />
                    </v-col>
                    <v-col cols="7" :class="selectedCard == data.id ? 'white--text' : ''" class="my-auto"
                      v-if="data.name != 'date'">{{ data.name }}</v-col>
                    <v-col cols="7" :class="selectedCard == data.id ? 'white--text' : ''" class="my-auto" v-else
                      style="line-height: 1; font-weight: 800">
                      {{ date | day }}
                      <p class="mb-0" style="font-weight: 300">
                        {{ date | month }}
                      </p>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </swiper>
          </v-row>
  
          <v-row>
            <v-col class="pa-0">
              <HrDashboard v-if="selectedCard == '#report'" :users="users" :user="user" :configuration="configuration" />
              <!-- <payrollDashboard v-if="selectedCard == '#payroll'" :users="users" :user="user"
                :configuration="configuration" />
              <ReportBuilder v-if="selectedCard == '#reportbuilder'" :users="users" :user="user"
                :reportsList="reports.report" :selectedReport="reports.report.length ? reports.report[0] : {}" />
              <Gratuity v-if="selectedCard == '#gratuity'" :users="users" :user="user" :configuration="configuration" /> -->
              <!-- <LeavePlan v-if="selectedCard == '#leaveplan'" :users="users" :user="user" :configuration="configuration" /> -->
              <Report v-if="selectedCard == '#report2'" :users='users' :user='user' :configuration='configuration' /> 
            </v-col> 
          </v-row>
  
          <!-- Snackbar -->
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
  import moment from "moment";
  import Avatar from "~/components/reuseable/avatar";
  import { directive } from "vue-awesome-swiper";
  import HrDashboard from "~/components/Reports/hr-dashboard.vue";
  //   import payrollDashboard from "~/components/reports/payroll-dashboard.vue";
  //   import ReportBuilder from "~/components/Reports/report-builder.vue";
  //   import Gratuity from "~/components/reports/gratuity.vue";
  //   import Attendance from "~/components/reuseable/attendance";
  // import LeavePlan from "~/components/Reports/leave-plan.vue";
  import Report from "~/components/Reports/bi-report.vue"
  
  export default {
    components: {
      Avatar,
      HrDashboard,
      Report,
      //  LeavePlan
    //   ReportBuilder,
    //   Gratuity,
    //   payrollDashboard,
    },
    layout: "dashboard",
    name: "Slider",
    directives: {
      swiper: directive,
    },
    data: () => ({
      cards: [
        {
          name: "HR Dashboard",
          id: "#report",
          color: "brown",
          icon: "/reports/hr.svg",
          icon2: "/reports/hr-white.svg",
          href: "#report",
        },
        // {
        //   name: "Payroll Dashboard",
        //   id: "#payroll",
        //   color: "brown",
        //   icon: "/reports/payroll.svg",
        //   icon2: "/reports/payroll-white.svg",
        //   href: "#report",
        //   order: 2,
        // },
        {
          name: "Report",
          id: "#report2",
          color: "brown",
          icon: "/reports/report.svg",
          icon2: "/reports/report.svg",
          href: "#report",
          order: 3,
        },
        // {
        //     "name" : "Report builder",
        //     "id" : "#reportbuilder",
        //     "color" : "brown",
        //     "icon" : "/reports/vuesax-bulk-folder-open.svg",
        //     "icon2" : "/reports/folder-open.svg",
        //     "href" : "#report"
        // },
        // {
        //   "name": "Gratuity",
        //   "id": "#gratuity",
        //   "color": "brown",
        //   "icon": "/hr/hr.svg",
        //   "icon2": "/hr/hr-white.svg",
        //   "href": "#report",
        //   "order": 2
        // },
        // {
        //   "name": "Yearly Leave Plan",
        //   "id": "#leaveplan",
        //   "color": "brown",
        //   "icon": "/hr/plannerCalendarDis.svg",
        //   "icon2": "/hr/plannerCalendarBlue.svg",
        //   "href": "#report",
        //   "order": 3
        // },
        // {
        //   "name": "BI Report",
        //   "id": "#BIReport",
        //   "color": "brown",
        //   "icon": "/dashboard/chart.svg",
        //   "icon2": "/dashboard/chart2.svg",
        //   "href": "#report",
        //   "order": 3
        // }
      ],
      selectedCard: "#report",
      date: new Date(),
      tab: "",
      tab_news: "",
      page: 1,
      perPage: 8,
      page_event: 1,
      perPageEvent: 6,
      page_news: 1,
      perPageNews: 3,
      page_feeds: 1,
      perPageFeeds: 3,
      user: {
        personal: {},
        bank: {},
        education: {},
        work_experience: {},
        documents: {},
        emergency: {},
        reporting: {},
        leaves: {},
        salary: {},
      },
      swiperOptions: {
        loop: false,
        spaceBetween: 2,
        slidesPerView: 5,
        autoplay: false,
  
        breakpoints: {
          320: {
            slidesPerView: 2,
          },
          480: {
            slidesPerView: 3,
          },
          768: {
            slidesPerView: 6,
          },
          1800: {
            slidesPerView: 8,
          },
        },
      },
  
      temp_data: {},
      dialog: false,
      dialog1: false,
      snack: false,
      snackText: "",
      snackColor: "",
      emailBody: {
        hr_email: "",
        email: "",
        subjectMsg: "",
        eMessage: "",
      },
      tasksList: [],
      tasksList_inprogress: [],
      tasksList_completed: [],
      weather1: {
        coord: {},
        weather: [
          {
            id: "",
            main: "",
            description: "",
            icon: "",
          },
        ],
        main: {},
        wind: {},
        clouds: {},
        sys: {},
        how_u_feeling: "",
      },
      surveyTaken: false,
      //
      labels: ["SU", "MO", "TU", "WED", "TH", "FR", "SA"],
      time: 0,
      location: {
        latitude: "",
        longitude: "",
      },
      //
      open_tasks: 0,
      upcoming_deadlines: 0,
      deadlines_missed: 0,
      active_projects: 0,
      todayEvent: [],
      firstLoad: true,
      loading: true,
      attendance: {
        startTime: new Date(),
        endTime: new Date(),
        in_latitude: "",
        in_longitude: "",
        date: new Date().toISOString().substring(0, 10),
        day: new Date().getDay(),
        total: "",
        user_id: "",
        break_startTime: [],
        break_endTime: [],
        breakFlag: false,
        breakTime: 5400000,
        status: "",
      },
      reports: [],
    }),
    async asyncData({ app, store }) {
      const token = store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      let userData = await store.getters.getUsers;
      let configData = await store.getters.getConf;
      let socialsData = await app.$axios.$get("socials/getsocials", {
        headers: { Authorization: AuthStr },
      });
  
      return {
        users: userData,
        configuration: configData,
        socials: socialsData,
      };
    },
    mounted() {
      this.getUserInfo(),
        this.getLocation(),
        // this.getUserTasksList(),
        // this.getDailySurveyDetails(),
        this.getStats(),
        this.showPosition(),
        this.gettodayAttendanceDetails(),
        setInterval(() => {
          this.firstLoad = false;
        });
      this.getReports();
    },
    methods: {
      async getReports() {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
        this.reports = await this.$axios.$get("/reportbuilder/all", {
          headers: { Authorization: AuthStr },
        });
      },
      selectCard(href, id) {
        if (href == "#report") {
          this.selectedCard = id;
        } else if (href == "user/attendance") {
          window.open(
            "https://hrdirect.nathanhr.ae/user/attendance/" + this.user._id
          );
        } else {
          window.open("https://hrdirect.nathanhr.ae/" + href);
        }
      },
      async gettodayAttendanceDetails() {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
  
        let date = new Date().toISOString().substring(0, 10);
  
        await this.$axios
          .$get("/attendance/today/" + date + "/" + this.user._id, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            if (res.length > 0) {
              // this.$forceUpdate();
            } else {
              this.checkIn();
            }
          })
          .catch();
      },
      async checkIn() {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
  
        // this.attendance.startTime = new Date().getTime()
        this.attendance.startTime = new Date().toISOString();
        this.attendance.endTime = "";
        this.attendance.in_latitude = this.location.latitude;
        this.attendance.in_longitude = this.location.longitude;
        this.attendance.user_id = this.user._id;
        // this.attendance.date = date
  
        await this.$axios
          .$post("attendance/new/", this.attendance, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => { })
          .catch((e) => console.log(e));
      },
      getCarousalImage(val) {
        if (val == "New Joinee - Welcome Aboard") {
          return "https://cdn.vuetifyjs.com/images/parallax/material.jpg";
        }
  
        if (val == "Birthday") {
          return "https://cdn.vuetifyjs.com/images/parallax/material.jpg";
        }
  
        if (val == "Work Anniversary") {
          return "https://cdn.vuetifyjs.com/images/parallax/material.jpg";
        }
      },
      // async cardInfo(){
      //     let abc = this.users.filter(a=>a._id == this.user._id)
      //     this.cards = abc[0].dashboard
      // },
      getEventMessage(val) {
        if (val == "New Joinee - Welcome Aboard") {
          return "Welcome to Nathan & Nathan Group.";
        }
  
        if (val == "Birthday") {
          return "Wish you the Happiest Birthday";
        }
  
        if (val == "Work Anniversary") {
          return "Congratulation on your Work Anniversary";
        }
      },
      getImage(val) {
        let image =
          "https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png";
        if (this.users.length > 0) {
          let abc = this.users.filter((a) => a._id == val);
          if (abc.length > 0) {
            if (abc[0].hasOwnProperty("image_url")) {
              if (abc[0].image_url != "") image = abc[0].image_url;
            }
          }
        }
        return image;
      },
      getStats() {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
  
        // this.$axios
        //   .$get("/tasks/incomplete/count/" + this.user._id, {
        //     headers: { Authorization: AuthStr },
        //   })
        //   .then((res) => {
        //     this.open_tasks = res;
        //   })
        //   .catch();
  
        // this.$axios
        //   .$get("/tasks/upcomingdeadlines/count/" + this.user._id, {
        //     headers: { Authorization: AuthStr },
        //   })
        //   .then((res) => {
        //     this.upcoming_deadlines = res;
        //   })
        //   .catch();
  
        // this.$axios
        //   .$get("/tasks/misseddeadlines/count/" + this.user._id, {
        //     headers: { Authorization: AuthStr },
        //   })
        //   .then((res) => {
        //     this.deadlines_missed = res;
        //   })
        //   .catch();
  
        // this.$axios
        //   .$get("/projects/incomplete/count/" + this.user._id, {
        //     headers: { Authorization: AuthStr },
        //   })
        //   .then((res) => {
        //     this.active_projects = res;
        //   })
        //   .catch();
      },
      firstLetter(s) {
        if (typeof s !== "string") return "";
        return s.charAt(0).toUpperCase();
      },
      hasProfilePic(id) {
        let abc = this.users.filter((a) => a._id == id);
        if (abc[0].image_url != undefined) {
          return true;
        } else {
          return false;
        }
      },
      getUserProfilePic(id) {
        let abc = this.users.filter((a) => a._id == id);
        if (abc[0].image_url != "") {
          return abc[0].image_url;
        } else {
          return "";
        }
      },
      getUserName(val) {
        if (val == "" || val == undefined || val == null) {
          return "";
        } else {
          let abc = this.users.filter((a) => a._id == val);
          return abc.length > 0 ? abc[0].first_name + " " + abc[0].last_name : "";
        }
      },
      CountertextColor(val) {
        if (val < 600000) return "red--text";
        else return "green--text";
      },
      openPost(id) {
        this.$router.push("/resources/view/" + id);
      },
      getDailySurveyDetails() {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
        let date = new Date().toISOString().substring(0, 10);
        let surveyname = "daily";
  
        this.$axios
          .$get("/survey/" + surveyname + "/" + date + "/" + this.user._id, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            if (res != "") {
              if (res[0].survey_taken) {
                this.surveyTaken = true;
              } else {
                this.surveyTaken = false;
              }
            }
          })
          .catch();
      },
  
      goToTask(id) {
        this.$router.push("/user/tasks/view/" + id);
      },
      shortLinkRedirect(link) {
        this.$router.push(link);
      },
      getUserInfo() {
        this.user = this.$store.getters.getUserInfo;
      },
      getUserTasksList() {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
        let abc = this.$axios
          .$get("/tasks/users/" + this.user._id, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.tasksList = res;
            this.tasksList_inprogress = res.filter(
              (a) => a.status != "Completed"
            );
            // this.tasksList_completed = res.filter(a => a.status == 'Completed')
          })
          .catch();
      },
      getGender(val) {
        if (val == "Male") return "his";
        else return "her";
      },
      getLocation() {
        if (navigator.geolocation) {
          console.log(
            navigator.geolocation.getCurrentPosition(this.showPosition)
          );
        } else {
          console.log("Geolocation is not supported by this browser.");
        }
      },
      showPosition(position) {
        let key = "e030bdfc857e211a0445ee6a80104f6c";
        var weather = require("openweather-apis");
        let self = this;
        weather.setLang("en");
        weather.setCoordinate("25.075467099999997", "55.139733");
        weather.setUnits("metric");
        weather.setAPPID(key);
  
        weather.getAllWeather(function (err, smart) {
          self.weather1 = smart;
        });
      },
      addTemp(data) {
        this.dialog = !this.dialog;
        this.temp_data = data;
      },
      sendWishes() {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
  
        let data = this.temp_data;
        if (data.event == "Birthday")
          this.emailBody.subjectMsg = "Happiest Birthday " + data.first_name;
        else
          this.emailBody.subjectMsg =
            "Congratulations on your Work Anniversary " + data.first_name;
  
        // this.emailBody.hr_email = 'akshaf@nathanhr.com'
        // this.emailBody.email = 'akshaf@nathanhr.com'
        this.emailBody.hr_email = this.user.email;
        this.emailBody.email = data.email;
  
        this.$axios
          .$post("processes/send-email/", this.emailBody, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.dialog = false;
            this.snack = true;
            this.snackColor = "primary";
            this.snackText = "Wish successfully sent!";
          })
          .catch((e) => console.log(e));
      },
      addToToDoList(id, task) {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
        this.snack = true;
        this.snackColor = "success";
        this.snackText = "Added Task to To Do List";
        task.to_do_list = true;
        this.$axios
          .$put("tasks/update/" + id, task, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.$router.go();
          })
          .catch((e) => console.log(e));
      },
      removeToToDoList(id, task) {
        const token = this.$store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);
        this.snack = true;
        this.snackColor = "success";
        this.snackText = "Task removed from To Do List";
        task.to_do_list = false;
        // console.log(task)
        this.$axios
          .$put("tasks/update/" + id, task, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            // console.log(res)
            this.$router.go();
          })
          .catch((e) => console.log(e));
      },
      getFullDay(val) {
        if (val == "0") return "sunday";
        else if (val == "1") return "Monday";
        else if (val == "2") return "Tuesday";
        else if (val == "3") return "Wednesday";
        else if (val == "4") return "Thursday";
        else if (val == "6") return "Friday";
        else return "Saturday";
      },
      dateChecker(from, to) {
        var dateFormat = function (value) {
          if (value) {
            return value ? moment(String(value)).format("MMM DD, YYYY") : '';
          }
        };
        if (from == to) {
          return dateFormat(from);
        } else {
          return dateFormat(from) + " to " + dateFormat(to);
        }
      },
    },
    computed: {
      computedSlidesCount() {
        return 3;
      },
      fetchEventMonth() {
        let abc = this.users.filter((a) => a.user_status != "Inactive");
        let arr = [];
        this.todayEvent = [];
        let today = new Date().toISOString().substr(5, 5);
        if (abc.length <= 0) {
          return "";
        } else {
          for (let i = 0; i < abc.length; i++) {
            if (abc[i].personal.dob) {
              let obj = {
                user_id: "",
                first_name: "",
                last_name: "",
                email: "",
                gender: "",
                event_date: "",
                event_type: "Birthday",
              };
              obj.user_id = abc[i]._id;
              obj.first_name = abc[i].first_name;
              obj.last_name = abc[i].last_name;
              obj.email = abc[i].email;
              obj.gender = abc[i].personal.gender;
              obj.event_date = abc[i].personal.dob.substr(5, 5);
              // get today's events
              if (obj.event_date == today) {
                this.todayEvent.push(obj);
              } else {
                arr.push(obj);
              }
            }
          }
          for (let i = 0; i < abc.length; i++) {
            if (abc[i].date_of_joining) {
              let obj = {
                user_id: "",
                first_name: "",
                last_name: "",
                email: "",
                event_date: "",
                event_type: "Work Anniversary",
              };
              if (
                new Date(abc[i].date_of_joining) >
                new Date(new Date(new Date().setDate(new Date().getDate() - 1)))
              ) {
                obj.event_type = "New Joinee - Welcome Aboard";
              }
              obj.user_id = abc[i]._id;
              obj.first_name = abc[i].first_name;
              obj.last_name = abc[i].last_name;
              obj.email = abc[i].email;
              obj.gender = abc[i].personal.gender;
              obj.event_date = abc[i].date_of_joining.substr(5, 5);
  
              // get today's events
              if (obj.event_date == today) {
                this.todayEvent.push(obj);
              } else {
                arr.push(obj);
              }
            }
          }
        }
        let next_30_days = new Date(new Date().setDate(new Date().getDate() + 30))
          .toISOString()
          .substr(5, 5);
        let date_today = new Date(new Date().setDate(new Date().getDate() - 1))
          .toISOString()
          .substr(5, 5);
        let def = arr.filter(
          (a) => a.event_date > date_today && a.event_date < next_30_days
        );
        return _.orderBy(def, ["event_date"], ["asc"]);
      },
  
      visibleEvents() {
        return this.fetchEventMonth;
      },
      computeEventForTheDay() {
        let today = new Date().toISOString().substr(0, 10);
        let abc = this.configuration[0].events.filter(
          (a) => a.created_date == today
        );
        return abc;
      },
      // hol_order(){
      //     return _.orderBy(this.configuration[0].holiday_calendar, 'from_date','asc')
      // },
      // visibleholidays(){
      //     return this.hol_order.slice((this.page - 1)* this.perPage, this.page* this.perPage)
      // },
      news_order() {
        return _.orderBy(this.configuration[0].news, ["created_date"], ["desc"]);
      },
      visibleNews() {
        return this.news_order.slice(
          (this.page_news - 1) * this.perPageNews,
          this.page_news * this.perPageNews
        );
      },
      feeds_order() {
        return _.orderBy(this.socials, ["feed.created_date"], ["desc"]);
      },
      visibleFeeds() {
        return this.feeds_order.slice(
          (this.page_feeds - 1) * this.perPageFeeds,
          this.page_feeds * this.perPageFeeds
        );
      },
      reversedPost() {
        let def = _.shuffle(this.configuration[0].stories).slice(
          Math.max(this.configuration[0].stories.length - 4, 0)
        );
        return _.reverse(def);
      },
      greetingMsg() {
        var d = new Date();
        var time = d.getHours();
        let abc = {
          msg: "",
          image: "",
        };
        if (time < 12) {
          abc.msg = "Good Morning";
          abc.image = "/dashboard/morning.png";
        } else if (time >= 12 && time < 16) {
          abc.msg = "Good Afternoon";
          abc.image = "/dashboard/noon.png";
        } else {
          abc.msg = "Good Evening";
          abc.image = "/dashboard/evening.png";
        }
        return abc;
      },
    },
  };
  </script>
  
  <style lang="scss" scoped>
  .grad1 {
    //   height: 350px;
    background-color: #1565c0;
    /* For browsers that do not support gradients */
    background-image: linear-gradient(#1565c0, #f5f5f5);
  }
  
  .colorBackgrnd {
    background-color: #237abc;
  }
  
  .bckgndimg {
    background-image: url("https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260");
    background-size: cover;
  }
  
  .swiperCustom {
    height: 150px;
  }
  </style>
  <style scoped>
  .swiper-container .swiper-container-initialized .swiper-container-horizontal {
    width: 100% !important;
  }
  
  .bgaliceblue {
    background: aliceblue;
  }
  
  .clients-image {
    mix-blend-mode: multiply;
    object-fit: contain !important;
    height: 100%;
  }
  
  .cardSingle {
    background-color: transparent;
    box-shadow: none;
  }
  
  .clientsText {
    font-size: 1.3rem;
    margin-bottom: 0;
  }
  
  .reportSkeleton .v-skeleton-loader__image .v-skeleton-loader__bone {
    height: 300px !important;
  }
  
  .swiperCustom {
    max-height: fit-content;
  }
  
  @media screen and (max-width: 900px) {
    .swiperOverflow {
      overflow: hidden !important;
    }
  }
  
  #navbar .swiper-container {
    max-width: 100% !important;
  }
  </style>
  