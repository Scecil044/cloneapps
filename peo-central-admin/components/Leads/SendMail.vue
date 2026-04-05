<template>
    <v-row>
     <v-col cols="12" class="pl-6">
         <div class="d-flex align-center justify-space-between">
            <div class=" d-flex align-center  " >
                <checkBoxSvg class="mr-2 paymentSvg" />
                <span class="span_col" >
                Mailed On 21 Jan 2022, 2:00Pm
                </span>

            </div>
           
             <v-btn
               class="ml-4 pl-3 pr-3"
               color="#000027"
               outlined
               :height="30"
               style="border: solid 3px #f9fafc !important; background-color: #ffff;"
             >
               <FileSvg />
               <span class="edit_btnNew pl-1" >Download As PDF</span>
             </v-btn>
           
           </div>
     </v-col>
     <v-col cols="12" >
       <div></div>
     </v-col>
    </v-row>
 </template>
 <script>
 import EditSvg from '@/assets/images/Customer/edit.svg'
 import FileSvg from '@/assets/images/icons/file-icon.svg'
 import MailSvg from '@/assets/images/icons/mail-icon.svg'
 import checkBoxSvg from '@/assets/images/icons/check-box.svg'

 
 export default {
     components:{
         EditSvg,
         FileSvg,
         MailSvg,
         checkBoxSvg,
     },
     data() {
         return {
             
         }
     },
 }
 </script>