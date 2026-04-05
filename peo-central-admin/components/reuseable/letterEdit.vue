<template>
  <v-form ref="form">

    <v-row class="py-0 my-0" v-if="computedServiceList.letter_type == 'Custom Letter Requests'">
      <v-col cols="12" sm="12" md="12" lg="12" style="margin-bottom : 30px;">
        <client-only placeholder="Loading" label="User Address">
          <quill-editor v-model="computedServiceList.letter_fields.other_requests_to_address_1" ref="myQuillEditor"
            :options="editorToAddress" :style="{ 'height': '100px' }"></quill-editor>
        </client-only>
      </v-col>
      <v-col cols="12" sm="12" md="12" lg="12" style="margin-bottom : 60px;">
        <client-only placeholder="Loading">
          <quill-editor v-model="computedServiceList.letter_fields.other_requests_subject" ref="myQuillEditor"
            :options="editorBody" :style="{ 'height': '100px' }"></quill-editor>
        </client-only>
      </v-col>
      <v-col cols="12" sm="12" md="12" lg="12" style="margin-bottom : 60px;">
        <client-only placeholder="Loading">
          <quill-editor v-model="computedServiceList.letter_fields.other_requests_body_1" ref="myQuillEditor"
            :options="editorBody" :style="{ 'height': '200px' }"></quill-editor>
        </client-only>
      </v-col>
    </v-row>
    <v-row v-if="computedServiceList.letter_type != 'Custom Letter Requests'">
      <v-col cols="12" sm="6" md="6" lg="6" class="pt-0" v-for="(data, index) in computedServiceList.letter_keys"
        :key="index">

        <v-textarea :hint="data.name.hint" persistent-hint dense outlined v-model="data.value"
          v-if="data.type == 'Textarea'"></v-textarea>

        <v-select :hint="data.name.hint" dense outlined persistent-hint :items="splitLetterKeyHints(data.selector_values)"
          v-model="data.value"
          v-if="data.type == 'Select' && data.name.key != '[travelDestination]' && data.name.key != '[companyName]'"></v-select>

        <v-select :hint="data.name.hint" persistent-hint dense outlined :items="countryList" v-model="data.value"
          v-if="data.name.key == '[travelDestination]'"></v-select>

        <v-select :hint="data.name.hint" persistent-hint dense outlined :items="computeCompanies" v-model="data.value"
          v-if="data.name.key == '[companyName]'"></v-select>

        <v-menu v-if="data.type == 'Date Picker'" :close-on-content-click="false" :nudge-right="40"
          transition="scale-transition" offset-y min-width="290px">
          <template v-slot:activator="{ on, attrs }">
            <v-text-field :hint="data.name.hint" outlined dense v-model="data.value" persistent-hint
              label="Team Date" v-bind="attrs" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="data.value" @input="menu6 = false"></v-date-picker>
        </v-menu>

        <v-text-field :hint="data.name.hint" dense persistent-hint v-model="data.value" outlined
          v-if="data.type == 'Text Feild'"></v-text-field>

      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn @click.prevent="editRequest(computedServiceList._id)" color="primary" class="white--text" depressed
          >Update Request</v-btn>
        <v-btn @click="$nuxt.$emit('letterEditClose')" class="caption" text >cancel</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="isSent">
      <v-col cols="12">
        <v-alert dismissible class="caption" type="success">
          Changes have been updated!
        </v-alert>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  layout: 'dashboard',
  props: ['computedServiceList', 'user', 'countryList', 'emailBody', 'companies'],
  data() {
    return {
      isSent: false,
      genericRule: [(v) => !!v || "This field is Required"],
      nocCountryRules: [(v) => !!v || "Country is Required"],
      nocTravelRules: [(v) => !!v || "Travel Dates is Required"],
      nocReasonRules: [(v) => !!v || "Reason for Travel is Required"],
      nocDrivingRules: [(v) => !!v || "NOC Diving Options is Required"],
      salaryAddreseeRules: [(v) => !!v || "Addressee Name is Required"],
      trransferBankRules: [(v) => !!v || "Bank Name is Required"],
      trransferAccountRules: [(v) => !!v || "Account Number is Required"],
      trransferIBANRules: [(v) => !!v || "IBAN Number is Required"],
      paySlipMonthRules: [(v) => !!v || "Month is Required"],
      paySlipYearRules: [(v) => !!v || "Year is Required"],
      otherRequestRules: [(v) => !!v || "Comment is Required"],
      menu2: false,
      menu3: false,
      menu4: false,
      menu5: false,
      modal: false,
      menu6: false,
      editorToSubject: {
        debug: 'info',
        placeholder: 'Type Your Subject here...',
        // theme: 'snow',
        modules: {}
      },
      editorToAddress: {
        debug: 'info',
        placeholder: 'Type Addressee here...',
        // theme: 'bubble',
        modules: {}
      },
      editorBody: {
        debug: 'info',
        placeholder: 'Type Your Request here...',
        // theme: 'snow',
        modules: {}
      },
      emailId: "",
    }
  },

  methods: {
    splitLetterKeyHints(string) {
      let arr_keys = []
      if (string) {
        let split_array = string.split(",")
        let str = ""
        for (let i = 0; i < split_array.length; i++) {
          arr_keys.push(split_array[i])
        }
        return arr_keys
      } else {
        return ""
      }
    },
    editRequest(id) {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);

      this.computedServiceList.appliction_log.push({
        approver_id: this.user._id,
        status: "Letter information updated.",
        date_created: new Date(),
        reason: ''
      })

      this.$axios
        .$put("requests/update-request/" + id, this.computedServiceList, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.isMsgSent = true;
          this.isSent = true;
          setTimeout(() => {
            this.$nuxt.$emit('letterEdit')
            this.$nuxt.$emit('letterEditClose')
            this.isSent = false;
            this.isMsgSent = false;
            // this.$refs.form.reset();
            // this.$router.go();
          }, 2000);
        })
    },
  },
  computed: {
    computeCompanies() {
      let companiesData = [];
      for (let index = 0; index < this.companies.length; index++) {
        const element = this.companies[index];
        companiesData.push(element.company_name)
      }
      return companiesData
    }
  }
}
</script>