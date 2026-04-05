<!-- <template>
          <v-dialog v-model="addNewJournalEntryDialog" class="ma-0 pa-0">
        <div class="my_dialog">
            <v-card id="tall_dialog">
            <v-card-title id="card-title">
                <h4 class="text--text">Add Journal</h4>
                <div class="flex_row justify-lg-space-between">
                    <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="addNewJournalEntryDialog=false">Done</v-btn>
                    <v-btn class="tall__btn px-9" color="primary" min-width="150px" @click="handleAddNewPayment"  >Add Journal</v-btn>
                </div>
            </v-card-title>
            <v-divider id="divider" class="mt-5"></v-divider>
            <v-card-text id="card-text" class="mt-0 pt-0">
                <v-container>
                <v-row>
                <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Journal Date">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Date" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Journal no">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Journal no" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Memo">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Memo" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Attachments">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Attachments" outlined hide-details></v-text-field>
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
        return{
                 addNewJournalEntryDialog: false,

        }
    }
}
</script>

<style>

</style> -->