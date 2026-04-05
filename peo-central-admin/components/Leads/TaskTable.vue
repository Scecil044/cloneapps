<template>
  <div class="task-table tw-w-full">
    <v-data-table
      :headers="headers"
      :items="tasks"
      :single-expand="true"
      :expanded.sync="expanded"
      :loading="loading"
      item-key="_id"
      show-expand
      class="elevation-1 tw-w-full"
    >
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
        <v-chip
          :color="getStatusColor(item.status)"
          :text-color="getStatusTextColor(item.status)"
          small
          class="font-weight-medium"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="tw-p-0">
          <div class="tw-bg-gray-50 tw-mx-4 tw-my-2 tw-rounded-lg">
            <div class="tw-p-4">
              <!-- Owner and Pipeline Info -->
              <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
                <div class="tw-flex tw-items-center tw-gap-6">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <v-icon size="16" color="primary">mdi-account-circle</v-icon>
                    <span class="tw-text-sm tw-font-medium tw-text-gray-700">Owner:</span>
                    <span class="tw-text-sm tw-text-gray-600">
                      {{ item.owner || `${item.assignedToDetails?.first_name} ${item.assignedToDetails?.last_name}` || 'Unassigned' }}
                    </span>
                  </div>
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <v-icon size="16" color="primary">mdi-pipe</v-icon>
                    <span class="tw-text-sm tw-font-medium tw-text-gray-700">Pipeline:</span>
                    <span class="tw-text-sm tw-text-gray-600">{{ item.pipelineName || item.processName || 'N/A' }}</span>
                  </div>
                </div>

                <!-- Due Time Counter -->
                <div class="tw-flex tw-items-center tw-gap-2">
                  <v-icon size="16" :color="getDueTimeColor(item)">mdi-clock-outline</v-icon>
                  <span class="tw-text-sm tw-font-medium" :class="getDueTimeClass(item)">
                    {{ getDueTimeText(item) }}
                  </span>
                </div>
              </div>

              <!-- Description Section -->
              <div class="tw-mb-4">
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <v-icon color="primary" size="16">mdi-text-box-outline</v-icon>
                  <span class="tw-text-sm tw-font-medium tw-text-gray-700">Description</span>
                </div>
                <div class="tw-text-sm tw-text-gray-600 tw-leading-relaxed tw-pl-6">
                  {{ item.description || 'No description provided for this task.' }}
                </div>
              </div>

              <!-- Additional Info & Actions -->
              <div class="tw-flex tw-items-center tw-justify-between tw-pt-3 tw-border-t tw-border-gray-200">
                <div class="tw-flex tw-items-center tw-gap-6 tw-text-sm tw-text-gray-600">
                  <div class="tw-flex tw-items-center tw-gap-1">
                    <v-icon size="14" color="grey">mdi-tag-outline</v-icon>
                    <span>{{ item.category || 'General' }}</span>
                  </div>
                  <div class="tw-flex tw-items-center tw-gap-1">
                    <v-icon size="14" color="grey">mdi-flag-outline</v-icon>
                    <span>{{ item.priority || 'Medium' }}</span>
                  </div>
                </div>

                <div class="tw-flex tw-gap-3">
                  <v-btn
                    outlined
                    color="secondary"
                    @click="$emit('edit-task', item)"
                    small
                  >
                    <v-icon left small>mdi-pencil</v-icon>
                    Edit
                  </v-btn>
                  <v-btn
                    color="red"
                    outlined
                    @click="openDeleteModal(item)"
                    :disabled="item.status === 'completed'"
                    small
                  >
                    <v-icon left small>mdi-delete</v-icon>
                    Delete
                  </v-btn>
                  <v-btn
                    v-if="item.status !== 'completed' && showCompleteButton"
                    color="primary"
                    @click="$emit('mark-complete', item)"
                    :loading="loadingTask[item._id]"
                    :disabled="loadingTask[item._id]"
                    small
                  >
                    <v-icon left small>mdi-check-circle</v-icon>
                    Mark Complete
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </td>
      </template>

      <!-- Empty state -->
      <template v-slot:no-data>
        <div class="tw-text-center tw-py-8">
          <v-icon size="48" color="grey lighten-1" class="tw-mb-4">mdi-clipboard-text-outline</v-icon>
          <div class="tw-text-lg tw-text-gray-600 tw-mb-2">No tasks found</div>
          <div class="tw-text-sm tw-text-gray-500">Tasks will appear here when they are created</div>
        </div>
      </template>
    </v-data-table>
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
  name: 'TaskTable',
  components: { DeleteModal },
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    headers: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingTask: {
      type: Object,
      default: () => ({})
    },
    showCompleteButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      expanded: [],
      showDeleteModal: false,
      taskToDelete: null,
    }
  },
  methods: {
    getStatusColor(status) {
      const statusColors = {
        'completed': 'success',
        'in progress': 'warning',
        'pending': 'info',
        'overdue': 'error'
      }
      return statusColors[status?.toLowerCase()] || 'grey'
    },

    getStatusTextColor(status) {
      const textColors = {
        'completed': 'white',
        'in progress': 'white',
        'pending': 'white',
        'overdue': 'white'
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
    openDeleteModal(item) {
      this.taskToDelete = item;
      this.showDeleteModal = true;
    },
    async handleDeleteTask() {
      if (!this.taskToDelete || !this.taskToDelete._id) return;
      try {
        await this.$axios.delete(`/tasks/${this.taskToDelete._id}`);
        this.$emit('delete-task', this.taskToDelete);
        this.showDeleteModal = false;
        this.taskToDelete = null;
      } catch (e) {
        this.$emit('error', e);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.task-table {
  width: 100%;
  max-width: 100%;

  .v-data-table {
    width: 100%;
  }

  .v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content {
    box-shadow: unset;
    background: transparent;
  }

  .v-chip {
    text-transform: capitalize;
  }
}
</style>
