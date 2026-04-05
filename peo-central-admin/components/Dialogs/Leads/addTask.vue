<template>
  <v-dialog v-model="open" max-width="500px" min-width="350px" persistent>
    <v-card class="rounded-xl pa-0 pt-0" flat max-height="800px" min-height="400px">
      <v-form ref="taskForm" v-model="validTask" lazy-validation>
        <v-row class="tw-py-3 tx-pr-3">
          <v-card-title class="py-0">
            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
              Add Task</span>
          </v-card-title>
          <v-spacer />
          <v-btn @click="handleClose" outlined icon color="red accent-4" class="tw-mr-3">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-divider></v-divider>

        <v-card-text class="tw-px-6 tw-py-8">
          <v-row>
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer label="Title" :mandatory="true">
                <div slot="input">
                  <v-text-field class="inputField" v-model="task.title" solo dense :rules="main_rule" />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Task Due Date" :mandatory="true">
                <div slot="input">
                  <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field class="inputField" v-model="task.due_date" :rules="main_rule"
                        placeholder="DD/MM/YYYY" outlined dense solo readonly v-bind="attrs" v-on="on" />
                    </template>
                    <v-date-picker v-model="task.due_date" @input="date_menu = false" />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Start Time" :mandatory="true">
                <div slot="input">
                  <v-menu v-model="time_menu" :close-on-content-click="false" :nudge-right="40"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field class="inputField" v-model="task.start_time" :rules="main_rule" placeholder="HH/MM"
                        outlined dense solo readonly v-bind="attrs" v-on="on" />
                    </template>
                    <v-time-picker format="ampm" v-model="task.start_time" @input="time_menu = false" />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer label="Select Stage" :mandatory="true">
                <div slot="input">
                  <v-select :items="processes" dense :loading="loading_processes" append-icon="fa-chevron-down"
                    item-text="stage_name" :rules="main_rule" v-model="selected_process" return-object outlined />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer :mandatory="true" label="What is it about">
                <div slot="input">
                  <v-textarea v-model="task.description" :rules="main_rule" dense outlined required></v-textarea>
                </div>
              </CustomInputContainer>
            </v-col>

          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <!-- <div class="d-flex align-center justify-end"> -->
          <v-btn flat text :disabled="loading" @click="handleClose" large><span class="">Cancel</span></v-btn>

          <v-btn color="primary" outlined large :disabled="loading" :loading="loading" @click="createTask">Create
            Task</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

export default {
  name: 'leads-add-task',
  components: {
    CustomInputContainer,
  },
  props: ['leadDetails', 'open', 'next', 'taskContext'],
  watch: {
    open(val) {
      if (val) {
        this.task = {
          title: '',
          description: '',
          due_date: null,
          start_time: null,
        }
        // Pre-fill with taskContext if available
        if (this.taskContext) {
          this.task.leadId = this.taskContext.leadId
          this.task.processId = this.taskContext.processId
          this.task.processName = this.taskContext.processName
        }
      }
    },
  },
  mounted() {
    console.log('modal state')
    this.fetchProcesses()
  },
  data() {
    return {
      validTask: false,
      task: {
        title: '',
        description: '',
        due_date: '',
        start_time: '',
      },
      loading_processes: false,
      processes: [],
      selected_process: null,
      loading: false,
      date_menu: false,
      time_menu: false,
      main_rule: [(v) => !!v || 'This field is required'],
    }
  },
  computed: {
    computedProcess() {
      const processes = this.leadDetails?.processes || []
      const currentStatus = this.leadDetails?.status
      const currentIndex = processes.findIndex(
        (el) => el.stage_name === currentStatus
      )

      if (currentIndex === -1) return null

      // Return next process if `this.next` is true and there is a next one
      if (this.next && currentIndex + 1 < processes.length) {
        return processes[currentIndex + 1]
      }

      // Otherwise return the current process
      return processes[currentIndex]
    }
  },
  methods: {
    async fetchProcesses() {
      try {
        this.loading_processes = true
        const response = await this.$axios.get('/processes/module/leads')
        this.processes = response?.data?.stages || []
        if (this.processes.length) {
          this.selected_process = this.processes.find((el) => {
            return el._id == this.computedProcess?._id
          })
          // remove the previous processes to prevent move back
          const current_process_index = this.processes.findIndex(el => el._id == this.computedProcess?._id)
          if (current_process_index > -1) {
            this.processes = this.processes.slice(current_process_index)
          }
        }

      } catch (error) {
        console.log('Error fetching process: ', error?.message)
      }
      finally {
        this.loading_processes = false
      }
    },
    handleClose() {
      this.$emit('close')
    },
    requestReload() {
      this.$emit('reload')
    },
    async movePipelineForward() {
      try {
        console.log('movePipelineForward called with:', {
          id: this.leadDetails?._id,
          module: 'leads',
          stage_name: this.selected_process?.stage_name
        });

        const response = await this.$axios.post('/generic/process/flow/move/forward/stage', {
          id: this.leadDetails?._id,
          "module": "leads",
          "stage_name": this.selected_process?.stage_name
        })

        console.log('movePipelineForward response:', response.data);

      } catch (error) {
        console.log('Failed to move Pipeline Forward: ', error?.message)
      }
    },
    async createTask() {
      try {
        this.loading = true
        if (this.$refs.taskForm.validate()) {
          // Use taskContext values if available, otherwise fall back to leadDetails
          const taskPayload = {
            ...this.task,
            leadId: this.taskContext?.leadId || this.leadDetails?._id,
            processName: this.taskContext?.processName || this.selected_process?.stage_name,
            processId: this.taskContext?.processId || this.selected_process?._id,
            user_id: this.leadDetails?.user_id,
          }

          const taskResponse = await this.$axios.post('/tasks/create', taskPayload)

          // Mark the current action as having a task created
          if (taskResponse.data) {
            // Emit an event to update the action status
            this.$emit('task-created', {
              actionId: this.processParams?.[0]?._id,
              taskId: taskResponse.data._id
            })
          }

          if (this.selected_process?._id != this.computedProcess?._id) {
            // attempt to move forward
            console.log('trying to move pipeline forward');
            console.log('Current process:', this.computedProcess?.stage_name);
            console.log('Target process:', this.selected_process?.stage_name);
            await this.movePipelineForward()
            console.log('Pipeline moved forward successfully');
            // prompt refetch
            this.$nuxt.$emit('reload-process-details')
            console.log('Reload process details event emitted');
          }

          this.requestReload()
          this.handleClose()
          if (this.next) {
            console.log('Emitting moveNext event');
            this.$emit('moveNext')
          }
        }
      } catch (error) {
        console.log('create task log: ', error?.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
