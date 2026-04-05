<template>
  <v-row>
    <v-col cols="12">
      <v-card class="onboarding_process" color="card_bg" id="card">
        <v-card-title id="card-title" class="mb-4"> </v-card-title>
        <v-card-text
          id="card-text2"
          style="max-height: 10vh !important"
          class="dl__l overflow-y-auto"
        >
          <v-col cols="12" class="">
            <div class="d-flex align-center pb-10">
              <span class="span_btnB">Employee Onboarding History</span>
            </div>
            <div class="pl-15">
              <div
                class="d-flex box py-4"
                v-for="(step, index) in visa_process_timeline"
                :key="index"
              >
                <span
                  class="before"
                  :style="
                    step.completed ? lineCompletedStyle : lineNotCompletedStyle
                  "
                ></span>
                <div class="d-flex align-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    fill="#0a94ff"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="border-radius: 50%; background-color: #0a94ff"
                    :style="
                      step.completed ? completedStyles : notCompletedStyles
                    "
                  >
                    <path d="M0 0h24v24H0z" stroke="none"></path>
                    <path d="M5 12l5 5L20 7"></path>
                  </svg>
                  <div class="ml-6">
                    <h5>{{ step.title }}</h5>
                    <span>{{ step.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" class="pt-3 pb-0">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h5>{{ documents_table.length }} Docs</h5>
          </div>
    
        </div>
      </v-col>
      <v-col cols="12" class="pt-6 pb-0">
        <v-data-table
          id="coa_table"
          class="main__table elevation-0 document_table"
          :headers="headers"
          :items="documents_table"
          :footer-props="{ 'items-per-page-options': [10, 20] }"
          hide-default-footer
        >
          <template v-slot:item="{ item }">
            <tr class="table_row">
              <td class="">
                <div class="d-flex align-center">
                  <span class="pr-2">
                    <PdfSvg />
                  </span>

                  {{ item.documents }}
                </div>
              </td>
              <td class="">{{ item.expiry_date }}</td>
              <td class="pa-0 ma-0 pl-3">
                <div class="">
                  <span
                    class="table_btn light_accent4 accent4--text"
                    v-if="item.status == 'valid'"
                    >{{ item.status }}</span
                  >
                  <span
                    class="table_btn light_accent3 accent3--text"
                    v-if="item.status == 'Soon Expiring'"
                    >{{ item.status }}</span
                  >
                  <span
                    class="table_btn light_accent2 accent2--text"
                    v-if="item.status == 'Expired'"
                    >{{ item.status }}</span
                  >
                </div>
              </td>
              <td class="">
                
                <div class="d-flex align-center justify-space-between">
                  <a href="#"> Upload </a>
                  <template>
                    <v-file-input
                      hide-input
                      flat
                      solo
                      prepend-icon="none"
                      style="box-shadow: none !important"
                      type="file"
                      accept=".pdf"
                      @change="uploadDocument($event)"
                    />
                  </template>
                  <a href="#" class="accent2--text" @click="deleteDocument(item.id),deleteDoc()">Delete</a>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>

        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import PdfSvg from '@/assets/images/icons/pdf.svg'
import SnackBar from '~/components/utils/SnackBar.vue'

export default {
  components: {
    PdfSvg,
    SnackBar,

  },
  data() {
    return {
        headers: [
        { text: 'Document', value: 'documents', align: 'start' },
        { text: 'Expiry Date', value: 'expiry_date', align: 'start' },
        { text: 'Expiry Status', value: 'status', align: 'start' },
        { text: 'Action', value: 'action', align: 'start' },
      ],
      documents_table: [
        {
          documents: 'TradeLicense',
          expiry_date: 'Binance',
          status: 'Expired',
          action: 'Upload',
          del: 'Delete',
        },
        {
          documents: 'TradeLicense',
          expiry_date: 'Binance',
          status: 'valid',
          action: 'Upload',
          del: 'Delete',
        },
        {
          documents: 'TradeLicense',
          expiry_date: 'Binance',
          status: 'Soon Expiring',
          action: 'Upload',
          del: 'Delete',
        },
      ],
      visa_process_timeline: [
        {
          title: 'MOL Offer Letter',
          text: 'Complete at Feb 8, 2.30pm',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'User Accept. of Job Offer',
          text: 'Not started',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'MOL Offer Letter',
          text: 'Complete at Feb 8, 2.30pm',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'User Accept. of Job Offer',
          text: 'Not started',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'MOL Offer Letter',
          text: 'Complete at Feb 8, 2.30pm',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'User Accept. of Job Offer',
          text: 'Not started',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'Health Insurance',
          text: 'Not started',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'MOL Offer Letter',
          text: 'Complete at Feb 8, 2.30pm',
          completed: true,
          buttonText: 'Completed',
        },
        {
          title: 'User Accept. of Job Offer',
          text: 'Not started',
          completed: true,
          buttonText: 'Completed',
        },
      ],
    }
  },
  // @click="handleNewLead()"
  methods: {
    handleEditLead() {
      this.$router.push('/Leads/new-lead')
    },
  },
  computed: {
    completedStyles() {
      return {
        stroke: ' #0a94ff',
        border: '2px solid #0a94ff',
      }
    },
    notCompletedStyles() {
      return {
        stroke: '#0a94ff',
        border: '2px solid #0a94ff',
      }
    },
    lineCompletedStyle() {
      return {
        backgroundColor: '#0a94ff',
      }
    },
    lineNotCompletedStyle() {
      return {
        backgroundColor: '#0a94ff',
      }
    },
  },
}
</script>
