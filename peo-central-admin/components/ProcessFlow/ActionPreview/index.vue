<template>
  <div>

    <UploadDocumentPreview v-if="actiontype == 'uploaded document' && action.uploaded_document_id" :action="action" />
    <GeneratedDocumentPreview v-if="actiontype == 'generated document' && action.generated_document_id" :action="action"
      :actionIndex="actionIndex" :processIndex="processIndex" />
    <DocumentPreview v-else-if="actiontype == 'document' && action.template_id" :action="action" />
    <InvoicePreview v-else-if="actiontype == 'invoice creation'" :invoice_id="currentProcess.invoice_id" />
    <VisaPreview v-else-if="actiontype == 'visa process'" :module="module" :foreign_id="foreign_id"
      :identifier="identifier" />
    <UploadDocuments v-else-if="actiontype == 'document upload'" :action="action" :module="module"
      :identifier="identifier" :foreign_id="foreign_id" @successfull="successfull" />
  </div>
</template>

<script>

import DocumentPreview from './DocumentPreview'
import InvoicePreview from './InvoicePreview.vue'
import UploadDocuments from './UploadDocuments'
import VisaPreview from './VisaPreview.vue'
import UploadDocumentPreview from './UploadDocumentPreview.vue'
import GeneratedDocumentPreview from './GeneratedDocumentPreview.vue'
export default {
  components: {
    UploadDocumentPreview,
    GeneratedDocumentPreview,
    DocumentPreview,
    UploadDocuments,
    InvoicePreview,
    VisaPreview,
  },
  props: {
    action: Object,
    currentProcess: Object,
    module: String,
    foreign_id: String,
    identifier: String,
    processIndex: Number,
    actionIndex: Number
  },
  mounted() {
  },
  methods: {
    successfull() {
      this.$emit('successfull')
    },
  },
  data() {
    return {
      actiontype: this.action?.uploaded_document_id ? "uploaded document" : this.action?.generated_document_id ? 'generated document' : this.action.action_type
    }
  },
}
</script>
