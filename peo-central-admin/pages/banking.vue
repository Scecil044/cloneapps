<template>
  <v-row class="wrapper_row">


    <!-- SNACKBAR -->
    <v-snackbar v-show="snackbar_data.snackbar" class="snackbar" :timeout="snackbar_data.timeout" v-model="snackbar_data.snackbar" top min-width="100%" min-height="30px" rounded="0" elevation="0" :color="snackbar_data.color">
      <div>
        <v-icon small color="white" v-if="snackbar_data.color=='success'">fa-check</v-icon>
        <v-icon small color="error" v-else>fa-close</v-icon>
        <span class="text_light--text ml-3">{{ snackbar_data.text }}</span>
      </div>
    </v-snackbar>

    <!-- ADD NEW BANK ACCOUNT DIALOG -->
    <v-dialog v-model="addNewBankAccountDialog" class="ma-0 pa-0">
      <div class="my_dialog">
        <v-card id="tall_dialog">
          <v-card-title id="card-title">
              <h4 class="text--text">Add New Bank Account</h4>
              <div class="flex_row justify-lg-space-between">
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="addNewBankAccountDialog=false">Done</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px" @click="handleAddNewBankAccount">Add Account</v-btn>
              </div>
          </v-card-title>
          <v-divider id="divider" class="mt-5"></v-divider>
          <v-card-text id="card-text">
            <v-container>

              <!-- INPUTS -->
              <v-row>
                
                <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                      <CustomInputContainer label="Account Number">
                        <div slot="input">
                          <v-select  :items="allCustomers" placeholder="Enter Account Number" outlined hide-details></v-select>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12">
                      <CustomInputContainer label="Account Type">
                        <div slot="input">
                          <v-text-field  placeholder="Enter Account Type" outlined hide-details></v-text-field>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                </v-col>

                <v-col cols="3" class="pa-0">
                  <v-col cols="12">
                    <CustomInputContainer label="Account Type">
                      <div slot="input">
                        <v-text-field  placeholder="Enter Account Type" outlined hide-details></v-text-field>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12">
                    <CustomInputContainer label="Date">
                      <div slot="input">
                        <v-text-field placeholder="Enter Date" outlined hide-details></v-text-field>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-col>

                <v-col cols="3" class="pa-0">
                  <v-col cols="12">
                    <CustomInputContainer label="Due date">
                    <div slot="input">
                      <v-text-field placeholder="Enter Due Date" outlined hide-details></v-text-field>
                    </div>
                  </CustomInputContainer>
                  </v-col>
                  <v-col cols="12">
                    <CustomInputContainer label="Sale Location">
                    <div slot="input">
                      <v-text-field  placeholder="Enter Location" outlined hide-details></v-text-field>
                    </div>
                  </CustomInputContainer>
                  </v-col>
                </v-col>
                
              </v-row>
              
            </v-container>
          </v-card-text>
        </v-card>
      </div>
    </v-dialog>

    <!-- FILTER DIALOG -->
    <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
            <h4 class="text--text">Filter</h4>
            <v-icon small color="subtext" class="ml-5" @click="filterDialog=false">fa-close</v-icon>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
              <v-radio-group v-model="filterDialog">
              <v-radio value="all">
                  <template v-slot:label>
                    <span class="text--text">All</span>
                  </template>
              </v-radio>
              <v-radio value="week">
                  <template v-slot:label>
                    <span class="text--text">Week to date</span>
                  </template>
              </v-radio>
              <v-radio value="month">
                  <template v-slot:label>
                    <span class="text--text">This month to date</span>
                  </template>
              </v-radio>
              <v-radio value="quarter">
                  <template v-slot:label>
                    <span class="text--text">This quarter to date</span>
                  </template>
              </v-radio>
              <v-radio value="year">
                  <template v-slot:label>
                    <span class="text--text">This year to date</span>
                  </template>
              </v-radio>
              <v-radio value="specific">
                <template v-slot:label>
                  <span class="text--text" @click="customDataDisabled=!customDataDisabled">Specific dates</span>
                </template>
              </v-radio>
              </v-radio-group>
              <div class="custom_data">
                <v-row class="ma-0 pa-0">
                  <v-spacer></v-spacer>
                  <v-col cols="8" class="ma-0 pa-0">
                    <div class="flex_row align-baseline ">
                      <span>From</span>
                    <div><v-select :disabled="customDataDisabled" :items="daysOfWeek" placeholder="12" style="max-width: 90px !important" class="ml-9"></v-select></div>
                    <div><v-select :disabled="customDataDisabled" :items="monthsOfYear" placeholder="Jan" style="max-width: 90px !important" class="ml-3"></v-select></div>
                    <div><v-select :disabled="customDataDisabled" :items="Years" placeholder="2022" style="max-width: 120px !important" class="ml-3"></v-select></div>
                    </div>
                  </v-col>
                </v-row>
                <v-row class="ma-0 pa-0">
                  <v-spacer></v-spacer>
                  <v-col cols="8" class="ma-0 pa-0">
                    <div class="flex_row align-baseline ">
                      <span>Till</span>
                    <div><v-select :disabled="customDataDisabled" :items="daysOfWeek" placeholder="14" style="max-width: 90px !important" class="ml-9"></v-select></div>
                    <div><v-select :disabled="customDataDisabled" :items="monthsOfYear" placeholder="Mar" style="max-width: 90px !important" class="ml-3"></v-select></div>
                    <div><v-select :disabled="customDataDisabled" :items="Years" placeholder="2022" style="max-width: 120px !important" class="ml-3"></v-select></div>
                  </div>
                  </v-col>
                </v-row>
              </div>
              <div class="other_filters mt-2">
                <v-row>
                  <v-col cols="6" class="ma-0 pa-0"><v-checkbox color="primary" label="Customer"></v-checkbox></v-col>
                  <v-col cols="6" class="ma-0 pa-0"><v-select :items="customerFilter" label="All"></v-select></v-col>
                  <v-col cols="6" class="ma-0 pa-0"><v-checkbox color="primary" label="Status"></v-checkbox></v-col>
                  <v-col cols="6" class="ma-0 pa-0"><v-select :items="statusFilter" label="Paid"></v-select></v-col>
                </v-row>
              </div>
              <v-row class="action_btn mt-5">
                <v-col cols="5" class="ma-0 pa-0"><v-btn class="tall__btn" color="subtext" block outlined><span class="primary--text">Clear All</span></v-btn></v-col>
                <v-spacer></v-spacer>
                <v-col cols="6" class="ma-0 pa-0"><v-btn class="tall__btn" color="primary" block @click="handleApplyFilter">Apply</v-btn></v-col>
              </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>


    <!-- UPLOAD STATEMENT DIALOG -->
    <v-dialog v-model="uploadStatementDialog" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
            <h4 class="text--text">Upload Statement</h4>
            <v-icon small color="subtext" class="ml-5" @click="uploadStatementDialog=false">fa-close</v-icon>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-row class="ma-0 pa-0">
              <v-col sm="12" md="12" lg="12" class="px-0">
                <CustomInputContainer label="SELECT BANK">
                  <div slot="input">
                    <v-select :items="banks" v-model="selectBank" placeholder="EmiratesNBD" outlined hide-details></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col sm="12" md="12" lg="12" class="px-0">
                <FileDropZone />
              </v-col>
              <v-col sm="12" md="12" lg="12" class="px-0">
                <v-btn class="tall__btn" color="primary" block @click="handelProceed">Proceed</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>


    <!-- STATEMENT CONFIRMATION DIALOG -->
    <v-dialog v-model="statementConfirmationDialog" persistent max-width="90%">
    <v-card id="card" style="padding: 20px 30px !important">
      <v-card-title id="card-title">
        <h4 class="text--text">Uploaded Statements</h4>
        <div class="flex_row align-center">
          <v-btn color="subtext" class="tall__btn mr-3" outlined @click="statementConfirmationDialog=false">Cancel</v-btn>
          <v-btn color="primary" class="tall__btn" @click="statementApproving">Approve & Upload</v-btn>
        </div>
      </v-card-title>
      <v-card-text id="card-text">
        <v-data-table
              class="main__table elevation-0"
              :v-model="selected_account.account_statement"
              :headers="banking_headers"
              :items="selected_account.account_statement"
              :search="banking_search"
              item-key="banking_selected"
              selectable-key="id"
              show-select
              hide-default-footer
              >
              <template v-slot:item="{ item,index }">
                <tr style="">
                  <td class="pa-0 ma-0">
                    <div class="flex_row align-center justify-center" :style="{ borderLeft: '4px solid' + item.color }">
                      <v-checkbox color="info" on-icon="fa-light fa-square-check" off-icon="fa-regular fa-square" class="mx-auto mb-2" dense hide-details :v-model="banking_selected" ></v-checkbox>
                    </div>
                  </td>
                  <td class="pa-0 ma-0">{{ item.date }}</td>
                  <td class="pa-0 ma-0">{{ item.description }}</td>
                  <td class="pa-0 ma-0">{{ item.no }}</td>
                  <td class="pa-0 ma-0">{{ item.debit }}</td>
                  <td class="pa-0 ma-0">{{ item.credit }}</td>
                  <td class="pa-0 ma-0">{{ item.balance }}</td>
                  <td class="pa-0 ma-0" style="width: 30px;">
                    <div class="actions__con">
                      <span class="print primary--text">Print</span>
                      <v-btn color="subtext" icon><v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                    </div>
                  </td>
                </tr>
              </template>

        </v-data-table>
      </v-card-text>
    </v-card>
    </v-dialog>



    <!-- STATEMENT -->
    <v-row class="statements_row">
      <v-card color='card_bg'  id="card">

        <!-- chose the bank account -->
        <v-card-title id="card-title">
          <div class="banks_accounts__con flex_row">
            <v-btn 
            v-for="(item, index) in bank_accounts_data" :key="index" 
            color="outline" outlined 
            width="150px" height="40px" 
            class="mr-3 bank_logo__bg"
            :style="{ background: 'url(' + item.bank_logo + ')' }"
            @click="handleBankAccount(item)"
            >
            </v-btn>
            <v-btn class="tall__btn" color="subtext" outlined width="128px" height="40px" @click="addNewBankAccountDialog=true">
              <v-icon color="subtext" class="mr-2" small>fa-plus</v-icon>
              Add Account
            </v-btn>
          </div>
        </v-card-title>


        <v-card-text id="card-text">

          <!-- Bank Account Information Card -->
          <v-card color='card_bg' outlined id="card" style="box-shadow:none !important;">
            <div class="flex_row justify-space-between">
              <span class="text--text">{{ selected_account.bank_name }} info</span>
              <v-btn color="outline" icon><v-icon small>fa-eye</v-icon></v-btn>
            </div>
            
            <div class="account_info__con flex_row justify-lg-space-between my-5">

              <div class="account_no pl-3" style="border-left: 2px solid blue">
                <span class="caption subtext--text">Account no</span>
                <h5 class="text--text">{{ selected_account.account_no }}</h5>
              </div>
              <div class="account_no pl-3" style="border-left: 2px solid red">
                <span class="caption subtext--text">Card no</span>
                <h5 class="text--text">{{ selected_account.card_no }}</h5>
              </div>
              <div class="account_no pl-3" style="border-left: 2px solid blue">
                <span class="caption subtext--text">Total Balance</span>
                <h5 class="text--text">AED {{ selected_account.total_balance  | twoDecimals }}</h5>
              </div>
              <div class="account_no pl-3" style="border-left: 2px solid blue">
                <span class="caption subtext--text">Account type</span>
                <h5 class="text--text">{{ selected_account.account_type }}</h5>
              </div>
              <div class="account_no pl-3" style="border-left: 2px solid red">
                <span class="caption subtext--text">MICR</span>
                <h5 class="text--text">{{ selected_account.micr }}</h5>
              </div>
              
            </div>
          </v-card>

          <v-spacer class="my-5"></v-spacer>

          <!-- Bank Statements Table -->
          <v-row>
            <v-col cols="12">
              <v-data-table
                class="main__table elevation-0"
                :v-model="selected_account.account_statement"
                :headers="banking_headers"
                :items="selected_account.account_statement"
                :search="banking_search"
                item-key="banking_selected"
                selectable-key="id"
                show-select
                hide-default-footer
                >
                
                <!-- Top -->
                <template v-slot:top>
                  <div class="top__con">
                    <h4>Statements For NBD</h4>
                    <div class="action__btn flex_row">
                      <v-btn class="tall__btn text_light--text" color="primary" @click="uploadStatementDialog=true">Upload statement</v-btn>
                      <v-text-field
                        class="search_bar ml-2"
                        v-model="banking_search"
                        label="Search By"
                        color="outline"
                        outlined
                        solo
                        flat
                        hide-details
                        dense
                        height="45px"
                        >
                        <template slot="prepend-inner">
                          <v-btn icon><v-icon small>fa-search</v-icon></v-btn>
                        </template>
                      </v-text-field>
                      <v-btn class="tall__btn ml-2 subtext--text" color="subtext" outlined @click="filterDialog=true">
                        <v-icon class="mr-2" small>fa-filter</v-icon>
                        Filter
                      </v-btn>
                    </div>
                  </div>
                </template>

                <!-- Table Rows -->
                <template v-slot:item="{ item,index }">
                  <tr style="">
                    <td class="pa-0 ma-0">
                      <div class="flex_row align-center justify-center" :style="{ borderLeft: '4px solid' + item.color }">
                        <v-checkbox color="info" on-icon="fa-light fa-square-check" off-icon="fa-regular fa-square" class="mx-auto mb-2" dense hide-details :v-model="banking_selected" ></v-checkbox>
                      </div>
                    </td>
                    <td class="pa-0 ma-0">{{ item.date }}</td>
                    <td class="pa-0 ma-0">{{ item.description }}</td>
                    <td class="pa-0 ma-0">{{ item.no }}</td>
                    <td class="pa-0 ma-0">{{ item.debit }}</td>
                    <td class="pa-0 ma-0">{{ item.credit }}</td>
                    <td class="pa-0 ma-0">{{ item.balance }}</td>
                    <td class="pa-0 ma-0" style="width: 30px;">
                      <div class="actions__con">
                        <span class="print primary--text">Print</span>
                        <v-btn color="subtext" icon><v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                      </div>
                    </td>
                  </tr>
                </template>

              </v-data-table>
            </v-col>
          </v-row>

        </v-card-text>
      </v-card>
    </v-row>
  </v-row>
</template>

<script>
import '@/assets/scss/_banking.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropZone from '@/components/utils/FileDropzone.vue'

export default {
  layout: 'dashboard',
  components: { CustomInputContainer, FileDropZone },
  data() {
    return {
      // ADD NEW BANK ACCOUNT
      addNewBankAccountDialog: false,
      allCustomers: ['Customer1', 'Customer2'],

      // FILTER
      filterDialog: false,
      filter_by: [ 'All', 'Week to date', 'This month to date', 'This quarter to date', 'This year to date', 'Specific dates'], 
      customerFilter: ['All', 'Other',],
      statusFilter: ['Paid', 'Unpaid'],
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      monthsOfYear: ['Jan', 'Feb', 'Mar', 'Apr'],
      Years: [2022, 2021, 2020],
      customDataDisabled: true,
      snackbar_data: { snackbar: false, text: 'Successfully', color: 'success', timeout: 2000 },
      statementConfirmationDialog: false,
      banks: ['Emeritus NBD', 'ADCB'],
      uploadStatementDialog: false,
      selected_account: [],

      // DATA TABLE
      banking_selected: [],
      banking_search: '',
      banking_headers: [
        { text: 'Txn date', value: 'date', align: 'start' },
        { text: 'Description', value: 'description' },
        { text: 'Ref no/Cheque no', value: 'no' },
        { text: 'Debit', value: 'debit' },
        { text: 'Credit', value: 'credit' },
        { text: 'Balance', value: 'balance' },
        { text: 'Action', value: 'action', sortable: false },
      ],

      // USER BANK ACCOUNTS
      bank_accounts_data: [
        {
          id: '0', 
          account_no: 'XXXX XXXX XX 489', 
          account_type: 'Savings', 
          card_no: 'XXXX XXXX XX 489', 
          total_balance: '56,895,632.56', 
          micr: 'XXXX XXXX XX 489', 
          bank_name: 'Emirates NBD',
          bank_logo: 'data:image/png;base64,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',
          account_statement: [
            { 
              id: 0,
              date: '22/5/2022', 
              description: '',
              no: '00125325641',
              debit: 'AED 2000.00',
              credit: '',
              balance: 'AED 23,434.00',
              action: '',
            }
          ],
        },
        {
          id: '1', 
          account_no: 'XXXX XXXX XX 590', 
          account_type: 'Fixed ', 
          card_no: 'XXXX XXXX XX 271', 
          total_balance: '490,900.00', 
          micr: 'XXXX XXXX XX 231', 
          bank_name: 'ADCB',
          bank_logo: 'https://fci.nl/sites/default/files/ADCB-Logo.jpg',
          account_statement: [
            { 
              id: 0,
              date: '01/9/2021', 
              description: '',
              no: '0009880002',
              debit: '',
              credit: 'AED 150.50',
              balance: 'AED 190,301.00',
              action: '',
            },
            { 
              id: 1,
              date: '31/11/2022', 
              description: '',
              no: '100233422',
              debit: 'AED 790,500.25',
              credit: '',
              balance: 'AED 390,000.00',
              action: '',
            }
          ],
        },
      ],
    }
  },
  methods: {
    handleAddNewBankAccount() {
      this.snackbar_data = { snackbar: true, text: 'Account Added Uploaded', color: 'success', timeout: 2000 }
      this.addNewBankAccountDialog = false
    },
    handleApplyFilter() {
      this.filterDialog = false
    },
    statementApproving() {
      this.snackbar_data = { snackbar: true, text: 'Statements Uploaded', color: 'success', timeout: 2000 }
      this.statementConfirmationDialog = false
    },
    handelProceed() {
      this.statementConfirmationDialog = true
      this.uploadStatementDialog = false
    },
    handleBankAccount(value) {
      this.selected_account = value
      console.log('BANK DATA ==>', value)
    },
    initializeSelectedBankAccount() {
      this.selected_account = this.bank_accounts_data[0];
    }
  },
  mounted () {
    this.initializeSelectedBankAccount();
  }
}
</script>
  