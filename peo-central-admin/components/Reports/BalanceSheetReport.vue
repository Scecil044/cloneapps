<template>
  <v-card id="card">
    <v-card-title id="card-title">
      <h4>Balance Sheet Report</h4>
      <div class="flex_row">
        <v-btn
        class="short__btn mr-1"
        color="subtext"
        outlined
        >
        <v-icon class="mr-2" small>fa-print</v-icon>
        Send Mail
        </v-btn>
        <v-btn
        class="short__btn mr-1"
        color="subtext"
        outlined
        >
        <v-icon class="mr-2" small>fa-print</v-icon>
        Download
        </v-btn>
        <v-btn
        class="short__btn mr-1"
        color="subtext"
        outlined
        @click="handlePrint"
        >
        <v-icon class="mr-2" small>fa-print</v-icon>
        Print
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text id="card-text">
      <h4 class="my-9 text--text">Eat & Drink</h4>
      <div class="report_body flex_column align-center justify-center">
        <div class="re_title my-5 flex_column align-center justify-center">
          <h4 class="font-wight-bold text--text mb-2" >BalanceSheet</h4>
        </div>
          <!-- report-body -->
          <div class="report-body" v-if="dataLoaded">
              <table>
              <thead>
                  <tr>
                  <th class="text-left" style="width:50%;">&nbsp;</th>
                  <th class="text-right" style="width:50%">Total</th>
                  </tr>
              </thead>
              <tbody>
                  <!-- row primary/secondary/total -->
                  <tr class="tr-primary open">
                    <td colspan="12" class="pa-0">
                    <v-expansion-panels>
                      <v-expansion-panel
                        v-for="(item,i) in data_item"
                        :key="i"
                        class="mt-0"
                      >
                        <v-expansion-panel-header>
                          {{item.name}}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-expansion-panels>
                            <v-expansion-panel
                              v-for="(data,i) in item.list"
                              :key="i"
                              class="mt-0"
                            >
                            <v-expansion-panel-header>
                              {{data.name}}
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                              <v-row v-for="(child,index) in data.list" :key="index" style="min-height:max-content !important" @click="openBSItemPop(child)" >
                                <v-col class="pa-0 text-left" cols="6" >
                                  <p>{{ child.name }}</p>
                                </v-col>
                                <v-col class="pa-0 text-right" cols="6" >
                                  <p>{{ child.amount | twoDecimals}}</p>
                                </v-col>
                              </v-row>
                            </v-expansion-panel-content>
                            <v-divider></v-divider>
                            <v-row style="min-height:max-content !important" class="px-4 pt-3">
                              <v-col class="pa-0 text-left " cols="6" >
                                <p class="font-weight-bold">Total {{ data.name }}</p>
                              </v-col>
                              <v-col class="pa-0 text-right" cols="6" >
                                <p class="font-weight-medium">AED {{ data.subtotal  | twoDecimals}}</p>
                              </v-col>
                              </v-row>
                            </v-expansion-panel>
                          </v-expansion-panels>
                          
                        </v-expansion-panel-content>
                        <v-divider></v-divider>
                        <v-row style="min-height:max-content !important" class="px-4 pt-3">
                            <v-col class="pa-0 text-left " cols="6" >
                              <p class="font-weight-bold">Total {{ item.name }}</p>
                            </v-col>
                            <v-col class="pa-0 text-right" cols="6" >
                              <p class="font-weight-medium">AED {{ item.subtotal  | twoDecimals}}</p>
                            </v-col>
                          </v-row>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </td>
                  <!-- <td colspan="9">
                      <a class="report-collapse-trigger">
                      <i class="fas fa-caret-right"></i></a>
                      Income
                  </td> -->
                 
                  <!-- /row -->

                  <!-- row primary/secondary/total -->
                 
                 
                  </tr>
                
                  
                  <!-- /row -->
              </tbody>
              
              </table>

              <div class="report-footer">
                <div class="report-timestamp text-center">
                  {{ date_now }}
                </div>
              </div>
          </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data(){
    return {
      dataLoaded:false,
      date_now : "",
      data_item : [
        {
          name : "",
          credit : "",
          debit : "",
        }
      ],
      total_credit : 0,
      total_debit : 0
    }
  },
  
  mounted() {
    this.reportCollaps()
    // console.log('firstTimeLoginM',this.getFirstTimeLogin);
    this.getReport()
    this.date_now = new Date()
  },
  watch: {
    companySelection: {
      handler() {
        this.getReport()
      },
    },
  },
  methods:{
    handlePrint() {
      window.print()
    },
    openBSItemPop(val){
      this.$emit('openBSItemPop',val)
    },
    async getReport(){
      this.dataLoaded = false
      const list = ["63ea1b6f2b5f68743ccbfc87", "63f5c98bf29f9cb7b24fca68"]
      const payload = { 
        company: this.$store.getters.getSelectedCompanies.map(a=>a.id), 
        "from_date": "2020-02-22",
        "to_date": "2024-02-22"
      }
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`reports/balance-sheet`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          for ( let i = 0 ; i < res.subtotal.length ; i++){
            // res.subtotal[i].list = (res.subtotal[i].list.filter(j => j.JE.length > 0))
          }
          this.data_item = res.subtotal
          console.log(this.data_item,"----------this.data_item")
          this.dataLoaded = true
        })
    },
    reportCollaps() {
        window.onload = function() {
        Array.from(
            document.getElementsByClassName("report-collapse-trigger")
        ).forEach(function(item) {
            item.addEventListener("click", function(e) {
            var _btn = this;
            console.log(_btn.parentNode.parentNode.classList.contains("open"));
            if (_btn.parentNode.parentNode.classList.contains("open")) {
                _btn.parentNode.parentNode.classList.remove("open");
            } else {
                _btn.parentNode.parentNode.classList.add("open");
            }
            });
        });
        };
    }
  },
  computed:{
    ...mapState(['companySelection']),
  }

}
</script>

<style lang="scss" scoped>

* {
  box-sizing: border-box;
}

body {
  background-color: #fafafa;
}

.report-container {
  font-family: "Open Sans";
  margin-top: 25px;
  max-width: 1240px;
  margin: 25px auto 25px auto;
  background-color: #fff;
  min-height: 20px;
  border: 1px solid #eaeaea;
  font-size: 0.9rem;
}

.report-controls {
  display: flex;
  flex: 1 1 auto;
  background-color: #f1f6fb;
  padding: 0px;
  width: 100%;
  border-bottom:1px solid #e4e4e4;
}

.controls-left {
  margin-right: auto;
}

.controls-right {
  margin-left: auto;
}

.report-controls .report-dropdown {
  display: inline-block;
}

.report-controls button.report-button {
  padding: 10px;
  background-color: transparent;
  border: none;
  color: #666;
}

.report-controls button.report-button:hover,
.report-controls button.report-button:focus {
  background-color: rgba(0, 0, 170, 0.05);
}

.report-dropdown {
  position: relative;
}

.report-dropdown .report-dropdown-menu {
  display: none;
  position: absolute;
  z-index: 1;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
}

.report-controls .controls-right .report-dropdown .report-dropdown-menu {
  right: 0;
}

.report-dropdown .report-dropdown-menu .report-dropdown-item {
  display: block;
  text-decoration: none;
  padding: 6px 12px;
  color: #444;
  font-size: 0.9em;
}

.report-dropdown .report-dropdown-menu .report-dropdown-item:first-child {
  padding-top: 8px;
}

.report-dropdown .report-dropdown-menu .report-dropdown-item:last-child {
  padding-bottom: 8px;
}

.report-dropdown .report-dropdown-menu .report-dropdown-item:hover,
.report-dropdown .report-dropdown-menu .report-dropdown-item:focus {
  background-color: #d0e2f4;
}

.report-dropdown:hover .report-dropdown-menu,
.report-dropdown:focus .report-dropdown-menu {
  display: block;
}

.report-container .color-red {
  color: red;
}

.report-container .color-green {
  color: green;
}

.report-container .color-blue {
  color: blue;
}

.report-container .color-orange {
  color: orange;
}

.report-container .f-right {
  float: right;
}

.report-header{
  color: #555;
}

.report-title {
  text-align: center;
  font-weight: 300;
  margin-bottom: 30px;
}

.report-name {
  text-align: center;
  text-transform: uppercase;
  font-size: 1.1em;
  color: #555;
  letter-spacing: 1px;
}

.report-name small{
  font-size:.9em;
  font-weight:400;
  display:block;
  margin-top:15px;
  text-transform:none;
}

.report-body{
  padding:10px 15px;;
}

.report-body table{
  width:100%;
  table-layout:fixed;
  border-collapse:collapse;
}

.report-body table thead th{
font-weight:bold;
  border-top:1px solid #444;
  border-bottom:1px solid #444;
  padding:6px 10px;
  border-right:1px dotted #bbb;
}

.report-body table thead th:last-child{
border-right:none;
}

.report-body table tbody tr td{
  font-size:.9em;
  padding:8px 6px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.report-body table tbody tr.tr-primary td {
  padding-bottom:10px;
}

.report-body table tbody tr.tr-primary td:hover{
  background-color:rgba(0,0,0,0.05)
}

.report-body table tbody tr.tr-primary.open + .tr-secondary,
.report-body table tbody tr.tr-primary.open + .tr-secondary + .tr-total{
  display:table-row;
}

.report-body table tbody tr.tr-primary.open .report-collapse-trigger i{
  transform:rotate(45deg);
}

.tr-total{
//   display:none;
}

.report-body table tbody tr.tr-secondary td {
//   border-bottom:1px solid #ddd;
}

.report-body table tbody tr.tr-secondary td:first-child{
  padding-left:30px;
}

.report-collapse-trigger{
  padding:0px;
  cursor:pointer;
  margin-right:.25rem;
  background:none;
  border:none;
  text-decoration:none;
  color:#999;

}

.report-collapse-trigger i{
    transition:all .3s ease;
  transform:rotate(0deg);
}

.report-collapse-trigger:hover,
.report-collapse-trigger:focus{
  color:blue;
}

.tr-total td{
        font-weight:bold !important;
  color:#444;
}
.tr-total {
  padding-bottom:14px;
  border-bottom:1px solid #ddd;
  border-top:1px solid #ddd;
}

.report-body table tfoot th{
  padding:8px 6px;
  border-top:1px solid #999;
  border-bottom:5px double #555;

}

.text-left{
  text-align:left;
}


.text-right{
  text-align:right;
}

.text-center{
  text-align:center;
}

.report-timestamp{
  margin:20px 0px 30px;
}

</style>