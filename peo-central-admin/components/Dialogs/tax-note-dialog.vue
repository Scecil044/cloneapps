<!-- <template>
          <v-dialog v-model="addNewTaxCreditNoteDialog" class="ma-0 pa-0">
        <div class="my_dialog">
            <v-card  color="card_bg" id="tall_dialog">
            <v-card-title id="card-title">
                <h4 class="text--text">Credit Note</h4>
                <div class="flex_row justify-lg-space-between">
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="addNewTaxCreditNoteDialog=false">Done</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px" @click="handleAddNewPayment"  >Proceed & View</v-btn>
                </div>
            </v-card-title>
            <v-divider id="divider" class="mt-5"></v-divider>
            <v-card-text id="card-text" class="mt-0 pt-0" >
                <v-container>
                <v-row>
                    <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Customer">
                        <div slot="input">
                            <v-select v-model="new_invoice.customer" :items="all_customers" placeholder="Enter Customer Name" outlined hide-details></v-select>
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
                            <v-select v-model="new_invoice.customer" :items="location" placeholder="Enter Sale Location " outlined hide-details></v-select>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-row>
                    <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Mailing address">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.terms" placeholder="Select Payment Date" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-row>
                    <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Billing address">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.dueDate" placeholder="Enter Billing address" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Credit Note Date">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.dueDate" placeholder="Enter Credit Note" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
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
    props:[data],
    data() {
        return {
            addNewTaxCreditNoteDialog: false,
        }
    }
}
</script> -->