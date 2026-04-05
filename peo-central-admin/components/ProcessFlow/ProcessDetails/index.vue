<template>
  <LeadDetails v-if="module == 'leads'" :process_id="process_id" >
    <slot />
  </LeadDetails>
  <OnboardingDetails v-else-if="module == 'onboardings'" :process_id="process_id" />
  <OffboardingDetails @onCompanyIds="($event) => $emit('onCompanyIds',$event)" v-else-if="module == 'offboardings'" :process_id="process_id" />
</template>

<script>
import LeadDetails from './LeadDetails.vue';
import OnboardingDetails from './OnboardingDetails.vue';
import OffboardingDetails from './OffboardingDetails.vue';

export default {
  components: {
    LeadDetails,
    OnboardingDetails,
    OffboardingDetails
  },
  props: {
    module: String,
    process_id: String,
  },
  data() {
    return {}
  },
  methods: {
  }
}
</script>
