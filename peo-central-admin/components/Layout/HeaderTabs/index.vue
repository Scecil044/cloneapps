<template>
  <v-tabs class="tabs__heder ma-0 pa-0">
    <v-tab class="tabs__header_sing" v-for="item in data" :key="item.value" @click.native="handleClick(item.value)">
      <InboxIcon class="mr-1" v-if ="item.value == 'inboxEmail'" />
      <SendIcon class="mr-1" v-if ="item.value == 'sentEmail'" />
      <span class="font-weight-bold">{{ item.title }}</span>
      </v-tab>
  </v-tabs>
</template>

<script>
import InboxIcon from '@/assets/images/DashboardLayout/inbox.svg'
import SendIcon from '@/assets/images/DashboardLayout/send.svg'
export default {
  components:{
    InboxIcon,
    SendIcon,
  },
    props: { data: Array },
    data() {
        return {
          isActive: false,
            tab_val: 'all',
        }
    },
    methods: {

        handleClick(payload) {
            this.tab_val = payload
            this.$emit('tabValue', this.tab_val)
        },
  },
  methods: {
    handleClick(payload) {
      this.tab_val = payload
      this.$emit('tabValue', this.tab_val)
    },
  },
}
</script>

<style>
.tabs__heder {
  min-width: fit-content !important;
  max-width: 60rem !important;
}
@media screen and (min-width: 1537px) {
  .tabs__header .v-item-group {
    margin-bottom: -16px;
  }
}
</style>
