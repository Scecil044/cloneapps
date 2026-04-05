<template>
  <v-dialog v-model="open" max-width="500px" min-width="350px" persistent>
    <v-card class="rounded-xl pa-0 pt-0" flat max-height="800px" min-height="600px">
      <v-form ref="taskForm" v-model="validTask" lazy-validation>
        <v-row class="tw-py-3 tx-pr-3">
          <v-card-title class="py-0">
            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
              Edit Task</span>
          </v-card-title>
          <v-spacer />
          <v-btn @click="handleClose" outlined icon color="red accent-4" class="tw-mr-3">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-divider></v-divider>

        <v-card-text class="tw-px-6 tw-py-8 scroll">
          <v-row>
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer label="Title" :mandatory="true">
                <div slot="input">
                  <v-text-field class="inputField" v-model="editedTask.title" solo dense :rules="main_rule" />
                </div>
              </CustomInputContainer>
            </v-col>
            
            <v-col cols="6" class="pl-0 py-0">
              <CustomInputContainer label="Task Due Date" :mandatory="true">
                <div slot="input">
                  <v-menu v-model="date_menu" :close-on-content-click="false" :nudge-right="40"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field class="inputField" v-model="editedTask.due_date" :rules="main_rule"
                        placeholder="DD/MM/YYYY" outlined dense solo readonly v-bind="attrs" v-on="on" />
                    </template>
                    <v-date-picker v-model="editedTask.due_date" @input="date_menu = false" />
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
                      <v-text-field class="inputField" v-model="editedTask.start_time" :rules="main_rule" placeholder="HH/MM"
                        outlined dense solo readonly v-bind="attrs" v-on="on" />
                    </template>
                    <v-time-picker format="ampm" v-model="editedTask.start_time" @input="time_menu = false" />
                  </v-menu>
                </div>
              </CustomInputContainer>
            </v-col>
            
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer label="Status" :mandatory="true">
                <div slot="input">
                  <v-select
                    :items="statusOptions"
                    dense
                    append-icon="fa-chevron-down"
                    item-text="text"
                    item-value="value"
                    :rules="main_rule"
                    v-model="editedTask.status"
                    outlined
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            
         
            
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer label="Select Stage" :mandatory="true">
                <div slot="input">
                  <v-select
                    :items="processes"
                    dense
                    :loading="loading_processes"
                    append-icon="fa-chevron-down"
                    item-text="stage_name"
                    :rules="main_rule"
                    v-model="selected_process"
                    return-object
                    outlined
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer :mandatory="true" label="What is it about">
                <div slot="input">
                  <v-textarea v-model="editedTask.description" :rules="main_rule" dense outlined required></v-textarea>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn flat text :disabled="loading" @click="handleClose" large>
            <span>Cancel</span>
          </v-btn>

          <v-btn color="primary" outlined large :disabled="loading" :loading="loading" @click="updateTask">
            Update Task
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

export default {
  name: 'edit-task',
  components: {
    CustomInputContainer,
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
  watch: {
    open(val) {
      if (val && this.task) {
        this.editedTask = { ...this.task }
        this.selected_process = this.processes.find(p => p._id === this.task.processId) || null
      }
    },
    task: {
      handler(newTask) {
        if (newTask) {
          this.editedTask = { ...newTask }
          this.selected_process = this.processes.find(p => p._id === newTask.processId) || null
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.fetchProcesses()
  },
  data() {
    return {
      validTask: false,
      editedTask: {
        title: '',
        description: '',
        due_date: '',
        start_time: '',
        status: 'pending',
      },
      loading_processes: false,
      processes: [],
      selected_process: null,
      loading: false,
      date_menu: false,
      time_menu: false,
      main_rule: [(v) => !!v || 'This field is required'],
      statusOptions: [
        { text: 'Pending', value: 'pending' },
        { text: 'In Progress', value: 'in progress' },
        { text: 'Completed', value: 'completed' }
      ],
    }
  },
  methods: {
    async fetchProcesses() {
      try {
        this.loading_processes = true
        const response = await this.$axios.get('/processes/module/leads')
        this.processes = response?.data?.stages || []
      } catch (error) {
        console.log('Error fetching process: ', error?.message)
      } finally {
        this.loading_processes = false
      }
    },
    
    handleClose() {
      this.$emit('close')
    },
    
    async updateTask() {
      try {
        this.loading = true
        if (this.$refs.taskForm.validate()) {
          const AuthStr = 'Bearer '.concat(this.$store.state.token)
          
          await this.$axios.put(`/tasks/${this.editedTask._id}`, {
            ...this.editedTask,
            processName: this.selected_process?.stage_name,
            processId: this.selected_process?._id,
          }, {
            headers: { Authorization: AuthStr }
          })

          this.$emit('task-updated', this.editedTask)
          this.handleClose()
        }
      } catch (error) {
        console.log('update task error: ', error?.message)
        this.$emit('error', 'Failed to update task')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>