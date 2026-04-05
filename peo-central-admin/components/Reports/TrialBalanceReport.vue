<template>
    <v-card id="card">
        <v-card-title id="card-title">
        <h4>Trial Balance Report</h4>
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
            <h4 class="font-wight-bold text--text mb-2" >Trial Balance</h4>
            </div>
            <!-- report-body -->
            <div class="report-body">
            <table>
                <thead>
                <tr>
                    <th colspan="5" class="text-left">ACCOUNT</th>
                    <th colspan="2" class="text-right" style="width:100px;">DEBIT</th>
                    <th colspan="2" class="text-right" style="width:100px;">CREDIT</th>
                </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in data_item"
                      :key="index"
                      class="tr-secondary" @click="openAccountItemPop(item)">
                      <td colspan="5" class="text-left">{{ item.name }}</td>
                      <td colspan="2" class="text-right">{{item.debit | twoDecimals}}</td>
                      <td colspan="2" class="text-right">{{ item.credit | twoDecimals}}</td>
                  </tr>
                  <!-- <tr class="tr-secondary" @click="openPop('VAT Expanded View')">
                    <td colspan="5" class="text-left">VAT Expanded View</td>
                    <td colspan="2" class="text-right">&nbsp;</td>
                    <td colspan="2" class="text-right">328.25</td>
                </tr> -->
                </tbody>
                <tfoot>
                <tr class="tfoot_tr" style="border-top:1px solid #999 !important;">
                    <th colspan="5" class="text-left  font-weight-bold">TOTAL</th>
                    <th colspan="2" class="text-right font-weight-bold">AED {{ total_debit | twoDecimals}}</th>
                    <th colspan="2" class="text-right font-weight-bold">AED {{  total_credit | twoDecimals}}</th>
                </tr>
                </tfoot>
            </table>
            </div>
            <div class="report-footer">
                <div class="report-timestamp text-center">
                    {{ date_now }}
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
  methods: {

    handlePrint() {
      window.print()
    },
    async getReport(){
      const list = ["63ea1b6f2b5f68743ccbfc87", "63f5c98bf29f9cb7b24fca68"]
      const payload = { 
        company: this.$store.getters.getSelectedCompanies.map(a=>a.id), 
        "from_date": "2020-02-22",
        "to_date": "2024-02-24"
      }
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`reports/trail-balance`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.data_item = res.data
          this.data_item = this.data_item.filter( je => je.JE.length>0)
          this.total_credit = this.data_item.map( a => a.credit).reduce( (a,b)=> a+b, 0)
          this.total_debit = this.data_item.map( a => a.debit).reduce( (a,b)=> a+b, 0)
          console.log(this.data_item,"-------this.data_item")
        })
    },
    openPop(value) {
      this.$emit('openDetails')
    },
    openAccountItemPop(val){
      this.$emit('openAccountItem',val)
    }
  },
  computed:{
    ...mapState(['companySelection']),
  }

}
</script>


<style scoped>
.report_box {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-around !important;
  padding: 0 20px !important;
  max-width: 300px !important;
  min-width: 300px !important;
  height: 75px !important;
  border: 1px solid #E2E7F1 !important;
  box-shadow: none !important;
  margin-right: 10px !important;
  margin-bottom: 10px !important;
}
.reps_con {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
}
.d_none {
  display: none !important;
}

/* table */

.controls-right {
  margin-left: auto;
}

 .report-dropdown {
  display: inline-block;
}

 button.report-button {
  padding: 10px;
  background-color: transparent;
  border: none;
  color: #666;
}

 button.report-button:hover,
 button.report-button:focus {
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

 .controls-right .report-dropdown .report-dropdown-menu {
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

 .color-red {
  color: red;
}

 .color-green {
  color: green;
}

 .color-blue {
  color: blue;
}

 .color-orange {
  color: orange;
}

 .f-right {
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

.report-body table tbody .tr-secondary,
.report-body table tbody  + .tr-secondary + .tr-total{
  display:table-row;
}

.report-body table tbody .report-collapse-trigger i{
  transform:rotate(45deg);
}

.report-body table tbody tr.tr-secondary,.report-body table tbody tr.tr-total{
  /* display:none; */
}

.report-body table tbody tr.tr-secondary td {
  border-bottom:1px solid #ddd;
}

.report-body table tbody tr.tr-secondary td:first-child{
  /* padding-left:30px; */
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


.report-body table tbody tr.tr-total{
  font-weight:bold;
  color:#444;
}

.report-body table tbody tr.tr-total td{
  padding-bottom:14px;
}

.report-body table tfoot th{
  padding:8px 6px;
  border-top: 2px solid #999;
  border-bottom: 2px solid #555;
}

.tfoot_tr{
  padding:8px 6px;
  border-top:1px solid #999;
  border-bottom:2px solid #555;
}

.tr-secondary {
  background-color: #fff;
  border-color: white !important; 
  border-bottom: 2px solid #fff;
  padding: 10px 0 !important;
} 
.tr-secondary:hover {
  background: #dddd;
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