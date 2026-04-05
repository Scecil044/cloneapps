<template>
    <v-row>
        <v-col cols="12">
            <v-card color="card_bg" id="card" >
            <v-card-title id="card-title" class="mb-4">
                <h5 class="text--text pl-1">Lead Details</h5>
                </v-card-title>
                <v-card-text
              id="card-text2"
              class="dl__l overflow-y-auto"
            >
            
              <!-- LEAD DETAILS TABLE -->
              <v-row>
                <v-col cols="12" class=" mb-9">
                    <v-data-table
               id="coa_table"
               class="main__table elevation-0 customDataTabel  th_customer"
               :headers="leadHeaders"
               :items="leadDetails"
               :page="0"
               :pageCount="totalPage"
               :options.sync="options"
               :server-items-length="totalCount"
               :footer-props="{ 'items-per-page-options': [10, 20] }"
               hide-default-footer
               default-sort="false"
             >
                 <template v-slot:header.title="{ header }">
                     <div class=" d-flex  align-center pa-0 ">
                          <div>  <th class="pl-2">{{ header.text }}</th> </div>
                     </div>
                 </template>
                 
             <template v-slot:item="{ item, index}">
                  <tr>
                     <td class="pr-0" style="width: 215px !important;" >{{ item.title }}</td>
                     <td class=" d-flex align-center " > 
                        <div >
                            
                            <span class="span_data"  >{{ item.description }}</span>
                        </div>
                           </td>
                     <td class=""> </td>
                  </tr>
             </template>
            
             </v-data-table>
             <v-divider class="pa-0"></v-divider>
                </v-col>
                <v-col cols="5">  
                <CustomInputContainer label="Self Memo" >
                  <div slot="input">
                    <v-textarea
                      placeholder="Capture points from call"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
                </v-col>

              </v-row>
            </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>

import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'


export default {
    components:{
        CustomInputContainer,

    },
    data() {
        return {
    main_rule: [(v) => !!v || 'This filed is required'],
    leadHeaders: [
         { text: 'LEAD DETAILS', value: 'title', align: 'center', hideSortIcon : true, sortable: false },
         { text: '', value: 'description' ,align: 'center', hideSortIcon : true, sortable: false  },
         { text: '', value: 'action', align:'start', hideSortIcon : true, sortable: false   },
         
       ],
       leadDetails: [
         {
           title: 'Email ID',
           description: 'acme@gmail.com',
        
         },
         {
            title: 'Phone No.',
           description: '00971 -0589754125',
         },
         
       ],
    
      

      
    
        }
    },
   
}
</script>