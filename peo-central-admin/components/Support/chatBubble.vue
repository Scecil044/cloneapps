<template>
  <div>
    <div :class="[loggedInUserId ===
      ticketChat?.sender?._id ? 'chat-balloon' : 'chat-balloon-user']" v-html="ticketChat?.content"></div>
    <div class="mt-3">
      <div v-for="ticket_url in ticketChat.attachments" :key="ticket_url" class="attachment-preview">
        <!-- Image Preview -->
        <div v-if="isImageFile(ticket_url)" class="image-preview">
          <v-img
            :src="ticket_url"
            max-height="200"
            max-width="300"
            contain
            @click="openInNewTab(ticket_url)"
            style="cursor: pointer; border-radius: 8px;"
          ></v-img>
          <div class="mt-1">
            <a :href="ticket_url" target="_blank" class="text-decoration-none">
              <v-icon small class="mr-1">mdi-download</v-icon>
              Download Image
            </a>
          </div>
        </div>

        <!-- PDF Preview -->
        <div v-else-if="isPdfFile(ticket_url)" class="pdf-preview">
          <v-card outlined class="pa-3" style="max-width: 300px;">
            <div class="d-flex align-center">
              <v-icon large color="red" class="mr-3">mdi-file-pdf-box</v-icon>
              <div>
                <div class="font-weight-bold">PDF Document</div>
                <div class="text-caption grey--text">{{ getFileName(ticket_url) }}</div>
              </div>
            </div>
            <v-btn
              small
              color="primary"
              class="mt-2"
              @click="openInNewTab(ticket_url)"
            >
              <v-icon small class="mr-1">mdi-eye</v-icon>
              View PDF
            </v-btn>
          </v-card>
        </div>

        <!-- Document Preview -->
        <div v-else-if="isDocumentFile(ticket_url)" class="document-preview">
          <v-card outlined class="pa-3" style="max-width: 300px;">
            <div class="d-flex align-center">
              <v-icon large color="blue" class="mr-3">mdi-file-document</v-icon>
              <div>
                <div class="font-weight-bold">Document</div>
                <div class="text-caption grey--text">{{ getFileName(ticket_url) }}</div>
              </div>
            </div>
            <v-btn
              small
              color="primary"
              class="mt-2"
              @click="openInNewTab(ticket_url)"
            >
              <v-icon small class="mr-1">mdi-download</v-icon>
              Download
            </v-btn>
          </v-card>
        </div>

        <!-- Default Link -->
        <div v-else class="default-attachment">
          <a :href="ticket_url" target="_blank" class="text-decoration-none">
            <v-icon small class="mr-1">mdi-attachment</v-icon>
            {{ getFileName(ticket_url) }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatBubble',
  props: ['ticketChat', 'loggedInUserId'],
  data() {
    return {}
  },
  methods: {
    isImageFile(url) {
      if (!url) return false
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
      const lowerUrl = url.toLowerCase()
      return imageExtensions.some(ext => lowerUrl.includes(ext))
    },
    isPdfFile(url) {
      if (!url) return false
      return url.toLowerCase().includes('.pdf')
    },
    isDocumentFile(url) {
      if (!url) return false
      const docExtensions = ['.doc', '.docx', '.txt', '.rtf', '.odt']
      const lowerUrl = url.toLowerCase()
      return docExtensions.some(ext => lowerUrl.includes(ext))
    },
    getFileName(url) {
      if (!url) return 'Unknown File'
      try {
        const urlParts = url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        // Remove query parameters if any
        return fileName.split('?')[0]
      } catch (error) {
        return 'Unknown File'
      }
    },
    openInNewTab(url) {
      if (url) {
        window.open(url, '_blank')
      }
    }
  }
}
</script>

<style lang="css" scoped>
.chat-balloon-user {
  background: rgba(9, 183, 59, 0.25);
  padding: 10px;
  border-radius: 10px;
  display: inline-block;
  max-width: 85%;
  position: relative;
  width: 100%;
}

.chat-balloon-user>p>img {
  width: 100% !important;
}

.chat-balloon-user,
.chat-balloon,
.chat-balloon p,
.chat-balloon-user p {
  font-size: 13px !important;
}

.chat-balloon p img,
.chat-balloon-user p img {
  max-width: 600px;
  width: 100%;
}

.attachment-preview {
  margin-bottom: 8px;
}

.image-preview {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  background: #fafafa;
}

.pdf-preview,
.document-preview {
  margin-top: 4px;
}

.default-attachment {
  padding: 4px 0;
}

.default-attachment a {
  color: #1976d2;
  font-size: 13px;
}

.default-attachment a:hover {
  text-decoration: underline !important;
}
</style>
