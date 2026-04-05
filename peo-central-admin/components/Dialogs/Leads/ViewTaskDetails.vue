<template>
  <v-dialog v-model="open" max-width="600px" min-width="400px" persistent>
    <v-card class="rounded-xl pa-0 pt-0 task-details-modal" flat max-height="700" min-height="300">
      <v-row class="tw-py-3 tx-pr-3">
        <v-card-title class="py-0">
          <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
          <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize"> Task Details</span>
        </v-card-title>
        <v-spacer />
        <v-btn @click="handleClose" outlined icon color="red accent-4" class="tw-mr-3">
          <v-icon>mdi-close</v-icon>f
        </v-btn>
      </v-row>
      <v-divider></v-divider>

            <div class="task-details-content" v-if="task">
        <v-card-text class="tw-px-6 tw-py-8">
          <v-row>
            <!-- Task Title -->
            <v-col cols="12" class="pl-0 py-2">
              <div class="tw-mb-4">
                <h3 class="tw-text-lg tw-font-medium tw-mb-2 darkBlue-heading-text">{{ task.title }}</h3>
                <p class="tw-text-gray-600 tw-text-sm">{{ task.description || 'No description provided' }}</p>
              </div>
            </v-col>

            <!-- Status and Priority -->
            <v-col cols="6" class="pl-0 py-2">
              <CustomInputContainer label="Status">
                <div slot="input">
                  <span class="table_btn light_accent4 accent4--text" v-if="task.status == 'completed'">{{ task.status }}</span>

                  <span class="table_btn light_accent2" style="color: #ff9999" v-else-if="task.status == 'in progress'">{{
                    task.status
                  }}</span>

                  <span class="table_btn light_accent2 accent3--text" style="color: #fff" v-else-if="task.status == 'pending'">{{
                    task.status
                  }}</span>
                </div>
              </CustomInputContainer>
            </v-col>

            <!-- Due Date and Start Time -->
            <v-col cols="6" class="pl-0 py-2">
              <CustomInputContainer label="Due Date">
                <div slot="input">
                  <span class="tw-text-sm">{{ task.due_date | formatDateWithoutTime }}</span>
                </div>
              </CustomInputContainer>
            </v-col>

            <v-col cols="6" class="pl-0 py-2">
              <CustomInputContainer label="Start Time">
                <div slot="input">
                  <span class="tw-text-sm">{{ task.start_time || '-' }}</span>
                </div>
              </CustomInputContainer>
            </v-col>

            <!-- Assigned To -->
            <v-col cols="6" class="pl-0 py-2">
              <CustomInputContainer label="Assigned To">
                <div slot="input">
                  <span class="tw-text-sm">
                    {{
                      task.owner || `${task.assignedToDetails?.first_name} ${task.assignedToDetails?.last_name}` || 'Unassigned'
                    }}
                  </span>
                </div>
              </CustomInputContainer>
            </v-col>

            <!-- Pipeline -->
            <v-col cols="6" class="pl-0 py-2">
              <CustomInputContainer label="Pipeline/Stage">
                <div slot="input">
                  <span class="tw-text-sm">{{ task.pipelineName || task.processName || 'N/A' }}</span>
                </div>
              </CustomInputContainer>
            </v-col>

            <!-- Due Time Status -->
            <v-col cols="6" class="pl-0 py-2">
              <div class="tw-bg-gray-50 tw-p-4 tw-rounded-lg">
                <div class="tw-flex tw-items-center tw-gap-2 tw-mb-3">
                  <v-icon :color="getDueTimeColor(task)">mdi-clock-outline</v-icon>
                  <span class="tw-font-medium tw-text-sm" :class="getDueTimeClass(task)">
                    {{ getDueTimeText(task) }}
                  </span>
                </div>

                <div class="tw-flex tw-items-center tw-gap-2" v-if="task.category">
                  <v-icon color="grey" small>mdi-tag-outline</v-icon>
                  <span class="tw-text-sm">{{ task.category || 'General' }}</span>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Activity Logs Section -->
          <v-col cols="12" class="pl-0 py-2">
            <div class="tw-mt-6">
              <h4 class="tw-text-lg tw-font-medium tw-mb-4 darkBlue-heading-text tw-flex tw-items-center tw-gap-2">
                <v-icon color="primary">mdi-history</v-icon>
                Activity History
              </h4>

              <div v-if="task.activityDetails && task.activityDetails.length > 0" class="activity-logs-container">
                <v-expansion-panels focusable>
                  <v-expansion-panel
                    v-for="(activity, index) in task.activityDetails"
                    :key="activity._id"
                    class="tw-mb-2"
                  >
                    <v-expansion-panel-header class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500">
                      <div class="tw-flex tw-items-center tw-gap-2">
                        <v-icon color="primary" small>mdi-update</v-icon>
                        <span class="tw-font-medium tw-text-sm tw-text-gray-700">
                          {{ index + 1 }}. {{ formatActivityDate(activity.createdAt) }}
                        </span>
                      </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="tw-bg-gray-50 tw-p-4">
                      <div class="tw-text-sm tw-text-gray-600 tw-leading-relaxed">
                        {{ activity.logMessage }}
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <div v-else class="tw-bg-gray-50 tw-p-6 tw-rounded-lg tw-text-center">
                <v-icon color="grey" large class="tw-mb-2">mdi-history</v-icon>
                <p class="tw-text-gray-500 tw-text-sm">No activity history available for this task.</p>
              </div>
            </div>
          </v-col>
        </v-card-text>
      </div>

      <v-card-actions class="task-actions tw-px-6 tw-pb-4">
        <v-spacer />
        <!-- <v-btn flat text @click="handleClose" large>
          <span>Close</span>
        </v-btn> -->

        <v-btn color="secondary" text large @click="editTask"> Edit Task </v-btn>

        <v-btn color="red" text large @click="showDeleteModal = true" :disabled="task?.status === 'completed'">
          Delete Task
        </v-btn>

        <v-btn
          v-if="task?.status !== 'completed'"
          color="primary"
          large
          @click="markComplete"
          :loading="loading"
          :disabled="loading"
        >
          <v-icon left small>mdi-check-circle</v-icon>
          Mark Complete
        </v-btn>
      </v-card-actions>
    </v-card>
    <DeleteModal
      :open="showDeleteModal"
      title="Delete Task?"
      :message="'This will permanently delete the task. Are you sure you want to proceed?'"
      @cancel="showDeleteModal = false"
      @confirm="handleDeleteTask"
    />
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import DeleteModal from '@/components/Common/DeleteModal.vue'

export default {
  name: 'view-task-details',
  components: {
    CustomInputContainer,
    DeleteModal
  },
  props: {
    task: {
      type: Object,
      default: null
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      showDeleteModal: false
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },

    editTask() {
      this.$emit('edit-task', this.task)
    },

    editLead() {
      this.$emit('edit-lead', this.task)
    },

    markComplete() {
      this.$emit('mark-complete', this.task)
    },

    async handleDeleteTask() {
      if (!this.task || !this.task._id) return
      this.loading = true
      try {
        await this.$axios.delete(`/tasks/${this.task._id}`)
        this.$emit('delete-task', this.task)
        this.showDeleteModal = false
      } catch (e) {
        // Optionally show error
        this.$emit('error', e)
      } finally {
        this.loading = false
      }
    },

    getStatusColor(status) {
      const statusColors = {
        pending: 'warning',
        'in progress': 'info',
        completed: 'success'
      }
      return statusColors[status?.toLowerCase()] || 'grey'
    },

    getStatusTextColor(status) {
      const textColors = {
        pending: 'white',
        'in progress': 'white',
        completed: 'white'
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

    formatActivityDate(dateString) {
      if (!dateString) return 'Unknown date'
      return this.$moment(dateString).format('MMM DD, YYYY [at] h:mm A')
    }
  }
}
</script>

<style lang="scss" scoped>
.task-details-modal {
  display: flex;
  flex-direction: column;
  max-height: 700px;
  min-height: 300px;
}

.task-details-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.task-details-content .v-card__text {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; /* Space for action buttons */
}

.activity-logs-container {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.activity-logs-container::-webkit-scrollbar {
  width: 6px;
}

.activity-logs-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.activity-logs-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.activity-logs-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.task-actions {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 10;
  margin-top: auto;
}
</style>
