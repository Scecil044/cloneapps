<template>
    <div>
      <v-row>
        <!-- list column -->
        <v-col sm="12" md="12" lg="12">
          <v-card color="card_bg" id="card" style="min-height: 90vh !important">
            <v-card-title id="card-title" class="mb-4">
                <!-- Search Bar -->
                <div class="d-flex align-center justify-space-between top_barMail"
                >
                  <div class="search__bar">
                    <v-text-field
                      v-model="searchQuery"
                      class="ml-1"
                      label="Search"
                      solo
                      dense
                      flat
                      hide-details
                      background-color="searchbar"
                    >
                      <template v-slot:prepend>
                        <div class="">
                          <SearchIcon />
                        </div>
                      </template>
                    </v-text-field>
                  </div>
                  
                <!-- <div
                  class="d-flex align-center justify-end"
                  
                >
                  
                  <v-btn  @click="sendNewMail()"  class="tall__btn " color="primary">New</v-btn>
                </div> -->
                </div>
  
              
            </v-card-title>
  
            <div class="dl__list">
              <v-card-text id="card-text2" style="max-height: 65vh" class="">
                <!-- mail Inbox -->
                <v-list class="customers_list__con">
                  <v-list-item-group>
                    <v-list-item
                      class="pa-0"
                      v-for="(item, index) in emailInboxList"
                      :key="index"
                    >
                      <v-list-item-content
                        class="d-flex justify-md-space-between align-center"
                      >
                        <v-list-item-title class="ml-3 d-flex align-center justify-space-between">
                          <div  
                          @click="ClickedSender(item)"   >
                            <h5 class="mb-3">{{ item.sender_name }}</h5>
                          <span class="span_text">{{ item.subject }}</span>
                          </div>
                          
                          <div
                        class="pr-1 lead_list_chip d-flex flex-column align-center justify-end"
                        style="width: 130px !important"
                      >
                        <div class="d-flex align-center mb-2">
                          <span class="span_subtext mr-3">{{ item.day }}</span>
  
                          <span class="span_text">{{ item.time }}</span>
                        </div>
                        <div class="d-flex align-center justify-end">
                          <FlagSvg class="mr-4" />
                          <DeleteSvg />
                        </div>
                      </div>
                        </v-list-item-title>
                      
                        <v-divider></v-divider>
                      </v-list-item-content>
                     
                    </v-list-item>
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
  //   import '@/assets/scss/utils/_customerListDetails.scss'
  import DeleteSvg from '@/assets/images/icons/delete-icon.svg'
  import FlagSvg from '@/assets/images/icons/flag.svg'
  import SortDescending from '@/assets/images/icons/sort-descending-icon.svg'
  import SearchIcon from '@/assets/images/icons/search-icon.svg'
  import filterIcon from '@/assets/images/Customer/filterIcon.svg'
  import Observer from '~/components/Observer.vue'
  
  export default {
    components: {
      filterIcon,
      SearchIcon,
      SortDescending,
      FlagSvg,
      DeleteSvg,
      Observer,
    },
    data() {
      return {
        searchQuery: '',
        emailInboxList: [
          {
            sender_name: 'Sam Albert',
            subject: 'MOL Signature',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam tokyo',
            subject: 'MOL Assignment',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Rio Albert',
            subject: 'Nathan Digital',
            time: '10:40 AM',
            day: 'yesterday',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam Albert',
            subject: 'MOL Signature',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam tokyo',
            subject: 'MOL Assignment',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Rio Albert',
            subject: 'Nathan Digital',
            time: '10:40 AM',
            day: 'yesterday',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam Albert',
            subject: 'MOL Signature',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam tokyo',
            subject: 'MOL Assignment',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Rio Albert',
            subject: 'Nathan Digital',
            time: '10:40 AM',
            day: 'yesterday',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam Albert',
            subject: 'MOL Signature',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam tokyo',
            subject: 'MOL Assignment',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Rio Albert',
            subject: 'Nathan Digital',
            time: '10:40 AM',
            day: 'yesterday',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam Albert',
            subject: 'MOL Signature',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam tokyo',
            subject: 'MOL Assignment',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Rio Albert',
            subject: 'Nathan Digital',
            time: '10:40 AM',
            day: 'yesterday',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam Albert',
            subject: 'MOL Signature',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Sam tokyo',
            subject: 'MOL Assignment',
            time: '10:40 AM',
            day: 'Today',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
          {
            sender_name: 'Rio Albert',
            subject: 'Nathan Digital',
            time: '10:40 AM',
            day: 'yesterday',
            to: 'Mohamed Ishaque (me)',
            cc: 'Junaid Mohamed, Zubair, Ninad Jadav',
          },
        ],
      }
    },
    methods: {
      //Send New Mail
      sendNewMail() {
        this.$router.push('/Email/newMail')
      },
      //sender clicked
      ClickedSender(value) {
        this.$emit('ClickedSender', value)
        // console.log( 'mail clicked sent', this.value);
      },
    },
    mounted() {
      this.ClickedSender(this.emailInboxList[0])
    },
  }
  </script>
  