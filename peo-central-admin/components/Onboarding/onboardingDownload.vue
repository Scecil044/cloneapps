<template>
    <v-row>
     <v-col cols="12">
         <div class="d-flex align-center justify-end">
             <!-- <v-btn
               class="ml-4 pl-3 pr-3"
               color="#000027"
               outlined
               :height="30"
               style="border: solid 3px #f9fafc !important; background-color: #ffff;"
             >
               <EditSvg />
               <span class="edit_btnNew pl-1" >Edit</span>
             </v-btn> -->
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
             <v-btn
               class="ml-4 pl-3 pr-3"
               color="#000027"
               outlined
               :height="30"
               style="border: solid 3px #f9fafc !important; background-color: #ffff;"
             >
               <MailSvg />
               <span class="edit_btnNew pl-1" >Mail</span>
             </v-btn>
           </div>
     </v-col>
     <v-col cols="12">
      <div>
        
      </div>
       </v-col>
    </v-row>
 </template>
 <script>
 import EditSvg from '@/assets/images/Customer/edit.svg'
 import FileSvg from '@/assets/images/icons/file-icon.svg'
 import MailSvg from '@/assets/images/icons/mail-icon.svg'
 
 export default {
     components:{
         EditSvg,
         FileSvg,
         MailSvg,
     },
     data() {
         return {
             
         }
     },
 }
 </script>