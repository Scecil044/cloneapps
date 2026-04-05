<template>
  <div>
    <div>
      <v-card
        class="rounded-md tw-px-5 tw-py-8 tw-mb-10"
        style="box-shadow: 0px 24px 30px #959ea51a"
      >
        <v-row>
          <v-spacer />
          <div class="tw-flex tw-items-center tw-gap-4">
            <v-btn outlined> Remove </v-btn>
            <v-btn
              v-if="!inquiry.is_assign"
              color="primary"
              @click="assign_pro_modal = true"
            >
              Assign
            </v-btn>
            <v-btn v-else color="primary" @click="assign_pro_modal = true">
              Reassign
            </v-btn>
          </div>
        </v-row>
      </v-card>
      <v-card
        class="rounded-md tw-px-5"
        style="box-shadow: 0px 24px 30px #959ea51a"
        min-height="590px"
      >
        <div class="tw-py-4">
          <h2 class="tw-text-2xl">Inquiry Details</h2>
        </div>
        <!-- List -->
        <div class="tw-space-y-3">
          <dl class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-1">
            <dt class="tw-min-w-40">
              <span
                class="tw-block tw-text-sm tw-text-gray-500 dark:tw-text-neutral-500"
                >Company Name:</span
              >
            </dt>
            <dd>
              <ul>
                <li
                  class="tw-me-1 -tw-mt-2 after:tw-content-[','] tw-inline-flex tw-items-center tw-text-sm tw-text-gray-800 dark:tw-text-neutral-200"
                >
                  {{ inquiry.name }}
                </li>
              </ul>
            </dd>
          </dl>

          <dl
            v-if="inquiry.details?.contact_option"
            class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-1"
          >
            <dt class="tw-min-w-40">
              <span
                class="tw-block tw-text-sm tw-text-gray-500 dark:tw-text-neutral-500"
                >Contact Option:
              </span>
            </dt>
            <dd>
              <span class="-tw-mt-2">{{
                inquiry.details?.contact_option
              }}</span>
            </dd>
          </dl>
          <dl class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-1">
            <dt class="tw-min-w-40">
              <span
                class="tw-block tw-text-sm tw-text-gray-500 dark:tw-text-neutral-500"
                >Contact Email:
              </span>
            </dt>
            <dd>
              <span>{{ inquiry.email }}</span>
            </dd>
          </dl>

          <dl class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-1">
            <dt class="tw-min-w-40">
              <span
                class="tw-block tw-text-sm tw-text-gray-500 dark:tw-text-neutral-500"
                >Source:</span
              >
            </dt>
            <dd>
              <span class="-tw-mt-2">{{ inquiry.source }}</span>
            </dd>
          </dl>

          <dl class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-1">
            <dt class="tw-min-w-40">
              <span
                class="tw-block tw-text-sm tw-text-gray-500 dark:tw-text-neutral-500"
                >Country:</span
              >
            </dt>
            <dd>
              <span class="-tw-mt-2">{{ inquiry.country }}</span>
            </dd>
          </dl>

          <dl class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-1">
            <dt class="tw-min-w-40">
              <span
                class="tw-block tw-text-sm tw-text-gray-500 dark:tw-text-neutral-500"
                >Date Created:</span
              >
            </dt>
            <dd>
              <ul>
                <li
                  class="after:tw-content-[','] tw-inline-flex tw-items-center tw-text-sm tw-text-gray-800 dark:tw-text-neutral-200"
                >
                  {{ moment(inquiry.date_created).format('lll') }}
                </li>
              </ul>
            </dd>
          </dl>
        </div>
        <!-- End List -->
        <div class="tw-py-4">
          <h2 class="tw-text-2xl">Requirements</h2>
        </div>
        <div>
          <v-textarea
            :value="inquiry.message"
            readonly
            outlined
            dense
            auto-grow
            rows="4"
            max-rows="6"
            class="requirements-textarea"
            style="max-height: 150px; overflow-y: auto; min-height: 120px;"
            hide-details
          ></v-textarea>
        </div>
      </v-card>
    </div>

    <v-dialog v-model="assign_pro_modal" class="ma-0 pa-0 mr-2" max-width="500">
      <v-card>
        <v-row>
          <v-col cols="6" sm="6" class="pb-2">
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
                Assign Inquiry</span
              >
            </v-card-title>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row justify="center" class="px-5 mt-2">
          <v-col cols="12" class="pb-2">
            <v-card-text
              >Please Confirm you want to Assign Inquiry. This action cannot be
              undone</v-card-text
            >
            <div class="tw-py-2">
              <v-select :items="PROlist" label="Select PRO" outlined></v-select>
            </div>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="assign_pro_modal = false">
                cancel
              </v-btn>
              <v-btn
                color="red"
                outlined
                :loading="btn_loading"
                :disabled="btn_loading"
                @click="AssignPRO"
              >
                Assign
              </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'inquiry-details',
  props: [],
  data() {
    return {
      assign_pro_modal: false,
      PROlist: [],
      btn_loading: false,
      inquiry: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        contactNumber: '+971 50 123 4567',
        companyName: 'Acme Corporation',
        serviceRequired: 'PEO/EOR Services',
        referralSource: 'Google Search',
        requirements:
          'Looking for comprehensive EOR services for a team of 23 employees expanding to the UAE market. Need assistance with local compliance, payroll, and benefits administration.',
        clientType: 'new client',
        headCount: 23,
        receivedDate: '2025-04-16',
        daysSince: '- Days',
        assignedTo: 'Sahiba Tanwani',
        requirements:
          'Looking for comprehensive EOR services for a team of 23 employees expanding to the UAE market. Need assistance with local compliance, payroll, and benefits administration.',
      },
    }
  },
  beforeUnmount() {
    this.$nuxt.$off('select-inquiry')
  },
  methods: {
    moment,
    AssignPRO() {},
    handleSelected() {
      this.$nuxt.$on('select-inquiry', (item) => {
        console.log('selected: ', item)
        this.inquiry = item
      })
    },
  },
  mounted() {
    this.handleSelected()
  },
}
</script>
<style lang="scss" scoped>
.requirements-textarea {
  .v-text-field__details {
    display: none; // Hide the details line
  }

  .v-input__slot {
    min-height: 120px;
    max-height: 150px;
    overflow-y: auto;
  }

  // Ensure consistent width
  width: 100%;
  max-width: 600px;
  margin-top: 12px;
  margin-bottom: 12px;
}

// Add spacing around the requirements section
.tw-py-4 {
  padding-top: 24px !important;
  padding-bottom: 24px !important;
}
</style>
