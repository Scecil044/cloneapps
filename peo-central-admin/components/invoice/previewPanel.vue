<template>
  <div>
    <v-dialog v-model="open" persistent width="50vw" height="100vh" content-class="proposal_dialog">
      <div class="dialog_proposal">
        <v-card id="card" class="dialog_custom" :style="invoiceData?.is_draft ? 'border-top: 4px solid #f44336;' : ''">
          <div class="tw-flex tw-items-center tw-justify-between pb-2">
            <v-card-title class="py-0">
              <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
              <!-- <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
                Create New Ticket</span> -->
              <h4 class="text--text tw-text-capitalize">
                <span v-if="show_preview.doc_type === 'creditNote'">
                  Credit Note {{ selectedCreditNote?.credit_note_number || 'Preview' }} Summary
                </span>
                <span v-else>
                  Invoice {{ invoiceData?.invoice_number }} Summary
                  <span v-if="invoiceData?.is_draft" class="tw-ml-2 tw-px-2 tw-py-1 tw-bg-red-500 tw-text-white tw-text-sm tw-rounded tw-font-bold">
                    DRAFT
                  </span>
                </span>
              </h4>
            </v-card-title>

            <div class="tw-flex tw-items-center tw-gap-3">
              <v-btn :loading="approval_loading" :disabled="approval_loading || voidFilterActive" color="blue-grey" outlined
                class="ma-2 white--text" @click="handlePreview">
                {{ show_preview.show ? 'Close Preview' : 'Preview' }}
                <v-icon right dark>
                  mdi-file
                </v-icon>
              </v-btn>

              <!-- Credit Note Action Buttons -->
              <template v-if="show_preview.show && show_preview.doc_type === 'creditNote'">
                <v-btn
                  outlined
                  color="primary"
                  v-if="selectedCreditNote && !['Approved', 'Applied'].includes(selectedCreditNote?.status)"
                  @click="editCreditNote"
                >
                  <v-icon left>mdi-pencil</v-icon>
                  Edit
                </v-btn>
                <v-btn
                  v-if="selectedCreditNote?.status === 'Unapproved'"
                  color="primary"
                  :loading="approval_loading"
                  :disabled="approval_loading"
                  @click="approveCreditNote"
                >
                  <v-icon left>mdi-check</v-icon>
                  Approve
                </v-btn>
                <v-btn @click="downloadCreditNotePDF" :loading="loading_download_url"
                  :disabled="loading_download_url" outlined icon color="blue-grey">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>

              <!-- Debit Note Action Buttons -->
              <template v-if="show_preview.show && show_preview.doc_type === 'debitNote'">
                <v-btn
                  outlined
                  color="primary"
                  v-if="selectedDebitNote && !['Approved', 'Applied'].includes(selectedDebitNote?.status)"
                  @click="editDebitNote()"
                >
                  <v-icon left>mdi-pencil</v-icon>
                  Edit
                </v-btn>
                <v-btn
                  v-if="selectedDebitNote?.status === 'Unapproved' && selectedDebitNote?.total > 0"
                  color="primary"
                  :loading="approval_loading"
                  :disabled="approval_loading"
                  @click="approveDebitNote"
                >
                  <v-icon left>mdi-check</v-icon>
                  Approve
                </v-btn>
                <v-btn @click="downloadDebitNotePDF" :loading="loading_download_url"
                  :disabled="loading_download_url" outlined icon color="blue-grey">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>

              <!-- Invoice Action Buttons -->
              <template v-else-if="!show_preview.show">
                <v-btn @click="generatePdfAndDownloadPDF" :loading="loading_download_url"
                  :disabled="loading_download_url || voidFilterActive" outlined icon color="blue-grey">
                  <v-icon>mdi-download</v-icon>
                </v-btn>

           <v-btn v-if="['Due', 'Overdue', 'Paid'].includes(invoiceData.status) && !invoiceData?.is_draft" @click="emitAction('sendInvoiceEmail', invoiceData)"
             :disabled="voidFilterActive" color="blue-grey" outlined class="ma-2 white--text">
                  send
                  <v-icon right dark>
                    mdi-email-arrow-right-outline
                  </v-icon>
                </v-btn>

              </template>
              <v-btn outlined icon color="green" title="Duplicate Invoice" @click="openDuplicateModal" :disabled="voidFilterActive">
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
              <v-btn @click="() => { emitAction('closeApprovalDialog', invoiceData); reload()}" outlined icon color="red accent-4">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <v-divider></v-divider>

          <v-alert v-if="alert_info.should_show_status" dense text :type="alert_info.success ? 'success' : 'error'">
            {{ alert_info.message }}
          </v-alert>

          <div>

            <v-container v-if="show_preview.show" fluid>
              <CreditNotePreview v-if="show_preview.doc_type == 'creditNote'" :credit_id="this.selectedCreditNoteID" />
              <DebitNotePreview v-else-if="show_preview.doc_type == 'debitNote'" :debit_id="this.selectedCreditNoteID" />
              <InvoicePreview  v-else :invoice_id="invoiceData._id" :userId="invoiceData?.user_id" />
            </v-container>
            <!-- invoice content -->
            <div v-else :class="[invoice_loading ? 'tw-opacity-50 tw-pointer-events-none' : '']">
              <div class="tw-flex tw-justify-end tw-items-center tw-gap-5 tw-py-3">
                <v-btn outlined color="primary" v-if="!['Paid', 'Partially Paid'].includes(invoiceData?.status)" @click="emitAction('openEditor', invoiceData)" :disabled="voidFilterActive">
                  <span class="">Edit</span>
                </v-btn>
                <v-btn   v-if="!['Unapproved', 'Paid'].includes(invoiceData?.status) && !invoiceData?.is_draft" :disabled="voidFilterActive" outlined color="primary" @click="emitAction('openCreditNoteEditor', invoiceData)">
                  <v-icon>mdi-plus</v-icon>
                  <span class="">Credit Note</span>
                </v-btn>
                <v-btn  v-if="!['Unapproved', 'Paid'].includes(invoiceData?.status) && !invoiceData?.is_draft" :disabled="voidFilterActive" outlined color="primary" @click="openDebitNoteEditor(invoiceData)">
                  <v-icon>mdi-plus</v-icon>
                  <span class="">Non Tax Invoice</span>
                </v-btn>
                <v-btn v-if="!['Unapproved', 'Paid'].includes(invoiceData?.status) && !invoiceData?.is_draft" color="green" class="tw-text-white"
                  :disabled="voidFilterActive" @click="emitAction('add-payment', invoiceData)">
                  <v-icon>mdi-plus</v-icon>
                  Create Payment
                </v-btn>
                <v-btn v-if="invoiceData?.status == 'Unapproved' && !invoiceData?.is_draft" color="primary" :loading="approval_loading"
                  :disabled="approval_loading || voidFilterActive" @click="handleInvoiceApproval">
                  <v-icon>mdi-check</v-icon>
                  Approve
                </v-btn>
              </div>
              <v-container class="ma-0 pa-0">
                <v-row>
                  <v-col cols="6">
                    <v-row class="tw-py-0">
                      <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">
                          Invoice Number
                        </p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                          invoiceData?.invoice_number }}</span>
                      </v-col>
                      <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">
                          Term Name
                        </p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                          invoiceData?.terms_name ? invoiceData?.terms_name : 'N/A' }}</span>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">
                          Invoice Due Date
                        </p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ invoiceData?.due_date
                          | formatDateWithoutTime }}</span>
                      </v-col>
                      <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">
                          Status
                        </p>
                        <div class="">
                          <span class="table_btn light_accent4 accent4--text" v-if="invoiceData.status == 'Paid'">{{
                            invoiceData.status }}</span>
                          <span class="table_btn light_accent3 accent3--text"
                            v-else-if="invoiceData.status == 'Overdue'">{{
                              invoiceData.status }}</span>
                          <span class="table_btn light_accent2" style="color: #ff6666"
                            v-else-if="invoiceData.status == 'Partially Paid'">{{ invoiceData.status }}</span>
                          <span class="table_btn light_accent2" style="color: #ff9999"
                            v-else-if="invoiceData.status == 'Due'">{{
                            invoiceData.status }}</span>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="6">
                    <p class="grey-heading-text font-weight-medium textFontSize">
                      Totals
                    </p>
                    <v-card class="tw-bg-gray-100 tw-py-3" elevation="0" bordered>
                      <v-row class="-tw-ml-3">
                        <v-col cols="6 tw-py-1">
                          <p class="grey-heading-text font-weight-medium textFontSize">
                            Subtotal
                          </p>
                        </v-col>
                        <v-col cols="6" class="tw-py-1">
                          <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            invoiceData?.sub_total | currencyFormatter(invoiceData?.currency || 'AED') }}</span>
                        </v-col>
                        <v-col cols="6" class="tw-py-1">
                          <p class="grey-heading-text font-weight-medium textFontSize">
                            VAT total
                          </p>
                        </v-col>
                        <v-col cols="6" class="tw-py-1">
                          <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            invoiceData?.vat_total | currencyFormatter(invoiceData?.currency || 'AED')
                          }}</span>
                        </v-col>
                        <v-col cols="6" class="tw-py-1">
                          <p class="grey-heading-text font-weight-medium textFontSize">
                            Total Amount
                          </p>
                        </v-col>
                        <v-col cols="6" class="tw-py-1">
                          <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ invoiceData?.total |
                            currencyFormatter(invoiceData?.currency || 'AED') }}</span>
                        </v-col>
                        <template v-if="invoiceData?.balance_due > 0 || invoiceData?.status != 'Paid'">
                          <v-col cols="12" class="tw-py-1">
                            <v-divider />
                          </v-col>

                          <!-- Show partial amount paid when status is Partially Paid -->
                          <template v-if="invoiceData?.status === 'Partially Paid' && invoiceData?.partial_amount > 0">
                            <v-col cols="6" class="tw-py-1">
                              <p class="grey-heading-text tw-font-bold textFontSize">
                                Amount Paid
                              </p>
                            </v-col>
                            <v-col cols="6" class="tw-py-1">
                              <span class="darkBlue-heading-text font-weight-normal textFontSize tw-text-green-500">
                                {{ invoiceData?.partial_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                              </span>
                            </v-col>
                          </template>

                          <!-- Show credit applied when credits have been applied -->
                          <template v-if="invoiceData?.credit_amount > 0">
                            <v-col cols="6" class="tw-py-1">
                              <p class="grey-heading-text tw-font-bold textFontSize">
                                Credit Applied
                              </p>
                            </v-col>
                            <v-col cols="6" class="tw-py-1">
                              <span class="darkBlue-heading-text font-weight-normal textFontSize tw-text-blue-500">
                                {{ invoiceData?.credit_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                              </span>
                            </v-col>
                          </template>

                          <!-- Show debit applied when debits have been applied -->
                          <template v-if="invoiceData?.debit_amount > 0">
                            <v-col cols="6" class="tw-py-1">
                              <p class="grey-heading-text tw-font-bold textFontSize">
                                Debit Applied
                              </p>
                            </v-col>
                            <v-col cols="6" class="tw-py-1">
                              <span class="darkBlue-heading-text font-weight-normal textFontSize tw-text-red-500">
                                {{ invoiceData?.debit_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                              </span>
                            </v-col>
                          </template>

                          <v-col cols="6" class="tw-py-1">
                            <p class="grey-heading-text tw-font-bold textFontSize">
                              Remaining Balance
                            </p>
                          </v-col>
                          <v-col cols="6" class="tw-py-1">
                            <span
                              :class="[
                                'darkBlue-heading-text font-weight-normal textFontSize',
                                (invoiceData?.status === 'Paid' || amountToBePaid <= 0)
                                  ? 'tw-text-green-500'
                                  : 'tw-text-red-500'
                              ]"
                            >
                              {{
                                invoiceData?.status === 'Paid' ? 0 : amountToBePaid | currencyFormatter(invoiceData?.currency || 'AED')
                              }}
                            </span>
                          </v-col>
                        </template>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="6">
                    <v-col cols="6">
                      <p class="grey-heading-text font-weight-medium textFontSize">
                        Company
                      </p>
                      <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                        invoiceData?.companyDetails?.company_name }}</span>
                    </v-col>
                    <v-col cols="6">
                      <p class="grey-heading-text font-weight-medium textFontSize">
                        Created On
                      </p>
                      <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                        invoiceData?.createdAt | formatDateWithoutTime
                      }}</span>
                    </v-col>
                  </v-col>
                  <v-col cols="6">
                    <v-col cols="12">
                      <p class="grey-heading-text font-weight-medium textFontSize">
                        Billed To
                      </p>
                      <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                        invoiceData?.billing_address }}</span>
                    </v-col>
                    <v-col cols="12">
                      <p class="grey-heading-text font-weight-medium textFontSize">
                        Contact Email
                      </p>
                      <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ invoiceData?.email
                      }}</span>
                    </v-col>
                  </v-col>
                </v-row>

                <v-divider></v-divider>

                <v-tabs v-model="tab" color="deep-purple accent-4" left>
                  <v-tab :href="'#details'">Invoice Items</v-tab>
                  <v-tab :href="'#credit-notes'">Credit Notes</v-tab>
                  <v-tab :href="'#non-tax'">Non Tax Invoices</v-tab>
                  <v-tab :href="'#payments'">Payments</v-tab>
                  <v-tab :href="'#payment-proofs'">Payment Proofs</v-tab>
                  <v-tab :href="'#memo'">Memo</v-tab>
                  <v-tab :href="'#logs'">Invoice Logs</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab">
                  <v-tab-item :value="'details'">
                    <v-container fluid>
                      <v-data-table :headers="headers" bordered :items="invoiceData.items" :items-per-page="15">
                        <template v-slot:[`item.service_name`]="{ item }">
                          <span class="tw-capitalize">
                            {{
                              typeof item.service_name === 'object' && item.service_name?.name
                                ? item.service_name.name
                                : item.service_name
                            }}
                          </span>
                        </template>
                        <template v-slot:[`item.vat_amount`]="{ item }">
                          {{ item.vat_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.rate`]="{ item }">
                          {{ item.rate | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.net_total`]="{ item }">
                          {{ item.net_total | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                      </v-data-table>
                    </v-container>
                  </v-tab-item>

                                                      <!-- credit notes -->
                  <v-tab-item :value="'credit-notes'">
                    <v-container fluid class="tw-overflow-x-auto">
                      <!-- Apply Custom Credit Note Button -->
                      <div class="tw-mb-4 tw-flex tw-justify-end">
                        <v-btn
                          color="primary"
                          outlined
                          @click="openSelectCustomCreditNoteModal"
                          :disabled="voidFilterActive || !invoiceData?.customer"
                        >
                          <v-icon left>mdi-plus</v-icon>
                          Apply Custom Credit Note
                        </v-btn>
                      </div>

                      <v-data-table :headers="creditNotes_headers" bordered :items="computedCreditNotes"
                        :items-per-page="15" :key="computedCreditNotes.length" class="tw-whitespace-nowrap">

                        <template v-slot:[`item.status`]="{ item }">
                          <div class="">
                            <span class="table_btn light_accent4 accent4--text" v-if="item.status == 'Draft'">{{
                              item.status
                              }}</span>
                            <span class="table_btn light_accent2 accent2--text" v-else-if="item.status == 'Unapproved'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent1 accent1--text" v-else-if="item.status == 'Approved'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent3 accent3--text" v-else-if="item.status == 'Applied'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent3 accent3--text" v-else-if="item.status == 'Void'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent1 accent1--text" v-else-if="item.status == 'Overdue'">{{
                              item.status }}</span>
                          </div>
                        </template>
                        <template v-slot:[`item.total`]="{ item }">
                          {{ item.total | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                         <template v-slot:[`item.credit_amount`]="{ item }">
                          {{ item.credit_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                         <template v-slot:[`item.applied_amount`]="{ item }">
                          {{ item.applied_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.original_invoice_balance`]="{ item }">
                          {{ (item.original_invoice_balance || 0) | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.current_invoice_balance`]="{ item }">
                          {{ (item.current_invoice_balance || invoiceData?.balance_due || 0) | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.application_date`]="{ item }">
                          {{ item.application_date | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.credit_date`]="{ item }">
                          {{ item.credit_date | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.due_date`]="{ item }">
                          {{ item.due_date | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.created_at`]="{ item }">
                          {{ item.createdAt | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.visa_sponsor`]="{ item }">
                          <span v-if="item.visa_sponsor === 'Dynamic Employment Services'" class="tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            DES
                          </span>
                          <span v-else-if="item.visa_sponsor === 'Executive Employment Services'" class="tw-px-2 tw-py-1 tw-bg-green-100 tw-text-green-800 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            EES
                          </span>
                          <span v-else class="tw-px-2 tw-py-1 tw-bg-gray-100 tw-text-gray-600 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            {{ item.visa_sponsor || 'N/A' }}
                          </span>
                        </template>

                        <template v-slot:no-data>
                          <div class="tw-py-6 tw-text-center tw-text-gray-500">
                            No credit notes available
                          </div>
                        </template>

                        <template v-slot:[`item.actions`]="{ item }">
                          <div class="tw-flex tw-items-center tw-gap-3">
                            <a class="d-flex align-center text-decoration-none" href="#"
                              @click.prevent="showCreditNotePreview(item)">
                              <v-icon class="mr-1" small>mdi-printer-eye</v-icon>
                              <span>View</span>
                            </a>
                            <v-btn
                              v-if="item.status === 'Approved' && item.credit_balance > 0"
                              small
                              color="primary"
                              outlined
                              @click="openApplyCreditNoteModal(item)"
                            >
                              <v-icon small left>mdi-check</v-icon>
                              Apply
                            </v-btn>
                            <v-btn
                              v-if="item.status === 'Applied' && item.applied_amount > 0"
                              small
                              color="warning"
                              outlined
                              @click="openReverseCreditNoteModal(item)"
                            >
                              <v-icon small left>mdi-undo</v-icon>
                              Reverse
                            </v-btn>
                            <v-btn
                              v-if="item.status === 'Draft' || item.status === 'Unapproved'"
                              small
                              color="error"
                              outlined
                              @click="voidCreditNote(item)"
                            >
                              <v-icon small left>mdi-delete</v-icon>
                              Void
                            </v-btn>
                          </div>
                        </template>
                      </v-data-table>
                    </v-container>
                  </v-tab-item>

                  <!-- non tax invoices (debit notes) -->
                  <v-tab-item :value="'non-tax'">
                    <v-container fluid class="tw-overflow-x-auto">
                      <v-data-table :headers="debitNotes_headers" bordered :items="computedDebitNotes"
                        :items-per-page="15" :key="computedDebitNotes.length" class="tw-whitespace-nowrap">

                        <template v-slot:[`item.status`]="{ item }">
                          <div class="">
                            <span class="table_btn light_accent4 accent4--text" v-if="item.status == 'Draft'">{{
                              item.status
                              }}</span>
                            <span class="table_btn light_accent2 accent2--text" v-else-if="item.status == 'Unapproved'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent1 accent1--text" v-else-if="item.status == 'Approved'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent3 accent3--text" v-else-if="item.status == 'Applied'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent3 accent3--text" v-else-if="item.status == 'Void'">{{
                              item.status }}</span>
                            <span class="table_btn light_accent1 accent1--text" v-else-if="item.status == 'Overdue'">{{
                              item.status }}</span>
                          </div>
                        </template>
                        <template v-slot:[`item.total`]="{ item }">
                          {{ item.total | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                         <template v-slot:[`item.debit_amount`]="{ item }">
                          {{ item.debit_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                         <template v-slot:[`item.applied_amount`]="{ item }">
                          {{ item.applied_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.original_invoice_balance`]="{ item }">
                          {{ (item.original_invoice_balance || 0) | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.current_invoice_balance`]="{ item }">
                          {{ (item.current_invoice_balance || invoiceData?.balance_due || 0) | currencyFormatter(invoiceData?.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.application_date`]="{ item }">
                          {{ item.application_date | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.debit_date`]="{ item }">
                          {{ item.debit_date | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.due_date`]="{ item }">
                          {{ item.due_date | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.createdAt`]="{ item }">
                          {{ item.createdAt | formatDateWithoutTime }}
                        </template>
                        <template v-slot:[`item.visa_sponsor`]="{ item }">
                          <span v-if="item.visa_sponsor === 'Dynamic Employment Services'" class="tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            DES
                          </span>
                          <span v-else-if="item.visa_sponsor === 'Executive Employment Services'" class="tw-px-2 tw-py-1 tw-bg-green-100 tw-text-green-800 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            EES
                          </span>
                          <span v-else class="tw-px-2 tw-py-1 tw-bg-gray-100 tw-text-gray-600 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            {{ item.visa_sponsor || 'N/A' }}
                          </span>
                        </template>

                        <template v-slot:no-data>
                          <div class="tw-py-6 tw-text-center tw-text-gray-500">
                            No non tax invoices available
                          </div>
                        </template>

                        <template v-slot:[`item.actions`]="{ item }">
                          <div class="tw-flex tw-items-center tw-gap-3">
                            <a class="d-flex align-center text-decoration-none" href="#"
                              @click.prevent="showDebitNotePreview(item)">
                              <v-icon class="mr-1" small>mdi-printer-eye</v-icon>
                              <span>View</span>
                            </a>
                            <a class="d-flex align-center text-decoration-none" href="#"
                              @click.prevent="editDebitNote(item)">
                              <v-icon class="mr-1" small>mdi-pencil</v-icon>
                              <span>Edit</span>
                            </a>
                            <v-btn
                              v-if="item.status === 'Approved'"
                              small
                              color="primary"
                              outlined
                              @click="openApplyDebitNoteModal(item)"
                            >
                              <v-icon small left>mdi-check</v-icon>
                              Apply
                            </v-btn>
                            <v-btn
                              v-if="item.status === 'Applied' && item.applied_amount > 0"
                              small
                              color="warning"
                              outlined
                              @click="openReverseDebitNoteModal(item)"
                            >
                              <v-icon small left>mdi-undo</v-icon>
                              Reverse
                            </v-btn>
                            <v-btn
                              v-if="item.status === 'Draft' || item.status === 'Unapproved'"
                              small
                              color="error"
                              outlined
                              @click="voidDebitNote(item)"
                            >
                              <v-icon small left>mdi-delete</v-icon>
                              Void
                            </v-btn>
                          </div>
                        </template>
                      </v-data-table>
                    </v-container>
                  </v-tab-item>

                  <!-- payments -->
                  <v-tab-item :value="'payments'">
                    <v-container fluid class="tw-overflow-x-auto">
                      <v-data-table :headers="payments_headers" bordered :items="invoice_payments" :items-per-page="15" class="tw-whitespace-nowrap">

                        <template v-slot:[`item.amount`]="{ item }">
                          {{ item.amount | currencyFormatter(item.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.currency`]="{ item }">
                          <span class="tw-font-semibold" :class="{
                            'tw-text-green-600': item.currency === 'USD',
                            'tw-text-blue-600': item.currency === 'EUR',
                            'tw-text-gray-600': item.currency === 'AED' || !item.currency
                          }">
                            {{ item.currency || 'AED' }}
                          </span>
                        </template>
                        <template v-slot:[`item.conversion_rate`]="{ item }">
                          <span v-if="item.conversion_rate && item.conversion_rate !== 1" class="tw-text-sm tw-text-gray-600">
                            {{ item.conversion_rate }}
                          </span>
                          <span v-else class="tw-text-sm tw-text-gray-400 tw-italic">
                            -
                          </span>
                        </template>
                        <template v-slot:[`item.bank_charge`]="{ item }">
                          {{ item.bank_charge || 0 | currencyFormatter(item.currency || 'AED') }}
                        </template>
                        <template v-slot:[`item.payment_mode`]="{ item }">
                          <span class="tw-flex tw-flex-col tw-whitespace-nowrap">
                            {{ item.payment_mode }}
                          </span>
                          <span v-if="['Bank Transfer', 'Payment Link'].includes(item.payment_mode)" class="tw-flex tw-flex-col tw-whitespace-nowrap">
                            <template v-if="item.payment_link">
                              {{ item.payment_link }}
                            </template>
                          </span>
                        </template>

                        <template v-slot:[`item.bank_name`]="{ item }">
                          <span v-if="item.bank_name && item.bank_name.trim()" class="tw-text-sm">
                            {{ item.bank_name }}
                          </span>
                          <span v-else class="tw-text-sm tw-text-gray-400 tw-italic">
                            -
                          </span>
                        </template>

                        <template v-slot:[`item.notes`]="{ item }">
                          <span v-if="item.notes && item.notes.trim()" class="tw-text-sm tw-text-gray-700">
                            {{ item.notes }}
                          </span>
                          <span v-else class="tw-text-sm tw-text-gray-400 tw-italic">
                            -
                          </span>
                        </template>

                        <template v-slot:[`item.rate`]="{ item }">
                          {{ item.rate | currencyFormatter }}
                        </template>
                        <template v-slot:[`item.createdAt`]="{ item }">
                          {{ item.createdAt | formatDateWithoutTime }}
                        </template>

                        <template v-slot:[`item.actions`]="{ item }">
                          <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                icon
                                small
                                v-bind="attrs"
                                v-on="on"
                                :disabled="item.is_reversed"
                              >
                                <v-icon>mdi-dots-vertical</v-icon>
                              </v-btn>
                            </template>
                            <v-list dense>
                              <v-list-item
                                @click="openEditPaymentModal(item)"
                                :disabled="item.is_reversed"
                                class="tw-cursor-pointer"
                              >
                                <v-list-item-icon>
                                  <v-icon color="primary" small>mdi-pencil</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                  <v-list-item-title class="tw-text-sm">
                                    Edit Payment
                                  </v-list-item-title>
                                </v-list-item-content>
                              </v-list-item>
                              <v-list-item
                                @click="openReversePaymentModal(item)"
                                :disabled="item.is_reversed"
                                class="tw-cursor-pointer"
                              >
                                <v-list-item-icon>
                                  <v-icon color="error" small>mdi-undo</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                  <v-list-item-title class="tw-text-sm">
                                    {{ item.is_reversed ? 'Already Reversed' : 'Reverse Payment' }}
                                  </v-list-item-title>
                                </v-list-item-content>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </template>
                      </v-data-table>
                    </v-container>
                  </v-tab-item>

                  <!-- Reverse Payment Modal -->
                  <ReversePaymentModal
                    :open="reversePaymentModal.open"
                    :payment="selectedPaymentForReversal"
                    :loading="reversalLoading"
                    @confirm="confirmReversePayment"
                    @close="cancelReversePayment"
                  />

                  <!-- Edit Payment Modal -->
                  <EditPaymentModal
                    :open="editPaymentModal.open"
                    :payment="selectedPaymentForEdit"
                    :loading="editPaymentLoading"
                    @confirm="confirmEditPayment"
                    @close="cancelEditPayment"
                  />

                  <!-- Payment Proofs Tab -->
                  <v-tab-item :value="'payment-proofs'">
                    <v-container fluid>
                      <div class="tw-mb-6">
                        <h3 class="tw-text-xl tw-font-semibold tw-text-gray-800 tw-mb-2">Payment Proofs</h3>
                        <p class="tw-text-sm tw-text-gray-600">Review attached payment proof documents and compare amounts with invoice total</p>
                      </div>

                      <!-- Loading State -->
                      <div v-if="loading_payment_proofs" class="tw-flex tw-justify-center tw-items-center tw-py-12">
                        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                        <span class="tw-ml-4 tw-text-gray-600 tw-text-lg">Loading payment proofs...</span>
                      </div>

                      <!-- Payment Proofs Content -->
                      <div v-else>
                        <!-- Payment Proofs Table -->
                        <v-data-table
                          v-if="payment_proofs.length > 0"
                          :headers="payment_proofs_headers"
                          :items="payment_proofs"
                          :items-per-page="10"
                          class="tw-whitespace-nowrap"
                          bordered
                          elevation="1"
                        >
                          <template v-slot:[`item.name`]="{ item }">
                            <div class="tw-flex tw-items-center tw-gap-3">
                              <v-icon color="primary" size="20">mdi-file-document</v-icon>
                              <span class="tw-text-sm tw-font-medium tw-text-gray-800">{{ item.name }}</span>
                            </div>
                          </template>

                          <template v-slot:[`item.document_number`]="{ item }">
                            <span v-if="item.document_number && item.document_number.trim()" class="tw-text-sm tw-font-semibold tw-text-blue-600">
                              {{ item.document_number | currencyFormatter(invoiceData?.currency || 'AED') }}
                            </span>
                            <span v-else class="tw-text-sm tw-text-gray-400 tw-italic">No amount</span>
                          </template>

                          <template v-slot:[`item.doc_status`]="{ item }">
                            <v-chip
                              :color="item.doc_status === 'active' ? 'green' : 'orange'"
                              small
                              outlined
                              class="tw-font-medium"
                            >
                              {{ item.doc_status || 'Unknown' }}
                            </v-chip>
                          </template>

                          <template v-slot:[`item.createdAt`]="{ item }">
                            <span class="tw-text-sm tw-text-gray-600">
                              {{ item.createdAt | formatDateWithoutTime }}
                            </span>
                          </template>

                          <template v-slot:[`item.actions`]="{ item }">
                            <div class="tw-flex tw-gap-2">
                              <v-btn
                                icon
                                small
                                color="primary"
                                @click="viewPaymentProof(item)"
                                title="View Document"
                                class="tw-shadow-sm"
                              >
                                <v-icon small>mdi-eye</v-icon>
                              </v-btn>
                              <v-btn
                                icon
                                small
                                color="green"
                                @click="downloadPaymentProof(item)"
                                title="Download Document"
                                class="tw-shadow-sm"
                              >
                                <v-icon small>mdi-download</v-icon>
                              </v-btn>
                            </div>
                          </template>
                        </v-data-table>

                        <!-- Empty State -->
                        <div v-else class="tw-text-center tw-py-16">
                          <v-icon size="80" color="grey lighten-2">mdi-file-document-outline</v-icon>
                          <h4 class="tw-text-xl tw-font-medium tw-text-gray-600 tw-mt-6 tw-mb-2">No Payment Proofs</h4>
                          <p class="tw-text-sm tw-text-gray-500 tw-max-w-md tw-mx-auto">
                            No payment proof documents have been uploaded for this invoice yet.
                            Payment proofs help verify payment amounts before processing.
                          </p>
                        </div>

                        <!-- Payment Proofs Summary -->
                        <!-- <div v-if="payment_proofs.length > 0" class="tw-mt-8">
                          <v-card elevation="2" class="tw-p-6">
                            <div class="tw-flex tw-justify-between tw-items-start tw-mb-4">
                              <div>
                                <h4 class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-1">Payment Proofs Summary</h4>
                                <p class="tw-text-sm tw-text-gray-600">Compare proof amounts with invoice total</p>
                              </div>
                              <div class="tw-text-right">
                                <div class="tw-text-2xl tw-font-bold" :class="getProofSummaryClass()">
                                  {{ total_proof_amount | currencyFormatter(invoiceData?.currency || 'AED') }}
                                </div>
                                <div class="tw-text-sm tw-text-gray-600">
                                  vs Invoice: {{ invoice_total_amount > 0 ? (invoice_total_amount | currencyFormatter(invoiceData?.currency || 'AED')) : 'No invoice total available' }}
                                </div>
                              </div>
                            </div>

                            <div class="tw-mt-4">
                              <v-progress-linear
                                :value="Math.min(proof_amount_percentage, 100)"
                                :color="getProofProgressColor()"
                                height="12"
                                rounded
                                class="tw-mb-2"
                              ></v-progress-linear>
                              <div class="tw-flex tw-justify-between tw-items-center tw-text-sm">
                                <span class="tw-text-gray-600">
                                  {{ invoice_total_amount > 0 ? `${proof_amount_percentage}% of invoice total` : 'Cannot calculate percentage - no invoice total' }}
                                </span>
                                <span v-if="invoice_total_amount > 0 && proof_amount_percentage > 100" class="tw-text-red-600 tw-font-semibold">
                                  Overpaid by {{ (total_proof_amount - invoice_total_amount) | currencyFormatter(invoiceData?.currency || 'AED') }}
                                </span>
                                <span v-else-if="invoice_total_amount > 0 && proof_amount_percentage < 100" class="tw-text-orange-600 tw-font-semibold">
                                  Underpaid by {{ (invoice_total_amount - total_proof_amount) | currencyFormatter(invoiceData?.currency || 'AED') }}
                                </span>
                                <span v-else-if="invoice_total_amount > 0 && proof_amount_percentage === 100" class="tw-text-green-600 tw-font-semibold">Exact match</span>
                                <span v-else class="tw-text-gray-500 tw-font-semibold">No comparison available</span>
                              </div>
                            </div>
                          </v-card>
                        </div> -->
                      </div>
                    </v-container>
                  </v-tab-item>

                  <!-- memo -->
                  <v-tab-item :value="'memo'">
                    <v-container fluid>
                     {{ invoiceData?.memo ?? ''}}
                    </v-container>
                  </v-tab-item>

                  <!-- invoice logs -->
                  <v-tab-item :value="'logs'">
                    <v-container fluid>
                      <div v-if="loading_logs" class="tw-flex tw-justify-center tw-items-center tw-py-8">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        <span class="tw-ml-3 tw-text-gray-600">Loading invoice logs...</span>
                      </div>

                      <div v-else-if="invoice_logs.length === 0" class="tw-text-center tw-py-8 tw-text-gray-500">
                        <v-icon size="64" color="grey lighten-1" class="tw-mb-4">mdi-file-document-outline</v-icon>
                        <p class="tw-text-lg tw-font-medium">No Invoice Logs</p>
                        <p class="tw-text-sm">No activity logs found for this invoice</p>
                      </div>

                      <v-data-table
                        v-else
                        :headers="logs_headers"
                        :items="invoice_logs"
                        :items-per-page="10"
                        class="elevation-1"
                      >
                        <template v-slot:[`item.createdAt`]="{ item }">
                          {{ formatDate(item.createdAt) }}
                        </template>
                        <template v-slot:[`item.logMessage`]="{ item }">
                          <div class="tw-max-w-xs">
                            <div
                              class="tw-text-sm tw-text-gray-700 tw-line-clamp-2 tw-cursor-help tw-transition-all tw-duration-200 hover:tw-bg-gray-50 hover:tw-px-2 hover:tw-py-1 hover:tw-rounded tw-border tw-border-transparent hover:tw-border-gray-200"
                              :title="item.logMessage"
                            >
                              {{ item.logMessage }}
                            </div>
                          </div>
                        </template>
                        <template v-slot:[`item.module`]="{ item }">
                          <v-chip small :color="getModuleColor(item.module)" text-color="white">
                            {{ item.module }}
                          </v-chip>
                        </template>
                        <template v-slot:[`item.userFullName`]="{ item }">
                          <div class="tw-flex tw-items-center tw-gap-2">
                            <v-avatar size="24" color="primary" class="tw-text-xs tw-text-white">
                              {{ getInitials(item.userFullName) }}
                            </v-avatar>
                            <span class="tw-text-sm tw-font-medium">{{ item.userFullName || 'Unknown User' }}</span>
                          </div>
                        </template>
                      </v-data-table>
                    </v-container>
                  </v-tab-item>
                </v-tabs-items>
              </v-container>
            </div>
          </div>


        </v-card>
      </div>
    </v-dialog>

    <!-- Select Custom Credit Note Modal -->
    <selectCustomCreditNoteModal
      v-if="selectCustomCreditNoteModalData.show"
      :isVisible="selectCustomCreditNoteModalData.show"
      :invoiceData="invoiceData"
      @close="closeSelectCustomCreditNoteModal"
      @credit-note-selected="handleCustomCreditNoteSelected"
      @edit-custom-credit-note="handleEditCustomCreditNote"
    />

    <!-- Apply Credit Note Modal -->
    <applyCreditNoteModal
      v-if="applyCreditNoteModalData.show"
      :isVisible="applyCreditNoteModalData.show"
      :creditNoteData="applyCreditNoteModalData.creditNote"
      :invoiceData="invoiceData"
      @handleClose="closeApplyCreditNoteModal"
      @application-success="handleCreditNoteApplicationSuccess"
      @application-error="handleCreditNoteApplicationError"
    />

    <CommonModal
      :open="duplicateModal"
      title="Duplicate invoice?"
      message="A new draft invoice with the same details will be created. You can edit it before saving."
      confirmText="Duplicate"
      cancelText="Cancel"
      type="info"
      @cancel="duplicateModal = false"
      @confirm="confirmDuplicate"
    />

    <!-- Reverse Credit Note Confirmation Modal -->
    <CommonModal
      :open="reverseCreditNoteModal.show"
      title="Reverse Credit Note Application"
      :message="reverseCreditNoteModal.message"
      confirmText="Reverse"
      cancelText="Cancel"
      type="warning"
      @cancel="closeReverseCreditNoteModal"
      @confirm="confirmReverseCreditNote"
    />

    <!-- Void Credit Note Dialog -->
    <v-dialog v-model="voidCreditNoteDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline">
          <v-icon color="error" class="mr-2">mdi-delete</v-icon>
          Void Credit Note
        </v-card-title>

        <v-card-text>
          <p class="mb-4">
            Are you sure you want to void this credit note? This action cannot be undone.
          </p>

          <v-form ref="voidForm" v-model="voidFormValid">
            <v-textarea
              v-model="voidReason"
              label="Reason for voiding"
              placeholder="Please provide a reason for voiding this credit note..."
              :rules="[v => !!v || 'Reason is required']"
              rows="3"
              outlined
              required
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            @click="closeVoidDialog"
            :disabled="voidLoading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="confirmVoidCreditNote"
            :loading="voidLoading"
            :disabled="voidLoading || !voidFormValid"
          >
            <v-icon left>mdi-delete</v-icon>
            Void Credit Note
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Apply Debit Note Modal -->
    <applyDebitNoteModal
      v-if="applyDebitNoteModalData.show"
      :isVisible="applyDebitNoteModalData.show"
      :debitNoteData="applyDebitNoteModalData.debitNote"
      :invoiceData="invoiceData"
      @handleClose="closeApplyDebitNoteModal"
      @application-success="handleDebitNoteApplicationSuccess"
      @application-error="handleDebitNoteApplicationError"
    />

    <!-- Reverse Debit Note Confirmation Modal -->
    <CommonModal
      :open="reverseDebitNoteModal.show"
      title="Reverse Debit Note Application"
      :message="reverseDebitNoteModal.message"
      confirmText="Reverse"
      cancelText="Cancel"
      type="warning"
      @cancel="closeReverseDebitNoteModal"
      @confirm="confirmReverseDebitNote"
    />

    <!-- Void Debit Note Dialog -->
    <v-dialog v-model="voidDebitNoteDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="headline">
          <v-icon color="error" class="mr-2">mdi-delete</v-icon>
          Void Debit Note
        </v-card-title>

        <v-card-text>
          <p class="mb-4">
            Are you sure you want to void this debit note? This action cannot be undone.
          </p>

          <v-form ref="voidForm" v-model="voidFormValid">
            <v-textarea
              v-model="voidReason"
              label="Reason for voiding"
              placeholder="Please provide a reason for voiding this debit note..."
              :rules="[v => !!v || 'Reason is required']"
              rows="3"
              outlined
              required
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            @click="closeVoidDebitNoteDialog"
            :disabled="voidLoading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            @click="confirmVoidDebitNote"
            :loading="voidLoading"
            :disabled="voidLoading || !voidFormValid"
          >
            <v-icon left>mdi-delete</v-icon>
            Void Debit Note
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Debit Note Dialog -->
    <DebitNoteDialog
      v-if="debitNoteDialog"
      :show="debitNoteDialog"
      :originalInvoice="invoiceData"
      :debitNoteToEdit="selectedDebitNote"
      :viewMode="debitNoteViewMode"
      @close="closeDebitNoteDialog"
      @debit-note-created="handleDebitNoteCreated"
      @debit-note-updated="handleDebitNoteUpdated"
    />
  </div>
</template>

<script>
import InvoicePreview from '../ProcessFlow/ActionPreview/InvoicePreview.vue'
import CreditNotePreview from '~/components/Billings/CreditNotePreview.vue'
import DebitNotePreview from '~/components/Billings/DebitNotePreview.vue'
import CommonModal from '~/components/Common/CommonModal.vue'
import ReversePaymentModal from '~/components/Dialogs/reversePaymentModal.vue'
import EditPaymentModal from '~/components/Dialogs/editPaymentModal.vue'
import applyCreditNoteModal from '~/components/Dialogs/applyCreditNoteModal.vue'
import applyDebitNoteModal from '~/components/Dialogs/applyDebitNoteModal.vue'
import selectCustomCreditNoteModal from '~/components/Dialogs/selectCustomCreditNoteModal.vue'
import DebitNoteDialog from '~/components/Dialogs/debitNoteDialog.vue'

export default {
  props: ['InvoiceDetails', 'open', 'voidFilterActive'],
  components: { InvoicePreview, CreditNotePreview, DebitNotePreview, CommonModal, ReversePaymentModal, EditPaymentModal, applyCreditNoteModal, applyDebitNoteModal, selectCustomCreditNoteModal, DebitNoteDialog },
  created() {
    this.invoiceData = this.InvoiceDetails
  },
  data() {
    return {
      tab: 'details',
      invoice_loading: false,
      invoiceData: null, // Initialize invoiceData as reactive
      headers: [
        { text: 'Product/Service', align: 'start', sortable: false, value: 'service_name' },
        { text: 'Description', value: 'description' },
        { text: 'Rate', value: 'rate' },
        { text: 'Tax', value: 'tax_name' },
        { text: 'VAT', value: 'vat_amount' },
        { text: 'Amount', value: 'net_total' },
      ],
      approval_loading: false,
      selectedCreditNoteID: null,
      selectedCreditNote: null,
      voidCreditNoteDialog: false,
      voidDebitNoteDialog: false,
      creditNoteToVoid: null,
      debitNoteToVoid: null,
      voidReason: '',
      voidLoading: false,
      voidFormValid: false,
      show_preview: { show: false, doc_type: 'invoice' },
      loading_download_url: false,
      invoice_download_url: '',
      alert_info: { should_show_status: false, success: true, message: '' },
      creditNotes_headers: [
        { text: 'Ref Number', align: 'start', sortable: false, value: 'credit_note_number', class: 'tw-whitespace-nowrap' },
        { text: 'Entity', value: 'visa_sponsor', sortable: false, class: 'tw-whitespace-nowrap' },
        { text: 'Total', value: 'total', class: 'tw-whitespace-nowrap' },
        { text: 'Credit Amount', value: 'credit_amount', class: 'tw-whitespace-nowrap' },
        { text: 'Applied Amount', value: 'applied_amount', class: 'tw-whitespace-nowrap' },
        { text: 'Original Balance', value: 'original_invoice_balance', class: 'tw-whitespace-nowrap' },
        { text: 'Current Balance', value: 'current_invoice_balance', class: 'tw-whitespace-nowrap' },
        { text: 'Applied Date', value: 'application_date', class: 'tw-whitespace-nowrap' },
        { text: 'Due Date', value: 'due_date', class: 'tw-whitespace-nowrap' },
        { text: 'Created On', value: 'credit_date', class: 'tw-whitespace-nowrap' },
        { text: 'Status', value: 'status', class: 'tw-whitespace-nowrap' },
        { text: 'Actions', value: 'actions', sortable: false, class: 'tw-whitespace-nowrap' },
      ],
      payments_headers: [
        { text: 'Payment ID', align: 'start', sortable: false, value: 'payment_number', class: 'tw-whitespace-nowrap' },
        { text: 'Reference Number', align: 'start', sortable: false, value: 'reference', class: 'tw-whitespace-nowrap' },
        { text: 'Amount', value: 'amount', class: 'tw-whitespace-nowrap' },
        { text: 'Currency', value: 'currency', class: 'tw-whitespace-nowrap' },
        { text: 'Exchange Rate', value: 'conversion_rate', class: 'tw-whitespace-nowrap' },
        { text: 'Bank Charges', value: 'bank_charge', class: 'tw-whitespace-nowrap' },
        { text: 'Payment Method', value: 'payment_mode', class: 'tw-whitespace-nowrap' },
        { text: 'Bank Name', value: 'bank_name', class: 'tw-whitespace-nowrap' },
        { text: 'Remarks', value: 'notes', class: 'tw-whitespace-nowrap' },
        { text: 'Payment Date', value: 'createdAt', class: 'tw-whitespace-nowrap' },
        { text: 'Actions', value: 'actions', sortable: false, class: 'tw-whitespace-nowrap' },
      ],
      // Non tax invoices (debit notes)
      debitNotes_headers: [
        { text: 'Ref Number', align: 'start', sortable: false, value: 'debit_note_number', class: 'tw-whitespace-nowrap' },
        { text: 'Entity', value: 'visa_sponsor', sortable: false, class: 'tw-whitespace-nowrap' },
        { text: 'Total', value: 'total', class: 'tw-whitespace-nowrap' },
        { text: 'Debit Amount', value: 'debit_amount', class: 'tw-whitespace-nowrap' },
        { text: 'Applied Amount', value: 'applied_amount', class: 'tw-whitespace-nowrap' },
        { text: 'Original Balance', value: 'original_invoice_balance', class: 'tw-whitespace-nowrap' },
        { text: 'Current Balance', value: 'current_invoice_balance', class: 'tw-whitespace-nowrap' },
        { text: 'Applied Date', value: 'application_date', class: 'tw-whitespace-nowrap' },
        { text: 'Due Date', value: 'due_date', class: 'tw-whitespace-nowrap' },
        { text: 'Created On', value: 'debit_date', class: 'tw-whitespace-nowrap' },
        { text: 'Status', value: 'status', class: 'tw-whitespace-nowrap' },
        { text: 'Actions', value: 'actions', sortable: false, class: 'tw-whitespace-nowrap' },
      ],
      loading_payments: false,
      invoice_payments: [],
      // Payment Proofs
      loading_payment_proofs: false,
      payment_proofs: [],
      payment_proofs_headers: [
        { text: 'Document Name', align: 'start', sortable: false, value: 'name', class: 'tw-whitespace-nowrap' },
        { text: 'Amount', value: 'document_number', class: 'tw-whitespace-nowrap' },
        { text: 'Status', value: 'doc_status', class: 'tw-whitespace-nowrap' },
        { text: 'Uploaded Date', value: 'createdAt', class: 'tw-whitespace-nowrap' },
        { text: 'Actions', value: 'actions', sortable: false, class: 'tw-whitespace-nowrap' },
      ],
      // Reverse Payment Modal
      reversePaymentModal: {
        open: false,
        title: 'Reverse Payment',
        message: '',
        confirmText: 'Reverse Payment',
        cancelText: 'Cancel',
        type: 'warning'
      },
      selectedPaymentForReversal: null,
      reversalReason: '',
      reversalLoading: false,
      // Edit Payment Modal
      editPaymentModal: {
        open: false
      },
      selectedPaymentForEdit: null,
      editPaymentLoading: false,
      duplicateModal: false,
      duplicating: false,
      loading_logs: false,
      invoice_logs: [],
      logs_headers: [
        { text: 'Date', align: 'start', sortable: true, value: 'createdAt' },
        { text: 'Module', align: 'start', sortable: true, value: 'module' },
        { text: 'Message', align: 'start', sortable: false, value: 'logMessage' },
        { text: 'User', align: 'start', sortable: true, value: 'userFullName' },
      ],
      applyCreditNoteModalData: {
        show: false,
        creditNote: null
      },
      selectCustomCreditNoteModalData: {
        show: false
      },
      reverseCreditNoteModal: {
        show: false,
        creditNote: null,
        message: ''
      },
      // Debit Note Dialog Properties
      debitNoteDialog: false,
      debitNoteViewMode: false,
      selectedDebitNote: null,
      applyDebitNoteModalData: {
        show: false,
        debitNote: null
      },
      reverseDebitNoteModal: {
        show: false,
        debitNote: null,
        message: ''
      },
      debitNoteToVoid: null,
      voidReason: '',
      voidLoading: false,
      voidFormValid: false
    }
  },
  watch: {
    // Watch for tab changes to fetch logs when logs tab is selected
    tab(newVal) {
      if (newVal === 'logs' && this.invoiceData?._id) {
        this.fetchInvoiceLogs()
      }
      // Fetch payment proofs when payment-proofs tab is selected
      if (newVal === 'payment-proofs' && this.invoiceData?._id) {
        this.fetchPaymentProofs()
      }
    }
  },
  async mounted() {
    this.handleRecordPayment()
    await Promise.all([
      this.fetchInvoicePayments(),
      this.fetchInvoiceInformation()
    ])
  },
  beforeUnmount() {
    this.$nuxt.$off('record-payment-status')
  },
  computed: {
            computedCreditNotes() {
      // Prioritize invoiceData (from API) over InvoiceDetails (from props)
      const invoiceData = this.invoiceData;
      const invoiceDetails = this.InvoiceDetails;

      // Get credit note details - prioritize API data over prop data
      let details = null;

      if (invoiceData && invoiceData.creditNoteDetails) {
        details = invoiceData.creditNoteDetails;
      } else if (invoiceDetails && invoiceDetails.creditNoteDetails) {
        details = invoiceDetails.creditNoteDetails;
      }

      // Return the array if it exists and has items
      if (details && Array.isArray(details) && details.length > 0) {
        return details;
      }

      return [];
    },
    amountToBePaid() {
      // All credit notes
      const credit_notes = this.invoiceData?.creditNoteDetails || []
      const debit_notes = this.invoiceData?.debitNoteDetails || []
      const balanceDue = this.invoiceData?.balance_due || 0
      console.log('partial amount: ', this.invoiceData?.partial_amount)
      const partial_amount = this.invoiceData?.partial_amount || 0

      // All payments (assumed stored in component data or passed in another way)
      // const payments = this.invoice_payments || []

      // // Sum of credit notes
      // const totalCredits = credit_notes.reduce((sum, note) => {
      //   return sum + (note.applied_amount || 0)
      // }, 0)

      //  // Sum of debit notes
      //  const totalDebits = credit_notes.reduce((sum, note) => {
      //   return sum + (note.applied_amount || 0)
      // }, 0)

      // // Sum of payments
      // const totalPayments = payments.reduce((sum, payment) => {
      //   return sum + (payment.amount || 0)
      // }, 0)

      // Final amount to be paid
      const amountToBePaid = balanceDue - partial_amount

      return amountToBePaid
    },
    computedDebitNotes() {
      const details = this.invoiceData?.debitNoteDetails
      if (Array.isArray(details)) return details
      if (details && typeof details === 'object' && Object.keys(details).length) {
        return [details]
      }
      return []
    },
    // Payment Proofs Computed Properties
    total_proof_amount() {
      return this.payment_proofs.reduce((total, proof) => {
        const amount = parseFloat(proof.document_number) || 0
        return total + amount
      }, 0)
    },
    invoice_total_amount() {
      // Get invoice total with proper validation
      const total = this.invoiceData?.total_amount
      if (total === null || total === undefined || total === '') {
        return 0
      }
      const parsedTotal = parseFloat(total)
      return isNaN(parsedTotal) ? 0 : parsedTotal
    },
    proof_amount_percentage() {
      const invoiceTotal = this.invoice_total_amount
      if (invoiceTotal === 0) return 0
      return Math.round((this.total_proof_amount / invoiceTotal) * 100)
    }
  },
  methods: {

    showCreditNotePreview(item){
      this.selectedCreditNoteID = item._id
      this.selectedCreditNote = item
      this.show_preview = {
        doc_type: 'creditNote',
        show: true,
      }
    },

    editCreditNote() {
      if (this.selectedCreditNote) {
        this.$emit('edit-credit-note', this.selectedCreditNote)
      }
    },

    editDebitNote(debitNote) {
      // If debitNote is provided (from table), use it; otherwise use selectedDebitNote (from preview panel)
      const debitNoteToEdit = debitNote || this.selectedDebitNote

      if (debitNoteToEdit) {
        console.log('Opening debit note for editing:', debitNoteToEdit)
        this.debitNoteViewMode = true
        this.debitNoteDialog = true
        this.selectedDebitNote = debitNoteToEdit // Ensure selectedDebitNote is set
        this.invoicePreviewFlag = false // Close the preview panel when opening debit note dialog
      }
    },

    async approveCreditNote() {
      if (!this.selectedCreditNote) return

      try {
        this.approval_loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.$post(
          `/credit/notes/approve`,
          { creditNoteId: this.selectedCreditNote._id },
          { headers: { Authorization: AuthStr } }
        )

        if (response) {
          this.$nuxt.$emit('show-snackbar', {
            message: 'Credit note approved successfully!',
            type: 'success'
          })

          // Update the selected credit note status
          this.selectedCreditNote.status = 'Approved'

          // Refresh the invoice data to update credit notes list
          this.$emit('reload')
        }
      } catch (error) {
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to approve credit note. Please try again.',
          type: 'error'
        })
      } finally {
        this.approval_loading = false
      }
    },

    async approveDebitNote() {
      if (!this.selectedDebitNote) return

      try {
        this.approval_loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.$post(
          `/debit/notes/approve`,
          { debitNoteId: this.selectedDebitNote._id },
          { headers: { Authorization: AuthStr } }
        )

        if (response) {
          this.$nuxt.$emit('show-snackbar', {
            message: 'Debit note approved successfully!',
            type: 'success'
          })

          // Update the selected debit note status
          this.selectedDebitNote.status = 'Approved'

          // Refresh the invoice data to update debit notes list
          this.$emit('reload')
        }
      } catch (error) {
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to approve debit note. Please try again.',
          type: 'error'
        })
      } finally {
        this.approval_loading = false
      }
    },

    async downloadCreditNotePDF() {
      if (!this.selectedCreditNote) return

      try {
        this.loading_download_url = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.get(
          `/credit/notes/pdf/${this.selectedCreditNote._id}`,
          {
            headers: { Authorization: AuthStr },
            responseType: 'blob'
          }
        )

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `credit-note-${this.selectedCreditNote.credit_note_number}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        this.$nuxt.$emit('show-snackbar', {
          message: 'Credit note PDF downloaded successfully!',
          type: 'success'
        })
      } catch (error) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to download credit note PDF. Please try again.',
          type: 'error'
        })
      } finally {
        this.loading_download_url = false
      }
    },

    async downloadDebitNotePDF() {
      if (!this.selectedDebitNote) return

      try {
        this.loading_download_url = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.get(
          `/debit/notes/pdf/preview/${this.selectedDebitNote._id}`,
          {
            headers: { Authorization: AuthStr },
            responseType: 'blob'
          }
        )

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `debit-note-${this.selectedDebitNote.debit_note_number}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        this.$nuxt.$emit('show-snackbar', {
          message: 'Debit note PDF downloaded successfully!',
          type: 'success'
        })
      } catch (error) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Failed to download debit note PDF. Please try again.',
          type: 'error'
        })
      } finally {
        this.loading_download_url = false
      }
    },

    voidCreditNote(creditNote) {
      this.creditNoteToVoid = creditNote
      this.voidReason = ''
      this.voidCreditNoteDialog = true
    },

    async confirmVoidCreditNote() {
      if (!this.voidReason.trim()) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Please provide a reason for voiding the credit note',
          type: 'warning'
        })
        return
      }

      try {
        this.voidLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios.$patch(`/credit/notes/void/${this.creditNoteToVoid._id}`, {
          void_reason: this.voidReason
        }, {
          headers: { Authorization: AuthStr }
        })

        this.$nuxt.$emit('show-snackbar', {
          message: 'Credit note voided successfully',
          type: 'success'
        })

        this.closeVoidDialog()
        await this.fetchInvoiceInformation()
      } catch (error) {
        console.error('Error voiding credit note:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to void credit note',
          type: 'error'
        })
      } finally {
        this.voidLoading = false
      }
    },

    closeVoidDialog() {
      this.voidCreditNoteDialog = false
      this.creditNoteToVoid = null
      this.voidReason = ''
    },

    openSelectCustomCreditNoteModal() {
      this.selectCustomCreditNoteModalData = {
        show: true
      }
    },

    closeSelectCustomCreditNoteModal() {
      this.selectCustomCreditNoteModalData = {
        show: false
      }
    },

    handleCustomCreditNoteSelected(data) {
      // Close selection modal
      this.closeSelectCustomCreditNoteModal()

      // Open apply modal with selected credit note
      this.openApplyCreditNoteModal(data.creditNote)
    },

    handleEditCustomCreditNote(creditNote) {
      // Emit event to parent to open custom credit note dialog for editing
      this.$emit('edit-custom-credit-note', creditNote)
      // Close selection modal
      this.closeSelectCustomCreditNoteModal()
    },

    openApplyCreditNoteModal(creditNote) {
      this.applyCreditNoteModalData = {
        show: true,
        creditNote: creditNote
      }
    },

    closeApplyCreditNoteModal() {
      this.applyCreditNoteModalData = {
        show: false,
        creditNote: null
      }
    },

    async handleCreditNoteApplicationSuccess(data) {
      try {
        // Show success message
        this.showSnackStatus(
          `Credit note ${data.creditNote.credit_note_number} applied successfully! Amount: AED ${data.amountToApply.toFixed(2)}`,
          true
        )

        // Close the modal
        this.closeApplyCreditNoteModal()

        // Refresh invoice data to show updated balances
        await this.fetchInvoiceInformation()

      } catch (error) {
        console.error('Error handling credit note application success:', error)
      }
    },

    handleCreditNoteApplicationError(data) {
      // Show error message
      this.showSnackStatus(data.error, false)
    },

    openReverseCreditNoteModal(creditNote) {
      this.reverseCreditNoteModal = {
        show: true,
        creditNote: creditNote,
        message: `Are you sure you want to reverse the application of credit note ${creditNote.credit_note_number}? This will restore the applied amount of AED ${creditNote.applied_amount.toFixed(2)} to the invoice balance.`
      }
    },

    closeReverseCreditNoteModal() {
      this.reverseCreditNoteModal = {
        show: false,
        creditNote: null,
        message: ''
      }
    },

    async confirmReverseCreditNote() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const creditNote = this.reverseCreditNoteModal.creditNote

        const response = await this.$axios.$post(
          '/credit/notes/unapply',
          {
            creditNoteId: creditNote._id,
            invoiceId: this.invoiceData._id,
            reversalReason: 'Reversed by user from invoice preview panel'
          },
          { headers: { Authorization: AuthStr } }
        )

        // Show success message
        this.showSnackStatus(
          `Credit note ${creditNote.credit_note_number} application reversed successfully! Amount: AED ${creditNote.applied_amount.toFixed(2)}`,
          true
        )

        // Close the modal
        this.closeReverseCreditNoteModal()

        // Refresh invoice data to show updated balances
        await this.fetchInvoiceInformation()

      } catch (error) {
        console.error('Error reversing credit note:', error)
        this.showSnackStatus(
          error?.response?.data?.message || error?.message || 'Failed to reverse credit note application. Please try again.',
          false
        )
      }
    },

    async applyCreditNote(creditNote) {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Calculate amount to apply (minimum of credit balance and invoice balance due)
        const amountToApply = Math.min(creditNote.credit_balance, this.invoiceData.balance_due)

        const response = await this.$axios.$post(
          `/credit/notes/apply/credit/${creditNote._id}`,
          {
            creditNoteId: creditNote._id,
            amountToApply: amountToApply,
            invoiceId: this.invoiceData._id
          },
          { headers: { Authorization: AuthStr } }
        )

        this.$nuxt.$emit('show-snackbar', {
          message: `Credit note applied successfully! Amount: ${amountToApply}`,
          type: 'success'
        })

        // Refresh invoice data
        await this.fetchInvoiceInformation()

      } catch (error) {
        console.error('Error applying credit note:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to apply credit note. Please try again.',
          type: 'error'
        })
      }
    },
    handlePreview(doc_type = 'invoice'){
      if (!this.show_preview.show) {
        this.show_preview = { show: true, doc_type }
      } else {
        this.show_preview.show = false;
      }
    },
    emitAction(name, parameter) {
      this.$emit(name, parameter)
    },
    async fetchInvoicePayments() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        this.loading_payments = true
        const response = await this.$axios.get(`payments/invoice/${this.InvoiceDetails?._id}`,
          {
            headers: { Authorization: AuthStr },
          }
        )
        console.log('invoice payments: ', response)

        if (response) {
          this.invoice_payments = response.data
        }
      }
      catch (error) {
        console.log('error occurred: ', error)
      }
      finally {
        this.loading_payments = false
      }
    },
    // Reverse Payment Methods
    openReversePaymentModal(payment) {
      this.selectedPaymentForReversal = payment;
      this.reversalReason = '';
      this.reversePaymentModal.message = `Are you sure you want to reverse payment ${payment.payment_number} for ${payment.amount}? This action will update the invoice status and cannot be undone.`;
      this.reversePaymentModal.open = true;
    },
    cancelReversePayment() {
      this.reversePaymentModal.open = false;
      this.selectedPaymentForReversal = null;
      this.reversalReason = '';
    },
    async confirmReversePayment(reason) {
      this.reversalLoading = true;
      try {
        const response = await this.$axios.$post(
          `/payment-reversals/${this.selectedPaymentForReversal._id}/reverse`,
          { reason: reason }
        );

        if (response.success) {
          this.showSnackStatus('Payment reversed successfully', true);
          this.reversePaymentModal.open = false;
          this.selectedPaymentForReversal = null;
          this.reversalReason = '';

          // Refresh payments and invoice data
          await this.fetchInvoicePayments();
          await this.fetchInvoiceInformation();
        }
      } catch (error) {
        console.error('Error reversing payment:', error);
        this.showSnackStatus(
          error.response?.data?.message || 'Failed to reverse payment. Please try again.',
          false
        );
      } finally {
        this.reversalLoading = false;
      }
    },
    // Edit Payment Methods
    openEditPaymentModal(payment) {
      this.selectedPaymentForEdit = payment;
      this.editPaymentModal.open = true;
    },
    cancelEditPayment() {
      this.editPaymentModal.open = false;
      this.selectedPaymentForEdit = null;
    },
    async confirmEditPayment(paymentData) {
      this.editPaymentLoading = true;
      try {
        const payload = {
          ...paymentData,
          customer: this.selectedPaymentForEdit?.customer || this.invoiceData?.customer?._id || this.invoiceData?.customer,
          invoice: this.selectedPaymentForEdit?.invoice || this.invoiceData?._id,
          invoice_number: this.invoiceData?.invoice_number,
          bank_charge: Number(paymentData.bank_charge || 0),
          reference: paymentData.reference || '',
          bank_name: paymentData.bank_name || '',
          payment_link: paymentData.payment_link || '',
          notes: paymentData.notes || ''
        };

        console.log('Edit Payment Payload:', payload);
        console.log('Selected Payment:', this.selectedPaymentForEdit);

        const response = await this.$axios.$patch(
          `/invoice/update/payment/${this.selectedPaymentForEdit._id}`,
          payload
        );

        if (response.data) {
          this.showSnackStatus('Payment updated successfully', true);
          this.editPaymentModal.open = false;
          this.selectedPaymentForEdit = null;

          // Refresh payments and invoice data
          await this.fetchInvoicePayments();
          await this.fetchInvoiceInformation();
        }
      } catch (error) {
        console.error('Error updating payment:', error);
        this.showSnackStatus(
          error.response?.data?.message || 'Failed to update payment',
          false
        );
      } finally {
        this.editPaymentLoading = false;
      }
    },
    showSnackStatus(message, success = true, timeout = 5000) {
      this.alert_info.should_show_status = true
      this.alert_info.message = message
      this.alert_info.success = success
      setTimeout(() => {
        this.alert_info.should_show_status = false
        this.alert_info.message = message
        this.alert_info.success = success
      }, timeout)
    },
    handleRecordPayment() {
      this.$nuxt.$on('record-payment-status', ({ message, success }) => {
        this.showSnackStatus(message, success)
        this.fetchInvoicePayments()
        this.fetchInvoiceInformation()
      })
    },
    async fetchInvoiceInformation() {
      try {
        this.invoice_loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const result = await this.$axios.$post(
          `invoice/id/${this.InvoiceDetails?._id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        // The endpoint previously returned an array; now may return an object.
        // Safely normalize without breaking existing behavior.
        let normalized = null
        if (Array.isArray(result)) {
          normalized = result[0] || null
        } else if (result && typeof result === 'object') {
          // Some backends wrap the payload; if it already contains _id treat as invoice object
          if (result._id || result.invoice_number) {
            normalized = result
          } else if (result.data && (result.data._id || Array.isArray(result.data))) {
            // Fallback if wrapped in a data key
            normalized = Array.isArray(result.data) ? result.data[0] : result.data
          }
        }

        if (normalized) {
          this.$set(this, 'invoiceData', normalized)
        } else {
          console.warn('fetchInvoiceInformation: No invoice object resolved from response shape')
        }
      } catch (error) {
        console.log('could not approve invoice', error?.message)
      } finally {
        this.invoice_loading = false
        // this.reload()
      }
    },
    async handleInvoiceApproval() {
      try {
        this.approval_loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios.$post(
          `/generic/invoice/approve`,
          this.invoiceData,
          {
            headers: { Authorization: AuthStr },
          }
        )
      } catch (error) {
        console.log('could not approve invoice', error?.message)
      } finally {
        this.approval_loading = false
        // this.reload()
        this.fetchInvoiceInformation()
      }
    },
    reload() {
      this.$emit('reload')
    },
    async generatePdfAndDownloadPDF() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        this.loading_download_url = true
        const response = await this.$axios.$post(`/invoice/getpreviewpdf`, { "invoice_id": this.invoiceData?._id }, { headers: { Authorization: AuthStr } })

        console.log('invoice url : ,', response)
        this.invoice_download_url = response?.url
        if (this.invoice_download_url) {
          // Create a hidden anchor element and click it
          const link = document.createElement('a')
          link.href = this.invoice_download_url
          link.download = `${this.invoiceData?.invoice_number}.pdf` // Optional: specify filename
          link.target = '_blank' // Optional: open in new tab or keep as is
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        console.log('Failed to generate PDF', error?.message)
      } finally {
        this.loading_download_url = false
      }
    },
    openDuplicateModal() {
      this.duplicateModal = true;
    },
    async confirmDuplicate() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        this.duplicating = true
        const response = await this.$axios.post(`/invoice/duplicate/${this.invoiceData?._id}`, {}, { headers: { Authorization: AuthStr } })
        const created = response?.data?.invoice
        if (created && created._id) {
          this.$emit('openEditor', created)
          this.$emit('reload')
          this.duplicateModal = false
        }
      } catch (e) {
        console.log('Failed to duplicate invoice', e?.message)
      } finally {
        this.duplicating = false
      }
    },

    async fetchInvoiceLogs() {
      if (!this.invoiceData?._id) return

      this.loading_logs = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get(
          `/invoicelogs/document/${this.invoiceData._id}`,
          { headers: { Authorization: AuthStr } }
        )
        this.invoice_logs = response || []
      } catch (error) {
        console.error('Error fetching invoice logs:', error)
        this.invoice_logs = []
      } finally {
        this.loading_logs = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getModuleColor(module) {
      const colors = {
        'invoice': 'blue',
        'payment': 'green',
        'credit_note': 'orange',
        'debit_note': 'red',
        'email': 'purple',
        'approval': 'teal'
      }
      return colors[module] || 'grey'
    },

    getInitials(fullName) {
      if (!fullName || fullName === 'Unknown User') return '?'

      const names = fullName.trim().split(' ')
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase()
      } else if (names.length >= 2) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
      }
      return '?'
    },

    // Debit Note Methods
    showDebitNotePreview(item) {
      this.selectedCreditNoteID = item._id
      this.selectedCreditNote = item // Keep this for compatibility with existing code
      this.selectedDebitNote = item // Add separate debit note variable
      this.show_preview = {
        doc_type: 'debitNote',
        show: true,
      }
    },

    openApplyDebitNoteModal(debitNote) {
      this.applyDebitNoteModalData = {
        show: true,
        debitNote: debitNote
      }
    },

    closeApplyDebitNoteModal() {
      this.applyDebitNoteModalData = {
        show: false,
        debitNote: null
      }
    },

    async handleDebitNoteApplicationSuccess(data) {
      try {
        // Show success message
        this.showSnackStatus(
          `Debit note ${data.debitNote.debit_note_number} applied successfully! Amount: AED ${data.amountToApply.toFixed(2)}`,
          true
        )

        // Close the modal
        this.closeApplyDebitNoteModal()

        // Refresh invoice data to show updated balances
        await this.fetchInvoiceInformation()

      } catch (error) {
        console.error('Error handling debit note application success:', error)
      }
    },

    handleDebitNoteApplicationError(data) {
      // Show error message
      this.showSnackStatus(data.error, false)
    },

    openReverseDebitNoteModal(debitNote) {
      this.reverseDebitNoteModal = {
        show: true,
        debitNote: debitNote,
        message: `Are you sure you want to reverse the application of debit note ${debitNote.debit_note_number}? This will restore the applied amount of AED ${debitNote.applied_amount.toFixed(2)} to the invoice balance.`
      }
    },

    closeReverseDebitNoteModal() {
      this.reverseDebitNoteModal = {
        show: false,
        debitNote: null,
        message: ''
      }
    },

    async confirmReverseDebitNote() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const debitNote = this.reverseDebitNoteModal.debitNote

        const response = await this.$axios.$post(
          '/debit/notes/unapply',
          {
            debitNoteId: debitNote._id,
            invoiceId: this.invoiceData._id,
            reversalReason: 'Reversed by user from invoice preview panel'
          },
          { headers: { Authorization: AuthStr } }
        )

        // Show success message
        this.showSnackStatus(
          `Debit note ${debitNote.debit_note_number} application reversed successfully! Amount: AED ${debitNote.applied_amount.toFixed(2)}`,
          true
        )

        // Close the modal
        this.closeReverseDebitNoteModal()

        // Refresh invoice data to show updated balances
        await this.fetchInvoiceInformation()

      } catch (error) {
        console.error('Error reversing debit note:', error)
        this.showSnackStatus(
          error?.response?.data?.message || error?.message || 'Failed to reverse debit note application. Please try again.',
          false
        )
      }
    },

    voidDebitNote(debitNote) {
      this.debitNoteToVoid = debitNote
      this.voidReason = ''
      this.voidDebitNoteDialog = true
    },

    async confirmVoidDebitNote() {
      if (!this.voidReason.trim()) {
        this.$nuxt.$emit('show-snackbar', {
          message: 'Please provide a reason for voiding the debit note',
          type: 'warning'
        })
        return
      }

      try {
        this.voidLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios.$patch(`/debit/notes/void/${this.debitNoteToVoid._id}`, {
          void_reason: this.voidReason
        }, {
          headers: { Authorization: AuthStr }
        })

        this.$nuxt.$emit('show-snackbar', {
          message: 'Debit note voided successfully',
          type: 'success'
        })

        this.closeVoidDebitNoteDialog()
        await this.fetchInvoiceInformation()
      } catch (error) {
        console.error('Error voiding debit note:', error)
        this.$nuxt.$emit('show-snackbar', {
          message: error?.response?.data?.message || 'Failed to void debit note',
          type: 'error'
        })
      } finally {
        this.voidLoading = false
      }
    },

    closeVoidDebitNoteDialog() {
      this.voidDebitNoteDialog = false
      this.debitNoteToVoid = null
      this.voidReason = ''
    },

    // Debit Note Dialog Methods
    openDebitNoteEditor(invoice) {
      // Check for existing draft debit note first
      this.$axios.$get(
        `/debit/notes/check-existing-draft?invoiceId=${invoice._id}`,
        {
          headers: { Authorization: 'Bearer '.concat(this.$store.state.token) },
        }
      ).then(response => {
        if (response.exists && response.debitNote) {
          console.log('Found existing draft debit note, opening for editing')
          this.selectedDebitNote = response.debitNote
        } else {
          console.log('No existing draft found, will create new debit note')
          this.selectedDebitNote = null
        }
      }).catch(error => {
        console.error('Error checking for existing draft:', error)
        this.selectedDebitNote = null
      })

      this.debitNoteViewMode = false // Reset view mode for new debit notes
      this.debitNoteDialog = true
      this.invoicePreviewFlag = false // Close the preview panel when opening debit note dialog
    },


    closeDebitNoteDialog() {
      this.debitNoteDialog = false
      this.debitNoteViewMode = false
      this.selectedDebitNote = null
    },

    handleDebitNoteCreated(debitNote) {
      console.log('Debit note created:', debitNote)
      this.$emit('reload')
      this.closeDebitNoteDialog()
    },

    handleDebitNoteUpdated(debitNote) {
      console.log('Debit note updated:', debitNote)
      this.$emit('reload')
      this.closeDebitNoteDialog()
    },

    // Payment Proofs Methods
    async fetchPaymentProofs() {
      try {
        this.loading_payment_proofs = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.get(`documents/foreignid/${this.invoiceData._id}?type=payment_proof`, {
          headers: { Authorization: AuthStr }
        })

        console.log('Payment proofs response:', response.data)

        if (response.data && Array.isArray(response.data)) {
          // Filter for payment proof documents
          this.payment_proofs = response.data.filter(doc => {
            const docType = doc.type?.toString()
            const docTypeName = doc.type_name?.toString()
            const isPaymentProof = docTypeName === 'Payment Proof' || docType === 'Payment Proof'
            const isNotDeleted = !doc.is_deleted

            return isPaymentProof && isNotDeleted
          })

          console.log('Filtered payment proofs:', this.payment_proofs)
        } else {
          this.payment_proofs = []
        }

        // Debug invoice data to help identify NaN issues
        this.debugInvoiceData()

      } catch (error) {
        console.error('Error fetching payment proofs:', error)
        this.payment_proofs = []
      } finally {
        this.loading_payment_proofs = false
      }
    },

    viewPaymentProof(document) {
      if (document.url) {
        window.open(document.url, '_blank')
      }
    },

    downloadPaymentProof(document) {
      if (document.url) {
        const link = document.createElement('a')
        link.href = document.url
        link.download = document.name || 'payment-proof-document'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },

    async deletePaymentProof(document) {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.delete(`documents/${document._id}`, {
          headers: { Authorization: AuthStr },
          data: {
            reason: 'Deleted from invoice preview panel',
            deleted_by: this.$store.state.userData?.user?._id || this.$store.state.userData?.user?.id
          }
        })

        if (response.status === 200) {
          // Remove from local list
          this.payment_proofs = this.payment_proofs.filter(proof => proof._id !== document._id)

          // Show success message
          this.$toast.success('Payment proof deleted successfully')
        }

      } catch (error) {
        console.error('Error deleting payment proof:', error)
        this.$toast.error('Failed to delete payment proof')
      }
    },

    getProofSummaryClass() {
      if (this.proof_amount_percentage > 100) {
        return 'tw-text-red-600'
      } else if (this.proof_amount_percentage < 100) {
        return 'tw-text-orange-600'
      } else {
        return 'tw-text-green-600'
      }
    },

    getProofProgressColor() {
      if (this.proof_amount_percentage > 100) {
        return 'red'
      } else if (this.proof_amount_percentage < 100) {
        return 'orange'
      } else {
        return 'green'
      }
    },

    // Debug method to log invoice data structure
    debugInvoiceData() {
      console.log('Invoice Data Debug:', {
        invoiceData: this.invoiceData,
        total_amount: this.invoiceData?.total_amount,
        total_amount_type: typeof this.invoiceData?.total_amount,
        invoice_total_amount_computed: this.invoice_total_amount,
        total_proof_amount: this.total_proof_amount,
        proof_amount_percentage: this.proof_amount_percentage
      })
    },
  },
}
</script>

<style lang="scss" scoped>
// Line clamp support for older browsers
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Ensure proper text wrapping
.tw-line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
}
</style>
