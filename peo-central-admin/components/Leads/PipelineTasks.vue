<template>
  <div class="">
    <div class="tw-flex tw-justify-between tw-items-center tw-py-3">
      <div class="tw-flex tw-items-center  tw-gap-3">
        <v-img src="/shift/calendar_task.png" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
        <span>Tasks</span>
      </div>

      <div class="tw-flex tw-gap-3 tw-items-center">
        <v-btn outlined color="primary" @click="task_history_dialog = true">
          Task History
        </v-btn>
        <v-btn color="primary" @click="openTaskDialog">
          <v-icon>mdi-plus</v-icon>
          Add Task
        </v-btn>
      </div>
    </div>

    <div class="">
      <v-data-table :headers="taskHeaders" :items="tasks" :loading="loading" item-key="_id"
        class="elevation-1" show-select v-model="selectedTasks" single-select
        @item-selected="handleTaskSelection">

        <!-- Custom checkbox column to hide checkboxes for completed tasks -->
        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            v-if="item.status !== 'completed'"
            :value="isSelected"
            @input="select($event)"
            :disabled="false"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.title="{ item }">
          {{ item.title }} <span v-if="item.processName" class="text--secondary">({{ item.processName }})</span>
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

              <v-divider v-if="item.status !== 'completed'"></v-divider>

              <v-list-item v-if="item.status !== 'completed'"
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
            <div class="tw-text-lg tw-text-gray-600 tw-mb-2">No tasks found</div>
            <div class="tw-text-sm tw-text-gray-500">Tasks for this lead will appear here</div>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Modals -->
    <DialogsLeadsAddTask v-if="task_dialog" @close="handleTaskDialogClose" @reload="fetchTasks"
      :lead-details='leadDetails' :open="task_dialog" :taskContext="taskContext" @task-created="handleTaskCreated" />

    <DialogsLeadsViewTaskHistory v-if="task_history_dialog" @close="task_history_dialog = false" @reload="fetchTasks"
      :lead-details='leadDetails' :open="task_history_dialog" />

    <!-- Task Details Modal -->
    <DialogsLeadsViewTaskDetails :task="selectedTask" :open="taskDetailsDialog" @close="taskDetailsDialog = false"
      @edit-task="handleEditTaskFromDetails" @mark-complete="markTaskComplete" />

    <!-- Edit Task Modal -->
    <DialogsLeadsEditTask :task="selectedTask" :open="taskEditDialog" @close="taskEditDialog = false"
      @task-updated="handleTaskUpdated" @error="handleError" />

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
import DeleteModal from '@/components/Common/DeleteModal.vue'
export default {
  name: 'lead-tasks',
  components: { DeleteModal },
  props: ['leadDetails'],
  data() {
    return {
      task_dialog: false,
      task_history_dialog: false,
      loading: false,
      tasks: [],
      loading_task: {},
      snack: false,
      snackColor: '',
      snackText: '',
      // Task selection
      selectedTasks: [],
      // Modal states
      taskDetailsDialog: false,
      taskEditDialog: false,
      // Selected items
      selectedTask: null,
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
  mounted() {
    this.fetchTasks()
    console.log('mounted')
  },
  computed: {
    computedProcess() {
      const processes = this.leadDetails?.processes || []
      const currentStatus = this.leadDetails?.status
      const currentIndex = processes.findIndex(
        (el) => el.stage_name === currentStatus
      )

      if (currentIndex === -1) return null
      // Otherwise return the current process
      return processes[currentIndex]
    }
  },
  watch: {
    selectedTasks: {
      handler(newVal, oldVal) {
        // Handle single task selection when selectedTasks changes
        if (newVal.length > 0 && newVal.length !== oldVal.length) {
          const selectedTask = newVal[0]

          // Store task context for new task creation
          this.taskContext = {
            processName: selectedTask.processName || null,
            processId: selectedTask.processId || null,
            leadId: selectedTask.leadId || selectedTask.lead_id || this.leadDetails?._id
          }

          // Automatically mark task as complete
          this.markTaskCompleteFromSelection(selectedTask)
        }
      },
      deep: true
    }
  },
  methods: {
    openTaskDialog() {
      // Clear task context when opening dialog manually
      this.taskContext = {
        processName: null,
        processId: null,
        leadId: this.leadDetails?._id
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
          leadId: task.leadId || task.lead_id || this.leadDetails?._id
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
          leadId: task.leadId || task.lead_id || this.leadDetails?._id
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
      } finally {
        this.$set(this.loading_task, task._id, false)
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

    handleEditTaskFromDetails(task) {
      this.taskDetailsDialog = false
      this.editTask(task)
    },

    handleTaskUpdated(updatedTask) {
      this.showSnackbar('Task updated successfully', 'success')
      this.fetchTasks()
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

    async markTaskComplete(task) {
      try {
        // Store task context for new task creation BEFORE completing the task
        this.taskContext = {
          processName: task.processName || null,
          processId: task.processId || null,
          leadId: task.leadId || task.lead_id || this.leadDetails?._id
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
      } finally {
        this.$set(this.loading_task, task._id, false)
      }
    },

    showSnackbar(text, color) {
      this.snackText = text
      this.snackColor = color
      this.snack = true
    },

    clearTaskContext() {
      this.taskContext = {
        processName: null,
        processId: null,
        leadId: this.leadDetails?._id
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

    // Override the task creation success to complete the original task
    handleTaskCreated() {
      // Complete the original task after follow-up task is created
      if (this.taskToComplete) {
        this.completeTaskAfterFollowUp()
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

        const response = await this.$axios.put(`/tasks/${this.taskToComplete._id}`, {
          ...this.taskToComplete,
          status: 'completed'
        })

        await this.fetchTasks()

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

    async fetchTasks() {
      try {
        this.loading = true
        const response = await this.$axios.post('/tasks/', {
          leadId: this.leadDetails?._id,
          // processId: this.computedProcess?._id
        })

        console.log('tasks response', response.data)
        this.tasks = response.data.results || []
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
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
        await this.fetchTasks();
        this.showSnackbar('Task deleted successfully', 'success');
      } catch (e) {
        this.showSnackbar('Failed to delete task', 'error');
      }
    },
  },
}
</script>

<style>
.v-data-table>.v-data-table__wrapper tbody tr.v-data-table__expanded__content {
  box-shadow: unset;
  background: transparent;
}

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
