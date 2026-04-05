<template>
  <LeadDetails v-if="module == 'leads'" :process_id="process_id" />
  <OnboardingDetails v-else-if="module == 'onboardings'" :process_id="process_id" />
  <OffboardingDetails v-else-if="module == 'offboardings'" :process_id="process_id" />
  <RenewalsDetails v-else-if="module == 'renewals'" :process_id="process_id" />

</template>

<script>
import LeadDetails from './LeadDetails.vue';
import OnboardingDetails from './OnboardingDetails.vue';
import OffboardingDetails from './OffboardingDetails.vue';
import RenewalsDetails from './renewalsDetails.vue';


export default {
  components: {
    LeadDetails,
    OnboardingDetails,
    OffboardingDetails, 
    RenewalsDetails
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
