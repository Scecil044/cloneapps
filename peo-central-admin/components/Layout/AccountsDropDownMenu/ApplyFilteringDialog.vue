<template>
  <v-row justify="center">
    <v-dialog v-model="applyFiltering" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          Apply
          <!-- <h5 v-for="item in selection" :key="item.id" class="mx-2">
            {{ item.name }},
          </h5> -->
          filters?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="$emit('close')"> No </v-btn>
          <v-btn color="primary darken-1" text @click="applyFilter">
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  props: ['applyFiltering', 'selection'],
  methods: {
    applyFilter() {
      this.$emit('apply');
    },
  },
}
</script>
