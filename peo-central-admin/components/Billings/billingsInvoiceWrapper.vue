<template>
  <div style="width: 100%">
    <BillingsCard
      :data="invoiceCount"
      :active-tab="activeStatusFilter"
      @statusToggle="changeActiveStatus"
    />
    <v-row class="row1" v-if="!showEditModel">
      <!-- payroll Invoice and Debit Note Dialog -->
      <BillingsDialog
        :clickedButton="clickedButton"
        :dialogData="billingsDialogs"
        @close="closeBillingsDialog"
      />

      <BillingsPaymentDialog
        v-if="billingsPaymentDialogs"
        :selectedEmployerStatus="filter.selectedEmployerStatus"
        :dialogData="billingsPaymentDialogs"
        @close="closeBillingsDialog"
        @mail-clicked="getBillingsEmail(InvoiceDetails)"
        @download-clicked="downloadInvoice(InvoiceDetails._id)"
        @print-clicked="printInvoice(InvoiceDetails._id)"
      >
        <template
          v-slot:invoice-preview
          v-if="filter.selectedEmployerStatus == 'Paid'"
        >
          <InvoicePreview :invoice_id="InvoiceDetails._id" />
        </template>
      </BillingsPaymentDialog>

      <InvoicePreviewPanel
        v-if="invoicePreviewFlag"
        :open="invoicePreviewFlag"
        :InvoiceDetails="InvoiceDetails"
  :void-filter-active="filter.void === true"
        @closeApprovalDialog="closeApprovalDialog"
        @openEditor="openEditor"
        @openCreditNoteEditor="openCreditNoteEditor"
        @openDebitNoteEditor="openDebitNoteEditor"
        @add-payment="handleRecordPayment"
        @sendInvoiceEmail="getBillingsEmail"
        @edit-credit-note="editCreditNote"
        @edit-custom-credit-note="handleEditCustomCreditNote"
        @reload="handleReload"
      />

      <BulkPayments
        v-if="bulkPaymentsDialog"
        :open="bulkPaymentsDialog"
        :selectedInvoices="selectedInvoices"
        @close="bulkPaymentsDialog = false"
        @reload="handleReload"
      />

      <CreditNoteDialog
        v-if="creditNoteDialog"
        :show="creditNoteDialog"
        :originalInvoice="selectedItem"
        :creditNoteToEdit="selectedCreditNote"
        :viewMode="creditNoteViewMode"
        @close="closeCreditNoteDialog"
        @reload="handleReload"
      />
      <!-- <v-dialog id="custom_dialog" v-model="filterDialog" persistent max-width="400px" content-class="">
            <v-card id="card" style="padding: 20px 30px !important">
              <v-card-title id="card-title">
                <h4 class="text--text">Filter</h4>
                <v-icon small color="subtext" class="ml-5" @click="filterDialog = false">fa-close
                </v-icon>
              </v-card-title>
              <v-card-text id="card-text">
                <v-container class="ma-0 pa-0">
                  <v-row class="pb-0">
                    <v-col cols="12" class="pa-0">
                      <h5 class="text--text">By Employee</h5>
                    </v-col>
                    <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                      <div slot="input">
                        <v-select :items="employees" placeholder="Select Employee" solo dense multiple
                          v-model="filter.selectedEmployees" item-text="first_name" item-value="_id"
                          class="proposalDialog_date_field2" v-if="employees.length >= 1" append-icon="fa-chevron-down">
                        </v-select>

                        <p v-else class="error--text mb-5 mt-5">
                          Please Select Employee
                        </p>
                      </div>
                    </v-col>
                    <v-col cols="12" class="pa-0" v-if="
                      ['isSuperAdmin'].includes($store.getters.getThisUserRole)
                    ">
                      <h5 class="text--text">By Employer</h5>
                    </v-col>
                    <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0" v-if="
                      ['isSuperAdmin'].includes($store.getters.getThisUserRole)
                    ">
                      <div slot="input">
                        <v-select :items="employers" placeholder="Select Employers" solo dense multiple
                          v-model="filter.selectedEmployers" item-text="company_name" item-value="_id"
                          class="proposalDialog_date_field2" v-if="employers.length >= 1" append-icon="fa-chevron-down">
                        </v-select>

                        <p v-else class="error--text mb-5 mt-5">
                          Please Select Employers
                        </p>
                      </div>
                    </v-col>

                    <v-col cols="12" class="pa-0">
                      <h5 class="text--text">Date</h5>
                    </v-col>
                    <v-col cols="6" class="Leads_filter_date_column pl-0 pr-0 pb-0">
                      <CustomInputContainer label="From" :mandatory="true">
                        <div slot="input">
                          <v-menu v-model="exp_date_menu" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field v-model="filter.estimate_date" placeholder="mm/dd/yy"
                                class="proposalDialog_date_field2" solo dense hide-details v-bind="attrs" v-on="on"
                                :rules="main_rule">
                                <template v-slot:append>
                                  <div class="">
                                    <CalenderSvg />
                                  </div>
                                </template>
                              </v-text-field>
                            </template>
                            <v-date-picker v-model="filter.estimate_date" @input="exp_date_menu = false" />
                          </v-menu>
                        </div>
                      </CustomInputContainer>
                    </v-col>
                    <v-col cols="6" class="pr-0 pb-0">
                      <CustomInputContainer label="To" :mandatory="true">
                        <div slot="input">
                          <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                            transition="scale-transition" offset-y min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field v-model="filter.exp_date" placeholder="Enter Date"
                                class="proposalDialog_date_field2" solo dense v-bind="attrs" v-on="on" :rules="main_rule">
                                <template v-slot:append>
                                  <div class="">
                                    <CalenderSvg />
                                  </div>
                                </template>
                              </v-text-field>
                            </template>
                            <v-date-picker v-model="filter.exp_date" @input="date_menu = false" />
                          </v-menu>
                        </div>
                      </CustomInputContainer>
                    </v-col>

                    <v-col cols="12" class="pa-0">
                      <h5 class="text--text pb-0">By Status</h5>
                    </v-col>
                    <v-col cols="12" class="pl-0 pr-0 mb-4">
                      <v-btn v-for="(button, index) in buttons" :key="index" @click="handleFilterClick(index)"
                        :class="{ clicked: button.clicked }" class="customer_table_btn pa-2 mr-1 mb-2" value="inactive"
                        outlined>
                        <span class="filter_btn pa-0">{{ button.text }}</span>
                      </v-btn>
                    </v-col>

                    <v-col cols="12" class="ma-0 pa-0">
                      <div class="d-flex align-center justify-end">
                        <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" outlined><span class=""
                            @click="; (filterDialog = false), clearFilter()">Clear All</span></v-btn>
                        <v-btn class="tall__btn pl-6 pr-6" color="primary"
                          @click="; (filterDialog = false), handleFilterBillings()">Done
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog> -->
      <!-- / FILTER DIALOG -->
      <!-- Invoices List column (12 - 5) -->
      <v-col>
        <v-card color="card_bg" id="card" style="height: 80vh !important">
          <v-card-text
            id="card-text"
            style="margin-top: 0 !important"
            :class="privacyMood ? 'privacyMood' : ''"
          >
            <v-row>
              <v-btn
                color="primary"
                @click="openReports = true"
                outlined
                class="export-btn"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon left small>fa-download</v-icon>
                Billings Exports
              </v-btn>
              <!-- <v-menu v-model="exportMenu" :close-on-click="false" :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn color="primary" outlined class="export-btn" v-bind="attrs" v-on="on">
                        <v-icon left small>fa-download</v-icon>
                        Export Reports
                      </v-btn>
                    </template>

                    <v-card min-width="300">
                      <v-list class="export-list pa-2">
                        <v-list-item>
                          <v-list-item-content>
                            <div class="text-subtitle-1 font-weight-medium mb-2">
                              Export Reports
                            </div>
                          </v-list-item-content>
                        </v-list-item>

                        <v-divider></v-divider>

                        <v-list-item>
                          <v-list-item-action>
                            <v-checkbox v-model="selectedReports" value="ageing-detailed"
                              :loading="loadingReports.ageingDetailed" color="primary" hide-details></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>Ageing Detailed Report</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-action>
                            <v-checkbox v-model="selectedReports" value="ageing-summary"
                              :loading="loadingReports.ageingSummary" color="primary" hide-details></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>Ageing Summary Report</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-action>
                            <v-checkbox v-model="selectedReports" value="peo-detailed" :loading="loadingReports.peoDetailed"
                              color="primary" hide-details></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <v-list-item-title>PEO Detailed Invoicing Report</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>

                      <v-divider></v-divider>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="exportMenu = false"> Cancel </v-btn>
                        <v-btn color="primary" :disabled="!selectedReports.length" :loading="exportingAll"
                          @click="exportSelected">
                          Export Selected
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu> -->
              <v-spacer />

              <div class="tw-flex tw-items-center tw-gap-3">
                <!-- Search Input -->
                                  <div class="tw-w-[250px]">
                    <v-text-field
                      v-model="filter.searchQuery"
                      placeholder="Search invoices..."
                      solo
                      dense
                      clearable
                      hide-details
                      class="tw-bg-white tw-rounded"
                      @input="handleSearchInput"
                      @click:clear="handleSearchClear"
                      @keyup.enter="executeSearchImmediately"
                      :loading="isSearchPending"
                      :hint="searchStatusText"
                      persistent-hint
                    >
                    <template v-slot:append>
                      <v-btn
                        icon
                        small
                        @click="handleSearchClick"
                        :loading="dataLoading"
                        class="tw-ml-1"
                        :color="isSearchPending ? 'warning' : 'primary'"
                      >
                        <v-icon v-if="isSearchPending">mdi-clock-outline</v-icon>
                        <v-icon v-else>mdi-magnify</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </div>

                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :disabled="
                        selectedInvoices.length == 0 || loading_email_send || filter.void
                      "
                      :loading="loading_email_send"
                      @click="handleBulkEmailSend"
                      color="orange"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon color="white">mdi-email</v-icon>
                      <span class="tw-text-white">Send Emails</span>
                    </v-btn>
                  </template>
                  <span
                    >Only non-draft invoices can be selected for email
                    sending</span
                  >
                </v-tooltip>
                <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                  <template v-slot:activator="{ attrs, on }">
                    <v-btn color="primary" v-bind="attrs" v-on="on">
                      New
                      <v-divider vertical class="mx-2"></v-divider>
                      <LightArrow class="ml-2" style="max-width: 10px" />
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in new_menu"
                      :key="index"
                      link
                      @click="handleNewTransaction(item.value)"
                      :class="item.locked ? 'disabledItem' : ''"
                    >
                      <v-list-item-title class="">
                        <v-icon v-if="item.locked" x-small class="pr-1"
                          >fa fa-lock
                        </v-icon>
                        <span class="n_text text--text ml-2">{{
                          item.title
                        }}</span>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-row>
            <v-row>
              <v-col cols="12" class="pl-0 pr-0 pb-4">
                <div class="flex_row align-center top_barCustomer">
                  <!-- <div class="tw-flex tw-items-center tw-gap-5">
                    <v-chip-group  v-model="filter.status" column multiple>
                      <v-chip v-for="status in billingStatusList" :key="status" :value="status" :disabled="dataLoading" filter outlined>
                        {{status}}
                      </v-chip>
                    </v-chip-group>

                    <v-divider vertical  />

                    <div class="custom-switch">
                       <v-switch
                          v-model="show_draft_invoices"
                          inset
                          :label="!show_draft_invoices ? 'Show Draft' : 'Hide Draft'"
                        ></v-switch>
                    </div>
                  </div> -->

                  <!-- top Buttons -->
                  <div>
                    <!--                    <v-btn-->
                    <!--                      class="short__btn mr-1 pl-6 pr-6"-->
                    <!--                      color="subtext"-->
                    <!--                      outlined-->
                    <!--                    >-->
                    <!--                      <span class="primary&#45;&#45;text span_leadHeading"-->
                    <!--                        >Notify Expired</span-->
                    <!--                      >-->
                    <!--                    </v-btn>-->
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Billings Table -->

            <div class="tw-flex tw-justify-end tw-items-center">
              <!-- filters -->
              <v-row class="pb-0">
                <v-col cols="3">
                  <CustomInputContainer
                    label="Filter by Employee"
                    class="text--text"
                  >
                    <div slot="input">
                      <v-autocomplete
                        :items="employees"
                        placeholder="Filter Employee"
                        solo
                        dense
                        multiple
                        v-model="filter.selectedEmployees"
                        item-text="first_name"
                        item-value="_id"
                        class="proposalDialog_date_field2"
                        append-icon="fa-chevron-down"
                        :search-input.sync="filter.employeeSearch"
                        @update:search-input="handleEmployeeSearchInput"
                        :filter="(item, query, itemText) => itemText && itemText.toLowerCase().includes(query.toLowerCase())"
                        hide-selected
                        chips
                      >
                      </v-autocomplete>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col
                  cols="3"
                  v-if="
                    ['isSuperAdmin'].includes($store.getters.getThisUserRole)
                  "
                >
                  <CustomInputContainer label="Filter By Client">
                    <div slot="input">
                      <v-autocomplete
                        :items="employers"
                        placeholder="Filter By Client"
                        solo
                        dense
                        multiple
                        v-model="filter.selectedEmployers"
                        item-text="company_name"
                        item-value="_id"
                        class="proposalDialog_date_field2"
                        append-icon="fa-chevron-down"
                        :search-input.sync="filter.clientSearch"
                        @update:search-input="handleClientSearchInput"
                        :filter="(item, query, itemText) => itemText && itemText.toLowerCase().includes(query.toLowerCase())"
                        hide-selected
                        chips
                      >
                      </v-autocomplete>
                    </div>
                  </CustomInputContainer>
                </v-col>

                <v-col cols="2">
                  <CustomInputContainer label="From">
                    <div slot="input">
                      <v-menu
                        v-model="exp_date_menu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="filter.estimate_date"
                            placeholder="mm/dd/yy"
                            class="proposalDialog_date_field2"
                            solo
                            dense
                            hide-details
                            v-bind="attrs"
                            v-on="on"
                          >
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker
                          v-model="filter.estimate_date"
                          @input="exp_date_menu = false"
                        />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="2">
                  <CustomInputContainer label="To">
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
                            v-model="filter.exp_date"
                            placeholder="Enter Date"
                            class="proposalDialog_date_field2"
                            solo
                            dense
                            v-bind="attrs"
                            v-on="on"
                          >
                            <template v-slot:append>
                              <div class="">
                                <CalenderSvg />
                              </div>
                            </template>
                          </v-text-field>
                        </template>
                        <v-date-picker
                          v-model="filter.exp_date"
                          @input="date_menu = false"
                        />
                      </v-menu>
                    </div>
                  </CustomInputContainer>
                </v-col>

                <v-col cols="2">
                  <CustomInputContainer label="">
                    <template slot="input">
                      <v-btn
                        @click="clearFilter"
                        class="tw-mt-5"
                        outlined
                        color="primary"
                      >
                        Reset
                      </v-btn>
                    </template>
                  </CustomInputContainer>
                </v-col>

                <!-- <v-col cols="12" class="pa-0">
                      <h5 class="text--text pb-0">By Status</h5>
                    </v-col>
                    <v-col cols="12" class="pl-0 pr-0 mb-4">
                      <v-btn
                        v-for="(button, index) in buttons"
                        :key="index"
                        @click="handleFilterClick(index)"
                        :class="{ clicked: button.clicked }"
                        class="customer_table_btn pa-2 mr-1 mb-2"
                        value="inactive"
                        outlined
                      >
                        <span class="filter_btn pa-0">{{ button.text }}</span>
                      </v-btn>
                    </v-col>

                    <v-col cols="12" class="ma-0 pa-0">
                      <div class="d-flex align-center justify-end">
                        <v-btn
                          class="tall__btn mr-4 pl-6 pr-6"
                          color="subtext"
                          outlined
                          ><span
                            class=""
                            @click=";(filterDialog = false), clearFilter()"
                            >Clear All</span
                          ></v-btn
                        >
                        <v-btn
                          class="tall__btn pl-6 pr-6"
                          color="primary"
                          @click=";(filterDialog = false), handleFilterBillings()"
                          >Done
                        </v-btn>
                      </div>
                    </v-col> -->
              </v-row>

              <!-- filters-end -->
              <span class="mr-4 d-flex align-items-center">
                <span class="mr-2 mt-2 font-weight-medium">Refresh</span>
                <v-btn icon @click="refreshBillingList" :loading="isRefreshing">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </span>
              <v-menu
                v-model="menuOpen"
                offset-y
                :close-on-click="false"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <span class="mr-2 mt-2 font-weight-medium">
                    Toggle Columns</span
                  >
                  <v-btn icon v-bind="attrs" v-on="on" class="mr-2">
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </template>
                <v-card min-width="200">
                  <v-list dense>
                    <v-list-item>
                      <v-checkbox
                        v-model="tempSelectAll"
                        label="Select All"
                        dense
                        hide-details
                        class="ma-0"
                        @change="toggleAllTemp"
                      ></v-checkbox>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item
                      v-for="header in billings_documents_headers"
                      :key="header.value"
                    >
                      <v-checkbox
                        v-model="tempVisibility[header.value]"
                        :label="header.text"
                        dense
                        hide-details
                        class="ma-0"
                      ></v-checkbox>
                    </v-list-item>
                    <v-divider></v-divider>
                    <div class="d-flex justify-end pa-2">
                      <v-btn
                        color="primary"
                        small
                        class="short__btn"
                        @click="saveVisibility"
                      >
                        Save
                      </v-btn>
                    </div>
                  </v-list>
                </v-card>
              </v-menu>
            </div>
            <v-data-table
              id="coa_table"
              :loading="dataLoading"
              :options.sync="options"
              :server-items-length="filter.totalResults"
              loading-text="Loading... Please wait"
              v-model="selectedInvoices"
              item-key="_id"
              :single-select="false"
              :headers="visibleHeaders"
              @item-selected="onItemSelected"
              :items="billingList"
              hide-default-header
            >
              <template v-slot:header>
                <thead class="dynamic_table_thead">
                  <tr style="height: 35px !important">
                    <th style="width: 48px; background-color: #e2e7f180"></th>
                    <!-- Empty header for checkbox column -->
                    <th
                      v-for="header in visibleHeaders"
                      :key="header.value"
                      :class="[
                        header.align ? `text-${header.align}` : '',
                        'text-center text--text font-weight-bold',
                      ]"
                      style="
                        font-size: 12px !important;
                        font-weight: 500 !important;
                      "
                    >
                      {{ header.text }}
                    </th>
                  </tr>
                </thead>
              </template>
              <template v-slot:item="{ item, isSelected, select }">
                <tr
                  :class="{
                    'draft-row': item.is_draft,
                    'email-sent-row': isInvoiceSent(item),
                  }"
                >
                  <td>
                    <v-tooltip v-if="item.is_draft" bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <div
                          v-bind="attrs"
                          v-on="on"
                          class="checkbox-placeholder"
                        >
                          <v-icon x-small color="grey lighten-1"
                            >mdi-lock</v-icon
                          >
                        </div>
                      </template>
                      <span>Draft invoices cannot be emailed</span>
                    </v-tooltip>

                    <v-checkbox
                      v-else-if="
                        ['Due', 'Overdue', 'Paid'].includes(item.status) && !filter.void
                      "
                      :input-value="isSelected"
                      @click.stop="select(!isSelected)"
                      hide-details
                      dense
                    ></v-checkbox>
                  </td>
                  <td
                    v-if="columnVisibility['invoice_number']"
                    style="height: 100%; cursor: pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                    :style="{
                      borderLeft: `5px solid ${
                        item.status === 'Paid'
                          ? '#1AD598'
                          : item.status === 'Partially Paid'
                          ? '#ff6666'
                          : item.status === 'Overdue'
                          ? '#ffb536'
                          : item.status === 'Due'
                          ? '#ff9999'
                          : item.status === 'Unapproved'
                          ? '#000'
                          : ''
                      }`,
                    }"
                  >
                    <div class="d-flex align-items-center">
                      {{
                        `${item.invoice_number} ${
                          item.is_draft ? '(Draft)' : ''
                        }`
                      }}
                      <v-icon
                        v-if="isInvoiceSent(item)"
                        color="primary"
                        small
                        class="ml-1"
                        title="Email sent"
                      >
                        mdi-email-check
                      </v-icon>
                    </div>
                  </td>
                  <td
                    v-if="columnVisibility['invoice_date']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    {{ item.invoice_date | formatDateWithoutTime }}
                  </td>
                  <td
                    v-if="columnVisibility['type']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    <div class="d-flex align-center">
                      {{ formatInvoiceType(item.type) }}
                      <!-- <v-chip class="ml-2 w-full" color="primary" v-if="recentlyViewedIds.includes(item._id)">
                        Recently Viewed
                      </v-chip> -->
                    </div>
                  </td>

                  <td
                    v-if="columnVisibility['customer_name']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    <div class="d-flex align-center">
                      <v-avatar class="mr-2" size="30px">
                        <v-img
                          v-if="item.companyDetails && item.companyDetails.logo"
                          alt="Company Logo"
                          :src="item.companyDetails.logo"
                        ></v-img>
                        <div
                          v-else
                          class="d-flex align-center justify-center"
                          style="background-color: #E3F2FD; color: #1976D2; font-weight: 500; font-size: 14px; width: 100%; height: 100%;"
                        >
                          {{ getClientInitials(item) }}
                        </div>
                      </v-avatar>
                      <a href="#" class="text-decoration-none">
                        <a href="#" class="text-decoration-none">
                          {{
                            !item.is_individual_invoice
                              ? item.customer_name
                              : `${item.items[0].user.first_name} ${item.items[0].user.last_name}`
                          }}
                        </a>
                      </a>
                    </div>
                  </td>

                  <td
                    v-if="columnVisibility['due_date']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    {{ item.due_date | formatDateWithoutTime }}
                  </td>
                  <td
                    v-if="columnVisibility['memo']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    {{ item.memo }}
                  </td>
                  <td
                    v-if="columnVisibility['visa_sponsor']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    {{ item.visa_sponsor =='Dynamic Employment Services' ? 'DES' : item.visa_sponsor == 'Executive Employment Services' ? 'EES' : "N/A" }}
                  </td>
                  <td
                    v-if="columnVisibility['total']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    <b>{{ formatCurrency(item.total, item.currency || 'AED') }}</b>
                  </td>
                  <td
                    v-if="columnVisibility['settled_amount']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    <b>{{ formatCurrency(getSettledAmount(item), item.currency || 'AED') }}</b>
                  </td>
                  <td
                    v-if="columnVisibility['remaining_balance']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    <b>{{ formatCurrency(getRemainingBalance(item), item.currency || 'AED') }}</b>
                  </td>
                  <td
                    v-if="columnVisibility['is_sent']"
                    class="cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    <span
                      v-if="['Due', 'Overdue', 'Paid'].includes(item.status)"
                    >
                      <v-chip
                        small
                        :color="
                          item.is_sent &&
                          (item.is_sent.Due ||
                            item.is_sent.Overdue ||
                            item.is_sent.Paid)
                            ? 'success'
                            : 'grey lighten-1'
                        "
                        text-color="white"
                      >
                        {{
                          item.is_sent &&
                          (item.is_sent.Due ||
                            item.is_sent.Overdue ||
                            item.is_sent.Paid)
                            ? 'Sent'
                            : 'Pending'
                        }}
                      </v-chip>

                      <div
                        v-if="
                          item.is_sent &&
                          (item.is_sent.Due ||
                            item.is_sent.Overdue ||
                            item.is_sent.Paid) &&
                          item.sent_date
                        "
                        class="sent-date-text"
                      >
                        {{ formatSentDate(item.sent_date) }}
                      </div>
                    </span>

                    <span v-else>
                      <v-chip small color="grey lighten-1" text-color="white"
                        >Pending</v-chip
                      >
                    </span>
                  </td>

                  <td
                    v-if="columnVisibility['status']"
                    class="pa-0 ma-0 pl-3 cursor-pointer"
                    @click="
                      !$event.target.closest('a') && handleEmployerId(item)
                    "
                  >
                    <div class="">
                      <span
                        class="table_btn light_accent4 accent4--text"
                        v-if="item.status == 'Paid'"
                        >{{ item.status }}</span
                      >
                      <span
                        class="table_btn light_accent3 accent3--text"
                        v-else-if="item.status == 'Overdue'"
                        >{{ item.status }}</span
                      >
                      <span
                        class="table_btn light_accent2"
                        style="color: #ff6666"
                        v-else-if="item.status == 'Partially Paid'"
                        >{{ item.status }}</span
                      >
                      <span
                        class="table_btn light_accent2"
                        style="color: #ff9999"
                        v-else-if="item.status == 'Due'"
                        >{{ item.status }}</span
                      >

                      <span
                        class="table_btn light_accent2 accent3--text"
                        style="color: #fff"
                        v-else-if="item.status == 'Unapproved'"
                        >{{ item.status }}</span
                      >
                    </div>
                  </td>
                  <td v-if="columnVisibility['credit_notes']" class="">
                    <div class="d-flex align-center">
                      <a
                        href="/"
                        class="text-decoration-none"
                        @click.prevent="fetchCreditNotes(item.id)"
                      >
                        View
                      </a>
                    </div>
                  </td>
                  <td v-if="columnVisibility['action']" class="">
                    <div class="d-flex align-center justify-end">
                      <v-btn
                        v-if="['Due', 'Overdue', 'Paid'].includes(item.status)"
                        icon
                        class="mr-6 d-flex align-center text-decoration-none"
                        href="#"
                        :disabled="filter.void"
                        @click.prevent="!filter.void && getBillingsEmail(item)"
                      >
                        <v-icon class="mr-1" small>mdi-email</v-icon>
                        <span v-if="item.action">{{ item.action }}</span>
                      </v-btn>

                      <v-btn
                        v-if="!['Partially Paid', 'Paid'].includes(item.status)"
                        icon
                        color="red"
                        class="mr-6 d-flex align-center text-decoration-none"
                        href="#"
                        :disabled="filter.void"
                        @click.prevent="!filter.void && showConfirmation(item)"
                      >
                       <!-- <v-icon class="mr-1" small>mdi-delete-outline</v-icon> -->
                        <span class="red--text font-weight-bold">Void</span>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
          <Observer
            v-if="loadObserver && !searchSelected"
            @intersect="getBillingList"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="confirmDeletion.show"
      max-width="500px"
      min-width="350px"
      persistent
    >
      <v-card
        class="rounded-xl pa-0 pt-0"
        flat
        max-height="400"
        min-height="200"
      >
        <v-form ref="deleteForm" v-model="validDeletion" lazy-validation>
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
                Void Invoice</span
              >
            </v-card-title>
            <v-spacer />
            <v-btn
              @click="closeInvoiceDeleteDialog"
              outlined
              icon
              color="red accent-4"
              class="tw-mr-3"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="tw-px-6 tw-py-8">
            <v-row>
              <v-col cols="12">
                <CustomInputContainer :mandatory="true" label="Enter Reason">
                  <div slot="input">
                    <v-textarea
                      v-model="confirmDeletion.reason"
                      :rules="main_rule"
                      dense
                      outlined
                      required
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <!-- <div class="d-flex align-center justify-end"> -->
            <v-btn
              flat
              text
              :disabled="invoice_delete_loading"
              @click="closeInvoiceDeleteDialog"
              large
              ><span class="">Cancel</span></v-btn
            >

            <v-btn
              color="red"
              outlined
              large
              :disabled="
                invoice_delete_loading || confirmDeletion.reason.length == 0
              "
              :loading="invoice_delete_loading"
              @click="handleInvoiceDel"
              >Void Invoice</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="openReports" max-width="650px" persistent>
      <v-card
        class="rounded-xl pa-0 pt-0 dialog_custom"
        flat
        min-height="500"
        max-height="80vh"
      >
        <v-form ref="form" v-model="valid" lazy-validation>
          <div
            class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3"
          >
            <div class="tw-flex tw-items-center tw-gap-3">
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
                Export Reports</span
              >
            </div>

            <v-btn
              @click="openReports = false"
              outlined
              icon
              color="red accent-4"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-divider></v-divider>
          <div
            class="tw-p-3"
            style="overflow-y: auto; max-height: calc(80vh - 120px)"
          >
            <!-- Main Container with subtle background pattern -->
            <v-container class="ma-0 pa-0" fluid>
              <v-tabs v-model="reportsTabs" color="deep-purple accent-4" left>
                <v-tab caps :href="'#reports'">General Reports</v-tab>
                <v-tab caps :href="'#statements'">Company Statements</v-tab>
                <v-tab caps :href="'#bulk-uploads'">Bulk Uploads</v-tab>
              </v-tabs>
              <v-tabs-items v-model="reportsTabs">
                <v-tab-item :value="'reports'">
                  <div class="tw-mx-auto tw-px-4 tw-py-6 sm:tw-px-6 lg:tw-px-8">
                    <div class="">
                      <!-- Left Column - Statement Export -->
                      <!-- Right Column - Other Reports -->
                      <div class="">
                        <!-- ✅ ENHANCED: Currency Display Options with Tabs -->
                        <div class="tw-mb-6 tw-p-5 tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-shadow-sm">
                          <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
                            <div class="tw-flex tw-items-center">
                              <v-icon color="primary" size="20" class="tw-mr-2">mdi-currency-usd-circle-outline</v-icon>
                              <h4 class="tw-text-base tw-font-medium tw-text-gray-800">
                                Currency Display Options
                              </h4>
                            </div>
                            <v-tooltip bottom>
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                  v-bind="attrs"
                                  v-on="on"
                                  color="grey lighten-1"
                                  size="16"
                                >
                                  mdi-information-outline
                                </v-icon>
                              </template>
                              <span>Choose how currencies appear in exported reports</span>
                            </v-tooltip>
                          </div>

                          <p class="tw-text-sm tw-text-gray-600 tw-mb-4">
                            Choose how currencies are displayed in your exported reports
                          </p>

                          <!-- Currency Display Tabs -->
                          <v-tabs v-model="currencyDisplayOption" color="primary" class="tw-mb-1" height="36" background-color="grey lighten-4" slider-size="2">
                            <v-tab value="original" class="currency-tab tw-text-sm" ripple>
                              <div class="tw-flex tw-items-center">
                                <span class="tw-font-medium tw-mr-2">Original Currency</span>
                                <div class="tw-flex tw-items-center tw-space-x-1">
                                  <span class="tw-bg-orange-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">USD</span>
                                  <span class="tw-bg-orange-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">EUR</span>
                                  <span class="tw-bg-orange-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">AED</span>
                                </div>
                              </div>
                            </v-tab>

                            <v-tab value="aed" class="currency-tab tw-text-sm" ripple>
                              <div class="tw-flex tw-items-center">
                                <span class="tw-font-medium tw-mr-2">AED Standardized</span>
                                <span class="tw-bg-blue-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">AED</span>
                              </div>
                            </v-tab>

                            <v-tab value="both" class="currency-tab tw-text-sm" ripple>
                              <div class="tw-flex tw-items-center">
                                <span class="tw-font-medium tw-mr-2">Both Currencies</span>
                                <div class="tw-flex tw-items-center">
                                  <span class="tw-bg-green-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs tw-mr-1">Original</span>
                                  <span class="tw-bg-gray-400 tw-text-white tw-rounded tw-px-1 tw-text-xs tw-mx-1">+</span>
                                  <span class="tw-bg-green-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">AED</span>
                                </div>
                              </div>
                            </v-tab>
                          </v-tabs>

                          <!-- Tab Content -->
                          <v-tabs-items v-model="currencyDisplayOption" class="tw-mt-4">
                            <!-- Original Currency Tab -->
                            <v-tab-item value="original">
                              <div class="tw-p-4 tw-bg-orange-50 tw-rounded-lg tw-border tw-border-orange-100">
                                <div class="tw-flex tw-items-start tw-mb-2">
                                  <v-icon color="orange darken-2" size="20" class="tw-mr-2 tw-mt-0.5">mdi-currency-usd</v-icon>
                                  <div>
                                    <span class="tw-font-medium tw-text-orange-800">Original Currency</span>
                                    <p class="tw-text-sm tw-text-orange-700 tw-mt-1">
                                      Reports will display amounts in their original currencies (USD, EUR, AED)
                                    </p>
                                  </div>
                                </div>
                                <div class="tw-flex tw-items-center tw-mt-3 tw-border-t tw-border-orange-200 tw-pt-2">
                                  <span class="tw-text-xs tw-font-medium tw-text-orange-700 tw-mr-2">Supported currencies:</span>
                                  <span class="tw-bg-orange-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs tw-mr-1">USD</span>
                                  <span class="tw-bg-orange-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs tw-mr-1">EUR</span>
                                  <span class="tw-bg-orange-500 tw-text-white tw-rounded tw-px-2 tw-py-0.5 tw-text-xs">AED</span>
                                </div>
                              </div>
                            </v-tab-item>

                            <!-- AED Standardized Tab -->
                            <v-tab-item value="aed">
                              <div class="tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-100">
                                <div class="tw-flex tw-items-start tw-mb-2">
                                  <v-icon color="blue darken-2" size="20" class="tw-mr-2 tw-mt-0.5">mdi-currency-usd</v-icon>
                                  <div>
                                    <span class="tw-font-medium tw-text-blue-800">AED Standardized</span>
                                    <p class="tw-text-sm tw-text-blue-700 tw-mt-1">
                                      Reports will display all amounts converted to AED currency, regardless of original currency
                                    </p>
                                  </div>
                                </div>
                                <div class="tw-flex tw-items-center tw-mt-3 tw-border-t tw-border-blue-200 tw-pt-2">
                                  <span class="tw-text-xs tw-font-medium tw-text-blue-700 tw-mr-2">Currency conversion:</span>
                                  <div class="tw-flex tw-items-center tw-bg-blue-100 tw-rounded tw-px-2 tw-py-1">
                                    <span class="tw-bg-blue-200 tw-text-blue-800 tw-rounded tw-px-1 tw-py-0.5 tw-text-xs">USD</span>
                                    <v-icon color="blue" size="16" class="tw-mx-1">mdi-arrow-right</v-icon>
                                    <span class="tw-bg-blue-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">AED</span>
                                  </div>
                                  <div class="tw-flex tw-items-center tw-bg-blue-100 tw-rounded tw-px-2 tw-py-1 tw-ml-2">
                                    <span class="tw-bg-blue-200 tw-text-blue-800 tw-rounded tw-px-1 tw-py-0.5 tw-text-xs">EUR</span>
                                    <v-icon color="blue" size="16" class="tw-mx-1">mdi-arrow-right</v-icon>
                                    <span class="tw-bg-blue-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">AED</span>
                                  </div>
                                </div>
                              </div>
                            </v-tab-item>

                            <!-- Both Currencies Tab -->
                            <v-tab-item value="both">
                              <div class="tw-p-4 tw-bg-green-50 tw-rounded-lg tw-border tw-border-green-100">
                                <div class="tw-flex tw-items-start tw-mb-2">
                                  <v-icon color="green darken-2" size="20" class="tw-mr-2 tw-mt-0.5">mdi-currency-usd</v-icon>
                                  <div>
                                    <span class="tw-font-medium tw-text-green-800">Both Currencies</span>
                                    <p class="tw-text-sm tw-text-green-700 tw-mt-1">
                                      Reports will display amounts in both the original currency (USD, EUR) and AED equivalent
                                    </p>
                                  </div>
                                </div>
                                <div class="tw-flex tw-items-center tw-mt-3 tw-border-t tw-border-green-200 tw-pt-2">
                                  <span class="tw-text-xs tw-font-medium tw-text-green-700 tw-mr-2">Display format:</span>
                                  <div class="tw-flex tw-items-center tw-bg-green-100 tw-rounded tw-px-2 tw-py-1 tw-mr-2">
                                    <span class="tw-bg-green-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">USD</span>
                                    <span class="tw-text-green-700 tw-mx-1">/</span>
                                    <span class="tw-bg-green-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">AED</span>
                                  </div>
                                  <div class="tw-flex tw-items-center tw-bg-green-100 tw-rounded tw-px-2 tw-py-1">
                                    <span class="tw-bg-green-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">EUR</span>
                                    <span class="tw-text-green-700 tw-mx-1">/</span>
                                    <span class="tw-bg-green-500 tw-text-white tw-rounded tw-px-1.5 tw-py-0.5 tw-text-xs">AED</span>
                                  </div>
                                </div>
                              </div>
                            </v-tab-item>
                          </v-tabs-items>

                          <!-- Custom styling for currency tabs -->
                          <style scoped>
                          .currency-tab {
                            min-width: 140px;
                            font-weight: 500;
                            text-transform: none;
                            letter-spacing: normal;
                          }

                          /* Style for the active tab */
                          .v-tab--active {
                            font-weight: 600;
                          }

                          /* Add subtle transition effects */
                          .v-tabs-items .v-tab-item {
                            transition: all 0.3s ease;
                          }
                          </style>
                        </div>

                        <div class="tw-space-y-6">
                          <!-- Ageing Detailed Report -->
                          <v-card flat>
                            <v-card-text class="tw-p-6">
                              <div
                                class="tw-flex tw-justify-between tw-items-start"
                              >
                                <div class="tw-flex tw-items-start tw-gap-4">
                                  <div
                                    class="tw-bg-primary tw-bg-opacity-10 tw-p-3 tw-rounded-xl"
                                  >
                                    <v-icon color="primary" size="24"
                                      >mdi-file-document-outline</v-icon
                                    >
                                  </div>
                                  <div>
                                    <h3
                                      class="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-1"
                                    >
                                      Ageing Detailed Report
                                    </h3>
                                    <p class="tw-text-sm tw-text-gray-600">
                                      Provides a detailed line-by-line breakdown
                                      of all overdue invoices showing customer
                                      details, invoice numbers, days overdue,
                                      and exact amounts. Perfect for tracking
                                      individual invoice aging and follow-up
                                      actions.
                                    </p>
                                  </div>
                                </div>
                                <v-checkbox
                                  v-model="selectedReports"
                                  value="ageing-detailed"
                                  :loading="loadingReports.ageingDetailed"
                                  color="primary"
                                  hide-details
                                  class="tw-mt-0"
                                ></v-checkbox>
                              </div>
                            </v-card-text>
                          </v-card>

                          <!-- Ageing Summary Report -->
                          <v-card flat>
                            <v-card-text class="tw-p-6">
                              <div
                                class="tw-flex tw-justify-between tw-items-start"
                              >
                                <div class="tw-flex tw-items-start tw-gap-4">
                                  <div
                                    class="tw-bg-primary tw-bg-opacity-10 tw-p-3 tw-rounded-xl"
                                  >
                                    <v-icon color="primary" size="24"
                                      >mdi-chart-box-outline</v-icon
                                    >
                                  </div>
                                  <div>
                                    <h3
                                      class="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-1"
                                    >
                                      Ageing Summary Report
                                    </h3>
                                    <p class="tw-text-sm tw-text-gray-600">
                                      Presents a consolidated summary of
                                      outstanding invoices grouped by aging
                                      periods (Current, 1-30 days, 31-60 days,
                                      61-90 days, 90+ days). Ideal for executive
                                      reporting and understanding overall aging
                                      patterns.
                                    </p>
                                  </div>
                                </div>
                                <v-checkbox
                                  v-model="selectedReports"
                                  value="ageing-summary"
                                  :loading="loadingReports.ageingSummary"
                                  color="primary"
                                  hide-details
                                  class="tw-mt-0"
                                ></v-checkbox>
                              </div>
                            </v-card-text>
                          </v-card>

                          <!-- PEO Detailed Report -->
                          <v-card flat>
                            <v-card-text class="tw-p-6">
                              <div
                                class="tw-flex tw-justify-between tw-items-start"
                              >
                                <div class="tw-flex tw-items-start tw-gap-4">
                                  <div
                                    class="tw-bg-primary tw-bg-opacity-10 tw-p-3 tw-rounded-xl"
                                  >
                                    <v-icon color="primary" size="24"
                                      >mdi-file-chart-outline</v-icon
                                    >
                                  </div>
                                  <div class="tw-flex-1">
                                    <h3
                                      class="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-1"
                                    >
                                      PEO Detailed Report
                                    </h3>
                                    <p class="tw-text-sm tw-text-gray-600 tw-mb-4">
                                      Comprehensive employee-level breakdown of monthly invoices with individual salaries, service fees, and company charges.
                                    </p>

                                    <!-- Date Range Section for PEO Report -->
                                    <div v-if="selectedReports.includes('peo-detailed')" class="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-border">
                                      <h4 class="tw-text-sm tw-font-medium tw-text-gray-800 tw-mb-3">Filter by Invoice Date Range</h4>
                                      <v-row dense>
                                        <v-col cols="6">
                                          <CustomInputContainer label="From Date" class="tw-mb-0">
                                            <div slot="input">
                                              <v-menu
                                                v-model="peoReportDateMenu.start"
                                                :close-on-content-click="false"
                                                transition="scale-transition"
                                                offset-y
                                                min-width="auto"
                                              >
                                                <template v-slot:activator="{ on, attrs }">
                                                  <v-text-field
                                                    v-model="peoReportDates.startDate"
                                                    placeholder="Select start date"
                                                    outlined
                                                    dense
                                                    readonly
                                                    hide-details
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    class="tw-bg-white"
                                                  >
                                                    <template v-slot:append>
                                                      <v-icon small>mdi-calendar</v-icon>
                                                    </template>
                                                  </v-text-field>
                                                </template>
                                                <v-date-picker
                                                  v-model="peoReportDates.startDate"
                                                  @input="peoReportDateMenu.start = false"
                                                  color="primary"
                                                />
                                              </v-menu>
                                            </div>
                                          </CustomInputContainer>
                                        </v-col>
                                        <v-col cols="6">
                                          <CustomInputContainer label="To Date" class="tw-mb-0">
                                            <div slot="input">
                                              <v-menu
                                                v-model="peoReportDateMenu.end"
                                                :close-on-content-click="false"
                                                transition="scale-transition"
                                                offset-y
                                                min-width="auto"
                                              >
                                                <template v-slot:activator="{ on, attrs }">
                                                  <v-text-field
                                                    v-model="peoReportDates.endDate"
                                                    placeholder="Select end date"
                                                    outlined
                                                    dense
                                                    readonly
                                                    hide-details
                                                    v-bind="attrs"
                                                    v-on="on"
                                                    class="tw-bg-white"
                                                  >
                                                    <template v-slot:append>
                                                      <v-icon small>mdi-calendar</v-icon>
                                                    </template>
                                                  </v-text-field>
                                                </template>
                                                <v-date-picker
                                                  v-model="peoReportDates.endDate"
                                                  @input="peoReportDateMenu.end = false"
                                                  color="primary"
                                                />
                                              </v-menu>
                                            </div>
                                          </CustomInputContainer>
                                        </v-col>
                                      </v-row>
                                      <div class="tw-mt-2 tw-flex tw-items-center tw-justify-between">
                                        <small class="tw-text-gray-600">
                                          Leave empty to include all invoices
                                        </small>
                                        <v-btn
                                          v-if="peoReportDates.startDate || peoReportDates.endDate"
                                          x-small
                                          text
                                          color="primary"
                                          @click="clearPeoReportDates"
                                        >
                                          Clear Dates
                                        </v-btn>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <v-checkbox
                                  v-model="selectedReports"
                                  value="peo-detailed"
                                  :loading="loadingReports.peoDetailed"
                                  color="primary"
                                  hide-details
                                  class="tw-mt-0"
                                ></v-checkbox>
                              </div>
                            </v-card-text>
                          </v-card>
                        </div>
                      </div>
                    </div>

                    <!-- Export Actions -->
                    <div class="tw-flex tw-justify-end tw-mt-8 tw-gap-4">
                      <v-btn
                        text
                        @click="selectedReports = []"
                        :disabled="!selectedReports.length"
                      >
                        Clear Selection
                      </v-btn>
                      <v-btn
                        color="primary"
                        :disabled="!selectedReports.length || exportingAll"
                        :loading="exportingAll"
                        outlined
                        @click="exportSelected"
                      >
                        <v-icon left>mdi-download</v-icon>
                        Download
                      </v-btn>
                    </div>
                  </div>
                </v-tab-item>
                <v-tab-item :value="'statements'">
                  <div class="mb-2">
                    <v-card flat>
                      <v-card-text class="tw-p-6">
                        <!-- Card Header -->
                        <div
                          class="tw-flex tw-justify-between tw-items-start tw-mb-6"
                        >
                          <div class="tw-flex tw-items-start tw-gap-4">
                            <div
                              class="tw-bg-primary tw-bg-opacity-10 tw-p-3 tw-rounded-xl"
                            >
                              <v-icon color="primary" size="28"
                                >mdi-file-document-multiple-outline</v-icon
                              >
                            </div>
                            <div>
                              <h3
                                class="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-1"
                              >
                                Statement Export
                              </h3>
                              <p class="tw-text-sm tw-text-gray-600">
                                Generate detailed statements for one or multiple
                                companies, or export all companies at once
                              </p>
                            </div>
                          </div>
                          <v-chip
                            v-if="statementExport.previewUrl"
                            color="primary"
                            outlined
                            class="tw-cursor-pointer hover:tw-bg-primary hover:tw-text-white tw-transition-colors"
                            @click="openPreviewInNewTab"
                          >
                            <v-icon left small>mdi-open-in-new</v-icon>
                            Open Preview
                          </v-chip>
                        </div>

                        <!-- Company Selection -->

                        <v-row>
                          <v-col cols="12">
                            <CustomInputContainer
                              :mandatory="false"
                              label="Select Companies"
                            >
                              <div slot="input">
                                <v-select
                                  :items="employersWithAllOption"
                                  placeholder="Select companies (leave empty for all)"
                                  solo
                                  dense
                                  multiple
                                  chips
                                  deletable-chips
                                  v-model="statementExport.selectedCompanies"
                                  item-text="company_name"
                                  item-value="_id"
                                  class="proposalDialog_date_field2"
                                  append-icon="fa-chevron-down"
                                  :hint="getCompanySelectionHint"
                                  persistent-hint
                                >
                                  <template v-slot:selection="{ item, index }">
                                    <v-chip
                                      v-if="index < 2"
                                      close
                                      small
                                      @click:close="removeCompany(item._id)"
                                    >
                                      {{ item.company_name }}
                                    </v-chip>
                                    <span
                                      v-if="index === 2"
                                      class="grey--text caption"
                                    >
                                      (+{{
                                        statementExport.selectedCompanies
                                          .length - 2
                                      }}
                                      others)
                                    </span>
                                  </template>
                                </v-select>
                              </div>
                            </CustomInputContainer>
                          </v-col>
                        </v-row>
                        <!-- Date Range Selection -->
                        <v-row>
                          <v-col cols="6">
                            <CustomInputContainer
                              :mandatory="true"
                              label="Start Date"
                            >
                              <div slot="input">
                                <v-menu
                                  v-model="statementDateMenu.start"
                                  :close-on-content-click="false"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="auto"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                      v-model="statementExport.startDate"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"
                                      outlined
                                      dense
                                      hide-details
                                      background-color="white"
                                      class="custom-date-field"
                                    >
                                      <template v-slot:prepend-inner>
                                        <v-icon small color="primary"
                                          >mdi-calendar-start</v-icon
                                        >
                                      </template>
                                      <template v-slot:append>
                                        <v-icon>mdi-calendar</v-icon>
                                      </template>
                                    </v-text-field>
                                  </template>
                                  <v-date-picker
                                    v-model="statementExport.startDate"
                                    @input="statementDateMenu.start = false"
                                    color="primary"
                                  />
                                </v-menu>
                              </div>
                            </CustomInputContainer>
                          </v-col>

                          <v-col cols="6">
                            <CustomInputContainer
                              :mandatory="true"
                              label="End Date"
                            >
                              <div slot="input">
                                <v-menu
                                  v-model="statementDateMenu.end"
                                  :close-on-content-click="false"
                                  transition="scale-transition"
                                  offset-y
                                  min-width="auto"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                      v-model="statementExport.endDate"
                                      readonly
                                      v-bind="attrs"
                                      v-on="on"
                                      outlined
                                      dense
                                      hide-details
                                      background-color="white"
                                      class="custom-date-field"
                                    >
                                      <template v-slot:prepend-inner>
                                        <v-icon small color="primary"
                                          >mdi-calendar-end</v-icon
                                        >
                                      </template>
                                      <template v-slot:append>
                                        <v-icon>mdi-calendar</v-icon>
                                      </template>
                                    </v-text-field>
                                  </template>
                                  <v-date-picker
                                    v-model="statementExport.endDate"
                                    @input="statementDateMenu.end = false"
                                    color="primary"
                                  />
                                </v-menu>
                              </div>
                            </CustomInputContainer>
                          </v-col>
                        </v-row>

                        <!-- Action Button -->
                        <div class="tw-flex tw-justify-end">
                          <v-btn
                            color="primary"
                            outlined
                            large
                            :loading="statementExport.isGenerating"
                            :disabled="
                              !canGenerateStatement ||
                              statementExport.isGenerating
                            "
                            @click="generateStatement"
                          >
                            <v-icon left>mdi-download</v-icon>
                            Export
                          </v-btn>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-tab-item>

                <!-- Bulk Uploads Tab -->
                <v-tab-item value="bulk-uploads">
                  <div class="tw-p-6">
                    <div class="tw-text-center tw-mb-6">
                      <v-icon size="64" color="primary" class="tw-mb-4">mdi-upload-multiple</v-icon>
                      <h3 class="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Bulk Upload Invoices</h3>
                      <p class="tw-text-gray-600">Upload multiple invoices at once using an Excel file</p>

                      <!-- Error Display -->
                      <div v-if="bulkUploadErrors.length"
                           class="tw-bg-red-50 tw-border tw-border-red-400 tw-text-red-800 tw-p-4 tw-rounded tw-mb-4 tw-animate-fade-in"
                           style="transition: opacity 0.5s;">
                        <strong>Some rows could not be processed:</strong>
                        <ul class="tw-list-disc tw-ml-6">
                          <li v-for="(err, idx) in bulkUploadErrors" :key="idx">
                            Row {{ err.row }}: <span class="tw-font-semibold">{{ err.error }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Download Template Section -->
                    <div class="tw-bg-blue-50 tw-rounded-lg tw-p-4 tw-mb-6">
                      <div class="tw-flex tw-items-center tw-justify-between">
                        <div>
                          <h4 class="tw-font-semibold tw-text-blue-900 tw-mb-1">Download Template</h4>
                          <p class="tw-text-blue-700 tw-text-sm">Get the Excel template with the correct format for bulk upload</p>
                        </div>
                        <v-btn
                          color="primary"
                          outlined
                          @click="downloadInvoiceTemplate"
                          :loading="downloadingTemplate"
                          class="tw-rounded-lg"
                        >
                          <v-icon left>mdi-download</v-icon>
                          Download Template
                        </v-btn>
                      </div>
                    </div>

                    <!-- Upload Section -->
                    <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6 tw-border-2 tw-border-dashed tw-border-gray-300">
                      <div class="tw-text-center">
                        <v-icon size="48" color="gray" class="tw-mb-4">mdi-file-excel</v-icon>
                        <h4 class="tw-font-semibold tw-text-gray-900 tw-mb-2">Upload Excel File</h4>
                        <p class="tw-text-gray-600 tw-mb-4">Drag and drop your Excel file here or click to browse</p>

                        <v-file-input
                          v-model="bulkUploadFile"
                          accept=".xlsx,.xls"
                          label="Choose Excel file"
                          prepend-icon="mdi-file-excel"
                          outlined
                          class="tw-max-w-md tw-mx-auto"
                          :rules="[v => !!v || 'Please select an Excel file']"
                          @change="handleBulkFileChange"
                        ></v-file-input>

                        <div v-if="bulkUploadFile" class="tw-mt-4">
                          <v-btn
                            color="primary"
                            :loading="uploadingBulk"
                            :disabled="uploadingBulk"
                            @click="uploadBulkInvoices"
                            class="tw-rounded-lg"
                          >
                            <v-icon left>mdi-upload</v-icon>
                            Upload Invoices
                          </v-btn>
                        </div>
                      </div>
                    </div>

                    <!-- Instructions -->
                    <div class="tw-mt-6 tw-bg-yellow-50 tw-rounded-lg tw-p-4">
                      <h4 class="tw-font-semibold tw-text-yellow-900 tw-mb-2 tw-flex tw-items-center">
                        <v-icon small class="tw-mr-2">mdi-information</v-icon>
                        Instructions
                      </h4>
                      <ul class="tw-text-yellow-800 tw-text-sm tw-space-y-1">
                        <li>• Download the template first to ensure correct format</li>
                        <li>• Fill in all required fields marked with asterisk (*)</li>
                        <li>• Save the file as .xlsx or .xls format</li>
                        <li>• Maximum file size: 5MB</li>
                        <li>• Maximum 1000 invoices per upload</li>
                        <li>• Tax Code selection will auto-populate VAT Rate</li>
                        <li>• All calculated fields (Amount, VAT Amount, Net Total) are auto-calculated</li>
                      </ul>
                    </div>
                  </div>
                </v-tab-item>
              </v-tabs-items>
            </v-container>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmResendEmail" max-width="400px" persistent>
      <v-card class="rounded-xl pa-0 pt-0">
        <v-card-title class="py-3">
          <span class="headline">Confirm Email Resend</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="cancelResendEmail">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-5">
          <p>
            This invoice has already been sent an email. Are you sure you want
            to send another email?
          </p>
        </v-card-text>

        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn text @click="cancelResendEmail"> Cancel </v-btn>
          <v-btn color="primary" @click="proceedWithEmailSend">
            Send Anyway
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SnackBar :data="snackbar_data" />

    <!--Send Email-->
    <!-- <v-dialog v-model="openEmailDialog" max-width="600px">
      <v-card class="pa-3" style="overflow-x: hidden">
        <v-card-title>{{ customEmailHeading }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-3">
          <p class="mb-3 font-weight-bold">
            <v-icon color="pink" class="mt-n1" size="20"
              >fa-sharp fa-regular fa-envelope
            </v-icon>
            &nbsp;{{ selectedItem.email }}
          </p>
          <p class="mb-1 caption primary--text">Cc</p>
          <v-text-field
            outlined
            dense
            v-model="cc"
            placeholder="Enter Email Body"
          ></v-text-field>
          <p class="mb-1 caption primary--text">Subject</p>
          <v-text-field
            outlined
            dense
            v-model="subject"
            placeholder="Enter Email Body"
          ></v-text-field>
          <p class="mb-1 caption primary--text">Email Body</p>
          <v-textarea
            auto-grow
            rows="4"
            outlined
            dense
            v-model="body"
            placeholder="Enter Email Body"
          ></v-textarea>
        </v-card-text>
        <v-alert
          border="right"
          colored-border
          type="error"
          elevation="2"
          v-if="selectedItem.email == ''"
        >
          Email ID not found. Please update the user email ID to use this
          functionality.
        </v-alert>
        <p class="text-right">
          <v-btn
            text
            @click="sendEmail()"
            class="green--text text--darken-3"
            dark
            :disabled="selectedItem.email == ''"
            >Send Email
          </v-btn>
        </p>
      </v-card>
    </v-dialog> -->

    <v-dialog
      v-model="editDocument"
      persistent
      width="20vw"
      height="100vh"
      content-class="proposal_dialog"
    >
      <EditBillingsMode
        v-if="editDocument"
        :selectedBilling="selectedItem"
        :handleModel="handleEditBillings"
        @close="updateBillingsData()"
        @update-success="handleUpdateSuccess"
      />
    </v-dialog>

    <v-dialog
      v-model="creditNoteEditor"
      persistent
      width="100vw"
      content-class="proposal_dialog"
    >
      <div class="dialog_proposal" style="overflow-x: hidden">
        <CreditNote
          :key="selectedItem?._id"
          @close="handleClose"
          :selectedBilling="selectedItem"
        />
      </div>
    </v-dialog>

    <v-dialog
      v-model="previewCreditNotes"
      persistent
      width="50vw"
      content-class="proposal_dialog"
    >
      <div class="dialog_proposal" style="overflow-x: hidden">
        <v-card flat>
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            <h4 class="text--text">Credit Notes</h4>
            <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext">
              <span class="" @click="previewCreditNotes = false">Close</span>
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-4">
            <template v-if="loading">
              <v-skeleton-loader
                v-for="i in 3"
                :key="i"
                type="table-row"
                class="mb-2"
              ></v-skeleton-loader>
            </template>

            <template v-else>
              <p class="pb-4">Click on a credit note to preview</p>
              <v-simple-table class="credit-note-table tw-whitespace-nowrap">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Credit Note Number</th>
                      <th>Entity</th>
                      <th class="text-right">Sub Total</th>
                      <th class="text-right">VAT Total</th>
                      <th class="text-right">Total</th>
                      <th class="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="creditNotesData.length">
                      <tr
                        v-for="note in creditNotesData"
                        :key="note.credit_note_number"
                        @click="selectCreditNote(note.id)"
                      >
                        <td>
                          <v-chip
                            small
                            label
                            color="primary"
                            class="font-weight-medium"
                          >
                            {{ note.credit_note_number }}
                          </v-chip>
                        </td>
                        <td>
                          <span v-if="note.visa_sponsor === 'Dynamic Employment Services'" class="tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            DES
                          </span>
                          <span v-else-if="note.visa_sponsor === 'Executive Employment Services'" class="tw-px-2 tw-py-1 tw-bg-green-100 tw-text-green-800 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            EES
                          </span>
                          <span v-else class="tw-px-2 tw-py-1 tw-bg-gray-100 tw-text-gray-600 tw-text-xs tw-rounded tw-font-medium tw-whitespace-nowrap">
                            {{ note.visa_sponsor || 'N/A' }}
                          </span>
                        </td>
                        <td class="text-right">
                          {{ formatCurrency(note.sub_total) }}
                        </td>
                        <td class="text-right">
                          {{ formatCurrency(note.vat_total) }}
                        </td>
                        <td class="text-right font-weight-bold">
                          {{ formatCurrency(note.total) }}
                        </td>
                        <td class="text-right">
                          <v-chip
                            small
                            label
                            :color="getCreditStatusColor(note)"
                          >
                            {{ getCreditStatus(note) }}
                          </v-chip>
                        </td>
                      </tr>
                    </template>
                    <template v-else>
                      <tr>
                        <td colspan="6" class="text-center py-6">
                          <div class="d-flex flex-column align-center">
                            <v-icon
                              size="40"
                              color="grey lighten-1"
                              class="mb-2"
                            >
                              mdi-file-document-outline
                            </v-icon>
                            <span class="text-subtitle-1 grey--text"
                              >No credit notes available</span
                            >
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </template>
              </v-simple-table>
              <h5 class="text--text pl-2 pt-4">Preview</h5>
              <CreditNotePreview
                v-if="this.selectedCreditNoteID"
                :credit_id="this.selectedCreditNoteID"
              />
            </template>
          </v-card-text>
        </v-card>
      </div>
    </v-dialog>

    <RecordPayment
      v-if="recordPayment"
      :open="recordPayment"
      :key="`${InvoiceDetails?._id}-${recordPayment.toString()}`"
      :invoice_id="InvoiceDetails?._id"
      @successfull="actionSuccess"
      @close="closeDialogs"
    />

    <BillingsEmailModal
      v-if="sendRawEmailDialog"
      :emailBody="emailBody"
      @close="closeDialogs"
      :automateCurrentAction="false"
      :attachments="emailAttachments"
      :invoices="
        selectedInvoices && selectedInvoices.length > 0
          ? selectedInvoices
          : [InvoiceDetails]
      "
      @successfull="actionSuccessEmail"
      :module="'billings'"
    />

    <EditBillingsMode
      v-if="showEditModel"
      :selectedBilling="selectedItem"
      :handleModel="handleEditBillings"
      @close="updateBillingsData()"
    />

    <NewGeneralInvoiceDialog
      v-if="newGeneralInvoice"
      :show="newGeneralInvoice"
      :key="invoiceKey"
      @reload="handleReload"
      :invoiceToEdit="selectedItem"
      @close="closeDialogs"
      @success="handleReload"
    />
    <CustomCreditNoteDialog
      v-if="newCustomCreditNote"
      :show="newCustomCreditNote"
      :creditNoteToEdit="selectedCustomCreditNote"
      :key="creditNoteKey"
      @close="closeDialogs"
    />
  </div>
</template>

<script>
import '@/assets/scss/utils/_invoiceTable.scss'
import SnackBar from '~/components/utils/SnackBar.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import BillingsDialog from '@/components/Dialogs/billingsDialog.vue'
import NewGeneralInvoiceDialog from '@/components/Dialogs/generalInvoiceDialog.vue'
import CustomCreditNoteDialog from '@/components/Dialogs/customCreditNoteDialog.vue'
import BillingsPaymentDialog from '@/components/Dialogs/billingsPaymentDialog.vue'
import EditBillingsMode from '@/components/EditModel/editBillings.vue'
import Observer from '~/components/Observer.vue'
import InvoicePreview from '../ProcessFlow/ActionPreview/InvoicePreview.vue'
import RecordPayment from '~/components/Dialogs/createInvoicePaymentRecord.vue'
import SendRawEmail from '../ProcessFlow/SendEmail/sendRawEmail.vue'
import BillingsEmailModal from './BillingsEmailModal.vue'
import CreditNote from './CreditNote.vue'
import CreditNotePreview from '~/components/Billings/CreditNotePreview.vue'
import BillingsCard from '~/components/Cards/BillingsCards/index.vue'
import InvoicePreviewPanel from '~/components/invoice/previewPanel.vue'
import BulkPayments from '~/components/Billings/bulkPayments.vue'
import CreditNoteDialog from '~/components/Dialogs/creditNoteDialog.vue'
import * as XLSX from 'xlsx-js-style'

export default {
  components: {
    CreditNotePreview,
    SnackBar,
    DarkArrow,
    LightArrow,
    filterIcon,
    CustomInputContainer,
    CalenderSvg,
    BillingsDialog,
    BillingsPaymentDialog,
    EditBillingsMode,
    Observer,
    InvoicePreview,
    RecordPayment,
    SendRawEmail,
    BillingsEmailModal,
    CreditNote,
    NewGeneralInvoiceDialog,
    CustomCreditNoteDialog,
    BillingsCard,
    InvoicePreviewPanel,
    BulkPayments,
    CreditNoteDialog,
  },
  props: [],

      data() {
    return {
      sendRawEmailDialog: false,
      bulkPaymentsDialog: false,
      creditNoteDialog: false,
      creditNoteViewMode: false,
      loadObserver: true,
      emailBody: {},
      recordPayment: false,
      loading: false,
      isRefreshing: false,
      exportMenu: false,
      selectedReports: [],
      exportingAll: false,
      newGeneralInvoice: false,
      newCustomCreditNote: false,
      selectedCustomCreditNote: null,
      creditNoteKey: 0,
      confirmResendEmail: false,
      pendingEmailItem: null,
      pendingEmailBulk: false,

      loadingReports: {
        ageingDetailed: false,
        ageingSummary: false,
        peoDetailed: false,
      },
      // ✅ ENHANCED: Currency display option
      currencyDisplayOption: 'both', // 'original', 'aed', 'both'
      // PEO Report specific date filtering
      peoReportDates: {
        startDate: null,
        endDate: null,
      },
      peoReportDateMenu: {
        start: false,
        end: false,
      },
      invoiceKey: 111,
      isSearchExpanded: false,
      invoicePreviewFlag: false,
      InvoiceDetails: {},
      confirmDeletion: {
        show: false,
        reason: '',
        item: null,
      },
      invoice_delete_loading: false,
      show_draft_invoices: false,
      selectedCreditNoteID: null,
      previewCreditNotes: false,
      menuOpen: false,
      creditNotesData: [],
      tempVisibility: {},
      selectAll: true,
      tempSelectAll: true,
      filter: {
        selectedEmployerStatus: '',
        selectedFilterStatus: [],
        selectedEmployers: [],
        selectedEmployees: [],
        status: [],
        limit: 10,
        totalResults: 0,
  void: undefined,
      },
      options: {
        sortBy: [],
        page: 1,
        limit: 50,
        itemsPerPage: 10,
      },
      first_load_fetch: true,
      dataLoading: false,
      recentlyViewedIds: [],
      maxRecentInvoices: 5,
      editDocument: false,
      validDeletion: false,
      creditNoteEditor: false,
      companyBillingStatuses: null,
      companyBillingTypes: null,
      privacyMood: false,
      billingsDialogs: false,
      billingsPaymentDialogs: false,
      clickedButton: '',
      date_menu: false,
      snackbar_data: {},
      exp_date: '',
      selectedInvoices: [],
      columnVisibility: {
        type: true,
        invoice_number: true,
        invoice_date: true,
        customer_name: true,
        memo: true,
        visa_sponsor: true,
        due_date: true,
        total: true,
        addition_deduction: true,
        is_sent: true,
        status: true,
  action: true, // align with header value 'action'
      },
      exp_date_menu: false,
      estimate_date: '',
      searchQuery: null,
      searchSelected: null,
      originalBillingList: [],
      buttons: [],
      filterDialog: false,
      new_menu: [
        { title: 'Custom Invoice', value: 'general_invoice', locked: false },
        { title: 'Custom Credit Note', value: 'custom_credit_note', locked: false },
        { title: 'Debit Note', value: 'debit_note', locked: false },
        { title: 'Bulk Payments', value: 'bulk_payments', locked: false },
        { title: 'Products/Services', value: 'products', locked: false },
      ],
      billings_documents_headers: [
        {
          text: 'Invoice No',
          value: 'invoice_number',
          sortable: false,
          align: 'start',
        },
        { text: 'Invoice Date', value: 'invoice_date', align: 'start' },
        { text: 'Category', value: 'type', align: 'start' },
        { text: 'Client', value: 'customer_name', align: 'start' },
        { text: 'Due On', value: 'due_date', align: 'start' },
        { text: 'Memo', value: 'memo', align: 'start' },
        { text: 'Entity', value: 'visa_sponsor', align: 'start' },
        {
          text: 'Amount',
          value: 'total',
          align: 'start',
        },
        {
          text: 'Settled Amount',
          value: 'settled_amount',
          align: 'start',
        },
        {
          text: 'Remaining Balance',
          value: 'remaining_balance',
          align: 'start',
        },
        {
          text: 'Email Status',
          value: 'is_sent',
          align: 'start',
          sortable: false,
        },
        { text: 'Status', value: 'status', align: 'start' },
        { text: 'Action', value: 'action', align: 'center', sortable: false },
      ],
      billingList: [],
      billingStatusList: [],
      selectedStatus: [],
      invoiceCreditNotes: [],
      employers: [],
      selectedInvoiceId: null,
      employees: [],
      main_rule: [(v) => !!v || 'This filed is required'],
      selectedItem: {},
      selectedCreditNote: null,
      showEditModel: false,
      openEmailDialog: false,
      customEmailHeading: 'Send Email to Respective Customer',
      cc: [],
      body: '',
      subject: '',
      to: [],
      limit: '10',
      page: 0,
      comPage: 0,
      process_id: '',
      currentidentifier: '',
      emailAttachments: [],
      activeTab: 'invoices',
      valid: false,
      // Statement Export Properties
      statementExport: {
        selectedCompanies: [], // Changed from selectedCompany to selectedCompanies array
        startDate: null,
        endDate: null,
        exportFormat: 'excel',
        isGenerating: false,
        previewUrl: null,
        showPreview: false,
        previewLoading: false,
        previewData: null,
        previewColumns: [],
        previewError: null,
      },
      companies: {
        list: [],
        loading: false,
        page: 1,
        limit: 10000, // Using same limit as getEmployersList
        total: 0,
        search: '',
        hasMore: true,
      },
      statementDateMenu: {
        start: false,
        end: false,
      },
      invoiceCount: [],
      activeStatusFilter: null,
      templateStatusMappings: {
        Due: 'Invoice Payment Due',
        Overdue: 'Invoice Payment Overdue',
        Paid: 'Invoice Paid',
      },
      openReports: false,
      reportsTabs: 'reports',
      // Bulk Upload Properties
      bulkUploadFile: null,
      uploadingBulk: false,
      downloadingTemplate: false,
      bulkUploadErrors: [],
      bulkUploadErrorTimeout: null,
      updating_filters: false,
      loading_email_send: false,
      emailSendProgress: '0/0',
      confirmResendEmail: false,

            // Debounce timers for search and filters
      searchDebounceTimer: null,
      clientFilterDebounceTimer: null,
      employeeFilterDebounceTimer: null,
      clientFilterChangeTimeout: null,
      filterInProgress: false,

      // Debounce delay in milliseconds
      debounceDelay: 500,
  // Internal request token to avoid stale overwrite
  currentFetchToken: 0,
    }
  },
  watch: {
    '$route.query': {
      handler: 'checkUrlParameters',
      immediate: true,
    },
    columnVisibility: {
      handler() {
        this.saveColumnSettings()
      },
      deep: true,
    },
                'filter.searchQuery': {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          // Clear any existing timer
          if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer)
          }

          // Set new timer for debounced search
          this.searchDebounceTimer = setTimeout(() => {
            this.handleFilterBillings()
            this.searchDebounceTimer = null
          }, this.debounceDelay)
        }
      },
    },
    'filter.selectedEmployers': {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          console.log('Client filter changed:', { oldVal, newVal })
          // Prevent multiple rapid filter changes
          if (this.clientFilterChangeTimeout) {
            clearTimeout(this.clientFilterChangeTimeout)
          }

          this.clientFilterChangeTimeout = setTimeout(() => {
            // Apply client filter immediately when selection changes
            this.handleFilterBillings()
            this.clientFilterChangeTimeout = null
          }, 100) // Small delay to prevent rapid changes
        }
      },
    },
    'filter.selectedEmployees': {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          // Apply employee filter immediately when selection changes
          this.handleFilterBillings()
        }
      },
    },

    'filter.estimate_date': {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.handleFilterBillings()
        }
      },
    },
    'filter.exp_date': {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.handleFilterBillings()
        }
      },
    },
    'filter.selectedFilterStatus': {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.handleFilterBillings()
        }
      },
      deep: true,
    },
    show_draft_invoices(val) {
      if (!this.first_load_fetch && !this.updating_filters) {
        this.handleFilterBillings()
      }
    },
    options: {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          // Only trigger filter if page or itemsPerPage actually changed
          const pageChanged = oldVal?.page !== newVal?.page
          const limitChanged = oldVal?.itemsPerPage !== newVal?.itemsPerPage

          if (pageChanged || limitChanged) {
            console.log('options changes: ', { pageChanged, limitChanged, oldVal, newVal })
            // For pagination changes, use getBillingList instead of handleFilterBillings
            if (pageChanged && !limitChanged) {
              this.getBillingList()
            } else {
              this.handleFilterBillings()
            }
          }
        }
      },
      deep: true,
    },
    invoicePreviewFlag(newValue) {
      if (newValue && this.InvoiceDetails) {
        this.addToRecentlyViewed(this.InvoiceDetails)
      }
    },
    billingsPaymentDialogs(newValue) {
      if (newValue && this.InvoiceDetails) {
        this.addToRecentlyViewed(this.InvoiceDetails)
      }
    },
    'statementExport.selectedCompanies': {
      handler() {
        if (this.statementExport.startDate && this.statementExport.endDate) {
          this.previewStatement()
        }
      },
    },
    'statementExport.startDate': {
      handler() {
        if (this.statementExport.endDate) {
          this.previewStatement()
        }
      },
    },
    'statementExport.endDate': {
      handler() {
        if (this.statementExport.startDate) {
          this.previewStatement()
        }
      },
    },
  },
    created() {
    this.checkUrlParameters()
    // this.loadColumnSettings()

    // Initialize debounced handlers
    this.debouncedSearch = this.debounce('handleFilterBillings', this.debounceDelay)
    this.debouncedClientFilter = this.debounce('handleFilterBillings', this.debounceDelay)
    this.debouncedEmployeeFilter = this.debounce('handleFilterBillings', this.debounceDelay)

    // Initialize column visibility (this was here originally)
    this.billings_documents_headers.forEach((header) => {
      if (this.columnVisibility[header.value] === undefined) {
        this.$set(this.columnVisibility, header.value, true)
      }
    })
    this.tempVisibility = { ...this.columnVisibility }
  },

  beforeDestroy() {
    // Clean up all debounce timers to prevent memory leaks
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
    if (this.clientFilterDebounceTimer) {
      clearTimeout(this.clientFilterDebounceTimer)
    }
    if (this.employeeFilterDebounceTimer) {
      clearTimeout(this.employeeFilterDebounceTimer)
    }
    if (this.clientFilterChangeTimeout) {
      clearTimeout(this.clientFilterChangeTimeout)
    }
  },

  mounted() {
    // Column visibility is now handled in created() hook
  },
  methods: {
    onItemSelected({ item, value }) {
      // If deselecting an invoice, we don't need to validate
      if (!value) return

      // Check if the invoice is a draft - don't allow selection
      if (item.is_draft) {
        // Prevent selection of draft invoices
        setTimeout(() => {
          const index = this.selectedInvoices.findIndex(
            (inv) => inv._id === item._id
          )
          if (index !== -1) {
            this.selectedInvoices.splice(index, 1)
          }

          this.snackbar_data = {
            snackbar: true,
            text: 'Draft invoices cannot be selected for email sending',
            color: 'error',
            timeout: 3000,
          }
        }, 0)
        return
      }

      // Check if we're adding an invoice from a different client
      if (this.selectedInvoices.length > 0) {
        const existingClient = this.selectedInvoices[0].customer

        if (item.customer !== existingClient) {
          // Prevent selection by removing this item from selectedInvoices
          setTimeout(() => {
            const index = this.selectedInvoices.findIndex(
              (inv) => inv._id === item._id
            )
            if (index !== -1) {
              this.selectedInvoices.splice(index, 1)
            }

            this.snackbar_data = {
              snackbar: true,
              text: 'You can only select invoices from the same client',
              color: 'error',
              timeout: 3000,
            }
          }, 0)
        }
      }

      // If this is the first selected invoice, allow it
      if (this.selectedInvoices.length === 0) return

      // Check if the newly selected invoice has the same client as already selected invoices
      const selectedClientId = this.selectedInvoices[0].customer

      if (item.customer !== selectedClientId) {
        // Prevent selection of invoices from different clients
        this.snackbar_data = {
          snackbar: true,
          text: 'You can only select invoices from the same client.',
          color: 'error',
          timeout: 3000,
        }

        // Remove the item that was just added (will happen on next tick)
        setTimeout(() => {
          this.selectedInvoices = this.selectedInvoices.filter(
            (invoice) => invoice._id !== item._id
          )
        }, 0)
      }
    },

    getClientInitials(item) {
      const name = !item.is_individual_invoice
        ? item.customer_name
        : `${item.items[0].user.first_name} ${item.items[0].user.last_name}`

      if (!name) return '?'

      const words = name.trim().split(' ')
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase()
      }
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
    },

    handleBulkEmailSend() {
      if (this.selectedInvoices.length === 0) return

      // Check if any selected invoice has already been sent an email
      const alreadySentInvoices = this.selectedInvoices.filter((invoice) =>
        this.isInvoiceSent(invoice)
      )

      if (alreadySentInvoices.length > 0) {
        // Show confirmation dialog
        this.pendingEmailBulk = true
        this.confirmResendEmail = true
        return
      }

      // If no already sent invoices, proceed with email send
      this.proceedWithBulkEmailSend()
    },

    async proceedWithBulkEmailSend() {
      try {
        this.loading_email_send = true
        this.snackbar_data = {
          snackbar: true,
          text: 'Preparing email...',
          color: 'info',
          icon: 'spinner fa-spin',
          timeout: -1,
        }

        // Clear any previous data
        this.emailAttachments = []
        this.emailBody = {}

        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Get email template and process emails
        const _emailTemplates = await this.$axios.$get(
          `/email_template/get/all`,
          {
            headers: { Authorization: AuthStr },
          }
        )

        // Use the first selected invoice as a template for the email
        const firstInvoice = this.selectedInvoices[0]
        const templateName =
          this.templateStatusMappings[firstInvoice.status] ||
          'Invoice Payment Due'

        // Create replacements
        const replacements = {
          '<p>Dear\\s(.*?)</p>': `<p>Dear ${firstInvoice.customer_name}</p>`,
        }

        // Gather all selected invoice numbers
        const invoiceNumbers = this.selectedInvoices.map(inv => inv.invoice_number)

        // Get the email template
        await this.fetchAndCustomizeEmailTemplate(
          firstInvoice,
          templateName,
          replacements,
          _emailTemplates,
          AuthStr,
          invoiceNumbers // pass array
        )

        // Set recipient email(s) with deduplication
        const recipientEmails = this.selectedInvoices
          .filter((invoice) => invoice.email)
          .map((invoice) => invoice.email)

        if (recipientEmails.length > 0) {
          // Use Set to ensure unique email addresses
          const uniqueEmails = [...new Set(recipientEmails)]
          this.emailBody.to = uniqueEmails.join(',')
        }

        // Get PDF attachments for all selected invoices sequentially
        const attachments = []
        const failedInvoices = []

        for (const invoice of this.selectedInvoices) {
          try {
            const attachment = await this.getPreviewResponse(invoice._id)
            if (attachment) {
              attachments.push(attachment)
            }
          } catch (err) {
            console.error(
              `Failed to get preview for invoice ${invoice._id}:`,
              err
            )
            failedInvoices.push(invoice._id)
          }
        }

        this.emailAttachments = attachments

        // Show warning if some attachments failed
        if (failedInvoices.length > 0) {
          console.warn(
            `Failed to generate ${
              failedInvoices.length
            } attachment(s) for invoices: ${failedInvoices.join(', ')}`
          )
          // Optionally show a warning snackbar
          this.snackbar_data = {
            snackbar: true,
            text: `Warning: ${failedInvoices.length} attachment(s) failed to generate. Email will proceed with available attachments.`,
            color: 'warning',
            icon: 'exclamation-triangle',
            timeout: 5000,
          }
          // Small delay to show the warning before proceeding
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        // Open the email modal
        this.sendRawEmailDialog = true
        this.snackbar_data.snackbar = false
        this.loading_email_send = false
      } catch (error) {
        console.error('Error in proceedWithBulkEmailSend:', error)
        this.snackbar_data = {
          snackbar: true,
          text: 'Error preparing emails. Please try again.',
          color: 'error',
          icon: 'exclamation-circle',
          timeout: 3000,
        }
        this.loading_email_send = false
      }
    },
    showConfirmation(item) {
      this.confirmDeletion = {
        show: true,
        item,
        reason: '',
      }
    },
    closeInvoiceDeleteDialog() {
      this.confirmDeletion = {
        show: false,
        item: null,
        reason: '',
      }
    },
    async handleInvoiceDel() {
      try {
        const invoice = this.confirmDeletion?.item
        this.invoice_delete_loading = true
        if (this.$refs.deleteForm.validate()) {
          const response = await this.$axios.$patch(
            `/invoice/void/${invoice?._id}`,
            {
              void: true,
              void_reason: this.confirmDeletion?.reason,
            }
          )

          this.closeInvoiceDeleteDialog()
          await this.handleReload()
        }
      } catch (error) {
        console.log('Error when deleting invoice')
      } finally {
        this.invoice_delete_loading = false
      }
    },
    async changeActiveStatus(status) {
      if (status.name == 'Draft Invoices') {
        this.show_draft_invoices = true
      } else {
        this.show_draft_invoices = false

        if (status.name == 'All Invoices') {
          // reset status
          this.filter.status = []
        } else if (status.name == 'OverDue Invoices') {
          this.filter.status = ['Overdue']
        } else if (status.name == 'Due Invoices') {
          this.filter.status = ['Due']
        } else if (status.name == 'Paid Invoices') {
          this.filter.status = ['Paid']
        } else if (status.name == 'Partially Paid Invoices') {
          this.filter.status = ['Partially Paid']
        } else if (status.name == 'Unapproved Invoices') {
          this.filter.status = ['Unapproved']
        } else if (/void/i.test(status.name)) {
          // Special case: Void invoices card -> send body { void: true }
          this.filter.status = []
          this.filter.void = true
        } else {
          // do nothing
        }
      }
      // set active
      this.activeStatusFilter = status.name
      // Clear granular status filter buttons to avoid unintended intersections
      this.filter.selectedFilterStatus = []
      // When selecting All Invoices clear primary status array too
      if (status.name == 'All Invoices') {
        this.filter.status = []
        this.filter.void = undefined
      }
      // Clear void flag for any other non-void card
      if (!/void/i.test(status.name)) {
        this.filter.void = undefined
      }
      // Reset pagination to first page for a new filter context
      this.options.page = 1
      // Trigger fetch using unified handler
      this.handleFilterBillings()
    },
    async getInvoiceCardCount() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      // Build filters for stats API - support multiple companies
      const statsFilters = {}
      if (this.filter.selectedEmployers && this.filter.selectedEmployers.length > 0) {
        // Pass all selected companies to backend (now supports multiple)
        statsFilters.company_id = this.filter.selectedEmployers
      }

      await this.$axios
        .$post(`/invoice/counts`, statsFilters, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.invoiceCount = response
          if (this.invoiceCount.length && !this.activeStatusFilter) {
            this.activeStatusFilter = 'All Invoices'
          }
          // if(this.invoiceCount.length > 0) {
          //   this.InvoiceCard[0].count = this.invoiceCount.filter((a) => a.name == 'Unpaid Invoices')[0].count
          //   this.InvoiceCard[1].count = this.invoiceCount.filter((a) => a.name == 'OverDue Invoices')[0].count
          //   this.InvoiceCard[2].count = this.invoiceCount.filter((a) => a.name == 'Paid Invoices')[0].count
          //   this.InvoiceCard[3].count = this.invoiceCount.filter((a) => a.name == 'General Invoices')[0].count
          //   this.InvoiceCard[4].count = this.invoiceCount.filter((a) => a.name == 'Monthly Invoices')[0].count
          //   this.InvoiceCard[5].count = this.invoiceCount.filter((a) => a.name == 'Draft Invoices')[0].count
          //   this.InvoiceCard[6].count = this.invoiceCount.filter((a) => a.name == 'Unapproved Invoices')[0].count

          //   this.showCounts = true
          // }
        })
    },
    async getTotalAmountDue() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/invoice/amount/due/companies?limit=1`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          const formattedAmount = new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(response.totalAmount)

          console.log('calculating totals')
          this.invoiceCount.push({
            name: 'Total Amount Due',
            count: formattedAmount,
          })
        })
    },
    handleSendInvoiceEmail() {},
    handleEmployerId(val) {
      this.filter.selectedEmployerStatus = val.status
      this.InvoiceDetails = val
      this.selectedInvoiceId = val._id // Set the selected invoice ID

      // Show the appropriate modal based on invoice status
      // if (val.status == 'Paid') {
      //   this.billingsPaymentDialogs = true
      //   this.invoicePreviewFlag = false // Make sure only one modal shows
      // } else {
      // }
      this.invoicePreviewFlag = true

      this.billingsPaymentDialogs = false

      // Add invoice to recently viewed
      this.addToRecentlyViewed(val)
    },
    toggleSearch() {
      this.isSearchExpanded = !this.isSearchExpanded
      if (this.isSearchExpanded) {
        this.$nextTick(() => {
          const input = this.$el.querySelector('.v-autocomplete input')
          if (input) input.focus()
        })
      }
    },
    async exportAgeingDetailed() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        // ✅ ENHANCED: Add currency display option to query params
        const queryParams = new URLSearchParams()
        if (this.currencyDisplayOption !== 'both') {
          queryParams.append('currency_display', this.currencyDisplayOption)
        }

        let response = await this.$axios.get(
          `/invoice/ageing/detailed/report${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
          {
            headers: {
              Authorization: AuthStr,
            },
            responseType: 'blob',
          }
        )

        if (!response.data) {
          throw new Error('No data received from the server')
        }

        const contentType = response.headers['content-type']

        if (contentType.includes('application/json')) {
          const reader = new FileReader()
          reader.onload = () => {
            const errorMessage = JSON.parse(reader.result)
            console.error('Server Error:', errorMessage)
          }
          reader.readAsText(response.data)
          return
        }

        const blob = new Blob([response.data], { type: contentType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        const filename = response.headers['content-disposition']
          ? response.headers['content-disposition']
              .split('filename=')[1]
              .replace(/['"]/g, '')
          : 'ageing-detailed-report.xlsx'

        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return response
      } catch (error) {
        console.error('Download failed:', error)
      }
    },
    async exportAgeingSummary() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        // ✅ ENHANCED: Add currency display option to query params
        const queryParams = new URLSearchParams()
        if (this.currencyDisplayOption !== 'both') {
          queryParams.append('currency_display', this.currencyDisplayOption)
        }

        let response = await this.$axios.get(
          `/invoice/ageing/summary/report${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
          {
            headers: {
              Authorization: AuthStr,
            },
            responseType: 'blob',
          }
        )

        if (!response.data) {
          throw new Error('No data received from the server')
        }

        const contentType = response.headers['content-type']

        if (contentType.includes('application/json')) {
          const reader = new FileReader()
          reader.onload = () => {
            const errorMessage = JSON.parse(reader.result)
            console.error('Server Error:', errorMessage)
          }
          reader.readAsText(response.data)
          return
        }

        const blob = new Blob([response.data], { type: contentType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        const filename = response.headers['content-disposition']
          ? response.headers['content-disposition']
              .split('filename=')[1]
              .replace(/['"]/g, '')
          : 'ageing-summary-report.xlsx'

        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return response
      } catch (error) {
        console.error(error)
      }
    },

    async exportPEODetailed() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        // Build the query parameters
        let queryParams = new URLSearchParams()

        // Add date range if both dates are selected
        if (this.peoReportDates.startDate && this.peoReportDates.endDate) {
          const startDate = new Date(this.peoReportDates.startDate).toISOString()
          const endDate = new Date(this.peoReportDates.endDate).toISOString()
          queryParams.append('date_range', `["${startDate}","${endDate}"]`)
        }

        // ✅ ENHANCED: Add currency display option
        if (this.currencyDisplayOption !== 'both') {
          queryParams.append('currency_display', this.currencyDisplayOption)
        }

        let response = await this.$axios.get(
          `/invoice/create/monthly-invoice-report/${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
          {
            headers: {
              Authorization: AuthStr,
            },
            responseType: 'blob',
          }
        )

        if (!response.data) {
          throw new Error('No data received from the server')
        }

        const contentType = response.headers['content-type']

        if (contentType.includes('application/json')) {
          const reader = new FileReader()
          reader.onload = () => {
            const errorMessage = JSON.parse(reader.result)
            console.error('Server Error:', errorMessage)
          }
          reader.readAsText(response.data)
          return
        }

        const blob = new Blob([response.data], { type: contentType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        // Generate filename with date range if applicable
        let filename = 'peo-detailed-report'
        if (this.peoReportDates.startDate && this.peoReportDates.endDate) {
          const startFormatted = this.peoReportDates.startDate.replace(/-/g, '')
          const endFormatted = this.peoReportDates.endDate.replace(/-/g, '')
          filename += `_${startFormatted}_to_${endFormatted}`
        }
        filename += '.xlsx'

        const serverFilename = response.headers['content-disposition']
          ? response.headers['content-disposition']
              .split('filename=')[1]
              .replace(/['"]/g, '')
          : filename

        link.setAttribute('download', serverFilename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return response
      } catch (error) {
        console.error(error)
        this.$store.dispatch('snackbar_data/setSnackbarData', {
          message: 'Error exporting PEO Detailed Report. Please try again.',
          type: 'error',
        })
      }
    },
    async exportSelected() {
      if (!this.selectedReports.length) return

      this.exportingAll = true

      try {
        await Promise.all(
          this.selectedReports.map(async (reportType) => {
            switch (reportType) {
              case 'ageing-detailed':
                this.loadingReports.ageingDetailed = true
                await this.exportAgeingDetailed()
                break
              case 'ageing-summary':
                this.loadingReports.ageingSummary = true
                await this.exportAgeingSummary()
                break
              case 'peo-detailed':
                this.loadingReports.peoDetailed = true
                await this.exportPEODetailed()
                break
            }
          })
        )
        this.exportMenu = false
        this.selectedReports = []
      } catch (error) {
        console.error('Export error:', error)
      } finally {
        this.exportingAll = false
        Object.keys(this.loadingReports).forEach((key) => {
          this.loadingReports[key] = false
        })
      }
    },
    // Professional debounce utility function
    debounce(func, delay) {
      return (...args) => {
        clearTimeout(this[`${func}DebounceTimer`])
        this[`${func}DebounceTimer`] = setTimeout(() => {
          this[func](...args)
        }, delay)
      }
    },

    // Debounced search and filter handlers
    debouncedSearch: null,
    debouncedClientFilter: null,
    debouncedEmployeeFilter: null,

        // Search functionality with debouncing
    handleSearchInput() {
      // Clear any existing timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
      }

      // Set new timer for debounced search
      this.searchDebounceTimer = setTimeout(() => {
        this.handleFilterBillings()
        this.searchDebounceTimer = null
      }, this.debounceDelay)
    },

    handleSearchClick() {
      // Execute search immediately on button click
      this.executeSearchImmediately()
    },

    handleSearchClear() {
      // Clear search and refresh immediately
      this.executeSearchImmediately()
      this.filter.searchQuery = ''
    },



      // Handle client search input with debouncing (only for typing within dropdown)
      handleClientSearchInput(value) {
        // Only debounce if there's actual text input
        if (value && value.trim() !== '') {
          // Clear any existing timer
          if (this.clientFilterDebounceTimer) {
            clearTimeout(this.clientFilterDebounceTimer)
          }

          // Set new timer for debounced filter
          this.clientFilterDebounceTimer = setTimeout(() => {
            // This will trigger the filter update
            this.clientFilterDebounceTimer = null
          }, this.debounceDelay)
        }
      },

      // Handle employee search input with debouncing (only for typing within dropdown)
      handleEmployeeSearchInput(value) {
        // Only debounce if there's actual text input
        if (value && value.trim() !== '') {
          // Clear any existing timer
          if (this.employeeFilterDebounceTimer) {
            clearTimeout(this.employeeFilterDebounceTimer)
          }

          // Set new timer for debounced filter
          this.employeeFilterDebounceTimer = setTimeout(() => {
            // This will trigger the filter update
            this.employeeFilterDebounceTimer = null
          }, this.debounceDelay)
        }
      },

          // Execute search immediately (for button click or Enter key)
    executeSearchImmediately() {
      // Clear all pending timers
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
      if (this.clientFilterDebounceTimer) {
        clearTimeout(this.clientFilterDebounceTimer)
        this.clientFilterDebounceTimer = null
      }
      if (this.employeeFilterDebounceTimer) {
        clearTimeout(this.employeeFilterDebounceTimer)
        this.employeeFilterDebounceTimer = null
      }
      if (this.clientFilterChangeTimeout) {
        clearTimeout(this.clientFilterChangeTimeout)
        this.clientFilterChangeTimeout = null
      }

      // Reset the filter progress flag
      this.filterInProgress = false

      // Execute search immediately
      this.handleFilterBillings()
    },

        // Execute filters immediately (for immediate filter application)
    executeFiltersImmediately() {
      // Clear all pending timers
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
      if (this.clientFilterDebounceTimer) {
        clearTimeout(this.clientFilterDebounceTimer)
        this.clientFilterDebounceTimer = null
      }
      if (this.employeeFilterDebounceTimer) {
        clearTimeout(this.employeeFilterDebounceTimer)
        this.employeeFilterDebounceTimer = null
      }
      if (this.clientFilterChangeTimeout) {
        clearTimeout(this.clientFilterChangeTimeout)
        this.clientFilterChangeTimeout = null
      }

      // Reset the filter progress flag
      this.filterInProgress = false

      // Execute filters immediately
      this.handleFilterBillings()
    },

    // Handle immediate filter application (for buttons, etc.)
    applyFiltersNow() {
      this.executeFiltersImmediately()
    },

    // Cancel pending search operations
    cancelPendingSearches() {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer)
        this.searchDebounceTimer = null
      }
      if (this.clientFilterDebounceTimer) {
        clearTimeout(this.clientFilterDebounceTimer)
        this.clientFilterDebounceTimer = null
      }
      if (this.employeeFilterDebounceTimer) {
        clearTimeout(this.employeeFilterDebounceTimer)
        this.employeeFilterDebounceTimer = null
      }
      if (this.clientFilterChangeTimeout) {
        clearTimeout(this.clientFilterChangeTimeout)
        this.clientFilterChangeTimeout = null
      }
      // Reset the filter progress flag
      this.filterInProgress = false
    },

    // Check if any search operations are pending
    hasPendingSearches() {
      return this.searchDebounceTimer !== null ||
             this.clientFilterDebounceTimer !== null ||
             this.employeeFilterDebounceTimer !== null
    },

    // Get the remaining time for the next search execution
    getSearchCountdown() {
      if (this.searchDebounceTimer) {
        return Math.ceil(this.debounceDelay / 1000)
      }
      return 0
    },

    handleSearchBlur() {
      if (!this.searchQuery) {
        this.isSearchExpanded = false
      }
    },
    selectCreditNote(id) {
      console.log('What is the id **', id)
      this.selectedCreditNoteID = id
      console.log('Selected Credit Note ID:', id)
    },
    handleClose() {
      this.creditNoteEditor = false
    },
    getCreditStatus(note) {
      return note.status
        ? note.status.charAt(0).toUpperCase() + note.status.slice(1)
        : 'N/A'
    },

    getCreditStatusColor(note) {
      const statusColors = {
        available: 'success',
        void: 'error',
        overdue: 'error',
        due: 'warning',
      }
      return statusColors[note.status] || 'grey darken-1'
    },
    toggleAllTemp(value) {
      Object.keys(this.tempVisibility).forEach((key) => {
        this.tempVisibility[key] = value
      })
    },
    async fetchIndividualCreditNotes() {
      this.loading = true
      this.creditNotesData = []

      try {
        const AuthString = 'Bearer '.concat(this.$store.state.token)
        const promises = this.invoiceCreditNotes.map((id) =>
          this.$axios.$get(`/credit/notes/${id}`, {
            headers: {
              Authorization: AuthString,
            },
          })
        )

        const results = await Promise.all(promises)
        console.log('What are the  results ***', results)
        this.creditNotesData = results
      } catch (error) {
        console.error('Error fetching credit notes:', error)
      } finally {
        this.loading = false
      }
    },
    async fetchCreditNotes(invoice_id) {
      console.log('The invoice is this', invoice_id)
      if (!invoice_id) return
      try {
        const AuthString = 'Bearer '.concat(this.$store.state.token)
        let creditNotes = await this.$axios.$post(
          `/invoice/id/${invoice_id}`,
          {},
          {
            headers: {
              Authorization: AuthString,
            },
          }
        )
        this.invoiceCreditNotes = creditNotes[0].credit_notes
        this.previewCreditNotes = true

        // Start fetching individual credit notes
        await this.fetchIndividualCreditNotes()

        return this.invoiceCreditNotes
      } catch (error) {
        // this.$toast.error('Failed to fetch credit notes')
        this.snackbar_data = {
          snackbar: true,
          text: `Failed to fetch credit notes: ${error?.message}`,
          color: 'error',
          icon: 'spinner fa-spin',
          timeout: 1000,
        }
        throw new Error(error)
      }
    },
    addToRecentlyViewed(invoice) {
      this.recentlyViewedIds = this.recentlyViewedIds.filter(
        (id) => id !== invoice._id
      )

      this.recentlyViewedIds.unshift(invoice._id)

      if (this.recentlyViewedIds.length > this.maxRecentInvoices) {
        this.recentlyViewedIds = this.recentlyViewedIds.slice(
          0,
          this.maxRecentInvoices
        )
      }
    },

    async refreshBillingList() {
      this.isRefreshing = true
      try {
        await this.getBillingList()
      } catch (error) {
        console.error('Error refreshing billing list:', error)
      } finally {
        this.isRefreshing = false
      }
    },
    saveVisibility() {
      this.columnVisibility = { ...this.tempVisibility }
      this.selectAll = this.tempSelectAll
      this.menuOpen = false
    },
    saveColumnSettings() {
      localStorage.setItem(
        'tableColumnSettings',
        JSON.stringify(this.columnVisibility)
      )
    },
    loadColumnSettings() {
      const saved = localStorage.getItem('tableColumnSettings')
      if (saved) {
        this.columnVisibility = JSON.parse(saved)
      }
    },
    formatCurrency(amount, currency = 'AED') {
      if (isNaN(amount)) {
        return null
      }

      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    },
    getSettledAmount(item) {
      // If it's a draft invoice, always show 0
      if (item.is_draft) {
        return 0
      }

      // If status is Paid, show the same as total amount
      if (item.status === 'Paid') {
        return item.total || 0
      }

      // If status is Partially Paid, show the partial_amount
      if (item.status === 'Partially Paid') {
        return item.partial_amount || 0
      }

      // For other statuses (Due, Overdue, Unapproved), show 0
      return 0
    },
    getRemainingBalance(item) {
      // If it's a draft invoice, show the full balance_due (since nothing is settled)
      if (item.is_draft) {
        return item.balance_due || 0
      }

      // If status is Paid, show 0 (fully paid)
      if (item.status === 'Paid') {
        return 0
      }

      // For all other statuses, calculate: balance_due - partial_amount
      const balanceDue = item.balance_due || 0
      const partialAmount = item.partial_amount || 0
      return balanceDue - partialAmount
    },
    decodeObject(encoded) {
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
      try {
        const str = Buffer.from(base64, 'base64').toString()
        return JSON.parse(str)
      } catch (e) {
        console.error('Failed to decode:', e)
        return null
      }
    },
    checkUrlParameters() {
      if (Object.keys(this.$route.query).length === 0) {
        return
      }
      const showInvoice = this.$route.query.show_invoice
      let invoice = this.decodeObject(this.$route.query.data)
      if (showInvoice === 'true' && invoice) {
        this.InvoiceDetails = invoice
        this.selectedInvoiceId = invoice._id
        if (invoice.status == 'Paid') {
          this.filter.selectedEmployerStatus = 'Paid'
          this.billingsPaymentDialogs = true
        } else {
          this.invoicePreviewFlag = true
          this.billingsPaymentDialogs = false
        }
      }
    },
    handleError() {},

    handleSaved() {
      this.isEditing = false
    },
    handleDocumentChange() {},
    async saveCurrentDocument() {
      if (this.isEditing && this.$refs.editor) {
        await this.$refs.editor.saveDocument()
      }
    },
    async actionSuccess() {
      // Refresh the invoice list to get updated data
      await this.handleReload()

      // Close the payment dialog
      this.recordPayment = false
    },
    closeDialogs() {
      this.recordPayment = false
      this.sendRawEmailDialog = false
      this.newGeneralInvoice = false
      this.newCustomCreditNote = false
      this.selectedCustomCreditNote = null
      this.editDocument = false
      this.emailAttachments = []
      this.process_id = ''
      this.currentidentifier = ''
      this.loading_email_send = false
      this.confirmResendEmail = false
    },
    handleUpdateSuccess() {
      // Close both dialogs
      this.invoicePreviewFlag = false
      this.editDocument = false
      this.newGeneralInvoice = false

      // Clear selected item
      this.selectedItem = {}

      // Refresh the invoice list
      this.getBillingList()
    },
    openEditor(invoice) {
      console.log('called to open modal', invoice)
      this.selectedItem = invoice
      this.newGeneralInvoice = true
      this.invoiceKey++
      this.invoicePreviewFlag = false // Close the preview panel
    },
    async openCreditNoteEditor(invoice) {
      // Check for existing draft credit note first
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get(
          `/credit/notes/check-existing-draft?invoiceId=${invoice._id}`,
          { headers: { Authorization: AuthStr } }
        )

        if (response.exists && response.creditNote) {
          console.log('Found existing draft credit note, opening for editing')
          this.selectedCreditNote = response.creditNote
        } else {
          console.log('No existing draft found, will create new credit note')
          this.selectedCreditNote = null
        }
      } catch (error) {
        console.error('Error checking for existing draft:', error)
        this.selectedCreditNote = null
      }

      this.creditNoteViewMode = false // Reset view mode for new credit notes
      this.creditNoteDialog = true
      this.selectedItem = invoice
      this.invoicePreviewFlag = false // Close the preview panel when opening credit note dialog
    },
    editCreditNote(creditNote) {
      console.log('Opening credit note for editing:', creditNote)

      // Check if it's a custom credit note
      if (creditNote.type === 'custom') {
        // Open custom credit note dialog for editing
        this.selectedCustomCreditNote = creditNote
        this.newCustomCreditNote = true
        this.invoicePreviewFlag = false // Close the preview panel when opening credit note dialog
      } else {
        // Standard credit note - use existing flow
        this.creditNoteViewMode = true
        this.creditNoteDialog = true
        this.selectedItem = this.InvoiceDetails // Pass the original invoice
        this.selectedCreditNote = creditNote // Store the credit note to edit
        this.invoicePreviewFlag = false // Close the preview panel when opening credit note dialog
      }
    },

    handleEditCustomCreditNote(creditNote) {
      // Handle edit from preview panel
      this.selectedCustomCreditNote = creditNote
      this.newCustomCreditNote = true
      this.invoicePreviewFlag = false
    },
    closeCreditNoteDialog() {
      this.creditNoteDialog = false
      this.creditNoteViewMode = false
      this.selectedCreditNote = null
      this.selectedCreditNote = null
    },
    openDebitNoteEditor(invoice) {
      this.clickedButton = 'debit_note'
      this.billingsDialogs = true
      this.selectedItem = invoice
    },
    handleSelection(selected) {
      if (selected) {
        const selectedInvoices = this.originalBillingList.filter(
          (item) => item.customer_name === selected
        )
        this.billingList = selectedInvoices
      } else {
        this.billingList = this.originalBillingList
        // this.getBillingList();
      }
    },
    async getInvoiceUrlFromId(invoice_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let obj = {
        invoice_id: invoice_id,
      }
      try {
        let response = await this.$axios.$post(`/invoice/getpreviewpdf`, obj, {
          headers: { Authorization: AuthStr },
        })
        return response.url
      } catch (error) {
        console.error('Error in getting the invoice id', error.message)
        throw new Error(error)
      }
    },
    async downloadInvoice(invoice_id) {
      try {
        let invoiceUrl = await this.getInvoiceUrlFromId(invoice_id)
        const link = document.createElement('a')
        link.href = invoiceUrl
        link.setAttribute('download', `invoice-${invoice_id || 'download'}.pdf`)
        link.setAttribute('target', '_blank')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        throw new Error(error)
      }
    },
    async printInvoice(invoice_id) {
      let invoice_url = await this.getInvoiceUrlFromId(invoice_id)
      const printWindow = window.open(invoice_url)
      printWindow.onload = function () {
        printWindow.print()
      }
    },
    handleRecordPayment(InvoiceDetails) {
      this.recordPayment = true
    },
    async handleReload() {
      // Cancel any pending search operations before reloading
      this.cancelPendingSearches()
      await this.handleFilterBillings()
      await this.getInvoiceCardCount().then(async () => {
        // await this.getTotalAmountDue()
      })
    },
    async handleInvoice() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/generic/invoice/approve`, this.InvoiceDetails, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.invoicePreviewFlag = false
          this.getBillingList()
          this.getBillingStatus()
        })
    },
    closeBillingsDialog(value) {
      this.billingsDialogs = false
      this.billingsPaymentDialogs = false
      this.invoicePreviewFlag = false // Ensure the invoice preview is closed too
      this.creditNoteDialog = false
      this.getBillingList()
    },
    closeApprovalDialog(value) {
      this.invoicePreviewFlag = false
      this.bulkPaymentsDialog = false
      this.creditNoteDialog = false
      // if (value) {
      //   this.addToRecentlyViewed(value)
      // }
    },
    handleClick(index) {
      this.buttons[index].clicked = !this.buttons[index].clicked

      this.selectedStatus = this.buttons
        .filter((button) => button.clicked)
        .map((button) => button.value)
      this.companyBillingStatuses = this.selectedStatus.filter(
        (status) => !['Payroll', 'Monthly', 'General'].includes(status)
      )
      this.companyBillingTypes = this.selectedStatus
        .filter((status) => ['Payroll', 'Monthly', 'General'].includes(status))
        .map((status) => status.toLowerCase() + ' invoice')
      console.log('The clicked buttons are', this.selectedStatus)
      // this.handleStatusSearch()
    },
    handleFilterClick(index) {
      this.buttons[index].clicked = !this.buttons[index].clicked

      this.filter.selectedFilterStatus = this.buttons
        .filter((button) => button.clicked)
        .map((button) => button.value)
    },
    handleNewTransaction(value) {
      this.clickedButton = value
      if (this.clickedButton == 'general_invoice') {
        // this.$router.push('/Billings/billingsGeneralInvoice')
        this.selectedItem = {}
        // reset selected
        this.newGeneralInvoice = true
        this.invoiceKey++
      }
      if (this.clickedButton == 'custom_credit_note') {
        this.selectedItem = {}
        // reset selected
        this.newCustomCreditNote = true
        this.creditNoteKey++
      }
      // if (this.clickedButton == 'payroll_invoice') {
      //   this.billingsDialogs = true
      // }
      if (this.clickedButton == 'debit_note') {
        this.billingsDialogs = true
      }
      if (this.clickedButton == 'products') {
        this.billingsDialogs = true
      }

      if (this.clickedButton == 'bulk_payments') {
        this.bulkPaymentsDialog = true
      }
    },
    async getBillingList() {
      // If there are active filters we avoid calling the bare list endpoint via the infinite scroll
      // to prevent overwriting already filtered data. Let handleFilterBillings manage those cases.
      if (this.hasActiveFilters) {
        // Defensive: ensure observer does not keep triggering while filters applied
        this.loadObserver = false
        return
      }

      const fetchToken = ++this.currentFetchToken
      try {
        this.dataLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const baseFilters = this.buildFilters() // will be mostly empty when no active filters
        // Support 'All' selection (Vuetify uses -1) by converting to a large practical limit
        const effectiveLimit = this.options.itemsPerPage === -1
          ? (this.filter.totalResults || 100000)
          : this.options.itemsPerPage
        const queryParams = {
          page: this.options.page,
          limit: effectiveLimit,
          sortBy: this.computedSortBy,
        }

        const response = await this.$axios.$post(`/invoice/list`, baseFilters, {
          headers: { Authorization: AuthStr },
          params: queryParams,
        })

        // Stale response guard
        if (fetchToken !== this.currentFetchToken) return

        this.billingList = response.results
        this.options.page = response.page
        // Preserve -1 (All) selection in UI; otherwise sync with server limit
        if (this.options.itemsPerPage !== -1) {
          this.options.itemsPerPage = response.limit
        }
        this.filter.totalResults = response.totalResults
      } catch (error) {
        console.error('Error fetching billing list:', error)
      } finally {
        if (fetchToken === this.currentFetchToken) this.dataLoading = false
      }
    },
    async getBillingStatus() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(`/invoice/status/list`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.billingStatusList = response
          // add the draft status
          // this.billingStatusList.push('Draft')
          console.log('The billing status list is', this.billingStatusList)
          this.buttons = this.billingStatusList
            .filter((value) => value && value.trim() !== '')
            .map((value) => {
              return {
                text: value.charAt(0).toUpperCase() + value.slice(1),
                value: value,
                clicked: false,
              }
            })
          this.buttons.push({
            text: 'General',
            value: 'General',
            clicked: false,
          })
          this.buttons.push({
            text: 'Monthly',
            value: 'Monthly',
            clicked: false,
          })
          this.buttons.push({
            text: 'Payroll',
            value: 'Payroll',
            clicked: false,
          })
          // Add sent invoices filter
          this.buttons.push({
            text: 'Sent Invoices',
            value: 'sent',
            clicked: false,
          })
          return this.buttons
        })
    },
    async handleStatusSearch() {
      this.dataLoading = true
      this.page = 1
      const AuthStr = `Bearer ${this.$store.state.token}`

      try {
        let requestData = {}

        // Check if "Sent Invoices" is selected
        const hasSentFilter = this.selectedStatus.includes('sent')
        const filteredStatus = this.selectedStatus.filter(
          (status) => status !== 'sent'
        )

        if (
          filteredStatus.length === 1 &&
          !['Payroll', 'Monthly', 'General'].includes(filteredStatus[0])
        ) {
          requestData = { status: filteredStatus[0] }
        } else {
          const statuses = filteredStatus.filter(
            (status) => !['Payroll', 'Monthly', 'General'].includes(status)
          )
          const types = filteredStatus
            .filter((status) => ['Payroll', 'Monthly', 'General'].includes(status))
            .map((status) => status.toLowerCase() + ' invoice')

          if (statuses.length > 0) requestData.status = statuses
          if (types.length > 0) requestData.type = types
        }

        // Add sent filter parameter if selected
        if (hasSentFilter) {
          requestData.is_sent = true
        }

        // Add search parameter if provided
        if (this.filter.searchQuery && this.filter.searchQuery.trim() !== '') {
          requestData.search = this.filter.searchQuery.trim()
        }

        const response = await this.$axios.$post(
          `/invoice/list?page=${this.page}&limit=100000`,
          requestData,
          { headers: { Authorization: AuthStr } }
        )

        this.billingList = response.results
      } catch (error) {
        console.error('Error fetching invoice list:', error)
      } finally {
        this.dataLoading = false
      }
    },

    async getEmployersList() {
      this.comPage++
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/companies/list/dropdown?page=${this.comPage}&limit=${10000}`,
          { isInvoiceFilter: true },
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.employers = response
        })
    },
    async getEmployeesList() {
      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          `/users/list/dropdown?page=${this.page}&limit=100000`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.employees = response
        })
    },
        async handleFilterBillings() {
      // Prevent multiple simultaneous API calls
      if (this.dataLoading) {
        console.log('Filter request already in progress, skipping...')
        return
      }

      // Prevent rapid successive calls
      if (this.filterInProgress) {
        console.log('Filter already in progress, skipping...')
        return
      }

      this.filterInProgress = true

      try {
        this.dataLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Build unified filters
        const filters = this.buildFilters()
        const effectiveLimit = this.options.itemsPerPage === -1
          ? (this.filter.totalResults || 100000)
          : this.options.itemsPerPage
        const queryParams = {
          page: 1, // reset to first page on filter changes
          limit: effectiveLimit,
          sortBy: this.computedSortBy,
        }
        this.options.page = 1

        const fetchToken = ++this.currentFetchToken
        this.updating_filters = true
        const response = await this.$axios.$post(`/invoice/list`, filters, {
          headers: { Authorization: AuthStr },
          params: queryParams,
        })

        if (fetchToken !== this.currentFetchToken) return

        this.billingList = response.results
        this.options.page = response.page
        if (this.options.itemsPerPage !== -1) {
          this.options.itemsPerPage = response.limit
        }
        this.filter.totalResults = response.totalResults

        // Disable infinite scroll when filters are active
        this.loadObserver = !this.hasActiveFilters

        // Refresh stats to reflect current filters
        await this.getInvoiceCardCount()
      } catch (error) {
        console.log('error: ', error?.message)
      } finally {
        this.dataLoading = false
        // Reset the updating_filters flag immediately
        this.updating_filters = false
        // Reset the filterInProgress flag
        this.filterInProgress = false
      }
    },
    // Build a unified filters object used by all invoice fetches
    buildFilters() {
      const filters = {
        start_date: this.filter.estimate_date || undefined,
        end_date: this.filter.exp_date || undefined,
        is_draft: this.show_draft_invoices || undefined,
        void: this.filter.void ? true : undefined,
      }

      if (this.filter.searchQuery && this.filter.searchQuery.trim() !== '') {
        filters.search = this.filter.searchQuery.trim()
      }

      if (this.filter.selectedEmployers && this.filter.selectedEmployers.length > 0) {
        filters.company_id = Array.isArray(this.filter.selectedEmployers)
          ? this.filter.selectedEmployers
          : [this.filter.selectedEmployers]
      }

      if (this.filter.selectedEmployees && this.filter.selectedEmployees.length > 0) {
        filters.user_id = Array.isArray(this.filter.selectedEmployees)
          ? this.filter.selectedEmployees
          : [this.filter.selectedEmployees]
      }

      // Status & type separation from selectedFilterStatus
      let statuses = this.filter.selectedFilterStatus.filter(
        (s) => !['Payroll', 'Monthly', 'General'].includes(s)
      )
      let types = this.filter.selectedFilterStatus
        .filter((s) => ['Payroll', 'Monthly', 'General'].includes(s))
        .map((s) => s.toLowerCase() + ' invoice')

      // Also include card-selected status list (filter.status)
      if (this.filter.status && this.filter.status.length > 0) {
        statuses = statuses.concat(this.filter.status)
      }

      if (statuses.length > 0) filters.status = statuses
      if (types.length > 0) filters.type = types

      // Remove undefined keys
      Object.keys(filters).forEach((k) =>
        (filters[k] === undefined || filters[k] === '') && delete filters[k]
      )

      return filters
    },
    async clearFilter() {
      // Cancel any pending search operations
      this.cancelPendingSearches()

      this.dataLoading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.filter.estimate_date = ''
      this.filter.exp_date = ''
      this.filter.selectedFilterStatus = []
      this.filter.selectedEmployees = []
      this.filter.selectedEmployers = []
      this.filter.status = []
      this.filter.searchQuery = ''

      const params = {}
      await this.$axios
        .$post(`/invoice/list`, params, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.billingList = response.results
          this.dataLoading = false
        })

      // Refresh stats to reflect cleared filters
      await this.getInvoiceCardCount()

      if (this.filter.selectedFilterStatus.length === 0) {
        this.buttons.forEach((button) => {
          button.clicked = false
        })
      }
    },
    clearPeoReportDates() {
      this.peoReportDates.startDate = null
      this.peoReportDates.endDate = null
      this.peoReportDateMenu.start = false
      this.peoReportDateMenu.end = false
    },
    editInvoice(item) {
      this.selectedItem = item
      this.showEditModel = true
    },
    handleEditBillings() {
      // Toggle the edit document dialog
      this.editDocument = !this.editDocument

      // Make sure the invoice preview is closed when opening the edit dialog
      if (this.editDocument) {
        this.invoicePreviewFlag = false
      }
    },
    async updateBillingsData() {
      // If editDocument is true, close that dialog, otherwise toggle showEditModel
      if (this.editDocument) {
        this.editDocument = false
      } else {
        this.showEditModel = !this.showEditModel
      }
      this.selectedItem = {}
      await this.getBillingList()
    },
    async getBillingsEmail(item) {
      console.log('What us the item', item)
      console.log('What is the item at this point', item)

      // Check if this invoice has already been sent an email
      if (this.isInvoiceSent(item)) {
        // Store the item for later use and show confirmation dialog
        this.pendingEmailItem = item
        this.pendingEmailBulk = false
        this.confirmResendEmail = true
        return
      }

      // If not sent, proceed with email preparation
      this.proceedWithSingleEmailSend(item)
    },

    async proceedWithSingleEmailSend(item) {
      this.snackbar_data = {
        snackbar: true,
        text: 'Preparing email ....',
        color: 'success',
        icon: 'spinner fa-spin',
        timeout: -1,
      }

      try {
        this.emailAttachments = []
        this.emailBody = {}
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const previewresponse = await this.getPreviewResponse(
          item?.id ?? item?._id
        )

        console.log('[*] - email preview response: ', previewresponse)

        const _emailTemplates = await this.$axios.$get(
          `/email_template/get/all`,
          { headers: { Authorization: AuthStr } }
        )

        console.log('[*] - email templates: ', _emailTemplates)

        const replacements = {
          '<p>Dear\\s(.*?)</p>': `<p>Dear ${item.customer_name}</p>`,
        }

        await this.fetchAndCustomizeEmailTemplate(
          item,
          this.templateStatusMappings[item.status],
          replacements,
          _emailTemplates,
          AuthStr
        )

        // Set recipient email from invoice
        if (item.email && !this.emailBody.to) {
          this.emailBody.to = item.email
        }

        this.emailAttachments = [previewresponse]
        this.sendRawEmailDialog = true
        this.snackbar_data.snackbar = false
      } catch (error) {
        console.error('Error preparing email:', error)
        this.snackbar_data = {
          snackbar: true,
          text: 'Error preparing email. Please try again.',
          color: 'error',
          icon: 'exclamation-circle',
          timeout: 3000,
        }
      }
    },

    async fetchAndCustomizeEmailTemplate(
      item,
      templateName,
      replacements,
      _emailTemplates,
      AuthStr,
      invoiceNumbers // new param, can be array or string
    ) {
      const ids = _emailTemplates.filter(
        (val) => val.module === 'companies' && val.name === templateName
      )

      if (ids.length === 0) {
        console.error('No template found for', templateName)
        return
      }

      try {
        // Build query string for invoice_number(s)
        let queryString = ''
        if (Array.isArray(invoiceNumbers) && invoiceNumbers.length > 1) {
          // Multiple invoice numbers: ?invoice_number=INV1&invoice_number=INV2
          queryString = invoiceNumbers
            .map(num => `invoice_number=${encodeURIComponent(num)}`)
            .join('&')
        } else {
          // Single invoice number (from item)
          const invNum = Array.isArray(invoiceNumbers) ? invoiceNumbers[0] : (invoiceNumbers || item.invoice_number)
          queryString = `invoice_number=${encodeURIComponent(invNum)}`
        }

        const emailTemplate = await this.$axios.$get(
          `/email_template/id/${ids[0].id}?${queryString}`,
          { headers: { Authorization: AuthStr } }
        )

        this.emailBody = emailTemplate
        let content = this.emailBody.content

        for (const [key, value] of Object.entries(replacements)) {
          content = content.replace(new RegExp(key, 'g'), value)
        }

        this.emailBody.content = content
        return this.emailBody
      } catch (error) {
        console.error('Error loading the template', error)
        throw new Error(error)
      }
    },
    actionSuccessEmail() {
      this.sendRawEmailDialog = false

      // Update the sent status locally for immediate UI feedback
      const invoicesToUpdate =
        this.selectedInvoices && this.selectedInvoices.length > 0
          ? this.selectedInvoices
          : [this.InvoiceDetails]

      // Update each invoice's sent status
      invoicesToUpdate.forEach((invoice) => {
        const index = this.billingList.findIndex(
          (item) => item._id === invoice._id || item.id === invoice.id
        )
        if (index !== -1) {
          // Initialize is_sent object if it doesn't exist
          if (!this.billingList[index].is_sent) {
            this.billingList[index].is_sent = {}
          }

          // Set the sent status to true for the current invoice status
          const status = this.billingList[index].status.toLowerCase()
          this.$set(this.billingList[index].is_sent, status, true)

          // Update sent date
          this.billingList[index].sent_date = new Date().toISOString()
        }
      })

      // show success here
      this.showSnackStatus('Email Has Been Sent Successfully!', true)

      // Clear selection after sending
      this.selectedInvoices = []
      this.loading_email_send = false
    },
    async getPreviewResponse(invoiceId) {
      try {
        // Get the PDF URL
        const response = await this.$axios.$post(`/invoice/getpreviewpdf`, {
          invoice_id: invoiceId,
        })

        // Find the invoice data for this ID
        const invoice =
          this.selectedInvoices.find((inv) => inv._id === invoiceId) ||
          this.billingList.find((inv) => inv._id === invoiceId)

        if (invoice) {
          // Enhance the attachment with invoice information
          return {
            ...response,
            name: `Invoice-${invoice.invoice_number}.pdf`,
            invoiceNumber: invoice.invoice_number,
            customer: invoice.customer_name,
            invoiceData: invoice,
          }
        }

        return response
      } catch (error) {
        console.error('Error getting preview response:', error)
        return null
      }
    },
    async sendBulkEmail() {
      try {
        this.loading_email_send = true
        // const targetInvoices = this.billingList.filter((invoice) =>
        //   this.selectedInvoices.includes(invoice._id)
        // )
        const totalInvoices = this.selectedInvoices.length
        this.emailSendProgress = `0/${totalInvoices}`
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const _emailTemplates = await this.$axios.$get(
          `/email_template/get/all`,
          { headers: { Authorization: AuthStr } }
        )

        console.log('[+] Found invoices: ', this.selectedInvoices?.length)

        for (let i = 0; i < this.selectedInvoices.length; i++) {
          const invoice = this.selectedInvoices[i]
          this.emailBody = {}
          console.log('target-invoices: ', invoice)

          // Update progress counter
          this.emailSendProgress = `${i + 1}/${totalInvoices}`

          const attachment = await this.getPreviewResponse(invoice._id)
          const replacements = {
            '<p>Dear\\s(.*?)</p>': `<p>Dear ${invoice.customer_name}</p>`,
          }

          console.log('[+] atachments response: ', attachment)

          const emailBody = await this.fetchAndCustomizeEmailTemplate(
            invoice,
            this.templateStatusMappings[invoice.status],
            replacements,
            _emailTemplates,
            AuthStr
          )

          // Set recipient email from invoice
          if (invoice.email) {
            emailBody.to = invoice.email
          }

          // We're now handling email sending through the modal
          // Keep this for backward compatibility but it should not be used
          await this.sendMail(emailBody, [attachment])

          // Add a small delay to show progress animation
          await new Promise((resolve) => setTimeout(resolve, 300))
        }

        this.openEmailDialog = false
        this.handleReload()
        this.showSnackStatus(`${totalInvoices} emails sent successfully!`, true)
      } catch (error) {
        console.error('Error sending bulk emails:', error)
        this.showSnackStatus(
          `Oops! Could not send bulk emails: ${error?.message}`,
          false
        )
      } finally {
        this.loading_email_send = false
        this.emailSendProgress = '0/0'
        this.selectedInvoices = []
      }
    },
    async sendEmail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `/generic/send/email`,
          {
            to: this.to,
            cc: [this.cc],
            subject: this.subject,
            body: this.body,
          },
          { headers: { Authorization: AuthStr } }
        )
        .then((res) => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Email Has Been Sent Successfully!'
          this.openEmailDialog = false
          this.to = []
          this.cc = []
          this.subject = ''
          this.body = ''
          this.selectedItem = {}
        })
    },
    async sendMail(emailBody, attachments = []) {
      try {
        // this.loading = true
        let body = emailBody
        body.body = emailBody.content
        if (typeof emailBody.to == 'string') {
          body.to = emailBody.to.split(',')
        }
        if (typeof emailBody.cc == 'string') {
          body.cc = emailBody.cc.split(',')
        }
        if (attachments.length > 0) {
          body.attachments = []
          for (let index = 0; index < attachments.length; index++) {
            const element = attachments[index]
            body.attachments.push({
              filename: element.url.toString().split('/')[-1], //to get the file name with file format
              path: element.url,
            })
          }
        }

        // console.log("Trying to send raw")
        await this.$axios.$post(`/generic/send/emailraw`, body)
      } catch (error) {
        console.log('')
      }
    },
    showSnackStatus(message, status) {
      this.snackbar_data = {
        snackbar: true,
        text: message,
        color: status ? 'success' : 'error',
        timeout: 1000,
      }
    },
   formatInvoiceType(type) {
      // Handle null, undefined, or empty string cases
      if (!type || typeof type !== 'string') {
        return ''
      }

      // Split by spaces and filter out empty strings, then capitalize each word
      return type
        .split(' ')
        .filter(word => word && word.length > 0) // Remove empty strings
        .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
        .join(' ')
    },
    isInvoiceSent(invoice) {
      if (!invoice || !invoice.is_sent) return false

      // Check if the invoice has a 'sent' status for its current status
      const status = invoice.status ? invoice.status.toLowerCase() : null
      if (status && invoice.is_sent[status]) {
        return true
      }

      // Check if any status has been sent
      return Object.values(invoice.is_sent).some((value) => value === true)
    },
    formatSentDate(sentDate) {
      if (!sentDate) return ''

      try {
        const date = new Date(sentDate)
        return (
          date.toLocaleDateString() +
          ' ' +
          date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        )
      } catch (e) {
        console.error('Error formatting sent date:', e)
        return sentDate
      }
    },

    cancelResendEmail() {
      // Close the modal
      this.confirmResendEmail = false

      // If it was for bulk emails, unselect the sent invoices
      if (this.pendingEmailBulk) {
        // Find invoices that have been sent and remove them from selection
        const sentInvoiceIds = this.selectedInvoices
          .filter((invoice) => this.isInvoiceSent(invoice))
          .map((invoice) => invoice._id)

        this.selectedInvoices = this.selectedInvoices.filter(
          (invoice) => !sentInvoiceIds.includes(invoice._id)
        )

        // Show notification
        this.snackbar_data = {
          snackbar: true,
          text: 'Already sent invoices were removed from selection',
          color: 'info',
          timeout: 3000,
        }
      }

      // Clear pending items
      this.pendingEmailItem = null
      this.pendingEmailBulk = false
    },

    proceedWithEmailSend() {
      this.confirmResendEmail = false

      if (this.pendingEmailBulk) {
        // Continue with bulk email send
        this.proceedWithBulkEmailSend()
        this.pendingEmailBulk = false
      } else if (this.pendingEmailItem) {
        // Continue with single email send
        this.proceedWithSingleEmailSend(this.pendingEmailItem)
        this.pendingEmailItem = null
      }
    },
    async refreshReportsData() {
      this.isRefreshing = true
      try {
        // Reset companies data
        this.companies.page = 1
        this.companies.hasMore = true
        this.companies.list = []
        await this.fetchCompanies()
      } catch (error) {
        console.error('Error refreshing data:', error)
        this.snackbar_data = {
          snackbar: true,
          text: `Error refreshing data: ${error?.message}`,
          color: 'error',
          icon: 'spinner fa-spin',
          timeout: 1000,
        }
        // this.$toast.error('Failed to refresh data')
      } finally {
        this.isRefreshing = false
      }
    },

    async fetchCompanies() {
      if (this.companies.loading || !this.companies.hasMore) return

      this.companies.loading = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$post(
          `/companies/list/dropdown?page=${this.companies.page}&limit=${this.companies.limit}`,
          { isInvoiceFilter: true },
          { headers: { Authorization: AuthStr } }
        )

        // Update companies list
        if (this.companies.page === 1) {
          this.companies.list = response
        } else {
          this.companies.list = [...this.companies.list, ...response]
        }

        // Check if we have more data to load
        this.companies.hasMore = response.length === this.companies.limit
        this.companies.page++
      } catch (error) {
        console.error('Error fetching companies:', error)
        // this.$toast.error('Failed to fetch companies')
      } finally {
        this.companies.loading = false
      }
    },

    handleCompanyScroll(e) {
      const { target } = e
      if (
        target.scrollTop + target.clientHeight >= target.scrollHeight - 50 &&
        this.companies.hasMore &&
        !this.companies.loading
      ) {
        this.fetchCompanies()
      }
    },

    handleCompanyChange() {
      // Reset search and pagination when company is selected
      this.companies.search = ''
      this.companies.page = 1
      this.companies.hasMore = true
      this.companies.list = []
      this.fetchCompanies()
    },

    async previewStatement() {
      console.log('Previewing statement...')
      if (!this.canGenerateStatement) return

      this.statementExport.previewLoading = true
      this.statementExport.previewError = null
      this.statementExport.previewData = null
      this.statementExport.previewColumns = []

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Build query parameters based on company selection
        const queryParams = new URLSearchParams({
          startDate: this.statementExport.startDate,
          endDate: this.statementExport.endDate,
          preview: 'true',
        })

        // Add company parameters based on selection
        if (this.statementExport.selectedCompanies.length === 1) {
          queryParams.append(
            'company_id',
            this.statementExport.selectedCompanies[0]
          )
        } else if (this.statementExport.selectedCompanies.length > 1) {
          queryParams.append(
            'company_ids',
            this.statementExport.selectedCompanies.join(',')
          )
        }
        // If no companies selected, export all (no company parameters added)

        // First get the preview URL
        const response = await this.$axios.$get(
          `/statements/export?${queryParams.toString()}`,
          { headers: { Authorization: AuthStr } }
        )

        if (!response || !response.url) {
          throw new Error('Invalid response format')
        }

        // Store the URL for download
        this.statementExport.previewUrl = response.url

        // Fetch the actual Excel file from the URL
        const excelResponse = await fetch(response.url)
        if (!excelResponse.ok) {
          throw new Error('Failed to fetch Excel file')
        }

        // Get the Excel file as array buffer
        const arrayBuffer = await excelResponse.arrayBuffer()

        // Read the Excel file
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        // Get the first worksheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        // Filter out non-tabular rows (e.g., title, summary, or empty rows)
        const validRows = jsonData.filter(
          (row) =>
            row.length >= 7 &&
            row[0] &&
            !row[0].includes('Statement') &&
            !row[0].includes('Summary')
        )
        if (validRows.length > 0) {
          const headers = validRows[0]
          const dataRows = validRows.slice(1)
          this.statementExport.previewData = dataRows.map((row) => {
            let rowObject = {}
            headers.forEach((header, index) => {
              rowObject[header] = row[index]
            })
            return rowObject
          })
          this.statementExport.previewColumns = headers.map((col) => ({
            text: col,
            value: col,
          }))
          this.statementExport.showPreview = true
        } else {
          throw new Error('No valid tabular data found in the Excel file')
        }
      } catch (error) {
        console.error('Error generating statement preview:', error)
        this.statementExport.previewError =
          error.message || 'Failed to generate statement preview'
        // this.$toast.error(this.statementExport.previewError)
      } finally {
        this.statementExport.previewLoading = false
      }
    },
    async generateStatement() {
      if (!this.canGenerateStatement) return

      this.statementExport.isGenerating = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Build query parameters based on company selection
        const queryParams = new URLSearchParams({
          startDate: this.statementExport.startDate,
          endDate: this.statementExport.endDate,
        })

        // Add company parameters based on selection
        if (this.statementExport.selectedCompanies.length === 1) {
          queryParams.append(
            'company_id',
            this.statementExport.selectedCompanies[0]
          )
        } else if (this.statementExport.selectedCompanies.length > 1) {
          queryParams.append(
            'company_ids',
            this.statementExport.selectedCompanies.join(',')
          )
        }
        // If no companies selected, export all (no company parameters added)

        const response = await this.$axios.$get(
          `/statements/export?${queryParams.toString()}`,
          { headers: { Authorization: AuthStr } }
        )

        // Generate filename based on selection
        let filename = `statements-${this.statementExport.startDate}-${this.statementExport.endDate}.xlsx`

        if (this.statementExport.selectedCompanies.length === 1) {
          const selectedCompany = this.employers.find(
            (el) => el._id === this.statementExport.selectedCompanies[0]
          )
          filename = `statement-${selectedCompany?.company_name || 'company'}-${
            this.statementExport.startDate
          }-${this.statementExport.endDate}.xlsx`
        } else if (this.statementExport.selectedCompanies.length > 1) {
          filename = `statements-${this.statementExport.selectedCompanies.length}-companies-${this.statementExport.startDate}-${this.statementExport.endDate}.xlsx`
        } else {
          filename = `statements-all-companies-${this.statementExport.startDate}-${this.statementExport.endDate}.xlsx`
        }

        if (response && response.url) {
          // Create a temporary link and trigger download
          const link = document.createElement('a')
          link.href = response.url
          link.setAttribute('download', response.filename || filename)
          document.body.appendChild(link)
          link.click()
          link.remove()
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error('Error generating statement:', error)
        // this.$toast.error(error.message || 'Failed to generate statement')
        this.snackbar_data = {
          snackbar: true,
          text: `Error generating statement: ${error?.message}`,
          color: 'error',
          icon: 'spinner fa-spin',
          timeout: 1000,
        }
      } finally {
        this.statementExport.isGenerating = false
      }
    },

    removeCompany(companyId) {
      const index = this.statementExport.selectedCompanies.indexOf(companyId)
      if (index > -1) {
        this.statementExport.selectedCompanies.splice(index, 1)
      }
    },

    openPreviewInNewTab() {
      if (this.statementExport.previewUrl) {
        window.open(this.statementExport.previewUrl, '_blank')
      }
    },

    // Bulk Upload Methods
    async downloadInvoiceTemplate() {
      try {
        this.downloadingTemplate = true;
        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.get('/invoice/export/template', {
          headers: { Authorization: AuthStr },
          responseType: 'blob'
        });

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'invoice_bulk_upload_template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        this.snackbar_data = {
          snackbar: true,
          text: 'Template downloaded successfully!',
          color: 'success',
          timeout: 3000,
        };
      } catch (error) {
        console.error('Download error:', error);
        this.snackbar_data = {
          snackbar: true,
          text: 'Error downloading template. Please try again.',
          color: 'error',
          timeout: 3000,
        };
      } finally {
        this.downloadingTemplate = false;
      }
    },

    handleBulkFileChange(file) {
      if (file) {
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv'
        ];
        if (!allowedTypes.includes(file.type)) {
          this.snackbar_data = {
            snackbar: true,
            text: 'Please select a valid Excel or CSV file',
            color: 'error',
            timeout: 3000,
          };
          this.bulkUploadFile = null;
          return;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          this.snackbar_data = {
            snackbar: true,
            text: 'File size must be less than 5MB',
            color: 'error',
            timeout: 3000,
          };
          this.bulkUploadFile = null;
          return;
        }
      }
    },

    async uploadBulkInvoices() {
      if (!this.bulkUploadFile) {
        this.snackbar_data = {
          snackbar: true,
          text: 'Please select a file to upload',
          color: 'error',
          timeout: 3000,
        };
        return;
      }

      try {
        this.uploadingBulk = true;
        const formData = new FormData();
        formData.append('file', this.bulkUploadFile);

        const AuthStr = 'Bearer '.concat(this.$store.state.token);
        const response = await this.$axios.post('/invoice/bulk/upload', formData, {
          headers: {
            Authorization: AuthStr,
            'Content-Type': 'multipart/form-data'
          }
        });

        // Extract errors from response
        const errorsArr = response && response.data && Array.isArray(response.data.errors) ? response.data.errors : [];
        let rowErrors = [];
        if (response && response.data && response.data.data && Array.isArray(response.data.data.errors)) {
          rowErrors = response.data.data.errors;
        } else if (errorsArr.length) {
          rowErrors = errorsArr;
        }

        // Show all row errors in the UI (only if there are actual validation errors)
        if (rowErrors.length && failedCount > 0) {
          this.bulkUploadErrors = rowErrors;
          if (this.bulkUploadErrorTimeout) clearTimeout(this.bulkUploadErrorTimeout);
          this.bulkUploadErrorTimeout = setTimeout(() => {
            this.bulkUploadErrors = [];
          }, 7000);
        } else {
          this.bulkUploadErrors = [];
        }

        // Show success message
        console.log('Bulk upload response structure:', response.data);
        const successCount = response.data?.summary?.successful || response.data?.data?.summary?.successful || response.data?.data?.summary?.success || 0;
        const failedCount = response.data?.summary?.failed || response.data?.data?.summary?.failed || 0;
        const skippedCount = response.data?.summary?.skipped || response.data?.data?.summary?.skipped || 0;

        console.log('Extracted counts:', { successCount, failedCount, skippedCount });

        // Use backend message if available, otherwise create our own
        const backendMessage = response.data?.message || response.data?.data?.message;
        let messageText;

        if (backendMessage) {
          messageText = backendMessage;
        } else {
          messageText = `Upload completed! ${successCount} invoices created successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}${skippedCount > 0 ? `, ${skippedCount} incomplete rows skipped` : ''}`;
        }

        this.snackbar_data = {
          snackbar: true,
          text: messageText,
          color: failedCount > 0 ? 'warning' : 'success',
          timeout: 5000,
        };

        // Clear the file input
        this.bulkUploadFile = null;

        // Refresh the invoice list
        await this.handleReload();

      } catch (error) {
        console.error('Upload error:', error);
        this.snackbar_data = {
          snackbar: true,
          text: error.response?.data?.message || 'Error uploading invoices. Please try again.',
          color: 'error',
          timeout: 5000,
        };
      } finally {
        this.uploadingBulk = false;
      }
    },
  },
  async mounted() {
    await Promise.all([
      this.getBillingList(),
      this.getBillingStatus(),
      this.getInvoiceCardCount(),
    ])
    // await this.getTotalAmountDue()
    await this.getEmployersList()
    await this.getEmployeesList()

    this.first_load_fetch = false
  },
  computed: {
    computedSortBy() {
      return this.options.sortBy
        .map(
          (field, index) =>
            `${field}:${this.options.sortDesc[index] ? 'desc' : 'asc'}`
        )
        .join(',')
    },
    computedSelectedInvoice() {
      return Object.keys(this.selectedItem).length
        ? this.selectedItem
        : undefined
    },
    filteredInvoices() {
      let filtered = this.billingList
      if (this.selectedStatus.length) {
        filtered = filtered.filter((invoice) => {
          const statusFilters = this.selectedStatus.filter(
            (status) => !['Payroll', 'Monthly', 'General'].includes(status)
          )

          const typeFilters = this.selectedStatus.filter((status) =>
            ['Payroll', 'Monthly', 'General'].includes(status)
          )

          const matchesStatus =
            statusFilters.length === 0 || statusFilters.includes(invoice.status)

          const matchesType =
            typeFilters.length === 0 ||
            typeFilters.some((type) =>
              invoice.type?.toLowerCase().includes(type.toLowerCase())
            )

          return matchesStatus && matchesType
        })
      }

      return filtered.sort((a, b) => {
        const aIndex = this.recentlyViewedIds.indexOf(a._id)
        const bIndex = this.recentlyViewedIds.indexOf(b._id)

        if (aIndex === -1 && bIndex === -1) return 0
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    },
    visibleHeaders() {
      return this.billings_documents_headers.filter(
        (header) => this.columnVisibility[header.value]
      )
    },
    // Detect if any user-applied filters are active (excluding plain pagination)
    hasActiveFilters() {
      return (
        (this.filter.searchQuery && this.filter.searchQuery.trim() !== '') ||
        (this.filter.selectedEmployers && this.filter.selectedEmployers.length > 0) ||
        (this.filter.selectedEmployees && this.filter.selectedEmployees.length > 0) ||
        (this.filter.estimate_date && this.filter.estimate_date !== '') ||
        (this.filter.exp_date && this.filter.exp_date !== '') ||
        (this.filter.selectedFilterStatus && this.filter.selectedFilterStatus.length > 0) ||
        (this.filter.status && this.filter.status.length > 0) ||
  this.show_draft_invoices ||
  this.filter.void === true
      )
    },
    canGenerateStatement() {
      return (
        this.statementExport.startDate &&
        this.statementExport.endDate &&
        !this.statementExport.isGenerating
      )
    },
    getCompanySelectionHint() {
      if (!this.statementExport.selectedCompanies.length) {
        return 'No companies selected - will export statements for all companies'
      }
      if (this.statementExport.selectedCompanies.length === 1) {
        const company = this.employers.find(
          (e) => e._id === this.statementExport.selectedCompanies[0]
        )
        return `Exporting for: ${company?.company_name || 'Selected company'}`
      }
      return `Exporting for ${this.statementExport.selectedCompanies.length} selected companies`
    },
    employersWithAllOption() {
      return this.employers
    },

    // Search status indicators
    isSearchPending() {
      return this.searchDebounceTimer !== null
    },

    isClientFilterPending() {
      return this.clientFilterDebounceTimer !== null
    },

    isEmployeeFilterPending() {
      return this.employeeFilterDebounceTimer !== null
    },

    searchStatusText() {
      if (this.isSearchPending) {
        return 'Searching in 0.5s...'
      }
      if (this.isClientFilterPending) {
        return 'Filtering clients...'
      }
      if (this.isEmployeeFilterPending) {
        return 'Filtering employees...'
      }
      return ''
    },
  },
}
</script>
<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.modern-search {
  max-width: 400px;
}

.custom-switch .v-input__slot {
  margin-bottom: 0 !important;
}

.custom-switch .v-input__control .v-messages {
  display: none !important;
}

.search-container {
  position: relative;
}

.search-container .modern-search {
  width: 200px;
  transition: all 0.3s ease;
}

.export-list .v-list-item {
  min-height: 48px;
}

.export-list .v-list-item::before {
  display: none;
}

.export-list .v-input--selection-controls {
  margin: 0;
  padding: 0;
}

/* Add new styles for tabs */
.v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0 16px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.v-tab {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
  padding: 0 24px;
  height: 48px;
  transition: all 0.2s ease;
}

.v-tab .v-icon {
  margin-right: 8px;
  opacity: 0.8;
}

.v-tab--active {
  font-weight: 600;
}

.v-tab--active .v-icon {
  opacity: 1;
}

.v-tabs-items {
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-top: 1px;
}

/* Rest of existing styles */
.credit-note-table {
  width: 100%;
}

.table_btn {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.light_accent4 {
  background-color: rgba(26, 213, 152, 0.1);
}

.light_accent3 {
  background-color: rgba(255, 181, 54, 0.1);
}

.light_accent2 {
  background-color: rgba(255, 102, 102, 0.1);
}

.accent4--text {
  color: #1ad598;
}

.accent3--text {
  color: #ffb536;
}

.custom-switch {
  margin-left: 16px;
}

.modern-search {
  max-width: 300px;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.disabledItem {
  opacity: 0.5;
  pointer-events: none;
}

.privacyMood .v-data-table__wrapper table tbody tr td {
  filter: blur(4px);
}

.privacyMood .v-data-table__wrapper table tbody tr:hover td {
  filter: blur(0);
}

.hover-card {
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--v-primary-base);
}

.v-data-table {
  background: white !important;
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table ::v-deep th {
  background-color: #f8fafc !important;
  color: #1f2937 !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.v-data-table ::v-deep td {
  white-space: nowrap;
  font-size: 0.875rem;
}

.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.v-data-table ::v-deep .v-data-footer {
  border-top: 1px solid #e5e7eb;
}

.sent-date-text {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  font-style: italic;
}

.draft-row {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

.email-sent-row {
  background-color: rgba(25, 118, 210, 0.08) !important;
}

.checkbox-placeholder {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

/* Currency Display Options Styling */
.currency-radio-option ::v-deep .v-radio__label {
  width: 100%;
}

.currency-radio-option ::v-deep .v-input--selection-controls__input {
  margin-top: 0;
}

/* Fix radio buttons alignment */
.currency-radio-option ::v-deep .v-input--radio-group__input {
  margin-top: 2px;
}

/* Fix spacing for the radio group */
.v-radio-group ::v-deep .v-input__slot {
  margin-bottom: 0;
}

/* Override Vuetify default radio button colors to match the design */
.v-radio.primary--text ::v-deep .v-icon {
  color: #1976d2 !important;
}

/* Remove default spacing in radio group */
.v-radio-group ::v-deep .v-input__control {
  width: 100%;
}
</style>
