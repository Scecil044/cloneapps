<template>
  <div>
    <v-row>
      <template v-if="!showEditModel">
        <v-col cols="12" v-if="loading && leadsDetails.length <= 0">
          <v-card
            class="d-flex align-center"
            color="card_bg"
            id="card"
            height="592px"
          >
            <v-progress-linear
              indeterminate
              color="primary"
            ></v-progress-linear>
          </v-card>
        </v-col>
        <v-col cols="12" v-else>
          <v-card color="card_bg" flat>
            <v-card-title id="card-title" class="mb-4"> </v-card-title>
            <v-card-text
              id="card-text2"
              style="max-height: 10vh !important"
              class="dl__l overflow-y-auto tw-px-5"
            >
              <v-tabs v-model="tab" color="deep-purple accent-4" left>
                <v-tab :href="'#tasks'">
                  <span class="tw-inline-flex tw-gap-2 tw-items-center">
                    <img src="/shift/build.svg" />
                    Tasks
                  </span>
                </v-tab>

                <!-- <v-tab :href="'#overview'">
              <span class="tw-inline-flex tw-gap-2 tw-items-center">
                <img src="/shift/eye.svg" />
               Overview
              </span>
            </v-tab> -->
                <v-tab :href="'#details'">
                  <span class="tw-inline-flex tw-gap-2 tw-items-center">
                    <img src="/shift/eye.svg" />
                    Lead Information
                  </span>
                </v-tab>

                <v-tab :href="'#kyc-details'" v-if="computedDetails.kyc_details && computedDetails.kyc_details.clientType && computedDetails.kyc_details.clientType.length > 0">
                  <span class="tw-inline-flex tw-gap-2 tw-items-center">
                    <v-icon>mdi-account-check</v-icon>
                    KYC Details
                  </span>
                </v-tab>
                <!-- <v-tab :href="'#credit-notes'">Credit Notes</v-tab> -->

                <!-- <v-tab :href="'#notes'">Notes</v-tab> -->
              </v-tabs>
              <v-tabs-items v-model="tab">
                <v-tab-item :value="'overview'">
                  <slot />
                </v-tab-item>
                <v-tab-item :value="'details'">
                  <v-col cols="12" class="py-0">
                    <div class="d-flex align-center justify-end">
                      <v-btn
                        class="ml-1 pl-3 pr-3"
                        color="#000027"
                        outlined
                        :height="30"
                        style="border: solid 3px #f9fafc !important"
                        @click="handleEditModel()"
                      >
                        <EditSvg />
                        <span class="edit_btnNew pl-1">Edit</span>
                      </v-btn>
                    </div>
                  </v-col>

                  <!-- Lead Score Display -->
                  <v-col cols="12" class="tw-mb-6">
                    <v-card
                      class="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-l-4 tw-border-blue-500 tw-shadow-sm"
                    >
                      <v-card-text class="tw-p-6">
                        <div class="tw-flex tw-items-center tw-justify-between">
                          <div class="tw-flex tw-items-center tw-space-x-4">
                            <div
                              class="tw-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-rounded-full tw-bg-white tw-shadow-md"
                            >
                              <v-icon
                                :color="getLeadScoreColor(computedDetails)"
                                size="32"
                              >
                                mdi-flag
                              </v-icon>
                            </div>
                            <div>
                              <h3
                                class="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-1"
                              >
                                Lead Score:
                                {{ calculateLeadScore(computedDetails) }}/100
                              </h3>
                              <p class="tw-text-sm tw-text-gray-600 tw-mb-2">
                                Priority:
                                <span
                                  :class="getPriorityTextColor(computedDetails)"
                                  class="tw-font-semibold"
                                >
                                  {{ getPriorityLevel(computedDetails) }}
                                </span>
                              </p>
                              <div class="tw-flex tw-items-center tw-space-x-2">
                                <div
                                  class="tw-w-32 tw-h-2 tw-bg-gray-200 tw-rounded-full tw-overflow-hidden"
                                >
                                  <div
                                    class="tw-h-full tw-rounded-full tw-transition-all tw-duration-500"
                                    :class="
                                      getProgressBarColor(computedDetails)
                                    "
                                    :style="{
                                      width:
                                        calculateLeadScore(computedDetails) +
                                        '%',
                                    }"
                                  ></div>
                                </div>
                                <span class="tw-text-xs tw-text-gray-500"
                                  >{{
                                    calculateLeadScore(computedDetails)
                                  }}%</span
                                >
                              </div>
                            </div>
                          </div>

                          <!-- Score Breakdown -->
                          <div class="tw-hidden md:tw-block">
                            <div
                              class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm"
                            >
                              <div
                                v-for="(item, index) in getScoreBreakdown(
                                  computedDetails
                                )"
                                :key="index"
                                class="tw-flex tw-items-center tw-space-x-2"
                              >
                                <div
                                  class="tw-w-2 tw-h-2 tw-rounded-full"
                                  :class="getScoreBreakdownColor(item.points)"
                                ></div>
                                <span class="tw-text-gray-600"
                                  >{{ item.label }}:</span
                                >
                                <span class="tw-font-semibold tw-text-gray-800"
                                  >{{ item.points }} pts</span
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <!-- LEAD DETAILS TABLE -->
                  <v-data-table
                    id="coa_table"
                    class="main__table elevation-0 customDataTabel th_customer mb-5"
                    :headers="leadHeaders"
                    :items="leadsDetails"
                    :footer-props="{ 'items-per-page-options': [10, 20] }"
                    hide-default-footer
                    default-sort="false"
                  >
                    <template #[`header.title`]="{ header }">
                      <div class="d-flex align-center pa-0">
                        <div>
                          <th class="pl-2">{{ header.text }}</th>
                        </div>
                      </div>
                    </template>

                    <template #[`item`]="{ item, index }">
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Lead Assigned to
                        </td>
                        <td class="d-flex align-center">
                          <div style="position: relative !important">
                            <v-avatar
                              class="mr-2"
                              size="30px"
                              style="position: absolute !important"
                            >
                              <v-img
                                alt="Avatar"
                                :src="item.user_image_url"
                                v-if="index === 0"
                              />
                            </v-avatar>
                            <span v-if="index === 0" class="ml-9">
                              <a href="#"
                                >{{ item.first_name }} {{ item.last_name }}</a
                              >
                            </span>
                            <span class="span_data" v-else
                              >{{ item.first_name }} {{ item.last_name }}</span
                            >
                          </div>
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Client Type
                        </td>
                        <td class="d-flex align-center">
                          {{ item.client_type }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Service Type
                        </td>
                        <td class="d-flex align-center">
                          {{ item.service_type }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Client Requirements
                        </td>
                        <td class="d-flex align-center">
                          <!-- <v-textarea
                        :value="item?.lead_details?.requirements || '-'"
                        readonly
                        outlined
                        dense
                        auto-grow
                        rows="3"
                        max-rows="4"
                        class="requirements-textarea"
                        style="max-height: 100px; overflow-y: auto; min-height: 80px;"
                        hide-details
                      ></v-textarea> -->
                          {{ item?.lead_details?.requirements || '-' }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Inquiry Date
                        </td>
                        <td class="d-flex align-center">
                          {{
                            (item?.inquiry_date || item?.createdAt)
                              | formatDateWithoutTime
                          }}
                        </td>
                        <td class=""></td>
                      </tr>
                    </template>
                  </v-data-table>

                  <!-- LEAD REQUIREMENT TABLE -->
                  <v-data-table
                    id="coa_table"
                    class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5 tw-hidden"
                    :headers="leadRequirementHeaders"
                    :items="leadsDetails"
                    :footer-props="{ 'items-per-page-options': [10, 20] }"
                    hide-default-footer
                    default-sort="false"
                  >
                    <template #[`header.title`]="{ header }">
                      <div class="d-flex align-center pa-0">
                        <div>
                          <th class="pl-2">{{ header.text }}</th>
                        </div>
                      </div>
                    </template>

                    <template #[`item`]="{}">
                      <!-- Additional lead requirement fields can be added here if needed -->
                    </template>
                  </v-data-table>

                  <!-- LEAD COMPANY DETAILS -->
                  <v-data-table
                    id="coa_table"
                    class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
                    :headers="leadCompanyHeaders"
                    :items="leadsDetails"
                    :footer-props="{ 'items-per-page-options': [10, 20] }"
                    hide-default-footer
                    default-sort="false"
                  >
                    <template #[`header.title`]="{ header }">
                      <div class="d-flex align-center pa-0">
                        <div>
                          <th class="pl-2">{{ header.text }}</th>
                        </div>
                      </div>
                    </template>

                    <template #[`item`]="{ item }">
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Company Name
                        </td>
                        <td class="d-flex align-center">
                          {{ item.company_name ? item.company_name : '-' }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Contact Name
                        </td>
                        <td class="d-flex align-center">
                          {{
                            item.contact_person.name
                              ? item.contact_person.name
                              : '-'
                          }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Phone Number
                        </td>
                        <td class="d-flex align-center">
                          <div style="position: relative !important">
                            <!-- <v-img
                              style="
                                position: absolute !important;
                                width: 30px;
                                bottom: 4px;
                              "
                              alt="Country Flag"
                              :src="getCountryFlag(item.company_phone)"
                            /> -->
                            <span class="tw-text-3xl" v-if="extractCountryFlag(item.company_phone)">
                              {{ extractCountryFlag(item.company_phone) }}
                            </span>
                            <span class="ml-3">{{ item.company_phone }}</span>
                          </div>
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Email Address
                        </td>
                        <td class="d-flex align-center">
                          {{ item.company_email ? item.company_email : '-' }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Company Website
                        </td>
                        <td class="d-flex align-center">
                          {{
                            item.company_website ? item.company_website : '-'
                          }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Business Industry
                        </td>
                        <td class="d-flex align-center">
                          {{
                            item.business_industry
                              ? item.business_industry
                              : 'N/A'
                          }}
                        </td>
                        <td class=""></td>
                      </tr>
                    </template>
                  </v-data-table>

                  <!-- LEAD EXTRA DETAILS TABLE -->
                  <v-data-table
                    id="coa_table"
                    class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
                    :headers="leadExtraDetailsHeaders"
                    :items="leadsDetails"
                    :footer-props="{ 'items-per-page-options': [20, 40] }"
                    hide-default-footer
                    default-sort="false"
                  >
                    <template #[`header.title`]="{ header }">
                      <div class="d-flex align-center pa-0">
                        <div>
                          <th class="pl-2">{{ header.text }}</th>
                        </div>
                      </div>
                    </template>

                    <template #[`item`]="{ item }">
                      <tr
                        v-for="([key, value], i) in Object.entries(
                          item?.lead_details || {}
                        )"
                        :key="i"
                      >
                        <td class="pr-0" style="width: 215px !important">
                          {{ formatKey(key) }}
                        </td>
                        <td class="d-flex align-center">
                          {{ value || '-' }}
                        </td>
                        <td></td>
                      </tr>
                    </template>
                  </v-data-table>

                  <!-- LEAD SCORE TABLE -->
                  <v-data-table
                    id="coa_table"
                    class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
                    :headers="leadScoreHeaders"
                    :items="leadsDetails"
                    :footer-props="{ 'items-per-page-options': [20, 40] }"
                    hide-default-footer
                    default-sort="false"
                  >
                    <template #[`header.title`]="{ header }">
                      <div class="d-flex align-center pa-0">
                        <div>
                          <th class="pl-2">{{ header.text }}</th>
                        </div>
                      </div>
                    </template>

                    <template #[`item`]="{ item }">
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Timeline to Hire
                        </td>
                        <td class="d-flex align-center">
                          {{ item.timeline_to_hire || '-' }}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Engagement Level
                        </td>
                        <td class="d-flex align-center">
                          {{ item.engagement_level || '-' }}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Decision Maker Involvement
                        </td>
                        <td class="d-flex align-center">
                          {{ item.decision_maker_involvement || '-' }}
                        </td>
                        <td></td>
                      </tr>
                    </template>
                  </v-data-table>

                  <!-- MODERN DOCUMENTS GRID -->
                  <div class="tw-mb-5 tw-mt-5">
                    <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
                      <h5
                        class="tw-text-lg tw-font-semibold tw-text-gray-900"
                      >
                        Attached Documents
                      </h5>
                      <!-- Add Document Button -->
                      <v-btn
                        small
                        color="primary"
                        outlined
                        @click="openUploadModal"
                        class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2"
                      >
                        <v-icon small>mdi-plus</v-icon>
                        <span class="tw-text-sm tw-font-medium">Add Document</span>
                      </v-btn>
                    </div>

                    <!-- No Documents State -->
                    <div
                      v-if="
                        !leadsDetails[0]?.documents ||
                        leadsDetails[0].documents.length === 0
                      "
                      class="tw-text-center tw-py-8 tw-bg-gray-50 tw-rounded-lg"
                    >
                      <v-icon size="48" color="grey lighten-1" class="tw-mb-3"
                        >mdi-file-document-outline</v-icon
                      >
                      <p class="tw-text-gray-500 tw-text-sm">
                        No documents attached
                      </p>
                    </div>

                    <!-- Documents Grid -->
                    <div
                      v-else
                      class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4"
                    >
                      <!-- Loading State for Document Types -->
                      <div
                        v-if="documentTypesLoading"
                        class="tw-col-span-full tw-text-center tw-py-8 tw-bg-gray-50 tw-rounded-lg"
                      >
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="32"
                          class="tw-mb-3"
                        ></v-progress-circular>
                        <p class="tw-text-gray-500 tw-text-sm">
                          Loading document types...
                        </p>
                      </div>

                      <!-- Documents when types are loaded -->
                      <template v-else>
                        <div
                          v-for="(document, index) in leadsDetails[0].documents"
                          :key="`doc-${index}`"
                          class="document-card tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-shadow-sm tw-transition-all tw-duration-300 tw-cursor-pointer hover:tw-shadow-lg hover:tw-border-blue-300 hover:tw-bg-blue-50"
                          @click="openDocument(document)"
                        >
                          <!-- Document Header -->
                          <div
                            class="tw-flex tw-items-start tw-justify-between tw-mb-3"
                          >
                            <div
                              class="tw-flex tw-items-start tw-gap-3 tw-flex-1 tw-min-w-0"
                            >
                              <div class="tw-flex-shrink-0 tw-mt-1">
                                <v-icon
                                  :color="getDocumentIconColor(document.type)"
                                  size="32"
                                  class="document-icon"
                                >
                                  {{ getDocumentIcon(document.type) }}
                                </v-icon>
                              </div>
                              <div class="tw-flex-1 tw-min-w-0">
                                <h6
                                  class="tw-text-sm tw-font-semibold tw-text-gray-900 tw-leading-tight tw-break-words tw-line-clamp-2"
                                >
                                  {{ getDocumentDisplayName(document) }}
                                </h6>
                              </div>
                            </div>

                            <!-- Download Button -->
                            <v-btn
                              small
                              icon
                              color="primary"
                              @click.stop="downloadDocument(document)"
                              :loading="downloadingDoc === document._id"
                              class="tw-flex-shrink-0 tw-ml-2 hover:tw-bg-blue-100"
                            >
                              <v-icon size="18">mdi-download</v-icon>
                            </v-btn>
                          </div>

                          <!-- Document Type Badge -->
                          <div class="tw-mb-3">
                            <v-chip

                              text-color="black"
                              x-small
                              class="tw-font-medium"
                            >
                              {{ getDocumentTypeLabel(document) }}
                            </v-chip>
                          </div>

                          <!-- Document Details -->
                          <div class="tw-space-y-2 tw-text-xs tw-text-gray-600">
                            <div class="tw-flex tw-justify-between">
                              <span>Size:</span>
                              <span>{{ formatFileSize(document.size) }}</span>
                            </div>
                            <div class="tw-flex tw-justify-between">
                              <span>Uploaded:</span>
                              <span>{{ formatDate(document.createdAt) }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </v-tab-item>

                <v-tab-item :value="'tasks'">
                  <LeadsPipelineTasks
                    :key="computedDetails?.status"
                    :lead-details="computedDetails"
                  />
                </v-tab-item>

                <v-tab-item :value="'kyc-details'" v-if="computedDetails.kyc_details && computedDetails.kyc_details.clientType && computedDetails.kyc_details.clientType.length > 0">
                  <KYCDetails
                    :process_id="process_id"
                    :lead_data="computedDetails"
                  />
                </v-tab-item>

                <v-tab-item :value="'notes'">
                  <LeadsPipelineNotes
                    :key="computedDetails?.status"
                    :lead-details="computedDetails"
                  />
                </v-tab-item>
              </v-tabs-items>
            </v-card-text>
          </v-card>
        </v-col>
      </template>
      <template v-else>
        <v-col cols="12">
          <EditLeadsModel
            :selectedLeads="leadsDetails"
            :handleModel="handleEditLead"
            :isEditMode="true"
            @close="updateLeadsData()"
          />
        </v-col>
      </template>
    </v-row>

    <!-- Upload Documents Modal -->
    <UploadDocuments
      v-if="showUploadModal"
      :uploadDocuments="showUploadModal"
      :requiredDocuments="[]"
      :module="'leads'"
      :identifier="'leads'"
      :foreign_id="process_id"
      @close="closeUploadModal"
      @successfull="handleDocumentUploadSuccess"
      @update:uploadDocuments="handleUploadDocumentsUpdate"
      :key="'upload-docs-lead-' + process_id"
    />

    <!-- Snack -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false" small
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import EditSvg from '@/assets/images/Customer/edit.svg'
import InfoSVG from '@/assets/images/Customer/info.svg'
import FlagSVG from '@/assets/images/FlagUae.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import EditLeadsModel from '~/components/EditModel/editLeads.vue'
import UploadDocuments from '@/components/ProcessFlow/UploadDocuments/index.vue'
import LeadsPipelineTasks from '@/components/Leads/PipelineTasks.vue'
import LeadsPipelineNotes from '@/components/Leads/PipelineNotes.vue'
import KYCDetails from '@/components/ProcessFlow/ProcessDetails/KYCDetails.vue'
import countries from 'countries-list'

export default {
  components: {
    InfoSVG,
    customerDefaultIcon,
    FlagSVG,
    EditSvg,
    EditLeadsModel,
    UploadDocuments,
    LeadsPipelineTasks,
    LeadsPipelineNotes,
    KYCDetails,
  },
  props: {
    process_id: String,
  },
  computed: {
    computedDetails() {
      return this.leadsDetails.length ? this.leadsDetails[0] : {}
    },
  },
  data() {
    return {
      loading: false,
      leadsDetails: [],
      tab: 'tasks',
      documentTypes: [], // Store document types from API
      documentTypesLoading: false,
      leadRequirementHeaders: [
        {
          text: 'LEAD REQUIREMENT',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadCompanyHeaders: [
        {
          text: 'COMPANY DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadExtraDetailsHeaders: [
        {
          text: 'LEAD DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadScoreHeaders: [
        {
          text: 'LEAD SCORE',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      leadHeaders: [
        {
          text: 'DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      documentsHeaders: [
        {
          text: 'ATTACHED DOCUMENTS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      showEditModel: false,
      snack: false,
      snackColor: '',
      snackText: '',
      downloadingDoc: null,
      documentTypes: {}, // Cache for document type names
      countryCodes: [],
      countries: countries.countries,
      showUploadModal: false,
    }
  },
  mounted() {
    this.getLeadDetails(this.process_id)
    this.fetchDocumentTypes()
    this.initializeCountryCodes()

    // Listen for KYC data updates
    this.$nuxt.$on('kyc-data-updated', this.handleKycDataUpdate)
  },

  beforeDestroy() {
    // Clean up event listener
    this.$nuxt.$off('kyc-data-updated', this.handleKycDataUpdate)
  },
  methods: {
    initializeCountryCodes() {
      const countryCodes = Object.keys(countries.countries).map((code) => ({
        name: countries.countries[code].name,
        code: countries.countries[code].phone,
        emoji: countries.countries[code].emoji || '',
        iso2: code,
      }))
      this.countryCodes = countryCodes.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    },
    extractCountryCode(phoneNumber) {
      // Normalize phone number to ensure it starts with '+'
      if (!phoneNumber.startsWith('+')) {
        return [null, phoneNumber, null]
        return [null]
      }

      // Sort country codes by length descending to match the longest one first
      // const sortedCodes = [...countryCodes].sort((a, b) => b.length - a.length);

      for (const { code, iso2, emoji } of this.countryCodes) {
        if (phoneNumber.startsWith(`+${code}`)) {
          const numberWithoutCode = phoneNumber.slice(code.length)
          // return [code, numberWithoutCode, iso2, emoji]
          return [emoji]
        }
      }

      return [null]
    },
    extractCountryFlag(phoneNumber) {
      // Normalize phone number to ensure it starts with '+'
      if (!phoneNumber.startsWith('+')) {
        return [null, phoneNumber, null]
        return null
      }

      // Sort country codes by length descending to match the longest one first
      // const sortedCodes = [...countryCodes].sort((a, b) => b.length - a.length);

      for (const { code, iso2, emoji } of this.countryCodes) {
        if (phoneNumber.startsWith(`+${code}`)) {
          const numberWithoutCode = phoneNumber.slice(code.length)
          // return [code, numberWithoutCode, iso2, emoji]
          return emoji
        }
      }

      return null
    },
    formatKey(key) {
      // Special handling for specific fields
      if (key === 'deal_size') {
        return 'Employee Count'
      }
      return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    },

    // Phone number country flag detection
    getCountryFlag(phoneNumber) {
      if (!phoneNumber) return '/FlagUae.png' // Default to UAE flag

      // Remove spaces and ensure it starts with +
      const cleanPhone = phoneNumber.replace(/\s+/g, '')

      // Country code mappings with their flag images
      const countryFlags = {
        '+971': '/FlagUae.png', // UAE
        '+1': '/FlagUsa.png', // USA/Canada
        '+44': '/FlagUk.png', // UK
        '+91': '/FlagIndia.png', // India
        '+966': '/FlagSaudi.png', // Saudi Arabia
        '+974': '/FlagQatar.png', // Qatar
        '+965': '/FlagKuwait.png', // Kuwait
        '+973': '/FlagBahrain.png', // Bahrain
        '+968': '/FlagOman.png', // Oman
        '+20': '/FlagEgypt.png', // Egypt
        '+962': '/FlagJordan.png', // Jordan
        '+961': '/FlagLebanon.png', // Lebanon
        '+254': '/FlagUae.png', // Kenya (placeholder flag)
        '+234': '/FlagUae.png', // Nigeria (placeholder flag)
        '+27': '/FlagUae.png', // South Africa (placeholder flag)
        '+256': '/FlagUae.png', // Uganda (placeholder flag)
        '+255': '/FlagUae.png', // Tanzania (placeholder flag)
        '+250': '/FlagUae.png', // Rwanda (placeholder flag)
        '+233': '/FlagUae.png', // Ghana (placeholder flag)
        '+212': '/FlagUae.png', // Morocco (placeholder flag)
        '+213': '/FlagUae.png', // Algeria (placeholder flag)
        '+216': '/FlagUae.png', // Tunisia (placeholder flag)
      }

      // Check for country codes (sort by length to match longest first)
      const sortedCodes = Object.keys(countryFlags).sort(
        (a, b) => b.length - a.length
      )

      for (const code of sortedCodes) {
        if (cleanPhone.startsWith(code)) {
          return countryFlags[code]
        }
      }

      return '/FlagUae.png' // Default fallback
    },

    // Document handling methods
    async fetchDocumentTypes() {
      if (this.documentTypes.length > 0) return // Already loaded

      try {
        this.documentTypesLoading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const response = await this.$axios.$get('/documenttypes', {
          headers: { Authorization: AuthStr },
        })
        this.documentTypes = response || []
      } catch (error) {
        console.warn('Failed to fetch document types:', error)
        this.documentTypes = []
      } finally {
        this.documentTypesLoading = false
      }
    },

    getDocumentTypeName(typeId) {
      // If document types are still loading, return null to prevent ObjectId display
      if (this.documentTypesLoading || !this.documentTypes.length) {
        return null
      }

      if (!typeId) return null

      const docType = this.documentTypes.find((dt) => dt._id === typeId)
      return docType ? docType.name : null
    },

    isDocumentTypeId(type) {
      // Check if the type is a MongoDB ObjectId (24 character hex string)
      return type && /^[0-9a-fA-F]{24}$/.test(type)
    },

    getDocumentIcon(type) {
      // If document types are still loading, return default icon
      if (this.documentTypesLoading) {
        return 'mdi-file-document-outline'
      }

      const iconMap = {
        pdf: 'mdi-file-pdf-box',
        doc: 'mdi-file-word-box',
        docx: 'mdi-file-word-box',
        xls: 'mdi-file-excel-box',
        xlsx: 'mdi-file-excel-box',
        ppt: 'mdi-file-powerpoint-box',
        pptx: 'mdi-file-powerpoint-box',
        jpg: 'mdi-image',
        jpeg: 'mdi-image',
        png: 'mdi-image',
        gif: 'mdi-image',
        txt: 'mdi-file-document-outline',
        zip: 'mdi-folder-zip',
        rar: 'mdi-folder-zip',
        certificate: 'mdi-certificate',
        license: 'mdi-license',
        contract: 'mdi-file-document-edit',
        proposal: 'mdi-file-document-edit',
        agreement: 'mdi-handshake',
        invoice: 'mdi-receipt',
        receipt: 'mdi-receipt',
        tax: 'mdi-file-document-edit',
        vat: 'mdi-file-document-edit',
        labourcardnumber: 'mdi-card-account-details',
        evisa: 'mdi-passport',
        entrystamp: 'mdi-stamp',
        renewalinvoice: 'mdi-receipt',
        cancellationdocuments: 'mdi-file-cancel',
        tradelicense: 'mdi-license',
        'stampede-visa': 'mdi-passport',
        labourcancellationsignature: 'mdi-signature',
        molwpsnumber: 'mdi-card-account-details',
        workorder: 'mdi-file-document-edit',
        signedworkorder: 'mdi-file-document-edit',
        molofferletter: 'mdi-file-document-edit',
        personcode: 'mdi-card-account-details',
        residencecancellation: 'mdi-file-cancel',
        applicationform: 'mdi-file-document-edit',
        changeofstatus: 'mdi-file-document-edit',
        healthinsuranceapplication: 'mdi-file-document-edit',
        visacancellation: 'mdi-file-cancel',
        emiratesidcopy: 'mdi-card-account-details',
        medicalcardissuance: 'mdi-file-document-edit',
        'paymentreceived-renewalcomplete': 'mdi-check-circle',
        labourcontract: 'mdi-file-document-edit',
        residencyapproval: 'mdi-check-circle',
        emiratesidissuance: 'mdi-card-account-details',
        ejaribill: 'mdi-receipt',
        medical: 'mdi-heart-pulse',
        emiratesidapplication: 'mdi-card-account-details',
        contractrenewalsignature: 'mdi-signature',
        labourcancellationtyping: 'mdi-file-document-edit',
        employmentcontract: 'mdi-file-document-edit',
        signedInternalEmploymentContract: 'mdi-file-document-edit',
        dewabill: 'mdi-receipt',
        invoicepaid: 'mdi-check-circle',
        emiratesidcapture: 'mdi-card-account-details',
        tawjeehtrainingcompleted: 'mdi-school',
        contractrenewalaggreement: 'mdi-handshake',
        temporarylabourcard: 'mdi-card-account-details',
        academiccertificate: 'mdi-school',
        passportsizephoto: 'mdi-image',
        stampedresidencevisa: 'mdi-passport',
        tawjeehtraining: 'mdi-school',
        labourcancellationapproval: 'mdi-check-circle',
        proposal: 'mdi-file-document-edit',
        emiratesid: 'mdi-card-account-details',
        letters: 'mdi-email',
        signedeoss: 'mdi-signature',
        resignation: 'mdi-file-cancel',
        resignationletter: 'mdi-file-document-edit',
        signedeosb: 'mdi-signature',
        molcancellationapplication: 'mdi-file-document-edit',
        labourcancellation: 'mdi-file-cancel',
        residencycancellation: 'mdi-file-cancel',
        kycform: 'mdi-account-check',
        iloe: 'mdi-account-check',
        salarytransferletter: 'mdi-file-document-edit',
        salaryclearanceletter: 'mdi-file-document-edit',
        signedproposal: 'mdi-signature',
        signedserviceagreement: 'mdi-signature',
        serviceagreement: 'mdi-handshake',
      }

      if (!type) return 'mdi-file-document-outline'

      // If type is an ID, try to get the document type name
      if (this.isDocumentTypeId(type)) {
        const docTypeName = this.getDocumentTypeName(type)
        if (docTypeName) {
          const docTypeKey = docTypeName.toLowerCase().replace(/\s+/g, '')
          if (iconMap[docTypeKey]) {
            return iconMap[docTypeKey]
          }
        }
        // If we can't resolve the type name, return default icon
        return 'mdi-file-document-outline'
      }

      // First check for exact matches
      const extension = type.toLowerCase()
      if (iconMap[extension]) {
        return iconMap[extension]
      }

      // Check if the type contains any keywords
      for (const [keyword, icon] of Object.entries(iconMap)) {
        if (extension.includes(keyword)) {
          return icon
        }
      }

      return 'mdi-file-document-outline'
    },

    getDocumentIconColor(type) {
      // If document types are still loading, return default color
      if (this.documentTypesLoading) {
        return '#6B7280' // Default gray color
      }

      const colorMap = {
        pdf: '#E53E3E', // Red for PDF
        doc: '#2B6CB0', // Blue for Word
        docx: '#2B6CB0',
        xls: '#38A169', // Green for Excel
        xlsx: '#38A169',
        ppt: '#D69E2E', // Orange for PowerPoint
        pptx: '#D69E2E',
        jpg: '#9F7AEA', // Purple for images
        jpeg: '#9F7AEA',
        png: '#9F7AEA',
        gif: '#9F7AEA',
        txt: '#4A5568', // Gray for text
        zip: '#6B46C1', // Purple for archives
        rar: '#6B46C1',
        certificate: '#059669', // Emerald for certificates
        license: '#059669',
        contract: '#2563EB', // Blue for contracts
        proposal: '#2563EB',
        agreement: '#7C3AED', // Purple for agreements
        invoice: '#DC2626', // Red for invoices
        receipt: '#DC2626',
        tax: '#EA580C', // Orange for tax documents
        vat: '#EA580C',
        kyc: '#0891B2', // Cyan for KYC
        passport: '#059669', // Emerald for passports
        visa: '#059669',
        id: '#0891B2', // Cyan for IDs
        incorporation: '#7C2D12', // Brown for incorporation
        registration: '#7C2D12',
        // Document type specific colors
        labourcardnumber: '#0891B2',
        evisa: '#059669',
        entrystamp: '#D97706',
        renewalinvoice: '#DC2626',
        cancellationdocuments: '#DC2626',
        tradelicense: '#059669',
        'stampede-visa': '#059669',
        labourcancellationsignature: '#7C3AED',
        molwpsnumber: '#0891B2',
        workorder: '#2563EB',
        signedworkorder: '#2563EB',
        molofferletter: '#2563EB',
        personcode: '#0891B2',
        residencecancellation: '#DC2626',
        applicationform: '#2563EB',
        changeofstatus: '#7C3AED',
        healthinsuranceapplication: '#DC2626',
        visacancellation: '#DC2626',
        emiratesidcopy: '#0891B2',
        medicalcardissuance: '#DC2626',
        'paymentreceived-renewalcomplete': '#059669',
        labourcontract: '#2563EB',
        residencyapproval: '#059669',
        emiratesidissuance: '#0891B2',
        ejaribill: '#DC2626',
        medical: '#DC2626',
        emiratesidapplication: '#0891B2',
        contractrenewalsignature: '#7C3AED',
        labourcancellationtyping: '#2563EB',
        employmentcontract: '#2563EB',
        signedInternalEmploymentContract: '#2563EB',
        dewabill: '#DC2626',
        invoicepaid: '#059669',
        emiratesidcapture: '#0891B2',
        tawjeehtrainingcompleted: '#059669',
        contractrenewalaggreement: '#7C3AED',
        temporarylabourcard: '#0891B2',
        academiccertificate: '#059669',
        passportsizephoto: '#9F7AEA',
        stampedresidencevisa: '#059669',
        tawjeehtraining: '#059669',
        labourcancellationapproval: '#059669',
        proposal: '#2563EB',
        emiratesid: '#0891B2',
        letters: '#9F7AEA',
        signedeoss: '#7C3AED',
        resignation: '#DC2626',
        resignationletter: '#2563EB',
        signedeosb: '#7C3AED',
        molcancellationapplication: '#2563EB',
        labourcancellation: '#DC2626',
        residencycancellation: '#DC2626',
        kycform: '#0891B2',
        iloe: '#0891B2',
        salarytransferletter: '#2563EB',
        salaryclearanceletter: '#2563EB',
        signedproposal: '#7C3AED',
        signedserviceagreement: '#7C3AED',
        serviceagreement: '#7C3AED',
      }

      if (!type) return '#6B7280' // Default gray

      // If type is an ID, try to get the document type name
      if (this.isDocumentTypeId(type)) {
        const docTypeName = this.getDocumentTypeName(type)
        if (docTypeName) {
          const docTypeKey = docTypeName.toLowerCase().replace(/\s+/g, '')
          if (colorMap[docTypeKey]) {
            return colorMap[docTypeKey]
          }
        }
        // If we can't resolve the type name, return default color
        return '#6B7280'
      }

      // First check for exact matches
      const extension = type.toLowerCase()
      if (colorMap[extension]) {
        return colorMap[extension]
      }

      // Check if the type contains any keywords
      for (const [keyword, color] of Object.entries(colorMap)) {
        if (extension.includes(keyword)) {
          return color
        }
      }

      return '#6B7280' // Default gray
    },

    formatDocumentType(type) {
      if (!type) return 'Document'
      return type.toUpperCase()
    },

    formatDate(dateString) {
      if (!dateString) return ''

      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch (error) {
        return ''
      }
    },

    formatStatus(status) {
      if (!status) return ''
      return status.charAt(0).toUpperCase() + status.slice(1)
    },

    getStatusClass(status) {
      const statusClasses = {
        active: 'tw-bg-green-100 tw-text-green-800',
        pending: 'tw-bg-yellow-100 tw-text-yellow-800',
        completed: 'tw-bg-blue-100 tw-text-blue-800',
        expired: 'tw-bg-red-100 tw-text-red-800',
        draft: 'tw-bg-gray-100 tw-text-gray-800',
      }

      return (
        statusClasses[status?.toLowerCase()] ||
        'tw-bg-gray-100 tw-text-gray-800'
      )
    },

    openDocument(doc) {
      if (!doc.url) {
        this.showSnackbar('Document URL not available', 'error')
        return
      }

      // Open document in new tab
      window.open(doc.url, '_blank')
    },

    async downloadDocument(doc) {
      if (!doc.url) {
        this.showSnackbar('Document URL not available', 'error')
        return
      }

      try {
        this.downloadingDoc = doc._id

        // Create a temporary link element and trigger download
        const link = document.createElement('a')
        link.href = doc.url
        link.download = doc.name || 'document'
        link.target = '_blank'

        // For security, check if URL is external
        if (
          doc.url.startsWith('http') &&
          !doc.url.includes(window.location.origin)
        ) {
          // External URL - open in new tab
          window.open(doc.url, '_blank')
        } else {
          // Internal URL - trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        this.showSnackbar('Document download started', 'success')
      } catch (error) {
        console.error('Error downloading document:', error)
        this.showSnackbar('Failed to download document', 'error')
      } finally {
        this.downloadingDoc = null
      }
    },

    showSnackbar(message, color) {
      this.snack = true
      this.snackText = message
      this.snackColor = color
    },
    async getLeadDetails(id) {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          '/leads/details/leadsid',
          { leads_id: id },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (response) => {
          this.loading = false
          this.leadsDetails = response || []

          // Fetch document type names for all documents
          if (
            this.leadsDetails[0]?.documents &&
            this.leadsDetails[0].documents.length > 0
          ) {
            await this.fetchDocumentTypeNames()
          }
        })
    },
    // Fetch document type names for all documents
    async fetchDocumentTypeNames() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      for (const document of this.leadsDetails[0].documents) {
        if (document.type && !this.documentTypes[document.type]) {
          try {
            const response = await this.$axios.$get(
              `/documenttypes/doctype/${document.type}`,
              {
                headers: { Authorization: AuthStr },
              }
            )
            this.documentTypes[document.type] = response.name
          } catch (error) {
            console.error('Error fetching document type:', error)
            this.documentTypes[document.type] = 'Unknown'
          }
        }
      }
    },
    handleEditLead() {
      this.showEditModel = !this.showEditModel
    },
    handleEditModel() {
      this.showEditModel = !this.showEditModel
    },
    async updateLeadsData() {
      this.showEditModel = !this.showEditModel
      this.snack = true
      this.snackColor = 'green'
      this.snackText = 'Lead Updated Successfully!'

      // Show loading state while refetching data
      this.loading = true
      await this.getLeadDetails(this.process_id)
      this.loading = false

      // Emit events to notify parent components
      this.$nuxt.$emit('LeadsListClicked', this.leadsDetails)
      this.$nuxt.$emit('lead-data-updated', {
        leadId: this.process_id,
        action: 'update',
      })
    },
    getDocumentDisplayName(document) {
      // If document type is not loaded yet, return empty string instead of ObjectId
      if (!document.type || this.isDocumentTypeId(document.type)) {
        const docTypeName = this.getDocumentTypeName(document.type)
        if (!docTypeName) {
          return '' // Return empty string instead of ObjectId
        }
        return docTypeName
      }

      // If type is already a string name, return it
      return document.type || ''
    },
    getDocumentTypeLabel(document) {
      // If document type is not loaded yet, return empty string instead of ObjectId
      if (!document.type || this.isDocumentTypeId(document.type)) {
        const docTypeName = this.getDocumentTypeName(document.type)
        if (!docTypeName) {
          return '' // Return empty string instead of ObjectId
        }
        return docTypeName
      }

      // If type is already a string name, return it
      return document.type || ''
    },

    getDocumentTypeBadgeColor(type) {
      // If document types are still loading, return default color
      if (this.documentTypesLoading) {
        return 'grey'
      }

      // If type is an ID, try to get the document type name
      if (this.isDocumentTypeId(type)) {
        const docTypeName = this.getDocumentTypeName(type)
        if (docTypeName) {
          // Return appropriate color based on document type name
          if (docTypeName.toLowerCase().includes('proposal')) {
            return 'blue'
          } else if (docTypeName.toLowerCase().includes('agreement')) {
            return 'purple'
          } else if (docTypeName.toLowerCase().includes('contract')) {
            return 'indigo'
          } else if (docTypeName.toLowerCase().includes('invoice')) {
            return 'red'
          } else if (docTypeName.toLowerCase().includes('certificate')) {
            return 'green'
          }
        }
        // If we can't resolve the type name, return default color
        return 'grey'
      }

      // If type is already a string, determine color
      const typeLower = type.toLowerCase()
      if (typeLower.includes('proposal')) {
        return 'blue'
      } else if (typeLower.includes('agreement')) {
        return 'purple'
      } else if (typeLower.includes('contract')) {
        return 'indigo'
      } else if (typeLower.includes('invoice')) {
        return 'red'
      } else if (typeLower.includes('certificate')) {
        return 'green'
      }

      return 'grey' // Default color
    },

    formatFileSize(bytes) {
      if (!bytes) return 'Unknown'

      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Bytes'

      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return (
        Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
      )
    },

    formatDate(date) {
      if (!date) return ''
      try {
        // Use moment for better formatting
        const moment = require('moment')
        return moment(date).format('MMM DD, YYYY, h:mm A')
      } catch (error) {
        // Fallback to native date formatting
        try {
          return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        } catch (fallbackError) {
          return ''
        }
      }
    },
    calculateLeadScore(lead) {
      let score = 0

      // 1. Employee Count (deal_size)
      switch (lead.lead_details?.deal_size) {
        case '1-10':
        case '1 - 10':
          score += 10
          break
        case '11-50':
        case '11 - 50':
          score += 15
          break
        case '51-100':
        case '51 - 100':
          score += 20
          break
        case '51-200':
        case '51 - 200':
          score += 25
          break
        case '100+':
        case '200+':
          score += 25
          break
      }

      // 2. Region of Interest (eor_requirements)
      switch (lead.lead_details?.eor_requirements) {
        case 'UAE EOR':
          score += 25
          break
        case 'Mission Visa UAE':
          score += 15
          break
        case 'GCC EOR':
        case 'Various':
          score += 10
          break
      }

      // 3. Timeline to Hire
      switch (lead.timeline_to_hire) {
        case '0-1 month':
          score += 20
          break
        case '1-3 months':
          score += 15
          break
        case '3-6 months':
          score += 10
          break
        case '6-12 months':
          score += 5
          break
        case '12+ months':
          score += 0
          break
      }

      // 4. Engagement Level
      switch (lead.engagement_level) {
        case 'Higly Engaged': // Handle the typo in the enum
        case 'Highly Engaged':
          score += 15
          break
        case 'Occasional':
          score += 10
          break
        case 'Low':
          score += 5
          break
      }

      // 5. Decision Maker Involvement
      switch (lead.decision_maker_involvement) {
        case 'Direct Contact With Decision Maker':
          score += 15
          break
        case 'Indirect or Unsure':
          score += 5
          break
      }

      return score
    },
    getLeadScoreColor(lead) {
      const score = this.calculateLeadScore(lead)
      if (score >= 80) return 'red' // Hot Lead
      if (score >= 60) return 'orange' // Warm Lead
      if (score >= 40) return 'blue' // Cold Lead
      return 'grey' // Unqualified/Archive
    },
    getPriorityLevel(lead) {
      const score = this.calculateLeadScore(lead)
      if (score >= 80) return 'Hot Lead'
      if (score >= 60) return 'Warm Lead'
      if (score >= 40) return 'Cold Lead'
      return 'Unqualified/Archive'
    },
    getProgressBarColor(lead) {
      const score = this.calculateLeadScore(lead)
      if (score >= 80) return 'tw-bg-red-500'
      if (score >= 60) return 'tw-bg-orange-500'
      if (score >= 40) return 'tw-bg-blue-500'
      return 'tw-bg-gray-500'
    },
    getScoreBreakdown(lead) {
      const breakdown = []

      // Employee Count
      let dealSizePoints = 0
      switch (lead.lead_details?.deal_size) {
        case '1-10':
        case '1 - 10':
          dealSizePoints = 10
          break
        case '11-50':
        case '11 - 50':
          dealSizePoints = 15
          break
        case '51-100':
        case '51 - 100':
          dealSizePoints = 20
          break
        case '51-200':
        case '51 - 200':
          dealSizePoints = 25
          break
        case '100+':
        case '200+':
          dealSizePoints = 25
          break
      }
      if (dealSizePoints > 0) {
        breakdown.push({ label: 'Employee Count', points: dealSizePoints })
      }

      // Region of Interest
      let eorPoints = 0
      switch (lead.lead_details?.eor_requirements) {
        case 'UAE EOR':
          eorPoints = 25
          break
        case 'Mission Visa UAE':
          eorPoints = 15
          break
        case 'GCC EOR':
        case 'Various':
          eorPoints = 10
          break
      }
      if (eorPoints > 0) {
        breakdown.push({ label: 'Region of Interest', points: eorPoints })
      }

      // Timeline to Hire
      let timelinePoints = 0
      switch (lead.timeline_to_hire) {
        case '0-1 month':
          timelinePoints = 20
          break
        case '1-3 months':
          timelinePoints = 15
          break
        case '3-6 months':
          timelinePoints = 10
          break
        case '6-12 months':
          timelinePoints = 5
          break
        case '12+ months':
          timelinePoints = 0
          break
      }
      if (timelinePoints > 0) {
        breakdown.push({ label: 'Timeline to Hire', points: timelinePoints })
      }

      // Engagement Level
      let engagementPoints = 0
      switch (lead.engagement_level) {
        case 'Higly Engaged':
        case 'Highly Engaged':
          engagementPoints = 15
          break
        case 'Occasional':
          engagementPoints = 10
          break
        case 'Low':
          engagementPoints = 5
          break
      }
      if (engagementPoints > 0) {
        breakdown.push({ label: 'Engagement Level', points: engagementPoints })
      }

      // Decision Maker Involvement
      let decisionPoints = 0
      switch (lead.decision_maker_involvement) {
        case 'Direct Contact With Decision Maker':
          decisionPoints = 15
          break
        case 'Indirect or Unsure':
          decisionPoints = 5
          break
      }
      if (decisionPoints > 0) {
        breakdown.push({
          label: 'Decision Maker Involvement',
          points: decisionPoints,
        })
      }

      return breakdown
    },
    getScoreBreakdownColor(points) {
      if (points >= 20) return 'tw-bg-green-500'
      if (points >= 15) return 'tw-bg-blue-500'
      if (points >= 10) return 'tw-bg-yellow-500'
      if (points >= 5) return 'tw-bg-orange-500'
      return 'tw-bg-gray-300'
    },
    getPriorityTextColor(lead) {
      const score = this.calculateLeadScore(lead)
      if (score >= 80) return 'tw-text-red-800'
      if (score >= 60) return 'tw-text-orange-800'
      if (score >= 40) return 'tw-text-blue-800'
      return 'tw-text-gray-800'
    },

    // Upload Modal Methods
    openUploadModal() {
      console.log('=== OPENING UPLOAD MODAL ===');
      console.log('leadsDetails:', this.leadsDetails);
      console.log('leadsDetails[0]:', this.leadsDetails[0]);
      console.log('leadsDetails[0]?._id:', this.leadsDetails[0]?._id);
      console.log('process_id:', this.process_id);
      this.showUploadModal = true
    },

    closeUploadModal() {
      console.log('=== CLOSING UPLOAD MODAL ===');
      this.showUploadModal = false

      // Refetch lead details to ensure we have the latest data
      // This handles cases where documents might have been uploaded
      this.getLeadDetails(this.process_id)
    },

    handleDocumentUploadSuccess() {
      this.showUploadModal = false
      this.showSnackbar('Document uploaded successfully!', 'success')

      // Refresh lead details to show the new document
      this.getLeadDetails(this.process_id)

      // Emit event to notify parent components
      this.$nuxt.$emit('lead-data-updated', {
        leadId: this.process_id,
        action: 'document_uploaded',
      })
    },

    handleUploadDocumentsUpdate(value) {
      this.showUploadModal = value
    },

    // Handle KYC data updates
    async handleKycDataUpdate(eventData) {
      if (eventData.leadId === this.process_id) {
        // Refresh lead details to get updated KYC data
        await this.getLeadDetails(this.process_id)

        // Show success message
        this.snack = true
        this.snackColor = 'green'
        this.snackText = 'KYC Details Updated Successfully!'
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.requirements-textarea {
  .v-text-field__details {
    display: none; // Hide the details line
  }

  .v-input__slot {
    min-height: 60px;
    max-height: 100px;
    overflow-y: auto;
  }

  // Ensure consistent width
  width: 100%;
  max-width: 400px;
}

// Ensure table cells maintain proper alignment
.v-data-table td {
  vertical-align: top;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
  height: unset !important;
}

// Add extra spacing for requirements fields specifically
.v-data-table td .requirements-textarea {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
