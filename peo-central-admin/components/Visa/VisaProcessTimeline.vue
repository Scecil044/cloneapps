<template>
  <div>
    <SendMailDialog
      v-if="sendEmailDialog"
      :email-body="emailBody"
      @close="closeDialogs"
      :is-loading="!emailBody.content"
      @successfull="closeDialogs"
    />
    <SendRawMailDialog
      v-if="sendRawEmailDialog"
      :email-body="emailBody"
      @close="closeDialogs"
      :attachments="emailAttachments"
      @successfull="closeDialogs"
      :automate-current-action="automateEmail"
    />

    <v-row v-if="visaProcessTimelineData !== null" style="min-height: 700px; max-height: 800px; margin-top: 0">
      <v-col class="py-0" cols="12" height="80vh">
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->

        <v-card flat class="vs_custom-timeline" style="height: 100%">
          <!-- [START] timeline header -->
          <v-row>
            <v-col cols="12" sm="12" class="text-right pt-2 pb-0">
              <!-- custom email send -->
              <!-- <v-tooltip top color="amber">
                <template #activator="{ on, attrs }">
                  <v-btn x-small fab elevation="0" v-bind="attrs" class="mr-2" v-on="on" @click="loadCustomEmail()">
                    <v-icon color="cyan">
                      mdi-card-account-mail
                    </v-icon>
                  </v-btn>
                </template>
Send Custom Mail
</v-tooltip> -->
              <v-btn tile outlined @click="loadCustomEmail()">
                <v-icon left> mdi-email-outline </v-icon>
                Send Email
              </v-btn>

              <!-- draw employee details -->
              <!-- <v-tooltip top color="primary">
                <template #activator="{ on, attrs }">
                  <v-btn x-small fab elevation="0" v-bind="attrs" class="mr-2" v-on="on" @click="userDetails = true">
                    <v-icon color="primary">
                      mdi-card-account-details-outline
                    </v-icon>
                  </v-btn>
                </template>
                Employee Details
              </v-tooltip> -->
              <v-btn tile outlined @click="userDetails = true">
                <v-icon left> mdi-account-outline </v-icon>
                View
              </v-btn>

              <v-btn tile outlined @click="showCancelVisaDialog()" color="red">
                <v-icon left> mdi-note-off-outline </v-icon>
                Cancel
              </v-btn>
            </v-col>
          </v-row>

          <v-row class="mt-0 align-center pb-4">
            <!-- [TODO] Ask spenser to add image to user -->
            <v-col cols="12" sm="12" md="3" class="my-auto text-center">
              <v-avatar class="temp-border" size="80" v-if="visaProcessTimelineData.user_image_url">
                <v-img aspect-ratio="1" :src="visaProcessTimelineData.user_image_url" />
              </v-avatar>
              <div class="v-avatar v-list-item__avatar" v-else>
                <customerDefaultIcon height="80px" width="80px" style="border-radius: 50px" />
              </div>
            </v-col>
            <v-col cols="12" class="pa-0" sm="12" md="9">
              <v-row class="ma-0 pa-0">
                <v-col class="pa-0" cols="12">
                  <h3 class="font-weight-bold h2">
                    {{ visaProcessTimelineData.first_name }}
                    {{ visaProcessTimelineData.last_name }}
                  </h3>
                </v-col>
                <v-col class="pa-0" cols="12">
                  <v-chip v-if="visaProcessTimelineData.employment.visa_sponsor_type" label x-small class="green white--text">
                    <span v-if="visaProcessTimelineData.employment.visa_sponsor_type == 'Executive Employment Services'" class="chip__custom">Abu Dhabi</span>
                    <span v-else class="chip__custom">Dubai</span>
                  </v-chip>
                  <v-chip
                    label
                    x-small
                    :class="visaProcessTimelineData.current_status == 'In UAE' ? 'purple white--text' : 'indigo white--text'"
                  >
                    <span class="chip__custom">
                      {{ visaProcessTimelineData.status }}
                    </span>
                  </v-chip>
                </v-col>
              </v-row>
              <!-- <h4 class="font-weight-bold caption mt-1">
                    Process Type : {{ visaProcessTimelineData.process_type }}
                  </h4> -->

              <!-- <h4
                    class="font-weight-bold caption mt-1 pa-1"
                    :style="
                      currentComment(visaProcessTimelineData.process) != ''
                        ? 'border: 2px solid black;'
                        : ''
                    "
                  >
                    Last Comment :{{
                      currentComment(visaProcessTimelineData.process)
                    }}
                  </h4> -->
            </v-col>
          </v-row>

          <!-- [END] timeline header -->

          <v-divider />

          <!-- timeline content -->
          <v-timeline dense clipped>
            <v-slide-x-transition group>
              <v-timeline-item
                v-for="(event, index) in visaProcessDetails.processes"
                :key="index"
                :icon="getIcon(event)"
                :icon-color="getIconColor(event)"
                icon-size="5"
                class="d-flex align-center"
                color="white"
                :small="getIconSize(event)"
              >
                <v-row class="align-center">
                  <v-col class="flex-grow-1">
                    <h4 class="grey--text d-flex align-center text--darken-1 h5">
                      <span>{{ event.stage_name }}</span>
                      <!-- sms -->
                      <v-btn
                        icon
                        color="indigo"
                        title="send sms"
                        @click="
                          openSMSDialog = true
                          getUserPhone(visaProcessDetails.user_id)
                        "
                      >
                        <v-icon small color=""> mdi-comment-text-outline </v-icon>
                      </v-btn>
                      <!-- email -->
                      <v-btn
                        icon
                        color="purple"
                        title="send email"
                        @click="getUserEmailManual(event.actions, visaProcessDetails._id, event.attachments)"
                      >
                        <v-icon small color=""> mdi-email </v-icon>
                      </v-btn>
                      <!-- comments -->
                      <VisaCommentsButtonWrapper @click:loadComments="loadComments(event)" :comments="event.comments || []" />

                      <div class="ml-6 d-inline-flex" v-if="!visaProcessLoading[index]">
                        <v-img src="/animated/refresh.svg" max-width="28" height="28" class="mr-2" contain />
                      </div>
                    </h4>
                    <p class="caption mb-0 grey--text" v-if="event.process_status == 'completed'">
                      Completed on :
                      {{ event.completed_date | formatDateWithoutTime }}
                    </p>
                    <!-- <p
                          class="caption mb-0 grey--text"
                          v-if="event.status == 'Cancelled'"
                        >
                          Cancelled on :
                          {{ event.enddate | nocDateFormatter }}
                        </p> -->
                    <div
                      class="d-flex gap flex-wrap"
                      v-if="event.hasOwnProperty('attachments') && event.attachments.length > 0"
                    >
                      <!-- list of attachments  -->
                      <v-chip
                        close
                        @click:close="removeAttachment(data._id, index, i)"
                        @click="openDocument(data.url)"
                        small
                        color="primary"
                        v-for="(data, i) in event.attachments"
                        :key="i"
                      >
                        <span class="body-2">{{ data.name | truncateText(30, '..') }}</span>
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col class="text-center d-flex align-center flex-grow-0">
                    <v-col class="vs_custom">
                      <!-- mark as completed -->
                      <v-chip
                        small
                        class="ma-2"
                        outlined
                        rounded
                        color="black"
                        title="Mark as completed"
                        :disabled="!visaProcessLoading[index] || stepCompleteLoading[index]"
                        v-if="event.complete_condition.toLowerCase() == 'anytime' && event.process_status != 'completed'"
                        @click="
                          completeStep(visaProcessDetails, index, {
                            actions: event.actions,
                            id: visaProcessDetails._id,
                            attachments: event.attachments
                          })
                        "
                      >
                        <v-progress-circular
                          indeterminate
                          v-if="stepCompleteLoading[index]"
                          style="width: 8px !important"
                          color="green"
                        />
                        <span class="chip__custom" v-else>Complete</span>
                      </v-chip>
                      <!-- mark as completed -->
                      <v-chip
                        class="ma-2"
                        outlined
                        rounded
                        small
                        title="Mark as completed"
                        color="black"
                        :disabled="!visaProcessLoading[index] || stepCompleteLoading[index]"
                        v-else-if="event.process_status == 'progress' && event.status != 'completed'"
                        @click="
                          updateEvent(visaProcessDetails, index, event.attachments, {
                            actions: event.actions,
                            id: visaProcessDetails._id,
                            attachments: event.attachments
                          })
                        "
                      >
                        <v-progress-circular
                          indeterminate
                          v-if="stepCompleteLoading[index]"
                          style="width: 8px !important"
                          color="green"
                        />
                        <span class="chip__custom" v-else>Complete </span>
                      </v-chip>
                      <v-chip
                        class="ma-2 span_subtext"
                        outlined
                        rounded
                        small
                        color="black"
                        style="border: 1px solid #e2e7f1 !important"
                        disabled
                        v-else-if="event.process_status == 'pending'"
                      >
                        <span class="chip__custom">Not Completed</span>
                      </v-chip>
                    </v-col>

                    <v-btn icon color="purple" @click="uploadFilesForEachProcess(event, visaProcessDetails)">
                      <v-icon>mdi-paperclip</v-icon>
                    </v-btn>

                    <!-- <v-progress-circular
                          v-if="
                            (event.status == 'Inprogress' ||
                              (event.is_flexible &&
                                event.status !== 'Completed')) &&
                            event.isUpdating
                          "
                          indeterminate
                          color="primary"
                        ></v-progress-circular> -->
                  </v-col>
                </v-row>
              </v-timeline-item>
            </v-slide-x-transition>
          </v-timeline>

          <!-- upload files -->

          <DocumentAddition
            @close="uploadDocumentDialog = false"
            :type="'new'"
            @updated="updatedProcess()"
            v-if="uploadDocumentDialog"
            :module="'visa process'"
            :selectedVisaProcess="selectedVisaProcess"
            :foreign_id="selectedVisaProcess._id"
            :identifier="selectedItem.stage_name"
          />

          <!--Send Email-->
          <v-dialog v-model="openEmailDialog" max-width="600px">
            <v-card class="pa-3" style="overflow-x: hidden">
              <v-card-title>{{ customEmailHeading }}</v-card-title>
              <v-divider />
              <v-card-text class="pt-3">
                <p class="mb-3 font-weight-bold">
                  <v-icon color="pink" class="mt-n1" size="20"> fa-sharp fa-regular fa-envelope </v-icon>
                  &nbsp;{{ selectedUser.email }}
                </p>
                <p class="mb-1 caption primary--text">Cc</p>
                <v-text-field outlined dense v-model="cc" placeholder="Enter Email Body" />
                <p class="mb-1 caption primary--text">Subject</p>
                <v-text-field outlined dense v-model="subject" placeholder="Enter Email Body" />
                <p class="mb-1 caption primary--text">Email Body</p>
                <v-textarea auto-grow rows="4" outlined dense v-model="body" placeholder="Enter Email Body" />
              </v-card-text>
              <v-alert border="right" colored-border type="error" elevation="2" v-if="selectedUser.email == ''">
                Email ID not found. Please update the user email ID to use this functionality.
              </v-alert>
              <p class="text-right">
                <v-btn text @click="sendEmail()" class="green--text text--darken-3" dark :disabled="selectedUser.email == ''">
                  Send Email
                </v-btn>
              </p>
            </v-card>
          </v-dialog>

          <!-- Open SMS -->
          <v-dialog v-model="openSMSDialog" max-width="600px">
            <v-card class="pa-3" style="overflow-x: hidden">
              <v-card-title>Send SMS to Candidate</v-card-title>
              <v-card-text class="pt-3">
                <p class="mb-3">
                  <v-icon color="pink" class="mt-n2" size="20"> fa-light fa-phone </v-icon>&emsp;{{
                    selectedUser.personal?.phone
                  }}
                </p>
                <p class="mb-1 caption primary--text">Message Content</p>
                <v-textarea
                  auto-grow
                  rows="4"
                  outlined
                  dense
                  v-model="msgContent"
                  placeholder="Enter SMS Body"
                  maxlength="140"
                  :rules="msgLength"
                  hint="Limit to 140 Characters"
                  persistent-hint
                />
              </v-card-text>
              <v-alert border="right" colored-border type="error" elevation="2" v-if="selectedUser.contact_number == ''">
                Phone Number not found. Please update the user contact number to use this functionality.
              </v-alert>
              <p class="text-right">
                <v-btn
                  text
                  @click="sendSMS()"
                  class="green--text text--darken-3"
                  dark
                  :disabled="selectedUser.contact_number == ''"
                >
                  Send SMS
                </v-btn>
              </p>
            </v-card>
          </v-dialog>

          <!-- Snack -->
          <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}
            <template #action="{ attrs }">
              <v-btn v-bind="attrs" text @click="snack = false" small>
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
          </v-snackbar>
        </v-card>

        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
        <!-- visa process timeline -->
      </v-col>
    </v-row>

    <!-- custom email dialog -->
    <v-dialog v-model="dialog_custom_mail" transition="dialog-bottom-transition" persistent max-width="900">
      <v-card class="pa-2 rounded-lg vs_custom" style="overflow-x: hidden">
        <v-row>
          <v-col cols="6" sm="6" class="pb-2">
            <v-card-title class="py-0">
              <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
              <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">
                {{ !dialog_custom_content ? 'Preview Email' : 'Send Custom Email' }}
              </span>
            </v-card-title>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row justify="center" class="px-5 mt-2">
          <v-col cols="12" class="pb-2">
            <v-card-text v-if="dialog_custom_content">
              <!-- <v-card-title class="text-h6 purple--text d-flex justify-space-between text--darken-3 pl-0">
                <h2 class="font-weight-bold">
                  Custom Notification Templates
                </h2>
                <v-btn elevation="0" color="red" rounded class="ma-2 white--text" @click="clearGenericNotification()">
                  close
                  <v-icon right dark>
                    mdi-close-circle
                  </v-icon>
                </v-btn>
              </v-card-title> -->
              <v-row>
                <v-col cols="2" sm="6" md="6" class="pb-0 pl-0 pt-5">
                  <span class="mb-0 blue-grey--text font-weight-light justify-center"> Please select the Email template </span>
                </v-col>
                <v-col cols="2" sm="6" md="6" class="pb-0 pl-0">
                  <v-select
                    v-model="selectedEmailTemplate"
                    :items="emailTemplates"
                    item-text="name"
                    item-value="_id"
                    :rules="[rules.required]"
                    outlined
                    background-color="#fff"
                    return-object
                    @change="previewEmailTemplate"
                  />
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-text v-if="dialog_custom_temp">
              <!-- remove this<v-card-title class="text-h6 purple--text text--darken-3">Notification Template</v-card-title> -->
              <!-- <h3 class="primary--text">
                Preview Email
              </h3>
              <v-divider class="my-2" /> -->
              <!-- to -->
              <div class="d-flex align-center">
                <h4 class="body-1 blue-grey--text">To: &emsp;</h4>
                <p v-for="(emailTo, index) in activeEmailTemplate.to" :key="index">
                  <v-icon color="purple" small> mdi-email-outline </v-icon>
                  &nbsp;{{ emailTo }}
                </p>
              </div>
              <!-- cc -->
              <div class="d-flex align-center">
                <h4 class="body-1 blue-grey--text font-weight-bold">Cc:&emsp;</h4>
                <template v-if="activeEmailTemplate.cc">
                  <p v-for="(emailTo, index) in activeEmailTemplate.cc" :key="index">
                    <v-icon color="purple" small> mdi-email-outline </v-icon>
                    &nbsp;{{ emailTo }}
                  </p>
                </template>
              </div>
              <!-- subject -->
              <div class="d-flex align-center">
                <h4 class="body-1 blue-grey--text">Subject:&nbsp;</h4>
                <p class="font-weight-light">
                  {{ activeEmailTemplate.subject }}
                </p>
              </div>

              <div class="blue-grey--text">
                <h4 class="body-1 font-weight-bold">Body:</h4>
                &nbsp;
                <p class="caption" v-html="activeEmailTemplate.content" />
              </div>
            </v-card-text>
            <v-card-actions class="justify-end px-5 pt-4">
              <v-spacer />
              <v-btn elevation="0" text color="primary" rounded class="ma-2" @click="clearGenericNotification()"> close </v-btn>
              <v-btn color="primary" outlined @click="sendCustomEmail()"> Send </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- Employee Details -->
    <template v-if="visaProcessDetails != undefined && userDetails != false">
      <v-navigation-drawer v-model="userDetails" temporary right app width="800">
        <EmployeeInformationDrawer @onCloseDrawer="userDetails = false" :employee-id="visaProcessTimelineData.user_id" />
      </v-navigation-drawer>
    </template>

    <!-- message dialogue -->

    <v-dialog v-model="commentBox" persistent max-width="600px">
      <v-card class="vs_custom">
        <v-card-title>
          <!-- <div class="d-flex justify-space-between">
            <div class="text-left">
              Please type your comment
            </div>
          </div> -->
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="commentBox = false"> close </v-btn>
          <v-btn color="primary" @click="showCommentDialog"> Add Comment </v-btn>
        </v-card-title>
        <v-card-text>
          <v-container class="pa-0">
            <v-row class="ma-0">
              <!-- <v-col cols="12" sm="12" md="12" class="docs_upload">
                <div class="mentionable-wrapper">
                  <Mentionable :keys="['@']" :items="mentionableUsers" offset="6" id="vs_custom" filtering-disabled
                    @open="loadMentionableUsers()" @search="loadMentionableUsers($event)" :isLoading="true">
                    <v-textarea v-model="comment" @keyup.enter="updateMentionedUsers" @change="updateMentionedUsers"
                      required placeholder="Enter text and then type @ to trigger the mention">
                      <template #label>
                        <div>Comment <small class="error--text">*</small></div>
                      </template>
                    </v-textarea>

                    <template #item-@="{ item }">
                      <div class="mentioned_users_item">
                        <img class="vs_avatar" :src="item.image_url">
                        <div class="mentioned_users_item_content">
                          <h4>{{ `${item.first_name} ${item.last_name}` }}</h4>
                          <p>{{ item.email }}</p>
                        </div>
                      </div>
                    </template>

                    <template #no-result>
                      {{ loadingMentionableUsers ? 'Loading...' : 'No result' }}
                    </template>
                  </Mentionable>
                </div>
                <small class="red--text">*indicates required field</small>
              </v-col> -->
              <v-col cols="12" sm="12" md="12" class="pb-0 comment_section">
                <div v-if="visaProcessDetails.hasOwnProperty('processes')">
                  <p class="mb-2 blue-grey--text font-weight-bold">Previous Comments</p>
                  <v-list two-line>
                    <VisaCommentCard
                      v-for="(cdata, cindex) in selectedVisaProcess.comments"
                      :key="cindex"
                      :comment="cdata"
                      @click:edit="showCommentDialog($event, 'edit')"
                      @click:delete="showCommentDialog($event, 'delete')"
                    />
                  </v-list>
                </div>
                <div v-else>You have no comments</div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <!-- <v-card-actions>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="
              ; (comment = ''), (commentBox = false), (mentionedUsers = [])
            ">
            Close
          </v-btn>
          <v-btn class="pa-3 px-4" color="primary grey--text text--lighten-4" rounded :loading="loadingSaveComment"
            x-small elevation="0" @click="addComment()" :disabled="comment === '' || comment === null">
            <v-icon x-small>
              mdi-send
            </v-icon>
            <span class="body-2">Save</span>
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="emiratesBiometricDateTimeTaken.show"
      class="ma-0 pa-0 mr-2"
      content-class="proposal_dialog"
      max-width="600"
      height="120vh"
      scrollable
    >
      <v-sheet color="white " class="pa-5 d-flex justify-end">
        <div class="pa-0">
          <RenderForm :is-visa-process="true" :form="this.selectedForm" @changeDetection="updateForm" />
          <div class="d-flex justify-end">
            <v-btn color="primary" elevation="0" class="my-4" @click="saveBiometricDateTime"> Submit </v-btn>
          </div>
        </div>
      </v-sheet>
    </v-dialog>

    <v-dialog v-model="comment_config.show" class="ma-0 pa-0 mr-2 mention-dialog-container" max-width="500">
      <!-- <v-sheet color="white " class="pa-5 d-flex justify-end"> -->
      <v-card class="mention-card-container">
        <v-card-title class="text-h5 grey lighten-2"> Add Comment </v-card-title>
        <v-card-text>
          <div class="mentionable-wrapper mention-wrapper-enhanced">
            <!-- Custom mention implementation with portal -->
            <div class="mention-input-container tw-relative">
              <v-textarea
                ref="commentTextarea"
                v-model="comment"
                @input="handleCommentInput"
                @keydown="handleKeydown"
                @click="handleTextareaClick"
                required
                placeholder="Enter text and then type @ to trigger the mention"
              >
                <template #label>
                  <div>Comment <small class="error--text">*</small></div>
                </template>
              </v-textarea>

              <!-- Portal for mention dropdown - rendered at document body level -->
              <div
                v-if="showMentionDropdown"
                ref="mentionDropdown"
                class="mention-dropdown-portal tw-fixed tw-z-50 tw-bg-white tw-border tw-border-gray-300 tw-rounded tw-shadow-lg tw-max-h-48 tw-overflow-y-auto"
                :style="dropdownPosition"
              >
                <template v-if="loadingMentionableUsers">
                  <div class="tw-p-3 tw-text-center tw-text-gray-500">Loading...</div>
                </template>
                <template v-else-if="filteredMentionableUsers && filteredMentionableUsers.length === 0">
                  <div class="tw-p-3 tw-text-center tw-text-gray-500">No users found</div>
                </template>
                <template v-else>
                  <div v-for="(user, index) in filteredMentionableUsers || []" :key="user._id" :class="['tw-p-3 tw-cursor-pointer tw-border-b tw-border-gray-100 tw-flex tw-items-center tw-hover:bg-gray-50', { 'tw-bg-blue-50': selectedMentionIndex === index }]" @click="selectMention(user)" @mouseenter="selectedMentionIndex = index">
                    <img :src="user.image_url" :alt="user.first_name" class="tw-w-8 tw-h-8 tw-rounded-full tw-mr-3" onerror="this.style.display='none'" />
                    <div>
                      <div class="tw-font-medium tw-text-sm">{{ user.first_name }} {{ user.last_name }}</div>
                      <div class="tw-text-xs tw-text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            color="grey darken-1"
            class="mr-2"
            @click="closeCommentDialog"
            aria-label="Close comment dialog"
          >
            <v-icon left small>mdi-close</v-icon>
            Close
          </v-btn>
          <v-btn
            color="primary"
            class="px-5 font-weight-bold"
            :loading="comment_config.loading"
            :disabled="comment_config.loading || comment == '' || comment == null"
            @click="processComment"
            aria-label="Save comment"
          >
            <v-icon left small>mdi-check-circle</v-icon>
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
      <!-- </v-sheet> -->
    </v-dialog>

    <!-- delete comment confirmation -->
    <v-dialog v-model="comment_config.delete" class="ma-0 pa-0 mr-2" max-width="500">
      <v-card>
        <v-row>
          <v-col cols="6" sm="6" class="pb-2">
            <v-card-title class="py-0">
              <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
              <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize"> Delete Comment</span>
            </v-card-title>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row justify="center" class="px-5 mt-2">
          <v-col cols="12" class="pb-2">
            <v-card-text>Please Confirm you want to delete comment. This action cannot be undone</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="closeCommentDialog"> cancel </v-btn>
              <v-btn
                color="red"
                outlined
                :loading="comment_config.loading"
                :disabled="comment_config.loading"
                @click="deleteComment"
              >
                Proceed
              </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- Cancel Visa Process Dialog -->
    <v-dialog v-model="cancelVisaDialog" max-width="500px" persistent>
      <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
        <v-row>
          <v-col cols="6" sm="6" class="pb-2">
            <v-card-title class="py-0">
              <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
              <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize"> Cancel Visa Process</span>
            </v-card-title>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row justify="center" class="px-5 mt-2">
          <v-col cols="12" class="pb-2">
            <v-card-text>
              <p class="mb-4">Are you sure you want to cancel this visa process? This action cannot be undone.</p>
              <v-textarea
                v-model="cancelReason"
                label="Reason for Cancellation"
                :rules="cancelReasonRules"
                outlined
                auto-grow
                rows="3"
                placeholder="Please provide a detailed reason for cancellation"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="cancelVisaDialog = false" :disabled="isCancellingVisa"> Close </v-btn>
              <v-btn
                color="error"
                outlined
                :loading="isCancellingVisa"
                :disabled="!cancelReason || cancelReason.length < 3"
                @click="cancelVisaProcess"
              >
                Proceed
              </v-btn>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import CalenderSvg from '@/assets/images/icons/calender.svg'
import SendMailDialog from '@/components/ProcessFlow/SendEmail/index.vue'
import SendRawMailDialog from '@/components/ProcessFlow/SendEmail/sendRawEmail.vue'
import ProcessDetails from './ProcessDetails/index.vue'
import DocumentAddition from '@/components/Dialogs/documentAddDialog.vue'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import EmployeeInformationDrawer from '../reuseable/EmployeeInformationDrawer.vue'
import { Mentionable } from 'vue-mention'
import RenderForm from '@/components/ProcessFlow/FillForm/renderForm.vue'
import moment from 'moment'

export default {
  // props: {
  //   visaProcessTimelineData: Object,
  // },
  components: {
    CalenderSvg,
    DocumentAddition,
    SendMailDialog,
    ProcessDetails,
    SendRawMailDialog,
    customerDefaultIcon,
    EmployeeInformationDrawer,
    Mentionable,
    RenderForm
  },
  data() {
    return {
      emiratesBiometricDateTimeTaken: {
        show: false, //only show this form if the user has eid
        finished: false
      },
      visaSponsorType: '',
      selectedForm: null,
      userDetails: false,
      visaProcessTimelineData: null,
      sendEmailDialog: false,
      sendRawEmailDialog: false,
      limit: '10',
      page: 0,
      visaProcessDetails: {},
      selectedItem: {},
      selectedVisaProcess: {},
      uploadDocumentDialog: false,
      uploadFile: '',
      dragging: false,
      file: '',
      uploadFiles: '',
      filename_attach: [],
      link_url: '',
      link_filename: '',
      attachFiles: {
        uploadDoc: {},
        ecard: {}
      },
      uploading: false,
      snack: false,
      snackText: '',
      snackColor: '',
      documentObj: {
        documents: [],
        type: 'Visa Process',
        identifier: '',
        foreign_id: '',
        doc_status: '',
        expiry: '',
        module: 'visa process'
      },
      main_rule: [v => !!v || 'This filed is required'],
      exp_date_menu: false,
      loading: false,
      documentStatusList: [],
      openEmailDialog: false,
      customEmailHeading: 'Send Email to Candidate',
      selectedUser: {},
      cc: [],
      body: '',
      subject: '',
      to: [],
      openSMSDialog: false,
      msgLength: [v => v.length < 140 || 'Please enter less than 140 digits'],
      msgContent: '',
      documentsList: [],
      visaProcessLoading: [],
      emailBody: {},
      emailAttachments: [],
      documentTypesList: [],
      stepCompleteLoading: {},
      automateEmail: false,
      rules: {
        required: value => !!value || 'This field is required.'
      },
      emailTemplates: [],
      activeEmailTemplate: null,
      dialog_custom_mail: false,
      dialog_custom_temp: false,
      dialog_custom_content: false,
      manualEmailBody: {
        email: '',
        subjectMsg: '',
        eMessage: ''
      },
      loadingMail: false,
      selectedEmailTemplate: null,
      comment: '',
      commentBox: false,
      loadingMentionableUsers: false,
      mentionableUsers: [],
      mentionedUsers: [],
      typeTimeout: null,
      loadingSaveComment: false,
      fillformId: null,
      comment_config: { show: false, loading: false, edit: false, comment: {}, delete: false },
      cancelVisaDialog: false,
      cancelReason: '',
      isCancellingVisa: false,
      cancelReasonRules: [v => !!v || 'Reason is required', v => v.length >= 3 || 'Reason must be at least 3 characters'],
      // Custom mention implementation properties
      showMentionDropdown: false,
      selectedMentionIndex: -1,
      mentionSearch: '',
      mentionStartPosition: -1,
      dropdownPosition: {
        top: '0px',
        left: '0px'
      }
    }
  },
  watch: {
    // Watch for comment dialog state changes
    'comment_config.show'(newVal) {
      if (newVal) {
        // Dialog opened, fix z-index after a short delay
        this.$nextTick(() => {
          setTimeout(() => {
            this.fixMentionDropdownZIndex()
          }, 150)
        })
      }
    },

    // Watch for comment text changes to trigger mention detection
    comment(newVal, oldVal) {
      if (newVal !== oldVal && this.comment_config.show) {
        // Trigger mention detection when comment text changes
        this.handleCommentInput()
      }
    }
  },
  mounted() {
    this.$nuxt.$on('VisaProcessListClicked', visaProcessTimelineData => {
      // if (val) {
      this.visaProcessTimelineData = visaProcessTimelineData
      this.getDocumentsTypeList()
      if (this.visaProcessTimelineData) {
        this.getVisaProcessDetails(this.visaProcessTimelineData._id)
      }
      this.getDocumentStatusList()
      // console.log(this.visaProcessTimelineData, '-----------------this.visaProcessTimelineDa ta')
      // }
    })

    // Fix mention dropdown z-index after component mount
    this.$nextTick(() => {
      this.fixMentionDropdownZIndex()
    })

    // Add click listener to close mention dropdown when clicking outside
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeDestroy() {
    this.$nuxt.$off('VisaProcessListClicked')
    document.removeEventListener('click', this.handleOutsideClick)
    clearTimeout(this.typeTimeout)
  },
  methods: {
    refreshEmployeeListing() {
      this.$nuxt.$emit('update-process-list')
    },
    showCancelVisaDialog() {
      this.cancelVisaDialog = true
      this.cancelReason = ''
    },
    showNotification(message, success = true) {
      this.snack = true
      this.snackText = message
      this.snackColor = success ? 'success' : 'error'
    },
    async cancelVisaProcess() {
      if (!this.cancelReason) {
        this.snack = true
        this.snackText = 'Please provide a reason for cancellation'
        this.snackColor = 'error'
        return
      }

      this.isCancellingVisa = true
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        await this.$axios.$put(
          `/visaprocess/mark/unsuccessful`,
          {
            reason_for_unsuccessful: this.cancelReason,
            visa_id: this.visaProcessDetails?._id,
            process_type: this.visaProcessDetails?.process_type
          },
          { headers: { Authorization: AuthStr } }
        )

        this.showNotification('Visa process has been cancelled successfully', true)

        this.cancelVisaDialog = false
        await this.getVisaProcessDetails(this.visaProcessDetails._id)
        this.refreshEmployeeListing()
      } catch (error) {
        console.error('Error cancelling visa process:', error)
        this.showNotification(`Failed to cancel visa process: ${error.response?.data?.message || error.message}`, false)
      } finally {
        this.isCancellingVisa = false
      }
    },
    async getDocumentsTypeList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/documenttypes`, { headers: { Authorization: AuthStr } }).then(response => {
        this.documentTypesList = _.orderBy(response, ['name'])
      })
    },
    updateForm(event) {
      this.selectedForm = event
    },
    showCommentDialog(comment = {}, action = 'add') {
      this.comment = ''
      // Reset mention state
      this.showMentionDropdown = false
      this.selectedMentionIndex = -1
      this.mentionSearch = ''
      this.mentionStartPosition = -1
      this.mentionedUsers = []

      if (action == 'delete') {
        this.comment_config.delete = true
        this.comment_config.comment = comment
        return
      }
      this.comment_config.show = true
      if (action == 'edit') {
        this.comment_config.comment = comment
        this.comment_config.edit = true
        // update the comment text
        this.comment = comment.text
      }

      // Fix z-index when comment dialog opens and preload users
      this.$nextTick(() => {
        this.fixMentionDropdownZIndex()
        this.loadMentionableUsersDebounced() // Preload users for better UX
      })
    },
    closeCommentDialog() {
      this.comment_config = {
        show: false,
        comment: {},
        edit: false,
        delete: false,
        loading: false
      }
      // Clean up mention state
      this.showMentionDropdown = false
      this.selectedMentionIndex = -1
      this.mentionSearch = ''
      this.mentionStartPosition = -1
      this.mentionedUsers = []
    },
    async saveBiometricDateTime() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.emiratesBiometricDateTimeTaken.finished = true

      let response = await this.$axios
        .$patch(`/form/fillform?_id=${this.fillformId}&foreign_id=${this.visaProcessDetails.foreign_id}`, this.selectedForm, {
          headers: { Authorization: AuthStr }
        })
        .catch(error => {
          throw new Error(error)
        })

      this.emiratesBiometricDateTimeTaken.show = false
    },
    /**
     * Fix mention dropdown z-index to ensure it appears above dialog elements
     * This method runs programmatically to catch any dropdowns that CSS might miss
     */
    fixMentionDropdownZIndex() {
      // Use multiple timeouts to catch dropdowns that appear at different times
      const timeouts = [50, 100, 200, 300, 500]

      timeouts.forEach(delay => {
        setTimeout(() => {
          const selectors = [
            '.vue-mention-dropdown',
            '.v-mentions',
            '.v-mentions__menu',
            '.mention-dropdown',
            '.mention-list',
            '.floating-vue__popper',
            '.v-popper__popper',
            '[data-mention]',
            '[data-mentionable]',
            '.mentionable-dropdown',
            '.v-overlay .v-overlay__content',
            '.v-menu__content'
          ]

          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector)
            elements.forEach(el => {
              if (el && el.offsetParent !== null) { // Check if element is visible
                el.style.zIndex = '10000'
                el.style.position = 'fixed'

                // Also fix any child elements
                const children = el.querySelectorAll('*')
                children.forEach(child => {
                  if (child.classList.contains('mention') ||
                      child.classList.contains('mentionable') ||
                      child.getAttribute('data-mention') ||
                      child.getAttribute('data-mentionable')) {
                    child.style.zIndex = '10001'
                  }
                })

                // Ensure parent containers don't interfere
                let parent = el.parentElement
                let maxDepth = 5 // Limit depth to avoid infinite loops
                while (parent && parent !== document.body && maxDepth > 0) {
                  const computedStyle = window.getComputedStyle(parent)
                  if (computedStyle.position === 'relative' && computedStyle.zIndex !== 'auto') {
                    parent.style.zIndex = 'auto'
                  }
                  if (computedStyle.overflow === 'hidden') {
                    parent.style.overflow = 'visible'
                  }
                  parent = parent.parentElement
                  maxDepth--
                }
              }
            })
          })

          // Special handling for dynamically created dropdowns
          const dialogElements = document.querySelectorAll('.v-dialog')
          dialogElements.forEach(dialog => {
            dialog.style.overflow = 'visible'
            const mentionElements = dialog.querySelectorAll('[class*="mention"]')
            mentionElements.forEach(el => {
              el.style.zIndex = '10000'
            })
          })

        }, delay)
      })
    },
    async processComment() {
      if (this.comment_config.edit) {
        await this.updateComment()
      } else {
        await this.addComment()
      }
      this.syncComments()
    },
    syncComments() {
      const processUpdated = this.visaProcessDetails.processes.find(process => process._id == this.selectedVisaProcess._id)
      this.selectedVisaProcess = processUpdated
    },
    async updateComment() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.comment_config.loading = true
      try {
        const response = await this.$axios.$put(
          `visaprocess/comments/${this.visaProcessDetails._id}/${this.selectedVisaProcess._id}/${this.comment_config.comment._id}`,
          {
            text: this.comment,
            mentionedUsers: this.mentionedUsers ? this.mentionedUsers.map(it => it._id) : []
          },
          { headers: { Authorization: AuthStr } }
        )
        this.showNotification('Comment updated successfully', true)
        this.comment_config.show = false
        this.$set(this, 'visaProcessDetails', response)
      } catch (error) {
        console.error(error.message)
        this.showNotification(`Failed to update comment ${error.response?.data?.message || error.message}`, true)
      } finally {
        this.closeCommentDialog()
      }
    },
    async deleteComment() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.comment_config.loading = true
      try {
        const response = await this.$axios.$delete(
          `visaprocess/comments/${this.visaProcessDetails._id}/${this.selectedVisaProcess._id}/${this.comment_config.comment._id}`,
          { headers: { Authorization: AuthStr } }
        )
        this.snack = true
        this.snackText = 'Comment deleted successfully'
        this.snackColor = 'success'
        this.comment_config.show = false
        this.$set(this, 'visaProcessDetails', response)

        this.syncComments()
      } catch (error) {
        this.snack = true
        this.snackText = 'Failed to delete comment'
        this.snackColor = 'error'
      } finally {
        this.closeCommentDialog()
      }
    },
    async fetchDocuments() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        // Get onboardings so as to get fillform id
        const response = await this.$axios.$get(`/documents?foreign_id=${this.visaProcessDetails._id}`, {
          headers: { Authorization: AuthStr }
        })
        return response
      } catch (error) {
        console.log(error)
        return []
      }
    },

    async getFillFormDetails() {
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        // Get onboardings so as to get fillform id
        const response = await this.$axios.$get(
          `onboardings/userid/${this.visaProcessDetails.user_id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )

        this.fillformId = response?.[0]?.processes
          .find(process => process?.stage_name?.toLowerCase().includes('invoice'))
          ?.actions?.find(action => action?.button?.toLowerCase().includes('review'))?.template_id

        if (this.fillformId) {
          const formResponse = await this.$axios.$get(
            `form/fillform?_id=${this.fillformId}&foreign_id=${this.visaProcessDetails.foreign_id}`,
            {},
            { headers: { Authorization: AuthStr } }
          )

          this.selectedForm = this.filterDateTimeFields(this.formatDates(formResponse.data))
        }
      } catch (error) {
        console.log(error)
      }
    },

    getDocumentType(id) {
      let type = this.documentTypesList.filter(a => a._id == id)
      if (type.length > 0) {
        return type[0].name
      } else {
        return ''
      }
    },
    closeDialogs() {
      this.sendEmailDialog = false
      this.sendRawEmailDialog = false
      this.emailAttachments = []
    },
    convertDateFormat(dateTimeString) {
      const date = new Date(dateTimeString)

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = monthNames[date.getMonth()]
      const day = date.getDate()
      const year = date.getFullYear()

      return `${month} ${day} ${year}`
    },
    async getVisaProcessDetails(id) {
      this.page = 1
      this.visaProcessLoading = []
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/visaprocess/id/${id}`, { headers: { Authorization: AuthStr } }).then(async response => {
        this.visaProcessDetails = response
        await this.getFillFormDetails()
        console.log('fetched documents')
        const all_documents = await this.fetchDocuments()

        this.mapProcessesAndDocuments(all_documents)
      })

      await this.$axios
        .get(`/users/${this.visaProcessDetails.user_id}`, { headers: { Authorization: AuthStr } })
        .then(response => {
          // Ensure response data is available
          if (response && response.data && response.data.employment) {
            this.visaSponsorType = response.data.employment.visa_sponsor_type
            console.log(this.visaSponsorType, 'this is the sponsor')
          } else {
            console.error('Employment data is not available in the response')
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error)
        })
    },
    mapProcessesAndDocuments(all_documents) {
      for (let i = 0; i < this.visaProcessDetails.processes.length; i++) {
        const element = this.visaProcessDetails.processes[i]
        element.attachments = []

        let obj = {
          foreign_id: this.visaProcessDetails._id,
          identifier: element.stage_name
        }

        this.documentsList = all_documents.filter(doc => {
          return doc.foreign_id === obj.foreign_id && doc.identifier === obj.identifier
        })

        if (this.documentsList.length > 0) {
          this.documentsList.forEach(item => {
            element.attachments.push(item)
          })
        }
        this.visaProcessLoading.splice(i, 1, true)
        // console.log(this.documentsList, '------document Found')
      }
    },
    async updateEvent(obj, index, attachmentArray, emailObj) {
      console.log('updating event')
      this.stepCompleteLoading[index] = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let attachmentObj = {
        foreign_id: obj._id,
        identifier: obj.processes[index].stage_name
      }

      console.log("the first condition", attachmentObj)
      console.log(attachmentObj.identifier.toLowerCase(), "the lower case verion of it")
      // pop up fill form to capture biometric date and time if emirates id application is the current stage
      if (
        attachmentObj.identifier.toLowerCase().includes('emirates id application') &&
        !this.emiratesBiometricDateTimeTaken.finished &&
        this.selectedForm
      ) {
        console.log("inside first condition")
        this.emiratesBiometricDateTimeTaken.show = true
        this.stepCompleteLoading[index] = false
        return
      } else if (
        attachmentObj.identifier.toLowerCase().includes('emirates id application') &&
        this.emiratesBiometricDateTimeTaken.finished
      ) {
        console.log("inside second condition")
        await this.saveBiometricDateTime()
          .then()
          .catch(e => {
            this.snack = true
            this.snackColor = 'error'
            this.snackText = 'An error occured while trying to submit biometric data, try again'
            return
          })
      }

      let attachobj = await this.$axios.$post('/documents/identifier/foreignid', attachmentObj, {
        headers: { Authorization: AuthStr }
      })

      let attachments = attachobj.map(a => a.type)

      if (attachments && obj.processes[index] && obj.processes[index].documents_required.every(r => attachments.includes(r))) {
        await this.getUserEmail(emailObj.actions, emailObj?._id || emailObj?.id ,  emailObj.attachments)
          .then()
          .catch(e => console.error(e))
        await this.$axios
          .$post(`/visaprocess/visa/process/forward/${obj._id}`, {}, { headers: { Authorization: AuthStr } })
          .then(async response => {
            if (response.includes('completed')) {
              const newStatus = this.visaProcessDetails.process_type === 'visa cancellation' ? 'inactive' : 'active'

              await this.$axios
                .$patch(`/users/${obj.user_id}`, { user_status: newStatus }, { headers: { Authorization: AuthStr } })
                .then(res => {})
            }
            this.getVisaProcessDetails(obj._id)
          })
        this.$emit('updateProcess', {})
      } else {
        let missing = obj.processes[index].documents_required.filter(item => !attachments.includes(item))
        missing = missing.map(item => this.getDocumentType(item))
        this.snack = true
        this.snackColor = 'error'
        this.snackText = missing.length > 1 ? `Attach missing Documents - ${missing}` : `Attach missing Document - ${missing}`
      }
      this.stepCompleteLoading[index] = false
    },
    async completeStep(obj, index, emailObj) {
      this.stepCompleteLoading[index] = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let attachmentObj = {
        foreign_id: obj._id,
        identifier: obj.processes[index].stage_name
      }

      // pop up fill form to capture biometric date and time if emirates id application is the current stage
      if (
        attachmentObj.identifier.toLowerCase().includes('emirates id application') &&
        !this.emiratesBiometricDateTimeTaken.finished &&
        this.selectedForm
      ) {
        this.emiratesBiometricDateTimeTaken.show = true
        this.stepCompleteLoading[index] = false
        return
      } else if (
        attachmentObj.identifier.toLowerCase().includes('emirates id application') &&
        this.emiratesBiometricDateTimeTaken.finished
      ) {
        this.saveBiometricDateTime()
          .then()
          .catch(e => {
            this.snack = true
            this.snackColor = 'error'
            this.snackText = 'An error occured while trying to submit biometric data, try again'
            return
          })
      }

      let attachobj = await this.$axios.$post('/documents/identifier/foreignid', attachmentObj, {
        headers: { Authorization: AuthStr }
      })

      let attachments = attachobj.map(a => a.type)
      if (attachments && obj.processes[index] && obj.processes[index].documents_required.every(r => attachments.includes(r))) {
        await this.getUserEmail(emailObj.actions, emailObj?.id || emailObj?._id , emailObj.attachments)
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        await this.$axios
          .$post(`/visaprocess/visa/process/step/complete/${obj._id}`, { index: index }, { headers: { Authorization: AuthStr } })
          .then(async response => {
            if (response.includes('completed')) {
              await this.$axios
                .$patch(`/users/${obj.user_id}`, { user_status: 'active' }, { headers: { Authorization: AuthStr } })
                .then(res => {})
            }
            this.getVisaProcessDetails(obj._id)
          })
        this.$emit('updateProcess', {})
      } else {
        let missing = obj.processes[index].documents_required.filter(item => !attachments.includes(item))
        missing = missing.map(item => this.getDocumentType(item))
        this.snack = true
        this.snackColor = 'error'
        this.snackText = missing.length > 1 ? `Attach missing Documents - ${missing}` : `Attach missing Document - ${missing}`
      }
      this.stepCompleteLoading[index] = false
    },
    uploadFilesForEachProcess(data, visa_process) {
      this.selectedItem = data
      this.selectedVisaProcess = visa_process
      this.uploadDocumentDialog = true
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
      // if(this.uploadFiles) {
      //   this.attachFile();
      // }
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
      if (file.size > 10000000) {
        alert('please check file size is not more than 10 MB.')
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
                filename: this.attachFiles[key][i].name
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
    async updatedProcess() {
      this.page = 1

      this.snack = true
      this.snackColor = 'success'
      this.snackText = 'Successfully Added New Document.'
      this.loading = false
      this.getVisaProcessDetails(this.selectedVisaProcess._id)
      this.selectedVisaProcess = {}
      this.selectedItem = {}
      this.uploadDocumentDialog = false
    },
    openDocument(url) {
      window.open(url)
    },
    deleteDocument(index) {
      this.filename_attach.splice(index, 1)
    },
    async getDocumentStatusList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`/documents/list/status`, {
          headers: { Authorization: AuthStr }
        })
        .then(response => {
          this.documentStatusList = response
        })
    },
    async getUserEmail(actions, process_id, attachments) {
      if (attachments.length > 0) {
        this.emailAttachments = attachments
        let filteractions = actions.filter(a => a.action_type == 'email')
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (filteractions.length > 0) {
          let action = filteractions[0]
          const tpl = await this.$axios.$get(`/email_template/?templateId=${action.template_id}&moduleId=${process_id}`, {
            headers: { Authorization: AuthStr }
          })
          this.emailBody = this.hydrateEmailTemplate(tpl)
          console.log('Fetched email template with attachments (hydrated):', this.emailBody);
          this.sendRawEmailDialog = true
          this.automateEmail = action.automate
        }
      } else {
        let filteractions = actions.filter(a => a.action_type == 'email')
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (filteractions.length > 0) {
          let action = filteractions[0]
          const tpl = await this.$axios.$get(`/email_template/?templateId=${action.template_id}&moduleId=${process_id}`, {
            headers: { Authorization: AuthStr }
          })
          this.emailBody = this.hydrateEmailTemplate(tpl)
          console.log('Fetched email template without attachments (hydrated):', this.emailBody);
          this.sendRawEmailDialog = true
          this.automateEmail = action.automate
        }
      }
    },
    async getUserEmailManual(actions, process_id, attachments) {
      if (attachments.length > 0) {
        this.emailAttachments = attachments
        let filteractions = actions.filter(a => a.action_type == 'email')
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (filteractions.length > 0) {
          let action = filteractions[0]
          const tpl = await this.$axios.$get(`/email_template/?templateId=${action.template_id}&moduleId=${process_id}`, {
            headers: { Authorization: AuthStr }
          })
          this.emailBody = this.hydrateEmailTemplate(tpl)
          this.sendRawEmailDialog = true
          this.automateEmail = false
        }
      } else {
        let filteractions = actions.filter(a => a.action_type == 'email')
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        if (filteractions.length > 0) {
          let action = filteractions[0]
          const tpl = await this.$axios.$get(`/email_template/?templateId=${action.template_id}&moduleId=${process_id}`, {
            headers: { Authorization: AuthStr }
          })
          this.emailBody = this.hydrateEmailTemplate(tpl)
          this.sendRawEmailDialog = true
          this.automateEmail = false
        }
      }
    },
    hydrateEmailTemplate(template) {
      const t = { ...(template || {}) }
      // Normalize recipients
      const normList = val => {
        if (Array.isArray(val)) return val.map(e => (e || '').toString().trim()).filter(Boolean)
        if (typeof val === 'string') return val.split(',').map(e => e.trim()).filter(Boolean)
        return []
      }
      t.to = normList(t.to)
      t.cc = normList(t.cc)
      // Map content/body
      if (!t.content && t.body) t.content = t.body
      if (!t.body && t.content) t.body = t.content
      // Ensure subject
      t.subject = t.subject || t.name || ''
      // Provide from default
      t.from = t.from || 'donotreply@nathanhr.ae'
      return t
    },
    async getUserPhone(user_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/users/${user_id}`, { headers: { Authorization: AuthStr } }).then(response => {
        this.selectedUser = response
      })
    },
    sendCustomEmail() {
      this.to = this.activeEmailTemplate.to
      this.cc = this.activeEmailTemplate.cc
      this.subject = this.activeEmailTemplate.subject
      this.body = this.activeEmailTemplate.content
      this.sendEmail()
    },
    async sendEmail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `/generic/send/email`,
          {
            to: this.to,
            cc: [this.cc],
            subject: this.subject,
            body: this.body
          },
          { headers: { Authorization: AuthStr } }
        )
        .then(res => {
          this.snack = true
          this.snackColor = 'success'
          this.snackText = 'Email Has Been Sent Successfully!'
          this.openEmailDialog = false
          this.to = []
          this.cc = []
          this.subject = ''
          this.body = ''
        })
    },
    getIcon(val) {
      if (val.hasOwnProperty('process_status')) {
        if (val.process_status == 'completed') return 'mdi-check'
        else if (val.process_status == 'pending') return 'mdi-timer-sand'
        else if (val.process_status == 'progress') return 'mdi-exclamation'
        else return 'mdi-close'
      } else {
        if (val.status == 'completed') return 'mdi-check'
        else if (val.status == 'inprogress') return 'mdi-exclamation'
        else return 'mdi-close'
      }
    },
    getIconColor(val) {
      if (val.hasOwnProperty('process_status')) {
        if (val.process_status == 'completed') return 'green'
        else if (val.process_status == 'pending') return 'amber'
        else return 'red'
      } else {
        if (val.status == 'completed') return 'green'
        else if (val.status == 'inprogress') return 'amber'
        else return 'red'
      }
    },
    getIconSize(val) {
      if (val.hasOwnProperty('process_status')) {
        if (val.process_status == 'Inprogress') return false
        else return true
      } else {
        if (val.status == 'Inprogress') return false
        else return true
      }
    },
    clearGenericNotification() {
      this.notif_title = 0
      this.dialog_custom_mail = false
      this.dialog_custom_temp = false
      this.dialog_custom_content = false
      this.manualEmailBody = {
        email: '',
        subjectMsg: '',
        eMessage: ''
      }
    },

    async loadCustomEmail() {
      this.clearGenericNotification()
      this.dialog_custom_mail = true
      this.dialog_custom_content = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      // if(this.manualEmailBody)
      const _emailTemplates = await this.$axios.$get(`/email_template/get/all`, { headers: { Authorization: AuthStr } })

      this.emailTemplates = _emailTemplates.filter(val => val.module.includes('visaprocess'))
    },

    async previewEmailTemplate() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      // if(this.manualEmailBody)
      const _emailTemplates = await this.$axios.$get(`/email_template/id/${this.selectedEmailTemplate._id}`, {
        headers: { Authorization: AuthStr }
      })
      this.activeEmailTemplate = _emailTemplates
      this.dialog_custom_temp = true
    },
    async markCommentsAsRead() {
      try {
        if (!this.hasUnreadComments) return
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios.$put(
          `visaprocess/read/comments/id/${this.selectedVisaProcess._id}/${this.selectedVisaProcess._id}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
      } catch (error) {
        console.error('Error marking comments as read:', error)
      }
    },
    async loadComments(process) {
      // mark all comments as read
      this.selectedVisaProcess = process
      this.commentBox = true
      await this.markCommentsAsRead()
    },

    async fetchUsers(_searchText) {
      try {
        this.loadingMentionableUsers = true

        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        let _userUrl = '/users?page=1&limit=20&comment=true'
        //add search to query params
        _userUrl = _searchText ? `${_userUrl}&search=${_searchText}` : _userUrl
        const _users = await this.$axios.$get(_userUrl, {
          headers: { Authorization: AuthStr }
        })

        this.loadingMentionableUsers = false
        //add value property to the response for vue-mention plugin integration
        const users = Array.isArray(_users) ? _users : []
        return users.map(it => ({
          ...it,
          value: it.email + ' '
        }))
      } catch (error) {
        console.error('Error fetching users:', error)
        this.loadingMentionableUsers = false
        return [] // Return empty array on error
      }
    },

    loadMentionableUsers(searchText = null) {
      //if search is empty and some default users present, use cached users
      if (this.mentionableUsers && this.mentionableUsers.length > 0 && !searchText) return this.mentionedUsers

      clearTimeout(this.typeTimeout)

      // const _searchText = searchText;

      this.typeTimeout = setTimeout(() => {
        ;(async () => {
          this.mentionableUsers = await this.fetchUsers(searchText)
          // Fix z-index after users are loaded and dropdown appears
          this.$nextTick(() => {
            this.fixMentionDropdownZIndex()
          })
        })()
      }, 1000)
    },

    updateMentionedUsers() {
      const reg = /@[\w.-]+@\w+\.\w+/g

      const _mentionedUsers = this.comment
        .split(' ')
        .filter(it => (it.match(reg) ? it.match(reg).map(it => it.substring(1)) : []))

      this.mentionedUsers.push(
        ...this.mentionableUsers.filter(it =>
          _mentionedUsers ? _mentionedUsers.find(itM => it.email == itM.substring(1)) : false
        )
      )

      this.comment = this.comment.replace(reg, matchedEmail => {
        const matchedUserObj = this.mentionableUsers.find(it => it.email === matchedEmail.substring(1))
        return `@${matchedUserObj?.first_name}_${matchedUserObj?.last_name}`
      })
    },

    // Custom mention methods for new implementation
    handleCommentInput(event) {
      try {
        // Handle both direct input events and v-model changes
        const text = this.comment || ''

        // Use a safer method to get cursor position
        let cursorPosition = text.length // Default to end of text

        // Try to get the actual cursor position from textarea if available
        this.$nextTick(() => {
          try {
            const textarea = this.getTextareaElement()
            if (textarea && typeof textarea.selectionStart === 'number') {
              cursorPosition = textarea.selectionStart
            }

            this.processMentionDetection(text, cursorPosition)
          } catch (err) {
            console.warn('Could not get cursor position, using text length:', err)
            this.processMentionDetection(text, cursorPosition)
          }
        })
      } catch (error) {
        console.error('Error in handleCommentInput:', error)
        this.showMentionDropdown = false
        this.selectedMentionIndex = -1
      }
    },

    // Helper method to safely get textarea element
    getTextareaElement() {
      try {
        // Try multiple approaches to get the textarea
        const ref = this.$refs.commentTextarea
        if (!ref) return null

        // For Vuetify v-textarea, try different paths
        if (ref.$refs && ref.$refs.input) {
          return ref.$refs.input
        }

        if (ref.$el && ref.$el.querySelector) {
          const textarea = ref.$el.querySelector('textarea')
          if (textarea) return textarea
        }

        // Direct element check
        if (ref.$el && ref.$el.tagName === 'TEXTAREA') {
          return ref.$el
        }

        return null
      } catch (error) {
        console.warn('Error getting textarea element:', error)
        return null
      }
    },

    // Separate method for mention detection logic
    processMentionDetection(text, cursorPosition) {
      try {
        // Find the last @ symbol before cursor position
        const textBeforeCursor = text.substring(0, cursorPosition)
        const atIndex = textBeforeCursor.lastIndexOf('@')

        if (atIndex !== -1) {
          // Check if @ is at start or preceded by space
          const charBeforeAt = atIndex === 0 ? ' ' : text.charAt(atIndex - 1)

          if (charBeforeAt === ' ' || atIndex === 0) {
            const searchText = textBeforeCursor.substring(atIndex + 1)

            // Only show dropdown if search text doesn't contain spaces
            if (!searchText.includes(' ')) {
              this.mentionSearch = searchText
              this.mentionStartPosition = atIndex
              this.showMentionDropdown = true
              this.selectedMentionIndex = 0

              // Position dropdown
              this.calculateDropdownPosition()

              // Load users if search text is provided
              if (searchText.length > 0) {
                this.loadMentionableUsersDebounced(searchText)
              } else {
                this.loadMentionableUsersDebounced()
              }

              return
            }
          }
        }

        // Hide dropdown if no valid @ mention context
        this.showMentionDropdown = false
        this.selectedMentionIndex = -1
      } catch (error) {
        console.error('Error in processMentionDetection:', error)
        this.showMentionDropdown = false
        this.selectedMentionIndex = -1
      }
    },

    handleKeydown(event) {
      if (!this.showMentionDropdown) return

      const filteredUsers = this.filteredMentionableUsers

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        this.selectedMentionIndex = Math.min(
          this.selectedMentionIndex + 1,
          filteredUsers.length - 1
        )
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0)
      } else if (event.key === 'Enter' && this.selectedMentionIndex >= 0) {
        event.preventDefault()
        const selectedUser = filteredUsers[this.selectedMentionIndex]
        if (selectedUser) {
          this.selectMention(selectedUser)
        }
      } else if (event.key === 'Escape') {
        this.showMentionDropdown = false
        this.selectedMentionIndex = -1
      }
    },

    selectMention(user) {
      try {
        // Get the current cursor position safely
        const textarea = this.getTextareaElement()
        let currentCursorPosition = this.comment.length // Default to end

        if (textarea && typeof textarea.selectionStart === 'number') {
          currentCursorPosition = textarea.selectionStart
        }

        // Replace the @search text with the selected user
        const beforeMention = this.comment.substring(0, this.mentionStartPosition)
        const afterMention = this.comment.substring(currentCursorPosition)
        const mentionText = `@${user.first_name}_${user.last_name} `

        this.comment = beforeMention + mentionText + afterMention

        // Add to mentioned users
        if (!this.mentionedUsers.find(u => u._id === user._id)) {
          this.mentionedUsers.push(user)
        }

        // Hide dropdown
        this.showMentionDropdown = false
        this.selectedMentionIndex = -1

        // Focus back to textarea and position cursor
        this.$nextTick(() => {
          if (textarea) {
            const newCursorPosition = beforeMention.length + mentionText.length
            try {
              textarea.focus()
              if (typeof textarea.setSelectionRange === 'function') {
                textarea.setSelectionRange(newCursorPosition, newCursorPosition)
              }
            } catch (err) {
              console.warn('Could not set cursor position:', err)
            }
          }
        })
      } catch (error) {
        console.error('Error in selectMention:', error)
        // Hide dropdown on error
        this.showMentionDropdown = false
        this.selectedMentionIndex = -1
      }
    },

    handleTextareaClick() {
      // Hide dropdown when clicking elsewhere in textarea
      this.showMentionDropdown = false
      this.selectedMentionIndex = -1
    },

    calculateDropdownPosition() {
      this.$nextTick(() => {
        // Use the helper method to get textarea element safely
        const textarea = this.getTextareaElement()

        if (!textarea) {
          console.warn('Could not find textarea element for dropdown positioning')
          return
        }

        try {
          // Get textarea position and dimensions
          const textareaRect = textarea.getBoundingClientRect()

          // Position dropdown below the textarea
          this.dropdownPosition = {
            top: `${textareaRect.bottom + window.scrollY + 5}px`,
            left: `${textareaRect.left + window.scrollX}px`,
            width: `${Math.max(textareaRect.width, 250)}px`
          }
        } catch (error) {
          console.warn('Error calculating dropdown position:', error)
          // Fallback position
          this.dropdownPosition = {
            top: '300px',
            left: '50px',
            width: '250px'
          }
        }
      })
    },

    // Debounced version of loadMentionableUsers for better performance
    loadMentionableUsersDebounced(searchText = null) {
      clearTimeout(this.typeTimeout)

      this.typeTimeout = setTimeout(async () => {
        try {
          this.loadingMentionableUsers = true
          this.mentionableUsers = await this.fetchUsers(searchText)
        } catch (error) {
          console.error('Error loading mentionable users:', error)
        } finally {
          this.loadingMentionableUsers = false
        }
      }, 300) // Reduced debounce time for better UX
    },

    handleOutsideClick(event) {
      // Close mention dropdown when clicking outside
      if (this.showMentionDropdown) {
        const dropdown = this.$refs.mentionDropdown
        const textareaWrapper = this.$refs.commentTextarea?.$el

        if (dropdown && !dropdown.contains(event.target) &&
            (!textareaWrapper || !textareaWrapper.contains(event.target))) {
          this.showMentionDropdown = false
          this.selectedMentionIndex = -1
        }
      }
    },
    async removeAttachment(id, eventIndex, attachmentIndex) {
      console.log('What am I passing', id)
      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        await this.$axios.$delete(`/documents/${id}`, {
          headers: { Authorization: AuthStr }
        })

        this.visaProcessDetails.processes[eventIndex].attachments.splice(attachmentIndex, 1)

        const element = this.visaProcessDetails.processes[eventIndex]
        const obj = {
          foreign_id: this.visaProcessDetails._id,
          identifier: element.stage_name
        }

        await this.getVisaProcessDetails(this.visaProcessDetails._id)

        console.log('Document removed successfully')
      } catch (error) {
        console.error('Error removing document:', error)

        await this.getVisaProcessDetails(this.visaProcessDetails._id)
      }
    },

    async addComment() {
      this.comment_config.loading = true

      try {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        const _commentUrl = `/visaprocess/id/${this.visaProcessDetails._id}/${this.selectedVisaProcess._id}`

        const _body = {
          text: this.comment,
          mentionedUsers: this.mentionedUsers ? this.mentionedUsers.map(it => it._id) : []
        }
        const response = await this.$axios.$put(_commentUrl, _body, {
          headers: { Authorization: AuthStr }
        })
        this.comment = ''
        this.$set(this, 'visaProcessDetails', response)
        // this.getVisaProcessDetails(this.visaProcessTimelineData._id)
      } catch (error) {
        console.error('Error adding comment:', error)
      } finally {
        this.closeCommentDialog()
      }
    },

    formatDates(obj) {
      if (typeof obj !== 'object' || obj === null) {
        return obj
      }

      return obj
    },

    isFullDateString(str) {
      const parsedDate = moment(str, moment.ISO_8601, true)
      return parsedDate.isValid() && str.includes('-') && str.length >= 10 && !str.match(/^\d{2}:\d{2}$/)
    },

    filterDateTimeFields(originalData) {
      return {
        ...originalData,
        fields: originalData.fields.map(tab => ({
          ...tab,
          header: tab.header
            .map(headerItem => ({
              ...headerItem,
              fields: headerItem.fields.filter(field => {
                return field
              })
            }))
            .filter(headerItem => headerItem.fields.length > 0) // Remove headers with empty fields
        }))
      }
    }
  },
  // watch: {
  //   visaProcessTimelineData(val) {
  //     if (val) {
  //       this.getDocumentsTypeList()
  //       if (
  //         this.visaProcessTimelineData &&
  //         this.visaProcessTimelineData != '' &&
  //         this.visaProcessTimelineData != undefined &&
  //         this.visaProcessTimelineData != {}
  //       ) {
  //         console.log('found timeline data: fetching documents for:  ', this.visaProcessTimelineData._id)
  //         this.getVisaProcessDetails(this.visaProcessTimelineData._id)
  //       }
  //       this.getDocumentStatusList()
  //       // console.log(this.visaProcessTimelineData, '-----------------this.visaProcessTimelineDa ta')
  //     }
  //   }
  // },
  computed: {
    filteredMentionableUsers() {
      if (!this.mentionableUsers || !Array.isArray(this.mentionableUsers)) {
        return [];
      }
      if (!this.mentionSearch) {
        return this.mentionableUsers.slice(0, 10);
      }
      const searchTerm = this.mentionSearch.toLowerCase();
      return this.mentionableUsers
        .filter(user => {
          if (!user || !user.first_name || !user.last_name || !user.email) {
            return false;
          }
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          const email = user.email.toLowerCase();
          return fullName.includes(searchTerm) || email.includes(searchTerm);
        })
        .slice(0, 10);
    },
    completedStyles() {
      return {
        stroke: '#1ad598',
        border: '2px solid #1ad598'
      }
    },
    notCompletedStyles() {
      return {
        stroke: '#E2E7F1',
        border: '2px solid #E2E7F1'
      }
    },
    lineCompletedStyle() {
      return {
        backgroundColor: '#1ad598'
      }
    },
    lineNotCompletedStyle() {
      return {
        backgroundColor: '#E2E7F1'
      }
    },
    hasUnreadComments() {
      if (this.selectedVisaProcess?.comments) {
        const unreadComments = this.selectedVisaProcess.comments.filter(comment => !comment.isRead)
        return unreadComments.length > 0
      }
      return false
    }
  }
}
</script>
<style lang="scss" scoped>
.dropZone {
  width: 220px;
  height: 80px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
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
  height: 75px;
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

.mentionable-wrapper {
  position: relative;
}

.mentionable-dropdown {
  z-index: 9999 !important;
  position: absolute !important;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

#vs_mentionable_custom {
  z-index: 100;
  background: white !important;
}

/* Enhanced z-index fix for mention dropdown - ensures it appears above all dialog elements */
.mention-wrapper-enhanced ::v-deep .vue-mention-dropdown,
.mention-wrapper-enhanced ::v-deep .v-mentions,
.mention-wrapper-enhanced ::v-deep .v-mentions__menu {
  z-index: 10000 !important;
  position: fixed !important;
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  max-height: 200px !important;
  overflow-y: auto !important;
}

.mention-wrapper-enhanced ::v-deep .vue-mention-item,
.mention-wrapper-enhanced ::v-deep .v-mentions__item {
  z-index: 10001 !important;
  background: white !important;
  cursor: pointer !important;
  padding: 8px 12px !important;
  border-bottom: 1px solid #f5f5f5 !important;
}

.mention-wrapper-enhanced ::v-deep .vue-mention-item:hover,
.mention-wrapper-enhanced ::v-deep .v-mentions__item:hover,
.mention-wrapper-enhanced ::v-deep .vue-mention-item.active,
.mention-wrapper-enhanced ::v-deep .v-mentions__item.active {
  background: #f5f5f5 !important;
}

.mention-wrapper-enhanced ::v-deep .vue-mention-item:last-child,
.mention-wrapper-enhanced ::v-deep .v-mentions__item:last-child {
  border-bottom: none !important;
}

/* Global fallback for any mention dropdown that might escape the wrapper */
::v-deep .vue-mention-dropdown,
::v-deep [class*="mention"],
::v-deep [class*="mentionable"] {
  z-index: 10000 !important;
}

/* Ensure dialog doesn't interfere with mention positioning */
.v-dialog .mention-wrapper-enhanced {
  position: relative;
  z-index: 1;
}

/* Target by attribute selectors as backup */
::v-deep [data-mention],
::v-deep [data-mentionable] {
  z-index: 10000 !important;
}

/* Additional comprehensive mention dropdown fixes */
::v-deep .mention-dropdown,
::v-deep .mention-list,
::v-deep .mention-item,
::v-deep .floating-vue__popper,
::v-deep .v-popper__popper,
::v-deep .v-overlay,
::v-deep .v-menu__content {
  z-index: 10000 !important;
}

/* Fix for any dropdown that might be created dynamically */
body ::v-deep .mention-wrapper-enhanced * {
  z-index: inherit !important;
}

/* Ensure mention dropdown is always visible */
.mention-wrapper-enhanced ::v-deep * {
  pointer-events: auto !important;
}

/* Force position and z-index for floating elements */
::v-deep .v-overlay--active .mention-wrapper-enhanced,
::v-deep .v-overlay--active [class*="mention"] {
  z-index: 10001 !important;
  position: fixed !important;
}

/* Dialog container specific fixes */
.mention-dialog-container {
  z-index: 9999 !important;
}

.mention-dialog-container ::v-deep .v-dialog {
  z-index: 9999 !important;
  overflow: visible !important;
}

.mention-card-container {
  overflow: visible !important;
  z-index: 9999 !important;
}

.mention-card-container ::v-deep .v-card {
  overflow: visible !important;
}

/* Custom mention dropdown portal styles with Tailwind classes */
.mention-dropdown-portal {
  z-index: 50 !important;
  min-width: 250px;
  max-width: 400px;
}

/* Enhanced Tailwind utility class styles for mention functionality */
.tw-z-50 {
  z-index: 50 !important;
}

.tw-fixed {
  position: fixed !important;
}

.tw-bg-white {
  background-color: white !important;
}

.tw-border {
  border: 1px solid #e5e7eb !important;
}

.tw-border-gray-300 {
  border-color: #d1d5db !important;
}

.tw-rounded {
  border-radius: 0.375rem !important;
}

.tw-shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.tw-max-h-48 {
  max-height: 12rem !important;
}

.tw-overflow-y-auto {
  overflow-y: auto !important;
}

.tw-p-3 {
  padding: 0.75rem !important;
}

.tw-text-center {
  text-align: center !important;
}

.tw-text-gray-500 {
  color: #6b7280 !important;
}

.tw-cursor-pointer {
  cursor: pointer !important;
}

.tw-border-b {
  border-bottom: 1px solid #e5e7eb !important;
}

.tw-border-gray-100 {
  border-color: #f3f4f6 !important;
}

.tw-flex {
  display: flex !important;
}

.tw-items-center {
  align-items: center !important;
}

.tw-hover\:bg-gray-50:hover {
  background-color: #f9fafb !important;
}

.tw-bg-blue-50 {
  background-color: #eff6ff !important;
}

.tw-w-8 {
  width: 2rem !important;
}

.tw-h-8 {
  height: 2rem !important;
}

.tw-rounded-full {
  border-radius: 9999px !important;
}

.tw-mr-3 {
  margin-right: 0.75rem !important;
}

.tw-font-medium {
  font-weight: 500 !important;
}

.tw-text-sm {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

.tw-text-xs {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
}

.tw-relative {
  position: relative !important;
}
</style>
