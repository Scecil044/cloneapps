<template>
  <div>
    <v-row>
      <v-col cols="12" v-if="loading">
        <div style="justify-content: center;align-items: center;display: flex;">
          <v-img src="/animated/refresh.svg" max-width="fit-content" height="40" contain class="mr-3"></v-img>
        </div>
      </v-col>
      <v-col cols="12" v-else>
        <div class="d-flex align-center justify-end">
          <v-btn class="tall__btn mr-3 pl-4 pr-4 span_data" color="subtext" outlined @click="showHistory()"><span
              class="">History</span>
          </v-btn>
          <v-btn class="tall__btn mr-3 pl-4 pr-4 span_data" color="subtext" outlined @click="sendMail()"><span
              class="">Mail</span>
          </v-btn>
          <v-btn class="tall__btn mr-3 pl-4 pr-4 span_data" color="subtext" outlined @click="shareDialog = true;">
            <span class="">Share</span>
          </v-btn>
          <v-btn class="tall__btn mr-3 pl-4 pr-4 span_data" color="subtext" outlined
            @click="printScreen(uploadedDocument.url)">
            <span class="">Print</span>
          </v-btn>
          <v-btn class="tall__btn mr-3 pl-4 pr-4 span_data" color="primary" @click="editDocument()"><span
              class="">Edit</span>
          </v-btn>
          <v-btn class="tall__btn pl-4 pr-4 span_data" color="primary"
            @click="downloadFile(uploadedDocument.url)">Download</v-btn>
        </div>
        <div div style="text-align: center" class="mt-3">
          <iframe id="myFrame" frameborder="0" style="border:0;" width="100%" height="500px">
          </iframe>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="shareDialog" max-width="500">
      <v-card style="">
        <v-card-title>
          <div class="label">
            Copy Url
          </div>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="uploadedDocument.url" readonly dense append-icon="fa-clone"
            @click:append="copyURL(uploadedDocument.url)"></v-text-field>
        </v-card-text>
      </v-card>
    </v-dialog>
    <EditDocument v-if="editDocumentDialog" :action="action" @close="editDocumentDialog = false"
      @editSuccess="editSuccess" :actionIndex="actionIndex" :processIndex="processIndex" />
    <DocumentHistory v-if="showHistoryDialog" :action="action" @close="showHistoryDialog = false" />

  </div>
</template>

<script>

import EditDocument from './EditGeneratedDocument.vue'
import DocumentHistory from './DocumentHistory.vue'

export default {
  props: {
    action: Object,
    processIndex: Number,
    actionIndex: Number
  },
  components: {
    EditDocument,
    DocumentHistory
  },
  data() {
    return {
      shareDialog: false,
      loading: true,
      uploadedDocument: {},
      editDocumentDialog: false,
      showHistoryDialog: false,
    }

  },
  async mounted() {
    await this.getDocumentDetails(this.action.generated_document_id)
  },
  methods: {
    showHistory() {
      this.showHistoryDialog = true
    },
    editSuccess(event) {
      console.log(event)
      this.getDocumentDetails(event)
    },
    async editDocument() {
      this.editDocumentDialog = true
    },
    async downloadFile(url) {
      var blobURL = await fetch(url).then(r => r.blob());
      const aElement = document.createElement('a');
      let filename = url.split('/')[url.split('/').length - 1]
      aElement.setAttribute('download', filename);
      const href = URL.createObjectURL(blobURL);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
    },
    initiateDownload(url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'downloaded_file';
      link.target = '_blank';
      link.click();
      // this.close();
    },
    printScreen(url) {
      let objFra = document.getElementById('myFrame');
      objFra.contentWindow.focus();
      objFra.contentWindow.print();
    },
    copyURL(url) {
      navigator.clipboard.writeText(url)
        .then(() => {
          // Optional: Display a confirmation message or update a state variable to indicate the URL was copied
        })
        .catch((error) => {
          console.error('Error copying URL to clipboard:', error);
        });

      this.shareDialog = false

      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'URL Has Been Copied!'
    },
    sendMail() {
      // window.location.href = 'mailto:';

      const subject = 'Email Subject';
      const body = `Please find the attachment at the following URL: ${this.uploadedDocument.url}`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    },
    async getDocumentDetails(id) {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/documents/doc/${id}`, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.loading = false
          this.uploadedDocument = response
          var blobURL = await fetch(this.uploadedDocument.url).then(r => r.blob());
          var newurl = window.URL.createObjectURL(blobURL);
          document.getElementById("myFrame").src = newurl + '#toolbar=0';
        });
    }
  }
}
</script>
