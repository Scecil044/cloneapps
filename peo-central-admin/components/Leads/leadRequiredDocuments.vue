<template>
    <v-row>
         <!-- Upload Document Dialog -->
    <v-dialog id="custom_dialog" v-model="uploadDocsDialog" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Add Document</h4>
          <v-icon small color="subtext" class="ml-5" @click="uploadDocsDialog = false">fa-close</v-icon>
        </v-card-title>
        <v-container class="ma-0 mt-6 pa-0">
          <v-row class="pb-0">
            <v-col cols="12" class="pl-0 py-0">
                <span class="sub_reg" > Document Type </span>
                <v-radio-group class="dialog_radioButton   " >
                <div class=" d-flex align-center justify-space-between ">
                <v-radio   class="" label="Trade License" value="trade license"></v-radio>
                <v-radio class="" label="VAT" value="vat"></v-radio>
                <v-radio class="" label="Company Registration" value="company registration"></v-radio>
              
                </div>
                
              </v-radio-group>
                
              
            </v-col>
            <v-col cols="12"  class="pl-0 pr-12">
              <CustomInputContainer label="Expiry Date" :mandatory="true">
                <div slot="input">
                  <v-menu
                    v-model="date_menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="exp_date_menu"
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
                      v-model="exp_date_menu"
                      @input="date_menu = false"

                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="ma-0 pa-0">
                <div class=" d-flex align-center justify-end" >
                    <v-btn  @click="uploadDocsDialog = false"   class="tall__btn  mr-3" outlined
               >Cancel</v-btn>
              <v-btn   @click="uploadDocsDialog = false" class="unsuccessful_btn_dialog" color="primary"
               >Confirm</v-btn>

                </div>
                
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
      <v-col cols="12">
        <!-- RequiredDocuments -->
        <v-card color="card_bg" id="card" v-if=" selectedIndex == 3">
          <v-card-title id="card-title" class="mb-4">
            <!-- <v-col cols="12" class="py-0">
              <div class="d-flex align-center justify-end">
                <v-btn class="ml-1 pl-3 pr-3" color="#000027" outlined :height="30"
                  style="border: solid 3px #f9fafc !important" @click="handleEditLead()">
                  <EditSvg />
                  <span class="edit_btnNew pl-1">Edit</span>
                </v-btn>
              </div>
            </v-col>  -->
        </v-card-title>
          <v-card-text id="card-text2" style="max-height: 10vh !important" class="dl__l overflow-y-auto">
            <v-row >
                <v-col cols="12" >
                    <div class="pa-8">
                        <p class="span_subtext" >Required Documents for UAE Clients</p>
                    <div v-for="(item, index) in docList" :key="index" >
                        <span class=" mr-2"> {{ index+1 }} </span> <span>{{ item.title }}</span>
                    </div>
                    </div>
                
                </v-col>
                <v-col cols="12" >
                    <div class="pa-8">
                        <p class="span_subtext" >Required Documents for KSA Clients</p>
                    <div v-for="(item, index) in docList" :key="index" >
                        <span class=" mr-2" > {{ index+1 }} </span> <span>{{ item.title }}</span>
                    </div>
                    </div>
                

                </v-col>
                
            </v-row>
         
          </v-card-text>
        </v-card>
        <!-- Collect Documents -->
        <v-card color="card_bg" id="card" v-if=" selectedIndex == 4">
          <v-card-title id="card-title" class="mb-4">
           
        </v-card-title>
          <v-card-text id="card-text2" style="max-height: 10vh !important" class="dl__l overflow-y-auto">
            <v-row >
                <v-col cols="6">
                    <div class=" pa-8" >
                        <h4 class="mb-8 span_col " >Collect Documents</h4>
                   <!-- <FileDropzone/> -->
                    <!--uploaded Documents -->
                    <div
                        :class="['drop_Zone', dragging ? 'dropZone_over' : '']"
                        @dragenter="dragging = true"
                        @dragleave="dragging = false"
                        @click="uploadDocsDialog = true"
                        class="mb-4 d-flex align-center justify-center flex-column curser_pointer"
                        >
                        <v-btn icon class="mr-5 " color="primary" small>
                             <v-icon small color="primary">fa-plus</v-icon>
                        </v-btn>
                        <span>Add Document</span>
                    </div>
                   <div class="mt-2 d-flex flex-column  justify-start"  v-for=" docs in documentsUploaded" :key="docs.id"   v-if="docs.type=='pdf'" > 
                    <div   class="docs_upload pa-2 d-flex align-center justify-space-between  " >
                        <div class=" d-flex align-center curser_pointer">
                            <PdfSvg class="mr-1" v-if="docs.type == 'pdf'" />
                        <span>{{ docs.title }}</span>
                        </div>
                       
                        <CancelSvg class="curser_pointer"   />
                    </div>
                 </div>
                    </div>

                   
                   
                
                </v-col>
                <v-col cols="6">
                    <div class="pa-8">
                        <p class="span_subtext" >Required Documents for UAE Clients</p>
                    <div v-for="(item, index) in docList" :key="index" >
                        <span class=" mr-2"> {{ index+1 }} </span> <span>{{ item.title }}</span>
                    </div>
                    </div>
                    <div class="pa-8">
                        <p class="span_subtext" >Required Documents for KSA Clients</p>
                    <div v-for="(item, index) in docList" :key="index" >
                        <span class=" mr-2" > {{ index+1 }} </span> <span>{{ item.title }}</span>
                    </div>
                    </div>
                

                </v-col>
                
            </v-row>
         
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
  <script>
//   import  '@/assets/scss/utils/_filedropzone.scss'
  import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
  import EditSvg from '@/assets/images/Customer/edit.svg'
  import PdfSvg from '@/assets/images/icons/pdf.svg'
  import CancelSvg from '@/assets/images/icons/cancel.svg'
  import InfoSVG from '@/assets/images/Customer/info.svg'
  import FlagSVG from '@/assets/images/FlagUae.svg'
  import BinanceSVG from '@/assets/images/icons/binance-logo.svg'
  import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
  import FileDropzone from '~/components/utils/FileDropzone.vue'
  import CalenderSvg from '@/assets/images/icons/calender.svg'


  
  export default {
    components: {
      CustomInputContainer,
      InfoSVG,
      BinanceSVG,
      customerDefaultIcon,
      FlagSVG,
      EditSvg,
      FileDropzone,
      PdfSvg,
      CancelSvg,
      CalenderSvg,
      
    },
    props: { selectedIndex: Boolean },
    data() {
      return {
        date_menu: '',
      exp_date_menu: '',
        uploadDocsDialog: true,
       docList: [
        { title: "Trade License", },
        { title: "VAT", },
        { title: "Company Registration", },
        { title: "VAT", },
      
       
      ],
      documentsUploaded: [
        {   
            title: "Trade License",
            id: 'asasdas',
            type: 'pdf',
          },
          {   
            title: "Trade License",
            id: 'asasdas',
            type: 'word',
          },
          {   
            title: "Trade License",
            id: 'asasdas',
            type: 'pdf',
          },
          {   
            title: "Trade License",
            id: 'asasdas',
            type: 'pdf',
          },
       
      
       
      ],
      }
    },
    // @click="handleNewLead()"
    methods: {
      handleEditLead() {
        // this.$router.push('/Leads/new-lead')
      },
    },
    mounted() {
      // console.log(this.leadsDetails, '---------leadsDetails')
    }
  }
  </script>
  