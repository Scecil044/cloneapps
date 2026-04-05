<template>
  <div class="">
    <!-- <InquiriesInquiryListing
      :key="activeModule.key"
      :title="activeModule.name"
    /> -->
    <v-card color="card_bg"  style="height: 80vh !important">
      <v-row class="p-0 m-0 tw-py-3 tw-px-4"  style="align-items: center">
        <v-col cols="auto" class="pa-0">
          <v-img
            src="/team/requestsDark.svg"
            max-width="fit-content"
            height="fit-content"
            class="mr-2"
            contain
          ></v-img>
        </v-col>
        <v-col cols="auto" class="pa-0">
          <span class="darkBlue-heading-text subHeadingFontSize">
            Inquiries
          </span>
        </v-col>
        <v-col cols="auto" class="py-0">
          <v-text-field
            v-model="searchInquiry"
            solo
            flat
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            class="rounded-xl"
            placeholder="Search User"
            style="
              background: #ffffff 0% 0% no-repeat padding-box;
              border: 0.5px solid #eff1f3;
              border-radius: 18px;
              opacity: 1;
            "
          ></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <!-- <v-col cols="auto" class="pa-0" align-self="end">
          <v-btn
           @click="addInquiry = true"
           color="primary"
          >
            <v-icon>
              mdi-plus
            </v-icon>
            New
          </v-btn>
        </v-col> -->
      </v-row>
      <v-divider></v-divider>

      <v-card-text id="card-text" class="tw-px-4" style="margin-top: 0 !important">
        <div class="tw-flex tw-justify-end tw-items-center">
          <!-- filters -->
          <v-row class="p-0 m-0">
            <!-- <v-col cols="3">
              <CustomInputContainer
                label="Filter by Employee"
                class="text--text"
              >
                <div slot="input">
                  <v-select
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
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col
              cols="3"
              v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)"
            >
              <CustomInputContainer label="Filter By Client">
                <div slot="input">
                  <v-select
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
                  >
                  </v-select>
                </div>
              </CustomInputContainer>
            </v-col> -->

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
                        v-model="filter.start_date"
                        placeholder="mm/dd/yy"
                        class="proposalDialog_date_field2"
                        solo
                        dense
                        hide-details
                        v-bind="attrs"
                        v-on="on"
                      >
                        <template v-slot:prepend>
                          <div class="">
                            <CalenderSvg />
                          </div>
                        </template>
                      </v-text-field>
                    </template>
                    <v-date-picker
                      v-model="filter.start_date"
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
                        v-model="filter.end_date"
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
                      v-model="filter.end_date"
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
            <v-btn icon @click="fetchInquiries" :loading="isRefreshing">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </span>
        </div>

        <v-data-table
          id="coa_table"
          :loading="loading"
          :options.sync="options"
          :server-items-length="filter.totalResults"
          loading-text="Loading... Please wait"
          :headers="computedInquiryHeaders"
          :items="inquiryListing"
        >
          <template v-slot:[`item.date_created`]="{ item }">
            {{ item.date_created | formatDateWithoutTime }}
          </template>

          <template v-slot:[`item.name`]="{ item }">
            <span class="tw-inline-flex tw-flex-col">
              <span class="tw-text-pink-400 font-semibold">
                {{ item.name  }}
              </span>
              <span class="tw-text-green-400 font-semibold tw-underline">
                {{ item.phone  }}
              </span>
            </span>
          </template>

          <template v-slot:[`item.owner`]="{ item }">
            <span class="tw-inline-flex tw-flex-col">
              <span class="tw-text-pink-400 font-semibold">
                {{ `${item.owner?.first_name} ${item.owner?.last_name}`  }}
              </span>
              <span class="tw-text-green-400 font-semibold tw-underline">
                {{ item.lead?.updatedAt | formatDateWithoutTime   }}
              </span>
            </span>
          </template>

          <template v-slot:[`item.movement`]="{ item }">
            <span class="tw-inline-flex tw-flex-col">
              <span class="tw-text-pink-400 font-semibold">
                {{ item.lead?.status  }}
              </span>
              <span class="tw-text-green-400 font-semibold tw-underline">
                {{ item.lead?.updatedAt | formatDateWithoutTime }}
              </span>
            </span>
          </template>

          <template v-slot:[`item.archived_data.reason`]="{ item }">
            <div class="tw-max-w-xs tw-relative">
              <!-- Status indicator badge for restored inquiries -->
              <div v-if="item.archived_data?.restoreBy" class="tw-absolute tw--top-2 tw--right-2 tw-z-10">
                <v-chip
                  color="success"
                  text-color="white"
                  x-small
                  class="tw-animate-pulse"
                >
                  <v-icon left x-small>mdi-check-circle</v-icon>
                  Active
                </v-chip>
              </div>

              <!-- Original Archive/Cancel Reason -->
              <div class="tw-mb-2">
                <div class="tw-flex tw-items-center tw-mb-1">
                  <v-chip
                    :color="item.is_assign ? 'orange' : 'red'"
                    text-color="white"
                    x-small
                    class="tw-mr-2"
                  >
                    <v-icon left x-small>
                      {{ item.is_assign ? 'mdi-archive' : 'mdi-cancel' }}
                    </v-icon>
                    {{ item.is_assign ? 'Archived' : 'Cancelled' }}
                  </v-chip>
                  <span v-if="item.archived_data?.archivedAt" class="tw-text-xs tw-text-gray-500">
                    {{ formatDate(item.archived_data.archivedAt) }}
                  </span>
                </div>
                <div class="tw-text-gray-700 tw-text-xs tw-leading-tight">
                  <strong>Reason:</strong>
                  <span class="tw-italic">{{ truncateText(item.archived_data?.reason || 'No reason provided', 60) }}</span>
                </div>
              </div>

              <!-- Restoration Info (if applicable) -->
              <div v-if="item.archived_data?.restoreBy" class="tw-border-t tw-border-gray-200 tw-pt-2">
                <div class="tw-flex tw-items-center tw-mb-1">
                  <v-chip
                    color="green"
                    text-color="white"
                    x-small
                    class="tw-mr-2"
                  >
                    <v-icon left x-small>mdi-restore</v-icon>
                    Restored
                  </v-chip>
                  <span v-if="item.archived_data?.restoredAt" class="tw-text-xs tw-text-gray-500">
                    {{ formatDate(item.archived_data.restoredAt) }}
                  </span>
                </div>
                <div class="tw-text-green-700 tw-text-xs tw-leading-tight tw-mb-1">
                  <strong>Restore Reason:</strong>
                  <span class="tw-italic">{{ truncateText(item.archived_data?.restoreReason || 'No reason provided', 60) }}</span>
                </div>
                <div class="tw-text-gray-500 tw-text-xs">
                  <strong>By:</strong> {{ getUserName(item.archived_data.restoreBy) }}
                </div>
              </div>

              <!-- Tooltip for full details when text is truncated -->
              <v-tooltip bottom v-if="hasLongText(item.archived_data)">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    icon
                    x-small
                    class="tw-ml-1"
                  >
                    <v-icon small class="tw-text-blue-500">mdi-information-outline</v-icon>
                  </v-btn>
                </template>
                <div class="tw-max-w-sm tw-p-2">
                  <div class="tw-mb-3">
                    <div class="tw-font-semibold tw-text-orange-200 tw-mb-1">
                      {{ item.is_assign ? 'Archive' : 'Cancellation' }} Details:
                    </div>
                    <div class="tw-text-sm">
                      <strong>Date:</strong> {{ item.archived_data?.archivedAt ? formatDate(item.archived_data.archivedAt) : 'Unknown' }}
                    </div>
                    <div class="tw-text-sm">
                      <strong>Reason:</strong> {{ item.archived_data?.reason || 'No reason provided' }}
                    </div>
                  </div>

                  <div v-if="item.archived_data?.restoreBy" class="tw-border-t tw-border-gray-400 tw-pt-2">
                    <div class="tw-font-semibold tw-text-green-200 tw-mb-1">Restoration Details:</div>
                    <div class="tw-text-sm">
                      <strong>Date:</strong> {{ item.archived_data?.restoredAt ? formatDate(item.archived_data.restoredAt) : 'Unknown' }}
                    </div>
                    <div class="tw-text-sm">
                      <strong>By:</strong> {{ getUserName(item.archived_data.restoreBy) }}
                    </div>
                    <div class="tw-text-sm">
                      <strong>Reason:</strong> {{ item.archived_data?.restoreReason || 'No reason provided' }}
                    </div>
                  </div>
                </div>
              </v-tooltip>
            </div>
          </template>

          <template v-slot:[`item.action`]="{ item }">
            <!-- show requirements button -->
            <v-btn
              color="primary"
              small
              icon
              @click="showInquiryRequirements(item)"
            >
              <v-icon> mdi-eye </v-icon>
            </v-btn>

            <!-- New inquiries actions -->
            <template v-if="!item?.archived_data?.status">
              <v-btn
                color="primary"
                small
                icon
                @click="showAssignOptions(item)"
              >
                <v-icon> mdi-account-plus </v-icon>
              </v-btn>

              <v-btn
                color="red"
                small
                icon
                @click="showDeleteInquiry(item)"
              >
                <v-icon> mdi-delete-outline </v-icon>
              </v-btn>
            </template>

            <!-- Archived inquiries actions -->
            <v-btn
              v-else-if="item?.archived_data?.status"
              color="primary"
              small
              icon
              @click="showRestoreInquiry(item)"
            >
              <v-icon> mdi-delete-restore </v-icon>
            </v-btn>

            <!-- Assigned inquiries actions -->
            <template v-else>
              <v-btn icon color="red" @click="showDeleteInquiry(item)">
                <v-icon> mdi-delete-outline </v-icon>
              </v-btn>

              <v-btn icon color="primary" @click="showAssignPRO(item, true)">
                <v-icon> mdi-account-convert </v-icon>
              </v-btn>
            </template>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

     <!-- choose assign operation -->
     <v-dialog
      v-model="choose_assign_inquiry_dialog"
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
        <v-form >
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
               What would like to do? </span
              >
            </v-card-title>
            <v-spacer />
            <v-btn
              @click="choose_assign_inquiry_dialog = false"
              outlined
              icon
              color="red accent-4"
              class="tw-mr-3"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="">
            <div class="tw-px-6 tw-py-10 tw-font-medium">
              You can either create the lead or assign it to someone else.
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <!-- <div class="d-flex align-center justify-end"> -->
            <v-btn
              flat
              text
              @click="create_lead_dialog = true"
              large
              ><span class="">Create Lead </span></v-btn
            >

            <v-btn
              color="primary"
              outlined
              large
              @click="assign_inquiry_dialog = true"
              >Assign Lead</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <!-- assign inquiries dialog -->
    <v-dialog
      v-model="assign_inquiry_dialog"
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
        <v-form ref="invoiceForm" v-model="validPRO" lazy-validation>
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
               {{  is_reassigning ? 'Re-Assign Inquiry' : 'Assign Inquiry'}} </span
              >
            </v-card-title>
            <v-spacer />
            <v-btn
              @click="assign_inquiry_dialog = false"
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
                <CustomInputContainer :mandatory="true" label="Select Lead Owner">
                  <div slot="input">
                    <v-select
                      :items="computedPROList"
                      solo
                      v-model="selected_pro"
                      item-text="full_name"
                      :loading="loading_pro"
                      item-value="_id"
                      class="proposalDialog_date_field2"
                      append-icon="fa-chevron-down"
                    >
                    </v-select>
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
              :disabled="assign_pro_loading"
              @click="assign_inquiry_dialog = false"
              large
              ><span class="">Cancel</span></v-btn
            >

            <v-btn
              color="primary"
              outlined
              large
              :disabled="assign_pro_loading"
              :loading="assign_pro_loading"
              @click="handleInquiryAssignment();choose_assign_inquiry_dialog = false"
              >{{ is_reassigning ? 'Re-Assign': 'Assign' }}</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- delete inquiry -->
    <v-dialog
      v-model="delete_inquiry_dialog"
      max-width="500px"
      min-width="350px"
      persistent
    >
      <v-card
        class="rounded-xl pa-0 pt-0"
        flat
        max-height="500"
        min-height="250"
      >
        <v-form ref="deleteForm" v-model="validDelete" lazy-validation>
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
                {{ getDeleteDialogTitle }}</span
              >
            </v-card-title>
            <v-spacer />
            <v-btn
              @click="closeDeleteDialog"
              outlined
              icon
              color="red accent-4"
              class="tw-mr-3"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="tw-px-6 tw-py-6">
            <div class="tw-mb-4">
              <v-alert
                :type="selected_inquiry?.is_assign ? 'warning' : 'info'"
                outlined
                dense
                class="tw-mb-4"
              >
                {{ getDeleteWarningMessage }}
              </v-alert>

              <!-- Info about what happens after action -->
              <!-- <v-alert
                type="info"
                outlined
                dense
                class="tw-mb-4 tw-text-sm"
              >
                <div class="tw-flex tw-items-center">
                  <v-icon small class="tw-mr-2">mdi-information</v-icon>
                  <span>
                    After {{ selected_inquiry?.is_assign ? 'archiving' : 'cancelling' }},
                    the inquiry statistics will be automatically updated and this action will be logged with your provided reason.
                  </span>
                </div>
              </v-alert> -->
            </div>

            <v-row>
              <v-col cols="12">
                <CustomInputContainer :mandatory="true" label="Enter Reason for Deletion">
                  <div slot="input">
                    <v-textarea
                      v-model="reason_for_deletion"
                      :rules="main_rule"
                      dense
                      outlined
                      required
                      placeholder="Please provide a detailed reason for deleting this inquiry..."
                      rows="3"
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
              :disabled="assign_pro_loading"
              @click="closeDeleteDialog"
              large
              ><span class="">Cancel</span></v-btn
            >

            <v-btn
              color="red"
              outlined
              large
              :disabled="assign_pro_loading || reason_for_deletion.length == 0"
              :loading="assign_pro_loading"
              @click="confirmDeleteInquiry"
              >{{ getDeleteButtonText }}</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- restore inquiry -->
    <v-dialog
      v-model="restore_inquiry_dialog"
      max-width="500px"
      min-width="350px"
      persistent
    >
      <v-card
        class="rounded-xl pa-0 pt-0"
        flat
        max-height="500"
        min-height="250"
      >
        <v-form ref="restoreForm" v-model="validRestore" lazy-validation>
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
                Restore Inquiry</span
              >
            </v-card-title>
            <v-spacer />
            <v-btn
              @click="closeRestoreDialog"
              outlined
              icon
              color="red accent-4"
              class="tw-mr-3"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-divider></v-divider>

          <v-card-text class="tw-px-6 tw-py-6">
            <div class="tw-mb-4">
              <v-alert
                type="success"
                outlined
                dense
                class="tw-mb-4"
              >
                This will restore the inquiry from archived status back to active status. Please provide a reason for the restoration.
              </v-alert>

              <!-- Info about what happens after restoration -->
              <!-- <v-alert
                type="info"
                outlined
                dense
                class="tw-mb-4 tw-text-sm"
              >
                <div class="tw-flex tw-items-center">
                  <v-icon small class="tw-mr-2">mdi-information</v-icon>
                  <span>
                    After restoration, the inquiry statistics will be automatically refreshed and this action will be recorded
                    with your provided reason in the inquiry's history.
                  </span>
                </div>
              </v-alert> -->
            </div>

            <v-row>
              <v-col cols="12">
                <CustomInputContainer :mandatory="true" label="Enter Reason for Restoration">
                  <div slot="input">
                    <v-textarea
                      v-model="reason_for_restoration"
                      :rules="main_rule"
                      dense
                      outlined
                      required
                      placeholder="Please provide a detailed reason for restoring this inquiry..."
                      rows="3"
                    ></v-textarea>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              flat
              text
              :disabled="assign_pro_loading"
              @click="closeRestoreDialog"
              large
              ><span class="">Cancel</span></v-btn
            >

            <v-btn
              color="green"
              outlined
              large
              :disabled="assign_pro_loading || reason_for_restoration.length == 0"
              :loading="assign_pro_loading"
              @click="confirmRestoreInquiry"
              >Restore</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>


    <v-dialog
      v-model="show_requirements_preview"
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
        <v-form lazy-validation>
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
                Requirements Preview</span
              >
            </v-card-title>
            <v-spacer />
            <v-btn
              @click="show_requirements_preview = false"
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
                <!-- <CustomInputContainer :mandatory="true" label="Select PRO">
                  <div slot="input">
                    <v-select
                      :items="computedPROList"
                      solo
                      v-model="selected_pro"
                      item-text="full_name"
                      :loading="loading_pro"
                      item-value="_id"
                      class="proposalDialog_date_field2"
                      append-icon="fa-chevron-down"
                    >
                    </v-select>
                  </div>
                </CustomInputContainer> -->
                <div class="tw-flex tw-flex-col tw-items-start">
                  <span class="tw-text-lg tw-font-semibold">
                    {{ selected_inquiry?.details?.company_name || 'No Company Name' }}
                  </span>
                </div>

                <div class="tw-mt-4 tw-text-sm tw-text-gray-700">
                  <v-textarea
                    :value="selected_inquiry?.message || 'No requirements provided.'"
                    readonly
                    outlined
                    dense
                    auto-grow
                    rows="3"
                    max-rows="4"
                    class="requirements-textarea"
                    style="max-height: 100px; overflow-y: auto; min-height: 80px;"
                    hide-details
                  ></v-textarea>
                </div>

              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <!-- <div class="d-flex align-center justify-end"> -->


            <v-btn
              color="green"
              outlined
              large
              @click="show_requirements_preview = false"
              >close</v-btn
            >
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- create lead model -->
    <DialogsLeadsEditLead :open="create_lead_dialog" @reload="reloadInquiries" :selected-inquiry="selected_inquiry" @close="handleLeadsDialogClose" />
    <!-- <v-snackbar v-model="snackbar.show" :timeout="3000" :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
      </template>
    </v-snackbar> -->
    <SnackBar :data="snackbar_data" />
  </div>
</template>

<script>
import '@/assets/scss/utils/_invoiceTable.scss'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'

export default {
  name: 'inquiries-wrapper',
  props: ['activeModule'],
  components: {
    SnackBar,
    CustomInputContainer,
    CalenderSvg,
  },
  watch: {
    filter: {
      handler(newVal, oldVal) {
        console.log('calling filter handler: ', newVal)
        if (!this.first_loading && !this.updating_filters) {
          this.handleFilterInquiries()
        }
      },
      deep: true,
    },
    searchInquiry(val) {
      if (val) {
        this.searchDebounceAction()
      }
    },
    assign_inquiry_dialog(val) {
      if (val) {
        this.fetchPROs()
      }
    },
    options: {
      handler(newVal, oldVal) {
        if (!this.first_loading && !this.updating_filters) {
          console.log('options changes: ', this.options)
          this.handleFilterInquiries()
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      snackbar_data: {
        snackbar: false,
        text: '',
        color: 'success',
        icon: 'spinner fa-spin',
        timeout: 1000,
      },
      updating_filters: false,
      addInquiry: false,
      exp_date_menu: false,
      date_menu: false,
      isRefreshing: false,
      selectedItem: {},
      searchInquiry: '',
      validPRO: false,
      validDelete: false,
      validRestore: false,
      choose_assign_inquiry_dialog: false,
      create_lead_dialog: false,
      paginate: {
        limit: 20,
        page: 1,
      },
      assign_inquiry_dialog: false,
      loading: true,
      filter: {
        start_date: '',
        end_date: '',
        service_type: [],
        totalResults: 0,
      },
      main_rule: [(v) => !!v || 'This field is required'],
      options: {},
      newInquiryHeaders: [
        { text: 'Date', value: 'date_created', align: 'start' },
        { text: 'Company Name', value: 'company_name', align: 'start' },
        { text: 'Contact Details', value: 'name',sortable: false, align: 'start' },
        { text: 'Service Request', value: 'type',sortable: false, align: 'start' },
        { text: 'Source', value: 'source',  align: 'start' },
        { text: 'Action', value: 'action', align: 'center', sortable: false },
      ],
      assignedInquiryHeaders: [
        { text: 'Date', value: 'date_created', align: 'start' },
        { text: 'Company Name', value: 'company_name', align: 'start' },
        { text: 'Contact Details', value: 'name', sortable: false, align: 'start' },
        { text: 'Service Request', value: 'type', align: 'start', sortable: false, },
        { text: 'Source', value: 'source', align: 'start' },
        { text: 'PRO', value: 'owner', align: 'start', sortable: false, },
        { text: 'Last Activity', value: 'movement', sortable: false, align: 'start' },
        { text: 'Action', value: 'action', align: 'center', sortable: false },
      ],
      archivedInquiryHeaders: [
        { text: 'Date', value: 'date_created', align: 'start' },
        { text: 'Company Name', value: 'company_name', align: 'start' },
        { text: 'Contact Details', value: 'name', sortable: false, align: 'start' },
        { text: 'Service Request', value: 'type', sortable: false, align: 'start' },
        { text: 'Source', value: 'source', align: 'start' },
        { text: 'Archive/Restore History', value: 'archived_data.reason', sortable: false, align: 'start' },
        { text: 'Action', value: 'action', align: 'center', sortable: false },
      ],
      inquiryListing: [],
      first_loading: true,
      updating_filters: false,
      pro_list: [],
      selected_pro: null,
      selected_inquiry: null,
      assign_pro_loading: false,
      delete_inquiry_dialog: false,
      restore_inquiry_dialog: false,
      reason_for_deletion: '',
      reason_for_restoration: '',
      loading_pro: false,
      is_reassigning: false,
      show_requirements_preview: false
    }
  },
  computed: {
    filteredData() {
      return this.inquiries || []
    },
    computedSortBy() {
      return this.options.sortBy
        .map(
          (field, index) =>
            `${field}:${this.options.sortDesc[index] ? 'desc' : 'asc'}`
        )
        .join(',')
    },
    computedPROList() {
      return this.pro_list.map((el) => {
        return {
          full_name: `${el.first_name} ${el.last_name}`,
          email: el.email,
          _id: el._id,
        }
      })
    },
    computedInquiryHeaders() {
      switch (this.activeModule) {
        case 'archived-inquiries':
          return this.archivedInquiryHeaders
        case 'assigned-inquiries':
          return this.assignedInquiryHeaders
        default:
          return this.newInquiryHeaders
      }
    },
    getDeleteDialogTitle() {
      if (!this.selected_inquiry) return 'Delete Inquiry'

      if (this.selected_inquiry.is_assign) {
        return 'Archive Assigned Inquiry'
      } else {
        return 'Delete Inquiry'
      }
    },
    getDeleteWarningMessage() {
      if (!this.selected_inquiry) return ''

      if (this.selected_inquiry.is_assign) {
        return 'This inquiry has been assigned to a PRO and has active work in progress. Archiving will move it to archived inquiries where it can be restored later if needed.'
      } else {
        return 'This inquiry has not been assigned yet. Cancelling will move it to archived inquiries as a cancelled request.'
      }
    },
    getDeleteButtonText() {
      if (!this.selected_inquiry) return 'Delete'

      if (this.selected_inquiry.is_assign) {
        return 'Archive'
      } else {
        return 'Delete'
      }
    },
  },
  methods: {
    closeDialogs(){
      this.assign_inquiry_dialog = false
      this.choose_assign_inquiry_dialog = false
      this.create_lead_dialog = false
      this.closeDeleteDialog()
      this.closeRestoreDialog()
    },
    searchDebounceAction: _.debounce(async function (e) {
      await this.handleFilterInquiries()
    }, 500),
    reloadInquiryStats() {
      this.$nuxt.$emit('reload-inquiry-counts')
    },
    handleLeadsDialogClose(){
      this.closeDialogs()
    },
    reloadInquiries(){
      this.fetchInquiries().then(() => {
        this.reloadInquiryStats()
      })
    },
    showNotificationStatus(message, status) {
      this.snackbar_data = {
        snackbar: true,
        text: message,
        color: status ? 'success' : 'error',
        icon: 'spinner fa-spin',
        timeout: 3000,
      }
    },
    selectItem(item) {
      this.$nuxt.$emit('select-inquiry', item)
    },
    showAssignOptions(inquiry) {
      this.selected_inquiry = inquiry
      this.choose_assign_inquiry_dialog = true
    },
    showInquiryRequirements(inquiry) {
      this.selected_inquiry = inquiry
      this.show_requirements_preview = true
    },
    showAssignPRO(inquiry, reassign = false) {
      this.selected_inquiry = inquiry
      this.assign_inquiry_dialog = true
      if (reassign) {
        this.is_reassigning = true
      }
    },
    showRestoreInquiry(inquiry) {
      this.selected_inquiry = inquiry
      this.reason_for_restoration = ''
      this.restore_inquiry_dialog = true
    },
    closeRestoreDialog() {
      this.restore_inquiry_dialog = false
      this.reason_for_restoration = ''
      this.selected_inquiry = null
    },
    confirmRestoreInquiry() {
      // Add confirmation step before proceeding
      if (this.reason_for_restoration.trim().length < 10) {
        this.showNotificationStatus('Please provide a more detailed reason (at least 10 characters)', false)
        return
      }
      this.restoreInquiry()
    },
    showDeleteInquiry(inquiry) {
      this.selected_inquiry = inquiry
      this.reason_for_deletion = ''
      this.delete_inquiry_dialog = true
    },
    closeDeleteDialog() {
      this.delete_inquiry_dialog = false
      this.reason_for_deletion = ''
      this.selected_inquiry = null
    },
    confirmDeleteInquiry() {
      // Add confirmation step before proceeding
      if (this.reason_for_deletion.trim().length < 10) {
        this.showNotificationStatus('Please provide a more detailed reason (at least 10 characters)', false)
        return
      }
      this.deleteInquiry()
    },
    searchFn() {},
    updateInquiryStatus() {},
    requestListScrollerObserver() {},
    async fetchPROs() {
      try {
        this.loading_pro = true
        const response = await this.$axios.post('/users/pro', { module: 'leads' })
        console.log('PRO response -: ', response.data)
        this.pro_list = response.data || []
      } catch (error) {
        console.log('Error when fetching inquiries: ', error.message)
        this.showNotificationStatus(
          `Error when fetching inquiries: ${error.message}`,
          false
        )
      } finally {
        this.loading_pro = false
      }
    },
    async handleInquiryAssignment() {
      if(this.is_reassigning) {
       await this.reassignInquiry()
       this.is_reassigning = false
      } else {
        await this.assignInquiry()
      }
    },
    async assignInquiry() {
      try {
        this.assign_pro_loading = true
        const response = await this.$axios.post('/inquiry/assign-pro', {
          inquiryID: this.selected_inquiry._id,
          proID: this.selected_pro,
        })
        this.showNotificationStatus(`Inquiry Assigned Successfully`, true)
        this.reloadInquiries()
        // Update inquiry counts after assignment
        await this.fetchAndEmitInquiryCounts()
      } catch (error) {
        console.log('Error when fetching inquiries: ', error.message)
        this.showNotificationStatus(
          `Error when Assigning inquiry: ${error.message}`,
          false
        )
      } finally {
        this.assign_pro_loading = false
        this.closeDialogs()
      }
    },
    async fetchInquiries() {
      try {
        this.loading = true
        console.log('active module: ', this.activeModule)
        const response = await this.$axios.post(
          '/inquiry',
          {
            inquiry_module: this.activeModule,
          },
          {
            params: {
              page: 1,
              limit: 10,
              sortBy: '_id:-1',
            },
          }
        )
        console.log('inquiry response -: ', response.data)
        this.updating_filters = true
        this.inquiryListing = response.data.data.results || []
        this.paginate.limit = response.data.data.limit
        this.paginate.page = response.data.data.page
        this.filter.totalResults = response.data.data.totalResults
      } catch (error) {
        console.log('Error when fetching inquiries: ', error.message)
      } finally {
        this.loading = false
        this.updating_filters = false
      }
    },
    async fetchInquiriesWithModule(inquiryModule) {
      try {
        this.loading = true
        console.log('fetching with module: ', inquiryModule)
        const response = await this.$axios.post(
          '/inquiry',
          {
            inquiry_module: inquiryModule,
          },
          {
            params: {
              page: 1,
              limit: 10,
              sortBy: '_id:-1',
            },
          }
        )
        console.log('inquiry response -: ', response.data)
        this.updating_filters = true
        this.inquiryListing = response.data.data.results || []
        this.paginate.limit = response.data.data.limit
        this.paginate.page = response.data.data.page
        this.filter.totalResults = response.data.data.totalResults
      } catch (error) {
        console.log('Error when fetching inquiries: ', error.message)
      } finally {
        this.loading = false
        this.updating_filters = false
      }
    },
    async reassignInquiry() {
      try {
        this.assign_pro_loading = true
        const response = await this.$axios.post('/inquiry/reassign-pro', {
          inquiryID: this.selected_inquiry._id,
          reassignTo: this.selected_pro,
        })
        this.showNotificationStatus(`Inquiry Reassigned Successfully`, true)
        this.reloadInquiries()
        // Update inquiry counts after reassignment
        await this.fetchAndEmitInquiryCounts()

      } catch (error) {
        console.log('Error when Reassigned inquiry: ', error.message)
        this.showNotificationStatus(
          `Error when Reassigned inquiry: ${error.message}`,
          false
        )
      } finally {
        this.assign_pro_loading = false
        this.closeDialogs()
      }
    },
    async deleteInquiry() {
      try {
        this.assign_pro_loading = true
        const response = await this.$axios.post('/inquiry/archive', {
          inquiryId: this.selected_inquiry._id,
          reason: this.reason_for_deletion,
        })

        const actionType = this.selected_inquiry.is_assign ? 'archived' : 'cancelled'
        const successMessage = this.selected_inquiry.is_assign
          ? 'Inquiry archived successfully'
          : 'Inquiry cancelled successfully'

        this.showNotificationStatus(successMessage, true)

        // Refetch with archived-inquiries module after canceling/archiving
        await this.fetchInquiriesWithModule('archived-inquiries')

        // Update inquiry counts and emit event for UI refresh
        await this.fetchAndEmitInquiryCounts()

      } catch (error) {
        console.log('Error when deleting inquiry: ', error.message)
        const errorMessage = this.selected_inquiry?.is_assign
          ? `Error when archiving inquiry: ${error.message}`
          : `Error when cancelling inquiry: ${error.message}`

        this.showNotificationStatus(errorMessage, false)
      } finally {
        this.closeDeleteDialog()
        this.assign_pro_loading = false
      }
    },
    async restoreInquiry() {
      try {
        this.assign_pro_loading = true
        const response = await this.$axios.post('/inquiry/restore-archive', {
          inquiryId: this.selected_inquiry._id,
          reason: this.reason_for_restoration,
        })
        this.showNotificationStatus(`Inquiry Restored Successfully`, true)

        // Refetch with new-inquiries module after restoring
        await this.fetchInquiriesWithModule('new-inquiries')

        // Close dialog BEFORE updating stats and emitting event
        this.closeRestoreDialog()

        // Update inquiry counts and emit event for UI refresh
        await this.fetchAndEmitInquiryCounts()

      } catch (error) {
        console.log('Error when restoring inquiry: ', error.message)
        this.showNotificationStatus(
          `Error when restoring inquiry: ${error.message}`,
          false
        )
      } finally {
        this.assign_pro_loading = false
      }
    },
    async handleFilterInquiries() {
      try {
        const queryParams = {
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.computedSortBy,
        }

        if (this.filter.end_date) {
          queryParams['end_date'] = this.filter.end_date
        }
        if (this.filter.start_date) {
          queryParams['start_date'] = this.filter.start_date
        }
        if (this.searchInquiry.length) {
          queryParams['search'] = this.searchInquiry
        }

        const filters = {
          inquiry_module: this.activeModule,
        }
        this.loading = true
        this.updating_filters = true

        const response = await this.$axios.post('/inquiry', filters, {
          params: queryParams,
        })
        console.log('inquiry filters response -: ', response.data)
        this.inquiryListing = response.data.data.results || []
        this.paginate.limit = response.data.data.limit
        this.paginate.page = response.data.data.page
        this.filter.totalResults = response.data.data.totalResults
      } catch (error) {
        console.log('Error when fetching inquiries: ', error.message)
      } finally {
        this.updating_filters = false
        this.loading = false
      }
    },

    async fetchAndEmitInquiryCounts() {
      try {
        const response = await this.$axios.get('/inquiry/counts')
        // Emit the counts so parent/layout can update stats
        this.$nuxt.$emit('reload-inquiry-counts', response.data)
      } catch (error) {
        console.log('Error fetching inquiry counts for UI update:', error.message)
      }
    },
    async clearFilter() {
      this.updating_filters = true
      this.filter.start_date = ''
      this.filter.end_date = ''
      this.filter.service_type = []
      this.searchInquiry = ''

      await this.reloadInquiries()
    },
    // Helper methods for better UX in reason display
    isLongText(text) {
      return text && text.length > 50
    },
    truncateText(text, maxLength = 60) {
      if (!text) return 'No reason provided'
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    hasLongText(archivedData) {
      const reason = archivedData?.reason || ''
      const restoreReason = archivedData?.restoreReason || ''
      return reason.length > 60 || restoreReason.length > 60
    },
    formatDate(dateString) {
      if (!dateString) return 'Unknown'
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return 'Invalid date'
      }
    },
    getUserName(userId) {
      // You can enhance this to fetch user details from a users list or API
      // For now, return the userId or a placeholder
      const user = this.pro_list.find(pro => pro._id === userId)
      return user ? `${user.first_name} ${user.last_name}` : `User (${userId?.slice(-4)})`
    },
  },
  async mounted() {
    await this.fetchInquiries()

    this.first_loading = false
  },
}
</script>

<style lang="scss" scoped>
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

.requirements-textarea {
  .v-text-field__details {
    display: none; // Hide the details line
  }

  .v-input__slot {
    min-height: 80px;
    max-height: 100px;
    overflow-y: auto;
  }

  // Ensure consistent width
  width: 100%;
  max-width: 500px;
  margin-top: 12px;
  margin-bottom: 12px;
}

// Add spacing around the requirements section
.tw-mt-4 {
  margin-top: 20px !important;
}
</style>
