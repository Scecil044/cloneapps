<template>
  <v-container fluid>
    <v-form id="vs_custom" ref="form" class="pb-8">
      <!-- Company Information Section -->
      <v-card elevation="0" class="mb-6 pa-0">
        <v-card-title class="px-7 d-block">
          <div class="d-flex justify-space-between align-center">
            <h4 class="mt-2">Company Information</h4>
            <nuxt-link to="/partners/all">
              <v-btn
                color="error"
                small
                fab
                title="Close form"
                rounded
                elevation="0"
              >
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </nuxt-link>
          </div>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                label="Company Name"
                v-model="form.company_name"
                outlined
                :rules="[rules.main_rule]"
                dense
                persistent-placeholder
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                label="Company Email"
                v-model="form.company_email"
                :rules="[rules.main_rule, rules.email_rule]"
                outlined
                dense
                persistent-placeholder
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                label="Company Url"
                v-model="form.company_url"
                :rules="[rules.main_rule, rules.url_rule]"
                outlined
                dense
                persistent-placeholder
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12 py-0" md="6">
              <v-combobox
                label="Headquarters"
                v-model="form.headquarters"
                :items="countries"
                persistent-placeholder
                :rules="[rules.main_rule]"
                dense
                outlined
              ></v-combobox>
            </v-col>
            <v-col cols="12 py-0" md="6">
              <v-select
                label="Method of contact"
                v-model="form.contacted_via"
                :items="contactMethods"
                outlined
                :rules="[rules.main_rule]"
                persistent-placeholder
                dense
                required
              ></v-select>
            </v-col>
          </v-row>

          <!-- POCs -->
          <div>
            <div class="d-flex align-center">
              <h4 class="px-3">Point of Contact</h4>
              <v-btn
                elevation="0"
                class="mx-2 full--rounded"
                @click.prevent="addPOC"
                fab
                dark
                small
                color="primary"
                title="Add additional POC's"
              >
                <v-icon dark> mdi-plus </v-icon>
              </v-btn>
            </div>
            <v-row>
              <!-- Primary POC -->
              <v-col cols="12" md="4">
                <v-subheader class="pa-0">Primary POC</v-subheader>
                <v-text-field
                  label="Name"
                  v-model="form.points_of_contact.primary.name"
                  outlined
                  dense
                  :rules="[rules.main_rule]"
                  persistent-placeholder
                  required
                ></v-text-field>
                <v-text-field
                  label="Email"
                  v-model="form.points_of_contact.primary.email"
                  outlined
                  dense
                  persistent-placeholder
                  :rules="[rules.main_rule, rules.email_rule]"
                  required
                ></v-text-field>
                <v-text-field
                  label="Phone"
                  v-model="form.points_of_contact.primary.phone"
                  outlined
                  persistent-placeholder
                  dense
                  :rules="[rules.main_rule]"
                  required
                ></v-text-field>
                <v-text-field
                  label="Designation"
                  v-model="form.points_of_contact.primary.designation"
                  outlined
                  persistent-placeholder
                  dense
                  :rules="[rules.main_rule]"
                  required
                ></v-text-field>
              </v-col>
              <!-- Secondary POC -->
              <v-col cols="12" md="4">
                <v-subheader class="pa-0">Secondary POC</v-subheader>
                <v-text-field
                  label="Name"
                  dense

                  v-model="form.points_of_contact.secondary.name"
                  outlined
                  persistent-placeholder
                ></v-text-field>
                <v-text-field
                  label="Email"
                  dense

                  v-model="form.points_of_contact.secondary.email"
                  outlined
                  persistent-placeholder
                ></v-text-field>
                <v-text-field
                  label="Phone"
                  dense
                  v-model="form.points_of_contact.secondary.phone"
                  outlined
                  persistent-placeholder
                ></v-text-field>
                <v-text-field
                  label="Designation"
                  dense
                  v-model="form.points_of_contact.secondary.designation"
                  outlined
                  persistent-placeholder
                ></v-text-field>
              </v-col>

              <!-- Additional POCs -->
              <v-col
                cols="12"
                md="4"
                v-if="form.points_of_contact.additional_pocs.length === 0"
              >
                <v-subheader class="pa-0">Additional POC</v-subheader>
                <v-skeleton-loader
                  height="42px"
                  type="image"
                  class="mb-5"
                  boilerplate
                ></v-skeleton-loader>
                <v-skeleton-loader
                  height="42px"
                  type="image"
                  class="mb-5"
                  boilerplate
                ></v-skeleton-loader>
                <v-skeleton-loader
                  height="42px"
                  type="image"
                  boilerplate
                ></v-skeleton-loader>
              </v-col>

              <!-- looping through the additional pocs -->
              <v-col
                cols="12"
                md="4"
                v-for="(poc, index) in form.points_of_contact.additional_pocs"
                :key="index"
              >
                <div class="d-flex align-center">
                  <v-subheader class="pa-0"
                    >Additional POC ({{ index + 1 }})</v-subheader
                  >
                  <v-btn
                    color="error full--rounded"
                    class="ma-2 white--text"
                    elevation="0"
                    small
                    @click="removePOC(index)"
                  >
                    Remove
                    <v-icon right dark> mdi-close</v-icon>
                  </v-btn>
                </div>
                <v-text-field
                  label="Name"
                  v-model="poc.name"
                  dense
                  outlined
                  :rules="[rules.main_rule]"
                  persistent-placeholder
                  required
                ></v-text-field>
                <v-text-field
                  label="Email"
                  v-model="poc.email"
                  outlined
                  dense
                  :rules="[rules.main_rule, rules.email_rule]"
                  persistent-placeholder
                  required
                ></v-text-field>
                <v-text-field
                  label="Phone"
                  v-model="poc.phone"
                  outlined
                  dense
                  :rules="[rules.main_rule]"
                  persistent-placeholder
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Partnership Stages Section -->
      <v-card elevation="0" class="mb-6 pa-0">
        <v-card-title class="px-7">Partnership Stages</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                label="Partnership Stage"
                v-model="form.partnership_stage"
                :rules="[rules.main_rule]"
                :items="partnership_stages_options"
                outlined
                dense
                persistent-placeholder
                required
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              v-if="form.partnership_stage === partnership_stages_options[4]"
            >
              <v-textarea
                label="Reason for unsuccessful partnership"
                v-model="form.reason_for_unsuccessful"
                :rules="[rules.main_rule]"
                outlined
                required
                dense
                persistent-placeholder
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Service Outlines Section -->
      <v-card elevation="0" class="mb-6 pa-4">
        <v-card-title class="px-7">Service Outlines</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-combobox
                label="PEO Services"
                v-model="form.peo_services_countries"
                :items="countries"
                :rules="[rules.main_rule]"
                multiple
                persistent-placeholder
                dense
                outlined
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="4">
              <v-combobox
                label="EOR Services"
                v-model="form.eor_services_countries"
                :items="countries"
                multiple
                persistent-placeholder
                :rules="[rules.main_rule]"
                dense
                outlined
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="4">
              <v-combobox
                label="EOR Services for Expats"
                v-model="form.eor_services_for_expats"
                :items="countries"
                multiple
                persistent-placeholder
                dense
                :rules="[rules.main_rule]"
                outlined
              ></v-combobox>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Entity Details Section -->
      <v-card elevation="0" class="mb-6 pa-4">
        <v-card-title class="px-7">Entity Details</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-combobox
                label="Own Entity Countries"
                v-model="form.own_entity_countries"
                :items="countries"
                :rules="[rules.main_rule]"
                multiple
                persistent-placeholder
                dense
                outlined
              ></v-combobox>
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox
                label="Global EOR Provider Countries"
                v-model="form.global_eor_provider_countries"
                :items="countries"
                multiple
                persistent-placeholder
                :rules="[rules.main_rule]"
                dense
                outlined
              ></v-combobox>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Pricing Section -->
      <v-card elevation="0" class="mb-6 pa-4">
        <v-card-title class="px-7">Pricing</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Service Fees"
                v-model="form.pricing_details.service_fees"
                :rules="[rules.main_rule]"
                persistent-placeholder
                dense
                autocomplete
                outlined
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Contract length"
                v-model="form.pricing_details.contract_length"
                :items="['1 year', '2 years', 'Unlimited']"
                :rules="[rules.main_rule]"
                persistent-placeholder
                dense
                outlined
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Additional Features Section -->
      <v-card elevation="0" class="mb-6 pa-4">
        <v-card-title class="px-7">
          Additional Features / Information
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-textarea
                label="Notes/Comments"
                v-model="form.remarks"
                outlined
                persistent-placeholder
                dense
              ></v-textarea>

              <!-- File upload section -->
              <v-file-input
                label="Upload Documents"
                multiple
                outlined
                dense
                v-model="newFiles"
                persistent-placeholder
                @change="handleFileUpload"
              ></v-file-input>

              <!-- Display uploaded files -->
              <v-list two-line>
                <v-list-item
                  v-for="(file, index) in form.attachments"
                  :key="index"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ file?.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatFileSize(file.size)
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click="removeFile(index)">
                      <v-icon color="error">mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- follow up date -->
            <v-col cols="12">
              <v-dialog
                ref="dialog"
                v-model="date_modal"
                :return-value.sync="form.follow_up_date"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="form.follow_up_date"
                    label="Follow up Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    persistent-placeholder
                    outlined
                    dense
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="form.follow_up_date" scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="date_modal = false">
                    Cancel
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.dialog.save(form.follow_up_date)"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <div class="d-flex justify-end">
        <v-btn
          :loading="isSubmitting"
          @click.prevent="savePartner"
          elevation="0"
          color="primary"
          rounded
        >
          save
          <v-icon>mdi-content-save-check-outline</v-icon>
        </v-btn>
      </div>
    </v-form>

    <!-- snackbar -->
    <v-snackbar
      v-model="snackOptions.show"
      :timeout="3000"
      top
      :color="snackOptions.color"
    >
      {{ snackOptions.text }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { countries } from 'countries-list'

export default {
  data() {
    return {
      authStr: 'Bearer '.concat(this.$store.state.token),
      rules: {
        main_rule: (v) => {
          if (Array.isArray(v)) {
            return v.length > 0 || 'This field is required'
          }
          return !!v || 'This field is required'
        },
        // email_rule: (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        email_rule: (v) =>
          v === v?.trim().toLowerCase() &&
          /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v) ||
          'E-mail must be valid, lowercase, and have no spaces',

       url_rule: (v) =>
        /^(https?:\/\/)(www\.)?[a-zA-Z0-9\-._~%]+(\.[a-zA-Z]{2,})(:[0-9]{1,5})?(\/[^\s]*)?$/.test(v) || 
        'URL must start with http://www or https://www and be valid'
      },
      form: {
        company_name: '',
        company_url: '',
        company_email: '',
        contacted_via: '',
        attachments: [],
        headquarters: '',
        partnership_stage: 'Discussion In Process', // Default value
        peo_services_countries: [],
        eor_services_countries: [],
        eor_services_for_expats: [],
        own_entity_countries: [],
        global_eor_provider_countries: [],
        points_of_contact: {
          primary: {
            name: '',
            email: '',
            phone: '',
            designation: ''
          },
          secondary: {
            name: '',
            email: '',
            phone: '',
            designation: ''
          },
          additional_pocs: [], // This will hold the additional POCs
        },
        pricing_details: {
          service_fees: '',
          contract_length: '',
        },
        remarks: '',
        follow_up_date: '',
        reason_for_unsuccessful: '',
      },
      date_modal: false,
      countries: ['USA', 'UK', 'France', 'Germany', 'Japan'],
      contactMethods: ['Email', 'Website', 'LinkedIn'],
      isSubmitting: false,
      partnership_stages_options: [
        'Contacted',
        'Discussion In Process',
        'Signed Partnership',
        'Successful Partnership',
        'Unsuccessful Partnership',
      ],
      newFiles: [],
      snackOptions: {
        color: '',
        text: '',
        show: false,
      },
    }
  },
  mounted() {
    this.setCountries()
  },
  methods: {
    setCountries() {
      const countryCodes = Object.keys(countries)
      // "form\.([a-z_.]*phone)
      this.countries = countryCodes.map((code) => countries[code].name)
    },
    addPOC() {
      this.form.points_of_contact.additional_pocs.push({
        name: '',
        email: '',
        phone: '',
      })
    },
    removePOC(index) {
      this.form.points_of_contact.additional_pocs.splice(index, 1)
    },

    async savePartner() {
      // this.$refs.form
      // console.log('form is valid: ', this.$refs.form.validate())
      // console.log('form is valid: ', JSON.parse(JSON.stringify(this.form)))

      if (!this.$refs.form.validate())
        return this.showRawData('red', 'Kindly fill the required data')
      this.isSubmitting = true

      let docs_links = []
      try {
        docs_links = await this.uploadFilesToServer(this.form.attachments)

        const _form = this.form
        //override form attachments with actual document links
        _form.attachments = docs_links
        // console.log('form after is', this.showRawData(this.form))

        //create partner in server
        await this.$axios.$post(`/partners`, _form, {
          headers: { Authorization: this.authStr },
        })
        this.$router.push('/partners/all')
      } catch (e) {
        console.error(e)
        // show snack bar and return
        this.showSnackbar('red', 'Error submitting form, try again')
      }

      this.isSubmitting = false
    },

    handleFileUpload() {
      // console.log('new files', this.showRawData(this.newFiles))
      // Add new files to the attachments array
      this.form.attachments.push(...this.newFiles)
      this.newFiles = [] // Clear new file input after adding
    },
    removeFile(index) {
      // Remove the file at the specified index
      this.form.attachments.splice(index, 1)
    },
    formatFileSize(size) {
      // Format file size in KB/MB
      const i = size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0
      return (
        (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB'][i]
      )
    },
    async uploadFilesToServer(files) {
      let response = []
      for (const [index, file] of files.entries()) {
        const fd = new FormData()
        fd.append('attachments', file)

        try {
          const doc = await this.$axios.$post(`/documents/mimetype/upload`, fd, {
            headers: { Authorization: 'kdsks' },
          })

          response[index] = doc
        } catch (e) {
          throw new Error(e)
        }
      }
      return response
    },

    // to delete this function
    showRawData(dat) {
      return JSON.parse(JSON.stringify(dat))
    },

    showSnackbar(color, text) {
      this.snackOptions.color = color
      this.snackOptions.text = text
      this.snackOptions.show = true
    },
  },
  watch: {
    'form.partnership_stage': function (newVal) {
      if (newVal === 'Unsuccessful Partnership')
        this.form.reason_for_unsuccessful = ''
    },
  },
}
</script>
