<template>
  <div class="tasks-overview tw-w-full">
    <!-- Header -->
    <div class="tw-flex tw-justify-between tw-items-center tw-py-3 tw-mb-4 tw-w-full">
      <div class="tw-flex tw-flex-col  tw-gap-3 ">
        <div class="tw-flex tw-gap-5 tw-items-center">
          <span class="tw-text-2xl">
            <span>👋</span>
            <span class="tw-font-semibold">Hello, {{ `${currentUser?.first_name} ${currentUser?.last_name}`
            }}
            </span>
          </span>
          <v-divider vertical />
          <span class="tw-inline-flex tw-gap-3">
            {{ new Date() | formatDateWithoutTime }}
          </span>

        </div>
        <div class="tw-text-xl">
          “Heads up! ⏰
          {{ taskCounts.todaysTasks > 0 ? `You have a task "${taskCounts.todaysTasks}" to complete today.` : `You have
          no tasks today` }}”
        </div>


      </div>
    </div>

    <!-- Task Statistics Cards -->
    <div class="tw-flex tw-flex-row tw-flex-wrap tw-gap-4 tw-py-2 tw-w-full tw-mb-4">
      <div v-for="(card, index) in taskCountCards" :key="index"
        class="tw-overflow-hidden tw-flex-shrink-0 tw-bg-white tw-border-2 tw-border-gray-200 tw-rounded-lg tw-shadow-sm tw-cursor-pointer"
        style="min-width: 250px; width: 250px;"
        @click="setActiveTab(card.filter_key)"
      >
        <div class="tw-p-4 tw-flex tw-items-center tw-justify-between tw-w-full">
          <!-- Count Section -->
          <div class="tw-flex tw-flex-col tw-space-y-1">
            <span class="tw-text-sm tw-font-medium tw-truncate tw-text-gray-500">
              {{ card.title }}
            </span>
            <span class="tw-text-2xl tw-font-bold tw-text-gray-800">
              {{ card.count }}
            </span>
            <span class="tw-text-xs tw-text-gray-400" v-if="card.subtitle">
              {{ card.subtitle }}
            </span>
          </div>

          <!-- Icon Section -->
          <div class="tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-ml-2"
            :class="card.iconBg">
            <v-icon :color="card.iconColor" size="20">
              {{ card.icon }}
            </v-icon>
          </div>
        </div>

        <!-- Color Bar at Bottom -->
        <div class="tw-h-1 tw-w-full" :class="card.colorBar"></div>
      </div>
    </div>

    <!-- Main Card Container with Tabs -->
    <v-card class="tw-w-full tw-py-4 tw-px-4" elevation="0">
      <!-- Card Title -->
      <div class="tw-flex tw-items-center tw-gap-3">
        <v-img src="/shift/calendar_task.png" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
        <span class="tw-text-xl tw-font-semibold">Tasks Overview</span>
      </div>

      <!-- Filters Section -->
      <v-card-text class="tw-flex tw-justify-between tw-items-center">
        <v-row align="center" class="tw-mb-2" no-gutters>
          <v-col cols="12" sm="6" md="3" class="pr-2">
            <CustomInputContainer label="Search tasks...">
              <div slot="input">
                <v-text-field v-model="searchQuery"  outlined
                  dense hide-details  @input="applyFilters" />
              </div>
            </CustomInputContainer>
          </v-col>

          <v-col cols="12" sm="6" md="2" class="px-1">
            <CustomInputContainer label="Year">
              <div slot="input">
                <v-select v-model="selectedYear" :items="yearOptions" outlined dense hide-details clearable
                  @change="applyFilters">
                  <template v-slot:prepend-inner>
                    <div class="mb-1">
                      <CalenderSvg />
                    </div>
                  </template>
                </v-select>
              </div>
            </CustomInputContainer>
          </v-col>

          <v-col cols="12" sm="6" md="2" class="px-1">
            <CustomInputContainer label="Month">

              <div slot="input">
                <v-select v-model="selectedMonth" :items="monthOptions" outlined dense hide-details clearable
                  :disabled="!selectedYear" @change="applyFilters">
                  <template v-slot:append>
                    <v-icon small>mdi-calendar-month</v-icon>
                  </template>
                </v-select>
              </div>
            </CustomInputContainer>

          </v-col>

          <v-col cols="12" sm="6" md="2" class="pl-2">
            <v-btn color="secondary" class="tw-mt-7" outlined @click="clearFilters" :disabled="!hasActiveFilters">
              <v-icon small left>mdi-filter-remove</v-icon>
              Clear
            </v-btn>
          </v-col>
        </v-row>

        <!-- <v-btn color="primary" @click="openTaskDialog">
          <v-icon>mdi-plus</v-icon>
          Add Task
        </v-btn> -->
      </v-card-text>

      <v-divider></v-divider>

      <!-- Task Category Tabs -->
      <v-tabs v-model="activeTab" background-color="transparent" color="primary" grow>
        <v-tab :value="'today'">
          <v-icon left>mdi-calendar-today</v-icon>
          Today's Tasks
        </v-tab>
        <v-tab :value="'overdue'">
          <v-icon left>mdi-alert-circle</v-icon>
          Overdue
        </v-tab>
        <v-tab :value="'completed'">
          <v-icon left>mdi-check-circle</v-icon>
          Completed
        </v-tab>
        <v-tab :value="'upcoming'">
          <v-icon left>mdi-calendar-clock</v-icon>
          Upcoming
        </v-tab>
      </v-tabs>

      <v-divider></v-divider>

      <!-- Task Content Area -->
      <v-card-text class="pa-0 tw-w-full tw-px-10">
        <v-data-table :headers="taskHeaders" :items="tasks" :loading="loading" id="coa_table" item-key="_id"
          class="elevation-0 tw-w-full" :options.sync="options" :server-items-length="totalTasks"
          loading-text="Loading tasks... Please wait" show-select v-model="selectedTasks" single-select
          @item-selected="handleTaskSelection" :hide-default-header="false">

          <!-- Custom checkbox column to hide checkboxes for completed tasks -->
          <template v-slot:item.data-table-select="{ item, isSelected, select }">
            <v-simple-checkbox v-if="item.status !== 'completed'" :value="isSelected" @input="select($event)"
              :disabled="false"></v-simple-checkbox>
          </template>
          <template v-slot:item.title="{ item }">
            {{ item.title }} <span v-if="item.processName" class="text--secondary">({{ item.processName }})</span>
          </template>

          <template v-slot:item.company_name="{ item }">
            {{ item?.leadDetails?.company_name }}
          </template>


          <template v-slot:item.due_date="{ item }">
            <span v-if="item.due_date">
              {{ item.due_date | formatDateWithoutTime }}
            </span>
            <span v-else class="text--disabled">No due date</span>
          </template>


          <template v-slot:item.start_time="{ item }">
            <span v-if="item.start_time">
              {{ item.start_time }}
            </span>
            <span v-else class="text--disabled">-</span>
          </template>

          <template v-slot:item.status="{ item }">
            <span class="table_btn light_accent4 accent4--text" v-if="item.status == 'completed'">{{
              item.status }}</span>

            <span class="table_btn light_accent2" style="color: #ff9999" v-else-if="item.status == 'in progress'">{{
              item.status }}</span>

            <span class="table_btn light_accent2 accent3--text" style="color: #fff"
              v-else-if="item.status == 'pending'">{{ item.status }}</span>

          </template>


          <template v-slot:item.actions="{ item }">
            <v-menu bottom left>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item @click="viewTaskDetails(item)">
                  <v-list-item-icon>
                    <v-icon color="primary">mdi-eye</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>View Details</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item @click="editTask(item)">
                  <v-list-item-icon>
                    <v-icon color="secondary">mdi-pencil</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Edit Task</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item v-if="item.status !== 'completed'" @click="openDeleteModal(item)">
                  <v-list-item-icon>
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Delete Task</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider v-if="item.status !== 'completed' && activeTab !== 'completed'" />
                <v-list-item v-if="item.status !== 'completed' && activeTab !== 'completed'"
                  @click="markTaskComplete(item)" :disabled="loading_task[item._id]">
                  <v-list-item-icon>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      <span v-if="loading_task[item._id]">Marking Complete...</span>
                      <span v-else>Mark Complete</span>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="tw-text-center tw-py-8">
              <v-icon size="48" color="grey lighten-1" class="tw-mb-4">mdi-clipboard-text-outline</v-icon>
              <div class="tw-text-lg tw-text-gray-600 tw-mb-2">{{ getEmptyStateTitle() }}</div>
              <div class="tw-text-sm tw-text-gray-500">{{ getEmptyStateSubtitle() }}</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Modals -->
    <DialogsLeadsAddTask v-if="task_dialog" @close="handleTaskDialogClose" @reload="handleFilterTasks"
      :open="task_dialog" :taskContext="taskContext" @task-created="handleTaskCreated" />

    <DialogsLeadsViewTaskHistory v-if="task_history_dialog" @close="task_history_dialog = false"
      @reload="handleFilterTasks" :open="task_history_dialog" />

    <!-- Task Details Modal -->
    <DialogsLeadsViewTaskDetails :task="selectedTask" :open="taskDetailsDialog" @close="taskDetailsDialog = false"
      @edit-task="handleEditTaskFromDetails" @edit-lead="handleEditLeadFromDetails" @mark-complete="markTaskComplete" />

    <!-- Edit Task Modal -->
    <DialogsLeadsEditTask :task="selectedTask" :open="taskEditDialog" @close="taskEditDialog = false"
      @task-updated="handleTaskUpdated" @error="handleError" />

    <!-- Edit Lead Modal -->
    <DialogsLeadsEditLead :lead="selectedLead" :open="leadEditDialog" @close="leadEditDialog = false"
      @lead-updated="handleLeadUpdated" @error="handleError" />

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snack = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <DeleteModal
      :open="showDeleteModal"
      :title="'Delete Task?'"
      :message="'This will permanently delete the task. Are you sure you want to proceed?'"
      @cancel="showDeleteModal = false"
      @confirm="handleDeleteTask"
    />
  </div>
</template>

<script>
import TaskTable from './TaskTable.vue'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import CalenderSvg from '@/assets/images/icons/calender.svg'
import DeleteModal from '@/components/Common/DeleteModal.vue'

export default {
  name: 'TasksOverview',
  components: {
    TaskTable,
    CustomInputContainer,
    CalenderSvg,
    DeleteModal,
  },
  props: {},
  data() {
    return {
      activeTab: 0,
      task_dialog: false,
      task_history_dialog: false,
      loading: false,
      tasks: [],
      loading_task: {},
      snack: false,
      snackColor: '',
      snackText: '',
      // Filter data
      searchQuery: '',
      selectedYear: null,
      selectedMonth: null,
      // Server-side pagination
      options: {
        sortBy: [],
        page: 1,
        itemsPerPage: 20,
      },
      totalTasks: 0,
      taskCounts: {
        todaysTasks: 0,
        overdueTasks: 0,
        completedTasks: 0,
        upcomingTasks: 0
      },
      first_load_fetch: true,
      updating_filters: false,
      selectedTasks: [],
      // Modal states
      taskDetailsDialog: false,
      taskEditDialog: false,
      leadEditDialog: false,
      // Selected items
      selectedTask: null,
      selectedLead: null,
      // Task context for new task creation
      taskContext: {
        processName: null,
        processId: null,
        leadId: null
      },
      taskHeaders: [
        {
          text: 'Task Name',
          align: 'start',
          sortable: true,
          value: 'title',
        },
        {
          text: 'Client / Company Name',
          align: 'start',
          sortable: true,
          value: 'company_name',
        },
        { text: 'Due Date', value: 'due_date', sortable: true },
        { text: 'Start Time', value: 'start_time', sortable: true },
        { text: 'Status', value: 'status', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false, width: '80px' },
      ],
      showDeleteModal: false,
      taskToDelete: null,
      taskToComplete: null, // New property to store the task to be completed
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.userInfo || {}
    },

    currentUserId() {
      return this.currentUser._id || this.$store.state.user_id
    },

    yearOptions() {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let i = currentYear - 2; i <= currentYear + 1; i++) {
        years.push({ text: i.toString(), value: i })
      }
      return years
    },

    monthOptions() {
      return [
        { text: 'January', value: 0 },
        { text: 'February', value: 1 },
        { text: 'March', value: 2 },
        { text: 'April', value: 3 },
        { text: 'May', value: 4 },
        { text: 'June', value: 5 },
        { text: 'July', value: 6 },
        { text: 'August', value: 7 },
        { text: 'September', value: 8 },
        { text: 'October', value: 9 },
        { text: 'November', value: 10 },
        { text: 'December', value: 11 }
      ]
    },

    hasActiveFilters() {
      return !!(this.searchQuery || this.selectedYear || this.selectedMonth)
    },

    taskCountCards() {
      return [
        {
          title: "Today's Tasks",
          count: this.taskCounts.todaysTasks || 0,
          subtitle: 'Due today',
          icon: 'mdi-calendar-today',
          iconBg: 'tw-bg-blue-100',
          iconColor: 'primary',
          filter_key: 'today',
          colorBar: 'tw-bg-blue-400'
        },
        {
          title: 'Overdue Tasks',
          count: this.taskCounts.overdueTasks || 0,
          subtitle: 'Past due date',
          icon: 'mdi-alert-circle',
          iconBg: 'tw-bg-red-100',
          iconColor: 'error',
          filter_key: 'overdue',
          colorBar: 'tw-bg-red-400'
        },
        {
          title: 'Completed Tasks',
          count: this.taskCounts.completedTasks || 0,
          subtitle: 'Finished tasks',
          icon: 'mdi-check-circle',
          iconBg: 'tw-bg-green-100',
          iconColor: 'success',
          filter_key: 'completed',
          colorBar: 'tw-bg-green-400'
        },
        {
          title: 'Upcoming Tasks',
          count: this.taskCounts.upcomingTasks || 0,
          subtitle: 'Future tasks',
          icon: 'mdi-calendar-clock',
          iconBg: 'tw-bg-purple-100',
          iconColor: 'purple',
          filter_key: 'upcoming',
          colorBar: 'tw-bg-purple-400'
        }
      ]
    },

    filteredTasks() {
      let filtered = [...this.tasks]

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(task =>
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.processName?.toLowerCase().includes(query) ||
          task.owner?.toLowerCase().includes(query)
        )
      }

      // Apply year filter
      if (this.selectedYear) {
        filtered = filtered.filter(task => {
          if (!task.due_date) return false
          const taskYear = new Date(task.due_date).getFullYear()
          return taskYear === this.selectedYear
        })
      }

      // Apply month filter
      if (this.selectedMonth !== null && this.selectedYear) {
        filtered = filtered.filter(task => {
          if (!task.due_date) return false
          const taskDate = new Date(task.due_date)
          return taskDate.getMonth() === this.selectedMonth && taskDate.getFullYear() === this.selectedYear
        })
      }

      return filtered
    },

  },
  watch: {
    searchQuery: {
      handler() {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.handleFilterTasks()
        }
      }
    },
    selectedYear: {
      handler() {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.handleFilterTasks()
        }
      }
    },
    selectedMonth: {
      handler() {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.handleFilterTasks()
        }
      }
    },
    activeTab: {
      handler() {
        if (!this.first_load_fetch && !this.updating_filters) {
          this.handleFilterTasks()
        }
      }
    },
    options: {
      handler(newVal, oldVal) {
        if (!this.first_load_fetch && !this.updating_filters) {
          console.log('options changed:', this.options)
          this.handleFilterTasks()
        }
      },
      deep: true
    },
    selectedTasks: {
      handler(newVal, oldVal) {
        // Handle single task selection when selectedTasks changes
        if (newVal.length > 0 && newVal.length !== oldVal.length) {
          const selectedTask = newVal[0]

          // Store task context for new task creation
          this.taskContext = {
            processName: selectedTask.processName || null,
            processId: selectedTask.processId || null,
            leadId: selectedTask.leadId || selectedTask.lead_id || null
          }

          // Automatically mark task as complete
          this.markTaskCompleteFromSelection(selectedTask)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.handleFilterTasks()
  },
  methods: {
    openTaskDialog() {
      // Clear task context when opening dialog manually
      this.taskContext = {
        processName: null,
        processId: null,
        leadId: null
      }
      this.task_dialog = true
    },

    handleTaskSelection(selection) {
      // Handle single task selection
      if (selection.item && selection.value) {
        const task = selection.item

        // Store task context for new task creation
        this.taskContext = {
          processName: task.processName || null,
          processId: task.processId || null,
          leadId: task.leadId || task.lead_id || null
        }

        // Automatically mark task as complete
        this.markTaskCompleteFromSelection(task)
      }
    },

    async markTaskCompleteFromSelection(task) {
      try {
        // Store task context for new task creation BEFORE completing the task
        this.taskContext = {
          processName: task.processName || null,
          processId: task.processId || null,
          leadId: task.leadId || task.lead_id || null
        }

        // Store the task to be completed
        this.taskToComplete = { ...task }

        // Clear selection
        this.selectedTasks = []

        // Show task creation modal instead of completion modal
        this.task_dialog = true

      } catch (error) {
        console.error('Error preparing task completion:', error)
        this.showSnackbar('Failed to prepare task completion', 'error')
        // Clear selection on error
        this.selectedTasks = []
      }
    },

    async markTaskComplete(task) {
      try {
        // Store task context for new task creation BEFORE completing the task
        this.taskContext = {
          processName: task.processName || null,
          processId: task.processId || null,
          leadId: task.leadId || task.lead_id || null
        }

        // Store the task to be completed
        this.taskToComplete = { ...task }

        // Close any open modals
        this.taskDetailsDialog = false

        // Show task creation modal instead of completion modal
        this.task_dialog = true

      } catch (error) {
        console.error('Error preparing task completion:', error)
        this.showSnackbar('Failed to prepare task completion', 'error')
      }
    },

    // New method to handle task completion after follow-up task is created
    async completeTaskAfterFollowUp() {
      if (!this.taskToComplete) {
        console.error('No task to complete')
        return
      }

      try {
        this.$set(this.loading_task, this.taskToComplete._id, true)

        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios.put(`/tasks/${this.taskToComplete._id}`, {
          ...this.taskToComplete,
          status: 'completed'
        }, {
          headers: { Authorization: AuthStr }
        })

        await this.handleFilterTasks()

        this.showSnackbar('Task marked as completed', 'success')

        // Clear the task to complete
        this.taskToComplete = null

      } catch (error) {
        console.error('Error marking task complete:', error)
        this.showSnackbar('Failed to mark task as completed', 'error')
      } finally {
        this.$set(this.loading_task, this.taskToComplete?._id, false)
      }
    },

    viewTaskDetails(task) {
      this.selectedTask = { ...task }
      this.taskDetailsDialog = true
    },

    editTask(task) {
      this.selectedTask = { ...task }
      this.taskEditDialog = true
    },

    editLead(task) {
      // Assuming the task has lead information
      this.selectedLead = {
        _id: task.leadId || task.lead_id,
        first_name: task.leadDetails?.first_name || '',
        last_name: task.leadDetails?.last_name || '',
        email: task.leadDetails?.email || '',
        phone: task.leadDetails?.phone || '',
        notes: task.leadDetails?.notes || '',
        company: task.leadDetails?.company || ''
      }
      this.leadEditDialog = true
    },

    handleEditTaskFromDetails(task) {
      this.taskDetailsDialog = false
      this.editTask(task)
    },

    handleEditLeadFromDetails(task) {
      this.taskDetailsDialog = false
      this.editLead(task)
    },

    handleTaskUpdated(updatedTask) {
      this.showSnackbar('Task updated successfully', 'success')
      this.handleFilterTasks()
    },

    handleLeadUpdated(updatedLead) {
      this.showSnackbar('Lead updated successfully', 'success')
      this.handleFilterTasks()
    },

    handleError(message) {
      this.showSnackbar(message, 'error')
    },

    getStatusColor(status) {
      const statusColors = {
        'pending': 'warning',
        'in progress': 'info',
        'completed': 'success'
      }
      return statusColors[status?.toLowerCase()] || 'grey'
    },

    getStatusTextColor(status) {
      const textColors = {
        'pending': 'white',
        'in progress': 'white',
        'completed': 'white'
      }
      return textColors[status?.toLowerCase()] || 'white'
    },

    getDueTimeText(item) {
      if (!item.due_date || item.status === 'completed') {
        return item.status === 'completed' ? 'Completed' : 'No due date'
      }

      const now = new Date()
      const dueDate = new Date(item.due_date)
      const diffTime = dueDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      const diffMinutes = Math.ceil(diffTime / (1000 * 60))

      if (diffTime < 0) {
        const overdueDays = Math.abs(diffDays)
        const overdueHours = Math.abs(diffHours)
        if (overdueDays > 0) {
          return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`
        } else if (overdueHours > 0) {
          return `Overdue by ${overdueHours} hour${overdueHours > 1 ? 's' : ''}`
        } else {
          return `Overdue by ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''}`
        }
      } else {
        if (diffDays > 1) {
          return `Due in ${diffDays} days`
        } else if (diffHours > 1) {
          return `Due in ${diffHours} hours`
        } else if (diffMinutes > 0) {
          return `Due in ${diffMinutes} minutes`
        } else {
          return 'Due now'
        }
      }
    },

    getDueTimeColor(item) {
      if (!item.due_date || item.status === 'completed') {
        return item.status === 'completed' ? 'success' : 'grey'
      }

      const now = new Date()
      const dueDate = new Date(item.due_date)
      const diffTime = dueDate - now
      const diffHours = diffTime / (1000 * 60 * 60)

      if (diffTime < 0) {
        return 'error' // Overdue
      } else if (diffHours <= 24) {
        return 'warning' // Due within 24 hours
      } else {
        return 'primary' // Normal
      }
    },

    getDueTimeClass(item) {
      if (!item.due_date || item.status === 'completed') {
        return item.status === 'completed' ? 'tw-text-green-600' : 'tw-text-gray-500'
      }

      const now = new Date()
      const dueDate = new Date(item.due_date)
      const diffTime = dueDate - now
      const diffHours = diffTime / (1000 * 60 * 60)

      if (diffTime < 0) {
        return 'tw-text-red-600' // Overdue
      } else if (diffHours <= 24) {
        return 'tw-text-orange-600' // Due within 24 hours
      } else {
        return 'tw-text-blue-600' // Normal
      }
    },

    async handleFilterTasks() {
      try {
        this.loading = true
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const filters = {
          search: this.searchQuery,
          year: this.selectedYear,
          month: this.selectedMonth,
          user_id: this.currentUserId,
          category: this.getTaskCategory()
        }

        const queryParams = {
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy
        }

        console.log('Task filters:', filters, queryParams)

        this.updating_filters = true

        // Fetch tasks for current tab with pagination
        const response = await this.$axios.$post('/tasks', filters, {
          headers: { Authorization: AuthStr },
          params: queryParams
        })

        this.tasks = response.results || []
        this.totalTasks = response.totalResults || 0
        this.options.page = response.page || 1

        // Fetch task counts for all categories (for the statistics cards)
        await this.fetchTaskCounts()

      } catch (error) {
        console.error('Error fetching tasks:', error)
        this.showSnackbar('Failed to fetch tasks', 'error')
      } finally {
        this.loading = false
        this.updating_filters = false
        this.first_load_fetch = false
      }
    },

    showSnackbar(text, color) {
      this.snackText = text
      this.snackColor = color
      this.snack = true
    },

    applyFilters() {
      // Filters are applied automatically through computed properties
      // This method can be used for any additional filter logic if needed
    },

    clearFilters() {
      this.searchQuery = ''
      this.selectedYear = null
      this.selectedMonth = null
    },

    getEmptyStateTitle() {
      switch (this.activeTab) {
        case 'today':
          return 'No tasks due today'
        case 'overdue':
          return 'No overdue tasks'
        case 'completed':
          return 'No completed tasks'
        case 'upcoming':
          return 'No upcoming tasks'
        default:
          return 'No tasks found'
      }
    },

    getEmptyStateSubtitle() {
      switch (this.activeTab) {
        case 0:
          return 'Great! You have no tasks due today'
        case 1:
          return 'Excellent! All your tasks are up to date'
        case 2:
          return 'Completed tasks will appear here'
        case 3:
          return 'Future tasks will appear here'
        default:
          return 'Tasks will appear here when they are created'
      }
    },

    getTaskCategory() {
      // Map the active tab to the server-side category filter
      switch (this.activeTab) {
        case 0:
          return 'today'
        case 1:
          return 'overdue'
        case 2:
          return 'completed'
        case 3:
          return 'upcoming'
        default:
          return 'today'
      }
    },

    async fetchTaskCounts() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        const params = {
          search: this.searchQuery,
          year: this.selectedYear,
          month: this.selectedMonth,
          user_id: this.currentUserId
        }

        // Remove null/undefined params
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === undefined || params[key] === '') {
            delete params[key]
          }
        })

        // Fetch all counts in a single GET request
        const response = await this.$axios.$get('/tasks/counts', {
          headers: { Authorization: AuthStr },
          params: params
        })

        // Update task counts with the response data
        this.taskCounts = {
          todaysTasks: response.todaysTasks || 0,
          overdueTasks: response.overdueTasks || 0,
          completedTasks: response.completedTasks || 0,
          upcomingTasks: response.upcomingTasks || 0
        }

      } catch (error) {
        console.error('Error fetching task counts:', error)
        // Set default counts if API fails
        this.taskCounts = {
          todaysTasks: 0,
          overdueTasks: 0,
          completedTasks: 0,
          upcomingTasks: 0
        }
      }
    },


    clearTaskContext() {
      this.taskContext = {
        processName: null,
        processId: null,
        leadId: null
      }
    },

    // Override the task dialog close to handle completion
    handleTaskDialogClose() {
      this.task_dialog = false
      this.clearTaskContext()

      // Don't complete the task if the dialog was closed without creating a follow-up task
      // Only complete the task when a follow-up task is actually created
      this.taskToComplete = null
    },

    openDeleteModal(item) {
      this.taskToDelete = item;
      this.showDeleteModal = true;
    },
    async handleDeleteTask() {
      if (!this.taskToDelete || !this.taskToDelete._id) return;
      try {
        await this.$axios.delete(`/tasks/${this.taskToDelete._id}`);
        this.showDeleteModal = false;
        this.taskToDelete = null;
        this.handleFilterTasks && this.handleFilterTasks();
        this.showSnackbar('Task deleted successfully', 'success');
      } catch (e) {
        this.showSnackbar('Failed to delete task', 'error');
      }
    },
    setActiveTab(filterKey) {
      const tabMap = {
        today: 0,
        overdue: 1,
        completed: 2,
        upcoming: 3
      }
      this.activeTab = tabMap[filterKey] !== undefined ? tabMap[filterKey] : 0

      // Trigger filter logic
      this.handleFilterTasks()
    },
    handleTaskCreated() {
      // Complete the original task after follow-up task is created
      if (this.taskToComplete) {
        this.completeTaskAfterFollowUp()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// .tasks-overview {
//   width: 100%;
//   max-width: 100%;

//   .v-tabs {
//     margin-bottom: 20px;
//     width: 100%;
//   }

//   .v-tab {
//     text-transform: none !important;
//     font-weight: 500;
//   }

//   .v-chip {
//     font-size: 11px;
//     height: 20px;
//   }

//   .v-tabs-items {
//     width: 100%;
//   }

//   .v-card {
//     width: 100%;
//   }
// }


.v-data-table {
  background: white !important;
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table ::v-deep th {
  background-color: #f8fafc !important;
  color: #1f2937 !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.v-data-table ::v-deep td {
  white-space: nowrap;
  font-size: 0.875rem;
}

.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.v-data-table ::v-deep .v-data-footer {
  border-top: 1px solid #e5e7eb;
}
</style>
