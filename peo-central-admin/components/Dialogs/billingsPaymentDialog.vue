<template>
  <!-- Billings  Dialog -->
  <v-dialog
    id="custom_dialog"
    v-model="dialogData"
    persistent
    width="80vw"
    height="100vh"
    content-class="proposal_dialog"
  >
    <div class="dialog_proposal">
      <v-card
        id="card"
        style="padding: 20px 30px !important; height: 100vh !important"
      >
        <v-card-title id="card-title" class="mb-5">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex">
                  <v-icon color="black" dense class="mr-5" @click="close()"
                    >fa-arrow-left</v-icon
                  >

                  <h4 class="text--text">
                    {{
                      selectedEmployerStatus === 'Paid' ? 'Invoice Details' : ''
                    }}
                    {{ selectedEmployerStatus === 'unpaid' ? ' NN-005' : '' }}
                    {{ selectedEmployerStatus === 'over due' ? 'Invoice' : '' }}
                  </h4>
                </div>

                <div class="d-flex align-center justify-end">
                  <v-btn
                    class="tall__btn mr-3 pl-4 pr-4 span_data"
                    color="subtext"
                    outlined
                    @click="proposalDialog = false"
                    ><span class="" @click="handleMailClick()">Mail</span></v-btn
                  >
                  <v-btn
                    class="tall__btn mr-3 pl-4 pr-4 span_data"
                    color="subtext"
                    outlined
                    @click="proposalDialog = false"
                    ><span class="" @click="handleShareClick()">Share</span></v-btn
                  >
                  <v-btn
                    class="tall__btn mr-3 pl-4 pr-4 span_data"
                    color="subtext"
                    outlined
                    @click="proposalDialog = false"
                    ><span class="" @click="handlePrintClick()">Print</span></v-btn
                  >
                  <v-btn
                    class="tall__btn pl-4 pr-4 span_data"
                    color="primary"
                    @click="handleDownloadClick()"
                  >
                    Download
                    <!-- {{ clickedButton == 'payroll_invoice' ? 'Save' : '' }}
                          {{ clickedButton == 'debit_note' ? 'Create' : '' }} -->
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider class=""></v-divider>
        <v-container class="ma-0 pa-0">
          <slot
            name="invoice-preview"
            v-if="selectedEmployerStatus === 'Paid'"
          ></slot>
        </v-container>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'

export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    FileDropzone,
  },
  props: {
    dialogData: Boolean,
    selectedEmployerStatus: String,
  },
  data() {
    return {
      products: [],

      //view estimate
      // snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },

      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),
      table_products: [
        {
          id: Math.random(),
          service: '',
          employee_name: '',
          employee_type: '',
          description: '',
          MOL_Salary: 'N/A',
          Non_MOL_Salary: 'N/A',
        },
      ],
      table_headers: [
        'Employee',
        'Type',
        'Description',
        'MOL Salary',
        'Non MOL Salary',
        'Actions',
      ],
      employersList: ['Binance', 'Coke', 'EirBlue', 'Fly Dubai'],
      paymentMethods: ['Bank', 'Cash', 'Other'],
      // date
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),

      //exit reason list
      exitReason: ['Termination', 'Resignation', 'End Of Contract'],
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      phone_rule: [],
    }
  },
  methods: {
    handleAddProduct() {
      let obj = {
        id: Math.random(),
        service: '',
        employee_name: '',
        description: '',
      }
      this.table_products.push(obj)
    },

    handleDeleteProduct(id) {
      this.table_products = this.table_products.filter(
        (el, index) => el.id !== id
      )
    },

    handleMailClick(){
      this.$emit('mail-clicked')
    },

    handleDownloadClick(){
      this.$emit('download-clicked')
    },

    handleShareClick(){
      this.$emit('share-clicked')
    },

    handlePrintClick(){
      this.$emit('print-clicked')
    },

    close() {
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss">
.dynamic_table {
  .dynamic_table_thead {
    tr {
      background: #e2e7f180 !important;
    }
  }

  .dynamic_table_tbody {
    .dynamic_table_body_rows {
      // border-bottom: 0.5 solid red !important;
      &:hover {
        background: #e2e7f142 !important;
      }
    }
  }
}
.estimate__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  width: 400px;
  // height: 120px;
}
</style>
