<template>
    <v-row >
        <v-col cols="12" md="12" lg="12" class="pr-0">
          <LeadsTopCard :LeadsCardData="UnsuccessfulCardData" :conversionRateDetails="conversionRateDetails" :loading="conversionRateLoading"/>
        </v-col>
        <v-col cols="12" md="4" lg="4" class="pl-0 pr-0 pt-0">
            <AllLeadsList :showNewLeadButton="false" :status="status" :leadsMenu="true" @UnsuccessfulLeadsListClicked="clickedDetailLeads($event)" @fetchedUnsuccessfulLeads="clickedLoadingLeads($event)" />
        </v-col>
        <v-col cols="12" md="8" lg="8" class="pl-0 pr-0 pt-0">
            <UnsuccessfulLeadDetails :selectedLeads="selectedLeads" v-if="ShowDetails" />
        </v-col>
    </v-row>
</template>
<script>
import AllLeadsList from '~/components/Leads/AllUnsuccessfullLeadsList.vue'
import LeadsTopCard from '~/components/Cards/LeadsTopCard/unsuccessfullTopCard.vue'
import UnsuccessfulLeadDetails from '@/components/Leads/UnsuccessfulLeadDetails.vue'


export default {
    components: {
        LeadsTopCard,
        AllLeadsList,
        UnsuccessfulLeadDetails

    },
    data() {
        return {
            showNewLeadButton: true,
            status: 'received',
            UnsuccessfulCardData: [
                {
                    title: 'Conversion Rate',
                    cardVal: '15%', // Fallback value, will be updated dynamically
                },
            ],
            limit: '10',
            page: 0,
            selectedLeads:'',
            ShowDetails: false,
            conversionRateDetails: null,
            conversionRateLoading: false,
        }
    },
    methods: {
        async fetchConversionRate() {
            try {
                this.conversionRateLoading = true;
                const AuthStr = 'Bearer '.concat(this.$store.state.token);

                const response = await this.$axios.$get('/leads/conversion-rate', {
                    headers: { Authorization: AuthStr }
                });

                if (response) {
                    this.conversionRateDetails = response;
                    // Update the card data with dynamic conversion rate
                    this.UnsuccessfulCardData[0].cardVal = `${Math.round(response.conversion_rate)}%`;
                }
            } catch (error) {
                console.warn('Failed to fetch conversion rate:', error);
                // Keep the fallback value if API fails
                this.conversionRateDetails = null;
            } finally {
                this.conversionRateLoading = false;
            }
        },
        clickedLoadingLeads($event) {
            this.page = 1

            const params = $event
            const AuthStr = 'Bearer '.concat(this.$store.state.token)

            this.$axios.$post(`/leads/unsuccessful/search/filter?page=${this.page}&limit=${this.limit}`, params, { headers: { Authorization: AuthStr } })
            .then((response) => {
                this.$nuxt.$emit("receivedUnsuccessfulLeads", response.results)
            })
        },
        clickedDetailLeads($event){
            this.selectedLeads = $event
            this.ShowDetails = false
            setTimeout(() => {
                this.ShowDetails = true
            }, 1);
        }
    },
    async mounted() {
        // Fetch conversion rate when component mounts
        await this.fetchConversionRate();
    }
}
</script>
