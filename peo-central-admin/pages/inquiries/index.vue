<template fluid>
  <div class="pt-0">
    <!-- <swiper :options="swiperOptions" v-else class="mx-0 pl-3"
          style="overflow:unset;max-width:1200px"> -->
    <v-row class="" style="width: 100%">
      <v-col class="pt-0">
        <div class="tw-flex tw-gap-5">
          <div v-for="(data, index) in inquiryCategories" :key="index" class="">
            <div
              min-width="250"
              max-width="250"
              :class="['tw-rounded-xl tw-py-3 tw-h-24 tw-cursor-pointer tw-flex tw-items-center tw-px-3', selectedCard.id == data.id ? '' : 'tw-bg-white']"
              :style="
                selectedCard.id == data.id
                  ? 'background:transparent linear-gradient(295deg, #6488EE 0%, #0918F7 100%) 0% 0% no-repeat padding-box;'
                  : ''
              "

              @click="selectCard(data.href, data)"
              :href="data.id"
            >
              <!-- <v-card min-height="80" min-width="170" max-width="170" class="mr-5 borderRadiusTabs" :style="selectedCard == data.id ?'background:transparent linear-gradient(295deg, #6488EE 0%, #0918F7 100%) 0% 0% no-repeat padding-box;':'' " style="box-shadow: rgb(149 158 164 / 10%) 5px 12px 20px;;overflow: hidden;" @click="selectCard(data.href,data.id)"> -->
              <div
                class="tw-flex tw-h-full tw-w-full tw-items-center tw-justify-center tw-gap-x-2"
              >
                <div class="tw-w-3/12 tw-pr-0 tw-text-right">
                  <img
                    :src="selectedCard.id == data.id ? data.icon2 : data.icon"
                    alt=""
                    class="tw-w-32"
                  />
                </div>

                <div class="tw-flex-1">
                  <div
                    :class="[
                      'tw-w-9/12 tw-my-auto tw-text-md',
                      selectedCard.id == data.id ? 'tw-text-white' : '',
                    ]"
                  >
                    {{ data.name }}
                  </div>

                  <div
                    class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-ml-2"
                    :class="[
                      selectedCard.id == data.id
                        ? 'tw-bg-blue-100'
                        : 'tw-bg-gray-100',
                      getStatusColor(data.name),
                    ]"
                  >
                    <span
                      class="tw-text-lg tw-font-semibold"
                      :class="[
                        selectedCard.id == data.id
                          ? 'tw-text-blue-600'
                          : 'tw-text-gray-600',
                      ]"
                    >
                      {{ data.count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- </swiper> -->

    <v-row class="tw-mt-5" style="width: 100%">
      <v-col class="pt-0">
        <inquiries-wrapper
          :key="selectedCard.key"
          :active-module="selectedCard.key"
        />
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
import { directive } from 'vue-awesome-swiper'

export default {
  layout: 'dashboard',
  name: 'Slider',
  directives: {
    swiper: directive,
  },
  watch: {
    '$route.hash': function (newHash) {
      const fragment = newHash.substring(1)
      console.log('Fragment changed to:', fragment)
      // Or call a method
      this.handleFragmentChange(fragment)
    },
  },
  data() {
    return {
      roles: [],
      managers: [],
      userSelected: false,
      currentYear: '',
      user: '',
      cards: [
        {
          name: 'New Inquires',
          id: '#new-inquiries',
          key: 'new-inquiries',
          color: 'brown',
          icon: '/hr/hr.svg',
          count: 0,
          icon2: '/hr/hr-white.svg',
          href: '#new-inquiries',
        },
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
        {
          name: 'Assigned Inquiries',
          key: 'assigned-inquiries',
          id: '#assigned-inquiries',
          color: 'green',
          icon: '/team/requests.svg',
          icon2: '/team/requests-white.svg',
          count: 0,
          href: '#assigned-inquiries',
        },
        {
          name: 'Archived Inquiries',
          key: 'archived-inquiries',
          id: '#archived-inquiries',
          color: 'green',
          count: 0,
          icon: '/team/shift.svg',
          icon2: '/team/shift-white.svg',
          href: '#archived-inquiries',
        },
      ],
      firstLoad: true,
      loading: true,
      swiperOptions: {
        loop: false,
        spaceBetween: 15,
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
      selectedCard: '',
      snack: false,
      snackText: '',
      snackColor: '',
      expandedShift: false,
      inquiryCounts: [],
    }
  },
  mounted() {
    // this.getTeamList(),
    setInterval(() => {
      this.firstLoad = false
    })
    this.initRoutesHash()
    this.fetchInquiryCounts()
    this.handleInquiryStatsReload()
    // this.pageAccess('/dashboards/my-team')
  },
  beforeDestroy() {
    this.$nuxt.$off('reload-inquiry-counts')
  },
  methods: {
    getStatusColor(status) {
      const colors = {
        'New Inquiries': 'tw-bg-red-50',
        'Archived Inquiries': 'tw-bg-orange-50',
        'Paid Invoices': 'tw-bg-green-50',
        'Assigned Inquiries': 'tw-bg-purple-50',
        'Monthly Invoices': 'tw-bg-indigo-50',
        'Draft Invoices': 'tw-bg-yellow-50',
        'Unapproved Invoices': 'tw-bg-pink-50',
        'Total Amount Due': 'tw-bg-blue-50'
      };
      return colors[status] || 'tw-bg-gray-50';
    },
    handleInquiryStatsReload() {
      this.$nuxt.$on('reload-inquiry-counts', async (data) => {
        if (data && data.data) {
          // Use the data passed from the child component
          const results = data.data
          if (Object.keys(results).length) {
            this.cards = this.cards.map((el) => {
              return {
                ...el,
                count: results[el.key.split('-').join('_')],
              }
            })
          }
        } else {
          // Fallback to fetching fresh data
          await this.fetchInquiryCounts()
        }
      })
    },
    async fetchInquiryCounts() {
      try {
        this.loading_pro = true
        const response = await this.$axios.get('/inquiry/counts')
        console.log('Inquiry response -: ', response.data)
        const results = response.data.data
        if (Object.keys(results).length) {
          this.cards = this.cards.map((el) => {
            return {
              ...el,
              count: results[el.key.split('-').join('_')],
            }
          })
        }
      } catch (error) {
        console.log('Failed to fetch inquiries: ', error?.message)
      }
    },
    initRoutesHash() {
      const hash = this.$route.hash
      // Remove the # character to get just the fragment part
      const fragment = hash && hash.substring(1)
      if (this.cards.map((card) => card.key).includes(fragment)) {
        console.log('found init card ...')
        this.handleFragmentChange(fragment)
      } else {
        this.handleFragmentChange('new-inquiries')
      }
    },
    handleFragmentChange(fragment) {
      this.selectedCard = this.inquiryCategories.find(
        (el) => el.key == fragment
      )
    },

    userSelectedFn(data) {
      this.userSelected = !this.userSelected
    },

    selectCard(href, payload) {
      this.selectedCard = payload
    },
  },
  computed: {
    inquiryCategories() {
      return this.cards
    },
  },
}
</script>
<style>
.swiperCustom {
  max-height: fit-content;
}

@media screen and (max-width: 900px) {
  .swiperOverflow {
    overflow: hidden !important;
  }
}
</style>
<style lang="scss"></style>
