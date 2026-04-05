<template>
    <v-row class="px-0 py-0">
      <v-col cols="12" class=" py-0">
        <!-- style="min-height: 90vh !important" -->
        <v-card color="card_bg" id="card">
            <!-- Leave Approval Flow -->
            <div v-if="type == 'all'"> 
                
            <v-divider id="divider" class="mt-3 mb-6"></v-divider>
            </div>
            <!-- Leave and Letter Details -->
            <div>
                <span v-if="type == 'all'" class="span_btnB"> Leave Details</span>
            <span v-else class="span_btnB"> Letter Details</span>
            <v-row>
                <v-col cols="6">
                        <v-col cols="12">
                            <div v-if="type == 'all'" class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Leave Type</span>
                                <span class="pr-9 span_data" >{{ empLeave.leave_type }}</span>
                            </div>
                            <div v-else class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Letter Type</span>
                                <span class="pr-9 span_data" >{{ empLeave.letter_type }}</span>
                            </div>
                            <v-divider id="divider" class="mt-2"></v-divider>
                        </v-col>
                        <v-col cols="12">
                            <div v-if="type == 'all'" class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Requested on</span>
                                <span class="pr-9 span_data" >{{ empLeave.Requested_on }}</span>
                            </div>
                            <div v-else class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">NOC Options</span>
                                <span class="pr-9 span_data" >{{ empLeave.NOC_Options }}</span>
                            </div>
                            <v-divider id="divider" class="mt-2"></v-divider>
                        </v-col>
                        <v-col cols="12">
                            <div  v-if="type == 'all'" class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Start Date</span>
                                <span class="pr-9 span_data" >{{ empLeave.Start_Date }}</span>
                            </div>
                            <div  v-else class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Travel From Date</span>
                                <span class="pr-9 span_data" >{{ empLeave.Travel_Date }}</span>
                            </div>
                            <v-divider id="divider" class="mt-2"></v-divider>
                        </v-col>
                        <v-col cols="12">
                            <div  v-if="type == 'all'" class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">End Date</span>
                                <span class="pr-9 span_data" >{{ empLeave.End_Date }}</span>
                            </div>
                            <div  v-else class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Reason for Travel</span>
                                <span class="pr-9 span_data" >{{ empLeave.Travel_Reason}}</span>
                            </div>
                            <v-divider id="divider" class="mt-2"></v-divider>
                        </v-col>
                </v-col>
                <v-col cols="6">

                        <v-col cols="12">
                            <div class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">No of Days</span>
                                <span class="pr-9 span_data" >{{ empLeave.No_Days }}</span>
                            </div>
                            <v-divider id="divider" class="mt-2"></v-divider>
                        </v-col>
                        <v-col cols="12">
                            <div  v-if="type == 'all'"  class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Reason/Leave Category</span>
                                <span class="pr-9 span_data" >{{ empLeave.ReasonLeave_Category }}</span>
                            </div>
                            <div  v-else  class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Address Emirates</span>
                                <span class="pr-9 span_data" >{{ empLeave.Address_Emirates }}</span>
                            </div>
                            <v-divider id="divider" class="mt-2"></v-divider>
                        </v-col>
                        <v-col cols="12">
                            <div class=" d-flex  align-center justify-space-between">
                                <span class="sub_text span_data">Status</span>
                                <span
                    class=" status_btn light_accent3 accent3--text"
                    v-if="empLeave.Status_leave == 'PENDING APPROVAL'"
                    >{{ empLeave.Status_leave }}</span>
                    <span
                    class="  status_btn light_accent4 accent4--text"
                    v-if="empLeave.Status_leave == 'Approved'"
                    >{{ empLeave.Status_leave }}</span>
                            </div>
                            <v-divider id="divider" class="mt-2"></v-divider>
                        </v-col>
                </v-col>
                
            </v-row>
            </div>
            
        </v-card>
      </v-col>
    </v-row>
  </template>
  <script>
  import '@/assets/scss/utils/_leadTimeLine.scss'
  import checkBoxSvg from '@/assets/images/icons/check-box.svg'
  import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
  import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
  
  export default {
    components: {
      checkBoxSvg,
      CustomInputContainer,
      LightArrow,
    },
    props:{
        employeeListData: Array,
        type: String,
    },
    data() {
      return {
        //Employee leave data obj
        empLeave:{},
      
      }
    },
    methods: {
        
    },
    mounted() {
        this.empLeave = this.employeeListData[0]
        console.log('heheh', this.empLeave);
    },
    computed:{
    
    },
  }
  </script>
  