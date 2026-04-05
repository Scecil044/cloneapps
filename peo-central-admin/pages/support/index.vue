<template>
  <div class="pa-5">
    <v-row>
      <!-- all tickets view -->
      <v-col cols="12" class="border-1" sm="12" md="5">
        <v-card class="pa-3 rounded-xl" min-height="84vh" max-height="84vh" flat>
          <!-- //filters -->
          <v-card-title class="d-flex py-1 px-2 align-center justify-space-between">
            <div class="d-flex">
              <h3 class="blue-grey--text my-2 text-center text-sm-left text-md-left text-lg-left text-xl-left">
                Support Central
              </h3>
              <v-badge v-if="getTotalUnreadCount() > 0" :content="getTotalUnreadCount()" color="error" inline></v-badge>
            </div>
            <v-btn class="tall__btn px-9" color="primary" @click="openNewTicketForm">New Ticket </v-btn>
            <v-icon v-if="loadersM.syncingChats" title="syncing chats" class="rotating">refresh </v-icon>
          </v-card-title>
          <v-row class="px-2 mb-4">
            <v-col cols="4" class="py-0">
              <v-card outlined class="rounded-lg" elevation="0" @click="showActiveTickets"
                :class="{ 'primary lighten-5': activeFilter === 'active' }" style="cursor: pointer">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <div style="min-width: auto">
                      <div class="text-caption grey--text text-wrap">Active Tickets</div>
                      <div class="text-h6 font-weight-bold">
                        {{ active_tickets }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="4" class="py-0">
              <v-card outlined class="rounded-lg" elevation="0" @click="showCompletedTickets"
                :class="{ 'primary lighten-5': activeFilter === 'completed' }" style="cursor: pointer">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <div style="min-width: auto">
                      <div class="text-caption grey--text text-wrap">Complete Tickets</div>
                      <div class="text-h6 font-weight-bold">
                        {{ completed_tickets }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="4" class="py-0">
              <v-card outlined class="rounded-lg" elevation="0" @click="showAllTickets"
                :class="{ 'primary lighten-5': activeFilter === 'all' }" style="cursor: pointer">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <div style="min-width: auto">
                      <div class="text-caption grey--text text-wrap">All Tickets</div>
                      <div class="text-h6 font-weight-bold">
                        All Tickets
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="4" class="py-0">
              <v-card outlined class="rounded-lg" elevation="0">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <div style="min-width: auto">
                      <div class="text-caption grey--text text-wrap">Total Tickets</div>
                      <div class="text-h6 font-weight-bold">
                        {{ total_tickets }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="search_text_field" dense outlined placeholder="Search here.."
                @input="searchTickets"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select v-model="filterStatus" :items="filterOptions" dense outlined placeholder="Filter messages"
                @change="filterMessages"></v-select>
            </v-col>
          </v-row>
          <!-- Support Agent Assignment Filter -->
          <v-row v-if="isSupportAgent" dense class="mt-2">
            <v-col cols="12">
              <v-select
                v-model="assignmentFilter"
                :items="assignmentFilterOptions"
                dense
                outlined
                placeholder="Filter by assignment"
                @change="applyAssignmentFilter"
              ></v-select>
            </v-col>
          </v-row>
          <v-divider class="my-2"></v-divider>

          <!-- //All tickets -->
          <div v-if="ticketsM.length > 0" class="scroll mt-n8" style="max-height: 70vh; min-height: 70vh">
            <v-list v-if="!loadersM.allTickets" two-line>
              <v-list-item-group>
                <template v-for="(ticketM, index) in filteredTickets">
                  <v-divider v-if="index != 0" :key="ticketM._id"></v-divider>
                  <v-list-item :key="index" dense light @click="selectTicketM(ticketM?._id)" :class="{
                    'highlighted-list-item': selectedTicketM?._id === ticketM?._id
                  }" class="ticket-list-item">
                    <v-badge :content="unreadCounts[ticketM._id] || 0" :value="unreadCounts[ticketM._id] || 0"
                      color="error" overlap offset-x="25" offset-y="25">
                      <v-list-item-avatar :color="color" size="45" style="justify-content: center">
                        <v-img v-if="ticketM?.raisedBy?.image_url" :src="ticketM?.raisedBy?.image_url"></v-img>
                        <span v-else class="text-h5 white--text">
                          {{ getUserNameM(ticketM.raisedBy) | formatInitials }}
                        </span>
                      </v-list-item-avatar>
                    </v-badge>
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 0.86rem; font-weight: bold" class="d-flex align-center justify-space-between">
                        <span>{{ ticketM?.incident_number }}</span>
                        <!-- Support Agent Pill Badge -->
                        <v-chip
                          v-if="ticketM?.support_agent && ticketM?.support_agent !== 'No Support Agent Assigned'"
                          small
                          color="primary"
                          text-color="white"
                          class="support-agent-pill"
                          style="height: 24px; font-size: 0.75rem;"
                        >
                          <v-avatar size="18" class="mr-1">
                            <v-img v-if="getSupportAgentUser(ticketM)?.image_url" :src="getSupportAgentUser(ticketM).image_url"></v-img>
                            <span v-else class="white--text" style="font-size: 0.65rem;">
                              {{ getSupportAgentInitials(ticketM.support_agent) }}
                            </span>
                          </v-avatar>
                          {{ ticketM.support_agent }}
                        </v-chip>
                      </v-list-item-title>
                      <v-list-item-title>
                        <span style="font-size: 0.86rem">{{ getUserNameM(ticketM.raisedBy) }}</span>

                        <div class="mt-2 small" style="font-size: 0.86rem !important">
                          <span style="color: #0a94ff" v-if="isAttachment(ticketM?.lastMessage)">
                            <v-icon style="color: #0a94ff">mdi-paperclip</v-icon>
                            Attachment
                          </span>
                          <span v-else v-html="truncateMessage(ticketM?.lastMessage, 100)"></span>
                        </div>
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="my-auto">
                      <v-list-item-action-text class="caption pt-1">
                        {{ ticketM?.category }} -
                        <span>{{ ticketM.createdAt | ticketingDateFormatter }}</span>
                      </v-list-item-action-text>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-list-item-group>
            </v-list>
            <!-- <v-pagination
              v-model="page"
              class="pt-2"
              :length="totalPages"
              circle
              :disabled="loading"
              @input="changePage"
            ></v-pagination> -->
          </div>

          <!-- //loaders -->
          <div v-else-if="loadersM.allTickets">
            <template v-for="index in 8">
              <v-divider v-if="index != 0" :key="index + 100"></v-divider>
              <v-skeleton-loader :key="index" height="70" type="list-item-avatar-two-line"></v-skeleton-loader>
            </template>
          </div>
          <div class="d-flex align-items-center justify-space-between" v-else-if="ticketsM.length == 0">
            <span> There are no tickets to display! </span>
          </div>
        </v-card>
      </v-col>

      <!-- specific ticket view -->
      <v-col cols="12" sm="12" md="7" v-if="ticketsM.length > 0">
        <v-card class="pa-3 rounded-xl d-flex flex-column" flat height="84vh">
          <div class="py-4 px-3 d-flex justify-space-around">
            <h3 class="blue-grey--text">Ticket Details #{{ selectedTicketM?.incident_number }}</h3>

            <v-select v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)" v-model="selectedAssignee"
              :items="assignees" item-text="fullName" item-value="_id" label="Reassign to" dense outlined
              class="custom-select" hide-details :disabled="reassigningTicket" :loading="reassigningTicket"
              @change="handleReassign" @scroll="onEmployeeDropdownScroll">
              <template v-slot:selection="{ item }">
                <span class="custom-select__text">{{ item.fullName }}</span>
              </template>
              <template v-slot:item="{ item }">
                <span class="custom-select__text">{{ item.fullName }}</span>
              </template>
              <template v-slot:append-item v-if="employeePagination.loading">
                <v-list-item>
                  <v-list-item-content>
                    <v-progress-linear indeterminate color="primary"></v-progress-linear>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-select>
            <v-btn class="tall__btn px-2 ml-2" :color="isCompleted ? 'light-green darken-4' : 'primary'"
              :disabled="isCompleted" @click="markTicketCompleted(selectedTicketM._id)"
              :class="{ 'white--text': isCompleted }">
              {{ isCompleted ? 'Completed' : 'Mark As Completed' }}
            </v-btn>
          </div>

          <!-- chats -->

          <div class="flex-grow-1 position-relative">
            <v-row id="chatItems" class="scroll position-absolute-fit d-block" ref="chatContainer">
              <template v-if="selectedTicketM && !loadersM.specificTicket">
                <v-col v-for="(selectedTicketChat, index) in selectedTicketM.chats" :key="index" cols="12" :class="currentLoggedUserM.id === selectedTicketChat?.sender?._id ? ' float-right-baloon' : ' float-left-baloon'
                  ">
                  <div class="d-flex common-chat-balloon pb-3">
                    <v-tooltip top color="rgb(112 112 112)">
                      <template #activator="{ on, attrs }">
                        <v-avatar v-if="selectedTicketChat?.sender?.image_url" class="" :color="color" size="35"
                          v-bind="attrs" v-on="on">
                          <v-img :src="selectedTicketChat?.sender?.image_url" />
                        </v-avatar>
                        <v-avatar v-else :color="color" size="35" v-bind="attrs" style v-on="on">
                          <span class="text-h5 white--text">
                            {{
                              (selectedTicketChat?.sender?.first_name + ' ' + selectedTicketChat?.sender?.last_name)
                              | formatInitials
                            }}
                          </span>
                        </v-avatar>
                      </template>
                    </v-tooltip>

                    <div id="vs_custom">
                      <SupportChatBubble :ticketChat="selectedTicketChat" :loggedInUserId="currentLoggedUserM.id" />

                      <!-- ticks and chat name and time-->
                      <div class="d-flex align-center">
                        <!-- chat name and tim -->
                        <p class="grey--text text--lighten-1 font-weight-bold pt-1">
                          <v-tooltip right color="rgb(112 112 112)">
                            <template #activator="{ on, attrs }">
                              <span v-bind="attrs" v-on="on" class="small_text">
                                {{ selectedTicketChat?.sender?.first_name }}
                                {{ selectedTicketChat?.sender?.last_name }} -
                                {{ selectedTicketChat?.createdAt | formatDate }}
                              </span>
                            </template>
                            {{ selectedTicketChat?.createdAt | formatDate }}
                          </v-tooltip>
                        </p>
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col v-if="typingTicketData?.ticket_id === selectedTicketM._id" cols="12">
                  <img src="/typing_anim.gif" alt="" height="30px" />
                </v-col>
              </template>

              <div class="overflow-y-auto flex-grow-1" v-else>
                <template v-for="index in 3">
                  <div :key="index">
                    <v-col cols="12" class="pa-0">
                      <v-row align="center" class="pa-0">
                        <!-- Avatar on the left -->
                        <v-col cols="auto" class="pa-0 px-2 mr-4">
                          <v-skeleton-loader type="avatar" loading />
                        </v-col>
                        <!-- Message bubble on the left -->
                        <v-col cols="8" class="pa-0">
                          <v-skeleton-loader type="image" height="50px" style="border-radius: 13px" loading />
                        </v-col>
                      </v-row>
                    </v-col>

                    <!-- Right chat message -->

                    <v-col cols="12" class="pa-0 my-4">
                      <v-row align="center" justify="end">
                        <!-- Message bubble on the right -->
                        <v-col cols="8" class="pa-0">
                          <v-skeleton-loader type="image" height="80px" style="border-radius: 13px" loading />
                        </v-col>
                        <!-- Avatar on the right -->
                        <v-col cols="auto" class="pa-0 ml-4">
                          <v-skeleton-loader type="avatar" loading />
                        </v-col>
                      </v-row>
                    </v-col>
                  </div>
                </template>
              </div>
            </v-row>
          </div>

          <!--  inputs -->
          <v-row class="flex-grow-0 pa-0">
            <v-col v-if="isCompleted" cols="12" sm="12" class="d-flex align-center pa-0">
              <div class="closed-ticket-container">
                <div class="closed-ticket-content d-flex align-center justify-center">
                  <v-chip class="closed-ticket-message mr-4" color="light-green lighten-4"
                    text-color="light-green darken-4" height="36" larger>
                    <v-icon left size="20" color="light-green darken-4">mdi-check-circle</v-icon>
                    This ticket is closed
                  </v-chip>
                  <v-btn color="primary" @click="reopenTicket(selectedTicketM._id)" :loading="reopeningTicket">
                    <v-icon left>mdi-refresh</v-icon>
                    Re-open Ticket
                  </v-btn>
                </div>
              </div>
            </v-col>
            <v-col v-else>
              <!--File Preview-->
              <div v-if="attachFiles.length" class="file-previews">
                <div v-for="(file, index) in attachFiles" :key="index" class="file-preview-item">
                  <v-icon @click="removeFile(index)" class="file-remove-icon">mdi-close-circle</v-icon>
                  <!-- <v-img v-if="file.type.startsWith('image/')" :src="file.preview" max-height="100"
                    max-width="140"></v-img> -->
                  <span>{{ file.name }}</span>
                </div>
              </div>
              <div class="d-flex align-center pa-0">
                <input type="file" multiple ref="fileInput" style="display: none" @change="onUploadFile" />

                <TextEditorQuill :height="'auto'" v-model="textInputM" />
                <div class="d-flex pl-3 flex-column mr-2">
                  <v-tooltip top color="rgb(112 112 112)">
                    <template #activator="{ on, attrs }">
                      <v-btn fab text small color="primary" v-bind="attrs" @click="triggerFileInput" v-on="on">
                        <v-icon>mdi-paperclip</v-icon>
                      </v-btn>
                    </template>
                    Attach File
                  </v-tooltip>
                </div>
                <div class="d-flex pl-3 flex-column">
                  <v-tooltip top color="rgb(112 112 112)">
                    <template #activator="{ on, attrs }">
                      <v-btn fab text small color="primary" :loading="send_loading" v-bind="attrs"
                        @click.prevent="sendChatM()" :disabled="send_loading" v-on="on">
                        <v-icon>mdi-send-outline</v-icon>
                      </v-btn>
                    </template>
                    Send
                  </v-tooltip>
                </div>
              </div>
            </v-col>
          </v-row>
          <!-- <v-dialog v-model="showFileUpload" max-width="600">
            <v-card max-width="600" style="overflow-x: hidden">
              <v-row class="pt-4 pl-4 pr-4">
                <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
                  <p class="mb-0 caption blue-grey--text font-weight-bold">
                    Upload Attachment
                  </p>
                  <div class="pt-2" v-if="!uploadFile">
                    <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true"
                      @dragleave="dragging = false">
                      <div class="dropZone-info" @drag="onUploadFile">
                        <span class="dropZone-title">Drop file or click to upload</span>
                        <div class="dropZone-upload-limit-info">
                          <div>maximum file size: 10 MB</div>
                        </div>
                      </div>
                      <input type="file" @change="onUploadFile">
                    </div>
                  </div>
                  <div v-else class="dropZone-uploaded">
                    <div class="dropZone-uploaded-info">
                      <span class="dropZone-title">Added</span>
                      <button type="button" class="btn btn-primary removeFile" @click="removeFile('uploadDoc')">
                        Remove File
                      </button>
                    </div>
                  </div>
                </v-col>
              </v-row>
              <v-row class="pa-4">
                <v-col class="text-right pt-0">
                  <v-btn color="grey" text @click="showFileUpload = false">
                    Close
                  </v-btn>
                  <v-btn color="blue darken-1" text v-if="uploading">
                    <v-img src="/animated/refresh.svg" height="20" width="20" class="mr-2" contain />
                  </v-btn>
                  <v-btn color="blue darken-1" text v-else :disabled="!uploadFile" @click="handleFileUpload">
                    Upload
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-dialog> -->
        </v-card>
      </v-col>

      <v-dialog v-model="showNewTicketForm" max-width="500px" persistent>
        <v-card class="rounded-xl pa-0 pt-0" flat min-height="400">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <v-col cols="6" sm="6" class="pb-2">
                <v-card-title class="py-0">
                  <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2"
                    contain></v-img>
                  <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
                    Create New Ticket</span>
                </v-card-title>
              </v-col>
            </v-row>
            <v-divider></v-divider>

            <v-card-text class="tw-px-6 tw-py-10">
              <v-select
                v-model="newTicket.type"
                dense
                outlined
                :items="types"
                label="Support Type"
                :rules="supportTypeRules"
                required
              ></v-select>

              <v-combobox clearable outlined small-chips dense :items="employees" item-value="_id" item-text="fullName"
                v-model="newTicket.assignedToId" newTicket.assignedToId label="Choose Employee"></v-combobox>
              <v-textarea
                v-model="newTicket.content"
                dense
                outlined
                label="Content"
                :rules="contentRules"
                required
              ></v-textarea>
              <!-- <v-select
                    v-model="newTicket.assignedToId"
                    :items="employees"
                    item-text="fullName"
                    item-value="_id"
                    label="Assign to"
                    dense
                    outlined
                    class="mb-3"
                    :menu-props="{ maxHeight: '400px' }"
                    @scroll="onEmployeeDropdownScroll"
                  >
                    <template v-slot:selection="{ item }">
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                      <span>{{ item.first_name }} {{ item.last_name }}</span>
                    </template>
                  </v-select> -->
              <v-file-input v-model="newTicket.attachments" color="deep-purple accent-4" counter label="Attachments"
                multiple placeholder="Select your files" prepend-icon="mdi-paperclip" outlined :show-size="1000">
                <template v-slot:selection="{ index, text }">
                  <v-chip v-if="index < 2" color="deep-purple accent-4" dark label small>
                    {{ text }}
                  </v-chip>

                  <span v-else-if="index === 2" class="text-overline grey&#45;&#45;text">
                    +{{ newTicket.attachments.length - 2 }} File(s)
                  </span>
                </template>
              </v-file-input>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeNewTicketForm" :disabled="creatingTicket">
                Close
              </v-btn>
              <v-btn color="error" outlined :loading="creatingTicket" :disabled="!valid" @click="submitNewTicket">
                Create Ticket
              </v-btn>
            </v-card-actions>

          </v-form>
        </v-card>
      </v-dialog>
    </v-row>
    <v-snackbar :timeout="2000" :value="toast.show" :color="toast.color" absolute right rounded="pill" top>
      {{ toast.message }}
    </v-snackbar>
  </div>
</template>

<script>
import moment from 'moment'
import TextEditorQuill from '~/components/configurations/EmailConfigurator/text-editor-quill'

let timeout = {}

export default {
  components: { TextEditorQuill },
  layout: 'dashboard',
  data() {
    return {
      activeFilter: 'all',
      ticketsM: [],
      active_tickets: 0,
      total_tickets: 0,
      completed_tickets: 0,
      isCompleted: false,
      loadersM: {
        allTickets: false,
        specificTicket: false,
        syncingChats: false
      },
      selectedTicketM: null,
      currentLoggedUserM: {},
      textInputM: '',
      typingTicketData: null,
      reopeningTicket: false,
      reassigningTicket: false,
      filterStatus: '',
      filterOptions: [
        { text: 'All Messages', value: 'all' },
        { text: 'Read', value: 'read' },
        { text: 'Unread', value: 'unread' }
      ],
      assignmentFilter: 'all', // 'all' for unassigned tickets, 'myTickets' for tickets assigned to me
      assignmentFilterOptions: [
        { text: 'All Tickets', value: 'all' },
        { text: 'My Tickets', value: 'myTickets' }
      ],
      typingEndDebounceTimeout: null,
      search_text_field: '',
      color: 'primary',
      filteredTickets: [],
      unreadCounts: {},
      showNewTicketForm: false,
      valid: true,
      newTicket: {
        type: '',
        content: '',
        priority: 'High',
        status: 'New',
        assignedToId: null
        // attachments: []
      },
      // isSuperAdmin: ['isSuperAdmin'].includes($store.getters.getThisUserRole),
      assignees: [],
      selectedAssignee: null,
      showFileUpload: false,
      uploading: false,
      attachments: [],
      send_loading: false,
      uploadFile: '',
      dragging: false,
      fileInput: null,
      creatingTicket: false,
      attachFiles: [],
      toast: {
        message: '',
        color: '',
        show: false
      },
      types: [
        'Application Status',
        'Invoice',
        'Letter Request',
        'Clients',
        'Renewal',
        'Medical Insurance',
        'Modification',
        'Sponsorship',
        'Agreement',
        'Miscellaneous',
        'Cancellation',
        'Other'
      ],
      employees: [],
      employeePagination: {
        page: 1,
        limit: 20,
        hasMore: true,
        loading: false
      },
      supportTypeRules: [
        v => !!v || 'Support Type is required'
      ],
      contentRules: [
        v => !!v || 'Content is required',
        v => (v && v.trim().length > 0) || 'Content cannot be empty'
      ]
    }
  },
  watch: {
    // [[[[[watch]]]]]
    textInputM(newVal) {
      if (newVal) this.updateInputM()
    },

    'selectedTicketM.chats': 'scrollWithDelay',
    'loadersM.specificTicket': 'scrollWithDelay',
    typingTicketData: 'scrollWithDelay'
  },
  computed: {
    getAuthString() {
      return 'Bearer ' + this.$store.state.token
    },
    isSupportAgent() {
      // Check if current user is a support agent
      const user = this.currentLoggedUserM
      if (!user || !user._id) return false

      // Check for support agent role flags
      return user.has_support_agent_role === true ||
             (user.reporting && user.reporting.isSupport === true) ||
             // Also check if user is in the assignees list (support agents)
             this.assignees.some(agent => agent._id === user._id)
    }
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.off(`message-${this.currentLoggedUserM._id}`)
      this.socket.off('new-ticket')
    }
  },
  // created() {
  //   this.fetchEmployees()
  // },
  async mounted() {
    this.getTicketStats()
    //get current logged in user
    this.getCurrentUser()

    this.connectChatSocket()

    await Promise.all([this.fetchAssignees(),
    this.fetchEmployees(), this.getAllTicketsM()])
    //fetch first ticket
    if (this.filteredTickets[0]?._id) await this.getTicketM(this.filteredTickets[0]?._id)

    this.ticketsM.forEach(ticket => {
      this.updateUnreadCount(ticket._id, this.getUnreadCount(ticket))
    })
    // this.checkSuperAdminStatus()

  },
  methods: {
    showActiveTickets() {
      this.activeFilter = 'active'
      this.applyAllFilters()
      this.showMessage('Showing active tickets', true)
    },

    showCompletedTickets() {
      this.activeFilter = 'completed'
      this.applyAllFilters()
      this.showMessage('Showing completed tickets', true)
    },

    showAllTickets() {
      this.activeFilter = 'all'
      this.applyAllFilters()
      this.showMessage('Showing all tickets', true)
    },
    // [[[ Chatbox functions ]]]
    isAttachment(message) {
      return message?.trim().startsWith('<p><img src=')
    },
    truncateMessage(message, maxLength = 100) {
      if (!message) return ''

      // Strip HTML tags to get plain text
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = message
      const plainText = tempDiv.textContent || tempDiv.innerText || ''

      // Check if the message contains URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const urls = plainText.match(urlRegex)

      if (urls && urls.length > 0) {
        // If message contains URLs, show a file attachment indicator
        const firstUrl = urls[0]
        const fileName = this.getFileNameFromUrl(firstUrl)
        const fileType = this.getFileTypeFromUrl(firstUrl)

        // Return a clean preview with file type indicator
        if (fileType === 'image') {
          return `<span style="color: #0a94ff"><i class="mdi mdi-image"></i> Image: ${fileName}</span>`
        } else if (fileType === 'pdf') {
          return `<span style="color: #0a94ff"><i class="mdi mdi-file-pdf-box"></i> PDF: ${fileName}</span>`
        } else if (fileType === 'document') {
          return `<span style="color: #0a94ff"><i class="mdi mdi-file-document"></i> Document: ${fileName}</span>`
        } else {
          return `<span style="color: #0a94ff"><i class="mdi mdi-attachment"></i> File: ${fileName}</span>`
        }
      }

      // For regular text messages, truncate if longer than maxLength
      if (plainText.length > maxLength) {
        return plainText.substring(0, maxLength) + '...'
      }

      return message // Return original HTML if within limit
    },
    getFileNameFromUrl(url) {
      if (!url) return 'Unknown File'
      try {
        const urlParts = url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        // Remove query parameters if any
        const cleanFileName = fileName.split('?')[0]
        // If filename is too long, truncate it
        if (cleanFileName.length > 20) {
          return cleanFileName.substring(0, 20) + '...'
        }
        return cleanFileName
      } catch (error) {
        return 'Unknown File'
      }
    },
    getFileTypeFromUrl(url) {
      if (!url) return 'unknown'
      const lowerUrl = url.toLowerCase()

      // Check for image extensions
      if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') ||
          lowerUrl.includes('.png') || lowerUrl.includes('.gif') ||
          lowerUrl.includes('.bmp') || lowerUrl.includes('.webp') ||
          lowerUrl.includes('.svg')) {
        return 'image'
      }

      // Check for PDF
      if (lowerUrl.includes('.pdf')) {
        return 'pdf'
      }

      // Check for document extensions
      if (lowerUrl.includes('.doc') || lowerUrl.includes('.docx') ||
          lowerUrl.includes('.txt') || lowerUrl.includes('.rtf') ||
          lowerUrl.includes('.odt')) {
        return 'document'
      }

      return 'unknown'
    },
    showMessage(message, success = true) {
      this.toast = {
        message: message,
        color: success ? 'success' : 'red accent-2',
        show: true
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    scrollWithDelay() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollToBottom()
        }, 100) // Adjust the delay if necessary
      })
    },

    getCurrentUser() {
      this.currentLoggedUserM = this.$store.getters.getUserInfo
      console.log('logged in user is -> ', this.$store.getters.getUserInfo)
    },

    filterMessages(value) {
      this.filterStatus = value
      this.applyAllFilters()
    },
    applyAssignmentFilter() {
      this.applyAllFilters()
    },
    applyAllFilters() {
      let filtered = [...this.ticketsM]

      // Apply assignment filter (for support agents only)
      if (this.isSupportAgent) {
        const currentUserId = this.currentLoggedUserM._id?.toString()

        if (this.assignmentFilter === 'myTickets') {
          // Show only tickets assigned to current user
          filtered = filtered.filter(ticket => {
            if (!ticket.assignedToId) return false

            // Handle both ObjectId object and string
            const assignedId = ticket.assignedToId._id
              ? ticket.assignedToId._id.toString()
              : ticket.assignedToId.toString()

            return assignedId === currentUserId
          })
        } else if (this.assignmentFilter === 'all') {
          // Show only unassigned tickets (assignedToId is null or undefined)
          filtered = filtered.filter(ticket => {
            // Check if ticket has no assignedToId or it's null/undefined
            return !ticket.assignedToId ||
                   ticket.assignedToId === null ||
                   ticket.assignedToId === undefined ||
                   (ticket.assignedToId._id === null || ticket.assignedToId._id === undefined)
          })
        }
      }

      // Apply search filter
      if (this.search_text_field) {
        const searchTerm = this.search_text_field.toLowerCase().trim()
        filtered = filtered.filter(ticket => {
          if (!ticket || !ticket.incident_number) return false
          const incidentNumber = ticket.incident_number.toLowerCase()
          const lastThreeDigits = incidentNumber.slice(-3)
          return incidentNumber.includes(searchTerm) || lastThreeDigits === searchTerm
        })
      }

      // Apply read/unread filter
      if (this.filterStatus && this.filterStatus !== 'all') {
        if (this.filterStatus === 'read') {
          filtered = filtered.filter(
            ticket => !this.unreadCounts[ticket._id] || this.unreadCounts[ticket._id] === 0
          )
        } else if (this.filterStatus === 'unread') {
          filtered = filtered.filter(
            ticket => this.unreadCounts[ticket._id] && this.unreadCounts[ticket._id] > 0
          )
        }
      }

      // Apply status filter (active/completed/all)
      if (this.activeFilter === 'active') {
        filtered = filtered.filter(
          ticket => ticket.status === 'New' || ticket.status === 'Ongoing'
        )
      } else if (this.activeFilter === 'completed') {
        filtered = filtered.filter(ticket => ticket.status === 'Completed')
      }
      // If activeFilter is 'all', don't filter by status

      this.filteredTickets = filtered
    },
    async fetchEmployees(loadMore = false) {
      if (this.employeePagination.loading || (!loadMore && !this.employeePagination.hasMore)) return

      try {
        this.employeePagination.loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // If not loading more, reset the employees array and pagination
        if (!loadMore) {
          this.employees = []
          this.employeePagination.page = 1
          this.employeePagination.hasMore = true
        }

        const response = await this.$axios.$post(
          '/users/list/dropdown',
          {
            isTicketDropdown: true,
            page: this.employeePagination.page,
            limit: this.employeePagination.limit
          },
          { headers: { Authorization: AuthStr } }
        )

        // Process the employee data
        const newEmployees = response.map(employee => ({
          ...employee,
          fullName: `${employee.first_name} ${employee.last_name}`
        }))

        // Append new employees to the existing array
        this.employees = [...this.employees, ...newEmployees]

        // Update pagination
        this.employeePagination.page += 1
        this.employeePagination.hasMore = newEmployees.length === this.employeePagination.limit
      } catch (error) {
        console.error('Error fetching employees:', error)
      } finally {
        this.employeePagination.loading = false
      }
    },

    // Handle scroll event for infinite scrolling
    onEmployeeDropdownScroll(e) {
      // Check if we've scrolled near the bottom
      const target = e.target
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
        // Load more employees when near the bottom
        if (this.employeePagination.hasMore && !this.employeePagination.loading) {
          this.fetchEmployees(true)
        }
      }
    },
    async getTicketStats() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        const response = await this.$axios.$get(`tickets/stats`, {
          headers: { Authorization: AuthStr }
        })

        const completedStats = response.statusStats.find(stat => stat.status === 'Completed')
        this.completed_tickets = completedStats ? completedStats.count.count : 0

        const ongoingStats = response.statusStats.find(stat => stat.status === 'Ongoing')
        const newStats = response.statusStats.find(stat => stat.status === 'New')
        this.active_tickets = (ongoingStats ? ongoingStats.count.count : 0) + (newStats ? newStats.count.count : 0)

        this.total_tickets = response.statusStats.reduce((total, stat) => total + stat.count.count, 0)
      } catch (error) {
        console.error(error)
      }
    },

    updateUnreadCount(ticketId, count) {
      this.$set(this.unreadCounts, ticketId, count)
    },

    async getTicketM(id) {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token)
      try {
        const res = await this.$axios.$get('tickets/ticketId/' + id, {
          headers: { Authorization: AuthStr }
        })
        console.log('selected ticket --> ', res)

        const ticketIndex = this.ticketsM.findIndex(ticket => ticket._id === id)
        if (ticketIndex !== -1) {
          // Preserve support_agent field from existing ticket when updating
          const existingTicket = this.ticketsM[ticketIndex]
          this.$set(this.ticketsM, ticketIndex, {
            ...this.ticketsM[ticketIndex],
            ...res,
            support_agent: existingTicket.support_agent || res.support_agent || 'No Support Agent Assigned'
          })
        } else {
          this.ticketsM.push(res)
        }

        this.selectedTicketM = JSON.parse(JSON.stringify(res)) // Create a deep copy
        //automatically join a room when a chat is selected
        // this.joinRoomM(this.selectedTicketM._id)
      } catch (e) {
        console.error(e)
      }
    },
    getTotalUnreadCount() {
      return Object.values(this.unreadCounts).reduce((total, count) => total + count, 0)
    },
    async selectTicketM(id) {
      if (!id) return
      this.loadersM.specificTicket = true
      const selectedTicket = this.ticketsM.find(ticket => ticket._id === id)
      console.log('The selected ticket is', selectedTicket)
      if (selectedTicket) {
        this.selectedTicketM = JSON.parse(JSON.stringify(selectedTicket))
        this.isCompleted = this.selectedTicketM.status === 'Completed'
        if (this.selectedTicketM && this.selectedTicketM._id) {
          await this.markChatAsRead()
          const ticketIndex = this.ticketsM.findIndex(ticket => ticket._id === id)
          if (ticketIndex !== -1) {
            // Preserve support_agent when updating chats
            const existingSupportAgent = this.ticketsM[ticketIndex].support_agent
            this.$set(this.ticketsM[ticketIndex], 'chats', this.selectedTicketM.chats)
            // Ensure support_agent is preserved
            if (existingSupportAgent && !this.ticketsM[ticketIndex].support_agent) {
              this.$set(this.ticketsM[ticketIndex], 'support_agent', existingSupportAgent)
            }
          }
        }
      } else {
        await this.getTicketM(id)
      }

      this.loadersM.specificTicket = false
    },
    async getAllTicketsM(first_time = true) {
      console.log('fetching tickets')
      if (first_time) {
        this.loadersM.allTickets = true
      }
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token)
      let url = 'tickets?'

      try {
        const ticketsy = await this.$axios.$get(url, {
          headers: { Authorization: AuthStr }
        })
        console.log('ticketsy ', ticketsy)
        this.ticketsM = ticketsy.map(ticket => ({
          ...ticket,
          unreadCount: this.getUnreadCount(ticket)
        }))
        // Initialize unread counts
        this.ticketsM.forEach(ticket => {
          this.updateUnreadCount(ticket._id, ticket.unreadCount)
        })

        // Apply all filters after fetching tickets
        this.applyAllFilters()
      } catch (e) {
        console.log('e', e)
      }
      this.loadersM.allTickets = false
    },

    getUnreadCount(ticket) {
      return ticket.chats.filter(chat => !chat.isRead).length
    },
    // checkSuperAdminStatus() {
    //   this.assignees.some(assignee => assignee._id === this.currentLoggedUserM._id) ? this.isSuperAdmin = true : false
    // },
    async markTicketCompleted(ticket_id) {
      try {
        const token = this.$store.state.token
        const AuthStr = 'Bearer '.concat(token)
        const response = await this.$axios.$put(
          `/tickets/complete/${ticket_id}`,
          {},
          {
            headers: { Authorization: AuthStr }
          }
        )

        if (response) {
          this.isCompleted = true
          await this.getTicketStats()
          await this.getAllTicketsM()
          await this.getTicketM(ticket_id)
        }
      } catch (error) {
        console.error('Error completing ticket:', error)
      }
    },
    async connectChatSocket() {
      this.socket = this.$nuxtSocket({
        name: 'main',
        reconnection: true
      })
      //listen to chats streaming in
      await this.streamChatM()

      //listen to user typing
      this.onUserType()

      //listen to chats streaming in
      this.onUserTypeEnd()

      //listen to chats streaming in
      this.onSavedChat()

      //listen to chats streaming in
      this.onSavingChat()
      // listen for new tickets
      this.newTicketListener()
    },
    async reopenTicket(ticket_id) {
      try {
        this.reopeningTicket = true
        const token = this.$store.state.token
        const AuthStr = 'Bearer '.concat(token)

        await this.$axios.$put(
          `/tickets/update/${ticket_id}`,
          {
            status: 'Ongoing'
          },
          {
            headers: { Authorization: AuthStr }
          }
        )

        this.isCompleted = false
        await this.getTicketStats()
        await this.getAllTicketsM()
        await this.getTicketM(ticket_id)
      } catch (error) {
        console.error('Error reopening ticket:', error)
      } finally {
        this.reopeningTicket = false
      }
    },
    searchTickets() {
      this.applyAllFilters()
    },

    getUserNameM(val) {
      if (val === '' || val === undefined || val == null) {
        return ''
      } else {
        return val?.first_name + ' ' + val?.last_name
      }
    },
    getSupportAgentUser(ticket) {
      if (!ticket?.support_agent || ticket.support_agent === 'No Support Agent Assigned') {
        return null
      }

      // Try to find the support agent user object from assignees list by matching the name
      const supportAgentName = ticket.support_agent.trim()
      const agentUser = this.assignees.find(assignee => {
        const assigneeFullName = `${assignee.first_name || ''} ${assignee.middle_name || ''} ${assignee.last_name || ''}`.trim()
        return assigneeFullName === supportAgentName
      })

      return agentUser || null
    },
    getSupportAgentInitials(supportAgentName) {
      if (!supportAgentName || supportAgentName === 'No Support Agent Assigned') {
        return '?'
      }
      // Extract initials from the full name string
      const nameParts = supportAgentName.trim().split(' ').filter(part => part.length > 0)
      if (nameParts.length === 0) return '?'

      if (nameParts.length === 1) {
        // Single name - return first letter
        return nameParts[0].charAt(0).toUpperCase()
      } else {
        // Multiple names - return first letter of first and last name
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
      }
    },

    joinRoomM(ticket_id) {
      // Leave the current room before joining the new one
      if (this.selectedTicketM && this.selectedTicketM._id) {
        this.socket.emit('leave_room', this.selectedTicketM._id)
      }
      console.log('joining room --> ', ticket_id)
      this.socket.emit('join_room', ticket_id)
    },

    updateInputM() {
      // clearTimeout(this.typingEndDebounceTimeout)
      // console.log(
      //   'typing in func--- debounce is -->',
      //   this.typingEndDebounceTimeout
      // )
      // this.socket.emit('typing', {
      //   ticket_id: this.selectedTicketM._id,
      //   user_id: this.currentLoggedUserM._id
      // })
      // this.typingEndDebounceTimeout = setTimeout(() => {
      //   console.log('they stopped typing')
      //   this.socket.emit('stopped_typing', {
      //     ticket_id: this.selectedTicketM._id,
      //     user_id: this.currentLoggedUserM._id
      //   })
      // }, 1000)
    },
    newTicketListener() {
      this.socket.on(`new-ticket`, () => {
        // handle here reload all tickets
        this.getAllTicketsM(false).then(() => {
          // Apply filters after reloading tickets
          this.applyAllFilters()
        })
      })
    },

    // async streamChatM() {
    //   console.log('before chatting')
    //   // this.socket.off('message')

    //   this.socket.on(`message-${this.currentLoggedUserM._id}`, (data) => {
    //     console.log('got message chat --> ', data)
    //     const ticketIndex = this.ticketsM.findIndex(ticket => ticket._id === data.ticket_id)
    //     if (ticketIndex !== -1) {
    //       this.$set(this.ticketsM[ticketIndex], 'chats', [...this.ticketsM[ticketIndex].chats, data.message])
    //       if (data.ticket_id !== this.selectedTicketM?._id) {
    //         const newCount = this.getUnreadCount(this.ticketsM[ticketIndex])
    //         this.updateUnreadCount(data.ticket_id, newCount)
    //         this.filterMessages(this.filterStatus)
    //       } else {
    //         this.selectedTicketM.chats.push(data.message)
    //       }
    //     }
    //   })
    // },

    async streamChatM() {
      console.log('admin connected')
      this.socket.on(`message-${this.currentLoggedUserM._id}`, async data => {
        console.log('received message', data)

        if (data.ticket_id !== this.selectedTicketM?._id) {
          // Get the existing ticket's support_agent before updating
          const existingTicketIndex = this.ticketsM.findIndex(ticket => ticket._id === data._id)
          const existingSupportAgent = existingTicketIndex !== -1 ? this.ticketsM[existingTicketIndex].support_agent : null

          await this.getTicketM(data._id)

          // Restore support_agent if it was lost
          if (existingSupportAgent && existingTicketIndex !== -1) {
            const updatedTicket = this.ticketsM[existingTicketIndex]
            if (!updatedTicket.support_agent) {
              this.$set(this.ticketsM[existingTicketIndex], 'support_agent', existingSupportAgent)
            }
          }

          this.applyAllFilters()
        } else {
          this.selectedTicketM.chats.push(data.message)
        }
        await this.getAllTicketsM(false)
      })
    },

    onUserType() {
      this.socket.off('typing')
      this.socket.on('typing', data => {
        console.log('someone is typing', data)
        //console.log(
        //   'evaluated to ' + data.user_id ===
        //     this.currentLoggedUserM._id + ' so code execution bla bla'
        // )
        // if (data.user_) return
        // console.log()

        //dont display typing for the user that is actually typing
        if (data.user_id === this.currentLoggedUserM._id) return
        if (!this.typingTicketData) this.typingTicketData = data
        console.log('typing ticket is -->______________', this.typingTicketData)
      })
    },

    onUserTypeEnd() {
      this.socket.off('stopped_typing')
      this.socket.on('stopped_typing', data => {
        this.typingTicketData = null
      })
    },
    openFileUpload() {
      this.showFileUpload = true
    },
    onUploadFile(event) {
      // this.onChange(event, 'uploadDoc')
      const files = event.target.files
      this.attachFiles = [...this.attachFiles, ...files]
      console.log('uploaded files', this.attachFiles)
    },
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        this.dragging = false
        return
      }
      this.createFile(e, files, type)
    },

    removeFile(index) {
      // if (val == 'uploadDoc') this.uploadFile = ''
      this.attachFiles.splice(index, 1)
    },
    createFile(e, file, type) {
      if (file.size > 26214400) {
        alert('please check file size is not more than 25 MB.')
        this.dragging = false
        return
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file
      this.dragging = false
    },

    onUploadFiles(event) {
      this.uploadFiles = event
      this.dragging = false
    },
    async handleFileUpload() {
      try {
        this.uploading = true
        let attach = {}

        for (var key in this.attachFiles) {
          if (!_.isEmpty(this.attachFiles[key])) {
            for (let i = 0; i < this.attachFiles[key].length; i++) {
              if (this.attachFiles[key][i].name != undefined) {
                attach.file = this.attachFiles[key][i]
              }
            }
          }
          this.removeFile(key)
        }

        const fd = new FormData()
        fd.append('attachments', attach.file)

        const response = await this.$axios.$post('/documents/mimetype/upload', fd, {
          headers: { Authorization: this.getAuthString }
        })

        this.attachments.push(response)

        //     this.textInputM = `<a href="${response.url}" target="_blank" style="color: #0A94FF; text-decoration: none;">
        //   📎 ${response.file_name}
        // </a>`
        this.showFileUpload = false
      } catch (error) {
        console.error('Upload failed:', error)
      } finally {
        this.uploading = false
        this.uploadFile = ''
      }
    },

    // async sendChatM() {
    //   if (!this.textInputM) return

    //   const message = {
    //     attachments: [],
    //     content: this.textInputM,
    //     isRead: false,
    //     readBy: '',
    //     updatedAt: new Date(),
    //     createdAt: new Date(),
    //     sender: {
    //       _id: this.currentLoggedUserM._id,
    //       email: this.currentLoggedUserM?.email,
    //       first_name: this.currentLoggedUserM?.first_name,
    //       last_name: this.currentLoggedUserM?.last_name,
    //       image_url: this.currentLoggedUserM?.image_url
    //     }
    //   }

    //   const ticketIndex = this.ticketsM.findIndex(ticket => ticket._id === this.selectedTicketM._id)
    //   if (ticketIndex !== -1) {
    //     this.$set(this.ticketsM[ticketIndex], 'chats', [...this.ticketsM[ticketIndex].chats, message])
    //     const newCount = this.getUnreadCount(this.ticketsM[ticketIndex])
    //     this.updateUnreadCount(this.selectedTicketM._id, newCount)
    //     this.filterMessages(this.filterStatus)
    //   }

    //   this.socket.emit('message', {
    //     ticket_id: this.selectedTicketM._id,
    //     message
    //   })

    //   this.textInputM = ''
    // },

    async sendChatM() {
      if (!this.textInputM) return
      try {
        // const ticketIndex = this.ticketsM.findIndex(ticket => ticket._id === this.selectedTicketM._id)
        // if (ticketIndex !== -1) {
        //   this.$set(this.ticketsM[ticketIndex], 'chats', [...this.ticketsM[ticketIndex].chats, message])
        //   const newCount = this.getUnreadCount(this.ticketsM[ticketIndex])
        //   this.updateUnreadCount(this.selectedTicketM._id, newCount)
        //   this.filterMessages(this.filterStatus)
        // }

        const formData = new FormData()
        formData.append('content', this.textInputM)
        if (this.attachFiles.length > 0) {
          this.attachFiles.forEach(file => {
            formData.append('attachments', file, file.name)
          })
        }

        this.send_loading = true

        const response = await this.$axios.$put(`/tickets/attend/to/ticket/${this.selectedTicketM._id}`, formData, {
          headers: { Authorization: this.getAuthString }
        })

        // Get existing support_agent before refreshing
        const ticketIndex = this.ticketsM.findIndex(ticket => ticket._id === this.selectedTicketM._id)
        const existingSupportAgent = ticketIndex !== -1 ? this.ticketsM[ticketIndex].support_agent : null

        await this.getTicketM(this.selectedTicketM._id)

        // Restore support_agent if it was lost
        if (existingSupportAgent && ticketIndex !== -1) {
          const updatedTicket = this.ticketsM[ticketIndex]
          if (!updatedTicket.support_agent) {
            this.$set(this.ticketsM[ticketIndex], 'support_agent', existingSupportAgent)
          }
        }

        // Refresh ticket list and apply filters
        await this.getAllTicketsM(false)

        // this.socket.emit('message', {
        //   ticket_id: this.selectedTicketM._id,
        //   message
        // })

        this.textInputM = ''
        this.attachFiles = []
      } catch (error) {
        console.error('Send chat failed:', error)
        this.showMessage(`Send chat failed: ${error.message}`, false)
      } finally {
        this.send_loading = false
      }
    },

    leaveRoomM() {
      this.socket.emit('leave_room', this.selectedTicketM._id)
    },

    scrollToBottom() {
      //console.log('scroll to bottom', this.$refs.chatContainer)
      const chatContainer = this.$refs.chatContainer
      chatContainer.scrollTop = chatContainer.scrollHeight
    },

    onSavingChat() {
      this.socket.on('saving_chat', data => {
        this.loadersM.syncingChats = true
      })
    },
    onSavedChat() {
      this.socket.on('saved_chat', data => {
        this.loadersM.syncingChats = false
      })
    },

    async markChatAsRead() {
      if (this.selectedTicketM && this.selectedTicketM._id) {
        try {
          let response = await this.$axios.$put(`/tickets/read/ticket/${this.selectedTicketM._id}/`, {})
          this.selectedTicketM = response

          const ticketIndex = this.ticketsM.findIndex(ticket => ticket._id === this.selectedTicketM._id)
          if (ticketIndex !== -1) {
            // Preserve support_agent field from existing ticket when updating
            const existingTicket = this.ticketsM[ticketIndex]
            this.$set(this.ticketsM, ticketIndex, {
              ...this.selectedTicketM,
              support_agent: existingTicket.support_agent || this.selectedTicketM.support_agent || 'No Support Agent Assigned'
            })
          }

          this.updateUnreadCount(this.selectedTicketM._id, 0)

          this.applyAllFilters()
        } catch (error) {
          console.error('Failed to mark chat as read', error)
        }
      }
    },
    openNewTicketForm() {
      this.showNewTicketForm = true
      // this.newTicket.incident_number = this.generateIncidentNumber();
    },
    closeNewTicketForm() {
      this.showNewTicketForm = false
      this.$refs.form.reset()
    },
    async submitNewTicket() {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token)
      if (this.$refs.form.validate()) {
        try {
          this.creatingTicket = true

          const formdata = new FormData()

          // attach files
          if (this.newTicket.attachments && this.newTicket.attachments.length) {
            this.newTicket.attachments.forEach((el) => {
              formdata.append('attachments', el)
            })
          }
          formdata.append('content', this.newTicket.content)
          formdata.append('priority', this.newTicket.priority)
          formdata.append('status', this.newTicket.status)
          formdata.append('type', this.newTicket.type)

          // Only append assignToId if it has a valid value
          // FormData converts undefined/null to strings, so we need to handle it properly
          if (this.newTicket.assignedToId) {
            const assignToIdValue = this.newTicket.assignedToId._id ||
                                   (typeof this.newTicket.assignedToId === 'string' ? this.newTicket.assignedToId : null)
            if (assignToIdValue) {
              formdata.append('assignToId', assignToIdValue)
            }
          }
          // If assignToId is null/undefined, don't append it - backend will use default (null)

          // console.log('The ticket data is', this.newTicket)
          // const payload = {
          //   ...this.newTicket,
          //   assignedToId: this.newTicket.assignedToId
          // }
          let response = await this.$axios.$post('/tickets/', formdata, {
            headers: { Authorization: AuthStr }
          })
          console.log('What is the response for marking as read', response)
          this.closeNewTicketForm()
          this.getAllTicketsM()
        } catch (error) {
          console.error(error)
        }
        finally {
          this.creatingTicket = false
        }
        console.log('Submitting new ticket:', this.newTicket)
      }
    },
    async fetchAssignees() {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token)
      try {
        let obj = {
          visibility: 'admin'
        }
        const response = await this.$axios.$get('/users/getAllSupportAgents', {
          headers: { Authorization: AuthStr }
        })
        this.assignees = response.map(user => ({
          ...user,
          fullName: `${user.first_name} ${user.last_name}`
        }))
        // this.checkSuperAdminStatus()
      } catch (error) {
        console.error('Error fetching assignees:', error)
      }
    },
    async handleReassign(newAssigneeId) {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token)
      console.log('The new id to re-assign to is', newAssigneeId)
      if (!newAssigneeId) return

      this.reassigningTicket = true
      try {
        let response = await this.$axios.$put(
          `/tickets/reassign/ticket/${this.selectedTicketM._id}`,
          { assignToId: newAssigneeId },
          {
            headers: { Authorization: AuthStr }
          }
        )
        console.log('What is the response for the re-assign', response)

        // Refresh ticket list to get updated support agent information
        await this.getAllTicketsM(false)

        // Update the selected ticket with fresh data from the server
        await this.getTicketM(this.selectedTicketM._id)

        // Apply filters after refresh
        this.applyAllFilters()

        this.selectedAssignee = null
        this.showMessage('Ticket reassigned successfully', true)
      } catch (error) {
        console.error('Error reassigning ticket:', error)
        this.showMessage('Failed to reassign ticket', false)
      } finally {
        this.reassigningTicket = false
      }
    }
  }
}
</script>

<style>
.small * {
  font-size: 0.86rem !important;
}

.file-previews {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.scroll {
  overflow-y: auto;
}

.custom-chip {
  height: auto;
}

.message-action {
  position: absolute;
  right: 20px;
  top: 12px;
}

.closed-ticket-container {
  width: 100%;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-radius: 8px;
}

.closed-ticket-content {
  text-align: center;
}

.closed-ticket-message {
  font-size: 1.55rem !important;
  padding: 16px 24px;
  height: 50px;
}

.closed-ticket-message .v-icon {
  margin-right: 8px;
}

.message-action button.v-btn {
  background-color: #f5f5f5 !important;
}

.chat-balloon {
  background: rgba(46, 148, 196, 0.25);
  padding: 10px;
  border-radius: 10px;
  display: inline-block;
  position: relative;
}

.file-upload-dialog .v-card {
  border-radius: 8px;
}

.file-preview {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
}

.float-right-baloon {
  /* float: right; */
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.float-right-baloon>* {
  flex-direction: row-reverse;
}

.float-right-baloon #vs_custom {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.float-right-baloon .v-avatar {
  margin-left: 20px;
}

.float-left-baloon .v-avatar {
  margin-right: 20px;
}

.common-chat-balloon {
  max-width: 80%;
}

.hide button.primary--text {
  color: rgba(149, 153, 159) !important;
}

.mydiv:hover .hide button.primary--text {
  color: #1565c0 !important;
}

.tiptap-vuetify-editor p img {
  max-width: 400px;
}

.tiptap-vuetify-editor .ProseMirror {
  min-height: 50px;
  max-height: 50px;
  overflow-y: unset;
  margin: 0 0 24px 24px !important;
  padding-bottom: 24px !important;
  font-size: 11pt;
  resize: vertical;
  transition: max-height 0.15s ease-out;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.rotating {
  animation: spin 2s linear infinite;
}

.highlighted-list-item {
  background-color: rgba(0, 0, 0, 0.1);
}

.custom-select {
  max-width: 200px;
  font-size: 14px;
}

.custom-select ::v-deep .v-select__selections {
  min-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.custom-select ::v-deep .v-select__selection {
  margin-top: 0;
  margin-bottom: 0;
}

.custom-select ::v-deep .v-input__slot {
  min-height: 32px;
}

.custom-select ::v-deep .v-label {
  top: 6px;
  font-size: 12px;
}

.custom-select ::v-deep .v-label--active {
  transform: translateY(-14px) scale(0.75);
}

.custom-select__text {
  font-size: 14px;
}

.custom-select ::v-deep .v-list-item {
  min-height: 32px;
}

/* Support Agent Pill Badge Styles */
.ticket-list-item {
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.ticket-list-item:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%) !important;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
}

.support-agent-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px !important;
}

.support-agent-pill .v-avatar {
  background-color: rgba(255, 255, 255, 0.3) !important;
  margin-right: 4px !important;
}
</style>
