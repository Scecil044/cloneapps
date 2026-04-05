<template>
    <v-row>
      <v-col cols="12">
        <v-card color="card_bg" id="card">
          <v-card-title id="card-title" class="mb-4">
            <v-row class="pa-0">
              <v-col class="pa-0" cols="12">
                <div class="d-flex align-center justify-space-between">
                  <span class="span_btnB">{{ selectedEmailSender.subject }}</span>
                  <!-- <template>
                    <v-btn color="subtext" icon>
                      <v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn
                    >
                  </template> -->
                </div>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text
            id="card-text2"
            style="height: 80vh !important"
            class="dl__l overflow-y-auto"
          >
            <v-container class="px-0">
              <v-row class="px-0">
                <v-col class="px-0" cols="12" md="6" lg="6">
                  <div class="d-flex align-center">
                    <v-avatar size="60">
                      <v-img alt="Avatar" src="/1.jpg" />
                    </v-avatar>
                    <div class="ml-2 d-flex flex-column">
                      <span class="sub_reg">{{
                        selectedEmailSender.sender_name
                      }}</span>
                      <span class="span_subtext"
                        >To:{{ selectedEmailSender.to }}</span
                      >
                      <span class="span_subtext"
                        >cc:{{ selectedEmailSender.cc }}</span
                      >
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6" lg="6" class="px-0">
                  <div class="d-flex align-center justify-end">
                  <!-- forward Button  -->
                    <v-btn
                    @click="sendNewMail()"
                      style="min-width: 40px !important"
                      class="short__btn mr-2"
                      color="subtext"
                      outlined
                    >
                      <ArrowNarrowRightSvg />
                      <span class="span_subtext"> forward </span>
                    </v-btn>
                    <!-- print Button -->
                    <v-btn
                      style="min-width: 40px !important"
                      class="short__btn mr-2"
                      color="subtext"
                      outlined
                    >
                      <PrinterSvg />
                    </v-btn>
                  </div>
                  <div class="d-flex align-center justify-end pa-2">
                    <span class="span_text"
                      >{{ selectedEmailSender.day }}
                      {{ selectedEmailSender.time }}</span
                    >
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="pa-6">Email Description</div>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="px-0">
                <v-col cols="12" class="px-0">
                  <span class="span_btnB"> Attachments</span>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>
  
  <script>
  import ArrowBackSvg from '@/assets/images/icons/arrow-back.svg'
  import ArrowBackDoubleSvg from '@/assets/images/icons/arrow-back-double.svg'
  import ArrowNarrowRightSvg from '@/assets/images/icons/arrow-narrow-right.svg'
  import PrinterSvg from '@/assets/images/icons/printer.svg'
  import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
  
  export default {
    components: {
      customerDefaultIcon,
      ArrowBackSvg,
      ArrowBackDoubleSvg,
      ArrowNarrowRightSvg,
      PrinterSvg,
    },
    props: {
      selectedEmailSender: Object,
    },
    data() {
      return {}
    },
    // @click="handleNewLead()"
    methods: {
          //Send New Mail
     sendNewMail() {
      this.$router.push('/Email/newMail')
    },
      handleEditLead() {
        this.$router.push('/Leads/new-lead')
      },
    },
    mounted() {
      this.selectedEmailSender
    },
  }
  </script>
  