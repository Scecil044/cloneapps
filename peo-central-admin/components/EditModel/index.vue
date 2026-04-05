<template>
  <v-row>
    <v-col cols="12">
      <v-card id="tall_dialog">
        <v-card-title id="card-title">
          <h4 class="text--text">{{ headerTitle }}</h4>
          <div class="flex_row justify-end">
            <v-btn
              class="tall__btn mr-2 px-5"
              color="subtext"
              outlined
              @click="close()"
              >Cancel</v-btn
            >
            <v-img
              src="/animated/ring.svg"
              width="40px"
              height="40px"
              contain
              v-if="loading"
            ></v-img>
            <v-btn
              class="tall__btn px-9"
              color="primary"
              min-width="100px"
              @click="editEmployerDetails"
              >Update</v-btn
            >
          </div>
        </v-card-title>
        <v-divider id="divider" class="mt-5"></v-divider>
        <v-card-text id="card-text">
          <v-row class="pa-0 ma-0" v-if="headerTitle == 'COMPANY DETAILS'">
            <v-col cols="4">
              <CustomInputContainer label="Legal Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.legal_name"
                    placeholder="name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Company Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.company_name"
                    placeholder="company Name"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Registration Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.registration_number"
                    placeholder="Enter number"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Phone Number">
                <div slot="input">
                  <v-input>
                    <template v-slot:prepend>
                      <v-select
                        v-model="phoneNumberText.main"
                        :items="countryCode"
                        item-text="name"
                        item-value="code"
                        ref="main_phone"
                        label="Code"
                        outlined
                        dense
                        :rules="main_rule"
                        :menu-props="{ closeOnClick: true }"
                      >
                        <template v-slot:selection="data">
                          {{ data.item.emoji }} +{{ data.item.code }}
                        </template>
                        <template v-slot:item="data">
                          <v-list-item @click="updatePhone('main', data.item)">
                            <v-list-item-content>
                              <v-list-item-title>
                                {{ data.item.emoji }} {{ data.item.name }}
                              </v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                              +{{ data.item.code }}
                            </v-list-item-action>
                          </v-list-item>
                        </template>
                      </v-select>
                    </template>
                    <v-text-field
                      v-model="phoneNumbers.main"
                      type="number"
                      placeholder="Phone number"
                      outlined
                      dense
                      :rules="phone_rule"
                    />
                  </v-input>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Email">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.email"
                    placeholder="Enter Email"
                    outlined
                    dense
                    :rules="company_email_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Requires Payroll Input">
                <div slot="input">
                  <v-select
                    v-model="payrollInput"
                    :items="['Yes', 'No']"
                    placeholder="Select option"
                    outlined
                    dense
                    @change="updatePayrollInput"
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="TRN Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.trn_number"
                    placeholder="Enter TRN Number"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="PO Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.PO_number"
                    placeholder="Enter PO Number"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="GRN Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.GRN_number"
                    placeholder="Enter GRN Number"
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
                    v-model="companiesDetailsObj.address"
                    placeholder="Enter Company Address"
                    outlined
                    dense

                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-container fluid>
              <v-row>
                <v-col cols="12">
                  <h4 class="text--text">BILLING ADDRESS</h4>
                </v-col>
                <v-col cols="12" sm="6">
                  <CustomInputContainer label="Company Name">
                    <div slot="input">
                      <v-text-field
                        v-model="billingAddress.company_name"
                        placeholder="Company Name"
                        outlined
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="6">
                  <CustomInputContainer label="Street Address (Line 1)">
                    <div slot="input">
                      <v-text-field
                        v-model="billingAddress.address_line1"
                        placeholder="Street Address"
                        outlined
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="6">
                  <CustomInputContainer label="Street Address (Line 2)">
                    <div slot="input">
                      <v-text-field
                        v-model="billingAddress.address_line2"
                        placeholder="Apt, Suite, etc. (optional)"
                        outlined
                        dense
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="4">
                  <CustomInputContainer label="City">
                    <div slot="input">
                      <v-text-field
                        v-model="billingAddress.city"
                        placeholder="City"
                        outlined
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="4">
                  <CustomInputContainer label="State/Province/Region">
                    <div slot="input">
                      <v-text-field
                        v-model="billingAddress.state"
                        placeholder="State/Province/Region"
                        outlined
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="4">
                  <CustomInputContainer label="ZIP/Postal Code">
                    <div slot="input">
                      <v-text-field
                        v-model="billingAddress.zip"
                        placeholder="ZIP/Postal Code"
                        outlined
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="4">
                  <CustomInputContainer label="Country">
                    <div slot="input">
                      <v-select
                        v-model="billingAddress.country"
                        :items="countryList"
                        placeholder="Select Country"
                        outlined
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="4">
                  <CustomInputContainer label="Phone Number">
                    <div class="tw-flex tw-items-end" slot="input">
                      <v-input>
                        <template v-slot:prepend>
                          <v-select
                            v-model="phoneNumberText.billing"
                            :items="countryCode"
                            item-text="name"
                            item-value="code"
                            ref="billing_phone"
                            label="Code"
                            outlined
                            dense
                            :rules="main_rule"
                            :menu-props="{ closeOnClick: true }"
                          >
                            <template v-slot:selection="data">
                              {{ data.item.emoji }} +{{ data.item.code }}
                            </template>
                            <template v-slot:item="data">
                              <v-list-item
                                @click="updatePhone('billing', data.item)"
                              >
                                <v-list-item-content>
                                  <v-list-item-title>
                                    {{ data.item.emoji }} {{ data.item.name }}
                                  </v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action>
                                  +{{ data.item.code }}
                                </v-list-item-action>
                              </v-list-item>
                            </template>
                          </v-select>
                        </template>
                      </v-input>
                      <v-text-field
                        v-model="phoneNumbers.billing"
                        type="number"
                        placeholder="Phone number"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" sm="4">
                  <CustomInputContainer label="Email Address">
                    <div slot="input">
                      <v-text-field
                        v-model="billingAddress.email"
                        placeholder="Email Address"
                        outlined
                        dense
                        :rules="email_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12">
                  <h4 class="text--text">SHIPPING ADDRESS</h4>
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="sameAsBilling"
                    label="Same as Billing Address"
                    @change="copyBillingAddress"
                  />
                </v-col>
                <template v-if="!sameAsBilling">
                  <v-col cols="12" sm="6">
                    <CustomInputContainer label="Company Name">
                      <div slot="input">
                        <v-text-field
                          v-model="shippingAddress.company_name"
                          placeholder="Company Name"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <CustomInputContainer label="Street Address (Line 1)">
                      <div slot="input">
                        <v-text-field
                          v-model="shippingAddress.address_line1"
                          placeholder="Street Address"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <CustomInputContainer label="Street Address (Line 2)">
                      <div slot="input">
                        <v-text-field
                          v-model="shippingAddress.address_line2"
                          placeholder="Apt, Suite, etc. (optional)"
                          outlined
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <CustomInputContainer label="City">
                      <div slot="input">
                        <v-text-field
                          v-model="shippingAddress.city"
                          placeholder="City"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <CustomInputContainer label="State/Province/Region">
                      <div slot="input">
                        <v-text-field
                          v-model="shippingAddress.state"
                          placeholder="State/Province/Region"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <CustomInputContainer label="ZIP/Postal Code">
                      <div slot="input">
                        <v-text-field
                          v-model="shippingAddress.zip"
                          placeholder="ZIP/Postal Code"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <CustomInputContainer label="Country">
                      <div slot="input">
                        <v-select
                          v-model="shippingAddress.country"
                          :items="countryList"
                          placeholder="Select Country"
                          outlined
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <CustomInputContainer label="Phone Number">
                      <div slot="input">
                        <v-input>
                          <template v-slot:prepend>
                            <v-select
                              v-model="phoneNumberText.shipping"
                              :items="countryCode"
                              item-text="name"
                              item-value="code"
                              ref="shipping_phone"
                              label="Code"
                              outlined
                              dense
                              :rules="main_rule"
                              :menu-props="{ closeOnClick: true }"
                            >
                              <template v-slot:selection="data">
                                {{ data.item.emoji }} +{{ data.item.code }}
                              </template>
                              <template v-slot:item="data">
                                <v-list-item
                                  @click="updatePhone('shipping', data.item)"
                                >
                                  <v-list-item-content>
                                    <v-list-item-title>
                                      {{ data.item.emoji }} {{ data.item.name }}
                                    </v-list-item-title>
                                  </v-list-item-content>
                                  <v-list-item-action>
                                    +{{ data.item.code }}
                                  </v-list-item-action>
                                </v-list-item>
                              </template>
                            </v-select>
                          </template>
                          <v-text-field
                            v-model="phoneNumbers.shipping"
                            type="number"
                            placeholder="Phone number"
                            outlined
                            dense
                            :rules="phone_rule"
                          />
                        </v-input>
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <CustomInputContainer label="Email Address">
                      <div slot="input">
                        <v-text-field
                          v-model="shippingAddress.email"
                          placeholder="Email Address"
                          outlined
                          dense
                          :rules="email_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                  <v-col cols="12">
                    <CustomInputContainer label="Special Instructions">
                      <div slot="input">
                        <v-textarea
                          v-model="shippingAddress.special_instructions"
                          placeholder="Enter any special delivery instructions"
                          outlined
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </v-col>
                </template>
              </v-row>
            </v-container>
            <v-col cols="6">
              <CustomInputContainer label="Website">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.website"
                    placeholder="Enter website"
                    outlined
                    dense
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6">
              <CustomInputContainer label="Unique Number">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.unique_code"
                    placeholder="Enter Code"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="d-flex align-center">
              <v-radio-group
                v-model="selectedStatus"
                row
                @change="showWarningDialog"
              >
                <v-radio label="Active" value="active" class="mr-2"></v-radio>
                <v-radio
                  label="Inactive"
                  value="inactive"
                  class="mr-2"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-dialog v-model="dialog" max-width="400">
              <v-card rounded="lg" elevation="8">
                <v-card-title class="headline text-center pb-2">
                  <v-icon color="orange" size="28" class="mr-2"
                    >mdi-alert</v-icon
                  >
                  Warning
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text
                  v-if="this.selectedStatus === 'inactive'"
                  class="pt-4 text-center"
                >
                  You have selected to set this client as "<strong
                    class="warning--text"
                    >{{ this.selectedStatus }}</strong
                  >". This action will mark all employees of this company under
                  the processes of Onboarding, Visa Process, Offboarding as
                  <strong>Completed</strong>
                </v-card-text>
                <v-card-text
                  v-if="this.selectedStatus === 'active'"
                  class="pt-4 text-center"
                >
                  You have selected to set this client as "<strong
                    class="warning--text"
                    >{{ this.selectedStatus }}</strong
                  >". Are you sure? You will have to start over onboarding
                  employees
                </v-card-text>
                <v-card-actions class="pb-6 px-6">
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    rounded
                    elevation="0"
                    class="px-6"
                    flat
                    @click="confirmSelection"
                  >
                    Yes
                  </v-btn>
                  <v-btn
                    color="peo-light-gray"
                    rounded
                    elevation="0"
                    class="ml-4 px-6"
                    @click="cancelSelection"
                  >
                    No
                  </v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'PAYROLL DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.payroll_schedule
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Invoice Date">
                <div slot="input">
                  <v-combobox
                    v-model="companiesDetailsObj.payroll_schedule.invoice_date"
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
                      companiesDetailsObj.payroll_schedule
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
                      companiesDetailsObj.payroll_schedule.salary_payment_date
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
            <v-col cols="4">
              <CustomInputContainer label="Input Cutoff Date">
                <div slot="input">
                  <v-combobox
                    v-model="
                      companiesDetailsObj.payroll_schedule.input_cutoff_date
                    "
                    :items="dateOptions"
                    item-text="display"
                    item-value="value"
                    placeholder="Input Cutoff Date"
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
                            Press enter to save "{{ searchInputs.input_cutoff_date }}"
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Automated Invoices">
                <div slot="input">
                  <v-combobox
                    v-model="
                      companiesDetailsObj.payroll_schedule.automated_payroll
                    "
                    :items="[
                      { display: 'Yes', value: true },
                      { display: 'No', value: false },
                    ]"
                    item-text="display"
                    item-value="value"
                    placeholder="Automated Invoices"
                    outlined
                    dense
                    :rules="main_rule"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Press enter to save "{{ searchInputs.automated_payroll }}"
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Mandatory Input">
                <div slot="input">
                  <v-combobox
                    v-model="
                      companiesDetailsObj.payroll_schedule.mandatory_input
                    "
                    :items="[
                      { display: 'Yes', value: true },
                      { display: 'No', value: false },
                    ]"
                    item-text="display"
                    item-value="value"
                    placeholder="Mandatory Input"
                    outlined
                    dense
                    :rules="main_rule"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            Press enter to save "{{ searchInputs.mandatory_input }}"
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="4">
              <CustomInputContainer label="Invoice Format">
                <div slot="input">
                  <v-combobox
                    v-model="invoiceFormat"
                    :items="['company', 'individual']"
                    placeholder="Select Invoice Format"
                    outlined
                    dense
                    :rules="main_rule"
                  >
                  </v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>

          <template
            v-if="
              headerTitle == 'CONTACT PERSON' &&
              companiesDetailsObj &&
              companiesDetailsObj.contact_persons
            "
          >
            <v-row
              :class="[
                'pa-0 tw-border tw-border-gray-200 tw-p-3 tw-rounded-md',
                index < companiesDetailsObj.contact_persons.length - 1
                  ? 'tw-mb-3'
                  : '',
              ]"
              v-for="(value, index) in contact_persons"
              :key="index"
            >
              <v-col cols="12">
                <div class="tw-flex tw-items-center tw-justify-between">
                  <p class="tw-font-bold">
                    Contact person
                    <span
                      class="tw-rounded-full tw-w-10 tw-h-10 tw-bg-blue-500 tw-text-white"
                      >{{ index + 1 }}</span
                    >
                  </p>
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        color="red"
                        dark
                        v-bind="attrs"
                        v-on="on"
                        @click="RemoveContactDetails(index)"
                      >
                        <v-icon color="red" v-on="on" small>fa-trash</v-icon>
                      </v-btn>
                    </template>
                    <span>Remove</span><br />
                  </v-tooltip>
                </div>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone">
                  <div slot="input">
                    <div class="tw-flex tw-gap-x-3 tw-items-start">
                      <div class="">
                        <!-- <v-input class="!tw-flex-1">
                      <template v-slot:prepend>
                        <v-select
                          v-model="phoneNumberText.contacts[index]"
                          :items="countryCode"
                          item-text="name"
                          item-value="code"
                          :ref="`contact_phone_${index}`"
                          label="Code"
                          outlined
                          flat
                          dense
                          :menu-props="{
                            closeOnContentClick: true,
                            closeOnClick: true,
                          }"
                        >
                          <template v-slot:selection="data">
                            {{ data.item.emoji }} +{{ data.item.code }}
                          </template>
                          <template v-slot:item="data">
                            <v-list-item
                              @click="updateContactPhone(index, data.item)"
                            >
                              <v-list-item-content>
                                <v-list-item-title>
                                  {{ data.item.emoji }} {{ data.item.name }}
                                </v-list-item-title>
                              </v-list-item-content>
                              <v-list-item-action>
                                +{{ data.item.code }}
                              </v-list-item-action>
                            </v-list-item>
                          </template>
                        </v-select>
                      </template>
                    </v-input> -->
                        <VueCountryCode
                          enabledCountryCode
                          :defaultCountry="contact_persons[index].phone.name || ''"
                          @onSelect="(value) => onSelectCountryCode(value, index)"
                        />
                      </div>
                      <v-text-field
                        v-model="contact_persons[index].phone.number"
                        placeholder="Phone"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </div>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Name">
                  <div slot="input">
                    <v-text-field
                      v-model="value.name"
                      placeholder="Name"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Designation">
                  <div slot="input">
                    <v-text-field
                      v-model="value.designation"
                      placeholder="Designation"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="8">
                <CustomInputContainer label="Email">
                  <div slot="input">
                    <v-text-field
                      v-model="value.email"
                      placeholder="Email"
                      outlined
                      dense
                      :rules="email_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Department">
                  <div slot="input">
                    <v-select
                      v-model="value.department"
                      :items="departmentOptions"
                      placeholder="Select Department"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="tw-mt-2 tw-py-2">
              <v-spacer />
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    outlined
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                    @click="AddContactDetails"
                  >
                    <v-icon v-on="on">fa-add</v-icon>
                    Add POC
                  </v-btn>
                </template>
                <span>Add POC</span><br />
              </v-tooltip>
            </v-row>
          </template>
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'Modules' &&
              companiesDetailsObj &&
              companiesDetailsObj.configurations &&
              companiesDetailsObj.configurations.modules.length > 0
            "
          >
            <v-col cols="10">
              <CustomInputContainer label="Modules">
                <div slot="input">
                  <v-combobox
                    :items="companiesDetailsObj.configurations.modules"
                    v-model="companiesDetailsObj.configurations.modules"
                    multiple
                    chips
                  ></v-combobox>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-row>
              <span>Note<strong style="color: #ff0000">*</strong></span
              >:<i>Press Enter After Adding New Module</i>
            </v-row>
          </v-row>
          <v-row class="pa-0 ma-0" v-if="headerTitle == 'COMPANY LOCATIONS'">
            <v-col cols="4">
              <CustomInputContainer label="Company Country">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.country"
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
          <v-row
            class="pa-0 ma-0"
            v-if="
              headerTitle == 'BANK DETAILS' &&
              companiesDetailsObj &&
              companiesDetailsObj.bank_details &&
              companiesDetailsObj.bank_details.length > 0
            "
          >
            <v-col cols="4">
              <CustomInputContainer label="Bank Name">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank_details[0].bank_name"
                    placeholder="Bank Name"
                    outlined
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
                    v-model="companiesDetailsObj.bank_details[0].account_number"
                    placeholder="Account Number"
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
                    v-model="companiesDetailsObj.bank_details[0].bank_address"
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
                    v-model="companiesDetailsObj.bank_details[0].iban"
                    placeholder="IBAN"
                    outlined
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
              <v-col cols="4">
              <CustomInputContainer label="Swift Code">
                <div slot="input">
                  <v-text-field
                    v-model="companiesDetailsObj.bank_details[0].swift_code"
                    placeholder="Swift Code"
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
                    v-model="
                      companiesDetailsObj.bank_details[0].salary_payment_mode
                    "
                    placeholder="Salary Payment Mode"
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
  </v-row>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import countries from 'countries-list'
import VueCountryCode from 'vue-country-code'

export default {
  components: {
    CustomInputContainer,
    VueCountryCode,
  },
  props: {
    handleModel: Function,
    companiesDetails: Array,
    selectedCustomer: String,
    headerTitle: String,
  },
  data() {
    return {
      departmentOptions: [
        'HR Point of Contact',
        'Financial Point of Contact',
        'Escalation Point of Contact',
      ],
      loading: false,
      selectedContactPerson: {},
      contactPersonPopup: false,
      main_rule: [(v) => !!v || 'This field is required'],
      number_rule: [
        (v) => !!v || 'This field is required',
        (v) => /^\d+$/.test(v) || 'Only numeric values',
      ],
      // email_rule: [
      //   (v) => !!v || 'Email is required',
      //   (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
      // ],
      // email_rule: [
      //     v => !!v || 'Email is required',
      //     v => {
      //       if (!v) return true;
      //       const value = v.trim();
      //       const isValid = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
      //       return isValid || 'Email must be valid and lowercase with no spaces';
      //     },
      //     v => {
      //       if (!v) return true;
      //       return v === v.trim().toLowerCase() || 'Email must be lowercase with no trailing spaces';
      //     }
      //   ],
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => {
          if (!v) return true
          const trimmed = v.trim()
          const isValidFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(
            trimmed
          )
          return (
            isValidFormat || 'Email must be valid and lowercase with no spaces'
          )
        },
        (v) => {
          if (!v) return true
          return (
            v === v.trim().toLowerCase() ||
            'Email must be lowercase with no trailing spaces'
          )
        },
      ],
      company_email_rule: [
        // (v) => !!v || 'Email is required',
        (v) => {
          if (!v) return true
          const trimmed = v.trim()
          const isValidFormat = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(
            trimmed
          )
          return (
            isValidFormat || 'Email must be valid and lowercase with no spaces'
          )
        },
        (v) => {
          if (!v) return true
          return (
            v === v.trim().toLowerCase() ||
            'Email must be lowercase with no trailing spaces'
          )
        },
      ],
      phone_rule: [
        // (v) => !!v || 'Phone number is required',
        (v) => /^\d+$/.test(v) || 'Please enter valid phone number',
      ],
      status: 'active',
      selectedStatus: null,
      dialog: false,
      countryCode: [],
      phoneNumbers: {
        main: '',
        billing: '',
        shipping: '',
        contacts: [],
      },
      phoneNumberText: {
        main: null,
        billing: null,
        shipping: null,
        contacts: [],
      },
      companiesDetailsObj: {
        legal_name: '',
        company_name: '',
        address:'',
        registration_number: '',
        email: '',
        trn_number: '',
        PO_number: '',
        GRN_number: '',
        website: '',
        unique_code: '',
        requires_payroll_input: false,
        payroll_schedule: {
          invoice_date: '',
          payment_due_notification: '',
          salary_payment_date: '',
          invoice_format: '',
          input_cutoff_date: '',
          automated_payroll: false,
          mandatory_input: false,
        },
        contact_persons: [],
        configurations: {
          modules: [],
          contract: '',
          self_services: '',
        },
        country: '',
        company_address: '',
        bank_details: [
          {
            bank_name: '',
            account_number: '',
            bank_address: '',
            iban: '',
            salary_payment_mode: '',
            swift_code: '',
          },
        ],
        billing_address: {
          company_name: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
          email: '',
        },
        shipping_address: {
          company_name: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
          email: '',
          special_instructions: '',
        },
      },
      contact_persons: [],
      payrollInput: 'No',
      newModule: [],
      sameAsBilling: false,
      defaultBillingAddress: {
        company_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        email: '',
      },
      defaultShippingAddress: {
        company_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        email: '',
        special_instructions: '',
      },
      searchInputs: {
        invoice_date: '',
        payment_due: '',
        salary_date: '',
        input_cutoff_date: '',
      },
      dateOptions: [
        { display: 'Not Applicable', value: 'N/A' },
        ...Array.from({ length: 28 }, (_, i) => {
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
  mounted() {
    this.companiesDetailsObj = { ...this.companiesDetails[0] }
    this.selectedStatus = this.companiesDetailsObj.status || 'active'
    this.status = this.selectedStatus
    this.payrollInput = this.companiesDetailsObj.requires_payroll_input
      ? 'Yes'
      : 'No'

    // Initialize default addresses with company name
    this.defaultBillingAddress.company_name =
      this.companiesDetailsObj.company_name || ''
    this.defaultShippingAddress.company_name =
      this.companiesDetailsObj.company_name || ''

    this.initializeCountryCodes()
    this.initializePhoneNumbers()

    console.log('mounted is called')
  },
  methods: {
    onSelectCountryCode({ name, iso2, dialCode }, index) {
      // console.log(name, iso2, dialCode)
      this.contact_persons[index].phone.code = `+${dialCode}`
    },
    initializeCountryCodes() {
      const countryCodes = Object.keys(countries.countries).map((code) => ({
        name: countries.countries[code].name,
        code: countries.countries[code].phone,
        emoji: countries.countries[code].emoji || '',
        iso2: code
      }))
      this.countryCode = countryCodes.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    },
    initializePhoneNumbers() {
      if (this.companiesDetailsObj.phone) {
        const [code, number] = this.splitPhoneNumber(
          this.companiesDetailsObj.phone
        )
        this.phoneNumberText.main = code
        this.phoneNumbers.main = number
      }
      if (this.companiesDetailsObj.billing_address?.phone) {
        const [code, number] = this.splitPhoneNumber(
          this.companiesDetailsObj.billing_address.phone
        )
        this.phoneNumberText.billing = code
        this.phoneNumbers.billing = number
      }
      if (this.companiesDetailsObj.shipping_address?.phone) {
        const [code, number] = this.splitPhoneNumber(
          this.companiesDetailsObj.shipping_address.phone
        )
        this.phoneNumberText.shipping = code
        this.phoneNumbers.shipping = number
      }
      if (this.companiesDetailsObj.contact_persons) {
        this.companiesDetailsObj.contact_persons.forEach((person, index) => {
          // If department is not set, provide a default
          if (!person.department) {
            this.$set(
              this.companiesDetailsObj.contact_persons[index],
              'department',
              this.departmentOptions[0]
            )
          }
          const [code, number, name] = this.extractCountryCode(person.phone || '')
          this.contact_persons.push({ ...person,
            phone: {
              code,
              number,
              name,
            }
          })
          this.$set(this.phoneNumberText.contacts, index, code)
          this.$set(this.phoneNumbers.contacts, index, number)
        })
      }
    },
    extractCountryCode(phoneNumber) {
      // Normalize phone number to ensure it starts with '+'
      if (!phoneNumber.startsWith('+')) {
        return [null, phoneNumber, null];
      }

      // Sort country codes by length descending to match the longest one first
      const sortedCodes = [...this.countryCode].sort((a, b) => b.code.length - a.code.length);

      for (const {code, iso2} of sortedCodes) {
        if (phoneNumber.startsWith(`+${code}`)) {
          const numberWithoutCode = phoneNumber.slice(code.length + 1); // +1 to account for the '+' symbol
          return [code, numberWithoutCode, iso2];
        }
      }

      return [null, phoneNumber, null];
    },
    splitPhoneNumber(phone) {
      if (!phone) return [null, '']
      const match = phone.match(/^\+(\d+)(.*)$/)
      if (match) {
        const code = match[1]
        const number = match[2].replace(/^\s+/, '')
        return [code, number]
      }
      return [null, phone]
    },
    updatePhone(type, item) {
      this.phoneNumberText[type] = item.code
    },
    // updateContactPhone(index, item) {
    //   this.$set(this.phoneNumberText.contacts, index, item.code);
    // },
    updateContactPhone(index, item) {
      this.$set(this.phoneNumberText.contacts, index, item.code)
      // Let the menu props handle closing
    },
    // updateContactPhoneNumber(index, value) {
    //   this.$set(this.phoneNumbers.contacts, index, value)
    //   this.companiesDetailsObj.contact_persons[index].phone = this
    //     .phoneNumberText.contacts[index]
    //     ? `+${this.phoneNumberText.contacts[index]}${value}`
    //     : value
    // },
    updateContactPhoneNumber(index, value) {
      // Store the raw phone number (without country code) in phoneNumbers.contacts array
      this.$set(this.phoneNumbers.contacts, index, value)

      // Format and store the complete phone number in the company object
      if (this.phoneNumberText.contacts[index]) {
        this.companiesDetailsObj.contact_persons[
          index
        ].phone = `+${this.phoneNumberText.contacts[index]}${value}`
      } else {
        this.companiesDetailsObj.contact_persons[index].phone = value
      }
    },
    getContactPhoneCode(index) {
      return this.phoneNumberText.contacts[index] || null
    },
    getContactPhoneNumber(index) {
      return this.phoneNumbers.contacts[index] || ''
    },
    close() {
      this.$emit('close')
    },
    AddContactDetails() {
      const newContact = {
        phone: {
          number: '',
          code: '',
          name: ''
        },
        name: '',
        designation: '',
        email: '',
        department: this.departmentOptions[0], // Default to HR Point of Contact
      }
      this.contact_persons.push(newContact)
    },
    RemoveContactDetails(index) {
      this.contact_persons.splice(index, 1)
    },
    copyBillingAddress() {
      if (this.sameAsBilling) {
        this.companiesDetailsObj.shipping_address = {
          ...this.billingAddress,
          phone: this.phoneNumberText.billing
            ? `+${this.phoneNumberText.billing}${this.phoneNumbers.billing}`
            : this.phoneNumbers.billing,
          special_instructions:
            this.companiesDetailsObj.shipping_address?.special_instructions ||
            '',
        }
        // Copy phone number data using $set to ensure reactivity
        this.$set(this.phoneNumberText, 'shipping', this.phoneNumberText.billing)
        this.$set(this.phoneNumbers, 'shipping', this.phoneNumbers.billing)
      } else {
        // When creating a new shipping address, ensure company_name is in sync
        this.companiesDetailsObj.shipping_address = {
          ...this.defaultShippingAddress,
          company_name: this.companiesDetailsObj.company_name || '',
          special_instructions: '',
        }
        this.$set(this.phoneNumberText, 'shipping', null)
        this.$set(this.phoneNumbers, 'shipping', '')
      }
    },
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
    updatePayrollInput(selected) {
      this.companiesDetailsObj.requires_payroll_input = selected === 'Yes'
    },
    customFilter(item, queryText) {
      const text = item.display.toLowerCase()
      const searchText = queryText.toLowerCase()
      return text.indexOf(searchText) > -1
    },
    showWarningDialog(value) {
      this.selectedStatus = value
      this.dialog = true
    },
    confirmSelection() {
      this.status = this.selectedStatus
      this.dialog = false
    },
    cancelSelection() {
      this.dialog = false
    },
    async editEmployerDetails() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        if (this.headerTitle === 'COMPANY DETAILS') {
          // Create a clone of the company details object
          let obj = { ...this.companiesDetailsObj }

          // Format the main phone number with country code
          obj.phone = this.phoneNumberText.main
            ? `+${this.phoneNumberText.main}${this.phoneNumbers.main}`
            : this.phoneNumbers.main

          // Ensure billing address has the company name synced and format phone number
          obj.billing_address = {
            ...this.billingAddress,
            company_name: this.companiesDetailsObj.company_name, // Always sync with main company name
            phone: this.phoneNumberText.billing
              ? `+${this.phoneNumberText.billing}${this.phoneNumbers.billing}`
              : this.phoneNumbers.billing,
          }

          // Handle shipping address based on whether it's same as billing
          if (this.sameAsBilling) {
            obj.shipping_address = {
              ...obj.billing_address, // Copy all billing details
              special_instructions:
                this.companiesDetailsObj.shipping_address
                  ?.special_instructions || '', // Preserve special instructions or set empty string
            }
          } else {
            obj.shipping_address = {
              ...this.shippingAddress,
              company_name: this.companiesDetailsObj.company_name, // Always sync with main company name
              phone: this.phoneNumberText.shipping
                ? `+${this.phoneNumberText.shipping}${this.phoneNumbers.shipping}`
                : this.phoneNumbers.shipping,
              special_instructions:
                this.shippingAddress.special_instructions || '', // Ensure it's never null
            }
          }

          // Define field mappings for any special field name handling
          const fieldMappings = {
            PO_number: 'PO_number',
            GRN_number: 'GRN_number',
          }

          // Define which fields to include in the update object
          // Note: company_name is excluded to prevent editing
          const fieldsToUpdate = [
            'legal_name',
            // 'company_name', - Excluded to prevent editing
            'registration_number',
            'phone',
            'email',
            'billing_address',
            'shipping_address',
            'website',
            'unique_code',
            'trn_number',
            'requires_payroll_input',
            'PO_number',
            'GRN_number',
            'address', // <-- Ensure address is included
          ]

          // Create the update object with status
          let updateObj = { status: this.status }

          // Add each field from fieldsToUpdate to the update object
          fieldsToUpdate.forEach((field) => {
            if (obj[field] !== undefined) {
              const mappedField = fieldMappings[field] || field
              updateObj[mappedField] = obj[field]
            }
          })

          // Make the API call to update company details
          await this.$axios.$patch(
            `/companies/${this.selectedCustomer}`,
            updateObj,
            { headers: { Authorization: AuthStr } }
          )
        } else if (this.headerTitle === 'PAYROLL DETAILS') {
          // Format the payroll schedule object
          let obj = {
            payroll_schedule: {
              salary_payment_date:
                this.companiesDetailsObj.payroll_schedule.salary_payment_date,
              payment_due_notification:
                this.companiesDetailsObj.payroll_schedule
                  .payment_due_notification,
              invoice_date:
                this.companiesDetailsObj.payroll_schedule.invoice_date,
              invoice_format: this.invoiceFormat,
              input_cutoff_date:
                this.companiesDetailsObj.payroll_schedule.input_cutoff_date,
              automated_payroll:
                this.companiesDetailsObj.payroll_schedule.automated_payroll,
              mandatory_input:
                this.companiesDetailsObj.payroll_schedule.mandatory_input,
            },
          }

          // Make the API call to update payroll details
          await this.$axios.$patch(`/companies/${this.selectedCustomer}`, obj, {
            headers: { Authorization: AuthStr },
          })
        } else if (this.headerTitle === 'CONTACT PERSON') {
          // Format contact persons with phone numbers
          const contactPersons = this.contact_persons.map(
            (person, index) => ({
              ...person,
              email: person.email.length ? person.email.toLowerCase() : '',
              phone: `${person.phone.code}${person.phone.number}`,
            })
          )

          let obj = { contact_persons: contactPersons }

          // Make the API call to update contact persons
          await this.$axios.$put(
            `/companies/contact_update/${this.selectedCustomer}`,
            obj,
            { headers: { Authorization: AuthStr } }
          )
        } else if (this.headerTitle === 'Modules') {
          // Format the configurations object
          let obj = {
            configurations: {
              modules: this.companiesDetailsObj.configurations.modules,
              contract: this.companiesDetailsObj.configurations.contract,
              self_services:
                this.companiesDetailsObj.configurations.self_services,
            },
          }

          // Make the API call to update module configurations
          await this.$axios.$patch(`/companies/${this.selectedCustomer}`, obj, {
            headers: { Authorization: AuthStr },
          })
        } else if (this.headerTitle === 'COMPANY LOCATIONS') {
          // Format the location details
          let obj = {
            country: this.companiesDetailsObj.country,
            company_address: this.companiesDetailsObj.company_address,
          }

          // Make the API call to update company locations
          await this.$axios.$patch(`/companies/${this.selectedCustomer}`, obj, {
            headers: { Authorization: AuthStr },
          })
        } else if (this.headerTitle === 'BANK DETAILS') {
          // Format the bank details
          let bank_details = {
            bank_name: this.companiesDetailsObj.bank_details[0]?.bank_name,
            account_number:
              this.companiesDetailsObj.bank_details[0]?.account_number,
            bank_address:
              this.companiesDetailsObj.bank_details[0]?.bank_address,
            iban: this.companiesDetailsObj.bank_details[0]?.iban,
            swift_code: this.companiesDetailsObj.bank_details[0]?.swift_code,
            salary_payment_mode:
              this.companiesDetailsObj.bank_details[0]?.salary_payment_mode,
          }

          let obj = { bank_details: [bank_details] }

          await this.$axios.$patch(`/companies/${this.selectedCustomer}`, obj, {
            headers: { Authorization: AuthStr },
          })
        }

        // Close the form after successful update
        this.close()
      } catch (error) {
        console.error('Error updating employer details:', error)
      } finally {
        this.loading = false
      }
    },
  },
  computed: {
    countryList() {
      const countryCodes = Object.keys(countries.countries)
      const countryNames = countryCodes.map(
        (code) => countries.countries[code].name
      )
      return countryNames.sort()
    },
    billingAddress() {
      return (
        this.companiesDetailsObj.billing_address || this.defaultBillingAddress
      )
    },
    shippingAddress() {
      return (
        this.companiesDetailsObj.shipping_address || this.defaultShippingAddress
      )
    },
    invoiceFormat: {
      get() {
        return (
          this.companiesDetailsObj.payroll_schedule?.invoice_format ||
          this.companiesDetailsObj.invoice_format ||
          ''
        )
      },
      set(value) {
        if (this.companiesDetailsObj.payroll_schedule) {
          this.companiesDetailsObj.payroll_schedule.invoice_format = value
        } else {
          this.companiesDetailsObj.invoice_format = value
        }
      },
    },
  },
  watch: {
    'companiesDetailsObj.company_name': function (newCompanyName) {
      // When the main company name changes, update the default addresses
      if (newCompanyName) {
        this.defaultBillingAddress.company_name = newCompanyName
        this.defaultShippingAddress.company_name = newCompanyName

        // If we have billing or shipping addresses already, update them too
        if (this.companiesDetailsObj.billing_address) {
          this.companiesDetailsObj.billing_address.company_name = newCompanyName
        }

        if (this.companiesDetailsObj.shipping_address) {
          this.companiesDetailsObj.shipping_address.company_name =
            newCompanyName
        }
      }
    },
  },
}
</script>
