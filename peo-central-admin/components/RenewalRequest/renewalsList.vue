<template>
  <div>
    <v-row class="Leads_list_wrapper">
      <!--Snack-->
      <SnackBar :data="snackbar_data" />

      <!--Add Dialog-->
      <AddRenewals v-if="addDialog" @closeDialog="handleCloseAddRenewalDialog" />

      <!-- List Column -->
      <v-col sm="12" md="12" lg="12">
        <v-card flat class="no-border_shadow" color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-title id="card-title" class="mb-4">
            <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
              <div style="width: 50% !important">
                <!-- <v-select label="All" class="ma-0 pa-0" flat solo append-icon="fa-chevron-down" hide-details dense
                                    multiple :items="onboardingStatusList" v-model="selectedOnboardingType"
                                    @change="handleFilterOnboardings(selectedOnboardingType)">
                                </v-select> -->
                <v-select label="All" class="ma-0 pa-0" flat solo append-icon="fa-chevron-down" hide-details dense
                  multiple :items="['Notify Employer']" v-model="selectedRenewalType"
                  @change="handleFilterRenewals(selectedRenewalType)" />
              </div>
              <div class="d-flex align-center justify-end" style="width: 50%;">
                <v-btn @click="addDialog = true" class="short__btn " color="primary">Add New</v-btn>
              </div>
            </div>
          </v-card-title>
          <!--Search Bar-->
          <div class="flex_row align-center top_barCustomer">
            <div class="search__bar">
              <v-text-field v-model="searchQuery" class="ml-1" @input="searchDebounceAction()" label="Search" solo flat
                hide-details background-color="searchbar" />
            </div>
          </div>
          <!-- List -->
          <div class="dl__list">
            <v-card-text id="card-text2" style="max-height: 68vh" class="dl__list overflow-y-auto">
              <div v-if="loading && visibleData.length === 0">
                <ProcessListItemSkeleton v-for="i in 5" :key="i" />
              </div>
              <v-list class="customers_list__con" v-if="visibleData.length > 0" ref="employeeListing">
                <v-list-item-group>
                  <ProcessListItem v-for="(item, index) in visibleData"
                    :class="[index !== visibleData.length - 1 ? 'border-b-sm' : '', selectedRenewal?._id == item._id ? 'selected' : '']"
                    :key="index" @clicked="renewalClicked(item)" :avatar-src='item.user_image_url || "https://shorturl.at/h9ROo"'>
                    <template #title>
                      {{ `${item.first_name} ${item.last_name}` }}&nbsp;
                    </template>
                    <template #subtitle>
                      <div class="tw-flex tw-flex-col">
                        <div>{{ item.company_name }}</div>
                      </div>
                    </template>

                                        <template v-slot:tags>
                      <Chip :chip-class="'pink'" :tooltip-color="'pink'" v-if="
                        item.user_location &&
                        item.user_location === 'Inside UAE'
                      " :tooltip-text="item.user_location">
                        <v-icon x-small class="white--text">
                          mdi-map-marker
                        </v-icon>
                      </Chip>

                      <Chip :chip-class="'orange'" :tooltip-color="'orange'" v-if="
                        item.user_location &&
                        item.user_location === 'Outside UAE'
                      " :tooltip-text="item.user_location">
                        <v-icon x-small class="white--text">
                          mdi-airplane
                        </v-icon>
                      </Chip>

                      <!-- status chip -->
                      <Chip
                        v-if="item.status == 'completed'"
                        :tooltip-color="'green'"
                        :chip-class="'green white--text'"
                        :tooltip-text="item.status"
                      >
                        {{ item.status }}
                      </Chip>
                      <Chip
                        v-if="item.status == 'new'"
                        :tooltip-color="'amber'"
                        :chip-class="'amber white--text'"
                        :tooltip-text="item.status"
                      >
                        {{ item.status }}
                      </Chip>

                      <Chip :chip-class="'blue'" :tooltip-color="'blue'" v-if="
                        item.employment_type &&
                        item.employment_type.includes('Work Permit')
                      " :tooltip-text="item.employment_type">
                        {{ item.employment_type | shorten_tag }}
                      </Chip>
                      <Chip :tooltip-color="'purple'" v-if="
                        item.employment_type &&
                        item.employment_type.includes('Mission Visa')
                      " :tooltip-text="item.employment_type">
                        {{ item.employment_type | shorten_tag }}
                      </Chip>
                      <Chip :chip-class="'blue-grey'" :tooltip-color="'blue-grey'" v-if="
                        item.employment_type &&
                        item.employment_type.includes('Employment')
                      " :tooltip-text="item.employment_type">
                        {{ item.employment_type | shorten_tag }}
                      </Chip>

                      <!-- Support Agent Icon with Tooltip -->
                      <v-tooltip bottom v-if="item.support_agent && item.support_agent !== 'No Support Agent Assigned'">
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            size="18"
                            class="ml-2 grey--text text--darken-1"
                            v-bind="attrs"
                            v-on="on"
                          >
                            mdi-account-tie
                          </v-icon>
                        </template>
                        <span class="pa-2">
                          <strong>Support Agent:</strong> {{ item.support_agent }}
                        </span>
                      </v-tooltip>
                    </template>

                    <template #action>
                      <v-row class="pa-0 ma-0">
                        <v-col class="pa-0 pa-0 d-flex justify-end" cols="12">
                          <!-- <v-icon small class="mr-2" color="primary">
                            mdi-calendar
                          </v-icon> -->
                          <span class="grey--text text--darken-1">{{
                            item.createdAt | formatDateWithoutTime
                            }}</span>
                        </v-col>
                        <v-col class="pa-0 d-flex justify-end mt-2" cols="12">
                          <Chip v-if="item.status == 'completed'" :tooltip-color="'green'"
                            :chip-class="'green white--text'" :tooltip-text="item.status">
                            {{ item.status }}
                          </Chip>
                          <Chip v-else-if="item.status == 'new'" :tooltip-color="'amber'"
                            :chip-class="'amber white--text'" :tooltip-text="item.status">
                            {{ item.status }}
                          </Chip>
                          <Chip v-else :tooltip-color="'deep-purple'" :chip-class="'deep-purple'"
                            :tooltip-text="item.status">
                            {{ item.status }}
                          </Chip>
                        </v-col>
                      </v-row>
                    </template>
                  </ProcessListItem>
                  <div class="full-width" v-if="visibleData.length > 0"
                    v-intersect="{ handler: loadMore, options: { threshold: 0.5 } }">
                    <template v-if="loadingMore">
                      <v-skeleton-loader v-for="number in 2" :key="number" type="list-item-avatar-three-line" />
                    </template>
                  </div>
                  <!-- <Observer v-if="loadObserver" @intersect="IntersectGetRenewalsList" /> -->
                </v-list-item-group>
              </v-list>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import '@/assets/scss/utils/_customerListDetails.scss'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import Observer from '~/components/Observer.vue'
import SnackBar from '@/components/utils/SnackBar.vue'
import AddRenewals from './AddRenewals.vue'
import Chip from '~/components/reuseable/Chip.vue'
import ProcessListItem from '../reuseable/ProcessListItem.vue'
import ProcessListItemSkeleton from '@/components/reuseable/ProcessListItemSkeleton.vue'

export default {
  components: {
    customerDefaultIcon,
    Observer,
    SnackBar,
    AddRenewals,
    ProcessListItemSkeleton,
    Chip,
    ProcessListItem
  },
  props: {
    selectedRenewal: Object
  },
  data() {
    return {
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      limit: '1000',
      page: 0,
      renewalsList: [],
      listing: 'search',
      searchQuery: '',
      loadObserver: true,
      filter: {},
      selectedRenewalType: [],
      addDialog: false,
      employees: [],
      employeePage: 0,
      employerPage: 0,
      employers: [],
      selectedEmployers: [],
      loadingMore: false,
      loading: false,
      enableObserver: true,
      employeeListing: null,
      pagination: {
        page: 1,
        limit: 20,
        totalCount: 0,
        itemStartIndex: 0,
        itemEndIndex: 10
      }
    }
  },
  async mounted() {
    await this.getRenewalsList().then(() => {
      if (this.renewalsList.length > 0) {
        // select the first employee
        this.renewalClicked(this.renewalsList[0])
      }
    })
  },
  methods: {
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleFilterSearch()
    }, 500),
    async getRenewalsList() {
      this.page = 0
      this.searchQuery = ''
      this.renewalsList = []
      this.listing = 'search'
      await this.IntersectGetRenewalsList()
      // this.renewalClicked(this.renewalsList[0])
    },
    renewalClicked(val) {
      this.$emit('RenewalEmployeeClicked', val)
    },
    scrollToUserCard(index) {
      const employeeCard = this.$refs.employeeListing.$el.querySelector(".employee-card");
      const row = employeeCard[index];
      if (row) {
        row.scrollIntoView(true);
      }
    },
    async loadMore(entries, observer, isIntersecting) {
      if (isIntersecting) {
        const indexesLeft = this.pagination.totalCount - this.pagination.itemEndIndex;

        if (indexesLeft > 0) {
          this.loadingMore = true

          this.pagination.page += 1
          this.listing = 'search'
          await this.IntersectGetRenewalsList().then(() => {
            this.pagination.itemStartIndex = this.pagination.itemEndIndex;
            this.pagination.itemEndIndex = this.renewalsList.length;
            this.scrollToUserCard(this.pagination.itemStartIndex);
          });
          this.loadingMore = false;
        }
      }
    },
    async IntersectGetRenewalsList() {
      this.loading = true;

      const url = `/generic/search?page=${this.pagination.page}&limit=${this.pagination.limit}`
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        let response = {}
        if (this.listing == 'search') {
          response = await this.$axios.$post(url, { module: 'renewal request', search: this.searchQuery }, { headers: { Authorization: AuthStr } })
          const lists = response.results
          this.renewalsList = [...this.renewalsList, ...lists]
          // this.renewalsList = this.getUnshiftedRenewals(this.renewalsList)
          console.log("renewal list", this.renewalsList)
          // this.renewalClicked(this.renewalsList[0])
        } else {
          response = await this.$axios.$post(url, this.filter, { headers: { Authorization: AuthStr } })
          const lists = response.results
          this.renewalsList = [...this.renewalsList, ...lists]
          // this.renewalClicked(this.renewalsList[0])
        }

        // set pagination values
        this.pagination.page = Number(response.page)
        this.pagination.totalCount = Number(response.totalResults)
        this.pagination.limit = Number(response.limit)

      } catch (error) {
        this.snackbar_data.snackbar = true
        this.snackbar_data.text = error.message
        this.snackbar_data.color = 'red'
        console.log('Error: ', error.message);
      }
      finally {
        this.loading = false;
      }
    },
    getUnshiftedRenewals(arrayRenewals) {
      if (this.selectedRenewal) {
        const renewalIndex = arrayRenewals.findIndex(renewall => renewall.id === this.selectedRenewal.renewalsId[0]);

                // If the user is found
                console.log("renewalIndex", renewalIndex)
                if (renewalIndex !== -1) {
                    // Remove the user from the array
                    //[TODO] check why the renewal is
                    const [ren] = arrayRenewals.splice(renewalIndex, 1);
                    // Add the user to the beginning of the array
                    arrayRenewals.unshift(ren);
                }
            }
            return arrayRenewals
        },
        async handleFilterSearch() {
            this.page = 0
            this.renewalsList = []
            this.listing = 'search'
            await this.IntersectGetRenewalsList()
        },
        async handleFilterRenewals(data) {
            this.page = 0;
            this.renewalsList = []
            this.listing = 'filter'
            this.filter = { 'module': 'renewal request', 'status': data }
            await this.IntersectGetRenewalsList()
        },
        async handleCloseAddRenewalDialog(){
            this.addDialog = false
            this.CompanyId = ''
            this.employeeId = ''
            this.getRenewalsList()
        },
    },
    computed: {
        visibleData() {
            let lists = []
            lists = _.orderBy(this.renewalsList, ['createdAt'], ['desc'])
            lists = this.getUnshiftedRenewals(lists)
            return lists
        }
    }
}
</script>
