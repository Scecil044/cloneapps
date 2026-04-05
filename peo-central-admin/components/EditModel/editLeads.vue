<template>
  <div>
    <v-card
      id="card"
      text
      elevation="0"
      :style="[
        { marginBottom: '1rem !important' },
        isPage
          ? { minHeight: '80vh', maxHeight: '92vh', overflowY: 'scroll' }
          : { maxHeight: '550px' },
      ]"
    >
      <!-- <v-container
        fluid
        :class="[isPage ? 'tw-h-full' : 'scroll']"
        :style="[isPage ? {} : { maxHeight: '550px' }]"
      > -->
      <v-card-title
        v-if="actionsPosition == 'top' && !hideHeader"
        id="card-title"
        class="mb-4"
      >
        <h4 class="text--text">
          {{ isNewLead ? 'Create New Lead' : 'Edit Lead' }}
        </h4>
        <div class="flex_row justify-lg-space-between">
          <v-btn
            class="tall__btn mr-2"
            color="lightgray"
            :disabled="loading"
            outlined
            @click="handleModel"
            >Cancel</v-btn
          >
          <v-btn
            class="tall__btn"
            color="primary"
            :loading="loading"
            :disabled="loading"
            @click="handleLeadAction()"
            >{{ isNewLead ? 'Save' : 'Update' }}</v-btn
          >
        </div>
      </v-card-title>
      <v-card-title v-if="hideHeader" class="tw-flex tw-justify-end">
        <v-btn
          class="tall__btn"
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click="handleLeadAction()"
          >Save Lead</v-btn
        >
      </v-card-title>
      <v-form ref="edit_lead" @submit.prevent="handleLeadAction">
        <v-row class="not_recurring_row_3 py-0 mb-5" style="gap: 20px">
          <v-row class="py-0 px-0">
              <v-col
                cols="12"
                md="4"
                class="px-0 py-0"
                style="height: fit-content"
              >
                <v-row>
                  <v-col cols="12" class="py-0 pl-0 py-2">
                    <CustomInputContainer
                      label="Lead Owner"
                      :mandatory="true"
                    >
                      <div slot="input">
                        <v-select
                          :items="computedPROList"
                          v-model="lead.user_id"
                          placeholder="Select Lead"
                          item-text="full_name"
                          :loading="loading_pro"
                          item-value="_id"
                          outlined
                          dense
                          :rules="main_rule"
                          append-icon="fa-chevron-down"
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="px-0 py-0"
                style="height: fit-content"
              >
                <v-row>
                  <v-col cols="12" class="py-0 pl-0 py-2">
                    <CustomInputContainer label="Client Type" :mandatory="true">
                      <div slot="input">
                        <v-select
                          :items="clientType"
                          v-model="lead.client_type"
                          placeholder="Select client type"
                          outlined
                          dense
                          :rules="main_rule"
                          v-if="clientType.length >= 1"
                          append-icon="fa-chevron-down"
                        ></v-select>
                        <p v-else class="error--text mb-5 mt-5">
                          Please Select Client Type
                        </p>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="px-0 py-0"
                style="height: fit-content"
              >
                <v-row>
                  <v-col cols="12" class="py-0 pl-0 py-2">
                    <CustomInputContainer
                      label="Service Type"
                      :mandatory="true"
                    >
                      <div slot="input">
                        <v-select
                          :items="serviceType"
                          v-model="lead.service_type"
                          placeholder="Select service"
                          outlined
                          dense
                          :rules="main_rule"
                          append-icon="fa-chevron-down"
                        ></v-select>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
        </v-row>
        <!-- contact person details -->
        <v-row class="mb-5">
          <v-col cols="12" class="py-0 px-0">
            <span class="span_leadHeading">CONTACT INFORMATION</span>
          </v-col>
          <v-col cols="12" class="py-0 px-0">
            <v-row class="">
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Full Name" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPerson.name"
                      placeholder="e.g Jane Doe"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Email" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPerson.email"
                      placeholder="e.g Jane Doe"
                      outlined
                      dense
                      :rules="emailRules"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Designation" :mandatory="false">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPerson.designation"
                      placeholder="e.g HR Manager"
                      outlined
                      dense
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- Decision Maker Involvement - Only show for new leads (not in edit mode) -->
              <v-col v-if="!isEditMode" cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Decision Maker Involvement" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="decision_maker_involvement_options"
                      v-model="lead.decision_maker_involvement"
                      placeholder="Select Decision Maker Involvement"
                      outlined
                      dense
                      :rules="main_rule"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer
                  label="Select Department"
                  :mandatory="false"
                >
                  <div slot="input">
                    <v-select
                      :items="contact_persons_departments"
                      v-model="contactPerson.department"
                      placeholder="e.g HR"
                      outlined
                      dense
                      append-icon="fa-chevron-down"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col> -->
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Phone Number" :mandatory="true">
                  <div slot="input">
                    <v-input>
                      <template v-slot:prepend>
                        <v-autocomplete
                          v-if="countryCode.length > 0"
                          color="black"
                          auto-select-first
                          class="autoCompleteCustomClass"
                          :items="countryCode"
                          :item-text="(item) => item.dialCode + ' ' + item.country"
                          return-object
                          style="max-width: 150px"
                          dense
                          outlined
                          placeholder="Country Code"
                          v-model="contactPhoneNumberText"
                          @change="updatePhone('contact_phone', $event)"
                        >
                          <template #selection="slotProps">{{
                            slotProps.item.dialCode
                          }}</template>
                          <template #item="slotProps">
                            <v-avatar left class="mr-3"
                              ><svg v-html="slotProps.item.flag"></svg
                            ></v-avatar>
                            {{ slotProps.item.dialCode }}
                            {{ slotProps.item.country }}
                          </template>
                        </v-autocomplete>
                      </template>
                      <v-text-field
                        v-model="contact_phone.number"
                        placeholder="Phone"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <!--Company Details-->
        <v-row class="mb-5">
          <v-col cols="12" class="py-0 px-0">
            <span class="span_leadHeading">COMPANY DETAILS</span>
          </v-col>
          <v-col cols="12" class="py-0 px-0">
            <v-row class="">
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer
                  label="Company Name"
                  :mandatory="true"
                  v-if="lead.client_type == 'existing client'"
                >
                  <div slot="input">
                    <v-select
                      :items="employers"
                      v-model="lead.company_id"
                      item-text="company_name"
                      item-value="_id"
                      placeholder="Select Company"
                      outlined
                      dense
                      :rules="main_rule"
                      v-if="employers.length >= 1"
                      append-icon="fa-chevron-down"
                      @change="getCompanyDetails(lead.company_id)"
                    ></v-select>
                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Company
                    </p>
                  </div>
                </CustomInputContainer>
                <CustomInputContainer
                  label="Company Name"
                  :mandatory="true"
                  v-else
                >
                  <div slot="input">
                    <v-text-field
                      v-model="companyDetails.company_name"
                      placeholder="Company Name"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Phone Number">
                  <div slot="input">
                    <v-input>
                      <template v-slot:prepend>
                        <v-autocomplete
                          v-if="countryCode.length > 0"
                          color="black"
                          auto-select-first
                          class="autoCompleteCustomClass"
                          :items="countryCode"
                          :item-text="(item) => item.dialCode + ' ' + item.country"
                          return-object
                          style="max-width: 150px"
                          dense
                          outlined
                          placeholder="Country Code"
                          v-model="companyPhoneNumberText"
                          @change="updatePhone('company_phone', $event)"
                        >
                          <template #selection="slotProps">{{
                            slotProps.item.dialCode
                          }}</template>
                          <template #item="slotProps">
                            <v-avatar left class="mr-3"
                              ><svg v-html="slotProps.item.flag"></svg
                            ></v-avatar>
                            {{ slotProps.item.dialCode }}
                            {{ slotProps.item.country }}
                          </template>
                        </v-autocomplete>
                      </template>
                      <v-text-field
                        v-model="company_phone.number"
                        placeholder="Phone"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Email Address" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="companyDetails.company_email"
                      placeholder="Enter company mail"
                      outlined
                      dense
                      :rules="emailRules"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Company Website" :mandatory="false">
                  <div slot="input">
                    <v-text-field
                      v-model="companyDetails.website"
                      placeholder="https://www.*"
                      outlined
                      dense
                      :rules="url_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Company Address" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="companyDetails.company_address"
                      placeholder="e.g Belina Road"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col> -->
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer
                  label="Business Industry"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-select
                      :items="industries"
                      v-model="companyDetails.business_industry"
                      outlined
                      :loading="industry_loading"
                      dense
                      :rules="main_rule"
                      append-icon="fa-chevron-down"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
               <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer
                  label="Country"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-select
                      :items="countriesList"
                      dense
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                      item-text="name"
                      item-value="name"
                      v-model="companyDetails.country"
                      outlined
                      placeholder="Select Country"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <!--Lead Details-->
        <v-row class="mb-5">
          <v-col cols="12" class="py-0 px-0">
            <span class="span_leadHeading">LEAD DETAILS</span>
          </v-col>
          <v-col cols="12" class="py-0 px-0">
            <v-row class="">
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Inquiry Type" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="inquiry_types"
                      v-model="lead.lead_details.inquiry_type"
                      outlined
                      dense
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Lead Rating" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="lead_ratings"
                      v-model="lead.lead_details.lead_rating"
                      outlined
                      dense
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Actions" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="lead_actions"
                      v-model="lead.lead_details.lead_action"
                      outlined
                      dense
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Status" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="processes"
                      v-model="lead.lead_details.status"
                      outlined
                      :loading="loading_processes"
                      item-text="stage_name"
                      item-value="stage_name"
                      dense
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                    ></v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Overall Total Order Value" :mandatory="false">
                  <div slot="input">
                    <v-text-field
                      placeholder=""
                      v-model="lead.lead_details.overall_total_order_value"
                      outlined
                      dense
                      type="number"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Employee Count" :mandatory="false">
                  <div slot="input">
                    <v-select
                      :items="employee_count_options"
                      dense
                      append-icon="fa-chevron-down"
                      v-model="lead.lead_details.deal_size"
                      outlined
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="EOR Requirements" :mandatory="false">
                  <div slot="input">
                    <v-select
                      :items="eor_requirements"
                      dense
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                      v-model="lead.lead_details.eor_requirements"
                      outlined
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- LEAD SCORE SECTION - Only show when editing existing leads -->
        <v-row v-if="isEditMode" class="not_recurring_row_3 py-0 mb-5" style="gap: 20px">
          <v-form lazy-validation class="row">
            <v-row class="py-0 px-0">
              <v-col cols="12" class="py-0 pl-0 py-2">
                <h5 class="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-4">Lead Score</h5>
              </v-col>
              <!-- Timeline to Hire - Only show when editing existing leads -->
              <v-col v-if="isEditMode" cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Timeline to Hire" :mandatory="false">
                  <div slot="input">
                    <v-select
                      :items="timeline_to_hire_options"
                      v-model="lead.timeline_to_hire"
                      placeholder="Select Timeline"
                      outlined
                      dense
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- Engagement Level - Only show when editing existing leads -->
              <v-col v-if="isEditMode" cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Engagement Level" :mandatory="false">
                  <div slot="input">
                    <v-select
                      :items="engagement_level_options"
                      v-model="lead.engagement_level"
                      placeholder="Select Engagement Level"
                      outlined
                      dense
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- Decision Maker Involvement - Only show when editing existing leads -->
              <v-col v-if="isEditMode" cols="12" md="4" lg="4" class="pl-0 py-2">
                <CustomInputContainer label="Decision Maker Involvement" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="decision_maker_involvement_options"
                      v-model="lead.decision_maker_involvement"
                      placeholder="Select Decision Maker Involvement"
                      outlined
                      dense
                      :rules="main_rule"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-form>
        </v-row>

        <div
          v-if="actionsPosition != 'top'"
          class="flex_row justify-lg-space-between"
        >
          <v-btn
            class="tall__btn mr-2"
            color="lightgray"
            :disabled="loading"
            outlined
            @click="handleModel"
            >Cancel</v-btn
          >
          <v-btn
            class="tall__btn"
            color="primary"
            :loading="loading"
            :disabled="loading"
            @click="handleLeadAction()"
            >{{ isNewLead ? 'Save' : 'Update' }}</v-btn
          >
        </div>
      </v-form>
      <!-- </v-container> -->
    </v-card>
    <SnackBar :data="snackbar_data" />
  </div>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import countries from 'countries-list'
import countryFlagsDialCode from 'country-flags-dial-code'
import VueCountryCode from 'vue-country-code'

export default {
  components: {
    CustomInputContainer,
    SnackBar,
    VueCountryCode,
  },
  props: {
    selectedLeads: Array,
    handleModel: Function,
    inquiry: Object,
    hideHeader: {
      type: Boolean,
      default: false,
    },
    isPage: {
      type: Boolean,
      default: false,
    },
    actionsPosition: {
      default: 'top',
      type: String,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      main_rule: [(v) => !!v || 'This field is required'],
      phone_rule: [(v) => !!v || 'Phone number is required'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        (v) => !v || v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      optionalEmailRule: [
        (v) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      url_rule: [
        (v) =>
          !v ||
          /^(https?:\/\/)([\w.-]+)+(:\d+)?(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i.test(
            v
          ) ||
          'Please enter a valid URL',
      ],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      clientType: ['New Client', 'Existing Client'],
      serviceType: [
        'Mission Visa',
        'COP 29 Visa',
        'PRO Services',
        'Payroll Outsourcing',
        'HR Consulting & Advisory',
        'Job Applicant',
        'HR Outsourcing',
        'Staffing/Recruitment Service',
        'HR Technology',
        'EOR/PEO Service',
      ],
      employees: [],
      employers: [],
      contactPerson: {
        name: '',
        phone: {
          code: '',
          number: '',
          name: '',
        },
        email: '',
        designation: '',
        department: '',
      },
      companyDetails: {
        business_industry: '',
        company_name: '',
        company_email: '',
        company_phone: {
          code: '',
          number: '',
          name: '',
        },
        country: '',
        website: '',
        legal_name: '',
        registration_number: '',
        trn_number: '',
        // company_address: '',
        contact_persons: {},
      },
      date_menu: false,
      exp_date_menu: false,
      limit: '10',
      page: 0,
      lead: {
        user_id: '',
        client_type: 'New Client',
        service_type: '',
        company_id: '',
        contact_person: {},
        timeline_to_hire: '',
        engagement_level: '',
        decision_maker_involvement: '',
        lead_details: {
          inquiry_type: '',
          lead_rating: 'Qualified',
          lead_action: '',
          status: 'Lead Received',
          overall_total_order_value: 0,
          deal_size: '',
          eor_requirements: '',
          requirements: '',
        },
      },
      inquiry_date: '',
      loading: false,
      loading_pro: false,
      eor_requirements: ['UAE EOR', 'GCC EOR', 'Mission Visa UAE', 'Various'],
      lead_actions: ['Follow Up', 'Need to Action', 'None'],
      countryCode: [],
      employee_count_options: ['1 - 10', '11 - 50', '51 - 200', '200+'],
      lead_ratings: ['Qualified', 'Not Qualified '],
      lead_statuses: [
        'Lead Received',
        'Contact Client',
        'Proposal Sent',
        'In Discussion',
        'Onboard Client',
        'Verify Client',
        'Service Agreement',
        'Cancelled',
        'On Hold',
        'Unsuccessful',
      ],
      no_of_employees_options: [
        '1-10',
        '10-50',
        '50-100',
        '100-200',
        'over 200',
      ],
      contact_persons_departments: [
        'HR Point of Contact',
        'Escalation Point of Contact',
        'Financial Point of Contact',
      ],
      inquiry_types: [
        'Referral',
        'Website',
        'Walk In',
        'BD',
        'Tender',
        'Other',
      ],
      pro_list: [],
      countryCode: [],
      countryList: countryFlagsDialCode.getCountryListMap(),
      countriesList: [],
      contactPhoneNumberText: '',
      companyPhoneNumberText: '',
      company_phone: {
         name: '',
        code: '',
        number: ''
      },
      contact_phone: {
        name: '',
        code: '',
        number: ''
      },
      industry_loading: false,
      industries: [],
      snackbar_data: {
        snackbar: false,
        text: '',
        color: 'success',
        icon: 'spinner fa-spin',
        timeout: 1000,
      },
      loading_processes: false,
      processes: [],
      selected_process: null,
      timeline_to_hire_options: ['0-1 month', '1-3 months', '3-6 months', '6-12 months', '12+ months'],
      engagement_level_options: ['Higly Engaged', 'Low', 'Occasional'],
      decision_maker_involvement_options: ['Direct Contact With Decision Maker', 'Indirect or Unsure'],
    }
  },
  watch: {
    selectedLeads: {
      handler(val) {
        if (val && val.length) {
          console.log('updated')
          this.initLead()
        }
      },
      immediate: true,
    },
    inquiry: {
      handler(val) {
        if (val) {
          this.initLead()
        }
      },
      immediate: true,
    },
  },
  computed: {
    isNewLead() {
      // If isEditMode is explicitly set to true, we're editing
      if (this.inquiry && Object.keys(this.inquiry).length) {
        return true
      }
      if (this.isEditMode) {
        return false
      }
      // Otherwise, check if we have selectedLeads (existing lead data)
      return !this.selectedLeads || this.selectedLeads.length === 0
    },
    computedPROList() {
      return this.pro_list.map((el) => {
        return {
          full_name: `${el.first_name} ${el.last_name}`,
          email: el.email,
          _id: el._id,
        }
      })
    },
  },
  mounted() {
    this.getEmployeesList()
    this.getEmployersList()
    this.getCompanyDetails(this.lead.company_id)
    this.fetchPROs()
    this.initLead()
    this.fetchIndustries()
    this.fetchProcesses()
  },
  methods: {
     async fetchProcesses() {
      try {
        this.loading_processes = true
        const response = await this.$axios.get('/processes/module/leads')
        this.processes = response?.data?.stages || []
        if (this.processes.length) {
          this.selected_process = this.processes.find((el) => {
            return el.stage_name == this.lead?.lead_details.status
          })
          // remove the previous processes to prevent move back
          const current_process_index = this.processes.findIndex(el => el.stage_name == this.lead?.lead_details.status)
          if (current_process_index > -1) {
            this.processes = this.processes.slice(current_process_index)
          }
        }

      } catch (error) {
        console.log('Error fetching process: ', error?.message)
      }
      finally {
        this.loading_processes = false
      }
    },
    initLead() {
      this.initializeCountryCodes()
      if (this.selectedLeads && this.selectedLeads.length) {
        this.lead = {
          ...this.selectedLeads[0],
        }

        // Set company phone from the API response - it comes at root level as company_phone
        this.company_phone = this.setPhoneNumber(
          this.selectedLeads[0]?.company_phone
        );

        // Initialize companyDetails for the form from the API response data
        this.companyDetails = {
          ...this.companyDetails,
          company_name: this.selectedLeads[0]?.company_name || '',
          company_email: this.selectedLeads[0]?.company_email || '',
          business_industry: this.selectedLeads[0]?.business_industry || '',
          website: this.selectedLeads[0]?.company_website || '',
          country: this.selectedLeads[0]?.country || '',
        };

        // Ensure lead_details are properly mapped from API response
        if (this.selectedLeads[0]?.lead_details) {
          this.lead.lead_details = {
            ...this.lead.lead_details,
            inquiry_type: this.selectedLeads[0]?.lead_details?.inquiry_type || '',
            lead_rating: this.selectedLeads[0]?.lead_details?.lead_rating || 'Qualified',
            lead_action: this.selectedLeads[0]?.lead_details?.lead_action || '',
            status: this.selectedLeads[0]?.lead_details?.status || 'Lead Received',
            overall_total_order_value: this.selectedLeads[0]?.lead_details?.overall_total_order_value || 0,
            deal_size: this.selectedLeads[0]?.lead_details?.deal_size || '',
            eor_requirements: this.selectedLeads[0]?.lead_details?.eor_requirements || '',
            requirements: this.selectedLeads[0]?.lead_details?.requirements || '',
          }
        }

        // Ensure contact person details are properly mapped
        if (this.selectedLeads[0]?.contact_person) {
          this.contactPerson = {
            ...this.selectedLeads[0]?.contact_person,
          }
          this.contact_phone = this.setPhoneNumber(this.selectedLeads[0]?.contact_person?.phone)
        }
      }

      // Initialize inquiry date
      if (this.lead?.inquiry_date) {
        this.inquiry_date = new Date(this.lead.inquiry_date).toISOString().split('T')[0]
      } else {
        this.inquiry_date = new Date().toISOString().split('T')[0]
      }

      if (this.inquiry && Object.keys(this.inquiry).length) {
        this.companyDetails = {
          ...this.companyDetails,
          company_email: this.inquiry?.email,
          company_name: this.inquiry?.company_name,
          company_phone: '',
          country: this.inquiry?.country,
        }

        this.company_phone = this.setPhoneNumber(this.inquiry?.phone)

        this.contactPerson = {
          name: this.inquiry?.name,
          email: this.inquiry?.email,
          phone: '',
          department: '',
          designation: '',
        }

        this.contact_phone = this.setPhoneNumber(this.inquiry?.phone)

        this.lead = {
          ...this.lead,
          user_id: '',
          client_type: 'New Client',
          service_type: this.inquiry?.type,
          company_id: '',
          timeline_to_hire: '',
          engagement_level: '',
          decision_maker_involvement: '',
          lead_details: {
            inquiry_type: '',
            lead_rating: 'Qualified',
            lead_action: '',
            status: 'Lead Received',
            source: this.inquiry?.source,
            overall_total_order_value: 0,
            deal_size: '',
            eor_requirements: '',
            requirements: this?.inquiry.message,
          },
        }
      }
    },
     async movePipelineForward(leadResponse) {
      try {
        if (!this.processes.map(el => el.stage_name).includes(leadResponse?.lead_details?.status)) return
        if (this.selected_process?.stage_name == leadResponse?.lead_details?.status) return
        await this.$axios.post('/generic/process/flow/move/forward/stage', {
          id: leadResponse?._id,
          "module": "leads",
          "stage_name": leadResponse?.lead_details?.status
        })

      } catch (error) {
        console.log('Failed to move Pipeline Forward: ', error?.message)
      }
    },
    closeLead() {
      this.$router.push('/leads')
    },
    close() {
      this.$emit('close')
    },
    async fetchIndustries() {
      try {
        this.industry_loading = false
        const response = await this.$axios.get('/industries?limit=1000')
        const industries = response.data?.results || []
        console.log('results: ', response)
        this.industries = industries.map((el) => el.industry_name)
      } catch (error) {
        console.log('Error could not fetch Industries:  ', error?.message)
      } finally {
        this.industry_loading = false
      }
    },
            initializeCountryCodes() {
      // Use the same approach as onboarding form
      for (var [key, value] of Object.entries(this.countryList)) {
        this.countryCode.push(value)
      }

      // Create a separate list for country selection (not phone codes)
      this.countriesList = Object.keys(countries.countries).map((code) => ({
        name: countries.countries[code].name,
        code: code,
        emoji: countries.countries[code].emoji || ''
      })).sort((a, b) => a.name.localeCompare(b.name))

      // Set default UAE country code (971) for phone fields
      const defaultCode = this.countryCode.find(c => c.dialCode === '971') || this.countryCode[0]
      if (defaultCode) {
        if (!this.contact_phone.code) {
          this.contact_phone.code = defaultCode.dialCode
          this.contact_phone.name = defaultCode.country
          this.contactPhoneNumberText = defaultCode
        }
        if (!this.company_phone.code) {
          this.company_phone.code = defaultCode.dialCode
          this.company_phone.name = defaultCode.country
          this.companyPhoneNumberText = defaultCode
        }
      }
    },
    setPhoneNumber(phone) {
      const [code, number, name] = this.extractCountryCode(phone || '')
      console.log(code, number, name)
      return {
        code,
        number,
        name,
      }
    },
    extractCountryCode(phoneNumber) {
      // Normalize phone number to ensure it starts with '+'
      if (!phoneNumber.startsWith('+')) {
        return [null, phoneNumber, null]
      }

      // Sort country codes by length descending to match the longest one first
      const sortedCodes = [...this.countryCode].sort((a, b) => b.code.length - a.code.length);

      for (const { code, iso2 } of sortedCodes) {
        if (phoneNumber.startsWith(`+${code}`)) {
          const numberWithoutCode = phoneNumber.slice(code.length + 1) // +1 to account for the '+' symbol
          return [code, numberWithoutCode, iso2]
        }
      }

      return [null, phoneNumber, null]
    },
    onSelectCountryCode({ name, iso2, dialCode }, select_key) {
      // console.log(name, iso2, dialCode)
      if (select_key === 'contact_phone') {
        this.contact_phone.code = `+${dialCode}`
        this.contact_phone.name = iso2
      } else if (select_key === 'company_phone') {
        this.company_phone.code = `+${dialCode}`
        this.company_phone.name = iso2
      }
    },
    updatePhone(field, item) {
      if (field === 'contact_phone') {
        this.contact_phone.code = item.dialCode
        this.contact_phone.name = item.country
        this.contactPhoneNumberText = item
      } else if (field === 'company_phone') {
        this.company_phone.code = item.dialCode
        this.company_phone.name = item.country
        this.companyPhoneNumberText = item
      }
    },

    showNotificationStatus(message, status) {
      this.snackbar_data = {
        snackbar: true,
        text: message,
        color: status ? 'success' : 'error',
        icon: 'spinner fa-spin',
        timeout: 3000,
      }
    },
    async fetchPROs() {
      try {
        this.loading_pro = true
        const response = await this.$axios.post('/users/pro', {
          module: 'leads'
        })
        console.log('PRO response -: ', response.data)
        this.pro_list = response.data || []
      } catch (error) {
        console.log('Error when fetching inquiries: ', error.message)
        this.showNotificationStatus(
          `Error when fetching inquiries: ${error.message}`,
          false
        )
      } finally {
        this.loading_pro = false
      }
    },
    async getIndustries() {
      return []
    },
    formatPhone(phone) {
      const full = `${phone?.code ?? ''}${phone?.number ?? ''}`
      return full.startsWith('+') ? full : `+${full}`
    },
    async getEmployeesList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/users/admin/users`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.employees = response
        })
    },
    async getEmployersList() {
      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/companies/list/dropdown?page=${this.page}&limit=${10000}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.employers = response
        })
    },
    async getCompanyDetails(company_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/companies/comp/${company_id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.companyDetails = {
            ...response,
            company_phone: this.setPhoneNumber(response?.company_phone),
          }
        })
    },
    async createNewLeads() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        if (this.$refs.edit_lead.validate()) {
          this.loading = true

          // this.companyDetails.company_phone = `${this.companyDetails.company_phone?.code}${this.companyDetails.company_phone?.number}`
          // this.contactPerson.phone = `${this.contactPerson.phone?.code}${this.contactPerson.phone?.number}`

          this.companyDetails.company_phone = this.formatPhone(
            this.company_phone
          )
          this.contactPerson.phone = this.formatPhone(this.contact_phone)

          const lead_url = this.inquiry?._id ? `/leads?inquiryId=${this.inquiry?._id}`: '/leads'
          const response = await this.$axios.$post(
            lead_url,
            {
              lead: {
                ...this.lead,
                inquiry_date: this.inquiry_date
              },
              companyDetails: this.companyDetails,
              contactPerson: this.contactPerson,
            },
            {
              headers: { Authorization: AuthStr },
            }
          )
          this.handleModel()

          console.log('lead response', response)

          await this.movePipelineForward(response)
          // this.close()
        }
      } catch (error) {
        console.log('something failed on the server: ', error?.message)
      } finally {
        this.loading = false
      }
    },
    async handleLeadAction() {
      if (this.isNewLead) {
        await this.createNewLeads()
      } else {
        await this.updateLead()
      }
    },
    async updateLead() {
      try {
        if (this.$refs.edit_lead.validate()) {
          this.loading = true

          const AuthStr = 'Bearer '.concat(this.$store.state.token)

          this.companyDetails.company_phone = this.formatPhone(
            this.company_phone
          )
          this.contactPerson.phone = this.formatPhone(this.contact_phone)

          let obj = {
            user_id: this.lead.user_id,
            company_id: this.lead.company_id,
            lead_details: this.lead.lead_details,
          }
          const response = await this.$axios.$patch(`leads/${this.lead._id}`, {
            lead: {
              ...this.lead,
              contact_person: this.contactPerson,
              inquiry_date: this.inquiry_date
            },
            companyDetails: {
              ...this.companyDetails,
              contact_person: [this.contactPerson],
            },
          })

          await this.movePipelineForward(response)

          // Emit success event to parent components for data refetch
          this.$emit('lead-updated', {
            leadId: this.lead._id,
            updatedData: response,
            currentStatus: response?.lead_details?.status || this.lead.lead_details?.status
          })

          // Also emit global event for other components listening with status information
          this.$nuxt.$emit('lead-data-updated', {
            leadId: this.lead._id,
            action: 'update',
            currentStatus: response?.lead_details?.status || this.lead.lead_details?.status,
            previousStatus: this.lead.lead_details?.status,
            leadData: response
          })

          console.log('Lead update event emitted for lead ID:', this.lead._id)
          this.handleModel()
        }
      } catch (error) {
        console.log('Could not update', error?.message)
        this.showNotificationStatus(`Failed to update lead: ${error?.message}`, false)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
