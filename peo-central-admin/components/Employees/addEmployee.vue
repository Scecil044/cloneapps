<template>
  <v-row>
    <v-col cols="12">
      <v-card id="tall_dialog" class="tw-shadow-lg tw-rounded-lg">
        <v-card-title id="card-title" class="tw-px-6 tw-py-4 tw-bg-gray-50">
          <h4 class="tw-text-lg tw-font-semibold tw-text-gray-800">{{ }}</h4>
          <div class="tw-flex tw-justify-end tw-items-center tw-gap-3">
            <v-btn class="tall__btn tw-px-6 tw-py-2 tw-rounded-md tw-border tw-border-gray-300 tw-text-gray-700 hover:tw-bg-gray-50" color="subtext" outlined @click="close()">Cancel</v-btn>
            <v-img src="/animated/ring.svg" width="40px" height="40px" contain class="tw-animate-spin" v-if="AddEmployeeLoading"></v-img>
            <v-btn class="tall__btn tw-px-8 tw-py-2 tw-rounded-md tw-bg-primary tw-text-white hover:tw-bg-primary-dark" color="primary" min-width="100px" @click="addEmployeesDetails" v-else>Add</v-btn>
          </div>
        </v-card-title>
        <v-divider id="divider" class="tw-border-gray-200"></v-divider>
        <v-card-text id="card-text" class="tw-p-6">
          <v-form ref="onboardingForm">
            <v-row class="pa-0 ma-0">
              <v-col cols="12" class="py-0 px-0">
                <h4 class="text--text tw-mb-4"> EMPLOYEE DETAILS </h4>
                <div class="tw-mb-6 tw-flex tw-items-center customer_icon">
                  <v-avatar class="" size="90px">
                    <v-avatar size="90">
                      <v-img
                        alt="Avatar"
                        style="border-radius: 50px"
                        width="60"
                        height="60"
                        :src="employeeDetailsObj.image_url || 'https://shorturl.at/h9ROo'"
                        v-if="employeeDetailsObj.image_url"
                      />
                      <customerDefaultIcon v-else style="border-radius: 50px" />
                    </v-avatar>
                  </v-avatar>
                  <div>
                    <h4 class="tw-ml-5">
                      {{ employeeDetailsObj.first_name }}
                      {{ employeeDetailsObj.middle_name }}
                      {{ employeeDetailsObj.last_name }}
                    </h4>
                  </div>
                  <template>
                    <v-btn
                      class="edit_btn"
                      color="subtext"
                      icon
                      @click="uploadPicture = true"
                    >
                      <v-icon small>fa-solid fa-pencil</v-icon>
                    </v-btn>
                  </template>
                </div>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="First Name" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.first_name" placeholder="First Name"
                                  outlined dense :rules="main_rule" class="tw-rounded-md" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Middle Name" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.middle_name" placeholder="Middle Name"
                                  outlined dense class="tw-rounded-md" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Last Name" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.last_name" placeholder="Last Name"
                                  outlined dense :rules="main_rule" class="tw-rounded-md" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Email" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.email" placeholder="Email" outlined
                                  dense :rules="emailRules" class="tw-rounded-md" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone" class="tw-mb-0">
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
                          class="autoCompleteCustomClass country-code-selector"
                          :items="countryCode"
                          :item-text="(item) => item.dialCode + item.country"
                          return-object
                          style="max-width: 150px"
                          dense
                          outlined
                          placeholder="Country Code"
                          v-model="phoneNumberText"
                          @change="employeeDetailsObj.personal.phone_code = phoneNumberText.dialCode"
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
                      </v-col>
                      <v-col class="py-0 phone-input" cols="12" sm="12" md="9">
                        <v-text-field
                          v-model="employeeDetailsObj.personal.phone"
                          placeholder="Phone"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Date of Birth" class="tw-mb-0">
                  <div slot="input">
                    <v-menu v-model="date_menu_dob" :close-on-content-click="false"
                            :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="employeeDetailsObj.personal.dob"
                                      placeholder="mm/dd/yy" class="proposalDialog_date_field2" solo dense
                                      readonly v-bind="attrs" v-on="on" :rules="main_rule">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="employeeDetailsObj.personal.dob"
                                     @input="date_menu_dob = false" />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Gender" class="tw-mb-0">
                  <div slot="input">
                    <v-select :items="['Male', 'Female', 'Not Disclosed']" placeholder="Gender" solo
                              dense :rules="main_rule" v-model="employeeDetailsObj.personal.gender"
                              class="proposalDialog_date_field2" append-icon="fa-chevron-down">
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- <v-col cols="4">
                <CustomInputContainer label="Marital Status">
                  <div slot="input">
                    <v-select :items="['Single', 'Married', 'Not Disclosed']"
                              placeholder="Marital Status" solo dense
                              v-model="employeeDetailsObj.personal.marital_status" :rules="main_rule"
                              class="proposalDialog_date_field2" append-icon="fa-chevron-down">
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col> -->
              <v-col cols="4">
                <CustomInputContainer label="Nationality" class="tw-mb-0">
                  <div slot="input">
                    <v-select :items="computeNationalities" placeholder="Nationality" solo dense
                              v-model="employeeDetailsObj.personal.nationality" :rules="main_rule"
                              class="proposalDialog_date_field2" append-icon="fa-chevron-down">
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- <v-col cols="4">
                <CustomInputContainer label="Allergies">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.personal.allergies"
                                  placeholder="Allergies" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col> -->
              <v-col cols="4">
                <CustomInputContainer label="Internal Designation" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field
                      v-model="employeeDetailsObj.employment.designation"
                      placeholder="Internal Designation"
                      outlined
                      dense
                      :rules="main_rule"
                      @input="handleInternalDesignationInput"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Visa Designation" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.employment.visa_designation"
                                  placeholder="Visa Designation" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Internal Team" class="tw-mb-0">
                  <div slot="input">
                    <v-select
                      :items="['Yes', 'No']"
                      v-model="internalTeam"
                      placeholder="Select Internal Team Status"
                      outlined
                      dense
                      append-icon="fa-chevron-down"
                      @change="onInternalTeamChange"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- Confirmation Modal for Internal Team change -->
              <CommonModal
                :open="showInternalTeamModal"
                title="Change Internal Team Status"
                message="Note that changing the internal team status will make this employee one of the mentionable users on visa process comments, and among the assignable PROs on leads module."
                confirm-text="Proceed"
                cancel-text="Cancel"
                type="info"
                @confirm="confirmInternalTeamChange"
                @cancel="cancelInternalTeamChange"
              />
              <v-col cols="4">
                <CustomInputContainer label="Work Location">
                  <div slot="input">
                    <v-select
                      v-model="employeeDetailsObj.employment.work_location"
                      :items="['Inside UAE', 'Outside UAE']"
                      placeholder="Select Work Location"
                      outlined
                      dense
                      class="tw-rounded-md"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Address" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.personal.address"
                                  placeholder="Address" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>


              <!-- <v-col cols="4">
                <CustomInputContainer label="Specialty">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.personal.speciality"
                                  placeholder="Specialty" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col> -->

              <!-- <v-col cols="4">
                <CustomInputContainer label="Skill Sets">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.personal.skill_sets"
                                  placeholder="Skill Sets" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col> -->
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col cols="12">
                <h4 class="text--text"> EMPLOYMENT DETAILS </h4>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Company Name" class="tw-mb-0">
                  <div slot="input">
                    <v-select :items="employers" placeholder="Select Employers" solo dense
                              v-model="employeeDetailsObj.company_id" item-text="company_name"
                              item-value="_id" class="proposalDialog_date_field2"
                              append-icon="fa-chevron-down">
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Manager Name" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.manager_name"
                                  placeholder="Manager Name" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Employee Status" class="tw-mb-0">
                  <div slot="input">
                    <v-select :items="userStatusList" placeholder="Employee Status" solo dense
                              v-model="employeeDetailsObj.user_status" class="proposalDialog_date_field2"
                              append-icon="fa-chevron-down" :rules="main_rule">
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Employee level" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.employment.designation"
                                  placeholder="Employee level" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Role Type" class="tw-mb-0">
                  <div slot="input">
                    <v-select :items="userRolesList" placeholder="Role Type" item-text="role_name"
                              item-value="id" solo dense v-model="employeeDetailsObj.role_ID"
                              class="proposalDialog_date_field2" append-icon="fa-chevron-down"
                              :rules="main_rule">
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Department" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.department" placeholder="Department"
                                  outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Team" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.team" placeholder="Team" outlined
                                  dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Work Schedule">
                  <div slot="input">
                    <v-text-field
                      v-model="employeeDetailsObj.employment.work_schedule"
                      placeholder="9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)"
                      outlined
                      dense
                      class="tw-rounded-md"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Date of Joining">
                  <div slot="input">
                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="employeeDetailsObj.employment.date_of_joining"
                                      placeholder="mm/dd/yy" class="proposalDialog_date_field2" solo dense
                                      readonly v-bind="attrs" v-on="on">
                          <template v-slot:append>
                            <div class="">
                              <CalenderSvg />
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker v-model="employeeDetailsObj.employment.date_of_joining"
                                     @input="date_menu = false" />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Probation Period">
                  <div slot="input">
                    <v-select
                      v-model="employeeDetailsObj.employment.probation_period"
                      :items="['0 Months', '1 Month', '2 Months', '3 Months', '4 Months', '5 Months', '6 Months']"
                      placeholder="Select Probation Period"
                      outlined
                      dense
                      class="tw-rounded-md"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Notice Period">
                  <div slot="input">
                    <v-select
                      v-model="employeeDetailsObj.employment.notice_period"
                      :items="noticePeriodOptions"
                      placeholder="Select Notice Period"
                      outlined
                      dense
                      class="tw-rounded-md"
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="End Date">
                  <div slot="input">
                    <v-menu
                      v-model="end_date_menu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="employeeDetailsObj.employment.end_date"
                          placeholder="Enter End of Contract Date"
                          class="proposalDialog_date_field2"
                          dense
                          outlined
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
                        v-model="employeeDetailsObj.employment.end_date"
                        @input="end_date_menu = false"
                        :min="minExpectedDate"
                      />
                    </v-menu>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Contract Duration">
                  <div slot="input">
                    <v-text-field
                      v-model="employeeDetailsObj.employment.contract_duration"
                      placeholder="Contract Duration"
                      outlined
                      dense
                      class="tw-rounded-md"
                      disabled
                      
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Employment Type">
                  <div slot="input">
                    <v-select
                      v-model="employeeDetailsObj.employment.employment_type"
                      :items="[
                        'Mission Visa (3 Months Single Entry)',
                        'Work Permit (for UAE Resident visa holders)',
                        'Employment Visa (2-Year)'
                      ]"
                      placeholder="Select Employment Type"
                      outlined
                      dense
                      class="tw-rounded-md"
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Visa Issuance Authority">
                  <div slot="input">
                    <v-select
                      v-model="employeeDetailsObj.employment.visa_sponsor_type"
                      :items="[
                        'Dynamic Employment Services',
                        'Executive Employment Services'
                      ]"
                      placeholder="Select Visa Issuance Authority"
                      outlined
                      dense
                      class="tw-rounded-md"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Contract Type" class="tw-mb-0">
                  <div slot="input">
                    <v-select
                      v-model="employeeDetailsObj.employment.contract_type"
                      :items="['Full Time', 'Temporary']"
                      placeholder="Contract Type"
                      outlined
                      dense
                      :rules="main_rule"
                      class="proposalDialog_date_field2"
                      append-icon="fa-chevron-down"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Cost Center" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.cost_center" placeholder="Cost Center"
                                  outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Working Days">
                  <div slot="input">
                    <v-select
                      v-model="employeeDetailsObj.employment.working_days"
                      :items="['5 Working Days', '6 Working Days']"
                      placeholder="Select Working Days"
                      outlined
                      dense
                      class="tw-rounded-md"
                      append-icon="fa-chevron-down"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0" v-if="employeeDetailsObj && employeeDetailsObj.payroll_details">
              <v-col cols="12">
                <h4 class="text--text"> PAYROLL DETAILS </h4>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Invoice Date" class="tw-mb-0">
                  <div slot="input">
                    <v-select
                      v-model="selectedInvoiceDay"
                      :items="dayOptions"
                      item-text="display"
                      item-value="value"
                      placeholder="Select Day of Month"
                      class="proposalDialog_date_field2"
                      dense
                      outlined
                      :rules="main_rule"
                      @change="updatePayrollDateDisplay('invoice_date')"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Payment Due Date" class="tw-mb-0">
                  <div slot="input">
                    <v-select
                      v-model="selectedPaymentDueDay"
                      :items="dayOptions"
                      item-text="display"
                      item-value="value"
                      placeholder="Select Day of Month"
                      class="proposalDialog_date_field2"
                      dense
                      outlined
                      :rules="main_rule"
                      @change="updatePayrollDateDisplay('payment_due_notification')"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Salary Date" class="tw-mb-0">
                  <div slot="input">
                    <v-select
                      v-model="selectedSalaryDay"
                      :items="dayOptions"
                      item-text="display"
                      item-value="value"
                      placeholder="Select Day of Month"
                      class="proposalDialog_date_field2"
                      dense
                      outlined
                      :rules="main_rule"
                      @change="updatePayrollDateDisplay('salary_payment_date')"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0" v-if="employeeDetailsObj && employeeDetailsObj.emergency">
              <v-col cols="12">
                <h4 class="text--text"> EMERGENCY CONTACT </h4>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Name" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.emergency.name" placeholder="Name"
                                  outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Relationship" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.emergency.relationship"
                                  placeholder="Relationship" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone" class="tw-mb-0">
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
                          class="autoCompleteCustomClass country-code-selector"
                          :items="countryCode"
                          :item-text="(item) => item.dialCode + item.country"
                          return-object
                          style="max-width: 150px"
                          dense
                          outlined
                          placeholder="Country Code"
                          v-model="phoneNumberTextEmergency"
                          @change="employeeDetailsObj.emergency.phone_code = phoneNumberTextEmergency.dialCode"
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
                      </v-col>
                      <v-col class="py-0 phone-input" cols="12" sm="12" md="9">
                        <v-text-field
                          v-model="employeeDetailsObj.emergency.phone"
                          placeholder="Phone"
                          outlined
                          dense
                        />
                      </v-col>
                    </v-row>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Name 1" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.emergency.name_1" placeholder="Name 1"
                                  outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Relationship 1" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.emergency.relationship_1"
                                  placeholder="Relationship 1" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone 1" class="tw-mb-0">
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
                          class="autoCompleteCustomClass country-code-selector"
                          :items="countryCode"
                          :item-text="(item) => item.dialCode + item.country"
                          return-object
                          style="max-width: 150px"
                          dense
                          outlined
                          placeholder="Country Code"
                          v-model="phoneNumberTextEmergency1"
                          @change="employeeDetailsObj.emergency.phone_code_1 = phoneNumberTextEmergency1.dialCode"
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
                      </v-col>
                      <v-col class="py-0 phone-input" cols="12" sm="12" md="9">
                        <v-text-field
                          v-model="employeeDetailsObj.emergency.phone_1"
                          placeholder="Phone 1"
                          outlined
                          dense
                        />
                      </v-col>
                    </v-row>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0" v-if="employeeDetailsObj && employeeDetailsObj.bank">
              <v-col cols="12">
                <h4 class="text--text"> BANKING DETAILS </h4>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Bank Name" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.bank.bank_name"
                                  placeholder="Bank Name" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Account Number" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.bank.account_number"
                                  placeholder="Account Number" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="IBAN" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.bank.iban" placeholder="IBAN" outlined
                                  dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Bank Post Office" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.bank.bank_post_office"
                                  placeholder="Bank Post Office" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Bank Address" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.bank.bank_address"
                                  placeholder="Bank Address" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Salary Payment Mode" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field v-model="employeeDetailsObj.bank.salary_payment_mode"
                                  placeholder="Salary Payment Mode" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0" v-if="employeeDetailsObj && employeeDetailsObj.salary">
              <v-col cols="12">
                <h4 class="text--text"> SALARY DETAILS </h4>
              </v-col>
              <v-col v-for="(salary, key) in computedSalaries" :key="key" cols="4" class="tw-p-0">
                <CustomInputContainer :label="salary.name" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field
                      v-model.number="employeeDetailsObj.salary[salary.key]"
                      :placeholder="salary.name"
                      class="tw-rounded-md"
                      outlined
                      dense
                      :rules="salaryRule"
                      @focus="$event.target.select()"
                      prefix="AED"
                      @input="updateTotal"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4" class="tw-p-0">
                <CustomInputContainer label="Total Fixed" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field
                      :value="computedTotalSalary"
                      placeholder="Total Fixed"
                      class="tw-rounded-md tw-bg-gray-50"
                      outlined
                      dense
                      readonly
                      prefix="AED"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4" class="tw-p-0">
                <CustomInputContainer label="Remarks" class="tw-mb-0">
                  <div slot="input">
                    <v-text-field
                      v-model="employeeDetailsObj.salary.remarks"
                      placeholder="Enter remarks"
                      class="tw-rounded-md"
                      outlined
                      dense
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Upload Picture Dialog -->
    <v-dialog v-model="uploadPicture" max-width="600">
      <v-card max-width="600" style="overflow-x: hidden">
        <v-row class="pt-4 pl-4 pr-4">
          <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
            <p class="mb-0 caption blue-grey--text font-weight-bold">Upload Profile Pic</p>
            <div class="pt-2" v-if="!uploadFile">
              <div
                :class="['dropZone', dragging ? 'dropZone-over' : '']"
                @dragenter="dragging = true"
                @dragleave="dragging = false"
              >
                <div class="dropZone-info" @drag="onUploadFile">
                  <span class="dropZone-title">Drop file or click to upload</span>
                  <div class="dropZone-upload-limit-info">
                    <div>maximum file size: 10 MB</div>
                  </div>
                </div>
                <input type="file" @change="onUploadFile" />
              </div>
            </div>
            <div v-else class="dropZone-uploaded">
              <div class="dropZone-uploaded-info">
                <span class="dropZone-title">Added</span>
                <button
                  type="button"
                  class="btn btn-primary removeFile"
                  @click="removeFile('uploadDoc')"
                >
                  Remove File
                </button>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row class="pa-4">
          <v-col class="text-right pt-0">
            <v-btn color="grey" text @click="uploadPicture = false">Close</v-btn>
            <v-btn color="blue darken-1" text v-if="uploading">
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
              :disabled="!uploadFile"
              @click="attachFile()"
            >
              Upload Profile
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template #action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-snackbar
      v-model="showProAlert"
      color="info"
      top
      class="tw-rounded-lg"
      @input="(val) => !val && handleProNotificationDismiss()"
    >
      <div class="tw-flex tw-items-center tw-gap-2">
        <v-icon color="white">mdi-information</v-icon>
        <span class="tw-text-white">To make an employee a PRO, enter "PRO" in the Internal Designation field</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="handleProNotificationDismiss"
          class="tw-text-white"
        >
          Got it
        </v-btn>
      </template>
    </v-snackbar>
  </v-row>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import countries from 'countries-list'
import countryFlagsDialCode from "country-flags-dial-code";
import CommonModal from '@/components/Common/CommonModal.vue'


export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    customerDefaultIcon,
    countries,
    CommonModal
  },

  data() {
    return {
      headerTitle: 'EMPLOYEE DETAILS',
      main_rule: [(v) => !!v || 'This filed is required'],
      number_rule: [(v) => !!v || 'Only numeric values'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      email_rule: [],
      phone_rule: [],
      countryList: countryFlagsDialCode.getCountryListMap(),
      countryCode: [],
      phoneNumberText: '',
      phoneNumberTextEmergency: '',
      phoneNumberTextEmergency1: '',
      employeeDetailsObj: {
        personal: {
          phone: '',
          phone_code: '+971'
        },
        password: 'Welcome@123',
        company_id: this.$store.getters.getSelectedCompany,
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        image_url: '',
        dob: '',
        place_of_registration: '',
        role_ID: '640f064bbe01c2e00bd95082',
        employment: {
          designation: '',
          date_of_joining: '',
          end_date: '',
          probation_period: '',
          notice_period: '',
          working_days: '',
          contract_duration: '',
          contract_type: '',
          work_location: '',
          work_schedule: '9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)',
          employment_type: '',
          visa_sponsor_type: '',
          visa_designation: ''
        },
        bank: {},
        payroll_details: {
          invoice_date: '',
          payment_due_notification: '',
          salary_payment_date: '',
          follow_different_payroll_schedule: false
        },
        emergency: {
          name: '',
          relationship: '',
          phone: '',
          phone_code: '+971',
          name_1: '',
          relationship_1: '',
          phone_1: '',
          phone_code_1: '+971'
        },
        salary: {
          total_fixed: '0',
          remarks: '',
          basic_salary: 0,
          food_allowance: 0,
          petrol_allowance: 0,
          other_allowance: 0,
          housing_allowance: 0,
          transportation_allowance: 0
        },
        dependent_details: [
          {
            dependent_name: '',
            relation: ''
          }
        ]
      },
      employers: [],
      userStatusList: [],
      userRolesList: [],
      date_menu: false,
      date_menu_dob: false,
      date_menu_doj: false,
      date_menu_ea: false,
      end_date_menu: false,
      AddEmployeeLoading: false,
      dayOptions: Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        display: `${i + 1}${this.getOrdinalSuffix(i + 1)} of each month`
      })),
      selectedInvoiceDay: null,
      selectedPaymentDueDay: null,
      selectedSalaryDay: null,
      fixed: [
        'Basic Salary',
        'House Allowance',
        'Transportation Allowance',
        'Food Allowance',
        'Petrol Allowance',
        'Other Allowance'
      ],
      salaryRule: [(value) => !isNaN(value) || 'Invalid'],
      uploadPicture: false,
      uploadFile: null,
      uploadFiles: null,
      dragging: false,
      uploading: false,
      snack: false,
      snackColor: '',
      snackText: '',
      filename_attach: [],
      attachFiles: {
        uploadDoc: {}
      },
      noticePeriodOptions: [
        '1 Month',
        '2 Months',
        '3 Months'
      ],
      // Internal Team selection
      internalTeam: 'No',
      is_internal_staff: false,
      showInternalTeamModal: false,
      pendingInternalTeam: null,
    }
  },
  mounted() {
    this.getEmployersList()
    this.getUsersStatusList()
    this.getUsersRoleList()
    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }
    
    // Initialize internalTeam based on is_internal_staff value
    this.internalTeam = this.is_internal_staff ? 'Yes' : 'No'
  },
  methods: {
    close() {
      this.$emit('close', true)
    },
    async getEmployersList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/companies/`, { headers: { Authorization: AuthStr } })
        .then((response) => {

          this.employers = response
        })
    },
    async getUsersStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/users/list/status`, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.userStatusList = res
        })
    },
    async getUsersRoleList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/roles/`, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.userRolesList = res
        })
    },
    async addEmployeesDetails() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      if (this.$refs.onboardingForm.validate()) {
        this.AddEmployeeLoading = true
        let obj = {
          legal_name: this.employeeDetailsObj.legal_name,
          company_name: this.employeeDetailsObj.company_name,
          registration_number: this.employeeDetailsObj.company_registration_number,
          email: this.employeeDetailsObj.email,
          website: this.employeeDetailsObj.company_website,
          country: this.employeeDetailsObj.company_country,
          image_url: this.employeeDetailsObj.image_url,
          is_internal_staff: this.is_internal_staff, // Add is_internal_staff to the submitted data
          payroll_details: {
            salary_payment_date: this.employeeDetailsObj.payroll_details.salary_payment_date,
            payment_due_notification: this.employeeDetailsObj.payroll_details.payment_due_notification,
            invoice_date: this.employeeDetailsObj.payroll_details.invoice_date
          },
          emergency: {
            name: this.employeeDetailsObj.emergency.name,
            relationship: this.employeeDetailsObj.emergency.relationship,
            phone: this.employeeDetailsObj.emergency.phone,
            phone_code: this.employeeDetailsObj.emergency.phone_code,
            name_1: this.employeeDetailsObj.emergency.name_1,
            relationship_1: this.employeeDetailsObj.emergency.relationship_1,
            phone_1: this.employeeDetailsObj.emergency.phone_1,
            phone_code_1: this.employeeDetailsObj.emergency.phone_code_1
          },
          company_id: this.employeeDetailsObj.company_id,
          manager_name: this.employeeDetailsObj.manager_name,
          user_status: this.employeeDetailsObj.user_status,
          designation: this.employeeDetailsObj.employment.designation,
          role_ID: this.employeeDetailsObj.role_ID,
          department: this.employeeDetailsObj.department,
          work_schedule: this.employeeDetailsObj.employment.work_schedule,
          work_location: this.employeeDetailsObj.employment.work_location,
          employment: {
            designation: this.employeeDetailsObj.employment.designation,
            date_of_joining: this.employeeDetailsObj.employment.date_of_joining,
            end_date: this.employeeDetailsObj.employment.end_date,
            probation_period: this.employeeDetailsObj.employment.probation_period,
            notice_period: this.employeeDetailsObj.employment.notice_period,
            working_days: this.employeeDetailsObj.employment.working_days,
            contract_duration: this.employeeDetailsObj.employment.contract_duration,
            contract_type: this.employeeDetailsObj.employment.contract_type,
            work_location: this.employeeDetailsObj.employment.work_location,
            work_schedule: this.employeeDetailsObj.employment.work_schedule,
            employment_type: this.employeeDetailsObj.employment.employment_type,
            visa_sponsor_type: this.employeeDetailsObj.employment.visa_sponsor_type,
            visa_designation: this.employeeDetailsObj.employment.visa_designation
          },
          bank: {
            bank_name: this.employeeDetailsObj.bank.bank_name,
            account_number: this.employeeDetailsObj.bank.account_number,
            iban: this.employeeDetailsObj.bank.iban,
            bank_post_office: this.employeeDetailsObj.bank.bank_post_office,
            bank_address: this.employeeDetailsObj.bank.bank_address,
            salary_payment_mode: this.employeeDetailsObj.bank.salary_payment_mode
          },
          salary: {
            total_fixed: Number(this.employeeDetailsObj.salary.total_fixed),
            remarks: this.employeeDetailsObj.salary.remarks,
            basic_salary: Number(this.employeeDetailsObj.salary.basic_salary),
            food_allowance: Number(this.employeeDetailsObj.salary.food_allowance),
            petrol_allowance: Number(this.employeeDetailsObj.salary.petrol_allowance),
            other_allowance: Number(this.employeeDetailsObj.salary.other_allowance),
            housing_allowance: Number(this.employeeDetailsObj.salary.housing_allowance),
            transportation_allowance: Number(this.employeeDetailsObj.salary.transportation_allowance)
          },
          personal: this.employeeDetailsObj.personal,
          first_name: this.employeeDetailsObj.first_name,
          middle_name: this.employeeDetailsObj.middle_name,
          last_name: this.employeeDetailsObj.last_name,
          dob: this.employeeDetailsObj.personal.dob,
          date_of_joining: this.employeeDetailsObj.employment.date_of_joining,
          probation_period: this.employeeDetailsObj.employment.probation_period,
          probation_period_end: this.employeeDetailsObj.probation_period_end,
          contract_type: this.employeeDetailsObj.employment.contract_type,
          cost_center: this.employeeDetailsObj.cost_center,
        }
        await this.$axios.$post(`/users`, obj, { headers: { Authorization: AuthStr } })
          .then((res) => {
            this.AddEmployeeLoading = false
            this.close()
            this.$emit('employee-created')
          })


      }
    },
    getOrdinalSuffix(day) {
      if (day >= 11 && day <= 13) return 'ᵗʰ'
      const lastDigit = day % 10
      switch (lastDigit) {
        case 1:
          return 'ˢᵗ'
        case 2:
          return 'ⁿᵈ'
        case 3:
          return 'ʳᵈ'
        default:
          return 'ᵗʰ'
      }
    },
    updatePayrollDateDisplay(field) {
      if (field === 'invoice_date') {
        this.employeeDetailsObj.payroll_details.invoice_date = {
          value: this.selectedInvoiceDay,
          display: this.formatDayWithDisplay(this.selectedInvoiceDay)
        }
      } else if (field === 'payment_due_notification') {
        this.employeeDetailsObj.payroll_details.payment_due_notification = {
          value: this.selectedPaymentDueDay,
          display: this.formatDayWithDisplay(this.selectedPaymentDueDay)
        }
      } else if (field === 'salary_payment_date') {
        this.employeeDetailsObj.payroll_details.salary_payment_date = {
          value: this.selectedSalaryDay,
          display: this.formatDayWithDisplay(this.selectedSalaryDay)
        }
      }
    },
    formatDayWithDisplay(day) {
      if (!day) return ''
      return day + this.getOrdinalSuffix(parseInt(day)) + ' of each month'
    },
    updateTotal() {
      let total = 0;
      this.fixed.forEach(element => {
        const key = element.toLowerCase().replace(/\s/g, '_');
        total += parseFloat(this.employeeDetailsObj.salary[key]) || 0;
      });
      this.employeeDetailsObj.salary.total_fixed = total.toString();
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
      if (val === 'uploadDoc') this.uploadFile = ''
      this.filename_attach = []
    },
    createFile(e, files, type) {
      if (files[0].size > 10000000) {
        alert('Please check file size is not more than 10 MB.')
        this.dragging = false
        return
      }
      this.onUploadFiles(files)
      if (type === 'uploadDoc') this.uploadFile = files[0]
      this.dragging = false
    },
    onUploadFiles(files) {
      this.uploadFiles = files
      this.dragging = false
      this.filename_attach = []
      for (let i = 0; i < files.length; i++) {
        this.filename_attach.push(files[i].name)
      }
    },
    async attachFile() {
      try {
        this.uploading = true
        let attach = {}
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        for (var key in this.attachFiles) {
          if (!_.isEmpty(this.attachFiles[key])) {
            for (let i = 0; i < this.attachFiles[key].length; i++) {
              if (this.attachFiles[key][i].name) {
                attach.file = this.attachFiles[key][i]
              }
            }
          }
          this.removeFile(key)
        }

        if (!attach.file) {
          this.uploading = false
          return
        }

        const fd = new FormData()
        fd.append('documents', attach.file)

        const response = await this.$axios.$post(
          `/documents/simpleupload`,
          fd,
          { headers: { Authorization: AuthStr } }
        )

        if (response && response.length > 0) {
          this.employeeDetailsObj.image_url = response[0]
          this.uploadPicture = false
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Profile picture uploaded successfully'
        }
      } catch (error) {
        this.snack = true
        this.snackColor = 'error'
        this.snackText = 'Failed to upload profile picture'
      } finally {
        this.uploading = false
      }
    },
    handleInternalDesignationInput(value) {
      // Clear any existing timeout
      if (this.designationTimeout) {
        clearTimeout(this.designationTimeout);
      }

      // Set a new timeout to show the alert after typing stops
      this.designationTimeout = setTimeout(() => {
        if (value && value.trim().toLowerCase() === 'pro') {
          // Format the value to uppercase and remove trailing spaces
          this.employeeDetailsObj.employment.designation = value.trim().toUpperCase();
          // Show the alert
          this.showProAlert = true;
        }
      }, 500); // 500ms delay after typing stops
    },
    handleProNotificationDismiss() {
      this.showProAlert = false;
    },
    updateContractDuration() {
      const duration = this.contractDuration
      if (duration) {
        this.employeeDetailsObj.employment.contract_duration = duration
        // Force validation to update
        this.$nextTick(() => {
          this.$refs.onboardingForm.validate()
        })
      }
    },
    // Handle the change of Internal Team dropdown
    onInternalTeamChange(value) {
      // Save the new value, show modal, don't update is_internal_staff yet
      this.pendingInternalTeam = value;
      this.showInternalTeamModal = true;
    },
    confirmInternalTeamChange() {
      // Only update is_internal_staff if user confirms
      this.is_internal_staff = this.pendingInternalTeam === 'Yes';
      this.internalTeam = this.pendingInternalTeam;
      this.showInternalTeamModal = false;
      this.pendingInternalTeam = null;
    },
    cancelInternalTeamChange() {
      // Revert dropdown to previous value
      this.internalTeam = this.is_internal_staff ? 'Yes' : 'No';
      this.showInternalTeamModal = false;
      this.pendingInternalTeam = null;
    },
  },
  computed: {
    computeNationalities() {
      var data = require('i18n-nationality')
      data.registerLocale(require('i18n-nationality/langs/en.json'))
      const nationalityNames = data.getNames('en')
      const updatedNationalities = Object.values(nationalityNames).sort(function(a, b) {
        var textA = a.toUpperCase()
        var textB = b.toUpperCase()
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
      })
      return updatedNationalities
    },

    countryList() {
      const countryCodes = Object.keys(countries.countries)
      const countryNames = countryCodes.map(code => countries.countries[code].name)
      return countryNames
    },
    computedSalaries() {
      let arr = [];
      const salaryMapping = {
        'Basic Salary': 'basic_salary',
        'House Allowance': 'housing_allowance',
        'Transportation Allowance': 'transportation_allowance',
        'Food Allowance': 'food_allowance',
        'Petrol Allowance': 'petrol_allowance',
        'Other Allowance': 'other_allowance'
      };

      this.fixed.forEach((element) => {
        const key = salaryMapping[element];
        const storedValue = this.employeeDetailsObj.salary[key];
        const numValue = !isNaN(parseFloat(storedValue)) ? parseFloat(storedValue) : 0;

        let obj = {
          name: element,
          key: key,
          value: numValue
        };
        arr.push(obj);
      });
      return arr;
    },
    computedTotalSalary() {
      let total = 0;
      const salaryKeys = [
        'basic_salary',
        'housing_allowance',
        'transportation_allowance',
        'food_allowance',
        'petrol_allowance',
        'other_allowance'
      ];

      salaryKeys.forEach(key => {
        total += parseFloat(this.employeeDetailsObj.salary[key]) || 0;
      });

      this.employeeDetailsObj.salary.total_fixed = total.toString();
      return total.toString();
    },
    contractDuration() {
      const dateOfJoining = this.employeeDetailsObj.employment.date_of_joining
      const endDate = this.employeeDetailsObj.employment.end_date
      if (dateOfJoining && endDate) {
        const start = new Date(dateOfJoining)
        const end = new Date(endDate)

        // Ensure dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return ''
        }

        // Ensure end date is after start date
        if (end < start) {
          return ''
        }

        const months = (end.getFullYear() - start.getFullYear()) * 12 +
                      (end.getMonth() - start.getMonth())
        const years = Math.floor(months / 12)
        const remainingMonths = months % 12

        let duration = ''
        if (years > 0) {
          duration += `${years} Year${years > 1 ? 's' : ''}`
        }
        if (remainingMonths > 0) {
          if (duration) duration += ' '
          duration += `${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`
        }
        return duration || '0 Months' // Return '0 Months' if duration is empty
      }
      return ''
    },
    minExpectedDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    }
  },
  watch: {
    'employeeDetailsObj.salary': {
      handler(newSalary) {
        // Calculate total whenever any salary component changes
        let total = 0;
        this.fixed.forEach(element => {
          const key = element.toLowerCase().replace(/\s/g, '_');
          total += parseFloat(newSalary[key]) || 0;
        });
        this.employeeDetailsObj.salary.total_fixed = total.toString();
      },
      deep: true,
      immediate: true
    },
    'employeeDetailsObj.employment.date_of_joining': {
      handler() {
        this.updateContractDuration()
      },
      immediate: true
    },
    'employeeDetailsObj.employment.end_date': {
      handler() {
        this.updateContractDuration()
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
/* Add any custom styles that can't be handled by Tailwind */
.v-card {
  @apply tw-overflow-hidden;
}

.v-text-field {
  @apply tw-transition-all tw-duration-200;
}

.v-text-field:hover {
  @apply tw-shadow-sm;
}

.v-text-field:focus-within {
  @apply tw-shadow-md;
}

.v-select {
  @apply tw-transition-all tw-duration-200;
}

.v-select:hover {
  @apply tw-shadow-sm;
}

.v-select:focus-within {
  @apply tw-shadow-md;
}

/* Custom styling for phone fields */
.phone-field-container {
  @apply tw-flex tw-gap-2 tw-items-center;
}

.country-code-selector {
  @apply tw-w-32;
}

.phone-input {
  @apply tw-flex-1;
}

/* Section headers */
.section-header {
  @apply tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-pb-2 tw-border-b tw-border-gray-200;
}

/* Form sections */
.form-section {
  @apply tw-mb-8 tw-p-4 tw-bg-white tw-rounded-lg tw-shadow-sm;
}

/* Input containers */
.input-container {
  @apply tw-mb-4;
}

/* Required field indicator */
.required-field::after {
  content: '*';
  @apply tw-text-red-500 tw-ml-1;
}

.dropZone {
  width: 220px;
  height: 80px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
  @apply tw-transition-all tw-duration-200;
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

.customer_icon {
  @apply tw-relative tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-mb-6;
}

.edit_btn {
  @apply tw-absolute tw-right-4 tw-top-4 tw-bg-white tw-shadow-sm hover:tw-shadow-md tw-transition-shadow tw-duration-200;
}

/* Fix dropdown styling */
.v-select {
  @apply tw-bg-white;
}

.v-select ::v-deep .v-select__selections {
  @apply tw-px-2;
}

.v-select ::v-deep .v-select__selection {
  @apply tw-m-0;
}

.v-select ::v-deep .v-input__append-inner {
  @apply tw-mt-1;
}

.v-select ::v-deep .v-menu__content {
  @apply tw-rounded-md tw-shadow-lg tw-border tw-border-gray-200;
}

.v-select ::v-deep .v-list-item {
  @apply tw-py-2 tw-px-4;
}

.v-select ::v-deep .v-list-item:hover {
  @apply tw-bg-gray-50;
}

.v-select ::v-deep .v-list-item--active {
  @apply tw-bg-blue-600 tw-text-white;
}

/* Fix dialog styling */
.v-dialog {
  @apply tw-rounded-lg tw-overflow-hidden;
}

.v-dialog ::v-deep .v-card {
  @apply tw-shadow-xl;
}

/* Fix dropzone styling */
.dropZone {
  @apply tw-bg-white tw-rounded-lg tw-border-2 tw-border-dashed tw-border-gray-300 hover:tw-border-blue-500 tw-transition-colors tw-duration-200;
}

.dropZone-over {
  @apply tw-bg-gray-50 tw-border-blue-500;
}

.dropZone-title {
  @apply tw-text-gray-600 tw-font-medium;
}

.dropZone-upload-limit-info {
  @apply tw-text-gray-500 tw-text-sm tw-mt-1;
}

.btn-primary {
  @apply tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-blue-700 tw-transition-colors tw-duration-200;
}

/* Fix snackbar styling */
.v-snack {
  @apply tw-rounded-lg;
}

.v-snack ::v-deep .v-snack__wrapper {
  @apply tw-rounded-lg;
}

.v-snack__wrapper {
  border-radius: 0.5rem !important;
}
</style>
