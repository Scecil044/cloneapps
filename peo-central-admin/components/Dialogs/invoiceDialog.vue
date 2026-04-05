<template>
    <!-- ADD INVOICE DIALOG -->
    <v-dialog class="add_new_invoice_dialog ma-0 pa-0" v-model="toggler">
        <div class="my_dialog">
            <v-card id="tall_dialog" style="height: 95vh !important;">
            <v-card-title id="card-title">
                <h4 class="text--text" v-if="invoice_in_pdf==false">Add New Invoice {{ recurring ? '(Recurring)' : '' }}</h4>
                <v-btn class="tall__btn" color="text" min-width="150px" icon v-if="invoice_in_pdf==true" @click="invoice_in_pdf=false">
                <v-icon small color="text" class="mr-2">fa-arrow-left</v-icon>
                Go Back
                </v-btn>
                <span class="text--text mr-9" v-if="recurring">Balance due : 0.00</span>
                <div class="flex_row justify-lg-space-between">
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="handleCloseDialog">Close</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="recurring=!recurring" v-if="invoice_in_pdf==false">{{ recurring ? 'Not' : 'Make' }} Recurring</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px" v-if="invoice_in_pdf==false" @click="invoice_in_pdf=!invoice_in_pdf"> {{ invoice_in_pdf ? 'Hide' : 'View' }} Invoice</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined v-if="invoice_in_pdf==true" onclick="window.open('MyPDF.pdf', '_blank', 'fullscreen=yes'); return false;"><v-icon class="mr-2" small>fa-download</v-icon>Download</v-btn>
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined v-if="invoice_in_pdf==true"  @click="handlePrint"><v-icon class="mr-2" small>fa-print</v-icon>Print</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px" v-if="invoice_in_pdf==true" @click="handleSaveInvoice(new_invoice_data)"><v-icon class="mr-2" small>fa-check</v-icon>Create Invoice</v-btn>
                </div>
            </v-card-title>
            <v-divider id="divider" class="mt-5"></v-divider>
            <v-card-text id="card-text" >

                <!-- S[1] : Invoice -->
                <v-row class="adding_invoice" v-if="invoice_in_pdf==false">

                    <!-- Reoccurring / Not Reoccurring -->

                    <!-- recurring_row_1 -->
                    <v-row v-if="recurring" class="recurring_row_1 py-0 my-0">
                        <v-col cols="3">
                            <CustomInputContainer label="Template name">
                            <div slot="input">
                                <v-text-field placeholder="Enter Customer Name" outlined hide-details dense :rules="main_rule"/>
                            </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="3">
                            <CustomInputContainer label="Type">
                            <div slot="input">
                                <v-select :items="types" placeholder="Delay" outlined hide-details dense  :rules="main_rule"/>
                            </div>
                            </CustomInputContainer>
                        </v-col>
                        <v-col cols="1" align-self="center" class="pl-5 pt-7">Create</v-col>
                        <v-col cols="1">
                            <CustomInputContainer label="days">
                            <div slot="input">
                                <v-text-field placeholder="Delay" outlined hide-details dense  :rules="main_rule"/>
                            </div>
                            </CustomInputContainer>
                        </v-col>
                    </v-row>

                    <!-- ** recurring_row_2 ** -->
                    <v-row v-if="recurring" class="recurring_row_2 py-0 my-0">
                        <!-- [1] ** Daily Weekly Interval ** -->
                        <v-col cols="6">
                            <div class="flex_row">
                                <CustomInputContainer label="Interval">
                                    <div slot="input">
                                        <v-select v-model="interval" :items="all_intervals" outlined hide-details dense />
                                    </div>
                                </CustomInputContainer>
                                <!-- Daily + Weekly -->
                                <CustomInputContainer label="every" class="ml-3" v-if="interval=='Daily' || interval=='Weekly'">
                                    <div slot="input">
                                        <v-text-field :placeholder=" interval=='Daily' ? 'Day(s)' : 'Week(s)' " type="number" outlined hide-details dense :rules="main_rule"/>
                                    </div>
                                </CustomInputContainer>
                                <CustomInputContainer label="every" class="ml-3" v-if="interval=='Weekly'">
                                    <div slot="input">
                                        <v-select :items="week_days" placeholder="Sunday" outlined hide-details dense />
                                    </div>
                                </CustomInputContainer>
                                <!-- Monthly -->
                                <CustomInputContainer label="on" class="ml-3" v-if="interval=='Monthly'">
                                    <div slot="input">
                                        <v-select v-model="on_day_order_data" :items="on_day_order" placeholder="day/first/.." outlined hide-details dense />
                                    </div>
                                </CustomInputContainer>
                                <CustomInputContainer label="on" class="ml-3" v-if="interval==='Monthly' && on_day_order_data==='day' ">
                                    <div slot="input">
                                        <v-select :items="month_days" placeholder="1st" outlined hide-details dense />
                                    </div>
                                </CustomInputContainer>
                                <CustomInputContainer label="every" class="ml-3" v-if="interval=='Monthly' && on_day_order_data!='day'">
                                    <div slot="input">
                                        <v-select :items="week_days" placeholder="Sunday" outlined hide-details dense />
                                    </div>
                                </CustomInputContainer>
                                <!-- Year -->
                                <CustomInputContainer label="every" class="ml-3" v-if="interval=='Yearly'">
                                    <div slot="input">
                                        <v-select :items="months" placeholder="January" outlined hide-details dense />
                                    </div>
                                </CustomInputContainer>
                                <CustomInputContainer label="on" class="ml-3" v-if="interval==='Yearly'">
                                    <div slot="input">
                                        <v-select :items="month_days" placeholder="1st" outlined hide-details dense />
                                    </div>
                                </CustomInputContainer>
                                <CustomInputContainer label="of every" class="ml-3" v-if="interval=='Monthly'">
                                    <div slot="input">
                                        <v-text-field placeholder="month(s)" type="number" outlined hide-details dense :rules="main_rule"/>
                                    </div>
                                </CustomInputContainer>
                            </div>
                        </v-col>

                        <!-- [2] ** Start and End Date Part ** -->
                        <v-col cols="6">
                            <div class="flex_row">
                            <v-divider vertical class="ma-0 pa-0 mt-5 mr-2"></v-divider>
                            <CustomInputContainer label="Start date" class="ml-3">
                                <div slot="input">
                                    <v-menu v-model="start_date_menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                                        <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="start_date" placeholder="Enter Due Date" outlined hide-details dense readonly v-bind="attrs" v-on="on" :rules="main_rule" />
                                        </template>
                                        <v-date-picker v-model="start_date" @input="start_date_menu = false"  />
                                    </v-menu>
                                </div>
                            </CustomInputContainer>
                            <CustomInputContainer label="End" class="ml-3">
                                <div slot="input">
                                    <v-select v-model="end_interval" :items="all_end_interval_date" full-width outlined hide-details dense :rules="main_rule"/>
                                </div>
                            </CustomInputContainer>
                            <CustomInputContainer label="End Date" class="ml-3" v-if="end_interval=='By'">
                                <div slot="input">
                                    <v-menu v-model="end_date_menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                                        <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="end_date" placeholder="Enter End Date" outlined hide-details dense readonly v-bind="attrs" v-on="on"  :rules="main_rule"/>
                                        </template>
                                        <v-date-picker v-model="end_date" @input="end_date_menu = false" />
                                    </v-menu>
                                </div>
                            </CustomInputContainer>
                            <CustomInputContainer label="Occurrences" class="ml-3" v-if="end_interval=='After'">
                                <div slot="input">
                                    <v-text-field type="number" outlined hide-details dense />
                                </div>
                            </CustomInputContainer>
                        </div>
                        </v-col>
                    </v-row>

                    <!-- not_recurring_row_3 -->
                    <v-row class="not_recurring_row_3 py-0 my-0">
                        <v-col cols="3" class="pa-0">
                            <v-col cols="12">
                            <CustomInputContainer label="Customer">
                                <div slot="input">
                                    <v-select v-model="new_invoice.customer" :items="all_customers" placeholder="Enter Customer Name" outlined hide-details dense :rules="main_rule"></v-select>
                                </div>
                            </CustomInputContainer>
                            </v-col>
                            <v-col cols="12">
                            <CustomInputContainer label="Customer Email">
                                <div slot="input">
                                <v-text-field v-model="new_invoice.email" placeholder="Enter Customer Email" outlined hide-details dense :rules="main_rule" />
                                </div>
                            </CustomInputContainer>
                            </v-col>
                        </v-col>
                        <v-col cols="3" class="pa-0">
                            <v-col cols="12">
                                <CustomInputContainer label="Billing Address">
                                <div slot="input">
                                    <v-textarea v-model="new_invoice.billing_address" placeholder="Enter Customer Billing Address" outlined hide-details dense :rules="main_rule"/>
                                </div>
                                </CustomInputContainer>
                            </v-col>
                        </v-col>
                        <v-col cols="3" class="pa-0">
                            <v-col cols="12">
                                <CustomInputContainer label="Terms">
                                <div slot="input">
                                    <v-menu
                                    v-model="terms_main_menu"
                                    :close-on-content-click="false"
                                    offset-y
                                    max-height="fit-content"
                                    rounded="xl"
                                    class=""
                                    >
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="term" placeholder="Enter Terms" outlined hide-details dense v-bind="attrs" v-on="on" :rules="main_rule" />
                                    </template>

                                        <!-- Terms List -->
                                        <v-list class="pa-3" v-if="addCustomTerm==false">
                                            <v-list-item v-for="(item, index) in terms_menu" :key="index" link @click="term=item" >
                                                <v-list-item-title>{{ item }}</v-list-item-title>
                                            </v-list-item>
                                            <v-btn icon class="text-center" color="primary" block @click="addCustomTerm=true"><v-icon color="primary" class="mr-2" small>fa-plus</v-icon>Add new</v-btn>
                                        </v-list>

                                        <!-- Add New Term -->
                                        <div class="py-7 px-5 white" v-else>
                                            <h4 class="mb-5">New Term</h4>
                                            <CustomInputContainer label="Name *">
                                                <div slot="input">
                                                    <v-text-field  placeholder="Enter Name" outlined hide-details dense :rules="main_rule" />
                                                </div>
                                            </CustomInputContainer>
                                            <div>
                                                <v-radio-group v-model="terms_radio_selected" dense class="">
                                                    <template v-slot:label>
                                                        <div class="my-5">Make Your Custom <strong>Term</strong></div>
                                                    </template>
                                                    <v-radio value="days" class="">
                                                        <template v-slot:label class="">
                                                            <div class="flex_row">
                                                                <strong class="flex_row">Due in fixed number of</strong>
                                                                <v-text-field class="mx-3" v-model="new_invoice.email" placeholder="days" outlined dense style="max-width: 60px; max-height: 30px; font-size: 12px;" />
                                                            </div>
                                                        </template>
                                                    </v-radio>
                                                    <v-radio value="months" class="mt-9">
                                                        <template v-slot:label class="">
                                                            <div class="flex_row">
                                                                <strong class="flex_row">Due certain day of month</strong>
                                                                <v-text-field class="mx-3" placeholder="from" outlined dense style="max-width: 60px; max-height: 30px; font-size: 12px;" />
                                                                <strong class="flex_row">Due next month within</strong>
                                                                <v-text-field class="mx-3"  placeholder="to" outlined dense style="max-width: 60px; max-height: 30px; font-size: 12px;" />
                                                            </div>
                                                        </template>
                                                    </v-radio>
                                                </v-radio-group>
                                                <v-row class="mt-9">
                                                    <v-spacer></v-spacer>
                                                    <v-btn class="tall__btn mr-3" outlined color="primary" @click="addCustomTerm=false">Cancel</v-btn>
                                                    <v-btn class="tall__btn" color="primary" @click="addCustomTerm=false">Save</v-btn>
                                                </v-row>
                                            </div>
                                        </div>
                                    </v-menu>
                                </div>
                                </CustomInputContainer>
                            </v-col>
                            <v-col cols="12">
                                <CustomInputContainer label="Invoice Date">
                                <div slot="input">
                                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="new_invoice.date" placeholder="Enter Date" outlined hide-details dense readonly v-bind="attrs" v-on="on"  :rules="main_rule"/>
                                    </template>
                                    <v-date-picker v-model="new_invoice.date" @input="date_menu = false" />
                                    </v-menu>
                                </div>
                                </CustomInputContainer>
                            </v-col>
                        </v-col>
                        <v-col cols="3" class="pa-0">
                            <v-col cols="12">
                                <CustomInputContainer label="Due Date">
                                <div slot="input">
                                <v-menu v-model="due_date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                                    <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="new_invoice.due_date" placeholder="Enter Due Date" outlined hide-details dense readonly v-bind="attrs" v-on="on" :rules="main_rule" />
                                    </template>
                                    <v-date-picker v-model="new_invoice.date" @input="due_date_menu = false" />
                                </v-menu>
                                </div>
                                </CustomInputContainer>
                            </v-col>
                            <!-- <v-col cols="12">
                                <CustomInputContainer label="Sales Location">
                                <div slot="input">
                                    <v-text-field v-model="new_invoice.sales_location" placeholder="Enter Sales Location " outlined hide-details dense :rules="main_rule"/>
                                </div>
                                </CustomInputContainer>
                            </v-col> -->
                        </v-col>
                    </v-row>
                    <v-spacer class="my-9"></v-spacer>

                    <!-- DATA TABLE -->
                    <v-row class="dialog_table pa-0 ma-0 mt-9">
                        <v-col cols="12" class="">
                            <v-simple-table dense class="dynamic_table">
                                <template v-slot:default>
                                <thead class="dynamic_table_thead">
                                    <tr class="outline" style="height: 45px !important">
                                    <th v-for="item in addNewInvoicePreviewTableHeaders" :key="item" class="text-center text-text font-weight-normal" style="font-size: 12px !important; font-weight: 500 !important">{{ item }}</th>
                                    </tr>
                                </thead>
                                <tbody class="dynamic_table_tbody" v-for="(item, index) in rows_counter" :key="index">
                                        <tr v-if="item.type == 'row'" :key="index" class="dynamic_table_body_rows" style="border-bottom: 0.5 solid red !important;">
                                            <td>{{ index }}</td>
                                            <td class="py-2">
                                                <v-menu v-model="service_date_menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                                                    <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field class="rounded-lg" v-model="service_date" placeholder="Date" solo flat hide-details dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                                                        <template v-slot:append><v-icon class="text-center mt-1" color="primary" small>fa-calendar</v-icon></template>
                                                    </v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="end_date" @input="service_date_menu = false" />
                                                </v-menu>
                                            </td>
                                            <td class="py-2">
                                                <v-select class="rounded-lg" :items="services" placeholder="" solo flat hide-details dense :rules="main_rule" />
                                            </td>
                                            <td class="py-2">
                                                <v-text-field class="rounded-lg" placeholder="" solo flat hide-details dense />
                                            </td>
                                            <td class="py-2">
                                                <v-text-field class="rounded-lg" type="number" placeholder="0.00" solo flat hide-details dense :rules="main_rule" />
                                            </td>
                                            <td class="py-2">
                                                <v-text-field class="rounded-lg" type="number" placeholder="0.00" solo flat hide-details dense :rules="main_rule" />
                                            </td>
                                            <td class="py-2">
                                                <v-text-field class="rounded-lg" type="number" placeholder="0.00" solo flat hide-details dense :rules="main_rule" />
                                            </td>
                                            <td class="py-2">
                                                <v-select class="rounded-lg" :items="tax" placeholder="Enter Tax" solo flat hide-details dense :rules="main_rule" />
                                            </td>
                                            <td class="py-2">
                                                <v-btn icon color="error" class="mx-3" @click="handleDeleteLine(index)"><v-icon class="" color="error" x-small>fa-light fa-trash-can</v-icon></v-btn>
                                            </td>
                                        </tr>
                                        <v-divider></v-divider>
                                        <tr v-if="item.type == 'subtotal'" :key="index" class="dynamic_table_body_rows" style="border-bottom: 0.5 solid red !important;">
                                            <td>{{ index }}</td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td>Subtotal: AED {{ subtotal  | twoDecimals }}</td>
                                            <td class="py-2">
                                                <v-btn icon color="error" class="mx-3" @click="handleDeleteLine(index)"><v-icon class="" color="error" x-small>fa-light fa-trash-can</v-icon></v-btn>
                                            </td>
                                        </tr>
                                </tbody>
                                </template>
                            </v-simple-table>

                            <!-- ADD/DEL/CLR LINES BUTTONS -->
                            <v-row class="mt-5">
                                <v-spacer></v-spacer>
                                    <v-col cols="6">
                                        <div class="action__btn flex_row">
                                            <v-btn  @click="handleAddLine('row')" class="small__btn" outlined color="subtext">Add Lines</v-btn>
                                            <v-btn @click="handleDeleteAllLine" class="small__btn ml-5" outlined color="subtext">Clear All Lines</v-btn>
                                            <v-btn class="small__btn ml-5" outlined color="subtext" @click="handleAddLine('subtotal')">Add Subtotal</v-btn>
                                        </div>
                                    </v-col>
                                <v-spacer></v-spacer>
                            </v-row>
                        </v-col>
                    </v-row>
                    <v-spacer class="my-9"></v-spacer>

                    <!-- FOOTER INPUTS FIELDS -->
                    <v-row class="dialog_footer">
                        <v-col cols="3" class="pa-0">
                            <v-col cols="12">
                                <CustomInputContainer label="Message on invoice">
                                    <div slot="input">
                                        <v-textarea placeholder="Enter Message on invoice" outlined hide-details dense height="80px"/>
                                    </div>
                                </CustomInputContainer>
                            </v-col>
                        </v-col>
                        <v-col cols="3" class="pa-0">
                            <v-col cols="12">
                                <CustomInputContainer label="Message on Statement">
                                    <div slot="input">
                                        <v-textarea placeholder="Enter Message on Statement" outlined hide-details dense height="80px"/>
                                    </div>
                                </CustomInputContainer>
                            </v-col>
                        </v-col>
                        <v-col cols="3" class="pa-0">
                            <v-col cols="12">
                                <CustomInputContainer label="CUSTOMER DOCUMENTS">
                                    <div slot="input">
                                        <v-file-input outlined height="80px" multiple prepend-icon="" append-icon="" hide-details="">
                                            <template v-slot:selection="{ text }">
                                                <v-chip small label color="outline">
                                                    {{ text }}
                                                </v-chip>
                                            </template>
                                        </v-file-input>
                                    </div>
                                </CustomInputContainer>
                            </v-col>
                        </v-col>
                    </v-row>
                </v-row>

                <!-- S[2] : PDF -->
                <v-container class="preview_invoice ma-0 pa-0" v-if="invoice_in_pdf==true">
                <div class="a4__con mx-auto" style="max-width: 900px;min-height: 85vh;">
                    <v-row class="pdf_heder ma-0 pa-0">
                    <v-col cols="8">
                        <div class="n__logo">
                        <h1 class="primary--text my-5">Nathan&Nathan</h1>
                        </div>
                    </v-col>
                    </v-row>
                    <v-row class="pdf_header_2 ma-0 pa-0">
                    <v-col cols="6">
                        <p class="ma-0 pa-0 text--text">Office 1005, 10Th Floor, Marina Plaza, Dubai Marina</p>
                        <p class="ma-0 pa-0 text--text">Dubai, UAE 68128 AE</p>
                        <p class="ma-0 pa-0 text--text">Accounts@Nathanhr.Com www.nathanhr.com</p>
                        <p class="ma-0 pa-0 text--text">federal tax authority registration no.: 100323347300003</p>
                    </v-col>
                    </v-row>
                    <h1 class="ml-3 py-3 text--text">Invoice</h1>
                    <v-row class="invoice_details ma-0 pa-0">
                    <v-col cols="5">
                        <h5 class="ma-0 pa-0 pb-2 subtext--text">Invoice Details</h5>
                        <p class="ma-0 pa-0 text--text">{{invoice_pdf.c_name}}</p>
                        <p class="ma-0 pa-0 text--text">{{invoice_pdf.address}}</p>
                        <p class="ma-0 pa-0 text--text">{{invoice_pdf.country}}</p>
                        <p class="ma-0 pa-0 text--text">{{invoice_pdf.vat_no}}</p>
                        <v-col cols="auto" class="px-0">
                        <h5 class="ma-0 pa-0 pb-2 subtext--text">Invoice No.</h5>
                        <p class="ma-0 pa-0 text--text">{{invoice_pdf.invoice_no}}</p>
                        </v-col>
                    </v-col>
                    <v-col cols="5">
                        <v-col cols="auto">
                        <h5 class="ma-0 pa-0 pb-2 subtext--text">Invoice No.</h5>
                        <p class="ma-0 pa-0 text--text">{{invoice_pdf.invoice_no}}</p>
                        </v-col>
                        <v-row>
                        <v-col cols="6">
                            <h5 class="ma-0 pa-0 pb-2 subtext--text">Invoice Date</h5>
                            <p class="ma-0 pa-0 text--text">{{invoice_pdf.date}}</p>
                        </v-col>
                        <v-col cols="6">
                            <h5 class="ma-0 pa-0 pb-2 subtext--text">Invoice Due Date</h5>
                            <p class="ma-0 pa-0 text--text">{{invoice_pdf.due_date}}</p>
                        </v-col>
                        </v-row>
                    </v-col>
                    </v-row>
                    <v-row class="pdf_input mt-9 mb-0 pb-0">
                    <v-spacer></v-spacer>
                    <v-col cols="12">
                        <v-simple-table
                        fixed-header
                        >
                        <template v-slot:default>
                            <thead>
                            <tr>
                                <th class="text-center text--text">Pro/Ser</th>
                                <th class="text-center text--text">Tax</th>
                                <th class="text-center text--text">Rate</th>
                                <th class="text-center text--text">Qty</th>
                                <th class="text-center text--text">Price</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr class="outline">
                                <td class="text-center font-weight-medium" v-for="item in invoice_pdf.input" :key="item">{{ item }}</td>
                            </tr>
                            </tbody>
                        </template>
                        </v-simple-table>
                    </v-col>
                    <v-spacer></v-spacer>
                    </v-row>
                    <div class="invoice_footer mx-auto mt-9 pt-9 text-center">
                    <span class="subtext--text ">This Is A System Generated Invoice And Does Not Require Signature.</span>
                    </div>
                </div>
                </v-container>
            </v-card-text>
            </v-card>
        </div>
    </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

export default {
    components: { CustomInputContainer },
    props: ['toggler'],
    data() {
        return {
            // dynamic data table data
            rows_counter: [ {type: 'row'} ],
            subtotal: 240,
            del_row: null,
            service_date_menu: false,
            service_date: null,
            // interval data
            on_day_order_data: 'day',
            on_day_order: ['day', 'first', 'second', 'third'],
            interval: 'Daily',
            months: ['January', 'Feb', 'March'],
            month_days: ['1st', '2en', '3th', '4fo', '5fi'],
            week_days: ['Monday', 'Sunday', 'Friday', 'Monday', 'Sunday', 'Friday'],
            terms_radio_selected: 'Duckduckgo',
            terms_main_menu: false,
            addCustomTerm: false,
            term: null,
            terms_menu: [ 'Net 15', 'Net 30', 'Net 60' ],
            // ADD INVOICE DIALOG (1)
            // toggler : false,
            recurring: false,
            invoice_in_pdf: false,
            new_invoice: { filed_full: false },
            new_invoice_data: [],
            due_date_menu: false,
            date_menu: false,
            tax: ['ZR Zero Rate(0%)', 'Ex (0%)', 'SR (5%)'],
            services: ['ERP', 'Call Service', 'CRM', 'ATS'],
            types: ['types1', 'types2'],
            all_end_interval_date: ['None', 'By', 'After'],
            end_interval: 'None',
            start_date: null,
            end_date_menu: false,
            start_date_menu: false,
            days: ['Sat', 'Sun', 'Mon'],
            all_intervals: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
            all_customers: ['Soylent Corp', 'BGoylent Corp', 'Mylent Corp', 'Lif Corp'], // all_customer is coming from customer page
            invoice_pdf: {
                invoice_no: 'DF-2206-663',
                date: '2022-06-23',
                due_date: '2022-06-23',
                po_no: '460695',
                c_name: 'EasyBox',
                address: 'San Francisco, CA 94114-8777',
                country: 'United States',
                vat_no: 'Vat No. 86-2769183',
                input: ['Item 1', '1%', '12023', '1', 'AED 10,900']
            },
            InvoiceDialogLineOne: true,
            InvoiceDialogLineTwo: false,
            InvoiceDialogLineThree: false,
            addNewInvoicePreviewTableHeaders: [
                '#',
                'Service Date',
                'Product/Service',
                'Description',
                'QTY',
                'Rate',
                'Amount',
                'Tax',
                'Actions'
            ],
            addNewPaymentTableHeaders: [
                '#',
                'Description',
                'Due date',
                'Original Amt',
                'Open Bal',
                'Payment',
                'Actions'
            ],
            main_rule: [(v) => !!v || 'This filed is required'],
            number_rule: [(v) => !!v || 'Only numeric values'],
            email_rule: [],
            phone_rule: [],
        }
    },
    methods: {
        addSubtotal(){},

        handleAddLine(value) {
            let obj = {
                type: value
            }
            this.rows_counter.push(obj)
        },

        handleDeleteLine(value) {
            console.log('DELETED ROW ID: ', value );
            this.rows_counter.splice(value, 1);
        },

        handleDeleteAllLine() {
            this.rows_counter = [ {type: 'row'} ]
        },

        clear(){
            this.new_invoice = {}
        },

        handleSaveInvoice(value) {
            this.$emit('save', value)
        },

        handleCloseDialog() {
            this.$emit('close', false)
        },

        handlePrint() {
            window.print()
        },

    }
}
</script>

<style lang="scss">
.dynamic_table {
    .dynamic_table_thead {
        tr {}
    }
    .dynamic_table_tbody {
        .dynamic_table_body_rows {
            border-bottom: 0.5 solid red !important;
            &:hover {
                background: #e2e7f142 !important;
            }
        }
    }
}
</style>
