<template>
  <v-container class="pa-0 vs_custom" fluid>
    <v-col cols="12" class="py-0">
      <v-row>
        <PartnersInsight />
      </v-row>
    </v-col>

    <v-row class="d-flex pa-0">
      <!-- Partners List -->
      <v-col sm="12" md="5" lg="4">
        <v-card
          flat
          class="no-border_shadow"
          color="card_bg"
          id="card"
          style="min-height: 90vh !important"
        >
          <!-- Search Bar -->
          <div class="flex_row d-flex align-center">
            <v-text-field
              v-model="searchQuery"
              class="mr-2"
              @input="searchPartners(searchQuery)"
              label="Search"
              solo
              flat
              hide-details
              background-color="searchbar"
            ></v-text-field>
            <div class="d-flex align-center">
              <v-btn title="filters" icon @click="showFilterDialog = true">
                <v-icon>mdi-filter</v-icon>
              </v-btn>
              <v-btn icon title="reset filters" @click="resetFilters">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
              <nuxt-link :to="route_to.path">
                <v-btn color="primary" rounded elevation="0">
                  <v-icon small>mdi-{{route_to.icon}}</v-icon>
                  {{ route_to.text }}
                </v-btn>
              </nuxt-link>
            </div>
          </div>

          <!-- Partners List -->
          <v-card-text
            id="card-text2"
            style="max-height: 68vh"
            class="dl__list overflow-y-auto"
          >
            <v-list
              v-if="filteredPartners && !loaders.all_partners"
              class="partners_list__con"
            >
              <template v-if="filteredPartners.length > 0">
                <v-list-item-group v-model="selectedPartnerId">
                  <v-list-item
                    v-for="(partner, index) in filteredPartners"
                    :key="partner._id"
                    @click="selectPartner(partner._id)"
                    :class="index !== filteredPartners.length - 1 ? 'border-b-sm' : ''"
                  >
                    <v-list-item-content>
                      <v-row justify="space-between">
                        <h5>{{ partner.company_name }}</h5>
                      </v-row>
                      <v-list-item-subtitle>
                        <p>
                          {{ partner.points_of_contact.primary.name }} -
                          {{ partner.points_of_contact.primary.email }}
                        </p>
                        <div class="mt-2 d-flex justify-end">
                          <v-chip
                            :color="partnership_stages_color_map[partner.partnership_stage]"
                            class="small_text"
                            small
                          >{{ partner.partnership_stage }}</v-chip>
                        </div>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
                <v-pagination
                  v-if="totalPages > 1"
                  class="my-4"
                  circles
                  v-model="page"
                  next-icon="mdi-chevron-right"
                  prev-icon="mdi-chevron-left"
                  :length="totalPages"
                  @input="fetchPartners"
                ></v-pagination>
              </template>

              <!-- no partners found -->
              <div class="d-flex justify-center" v-else>
                <div class="d-flex align-center">
                  <v-icon>md-close</v-icon>
                  <h4>No partners found</h4>
                </div>
              </div>
            </v-list>
            <div v-else>
              <div v-for="i in 8" :key="i">
                <v-skeleton-loader type="list-item-two-line"></v-skeleton-loader>
                <v-divider v-if="i !== 8"></v-divider>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Links Card -->
      <v-col sm="12" md="7" lg="8" class="py-0">
        <v-card class="quick-links-card mt-2" height="fit-content" variant="outlined" flat>
          <v-card-title>
            <h5 class="headline">Quick Links</h5>
          </v-card-title>
          <v-card-text class="pa-0">
            <v-row>
              <v-col class="d-flex flex-wrap">
                <v-btn
                  v-for="ps in partnershipStages"
                  :key="ps"
                  small
                  elevation="0"
                  :color="filters.partnership_stage === ps ? 'primary' : ''"
                  :outlined="filters.partnership_stage !== ps"
                  class="mr-2 my-1"
                  @click="selectPartnerShipStage(ps)"
                  rounded
                >
                  {{ ps }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-col cols="12 mt-3" v-if="selectedPartner">
          <v-row v-if="!showEditModel">
            <!-- Toolbar with Partner Info -->
            <v-col cols="12" class="pa-0">
              <v-toolbar color="primary py-4">
                <v-avatar class="my-4" color="accent" size="48">
                  <v-icon dark> mdi-handshake-outline </v-icon>
                </v-avatar>
                <v-toolbar-title class="ml-3 white--text">
                  <div class="d-flex align-center">
                    <h3 class="mr-4">{{ selectedPartner?.company_name || 'Select a Partner' }}</h3>
                    <v-chip
                      :color="partnership_stages_color_map[selectedPartner.partnership_stage]"
                      class="small_text"
                      small
                    >{{ selectedPartner.partnership_stage }}</v-chip>
                  </div>
                </v-toolbar-title>
              </v-toolbar>

              <!-- Tabs -->
              <v-tabs v-model="currentTab" background-color="primary" dark>
                <v-tab>Summary</v-tab>
                <v-tab>Points of Contact</v-tab>
                <v-tab>Documents</v-tab>
              </v-tabs>
            </v-col>

            <!-- Tab Items -->
            <v-col cols="12" class="pa-0">
              <v-tabs-items v-model="currentTab">
                <!-- Summary Tab -->
                <v-tab-item>
                  <v-card elevation="0" class="pa-5">
                    <div class="d-flex justify-space-between">
                      <v-card-title>Summary</v-card-title>
                      <v-btn
                        class="ml-1 pl-3 pr-3 align-self-end"
                        color="primary"
                        outlined
                        :height="30"
                        style="border: solid 1px #e2e7f1 !important"
                        @click="handleEditModel('summary')"
                      >
                        <span>Edit</span>
                      </v-btn>
                    </div>
                    <v-card-text>
                      <!-- Company Info -->
                      <div class="mb-4">
                        <p v-if="selectedPartner">
                          <strong>Company:</strong>
                          {{ selectedPartner.company_name }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Email:</strong>
                          {{ selectedPartner.company_email }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Headquarters:</strong>
                          {{ selectedPartner.headquarters }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Partnership Stage:</strong>
                          {{ selectedPartner.partnership_stage }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Remarks:</strong>
                          {{ selectedPartner.remarks }}
                        </p>
                        <p v-if="selectedPartner.follow_up_date">
                          <strong>Follow-up Date:</strong>
                          {{ selectedPartner.follow_up_date }}
                        </p>
                      </div>

                      <v-divider></v-divider>

                      <!-- Service Countries -->
                      <div class="my-4">
                        <p v-if="selectedPartner.peo_services_countries.length">
                          <strong>PEO Service Countries:</strong>
                          {{ selectedPartner.peo_services_countries.join(', ') }}
                        </p>
                        <p v-if="selectedPartner.eor_services_countries.length">
                          <strong>EOR Service Countries:</strong>
                          {{ selectedPartner.eor_services_countries.join(', ') }}
                        </p>
                        <p v-if="selectedPartner.eor_services_for_expats.length">
                          <strong>EOR Services for Expats:</strong>
                          {{ selectedPartner.eor_services_for_expats.join(', ') }}
                        </p>
                        <p v-if="selectedPartner.own_entity_countries.length">
                          <strong>Own Entity Countries:</strong>
                          {{ selectedPartner.own_entity_countries.join(', ') }}
                        </p>
                        <p v-if="selectedPartner.global_eor_provider_countries.length">
                          <strong>Global EOR Provider Countries:</strong>
                          {{ selectedPartner.global_eor_provider_countries.join(', ') }}
                        </p>
                      </div>

                      <v-divider></v-divider>

                      <!-- Pricing Details -->
                      <div class="my-4">
                        <p v-if="selectedPartner.pricing_details">
                          <strong>Service Fees:</strong>
                          {{ selectedPartner.pricing_details.service_fees }}
                        </p>
                        <p v-if="selectedPartner.pricing_details">
                          <strong>Contract Length:</strong>
                          {{ selectedPartner.pricing_details.contract_length }}
                        </p>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <!-- Points of Contact Tab -->
                <v-tab-item>
                  <v-card elevation="0" class="pa-5">
                    <div class="d-flex justify-space-between">
                      <v-card-title>Points of Contact</v-card-title>
                      <v-btn
                        class="ml-1 pl-3 pr-3 align-self-end"
                        color="primary"
                        outlined
                        :height="30"
                        style="border: solid 1px #e2e7f1 !important"
                        @click="handleEditModel('points of contact')"
                      >
                        <span>Edit</span>
                      </v-btn>
                    </div>
                    <v-card-text>
                      <!-- Primary POC -->
                      <div class="mb-4">
                        <p v-if="selectedPartner">
                          <strong>Primary Contact:</strong>
                          {{ selectedPartner.points_of_contact.primary.name }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Email:</strong>
                          {{ selectedPartner.points_of_contact.primary.email }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Phone:</strong>
                          {{ selectedPartner.points_of_contact.primary.phone }}
                        </p>
                      </div>

                      <v-divider></v-divider>

                      <!-- Secondary POC -->
                      <div class="my-4">
                        <p v-if="selectedPartner.points_of_contact.secondary">
                          <strong>Secondary Contact:</strong>
                          {{ selectedPartner.points_of_contact.secondary.name }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Email:</strong>
                          {{ selectedPartner.points_of_contact.secondary.email }}
                        </p>
                        <p v-if="selectedPartner">
                          <strong>Phone:</strong>
                          {{ selectedPartner.points_of_contact.secondary.phone }}
                        </p>
                      </div>

                      <v-divider></v-divider>

                      <!-- Additional POCs -->
                      <div class="my-4">
                        <p v-if="selectedPartner.points_of_contact.additional_pocs.length">
                          <strong>Additional Points of Contact:</strong>
                        </p>
                        <ul v-if="selectedPartner.points_of_contact.additional_pocs.length">
                          <li
                            v-for="(poc, index) in selectedPartner.points_of_contact.additional_pocs"
                            :key="index"
                          >
                            {{ poc.name }} - {{ poc.email }} - {{ poc.phone }}
                          </li>
                        </ul>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <!-- Documents Tab -->
                <v-tab-item>
                  <v-card elevation="0" class="pa-5">
                    <div class="d-flex justify-space-between">
                      <v-card-title>Documents</v-card-title>
                      <v-btn
                        class="ml-1 pl-3 pr-3 align-self-end"
                        color="primary"
                        outlined
                        :height="30"
                        style="border: solid 1px #e2e7f1 !important"
                        @click="handleEditModel('documents')"
                      >
                        <span>Edit</span>
                      </v-btn>
                    </div>
                    <v-card-text>
                      <ul v-if="selectedPartner && selectedPartner?.documents?.length">
                        <li
                          v-for="(document, index) in selectedPartner.documents.filter(doc => doc.url)"
                          :key="index"
                        >
                          <a v-if="document.file_name" :href="document?.url" target="_blank">{{ document?.file_name }}</a>
                        </li>
                      </ul>
                      <p v-else>No documents available.</p>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-col>

          </v-row>
          <EditModel v-if="showEditModel" :selectedPartner="selectedPartner._id" :headerTitle="headerTitle"
                     :partnersDetails="filteredPartners" @close="updatePartnerData" :handleModel="handleEditModel" />
        </v-col>
        <!-- loading selected partner -->
        <v-card class="d-flex align-center" color="card_bg" v-else elevation="0">
          <v-skeleton-loader type="image"></v-skeleton-loader>
        </v-card>
      </v-col>

      <!-- Partner Preview -->

      <!-- Filter Dialog -->
      <v-dialog v-model="showFilterDialog" max-width="800">
        <v-card class="pa-5">
          <v-card-title class="headline">
            <h3 class="px-2 mb-4">Filter Partners</h3>
          </v-card-title>
          <v-card-text>
            <v-row>
              <!-- Company Name Filter -->
              <v-col cols="12">
                <v-text-field
                  v-model="filters.company_name"
                  label="Company Name"
                  clearable
                  outlined
                  dense
                  persistent-placeholder
                ></v-text-field>
              </v-col>

              <!-- Company Email Filter -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="filters.company_email"
                  label="Company Email"
                  clearable
                  outlined
                  dense
                  persistent-placeholder
                ></v-text-field>
              </v-col>

              <!-- Partnership Stage Filter -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="filters.partnership_stage"
                  :items="partnershipStages"
                  label="Partnership Stage"
                  clearable
                  persistent-placeholder
                  outlined
                  dense
                ></v-select>
              </v-col>

              <!-- Headquarters Filter -->
              <v-col cols="12" md="6">
              <v-combobox
                 v-model="filters.headquarters"
                 :items="computedCountryList"
                label="Headquarters"
                  clearable
                 persistent-placeholder
                  outlined
                  dense
                ></v-combobox>
              </v-col>

              <!-- PEO Services Countries -->
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="filters.peo_services_countries"
                  :items="computedCountryList"
                  label="PEO Services Countries"
                  multiple
                  clearable
                  outlined
                  dense
                  persistent-placeholder
                ></v-combobox>
              </v-col>

              <!-- EOR Services Countries -->
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="filters.eor_services_countries"
                  :items="computedCountryList"
                  label="EOR Services Countries"
                  multiple
                  outlined
                  dense
                  clearable
                  persistent-placeholder
                ></v-combobox>
              </v-col>

              <!-- EOR Services for Expats Countries -->
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="filters.eor_services_for_expats"
                  :items="computedCountryList"
                  label="EOR Services for Expats Countries"
                  multiple
                  clearable
                  outlined
                  dense
                  persistent-placeholder
                ></v-combobox>
              </v-col>

              <!-- Own Entity Countries -->
              <v-col cols="12" md="6">
                <v-combobox
                  v-model="filters.own_entity_countries"
                  :items="computedCountryList"
                  label="Own Entity Countries"
                  multiple
                  outlined
                  dense
                  clearable
                  persistent-placeholder
                ></v-combobox>
              </v-col>

              <!-- Follow-Up Date Filter -->
              <v-col cols="12" md="6">
                <v-menu
                  v-model="filters.follow_up_date_menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="filters.follow_up_date"
                      label="Follow-Up Date"
                      readonly
                      outlined
                      dense
                      v-bind="attrs"
                      v-on="on"
                      persistent-placeholder
                      clearable
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="filters.follow_up_date"
                    no-title
                    scrollable
                    @input="filters.follow_up_date_menu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="justify-end mb-4">
            <v-row>
              <v-col class="d-flex justify-end">
                <v-btn text @click="resetFilters">Reset</v-btn>
                <v-btn
                  elevation="0"
                  color="primary"
                  rounded
                  @click="applyFilters"
                >Apply
                  <v-icon small>mdi-filter</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
import countries from "countries-list";
import EditModel from '~/components/EditModel/editPartners.vue'
import PartnersInsight from '@/components/Partners/PartnersInsight.vue'

export default {
  components: {
    EditModel,
    PartnersInsight,
  },
  data() {
    return {
      authStr: 'Bearer '.concat(this.$store.state.token),
      currentTab: 0,
      isSubmitting: false,
      loaders: {
        all_partners: true,
        selected_partner: true,
      },
      partners: null,
      partnerCategories: ['All', 'Inside USA', 'Outside USA'],
      selectedCategory: 'All',
      filteredPartners: null,
      selectedPartnerId: null,
      selectedPartner: null,
      selectedPartner2: null,
      partnership_stages_color_map: {
        Contacted: 'primary text--darken-1',
        'Discussion In Process': 'deep-purple white--text',
        'Signed Partnership': 'accent',
        'Successful Partnership': 'green white--text',
        'Unsuccessful Partnership': 'warning',
      },
      filters: {
        company_name: '',
        company_email: '',
        partnership_stage: null,
        headquarters: null,
        peo_services_countries: [],
        eor_services_countries: [],
        eor_services_for_expats: [],
        own_entity_countries: [],
        follow_up_date: null,
        follow_up_date_menu: false, // For the date picker
      },
      menu: false,
      searchQuery: '',
      showFilterDialog: false,
      page: 1,
      limit: 30,
      countries: [],
      totalPages: 0,
      sortBy: 'createdAt',
      sort: -1, // Default sort order
      partnershipStages: [
        'Contacted',
        'Discussion In Process',
        'Signed Partnership',
        'Successful Partnership',
        'Unsuccessful Partnership',
      ],
      headerTitle: '',
      showEditModel: false,
      main_rule: [(v) => !!v || 'This filed is required'],
    }
  },

  methods: {

    selectPartner(id) {
      this.loaders.selected_partner = true

      this.selectedPartner = this.filteredPartners.find(
        (partner) => partner._id === id
      )

      this.loaders.selected_partner = true
    },

    // filterPartnerShipStage() {},

    // addNewPartner() {
    //   // Add new partner logic here
    // },
    selectPartnerShipStage(stage) {
      this.filters.partnership_stage = stage
      this.fetchPartners()
    },
    async resetFilters() {
      this.filters = {
        company_name: '',
        company_email: '',
        partnership_stage: null,
        headquarters: null,
        peo_services_countries: [],
        eor_services_countries: [],
        eor_services_for_expats: [],
        own_entity_countries: [],
        follow_up_date: null,
        follow_up_date_menu: false,
      }
      this.page = 1
      await this.fetchPartners() // Re-fetch all partners without filters
      this.showFilterDialog = false
    },
    async fetchPartners() {
      // Construct the query parameters based on filters
      const params = new URLSearchParams()
      this.loaders.all_partners = true
      this.selectedPartner = null

      // Company Name, Email, Headquarters, and Partnership Stage
      if (this.filters.company_name)
        params.append('company_name', this.filters.company_name)
      if (this.filters.company_email)
        params.append('company_email', this.filters.company_email)
      if (this.filters.partnership_stage)
        params.append('partnership_stage', this.filters.partnership_stage)
      if (this.filters.headquarters)
        params.append('headquarters', this.filters.headquarters)

      // Convert array of countries to comma-separated strings for multiple selections
      if (this.filters.peo_services_countries.length) {
        params.append(
          'peo_services_countries',
          this.filters.peo_services_countries.join(',')
        )
      }
      if (this.filters.eor_services_countries.length) {
        params.append(
          'eor_services_countries',
          this.filters.eor_services_countries.join(',')
        )
      }
      if (this.filters.eor_services_for_expats.length) {
        params.append(
          'eor_services_for_expats',
          this.filters.eor_services_for_expats.join(',')
        )
      }
      if (this.filters.own_entity_countries.length) {
        params.append(
          'own_entity_countries',
          this.filters.own_entity_countries.join(',')
        )
      }

      // Follow-Up Date
      if (this.filters.follow_up_date) {
        params.append('follow_up_date', this.filters.follow_up_date)
      }

      // Additional query params
      params.append('page', this.page)
      params.append('limit', this.limit)
      params.append('sortBy', this.sortBy)
      params.append('sort', this.sort)

      try {
        const response = await this.$axios.$get(
          `/partners?${params.toString()}`,
          {
            headers: { Authorization: this.authStr },
          }
        )
        this.filteredPartners = this.partners = response?.data
        this.totalPages = Math.ceil(response.totalCount / this.limit)
        if (this.partners[0]?._id) this.selectPartner(this.partners[0]?._id)
      } catch (error) {
        console.error('Error fetching partners:', error)
      }
      this.loaders.all_partners = false
    },
    applyFilters() {
      this.fetchPartners() // Fetch partners based on filters
      this.showFilterDialog = false
    },
    selectPartner(id) {
      this.selectedPartner = this.filteredPartners.find(
        (partner) => partner._id === id
      )
    },
    async searchPartners(query) {
      try {
        const encodedQuery = encodeURIComponent(query)
        const partners = await this.$axios.get(`/partners?search=${encodedQuery}`)
        console.log("What are the partners", partners)
        this.filteredPartners = partners.data.data

      } catch (error) {
        console.error('Search error:', error)

        this.filteredPartners = []
      }
    },
    handleEditModel(title) {
    console.log("What is the title", title)
    this.headerTitle = title
    this.showEditModel = !this.showEditModel

  },
    updatePartnerData() {
      this.showEditModel = !this.showEditModel
      this.headerTitle = ''
      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Details Has Been Updated Successfully.'
    }
  },
  async mounted() {
    await this.fetchPartners()
  },
  computed:{
    route_to() {
      return {
        path: this.$route.path.includes('add') ? '/partners/all' : '/partners/add',
        text: this.$route.path.includes('add') ? 'All Partners':'Add Partner',
        icon: this.$route.path.includes('add') ? 'handshake':'plus',
      }
    },
    computedCountryList() {
      const countryCodes = Object.keys(countries.countries);
      const countryNames = countryCodes.map(code => countries.countries[code].name);
      return _.orderBy(countryNames, [], ['asc']);
    },
  }
}
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
}
.v-list-item--active {
  background-color: #f5f5f5;
}
.border-b-sm {
  border-bottom: 1px solid #eee;
}
.quick-links-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.headline {
  font-weight: bold;
  font-size: 1.25rem;
}
</style>
