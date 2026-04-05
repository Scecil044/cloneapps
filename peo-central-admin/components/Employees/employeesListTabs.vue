<template>
    <div>
      <v-row class="Leads_list_wrapper">
       
        <!-- list column -->
        <v-col sm="12" md="12" lg="12">
          <v-card color="card_bg" id="card" style="min-height: 90vh !important">
            
            <div class="d-flex align-center justify-space-between " style="width: 100% !important;" >
            <Tabs
              @tabValue="handleTabValue($event)"
              :data="emp_tabs.emp"
            />
            <v-btn   class="short__btn " color="primary">New</v-btn>
          </div>
          <v-divider id="divider" class="mb-3"></v-divider>
            <!-- Search Bar -->
            <div class="flex_row align-center top_barCustomer">
              <div class="search__bar">
                <v-text-field
                v-model="searchQuery"
                  class="ml-1"
                  label="Search"
                  solo
                  flat
                  hide-details
                  background-color="#f9fafc"
                >
                </v-text-field>
              </div>
            </div>
            <v-card-text
              id="card-text2"
              style="max-height: 68vh"
              class="dl__list overflow-y-auto"
            >
              <v-list class="customers_list__con">
                <v-list-item-group>
                  <v-list-item
                    class="pa-0"
                    v-for="(item, index) in employeeListData"
                    :key="index"
                  >
                    <v-list-item-icon class="mx-1">
                      <v-img
                        :src="item.logo"
                        style="border-radius: 50px"
                        width="60"
                        height="60"
                        v-if="item.logo"
                      />
                      <customerDefaultIcon style="border-radius: 50px" v-else />
                    </v-list-item-icon>
                    <v-list-item-content
                      class="d-flex justify-md-space-between align-center"
                    >
                      <v-list-item-title class="ml-3">
                        <h5>{{ item.emp_name }}</h5>
                      </v-list-item-title>
                    </v-list-item-content>

                    <div class=" lead_list_chip  d-flex align-center justify-center ">
                            <span
                    class="  table_btn light_accent3 accent3--text"
                    v-if="item.emp_status == 'Pending'"
                    >{{ item.emp_status }}</span>
                    <span
                    class=" d-flex align-center justify-center table_btn light_accent4 accent4--text"
                    v-if="item.emp_status == 'Approved'"
                    >{{ item.emp_status }}</span>
                            <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                      
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn v-bind="attrs" v-on="on" color="subtext" icon>
                          <v-icon small 
                            >fa-solid fa-ellipsis-vertical</v-icon
                          ></v-btn
                        >
                      </template>
                    </v-menu>
                    </div>
                 
                    
                  </v-list-item>

                </v-list-item-group>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
  </template>
  <script>
  import '@/assets/scss/utils/_allLeadsList.scss'

  import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
  import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
  import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
  import EditSvg from '@/assets/images/Customer/edit.svg'
  import CalenderSvg from '@/assets/images/icons/calender.svg'
  import filterIcon from '@/assets/images/Customer/filterIcon.svg'
  import Tabs from '@/components/Tabs/index.vue'
 
  
  export default {
    components: {
      customerDefaultIcon,
      DarkArrow,
      Tabs,
     
    
      EditSvg,
      filterIcon,
      CalenderSvg,
      LightArrow,
    },
    props: { 
      employeeListData: Array,
            selectedCustomer : Object,
            showNewLeadButton: Boolean,
             },
    data() {
      return {
        
        // leads dialog Buttons 
        new_Lead_menu: [
        { title: 'All Leads' },
        { title: 'New Leads' },
        { title: 'Contacted' },
        { title: 'Not Contacted' },
      ],
        
      //filtering List Customers
      searchQuery: '',
  
        // APIs Data
        companiesList: [],
       
        //date pickers
        datefrom: new Date().toISOString().substr(0, 10),
        dateto: new Date().toISOString().substr(0, 10),
        dateFrom: null,
        dateTo: null,
        date: '',
        filterDialog: false,
        //Tabs Data
        tab_current_val: 'all',
        emp_tabs: {
          emp: [
            { title: 'Leaves', value: 'all' },
            { title: 'Letter', value: 'letter' },
        
          ],
        },
      }
    },
    methods: { 
      
       //  getCompaniesList
       async getCompaniesList() {
        let data = await this.$axios
          .$get('/companies/')
          .then((res) => {
            // this.page++;
            // if (res.request) {
            this.companiesList = res
            // page.value++
            //   }
            // console.log('companies list aya na=>123', this.companiesList)
          })
          .catch((err) => console.log(err))
      },
  
      handleTabValue(payload) {
        // Setting the payload value
        // emit => payload

        this.tab_current_val = payload
        this.$emit('tabsEmployee', this.tab_current_val);
        // console.log('Emitted Value from HeaderTabs Component  ==> ', payload)
        // Setting the payload value
        // this.tab_current_val = payload
        // Setting the payload value in the localStorage under name selected_tab
        // localStorage.setItem('selected_tab', payload)
        // Emitting an event call tabChanged with the tab current value
        // this.$nuxt.$emit('tabChanged', payload)
      },
     
    },
    mounted() {
      this.getCompaniesList()
    },
   
  }
  </script>
  