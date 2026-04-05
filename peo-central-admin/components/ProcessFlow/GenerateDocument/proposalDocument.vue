
<template>
  <div>
    <v-form ref="form" class="pa-0 ma-0" style="display: contents !important;">
      <v-row class="pt-0">
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">
              UPFRONT COST - MOBILIZATION COSTS</span>
          </div>
        </v-col>
        <v-col cols="6" class="pl-0 pt-0 pb-0">
          <CustomInputContainer label="Employment Visa">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="6,000" solo dense class="proposalDialog_date_field"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Employment Visa')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" class="pt-0 pb-0">
          <CustomInputContainer label="Visa Validity">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="2 Years" solo dense class="proposalDialog_date_field"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Visa Validity')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6" class="pl-0 pb-0 pt-0">
          <CustomInputContainer label="Emiratisation Cost">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="3,000" solo dense class="proposalDialog_date_field"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Emiratisation Cost')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pb-0 pt-0">
          <CustomInputContainer label="Medical Insurance">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="500" solo dense class="proposalDialog_date_field"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Medical Insurance')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pl-0 pt-0 pb-0">
          <CustomInputContainer label="Security Deposit ">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="500" solo dense class="proposalDialog_date_field"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Security Deposit')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pb-0 pt-0">
          <CustomInputContainer label="Employee Statutory Benefits">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="500" solo dense class="proposalDialog_date_field"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Employee Statutory Benefits')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" class="pl-0 pt-0">
          <div class="mb-3">
            <span class="span_leadHeading"> MONTHLY COSTS</span>
          </div>
        </v-col>
        <!-- <v-col cols="12" class="pt-0 pl-0">
        <v-btn v-for="(button, index) in proposalDialogButtons" :key="index" @click="handleClick(index)"
          :class="{ clicked: button.clicked }" class="customer_table_btn pa-2 mr-3 primary--text" value="inactive"
          outlined>
          <span class="pa-0">{{ button.text }}</span>
        </v-btn>
        </v-col> -->
        <v-col cols="6" class="pl-0 pb-0">
          <CustomInputContainer label="Employee Salary">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="6,000" solo dense class="proposalDialog_date_field2"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Employee Salary')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class="pl-0 pb-0">
          <CustomInputContainer label="Service Fee">
            <div slot="input">
              <v-text-field @input="changeDetection" placeholder="3,000" solo dense class="proposalDialog_date_field2"
                v-model="proposal.auto_replace_keys[findIndex(proposal.auto_replace_keys, 'Service Fee')].value" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <p style="font-size: 11px !important; color: black">
            *All pricing can be set from the settings
          </p>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0">
          <p class="span_leadHeading">OR UPLOAD PROPOSAL</p>
          <FileDropzone />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
<script>
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
export default {
  components: {
    CustomInputContainer, FileDropzone
  },
  props: {
    proposal: Object,
  },
  data() {
    return {
      proposalDialogButtons: [
        { text: 'A-Level', clicked: false },
        { text: 'B-Level', clicked: false },
        { text: 'C-Level', clicked: false },
        { text: 'Custom', clicked: false },
      ],
    }
  },
  async mounted() {
    this.changeDetection()
  },
  methods: {

    changeDetection() {
      this.$emit('changeDetection', this.proposal, this.$refs.form)
    },
    findIndex(array, value) {
      var index = array.findIndex(function (person) {
        return person.label == value
      });
      return index
    }
  }
}
</script>