<template>
  <!-- Billings  Dialog -->
  <v-dialog id="custom_dialog" v-model="open" persistent width="80vw" height="100vh" content-class="proposal_dialog">
    <div class="dialog_proposal">
      <OffboardingCreateNewOffboarding @close="closeDialog"  :is_modal="true"
        :selectedRenewal="selectedRenewal" :reason_for_unsuccessful="reason_for_unsuccessful" />
    </div>
  </v-dialog>
</template>

<script>

export default {
  props: {
    open: Boolean,
    reason_for_unsuccessful: String,
    selectedRenewal: Object,
  },
  data() {
    return {}
  },
  methods: {
    closeDialog() {
      this.$emit('close');
    },
  },
}
</script>
<style lang="scss"></style>
