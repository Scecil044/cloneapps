<template>
    <!-- Create Leads Agreement  Dialog -->
    <v-dialog
         id="custom_dialog"
         v-model="dialogData"
         persistent
         width="45vw"
         height="100vh"
         content-class="proposal_dialog"
       
       >
       <div class="dialog_proposal">
           <v-card id="card" style="padding: 20px 30px !important; height: 100vh !important">
           <v-card-title id="card-title">
              <v-row>
               <v-col cols="12" class="ma-0 pa-0">
                   <div class="d-flex align-center justify-space-between">
                    
                       <h4 class="text--text">
                         
                        Create Agreement
                          </h4>
                   <div class="d-flex align-center justify-end">
                     <v-btn
                       class="tall__btn mr-4 pl-6 pr-6"
                       color="subtext"
                       outlined
                       @click="proposalDialog = false"
                       ><span class="" @click="close()">Cancel</span></v-btn
                     >
                     <v-btn 
                       class="tall__btn mr-4 pl-6 pr-6"
                       color="primary"
                       outlined
                       @click="proposalDialog = false"
                       ><span class="" @click="close()">Save as draft</span></v-btn
                     >
                     <v-btn
                       class="tall__btn pl-6 pr-6"
                       color="primary"
                       @click="close()"
                       >
                       Create
                       </v-btn
                     >
                   </div>
                   </div>
                   
                 </v-col>
              </v-row>
           </v-card-title>
             <v-container class="ma-0 pa-0">
             
               <!-- Create Employment Contract -->
               <div >
                 
                 <v-row  class=" pt-12">
                  
                <v-col cols="4" class="pl-0 pt-0 pb-0">
                <CustomInputContainer label="Agreement Date">
                <div slot="input">
                  <v-menu
                    v-model="selected_agreement_day"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="selected_agreement_date"
                        placeholder="Enter Date"
                        solo
                        class="proposalDialog_date_field2"
                        dense
                        hide-detail
                        v-bind="attrs"
                        v-on="on"
                        :rules="main_rule"
                    >
                    <template v-slot:append>
                        <div class="">
                          <CalenderSvg />
                        </div>
                      </template>
                  </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="selected_agreement_date"
                      @input="selected_agreement_day = false"

                    />
                  </v-menu>
                </div>
                        </CustomInputContainer>
                    
                  
                 
                   </v-col>
                   <v-col cols="4" class=" pl-0 pt-0 pb-0">
                       <CustomInputContainer label="Agreement No.">
                           <div slot="input">
                             <v-text-field
                             v-model="agreement_number"
                              hide-details
                               placeholder="Enter Number"
                               solo 
                               dense
                               class="proposalDialog_date_field2"
                             />
                           </div>
                         </CustomInputContainer>
                   </v-col>
                   <v-col cols="12" class="pl-0 pt-0 pb-0">
                       <div class="mt-6 mb-4">
                       <span class="span_leadHeading">THIS AGREEMENT IS ENTERED BETWEEN</span>
                       </div>
                   </v-col>
                   <v-col cols="4" class=" pl-0 pt-0 pb-0">
                       <CustomInputContainer label="Company Name">
                           <div slot="input">
                             <v-text-field
                             v-model="company_id"
                              hide-details
                               placeholder="company name"
                               solo 
                               dense
                               class="proposalDialog_date_field2"
                             />
                           </div>
                         </CustomInputContainer>
                   </v-col>
                   <v-col cols="4" class=" pl-0 pt-0 pb-0">
                    <CustomInputContainer label="Trade License Number:">
                           <div slot="input">
                             <v-text-field
                             v-model="license_number"
                              hide-details
                               placeholder="company name"
                               solo 
                               dense
                               class="proposalDialog_date_field2"
                             />
                           </div>
                         </CustomInputContainer>
                   </v-col>
                   <v-col cols="6" class=" pl-0 pr-12">
                        <CustomInputContainer label="VAT Number (TRN):">
                            <div slot="input">
                              <v-text-field
                              v-model="VAT_num"
                               hide-details
                                placeholder="Enter Number"
                                solo 
                                dense
                                class="proposalDialog_date_field2"
                              />
                            </div>
                          </CustomInputContainer>
                    </v-col>

                    <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
             
             <CustomInputContainer label="Place of Registration:">
               <div slot="input">
                 <v-text-field
                   v-model="place_registration"
                   placeholder="Marina, Dubai"
                   class="proposalDialog_date_field2"
                   hide-details
                   solo
                   dense
                   readonly
                   :rules="main_rule"
                 >
               </v-text-field>
               </div>
             </CustomInputContainer>
           
         
           </v-col>
                  
             <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
             
             <CustomInputContainer label="Company Office Address:">
               <div slot="input">
                 <v-text-field
                   v-model="company_address"
                   placeholder="Office 1006 Marina, Dubai "
                   class="proposalDialog_date_field2"
                   hide-details
                   solo
                   dense
                   readonly
                   :rules="main_rule"
                 >
               </v-text-field>
               </div>
             </CustomInputContainer>
           
         
           </v-col>
             <v-col cols="12" class="pl-0 pt-0 pb-0">
                       <div class="mt-6 mb-4">
                       <span class="span_leadHeading">AND</span>
                       </div>
                   </v-col>
                   <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
              <CustomInputContainer label="Entity/Company Name" :mandatory="true">
                <div slot="input">
                  <v-select
                    :items="paymentMethods"
                    placeholder="End of Contract"
                    solo
                    dense
                    hide-details
                    class="proposalDialog_date_field2"
                    v-if="paymentMethods.length >= 1"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>

                  <p v-else class="error--text mb-5 mt-5">
                    Please Select Company
                  </p>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="8" class=" pl-0 pt-0 pb-0">
                <div style="width: 48% !important;">
                    <CustomInputContainer label="Trade License Number:">
                           <div slot="input">
                             <v-text-field
                             v-model="license_number"
                              hide-details
                               placeholder="company name"
                               solo 
                               dense
                               class="proposalDialog_date_field2"
                             />
                           </div>
                         </CustomInputContainer>
                            </div>
                   </v-col>
                   <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
             <CustomInputContainer label="Place of Registration:">
               <div slot="input">
                 <v-text-field
                   v-model="place_registration"
                   placeholder="Marina, Dubai"
                   class="proposalDialog_date_field2"
                   hide-details
                   solo
                   dense
                   readonly
                   :rules="main_rule"
                 >
               </v-text-field>
               </div>
             </CustomInputContainer>
           </v-col>
             <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
             <CustomInputContainer label="Company Office Address:">
               <div slot="input">
                 <v-text-field
                   v-model="company_address"
                   placeholder="Office 1006 Marina, Dubai "
                   class="proposalDialog_date_field2"
                   hide-details
                   solo
                   dense
                   readonly
                   :rules="main_rule"
                 >
               </v-text-field>
               </div>
             </CustomInputContainer>
           </v-col>
               </v-row>
             </div>
             </v-container>
          
         </v-card>
         
       </div>
         
   </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'




export default {
   components:{
   CustomInputContainer,
   CalenderSvg,
   FileDropzone,
},
props:{
   dialogData: Boolean,
   activeStage: String,
},
   data() {
       return {
       paymentMethods: ['Bank', 'Cash', 'Other'],
       agreement_number: '',
       company_id: '',
       license_number: '',
       place_registration: '',
       company_address: '',
       self_company: '',
       customer_email: '',
       agreement_num: '',
       workOrder_num: '',
       VAT_num:'',
       contact_name: '',
       contact_phone_num: '',
       security_cost: '',
       contact_designation: '',
       contact_email: '',
       employee_name: '',
       service_duration: '',
       offer_letter: '',
       visa_designation: '',
       working_days: '',
       working_hours: '',
       probation: '',
       notice_period: '',
       employment_visa: '',
       emirati_cost: '',
       insurance_amount: '',
       moblize_amount: '',
       Allowances_basic: '',
       basic_salary: '',
       emirati_fee:'',
       amins_fee:'',
       amount_received:'',
       ref_num:'',
       Invoice_number:'',
         // date 
         contract_end_date: false,
         selected_ended_contract_date: new Date().toISOString().substr(0, 10),
         contract_start_date: false,
         selected_contract_date: new Date().toISOString().substr(0, 10),
         order_date: false,
         selected_order_date: new Date().toISOString().substr(0, 10),
         selected_agreement_day: false,
         selected_agreement_date: new Date().toISOString().substr(0, 10),
         exp_date_menu: false,
        exp_date: new Date().toISOString().substr(0, 10),
        recordedPayment_date: false,
        recorded_date: new Date().toISOString().substr(0, 10),

           //exit reason list
     exitReason: ['Termination', 'Resignation', 'End Of Contract'],
     main_rule: [(v) => !!v || 'This filed is required'],
     numberRule: [
       (v) => {
         if (!!v) return 'This Field is required'
         if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
         return 'Number has to be between 0 and 999'
       },
     ],
     email_rule: [
       (v) => !!v || 'Email is required',
       (v) => /.+@.+/.test(v) || 'E-mail must be valid',
       (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
     ],
     phone_rule: [],   
       }
   },
   methods: {
       close() {
     this.$emit('close')
   },
   },
}
</script>