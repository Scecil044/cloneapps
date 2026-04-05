<template>
  <div>
    <v-card flat>
      <v-data-table disable-pagination :headers="headers" :items="wfh_conditions" class="elevation-1" hide-default-footer>
        <template v-slot:[`item.wfh_name`]="{ item }">
          <v-chip style="cursor: pointer" dark @click="showRules(item), getCategories(defaultItem.eligibility)">
            {{ item.wfh_name }}
          </v-chip></template>

        <template v-slot:[`item.lapse_date`]="{ item }">
          {{ getDateFormat(item.lapse_date) || "---" }}
        </template>

        <template v-slot:[`item.lapse_condition`]="{ item }">
          <td v-if="item.lapse_condition == true">
            {{ "True" }}
          </td>
          <td v-if="item.lapse_condition == false">
            {{ "False" }}
          </td>
        </template>

        <template v-slot:top>
          <h3 class="px-5 pt-5">Setup WFH for the Company</h3>
          <p class="px-5 mb-0 caption grey--text">
            You can add WFH eligibility types which the company has as well as assign
            different rules for WFH based on the company.
          </p>
          <v-divider></v-divider>
          <v-toolbar flat>
            <v-toolbar-title>WFH conditions</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>

            <!-- New condtion create and edit section -->
            <v-dialog v-model="dialog" max-width="1200px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                  New WFH condition
                </v-btn>
              </template>
              <v-card class="overflow-x-hidden overflow-y-hidden">
                <v-row>
                  <v-toolbar class="text-h6" color="grey darken-3" dark>
                    <v-col cols="12" sm="6" lg="6" md="6">
                      {{ formTitle }}
                    </v-col>
                    <v-col cols="12" sm="6" lg="6" md="6">
                      <div style="float: right">
                        <v-tooltip top color="blue-grey darken-3">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn elevation="0" small fab @click.prevent="close"
                              class="blue-grey darken-3 white--text ml-2" v-bind="attrs"
                              v-on="on"><v-icon>mdi-close</v-icon></v-btn>
                          </template>
                          Close
                        </v-tooltip>
                      </div>
                    </v-col>
                  </v-toolbar>
                  <v-progress-linear :active="wfh_update_progress" :indeterminate="wfh_update_progress" top
                    color="deep-purple accent-4"></v-progress-linear>
                </v-row>

                <v-card-text>
                  <v-row class="pa-5">
                    <v-col cols="12" sm="12" md="6" style="border-right: 1px dotted black">
                      <v-container>
                        <v-form ref="form" v-model="valid" lazy-validation>
                          <v-row>
                            <!-- select WFH -->
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select @change="
                                    getPreviousWfhData(
                                      editedItem.wfh_name
                                    ),
                                    validateDuplicateWfhCondition(),
                                    getEmployees()
                                    " dense outlined label="WFH" :items="wfhType" :rules="WfhTypeRules"
                                    v-model="editedItem.wfh_name">
                                    <template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template>
                                  </v-select>
                                </v-col>
                              </template>
                              <span>Select what type of WFH you want to
                                configure.
                              </span>
                            </v-tooltip>

                            <!-- select eligibility -->
                            <v-tooltip bottom v-if="editedItem.wfh_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select @change="
                                    validateDuplicateWfhCondition(),
                                    getCategories(editedItem.eligibility),
                                    getEmployees()
                                    " dense outlined label="Eligibility" :items="eligibilityList"
                                    :rules="EligibiltyRules" v-model="editedItem.eligibility"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>Here you can select whether the WFH type is
                                based on a condition or <br />if all employees
                                will be Eligible.
                              </span>
                            </v-tooltip>

                            <!-- select category -->
                            <v-tooltip bottom v-if="editedItem.eligibility !== 'All' &&
                              editedItem.wfh_name != '' && editedItem.eligibility != 'Marital Status'
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select @change="
                                    validateDuplicateWfhCondition(),
                                    getEmployees()
                                    " dense outlined label="Category" :items="categoryList" :rules="categoryValidate"
                                    multiple v-model="editedItem.employee_category"><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>If the WFH type is based on a condition,
                                select the category of the condition here.<br />
                                IE if “Department” was selected as
                                Eligibility,<br />
                                then here you will select which departments will
                                have this leave type.</span>
                            </v-tooltip>

                            <!-- select accessibilty -->
                            <v-tooltip bottom v-if="editedItem.wfh_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select dense outlined label="Access" :items="wfhAccessList" :rules="AccessRules"
                                    v-model="editedItem.access"><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>Access refers to when the employees will be
                                able to access the WFH type,<br />
                                IE if “After 6 Moths” is selected then
                                employees<br />
                                can only access the leave type after 6 months
                                with the company.
                              </span>
                            </v-tooltip>

                            <!-- No.of days for "Other" in access -->
                            <v-tooltip bottom v-if="editedItem.access.toLowerCase() == 'other' &&
                              editedItem.wfh_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined label="No.of days" :rules="daysOtherValidate"
                                    v-model="editedItem.wfh_access_after_days_count
                                      "><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Provide after how many days will the employee
                                have access for the selected WFH type.
                              </span>
                            </v-tooltip>

                            <!-- Get the max number of days -->
                            <v-tooltip bottom v-if="editedItem.wfh_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined :rules="maxDaysValidate"
                                    label="Max no. of days" v-model="editedItem.max_days_a_year
                                      "><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Use this information to provide how many
                                days WFH is allowed based on lapse condition
                              </span>
                            </v-tooltip>

                          </v-row>

                          <!-- New Row for restriction option-->
                          <v-row>
                            <v-tooltip bottom v-if="editedItem.wfh_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch v-model="editedItem.restriction_conditional" label="Restriction"><template
                                      slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-switch></v-col>
                              </template>
                              <span>Use the conditional option if the
                                max no of days have any restriction. <br />
                                Example, in a month only 7 days WFH is allowed Or in a week only 2 days WFH is allowed.
                              </span>
                            </v-tooltip>
                          </v-row>

                          <!-- New Row for restriction selection-->
                          <v-row>
                            <v-tooltip bottom v-if="editedItem.wfh_name != '' && editedItem.restriction_conditional">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined
                                    :rules="(editedItem.restriction_conditional && editedItem.restriction_type == 'monthly' ?
                                      (editedItem.restriction_days <= 31 && editedItem.restriction_days >= 1) ? [] : restrictionMonthDaysValidate :
                                      (editedItem.restriction_days <= 7 && editedItem.restriction_days >= 1) ? [] : restrictionWeekDaysValidate)"
                                    label="No. of days" v-model="editedItem.restriction_days"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>

                                </v-col>
                              </template>
                              <span>Use this information to provide after how many
                                days since Date of Joining will the given <br />
                                lumpsum amount be credited to the employees. PS:
                                Lumpsum days are always credited to the
                                employee<br />
                                at the start of the fiscal year.
                              </span>
                            </v-tooltip>
                            <v-tooltip bottom v-if="editedItem.wfh_name != '' && editedItem.restriction_conditional">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-radio-group mandatory row dense outlined v-model="editedItem.restriction_type">

                                    <v-radio label="Weekly" value="weekly"></v-radio>
                                    <v-radio label="Monthly" value="monthly"></v-radio>
                                    <template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template>
                                  </v-radio-group>

                                </v-col>
                              </template>
                              <span>Use this information to provide after how many
                                days since Date of Joining will the given <br />
                                lumpsum amount be credited to the employees. PS:
                                Lumpsum days are always credited to the
                                employee<br />
                                at the start of the fiscal year.
                              </span>

                            </v-tooltip>

                          </v-row>

                          <!-- Lapse selection -->
                          <v-row>
                            <v-tooltip bottom v-if="editedItem.wfh_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch v-model="editedItem.lapse_condition" label="Lapse Selection">
                                    <template slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template>
                                  </v-switch></v-col>
                              </template>
                              <span>Trigger the switch on if want to set the lapse date.</span>
                            </v-tooltip>

                            <!-- Lapse date selection -->

                            <v-col cols="12" sm="6" md="6" v-if="editedItem.lapse_condition == true &&
                              editedItem.wfh_name != ''
                              ">
                              <v-row>
                                <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40"
                                  transition="scale-transition" offset-y min-width="auto">
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-text-field dense :rules="(editedItem.lapse_condition) ? lapseDateValidate : []"
                                      v-model="editedItem.lapse_date" label="Lapse date" prepend-icon="mdi-calendar"
                                      readonly outlined v-bind="attrs" v-on="on"><v-tooltip bottom slot="append-outer">
                                        <template v-slot:activator="{ on: tooltip }">
                                          <v-icon small v-on="{ ...tooltip, ...menu2 }" :style="{
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                          }">
                                            mdi-information-outline</v-icon>
                                        </template>
                                        <span>Indicate on which date, at 00:01am,
                                          the WFH balance will be
                                          lapsed for the employee. <br />PS: The
                                          year will automatically be incremented
                                          after the selected lapse date has
                                          passed.</span>
                                      </v-tooltip></v-text-field>
                                  </template>
                                  <v-date-picker v-model="editedItem.lapse_date" @input="menu2 = false"></v-date-picker>
                                </v-menu>
                              </v-row>
                            </v-col>
                          </v-row>

                          <!-- Alerts -->
                          <v-alert type="error" border="bottom" color="red" colored-border elevation="2"
                            v-if="duplicateAlert">
                            <v-row> Duplicate WFH condition. </v-row>
                          </v-alert>

                          <v-alert type="error" border="bottom" color="red" colored-border elevation="2"
                            v-if="duplicateWfhCondition">
                            <v-row>
                              There are already some conditons for this WFH.
                              Please delete them to create condtion using new
                              Eligibilty.
                            </v-row>
                          </v-alert>

                        </v-form>

                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="blue darken-1" text @click="close">
                            Cancel
                          </v-btn>
                          <v-btn color="blue darken-1" text @click="save" :disabled="!validateForm">
                            Save
                          </v-btn>
                        </v-card-actions>
                      </v-container>
                    </v-col>

                    <v-col class="px-5" cols="12" sm="12" md="6">
                      <!-- SHow the right side component which list the previous condition with 3 columns -->
                      <v-col class="px-5" cols="12" sm="12" md="12" style="border-bottom: 1px dotted black">
                        <div v-if="editedItem.wfh_name == ''">
                          <h3 class="blue-grey--text text-center pb-3">
                            Please select a WFH.
                            <v-divider></v-divider>
                          </h3>
                        </div>

                        <div v-if="editedItem.wfh_name != ''">
                          <h3 class="blue-grey--text text-center pb-3">
                            Previous {{ editedItem.wfh_name }} conditions
                          </h3>
                          <v-divider></v-divider>

                          <h4 class="justify-center text-center" v-if="!arrayPreviousWfhConditions.length">
                            No conditions available.
                          </h4>
                          <template v-if="arrayPreviousWfhConditions.length">
                            <v-simple-table>
                              <template v-slot:default>
                                <thead>
                                  <tr>
                                    <th class="text-left">WFH</th>
                                    <th class="text-left">Eligibility</th>
                                    <th class="text-left">Category</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(
                                        item, index
                                      ) in arrayPreviousWfhConditions" :key="'A' + index">
                                    <td>{{ item.wfh_name }}</td>
                                    <td>{{ item.eligibility }}</td>
                                    <td>
                                      <div v-if="item.employee_category == null ||
                                        item.employee_category == undefined ||
                                        item.employee_category == []
                                        ">
                                        ---
                                      </div>
                                      <v-row>
                                        <div v-for="(
                                              data, index
                                            ) in item.employee_category" :key="'B' + index">
                                          {{ data }},&nbsp;
                                        </div>
                                      </v-row>
                                    </td>
                                  </tr>
                                </tbody>
                              </template>
                            </v-simple-table>
                          </template>
                        </div>
                      </v-col>

                      <!-- Users Listing -->
                      <v-col class="px-5" cols="12" sm="12" md="12" v-if="editedItem.eligibility == 'All' ||
                        editedItem.employee_category != null
                        ">
                        <div>
                          <h3 class="blue-grey--text text-center pb-3" v-if="editedItem.eligibility == 'All'">
                            Employees Under the Organization
                          </h3>
                          <h3 v-else class="blue-grey--text text-center pb-3">
                            Employees Under Selected
                            {{ editedItem.eligibility }}
                          </h3>
                          <v-divider></v-divider>

                          <h4 class="justify-center text-center" v-if="!employessUnder.length">
                            No employees found.
                          </h4>
                          <template v-if="employessUnder.length">
                            <v-card-title>
                              Employees: {{ employessUnder.length }}
                              <v-spacer></v-spacer>
                              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                                hide-details></v-text-field>
                            </v-card-title>
                            <v-data-table height="300px" disable-pagination :headers="employeeHeader"
                              :items="employessUnder" class="elevation-1" hide-default-footer :search="search">
                            </v-data-table>
                          </template>
                        </div>
                      </v-col>

                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-dialog>
            <!-- conditons display section -->
            <v-dialog v-model="dialogShowRules" max-width="700px" max-height="700px">
              <v-card class="overflow-x-hidden overflow-y-hidden">
                <v-row>
                  <v-toolbar class="text-h6" color="grey darken-3" dark>
                    <v-col cols="12" sm="6" lg="6" md="6">
                      WFH condition
                    </v-col>
                    <v-col cols="12" sm="6" lg="6" md="6">
                      <div style="float: right">
                        <v-tooltip top color="blue-grey darken-3">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn elevation="0" small fab @click.prevent="closeRules"
                              class="blue-grey darken-3 white--text ml-2" v-bind="attrs"
                              v-on="on"><v-icon>mdi-close</v-icon></v-btn>
                          </template>
                          Close
                        </v-tooltip>
                      </div>
                    </v-col>
                  </v-toolbar>
                </v-row>
                <v-card-text class="pt-5">
                  <v-container>
                    <v-form ref="form" v-model="valid" lazy-validation>
                      <v-row>
                        <!-- select wfh -->
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Wfh" :items="wfhType"
                            v-model="defaultItem.wfh_name">
                          </v-select>
                        </v-col>

                        <!-- select eligibility -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Eligibility" :items="eligibilityList"
                            v-model="defaultItem.eligibility"></v-select>
                        </v-col>

                        <!-- select category -->
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.eligibility !== 'All'">
                          <v-select :disabled="isDisabled" :items="categoryList" dense outlined label="Category" multiple
                            v-model="defaultItem.employee_category"></v-select>
                        </v-col>

                        <!-- select accessibilty -->
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Access" :items="wfhAccessList"
                            v-model="defaultItem.access"></v-select>
                        </v-col>

                        <!-- No.of days for "Other" in access -->
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6"
                          v-if="defaultItem.access.toLowerCase() == 'other'">
                          <v-text-field :disabled="isDisabled" type="number" dense outlined label="No.of days"
                            v-model="defaultItem.wfh_access_after_days_count"></v-text-field>
                        </v-col>

                        <!-- Get the max number of days -->
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-text-field :disabled="isDisabled" type="number" dense outlined label="Max no. of days"
                            v-model="defaultItem.max_days_a_year"></v-text-field>
                        </v-col>
                      </v-row>

                      <!-- New Row for restriction option-->
                      <v-row>
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-switch :disabled="isDisabled" v-model="defaultItem.restriction_conditional"
                            label="Restriction"></v-switch></v-col>
                      </v-row>

                      <!-- New Row for restriction selection-->
                      <v-row>
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.restriction_conditional">
                          <v-text-field :disabled="isDisabled" type="number" dense outlined label="No. of days"
                            v-model="defaultItem.restriction_days"></v-text-field>
                        </v-col>
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.restriction_conditional">
                          <v-radio-group :disabled="isDisabled" row dense outlined v-model="defaultItem.restriction_type">
                            <v-radio label="Weekly" value="weekly"></v-radio>
                            <v-radio label="Monthly" value="monthly"></v-radio>

                          </v-radio-group>
                        </v-col>
                      </v-row>


                      <!-- Lapse selection -->
                      <v-row>
                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-switch :disabled="isDisabled" v-model="defaultItem.lapse_condition"
                            label="Lapse Selection"></v-switch>
                        </v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.lapse_condition">
                          <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field :disabled="isDisabled" dense v-model="defaultItem.lapse_date"
                                label="Lapse date" prepend-icon="mdi-calendar" readonly outlined v-bind="attrs"
                                v-on="on"></v-text-field>
                            </template>
                            <v-date-picker v-model="defaultItem.lapse_date" @input="menu2 = false"></v-date-picker>
                          </v-menu>
                        </v-col>
                      </v-row>

                    </v-form>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeRules">
                    Cancel
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="dialogDelete" max-width="700px">
              <v-card class="overflow-x-hidden">
                <v-row>
                  <v-toolbar class="text-h6" color="grey darken-3" dark>
                    <v-col cols="12" sm="6" lg="6" md="6">
                      Are you sure you want to delete?
                    </v-col>
                    <v-col cols="12" sm="6" lg="6" md="6">
                      <div style="float: right">
                        <v-tooltip top color="blue-grey darken-3">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn elevation="0" small fab @click.prevent="closeDelete"
                              class="blue-grey darken-3 white--text ml-2" v-bind="attrs"
                              v-on="on"><v-icon>mdi-close</v-icon></v-btn>
                          </template>
                          Close
                        </v-tooltip>
                      </div>
                    </v-col>
                  </v-toolbar>
                </v-row>
                <template v-if="arrayDeleteData.length > 0">
                  <v-simple-table class="pt-5">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">Leave</th>
                          <th class="text-left">Eligibility</th>
                          <th class="text-left">Category</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr v-for="(item, index) in arrayDeleteData" :key="'A' + index">
                          <td>{{ item.wfh_name }}</td>
                          <td>{{ item.eligibility }}</td>
                          <td>
                            <div v-if="item.employee_category == null ||
                              item.employee_category == undefined ||
                              item.employee_category == []
                              ">
                              ---
                            </div>
                            <v-row>
                              <div v-for="(data, index) in item.employee_category" :key="'B' + index">
                                {{ data }},&nbsp;
                              </div>
                            </v-row>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </template>
                <v-card-actions class="justify-end">
                  <v-btn color="green darken-1" text @click="closeDelete">Cancel</v-btn>
                  <v-btn color="white" text class="red" dark @click="deleteItemConfirm">DELETE</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:[`item.view`]="{ item }">
          <v-icon medium color="blue darken-2" @click="showRules(item), getCategories(defaultItem.eligibility)">
            mdi-eye
          </v-icon>
        </template>

        <template v-slot:[`item.edit`]="{ item }">
          <v-icon small class="mr-2" @click="
            editItem(item),
            getPreviousWfhData(editedItem.wfh_name),
            getCategories(editedItem.eligibility),
            getEmployees()
            ">
            mdi-pencil
          </v-icon>
        </template>

        <template v-slot:[`item.delete`]="{ item }">
          <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
<script>
import moment from "moment";
export default {
  layout: "dashboard",
  props: ["configurations", "users"],
  data: () => ({
    str_eligibility: "",
    wfh_update_progress: false,
    companies: [],
    search: "",
    employeeHeader: [
      {
        text: "First name",
        value: "first_name",
        sortable: false,
      },
      {
        text: "Last name",
        value: "last_name",
        sortable: false,
      },
    ],
    employees: [],
    employessUnder: [],
    arrayDeleteData: [],
    arrayPreviousWfhConditions: [],
    eligibilityList: [],
    categoryList: [],
    calenderList: [],
    isDisabled: true,

    WfhTypeRules: [(v) => !!v || "WFH is required"],
    EligibiltyRules: [(v) => !!v || "Eligibilty is required"],
    AccessRules: [(v) => !!v || "Access is required"],
    CalenderTypeRules: [(v) => !!v || "Leave type is required"],
    CreditTypeRules: [(v) => !!v || "Credit type is required"],

    carryForwardDaysValidate: [],
    lapseDateValidate: [(v) => !!v || "Lapse date is required"],

    daysOtherValidate: [(v) => !!v || "No of Day's are required"],
    categoryValidate: [],
    maxDaysValidate: [(v) => !!v || "Max day's is required"],
    restrictionMonthDaysValidate: [(v) => "No of day's is required in range 1-31 days"],
    restrictionWeekDaysValidate: [(v) => "No of day's is required in range 1-7 days"],

    lapseDateValidate: [(v) => !!v || "Lapse date is required"],

    // access list to be eligible for WFH
    wfhAccessList: [],
    //   wfh object which will hold the types of wfh
    wfhType: [],

    dialog: false,
    dialogDelete: false,
    dialogShowRules: false,
    //   table view header
    headers: [
      { text: "WFH", value: "wfh_name", sortable: false },
      { text: "Eligibility", value: "eligibility", sortable: false },
      { text: "Category", value: "employee_category", sortable: false },

      { text: "Access Enable", value: "access", sortable: false },
      { text: "Custom Days ", value: "wfh_access_after_days_count", sortable: false },

      { text: "Lapse Selection", value: "lapse_condition", sortable: false },

      { text: "Lapse Date", value: "lapse_date", sortable: false },

      { text: "Restriction", value: "restriction_conditional", sortable: false },
      { text: "Restriction Days", value: "restriction_days", sortable: false },
      { text: "Restriction Type", value: "restriction_type", sortable: false },


      { text: "View", value: "view", sortable: false },
      { text: "Edit", value: "edit", sortable: false },
      { text: "Delete", value: "delete", sortable: false },
    ],
    //   will store all the wfh conditions
    wfh_conditions: [],
    editedIndex: -1,

    editedItem: {
      wfh_name: "",
      eligibility: "",
      employee_category: null,
      access: "",
      wfh_access_after_days_count: null,
      max_days_a_year: null,
      restriction_conditional: false,
      restriction_type: "",
      restriction_days: null,
      lapse_condition: false,
      lapse_date: "",
    },
    defaultItem: {
      wfh_name: "",
      eligibility: "",
      employee_category: null,
      access: "",
      wfh_access_after_days_count: null,
      max_days_a_year: null,
      lapse_condition: false,
      lapse_date: "",
      restriction_conditional: false,
      restriction_type: "",
      restriction_days: null,

    },

    menu1: false,
    menu2: false,
    valid: true,
    duplicateAlert: false,
    duplicateWfhCondition: false,
    disableLumpsum: false,
  }),

  computed: {
    validateForm() {
      // return true;
      if (!this.duplicateAlert && !this.duplicateWfhCondition) {
        if (this.editedItem.eligibility == "All") {
          this.editedItem.employee_category = "";
        }

        return (
          this.editedItem.wfh_name &&
          this.editedItem.eligibility &&
          this.editedItem.access
        );
      }
    },

    formTitle() {
      return this.editedIndex === -1
        ? "New WFH Condition"
        : "Edit WFH Condition";
    },

    compunteRemainingDays() {
      if (
        this.editedItem.obj_full_pay.int_days_count != undefined &&
        this.editedItem.obj_full_pay.int_days_count != undefined &&
        this.editedItem.obj_full_pay.int_days_count != undefined
      ) {
        this.editedItem.lumpsum_days_count;

        let total_days =
          parseFloat(this.editedItem.obj_full_pay.int_days_count) +
          parseFloat(this.editedItem.obj_half_pay.int_days_count);

        let remainingDays =
          parseFloat(this.editedItem.lumpsum_days_count) - total_days;

        return remainingDays || 0;
      } else {
        return 0;
      }
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    dialogShowRules(val) {
      val || this.closeRules();
    },
  },
  // called before component mounted 
  created() {
    // will fetch all the necessary data to list the existing conditions and pre-req for adding new.
    this.initialize();
    console.log("configuration", this.configurations)
    console.log("users", this.users)
  },
  mounted() {
  },
  methods: {
    filterOnlyCapsText(value, search, item) {
      return (
        value != null &&
        search != null &&
        typeof value === "string" &&
        value.toString().toLocaleUpperCase().indexOf(search) !== -1
      );
    },

    getEmployees() {
      this.employessUnder = [];
      let employess = [];

      if (
        this.editedItem.employee_category &&
        this.editedItem.employee_category.length > 0
      ) {
        if (this.editedItem.eligibility === "Department") {
          this.editedItem.employee_category.forEach((element) => {
            let getEmployess = this.employees.filter(
              (a) => a.reporting?.department == element
            );
            getEmployess.forEach((employee) => {
              employess.push(employee);
            });

            this.employessUnder = employess;
          });
        } else if (this.editedItem.eligibility === "Company name") {
          this.editedItem.employee_category.forEach((element) => {
            let getCompanyId = this.companies.filter(
              (ele) => ele.company_name == element
            );

            if (getCompanyId.length > 0) {
              let getEmployess = this.employees.filter(
                (a) => a.company_id == getCompanyId[0]._id
              );
              getEmployess.forEach((employee) => {
                employess.push(employee);
              });

              this.employessUnder = employess;
            }
          });
        } else if (this.editedItem.eligibility === "Teams") {
          this.editedItem.employee_category.forEach((element) => {
            let getEmployess = this.employees.filter(
              (a) => a.reporting?.team == element
            );
            getEmployess.forEach((employee) => {
              employess.push(employee);
            });

            this.employessUnder = employess;
          });
        } else if (this.editedItem.eligibility === "Employee type") {
          this.editedItem.employee_category.forEach((element) => {
            let getEmployess = this.employees.filter(
              (a) => a.reporting?.type == element
            );
            getEmployess.forEach((employee) => {
              employess.push(employee);
            });

            this.employessUnder = employess;
          });
        } else if (this.editedItem.eligibility === "Cost center") {
          this.editedItem.employee_category.forEach((element) => {
            let getEmployess = this.employees.filter(
              (a) => a.personal.cost_center == element
            );
            getEmployess.forEach((employee) => {
              employess.push(employee);
            });

            this.employessUnder = employess;
          });
        } else if (this.editedItem.eligibility === "Gender") {
          this.editedItem.employee_category.forEach((element) => {
            let getEmployess = this.employees.filter(
              (a) => a.personal.gender == element
            );
            getEmployess.forEach((employee) => {
              employess.push(employee);
            });
          });

          this.employessUnder = employess;
        } else if (this.editedItem.eligibility === "Religion") {
          this.editedItem.employee_category.forEach((element) => {
            let getEmployess = this.employees.filter(
              (a) => a.personal.religion == element
            );
            getEmployess.forEach((employee) => {
              employess.push(employee);
            });

            this.employessUnder = employess;
          });
        } else if (this.editedItem.eligibility === "Designation") {
          this.editedItem.employee_category.forEach((element) => {
            let getEmployess = this.employees.filter(
              (a) => a.personal.designation == element
            );
            getEmployess.forEach((employee) => {
              employess.push(employee);
            });

            this.employessUnder = employess;
          });
        }
      } else if (this.editedItem.eligibility === "All") {
        if (this.editedItem.wfh_name.toLowerCase() === "maternity leaves") {
          let getEmployess = this.employees.filter(
            (a) =>
              a.personal.gender.toLowerCase() == "female" &&
              a.personal.marital_status.toLowerCase() == "married"
          );
          getEmployess.forEach((employee) => {
            employess.push(employee);
          });

          this.employessUnder = employess;
        } else if (this.editedItem.wfh_name.toLowerCase() === "hajj leaves") {
          let getEmployess = this.employees.filter(
            (a) => a.personal.religion.toLowerCase() == "muslim"
          );
          getEmployess.forEach((employee) => {
            employess.push(employee);
          });

          this.employessUnder = employess;
        } else if (
          this.editedItem.wfh_name.toLowerCase() === "parental leaves"
        ) {
          let getEmployess = this.employees.filter(
            (a) => a.personal.marital_status.toLowerCase() == "married"
          );
          getEmployess.forEach((employee) => {
            employess.push(employee);
          });

          this.employessUnder = employess;
        } else {
          this.employessUnder = this.employees;
        }
      }
    },

    validateDuplicateWfhCondition() {
      if (this.editedItem.eligibility == "All") {
        this.categoryValidate = [];
        this.editedItem.employee_category = null;
        let getDuplicateExists = this.arrayPreviousWfhConditions.filter(
          (data) => data.eligibility == "All"
        );
        if (this.editedIndex > -1) {
          if (getDuplicateExists && getDuplicateExists.length > 0) {
            this.duplicateWfhCondition = false;
          } else {
            if (this.arrayPreviousWfhConditions.length > 1) {
              this.duplicateWfhCondition = true;
            } else {
              this.duplicateWfhCondition = false;
            }
          }
        } else {
          if (this.arrayPreviousWfhConditions.length > 0) {
            this.duplicateWfhCondition = true;
          }
        }
      } else {
        this.categoryValidate = [(v) => !!v || "Categories are required"];

        this.duplicateWfhCondition = false;
        if (this.editedIndex > -1) {
          let getDuplicateExists = this.arrayPreviousWfhConditions.filter(
            (data) =>
              data.eligibility == this.editedItem.eligibility ||
              data.eligibility == "All"
          );

          if (getDuplicateExists && getDuplicateExists.length > 0) {
            if (getDuplicateExists[0].eligibility == "All") {
              this.duplicateWfhCondition = true;
            } else {
              this.duplicateWfhCondition = false;
            }
          }
        } else {
          let getDuplicateExists = this.arrayPreviousWfhConditions.filter(
            (data) => data.eligibility == "All"
          );

          if (getDuplicateExists && getDuplicateExists.length > 0) {
            this.duplicateWfhCondition = true;
          } else {
            this.duplicateWfhCondition = false;
          }
        }

        for (let index = 0; index < this.wfh_conditions.length; index++) {
          const element = this.wfh_conditions[index];

          if (
            element.wfh_name == this.editedItem.wfh_name &&
            element.eligibility == this.editedItem.eligibility
          ) {
            function getArraysIntersection(a1, a2) {
              return a1.filter(function (n) {
                return a2.indexOf(n) !== -1;
              });
            }
            var categories_selected = this.editedItem.employee_category || [];
            var categories_exist = element.employee_category || [];
            var intersectingColors = getArraysIntersection(
              categories_selected,
              categories_exist
            );

            if (intersectingColors && intersectingColors.length > 0) {
              if (index != this.editedIndex) {
                this.duplicateAlert = true;
                break;
              }
            } else {
              this.duplicateAlert = false;
              break;
            }
          } else {
            this.duplicateAlert = false;
          }
        }
      }
    },

    getPreviousWfhData(wfh_name) {
      let getSelectedWfhData = this.wfh_conditions.filter(
        (d) => d.wfh_name == wfh_name
      );
      this.arrayPreviousWfhConditions = [];
      if (getSelectedWfhData && getSelectedWfhData.length > 0) {
        this.arrayPreviousWfhConditions = getSelectedWfhData;
      } else {
        this.arrayPreviousWfhConditions = [];
      }
    },

    getDateFormat(lapse_date) {
      if (lapse_date != null) {
        let date = new Date(lapse_date);
        return date ? moment(date).format("D, MMM YYYY") : "";
      }
    },



    initialize() {
      if (
        this.configurations &&
        this.configurations.length > 0 &&
        this.users.length > 0
      ) {
        this.employees = this.users;
        this.wfh_conditions = this.configurations[0].wfhConds;
        this.wfhAccessList = this.configurations[0].wfhAccess;
        this.wfhType = this.configurations[0].wfhTypes;
        this.eligibilityList = this.configurations[0].eligibility;

        this.calenderList = this.configurations[0].calenderType;

      } else {
        this.wfh_conditions = [];
      }
    },

    editItem(item) {
      this.dialogShowRules = false;
      this.editedIndex = this.wfh_conditions.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      this.str_eligibility = item.eligibility;
    },

    deleteItem(item) {
      this.arrayDeleteData = [item];
      this.dialogDelete = true;
      this.dialogShowRules = false;
      this.editedIndex = this.wfh_conditions.indexOf(item);
      this.editedItem = Object.assign({}, item);
    },

    showRules(item) {
      if (!this.dialog && !this.dialogDelete) {
        this.defaultItem = this.wfh_conditions.indexOf(item);
        this.defaultItem = Object.assign({}, item);
        this.dialogShowRules = true;
      }
    },

    deleteItemConfirm() {
      this.wfh_conditions.splice(this.editedIndex, 1);
      this.wfh_update_progress = true;
      this.updateWFHTypes();
    },

    close() {
      this.dialog = false;
      this.duplicateWfhCondition = false;
      this.duplicateAlert = false;
      this.carryForwardDaysValidate = [];
      this.lapseDateValidate = [];

      this.daysOtherValidate = [];
      this.categoryList = [];
      this.maxDaysValidate = [];
      this.restrictionWeekDaysValidate = [];
      this.restrictionMonthDaysValidate = [];

      this.$nextTick(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedItem = {
          wfh_name: "",
          eligibility: "",
          employee_category: null,
          access: "",
          wfh_access_after_days_count: null,
          max_days_a_year: null,
          lapse_condition: false,
          lapse_date: "",
          restriction_conditional: false,
          restriction_type: "",
          restriction_days: null,
        };

        this.$refs.form.resetValidation();
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeRules() {
      this.categoryList = [];
      this.dialogShowRules = false;
      this.$nextTick(() => {
        this.defaultItem = {
          wfh_name: "",
          eligibility: "",
          employee_category: null,
          access: "",
          wfh_access_after_days_count: null,
          max_days_a_year: null,
          lapse_condition: false,
          lapse_date: "",
          restriction_conditional: false,
          restriction_type: "",
          restriction_days: null,
        };
        this.editedIndex = -1;
      });
    },

    // called when save button is clicked based on condition it will update the condition
    save() {
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          Object.assign(
            this.wfh_conditions[this.editedIndex],
            this.editedItem
          );
          this.wfh_update_progress = true;
          this.updateWFHTypes("update");
        } else {
          this.wfh_update_progress = true;
          this.wfh_conditions.push(this.editedItem);
          this.updateWFHTypes("update");
        }
      }
    },

    updateWFHTypes(method) {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);

      this.configurations[0].wfhConds = this.wfh_conditions;
      let arr_configurations = [];
      arr_configurations.push(this.configurations[0]);

      // console.log(arr_configurations,"------arr_configurations")

      this.$axios.$put(
        "/configuration/update/" + this.configurations[0]._id,
        arr_configurations,
        {
          headers: { Authorization: AuthStr },
        }
      )
        .then((res) => {
          this.$nuxt.$emit("confUpdate");
          this.closeDelete(); // close delete dialog
          this.dialogDelete = false; // close delete dialog
          this.wfh_update_progress = false;
          if (method == "update") {
            this.close();
          } else {
            this.closeDelete();
          }
        })
        .catch();
    },

    /* 
        based on the selection of eligibility category dropdown is been displayed  
        using the leave api as it have the same functionality        
    */
    async getCategories(eligibility) {
      this.categoryList = [];
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      let body = {
        company_id: this.$store.getters.getUserInfo.company_id
      }
      let categories = await this.$axios.$post(
        "/leaves/category/" + eligibility, body,
        { headers: { Authorization: AuthStr } }
      );

      if (categories && categories.length > 0) {
        this.categoryList = categories;
        if (eligibility === "Department") {
          this.categoryList = categories[0].departments;
        } else if (eligibility === "Company name") {
          this.companies = categories;
          let array = [];
          categories.forEach((element) => {
            array.push(element.company_name);
          });
          this.categoryList = array;
        } else if (eligibility === "Teams") {
          let array = [];
          categories[0].teams.forEach((element, index) => {
            if (element.length > 0) {
              element.forEach((ele2) => {
                if (ele2 != "") {
                  array.push(ele2);
                }
              });
            }
          });
          _.uniq(array);
          this.categoryList = array;
        } else if (eligibility === "Employee type") {
          this.categoryList = categories;
        } else if (eligibility === "Cost center") {
          this.categoryList = categories[0].costCenters;
        } else if (eligibility === "Gender") {
          this.categoryList = categories;
        } else if (eligibility === "Religion") {
          this.categoryList = categories[0].religions;
        } else if (eligibility === "Designation") {
          this.categoryList = categories[0].designations;
        }
      } else {
        this.categoryList = [];
      }
    },
  },
};
</script>
  