<template>
  <div>

    <NewEmail :type="'new'" @close="addNewMail = false" @updated="updatedMail()" v-if="addNewMail" />

    <v-row>
      <!-- list column -->
      <v-col sm="12" md="12" lg="12">
        <v-card color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-title id="card-title" class="mb-4">
            <!-- Search Bar -->
            <div class="d-flex align-center justify-space-between top_barMail">
              <div class="search__bar">
                <v-text-field v-model="searchQuery" class="ml-1" label="Search" solo dense flat hide-details
                  background-color="searchbar" @input="handleSearchFilter(searchQuery)">
                  <template v-slot:prepend>
                    <div class="">
                      <SearchIcon />
                    </div>
                  </template>
                </v-text-field>
              </div>

              <div class="d-flex align-center justify-end" v-if="currentTab == 'Inbox'">
                <v-btn @click="sendNewMail()" class="tall__btn" color="primary">New</v-btn>
              </div>
            </div>
          </v-card-title>
          <div class="dl__list">
            <v-card-text id="card-text2" style="max-height: 65vh" class="">
              <!-- mail Inbox -->
              <v-list class="customers_list__con">
                <v-list-item-group>
                  <v-list-item class="pa-0" v-for="(item, index) in emailInboxList" :key="index">
                    <v-list-item-content class="d-flex justify-md-space-between align-center">
                      <v-list-item-title class="ml-3 d-flex align-center justify-space-between">
                        <div @click="ClickedSender(item)">
                          <h5 class="mb-3">{{ truncateText(item.sender_name, MAX_SENDER_NAME) }}</h5>
                          <span class="span_text">{{ truncateText(item.subject, MAX_SUBJECT_LENGTH) }}</span>
                        </div>

                        <div class="pr-1 lead_list_chip d-flex flex-column align-center justify-end"
                          style="width: 130px !important">
                          <div class="d-flex align-center mb-2">
                            <span class="span_subtext mr-3">{{ item.day }}</span>
                            <span class="span_text">{{ item.time }}</span>
                          </div>
                          <div class="d-flex align-center justify-end">
                            <!-- <FlagSvg class="mr-4" /> -->  <!-- FLAG AS IMPORTANT OPERATION NOT PROVIDED MY MICROSOFT -->
                            <DeleteSvg @click="deleteMail(item.id)" />
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
import NewEmail from '~/pages/Email/newmail.vue'

export default {
  components: {
    filterIcon,
    SearchIcon,
    SortDescending,
    FlagSvg,
    DeleteSvg,
    Observer,
    NewEmail
  },
  props: { newMailInboxList: Array, currentTab: String, folder_id: String },
  data() {
    return {
      searchQuery: '',
      emailInboxList: this.newMailInboxList,
      MAX_SUBJECT_LENGTH: 30,
      MAX_SENDER_NAME: 25,
      addNewMail: false,
    }
  },
  methods: {
    sendNewMail() {
      this.addNewMail = true
    },
    ClickedSender(value) {
      this.$emit('ClickedSender', value)
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) {
        return text;
      } else {
        return text.substring(0, maxLength) + '...';
      }
    },
    async handleSearchFilter(text) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let URLParams = new URLSearchParams()
      URLParams.append("search",encodeURIComponent(text))
      await this.$axios.$get(`/graph/mail/searchMail?${URLParams.toString()}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          // console.log(response.data.value, '----------------search')

          this.emailInboxList = response.data.value.map((msg) => {

            const currentTime = new Date();
            const sentTime = new Date(msg.sentDateTime);
            const currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
            const sentDate = new Date(sentTime.getFullYear(), sentTime.getMonth(), sentTime.getDate());
            const timeDiff = Math.floor((currentDate - sentDate) / (1000 * 60 * 60 * 24));

            let day;
            if (timeDiff === 0) {
              day = 'Today';
            } else if (timeDiff === 1) {
              day = 'Yesterday';
            } else if (timeDiff === -1) {
              day = 'Tomorrow';
            } else {
              day = sentDate.toLocaleDateString('en-US', { weekday: 'long' });
            }

            let toRecipient = ''
            if (msg.toRecipients?.length > 0) {
              toRecipient = msg.toRecipients[0]?.emailAddress.name;
            } else {
              toRecipient = '-'
            }

            let ccRecipient = ''
            if (msg.ccRecipients?.length > 0) {
              ccRecipient = msg.ccRecipients[0]?.emailAddress.name;
            } else {
              ccRecipient = '-'
            }

            return {
              id: msg.id,
              sender_name: msg.sender.emailAddress.name,
              subject: msg.subject,
              time: new Date(msg.sentDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              day: day,
              to: toRecipient,
              cc: ccRecipient
            };
          });

          // searchResult = this.emailInboxList
          // this.ClickedSender(this.emailInboxList[0])
        })
    },
    updatedMail() {
      this.addNewMail = false
    },
    async deleteMail(mail_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$delete(`/graph/mail/${mail_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.$emit('fetchUpdatedList', this.folder_id)

        })

    }
  },
  mounted() {
    this.ClickedSender(this.emailInboxList[0])
    // console.log(this.newMailInboxList, '----------------newMailInboxList props')
  },
}
</script>
