<template>
  <div>
    <v-dialog
      v-model="show"
      fullscreen
      hide-overlay
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title id="card-title" class="tw-py-3 tw-px-4">
          <div class="tw-flex tw-items-center">
            <v-img
              src="/shift/build.svg"
              max-width="fit-content"
              height="fit-content"
              class="tw-mr-2"
              contain
            ></v-img>
            <span
              class="darkBlue-heading-text font-weight-normal subHeadingFontSize"
            >
              {{
                !effectiveDebitNote
                  ? 'New Debit Note'
                  : `Edit Debit Note -
              ${debitNoteToEdit?.debit_note_number}`
              }}</span
            >
          </div>
          <div class="tw-flex tw-gap-5 tw-items-center">
            <v-btn
              color="primary"
              :loading="loading_download_url"
              :disabled="!debitNote?._id"
              outlined
              @click="generatePdfAndDownloadPDF()"
              >Download</v-btn
            >
            <v-btn
              icon
              outlined
              color="red"
              :disabled="submitLoading"
              @click="closeDialog()"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-divider />
        <v-container fluid>
          <v-row class="py-0 my-0" style="">
            <v-col cols="6">
              <v-stepper v-model="debitNoteSections" class="custom-stepper">
                <div class="tw-px-4 tw-py-2">
                  <div
                    class="custom-stepper-header tw-flex tw-items-center tw-justify-center tw-gap-2"
                  >
                    <template v-for="(n, index) in steps">
                      <div
                        :key="`${index}-step`"
                        class="custom-step-wrapper tw-flex tw-flex-col tw-items-center tw-cursor-pointer"
                        :class="{
                          active: debitNoteSections === index,
                          completed: debitNoteSections > index,
                        }"
                        @click="debitNoteSections = index"
                      >
                        <div
                          class="custom-step-icon tw-flex tw-items-center tw-justify-center"
                        >
                          <v-icon v-if="debitNoteSections > index"
                            >mdi-check-circle</v-icon
                          >
                          <v-icon v-else>{{
                            index === 0
                              ? 'mdi-file-document-edit'
                              : 'mdi-cart-plus'
                          }}</v-icon>
                        </div>
                        <div
                          class="custom-step-label tw-text-center tw-text-sm"
                        >
                          {{ n }}
                        </div>
                      </div>

                      <div
                        v-if="index !== steps.length - 1"
                        :key="`divider-${index}`"
                        class="custom-step-divider"
                        :class="{ completed: debitNoteSections > index }"
                      ></div>
                    </template>
                  </div>
                  <v-divider class="tw-mt-4 tw-mb-2"></v-divider>
                </div>

                <v-stepper-items>
                  <!-- Step 1: Debit Note Details -->
                  <v-stepper-content
                    :step="0"
                    class="tw-overflow-auto"
                    style="max-height: 80vh"
                  >
                    <v-form
                      ref="form"
                      v-model="detailsValid"
                      lazy-validation
                      class="row"
                    >
                      <v-col cols="12" class="px-0" style="height: fit-content">
                          <v-row>
                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Company"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                                <div class="d-flex align-center">
                                  <v-select
                                    :items="employers"
                                    v-model="debitNoteObj.customer"
                                    placeholder="Select Company"
                                    class="proposalDialog_date_field2"
                                    solo
                                    dense
                                    :disabled="true"
                                    item-text="company_name"
                                    item-value="_id"
                                    :loading="loading_employers"
                                    :rules="main_rule"
                                    @change="changeCompany"
                                    append-icon="fa-chevron-down"
                                  ></v-select>
                                </div>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Email"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                              <v-text-field
                                  v-model="debitNoteObj.email"
                                  placeholder="Enter Email"
                                  class="proposalDialog_date_field2"
                                  solo
                                dense
                                :rules="main_rule"
                                ></v-text-field>
                              </template>
                            </CustomInputContainer>
                            </v-col>
                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Original Invoice"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                                <div class="d-flex align-center">
                              <v-text-field
                                    v-model="
                                      debitNoteObj.original_invoice_number
                                    "
                                    placeholder="Original Invoice Number"
                                    class="proposalDialog_date_field2"
                                    solo
                                dense
                                    :disabled="effectiveDebitNote"
                                    :rules="passedDebitNote ? [] : main_rule"
                                readonly
                                  ></v-text-field>
                                </div>
                              </template>
                            </CustomInputContainer>
                            </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Debit Note Number"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                                <v-text-field
                                  v-model="debitNoteObj.debit_note_number"
                                  placeholder="Debit Note Number"
                                  class="proposalDialog_date_field2"
                                  solo
                                  dense
                                  :disabled="effectiveDebitNote"
                                  :rules="effectiveDebitNote ? [] : main_rule"
                                  readonly
                                ></v-text-field>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Debit Note Date"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                              <v-menu
                                v-model="debit_note_date_menu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="debitNoteObj.debit_date"
                                      placeholder="Debit Note Date"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                      class="proposalDialog_date_field2"
                                      solo
                                    dense
                                    :rules="main_rule"
                                  />
                                </template>
                                <v-date-picker
                                  v-model="debitNoteObj.debit_date"
                                  no-title
                                  scrollable
                                  @input="debit_note_date_menu = false"
                                />
                              </v-menu>
                              </template>
                            </CustomInputContainer>
                            </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Due Date"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                              <v-menu
                                v-model="due_date_menu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="debitNoteObj.due_date"
                                      placeholder="Due Date"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                      class="proposalDialog_date_field2"
                                      solo
                                    dense
                                    :rules="main_rule"
                                  />
                                </template>
                                <v-date-picker
                                  v-model="debitNoteObj.due_date"
                                  no-title
                                  scrollable
                                  @input="due_date_menu = false"
                                />
                              </v-menu>
                              </template>
                            </CustomInputContainer>
                            </v-col>

                            <v-col cols="6" class="pl-0 py-0">
                              <CustomInputContainer
                              label="Visa Sponsor"
                                :mandatory="true"
                              >
                                <template v-slot:input>
                                    <v-select
                                  v-model="debitNoteObj.visa_sponsor"
                                  :items="visa_sponsorships"
                                  placeholder="Select Visa Sponsor"
                                      class="proposalDialog_date_field2"
                                      solo
                                      dense
                                      :disabled="true"
                                      :rules="main_rule"
                                      append-icon="fa-chevron-down"
                                    ></v-select>
                                </template>
                              </CustomInputContainer>
                            </v-col>

                            <v-col cols="6" class="pl-0 py-0">
                              <CustomInputContainer
                              label="Reason for Debit Note"
                                :mandatory="true"
                              >
                                <template v-slot:input>
                                <v-textarea
                                  v-model="debitNoteObj.reason"
                                  placeholder="Enter reason for debit note"
                                    class="proposalDialog_date_field2"
                                    solo
                                    dense
                                  rows="2"
                                    :rules="main_rule"
                                ></v-textarea>
                                </template>
                              </CustomInputContainer>
                            </v-col>

                            <v-col cols="6" class="pl-0 py-0">
                              <CustomInputContainer
                                label="Terms"
                                :mandatory="true"
                              >
                                <template v-slot:input>
                                  <div class="d-flex align-center">
                                    <v-btn
                                      text
                                      small
                                      color="primary"
                                      @click="termsDialog = true"
                                      class="mr-2"
                                    >
                                      <span>Terms</span>
                                    </v-btn>
                                    <v-btn
                                      text
                                      small
                                      color="primary"
                                      @click="termsDialog = true"
                                    >
                                      <span>Custom Terms</span>
                                    </v-btn>
                                    <v-select
                                      :items="termsList"
                                      v-model="debitNoteObj.terms"
                                      placeholder="Select Terms"
                                      class="proposalDialog_date_field2"
                                      solo
                                      dense
                                      item-text="name"
                                      item-value="_id"
                                      :loading="loading_terms"
                                      :rules="main_rule"
                                      @change="updateTermsName()"
                                      append-icon="fa-chevron-down"
                                    ></v-select>
                                  </div>
                                </template>
                              </CustomInputContainer>
                            </v-col>

                            <v-col cols="6" class="pl-0 py-0">
                              <CustomInputContainer
                                label="Terms Name"
                                :mandatory="true"
                              >
                                <template v-slot:input>
                                  <v-text-field
                                    v-model="debitNoteObj.terms_name"
                                    placeholder="Terms Name"
                                    class="proposalDialog_date_field2"
                                    solo
                                    dense
                                    readonly
                                  ></v-text-field>
                                </template>
                              </CustomInputContainer>
                            </v-col>

                          <v-col cols="12" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Billing Address"
                            >
                              <template v-slot:input>
                              <v-textarea
                                v-model="debitNoteObj.billing_address"
                                  placeholder="Enter billing address"
                                  class="proposalDialog_date_field2"
                                  solo
                                dense
                                rows="3"
                                ></v-textarea>
                              </template>
                            </CustomInputContainer>
                            </v-col>

                          <v-col cols="12" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Customer Notes"
                            >
                              <template v-slot:input>
                              <v-textarea
                                  v-model="debitNoteObj.customer_notes"
                                  placeholder="Enter customer notes"
                                  class="proposalDialog_date_field2"
                                  solo
                                dense
                                rows="2"
                                ></v-textarea>
                              </template>
                            </CustomInputContainer>
                            </v-col>
                          </v-row>

                          <!-- Action Buttons -->
                          <v-row class="mt-4">
                            <v-col cols="12">
                              <div class="tw-flex tw-justify-end tw-gap-3">
                                <v-btn
                                  v-if="debitNoteSections > 0"
                                  text
                                  @click="goBack()"
                                >
                                  Back
                                </v-btn>
                                <v-btn
                                  v-if="debitNoteSections < steps.length - 1"
                                  color="primary"
                                  @click="nextStep"
                                  :disabled="submitLoading || !canProceed"
                                >
                                  Next
                                </v-btn>
                                <v-btn
                                  v-if="!effectiveDebitNote"
                                  color="primary"
                                outlined
                                  @click="saveAsDraft()"
                                >
                                  Save as Draft
                                </v-btn>
                              </div>
                            </v-col>
                          </v-row>
                        </v-col>
                        </v-form>
                    </v-stepper-content>

                  <!-- Step 2: Items -->
                  <v-stepper-content
                    :step="1"
                    class="tw-overflow-auto"
                    style="max-height: 80vh"
                  >
                    <v-form
                      ref="itemsForm"
                      v-model="itemsValid"
                      lazy-validation
                      class="row"
                    >
                      <v-col cols="12" class="px-0" style="height: fit-content">
                          <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
                            <!-- Currency Information Banner (only show for non-AED currencies) -->
                            <v-alert
                              v-if="debitNoteObj?.currency && debitNoteObj.currency !== 'AED'"
                              type="info"
                              dense
                              outlined
                              class="mb-4"
                            >
                              <div class="d-flex align-center">
                                <!-- <v-icon class="mr-2" color="info">mdi-information</v-icon> -->
                                <div>
                                  <div class="font-weight-medium">Currency Information</div>
                                  <div class="text-caption">
                                    This debit note is being raised in {{ debitNoteObj.currency }}.
                                    All amounts should be entered in {{ debitNoteObj.currency }}.
                                    Exchange rate: 1 {{ debitNoteObj.currency }} = {{ debitNoteObj.conversion_rate }} AED
                                  </div>
                                </div>
                              </div>
                            </v-alert>

                            <!-- <h3 class="text-h6">Debit Note Items</h3> -->
                            <v-btn
                              color="primary"
                              outlined
                              small
                              @click="openAddProductDialog"
                            >
                              <v-icon left small>mdi-plus</v-icon>
                              Add Item
                            </v-btn>
                          </div>

                          <v-simple-table
                            class="elevation-1"
                            style="border-radius: 8px"
                          >
                            <template v-slot:default>
                              <thead>
                                <tr>
                                  <th
                                    class="text-center text--text font-weight-bold"
                                    style="
                                      font-size: 12px !important;
                                      font-weight: 500;
                                      width: 5%;
                                    "
                                  >
                                    #
                                  </th>
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
                                v-for="(item, index) in Array.isArray(
                                  debitNoteObj.items
                                )
                                  ? debitNoteObj.items
                                  : []"
                                :key="index"
                              >
                                <tr
                                  class="dynamic_table_body_rows"
                                  style="
                                    border-bottom: 0.5 solid red !important;
                                  "
                                >
                                  <td
                                    class="py-2 text-center"
                                    style="width: 5%"
                                  >
                                    {{ index + 1 }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{ item.service_name || 'Service' }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{ item.description }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{ item.rate | currencyFormatter(debitNoteObj?.currency || 'AED') }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{ item.amount | currencyFormatter(debitNoteObj?.currency || 'AED') }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{ item.quantity }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{ item.tax_name }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{ item.vat_rate }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{
                                      item?.vat_amount ??
                                      0.0 | currencyFormatter(debitNoteObj?.currency || 'AED')
                                    }}
                                  </td>
                                  <td class="py-2 text-center">
                                    {{
                                      item?.net_total ??
                                      0.0 | currencyFormatter(debitNoteObj?.currency || 'AED')
                                    }}
                                  </td>
                                  <td class="py-2 text-center">
                                    <div
                                      class="tw-flex tw-gap-5 tw-items-center"
                                    >
                                <v-btn
                                  icon
                                        color="error"
                                        class="mx-3 text-center"
                                        @click="removeItem(index)"
                                      >
                                        <v-icon class="" color="error" x-small
                                          >fa-light fa-trash-can</v-icon
                                        >
                                </v-btn>

                                <v-btn
                                  icon
                                  color="error"
                                        class="mx-3 text-center"
                                        @click="editItem(index)"
                                      >
                                        <v-icon
                                          class=""
                                          color="primary"
                                          x-small
                                          >mdi-tag-edit</v-icon
                                        >
                                </v-btn>
                              </div>
                                  </td>
                                </tr>
                              </tbody>
                            </template>
                          </v-simple-table>

                          <!-- Note: Debit notes are allowed to exceed invoice balance as they increase the amount owed -->

                          <!-- Summary Section -->
                          <v-row class="mt-4">
                            <v-col cols="12">

                            <div class="estimate__container">
                              <div class="flex_column">
                                <span class="text--text font-weight-bold pb-2"
                                  >Sub Total</span
                                >
                                <span class="text--text font-weight-bold pb-2"
                                  >Discount</span
                                >
                                <span class="text--text font-weight-bold pb-2"
                                  >VAT Amount</span
                                >
                                <span class="text--text font-weight-bold"
                                  >Total</span
                                >
                                <!-- AED Equivalent (only show for non-AED currencies) -->
                                <span
                                  v-if="debitNoteObj?.currency && debitNoteObj.currency !== 'AED'"
                                  class="text--text font-weight-bold"
                                  >AED Equivalent</span
                                >
                              </div>
                              <div class="flex_column">
                                <span class="text--text font-weight-bold mb-2"
                                  >{{ debitNoteObj?.currency || 'AED' }}
                                  {{ computedSubTotal | twoDecimals }}</span
                                >
                                <span class="text--text font-weight-bold mb-2"
                                  >{{ debitNoteObj?.currency || 'AED' }} {{ 0 | twoDecimals }}</span
                                >
                                <span class="text--text font-weight-bold mb-2"
                                  >{{ debitNoteObj?.currency || 'AED' }}
                                  {{ computedVATAmount | twoDecimals }}</span
                                >
                                <span
                                  class="font-weight-bold text--text"
                                >{{ debitNoteObj?.currency || 'AED' }} {{ computedTotal | twoDecimals }}</span
                                >
                                <!-- AED Equivalent (only show for non-AED currencies) -->
                                <span
                                  v-if="debitNoteObj?.currency && debitNoteObj.currency !== 'AED'"
                                  class="text--text font-weight-bold"
                                >AED {{ debitNoteObj?.converted_amount_aed | twoDecimals }}</span
                                >
                                </div>
                              </div>
                                  </v-col>
                                </v-row>

                          <!-- Action Buttons for Step 2 -->
                          <v-row class="mt-4">
                            <v-col cols="12">
                              <div class="tw-flex tw-justify-end tw-gap-3">
                                <v-btn
                                  v-if="debitNoteSections > 0"
                                  text
                                  @click="goBack()"
                                >
                                  Back
                                </v-btn>
                                <v-btn
                                  v-if="!effectiveDebitNote"
                                  color="primary"
                                  outlined
                                  @click="saveAsDraft()"
                                >
                                  Save as Draft
                                </v-btn>
                                <v-btn
                                  color="primary"
                                  :loading="submitLoading"
                                  :disabled="
                                    submitLoading ||
                                    !(
                                      Array.isArray(debitNoteObj.items) &&
                                      debitNoteObj.items.length
                                    )
                                  "
                                  @click="createDebitNote"
                                >
                                  Update Debit Note
                                </v-btn>
                              </div>
                                  </v-col>
                                </v-row>
                            </v-col>
                        </v-form>
                    </v-stepper-content>
                </v-stepper-items>
              </v-stepper>
            </v-col>

            <!-- Right Column: Preview -->
            <v-col cols="6">
              <v-card
                class="preview-card d-flex flex-column fill-height"
                elevation="2"
                rounded="lg"
                :style="previewCardStyle"
              >
                <v-card-title
                  class="preview-header px-4 py-3"
                  :style="previewHeaderStyle"
                >
                  <v-img
                    src="/header/debit-note.svg"
                    max-width="20"
                    height="20"
                    contain
                    class="mr-3"
                    style="filter: brightness(0) invert(1)"
                  />
                  <span
                    class="font-weight-medium text-subtitle-1"
                    style="color: white"
                    >Debit Note Preview</span
                  >
                </v-card-title>
                <v-divider />
                <v-card-text
                  class="preview-container flex-grow-1 pa-0"
                  :style="previewContainerStyle"
                >
                  <div
                    v-if="previewLoading"
                    class="d-flex flex-column align-center justify-center fill-height"
                  >
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="48"
                      class="mb-4"
                    ></v-progress-circular>
                    <p class="text--primary font-weight-medium">
                      Loading Preview...
                    </p>
                  </div>

                  <div
                    v-else-if="!debitNote || !debitNote._id"
                    class="d-flex flex-column align-center justify-center fill-height"
                  >
                    <v-icon size="64" color="grey lighten-1" class="mb-4"
                      >mdi-file-document-outline</v-icon
                    >
                    <p class="text--primary font-weight-medium">
                      Debit Note Preview
                    </p>
                    <p class="text--secondary text-caption">
                      Complete the form to see a live preview of your debit note
                    </p>
                  </div>

                  <div v-else class="fill-height">
                    <DebitNotePreview :key="randomKey" :debit_id="debitNote._id" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <v-divider />
        <v-card-actions class="tw-px-6 tw-py-4 tw-bg-gray-50">
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Product/Service Dialog -->
    <v-dialog v-model="add_product.show" max-width="700px" persistent>
      <v-card class="rounded-xl pa-0 pt-0" flat min-height="400">
        <v-form ref="productForm" v-model="validProduct" lazy-validation>
          <v-row class="tw-py-3 tx-pr-3">
            <v-card-title class="py-0">
              <v-img
                src="/shift/build.svg"
                max-width="fit-content"
                height="fit-content"
                class="mr-2"
                contain
              ></v-img>
              <span
                class="darkBlue-heading-text font-weight-normal subHeadingFontSize"
              >
                {{ add_product.update ? 'Edit Debit Note Item' : 'Add New Debit Note Item' }}</span
              >
            </v-card-title>
            <v-spacer />
            <v-btn
              @click="closeInvoiceProductDialog"
              outlined
              icon
              color="red accent-4"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="tw-px-6 tw-py-10">
            <v-row>
              <v-col cols="12">
                <CustomInputContainer label="Select Service" :mandatory="true">
                  <div slot="input">
                    <v-autocomplete
                      :items="computedServices"
                      v-model="invoiceProduct.service_name"
                      placeholder="Search and select service..."
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      item-text="name"
                      item-value="name"
                      :rules="main_rule"
                      :loading="isLoading"
                      :disabled="isLoading"
                      clearable
                      no-data-text="No services found"
                      @click="handleServiceDropdownClick"
                      @change="onServiceChange"
                    >
                      <template v-slot:item="{ item }">
                        <v-list-item-content>
                          <v-list-item-title>{{ item.name }}</v-list-item-title>
                          <v-list-item-subtitle v-if="item.description">{{ item.description }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                    </v-autocomplete>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6" v-if="shouldShowEmployeeDropdown">
                <CustomInputContainer label="Select Employee" :mandatory="true">
                  <template v-slot:input>
                    <v-autocomplete
                      :items="computedEmployees"
                      v-model="selected_employees"
                      placeholder="Search and select employee..."
                      class="proposalDialog_date_field2"
                      solo
                      dense
                      item-text="full_name"
                      item-value="_id"
                      :rules="employeeSelectionRules"
                      :loading="loading_employees"
                      :disabled="loading_employees || isAdminFeeService"
                      @input="onEmployeeSelectionChange"
                      :multiple="!add_product.update"
                      clearable
                      no-data-text="No employees found"
                    >
                      <template v-slot:item="{ item }">
                        <v-list-item-content>
                          <v-list-item-title>{{
                            item.full_name
                          }}</v-list-item-title>
                          <v-list-item-subtitle v-if="item.email">{{ item.email }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </template>
                    </v-autocomplete>
                  </template>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="Enter Rate" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      placeholder="0.00"
                      outlined
                      hide-details
                      dense
                      v-model="invoiceProduct.rate"
                      :rules="numberRules"
                      @input="assignAmountValue(invoiceProduct.rate)"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Quantity" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      outlined
                      hide-details
                      dense
                      v-model="invoiceProduct.quantity"
                      :rules="numberRules"
                      @input="calculateAmount"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="invoiceProduct.amount"
                  label="Amount (AED)"
                  type="number"
                  step="0.01"
                  outlined
                  dense
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="invoiceProduct.tax_code"
                  :items="taxCodesList"
                  item-text="code"
                  item-value="_id"
                  label="Tax Code"
                  outlined
                  dense
                  :rules="main_rule"
                  @change="getTaxRateForModal(invoiceProduct.tax_code)"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="VAT Rate %">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      placeholder="0.00"
                      outlined
                      hide-details
                      dense
                      disabled
                      v-model="invoiceProduct.vat_rate"
                      @input="calculateVatAndNet"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="VAT Amount">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      placeholder="0.00"
                      outlined
                      hide-details
                      dense
                      readonly
                      v-model="invoiceProduct.vat_amount"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <CustomInputContainer label="Net Total">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      type="number"
                      placeholder="0.00"
                      outlined
                      hide-details
                      dense
                      readonly
                      v-model="invoiceProduct.net_total"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <CustomInputContainer label="Description" :mandatory="true">
                  <div slot="input">
                    <v-textarea
                      class="rounded-lg"
                      placeholder="Enter description"
                      outlined
                      hide-details
                      dense
                      rows="3"
                      v-model="invoiceProduct.description"
                      :rules="main_rule"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            @click="closeInvoiceProductDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!validProduct"
            @click="saveInvoiceProduct"
          >
            {{ add_product.update ? 'Update' : 'Add' }} Item
          </v-btn>
        </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Terms Dialog -->
    <DialogsAddCustomTerms
      v-if="termsDialog"
      :open="termsDialog"
      @reload="reloadTerms()"
      @close="termsDialog = false"
    />

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar_data.snackbar"
      :color="snackbar_data.color"
      :timeout="snackbar_data.timeout"
    >
      {{ snackbar_data.text }}
    </v-snackbar>
  </div>
</template>

<script>
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'DebitNoteDialog',
  components: {
    DebitNotePreview: () => import('@/components/Billings/DebitNotePreview.vue'),
    CustomInputContainer: () => { if (process.client) { return import('@/components/utils/CustomInputContainer.vue') } },
    DialogsAddCustomTerms: () => { if (process.client) { return import('@/components/Dialogs/AddCustomTerms.vue') } }
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    originalInvoice: {
      type: Object,
      default: null
    },
    debitNoteToEdit: {
      type: Object,
      default: null
    },
    viewMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      debitNoteSections: 0,
      steps: ['Debit Note Details', 'Items'],
      detailsValid: false,
      itemsValid: false,
      submitLoading: false,
      loading_download_url: false,
      setupPreviewInProgress: false,
      previewSetupSuccess: false,
      first_load: true, // Prevent API calls during initial setup
      debit_note_date_menu: false,
      randomKey: 1001,
      due_date_menu: false,
      main_rule: [(v) => !!v || 'This field is required'],
      snackbar_data: {
        snackbar: false,
        text: '',
        color: '',
        timeout: 2000,
      },
      debitNoteObj: {
        customer: '',
        customer_name: '',
        original_invoice_number: '',
        debit_note_number: '',
        debit_date: '',
        due_date: '',
        reason: '',
        customer_notes: '',
        visa_sponsor: 'Dynamic Employment Services',
        email: '',
        terms: '',
        terms_name: '',
        billing_address: '',
        items: [
          {
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            vat_rate: '0',
            vat_amount: 0,
            net_total: 0,
          },
        ],
        total: 0,
        sub_total: 0,
        vat_total: 0,
      },
      debitNote: null,
      employers: [],
      loading_employers: false,
      visa_sponsorships: [
        'Executive Employment Services',
        'Dynamic Employment Services',
        'Other'
      ],
      termsList: [],
      loading_terms: false,
      termsDialog: false,
      taxCodesList: [],
      loading_tax_codes: false,
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
      add_product: {
        show: false,
        update: false,
        index: null,
      },
      validProduct: false,
      invoiceProduct: {
        id: '',
        service: '',
        service_name: '',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        discount: 0,
        tax_name: '',
        tax_code: '',
        vat_rate: 0,
        vat_amount: 0,
        net_total: 0,
        type: 'Service',
        date: new Date().toISOString().substr(0, 10),
        isInventory: 'false',
        city: 'Dubai',
      },
      selected_employees: [],
      employees: [],
      loading_employees: false,
      productsAndServices: [],
      isLoading: false,
      isInitialized: false,
      preventWatcherLoop: false,
      previewLoading: false,
      previewContent: null,
    }
  },
  computed: {
    effectiveDebitNote() {
      return this.debitNoteToEdit && this.debitNoteToEdit._id
    },
    passedDebitNote() {
      return this.debitNoteToEdit
    },
    showEmployeeDropdown() {
      // Show employee dropdown if not in update mode and service is not Admin Fee
      return !this.add_product.update && !this.isAdminFeeService
    },
    isAdminFeeService() {
  const serviceName = this.invoiceProduct.service_name?.toLowerCase() || ''
      return serviceName === 'admin fee'
    },
    computedEmployees() {
      if (!Array.isArray(this.employees)) {
        return []
      }
      return this.employees.map((el) => {
        return {
          _id: el?._id,
          full_name: `${el?.first_name} ${el?.last_name}`,
          email: el?.email,
          salary: el?.salary,
        }
      })
    },
    computedServices() {
      if (
        !this.productsAndServices ||
        !Array.isArray(this.productsAndServices)
      ) {
        console.warn(
          'productsAndServices is not properly initialized:',
          this.productsAndServices
        )
        return []
      }

      const services = this.productsAndServices
        .map((service) => {
          if (!service || !service.name) {
            console.warn(
              'Invalid service object in productsAndServices:',
              service
            )
            return null
          }

          return {
            name: service.name,
            description: service.description || '',
            _id: service._id || service.name,
          }
        })
        .filter(Boolean) // Remove null entries

      return services
    },
    shouldShowEmployeeDropdown() {
      // Show employee dropdown if not in update mode and service is not Admin Fee
      return !this.add_product.update && !this.isAdminFeeService
    },
    employeeSelectionRules() {
      // Make employee selection mandatory only if it's an employee service
      if (this.isAdminFeeService) {
        return []
      }
      return this.shouldShowEmployeeDropdown ? this.main_rule : []
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
    previewCardStyle() {
      return {
        height: '100%',
        minHeight: '75vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }
    },
    previewHeaderStyle() {
      return {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
      }
    },
    previewContainerStyle() {
      return {
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexGrow: 1,
        padding: 0,
      }
    },
    canProceed() {
      if (this.debitNoteSections === 0) {
        // Step 0: Debit Note Details - ensure all required fields are filled
        const hasRequiredFields = !!(
          this.debitNoteObj.customer &&
          this.debitNoteObj.debit_date &&
          this.debitNoteObj.reason &&
          this.debitNoteObj.email
        )
        return hasRequiredFields && this.detailsValid
      } else if (this.debitNoteSections === 1) {
        // Step 1: Items - ensure items exist and are valid
        const hasValidItems = this.itemsValid && this.debitNoteObj.items.length > 0
        return hasValidItems
      }
      return false
    },
    computedSubTotal() {
      let total = 0
      if (
        this.debitNoteObj &&
        Array.isArray(this.debitNoteObj.items) &&
        this.debitNoteObj.items.length
      ) {
        for (let i = 0; i < this.debitNoteObj.items.length; i++) {
          const item = this.debitNoteObj.items[i]
          const amount = parseFloat(item.amount)
          if (!isNaN(amount)) {
            total += amount
          }
        }
      }
      return parseFloat(total.toFixed(2))
    },
    computedVATAmount() {
      let total = 0
      if (
        this.debitNoteObj &&
        Array.isArray(this.debitNoteObj.items) &&
        this.debitNoteObj.items.length
      ) {
        for (let i = 0; i < this.debitNoteObj.items.length; i++) {
          const item = this.debitNoteObj.items[i]
          const vatAmount = parseFloat(item.vat_amount)
          if (!isNaN(vatAmount)) {
            total += vatAmount
          }
        }
      }
      return parseFloat(total.toFixed(2))
    },
    computedTotal() {
      const subTotal = this.computedSubTotal
      const vatAmount = this.computedVATAmount
      // Round final total to 2 decimal places
      return parseFloat((subTotal + vatAmount).toFixed(2))
    }
  },
  watch: {
    async show(newVal) {
      console.log('Show prop changed to:', newVal)
      if (newVal) {
        if (!this.isInitialized) {
          console.log('Show is true, initializing debit note from watcher...')
          await this.initializeDebitNote()
        } else {
          // If already initialized, just ensure the preview is showing
          this.$nextTick(() => this.triggerDebitNotePreview())
        }
      }
    },
    debitNote(val) {
      // Update local debitNoteObj when debitNote is set from API response
      if (val) {
        console.log('DebitNote watcher triggered, updating debitNoteObj with source flag')
        this.$set(this, 'debitNoteObj', { source: true, ...val })

        // Format dates properly
        if (val.debit_date) {
          this.debitNoteObj.debit_date = this.formatDate(val.debit_date)
        }
        if (val.due_date) {
          this.debitNoteObj.due_date = this.formatDate(val.due_date)
        }

        // Reset source flag after update is complete
        this.$nextTick(() => {
          this.debitNoteObj.source = false
        })
      }
    },
    originalInvoice: {
      handler(newVal) {
        if (newVal && newVal.invoice_number) {
          this.debitNoteObj.original_invoice_number = newVal.invoice_number
        }
      },
      immediate: true,
    },
    'debitNoteObj.customer'() {
      this.validateDetails()
      this.changeCompany()
    },
    'debitNoteObj.debit_date'() {
      this.validateDetails()
    },
    'debitNoteObj.reason'() {
      this.validateDetails()
    },
    'debitNoteObj.terms'() {
      this.updateTermsName()
      this.validateDetails()
    },
    'debitNoteObj.items': {
      handler() {
        console.log('debitNoteObj.items changed, first_load:', this.first_load)
        this.validateItems()
        // Only update preview if not during initial load and user made the change
        if (!this.first_load && !this.debitNoteObj.source) {
          console.log('Items changed by user, calling debounced update')
          this.debounceUpdate()
        }
      },
      deep: true,
    },
    'invoiceProduct.service_name'(newService, oldService) {
      console.log('Service name changed from:', oldService, 'to:', newService)

      // Prevent infinite loops
      if (this.preventWatcherLoop) {
        return
      }

      if (newService && newService !== oldService && !this.add_product.update) {
        // Handle switching between Admin Fee and Employee service
        const oldServiceLower = oldService?.toLowerCase() || ''
        const newServiceLower = newService?.toLowerCase() || ''

        // When switching from Admin Fee to another service, reset the rate
        if (oldServiceLower === 'admin fee' && newServiceLower !== 'admin fee') {
          console.log('🔥 Switching from Admin Fee to another service, resetting rate')
          this.invoiceProduct.rate = 0
          this.assignAmountValue(0)
        }

        // When switching to Admin Fee, clear any selected employees
        if (newServiceLower === 'admin fee' && this.selected_employees.length > 0) {
          console.log('🔥 Switching to Admin Fee, clearing selected employees')
          this.preventWatcherLoop = true
          this.selected_employees = []
          this.$nextTick(() => {
            this.preventWatcherLoop = false
          })
        }

        // Set the appropriate rate based on the new service
        this.setAdminFee()

        // Update preview after service change - only if not during initial load
        if (!this.first_load && !this.debitNoteObj.source) {
          console.log('Service changed by user, calling debounced update')
          this.debounceUpdate()
        }
      }
    },
    selected_employees(newEmployeeIds, oldEmployeeIds) {
      console.log('🔥 Selected employees changed:', newEmployeeIds)

      // Prevent infinite loops
      if (this.preventWatcherLoop) {
        return
      }

      if (!this.add_product.update) {
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
              const totalFixed = parseFloat(employee.salary.total_fixed) || 0
              const totalVariable = parseFloat(employee.salary.total_variable) || 0
              const totalSalary = totalFixed + totalVariable
              salaryToDeduct += totalSalary
              console.log(`🔥 Deducting salary for ${employee.first_name} ${employee.last_name}: ${totalSalary}`)
            }
          }

          console.log('🔥 Total salary to deduct:', salaryToDeduct)

          // If no employees are left, reset everything
          if (newEmployeeIds.length === 0) {
            console.log('🔥 No employees left, resetting rate and description')
            this.invoiceProduct.rate = 0
            this.invoiceProduct.description = ''

            // Check if we should revert back to Admin Fee service
            const adminFeeService = this.productsAndServices.find(
              service => service.name.toLowerCase() === 'admin fee'
            )

            if (adminFeeService) {
              console.log('🔥 Switching back to Admin Fee service since no employees are selected')
              this.preventWatcherLoop = true
              this.invoiceProduct.service_name = adminFeeService.name
              this.invoiceProduct.service = adminFeeService.name
              this.$nextTick(() => {
                this.preventWatcherLoop = false
                this.setAdminFee()
              })
            } else {
              // Recalculate all amounts with zero rate
              this.assignAmountValue(0)
            }
            console.log('🔥 Reset calculations after all employees removed - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
          }
          // Only adjust rate if there are still employees selected
          else if (newEmployeeIds.length > 0) {
            // Deduct the salary from the current rate
            const newRate = Math.max(0, parseFloat(this.invoiceProduct.rate || 0) - salaryToDeduct)
            console.log(`🔥 Adjusting rate: ${this.invoiceProduct.rate} - ${salaryToDeduct} = ${newRate}`)
            this.invoiceProduct.rate = newRate

            // Update description if needed
            this.updateEmployeeDescription(newEmployeeIds)

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
              this.preventWatcherLoop = true
              this.invoiceProduct.service_name = employeeService.name
              this.invoiceProduct.service = employeeService.name
              this.$nextTick(() => {
                this.preventWatcherLoop = false
              })
            }
          }

          // Calculate employee salaries and update rate
          this.calculateEmployeeSalariesAndUpdate(newEmployeeIds)
        } else {
          console.log('🔥 No employees selected, rate unchanged')
        }

        // Update preview after employee change - only if not during initial load
        if (!this.first_load && !this.debitNoteObj.source) {
          console.log('Employees changed by user, calling debounced update')
          this.debounceUpdate()
        }
      }
    },
    // Watch rate in edit mode to recalculate VAT/amount/net total
    'invoiceProduct.rate'(newRate, oldRate) {
      if (this.add_product.update) {
        this.assignAmountValue(newRate)
      }
    },
  },
  methods: {
    // Helper method to copy invoice items to debit note format
    copyInvoiceItemsToDebitNote() {
      if (!this.originalInvoice?.items || !Array.isArray(this.originalInvoice.items)) {
        return []
      }

      return this.originalInvoice.items.map(item => ({
        description: item.description || item.service_name || '',
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.rate) || 0,
        amount: parseFloat(item.amount) || 0,
        vat_rate: item.vat_rate || '0',
        vat_amount: parseFloat(item.vat_amount) || 0,
        net_total: parseFloat(item.net_total) || 0,
      }))
    },

    async initializeDebitNote() {
      console.log('=== INITIALIZING DEBIT NOTE ===')
      console.log('effectiveDebitNote:', this.effectiveDebitNote)
      console.log('debitNoteToEdit:', this.debitNoteToEdit)
      console.log('passedDebitNote:', this.passedDebitNote)

      // Prevent duplicate initialization
      if (this.isInitialized) {
        console.log('Already initialized, skipping...')
        return
      }

      // Check if we already have a debit note to edit
      if (this.effectiveDebitNote) {
        console.log('Using existing debit note for editing')
        console.log('effectiveDebitNote is true, calling loadExistingDebitNote')
        await this.loadExistingDebitNote()
        return
      } else {
        console.log('effectiveDebitNote is false, not loading existing debit note')
      }

      // For new debit notes, check if there's already a draft for this invoice
      if (this.originalInvoice?._id) {
        const existingDraft = await this.checkForExistingDraft(this.originalInvoice._id)
        if (existingDraft) {
          console.log('Found existing draft debit note, loading it instead of creating new')
          this.debitNote = existingDraft
          this.populateDebitNoteFromDraft(existingDraft)
          // Mark as initialized to prevent further setup
          this.isInitialized = true
          return
        }
      }

      // Initialize new debit note
      this.debitNoteSections = 0
      this.debitNoteObj = {
        customer: typeof this.originalInvoice?.customer === 'object'
          ? this.originalInvoice.customer._id || this.originalInvoice.customer.id
          : this.originalInvoice?.customer || '',
        customer_name: this.originalInvoice?.customer_name || '',
        original_invoice_number: this.originalInvoice?.invoice_number || '',
        debit_note_number: '',
        debit_date: moment().format('YYYY-MM-DD'),
        due_date: moment().add(30, 'days').format('YYYY-MM-DD'),
        reason: '',
        customer_notes: this.originalInvoice?.customer_notes || '',
        visa_sponsor: this.originalInvoice?.visa_sponsor || 'Dynamic Employment Services',
        email: this.originalInvoice?.email || '',
        terms: this.originalInvoice?.terms || '',
        terms_name: this.originalInvoice?.terms_name || '',
        billing_address: this.originalInvoice?.billing_address || '',
        company: typeof this.originalInvoice?.customer === 'object'
          ? this.originalInvoice.customer._id || this.originalInvoice.customer.id
          : this.originalInvoice?.customer || '',
        invoice: this.originalInvoice?._id || '',
        items: this.copyInvoiceItemsToDebitNote(),
        total: 0,
        sub_total: 0,
        vat_total: 0,
        // Currency fields inherited from original invoice
        currency: this.originalInvoice?.currency || 'AED',
        conversion_rate: this.originalInvoice?.conversion_rate || 1.0,
        base_currency: this.originalInvoice?.base_currency || 'AED',
        converted_amount_aed: 0, // Will be calculated when totals are computed
      }
      this.debitNote = null
      console.log('Calling generateDebitNoteNumber...')
      this.generateDebitNoteNumber()

      // Get employers list
      await this.getEmployersList()

      // Mark as initialized first to prevent race conditions
      this.isInitialized = true

      // Only setup preview if we don't have a debit note yet (for new debit notes only)
      // Don't create new debit note if we're supposed to be loading an existing draft
      // Add additional guards to prevent race conditions
      if (this.debitNoteObj.customer &&
          !this.debitNote &&
          !this.effectiveDebitNote &&
          !this.setupPreviewInProgress &&
          !this.previewSetupSuccess) {
        console.log('initializeDebitNote: Setting up preview (first time only)')
        await this.setupDebitNotePreview()
      } else {
        console.log('initializeDebitNote: Skipping preview setup - already initialized or in progress')
      }

      // Set first_load to false after initialization to allow watchers to function
      this.first_load = false
    },

    async generateDebitNoteNumber() {
      try {
        console.log('Generating debit note number...')
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$post(
          '/debit/notes/generate-number',
          {},
          {
            headers: { Authorization: AuthStr },
          }
        )
        console.log('Debit note number response:', response)
        if (response && response.debit_note_number) {
          this.debitNoteObj.debit_note_number = response.debit_note_number
          console.log(
            'Debit note number set to:',
            this.debitNoteObj.debit_note_number
          )
        } else {
          console.warn('No debit note number in response:', response)
        }
      } catch (error) {
        console.error('Error generating debit note number:', error)
        this.showSnackbar('Failed to generate debit note number', 'error')
      }
    },

    async getEmployersList() {
      try {
        this.loading_employers = true
        const response = await this.$axios.$post(
          `/companies/list/filter/search?page=1&limit=100000`,
          { search: '', isInvoiceFilter: true }
        )
        this.employers = response || []
      } catch (error) {
        console.error('Error fetching employers list:', error)
        this.showSnackbar('Failed to load employers', 'error')
      } finally {
        this.loading_employers = false
      }
    },

    async getTermsList() {
      try {
        this.loading_terms = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get('/terms', {
          headers: { Authorization: AuthStr },
        })
        this.termsList = response || []
      } catch (error) {
        console.error('Error fetching terms:', error)
        this.showSnackbar('Failed to load terms', 'error')
      } finally {
        this.loading_terms = false
      }
    },

    onCustomerChange() {
      const selectedCustomer = this.employers.find(emp => emp._id === this.debitNoteObj.customer)
      if (selectedCustomer) {
        this.debitNoteObj.customer_name = selectedCustomer.company_name
        this.debitNoteObj.email = selectedCustomer.email || ''
        this.debitNoteObj.billing_address = selectedCustomer.billing_address?.address_line1 || ''
      }
      this.validateDetails()
    },

    onTermsChange() {
      this.updateTermsName()
      this.validateDetails()
    },



    addNewItem() {
      this.debitNoteObj.items.push({
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        vat_rate: '0',
        vat_amount: 0,
        net_total: 0,
      })
    },

    removeItem(index) {
      this.debitNoteObj.items.splice(index, 1)
      this.calculateTotals()
    },

    updateItem(index) {
      const item = this.debitNoteObj.items[index]
      if (item) {
        item.amount = item.quantity * item.rate
        item.vat_amount = (item.amount * parseFloat(item.vat_rate)) / 100
        item.net_total = item.amount + item.vat_amount
        this.calculateTotals()
      }
    },


    validateDetails() {
      this.detailsValid = !!(
        this.debitNoteObj.customer &&
        this.debitNoteObj.debit_date &&
        this.debitNoteObj.reason &&
        this.debitNoteObj.email
      )

      // Only setup preview if we don't have a debit note yet and we're not already initializing
      // Don't create new debit note if we're supposed to be loading an existing draft
      // Add additional guards to prevent race conditions
      if (this.debitNoteObj.customer &&
          !this.debitNote &&
          !this.isInitialized &&
          !this.effectiveDebitNote &&
          !this.setupPreviewInProgress &&
          !this.previewSetupSuccess) {
        console.log('validateDetails: Setting up preview (first time only)')
        this.setupDebitNotePreview()
      } else {
        console.log('validateDetails: Skipping preview setup - already initialized or in progress')
      }
    },

    validateItems() {
      this.itemsValid = this.debitNoteObj.items.length > 0 &&
        this.debitNoteObj.items.every(item =>
          item.description &&
          item.quantity > 0 &&
          item.rate > 0
        )
    },



    getTermsNameById(termsId) {
      if (!termsId || !this.termsList.length) return ''
      const term = this.termsList.find(t => t._id === termsId)
      return term ? term.name : ''
    },

    async updateDebitNoteAndPreview() {
      console.log('updateDebitNoteAndPreview called')
      if (this.debitNote?._id) {
        try {
          await this.updateDebitNote()
          this.$nextTick(() => {
            this.triggerDebitNotePreview()
          })
        } catch (error) {
          console.error('Error updating debit note and preview:', error)
        }
      }
    },

    async updateDebitNote() {
      if (!this.debitNote) return

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.$put(
          `/debit/notes/update/${this.debitNote._id}`,
          this.debitNoteObj,
          {
            headers: { Authorization: AuthStr },
          }
        )

        if (response) {
          this.debitNote = response
        }
      } catch (error) {
        console.error('Error updating debit note:', error)
      }
    },

    async getOrCreateDebitNote() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$post(
          `/debit/notes/setup-preview`,
          {
            ...this.debitNoteObj,
            invoice_id: this.originalInvoice?._id,
            // Ensure all required fields are present
            due_date: this.debitNoteObj.due_date,
            debit_note_date: this.debitNoteObj.debit_date,
            terms: this.debitNoteObj.terms,
            terms_name: this.debitNoteObj.terms_name || this.getTermsNameById(this.debitNoteObj.terms),
            email: this.debitNoteObj.email,
            company: this.debitNoteObj.customer, // Use customer as company
            invoice: this.originalInvoice?._id,
          },
          {
            headers: { Authorization: AuthStr },
          }
        )
        console.log('Setting up debit note preview: ', response)
        this.debitNote = response
        this.previewSetupSuccess = true
        return response
      } catch (error) {
        console.error('Error setting up debit note preview: ', error.message)
        this.previewSetupSuccess = false
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to setup debit note preview. Some features may be limited.',
          type: 'warning'
        })
        // Don't break the flow - allow user to continue with limited functionality
        return null
      }
    },

    async setupDebitNotePreview() {
      // Prevent multiple simultaneous calls
      if (this.setupPreviewInProgress) {
        console.log('Setup preview already in progress, skipping...')
        return
      }

      // Additional guards to prevent duplicate creation
      if (this.previewSetupSuccess) {
        console.log('Preview already setup successfully, skipping...')
        return
      }

      if (this.debitNote && this.debitNote._id) {
        console.log('Debit note already exists, skipping preview setup...')
        return
      }

      if (
        this.debitNoteObj.customer &&
        this.debitNoteObj.debit_note_number
      ) {
        try {
          this.setupPreviewInProgress = true
          this.previewLoading = true

          console.log('Setting up debit note preview for the first time...')
          const response = await this.getOrCreateDebitNote()
          if (response && response._id) {
            console.log('Debit note preview setup successful:', response._id)
            this.previewSetupSuccess = true
          }
        } catch (error) {
          console.error('Error setting up debit note preview:', error)
          this.previewSetupSuccess = false
        } finally {
          this.setupPreviewInProgress = false
          this.previewLoading = false
        }
      }
    },

    getTermsNameById(termsId) {
      if (!termsId || !this.termsList.length) return ''
      const term = this.termsList.find(t => t._id === termsId)
      return term ? term.name : ''
    },

    getTaxRateForModal(taxCodeId) {
      if (!taxCodeId) return

      const selectedTax = this.taxCodesList.find((tax) => tax._id === taxCodeId)
      if (selectedTax) {
        this.invoiceProduct.tax_name = selectedTax.name || ''
        this.invoiceProduct.vat_rate = selectedTax.rate || 0

        // Use nextTick to ensure VAT rate is set before recalculating
        this.$nextTick(() => {
          this.calculateVatAndNet()
        })
      }
    },

    calculateVatAndNet() {
      const amount = parseFloat(this.invoiceProduct.amount) || 0
      const vatRate = parseFloat(this.invoiceProduct.vat_rate) || 0

      // Calculate VAT amount and round to 2 decimal places
      const rawVatAmount = (amount * vatRate) / 100
      this.invoiceProduct.vat_amount = parseFloat(rawVatAmount.toFixed(2))

      // Calculate net total and round to 2 decimal places
      const rawNetTotal = amount + this.invoiceProduct.vat_amount
      this.invoiceProduct.net_total = parseFloat(rawNetTotal.toFixed(2))
    },

    assignAmountValue(rate) {
      // Ensure rate is a valid number before calculation
      const safeRate = isNaN(parseFloat(rate)) ? 0 : parseFloat(rate)
      const quantity = isNaN(parseFloat(this.invoiceProduct.quantity)) ? 1 : parseFloat(this.invoiceProduct.quantity)

      // Calculate amount (rate * quantity) and round to 2 decimal places
      const rawAmount = safeRate * quantity
      this.invoiceProduct.amount = parseFloat(rawAmount.toFixed(2))

      // Calculate VAT amount and round to 2 decimal places
      const vatRate = parseFloat(this.invoiceProduct.vat_rate) || 0
      const rawVatAmount = (this.invoiceProduct.amount * vatRate) / 100
      this.invoiceProduct.vat_amount = parseFloat(rawVatAmount.toFixed(2))

      // Calculate net total and round to 2 decimal places
      const rawNetTotal = this.invoiceProduct.amount + this.invoiceProduct.vat_amount
      this.invoiceProduct.net_total = parseFloat(rawNetTotal.toFixed(2))
    },

    calculateAmount() {
      const rate = parseFloat(this.invoiceProduct.rate) || 0
      const quantity = parseFloat(this.invoiceProduct.quantity) || 1

      // Calculate amount and round to 2 decimal places
      const rawAmount = rate * quantity
      this.invoiceProduct.amount = parseFloat(rawAmount.toFixed(2))

      this.calculateVatAndNet()
    },

    calculateTotals() {
      let subTotal = 0
      let vatTotal = 0

      // Always use debitNoteObj.items as the source of truth for calculations
      const items = this.debitNoteObj?.items || []

      console.log('calculateTotals - items:', items)

      items.forEach((item) => {
        const amount = parseFloat(item.amount) || 0
        const vatAmount = parseFloat(item.vat_amount) || 0
        subTotal += amount
        vatTotal += vatAmount
      })

      // Round totals to 2 decimal places for consistency
      this.debitNoteObj.sub_total = parseFloat(subTotal.toFixed(2))
      this.debitNoteObj.vat_total = parseFloat(vatTotal.toFixed(2))
      this.debitNoteObj.total = parseFloat((this.debitNoteObj.sub_total + this.debitNoteObj.vat_total).toFixed(2))

      // Calculate converted amount to AED for reporting
      const conversionRate = this.debitNoteObj.conversion_rate || 1.0
      this.debitNoteObj.converted_amount_aed = parseFloat((this.debitNoteObj.total * conversionRate).toFixed(2))

      console.log('calculateTotals - sub_total:', this.debitNoteObj.sub_total, 'vat_total:', this.debitNoteObj.vat_total, 'total:', this.debitNoteObj.total, 'converted_amount_aed:', this.debitNoteObj.converted_amount_aed)
    },

    goBack() {
      if (this.debitNoteSections > 0) {
        this.debitNoteSections--
      }
    },

    nextStep() {
      if (this.debitNoteSections < this.steps.length - 1) {
        this.debitNoteSections += 1
      }
    },

    async saveAsDraft() {
      // Prevent race condition - check if already loading
      if (this.submitLoading) {
        console.log('Save as draft already in progress, ignoring duplicate call')
        return
      }

      if (!this.$refs.form?.validate()) {
        this.showSnackbar('Please fill in all required fields before saving as draft.', 'warning')
        return
      }

      try {
        this.submitLoading = true
        console.log('Starting save as draft process...')
        await this.updateDebitNote(false) // false for draft
        this.showSnackbar('Debit note saved as draft successfully!', 'success')
        this.$emit('debit-note-created', this.debitNote)
        this.closeDialog()
      } catch (error) {
        console.error('Error saving as draft:', error)
        this.showSnackbar(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to save debit note as draft. Please try again.',
          'error'
        )
      } finally {
        this.submitLoading = false
      }
    },

    async createDebitNote() {
      try {
        this.submitLoading = true
        console.log('Starting create debit note process...')
        await this.updateDebitNote(true) // true for final creation
        this.showSnackbar('Debit note created successfully!', 'success')
        this.$emit('debit-note-created', this.debitNote)
        this.closeDialog()
      } catch (error) {
        console.error('Error creating debit note:', error)
        this.showSnackbar(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to create debit note. Please try again.',
          'error'
        )
      } finally {
        this.submitLoading = false
      }
    },

    async updateDebitNote(final = false) {
      console.log('=== UPDATE DEBIT NOTE CALLED ===')
      console.log('final parameter:', final)
      console.log('effectiveDebitNote:', this.effectiveDebitNote)
      console.log('debitNote._id:', this.debitNote?._id)
      console.log('debitNoteToEdit._id:', this.debitNoteToEdit?._id)

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Calculate totals before updating
        this.calculateTotals()
        const debitNoteTotal = this.debitNoteObj.total || 0

        const updateData = {
          ...this.debitNoteObj,
          invoice_id: this.originalInvoice?._id,
          is_draft: !final,
          status: !final ? 'Draft' : 'Unapproved',
          total: debitNoteTotal,
          debit_amount: debitNoteTotal,
          balance_due: debitNoteTotal,
        }

        console.log('Update data:', updateData)

        if (this.effectiveDebitNote) {
          // Update existing debit note
          const response = await this.$axios.$put(
            `/debit/notes/update/${this.debitNote._id}`,
            updateData,
            { headers: { Authorization: AuthStr } }
          )
          this.debitNote = response
          console.log('Updated existing debit note:', response)
        } else {
          // Create new debit note
          const response = await this.$axios.$post(
            '/debit/notes/generate',
            updateData,
            { headers: { Authorization: AuthStr } }
          )
          this.debitNote = response
          console.log('Created new debit note:', response)
        }
      } catch (error) {
        console.error('Error updating debit note:', error)
        throw error
      }
    },

    async submitDebitNote() {
      try {
        this.submitLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // If preview setup failed, try to set it up first before submitting
        if (!this.previewSetupSuccess && !this.effectiveDebitNote && !this.debitNote) {
          console.log('Preview setup failed, attempting to create debit note for preview first...')
          const previewResponse = await this.getOrCreateDebitNote()
          if (!previewResponse) {
            this.showSnackbar('Cannot submit debit note: Preview setup failed', 'error')
            return
          }
        }

        if (this.effectiveDebitNote) {
          // Update existing debit note
          const response = await this.$axios.$put(
            `/debit/notes/${this.debitNote._id}`,
            this.debitNoteObj,
            {
              headers: { Authorization: AuthStr },
            }
          )

          if (response) {
            this.showSnackbar('Debit note updated successfully', 'success')
            this.$emit('debit-note-updated', response)
            this.closeDialog()
          }
        } else {
          // If we have a draft debit note from preview setup, update it instead of creating new one
          if (this.debitNote && this.debitNote._id) {
            console.log('Updating existing draft debit note instead of creating new one')
            const response = await this.$axios.$put(
              `/debit/notes/${this.debitNote._id}`,
              this.debitNoteObj,
              {
                headers: { Authorization: AuthStr },
              }
            )

            if (response) {
              this.showSnackbar('Debit note updated successfully', 'success')
              this.$emit('debit-note-updated', response)
              this.closeDialog()
            }
          } else {
            // Fallback: Create new debit note (this should rarely happen now)
            console.log('Fallback: Creating new debit note via generate endpoint with preview fallback flag')
            const response = await this.$axios.$post(
              '/debit/notes/generate',
              {
                ...this.debitNoteObj,
                invoiceId: this.originalInvoice?._id,
                is_preview_fallback: true // Flag to create Draft status instead of Unapproved
              },
              {
                headers: { Authorization: AuthStr },
              }
            )

            if (response) {
              this.showSnackbar('Debit note created successfully', 'success')
              this.$emit('debit-note-created', response)
              this.closeDialog()
            }
          }
        }
      } catch (error) {
        console.error('Error submitting debit note:', error)
        this.showSnackbar(
          error?.response?.data?.message || 'Failed to submit debit note',
          'error'
        )
      } finally {
        this.submitLoading = false
      }
    },

    async generatePdfAndDownloadPDF() {
      if (!this.debitNote?._id) return

      try {
        this.loading_download_url = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.get(
          `/debit/notes/pdf/${this.debitNote._id}`,
          {
            headers: { Authorization: AuthStr },
            responseType: 'blob'
          }
        )

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `debit-note-${this.debitNote.debit_note_number}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        this.showSnackbar('Debit note PDF downloaded successfully', 'success')
      } catch (error) {
        console.error('Error downloading debit note PDF:', error)
        this.showSnackbar('Failed to download debit note PDF', 'error')
      } finally {
        this.loading_download_url = false
      }
    },

    async checkForExistingDraft(invoiceId) {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get(
          `/debit/notes/check-existing-draft?invoiceId=${invoiceId}`,
          {
            headers: { Authorization: AuthStr },
          }
        )
        return response.exists ? response.debitNote : null
      } catch (error) {
        console.error('Error checking for existing draft:', error)
        return null
      }
    },

    async loadExistingDebitNote() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get(
          `/debit/notes/${this.debitNoteToEdit._id}`,
          {
            headers: { Authorization: AuthStr },
          }
        )

        if (response) {
          this.debitNote = response
          this.populateDebitNoteFromDraft(response)
          // Mark as initialized and allow watchers to function
          this.isInitialized = true
          this.first_load = false
          // Trigger preview refresh after loading existing debit note
          this.triggerDebitNotePreview()
        }
      } catch (error) {
        console.error('Error loading existing debit note:', error)
        this.showSnackbar('Failed to load debit note', 'error')
      }
    },

    populateDebitNoteFromDraft(debitNote) {
      this.debitNoteObj = {
        customer: debitNote.customer || '',
        customer_name: debitNote.customer_name || '',
        original_invoice_number: debitNote.original_invoice_number || '',
        debit_note_number: debitNote.debit_note_number || '',
        debit_date: debitNote.debit_date || moment().format('YYYY-MM-DD'),
        due_date: debitNote.due_date || moment().add(30, 'days').format('YYYY-MM-DD'),
        reason: debitNote.reason || '',
        customer_notes: debitNote.customer_notes || '',
        visa_sponsor: debitNote.visa_sponsor || 'Dynamic Employment Services',
        email: debitNote.email || '',
        terms: debitNote.terms || '',
        terms_name: debitNote.terms_name || '',
        billing_address: debitNote.billing_address || '',
        company: debitNote.company || '',
        invoice: debitNote.invoice || '',
        items: debitNote.items || [],
        total: debitNote.total || 0,
        sub_total: debitNote.sub_total || 0,
        vat_total: debitNote.vat_total || 0,
      }

      this.calculateTotals()
      this.validateDetails()
      this.validateItems()
    },

    closeDialog() {
      // Reset initialization flag so dialog can be initialized again when reopened
      this.isInitialized = false
      this.setupPreviewInProgress = false
      this.previewSetupSuccess = false
      this.$emit('close')
      this.resetForm()
    },

    resetForm() {
      this.debitNoteSections = 0
      this.detailsValid = false
      this.itemsValid = false
      this.submitLoading = false
      this.previewLoading = false
      this.previewContent = null
      this.debitNote = null
      this.isInitialized = false
      this.setupPreviewInProgress = false
      this.previewSetupSuccess = false
      this.first_load = true // Reset to prevent API calls during next initialization
      this.debitNoteObj = {
        customer: '',
        customer_name: '',
        original_invoice_number: '',
        debit_note_number: '',
        debit_date: '',
        due_date: '',
        reason: '',
        customer_notes: '',
        visa_sponsor: 'Dynamic Employment Services',
        email: '',
        terms: '',
        terms_name: '',
        billing_address: '',
        items: [
          {
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            vat_rate: '0',
            vat_amount: 0,
            net_total: 0,
          },
        ],
        total: 0,
        sub_total: 0,
        vat_total: 0,
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbar_data = {
        snackbar: true,
        text: message,
        color: color,
        timeout: 3000,
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
      }).format(amount || 0)
    },

    // Product/Service Management Methods
    openAddProductDialog() {
      this.add_product = {
        show: true,
        update: false,
        index: null
      }
      this.resetInvoiceProduct()
    },

    editItem(index) {
      this.add_product = {
        show: true,
        update: true,
        index: index
      }
      this.invoiceProduct = { ...this.debitNoteObj.items[index] }
      this.selected_employees = this.invoiceProduct.employees || []
    },

    closeInvoiceProductDialog() {
      this.add_product = {
        show: false,
        update: false,
        index: null
      }
      this.resetInvoiceProduct()
    },

    resetInvoiceProduct() {
      this.invoiceProduct = {
        id: '',
        service: '',
        service_name: '',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        discount: 0,
        tax_name: '',
        tax_code: '',
        vat_rate: 0,
        vat_amount: 0,
        net_total: 0,
        type: 'Service',
        date: new Date().toISOString().substr(0, 10),
        isInventory: 'false',
        city: 'Dubai',
      }
      this.selected_employees = []
      this.validProduct = false
    },

    saveInvoiceProduct() {
      if (!this.validProduct) return

      const product = { ...this.invoiceProduct }
      product.employees = [...this.selected_employees]

      if (this.add_product.update) {
        this.debitNoteObj.items[this.add_product.index] = product
      } else {
        this.debitNoteObj.items.push(product)
      }

      this.calculateTotals()
      this.closeInvoiceProductDialog()
    },

    // Service and Employee Management
    async onServiceChange() {
      const serviceName = this.invoiceProduct.service_name?.toLowerCase() || ''

      // Defensive: always clear employee selection if admin fee
      if (this.isAdminFeeService) {
        this.selected_employees = []
        this.setAdminFee()
      } else {
        // For non-admin fee, clear rate and recalc
        this.invoiceProduct.rate = 0
        this.invoiceProduct.amount = 0
        this.invoiceProduct.vat_amount = 0
        this.invoiceProduct.net_total = 0
      }

      // Always load employees for the selected company (async)
      if (this.debitNoteObj.customer) {
        await this.getEmployeesList()
      }
    },

    onEmployeeSelectionChange() {
      if (this.selected_employees.length > 0) {
        this.calculateEmployeeRates()
      } else {
        this.invoiceProduct.rate = 0
        this.assignAmountValue(0)
      }
    },

    calculateEmployeeRates() {
      if (this.selected_employees.length === 0) return

      // Get all selected employees and sum their salaries
      let totalEmployeeRate = 0
      const selectedEmployees = []

      // Loop through each selected employee ID
      for (const employeeId of this.selected_employees) {
        const employee = this.employees.find(emp => emp._id === employeeId)
        if (employee && employee.salary) {
          const totalFixed = parseFloat(employee.salary.total_fixed) || 0
          const totalVariable = parseFloat(employee.salary.total_variable) || 0
          const totalSalary = totalFixed + totalVariable
          totalEmployeeRate += totalSalary
          selectedEmployees.push(employee)
          console.log(`🔥 Added employee ${employee.first_name} ${employee.last_name} with salary: ${totalSalary}`)
        }
      }

      console.log('🔥 Total employee rate calculated:', totalEmployeeRate)

      // Update the rate with the total employee salary
      this.invoiceProduct.rate = totalEmployeeRate

      // Update description based on number of employees
      this.updateEmployeeDescription(this.selected_employees, selectedEmployees)

      // Trigger the same calculation chain as manual rate entry and admin fee
      this.assignAmountValue(totalEmployeeRate)

      console.log('🔥 Multiple employee rate calculations triggered - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
    },

    updateEmployeeDescription(employeeIds, selectedEmployees = null) {
      if (!selectedEmployees) {
        selectedEmployees = employeeIds.map(id =>
          this.employees.find(emp => emp._id === id)
        ).filter(Boolean)
      }

      if (selectedEmployees.length === 1) {
        const employee = selectedEmployees[0]
        this.invoiceProduct.description = `${employee.first_name} ${employee.last_name} - Monthly Salary`
      } else if (selectedEmployees.length > 1) {
        this.invoiceProduct.description = `${selectedEmployees.length} Employees - Monthly Salaries`
      } else {
        this.invoiceProduct.description = ''
      }
    },

    setAdminFee() {
      console.log('🔥 setAdminFee called with service:', this.invoiceProduct.service_name)
      console.log('🔥 Current customer:', this.debitNoteObj.customer)
      console.log('🔥 Current visa sponsor:', this.debitNoteObj.visa_sponsor)
      console.log('🔥 Selected employees:', this.selected_employees)

      if (!this.add_product.update) {
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
          console.log('🔥 Processing admin fee service')

          // Get current employer from employers array
          const currentEmployer = this.employers.find(
            (employer) => employer._id === this.debitNoteObj.customer
          )

          console.log('🔥 Found employer:', currentEmployer)

          let adminFeeRate = 500 // default fallback
          const visaSponsor = this.debitNoteObj.visa_sponsor

          if (!currentEmployer) {
            console.warn('🔥 No employer found for customer:', this.debitNoteObj.customer)
            this.invoiceProduct.rate = adminFeeRate
            this.assignAmountValue(adminFeeRate)
            return
          }

          if (visaSponsor === 'Dynamic Employment Services') {
            adminFeeRate = currentEmployer.chargeableMonthlyCostDEES || 500
            console.log('🔥 Using DEES cost:', adminFeeRate)
          } else if (visaSponsor === 'Executive Employment Services') {
            adminFeeRate = currentEmployer.chargeableMonthlyCostEES || 500
            console.log('🔥 Using EES cost:', adminFeeRate)
          } else {
            console.log('🔥 Unknown visa sponsor, using default rate:', adminFeeRate)
          }

          // Set the rate and trigger calculations
          this.invoiceProduct.rate = adminFeeRate
          // Use $nextTick to ensure reactivity
          this.$nextTick(() => {
          this.assignAmountValue(adminFeeRate)
            console.log('🔥 Calculations triggered - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
          })
        } else {
          console.log('🔥 Service is neither admin fee nor employee:', serviceName)
        }
      }
    },

    calculateEmployeeSalariesAndUpdate(employeeIds) {
      // Get all selected employees and sum their salaries
      let totalEmployeeRate = 0
      const selectedEmployees = []

      // Loop through each selected employee ID
      for (const employeeId of employeeIds) {
        const employee = this.employees.find(emp => emp._id === employeeId)
        if (employee && employee.salary) {
          const totalFixed = parseFloat(employee.salary.total_fixed) || 0
          const totalVariable = parseFloat(employee.salary.total_variable) || 0
          const totalSalary = totalFixed + totalVariable
          totalEmployeeRate += totalSalary
          selectedEmployees.push(employee)
          console.log(`🔥 Added employee ${employee.first_name} ${employee.last_name} with salary: ${totalSalary}`)
        }
      }

      console.log('🔥 Total employee rate calculated:', totalEmployeeRate)

      // Set the rate to the total employee salary
      this.invoiceProduct.rate = totalEmployeeRate

      // Update description based on number of employees
      this.updateEmployeeDescription(employeeIds, selectedEmployees)

      // Trigger the same calculation chain as manual rate entry and admin fee
      this.assignAmountValue(totalEmployeeRate)

      console.log('🔥 Multiple employee rate calculations triggered - Amount:', this.invoiceProduct.amount, 'VAT:', this.invoiceProduct.vat_amount, 'Net Total:', this.invoiceProduct.net_total)
    },

    updatePreviewAfterChange() {
      // Update preview immediately for unsaved debit notes or saved ones
      if (this.debitNote?._id) {
        // For saved debit notes, use the existing preview update
        this.updatePreview()
      } else {
        // For new debit notes, trigger a preview recalculation
        this.calculateTotals()
        // Force reactivity update for preview panel
        this.$forceUpdate()
      }
    },

    async updatePreview() {
      if (this.debitNote && this.debitNote._id) {
        try {
          await this.setupDebitNotePreview()
        } catch (error) {
          console.error('Error updating preview:', error)
        }
      }
    },

    triggerDebitNotePreview() {
      this.randomKey += 1
    },

    formatDate(dateString) {
      if (!dateString) return ''
      // Return date in YYYY-MM-DD format for input fields
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // Tax and Calculation Methods

    calculateAmount() {
      this.invoiceProduct.amount = this.invoiceProduct.quantity * this.invoiceProduct.rate
      this.calculateVAT()
    },

    calculateVAT() {
      this.invoiceProduct.vat_amount = (this.invoiceProduct.amount * this.invoiceProduct.vat_rate) / 100
      this.invoiceProduct.net_total = this.invoiceProduct.amount + this.invoiceProduct.vat_amount
    },


    // Company and Terms Management
    async changeCompany() {
      const selectedCustomer = this.employers.find(emp => emp._id === this.debitNoteObj.customer)
      if (selectedCustomer) {
        this.debitNoteObj.customer_name = selectedCustomer.company_name
        this.debitNoteObj.email = selectedCustomer.email || ''
        this.debitNoteObj.billing_address = selectedCustomer.billing_address?.address_line1 || ''
      }

      // Load employees for the selected company
      await this.getEmployeesList()
      this.validateDetails()
    },

    async getEmployeesList() {
      // If no customer is selected, don't attempt to fetch employees
      if (!this.debitNoteObj.customer) {
        this.employees = [];
        console.log('No customer selected yet, skipping employee fetch');
        return;
      }

      try {
        this.loading_employees = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        // Use default values for sponsor type if undefined
        const sponsorType = this.debitNoteObj.visa_sponsor || 'Dynamic Employment Services';
        // Ensure we have a valid company ID string
        const companyId = typeof this.debitNoteObj.customer === 'object'
          ? this.debitNoteObj.customer._id || this.debitNoteObj.customer.id
          : this.debitNoteObj.customer;

        if (!companyId) {
          console.error('No valid company ID found');
          this.employees = [];
          return;
        }

        const response = await this.$axios.$get(
          `/users/company/${companyId}/employees?sponsorType=${sponsorType}&limit=100000`,
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

    async fetchProducts() {
      try {
        this.isLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.get(
          'configuration/?q=products_and_services',
          { headers: { Authorization: AuthStr } }
        )

        if (response.data && response.data.data && response.data.data[0]) {
          this.productsAndServices =
            response.data.data[0].products_and_services || []
          console.log(
            `Loaded ${this.productsAndServices.length} products/services for debit note`
          )
        } else {
          console.warn(
            'Unexpected API response format for services:',
            response.data
          )
          this.productsAndServices = []
        }
      } catch (error) {
        console.error('Error fetching products and services:', error)
        this.productsAndServices = []
      } finally {
        this.isLoading = false
      }
    },

    async getTaxCodeList() {
      this.loading_tax_codes = true
      try {
        const response = await this.$axios.$get('/taxcodes')
        this.taxCodesList = response
      } catch (error) {
        console.error('Error fetching tax codes:', error)
      } finally {
        this.loading_tax_codes = false
      }
    },

    updateTermsName() {
      const selectedTerms = this.termsList.find(term => term._id === this.debitNoteObj.terms)
      if (selectedTerms) {
        this.debitNoteObj.terms_name = selectedTerms.name
      }
    },

    async reloadTerms() {
      await this.getTermsList()
      this.termsDialog = false
    },

    async fetchEmployers() {
      this.loading_employers = true
      try {
        const response = await this.$axios.$post(
          `/companies/list/filter/search?page=1&limit=100000`,
          { search: '', isInvoiceFilter: true }
        )
        this.employers = response || []
      } catch (error) {
        console.error('Error fetching employers list:', error)
      } finally {
        this.loading_employers = false
      }
    },

    handleServiceDropdownClick() {
      // Ensure services are loaded when dropdown is clicked
      if (!this.productsAndServices || this.productsAndServices.length === 0) {
        this.fetchProducts()
      }
    },

    customServiceFilter(item, queryText) {
      const query = queryText?.toLowerCase() || ''
      const name = item.name?.toLowerCase() || ''
      const description = item.description?.toLowerCase() || ''
      return name.includes(query) || description.includes(query)
    },

    customEmployeeFilter(item, queryText) {
      const query = queryText?.toLowerCase() || ''
      const name = item.full_name?.toLowerCase() || ''
      const email = item.email?.toLowerCase() || ''
      return name.includes(query) || email.includes(query)
    },
  },
  async mounted() {
    console.log('DebitNoteDialog mounted, show:', this.show)
    // Get tax codes, terms lists, employees, services, and employers
    await Promise.all([
      this.getTaxCodeList(),
      this.getTermsList(),
      this.getEmployeesList(),
      this.fetchProducts(),
      this.fetchEmployers(),
    ])

    // Set up debounced update function
    this.debounceUpdate = _.debounce(this.updateDebitNoteAndPreview, 500)

    // Initialize debit note when component mounts
    if (this.show) {
      // Prevent duplicate initialization
      if (this.isInitialized) {
        console.log('Already initialized in mounted, skipping...')
        return
      }
      console.log('Show is true, initializing debit note...')
      await this.initializeDebitNote()
    }
  },
}
</script>

<style scoped>
.custom-stepper {
  box-shadow: none;
}

.custom-stepper-header {
  margin-bottom: 16px;
}

.custom-step-wrapper {
  position: relative;
  min-width: 80px;
}

.custom-step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  transition: all 0.3s ease;
}

.custom-step-wrapper.active .custom-step-icon {
  background-color: #1976d2;
  color: white;
}

.custom-step-wrapper.completed .custom-step-icon {
  background-color: #4caf50;
  color: white;
}

.custom-step-divider {
  flex: 1;
  height: 2px;
  background-color: #e0e0e0;
  margin: 0 8px;
  transition: all 0.3s ease;
}

.custom-step-divider.completed {
  background-color: #4caf50;
}

.custom-step-label {
  font-size: 12px;
  margin-top: 4px;
  color: #666;
}

.custom-step-wrapper.active .custom-step-label {
  color: #1976d2;
  font-weight: 500;
}

.custom-step-wrapper.completed .custom-step-label {
  color: #4caf50;
  font-weight: 500;
}

.preview-card {
  height: 100%;
  max-height: 80vh;
}

.preview-content {
  height: 70vh;
  overflow: auto;
}
</style>
