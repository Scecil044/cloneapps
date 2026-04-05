
<template>
  <div>
    <v-form ref="form" class="pa-0 ma-0" style="display: contents !important;">
      <v-row class=" pt-12">

        <v-col cols="4" class="pl-0 pt-0 pb-0">
          <CustomInputContainer label="Agreement Date">
            <div slot="input">
              <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="agreement.user_input_keys[findIndex(agreement.user_input_keys, 'Agreement Date')].value"
                    placeholder="Enter Date" solo class="proposalDialog_date_field2" dense hide-detail v-bind="attrs"
                    v-on="on" :rules="main_rule">
                    <template v-slot:append>
                      <div class="">
                        <CalenderSvg />
                      </div>
                    </template>
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="agreement.user_input_keys[findIndex(agreement.user_input_keys, 'Agreement Date')].value"
                  @input="date_menu = false" />
              </v-menu>
            </div>
          </CustomInputContainer>



        </v-col>
        <v-col cols="4" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Agreement No.">
            <div slot="input">
              <v-text-field
                v-model="agreement.user_input_keys[findIndex(agreement.user_input_keys, 'Agreement Number')].value"
                hide-details placeholder="Enter Number" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">THIS AGREEMENT IS ENTERED BETWEEN</span>
          </div>
        </v-col>
        <v-col cols="4" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Company Name">
            <div slot="input">
              <v-text-field
                v-model="agreement.auto_replace_keys[findIndex(agreement.auto_replace_keys, 'Company Name')].value"
                hide-details placeholder="company name" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Trade License Number:">
            <div slot="input">
              <v-text-field
                v-model="agreement.auto_replace_keys[findIndex(agreement.auto_replace_keys, 'Trade License Number')].value"
                hide-details placeholder="company name" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="6" class=" pl-0 pr-12">
          <CustomInputContainer label="VAT Number (TRN):">
            <div slot="input">
              <v-text-field
                v-model="agreement.auto_replace_keys[findIndex(agreement.auto_replace_keys, 'VAT Number')].value"
                hide-details placeholder="Enter Number" solo dense class="proposalDialog_date_field2" />
            </div>
          </CustomInputContainer>
        </v-col>

        <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">

          <CustomInputContainer label="Place of Registration:">
            <div slot="input">
              <v-text-field
                v-model="agreement.auto_replace_keys[findIndex(agreement.auto_replace_keys, 'Place of Registration')].value"
                placeholder="Marina, Dubai" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>


        </v-col>

        <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">

          <CustomInputContainer label="Company Office Address:">
            <div slot="input">
              <v-text-field
                v-model="agreement.auto_replace_keys[findIndex(agreement.auto_replace_keys, 'Company Office Address')].value"
                placeholder="Office 1006 Marina, Dubai " class="proposalDialog_date_field2" hide-details solo dense
                :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>


        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">AND</span>
          </div>
        </v-col>
        <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
          <CustomInputContainer label="Entity/Company Name">
            <div slot="input">
              <v-autocomplete :items="visa_sponsors" item-text="company_name" v-model="selectedEntity"
                @change="changeEntity()" return-object placeholder="Self Company" outlined dense :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="8" class=" pl-0 pt-0 pb-0">
          <div style="width: 48% !important;">
            <CustomInputContainer label="Trade License Number:">
              <div slot="input">
                <v-text-field
                  v-model="agreement.user_input_keys[findIndex(agreement.user_input_keys, 'Trade License Number')].value"
                  hide-details placeholder="company name" solo dense class="proposalDialog_date_field2" />
              </div>
            </CustomInputContainer>
          </div>
        </v-col>
        <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
          <CustomInputContainer label="Place of Registration:">
            <div slot="input">
              <v-text-field
                v-model="agreement.user_input_keys[findIndex(agreement.user_input_keys, 'Place of Registration')].value"
                placeholder="Marina, Dubai" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
          <CustomInputContainer label="Company Office Address:">
            <div slot="input">
              <v-text-field
                v-model="agreement.user_input_keys[findIndex(agreement.user_input_keys, 'Company Office Address')].value"
                placeholder="Office 1006 Marina, Dubai " class="proposalDialog_date_field2" hide-details solo dense
                :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
<script>
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
export default {
  components: {
    CustomInputContainer, FileDropzone, CalenderSvg
  },
  props: {
    agreement: Object,
  },
  data() {
    return {
      date_menu: false,
      main_rule: [(v) => !!v || 'This filed is required'],
      selectedEntity: {},
      visa_sponsors: [],
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
    this.getVisaSponsors()
  },
  methods: {
    async getVisaSponsors() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/configuration/visasponsors`, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.visa_sponsors = response.data.visa_sponsors
          this.selectedEntity = this.visa_sponsors[0]
          this.changeEntity()
        })
    },
    changeDetection() {
      this.$emit('changeDetection', this.agreement, this.$refs.form)
    },

    changeEntity() {
      this.agreement.user_input_keys[this.findIndex(this.agreement.user_input_keys, 'Entity')].value = this.selectedEntity.company_name
      this.agreement.user_input_keys[this.findIndex(this.agreement.user_input_keys, 'Company Office Address')].value = this.selectedEntity.company_address
      this.agreement.user_input_keys[this.findIndex(this.agreement.user_input_keys, 'Place of Registration')].value = this.selectedEntity.place_of_registration
      this.agreement.user_input_keys[this.findIndex(this.agreement.user_input_keys, 'Trade License Number')].value = this.selectedEntity.trade_license_number
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