<template>
  <!-- document  Dialog -->
  <v-dialog id="custom_dialog" v-model="dialogData" width="45vw" height="100vh" content-class="proposal_dialog">
    <div class="dialog_proposal">
      <v-card id="card" style="padding: 20px 30px !important; height: 100vh !important">
        <v-card-title id="card-title" class="mb-5">
          <v-row>
            <v-col cols="12" class="ma-0 pa-0">
              <div class="d-flex align-center justify-space-between">
                <div class=" d-flex ">
                  <v-icon color="black" dense class="mr-5" @click="close()">fa-arrow-left</v-icon>
                  <h4 class="text--text">{{ selectedDoc.name }}</h4>
                </div>
                <div class="d-flex align-center justify-end">
                  <v-btn class="tall__btn mr-3 pl-4 pr-4 span_data" color="subtext" outlined @click="sendMail()"><span
                      class="">Mail</span>
                  </v-btn>
                  <v-btn class="tall__btn mr-3 pl-4 pr-4 span_data" color="subtext" outlined @click="shareDialog = true;">
                    <span class="">Share</span>
                  </v-btn>
                  <v-btn v-if="documentType == 'image' || documentType == 'pdf'"
                    class="tall__btn mr-3 pl-4 pr-4 span_data" color="subtext" outlined
                    @click="printScreen(selectedDoc.url)">
                    <span class="">Print</span>
                  </v-btn>
                  <v-btn class="tall__btn pl-4 pr-4 span_data" color="primary"
                    @click="downloadFile(selectedDoc.url)">Download</v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text id="card-text2">
          <v-divider class=""></v-divider>
          <!-- document -->
          <div div style="text-align: center" v-if="pdfEdit">
            <!-- <embed type="image/jpg" :src="documentPath" width="100%" v-if="documentType == 'image'" />
              <embed type="application/pdf" :src="documentPath + '#toolbar=0'" v-else-if="documentType == 'pdf'"
              width="100%" height="650px" /> -->
            <span v-if="documentType != 'image' && documentType != 'pdf'">Preview Not Available</span>
            <iframe v-else id="myFrame" frameborder="0" style="border:0;" width="100%" height="650px">
            </iframe>

          </div>

          <div div style="text-align: center" v-else>
            <span>Generating Preview</span>
          </div>
        </v-card-text>

      </v-card>
      <!--shareDialog-->
      <v-dialog v-model="shareDialog" max-width="500">
        <v-card style="">
          <v-card-title>
            <div class="label">
              Copy Url
            </div>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="selectedDoc.url" readonly dense append-icon="fa-clone"
              @click:append="copyURL(selectedDoc.url)"></v-text-field>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- snackbar -->
      <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
        {{ snackText }}

        <template v-slot:action="{ attrs }">
          <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
        </template>
      </v-snackbar>

    </div>

  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import FileDropzone from '~/components/utils/FileDropzone.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'


export default {
  components: {
    CustomInputContainer,
    CalenderSvg,
    FileDropzone,
    EditPDF: () => {
      if (process.client) {
        return import('~/components/document-editor/pdfviewer.vue')
      }
    },
  },
  props: {
    selectedEmployerStatus: String,
    selectedDoc: Object,
  },
  data() {
    return {
      dialogData: Boolean,
      documentLoading: false,
      products: [],
      shareDialog: false,
      snack: false,
      snackColor: '',
      snackText: '',
      //view estimate
      // snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      date_menu: false,
      estimate_date: new Date().toISOString().substr(0, 10),
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),
      table_products: [
        {
          id: Math.random(),
          service: '',
          employee_name: '',
          employee_type: '',
          description: '',
          MOL_Salary: 'N/A',
          Non_MOL_Salary: 'N/A',
        },
      ],
      table_headers: [
        'Employee',
        'Type',
        'Description',
        'MOL Salary',
        'Non MOL Salary',
        'Actions',
      ],
      employersList: ['Binance', 'Coke', 'EirBlue', 'Fly Dubai'],
      paymentMethods: ['Bank', 'Cash', 'Other'],
      // date 
      exp_date_menu: false,
      exp_date: new Date().toISOString().substr(0, 10),
      //exit reason list
      exitReason: ['Termination', 'Resignation', 'End Of Contract'],
      main_rule: [(v) => !!v || 'This filed is required'],
      numberRule: [
        (v) => {
          if (!!v) return 'This Field is required'
          if (!isNaN(parseInt(v)) && v >= 0 && v <= 999) return true
          return 'Number has to be between 0 and 999'
        },
      ],
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      phone_rule: [],
      documentPath: "",
      pdfEdit: false,
      documentType: '',
    }
  },
  mounted() {
    this.getBase64Conversion(this.selectedDoc)
    // console.log(this.selectedDoc,'------selectedDoc')
  },
  watch: {
    dialogData(val) {
      // console.log(val, '----dal')
      if (val == 'false' || val == false) {
        // this.selectedDoc = {}
        // this.selectedDoc = ''
        this.close()
      }
    }
  },
  methods: {
    handleAddProduct() {
      let obj = {
        id: Math.random(),
        service: '',
        employee_name: '',
        description: '',
      }
      this.table_products.push(obj)
    },
    handleDeleteProduct(id) {
      this.table_products = this.table_products.filter(
        (el, index) => el.id !== id
      )
    },
    close() {
      this.$emit('close')
    },
    async getBase64Conversion(doc) {
      this.documentLoading = true
      this.pdfEdit = true

      var blobURL = await fetch(doc.url).then(r => r.blob());
      this.documentType = this.getFileFormat(blobURL.type)
      var newurl = window.URL.createObjectURL(blobURL);
      if (this.documentType == 'image' || this.documentType == 'pdf') {
        setTimeout(() => {
          document.getElementById("myFrame").src = newurl + '#toolbar=0';
        }, 1);
      }


      // if (this.documentType == 'word' || this.documentType == 'excel' || this.documentType == 'powerpoint' || this.documentType == 'other') {
      //   this.initiateDownload(doc.url)
      // }


      // const fetchUrlContent = async (url) => {
      //   const response = await fetch(url);
      //   const blob = await response.blob();
      //   // console.log(this.documentType, '-----------documentType')


      //   const file = new File([blob], 'filename.pdf');
      //   return file;
      // };

      // const toBase64 = file => new Promise((resolve, reject) => {
      //   const reader = new FileReader();
      //   reader.readAsDataURL(file);
      //   reader.onload = () => resolve(reader.result);
      //   reader.onerror = error => reject(error);
      // });

      // const file = await fetchUrlContent(doc.url);
      // this.documentPath = doc.url

    },
    getFileFormat(mimeType) {
      let fileFormat = '';

      if (mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/jpg' || mimeType === 'image/gif') {
        fileFormat = 'image';
      } else if (mimeType === 'application/pdf') {
        fileFormat = 'pdf';
      } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileFormat = 'word';
      } else if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        fileFormat = 'excel';
      } else if (mimeType === 'application/vnd.ms-powerpoint' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        fileFormat = 'powerpoint';
      } else {
        fileFormat = 'other';
      }

      return fileFormat;
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
    printScreen(url) {
      let objFra = document.getElementById('myFrame');
      objFra.contentWindow.focus();
      objFra.contentWindow.print();
    },
    savePDF() { },
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
      const body = `Please find the attachment at the following URL: ${this.selectedDoc.url}`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }
  },
}
</script>
<style lang="scss">
.dynamic_table {
  .dynamic_table_thead {
    tr {
      background: #e2e7f180 !important;
    }
  }

  .dynamic_table_tbody {
    .dynamic_table_body_rows {

      // border-bottom: 0.5 solid red !important;
      &:hover {
        background: #e2e7f142 !important;
      }
    }
  }
}

.estimate__container {
  background: #e2e7f180;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  width: 400px;
  // height: 120px;
}

.label {
  padding: 10px;
  font-size: 18px;
  color: #111;
}
</style>