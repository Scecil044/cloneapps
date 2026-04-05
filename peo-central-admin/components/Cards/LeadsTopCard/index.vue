<template>
  <div class=" pa-1 d-flex align-center " style=" gap: 8px; width: 100% !important; ">
    <v-card v-for="(cards, index) in LeadsCardData" :key="index" color="card_bg" class="lead_card"
      style="border: 0.5px solid #e2e7f1 !important">
      <div class="flex_row ">
        <div class="icon__container ml-3 mr-3">
          <h1>
            {{ cards.cardVal }}
          </h1>
        </div>
        <div class="flex_column">
          <span class="subtext--text pt-3" style="max-width: 97px !important">{{ cards.title }}
          </span>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    LeadsCardData: Array
  },
  data() {
    return {


    }
  },
}
</script>
