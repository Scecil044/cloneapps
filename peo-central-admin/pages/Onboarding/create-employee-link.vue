<template lang="">
  <div>
  <v-card
    id="card"
    style="margin-bottom: 1rem !important"
  >
    <v-container
      fluid
      v-if="step == 1"
    >
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
            :disabled="loading"
            outlined
            @click="closeLead"
          >
            Cancel
          </v-btn>
          <!-- v-if="estimate_in_pdf == false" -->
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
          >
            Create
          </v-btn>
        </div>
      </v-card-title>

      <v-col
        cols="6"
        class="d-flex align-center"
        flat
      >
        <v-radio-group
          v-if="!$route.query.token"
          v-model="status"
          row
        >
          <v-radio
            label="Fill in Manually"
            value="manual"
            class="mr-2"
          />
          <v-radio
            label="Generate Link"
            value="link"
            class="mr-2"
          />
        </v-radio-group>
      </v-col>

      <v-form
        ref="onboardingForm"
        v-if="status === 'manual'"
      >
        <v-row class="mb-2">
          <!-- company Name -->
          <v-col
            cols="12"
            md="2"
            class="px-0 py-0"
            style="height: fit-content"
          >
            <v-row>
              <v-col
                cols="12"
                class="py-0 pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Company Name"
                  :mandatory="true"
                >
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
                      solo
                      dense
                      v-model="onboardingUser.company_id"
                      item-text="company_name"
                      item-value="_id"
                      class="proposalDialog_date_field2"
                      append-icon="fa-chevron-down"
                      @change="getCompanyDetails(onboardingUser.company_id)"
                      dense
                      outlined
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-col>
          <!-- company Name -->
          <v-col
            cols="12"
            md="2"
            class="px-0 py-0"
            style="height: fit-content"
          >
            <v-row>
              <v-col
                cols="12"
                class="py-0 pl-0 pr-12"
              >
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
                      solo
                      dense
                      v-model="onboardingUser.employment.visa_sponsor_type"
                      class="proposalDialog_date_field2"
                      append-icon="fa-chevron-down"
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
            md="2"
            class="px-0 py-0"
            style="height: fit-content"
          >
            <v-row>
              <v-col
                cols="12"
                class="py-0 pl-0 pr-12"
              >
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
                      solo
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


          <v-col
            cols="12"
            md="2"
            class="px-0 py-0"
            style="height: fit-content"
          >
            <v-row>
              <v-col
                cols="12"
                class="py-0 pl-0 pr-12"
              >
                <CustomInputContainer
                  label="Current Location"
                  :mandatory="true"
                >
                  <div slot="input">
                    <v-select
                      :items="['Inside UAE', 'Outside UAE']"
                      placeholder="Current Location"
                      v-model="onboardingUser.user_location"
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
                    style="border-radius: 50px"
                    width="60"
                    height="60"
                    :src="onboardingUser.image_url"
                    v-if="onboardingUser.image_url"
                  />
                  <customerDefaultIcon
                    v-else
                    style="border-radius: 50px"
                  />
                </v-avatar>
              </v-avatar>

              <div>
                <!-- <p>{{ selectedCustomer }}</p> -->
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
                  <v-icon small>
                    fa-solid fa-pencil
                  </v-icon>
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
          <v-text-field v-model="onboardingUser.first_name" placeholder="Add name" solo
            class="proposalDialog_date_field2" dense outlined :rules="main_rule" />
        </div>
      </CustomInputContainer>
    </v-col>

    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Middle Name">
        <div slot="input">
          <v-text-field v-model="onboardingUser.middle_name" placeholder="Add name" solo
            class="proposalDialog_date_field2" dense hide-details />
        </div>
      </CustomInputContainer>
    </v-col>

    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Last Name" :mandatory="true">
        <div slot="input">
          <v-text-field v-model="onboardingUser.last_name" placeholder="Add name" class="proposalDialog_date_field2"
            solo dense outlined :rules="main_rule" />
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
          <v-text-field v-model="onboardingUser.email" placeholder="Enter mail" outlined dense :rules="emailRules" />
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Date Of Birth" :mandatory="true">
        <div slot="input">
          <v-menu v-model="showDob" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
            offset-y min-width="auto">
            <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="onboardingUser.personal.dob"
                          placeholder="Enter Date Of Birth"
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
            <v-date-picker v-model="onboardingUser.personal.dob" @input="showDob = false" :min="minDate"
              :max="maxDate" />
          </v-menu>
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
      <CustomInputContainer label="Phone Number" :mandatory="true">
        <div slot="input">
          <v-row>
            <v-col class="py-0 pl-2" cols="12" sm="12" md="3" v-if="countryCode.length > 0">
              <v-autocomplete v-if="countryCode.length > 0" color="black" auto-select-first
                class="autoCompleteCustomClass" :items="countryCode" :item-text="(item) => item.dialCode + item.country"
                return-object style="max-width: 150px" dense outlined placeholder="Country Code"
                v-model="phoneNumberText">
                <template #selection="slotProps">
                            {{ slotProps.item.dialCode }}
                          </template>
                <template #item="slotProps">
                            <v-avatar
                              left
                              class="mr-3"
                            >
                              <svg v-html="slotProps.item.flag"></svg>
                            </v-avatar>
                            {{ slotProps.item.dialCode }}
                            {{ slotProps.item.country }}
                          </template>
              </v-autocomplete>
            </v-col>
            <v-col class="py-0" cols="12" sm="12" md="5">
              <v-text-field placeholder="Add phone number" v-model="onboardingUser.personal.phone" outlined dense
                :rules="phoneNumberRule" />
            </v-col>
          </v-row>
        </div>
      </CustomInputContainer>
    </v-col>
  </v-row>
</v-col>
<v-col cols="12" class="py-0 px-0">
  <v-row class="">
    <!-- <v-col cols="12" md="6" lg="6" class="pl-0 pr-12">
  <CustomInputContainer label="Place of Registration:">
    <div slot="input">
      <v-text-field v-model="onboardingUser.place_of_registration" placeholder="Enter registration place" class="proposalDialog_date_field2" solo dense hide-details />
    </div>
  </CustomInputContainer>
</v-col> -->
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Role" :mandatory="true">
        <div slot="input">
          <v-select readonly :items="roles" item-text="role_name" item-value="id" placeholder="Select Role"
            v-model="onboardingUser.role_ID" solo class="proposalDialog_date_field2" dense append-icon="fa-chevron-down"
            outlined :rules="main_rule" />
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Nationality" :mandatory="true">
        <div slot="input">
          <v-select :items="computeNationalities" placeholder="Select Nationality"
            v-model="onboardingUser.personal.nationality" solo class="proposalDialog_date_field2" dense
            append-icon="fa-chevron-down" outlined :rules="main_rule" />
        </div>
      </CustomInputContainer>
    </v-col>
  </v-row>
</v-col>

<!-- Employment  Details -->
<v-col cols="12" class="py-0 px-0">
  <span class="span_leadHeading">EMPLOYMENT DETAILS</span>
</v-col>
<v-col cols="12" class="py-0 px-0">
  <v-row class="">
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Designation">
        <div slot="input">
          <v-text-field v-model="onboardingUser.employment.designation" placeholder="Add designation."
            class="proposalDialog_date_field2" solo outlined dense />
        </div>
      </CustomInputContainer>
    </v-col>

    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Date of Joining">
        <div slot="input">
          <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
            offset-y min-width="auto">
            <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="onboardingUser.employment.date_of_joining"
                          placeholder="Enter Date"
                          solo
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
            <v-date-picker v-model="onboardingUser.employment.date_of_joining" @input="date_menu = false" />
          </v-menu>
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Expected Arrival Date">
        <div slot="input">
          <v-menu v-model="date_menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
            offset-y min-width="auto">
            <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="onboardingUser.employment.expected_arrival"
                          placeholder="Enter Date"
                          solo
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
            <v-date-picker v-model="onboardingUser.employment.expected_arrival" @input="date_menu2 = false" />
          </v-menu>
        </div>
      </CustomInputContainer>
    </v-col>

    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12" v-if="
                  onboardingUser.employment.employment_type &&
                    !onboardingUser.employment.employment_type.includes(
                      'Mission Visa'
                    )
                ">
      <CustomInputContainer label="Probation Period">
        <div slot="input">
          <v-autocomplete placeholder="Add Probation Period" :items="[
                        '0 Months',
                        '1 Month',
                        '2 Months',
                        '3 Months',
                        '4 Months',
                        '5 Months',
                        '6 Months',
                      ]" v-model="onboardingUser.employment.probation_period" dense append-icon="fa-chevron-down"
            outlined :rules="main_rule" />
          <!-- <v-menu v-model="date_menu1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="auto">
        <template v-slot:activator="{ on, attrs }">
          <v-text-field  dense  v-model="onboardingUser.employment.probation_period" v-bind="attrs" v-on="on" placeholder="Enter Date" solo class="proposalDialog_date_field2" hide-detail>
            <template v-slot:append>
              <div class="">
                <CalenderSvg />
              </div>
            </template>
          </v-text-field>
        </template>
        <v-date-picker v-model="onboardingUser.employment.probation_period" @input="date_menu1 = false"></v-date-picker>
      </v-menu> -->
        </div>
      </CustomInputContainer>
    </v-col>
  </v-row>
</v-col>

<v-col cols="12" class="py-0 px-0">
  <v-row class="">
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12" v-if="
                  onboardingUser.employment.employment_type &&
                    !onboardingUser.employment.employment_type.includes(
                      'Mission Visa'
                    )
                ">
      <CustomInputContainer label="Notice Period">
        <div slot="input">
          <v-autocomplete placeholder="Add notice period" :items="['1 Month', '2 Months', '3 Months']"
            v-model="onboardingUser.employment.notice_period" dense append-icon="fa-chevron-down" outlined
            :rules="main_rule" />
        </div>
      </CustomInputContainer>
    </v-col>

    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12" v-if="
                  onboardingUser.employment.employment_type &&
                    !onboardingUser.employment.employment_type.includes(
                      'Mission Visa'
                    )
                ">
      <CustomInputContainer label="Working Days">
        <div slot="input">
          <v-autocomplete placeholder="Add Working days" :items="['5 Working Days', '6 Working Day']"
            v-model="onboardingUser.employment.working_days" dense append-icon="fa-chevron-down" outlined
            :rules="main_rule" />
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12" v-if="
                  onboardingUser.employment.employment_type &&
                    !onboardingUser.employment.employment_type.includes(
                      'Mission Visa'
                    )
                ">
      <CustomInputContainer label="Working Hours">
        <div slot="input">
          <v-text-field v-model="onboardingUser.employment.working_hours"
            placeholder="9:00am to 6:00pm day (Including 1-hour lunch break) / 9 Hours per day (Including 1-hour lunch break)"
            dense outlined :rules="main_rule" />
        </div>
      </CustomInputContainer>
    </v-col>

    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Contract Type" :mandatory="true">
        <div slot="input">
          <v-select :disabled="lock" :items="['Full Time', 'Temporary']" item-text="name"
            placeholder="Add Contract Type" v-model="onboardingUser.employment.contract_type" solo
            class="proposalDialog_date_field2" dense append-icon="fa-chevron-down" outlined :rules="main_rule" />
        </div>
      </CustomInputContainer>
    </v-col>

    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="End Date">
        <div slot="input">
          <v-menu v-model="end_date_menu" :close-on-content-click="false" :nudge-right="40"
            transition="scale-transition" offset-y min-width="auto">
            <template #activator="{ on, attrs }">
                        <v-text-field
                          v-model="onboardingUser.employment.end_date"
                          placeholder="Enter End of Contract Date"
                          solo
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
            <v-date-picker v-model="onboardingUser.employment.end_date" @input="end_date_menu = false"
              :min="minExpectedDate" />
          </v-menu>
        </div>
      </CustomInputContainer>
    </v-col>
  </v-row>
</v-col>

<!-- COMPENSATIONS -->
<v-col cols="12" class="py-0 px-0">
  <span class="span_leadHeading">SALARY DETAILS</span>
</v-col>
<v-col cols="12" class="py-0 px-0">
  <v-row class="">
    <v-col v-for="(salary, key) in computedSalaries" :key="key" cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer :label="salary.name">
        <div slot="input">
          <v-text-field v-model.number="salary.value" :placeholder="`${salary.name}`" class="proposalDialog_date_field2"
            solo outlined dense :rules="salaryRule" @focus="$event.target.select()" prefix="AED" />
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Total Salary">
        <div slot="input">
          <v-text-field v-model="salary.total_fixed" :placeholder="`${computedTotalSalary}`"
            class="proposalDialog_date_field2" solo outlined dense readonly prefix="AED" />
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Remarks">
        <div slot="input">
          <v-text-field v-model="salary.remarks" placeholder="Enter remarks" class="proposalDialog_date_field2" solo
            outlined dense />
        </div>
      </CustomInputContainer>
    </v-col>
  </v-row>
</v-col>

<!-- PAYROLL SCHEDULE -->
<v-col cols="12" class="py-0 px-0">
  <span class="span_leadHeading">PAYROLL SCHEDULE</span>
</v-col>
<v-col cols="12" class="py-0 px-0">
  <v-row class="">
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Invoice Date" v-if="
                    onboardingUser.payroll_details
                      .follow_different_payroll_schedule
                  ">
        <div slot="input">
          <v-text-field v-model="onboardingUser.payroll_details.invoice_date" placeholder="Enter Invoice Date" solo
            class="proposalDialog_date_field2" dense hide-details />
        </div>
      </CustomInputContainer>
      <CustomInputContainer label="Invoice Date" v-else>
        <div slot="input">
          <v-text-field disabled v-model="onboardingUser.payroll_details.invoice_date" placeholder="Enter Invoice Date"
            solo class="proposalDialog_date_field2" dense hide-details />
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Payment Due Date" v-if="
                    onboardingUser.payroll_details
                      .follow_different_payroll_schedule
                  ">
        <div slot="input">
          <v-text-field v-model="
                        onboardingUser.payroll_details.payment_due_notification
                      " placeholder="Enter Payment Due Date" solo class="proposalDialog_date_field2" dense
            hide-details />
        </div>
      </CustomInputContainer>
      <CustomInputContainer label="Payment Due Date" v-else>
        <div slot="input">
          <v-text-field disabled v-model="
                        onboardingUser.payroll_details.payment_due_notification
                      " placeholder="Enter Payment Due Date" solo class="proposalDialog_date_field2" dense
            hide-details />
        </div>
      </CustomInputContainer>
    </v-col>
    <v-col cols="12" md="3" lg="3" class="pl-0 pr-12">
      <CustomInputContainer label="Salary Date" v-if="
                    onboardingUser.payroll_details
                      .follow_different_payroll_schedule
                  ">
        <div slot="input">
          <v-text-field v-model="
                        onboardingUser.payroll_details.salary_payment_date
                      " placeholder="Enter Payment Due Date" solo class="proposalDialog_date_field2" dense
            hide-details />
        </div>
      </CustomInputContainer>
      <CustomInputContainer label="Salary Date" v-else>
        <div slot="input">
          <v-text-field disabled v-model="
                        onboardingUser.payroll_details.salary_payment_date
                      " placeholder="Enter Payment Due Date" solo class="proposalDialog_date_field2" dense
            hide-details />
        </div>
      </CustomInputContainer>
    </v-col>
  </v-row>
</v-col>
<v-col cols="12" class="py-0 px-0">
  <div style="max-width: 25% !important">
    <v-checkbox label="Follow Different Payroll Schedule" @click="
                  onboardingUser.payroll_details.follow_different_payroll_schedule =
                    !onboardingUser.payroll_details
                      .follow_different_payroll_schedule
                " />
  </div>
</v-col>
<!-- Dependent Details -->
<v-col cols="12" class="py-0 px-0">
  <span class="span_leadHeading">DEPENDENT DETAILS</span>
</v-col>


<v-col cols="6">
  <v-simple-table dense class="dynamic_table">
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
    <v-btn @click="handleAddProduct()" class="small__btn" outlined color="subtext">
      <v-icon x-small color="subtext" class="mr-2">
        fa-plus
      </v-icon>
      <span class="text--text">Add Dependents</span>
    </v-btn>
  </div>
</v-col>
</v-row>
</v-form>
</v-container>
<v-container fluid v-if="step == 2 && this.$auth.loggedIn">
  <v-card-title id="card-title" class="mb-4">
    <h4 class="text--text">
      Upload Employee Documents
    </h4>

    <div class="flex_row justify-lg-space-between">
      <v-btn class="tall__btn" color="primary" @click.prevent="complete()">
        Complete
      </v-btn>
    </div>
  </v-card-title>
  <EmployeeDocument :employee-details="createdUser" :allowed-types="[
          'passport',
          'passportsizephoto',
          'academiccertificate',
          'entrystamp',
          'previousemploymentvisa',
          'visacancellation',
          'otherdocuments',
        ]" />
</v-container>
<v-container fluid v-if="step == 2 && !this.$auth.loggedIn" class="d-flex justify-center align-center">
  <v-card-title id="card-title" class="mb-4 text-center">
    <h4 class="text--text">
      {{onboardViaLinkMessage}}
    </h4>
  </v-card-title>
</v-container>

<v-dialog v-model="uploadPicture" max-width="600">
  <v-card max-width="600" style="overflow-x: hidden">
    <v-row class="pt-4 pl-4 pr-4">
      <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
        <p class="mb-0 caption blue-grey--text font-weight-bold">
          Upload Profile Pic
        </p>
        <div class="pt-2" v-if="!uploadFile">
          <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true"
            @dragleave="dragging = false">
            <div class="dropZone-info" @drag="onUploadFile">
              <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
              <span class="dropZone-title">Drop file or click to upload</span>
              <div class="dropZone-upload-limit-info">
                <div>maximum file size: 10 MB</div>
              </div>
            </div>
            <input type="file" @change="onUploadFile">
          </div>
        </div>
        <div v-else class="dropZone-uploaded">
          <div class="dropZone-uploaded-info">
            <span class="dropZone-title">Added</span>
            <button type="button" class="btn btn-primary removeFile" @click="removeFile('uploadDoc')">
              Remove File
            </button>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row class="pa-4">
      <v-col class="text-right pt-0">
        <v-btn color="grey" text @click="uploadPicture = false">
          Close
        </v-btn>
        <v-btn color="blue darken-1" text v-if="uploading">
          <v-img src="/animated/refresh.svg" height="20" width="20" class="mr-2" contain />
        </v-btn>
        <v-btn color="blue darken-1" text v-else :disabled="!uploadFile" @click="attachFile()">
          Upload Profile
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</v-dialog>

<!-- Snack -->
<v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
  {{ snackText }}
  <template #action="{ attrs }">
        <v-btn
          v-bind="attrs"
          text
          @click="snack = false"
          small
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
</v-snackbar>
<SendMailDialog v-if="sendEmailDialog" :email-body="emailBody" @successfull="handleSuccessEmail"
  @error="handleFailedEmail($event)" :is-loading="!emailBody.content" @close="closeEmailDialog" />
<!--    Generate Link Section-->
<v-row v-if="status==='link'" class="d-flex align-items-center">
  <v-col cols="6" class="py-0 pl-0 pr-12">
    <CustomInputContainer label="Company Name" :mandatory="true">
      <div slot="input">
        <v-select :disabled="$route.query?.token || !['isSuperAdmin'].includes($store.getters.getThisUserRole)"
          :items="employers" placeholder="Select Company" solo dense v-model="onboardingUser.company_id"
          item-text="company_name" item-value="_id" class="proposalDialog_date_field2" append-icon="fas fa-chevron-down"
          @change="getCompanyDetails(onboardingUser.company_id)" outlined :rules="[main_rule]" />
      </div>
    </CustomInputContainer>

    <v-btn class="tall__btn" color="primary" @click.prevent="createOnboardingLink()">
      Generate Link
    </v-btn>
  </v-col>
</v-row>
</v-card>
</v-card>

<!-- snackbar -->
<v-snackbar v-model="snackbar.show" :color="snackbar.success ? 'success': 'red'">
  {{ snackbar.text }}

  <template v-slot:action=" { attrs }">
  <v-btn color="pink" text v-bind="attrs" @click="snackbar.show = false">
    Close
  </v-btn>
  </template>
</v-snackbar>
<!--Send Email Dialog-->

<!-- Token Expired Modal - Full Screen, Non-Closable -->
<div
  v-if="showTokenExpiredModal"
  class="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-[9999] tw-bg-black tw-bg-opacity-30 tw-backdrop-blur-md"
>
  <div class="tw-bg-white tw-rounded-2xl tw-p-10 tw-max-w-2xl tw-w-full tw-mx-4 tw-shadow-2xl tw-border-4 tw-border-red-500 tw-animate-fade-in-up">
    <div class="tw-text-center">
      <!-- Icon Container with Gradient Background -->
      <div class="tw-bg-gradient-to-br tw-from-red-500 tw-to-red-600 tw-p-6 tw-rounded-full tw-inline-block tw-mb-6 tw-shadow-lg">
        <v-icon size="100" color="white">mdi-link-variant-off</v-icon>
      </div>

      <!-- Main Heading -->
      <h2 class="tw-text-4xl tw-font-bold tw-mb-4 tw-text-gray-800 tw-tracking-tight">
        Link Expired
      </h2>

      <!-- Subheading -->
      <p class="tw-text-xl tw-text-gray-600 tw-mb-6 tw-leading-relaxed">
        Your onboarding link has expired or is no longer valid.
      </p>

      <!-- Information Box -->
      <div class="tw-bg-white tw-border-2 tw-border-amber-200 tw-border-l-4 tw-border-l-amber-500 tw-p-6 tw-rounded-lg tw-mb-8 tw-text-left tw-shadow-sm">
        <div class="tw-flex tw-items-start">
          <v-icon color="amber darken-2" class="tw-mr-3 tw-mt-1">mdi-information</v-icon>
          <div>
            <p class="tw-text-gray-800 tw-font-semibold tw-mb-2">
              What you need to do:
            </p>
            <p class="tw-text-gray-700 tw-leading-relaxed">
              Please contact your administrator to request a new onboarding link.
              The link will be sent to your email address.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Section -->
      <div class="tw-bg-gray-50 tw-p-6 tw-rounded-lg tw-mb-6">
        <p class="tw-text-gray-600 tw-mb-4">
          <v-icon small color="gray" class="tw-mr-2">mdi-email-outline</v-icon>
          For assistance, please reach out to:
        </p>
        <a
          href="mailto:peosupport@nathanhr.com"
          class="tw-text-blue-600 tw-font-semibold tw-text-lg hover:tw-underline tw-inline-flex tw-items-center tw-transition-colors"
          style="color: #0a94ff;"
        >
          <v-icon small class="tw-mr-2" style="color: #0a94ff;">mdi-email</v-icon>
          peosupport@nathanhr.com
        </a>
      </div>

      <!-- Divider -->
      <v-divider class="tw-my-6"></v-divider>

      <!-- Footer Note -->
      <p class="tw-text-sm tw-text-gray-500 tw-italic">
        This link is valid for a limited time. For security reasons, expired links cannot be reactivated.
      </p>
    </div>
  </div>
</div>
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
  layout: 'anonymous',
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
      //rules
      main_rule: [(v) => !!v || 'This field is required'],
      numberRule: [
        (value) => {
          return (!isNaN(value) && value.length > 7) || 'Invalid phone number.'
        },
      ],
      phoneNumberRule: [
        (value) => {
          return !isNaN(value) || 'Invalid phone number.'
        },
      ],
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
      showTokenExpiredModal: false,
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
          email: ''
        },
        dob: '',
        place_of_registration: '',
        role_ID: '640f064bbe01c2e00bd95082',
        company_address: '',
        employment: {
          designation: '',
          date_of_joining: '',
          end_date: '',
          probation_period: '',
          notice_period: '',
          working_days: '',
          contract_duration: '',
          contract_type: '',
        },
        salary: {
          total_fixed: '0',
          remarks: ''
        },
        payroll_details: {
          invoice_date: '',
          payment_due_notification: '',
          salary_payment_date: '',
          follow_different_payroll_schedule: false,
        },
        dependent_details: [
          {
            dependent_name: '',
            relation: '',
          },
        ],
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
      dependentObj: {
        dependent_name: '',
        relation: '',
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
        ecard: {},
      },
      uploading: false,
      loading: false,
      companyDetails: [],
      table_headers: ['Dependent Name', 'Relation', 'Actions'],
      snack: false,
      snackText: '',
      snackColor: '',
      salary: {
        remarks: '',
      },
      total_salary: [],
      fixed: [
        'Basic Salary',
        'Housing Allowance',
        'HRA Allowance',
        'Transportation Allowance',
        'Food Allowance',
        'Mobile Allowance',
        'Car Allowance',
        'Petrol Allowance',
        'Other Allowance',
      ],
      salaryRule: [
        (value) => {
          return !isNaN(value) || 'Invalid'
        },
      ],
    }
  },
  mounted() {
    this.getInsuranceAgent()
    this.verifyUserIsAuthenticated()
    this.getEmployersList()
    // this.getRolesList()
    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }
  },
  methods: {
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
      let cloneduser = _.cloneDeep(this.onboardingUser)

      this.onboardingUser = {
        personal: {},
        company_id: cloneduser.company_id,
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        image_url: '',
        dob: '',
        place_of_registration: '',
        role_ID: '640f064bbe01c2e00bd95082',
        company_address: '',
        employment: {
          designation: '',
          date_of_joining: '',
          end_date: '',
          probation_period: '',
          notice_period: '',
          working_days: '',
          contract_duration: '',
          contract_type: '',
          employment_type: cloneduser.employment.employment_type,
          visa_sponsor_type: cloneduser.employment.visa_sponsor_type,
        },
        payroll_details: {
          invoice_date: '',
          payment_due_notification: '',
          salary_payment_date: '',
          follow_different_payroll_schedule: false,
        },
        dependent_details: [
          {
            dependent_name: '',
            relation: '',
          },
        ],
        salary: cloneduser.salary,
      }

      if (
        this.onboardingUser &&
        this.onboardingUser.employment &&
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
      if (val == 'uploadDoc') this.uploadFile = ''
      // if (val == 'ecard') this.ecardFile = '';
      // if (val == 'bulk') this.bulkFile = '';
    },
    createFile(e, file, type) {
      if (file.size > 26214400) {
        alert('please check file size is not more than 25 MB.')
        this.dragging = false
        return
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file
      // if (type == 'ecard') this.ecardFile = file
      // if (type == 'bulk') this.bulkFile = file
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
      try {
        this.uploading = true;
        let attach = {};

        this.page = 1;
        // Use URL token if available (onboarding link), otherwise use store token (logged in user)
        const AuthStr = this.$route.query.token
          ? 'Bearer '.concat(this.$route.query.token)
          : 'Bearer '.concat(this.$store.state.token);

        console.log("AttachFiles before processing:", this.attachFiles);

        for (var key in this.attachFiles) {
          if (!_.isEmpty(this.attachFiles[key])) {
            for (let i = 0; i < this.attachFiles[key].length; i++) {
              if (this.attachFiles[key][i].name != undefined) {
                attach.file = this.attachFiles[key][i];
                // Log the file being attached
                console.log("File being attached:", attach.file);
              }
            }
          }
          this.removeFile(key);
        }

        // Check if we have a file to upload
        if (!attach.file) {
          console.error("No file to upload");
          this.uploading = false;
          return;
        }

        const fd = new FormData();
        fd.append('documents', attach.file);

        // Log the FormData (won't show content but will show if it exists)
        console.log("FormData created:", fd);

        // Choose the appropriate endpoint based on token type
        const endpoint = this.$route.query.token
          ? '/documents/onboarding-simpleupload'  // New onboarding-specific endpoint
          : '/documents/simpleupload';           // Regular endpoint for logged-in users

        const config = {
          headers: {
            Authorization: AuthStr,
            'Content-Type': 'multipart/form-data'
          }
        };

        // Log the request being made
        console.log("Making request to", endpoint);

        const response = await this.$axios.$post(
          endpoint,
          fd,
          config
        );

        console.log("Upload response:", response);

        if (response) {
          this.onboardingUser.image_url = response[0];
          this.uploadPicture = false;
          this.snack = true;
          this.snackColor = 'success';
          this.snackText = 'File uploaded successfully';
        }

      } catch (error) {
        console.error("Upload error:", error);
        this.snack = true;
        this.snackColor = 'error';
        this.snackText = 'Failed to upload file: ' + (error.message || 'Unknown error');
      } finally {
        this.uploading = false;
      }
    },
    closeLead() {
      this.$router.push('/onboarding')
    },
    getEmployersList() {
      this.comPage++

      if (this.$auth.loggedIn) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        this.$axios
          .$post(
            `/companies/list/dropdown?page=${1}&limit=${10000}`,
            {},
            { headers: { Authorization: AuthStr } }
          )
          .then((response) => {
            this.employers = response
          })
      } else {
        this.employers = []
      }
    },
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
            console.log('What is the response ****', response);
            // Map response to add `full_name` property
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

    getRolesList() {
      if (this.$auth.loggedIn) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        this.$axios
          .$get('/roles/', { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.roles = response
          })
      } else {
        this.roles = [
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f1c93be01c2e00bd95084",
            "role_name": "Super Admin",
            "hierarchy": 7,
            "id": "640f1c93be01c2e00bd95084"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f05febe01c2e00bd95080",
            "role_name": "Manager",
            "hierarchy": 3,
            "id": "640f05febe01c2e00bd95080"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f061bbe01c2e00bd95081",
            "role_name": "CEO",
            "hierarchy": 4,
            "id": "640f061bbe01c2e00bd95081"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f064bbe01c2e00bd95082",
            "role_name": "Employee",
            "hierarchy": 5,
            "id": "640f064bbe01c2e00bd95082"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640ecdfc4118771fa8e57002",
            "role_name": "Admin",
            "hierarchy": 1,
            "updatedAt": "2023-05-04T15:04:13.031Z",
            "id": "640ecdfc4118771fa8e57002"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640ed141b3a9911d50a30729",
            "role_name": "Finance Manager",
            "hierarchy": 2,
            "id": "640ed141b3a9911d50a30729"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f064ebe01c2e00bd95083",
            "role_name": "HR Manager",
            "hierarchy": 6,
            "id": "640f064ebe01c2e00bd95083"
          }
        ]
      }
    },
    handleAgentSelection(selectedId) {
      if (selectedId) {
        const selectedAgent = this.insuranceAgents.find(agent => agent._id === selectedId)
        if (selectedAgent) {
          this.onboardingUser.assigned_insurance_agent = {
            _id: selectedAgent._id,
            full_name: selectedAgent.full_name,
            email: selectedAgent.email
          }
        }
      } else {
        this.onboardingUser.assigned_insurance_agent = {
          _id: '',
          full_name: '',
          email: ''
        }
      }
    },
    async getCompanyDetails(company_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/companies/comp/${company_id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.companyDetails = response
          this.onboardingUser.payroll_details.invoice_date =
            this.companyDetails.payroll_schedule.invoice_date
          this.onboardingUser.payroll_details.payment_due_notification =
            this.companyDetails.payroll_schedule.payment_due_notification
          this.onboardingUser.payroll_details.salary_payment_date =
            this.companyDetails.payroll_schedule.salary_payment_date
        })
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
    createNewOnboarding() {
      if (this.$refs.onboardingForm.validate()) {
        this.loading = true
        let AuthStr;
        let url;
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
          this.onboardingUser.employment.visa_sponsor_type ==
            'Dynamic Employment Services'
            ? 'Dubai'
            : 'Abu Dhabi'
        console.log("What is the onboarding user", this.onboardingUser)
        this.$axios
          .$post(url, this.onboardingUser, {
            headers: { Authorization: AuthStr },
          })
          .then((response) => {
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
          })
          .catch((err) => {
            this.loading = false

            // Check if this is a token-related error (611 status code for onboarding token errors)
            const isTokenError =
              (err.response && err.response.status === 611) ||
              (err.response && err.response.data && err.response.data.code === 611)

            if (isTokenError) {
              // Show full-screen token expired modal
              this.showTokenExpiredModal = true
            } else {
              // Show regular snackbar for other errors
              this.snack = true
              this.snackColor = 'error'
              this.snackText = err.response?.data?.message || err.message || 'An error occurred while submitting the form.'
            }
          })
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
        let email_template_id = await this.$axios.$get(`/email_template/by/name?templateName=Employee Onboarding (Link)`, {
          headers: { Authorization: AuthStr }
        })
        console.log("The companyy id ", this.onboardingUser.company_id)
        this.emailBody = await this.$axios.$get(
          `/email_template/?templateId=${email_template_id._id}&moduleId=${this.onboardingUser.company_id}&onboardingLink=true`,
          { headers: { Authorization: AuthStr } }
        )

        console.log("The email body happens to be", this.emailBody)
      } catch (error) {
        console.error(error)
        throw new Error(error)
      }
    },
    async verifyUserIsAuthenticated() {
      console.log("Am I called", this.$route.query.token);
      const token = this.$route.query.token;
      this.urlToken = token


      try {
        if (!token) {
          await this.getEmployersList();
          await this.getRolesList();
          return;
        }
        await this.$auth.logout()
        const authDetails = await this.$axios.get('/users/get-authenticated-user', {
          headers: {
            Authorization: 'Bearer '.concat(this.urlToken)
          },
          params: {
            onboardingToken: 'true'
          }
        });

        console.log('What are the authenticated user?', authDetails);

        if (authDetails.message === 'jwt expired') {
          return;
        }

        this.onboardingUser.company_id = authDetails.data.id;
        this.employers.push(authDetails.data);
        this.companyDetails = authDetails.data;

        this.roles = [
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f1c93be01c2e00bd95084",
            "role_name": "Super Admin",
            "hierarchy": 7,
            "id": "640f1c93be01c2e00bd95084"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f05febe01c2e00bd95080",
            "role_name": "Manager",
            "hierarchy": 3,
            "id": "640f05febe01c2e00bd95080"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f061bbe01c2e00bd95081",
            "role_name": "CEO",
            "hierarchy": 4,
            "id": "640f061bbe01c2e00bd95081"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f064bbe01c2e00bd95082",
            "role_name": "Employee",
            "hierarchy": 5,
            "id": "640f064bbe01c2e00bd95082"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640ecdfc4118771fa8e57002",
            "role_name": "Admin",
            "hierarchy": 1,
            "updatedAt": "2023-05-04T15:04:13.031Z",
            "id": "640ecdfc4118771fa8e57002"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640ed141b3a9911d50a30729",
            "role_name": "Finance Manager",
            "hierarchy": 2,
            "id": "640ed141b3a9911d50a30729"
          },
          {
            "permissions": [],
            "is_deleted": false,
            "_id": "640f064ebe01c2e00bd95083",
            "role_name": "HR Manager",
            "hierarchy": 6,
            "id": "640f064ebe01c2e00bd95083"
          }
        ];

      } catch (error) {
        console.error('Authentication verification failed:', error);

        // Check if this is a token expired error (611 status code)
        const isTokenExpired =
          (error.response && error.response.status === 611) ||
          (error.response && error.response.data && error.response.data.code === 611) ||
          (error.response && error.response.data && error.response.data.message &&
           (error.response.data.message.toLowerCase().includes('expired') ||
            error.response.data.message.toLowerCase().includes('token')))

        if (isTokenExpired) {
          // Show full-screen token expired modal on mount
          this.showTokenExpiredModal = true
          return
        }

        throw error;
      }
    }
  },
  computed: {
    contractDuration() {
      const dateOfJoining = this.onboardingUser.employment.date_of_joining
      const endDate = this.onboardingUser.employment.end_date
      // Check if both dates are set
      if (dateOfJoining && endDate) {
        return `${dateOfJoining} to ${endDate}`
      }

      return '' // Return an empty string if dates are not available
    },
    computeNationalities() {
      var data = require('i18n-nationality')
      data.registerLocale(require('i18n-nationality/langs/en.json'))
      const nationalityNames = data.getNames('en')
      const updatedNationalities = Object.values(nationalityNames).sort(
        function (a, b) {
          var textA = a.toUpperCase()
          var textB = b.toUpperCase()
          return textA < textB ? -1 : textA > textB ? 1 : 0
        }
      )
      return updatedNationalities
    },
    computedSalaries() {
      let arr = []
      var salaryKeyName = function (val) {
        return val.toLowerCase().replace(/\s/g, '_')
      }
      this.fixed.forEach((element) => {
        let obj = {
          name: element,
          key: salaryKeyName(element),
          value: 0,
        }
        arr.push(obj)
      })
      this.total_salary = arr
      return arr
    },
    computedTotalSalary() {
      let total = 0
      let arr = this.computedSalaries
      for (let i = 0; i < arr.length; i++) {
        this.onboardingUser.salary[
          arr[i].name.toLowerCase().replace(/ /g, '_')
        ] = arr[i].value
        total += parseFloat(arr[i].value)
      }

      this.onboardingUser.salary.total_fixed = total
      return total.toString()
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
    'onboardingUser.employment.date_of_joining': function (newVal) {
      console.log('Date of joining changed:', newVal)
    },
    'onboardingUser.employment.end_date': function (newVal) {
      console.log('End date changed:', newVal)
    },
    contractDuration: function (newVal) {

      this.onboardingUser.employment.contract_duration = newVal
    },
  },
  // created(){
  //   this.verifyUserIsAuthenticated()
  // }
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

/* Fade in animation for token expired modal */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.tw-animate-fade-in-up {
  animation: fade-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
</style>
