<!-- <template>
          <v-dialog class="add_new_estimate_dialog ma-0 pa-0" v-model="addNewEstimateDialog">
        <div class="my_dialog">
            <v-card id="tall_dialog"  style="height: 95vh !important">
            <v-card-title id="card-title">
                <h4 class="text--text" v-if="stage=='default'">Estimate #255</h4>
                <h4 class="text--text" v-if="stage=='recurring'">Recurring Estimate</h4>
                <div class="flex_row justify-lg-space-between">
                <h4 class="text--text mr-9" v-if="stage=='recurring'">Balance due : 0.00</h4>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="addNewEstimateDialog=false">Close</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="stage='recurring'" v-if="stage==='default'">Make Recurring</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="stage='default'" v-if="stage==='recurring'">Not Recurring</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined v-if="stage==='pdf'" onclick="window.open('MyPDF.pdf', '_blank', 'fullscreen=yes'); return false;"><v-icon class="mr-2" small>fa-download</v-icon>Download</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined v-if="stage==='pdf'" @click="handlePrint"><v-icon class="mr-2" small>fa-print</v-icon>Print</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px"  @click="handleSaveEstimate"><v-icon class="mr-2" small>fa-check</v-icon>Create Estimate</v-btn>
                </div>
            </v-card-title>
            <v-divider id="divider" class="mt-5"></v-divider>
            <v-card-text id="card-text"  >
                <v-row class="adding_estimate" v-if="stage==='default'">
                <v-row class="dialog_inputs">
                    <v-col cols="3" class="pa-0">
                        <v-col cols="12">
                        <CustomInputContainer label="Customer">
                            <div slot="input">
                            <v-select v-model="new_invoice.customer" :items="sales_data.customer" placeholder="Enter Customer Name" outlined hide-details dense></v-select>
                            </div>
                        </CustomInputContainer>
                        </v-col>
                        <v-col cols="12">
                        <CustomInputContainer label="Customer Email">
                            <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Customer Email" outlined hide-details dense />
                            </div>
                        </CustomInputContainer>
                        </v-col>
                    </v-col>
                    <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                        <CustomInputContainer label="Billing Address">
                        <div slot="input">
                            <v-textarea v-model="new_invoice.billing_address" placeholder="Enter Customer Billing Address" outlined hide-details dense/>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-col>
                    <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                        <CustomInputContainer label="Terms">
                        <div slot="input">
                        <v-text-field v-model="new_invoice.terms" placeholder="Enter Invoice Terms" outlined hide-details dense/>
                        </div>
                    </CustomInputContainer>
                    </v-col>
                    <v-col cols="12">
                        <CustomInputContainer label="Invoice Date">
                        <div slot="input">
                        <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="new_invoice.date" placeholder="Enter Date" outlined hide-details dense readonly v-bind="attrs" v-on="on" />
                            </template>
                            <v-date-picker v-model="new_invoice.date" @input="menu2 = false" />
                        </v-menu>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-col>
                    <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                        <CustomInputContainer label="Due Date">
                        <div slot="input">
                        <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                            <v-text-field v-model="new_invoice.due_date" placeholder="Enter Due Date" outlined hide-details dense readonly v-bind="attrs" v-on="on" />
                            </template>
                            <v-date-picker v-model="new_invoice.date" @input="menu2 = false" />
                        </v-menu>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="12">
                        <CustomInputContainer label="Sales Location">
                        <div slot="input">
                        <v-text-field v-model="new_invoice.sales_location" placeholder="Enter Sales Location " outlined hide-details dense/>
                        </div>
                    </CustomInputContainer>
                    </v-col>
                    </v-col>
                </v-row>
                <v-row class="dialog_table pa-0 ma-0">
                    <v-col cols="12" class="">
                    <v-simple-table dense class="adding_estimate_simple_table">
                        <template v-slot:default>
                        <thead>
                            <tr class="outline" style="height: 45px !important">
                            <th v-for="item in addNewInvoicePreviewTableHeaders" :key="item" class="text-center text-text font-weight-normal" style="font-size: 12px !important; font-weight: 500 !important">{{ item }}</th>
                            </tr>
                        </thead>
                        <tbody>
                        <v-btn v-if="InvoiceDialoglineOne==false&&InvoiceDialoglineTwo==false&&InvoiceDialoglineThree==false" @click="InvoiceDialoglineOne=true" icon color="primary" class="rounded text-center" block><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                            <tr v-if="InvoiceDialoglineOne==true" style="background: #e2e7f142 !important">
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
                                <v-text-field v-model="new_estimate.tax" class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" @click="new_invoice.filed_full=true" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <div class="flex_row justify-space-between ma-0 pa-0" v-show="new_invoice.filed_full==true">
                                <v-btn @click="InvoiceDialoglineTwo=true" icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="InvoiceDialoglineOne=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                                </div>
                            </td>
                            </tr>
                            <tr v-if="InvoiceDialoglineTwo==true" style="background: #e2e7f142 !important">
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
                                <v-text-field v-model="new_estimate.tax" class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" @click="new_invoice.filed_full=true" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <div class="flex_row justify-space-between ma-0 pa-0" v-show="new_invoice.filed_full==true">
                                <v-btn @click="InvoiceDialoglineThree=true" icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="InvoiceDialoglineTwo=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                                </div>
                            </td>
                            </tr>
                            <tr v-if="InvoiceDialoglineThree==true" style="background: #e2e7f142 !important">
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
                                <v-text-field v-model="new_estimate.tax" class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" @click="new_invoice.filed_full=true" />
                            </td>
                            <td class="py-2">
                                <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                                <div class="flex_row justify-space-between ma-0 pa-0" v-show="new_invoice.filed_full==true">
                                <v-btn disabled icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="InvoiceDialoglineThree=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                                </div>
                            </td>
                            </tr>
                        </tbody>
                        </template>
                    </v-simple-table>
                    </v-col>
                </v-row>
                <v-row class="estimate_dialog_footer">
                    <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                        <CustomInputContainer label="Message on invoice">
                        <div slot="input">
                            <v-textarea v-model="new_invoice.msg_in_invoice" placeholder="Enter Customer Name" outlined hide-details dense height="80px"/>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-col>
                    <v-col cols="3" class="pa-0">
                    <v-col cols="12">
                        <CustomInputContainer label="Message on Statement">
                        <div slot="input">
                            <v-textarea v-model="new_invoice.msg_in_invoice" placeholder="Enter Customer Name" outlined hide-details dense height="80px"/>
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
                    <v-text-field class="cic__container mx-0 pa-0 ml-2 text-text" color="" placeholder="Balance" solo flat hide-details dense style="max-width: 120px !important;border: 0.5px solid #dddd !important;border-radius: 10px !important;" />
                    </div>
                    </v-col>
                </v-row>
                </v-row>
                <v-row class="recurring_estimate" v-if="stage==='recurring'">
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
                    <v-simple-table dense class="estimate_recurring_simple_table">
                    <template v-slot:default>
                        <thead>
                        <tr class="outline" style="height: 45px !important">
                            <th v-for="item in addNewInvoicePreviewTableHeaders" :key="item" class="text-center text-text font-weight-normal" style="font-size: 12px !important; font-weight: 500 !important">{{ item }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <v-btn v-if="InvoiceDialoglineOne==false&&InvoiceDialoglineTwo==false&&InvoiceDialoglineThree==false" @click="InvoiceDialoglineOne=true" icon color="primary" class="rounded text-center" block><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                        <tr v-if="InvoiceDialoglineOne==true" style="background: #e2e7f142 !important">
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
                            <v-text-field v-model="new_estimate.tax" class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" @click="new_invoice.filed_full=true" />
                            </td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <div class="flex_row justify-space-between ma-0 pa-0" v-show="new_invoice.filed_full==true">
                                <v-btn @click="InvoiceDialoglineTwo=true" icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="InvoiceDialoglineOne=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                            </div>
                            </td>
                        </tr>
                        <tr v-if="InvoiceDialoglineTwo==true" style="background: #e2e7f142 !important">
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
                            <v-text-field v-model="new_estimate.tax" class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" @click="new_invoice.filed_full=true" />
                            </td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <div class="flex_row justify-space-between ma-0 pa-0" v-show="new_invoice.filed_full==true">
                                <v-btn @click="InvoiceDialoglineThree=true" icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="InvoiceDialoglineTwo=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
                            </div>
                            </td>
                        </tr>
                        <tr v-if="InvoiceDialoglineThree==true" style="background: #e2e7f142 !important">
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
                            <v-text-field v-model="new_estimate.tax" class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" @click="new_invoice.filed_full=true" />
                            </td>
                            <td class="py-2">
                            <v-text-field class="mx-0 pa-0" color="primary" outlined flat hide-details dense style="max-width: 100% !important;" />
                            </td>
                            <td class="py-2">
                            <div class="flex_row justify-space-between ma-0 pa-0" v-show="new_invoice.filed_full==true">
                                <v-btn disabled icon color="primary" x-small><v-icon class="pa-2" color="primary" x-small>fa-plus</v-icon></v-btn>
                                <v-btn @click="InvoiceDialoglineThree=false" icon x-small color="error" class="ml-3"><v-icon class="" color="error" x-small>fa-minus</v-icon></v-btn>
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
            addNewEstimateDialog: false,
            new_estimate: [ { tax: '', filed_full: false } ],
            addNewEstimateTableHeaders: [
                '#',
                'Service Date',
                'Product/Service',
                'Description',
                'QTY',
                'Rate',
                'Amount',
                'Actions'
            ],
            PaymentDialogLineOne: true,
        }
    }
}
</script> -->