<template>
    <v-row>
        <v-col cols="12" class="pt-0 pb-0">
            <InsightCard class="mb-6" :data="detailsCard" v-if="showDetails"/>
        </v-col>
    </v-row>
</template>

<script>
import InsightCard from '~/components/Cards/InsightCard/index.vue'
import EditSvg from '@/assets/images/Customer/edit.svg'

export default {
    props: {
        
    },
    components: {
        InsightCard,
        EditSvg,
    },
    data() {
        return {
            detailsCard: [
                {
                    status: 'Contacted',
                    count:''
                },
                {
                    status: 'Discussion In Process',
                    count:''
                },
                {
                    status: 'Signed Partnership',
                    count:''
                },
                {
                    status: 'Successful Partnership',
                    count:''
                },
                {
                    status: 'Unsuccessful Partnership',
                    count:''
                },
            ],
            details_counts:[],
            showDetails: false
        }
    },

    mounted(){
        this.getCardDetailsCount();
    },
    methods: {
    async getCardDetailsCount() {
        const AuthStr = 'Bearer '.concat(this.$store.state.token);

        await this.$axios.get('/partners/get/count_all', { headers: { Authorization: AuthStr } })
            .then((response) => {
                const stats = response.data.stats; // Adjust to match the response format
                this.detailsCard.forEach((card) => {
                    if (stats[card.status]) {
                        card.count = stats[card.status].count;
                    }
                });
                this.showDetails = true;
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }
}
}
</script>