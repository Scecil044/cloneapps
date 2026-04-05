<template>
   <div class="pt-0">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="11">
                <h3 class="py-0 text-h5 pl-2 blue-grey--text">Form Configurator</h3> 
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="5">
                <v-card class="pa-5 rounded-xl" height="800" style="overflow: hidden">
                <v-card-title class="px-3">
                    <span class="px-0 pt-1 darkBlue-heading-text subHeadingFontSize">Form Templates</span>
                </v-card-title>
                <v-divider class="mt-0"></v-divider>

                <div class="scroll mt-0" style="max-height:680px;min-height:680px;">
                    <div v-if="allformloading == false && formlist.length > 0" >
                        <v-list two-line  class="mt-n3" style="width:100%" v-if="formlist != ''">
                            <v-list-item-group color="primary">
                            <template v-for="(data, index) in formlist">
                            <v-list-item :key="index" @click="loadServiceList(data)" class="mt-3">
                            <v-list-item-content class="py-0">
                                <h5 class="grey--text caption" >{{data.name }}</h5>
                            </v-list-item-content>
                            </v-list-item>
                            <v-divider class="mt-3" :key="data._id"></v-divider>
                        </template>
                        </v-list-item-group>
                        </v-list>
                    </div>
                    <v-row v-else style="min-height:100%;align-items:center;justify-content:center;">
                        <v-col cols="auto">
                            <v-img src="/animated/refresh.svg"  max-width="fit-content" height="200" contain class="mr-3"></v-img>
                        </v-col>
                    </v-row>
                </div>
                </v-card>
            </v-col>
             <v-col cols="12" sm="12" md="7">
                <v-row v-if="formloading" style="min-height:100%;align-items:center;justify-content:center;">
                    <v-col cols="auto">
                        <v-img src="/animated/refresh.svg"  max-width="fit-content" height="200" contain class="mr-3"></v-img>
                    </v-col>
                </v-row>
                <v-card class="pa-5 rounded-xl" height="800" style="overflow: hidden" v-else>
                <v-card-title class="px-3">
                    <span class="px-0 pt-1 darkBlue-heading-text subHeadingFontSize">{{selectedForm.name}}</span>
                </v-card-title>
                <v-divider class="mt-0"></v-divider>
                <v-row>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Module</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{selectedForm.module}}</span>
                    </v-col>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Name</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{selectedForm.name}}</span>
                    </v-col>
                    <!-- <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Application Status</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{'Waiting For Approval'}}</span>
                    </v-col>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Created Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{selectedUser.createdDate | formatDateWithoutTime}}</span>
                    </v-col> -->
                </v-row>
                <v-divider class="mt-0"></v-divider>
                <client-only ><Modifyform/></client-only>
                    
                </v-card>
             </v-col>
        </v-row>



        <v-dialog v-model="newform" max-width="600px">
                <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
                    <v-row>
                        <v-col cols="6" sm="6" class="pb-2">
                            <v-card-title class="py-0">
                                <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">New Form</span>
                            </v-card-title>
                        </v-col>
                    </v-row>
                </v-card>
        </v-dialog>
    </div>
</template>

<script>


export default {
    components:{
        Modifyform: () => {if(process.client){return import('@/components/configurations/FormConfigurator/modifyform.vue')}}
    },
    data() {
        return {
            allformloading:false,
            formloading:false,
            formedit:false,
            newform:false,
            formlist:[],
            selectedForm:{},
            system_modules:[],
            newForm:{
                fields:[],
                view:{},
                name:'',
                module:'',
            }
        }   
    },
    async mounted(){
        this.getallmodules()
        await this.getallforms()
        this.loadServiceList(this.formlist[0])
    },
    methods: {
                           
        async loadServiceList(data){
            this.formloading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.$axios.get(`form?_id=${data.id}`, { headers: { Authorization: AuthStr }})
            .then((response) => {
                this.formloading = false
                this.selectedForm = response.data[0]
                console.log(this.selectedForm)
            })
            .catch(e => console.log(e))
        },
        async getallforms(){
            this.allformloading = true
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.get(`form/all`, { headers: { Authorization: AuthStr }})
            .then((response) => {
                this.allformloading = false
                this.formlist = response.data
            })
            .catch(e => console.log(e))
        },
        getallmodules(){
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.$axios.get(`configuration/modules`, { headers: { Authorization: AuthStr }})
            .then((response) => {
               this.system_modules = response.data
            })
            .catch(e => console.log(e))
        },
        
    },
}
</script>
