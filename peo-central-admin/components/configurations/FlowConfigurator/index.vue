<template>
  <div>
    <v-row class="flow-configurator">
      <v-col cols="12" sm="12" md="4">
        <v-card class="pa-5 rounded-xl shadow">
          <h4 class="mb-5 font-weight-bold">Configuration Central</h4>
          <v-list>
            <v-list-item class="active mt-4">
              <span> Flow Configurator </span>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" sm="12" md="8">
        <v-card class="pa-5 rounded-xl shadow">
          <v-row>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <label class="text--text pr-4">Select Flow</label>
                <v-autocomplete outlined dense :items="processList" item-text="process_name" return-object
                  v-model="selectedProcess" placeholder="Select Flow" class="rounded-xl proposalDialog_date_field2"
                  append-icon="fa-chevron-down" @change="getSelectedProcess(selectedProcess)" hide-details>
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title :class="{ 'add-process': item === 'Add Process' }"
                        @click="addProcessModal(item)">
                        <v-icon v-if="item.process_name === 'Add Process'" small color="#0D5DE1"
                          class="mr-2">fa-plus</v-icon>
                        {{ item.process_name }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </div>
            </v-col>
            <v-col cols="12" sm="6" class="text-right pt-0">
              <v-btn elevation="'0" width="150px" color="primary" class="border-radius-medium"
                v-if="editStages && !editLoading" @click="saveProcess()">Update</v-btn>
              <v-img src="/animated/refresh.svg" max-width="24" height="24" v-if="editStages && editLoading" contain
                class="mr-3"></v-img>
              <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="editStages" :disabled="editLoading"
                @click="selectedProcess = processListBackup[selectedProcessIndex]; editStages = !editStages">Cancel</v-btn>
              <v-btn color="#5C7EEF" v-else-if="!editStages" class="rounded-xl" small outlined
                @click="editStages = true">Edit</v-btn>
            </v-col>

            <!-- Hiding for PEO Central -->

            <!-- <v-col cols="12" md="6" v-if="selectedProcess">
              <v-checkbox v-model="selectedProcess.substeps" color="#0461DA" label="Show Sub Steps" dense />
            </v-col> -->
          </v-row>
          <h4 class="mt-10 mb-5 font-weight-bold">
            Steps for
            {{ selectedProcess !== 'Add Process' ? selectedProcess.process_name : '' }}
          </h4>
          <v-expansion-panels v-if="selectedProcess">
            <draggable v-model="selectedProcess.stages" :disabled="!editStages"
              :options="{ animation: 150, group: 'items', ghostClass: 'ghost' }">
              <v-expansion-panel v-for="(step, index) in selectedProcess.stages" :key="index">
                <v-expansion-panel-header :hide-actions="!selectedProcess.substeps">
                  <div class="d-flex">
                    <div class="step-num">{{ index + 1 }}</div>
                    <h5 class="font-weight-bold">{{ step.stage_name }}</h5>
                  </div>
                  <div class="d-flex justify-end mr-4">
                    <v-icon small color="#0D5DE1" class="ml-5 icon" v-if="editStages"
                      @click="($event) => editStep($event, step, index)">fa-pen</v-icon>
                    <v-icon small color="#0D5DE1" class="ml-5 icon" v-if="editStages"
                      @click="($event) => duplicateStep(index, $event)">fa-copy</v-icon>
                    <v-icon small color="#E5252A" class="ml-5 icon" v-if="editStages"
                      @click="($event) => handleDeleteStep($event, index)">fa-trash-can</v-icon>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content v-if="selectedProcess.substeps">
                  <draggable v-model="step.substeps" :options="{
                    animation: 150,
                    group: 'items',
                    ghostClass: 'ghost',
                  }">
                    <div class="substep my-4 pa-3 d-flex justify-space-between" v-for="(substep, i) in step.substeps"
                      :key="i">
                      <span>{{ substep.step_name }}</span>
                      <div>
                        <v-icon small color="#0D5DE1" class="ml-5 icon"
                          @click="editSubStep(substep, i, index)">fa-pen</v-icon>
                        <v-icon small color="#E5252A" class="ml-5 icon"
                          @click="handleDeleteSubStep(i, index)">fa-minus-circle</v-icon>
                      </div>
                    </div>
                  </draggable>
                  <div class="substep add-substep my-4 pa-3">
                    <v-icon small color="#0D5DE1" class="ml-5 mr-1">fa-plus</v-icon>
                    <span class="font-weight-bold" @click="addSubStepModal(step.stage_name)">Add Sub Step</span>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </draggable>
          </v-expansion-panels>
          <v-btn v-if="editStages" outlined color="#0D5DE1" @click="
            addNewStep = true
          stepCondition = 'Add'
            ">
            <v-icon small color="#0D5DE1" class="mr-2">fa-plus</v-icon>
            <span class="font-weight-bold">Add Step</span>
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="addProcess" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Add Process</h4>
          <v-icon small color="subtext" class="ml-5" @click="
            closeAll()
          selectedProcess = 'Offboarding Process'
            ">fa-close</v-icon>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-form ref="addProcessForm" v-model="addProcessValid">
              <div class="mb-8">
                <label class="text--text">Module</label>
                <v-select dense :items="modulesOptions" item-text="text" item-value="value" v-model="newProcess.module"
                  placeholder="Select Step Type" append-icon="fa-chevron-down" :rules="requiredRule"></v-select>
              </div>
              <div class="mb-8">
                <label class="text--text">Process Name</label>
                <v-text-field v-model="newProcess.process_name" placeholder="Type Name" dense :rules="requiredRule" />
              </div>
              <v-btn class="tall__btn pl-6 pr-6" color="primary" @click="handleAddingNewProcess()">Add Process</v-btn>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addNewStep" persistent max-width="900px">
      <v-card id="card" style="padding: 20px 30px !important;max-height:800px" class=" scroll">
        <v-card-title id=" card-title">
          <h4 class="text--text">{{ stepCondition }} Step</h4>
          <v-spacer></v-spacer>
          <v-icon small color="subtext" class="ml-5" @click="closeAll()">fa-close</v-icon>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-form ref="newStepForm" v-model="newStepValid">
              <v-row>
                <v-col cols="12" lg="6">
                  <label class="text--text">Step Type</label>
                  <div slot="input">
                    <v-text-field v-model="selectedProcess.process_name" placeholder="Type Name" dense disabled />
                  </div>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Step Name</label>
                  <div slot="input">
                    <v-text-field v-model="newStep.stage_name" placeholder="Step Name" dense :rules="requiredRule" />
                  </div>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Visible Users</label>
                  <v-select dense :items="visible_users" item-text="key" item-value="value" v-model="newStep.visibility"
                    placeholder="Select One" append-icon="fa-chevron-down" multiple
                    :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Completion Condition</label>
                  <v-select dense :items="completion_condition" item-text="text" item-value="value"
                    v-model="newStep.complete_condition" placeholder="Select One" append-icon="fa-chevron-down"
                    :rules="requiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Content Visibility</label>
                  <v-select dense :items="visible_users" item-text="key" item-value="value"
                    v-model="newStep.content_visibility" placeholder="Select Visible User" append-icon="fa-chevron-down"
                    multiple :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Assigned Users</label>
                  <v-select dense :items="assigned_users" item-text="key" item-value="value"
                    v-model="newStep.assigned_users" placeholder="Select Visible User" append-icon="fa-chevron-down"
                    multiple :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Mandatory Documents</label>
                  <v-autocomplete dense :items="documentTypes" item-text="name" item-value="id"
                    v-model="newStep.documents_required" placeholder="Select Documents" append-icon="fa-chevron-down"
                    multiple></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Initial Status</label>
                  <v-select dense :items="substep_status" v-model="newStep.process_status" placeholder="Select One"
                    append-icon="fa-chevron-down" :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <v-checkbox v-model="newStep.auto_complete" color="#0461DA" label="Complete This Step Automatically"
                    dense />
                </v-col>
              </v-row>
              <v-row class="pt-5">
                <v-col cols="12" sm="6" class="px-5 font weight-bold pt-0 text-left">
                  <v-card-title class=" pa-0">
                    <v-img src="/adminCentral/employees.svg" max-width="fit-content" height="fit-content" class="mr-2"
                      contain></v-img>
                    <h4 class="darkBlue-heading-text subHeadingFontSize">{{ editAction ? 'Edit ' : '' }}Actions</h4>
                    <v-spacer></v-spacer>
                  </v-card-title>
                </v-col>
                <v-col cols="12" sm="6" class="text-right pt-0">
                  <v-btn elevation="0" width="150px" color="#0064D7" @click="newStep.actions.push(newAction)" dark
                    v-if="editAction" class="white--text border-radius-medium">Add Action</v-btn>
                  <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="editAction"
                    @click="editAction = false; action_headers.pop()">Done</v-btn>
                  <v-btn color="#5C7EEF" v-if="!editAction"
                    @click="editAction = true; action_headers.push({ 'text': 'Action', 'value': '', })" class="rounded-xl"
                    small outlined><v-img src="/profile/edit.svg" max-width="fit-content" height="fit-content"
                      class="mr-2" contain></v-img>
                    Edit</v-btn>
                </v-col>
              </v-row>
              <v-col cols="12" lg="12" v-if="!newStep.substeps">
                <v-data-table :headers="action_headers" :items="newStep.actions" hide-default-header hide-default-footer>
                  <template v-slot:item="{ item, index }">
                    <tr style="text-align: left;">
                      <td class="font-weight-medium subHeadingFontSize mb-0">{{ item.action_type }}</td>
                      <td>
                        <v-chip small :color="getStatusColorTooltip(item.status)"><span
                            :style="getTextStyle(item.status)">{{ item.status }}</span></v-chip>
                      </td>
                      <td class="font-weight-medium subHeadingFontSize mb-0">{{ getTemplateName(item) }}</td>
                      <td class="font-weight-medium subHeadingFontSize mb-0">{{ item.automate }}</td>

                      <td v-if="editAction">
                        <v-btn class="mx-2" icon
                          @click="selectedAction = newStep.actions[index]; selectedActionCondition = newStep.actions[index]?.condition || ''; selectedActionIndex = index; actionPopup = true">
                          <v-icon small color="secondary">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn class="mx-2" icon @click="removeAction(index)">
                          <v-icon small color="error">mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-col>
              <v-col cols="12" lg="12" class="d-flex align-center justify-end">

                <v-btn dark class="tall__btn pl-6 pr-6 font-weight-bold" color="#0461DA"
                  @click="handleAddingNewStep(stepCondition)">{{ stepCondition }} Step</v-btn>
              </v-col>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="actionPopup" persistent max-width="700px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Edit Action</h4>

          <v-icon small color="subtext" class="ml-5" @click="actionPopup = false">fa-close</v-icon>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-form ref="actionForm">
              <v-row>
                <v-col cols="12" lg="6">
                  <label class="text--text">Button Text</label>
                  <v-text-field dense v-model="selectedAction.button" placeholder="Button Text"></v-text-field>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Message Text</label>
                  <v-text-field dense v-model="selectedAction.message" placeholder="Message Text"></v-text-field>
                </v-col>

                <v-col cols="12" lg="6">
                  <label class="text--text">Select Action</label>
                  <v-autocomplete dense :items="substep_actions" v-model="selectedAction.action_type"
                                  placeholder="Select Action" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Initial Status</label>
                  <v-autocomplete dense :items="substep_status" v-model="selectedAction.status"
                                  placeholder="Select Initial Status" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>

                <!-- Assigned Users dropdown -->
                <v-col cols="12" lg="6">
                  <label class="text--text">Assigned Users</label>
                  <v-select
                    v-model="selectedAction.assigned_users"
                    :items="['isSuperAdmin', 'isAdmin', 'isEmployee']"
                    multiple
                    placeholder="Select Assigned Users"
                    append-icon="fa-chevron-down"
                    dense
                    :rules="selectRequiredRule"
                  ></v-select>
                </v-col>

                <v-col cols="12" lg="6" v-if="selectedAction.action_type == 'email'">
                  <label class="text--text">Select Template</label>
                  <v-autocomplete dense :items="emailList.filter(a => a.module == selectedProcess.module)"
                                  item-text="name" item-value="id" v-model="selectedAction.template_id"
                                  placeholder="Select Email Template" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6" v-if="selectedAction.action_type == 'visa process'">
                  <label class="text--text">Select Visa Process</label>
                  <v-autocomplete dense :items="['new visa process', 'visa cancellation', 'visa renewal']"
                                  item-text="name" item-value="id" v-model="selectedAction.process_type"
                                  placeholder="Select Visa Process" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6" v-if="selectedAction.action_type == 'fill form'">
                  <label class="text--text">Select Form</label>
                  <v-autocomplete dense :items="formList.filter(a => a.module == selectedProcess.module)"
                                  item-text="name" item-value="id" v-model="selectedAction.template_id"
                                  placeholder="Select Form" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6" v-if="selectedAction.action_type == 'sms'">
                  <label class="text--text">Select Template</label>
                  <v-autocomplete dense :items="smsList.filter(a => a.module == selectedProcess.module)"
                                  item-text="name" item-value="id" v-model="selectedAction.template_id"
                                  placeholder="Select SMS Template" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6" v-if="selectedAction.action_type == 'document upload'">
                  <label class="text--text">Select Document Type</label>
                  <v-autocomplete dense :items="documentTypes" item-text="name" item-value="id"
                                  v-model="selectedAction.required_documents" placeholder="Select Document Type"
                                  append-icon="fa-chevron-down" multiple :rules="selectRequiredRule"></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6" v-if="selectedAction.action_type == 'document'">
                  <label class="text--text">Select Document Type</label>
                  <v-autocomplete dense :items="documentTemplates.filter(a => a.module == selectedProcess.module)"
                                  item-text="name" item-value="id" v-model="selectedAction.template_id"
                                  placeholder="Select Document Template" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>

                <v-col cols="12" lg="6" v-if="selectedAction.action_type == 'document'">
                  <label class="text--text">Condition Document Name</label>
                  <v-text-field dense
                                v-model="selectedActionCondition.document_name"
                                placeholder="Condition Document Name"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" lg="6">
                  <label class="text--text">Preview</label>
                  <v-autocomplete dense :items="['previous', 'current', 'next']" v-model="selectedAction.preview"
                                  placeholder="Select Preview" append-icon="fa-chevron-down"
                                  :rules="selectRequiredRule"></v-autocomplete>
                </v-col>
                <v-col cols="12" lg="6"
                       v-if="selectedAction.action_type == 'email' || selectedAction.action_type == 'sms'">
                  <label class="text--text">Automate this action</label>
                  <v-checkbox v-model="selectedAction.automate"></v-checkbox>
                </v-col>
                <v-col cols="12" lg="6"
                       v-if="selectedAction.action_type == 'document' || selectedAction.action_type == 'invoice creation'">
                  <label class="text--text">Uploadable Doc Type</label>
                  <v-autocomplete dense :items="documentTypes" item-text="name" item-value="id"
                                  v-model="selectedAction.uploadable_document" placeholder="Select Documents"
                                  append-icon="fa-chevron-down"></v-autocomplete>
                </v-col>
                <v-col cols="12" class="d-flex justify-end">
                  <v-btn elevation="0" width="150px" color="#0064D7" @click="updateAction(selectedAction, selectedActionCondition)" dark
                         class="white--text border-radius-medium">Update</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addSubStep" persistent max-width="700px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text">Add Sub Step</h4>
          <v-icon small color="subtext" class="ml-5" @click="addSubStep = false">fa-close</v-icon>
        </v-card-title>
        <v-card-text id="card-text">
          <v-container class="ma-0 pa-0">
            <v-form ref="subStepForm" v-model="subStepValid">
              <v-row>
                <v-col cols="12" lg="6">
                  <label class="text--text">Sub Step Name</label>
                  <div slot="input">
                    <v-text-field v-model="newSubStep.step_name" placeholder="Step Name" dense :rules="requiredRule" />
                  </div>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Visible Users</label>
                  <v-select dense :items="visible_users" item-text="text" item-value="value"
                    v-model="newSubStep.visibility" placeholder="Select One" append-icon="fa-chevron-down" multiple
                    :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Completion Condition</label>
                  <v-select dense :items="completion_condition" item-text="text" item-value="value"
                    v-model="newSubStep.complete_condition" placeholder="Select One" append-icon="fa-chevron-down"
                    :rules="requiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Select Action</label>
                  <v-select dense :items="substep_actions" item-text="text" item-value="value"
                    v-model="newSubStep.actions" placeholder="Select Action" append-icon="fa-chevron-down" multiple
                    :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col v-if="newSubStep.actions.includes('Send email')" cols="12" lg="6">
                  <label class="text--text">Select Email Template</label>
                  <v-select dense :items="email_templates" item-text="text" item-value="value"
                    placeholder="Select Template" append-icon="fa-chevron-down" multiple
                    :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col v-if="newSubStep.actions.includes('Attach documents')" cols="12" lg="6">
                  <label class="text--text">Select Document Template</label>
                  <v-select dense :items="document_templates" item-text="text" item-value="value"
                    placeholder="Select Template" append-icon="fa-chevron-down" multiple
                    :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col v-if="newSubStep.actions.includes('Generate Documents')" cols="12" lg="6">
                  <label class="text--text">Select Document</label>
                  <v-select dense :items="documents" item-text="text" item-value="value" placeholder="Select Template"
                    append-icon="fa-chevron-down" multiple :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Content Visibility</label>
                  <v-select dense :items="visible_users" item-text="text" item-value="value"
                    v-model="newSubStep.content_visibility" placeholder="Select Visible User"
                    append-icon="fa-chevron-down" multiple :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12" lg="6">
                  <label class="text--text">Assigned Users</label>
                  <v-select dense :items="assigned_users" item-text="text" item-value="value"
                    v-model="newSubStep.assigned_users" placeholder="Select Visible User" append-icon="fa-chevron-down"
                    multiple :rules="selectRequiredRule"></v-select>
                </v-col>
                <v-col cols="12">
                  <v-checkbox v-model="newSubStep.auto_complete" color="#0461DA" label="Complete Automatically" dense />
                </v-col>
              </v-row>
              <v-btn dark class="tall__btn pl-6 pr-6 font-weight-bold" color="#0461DA"
                @click="handleAddingNewSubStep(subStepCondition)">{{ subStepCondition }} Step</v-btn>
            </v-form>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteStep" class="ma-0 pa-0" max-width="500">
      <v-card id="card">
        <v-card-title id="card-title">Are you sure you want to delete this Step?</v-card-title>
        <v-card-text id="card-text">
          <div class="flex_row">
            <v-spacer />
            <v-btn class="tall__btn" color="subtext" outlined @click="deleteStep = false">Cancel</v-btn>
            <v-btn class="tall__btn ml-3" color="error" @click="handleDelete">
              <v-icon color="white" class="mr-2" small>fa-trash</v-icon>
              Delete
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
export default {
  components: { draggable },
  data() {
    return {
      editAction: false,
      actionPopup: false,
      action_headers: [
        {
          'text': 'Action Type',
          'value': 'action_type',
        },
        {
          'text': 'Initial Status',
          'value': 'status',
        },
        {
          'text': 'Template Name',
          'value': 'template_id',
        },
        {
          'text': 'Automate Action',
          'value': 'automate',
        }
      ],
      editStages: false,
      editLoading: false,
      requiredRule: [(v) => !!v || 'This field is required'],
      selectRequiredRule: [
        (v) => (v && v.length > 0) || 'At least one option is required',
      ],
      newAction: {
        action_type: 'no action',
        template_id: '',
        status: 'pending',
        message: '',
        button: 'next',
        preview: 'current',
        automate: false,
        required_documents: '',
        uploadable_document: ''
      },
      selectedAction: {
        assigned_users: []
      },
      selectedActionCondition: {
        document_name: ""
      },
      selectedActionIndex: 0,
      showSubSteps: true,
      selectedStep: '',
      subStep: false,
      selectedIndex: null,
      stepCondition: 'Add',
      subStepCondition: 'Add',
      selectedSubIndex: null,
      addProcessValid: false,
      newStepValid: false,
      subStepValid: false,
      selectedProcess: {},
      selectedProcessIndex: 0,
      addProcess: false,
      addNewStep: false,
      addSubStep: false,
      deleteStep: false,
      step_name: '',
      visible_users: [{ key: 'Admins', value: 'isSuperAdmin' }, { key: 'Customer', value: 'isAdmin' }, { key: 'Employee', value: 'isEmployee' }],
      completion_condition: [
        'Sequential',
        'Anytime',
        'Anytime after particular substep',
      ],
      substep_options: ['step01', 'step02'],
      assigned_users: [{ key: 'Admins', value: 'isSuperAdmin' }, { key: 'Customer', value: 'isAdmin' }, { key: 'Employee', value: 'isEmployee' }],
      selected_assigned_users: '',
      substep_actions: ['email', 'sms', 'document', 'fill form', 'document upload', 'no action', 'verify lead client', 'visa process', 'lead onboarding link'],
      substep_status: ['completed', 'progress', 'pending'],
      documents: ['document1'],
      email_templates: ['template'],
      document_templates: [],
      newStep: {
        stage_name: '',
        visibility: [],
        content_visibility: [],
        assigned_users: [],
        complete_condition: '',
        auto_complete: false,
        actions: [],
      },
      newSubStep: {
        step_name: '',
        visibility: [],
        content_visibility: [],
        assigned_users: [],
        complete_condition: '',
        auto_complete: false,
        actions: [],
      },
      modulesOptions: [],
      newProcess: {
        "process_name": "",
        "module": "",
        "stages": []
      },
      processList: [],
      processListBackup: [],
      emailList: [],
      smsList: [],
      documentTypes: [],
      documentTemplates: [],
      formList: [],
    }
  },
  mounted() {
    this.getallemails()
    this.getallsms()
    this.getAllProcess()
    this.getallmodules()
    this.getDocumentTypes()
    this.getAllDocuments()
    this.getAllForms()
    // this.getDocumentTemplates()
  },
  methods: {
    updateAction(action, _selectedActionCondition) {

      if (this.$refs.actionForm.validate()) {

        _selectedActionCondition = JSON.parse(JSON.stringify(_selectedActionCondition));


        // Ensure template_id is set for 'document upload' actions
        // if (action.action_type === 'document upload') {
        //   // If multiple documents can be selected, store the first one as template_id (or all if needed)
        //   if (Array.isArray(action.required_documents) && action.required_documents.length > 0) {
        //     action.template_id = action.required_documents[0];
        //   } else {
        //     action.template_id = action.required_documents || '';
        //   }
        // }

        const _action = {
          ...action,
          condition: _selectedActionCondition,
          assigned_users: action.assigned_users
        };


        this.newStep.actions[this.selectedActionIndex] = _action;


        this.actionPopup = false;
      }
    },
    getTemplateName(action) {
      console.log(action, "---------------------------------------------------->")
      if (action.action_type == 'email') {
        let result = this.emailList.filter(a => a.id == action.template_id)
        return result.length > 0 ? result[0].name : ""
      }
      else if (action.action_type == 'sms') {
        let result = this.smsList.filter(a => a.id == action.template_id)
        return result.length > 0 ? result[0].name : ""
      }
      else if (action.action_type == 'document') {
        let result = this.documentTemplates.filter(a => a.id == action.template_id)
        return result.length > 0 ? result[0].name : ""
      }
      else if (action.action_type == 'document upload') {
        let result = this.documentTypes.filter(a => action.required_documents.includes(a._id))
        return result.length > 0 ? result.map(b => b.name).join(' , ') : ""
      }
      else if (action.action_type == 'invoice creation') {
        let result = this.documentTypes.filter(a => a.id == action.uploadable_document)
        return result.length > 0 ? result[0].name : ""
      }
      else if (action.action_type == 'fill form') {
        let result = this.formList.filter(a => a.id == action.template_id)
        return result.length > 0 ? result[0].name : ""
      }
      else return ""
    },
    getStatusColorTooltip(val) {
      if (val != undefined) {
        if (val.toLowerCase() == 'completed') return '#CAF8E9'
        else if (val.toLowerCase() == 'pending') return '#FFEBEC'
        else if (val.toLowerCase() == 'progress') return '#FFF59D'
        else return '#DCE1E6'
      }
    },
    getTextStyle(val) {
      if (val != undefined) {
        if (val.toLowerCase() == 'completed') return 'color:#0DC98A'
        else if (val.toLowerCase() == 'pending') return 'color:#E5252A'
        else if (val.toLowerCase() == 'progress') return 'color:#F57F17'
        else return 'color:#516A81'
      }
    },
    removeAction(index) {
      this.newStep.actions.splice(index, 1)
    },
    async getAllDocuments() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.post(`/document_template/list/all`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentTemplates = response.data
        })
        .catch(e => console.log(e))
    },
    async getDocumentTypes() {
      console.log("getting document types")
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.get(`/documenttypes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentTypes = response.data
        })
        .catch(e => console.log(e))
    },
    async getAllForms() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.get(`/form/all`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.formList = response.data
        })
        .catch(e => console.log(e))
    },
    async getallemails() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.get(`/email_template/get/all`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.emailList = response.data
        })
        .catch(e => console.log(e))
    },
    async getallsms() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.get(`/sms_template/get/all`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.smsList = response.data
        })
        .catch(e => console.log(e))
    },
    saveProcess() {
      this.editLoading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.patch(`processes/${this.selectedProcess.id}`, this.selectedProcess, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.getAllProcess()
          this.editLoading = false
          this.editStages = false
        })
        .catch(e => console.log(e))

    },
    getallmodules() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.$axios.get(`configuration/modules`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.modulesOptions = response.data.data.modules
        })
        .catch(e => console.log(e))
    },
    async getAllProcess() {
      this.editStages = false
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.get(`/processes`, { headers: { Authorization: AuthStr } })
        .then(async (response) => {
          this.processList = response.data
          this.processListBackup = _.cloneDeep(this.processList)
          this.selectedProcess = this.processList[this.selectedProcessIndex]
          this.processList.push({ "process_name": "Add Process" })
        })
        .catch(e => console.log(e))
    },
    addProcessModal(item) {
      item === 'Add Process'
        ? (this.addProcess = true)
        : (this.addProcess = false)
    },
    addSubStepModal(stepName) {
      this.addSubStep = true
      this.selectedStep = stepName
    },
    closeAll() {
      this.newStep = {
        stage_name: '',
        visibility: [],
        content_visibility: [],
        assigned_users: [],
        complete_condition: '',
        auto_complete: false,
        actions: [],
      }
      this.newSubStep = {
        step_name: '',
        visibility: [],
        content_visibility: [],
        assigned_users: [],
        complete_condition: '',
        auto_complete: false,
        actions: [],
      }
      this.newProcess = {
        "process_name": "",
        "module": "",
        "stages": []
      }
      this.addProcess = false
      this.addNewStep = false
      if (this.$refs && this.$refs.subStepForm) this.$refs.subStepForm.reset()
      // if (this.$refs && this.$refs.newStepForm) this.$refs.newStepForm.reset()
      if (this.$refs && this.$refs.addProcessForm) this.$refs.addProcessForm.reset()
    },
    async handleAddingNewProcess() {
      if (this.$refs.addProcessForm.validate()) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios.post(`/processes`, this.newProcess, { headers: { Authorization: AuthStr } })
          .then(async (response) => {
            this.getAllProcess()
          })
          .catch(e => console.log(e))
        this.closeAll()
      }
    },
    handleAddingNewStep(type) {

      if (this.$refs.newStepForm.validate()) {
        if (type === 'Add') {
          this.selectedProcess.stages.push(this.newStep)
        } else {
          this.selectedProcess.stages[this.selectedIndex] = { ...this.newStep }
        }
        this.closeAll()
        // this.$refs.newStepForm.reset()
      }
    },
    handleAddingNewSubStep(type) {
      if (this.$refs.subStepForm.validate()) {
        if (type === 'Add') {
          // this.$refs.subStepForm.reset()
          const selectedEl = this.selectedProcess.stages.find(
            (el) => el.stage_name === this.selectedStep
          )
          const index = this.selectedProcess.stages.indexOf(selectedEl)
          this.selectedProcess.stages[index].substeps.push(this.newSubStep)
        } else {
          this.selectedProcess.stages[this.selectedIndex].substeps[this.selectedSubIndex] = {
            ...this.newSubStep,
          }
        }
        this.addSubStep = false
      }
    },
    editStep(e, step, i) {
      e.stopPropagation()
      this.newStep = { ...step }
      this.addNewStep = true
      this.stepCondition = 'Edit'
      this.selectedIndex = i
    },
    editSubStep(step, i, index) {
      this.newSubStep = { ...step }
      this.addSubStep = true
      this.subStepCondition = 'Edit'
      this.selectedIndex = index
      this.selectedSubIndex = i
    },
    findIndex(array, key, value) {
      var index = array.findIndex(function (element) {
        return element[key] == value
      });
      return index
    },
    getSelectedProcess(value) {
      this.selectedProcessIndex = this.findIndex(this.processList, 'process_name', value.process_name)
      if (value) {
        value.process_name === 'Add Process'
          ? (this.addProcess = true)
          : (this.addProcess = false)
      }
    },
    duplicateStep(index, e) {
      e.stopPropagation()
      const clonedStep = {
        ...this.selectedProcess.stages[index],
      }
      this.selectedProcess.stages.splice(index + 1, 0, clonedStep)
    },
    handleDeleteStep(e, index) {
      e.stopPropagation()
      this.deleteStep = true
      this.selectedIndex = index
      this.subStep = false
    },
    handleDeleteSubStep(i, index) {
      this.deleteStep = true
      this.selectedSubIndex = i
      this.selectedIndex = index
      this.subStep = true
    },
    handleDelete() {
      if (this.subStep !== true) {
        this.selectedProcess.stages.splice(this.selectedIndex, 1)
      } else {
        this.selectedProcess.stages[this.selectedIndex].substeps.splice(this.selectedSubIndex, 1)
      }
      this.deleteStep = false
    },
  },
}
</script>

<style lang="scss">
.flow-configurator {
  .v-list-item {
    border-bottom: 1px solid #cfd6dc;

    &.active {
      background-color: #f0f8ff;
      border-radius: 18px;
      border: none;

      span {
        font-weight: bold;
      }
    }
  }

  .v-expansion-panels {
    &>div {
      width: 100%;
    }
  }

  .add-process {
    color: #0d5de1;
  }

  .v-expansion-panel-header {
    position: relative;
    min-height: auto !important;
    border-radius: 10px;
    border: 1px solid #bfc8d1;
    background-color: #fff;
    z-index: 3;
  }

  .v-expansion-panel {
    margin: 20px 0;

    &::before {
      box-shadow: none;
      position: absolute;
      height: calc(100% + 40px);
      width: 1px;
      left: 35px;
      z-index: 2;
      background-color: #bfc8d1;
    }

    &::after {
      display: none;
    }

    &:last-of-type {
      &::before {
        height: 100%;
      }
    }
  }

  .step-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    max-width: 24px;
    height: 24px;
    margin-right: 15px;
    background: transparent linear-gradient(314deg, #6488ee 0%, #0918f7 100%) 0% 0% no-repeat padding-box;
    border-radius: 50%;
    color: #fff;
  }

  .substep {
    position: relative;
    margin-left: 50px;
    background-color: #f0f8ff;
    border-radius: 5px;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 0.5px;
      width: 40px;
      left: -40px;
      z-index: 2;
      background-color: #bfc8d1;
    }

    &:last-of-type {
      margin-bottom: 0 !important;
    }

    &.add-substep {
      color: #0d5de1;
      cursor: pointer;
    }
  }

  .icon {
    cursor: pointer;
  }
}

.shadow {
  box-shadow: 0px 3px 6px #0a2c4f0d !important;
}
</style>
