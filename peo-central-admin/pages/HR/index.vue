<template>
    <v-row class="leads_wrapper">
        <Requests v-if="!Loading" :configData='configData' :companyData='companyData' :users='users' :user='user' />
    </v-row>
</template>


<script>

import Requests from '@/components/HRSelfService/requests.vue'

export default {
    layout: 'dashboard',
    components: {
        Requests
    },
    data() {
        return {
            Loading: false,
            users: []
        }
    },
    async asyncData({ app, store }) {
        const token = store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);

        let configData = await store.getters.getConf
        // console.log(configData, "configData")
        let companyData = await store.getters.getAllCompanies
        let user = app.store.getters.getUserInfo

        return {
            companyData: companyData,
            configData: configData,
            user: user,
        }
    },
    methods: {
        changeTab(event) {
            this.currentTab = event
        },
    },
    computed: {
    },
    async mounted() {
        this.users = this.$store.getters.getUsers
    },
    created() {
        this.$nuxt.$on('tabChanged', ($event) => {
            this.changeTab($event)
        })
    },
    beforeDestroy() {
        this.$nuxt.$off('tabChanged')
    },
}
</script>