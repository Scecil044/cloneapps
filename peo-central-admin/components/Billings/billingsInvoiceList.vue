<template>
    <div>
      <v-row>
        <BillingsListDialog :dialogData="billingsListDialog" @close="closeBillingsListDialog" />
        <!-- list column -->
        <v-col sm="12" md="12" lg="12">
          <v-card color="card_bg" id="card" style="min-height: 90vh !important">
            <v-card-title id="card-title" class="mb-8">
              <div class="d-flex align-center justify-lg-space-between" style="width: 100% !important">
                <div style="width: 50% !important">
                  <span class="h5">All Invoice Addition</span>
                </div>
                <div class="d-flex align-center justify-end" style="width: 50%">
                  <v-btn @click="handleBillingListDialog" class="short__btn" color="primary">New</v-btn>
                </div>
              </div>
            </v-card-title>
            <div class="dl__list">
              <v-card-text id="card-text2" style="max-height: 80vh" class="">
                <!-- selected Employer ID -->
                <v-list class="customers_list__con">
                  <v-list-item-group>
                    <v-list-item class="pa-0" v-for="(item, index) in invoiceList" :key="index" @click="invoiceListClicked(item._id)">
                      <v-list-item-icon class="mx-1">
                        <v-img :src="item.image_url" style="border-radius: 50px" width="60" height="60" v-if="item.image_url" />
                        <customerDefaultIcon style="border-radius: 50px" v-else />
                      </v-list-item-icon>
                      <v-list-item-content class="d-flex justify-md-space-between align-center">
                        <v-list-item-title class="ml-3 d-flex flex-column">
                          <h5>{{ item.customer_name }}</h5>
                          <span class="span_text">{{ item.invoice_number }}</span>
                        </v-list-item-title>
                      </v-list-item-content>
                      <v-menu transition="slide-y-transition" rounded="lg" offset-y>
                        <template v-slot:activator="{}">
                          <v-btn color="subtext" icon>
                            <v-icon small>fa-solid fa-ellipsis-vertical</v-icon></v-btn>
                        </template>
                      </v-menu>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card-text>
              <!-- <Observer v-if="loadObserver" @intersect="intersectedInvoiceList" />   -->
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </template>
<script>
import '@/assets/scss/utils/_customerListDetails.scss'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import EditSvg from '@/assets/images/Customer/edit.svg'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import filterIcon from '@/assets/images/Customer/filterIcon.svg'
import Observer from '~/components/Observer.vue'
import BillingsListDialog from '@/components/Dialogs/billingsListDialog.vue'

  
  
  export default {
    components: {
      customerDefaultIcon,
      DarkArrow,
      LightArrow,
      EditSvg,
      filterIcon,
      CalenderSvg,
      Observer,
      BillingsListDialog,
    },
    props: { selectedEmployee: String },
    data() {
      return {
        //dialog
        billingsListDialog: false,
        //observer handle
        loadObserver: true,
        //pagination
        limit: '10',
        page: 0,
        // APIs Data
        invoiceList: [],
      }
    },
    methods: {
      async intersectedInvoiceList() {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        await this.$axios.$post(`/invoice`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.invoiceList = response
          this.invoiceListClicked(this.invoiceList[0]._id)
        })
      },
      invoiceListClicked(val){
        this.$emit('InvoiceListClicked', val)
      },
      handleBillingListDialog(){
        this.billingsListDialog = true
      },
      closeBillingsListDialog(value) {
        this.billingsListDialog = false
        this.intersectedInvoiceList();
      },
    },
    mounted() {
      this.intersectedInvoiceList()
    },
  }
  </script>
    