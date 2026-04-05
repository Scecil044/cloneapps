<template>
  <v-dialog v-model="dialogStatus" class="ma-0 pa-0" max-width="500">
    <v-card id="card">
      <v-card-title id="card-title"
        >
        Sure you want to {{ status === 1 ? 'Inactive' : 'active' }} this
        {{ name }}?</v-card-title
      >
      <v-card-text id="card-text">
        <div class="flex_row">
          <v-spacer />
          <v-btn
            class="tall__btn"
            color="subtext"
            outlined
            @click="handleCloseStatus"
            >No</v-btn
          >
          <v-btn
            class="tall__btn ml-3"
            color="error"
            @click="handleStatus"
          >
            <v-icon color="white" class="mr-2" small>fa-check</v-icon>
            Yes
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['status', 'dialogStatus', 'name'],
  methods: {
    handleCloseStatus() {
      this.$emit('handleCloseStatus')
    },
    handleStatus() {
      this.$emit('handleStatus')
    },
  },
}
</script>

<style></style>
