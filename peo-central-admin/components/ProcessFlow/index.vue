<template>
  <v-row class="px-0 py-0">
    <!-- email Dialog -->
    <SendRawMailDialogWithPreview v-if="sendRawEmailPreviewDialog && sendRawEmailPreviewDialog.show && sendRawEmailPreviewDialog.isBackendHtmlEmail" :emailBody="emailBody" @close="closeDialogs" :enrollmentId="emailBody.enrollmentId"
      :automateCurrentAction="automateCurrentAction" :attachments="emailAttachments" :module="module"
      @successfull="actionSuccess" :is-backend-html-email="sendRawEmailPreviewDialog.isBackendHtmlEmail" />
    <SendRawMailDialog v-if="sendRawEmailDialog && sendRawEmailDialog.show && !sendRawEmailDialog.isBackendHtmlEmail" :emailBody="emailBody" @close="closeDialogs" :enrollmentId="emailBody.enrollmentId"
      :automateCurrentAction="automateCurrentAction" :attachments="emailAttachments" :module="module"
      @successfull="actionSuccess" :is-backend-html-email="sendRawEmailDialog.isBackendHtmlEmail" />
    <SendMailDialog v-if="sendEmailDialog" :identifier="currentProcess._id" :foreign_id="processsDetails[0]._id"
      :automateCurrentAction="automateCurrentAction" :emailBody="emailBody" @close="closeDialogs"
      :is-loading="!emailBody.content" @successfull="actionSuccess" />

    <SendSms v-if="sendSmsDialog" :identifier="currentProcess._id" :foreign_id="processsDetails[0]._id"
      :automateCurrentAction="automateCurrentAction" :smsBody="smsBody" @close="closeDialogs"
      @successfull="actionSuccess" />
    <!-- Document Generation -->
    <GenerateDocument v-if="generateDocument" :identifier="currentProcess._id" :foreign_id="processsDetails[0]._id"
      :actionIndex="actionIndex" :processIndex="processIndex" :process="processsDetails[0]" :documentID="documentID"
      @close="closeDialogs" :module="module" @successfull="actionSuccess" :current_action="currentAction"
      :user_id="selectedEmployee.user_id" />

    <!-- Fill Form -->
    <FillForm v-if="fillForm" :foreign_id="selectedEmployee._id" :module="module" :formID="formID" @close="closeDialogs"
      @successfull="actionSuccess" />

    <!-- Upload Documents -->
    <UploadDocuments v-if="uploadDocuments" :uploadDocuments="uploadDocuments" :requiredDocuments="requiredDocuments"
      :module="module" :identifier="currentidentifier" :foreign_id="selectedEmployee._id" @close="handleDocumentUploadClose"
      @successfull="handleDocumentUploadCompletion" @update:uploadDocuments="handleUploadDocumentsUpdate" :key="'upload-docs-' + documentUploadModalKey"
      :isProposalStage="isProposalStage" :isServiceAgreementStage="isServiceAgreementStage" :customInfo="isProposalStage ? proposalStageInfo : isServiceAgreementStage ? serviceAgreementStageInfo : ''" :requiredSignedProposal="isProposalStage || isServiceAgreementStage" />

    <!-- Update Another Module -->
    <UpdateModule v-if="updateModule" :updateModuleData="updateModuleData" :module="module"
      :identifier="currentidentifier" :foreign_id="selectedEmployee._id" @successfull="actionSuccess" />

    <!-- Create invoice -->
    <CreateInvoice v-if="createInvoice" :invoiceElements="invoice" :module="module" :identifier="currentidentifier"
      :actionIndex="actionIndex" :processIndex="processIndex" :process="processsDetails[0]"
      :foreign_id="selectedEmployee._id" :selectedEmployee="selectedEmployee" @successfull="actionSuccess"
      @close="closeDialogs" />

    <!-- Record Payment -->
    <RecordPayment v-if="recordPayment" :currentPreviewAction="currentPreviewAction" :module="module"
      :identifier="currentidentifier" :foreign_id="selectedEmployee._id" @successfull="actionSuccess"
      @close="closeDialogs" />

    <!-- Create Visa Process -->
    <VisaProcess v-if="createVisaProcess" :module="module" :process_type="visaProcessType"
      :identifier="currentidentifier" :foreign_id="selectedEmployee._id" @successfull="actionSuccess"
      @close="closeDialogs" />

    <!-- Process Flow -->
    <v-col cols="12" v-if="ShowDetails">
      <v-card class="no-border_shadow" color="card_bg" id="card">
        <v-card-title id="card-title">
          <v-spacer></v-spacer>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon small color="red" @click="handleCancelApplication" class="ml-5" v-on="on">fa-trash</v-icon>
            </template>
            <span color="red">Withdraw Application</span><br />
          </v-tooltip>
        </v-card-title>
        <div class="timeline_wrapper px-6" v-if="ShowDetails && processsDetails && processsDetails[0].processes">
          <div class="timeline d-flex" dense>
            <div class="item" @click="openAttachments(item)" v-for="(item, index) in processsDetails[0].processes.filter(
              (a) => {
                return (
                  a.visibility &&
                  a.visibility.includes($store.getters.getThisUserRole)
                )
              }
            )" :class="item.process_status == 'progress'
              ? 'processing'
              : item.process_status == 'completed'
                ? 'active'
                : ''
              " :key="index">
              <div class="icon d-flex align-center justify-center+">
                <checkBoxSvg v-if="item.process_status == 'completed'" style="background-color: #0a94ff" />
              </div>
              <span>{{ item.stage_name }}</span>
              <span>{{
                item.completed_date ? getTime(item.completed_date) : ''
              }}</span>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" v-else>
      <v-card color="card_bg" class="d-flex align-center no-border_shadow" id="card" height="100px">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-card>
    </v-col>

    <!-- Process Flow buttons -->
    <v-col cols="12" v-if="ShowDetails">
      <v-card class="no-border_shadow" color="card_bg" id="card" @click="confirm" v-if="
        processsDetails &&
        processsDetails[0].processes &&
        currentAction &&
        Object.keys(currentAction).length != 0
      ">
        <v-row v-if="currentAction && currentAction != {}">
          <v-col cols="8" class="d-flex align-center" v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)">
            <h6 v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)" style="color: #000000 !important">
              {{ currentAction.message }}
            </h6>
          </v-col>
          <v-col cols="4" class="d-flex align-center" style="justify-content: right"
            v-if="['isSuperAdmin'].includes($store.getters.getThisUserRole)">
            <!-- Email Icon for Proposal Sent and later stages -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn v-if="
                  shouldShowEmailIcon()
                " class="tall__btn mr-4 primary--text" outlined
                  @click="handleEmailIconClick()"
                  :class="{ 'tw-cursor-not-allowed': emailIconLoading }"
                  :disabled="emailIconLoading"
                  v-on="on">
                  <v-icon v-if="!emailIconLoading">mdi-link-variant</v-icon>
                  <v-progress-circular v-else indeterminate size="20" color="primary"></v-progress-circular>
                </v-btn>
              </template>
              <span>Send Registration Link</span>
            </v-tooltip>
            <!-- Reject button for stages before Proposal Sent -->
            <v-btn v-if="
              currentAction.reject_button && currentAction.reject_button != '' && !shouldShowEmailIcon()
            " class="tall__btn mr-4 primary--text" outlined @click="unsuccessfulDialog = true">
              <span> {{ currentAction.reject_button }} </span>
            </v-btn>
            <v-btn v-if="
              currentAction.previous_button &&
              currentAction.previous_button != ''
            " class="tall__btn mr-4 primary--text" outlined @click="moveBackward(processsDetails[0]._id)">
              <span> {{ currentAction.previous_button }} </span>
            </v-btn>
            <v-btn v-if="
              currentAction.button &&
              currentAction.status == 'progress' &&
              currentAction.button != ''
            " class="tall__btn" color="primary" @click="
              handleProcessParams(currentAction, processsDetails[0]._id)
              ">
              <span> {{ currentAction.button }} </span>
            </v-btn>
          </v-col>
          <v-col cols="12" class="d-flex align-center" v-else>
            <h6 v-if="module == 'onboardings'" style="color: #000000 !important">
              The process for obtaining the Employment Visa and Work Permit will
              commence soon.
            </h6>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="12" v-else>
      <v-card class="d-flex align-center no-border_shadow" color="card_bg" id="card" height="100px">
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-card>
    </v-col>

    <!-- Process Details Swtich-->
    <v-col cols="10" v-if="currentPreview" style="display: flex; justify-content: end" class="ma-0 pa-0">
    </v-col>

    <template v-if="module == 'leads'">
      <v-col cols="2" v-if="currentPreview" style="display: flex; justify-content: end" class="ma-0 pa-0">
        <v-switch v-model="processDetailsFlag" hide-details inset :label="`Details`"></v-switch>
      </v-col>
    </template>
    <!-- <v-col cols="4" style="display: flex; justify-content: end;" class="ma-0 pa-0">
      <v-switch @change="handleCancelApplication" v-model="ApplicationFlag" hide-details inset :label="`Cancel Application`"></v-switch>
    </v-col> -->
    <template v-if="module == 'leads'">
      <div style="width: 100%" v-if="selectedEmployee">
        <ProcessDetails @onCompanyIds="handleCompanyIds($event)" :process_id="selectedEmployee._id"
          :key="currentProcess?.id" :module="module">
          <ActionPreview :action="currentPreviewAction" :module="module" :identifier="currentidentifier"
            :foreign_id="selectedEmployee._id" :actionIndex="actionIndex" :processIndex="processIndex" :currentProcess="currentProcess" @successfull="actionSuccess" />
        </ProcessDetails>
      </div>
    </template>

    <template v-else>
      <div style="width: 100%" v-if="!processDetailsFlag && currentPreview">
        <ActionPreview :action="currentPreviewAction" :module="module" :identifier="currentidentifier"
          :foreign_id="selectedEmployee._id" :actionIndex="actionIndex" :processIndex="processIndex" :currentProcess="currentProcess" @successfull="actionSuccess" />
      </div>
      <template v-else>
        <div style="width: 100%" v-if="selectedEmployee">
          <ProcessDetails @onCompanyIds="handleCompanyIds($event)" :process_id="selectedEmployee._id"
            :key="this.updateKey" :module="module" />
        </div>
      </template>
    </template>

    <!-- Unsuccessful Dialog -->
    <v-dialog id="custom_dialog" v-model="unsuccessfulDialog" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title" class="mb-5">
          <h4 class="text--text">Reason for Cancellation</h4>
          <v-icon small color="subtext" class="ml-5" @click="
            unsuccessfulDialog = false
          ShowDetails = true
            ">fa-close</v-icon>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <v-row class="pb-0">
            <v-col cols="12" class="pl-0 py-0">
              <v-radio-group class="dialog_radioButton" v-model="reason_for_unsuccessful" v-if="module == 'leads'">
                <v-radio class="pb-6" label="Price Too High" value="Price Too High"></v-radio>
                <v-radio class="pb-6" label="Just Wanted To Enquire" value="Just Wanted To Enquire"></v-radio>
                <v-radio class="pb-6" label="Unqualified Process" value="Unqualified Process"></v-radio>
                <v-radio class="pb-6" label="Not Registered Company" value="Not Registered Company"></v-radio>
                <div class="d-flex align-center">
                  <v-radio class="pb-6" label="Other" value="Other"></v-radio>
                  <template>
                    <v-text-field v-if="reason_for_unsuccessful === 'Other'" v-model="otherReason" solo dense
                      placeholder="Enter Reason" class="unsuccessfulDialog_date_field mx-3">
                    </v-text-field>
                  </template>
                </div>
              </v-radio-group>
              <v-textarea v-else v-model="reason_for_unsuccessful" filled dense placeholder="Enter Reason"
                label="Enter Cancellation Reason">
              </v-textarea>
            </v-col>

            <v-col cols="12" class="ma-0 pa-0">
              <v-btn style="width: 100% !important" class="unsuccessful_btn_dialog" color="primary"
                @click="create_offboarding()">Submit</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>

    <DialogsCreateOffboarding @close="handleOffboardingClose" :open="offboardingDialog"
      :reason_for_unsuccessful="reason_for_unsuccessful" :selectedRenewal="selectedEmployee" />

    <v-dialog id="custom_dialog" v-model="rejectApplication" persistent max-width="500px">
      <v-card id="card" style="padding: 20px 30px !important">
        <v-card-title id="card-title">
          <h4 class="text--text mb-2">Reason for Withdrawing</h4>
          <v-icon small color="subtext" class="ml-5" @click="rejectApplication = false">fa-close</v-icon>
        </v-card-title>
        <v-container class="ma-0 pa-0">
          <v-row class="pb-0">
            <v-col cols="12" class="pl-0 py-0">
              <div class="d-flex align-center">
                <template>
                  <v-text-field v-model="RejectReason" solo dense placeholder="Enter Reason"
                    class="unsuccessfulDialog_date_field mx-3">
                  </v-text-field>
                </template>
              </div>
            </v-col>

            <v-col cols="12" class="ma-0 pa-0">
              <v-btn style="width: 100% !important" class="unsuccessful_btn_dialog" color="primary"
                @click="handleRejectApplication()">Submit</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-if="module != 'leads'" v-model="attachmentsDialog" persistent max-width="80vh">
      <v-card>
        <v-card-title dark color="primary">
          <h4 class="text--text">
            {{
              newDocument
                ? `Attach Documents - ${selectedStage.stage_name}`
                : `Documents
            -${selectedStage.stage_name}`
            }}
          </h4>
          <v-spacer></v-spacer>
          <v-icon small color="subtext" class="ml-5" @click="attachmentsDialog = false">fa-close</v-icon>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-actions>
          <div class="d-flex" style="width: 100%">
            <v-btn class="short__btn" color="primary" v-if="newDocument" @click="newDocument = false">Cancel</v-btn>
            <v-btn class="short__btn" color="primary" v-else @click="newDocument = true">New</v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="userInsuranceDetails" class="short__btn" color="red white--text"
              @click="cancelInsuranceRequest = true">
              Cancel insurance
              <v-icon class="ml-2" small>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-actions>
        <v-card-text v-if="newDocument">
          <!-- {{ documentObj }} -->
          <v-form ref="edit_category">
            <v-row class="pt-2 scrollDark" :style="$vuetify.breakpoint.md || $vuetify.breakpoint.lg
              ? 'max-height:300px'
              : 'max-height:460px'
              ">
              <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="6" xl="6">
                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                  Document Type
                </p>
                <v-autocomplete :items="documentTypesList" placeholder="Select Type" item-text="name" item-value="id"
                  solo dense v-model="documentObj.type" class="proposalDialog_date_field2" append-icon="fa-chevron-down"
                  :rules="main_rule"></v-autocomplete>
              </v-col>
              <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="6" xl="6">
                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">
                  Select Document Status
                </p>
                <v-select :items="documentStatusList" placeholder="Select Document Status" solo dense
                  class="proposalDialog_date_field2" v-model="documentObj.doc_status" :rules="main_rule"
                  append-icon="fa-chevron-down"></v-select>
              </v-col>
              <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="12" xl="12">
                <p class="mb-1 font-weight-medium textFontSize grey-heading-text">
                  Upload Document
                </p>
                <v-row>
                  <v-col cols="auto" class="pa-0">
                    <div class="pt-2" v-if="!uploadFile">
                      <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true"
                        @dragleave="dragging = false">
                        <div class="dropZone-info" @drag="onUploadFile">
                          <!-- <span class="fa fa-cloud-upload dropZone-title"></span> -->
                          <span class="dropZone-title">Drop file or click to upload</span>
                          <div class="dropZone-upload-limit-info">
                            <div>maximum file size: 10 MB</div>
                          </div>
                        </div>
                        <input type="file" @change="onUploadFile" />
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
                  <v-col auto align-self="center">
                    <span v-for="(items, i) in filename_attach" :key="i" class="mx-2">
                      <v-btn color="#F9A825" small class="rounded-xl" outlined>
                        <v-icon small>mdi-file-document-outline</v-icon>{{ items }}
                      </v-btn>
                      <v-icon small color="red" style="margin-left: -10px; margin-top: -20px"
                        @click="deleteDocument(i)">fa-sharp fa-regular fa-circle-xmark</v-icon>
                    </span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="py-0 px-0 text-right" cols="12" sm="12" md="12" xl="12">
                <v-btn elevation="0" width="150px" color="#0064D7" @click="updatedProcess()" v-if="!loading"
                  class="white--text border-radius-medium">Add</v-btn>
                <img src="/animated/refresh.svg" max-width="40" height="40" v-else />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-text v-else>
          <div class="ml-6" v-if="documentsLoading">
            <v-img src="/animated/refresh.svg" max-width="28" height="28" class="mr-2" contain></v-img>
          </div>
          <v-data-table id="coa_table" :search="search" class="main__table elevation-0 document_table"
            :headers="employee_documents_headers" :items="selectedAttachments" v-else>
            <template v-slot:item="{ item }">
              <tr class="table_row">
                <td class="" @click="openDocument(item.url)">
                  <v-icon :color="item.url == '' ? 'grey' : 'red'" small>fa-file</v-icon>
                </td>
                <td class="" @click="openDocument(item.url)">
                  {{ getDocumentType(item.type) }}
                </td>
                <td class="" @click="openDocument(item.url)">
                  {{ item.document_number }}
                </td>
                <td class="" @click="openDocument(item.url)">
                  {{ item.issuance_date | formatDateWithoutTime }}
                </td>
                <td class="" @click="openDocument(item.url)">
                  {{ item.expiry_date | formatDateWithoutTime }}
                </td>
                <td class="pa-0 ma-0 pl-3">
                  <div class="">
                    <span class="table_btn light_accent4 accent4--text" v-if="item.status == 'valid'">{{ item.status
                    }}</span>
                    <span class="table_btn light_accent3 accent3--text" v-if="item.status == 'Soon Expiring'">{{
                      item.status }}</span>
                    <span class="table_btn light_accent2 accent2--text" v-if="
                      item.status == 'Expired' || item.status == 'expired'
                    ">{{ item.status }}</span>
                  </div>
                </td>
                <td class="">
                  <div class="d-flex align-center justify-space-between">
                    <span class="">
                      <v-tooltip top color="red">
                        <template v-slot:activator="{ on, attrs }">
                          <DeleteSvg v-bind="attrs" v-on="on" @click="deleteDocumentAttachment(item)" />
                        </template>
                        Delete
                      </v-tooltip>
                    </span>

                    <span class="">
                      <v-tooltip top color="grey">
                        <template v-slot:activator="{ on, attrs }">
                          <DownloadSvg v-bind="attrs" v-on="on" @click="initiateDownload(item.url)" />
                        </template>
                        Download
                      </v-tooltip>
                    </span>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!---Delete Document-->
    <v-dialog v-model="deleteDialog" transition="dialog-top-transition" max-width="600">
      <v-card>
        <v-card-title color="grey lighten-2" class="font-weight-bold">
          Are you sure you want to delete this {{ selectedItem.type }}?
        </v-card-title>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn text color="blue" class="body-2 font-weight-bold" outlined dark
            @click="deleteDocumentConfirm()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar">
      {{ SnackBarMessage }}

      <template v-slot:actions>
        <v-btn color="pink" variant="text" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Snack -->
    <v-snackbar v-model="snackOptions.isVisible" :timeout="3000" :color="snackOptions.color">
      {{ snackOptions.text }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snackOptions.isVisible = false" small><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>

    <!-- Cancel insurance -->
    <v-dialog v-model="cancelInsuranceRequest" max-width="720" max-height="350px" style="overflow-x: hidden">
      <!-- [TODO] get employee details as a prop -->
      <InsuranceCancellation :employee="selectedEmployee" :principal_type="'Principal'"
        :parent_company_id="parent_company_id" :parent_company="parent_company"
        :userInsuranceDetails="userInsuranceDetails" @close="closeInsuranceCancellation" />
    </v-dialog>

    <!-- handle tasks -->
    <DialogsLeadsAddTask v-if="addTask" @close="addTask = false" @reload="() => { }" :lead-details="leadsDetails[0]"
      :next="true" :open="addTask" @moveNext="handleNextAfterTask" @task-created="handleTaskCreated" />

    <!-- enrollments panel -->
    <EnrollmentDetailsDialog v-if="enrollmentDetailsDialog" v-model="enrollmentDetailsDialog" :enrollment="enrollment"
      @close="handleEnrollmentModalClose" @enable-editing="enableEditing" @visit-link="visitLink" :module="module"
      :loading="loading_enrollment" @verify-enrollment="handleEnrollmentVerification" />

    <!-- snackbar -->
    <SnackBar :data="snackbar_data" />

    <!-- Pipeline Completion Modal -->
    <CommonModal
      :open="showCompletionModal"
      title="Congratulations! 🎉"
      message="Congratulations on closing a new client! You or your client can now proceed ahead with onboarding new employees."
      confirm-text="Continue"
      cancel-text="Close"
      type="success"
      @confirm="handleCompletionModalConfirm"
      @cancel="handleCompletionModalCancel"
    />
  </v-row>
</template>

<script>
import '@/assets/scss/utils/_processTimeLine.scss'

import '@/assets/scss/utils/_customerDocumentsTable.scss'
import PdfSvg from '@/assets/images/icons/pdf.svg'
import DeleteSvg from '@/assets/images/icons/delete-icon.svg'
import UploadSvg from '@/assets/images/icons/upload-icon.svg'
import DownloadSvg from '@/assets/images/icons/download-icon.svg'

import SendMailDialog from './SendEmail'
import UploadDocuments from './UploadDocuments'
import GenerateDocument from './GenerateDocument'
import UpdateModule from './UpdateModule'
import ProcessDetails from './ProcessDetails'
import CreateInvoice from './CreateInvoice'
import RecordPayment from './RecordPayment'
import VisaProcess from './CreateVisaProcess'
import ActionPreview from './ActionPreview'
import FillForm from './FillForm'

import InfoSVG from '@/assets/images/Customer/info.svg'
import checkBoxSvg from '@/assets/images/icons/check-box.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import SendRawMailDialog from '@/components/ProcessFlow/SendEmail/sendRawEmail.vue'
import SendRawMailDialogWithPreview from '@/components/ProcessFlow/SendEmail/SendRawEmailWithPreview.vue'
import SendSms from '@/components/ProcessFlow/SendSms/'
import moment from 'moment'
import InsuranceCancellation from '@/components/Insurance/insuranceCancellation.vue'
import EnrollmentDetailsDialog from '~/components/Dialogs/EnrollmentDetailsDialog.vue'
import SnackBar from '~/components/utils/SnackBar.vue'
import CommonModal from '~/components/Common/CommonModal.vue'

export default {
  components: {
    PdfSvg,
    DeleteSvg,
    UploadSvg,
    DownloadSvg,
    checkBoxSvg,
    UpdateModule,
    InfoSVG,
    CustomInputContainer,
    ProcessDetails,
    FillForm,
    SendMailDialog,
    GenerateDocument,
    UploadDocuments,
    CreateInvoice,
    RecordPayment,
    VisaProcess,
    ActionPreview,
    SendRawMailDialog,
    SendRawMailDialogWithPreview,
    SendSms,
    InsuranceCancellation,
    EnrollmentDetailsDialog,
    SnackBar,
    CommonModal,
  },
  props: {
    module: String,
    selectedEmployee: {},
  },
  data() {
    return {
      snackbar: false,
      SnackBarMessage: '',
      main_rule: [(v) => !!v || 'This filed is required'],
      search: '',
      newDocument: false,
      attachmentsDialog: false,
      selectedStage: {},
      documentsLoading: true,
      processDetailsFlag: true,
      currentidentifier: '',
      currentforeign_id: '',
      generateDocument: false,
      fillForm: false,
      uploadDocuments: false,
      sendEmailDialog: false,
      sendRawEmailDialog: false,
      sendRawEmailPreviewDialog: false,
      updateModule: false,
      createInvoice: false,
      recordPayment: false,
      createVisaProcess: false,
      processParams: [],
      leadsDetails: {},
      addTask: false,
      visaProcessType: '',
      formID: '',
      updateModuleData: {},
      invoice: {},
      documentID: '',
      requiredDocuments: [],
      currentAction: {},
      nextAction: {},
      currentPreviewAction: {},
      currentPreviewActionIndex: 0,
      currentPreviewProcessIndex: 0,
      currentPreview: false,
      currentProcess: {},
      unsuccessfulDialog: false,
      declinedDialog: false,
      processsDetails: [],
      ShowDetails: false,
      reason_for_unsuccessful: '',
      otherReason: '',
      emailBody: {},
      selectedAttachments: [],
      emailAttachments: [],
      documentTypesList: [],
      updateKey: 1100,
      documentObj: {
        documents: [],
        type: '',
        identifier: '',
        foreign_id: '',
        doc_status: '',
        expiry: '',
        module: this.module,
      },
      documentStatusList: [],
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      loading: false,
      attachFiles: {
        uploadDoc: {},
        ecard: {},
      },

      deleteDialog: false,
      selectedItem: {},
      employee_documents_headers: [
        { text: 'Document', value: 'icon', align: 'center' },
        { text: 'Type', value: 'type', align: 'start' },
        { text: 'Document Number', value: 'document_number', align: 'start' },
        { text: 'issuance Date', value: 'issuance_date', align: 'start' },
        { text: 'Expiry Date', value: 'expiry_date', align: 'start' },
        { text: 'Expiry Status', value: 'status', align: 'start' },
        { text: 'Action', value: 'action', align: 'start' },
      ],
      processIndex: 0,
      actionIndex: 0,
      automateCurrentAction: false,
      smsBody: {},
      sendSmsDialog: false,
      ApplicationFlag: false,
      rejectApplication: false,
      RejectReason: '',
      ProcessValidation: true,
      previousAction: {},
      userInsuranceDetails: null,
      parent_company: '',
      parent_company_id: '',
      cancelInsuranceRequest: false,
      offboardingDialog: false,
      snackOptions: {
        color: '',
        isVisible: false,
        text: '',
      },
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      // handle enrollments
      loading_enrollment: false,
      enrollmentDetailsDialog: false,
      enrollment: {},
      showCompletionModal: false,
      completionModalManuallyClosed: false, // Track if completion modal was manually closed
      taskCreationStatus: {}, // Track which actions have tasks created
      emailIconLoading: false, // Track email icon loading state
      emailSentFromLinkIcon: false, // Track if email was sent from link icon
      emailActuallySent: false, // Track if email was actually sent (not just dialog opened)
      isDocumentUploadInProgress: false, // Track if document upload is in progress
      documentUploadModalKey: 0, // Unique key for document upload modal
              documentUploadLock: false, // Global lock to prevent any interference during document upload
        taskCompletionInProgress: false, // Track when task completion is being processed

        proposalStageInfo: 'You will only be able to complete this step when a Signed Proposal is uploaded. Please ensure you have the signed proposal from the client before proceeding.', // Custom information for Proposal stage
        serviceAgreementStageInfo: 'You will only be able to complete this step when a Signed Service Agreement is uploaded. Please ensure you have the signed service agreement from the client before proceeding.', // Custom information for Service Agreement stage
    }
  },
  mounted() {
    this.getDocumentsTypeList()
    this.getProcesssDetails(this.selectedEmployee?._id, true)
    this.getDocumentStatusList()
    if (this.module == 'leads') {
      this.getLeadDetails(this.selectedEmployee?._id)
    }

    this.handleProcessDetailsReload()
  },
  watch: {
    ShowDetails(val) {
      this.updateKey += 1
    },
    // Prevent document upload modal from being closed automatically
    uploadDocuments(val) {
      if ((this.isDocumentUploadInProgress || this.documentUploadLock) && !val) {
        console.log('Preventing automatic closing of document upload modal');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('documentUploadLock:', this.documentUploadLock);
        this.$nextTick(() => {
          this.uploadDocuments = true;
        });
      }
    },
    // Additional watcher to ensure modal stays open during upload
    isDocumentUploadInProgress(val) {
      if (val && !this.uploadDocuments) {
        console.log('Document upload in progress but modal not open - forcing modal open');
        this.$nextTick(() => {
          this.uploadDocuments = true;
        });
      }
    },
    // Watcher for document upload lock
    documentUploadLock(val) {
      if (val && !this.uploadDocuments) {
        console.log('Document upload lock activated but modal not open - forcing modal open');
        this.$nextTick(() => {
          this.uploadDocuments = true;
        });
      }
    },
    // Debug watcher for uploadDocuments
    uploadDocuments: {
      handler(newVal, oldVal) {
        console.log('uploadDocuments changed from', oldVal, 'to', newVal);
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('Stack trace:', new Error().stack);
      },
      immediate: true
    }
  },
  beforeDestroy(){
    this.$nuxt.$off('reload-process-details')
  },
  methods: {
    handleProcessDetailsReload(){
      console.log('setting up listener for updates')
      this.$nuxt.$on('reload-process-details', async () => {
        console.log('received emittance')

        // Prevent process details reload if document upload is in progress
        if (this.isDocumentUploadActive()) {
          console.log('Preventing process details reload during document upload');
          console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
          console.log('uploadDocuments:', this.uploadDocuments);
          console.log('documentUploadLock:', this.documentUploadLock);
          return;
        }

        // Add a small delay to ensure task creation is complete
        setTimeout(async () => {
          console.log('Reloading process details after delay');
          await this.getProcesssDetails(this.selectedEmployee._id)
        }, 100);
      })
    },
    getTime(time) {
      return moment(time).format('DD-MM-YYYY')
    },
    async enableEditing(id) {
      try {
        this.enrollment.is_editable = true
        const response = await this.$axios.put(`/enrollments/${id}`, {
          is_editable: true,
        })
        this.snackbar_data = {
          snackbar: true,
          text: 'Editing enabled successfully',
          color: 'success',
        }
      } catch (error) {
        console.log(error)
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to enable editing',
          color: 'error',
        }
      }
    },
    visitLink(id) {
      window.open(`enrollment-form?id=${id}`, '_blank')
    },
    async handleEnrollmentVerification(id) {
      console.log('=== ENROLLMENT VERIFICATION TRIGGERED ===');
      console.log('handleEnrollmentVerification called for enrollment:', id);
      console.log('Current action type:', this.currentAction?.action_type);
      console.log('Enrollment status:', this.enrollment?.status);
      console.log('Selected employee ID:', this.selectedEmployee._id);

      // For "verify lead client" action, handle verification and move forward directly
      // if (this.currentAction && this.currentAction.action_type === 'verify lead client') {
      //   console.log('=== HANDLING VERIFY LEAD CLIENT ACTION ===');

      //   // Verify the enrollment if it's in Processing status
      //   if (this.enrollment?.status == 'Processing') {
      //     console.log('Enrollment status is Processing - calling verify method');
      //     await this.verify(id)
      //     console.log('Enrollment verification completed');
      //   } else {
      //     console.log('Enrollment status is not Processing, skipping verification');
      //   }

      //   // Move the process forward to the next stage
      //   console.log('Moving process forward to next stage');
      //   const AuthStr = 'Bearer '.concat(this.$store.state.token)
      //   await this.$axios.$post(
      //     `/generic/process/flow/forward`,
      //     { id: this.selectedEmployee._id, module: this.module },
      //     { headers: { Authorization: AuthStr } }
      //   )
      //   console.log('Process forward API call completed');

      //   // Refresh process details to show updated state
      //   console.log('Refreshing process details');
      //   await this.getProcesssDetails(this.selectedEmployee._id);
      //   console.log('Process details refreshed');

      //   // Close the enrollment dialog
      //   console.log('Closing enrollment dialog');
      //   this.enrollmentDetailsDialog = false;

      //   // Automatically trigger the next action after verify lead client completion
      //   // Use a small delay to ensure process details are fully updated
      //   console.log('Setting up automatic next action trigger');
      //   setTimeout(async () => {
      //     if (this.currentAction && this.currentAction.action_type) {
      //       console.log('Automatically triggering next action after verify lead client:', this.currentAction.action_type);
      //       console.log('Current action details:', this.currentAction);

      //       // Trigger the next action with current parameters
      //       await this.tiggerAction(this.currentAction, this.selectedEmployee._id);
      //     } else {
      //       console.log('No current action found after verify lead client completion');
      //     }
      //   }, 200);

      //   console.log('=== VERIFY LEAD CLIENT ACTION COMPLETED ===');
      //   return;
      // }

      // For other enrollment verification actions, use the original flow
      console.log('=== HANDLING REGULAR ENROLLMENT VERIFICATION ===');
      if (this.enrollment?.status == 'Processing') {
        console.log('Enrollment status is Processing - calling verify method');
        await this.verify(id)
        console.log('Enrollment verification completed');
      } else {
        console.log('Enrollment status is not Processing, skipping verification');
      }

      console.log('Moving process forward to next stage');
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(
        `/generic/process/flow/forward`,
        { id: this.selectedEmployee._id, module: this.module },
        { headers: { Authorization: AuthStr } }
      )

      console.log('Calling actionSuccess for regular enrollment verification');
      await this.actionSuccess()
      console.log('=== REGULAR ENROLLMENT VERIFICATION COMPLETED ===');
    },
    async verify(id) {
      try {
        const response = await this.$axios.put(`/enrollments/verify/${id}`)
        this.snackbar_data = {
          snackbar: true,
          text: 'Enrollment verified successfully',
          color: 'success',
        }
        // await this.getEnrollments()
      } catch (error) {
        console.log(error)
        this.snackbar_data = {
          snackbar: true,
          text: 'Failed to verify enrollment',
          color: 'error',
        }
      }
    },
    async getLeadDetails(id) {
      await this.$axios
        .$post('/leads/details/leadsid', { leads_id: id })
        .then((response) => {
          this.leadsDetails = response || []
        })
    },
        async handleNextAfterTask() {
      this.taskCompletionInProgress = true;
      console.log('handleNextAfterTask called - task creation completed');
      console.log('Current process stage:', this.currentProcess?.stage_name);
      console.log('Current action:', this.currentAction);

      try {
        // Since the task creation component already moved the pipeline forward,
        // we should refresh the process details to get the updated state
        await this.getProcesssDetails(this.selectedEmployee._id);

        console.log('Process details refreshed after task creation');

        // Check if the next action is one that should wait for manual triggering
        const shouldWaitForManualTrigger = this.currentAction &&
          (this.currentAction.action_type === 'document upload' ||
           this.currentAction.action_type === 'verify lead client' ||
           this.currentAction.action_type === 'lead onboarding link');

        if (shouldWaitForManualTrigger) {
          console.log('Next action requires manual triggering:', this.currentAction.action_type);
          console.log('Skipping automatic action trigger - user will click the action button manually');
          this.taskCompletionInProgress = false;
          return;
        }

        // For all other action types, proceed with automatic triggering
        // Use a small delay to ensure process details are fully updated
        setTimeout(async () => {
          try {
            if (this.currentAction && this.currentAction.action_type) {
              console.log('Triggering next action after task creation:', this.currentAction.action_type);
              console.log('Current action details:', this.currentAction);

              // Trigger the action with current parameters (not stale ones)
              await this.tiggerAction(this.currentAction, this.selectedEmployee._id);
            } else {
              console.log('No current action found after task creation');
            }
          } catch (error) {
            console.error('Error triggering action after task creation:', error);
          } finally {
            // Reset the flag after processing
            this.taskCompletionInProgress = false;
          }
        }, 200); // Small delay to ensure process details are updated

      } catch (error) {
        console.error('Error in handleNextAfterTask:', error);
        this.taskCompletionInProgress = false;
      }
    },
    async handleProcessParams(a, b) {
      console.log('handleProcessParams called with:', { action: a, processId: b });
      console.log('Current stage:', this.currentProcess?.stage_name);
      console.log('Action index:', this.actionIndex);

      if (this.module == 'leads') {
        // Only show task modal for the first action in the current process
        const isFirstAction = this.actionIndex === 0;
        console.log('Is first action:', isFirstAction);

        // Skip task creation for verify lead client actions
        if (a.action_type === 'verify lead client') {
          console.log('Verify lead client action detected - skipping task creation and proceeding directly');
          await this.tiggerAction(a, b);
          return;
        }

        // Skip task creation for lead onboarding link actions
        if (a.action_type === 'lead onboarding link') {
          console.log('Lead onboarding link action detected - skipping task creation and proceeding directly');
          await this.tiggerAction(a, b);
          return;
        }

        // Skip task creation for Proposal Sent stage (document upload actions)
        if (this.currentProcess?.stage_name === 'Proposal Sent' && a.action_type === 'document upload') {
          console.log('Proposal Sent stage detected - skipping task creation and proceeding directly');
          await this.tiggerAction(a, b);
          return;
        }

        // Skip task creation for Service Agreement stage (document upload actions)
        if (this.currentProcess?.stage_name === 'Service Agreement' && a.action_type === 'document upload') {
          console.log('Service Agreement stage detected - skipping task creation and proceeding directly');
          await this.tiggerAction(a, b);
          return;
        }

        if (isFirstAction) {
          // Check database for existing tasks instead of relying on session state
          try {
            const response = await this.$axios.post('/tasks', {
              leadId: this.selectedEmployee._id,
              processId: this.currentProcess._id,
              processName: this.currentProcess.stage_name
            });

            const hasExistingTask = response.data.results && response.data.results.length > 0;
            console.log('Has existing task:', hasExistingTask);

            if (!hasExistingTask) {
              console.log('No existing task found - showing task modal');
              this.processParams = [a, b]
              this.addTask = true
            } else {
              console.log('Existing task found - proceeding directly with action');
              // Skip task creation and proceed directly with the action
              await this.tiggerAction(a, b)
            }
          } catch (error) {
            console.error('Error checking existing tasks:', error);
            // Fallback to proceeding with action if task check fails
            await this.tiggerAction(a, b)
          }
        } else {
          console.log('Not first action - proceeding directly with action');
          // Skip task creation and proceed directly with the action
          await this.tiggerAction(a, b)
        }
      } else {
        console.log('Not leads module - proceeding directly with action');
        await this.tiggerAction(a, b)
      }
    },
    handleOffboardingClose() {
      this.offboardingDialog = false
      this.unsuccessfulDialog = false
      this.reason_for_unsuccessful = ''
      this.getProcesssDetails(this.selectedEmployee._id)
    },
    handleCancelApplication() {
      // if (this.ApplicationFlag) {
      this.rejectApplication = true
      // }
    },
    async handleRejectApplication() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `/generic/process/application-reject`,
          {
            reason_for_unsuccessful: this.RejectReason,
            id: this.selectedEmployee._id,
            module: this.module,
          },
          { headers: { Authorization: AuthStr } }
        )
        .then((res) => {
          this.$emit('reload', true)
        })
      this.rejectApplication = false
      this.RejectReason = ''
    },
    async actionSuccess() {
      console.log('[+] - handle success - handle success')
      console.log('Current action type:', this.currentAction?.action_type)
      console.log('Document upload in progress:', this.isDocumentUploadInProgress)
      console.log('Upload documents modal open:', this.uploadDocuments)
      console.log('Email sent from link icon:', this.emailSentFromLinkIcon)
      console.log('Stack trace:', new Error().stack)

      // SPECIAL CASE: Allow email actions to proceed even during document upload
      // This is needed when sending email from the link icon
      const isEmailAction = this.isEmailAction();

      // CRITICAL: Prevent actionSuccess from being called for document upload actions
      // UNLESS it's an email action from the link icon
      if (this.currentAction?.action_type === 'document upload' && !isEmailAction) {
        console.log('Document upload action detected - preventing actionSuccess execution');
        console.log('This prevents automatic process progression during document upload');
        return;
      }

      // Prevent actionSuccess from being called during document upload
      // UNLESS it's an email action from the link icon
      if (this.isDocumentUploadActive() && !isEmailAction) {
        console.log('Preventing actionSuccess call during document upload');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('uploadDocuments:', this.uploadDocuments);
        return;
      }

      // Additional protection: check if we're in the middle of a document upload workflow
      // UNLESS it's an email action from the link icon
      if ((this.isDocumentUploadInProgress || this.uploadDocuments || this.documentUploadLock) && !isEmailAction) {
        console.log('Document upload workflow in progress - preventing actionSuccess');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('uploadDocuments:', this.uploadDocuments);
        console.log('documentUploadLock:', this.documentUploadLock);
        return;
      }

      // Prevent actionSuccess during task completion to avoid interference
      // UNLESS it's an email action from the link icon
      if (this.taskCompletionInProgress && !isEmailAction) {
        console.log('Task completion in progress - preventing actionSuccess');
        console.log('taskCompletionInProgress:', this.taskCompletionInProgress);
        return;
      }

      // Log when email action is allowed to proceed despite document upload flags
      if (isEmailAction && this.isDocumentUploadActive()) {
        console.log('=== EMAIL ACTION ALLOWED DESPITE DOCUMENT UPLOAD FLAGS ===');
        console.log('Email action detected - allowing actionSuccess to proceed');
        console.log('emailSentFromLinkIcon:', this.emailSentFromLinkIcon);
        console.log('currentAction.action_type:', this.currentAction?.action_type);
        console.log('Document upload flags active but email action proceeding');
      }

      // Additional debugging for email actions
      if (isEmailAction) {
        console.log('=== EMAIL ACTION DETECTED ===');
        console.log('emailSentFromLinkIcon:', this.emailSentFromLinkIcon);
        console.log('emailActuallySent:', this.emailActuallySent);
        console.log('currentAction:', this.currentAction);
        console.log('Document upload active:', this.isDocumentUploadActive());

        // Mark that email was actually sent
        if (this.emailSentFromLinkIcon) {
          this.emailActuallySent = true;
          console.log('Setting emailActuallySent flag to true');
        }
      }

      // Check if email was sent from link icon and move to Verify Client stage
      if (this.emailSentFromLinkIcon) {
        try {
          console.log('=== VERIFY CLIENT STAGE MOVE TRIGGERED ===');
          console.log('Moving to Verify Client stage after email sent from link icon');
          console.log('Current lead ID:', this.selectedEmployee._id);
          console.log('Current module:', this.module);
          console.log('Email sent from link icon flag:', this.emailSentFromLinkIcon);
          console.log('Current action type:', this.currentAction?.action_type);
          console.log('Current process stage:', this.currentProcess?.stage_name);

          await this.$axios.post('/generic/process/flow/move/forward/stage', {
            id: this.selectedEmployee._id,
            module: 'leads',
            stage_name: 'Verify Client'
          });

          console.log('Successfully moved to Verify Client stage');
          console.log('=== VERIFY CLIENT STAGE MOVE COMPLETED ===');

          // Reset the flags BEFORE refreshing process details
          this.emailSentFromLinkIcon = false;
          this.emailActuallySent = false;

          // Refresh process details to get updated state
          // Pass a flag to prevent automatic progression
          await this.getProcesssDetails(this.selectedEmployee._id, true, true);

          console.log('Process details refreshed after moving to Verify Client stage');

          // Return early to prevent the normal flow from executing
          // This prevents the process from moving forward again
          return;
        } catch (error) {
          console.error('Error moving to Verify Client stage:', error);
          // Reset the flags even if there's an error
          this.emailSentFromLinkIcon = false;
          this.emailActuallySent = false;
        }
      }

      // Special handling for "verify lead client" action - don't move to next stage
      if (this.currentAction && this.currentAction.action_type === 'verify lead client') {
        console.log('Verify lead client action completed - staying on current stage');
        // Just refresh the process details to update the UI
        await this.getProcesssDetails(this.selectedEmployee._id);
        // Close dialogs after handling verify lead client
        this.closeDialogs();
        return;
      }

      // For all other action types, proceed with normal flow
      // But prevent automatic progression if document upload is in progress
      if (this.isDocumentUploadInProgress || this.uploadDocuments) {
        console.log('Document upload in progress or modal open - preventing automatic progression');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('uploadDocuments modal open:', this.uploadDocuments);
        this.automateCurrentAction = false;

        // Force keep the modal open
        if (this.isDocumentUploadInProgress) {
          this.uploadDocuments = true;
        }

        return;
      }

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      if (this.nextAction && this.nextAction.automate) {
        await this.$axios.$post(
          `/generic/process/flow/forward`,
          { id: this.selectedEmployee._id, module: this.module },
          { headers: { Authorization: AuthStr } }
        )
        this.currentPreview = false
        this.automateCurrentAction = true
        await this.tiggerAction(this.nextAction, this.selectedEmployee._id)
      } else {
        this.automateCurrentAction = false
        await this.tiggerAction(
          { action_type: 'no action' },
          this.processsDetails[0]._id
        )
      }

      // Close dialogs at the end of actionSuccess method
      this.closeDialogs();
    },

    // New method to handle document upload completion and move process forward
    async handleDocumentUploadCompletion() {
      console.log('Document upload completed - moving process forward');
      console.log('Current action:', this.currentAction);
      console.log('Module:', this.module);

      try {
        // Move the process forward to the next stage
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios.$post(
          `/generic/process/flow/forward`,
          { id: this.selectedEmployee._id, module: this.module },
          { headers: { Authorization: AuthStr } }
        )

        // Close the upload documents modal first
        this.uploadDocuments = false;

        // Reset the document upload progress flag and release lock
        this.isDocumentUploadInProgress = false;
        this.documentUploadLock = false;

        // Refresh process details to show updated state
        // This will properly update currentAction and other process state
        await this.getProcesssDetails(this.selectedEmployee._id, false, false);

        // Close dialogs to reset ShowDetails and other modal states
        this.closeDialogs();

        console.log('Process moved forward successfully after document upload');
        console.log('Document upload lock released');
        console.log('Updated current action:', this.currentAction);
      } catch (error) {
        console.error('Error moving process forward after document upload:', error);
        // Show error message to user
        this.$emit('error', 'Failed to move process forward. Please try again.');

        // Reset flags even on error to prevent stuck state
        this.isDocumentUploadInProgress = false;
        this.documentUploadLock = false;
        this.uploadDocuments = false;
      }
    },

        // Handle document upload modal close without completion
    handleDocumentUploadClose() {
      console.log('Document upload modal close requested by user');

              // User explicitly closed the modal - allow it to close
        this.isDocumentUploadInProgress = false;
        this.documentUploadLock = false;
        this.uploadDocuments = false;
        this.closeDialogs();
    },

    // Handle upload documents prop update from child component
    handleUploadDocumentsUpdate(newValue) {
      console.log('UploadDocuments prop update received:', newValue);
      this.uploadDocuments = newValue;

      // If the modal is being closed, reset the upload progress flag and release lock
      if (!newValue) {
        this.isDocumentUploadInProgress = false;
        this.documentUploadLock = false;
      }
    },
    async getEnrollmentInformation() {
      try {
        this.loading_enrollment = true
        const response = await this.$axios.get(
          `enrollments/companyId/${this.selectedEmployee?.company_id}`
        )
        console.log('response: ', response.data)
        if (response?.data) {
          this.enrollment = response.data
        } else {
          this.enrollment = {
            contact_persons: [],
            billing_address: {},
            shipping_address: {},
            bank_details: [],
            documents: {},
          }
        }
      } catch (error) {
        console.log(
          'Failed to fetch enrollment for lead: ',
          this.selectedEmployee?.lead_name
        )
      } finally {
        this.loading_enrollment = false
      }
    },
    async moveBackward(process_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$post(
        `/generic/process/flow/backward`,
        { id: this.selectedEmployee._id, module: this.module },
        { headers: { Authorization: AuthStr } }
      )
      this.currentPreview = false
      this.getProcesssDetails(process_id)
    },
    async additionalAttachments() {
      console.log('hot module handling reload')
    },
    updateIfAllActionsComplete(updatedProcess) {
      // Prevent emitting events during document upload to avoid infinite loops
      if (this.isDocumentUploadInProgress || this.documentUploadLock) {
        console.log('Preventing updateIfAllActionsComplete events during document upload');
        return;
      }

      this.$nuxt.$emit('lead-auto-select', updatedProcess[0])
      this.$nuxt.$emit('reload-lead-stats', { stageName: updatedProcess[0]?.status, selectNext: false })
    },
    async tiggerAction(action, process_id) {
      if (
        this.previousAction &&
        !this.previousAction.uploaded_document_id &&
        this.previousAction.action_type == 'invoice creation' &&
        this.previousAction.action_type == 'invoice creation' &&
        this.ProcessValidation
      ) {
        this.checkInvoiceValidation(
          this.processsDetails[0].processes[this.processIndex]
        )
      } else {
        this.ShowDetails = false

        console.log('lead action required: action_type:  ', action.action_type)

        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (action.action_type == 'no action') {
          await this.$axios.$post(
            `/generic/process/flow/forward`,
            { id: this.selectedEmployee._id, module: this.module },
            { headers: { Authorization: AuthStr } }
          )
          this.currentPreview = false
          this.getProcesssDetails(process_id)

        } else if (["email", "lead onboarding link"].includes(action.action_type)) {
          console.log("=== EMAIL/LEAD ONBOARDING LINK ACTION TRIGGERED ===")
          console.log("Action type:", action.action_type)
          console.log("Action details:", action)
          console.log("Module:", this.module)
          if (this.currentPreviewAction?.uploaded_document_id) {
            let documentsList = await this.$axios.$get(
              `/documents/doc/${this.currentPreviewAction.uploaded_document_id}`,
              { headers: { Authorization: AuthStr } }
            )
            // console.log(this.documentsList, "documentsList")
            if (documentsList) {
              this.emailAttachments.push(documentsList)
            }
          }

          if (this.currentPreviewAction?.generated_document_id) {
            let documentsList = await this.$axios.$get(
              `/documents/doc/${this.currentPreviewAction.generated_document_id}`,
              { headers: { Authorization: AuthStr } }
            )
            // console.log(this.documentsList, "documentsList")
            if (documentsList) {
              this.emailAttachments.push(documentsList)
            }
          }

          // Add lead-specific documents if this is a leads module
          if (this.module == 'leads' && this.currentPreviewAction?.uploadable_document) {
            let documentsList = await this.$axios.$post(
              `/documents/identifier/foreignid`,
              {
                identifier: 'leads',
                foreign_id: this.selectedEmployee?._id,
              },
              { headers: { Authorization: AuthStr } }
            )
            console.log(this.documentsList, 'documentsList')
            if (documentsList.length) {
              // For Proposal stage, prioritize Signed Proposal over regular Proposal
              if (this.isProposalStage) {
                console.log('Proposal stage detected - looking for Signed Proposal document');
                const signedProposal = documentsList.find(doc => doc.type_name === 'Signed Proposal');
                if (signedProposal) {
                  console.log('Found Signed Proposal document, attaching to email');
                  this.emailAttachments.push({
                    filename: signedProposal.name,
                    name: signedProposal.name,
                    url: signedProposal.url,
                  });
                } else {
                  // Fallback to first document if Signed Proposal not found
                  console.log('Signed Proposal not found, attaching first available document');
                  this.emailAttachments.push({
                    filename: documentsList[0].name,
                    name: documentsList[0].name,
                    url: documentsList[0].url,
                  });
                }
              } else if (this.isServiceAgreementStage) {
                // For Service Agreement stage, prioritize Signed Service Agreement over regular Service Agreement
                console.log('Service Agreement stage detected - looking for Signed Service Agreement document');
                const signedServiceAgreement = documentsList.find(doc => doc.type_name === 'Signed Service Agreement');
                if (signedServiceAgreement) {
                  console.log('Found Signed Service Agreement document, attaching to email');
                  this.emailAttachments.push({
                    filename: signedServiceAgreement.name,
                    name: signedServiceAgreement.name,
                    url: signedServiceAgreement.url,
                  });
                } else {
                  // Fallback to first document if Signed Service Agreement not found
                  console.log('Signed Service Agreement not found, attaching first available document');
                  this.emailAttachments.push({
                    filename: documentsList[0].name,
                    name: documentsList[0].name,
                    url: documentsList[0].url,
                  });
                }
              } else {
                // Default behavior for other stages
                this.emailAttachments.push({
                  filename: documentsList[0].name,
                  name: documentsList[0].name,
                  url: documentsList[0].url,
                });
              }
            }
          }

          // Add EOSB and residency cancellation documents if this is a cancellation email
          if (
            action.message &&
            action.message.includes('Release Payment (Cancellation)')
          ) {
            const signedEosbId = '66d96cd8eb9aa9c5edd812cf'
            const residencyCancellationId = '66daf22f178c14a1722faf71'

            const signedEosbDocs = await this.$axios.$post(
              '/documents/foreignid/identifier',
              {
                foreign_id: this.selectedEmployee._id,
                identifier: signedEosbId,
              },
              { headers: { Authorization: AuthStr } }
            )

            const residencyCancellationDocs = await this.$axios.$post(
              '/documents/foreignid/identifier',
              {
                foreign_id: this.selectedEmployee._id,
                identifier: residencyCancellationId,
              },
              { headers: { Authorization: AuthStr } }
            )

            // Add the documents to emailAttachments if they exist
            if (signedEosbDocs && signedEosbDocs.length > 0) {
              this.emailAttachments.push(
                signedEosbDocs[signedEosbDocs.length - 1]
              )
            }

            if (
              residencyCancellationDocs &&
              residencyCancellationDocs.length > 0
            ) {
              this.emailAttachments.push(
                residencyCancellationDocs[residencyCancellationDocs.length - 1]
              )
            }
          }

          let mail_url = `/email_template/?templateId=${action.template_id}&moduleId=${process_id}&generatedDocumentId=${this.currentPreviewAction.generated_document_id}`

          if (
            this.module == 'leads' &&
            action.action_type == 'lead onboarding link'
          ) {
            console.log("=== LEAD ONBOARDING LINK SPECIFIC HANDLING ===")
            console.log("Setting emailSentFromLinkIcon to true")
            console.log("Template ID:", action.template_id)
            console.log("Process ID:", process_id)

            mail_url = `/email_template/?templateId=${action.template_id}&moduleId=${process_id}&generatedDocumentId=${this.currentPreviewAction.generated_document_id}&onboardingLink=true`
            // Mark that the onboarding email flow was initiated from the action button
            // This ensures actionSuccess advances the stage to 'Verify Client' after sending
            this.emailSentFromLinkIcon = true

            console.log("Email URL:", mail_url)
            console.log("emailSentFromLinkIcon set to:", this.emailSentFromLinkIcon)
          }
          this.emailBody = await this.$axios.$get(mail_url, {
            headers: { Authorization: AuthStr },
          })
          console.log(this.emailBody?.enrollmentId, this.emailBody, "this is it now")
          // console.log( this.emailBody, " this.emailBody")
          this.emailBody.from = 'donotreply@nathanhr.ae'
          if (action.attachment) {
            this.emailBody.attachment_id =
              this.processsDetails[0].processes[
                action.attachment.process_index
              ].actions[action.attachment.action_index].template_id
          }
          // console.log("Hits Here2")
          setTimeout(() => {
            if(this.emailBody.name !== "Client Onboarding Email (Leads Process)"){
              console.log("^^^^^^^^^^^^^ condition evaluated to false")
                this.sendRawEmailDialog = {
              show: true,
              isBackendHtmlEmail: false

            }
            }else {
              console.log("################### condition evaluated to true")
              this.sendRawEmailPreviewDialog = {
              show: true,
              isBackendHtmlEmail: true
            }
            }

          }, 1)
        }
        // handle enrollment verification
        else if (
          this.module == 'leads' &&
          action.action_type == 'verify lead client'
        ) {
          console.log('=== VERIFY LEAD CLIENT ACTION TRIGGERED ===');
          console.log('Action details:', action);
          console.log('Module:', this.module);
          console.log('Selected employee:', this.selectedEmployee);

          this.enrollmentDetailsDialog = true
          console.log('Enrollment dialog opened:', this.enrollmentDetailsDialog);

          await this.getEnrollmentInformation()
          console.log('Enrollment information loaded:', this.enrollment);

          // Ensure UI is visible for the enrollment dialog to appear properly
          this.ShowDetails = true
          console.log('ShowDetails set to true for enrollment dialog');
          console.log('=== VERIFY LEAD CLIENT ACTION COMPLETED ===');
        } else if (action.action_type == 'sms') {
          this.smsBody = await this.$axios.$get(
            `/sms_template/?templateId=${action.template_id}&moduleId=${process_id}`,
            { headers: { Authorization: AuthStr } }
          )

          this.sendSmsDialog = true
        } else if (action.action_type == 'document') {
          this.documentID = action.template_id
          this.generateDocument = true
        } else if (action.action_type == 'fill form') {
          this.formID = action.template_id
          this.fillForm = true
        } else if (action.action_type == 'document upload') {
          console.log('Document upload action triggered');
          this.requiredDocuments = action.required_documents

          // For Proposal stage, ensure both Proposal and Signed Proposal are available
          if (this.isProposalStage) {
            console.log('=== PROPOSAL STAGE DOCUMENT UPLOAD ===');
            console.log('Required documents from action:', action.required_documents);
            console.log('Current required documents:', this.requiredDocuments);
            console.log('Action details:', action);

            // Get the current process to access stage-level documents_required
            const currentProcess = this.processsDetails[0]?.processes?.find(p => p.stage_name === 'Proposal Sent');
            if (currentProcess && currentProcess.documents_required) {
              console.log('Stage-level documents_required:', currentProcess.documents_required);

              // Combine action-level and stage-level document requirements
              const allRequiredDocs = [...new Set([
                ...(action.required_documents || []),
                ...(currentProcess.documents_required || [])
              ])];

              console.log('Combined required documents:', allRequiredDocs);
              this.requiredDocuments = allRequiredDocs;
            }
          }

          // For Service Agreement stage, ensure both Service Agreement and Signed Service Agreement are available
          if (this.isServiceAgreementStage) {
            console.log('=== SERVICE AGREEMENT STAGE DOCUMENT UPLOAD ===');
            console.log('Required documents from action:', action.required_documents);
            console.log('Current required documents:', this.requiredDocuments);
            console.log('Action details:', action);

            // Get the current process to access stage-level documents_required
            const currentProcess = this.processsDetails[0]?.processes?.find(p => p.stage_name === 'Service Agreement');
            if (currentProcess && currentProcess.documents_required) {
              console.log('Stage-level documents_required:', currentProcess.documents_required);

              // Combine action-level and stage-level document requirements
              const allRequiredDocs = [...new Set([
                ...(action.required_documents || []),
                ...(currentProcess.documents_required || [])
              ])];

              console.log('Combined required documents:', allRequiredDocs);
              this.requiredDocuments = allRequiredDocs;
            }
          }

          // Set global lock to prevent any interference during document upload
          this.documentUploadLock = true;
          this.isDocumentUploadInProgress = true;
          console.log('Document upload modal opened, isDocumentUploadInProgress set to:', this.isDocumentUploadInProgress);
          console.log('Document upload lock activated');

          // Open the modal
          this.uploadDocuments = true

          // Force the modal to stay open and prevent interference
          this.$nextTick(() => {
            if (!this.uploadDocuments) {
              console.log('Forcing document upload modal to stay open');
              this.uploadDocuments = true;
            }
          });

          // Increment modal key to ensure proper rendering
          this.documentUploadModalKey++;

          // Prevent any automatic progression
          this.automateCurrentAction = false;

          // Set a timeout to ensure the modal stays open
          setTimeout(() => {
            if (this.isDocumentUploadInProgress && !this.uploadDocuments) {
              console.log('Timeout: Forcing document upload modal to stay open');
              this.uploadDocuments = true;
            }
          }, 100);

          console.log('Document upload modal should now be open and stable');
        } else if (action.action_type == 'update module') {
          this.updateModuleData.module = action.module
          this.updateModuleData.foreign_id = action.foreign_id
          this.updateModuleData.data = action.data
          this.updateModule = true
        } else if (action.action_type == 'invoice creation') {
          this.invoice = {
            invoice: action.invoice,
            debit: action.debit,
          }
          this.createInvoice = true
        } else if (action.action_type == 'record payment') {
          this.recordPayment = true
        } else if (action.action_type == 'visa process') {
          this.visaProcessType = action.process_type
          this.createVisaProcess = true
        } else {
          this.tiggerAction(
            { action_type: 'no action' },
            this.processsDetails[0]._id
          )
        }
      }
    },
    closeDialogs() {
      // Prevent closing dialogs if document upload is in progress
      if (this.isDocumentUploadActive() || this.documentUploadLock) {
        console.log('Preventing closeDialogs call during document upload');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('uploadDocuments:', this.uploadDocuments);
        console.log('documentUploadLock:', this.documentUploadLock);
        return;
      }

      this.sendEmailDialog = false
      this.sendRawEmailDialog = false
      this.sendRawEmailPreviewDialog = false
      this.generateDocument = false

      // Don't close document upload modal if it's in progress
      if (!this.isDocumentUploadInProgress && !this.uploadDocuments) {
        this.uploadDocuments = false
      } else {
        console.log('Preventing document upload modal from closing in closeDialogs');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('uploadDocuments:', this.uploadDocuments);
        // Force keep the modal open
        this.uploadDocuments = true;
      }

      this.createInvoice = false
      this.recordPayment = false
      this.createVisaProcess = false
      this.fillForm = false
      this.ShowDetails = true
      this.sendSmsDialog = false
      this.emailAttachments = []
      this.enrollmentDetailsDialog = false

      // Reset email sent from link icon flag when dialogs are closed
      // This ensures the flag is reset if email dialog is closed without sending
      if (this.emailSentFromLinkIcon && !this.sendRawEmailPreviewDialog.show && !this.sendRawEmailDialog.show && !this.sendEmailDialog) {
        console.log('Resetting emailSentFromLinkIcon flag in closeDialogs - email dialog closed without sending');
        this.emailSentFromLinkIcon = false;
        this.emailActuallySent = false;
      }

      // Only reset document upload progress flag when dialogs are closed AND no upload is in progress
      if (this.isDocumentUploadInProgress && !this.uploadDocuments) {
        console.log('Resetting document upload progress flag in closeDialogs');
        this.isDocumentUploadInProgress = false
      }
    },
    create_offboarding() {
      if (this.reason_for_unsuccessful.length > 0) {
        this.offboardingDialog = true
      }
    },
    async createUnsuccessful() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      let reason = this.reason_for_unsuccessful

      if (reason === 'Other' && this.otherReason.trim() !== '') {
        reason = this.otherReason.trim()
      }

      await this.$axios
        .$post(
          `/generic/process/mark/unsuccessfull`,
          {
            reason_for_unsuccessful: this.reason_for_unsuccessful,
            id: this.selectedEmployee._id,
            module: this.module,
          },
          { headers: { Authorization: AuthStr } }
        )
        .then((res) => {
          this.$nuxt.$emit('reloadLeadsList', true)
        })
      this.unsuccessfulDialog = false
    },
    confirm() {
      // this.tiggerAction(this.currentAction,this.processsDetails[0]._id)
    },
    findPreview(process, processIndex, actionIndex) {
      let currentAction = process[processIndex].actions[actionIndex]
      if (currentAction != undefined) {
        if (currentAction.preview == 'none') {
          this.currentPreviewAction = false
        } else if (currentAction.preview == 'current') {
          if (
            currentAction.action_type == 'invoice creation' &&
            currentAction.status != 'completed'
          ) {
            if (actionIndex - 1 >= 0) {
              this.findPreview(process, processIndex, actionIndex - 1)
            } else if (processIndex - 1 >= 0) {
              this.findPreview(
                process,
                processIndex - 1,
                process[processIndex - 1].actions.length - 1
              )
            }
          } else {
            this.currentPreviewActionIndex = actionIndex
            this.currentPreviewProcessIndex = processIndex
            this.currentPreviewAction = currentAction
          }
        } else if (currentAction.preview == 'previous') {
          if (actionIndex - 1 >= 0) {
            this.findPreview(process, processIndex, actionIndex - 1)
          } else if (processIndex - 1 >= 0) {
            this.findPreview(
              process,
              processIndex - 1,
              process[processIndex - 1].actions.length - 1
            )
          }
        } else if (currentAction.preview == 'next') {
          if (actionIndex + 1 < process[processIndex].actions.length) {
            this.findPreview(process, processIndex, actionIndex + 1)
          } else if (processIndex + 1 < process.length) {
            this.findPreview(process, processIndex + 1, 0)
          }
        } else {
          this.currentPreviewAction = false
        }
      } else {
        this.currentPreviewAction = false
      }
    },
    findIndex(array, key, value) {
      var index = array.findIndex(function (element) {
        return element[key] == value
      })
      return index
    },
        async getProcesssDetails(id, firstFetch = false, preventAutoProgression = false) {
      console.log('getProcesssDetails called with:', { id, firstFetch, preventAutoProgression });
      console.log('Document upload in progress:', this.isDocumentUploadInProgress);
      console.log('Upload documents modal open:', this.uploadDocuments);

      // Prevent process details refresh if document upload is in progress
      if ((this.isDocumentUploadInProgress || this.documentUploadLock) && !firstFetch) {
        console.log('Preventing process details refresh during document upload');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('documentUploadLock:', this.documentUploadLock);
        return;
      }

      this.ShowDetails = false
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      const response = await this.$axios.$post(
        '/generic/process/flow',
        { id: id, module: this.module },
        { headers: { Authorization: AuthStr } }
      )
      this.processsDetails = response

      // Check if pipeline is completed for leads module and show completion modal
      // Only show if not already showing and not manually closed to prevent interference
      const shouldShowCompletionModal = this.module === 'leads' && this.processsDetails[0].status === 'completed' && !firstFetch && !this.showCompletionModal && !this.completionModalManuallyClosed;

      if (shouldShowCompletionModal) {
        this.showCompletionModal = true
      }

      // Only call updateIfAllActionsComplete if we're not showing the completion modal
      // This prevents reloads that could interfere with the modal
      if (!firstFetch && !preventAutoProgression && !shouldShowCompletionModal) {
        this.updateIfAllActionsComplete(response)
      }

      if (this.processsDetails[0].status == 'completed') {
        this.currentProcess =
          this.processsDetails[0].processes[
          this.processsDetails[0].processes.length - 1
          ]
      } else {
        // First try to find a process with progress status
        this.currentProcess = this.processsDetails[0].processes.filter(
          (process) => process.process_status === 'progress'
        )[0]

        // If no progress process found, look for pending processes with progress actions
        if (!this.currentProcess) {
          this.currentProcess = this.processsDetails[0].processes.filter(
            (process) => process.process_status === 'pending' &&
                        process.actions &&
                        process.actions.some(action => action.status === 'progress')
          )[0]
        }

        console.log('=== PROCESS SELECTION DEBUG ===');
        console.log('All processes:', this.processsDetails[0].processes);
        console.log('Processes with progress status:', this.processsDetails[0].processes.filter(p => p.process_status === 'progress'));
        console.log('Processes with pending status and progress actions:', this.processsDetails[0].processes.filter(p => p.process_status === 'pending' && p.actions && p.actions.some(action => action.status === 'progress')));
        console.log('Selected current process:', this.currentProcess);
      }
      if (this.currentProcess) {
        console.log('=== CURRENT PROCESS DETECTED ===');
        console.log('Current process stage:', this.currentProcess.stage_name);
        console.log('Current process status:', this.currentProcess.process_status);
        console.log('Current process actions:', this.currentProcess.actions);

        if (this.processsDetails[0].status == 'completed') {
          this.currentidentifier = this.currentProcess._id
          this.currentAction =
            this.currentProcess.actions[this.currentProcess.actions.length - 1]
          this.nextAction =
            this.currentProcess.actions[this.currentProcess.actions.length]
          this.processIndex = this.processsDetails[0].processes.length - 1
          this.actionIndex = this.currentProcess.actions.length - 1
          await this.findPreview(
            this.processsDetails[0].processes,
            this.processIndex,
            this.actionIndex
          )
          if (this.currentPreviewAction) {
            if (
              (this.currentPreviewAction.action_type == 'visa process' &&
                this.currentPreviewAction.status != 'completed') ||
              (this.currentPreviewAction.action_type == 'document' &&
                this.currentPreviewAction.status != 'completed')
            ) {
              this.currentPreview = false
            } else {
              this.processDetailsFlag = false
              this.currentPreview = true
            }
          } else {
            this.currentPreview = false
          }
          // if(this.currentAction.automate_emails === true) {
          //   await this.AutomateEmails()
          // }
        } else {
          this.currentidentifier = this.currentProcess._id
          this.currentAction = this.currentProcess.actions.filter(
            (action) => action.status === 'progress'
          )[0]
          this.processIndex = this.findIndex(
            this.processsDetails[0].processes,
            'process_status',
            'progress'
          )
          this.actionIndex = this.findIndex(
            this.currentProcess.actions,
            'status',
            'progress'
          )
          if (this.actionIndex > 0) {
            this.previousAction =
              this.currentProcess.actions[this.actionIndex - 1]
          }
          await this.findPreview(
            this.processsDetails[0].processes,
            this.processIndex,
            this.actionIndex
          )
          if (this.currentPreviewAction) {
            if (
              (this.currentPreviewAction.action_type == 'visa process' &&
                this.currentPreviewAction.status != 'completed') ||
              (this.currentPreviewAction.action_type == 'document' &&
                this.currentPreviewAction.status != 'completed')
            ) {
              this.currentPreview = false
            } else {
              this.processDetailsFlag = false
              this.currentPreview = true
            }
          } else {
            this.currentPreview = false
          }
          if (this.currentAction.automate_emails === true && !preventAutoProgression && !this.isDocumentUploadInProgress && !this.uploadDocuments && !this.documentUploadLock) {
            this.automateCurrentAction = true
            // console.log(this.automateCurrentAction, "automateCurrentAction")

            await this.tiggerAction(
              this.currentAction,
              this.selectedEmployee._id
            )
          }
        }
      } else this.currentAction = {}

      // Don't close dialogs if completion modal is showing to prevent interference
      // Also don't close dialogs if document upload is in progress
      if (!this.showCompletionModal && !this.uploadDocuments && !this.isDocumentUploadInProgress && !this.documentUploadLock) {
        this.closeDialogs()
      } else if (this.uploadDocuments || this.isDocumentUploadInProgress || this.documentUploadLock) {
        console.log('Preventing closeDialogs call during document upload');
        console.log('showCompletionModal:', this.showCompletionModal);
        console.log('uploadDocuments:', this.uploadDocuments);
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('documentUploadLock:', this.documentUploadLock);
      }
    },
    async getDocumentsTypeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$get(`/documenttypes`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.documentTypesList = _.orderBy(response, ['name'])
        })
    },
    async checkInvoiceValidation(CurrentProcess) {
      // If no invoice_id exists (e.g., after file upload), allow process to continue
      if (!CurrentProcess.invoice_id) {
        console.log('No invoice_id found - allowing process to continue (likely after file upload)')
        await this.tiggerAction(
          this.currentAction,
          this.processsDetails[0]._id
        )
        this.ProcessValidation = false
        return
      }

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/invoice/statusChecker/${CurrentProcess.invoice_id}`, {
          headers: { Authorization: AuthStr },
        })
        .then(async (response) => {
          // this.ProcessValidation = response.data
          // this.message = response.message

          if (response.data == false) {
            await this.tiggerAction(
              this.currentAction,
              this.processsDetails[0]._id
            )
            this.ProcessValidation = false
          } else {
            this.snackbar = true
            this.SnackBarMessage = response.message
            // await this.tiggerAction({ action_type: 'no action' }, this.processsDetails[0]._id)
          }
        })
    },
    async getDocumentStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/documents/list/status`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          this.documentStatusList = response
        })
    },
    async openAttachments(process) {
      this.selectedStage = process
      this.attachmentsDialog = true
      this.selectedAttachments = []
      this.documentsLoading = true
      this.newDocument = false
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let obj = {
        foreign_id: this.processsDetails[0]._id,
        identifier: process._id,
      }
      let documentsList = await this.$axios.$post(
        '/documents/identifier/foreignid',
        obj,
        { headers: { Authorization: AuthStr } }
      )
      if (documentsList.length > 0) {
        documentsList.forEach((item) => {
          this.selectedAttachments.push(item)
        })
      }
      this.documentsLoading = false
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
      // if(this.uploadFiles) {
      //   this.attachFile();
      // }
    },
    async attachFile() {
      this.uploading = true
      let attach = {}

      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      for (var key in this.attachFiles) {
        if (!_.isEmpty(this.attachFiles[key])) {
          for (let i = 0; i < this.attachFiles[key].length; i++) {
            if (this.attachFiles[key][i].name != undefined) {
              let upload_meta = {
                file: this.attachFiles[key][i],
                filename: this.attachFiles[key][i].name,
              }
              this.documentObj.documents.push(upload_meta)
            } else {
              console.log('null')
            }
          }
        }
        this.removeFile(key)
      }
      this.uploading = false
    },
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        this.dragging = false
        return
      }
      this.createFile(e, files, type)
    },
    removeFile(val) {
      if (val == 'uploadDoc') this.uploadFile = ''
      this.filename_attach = []
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
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    async updatedProcess() {
      this.page = 1
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      if (this.$refs.edit_category.validate()) {
        this.loading = true
        this.documentObj.identifier = this.selectedStage._id
        this.documentObj.foreign_id = this.processsDetails[0]._id

        await this.attachFile()

        const fd = new FormData()
        for (
          let index = 0;
          index < this.documentObj.documents.length;
          index++
        ) {
          const element = this.documentObj.documents[index]
          fd.append('documents', element.file, element.filename)
        }

        fd.append('type', this.documentObj.type)
        fd.append('identifier', this.documentObj.identifier)
        fd.append('foreign_id', this.documentObj.foreign_id)
        fd.append('doc_status', this.documentObj.doc_status)
        fd.append('expiry', this.documentObj.expiry)
        fd.append('module', this.documentObj.module)

        await this.$axios
          .$post(`/documents`, fd, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.snackOptions.isVisible = true
            this.snackOptions.color = 'success'
            this.snackOptions.text = 'Successfully Added New Document.'
            this.loading = false
            this.openAttachments(this.selectedStage)
          })
      }
    },
    deleteDocument(index) {
      this.filename_attach.splice(index, 1)
    },
    deleteAttachment(item) {
      this.selectedItem = item
      this.deleteDialog = true
    },

    deleteDocumentConfirm() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.$axios
        .$delete(
          `/documents/${this.selectedItem.id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          if (response) {
            this.snack = true
            this.snackColor = 'success'
            this.snackText = 'Document Deleted Successfully.'
            this.getDocumentsById(this.employeeDetails[0]._id)
            this.deleteDialog = false
            this.selectedItem = {}
          }
        })
    },

    openDocument(val) {
      window.open(val)
    },
    initiateDownload(url) {
      const link = document.createElement('a')
      link.href = url
      link.download = 'downloaded_file'
      link.target = '_blank'
      link.click()
      // this.close();
    },
    getDocumentType(id) {
      let type = this.documentTypesList.filter((a) => a.id == id)
      if (type.length > 0) {
        return type[0].name
      } else {
        return ''
      }
    },
    handleCompanyIds(ev) {
      if (Object.keys(ev).find((it) => ev[it] === '')) return
      this.parent_company = ev.parent_company
      this.parent_company_id = ev.parent_company_id
      this.getInsurance()
    },

    async getInsurance() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          process.env.insurancePortalUrl +
          'insurance/cycles/external/getdetails',
          {
            user_id: this.selectedEmployee.user_id,
            parent_company: this.parent_company,
          },
          { headers: { Authorization: AuthStr } }
        )
        .then((res) => {
          this.userInsuranceDetails = res
        })
        .catch((e) => {
          this.snackOptions = {
            isVisible: true,
            color: 'error',
            text: 'An error occurred while trying to fetch insurance data',
          }
        })
    },

    closeInsuranceCancellation(event) {
      if (event == 'Already Request Is Existing') {
        this.cancelInsuranceRequest = false
        this.snackOptions = {
          isVisible: true,
          color: 'error',
          text: 'Already Request Is Existing',
        }
      } else if (event == 'Insurance Delete request successfully created') {
        this.cancelInsuranceRequest = false
        this.snackOptions = {
          isVisible: true,
          color: 'success',
          text: 'Insurance Delete request successfully created',
        }
      } else if (
        event ==
        'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !'
      ) {
        this.cancelInsuranceRequest = false
        this.snackOptions = {
          isVisible: true,
          color: 'error',
          text: 'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !',
        }
      } else {
        this.cancelInsuranceRequest = false
      }
    },
    handleCompanyIds(ev) {
      if (Object.keys(ev).find((it) => ev[it] === '')) return
      this.parent_company = ev.parent_company
      this.parent_company_id = ev.parent_company_id
      this.getInsurance()
    },

    async getInsurance() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios
        .$post(
          process.env.insurancePortalUrl +
          'insurance/cycles/external/getdetails',
          {
            user_id: this.selectedEmployee.user_id,
            parent_company: this.parent_company,
          },
          { headers: { Authorization: AuthStr } }
        )
        .then((res) => {
          this.userInsuranceDetails = res
        })
        .catch((e) => {
          this.snackOptions = {
            isVisible: true,
            color: 'error',
            text: 'An error occurred while trying to fetch insurance data',
          }
        })
    },

    closeInsuranceCancellation(event) {
      if (event == 'Already Request Is Existing') {
        this.cancelInsuranceRequest = false
        this.snackOptions = {
          isVisible: true,
          color: 'error',
          text: 'Already Request Is Existing',
        }
      } else if (event == 'Insurance Delete request successfully created') {
        this.cancelInsuranceRequest = false
        this.snackOptions = {
          isVisible: true,
          color: 'success',
          text: 'Insurance Delete request successfully created',
        }
      } else if (
        event ==
        'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !'
      ) {
        this.cancelInsuranceRequest = false
        this.snackOptions = {
          isVisible: true,
          color: 'error',
          text: 'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !',
        }
      } else {
        this.cancelInsuranceRequest = false
      }
    },
    handleCompletionModalConfirm() {
      this.showCompletionModal = false
      this.completionModalManuallyClosed = true

      // Emit the events that were prevented when showing the modal
      // This ensures proper updates after user manually closes the modal
      this.$nextTick(() => {
        if (this.processsDetails && this.processsDetails.length > 0) {
          this.$nuxt.$emit('lead-auto-select', this.processsDetails[0])
          this.$nuxt.$emit('reload-lead-stats', { stageName: this.processsDetails[0]?.status, selectNext: false })
        }

        // Refresh the process details to ensure everything is up to date
        this.getProcesssDetails(this.selectedEmployee._id)
      })
    },
    handleCompletionModalCancel() {
      this.showCompletionModal = false
      this.completionModalManuallyClosed = true

      // Emit the events that were prevented when showing the modal
      // This ensures proper updates after user manually closes the modal
      this.$nextTick(() => {
        if (this.processsDetails && this.processsDetails.length > 0) {
          this.$nuxt.$emit('lead-auto-select', this.processsDetails[0])
          this.$nuxt.$emit('reload-lead-stats', { stageName: this.processsDetails[0]?.status, selectNext: false })
        }
      })
    },

    handleTaskCreated(taskData) {
      // Mark the action as having a task created to prevent duplicate prompts
      if (this.currentAction && this.currentAction._id === taskData.actionId) {
        this.currentAction.task_created = true;
        // Also track in our local status object
        this.taskCreationStatus[taskData.actionId] = {
          taskId: taskData.taskId,
          createdAt: new Date().toISOString()
        };
      }

      // Emit event to refresh task table
      this.$nuxt.$emit('refresh-task-table');

      // Also emit event to refresh lead stats if needed
      this.$nuxt.$emit('reload-lead-stats', {
        stageName: this.currentProcess?.stage_name,
        selectNext: false
      });
    },

    // Check if document upload is in progress and prevent interference
    isDocumentUploadActive() {
      return this.isDocumentUploadInProgress || this.uploadDocuments || this.documentUploadLock;
    },

    // Prevent any external interference with document upload
    preventDocumentUploadInterference() {
      if (this.isDocumentUploadActive()) {
        console.log('Preventing external interference with document upload');
        console.log('isDocumentUploadInProgress:', this.isDocumentUploadInProgress);
        console.log('uploadDocuments:', this.uploadDocuments);
        console.log('documentUploadLock:', this.documentUploadLock);
        return true;
      }
      return false;
    },

    handleEnrollmentModalClose() {
      this.enrollmentDetailsDialog = false;
      this.ShowDetails = true; // Reset ShowDetails to true when modal is closed

      // Ensure process flow is properly displayed
      if (this.processsDetails && this.processsDetails.length > 0) {
        // Force a small delay to ensure state is properly updated
        this.$nextTick(() => {
          if (!this.ShowDetails) {
            this.ShowDetails = true;
          }
        });
      }
    },

    // Check if email icon should be shown (for Proposal Sent and later stages)
    shouldShowEmailIcon() {
      if (!this.currentProcess || !this.currentProcess.stage_name) {
        return false;
      }

      const stagesAfterProposalSent = [
        // 'Contact Client',
        'Proposal Sent',
        'In Discussion',
        'Onboard Client',
        'Verify Client',
        'Service Agreement'
      ];

      return stagesAfterProposalSent.includes(this.currentProcess.stage_name);
    },

    // Helper method to check if current action is an email action
    isEmailAction() {
      return this.emailSentFromLinkIcon || this.emailActuallySent ||
             (this.currentAction?.action_type &&
              ['send email', 'send raw email', 'send mail', 'email'].includes(this.currentAction.action_type.toLowerCase()));
    },

        // Handle email icon click - triggers the same flow as lead onboarding link
    async handleEmailIconClick() {
      // Prevent multiple clicks while loading
      if (this.emailIconLoading) {
        return;
      }

      this.emailIconLoading = true;

              try {
          const AuthStr = 'Bearer '.concat(this.$store.state.token);

          // Proceed with email functionality (same as lead onboarding link)

        // Clear any existing attachments
        this.emailAttachments = [];

        // Add any uploaded documents if they exist
        if (this.currentPreviewAction?.uploaded_document_id) {
          let documentsList = await this.$axios.$get(
            `/documents/doc/${this.currentPreviewAction.uploaded_document_id}`,
            { headers: { Authorization: AuthStr } }
          );
          if (documentsList) {
            this.emailAttachments.push(documentsList);
          }
        }

        // Add any generated documents if they exist
        if (this.currentPreviewAction?.generated_document_id) {
          let documentsList = await this.$axios.$get(
            `/documents/doc/${this.currentPreviewAction.generated_document_id}`,
            { headers: { Authorization: AuthStr } }
          );
          if (documentsList) {
            this.emailAttachments.push(documentsList);
          }
        }

        // Add lead-specific documents if this is a leads module
        if (this.module == 'leads' && this.currentPreviewAction?.uploadable_document) {
          let documentsList = await this.$axios.$post(
            `/documents/identifier/foreignid`,
            {
              identifier: 'leads',
              foreign_id: this.selectedEmployee?._id,
            },
            { headers: { Authorization: AuthStr } }
          );
          if (documentsList.length) {
            // For Proposal stage, prioritize Signed Proposal over regular Proposal
            if (this.isProposalStage) {
              console.log('Proposal stage detected - looking for Signed Proposal document');
              const signedProposal = documentsList.find(doc => doc.type_name === 'Signed Proposal');
              if (signedProposal) {
                console.log('Found Signed Proposal document, attaching to email');
                this.emailAttachments.push({
                  filename: signedProposal.name,
                  name: signedProposal.name,
                  url: signedProposal.url,
                });
              } else {
                // Fallback to first document if Signed Proposal not found
                console.log('Signed Proposal not found, attaching first available document');
                this.emailAttachments.push({
                  filename: documentsList[0].name,
                  name: documentsList[0].name,
                  url: documentsList[0].url,
                });
              }
            } else if (this.isServiceAgreementStage) {
              // For Service Agreement stage, prioritize Signed Service Agreement over regular Service Agreement
              console.log('Service Agreement stage detected - looking for Signed Service Agreement document');
              const signedServiceAgreement = documentsList.find(doc => doc.type_name === 'Signed Service Agreement');
              if (signedServiceAgreement) {
                console.log('Found Signed Service Agreement document, attaching to email');
                this.emailAttachments.push({
                  filename: signedServiceAgreement.name,
                  name: signedServiceAgreement.name,
                  url: signedServiceAgreement.url,
                });
              } else {
                // Fallback to first document if Signed Service Agreement not found
                console.log('Signed Service Agreement not found, attaching first available document');
                this.emailAttachments.push({
                  filename: documentsList[0].name,
                  name: documentsList[0].name,
                  url: documentsList[0].url,
                });
              }
            } else {
              // Default behavior for other stages
              this.emailAttachments.push({
                filename: documentsList[0].name,
                name: documentsList[0].name,
                url: documentsList[0].url,
              });
            }
          }
        }

        // Get the email template - use the same template as lead onboarding link
        // We'll use a default template ID for the email icon functionality
        const defaultEmailTemplateId = '684abb84cd53120012c3117b'; // This should be the lead onboarding link template ID

        let mail_url = `/email_template/?templateId=${defaultEmailTemplateId}&moduleId=${this.selectedEmployee._id}&generatedDocumentId=${this.currentPreviewAction?.generated_document_id}&onboardingLink=true`;

        this.emailBody = await this.$axios.$get(mail_url, {
          headers: { Authorization: AuthStr },
        });

        this.emailBody.from = 'donotreply@nathanhr.ae';

        // Show the email preview dialog (same as lead onboarding link)
        setTimeout(() => {
          this.sendRawEmailPreviewDialog = {
            show: true,
            isBackendHtmlEmail: true
          };
          // Mark that email was sent from link icon
          this.emailSentFromLinkIcon = true;
        }, 1);

              } catch (error) {
          console.error('Error handling email icon click:', error);
          // Show error notification
          this.snackOptions = {
            isVisible: true,
            color: 'error',
            text: 'Error loading email template. Please try again.',
          };
        } finally {
          this.emailIconLoading = false;
        }
    },
  },
  computed: {
    isProposalStage() {
      console.log('=== CHECKING PROPOSAL STAGE ===');
      console.log('Current process:', this.currentProcess);
      console.log('Current process stage_name:', this.currentProcess?.stage_name);
      console.log('Current process stage_name (lowercase):', this.currentProcess?.stage_name?.toLowerCase());

      const isProposal = this.currentProcess?.stage_name?.toLowerCase().includes('proposal');
      console.log('Is proposal stage result:', isProposal);

      if (isProposal) {
        console.log('=== PROPOSAL STAGE DETECTED ===');
        console.log('Current process:', this.currentProcess);
        console.log('Current action:', this.currentAction);
      }
      return isProposal;
    },

    isServiceAgreementStage() {
      console.log('=== CHECKING SERVICE AGREEMENT STAGE ===');
      console.log('Current process:', this.currentProcess);
      console.log('Current process stage_name:', this.currentProcess?.stage_name);
      console.log('Current process stage_name (lowercase):', this.currentProcess?.stage_name?.toLowerCase());

      const isServiceAgreement = this.currentProcess?.stage_name?.toLowerCase().includes('service agreement');
      console.log('Is service agreement stage result:', isServiceAgreement);

      if (isServiceAgreement) {
        console.log('=== SERVICE AGREEMENT STAGE DETECTED ===');
        console.log('Current process:', this.currentProcess);
        console.log('Current action:', this.currentAction);
      }
      return isServiceAgreement;
    },
  },
}
</script>
<style>
.dropZone {
  width: 220px;
  height: 60px;
  position: relative;
  border: 2px dashed #eee;
}

.dropZone:hover {
  border: 2px solid #2e94c4;
}

.dropZone:hover .dropZone-title {
  color: #1975a0;
}

.dropZone-info {
  color: #a8a8a8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}

.dropZone-title {
  color: #787878;
}

.dropZone input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.dropZone-upload-limit-info {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.dropZone-over {
  background: #5c5c5c;
  opacity: 0.8;
}

.dropZone-uploaded {
  width: 220px;
  height: 60px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone-uploaded-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #a8a8a8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>
