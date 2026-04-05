<template lang="">
  <v-container fluid>
    <v-row>
      <SnackBar :data="snackbar_data" />
      <v-col cols="12">
        <v-card id="card">
          <v-card-title id="card-title" class="mb-4 pa-2">
            <h4 class="text--text">Manual Journal Entry</h4>
            <div class="d-flex align-center">
              <v-btn @click="handleClose" class="mr-5 tall__btn"  color="primary" outlined>
                Cancel
              </v-btn>
            <v-btn color="primary" class="tall__btn" @click="handleSubmit">Submit</v-btn></div>
          </v-card-title>
          <v-form ref="journalForm" v-model="valid" lazy-validation>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <CustomInputContainer label="Company" :mandatory="true">
                  <div slot="input">
                    <v-select
                      v-model="company_id"
                      :items="companySelection"
                      placeholder="Current Company"
                      return-object
                      outlined
                      dense
                      item-text="name"
                      :rules="required_rule"
                      @change="(value)=>fetchAccounts(value)"
                      v-if="companySelection.length >= 1"
                      append-icon="fa-chevron-down"
                    ></v-select>
                    <p class="error--text" v-if="!Object.keys(company_id).length">Please select Company*</p>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4">
                 <CustomInputContainer label="Journal Date" :mandatory="true">
                      <div slot="input">
                        <v-menu
                          v-model="journal_date_menu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="journal_date"
                              placeholder="Enter Journal Date"
                              outlined
                              hide-details
                              dense
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              :rules="required_rule"
                            />
                          </template>
                          <v-date-picker
                            v-model="journal_date"
                            @input="journal_date_menu = false"
                          />
                        </v-menu>
                      </div>
                    </CustomInputContainer>
              </v-col>
              <v-col cols="12">
                <h5 class="mb-3">Journal Entry</h5>
                <v-simple-table class="invoice_journal_table">
                  <template v-slot:default>
                    <thead class="invoice_journal_thead">
                      <tr class="" style="height: 35px !important">
                        <th
                          v-for="item in journal_entry_headers"
                          :key="item"
                          class="text-left text--text font-weight-bold journal_entry_headers"
                          style="
                            font-size: 12px !important;
                            font-weight: 500 !important;
                          "
                        >
                          {{ item }}
                        </th>
                        <th>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="invoice_journal_tbody">
                      <tr
                        class="invoice_journal_rows"
                        v-for="(item, index) in journal_entry"
                        :key="index"
                        v-if="journal_entry.length > 0"
                      >
                        <td class="">Journal</td>
                        <td class="">
                          <v-select
                            :value="item?.account_name ?? 0"
                            :items="accounts"
                            placeholder="Account Name"
                            return-object
                            single-line
                            outlined
                            dense
                            class="mt-4"
                            item-text="name"
                            :rules="main_rule"
                            append-icon="fa-chevron-down"
                            :disabled="!Object.keys(company_id).length"
                            @change="($event)=> handleAccount($event,index)"
                          ></v-select>
                        </td>
                        <td class="">
                          <v-text-field
                            :value="item?.debit ?? 0"
                            placeholder="0.00"
                            single-line
                            outlined
                            dense
                            class="mt-4"
                            type="number"
                            :disabled="!Object.keys(company_id).length"
                            @input="
                              ($event) => handleAmount('debit', index, $event)
                            "
                          ></v-text-field>
                        </td>
                        <td class="">
                          <v-text-field
                            :value="item?.credit ?? 0"
                            placeholder="0.00"
                            single-line
                            outlined
                            dense
                            class="mt-4"
                            type="number"
                            :disabled="!Object.keys(company_id).length"
                            @input="
                              ($event) => handleAmount('credit', index, $event)
                            "
                          ></v-text-field>
                          <td>
                            <v-btn  @click.prevent="()=>deleteJournalEntry(item.id)" color="red" icon>
                              <v-icon small>fa-trash</v-icon>
                            </v-btn>
                          </td>
                        </td>
                      </tr>
                      <tr class="invoice_journal_rows" v-else>
                        <td>Nothing to Show</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>
                          <v-btn
                        outlined
                        @click.prevent="addJournalEntry"
                        color="primary"
                        class="tall__btn mt-2"
                      >
                        <v-icon class="mr-2" small>fa-add</v-icon> Add Entry
                      </v-btn>
                        </td>
                        <td><span v-if="!Object.keys(company_id).length" class="red--text">Please fill the fields After Selecting Company*</span><span v-else-if="journal_entry.some(item=>item.account_name == '')" class="red--text">Please fill the fields*</span></td>
                        <td>Total : AED {{debitTotal | amountFormatter}}</td>
                        <td>Total : AED {{creditTotal | amountFormatter}}</td>
                      </tr>
                    </tfoot>
                  </template>
                </v-simple-table>
              </v-col>
              <v-col cols=12>
                 <CustomInputContainer label="Memo" :mandatory="true">
                  <div slot="input">
                    <v-textarea
                      v-model="notes"
                      placeholder="Enter your Notes"
                      outlined
                      dense
                      :rules="required_rule"
                      style="min-width: 23vw !important"
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-card-text>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import { mapState, mapMutations } from 'vuex'
import SnackBar from '@/components/utils/SnackBar.vue'

export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    SnackBar,
  },
  data() {
    return {
      valid:true,
      journal_entry_headers: ['Type', 'Account Name', 'Debit', 'Credit'],
      journal_entry: [
        {
          id: Math.random(),
          type: '',
          account: '',
          account_name: '',
          credit: 0,
          debit: 0,
        },
      ],
      notes:'',
      company_id: {},
      journal_date_menu:false,
      journal_date:'',
      accounts: [],
      required_rule: [(v) => !!v || 'This filed is required'],
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
    }
  },

  computed: {
    ...mapState(['companySelection']),
    creditTotal(){
      return this.journal_entry.map(item=>item.credit === ''?0 : parseFloat(item.credit)).reduce((partial,acc) => partial + acc,0)
    },
    debitTotal(){
      return this.journal_entry.map(item=>item.debit === ''?0 : parseFloat(item.debit)).reduce((partial,acc) => partial + acc, 0)
    }
  },
  methods: {
    ...mapMutations(['setShowLoader']),
    handleClose() {
      this.$router.replace('/dashboard')
    },
    addJournalEntry() {
      this.journal_entry.push({
        id: Math.random(),
        type: '',
        account: '',
        account_name: '',
        credit: 0,
        debit: 0,
      })
    },
    handleAccount(value,index) {
      if(this.creditTotal !== this.debitTotal){
        let difference_amount = this.debitTotal - this.creditTotal
        difference_amount>0 ? this.journal_entry[index].credit = difference_amount : this.journal_entry[index].debit = difference_amount * -1
      }
      this.journal_entry[index].account_name = value.name
      this.journal_entry[index].account = value._id
      this.journal_entry[index].id = value._id
    },
    deleteJournalEntry(id){
      this.journal_entry = this.journal_entry.filter(item=>item.id !== id)
    },
    handleAmount(type, rowIndex, value) {
      console.log({
        type,
        value,
      })
      let tempJournalData = this.journal_entry
      switch (type) {
        case 'credit':
          tempJournalData[rowIndex].credit = value
          break

        case 'debit':
          tempJournalData[rowIndex].debit = value
          break
        default:
          break
      }
    },
    handleSubmit(){
      this.$refs.journalForm.validate()
      if(this.creditTotal === 0 && this.debitTotal === 0){
         this.snackbar_data = {
            snackbar: true,
            text: 'Please give some Journals',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
          return
      }
      if(this.$refs.journalForm.validate()){
        if(this.creditTotal === this.debitTotal){
            let temp_journalData = this.journal_entry
            temp_journalData =  temp_journalData.map(item=>{
              let tempAmount = 0;
              let creditAmount = isNaN(item.credit)?0:item.credit
              let debitAmount = isNaN(item.debit)?0:item.debit
              if(creditAmount > debitAmount){
                tempAmount = creditAmount
              }
              else{
                tempAmount = debitAmount
              }
              return {
                ...item,
                amount:tempAmount,
                isDebit: debitAmount>creditAmount?true:false,
                isCredit:creditAmount>debitAmount?true:false,
              }
            })
            let payload = {
              journal_date:this.journal_date,
              notes:this.notes,
              line_items:temp_journalData,
              sub_total:this.creditTotal,
              vat_total:0,
              total:this.creditTotal,
              company:this.company_id.id,
              manual:true,
            }
                  const AuthStr = 'Bearer '.concat(this.$store.state.token)

            console.log({payload})
            this.$axios.$post('journal-entry',payload,{
              headers: { Authorization: AuthStr },
            }).then(res=> {
              this.snackbar_data = {
                snackbar: true,
                text: 'Journal is Created Successfully',
                color: 'success',
                icon: 'check',
                timeout: 2000,
              }
              setTimeout(() => {
                this.$router.replace('/dashboard')
              }, 1200);
            }).catch(err=> {
               this.snackbar_data = {
                snackbar: true,
                text: 'Failed to Create Journal',
                color: 'danger',
                icon: 'info',
                timeout: 2000,
              }
            })
        }
        else{
          this.snackbar_data = {
            snackbar: true,
            text: 'Amount is not matching',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
        }
      }
      
    },
    fetchAccounts(value={}){
      const payload = {
        company: [value.id]
      }
         const AuthStr = 'Bearer '.concat(this.$store.state.token)
    this.$axios
      .$post('account/list', payload, { headers: { Authorization: AuthStr } })
      .then((res) => {
        this.accounts = res.data.accounts
      })
      .catch((err) => {
        this.setShowLoader(false)
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to load Accounts',
          color: 'danger',
          icon: 'check',
          timeout: 2000,
        }
      })
    }
  },
  mounted() {
    
  },
}
</script>
<style lang=""></style>
