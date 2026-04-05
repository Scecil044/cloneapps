<template>
    <!-- <v-row class="leads_wrapper"> -->
        <AllRenewals />
    <!-- </v-row> -->
</template>
<script>


import AllRenewals from '~/components/RenewalRequest/allRenewals.vue';


export default {
    layout: 'dashboard',
    components: {
        AllRenewals
    },
    data() {
        return {

        }
    }
}

</script>


<style></style>