<template>
  <v-form ref="letterRequestFormRef">
    <v-progress-linear indeterminate v-if="newLetterProgress"></v-progress-linear>
    <div :class="letterRequest ? 'mt-0' : 'mt-13'">
      <v-row class="pt-0 mx-0 mx-auto" style="max-width:80%" v-if="letterRequest">
        <v-col cols="12" class="pb-0 my-0" v-if="userType != 'SELF'">
          <v-select class="customMdiMenuDown redTextForm" dense
            :items="employees.filter((a) => a.user_status != 'Inactive')"
            :item-text="(item) => `${item.first_name} `" item-value="_id" hint="Employee" persistent-hint
            placeholder="Select Employee" v-model="request.letter_fields.user_id" @change="letterUserSelected"
            :rules="genericRule"></v-select>
        </v-col>
      </v-row>
      <v-row class="pt-4 mx-0 mx-auto" style="max-width:80%">
        <v-col cols="12" sm="12" md="6" class="pt-0">
          <p class="grey-heading-text font-weight-medium textFontSize">Letter Type</p>
          <v-select class="customMdiMenuDown redTextForm" dense :items="sortedItems" hint="Letter Type" persistent-hint
            v-model="request.letter_type" :rules="genericRule"></v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6" class="pt-0" v-if="request.letter_type == 'NOC'">
          <p class="grey-heading-text font-weight-medium textFontSize redTextForm">NOC
            Options</p>
          <v-select class="customMdiMenuDown" dense :items="NOCOptions" hint="NOC Options" persistent-hint
            v-model="request.letter_sub_type" :rules="genericRule"></v-select>
        </v-col>
      </v-row>

      <!-- Custom Letter Requests -->
      <v-row class="mx-0 mx-auto" v-if="request.letter_type == 'Custom Letter Requests'" style="max-width:80%">
        <v-col cols="12" sm="12" md="12" lg="12" class="mt-3">
          <v-textarea label="Profile Address" dense v-model="request.letter_fields.other_requests_to_address_1"
            :rules="genericRule" persistent-hint class="py-0 pt-0 redTextForm"></v-textarea>
        </v-col>
        <v-col cols="12" sm="12" md="12" lg="12" class="mt-3">
          <v-textarea label="Subject" dense v-model="request.letter_fields.other_requests_subject"
            :rules="genericRule" persistent-hint class="py-0 pt-0 redTextForm"></v-textarea>
        </v-col>
        <v-col cols="12" sm="12" md="12" lg="12" class="mt-3">
          <v-textarea label="Body" dense v-model="request.letter_fields.other_requests_body_1"
            :rules="genericRule" persistent-hint class="py-0 pt-0 redTextForm"></v-textarea>
        </v-col>
        <!-- <v-col cols="12" sm="12" md="12" lg="12" style="margin-bottom: 60px" class="mt-3">
          <p class="grey-heading-text font-weight-medium textFontSize">Subject</p>
          <quill-editor v-model="request.letter_fields.other_requests_subject" ref="myQuillEditor"
            :options="editorToSubject" :style="{ height: '100px' }" :rules="genericRule"></quill-editor>
        </v-col>
        <v-col cols="12" sm="12" md="12" lg="12" style="margin-bottom: 60px" class="mt-3">
          <client-only placeholder="loading...">
            <p class="grey-heading-text font-weight-medium textFontSize">Body</p>
            <quill-editor v-model="request.letter_fields.other_requests_body_1" ref="myQuillEditor"
              :options="editorBody" :style="{ height: '200px' }" :rules="genericRule"></quill-editor>
          </client-only>
        </v-col> -->
      </v-row>

      <v-row v-if="request.letter_type != 'Custom Letter Requests'" style="max-width:80%" class="mx-0 mx-auto">
        <v-col cols="12" :sm="data.type == 'Quill Editor' ? '12' : '6'" class="pt-0 mt-5"
          v-for="(data, index) in letterKeys" :key="index">
          <p class="grey-heading-text font-weight-medium textFontSize">{{ data.name.hint }}</p>
          <v-textarea dense v-model="data.value" :hint="data.name.hint" persistent-hint
            v-if="data.type == 'Textarea'"></v-textarea>

          <v-textarea rows="3" v-if="data.type == 'Quill Editor'" auto-grow outlined dense v-model="data.value"
            hint="Travel Dates" placeholder="Travel Dates" persistent-hint>
          </v-textarea>

          <!-- <quill-editor
         v-if="data.type == 'Quill Editor'"
         class="mb-5"
          v-model="data.value"
          ref="myQuillEditor"
          :options="editorToDates"
          :style="{ height: '100px' }"
        ></quill-editor>
         -->

          <v-select :hint="data.name.hint" persistent-hint dense class="customMdiMenuDown redTextForm"
            :items="splitLetterKeyHints(data.selector_values)" v-model="data.value" v-if="data.type == 'Select' &&
              data.name.key != '[travelDestination]' &&
              data.name.key != '[companyName]'
              " :rules="genericRule"></v-select>

          <v-select :hint="data.name.hint" persistent-hint dense class="customMdiMenuDown redTextForm"
            :items="countryList" v-model="data.value" v-if="data.name.key == '[travelDestination]'"
            :rules="genericRule"></v-select>

          <v-select :hint="data.name.hint" persistent-hint dense class="customMdiMenuDown" :items="computeCompanies"
            v-model="data.value" v-if="data.name.key == '[companyName]'"></v-select>

          <v-menu v-if="data.type == 'Date Picker'" :close-on-content-click="true" transition="scale-transition"
            min-width="290px">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field class="redTextForm" :hint="data.name.hint" persistent-hint dense v-model="data.value"
                v-bind="attrs" v-on="on" :rules="genericRule"></v-text-field>
            </template>
            <v-date-picker no-title scrollable v-model="data.value" :min="computedMinimumDate"
              @input="menu6 = false"></v-date-picker>
          </v-menu>

          <v-text-field :hint="data.name.hint" persistent-hint dense v-model="data.value"
            v-if="data.type == 'Text Feild'"></v-text-field>
        </v-col>
      </v-row>
      <!-- Send Request Button -->
      <v-row class="text-right mx-0 mx-auto mt-5" style="max-width:80%">
        <v-col cols="12" class="">
          <v-btn color="blue darken-2 "
            class="border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset"
            @click.prevent="saveForm" :disabled="disableSaveButton || computeLevelApprover" dark elevation="0"
            >Send Request</v-btn>
        </v-col>
      </v-row>
    </div>
  </v-form>
</template>

<script>
import { LetterEmail } from "@nathangroup/letter-email";
import notificationMethod from "~/plugins/notification";
export default {
  layout: "dashboard",
  props: [
    "userType",
    "letterTemplate",
    "countryList",
    "NOCOptions",
    "letterOptions",
    "users",
    "request",
    "getUserDetails",
    "emailBody",
    "emailBodyHR",
    "user",
    "addressee",
    "subject",
    "body",
    "computeCompanyLetterImages",
    "computeLetterPDFStyles",
    "computeLetterPreviewStyles",
    "computeSigantoryManager",
    "employees",
    "letterRequest",
    "letterKeys",
    "companyData",
  ],
  data() {
    return {
      newLetterProgress: false,
      disableSaveButton: false,
      NOCDrivingOptions: ["New License Application", "Conversion of License"],
      licenseTypeList: [
        "Light Motor Vehicle",
        "Heavy Motor Vehicle",
        "Motorcycle",
      ],
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
      editorToAddress: {
        debug: "info",
        placeholder: "Type Your Address here...",
        theme: "snow",
        modules: {},
      },
      editorToSubject: {
        debug: "info",
        placeholder: "Type Your Subject here...",
        theme: "snow",
        modules: {},
      },
      editorToDates: {
        debug: "info",
        placeholder: "Type Your Dates here...",
        theme: "snow",
        modules: {},
      },
      editorBody: {
        debug: "info",
        placeholder: "Type Your Request here...",
        theme: "snow",
        modules: {},
      },
    };
  },
  mounted() {
  },
  methods: {
    computeTravelToDate() {
      if (this.letterKeys.filter(a => a.name.key == '[travelFromDate]')) {
        let travelFromDate = this.letterKeys.filter(a => a.name.key == '[travelFromDate]')[0].value
        return travelFromDate
      }
    },
    addBullet(index) {
      this.letterKeys[index].value = this.splitdate(this.letterKeys[index].value)
    },
    splitdate(string) {
      if (string) {
        let date_array = string.split("\n")
        let str = "<ul>"
        for (let i = 0; i < date_array.length; i++) {
          str = str + "<li><b>" + date_array[i] + "</b></li>"
        }
        return str + "</ul>"
      }
      else {
        return ""
      }
    },

    letterUserSelected() {
      this.$nuxt.$emit("userSelected_letter", this.request.letter_fields.user_id);
    },
    splitLetterKeyHints(string) {
      let arr_keys = [];
      if (string) {
        let split_array = string.split(",");
        let str = "";
        for (let i = 0; i < split_array.length; i++) {
          arr_keys.push(split_array[i]);
        }
        return arr_keys;
      } else {
        return "";
      }
    },
    splitdate2(data) {
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (data[index].value && data[index].type == 'Quill Editor') {
          let date_array = data[index].value.split("\n")
          let str = "<ul>"
          for (let i = 0; i < date_array.length; i++) {
            str = str + "<li><b>" + date_array[i] + "</b></li>"
          }
          data[index].value = str + "</ul>"
        }
      }
      return data
    },

    async saveForm() {
      if (!this.$refs.letterRequestFormRef.validate()) return;

      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      this.newLetterProgress = true;
      this.disableSaveButton = true;
      this.request.request_type = "letters";
      this.request.letter_type = this.request.letter_type;
      this.request.letter_keys = this.splitdate2(this.request.letter_keys)

      let letter_fields = []

      for (let index = 0; index < this.request.letter_keys.length; index++) {
        const element = this.request.letter_keys[index];
        letter_fields.push({ id: element.name.key, value: element.value })
      }

      let user_id;

      if (this.letterRequest == true) {
        user_id = this.request.letter_fields.user_id;
      } else {
        user_id = this.user._id;
      }

      if (this.userType == 'SELF') user_id = this.user._id;

      let body = {
        request_type: "letters",
        letter_type: this.request.letter_type,
        letter_sub_type: this.request.letter_type != "NOC" ? "" : this.request.letter_sub_type,
        status: "Processing",
        letter_keys: letter_fields,
        letter_fields: this.request.letter_fields,
        user_id: user_id,
        created_user: this.user._id,
        company_id: this.user.company_id
      }

      let apply_letter = await this.$axios.$post("/requests/new-m", body, { headers: { Authorization: AuthStr } })
      notificationMethod.new(this.user._id, body.user_id, body.letter_type, 'New Letter Request Submitted', '/dashboards/myhr#letter')
      if (apply_letter && apply_letter) {
        this.request.letter_fields = {}
        this.$nuxt.$emit("getNotification", true);
        this.disableSaveButton = false;
        this.newLetterProgress = false;
        this.$nuxt.$emit("newLetterRequest", this.request);
        for (let index = 0; index < this.letterKeys.length; index++) {
          const element = this.letterKeys[index];
          element.value = ''
        }
        this.request.request_type = 'letters'
        let configData = this.$store.getters.getConf
        if (configData && configData[0].letterRequest && configData[0].letterRequest.length > 0) {
          this.request.letter_type = configData[0].letterRequest[0].letterDescription.requestType
          this.request.letter_sub_type = configData[0].letterRequest[0].letterDescription.requestSubType
        }
        // this.request.letter_type = 'NOC'
        // this.request.requestSubType = 'Travel'

      } else {
      }
      // this.$router.go()
    },

  },
  computed: {
    computeLevelApprover() {
      if (this.user.reporting.letters_approvals.level_1 == '') {
        this.snack = true;
        this.snackText = "Please contact your HR Department as this request is not linked with an approver.";
        this.snackColor = "red";
        return true;
      }
    },
    sortedItems() {
      return this.letterOptions.sort();
    },
    computeCompanies() {
      let companies = [];
      for (let index = 0; index < this.companyData.length; index++) {
        const element = this.companyData[index];
        companies.push(element.company_name);
      }
      return companies;
    },
    computedMinimumDate() {
      if (this.request.letter_type == 'NOC') {
        let abc = ''
        if (this.letterKeys.filter((a) => a.name.key == '[travelFromDate]')[0].name.key) {
          abc = this.letterKeys.filter((a) => a.name.key == '[travelFromDate]')[0].value
        }
        if (this.letterKeys.filter((a) => a.name.key == '[travelToDate]')[0].name.key) {
          return abc
        }
      }
    }
  },
};
</script>
<style  lang="scss">
.redTextForm {
  .v-text-field__details {
    display: block !important;

    .v-messages {
      .v-messages__wrapper {
        .v-messages__message {
          color: #f42121 !important;
        }
      }
    }
  }
}
</style>