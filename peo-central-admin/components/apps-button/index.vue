<template>
    <div id="app">
      <div class="text-center">
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <template v-slot:activator="{ on }">
            <v-btn class="apps_btn" v-on="on">
              <v-img
                src="/header/appsbtn.svg"
                class="mywork_custom pa-2"
                max-width="20"
                height="20"
                contain
              ></v-img>
            </v-btn>
          </template>
          <v-card class="pa-5 appmodal">
            <h3 class="appheading">Apps</h3>
            <div class="appcol">
              <v-row>
                <v-col cols="6" v-for="(data, index) in data" :key="index">
                  <div @click="baseurl(data.base_url)" class="d-flex flex-column align-center applist">
                    <span class="d-flex">
                      <v-img
                        :src= (data.img_name)
                        height="20"
                        class="pr-4"
                        contain
                      ></v-img
                      >{{ data.product_name }}</span
                    >
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </v-menu>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      data: Array,
    },
    data() {
      return {
        menu:'',
        productAccess: [],
      };
    },
    methods: {
      baseurl(value) {
        // console.log(value,"--------")
        this.$emit("productitem", value);
      },
      imgsrc(val){
        // console.log(val,"-----------valS")
        return val
      }
    },
    //
  };
  </script>
  <style>
  .appheading {
    padding: 1vw;
  }
  .apps_btn {
    left: 0px;
    display: flex;
    box-shadow: none !important;
    z-index: 9 !important;
    border-radius: 0px;
    background: #FFFFFF !important;
    top: 0px;
    display: block;
    /* position: fixed; */
    padding: 2vw;
    margin-top: -20px!important;
    height: 53px !important;
    min-width: 30px !important;
  }
  
  .appmodal{
    display: block;
    left: 0px !important;
    box-shadow: 0px 24px 30px #959ea51a !important;
    height: 100vh !important;
  }
  .applist {
    border: 1px solid #cad2dd;
    border-radius: 18px !important;
    padding: 2vw 0vw;
    max-width: 22vw;
  }
  .appcol {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  </style>
  