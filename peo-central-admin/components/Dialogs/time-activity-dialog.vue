<!-- <template>
          <v-dialog v-model="addNewTimeActivityDialog" class="ma-0 pa-0">
        <div class="my_dialog">
            <v-card id="tall_dialog">
            <v-card-title id="card-title">
                <h4 class="text--text">Time Activity</h4>
                <div class="flex_row justify-lg-space-between">
                <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="addNewTimeActivityDialog=false">Done</v-btn>
                <v-btn class="tall__btn px-9" color="primary" min-width="150px" @click="handleAddNewPayment"  >Create</v-btn>
                </div>
            </v-card-title>
            <v-divider id="divider" class="mt-5"></v-divider>
            <v-card-text id="card-text" class="mt-0 pt-0">
                <v-container>
                <v-row>
                    <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Date">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Date" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Customer">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Customer" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Time">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Time" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-row>
                    <v-row>
                    <v-col cols="3">
                        <CustomInputContainer label="Name">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Name" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Service">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Service" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    <v-col cols="3">
                        <CustomInputContainer label="Desc">
                        <div slot="input">
                            <v-text-field v-model="new_invoice.email" placeholder="Enter Desc" outlined hide-details></v-text-field>
                        </div>
                        </CustomInputContainer>
                    </v-col>
                    </v-row>
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
            addNewTimeActivityDialog: false,
        }
    }
} -->