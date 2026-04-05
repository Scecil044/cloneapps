<template lang="">
  <v-dialog v-model="isVisible" max-width="700" persistent>
    <v-container class="pa-2 paymentDialog">
      <v-row class="paymentDialog__main_row">
        <v-col cols="12" class="mb-4">
          <div class="d-flex justify-space-between">
            <h2 style="letter-spacing: -0.023vw">Record Payment</h2>
            <v-btn icon color="red" outlined @click="handleClose">
              <v-icon>fa-close</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-form ref="paymentForm" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" class="pt-0">
            <CustomInputContainer label="Customer Name">
              <div slot="input">
                <v-text-field
                  placeholder="Customer Name"
                  :value="customer_name"
                  required
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </div>
            </CustomInputContainer>
          </v-col>
          <v-col cols="12" class="pt-0">
            <div
              class="d-flex align-center customInput_container"
              style="gap: 15px"
            >
              <p class="mb-6">Amount Received (AED)</p>
              <v-text-field
                label="Amount"
                single-line
                v-model="amount"
                :rules="[...rules.required]"
                required
                outlined
                dense
                type="number"
                step="0.01"
                :hint="`Invoice Amount: ${amount_received}`"
                @blur="formatAmount"
              ></v-text-field>
            </div>
            <div
              class="d-flex align-center customInput_container"
              style="gap: 15px"
            >
              <!-- <p class="mb-6">Bank Charges (if any)</p>
              <v-text-field
                label="Bank Charges"
                single-line
                v-model="bank_charges"
                :rules="[...rules.required]"
                required
                outlined
                dense
                type="number"
              ></v-text-field> -->
            </div>
          </v-col>
          <v-col cols="12" md="4" class="pt-0">
            <CustomInputContainer label="Payment Date">
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
                      v-model="payment_date"
                      placeholder="Enter Date"
                      outlined
                      dense
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :rules="[...rules.required]"
                    />
                  </template>
                  <v-date-picker
                    v-model="payment_date"
                    @input="
                      date_menu = false
                      onPaymentChanged(payment_date)
                    "
                  />
                </v-menu>
              </div>
            </CustomInputContainer>
          </v-col>
          <v-col cols="12" md="4" class="pt-0">
            <CustomInputContainer label="Payment Mode">
              <div slot="input">
                <v-select
                  :items="payment_modes"
                  label="Payment Mode"
                  append-icon="fa-chevron-down"
                  :rules="[...rules.required]"
                  dense
                  single-line
                  v-model="selected_payment_mode"
                  outlined
                ></v-select>
              </div>
            </CustomInputContainer>
          </v-col>
          <v-col cols="12" md="4" class="pt-0">
            <CustomInputContainer label="Deposit To">
              <div slot="input">
                <v-autocomplete
                  v-model="deposit_account"
                  :items="deposit_to"
                  label="Deposit To"
                  append-icon="fa-chevron-down"
                  :rules="[...rules.required]"
                  dense
                  outlined
                  single-line
                  return-object
                  item-text="name"
                ></v-autocomplete>
              </div>
            </CustomInputContainer>
          </v-col>
          <v-col cols="12" class="pt-0">
            <CustomInputContainer label="Reference">
              <div slot="input">
                <v-text-field
                  v-model="reference"
                  placeholder="Enter Reference"
                  outlined
                  dense
                  :rules="[...rules.required]"
                />
              </div>
            </CustomInputContainer>
          </v-col>
          <v-col cols="12" class="pt-0">
            <CustomInputContainer label="Notes">
              <div slot="input">
                <v-textarea
                  v-model="notes"
                  placeholder="Enter Notes"
                  outlined
                  dense
                  :rules="[...rules.required]"
                />
              </div>
            </CustomInputContainer>
          </v-col>
          <!-- <v-col cols="12" class="pt-0">
          <CustomInputContainer label="Attach File">
            <div slot="input" class="mt-2">
              <v-file-input label="Upload File" variant="solo"></v-file-input>
            </div>
          </CustomInputContainer>
        </v-col> -->
          <v-col cols="12" class="pt-0">
            <v-checkbox
              v-model="thankyou_email"
              color="subtext"
              label="Email a Thank You note for this payment"
              dense
              @click="handleThankyou()"
            />
          </v-col>
          <v-col cols="12">
            <p class="error--text" v-if="error.status">{{ error.message }}</p>
            <p class="error--text" v-if="payment_errors.status">
              {{ payment_errors.message }}
            </p>
          </v-col>
          <v-col cols="12" class="pt-0">
            <div class="btn_container">
              <v-btn
                class="tall__btn primary"
                color="#fff"
                block
                outlined
                @click.prevent="handleSubmit"
              >
                <span>Submit</span></v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </v-dialog>
</template>
<script lang="js">
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'

export default {
  components:{
    CustomInputContainer,
    FileDropzone
  },
  props:{
    isVisible:{
      default:false
    },
    customer_name:{
      default:"",
    },
    amount_received:{
      default:0
    },
    deposit_to:{
      default:[]
    },
    payment_errors:{
      default:{
        status:false,
        message:''
      }
    }
  },
  data() {
    return {
      rules:{
        required:[(v) => !!v || 'This filed is required']
    },
    valid:true,
      amount:0,
      bank_charges:0,
      date_menu : false,
      payment_date:'',
      payment_modes:['Cash','Cheque','Credits'],
      selected_payment_mode:'',
      deposit_account:'',
      reference:'',
      notes:'',
      upload_file:'',
      thankyou_email:false,
      error:{
        status:false,
        message:"Check your amount"
      },
    }
  },
  methods: {
    onPaymentChanged(){

    },
    fileHandler(file){
      this.upload_file=file
    },
    handleThankyou(){

    },
    handleSubmit(e){
      e.preventDefault();
      this.$refs.paymentForm.validate();
      if(parseFloat(this.amount) > parseFloat(this.amount_received)){
        this.error.status = true
        this.error.message = `Your Invoice Amount is ${this.amount_received}, Please give equivalent or less amount.`
        return;
      }
      if(this.$refs.paymentForm.validate()){
        let payload = {
          bank_charges:parseFloat(this.bank_charges),
          payment_date:this.payment_date,
          payment_mode:this.selected_payment_mode,
          reference:this.reference,
          deposit_to:this.deposit_account._id,
          note:this.notes,
          is_thanks_required:this.thankyou_email,
          amount:parseFloat(this.amount),
        }

        this.$emit('handleSubmit', payload)
        this.error = {
          status:false,
          message:''
        }
      }

    },
    handleClose(){
      this.amount = 0;
      this.$emit('handleClose')
    },
    formatAmount() {
      if (this.amount && this.amount !== '') {
        const amount = parseFloat(this.amount)
        if (!isNaN(amount)) {
          this.amount = amount.toFixed(2)
        }
      }
    },
  },
}
</script>
<style lang="scss">
.paymentDialog {
  background: #fff;
}
.customInput_container {
  .v-text-field {
    padding-top: 0px !important;
    margin-top: 0px !important;
    border-radius: 10px !important;
    box-shadow: none !important;

    .v-input__slot {
      &::before {
        content: none !important;
      }
    }
  }
}
.btn_container {
  max-width: 200px;
}
// .pD_dialog {
//   .v-dialog.v-dialog--active.v-dialog--persistent {
//     max-height: 90vh !important;
//   }
// }
</style>
