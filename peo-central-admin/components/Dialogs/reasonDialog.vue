<template lang="">
  <v-dialog v-model="isVisible" persistent max-width="450">
    <v-container class="pa-2 reasonDialog">
      <v-row class="pD__main_row">
        <v-col cols="12" class="mb-4">
          <div class="d-flex justify-space-between">
            <h2 style="letter-spacing: -0.023vw">{{ title }}</h2>
            <v-btn icon color="red" outlined @click="handleClose">
              <v-icon>fa-close</v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-form ref="reasonForm" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12" class="pt-0">
            <CustomInputContainer label="Date" :mandatory="true">
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
                      v-model="reason_date"
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
                    v-model="reason_date"
                    @input="date_menu = false"
                  />
                </v-menu>
              </div>
            </CustomInputContainer>
          </v-col>
          <v-col cols="12">
            <CustomInputContainer label="Reason" :mandatory="true">
              <div slot="input">
                <v-textarea
                  v-model="reason"
                  placeholder="Reason"
                  outlined
                  dense
                  :rules="[...rules.required]"
                />
              </div>
            </CustomInputContainer>
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
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
export default {
  components: {
    CustomInputContainer,
  },
  props: {
    isVisible: {
      default: false,
    },
    title: {
      default: 'Title',
    },
  },
  data() {
    return {
      valid: true,
      reason_date: '',
      reason: '',
      rules: {
        required: [(v) => !!v || 'This filed is required'],
      },
      date_menu: false,
    }
  },
  methods: {
    handleClose() {
      this.$refs.reasonForm.reset()
      this.$emit('handleClose')
    },
    handleSubmit() {
      this.$refs.reasonForm.validate()
      if (this.$refs.reasonForm.validate()) {
        this.$emit('handleSubmit', {
          date: this.reason_date,
          reason: this.reason,
        })
      }
    },
  },
}
</script>
<style lang="scss">
.reasonDialog {
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
</style>
