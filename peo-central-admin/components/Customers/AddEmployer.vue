<template>
  <v-row>
    <v-col cols="12">
      <v-card id="tall_dialog">
        <v-card-title id="card-title">
          <h4 class="text--text">Add New Company</h4>
          <div class="flex_row justify-end">
            <v-btn class="tall__btn mr-2 px-5" color="subtext" outlined @click="close()">Cancel</v-btn>
            <v-img src="/animated/ring.svg" width="40px" height="40px" contain class="" v-if="AddEmployeeLoading"></v-img>
            <v-btn class="tall__btn px-9" color="primary" min-width="100px" @click="addEmployerDetails">Add Client</v-btn>
          </div>
        </v-card-title>
        <v-divider id="divider" class="mt-5"></v-divider>
        <v-card-text id="card-text">
          <v-form ref="companyForm">
            <v-row class="pa-0 ma-0">
              <v-col cols="12">
                <h4 class="text--text">COMPANY DETAILS</h4>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Legal Name" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.legal_name" placeholder="name" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Company Name" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.company_name" placeholder="Company Name" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Registration Number" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.registration_number" placeholder="Enter number" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone Number" :mandatory="true">
                  <div slot="input">
                    <v-input>
                      <template v-slot:prepend>
                        <v-select
                          v-model="phoneNumberText.company"
                          :items="countryCode"
                          item-text="name"
                          item-value="code"
                          ref="company_phone"
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
                            <v-list-item @click="updatePhone('company', data.item)">
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
                        v-model="companiesDetailsObj.phone"
                        placeholder="Add phone number"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Email" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.email" placeholder="Enter email" outlined dense :rules="email_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="TRN Number">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.trn_number" placeholder="Enter TRN Number" outlined dense  />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="PO Number">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.po_number" placeholder="Enter PO Number" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="GRN Number">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.grn_number" placeholder="Enter GRN Number" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Country" :mandatory="true">
                  <div slot="input">
                    <v-select :items="countryList" placeholder="Select country" outlined dense v-model="companiesDetailsObj.country" :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Website" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.website" placeholder="Enter website" outlined dense :rules="website_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Address">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.address" placeholder="Enter address" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col cols="12">
                <h4 class="text--text">PAYROLL DETAILS</h4>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Invoice Date" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="dayOptions"
                      item-text="display"
                      item-value="value"
                      v-model="selectedInvoiceDay"
                      placeholder="Select day of month"
                      outlined
                      dense
                      :rules="main_rule"
                      @change="updatePayrollDate('invoice_date')"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Payment Due Date" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="dayOptions"
                      item-text="display"
                      item-value="value"
                      v-model="selectedPaymentDueDay"
                      placeholder="Select day of month"
                      outlined
                      dense
                      :rules="main_rule"
                      @change="updatePayrollDate('payment_due_notification')"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Salary Date" :mandatory="true">
                  <div slot="input">
                    <v-select
                      :items="dayOptions"
                      item-text="display"
                      item-value="value"
                      v-model="selectedSalaryDay"
                      placeholder="Select day of month"
                      outlined
                      dense
                      :rules="main_rule"
                      @change="updatePayrollDate('salary_payment_date')"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Invoice Format" :mandatory="true">
                  <div slot="input">
                    <v-autocomplete
                      :items="[
                        { text: 'Company-Wise', value: 'company-wise' },
                        { text: 'Individual', value: 'individual' }
                      ]"
                      item-text="text"
                      item-value="value"
                      v-model="companiesDetailsObj.payroll_schedule.invoice_format"
                      placeholder="Invoice Format"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col cols="12">
                <h4 class="text--text">CONTACT PERSONS</h4>
                <p class="text--text caption">HR Point of Contact is required. Other contacts are optional.</p>
              </v-col>
              <!-- HR Point of Contact -->
              <v-col cols="12">
                <h5 class="text--text">HR Point of Contact</h5>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Name" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.hr.name"
                      placeholder="Name"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone" :mandatory="true">
                  <div slot="input">
                    <v-input>
                      <template v-slot:prepend>
                        <v-select
                          v-model="phoneNumberText.hr"
                          :items="countryCode"
                          item-text="name"
                          item-value="code"
                          ref="hr_phone"
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
                            <v-list-item @click="updatePhone('hr', data.item)">
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
                        v-model="contactPersons.hr.phone"
                        placeholder="Add phone number"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Email" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.hr.email"
                      placeholder="Email"
                      outlined
                      dense
                      :rules="email_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Designation" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.hr.designation"
                      placeholder="Designation"
                      outlined
                      dense
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- Financial Point of Contact -->
              <v-col cols="12">
                <h5 class="text--text">Financial Point of Contact</h5>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Name">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.financial.name"
                      placeholder="Name"
                      outlined
                      dense
                      :rules="getFinancialRules('name')"
                      @input="validateFinancialContact"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone">
                  <div slot="input">
                    <v-input>
                      <template v-slot:prepend>
                        <v-select
                          v-model="phoneNumberText.financial"
                          :items="countryCode"
                          item-text="name"
                          item-value="code"
                          ref="financial_phone"
                          label="Code"
                          outlined
                          dense
                          :rules="getFinancialRules('phone_code')"
                          :menu-props="{ closeOnClick: true }"
                        >
                          <template v-slot:selection="data">
                            {{ data.item.emoji }} +{{ data.item.code }}
                          </template>
                          <template v-slot:item="data">
                            <v-list-item @click="updatePhone('financial', data.item)">
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
                        v-model="contactPersons.financial.phone"
                        placeholder="Add phone number"
                        outlined
                        dense
                        :rules="getFinancialRules('phone')"
                        @input="validateFinancialContact"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Email">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.financial.email"
                      placeholder="Email"
                      outlined
                      dense
                      :rules="getFinancialRules('email')"
                      @input="validateFinancialContact"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Designation">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.financial.designation"
                      placeholder="Designation"
                      outlined
                      dense
                      :rules="getFinancialRules('designation')"
                      @input="validateFinancialContact"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <!-- Escalation Point of Contact -->
              <v-col cols="12">
                <h5 class="text--text">Escalation Point of Contact</h5>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Name">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.escalation.name"
                      placeholder="Name"
                      outlined
                      dense
                      :rules="getEscalationRules('name')"
                      @input="validateEscalationContact"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone">
                  <div slot="input">
                    <v-input>
                      <template v-slot:prepend>
                        <v-select
                          v-model="phoneNumberText.escalation"
                          :items="countryCode"
                          item-text="name"
                          item-value="code"
                          ref="escalation_phone"
                          label="Code"
                          outlined
                          dense
                          :rules="getEscalationRules('phone_code')"
                          :menu-props="{ closeOnClick: true }"
                        >
                          <template v-slot:selection="data">
                            {{ data.item.emoji }} +{{ data.item.code }}
                          </template>
                          <template v-slot:item="data">
                            <v-list-item @click="updatePhone('escalation', data.item)">
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
                        v-model="contactPersons.escalation.phone"
                        placeholder="Add phone number"
                        outlined
                        dense
                        :rules="getEscalationRules('phone')"
                        @input="validateEscalationContact"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Email">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.escalation.email"
                      placeholder="Email"
                      outlined
                      dense
                      :rules="getEscalationRules('email')"
                      @input="validateEscalationContact"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Designation">
                  <div slot="input">
                    <v-text-field
                      v-model="contactPersons.escalation.designation"
                      placeholder="Designation"
                      outlined
                      dense
                      :rules="getEscalationRules('designation')"
                      @input="validateEscalationContact"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0" v-if="companiesDetailsObj && companiesDetailsObj.configurations && companiesDetailsObj.configurations.modules.length > 0">
              <v-col cols="12">
                <h4 class="text--text">MODULES</h4>
              </v-col>
              <v-col cols="10">
                <CustomInputContainer label="Modules">
                  <div slot="input">
                    <v-combobox
                      :items="companiesDetailsObj.configurations.modules"
                      v-model="companiesDetailsObj.configurations.modules"
                      multiple
                      chips
                      placeholder="Add modules (press Enter to add)"
                      outlined
                      dense
                    ></v-combobox>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12">
                <span class="caption">Note<strong style="color: #ff0000;">*</strong>: Press Enter after adding each module</span>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col cols="12">
                <h4 class="text--text">BILLING ADDRESS</h4>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Street Address (Line 1)" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.billing.address_line1" placeholder="Street Address" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Street Address (Line 2)" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.billing.address_line2" placeholder="Apt, Suite, etc." outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="City" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.billing.city" placeholder="City" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="State/Province/Region" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.billing.state" placeholder="State/Province/Region" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="ZIP/Postal Code" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.billing.zip" placeholder="ZIP/Postal Code" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Country" :mandatory="true">
                  <div slot="input">
                    <v-select v-model="companiesDetailsObj.billing.country" :items="countryList" placeholder="Select Country" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Phone Number" :mandatory="true">
                  <div slot="input">
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
                            <v-list-item @click="updatePhone('billing', data.item)">
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
                        v-model="companiesDetailsObj.billing.phone"
                        placeholder="Add phone number"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Email Address" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.billing.email" placeholder="Email Address" outlined dense :rules="email_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12">
                <h4 class="text--text">SHIPPING ADDRESS</h4>
              </v-col>
              <v-col cols="12">
                <v-checkbox v-model="sameAsBilling" label="Same as Billing Address" @change="copyBillingAddress" />
              </v-col>
              <v-col v-if="!sameAsBilling" cols="6">
                <CustomInputContainer label="Street Address (Line 1)" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.shipping.address_line1" placeholder="Street Address" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col v-if="!sameAsBilling" cols="6">
                <CustomInputContainer label="Street Address (Line 2)" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.shipping.address_line2" placeholder="Apt, Suite, etc." outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col v-if="!sameAsBilling" cols="4">
                <CustomInputContainer label="City" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.shipping.city" placeholder="City" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col v-if="!sameAsBilling" cols="4">
                <CustomInputContainer label="State/Province/Region" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.shipping.state" placeholder="State/Province/Region" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col v-if="!sameAsBilling" cols="4">
                <CustomInputContainer label="ZIP/Postal Code" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.shipping.zip" placeholder="ZIP/Postal Code" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col v-if="!sameAsBilling" cols="4">
                <CustomInputContainer label="Country" :mandatory="true">
                  <div slot="input">
                    <v-select v-model="companiesDetailsObj.shipping.country" :items="countryList" placeholder="Select Country" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col v-if="!sameAsBilling" cols="4">
                <CustomInputContainer label="Phone Number" :mandatory="true">
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
                            <v-list-item @click="updatePhone('shipping', data.item)">
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
                        v-model="companiesDetailsObj.shipping.phone"
                        placeholder="Add phone number"
                        outlined
                        dense
                        :rules="phone_rule"
                      />
                    </v-input>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12">
                <CustomInputContainer label="Special Instructions">
                  <div slot="input">
                    <v-textarea v-model="companiesDetailsObj.shipping.special_instructions" placeholder="Enter any special delivery instructions" outlined dense />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
            <v-row class="pa-0 ma-0">
              <v-col cols="12">
                <h4 class="text--text">BANK DETAILS</h4>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Bank Name" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.bank_details[0].bank_name" placeholder="Bank Name" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Account Number" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.bank_details[0].account_number" placeholder="Account Number" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Bank Address" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.bank_details[0].bank_address" placeholder="Bank Address" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="IBAN" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.bank_details[0].iban" placeholder="IBAN" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="4">
                <CustomInputContainer label="Salary Payment Mode" :mandatory="true">
                  <div slot="input">
                    <v-text-field v-model="companiesDetailsObj.bank_details[0].salary_payment_mode" placeholder="Salary Payment Mode" outlined dense :rules="main_rule" />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue';
import { countries } from 'countries-list';

const _main_rule = [(v) => !!v || 'This field is required'];
const _phone_rule = [
  ..._main_rule,
  (v) => /^[0-9]+$/.test(v) || 'Please input a number',
];

export default {
  components: {
    CustomInputContainer,
  },
  data() {
    return {
      AddEmployeeLoading: false,
      headerTitle: 'Add New Company',
      selectedInvoiceDay: '',
      selectedPaymentDueDay: '',
      selectedSalaryDay: '',
      dayOptions: Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        return {
          value: day.toString(),
          display: this.formatDayWithSuffix(day),
        };
      }),
      countryCode: [],
      phoneNumberText: {
        company: null,
        billing: null,
        shipping: null,
        hr: null,
        financial: null,
        escalation: null,
      },
      main_rule: _main_rule,
      number_rule: [(v) => /^\d+$/.test(v) || 'Only numeric values are allowed'],
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
        (v) => v === v.toLowerCase() || 'Email must be in lowercase',
      ],
      phone_rule: _phone_rule,
      website_rule: [
        (v) => !!v || 'Website is required',
        (v) => /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(v) || 'Invalid website URL',
      ],
      sameAsBilling: false,
      financialContactFilled: false,
      escalationContactFilled: false,
      contactPersons: {
        hr: { name: '', phone: '', email: '', designation: '', department: 'HR Point of Contact' },
        financial: { name: '', phone: '', email: '', designation: '', department: 'Financial Point of Contact' },
        escalation: { name: '', phone: '', email: '', designation: '', department: 'Escalation Point of Contact' },
      },
      companiesDetailsObj: {
        configurations: {
          modules: [],
          contract: '',
          self_services: '',
        },
        payroll_schedule: {
          invoice_date: { display: '', value: '' },
          payment_due_notification: { display: '', value: '' },
          salary_payment_date: { display: '', value: '' },
          invoice_format: 'company-wise',
        },
        legal_name: '',
        company_name: '',
        registration_number: '',
        phone: '',
        email: '',
        trn_number: '',
        po_number: '',
        grn_number: '',
        country: '',
        website: '',
        address:'',
        billing: {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
          email: '',
        },
        shipping: {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
          special_instructions: '',
        },
        bank_details: [
          {
            bank_name: '',
            account_number: '',
            bank_address: '',
            iban: '',
            salary_payment_mode: '',
          },
        ],
      },
    };
  },
  mounted() {
    console.log("AddEmployer component mounted");
    this.set_countries();
    // Initialize with defaults for phone number country codes
    this.initializePhoneDefaults();
  },
  computed: {
    countryList() {
      const countryCodes = Object.keys(countries);
      return countryCodes.map((code) => countries[code].name).sort();
    },
    isHrContactComplete() {
      const hr = this.contactPersons.hr;
      return (
        !!hr.name &&
        !!hr.phone &&
        !!hr.email &&
        !!hr.designation &&
        !!this.phoneNumberText.hr
      );
    },
    isFinancialContactPartiallyFilled() {
      const financial = this.contactPersons.financial;
      return (
        !!financial.name ||
        !!financial.phone ||
        !!financial.email ||
        !!financial.designation ||
        !!this.phoneNumberText.financial
      );
    },
    isEscalationContactPartiallyFilled() {
      const escalation = this.contactPersons.escalation;
      return (
        !!escalation.name ||
        !!escalation.phone ||
        !!escalation.email ||
        !!escalation.designation ||
        !!this.phoneNumberText.escalation
      );
    },
  },
  methods: {
    set_countries() {
      const countryCodes = Object.keys(countries);
      const country_list = countryCodes.map((code) => ({
        name: countries[code].name,
        code: countries[code].phone,
        emoji: countries[code].emoji,
      }));
      this.countryCode = country_list;
    },
    initializePhoneDefaults() {
      // Set default UAE country code (971) for all phone fields
      const defaultCode = this.countryCode.find(c => c.code === '971') || this.countryCode[0];
      if (defaultCode) {
        this.phoneNumberText = {
          company: defaultCode.code,
          billing: defaultCode.code,
          shipping: defaultCode.code,
          hr: defaultCode.code,
          financial: defaultCode.code,
          escalation: defaultCode.code,
        };
      }
    },
    formatDayWithSuffix(day) {
      if (day >= 11 && day <= 13) return day + 'ᵗʰ of each month';
      const lastDigit = day % 10;
      const suffix = lastDigit === 1 ? 'ˢᵗ' : lastDigit === 2 ? 'ⁿᵈ' : lastDigit === 3 ? 'ʳᵈ' : 'ᵗʰ';
      return day + suffix + ' of each month';
    },
    updatePayrollDate(field) {
      if (field === 'invoice_date') {
        this.companiesDetailsObj.payroll_schedule.invoice_date = {
          display: this.formatDayWithSuffix(parseInt(this.selectedInvoiceDay)),
          value: this.selectedInvoiceDay,
        };
      } else if (field === 'payment_due_notification') {
        this.companiesDetailsObj.payroll_schedule.payment_due_notification = {
          display: this.formatDayWithSuffix(parseInt(this.selectedPaymentDueDay)),
          value: this.selectedPaymentDueDay,
        };
      } else if (field === 'salary_payment_date') {
        this.companiesDetailsObj.payroll_schedule.salary_payment_date = {
          display: this.formatDayWithSuffix(parseInt(this.selectedSalaryDay)),
          value: this.selectedSalaryDay,
        };
      }
    },
    close() {
      this.AddEmployeeLoading = false;
      this.$emit('close');
    },
    updatePhone(field, item) {
      this.phoneNumberText[field] = item.code;
      this.closeSelectMenu(field);

      // If updating a contact person field, validate that section
      if (field === 'financial') {
        this.validateFinancialContact();
      } else if (field === 'escalation') {
        this.validateEscalationContact();
      }
    },
    closeSelectMenu(selectModel) {
      const refKey = `${selectModel}_phone`;
      if (this.$refs[refKey]) {
        this.$refs[refKey].isMenuActive = false;
      }
    },
    validateFinancialContact() {
      // Check if any field is filled for financial contact
      this.financialContactFilled = this.isFinancialContactPartiallyFilled;
      // Force form validation to update
      this.$nextTick(() => {
        this.$refs.companyForm.validate();
      });
    },
    validateEscalationContact() {
      // Check if any field is filled for escalation contact
      this.escalationContactFilled = this.isEscalationContactPartiallyFilled;
      // Force form validation to update
      this.$nextTick(() => {
        this.$refs.companyForm.validate();
      });
    },
    getFinancialRules(field) {
      if (this.isFinancialContactPartiallyFilled) {
        if (field === 'email') {
          return [
            v => !!v || 'Email is required when any financial contact information is provided',
            v => !v || /.+@.+\..+/.test(v) || 'Email must be valid',
          ];
        }
        if (field === 'phone') {
          return [
            v => !!v || 'Phone is required when any financial contact information is provided',
            v => !v || /^[0-9]+$/.test(v) || 'Please input a number',
          ];
        }
        if (field === 'phone_code') {
          return [v => !!v || 'Country code is required when any financial contact information is provided'];
        }
        return [v => !!v || 'This field is required when any financial contact information is provided'];
      }
      return []; // No validation if no fields are filled
    },
    getEscalationRules(field) {
      if (this.isEscalationContactPartiallyFilled) {
        if (field === 'email') {
          return [
            v => !!v || 'Email is required when any escalation contact information is provided',
            v => /.+@.+\..+/.test(v) || 'Email must be valid',
          ];
        }

        if (field === 'phone') {
          return [
            v => !!v || 'Phone is required when any escalation contact information is provided',
            v => /^[0-9]+$/.test(v) || 'Please input a valid number',
          ];
        }

        if (field === 'phone_code') {
          return [
            v => !!v || 'Country code is required when any escalation contact information is provided',
          ];
        }
        return [
          v => !!v || 'This field is required when any escalation contact information is provided',
        ];
      }
      return [];
    },
    concatCountryCode(code, phone) {
      if (code && phone) {
        return `+${code}${phone}`;
      }
      return phone;
    },
    async addEmployerDetails() {
      console.log("button clicked--------------->")
      // Now we only require HR contact to be complete
      if (!this.isHrContactComplete) {
        this.$refs.companyForm.validate();
        this.showMessage('HR Point of Contact information must be completely filled.', false);
        return;
      }

      // Check if Financial contact has partial information
      if (this.isFinancialContactPartiallyFilled && !this.isContactComplete(this.contactPersons.financial)) {
        this.$refs.companyForm.validate();
        this.showMessage('Financial Point of Contact has incomplete information. Please complete all fields or clear them.', false);
        return;
      }

      // Check if Escalation contact has partial information
      if (this.isEscalationContactPartiallyFilled && !this.isContactComplete(this.contactPersons.escalation)) {
        this.$refs.companyForm.validate();
        this.showMessage('Escalation Point of Contact has incomplete information. Please complete all fields or clear them.', false);
        return;
      }

      if (this.$refs.companyForm.validate()) {
        this.AddEmployeeLoading = true;
        const AuthStr = 'Bearer '.concat(this.$store.state.token);

        // Always include HR contact
        const contactPersons = [{
          ...this.contactPersons.hr,
          phone: this.concatCountryCode(this.phoneNumberText.hr, this.contactPersons.hr.phone),
        }];

        // Add financial contact if complete
        if (this.isContactComplete(this.contactPersons.financial)) {
          contactPersons.push({
            ...this.contactPersons.financial,
            phone: this.concatCountryCode(this.phoneNumberText.financial, this.contactPersons.financial.phone),
          });
        }

        // Add escalation contact if complete
        if (this.isContactComplete(this.contactPersons.escalation)) {
          contactPersons.push({
            ...this.contactPersons.escalation,
            phone: this.concatCountryCode(this.phoneNumberText.escalation, this.contactPersons.escalation.phone),
          });
        }

        const modules = this.companiesDetailsObj.configurations.modules.map((module) => module);
        const bankDetails = [
          {
            bank_name: this.companiesDetailsObj.bank_details[0].bank_name,
            account_number: this.companiesDetailsObj.bank_details[0].account_number,
            bank_address: this.companiesDetailsObj.bank_details[0].bank_address,
            iban: this.companiesDetailsObj.bank_details[0].iban,
            salary_payment_mode: this.companiesDetailsObj.bank_details[0].salary_payment_mode,
          },
        ];

        const payload = {
          legal_name: this.companiesDetailsObj.legal_name,
          company_name: this.companiesDetailsObj.company_name,
          registration_number: this.companiesDetailsObj.registration_number,
          phone: this.concatCountryCode(this.phoneNumberText.company, this.companiesDetailsObj.phone),
          email: this.companiesDetailsObj.email,
          website: this.companiesDetailsObj.website,
          country: this.companiesDetailsObj.country,
          address: this.companiesDetailsObj.address, // Ensure address is included
          trn_number: this.companiesDetailsObj.trn_number,
          PO_number: this.companiesDetailsObj.po_number,
          GRN_number: this.companiesDetailsObj.grn_number,
          payroll_schedule: {
            invoice_date: this.companiesDetailsObj.payroll_schedule.invoice_date,
            payment_due_notification: this.companiesDetailsObj.payroll_schedule.payment_due_notification,
            salary_payment_date: this.companiesDetailsObj.payroll_schedule.salary_payment_date,
            invoice_format: this.companiesDetailsObj.payroll_schedule.invoice_format || 'company-wise',
          },
          contact_person: contactPersons,
          configurations: {
            modules: modules,
            contract: this.companiesDetailsObj.configurations.contract,
            self_services: this.companiesDetailsObj.configurations.self_services,
          },
          billing_address: {
            address_line1: this.companiesDetailsObj.billing.address_line1,
            address_line2: this.companiesDetailsObj.billing.address_line2,
            city: this.companiesDetailsObj.billing.city,
            state: this.companiesDetailsObj.billing.state,
            zip: this.companiesDetailsObj.billing.zip,
            country: this.companiesDetailsObj.billing.country,
            phone: this.concatCountryCode(this.phoneNumberText.billing, this.companiesDetailsObj.billing.phone),
            email: this.companiesDetailsObj.billing.email,
          },
          shipping_address: this.sameAsBilling
            ? { ...this.companiesDetailsObj.billing,
                phone: this.concatCountryCode(this.phoneNumberText.billing, this.companiesDetailsObj.billing.phone)
              }
            : {
                address_line1: this.companiesDetailsObj.shipping.address_line1,
                address_line2: this.companiesDetailsObj.shipping.address_line2,
                city: this.companiesDetailsObj.shipping.city,
                state: this.companiesDetailsObj.shipping.state,
                zip: this.companiesDetailsObj.shipping.zip,
                country: this.companiesDetailsObj.shipping.country,
                phone: this.concatCountryCode(this.phoneNumberText.shipping, this.companiesDetailsObj.shipping.phone),
                special_instructions: this.companiesDetailsObj.shipping.special_instructions,
              },
          bank_details: bankDetails,
          status: 'new',
        };

        try {
          await this.$axios.$post(`/companies`, payload, { headers: { Authorization: AuthStr } });
          this.showMessage('Company added successfully', true);
          this.$refs.companyForm.reset();
          this.resetForm();
          this.close();
        } catch (error) {
          this.showMessage(`Failed to add company: ${error.message}`, false);
        } finally {
          this.AddEmployeeLoading = false;
        }
      }
    },
    isContactComplete(contact) {
      return (
        contact.name &&
        contact.phone &&
        contact.email &&
        contact.designation
      );
    },
    copyBillingAddress() {
      if (this.sameAsBilling) {
        this.companiesDetailsObj.shipping = JSON.parse(JSON.stringify(this.companiesDetailsObj.billing));
        this.phoneNumberText.shipping = this.phoneNumberText.billing;
      } else {
        this.companiesDetailsObj.shipping = {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
          special_instructions: '',
        };
        // Keep the country code but clear the phone number
        this.phoneNumberText.shipping = this.phoneNumberText.billing;
        this.companiesDetailsObj.shipping.phone = '';
      }
    },
    resetForm() {
      this.companiesDetailsObj = {
        configurations: { modules: [], contract: '', self_services: '' },
        payroll_schedule: {
          invoice_date: { display: '', value: '' },
          payment_due_notification: { display: '', value: '' },
          salary_payment_date: { display: '', value: '' },
          invoice_format: 'company-wise',
        },
        legal_name: '',
        company_name: '',
        registration_number: '',
        phone: '',
        email: '',
        trn_number: '',
        po_number: '',
        grn_number: '',
        country: '',
        website: '',
        billing: {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
          email: '',
        },
        shipping: {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          phone: '',
          special_instructions: '',
        },
        bank_details: [
          {
            bank_name: '',
            account_number: '',
            bank_address: '',
            iban: '',
            salary_payment_mode: '',
          },
        ],
      };
      this.contactPersons = {
        hr: { name: '', phone: '', email: '', designation: '', department: 'HR Point of Contact' },
        financial: { name: '', phone: '', email: '', designation: '', department: 'Financial Point of Contact' },
        escalation: { name: '', phone: '', email: '', designation: '', department: 'Escalation Point of Contact' },
      };
      this.initializePhoneDefaults();
      this.selectedInvoiceDay = '';
      this.selectedPaymentDueDay = '';
      this.selectedSalaryDay = '';
      this.sameAsBilling = false;
      this.financialContactFilled = false;
      this.escalationContactFilled = false;
    },
    showMessage(content, success = true) {
      this.$emit('snackbar', { text: content, success });
    },
  },
};
</script>

<style scoped>
.shared-bottom-outline .v-select__selections {
  border-bottom: 2px solid #3f51b5; /* Adjust color as needed */
}
.shared-bottom-outline .v-input--selection-controls .v-input__control {
  border-bottom: none !important;
}
.error--text .v-messages__message {
  font-size: 0.5rem !important;
}
</style>
