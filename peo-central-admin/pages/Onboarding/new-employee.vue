<template>
  <div>
    <v-card id="card" style="margin-bottom: 1rem !important">
      <v-tabs
        v-model="activeTab"
        background-color="transparent"
        color="primary"
        class="tw-border-b tw-border-gray-200 mb-4"
      >
        <v-tab class="tw-font-medium">Manual Entry</v-tab>
        <v-tab class="tw-font-medium">Bulk Upload</v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab">
        <v-tab-item>
          <v-container fluid v-if="step == 1">
            <v-card-title id="card-title" class="mb-4">
              <h4 class="text--text">Create New Employee</h4>
              <div class="flex_row justify-lg-space-between">
                <v-btn
                  class="tall__btn mr-2"
                  color="lightgray"
                  :disabled="loading"
                  outlined
                  @click="closeLead"
                  >Cancel</v-btn
                >
                <v-img
                  src="/animated/ring.svg"
                  v-if="loading"
                  width="40px"
                  height="40px"
                  contain
                  class=""
                />
                <v-btn
                  class="tall__btn"
                  color="primary"
                  v-else-if="loading === false && status === 'manual'"
                  @click.prevent="createNewOnboarding()"
                  >Create</v-btn
                >
              </div>
            </v-card-title>
            <v-col cols="6" class="d-flex align-center" flat>
              <v-radio-group v-if="!$route.query.token" v-model="status" row>
                <v-radio label="Fill in Manually" value="manual" class="mr-2" />
                <v-radio label="Generate Link" value="link" class="mr-2" />
              </v-radio-group>
            </v-col>
            <v-form ref="onboardingForm" v-if="status === 'manual'">
              <v-row class="mb-2">
                <!-- Company Name -->
                <v-col
                  cols="12"
                  md="3"
                  class="px-0 py-0"
                  style="height: fit-content"
                >
                  <v-row>
                    <v-col cols="12" class="py-0 pl-0 pr-12">
                      <CustomInputContainer label="Company Name" :mandatory="true">
                        <div slot="input">
                          <v-select
                            :disabled="
                              ['isSuperAdmin'].includes(
                                $store.getters.getThisUserRole
                              )
                                ? false
                                : true
                            "
                            :items="employers"
                            placeholder="Select Company"
                            dense
                            v-model="onboardingUser.company_id"
                            item-text="company_name"
                            item-value="_id"
                            class="proposalDialog_date_field2"
                            append-icon="fa-chevron-down"
                            @change="getCompanyDetails(onboardingUser.company_id)"
                            outlined
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-col>
                <!-- Visa Issuance Authority -->
                <v-col
                  cols="12"
                  md="3"
                  class="px-0 py-0"
                  style="height: fit-content"
                >
                  <v-row>
                    <v-col cols="12" class="py-0 pl-0 pr-12">
                      <CustomInputContainer
                        label="Visa Issuance Authority"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-select
                            :items="[
                              'Dynamic Employment Services',
                              'Executive Employment Services',
                            ]"
                            placeholder="Select Visa Issuance Authority"
                            dense
                            v-model="onboardingUser.employment.visa_sponsor_type"
                            class="proposalDialog_date_field2"
                            append-icon="fa-chevron-down"
                            outlined
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-col>
                <!-- Employment Type -->
                <v-col
                  cols="12"
                  md="3"
                  class="px-0 py-0"
                  style="height: fit-content"
                >
                  <v-row>
                    <v-col cols="12" class="py-0 pl-0 pr-12">
                      <CustomInputContainer
                        label="Employment Type"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-select
                            :items="[
                              'Mission Visa (3 Months Single Entry)',
                              'Work Permit (for UAE Resident visa holders)',
                              'Employment Visa (2-Year)',
                            ]"
                            placeholder="Employment Type"
                            v-model="onboardingUser.employment.employment_type"
                            class="proposalDialog_date_field2"
                            dense
                            append-icon="fa-chevron-down"
                            outlined
                            :rules="main_rule"
                            @change="changeEmploymentType()"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-col>
                <!-- Current Location -->
                <v-col
                  cols="12"
                  md="3"
                  class="px-0 py-0"
                  style="height: fit-content"
                >
                  <v-row>
                    <v-col cols="12" class="py-0 pl-0 pr-12">
                      <CustomInputContainer
                        label="Current Location"
                        :mandatory="true"
                      >
                        <div slot="input">
                          <v-select
                            :items="['Inside UAE', 'Outside UAE']"
                            placeholder="Current Location"
                            v-model="onboardingUser.user_location"
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
                <!-- Employee Profile -->
                <v-col cols="12" class="py-0 px-0">
                  <div class="mb-6 d-flex align-center customer_icon">
                    <v-avatar class="" size="90px">
                      <v-avatar size="90">
                        <v-img
                          alt="Avatar"
                          style="border-radius: 50px"
                          width="60"
                          height="60"
                          :src="onboardingUser.image_url"
                          v-if="onboardingUser.image_url"
                        />
                        <customerDefaultIcon v-else style="border-radius: 50px" />
                      </v-avatar>
                    </v-avatar>
                    <div>
                      <h4 class="ml-5">
                        {{ onboardingUser.first_name }}
                        {{ onboardingUser.middle_name }}
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
                        <v-icon small>fa-solid fa-pencil</v-icon>
                      </v-btn>
                    </template>
                  </div>
                </v-col>
                <!-- Employee Personal Details -->
                <v-col cols="12" class="py-0 px-0">
                  <span class="span_leadHeading">PERSONAL DETAILS</span>
                </v-col>
                <v-col cols="12" class="py-0 px-0">
                  <v-row class="">
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="First Name" :mandatory="true">
                        <div slot="input">
                          <v-text-field
                            v-model="onboardingUser.first_name"
                            placeholder="Add name"
                            class="proposalDialog_date_field2"
                            dense
                            outlined
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Middle Name">
                        <div slot="input">
                          <v-text-field
                            v-model="onboardingUser.middle_name"
                            placeholder="Add name"
                            class="proposalDialog_date_field2"
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Last Name" :mandatory="true">
                        <div slot="input">
                          <v-text-field
                            v-model="onboardingUser.last_name"
                            placeholder="Add name"
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
                <v-col cols="12" class="py-0 px-0">
                  <v-row class="">
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Email Address" :mandatory="true">
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
                   <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                    <CustomInputContainer label="Date Of Birth" :mandatory="true">
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
                              placeholder="Enter Date Of Birth"
                              class="proposalDialog_date_field2"
                              dense
                              outlined
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              :rules="main_rule"
                            >
                              <template #append>
                                <div><CalenderSvg /></div>
                              </template>
                            </v-text-field>
                          </template>

                          <v-date-picker
                            v-model="onboardingUser.personal.dob"
                            @input="showDob = false"
                            scrollable
                            show-current
                            :min="minDate"
                            :max="maxDate"
                          >
                            <v-spacer />
                            <v-btn text @click="onboardingUser.personal.dob = new Date(); showDob = false">Today</v-btn>
                          </v-date-picker>
                        </v-menu>
                      </div>
                    </CustomInputContainer>
                  </v-col>

                    <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
                      <CustomInputContainer label="Phone Number" :mandatory="true">
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
                                :item-text="(item) => item.dialCode + item.country"
                                return-object
                                style="max-width: 150px"
                                dense
                                outlined
                                placeholder="Country Code"
                                v-model="phoneNumberText"
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
                            <v-col class="py-0" cols="12" sm="12" md="5">
                              <v-text-field
                                placeholder="Add phone number"
                                v-model="onboardingUser.personal.phone"
                                outlined
                                dense
                                :rules="phoneNumberRule"
                              />
                            </v-col>
                          </v-row>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" class="py-0 px-0">
                  <v-row class="">
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Role" :mandatory="true">
                        <div slot="input">
                          <v-select
                            readonly
                            :items="roles"
                            item-text="role_name"
                            item-value="id"
                            placeholder="Select Role"
                            v-model="onboardingUser.role_ID"
                            class="proposalDialog_date_field2"
                            dense
                            append-icon="fa-chevron-down"
                            outlined
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Nationality" :mandatory="true">
                        <div slot="input">
                          <v-select
                            :items="computeNationalities"
                            placeholder="Select Nationality"
                            v-model="onboardingUser.personal.nationality"
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
                <!-- Employment Details -->
                <v-col cols="12" class="py-0 px-0">
                  <span class="span_leadHeading">EMPLOYMENT DETAILS</span>
                </v-col>
                <v-col cols="12" class="py-0 px-0">
                  <v-row class="">
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Designation">
                        <div slot="input">
                          <v-text-field
                            v-model="onboardingUser.employment.designation"
                            placeholder="Add designation."
                            class="proposalDialog_date_field2"
                            outlined
                            dense
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Date of Joining">
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
                                class="proposalDialog_date_field2"
                                dense
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              >
                                <template #append>
                                  <div class=""><CalenderSvg /></div>
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
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Expected Arrival Date">
                        <div slot="input">
                          <v-menu
                            v-model="date_menu2"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="auto"
                          >
                            <template #activator="{ on, attrs }">
                              <v-text-field
                                v-model="onboardingUser.employment.expected_arrival"
                                placeholder="Enter Date"
                                class="proposalDialog_date_field2"
                                dense
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              >
                                <template #append>
                                  <div class=""><CalenderSvg /></div>
                                </template>
                              </v-text-field>
                            </template>
                            <v-date-picker
                              v-model="onboardingUser.employment.expected_arrival"
                              @input="date_menu2 = false"
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
                      v-if="
                        onboardingUser.employment.employment_type &&
                        !onboardingUser.employment.employment_type.includes(
                          'Mission Visa'
                        )
                      "
                    >
                      <CustomInputContainer label="Probation Period">
                        <div slot="input">
                          <v-autocomplete
                            placeholder="Add Probation Period"
                            :items="[
                              '0 Months',
                              '1 Month',
                              '2 Months',
                              '3 Months',
                              '4 Months',
                              '5 Months',
                              '6 Months',
                            ]"
                            v-model="onboardingUser.employment.probation_period"
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
                <v-col cols="12" class="py-0 px-0">
                  <v-row class="">
                    <v-col
                      cols="12"
                      md="3"
                      lg="3"
                      class="pl-0 pr-12"
                      v-if="
                        onboardingUser.employment.employment_type &&
                        !onboardingUser.employment.employment_type.includes(
                          'Mission Visa'
                        )
                      "
                    >
                      <CustomInputContainer label="Notice Period">
                        <div slot="input">
                          <v-autocomplete
                            placeholder="Add notice period"
                            :items="['1 Month', '2 Months', '3 Months']"
                            v-model="onboardingUser.employment.notice_period"
                            dense
                            append-icon="fa-chevron-down"
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
                      v-if="
                        onboardingUser.employment.employment_type &&
                        !onboardingUser.employment.employment_type.includes(
                          'Mission Visa'
                        )
                      "
                    >
                      <CustomInputContainer label="Working Days">
                        <div slot="input">
                          <v-autocomplete
                            placeholder="Add Working days"
                            :items="['5 Working Days', '6 Working Day']"
                            v-model="onboardingUser.employment.working_days"
                            dense
                            append-icon="fa-chevron-down"
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
                      v-if="
                        onboardingUser.employment.employment_type &&
                        !onboardingUser.employment.employment_type.includes(
                          'Mission Visa'
                        )
                      "
                    >
                      <CustomInputContainer label="Working Hours">
                        <div slot="input">
                          <v-text-field
                            v-model="onboardingUser.employment.working_hours"
                            readonly
                            placeholder="9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)"
                            dense
                            outlined
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Contract Type" :mandatory="true">
                        <div slot="input">
                          <v-select
                            :disabled="lock"
                            :items="['Full Time', 'Temporary']"
                            item-text="name"
                            placeholder="Add Contract Type"
                            v-model="onboardingUser.employment.contract_type"
                            class="proposalDialog_date_field2"
                            dense
                            append-icon="fa-chevron-down"
                            outlined
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
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
                                v-model="onboardingUser.employment.end_date"
                                placeholder="Enter End of Contract Date"
                                class="proposalDialog_date_field2"
                                dense
                                outlined
                                v-bind="attrs"
                                v-on="on"
                              >
                                <template #append>
                                  <div class=""><CalenderSvg /></div>
                                </template>
                              </v-text-field>
                            </template>
                            <v-date-picker
                              v-model="onboardingUser.employment.end_date"
                              @input="end_date_menu = false"
                              :min="minExpectedDate"
                            />
                          </v-menu>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-col>
                <!-- Compensations -->
                <v-col cols="12" class="py-0 px-0">
                  <span class="span_leadHeading">SALARY DETAILS</span>
                </v-col>
                <v-col cols="12" class="py-0 px-0">
                  <v-row class="">
                    <v-col
                      v-for="(salary, key) in computedSalaries"
                      :key="key"
                      cols="12"
                      md="3"
                      lg="3"
                      class="pl-0 pr-12"
                    >
                      <CustomInputContainer :label="salary.name">
                        <div slot="input">
                          <v-text-field
                            v-model.number="salary.value"
                            :placeholder="`${salary.name}`"
                            class="proposalDialog_date_field2"
                            outlined
                            dense
                            :rules="salaryRule"
                            @focus="$event.target.select()"
                            prefix="AED"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Total Salary">
                        <div slot="input">
                          <v-text-field
                            v-model="salary.total_fixed"
                            :placeholder="`${computedTotalSalary}`"
                            class="proposalDialog_date_field2"
                            outlined
                            dense
                            readonly
                            prefix="AED"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer label="Remarks">
                        <div slot="input">
                          <v-text-field
                            v-model="salary.remarks"
                            placeholder="Enter remarks"
                            class="proposalDialog_date_field2"
                            outlined
                            dense
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-col>
                <!-- Payroll Schedule -->
                <v-col cols="12" class="py-0 px-0">
                  <span class="span_leadHeading">PAYROLL SCHEDULE</span>
                </v-col>
                <v-col cols="12" class="py-0 px-0">
                  <v-row class="">
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer
                        label="Invoice Date"
                        v-if="
                          onboardingUser.payroll_details
                            .follow_different_payroll_schedule
                        "
                      >
                        <div slot="input">
                          <v-select
                            v-model="selectedInvoiceDay"
                            :items="dayOptions"
                            item-text="display"
                            item-value="value"
                            placeholder="Select Day of Month"
                            class="proposalDialog_date_field2"
                            dense
                            hide-details
                            outlined
                            :rules="
                              onboardingUser.payroll_details
                                .follow_different_payroll_schedule
                                ? main_rule
                                : []
                            "
                            @change="updatePayrollDateDisplay('invoice_date')"
                          />
                        </div>
                      </CustomInputContainer>
                      <CustomInputContainer label="Invoice Date" v-else>
                        <div slot="input">
                          <v-text-field
                            disabled
                            v-model="companyPayrollDisplay.invoice_date"
                            placeholder="Company Default"
                            outlined
                            class="proposalDialog_date_field2"
                            dense
                            hide-details
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer
                        label="Payment Due Date"
                        v-if="
                          onboardingUser.payroll_details
                            .follow_different_payroll_schedule
                        "
                      >
                        <div slot="input">
                          <v-select
                            v-model="selectedPaymentDueDay"
                            :items="dayOptions"
                            item-text="display"
                            item-value="value"
                            placeholder="Select Day of Month"
                            class="proposalDialog_date_field2"
                            dense
                            hide-details
                            outlined
                            :rules="
                              onboardingUser.payroll_details
                                .follow_different_payroll_schedule
                                ? main_rule
                                : []
                            "
                            @change="
                              updatePayrollDateDisplay('payment_due_notification')
                            "
                          />
                        </div>
                      </CustomInputContainer>
                      <CustomInputContainer label="Payment Due Date" v-else>
                        <div slot="input">
                          <v-text-field
                            disabled
                            v-model="companyPayrollDisplay.payment_due_notification"
                            placeholder="Company Default"
                            outlined
                            class="proposalDialog_date_field2"
                            dense
                            hide-details
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
                      <CustomInputContainer
                        label="Salary Date"
                        v-if="
                          onboardingUser.payroll_details
                            .follow_different_payroll_schedule
                        "
                      >
                        <div slot="input">
                          <v-select
                            v-model="selectedSalaryDay"
                            :items="dayOptions"
                            item-text="display"
                            item-value="value"
                            placeholder="Select Day of Month"
                            class="proposalDialog_date_field2"
                            dense
                            hide-details
                            outlined
                            :rules="
                              onboardingUser.payroll_details
                                .follow_different_payroll_schedule
                                ? main_rule
                                : []
                            "
                            @change="
                              updatePayrollDateDisplay('salary_payment_date')
                            "
                          />
                        </div>
                      </CustomInputContainer>
                      <CustomInputContainer label="Salary Date" v-else>
                        <div slot="input">
                          <v-text-field
                            disabled
                            v-model="companyPayrollDisplay.salary_payment_date"
                            placeholder="Company Default"
                            outlined
                            class="proposalDialog_date_field2"
                            dense
                            hide-details
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" class="py-0 px-0">
                  <div style="max-width: 25% !important">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <v-checkbox @click="toggleCustomPayrollSchedule" />
                      <div class="tw-text-md tw-mb-4">
                        Follow Different Payroll Schedule
                      </div>
                    </div>
                  </div>
                </v-col>
                <!-- Dependent Details -->
                <v-col cols="12" class="py-0 px-0">
                  <span class="span_leadHeading">DEPENDENT DETAILS</span>
                </v-col>
                <v-col cols="12">
                  <v-simple-table dense class="dynamic_table">
                    <template #default>
                      <thead class="dynamic_table_thead">
                        <tr class="" style="height: 35px !important">
                          <th
                            v-for="item in table_headers"
                            :key="item"
                            class="text-center text--text font-weight-bold"
                            style="
                              font-size: 12px !important;
                              font-weight: 500 !important;
                            "
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
                              placeholder="Enter Dependent Name"
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
                              placeholder="Enter Dependent Relation"
                              solo
                              flat
                              hide-details
                              dense
                              v-model="item.relation"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-btn
                              :disabled="
                                onboardingUser.dependent_details.length == 1
                              "
                              icon
                              color="error"
                              class="mx-3 text-center"
                              @click="handleDeleteProduct(index)"
                            >
                              <v-icon class="" color="error" x-small
                                >fa-light fa-trash-can</v-icon
                              >
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
                      <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
                      <span class="text--text">Add Dependents</span>
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <v-container fluid v-if="step == 2 && this.$auth.loggedIn">
            <v-card-title id="card-title" class="mb-4">
              <h4 class="text--text">Upload Employee Documents</h4>
              <div class="flex_row justify-lg-space-between">
                <v-btn class="tall__btn" color="primary" @click.prevent="complete()"
                  >Complete</v-btn
                >
              </div>
            </v-card-title>
            <EmployeeDocument
              :employee-details="createdUser"
              :allowed-types="[
                'passport',
                'passportsizephoto',
                'academiccertificate',
                'entrystamp',
                'previousemploymentvisa',
                'visacancellation',
                'otherdocuments',
              ]"
            />
          </v-container>
          <v-container
            fluid
            v-if="step == 2 && !this.$auth.loggedIn"
            class="d-flex justify-center align-center"
          >
            <v-card-title id="card-title" class="mb-4 text-center">
              <h4 class="text--text">{{ onboardViaLinkMessage }}</h4>
            </v-card-title>
          </v-container>
          <v-dialog v-model="uploadPicture" max-width="600">
            <v-card max-width="600" style="overflow-x: hidden">
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
                  <div class="pt-2" v-if="!uploadFile">
                    <div
                      :class="['dropZone', dragging ? 'dropZone-over' : '']"
                      @dragenter="dragging = true"
                      @dragleave="dragging = false"
                    >
                      <div class="dropZone-info" @drag="onUploadFile">
                        <span class="dropZone-title"
                          >Drop file or click to upload</span
                        >
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
                  <v-btn color="grey" text @click="uploadPicture = false"
                    >Close</v-btn
                  >
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
                    >Upload Profile</v-btn
                  >
                </v-col>
              </v-row>
            </v-card>
          </v-dialog>
          <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}
            <template #action="{ attrs }">
              <v-btn v-bind="attrs" text @click="snack = false" small
                ><v-icon>mdi-close</v-icon></v-btn
              >
            </template>
          </v-snackbar>
          <SendMailDialog
            v-if="sendEmailDialog"
            :email-body="emailBody"
            @successfull="handleSuccessEmail"
            @error="handleFailedEmail($event)"
            :is-loading="!emailBody.content"
            @close="closeEmailDialog"
          />
          <v-row v-if="status === 'link'" class="d-flex align-items-center">
            <v-col cols="6" class="py-0 pl-0 pr-12">
              <CustomInputContainer label="Company Name" :mandatory="true">
                <div slot="input">
                  <v-select
                    :disabled="
                      $route.query?.token ||
                      !['isSuperAdmin'].includes($store.getters.getThisUserRole)
                    "
                    :items="employers"
                    placeholder="Select Company"
                    dense
                    v-model="onboardingUser.company_id"
                    item-text="company_name"
                    item-value="_id"
                    class="proposalDialog_date_field2"
                    append-icon="fas fa-chevron-down"
                    @change="getCompanyDetails(onboardingUser.company_id)"
                    outlined
                    :rules="[main_rule]"
                  />
                </div>
              </CustomInputContainer>
              <v-btn
                class="tall__btn"
                color="primary"
                @click.prevent="createOnboardingLink()"
                >Generate Link</v-btn
              >
            </v-col>
          </v-row>
        </v-tab-item>
        <v-tab-item>
          <div class="tw-p-6">
            <div class="tw-text-center tw-mb-6">
              <v-icon size="64" color="primary" class="tw-mb-4"
                >mdi-upload-multiple</v-icon
              >
              <h3 class="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">
                Bulk Upload Onboardings
              </h3>
              <p class="tw-text-gray-600">
                Upload multiple onboardings at once using an Excel file
              </p>
              <div v-if="bulkUploadErrors.length"
                   class="tw-bg-red-50 tw-border tw-border-red-400 tw-text-red-800 tw-p-4 tw-rounded tw-mb-4 tw-animate-fade-in"
                   style="transition: opacity 0.5s;">
                <strong>Some rows could not be processed:</strong>
                <ul class="tw-list-disc tw-ml-6">
                  <li v-for="(err, idx) in bulkUploadErrors" :key="idx">
                    Row {{ err.row }} ({{ err.email }}, {{ err.company }}): <span class="tw-font-semibold">{{ err.error }}</span>
                  </li>
                </ul>
              </div>
              <div v-if="bulkUploadRowError"
                   class="tw-text-red-700 tw-bg-red-100 tw-p-2 tw-rounded tw-mb-2 tw-font-semibold tw-text-sm tw-animate-fade-in"
                   style="transition: opacity 0.5s;">
                {{ bulkUploadRowError }}
              </div>
            </div>
            <div class="tw-bg-blue-50 tw-rounded-lg tw-p-4 tw-mb-6">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div>
                  <h4 class="tw-font-semibold tw-text-blue-900 tw-mb-1">
                    Download Template
                  </h4>
                  <p class="tw-text-blue-700 tw-text-sm">
                    Get the Excel template with the correct format for bulk
                    onboarding upload
                  </p>
                </div>
                <v-btn
                  color="primary"
                  outlined
                  @click="downloadOnboardingTemplate"
                  class="tw-rounded-lg"
                >
                  <v-icon left>mdi-download</v-icon>
                  Download Template
                </v-btn>
              </div>
            </div>
            <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6 tw-border-2 tw-border-dashed tw-border-gray-300">
              <div class="tw-text-center">
                <v-icon size="48" color="gray" class="tw-mb-4"
                  >mdi-file-excel</v-icon
                >
                <h4 class="tw-font-semibold tw-text-gray-900 tw-mb-2">
                  Upload Excel File
                </h4>
                <p class="tw-text-gray-600 tw-mb-4">
                  Drag and drop your Excel file here or click to browse
                </p>
                <v-file-input
                  v-model="bulkUploadFile"
                  accept=".xlsx,.xls"
                  label="Choose Excel file"
                  prepend-icon="mdi-file-excel"
                  outlined
                  class="tw-max-w-md tw-mx-auto"
                  :rules="[v => !!v || 'Please select an Excel file']"
                  @change="handleBulkFileChange"
                ></v-file-input>
                <div v-if="bulkUploadFile" class="tw-mt-4">
                  <v-btn
                    color="primary"
                    :loading="uploadingBulk"
                    :disabled="uploadingBulk"
                    @click="uploadBulkOnboardings"
                    class="tw-rounded-lg"
                  >
                    <v-icon left>mdi-upload</v-icon>
                    Upload Onboardings
                  </v-btn>
                </div>
              </div>
            </div>
            <div class="tw-mt-6 tw-bg-yellow-50 tw-rounded-lg tw-p-4">
              <h4 class="tw-font-semibold tw-text-yellow-900 tw-mb-2 tw-flex tw-items-center">
                <v-icon small class="tw-mr-2">mdi-information</v-icon>
                Instructions
              </h4>
              <ul class="tw-text-yellow-800 tw-text-sm tw-space-y-1">
                <li>• Download the template first to ensure correct format</li>
                <li>• Fill in all required fields marked with asterisk (*)</li>
                <li>• Save the file as .xlsx or .xls format</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Maximum 1000 onboardings per upload</li>
              </ul>
            </div>
          </div>
        </v-tab-item>
      </v-tabs-items>
      <v-snackbar v-model="bulkSnack" :timeout="3000" :color="bulkSnackColor">
        {{ bulkSnackText }}
        <template v-slot:action="{ attrs }">
          <v-btn v-bind="attrs" text @click="bulkSnack = false" small>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.success ? 'success' : 'red'"
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="snackbar.show = false"
          >Close</v-btn
        >
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import '@/assets/scss/utils/_newLead.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import countryFlagsDialCode from 'country-flags-dial-code'
import EmployeeDocument from './employeeDocument.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import SendMailDialog from '~/components/Dialogs/sendMail-dialog.vue'
import jwtDecode from 'jwt-decode'

export default {
  layout: 'dashboard',
  components: {
    SendMailDialog,
    CustomInputContainer,
    SnackBar,
    CalenderSvg,
    customerDefaultIcon,
    EmployeeDocument,
  },
  data() {
    return {
      selectedInvoiceDay: '',
      selectedPaymentDueDay: '',
      selectedSalaryDay: '',
      companyPayrollDisplay: {
        invoice_date: '',
        payment_due_notification: '',
        salary_payment_date: '',
      },
      dayOptions: Array.from({ length: 31 }, (_, i) => {
        const day = i + 1
        return {
          value: day.toString(),
          display:
            day.toString() + this.getOrdinalSuffix(day) + ' of each month',
        }
      }),
      insuranceAgents: [],
      createdUser: [],
      step: 1,
      lock: false,
      snackbar: {
        show: false,
        success: true,
        text: '',
      },
      countryList: countryFlagsDialCode.getCountryListMap(),
      countryCode: [],
      phoneNumberText: '',
      main_rule: [(v) => !!v || 'This field is required'],
      numberRule: [
        (value) =>
          (!isNaN(value) && value.length > 7) || 'Invalid phone number.',
      ],
      phoneNumberRule: [(value) => !isNaN(value) || 'Invalid phone number.'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      status: 'manual',
      emailBody: {},
      urlToken: '',
      comPage: 0,
      sendEmailDialog: false,
      onboardViaLinkMessage: '',
      onboardingUser: {
        personal: {},
        company_id: this.$store.getters.getSelectedCompany,
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        image_url: '',
        insurance_agent: null,
        assigned_insurance_agent: {
          id: '',
          full_name: '',
          email: '',
        },
        dob: '',
        place_of_registration: '',
        role_ID: '640f064bbe01c2e00bd95082',
        company_address: '',
        user_location: '',
        employment: {
          designation: '',
          date_of_joining: '',
          end_date: '',
          probation_period: '',
          notice_period: '',
          working_days: '',
          working_hours:
            '9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)',
          contract_duration: '',
          contract_type: '',
          employment_type: '',
          visa_sponsor_type: '',
        },
        salary: {
          total_fixed: '0',
          remarks: '',
        },
        payroll_details: {
          invoice_date: { display: '', value: '' },
          payment_due_notification: { display: '', value: '' },
          salary_payment_date: { display: '', value: '' },
          invoice_format: 'company-wise',
          follow_different_payroll_schedule: false,
        },
        dependent_details: [{ dependent_name: '', relation: '' }],
      },
      date_menu: false,
      date_menu1: false,
      date_menu2: false,
      end_date_menu: false,
      showDob: false,
      limit: '10',
      page: 0,
      comPag: 0,
      employers: [],
      roles: [],
      dependentObj: { dependent_name: '', relation: '' },
      uploadPicture: false,
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      link_url: '',
      link_filename: '',
      attachFiles: { uploadDoc: {}, ecard: {} },
      uploading: false,
      loading: false,
      companyDetails: [],
      table_headers: ['Dependent Name', 'Relation', 'Actions'],
      snack: false,
      snackText: '',
      snackColor: '',
      salary: { remarks: '' },
      total_salary: [],
      fixed: [
        'Basic Salary',
        'Housing/HRA Allowance',
        'Transportation/Car Allowance',
        'Food Allowance',
        'Mobile Allowance',
        'Petrol Allowance',
        'Other Allowance',
      ],
      salaryRule: [(value) => !isNaN(value) || 'Invalid'],
      activeTab: 0,
      bulkUploadFile: null,
      uploadingBulk: false,
      bulkSnack: false,
      bulkSnackText: '',
      bulkSnackColor: '',
      bulkUploadErrors: [],
      bulkUploadErrorTimeout: null,
      bulkUploadRowError: '',
      bulkUploadRowErrorTimeout: null,
    }
  },
  async mounted() {
    await Promise.all([
      this.getInsuranceAgent(),
      this.verifyUserIsAuthenticated(),
      this.getEmployersList(),
    ])
    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }
    if (this.$store.getters.getSelectedCompany) {
      await this.getCompanyDetails(this.$store.getters.getSelectedCompany)
    } else if (this.employers.length > 0) {
      await this.getCompanyDetails(this.employers[0]._id)
    }
  },
  methods: {
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
    formatDayWithDisplay(day) {
      if (!day) return ''
      return day + this.getOrdinalSuffix(parseInt(day)) + ' of each month'
    },
    updatePayrollDateDisplay(field) {
      if (field === 'invoice_date') {
        this.onboardingUser.payroll_details.invoice_date = {
          value: this.selectedInvoiceDay,
          display: this.formatDayWithDisplay(this.selectedInvoiceDay),
        }
      } else if (field === 'payment_due_notification') {
        this.onboardingUser.payroll_details.payment_due_notification = {
          value: this.selectedPaymentDueDay,
          display: this.formatDayWithDisplay(this.selectedPaymentDueDay),
        }
      } else if (field === 'salary_payment_date') {
        this.onboardingUser.payroll_details.salary_payment_date = {
          value: this.selectedSalaryDay,
          display: this.formatDayWithDisplay(this.selectedSalaryDay),
        }
      }
    },
    toggleCustomPayrollSchedule() {
      this.onboardingUser.payroll_details.follow_different_payroll_schedule =
        !this.onboardingUser.payroll_details.follow_different_payroll_schedule
      if (
        !this.onboardingUser.payroll_details.follow_different_payroll_schedule
      ) {
        this.selectedInvoiceDay = ''
        this.selectedPaymentDueDay = ''
        this.selectedSalaryDay = ''
        this.onboardingUser.payroll_details.invoice_date = {
          display: '',
          value: '',
        }
        this.onboardingUser.payroll_details.payment_due_notification = {
          display: '',
          value: '',
        }
        this.onboardingUser.payroll_details.salary_payment_date = {
          display: '',
          value: '',
        }
      }
    },
    parseDayValue(dayData) {
      if (!dayData) return ''
      if (typeof dayData === 'object' && dayData.value) return dayData.value
      if (typeof dayData === 'string') {
        const match = dayData.match(/Every\s+(\d+)/i)
        return match ? match[1] : ''
      }
      return ''
    },
    showMessage(content, success = true) {
      this.snackbar.show = true
      this.snackbar.success = success
      this.snackbar.text = content
    },
    handleSuccessEmail() {
      this.showMessage('Email Sent Successfully', true)
      this.closeEmailDialog()
    },
    handleFailedEmail(message) {
      this.showMessage(`Failed to send Email: ${message}`, false)
      this.closeEmailDialog()
    },
    changeEmploymentType() {
      let clonedUser = _.cloneDeep(this.onboardingUser)
      const selectedEmploymentType = clonedUser.employment.employment_type
      const selectedVisaSponsorType = clonedUser.employment.visa_sponsor_type
      this.onboardingUser = {
        personal: clonedUser.personal || {},
        company_id: clonedUser.company_id,
        first_name: clonedUser.first_name,
        middle_name: clonedUser.middle_name,
        last_name: clonedUser.last_name,
        email: clonedUser.email,
        phone: clonedUser.phone,
        image_url: clonedUser.image_url,
        dob: clonedUser.dob,
        place_of_registration: clonedUser.place_of_registration,
        role_ID: clonedUser.role_ID,
        company_address: clonedUser.company_address,
        user_location: clonedUser.user_location,
        employment: {
          ...clonedUser.employment,
          employment_type: selectedEmploymentType,
          visa_sponsor_type: selectedVisaSponsorType,
        },
        payroll_details: clonedUser.payroll_details,
        salary: clonedUser.salary,
        dependent_details: clonedUser.dependent_details,
        insurance_agent: clonedUser.insurance_agent,
        assigned_insurance_agent: clonedUser.assigned_insurance_agent,
      }
      if (
        this.onboardingUser.employment &&
        this.onboardingUser.employment.employment_type &&
        this.onboardingUser.employment.employment_type.includes('Mission Visa')
      ) {
        this.lock = true
        this.onboardingUser.employment.contract_type = 'Fixed Term'
      } else {
        this.lock = false
      }
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
        const config = {
          headers: {
            Authorization: AuthStr,
            'Content-Type': 'multipart/form-data',
          },
        }
        const response = await this.$axios.$post(
          `/documents/simpleupload`,
          fd,
          config
        )
        if (response) {
          this.onboardingUser.image_url = response[0]
          this.uploadPicture = false
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'File uploaded successfully'
        }
      } catch (error) {
        this.snack = true
        this.snackColor = 'error'
        this.snackText =
          'Failed to upload file: ' + (error.message || 'Unknown error')
      } finally {
        this.uploading = false
      }
    },
    closeLead() {
      this.$router.push('/onboarding')
    },
    async getEmployersList() {
      this.comPage++
      if (this.$auth.loggedIn) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        try {
          const response = await this.$axios.$post(
            `/companies/list/dropdown?page=${1}&limit=${10000}`,
            {},
            { headers: { Authorization: AuthStr } }
          )
          this.employers = response
        } catch (error) {
          this.employers = []
        }
      } else {
        this.employers = []
      }
    },
    async getInsuranceAgent() {
      this.comPage++
      if (this.$auth.loggedIn) {
        try {
          const response = await this.$axios.$get(
            `https://insurance-api.nathanhr.com/insurance/getinsuranceagents`,
            {
              headers: { 'x-api-key': '1b163c39ff6989bec2a0810a' },
            }
          )
          this.insuranceAgents = response.map((agent) => ({
            ...agent,
            full_name: `${agent.full_name}`,
          }))
        } catch (error) {
          this.insuranceAgents = []
        }
      } else {
        this.insuranceAgents = []
      }
    },
    async getRolesList() {
      if (this.$auth.loggedIn) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        try {
          const response = await this.$axios.$get('/roles/', {
            headers: { Authorization: AuthStr },
          })
          this.roles = response
        } catch (error) {
          this.roles = [
            {
              permissions: [],
              is_deleted: false,
              _id: '640f1c93be01c2e00bd95084',
              role_name: 'Super Admin',
              hierarchy: 7,
              id: '640f1c93be01c2e00bd95084',
            },
            {
              permissions: [],
              is_deleted: false,
              _id: '640f05febe01c2e00bd95080',
              role_name: 'Manager',
              hierarchy: 3,
              id: '640f05febe01c2e00bd95080',
            },
            {
              permissions: [],
              is_deleted: false,
              _id: '640f061bbe01c2e00bd95081',
              role_name: 'CEO',
              hierarchy: 4,
              id: '640f061bbe01c2e00bd95081',
            },
            {
              permissions: [],
              is_deleted: false,
              _id: '640f064bbe01c2e00bd95082',
              role_name: 'Employee',
              hierarchy: 5,
              id: '640f064bbe01c2e00bd95082',
            },
            {
              permissions: [],
              is_deleted: false,
              _id: '640ecdfc4118771fa8e57002',
              role_name: 'Admin',
              hierarchy: 1,
              updatedAt: '2023-05-04T15:04:13.031Z',
              id: '640ecdfc4118771fa8e57002',
            },
            {
              permissions: [],
              is_deleted: false,
              _id: '640ed141b3a9911d50a30729',
              role_name: 'Finance Manager',
              hierarchy: 2,
              id: '640ed141b3a9911d50a30729',
            },
            {
              permissions: [],
              is_deleted: false,
              _id: '640f064ebe01c2e00bd95083',
              role_name: 'HR Manager',
              hierarchy: 6,
              id: '640f064ebe01c2e00bd95083',
            },
          ]
        }
      } else {
        this.roles = [
          {
            permissions: [],
            is_deleted: false,
            _id: '640f1c93be01c2e00bd95084',
            role_name: 'Super Admin',
            hierarchy: 7,
            id: '640f1c93be01c2e00bd95084',
          },
          {
            permissions: [],
            is_deleted: false,
            _id: '640f05febe01c2e00bd95080',
            role_name: 'Manager',
            hierarchy: 3,
            id: '640f05febe01c2e00bd95080',
          },
          {
            permissions: [],
            is_deleted: false,
            _id: '640f061bbe01c2e00bd95081',
            role_name: 'CEO',
            hierarchy: 4,
            id: '640f061bbe01c2e00bd95081',
          },
          {
            permissions: [],
            is_deleted: false,
            _id: '640f064bbe01c2e00bd95082',
            role_name: 'Employee',
            hierarchy: 5,
            id: '640f064bbe01c2e00bd95082',
          },
          {
            permissions: [],
            is_deleted: false,
            _id: '640ecdfc4118771fa8e57002',
            role_name: 'Admin',
            hierarchy: 1,
            updatedAt: '2023-05-04T15:04:13.031Z',
            id: '640ecdfc4118771fa8e57002',
          },
          {
            permissions: [],
            is_deleted: false,
            _id: '640ed141b3a9911d50a30729',
            role_name: 'Finance Manager',
            hierarchy: 2,
            id: '640ed141b3a9911d50a30729',
          },
          {
            permissions: [],
            is_deleted: false,
            _id: '640f064ebe01c2e00bd95083',
            role_name: 'HR Manager',
            hierarchy: 6,
            id: '640f064ebe01c2e00bd95083',
          },
        ]
      }
    },
    handleAgentSelection(selectedId) {
      if (selectedId) {
        const selectedAgent = this.insuranceAgents.find(
          (agent) => agent._id === selectedId
        )
        if (selectedAgent) {
          this.onboardingUser.assigned_insurance_agent = {
            _id: selectedAgent._id,
            full_name: selectedAgent.full_name,
            email: selectedAgent.email,
          }
        }
      } else {
        this.onboardingUser.assigned_insurance_agent = {
          _id: '',
          full_name: '',
          email: '',
        }
      }
    },
    async getCompanyDetails(company_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$get(
          `/companies/comp/${company_id}`,
          { headers: { Authorization: AuthStr } }
        )
        this.companyDetails = response
        this.companyPayrollDisplay = {
          invoice_date: this.formatDayWithDisplay(
            this.parseDayValue(response.payroll_schedule.invoice_date)
          ),
          payment_due_notification: this.formatDayWithDisplay(
            this.parseDayValue(
              response.payroll_schedule.payment_due_notification
            )
          ),
          salary_payment_date: this.formatDayWithDisplay(
            this.parseDayValue(response.payroll_schedule.salary_payment_date)
          ),
        }
        if (
          !this.onboardingUser.payroll_details.follow_different_payroll_schedule
        ) {
          this.onboardingUser.payroll_details.invoice_date = {
            value: this.parseDayValue(response.payroll_schedule.invoice_date),
            display: this.formatDayWithDisplay(
              this.parseDayValue(response.payroll_schedule.invoice_date)
            ),
          }
          this.onboardingUser.payroll_details.payment_due_notification = {
            value: this.parseDayValue(
              response.payroll_schedule.payment_due_notification
            ),
            display: this.formatDayWithDisplay(
              this.parseDayValue(
                response.payroll_schedule.payment_due_notification
              )
            ),
          }
          this.onboardingUser.payroll_details.salary_payment_date = {
            value: this.parseDayValue(
              response.payroll_schedule.salary_payment_date
            ),
            display: this.formatDayWithDisplay(
              this.parseDayValue(response.payroll_schedule.salary_payment_date)
            ),
          }
        }
      } catch (error) {
        throw new Error(`Error when getting company details for ${company_id}`)
      }
    },
    handleDeleteProduct(index) {
      this.onboardingUser.dependent_details.splice(index, 1)
    },
    handleAddProduct() {
      this.onboardingUser.dependent_details.push({
        dependent_name: '',
        relation: '',
      })
    },
    async createNewOnboarding() {
      if (this.$refs.onboardingForm.validate()) {
        this.loading = true
        let AuthStr
        let url
        if (this.$auth.loggedIn) {
          AuthStr = 'Bearer '.concat(this.$store.state.token)
          url = `/onboardings/create/onboarding/users`
        } else {
          AuthStr = 'Bearer '.concat(this.$route.query.token)
          url = `/onboardings/onboard_via_link`
        }
        this.onboardingUser.personal.phone =
          this.phoneNumberText.dialCode + this.onboardingUser.personal.phone
        this.onboardingUser.employment.work_location =
          this.onboardingUser.employment.visa_sponsor_type ===
          'Dynamic Employment Services'
            ? 'Dubai'
            : 'Abu Dhabi'
        try {
          const response = await this.$axios.$post(url, this.onboardingUser, {
            headers: { Authorization: AuthStr },
          })
          this.loading = false
          this.createdUser.push(response)
          this.step += 1
          if (url === '/onboardings/onboard_via_link') {
            if (response.hasOwnProperty('id')) {
              this.onboardViaLinkMessage = `${response.first_name} ${response.last_name} has been onboarded as a ${response.designation}`
            } else {
              this.onboardViaLinkMessage = `Failed to onboard employee, try again later`
            }
          } else {
            this.snack = true
            this.snackColor = 'success'
            this.snackText = 'Onboarding created successfully'
          }
        } catch (err) {
          this.loading = false
          this.snack = true
          this.snackColor = 'error'
          this.snackText = err.message
        }
      }
    },
    complete() {
      this.$nuxt.$emit('fetchOnboardingList', true)
      this.closeLead()
    },
    closeEmailDialog() {
      this.sendEmailDialog = false
    },
    async createOnboardingLink() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        this.sendEmailDialog = true
        const email_template_id = await this.$axios.$get(
          `/email_template/by/name?templateName=Employee Onboarding (Link)`,
          { headers: { Authorization: AuthStr } }
        )
        this.emailBody = await this.$axios.$get(
          `/email_template/?templateId=${email_template_id._id}&moduleId=${this.onboardingUser.company_id}&onboardingLink=true`,
          { headers: { Authorization: AuthStr } }
        )
      } catch (error) {
        this.showMessage(
          `Failed to generate onboarding link: ${error.message}`,
          false
        )
      }
    },
    async verifyUserIsAuthenticated() {
      const token = this.$route.query.token
      this.urlToken = token
      try {
        if (!token) {
          await this.getEmployersList()
          await this.getRolesList()
          return
        }
        await this.$auth.logout()
        const authDetails = await this.$axios.get(
          '/users/get-authenticated-user',
          {
            headers: { Authorization: 'Bearer '.concat(this.urlToken) },
            params: { onboardingToken: 'true' },
          }
        )
        if (authDetails.message === 'jwt expired') return
        this.onboardingUser.company_id = authDetails.data.id
        this.employers.push(authDetails.data)
        this.companyDetails = authDetails.data
        await this.getRolesList()
      } catch (error) {
        throw error
      }
    },
    async downloadOnboardingTemplate() {
      try {
        const timestamp = new Date().getTime();
        const url = `/onboardings/export/bulk/upload/template`;
        const response = await this.$axios.get(url, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'onboardings_bulk_upload_template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        this.showBulkNotification('Template downloaded successfully!', 'success');
      } catch (error) {
        console.error('Download error:', error);
        this.showBulkNotification('Error downloading template. Please try again.', 'error');
      }
    },
    handleBulkFileChange(file) {
      if (file) {
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ];
        if (!allowedTypes.includes(file.type)) {
          this.showBulkNotification('Please select a valid Excel or CSV file', 'error');
          this.bulkUploadFile = null;
          return;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          this.showBulkNotification('File size must be less than 5MB', 'error');
          this.bulkUploadFile = null;
          return;
        }
      }
    },
    async uploadBulkOnboardings() {
      if (!this.bulkUploadFile) {
        this.showBulkNotification('Please select a file to upload', 'error');
        return;
      }
      try {
        this.uploadingBulk = true;
        const formData = new FormData();
        formData.append('file', this.bulkUploadFile);
        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.post('/onboardings/bulk/upload/onboardings', formData, {
          headers: {
            Authorization: AuthStr,
            'Content-Type': 'multipart/form-data'
          }
        });
        // Extract errors from response.data.errors (array of row errors)
        const errorsArr = response && response.data && Array.isArray(response.data.errors) ? response.data.errors : [];
        // Also check for errors in response.data.data.errors (API structure)
        let rowErrors = [];
        if (response && response.data && response.data.data && Array.isArray(response.data.data.errors)) {
          rowErrors = response.data.data.errors;
        } else if (errorsArr.length) {
          rowErrors = errorsArr;
        }

        // Get summary counts
        const successCount = response.data?.summary?.successful || response.data?.data?.summary?.successful || response.data?.added || 0;
        const failedCount = response.data?.summary?.failed || response.data?.data?.summary?.failed || 0;
        const skippedCount = response.data?.summary?.skipped || response.data?.data?.summary?.skipped || 0;

        console.log('Onboarding upload response structure:', response.data);
        console.log('Extracted counts:', { successCount, failedCount, skippedCount });

        // Show all row errors in the UI (only if there are actual validation errors)
        if (rowErrors.length && failedCount > 0) {
          this.bulkUploadErrors = rowErrors;
          if (this.bulkUploadErrorTimeout) clearTimeout(this.bulkUploadErrorTimeout);
          this.bulkUploadErrorTimeout = setTimeout(() => {
            this.bulkUploadErrors = [];
          }, 7000);
        } else {
          this.bulkUploadErrors = [];
        }
        // Show first error as a single red message (optional, can be removed if not needed)
        if (rowErrors.length) {
          this.bulkUploadRowError = rowErrors[0].error || 'Row error';
          if (this.bulkUploadRowErrorTimeout) clearTimeout(this.bulkUploadRowErrorTimeout);
          this.bulkUploadRowErrorTimeout = setTimeout(() => {
            this.bulkUploadRowError = '';
          }, 5000);
        } else {
          this.bulkUploadRowError = '';
        }
        // Show main notification (success or error summary)
        const backendMessage = response.data?.message || response.data?.data?.message;
        let messageText;

        if (backendMessage) {
          messageText = backendMessage;
        } else {
          messageText = `Upload completed! ${successCount} onboardings created successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}${skippedCount > 0 ? `, ${skippedCount} incomplete rows skipped` : ''}`;
        }

        if (response && response.status === 200 && failedCount === 0) {
          this.showBulkNotification(messageText, 'success');
        } else {
          this.showBulkNotification(messageText, failedCount > 0 ? 'warning' : 'success');
        }
        this.bulkUploadFile = null;
      } catch (error) {
        let msg = 'Error uploading file. Please try again.';
        if (error.response && error.response.data && error.response.data.message) {
          msg = error.response.data.message;
        } else if (error.message) {
          msg = error.message;
        }
        this.showBulkNotification(msg, 'error');
        this.bulkUploadErrors = [{ row: '-', email: '-', company: '-', error: error.message || 'Unknown error' }];
        this.bulkUploadRowError = error.message || 'Unknown error';
        if (this.bulkUploadRowErrorTimeout) clearTimeout(this.bulkUploadRowErrorTimeout);
        this.bulkUploadRowErrorTimeout = setTimeout(() => {
          this.bulkUploadRowError = '';
        }, 5000);
        if (this.bulkUploadErrorTimeout) clearTimeout(this.bulkUploadErrorTimeout);
        this.bulkUploadErrorTimeout = setTimeout(() => {
          this.bulkUploadErrors = [];
        }, 7000);
      } finally {
        this.uploadingBulk = false;
      }
    },
    showBulkNotification(message, color) {
      this.bulkSnackText = message;
      this.bulkSnackColor = color;
      this.bulkSnack = true;
    },
  },
  computed: {

    contractDuration() {
      const dateOfJoining = this.onboardingUser.employment.date_of_joining
      const endDate = this.onboardingUser.employment.end_date
      if (dateOfJoining && endDate) return `${dateOfJoining} to ${endDate}`
      return ''
    },
    computeNationalities() {
      var data = require('i18n-nationality')
      data.registerLocale(require('i18n-nationality/langs/en.json'))
      const nationalityNames = data.getNames('en')
      return Object.values(nationalityNames).sort((a, b) => {
        var textA = a.toUpperCase()
        var textB = b.toUpperCase()
        return textA < textB ? -1 : textA > textB ? 1 : 0
      })
    },
    computedSalaries() {
    let arr = [];
    var salaryKeyName = function (val) {
      return val.toLowerCase().replace(/\s/g, '_');
    };
    this.fixed.forEach((element) => {
      // Make sure we use a numerical value or 0
      const storedValue = this.onboardingUser.salary[salaryKeyName(element)];
      const numValue = !isNaN(parseFloat(storedValue)) ? parseFloat(storedValue) : 0;

      let obj = {
        name: element,
        key: salaryKeyName(element),
        value: numValue
      };
      arr.push(obj);
    });
    this.total_salary = arr;
    return arr;
  },
    // Update the computed property to watch individual salary values
    computedTotalSalary() {
    let total = 0;

    // Just calculate the total here without modifying other properties
    if (this.computedSalaries && this.computedSalaries.length) {
      total = this.computedSalaries.reduce((sum, component) => {
        return sum + (parseFloat(component.value) || 0);
      }, 0);
    }

    return total.toString();
  },
    maxDate() {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 18)
      return date.toISOString().split('T')[0]
    },
    minDate() {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 100)
      return date.toISOString().split('T')[0]
    },
    minExpectedDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
  },
  watch: {
    computedSalaries: {
      handler(newSalaries) {
        // Update the underlying data model when salary components change
        newSalaries.forEach((component) => {
          this.onboardingUser.salary[component.key] =
            parseFloat(component.value) || 0
        })

        // Update the total in the onboardingUser object
        this.onboardingUser.salary.total_fixed = this.computedTotalSalary

        // Update the display value
        this.salary.total_fixed = this.computedTotalSalary
      },
      deep: true,
    },
    'salary.remarks': function (newVal) {
      if (this.onboardingUser && this.onboardingUser.salary) {
        this.onboardingUser.salary.remarks = newVal
      }
    },
    'onboardingUser.employment.date_of_joining': function (newVal) {
      console.log('Date of joining changed:', newVal)
    },
       'onboardingUser.employment.end_date': function (newVal) {
      console.log('End date changed:', newVal)
    },
    'onboardingUser.salary': {
      handler() {
        // This ensures the total is updated if salary components are changed directly
        this.salary.total_fixed = this.computedTotalSalary
      },
      deep: true,
    },
    contractDuration: function (newVal) {
      this.onboardingUser.employment.contract_duration = newVal
    },
    companyDetails: {
      handler(newVal) {
        if (newVal && newVal.payroll_schedule) {
          this.companyPayrollDisplay = {
            invoice_date: this.formatDayWithDisplay(
              this.parseDayValue(newVal.payroll_schedule.invoice_date)
            ),
            payment_due_notification: this.formatDayWithDisplay(
              this.parseDayValue(
                newVal.payroll_schedule.payment_due_notification
              )
            ),
            salary_payment_date: this.formatDayWithDisplay(
              this.parseDayValue(newVal.payroll_schedule.salary_payment_date)
            ),
          }
        }
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.dropZone {
  width: 220px;
  height: 60px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}
.dropZone:hover {
  border: 2px solid #2e94c4;
}
.dropZone:hover .dropZone-title {
  color: #1975a0;
}
.dropZone-info {
  color: #a8a8a8;
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
  background: #5c5c5c;
  opacity: 0.8;
}
.dropZone-uploaded {
  width: 220px;
  height: 60px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}
.dropZone-uploaded-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #a8a8a8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>
