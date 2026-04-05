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
                !effectiveCreditNote
                  ? 'New Credit Note'
                  : `Edit Credit Note -
              ${creditNoteToEdit?.credit_note_number}`
              }}</span
            >
          </div>
          <div class="tw-flex tw-gap-5 tw-items-center">
            <v-btn
              color="primary"
              :loading="loading_download_url"
              :disabled="!creditNote?._id"
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
              <v-stepper v-model="creditNoteSections" class="custom-stepper">
                <div class="tw-px-4 tw-py-2">
                  <div
                    class="custom-stepper-header tw-flex tw-items-center tw-justify-center tw-gap-2"
                  >
                    <template v-for="(n, index) in steps">
                      <div
                        :key="`${index}-step`"
                        class="custom-step-wrapper tw-flex tw-flex-col tw-items-center tw-cursor-pointer"
                        :class="{
                          active: creditNoteSections === index,
                          completed: creditNoteSections > index,
                        }"
                        @click="creditNoteSections = index"
                      >
                        <div
                          class="custom-step-icon tw-flex tw-items-center tw-justify-center"
                        >
                          <v-icon v-if="creditNoteSections > index"
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
                        :class="{ completed: creditNoteSections > index }"
                      ></div>
                    </template>
                  </div>
                  <v-divider class="tw-mt-4 tw-mb-2"></v-divider>
                </div>

                <v-stepper-items>
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
                                    v-model="creditNoteObj.customer"
                                    placeholder="Select Company"
                                    class="proposalDialog_date_field2"
                                    solo
                                    dense
                                    :disabled="effectiveCreditNote"
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
                                  v-model="creditNoteObj.email"
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
                                      creditNoteObj.original_invoice_number
                                    "
                                    placeholder="Original Invoice Number"
                                    class="proposalDialog_date_field2"
                                    solo
                                    dense
                                    :disabled="effectiveCreditNote"
                                    :rules="passedCreditNote ? [] : main_rule"
                                    readonly
                                  ></v-text-field>
                                </div>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Credit Note Number"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                                <v-text-field
                                  v-model="creditNoteObj.credit_note_number"
                                  placeholder="Credit Note Number"
                                  class="proposalDialog_date_field2"
                                  solo
                                  dense
                                  :disabled="effectiveCreditNote"
                                  :rules="effectiveCreditNote ? [] : main_rule"
                                  readonly
                                ></v-text-field>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Visa Sponsor Type"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                                <v-select
                                  :items="visa_sponsorships"
                                  v-model="creditNoteObj.visa_sponsor"
                                  placeholder="Select Visa Sponsor Type"
                                  class="proposalDialog_date_field2"
                                  solo
                                  dense
                                  :disabled="effectiveCreditNote"
                                  :rules="main_rule"
                                  append-icon="fa-chevron-down"
                                  @change="changeVisaType"
                                ></v-select>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Terms"
                              :mandatory="true"
                            >
                              <template v-slot:label>
                                <span>Terms</span>
                                <span
                                  class="tw-underline tw-text-blue-500"
                                  @click="termsDialog = true"
                                >
                                  <v-icon small class="mr-1 tw-text-blue-500"
                                    >mdi-plus</v-icon
                                  >
                                  <span>Custom Terms</span>
                                </span>
                              </template>
                              <template v-slot:input>
                                <v-select
                                  :items="termsList"
                                  v-model="creditNoteObj.terms"
                                  placeholder="Select Terms"
                                  class="proposalDialog_date_field2"
                                  solo
                                  dense
                                  :disabled="effectiveCreditNote"
                                  item-text="name"
                                  item-value="_id"
                                  :loading="loading_terms"
                                  :rules="main_rule"
                                  append-icon="fa-chevron-down"
                                  @change="updateTermsName()"
                                ></v-select>
                              </template>
                            </CustomInputContainer>
                          </v-col>
                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Credit Note Date"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                                <v-menu
                                  v-model="credit_note_date_menu"
                                  :close-on-content-click="false"
                                  :nudge-right="40"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="auto"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                      v-model="creditNoteObj.credit_note_date"
                                      placeholder="DD/MM/YYYY"
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
                                    v-model="creditNoteObj.credit_note_date"
                                    @input="credit_note_date_menu = false"
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
                                  :nudge-right="40"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="auto"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                      v-model="creditNoteObj.due_date"
                                      placeholder="DD/MM/YYYY"
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
                                    v-model="creditNoteObj.due_date"
                                    @input="due_date_menu = false"
                                  />
                                </v-menu>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Reason for Credit"
                              :mandatory="true"
                            >
                              <template v-slot:input>
                                <v-textarea
                                  v-model="creditNoteObj.reason"
                                  placeholder="Enter reason for credit note"
                                  class="proposalDialog_date_field2"
                                  solo
                                  dense
                                  :rules="reasonFieldRules"
                                  rows="3"
                                  @input="reasonFieldTouched = true"
                                ></v-textarea>
                              </template>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6" class="pl-0 py-0">
                            <CustomInputContainer
                              label="Customer Notes"
                              :mandatory="false"
                            >
                              <template v-slot:input>
                                <v-textarea
                                  v-model="creditNoteObj.customer_notes"
                                  placeholder="Enter customer notes"
                                  class="proposalDialog_date_field2"
                                  solo
                                  dense
                                  rows="3"
                                ></v-textarea>
                              </template>
                            </CustomInputContainer>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-form>
                  </v-stepper-content>

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
                        <v-row>
                          <v-col cols="12" class="pl-0 py-0">
                            <!-- Currency Information Banner (only show for non-AED currencies) -->
                            <v-alert
                              v-if="creditNoteObj?.currency && creditNoteObj.currency !== 'AED'"
                              type="info"
                              dense
                              outlined
                              class="mb-4"
                            >
                              <div class="d-flex align-center">
                                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                                <div>
                                  <div class="font-weight-medium">Currency Information</div>
                                  <div class="text-caption">
                                    This credit note is being raised in {{ creditNoteObj.currency }}.
                                    All amounts should be entered in {{ creditNoteObj.currency }}.
                                    Exchange rate: 1 {{ creditNoteObj.currency }} = {{ creditNoteObj.conversion_rate }} AED
                                  </div>
                                </div>
                              </div>
                            </v-alert>

                            <h4 class="text--text mb-4">Credit Note Items</h4>
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
                                    creditNoteObj.items
                                  )
                                    ? creditNoteObj.items
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
                                      {{ item.rate | currencyFormatter(creditNoteObj?.currency || 'AED') }}
                                    </td>
                                    <td class="py-2 text-center">
                                      {{ item.amount | currencyFormatter(creditNoteObj?.currency || 'AED') }}
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
                                        0.0 | currencyFormatter(creditNoteObj?.currency || 'AED')
                                      }}
                                    </td>
                                    <td class="py-2 text-center">
                                      {{
                                        item?.net_total ??
                                        0.0 | currencyFormatter(creditNoteObj?.currency || 'AED')
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
                                          @click="deleteItem(index)"
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
                            <div
                              class="d-flex justify-space-between align-start mt-4"
                            >
                              <v-btn
                                @click="addItem"
                                class="small__btn"
                                outlined
                                color="subtext"
                              >
                                <v-icon x-small color="subtext" class="mr-2"
                                  >fa-plus</v-icon
                                >
                                <span class="text--text">Add Item</span>
                              </v-btn>
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Balance exceeded warning -->
                        <v-row class="mt-4" v-if="computedTotal > (originalInvoice?.balance_due || 0)">
                          <v-col cols="12">
                            <v-alert
                              type="error"
                              dense
                              outlined
                              class="mb-0"
                            >
                              <div class="d-flex align-center">
                                <div>
                                  <div class="font-weight-medium">Credit Note Exceeds Invoice Balance</div>
                                  <div class="text-caption">
                                    Credit total ({{ creditNoteObj?.currency || 'AED' }} {{ computedTotal.toFixed(2) }}) exceeds invoice balance ({{ originalInvoice?.currency || 'AED' }} {{ (originalInvoice?.balance_due || 0).toFixed(2) }})
                                  </div>
                                </div>
                              </div>
                            </v-alert>
                          </v-col>
                        </v-row>

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
                                  v-if="creditNoteObj?.currency && creditNoteObj.currency !== 'AED'"
                                  class="text--text font-weight-bold"
                                  >AED Equivalent</span
                                >
                              </div>
                              <div class="flex_column">
                                <span class="text--text font-weight-bold mb-2"
                                  >{{ creditNoteObj?.currency || 'AED' }}
                                  {{ computedSubTotal | twoDecimals }}</span
                                >
                                <span class="text--text font-weight-bold mb-2"
                                  >{{ creditNoteObj?.currency || 'AED' }} {{ 0 | twoDecimals }}</span
                                >
                                <span class="text--text font-weight-bold mb-2"
                                  >{{ creditNoteObj?.currency || 'AED' }}
                                  {{ computedVATAmount | twoDecimals }}</span
                                >
                                <span
                                  class="font-weight-bold"
                                  :class="computedTotal > (originalInvoice?.balance_due || 0) ? 'error--text' : 'text--text'"
                                >{{ creditNoteObj?.currency || 'AED' }} {{ computedTotal | twoDecimals }}</span
                                >
                                <!-- AED Equivalent (only show for non-AED currencies) -->
                                <span
                                  v-if="creditNoteObj?.currency && creditNoteObj.currency !== 'AED'"
                                  class="text--text font-weight-bold"
                                >AED {{ creditNoteObj?.converted_amount_aed | twoDecimals }}</span
                                >
                              </div>
                            </div>
                          </v-col>
                        </v-row>

                        <!-- Action Buttons -->
                        <v-row class="mt-4">
                          <v-col cols="12">
                            <div class="tw-flex tw-justify-end tw-gap-3">
                              <v-btn text @click="goBack()">Back</v-btn>
                              <v-btn
                                v-if="!effectiveCreditNote"
                                color="primary"
                                outlined
                                @click="saveAsDraft()"
                              >
                                Save as Draft
                              </v-btn>
                              <v-btn
                                color="primary"
                                :loading="submitLoading"
                                :class="{ 'tw-cursor-disabled': exceedsInvoiceBalance }"
                                :disabled="
                                  submitLoading ||
                                  exceedsInvoiceBalance ||
                                  !(
                                    Array.isArray(creditNoteObj.items) &&
                                    creditNoteObj.items.length
                                  )
                                "
                                @click="createCreditNote"
                              >
                                Update Credit Note
                                <!-- {{
                                  effectiveCreditNote
                                    ? 'Update Credit Note'
                                    : 'Create Credit Note'
                                }} -->
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
                    src="/header/credit-note.svg"
                    max-width="20"
                    height="20"
                    contain
                    class="mr-3"
                    style="filter: brightness(0) invert(1)"
                  />
                  <span
                    class="font-weight-medium text-subtitle-1"
                    style="color: white"
                    >Credit Note Preview</span
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
                    <p class="text--secondary text-caption">
                      Please wait while we prepare your credit note
                    </p>
                  </div>

                  <div
                    v-else-if="!creditNote || !creditNote._id"
                    class="d-flex flex-column align-center justify-center fill-height"
                  >
                    <v-icon size="64" color="grey lighten-1" class="mb-4"
                      >mdi-file-document-outline</v-icon
                    >
                    <p class="text--primary font-weight-medium">
                      Credit Note Preview
                    </p>
                    <p class="text--secondary text-caption">
                      Complete the form to see a live preview of your credit
                      note
                    </p>
                  </div>

                  <div v-else class="fill-height">
                    <CreditNotePreview :key="randomKey" :credit_id="creditNote._id" />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <v-divider />
        <v-card-actions class="tw-px-6 tw-py-4 tw-bg-gray-50">
          <v-spacer />
          <!-- <v-btn
            v-if="creditNoteSections > 0"
            text
            @click="creditNoteSections -= 1"
            :disabled="submitLoading"
          >
            Previous
          </v-btn> -->
          <v-btn
            v-if="creditNoteSections < steps.length - 1"
            color="primary"
            @click="nextStep"
            :disabled="submitLoading || !canProceed"
          >
            Next
          </v-btn>
          <!-- <v-btn
            v-if="creditNoteSections === steps.length - 1"
            color="primary"
            :loading="submitLoading"
            :disabled="submitLoading || !canProceed"
            @click="saveCreditNote"
          >
            {{ submitLoading ? 'Saving...' : 'Save Credit Note' }}
          </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SnackBar :data="snackbar_data" />

    <!-- add product dialog -->
    <v-dialog v-model="add_product.show" max-width="700px" persistent>
      <v-card class="rounded-xl pa-0 pt-0" flat min-height="400">
        <v-form ref="invoiceForm" v-model="validProduct" lazy-validation>
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
                Add New Credit Note Item</span
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
                      :filter="customServiceFilter"
                      @click="handleServiceDropdownClick"
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
                      :filter="customEmployeeFilter"
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
                      @input="calculateAmount()"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Invoice Amount" :mandatory="false">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      :rules="numberRules"
                      type="number"
                      placeholder="0.00"
                      outlined
                      label="Invoice Amount"
                      hide-details
                      dense
                      disabled
                      v-model="invoiceProduct.amount"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Select Tax Code" :mandatory="true">
                  <div slot="input">
                    <v-select
                      class="rounded-lg"
                      :rules="main_rule"
                      :items="taxCodesList"
                      placeholder="Select Tax Codes"
                      outlined
                      hide-details
                      item-text="code"
                      item-value="_id"
                      dense
                      append-icon="fa-chevron-down"
                      v-model="invoiceProduct.tax_code"
                      @change="getTaxRateForModal(invoiceProduct.tax_code)"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="VAT Rate %" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      :rules="numberRules"
                      disabled
                      type="number"
                      placeholder="0.00"
                      outlined
                      hide-details
                      dense
                      v-model="invoiceProduct.vat_rate"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>

              <v-col cols="6">
                <CustomInputContainer label="Vat Total" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg"
                      :rules="numberRules"
                      type="number"
                      placeholder="0.00"
                      outlined
                      hide-details
                      dense
                      disabled
                      v-model="invoiceProduct.vat_amount"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="6">
                <CustomInputContainer label="Net Total" :mandatory="true">
                  <div slot="input">
                    <v-text-field
                      class="rounded-lg text-center"
                      type="number"
                      placeholder="0.00"
                      outlined
                      hide-details
                      dense
                      disabled
                      :rules="numberRules"
                      v-model="invoiceProduct.net_total"
                    />
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12">
                <CustomInputContainer label="Description" :mandatory="true">
                  <div slot="input">
                    <v-textarea
                      v-model="invoiceProduct.description"
                      :rules="main_rule"
                      dense
                      outlined
                      required
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>

              <!-- Balance validation error -->
              <v-col cols="12" v-if="exceedsInvoiceBalance">
                <v-alert
                  type="error"
                  dense
                  outlined
                  class="mb-0"
                >
                  <div class="d-flex align-center">
                    <div>
                      <div class="font-weight-medium">Amount Exceeds Invoice Balance</div>
                      <div class="text-caption">{{ balanceExceededMessage }}</div>
                    </div>
                  </div>
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click="closeInvoiceProductDialog"
            >
              Close
            </v-btn>
            <v-btn
              color="primary"
              outlined
              @click="handleAddProductAt"
              :disabled="isSaveItemDisabled"
              :loading="submitLoading"
            >
              {{ !add_product.update ? 'Save' : 'Save Changes' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- terms dialog -->
    <DialogsAddCustomTerms
      v-if="termsDialog"
      :open="termsDialog"
      @reload="reloadTerms()"
      @close="termsDialog = false"
    />
  </div>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '@/components/utils/SnackBar.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import DialogsAddCustomTerms from '@/components/Dialogs/AddCustomTerms.vue'
import CreditNotePreview from '@/components/Billings/CreditNotePreview.vue'
import moment from 'moment'

export default {
  layout: 'dashboard',
  components: {
    CustomInputContainer,
    SnackBar,
    CalenderSvg,
    CreditNotePreview,
    DialogsAddCustomTerms,
  },
  props: {
    show: Boolean,
    passedCreditNote: {
      type: Object,
      default: () => {},
    },
    creditNoteToEdit: {
      type: Object,
      default: () => {},
    },
    originalInvoice: {
      type: Object,
      default: () => {},
    },
    viewMode: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    effectiveCreditNote() {
      const creditNote = this.creditNoteToEdit || {}
      const passed = this.passedCreditNote || {}
      return (
        Object.keys(creditNote).length > 0 || Object.keys(passed).length > 0
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
    computedSubTotal() {
      let total = 0
      if (
        this.creditNoteObj &&
        Array.isArray(this.creditNoteObj.items) &&
        this.creditNoteObj.items.length
      ) {
        for (let i = 0; i < this.creditNoteObj.items.length; i++) {
          const item = this.creditNoteObj.items[i]
          const amount = parseFloat(item.amount)
          if (!isNaN(amount)) {
            total += amount
          }
        }
      }
      // Round to 2 decimal places for display consistency
      return parseFloat(total.toFixed(2))
    },
    computedVATAmount() {
      let total = 0
      if (
        this.creditNoteObj &&
        Array.isArray(this.creditNoteObj.items) &&
        this.creditNoteObj.items.length
      ) {
        for (let i = 0; i < this.creditNoteObj.items.length; i++) {
          const item = this.creditNoteObj.items[i]
          const vatAmount = parseFloat(item.vat_amount)
          if (!isNaN(vatAmount)) {
            total += vatAmount
          }
        }
      }
      // Round to 2 decimal places for display consistency
      return parseFloat(total.toFixed(2))
    },
    computedTotal() {
      const subTotal = this.computedSubTotal
      const vatAmount = this.computedVATAmount
      // Round final total to 2 decimal places
      return parseFloat((subTotal + vatAmount).toFixed(2))
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
    shouldShowEmployeeDropdown() {
      // Show employee dropdown if not in update mode and service is not Admin Fee
      return !this.add_product.update && !this.isAdminFeeService
    },
    isAdminFeeService() {
      const serviceName = this.invoiceProduct.service_name?.toLowerCase() || ''
      return serviceName === 'admin fee'
    },
    employeeSelectionRules() {
      // Make employee selection mandatory only if it's an employee service
      if (this.isAdminFeeService) {
        return []
      }
      return this.shouldShowEmployeeDropdown ? this.main_rule : []
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
    // Calculate what the total would be if the current item is added
    potentialCreditNoteTotal() {
      let currentTotal = this.computedTotal

      // If we're adding/editing an item, include its potential contribution
      if (this.add_product.show) {
        const itemTotal = (parseFloat(this.invoiceProduct.amount) || 0) +
                         (parseFloat(this.invoiceProduct.vat_amount) || 0)

        if (this.add_product.update) {
          // If editing, subtract the original item's total first
          const originalItem = this.creditNoteObj.items[this.add_product.index]
          if (originalItem) {
            const originalTotal = (parseFloat(originalItem.amount) || 0) +
                                 (parseFloat(originalItem.vat_amount) || 0)
            currentTotal = currentTotal - originalTotal + itemTotal
          }
        } else {
          // If adding new item, just add it to current total
          currentTotal += itemTotal
        }
      }

      return parseFloat(currentTotal.toFixed(2))
    },

    // Check if the potential total exceeds invoice balance
    exceedsInvoiceBalance() {
      if (!this.originalInvoice?.balance_due) return false
      return this.potentialCreditNoteTotal > this.originalInvoice.balance_due
    },

    // Error message for when total exceeds balance
    balanceExceededMessage() {
      if (!this.exceedsInvoiceBalance) return ''
      const exceeded = this.potentialCreditNoteTotal - this.originalInvoice.balance_due
      return `Credit note total (${this.creditNoteObj?.currency || 'AED'} ${this.potentialCreditNoteTotal.toFixed(2)}) exceeds invoice balance (${this.originalInvoice.currency || 'AED'} ${this.originalInvoice.balance_due.toFixed(2)}) by ${this.creditNoteObj?.currency || 'AED'} ${exceeded.toFixed(2)}`
    },

    // Check if save button should be disabled
    isSaveItemDisabled() {
      return !this.validProduct || this.exceedsInvoiceBalance || this.submitLoading
    },

    // Reason field validation - show error immediately if empty, hide when user starts typing
    reasonFieldRules() {
      return [
        (v) => {
          // Show validation error if field is empty and either:
          // 1. User has started typing (touched) and then cleared it, OR
          // 2. Field is empty on initial load (not touched yet)
          if (!v || v.trim() === '') {
            return this.reasonFieldTouched || !this.reasonFieldTouched ? 'This field is required' : true
          }
          return true
        }
      ]
    },
    canProceed() {
      if (this.creditNoteSections === 0) {
        // Step 0: Credit Note Details - ensure all required fields are filled
        const hasRequiredFields = !!(
          this.creditNoteObj.customer &&
          this.creditNoteObj.credit_note_date &&
          this.creditNoteObj.due_date &&
          this.creditNoteObj.terms &&
          this.creditNoteObj.email &&
          this.creditNoteObj.reason &&
          this.creditNoteObj.reason.trim() !== ''
        )
        console.log('canProceed - Step 0 validation:', {
          customer: !!this.creditNoteObj.customer,
          credit_note_date: !!this.creditNoteObj.credit_note_date,
          due_date: !!this.creditNoteObj.due_date,
          terms: !!this.creditNoteObj.terms,
          email: !!this.creditNoteObj.email,
          reason: !!this.creditNoteObj.reason && this.creditNoteObj.reason.trim() !== '',
          detailsValid: this.detailsValid,
          hasRequiredFields
        })
        return hasRequiredFields && this.detailsValid
      } else if (this.creditNoteSections === 1) {
        // Step 1: Items - ensure items exist, are valid, and don't exceed invoice balance
        const hasValidItems = this.itemsValid && this.creditNoteObj.items.length > 0
        const withinBalance = this.computedTotal <= (this.originalInvoice?.balance_due || 0)
        console.log('canProceed - Step 1 validation:', {
          itemsValid: this.itemsValid,
          itemsLength: this.creditNoteObj.items.length,
          hasValidItems,
          withinBalance
        })
        return hasValidItems && withinBalance
      }
      return true
    },
  },
  data() {
    return {
      creditNoteSections: 0,
      steps: ['Credit Note Details', 'Items'],
      detailsValid: false,
      itemsValid: false,
      submitLoading: false,
      previewLoading: false,
      loading_download_url: false,
      setupPreviewInProgress: false,
      credit_note_date_menu: false,
      randomKey: 1001,
      due_date_menu: false,
      main_rule: [(v) => !!v || 'This field is required'],
      // Track if reason field has been touched to control validation display
      reasonFieldTouched: false,
      snackbar_data: {
        snackbar: false,
        text: '',
        color: '',
        timeout: 2000,
      },
      creditNoteObj: {
        customer: '',
        customer_name: '',
        original_invoice_number: '',
        credit_note_number: '',
        credit_note_date: '',
        reason: '',
        customer_notes: '',
        visa_sponsor: 'Dynamic Employment Services',
        items: [
          {
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
            tax_code: '',
            vat_rate: '0',
            vat_amount: 0,
            net_total: 0,
          },
        ],
        total: 0,
        sub_total: 0,
        vat_total: 0,
      },
      creditNote: null,
      employers: [],
      loading_employers: false,
      visa_sponsorships: [
        'Executive Employment Services',
        'Dynamic Employment Services',
      ],
      taxCodesList: [],
      loading_tax_codes: false,
      termsList: [],
      loading_terms: false,
      termsDialog: false,
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
      employers: [],
      preventWatcherLoop: false, // Prevent race conditions in watchers
      isInitialized: false, // Prevent duplicate initialization
    }
  },
  async mounted() {
    console.log('CreditNoteDialog mounted, show:', this.show)
    // Get tax codes, terms lists, employees, services, and employers
    await Promise.all([
      this.getTaxCodeList(),
      this.getTermsList(),
      this.getEmployeesList(),
      this.fetchProducts(),
      this.fetchEmployers(),
    ])

    // Initialize credit note when component mounts
    if (this.show && !this.isInitialized) {
      console.log('Show is true, initializing credit note...')
      await this.initializeCreditNote()
    }
  },
  watch: {
    async show(newVal) {
      console.log('Show prop changed to:', newVal)
      if (newVal && !this.isInitialized) {
        console.log('Show is true, initializing credit note from watcher...')
        await this.initializeCreditNote()
      }
    },
    originalInvoice: {
      handler(newVal) {
        if (newVal && newVal.invoice_number) {
          this.creditNoteObj.original_invoice_number = newVal.invoice_number
        }
      },
      immediate: true,
    },
    'creditNoteObj.company': {
      handler(newVal) {
        if (newVal) {
          this.getEmployeesList()
        }
      },
    },
    'creditNoteObj.customer'() {
      this.validateDetails()
    },
    'creditNoteObj.credit_note_date'() {
      this.validateDetails()
    },
    'creditNoteObj.reason'() {
      this.validateDetails()
    },
    'creditNoteObj.terms'() {
      this.updateTermsName()
      this.validateDetails()
    },
    'creditNoteObj.items': {
      handler() {
        this.validateItems()
        this.updateCreditNote().then(() => {
          this.triggerCreditNotePreview()
        })
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

        // Update preview after service change
        this.$nextTick(() => {
          this.updatePreviewAfterChange()
        })
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

        // Update preview after employee change
        this.$nextTick(() => {
          this.updatePreviewAfterChange()
        })
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
    // Helper method to copy invoice items to credit note format
    copyInvoiceItemsToCreditNote() {
      if (!this.originalInvoice?.items || !Array.isArray(this.originalInvoice.items)) {
        return []
      }

      return this.originalInvoice.items.map(item => ({
        description: item.description || item.service_name || '',
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.rate) || 0,
        amount: parseFloat(item.amount) || 0,
        tax_code: item.tax_code || '',
        vat_rate: item.vat_rate || '0',
        vat_amount: parseFloat(item.vat_amount) || 0,
        net_total: parseFloat(item.net_total) || 0,
      }))
    },

    async initializeCreditNote() {
      console.log('=== INITIALIZING CREDIT NOTE ===')
      console.log('effectiveCreditNote:', this.effectiveCreditNote)
      console.log('creditNoteToEdit:', this.creditNoteToEdit)
      console.log('passedCreditNote:', this.passedCreditNote)

      // Prevent duplicate initialization
      if (this.isInitialized) {
        console.log('Already initialized, skipping...')
        return
      }

      // Check if we already have a credit note to edit
      if (this.effectiveCreditNote) {
        console.log('Using existing credit note for editing')
        console.log('effectiveCreditNote is true, calling loadExistingCreditNote')
        await this.loadExistingCreditNote()
        return
      } else {
        console.log('effectiveCreditNote is false, not loading existing credit note')
      }

      // For new credit notes, check if there's already a draft for this invoice
      if (this.originalInvoice?._id) {
        const existingDraft = await this.checkForExistingDraft(this.originalInvoice._id)
        if (existingDraft) {
          console.log('Found existing draft credit note, loading it instead of creating new')
          this.creditNote = existingDraft
          this.populateCreditNoteFromDraft(existingDraft)
          // Mark as initialized to prevent further setup
          this.isInitialized = true
          return
        }
      }

      // Initialize new credit note
      this.creditNoteSections = 0
      this.creditNoteObj = {
        customer: this.originalInvoice?.customer || '',
        customer_name: this.originalInvoice?.customer_name || '',
        original_invoice_number: this.originalInvoice?.invoice_number || '',
        credit_note_number: '',
        credit_note_date: moment().format('YYYY-MM-DD'),
        reason: '',
        customer_notes: this.originalInvoice?.customer_notes || '',
        visa_sponsor:
          this.originalInvoice?.visa_sponsor || 'Dynamic Employment Services',
        // Add required fields from original invoice
        due_date: this.originalInvoice?.invoice_date
          ? moment(this.originalInvoice.invoice_date)
              .add(30, 'days')
              .format('YYYY-MM-DD')
          : moment().add(30, 'days').format('YYYY-MM-DD'),

        credit_date: moment().format('YYYY-MM-DD'),
        terms: this.originalInvoice?.terms || '',
        terms_name: this.originalInvoice?.terms_name || '',
        email: this.originalInvoice?.email || '',
        company: this.originalInvoice?.customer || '', // Use customer as company
        invoice: this.originalInvoice?._id || '',
        items: this.copyInvoiceItemsToCreditNote(),
        total: 0,
        sub_total: 0,
        vat_total: 0,
        // Currency fields inherited from original invoice
        currency: this.originalInvoice?.currency || 'AED',
        conversion_rate: this.originalInvoice?.conversion_rate || 1.0,
        base_currency: this.originalInvoice?.base_currency || 'AED',
        converted_amount_aed: 0, // Will be calculated when totals are computed
      }
      this.creditNote = null
      console.log('Credit Note Currency Debug:', {
        originalInvoiceCurrency: this.originalInvoice?.currency,
        creditNoteObjCurrency: this.creditNoteObj.currency,
        originalInvoice: this.originalInvoice
      })
      console.log('Calling generateCreditNoteNumber...')
      this.generateCreditNoteNumber()

      // Get employers list and set up preview
      await this.getEmployersList()
      if (this.creditNoteObj.customer && !this.creditNote) {
        this.setupCreditNotePreview()
      }

      // Mark as initialized to prevent duplicate calls
      this.isInitialized = true
    },
    async generateCreditNoteNumber() {
      try {
        console.log('Generating credit note number...')
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$post(
          '/credit/notes/generate-number',
          {},
          {
            headers: { Authorization: AuthStr },
          }
        )
        console.log('Credit note number response:', response)
        if (response && response.credit_note_number) {
          this.creditNoteObj.credit_note_number = response.credit_note_number
          console.log(
            'Credit note number set to:',
            this.creditNoteObj.credit_note_number
          )
        } else {
          console.warn('No credit note number in response:', response)
        }
      } catch (error) {
        console.error('Error generating credit note number:', error)
        console.error('Error details:', error.response?.data || error.message)
      }
    },
    addItem() {
      this.add_product = {
        show: true,
        update: false,
        index: null,
      }
      this.resetInvoiceProduct()
    },
    removeItem(index) {
      if (this.creditNoteObj.items.length > 1) {
        this.creditNoteObj.items.splice(index, 1)
        this.calculateTotal()
      }
    },
    calculateItemTotal(index) {
      const item = this.creditNoteObj.items[index]
      const quantity = parseFloat(item.quantity) || 0
      const rate = parseFloat(item.rate) || 0
      item.amount = quantity * rate

      // Calculate VAT amount
      const vatRate = parseFloat(item.vat_rate) || 0
      const vatAmount = (item.amount * vatRate) / 100
      item.vat_amount = vatAmount

      // Calculate NET total (amount + VAT)
      item.net_total = item.amount + vatAmount

      this.calculateTotal()
    },
    calculateTotal() {
      let subTotal = 0
      let vatTotal = 0

      this.creditNoteObj.items.forEach((item) => {
        subTotal += parseFloat(item.amount) || 0
        vatTotal += parseFloat(item.vat_amount) || 0
      })

      this.creditNoteObj.sub_total = subTotal
      this.creditNoteObj.vat_total = vatTotal
      this.creditNoteObj.total = subTotal + vatTotal
    },
    nextStep() {
      if (this.creditNoteSections < this.steps.length - 1) {
        this.creditNoteSections += 1
      }
    },
    async saveCreditNote() {
      if (!this.$refs.form.validate() || !this.$refs.itemsForm.validate()) {
        return
      }

      this.submitLoading = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const creditNoteData = {
          ...this.creditNoteObj,
          invoice_id: this.originalInvoice?._id,
          customer: this.creditNoteObj.customer,
          company: this.creditNoteObj.customer, // Use customer as company
          invoice: this.originalInvoice?._id,
          // Ensure all required fields are present
          due_date: this.creditNoteObj.due_date,
          credit_date: this.creditNoteObj.credit_date,
          terms: this.creditNoteObj.terms,
          terms_name: this.creditNoteObj.terms_name,
          email: this.creditNoteObj.email,
        }

        const response = await this.$axios.$post(
          '/credit/notes/create',
          creditNoteData,
          {
            headers: { Authorization: AuthStr },
          }
        )

        if (response && response._id) {
          this.creditNote = response
          this.snackbar_data = {
            snackbar: true,
            text: 'Credit note created successfully',
            color: 'success',
            timeout: 3000,
          }
          this.$emit('reload')
          setTimeout(() => {
            this.closeDialog()
          }, 2000)
        }
      } catch (error) {
        console.error('Error creating credit note:', error)
        this.snackbar_data = {
          snackbar: true,
          text: error?.response?.data?.message || 'Error creating credit note',
          color: 'error',
          timeout: 3000,
        }
      } finally {
        this.submitLoading = false
      }
    },
    async generatePdfAndDownloadPDF() {
      if (!this.creditNote?._id) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Please save the credit note first',
          color: 'warning',
          timeout: 3000,
        }
        return
      }

      this.loading_download_url = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$post(
          '/credit/notes/getpreviewpdf',
          {
            credit_note_id: this.creditNote._id,
          },
          {
            headers: { Authorization: AuthStr },
          }
        )

        if (response && response.url) {
          const link = document.createElement('a')
          link.href = response.url
          link.download = `credit-note-${this.creditNote.credit_note_number}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        console.error('Error downloading PDF:', error)
        this.snackbar_data = {
          snackbar: true,
          text: 'Error downloading PDF',
          color: 'error',
          timeout: 3000,
        }
      } finally {
        this.loading_download_url = false
      }
    },
    refreshPreview() {
      if (this.creditNote?._id) {
        this.previewLoading = true
        setTimeout(() => {
          this.previewLoading = false
        }, 1000)
      }
    },
    async getEmployersList() {
      this.loading_employers = true
      try {
        const response = await this.$axios.$post(
          `/companies/list/filter/search?page=1&limit=100000`,
          { search: '', isInvoiceFilter: true }
        )
        this.employers = response
      } catch (error) {
        console.error('Error fetching employers list:', error)
      } finally {
        this.loading_employers = false
      }
    },

    changeCompany() {
      // Update customer name and email when company changes
      const selectedEmployer = this.employers.find(
        (emp) => emp._id === this.creditNoteObj.customer
      )
      if (selectedEmployer) {
        this.creditNoteObj.customer_name = selectedEmployer.company_name
        this.creditNoteObj.email = selectedEmployer.email || ''
      }
      this.setupCreditNotePreview()
    },

    changeVisaType() {
      this.setupCreditNotePreview()
    },

    validateDetails() {
      this.detailsValid = !!(
        this.creditNoteObj.customer &&
        this.creditNoteObj.credit_note_date &&
        this.creditNoteObj.due_date &&
        this.creditNoteObj.terms &&
        this.creditNoteObj.email &&
        this.creditNoteObj.reason &&
        this.creditNoteObj.reason.trim() !== ''
      )
      console.log('validateDetails called - detailsValid:', this.detailsValid, 'reason:', this.creditNoteObj.reason)
    },

    validateItems() {
      this.itemsValid = this.creditNoteObj.items.every(
        (item) => item.description && item.quantity > 0 && item.rate > 0
      )
    },

    updateTermsName() {
      if (this.creditNoteObj.terms && this.termsList.length > 0) {
        const selectedTerm = this.termsList.find(
          (term) => term._id === this.creditNoteObj.terms
        )
        if (selectedTerm) {
          this.creditNoteObj.terms_name = selectedTerm.name
        }
      }
    },

    async getTermsList() {
      this.loading_terms = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get('/terms', {
          headers: { Authorization: AuthStr },
        })
        this.termsList = response || []

        // Prepopulate terms from original invoice if available
        if (this.originalInvoice?.terms && this.termsList.length > 0) {
          const termExists = this.termsList.find(
            (term) => term._id === this.originalInvoice.terms
          )
          if (termExists) {
            this.creditNoteObj.terms = this.originalInvoice.terms
            this.creditNoteObj.terms_name = this.originalInvoice.terms_name
          }
        }
      } catch (error) {
        console.error('Error fetching terms list:', error)
        this.$nuxt.$emit('show-snackbar', {
          message:
            'Failed to load payment terms. Manual entry may be required.',
          type: 'warning',
        })
        this.termsList = []
      } finally {
        this.loading_terms = false
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

    async reloadTerms() {
      await this.getTermsList()
    },

    async getEmployeesList() {
      // If no customer is selected, don't attempt to fetch employees
      if (!this.creditNoteObj.customer) {
        this.employees = []
        console.log('No customer selected yet, skipping employee fetch')
        return
      }

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading_employees = true
      try {
        // Use default values for sponsor type if undefined
        const sponsorType =
          this.creditNoteObj.visa_sponsor || 'Dynamic Employment Services'

        // Use customer field for employee fetching (this is the company that employs the workers)
        const companyId = this.creditNoteObj.customer

        const response = await this.$axios.$get(
          `/users/company/${companyId}/employees?sponsorType=${sponsorType}&limit=100000`,
          { headers: { Authorization: AuthStr } }
        )
        this.employees = Array.isArray(response?.results)
          ? response.results
          : []
        console.log(
          `Loaded ${this.employees.length} employees for credit note`
        )
      } catch (error) {
        console.error(`Could not fetch employee list: ${error?.message}`)
        this.$nuxt.$emit('show-snackbar', {
          message:
            'Failed to load employees list. Some features may be limited.',
          type: 'warning',
        })
        this.employees = [] // Fallback to prevent crashes
      } finally {
        this.loading_employees = false
      }
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
    },

    closeInvoiceProductDialog() {
      this.add_product = {
        show: false,
        update: false,
        index: null,
      }
      this.resetInvoiceProduct()
      this.selected_employees = []
    },

    handleAddProductAt() {
      if (!this.$refs.invoiceForm?.validate()) {
        return
      }

      const newItem = {
        ...this.invoiceProduct,
        _id: this.add_product.update
          ? this.creditNoteObj.items[this.add_product.index]._id
          : undefined,
        // Add employee information if selected
        employee_id:
          this.selected_employees.length === 1
            ? this.selected_employees[0]
            : null,
        user:
          this.selected_employees.length === 1
            ? this.employees.find(
                (emp) => emp._id === this.selected_employees[0]
              )
            : null,
      }

      if (this.add_product.update) {
        this.$set(this.creditNoteObj.items, this.add_product.index, newItem)
      } else {
        this.creditNoteObj.items.push(newItem)
      }

      this.calculateTotals()
      this.closeInvoiceProductDialog()
      // Update preview after adding/editing item
      this.updatePreview()
    },

    editItem(index) {
      const item = this.creditNoteObj.items[index]
      this.invoiceProduct = { ...item }

      // Restore selected_employees for edit mode
      if (item.user && item.user._id) {
        this.selected_employees = [item.user._id]
      } else if (Array.isArray(item.user)) {
        this.selected_employees = item.user.map((u) => u._id).filter(Boolean)
      } else if (item.employee_id) {
        this.selected_employees = [item.employee_id]
      } else {
        this.selected_employees = []
      }

      this.add_product = {
        show: true,
        update: true,
        index: index,
      }
    },

    deleteItem(index) {
      if (this.creditNoteObj.items.length > 0) {
        this.creditNoteObj.items.splice(index, 1)
        this.calculateTotals()
        // Update preview after deleting item
        this.updatePreview()
      }
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

    calculatePercentage(percent, number) {
      return (percent / 100) * number
    },

    addNumbers(num1, num2) {
      const parsedNum1 = parseFloat(num1)
      const parsedNum2 = parseFloat(num2)

      return parsedNum1 + parsedNum2
    },

    setAdminFee() {
      console.log('🔥 setAdminFee called with service:', this.invoiceProduct.service_name)
      console.log('🔥 Current customer:', this.creditNoteObj.customer)
      console.log('🔥 Current visa sponsor:', this.creditNoteObj.visa_sponsor)
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
          console.log("🔥 Processing admin fee service")

          // Get current employer from employers array
          const currentEmployer = this.employers.find(
            (employer) => employer._id === this.creditNoteObj.customer
          )

          console.log('🔥 Found employer:', currentEmployer)

          if (!currentEmployer) {
            console.warn('🔥 No employer found for customer:', this.creditNoteObj.customer)
            this.invoiceProduct.rate = 500 // fallback to default
            // Trigger calculations with fallback rate
            this.assignAmountValue(500)
            return
          }

          // Check visa sponsor type to determine which cost field to use
          const visaSponsor = this.creditNoteObj.visa_sponsor
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

          // Set the rate and trigger calculations
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

    getTaxRateForModal(taxCodeId) {
      const selectedTax = this.taxCodesList.find((tax) => tax._id === taxCodeId)
      if (selectedTax) {
        this.invoiceProduct.tax_name = selectedTax.name || ''
        this.invoiceProduct.vat_rate = selectedTax.rate || 0
        this.calculateVatAndNet()
      }
    },

    getTaxRate(taxCodeId, index) {
      const selectedTax = this.taxCodesList.find((tax) => tax._id === taxCodeId)
      if (selectedTax && index !== undefined) {
        this.creditNoteObj.items[index].tax_name = selectedTax.name || ''
        this.creditNoteObj.items[index].vat_rate = selectedTax.rate || '0'
        this.calculateItemTotal(index)
      }
    },

    async updatePreview() {
      if (this.creditNote && this.creditNote._id) {
        try {
          await this.setupCreditNotePreview()
        } catch (error) {
          console.error('Error updating preview:', error)
        }
      }
    },

    prefillDescription() {
      // This method is now handled by the selected_employees watcher
      // Keeping it for backward compatibility but the logic is in the watcher
      console.log('prefillDescription called - logic now handled by selected_employees watcher')
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

      // Update the rate with the total employee salary
      this.invoiceProduct.rate = totalEmployeeRate

      // Update description based on number of employees
      this.updateEmployeeDescription(employeeIds, selectedEmployees)

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
        const dateStr = new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        this.invoiceProduct.description = `${employee.first_name} ${employee.last_name} - ${dateStr}`
      } else if (selectedEmployees.length > 1) {
        const dateStr = new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        this.invoiceProduct.description = `${selectedEmployees.length} Employees - ${dateStr}`
      }
    },

    onEmployeeSelectionChange() {
      // This method is called when employee selection changes
      // The actual logic is handled by the watcher, but we can add any immediate UI updates here
      console.log('Employee selection changed via input event')
    },

    updatePreviewAfterChange() {
      // Update preview immediately for unsaved credit notes or saved ones
      if (this.creditNote?._id) {
        // For saved credit notes, use the existing preview update
        this.updatePreview()
      } else {
        // For new credit notes, trigger a preview recalculation
        this.calculateTotals()
        // Force reactivity update for preview panel
        this.$forceUpdate()
      }
    },

    async checkForExistingDraft(invoiceId) {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get(
          `/credit/notes/check-existing-draft?invoiceId=${invoiceId}`,
          { headers: { Authorization: AuthStr } }
        )

        if (response.exists && response.creditNote) {
          console.log('API Response - Existing Credit Note:', {
            creditNote: response.creditNote,
            currency: response.creditNote.currency
          })
          return response.creditNote
        }
        return null
      } catch (error) {
        console.error('Error checking for existing draft:', error)
        return null
      }
    },

    async loadExistingCreditNote() {
      console.log('loadExistingCreditNote called')
      const creditNote = this.creditNoteToEdit || this.passedCreditNote
      console.log('creditNote to load:', creditNote)
      if (creditNote) {
        await this.populateCreditNoteFromDraft(creditNote)
        this.creditNote = creditNote
        console.log('creditNote set to:', this.creditNote)
      } else {
        console.log('No credit note to load')
      }
    },

    async populateCreditNoteFromDraft(existingCreditNote) {
      console.log('Populating credit note from existing data:', existingCreditNote)

      // First, get the original invoice data to populate missing fields
      let originalInvoiceData = null
      if (existingCreditNote.invoice) {
        try {
          const AuthStr = 'Bearer '.concat(this.$store.state.token)
          const invoiceResponse = await this.$axios.$post(
            `/invoice/id/${existingCreditNote.invoice}`,{},
            { headers: { Authorization: AuthStr } }
          )
          originalInvoiceData = invoiceResponse
          console.log('Fetched original invoice data:', originalInvoiceData)
        } catch (error) {
          console.error('Error fetching original invoice:', error)
        }
      }

      // Fetch company data if company field exists
      let companyData = null
      if (existingCreditNote.company) {
        try {
          const AuthStr = 'Bearer '.concat(this.$store.state.token)
          const companyResponse = await this.$axios.$get(
            `/companies/comp/${existingCreditNote.company}`,
            { headers: { Authorization: AuthStr } }
          )
          companyData = companyResponse
          console.log('Fetched company data:', companyData)
        } catch (error) {
          console.error('Error fetching company data:', error)
        }
      }

      this.creditNoteObj = {
        ...existingCreditNote,
        // Ensure date formatting
        credit_note_date: existingCreditNote.credit_note_date
          ? moment(existingCreditNote.credit_note_date).format('YYYY-MM-DD')
          : moment().format('YYYY-MM-DD'),
        due_date: existingCreditNote.due_date
          ? moment(existingCreditNote.due_date).format('YYYY-MM-DD')
          : moment().add(30, 'days').format('YYYY-MM-DD'),
        credit_date: existingCreditNote.credit_date
          ? moment(existingCreditNote.credit_date).format('YYYY-MM-DD')
          : moment().format('YYYY-MM-DD'),
        // Ensure items array exists
        items: existingCreditNote.items || [],
        // Populate missing fields from original invoice
        original_invoice_number: originalInvoiceData?.invoice_number || existingCreditNote.original_invoice_number || '',
        reason: existingCreditNote.reason || existingCreditNote.memo || '',
        // Ensure customer field is populated (this is what the form uses for company selection)
        customer: existingCreditNote.customer || '',
        // Company field is for accounting purposes and should remain as is
        company: existingCreditNote.company || '',
      }

      console.log('Credit Note Currency Debug - From Draft:', {
        existingCreditNoteCurrency: existingCreditNote.currency,
        creditNoteObjCurrency: this.creditNoteObj.currency,
        existingCreditNote: existingCreditNote
      })

      // Calculate totals from existing items
      this.calculateTotals()

      // Load employers list if not already loaded
      if (!this.employers || this.employers.length === 0) {
        await this.getEmployersList()
      }

      // Load employees for the selected customer
      if (this.creditNoteObj.customer) {
        await this.getEmployeesList()
      }

      console.log('Populated credit note from existing draft/edit:', this.creditNoteObj)
    },

    customEmployeeFilter(item, queryText, itemText) {
      // Custom filter for better employee search functionality
      const searchText = queryText.toLowerCase()
      const employeeName = item.full_name.toLowerCase()
      const employeeEmail = (item.email || '').toLowerCase()

      // Check if the search text matches the employee name or email
      return (
        employeeName.includes(searchText) || employeeEmail.includes(searchText)
      )
    },

    customServiceFilter(item, queryText, itemText) {
      // Custom filter for better service search functionality
      const searchText = queryText.toLowerCase()
      const serviceName = (item.name || '').toLowerCase()
      const serviceDescription = (item.description || '').toLowerCase()

      // Check if the search text matches the service name or description
      return (
        serviceName.includes(searchText) ||
        serviceDescription.includes(searchText)
      )
    },

    async fetchProducts() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        console.log('Fetching products and services for credit note...')
        this.isLoading = true
        const response = await this.$axios.get(
          'configuration/?q=products_and_services',
          { headers: { Authorization: AuthStr } }
        )

        if (response.data && response.data.data && response.data.data[0]) {
          this.productsAndServices =
            response.data.data[0].products_and_services || []
          console.log(
            `Loaded ${this.productsAndServices.length} products/services for credit note`
          )
        } else {
          console.warn(
            'Unexpected API response format for services:',
            response.data
          )
          this.productsAndServices = []
        }
      } catch (error) {
        console.error(
          'Error fetching products and services for credit note:',
          error
        )
        this.productsAndServices = []
      } finally {
        this.isLoading = false
      }
    },

    async fetchEmployers() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get('/employers', {
          headers: { Authorization: AuthStr },
        })

        if (response && Array.isArray(response)) {
          this.employers = response
          console.log(`Loaded ${this.employers.length} employers for credit note`)
        } else {
          console.warn('Unexpected API response format for employers:', response)
          this.employers = []
        }
      } catch (error) {
        console.error('Error fetching employers for credit note:', error)
        this.employers = []
      }
    },

    triggerCreditNotePreview() {
      this.randomKey += 1
    },
    async setupCreditNotePreview() {
      // Don't create preview if we're just viewing an existing credit note
      if (this.viewMode && this.creditNote?._id) {
        console.log('View mode: skipping preview creation for existing credit note')
        return
      }

      // Prevent multiple simultaneous calls
      if (this.setupPreviewInProgress) {
        console.log('Setup preview already in progress, skipping...')
        return
      }

      if (
        this.creditNoteObj.customer &&
        this.creditNoteObj.credit_note_number
      ) {
        try {
          this.setupPreviewInProgress = true
          const AuthStr = 'Bearer '.concat(this.$store.state.token)

          // Prepare the data with all required fields
          const previewData = {
            ...this.creditNoteObj,
            invoice_id: this.originalInvoice?._id,
            // Ensure all required fields are present
            due_date: this.creditNoteObj.due_date,
            credit_date: this.creditNoteObj.credit_date,
            terms: this.creditNoteObj.terms,
            terms_name: this.creditNoteObj.terms_name,
            email: this.creditNoteObj.email,
            company: this.creditNoteObj.customer, // Use customer as company
            invoice: this.originalInvoice?._id,
          }

          const response = await this.$axios.$post(
            `/credit/notes/setup-preview`,
            previewData,
            { headers: { Authorization: AuthStr } }
          )
          if (response && response._id) {
            this.creditNote = response
            console.log('Credit note preview setup:', response)
          }
        } catch (error) {
          console.error('Error setting up credit note preview:', error)
        } finally {
          this.setupPreviewInProgress = false
        }
      }
    },

    closeDialog() {
      // Reset initialization flag so dialog can be initialized again when reopened
      this.isInitialized = false
      this.$emit('close')
    },

    goBack() {
      if (this.creditNoteSections > 0) {
        this.creditNoteSections--
      }
    },

    async saveAsDraft() {
      // Prevent race condition - check if already loading
      if (this.submitLoading) {
        console.log('Save as draft already in progress, ignoring duplicate call')
        return
      }

      if (!this.$refs.form?.validate()) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Please fill in all required fields before saving as draft.',
          type: 'warning',
        })
        return
      }

      try {
        this.submitLoading = true
        console.log('Starting save as draft process...')
        await this.updateCreditNote(false) // false for draft
        this.$nuxt.$emit('show-snackbar', {
          message: 'Credit note saved as draft successfully!',
          type: 'success',
        })
        this.$emit('reload')
        this.closeDialog()
      } catch (error) {
        console.error('Error saving as draft:', error)
        this.$nuxt.$emit('show-snackbar', {
          message:
            error?.response?.data?.message ||
            error?.message ||
            'Failed to save credit note as draft. Please try again.',
          type: 'error',
        })
      } finally {
        this.submitLoading = false
      }
    },

    async createCreditNote() {
      // Prevent race condition - check if already loading
      if (this.submitLoading) {
        console.log('Create credit note already in progress, ignoring duplicate call')
        return
      }

      console.log('createCreditNote called - effectiveCreditNote:', this.effectiveCreditNote)
      console.log('creditNote:', JSON.stringify(this.creditNote, null, 2))
      console.log('creditNoteToEdit:', JSON.stringify(this.creditNoteToEdit, null, 2))
      console.log('creditNote._id:', this.creditNote?._id)
      console.log('creditNoteToEdit._id:', this.creditNoteToEdit?._id)

      console.log("nnew validations---->")

      // For existing credit notes, skip detailed form validation since many fields are disabled
      // Just ensure basic required data exists
      if (this.effectiveCreditNote) {
        console.log("Editing existing credit note - performing basic validation")
        console.log("Current reason value:", this.creditNoteObj.reason)
        console.log("Current items:", this.creditNoteObj.items)

        // Basic validation for editing mode
        if (!this.creditNoteObj.reason || this.creditNoteObj.reason.trim() === '') {
          console.log("Validation failed: Reason is required")
          this.$nuxt.$emit('show-snackbar', {
            message: 'Please provide a reason for the credit note.',
            type: 'warning',
          })
          return
        }

        if (!this.creditNoteObj.items || this.creditNoteObj.items.length === 0) {
          console.log("Validation failed: No items found")
          this.$nuxt.$emit('show-snackbar', {
            message: 'Please add at least one item to the credit note.',
            type: 'warning',
          })
          return
        }

        console.log("Basic validation passed for editing mode")
      } else {
        // Full validation for new credit notes
        console.log("Creating new credit note - performing full form validation")

        if (!this.$refs.form?.validate()) {
          this.$nuxt.$emit('show-snackbar', {
            message:
              'Please fill in all required fields before creating the credit note.',
            type: 'warning',
          })
          return
        }

        if (!this.$refs.itemsForm?.validate()) {
          this.$nuxt.$emit('show-snackbar', {
            message: 'Please add at least one item to the credit note.',
            type: 'warning',
          })
          return
        }

        console.log("Full validation passed for new credit note")
      }

      // console.log("nnew beginnings001---->")
      // // Check for existing credit note for the same company (only for new credit notes)
      // if (!this.effectiveCreditNote && this.creditNoteObj.company) {
      //   console.log('hitt new')
      //   try {
      //     const AuthStr = 'Bearer '.concat(this.$store.state.token)
      //     const existingCreditNote = await this.$axios.$get(
      //       `/credit/notes/check-existing?company=${this.creditNoteObj.company}&invoice=${this.originalInvoice?._id}`,
      //       { headers: { Authorization: AuthStr } }
      //     )

      //     if (existingCreditNote && existingCreditNote.exists) {
      //       conosle.log("the second condition has been met")
      //       this.$nuxt.$emit('show-snackbar', {
      //         message:
      //           'A credit note already exists for this company and invoice. Please edit the existing one instead.',
      //         type: 'warning',
      //       })
      //       return
      //     }
      //   } catch (error) {
      //     console.error('Error checking for existing credit note:', error)
      //     // Continue with creation if check fails
      //   }
      // }

      try {
        this.submitLoading = true
        console.log('hitt old')

        await this.updateCreditNote(true) // true for final creation
        this.$nuxt.$emit('show-snackbar', {
          message: `Credit note ${
            this.effectiveCreditNote ? 'updated' : 'created'
          } successfully!`,
          type: 'success',
        })
        this.$emit('reload')
        this.closeDialog()
      } catch (error) {
        console.error('Error in createCreditNote:', error)
        this.$nuxt.$emit('show-snackbar', {
          message:
            error?.response?.data?.message ||
            error?.message ||
            `Failed to ${
              this.effectiveCreditNote ? 'update' : 'create'
            } credit note. Please try again.`,
          type: 'error',
        })
      } finally {
        this.submitLoading = false
      }
    },

    async updateCreditNote(final = false) {
      console.log('=== UPDATE CREDIT NOTE CALLED ===')
      console.log('final parameter:', final)
      console.log('effectiveCreditNote:', this.effectiveCreditNote)
      console.log('creditNote._id:', this.creditNote?._id)
      console.log('creditNoteToEdit._id:', this.creditNoteToEdit?._id)
      console.log('creditNoteObj before calculate:', JSON.stringify(this.creditNoteObj, null, 2))

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Calculate totals
        console.log('About to calculate totals...')
        this.calculateTotals()
        console.log('Totals calculated - creditNoteObj after:', {
          sub_total: this.creditNoteObj.sub_total,
          vat_total: this.creditNoteObj.vat_total,
          total: this.creditNoteObj.total
        })

        const creditNoteTotal =
          this.creditNoteObj.sub_total + this.creditNoteObj.vat_total

        console.log('creditNoteTotal:', creditNoteTotal)
        console.log('originalInvoice balance_due:', this.originalInvoice?.balance_due)

        // Validate credit note amount doesn't exceed invoice balance due
        if (
          this.originalInvoice &&
          creditNoteTotal > this.originalInvoice.balance_due
        ) {
          console.log('Credit note amount exceeds invoice balance due')
          const errorMessage = `Credit note amount (${this.creditNoteObj?.currency || 'AED'} ${creditNoteTotal.toFixed(2)}) cannot exceed invoice balance due (${this.originalInvoice.currency || 'AED'} ${this.originalInvoice.balance_due.toFixed(2)}). Please reduce the credit note amount.`
          throw new Error(errorMessage)
        }

        const creditNoteData = {
          ...this.creditNoteObj,
          invoice_id: this.originalInvoice?._id,
          is_draft: !final,
          status: !final ? 'Draft' : 'Unapproved',
          total: creditNoteTotal,
          credit_amount: creditNoteTotal,
          balance_due: creditNoteTotal,
        }

        console.log('creditNoteData prepared:', JSON.stringify(creditNoteData, null, 2))

        let response
        // Update existing credit note
        const creditNoteId = this.creditNote?._id || this.creditNoteToEdit?._id
        console.log('UPDATE PATH: Updating credit note with ID:', creditNoteId)

        if (!creditNoteId) {
          console.error('ERROR: Credit note ID is missing!')
          throw new Error('Credit note ID is required for update')
        }

        console.log('Making API call to:', `/credit/notes/update/${creditNoteId}`)
        console.log('With data:', creditNoteData)

        response = await this.$axios.$put(
          `/credit/notes/update/${creditNoteId}`,
          creditNoteData,
          { headers: { Authorization: AuthStr } }
        )

        console.log('UPDATE API response:', response)

        // if (this.effectiveCreditNote) {
        // } else {
        //   // Create new credit note
        //   console.log('CREATE PATH: Creating new credit note')
        //   response = await this.$axios.$post(
        //     '/credit/notes/generate',
        //     creditNoteData,
        //     { headers: { Authorization: AuthStr } }
        //   )
        //   console.log('CREATE API response:', response)
        // }

        if (response) {
          this.creditNote = response
          console.log('Credit note saved:', response)
        }
      } catch (error) {
        console.error('Error saving credit note:', error)
        // Re-throw with better error message if needed
        if (error.message && !error.response) {
          throw error // Re-throw validation errors as-is
        }
        throw error
      }
    },

    calculateTotals() {
      let subTotal = 0
      let vatTotal = 0

      // Always use creditNoteObj.items as the source of truth for calculations
      // This is where the form data is stored
      const items = this.creditNoteObj?.items || []

      console.log('calculateTotals - items:', items)

      items.forEach((item) => {
        const amount = parseFloat(item.amount) || 0
        const vatAmount = parseFloat(item.vat_amount) || 0
        subTotal += amount
        vatTotal += vatAmount
      })

      // Round totals to 2 decimal places for consistency
      this.creditNoteObj.sub_total = parseFloat(subTotal.toFixed(2))
      this.creditNoteObj.vat_total = parseFloat(vatTotal.toFixed(2))
      this.creditNoteObj.total = parseFloat((this.creditNoteObj.sub_total + this.creditNoteObj.vat_total).toFixed(2))

      // Calculate converted amount to AED for reporting
      const conversionRate = this.creditNoteObj.conversion_rate || 1.0
      this.creditNoteObj.converted_amount_aed = parseFloat((this.creditNoteObj.total * conversionRate).toFixed(2))

      console.log('calculateTotals - sub_total:', this.creditNoteObj.sub_total, 'vat_total:', this.creditNoteObj.vat_total, 'total:', this.creditNoteObj.total, 'converted_amount_aed:', this.creditNoteObj.converted_amount_aed)
    },

    handleServiceDropdownClick() {
      // Ensure services are loaded when dropdown is clicked
      if (!this.productsAndServices || this.productsAndServices.length === 0) {
        this.fetchProducts()
      }
    },

    changeProductType() {
      // This method is called when service type changes to update UI flags
      // For now, we'll keep it simple since the main logic is in the watchers
      console.log('Product type changed, updating UI flags')
    },
  },
}
</script>

<style scoped>
.custom-stepper {
  background: transparent !important;
  box-shadow: none !important;
}

.custom-stepper-header {
  padding: 16px 0;
}

.custom-step-wrapper {
  transition: all 0.3s ease;
}

.custom-step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  transition: all 0.3s ease;
}

.custom-step-wrapper.active .custom-step-icon {
  background: #1976d2;
  color: white;
}

.custom-step-wrapper.completed .custom-step-icon {
  background: #4caf50;
  color: white;
}

.custom-step-label {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  transition: all 0.3s ease;
}

.custom-step-wrapper.active .custom-step-label {
  color: #1976d2;
  font-weight: 600;
}

.custom-step-wrapper.completed .custom-step-label {
  color: #4caf50;
  font-weight: 600;
}

.custom-step-divider {
  width: 60px;
  height: 2px;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.custom-step-divider.completed {
  background: #4caf50;
}

.border {
  border: 1px solid #e0e0e0;
}

.rounded {
  border-radius: 8px;
}

.estimate__container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.flex_column {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

@media (max-width: 1200px) {
  .preview-wrapper {
    min-height: 60vh !important;
  }
}

@media (max-width: 768px) {
  .preview-wrapper {
    min-height: 40vh !important;
    margin: 8px !important;
  }
}
</style>
