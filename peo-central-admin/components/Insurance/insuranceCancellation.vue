<template>
    <div>
        <v-card class="pa-0 rounded-xl" :height="this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.md || this.$vuetify.breakpoint.lg ? '400px':'350px'" style="overflow-x: hidden;">
            <v-card-text v-if="insuranceCancelValidation && insuranceCancelValidation.status == 'Error'" >
                <v-row>
                    <v-spacer />
                    <v-img src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain  @click="close()" />
                    <v-col cols="12" class="notificationBanner">
                    <div class="py-0 px-4 fontSize2 font-weight-normal darkBlue-heading-text">
                        <ul>
                        <li>{{ insuranceCancelValidation.result[0] }}</li>
                        </ul>
                    </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text v-if="insuranceCancelValidation && insuranceCancelValidation.status == 'Success'">
                <v-row class="">
                    <v-spacer />
                    <v-img src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain  @click="close()" />
                </v-row>
                <v-row class="pt-5">
                    <div>
                        <h3 class="px-6 pt-0">Do You Want To Cancel Insurance For <strong color="black">{{ employee.first_name + " " + employee.last_name }}</strong> ?</h3><br />
                        <p class="px-6 pt-1">If Yes, then click on "Cancel Request" button, A request will be generated for both principal and dependents (if he/she has any dependents) in request deletion component.</p>
                        <v-col class="d-flex ml-2 mt-2" cols="12" sm="6" >
                            <v-select :items="items" label="Would you like to request for credit note" v-model="creditNote" dense outlined ></v-select>
                        </v-col>
                    </div>
                </v-row>
            </v-card-text>
            <v-card-actions v-if="insuranceCancelValidation && insuranceCancelValidation.status == 'Success'">
                <v-row class="pt-4">
                    <v-col class="text-right pt-0">
                    <v-btn outlined class="red--text" @click="deleteRequest(employee)" :loading="createRequestLoading" :disabled="createRequestLoading" text>Cancel Request</v-btn>
                    <v-btn outlined class="primary--text" @click="close()" text>Close</v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
        <!-- Snack -->
        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}
            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
<script>
import moment from 'moment'

    export default {
        props:['employee', 'userInsuranceDetails', 'parent_company_id', 'parent_company', 'principal_type'],
        // components:{},
        data() {
            return {
                createRequestLoading:false,
                snack: false,
                snackColor:'',
                snackText:'',
                dependent_arr: [],
                insuranceCancelValidation:[],
                items: ['Yes', 'No'],
                creditNote: ""
            }
        },
        async mounted(){
            await this.checkCancelRequest(this.employee)
        },
        methods:{
            close(){
                this.$emit('close',{})
            },
            async checkCancelRequest(user){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token)

                let obj = { 
                    "company_id": user.parent_company, 
                    "user_id": user._id, 
                    'parent_company_id': user.parent_company_id,
                    'provider_id': this.userInsuranceDetails.length > 0 ? this.userInsuranceDetails[0].provider_id : ''
                }
                
                await this.$axios.$post(process.env.insurancePortalUrl+ 'company/insurance/deletion/'+ this.parent_company_id + '/checkcancelrequest', obj, { headers : { Authorization: AuthStr } })
                .then((res) => {
                    this.insuranceCancelValidation = res
                })
            },
            async deleteRequest(user){
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                this.createRequestLoading = true

                let parent_company_id = this.parent_company_id
                let parent_id = this.parent_company
                let user_id = user._id

                let payment_details = {
                    renewal_status: this.userInsuranceDetails[0].renewal_status,
                    payment_mode: this.userInsuranceDetails[0].payment_mode,
                    payment_status: this.userInsuranceDetails[0].payment_status,
                    department_amount: this.userInsuranceDetails[0].department_amount ? this.userInsuranceDetails[0].department_amount : '0',
                    other_amount: this.userInsuranceDetails[0].other_amount ? this.userInsuranceDetails[0].other_amount : '0',
                    paid_by: this.userInsuranceDetails[0].paid_by ? this.userInsuranceDetails[0].paid_by : 'Principal'
                }

                let obj = {
                    status: 'processing',
                    deleted: false,
                    category_id: this.userInsuranceDetails[0].category,
                    parent_id: this.parent_company,
                    user_id: user._id,
                    company_id: this.parent_company, 
                    insurance_type: "Group",
                    process:[],
                    request_type: 'Deletion',
                    // has_dependency: user.has_dependency,
                    principal_type: this.principal_type,
                    parent_company_id: this.parent_company_id,
                    requested_mail_id: this.$store.getters.getThisUser,
                }

                if (this.creditNote) {
                    obj.request_credit = this.creditNote === "Yes" ? true : false;
                }

                obj.principal_id = user._id
                obj.payment_details = payment_details

                await this.$axios.$post(process.env.insurancePortalUrl+ 'company/insurance/deletion/'+ this.parent_company_id + '/getDependents',{ "parent_id": parent_id, "user_id": user_id })
                .then(async (res) => {
                    this.dependent_arr = res
                    obj.has_dependency = this.dependent_arr.length > 0 ? 'true' : 'false'
                    if(this.dependent_arr && this.dependent_arr.length > 0) {
                        obj.dependents = this.dependent_arr
                    }
                    else {
                        obj.dependents = []
                    }

                    await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/deletion/new',obj,{headers: { Authorization: AuthStr }})
                    .then(res => {
                        if(res.success || res.success == true || res.success == 'true'){
                            this.$emit('close','Insurance Delete request successfully created')
                            this.dependent_arr = []
                            this.createRequestLoading = false
                        } else if(res.success == false || res.success == 'false'){
                            this.$emit('close','Already Request Is Existing')
                            this.dependent_arr = []
                            this.createRequestLoading = false
                        }
                    })
                })
            }
        },
        computed:{

        }
    }
</script>
<style>

    .phonePersonal{
        display: none !important;
    }
    .phoneHover:hover .phonePersonal{
        display: block !important;
    }
    .phoneHover:hover .phoneWork{
        display: none !important;
    }
    .directoryCard{
        transition: all .2s ease-in-out; 
        position: relative;
        overflow: hidden;
    }
    .directorySwitch{
        transition: all .2s ease-in-out; 
        cursor: pointer;
        position: absolute;
        bottom: -62px;
        right: -47px;
        width: 90px;
        height: 90px;
        border-radius: 50px;
        background-color: transparent;
    }
    
    .directoryCard:hover{
        box-shadow: rgb(45 45 45 / 5%) 0px 2px 2px, rgb(49 49 49 / 5%) 0px 4px 4px, rgb(42 42 42 / 5%) 0px 8px 8px, rgb(32 32 32 / 5%) 0px 16px 16px, rgb(49 49 49 / 5%) 0px 32px 32px, rgb(35 35 35 / 5%) 0px 64px 64px !important;
        transform: scale(1.025);
    }
    .directoryCard:hover .directorySwitch{
        background-color: #6182F0;
    }
    .directorySearch .v-input__slot:before,.directorySearch .v-input__slot:after{
        border-color: transparent !important;
        border-style: none !important;
    }
    .directorySearch .v-input input{
        color: #0A2C4F !important;;
    }
    .directorySearch .v-text-field__details{
        display: none;
    }
    .customCommentSection {
        padding: 2px 0px 17px 24px;
        background-color: #f5f5f5;
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }
    .addComment .v-input{
        padding-top: 0;
    }
    .addComment .v-input__slot:before,.attendanceSearch .v-input__slot:after{
        border-color: transparent !important;
        border-style: none !important;
    }
    .addComment .v-input__slot:before,.attendanceSearch .v-input__slot:before{
        border-color: transparent !important;
        border-style: none !important;
    }
    .addComment .v-input--is-focused{
        color: transparent !important;
        caret-color: transparent !important;
    }
    .insideSearch .v-list-item--link:before{
        border-color: transparent !important;
    }
    .editProfileTab .v-tabs-slider-wrapper{
    display: none;
    }
    .editProfileTab .v-tab--active{
        color:#0064D7 !important ;
        background-color: #F0F8FF !important;
    }
    .editSection .v-text-field > .v-input__control > .v-input__slot:before {
        border-color: rgb(211 211 211 / 42%) !important;
    }
    .insuranceEdit .v-file-input{
        padding-top: 0;
        margin-top: 0;
    }
    
</style>
<style scoped>
.selectcus{
    --vs-dropdown-option-padding: 3px 20px;

}
.todayStatusChipDirectory{
    position: absolute;
    bottom: -11px;
    z-index: 4;
    left:29%;
    align-items: center !important;
}

.todayLeaveStatusChipDirectory{
    align-items: center !important;
    position: absolute;
    bottom: -11px;
    z-index: 4;
    left:29%;
    background-color:#C97C7C !important

}
.ChatFileInput .mdi-paperclip::before {
    content: url('/header/paperclip-2.svg') !important;
}
</style>
<style lang="scss" scoped>
.grad1 {
//   height: 350px;
  background-color: #1565C0; /* For browsers that do not support gradients */
  background-image: linear-gradient(#1565C0, #F5F5F5);
}
.outline_upload{
    border: 00.0312rem dotted #1565C0;
}
.colorBackgrnd{
    background-color: #237ABC;
}

.grey-text-color{
     color: #707070;
}

.scroll {
    max-height: 160px;
    overflow-y: auto;
}
.dropZone {
  width: 250px;
  height: 200px;
  position: relative;
  border: 2px dashed #eee;
}

.dropZone:hover {
  border: 2px solid #2e94c4;
}

.dropZone:hover .dropZone-title {
  color: #1975A0;
}

.dropZone-info {
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}

.dropZone-title {
  color: #787878;
}

.dropZone input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.dropZone-upload-limit-info {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.dropZone-over {
  background: #5C5C5C;
  opacity: 0.8;
}

.dropZone-uploaded {
  width: 80%;
  height: 200px;
  position: relative;
  border: 2px dashed #eee;
}

.dropZone-uploaded-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>