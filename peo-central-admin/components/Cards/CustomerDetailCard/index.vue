
<template>
    <v-row>
      <v-col col="12" class="pa-0" >
        <div class="flex_row d-flex flex-wrap pa-0" style="gap: 1rem">
        <v-card
          color="card_bg"
          class="detail_card"
          v-for="item in data"
          :key="item.id"
          style="border: 0.5px solid #e2e7f1 !important"
        >
          <div class="flex_row  ml-4">
            <div class="icon__container lighten-5 mr-2" :class="item.color">
              <h1>
                {{ item.count }}
              </h1>
            </div>
            <div class="flex_column">
              <span class="subtext--text pt-3" style="width: 94px !important;"
                >{{ item.status }}
              </span>
              
            </div>
          </div>
        </v-card>
      </div>
      </v-col>
    </v-row>
      
    </template>
    
    <script>
    
    export default {
      props: { data: Array },
    }
    </script>
    