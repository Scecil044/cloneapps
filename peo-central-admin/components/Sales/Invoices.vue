<template>
  <div style="width: 100%">
    <!-- # ADD INVOICE DIALOG (CANCELED) -->
    <!-- <AddInvoiceDialog
    :toggler="addNewInvoiceDialog"
    @save="handleSaveInvoice($event)"
    @close="addNewInvoiceDialog = false"
    /> -->

    <!-- PAYMENT DIALOG-->

    <NewPaymentDialog
      :isVisible="payment_dialog_visible"
      @handleClose="handlePaymentDialog"
      :amount_received="invoice_pdf.amount"
      :customer_name="invoice_pdf.c_name"
      @handleSubmit="handleSubmitInvoicePayment"
      :deposit_to="accounts_list"
      :payment_errors="payment_errors"
    />

    <ReasonDialog
      :isVisible="writeoff_dialog_visible"
      @handleSubmit="handleSubmitWriteOffInvoice"
      @handleClose="handleWriteOffDialog"
      title="Write off Invoice"
    />
    <ReasonDialog
      :isVisible="void_dialog_visible"
      @handleSubmit="handleSubmitVoidInvoice"
      @handleClose="handleVoidDialog"
      title="Void Invoice"
    />

    <!-- # FILTER DIALOG -->
    <v-dialog
      id="custom_dialog"
      v-model="filterDialog"
      persistent
      max-width="500px"
    >
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Filter</h4>
          <v-icon
            small
            color="subtext"
            class="ml-5"
            @click="filterDialog = false"
            >fa-close</v-icon
          >
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-radio-group>
              <v-radio value="all">
                <template v-slot:label>
                  <span class="text--text">All</span>
                </template>
              </v-radio>
              <v-radio value="week">
                <template v-slot:label>
                  <span class="text--text">Week to date</span>
                </template>
              </v-radio>
              <v-radio value="month">
                <template v-slot:label>
                  <span class="text--text">This month to date</span>
                </template>
              </v-radio>
              <v-radio value="quarter">
                <template v-slot:label>
                  <span class="text--text">This quarter to date</span>
                </template>
              </v-radio>
              <v-radio value="year">
                <template v-slot:label>
                  <span class="text--text">This year to date</span>
                </template>
              </v-radio>
              <v-radio
                value="specific"
                @click="customDataDisabled = !customDataDisabled"
              >
                <template v-slot:label>
                  <span class="text--text">Specific dates</span>
                </template>
              </v-radio>
            </v-radio-group>
            <div class="custom_data">
              <v-row class="ma-0 pa-0">
                <v-spacer></v-spacer>
                <v-col cols="11" class="ma-0 pa-0">
                  <div class="flex_row align-baseline">
                    <span style="min-width: 3rem">From</span>
                    <div>
                      <v-select
                        :disabled="customDataDisabled"
                        :items="daysOfWeek"
                        placeholder="12"
                        style="max-width: 90px !important"
                        class="ml-9"
                        append-icon="fa-chevron-down"
                      ></v-select>
                    </div>
                    <div>
                      <v-select
                        :disabled="customDataDisabled"
                        :items="monthsOfYear"
                        placeholder="Jan"
                        style="max-width: 90px !important"
                        class="ml-3"
                        append-icon="fa-chevron-down"
                      ></v-select>
                    </div>
                    <div>
                      <v-select
                        :disabled="customDataDisabled"
                        :items="Years"
                        placeholder="2022"
                        style="max-width: 120px !important"
                        class="ml-3"
                        append-icon="fa-chevron-down"
                      ></v-select>
                    </div>
                  </div>
                </v-col>
              </v-row>
              <v-row class="ma-0 pa-0">
                <v-spacer></v-spacer>
                <v-col cols="11" class="ma-0 pa-0">
                  <div class="flex_row align-baseline">
                    <span style="min-width: 3rem">Till</span>
                    <div>
                      <v-select
                        :disabled="customDataDisabled"
                        :items="daysOfWeek"
                        placeholder="14"
                        style="max-width: 90px !important"
                        class="ml-9"
                        append-icon="fa-chevron-down"
                      ></v-select>
                    </div>
                    <div>
                      <v-select
                        :disabled="customDataDisabled"
                        :items="monthsOfYear"
                        placeholder="Mar"
                        style="max-width: 90px !important"
                        class="ml-3"
                        append-icon="fa-chevron-down"
                      ></v-select>
                    </div>
                    <div>
                      <v-select
                        :disabled="customDataDisabled"
                        :items="Years"
                        placeholder="2022"
                        style="max-width: 120px !important"
                        class="ml-3"
                        append-icon="fa-chevron-down"
                      ></v-select>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
            <div class="other_filters mt-2">
              <v-row>
                <v-col cols="12" md="6" class="ma-0 pa-0"
                  ><v-checkbox color="primary" label="Customer"></v-checkbox
                ></v-col>
                <v-col cols="12" md="6" class="ma-0 pa-0"
                  ><v-select
                    :items="customerFilter"
                    label="All"
                    append-icon="fa-chevron-down"
                  ></v-select
                ></v-col>
                <v-col cols="12" md="6" class="ma-0 pa-0"
                  ><v-checkbox color="primary" label="Status"></v-checkbox
                ></v-col>
                <v-col cols="12" md="6" class="ma-0 pa-0"
                  ><v-select
                    :items="statusFilter"
                    label="Paid"
                    append-icon="fa-chevron-down"
                  ></v-select
                ></v-col>
                <v-col cols="12" md="6" class="ma-0 pa-0"
                  ><v-checkbox color="primary" label="Show Deleted"></v-checkbox
                ></v-col>
              </v-row>
            </div>
            <v-row class="action_btn mt-5">
              <v-col cols="5" class="ma-0 pa-0"
                ><v-btn class="tall__btn" color="subtext" block outlined
                  ><span class="primary--text">Clear All</span></v-btn
                ></v-col
              >
              <v-spacer></v-spacer>
              <v-col cols="6" class="ma-0 pa-0"
                ><v-btn
                  class="tall__btn"
                  color="primary"
                  block
                  @click="handleApplyFilter"
                  >Apply</v-btn
                ></v-col
              >
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- # Invoice Journal Edit Dialog -->
    <v-dialog
      id="custom_dialog"
      v-model="invoice_journal_edit_dialog"
      min-width="1000px"
    >
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h3 class="text--text">
            <v-icon
              small
              color="subtext"
              class="mr-2 mouse_cursor_pointer"
              @click="handleInvoiceJournalEditDialog('cancel')"
              >fa-arrow-left</v-icon
            >
            Edit Journal
          </h3>
          <div class="flex_row"></div>
          <div class="flex_row">
            <v-btn
              class="tall__btn px-9"
              color="primary"
              min-width="150px"
              @click="handleInvoiceJournalEditDialog('save')"
              >Save</v-btn
            >
            <v-icon
              small
              color="subtext"
              class="ml-5 mouse_cursor_pointer"
              @click="handleInvoiceJournalEditDialog('cancel')"
            >
              fa-close
            </v-icon>
          </div>
        </v-card-title>
        <v-card-text id="card-text">
          <v-simple-table class="invoice_journal_table">
            <template v-slot:default>
              <thead class="invoice_journal_thead">
                <tr class="" style="height: 35px !important">
                  <th
                    v-for="item in edit_invoice_journal_headers"
                    :key="item"
                    class="text-left text--text font-weight-bold edit_invoice_journal_headers"
                    style="
                      font-size: 12px !important;
                      font-weight: 500 !important;
                    "
                  >
                    {{ item }}
                  </th>
                </tr>
              </thead>
              <tbody class="invoice_journal_tbody">
                <tr
                  class="invoice_journal_rows"
                  v-for="(item, index) in edit_invoice_journal_data"
                  :key="index"
                >
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.date"
                      class="rounded-lg"
                      type="date"
                      :placeholder="item.date"
                      solo
                      flat
                      hide-details
                      dense
                      @input="
                        ($event) =>
                          handleChangeJournalValue('date', index, $event)
                      "
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.company"
                      class="rounded-lg"
                      type="text"
                      :placeholder="item.company"
                      solo
                      flat
                      hide-details
                      dense
                      disabled
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.name"
                      class="rounded-lg"
                      type="text"
                      :placeholder="item.name"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                      disabled
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.account_code"
                      class="rounded-lg"
                      type="text"
                      :placeholder="item.account_code"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                      disabled
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-autocomplete
                      :value="item.account_name"
                      :items="accounts_list"
                      placeholder="Account"
                      return-object
                      dense
                      solo
                      flat
                      hide-details
                      item-text="name"
                      :rules="main_rule"
                      v-if="accounts_list.length > 1"
                      append-icon="fa-chevron-down"
                      @change="
                        ($event) =>
                          handleChangeJournalValue(
                            'account_name',
                            index,
                            $event
                          )
                      "
                    ></v-autocomplete>
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.description"
                      class="rounded-lg"
                      type="text"
                      :placeholder="item.description"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.currency"
                      class="rounded-lg"
                      type="text"
                      :placeholder="item.currency"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                      disabled
                    />
                  </td>

                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.debit"
                      class="rounded-lg"
                      type="number"
                      :placeholder="item.debit"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                      @input="
                        ($event) =>
                          handleChangeJournalValue('debit', index, $event)
                      "
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.credit"
                      class="rounded-lg"
                      type="number"
                      :placeholder="item.credit"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                      @input="
                        ($event) =>
                          handleChangeJournalValue('credit', index, $event)
                      "
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.location"
                      class="rounded-lg"
                      type="text"
                      :placeholder="item.location"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                    />
                  </td>
                  <!-- <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.vat_percent"
                      class="rounded-lg"
                      type="number"
                      :placeholder="item.vat_percent"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                    />
                  </td> -->
                  <td class="edit_invoice_journal_td">
                    <v-text-field
                      :value="item.vat_amount"
                      class="rounded-lg"
                      type="number"
                      :placeholder="item.vat_amount"
                      solo
                      flat
                      hide-details
                      dense
                      :rules="main_rule"
                      @input="
                        ($event) =>
                          handleChangeJournalValue('vat', index, $event)
                      "
                    />
                  </td>
                  <td class="edit_invoice_journal_td">
                    <v-btn icon color="error" class="mx-0"
                      ><v-icon class="" color="error" x-small
                        >fa-light fa-trash-can</v-icon
                      ></v-btn
                    >
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <div class="action__btn flex_row justify-lg-space-between mt-5">
            <v-btn
              @click="handleAddLineInvoiceJournalEditDialog()"
              class="small__btn"
              outlined
              color="subtext"
            >
              <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
              <span class="text--text">Add Account</span>
            </v-btn>

            <div class="flex_column">
              <span class="subtext--text mb-3"
                ><span
                  style="
                    min-width: 90px;
                    display: inline-flex;
                    font-weight: 600 !important;
                  "
                  >Invoice Total:</span
                >
                <span class="text--text font-weight-bold ml-2"
                  >AED {{ edit_invoice_journal_total | amountFormatter }}</span
                >
              </span>
              <span class="subtext--text"
                ><span style="min-width: 90px; display: inline-flex"
                  >Credit Total:</span
                >
                <span class="text--text font-weight-bold ml-2"
                  >AED {{ getJournalCreditAmount | amountFormatter }}</span
                >
                (VAT Included)
              </span>
              <span class="subtext--text mt-1"
                ><span style="min-width: 90px; display: inline-flex"
                  >Debit Total:</span
                >
                <span class="text--text font-weight-bold ml-2"
                  >AED {{ getJournalDebitAmount | amountFormatter }}</span
                ></span
              >
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- # TOP TOTAL CARD -->
    <!-- <TotalsCard
      :data="total_invoices"
      :class="privacyMood ? 'privacyMood' : ''"
    /> -->

    <!-- # Invoices Data Table -->
    <v-row class="row1" v-if="!getInvoiceAddEditToggler">
      <!-- Invoices List column (12 - 5) -->
      <v-col :cols="toggle_view ? '5' : '12'">
        <v-card color="card_bg" id="card">
          <v-card-text
            id="card-text"
            style="margin-top: 0 !important"
            :class="privacyMood ? 'privacyMood' : ''"
          >
            <v-data-table
              id="INVOICES"
              class="main__table elevation-0"
              :headers="toggle_view ? sm_invoices_headers : invoices_headers"
              :items="invoices"
              :page="page"
              :pageCount="totalPage"
              :options.sync="options"
              :server-items-length="totalCount"
              :footer-props="{ 'items-per-page-options': [10, 20] }"
              hide-default-footer
              @click:row="handleDataTableRow"
            >
              <template v-slot:item.due_date="{ item }">
                {{ item.due_date | formatDateWithoutTime }}
              </template>
              <template v-slot:item.status="{ item }">
                <div class="status__con">
                  <span
                    :class="
                      item.paid
                        ? 'light_accent4 accent4--text'
                        : item.status === 'Partially Paid'
                        ? 'light_accent3 accent3--text'
                        : 'light_accent2 accent2--text'
                    "
                    class="status"
                  >
                    {{ item.status }}
                  </span>
                </div>
              </template>
              <template v-slot:top>
                <div class="top__con">
                  <div class="flex_row align-center">
                    <v-select
                      label="All Invoices"
                      class="ma-0 pa-0"
                      flat
                      solo
                      append-icon="fa-chevron-down"
                      hide-details=""
                      :items="[
                        'All Invoices',
                        'Draft',
                        'Pending Approval',
                        'Approved',
                        'Customer Viewed',
                        'Partially Paid',
                        'Unpaid',
                        'Overdue',
                        'Payment Initiated',
                        'New Custom View',
                      ]"
                    ></v-select>
                    <v-text-field
                      v-if="!toggle_view"
                      class="search_bar ml-1"
                      v-model="search"
                      label="Search By"
                      color="outline"
                      outlined
                      solo
                      flat
                      hide-details
                      dense
                      @keyup="handleData"
                    >
                      <template slot="prepend-inner">
                        <v-btn icon><v-icon small>fa-search</v-icon></v-btn>
                      </template>
                    </v-text-field>
                  </div>
                  <div class="action__btn">
                    <v-menu
                      transition="slide-y-transition"
                      rounded="lg"
                      offset-y
                    >
                      <template v-slot:activator="{ attrs, on }">
                        <v-btn
                          class="tall__btn ml-2"
                          color="primary"
                          v-bind="attrs"
                          v-on="on"
                        >
                          New
                          <v-divider vertical class="mx-2 white"></v-divider>
                          <LightArrow class="ml-2" style="max-width: 10px" />
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          v-for="(item, index) in new_transaction_menu"
                          :key="index"
                          link
                          @click="handleNewTransaction(item.value)"
                        >
                          <v-list-item-title class="">
                            <span class="n_text text--text ml-2">{{
                              item.title
                            }}</span>
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                    <v-btn
                      class="tall__btn ml-1 subtext--text"
                      color="subtext"
                      outlined
                      @click="filterDialog = true"
                    >
                      <v-icon class="mr-2" small>fa-filter</v-icon>
                      Filter
                    </v-btn>
                    <v-btn
                      class="tall__btn ml-1"
                      :color="toggle_view ? 'subtext' : 'primary'"
                      outlined
                      @click="toggle_view = !toggle_view"
                    >
                      <v-icon class="" small>fa-list</v-icon>
                    </v-btn>
                    <v-btn
                      class="tall__btn ml-1"
                      :color="toggle_view ? 'primary' : 'subtext'"
                      outlined
                      @click="toggle_view = !toggle_view"
                    >
                      <v-icon class="" small>fa-box</v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Invoices PDF Preview Column (7 - 0) -->
      <v-col
        :cols="toggle_view ? '7' : '0'"
        v-if="toggle_view"
        class="invoice_preview"
      >
        <v-card color="card_bg" class="invoice_preview_card">
          <v-card-title class="invoice_preview_card_title">
            <div class="flex_row justify-space-between">
              <div class="d-flex flex-wrap" style="gap: 10px">
                <v-btn
                  class="short__btn"
                  color="subtext"
                  outlined
                  @click.prevent="handleEditInvoice"
                >
                  <v-icon x-small class="mr-1" color="subtext">fa-pen</v-icon>
                  Edit
                </v-btn>
                <v-btn
                  class="short__btn"
                  color="subtext"
                  outlined
                  @click.prevent="sendMailForInvoice"
                >
                  <v-icon class="mr-1" small>fa-mail</v-icon>
                  Send Mail
                </v-btn>
                <v-btn
                  class="short__btn"
                  color="subtext"
                  outlined
                  @click="handleShare"
                >
                  <v-icon class="mr-1" small>fa-share</v-icon>
                  Share
                </v-btn>
                <v-btn
                  class="short__btn"
                  color="subtext"
                  outlined
                  @click="handleRemainder"
                >
                  <v-icon class="mr-1" small>fa-bell</v-icon>
                  Send Reminder
                </v-btn>
                <v-btn
                  class="short__btn"
                  color="subtext"
                  outlined
                  @click.prevent="handlePrint"
                >
                  <v-icon class="mr-1" small>fa-print</v-icon>
                  PDF/Print
                </v-btn>
                <v-btn
                  class="short__btn"
                  color="subtext"
                  outlined
                  @click="handlePaymentDialog"
                >
                  Record Payment
                </v-btn>
                <v-menu transition="" rounded="lg" offset-y>
                  <template v-slot:activator="{ attrs, on }">
                    <v-btn
                      class="short__btn"
                      color="subtext"
                      outlined
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon x-small class="mr-1" color="subtext"
                        >fa-plus</v-icon
                      >
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item link @click.prevent="handleWriteOffDialog">
                      Write Off
                    </v-list-item>
                    <v-list-item link @click.prevent="handleVoidDialog">
                      Void
                    </v-list-item>
                    <v-list-item link @click.prevent="handleDebitNote">
                      Create Debit Note
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>
          </v-card-title>
          <v-card-text class="invoice_preview_card_text">
            <v-container class="preview_invoice ma-0 pa-0">
              <div class="a4__con mx-auto">
                <div class="ribbon">
                  <span
                    class="ribbon_inner"
                    v-html="getInvoiceStatus(invoice_pdf.status).text"
                    :style="{
                      background: getInvoiceStatus(invoice_pdf.status).color,
                    }"
                  ></span>
                </div>
                <v-row class="pdf_heder ma-2 pa-0">
                  <vue-pdf-embed
                    :source="invoice_pdf.invoice_path"
                    class="invoice_embed_pdf"
                  />
                </v-row>
              </div>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- # Add New Invoice Form -->
    <v-row class="row2" v-if="getInvoiceAddEditToggler">
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: auto !important">
          <v-card-title id="card-title">
            <h4 class="text--text" v-if="invoice_in_pdf == false">
              Add New Invoice {{ recurring ? '(Recurring)' : '' }}
            </h4>
            <v-btn
              class="tall__btn"
              color="subtext"
              min-width="50px"
              icon
              v-if="invoice_in_pdf == true"
              @click.prevent="
                () => {
                  invoice_in_pdf = false
                }
              "
            >
              <v-icon small color="subtext" class="mr-1">fa-arrow-left</v-icon>
            </v-btn>
            <span class="text--text mr-9" v-if="recurring"
              >Balance due : 0.00</span
            >
            <div class="flex_row justify-lg-space-between">
              <v-btn
                class="tall__btn mr-2"
                color="lightgray"
                outlined
                @click="closeInvoice"
                v-if="invoice_in_pdf == false"
                >Cancel</v-btn
              >
              <v-btn
                class="tall__btn mr-2"
                color="primary"
                outlined
                @click="handleDraft"
                v-if="invoice_in_pdf === false"
                >Draft</v-btn
              >
              <v-btn
                class="tall__btn mr-2"
                color="primary"
                outlined
                v-if="invoice_in_pdf === false"
                @click="handleSaveAndMail"
                >Save and Mail</v-btn
              >
              <v-btn
                class="tall__btn mr-2"
                color="primary"
                outlined
                @click="recurring = !recurring"
                v-if="invoice_in_pdf == false"
                >{{ recurring ? 'Not' : 'Make' }} Recurring</v-btn
              >

              <v-btn
                class="tall__btn px-9"
                color="primary"
                min-width="150px"
                v-if="invoice_in_pdf == false"
                @click="
                  ($event) =>
                    !invoice_in_pdf
                      ? handleClickCreateInvoice()
                      : (invoice_in_pdf = !invoice_in_pdf)
                "
              >
                {{ invoice_in_pdf ? 'Hide' : 'Create' }} Invoice</v-btn
              >
              <v-btn
                class="tall__btn mr-2"
                color="primary"
                outlined
                v-if="invoice_in_pdf == true"
                onclick="window.open('MyPDF.pdf', '_blank', 'fullscreen=yes'); return false;"
                ><v-icon class="mr-2" small>fa-download</v-icon>Download</v-btn
              >
              <v-btn
                class="tall__btn mr-2"
                color="primary"
                outlined
                v-if="invoice_in_pdf == true"
                @click="handlePrint"
                ><v-icon class="mr-2" small>fa-print</v-icon>Print</v-btn
              >
              <v-btn
                class="tall__btn px-5"
                color="primary"
                min-width="150px"
                v-if="invoice_in_pdf == true"
                @click="handleSaveInvoice(new_invoice_data)"
                ><v-icon class="mr-2" small>fa-check</v-icon>Create
                Invoice</v-btn
              >
            </div>
          </v-card-title>
          <!-- <v-divider id="divider" class="mx-0 px-0 mt-5"></v-divider> -->
          <v-card-text id="card-text" style="margin-top: 20px !important">
            <!-- [1] New Invoice Form -->
            <v-row class="adding_invoice" v-if="invoice_in_pdf == false">
              <!-- # Reoccurring -->
              <v-row v-if="recurring" class="recurring_row_1 mb-5">
                <!-- Template Info -->
                <v-col cols="3">
                  <CustomInputContainer label="Template name">
                    <div slot="input">
                      <v-text-field
                        placeholder="Enter Template Name"
                        outlined
                        hide-details
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="3">
                  <CustomInputContainer label="Type">
                    <div slot="input">
                      <v-select
                        :items="types"
                        placeholder="Delay"
                        outlined
                        hide-details
                        dense
                        :rules="main_rule"
                        append-icon="fa-chevron-down"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="1" align-self="center" class="pl-5 pt-7"
                  >Create</v-col
                >
                <v-col cols="1">
                  <CustomInputContainer label="days">
                    <div slot="input">
                      <v-text-field
                        placeholder="Delay"
                        outlined
                        hide-details
                        dense
                        :rules="main_rule"
                      />
                    </div>
                  </CustomInputContainer>
                </v-col>

                <!-- Daily Weekly Interval -->
                <v-col cols="6">
                  <div class="flex_row">
                    <CustomInputContainer label="Interval">
                      <div slot="input">
                        <v-select
                          v-model="interval"
                          :items="all_intervals"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <!-- Daily + Weekly -->
                    <CustomInputContainer
                      label="every"
                      class="ml-3"
                      v-if="interval == 'Daily' || interval == 'Weekly'"
                    >
                      <div slot="input">
                        <v-text-field
                          :placeholder="
                            interval == 'Daily' ? 'Day(s)' : 'Week(s)'
                          "
                          type="number"
                          outlined
                          hide-details
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer
                      label="every"
                      class="ml-3"
                      v-if="interval == 'Weekly'"
                    >
                      <div slot="input">
                        <v-select
                          :items="week_days"
                          placeholder="Sunday"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <!-- Monthly -->
                    <CustomInputContainer
                      label="on"
                      class="ml-3"
                      v-if="interval == 'Monthly'"
                    >
                      <div slot="input">
                        <v-select
                          v-model="on_day_order_data"
                          :items="on_day_order"
                          placeholder="day/first/.."
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer
                      label="on"
                      class="ml-3"
                      v-if="
                        interval === 'Monthly' && on_day_order_data === 'day'
                      "
                    >
                      <div slot="input">
                        <v-select
                          :items="month_days"
                          placeholder="1st"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer
                      label="every"
                      class="ml-3"
                      v-if="interval == 'Monthly' && on_day_order_data != 'day'"
                    >
                      <div slot="input">
                        <v-select
                          :items="week_days"
                          placeholder="Sunday"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <!-- Year -->
                    <CustomInputContainer
                      label="every"
                      class="ml-3"
                      v-if="interval == 'Yearly'"
                    >
                      <div slot="input">
                        <v-select
                          :items="months"
                          placeholder="January"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer
                      label="on"
                      class="ml-3"
                      v-if="interval === 'Yearly'"
                    >
                      <div slot="input">
                        <v-select
                          :items="month_days"
                          placeholder="1st"
                          outlined
                          hide-details
                          dense
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer
                      label="of every"
                      class="ml-3"
                      v-if="interval == 'Monthly'"
                    >
                      <div slot="input">
                        <v-text-field
                          placeholder="month(s)"
                          type="number"
                          outlined
                          hide-details
                          dense
                          :rules="main_rule"
                        />
                      </div>
                    </CustomInputContainer>
                  </div>
                </v-col>
                <!-- Start and End Date Part -->
                <v-col cols="6">
                  <div class="flex_row">
                    <v-divider vertical class="ma-0 pa-0 mt-5 mr-2"></v-divider>
                    <CustomInputContainer label="Start date" class="ml-3">
                      <div slot="input">
                        <v-menu
                          v-model="start_date_menu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="start_date"
                              placeholder="Enter Due Date"
                              outlined
                              hide-details
                              dense
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              :rules="main_rule"
                            />
                          </template>
                          <v-date-picker
                            v-model="start_date"
                            @input="start_date_menu = false"
                          />
                        </v-menu>
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer label="End" class="ml-3">
                      <div slot="input">
                        <v-select
                          v-model="end_interval"
                          :items="all_end_interval_date"
                          full-width
                          outlined
                          hide-details
                          dense
                          :rules="main_rule"
                          append-icon="fa-chevron-down"
                        />
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer
                      label="End Date"
                      class="ml-3"
                      v-if="end_interval == 'By'"
                    >
                      <div slot="input">
                        <v-menu
                          v-model="end_date_menu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="end_date"
                              placeholder="Enter End Date"
                              outlined
                              hide-details
                              dense
                              readonly
                              v-bind="attrs"
                              v-on="on"
                              :rules="main_rule"
                            />
                          </template>
                          <v-date-picker
                            v-model="end_date"
                            @input="end_date_menu = false"
                          />
                        </v-menu>
                      </div>
                    </CustomInputContainer>
                    <CustomInputContainer
                      label="Occurrences"
                      class="ml-3"
                      v-if="end_interval == 'After'"
                    >
                      <div slot="input">
                        <v-text-field
                          type="number"
                          outlined
                          hide-details
                          dense
                        />
                      </div>
                    </CustomInputContainer>
                  </div>
                </v-col>
              </v-row>

              <!-- # Not Reoccurring -->
              <v-form ref="form" v-model="valid" lazy-validation class="row">
                <v-row class="not_recurring_row_3 py-0 my-0" style="gap: 20px">
                  <v-col
                    cols="12"
                    md="5"
                    class="px-0"
                    style="height: fit-content"
                  >
                    <v-row>
                      <v-col cols="12">
                        <CustomInputContainer label="Company Identification">
                          <div slot="input">
                            <v-select
                              v-model="company_id"
                              :items="companySelection"
                              placeholder="Current Company"
                              return-object
                              outlined
                              dense
                              item-text="name"
                              :rules="main_rule"
                              v-if="companySelection.length > 1"
                              append-icon="fa-chevron-down"
                            ></v-select>
                            <v-text-field
                              :value="company_id?.name ?? 'Select a Company'"
                              outlined
                              hide-details
                              dense
                              disabled
                              v-else
                            />
                          </div>
                        </CustomInputContainer>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="6">
                        <CustomInputContainer label="Customer">
                          <div slot="input">
                            <!-- <v-select
                              v-model="new_invoice.customer"
                              :items="getCustomers"
                              item-text="customer_name"
                              placeholder="Enter Customer Name"
                              @change="onCustomerChanged"
                              return-object
                              outlined
                              dense
                              :rules="main_rule"
                            ></v-select> -->
                            <v-autocomplete
                              v-model="new_invoice.customer"
                              :items="getCustomers"
                              item-text="customer_name"
                              placeholder="Enter Customer Name"
                              @change="onCustomerChanged"
                              return-object
                              outlined
                              dense
                              v-if="Object.keys(company_id).length"
                              :rules="main_rule"
                              append-icon="fa-chevron-down"
                            ></v-autocomplete>
                            <p class="error--text" v-else>
                              Please select the company
                            </p>
                          </div>
                        </CustomInputContainer>
                      </v-col>
                      <v-col cols="6" v-if="Object.keys(company_id).length">
                        <CustomInputContainer label="Customer Email">
                          <div slot="input">
                            <v-text-field
                              v-model="new_invoice.email"
                              placeholder="Enter Customer Email"
                              outlined
                              dense
                              :rules="main_rule"
                            />
                          </div>
                        </CustomInputContainer>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12">
                        <CustomInputContainer label="Billing Address">
                          <div slot="input">
                            <v-textarea
                              v-model="new_invoice.billing_address"
                              placeholder="Enter Customer Billing Address"
                              outlined
                              dense
                              :rules="main_rule"
                            />
                          </div>
                        </CustomInputContainer>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="6">
                        <CustomInputContainer label="Message on invoice">
                          <div slot="input">
                            <v-textarea
                              placeholder="Enter Message on invoice"
                              outlined
                              dense
                              v-model="customer_note"
                              height="80px"
                              :rules="main_rule"
                            />
                          </div>
                        </CustomInputContainer>
                      </v-col>
                      <v-col cols="6">
                        <CustomInputContainer label="Message on Statement">
                          <div slot="input">
                            <v-textarea
                              placeholder="Enter Message on Statement"
                              outlined
                              dense
                              v-model="customer_statement"
                              height="80px"
                              :rules="main_rule"
                            />
                          </div>
                        </CustomInputContainer>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col
                    cols="12"
                    md="5"
                    class="px-0"
                    style="height: fit-content"
                  >
                    <!-- <v-row>
                    <v-col cols="12">
                      <CustomInputContainer label="Invoice No.">
                        <div slot="input">
                          <v-text-field
                            placeholder="Enter Invoice Number"
                            outlined
                            hide-details
                            dense
                            :rules="main_rule"
                          />
                        </div>
                      </CustomInputContainer>
                    </v-col>
                  </v-row> -->
                    <v-row>
                      <v-col cols="6">
                        <CustomInputContainer label="Terms">
                          <div slot="input">
                            <v-select
                              v-model="term"
                              :items="terms_menu"
                              item-text="name"
                              placeholder="Select Terms"
                              @change="onTermsChanged"
                              return-object
                              outlined
                              hide-details
                              dense
                              :rules="main_rule"
                              append-icon="fa-chevron-down"
                            ></v-select>
                          </div>
                        </CustomInputContainer>
                      </v-col>
                      <!-- <v-col cols="6">
                        <CustomInputContainer label="Sale Location">
                          <div slot="input">
                            <v-text-field
                              placeholder="Enter Sale Location"
                              outlined
                              dense
                              v-model="sale_location"
                              :rules="main_rule"
                            />
                          </div>
                        </CustomInputContainer>
                      </v-col> -->
                    </v-row>
                    <v-row>
                      <v-col cols="6">
                        <CustomInputContainer label="Invoice Date">
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
                                  v-model="new_invoice.date"
                                  placeholder="Enter Date"
                                  outlined
                                  dense
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  :rules="main_rule"
                                />
                              </template>
                              <v-date-picker
                                v-model="new_invoice.date"
                                @input="
                                  date_menu = false
                                  onTermsChanged(term)
                                "
                              />
                            </v-menu>
                          </div>
                        </CustomInputContainer>
                      </v-col>
                      <v-col cols="6">
                        <CustomInputContainer label="Due Date">
                          <div slot="input">
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
                                  v-model="new_invoice.due_date"
                                  placeholder="Enter Due Date"
                                  outlined
                                  dense
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  :rules="main_rule"
                                />
                              </template>
                              <v-date-picker
                                v-model="new_invoice.due_date"
                                @input="due_date_menu = false"
                              />
                            </v-menu>
                          </div>
                        </CustomInputContainer>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-form>

              <v-spacer class="my-9"></v-spacer>

              <!-- # Dynamic Table + Invoice Journal -->
              <v-row class="dialog_table pa-0 ma-0 mt-9">
                <!-- Dynamic Table -->
                <v-col cols="12" class="">
                  <v-simple-table dense class="dynamic_table">
                    <template v-slot:default>
                      <thead class="dynamic_table_thead">
                        <tr class="" style="height: 35px !important">
                          <th
                            v-for="item in addNewInvoicePreviewTableHeaders"
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
                        v-for="(item, index) in new_invoiceProducts"
                        :key="index"
                        v-if="
                          Object.keys(company_id).length &&
                          new_invoice.customer !== ''
                        "
                      >
                        <tr
                          :key="index"
                          class="dynamic_table_body_rows"
                          style="border-bottom: 0.5 solid red !important"
                        >
                          <td class="py-2 text-center">
                            <v-select
                              class="rounded-lg"
                              :items="product"
                              placeholder="Select Product/Service"
                              solo
                              flat
                              hide-details
                              :value="item.service_name"
                              dense
                              :rules="main_rule"
                              append-icon="fa-chevron-down"
                              :disabled="journal_modified"
                              @change="
                                (value) => {
                                  if (item.service_name !== '') {
                                    handleDeleteExistingProductJournal(
                                      item.service_name,
                                      index
                                    )
                                  }
                                  handleInvoiceProduct(
                                    value.name,
                                    index,
                                    'service_name'
                                  )
                                  handleInvoiceProduct(
                                    value._id,
                                    index,
                                    'service'
                                  )
                                  handlePrefillProductValues(value, index)
                                  handleProductJournal(value)
                                }
                              "
                              item-text="name"
                              return-object
                            />
                          </td>
                          <!-- service/data -->
                          <!-- <td class="py-2">
                                <v-menu v-model="service_date_menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                                    <template v-slot:activator="{ on, attrs }">
                                    <v-text-field class="rounded-lg" v-model="service_date" placeholder="Date" solo flat hide-details dense readonly v-bind="attrs" v-on="on" :rules="main_rule">
                                        <template v-slot:append><v-icon class="text-center mt-1" color="primary" small>fa-calendar</v-icon></template>
                                    </v-text-field>
                                    </template>
                                    <v-date-picker v-model="end_date" @input="service_date_menu = false" />
                                </v-menu>
                            </td> -->
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              placeholder="Enter Description"
                              solo
                              flat
                              hide-details
                              dense
                              :disabled="journal_modified"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              placeholder=""
                              solo
                              flat
                              hide-details
                              dense
                              type="number"
                              min="1"
                              step="1"
                              :rules="numberRule"
                              :value="item?.quantity ?? 0"
                              :disabled="journal_modified"
                              @input="
                                ($event) =>
                                  handleInvoiceProduct(
                                    $event,
                                    index,
                                    'quantity'
                                  )
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              :rules="main_rule"
                              :value="item?.rate ?? 0.0"
                              :disabled="journal_modified"
                              @input="
                                ($event) =>
                                  handleInvoiceProduct($event, index, 'rate')
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              disabled
                              :rules="main_rule"
                              :value="item?.amount ?? 0.0"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              :disabled="journal_modified"
                              dense
                              :rules="main_rule"
                              :value="item?.discount ?? 0.0"
                              @input="
                                ($event) =>
                                  handleInvoiceProduct(
                                    $event,
                                    index,
                                    'discount'
                                  )
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              :disabled="journal_modified"
                              dense
                              :rules="main_rule"
                              :value="item?.vat_rate ?? 0.0"
                              @input="
                                ($event) =>
                                  handleInvoiceProduct(
                                    $event,
                                    index,
                                    'vat_rate'
                                  )
                              "
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              disabled
                              :rules="main_rule"
                              :value="item?.vat_amount ?? 0.0"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-text-field
                              class="rounded-lg text-center"
                              type="number"
                              placeholder="0.00"
                              solo
                              flat
                              hide-details
                              dense
                              disabled
                              :rules="main_rule"
                              :value="item?.net_total ?? 0.0"
                            />
                          </td>
                          <td class="py-2 text-center">
                            <v-btn
                              icon
                              color="error"
                              class="mx-3 text-center"
                              @click="handleDeleteLine(item?.id, item)"
                              ><v-icon class="" color="error" x-small
                                >fa-light fa-trash-can</v-icon
                              ></v-btn
                            >
                          </td>
                        </tr>
                        <v-divider></v-divider>
                        <tr
                          v-if="item.type == 'subtotal'"
                          :key="index"
                          class="dynamic_table_body_rows"
                          style="border-bottom: 0.5 solid red !important"
                        >
                          <td>{{ index }}</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>Subtotal: AED {{ subtotal }}</td>
                          <td class="py-2">
                            <v-btn
                              icon
                              color="error"
                              class="mx-3"
                              @click="handleDeleteLine(index)"
                              ><v-icon class="" color="error" x-small
                                >fa-light fa-trash-can</v-icon
                              ></v-btn
                            >
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr
                          v-if="
                            !Object.keys(company_id).length ||
                            new_invoice.customer === ''
                          "
                        >
                          <td colspan="2" style="color: red">
                            Please Select company and Customer
                          </td>
                        </tr>
                        <tr
                          v-else-if="
                            new_invoiceProducts.some(
                              (item) => item.service_name === ''
                            )
                          "
                        >
                          <td colspan="2" style="color: red">
                            Please fill the products
                          </td>
                        </tr>
                      </tfoot>
                    </template>
                  </v-simple-table>
                </v-col>

                <!-- Dynamic Data Table Actions -->
                <v-col cols="3">
                  <div class="action__btn flex_row" v-if="!journal_modified">
                    <v-btn
                      @click="handleAddProduct"
                      class="small__btn"
                      outlined
                      color="subtext"
                      v-if="
                        Object.keys(company_id).length &&
                        new_invoice.customer !== ''
                      "
                    >
                      <v-icon x-small color="subtext" class="mr-2"
                        >fa-plus</v-icon
                      >
                      <span class="text--text">Add Product</span>
                    </v-btn>
                  </div>
                  <div class="action__btn flex_row" v-else>
                    <v-btn
                      @click.prevent="handleRestoreJournal"
                      class="small__btn"
                      outlined
                      color="#f2c9a2"
                      style="text-transform: capitalize !important"
                    >
                      <v-icon x-small color="subtext" class="mr-2"
                        >fa-backward</v-icon
                      >
                      <span class="text--text">Undo Journal Changes</span>
                    </v-btn>
                  </div>
                </v-col>

                <v-spacer></v-spacer>

                <!-- Total Card -->
                <v-col cols="3">
                  <div class="total__container">
                    <div class="flex_column">
                      <span class="text--text font-weight-bold mb-2"
                        >Sub Total</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >Discount</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >VAT Amount</span
                      >
                      <span class="text--text font-weight-bold">Total</span>
                    </div>
                    <div class="flex_column">
                      <span class="text--text font-weight-bold mb-2"
                        >AED {{ newInvoiceSubTotal | twoDecimals }}</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >AED {{ newInvoiceDiscount | twoDecimals }}</span
                      >
                      <span class="text--text font-weight-bold mb-2"
                        >AED {{ newInvoiceVATAmount | twoDecimals }}</span
                      >
                      <span class="text--text font-weight-bold"
                        >AED {{ newInvoiceTotal | twoDecimals }}</span
                      >
                    </div>
                  </div>
                </v-col>

                <!-- Invoice Journal -->
                <v-col
                  cols="12"
                  class="invoice_journal mt-9 flex_row justify-space-between pb-0"
                >
                  <span class="text--text font-weight-bold"
                    >Invoice Journal
                    <span style="color: #f2c9a2" v-if="journal_modified"
                      >(Modified)</span
                    >
                  </span>
                  <v-btn
                    class="short__btn px-2 justify-end"
                    color="subtext"
                    outlined
                    @click="handleOpenInvoiceJournalEditDialog"
                  >
                    <v-icon x-small class="mr-1" color="subtext">fa-pen</v-icon>
                    Edit
                  </v-btn>
                </v-col>
                <v-col cols="12" class="pt-0">
                  <v-simple-table class="invoice_journal_table">
                    <template v-slot:default>
                      <thead class="invoice_journal_thead">
                        <tr class="" style="height: 35px !important">
                          <th
                            v-for="item in invoice_journal_headers"
                            :key="item"
                            class="text-left text--text font-weight-bold invoice_journal_headers"
                            style="
                              font-size: 12px !important;
                              font-weight: 500 !important;
                            "
                          >
                            {{ item }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="invoice_journal_tbody">
                        <tr
                          class="invoice_journal_rows"
                          v-for="(item, index) in invoice_journal_data"
                          :key="index"
                          v-if="invoice_journal_data.length"
                        >
                          <td class="">{{ item.type }}</td>
                          <td class="">{{ item.account_name }}</td>
                          <td class="" style="width: 150px">
                            {{ item.debit }}
                          </td>
                          <td class="" style="width: 150px">
                            {{ item.credit }}
                          </td>
                        </tr>
                        <tr class="invoice_journal_rows" v-else>
                          <td>Nothing to Show</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-col>
              </v-row>
            </v-row>
            <!-- [2] Invoice PDF Preview -->
            <v-container
              class="preview_invoice ma-0 pa-0"
              v-if="invoice_in_pdf == true"
            >
              <div
                class="a4__con mx-auto"
                style="max-width: 900px; min-height: 85vh"
              >
                <v-row class="pdf_header_2 ma-0 pa-0">
                  <v-col cols="8">
                    <h4>Eat and Drink Restaurant</h4>
                    <p class="ma-0 pa-0 text--text">
                      Levels 41 & 42, Emirates Towers
                    </p>
                    <p class="ma-0 pa-0 text--text">Sheikh Zayed Rd - Dubai</p>
                    <p class="ma-0 pa-0 text--text">eatanddrink@gmail.com</p>
                    <p class="ma-0 pa-0 text--text">
                      federal tax authority registration no.:
                      <b>100323347300003</b>
                    </p>
                  </v-col>
                  <v-col cols="4">
                    <div class="n__logo">
                      <v-img
                        src="eat_and_drink_logo2.webp"
                        alt="logo"
                        class="nn___logo"
                      />
                    </div>
                  </v-col>
                </v-row>
                <h1 class="ml-3 py-3 text--text">Invoice</h1>
                <v-row class="invoice_details ma-0 pa-0">
                  <v-col cols="5">
                    <h5 class="ma-0 pa-0 pb-2 subtext--text">
                      Invoice Details
                    </h5>
                    <p class="ma-0 pa-0 text--text">
                      {{ new_invoice.customer_name }}
                    </p>
                    <p class="ma-0 pa-0 text--text">
                      Email: {{ new_invoice.email }}
                    </p>
                    <p class="ma-0 pa-0 text--text">
                      {{ new_invoice.billing_address }}
                    </p>
                    <!-- <p class="ma-0 pa-0 text--text">
                      {{ invoice_pdf.country }}
                    </p>
                    <p class="ma-0 pa-0 text--text">{{ invoice_pdf.vat_no }}</p> -->
                    <!-- <v-col cols="auto" class="px-0">
                      <h5 class="ma-0 pa-0 pb-2 subtext--text">Invoice No.</h5>
                      <p class="ma-0 pa-0 text--text">
                        {{ invoice_pdf.invoice_no }}
                      </p>
                    </v-col> -->
                  </v-col>
                  <v-col cols="5">
                    <!-- <v-col cols="auto">
                      <h5 class="ma-0 pa-0 pb-2 subtext--text">Invoice No.</h5>
                      <p class="ma-0 pa-0 text--text">
                        {{ invoice_pdf.invoice_no }}
                      </p>
                    </v-col> -->
                    <v-row>
                      <v-col cols="6">
                        <h5 class="ma-0 pa-0 pb-2 subtext--text">
                          Invoice Date
                        </h5>
                        <p class="ma-0 pa-0 text--text">
                          {{ new_invoice.date }}
                        </p>
                      </v-col>
                      <v-col cols="6">
                        <h5 class="ma-0 pa-0 pb-2 subtext--text">
                          Invoice Due Date
                        </h5>
                        <p class="ma-0 pa-0 text--text">
                          {{ new_invoice.due_date }}
                        </p>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row class="pdf_input mt-9 mb-0 pb-0">
                  <v-spacer></v-spacer>
                  <v-col cols="12">
                    <v-simple-table fixed-header>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-center text--text">
                              Product/Service
                            </th>
                            <th class="text-center text--text">Qty</th>
                            <th class="text-center text--text">Price</th>
                            <th class="text-center text--text">Amount</th>
                            <th class="text-center text--text">VAT</th>
                            <th class="text-center text--text">Net Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            class="outline"
                            v-for="(product, pIndex) in new_invoiceProducts"
                            :key="pIndex"
                          >
                            <td class="text-center font-weight-medium">
                              {{ product.service_name }}
                            </td>
                            <td class="text-center font-weight-medium">
                              {{ product.quantity }}
                            </td>
                            <td class="text-center font-weight-medium">
                              {{ product.rate }}
                            </td>

                            <td class="text-center font-weight-medium">
                              {{ product.amount }}
                            </td>

                            <td class="text-center font-weight-medium">
                              {{ product.vat_rate }}%
                            </td>

                            <td class="text-center font-weight-medium">
                              {{ product.net_total }}
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-col>
                  <v-spacer></v-spacer>
                </v-row>
                <div class="invoice_footer mx-auto mt-9 pt-9 text-left row">
                  <div class="col-6 text-left">
                    <h6 class="mb-2" style="font-size: 10px">
                      Terms & Conditions
                    </h6>
                    <p
                      style="
                        font-size: 12px !important;
                        line-height: 20px !important;
                      "
                    >
                      The following terminology applies to these Terms and
                      Conditions, Privacy Statement and Disclaimer Notice and
                      all Agreements: “Client”, “You” and “Your” refers to you,
                      the person log on this website and compliant to the
                      Company's terms and conditions. “The Company”,
                      “Ourselves”, “We”, “Our” and “Us”.
                    </p>
                    <h6 class="mb-2" style="font-size: 10px">
                      Kindly pay the above amount by: Cheque or Bank Transfer
                    </h6>
                    <p
                      style="
                        font-size: 12px !important;
                        line-height: 20px !important;
                      "
                    >
                      Name of Beneficiary: Eat and Drink Restaurant
                      <br />Consultancies Bank Name: Emirates Islamic Bank PJSC
                      <br />A/C No: 3708213919301 (AED Account)<br />
                      IBAN number: AE 950340003708213919301 <br />Swift Code:
                      MEBLAEAD<br /><br />
                      Kindly provide the proof of transfer.<br /><br />**This is
                      a computer Generated Invoice & does not require signature
                    </p>
                  </div>
                </div>
              </div>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <SnackBar :data="snackbar_data" />
  </div>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import AddInvoiceDialog from '@/components/Dialogs/invoiceDialog.vue'
import TotalsCard from '@/components/Cards/TotalsCard/index.vue'
import LightArrow from '@/assets/images/White-Light-Arrow-icon.svg'
import { mapGetters, mapMutations, mapState } from 'vuex'
import moment from 'moment'
import NewPaymentDialog from '@/components/Dialogs/newPaymentDialog.vue'
import ReasonDialog from '../Dialogs/reasonDialog.vue'

export default {
  components: {
    CustomInputContainer,
    AddInvoiceDialog,
    TotalsCard,
    LightArrow,
    SnackBar,
    NewPaymentDialog,
    ReasonDialog,
  },
  props: [],
  computed: {
    ...mapState(['companySelection']),
    ...mapGetters([
      'getSelectedCompanies',
      'getCustomers',
      'getInvoiceAddEditToggler',
    ]),
    newInvoiceSubTotal() {
      return this.new_invoiceProducts
        .map((item) => parseFloat(item?.amount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    newInvoiceDiscount() {
      return this.new_invoiceProducts
        .map((item) => parseFloat(item?.discount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    newInvoiceVATAmount() {
      return this.new_invoiceProducts
        .map((item) => parseFloat(item?.vat_amount ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    newInvoiceTotal() {
      return this.new_invoiceProducts
        .map((item) => parseFloat(item?.net_total ?? 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
    getJournalCreditAmount() {
      return this.edit_invoice_journal_data
        .map((item) =>
          !isNaN(item.credit)
            ? !isNaN(item.vat_amount)
              ? parseFloat(item.credit) + item.vat_amount
              : parseFloat(item.credit) + 0
            : 0
        )
        .reduce((partial, acc) => partial + acc, 0)
    },
    getJournalDebitAmount() {
      return this.edit_invoice_journal_data
        .map((item) => (!isNaN(item.debit) ? parseFloat(item.debit) : 0))
        .reduce((partial, acc) => partial + acc, 0)
    },
  },
  mounted() {
    this.retrieveTerm()
    this.setDates()
    if (this.getSelectedCompanies.length === 1) {
      this.company_id = this.getSelectedCompanies[0]
    }
    const AuthStr = 'Bearer '.concat(this.$store.state.token)
    this.$axios
      .$post('account/list', {}, { headers: { Authorization: AuthStr } })
      .then((res) => {
        this.accounts_list = res.data.accounts
      })
      .catch((err) => {
        this.setShowLoader(false)
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to load Accounts',
          color: 'danger',
          icon: 'check',
          timeout: 2000,
        }
      })
  },

  data() {
    return {
      valid: true,
      privacyMood: false,
      new_transaction_menu: [
        { title: 'New Invoice', value: 'new invoice' },
        { title: 'New Recurring Invoice', value: 'recurring invoice' },
        { title: 'New Credit Note', value: 'estimate' },
        { title: 'Create Retail Notice', value: 'sales_reciept' },
        { title: 'New Debit Note', value: 'tax_credit' },
      ],
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      //  Add/Edit Invoice
      invoice_journal_edit_dialog: false,
      company_id: {},
      is_company_id: false,
      all_companies: ['Nathan Digital', 'Nathan HR', 'FreeLancer', 'EasyBox'],
      // add_edit_toggler: false,
      rows_counter: [{ type: 'row' }],
      subtotal: 240,
      del_row: null,
      service_date_menu: false,
      service_date: null,
      // Interval Data
      on_day_order_data: 'day',
      on_day_order: ['day', 'first', 'second', 'third'],
      interval: 'Daily',
      months: ['January', 'Feb', 'March'],
      month_days: ['1st', '2en', '3th', '4fo', '5fi'],
      week_days: ['Monday', 'Sunday', 'Friday', 'Monday', 'Sunday', 'Friday'],
      terms_radio_selected: 'Duckduckgo',
      terms_main_menu: false,
      addCustomTerm: false,
      term: '',
      terms_menu: [],
      recurring: false,
      new_invoice: {
        filed_full: false,
        email: '',
        date: '',
        due_date: '',
        billing_address: '',
        customer: '',
        customer_name: '',
        customer_id: '',
        company: '',
        invoice: '',
        amount: '',
        isInvoice: true,
        sub_total: 0,
        vat_total: 0,
        _id: '',
        invoice_number: '',
        accounts: [],
      },
      sale_location: '',
      customer_note: '',
      customer_statement: '',
      new_invoice_data: [],
      due_date_menu: false,
      date_menu: false,
      product: [],
      selectedProduct: '',
      types: ['types1', 'types2'],
      all_end_interval_date: ['None', 'By', 'After'],
      end_interval: 'None',
      start_date: null,
      end_date_menu: false,
      start_date_menu: false,
      days: ['Sat', 'Sun', 'Mon'],
      all_intervals: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
      all_customers: [
        'Soylent Corp',
        'BGoylent Corp',
        'Mylent Corp',
        'Lif Corp',
      ], // all_customer is coming from customer page
      InvoiceDialogLineOne: true,
      InvoiceDialogLineTwo: false,
      InvoiceDialogLineThree: false,
      addNewInvoicePreviewTableHeaders: [
        'Product/Service',
        'Description',
        'QTY',
        'Rate',
        'Amount',
        'Discount',
        'VAT Rate %',
        'VAT Amount',
        'NET Total',
        'Actions',
      ],
      addNewPaymentTableHeaders: [
        'Description',
        'Due date',
        'Original Amt',
        'Open Bal',
        'Payment',
        'Actions',
      ],
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      phone_rule: [],

      //Dynamic Table Data
      new_invoiceProducts: [
        {
          id: Math.random(),
          service: '',
          service_name: '',
          quantity: 0,
          rate: 0,
          amount: 0,
          discount: 0,
          vat_rate: 0,
          vat_amount: 0,
          net_total: 0,
          credit: [],
          debit: [],
        },
      ],

      // Invoice Journal
      invoice_journal_headers: ['Type', 'Account Name', 'Debit', 'Credit'],
      invoice_journal_data: [
        // {
        //   type: 'Invoice',
        //   account_name: 'Accounts Receivable',
        //   debit: '630.00',
        //   credit: '0',
        // },
        // {
        //   type: 'Invoice',
        //   account_name: 'Sales (HR)',
        //   debit: '0',
        //   credit: '100.00',
        // },
        // {
        //   type: 'Invoice',
        //   account_name: 'Sales (Accounting)',
        //   debit: '0',
        //   credit: '200.00',
        // },
        // {
        //   type: 'Invoice',
        //   account_name: 'Marketing Outsourcing Charges',
        //   debit: '630.00',
        //   credit: '300.00',
        // },
        // {
        //   type: 'Invoice',
        //   account_name: 'VAT Payable',
        //   debit: '0',
        //   credit: '30',
        // },
      ],
      edit_invoice_journal_headers: [
        'Date',
        'Company',
        'Customer Name',
        'Account Code',
        'Account Name',
        'Description',
        'Currency',
        'Debit',
        'Credit',
        'Location',
        'VAT Amount',
        'Action',
      ],
      journal_modified: false,
      edit_invoice_journal_data: [
        {
          date: new Date().toISOString().substr(0, 10),
          company: '',
          name: '',
          account_code: '',
          account_name: '',
          description: '',
          currency: '',
          debit: 0,
          credit: 0,
          location: '',
          vat_percent: 0,
          vat_amount: 0,
          action: '',
        },
      ],
      edit_invoice_journal_total: 0,

      // Toggle from List View to Grid View
      toggle_view: false,
      list_view: true,
      grid_view: false,
      invoice_preview: true,
      invoice_pdf: {},
      payment_dialog_visible: false,
      payment_errors: {
        status: false,
        message: '',
      },
      accounts_list: [],

      writeoff_dialog_visible: false,
      void_dialog_visible: false,
      invoice_in_pdf: false,

      // ADD INVOICE DIALOG (1)
      addNewInvoiceDialog: false,
      // DATA TABLE
      page: 1,
      totalCount: 0,
      totalPage: 0,
      search: '',
      options: { itemsPerPage: 10 },
      invoices_headers: [
        { text: 'Date', value: 'due_date', align: 'start' },
        { text: 'No', value: 'invoice_number' },
        { text: 'Customer', value: 'customer' },
        { text: 'Amount', value: 'total' },
        { text: 'Status', value: 'status', align: 'center' },
        { text: 'Action', value: 'action', sortable: false },
      ],
      sm_invoices_headers: [
        { text: 'Date', value: 'due_date', align: 'start' },
        { text: 'Customer', value: 'customer' },
        { text: 'Amount', value: 'total' },
      ],
      invoices: [],
      // FILTER DIALOG
      filterDialog: false,
      filter_by: [
        'All',
        'Week to date',
        'This month to date',
        'This quarter to date',
        'This year to date',
        'Specific dates',
      ],
      customerFilter: ['All', 'Other'],
      statusFilter: ['Paid', 'Unpaid'],
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      monthsOfYear: ['Jan', 'Feb', 'Mar', 'Apr'],
      Years: [2022, 2021, 2020],
      customDataDisabled: true,
      total_invoices: [
        { name: 'New Invoices', num: '93', amount: '0' },
        { name: 'Approved Invoices', num: '590', amount: '0' },
        { name: 'Paid Invoices', num: '452', amount: '0' },
        { name: 'Total Invoices', num: '802', amount: '0' },
        { name: 'Requests Invoice', num: '0', amount: '0' },
      ],
    }
  },
  methods: {
    ...mapMutations(['setShowLoader', 'setInvoiceAddEditToggler']),
    handlePrint() {
      if (this.invoice_pdf.invoice_path.length) {
        window.open(this.invoice_pdf.invoice_path)
      }
    },
    handleRemainder() {},
    async handleShare() {
      console.log('share')
      const shareData = {
        title: `Invoice Receipt - ${this.invoice_pdf.invoice_number} of ${this.invoice_pdf.c_name}`,
        text: `Generated Invoice Receipt - ${this.invoice_pdf.invoice_number}`,
        url: this.invoice_pdf.invoice_path,
      }
      try {
        await navigator.share(shareData)
        this.snackbar_data = {
          snackbar: true,
          text: `Invoice ${this.invoice_pdf.invoice_number} Shared successfully`,
          color: 'success',
          icon: 'check',
          timeout: 2000,
        }
      } catch (err) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to share',
          color: 'danger',
          icon: 'info',
          timeout: 2000,
        }
      }
    },
    handleReminder() {},

    handleNewTransaction(value) {
      if (value == 'new invoice') {
        // this.add_edit_toggler = true
        this.setInvoiceAddEditToggler(true)
      } else if (value == 'recurring invoice') {
        // this.add_edit_toggler = true
        this.setInvoiceAddEditToggler(true)
        this.recurring = true
      } else if (value == 'Estimate') {
        // this.addNewEstimateDialog=!this.addNewEstimateDialog
      } else if (value == 'Sales Reciept') {
        // this.addNewSalesRecieptDialog=!this.addNewSalesRecieptDialog
      } else if (value == 'Tax Credit Note') {
        // this.addNewTaxCreditNoteDialog=!this.addNewTaxCreditNoteDialog
      } else if (value == 'Time Activity') {
        // this.addNewTimeActivityDialog=!this.addNewTimeActivityDialog
      } else if (value == 'Journal Entry') {
        // this.addNewJournalEntryDialog=!this.addNewJournalEntryDialog
      }
    },
    handleAddLineInvoiceJournalEditDialog() {
      let obj = {
        date: new Date().toISOString().substr(0, 10),
        company: this.company_id.name,
        name: this.new_invoice.customer_name,
        account_code: '',
        account_name: '',
        description: '',
        currency: 'AED',
        debit: 0,
        credit: 0,
        location: '',
        vat_percent: 0,
        vat_amount: 0,
        action: '',
      }

      if (this.getJournalCreditAmount > this.getJournalDebitAmount) {
        obj.debit = this.getJournalCreditAmount - this.getJournalDebitAmount
      } else {
        obj.credit = this.getJournalDebitAmount - this.getJournalCreditAmount
      }

      this.edit_invoice_journal_data.push(obj)
    },
    handleOpenInvoiceJournalEditDialog() {
      if (!this.invoice_journal_data.length) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Please add Products',
          color: 'orange',
          icon: 'info',
          timeout: 2000,
        }
        return
      }
      if (this.new_invoice.customer_name === '') {
        this.snackbar_data = {
          snackbar: true,
          text: 'Please Select Customer',
          color: 'orange',
          icon: 'info',
          timeout: 2000,
        }
        return
      }
      if (this.new_invoiceProducts.some((item) => item.service_name === '')) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Please Fill the Product',
          color: 'orange',
          icon: 'info',
          timeout: 2000,
        }
        return
      }
      // this.invoice_journal_data_copy = this.invoice_journal_data
      // console.log(this.invoice_journal_data_copy)
      this.invoice_journal_edit_dialog = true
      this.edit_invoice_journal_data = this.invoice_journal_data
        .filter((item) => item.account_name !== 'VAT Payable')
        .map((item) => {
          return {
            ...item,
            date: new Date().toISOString().substr(0, 10),
            company: this.company_id.name,
            name: this.new_invoice.customer_name,
            account_code: '110',
            account_name: item.account_name,
            description: '',
            currency: 'AED',
            debit: item.debit,
            credit: item.credit,
            location: this.sale_location,
            vat_percent: item.isDebit
              ? 0
              : this.new_invoiceProducts
                  .filter(
                    (val) =>
                      val.credit.filter(
                        (el) => el.account_name !== 'VAT Payable'
                      )[0].account_name === item.account_name
                  )
                  .flatMap((val) => val.vat_rate)
                  .reduce((partial, acc, arr) => partial + acc / arr.length, 0),
            vat_amount: item.isDebit
              ? 0
              : this.new_invoiceProducts
                  .filter((val) =>
                    val.credit.some((e) => e.account_name === item.account_name)
                  )
                  .map(
                    (val) =>
                      val.credit.filter(
                        (el) => el.account_name === 'VAT Payable'
                      )[0].amount * val.quantity
                  )
                  .reduce((partial, acc) => partial + acc, 0),
            action: '',
          }
        })
      this.edit_invoice_journal_total = this.edit_invoice_journal_data
        .map((item) =>
          !isNaN(item.credit)
            ? !isNaN(item.vat_amount)
              ? parseFloat(item.credit) + item.vat_amount
              : parseFloat(item.credit) + 0
            : 0
        )
        .reduce((partial, acc) => partial + acc, 0)
    },

    //fn to handle changes of edit journal values
    handleChangeJournalValue(type, rowIndex, value) {
      switch (type) {
        case 'date':
          this.edit_invoice_journal_data[rowIndex].date = value
          break
        case 'credit':
          this.edit_invoice_journal_data[rowIndex].credit = isNaN(value)
            ? 0
            : parseFloat(value)

          break

        case 'debit':
          this.edit_invoice_journal_data[rowIndex].debit = isNaN(value)
            ? 0
            : parseFloat(value)

          break
        case 'vat':
          this.edit_invoice_journal_data[rowIndex].vat_amount = isNaN(value)
            ? 0
            : parseFloat(value)

          break
        case 'account_name':
          this.edit_invoice_journal_data[rowIndex].account_name = value.name
          this.edit_invoice_journal_data[rowIndex].account = value._id
          this.edit_invoice_journal_data[rowIndex].id = value._id
          break
        default:
          break
      }
    },

    //fn to restore journal to original state . i.e, values from products
    handleRestoreJournal() {
      try {
        // this.setShowLoader(true)
        this.invoice_journal_data = []
        this.new_invoiceProducts.forEach((item, index) => {
          let getProduct = this.product.filter(
            (el) => el._id === item.service
          )[0]
          // handleInvoiceProduct(item.service_name, index, 'service_name')
          // handleInvoiceProduct(item.service, index, 'service')
          this.handlePrefillProductValues(getProduct, index)
          this.handleProductJournal(getProduct)
        })
        this.journal_modified = false
      } catch (error) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to Restore Journal',
          color: 'danger',
          icon: 'info',
          timeout: 2000,
        }
      }
    },

    //fn to overwrite journal with edit journal values
    overWriteJournal() {
      let tempEditJournalData = this.edit_invoice_journal_data
      let tempJournalData = this.invoice_journal_data
      let vat_amount = tempEditJournalData
        .map((item) => item.vat_amount)
        .reduce((partial, acc) => partial + acc, 0)
      let retrieveVAT = this.invoice_journal_data.filter(
        (item) => item.account_name === 'VAT Payable'
      )[0]
      retrieveVAT.amount = vat_amount
      retrieveVAT.credit = vat_amount
      retrieveVAT.debit = 0

      // tempJournalData = tempJournalData.map((item, index) => {
      //   if (item.account_name === 'VAT Payable') {
      //     let vat_amount = tempEditJournalData
      //       .map((item) => item.vat_amount)
      //       .reduce((partial, acc) => partial + acc, 0)
      //     return {
      //       ...item,
      //       amount: vat_amount,
      //       credit: vat_amount,
      //       debit: 0,
      //     }
      //   } else {
      //     let isCreditHigh =
      //       tempEditJournalData[index]?.credit >
      //       tempEditJournalData[index]?.debit
      //     let amount = isCreditHigh
      //       ? tempEditJournalData[index]?.credit
      //       : tempEditJournalData[index]?.debit

      //     return {
      //       ...item,
      //       account: tempEditJournalData[index]?.account,
      //       account_name: tempEditJournalData[index]?.account_name,
      //       amount: amount,
      //       credit: tempEditJournalData[index]?.credit,
      //       debit: tempEditJournalData[index]?.debit,
      //       isCredit: isCreditHigh ? true : false,
      //       isDebit: isCreditHigh ? false : true,
      //       name: tempEditJournalData[index]?.account_name,
      //       description: tempEditJournalData[index]?.description,
      //       type: 'Invoice',
      //       customer: tempEditJournalData[index]?.customer,
      //       id: tempEditJournalData[index]?.account,
      //     }
      //   }
      // })
      tempJournalData = tempEditJournalData.map((item, index) => {
        let isCreditHigh = item?.credit > item?.debit
        let amount = isCreditHigh ? item?.credit : item?.debit
        return {
          ...item,
          account: item?.account,
          account_name: item?.account_name,
          amount: amount,
          credit: item?.credit,
          debit: item?.debit,
          isCredit: isCreditHigh ? true : false,
          isDebit: isCreditHigh ? false : true,
          name: item?.account_name,
          description: item?.description,
          type: 'Invoice',
          customer: item?.customer,
          id: item?.account,
        }
      })
      tempJournalData.push(retrieveVAT)

      this.invoice_journal_data = tempJournalData
      this.journal_modified = true
    },

    handleInvoiceJournalEditDialog(value) {
      if (value == 'save') {
        // this.invoice_journal_data_copy = this.invoice_journal_data
        // let totalCredit = this.edit_invoice_journal_data
        //   .map((item) =>
        //     !isNaN(item.credit)
        //       ? !isNaN(item.vat_amount)
        //         ? parseFloat(item.credit) + item.vat_amount
        //         : parseFloat(item.credit) + 0
        //       : 0
        //   )
        //   .reduce((partial, acc) => partial + acc, 0)
        // let totalDebit = this.edit_invoice_journal_data
        //   .map((item) => (!isNaN(item.debit) ? parseFloat(item.debit) : 0))
        //   .reduce((partial, acc) => partial + acc, 0)

        if (
          this.edit_invoice_journal_data.some(
            (item) => item.account_name === '' || item.account_name === null
          )
        ) {
          this.snackbar_data = {
            snackbar: true,
            text: 'Please choose an account',
            color: 'orange',
            icon: 'info',
            timeout: 2000,
          }
          return
        }

        if (
          this.getJournalCreditAmount === this.getJournalDebitAmount &&
          this.edit_invoice_journal_total === this.getJournalCreditAmount &&
          this.edit_invoice_journal_total === this.getJournalDebitAmount
        ) {
          this.invoice_journal_edit_dialog = false
          this.overWriteJournal()
        } else {
          this.snackbar_data = {
            snackbar: true,
            text: 'Amount is mismatched',
            color: 'orange',
            icon: 'info',
            timeout: 2000,
          }
          return
        }
      } else if (value == 'cancel') {
        // this.invoice_journal_data = this.invoice_journal_data_copy
        this.invoice_journal_edit_dialog = false
        this.edit_invoice_journal_data = [
          {
            date: new Date().toISOString().substr(0, 10),
            company: '',
            name: '',
            account_code: '',
            account_name: '',
            description: '',
            currency: '',
            debit: 0,
            credit: 0,
            location: '',
            vat_percent: 0,
            vat_amount: 0,
            action: '',
          },
        ]
      }
    },
    handleAddProduct() {
      let obj = {
        id: Math.random(),
        service: '',
        service_name: '',
        quantity: 0,
        rate: 0,
        amount: 0,
        discount: 0,
        vat_rate: 0,
        vat_amount: 0,
        net_total: 0,
        credit: [],
        debit: [],
      }
      this.new_invoiceProducts.push(obj)
    },

    //fn to handle click create invoice to check validation
    handleClickCreateInvoice() {
      this.$refs.form.validate()
      console.log('validation', this.$refs.form.validate())
      if (
        this.$refs.form.validate() &&
        this.new_invoiceProducts.every((item) => item.service_name !== '')
      ) {
        this.invoice_in_pdf = true
      }
    },

    //fn to handle write off invoice
    async handleSubmitWriteOffInvoice(value) {
      console.log({ value })
      let payload = {
        date: value.date,
        write_off: true,
        status: 'Write Off',
        write_off_reason: value.reason,
        accounts: [
          this.invoice_pdf.accounts.filter(
            (item) => item.name === 'writeOff'
          )[0].account,
        ],
        amount: this.invoice_pdf.amount,
        customer: this.invoice_pdf.customer,
        sub_total: this.invoice_pdf.amount,
        vat_total: 0,
        total: this.invoice_pdf.amount,
        // company: this.companySelection.map((item) => item.id),
      }

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.setShowLoader(true)
      await this.$axios
        .$patch(`invoice/by-id/${this.invoice_pdf._id}`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Invoice has been successfully Write off',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Write off Invoice',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
        .finally(() => {
          this.writeoff_dialog_visible = !this.writeoff_dialog_visible
          this.fetchInvoices({ limit: 10, page: 0, search: '' })

          this.setShowLoader(false)
        })
    },

    //fn to handle close/open write off invoice dialog
    handleWriteOffDialog() {
      this.writeoff_dialog_visible = !this.writeoff_dialog_visible
    },

    //fn to handle void invoice on submit
    async handleSubmitVoidInvoice(value) {
      console.log({ value })
      let payload = {
        void: true,
        status: 'void',
        void_reason: value.reason,
        accounts: [
          this.invoice_pdf.accounts.filter((item) => item.name === 'void')[0]
            .account,
        ],
        amount: this.invoice_pdf.amount,
        customer: this.invoice_pdf.customer,
        sub_total: this.invoice_pdf.amount,
        vat_total: 0,
        total: this.invoice_pdf.amount,
        // company: this.companySelection.map((item) => item.id),
      }

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.setShowLoader(true)
      await this.$axios
        .$patch(`invoice/by-id/${this.invoice_pdf._id}`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Invoice has been successfully Void',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Void Invoice',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
        })
        .finally(() => {
          this.void_dialog_visible = !this.void_dialog_visible
          this.fetchInvoices({ limit: 10, page: 0, search: '' })

          this.setShowLoader(false)
        })
    },

    //fn to handle close/open void dialog
    handleVoidDialog() {
      this.void_dialog_visible = !this.void_dialog_visible
    },
    handleDebitNote() {
      this.$router.push({
        name: 'debit-note',
        params: { data: this.invoice_pdf },
      })
    },

    //fn to handle save and mail
    async handleSaveAndMail() {
      this.$refs.form.validate()
      if (
        this.$refs.form.validate() &&
        this.new_invoiceProducts.every((item) => item.service_name !== '')
      ) {
        let payload = {
          customer: this.new_invoice.customer_id,
          customer_name: this.new_invoice.customer_name,
          customer_address: this.new_invoice.billing_address,
          email: 'mina@bp.com',
          billing_address: this.new_invoice.billing_address,
          shipping_address: this.new_invoice.billing_address,
          terms: this.term._id,
          terms_name: this.term.name,
          invoice_date: this.new_invoice.date,
          due_date: this.new_invoice.due_date,
          sale_location: this.sale_location,
          items: this.new_invoiceProducts,
          journal_entry: this.invoice_journal_data,
          sub_total: this.newInvoiceSubTotal,
          vat_total: this.newInvoiceVATAmount,
          total: this.newInvoiceTotal,
          customer_notes: this.customer_note,
          terms_condition: this.customer_statement,
          is_recurring: false,
          is_draft: false,
          company: this.company_id.id,
          mailInvoice: true,
        }
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.setShowLoader(true)
        await this.$axios
          .$post('invoice', payload, {
            headers: { Authorization: AuthStr },
          })
          .then((res) => {
            this.snackbar_data = {
              snackbar: true,
              text: 'Invoice is Created Successfully',
              color: 'success',
              icon: 'check',
              timeout: 2000,
            }
            this.new_invoice = {
              filed_full: false,
              email: '',
              date: '',
              due_date: '',
              billing_address: '',
              customer: '',
              customer_name: '',
              customer_id: '',
            }
            this.sale_location = ''
            this.customer_note = ''
            this.customer_statement = ''
            this.invoice_journal_data = []
            this.new_invoiceProducts = [
              {
                id: Math.random(),
                service: '',
                service_name: '',
                quantity: 0,
                rate: 0,
                amount: 0,
                discount: 0,
                vat_rate: 0,
                vat_amount: 0,
                net_total: 0,
                //experimental journal
                credit: [],
                debit: [],
              },
            ]
            // this.add_edit_toggler = false
            setTimeout(() => {
              this.setInvoiceAddEditToggler(false)
              this.invoice_in_pdf = false
              this.setShowLoader(false)
              this.$router.push({
                name: 'send-mail',
                params: { ...res.data, invoice_id: res.data.invoiceId },
              })
            }, 1000)
          })
          .catch((err) => {
            this.snackbar_data = {
              snackbar: true,
              text: 'Failed to Create Invoice',
              color: 'danger',
              icon: 'info',
              timeout: 2000,
            }
            this.setShowLoader(false)
          })
      }
    },

    //fn to handle invoice payment
    handleSubmitInvoicePayment(value) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let payload = {
        ...this.invoice_pdf,
        ...value,
        accounts: [
          this.invoice_pdf.accounts.filter((item) => item.name === 'payment')[0]
            .account,
        ],
      }
      this.setShowLoader(true)

      this.$axios
        .$post('invoice/record-payment', payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Record Payment Successfully Created',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          this.payment_dialog_visible = false
          this.fetchInvoices({ limit: 10, page: 0, search: '' })
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Create Record Payment',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
          this.payment_errors = {
            status: true,
            message: 'Please verify you are paid or not.',
          }
        })
        .finally(() => {
          this.setShowLoader(false)
        })
    },

    //fn to delete Invoice Product from Table
    handleDeleteLine(id, product = {}) {
      let tempProduct = JSON.parse(JSON.stringify(product))
      let tempJournal = JSON.parse(JSON.stringify(this.invoice_journal_data))
      if (tempProduct.service !== '') {
        const getJournalCreditAccType = tempJournal.filter(
          (item) =>
            item.account_name ===
            tempProduct.credit.filter(
              (el) => el.account_name !== 'VAT Payable'
            )[0].account_name
        )[0]
        const getJournalVAT = tempJournal.filter(
          (item) =>
            item.account_name ===
            tempProduct.credit.filter(
              (el) => el.account_name === 'VAT Payable'
            )[0].account_name
        )[0]
        const getJournalDebitAccType = tempJournal.filter(
          (item) =>
            item.account_name ===
            tempProduct.debit.filter(
              (el) => el.account_name !== 'VAT Payable'
            )[0].account_name
        )[0]

        let tempJournalData = [...tempJournal]

        tempJournalData = tempJournalData.map((item) => {
          if (getJournalCreditAccType.account_name === item.account_name) {
            return {
              ...item,
              credit: item.credit - tempProduct.amount,
            }
          }
          if (getJournalVAT.account_name === item.account_name) {
            return {
              ...item,
              credit: item.credit - tempProduct.vat_amount,
            }
          }
          if (getJournalDebitAccType.account_name === item.account_name) {
            return {
              ...item,
              debit: item.debit - tempProduct.net_total,
            }
          }
          return item
        })

        tempJournalData = tempJournalData.filter(
          (item) => item.credit !== 0 || item.debit !== 0
        )

        this.invoice_journal_data = [...tempJournalData]
      }

      this.new_invoiceProducts = this.new_invoiceProducts.filter(
        (el, index) => el.id !== id
      )
    },

    handleDeleteAllLine() {
      this.rows_counter = [{ type: 'row' }]
    },
    handlePaymentDialog() {
      this.payment_dialog_visible = !this.payment_dialog_visible
      this.payment_errors = {
        message: '',
        status: false,
      }
    },

    clear() {
      this.new_invoice = {}
    },

    getInvoiceStatus(value) {
      let result = {
        text: value,
        color: '#B3BCCB',
      }
      switch (String(value).toLowerCase()) {
        case 'overdue':
          result.color = '#f2aa52'
          break
        case 'partially paid':
          result.color = '#FFB536'
          break
        case 'paid':
          result.color = '#6cc21b'
          break
        case 'write off':
          result.color = '#F3654A'
          break
        default:
          break
      }
      return result
    },

    handleDataTableRow(value) {
      // console.log('Row Data => ', value)
      this.setShowLoader(true)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.toggle_view = true
      this.invoice_pdf = {
        company: value.company,
        invoice: value._id,
        amount: value.total,
        isInvoice: true,
        sub_total: value.sub_total,
        vat_total: value.vat_total,
        _id: value._id,
        invoice_number: value.invoice_number,
        invoice_path: value.invoice_path.path,
        date: moment(value.invoice_date).format('YYYY-MM-DD'),
        due_date: moment(value.due_date).format('YYYY-MM-DD'),
        status: value.status,
        total: value.total,
        po_no: '460695',
        c_name: value.customer,
        customer: value.customerId,
        address: value.customer_address,
        country: '',
        vat_no: 'Vat No. 86-2769183',
        input: value.items,
      }
      this.$axios
        .$post(
          `invoice/invoice-journal?id=${value._id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((res) => {
          this.invoice_pdf.accounts = [...res.data.accounts]
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to load Record Payment',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
        .finally(() => {
          this.setShowLoader(false)
        })
    },

    async handleData(field) {
      const { page, itemsPerPage } = this.options
      let pageNumber = page - 1
      var data = {
        page: pageNumber,
        search: this.search,
        limit: itemsPerPage,
      }
      field && (data[field.name] = field.value)
      await this.fetchInvoices(data)
    },

    async fetchInvoices({ page, type, search, limit }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const list = this.companySelection.map((item) => item.id)

      const payload = { company: list }
      await this.$axios
        .$post(
          `invoice/all?&search=${search}&limit=${limit}&page=${page}`,
          payload,
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { invoices, total_page, total_count } = res.data
          this.invoices = invoices
          this.totalPage = total_page
          this.totalCount = total_count
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },

    async sendMailForInvoice() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      let invoice_id = this.invoice_pdf._id

      this.setShowLoader(true)
      try {
        this.$axios
          .$post(
            `invoice/invoice-mail-template?invoice=${invoice_id}`,
            {},
            {
              headers: { Authorization: AuthStr },
            }
          )
          .then((res) => {
            this.setShowLoader(false)
            this.$router.push({
              name: 'send-mail',
              params: { ...res.data, invoice_id },
            })
          })
      } catch (err) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to Load Invoice Mail',
          color: 'danger',
          icon: 'info',
          timeout: 2000,
        }
        this.setShowLoader(false)
      }

      // let payload = {
      //   text: '<p>Dear a,</p> <p>Thank you for your business. Your invoice can be viewed, printed and downloaded as PDF from the link below. You can also choose to pay it online.</p> ',
      //   subject: `Invoice - INV-${this.invoice_pdf.invoice_number} from ${this.invoice_pdf.c_name}`,
      // }
      // let invoiceId = this.invoice_pdf._id
      // await this.$axios
      //   .$post(`invoice/send-email?invoice=${invoiceId}`, payload, {
      //     headers: { Authorization: AuthStr },
      //   })
      //   .then((res) => {
      //     this.snackbar_data = {
      //       snackbar: true,
      //       text: 'Mail has been sent successfully',
      //       color: 'success',
      //       icon: 'check',
      //       timeout: 2000,
      //     }
      //   })
      //   .catch((err) => {
      //     this.snackbar_data = {
      //       snackbar: true,
      //       text: 'Failed to Send Mail',
      //       color: 'danger',
      //       icon: 'check',
      //       timeout: 2000,
      //     }
      //   })
    },

    async retrieveTerm() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          'term/all',
          {},
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          this.terms_menu = res.data.terms
          this.term = res.data.terms.filter(
            (item) => item.name === 'Due on Receipt'
          )[0]
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Retrieve Terms',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },

    setDates() {
      this.new_invoice.date = new Date().toISOString().substr(0, 10)
      this.new_invoice.due_date = new Date().toISOString().substr(0, 10)
    },
    resetNewInvoiceForm() {
      this.new_invoice = {
        filed_full: false,
        email: '',
        date: '',
        due_date: '',
        billing_address: '',
        customer: '',
        customer_name: '',
        customer_id: '',
      }
      this.sale_location = ''
      this.customer_note = ''
      this.customer_statement = ''
      this.invoice_journal_data = []
      this.company_id = {}
      this.new_invoiceProducts = [
        {
          id: Math.random(),
          service: '',
          service_name: '',
          quantity: 0,
          rate: 0,
          amount: 0,
          discount: 0,
          vat_rate: 0,
          vat_amount: 0,
          net_total: 0,
          account: '',
          //experimental journal
          credit: [],
          debit: [],
        },
      ]
    },
    closeInvoice() {
      this.resetNewInvoiceForm()
      this.invoice_in_pdf = false
      // this.add_edit_toggler = false
      this.setInvoiceAddEditToggler(false)
    },

    async onCustomerChanged(value) {
      //retrieve information on customer selected

      if (value !== null) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        let id = value._id
        this.setShowLoader(true)
        await this.$axios
          .$post(
            `customer/by-id/${id}`,
            {},
            {
              headers: { Authorization: AuthStr },
            }
          )
          .then((res) => {
            this.new_invoice.customer_id = id
            this.new_invoice.customer_name = res.data.customer.customer_name
            if (res.data.customer.primary_contact)
              this.new_invoice.email = res.data.customer.primary_contact.email
            this.new_invoice.billing_address =
              res?.data?.customer?.billing_address ?? ''
            if (this.invoice_journal_data.length) {
              this.invoice_journal_data = this.invoice_journal_data.map(
                (item) => {
                  return {
                    ...item,
                    customer: id,
                  }
                }
              )
            }
            this.setShowLoader(false)
          })
          .catch((err) => {
            console.log(err)
            this.snackbar_data = {
              snackbar: true,
              text: 'Failed to Load Customer Details',
              color: 'danger',
              icon: 'check',
              timeout: 2000,
            }
            this.setShowLoader(false)
          })
      }
    },
    onTermsChanged(value) {
      const invoice_date =
        this.new_invoice.date === ''
          ? new Date().toISOString().substr(0, 10)
          : this.new_invoice.date
      try {
        switch (value.name) {
          case 'Net 15':
            this.new_invoice.due_date = new Date(
              moment(invoice_date).add(15, 'days')
            )
              .toISOString()
              .substr(0, 10)
            break
          case 'Net 30':
            this.new_invoice.due_date = new Date(
              moment(invoice_date).add(30, 'days')
            )
              .toISOString()
              .substr(0, 10)
            break
          case 'Net 45':
            this.new_invoice.due_date = new Date(
              moment(invoice_date).add(45, 'days')
            )
              .toISOString()
              .substr(0, 10)
            break
          case 'Net 60':
            this.new_invoice.due_date = new Date(
              moment(invoice_date).add(60, 'days')
            )
              .toISOString()
              .substr(0, 10)
            break
          case 'Due end of next month':
            this.new_invoice.due_date = new Date(
              moment(invoice_date).add(1, 'months').endOf('month')
            )
              .toISOString()
              .substr(0, 10)
            break
          case 'Due end of the month':
            this.new_invoice.due_date = new Date(
              moment(invoice_date).endOf('month')
            )
              .toISOString()
              .substr(0, 10)
            break
          case 'Due on Receipt':
            this.new_invoice.due_date = this.new_invoice.date
            break
          default:
            value.days !== null
              ? (this.new_invoice.due_date = this.new_invoice.due_date =
                  new Date(moment(invoice_date).add(value.days, 'days'))
                    .toISOString()
                    .substr(0, 10))
              : (this.new_invoice.due_date = this.new_invoice.date)

            break
        }
      } catch (err) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to Calculate Due Date',
          color: 'orange',
          icon: 'info',
          timeout: 2000,
        }
      }
    },

    handleShowInvoice() {
      this.addNewInvoicePreviewTableData.push({
        no: '#',
        service: '0-0-2020',
        product: 'ERP',
        description: 'lorem ipsum..',
        qty: '1',
        rate: '1044',
        amount: '20,890',
        product: 'Product',
      })
      this.invoices.push(this.addNewInvoicePreviewTableData)
    },

    handleAddInvoiceToThePreviewTable(value) {
      this.new_invoice_data.push(this.new_invoice)
      this.new_invoice = {}
    },

    handleSaveInvoice($event) {
      console.log('New Invoice Data:', $event)
      this.createInvoice()
      this.addNewInvoiceDialog = false
    },

    handleApplyFilter() {
      this.filterDialog = false
    },
    async fetchProducts(customerObj) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const payload = {
        company: [customerObj.id],
      }
      console.log('Test')
      await this.$axios
        .post(
          'service/list',
          { company: this.companySelection.map((item) => item.id) },
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then((res) => {
          // res.data.products
          this.product = res.data.data.products
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Load Product Details',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
        })
    },

    journalHelper({ products = [], rowIndex = 0 }) {
      let desired_array = products[rowIndex]
      let exclusive_vat_amount = products
        .filter((el, index) => index !== rowIndex)
        .map((item) => item.vat_amount)
        .reduce((partial, acc) => partial + acc, 0)
      let exclusive_price = products
        .filter(
          (el, index) =>
            index !== rowIndex &&
            products[rowIndex].credit.filter(
              (item) => item.account_name !== 'VAT Payable'
            )[0].account_name ==
              el.credit.filter((item) => item.account_name !== 'VAT Payable')[0]
                .account_name
        )
        .map((item) => item.amount)
        .reduce((partial, acc) => partial + acc, 0)

      return { desired_array, exclusive_vat_amount, exclusive_price }
    },

    //fn to handle all the invoice product fields with Calculations (Quantity, Price, VAT %).
    handleInvoiceProduct(value, rowIndex, productKey, product_id = '') {
      let tempProducts = JSON.parse(JSON.stringify(this.new_invoiceProducts))

      if (productKey === 'quantity') {
        value = Math.round(parseInt(value))
        tempProducts = tempProducts?.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                amount: item?.rate * value,
                vat_amount: ((item?.rate * value) / 100) * item?.vat_rate,
                net_total:
                  item?.rate * value +
                  ((item?.rate * value) / 100) * item?.vat_rate,
              }
            : item
        )

        //journal quantity calculation
        if (this.invoice_journal_data.length) {
          tempProducts = tempProducts.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  credit: item?.credit.map((el) => {
                    return {
                      ...el,
                      credit:
                        el?.account_name === 'VAT Payable'
                          ? ((item.rate * value) / 100) * item.vat_rate
                          : item.rate * value,
                    }
                  }),
                  debit: item?.debit.map((el) => {
                    return {
                      ...el,
                      debit:
                        item.rate * value +
                        ((item.rate * value) / 100) * item.vat_rate,
                    }
                  }),
                }
              : item
          )

          // let desired_array = tempProducts[rowIndex]
          // let exclusive_vat_amount = tempProducts
          //   .filter((el, index) => index !== rowIndex)
          //   .map((item) => item.vat_amount)
          //   .reduce((partial, acc) => partial + acc, 0)
          // let exclusive_price = tempProducts
          //   .filter(
          //     (el, index) =>
          //       index !== rowIndex &&
          //       tempProducts[rowIndex].credit.filter(
          //         (item) => item.account_name !== 'VAT Payable'
          //       )[0].account_name ==
          //         el.credit.filter(
          //           (item) => item.account_name !== 'VAT Payable'
          //         )[0].account_name
          //   )
          //   .map((item) => item.amount)
          //   .reduce((partial, acc) => partial + acc, 0)
          const { desired_array, exclusive_vat_amount, exclusive_price } =
            this.journalHelper({ products: tempProducts, rowIndex })

          this.journalAccumulator({
            creditArr: desired_array.credit,
            debitArr: desired_array.debit,
            creditAccount: desired_array.credit.filter(
              (item) => item.account_name !== 'VAT Payable'
            )[0].account_name,
            vat_amount:
              value === '' || isNaN(value)
                ? 0
                : parseFloat(
                    ((desired_array.rate * value) / 100) *
                      desired_array.vat_rate +
                      exclusive_vat_amount ?? 0
                  ),
            product_price:
              value === '' || isNaN(value)
                ? 0
                : desired_array.rate * value + exclusive_price,
            product_id,
            concurrent: true,
          })
        }
      }

      if (productKey === 'rate') {
        //quantity vs rate | amount calculation
        tempProducts = tempProducts.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                amount: value * item.quantity,
                vat_amount: ((value * item.quantity) / 100) * item.vat_rate,
                net_total:
                  value * item.quantity +
                  ((value * item.quantity) / 100) * item.vat_rate,
              }
            : item
        )

        //journal product price calculation
        if (this.invoice_journal_data.length) {
          tempProducts = tempProducts.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  credit: item?.credit.map((el) => {
                    return {
                      ...el,
                      credit:
                        el?.account_name === 'VAT Payable'
                          ? ((item.quantity * value) / 100) * item.vat_rate
                          : item.quantity * value,
                    }
                  }),
                  debit: item?.debit.map((el) => {
                    return {
                      ...el,
                      debit:
                        item.quantity * value +
                        ((item.quantity * value) / 100) * item.vat_rate,
                    }
                  }),
                }
              : item
          )

          // let desired_array = tempProducts[rowIndex]

          const { desired_array, exclusive_vat_amount, exclusive_price } =
            this.journalHelper({ products: tempProducts, rowIndex })

          this.journalAccumulator({
            creditArr: desired_array.credit,
            debitArr: desired_array.debit,
            creditAccount: desired_array.credit.filter(
              (item) => item.account_name !== 'VAT Payable'
            )[0].account_name,

            vat_amount:
              value === '' || isNaN(value)
                ? 0
                : parseFloat(
                    ((desired_array.quantity * value) / 100) *
                      desired_array.vat_rate +
                      exclusive_vat_amount ?? 0
                  ),
            product_price:
              value === '' || isNaN(value)
                ? 0
                : desired_array.quantity * value + exclusive_price,
            product_id,
            concurrent: true,
          })
        }
      }
      if (productKey === 'discount') {
        //discount vs rate | amount calculation
        tempProducts = tempProducts.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                amount: item.rate * item.quantity - value,
                vat_amount:
                  ((item.rate * item.quantity - value) / 100) * item.vat_rate,
                net_total:
                  item.rate * item.quantity -
                  value +
                  ((item.rate * item.quantity - value) / 100) * item.vat_rate,
              }
            : item
        )
      }
      if (productKey === 'vat_rate') {
        //vat rate | amount calculation
        tempProducts = tempProducts.map((item, index) =>
          index === rowIndex
            ? {
                ...item,
                vat_amount: (item.amount / 100) * value,
                net_total: item.amount + (item.amount / 100) * value,
              }
            : item
        )
        //journal vat_rate calculation
        if (this.invoice_journal_data.length) {
          tempProducts = tempProducts.map((item, index) =>
            index === rowIndex
              ? {
                  ...item,
                  credit: item?.credit.map((el) => {
                    return {
                      ...el,
                      credit:
                        el?.account_name === 'VAT Payable'
                          ? (item.amount / 100) * value
                          : item.amount,
                    }
                  }),
                  debit: item?.debit.map((el) => {
                    return {
                      ...el,
                      debit: item.amount + (item.amount / 100) * value,
                    }
                  }),
                }
              : item
          )

          // let desired_array = tempProducts[rowIndex]
          const { desired_array, exclusive_vat_amount, exclusive_price } =
            this.journalHelper({ products: tempProducts, rowIndex })

          this.journalAccumulator({
            creditArr: desired_array.credit,
            debitArr: desired_array.debit,
            creditAccount: desired_array.credit.filter(
              (item) => item.account_name !== 'VAT Payable'
            )[0].account_name,

            vat_amount:
              value === '' || isNaN(value)
                ? 0
                : parseFloat(
                    (desired_array.amount / 100) * value +
                      exclusive_vat_amount ?? 0
                  ),
            product_price: desired_array.amount + exclusive_price,
            product_id,
            concurrent: true,
          })
        }
      }

      tempProducts[rowIndex] = {
        ...tempProducts[rowIndex],
        [productKey]: value,
      }

      this.new_invoiceProducts = tempProducts
    },

    //fn to calculate journal to the products (Quantity, Price and VAT)
    journalAccumulator({
      creditArr = [],
      debitArr = [],
      creditAccount = '',
      vat_amount = 0,
      product_price = 0,
      product_id = '',
      concurrent = false,
    }) {
      console.log({
        creditArr,
        debitArr,
        vat_amount,
        product_price,
        product_id,
        concurrent,
      })
      let creditAccumulator = creditArr.length
        ? creditArr.map((item) => {
            if (item.name === 'VAT Payable') {
              return {
                ...item,
                debit: 0,
                credit: vat_amount,
                customer: this.new_invoice.customer._id,
                isDebit: false,
                isCredit: true,
                account_name: item.name,
                type: 'Invoice',
                id: item.id,
                account: item.id,
                amount: vat_amount,
              }
            }
            return {
              ...item,
              debit: 0,
              credit: product_price,
              customer: this.new_invoice.customer._id,
              isDebit: false,
              isCredit: true,
              account_name: item.name,
              type: 'Invoice',
              id: item.id,
              account: item.id,
              amount: product_price,
            }
          })
        : []
      let debitAccumulator = debitArr.length
        ? debitArr.map((item) => {
            if (item.name === 'VAT Payable') {
              return {
                ...item,
                debit: vat_amount,
                credit: 0,
                customer: this.new_invoice.customer._id,
                isDebit: true,
                isCredit: false,
                account_name: item.name,
                type: 'Invoice',
                id: item.id,
                account: item.id,
                amount: vat_amount,
              }
            }
            return {
              ...item,
              credit: 0,
              debit: product_price + vat_amount,
              customer: this.new_invoice.customer._id,
              isDebit: true,
              isCredit: false,
              account_name: item.name,
              type: 'Invoice',
              id: item.id,
              account: item.id,
              amount: product_price + vat_amount,
            }
          })
        : []
      this.new_invoiceProducts = this.new_invoiceProducts.map((item) => {
        if (item.service === product_id) {
          return {
            ...item,
            credit: creditAccumulator,
            debit: debitAccumulator,
          }
        } else {
          return item
        }
      })
      let totalAccumulator = [...creditAccumulator, ...debitAccumulator]
      if (this.invoice_journal_data.length === 0) {
        this.invoice_journal_data = [...totalAccumulator]
        return
      }
      totalAccumulator.forEach((item) => {
        if (
          this.invoice_journal_data.filter((el) => el.id === item.id).length > 0
        ) {
          const foundedIndex = this.invoice_journal_data.findIndex(
            (el) => el.id === item.id
          )
          if (!concurrent) {
            this.invoice_journal_data[foundedIndex].credit =
              this.invoice_journal_data[foundedIndex].credit + item.credit
            this.invoice_journal_data[foundedIndex].amount = this
              .invoice_journal_data[foundedIndex].isDebit
              ? this.invoice_journal_data[foundedIndex].debit + item.debit
              : this.invoice_journal_data[foundedIndex].credit + item.credit
            this.invoice_journal_data[foundedIndex].debit =
              this.invoice_journal_data[foundedIndex].debit + item.debit
          } else {
            this.invoice_journal_data[foundedIndex].credit = isNaN(item.credit)
              ? 0
              : item.credit
            this.invoice_journal_data[foundedIndex].amount = this
              .invoice_journal_data[foundedIndex].isDebit
              ? item.debit !== 0
                ? item.debit -
                  this.new_invoiceProducts
                    .filter(
                      (el) =>
                        el.service !== product_id &&
                        el.credit.filter(
                          (val) => val.account_name !== 'VAT Payable'
                        )[0].account_name !== creditAccount
                    )
                    .flatMap((el) =>
                      el.credit.filter(
                        (val) => val.account_name === 'VAT Payable'
                      )
                    )
                    .flatMap((el) => el.credit)
                    .reduce((partial, acc) => partial + acc, 0)
                : 0
              : item.credit
            this.invoice_journal_data[foundedIndex].debit = isNaN(item.credit)
              ? 0
              : item.debit !== 0
              ? item.debit -
                this.new_invoiceProducts
                  .filter(
                    (el) =>
                      el.service !== product_id &&
                      el.credit.filter(
                        (val) => val.account_name !== 'VAT Payable'
                      )[0].account_name !== creditAccount
                  )
                  .flatMap((el) =>
                    el.credit.filter(
                      (val) => val.account_name === 'VAT Payable'
                    )
                  )
                  .flatMap((el) => el.credit)
                  .reduce((partial, acc) => partial + acc, 0)
              : 0
          }

          // this.invoice_journal_data[foundedIndex].products = [
          //   ...this.invoice_journal_data[foundedIndex].products,
          //   ...product_id,
          // ]
          // this.invoice_journal_data[foundedIndex].product_wise = [
          //   ...this.invoice_journal_data[foundedIndex].product_wise,
          //   {
          //     id: product._id,
          //     debit: item.debit,
          //     credit: item.credit,
          //   },
          // ]
        } else {
          this.invoice_journal_data.push(item)
        }
      })
    },

    //fn to prefill product table values on selecting a product from dropdown
    handlePrefillProductValues(value, rowIndex) {
      let tempProducts = this.new_invoiceProducts
      console.log('product prefill', value)
      tempProducts = tempProducts.map((item, index) => {
        if (index === rowIndex) {
          return {
            ...item,
            quantity: 1,
            rate: value.price,
            amount: value.price,
            type: 'Product',
            date: new Date().toISOString().substr(0, 10),
            discount: 0,
            isInventory: value.isInventory,
            vat_rate: value.tax_code.rate,
            vat_amount: (value.price / 100) * value.tax_code.rate,
            net_total: value.price + (value.price / 100) * value.tax_code.rate,
            credit: [],
            debit: [],
          }
        }
        return item
      })
      this.new_invoiceProducts = tempProducts
    },
    handleDeleteExistingProductJournal(serviceName, index) {
      let tempInvoiceJournalData = this.invoice_journal_data
      let tempInvoiceProductCredit = this.new_invoiceProducts[
        index
      ]?.credit.filter((item) => item.account_name !== 'VAT Payable')[0]
      let tempInvoiceProductDebit = this.new_invoiceProducts[index]?.debit[0]
      let tempInvoiceProductVAT = this.new_invoiceProducts[
        index
      ]?.credit.filter((item) => item.account_name === 'VAT Payable')[0]
      tempInvoiceJournalData = tempInvoiceJournalData.map((journal, jIndex) => {
        if (journal.account_name === tempInvoiceProductCredit.account_name) {
          return {
            ...journal,
            credit:
              parseFloat(journal?.credit) -
              parseFloat(tempInvoiceProductCredit?.credit),
            amount:
              parseFloat(journal?.credit) -
              parseFloat(tempInvoiceProductCredit?.credit),
          }
        }
        if (journal.account_name === tempInvoiceProductDebit.account_name) {
          return {
            ...journal,
            debit:
              parseFloat(journal?.debit) -
              parseFloat(tempInvoiceProductDebit?.debit),
            amount:
              parseFloat(journal?.debit) -
              parseFloat(tempInvoiceProductDebit?.debit),
          }
        }
        if (journal.account_name === tempInvoiceProductVAT.account_name) {
          return {
            ...journal,
            credit:
              parseFloat(journal?.credit) -
              parseFloat(tempInvoiceProductVAT?.credit),
            amount:
              parseFloat(journal?.credit) -
              parseFloat(tempInvoiceProductVAT?.credit),
          }
        }
        return journal
      })
      this.invoice_journal_data = tempInvoiceJournalData.filter(
        (item) => item.amount !== 0
      )
    },
    async handleProductJournal(product) {
      let vat_amount = (product.price / 100) * product.tax_code.rate
      let product_price = product.price
      this.setShowLoader(true)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let payload = {
        company: this.company_id.id,
        customer: this.new_invoice.customer_id,
      }
      await this.$axios
        .post(`service/journal-info/${product._id}`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          console.log('response Journal', res)
          let credit = res.data.data.product.accounts.credit
          let debit = res.data.data.product.accounts.debit
          let tempData = this.invoice_journal_data
          let creditAccumulator = credit.length
            ? credit.map((item) => {
                if (item.name === 'VAT Payable') {
                  return {
                    ...item,
                    debit: 0,
                    credit: vat_amount,
                    account_name: item.name,
                    isDebit: false,
                    isCredit: true,
                    type: 'Invoice',
                    id: item.id,
                    account: item.id,
                    amount: vat_amount,
                    description: '',
                    customer: this.new_invoice.customer_id,
                  }
                }
                return {
                  ...item,
                  debit: 0,
                  isDebit: false,
                  isCredit: true,
                  credit: product_price,
                  account_name: item.name,
                  type: 'Invoice',
                  id: item.id,
                  account: item.id,
                  amount: product_price,
                  description: '',
                  customer: this.new_invoice.customer_id,
                }
              })
            : []
          let debitAccumulator = debit.length
            ? debit.map((item) => {
                if (item.name === 'VAT Payable') {
                  return {
                    ...item,
                    debit: vat_amount,
                    credit: 0,
                    account_name: item.name,
                    isDebit: true,
                    isCredit: false,
                    type: 'Invoice',
                    id: item.id,
                    account: item.id,
                    amount: vat_amount,
                    description: '',
                    customer: this.new_invoice.customer_id,
                  }
                }
                return {
                  ...item,
                  credit: 0,
                  debit: product_price + vat_amount,
                  account_name: item.name,
                  isDebit: true,
                  isCredit: false,
                  amount: product_price + vat_amount,
                  type: 'Invoice',
                  id: item.id,
                  account: item.id,
                  description: '',
                  customer: this.new_invoice.customer_id,
                }
              })
            : []

          this.new_invoiceProducts = this.new_invoiceProducts.map((item) => {
            if (item.service === product._id) {
              return {
                ...item,
                credit: creditAccumulator,
                debit: debitAccumulator,
              }
            } else {
              return item
            }
          })

          let totalAccumulator = [...creditAccumulator, ...debitAccumulator]
          if (this.invoice_journal_data.length === 0) {
            this.invoice_journal_data = totalAccumulator
            return
          }

          totalAccumulator.forEach((item) => {
            if (
              this.invoice_journal_data.filter((el) => el.id === item.id)
                .length > 0
            ) {
              const foundedIndex = this.invoice_journal_data.findIndex(
                (el) => el.id === item.id
              )
              this.invoice_journal_data[foundedIndex].credit =
                this.invoice_journal_data[foundedIndex].credit + item.credit
              this.invoice_journal_data[foundedIndex].debit =
                this.invoice_journal_data[foundedIndex].debit + item.debit
            } else {
              this.invoice_journal_data.push(item)
            }
          })
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to retrieve Journal for Product',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
        })
        .finally(() => {
          this.setShowLoader(false)
        })

      console.log('journal ', this.invoice_journal_data)
    },

    handleDraft() {},

    async createInvoice() {
      let payload = {
        customer: this.new_invoice.customer_id,
        customer_name: this.new_invoice.customer_name,
        customer_address: this.new_invoice.billing_address,
        email: 'mina@bp.com',
        billing_address: this.new_invoice.billing_address,
        shipping_address: this.new_invoice.billing_address,
        terms: this.term._id,
        terms_name: this.term.name,
        invoice_date: this.new_invoice.date,
        due_date: this.new_invoice.due_date,
        sale_location: this.sale_location,
        items: this.new_invoiceProducts.map((item) => {
          const { credit, debit, ...values } = item
          return values
        }),
        journal_entry: this.invoice_journal_data,
        sub_total: this.newInvoiceSubTotal,
        vat_total: this.newInvoiceVATAmount,
        total: this.newInvoiceTotal,
        customer_notes: this.customer_note,
        terms_condition: this.customer_statement,
        is_recurring: false,
        is_draft: false,
        company: this.company_id.id,
      }
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.setShowLoader(true)
      await this.$axios
        .$post('invoice', payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Invoice is Created Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          this.resetNewInvoiceForm()
          this.invoice_in_pdf = false
          // this.add_edit_toggler = false
          this.setInvoiceAddEditToggler(false)
          this.setShowLoader(false)
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Create Invoice',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
          this.setShowLoader(false)
        })
      console.log({ payload })
    },

    //fn to handle edit invoices which already present
    handleEditInvoice() {
      this.setShowLoader(true)
      try {
        this.company_id = this.companySelection.filter(
          (item) => item.id === this.invoice_pdf.company
        )[0]
        this.new_invoice.customer = this.invoice_pdf?.c_name ?? ''
        this.new_invoice.email = this.invoice_pdf?.email ?? ''
        this.new_invoice.billing_address = this.invoice_pdf?.address ?? ''
        this.new_invoice.date =
          this.invoice_pdf?.date ?? new Date().toISOString().substr(0, 10)
        this.new_invoice.due_date =
          this.invoice_pdf?.due_date ?? new Date().toISOString().substr(0, 10)
        this.new_invoiceProducts = this.invoice_pdf.input
      } catch (error) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to Edit Invoice',
          color: 'danger',
          icon: 'info',
          timeout: 2000,
        }
      } finally {
        this.setInvoiceAddEditToggler(true)
        this.setShowLoader(false)
      }
    },
  },
  watch: {
    options: {
      handler() {
        this.handleData()
      },
      deep: true,
    },
    getSelectedCompanies: {
      handler(newVal, oldVal) {
        if (newVal.length === 1) {
          this.company_id = newVal[0]
        }
      },
      deep: true,
    },
    company_id: {
      handler(newVal) {
        console.log('helloo', newVal)
        this.fetchProducts(newVal)
      },
      deep: true,
    },
  },
}
</script>
<style lang="scss" scoped>
.invoice_preview_card {
  background: #e2e7f1 !important;
  padding: 20px;
  border: 0.5px solid #e2e7f1 !important;
  border-radius: 20px !important;
  box-shadow: 0px 3px 6px #0a2c4f0d !important;
  margin: 0 !important;
  padding: 0 !important;
}

.invoice_preview_card_title {
  background: white !important;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 1rem !important;
  margin: 0 !important;
}

.invoice_preview_card_text {
  margin-top: 40px !important;
  padding: 0px;
  margin: 0px;
}

.a4__con {
  background: white;
  border-radius: 15px;
  padding: 10px;
}

.preview_invoice {
  padding: 33px !important;
  padding-top: 5px !important;
}

// dynamic table (add/edit)
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

// total container
.total__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  // width: 400px;
  height: 150px;
}

// Invoice Journal Table
.invoice_journal_table {
  margin-top: 10px;
  border-collapse: collapse;

  .invoice_journal_thead {
    .invoice_journal_headers {
      background: #e2e7f180;
    }

    .edit_invoice_journal_headers {
      background: #e2e7f180;
      border-bottom: 1px solid #000000;
      border: 0.5px solid #d9d9d9;
    }
  }

  .invoice_journal_tbody {
    .invoice_journal_rows {
      height: 60px !important;

      .edit_invoice_journal_td {
        border: 0.5px solid #d9d9d9;
      }
    }
  }
}

// table {
//     border-collapse: collapse;
// }
// table thead tr th {
//   border-bottom: 1px solid #000000;
// }

// table th,
// table td {
//   border: 1px solid #d9d9d9;
// }
.quill-col {
  .quill-editor {
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
      background-color: #ecf4f8;
      border-radius: 10px;
    }

    &::-webkit-scrollbar {
      width: 5px;
      border-radius: 10px;
      background-color: #ecf4f8;
    }

    &::-webkit-scrollbar-thumb {
      // border-radius: 60%;
      background-image: -webkit-gradient(
        linear,
        left bottom,
        left top,
        color-stop(0.44, #0a94ff),
        color-stop(0.72, #0a94ff),
        color-stop(0.86, #0a94ff)
      );
      border-radius: 10px;
    }
  }
}

.terms_paragraph {
  font-size: 12px !important;
  line-height: 20px !important;
}
</style>
