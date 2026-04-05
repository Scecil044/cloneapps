<template>
  <div class="tw-min-h-screen tw-bg-gray-50">
    <!-- Alert for Actions -->
    <v-snackbar
      v-model="showAlert"
      :color="alertColor"
      :timeout="3000"
      top
      class="tw-z-50"
    >
      <div class="tw-flex tw-items-center">
        <v-icon left :color="alertColor === 'success' ? 'white' : 'error'">
          {{ alertIcon }}
        </v-icon>
        <span class="tw-ml-2 tw-text-white">{{ alertMessage }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="showAlert = false"
          class="tw-text-white"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <v-row class="pa-5">
      <v-col cols="12">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <h2 class="text-sm">Document Manager</h2>
          <v-btn
            class="short__btn tw-transform tw-transition-transform hover:tw-scale-105"
            color="primary"
            elevation="2"
            @click="openCreateFolderDialog"
          >
            <v-icon left>mdi-folder-plus</v-icon>
            New Repository
          </v-btn>
        </div>

        <!-- Search and Filter -->
        <div class="tw-flex tw-flex-row tw-justify-between tw-items-center tw-mb-4 tw-p-3 tw-bg-white tw-border tw-rounded-xl">
          <div class="tw-flex tw-flex-row tw-space-x-4 tw-items-center">
            <v-text-field
              v-model="search"
              placeholder="Search repositories"
              solo
              flat
              dense
              hide-details
              background-color="searchbar"
              class="tw-rounded-lg tw-transition-all focus-within:tw-shadow-md"
              @input="searchDebounceAction"
              prepend-inner-icon="mdi-magnify"
            ></v-text-field>

            <v-select
              v-model="repositoryType"
              :items="[
                { text: 'All Repositories', value: 0 },
                { text: 'Company Repositories', value: 1 },
                { text: 'Central Repositories', value: 2 }
              ]"
              item-text="text"
              item-value="value"
              solo
              flat
              dense
              hide-details
              background-color="searchbar"
              class="tw-rounded-lg tw-transition-all focus-within:tw-shadow-md tw-min-w-[200px]"
              @change="handleTypeChange"
            ></v-select>

            <v-select
              v-if="repositoryType === 1"
              v-model="selectedCompany"
              :items="companies"
              item-text="company_name"
              item-value="_id"
              placeholder="Filter by Company"
              solo
              flat
              dense
              hide-details
              background-color="searchbar"
              class="tw-rounded-lg tw-transition-all focus-within:tw-shadow-md tw-min-w-[200px]"
              @change="handleCompanyFilter"
              clearable
              prepend-inner-icon="mdi-office-building"
            >
              <template v-slot:selection="{ item }">
                <div class="tw-flex tw-items-center">
                  <v-icon small color="primary" class="tw-mr-2">mdi-office-building</v-icon>
                  <span>{{ item.company_name }}</span>
                </div>
              </template>
              <template v-slot:item="{ item }">
                <div class="tw-flex tw-items-center tw-py-1">
                  <v-icon small color="primary" class="tw-mr-2">mdi-office-building</v-icon>
                  <span>{{ item.company_name }}</span>
                </div>
              </template>
            </v-select>
          </div>
        </div>

        <!-- Repositories Grid and Files Container -->
        <div class="tw-flex tw-flex-col md:tw-flex-row tw-items-start tw-justify-between md:tw-space-x-3 tw-space-y-3 md:tw-space-y-0">
          <!-- Left Side - Folder List -->
          <div v-if="loading" class="tw-w-full md:tw-w-[45%] lg:tw-w-[42%] xl:tw-w-[35%] tw-min-w-[280px]">
            <DocumentsRepositorySkeleton :count="8" />
          </div>

          <div v-else class="tw-flex tw-flex-col tw-bg-white tw-border tw-rounded-xl tw-py-2 tw-px-2 tw-p-2 tw-space-y-4 tw-h-[50vh] md:tw-h-[85vh] tw-w-full md:tw-w-[45%] lg:tw-w-[42%] xl:tw-w-[35%] tw-min-w-[280px] tw-overflow-hidden tw-folder-list">
            <div class="tw-flex tw-flex-row tw-mx-2 tw-justify-between tw-items-center tw-gap-1 tw-border-b tw-pb-2.5">
              <v-text-field
                v-model="search"
                placeholder="Search Folder"
                class="tw-bg-[#F5F6F785] tw-px-2 tw-py-2 tw-my-2 tw-rounded-lg tw-text-xs"
                solo
                flat
                dense
                hide-details
              ></v-text-field>
              <div class="tw-cursor-pointer" @click="openCreateFolderDialog">
                <v-icon>mdi-folder-plus</v-icon>
              </div>
            </div>

            <div class="tw-flex tw-flex-col tw-h-[80vh] tw-overflow-y-auto">
              <div
                v-for="folder in filteredFolders"
                :key="folder._id"
                class="tw-relative"
              >
                <div
                  @click="openFolder(folder)"
                  class="tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-cursor-pointer tw-border-b tw-border-b-gray-200 tw-rounded-lg tw-my-1 tw-transition-all tw-duration-200"
                  :class="{
                    'tw-bg-blue-50 tw-shadow-md tw-border-l-4 tw-border-l-primary': selectedFolder._id === folder._id,
                    'hover:tw-bg-gray-50': selectedFolder._id !== folder._id
                  }"
                >
                  <div class="tw-flex tw-flex-row tw-py-2 tw-cursor-pointer">
                    <div class="tw-folder-icon tw-flex-shrink-0">
                      <v-icon :color="selectedFolder._id === folder._id ? 'primary' : 'amber darken-2'" size="28">
                        {{ selectedFolder._id === folder._id ? 'mdi-folder-open' : 'mdi-folder' }}
                      </v-icon>
                    </div>
                    <div class="tw-flex tw-flex-col tw-ml-4">
                      <div v-if="folder.editing" class="tw-flex tw-items-center">
                        <v-text-field
                          v-model="folder.editName"
                          @click.stop
                          @keyup.enter="saveFolderName(folder)"
                          @blur="saveFolderName(folder)"
                          class="tw-border tw-rounded tw-px-2 tw-py-1 tw-text-[14px] tw-w-full"
                          hide-details
                          dense
                          flat
                          solo
                        ></v-text-field>
                      </div>
                      <div v-else>
                        <p class="tw-text-[14px] tw-text-black" :class="{'tw-font-medium': selectedFolder._id === folder._id}">
                          {{ folder.folder_name }}
                        </p>
                        <p class="tw-text-[11px] tw-text-gray-500 tw-flex tw-items-center">
                          <v-icon v-if="folder.isClientFolder" size="12" class="tw-mr-1" color="amber darken-2">mdi-office-building</v-icon>
                          <v-icon v-else size="12" class="tw-mr-1" color="primary">mdi-folder-star</v-icon>
                          {{ folder.isClientFolder ? (folder.company_name || 'Company Repository') : 'Central Repository' }}
                          <span v-if="folder.client_id" class="tw-ml-1 tw-text-[9px] tw-opacity-50"></span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div @click.stop="toggleDropdown(folder)" class="tw-flex tw-items-center">
                    <div class="tw-bg-gray-100 tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center hover:tw-bg-gray-200">
                      <v-icon x-small>mdi-dots-vertical</v-icon>
                    </div>
                  </div>
                </div>

                <div
                  v-if="folder.showDropdown"
                  class="tw-absolute tw-right-2 tw-top-12 tw-mt-1 tw-w-32 tw-bg-white tw-rounded-md tw-shadow-lg tw-z-10 tw-border tw-border-gray-200"
                >
                  <div class="tw-py-1">
                    <button
                      @click.stop="editFolder(folder)"
                      class="tw-flex tw-w-full tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-100"
                    >
                      <v-icon small class="tw-mr-2">mdi-pencil</v-icon>
                      Edit
                    </button>
                    <button
                      @click.stop="confirmDeleteFolder(folder)"
                      class="tw-flex tw-w-full tw-items-center tw-px-4 tw-py-2 tw-text-sm tw-text-red-600 hover:tw-bg-gray-100"
                    >
                      <v-icon small class="tw-mr-2">mdi-delete</v-icon>
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <!-- Infinite scroll trigger -->
              <div
                v-if="folders.length > 0 && hasMoreFolders"
                class="tw-flex tw-justify-center tw-items-center tw-py-4"
                v-intersect="{
                  handler: loadMore,
                  options: { threshold: 0.5 }
                }"
              >
                <template v-if="loadingMore">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                    class="tw-mr-2"
                  ></v-progress-circular>
                  <span class="tw-text-sm tw-text-gray-600">Loading more repositories...</span>
                </template>
              </div>

              <!-- End of list message -->
              <div v-if="folders.length > 0 && !hasMoreFolders" class="tw-flex tw-justify-center tw-items-center tw-py-4">
                <span class="tw-text-sm tw-text-gray-500">All repositories loaded</span>
              </div>
            </div>
          </div>

          <!-- Right Side - Files Display -->
          <div id="preview" class="tw-overflow-auto tw-border tw-bg-white tw-rounded-xl tw-h-[50vh] md:tw-h-[85vh] tw-w-full tw-files-container">
            <div class="tw-flex tw-flex-row tw-items-center tw-justify-between tw-p-4 tw-pb-3 tw-border-b tw-border-b-gray-300">
              <div class="tw-flex tw-items-center">
                <v-icon v-if="selectedFolder._id" color="primary" class="tw-mr-2">mdi-folder-open</v-icon>
                <p class="tw-text-gray-800 tw-text-[16px] tw-font-medium">{{ selectedFolder.folder_name || 'Select a Repository' }}</p>
              </div>
              <div v-if="selectedFolder._id" class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-space-x-2">
                <v-btn small color="primary" class="tw-flex tw-items-center" outlined @click="openFileUploadDialog">
                  <v-icon small class="tw-mr-1">mdi-file-plus</v-icon>
                  Add File
                </v-btn>
              </div>
            </div>

            <!-- Files Grid -->
            <div class="tw-p-4">
              <div v-if="activeFiles.length > 0" class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 xl:tw-grid-cols-4 tw-gap-4">
                <div v-for="(file, i) in filteredFiles" :key="i" class="tw-relative">
                  <div class="tw-flex tw-flex-col tw-h-full tw-border tw-rounded-lg tw-overflow-hidden tw-bg-white tw-transition-all tw-duration-200 hover:tw-shadow-lg"
                    :class="{
                      'tw-shadow-md tw-ring-2 tw-ring-primary tw-ring-opacity-40': file.active,
                      'tw-shadow-md tw-ring-2 tw-ring-primary file-downloading-animation tw-cursor-not-allowed': file.downloading,
                      'tw-cursor-pointer': !file.downloading
                    }">
                    <div class="tw-p-4 tw-flex tw-flex-col tw-items-center tw-flex-grow">
                      <div class="tw-mb-3 tw-flex tw-justify-center">
                        <v-icon size="42" :color="getFileIconColor(file.link)" class="tw-transition-transform hover:tw-scale-110">
                          {{ getFileIcon(file.link) }}
                        </v-icon>
                      </div>
                      <div class="tw-w-full tw-text-center tw-mb-2">
                        <p class="tw-text-sm tw-font-medium tw-break-words tw-hyphens-auto tw-px-1" :title="getFileNameFromUrl(file.link)">
                          {{ getFileNameFromUrl(file.link) }}
                        </p>
                        <p class="tw-text-xs tw-text-gray-500 tw-mt-1">
                          {{ formatDate(file.created_at) }}
                        </p>
                      </div>
                    </div>

                    <div class="tw-flex tw-border-t tw-bg-gray-50">
                      <button
                        @click.stop="!file.downloading && tryDownloadFile(file.link)"
                        :class="[
                          'tw-flex-1 tw-flex tw-items-center tw-justify-center tw-py-2 tw-text-sm tw-font-medium tw-transition-colors',
                          file.downloading ? 'tw-cursor-not-allowed tw-bg-gray-100 tw-text-gray-500' : 'hover:tw-bg-primary-light hover:tw-text-primary'
                        ]"
                        :title="file.downloading ? 'Download in progress...' : 'Download this file'"
                      >
                        <span v-if="file.downloading" class="tw-flex tw-items-center download-btn-animation">
                          <v-progress-circular
                            indeterminate
                            size="16"
                            width="2"
                            color="primary"
                            class="tw-mr-2"
                          ></v-progress-circular>
                          <span>Downloading...</span>
                        </span>
                        <span v-else class="tw-flex tw-items-center">
                          <v-icon small class="tw-mr-1">mdi-download</v-icon>
                          Download
                        </span>
                      </button>
                      <div class="tw-border-r tw-border-gray-200"></div>
                      <button
                        @click.stop="openInNewTab(file.link)"
                        class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-py-2 tw-text-sm tw-font-medium tw-transition-colors hover:tw-bg-blue-50 hover:tw-text-blue-600"
                        title="Open in new tab"
                      >
                        <v-icon small class="tw-mr-1">mdi-open-in-new</v-icon>
                        Open
                      </button>
                      <div class="tw-border-r tw-border-gray-200"></div>
                      <button
                        @click.stop="deleteFile(file)"
                        class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-py-2 tw-text-sm tw-font-medium tw-transition-colors hover:tw-bg-red-50 hover:tw-text-red-600"
                      >
                        <v-icon small class="tw-mr-1">mdi-delete</v-icon>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="selectedFolder._id" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-64">
                <v-icon size="80" color="grey lighten-1" class="tw-mb-4">mdi-folder-open</v-icon>
                <h3 class="tw-text-lg tw-font-medium tw-text-gray-600">No Files Found</h3>
                <p class="tw-text-sm tw-text-gray-500 tw-text-center tw-mt-2">
                  This repository is empty
                </p>
              </div>
              <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-64">
                <v-icon size="80" color="grey lighten-1" class="tw-mb-4">mdi-folder-multiple</v-icon>
                <h3 class="tw-text-lg tw-font-medium tw-text-gray-600">Select a Repository</h3>
                <p class="tw-text-sm tw-text-gray-500 tw-text-center tw-mt-2">
                  Please select a repository from the list
                </p>
              </div>
            </div>
          </div>
        </div>



        <!-- Empty State -->
        <div v-if="!loading && folders.length === 0 && !hasMoreFolders" class="tw-w-full tw-h-[85vh]">
          <div class="tw-flex tw-justify-end">
            <div class="tw-cursor-pointer" @click="openCreateFolderDialog">
              <v-icon color="primary">mdi-folder-plus</v-icon>
            </div>
          </div>

          <div class="tw-border tw-border-[#F1F3F5] tw-border-dashed tw-rounded tw-p-10 tw-mt-3">
            <div class="tw-my-4 tw-py-1.5 tw-flex tw-flex-col tw-justify-center tw-items-center">
              <v-icon size="80" color="primary lighten-3" class="tw-mb-4">mdi-folder-plus</v-icon>
              <h1>Create a New Repository</h1>
              <span class="tw-text-xs">You haven't created any repositories yet!</span>
              <v-btn
                color="primary"
                class="tw-mt-4 tw-px-6"
                @click="openCreateFolderDialog"
              >
                Create Repository
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- We've removed the drawer as it's not needed anymore -->

    <!-- Create/Edit Folder Dialog -->
    <v-dialog
      v-model="folderDialog"
      max-width="600px"
      transition="dialog-bottom-transition"
      class="tw-z-50"
    >
      <v-card class="tw-rounded-2xl tw-overflow-hidden">
        <!-- Dialog Header -->
        <div class="tw-relative tw-h-40">
          <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-primary tw-to-primary-dark tw-opacity-95"></div>
          <div class="tw-relative tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-white tw-p-6">
            <div class="tw-mb-4">
              <v-icon size="60" color="white">{{ editedFolder._id ? 'mdi-folder-edit' : 'mdi-folder-plus' }}</v-icon>
              <div class="tw-absolute tw-inset-0 tw-bg-white tw-opacity-10 tw-rounded-full tw-animate-pulse"></div>
            </div>
            <h2 class="tw-text-2xl tw-font-bold tw-text-center">
              {{ editedFolder._id ? 'Edit Repository' : 'Create New Repository' }}
            </h2>
            <p class="tw-text-sm tw-opacity-90 tw-mt-2 tw-text-center tw-max-w-md">
              {{ editedFolder._id ? 'Update your repository details' : 'Organize your documents in a new repository' }}
            </p>
          </div>
        </div>

        <!-- Dialog Content -->
        <v-card-text class="tw-p-6">
          <v-form ref="folderForm" v-model="valid" class="tw-space-y-4">
            <div class="tw-space-y-1">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center">
                <v-icon small color="primary" class="tw-mr-1">mdi-folder</v-icon>
                Repository Name
              </label>
              <v-text-field
                v-model="editedFolder.folder_name"
                :rules="[v => !!v || 'Repository name is required']"
                required
                outlined
                dense
                class="tw-rounded-lg"
                placeholder="Enter a descriptive name for your repository"
                hide-details="auto"
              ></v-text-field>
            </div>

            <div class="tw-space-y-1">
              <label class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-flex tw-items-center">
                <v-icon small color="primary" class="tw-mr-1">mdi-office-building</v-icon>
                Company (Optional)
              </label>
              <v-select
                v-model="editedFolder.company_id"
                :items="companies"
                item-text="company_name"
                item-value="_id"
                outlined
                dense
                class="tw-rounded-lg"
                placeholder="Select a company or leave empty for a central repository"
                hide-details="auto"
                hint="Leave empty to create a centralized repository"
                persistent-hint
              ></v-select>
            </div>

            <v-alert
              v-if="!editedFolder.company_id"
              type="info"
              border="left"
              colored-border
              elevation="1"
              class="tw-mt-2 tw-bg-blue-50"
            >
              <div class="tw-flex tw-items-start">
                <v-icon left color="info" class="tw-mt-1">mdi-information</v-icon>
                <div>
                  <div class="tw-font-medium tw-text-blue-800">Central Repository</div>
                  <div class="tw-text-sm tw-mt-1 tw-text-blue-700">
                    This repository will be accessible to System Administrators and can be used to store shared documents.
                  </div>
                </div>
              </div>
            </v-alert>
          </v-form>
        </v-card-text>

        <!-- Dialog Actions -->
        <v-card-actions class="tw-px-6 tw-py-4 tw-bg-gray-50 tw-border-t tw-border-gray-100">
          <v-spacer></v-spacer>
          <v-btn
            text
            class="tw-px-4 tw-transition-all tw-duration-300 hover:tw-bg-gray-100"
            @click="folderDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid"
            class="tw-px-6 tw-ml-2 tw-transition-all tw-duration-300 hover:tw-shadow-lg"
            elevation="2"
            @click="saveFolder"
          >
            {{ editedFolder._id ? 'Update' : 'Create' }} Repository
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="tw-rounded-xl tw-shadow-xl">
        <v-card-title class="tw-text-xl tw-font-semibold tw-text-gray-800 tw-pb-2">
          Delete Repository
        </v-card-title>
        <v-card-text class="tw-pt-4 tw-text-gray-600">
          Are you sure you want to delete this repository? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="tw-px-6 tw-pb-6">
          <v-spacer></v-spacer>
          <v-btn
            color="subtext"
            text
            class="tw-transition-transform hover:tw-scale-105"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            class="tw-transition-transform hover:tw-scale-105"
            elevation="2"
            @click="deleteFolder"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- File Upload Dialog -->
    <v-dialog v-model="fileUploadDialog" max-width="500px">
      <v-card class="tw-rounded-xl tw-shadow-xl">
        <v-card-title class="tw-text-xl tw-font-semibold tw-text-gray-800 tw-pb-2 tw-bg-gray-50 tw-border-b">
          <v-icon color="primary" class="tw-mr-2">mdi-file-plus</v-icon>
          Upload File to {{ selectedFolder.folder_name }}
        </v-card-title>
        <v-card-text class="tw-pt-6">
          <v-file-input
            v-model="fileToUpload"
            label="Select a file"
            outlined
            dense
            prepend-icon="mdi-file"
            accept="*/*"
            :loading="uploadingFile"
            show-size
            counter
            hint="Max file size: 25MB"
            class="tw-mb-4 tw-cursor-pointer!"
            :error-messages="fileUploadError ? [fileUploadError] : []"
          ></v-file-input>

          <div v-if="uploadProgress > 0" class="tw-mt-6">
            <p class="tw-text-sm tw-text-gray-600 tw-mb-2">Upload Progress</p>
            <v-progress-linear
              :value="uploadProgress"
              color="primary"
              height="6"
              rounded
              striped
              class="tw-mt-1"
            ></v-progress-linear>

            <div class="tw-text-center tw-text-sm tw-text-gray-600 tw-mt-2">
              Uploading: {{ uploadProgress }}%
            </div>
          </div>

          <v-alert
            v-if="fileUploadError"
            type="error"
            border="left"
            colored-border
            dense
            class="tw-mt-4"
          >
            {{ fileUploadError }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="tw-px-6 tw-pb-6">
          <v-spacer></v-spacer>
          <v-btn
            color="subtext"
            text
            class="tw-transition-transform hover:tw-scale-105"
            @click="fileUploadDialog = false"
            :disabled="uploadingFile"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            class="tw-transition-transform hover:tw-scale-105"
            elevation="2"
            @click="uploadFile"
            :loading="uploadingFile"
            :disabled="!fileToUpload"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import DocumentsRepositorySkeleton from '@/components/Documents/DocumentsRepositorySkeleton.vue'

export default {
  name: 'DocumentsRepository',
  components: {
    DocumentsRepositorySkeleton
  },
  directives: {
    intersect: {
      inserted(el, binding) {
        const options = binding.value.options || { threshold: 0.5 }
        const handler = binding.value.handler

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              handler(entries, observer, true)
            }
          })
        }, options)

        observer.observe(el)
        el._observer = observer
      },
      unbind(el) {
        if (el._observer) {
          el._observer.disconnect()
          delete el._observer
        }
      }
    }
  },
  data() {
    return {
      repositoryType: 0, // 0: All, 1: Company, 2: Central
      search: '',
      loading: false,
      valid: false,
      folderDialog: false,
      deleteDialog: false,
      fileUploadDialog: false,
      fileToUpload: null,
      uploadingFile: false,
      uploadProgress: 0,
      fileUploadError: '',
      companies: [],
      selectedCompany: null,
      folders: [],
      selectedFolder: {},
      editedFolder: {
        folder_name: '',
        company_id: null
      },
      showAlert: false,
      alertMessage: '',
      alertColor: 'success',
      alertIcon: 'mdi-check-circle',
      drawer: false,
      fileSearch: '',
      filteredFiles: [],
      activeDropdown: null,
      activeFileDropdown: null,

      // Infinite scroll properties
      currentPage: 1,
      hasMoreFolders: true,
      loadingMore: false,
      pageSize: 10
    }
  },
  computed: {
    filteredFolders() {
      let filtered = this.folders

      // We're now handling the repository type filtering in the API call,
      // but we'll keep this filter as a safety measure in case some folders
      // with incorrect isClientFolder value get through
      if (this.repositoryType === 1) {
        // Company repositories - filter by isClientFolder: true
        filtered = filtered.filter(f => f.isClientFolder === true)

        // Then apply company filter if selected
        if (this.selectedCompany) {
          filtered = filtered.filter(f => f.client_id === this.selectedCompany || f.company_id === this.selectedCompany)
        }
      } else if (this.repositoryType === 2) {
        // Central repositories - filter by isClientFolder: false
        filtered = filtered.filter(f => f.isClientFolder === false)
      }

      // Apply search filter if exists
      if (this.search) {
        const searchTerm = this.search.toLowerCase()
        filtered = filtered.filter(folder =>
          folder.folder_name.toLowerCase().includes(searchTerm) ||
          (folder.company_name && folder.company_name.toLowerCase().includes(searchTerm))
        )
      }

      return filtered
    },

    // Computed property to filter out deleted files from the current folder
    activeFiles() {
      if (!this.selectedFolder || !this.selectedFolder.files) {
        return []
      }

      return this.selectedFolder.files.filter(file => !file.is_deleted)
    }
  },
  mounted() {
    this.getFolders()
    this.getCompanies()
    document.addEventListener('click', this.handleDocumentClick)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleDocumentClick)
  },
  methods: {
    async getFolders(reset = true) {
      if (reset) {
        console.log('🚀 Initial load - fetching first page of folders...')
        this.loading = true
        this.currentPage = 1
        this.folders = []
        this.hasMoreFolders = true
      } else {
        console.log(`📄 Pagination - fetching page ${this.currentPage} of folders...`)
        this.loadingMore = true
      }

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        // Using client_id parameter as per backend change
        const response = await this.$axios.$get('/document/folders/get/all', {
          headers: { Authorization: AuthStr },
          params: {
            search: this.search,
            client_id: this.repositoryType === 1 && this.selectedCompany ? this.selectedCompany : null,
            isClientFolder: this.repositoryType === 1 ? true : (this.repositoryType === 2 ? false : undefined),
            page: this.currentPage,
            limit: this.pageSize
          }
        })

        if (!response || !response.results) {
          throw new Error('Invalid response format from server')
        }

        const newFolders = response.results.map(folder => ({
          ...folder,
          isOpen: false,
          files: folder.files || [],
          loading: false,
          showDropdown: false,
          editing: false,
          editName: folder.folder_name
        }))

        if (reset) {
          this.folders = newFolders
        } else {
          this.folders = [...this.folders, ...newFolders]
        }

        // Update pagination state
        this.hasMoreFolders = response.results && response.results.length === this.pageSize

        // Only increment page number for pagination (not for initial load)
        if (!reset) {
          this.currentPage++
        }

        // Log successful data fetch
        console.log(`Successfully fetched folders: ${this.folders.length} total, page ${reset ? 1 : this.currentPage - 1}`)
      } catch (error) {
        console.error('Error fetching folders:', error)
        this.showErrorAlert(error.response?.data?.message || 'Error fetching folders')
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },
    async loadMore() {
      if (!this.loadingMore && this.hasMoreFolders) {
        console.log('🔄 Infinite scroll triggered - loading more folders...')
        await this.getFolders(false)
      }
    },
    async getCompanies() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$post('/companies/list/dropdown', {}, {
          headers: { Authorization: AuthStr }
        })
        if (['isSuperAdmin'].includes(this.$store.getters.getThisUserRole)) {
          this.companies = response
        } else {
          this.companies = response.filter(company => company._id === this.$store.getters.getSelectedCompany)
        }
      } catch (error) {
        console.error('Error fetching companies:', error)
      }
    },
    openCreateFolderDialog() {
      this.editedFolder = {
        folder_name: '',
        company_id: null
      }
      this.folderDialog = true
    },
    toggleDropdown(folder) {
      // Close all other dropdowns
      this.folders.forEach(f => {
        if (f._id !== folder._id) {
          f.showDropdown = false;
        }
      });

      // Toggle this dropdown
      folder.showDropdown = !folder.showDropdown;
    },
    toggleFileDropdown(file) {
      // Close all other file dropdowns
      this.filteredFiles.forEach(f => {
        if (f._id !== file._id) {
          f.showDropdown = false;
        }
      });

      // Toggle this file dropdown
      file.showDropdown = !file.showDropdown;
    },
    editFolder(folder) {
      folder.editing = true;
      folder.editName = folder.folder_name;
      folder.showDropdown = false;
    },
    saveFolderName(folder) {
      if (!folder.editName.trim()) {
        folder.editing = false;
        folder.editName = folder.folder_name;
        return;
      }

      // Update folder name
      this.editedFolder = {
        ...folder,
        folder_name: folder.editName
      };
      this.saveFolder();
      folder.editing = false;
    },
    handleTypeChange() {
      // Reset company filter and clear selected folder when changing repository type
      this.selectedCompany = null;
      this.selectedFolder = {};
      this.filteredFiles = [];
      this.getFolders(true);
    },
    async saveFolder() {
      if (!this.$refs.folderForm.validate()) return

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const endpoint = this.editedFolder._id
          ? `/document/folders/update/${this.editedFolder._id}`
          : '/document/folders/create/new'

        const method = this.editedFolder._id ? 'put' : 'post'

        // Set isClientFolder based on whether company_id is selected
        const folderData = {
          ...this.editedFolder,
          isClientFolder: !!this.editedFolder.company_id
        }

        const response = await this.$axios[method](endpoint, folderData, {
          headers: { Authorization: AuthStr }
        })

        if (!response) {
          throw new Error('Invalid response from server')
        }

        this.showSuccessAlert(`Repository ${this.editedFolder._id ? 'updated' : 'created'} successfully`)
        this.folderDialog = false
        await this.getFolders(true)
      } catch (error) {
        console.error('Error saving folder:', error)
        this.showErrorAlert(error.response?.data?.message || `Error ${this.editedFolder._id ? 'updating' : 'creating'} repository`)
      }
    },
    confirmDeleteFolder(folder) {
      this.selectedFolder = folder
      this.deleteDialog = true
    },
    async deleteFolder() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$delete(`/document/folders/delete/${this.selectedFolder._id}`, {
          headers: { Authorization: AuthStr }
        })

        if (!response) {
          throw new Error('Invalid response from server')
        }

        this.deleteDialog = false
        await this.getFolders(true)

        // Clear selected folder and files if the deleted folder was selected
        const deletedFolderId = this.selectedFolder._id
        this.selectedFolder = {}
        this.filteredFiles = []

        this.showSuccessAlert('Repository deleted successfully')
      } catch (error) {
        console.error('Error deleting folder:', error)
        this.showErrorAlert(error.response?.data?.message || 'Error deleting repository')
      }
    },
    async openFolder(folder) {
      // Close all dropdowns
      this.folders.forEach(f => {
        f.showDropdown = false;
      });

      this.selectedFolder = folder

      if (!folder.files || folder.files.length === 0) {
        folder.loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        try {
          const response = await this.$axios.$get(`/document/folders/get/folder/documents/${folder._id}`, {
            headers: { Authorization: AuthStr }
          })

          if (!response || !response.results) {
            throw new Error('Invalid response format from server')
          }

          // Store all files (including deleted ones) in the folder
          folder.files = (response.results[0]?.files || []).map(file => ({
            ...file,
            downloading: false,
            deleting: false,
            showDropdown: false
          }))

          // But only show non-deleted files in the UI
          this.filteredFiles = folder.files.filter(file => !file.is_deleted)

          console.log('Successfully opened folder:', folder.folder_name)
        } catch (error) {
          console.error('Error fetching folder contents:', error)
          this.showErrorAlert(error.response?.data?.message || 'Error fetching repository contents')
        } finally {
          folder.loading = false
        }
      } else {
        // Only display non-deleted files in the UI
        this.filteredFiles = folder.files
          .filter(file => !file.is_deleted)
          .map(file => ({
            ...file,
            showDropdown: false
          }))
      }
    },
    downloadFile(url) {
      // Keep this method for backward compatibility, but use tryDownloadFile
      this.tryDownloadFile(url);
    },

    async tryDownloadFile(url) {
      // Find the file in all folders (non-deleted files only)
      const file = this.folders
        .flatMap(f => f.files || [])
        .find(f => f.link === url && !f.is_deleted)

      if (!file) return

      file.downloading = true
      const fileName = this.getFileNameFromUrl(url)

      try {
        // Show toast notification that download has started
        this.$store.dispatch('notification/showToast', {
          message: `Starting download for "${fileName}"...`,
          color: 'info'
        })

        // Try direct download - this will work for publicly accessible S3 files
        const a = document.createElement('a')
        a.href = url
        a.download = fileName // This will force download instead of navigation
        a.target = '_blank' // In case download attribute doesn't work
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        // Show success toast
        this.showSuccessAlert(`Successfully downloaded "${fileName}". File is ready to view.`)
      } catch (error) {
        console.error('Error downloading file:', error)
        this.showErrorAlert(`Error downloading file. Please try again.`)
      } finally {
        // Reset downloading state after a delay
        setTimeout(() => {
          file.downloading = false
        }, 1200)
      }
    },
    async deleteFile(file) {
      /*
       * File deletion handling:
       * 1. We mark files as is_deleted: true instead of removing them completely
       * 2. The UI only shows files where is_deleted: false
       * 3. When downloading, we only consider non-deleted files
       * This ensures proper data consistency with the backend
       */
      file.deleting = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$delete(
          `/document/folders/delete/${this.selectedFolder._id}/${file._id}`,
          {
            headers: { Authorization: AuthStr }
          }
        )

        if (!response) {
          throw new Error('Invalid response from server')
        }

        // Update the file's deleted status in the local data
        const folder = this.folders.find(f => f._id === this.selectedFolder._id)
        if (folder) {
          // Mark the file as deleted instead of removing it completely
          const fileIndex = folder.files.findIndex(f => f._id === file._id)
          if (fileIndex !== -1) {
            folder.files[fileIndex].is_deleted = true
          }

          // Filter out deleted files from the view
          this.filteredFiles = folder.files.filter(f => !f.is_deleted)
        }

        this.showSuccessAlert('File deleted successfully')
      } catch (error) {
        console.error('Error deleting file:', error)
        this.showErrorAlert(error.response?.data?.message || 'Error deleting file')
      } finally {
        file.deleting = false
      }
    },
    getFileIcon(url) {
      if (!url) return 'mdi-file'
      const extension = url.split('.').pop().toLowerCase()
      switch (extension) {
        case 'pdf': return 'mdi-file-pdf-box'
        case 'doc':
        case 'docx': return 'mdi-file-word-box'
        case 'xls':
        case 'xlsx': return 'mdi-file-excel-box'
        case 'ppt':
        case 'pptx': return 'mdi-file-powerpoint-box'
        case 'jpg':
        case 'jpeg':
        case 'png': return 'mdi-file-image-box'
        default: return 'mdi-file'
      }
    },
    getFileIconColor(url) {
      if (!url) return 'grey'
      const extension = url.split('.').pop().toLowerCase()
      switch (extension) {
        case 'pdf': return 'red'
        case 'doc':
        case 'docx': return 'blue'
        case 'xls':
        case 'xlsx': return 'green'
        case 'ppt':
        case 'pptx': return 'orange'
        case 'jpg':
        case 'jpeg':
        case 'png': return 'purple'
        default: return 'grey'
      }
    },
    handleCompanyFilter() {
      // Clear selected folder when changing company filter
      this.selectedFolder = {};
      this.filteredFiles = [];
      console.log('Filtering by company:', this.selectedCompany)
      this.getFolders(true)
    },
    searchDebounceAction: _.debounce(function() {
      this.getFolders(true)
    }, 500),

    showSuccessAlert(message) {
      this.alertMessage = message
      this.alertColor = 'success'
      this.alertIcon = 'mdi-check-circle'
      this.showAlert = true
    },
    showErrorAlert(message) {
      this.alertMessage = message
      this.alertColor = 'error'
      this.alertIcon = 'mdi-alert-circle'
      this.showAlert = true
    },
    handleDocumentClick(event) {
      // Close dropdowns when clicking outside
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.mdi-dots-vertical')) {
        this.folders.forEach(folder => {
          folder.showDropdown = false;
        });

        if (this.filteredFiles) {
          this.filteredFiles.forEach(file => {
            file.showDropdown = false;
          });
        }
      }
    },
    getFileNameFromUrl(url) {
      if (!url) return 'Unknown File'
      // Extract filename from URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      // Remove any query parameters
      const fileNameWithoutQuery = fileName.split('?')[0]
      // Decode URL-encoded characters (e.g., %20 -> space, %28 -> '(')
      try {
        return decodeURIComponent(fileNameWithoutQuery)
      } catch (e) {
        // If decoding fails (e.g., already decoded or invalid encoding), return the original
        return fileNameWithoutQuery
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    },
    openFileUploadDialog() {
      this.fileToUpload = null
      this.uploadProgress = 0
      this.fileUploadError = ''
      this.fileUploadDialog = true
    },
    async uploadFile() {
      if (!this.fileToUpload) {
        this.fileUploadError = 'Please select a file to upload'
        return
      }

      this.uploadingFile = true
      this.fileUploadError = ''
      this.uploadProgress = 0

      // Create FormData
      const formData = new FormData()
      formData.append('documents', this.fileToUpload)

      // Add folder reference if we're uploading to a specific folder
      if (this.selectedFolder && this.selectedFolder._id) {
        formData.append('folder_ref', this.selectedFolder._id)
      }

      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {
        // Use axios to upload with progress tracking
        const response = await this.$axios.post('documents/simpleupload', formData, {
          headers: {
            'Authorization': AuthStr,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              this.uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            }
          }
        })

        console.log('Upload response:', response.data)

        // Add the new file to the folder's files array
        if (response.data) {
          // The response is an array of URLs, take the first one
          const fileUrl = Array.isArray(response.data) ? response.data[0] : response.data
          console.log('Uploaded file URL:', fileUrl)

          // Extract file name from URL
          const fileName = this.getFileNameFromUrl(fileUrl)

          // Create a new file object with correct structure
          const newFile = {
            _id: new Date().getTime().toString(), // temporary ID until refresh
            folder_id: this.selectedFolder._id,
            link: fileUrl,
            name: fileName,
            created_at: new Date(),
            created_by: this.$store.state.user._id || this.$store.state.userId,
            is_deleted: false
          }

          // Update the current folder with the new file
          const folder = this.folders.find(f => f._id === this.selectedFolder._id)
          if (folder) {
            if (!folder.files) folder.files = []
            folder.files.push(newFile)
            // Make sure to filter out any deleted files when updating the UI
            this.filteredFiles = folder.files.filter(file => !file.is_deleted)
          }

          // Update the folder on the server via API call
          await this.updateFolderWithFile(this.selectedFolder._id, fileUrl)

          this.showSuccessAlert('File uploaded successfully')
          this.fileUploadDialog = false

          // Reset file upload state
          this.fileToUpload = null
          this.uploadProgress = 0

          // Refresh the folder to get accurate data with server-generated IDs
          setTimeout(() => this.openFolder(this.selectedFolder), 500)
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        this.fileUploadError = error.response?.data?.details || error.message || 'Error uploading file'
        this.showErrorAlert(this.fileUploadError)
      } finally {
        this.uploadingFile = false
      }
    },
    searchFiles: _.debounce(function() {
      if (!this.fileSearch) {
        this.filteredFiles = [...this.selectedFolder.files]
        return
      }

      const searchTerm = this.fileSearch.toLowerCase()
      this.filteredFiles = this.selectedFolder.files.filter(file =>
        this.getFileNameFromUrl(file.link).toLowerCase().includes(searchTerm)
      )
    }, 300),
    async updateFolderWithFile(folderId, fileUrl) {
      if (!folderId || !fileUrl) return

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        // Update folder with new file on the server
        await this.$axios.put(
          `/document/folders/update/${folderId}/add-file`,
          { fileUrl: fileUrl },
          {
            headers: { Authorization: AuthStr }
          }
        )
        console.log('Successfully updated folder with new file')
      } catch (error) {
        console.error('Error updating folder with file:', error)
        // This is a silent failure - we already have the file in UI
        // but we'll log it for debugging purposes
      }
    },
    openInNewTab(url) {
      if (!url) return

      const fileName = this.getFileNameFromUrl(url)

      // Show toast notification
      this.$store.dispatch('notification/showToast', {
        message: `Opening "${fileName}" in a new tab...`,
        color: 'info'
      })

      // Open the URL in a new tab
      window.open(url, '_blank')
    },
    async isUrlDirectlyAccessible(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok
      } catch (error) {
        console.error('Error checking URL accessibility:', error)
        return false
      }
    },
  }
}
</script>

<style lang="scss" scoped>
// Smooth transitions
.tw-transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// Folder icon style
.tw-folder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
}

// File grid styles
#preview {
  transition: all 0.3s ease;
}

// Scrollbar styles
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;

  &:hover {
    background: #666;
  }
}

// Input and select styling
.v-text-field, .v-select {
  &.v-input--is-focused {
    .v-input__slot {
      box-shadow: 0 0 0 2px rgba(var(--v-primary-base), 0.1);
    }
  }
}

// Dropdown menu styling
.v-menu__content {
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

// Animations
@keyframes pulse {
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0.1;
  }
}

.tw-animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

// Button styling
button {
  transition: all 0.2s ease-in-out;
  &:hover {
    transform: translateY(-1px);
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .tw-folder-list {
    width: 100%;
    margin-bottom: 1rem;
  }

  .tw-files-container {
    width: 100%;
  }
}

// Fix for Tailwind conflicts
.tw-flex {
  display: flex !important;
}

.tw-block {
  display: block !important;
}

// Custom styles for the file view
.custom-icon {
  font-size: inherit !important;
}

// Download animation
@keyframes downloading-pulse {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}

.downloading-animation {
  animation: downloading-pulse 1.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

// Enhanced file card downloading animation
@keyframes file-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.3);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

.file-downloading-animation {
  animation: file-pulse 2s infinite;
}

// Button animation during download
.download-btn-animation {
  animation: btn-pulse 1.2s infinite ease-in-out;
}

@keyframes btn-pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}
</style>
