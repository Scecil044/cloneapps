<template>
  <v-card
    class="rounded-md allRequests"
    style="box-shadow: 0px 24px 30px #959ea51a"
    min-height="720px"
  >
    <v-card-title class="px-1 px-6">
      <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center">
        <v-col cols="auto" class="pa-0">
          <v-img 
            src="/team/requestsDark.svg"
            max-width="fit-content"
            height="fit-content"
            class="mr-2"
            contain
          ></v-img>
        </v-col>
        <v-col cols="auto" class="pa-0">
          <span class="darkBlue-heading-text subHeadingFontSize">
            {{ title || 'New Inquiries' }}
          </span>
        </v-col>
        <v-col cols="auto" class="py-0">
          <v-text-field
            v-model="searchInquiry"
            @input="searchFn()"
            solo
            flat
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            class="rounded-xl"
            placeholder="Search"
            style="
              background: #ffffff 0% 0% no-repeat padding-box;
              border: 0.5px solid #eff1f3;
              border-radius: 18px;
              opacity: 1;
            "
          ></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto" class="pa-0" align-self="end">
          <v-img
            src="/directory/add_plus.svg"
            max-width="35"
            height="auto"
            @click="
              ;(createRequest = true),
                (requestInfo = false),
                (leavePlanner = true),
                (showHeaderPlanner = false)
            "
            class="cursor-pointer"
            contain
          ></v-img>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider></v-divider>
    <div class="scroll" style="max-height: 620px; min-height: 620px">
      <div v-if="filteredData.length > 0">
        <template>
          <v-list two-line class="py-0" v-if="filteredData != []">
            <v-list-item-group
              v-model="selectedItem"
              color="blue-grey darken-3"
            >
              <ReuseableProcessListItem
                v-for="(item, index) in filteredData"
                :class="index !== filteredData.length - 1 ? 'border-b-sm' : ''"
                :key="index"
                @clicked="selectItem(item)"
                :avatarSrc="item.company_logo"
              >
                <template v-slot:title>
                  <v-row justify="space-between">
                    {{ item.company_name || item.name }}&nbsp;
                  </v-row>
                </template>

                <template v-slot:tags>
                  <Chip
                    :chipClass="'red'"
                    :tooltipColor="'red'"
                    v-if="item.country"
                    :tooltipText="item.country"
                  >
                    {{ item.country | shorten_tag }}
                  </Chip>
                </template>
                <template v-slot:action>
                  <v-menu
                    transition="slide-y-transition"
                    class="ml-auto"
                    rounded="lg"
                    offset-y
                  >
                    <template v-slot:activator="{ attrs, on }">
                      <v-btn v-bind="attrs" v-on="on" color="subtext" icon>
                        <v-icon small
                          >fa-solid fa-ellipsis-vertical</v-icon
                        ></v-btn
                      >
                    </template>
                    <v-list>
                      <v-list-item @click="updateInquiryStatus(item)">
                        <span class="n_text text--text"> Hold </span>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </ReuseableProcessListItem>
            </v-list-item-group>
          </v-list>
        </template>
        <Observer @intersect="requestListScrollerObserver()" />
        <div v-intersect>
          <v-card class="text-center" elevation="0">
            <v-progress-circular
              v-if="loading"
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-card>
        </div>
        <!-- <Observer  v-if="showScrollObserver" @intersect="getAllRequests(false)"/> -->
        <!-- <v-card v-intersect="getAllRequests(false)"></v-card> -->
      </div>
      <div v-else style="max-width: 100%; min-height: 100%">
        <v-row class="mx-0" style="max-width: 100%; min-height: 620px">
          <v-col
            cols="12"
            v-if="loading == true"
            justify="center"
            align="center"
            class="ma-auto"
          >
            <v-img
              src="https://i.pinimg.com/originals/6f/1a/9f/6f1a9f9d0b98384d9ae0e57c1428e67f.gif"
              max-width="40"
              height="40"
              class=""
              contain
            ></v-img>
          </v-col>
          <v-col
            cols="12"
            v-else
            justify="center"
            align="center"
            class="ma-auto"
          >
            <v-img
              src="/hr/empty.svg"
              max-width="fit-content"
              height="fit-content"
              class=""
              contain
            ></v-img>
            <p class="font-weight-normal largeHeadingFontSize mt-3">
              No Inquiry
            </p>
            <p class="mb-0 grey-heading-text textFontSize mt-5">
              You do not have any inquiry!
            </p>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'inquiry-listings',
  props: ['inquiry_type',  'title'],
  data() {
    return {
      selectedItem: {},
      searchInquiry: '',
      inquiries: [],
      paginate: {
        limit: 20,
        page: 1,
      },
      loading: true,
    }
  },
  computed: {
    filteredData() {
      return this.inquiries || []
    },
  },
  methods: {
    selectItem(item) {
      this.$nuxt.$emit('select-inquiry', item)
    },
    searchFn() {},
    updateInquiryStatus() {},
    requestListScrollerObserver() { },
    async fetchInquiries() {
      try {
        const response = await this.$axios.get('/inquiry', {
          params: {
            page: 1,
            limit: 10,
            sort: 'created_at',
            order: 'desc',
            status: 'active'
          }
        })
        console.log('inquiry response -: ', response.data)
        this.inquiries = response.data.data.results || []
        this.paginate.limit = response.data.data.limit
        this.paginate.page = response.data.data.page
      } catch (error) {
        console.log('Error when fetching inquiries: ', error.message)
      }
    }
  },
  async mounted() {
    await this.fetchInquiries()
  }
}
</script>

<style lang="scss" scoped></style>
