<template>
  <v-row>
    <v-col cols="12" v-if="computeTotalSalary || !loading">
      <v-card id="tall_dialog">
        <v-card-title id="card-title">
          <h4 class="text--text">{{ headerTitle }}</h4>
          <div class="flex_row justify-end">
            <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="handleModel">Cancel</v-btn>
            <v-img src="/animated/ring.svg" width="40px" height="40px" contain class=""
                   v-if="updateLoading"></v-img>
            <v-btn class="tall__btn px-9" color="primary" min-width="100px" @click="editEmployeesDetails"
                   v-else>Update
            </v-btn>
          </div>
        </v-card-title>
        <v-divider id="divider" class="mt-5"></v-divider>
        <v-card-text id="card-text">
          <v-row class="pa-0 ma-0" v-if="headerTitle == 'COMPANY DETAILS'">
            <v-col cols="4">
              <CustomInputContainer label="Legal Name">
                <div slot="input">
                  <v-text-field v-model="companiesDetailsObj.legal_name" placeholder="name" outlined
                                dense :rules="main_rule" />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Company Company Name">
                <div slot="input">
                  <v-text-field v-model="companiesDetailsObj.company_name" placeholder="company Name"
                                outlined dense :rules="main_rule" />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Registration Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_registration_number"
                    placeholder="Enter number"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Company Phone Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_phone"
                    type="number"
                    placeholder="Phone number"
                    outlined
                    dense
                    :rules="number_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Company Email">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_email"
                    placeholder="Enter mail"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Company Address">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_address"
                    placeholder="Enter address"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6">
              <CustomInputContainer label="Country">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_country"
                    placeholder="Enter country"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6">
              <CustomInputContainer label="Website">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_website"
                    placeholder="Enter website"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'PAYROLL DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.payroll_details
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Invoice Date">
                <div slot="input">
                  <v-combobox
                    v-model="companiesDetailsObj.payroll_details.invoice_date"
                    :items="dateOptions"
                    item-text="display"
                    item-value="value"
                    placeholder="Invoice Date"
                    outlined
                    dense
                    :rules="main_rule"
                    :filter="customFilter"
                    @update:search-input="
                      (val) => onSearchInput(val, 'invoice_date')
                    "
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Press enter to save "{{
                              searchInputs.invoice_date
                            }}"
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="4">
              <CustomInputContainer label="Payment Due Date">
                <div slot="input">
                  <v-combobox
                    v-model="
                      companiesDetailsObj.payroll_details
                        .payment_due_notification
                    "
                    :items="dateOptions"
                    item-text="display"
                    item-value="value"
                    placeholder="Payment Due Date"
                    outlined
                    dense
                    :rules="main_rule"
                    :filter="customFilter"
                    @update:search-input="
                      (val) => onSearchInput(val, 'payment_due')
                    "
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Press enter to save "{{ searchInputs.payment_due }}"
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="4">
              <CustomInputContainer label="Salary Date">
                <div slot="input">
                  <v-combobox
                    v-model="
                      companiesDetailsObj.payroll_details.salary_payment_date
                    "
                    :items="dateOptions"
                    item-text="display"
                    item-value="value"
                    placeholder="Salary Date"
                    outlined
                    dense
                    :rules="main_rule"
                    :filter="customFilter"
                    @update:search-input="
                      (val) => onSearchInput(val, 'salary_date')
                    "
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Press enter to save "{{ searchInputs.salary_date }}"
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'EMERGENCY CONTACT' &&
              companiesDetailsObj &&
              companiesDetailsObj.emergency
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.emergency.name"
                    placeholder="Name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Relationship">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.emergency.relationship"
                    placeholder="Relationship"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Phone">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.emergency.phone"
                    placeholder="Phone"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Name 1">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.emergency.name_1"
                    placeholder="Name 1"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Relationship 1">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.emergency.relationship_1"
                    placeholder="Relationship 1"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Phone 1">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.emergency.phone_1"
                    placeholder="Phone 1"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row class="pa-0 ma-0" v-if="headerTitle == 'EMPLOYMENT DETAILS'">
            <v-col cols="4">
              <CustomInputContainer label="Company Name">
                <div slot="input">
                  <v-select
                    :items="employers"
                    placeholder="Select Employers"
                    solo
                    dense
                    v-model="companiesDetailsObj.company_id"
                    item-text="company_name"
                    item-value="id"
                    class="proposalDialog_date_field2"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Manager Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.manager_name"
                    placeholder="Manager Name"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Employee Status">
                <div slot="input">
                  <v-select
                    :items="userStatusList"
                    placeholder="Employee Status"
                    solo
                    dense
                    v-model="companiesDetailsObj.user_status"
                    class="proposalDialog_date_field2"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Employee level">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.employment.designation"
                    placeholder="Employee level"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Role Type">
                <div slot="input">
                  <v-select
                    :items="userRolesList"
                    placeholder="Role Type"
                    item-text="role_name"
                    item-value="id"
                    solo
                    dense
                    v-model="companiesDetailsObj.role_ID"
                    class="proposalDialog_date_field2"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Department">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.department"
                    placeholder="Department"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Team">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.team"
                    placeholder="Team"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Work Schedule">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.work_schedule"
                    placeholder="Work Schedule"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Work Location">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.employment.work_location"
                    placeholder="Work Location"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Visa Issuance Authority">
                <div slot="input">
                  <v-select
                    :items="[
                      'Dynamic Employment Services',
                      'Executive Employment Services',
                    ]"
                    placeholder="Role Type"
                    item-text="role_name"
                    item-value="id"
                    solo
                    dense
                    v-model="companiesDetailsObj.employment.visa_sponsor_type"
                    class="proposalDialog_date_field2"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
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
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="companiesDetailsObj.employment.date_of_joining"
                        placeholder="mm/dd/yy"
                        class="proposalDialog_date_field2"
                        solo
                        dense
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :rules="main_rule"
                      >
                        <template v-slot:append>
                          <div class="">
                            <CalenderSvg />
                          </div>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="companiesDetailsObj.date_of_joining"
                      @input="date_menu = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Probation">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.probation_period"
                    placeholder="Probation"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Probation Ends">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.probation_period_end"
                    placeholder="Probation Ends"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Employment Type">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.employment.employment_type"
                    placeholder="Employment Type"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Contract Type">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.employment.contract_type"
                    placeholder="Contract Type"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Cost Center">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.cost_center"
                    placeholder="Cost Center"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Medical Center">
                <div slot="input">
                  <v-select
                    v-model="companiesDetailsObj.employment.medical_center"
                    :items="medicalCenters"
                    item-text="name"
                    return-object
                    placeholder="Select Medical Center"
                    outlined
                    dense
                    :loading="loadingCenters"
                    :disabled="loadingCenters"
                    @focus="fetchCenters('medical')"
                  >
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          item.address
                        }}</v-list-item-subtitle>
                        <v-list-item-subtitle>{{
                          item.timings
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="EID Center">
                <div slot="input">
                  <v-select
                    v-model="companiesDetailsObj.employment.eid_center"
                    :items="eidCenters"
                    item-text="name"
                    placeholder="Select EID Center"
                    outlined
                    dense
                    :loading="loadingCenters"
                    :disabled="loadingCenters"
                    return-object
                    @focus="fetchCenters('eid')"
                  >
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          item.address
                        }}</v-list-item-subtitle>
                        <v-list-item-subtitle>{{
                          item.timings
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Tawjeeh Center">
                <div slot="input">
                  <v-select
                    v-model="companiesDetailsObj.employment.tawjeeh_center"
                    :items="tawjeehCenters"
                    item-text="name"
                    placeholder="Select Tawjeeh Center"
                    outlined
                    dense
                    :loading="loadingCenters"
                    :disabled="loadingCenters"
                    return-object
                    @focus="fetchCenters('tawjeeh')"
                  >
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          item.address
                        }}</v-list-item-subtitle>
                        <v-list-item-subtitle>{{
                          item.timings
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <!-- <v-col cols="4">
              <CustomInputContainer label="HR Specialist">
                <div slot="input">
                  <v-select
                    v-model="companiesDetailsObj.employment.hr_specialist"
                    :items="hr_specialists"
                    item-text="name"
                    item-value="id"
                    return-object
                    placeholder="Select HR Specialist"
                    outlined
                    dense
                    @focus="fetchSpecialists('hr specialists')"
                  >
                    <template v-slot:selection="{ item }">
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>
                          <span
                            >{{ item.first_name }} {{ item.last_name }}</span
                          >
                        </v-list-item-title>
                      </v-list-item-content>
                    </template>
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col> -->
            <v-col cols="4">
              <CustomInputContainer label="HR Specialist and Support Agent">
                <div slot="input">
                  <v-select
                    v-model="companiesDetailsObj.employment.support_agent"
                    :items="supportAgents"
                    item-text="name"
                    return-object
                    placeholder="Select HR Specialist and Support Agent"
                    outlined
                    dense
                    @focus="fetchSpecialists('support agents')"
                  >
                    <template v-slot:selection="{ item }">
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>
                          <span
                            >{{ item.first_name }} {{ item.last_name }}</span
                          >
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
                    v-model="companiesDetailsObj.employment.escalation_manager"
                    :items="escalation_managers"
                    item-text="name"
                    return-object
                    placeholder="Select Escalation Manager"
                    outlined
                    dense
                    @focus="fetchSpecialists('escalation managers')"
                  >
                    <template v-slot:selection="{ item }">
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>
                          <span
                            >{{ item.first_name }} {{ item.last_name }}</span
                          >
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
                    v-model="companiesDetailsObj.employment.insurance_agent"
                    :items="insuranceAgents"
                    item-text="name"
                    return-object
                    placeholder="Select Insurance Agent"
                    outlined
                    dense
                    @focus="fetchSpecialists('insurance agents')"
                  >
                    <template v-slot:selection="{ item }">
                      <span>{{ item.full_name}}</span>
                    </template>
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>
                          <span
                            >{{ item.full_name}}</span
                          >
                        </v-list-item-title>
                      </v-list-item-content>
                    </template>
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Assigned PRO">
                <div slot="input">
                  <v-select
                    v-model="companiesDetailsObj.employment.assigned_pro"
                    :items="pros"
                    item-text="name"
                    return-object
                    placeholder="Select PRO"
                    outlined
                    dense
                    @focus="fetchSpecialists('PRO')"
                  >
                    <template v-slot:selection="{ item }">
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>
                          <span
                            >{{ item.first_name }} {{ item.last_name }}</span
                          >
                        </v-list-item-title>
                      </v-list-item-content>
                    </template>
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Internal Team">
                <div slot="input">
                  <v-select
                    :items="['Yes', 'No']"
                    v-model="displayLeadProDropdown"
                    placeholder="Select Lead PRO"
                    solo
                    dense
                    append-icon="fa-chevron-down"
                    @change="handleLeadProChange"
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <!-- Common Modal for Internal Team confirmation -->
            <CommonModal
              :open="showLeadProModal"
              title="Change Internal Team Status"
              message="Note that changing the internal team status will make this employee one of the mentionable users on visa process comments, and among the assignable PROs on leads module."
              confirm-text="Proceed"
              cancel-text="Cancel"
              type="info"
              @confirm="confirmLeadProChange"
              @cancel="cancelLeadProChange"
            />
            <v-row class="pt-3" style="display: flex; align-items: center">
              <!--              <v-col cols="3" class="d-flex align-center">-->
              <!--                <v-checkbox-->
              <!--                  v-model="has_hr_specialist_role"-->
              <!--                  label="HR Specialist"-->
              <!--                  class="mr-2"-->
              <!--                ></v-checkbox>-->

              <!--              </v-col>-->

              <!--              <v-col cols="3" class="d-flex align-center">-->
              <!--                <v-checkbox-->
              <!--                  v-model="has_support_agent_role"-->
              <!--                  label="Support Agent"-->
              <!--                  class="mr-2"-->
              <!--                ></v-checkbox>-->

              <!--              </v-col>-->

              <!--              <v-col cols="3" class="d-flex align-center">-->
              <!--                <v-checkbox-->
              <!--                  v-model="has_escalation_manager_role"-->
              <!--                  label="Escalation Manager"-->
              <!--                  class="mr-2"-->
              <!--                ></v-checkbox>-->

              <!--              </v-col>-->
              <!--              <v-col cols="3" class="d-flex align-center">-->
              <!--                <v-checkbox-->
              <!--                  v-model="has_insurance_agent_role"-->
              <!--                  label="Insurance Agent"-->
              <!--                  class="mr-2"-->
              <!--                ></v-checkbox>-->

              <!--              </v-col>-->
            </v-row>
          </v-row>

          <v-row class="pa-0 ma-0" v-if="headerTitle == 'EMPLOYEE DETAILS'">
            <v-col cols="4">
              <CustomInputContainer label="First Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.first_name"
                    placeholder="First Name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Middle Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.middle_name"
                    placeholder="Middle Name"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Last Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.last_name"
                    placeholder="Last Name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Email">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.email"
                    placeholder="Email"
                    outlined
                    dense
                    :rules="emailRules"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Phone">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.personal.phone"
                    placeholder="Phone"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Date of Birth">
                <div slot="input">
                  <v-menu
                    v-model="date_menu_dob"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="companiesDetailsObj.personal.dob"
                        placeholder="mm/dd/yy"
                        class="proposalDialog_date_field2"
                        solo
                        dense
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :rules="main_rule"
                      >
                        <template v-slot:append>
                          <div class="">
                            <CalenderSvg />
                          </div>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="companiesDetailsObj.personal.dob"
                      @input="date_menu_dob = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Gender">
                <div slot="input">
                  <v-select
                    :items="['Male', 'Female', 'Not Disclosed']"
                    placeholder="Gender"
                    solo
                    dense
                    :rules="main_rule"
                    v-model="companiesDetailsObj.personal.gender"
                    class="proposalDialog_date_field2"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Marital Status">
                <div slot="input">
                  <v-select
                    :items="['Single', 'Married', 'Not Disclosed']"
                    placeholder="Marital Status"
                    solo
                    dense
                    v-model="companiesDetailsObj.personal.marital_status"
                    :rules="main_rule"
                    class="proposalDialog_date_field2"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Nationality">
                <div slot="input">
                  <v-select
                    :items="computeNationalities"
                    placeholder="Nationality"
                    solo
                    dense
                    v-model="companiesDetailsObj.personal.nationality"
                    :rules="main_rule"
                    class="proposalDialog_date_field2"
                    append-icon="fa-chevron-down"
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Allergies">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.personal.allergies"
                    placeholder="Allergies"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Internal Designation">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.employment.designation"
                    placeholder="Internal Designation"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Visa Designation">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.employment.visa_designation"
                    placeholder="Visa Designation"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="4">
              <CustomInputContainer label="DOJ">
                <div slot="input">
                  <v-menu
                    v-model="date_menu_doj"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="companiesDetailsObj.date_of_joining"
                        placeholder="mm/dd/yy"
                        class="proposalDialog_date_field2"
                        solo
                        dense
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :rules="main_rule"
                      >
                        <template v-slot:append>
                          <div class="">
                            <CalenderSvg />
                          </div>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="companiesDetailsObj.date_of_joining"
                      @input="date_menu_doj = false"
                    />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Work Location">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.employment.work_location"
                    placeholder="Work Location"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Address">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.personal.address"
                    placeholder="Address"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="4">
              <CustomInputContainer label="Specialty">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.personal.speciality"
                    placeholder="Specialty"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="4">
              <CustomInputContainer label="Skill Sets">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.personal.skill_sets"
                    placeholder="Skill Sets"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'BANKING DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.bank
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Bank Name">
                <div slot="input">
                  <v-autocomplete
                    ref="first_name"
                    :items="bankDetails"
                    class="proposalDialog_date_field2"
                    item-text="bankname"
                    :return-object="false"
                    item-value="bankname"
                    v-model.trim="companiesDetailsObj.bank.bank_name"
                    placeholder="Select Bank"
                    @change="updateBank(companiesDetailsObj.bank.bank_name)"
                    :menu-props="{ closeOnContentClick: true }"
                    solo
                    outlined
                    dense
                  ></v-autocomplete>
                  <!-- <v-text-field v-model="companiesDetailsObj.bank.bank_name" placeholder="Bank Name"
                      outlined dense :rules="main_rule" /> -->
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Routing Code Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank.routing_code"
                    placeholder="Routing Code Number"
                    outlined
                    disabled
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Account Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank.account_number"
                    placeholder="Account Number"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="IBAN">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank.iban"
                    placeholder="IBAN"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Bank Post Office">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank.bank_post_office"
                    placeholder="Bank Post Office"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Bank Address">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank.bank_address"
                    placeholder="Bank Address"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Salary Payment Mode">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank.salary_payment_mode"
                    placeholder="Salary Payment Mode"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'SALARY  DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.salary
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Basic Salary">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.basic_salary"
                    placeholder="Basic Salary"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Housing / HRA Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.housing_allowance"
                    placeholder="Housing Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Other Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.other_allowance"
                    placeholder="Other Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <!-- <v-col cols="4">
              <CustomInputContainer label="Car Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.car_allowance"
                    placeholder="Car Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col> -->
            <v-col cols="4">
              <CustomInputContainer label="Petrol Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.petrol_allowance"
                    placeholder="Petrol Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Transportation / Car Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.transportation_allowance"
                    placeholder="Transportation Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="4">
              <CustomInputContainer label="Food Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.food_allowance"
                    placeholder="Food Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Mobile Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.salary.mobile_allowance"
                    placeholder="Mobile Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <!-- <v-col cols="4">
              <CustomInputContainer label="Salary Rotation Required">
                <div slot="input">
                    <v-switch
                      v-model="companiesDetailsObj.salary.rotation_required"
                      color="primary"
                      :label="companiesDetailsObj.salary.rotation_required ? 'YES' : 'NO'"
                    ></v-switch>
                </div>
              </CustomInputContainer>
            </v-col> -->
            <v-col cols="4">
              <CustomInputContainer label="Total Fixed">
                <div slot="input">
                  <v-text-field
                    :value="calculateTotalFixed"
                    placeholder="Total Fixed"
                    outlined
                    dense
                    readonly
                    disabled
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'FIXED NON WPS SALARY DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.nonwps_salary
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Basic Salary">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.basic_salary"
                    placeholder="Basic Salary"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Housing / HRA Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="
                      companiesDetailsObj.nonwps_salary.housing_allowance
                    "
                    placeholder="Housing Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Other Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.other_allowance"
                    placeholder="Other Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Car Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.car_allowance"
                    placeholder="Car Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Petrol Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.petrol_allowance"
                    placeholder="Petrol Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Total Fixed">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.total_fixed"
                    placeholder="Total Fixed"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'NON WPS SALARY DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.nonwps_salary
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Basic Salary">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.basic_salary"
                    placeholder="Basic Salary"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Housing / HRA Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="
                      companiesDetailsObj.nonwps_salary.housing_allowance
                    "
                    placeholder="Housing Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Other Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.other_allowance"
                    placeholder="Other Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Car Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.car_allowance"
                    placeholder="Car Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Petrol Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.petrol_allowance"
                    placeholder="Petrol Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Total Fixed">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.total_fixed"
                    placeholder="Total Fixed"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'FIXED NON WPS SALARY DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.nonwps_salary
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Basic Salary">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.basic_salary"
                    placeholder="Basic Salary"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Housing Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="
                      companiesDetailsObj.nonwps_salary.housing_allowance
                    "
                    placeholder="Housing Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Other Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.other_allowance"
                    placeholder="Other Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Car Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.car_allowance"
                    placeholder="Car Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Petrol Allowance">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.petrol_allowance"
                    placeholder="Petrol Allowance"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Total Fixed">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.nonwps_salary.total_fixed"
                    placeholder="Total Fixed"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'COMPANY LOCATIONS' &&
              companiesDetailsObj &&
              companiesDetailsObj.company_locations
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Company Country">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_country"
                    placeholder="Company Country"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Company Address">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_address"
                    placeholder="Company Address"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

     <v-col v-else>
        <v-card class="pa-3">
          <v-card-title class="text-h5">No Company Selected</v-card-title>
          <v-card-text>Please select a company from the list above.</v-card-text>
        </v-card>
    </v-col>
  </v-row>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import CommonModal from '@/components/Common/CommonModal.vue'
import countries from 'countries-list'
import { debounce } from 'lodash'

export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    CommonModal,
    countries,
  },
  props: {
    handleModel: Function,
    companiesDetails: Array,
    selectedCustomer: String,
    headerTitle: String,
  },

  data() {
    return {
      main_rule: [(v) => !!v || 'This filed is required'],
      number_rule: [(v) => !!v || 'Only numeric values'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      email_rule: [],
      phone_rule: [],
      companiesDetailsObj: {
        company_id: '',
        manager_name: '',
        user_status: '',
        department: '',
        team: '',
        work_schedule: '',
        date_of_joining: '',
        probation_period: '',
        probation_period_end: '',
        cost_center: '',
        role_ID: '',
        role_name: '',
        employment: {
          designation: '',
          work_location: '',
          visa_sponsor_type: '',
          employment_type: '',
          contract_type: '',
          medical_center: null,
          eid_center: null,
          tawjeeh_center: null,
          support_agent: null,
          escalation_manager: null,
          insurance_agent: null,
          assigned_pro: null,
        },
        is_internal_staff: false,
      },
      leadProDropdown: 'No',
      displayLeadProDropdown: 'No',
      showLeadProModal: false,
      pendingLeadProValue: null,
      employers: [],
      insuranceAgents: [],
      escalation_managers: [],
      supportAgents: [],
      hr_specialists: [],
      userStatusList: [],
      userRolesList: [],
      pros: [],
      date_menu: false,
      date_menu_dob: false,
      date_menu_doj: false,
      updateLoading: false,
      bankDetails: [],
      has_support_agent_role: false,
      has_hr_specialist_role: false,
      has_escalation_manager_role: false,
      has_insurance_agent_role: false,
      eidCenters: [],
      tawjeehCenters: [],
      medicalCenters: [],
      loadingCenters: false,
      searchInputs: {
        invoice_date: '',
        payment_due: '',
        salary_date: '',
      },
      loading: false,
      dateOptions: [
        { display: 'Not Applicable', value: 'N/A' },
        ...Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const suffix = this.getOrdinalSuffix(day)
          return {
            display: `${day}${suffix} of each month`,
            value: day.toString(),
          }
        }),
      ],
    }
  },
  async mounted() {
    this.loading = true
    this.$set(this, 'companiesDetailsObj', this.companiesDetails[0])

    // Prepopulate Lead PRO dropdown and safely set company_id
    if (this.headerTitle === 'EMPLOYMENT DETAILS' && this.companiesDetailsObj) {
      // Defensive: ensure employment object exists
      if (!this.companiesDetailsObj.employment) {
        this.$set(this.companiesDetailsObj, 'employment', {})
      }
      // Defensive: ensure company_id exists
      if (typeof this.companiesDetailsObj.company_id === 'undefined') {
        this.$set(this.companiesDetailsObj, 'company_id', '')
      }
      // Defensive: ensure is_internal_staff exists
      if (typeof this.companiesDetailsObj.is_internal_staff === 'undefined') {
        this.$set(this.companiesDetailsObj, 'is_internal_staff', false)
      }
      // Prepopulate dropdown
      this.leadProDropdown = this.companiesDetailsObj.is_internal_staff ? 'Yes' : 'No'
      this.displayLeadProDropdown = this.leadProDropdown
    }

    await Promise.all([this.getEmployersList(),
    this.getUsersStatusList(),
    this.getUsersRoleList(),
    this.getBankDetails()])

    console.log('company Details: ', this.companiesDetailsObj)
    this.loading = false

  },
  methods: {
    handleLeadProChange(value) {
      // Only show the modal if the value is changing
      if (value !== this.leadProDropdown) {
        // Store the pending value for reference
        this.pendingLeadProValue = value;
        // Show the confirmation modal
        this.showLeadProModal = true;
      }
    },

    confirmLeadProChange() {
      // Apply the pending value to the actual leadProDropdown
      this.leadProDropdown = this.pendingLeadProValue;
      // Close the modal
      this.showLeadProModal = false;
    },

    cancelLeadProChange() {
      // Simply reset the display value to the original value
      this.displayLeadProDropdown = this.leadProDropdown;
      // Close the modal
      this.showLeadProModal = false;
    },

    resetForm() {
      // Reset all relevant form fields to their initial state
      this.companiesDetailsObj = {
        company_id: '',
        manager_name: '',
        user_status: '',
        department: '',
        team: '',
        work_schedule: '',
        date_of_joining: '',
        probation_period: '',
        probation_period_end: '',
        cost_center: '',
        role_ID: '',
        role_name: '',
        employment: {
          designation: '',
          work_location: '',
          visa_sponsor_type: '',
          employment_type: '',
          contract_type: '',
          medical_center: null,
          eid_center: null,
          tawjeeh_center: null,
          support_agent: null,
          escalation_manager: null,
          insurance_agent: null,
          assigned_pro: null,
        },
        is_internal_staff: false,
      };
      this.leadProDropdown = 'No';
      this.displayLeadProDropdown = 'No';
      // ...reset other fields as needed...
    },

    updateBank(item) {
      console.log('item', item)
      let bankObj = this.bankDetails.find(
        (bank) => bank.bankname === item
      )
      let routingCode = bankObj ? bankObj.routingcode : ''
      if (this.companiesDetailsObj && this.companiesDetailsObj.bank) {
        this.companiesDetailsObj.bank.routing_code = routingCode
      }
    },
    close() {
      this.$emit('close', true)
    },
    async getBankDetails() {
      await this.$axios
        .$get(`https://centralapi.nathanhr.ae/banks`)
        .then((response) => {
          this.bankDetails = response
        })

    },
    findRoutingCode(bankArray, bankName) {
      bankName = bankName.toString()


      let bank = bankArray.find((bank) => {
        return bank.bankname.toString() == bankName.toString()
      })

      return bank ? bank.routingcode : ''
    },
    async getEmployersList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$get(`/companies/`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.employers = response.map(company => ({
            ...company,
            id: company._id
          }))
        })
    },
    async getUsersStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`/users/list/status`, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.userStatusList = res
        })
    },
    async getUsersRoleList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$get(`/roles/`, { headers: { Authorization: AuthStr } })
        .then((res) => {
          this.userRolesList = res
        })
    },
    excludeAccess(center) {
      if (!Array.isArray(center) || center.length === 0) {
        return []
      }
      const { access, ...rest } = center
      return rest
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
            console.log("The agents are", response)
            this.insuranceAgents = response.map((agent) => ({
              ...agent,
              full_name: `${agent.full_name}`,
            }));
            console.log("The insurance agents are", this.insuranceAgents)
          })
          .catch((error) => {
            console.error('API Error:', error.response || error);
          });
      } else {
        this.insuranceAgents = [];
      }
    },
    async fetchSpecialists(role) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        if (role === 'insurance agents') {
          await this.getInsuranceAgent()
          return
        }

        let response = await this.$axios.$get(`/users?role=${role}`, {
          headers: { Authorization: AuthStr },
        })
        console.log("The specialist is", response)
        if (response) {
          if (role === 'hr specialists') {
            console.log("The specialist is", response)
            this.hr_specialists = response
          } else if (role === 'escalation managers') {
            this.escalation_managers = response
          } else if (role === 'support agents') {
            this.supportAgents = response
          } else if (role === 'PRO') {
            this.pros = response
          }
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    async editEmployeesDetails() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.updateLoading = true

      if (this.headerTitle == 'COMPANY DETAILS') {
        let obj = {
          legal_name: this.companiesDetailsObj.legal_name,
          company_name: this.companiesDetailsObj.company_name,
          registration_number:
            this.companiesDetailsObj.company_registration_number,
          phone: this.companiesDetailsObj.company_phone,
          email: this.companiesDetailsObj.company_email,
          address: this.companiesDetailsObj.company_address,
          website: this.companiesDetailsObj.company_website,
          country: this.companiesDetailsObj.company_country,
        }

        await this.$axios
          .$patch(`/companies/${this.companiesDetailsObj.company_id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      } else if (this.headerTitle == 'PAYROLL DETAILS') {
        let obj = {
          payroll_details: {
            salary_payment_date:
              this.companiesDetailsObj.payroll_details.salary_payment_date,
            payment_due_notification:
              this.companiesDetailsObj.payroll_details.payment_due_notification,
            invoice_date: this.companiesDetailsObj.payroll_details.invoice_date,
          },
        }
        await this.$axios
          .$patch(`/users/${this.companiesDetailsObj._id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      } else if (this.headerTitle == 'EMERGENCY CONTACT') {
        let obj = {
          emergency: {
            name: this.companiesDetailsObj.emergency.name,
            relationship: this.companiesDetailsObj.emergency.relationship,
            phone: this.companiesDetailsObj.emergency.phone,
            name_1: this.companiesDetailsObj.emergency.name_1,
            relationship_1: this.companiesDetailsObj.emergency.relationship_1,
            phone_1: this.companiesDetailsObj.emergency.phone_1,
          },
        }
        await this.$axios
          .$patch(`/users/${this.companiesDetailsObj._id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      } else if (this.headerTitle == 'EMPLOYMENT DETAILS') {
        let obj = {
          company_id: this.companiesDetailsObj.company_id || null,
          manager_name: this.companiesDetailsObj.manager_name || null,
          user_status: this.companiesDetailsObj.user_status || null,
          designation: this.companiesDetailsObj.employment.designation || null,
          role_ID: this.companiesDetailsObj.role_ID || null,
          email: this.companiesDetailsObj.email || null,
          personal: this.companiesDetailsObj.personal || null,
          department: this.companiesDetailsObj.department || null,
          work_schedule: this.companiesDetailsObj.work_schedule || null,
          work_location:
            this.companiesDetailsObj.employment.work_location || null,
          date_of_joining: this.companiesDetailsObj.date_of_joining || null,
          probation_period: this.companiesDetailsObj.probation_period || null,
          probation_period_end:
            this.companiesDetailsObj.probation_period_end || null,
          employment_type:
            this.companiesDetailsObj.employment.employment_type || null,
          contract_type:
            this.companiesDetailsObj.employment.contract_type || null,
          cost_center: this.companiesDetailsObj.cost_center || null,
          onboardingDetails: {
            eid_center: this.companiesDetailsObj.employment.eid_center || [],
            medical_center:
              this.companiesDetailsObj.employment.medical_center || [],
            tawjeeh_center:
              this.companiesDetailsObj.employment.tawjeeh_center || [],
            assigned_hr_specialist:
              this.companiesDetailsObj.employment.hr_specialist?.id,
            assigned_escalation_manager:
              this.companiesDetailsObj.employment.escalation_manager?.id,
            assigned_support_agent:
              this.companiesDetailsObj.employment.support_agent?.id,
            assigned_insurance_agent:
              this.companiesDetailsObj.employment.insurance_agent,
            assigned_pro: this.companiesDetailsObj.employment.assigned_pro?.id,
          },
          has_support_agent_role: this.has_support_agent_role || false,
          has_hr_specialist_role: this.has_hr_specialist_role || false,
          has_escalation_manager_role:
            this.has_escalation_manager_role || false,
          has_insurance_agent_role: this.has_insurance_agent_role || false,
        }



        Object.keys(obj).forEach((key) => {
          if (
            obj[key] === null ||
            (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0)
          ) {
            delete obj[key]
          }
        })

        // Add is_internal_staff to payload at root level
        obj.is_internal_staff = this.leadProDropdown === 'Yes';

        try {
          let response = await this.$axios.$patch(
            `/users/${this.companiesDetailsObj._id}`,
            obj,
            { headers: { Authorization: AuthStr } }
          )

        } catch (error) {
          console.error(error)
          throw new Error(error)
        }

        this.close()
      } else if (this.headerTitle == 'BANKING DETAILS') {
        let routing = this.findRoutingCode(
          this.bankDetails,
          this.companiesDetailsObj.bank.bank_name
        )

        let obj = {
          bank: {
            bank_name: this.companiesDetailsObj.bank.bank_name,
            account_number: this.companiesDetailsObj.bank.account_number,
            iban: this.companiesDetailsObj.bank.iban,
            bank_post_office: this.companiesDetailsObj.bank.bank_post_office,
            bank_address: this.companiesDetailsObj.bank.bank_address,
            salary_payment_mode:
              this.companiesDetailsObj.bank.salary_payment_mode,
            routing_code: routing ,
          },
        }

        await this.$axios
          .$patch(`/users/${this.companiesDetailsObj._id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      } else if (this.headerTitle == 'SALARY  DETAILS') {
        const totalFixedSalary = this.calculateTotalFixed

        let obj = {
          salary: {
            basic_salary: Number(this.companiesDetailsObj.salary.basic_salary),
            housing_allowance: Number(
              this.companiesDetailsObj.salary.housing_allowance
            ),
            other_allowance: Number(
              this.companiesDetailsObj.salary.other_allowance
            ),
            // car_allowance: Number(
            //   this.companiesDetailsObj.salary.car_allowance
            // ),
            petrol_allowance: Number(
              this.companiesDetailsObj.salary.petrol_allowance
            ),
            transportation_allowance: Number(
              this.companiesDetailsObj.salary.transportation_allowance
            ),
            food_allowance: Number(
              this.companiesDetailsObj.salary.food_allowance
            ),
            mobile_allowance: Number(
              this.companiesDetailsObj.salary.mobile_allowance
            ),
            // rotation_required:  this.companiesDetailsObj.salary.rotation_required,
            total_fixed: totalFixedSalary,
          },
        }
        await this.$axios
          .$patch(`/users/${this.companiesDetailsObj._id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      } else if (this.headerTitle == 'FIXED NON WPS SALARY DETAILS') {
        let obj = {
          nonwps_salary: {
            basic_salary: Number(
              this.companiesDetailsObj.nonwps_salary.basic_salary
            ),
            housing_allowance: Number(
              this.companiesDetailsObj.nonwps_salary.housing_allowance
            ),
            other_allowance: Number(
              this.companiesDetailsObj.nonwps_salary.other_allowance
            ),
            // car_allowance: Number(
            //   this.companiesDetailsObj.nonwps_salary.car_allowance
            // ),
            petrol_allowance: Number(
              this.companiesDetailsObj.nonwps_salary.petrol_allowance
            ),
            total_fixed: Number(
              this.companiesDetailsObj.nonwps_salary.total_fixed
            ),
          },
        }
        await this.$axios
          .$patch(`/users/${this.companiesDetailsObj._id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      } else if (this.headerTitle == 'COMPANY LOCATIONS') {
        let obj = {
          country: this.companiesDetailsObj.company_country,
          address: this.companiesDetailsObj.company_address,
        }

        await this.$axios
          .$patch(`/companies/${this.companiesDetailsObj.company_id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      } else if (this.headerTitle == 'EMPLOYEE DETAILS') {
        let obj = {
          email: this.companiesDetailsObj.email,
          personal: this.companiesDetailsObj.personal,
          employment: this.companiesDetailsObj.employment,
          first_name: this.companiesDetailsObj.first_name,
          middle_name: this.companiesDetailsObj.middle_name,
          last_name: this.companiesDetailsObj.last_name,
          dob: this.companiesDetailsObj.personal?.dob,
          designation: this.companiesDetailsObj.employment.designation,
          date_of_joining: this.companiesDetailsObj.date_of_joining,
          work_location: this.companiesDetailsObj.employment.work_location,
        }

        await this.$axios
          .$patch(`/users/${this.companiesDetailsObj._id}`, obj, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.close()
          })
      }

      this.updateLoading = false
    },
    fetchCenters: debounce(async function (type) {
      if (this[`${type}Centers`].length > 0) return

      this.loadingCenters = true
      let typeMapping = {
        eid: 'eid_centers',
        medical: 'medical_centers',
        tawjeeh: 'tawjeeh_centers',
      }
      try {
        let center = typeMapping[type]
        const response = await this.$axios.get(
          `/configuration/medial/tawjeeh/eid/list?center=${center}`
        )
        this[`${type}Centers`] = response.data.data[`${center}`]
      } catch (error) {
        console.error(`Error fetching ${type} centers:`, error)
        throw error
      } finally {
        this.loadingCenters = false
      }
    }, 300),
    getOrdinalSuffix(day) {
      if (day > 3 && day < 21) return 'ᵗʰ'
      switch (day % 10) {
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
    onSearchInput(val, field) {
      this.searchInputs[field] = val
      if (val && !isNaN(val)) {
        const num = parseInt(val)
        if (num >= 1 && num <= 31) {
          const suffix = this.getOrdinalSuffix(num)
          this.searchInputs[field] = `${num}${suffix} of each month`
        }
      }
    },

    customFilter(item, queryText) {
      const text = item.display.toLowerCase()
      const searchText = queryText.toLowerCase()
      return text.indexOf(searchText) > -1
    },
  },
  computed: {
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
    computeTotalSalary() {
      let total = 0
      if (this.companiesDetailsObj?.salary) {
        for (const [key, value] of Object.entries(
          this.companiesDetailsObj.salary
        )) {
          if (key != 'total_fixed' && key != 'total_fixed') {
            total += Number(value)
          }
        }
        this.companiesDetailsObj.salary['total_fixed'] = total
      }
      return true
    },
    countryList() {
      const countryCodes = Object.keys(countries.countries)
      const countryNames = countryCodes.map(
        (code) => countries.countries[code].name
      )
      return countryNames
    },
    calculateTotalFixed() {
      const salary = this.companiesDetailsObj.salary;
      return (
        Number(salary.basic_salary || 0) +
        Number(salary.housing_allowance || 0) +
        Number(salary.other_allowance || 0) +
        Number(salary.car_allowance || 0) +
        Number(salary.petrol_allowance || 0) +
        Number(salary.food_allowance || 0) +
        Number(salary.transportation_allowance || 0) +
        Number(salary.mobile_allowance || 0)
      );
    }
  },
  watch: {
    companiesDetailsObj: {
      handler(val) {
        // Defensive: ensure is_internal_staff is always defined
        if (typeof val.is_internal_staff === 'undefined') {
          this.$set(this.companiesDetailsObj, 'is_internal_staff', false);
        }
        // Defensive: ensure company_id is always defined
        if (typeof val.company_id === 'undefined') {
          this.$set(this.companiesDetailsObj, 'company_id', '');
        }
      },
      deep: true
    },
    leadProDropdown(val) {
      // Sync dropdown to is_internal_staff
      this.companiesDetailsObj.is_internal_staff = val === 'Yes';
      // Make sure display value is in sync too
      this.displayLeadProDropdown = val;
    }
  },
  created() {
    // Defensive: ensure is_internal_staff and company_id are always defined on mount
    if (typeof this.companiesDetailsObj.is_internal_staff === 'undefined') {
      this.$set(this.companiesDetailsObj, 'is_internal_staff', false);
    }
    if (typeof this.companiesDetailsObj.company_id === 'undefined') {
      this.$set(this.companiesDetailsObj, 'company_id', '');
    }
  },
}
</script>
