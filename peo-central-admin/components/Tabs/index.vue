<template>
  <v-tabs v-model="tab_val" :class="custom_class ? custom_class : 'tabs_wrapper'">
    <v-tab
      class="tabs_single"
      v-for="item in data"
      :key="item.value"
      @click.native="handleClick(item.value)"
      :href="getTabName(item.value)"
      >{{ item.title }}</v-tab
    >
  </v-tabs>
</template>

<script>
export default {
  props: { 
    data: Array, 
    tab_value:String,
    custom_class: String
  },
  data() {
    return {
      tab_val: this.tab_value,
    }
  },
  methods: {
    getTabName(val) {
      return( '#'+val.toLowerCase())
    },
    handleClick(payload) {
      this.tab_val = payload
      this.$emit('tabValue', payload)
    },
  },
  mounted(){
    // console.log(this.tab_value,'--------this.tab_value',this.tab_val)
  }
}
</script>

<style>
@media screen and (min-width: 1537px) {
  .tabs__header .v-item-group {
    margin-bottom: -16px;
  }
}
</style>
