<template>
  <div>
    <!-- Page Title when directly accessing a tab from the sidebar -->
    <div v-if="$route.query.tab" class="d-flex align-center mb-4 px-5 pt-5">
      <h2 class="text-h4 font-weight-bold">
        <span v-if="currentTab === 'central-repository'">Internal Resources</span>
        <span v-else-if="currentTab === 'companies'">Client Documents</span>
        <span v-else-if="currentTab === 'users'">Employee Documents</span>
      </h2>
    </div>

    <DocumentFilter v-if="currentTab !== 'central-repository'" @fetchedDocuments="clickedDocument($event)" :currentTab="currentTab" />

    <div v-if="loading && currentTab !== 'central-repository'" class="d-flex justify-center align-center py-10">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>
    <DocumentTable v-if="!loading && currentTab !== 'central-repository' && (showDocs || (showDocs = !showDocs))" :documentsArray="documents" :currentTab="currentTab" />

    <!-- Central Repository Coming Soon -->
    <DocumentsRepository v-if="currentTab === 'central-repository'" />
  </div>
</template>

<script>
import '@/assets/scss/_customers.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import DocumentFilter from '@/components/Documents/documentsFilter.vue'
import DocumentTable from '@/components/Documents/documentsTable.vue'
import DocumentsRepository from '@/components/Documents/documentsRepository.vue'

export default {
  layout: 'dashboard',
  head() {
    let title = 'Documents';
    
    // Set specific title based on the document type
    if (this.currentTab === 'central-repository') {
      title = 'Internal Resources';
    } else if (this.currentTab === 'companies') {
      title = 'Client Documents';
    } else if (this.currentTab === 'users') {
      title = 'Employee Documents';
    }
    
    return {
      title: title
    };
  },
  components: {
    SnackBar,
    DocumentFilter,
    DocumentTable,
    DocumentsRepository,
  },
  data() {
    return {

      privacyMood: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      showDocs: false,
      initialShowDocs: false,
      limit: '10',
      page: 0,
      documents: [],
      currentTab: 'central-repository',
      loading: false,
      params: {
        "company_id": [],
        "user_id": [],
        "type": [],
        "status": []
      }
    }
  },
  mounted() {
    // Check for query parameter to set the tab
    if (this.$route.query.tab) {
      this.currentTab = this.$route.query.tab;
    }
    this.getDocuments()
  },
  created() {
    this.$nuxt.$on('tabChanged', ($event) => {
      this.changeTab($event)
    })
  },
  watch: {
    // Watch for changes in route query parameters
    '$route.query.tab': {
      handler(newTabValue) {
        if (newTabValue) {
          this.currentTab = newTabValue;
          this.getDocuments();
        }
      },
      immediate: true
    }
  },
  methods: {
    changeTab(event) {
      this.currentTab = event
      this.params = {
        "company_id": [],
        "user_id": [],
        "type": [],
        "status": []
      }
      
      // Update the URL query parameter without reloading the page
      this.$router.push({
        path: this.$route.path,
        query: { tab: event }
      });
      
      this.getDocuments()
    },
    async clickedDocument($event) {
      this.params = $event
      this.getDocuments()
    },
    async getDocuments() {
      this.loading = true;
      this.page = 1;
      this.params['module'] = this.currentTab

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(`/documents/filter/foreignid/userid?page=${this.page}&limit=100`, this.params, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documents = response.results
          this.showDocs = true
          this.loading = false;
          // this.initialShowDocs = false
          this.$nuxt.$emit("receivedDocuments", { documents: this.documents, params: this.params })
        })
        .catch(() => {
          this.loading = false;
        })
    }
  }
}
</script>
