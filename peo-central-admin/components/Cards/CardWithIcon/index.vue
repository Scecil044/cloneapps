<template>
  <div class="flex_row d-flex flex-wrap mt-3 pb-3 pa-1" style="gap: 1rem">
    <v-card
      color="card_bg"
      class="small_card"
      v-for="item in data"
      :key="item.name"
      style="border: 0.5px solid #e2e7f1 !important"
    >
      <div class="flex_row justify-space-around">
        <div class="icon__container lighten-5 mr-2" :class="item.color">
          <BankingIcon :color="item.color" />
        </div>
        <div class="flex_column">
          <span class="subtext--text"
            >{{ item.name }}&nbsp;<span class="font-weight-thin">Balance</span>
          </span>
          <h1>
            {{ item.amount }}
            <span class="caption subtext--text font-weight-thin pl-1">AED</span>
          </h1>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import BankingIcon from '@/assets/images/DashboardLayout/Banking-icon copy.svg'
export default {
  props: { data: Array },
  components: { BankingIcon },
}
</script>
