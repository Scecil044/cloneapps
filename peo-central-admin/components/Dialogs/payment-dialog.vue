<!-- <template>
          <v-dialog class="add_new_payment_dialog ma-0 pa-0" v-model="addNewPaymentDialog">
        <div class="my_dialog">
            <v-card id="tall_dialog" style="height: 95vh !important;overflow: auto;">
            <v-card-title id="card-title">
                <h4 class="text--text" v-if="PaymentDialogStage=='default'">Receive Payment</h4>
                <h4 class="text--text" v-if="PaymentDialogStage=='recurring'">Payment Recurring</h4>
                <div class="flex_row justify-lg-space-between">
                <h4 class="text--text mr-9" v-if="PaymentDialogStage=='recurring'">Balance due : 0.00</h4>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="addNewPaymentDialog=false">Close</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="PaymentDialogStage='recurring'" v-if="PaymentDialogStage==='default'">Make Recurring</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="PaymentDialogStage='default'" v-if="PaymentDialogStage==='recurring'">Not Recurring</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px" @click="handleSavePayment"><v-icon class="mr-2" small>fa-check</v-icon>Process</v-btn>
                </div>
            </v-card-title>
            <v-divider id="divider" class="mt-5"></v-divider>
            <v-card-text id="card-text"  >
                <v-row class="adding_payment" v-if="PaymentDialogStage==='default'">
                <v-row class="row-1 pa-0">
                    <v-col cols="3">
                        <CustomInputContainer label="Customer">
                        <div slot="input">
                            <v-select v-model="new_invoice.customer" :items="sales_data.customer" placeholder="Enter Customer Name" outlined hide-details dense></v-select>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Email">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Customer Email" outlined hide-details dense />
                        </div>
                        </CustomInputContainer>
                    </v-col>
                </v-row>
                <v-col cols="3">
                    <CustomInputContainer label="Payment Date">
                    <div slot="input">
                    <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                        <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="new_invoice.date" placeholder="12/2/2022" outlined hide-details dense readonly v-bind="attrs" v-on="on" />
                        </template>
                        <v-date-picker v-model="new_invoice.date" @input="menu2 = false" />
                    </v-menu>
                    </div>
                    </CustomInputContainer>
                </v-col>
                <v-col cols="3">
                    <CustomInputContainer label="Payment Method">
                    <div slot="input">
                    <v-text-field placeholder="Cheque" outlined hide-details dense/>
                    </div>
                </CustomInputContainer>
                </v-col>
                <v-col cols="3">
                    <CustomInputContainer label="Ref no">
                    <div slot="input">
                    <v-text-field placeholder="1256.0" outlined hide-details dense/>
                    </div>
                </CustomInputContainer>
                </v-col>
                <v-row class="row-3 pa-0">
                    <v-col cols="3">
                    <CustomInputContainer label="Deposit to">
                        <div slot="input">
                        <v-text-field placeholder="Checking acc" outlined hide-details dense/>
                        </div>
                    </CustomInputContainer>
                    </v-col>
                </v-row>
                <v-row class="payment_dialog_table pa-0 ma-0 mt-9">
                    <v-col cols="12" class="table-1 ma-0 pa-0">
                    <h4 class="text-tetxt mb-2">Outstanding Transactions</h4>
                    <v-simple-table dense class="payment_dialog_simple_table">
                        <template v-slot:default>
                        <thead>
                            <tr class="outline" style="height: 45px !important">
                            <th v-for="item in outstandingTransactionsTableHeaders" :key="item" class="text-center text-text font-weight-normal" style="font-size: 12px !important; font-weight: 500 !important">{{ item }}</th>
                            </tr>
                        </thead>
                        <tbody>
                        <v-btn v-if="OT_PaymentDialogLineOne==false&&OT_PaymentDialogLineTwo==false" @click="OT_PaymentDialogLineOne=true" icon color="primary" class="rounded text-center" block><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                            <tr v-if="OT_PaymentDialogLineOne==true" style="background: #e2e7f142 !important">
                            <td>#</td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <div class="flex_row justify-space-between ma-0 pa-0">
                                <v-btn @click="OT_PaymentDialogLineTwo=true" icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="OT_PaymentDialogLineOne=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                                </div>
                            </td>
                            </tr>
                            <tr v-if="OT_PaymentDialogLineTwo==true" style="background: #e2e7f142 !important">
                            <td>#</td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;"/>
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <div class="flex_row justify-space-between ma-0 pa-0">
                                <v-btn disabled icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="OT_PaymentDialogLineTwo=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                                </div>
                            </td>
                            </tr>
                        </tbody>
                        </template>
                    </v-simple-table>
                    </v-col>
                    <v-col cols="12" class="table-2 ma-0 pa-0 mt-4">
                    <h4 class="text-tetxt mb-2">Credits</h4>
                    <v-simple-table dense class="payment_dialog_simple_table">
                        <template v-slot:default>
                        <thead>
                            <tr class="outline" style="height: 45px !important">
                            <th v-for="item in CreditsTableHeaders" :key="item" class="text-center text-text font-weight-normal" style="font-size: 12px !important; font-weight: 500 !important">{{ item }}</th>
                            </tr>
                        </thead>
                        <tbody>
                        <v-btn v-if="CR_PaymentDialogLineOne==false&&CR_PaymentDialogLineTwo==false" @click="CR_PaymentDialogLineOne=true" icon color="primary" class="rounded text-center" block><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                            <tr v-if="CR_PaymentDialogLineOne==true" style="background: #e2e7f142 !important">
                            <td>#</td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <div class="flex_row justify-space-between ma-0 pa-0">
                                <v-btn @click="CR_PaymentDialogLineTwo=true" icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="CR_PaymentDialogLineOne=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                                </div>
                            </td>
                            </tr>
                            <tr v-if="CR_PaymentDialogLineTwo==true" style="background: #e2e7f142 !important">
                            <td>#</td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <div class="flex_row justify-space-between ma-0 pa-0">
                                <v-btn disabled icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="CR_PaymentDialogLineTwo=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                                </div>
                            </td>
                            </tr>
                        </tbody>
                        </template>
                    </v-simple-table>
                    </v-col>
                </v-row>
                <v-row class="estimate_dialog_footer mt-9">
                    <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                        <CustomInputContainer label="Memo">
                        <div slot="input">
                            <v-textarea placeholder="Enter Your Memos" outlined hide-details dense height="80px"/>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-col>
                    <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                        <CustomInputContainer label="Attachments">
                        <div slot="input">
                            <v-textarea placeholder="Enter Your Attachments" outlined hide-details dense height="80px"/>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-col>
                    <v-spacer></v-spacer>
                    <v-col cols="3" align-self="end" justify="end" class="extra_estimate_info">
                    <div class="flex_row align-end justify-end ma-0 pa-0">
                    <div class="flex_column">
                        <v-text-field class="cic__container mx-0 pa-0 mb-2 text-text" color="" placeholder="Sub total" solo flat hide-details dense style="max-width: 120px !important;border: 0.5px solid #dddd !important;border-radius: 10px !important;" />
                        <v-text-field class="cic__container mx-0 pa-0 text-text" color="" placeholder="Total" solo flat hide-details dense style="max-width: 120px !important;border: 0.5px solid #dddd !important;border-radius: 10px !important;" />
                    </div>
                    <div class="flex_column ml-2">
                        <v-text-field class="cic__container mx-0 pa-0 mb-2 text-text" color="" placeholder="VAT" solo flat hide-details dense style="max-width: 120px !important;border: 0.5px solid #dddd !important;border-radius: 10px !important;" />
                        <v-text-field class="cic__container mx-0 pa-0 text-text" color="" placeholder="Balance" solo flat hide-details dense style="max-width: 120px !important;border: 0.5px solid #dddd !important;border-radius: 10px !important;" />
                    </div>
                    </div>
                    </v-col>
                </v-row>
                </v-row>
                <v-row class="payment_dialog_recurring" v-if="PaymentDialogStage==='recurring'">
                <v-row class="row_1_A py-0 my-0">
                    <v-col cols="3">
                    <CustomInputContainer label="Template name">
                        <div slot="input">
                        <v-text-field placeholder="Enter Customer Name" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                    <v-col cols="2">
                    <CustomInputContainer label="Type">
                        <div slot="input">
                        <v-text-field placeholder="Enter Customer Type" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                    <v-col cols="1" align-self="center" class="pl-5 pt-7">Create</v-col>
                    <v-col cols="1">
                    <CustomInputContainer label=" .">
                        <div slot="input">
                        <v-text-field placeholder="Delay" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                </v-row>
                <v-row class="row_1_B py-0 my-0">
                    <v-col cols="3">
                    <CustomInputContainer label="Customer">
                        <div slot="input">
                        <v-text-field placeholder="Enter Customer Name" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                    <v-col cols="4">
                    <CustomInputContainer label="Customer Email">
                        <div slot="input">
                        <v-text-field placeholder="Enter Customer Email" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                </v-row>
                <v-row class="row_2 py-0 my-0">
                    <v-col cols="2">
                    <CustomInputContainer label="Interval">
                        <div slot="input">
                        <v-select items="" placeholder="Delay" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                    <v-col cols="1" align-self="center" class="pl-6 pt-7">On</v-col>                 
                    <v-col cols="2">
                    <CustomInputContainer label=" .">
                        <div slot="input">
                        <v-select items="" placeholder="Day" full-width outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>  
                    <v-col cols="1">
                    <CustomInputContainer label=" .">
                        <div slot="input">
                        <v-select items="" placeholder="1" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>               
                    <v-col cols="1" align-self="center" class="pt-7">of every</v-col>  
                    <v-col cols="2">
                    <CustomInputContainer label="Start date">
                        <div slot="input">
                        <v-select items="" placeholder="Text" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>                  
                    <v-col cols="2">
                    <CustomInputContainer label="End Date">
                        <div slot="input">
                        <v-select items="" placeholder="None" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                </v-row>
                <v-row class="row_3 my-0 py-0">
                    <v-col cols="3" class="pb-0 mb-0">
                    <CustomInputContainer label="Billing Address" class="pb-0 mb-0">
                        <div slot="input">
                        <v-textarea placeholder="Enter Billing Address" hide-details flat solo outlined color="primary" />
                        </div>
                    </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                    <div class="flex_column">
                    <CustomInputContainer label="Terms">
                        <div slot="input">
                        <v-text-field placeholder="Enter Terms" outlined hide-details dense />
                        </div>
                    </CustomInputContainer>
                    <CustomInputContainer label="Sale Location" class="mt-6">
                        <div slot="input">
                        <v-text-field placeholder="Enter Sale Location" outlined hide-details dense/>
                        </div>
                    </CustomInputContainer>
                    </div>
                    </v-col>
                </v-row>
                <v-col cols="12" class="table_row">
                    <v-simple-table dense class="payment_dialog_recurring_simple_table">
                    <template v-slot:default>
                        <thead>
                        <tr class="outline">
                            <th v-for="item in addNewPaymentTableHeaders" :key="item" class="text-center text-text font-weight-normal" style="font-size: 12px !important; font-weight: 500 !important">{{ item }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr style="background: #e2e7f142 !important">
                            <td>#</td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <div class="flex_row justify-space-between ma-0 pa-0">
                                <v-btn icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn  icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                            </div>
                            </td>
                        </tr>
                        </tbody>
                    </template>
                    </v-simple-table>
                </v-col>
                </v-row>
            </v-card-text>
            </v-card>
        </div>
        </v-dialog>
</template>

<script>
export default {
    props: [data],
    data() {
        return {
            addNewPaymentDialog: false,
            PaymentDialogStage: 'default',
            new_payment: { filed_full: false },
            new_payment_data: [],
            OT_PaymentDialogLineOne: true,
            OT_PaymentDialogLineTwo: false,
            CR_PaymentDialogLineOne: true,
            CR_PaymentDialogLineTwo: false,
            outstandingTransactionsTableHeaders: [
                '#',
                'Description',
                'Due date',
                'Original Amt',
                'Open Bal',
                'Payment',
                'Actions'
            ],
            CreditsTableHeaders: [
                '#',
                'Description',
                'Original Amount',
                'Open Bal',
                'Payment',
                'Actions'
            ],
        }
    }
}
</script> -->