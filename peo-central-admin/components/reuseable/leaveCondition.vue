<template>
  <div>
    <v-card flat>
      <v-data-table disable-pagination :headers="headers" :items="leave_conditions" class="elevation-1"
        hide-default-footer>
        <template v-slot:[`item.leave_name`]="{ item }">
          <v-chip style="cursor: pointer" :color="getColor(item.leave_name)" dark
            @click="showRules(item), getCategories(defaultItem.eligibility)">
            {{ item.leave_name }}
          </v-chip></template>

        <template v-slot:[`item.payment_type`]="{ item }">
          <v-chip :color="getColorPayment(item.payment_type)" dark>
            {{ item.payment_type || "Conditional" }}
          </v-chip>
        </template>

        <template v-slot:[`item.lapse_date`]="{ item }">
          {{ getDateFormat(item.lapse_date) || "---" }}
        </template>

        <template v-slot:[`item.lumpsum_days_count`]="{ item }">
          {{ item.lumpsum_days_count || "---" }}
        </template>

        <template v-slot:[`item.carry_forward`]="{ item }">
          <td v-if="item.carry_forward == true">
            {{ "True" }}
          </td>
          <td v-if="item.carry_forward == false">
            {{ "False" }}
          </td>
        </template>

        <template v-slot:[`item.lapsed_days_encashment`]="{ item }">
          <td v-if="item.lapsed_days_encashment == true">
            {{ "True" }}
          </td>
          <td v-if="item.lapsed_days_encashment == false">
            {{ "False" }}
          </td>
        </template>

        <template v-slot:[`item.accrual_days_count`]="{ item }">
          {{ item.accrual_days_count || "---" }}
        </template>

        <template v-slot:[`item.carry_forward_days`]="{ item }">
          {{ item.carry_forward_days || "---" }}
        </template>

        <template v-slot:[`item.encashment_days`]="{ item }">
          {{ item.encashment_days || "---" }}
        </template>

        <template v-slot:[`item.leave_credit`]="{ item }">
          {{ item.leave_credit || "---" }}
        </template>

        <template v-slot:top>
          <h3 class="px-5 pt-5">Setup Leave for the Company</h3>
          <p class="px-5 mb-0 caption grey--text">
            You can add leave types which the company has as well as assign
            different rules for leaves based on the company.
          </p>
          <v-divider></v-divider>
          <v-toolbar flat>
            <v-toolbar-title>Leave conditions</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>

            <!-- New condtion create and edit section -->
            <v-dialog v-model="dialog" max-width="1200px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                  New leave conditon
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
                  <v-progress-linear :active="leave_update_progress" :indeterminate="leave_update_progress" top
                    color="deep-purple accent-4"></v-progress-linear>
                </v-row>

                <v-card-text style="overflow-y: scroll; height: 650px;">
                  <v-row class="pa-5">
                    <v-col cols="12" sm="12" md="6" style="border-right: 1px dotted black">
                      <v-container>
                        <v-form ref="form" v-model="valid" lazy-validation>
                          <v-row>
                            <!-- select leave -->
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select @change="
                                    getPreviousLeaveData(
                                      editedItem.leave_name
                                    ),
                                    validateDuplicateLeaveCondition(),
                                    getEmployees()
                                    " dense outlined label="Leave" :items="leaveType" :rules="LeaveTypeRules"
                                    v-model="editedItem.leave_name">
                                    <template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template>
                                  </v-select>
                                </v-col>
                              </template>
                              <span>Select what type of leave you want to
                                configure.
                              </span>
                            </v-tooltip>
                            <!-- select eligibility -->
                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select @change="
                                    validateDuplicateLeaveCondition(),
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
                              <span>Here you can select whether the leave type is
                                based on a condition or <br />if all employees
                                will be Eligible.
                              </span>
                            </v-tooltip>
                            <!-- if Marital status selected and leave name is parental leaves, select dropdown -->
                            <v-tooltip bottom
                              v-if="editedItem.leave_name == 'Parental Leaves' && editedItem.eligibility == 'Marital Status'">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select dense outlined label="Marital Status" :items="maritalStatus"
                                    v-model="editedItem.martial_list">
                                    <template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">mdi-information-outline</v-icon>
                                    </template>
                                  </v-select>
                                </v-col>
                              </template>
                              <span>Select Marital Status</span>
                            </v-tooltip>
                            <!--Add No.of Leave Duration days when we select medical leaves-->
                            <v-tooltip bottom v-if="editedItem.leave_name == 'Medical Leaves'">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined label="Leave Duration"
                                    v-model="editedItem.leave_duration">
                                    <template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">mdi-information-outline</v-icon>
                                    </template>
                                  </v-text-field>
                                </v-col>
                              </template>
                              <span>Add the number of leave duration for the mandatory attachment of file</span>
                            </v-tooltip>
                            <!-- if maternity leave selected,Message display -->
                            <v-col class="py-0 text-left" cols="12" sm="12" md="12" v-if="editedItem.leave_name.toLowerCase() ==
                              'maternity leaves' &&
                              editedItem.leave_name != ''
                              ">
                              <p>Only for married women.</p>
                            </v-col>
                            <!-- if hajj leave selected,Message display -->
                            <v-col class="py-0 text-left" cols="12" sm="12" md="12" v-if="editedItem.leave_name.toLowerCase() ==
                              'hajj leaves' && editedItem.leave_name != ''
                              ">
                              <p>Only for Muslims.</p>
                            </v-col>
                            <!-- select category -->
                            <v-tooltip bottom v-if="editedItem.eligibility !== 'All' &&
                              editedItem.leave_name != '' &&
                              editedItem.eligibility != 'Marital Status'
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select @change="
                                    validateDuplicateLeaveCondition(),
                                    getEmployees()
                                    " dense outlined label="Category" :items="categoryList" :rules="categoryValidate"
                                    multiple v-model="editedItem.employee_category"><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>If the leave type is based on a condition,
                                select the category of the condition here.<br />
                                IE if “Department” was selected as
                                Eligibility,<br />
                                then here you will select which departments will
                                have this leave type.</span>
                            </v-tooltip>
                            <!-- select accessibilty -->
                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select dense outlined label="Access" :items="leaveAccessList" :rules="AccessRules"
                                    v-model="editedItem.access"><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>Access refers to when the employees will be
                                able to access the leave type,<br />
                                IE if “After 6 Moths” is selected then
                                employees<br />
                                can only access the leave type after 6 months
                                with the company.
                              </span>
                            </v-tooltip>
                            <!-- No.of days for "Other" in access -->
                            <v-tooltip bottom v-if="editedItem.access.toLowerCase() == 'other' &&
                              editedItem.leave_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined label="No.of days"
                                    :rules="daysPerMonthValidate" v-model="editedItem.leave_access_after_days_count
                                      "><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Provide after how many days will the employee
                                have access for the selected leave type.
                              </span>
                            </v-tooltip>
                            <!-- leave type--working day or calender -->
                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select dense outlined label="Leave type" :rules="CalenderTypeRules"
                                    :items="calenderList" v-model="editedItem.leave_type"><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>Select whether the selected leave type is based
                                on Working Day or Calendar Day logic.<br />
                                PS: Working Day will exclude weekends & public
                                holidays.
                              </span>
                            </v-tooltip>

                            <!-- if annual leave-- Lumpsum day count after a year -->

                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch @click="dynamicValidate" v-model="editedItem.lumpsum_conditional"
                                    label="Conditional"><template slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-switch></v-col>
                              </template>
                              <span>Use the conditional option if the selected
                                leave type will change from monthly accrual to
                                yearly lumpsum. <br />
                                Example, the employees will accrul leave monthly
                                at 2.5 days, after completing 365 days they will
                                then start <br />
                                receiving 30 days as lumpsum instead.
                              </span>
                            </v-tooltip>

                            <v-tooltip bottom v-if="editedItem.lumpsum_conditional">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined :rules="conditionDaysValidate"
                                    label="No. of Working days" v-model="editedItem.lumpsum_claim_after_days
                                      "><template slot="append-outer">
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

                            <v-tooltip bottom v-if="editedItem.lumpsum_conditional == true">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined :rules="conditionalLumpsumDaysValidate"
                                    label="No. of Lumpsum days" v-model="editedItem.lumpsum_days_count_conditional
                                      "><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Provide how many lumpsum days will be credited
                                to the employee after the No. of Working days
                                <br />
                                condition has been met.
                              </span>
                            </v-tooltip>

                            <!-- payment type for leaves -->
                            <v-tooltip bottom v-if="editedItem.leave_name != '' && payType">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select dense outlined label="Payment type" :items="paytypeList"
                                    :rules="payTypeValidate" v-model="editedItem.payment_type"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>Configure whether the selected leave type is
                                Paid, Half Pay or Unpaid.<br />
                                You can also setup more then one condition,<br />
                                IE Sick Leave can be 15 Days Paid, 30 Days Half
                                Pay & 45 Days Unpaid.
                              </span>
                            </v-tooltip>

                            <v-tooltip bottom v-if="editedItem.leave_name.toLowerCase() ==
                              'unpaid leaves'
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch @click="dynamicValidate" v-model="editedItem.unpaid_leave_capped"
                                    label="Capped">
                                    <template slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template>
                                  </v-switch>
                                </v-col>
                              </template>
                              <span>Select whether the Unpaid Leave will be capped
                                or uncapped.</span>
                            </v-tooltip>
                          </v-row>

                          <v-row v-if="editedItem.unpaid_leave_capped == true">
                            <!-- leave type--Accrual or Lumpsum -->
                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-select @change="CreditTypeValidate" :disabled="creditType" dense outlined
                                    label="Credit type" :items="creditList" :rules="CreditTypeRules"
                                    v-model="editedItem.leave_credit"><template slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-select>
                                </v-col>
                              </template>
                              <span>Here is where you can setup if the leave type
                                is given as a Lumpsum Annually or<br />
                                Credited on a Monthly basis.</span>
                            </v-tooltip>
                            <!-- if accural days per month -->
                            <v-tooltip bottom v-if="editedItem.leave_credit &&
                              editedItem.leave_credit.toLowerCase() ==
                              'accrual' &&
                              editedItem.leave_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined label="Days per month"
                                    :rules="daysPerMonthValidate" v-model="editedItem.accrual_days_count"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Providing here how many days are Accrued
                                Monthly<br />
                                to each employee at the start of each month.<br />
                                PS: Type only the number of days, IE 2.5.
                              </span>
                            </v-tooltip>
                            <!-- if lumpsum, Days count -->
                            <v-tooltip bottom v-if="editedItem.leave_credit &&
                              editedItem.leave_credit.toLowerCase() ==
                              'lumpsum' &&
                              editedItem.leave_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field type="number" dense outlined :rules="daysPerYearValidate"
                                    label="Days per year" v-model="editedItem.lumpsum_days_count"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Providing here how many days are given as
                                Lumpsum<br />
                                Annually to each employee at the start of the
                                Financial Year.<br />
                                PS: Type only the number of days, IE 30.
                              </span>
                            </v-tooltip>
                          </v-row>

                          <v-row>
                            <!-- carry forwarding or not -->
                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch @click="dynamicValidate" v-model="editedItem.carry_forward"
                                    label="Carry forward"><template slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-switch></v-col>
                              </template>
                              <span>Trigger the switch on if the leave type’s
                                balance<br />
                                can be carried forward to the new financial
                                year.</span>
                            </v-tooltip>
                            <!-- if carry forwading, Days count  -->
                            <v-tooltip bottom v-if="editedItem.carry_forward == true &&
                              editedItem.leave_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field dense outlined type="number" :rules="carryForwardDaysValidate"
                                    label="Carry forward days" v-model="editedItem.carry_forward_days"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Mention what is the maximum number of days
                                that<br />
                                can be carried forward to the new financial year
                                for each employee.<br />
                                PS: Type only the number of days, IE 30.</span>
                            </v-tooltip>
                            <!-- if not carry forwarding, Lapse date  -->

                            <v-col cols="12" sm="6" md="6" v-if="editedItem.carry_forward == false &&
                              editedItem.leave_name != ''
                              ">
                              <v-row>
                                <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40"
                                  transition="scale-transition" offset-y min-width="auto">
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-text-field dense :rules="lapseDateValidate" v-model="editedItem.lapse_date"
                                      label="Lapse date" prepend-icon="mdi-calendar" readonly outlined v-bind="attrs"
                                      v-on="on"><v-tooltip bottom slot="append-outer">
                                        <template v-slot:activator="{ on: tooltip }">
                                          <v-icon small v-on="{ ...tooltip, ...menu2 }" :style="{
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                          }">
                                            mdi-information-outline</v-icon>
                                        </template>
                                        <span>Indicate on which date, at 00:01am,
                                          the remaining leave balance will be
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
                          <v-row>
                            <!-- lapsed days encashment -switch-->
                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch @click="dynamicValidate" v-model="editedItem.lapsed_days_encashment"
                                    label="Lapsed Days Encashment"><template slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-switch></v-col>
                              </template>
                              <span>Indicate if the lapsed days will be paid out to
                                the employee in the lapsed month payroll.
                              </span>
                            </v-tooltip>
                            <!-- lapsed days encashment days count -->
                            <v-tooltip bottom v-if="editedItem.lapsed_days_encashment == true &&
                              editedItem.leave_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field dense type="number" outlined :rules="encashmentDaysValidate"
                                    label="Encashment Days Count" v-model="editedItem.encashment_days"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Provide the maximum number of lapsed days that
                                can be encashed in the lapsed month.<br />
                                IE Employee has 30 days that are lapsed but only
                                15 days will be encashed to the employee.
                              </span>
                            </v-tooltip>
                          </v-row>

                          <v-row v-if="editedItem.leave_name != 'Unpaid Leaves'">
                            <!-- Apply below zero -switch-->
                            <v-tooltip bottom v-if="editedItem.leave_name != ''">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch @click="dynamicValidate" v-model="editedItem.apply_below_zero"
                                    label="Can apply below zero"><template slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-switch></v-col>
                              </template>
                              <span>Indicate if the employee can apply below zero leave balance Eg: Medical leave,
                                Maternity leave etc...
                              </span>
                            </v-tooltip>
                            <!-- Upto how many days count -->
                            <v-tooltip bottom v-if="editedItem.apply_below_zero == true &&
                              editedItem.leave_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field dense type="number" outlined :rules="encashmentDaysValidate"
                                    label="Upto Days Count" v-model="editedItem.max_allowed"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Provide the minimum number of days that
                                the employee can apply.<br />
                                IE Employee has no balance but can apply until the Upto Days Count.
                              </span>
                            </v-tooltip>
                          </v-row>

                          <v-row class="d-none">
                            <!-- Pro Rata -switch-->
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-switch v-model="editedItem.pro_rata" label="Pro Rata"><template slot="append">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-switch></v-col>
                              </template>
                              <span>Pro Rata etc...
                              </span>
                            </v-tooltip>
                            <!-- Pro Rata count -->
                            <v-tooltip bottom v-if="editedItem.pro_rata == true &&
                              editedItem.leave_name != ''
                              ">
                              <template v-slot:activator="{ on, attrs }">
                                <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                                  <v-text-field dense type="number" outlined label="Pro Rata"><template
                                      slot="append-outer">
                                      <v-icon small v-bind="attrs" v-on="on">
                                        mdi-information-outline
                                      </v-icon>
                                    </template></v-text-field>
                                </v-col>
                              </template>
                              <span>Provide the Pro Rata.
                              </span>
                            </v-tooltip>
                          </v-row>

                          <!-- Entire row contain Feilds for Paid, Unpaid and half paid days count if maternity leave or Sick/medical leave -->
                          <v-row v-if="editedItem.leave_name.toLowerCase() ==
                            'sick leaves' ||
                            editedItem.leave_name.toLowerCase() ==
                            'medical leaves' ||
                            editedItem.leave_name.toLowerCase() ==
                            'maternity leaves'
                            ">
                            <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                              <v-checkbox @change="paid" dense outlined v-model="editedItem.obj_full_pay.bln_pay"
                                label="Paid"></v-checkbox>
                            </v-col>

                            <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                              <v-text-field :disabled="!editedItem.obj_full_pay.bln_pay" dense outlined
                                label="Paid days count" v-model="editedItem.obj_full_pay.int_days_count"></v-text-field>
                            </v-col>

                            <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                              <v-checkbox @change="halfPaid" dense outlined v-model="editedItem.obj_half_pay.bln_pay"
                                label="Half paid"></v-checkbox>
                            </v-col>

                            <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                              <v-text-field :disabled="!editedItem.obj_half_pay.bln_pay" dense outlined
                                label="Half paid days count"
                                v-model="editedItem.obj_half_pay.int_days_count"></v-text-field>
                            </v-col>

                            <v-col class="py-0 text-left" cols="12" sm="12" md="12">
                              <v-alert type="success" border="bottom" color="green" colored-border elevation="2"
                                v-if="computeTotalDays == computeDays">
                                <v-row>
                                  Total no.of day's:
                                  {{ computeTotalDays }}
                                </v-row>
                              </v-alert>

                              <v-alert border="bottom" colored-border type="error" elevation="2" v-if="computeTotalDays != computeDays &&
                                compunteRemainingDays < 0
                                ">
                                <v-row>
                                  Total days should be {{ computeDays }}, but
                                  exceeded by

                                  {{ Math.abs(compunteRemainingDays) }} day's.
                                </v-row>
                              </v-alert>

                              <v-alert border="bottom" colored-border type="error" elevation="2" v-if="computeTotalDays != computeDays &&
                                compunteRemainingDays > 0
                                ">
                                <v-row>
                                  Total day's:
                                  {{ computeTotalDays }}. Remaining days to be
                                  added:
                                  {{ compunteRemainingDays }}
                                </v-row>
                              </v-alert>
                            </v-col>
                          </v-row>
                          <v-alert type="error" border="bottom" color="red" colored-border elevation="2"
                            v-if="duplicateAlert">
                            <v-row> Duplicate leave condition. </v-row>
                          </v-alert>

                          <v-alert type="error" border="bottom" color="red" colored-border elevation="2"
                            v-if="duplicateLeaveCondition">
                            <v-row>
                              There are already some conditons for this leave.
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
                      <v-col class="px-5" cols="12" sm="12" md="12" style="border-bottom: 1px dotted black">
                        <div v-if="editedItem.leave_name == ''">
                          <h3 class="blue-grey--text text-center pb-3">
                            Please select a leave.
                            <v-divider></v-divider>
                          </h3>
                        </div>

                        <div v-if="editedItem.leave_name != ''">
                          <h3 class="blue-grey--text text-center pb-3">
                            Previous {{ editedItem.leave_name }} conditions
                          </h3>
                          <v-divider></v-divider>

                          <h4 class="justify-center text-center" v-if="!arrayPreviousLeaveConditions.length">
                            No conditions available.
                          </h4>
                          <template v-if="arrayPreviousLeaveConditions.length">
                            <v-simple-table>
                              <template v-slot:default>
                                <thead>
                                  <tr>
                                    <th class="text-left">Leave</th>
                                    <th class="text-left">Eligibility</th>
                                    <th class="text-left">Category</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(
                                      item, index
                                    ) in arrayPreviousLeaveConditions" :key="'A' + index">
                                    <td>{{ item.leave_name }}</td>
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
                      Leave conditon
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
                        <!-- select leave -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Leave" :items="leaveType"
                            v-model="defaultItem.leave_name">
                          </v-select>
                        </v-col>

                        <!-- select eligibility -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Eligibility" :items="eligibilityList"
                            v-model="defaultItem.eligibility"></v-select>
                        </v-col>

                        <!-- if maternity leave selected,Message display -->
                        <v-col class="py-0 text-left" cols="12" sm="12" md="12" v-if="defaultItem.leave_name.toLowerCase() ==
                          'maternity leaves' && defaultItem.leave_name != ''
                          ">
                          <p>Only for married women.</p>
                        </v-col>
                        <!-- if hajj leave selected,Message display -->
                        <v-col class="py-0 text-left" cols="12" sm="12" md="12" v-if="defaultItem.leave_name.toLowerCase() ==
                          'hajj leave' && defaultItem.leave_name != ''
                          ">
                          <p>Only for Muslims.</p>
                        </v-col>
                        <!-- select category -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.eligibility !== 'All'">
                          <v-select :disabled="isDisabled" :items="categoryList" dense outlined label="Category" multiple
                            v-model="defaultItem.employee_category"></v-select>
                        </v-col>

                        <!-- select accessibilty -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Access" :items="leaveAccessList"
                            v-model="defaultItem.access"></v-select>
                        </v-col>

                        <!-- leave type--working day or calender -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Leave type" :items="calenderList"
                            v-model="defaultItem.leave_type"></v-select>
                        </v-col>

                        <!-- if annual leave-- Lumpsum day count after a year -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-switch :disabled="isDisabled" v-model="defaultItem.lumpsum_conditional"
                            label="Conditional"></v-switch></v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.lumpsum_conditional">
                          <v-text-field :disabled="isDisabled" type="number" dense outlined label="No. of Working days"
                            v-model="defaultItem.lumpsum_claim_after_days"></v-text-field>
                        </v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.lumpsum_conditional">
                          <v-text-field :disabled="isDisabled" type="number" dense outlined label="No. of Lumpsum days"
                            v-model="defaultItem.lumpsum_days_count_conditional"></v-text-field>
                        </v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.leave_name.toLowerCase() !=
                          'maternity leaves' &&
                          (defaultItem.leave_name.toLowerCase() !=
                            'sick leaves' ||
                            defaultItem.leave_name.toLowerCase() !=
                            'medical leaves')
                          ">
                          <v-select :disabled="isDisabled" dense outlined label="Payment type" :items="paytypeList"
                            v-model="defaultItem.payment_type"></v-select>
                        </v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.leave_name.toLowerCase() ==
                          'unpaid leaves'
                          ">
                          <v-switch :disabled="isDisabled" v-model="defaultItem.unpaid_leave_capped"
                            label="Capped"></v-switch></v-col>
                      </v-row>

                      <v-row v-if="defaultItem.unpaid_leave_capped == true">
                        <!-- leave type--Accrual or Lumpsum -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-select :disabled="isDisabled" dense outlined label="Credit type" :items="creditList"
                            v-model="defaultItem.leave_credit"></v-select>
                        </v-col>

                        <!-- if accural days per month -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.leave_credit.toLowerCase() == 'accrual'
                          ">
                          <v-text-field :disabled="isDisabled" type="number" dense outlined label="Days per month"
                            v-model="defaultItem.accrual_days_count"></v-text-field>
                        </v-col>

                        <!-- if lumpsum, Days count -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.leave_credit.toLowerCase() == 'lumpsum'
                          ">
                          <v-text-field :disabled="isDisabled" type="number" dense outlined label="Days per year"
                            v-model="defaultItem.lumpsum_days_count"></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row>
                        <!-- carry forwarding or not -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-switch :disabled="isDisabled" @click="dynamicValidate" v-model="defaultItem.carry_forward"
                            label="Carry forward"></v-switch></v-col>

                        <!-- if carry forwading, Days count  -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.carry_forward == true">
                          <v-text-field :disabled="isDisabled" dense outlined type="number" label="Carry forward days"
                            v-model="defaultItem.carry_forward_days"></v-text-field>
                        </v-col>

                        <!-- if not carry forwarding, Lapse date  -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.carry_forward == false &&
                          defaultItem.leave_name != ''
                          ">
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
                      <v-row>
                        <!-- lapsed days encashment -switch-->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-switch :disabled="isDisabled" v-model="defaultItem.lapsed_days_encashment"
                            label="Lapsed Days Encashment"></v-switch></v-col>

                        <!-- lapsed days encashment days count -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6"
                          v-if="defaultItem.lapsed_days_encashment == true">
                          <v-text-field :disabled="isDisabled" dense type="number" outlined label="Encashment Days Count"
                            v-model="defaultItem.encashment_days"></v-text-field>
                        </v-col>
                      </v-row>

                      <v-row v-if="defaultItem.leave_name != 'Unpaid Leaves'">
                        <!-- lapsed days encashment -switch-->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-switch :disabled="isDisabled" v-model="defaultItem.apply_below_zero"
                            label="Can apply below zero"></v-switch></v-col>

                        <!-- lapsed days encashment days count -->

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6" v-if="defaultItem.apply_below_zero == true">
                          <v-text-field :disabled="isDisabled" dense type="number" outlined label="Upto Days Count"
                            v-model="defaultItem.max_allowed"></v-text-field>
                        </v-col>
                      </v-row>

                      <!-- Entire row contain Feilds for Paid, Unpaid and half paid days count if maternity leave or Sick/medical leave -->
                      <v-row v-if="defaultItem.leave_name.toLowerCase() ==
                        'sick leaves' ||
                        defaultItem.leave_name.toLowerCase() ==
                        'medical leaves'
                        "><v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-checkbox :disabled="isDisabled" @change="paid" dense outlined
                            v-model="defaultItem.obj_full_pay.bln_pay" label="Paid"></v-checkbox>
                        </v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-text-field :disabled="isDisabled" dense outlined label="Paid days count"
                            v-model="defaultItem.obj_full_pay.int_days_count"></v-text-field>
                        </v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-checkbox :disabled="isDisabled" dense outlined v-model="defaultItem.obj_half_pay.bln_pay"
                            label="Half paid"></v-checkbox>
                        </v-col>

                        <v-col class="py-0 text-left" cols="12" sm="6" md="6">
                          <v-text-field :disabled="isDisabled" dense outlined label="Half paid days count"
                            v-model="defaultItem.obj_half_pay.int_days_count"></v-text-field>
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
                          <td>{{ item.leave_name }}</td>
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
            getPreviousLeaveData(editedItem.leave_name),
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
    leave_update_progress: false,
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
    arrayPreviousLeaveConditions: [],
    creditList: [],
    eligibilityList: [],
    categoryList: [],
    martialList: [],
    calenderList: [],
    paytypeList: [],
    isDisabled: true,

    LeaveTypeRules: [(v) => !!v || "Leave is required"],
    EligibiltyRules: [(v) => !!v || "Eligibilty is required"],
    AccessRules: [(v) => !!v || "Access is required"],
    CalenderTypeRules: [(v) => !!v || "Leave type is required"],
    CreditTypeRules: [(v) => !!v || "Credit type is required"],

    carryForwardDaysValidate: [],
    lapseDateValidate: [],
    payTypeValidate: [],
    daysPerYearValidate: [],
    daysPerMonthValidate: [],
    encashmentDaysValidate: [],
    categoryValidate: [],
    conditionalLumpsumDaysValidate: [],
    conditionDaysValidate: [],

    leaveAccessList: [],
    leaveType: [],
    maritalStatus: ['Single', 'Married', 'Not Disclosed'],
    dialog: false,
    dialogDelete: false,
    dialogShowRules: false,
    headers: [
      { text: "Leave", value: "leave_name", sortable: false },
      { text: "Eligibility", value: "eligibility", sortable: false },
      { text: "Access", value: "access", sortable: false },
      { text: "Leave Type", value: "leave_type", sortable: false },
      { text: "Payment", value: "payment_type", sortable: false },
      { text: "Carry forward", value: "carry_forward", sortable: false },

      { text: "Lapse Date", value: "lapse_date", sortable: false },
      { text: "Credit Type", value: "leave_credit", sortable: false },

      {
        text: "Lapsed Days Encashment",
        value: "lapsed_days_encashment",
        sortable: false,
      },

      { text: "View", value: "view", sortable: false },
      { text: "Edit", value: "edit", sortable: false },
      { text: "Delete", value: "delete", sortable: false },
    ],
    leave_conditions: [],
    editedIndex: -1,
    editedItem: {
      leave_name: "",
      eligibility: "",
      employee_category: null,
      martial_list: '',
      leave_duration: '',
      access: "",
      leave_access_after_days_count: null,
      unpaid_leave_capped: true,
      leave_type: "",
      payment_type: "",
      carry_forward: true,
      carry_forward_days: null,
      lapsed_days_encashment: false,
      encashment_days: null,
      lapse_date: "",
      leave_credit: "",
      accrual_days_count: null,
      lumpsum_days_count: null,
      lumpsum_conditional: false,
      lumpsum_days_count_conditional: null,
      lumpsum_claim_after_days: null,
      maternity_follow_labour_law: true,
      apply_below_zero: false,
      pro_rata: false,
      max_allowed: 0,
      obj_full_pay: {
        bln_pay: false,
        int_days_count: 0,
      },
      obj_half_pay: {
        bln_pay: false,
        int_days_count: 0,
      },
    },
    defaultItem: {
      leave_name: "",
      eligibility: "",
      employee_category: null,
      martial_list: null,
      leave_duration: '',
      access: "",
      leave_access_after_days_count: null,
      unpaid_leave_capped: true,
      leave_type: "",
      payment_type: "",
      carry_forward: true,
      carry_forward_days: null,
      lapsed_days_encashment: false,
      encashment_days: null,
      lapse_date: "",
      leave_credit: "",
      accrual_days_count: null,
      lumpsum_days_count: null,
      lumpsum_conditional: false,
      lumpsum_days_count_conditional: null,
      lumpsum_claim_after_days: null,
      maternity_follow_labour_law: true,
      apply_below_zero: false,
      max_allowed: 0,
      obj_full_pay: {
        bln_pay: false,
        int_days_count: 0,
      },
      obj_half_pay: {
        bln_pay: false,
        int_days_count: 0,
      },
    },
    menu1: false,
    menu2: false,
    valid: true,
    duplicateAlert: false,
    duplicateLeaveCondition: false,
    disableLumpsum: false,
  }),

  computed: {
    validateForm() {
      if (!this.duplicateAlert && !this.duplicateLeaveCondition) {
        if (this.editedItem.eligibility == "All") {
          this.editedItem.employee_category = "";
        }

        if (this.editedItem.lumpsum_conditional) {
          this.conditionalLumpsumDaysValidate = [
            (v) => !!v || "Field is required",
          ];
          this.conditionDaysValidate = [(v) => !!v || "Field is required"];
        } else {
          this.conditionDaysValidate = [];
          this.categoryValidate = [];
        }

        if (this.editedItem.carry_forward) {
          this.editedItem.lapse_date = null;
          this.carryForwardDaysValidate = [
            (v) => !!v || "Carry forward days are required",
          ];
        } else {
          this.editedItem.carry_forward_days = null;
          this.carryForwardDaysValidate = [];
        }

        if (
          this.editedItem.leave_credit &&
          this.editedItem.leave_credit.toLowerCase() == "accrual"
        ) {
          this.editedItem.lumpsum_days_count = null;
        } else if (
          this.editedItem.leave_credit &&
          this.editedItem.leave_credit.toLowerCase() == "lumpsum"
        ) {
          this.editedItem.accrual_days_count = null;
        }

        if (
          this.editedItem.leave_name.toLowerCase() == "sick leaves" ||
          this.editedItem.leave_name.toLowerCase() == "medical leaves"
        ) {
          if (
            this.editedItem.obj_full_pay.int_days_count != undefined &&
            this.editedItem.obj_full_pay.int_days_count != undefined &&
            this.editedItem.obj_full_pay.int_days_count != undefined
          ) {
            let total_days =
              parseFloat(this.editedItem.obj_full_pay.int_days_count) +
              parseFloat(this.editedItem.obj_half_pay.int_days_count);
            if (total_days == this.editedItem.lumpsum_days_count) {
              return (
                this.editedItem.leave_name &&
                this.editedItem.eligibility &&
                this.editedItem.access &&
                this.editedItem.leave_type
              );
            }
          }
        } else if (
          this.editedItem.leave_name.toLowerCase() == "maternity leaves"
        ) {
          this.editedItem.obj_full_pay = {
            bln_pay: false,
            int_days_count: 0,
          };
          this.editedItem.obj_half_pay = {
            bln_pay: false,
            int_days_count: 0,
          };

          if (
            this.editedItem.leave_credit &&
            this.editedItem.leave_credit.toLowerCase() == "lumpsum"
          ) {
            return (
              this.editedItem.lumpsum_days_count &&
              this.editedItem.leave_name &&
              this.editedItem.eligibility &&
              this.editedItem.access &&
              this.editedItem.leave_type
            );
          } else {
            return (
              this.editedItem.leave_name &&
              this.editedItem.eligibility &&
              this.editedItem.access &&
              this.editedItem.leave_type
            );
          }
        } else {
          this.editedItem.obj_full_pay = {
            bln_pay: false,
            int_days_count: 0,
          };
          this.editedItem.obj_half_pay = {
            bln_pay: false,
            int_days_count: 0,
          };

          if (
            this.editedItem.leave_credit &&
            this.editedItem.leave_credit.toLowerCase() == "lumpsum"
          ) {
            return (
              this.editedItem.lumpsum_days_count &&
              this.editedItem.payment_type &&
              this.editedItem.leave_name &&
              this.editedItem.eligibility &&
              this.editedItem.access &&
              this.editedItem.leave_type
            );
          } else if (
            this.editedItem.leave_credit &&
            this.editedItem.leave_credit.toLowerCase() == "accrual"
          ) {
            return (
              this.editedItem.accrual_days_count &&
              this.editedItem.payment_type &&
              this.editedItem.leave_name &&
              this.editedItem.eligibility &&
              this.editedItem.access &&
              this.editedItem.leave_type
            );
          } else {
            return (
              this.editedItem.payment_type &&
              this.editedItem.leave_name &&
              this.editedItem.eligibility &&
              this.editedItem.access &&
              this.editedItem.leave_type
            );
          }
        }
      }
    },
    carryForwardValidate() {
      // return this.editedItem.carry_forward ?  "":""
      if (this.editedItem.carry_forward) {
      }
    },

    formTitle() {
      return this.editedIndex === -1
        ? "New Leave Conditon"
        : "Edit Leave Conditon";
    },

    payType() {
      if (
        this.editedItem.leave_name.toLowerCase() != "sick leaves" &&
        this.editedItem.leave_name.toLowerCase() != "medical leaves"
      ) {
        if (this.editedItem.leave_name.toLowerCase() != "maternity leaves") {
          this.payTypeValidate = [(v) => !!v || "Payment type is required"];
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },

    payTypeDisable() {
      if (this.defaultItem.leave_name.toLowerCase() != "sick leaves") {
        if (this.defaultItem.leave_name.toLowerCase() != "maternity leaves") {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },

    creditType() {
      if (
        this.editedItem.leave_name.toLowerCase() == "sick leaves" ||
        this.editedItem.leave_name.toLowerCase() == "medical leaves" ||
        this.editedItem.leave_name.toLowerCase() == "maternity leaves" ||
        this.editedItem.leave_name.toLowerCase() == "unpaid leaves"
      ) {
        this.editedItem.leave_credit = "Lumpsum";
        this.disableLumpsum = true;
        return true;
      } else {
        this.disableLumpsum = false;
        return false;
      }
    },

    computeTotalDays() {
      if (
        this.editedItem.obj_full_pay.int_days_count != undefined &&
        this.editedItem.obj_full_pay.int_days_count != undefined &&
        this.editedItem.obj_full_pay.int_days_count != undefined
      ) {
        let total_days =
          parseFloat(this.editedItem.obj_full_pay.int_days_count) +
          parseFloat(this.editedItem.obj_half_pay.int_days_count);

        return total_days || 0;
      } else {
        return 0;
      }
    },

    computeDays() {
      return this.editedItem.lumpsum_days_count || 0;
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

  created() {
    this.initialize();
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
                (a) => a.company_ID == getCompanyId[0]._id
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
        if (this.editedItem.leave_name.toLowerCase() === "maternity leaves") {
          let getEmployess = this.employees.filter(
            (a) =>
              a.personal.gender.toLowerCase() == "female" &&
              a.personal.marital_status.toLowerCase() == "married"
          );
          getEmployess.forEach((employee) => {
            employess.push(employee);
          });

          this.employessUnder = employess;
        } else if (this.editedItem.leave_name.toLowerCase() === "hajj leaves") {
          let getEmployess = this.employees.filter(
            (a) => a.personal.religion.toLowerCase() == "muslim"
          );
          getEmployess.forEach((employee) => {
            employess.push(employee);
          });

          this.employessUnder = employess;
        } else if (
          this.editedItem.leave_name.toLowerCase() === "parental leaves"
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
    validateDuplicateLeaveCondition() {
      if (this.editedItem.eligibility == "All") {
        this.categoryValidate = [];
        this.editedItem.employee_category = null;
        let getDuplicateExists = this.arrayPreviousLeaveConditions.filter(
          (data) => data.eligibility == "All"
        );
        if (this.editedIndex > -1) {
          if (getDuplicateExists && getDuplicateExists.length > 0) {
            this.duplicateLeaveCondition = false;
          } else {
            if (this.arrayPreviousLeaveConditions.length > 1) {
              this.duplicateLeaveCondition = true;
            } else {
              this.duplicateLeaveCondition = false;
            }
          }
        } else {
          if (this.arrayPreviousLeaveConditions.length > 0) {
            this.duplicateLeaveCondition = true;
          }
        }
      } else {
        this.categoryValidate = [(v) => !!v || "Categories are required"];

        this.duplicateLeaveCondition = false;
        if (this.editedIndex > -1) {
          let getDuplicateExists = this.arrayPreviousLeaveConditions.filter(
            (data) =>
              data.eligibility == this.editedItem.eligibility ||
              data.eligibility == "All"
          );

          if (getDuplicateExists && getDuplicateExists.length > 0) {
            if (getDuplicateExists[0].eligibility == "All") {
              this.duplicateLeaveCondition = true;
            } else {
              this.duplicateLeaveCondition = false;
            }
          }
        } else {
          let getDuplicateExists = this.arrayPreviousLeaveConditions.filter(
            (data) => data.eligibility == "All"
          );

          if (getDuplicateExists && getDuplicateExists.length > 0) {
            this.duplicateLeaveCondition = true;
          } else {
            this.duplicateLeaveCondition = false;
          }
        }

        for (let index = 0; index < this.leave_conditions.length; index++) {
          const element = this.leave_conditions[index];

          if (
            element.leave_name == this.editedItem.leave_name &&
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
    getPreviousLeaveData(leave_name) {
      let getSelectedLeaveData = this.leave_conditions.filter(
        (d) => d.leave_name == leave_name
      );
      this.arrayPreviousLeaveConditions = [];
      if (getSelectedLeaveData && getSelectedLeaveData.length > 0) {
        this.arrayPreviousLeaveConditions = getSelectedLeaveData;
      } else {
        this.arrayPreviousLeaveConditions = [];
      }
    },

    getDateFormat(lapse_date) {
      if (lapse_date != null) {
        let date = new Date(lapse_date);
        return date ? moment(date).format("D, MMM YYYY") : "";
      }
    },
    CreditTypeValidate() {
      if (
        this.editedItem.leave_credit &&
        this.editedItem.leave_credit.toLowerCase() == "lumpsum"
      ) {
        this.daysPerYearValidate = [(v) => !!v || "No.of Days are required"];
        this.daysPerMonthValidate = [];
      } else if (
        this.editedItem.leave_credit &&
        this.editedItem.leave_credit.toLowerCase() == "accrual"
      ) {
        this.daysPerYearValidate = [];
        this.daysPerMonthValidate = [(v) => !!v || "No.of Days are required"];
      }
    },

    dynamicValidate() {
      if (!this.editedItem.unpaid_leave_capped) {
        this.CreditTypeRules = [];
        this.daysPerYearValidate = [];
        this.daysPerMonthValidate = [];
        this.editedItem.leave_credit = null;
        this.editedItem.accrual_days_count = null;
        this.editedItem.lumpsum_days_count = null;
      } else {
        this.CreditTypeRules = [(v) => !!v || "Credit type is required"];
      }

      if (this.editedItem.carry_forward) {
        this.carryForwardDaysValidate = [
          (v) => !!v || "No.of days are required",
        ];
        this.lapseDateValidate = [];
      } else {
        this.carryForwardDaysValidate = [];
        this.lapseDateValidate = [(v) => !!v || "Lapse date is required"];
      }

      if (this.editedItem.lapsed_days_encashment) {
        this.encashmentDaysValidate = [(v) => !!v || "No.of days are required"];
      } else {
        this.editedItem.encashment_days = 0;
        this.encashmentDaysValidate = [];
      }
    },

    getColor(leave_name) {
      if (
        leave_name.toLowerCase() == "maternity leaves" ||
        leave_name.toLowerCase() == "sick leaves" ||
        leave_name.toLowerCase() == "medical leaves"
      ) {
        return "green";
      }
    },

    getColorPayment(payment) {
      if (payment != null) {
        if (payment.toLowerCase() == "paid") {
          return "blue darken-2";
        } else if (payment.toLowerCase() == "half paid") {
          return "blue darken-2";
        } else if (payment.toLowerCase() == "unpaid") {
          return "blue darken-2";
        } else {
          return "red darken-3";
        }
      } else {
        return "red darken-3";
      }
    },

    paid() {
      if (!this.editedItem.obj_full_pay.bln_pay) {
        this.editedItem.obj_full_pay.int_days_count = 0;
      }
    },
    halfPaid() {
      if (!this.editedItem.obj_half_pay.bln_pay) {
        this.editedItem.obj_half_pay.int_days_count = 0;
      }
    },

    initialize() {
      if (
        this.configurations &&
        this.configurations.length > 0 &&
        this.users.length > 0
      ) {
        this.employees = this.users;
        this.leave_conditions = this.configurations[0].leave_types;
        this.leaveAccessList = this.configurations[0].leave_access;
        this.leaveType = this.configurations[0].leave;
        this.paytypeList = this.configurations[0].paymentType;
        this.calenderList = this.configurations[0].calenderType;
        this.creditList = this.configurations[0].creditType;
        this.eligibilityList = this.configurations[0].eligibility;
      } else {
        this.leave_conditions = [];
      }
    },

    editItem(item) {
      this.dialogShowRules = false;
      this.editedIndex = this.leave_conditions.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      this.str_eligibility = item.eligibility;
    },

    deleteItem(item) {
      this.arrayDeleteData = [item];
      this.dialogDelete = true;
      this.dialogShowRules = false;
      this.editedIndex = this.leave_conditions.indexOf(item);
      this.editedItem = Object.assign({}, item);
    },

    showRules(item) {
      if (!this.dialog && !this.dialogDelete) {
        this.defaultItem = this.leave_conditions.indexOf(item);
        this.defaultItem = Object.assign({}, item);
        this.dialogShowRules = true;
      }
    },

    deleteItemConfirm() {
      this.leave_conditions.splice(this.editedIndex, 1);
      this.leave_update_progress = true;
      this.updateLeaveTypes();
    },

    close() {
      this.dialog = false;
      this.duplicateLeaveCondition = false;
      this.duplicateAlert = false;
      this.carryForwardDaysValidate = [];
      this.lapseDateValidate = [];
      this.payTypeValidate = [];
      this.daysPerYearValidate = [];
      this.daysPerMonthValidate = [];
      this.encashmentDaysValidate = [];
      this.categoryList = [];
      this.conditionalLumpsumDaysValidate = [];
      this.conditionDaysValidate = [];
      this.$nextTick(() => {
        // this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.editedItem = {
          leave_name: "",
          eligibility: "",
          employee_category: null,
          martial_list: null,
          leave_duration: '',
          access: "",
          leave_access_after_days_count: null,
          unpaid_leave_capped: true,
          leave_type: "",
          payment_type: "",
          carry_forward: true,
          carry_forward_days: null,
          lapsed_days_encashment: false,
          encashment_days: null,
          lapse_date: "",
          leave_credit: "",
          accrual_days_count: null,
          lumpsum_days_count: null,
          lumpsum_conditional: false,
          lumpsum_days_count_conditional: null,
          lumpsum_claim_after_days: null,
          maternity_follow_labour_law: true,
          apply_below_zero: false,
          max_allowed: 0,
          obj_full_pay: {
            bln_pay: false,
            int_days_count: 0,
          },
          obj_half_pay: {
            bln_pay: false,
            int_days_count: 0,
          },
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
          leave_name: "",
          eligibility: "",
          employee_category: null,
          access: "",
          leave_access_after_days_count: null,
          unpaid_leave_capped: true,
          leave_type: "",
          payment_type: "",
          carry_forward: true,
          carry_forward_days: null,
          lapsed_days_encashment: false,
          encashment_days: null,
          lapse_date: "",
          leave_credit: "",
          accrual_days_count: null,
          lumpsum_days_count: null,
          lumpsum_conditional: false,
          lumpsum_days_count_conditional: null,
          lumpsum_claim_after_days: null,
          maternity_follow_labour_law: true,
          apply_below_zero: false,
          max_allowed: 0,
          obj_full_pay: {
            bln_pay: false,
            int_days_count: 0,
          },
          obj_half_pay: {
            bln_pay: false,
            int_days_count: 0,
          },
        };
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.$refs.form.validate()) {
        if (
          this.editedItem.leave_credit &&
          this.editedItem.leave_credit.toLowerCase() == "lumpsum"
        ) {
          if (this.editedItem.lumpsum_days_count != 0) {
            if (
              this.editedItem.leave_name.toLowerCase() == "sick leaves" ||
              this.editedItem.leave_name.toLowerCase() == "medical leaves"
            ) {
              this.editedItem.payment_type = null;
              let total_days =
                parseFloat(this.editedItem.obj_full_pay.int_days_count) +
                parseFloat(this.editedItem.obj_half_pay.int_days_count);

              if (total_days == this.editedItem.lumpsum_days_count) {
                if (this.editedIndex > -1) {
                  Object.assign(
                    this.leave_conditions[this.editedIndex],
                    this.editedItem
                  );
                  this.leave_update_progress = true;
                  this.updateLeaveTypes("update");
                } else {
                  this.leave_update_progress = true;
                  this.leave_conditions.push(this.editedItem);
                  this.updateLeaveTypes("update");
                }
              }
            } else {
              if (
                this.editedItem.leave_name.toLowerCase() == "maternity leaves"
              ) {
                this.editedItem.payment_type = null;
              }
              if (this.editedIndex > -1) {
                Object.assign(
                  this.leave_conditions[this.editedIndex],
                  this.editedItem
                );
                this.leave_update_progress = true;
                this.updateLeaveTypes("update");
              } else {
                this.leave_update_progress = true;
                this.leave_conditions.push(this.editedItem);
                this.updateLeaveTypes("update");
              }
            }
          }
        } else {
          if (this.editedIndex > -1) {
            Object.assign(
              this.leave_conditions[this.editedIndex],
              this.editedItem
            );
            this.updateLeaveTypes("update");
          } else {
            this.leave_conditions.push(this.editedItem);
            this.updateLeaveTypes("update");
          }
        }
      }
    },

    updateLeaveTypes(method) {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);

      this.configurations[0].leave_types = this.leave_conditions;
      let arr_configurations = [];
      arr_configurations.push(this.configurations[0]);

      this.$axios
        .$put(
          "/configuration/update/" + this.configurations[0]._id,
          arr_configurations,
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          if (res != "Successfuly Updated") {
            this.$router.go();
          } else {
            if (this.editedIndex > -1) {
              if (this.str_eligibility != this.editedItem.eligibility) {
                // this.$axios.$post("/leave_condition/new_leave_condition", { obj_leave: this.editedItem }, { headers: { Authorization: AuthStr }});
              }
            } else {
              this.$axios.$post(
                "/leave_condition/new_leave_condition",
                { obj_leave: this.editedItem },
                { headers: { Authorization: AuthStr } }
              );
            }
            this.$nuxt.$emit("confUpdate");
            this.closeDelete(); // close delete dialog
            this.dialogDelete = false; // close delete dialog
            this.leave_update_progress = false;
            if (method == "update") {
              this.close();
            } else {
              this.closeDelete();
            }
          }
        });
    },

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
