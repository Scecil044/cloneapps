<template>
  <!-- Create Work Order Dialog -->
  <v-dialog v-model="recordPaymentDialog" persistent height="100vh">
    <div class="workOrderDialog">
      <v-card id="card" style="padding: 20px 30px !important; width: 100%">
        <v-card-title id="card-title">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <h4 class="text--text">Record Payment</h4>
                <div class="d-flex align-center justify-end">
                  <v-btn
                    class="tall__btn mr-4 pl-6 pr-6"
                    color="subtext"
                    outlined
                    @click="$emit('closeRecordPaymentDialog')"
                    ><span class="">Cancel</span></v-btn
                  >
                  <v-btn
                    class="tall__btn pl-6 pr-6"
                    color="primary"
                    @click="$emit('closeRecordPaymentDialog')"
                    >Record</v-btn
                  >
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <v-row class="pt-0">
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Invoice Number" :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    placeholder="DSN-INVO1_32635373"
                    solo
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Ref No." :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    placeholder="Enter Reference Number"
                    solo
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="py-0 pl-0">
              <CustomInputContainer label="Payment Date" :mandatory="true">
                <div slot="input">
                  <v-menu
                    v-model="date_menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        class="inputField"
                        v-model="order_date"
                        placeholder="DD/MM/YYYY"
                        outlined
                        dense
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="order_date"
                      @input="date_menu = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Payment Method">
                <div slot="input">
                  <v-select
                    v-model="paymentMethod"
                    :items="paymentMethodList"
                    item-text="name"
                    item-value="id"
                    placeholder="Enter Payment Method"
                    outlined
                    dense
                    class="inputField"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 pb-0">
              <CustomInputContainer label="Amount Received">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    placeholder="Enter Name"
                    solo
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="pl-0 pb-0">
              <CustomInputContainer label="Attachments">
                <div slot="input">
                  <div
                    v-if="!file"
                    class="outlined dense"
                    style="height: 130px"
                  >
                    <div
                      :class="['dropZone', dragging ? 'dropZone-over' : '']"
                      style="height: 100%"
                      @dragenter="dragging = true"
                      @dragleave="dragging = false"
                    >
                      <div class="dropZone-info" @drag="onChange">
                        <span class="dropZone-title">
                          <span class="subtext--text"
                            >Drag/Drop files or click here</span
                          >
                        </span>
                      </div>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        @change="onChange"
                      />
                    </div>
                  </div>
                  <div v-else class="dropZone-uploaded" style="height: 130px">
                    <div class="dropZone-uploaded-info">
                      <h4 class="dropZone-title success--text">
                        <v-icon small color="success" class="mr-2"
                          >fa-check</v-icon
                        >File is added
                      </h4>
                      <div>fileName: {{ file.name }}</div>
                    </div>
                  </div>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
export default {
  components: {
    CustomInputContainer,
  },
  props: { recordPaymentDialog: Boolean },
  data() {
    return {
      date_menu: false,
      order_date: '',
      date_menu2: false,
      start_date: '',
      date_menu3: false,
      contract_end_date: '',
      working_days: '',
      working_hours: '',
      paymentMethod: '',
      paymentMethodList: ['Cash', 'Cheque', 'Credit Card', 'Direct Debit'],
      file: '',
      dragging: false,
    }
  },
  methods: {
    onChange(e) {
      var files = e.target.files || e.dataTransfer.files

      if (!files.length) {
        this.dragging = false
        return
      }

      this.createFile(files[0])
    },
    createFile(file) {
      if (file.size > 5000000) {
        alert('please check file size no over 5 MB.')
        this.dragging = false
        return
      }
      this.file = file
      this.dragging = false
    },
  },
}
</script>
