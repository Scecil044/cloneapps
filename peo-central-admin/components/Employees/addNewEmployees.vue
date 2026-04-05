<template>
  <v-row>
    <v-col cols="12">
      <!-- <v-container fluid> -->
      <v-card-title
        id="card-title"
        class="mb-4"
      >
        <h4 class="text--text">
          Create New Employee
        </h4>

        <div class="flex_row justify-lg-space-between">
          <v-btn
            class="tall__btn mr-2"
            color="lightgray"
            outlined
            @click="close()"
          >
            Cancel
          </v-btn>
          <v-img
            src="/animated/ring.svg"
            width="40px"
            height="40px"
            contain
            class=""
            v-if="addLoading"
          />
          <v-btn
            class="tall__btn px-6"
            color="primary"
            @click.once.prevent="createNewOnboarding()"
            v-else
          >
            Create
          </v-btn>
        </div>
      </v-card-title>
      <v-form ref="onboardingForm">
        <v-row class="mb-2">
          <!-- company Name -->
          <v-col
            cols="12"
            md="3"
            class="px-0 py-0"
            style="height: fit-content"
          >
            <v-row>
              <v-col
                cols="12"
                class="py-0 pl-0 pr-12"
              >
                <CustomInputContainer label="Company Name">
                  <div slot="input">
                    <v-select
                      :items="employers"
                      placeholder="Select Company"
                      solo
                      dense
                      v-model="onboardingUser.company_id"
                      item-text="company_name"
                      item-value="_id"
                      class="proposalDialog_date_field2"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <!-- Employee Profile -->
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <div class="mb-6 d-flex align-center customer_icon">
              <v-avatar
                class=""
                size="90px"
              >
                <v-avatar size="90">
                  <v-img
                    alt="Avatar"
                    style="border-radius: 90px"
                    width="90"
                    height="90"
                    :src="onboardingUser.image_url"
                    v-if="onboardingUser.image_url"
                  />
                  <customerDefaultIcon
                    v-else
                    style="border-radius: 90px"
                  />
                </v-avatar>
              </v-avatar>

              <div>
                <!-- <p>{{ selectedCustomer }}</p> -->
                <h4 class="ml-5">
                  {{ onboardingUser.first_name }} {{ onboardingUser.middle_name }}
                  {{ onboardingUser.last_name }}
                </h4>
              </div>

              <template>
                <v-btn
                  class="edit_btn"
                  color="subtext"
                  icon
                  @click="uploadPicture = true"
                >
                  <v-icon small>
                    fa-solid fa-pencil
                  </v-icon>
                </v-btn>
              </template>
            </div>
          </v-col>
          <!-- Employee Personal Details -->
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <span class="span_leadHeading">PERSONAL DETAILS</span>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <v-row class="">
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="First Name"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.first_name"
                      placeholder="First Name"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      outlined
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer label="Middle Name">
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.middle_name"
                      placeholder="Add Middle Name"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      hide-details
                    />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Last Name"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.last_name"
                      placeholder="Add Last Name"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      outlined
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <v-row class="">
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Email Address"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.email"
                      placeholder="Enter mail"
                      outlined
                      dense
                      :rules="emailRules"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Date Of Birth"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-menu
                      v-model="showDob"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="onboardingUser.personal.dob"
                          placeholder="Enter Date Of Birth Date"
                          solo
                          class="proposalDialog_date_field2"
                          dense
                          outlined
                          v-bind="attrs"
                          v-on="on"
                          :rules="main_rule"
                        >
                          <template #append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker
                        v-model="onboardingUser.personal.dob"
                        @input="showDob = false"
                      />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="">
              <v-col
                cols="12"
                md="6"
                lg="6"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Phone Number"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-row>
                      <v-col
                        class="py-0 pl-2"
                        cols="12"
                        sm="12"
                        md="3"
                        v-if="countryCode.length > 0"
                      >
                        <v-autocomplete
                          v-if="countryCode.length > 0"
                          color="black"
                          auto-select-first
                          class="autoCompleteCustomClass"
                          :items="countryCode"
                          :item-text="item => item.dialCode"
                          item-value="dialCode"
                          style="max-width:150px"
                          dense
                          outlined
                          placeholder="Country Code"
                          :rules="main_rule"
                          v-model="phoneNumberText"
                        >
                          <template #item="slotProps">
                            <v-avatar
                              left
                              class="mr-3"
                            >
                              <svg v-html="slotProps.item.flag" />
                            </v-avatar>
                            {{ slotProps.item.dialCode }}
                            {{ slotProps.item.country }}
                          </template>
                        </v-autocomplete>
                      </v-col>
                      <v-col
                        class="py-0"
                        cols="12"
                        sm="12"
                        md="6"
                      >
                        <v-text-field
                          placeholder="Add phone number"
                          v-model="onboardingUser.contact_number"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <v-row class="">
              <v-col
                cols="12"
                md="6"
                lg="6"
                class="pl-0 pr-12"
              >
                <CustomInputContainer label="Place of Registration:">
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.place_of_registration"
                      placeholder="Enter registration place"
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      hide-details
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Role"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-select
                      :items="roles"
                      item-text="role_name"
                      item-value="id"
                      placeholder="Select Role"
                      v-model="onboardingUser.role_ID"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      append-icon="fa-chevron-down"
                      outlined
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <v-row class="">
              <v-col
                cols="12"
                md="6"
                lg="6"
                class="pl-0 pr-12"
              >
                <CustomInputContainer label="Company Office Address:">
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.company_address"
                      placeholder="Enter  Address "
                      class="proposalDialog_date_field2"
                      solo
                      hide-details
                      dense
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <!-- Employment  Details -->
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <span class="span_leadHeading">EMPLOYMENT DETAILS</span>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <v-row class="">
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Designation"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.employment.designation"
                      placeholder="Add designation.."
                      class="proposalDialog_date_field2"
                      solo
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Date of Joining"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-menu
                      v-model="date_menu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="onboardingUser.employment.date_of_joining"
                          placeholder="Enter Date"
                          solo
                          class="proposalDialog_date_field2"
                          dense
                          outlined
                          :rules="main_rule"
                          v-bind="attrs"
                          v-on="on"
                        >
                          <template #append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker
                        v-model="onboardingUser.employment.date_of_joining"
                        @input="date_menu = false"
                      />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer label="Probation Period">
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.employment.probation_period"
                      placeholder="Enter Probation Period (e.g., 3 months)"
                      outlined
                      dense
                      :rules="probationPeriodRules"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <v-row class="">
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer label="Notice Period">
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.employment.notice_period"
                      placeholder="Add notice period.."
                      solo
                      class="proposalDialog_date_field2"
                      hide-details
                      dense
                    />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer label="Working Days">
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.employment.working_days"
                      placeholder="Add Working days"
                      solo
                      class="proposalDialog_date_field2"
                      hide-details
                      dense
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer label="Contract Type">
                  <div slot="input">
                    <v-select
                      :items="['Limited', 'Unlimited']"
                      item-text="name"
                      placeholder="Add Contract Type"
                      v-model="onboardingUser.employment.contract_type"
                      solo
                      class="proposalDialog_date_field2"
                      hide-details
                      dense
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <!-- PAYROLL SCHEDULE -->
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <span class="span_leadHeading">PAYROLL SCHEDULE</span>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <v-row class="">
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Invoice Date"
                  v-if="onboardingUser.payroll_details.follow_different_payroll_schedule"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.payroll_details.invoice_date"
                      placeholder="Enter Invoice Date"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      hide-details
                    />
                  </div>
                </CustomInputContainer>
                <CustomInputContainer
                  label="Invoice Date"
                  v-else
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      disabled
                      v-model="onboardingUser.payroll_details.invoice_date"
                      placeholder="Enter Invoice Date"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      outlined
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Payment Due Date"
                  v-if="onboardingUser.payroll_details.follow_different_payroll_schedule"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.payroll_details.payment_due_notification"
                      placeholder="Enter Payment Due Date"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      hide-details
                    />
                  </div>
                </CustomInputContainer>
                <CustomInputContainer
                  label="Payment Due Date"
                  v-else
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      disabled
                      v-model="onboardingUser.payroll_details.payment_due_notification"
                      placeholder="Enter Payment Due Date"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      outlined
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col
                cols="12"
                md="3"
                lg="3"
                class="pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Salary Date"
                  v-if="onboardingUser.payroll_details.follow_different_payroll_schedule"
                >
                  <div slot="input">
                    <v-text-field
                      v-model="onboardingUser.payroll_details.salary_payment_date"
                      placeholder="Enter Payment Due Date"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      hide-details
                    />
                  </div>
                </CustomInputContainer>
                <CustomInputContainer
                  label="Salary Date"
                  v-else
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-text-field
                      disabled
                      v-model="onboardingUser.payroll_details.salary_payment_date"
                      placeholder="Enter Payment Due Date"
                      solo
                      class="proposalDialog_date_field2"
                      dense
                      outlined
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <div style="max-width: 25% !important">
              <v-checkbox
                label="Follow Different Payroll Schedule"
                @click="onboardingUser.payroll_details.follow_different_payroll_schedule = !onboardingUser.payroll_details.follow_different_payroll_schedule"
              />
            </div>
          </v-col>
          <!-- Employee Personal Details -->
          <v-col
            cols="12"
            class="py-0 px-0"
          >
            <span class="span_leadHeading">DEPENDENT DETAILS</span>
          </v-col>
          <!-- <v-col cols="12" class="py-0 px-0">
                  <v-row class="" v-for="(item, index) in onboardingUser.dependent_details" :key="index">
                  <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Dependent Name">
                      <div slot="input">
                          <v-text-field v-model="onboardingUser.dependent_details[index].dependent_name" placeholder="Enter Dependent Name" solo dense hide-details class="proposalDialog_date_field2" />
                      </div>
                      </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Relation">
                      <div slot="input">
                          <v-text-field v-model="onboardingUser.dependent_details[index].relation" placeholder="Enter your Relation" solo class="proposalDialog_date_field2" hide-details dense />
                      </div>
                      </CustomInputContainer>
                  </v-col>
                  </v-row>
              </v-col>
              <v-col cols="12" class="py-0 px-0">
              <a href="#" @click="onboardingUser.dependent_details.push(dependentObj)">Add Dependent</a>
              </v-col> -->

          <v-col cols="6">
            <v-simple-table
              dense
              class="dynamic_table"
            >
              <template #default>
                <thead class="dynamic_table_thead">
                  <tr
                    class=""
                    style="height: 35px !important"
                  >
                    <th
                      v-for="item in table_headers"
                      :key="item"
                      class="text-center text--text font-weight-bold"
                      style="font-size: 12px !important;font-weight: 500 !important;"
                    >
                      {{ item }}
                    </th>
                  </tr>
                </thead>
                <tbody
                  class="dynamic_table_tbody"
                  v-for="(item, index) in onboardingUser.dependent_details"
                  :key="index"
                >
                  <tr
                    class="dynamic_table_body_rows"
                    style="border-bottom: 0.5 solid red !important"
                  >
                    <td class="py-2 text-center">
                      <v-text-field
                        class="rounded-lg"
                        placeholder="Enter Service"
                        solo
                        flat
                        hide-details
                        dense
                        v-model="item.dependent_name"
                      />
                    </td>
                    <td class="py-2 text-center">
                      <v-text-field
                        class="rounded-lg"
                        placeholder="Enter Description"
                        solo
                        flat
                        hide-details
                        dense
                        v-model="item.relation"
                      />
                    </td>
                    <td class="py-2 text-center">
                      <v-btn
                        :disabled="onboardingUser.dependent_details.length == 1"
                        icon
                        color="error"
                        class="mx-3 text-center"
                        @click="handleDeleteProduct(index)"
                      >
                        <v-icon
                          class=""
                          color="error"
                          x-small
                        >
                          fa-light fa-trash-can
                        </v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
          <v-col cols="12">
            <div class="d-flex justify-space-between align-start">
              <v-btn
                @click="handleAddProduct()"
                class="small__btn"
                outlined
                color="subtext"
              >
                <v-icon
                  x-small
                  color="subtext"
                  class="mr-2"
                >
                  fa-plus
                </v-icon>
                <span class="text--text">Add Dependents</span>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-form>
      <!-- </v-container> -->

      <v-dialog
        v-model="uploadPicture"
        max-width="600"
      >
        <v-card
          max-width="600"
          style="overflow-x:hidden"
        >
          <v-row class="pt-4 pl-4 pr-4">
            <v-col
              cols="12"
              sm="12"
              md="12"
              lg="12"
              class="py-0 pt-0 text-center"
            >
              <p class="mb-0 caption blue-grey--text font-weight-bold">
                Upload Profile Pic
              </p>
              <v-col
                class="pt-2"
                v-if="filename_attach.length > 0"
              >
                <p class="mb-0">
                  File Name: {{ filename_attach[0] }}
                </p>
              </v-col>
              <div
                class="pt-2"
                v-if="!uploadFile"
              >
                <div
                  :class="['dropZone', dragging ? 'dropZone-over' : '']"
                  @dragenter="dragging = true"
                  @dragleave="dragging = false"
                >
                  <div
                    class="dropZone-info"
                    @drag="onUploadFile"
                  >
                    <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
                    <span class="dropZone-title">Drop file or click to upload</span>
                    <div class="dropZone-upload-limit-info">
                      <div>maximum file size: 10 MB</div>
                    </div>
                  </div>
                  <input
                    type="file"
                    @change="onUploadFile"
                  >
                </div>
              </div>
              <div
                v-else
                class="dropZone-uploaded"
              >
                <div class="dropZone-uploaded-info">
                  <span class="dropZone-title">Added</span>
                  <button
                    type="button"
                    class="btn btn-primary removeFile"
                    @click="removeFile('uploadDoc')"
                  >
                    Remove
                    File
                  </button>
                </div>
              </div>
            </v-col>
          </v-row>
          <v-row class="pa-4">
            <v-col class="text-right pt-0">
              <v-btn
                color="grey"
                text
                @click="uploadPicture = false"
              >
                Close
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                v-if="uploading"
              >
                <v-img
                  src="/animated/refresh.svg"
                  height="20"
                  width="20"
                  class="mr-2"
                  contain
                />
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                v-else
                @click="attachFile()"
              >
                Upload Profile
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_newLead.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import countryFlagsDialCode from 'country-flags-dial-code'

export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    customerDefaultIcon
  },
  props: { selectedCustomer: String },
  data() {
    return {
      countryList: countryFlagsDialCode.getCountryListMap(),
      countryCode: [],
      phoneNumberText: '+971',
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [(value) => {
        return !isNaN(value) && value.length > 7 || 'Invalid phone number.'
      }
      ],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      onboardingUser: {
        company_id: this.selectedCustomer,
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        image_url: '',
        dob: '',
        place_of_registration: '',
        role_ID: '',
        company_address: '',
        personal: {},
        employment: {
          designation: '',
          date_of_joining: '',
          probation_period: '',
          notice_period: '',
          working_days: '',
          contract_duration: '',
          contract_type: ''
        },
        payroll_details: {
          invoice_date: '',
          payment_due_notification: '',
          salary_payment_date: '',
          follow_different_payroll_schedule: false
        },
        dependent_details: [
          {
            dependent_name: '',
            relation: ''
          }
        ]
      },
      date_menu: false,
      date_menu1: false,
      showDob: false,
      limit: '10',
      page: 0,
      comPag: 0,
      employers: [],
      roles: [],
      dependentObj: {
        dependent_name: '',
        relation: ''
      },
      uploadPicture: false,
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      link_url: '',
      link_filename: '',
      attachFiles: {
        uploadDoc: {},
        ecard: {}
      },
      uploading: false,
      companyDetails: [],
      table_headers: [
        'Dependent Name',
        'Relation',
        'Actions'
      ],
      addLoading: false
    }
  },
  mounted() {
    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }

    this.getEmployersList()
    this.getRolesList()
    this.getCompanyDetails(this.onboardingUser.company_id)
  },
  methods: {
    customFilter(item, queryText, itemText) {
      const searchText = queryText.toLowerCase()
      const country = item.country.toLowerCase()
      const dialCode = item.dialCode.toLowerCase()
      return country.includes(searchText) || dialCode.includes(searchText)
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
    },
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        this.dragging = false
        return
      }
      this.createFile(e, files, type)
    },
    removeFile(val) {
      if (val == 'uploadDoc') this.uploadFile = ''
      this.filename_attach = []
    },
    createFile(e, file, type) {
      if (file.size > 10000000) {
        alert('please check file size is not more than 10 MB.')
        this.dragging = false
        return
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file
      this.dragging = false
    },
    onUploadFiles(event) {
      this.uploadFiles = event
      this.dragging = false
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    async attachFile() {
      this.uploading = true
      let attach = {}

      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      for (var key in this.attachFiles) {
        if (!_.isEmpty(this.attachFiles[key])) {
          for (let i = 0; i < this.attachFiles[key].length; i++) {
            if (this.attachFiles[key][i].name != undefined) {
              attach.file = this.attachFiles[key][i]
            } else {
              console.log('null')
            }
          }
        }
        this.removeFile(key)
      }

      const fd = new FormData()

      fd.append('documents', attach.file)

      await this.$axios.$post(`/documents/simpleupload`, fd, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.onboardingUser.image_url = response[0]
          this.uploadPicture = false
          this.uploading = false
        })
    },
    close() {
      this.$emit('close')
    },
    async getEmployersList() {
      this.comPage++

      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/companies/list/dropdown?page=${this.comPage}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.employers = response
        })
    },
    async getRolesList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get('/roles/', { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.roles = response
        })
    },
    async getCompanyDetails(company_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/companies/comp/${company_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.companyDetails = response
          this.onboardingUser.payroll_details.invoice_date = this.companyDetails.payroll_schedule.invoice_date
          this.onboardingUser.payroll_details.payment_due_notification = this.companyDetails.payroll_schedule.payment_due_notification
          this.onboardingUser.payroll_details.salary_payment_date = this.companyDetails.payroll_schedule.salary_payment_date
        })
    },
    handleDeleteProduct(index) {
      this.onboardingUser.dependent_details.splice(index, 1)
    },
    handleAddProduct() {
      this.onboardingUser.dependent_details.push({
        dependent_name: '',
        relation: ''
      })
    },
    async createNewOnboarding() {
      if (this.$refs.onboardingForm.validate()) {
        this.addLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        this.onboardingUser.contact_number = this.phoneNumberText + this.onboardingUser.contact_number

        await this.$axios.$post('/onboardings/create/onboarding/users', this.onboardingUser, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.addLoading = false
            this.close()
          })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.dropZone {
  width: 220px;
  height: 80px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone:hover {
  border: 2px solid #2e94c4;
}

.dropZone:hover .dropZone-title {
  color: #1975A0;
}

.dropZone-info {
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}

.dropZone-title {
  color: #787878;
}

.dropZone input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.dropZone-upload-limit-info {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.dropZone-over {
  background: #5C5C5C;
  opacity: 0.8;
}

.dropZone-uploaded {
  width: 220px;
  height: 75px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone-uploaded-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>
