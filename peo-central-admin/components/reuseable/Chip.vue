<template>
  <v-tooltip top :color="'light_accent2 ' + tooltipColor">
    <template v-slot:activator="{ on, attrs }">
      <v-chip
        v-bind="attrs"
        v-on="on"
        :class="
          'd-flex align-center px-2 py-sm justify-center white--text ' +
          chipClass
        "
        x-small
      >
        <span class="chip__custom">
          <slot></slot>
        </span>
      </v-chip>
    </template>
    {{ tooltipText }}
  </v-tooltip>
</template>

<script>
export default {
  props: {
    tooltipColor: {
      type: String,
      default: 'purple white--text',
    },
    tooltipText: String,
    chipClass: {
      type: String,
      default: 'purple',
    },
  },
  data() {
    return {}
  },
}
</script>

<style>
.py-sm {
  padding-top: 0.7rem !important;
  padding-bottom: 0.7rem !important;
}
</style>
