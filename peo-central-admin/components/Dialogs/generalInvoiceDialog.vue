<template>
  <div>
    <v-dialog v-model="show" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
      <v-card>
        <v-card-title id="card-title" class="tw-py-3 tw-px-4">
          <div class="tw-flex tw-items-center">
            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="tw-mr-2" contain></v-img>
            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
              {{
                !effectiveInvoice
                  ? 'New Invoice'
                  : `Edit Invoice -
              ${invoiceToEdit?.invoice_number}`
              }}</span>
          </div>
          <div class="tw-flex tw-gap-5 tw-items-center">
            <!-- <v-btn color="primary" outlined :disabled="!invoice?._id" @click="generatePdfAndDownloadPDF()">Send Via
              Email</v-btn> -->
            <v-btn color="primary" :loading="loading_download_url" :disabled="!invoice?._id" outlined
              @click="generatePdfAndDownloadPDF()">Download</v-btn>
            <v-btn icon outlined color="red" :disabled="submitLoading" @click="closeDialog()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <!-- <v-img src="/animated/ring.svg" v-if="submitLoading" max-width="30" height="30" contain></v-img> -->
          </div>
        </v-card-title>
        <v-divider />
        <v-container fluid>
          <v-row class="py-0 my-0" style="">
            <v-col cols="6">
              <v-stepper v-model="invoiceSections" class="custom-stepper">
                <div class="tw-px-4 tw-py-2">
                  <div class="custom-stepper-header tw-flex tw-items-center tw-justify-center tw-gap-2">
                    <template v-for="(n, index) in steps">
                      <div :key="`${index}-step`"
                        class="custom-step-wrapper tw-flex tw-flex-col tw-items-center tw-cursor-pointer" :class="{
                          active: invoiceSections === index,
                          completed: invoiceSections > index,
                        }" @click="invoiceSections = index">
                        <div class="custom-step-icon tw-flex tw-items-center tw-justify-center">
                          <v-icon v-if="invoiceSections > index">mdi-check-circle</v-icon>
                          <v-icon v-else>{{
                            index === 0
                              ? 'mdi-file-document-edit'
                              : 'mdi-cart-plus'
                          }}</v-icon>
                        </div>
                        <div class="custom-step-label tw-text-center tw-text-sm">
                          {{ n }}
                        </div>
                      </div>

                      <div v-if="index !== steps.length - 1" :key="`divider-${index}`" class="custom-step-divider"
                        :class="{ completed: invoiceSections > index }"></div>
                    </template>
                  </div>
                  <v-divider class="tw-mt-4 tw-mb-2"></v-divider>
                </div>

                <v-stepper-items>
                  <v-stepper-content :step="0" class="tw-overflow-auto" style="max-height: 80vh">
                    <v-form ref="form" v-model="detailsValid" lazy-validation class="row">
                      <v-col cols="12" class="px-0" style="height: fit-content">
                        <v-row>
                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer label="Employer" :mandatory="true">
                              <template v-slot:input>
                                <div class="d-flex align-center">
                                  <v-autocomplete :items="employers" v-model="invoiceObj.customer"
                                    placeholder="Search and select company..." class="proposalDialog_date_field2" solo dense
                                    :disabled="effectiveInvoice" item-text="company_name" item-value="_id"
                                    :loading="loading_employers || previewLoading" :rules="passedInvoice ? [] : main_rule"
                                    @change="debouncedChangeCompany" @click.native="checkEmployersList" style="flex-grow: 1;"
                                    clearable no-data-text="No companies found" :filter="customFilter">
                                    <template v-slot:item="{ item }">
                                      <v-list-item-content>
                                        <v-list-item-title>{{ item.company_name }}</v-list-item-title>
                                      </v-list-item-content>
                                    </template>
                                  </v-autocomplete>
                                  <!-- <v-btn icon small @click.stop="getEmployersList" title="Reload employers list"
                                    :loading="loading_employers" :disabled="effectiveInvoice" class="ml-1">
                                    <v-icon>mdi-refresh</v-icon>
                                  </v-btn> -->
                                </div>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer label="Visa SponsorType" :mandatory="true">
                              <template v-slot:input>
                                <v-select :items="visa_sponsorships" v-model="invoiceObj.visa_sponsor"
                                  placeholder="Current Company" class="proposalDialog_date_field2" solo dense
                                  :disabled="effectiveInvoice" :rules="effectiveInvoice ? [] : main_rule"
                                  append-icon="fa-chevron-down" @change="changeVisaType()">
                                </v-select>
                              </template>
                            </CustomInputContainer>
                          </v-col>
                        </v-row>
                        <v-row v-if="previewLoaded">
                          <v-col cols="3" class="pl-0 py-0">
                            <CustomInputContainer label="Currency" :mandatory="true">
                              <template v-slot:input>
                                <v-select :items="currencyOptions" v-model="invoiceObj.currency"
                                  placeholder="Select Currency" class="proposalDialog_date_field2" solo dense
                                  :rules="main_rule"
                                  append-icon="fa-chevron-down" @change="changeCurrency()">
                                </v-select>
                              </template>
                            </CustomInputContainer>
                          </v-col>
                          <v-col cols="3" class="pl-0 py-0">
                            <CustomInputContainer label="Exchange Rate" :mandatory="true">
                              <template v-slot:input>
                                <v-text-field v-model="invoiceObj.conversion_rate"
                                  placeholder="Exchange Rate" class="proposalDialog_date_field2" solo dense
                                  :rules="main_rule"
                                  type="number" step="0.0001" min="0" @input="updateConversionRate()">
                                  <!-- <template v-slot:append>
                                    <v-tooltip bottom>
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-icon small v-bind="attrs" v-on="on" @click="fetchCurrentExchangeRate()">
                                          mdi-refresh
                                        </v-icon>
                                      </template>
                                      <span>Fetch current exchange rate</span>
                                    </v-tooltip>
                                  </template> -->
                                </v-text-field>
                              </template>
                            </CustomInputContainer>
                          </v-col>
                          <!-- <v-col  cols="6" class="pl-0 py-0">
                              <CustomInputContainer
                                label="Select Employee"
                                :mandatory="true"
                              >
                                <template v-slot:input>
                                  <v-select
                                    :items="computedEmployees"
                                    v-model="invoiceObj.user_id"
                                    class="proposalDialog_date_field2"
                                    solo
                                    dense
                                    item-text="full_name"
                                    item-value="_id"
                                    :rules="main_rule"
                                    :loading="loading_employees"
                                    :disabled="loading_employees"
                                    append-icon="fa-chevron-down"
                                    @change="
                                      changeEmployee(invoiceObj.customer)
                                    "
                                  >
                                  </v-select>
                                </template>
                              </CustomInputContainer>
                            </v-col> -->
                          <!-- <template v-else>
                            <v-col>
                              <div class="tw-text-xl">
                                {{ company?.company_name }}
                              </div>
                            </v-col>
                          </template>
                          <v-col :cols="!passedInvoice ? '6' : '12'">
                            <CustomInputContainer label="Employer Email" :mandatory="true">
                              <template v-slot:input>
                                <v-text-field v-model="invoiceObj.email" placeholder="Enter Email"
                                  class="proposalDialog_date_field2" solo dense :rules="main_rule" />
                              </template>
                            </CustomInputContainer>
                          </v-col> -->
                        </v-row>
                        <v-row>
                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer label="Billing Address" :mandatory="true">
                              <template v-slot:input>
                                <v-textarea v-model="invoiceObj.billing_address"
                                  placeholder="Enter Customer Billing Address" solo class="proposalDialog_date_field2"
                                  dense :rules="main_rule" />
                              </template>
                            </CustomInputContainer>
                          </v-col>
                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer label="Shipping Address" :mandatory="true">
                              <template v-slot:input>
                                <v-textarea v-model="invoiceObj.shipping_address"
                                  placeholder="Enter Customer Shipping Address" solo class="proposalDialog_date_field2"
                                  dense :rules="main_rule" />
                              </template>
                            </CustomInputContainer>
                          </v-col>
                          <v-col cols="12" class="pl-0 py-0">
                            <CustomInputContainer label="Memo">
                              <template v-slot:input>
                                <v-textarea placeholder="Enter Invoice Memo" solo class="proposalDialog_date_field2"
                                  dense v-model="invoiceObj.memo" height="80px" />
                              </template>
                            </CustomInputContainer>
                          </v-col>
                          <v-col cols="12" class="pl-0 py-0">
                            <v-row>
                              <v-col cols="6" class="pl-0 py-0">
                                <CustomInputContainer label="Terms" :mandatory="true">
                                  <template v-slot:label>
                                    <span>Term</span>
                                    <span class="tw-underline tw-text-blue-500" @click="termsDialog = true">
                                      <v-icon small class="mr-1 tw-text-blue-500">mdi-plus</v-icon>
                                      <span>Custom Terms</span>
                                    </span>
                                  </template>
                                  <template v-slot:input>
                                    <v-select :items="termsList" v-model="invoiceObj.terms" placeholder="Terms"
                                      class="proposalDialog_date_field2" solo dense :loading="loading_terms"
                                      item-text="name" item-value="_id" :rules="main_rule" append-icon="fa-chevron-down"
                                      @change="handleTermsUpdate()">
                                    </v-select>
                                  </template>
                                </CustomInputContainer>
                              </v-col>
                              <v-col cols="6" class="pl-0 py-0">
                                <CustomInputContainer label="Invoice Date" :mandatory="true">
                                  <template v-slot:input>
                                    <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                                      transition="scale-transition" offset-y min-width="auto">
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="invoiceObj.invoice_date" placeholder="Enter Date" solo
                                          class="proposalDialog_date_field2" dense readonly v-bind="attrs" v-on="on"
                                          :rules="main_rule">
                                          <template v-slot:append>
                                            <div class="">
                                              <CalenderSvg />
                                            </div>
                                          </template>
                                        </v-text-field>
                                      </template>
                                      <v-date-picker @change="debounceUpdate()" v-model="invoiceObj.invoice_date"
                                        @input="date_menu = false" />
                                    </v-menu>
                                  </template>
                                </CustomInputContainer>
                              </v-col>
                              <v-col cols="6" class="pl-0 py-0">
                                <CustomInputContainer label="Due date">
                                  <template v-slot:input>
                                    <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40"
                                      transition="scale-transition" offset-y min-width="auto">
                                      <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="invoiceObj.due_date" placeholder="Enter Due Date" solo
                                          class="proposalDialog_date_field2" hide-details dense readonly v-bind="attrs"
                                          v-on="on" :rules="main_rule">
                                          <template v-slot:append>
                                            <div class="">
                                              <CalenderSvg />
                                            </div>
                                          </template>
                                        </v-text-field>
                                      </template>
                                      <v-date-picker v-model="invoiceObj.due_date" @input="exp_date_menu = false" />
                                    </v-menu>
                                  </template>
                                </CustomInputContainer>
                              </v-col>
                              <v-col cols="6" class="pl-0 py-0">
                                <CustomInputContainer label="Attach Timesheet(s7)">
                                  <template v-slot:input>
                                    <v-file-input v-model="timesheet" placeholder="Upload Timesheet(s)"
                                      accept=".pdf,.doc,.docx,.xls,.xlsx" outlined dense multiple
                                      @change="handleFileUpload" />
                                  </template>
                                </CustomInputContainer>
                              </v-col>
                            </v-row>
                          </v-col>
                          <v-col cols="12" class="pl-0 py-0">
                            <v-row>
                              <v-col cols="6" class="pl-0 py-0">
                                <CustomInputContainer label="Customer Notes">
                                  <template v-slot:input>
                                    <v-textarea placeholder="Enter Customer Notes" solo
                                      class="proposalDialog_date_field2" dense v-model="invoiceObj.customer_notes"
                                      height="80px" />
                                  </template>
                                </CustomInputContainer>
                              </v-col>
                              <v-col cols="6" class="pl-0 py-0">
                                <CustomInputContainer label="Terms and Condition">
                                  <template v-slot:input>
                                    <v-textarea placeholder="Enter Terms and Condition" solo
                                      class="proposalDialog_date_field2" dense v-model="invoiceObj.terms_condition"
                                      height="80px" />
                                  </template>
                                </CustomInputContainer>
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                      </v-col>

                      <v-col cols="12">
                        <div class="tw-flex tw-justify-end">
                          <v-btn color="primary" :disabled="!detailsValid" @click="nextStep(0)">
                            Continue
                          </v-btn>
                        </div>
                      </v-col>
                    </v-form>
                  </v-stepper-content>
                  <v-stepper-content :step="1" class="tw-overflow-auto" style="max-height: 80vh">
                    <!-- Currency Information Banner -->
                    <v-alert
                      :type="invoiceObj.currency === 'AED' ? 'info' : 'warning'"
                      outlined
                      class="tw-mb-4"
                      dense
                    >
                      <div class="tw-flex tw-items-center tw-justify-between">
                        <div>
                          <strong>Invoice Currency:</strong> {{ invoiceObj.currency }}
                          <span v-if="invoiceObj.currency !== 'AED'">
                            | <strong>Exchange Rate:</strong> {{ invoiceObj.conversion_rate }} (1 {{ invoiceObj.currency }} = {{ invoiceObj.conversion_rate }} AED)
                          </span>
                        </div>
                        <!-- <div v-if="invoiceObj.currency !== 'AED'" class="tw-text-sm tw-text-gray-600">
                          <strong>Note:</strong> All amounts below should be entered in {{ invoiceObj.currency }}
                        </div> -->
                        <div v-if="invoiceObj.currency !== 'AED'" class="tw-text-sm tw-text-gray-600">
                          <strong>Note:</strong> All amounts below should be entered in {{ invoiceObj.currency }}
                        </div>
                      </div>
                    </v-alert>

                    <v-form ref="estimateForm" v-model="valid" lazy-validation class="row">
                      <v-col cols="12">
                        <v-simple-table dense class="dynamic_table">
                          <template v-slot:default>
                            <thead class="dynamic_table_thead">
                              <tr class="" style="height: 35px !important">
                                <th class="text-center text--text font-weight-bold" style="
                                    font-size: 12px;
                                    font-weight: 500;
                                    width: 5%;
                                  ">
                                  #
                                </th>
                                <th v-for="item in table_headers" :key="item"
                                  class="text-center text--text font-weight-bold" style="
                                    font-size: 12px !important;
                                    font-weight: 500 !important;
                                  ">
                                  {{ item }}
                                </th>
                              </tr>
                            </thead>
                            <tbody class="dynamic_table_tbody"
                              v-for="(item, index) in (Array.isArray(invoiceObj.items) ? invoiceObj.items : [])"
                              :key="index">
                              <tr class="dynamic_table_body_rows" style="border-bottom: 0.5 solid red !important">
                                <td class="py-2 text-center" style="width: 5%">
                                  {{ index + 1 }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-autocomplete class="rounded-lg" placeholder="Enter Service" solo flat hide-details
                                  dense v-model="item.service_name" :items="productsAndServices" clearable
                                  :loading="isLoading" return-object no-filter @change="handleServiceSelection"
                                  :error-messages="errors" item-text="name" item-value="name" autocomplete="off">
                                  <template v-slot:no-data>
                                    <v-list-item>
                                      <v-list-item-content>
                                        <v-list-item-title>
                                          No services found
                                        </v-list-item-title>
                                      </v-list-item-content>
                                    </v-list-item>
                                  </template>
          </v-autocomplete> -->
                                  {{ item.service_name }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-text-field class="rounded-lg" placeholder="Enter Description" solo flat
                                  hide-details dense v-model="item.description" /> -->
                                  {{ item.description }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-text-field class="rounded-lg" type="number" placeholder="0.00" solo flat
                                  hide-details dense v-model="item.rate"
                                  @input="assignAmountValue(item.rate, index)" /> -->
                                  {{ item.rate | currencyFormatter(invoiceObj.currency || 'AED') }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-text-field class="rounded-lg" type="number" placeholder="0.00" solo flat
                                  hide-details dense disabled v-model="item.amount" /> -->
                                  {{ item.amount | currencyFormatter(invoiceObj.currency || 'AED') }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-text-field class="rounded-lg" type="number" placeholder="0.00" solo flat
                                  hide-details dense disabled v-model="item.amount" /> -->
                                  {{ item.quantity }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-select class="rounded-lg" :items="taxCodesList" placeholder="Select Tax Codes" solo
                                  flat hide-details item-text="code" item-value="_id" dense
                                  append-icon="fa-chevron-down" v-model="item.tax_code"
                                  @change="getTaxRate(item.tax_code, index)" /> -->
                                  {{ item.tax_name }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-text-field class="rounded-lg" disabled type="number" placeholder="0.00" solo flat
                                  hide-details dense v-model="item.vat_rate" /> -->
                                  {{ item.vat_rate }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-text-field class="rounded-lg" type="number" placeholder="0.00" solo flat
                                  hide-details dense disabled v-model="item?.vat_amount ?? 0.0" /> -->
                                  {{
                                    item?.vat_amount ?? 0.0 | currencyFormatter(invoiceObj.currency || 'AED')
                                  }}
                                </td>
                                <td class="py-2 text-center">
                                  <!-- <v-text-field class="rounded-lg text-center" type="number" placeholder="0.00" solo
                                  flat hide-details dense disabled v-model="item?.net_total ?? 0.0" /> -->
                                  {{
                                    item?.net_total ?? 0.0 | currencyFormatter(invoiceObj.currency || 'AED')
                                  }}
                                </td>
                                <td class="py-2 text-center">
                                  <div class="tw-flex tw-gap-5 tw-items-center">
                                    <v-btn icon color="error" class="mx-3 text-center"
                                      @click="handleDeleteProduct(index)">
                                      <v-icon class="" color="error" x-small>fa-light fa-trash-can</v-icon>
                                    </v-btn>

                                    <v-btn icon color="error" class="mx-3 text-center"
                                      @click="openAddInvoiceDialog(true, index)">
                                      <v-icon class="" color="primary" x-small>mdi-tag-edit</v-icon>
                                    </v-btn>
                                  </div>
                                </td>
                              </tr>
                              <!-- <tr :key="`spacer-${index}`" class="spacer-row" @click="openAddInvoiceDialog(index)"
                                style="height: 10px; cursor: pointer;">
                                <td colspan="100%" class="hover-area"></td>
                              </tr> -->
                            </tbody>
                          </template>
                        </v-simple-table>
                      </v-col>
                      <v-col cols="12">
                        <div class="d-flex justify-space-between align-start">
                          <v-btn @click="openAddInvoiceDialog()" class="small__btn" outlined color="subtext">
                            <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
                            <span class="text--text">Add Item</span>
                          </v-btn>
                          <div class="estimate__container">
                            <div class="flex_column">
                              <span class="text--text font-weight-bold pb-2">Sub Total</span>
                              <span class="text--text font-weight-bold pb-2">Discount</span>
                              <span class="text--text font-weight-bold pb-2">VAT Amount</span>
                              <span class="text--text font-weight-bold">Total</span>
                              <span v-if="invoiceObj.currency !== 'AED'" class="text--text font-weight-bold tw-text-sm tw-text-gray-600">AED Equivalent</span>
                            </div>
                            <div class="flex_column">
                              <span class="text--text font-weight-bold mb-2">{{ invoiceObj.currency }} {{ computedSubTotal | twoDecimals }}</span>
                              <span class="text--text font-weight-bold mb-2">{{ invoiceObj.currency }} {{ computedDiscount | twoDecimals }}</span>
                              <span class="text--text font-weight-bold mb-2">{{ invoiceObj.currency }} {{ computedVATAmount | twoDecimals }}</span>
                              <span class="text--text font-weight-bold">{{ invoiceObj.currency }} {{ computedTotal | twoDecimals }}</span>
                              <span v-if="invoiceObj.currency !== 'AED'" class="text--text font-weight-bold tw-text-sm tw-text-gray-600">AED {{ convertedAmountAED | twoDecimals }}</span>
                            </div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="12">
                        <div class="tw-flex tw-justify-end tw-gap-3">
                          <v-btn text @click="goBack()"> back </v-btn>
                          <v-btn v-if="!effectiveInvoice" color="primary" outlined @click="closeDialog()">
                            Save as Draft
                          </v-btn>

                          <v-btn color="primary" :loading="submitLoading" :disabled="submitLoading || !(Array.isArray(invoiceObj.items) && invoiceObj.items.length)
                            " @click="createInvoice">
                            {{
                              effectiveInvoice
                                ? 'Update Invoice'
                                : 'Create Invoice'
                            }}
                          </v-btn>
                        </div>
                      </v-col>
                    </v-form>
                  </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </v-col>
            <v-col cols="6">
              <v-card class="preview-card d-flex flex-column fill-height" elevation="2" rounded="lg"
                :style="previewCardStyle">
                <v-card-title class="preview-header px-4 py-3" :style="previewHeaderStyle">
                  <v-img src="/header/invoice.svg" max-width="20" height="20" contain class="mr-3"
                    style="filter: brightness(0) invert(1);" />
                  <span class="font-weight-medium text-subtitle-1" style="color: white;">Invoice Preview</span>
                </v-card-title>
                <v-divider />

                <v-card-text class="preview-container flex-grow-1 pa-0" :style="previewContainerStyle">
                  <!-- Shimmer animation bar -->
                  <div :style="shimmerBarStyle"></div>

                  <div class="preview-wrapper" :style="previewWrapperStyle">
                    <template v-if="invoice && invoice._id">
                      <InvoicePreview :key="invoice?.updatedAt" :invoice_id="invoice._id" :user-id="invoice?.user_id" />
                    </template>
                    <div v-else-if="previewLoading" class="preview-loading"
                      style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; min-height: 400px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); text-align: center; border: 2px dashed #007bff; border-radius: 8px; margin: 16px;">
                      <v-progress-circular indeterminate color="primary" size="48" class="mb-4"></v-progress-circular>
                      <p class="text-h6 mt-2 primary--text font-weight-medium" style="margin: 8px 0;">Generating Preview...</p>
                      <p class="text-body-2 grey--text" style="margin: 8px 0; opacity: 0.8;">Please wait while we prepare your invoice preview</p>
                    </div>
                    <div v-else class="preview-placeholder"
                      style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; min-height: 400px; background: radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%); text-align: center; border: 2px dashed #dee2e6; border-radius: 8px; margin: 16px;">
                      <v-icon size="64" color="grey lighten-2" style="opacity: 0.5;">mdi-file-document-outline</v-icon>
                      <p class="text-h6 mt-4 tw-text-gray-500 font-weight-medium" style="margin: 8px 0; opacity: 0.8;">Invoice Preview</p>
                      <p class="text-body-1 tw-text-gray-500" style="margin: 8px 0; opacity: 0.7;">Select an employer to generate your invoice preview</p>
                      <p class="text-caption tw-text-gray-500" style="margin: 8px 0; opacity: 0.6;">Complete the invoice details to see a live preview of your document</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-dialog v-model="confirmDialog" max-width="400">
          <v-card>
            <v-card-title class="headline">Confirm Upload</v-card-title>
            <v-card-text>
              Are you sure you want to upload this file?
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary darken-1" text @click="confirmUpload">Yes</v-btn>
              <v-btn color="red darken-1" text @click="confirmDialog = false">No</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <SnackBar :data="snackbar_data" />
      </v-card>
    </v-dialog>

    <!-- add product dialog -->
    <v-dialog v-model="add_product.show" max-width="700px" persistent>
      <v-card class="rounded-xl pa-0 pt-0" flat min-height="400">
        <v-form ref="invoiceForm" v-model="validProduct" lazy-validation>
          <v-row class="tw-py-3 tx-pr-3">
            <v-card-title class="py-0">
              <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
              <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
                Add New Invoice Product</span>
            </v-card-title>
            <v-spacer />
            <v-btn @click="closeInvoiceProductDialog" outlined icon color="red accent-4">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="tw-px-6 tw-py-10">
            <v-row>
              <v-col cols="12">
                <CustomInputContainer label="Select Service" :mandatory="true">
                  <div slot="input">
                    <v-select class="rounded-lg" placeholder="Enter Service" outlined hide-details dense
                      v-model="invoiceProduct.service_name" :rules="main_rule" :items="computedServices"
                      :loading="isLoading" solo autocomplete="off" @click="handleServiceDropdownClick">
                      <template v-slot:no-data>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title v-if="isLoading">
                              Loading services...
                            </v-list-item-title>
                            <v-list-item-title v-else>
                              No services found
                            </v-list-item-title>
                            <v-list-item-subtitle v-if="!isLoading && computedServices.length === 0">
                              Try refreshing the form
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                      </template>
                    </v-select>
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col cols="6" v-if="!add_product.update">
                <CustomInputContainer label="Select Employee" :mandatory="true">
                  <template v-slot:input>
                    <v-select :items="computedEmployees" v-model="selected_employees" class="proposalDialog_date_field2"
                      solo dense item-text="full_name" item-value="_id" :rules="main_rule" :loading="loading_employees"
                      :disabled="loading_employees" @input="prefillDescription()" append-icon="fa-chevron-down"
                      :multiple="!add_product.update">
                    </v-select>
                  </template>
                </CustomInputContainer>
              </v-col>

              <v-col cols="6">
                <CustomInputContainer label="Enter Rate" :mandatory="true">
                  <div slot="input">
                    <v-text-field class="rounded-lg" type="number" placeholder="0.00" outlined hide-details dense
                      v-model="invoiceProduct.rate" :rules="numberRules"
                      @input="assignAmountValue(invoiceProduct.rate)" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Quantity" :mandatory="true">
                  <div slot="input">
                    <v-text-field class="rounded-lg" type="number" outlined hide-details dense
                      v-model="invoiceProduct.quantity" :rules="numberRules" @input="calculateAmount()" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Invoice Amount" :mandatory="false">
                  <div slot="input">
                    <v-text-field class="rounded-lg" :rules="numberRules" type="number" placeholder="0.00" outlined
                      label="Invoice Amount" hide-details dense disabled v-model="invoiceProduct.amount" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Select Tax Code" :mandatory="true">
                  <div slot="input">
                    <v-select class="rounded-lg" :rules="main_rule" :items="taxCodesList" placeholder="Select Tax Codes"
                      outlined hide-details item-text="code" item-value="_id" dense append-icon="fa-chevron-down"
                      v-model="invoiceProduct.tax_code" @change="getTaxRate(invoiceProduct.tax_code)" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="VAT Rate %" :mandatory="true">
                  <div slot="input">
                    <v-text-field class="rounded-lg" :rules="numberRules" disabled type="number" placeholder="0.00"
                      outlined hide-details dense v-model="invoiceProduct.vat_rate" />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col cols="6">
                <CustomInputContainer label="Vat Total" :mandatory="true">
                  <div slot="input">
                    <v-text-field class="rounded-lg" :rules="numberRules" type="number" placeholder="0.00" outlined
                      hide-details dense disabled v-model="invoiceProduct.vat_amount" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Net Total" :mandatory="true">
                  <div slot="input">
                    <v-text-field class="rounded-lg text-center" type="number" placeholder="0.00" outlined hide-details
                      dense disabled :rules="numberRules" v-model="invoiceProduct.net_total" />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" v-if="add_product.update || selected_employees.length < 2">
                <CustomInputContainer label="Description" :mandatory="true">
                  <div slot="input">
                    <v-textarea v-model="invoiceProduct.description" :rules="main_rule" dense outlined
                      required></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeInvoiceProductDialog">
              Close
            </v-btn>
            <v-btn color="primary" outlined @click="handleAddProductAt">
              {{ !add_product.update ? 'Save' : 'Save Changes' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- add product dialog -->
    <v-dialog v-model="product_delete_confirmation" max-width="700px" persistent>
      <v-card class="rounded-xl pa-0 pt-0" flat min-height="400">
        <v-form>
          <v-row>
            <v-col cols="6" sm="6" class="pb-2">
              <v-card-title class="py-0">
                <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
                  Confirm Operation</span>
              </v-card-title>
            </v-col>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="tw-px-6 tw-py-10">
            <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center" style="min-height:120px;">
              <v-icon color="warning" size="40" class="tw-mb-4">mdi-alert-circle-outline</v-icon>
              <div class="tw-text-lg tw-font-semibold tw-mb-2">Are you sure you want to delete this product?</div>
              <div class="tw-text-gray-500 tw-text-sm">This action cannot be undone.</div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="product_delete_confirmation = false">
              Close
            </v-btn>
            <v-btn color="error" outlined @click="deleteProduct">
              Delete Product
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- terms dialog -->
    <DialogsAddCustomTerms v-if="termsDialog" :open="termsDialog" @reload="reloadTerms()"
      @close="termsDialog = false" />
  </div>
</template>
<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import PreviewDocument from '@/components/utils/PreviewDocument.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import moment from 'moment'
import PreviewInvoiceDocument from '@/components/invoice/InvoiceEditor.vue'
import InvoicePreview from '@/components/ProcessFlow/ActionPreview/InvoicePreview.vue'

export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    SnackBar,
    PreviewDocument,
    CalenderSvg,
    InvoicePreview,
  },
  props: {
    show: Boolean,
    passedInvoice: {
      type: Object,
      default: () => { }
    },
    invoiceToEdit: {
      type: Object,
      default: () => { }
    },
    company: Object,
    visa_sponsor: {
      type: String,
      default: 'Dynamic Employment Services'
    }
  },
  computed: {
    // Add a computed property that checks for invoiceToEdit first, then passedInvoice
    effectiveInvoice() {
      const invoice = this.invoiceToEdit || {};
      const passed = this.passedInvoice || {};

      return Object.keys(invoice).length > 0 || Object.keys(passed).length > 0;
    },
    computedEmployees() {
      return this.employees.map((el) => {
        return {
          _id: el?._id,
          full_name: `${el?.first_name} ${el?.last_name}`,
          email: el?.email,
          salary: el?.salary,
        }
      })
    },
    isOutsourcingService() {
      const name = this.invoiceProduct?.service_name?.toLowerCase() || ''
      if (this.effectiveInvoice) {
        return false
      }
      return (
        name.includes('monthly outsourcing') ||
        name.includes('employee outsourcing')
      )
    },
    numberRules() {
      return [
        (value) => {
          if (value === '') return 'This field is required'
          const num = Number(value)
          return !isNaN(num) && num >= 0
            ? true
            : 'Only numbers 0 or higher are allowed'
        },
      ]
    },
    computedServices() {
      if (!this.productsAndServices || !Array.isArray(this.productsAndServices)) {
        console.warn('productsAndServices is not properly initialized:', this.productsAndServices);
        return [];
      }

      const services = this.productsAndServices.map(service => {
        if (!service || !service.name) {
          console.warn('Invalid service object in productsAndServices:', service);
          return null;
        }
        return service.name;
      }).filter(Boolean); // Remove null values

      console.log(`Computed ${services.length} services for dropdown`);
      return services;
    },
    computedSubTotal() {
      let total = 0
      if (this.invoiceObj && Array.isArray(this.invoiceObj.items) && this.invoiceObj.items.length) {
        for (let i = 0; i < this.invoiceObj.items.length; i++) {
          const item = this.invoiceObj.items[i]
          const amount = parseFloat(item.amount)

          if (!isNaN(amount)) {
            total += amount
          }
        }
      }
      return total
    },
    computedDiscount() {
      let total = 0
      if (this.invoiceObj && Array.isArray(this.invoiceObj.items) && this.invoiceObj.items.length) {
        for (let i = 0; i < this.invoiceObj.items.length; i++) {
          const item = this.invoiceObj.items[i]
          const amount = parseFloat(item.discount)

          if (!isNaN(amount)) {
            total += amount
          }
        }
      }
      return total
    },
    computedVATAmount() {
      let total = 0
      if (this.invoiceObj && Array.isArray(this.invoiceObj.items) && this.invoiceObj.items.length) {
        for (let i = 0; i < this.invoiceObj.items.length; i++) {
          const item = this.invoiceObj.items[i]
          const amount = parseFloat(item.vat_amount)

          if (!isNaN(amount)) {
            total += amount
          }
        }
      }
      return total
    },
    computedTotal() {
      return (
        this.computedSubTotal + this.computedDiscount + this.computedVATAmount
      )
    },
    convertedAmountAED() {
      // Calculate AED equivalent based on current total and exchange rate
      if (this.invoiceObj.currency === 'AED') {
        return this.computedTotal;
      }
      return this.computedTotal * (this.invoiceObj.conversion_rate || 1.0);
    },
    // Enhanced Preview Styling - Vue Style Bindings
    previewCardStyle() {
      return {
        'min-height': '85vh',
        'background': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'border-radius': '12px',
        'overflow': 'hidden',
        'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'transition': 'all 0.3s ease',
        'transform': 'translateZ(0)', // Force hardware acceleration
      }
    },
    previewHeaderStyle() {
      return {
        'background': 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        'color': 'white',
        'border-bottom': '1px solid rgba(255, 255, 255, 0.1)',
      }
    },
    previewContainerStyle() {
      return {
        'background': 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        'position': 'relative',
        'overflow': 'hidden',
        'flex-grow': '1',
        'padding': '0',
      }
    },
    shimmerBarStyle() {
      return {
        'position': 'absolute',
        'top': '0',
        'left': '0',
        'right': '0',
        'height': '3px',
        'background': 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
        'background-size': '200% 100%',
        'animation': 'shimmer 3s ease-in-out infinite',
        'z-index': '1',
      }
    },
    previewWrapperStyle() {
      return {
        'height': '100%',
        'min-height': '75vh',
        'border-radius': '8px',
        'overflow': 'hidden',
        'position': 'relative',
        'background': 'white',
        'margin': '16px',
        'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'border': '1px solid #e1e8ed',
        'z-index': '2',
      }
    },
  },
  data() {
    return {
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      main_rule: [(v) => !!v || 'This field is required'],
      valid: true,
      validProduct: false,
      add_product: {
        show: false,
        update: false,
        index: null,
      },
      termsDialog: false,
      selected_employees: [],
      first_load: true,
      product_delete_confirmation: false,
      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      detailsValid: false,
      timesheet: null,
      timesheet_url: null,
      confirmDialog: false,
      productsAndServices: [],
      isLoading: false,
      errors: [],
      exp_date: new Date().toISOString().substr(0, 10),
      table_headers: [
        'Product/Service',
        'Description',
        'Rate',
        'Amount',
        'Quantity',
        'Tax Code',
        'VAT Rate %',
        'VAT Amount',
        'NET Total',
        'Actions',
      ],
      limit: '10',
      page: 0,
      employers: [],
      termsList: [],
      termsDays: '',
      taxCodesList: [],
      taxRate: 0,
      blankProduct: {
        id: '',
        service: '',
        service_name: '',
        description: '',
        quantity: 1,
        rate: '',
        amount: '',
        discount: 0,
        tax_name: '',
        tax_code: '',
        vat_rate: '',
        vat_amount: '',
        net_total: '',
        type: 'Service',
        date: new Date().toISOString().substr(0, 10),
        isInventory: 'false',
        city: 'Dubai',
      },
      invoiceProduct: {
        id: '',
        service: '',
        service_name: '',
        description: '',
        quantity: 1,
        rate: '',
        amount: '',
        discount: 0,
        tax_name: '',
        tax_code: '',
        vat_rate: '',
        vat_amount: '',
        net_total: '',
        type: 'Service',
        date: new Date().toISOString().substr(0, 10),
        isInventory: 'false',
        city: 'Dubai',
      },
      visa_sponsorships: [
        'Executive Employment Services',
        'Dynamic Employment Services',
      ],
      currencyOptions: [
        'AED',
        'USD',
        'EUR'
      ],
      invoiceObj: {
        customer: '',
        customer_name: '',
        customer_address: ' ',
        email: '',
        billing_address: '',
        shipping_address: '',
        terms: '',
        terms_name: '',
        memo: '',
        invoice_date: new Date().toISOString().substr(0, 10),
        due_date: '',
        sale_location: '',
        type: 'general invoice',
        currency: 'AED', // Default to AED
        conversion_rate: 1.0, // Default exchange rate for AED
        base_currency: 'AED', // Always AED as base currency
        converted_amount_aed: 0, // Amount converted to AED for reporting
        items: [],
        sub_total: 0,
        vat_total: 0,
        discount: 0,
        total: 0,
        customer_notes: '',
        source: false,
        terms_condition: '',
        is_recurring: false,
        is_draft: true,
        visa_sponsor: this.visa_sponsor || 'Dynamic Employment Services',
        balance_due: 0,
        // user_id: '',
      },
      submitLoading: false,
      // setting up invoice
      invoice: null,
      replacedContent: {
        sections: [
          {
            blocks: [
              {
                inlines: [
                  {
                    characterFormat: {
                      bold: true,
                      italic: true,
                    },
                    text: '',
                  },
                ],
              },
            ],
            headersFooters: {},
          },
        ],
      },
      steps: ['Invoice Details', 'Add Items'],
      invoiceSections: 0,
      product_to_delete: null,
      invoice_download_url: '',
      loading_download_url: false,
      employees: [],
      loading_employees: false,
      loading_employers: false,
      should_select_employee: false,
      loading_terms: false,
      previewLoading: false,
      previewLoaded: false,
      changeCompanyTimeout: null,
    }
  },
  beforeDestroy() {
    // Clean up timeout to prevent memory leaks
    if (this.changeCompanyTimeout) {
      clearTimeout(this.changeCompanyTimeout)
    }
  },
  watch: {
    // 'invoiceObj.customer'(new_customer, old_customer) {
    //   if (new_customer && new_customer !== old_customer) {
    //     this.getOrCreateInvoice()
    //   }
    // },
    invoice(val) {
      // update local  invoiceObj
      if (val) {
        this.$set(this, 'invoiceObj', { source: true, ...this.invoice })
        // format dates
        this.invoiceObj.due_date = this.formatDate(this.invoice?.due_date)
        this.invoiceObj.invoice_date = this.formatDate(
          this.invoice?.invoice_date
        )
        console.log('completed update: -----')
      }
    },
    'invoiceObj.items': {
      handler(new_items, old_items) {
        console.log('items have changed')
        this.updateInvoiceTotals()
        if (!this.invoiceObj?.source && !this.first_load) {
          this.debounceUpdate()
        }
      },
      deep: true,
    },
    'invoiceObj.billing_address'(new_billing_address, old_billing_address) {
      if (new_billing_address !== old_billing_address) {
        console.log('detected address change')
        if (!this.invoiceObj?.source && !this.first_load) {
          console.log('calling update, deteccted address change')

          //  this.updateInvoiceTotals()
          this.debounceUpdate()
        }
      }
    },
    steps(val) {
      if (this.invoiceSections > val) {
        this.invoiceSections = val
      }
    },
    'invoiceProduct.service_name'(newService, oldService) {
      console.log('Service name changed from:', oldService, 'to:', newService)
      if (newService && newService !== oldService && !this.add_product.update) {
        // Handle switching between Admin Fee and Employee service
        const oldServiceLower = oldService?.toLowerCase() || ''
        const newServiceLower = newService?.toLowerCase() || ''

        // When switching from Admin Fee to another service, reset the rate
        if (oldServiceLower === 'admin fee' && newServiceLower !== 'admin fee') {
          console.log('🔥 Switching from Admin Fee to another service, resetting rate')
          this.invoiceProduct.rate = 0
        }

        // When switching to Admin Fee, clear any selected employees
        if (newServiceLower === 'admin fee' && this.selected_employees.length > 0) {
          console.log('🔥 Switching to Admin Fee, clearing selected employees')
          this.selected_employees = []
        }

        // Update should_select_employee flag for UI
        this.changeProductType()

        // Set the appropriate rate based on the new service
        this.setAdminFee()
      }
    },
    selected_employees(newEmployeeIds, oldEmployeeIds) {
      console.log('🔥 Selected employees changed:', newEmployeeIds)

      if (!this.add_product.update){
       // Handle removing employees - find which employee was unselected
      if (oldEmployeeIds && oldEmployeeIds.length > newEmployeeIds.length) {
        console.log('🔥 Employee unselected - calculating salary deduction')

        // Find which employee was unselected
        const removedEmployeeIds = oldEmployeeIds.filter(id => !newEmployeeIds.includes(id))
        console.log('🔥 Removed employees:', removedEmployeeIds)

        // Calculate the total salary to deduct
        let salaryToDeduct = 0
        for (const removedId of removedEmployeeIds) {
          const employee = this.employees.find(emp => emp._id === removedId)
          if (employee && employee.salary) {
            const totalFixed = employee.salary.total_fixed
            let employeeRate = 0

            if (typeof totalFixed === 'string') {
              employeeRate = parseFloat(totalFixed) || 0
            } else if (typeof totalFixed === 'number') {
              employeeRate = totalFixed
            }

            salaryToDeduct += employeeRate
            console.log(`🔥 Deducting salary ${employeeRate} for employee ${employee.first_name} ${employee.last_name}`)
          }
        }

        // Handle case when all employees are unselected
        if (newEmployeeIds.length === 0) {
          console.log('🔥 All employees have been unselected')

          // Reset the rate to 0
          this.invoiceProduct.rate = 0

          // Clear the description or set it to a default value
          this.invoiceProduct.description = ''

          // Check if we should revert back to Admin Fee service
          const adminFeeService = this.productsAndServices.find(
            service => service.name.toLowerCase() === 'admin fee'
          )

          if (adminFeeService) {
            console.log('🔥 Switching back to Admin Fee service since no employees are selected')
            this.invoiceProduct.service_name = adminFeeService.name
            this.invoiceProduct.service = adminFeeService.name
            // Let the service_name watcher trigger setAdminFee if needed
          }

          // Recalculate all amounts with zero rate
          this.assignAmountValue(0)
          console.log('🔥 Reset calculations after all employees removed - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
        }
        // Only adjust rate if there are still employees selected
        else if (newEmployeeIds.length > 0) {
          // Deduct the salary from the current rate
          const newRate = Math.max(0, this.invoiceProduct.rate - salaryToDeduct)
          console.log(`🔥 Adjusting rate: ${this.invoiceProduct.rate} - ${salaryToDeduct} = ${newRate}`)
          this.invoiceProduct.rate = newRate

          // Update description if needed
          if (newEmployeeIds.length > 1) {
            const dateStr = new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
            this.invoiceProduct.description = `${newEmployeeIds.length} Employees - ${dateStr}`
          } else if (newEmployeeIds.length === 1) {
            // If only one employee left, update the description with their name
            const employee = this.employees.find(emp => emp._id === newEmployeeIds[0])
            if (employee) {
              const dateStr = new Date().toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
              this.invoiceProduct.description = `${employee.first_name} ${employee.last_name} - ${dateStr}`
            }
          }

          // Recalculate amounts
          this.assignAmountValue(this.invoiceProduct.rate)
          console.log('🔥 Employee removed rate calculations triggered - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
        }
      }

      // Handle regular selection process
      if (newEmployeeIds && newEmployeeIds.length > 0) {
        // Get the current service name
        const serviceName = this.invoiceProduct.service_name?.toLowerCase() || ''

        // If "Admin Fee" is selected and employees are selected, we should
        // clear the Admin Fee rate and set to employee salaries instead
        if (serviceName === 'admin fee') {
          console.log('🔥 Service is Admin Fee but employees were selected - switching from Admin Fee to Employee rate')

          // Update the service name to "Employee" if it exists in productsAndServices
          const employeeService = this.productsAndServices.find(
            service => service.name.toLowerCase() === 'employee'
          )

          if (employeeService) {
            console.log('🔥 Found Employee service, switching to it')
            this.invoiceProduct.service_name = employeeService.name
            this.invoiceProduct.service = employeeService.name
          }
        }

        // Get all selected employees and sum their salaries
        let totalEmployeeRate = 0
        const selectedEmployees = []

        // Loop through each selected employee ID
        for (const employeeId of newEmployeeIds) {
          const employee = this.employees.find(emp => emp._id === employeeId)

          if (employee && employee.salary) {
            // Convert salary.total_fixed to number, ensuring decimals are preserved
            const totalFixed = employee.salary.total_fixed
            let employeeRate = 0

            if (typeof totalFixed === 'string') {
              employeeRate = parseFloat(totalFixed) || 0
            } else if (typeof totalFixed === 'number') {
              employeeRate = totalFixed
            }

            // Add to running total
            totalEmployeeRate += employeeRate

            // Add employee to the list for logging
            selectedEmployees.push({
              id: employee._id,
              name: `${employee.first_name} ${employee.last_name}`,
              salary: employeeRate
            })
          } else {
            console.log(`🔥 Employee ${employeeId} has no salary data or was not found`)
          }
        }

        console.log('🔥 Setting employee rate from combined salaries:', {
          employeeCount: newEmployeeIds.length,
          selectedEmployees,
          serviceName: this.invoiceProduct.service_name,
          totalRate: totalEmployeeRate
        })

        // Set the rate to the total of all selected employees
        this.invoiceProduct.rate = totalEmployeeRate

        // Set description to indicate multiple employees if more than one
        if (newEmployeeIds.length > 1) {
          const dateStr = new Date().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })
          this.invoiceProduct.description = `${newEmployeeIds.length} Employees - ${dateStr}`
        } else if (newEmployeeIds.length === 1) {
          // For a single employee, use their name in the description
          const employee = this.employees.find(emp => emp._id === newEmployeeIds[0])
          if (employee) {
            const dateStr = new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
            this.invoiceProduct.description = `${employee.first_name} ${employee.last_name} - ${dateStr}`
          }
        }

        // Trigger the same calculation chain as manual rate entry and admin fee
        this.assignAmountValue(totalEmployeeRate)

        console.log('🔥 Multiple employee rate calculations triggered - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
      } else {
        console.log('🔥 No employees selected, rate unchanged')
      }
     }
    },
    // --- ADDED: Watch rate to recalculate VAT/amount/net total ---
    'invoiceProduct.rate'(newRate, oldRate) {
      console.log('🔍 Rate changed from:', oldRate, 'to:', newRate)
      // Recalculate amounts for both edit mode and new items
      this.assignAmountValue(newRate);
    },
    // --- ADDED: Watch quantity to recalculate VAT/amount/net total ---
    'invoiceProduct.quantity'(newQuantity, oldQuantity) {
      console.log('🔍 Quantity changed from:', oldQuantity, 'to:', newQuantity)
      // Recalculate amounts when quantity changes
      this.assignAmountValue(this.invoiceProduct.rate);
    },
    // --- ADDED: Watch tax_code to ensure VAT is recalculated when tax code changes ---
    'invoiceProduct.tax_code'(newTaxCode, oldTaxCode) {
      console.log('🔍 Tax code changed from:', oldTaxCode, 'to:', newTaxCode)
      if (newTaxCode && newTaxCode !== oldTaxCode) {
        // Recalculate VAT when tax code changes
        this.getTaxRate(newTaxCode)
      }
    },
  },
  async mounted() {
    await this.getTermsList();
    console.log('generalInvoiceDialog mounted - starting initialization')
    // Ensure invoiceObj.items is always initialized as an array
    if (!this.invoiceObj.items) {
      this.invoiceObj.items = [];
    }

    // Use the effectiveInvoice computed property instead of passedInvoice directly
    if (this.effectiveInvoice) {
      // init client
      console.log('should setup client', this.invoiceToEdit)
      this.employers = [
        {
          company_name: this.invoiceToEdit?.customer_name,
          _id: this.invoiceToEdit?.customer,
          email: this.invoiceToEdit?.email,
        },
      ]
      this.invoice = this.invoiceToEdit

      // this.setupClientAddress(this.company)
      await this.initPreview()
      await this.getEmployeesList()

      // --- Ensure terms and terms_name are populated when editing ---
      if (this.invoiceObj.terms) {
        // Find the matching term from termsList
        // console.log(this.termsList, "the terms list is this", this.invoiceObj.terms, "is what we are looking for now")
        const termObj = this.termsList.find(term => term._id === this.invoiceObj.terms || term.id === this.invoiceObj.terms)
        if (termObj) {
          // console.log("found the tem", termObj)
          this.invoiceObj.terms_name = termObj.name || termObj.terms_name || ''
          this.termsDays = termObj.days || ''
        }
        // Recalculate dependent fields (due date, totals, etc.)
        this.getTermsName(this.invoiceObj.terms)
        this.updateInvoiceTotals()
      }
    } else {
      console.log('No effectiveInvoice, fetching employers list')
      await this.getEmployersList()
      console.log('After getEmployersList call, employers array has', this.employers.length, 'items')
    }

    // await this.getTermsList()
    await this.getTaxCodeList()
    await this.fetchProducts()

    this.debounceUpdate = _.debounce(this.updateInvoice, 500)

    // Final verification of employers
    this.$nextTick(() => {
      console.log('After component mounted and nextTick:')
      console.log('- Employers array has', this.employers.length, 'items')
      console.log('- First few employers:', this.employers.slice(0, 3).map(e => e.company_name))
      console.log('- v-select items binding is working:', !!this.$el.querySelector('v-select') && this.$el.querySelector('v-select').items && this.$el.querySelector('v-select').items.length > 0)
    })
  },
  methods: {
    setAdminFee() {
      console.log('🔥 setAdminFee called with service:', this.invoiceProduct.service_name)
      console.log('🔥 Current customer:', this.invoiceObj.customer)
      console.log('🔥 Current visa sponsor:', this.invoiceObj.visa_sponsor)
      console.log('🔥 Selected employees:', this.selected_employees)

    if(!this.add_product.update) {
        if (!this.invoiceProduct.service_name) {
        console.log('🔥 No service name selected, exiting')
        return
      }

      const serviceName = this.invoiceProduct.service_name.toLowerCase()

      // If employees are selected, always prioritize using employee salary
      if (this.selected_employees && this.selected_employees.length > 0) {
        console.log('🔥 Employees are selected - will use employee salary instead of admin fee')
        // The rate will be set by the selected_employees watcher instead
        return
      }

      // Reset rate to 0 for employee service OR any non-admin fee service
      if (serviceName === 'employee' || (serviceName !== 'admin fee' && this.invoiceProduct.rate > 0)) {
        console.log('🔥 Non-admin fee service selected, clearing rate')
        this.invoiceProduct.rate = 0
        // Trigger the same calculation chain as manual input
        this.assignAmountValue(0)
        return
      }

      // Only process admin fee service
      if (serviceName === 'admin fee') {
        console.log("🔥 Processing admin fee service")

        // Get current employer from employers array
        const currentEmployer = this.employers.find(
          (employer) => employer._id === this.invoiceObj.customer
        )

        console.log('🔥 Found employer:', currentEmployer)

        if (!currentEmployer) {
          console.warn('🔥 No employer found for customer:', this.invoiceObj.customer)
          this.invoiceProduct.rate = 500 // fallback to default
          // Trigger calculations with fallback rate
          this.assignAmountValue(500)
          return
        }

        // Check visa sponsor type to determine which cost field to use
        const visaSponsor = this.invoiceObj.visa_sponsor
        let adminFeeRate = 500 // default fallback

        if (visaSponsor === 'Dynamic Employment Services') {
          // Use chargeableMonthlyCostDEES for Dynamic Employment Services
          adminFeeRate = currentEmployer.chargeableMonthlyCostDEES || 500
          console.log('🔥 Using DEES rate:', adminFeeRate)
        } else {
          // Use chargeableMonthlyCostEES for other visa sponsors
          adminFeeRate = currentEmployer.chargeableMonthlyCostEES || 500
          console.log('🔥 Using EES rate:', adminFeeRate)
        }

        console.log('🔥 Setting admin fee rate:', {
          visaSponsor,
          employerName: currentEmployer.company_name,
          rate: adminFeeRate,
          costDEES: currentEmployer.chargeableMonthlyCostDEES,
          costEES: currentEmployer.chargeableMonthlyCostEES
        })

        this.invoiceProduct.rate = adminFeeRate
        console.log('🔥 Rate set to:', this.invoiceProduct.rate)

        // Trigger the same calculation chain as manual rate entry
        // This will calculate amount, VAT, and net total
        this.assignAmountValue(adminFeeRate)
        console.log('🔥 Calculations triggered - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
      } else {
        console.log('🔥 Service is neither admin fee nor employee:', serviceName)
      }
    }
    },
    async reloadTerms() {
      await this.getTermsList()
    },
    prefillDescription() {
      if (this.selected_employees.length && !this.invoiceProduct.description) {
        const dateStr = new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })

        // If only one employee is selected, use their name
        if (this.selected_employees.length === 1) {
          const capturedEmployee = this.computedEmployees.find((el) =>
            this.selected_employees.includes(el._id)
          )
          if (capturedEmployee) {
            this.invoiceProduct.description = `${capturedEmployee.full_name} - ${dateStr}`
          }
        }
        // If multiple employees are selected, indicate the count
        else if (this.selected_employees.length > 1) {
          this.invoiceProduct.description = `${this.selected_employees.length} Employees - ${dateStr}`
        }
      }
    },
    calculateAmount() {
      // Ensure rate is a valid number before calculation
      const safeRate = isNaN(parseFloat(this.invoiceProduct.rate)) ? 0 : parseFloat(this.invoiceProduct.rate)

      this.invoiceProduct.amount =
        safeRate * this.invoiceProduct.quantity
      this.invoiceProduct.vat_amount = this.calculatePercentage(
        this.taxRate,
        this.invoiceProduct.amount
      )
      this.invoiceProduct.net_total = this.addNumbers(
        this.invoiceProduct.amount,
        this.invoiceProduct.vat_amount
      )
    },
    handleAddProductAt() {
      console.log('should update try validation')

      if (!this.$refs.invoiceForm?.validate()) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Please fill in all required fields for the product.',
          type: 'warning'
        })
        return
      }

      try {
        const dateStr = new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })

        if (this.add_product.update) {
          // Update existing product
          console.log('invoice to update:', this.invoiceProduct)

          if (this.add_product.index > -1) {
            // When updating, keep the combined rate for multiple employees
            let updated_product = {
              ...this.invoiceProduct,
            }

            // Only update the description if not already set
            if (!updated_product.description && this.selected_employees.length) {
              // If only one employee selected
              if (this.selected_employees.length === 1) {
                const capturedEmployee = this.computedEmployees.find((el) =>
                  this.selected_employees.includes(el._id)
                )

                if (capturedEmployee) {
                  updated_product.description = `${capturedEmployee.full_name} - ${dateStr}`

                  // Add the employee _id and user object
                  const employee = this.employees.find(emp => emp._id === this.selected_employees[0])
                  if (employee) {
                    updated_product._id = employee._id
                    updated_product.user = {
                      _id: employee._id,
                      first_name: employee.first_name,
                      last_name: employee.last_name,
                      email: employee.email,
                      designation: employee.designation,
                      emp_id: employee.emp_id,
                      employment: employee.employment,
                      salary: employee.salary
                    }
                  }
                }
              }
              // If multiple employees selected
              else {
                updated_product.description = `${this.selected_employees.length} Employees - ${dateStr}`
                // For multiple employees, we'll add the first employee's ID or we could make an array
                // depending on how the backend expects it
                if (this.selected_employees.length > 0) {
                  const firstEmployee = this.employees.find(emp => emp._id === this.selected_employees[0])
                  if (firstEmployee) {
                    updated_product._id = firstEmployee._id
                    updated_product.user = {
                      _id: firstEmployee._id,
                      first_name: firstEmployee.first_name,
                      last_name: firstEmployee.last_name,
                      email: firstEmployee.email,
                      designation: firstEmployee.designation,
                      emp_id: firstEmployee.emp_id,
                      employment: firstEmployee.employment,
                      salary: firstEmployee.salary
                    }
                  }
                }
              }
            }

            console.log('invoice index:', this.add_product.index)
            this.$set(this.invoiceObj.items, this.add_product.index, updated_product)
          }
        } else {
          // Add new product
          console.log('adding product:', this.invoiceProduct)

          // Check the product creation strategy based on employee selection
          if (this.selected_employees.length) {
            // Multiple employees selection mode
            if (this.selected_employees.length > 1) {
              // For multiple employees, two options:

              // Option 1: Create a single invoice item with combined rate (DEFAULT)
              // This is now the default behavior as we've implemented the combined rate calculation
              const combinedProduct = {
                ...this.invoiceProduct,
                // Ensure the description reflects multiple employees if not already set
                description: this.invoiceProduct.description ||
                  `${this.selected_employees.length} Employees - ${dateStr}`
              }

              // Add the first selected employee's ID and user data to the combined product
              const firstEmployee = this.employees.find(emp => emp._id === this.selected_employees[0])
              if (firstEmployee) {
                combinedProduct._id = firstEmployee._id
                combinedProduct.user = {
                  _id: firstEmployee._id,
                  first_name: firstEmployee.first_name,
                  last_name: firstEmployee.last_name,
                  email: firstEmployee.email,
                  designation: firstEmployee.designation,
                  emp_id: firstEmployee.emp_id,
                  employment: firstEmployee.employment,
                  salary: firstEmployee.salary
                }
              }

              this.invoiceObj.items.push(combinedProduct)
            }
            // Option 2: Create separate invoice items for each employee
            // This is kept for backward compatibility or specific user needs
            else {
              // For single employee, create an individual item
              const captureEmployees = this.computedEmployees.filter((el) =>
                this.selected_employees.includes(el._id)
              )

              const createdItems = captureEmployees.map((el) => {
                const employee = this.employees.find(emp => emp._id === el._id)

                return {
                  ...this.invoiceProduct,
                  description: `${el.full_name} - ${dateStr}`,
                  _id: el._id, // Add employee _id to the invoice item
                  user: employee ? {
                    _id: employee._id,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    email: employee.email,
                    designation: employee.designation,
                    emp_id: employee.emp_id,
                    employment: employee.employment,
                    salary: employee.salary
                  } : null
                }
              })

              const employeeItems = [...this.invoiceObj.items, ...createdItems]
              this.$set(this.invoiceObj, 'items', employeeItems)
            }
          } else {
            // No employees selected, just add the product as is
            this.invoiceObj.items.push(this.invoiceProduct)
          }
        }

        console.log('at the end.')
        this.closeInvoiceProductDialog()

        this.$nuxt.$emit('show-snackbar', {
          message: `Product ${this.add_product.update ? 'updated' : 'added'} successfully!`,
          type: 'success'
        })
      } catch (error) {
        console.error('Error handling product:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: `Failed to ${this.add_product.update ? 'update' : 'add'} product. Please try again.`,
          type: 'error'
        })
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      // Format as YYYY-MM-DD for v-date-picker
      return date.toISOString().split('T')[0]
    },
    changeProductType() {
      const serviceName = this.invoiceProduct.service_name?.toLowerCase() || ''

      // Clear selected employees when changing to Admin Fee
      if (serviceName === 'admin fee' && this.selected_employees.length > 0) {
        console.log('🔥 Clearing selected employees when switching to Admin Fee')
        this.selected_employees = []
      }

      // Determine if employee selection should be shown
      if (
        serviceName.includes('monthly outsourcing') ||
        serviceName.includes('employee outsourcing') ||
        serviceName === 'employee'
      ) {
        this.should_select_employee = true

        // Clear rate if switching to employee service to ensure employee salary will be used
        if (serviceName === 'employee') {
          this.invoiceProduct.rate = 0
          this.assignAmountValue(0)
        }
      } else {
        this.should_select_employee = false
      }

      // Trigger setAdminFee to handle rate calculation based on new service type
      this.$nextTick(() => {
        this.setAdminFee()
      })
    },
    goBack() {
      this.invoiceSections = this.invoiceSections - 1
    },
    reloadInvoices() {
      this.$emit('reload')
    },
    updateInvoiceTotals() {
      this.invoiceObj.sub_total = this.computedSubTotal
      this.invoiceObj.total = this.computedTotal
      this.invoiceObj.vat_total = this.computedVATAmount
      this.invoiceObj.discount = this.computedDiscount
      this.invoiceObj.balance_due = this.computedTotal

      // Update converted amount to AED
      this.updateConvertedAmount();
    },
    async openAddInvoiceDialog(update = false, index = null) {
      // Loading all necessary data in parallel for better performance
      const loadingPromises = [];

      // Ensure products and services are loaded
      if (!this.productsAndServices || this.productsAndServices.length === 0) {
        this.isLoading = true;
        loadingPromises.push(this.fetchProducts().catch(error => {
          console.error('Failed to load services:', error);
        }));
      }

      // Ensure employees are loaded if an employer is selected
      if (this.invoiceObj.customer && (!this.employees || this.employees.length === 0)) {
        loadingPromises.push(this.getEmployeesList().catch(error => {
          console.error('Failed to load employees:', error);
        }));
      }

      // Ensure tax codes are loaded
      if (!this.taxCodesList || this.taxCodesList.length === 0) {
        loadingPromises.push(this.getTaxCodeList().catch(error => {
          console.error('Failed to load tax codes:', error);
        }));
      }

      // Wait for all data to be loaded
      if (loadingPromises.length > 0) {
        try {
          await Promise.all(loadingPromises);
        } finally {
          this.isLoading = false;
        }
      }

      this.add_product = {
        show: true,
        update,
        index,
      }

      // Clear any selected employees
      this.selected_employees = []

      // set product to update
      if (update && index > -1) {
        console.log("^^^^^^^^^^^^^^^^^^")
        this.invoiceProduct = {}
        console.log(this.invoiceObj.items[index], "THE ITEMS ON INVOICE#####")
        this.invoiceProduct = { ...this.invoiceObj.items[index], rate: Number(this.invoiceObj.items[index]?.rate) }
        console.log("<--------------->",this.invoiceProduct, "!!!!!!!!!!!!!!!!!!!!!!!!!")

        // --- Restore selected_employees for edit mode ---
        // If the item has a user object (single employee)
        if (this.invoiceProduct.user && this.invoiceProduct.user._id) {
          this.selected_employees = [this.invoiceProduct.user._id]
        } else if (Array.isArray(this.invoiceProduct.user)) {
          // If user is an array (multiple employees)
          this.selected_employees = this.invoiceProduct.user.map(u => u._id).filter(Boolean)
        } else if (this.invoiceProduct._id && this.employees.some(e => e._id === this.invoiceProduct._id)) {
          // Fallback: if _id matches an employee
          this.selected_employees = [this.invoiceProduct._id]
        } else {
          this.selected_employees = []
        }

        // Determine if we should enable employee selection for this service
        this.changeProductType()

        // Trigger setAdminFee for existing product to ensure rate is correct
        this.$nextTick(() => {
          // If this is Admin Fee, ensure employee selection is cleared
          if (this.invoiceProduct.service_name?.toLowerCase() === 'admin fee') {
            this.selected_employees = []
          }
          // this.setAdminFee()
        })
      } else {
        // Reset to blank product and set VAT as default
        this.$set(this, 'invoiceProduct', { ...this.blankProduct })
        this.should_select_employee = false

        // Auto-select VAT if available and not already set
        if (this.taxCodesList.length && !this.invoiceProduct.tax_code) {
          const vatTaxCode = this.taxCodesList.find(
            (tax) => tax.code?.toLowerCase() === 'vat' ||
              tax.name?.toLowerCase().includes('vat') ||
              tax.code?.toLowerCase() === 'v'
          )

          if (vatTaxCode) {
            this.invoiceProduct.tax_code = vatTaxCode._id
            this.getTaxRate(vatTaxCode._id)
          }
        }
      }
    },
    // Check employers list before dropdown opens
    checkEmployersList() {
      console.log('Dropdown clicked, checking employers list')
      if (!this.employers || this.employers.length === 0) {
        console.log('No employers found, reloading list')
        this.getEmployersList()
      } else {
        console.log('Employers list already loaded with', this.employers.length, 'items')
      }
    },
    // Helper method to get the salary breakdown for multiple employees
    getEmployeeSalaryBreakdown() {
      if (!this.selected_employees || this.selected_employees.length <= 1) {
        return null;
      }

      // Create a breakdown of employee salaries
      const breakdown = this.selected_employees.map(employeeId => {
        const employee = this.employees.find(emp => emp._id === employeeId);
        if (!employee || !employee.salary) {
          return {
            name: 'Unknown Employee',
            salary: 0
          };
        }

        // Get the salary amount
        let salaryAmount = 0;
        if (typeof employee.salary.total_fixed === 'string') {
          salaryAmount = parseFloat(employee.salary.total_fixed) || 0;
        } else if (typeof employee.salary.total_fixed === 'number') {
          salaryAmount = employee.salary.total_fixed;
        }

        return {
          name: `${employee.first_name} ${employee.last_name}`,
          salary: salaryAmount
        };
      });

      // Calculate the total
      const total = breakdown.reduce((sum, emp) => sum + emp.salary, 0);

      return {
        employees: breakdown,
        total: total
      };
    },

    handleServiceDropdownClick() {
      console.log('Service dropdown clicked, services available:', this.computedServices.length);

      // If no services are loaded, try to fetch them again
      if (this.computedServices.length === 0 && !this.isLoading) {
        console.log('No services available, attempting to load them...');
        this.isLoading = true;
        this.fetchProducts().finally(() => {
          this.isLoading = false;
        });
      }
    },

    closeInvoiceProductDialog() {
      this.add_product = {
        show: false,
        update: false,
        index: null,
      }
      console.log('resetting invoice product dialog')

      // Reset the invoice product to blank
      this.$set(this, 'invoiceProduct', { ...this.blankProduct })

      // Clear selected employees
      this.selected_employees = []

      // Reset employee selection flag
      this.should_select_employee = false

      // Reset tax rate
      this.taxRate = 0
    },
    validateDetailsForm() {
      return this.$refs.invoiceDetailsForm.validate()
    },
    async nextStep(n) {
      if (n === this.steps.length - 1) {
        const valid = this.$refs.estimateForm.validate()
        // handle submit here
        if (valid) {
          await this.updateInvoice(true)
          // this.closeDialog()
        }
        this.invoiceSections = 1
      } else {
        if (this.$refs.form.validate()) {
          this.invoiceSections = n + 1
        }
      }
    },
    closeDialog() {
      this.$emit('close')
      this.reloadInvoices()
      // if (!this.effectiveInvoice) {
      // }
    },
    async initPreview() {
      if (this.invoice) {
        this.resetSourceTracker()
        await this.getDocumentPreview()
      }
      this.first_load = false

      // Set previewLoaded to true when editing existing invoice
      if (this.effectiveInvoice) {
        this.previewLoaded = true
      }
    },
    async getOrCreateInvoice() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$post(
          `/invoice/setup-preview`,
          {
            ...this.invoiceObj,
          },
          {
            headers: { Authorization: AuthStr },
          }
        )
        console.log('setting up preview: ', response)
        this.invoice = response
        await this.initPreview()
      } catch (error) {
        console.error('Error setting up invoice preview: ', error.message)
        this.$nuxt.$emit('show-snackbar', {

          message: 'Failed to setup invoice preview. Some features may be limited.',
          type: 'warning'
        })
        // Don't break the flow - allow user to continue with limited functionality
      }
    },
    resetSourceTracker() {
      this.$nextTick(() => {
        this.invoiceObj.source = false
        console.log('postponed update')
        console.log('should reset source, check', this.invoiceObj.source)
      })
    },
    async handleTermsUpdate() {
      this.getTermsName(this.invoiceObj.terms)
      await this.updateInvoice()
    },
    async debounceUpdate() {
      await this.updateInvoice()
    },
    async updateInvoice(final = false) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$patch(
          `/invoice/update/${this.invoice?._id}`,
          {
            ...{ ...this.invoiceObj, is_draft: !final },
          },
          {
            headers: { Authorization: AuthStr },
          }
        )

        if (!final) {
          this.invoice = response.data
          if (this.invoice) {
            this.resetSourceTracker()

            await this.getDocumentPreview()
          }
        } else {
          this.$nuxt.$emit('record-payment-status', {
            success: true,
            message: 'Invoice has been updated successfully',
          })
        }
      } catch (error) {
        console.error('Error updating invoice: ', error?.message)
        this.$nuxt.$emit('record-payment-status', {
          success: false,
          message: error?.response?.data?.message || 'Something failed when updating invoice. Please try again.',
        })
        // Don't throw - allow user to continue with current state
      }
    },
    customFilter(item, queryText, itemText) {
      // Custom filter for better search functionality
      const searchText = queryText.toLowerCase()
      const companyName = item.company_name.toLowerCase()

      // Check if the search text matches the company name
      return companyName.includes(searchText)
    },
    async getEmployersList() {
      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading_employers = true

      try {
        const response = await this.$axios.$post(
          `/companies/list/filter/search?page=1&limit=100000`,
          {
            search: '',
            isInvoiceFilter: true,
          },
          {
            headers: { Authorization: AuthStr },
          }
        )
        console.log('Employers API response:', response)
        console.log('Response type:', typeof response)
        console.log('Is array:', Array.isArray(response))
        console.log('Response length:', response ? (Array.isArray(response) ? response.length : Object.keys(response).length) : 0)

        // Ensure we're setting an array with the right structure
        if (response && Array.isArray(response) && response.length > 0) {
          this.employers = response
          console.log('Set employers to response array:', this.employers.length, 'items')
        } else if (response && response.results && Array.isArray(response.results)) {
          // Some APIs wrap results in a results property
          this.employers = response.results
          console.log('Set employers to response.results:', this.employers.length, 'items')
        } else {
          console.warn('Unexpected API response format for employers:', response)
          this.employers = []
        }
      } catch (error) {
        console.error('Error fetching employers list:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to load employers list. Please refresh the page.',
          type: 'error'
        })
        this.employers = [] // Fallback to prevent UI crashes
      } finally {
        this.loading_employers = false
      }
    },
    async getEmployeesList() {
      // If no customer is selected, don't attempt to fetch employees
      if (!this.invoiceObj.customer) {
        this.employees = [];
        console.log('No customer selected yet, skipping employee fetch');
        return;
      }
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading_employees = true
      try {
        // Use default values for sponsor type if undefined
        const sponsorType = this.invoiceObj.visa_sponsor || this.visa_sponsor || 'Dynamic Employment Services';
        const response = await this.$axios.$get(
          `/users/company/${this.invoiceObj.customer}/employees?sponsorType=${sponsorType}&limit=100000`,
          { headers: { Authorization: AuthStr } }
        )
        this.employees = Array.isArray(response?.results) ? response.results : []
      } catch (error) {
        console.error(`Could not fetch employee list: ${error?.message}`)
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to load employees list. Some features may be limited.',
          type: 'warning'
        })
        this.employees = [] // Fallback to prevent crashes
      } finally {
        this.loading_employees = false
      }
    },
    async getDocumentPreview() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      // Ensure the invoiceObj is properly initialized
      if (!this.invoiceObj.items) {
        this.invoiceObj.items = [];
      }

      // If we don't have an invoice yet, create a temporary one first
      if (!this.invoice || !this.invoice._id) {
        try {
          console.log('No invoice ID available, creating a temporary invoice first');
          await this.getOrCreateInvoice();
        } catch (err) {
          console.error('Failed to create temporary invoice:', err);
          this.loading = false;

          // Set empty content to prevent UI issues
          this.replacedContent = {
            sections: []
          };

          return;
        }
      }

      try {
        // Now we should have a valid invoice ID
        if (!this.invoice?._id) {
          console.error('Still no valid invoice ID after creation attempt');
          this.loading = false;

          // Set empty content to prevent UI issues
          this.replacedContent = {
            sections: []
          };

          return;
        }

        const response = await this.$axios
          .$post(
            `/invoice/getpreview`,
            {
              invoice_id: this.invoice._id,
              userId: this.invoiceObj?.user_id,
            },
            { headers: { Authorization: AuthStr } }
          )

        this.replacedContent = response
        setTimeout(() => {
          this.loading = false
        }, 100)
      } catch (error) {
        console.error('Error loading document preview:', error)
        this.loading = false
        // Don't show error to user as preview is not critical for functionality
        // Set fallback content to prevent UI issues
        this.replacedContent = {
          sections: [
            {
              blocks: [
                {
                  inlines: [
                    {
                      characterFormat: {
                        bold: true,
                        italic: true,
                      },
                      text: 'Preview unavailable',
                    },
                  ],
                },
              ],
              headersFooters: {},
            },
          ],
        }
      }
    },
    async getTermsList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        this.loading_terms = true

        const response = await this.$axios.$get(`/terms`, {
          headers: { Authorization: AuthStr },
        })

        this.termsList = response || []

        // select default term
        if (this.termsList.length > 0) {
          this.invoiceObj.terms = this.termsList[0]._id ?? ''
          // prefill default terms
          this.getTermsName(this.invoiceObj.terms)
        }
      } catch (error) {
        console.error('Error fetching terms: ', error?.message)
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to load payment terms. Manual entry may be required.',
          type: 'warning'
        })
        this.termsList = [] // Fallback to prevent crashes
      } finally {
        this.loading_terms = false
      }
    },
    async getTaxCodeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        const response = await this.$axios
          .$get(`/taxcodes`, { headers: { Authorization: AuthStr } })

        this.taxCodesList = response

        // Find and set VAT as default selection if available
        const vatTaxCode = this.taxCodesList.find(
          (tax) => tax.code?.toLowerCase() === 'vat' ||
            tax.name?.toLowerCase().includes('vat') ||
            tax.code?.toLowerCase() === 'v'
        )

        if (vatTaxCode && !this.invoiceProduct.tax_code) {
          this.invoiceProduct.tax_code = vatTaxCode._id
          // Auto-calculate tax rate for default VAT selection
          this.getTaxRate(vatTaxCode._id)
        }
      } catch (error) {
        console.error('Error fetching tax codes:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to load tax codes. Please try again.',
          type: 'error'
        })
        // Fallback: Set empty tax codes array to prevent UI breaks
        this.taxCodesList = []
      }
    },
    async fetchProducts() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        console.log('Fetching products and services...')
        this.isLoading = true
        const response = await this.$axios.get(
          'configuration/?q=products_and_services',
          { headers: { Authorization: AuthStr } }
        )

        if (response.data && response.data.data && response.data.data[0]) {
          this.productsAndServices = response.data.data[0].products_and_services || []
          console.log(`Loaded ${this.productsAndServices.length} products/services`)
        } else {
          console.warn('Unexpected API response format:', response.data)
          this.productsAndServices = []
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to load products and services. Manual entry may be required.',
          type: 'warning'
        })
        this.productsAndServices = [] // Fallback to prevent crashes
      } finally {
        this.isLoading = false
      }
    },
    // handleServiceSelection() {
    //   this.selected
    // },
    async generatePdfAndDownloadPDF() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        this.loading_download_url = true
        const response = await this.$axios.$post(
          `/invoice/getpreviewpdf`,
          { invoice_id: this.invoice?._id, userId: this.invoiceObj?.user_id },
          { headers: { Authorization: AuthStr } }
        )

        console.log('invoice url : ,', response)
        this.invoice_download_url = response?.url
        if (this.invoice_download_url) {
          // Create a hidden anchor element and click it
          const link = document.createElement('a')
          link.href = this.invoice_download_url
          link.download = `${response?.name || 'invoice'}.pdf` // Optional: specify filename
          link.target = '_blank' // Optional: open in new tab or keep as is
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          this.$nuxt.$emit('show-snackbar', {
            message: 'Invoice PDF downloaded successfully!',
            type: 'success'
          })
        } else {
          throw new Error('No download URL received from server')
        }
      } catch (error) {
        console.error('Failed to generate PDF', error?.message)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to generate PDF. Please try again.',
          type: 'error'
        })
      } finally {
        this.loading_download_url = false
      }
    },
    setupClientAddress() {
      // get employer
      const employer = this.employers.find(
        (el) => el._id == this.invoiceObj.customer
      )
      // const employee = this.computedEmployees.find(
      //   (el) => el._id == this.invoiceObj?.userId
      // )
      if (employer) {
        this.invoiceObj.customer_name = employer?.company_name || 'N/A'
        this.invoiceObj.email = employer?.email || 'N/A'
        // console.log('This is the employee', employee)

        const formatAddress = (address) => {
          console.log('What is the address', address)
          let addressLines = [
            address?.address_line1 ? address?.address_line1 : 'N/A',
            address?.address_line2 ? address?.address_line2 : 'N/A',
            `${address?.city ? address?.city : ''}${address?.state ? `, ${address?.state}` : ''
            } ${address?.zip ? address?.zip : ''}`,
            address?.country ?? '',
          ]
          console.log('generated address: ', addressLines)
          addressLines = addressLines.filter((line) => line.trim() !== '')

          return addressLines.join('\n')
        }
        if (employer.billing_address && employer.shipping_address)
          this.invoiceObj.billing_address = formatAddress(
            employer.billing_address
          )
        this.invoiceObj.shipping_address = formatAddress(
          employer.shipping_address
        )
      }
    },
    async changeCompany() {
      this.setupClientAddress()

      // Set preview loading state
      this.previewLoading = true
      this.previewLoaded = false

      try {
        await this.getOrCreateInvoice()
        await this.getEmployeesList()

        // Mark preview as loaded after successful operations
        this.previewLoaded = true
      } catch (error) {
        console.error('Error loading invoice preview:', error)
      } finally {
        this.previewLoading = false
      }
    },
    debouncedChangeCompany() {
      // Clear existing timeout
      if (this.changeCompanyTimeout) {
        clearTimeout(this.changeCompanyTimeout)
      }

      // Set new timeout
      this.changeCompanyTimeout = setTimeout(() => {
        this.changeCompany()
      }, 500) // 500ms debounce
    },
    async changeVisaType() {
      await this.getEmployeesList()
      await this.updateInvoice()
    },
    async changeCurrency() {
      // Set default exchange rate based on currency
      if (this.invoiceObj.currency === 'AED') {
        this.invoiceObj.conversion_rate = 1.0;
      } else {
        // Fetch current exchange rate for the selected currency
        await this.fetchCurrentExchangeRate();
      }

      // Update converted amount
      this.updateConvertedAmount();

      // Reload preview when currency changes
      if (this.invoice && this.invoice._id) {
        await this.updateInvoice()
        await this.initPreview()
      }
    },
    async fetchCurrentExchangeRate() {
      try {
        if (this.invoiceObj.currency === 'AED') {
          this.invoiceObj.conversion_rate = 1.0;
          return;
        }

        // Fetch latest exchange rates from API
        const response = await this.$axios.get('/exchange-rates/latest');

        if (response.data.success && response.data.data) {
          const rates = response.data.data;
          this.invoiceObj.conversion_rate = rates[this.invoiceObj.currency] || 1.0;
          this.updateConvertedAmount();
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to fetch exchange rate. Using default rate.',
          color: 'warning',
          timeout: 3000
        };
      }
    },
    updateConversionRate() {
      // Update converted amount when rate changes
      this.updateConvertedAmount();
    },
    updateConvertedAmount() {
      // Calculate AED equivalent based on current total and exchange rate
      if (this.invoiceObj.total && this.invoiceObj.conversion_rate) {
        this.invoiceObj.converted_amount_aed = this.invoiceObj.total * this.invoiceObj.conversion_rate;
      }
    },
    changeEmployee() {
      // const employer = this.employers.find((a) => a._id === customer);
      // this.setupClientAddress()
    },
    getTermsName(terms) {
      this.invoiceObj.terms_name = this.termsList.filter(
        (a) => a._id == terms
      )[0].name
      this.termsDays = this.termsList.filter((a) => a._id == terms)[0].days
        ? this.termsList.filter((a) => a._id == terms)[0].days
        : '0'
      this.invoiceObj.due_date = this.generateFutureDate(this.termsDays)
    },
    getTaxRate(tax_id) {
      try {
        console.log('🔍 getTaxRate called with tax_id:', tax_id)
        console.log('🔍 Available tax codes:', this.taxCodesList.map(t => ({ id: t._id, name: t.name, rate: t.rate })))

        const selectedTax = this.taxCodesList.find((a) => a._id === tax_id)
        if (!selectedTax) {
          console.warn('Tax code not found:', tax_id)
          this.taxRate = 0
          this.invoiceProduct.tax_name = ''
          this.invoiceProduct.vat_rate = 0
          this.invoiceProduct.vat_amount = 0
          return
        }

        console.log('🔍 Selected tax:', selectedTax)

        // Store the tax rate as a number for better consistency
        this.taxRate = selectedTax.rate || 0
        this.invoiceProduct.tax_name = selectedTax.name || ''
        this.invoiceProduct.vat_rate = this.taxRate

        // Ensure amount is calculated before VAT calculation
        const rate = parseFloat(this.invoiceProduct.rate) || 0
        const quantity = parseFloat(this.invoiceProduct.quantity) || 1
        this.invoiceProduct.amount = rate * quantity

        console.log('🔍 Before VAT calculation:')
        console.log('  - Rate:', this.invoiceProduct.rate)
        console.log('  - Quantity:', this.invoiceProduct.quantity)
        console.log('  - Amount:', this.invoiceProduct.amount)
        console.log('  - Tax Rate:', this.taxRate)

        // Calculate VAT amount
        this.invoiceProduct.vat_amount = this.calculatePercentage(
          this.taxRate,
          this.invoiceProduct.amount
        )

        // Calculate net total
        this.invoiceProduct.net_total = this.addNumbers(
          this.invoiceProduct.amount,
          this.invoiceProduct.vat_amount
        )

        console.log('🔍 After VAT calculation:')
        console.log('  - VAT Amount:', this.invoiceProduct.vat_amount)
        console.log('  - Net Total:', this.invoiceProduct.net_total)

      } catch (error) {
        console.error('Error calculating tax rate:', error)
        // Fallback to safe defaults
        this.taxRate = 0
        this.invoiceProduct.tax_name = ''
        this.invoiceProduct.vat_rate = 0
        this.invoiceProduct.vat_amount = 0
        this.invoiceProduct.net_total = this.invoiceProduct.amount || 0
      }
    },
    assignAmountValue(rate) {
      // Ensure rate is a valid number before calculation
      const safeRate = isNaN(parseFloat(rate)) ? 0 : parseFloat(rate)
      const quantity = parseFloat(this.invoiceProduct.quantity) || 1

      console.log('🔍 assignAmountValue called with rate:', rate, 'safeRate:', safeRate, 'quantity:', quantity)
      console.log('🔍 Current taxRate:', this.taxRate, 'vat_rate:', this.invoiceProduct.vat_rate)

      this.invoiceProduct.amount = safeRate * quantity

      // Only calculate VAT if we have a valid tax rate
      if (this.taxRate && this.taxRate > 0 && this.invoiceProduct.vat_rate && this.invoiceProduct.vat_rate > 0) {
        this.invoiceProduct.vat_amount = this.calculatePercentage(
          this.taxRate,
          this.invoiceProduct.amount
        )
        console.log('🔍 VAT calculated in assignAmountValue:', this.invoiceProduct.vat_amount)
      } else {
        this.invoiceProduct.vat_amount = 0
        console.log('🔍 No VAT calculated - taxRate or vat_rate is 0 or empty')
      }

      this.invoiceProduct.net_total = this.addNumbers(
        this.invoiceProduct.amount,
        this.invoiceProduct.vat_amount
      )

      console.log('🔍 Final amounts - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
    },
    generateFutureDate(days = 10) {
      const today = new Date() // Get the current date
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000) // Add the specified number of days

      return futureDate.toISOString().substr(0, 10) // Return the future date in a readable format
    },
    calculatePercentage(percent, number) {
      // Ensure both inputs are properly converted to numbers
      const percentNum = parseFloat(percent) || 0
      const numberNum = parseFloat(number) || 0

      // Calculate percentage and round to 2 decimal places
      const result = (percentNum / 100) * numberNum
      return Math.round(result * 100) / 100
    },
    addNumbers(num1, num2) {
      const parsedNum1 = parseFloat(num1) || 0
      const parsedNum2 = parseFloat(num2) || 0

      return parsedNum1 + parsedNum2
    },
    getStatusColor(status) {
      const statusColors = {
        'paid': 'success',
        'partially paid': 'warning',
        'overdue': 'error',
        'due': 'info',
        'draft': 'grey',
        'unapproved': 'orange',
        'cancelled': 'error',
        'void': 'grey darken-2'
      }
      return statusColors[status?.toLowerCase()] || 'grey'
    },
    // closeEstimate() {
    //   this.$router.push('/Billings')
    // },
    async createInvoice() {
      if (!this.$refs.estimateForm?.validate()) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Please fill in all required fields before creating the invoice.',
          type: 'warning'
        })
        return
      }
      if (!this.invoiceObj || !Array.isArray(this.invoiceObj.items) || !this.invoiceObj.items.length) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Please add at least one item to the invoice.',
          type: 'warning'
        })
        return
      }

      try {
        this.submitLoading = true
        await this.updateInvoice(true)
        this.$nuxt.$emit('show-snackbar', {
          message: `Invoice ${this.effectiveInvoice ? 'updated' : 'created'} successfully!`,
          type: 'success'
        })
        this.closeDialog()
      } catch (error) {
        console.error('Create invoice error:', error.message)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || `Failed to ${this.effectiveInvoice ? 'update' : 'create'} invoice. Please try again.`,
          type: 'error'
        })
      } finally {
        this.submitLoading = false
      }
    },
    // handleAddProduct() {
    //   this.add_product = true
    // },

    handleDeleteProduct(index) {
      this.product_to_delete = index
      this.product_delete_confirmation = true
    },
    deleteProduct() {
      if (this.product_to_delete > -1 && this.invoiceObj && Array.isArray(this.invoiceObj.items) && this.invoiceObj.items.length > 0) {
        this.invoiceObj.items.splice(this.product_to_delete, 1)
      }
      this.product_delete_confirmation = false
    },
    handleFileUpload() {
      if (this.timesheet) {
        this.confirmDialog = true
      }
    },
    async confirmUpload() {
      this.confirmDialog = false

      const formData = new FormData()
      formData.append('file', this.timesheet)

      try {
        const response = await this.$axios.post(
          '/documents/mimetype/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        this.timesheet_url = response?.url
        this.timesheet = null
      } catch (error) {
        console.error(error)
      }
    },
  },
}
</script>
<style lang="scss">
.dynamic_table {
  .dynamic_table_thead {
    tr {
      background: #e2e7f180 !important;
    }
  }

  .dynamic_table_tbody {
    .dynamic_table_body_rows {

      // border-bottom: 0.5 solid red !important;
      &:hover {
        background: #e2e7f142 !important;
      }
    }
  }
}

.estimate__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  width: 400px;
  // height: 120px;
}

.hover-area {
  height: 10px;
  transition: background-color 0.2s;
}

.spacer-row:hover .hover-area {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Custom stepper styles */
.v-stepper.custom-stepper {
  background: transparent;
  box-shadow: none;

  .custom-stepper-header {
    box-shadow: none;
    background: transparent;
  }

  .custom-step-wrapper {
    position: relative;
    z-index: 2;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    .custom-step-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #f5f5f5;
      margin-bottom: 6px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;

      .v-icon {
        font-size: 20px;
        color: #757575;
        transition: all 0.3s ease;
      }
    }

    .custom-step-label {
      font-weight: 500;
      color: #757575;
      transition: all 0.3s ease;
      max-width: 100px;
    }

    &.active {
      .custom-step-icon {
        background: linear-gradient(135deg, #42a5f5, #1976d2);
        box-shadow: 0 3px 6px rgba(25, 118, 210, 0.3);
        transform: scale(1.05);
        border-color: #1976d2;

        .v-icon {
          color: white;
        }
      }

      .custom-step-label {
        color: #1976d2;
        font-weight: 600;
      }
    }

    &.completed {
      .custom-step-icon {
        background: linear-gradient(135deg, #66bb6a, #43a047);
        box-shadow: 0 3px 6px rgba(76, 175, 80, 0.3);
        border-color: #43a047;

        .v-icon {
          color: white;
        }
      }

      .custom-step-label {
        color: #43a047;
        font-weight: 500;
      }
    }
  }

  .custom-step-divider {
    height: 2px;
    background-color: #e0e0e0;
    flex-grow: 1;

    &.active {
      background-color: #43a047;
    }
  }
}

/* Enhanced Preview Styling with Higher Specificity */
.v-card.preview-card {
  min-height: 85vh !important;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;

  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  }
}

.v-card.preview-card .v-card__title.preview-header {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;

  span {
    color: white !important;
  }
}

.v-card.preview-card .v-card__text.preview-container {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%) !important;
  position: relative !important;
  overflow: hidden !important;
  flex-grow: 1 !important;
  padding: 0 !important;

  &::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 3px !important;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%) !important;
    background-size: 200% 100% !important;
    animation: shimmer 3s ease-in-out infinite !important;
    z-index: 1 !important;
  }
}

.preview-wrapper {
  height: 100% !important;
  min-height: 75vh !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  position: relative !important;
  background: white !important;
  margin: 16px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e1e8ed !important;
  z-index: 2 !important;
}

.preview-placeholder {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  height: 100% !important;
  min-height: 400px !important;
  background: radial-gradient(circle at center, #f8f9fa 0%, #e9ecef 100%) !important;
  text-align: center !important;
  border: 2px dashed #dee2e6 !important;
  border-radius: 8px !important;
  margin: 16px !important;

  .v-icon {
    opacity: 0.5 !important;
    animation: pulse 2s ease-in-out infinite !important;
  }

  p {
    margin: 8px 0 !important;
    opacity: 0.7 !important;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .v-card.preview-card {
    min-height: 70vh !important;
  }

  .preview-wrapper {
    min-height: 60vh !important;
  }
}

@media (max-width: 768px) {
  .v-card.preview-card {
    min-height: 50vh !important;
  }

  .preview-wrapper {
    min-height: 40vh !important;
    margin: 8px !important;
  }
}
</style>
