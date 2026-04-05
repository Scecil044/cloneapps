<template>
  <div style="width: 100% !important;">
    <BillingsCreditNoteWrapper />
  </div>
</template>
<script>
import BillingsCreditNoteWrapper from '@/components/Billings/billingsCreditNoteWrapper.vue'

export default {
  components: {
    BillingsCreditNoteWrapper,
  },
  data() {
    return {
      creditNoteCount: [],
      showCounts: false,
    }
  },
  mounted(){
    // Future: Add credit note counts if needed
  },
  methods:{
    // Future: Add credit note count methods if needed
  }
}
</script>

