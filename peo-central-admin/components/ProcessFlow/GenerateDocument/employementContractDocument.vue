<template>
  <div>
    <v-row class=" pt-0">
      <v-col cols="12" class="pl-0 pt-0 pb-0">
        <div class="mt-6 mb-4">
          <span class="span_leadHeading">PERSONAL DETAILS</span>
        </div>
      </v-col>
      <v-form ref="form" v-if="computedAll" class="pa-0 ma-0" style="display: contents !important;">
        <v-col cols="4" class="pl-0 pt-0 pb-0">
          <CustomInputContainer label="Agreement Date">
            <div slot="input">
              <v-menu v-model="selected_agreement_day" :close-on-content-click="false" :nudge-right="40"
                transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="contract.user_input_keys[findIndex(contract.user_input_keys, 'Employment Contract Date')].value"
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
                  v-model="contract.user_input_keys[findIndex(contract.user_input_keys, 'Employment Contract Date')].value"
                  @input="selected_agreement_day = false" />
              </v-menu>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">Contract to</span>
          </div>
        </v-col>
        <v-col cols="4" class=" pl-0 pt-0 pb-0">
          <CustomInputContainer label="Company Name" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Company Name')].value"
                hide-details placeholder="company name" solo dense class="proposalDialog_date_field2"
                :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" class=" pl-0 pt-0 pb-0"
          v-if="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Company Reg Number')]">
          <CustomInputContainer label="Company Reg Number" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Company Reg Number')].value"
                hide-details placeholder="company name" solo dense class="proposalDialog_date_field2"
                :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
          <CustomInputContainer label="Company Country:" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Company Country')].value"
                placeholder="Marina, Dubai" class="proposalDialog_date_field2" hide-details solo dense
                :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="10" md="10" lg="10" class="pl-0 pr-12">
          <CustomInputContainer label="Company Office Address:" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Company Address')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">Employee Details</span>
          </div>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="First Name" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'First Name')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Middle Name">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Middle Name')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense>
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Last Name" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Last Name')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="City" :mandatory="true">
            <div slot="input">
              <v-text-field v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'City')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Country" :mandatory="true">
            <div slot="input">
              <v-autocomplete placeholder="country" :items="countryList"
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Country')].value" dense
                append-icon="fa-chevron-down" outlined :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Address" :mandatory="true">
            <div slot="input">
              <v-text-field v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Address')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Contract Duration" :mandatory="true">
            <div slot="input">
              <v-select :items="['Full Time', 'Temporary']" item-text="name"
                placeholder="Add Contract type"
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Contract Type')].value" solo
                class="proposalDialog_date_field2" dense append-icon="fa-chevron-down" outlined :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Leave Policy" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Leave Policy')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Probation Period">
            <div slot="input">
              <v-autocomplete placeholder="Add Probation Period"
                :items="['0 Months', '1 Month', '2 Months', '3 Months', '4 Months', '5 Months', '6 Months']"
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Probation Period')].value"
                hide-details solo dense append-icon="fa-chevron-down" outlined :rules="main_rule" />
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4">
          <CustomInputContainer label="HR Specialist and Support Agent">
            <div slot="input">
              <v-select
                v-model="employment.support_agent"
                :items="supportAgents"
                item-text="name"
                return-object
                placeholder="Select HR Specialist and Support Agent"
                outlined
                dense
                @change="onSelectChange('support_agent', $event)"
                @focus="fetchSpecialists('support agents')"
              >
                <template v-slot:selection="{ item }">
                  <span>{{ item.first_name }} {{ item.last_name }}</span>
                </template>
                <template v-slot:item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-select>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4">
          <CustomInputContainer label="Escalation Manager">
            <div slot="input">
              <v-select
                v-model="employment.escalation_manager"
                :items="escalation_managers"
                item-text="name"
                return-object
                placeholder="Select Escalation Manager"
                outlined
                dense
                @change="onSelectChange('escalation_manager', $event)"
                @focus="fetchSpecialists('escalation managers')"
              >
                <template v-slot:selection="{ item }">
                  <span>{{ item.first_name }} {{ item.last_name }}</span>
                </template>
                <template v-slot:item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-select>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4">
          <CustomInputContainer label="Insurance Agent">
            <div slot="input">
              <v-select
                v-model="employment.insurance_agent"
                :items="insuranceAgents"
                item-text="full_name"
                item-value="_id"
                return-object
                placeholder="Select Insurance Agent"
                outlined
                dense
                @change="onSelectChange('insurance_agent', $event)"
                @focus="fetchSpecialists('insurance agents')"
              >
              </v-select>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4">
          <CustomInputContainer label="Assigned PRO">
            <div slot="input">
              <v-select
                v-model="employment.assigned_pro"
                :items="pros"
                item-text="name"
                return-object
                placeholder="Select PRO"
                outlined
                dense
                @change="onSelectChange('assigned_pro', $event)"
                @focus="fetchSpecialists('PRO')"
              >
                <template v-slot:selection="{ item }">
                  <span>{{ item.first_name }} {{ item.last_name }}</span>
                </template>
                <template v-slot:item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-select>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="12" class="pl-0 pt-0 pb-0">
          <div class="mt-6 mb-4">
            <span class="span_leadHeading">Salary Details</span>
          </div>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Basic Salary" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Basic Salary')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Petrol Allowance" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Petrol Allowance')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <!-- <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Car Allowance" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Car Allowance')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col> -->
        <!-- <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="HRA Allowance" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'HRA Allowance')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col> -->
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Food Allowance" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Food Allowance')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Transport Allowance" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Transportation Allowance')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Housing Allowance" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Housing Allowance')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Other Allowance" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Other Allowance')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule">
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
        <v-col cols="4" md="4" lg="4" class="pl-0 pr-12">
          <CustomInputContainer label="Total Salary" :mandatory="true">
            <div slot="input">
              <v-text-field
                v-model="contract.auto_replace_keys[findIndex(contract.auto_replace_keys, 'Total Salary')].value"
                placeholder="" class="proposalDialog_date_field2" hide-details solo dense :rules="main_rule"
                readonly><!-- Added readonly attribute to prevent editing -->
              </v-text-field>
            </div>
          </CustomInputContainer>
        </v-col>
      </v-form>
    </v-row>
  </div>
</template>
<script>
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import countryFlagsDialCode from "country-flags-dial-code";
import countries from "countries-list";
export default {
  components: {
    CustomInputContainer, FileDropzone, CalenderSvg
  },
  props: {
    contract: Object,
  },
  data() {
    return {
      countryCode: [],
      hr_specialists: [],
      supportAgents: [],
      escalation_managers: [],
      insuranceAgents: [],
      pros: [],
      visa_sponsors: [],
      main_rule: [(v) => !!v || 'This field is required'],
      selected_agreement_day: false,
      employment: {
        hr_specialist: '',
        support_agent: '',
        escalation_manager: '',
        insurance_agent: '',
        assigned_pro: ''
      }
    }
  },
  async mounted() {
    this.changeDetection()
    this.getVisaSponsors()
    this.getInsuranceAgent()
  },
  methods: {
    getInsuranceAgent() {
      this.comPage++;
      if (this.$auth.loggedIn) {
        this.$axios
          .$get(`https://insurance-api.nathanhr.com/insurance/getinsuranceagents`, {
            headers: {
              'x-api-key': '1b163c39ff6989bec2a0810a',
            },
          })
          .then((response) => {
            this.insuranceAgents = response.map((agent) => ({
              ...agent,
              full_name: `${agent.full_name}`,
            }));
          })
          .catch((error) => {
            console.error('API Error:', error.response || error);
          });
      } else {
        this.insuranceAgents = [];
      }
    },
    async getVisaSponsors() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/configuration/visasponsors`, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.visa_sponsors = response.data.visa_sponsors
        })
    },
    changeDetection() {
      this.$emit('changeDetection', {
        contract: this.contract,
        employment: this.employment
      }, this.$refs.form);
    },
    findIndex(array, value) {
      var index = array.findIndex(function (element) {
        return element.label == value
      });
      return index
    },
    async fetchSpecialists(role){
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        let response = await this.$axios.$get(`/users?role=${role}`, { headers: { Authorization: AuthStr } })
        if (response){
          if (role === 'hr specialists'){
            this.hr_specialists = response
          } else if (role === 'escalation managers'){
            this.escalation_managers = response
          } else if (role === 'support agents'){
            this.supportAgents = response
          } else if (role === 'PRO'){
            this.pros = response
          }
        }
      } catch (error){
        console.error(error)
        throw error;
      }
    },
    onSelectChange(field, selectedValue) {
      if(field === 'support_agent'){
        const defaultValue = this.supportAgents.find(item => item.first_name === 'Sehrish');
        this.employment[field] = defaultValue;
        this.$emit('changeDetection', {
          employment: this.employment
        }, this.$refs.form);
      } else if(field === 'insurance_agent') {
        // Always set the full object for insurance_agent
        this.employment.insurance_agent = selectedValue;
        this.$emit('changeDetection', {
          employment: this.employment
        }, this.$refs.form);
      } else {
        this.employment[field] = selectedValue;
        this.$emit('changeDetection', {
          employment: this.employment
        }, this.$refs.form);
      }
    },
  },
  computed: {
    computeNationalities() {
      var data = require("i18n-nationality");
      data.registerLocale(require("i18n-nationality/langs/en.json"));
      const nationalityNames = data.getNames("en")
      const updatedNationalities = Object.values(nationalityNames).sort(function (a, b) {
        var textA = a.toUpperCase();
        var textB = b.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      return updatedNationalities;
    },
    computedAll() {
      let total = 0
      let full_name = ""
      if (this.contract && this.contract.auto_replace_keys) {
        this.contract.auto_replace_keys.forEach((element) => {
          if (element.label === 'Basic Salary' || element.label === 'HRA Allowance' || element.label === 'Transportation Allowance' || element.label === 'Food Allowance' || element.label === 'Car Allowance' || element.label === 'Petrol Allowance' || element.label === 'Other Allowance' || element.label === 'Housing Allowance') {
            // Parse as float and handle invalid/empty values
            const value = parseFloat(element.value) || 0;
            total += value;
          }
          if (element.label === 'First Name' && element.value !== null && element.value !== "") {
            full_name += element.value
          }
          if (element.label === 'Middle Name' && element.value !== null && element.value !== "") {
            full_name += (" " + element.value)
          }
          if (element.label === 'Last Name' && element.value !== null && element.value !== "") {
            full_name += (" " + element.value)
          }
        })
        this.contract.user_input_keys[this.findIndex(this.contract.user_input_keys, 'Full Name')].value = full_name
        // Update Total Salary only if there are valid values
        const totalSalaryIndex = this.findIndex(this.contract.auto_replace_keys, 'Total Salary');
        if (totalSalaryIndex !== -1) {
          this.contract.auto_replace_keys[totalSalaryIndex].value = total.toFixed(0);
        }
      }
      return true
    },
    countryList() {
      const countryCodes = Object.keys(countries.countries);
      const countryNames = countryCodes.map(
        (code) => countries.countries[code].name
      );
      return countryNames;
    },
  }
}
</script>