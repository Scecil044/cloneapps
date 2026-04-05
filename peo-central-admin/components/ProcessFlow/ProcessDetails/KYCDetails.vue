<template>
  <div>
    <v-row>
      <template v-if="!showEditModel">
        <v-col cols="12" v-if="loading && !kycDetails">
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
              <!-- KYC Status Header -->
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
                            :color="getKycStatusColor()"
                            size="32"
                          >
                            mdi-account-check
                          </v-icon>
                        </div>
                        <div>
                          <h3
                            class="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-1"
                          >
                            KYC Status:
                            <span :class="getKycStatusTextColor()" class="tw-font-semibold">
                              {{ getKycStatus() }}
                            </span>
                          </h3>
                          <p class="tw-text-sm tw-text-gray-600 tw-mb-2">
                            Submitted: {{ formatDate(kycDetails?.submittedAt) }}
                          </p>
                        </div>
                      </div>

                      <!-- Edit Button -->
                      <div class="tw-flex tw-items-center tw-space-x-2">
                        <v-btn
                          v-if="kycDetails && Object.keys(kycDetails).length > 0"
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
                        <v-btn
                          v-else
                          color="primary"
                          @click="handleEditModel()"
                        >
                          <v-icon left>mdi-plus</v-icon>
                          Start KYC
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- KYC Details Display -->
              <div v-if="kycDetails && Object.keys(kycDetails).length > 0">
                <!-- Client Information -->
                <v-data-table
                  id="coa_table"
                  class="main__table elevation-0 customDataTabel th_customer mb-5"
                  :headers="clientInfoHeaders"
                  :items="[{ data: kycDetails }]"
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
                        Client Type
                      </td>
                      <td class="d-flex align-center">
                        {{ formatClientType(item.data.clientType) }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr>
                      <td class="pr-0" style="width: 215px !important">
                        {{ item.data.clientType === 'individual' ? 'Full Name' : 'Registered Name' }}
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.fullName || '-' }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.tradingName">
                      <td class="pr-0" style="width: 215px !important">
                        Trading Name
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.tradingName }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr>
                      <td class="pr-0" style="width: 215px !important">
                        Email
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.email || '-' }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr>
                      <td class="pr-0" style="width: 215px !important">
                        Phone
                      </td>
                      <td class="d-flex align-center">
                        <div style="position: relative !important">
                          <span class="tw-text-3xl" v-if="extractCountryFlag(item.data.phone)">
                            {{ extractCountryFlag(item.data.phone) }}
                          </span>
                          <span class="ml-3">{{ item.data.phone || '-' }}</span>
                        </div>
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.mobile">
                      <td class="pr-0" style="width: 215px !important">
                        Mobile
                      </td>
                      <td class="d-flex align-center">
                        <div style="position: relative !important">
                          <span class="tw-text-3xl" v-if="extractCountryFlag(item.data.mobile)">
                            {{ extractCountryFlag(item.data.mobile) }}
                          </span>
                          <span class="ml-3">{{ item.data.mobile }}</span>
                        </div>
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.nationality">
                      <td class="pr-0" style="width: 215px !important">
                        Nationality
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.nationality }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.dateOfBirth">
                      <td class="pr-0" style="width: 215px !important">
                        Date of Birth
                      </td>
                      <td class="d-flex align-center">
                        {{ formatDate(item.data.dateOfBirth) }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.gender">
                      <td class="pr-0" style="width: 215px !important">
                        Gender
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.gender }}
                      </td>
                      <td class=""></td>
                    </tr>
                  </template>
                </v-data-table>

                <!-- Address Information -->
                <v-data-table
                  id="coa_table"
                  class="main__table elevation-0 customDataTabel th_customer mb-5"
                  :headers="addressHeaders"
                  :items="[{ data: kycDetails }]"
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
                        Residential Address
                      </td>
                      <td class="d-flex align-center">
                        {{ formatAddress(item.data.residentialAddress) }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.mailingAddress && hasMailingAddress(item.data.mailingAddress)">
                      <td class="pr-0" style="width: 215px !important">
                        Mailing Address
                      </td>
                      <td class="d-flex align-center">
                        {{ formatAddress(item.data.mailingAddress) }}
                      </td>
                      <td class=""></td>
                    </tr>
                  </template>
                </v-data-table>

                <!-- Financial Information -->
                <v-data-table
                  id="coa_table"
                  class="main__table elevation-0 customDataTabel th_customer mb-5"
                  :headers="financialHeaders"
                  :items="[{ data: kycDetails }]"
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
                        Nature of Business
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.financialInfo?.natureOfBusiness || '-' }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.financialInfo?.expectedTurnover">
                      <td class="pr-0" style="width: 215px !important">
                        Expected Turnover
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.financialInfo.expectedTurnover }} {{ item.data.financialInfo.currency || '' }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.financialInfo?.bankName">
                      <td class="pr-0" style="width: 215px !important">
                        Bank Name
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.financialInfo.bankName }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.financialInfo?.accountNumber">
                      <td class="pr-0" style="width: 215px !important">
                        Account Number
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.financialInfo.accountNumber }}
                      </td>
                      <td class=""></td>
                    </tr>
                    <tr v-if="item.data.financialInfo?.iban">
                      <td class="pr-0" style="width: 215px !important">
                        IBAN
                      </td>
                      <td class="d-flex align-center">
                        {{ item.data.financialInfo.iban }}
                      </td>
                      <td class=""></td>
                    </tr>
                  </template>
                </v-data-table>

                <!-- Company-specific Information -->
                <template v-if="kycDetails.clientType === 'company'">
                  <!-- Ultimate Beneficial Owners -->
                  <v-data-table
                    v-if="kycDetails.ultimateBeneficialOwners && kycDetails.ultimateBeneficialOwners.length > 0"
                    id="coa_table"
                    class="main__table elevation-0 customDataTabel th_customer mb-5"
                    :headers="uboHeaders"
                    :items="kycDetails.ultimateBeneficialOwners"
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
                          Name
                        </td>
                        <td class="d-flex align-center">
                          {{ item.name }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Ownership %
                        </td>
                        <td class="d-flex align-center">
                          {{ item.ownershipPercentage }}%
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Nationality
                        </td>
                        <td class="d-flex align-center">
                          {{ item.nationality }}
                        </td>
                        <td class=""></td>
                      </tr>
                    </template>
                  </v-data-table>

                  <!-- Board Members -->
                  <v-data-table
                    v-if="kycDetails.boardMembers && kycDetails.boardMembers.length > 0"
                    id="coa_table"
                    class="main__table elevation-0 customDataTabel th_customer mb-5"
                    :headers="boardMembersHeaders"
                    :items="kycDetails.boardMembers"
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
                          Name
                        </td>
                        <td class="d-flex align-center">
                          {{ item.name }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Position
                        </td>
                        <td class="d-flex align-center">
                          {{ item.position }}
                        </td>
                        <td class=""></td>
                      </tr>
                      <tr>
                        <td class="pr-0" style="width: 215px !important">
                          Nationality
                        </td>
                        <td class="d-flex align-center">
                          {{ item.nationality }}
                        </td>
                        <td class=""></td>
                      </tr>
                    </template>
                  </v-data-table>
                </template>

                <!-- Documents Section -->
                <div class="tw-mb-5 tw-mt-5">
                  <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
                    <h5 class="tw-text-lg tw-font-semibold tw-text-gray-900">
                      Attached Documents
                    </h5>
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

                  <!-- Document Categories -->
                  <div class="tw-space-y-6">
                    <!-- Lead Documents -->
                    <div v-if="leadDocuments && leadDocuments.length > 0">
                      <h6 class="tw-text-md tw-font-semibold tw-text-gray-800 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                        <v-icon color="blue">mdi-file-document-outline</v-icon>
                        Lead Documents
                      </h6>
                      <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                        <div
                          v-for="(document, index) in leadDocuments"
                          :key="`lead-doc-${index}`"
                          class="document-card tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-shadow-sm tw-transition-all tw-duration-300 tw-cursor-pointer hover:tw-shadow-lg hover:tw-border-blue-300 hover:tw-bg-blue-50"
                          @click="openDocument(document)"
                        >
                          <!-- Document Header -->
                          <div class="tw-flex tw-items-start tw-justify-between tw-mb-3">
                            <div class="tw-flex tw-items-start tw-gap-3 tw-flex-1 tw-min-w-0">
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
                                <h6 class="tw-text-sm tw-font-semibold tw-text-gray-900 tw-leading-tight tw-break-words tw-line-clamp-2">
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
                              color="grey"
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
                      </div>
                    </div>

                    <!-- KYC Documents -->
                    <div v-if="kycDocuments && kycDocuments.length > 0">
                      <h6 class="tw-text-md tw-font-semibold tw-text-gray-800 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                        <v-icon color="green">mdi-account-check</v-icon>
                        KYC Documents
                      </h6>
                      <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                        <div
                          v-for="(document, index) in kycDocuments"
                          :key="`kyc-doc-${index}`"
                          class="document-card tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-shadow-sm tw-transition-all tw-duration-300 tw-cursor-pointer hover:tw-shadow-lg hover:tw-border-green-300 hover:tw-bg-green-50"
                          @click="openDocument(document)"
                        >
                          <!-- Document Header -->
                          <div class="tw-flex tw-items-start tw-justify-between tw-mb-3">
                            <div class="tw-flex tw-items-start tw-gap-3 tw-flex-1 tw-min-w-0">
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
                                <h6 class="tw-text-sm tw-font-semibold tw-text-gray-900 tw-leading-tight tw-break-words tw-line-clamp-2">
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
                              color="grey"
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
                      </div>
                    </div>

                    <!-- No Documents State -->
                    <div
                      v-if="(!leadDocuments || leadDocuments.length === 0) && (!kycDocuments || kycDocuments.length === 0)"
                      class="tw-text-center tw-py-8 tw-bg-gray-50 tw-rounded-lg"
                    >
                      <v-icon size="48" color="grey lighten-1" class="tw-mb-3"
                        >mdi-file-document-outline</v-icon
                      >
                      <p class="tw-text-gray-500 tw-text-sm">
                        No documents attached
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No KYC Data State -->
              <div
                v-else
                class="tw-text-center tw-py-12 tw-bg-gray-50 tw-rounded-lg"
              >
                <v-icon size="64" color="grey lighten-1" class="tw-mb-4"
                  >mdi-account-question-outline</v-icon
                >
                <h3 class="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-2">
                  No KYC Information Available
                </h3>
                <p class="tw-text-gray-500 tw-text-sm tw-mb-4">
                  KYC enrollment has not been completed for this lead.
                </p>
                <v-btn
                  color="primary"
                  @click="handleEditModel()"
                  class="tw-px-6 tw-py-2"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Start KYC Enrollment
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </template>
      <template v-else>
        <v-col cols="12">
          <EditKYCModel
            :kyc-data="kycDetails"
            :lead-id="process_id"
            :handle-model="handleEditKyc"
            :is-edit-mode="!!kycDetails && Object.keys(kycDetails).length > 0"
            @close="updateKycData()"
            @success="handleKycSuccess"
            @error="handleKycError"
          />
        </v-col>
      </template>
    </v-row>

    <!-- Upload Documents Modal -->
    <UploadDocuments
      v-if="showUploadModal"
      :uploadDocuments="showUploadModal"
      :requiredDocuments="[]"
      :module="'kyc'"
      :identifier="'kyc'"
      :foreign_id="process_id"
      @close="closeUploadModal"
      @successfull="handleDocumentUploadSuccess"
      @update:uploadDocuments="handleUploadDocumentsUpdate"
      :key="'upload-docs-kyc-' + process_id"
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
import UploadDocuments from '@/components/ProcessFlow/UploadDocuments/index.vue'
import EditKYCModel from '@/components/ProcessFlow/ProcessDetails/EditKYCModel.vue'
import countries from 'countries-list'

export default {
  components: {
    EditSvg,
    UploadDocuments,
    EditKYCModel,
  },
  props: {
    process_id: String,
    lead_data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      kycDetails: null,
      showEditModel: false,
      snack: false,
      snackColor: '',
      snackText: '',
      downloadingDoc: null,
      documentTypes: {}, // Cache for document type names
      documentTypesLoading: false,
      countryCodes: [],
      countries: countries.countries,
      showUploadModal: false,
      kycDocuments: [], // Store KYC-specific documents
      leadDocuments: [], // Store lead documents
      clientInfoHeaders: [
        {
          text: 'CLIENT INFORMATION',
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
      addressHeaders: [
        {
          text: 'ADDRESS INFORMATION',
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
      financialHeaders: [
        {
          text: 'FINANCIAL INFORMATION',
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
      uboHeaders: [
        {
          text: 'ULTIMATE BENEFICIAL OWNERS',
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
      boardMembersHeaders: [
        {
          text: 'BOARD MEMBERS',
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
    }
  },
  mounted() {
    this.initializeKycData()
    this.getLeadDocuments(this.process_id)
    this.initializeCountryCodes()
    this.fetchDocumentTypes()
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

    extractCountryFlag(phoneNumber) {
      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        return null
      }

      for (const { code, iso2, emoji } of this.countryCodes) {
        if (phoneNumber.startsWith(`+${code}`)) {
          return emoji
        }
      }

      return null
    },

    initializeKycData() {
      // Use KYC details from lead data if available
      if (this.lead_data && this.lead_data.kyc_details) {
        this.kycDetails = this.lead_data.kyc_details

        // Fetch KYC documents if they exist
        if (this.kycDetails && this.kycDetails.documents) {
          this.fetchKycDocuments()
        }
      } else {
        this.kycDetails = null
      }
    },

    async getLeadDocuments(leadId) {
      // Use documents from lead data if available, otherwise fetch from API
      if (this.lead_data && this.lead_data.documents) {
        this.leadDocuments = this.lead_data.documents.map(doc => ({
          ...doc,
          category: 'lead'
        }))

        // Fetch document type names for lead documents
        if (this.leadDocuments.length > 0) {
          await this.fetchDocumentTypeNames()
        }
      } else {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        try {
          const response = await this.$axios.$post(
            '/leads/details/leadsid',
            { leads_id: leadId },
            { headers: { Authorization: AuthStr } }
          )

          if (response && response.length > 0 && response[0].documents) {
            this.leadDocuments = response[0].documents.map(doc => ({
              ...doc,
              category: 'lead'
            }))

            // Fetch document type names for lead documents
            if (this.leadDocuments.length > 0) {
              await this.fetchDocumentTypeNames()
            }
          }
        } catch (error) {
          console.error('Error fetching lead documents:', error)
          this.leadDocuments = []
        }
      }
    },

    async fetchKycDocuments() {
      // This would fetch KYC-specific documents
      // For now, we'll use the documents from the KYC details
      if (this.kycDetails && this.kycDetails.documents) {
        this.kycDocuments = Object.entries(this.kycDetails.documents)
          .filter(([key, value]) => value && value !== '')
          .map(([key, value]) => ({
            _id: key,
            name: this.formatDocumentName(key),
            type: key,
            url: value,
            createdAt: this.kycDetails.submittedAt,
            size: 0, // We don't have size info for KYC documents
            category: 'kyc'
          }))
      }
    },

    // Document handling methods (copied from LeadDetails.vue)
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

    // Fetch document type names for all documents
    async fetchDocumentTypeNames() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      for (const document of this.leadDocuments) {
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

    formatDocumentName(key) {
      const nameMap = {
        passport: 'Passport',
        emirates_id: 'Emirates ID',
        national_id: 'National ID',
        certificate_of_incorporation: 'Certificate of Incorporation',
        memorandum_articles: 'Memorandum & Articles',
        vat_certificate: 'VAT Certificate',
        authorized_signatory_id: 'Authorized Signatory ID'
      }
      return nameMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    },

    formatClientType(type) {
      return type === 'individual' ? 'Individual' : 'Company'
    },

    formatAddress(address) {
      if (!address) return '-'
      const parts = []
      if (address.city) parts.push(address.city)
      if (address.country) parts.push(address.country)
      if (address.postalCode) parts.push(address.postalCode)
      return parts.length > 0 ? parts.join(', ') : '-'
    },

    hasMailingAddress(address) {
      return address && (address.city || address.country || address.postalCode)
    },

    getKycStatus() {
      if (!this.kycDetails) return 'Not Started'
      if (this.kycDetails.isComplete) return 'Completed'
      return 'In Progress'
    },

    getKycStatusColor() {
      const status = this.getKycStatus()
      switch (status) {
        case 'Completed':
          return 'green'
        case 'In Progress':
          return 'orange'
        default:
          return 'grey'
      }
    },

    getKycStatusTextColor() {
      const status = this.getKycStatus()
      switch (status) {
        case 'Completed':
          return 'tw-text-green-800'
        case 'In Progress':
          return 'tw-text-orange-800'
        default:
          return 'tw-text-gray-800'
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch (error) {
        return '-'
      }
    },

    // Document handling methods (reused from LeadDetails)
    getDocumentIcon(type) {
      const iconMap = {
        passport: 'mdi-passport',
        emirates_id: 'mdi-card-account-details',
        national_id: 'mdi-card-account-details',
        certificate_of_incorporation: 'mdi-certificate',
        memorandum_articles: 'mdi-file-document-edit',
        vat_certificate: 'mdi-file-document-edit',
        authorized_signatory_id: 'mdi-card-account-details',
        pdf: 'mdi-file-pdf-box',
        doc: 'mdi-file-word-box',
        docx: 'mdi-file-word-box',
        jpg: 'mdi-image',
        jpeg: 'mdi-image',
        png: 'mdi-image',
      }

      if (!type) return 'mdi-file-document-outline'
      return iconMap[type.toLowerCase()] || 'mdi-file-document-outline'
    },

    getDocumentIconColor(type) {
      const colorMap = {
        passport: '#059669',
        emirates_id: '#0891B2',
        national_id: '#0891B2',
        certificate_of_incorporation: '#059669',
        memorandum_articles: '#2563EB',
        vat_certificate: '#EA580C',
        authorized_signatory_id: '#0891B2',
        pdf: '#E53E3E',
        doc: '#2B6CB0',
        docx: '#2B6CB0',
        jpg: '#9F7AEA',
        jpeg: '#9F7AEA',
        png: '#9F7AEA',
      }

      if (!type) return '#6B7280'
      return colorMap[type.toLowerCase()] || '#6B7280'
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

    formatFileSize(bytes) {
      if (!bytes) return 'Unknown'
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Bytes'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return (
        Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
      )
    },

    openDocument(doc) {
      if (!doc.url) {
        this.showSnackbar('Document URL not available', 'error')
        return
      }
      window.open(doc.url, '_blank')
    },

    async downloadDocument(doc) {
      if (!doc.url) {
        this.showSnackbar('Document URL not available', 'error')
        return
      }

      try {
        this.downloadingDoc = doc._id
        const link = document.createElement('a')
        link.href = doc.url
        link.download = doc.name || 'document'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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

    handleEditKyc() {
      this.showEditModel = !this.showEditModel
    },

    handleEditModel() {
      this.showEditModel = !this.showEditModel
    },

    async updateKycData() {
      this.showEditModel = !this.showEditModel
      this.snack = true
      this.snackColor = 'green'
      this.snackText = 'KYC Details Updated Successfully!'

      // Show loading state while refetching data
      this.loading = true

      // Refresh KYC data from lead data
      this.initializeKycData()

      // Refresh documents
      await this.getLeadDocuments(this.process_id)

      this.loading = false

      // Emit events to notify parent components
      this.$nuxt.$emit('kyc-data-updated', {
        leadId: this.process_id,
        action: 'update',
      })
    },

    // Upload Modal Methods
    openUploadModal() {
      this.showUploadModal = true
    },

    closeUploadModal() {
      this.showUploadModal = false
      // Refetch lead details to ensure we have the latest data
      this.getLeadDocuments(this.process_id)
    },

    handleDocumentUploadSuccess() {
      this.showUploadModal = false
      this.showSnackbar('Document uploaded successfully!', 'success')
      // Refresh lead details to show the new document
      this.getLeadDocuments(this.process_id)
      // Emit event to notify parent components
      this.$nuxt.$emit('kyc-data-updated', {
        leadId: this.process_id,
        action: 'document_uploaded',
      })
    },

    handleUploadDocumentsUpdate(value) {
      this.showUploadModal = value
    },

    // Handle KYC form success
    handleKycSuccess(message) {
      this.showSnackbar(message, 'success')
      this.updateKycData()
    },

    // Handle KYC form error
    handleKycError(message) {
      this.showSnackbar(message, 'error')
    },
  },
}
</script>

<style lang="scss" scoped>
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
</style>
