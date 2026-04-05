<template>

    <div style="margin: 10px;">
        <Requests v-if="requestLoad"  :configData='configData' :companyData='companyData'  :users='users' :user='user'  :roles='roles'/>
    </div>

</template>


<script>

import Requests from '../../components/admin-central/requests.vue'

export default {
    components : {Requests}, 
    layout: 'dashboard',
    data() {
        return {
            companyData:[],
            configData:[],
            // teamList:[],
            loadData: true,
            users : [], 
            roles : [], 
            user:"",
            requestLoad : false
        }
    }, 
    methods : {
        async getData(){
            const token =  this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            let companies = {
                "company_name":1,
                "_id":1,
                "dept":1,
                "costCenterOptions":1,
                "leaveList":1,
                "fixed":1,
                "letterDetail":1,
                "rejection_flow":1,
                "company_phone" : 1,
                "company_address" : 1,
                "company_email" : 1,
                "logo":1, 
                "letterRequest" : 1, 
            }
           
            this.configData = this.$store.getters.getConf
            this.companyData =this.$store.getters.getAllCompanies
 
              
            this.loadData = false
        },
        async getAllRoles() {
            this.roles = await this.$axios.$get("/roles/all", {headers: { Authorization: AuthStr }})

        }

    }, 
    async mounted() {
        await this.getData()
        this.users = this.$store.getters.getUsers
        this.user =  this.$store.getters.getUserInfo
        this.requestLoad = true
    }
}

</script>


<style>


</style>