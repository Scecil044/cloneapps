<template>
  <v-navigation-drawer
    v-model="isOpen"
    fixed
    temporary
    right
    width="600"
    class="document-preview-drawer"
    overlay-opacity="0.7"
    overlay-color="#000"
    style="z-index: 1001;"
  >
    <div class="drawer-header pa-4 d-flex align-center">
      <h3 class="tw-text-lg tw-font-medium">{{ document?.name || 'Document Preview' }}</h3>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider></v-divider>

    <div class="drawer-content pa-4">
      <!-- Document Info -->
      <div class="tw-mb-6 tw-pb-4 tw-border-b tw-border-gray-200">
        <div class="tw-flex tw-items-center tw-gap-3 tw-mb-4">
          <v-icon :color="getDocumentIconColor(document?.type)" size="32">
            {{ getDocumentIcon(document?.type) }}
          </v-icon>
          <div>
            <div class="tw-font-medium tw-text-base tw-text-gray-900">
              {{ document?.name || 'Untitled Document' }}
            </div>
            <div class="tw-text-sm tw-text-gray-500 tw-flex tw-items-center tw-gap-2">
              <span>{{ formatDocumentType(document?.type) }}</span>
              <span v-if="document?.createdAt">
                • {{ formatDate(document?.createdAt) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Additional document metadata if available -->
        <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
          <div v-if="document?.document_number" class="tw-flex tw-flex-col">
            <span class="tw-text-gray-500">Document Number</span>
            <span class="tw-font-medium">{{ document.document_number }}</span>
          </div>
          <div v-if="document?.expiry" class="tw-flex tw-flex-col">
            <span class="tw-text-gray-500">Expiry Date</span>
            <span class="tw-font-medium">{{ formatDate(document.expiry) }}</span>
          </div>
          <div v-if="document?.status" class="tw-flex tw-flex-col">
            <span class="tw-text-gray-500">Status</span>
            <span 
              :class="getStatusClass(document.status)"
              class="tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-inline-block tw-w-fit">
              {{ formatStatus(document.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Document Preview -->
      <div class="document-preview-container tw-mb-6" style="height: calc(100vh - 300px);">
        <!-- Show PDF/Image preview for supported types -->
        <div v-if="isPdfFile" class="tw-h-full tw-w-full tw-overflow-hidden tw-flex tw-justify-center tw-bg-gray-100">
          <iframe 
            :src="document.url" 
            class="tw-w-full tw-h-full"
            frameborder="0"
            style="min-height: 500px;"
          ></iframe>
        </div>
        
        <div v-else-if="isImageFile" class="tw-h-full tw-w-full tw-overflow-hidden tw-flex tw-justify-center tw-items-center tw-bg-gray-100">
          <img 
            :src="document.url" 
            alt="Document Preview" 
            class="tw-max-w-full tw-max-h-full tw-object-contain"
          />
        </div>
        
        <!-- Fallback for other file types -->
        <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-bg-gray-100 tw-rounded-lg">
          <v-icon :color="getDocumentIconColor(document?.type)" size="64" class="tw-mb-4">
            {{ getDocumentIcon(document?.type) }}
          </v-icon>
          <p class="tw-text-gray-600 tw-mb-2">Preview not available for this file type</p>
          <p class="tw-text-gray-500 tw-text-sm tw-mb-6">Please download the file to view its contents</p>
          <v-btn 
            color="primary" 
            @click="downloadDocument(document)"
            :loading="downloading"
          >
            <v-icon left>mdi-download</v-icon>
            Download File
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="drawer-actions pa-4 tw-border-t tw-border-gray-200">
      <v-btn 
        text 
        @click="close" 
        class="mr-2"
      >
        Close
      </v-btn>
      <v-btn 
        color="primary" 
        @click="downloadDocument(document)"
        :loading="downloading"
      >
        <v-icon left>mdi-download</v-icon>
        Download
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    value: Boolean,
    document: Object
  },
  data() {
    return {
      downloading: false
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    isPdfFile() {
      if (!this.document?.type) return false
      return this.document.type.toLowerCase() === 'pdf'
    },
    isImageFile() {
      if (!this.document?.type) return false
      const type = this.document.type.toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)
    }
  },
  methods: {
    close() {
      this.isOpen = false
    },
    
    getDocumentIcon(type) {
      const iconMap = {
        'pdf': 'mdi-file-pdf-box',
        'doc': 'mdi-file-word-box',
        'docx': 'mdi-file-word-box',
        'xls': 'mdi-file-excel-box',
        'xlsx': 'mdi-file-excel-box',
        'ppt': 'mdi-file-powerpoint-box',
        'pptx': 'mdi-file-powerpoint-box',
        'jpg': 'mdi-file-image',
        'jpeg': 'mdi-file-image',
        'png': 'mdi-file-image',
        'gif': 'mdi-file-image',
        'txt': 'mdi-file-document',
        'zip': 'mdi-folder-zip',
        'rar': 'mdi-folder-zip',
      };
      
      if (!type) return 'mdi-file';
      
      const extension = type.toLowerCase();
      return iconMap[extension] || 'mdi-file';
    },
    
    getDocumentIconColor(type) {
      const colorMap = {
        'pdf': '#E53E3E',        // Red for PDF
        'doc': '#2B6CB0',        // Blue for Word
        'docx': '#2B6CB0',
        'xls': '#38A169',        // Green for Excel
        'xlsx': '#38A169',
        'ppt': '#D69E2E',        // Orange for PowerPoint
        'pptx': '#D69E2E',
        'jpg': '#9F7AEA',        // Purple for images
        'jpeg': '#9F7AEA',
        'png': '#9F7AEA',
        'gif': '#9F7AEA',
        'txt': '#4A5568',        // Gray for text
        'zip': '#6B46C1',        // Purple for archives
        'rar': '#6B46C1',
      };
      
      if (!type) return '#718096';
      
      const extension = type.toLowerCase();
      return colorMap[extension] || '#718096';
    },
    
    formatDocumentType(type) {
      if (!type) return 'Document';
      return type.toUpperCase();
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return '';
      }
    },
    
    formatStatus(status) {
      if (!status) return '';
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    
    getStatusClass(status) {
      const statusClasses = {
        'active': 'tw-bg-green-100 tw-text-green-800',
        'pending': 'tw-bg-yellow-100 tw-text-yellow-800',
        'completed': 'tw-bg-blue-100 tw-text-blue-800',
        'expired': 'tw-bg-red-100 tw-text-red-800',
        'draft': 'tw-bg-gray-100 tw-text-gray-800',
      };
      
      return statusClasses[status?.toLowerCase()] || 'tw-bg-gray-100 tw-text-gray-800';
    },
    
    async downloadDocument(doc) {
      if (!doc || !doc.url) {
        this.$emit('show-message', 'Document URL not available', 'error');
        return;
      }
      
      try {
        this.downloading = true;
        
        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name || 'document';
        link.target = '_blank';
        
        // For security, check if URL is external
        if (doc.url.startsWith('http') && !doc.url.includes(window.location.origin)) {
          // External URL - open in new tab
          window.open(doc.url, '_blank');
        } else {
          // Internal URL - trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        this.$emit('show-message', 'Document download started', 'success');
      } catch (error) {
        console.error('Error downloading document:', error);
        this.$emit('show-message', 'Failed to download document', 'error');
      } finally {
        this.downloading = false;
      }
    }
  }
}
</script>

<style scoped>
.document-preview-drawer {
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.drawer-header {
  background-color: #f9fafc;
}
</style>
