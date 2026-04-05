<template>
  <v-dialog
    id="custom_dialog"
    v-model="dialogVisible"
    width="50vw"
    height="100vh"
    content-class="proposal_dialog"
  >
    <div class="dialog_proposal">
      <v-card id="card" class="dialog_custom">
        <!-- Header Section -->
        <div class="tw-flex tw-items-center tw-justify-between tw-pb-4">
          <v-card-title class="py-0">
            <v-img
              src="/shift/build.svg"
              max-width="fit-content"
              height="fit-content"
              class="mr-2"
              contain
            ></v-img>
            <h4 class="text--text tw-text-capitalize">
              {{ enrollment.company_name }} - Enrollment Details
            </h4>
          </v-card-title>
          <v-btn @click="closeDialog()" outlined icon color="red accent-4">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider />

        <div class="tw-flex tw-items-center tw-justify-between">
          <!-- Status Badge -->
          <div class="ml-5">
            <v-chip
              :color="
                enrollment.status === 'Completed'
                  ? 'success'
                  : enrollment.status === 'Processing'
                  ? 'warning'
                  : 'info'
              "
              text-color="white"
              class="tw-text-sm tw-font-medium"
            >
              {{ enrollment.status }}
            </v-chip>
          </div>
          <div class="tw-flex tw-items-center tw-gap-3">
            <v-btn
              v-if="
                enrollment.is_editable == false &&
                enrollment.status != 'Completed'
              "
              class="ma-2"
              color="error"
              outlined
              @click="$emit('enable-editing', enrollment.id)"
            >
              <v-icon left>mdi-pencil</v-icon>
              Enable Editing
            </v-btn>
            <v-btn
              class="ma-2"
              color="primary"
              outlined
              @click="$emit('visit-link', enrollment.id)"
            >
              <v-icon left>mdi-open-in-new</v-icon>
              Visit Link
            </v-btn>

            <!-- Action Buttons -->
            <div
              v-if="
                (module == 'leads' && enrollment.status != 'Pending') ||
                (module != 'leads' && enrollment.status == 'Processing')
              "
            >
              <v-btn
                color="primary"
                @click="$emit('verify-enrollment', enrollment.id)"
                class="tw-px-6"
              >
                <v-icon left>mdi-check-circle</v-icon>
                {{
                  enrollment.status == 'Completed' && module == 'leads'
                    ? 'Move Forward'
                    : 'Verify Enrollment'
                }}
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div v-if="!loading" class="tw-space-y-8">
          <!-- Company Information Section -->
          <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
            <h5
              class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
            >
              <v-icon class="mr-2" color="primary">mdi-domain</v-icon>
              Company Information
            </h5>
            <v-row>
              <v-col cols="12" md="6">
                <div class="tw-space-y-3">
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Company Name
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment.company_name }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Legal Name
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment.legal_name }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Industry
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment.business_industry }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Registration Number
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment.registration_number }}
                    </p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="tw-space-y-3">
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      TRN Number
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment.trn_number }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      GRN Number
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment.GRN_number }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Country
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment.country }}
                    </p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Contact Information Section -->
          <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
            <h5
              class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
            >
              <v-icon class="mr-2" color="primary">mdi-phone</v-icon>
              Contact Information
            </h5>
            <v-row>
              <v-col cols="12" md="6">
                <div>
                  <p class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
                    Email Address
                  </p>
                  <p class="tw-text-base tw-font-normal tw-text-gray-900">
                    {{ enrollment.email }}
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div>
                  <p class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
                    Phone Number
                  </p>
                  <p class="tw-text-base tw-font-normal tw-text-gray-900">
                    {{ enrollment.phone }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Addresses Section -->
          <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
            <!-- Billing Address -->
            <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
              <h5
                class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
              >
                <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                Billing Address
              </h5>
              <div class="tw-space-y-2">
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.billing_address?.address_line1 }}
                </p>
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.billing_address?.address_line2 }}
                </p>
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.billing_address?.city }},
                  {{ enrollment.billing_address?.state }}
                  {{ enrollment.billing_address?.zip }}
                </p>
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.billing_address?.phone }}
                </p>
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.billing_address?.email }}
                </p>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
              <h5
                class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
              >
                <v-icon class="mr-2" color="primary">mdi-truck-delivery</v-icon>
                Shipping Address
              </h5>
              <div class="tw-space-y-2">
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.shipping_address?.address_line1 }}
                </p>
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.shipping_address?.address_line2 }}
                </p>
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.shipping_address?.city }},
                  {{ enrollment.shipping_address?.state }}
                  {{ enrollment.shipping_address?.zip }}
                </p>
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.shipping_address?.phone }}
                </p>
                <p
                  v-if="enrollment.shipping_address?.special_instructions"
                  class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mt-2"
                >
                  Special Instructions:
                  {{ enrollment.shipping_address?.special_instructions }}
                </p>
              </div>
            </div>
          </div>

          <!-- Banking Information Section -->
          <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
            <h5
              class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
            >
              <v-icon class="mr-2" color="primary">mdi-bank</v-icon>
              Banking Information
            </h5>
            <v-row>
              <v-col cols="12" md="6">
                <div class="tw-space-y-3">
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Bank Name
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment?.bank_details[0]?.bank_name }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Account Number
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment?.bank_details[0]?.account_number }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      IBAN
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment?.bank_details[0]?.iban }}
                    </p>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="tw-space-y-3">
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Swift Code
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment?.bank_details[0]?.swift_code }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Bank Address
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment?.bank_details[0]?.bank_address }}
                    </p>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1"
                    >
                      Country
                    </p>
                    <p class="tw-text-base tw-font-normal tw-text-gray-900">
                      {{ enrollment?.bank_details[0]?.country }}
                    </p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Social Media & Online Presence -->
          <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
            <h5
              class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
            >
              <v-icon class="mr-2" color="primary">mdi-web</v-icon>
              Online Presence
            </h5>
            <v-row>
              <v-col cols="12" md="6">
                <div>
                  <p class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
                    Website
                  </p>
                  <p class="tw-text-base tw-font-normal tw-text-gray-900">
                    {{ enrollment.website || 'Not provided' }}
                  </p>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div>
                  <p class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-1">
                    LinkedIn
                  </p>
                  <p class="tw-text-base tw-font-normal tw-text-gray-900">
                    {{ enrollment.linkedin || 'Not provided' }}
                  </p>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Point of Contact Details -->
          <div
            v-if="enrollment.contact_persons?.length > 0"
            class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6"
          >
            <!-- Financial POC -->
            <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
              <h5
                class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
              >
                <v-icon class="mr-2" color="primary">mdi-account-cash</v-icon>
                Financial POC
              </h5>
              <div class="tw-space-y-2">
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.contact_persons[0]?.name }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[0]?.designation }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[0]?.email }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[0]?.phone }}
                </p>
              </div>
            </div>

            <!-- HR POC -->
            <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
              <h5
                class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
              >
                <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
                HR POC
              </h5>
              <div class="tw-space-y-2">
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.contact_persons[1]?.name }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[1]?.designation }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[1]?.email }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[1]?.phone }}
                </p>
              </div>
            </div>

            <!-- Escalation POC -->
            <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
              <h5
                class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
              >
                <v-icon class="mr-2" color="primary">mdi-account-alert</v-icon>
                Escalation POC
              </h5>
              <div class="tw-space-y-2">
                <p class="tw-text-base tw-font-normal tw-text-gray-900">
                  {{ enrollment.contact_persons[2]?.name }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[2]?.designation }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[2]?.email }}
                </p>
                <p class="tw-text-sm tw-text-gray-600">
                  {{ enrollment.contact_persons[2]?.phone }}
                </p>
              </div>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="tw-bg-gray-50 tw-rounded-lg tw-p-6">
            <h5
              class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4 tw-flex tw-items-center"
            >
              <v-icon class="mr-2" color="primary">mdi-file-document</v-icon>
              Company Documents
            </h5>
            <v-row>
              <v-col cols="12" md="6">
                <div class="tw-space-y-4">
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-2"
                    >
                      Company Incorporation Certificate
                    </p>
                    <div
                      class="tw-bg-white tw-rounded tw-p-3 tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-between"
                    >
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer"
                        @click="
                          openDocument(enrollment?.documents?.certification)
                        "
                      >
                        <PdfSvg class="mr-2" />
                        <span class="tw-text-sm tw-text-gray-700">{{
                          getNameFromLink(enrollment?.documents?.certification)
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-2"
                    >
                      Signatory's Passport Copy
                    </p>
                    <div
                      class="tw-bg-white tw-rounded tw-p-3 tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-between"
                    >
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer"
                        @click="
                          openDocument(enrollment?.documents?.passport_copy)
                        "
                      >
                        <PdfSvg class="mr-2" />
                        <span class="tw-text-sm tw-text-gray-700">{{
                          getNameFromLink(enrollment?.documents?.passport_copy)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="tw-space-y-4">
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-2"
                    >
                      Signed KYC Form
                    </p>
                    <div
                      class="tw-bg-white tw-rounded tw-p-3 tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-between"
                    >
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer"
                        @click="openDocument(enrollment?.documents?.signed_kyc)"
                      >
                        <PdfSvg class="mr-2" />
                        <span class="tw-text-sm tw-text-gray-700">{{
                          getNameFromLink(enrollment?.documents?.signed_kyc)
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p
                      class="tw-text-sm tw-font-medium tw-text-gray-600 tw-mb-2"
                    >
                      VAT Certificate
                    </p>
                    <div
                      class="tw-bg-white tw-rounded tw-p-3 tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-between"
                    >
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer"
                        @click="
                          openDocument(enrollment?.documents?.vat_certificate)
                        "
                      >
                        <PdfSvg class="mr-2" />
                        <span class="tw-text-sm tw-text-gray-700">{{
                          getNameFromLink(
                            enrollment?.documents?.vat_certificate
                          )
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
        <!-- loading -->
        <div v-else>loading ....</div>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import PdfSvg from '@/assets/images/icons/pdf.svg'

export default {
  name: 'EnrollmentDetailsDialog',
  components: {
    PdfSvg,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    module: {
      type: String,
      default: 'enrollments',
    },
    enrollment: {
      type: Object,
      default: () => ({
        contact_persons: [],
        billing_address: {},
        shipping_address: {},
        bank_details: [],
        documents: {},
      }),
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
        // Emit close event when dialog is closed (for outside clicks)
        if (!value) {
          this.$emit('close')
        }
      },
    },
  },
  methods: {
    closeDialog() {
      this.$emit('input', false)
      this.$emit('close')
    },
    getNameFromLink(link) {
      if (link == null) return ''
      return link.split('/').pop()
    },
    openDocument(url) {
      if (url) {
        window.open(url)
      }
    },
  },
}
</script>
