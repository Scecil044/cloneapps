<template>
  <div style="width: 100%">
    <div>
      <v-btn class="short__btn" color="primary" @click="openAddDocumentComponent()">New</v-btn>
    </div>
    <!-- # Invoices Data Table -->
    <v-row class="row1">
      <v-col cols="12" class="pt-3 pb-0">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h5>{{ EmployerDocs.length }} Docs</h5>
          </div>
          <!-- <template>
  <div>
    <a @click.prevent="uploadFile">Click here to upload file</a>
  </div>
</template> -->
          <!-- <template>
  <div>
    <form ref="form" style="display:none">
      <input type="file" ref="file" name="file" />
    </form>
  </div>
</template> -->
        </div>
      </v-col>
      <v-col cols="12" class="pt-6 pb-0">
        <!-- <p>{{ this.EmployerDocs }}</p> -->
        <v-data-table id="coa_table" class="main__table elevation-0 document_table" :loading="dataLoading"
          loading-text="Loading... Please wait" :headers="headers" :items="EmployerDocs"
          :footer-props="{ 'items-per-page-options': [10, 20] }" hide-default-footer>
          <template v-slot:item="{ item }">
            <tr class="table_row">
              <td class="" @click="openDocument(item.url)">
                <div class="d-flex align-center">
                  <span class="pr-2">
                    <PdfSvg />
                  </span>
                  {{ item.name }}
                </div>
              </td>
              <td class="">
                <div class="">
                  {{ item.expiry ? item.expiry : 'N/A' }}
                </div>
              </td>
              <td class="pa-0 ma-0 pl-3">
                <div class="">
                  <span class="table_btn light_accent4 accent4--text" v-if="item.doc_status == 'valid'">{{ item.doc_status
                  }}</span>
                  <span class="table_btn light_accent3 accent3--text" v-else-if="item.doc_status == 'Soon Expiring'">{{
                    item.doc_status }}</span>
                  <span class="table_btn light_accent2 accent2--text" v-else-if="item.doc_status == 'Expired'">{{
                    item.doc_status }}</span>
                  <span class="table_btn red white--text" v-else>{{ item.doc_status }}</span>
                </div>
              </td>
              <td class="">
                <!-- <div class="d-flex align-center justify-space-between">
                  <a href="#"  @change="uploadDocument">
                      Upload
                  </a>
                  <template>
                  <v-file-input hide-input flat solo  prepend-icon="none"  style="box-shadow: none !important;" type="file" accept=".pdf" />
                     </template>

                  <a href="#" class="accent2--text">Delete</a>
                </div> -->
                <!-- upload document -->
                <div class="d-flex align-center justify-space-between">
                  <a href="#">Upload</a>
                  <template>
                    <v-file-input hide-input flat solo prepend-icon="none" style="box-shadow: none !important" type="file"
                      accept=".pdf" @change="uploadDocument($event, item)" />
                  </template>
                  <a href="#" class="accent2--text" @click="deleteDocument(item._id)">Delete</a>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <!--Document ADD-->
    <DocumentAddition @close="documentAdd = false" :type="'new'" @updated="updatedDocument()" v-if="documentAdd"
      :module="'companies'" :foreign_id="selectedCustomer" />

    <!---Delete Document-->
    <v-dialog v-model="deleteDialog" transition="dialog-top-transition" max-width="600">
      <v-card>
        <v-card-title color="grey lighten-2" class="font-weight-bold">
          Are You Sure You Want To Delete This Document?
        </v-card-title>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn text color="blue" class="body-2 font-weight-bold" outlined dark @click="deleteDoc()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import '@/assets/scss/utils/_customerDocumentsTable.scss'
import PdfSvg from '@/assets/images/icons/pdf.svg'
import SnackBar from '~/components/utils/SnackBar.vue'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
import DocumentAddition from '@/components/Dialogs/documentAddDialog.vue'

export default {
  components: {
    SnackBar,
    DarkArrow,
    PdfSvg,
    DocumentAddition
  },
  props: { selectedCustomer: String },
  data() {
    return {
      //Api data
      documentAdd: false,
      EmployerDocs: [],
      documentId: '',
      // foreignId: '',
      isUpdate: true,
      file: '',

      titles: ['Invoice No', 'Customer', 'Type', 'Type', 'Status', 'Action'],
      headers: [
        { text: 'Document', value: 'documents', align: 'start' },
        { text: 'Expiry Date', value: 'expiry_date', align: 'start' },
        { text: 'Expiry Status', value: 'status', align: 'start' },
        { text: 'Action', value: 'action', align: 'start' },
      ],
      deleteDialog: false,
      dataLoading: false,
    }
  },
  methods: {
    updatedDocument() {
      this.documentAdd = false
      setTimeout(() => {
        this.documentAdd = true
      }, 1);
      this.EmployerDocuments()
    },

    openAddDocumentComponent() {
      this.documentAdd = true
    },
    deleteDocument(v) {
      this.documentId = v
      this.deleteDialog = true
    },
    openDocument(url) {
      window.open(url)
    },
    async EmployerDocuments() {
      this.dataLoading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$get(
          `/documents/foreignid/${this.selectedCustomer}`,
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          this.EmployerDocs = response
          this.dataLoading = false
        })
        .catch((err) => console.log(err))
    },
    async uploadDocument(event, item) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      if (event == undefined || !event.type) return

      const fd = new FormData()

      fd.append('documents', event)
      fd.append('foreign_id', this.selectedCustomer)
      fd.append('document_id', item.id)
      await this.$axios.$post(`/documents/upload/docid/foreignid/`, fd, { headers: { Authorization: AuthStr } })
        .then((res) => {
          const index = this.EmployerDocs.findIndex((el) => el.id === 2)
          this.EmployerDocs[index] = res
          this.EmployerDocuments()
        })
    },
    async deleteDoc() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$delete(`/documents/${this.documentId}`, { method: 'DELETE', headers: { Authorization: AuthStr } })
        .then((response) => {
          this.deleteDialog = false
          this.EmployerDocuments()
        })
    },
  },
  mounted() {
    this.EmployerDocuments()
  },
}
</script>
