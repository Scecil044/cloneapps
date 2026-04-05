<template>
  <v-row class="row1 pt-0">
    <v-col sm="12" md="12" lg="12" cols="12" class="pt-0 pl-3 pr-3">
      <!-- <div class="d-flex align-center justify-end pb-3">
        <v-btn class="ml-1 pl-3 pr-3" color="#000027" outlined :height="30" style="border: solid 3px #f9fafc !important">
          <EditSvg />
          <span class="edit_btnNew pl-1">Edit</span>
        </v-btn>
      </div> -->
      <v-row>
        <v-col cols="12" class="pt-0 pb-0 mb-2">
          <div class="d-flex pt-0 pb-0 pa-1" style="gap: 1rem">
            <v-card
              color="card_bg"
              class="exsmal_card"
              style="border: 0.5px solid #e2e7f1 !important"
            >
              <div
                class="d-flex align-center justify-center px-4 py-2"
                style="height: 100%"
              >
                <div class="d-flex align-center mr-2">
                  <h4 class="ma-0">Total Amount Due:</h4>
                </div>

                <div class="d-flex align-center">
                  <h5 class="">{{ this.totalAmountDue }}</h5>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>
      <v-data-table
        id="coa_table"
        :loading="dataLoading"
        loading-text="Loading... Please wait"
        class="main__table elevation-0 document_table"
        :options.sync="options"
        :server-items-length="filter.totalResults"
        :headers="billings_documents_headers"
        :items="invoiceList"
        :footer-props="{ 'items-per-page-options': [10, 20] }"
      >
        <template v-slot:item="{ item, index }">
          <tr @click="handleEmployerId(item)">
            <td class="font-weight-medium subHeadingFontSize mb-0">
              {{ item.invoice_number }}
            </td>
            <td class="font-weight-medium subHeadingFontSize mb-0">
              <div class="status__con">
                {{ item.customer_name }}
              </div>
            </td>
            <td class="font-weight-medium subHeadingFontSize mb-0">
              <div class="status__con">
                {{ item.terms_name }}
              </div>
            </td>

            <td class="font-weight-medium subHeadingFontSize mb-0">
              <div class="status__con">
                {{ item.invoice_date | ticketingDateFormatter }}
              </div>
            </td>
            <td class="font-weight-medium subHeadingFontSize mb-0">
              <div class="status__con">
                <td class="">
                  <b>{{ formatCurrency(item.total) }}</b>
                </td>
              </div>
            </td>
            <td class="font-weight-medium subHeadingFontSize mb-0">
              <div class="status__con">
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
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-col>
    <InvoicePreview
      v-if="selectedInvoiceId"
      :invoice_id="selectedInvoiceId"
      @close="selectedInvoiceId = null"
    />
    <!-- <v-dialog
      v-model="invoicePreviewFlag"
      persistent
      width="50vw"
      height="100vh"
      content-class="proposal_dialog"
    >
      <div class="dialog_proposal">
        <v-card id="card" class="dialog_custom">
          <v-card-title id="card-title">
            <v-row>
              <v-col cols="12" class="ma-0 pa-0">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text--text">Approve the Invoice</h4>
                  <div class="d-flex align-center justify-end">
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext">
                      <span class="" @click="closeApprovalDialog(InvoiceDetails)">Close</span>
                    </v-btn>
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="primary">
                      <span class="" @click="openEditor(InvoiceDetails)">Edit</span>
                    </v-btn>
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="primary">
                      <span class="" @click="openCreditNoteEditor(InvoiceDetails)">Credit Note</span>
                    </v-btn>
                    <v-btn class="tall__btn pl-6 pr-6" color="primary" @click="handleInvoice">
                      Approve
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-title>
          <v-container class="ma-0 pa-0">
            <InvoicePreview :invoice_id="InvoiceDetails._id" />
          </v-container>
        </v-card>
      </div>
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
        <CreditNote @close="handleClose" :selectedBilling="selectedItem" />
      </div>
    </v-dialog>
    <BillingsPaymentDialog
      v-if="billingsPaymentDialogs"
      :selectedEmployerStatus="selectedEmployerStatus"
      :dialogData="billingsPaymentDialogs"
      @close="closeBillingsDialog"
      @mail-clicked="getBillingsEmail(InvoiceDetails)"
      @download-clicked="downloadInvoice(InvoiceDetails._id)"
      @print-clicked="printInvoice(InvoiceDetails._id)"
    >
      <template v-slot:invoice-preview v-if="selectedEmployerStatus == 'Paid'">
        <InvoicePreview :invoice_id="InvoiceDetails._id" />
      </template>
    </BillingsPaymentDialog>

    <SendRawEmail
      v-if="sendRawEmailDialog"
      :emailBody="emailBody"
      @close="closeDialogs"
      :automateCurrentAction="false"
      :attachments="emailAttachments"
      @successfull="actionSuccessEmail"
    />

    <NewGeneralInvoiceDialog
      v-if="newGeneralInvoice"
      :show="newGeneralInvoice"
      :key="invoiceKey"
      :company="selectedItem?.companyDetails"
      :invoiceToEdit="computedSelectedInvoice"
      @close="newGeneralInvoice = false"
      @reload="handleReload"
    />

    <InvoicePreviewPanel
      v-if="invoicePreviewFlag"
      :open="invoicePreviewFlag"
      :key="InvoiceDetails?._id"
      :InvoiceDetails="InvoiceDetails"
      @closeApprovalDialog="closeApprovalDialog($event)"
      @openEditor="openEditor($event)"
      @handleInvoice="handleInvoice($event)"
      @reload="handleReload"
      @sendInvoiceEmail="getBillingsEmail($event)"
      @add-payment="handleRecordPayment($event)"
    />

    <RecordPayment
      v-if="recordPayment"
      :open="recordPayment"
      :key="`${InvoiceDetails?._id}-${recordPayment.toString()}`"
      :invoice_id="InvoiceDetails?._id"
      @successfull="actionSuccess"
      @close="closeDialogs"
    />

    <SnackBar :data="snackbar_data" />
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_invoiceTableCustomer.scss'
import EditSvg from '@/assets/images/Customer/edit.svg'
import InvoicePreview from '~/components/ProcessFlow/ActionPreview/InvoicePreview.vue'
import BillingsPaymentDialog from '@/components/Dialogs/billingsPaymentDialog.vue'
import EditBillingsMode from '@/components/EditModel/editBillings.vue'
import CreditNote from '~/components/Billings/CreditNote.vue'
import SendRawEmail from '~/components/ProcessFlow/SendEmail/sendRawEmail.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import RecordPayment from '~/components/Dialogs/createInvoicePaymentRecord.vue'
import NewGeneralInvoiceDialog from '@/components/Dialogs/generalInvoiceDialog.vue'

export default {
  components: {
    InvoicePreview,
    EditBillingsMode,
    CreditNote,
    BillingsPaymentDialog,
    EditSvg,
    SendRawEmail,
    SnackBar,
    NewGeneralInvoiceDialog,
    RecordPayment,
  },
  props: { selectedCustomer: String },
  data() {
    return {
      Invoice_data: [],
      recordPayment: false,
      invoicePreviewFlag: false,
      newGeneralInvoice: false,
      invoiceKey: 111,
      InvoiceDetails: {},
      selectedEmployerStatus: '',
      billingsPaymentDialogs: false,
      creditNoteEditor: false,
      snackbar_data: {},
      emailAttachments: [],
      emailBody: {},
      sendRawEmailDialog: false,
      selectedItem: {},
      editDocument: false,
      billings_documents_headers: [
        {
          text: 'Invoice No',
          value: 'invoice_number',
          align: 'start',
          sortable: false,
        },
        {
          text: 'Employer',
          value: 'customer_name',
          align: 'center',
          sortable: false,
        },
        {
          text: 'Term Name',
          value: 'terms_name',
          align: 'center',
          sortable: false,
        },

        {
          text: 'Invoice Date',
          value: 'invoice_date',
          align: 'center',
          sortable: false,
        },
        { text: 'Amount', value: 'total', align: 'center', sortable: false },
        { text: 'Status', value: 'status', align: 'center', sortable: false },
      ],
      page: 0,
      limit: '10',
      invoiceList: [],
      dataLoading: false,
      totalAmountDue: 0,
      selectedInvoiceId: null,
      filter: {
        totalResults: 0,
      },
      options: {
        sortBy: [],
        page: 1,
        itemsPerPage: 10,
      },
      first_load_fetch: true,
      updating_filters: false,
    }
  },
  watch: {
    filter: {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.getEmployerInvoiceDetails()
        }
      },
      deep: true,
    },
    options: {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          console.log('options changes: ', this.options)
          this.getEmployerInvoiceDetails()
        }
      },
      deep: true,
    },
  },
  computed: {
    computedSelectedInvoice() {
      return Object.keys(this.selectedItem).length
        ? this.selectedItem
        : undefined
    },
    computedSortBy() {
      return this.options.sortBy
        .map(
          (field, index) =>
            `${field}:${this.options.sortDesc[index] ? 'desc' : 'asc'}`
        )
        .join(',')
    },
  },
  async mounted() {
    await this.getEmployerInvoiceDetails().then(() => {
      this.first_load_fetch = false
    })
    await this.getTotalAmountDueForCompany()
  },
  methods: {
    handleRecordPayment(InvoiceDetails) {
      this.recordPayment = true
    },
    openEditor(invoice) {
      console.log('called to open modal', invoice)
      this.newGeneralInvoice = true
      this.invoiceKey++
      this.selectedItem = invoice
    },
    async handleReload() {
      console.log('reloading data')
      await this.getEmployerInvoiceDetails()
      await this.getTotalAmountDueForCompany()
    },
    async getEmployerInvoiceDetails() {
      console.log('what is the customer id', this.selectedCustomer)
      this.dataLoading = true
      this.page++

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const response = await this.$axios.$post(
          `/invoice/list`,
          { company_id: [this.selectedCustomer] },
          {
            params: {
              sortBy: this.computedSortBy,
              page: this.options.page,
              limit: this.options.itemsPerPage,
            },
            headers: {
              Authorization: AuthStr,
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }
        )
        this.updating_filters = true
        console.log('The data is', response.results)
        this.invoiceList = response?.results || []
        this.options.page = response.page
        // this.filter.limit = response.limit
        this.options.itemsPerPage = response.limit
        this.filter.totalResults = response.totalResults
      } catch (error) {
        console.log('Could not fetch customer invoices: ', error?.message)
      } finally {
        this.updating_filters = false
        this.dataLoading = false
      }
    },
    encodeObject(obj) {
      const str = JSON.stringify(obj)
      return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    },
    formatCurrency(m) {
      if (isNaN(m)) {
        return null
      }

      return m.toLocaleString('en-US', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    },
    async getTotalAmountDueForCompany() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios
          .$post(
            `/invoice/amount/due/companies?limit=1`,
            { companyId: this.selectedCustomer },
            { headers: { Authorization: AuthStr } }
          )
          .then((response) => {
            const formattedAmount = new Intl.NumberFormat('en-AE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(response.totalAmount)
            console.log('The total amount due for company is', formattedAmount)
            this.totalAmountDue = `AED ${formattedAmount}`
          })
      } catch (error) {
        throw new Error(error)
      }
    },
    handleEmployerId(item) {
      this.selectedEmployerStatus = item.status
      this.InvoiceDetails = item
      // if (this.selectedEmployerStatus == 'Paid') {
      //   this.billingsPaymentDialogs = true
      // } else {
      this.invoicePreviewFlag = true
      this.billingsPaymentDialogs = false
      // }
    },
    handleEditBillings() {
      this.editDocument = !this.editDocument
    },
    closeApprovalDialog(value) {
      this.invoicePreviewFlag = !this.invoicePreviewFlag
      if (value) {
      }
    },
    handleClose() {
      this.creditNoteEditor = false
    },
    async updateBillingsData() {
      this.showEditModel = !this.showEditModel
      this.selectedItem = {}
      await this.getBillingList()
    },
    handleUpdateSuccess() {
      this.invoicePreviewFlag = false
    },
    closeBillingsDialog() {
      this.billingsPaymentDialogs = false
      this.getEmployerInvoiceDetails(this.selectedCustomer)
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
    async handleInvoice() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/generic/invoice/approve`, this.InvoiceDetails, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.invoicePreviewFlag = false
          this.getEmployerInvoiceDetails()
        })
    },

    // openEditor(invoice) {
    //   this.editDocument = !this.editDocument
    //   this.selectedItem = invoice
    // },

    openCreditNoteEditor(invoice) {
      this.creditNoteEditor = !this.creditNoteEditor
      this.selectedItem = invoice
    },
    closeDialogs() {
      this.sendRawEmailDialog = false
      this.recordPayment = false
    },
    actionSuccessEmail() {
      this.sendRawEmailDialog = false
    },

    async getBillingsEmail(item) {
      console.log('What is the item', item)
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

        const previewresponse = await this.$axios.$post(
          `/invoice/getpreviewpdf`,
          { invoice_id: `${item?.id ?? item?._id}` },
          { headers: { Authorization: AuthStr } }
        )

        const _emailTemplates = await this.$axios.$get(
          `/email_template/get/all`,
          { headers: { Authorization: AuthStr } }
        )

        const templateNames = {
          Due: 'Invoice Payment Due',
          Overdue: 'Invoice Payment Overdue',
          Paid: 'Invoice Paid',
        }

        const replacements = {
          '<p>Dear\\s(.*?)</p>': `<p>Dear ${item.customer_name}</p>`,
        }

        await this.fetchAndCustomizeEmailTemplate(
          item,
          templateNames[item.status],
          replacements,
          _emailTemplates,
          AuthStr
        )

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
      AuthStr
    ) {
      const ids = _emailTemplates.filter((val) => val.module === 'companies')

      if (ids.length === 0) {
        console.error('No template found for', templateName)
        return
      }

      try {
        const emailTemplate = await this.$axios.$get(
          `/email_template/id/${ids[0].id}?invoice_number=${item.invoice_number}`,
          { headers: { Authorization: AuthStr } }
        )

        this.emailBody = emailTemplate
        let content = this.emailBody.content

        for (const [key, value] of Object.entries(replacements)) {
          content = content.replace(new RegExp(key, 'g'), value)
        }

        this.emailBody.content = content
      } catch (error) {
        console.error('Error loading the template', error)
        throw new Error(error)
      }
    },
  },
}
</script>
