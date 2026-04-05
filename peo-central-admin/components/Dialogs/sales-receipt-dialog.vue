<!-- <template>
          <v-dialog v-model="addNewSalesRecieptDialog" class="ma-0 pa-0">
        <div class="my_dialog">
            <v-card id="tall_dialog">
            <v-card-title id="card-title">
                <h4 class="text--text">Sales Reciept #255</h4>
                <div class="flex_row justify-lg-space-between">
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="addNewSalesRecieptDialog=false">Done</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px" @click="handleAddNewPayment"  >Add Payment</v-btn>
                </div>
            </v-card-title>
            <v-divider id="divider" class="mt-5"></v-divider>
            <v-card-text id="card-text" class="mt-0 pt-0">
                <v-container>
                <v-row>
                    <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Customer">
                        <div slot="input">
                        <v-text-field v-model="new_invoice.email" placeholder="Enter Customer Name" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Email">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Email" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Sale Location">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Sale Location" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Payment Method">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Payment Method" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-row>
                <v-row>
                        <v-col cols="3">
                        <CustomInputContainer label="Billing address">
                            <div slot="input">
                            <v-text-field v-model="new_invoice.terms" placeholder="Select Billing address" outlined hide-details></v-text-field>
                            </div>
                        </CustomInputContainer>
                        </v-col>
                        <v-col cols="3">
                        <CustomInputContainer label="Sales Reciept Date">
                            <div slot="input">
                            <v-text-field v-model="new_invoice.date" placeholder="Enter Sales Reciept Date" outlined hide-details></v-text-field>
                            </div>
                        </CustomInputContainer>
                        </v-col>
                        <v-col cols="3">
                        <CustomInputContainer label="Ref no">
                            <div slot="input">
                            <v-text-field v-model="new_invoice.date" placeholder="Enter Date" outlined hide-details></v-text-field>
                            </div>
                        </CustomInputContainer>
                        </v-col>
                        <v-col cols="3">
                        <CustomInputContainer label="Deposit to">
                            <div slot="input">
                            <v-text-field v-model="new_invoice.date" placeholder="Enter Deposit to" outlined hide-details></v-text-field>
                            </div>
                        </CustomInputContainer>
                        </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                    <CustomInputContainer label="Amounts are">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.dueDate" placeholder="Enter Amounts are" outlined hide-details></v-text-field>
                        </div>
                    </CustomInputContainer>
                    </v-col>
                </v-row>
                
                </v-row>
                <v-row class="mt-9">
                <v-col cols="12">
                    <v-simple-table>
                    <template v-slot:default>
                        <thead>
                        <tr class="outline">
                            <th v-for="item in addNewInvoicePreviewTableHeaders" :key="item" class="text-left">{{ item }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="item in addNewInvoicePreviewTableData" :key="item.name">
                            <td>{{ item.no }}</td>
                            <td>{{ item.service }}</td>
                            <td>{{ item.product }}</td>
                            <td>{{ item.description }}</td>
                            <td>{{ item.qty }}</td>
                            <td>{{ item.rate }}</td>
                            <td>{{ item.amount }}</td>
                            <td>{{ item.tax }}</td>
                        </tr>
                        </tbody>
                    </template>
                    </v-simple-table>
                </v-col>
                </v-row>
                </v-container>
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
            addNewSalesRecieptDialog: false,
        }
    }
}
</script> -->