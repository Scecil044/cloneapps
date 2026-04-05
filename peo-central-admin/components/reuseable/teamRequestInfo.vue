<template>
    <div style="width:100%;max-height:614px" class="mt-1 mx-0 scroll">

        <v-row justify="center" class="mt-1 mx-0">
            <v-col cols="12" class="pt-0" v-if="previewLetter == true">
                <v-row>
                    <v-col class="pa-0" cols="12">
                        <v-btn outlined elevation="0" color="#009966" @click.prevent="previewLetter = !previewLetter"
                            class="rounded-xl body-color-custom grey--text ml-2">Close Preview</v-btn>
                    </v-col>
                </v-row>
                <v-row v-if="letterLoading" style="min-height:100%;align-items:center;justify-content:center;">
                    <v-col cols="auto">
                        <div style="justify-content: center;align-items: center;display: flex;">
                            <v-img src="/animated/refresh.svg" max-width="fit-content" height="40" contain
                                class="mr-3"></v-img>
                        </div>
                        <div style="justify-content: center;align-items: center;display: flex;">
                            <p style="align-items:center;justify-content:center;" class="mb-0 caption grey--text">Generating
                                Preview</p>
                        </div>
                    </v-col>
                </v-row>
                <PreviewLetter v-else :documentName='selectedService.letter_type' :content='selectedService.replacedContent'
                    :_id="selectedService._id" :showdownloadbutton="false" height='620px' @close="previewLetter = false" />
            </v-col>
            <v-col cols="12" class="pt-0" v-else>
                <!-- {{data._id}} -->
                <template v-if="data.hasOwnProperty('leave_type')">

                    <v-tabs id="leave-request-tab" v-model="leaveRequestTab" grow background-color="transparent"
                        class="justify-center darkBlue-heading-text rounded-0 mb-3" @change="onChangeTab($event)">
                        <v-tab style="background-color:#fff;overflow: hidden;" class="mr-2 rounded-xl darkBlue-heading-text"
                            href="#leave-request-details">Request</v-tab>
                        <v-tab style="background-color:#fff;overflow: hidden;" class="mr-2 rounded-xl darkBlue-heading-text"
                            href="#leave-history-summary">History & Summary</v-tab>
                        <v-tab style="background-color:#fff;overflow: hidden;" class="mr-2 rounded-xl darkBlue-heading-text"
                            href="#list-leave-buddy">Leave Buddy</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="leaveRequestTab">
                        <!-- Leave Details -->
                        <v-tab-item id="leave-request-details">
                            <v-row>
                                <v-col cols="12" v-if="requestInfo">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                                    <v-row align="center">
                                        <v-col cols="auto" class="py-0 ">
                                            <v-avatar style="cursor: pointer;" size="40">
                                                <v-img :src="data.user_data.image_url"></v-img>
                                            </v-avatar>
                                        </v-col>
                                        <v-col cols="auto" class="pa-0">
                                            <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                                {{ data.user_data.last_name }}</p>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="5">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Leave Type</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.leave_type
                                    }}</span>
                                </v-col>
                                <v-col cols="7">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Requested on Date</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.date_created
                                        | ticketingDateFormatter }}</span>
                                </v-col>
                                <v-col cols="5">
                                    <p class="grey-heading-text font-weight-medium textFontSize">From Date</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.from_date |
                                        leaveRequestDateFormatter }}</span>
                                </v-col>
                                <v-col cols="7">
                                    <p class="grey-heading-text font-weight-medium textFontSize">To Date</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.to_date |
                                        leaveRequestDateFormatter }}</span>
                                </v-col>
                                <v-col cols="5">
                                    <p class="grey-heading-text font-weight-medium textFontSize">No Of Days</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                                        numberFormat(data.no_of_days) }}</span>
                                </v-col>
                                <v-col cols="7">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Reason</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.reason
                                    }}</span>
                                </v-col>

                                <v-col cols="5">
                                    <span v-if="data.certificate.length > 0">
                                        <v-btn color="#2C42ED5D" small class="rounded-xl" outlined
                                            v-for="(data, index) in data.certificate" :key="index"
                                            @click="openDocumentURL(data.link)">
                                            <v-img src="/hr/attachment.svg" max-width="fit-content" height="fit-content"
                                                class="mr-1" contain></v-img>
                                            File {{ index + 1 }}
                                        </v-btn>
                                    </span>
                                </v-col>
                                <v-col cols="12" class="py-0">
                                    <!-- <p class="grey-heading-text font-weight-normal textFontSize"><i>* including holidays</i></p> -->
                                    <!-- <span class="darkBlue-heading-text font-weight-normal textFontSize">{{data.reason}}</span> -->
                                </v-col>
                            </v-row>
                        </v-tab-item>
                        <!-- History & Summary -->
                        <v-tab-item id="leave-history-summary">
                            <Leaves :leaves="computedLeavesForHistory" :showUnpaid="true" :user='getUserData(data.user_id)'
                                :configData='configData' :user_leaves='user_leaves' />
                            <div v-if="arr_leaves.length > 0" class="scroll" style="max-height : 640px;">
                                <v-list two-line v-if="arr_leaves != []" class="scroll" max-height="500">
                                    <div v-for="(data, index) in arr_leaves" :key="index">


                                        <template>
                                            <v-divider :key="data._id" v-if="index != 0"></v-divider>
                                            <v-list-item class="leaveList pa-0" :style="getStatusBorderColor(data.status)">
                                                <v-list-item-avatar size="40" class="mx-4">
                                                    <v-img :src="getImage(data.user_id)"></v-img>
                                                </v-list-item-avatar>
                                                <v-list-item-content class="py-0" style="max-width:35%">
                                                    <v-list-item-title
                                                        class="pt-0 font-weight-medium textFontSize mb-0 darkBlue-heading-text">
                                                        {{ getUserName(data.user_id) }}
                                                    </v-list-item-title>
                                                    <h5 class="grey-heading-text font-weight-normal text-truncate caption">
                                                        {{ data.from_date | ticketingDateFormatter }} -
                                                        {{ data.to_date | ticketingDateFormatter }}</h5>
                                                </v-list-item-content>
                                                <v-list-item-content class="py-0" style="align-self:start">
                                                    <div>
                                                        <v-chip x-small class="vChipBorderRadius white--text"
                                                            color="#5C7EEF" style="height:20px;font-size: 11px;">{{
                                                                data.leave_type }}</v-chip>
                                                    </div>
                                                </v-list-item-content>

                                                <v-list-item-action class="ma-0">
                                                    <v-list-item-action-text class="caption mt-2 ml-4">
                                                        <v-list-item-action-text
                                                            class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                                                            style="min-width: 90px;">
                                                            <div>
                                                                <div class="d-flex">
                                                                    <v-img src="/hr/calendar-linear.svg"
                                                                        max-width="fit-content" height="fit-content"
                                                                        class="mr-2" contain></v-img>
                                                                    <div style="min-width:45px"
                                                                        class="darkBlue-heading-text">
                                                                        <v-card-text class="mb-0 pa-0 font-weight-medium"
                                                                            style="font-size:18px !important">{{
                                                                                numberFormat(data.no_of_days) }}</v-card-text>
                                                                        <v-card-text
                                                                            class="mb-0 pa-0 textFontSize customLineHeight"
                                                                            v-if="data.no_of_days == 1">day</v-card-text>
                                                                        <v-card-text
                                                                            class="mb-0 pa-0 textFontSize customLineHeight"
                                                                            v-else>days</v-card-text>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </v-list-item-action-text>
                                                    </v-list-item-action-text>
                                                </v-list-item-action>
                                            </v-list-item>
                                        </template>
                                    </div>
                                </v-list>
                                <!-- <Observer  v-if="showScrollObserver" @intersect="getLeave(false, data.user_id)"/> -->
                            </div>
                            <div v-else>No Leave history found!</div>
                        </v-tab-item>
                        <!-- Leave Buddy -->
                        <v-tab-item id="list-leave-buddy">
                            <div class="d-flex justify-center">
                                <v-progress-circular v-if="isRequestingLeaveBuddy" indeterminate color="primary" size="28"
                                    width="3"></v-progress-circular>
                            </div>
                            <v-list two-line v-if="leaveBuddies.length > 0" class="scroll" max-height="500">
                                <div v-for="(data, index) in leaveBuddies" :key="index">


                                    <template>
                                        <v-divider :key="data._id" v-if="index != 0"></v-divider>
                                        <v-list-item class="leaveList pa-0" :style="getStatusBorderColor(data.status)">
                                            <v-list-item-avatar size="40" class="mx-4">
                                                <v-img :src="getImage(data.user_id)"></v-img>
                                            </v-list-item-avatar>
                                            <v-list-item-content class="py-0" style="max-width:35%">
                                                <v-list-item-title
                                                    class="pt-0 font-weight-medium textFontSize mb-0 darkBlue-heading-text">
                                                    {{ getUserName(data.user_id) }}
                                                </v-list-item-title>
                                                <h5 class="grey-heading-text font-weight-normal text-truncate caption">{{
                                                    data.from_date | ticketingDateFormatter }} -
                                                    {{ data.to_date | ticketingDateFormatter }}</h5>
                                            </v-list-item-content>
                                            <v-list-item-content class="py-0" style="align-self:start">
                                                <div>
                                                    <v-chip x-small class="vChipBorderRadius white--text" color="#5C7EEF"
                                                        style="height:20px;font-size: 11px;">{{ data.leave_type }}</v-chip>
                                                </div>
                                            </v-list-item-content>

                                            <v-list-item-action class="ma-0">
                                                <v-list-item-action-text class="caption mt-2 ml-4">
                                                    <v-list-item-action-text
                                                        class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton"
                                                        style="min-width: 90px;">
                                                        <div>
                                                            <div class="d-flex">
                                                                <v-img src="/hr/calendar-linear.svg" max-width="fit-content"
                                                                    height="fit-content" class="mr-2" contain></v-img>
                                                                <div style="min-width:45px" class="darkBlue-heading-text">
                                                                    <v-card-text class="mb-0 pa-0 font-weight-medium"
                                                                        style="font-size:18px !important">{{
                                                                            numberFormat(data.no_of_days) }}</v-card-text>
                                                                    <v-card-text
                                                                        class="mb-0 pa-0 textFontSize customLineHeight"
                                                                        v-if="data.no_of_days == 1">day</v-card-text>
                                                                    <v-card-text
                                                                        class="mb-0 pa-0 textFontSize customLineHeight"
                                                                        v-else>days</v-card-text>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </v-list-item-action-text>
                                                </v-list-item-action-text>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </template>

                                </div>
                            </v-list>
                            <div v-else>
                                <h3 class="pt-1 blue-grey--text font-weight-4">There are no Leave Buddies!</h3>
                            </div>
                        </v-tab-item>
                    </v-tabs-items>
                </template>
                <v-row v-else-if="data.request_type == 'claims'">
                    <v-col cols="12" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <v-row align="center">
                            <v-col cols="auto" class="py-0 ">
                                <v-avatar style="cursor: pointer;" size="40">
                                    <v-img :src="data.user_data.image_url"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                    {{ data.user_data.last_name }}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">Reference Number</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.reference_number
                            || 'No Reference number' }}</span>
                    </v-col>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested For Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.letter_fields.date
                        }}</span>
                    </v-col>
                    <v-col cols="6" class="pb-3">
                        <p class="grey-heading-text font-weight-medium textFontSize"> Application Description</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.description }}</span>
                    </v-col>
                    <template v-if="data.claims?.length">
                        <v-expansion-panels>
                            <v-expansion-panel v-for="(claim, ind) in data.claims" :key="ind">
                                <v-expansion-panel-header v-slot="{ open }">
                                    <v-row no-gutters>
                                        <v-col cols="2">
                                            <div class="px-2 py-1 rounded-circle d-inline-block">{{ ind + 1 }}</div>
                                        </v-col>
                                        <v-col cols="5">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Claim Type</p>
                                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                                                getFormattedText(claim.letter_type)
                                                || '' }}</span>
                                        </v-col>

                                        <v-col cols="5">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Claim Sub Type</p>
                                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                                                getFormattedText(claim.letter_sub_type)
                                                || '' }}</span>
                                        </v-col>

                                        <!-- <v-col cols="3">
                                <p class="grey-heading-text font-weight-medium textFontSize">Amount</p>
                                <span class="darkBlue-heading-text font-weight-normal textFontSize">
                                  {{ claim.details['amount'] || '' }}  {{ claim.currency }}
                                </span>
                              </v-col> -->
                                    </v-row>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <v-row no-gutters>
                                        <v-col cols="6">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Process Mode</p>
                                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                                                claim?.payroll_process
                                                ? 'Through Payroll' : 'Outside Payroll' }}</span>
                                        </v-col>
                                        <template v-for="(value, key) in claim.details">
                                            <v-col cols="6" class="pb-3" v-if="key === 'files'">
                                                <p class="grey-heading-text font-weight-medium textFontSize">Receipts</p>
                                                <span class="darkBlue-heading-text font-weight-normal textFontSize"
                                                    v-if="value.length">
                                                    <v-btn color="#2C42ED5D" small class="rounded-xl mx-1 my-1" outlined
                                                        v-for="(data, i) in value" :key="i"
                                                        @click="openDocumentURL(data.link)">
                                                        <v-img src="/hr/attachment.svg" max-width="fit-content"
                                                            height="fit-content" class="mr-1" contain></v-img>
                                                        File {{ i + 1 }}
                                                    </v-btn>
                                                </span>
                                            </v-col>
                                            <v-col cols="6" class="pb-3"
                                                v-else-if="key === 'approved_business_trip' && value">
                                                <p class="grey-heading-text font-weight-medium textFontSize">
                                                    {{ getFormattedText(key) }}
                                                </p>
                                                <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                                                    value.from_date | ticketingDateFormatter
                                                }}-{{ value.to_date | ticketingDateFormatter }}</span>
                                            </v-col>
                                            <v-col cols="6" class="pb-3" v-else-if="key !== 'approvaldate' && value">
                                                <p class="grey-heading-text font-weight-medium textFontSize">
                                                    {{ getFormattedText(key) }}
                                                </p>
                                                <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ value
                                                }}</span>
                                            </v-col>
                                        </template>
                                    </v-row>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </template>
                </v-row>
                <v-row v-else-if="data.request_type == 'loan'">
                    <v-col cols="12" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <v-row align="center">
                            <v-col cols="auto" class="py-0 ">
                                <v-avatar style="cursor: pointer;" size="40">
                                    <v-img :src="data.user_data.image_url"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                    {{ data.user_data.last_name }}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Loan Type</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.letter_fields.loan_type
                        }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Loan Amount</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.loan_amount
                        }}</span>
                    </v-col>

                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Monthly Payment</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.monthly_payment }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Total Months</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.loan_months }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Description</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.description
                        }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Process Mode</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ getPayroll }}</span>
                    </v-col>
                </v-row>
                <v-row v-else-if="data.request_type == 'education'">
                    <v-col cols="12" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <v-row align="center">
                            <v-col cols="auto" class="py-0 ">
                                <v-avatar style="cursor: pointer;" size="40">
                                    <v-img :src="data.user_data.image_url"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                    {{ data.user_data.last_name }}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Amount</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.education_amount
                        }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Education Start Year</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.education_start_year }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Description</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.description
                        }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Attachments</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize"
                            v-if="data.letter_fields && data.letter_fields.files && data.letter_fields.files.length > 0">
                            <v-btn color="#2C42ED5D" small class="rounded-xl mx-1 my-1" outlined
                                v-for="(data, index) in data.letter_fields.files" :key="index"
                                @click="openDocumentURL(data.link)">
                                <v-img src="/hr/attachment.svg" max-width="fit-content" height="fit-content" class="mr-1"
                                    contain></v-img>
                                File {{ index + 1 }}
                            </v-btn>
                        </span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Process Mode</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ getPayroll }}</span>
                    </v-col>
                </v-row>
                <v-row v-else-if="data.request_type == 'passport release'">
                    <v-col cols="12" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <v-row align="center">
                            <v-col cols="auto" class="py-0 ">
                                <v-avatar style="cursor: pointer;" size="40">
                                    <v-img :src="data.user_data.image_url"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                    {{ data.user_data.last_name }}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Purpose</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.letter_fields.purpose
                        }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Release Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.passport_release_Date }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Return Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.passport_return_Date }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Description</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.description
                        }}</span>
                    </v-col>
                </v-row>
                <v-row v-else-if="data.request_type == 'passport safekeep'">
                    <v-col cols="12" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <v-row align="center">
                            <v-col cols="auto" class="py-0 ">
                                <v-avatar style="cursor: pointer;" size="40">
                                    <v-img :src="data.user_data.image_url"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                    {{ data.user_data.last_name }}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Description</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{
                            data.letter_fields.description
                        }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Status</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.status == 'completed' ?
                            'Submitted' : 'Not submitted' }}</span>
                    </v-col>
                </v-row>
                <v-row v-else-if="data.request_type == 'letters'">
                    <v-col cols="12" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <v-row align="center">
                            <v-col cols="auto" class="py-0 ">
                                <v-avatar style="cursor: pointer;" size="40">
                                    <v-img :src="data.user_data.image_url"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                    {{ data.user_data.last_name }}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Letter Type</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.letter_type }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested On</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.date_created |
                            ticketingDateFormatter }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Letter Category</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">
                            {{ data.letter_sub_type || 'Not Applicable' }}</span>
                    </v-col>

                    <v-col cols="7">
                        <span v-if="data.letter_fields && data.letter_fields.files && data.letter_fields.files.length > 0">
                            <v-btn color="#2C42ED5D" small class="rounded-xl" outlined
                                v-for="(data, index) in data.letter_fields.files" :key="index"
                                @click="openDocumentURL(data.link)">
                                <v-img src="/hr/attachment.svg" max-width="fit-content" height="fit-content" class="mr-1"
                                    contain></v-img>
                                File {{ index + 1 }}
                            </v-btn>
                        </span>
                    </v-col>
                </v-row>
                <v-row v-else-if="data.request_type == 'attendance'">
                    <v-col cols="5" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.user_data.first_name }}
                            {{ data.user_data.last_name }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Request Type</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.letter_type }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested On Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.date_created |
                            ticketingDateFormatter }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested for Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.letter_fields.startTime
                            | ticketingDateFormatter }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Start Time</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize d-flex align-center"
                            style="color:#00CC86 !important">
                            <template v-if="data.letter_fields.hasOwnProperty('prev_startTime')">
                                <template v-if="data.letter_fields.prev_startTime !== null">
                                    {{ data.letter_fields.prev_startTime | time_with_ampm }}
                                </template>
                                <template v-else>No clock in</template>
                                <v-icon color="primary" class="mx-1">mdi-arrow-right</v-icon>
                            </template>
                            {{ data.letter_fields.startTime | time_with_ampm }}
                        </span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">End Time</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize d-flex align-center"
                            style="color:#FA484C !important">
                            <template v-if="data.letter_fields.hasOwnProperty('prev_endTime')">
                                <template v-if="data.letter_fields.prev_endTime !== null">
                                    {{ data.letter_fields.prev_endTime | time_with_ampm }}
                                </template>
                                <template v-else>No clock out</template>
                                <v-icon color="primary" class="mx-1">mdi-arrow-right</v-icon>
                            </template>
                            {{ data.letter_fields.endTime | time_with_ampm }}
                        </span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Reason</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.letter_fields.comments
                        }}</span>
                    </v-col>
                </v-row>
                <v-row v-else-if="data.request_type == 'wfh'">
                    <v-col cols="12" v-if="requestInfo">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <v-row align="center">
                            <v-col cols="auto" class="py-0 ">
                                <v-avatar style="cursor: pointer;" size="40">
                                    <v-img :src="data.user_data.image_url"></v-img>
                                </v-avatar>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <p class="font-weight-normal textFontSize mb-0">{{ data.user_data.first_name }}
                                    {{ data.user_data.last_name }}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">Request Type</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize text-uppercase">{{
                            data.request_type }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested on Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.date_created |
                            ticketingDateFormatter }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">From Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.from_date |
                            leaveRequestDateFormatter }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">To Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.to_date |
                            leaveRequestDateFormatter }}</span>
                    </v-col>
                    <v-col cols="5">
                        <p class="grey-heading-text font-weight-medium textFontSize">No Of Days</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ numberFormat(data.no_of_days)
                        }}</span>
                    </v-col>
                    <v-col cols="7">
                        <p class="grey-heading-text font-weight-medium textFontSize">Reason</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.reason }}</span>
                    </v-col>

                </v-row>
                <v-row v-else-if="!(data.request_type)">
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested By</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ getName(data.createdBy)
                        }}</span>
                    </v-col>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">Employee</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ getName(data.user_id)
                        }}</span>
                    </v-col>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">Effective Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.effective_date |
                            payrollPayprocess }}</span>
                    </v-col>
                    <v-col cols="6">
                        <p class="grey-heading-text font-weight-medium textFontSize">Requested On Date</p>
                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ data.date_created |
                            ticketingDateFormatter }}</span>
                    </v-col>
                    <v-col cols="12">
                        <p class="grey-heading-text font-weight-medium textFontSize">Salary Adjustment Details</p>

                        <v-data-table
                            :headers="[{ text: '', value: 'emptyCol' }, { text: 'Before Salary Adjustment', value: 'olds' }, { text: 'After Salary Adjustment', value: 'news' }, { text: 'Difference', value: 'diff' }, { text: '', value: 'action' }]"
                            :items="compensationAdjustmentComputed(data.old_salary, data.new_salary)"
                            :hide-default-footer="true" multi-sort>
                            <template v-slot:item.emptyCol="{ item }">
                                <span class="font-weight-bold"> {{ item.emptyCol }} </span>
                            </template>
                            <template v-slot:item.diff="{ item }">
                                <span :class="item.diff < 0 ? 'red--text' : 'green--text'"> {{ item.diff }}
                                    ({{ getPercentage(data.old_salary, data.new_salary) }}%) </span>
                            </template>
                            <template v-slot:item.action>
                                <v-tooltip top color="purple">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-icon size="large" v-bind="attrs" v-on="on"
                                            @click="viewSalary = true">mdi-information-outline</v-icon>
                                    </template>
                                    View
                                </v-tooltip>
                            </template>

                        </v-data-table>
                        <!-- <DataTableSalaryAdjustment :oldsalary="data.old_salary"  :newsalary="data.new_salary"></DataTableSalaryAdjustment> -->
                    </v-col>

                </v-row>
            </v-col>
        </v-row>
        <template v-if="leaveRequestTab === 'leave-request-details' && previewLetter != true">
            <v-row>
                <v-divider></v-divider>
            </v-row>
            <v-row class="letterApproval">
                <v-col cols="12" class="d-flex justify-space-between align-center">
                    <h3 class="darkBlue-heading-text textFontSize">Approval Process</h3>
                    <div>
                        <v-btn elevation="0"
                            v-if="!selfService && data.request_type == 'letters' && !(computedServiceList.status.toLowerCase() == 'completed' || computedServiceList.status.toLowerCase() == 'cancelled' || computedServiceList.status.toLowerCase() == 'withdrawn')"
                            x-small fab @click="editLetter = !editLetter" class="primary white--text ml-2"
                            :disabled="computedServiceList && computedServiceList.status ? computedServiceList.status.toLowerCase() == 'withdrawn' : ''"><v-icon>mdi-pencil</v-icon></v-btn>
                        <v-btn outlined elevation="0" v-if="data.request_type == 'letters'" color="#009966"
                            @click.prevent="getLetterPreview(data)"
                            class="rounded-xl body-color-custom grey--text ml-2">Preview</v-btn>
                        <template>
                            <v-tooltip top color="#999999">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn elevation="0" x-small fab
                                        @click.prevent="leaveApplicationLogDialog = !leaveApplicationLogDialog"
                                        class="body-color-custom grey--text ml-2" v-bind="attrs"
                                        v-on="on"><v-icon>mdi-calendar-clock</v-icon></v-btn>
                                </template>
                                <span>Application Logs</span>
                            </v-tooltip>
                        </template>
                    </div>
                </v-col>
                <v-col cols="12" class="my-0 py-0">
                    <v-chip x-small v-if="data.hasOwnProperty('leave_type')" :color="getColor(data.status)"
                        class="rounded-lg" style="height:20px;font-size: 11px;"
                        :style="data.status == ('Processing') || data.status == ('processing') ? 'color:#EAAE00' : data.status == 'Completed' || data.status == 'completed' ? 'color:#0DC98A' : data.status == 'Cancelled' || data.status == 'cancelled' ? 'color:#E5252A' : 'color:#516A81'">{{
                            updateStatus(getLeaveStatus(data)) }}</v-chip>
                    <v-chip x-small v-else :color="getColor(data.status)" class="rounded-lg"
                        style="height:20px;font-size: 11px;"
                        :style="data.status == ('Processing') || data.status == ('processing') ? 'color:#EAAE00' : data.status == 'Completed' || data.status == 'completed' ? 'color:#0DC98A' : data.status == 'Cancelled' || data.status == 'cancelled' ? 'color:#E5252A' : 'color:#516A81'">{{
                            updateStatus(data.status) }}</v-chip>
                </v-col>
                <v-timeline align-top dense :style="{ 'width': '100%' }">
                    <v-timeline-item small v-for="(item, i) in data.approvals" :key="i"
                        :icon="approvalStatusIcon(item.status)" :color="approvalStatusColor(item.status)">
                        <v-row class="pt-0 mx-0" style="max-width:100%">
                            <v-col cols="12" class="pa-0">
                                <v-card elevation="0" class="border-radius-medium">
                                    <v-card-title class="pa-0">
                                        <v-row>
                                            <v-col cols="12" class="pa-0 font-weight-normal fontSize1 ">
                                                <p class="grey-heading-text">{{ item.date_created | textDate }}</p>
                                            </v-col>
                                        </v-row>

                                    </v-card-title>
                                    <v-card-text class="pa-0">
                                        <v-card :color="getColor(item.status)" width="100%" height="auto" elevation="0"
                                            class="rounded-xl pa-6">
                                            <v-row>
                                                <v-col cols="10">
                                                    <p class="font-weight-bold textFontSize ">{{ getName(item.approver_id)
                                                    }}
                                                    </p>
                                                </v-col>
                                                <v-col justify="end" cols="2" v-if="(item.approver_attachment && item.approver_attachment.length > 0 && item.hide_attachment == false
                                                        && userType == 'SELF') || ((item.approver_attachment && item.approver_attachment.length > 0) &&
                                                            (userType == 'ADMIN' || userType == 'MANAGER'))">
                                                    <v-icon
                                                        @click="openDialog(item.approver_attachment)">mdi-paperclip</v-icon>
                                                </v-col>
                                            </v-row>
                                            <v-row align="center">
                                                <v-col cols="auto" class="py-0 ">
                                                    <v-avatar style="cursor: pointer;" size="40">
                                                        <v-img :src="getImage(item.approver_id)"></v-img>
                                                    </v-avatar>
                                                </v-col>
                                                <v-col cols="auto" class="pa-0">
                                                    <p class="font-weight-normal textFontSize mb-0">
                                                        {{ getStatusName(data.status, item.status) }}</p>
                                                </v-col>
                                            </v-row>
                                            <p class="fontWeight300 fontSize1 mb-0 rounded-0" v-if="item.reason">
                                                <template
                                                    v-if="isApprovalCommentIsLong(item.reason) && !item.showApprovalLongComment">{{
                                                        item.reason.slice(0, 200) }}...</template>
                                                <template v-else>{{ item.reason }}</template>
                                            </p>
                                            <p class="fontWeight300 fontSize1 mb-0"
                                                v-else-if="item.comments && typeof item.comments === 'string'">{{
                                                    item.comments }}</p>
                                            <p class="fontWeight300 fontSize1 mb-0" v-else>There are no comments!</p>
                                            <v-btn v-if="isApprovalCommentIsLong(item.reason)" plain small
                                                style="margin-left: -0.75rem;"
                                                @click="item.showApprovalLongComment = !item.showApprovalLongComment">
                                                See {{ !item.showApprovalLongComment ? "more" : "less" }}
                                            </v-btn>
                                        </v-card>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                            <v-dialog v-model="docDialog" max-width="600">
                                <v-card style="box-shadow: 0px  24px 30px #959EA51A;overflow:hidden"
                                    class="borderRadiusCards px-0">
                                    <v-card-title class=" px-6">
                                        <v-row>
                                            <v-col class="py-0">
                                                <span>Attachments</span>
                                            </v-col>
                                            <v-spacer></v-spacer>
                                            <v-img @click="docDialog = false" src="/dashboard/close.svg"
                                                style="cursor:pointer;" justify-self="end" max-width="25" height="auto"
                                                contain></v-img>
                                        </v-row>
                                    </v-card-title>
                                    <v-divider class=""></v-divider>
                                    <v-list two-line class="scroll py-0" style="max-height:500px;">
                                        <v-list-item-group active-class="primary--text" multiple>
                                            <v-list-item v-for="(item, itemIndex) in approverAttachmentData"
                                                :key="itemIndex">
                                                <v-list-item-content @click="openAttachments(item.link)" v-if="item">
                                                    <v-list-item-title>{{ item.filename }}</v-list-item-title>
                                                    <v-list-item-title class="fontSize1">- {{ item.time | requestsDateFormat
                                                    }}</v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </v-list-item-group>
                                    </v-list>
                                </v-card>
                            </v-dialog>

                        </v-row>
                    </v-timeline-item>
                    <!-- <template v-if="adminCentral != true ? approvalAccess : ''"> -->
                    <v-timeline-item small color="red" icon="mdi-close" v-if="approvalAccess">
                        <v-row class="mx-0" style="max-width:100%" v-if="userType != 'SELF'">
                            <v-col cols="auto" class="pa-0 pr-3">
                                <v-btn outlined
                                    v-if="data.status != 'Completed' && data.status != 'completed' && data.request_type == 'passport release'"
                                    @click="approveTemp(data)" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px; color:#83EAC7;height: 35px;text-align: center;text-transform: unset !important;">{{
                                        getNameForPassportReleaseApproval(data.approvals) }}</v-btn>
                                <v-btn outlined
                                    v-else-if="data.status != 'Completed' && data.status != 'completed' && data.request_type == 'passport safekeep'"
                                    @click="approveTemp(data)" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px; color:#83EAC7;height: 35px;text-align: center;text-transform: unset !important;">{{
                                        getNameForPassportSafekeepApproval(data.approvals) }}</v-btn>
                                <v-btn outlined v-else-if="data.status != 'Completed' && data.status != 'completed'"
                                    @click="approveTemp(data)" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px; color:#83EAC7;height: 35px;text-align: center;text-transform: unset !important;">Approve</v-btn>
                            </v-col>
                            <v-col cols="auto" class="pa-0 pr-3">
                                <v-btn outlined
                                    v-if="!data.hasOwnProperty('leave_type') && data.status != 'Rejected' && data.status != 'rejected' && data.status != 'Cancelled'"
                                    @click="rejectTemp(data._id)" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px; color:#FE5657;height: 35px;text-align: center;text-transform: unset !important;">Reject</v-btn>
                                <v-btn outlined
                                    v-else-if="data.status != 'Rejected' && data.status != 'Cancelled' && data.hasOwnProperty('leave_type') && canRejectLeave(data) == true"
                                    @click="rejectTemp(data._id)" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px; color:#FE5657;height: 35px;text-align: center;text-transform: unset !important;">Reject</v-btn>
                            </v-col>
                            <v-col cols="auto" class="pa-0"
                                v-if="data.hasOwnProperty('leave_type') || data.request_type == 'attendance' || data.request_type == 'letters' || data.request_type == 'claims' || data.request_type == 'wfh'">
                                <v-btn outlined
                                    v-if="data.hasOwnProperty('leave_type') && data.status != 'Cancelled' && data.status != 'completed' && data.status != 'Completed'"
                                    @click="letter_reasign = !letter_reasign, reassignApprovalManager(data)" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px; color:#000099;height: 35px;text-align: center;text-transform: unset !important;"
                                    :disabled="data && data.status ? data.status.toLowerCase() == 'withdrawn' : ''">Reassign</v-btn>
                                <v-btn outlined
                                    v-else-if="!data.hasOwnProperty('leave_type') && data.status != 'Cancelled' && data.status != 'completed' && data.status != 'Completed'"
                                    @click="letter_reasign = !letter_reasign, reassignApprovalManager(data)" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px; color:#000099;height: 35px;text-align: center;text-transform: unset !important;"
                                    :disabled="data && data.status ? data.status.toLowerCase() == 'withdrawn' : ''">Reassign</v-btn>
                                <!-- <v-btn outlined v-if="data.status == 'Processing' || data.status == 'processing'"  @click="rejectTemp(data._id)" elevation="0" class="border-radius-medium fontWeight300 fontSize7" style="min-width:105px; color:#FE5657;height: 35px;text-align: center;text-transform: unset !important;">Reject</v-btn> -->
                            </v-col>

                        </v-row>
                        <v-row class="mx-0" style="max-width:100%" v-else-if="userType == 'SELF'">
                            <v-col cols="auto" class="pa-0 pr-3">
                                <v-btn outlined v-if="data.hasOwnProperty('leave_type') && canWithdraw(data) == true"
                                    @click="withdrawDialog = true" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;">Withdraw</v-btn>
                                <v-btn outlined
                                    v-else-if="!data.hasOwnProperty('leave_type') && canWithdraw(data) == true && data.request_type != 'passport safekeep'"
                                    @click="withdrawDialog = true" elevation="0"
                                    class="border-radius-medium fontWeight300 fontSize7"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;">Withdraw</v-btn>
                            </v-col>
                        </v-row>
                    </v-timeline-item>
                    <!-- </template> -->
                </v-timeline>
            </v-row>
        </template>


        <!-- approve  dialog -->
        <v-dialog v-model="approveDialog" width="600"
            @click:outside="approveDialog = false, reason = '', claimItems = [], selectedClaims = []">
            <v-card class="py-3">
                <v-card-actions class="pa-0 px-3">
                    <v-spacer></v-spacer>
                    <v-btn align-end class="pa-0 border-radius-medium" color="#FF0000" outlined
                        @click="approveDialog = false, reason = '', claimItems = [], selectedClaims = []"
                        style="min-width: 30px;max-width: 30px;height: 30px;text-align: center;">
                        <v-icon small>mdi-close</v-icon>
                    </v-btn>
                </v-card-actions>
                <v-card-title class="body-1 pt-1" v-if="data.request_type == 'passport release'">{{
                    getTextForPassportReleaseApproval(data.approvals) }}</v-card-title>
                <v-card-title class="body-1 pt-1" v-else-if="data.request_type == 'passport safekeep'">{{
                    getTextForPassportSafekeepApproval(data.approvals) }}</v-card-title>
                <v-card-title class="body-1 pt-1" v-else>Are you sure you want to APPROVE the request? </v-card-title>
                <v-card-text>
                    <!--  For claims request only -->
                    <div class="mx-0 scroll" style="max-height: 300px" v-if="data.request_type == 'claims'">
                        <template v-if="data.claims?.length">
                            <v-list two-line>
                                <v-list-item-group color="blue-grey darken-3">
                                    <div v-for="item in data.claims" :key="item.id">
                                        <v-list-item class="leaveList" style="color: grey">
                                            <v-list-item-action class="my-auto mr-0">
                                                <v-list-item-action-text class="caption mt-2 ml-4">
                                                    <v-list-item-action-text class="caption mt-0 d-flex">
                                                        <v-img src="/hr/calendar-linear.svg" max-width="fit-content"
                                                            height="fit-content" class="mr-2 mt-1" contain></v-img>
                                                        <div style="min-width: 45px" class="darkBlue-heading-text">
                                                            <v-card-text
                                                                class="mb-0 pa-0 font-weight-medium grey-heading-text"
                                                                style="font-size: 18px !important">
                                                                {{ item.details?.date | dateToDay }}
                                                            </v-card-text>
                                                            <v-card-text class="mb-0 pa-0 textFontSize grey-heading-text">
                                                                {{ item.details?.date | dateToMonth }}
                                                            </v-card-text>
                                                        </div>
                                                    </v-list-item-action-text>
                                                </v-list-item-action-text>
                                            </v-list-item-action>
                                            <v-list-item-content class="py-0">
                                                <v-list-item-title
                                                    class="pt-0 font-weight-medium textFontSize darkBlue-heading-text">
                                                    {{ item.letter_type }}
                                                </v-list-item-title>
                                                <h5 class="grey-heading-text caption font-weight-normal pt-1">
                                                    {{ item.letter_sub_type }}
                                                </h5>
                                            </v-list-item-content>
                                            <v-list-item-action class="ma-0">
                                                <v-list-item-action-text class="caption mt-2 ml-4">
                                                    <v-list-item-action-text
                                                        class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton">
                                                        {{ item.details?.amount }}
                                                        {{ item.details?.currency }}
                                                    </v-list-item-action-text>
                                                </v-list-item-action-text>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </div>
                                </v-list-item-group>
                            </v-list>
                        </template>
                    </div>

                    <v-form ref="form">
                        <v-row>
                            <v-col cols="12" v-if="data.request_type">
                                <span class="mr-2 mt-2 py-0" v-for="(item, index) in approveText(data)" :key="index">
                                    <v-chip outlined @click="updateReason(item)" class="darkBlue-heading-text"
                                        color="#5C7EEF" small>{{ item }}</v-chip>
                                </span>
                                <v-text-field label="Approval comments" v-model="reason"></v-text-field>
                                <p class="mb-0 caption blue-grey--text font-weight-bold">Attachment</p>
                                <v-row>
                                    <v-col cols="1" class="pa-0">
                                        <v-file-input outlined dense @change="approverAttachment" placeholder="Attachment"
                                            hide-input multiple prepend-icon="mdi-paperclip"></v-file-input>
                                    </v-col>
                                    <v-col cols="11" class="pa-0" v-if="approverAttachmentFile.length > 0">
                                        <v-badge top offset-x="10" small color="red" icon="mdi-close"
                                            v-for="(data, index) in approverAttachmentFile" :key="index"
                                            @click.native="removeFile(data, index)">
                                            <v-chip small label color="primary" class="mr-2">{{ data.name }}</v-chip>
                                        </v-badge>
                                    </v-col>
                                    <v-col cols="11" class="pa-0" v-else>
                                        <v-icon>mdi-arrow-left-circle</v-icon> <span>click to attach files</span>
                                    </v-col>
                                </v-row>
                                <v-checkbox v-if="approverAttachmentFile.length > 0" v-model="hideAttachment"
                                    label="Hide attachment to employee" color="red" hide-details></v-checkbox>
                            </v-col>

                            <v-col cols="12" v-else>
                                <v-text-field label="Reason" v-model="reason"></v-text-field>
                            </v-col>
                            <v-col cols="12" style="text-align-last: center;">
                                <v-btn v-if="data.request_type == 'attendance'"
                                    @click.once.prevent="approveAttendanceRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.hasOwnProperty('leave_type')"
                                    @click.once.prevent="approveLeave(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'letters'"
                                    @click.once.prevent="approveLetterRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'claims'"
                                    @click.once.prevent="approveClaimsRequest(data, data._id)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'wfh'" @click.once.prevent="approveWfhRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'loan'"
                                    @click.once.prevent="approveLoanRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'education'"
                                    @click.once.prevent="approveEducationRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'passport release'"
                                    @click.once.prevent="approvePassportReleaseRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'passport safekeep'"
                                    @click.once.prevent="approvePassportSafekeepRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="!(data.request_type)"
                                    @click.once.prevent="approveSalaryAdjustmentRequest(data)"
                                    style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <!-- <v-btn v-else @click.prevent="approveRequest(data, data._id )" style="min-width:105px;background-color: #39DDA6; color: white;height: 35px;text-align: center;text-transform: unset !important;" class="white--text border-radius-medium" depressed >Yes</v-btn > -->
                                <v-btn @click="approveDialog = false; clearCommentBox()"
                                    class="caption border-radius-medium" text
                                    style="min-width:105px;background-color: #C6CDD4; color: #000;height: 35px;text-align: center;text-transform: unset !important;">No</v-btn>
                            </v-col>
                        </v-row>
                        <v-row v-if="isWithdrawn">
                            <v-col cols="12">
                                <v-alert dismissible class="caption" type="success">
                                    Application has been approved!
                                </v-alert>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- reject  dialog -->
        <v-dialog v-model="rejectDialog" width="600"
            @click:outside="rejectDialog = false; clearCommentBox(); claimItems = []; selectedClaims = [];">
            <v-card class="py-3">
                <v-card-actions class="pa-0 px-3">
                    <v-spacer></v-spacer>
                    <v-btn align-end class="pa-0 border-radius-medium" color="#FF0000" outlined
                        @click="rejectDialog = false; clearCommentBox(); claimItems = []; selectedClaims = [];"
                        style="min-width:30px;max-width:30px;height: 30px;text-align: center;">
                        <v-icon small>mdi-close</v-icon>
                    </v-btn>
                </v-card-actions>
                <v-card-title class="body-1 pt-1">Are you sure you want to REJECT the request? </v-card-title>
                <v-card-text>
                    <!--  For claims request only -->
                    <div class="mx-0 scroll" style="max-height: 300px" v-if="data.request_type == 'claims'">
                        <template v-if="data.claims?.length">
                            <v-list two-line>
                                <v-list-item-group color="blue-grey darken-3">
                                    <div v-for="item in data.claims" :key="item.id">
                                        <v-list-item class="leaveList" style="color: grey">
                                            <v-list-item-action class="my-auto mr-0">
                                                <v-list-item-action-text class="caption mt-2 ml-4">
                                                    <v-list-item-action-text class="caption mt-0 d-flex">
                                                        <v-img src="/hr/calendar-linear.svg" max-width="fit-content"
                                                            height="fit-content" class="mr-2 mt-1" contain></v-img>
                                                        <div style="min-width: 45px" class="darkBlue-heading-text">
                                                            <v-card-text
                                                                class="mb-0 pa-0 font-weight-medium grey-heading-text"
                                                                style="font-size: 18px !important">
                                                                {{ item.details?.date | dateToDay }}
                                                            </v-card-text>
                                                            <v-card-text class="mb-0 pa-0 textFontSize grey-heading-text">
                                                                {{ item.details?.date | dateToMonth }}
                                                            </v-card-text>
                                                        </div>
                                                    </v-list-item-action-text>
                                                </v-list-item-action-text>
                                            </v-list-item-action>
                                            <v-list-item-content class="py-0">
                                                <v-list-item-title
                                                    class="pt-0 font-weight-medium textFontSize darkBlue-heading-text">
                                                    {{ item.letter_type }}
                                                </v-list-item-title>
                                                <h5 class="grey-heading-text caption font-weight-normal pt-1">
                                                    {{ item.letter_sub_type }}
                                                </h5>
                                            </v-list-item-content>
                                            <v-list-item-action class="ma-0">
                                                <v-list-item-action-text class="caption mt-2 ml-4">
                                                    <v-list-item-action-text
                                                        class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton">
                                                        {{ item.details?.amount }}
                                                        {{ item.details?.currency }}
                                                    </v-list-item-action-text>
                                                </v-list-item-action-text>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </div>
                                </v-list-item-group>
                            </v-list>
                        </template>
                    </div>
                    <v-form ref="form">
                        <v-row>
                            <v-col cols="12" v-if="data.request_type">
                                <span class="mr-2 mt-2 py-0" v-for="(item, index) in rejectText(data)" :key="index">
                                    <v-chip outlined @click="updateReason(item)" class="darkBlue-heading-text"
                                        color="#5C7EEF" small>{{ item }}</v-chip>
                                </span>
                                <v-text-field label="Approval comments" v-model="reason"></v-text-field>
                                <p class="mb-0 caption blue-grey--text font-weight-bold">Attachment</p>
                                <v-row>
                                    <v-col cols="1" class="pa-0">
                                        <v-file-input outlined dense @change="approverAttachment" placeholder="Attachment"
                                            hide-input multiple prepend-icon="mdi-paperclip"></v-file-input>
                                    </v-col>
                                    <v-col cols="11" class="pa-0" v-if="approverAttachmentFile.length > 0">
                                        <v-badge top offset-x="10" small color="red" icon="mdi-close"
                                            v-for="(data, index) in approverAttachmentFile" :key="index"
                                            @click.native="removeFile(data, index)">
                                            <v-chip small label color="primary" class="mr-2">{{ data.name }}</v-chip>
                                        </v-badge>
                                    </v-col>
                                    <v-col cols="11" class="pa-0" v-else>
                                        <v-icon>mdi-arrow-left-circle</v-icon> <span>click to attach files</span>
                                    </v-col>
                                </v-row>
                                <v-checkbox v-if="approverAttachmentFile.length > 0" v-model="hideAttachment"
                                    label="Hide attachment to employee" color="red" hide-details></v-checkbox>
                            </v-col>
                            <v-col cols="12" v-else>
                                <v-textarea outlined dense rows="3" auto-grow v-model="reason"
                                    placeholder="Rejected Reason"></v-textarea>
                            </v-col>
                            <v-col cols="12" style="text-align-last: center;">
                                <v-btn v-if="data.request_type == 'attendance'"
                                    @click.once.prevent="rejectAttendanceRequest(data)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-if="data.request_type == 'claims'" @click.once.prevent="rejectClaimsRequest(data)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'wfh'" @click.once.prevent="rejectWfhRequest(data)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'loan'" @click.once.prevent="rejectLoanRequest(data)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'education'"
                                    @click.once.prevent="rejectEducationRequest(data)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.request_type == 'passport release'"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="data.hasOwnProperty('leave_type')"
                                    @click.once.prevent="rejectLeaveRequest(data._id)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="!(data.request_type)"
                                    @click.once.prevent="rejectSalaryAdjustmentRequest(data)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn
                                    v-else-if="data.request_type != 'attendance' && data.request_type != 'wfh' && data.request_type != 'claims' && !data.hasOwnProperty('leave_type') && data.request_type"
                                    @click.once.prevent="rejectRequest(data, data._id)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium mr-2" depressed>Yes</v-btn>
                                <v-btn @click="rejectDialog = false; clearCommentBox()" class="caption border-radius-medium"
                                    text
                                    style="min-width:105px;background-color: #C6CDD4; color: #000;height: 35px;text-align: center;text-transform: unset !important;">No</v-btn>

                            </v-col>
                        </v-row>
                        <v-row v-if="isWithdrawn">
                            <v-col cols="12">
                                <v-alert dismissible class="caption" type="success">
                                    Application has been cancelled!
                                </v-alert>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- Application Log -->
        <v-dialog transition="" max-width="600" v-model="leaveApplicationLogDialog">
            <v-card class="overflow-x-hidden">
                <v-row>
                    <v-card-title>Application Logs</v-card-title>
                    <v-spacer></v-spacer>
                    <v-col cols="12" sm="6" lg="6" md="6">
                        <div style="float: right;">
                            <v-tooltip top color="primary">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn icon color="primary" v-bind="attrs" v-on="on"
                                        @click.prevent="leaveApplicationLogDialog = false">
                                        <v-icon small>mdi-close</v-icon>
                                    </v-btn>
                                </template>
                                <span>Close</span>
                            </v-tooltip>
                        </div>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-card-text class="pt-5 scroll" :style="{ 'max-height': '520px', 'min-height': '520px' }">
                    <ApplicationLogList :applicationLogs="!(data.request_type) ? data.logs : data.appliction_log"
                        :requestStatus="data.status" :request="data" />
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- Reasign Letters Dialog -->
        <v-dialog transition="dialog-top-transition" v-model="letter_reasign" width="800"
            @click:outside="letter_reasign = false, reason = '', selectedManager = '', selectedClaims = [], claimItems = []">
            <v-card>
                <v-toolbar color="#fff" flat>
                    <p>Reassign Manager</p>
                </v-toolbar>
                <v-divider></v-divider>
                <v-progress-linear :active="reassign_progress" :indeterminate="reassign_progress" top
                    color="primary"></v-progress-linear>
                <v-card-text class="pt-10">
                    <v-autocomplete class="rounded-xl customMdiMenuDown redTextForm" :items="managers" dense outlined
                        label="Select New Approver" item-text="name" item-value="_id" return-object
                        v-model="selectedManager" :rules="genericRule"></v-autocomplete>
                    <v-textarea class="rounded-xl redTextForm" :rules="genericRule" outlined dense rows="3" auto-grow
                        v-model="reason" placeholder="Reason for Reassigning"></v-textarea>
                    <p class="mb-0 caption blue-grey--text font-weight-bold">Attachment</p>
                    <v-row>
                        <v-col cols="1" class="pa-0">
                            <v-file-input outlined dense @change="approverAttachment" placeholder="Attachment" hide-input
                                multiple prepend-icon="mdi-paperclip"></v-file-input>
                        </v-col>
                        <v-col cols="11" class="pa-0" v-if="approverAttachmentFile.length > 0">
                            <v-badge top offset-x="10" small color="red" icon="mdi-close"
                                v-for="(data, index) in approverAttachmentFile" :key="index"
                                @click.native="removeFile(data, index)">
                                <v-chip small label color="primary" class="mr-2">{{ data.name }}</v-chip>
                            </v-badge>
                        </v-col>
                        <v-col cols="11" class="pa-0" v-else>
                            <v-icon>mdi-arrow-left-circle</v-icon> <span>click to attach files</span>
                        </v-col>
                    </v-row>
                    <v-checkbox v-if="approverAttachmentFile.length > 0" v-model="hideAttachment"
                        label="Hide attachment to employee" color="red" hide-details></v-checkbox>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn text @click="letter_reasign = false">Close</v-btn>
                    <v-btn text class="blue lighten-1"
                        :disabled="reason == '' || Object.keys(selectedManager).length == 0 || isProcessing"
                        v-if="selectedRequest.request_type == 'claims'" dark
                        @click.prevent="reassignClaim(), reassign_progress = !reassign_progress">Reassign</v-btn>
                    <v-btn text class="blue lighten-1"
                        :disabled="reason == '' || Object.keys(selectedManager).length == 0 || isProcessing"
                        v-else-if="selectedRequest.request_type == 'wfh'" dark
                        @click.prevent="reassignWfh(), reassign_progress = !reassign_progress">Reassign</v-btn>
                    <v-btn text class="blue lighten-1"
                        :disabled="reason == '' || Object.keys(selectedManager).length == 0 || isProcessing"
                        v-else-if="selectedRequest.request_type == 'attendance'" dark
                        @click.prevent="reassignAttendance(), reassign_progress = !reassign_progress">Reassign</v-btn>
                    <v-btn text class="blue lighten-1"
                        :disabled="reason == '' || Object.keys(selectedManager).length == 0 || isProcessing"
                        v-else-if="data.hasOwnProperty('leave_type')" dark
                        @click.prevent="reassignLeave(), reassign_progress = !reassign_progress">Reassign</v-btn>
                    <v-btn text class="blue lighten-1"
                        :disabled="reason == '' || Object.keys(selectedManager).length == 0 || isProcessing" v-else dark
                        @click.prevent="editRequest(), reassign_progress = !reassign_progress">Reassign</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- withdraw leave dialog -->
        <v-dialog v-model="withdrawDialog" width="600">
            <v-card class="py-3">

                <v-card-actions class="pa-0 px-3">
                    <v-spacer></v-spacer>
                    <v-btn align-end class="pa-0 border-radius-medium" color="#FF0000" outlined
                        @click="withdrawDialog = false; clearCommentBox()"
                        style="min-width:30px;max-width:30px;height: 30px;text-align: center;">
                        <v-icon small>mdi-close</v-icon>
                    </v-btn>
                </v-card-actions>
                <v-progress-linear v-if="isWithdrawing" indeterminate color="blue darken-2"></v-progress-linear>
                <v-card-title class="body-1 pt-1">Are you sure you want to WITHDRAW
                    the request? </v-card-title>
                <v-card-text>
                    <v-form ref="form">
                        <v-row>
                            <v-col cols="12" style="text-align-last: center;">
                                <v-btn v-if="data.hasOwnProperty('leave_type')" :disabled='isWithdrawing'
                                    @click.once.prevent="WithdrawLeave(data)"
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="!data.hasOwnProperty('leave_type') && data.request_type == 'letters'"
                                    :disabled='isWithdrawing' @click.once.prevent="
                                        withdrawRequest(
                                            data,
                                            data._id
                                        )
                                        "
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="!data.hasOwnProperty('leave_type') && data.request_type == 'claims'"
                                    :disabled='isWithdrawing' @click.once.prevent="
                                        withdrawClaimRequest(
                                            data,
                                            data._id
                                        )
                                        "
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn v-else-if="!data.hasOwnProperty('leave_type') && data.request_type == 'wfh'"
                                    :disabled='isWithdrawing' @click.once.prevent="
                                        withdrawWfhRequest(
                                            data,
                                            data._id
                                        )
                                        "
                                    style="min-width:105px;background-color: #EA665F; color: white;height: 35px;text-align: center;text-transform: unset !important;"
                                    class="white--text border-radius-medium" depressed>Yes</v-btn>
                                <v-btn @click="withdrawDialog = false; clearCommentBox()"
                                    class="caption border-radius-medium" text
                                    style="min-width:105px;background-color: #C6CDD4; color: #000;height: 35px;text-align: center;text-transform: unset !important;">No</v-btn>
                            </v-col>
                        </v-row>
                        <v-row v-if="isWithdrawn">
                            <v-col cols="12">
                                <v-alert dismissible class="caption" type="success">
                                    Application has been cancelled!
                                </v-alert>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- Edit Letters Dialog -->
        <v-dialog v-model="editLetter" scrollable width="800">
            <v-card class="py-3">
                <v-card-title class="body-1"> Edit Form </v-card-title>
                <v-card-text>
                    <LetterEdit :computedServiceList="computedServiceList" :user="user" :countryList="countryList"
                        :emailBody="emailBody" :companies="companyData" />
                </v-card-text>
            </v-card>
        </v-dialog>
        <!-- snackbar -->
        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}

            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
            </template>
        </v-snackbar>

        <!-- View Salary Adjustment -->
        <v-dialog v-model="viewSalary" max-width="1200" class="scroll" scrollable>
            <v-card class="rounded-lg scroll" min-width="800" scrollable>
                <v-row class="pt-5">
                    <v-col cols="12" class="px-5 font weight-bold pt-0 text-left d-flex flex-row justify-space-between">
                        <h2 class="body-1 font-weight-bold darkBlue-heading-text"
                            style="display: flex; align-items: center;">Salary
                            Adjustment Changes</h2>
                        <v-spacer></v-spacer>
                        <v-icon @click="viewSalary = false" fab> mdi-close-circle-outline</v-icon>
                    </v-col>
                </v-row>
                <v-divider></v-divider>

                <DataTableSalaryAdjustment :oldsalary="data.old_salary" :newsalary="data.new_salary"
                    :salaryPercentageChanges="!data.isAmount ? data.salaryPercentageChanges : ''">
                </DataTableSalaryAdjustment>
                <v-row>
                    <v-col cols="12">
                    </v-col>
                </v-row>

                <v-divider></v-divider>


            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import notificationMethod from "~/plugins/notification";
import ApplicationLogList from "~/components/reuseable/applicationLogsList.vue";
import moment from "moment"
import Leaves from "~/components/reuseable/leaves.vue";
import LetterEdit from '~/components/reuseable/letterEdit.vue'
import { Letters } from '@nathangroup/letter'
import { LetterEmail } from '@nathangroup/letter-email'
import LetterPreview from '~/components/reuseable/letterPreview.vue'
import { Attendance } from "@nathangroup/attendance"
import { AttendanceEmail } from "@nathangroup/attendance-email"
import general from "~/plugins/general.js";
import DataTableSalaryAdjustment from "~/components/datatables/salaryAdjustmentDataTable.vue";

export default {

    components: {
        ApplicationLogList, Leaves, LetterPreview, LetterEdit, DataTableSalaryAdjustment,
        PreviewLetter: () => { if (process.client) { return import('~/components/document-editor/wordsimplepreview.vue') } }
    },

    props: ['data', 'user', 'users', 'companyData', 'adminCentral', 'teamCentral', 'configData', 'countryList', 'userType', 'selfService', 'requestInfo'],

    data() {
        return {
            approverAttachmentData: [],
            docDialog: false,
            hideAttachment: false,
            isWithdrawn: false,
            isWithdrawing: false,
            withdrawDialog: false,
            services_general: general,
            letterLoading: false,
            editLetter: false,
            previewLetter: false,
            user_leaves: [],
            editLetter: false,
            previewLetter: false,
            selectedManager: {},
            genericRule: [(v) => !!v || "This field is Required"],
            reassign_progress: false,
            managers: [],
            letter_reasign: false,
            arr_leaves: [],
            leaveRequestTab: "leave-request-details",
            approveLeaveText: ['Approved', 'Enjoy Your Vacation', 'Okay', 'Get Well Soon'],
            rejectLeaveText: ['Rejected', 'Please specify reason.', 'Attach medical certificate.'],
            approveLetterText: ['Approved', 'Letter ', 'Okay'],
            RejectText: ['Rejected', 'Please specify reason.', 'Attach documents.'],
            config_details: {},

            leaveBuddies: [],
            isRequestingLeaveBuddy: false,

            withdrawClaimDialog: false,
            isWithdrawn: false,
            approveDialog: false,
            rejectDialog: false,
            leaveApplicationLogDialog: false,
            approveID: '',
            rejectID: '',
            emailBody: {
                hr_email: "donotreply@nathanhr.ae",
                email: "",
                subjectMsg: "",
                eMessage: "",
                email: ""
            },
            emailBodyHR: {
                hr_email: "",
                email: "",
                subjectMsg: "",
                eMessage: "",
                email: ""
            },
            reason: "",
            approverAttachmentFile: [],
            approverAttachmentFiles: [],
            link_url: '',
            link_filename: '',
            snack: false,
            snackColor: "",
            snackText: "",
            managers: [],
            selectedRequest: {},
            selectedService: {},
            viewSalary: false,
            claimItems: [],
            selectedClaims: [],
            claimItemsDisabled: true,
            defaultAvatar: 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
        }
    },
    mounted() {
        this.config_details = this.configData[0];
        this.getManagers()
        /** Add showLongReason property on each approvals for toggling See More button on approval comment. */
        this.data.approvals = this.data.approvals.map((approval) => ({ ...approval, showApprovalLongComment: false }));
        // this.getManagers()
        this.getLeaveData()
    },
    created() {
        this.$nuxt.$on('letterEditClose', ($event) => {
            this.editLetter = false;
        })
    },
    beforeDestroy() {
        this.$nuxt.$off('letterEditClose')
    },
    watch: {
        data(newData, oldData) {
            /** Add showLongReason property on each approvals for toggling See More button on approval comment. */
            newData.approvals = newData.approvals.map((approval) => ({ ...approval, showApprovalLongComment: false }));
            this.leaveRequestTab = "leave-request-details";
            this.onChangeTab(this.leaveRequestTab);
            this.getManagers()
            this.getLeaveData()
        }
    },
    methods: {
        openDialog(data) {
            this.docDialog = true
            this.approverAttachmentData = data
        },
        getPercentage(olds, news) {
            let oldVal = _.cloneDeep(olds.total_fixed)
            let newVal = _.cloneDeep(news.total_fixed)
            let diff = Math.abs(Number(oldVal) - Number(newVal))
            if (oldVal - newVal <= 0) {
                return Number((100 * (Number(diff) / Number(oldVal))).toFixed(2))
            } else {
                return -Number((100 * (Number(diff) / Number(oldVal))).toFixed(2))

            }
        },
        compensationAdjustmentComputed(olds, news) {
            let obj = [
                {
                    "emptyCol": "Total Fixed",
                    "olds": this.services_general.thousandSeparator(olds.total_fixed),
                    "news": this.services_general.thousandSeparator(news.total_fixed),
                    "diff": this.services_general.thousandSeparator(Number(news.total_fixed) - Number(olds.total_fixed))
                }
            ]
            return obj
        },
        openAttachments(fileUrl) {
            window.open(fileUrl)
        },
        removeFile(file, index) {
            this.approverAttachmentFile = this.removeByAttr(this.approverAttachmentFile, "name", file.name);
        },
        removeByAttr(arr, attr, value) {
            var i = arr.length;
            while (i--) {
                if (arr[i]
                    && (arguments.length > 2 && arr[i][attr] === value)) {
                    arr.splice(i, 1);
                }
            }
            return arr;
        },
        async uploadImage(val) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            const fd = new FormData();
            fd.append('a', val.file, val.name)
            fd.append('folder', 'leaves/' + this.user.first_name + ' ' + this.user.last_name)
            await this.$axios.$post("/users/upload-files", fd, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.link_url = res.url
                    this.link_filename = res.name
                })
                .catch();
        },
        async uploadApproverFile() {
            for (let index = 0; this.approverAttachmentFile.length > index; index++) {
                let upload_meta = {
                    file: this.approverAttachmentFile[index],
                    filename: this.approverAttachmentFile[index].name
                }
                await this.uploadImage(upload_meta)
                let obj = {
                    link: this.link_url,
                    filename: this.link_filename,
                    time: new Date()
                }
                this.approverAttachmentFiles.push(obj)
            }
        },
        approverAttachment(event) {
            let uploads = event
            if (uploads.length > 1) {
                uploads.forEach(element => {
                    this.approverAttachmentFile.push(element)
                });
            } else {
                this.approverAttachmentFile.push(event[0])
            }
        },
        getNameForPassportReleaseApproval(val) {
            if (val && val.length > 0) {
                let totlength = val.length
                let lastApproverCheck = val.findIndex(x => x.status == "Processing");
                if (lastApproverCheck == totlength - 1) {
                    return 'Submit Passport'
                } else {
                    return 'Approve'
                }
            }
        },
        getNameForPassportSafekeepApproval(val) {
            if (val && val.length > 0) {
                let totlength = val.length
                let lastApproverCheck = val.findIndex(x => x.status == "Processing");
                if (lastApproverCheck == totlength - 1) {
                    return 'Passport Recieved'
                } else {
                    return 'Approve'
                }
            }
        },
        clearCommentBox() {
            this.reason = ''
        },
        getTextForPassportReleaseApproval(val) {
            if (val && val.length > 0) {
                let totlength = val.length
                let lastApproverCheck = val.findIndex(x => x.status == "Processing");
                if (lastApproverCheck == totlength - 1) {
                    return 'Click "YES" if you have already submitted the passport to the employee'
                } else {
                    return 'Are you sure you want to APPROVE passport release? '
                }
            }
        },
        getTextForPassportSafekeepApproval(val) {
            if (val && val.length > 0) {
                let totlength = val.length
                let lastApproverCheck = val.findIndex(x => x.status == "Processing");
                if (lastApproverCheck == totlength - 1) {
                    return 'Click "YES" if you have already recieved the passport from the employee'
                } else {
                    return 'Are you sure you want to APPROVE passport release? '
                }
            }
        },
        withdrawWfhRequest(data) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            let updatedRequst = data;
            // console.log(data,"-----data")
            updatedRequst.status = 'withdrawn'

            let body = {
                user_id: data.user_id,
                wfh_id: data._id
            }

            this.$axios.$post('/wfh/withdraw_wfh', body, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.snack = true
                    this.snackText = 'You have successfully withdrawn the request!'
                    this.snackColor = 'green'
                    this.withdrawDialog = false
                    this.$nuxt.$emit("requestWithdrawn", true)
                    // this.$router.go()
                }).catch(err => console.log(err))
        },
        async withdrawClaimRequest(data) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            let body = {
                user_id: this.user._id,
                claim_id: data._id
            }

            let withdraw_claim = await this.$axios.$post("/claim/withdraw_claim", body, { headers: { Authorization: AuthStr } })

            if (withdraw_claim.success) {
                this.withdrawDialog = false
                this.$nuxt.$emit("requestWithdrawn", true)
            } else {

            }
            this.$emit("withdraw", { "status": "withdraw" })
        },
        async withdrawRequest(data, id) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            const letterClass = new Letters()
            let obj_requestInfo = data
            let request = letterClass.funWithdrawLetter(obj_requestInfo)
            data = request

            this.emailBody.hr_email = "donotreply@nathanhr.ae";

            const letterEmail = new LetterEmail()
            let obj_companyInfo = this.companyData[0]
            let obj_userInfo = this.user
            let EmailRequest = letterEmail.funLetterWithdraw(obj_requestInfo, obj_companyInfo, obj_userInfo)

            this.emailBody.email = obj_userInfo.email;
            // this.emailBody.email = 'akshaf@nathanhr.com'
            this.emailBody.subjectMsg = EmailRequest.subject
            this.emailBody.eMessage = EmailRequest.body

            // update the request specific list

            this.$axios.$put("requests/update-request/" + id, data, { headers: { Authorization: AuthStr } })
                .then((res) => {
                    this.$nuxt.$emit("requestWithdrawn", true)
                    // this.showWithdrawBtn = false;   
                }).then((res) => {
                    this.$axios.$post("users/send-email/", this.emailBody, { headers: { Authorization: AuthStr } })
                        .then((res) => {
                            this.withdrawDialog = false
                        }).catch((e) => console.log(e));
                }).catch((e) => console.log(e));

            let body = {
                user_id: this.user._id,
                letter_id: this.data._id,
                letter_type: this.data.letter_type
            }

            await this.$axios.$post('requests/withdraw_letter', body, { headers: { Authorization: AuthStr }, })
                .then((res) => {
                    if (res.success) {
                        this.$nuxt.$emit("requestWithdrawn", true)
                        //     setTimeout(() => {
                        //     this.snack = false
                        // }, 1000)
                    }
                })
        },
        async WithdrawLeave() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.isWithdrawing = true

            let body = {
                user_id: this.user._id,
                leave_id: this.data._id,
            }

            let withdraw_leave = await this.$axios.$post('/leaves/withdraw_leave', body, {
                headers: { Authorization: AuthStr },
            });

            if (withdraw_leave.success) {
                this.snack = true;
                this.snackText = 'Leave Withdrawn Successfully';
                this.snackColor = 'success'
                this.isWithdrawing = false
                this.withdrawDialog = false
                this.$nuxt.$emit("userUpdated");
                this.$nuxt.$emit("requestWithdrawn", true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (withdraw_leave && !withdraw_leave.success) {
                    this.snack = true;
                    this.isWithdrawing = false
                    this.snackText = withdraw_leave.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    this.isWithdrawing = false
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }
        },
        canWithdraw(val) {
            if (val.status == 'Completed' || val.status == 'completed') {
                let toDate = moment(val.to_date).format('YYYY-MM-DD')
                let Today = moment().format('YYYY-MM-DD')
                if (toDate >= Today) {
                    return true
                }
            } else if (val.status == 'Processing' || val.status == 'processing') {
                return true
            } else {
                return false
            }
        },
        async getLetterPreview(data) {
            this.selectedService = data;
            this.previewLetter = true
            this.letterLoading = true
            let obj = this.services_general.getLetterObject(data)
            await this.$axios.$post(process.env.documenturl + 'api/DocumentEditor/ReplaceContent', obj, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf' } })
                .then((response) => {
                    this.selectedService.replacedContent = response
                    this.letterLoading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        updateStatus(val) {
            if (val == 'Cancelled') {
                return 'Rejected'
            }
            else {
                return val.replaceAll('Cancelled', 'Rejected')
            }
        },
        async getLeaveData() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.user_leaves = await this.$axios.$get("/leaves/user_leaves/" + this.data.user_id, { headers: { Authorization: AuthStr } });
        },
        canRejectLeave(val) {
            if (this.adminCentral == true) {
                return true;
            } else {
                if (val.status == 'Completed' || val.status == 'completed') {
                    let toDate = moment(val.to_date).format('YYYY-MM-DD')
                    let Today = moment().format('YYYY-MM-DD')
                    if (toDate >= Today) {
                        return true
                    }
                } else if (val.status == 'Processing' || val.status == 'processing') {
                    return true
                } else {
                    return false
                }
            }
        },
        reassignApprovalManager(data) {
            this.selectedRequest = data
        },
        async getManagers() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            this.managers = await this.$axios.$get('/users/approval/managers/' + this.user._id, { headers: { Authorization: AuthStr } })
        },
        async editRequest() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            this.isProcessing = true

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
                for (let approvalIndex = 0; approvalIndex < this.data.approvals.length; approvalIndex++) {
                    const element = this.data.approvals[approvalIndex];
                    if (element.status.toLowerCase() == 'processing') {
                        element.approver_attachment = this.approverAttachmentFiles
                        element.hide_attachment = this.hideAttachment
                        break
                    }
                }
            }

            for (let index = 0; index < this.data.approvals.length; index++) {
                const element = this.data.approvals[index];
                if (element.status.toLowerCase() == 'processing') {
                    console.log(this.$route.path, 'path')
                    if (this.$route.path.startsWith('/admin-central')) {
                        element.status = 'Reassigned by Admin'
                        element.approved_date = new Date()
                        element.reason = this.reason
                        this.data.approvals.splice(index + 1, 0, {
                            "approver_id": this.selectedManager._id,
                            "status": "Processing",
                            "approved_date": '',
                            reason: ''
                        })
                        break
                    } else if (this.$route.path.startsWith('/dashboards/my-team')) {
                        element.status = 'Reassigned by ' + this.user.first_name
                        element.approved_date = new Date()
                        element.reason = this.reason
                        this.data.approvals.splice(index + 1, 0, {
                            "approver_id": this.selectedManager._id,
                            "status": "Processing",
                            "approved_date": '',
                            reason: ''
                        })
                        break
                    }

                }
            }

            if (this.$route.path.startsWith('/admin-central')) {
                this.data.appliction_log.push({
                    "approver_id": this.user._id,
                    "status": "Reassigned by Admin",
                    "date_created": new Date(),
                    reason: this.reason,
                    assigned_to: this.selectedManager._id
                })
            } else if (this.$route.path.startsWith('/dashboards/my-team')) {
                this.data.appliction_log.push({
                    "approver_id": this.user._id,
                    "status": 'Reassigned by ' + this.user.first_name,
                    "date_created": new Date(),
                    reason: this.reason,
                    assigned_to: this.selectedManager._id
                })
            }

            let approver = this.users.filter((ele) => ele._id == this.selectedManager._id)
            let req_user = this.users.filter((a) => a._id == this.data.user_id);

            if (this.data.request_type == 'attendance') {
                let Reqclass = new AttendanceEmail()
                let obj_requestInfo = this.data
                let obj_companyInfo = this.getCompanyInformation()
                let obj_userInfo = req_user.length > 0 ? req_user[0] : {}
                let obj_managerInfo = approver.length > 0 ? approver[0] : {}

                let email = Reqclass.funAttendanceRequestApprovalManager(obj_requestInfo, obj_companyInfo, obj_userInfo, obj_managerInfo)
                this.emailBody.hr_email = this.config_details.SYSTEM_EMAIL_ID;
                this.emailBody.email = obj_managerInfo.email
                this.emailBody.subjectMsg = email.subject;
                this.emailBody.eMessage = email.body;
            } else if (this.data.request_type == 'letters') {
                let Reqclass = new LetterEmail()
                let obj_requestInfo = this.data
                let obj_companyInfo = this.getCompanyInformation()
                let obj_userInfo = req_user.length > 0 ? req_user[0] : {}
                let obj_managerInfo = approver.length > 0 ? approver[0] : {}
                // if(this.data.approvals[0].approver_attachment){
                // this.data.approvals[0].approver_attachment.push(...this.approverAttachmentFiles)
                //  }else{
                // this.data.approvals[0].approver_attachment = this.approverAttachmentFiles
                // }
                // this.data.approvals[0].hide_attachment = this.hideAttachment

                let email = Reqclass.funLetterRequestApprovalManager(obj_requestInfo, obj_companyInfo, obj_userInfo, obj_managerInfo)
                this.emailBody.hr_email = this.config_details.SYSTEM_EMAIL_ID;
                this.emailBody.email = obj_managerInfo.email
                this.emailBody.subjectMsg = email.subject;
                this.emailBody.eMessage = email.body;
            }

            if (this.data.request_type == 'attendance' || this.data.request_type == 'letters') {
                this.$axios
                    .$put("requests/update-request/" + this.data._id, this.data, {
                        headers: { Authorization: AuthStr },
                    })
                    .then((res) => {
                        if (this.data.request_type == 'attendance') {
                            /* Send notification to next approver */
                            let assigned_arr = this.user._id
                            notificationMethod.new(assigned_arr, this.selectedManager._id, "New Attendance Request is pending for your approval.", 'Attendance Request Pending Approval', '/dashboards/my-team#requests')
                        } else if (this.data.request_type == 'letters') {
                            /* Send notification to next approver */
                            let assigned_arr = this.user._id
                            notificationMethod.new(assigned_arr, this.selectedManager._id, "New Letter Request is pending for your approval.", 'Letter Request Pending Approval', '/dashboards/my-team#requests')
                        }
                        this.snack = true
                        this.snackText = 'The request is successfully reassigned'
                        this.snackColor = 'green'
                        this.letter_reasign = false
                        this.reassign_progress = false
                        setTimeout(() => {
                            this.$nuxt.$emit('refreshRequests', true)
                        }, 1000)
                        this.isProcessing = false
                    })
                    .catch((e) => console.log(e));

            } else if (this.data.hasOwnProperty('leave_type')) {
                this.$axios
                    .$put('leaves/update/' + this.data._id, [this.data], {
                        headers: { Authorization: AuthStr },
                    })
                    .then((res) => {
                        this.$nuxt.$emit('refreshRequests', true)
                        this.letter_reasign = false
                        this.reassign_progress = false
                    })
                    .catch((e) => console.log(e));

            }

            this.$axios.$post("users/send-email/", this.emailBody, { headers: { Authorization: AuthStr } })
                .then((res) => { })
                .catch((e) => console.log(e));
            this.approverAttachmentFile = []
            this.approverAttachmentFiles = []
        },
        async reassignClaim() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.isProcessing = true
            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                manager_id: this.user._id,
                reassign_manager_id: this.selectedManager._id,
                claim_id: this.data._id,
                user_id: this.data.user_id,
                reason: this.reason,
                admin: this.adminCentral,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let reassign_claim = await this.$axios.$post("/claim/reassign_claim", body, { headers: { Authorization: AuthStr } })

            if (reassign_claim && reassign_claim.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.snack = true
                this.snackText = 'The request is successfully reassigned'
                this.snackColor = 'green'
                // this.$nuxt.$emit('refreshRequests', true)
                this.letter_reasign = false
                this.reassign_progress = false
                setTimeout(() => {
                    this.$nuxt.$emit('refreshRequests', reassign_claim.data)
                    this.$nuxt.$emit("getNotification", true);
                    this.reason = ''
                }, 1000)
                this.isProcessing = false
            } else {
                if (reassign_claim && !reassign_claim.success) {
                    this.reassign_progress = false
                    this.snack = true;
                    this.snackText = reassign_claim.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.reassign_progress = false
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }
        },
        getUserData(id) {
            let user = this.users.filter((a) => a._id == id)
            return user.length > 0 ? user[0] : ''
        },
        async reassignAttendance() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.isProcessing = true
            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                manager_id: this.user._id,
                reassign_manager_id: this.selectedManager._id,
                attendance_id: this.data._id,
                user_id: this.data.user_id,
                reason: this.reason,
                admin: this.adminCentral,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let reassign_attendance = await this.$axios.$post("/attendance/reassign_attendance", body, { headers: { Authorization: AuthStr } })

            if (reassign_attendance && reassign_attendance.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.snack = true
                this.snackText = 'The request is successfully reassigned'
                this.snackColor = 'green'
                this.letter_reasign = false
                this.reassign_progress = false
                setTimeout(() => {
                    this.$nuxt.$emit('refreshRequests', true)
                    this.$nuxt.$emit("getNotification", true);
                    this.reason = ''
                }, 1000)
                this.isProcessing = false
            } else {
                if (reassign_attendance && !reassign_attendance.success) {
                    this.reassign_progress = false
                    this.snack = true;
                    this.snackText = reassign_attendance.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.reassign_progress = false
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }
        },
        async reassignLeave() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.isProcessing = true
            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                manager_id: this.user._id,
                reassign_manager_id: this.selectedManager._id,
                leave_id: this.data._id,
                user_id: this.data.user_id,
                reason: this.reason,
                admin: this.adminCentral,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let reassign_leave = await this.$axios.$post("/leaves/reassign_leave", body, { headers: { Authorization: AuthStr } })

            if (reassign_leave && reassign_leave.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.snack = true
                this.snackText = 'The request is successfully reassigned'
                this.snackColor = 'green'
                this.letter_reasign = false
                this.reassign_progress = false
                setTimeout(() => {
                    this.$nuxt.$emit('refreshRequests', true)
                    this.$nuxt.$emit("getNotification", true);
                    this.reason = ''
                }, 1000)
                this.isProcessing = false
            } else {
                if (reassign_leave && !reassign_leave.success) {
                    this.reassign_progress = false
                    this.snack = true;
                    this.snackText = reassign_leave.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.reassign_progress = false
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }
        },
        getCompanyInformation() {
            let company = this.companyData.filter((a) => a._id == this.user.company_id)
            console.log('company', company)
            return company.length > 0 ? company[0] : ''
        },
        async approveClaimsRequest(data, id) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: data.user_id,
                claim_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let approve_claim = await this.$axios.$post('/claim/approve_claim', body, { headers: { Authorization: AuthStr } })

            if (approve_claim && approve_claim.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.approveDialog = false
                this.snack = true;
                this.snackText = 'Claim Approved'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (approve_claim && !approve_claim.success) {
                    this.snack = true;
                    this.snackText = approve_claim.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }

            }
        },
        async approveEducationRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            // if(this.approverAttachmentFile.length>0){
            //     await this.uploadApproverFile()
            // }

            let body = {
                user_id: data.user_id,
                education_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                // approver_attachment: this.approverAttachmentFiles,
                // hide_attachment: this.hideAttachment
            }

            let approve_education = await this.$axios.$post('/loan/approve_education', body, { headers: { Authorization: AuthStr } })

            if (approve_education && approve_education.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.approveDialog = false
                this.snack = true;
                this.snackText = 'Request Approved'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (approve_education && !approve_education.success) {
                    this.snack = true;
                    this.snackText = approve_education.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }

            }
        },
        async approvePassportReleaseRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            // if(this.approverAttachmentFile.length>0){
            //     await this.uploadApproverFile()
            // }

            let body = {
                user_id: data.user_id,
                passport_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                // approver_attachment: this.approverAttachmentFiles,
                // hide_attachment: this.hideAttachment
            }

            let approve_request = await this.$axios.$post('/passport/approve_passport_release', body, { headers: { Authorization: AuthStr } })

            if (approve_request && approve_request.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.approveDialog = false
                this.snack = true;
                this.snackText = 'Request Approved'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (approve_request && !approve_request.success) {
                    this.snack = true;
                    this.snackText = approve_request.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }

            }
        },

        async approvePassportSafekeepRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            // if(this.approverAttachmentFile.length>0){
            //     await this.uploadApproverFile()
            // }

            let body = {
                user_id: data.user_id,
                passport_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                // approver_attachment: this.approverAttachmentFiles,
                // hide_attachment: this.hideAttachment
            }

            let approve_request = await this.$axios.$post('/passport/approve_passport_safekeep', body, { headers: { Authorization: AuthStr } })

            if (approve_request && approve_request.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.approveDialog = false
                this.snack = true;
                this.snackText = 'Request Approved'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (approve_request && !approve_request.success) {
                    this.snack = true;
                    this.snackText = approve_request.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }

            }
        },
        async approveSalaryAdjustmentRequest(data) {

            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            let log_obj = {
                created_by: this.user._id,
                status: 'Approved',
                createdDate: new Date().toISOString(),
                reason: this.reason
            }
            data.hasOwnProperty('logs') ? data.logs.push(log_obj) : data.logs[{ log_obj }]
            this.$axios.$post('/salaryAdjustment/approve/', { adjustment: data, userID: this.user._id, reason: this.reason }, { headers: { Authorization: AuthStr } })
                .then(res => {
                    if (res.success) {
                        this.approveDialog = false
                        this.snack = true;
                        this.snackText = 'Salary Adjustment Approved'
                        this.snackColor = 'success'
                        this.$nuxt.$emit('refreshRequests', true)
                        setTimeout(() => {
                            this.snack = false
                        }, 1000)
                    }

                })
                .catch(err => console.log(err))
        },
        async rejectSalaryAdjustmentRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)
            let log_obj = {
                created_by: this.user._id,
                status: 'Rejected',
                createdDate: new Date().toISOString(),
                reason: this.reason
            }
            data.hasOwnProperty('logs') ? data.logs.push(log_obj) : data.logs[{ log_obj }]
            console.log(data)
            this.$axios.$post('/salaryAdjustment/reject/', { adjustment: data, userID: this.user._id, reason: this.reason }, { headers: { Authorization: AuthStr } })
                .then(res => {
                    if (res.success) {
                        this.approveDialog = false
                        this.snack = true;
                        this.snackText = 'Salary Adjustment Rejected'
                        this.snackColor = 'success'
                        this.$nuxt.$emit('refreshRequests', true)
                        setTimeout(() => {
                            this.snack = false
                        }, 1000)
                    }

                })
                .catch(err => console.log(err))
        },
        async approveLoanRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            // if(this.approverAttachmentFile.length>0){
            //     await this.uploadApproverFile()
            // }


            let body = {
                user_id: data.user_id,
                loan_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                // approver_attachment: this.approverAttachmentFiles,
                // hide_attachment: this.hideAttachment
            }

            let approve_loan = await this.$axios.$post('/loan/approve_loan', body, { headers: { Authorization: AuthStr } })

            if (approve_loan && approve_loan.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.approveDialog = false
                this.snack = true;
                this.snackText = 'loan Approved'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (approve_loan && !approve_loan.success) {
                    this.snack = true;
                    this.snackText = approve_loan.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }

            }
        },
        async approveAttendanceRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: data.user_id,
                attendance_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let approve_attendance = await this.$axios.$post('/attendance/approve_attendance', body, { headers: { Authorization: AuthStr } })

            if (approve_attendance && approve_attendance.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.approveDialog = false
                this.snack = true;
                this.snackText = 'Attendance Approved'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (approve_attendance && !approve_attendance.success) {
                    this.snack = true;
                    this.snackText = approve_attendance.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }

            }
        },
        async rejectAttendanceRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: data.user_id,
                attendance_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let reject_attendance = await this.$axios.$post('/attendance/reject_attendance', body, { headers: { Authorization: AuthStr } })

            if (reject_attendance && reject_attendance.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.rejectDialog = false
                this.snack = true;
                this.snackText = 'Attendance Rejected'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (reject_attendance && !reject_attendance.success) {
                    this.snack = true;
                    this.snackText = reject_attendance.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }
        },
        async approveLeave(data) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: this.data.user_id,
                leave_id: this.data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let apporve_leave = await this.$axios.$post('/leaves/approve_leave', body, {
                headers: { Authorization: AuthStr },
            })

            if (apporve_leave && apporve_leave.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                /**
                 * in future if want to create an outlook event whenever leave created
                 */
                let o365_leave_event = await this.$axios.$post('/leaves/leave_event', body)

                this.approveDialog = false
                this.snack = true;
                this.snackText = 'Leave Approved'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)

                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (apporve_leave && !apporve_leave.success) {
                    this.snack = true;
                    this.snackText = apporve_leave.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }

        },
        async rejectLeaveRequest() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: this.data.user_id,
                leave_id: this.data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let reject_leave = await this.$axios.$post('/leaves/reject_leave', body, { headers: { Authorization: AuthStr } })

            if (reject_leave && reject_leave.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.rejectDialog = false
                this.snack = true;
                this.snackText = 'Leave Rejected'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (reject_leave && !reject_leave.success) {
                    this.snack = true;
                    this.snackText = reject_leave.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }
        },
        async approveLetterRequest(data) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
                for (let approvalIndex = 0; approvalIndex < data.approvals.length; approvalIndex++) {
                    const element = data.approvals[approvalIndex];
                    if (element.status.toLowerCase() == 'processing') {
                        element.approver_attachment = this.approverAttachmentFiles
                        element.hide_attachment = this.hideAttachment
                        break
                    }
                }
            }

            const lettersClass = new Letters()
            let obj_requestInfo = data
            let str_reason = this.reason
            let obj_admin = this.user
            let arr_users = this.users




            let req_user = this.users.filter((a) => a._id == data.user_id);
            const LetterEmailClass = new LetterEmail()
            let obj_companyInfo = this.getCompanyInformation()
            let obj_userInfo = req_user.length > 0 ? req_user[0] : {}

            if (this.adminCentral) {
                let request = lettersClass.funAdminLetterApprove(obj_requestInfo, str_reason, obj_admin, arr_users)
                data = request.obj_requestInfo
                this.emailBody.email = request.arr_user_email[0].email
            } else {
                let request = lettersClass.funManagerLetterApprove(obj_requestInfo, str_reason, obj_admin, arr_users)
                data = request.obj_requestInfo
                this.emailBody.email = request.arr_user_email[0].email
            }

            if (this.adminCentral) {
                data.appliction_log.push({
                    approver_id: this.user._id,
                    status: 'Approved by Admin',
                    date_created: new Date(),
                    reason: str_reason,
                })
            } else {
                data.appliction_log.push({
                    approver_id: this.user._id,
                    status: 'Approved by ' + this.user.first_name,
                    date_created: new Date(),
                    reason: str_reason,
                })
            }


            let approver_id = ''
            for (let index = 0; index < data.approvals.length; index++) {
                const element = data.approvals[index];
                if (element.status.toLowerCase() == 'processing') {
                    approver_id = element.approver_id
                    break
                }
            }
            // if(data.approvals[0].approver_attachment){
            //     data.approvals[0].approver_attachment.push(...this.approverAttachmentFiles)
            // }else{
            //     data.approvals[0].approver_attachment = this.approverAttachmentFiles
            // }
            // data.approvals[0].hide_attachment = this.hideAttachment

            let approver = this.users.filter((ele) => ele._id == approver_id)
            let obj_managerInfo = approver.length > 0 ? approver[0] : {}
            if (data.status == 'completed') {
                // data.appliction_log.push({
                //     approver_id: this.user._id,
                //     status: 'Letter Request Approved',
                //     date_created: new Date(),
                //     reason: str_reason,
                // })
                if (this.adminCentral) {
                    let email = LetterEmailClass.funLetterApprovedAdmin(data, obj_companyInfo, obj_userInfo, arr_users, str_reason)
                    this.emailBody.subjectMsg = email.subject
                    this.emailBody.eMessage = email.body
                } else {
                    let email = LetterEmailClass.funLetterApproved(data, obj_companyInfo, obj_userInfo, arr_users, str_reason)
                    this.emailBody.subjectMsg = email.subject
                    this.emailBody.eMessage = email.body
                }

            } else {
                let email = LetterEmailClass.funLetterRequestApprovalManager(data, obj_companyInfo, obj_userInfo, obj_managerInfo)
                this.emailBody.subjectMsg = email.subject
                this.emailBody.eMessage = email.body
            }


            this.emailBody.hr_email = this.config_details.SYSTEM_EMAIL_ID


            this.$axios.$put('requests/update-request/' + data._id, data, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.dialog_approve = false
                    this.snack = true;
                    this.snackText = 'Request Successfully Completed'
                    this.snackColor = 'success'
                    this.$nuxt.$emit('refreshRequests', true)
                    this.$axios.$post('users/send-email/', this.emailBody, { headers: { Authorization: AuthStr } })
                        .then(res => {
                            this.pageLimit = 12
                            this.skipCount = 0
                            this.arr_letters = []
                            this.nextReq = false
                            // this.getLetters(true)
                            this.approveDialog = false
                            // this.$nuxt.$emit('refreshRequests', true)
                            if (data.status == 'completed') {
                                let letter_download_body = {
                                    req_id: data._id,
                                    user_id: data.user_id,
                                    company_id: req_user.company_ID,
                                    bln_newLetter: false
                                }

                                this.$axios.$post('/letter/letter_download', letter_download_body, { headers: { Authorization: AuthStr } })
                                this.$nuxt.$emit('downloadLetterApprove')
                                /* Send notification to applicant */
                                let assigned_arr = this.user._id
                                notificationMethod.new(assigned_arr, data.user_id, "Your Letter request is Approved.", 'Letter Request Approved', '/dashboards/myhr#letter')
                            } else {
                                /* Send notification to next approver */
                                let assigned_arr = this.user._id
                                notificationMethod.new(assigned_arr, obj_managerInfo._id, "New Letter Request is pending for your approval.", 'Letter Request Pending Approval', '/dashboards/my-team#requests')
                            }
                            // setTimeout(()=> {
                            //     this.$router.go()
                            // }, 2000)
                        }).catch()
                }).catch();
            this.approverAttachmentFile = []
            this.approverAttachmentFiles = []
        },


        /* Approve the WFH request using new API and package
            {
                "user_id": "632d552a0e852a48808bb8d6",
                "wfh_id": "632db6e01f998abdac850780",
                "manager_id": "5fd9fe077885360c2818fc2d",
                "reason": "Team Central Approve",
                "admin" : false
            }        
         */
        async approveWfhRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: data.user_id,
                wfh_id: data._id,
                manager_id: this.user._id,
                reason: this.reason,
                admin: this.userType == "ADMIN",
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            this.$axios.$post('/wfh/approve_wfh', body, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.approverAttachmentFile = []
                    this.approverAttachmentFiles = []
                    this.$nuxt.$emit('refreshRequests', true)
                    this.snack = true
                    this.snackText = 'The request is successfully approved'
                    this.snackColor = 'green'
                    this.approveDialog = false
                    // this.$router.go()
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }).catch(err => console.log(err))

        },
        /* Reject the WFH request using new API and package
            {
                "user_id": "632d552a0e852a48808bb8d6",
                "wfh_id": "632db6e01f998abdac850780",
                "manager_id": "5fd9fe077885360c2818fc2d",
                "reason": "Team Central Approve",
                "admin" : false
            }        
        */
        async rejectWfhRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: data.user_id,
                wfh_id: data._id,
                manager_id: this.user._id,
                reason: this.reason,
                admin: this.userType == "ADMIN",
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            this.$axios.$post('/wfh/reject_wfh', body, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.approverAttachmentFile = []
                    this.approverAttachmentFiles = []
                    this.$nuxt.$emit('refreshRequests', true)
                    this.snack = true
                    this.snackText = 'The request is successfully rejected'
                    this.snackColor = 'error'
                    this.approveDialog = false
                    // this.$router.go()
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }).catch(err => {
                    console.log(err)
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                })
        },

        /* Reassign the manager using new API and package 
            {
                "manager_id": "5fa24825a8e9cddf8f35df70",
                "reassign_manager_id": "5fd9fe077885360c2818fc2d",
                "wfh_id": "632d72d6368f59782085db62",
                "user_id": "616e6d5195ae5b3f1adc87dc",
                "reason": "Testing Payload "
            }
        */
        async reassignWfh() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            this.isProcessing = true
            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                manager_id: this.user._id,
                reassign_manager_id: this.selectedManager._id,
                wfh_id: this.data._id,
                user_id: this.data.user_id,
                reason: this.reason,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            this.$axios.$post('/wfh/reassign_wfh', body, { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.approverAttachmentFile = []
                    this.approverAttachmentFiles = []
                    this.snack = true
                    this.snackText = 'The request is successfully reassigned'
                    this.snackColor = 'green'
                    this.reassign_progress = false
                    this.letter_reasign = false
                    // this.$nuxt.$emit('refreshRequests', true)
                    setTimeout(() => {
                        this.$nuxt.$emit('refreshRequests', res.data)
                        this.$nuxt.$emit("getNotification", true);
                        this.reason = ''
                    }, 1000)
                    this.isProcessing = false
                }).catch(err => {
                    console.log(err)
                    this.reassign_progress = false
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                })
        },


        async rejectRequest(data) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
                for (let approvalIndex = 0; approvalIndex < data.approvals.length; approvalIndex++) {
                    const element = data.approvals[approvalIndex];
                    if (element.status.toLowerCase() == 'processing') {
                        element.approver_attachment = this.approverAttachmentFiles
                        element.hide_attachment = this.hideAttachment
                        break
                    }
                }
            }

            const lettersClass = new Letters()
            let obj_requestInfo = data
            let str_reason = this.reason
            let obj_admin = this.user
            let arr_users = _.cloneDeep(this.users)

            let obj_company_details_rejection = this.getCompanyInformation().rejection_flow
            if (this.adminCentral) {
                let request = lettersClass.funAdminLetterReject(obj_requestInfo, str_reason, obj_admin, arr_users, obj_company_details_rejection)
                data = request.obj_requestInfo
                this.emailBody.email = request.arr_user_email[0]?.email
            } else {
                let request = lettersClass.funManagerLetterReject(obj_requestInfo, str_reason, obj_admin, arr_users, obj_company_details_rejection)
                data = request.obj_requestInfo
                this.emailBody.email = request.arr_user_email[0].email
            }


            let req_user = this.users.filter((a) => a._id == data.user_id);
            const LetterEmailClass = new LetterEmail()
            let obj_companyInfo = this.getCompanyInformation()
            let obj_userInfo = req_user.length > 0 ? req_user[0] : {}


            if (data.appliction_log) {
                if (this.adminCentral) {
                    data.appliction_log.push({
                        approver_id: this.user._id,
                        status: 'Rejected By Admin',
                        date_created: new Date(),
                        reason: str_reason,
                    })
                } else {
                    data.appliction_log.push({
                        approver_id: this.user._id,
                        status: 'Rejected by ' + this.user.first_name,
                        date_created: new Date(),
                        reason: str_reason,
                    })
                }
            }

            // if(data.approvals[0].approver_attachment){
            //     data.approvals[0].approver_attachment.push(...this.approverAttachmentFiles)
            // }else{
            //     data.approvals[0].approver_attachment = this.approverAttachmentFiles
            // }
            // data.approvals[0].hide_attachment = this.hideAttachment

            if (data.status == 'Cancelled') {
                // data.appliction_log.push({
                //     approver_id: this.user._id,
                //     status: 'Letter Request Rejected',
                //     date_created: new Date(),
                //     reason: str_reason,
                // })
                if (this.adminCentral) {
                    let email = LetterEmailClass.funLetterRejectedAdmin(data, obj_companyInfo, obj_userInfo, arr_users, str_reason)
                    this.emailBody.subjectMsg = email.subject
                    this.emailBody.eMessage = email.body
                } else {
                    let email = LetterEmailClass.funLetterRejected(data, obj_companyInfo, obj_userInfo, arr_users, str_reason)
                    this.emailBody.subjectMsg = email.subject
                    this.emailBody.eMessage = email.body
                }

            } else {
                let email = LetterEmailClass.funLetterRequestApprovalManager(data, obj_companyInfo, obj_userInfo, obj_admin)
                this.emailBody.subjectMsg = email.subject
                this.emailBody.eMessage = email.body
            }

            this.emailBody.hr_email = this.config_details.SYSTEM_EMAIL_ID

            // update the request specific list

            if (data.request_type == 'wfh') {
                this.$axios.$put('wfh/update/' + data._id, [data], { headers: { Authorization: AuthStr } })
                    .then(res => {
                        this.rejectDialog = false
                        this.snack = true;
                        this.snackText = 'Request successfully Rejected'
                        this.snackColor = 'error'
                        this.$nuxt.$emit('refreshRequests', true)
                        this.$axios.$post('users/send-email/', this.emailBody, { headers: { Authorization: AuthStr } })
                            .then(res => {

                            }).catch()
                    })
            } else {
                this.$axios.$put('requests/update-request/' + data._id, data, { headers: { Authorization: AuthStr } })
                    .then(res => {
                        this.rejectDialog = false
                        this.snack = true;
                        this.snackText = 'Request successfully Rejected'
                        this.snackColor = 'error'
                        this.$nuxt.$emit('refreshRequests', true)
                        this.$axios.$post('users/send-email/', this.emailBody, { headers: { Authorization: AuthStr } })
                            .then(res => {

                            }).catch()

                    }).catch();
            }
            this.approverAttachmentFile = []
            this.approverAttachmentFiles = []
        },
        async rejectClaimsRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            if (this.approverAttachmentFile.length > 0) {
                await this.uploadApproverFile()
            }

            let body = {
                user_id: data.user_id,
                claim_id: data._id,
                manager_id: this.user._id,
                admin: this.adminCentral,
                reason: this.reason,
                approver_attachment: this.approverAttachmentFiles,
                hide_attachment: this.hideAttachment
            }

            let reject_claim = await this.$axios.$post('/claim/reject_claim', body, { headers: { Authorization: AuthStr } })

            if (reject_claim && reject_claim.success) {
                this.approverAttachmentFile = []
                this.approverAttachmentFiles = []
                this.rejectDialog = false
                this.snack = true;
                this.snackText = 'Claim Rejected'
                this.snackColor = 'success'
                this.$nuxt.$emit('refreshRequests', true)
                setTimeout(() => {
                    this.snack = false
                }, 1000)
            } else {
                if (reject_claim && !reject_claim.success) {
                    this.snack = true;
                    this.snackText = reject_claim.message
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                } else {
                    this.snack = true;
                    this.snackText = "Unable to process request, Please try again later."
                    this.snackColor = 'error'
                    setTimeout(() => {
                        this.snack = false
                    }, 1000)
                }
            }


        },
        async rejectLoanRequest(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            // let body = {
            //     user_id: data.user_id,
            //     claim_id: data._id,
            //     manager_id: this.user._id,
            //     admin: this.adminCentral,
            //     reason: this.reason
            // }

            // let reject_claim = await this.$axios.$post('/claim/reject_claim', body, {headers: { Authorization: AuthStr }})

            // if (reject_claim && reject_claim.success) {
            //     this.rejectDialog = false
            //     this.snack = true;
            //     this.snackText = 'Claim Rejected'
            //     this.snackColor = 'success'
            //     this.$nuxt.$emit('refreshRequests', true)
            //     setTimeout(() => {
            //         this.snack = false
            //     }, 1000)
            // } else {
            //     if (reject_claim && !reject_claim.success) {
            //         this.snack = true;
            //         this.snackText = reject_claim.message
            //         this.snackColor = 'error'
            //         setTimeout(() => {
            //             this.snack = false
            //         }, 1000)
            //     } else {
            //         this.snack = true;
            //         this.snackText = "Unable to process request, Please try again later."
            //         this.snackColor = 'error'
            //         setTimeout(() => {
            //             this.snack = false
            //         }, 1000)
            //     }
            // }


        },
        dateFormatter(val) {
            return val ? moment(val).format('DD-MM-YYYY') : ''
        },
        getCompanyInformation() {
            let company = this.companyData.filter((a) => a._id == this.user.company_id)
            return company.length > 0 ? company[0] : ''
        },
        async getLeaveHistory() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            const selectedUser = (this.users.filter((user) => user._id === this.data.user_id))[0];


            let body = {
                applied_user_id: this.data.user_id,
                limit: 12,
                skip: 0,
                userType: this.userType,
                user_id: this.user._id
            };
            this.nextReq = true
            await this.$axios.$post("/leaves/get_leave_history", body, { headers: { Authorization: AuthStr } }).then((res) => {

                // if (user_letters && user_letters.length > 0) {          
                //     this.nextReq = false
                //     this.skipCount += 12
                //     this.arr_leaves = user_letters
                //     _.uniq(this.arr_leaves)
                // }
                this.arr_leaves = res
            }).catch((error) => {
                console.log(error);
            })
        },
        async getLeaveBuddy() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            const selectedUser = (this.users.filter((user) => user._id === this.data.user_id))[0];

            let body = {
                str_applied_user_id: selectedUser._id,
                str_dept: selectedUser.reporting.department,
                str_team: selectedUser.reporting.team,
                str_from_date: this.data.from_date,
                str_to_date: this.data.to_date
            };


            this.isRequestingLeaveBuddy = true;
            await this.$axios.$post("/leaves/get_leave_buddy", body, { headers: { Authorization: AuthStr } }).then((res) => {
                this.leaveBuddies = res;
                this.isRequestingLeaveBuddy = false;
            }).catch((error) => {
                this.isRequestingLeaveBuddy = false;
            })
        },
        getEmail(val) {
            let abc = this.users.filter(a => a._id == val)
            if (abc.length > 0) {
                return abc[0].email
            }
            else {
                return ''
            }
        },
        approveTemp(data) {
            this.approveDialog = true
            this.reason = '';
            this.approveID = data._id;
            this.claimItems = [];
            if (data.request_type === "claims") {
                this.claimItems = data;
                for (let i = 0; i < this.claimItems.length; i++) {
                    this.selectedClaims.push(this.claimItems[i]._id);
                }
            }
        },
        onChangeTab(tab) {

            switch (tab) {
                case "leave-history-summary": this.getLeaveHistory(); break;
                case "list-leave-buddy": this.getLeaveBuddy(); break;
                default: break;
            }
        },
        getUserTitle(val) {
            if (val.personal.gender == 'Male') {
                return 'Mr.';
            }
            else if (val.personal.gender == 'Female') {
                if (val.personal.marital_status == 'Married') {
                    return 'Mrs.';
                }
                else {
                    return 'Ms.';
                }
            }
            else {
                return '';
            }
        },
        getUserName(val) {
            let abc = this.users.filter(a => a._id == val)
            if (abc.length > 0) {
                return abc[0].first_name + " " + abc[0].last_name
            }
            else {
                return ''
            }
        },
        changeName(status) {
            let appStatus = status ? status.toLowerCase() : ""
            if (appStatus == 'completed') return 'Approved'
            if (appStatus == 'cancelled') return 'Rejected'
            if (appStatus == 'processing') return 'In Progress'
            if (appStatus == 'withdrawn') return 'Withdrawn'
            if (appStatus == 'pending') return 'Pending'
        },
        getStatusColorTooltip(val) {
            if (val == "Completed") return "teal";
            else if (val == "Processing") return "amber";
            else if (val == "Cancelled") return "red";
            else return "grey";
        },
        getStatusBorderColor(val) {
            if (val == 'Processing' || val == 'processing') return 'border-left: #F2B626 solid 3px;'
            else if (val == 'Rejected' || val == 'rejected') return 'border-left: #FD5959 solid 3px;'
            else if (val == 'Withdrawn' || val == 'withdrawn') return 'border-left: #FD5959 solid 3px;'
            else if (val == 'Active' || val == 'active') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Completed') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Cancelled') return 'border-left: #FD5959 solid 3px;'
            else if (val == 'completed') return 'border-left: #00E67A solid 3px;'
            else if (val == 'Approved') return 'border-left: #00E67A solid 3px;'
            else return 'border-left: grey solid 3px;'
        },
        rejectTemp(id) {
            this.rejectDialog = true
            this.reason = '';
            this.rejectID = id
        },
        openDocumentURL(val) {
            window.open(val)
        },
        numberFormat(n) {
            return parseInt(n) > 9 ? parseInt(n) : parseInt(n) < 1 ? n : ("0" + parseInt(n));
        },
        getImage(val) {
            let image = 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
            if (this.users.length > 0) {
                let abc = this.users.filter(a => a._id == val)
                if (abc.length > 0) {
                    if (abc[0].hasOwnProperty('image_url')) {
                        if (abc[0].image_url != '') image = abc[0].image_url
                    }
                }
            }
            return image
        },
        getName(val) {
            if (this.users.length > 0) {
                let abc = this.users.filter(a => a._id == val)
                if (abc.length > 0) {
                    return abc[0].first_name + ' ' + abc[0].last_name
                } else {
                    return ''
                }
            } else {
                return ''
            }
        },
        getColor(val) {
            if (val == 'Submitted') return 'teal'
            else if (val == 'Processing' || val == 'processing') return '#FCF3D8'
            else if (val == 'Completed' || val == 'completed' || val == 'Approved' || val == 'Approved by Admin' || val.startsWith('Approved by')) return '#CAF8E9'
            else if (val == 'Cancelled' || val == 'cancelled' || val == 'Rejected') return '#FFEBEC'
            else if (val == 'Cancelled by Admin' || val == 'Rejected by Admin') return '#FFEBEC'
            else if (val == 'Reassigned') return 'blue lighten-5'
            else if (val.includes('Reassigned by')) return 'blue lighten-5'
            else return '#DCE1E6'
        },
        getLeaveStatus(val) {
            if (val.status == 'Completed' || val.status == 'completed') {
                let toDate = moment(val.to_date).format('YYYY-MM-DD')
                let Today = moment().format('YYYY-MM-DD')
                if (toDate >= Today) {
                    return 'Scheduled'
                } else {
                    return 'Approved'
                }
            } else {
                return val.status
            }
        },
        approvalStatusIcon(val) {
            if (val == 'Processing' || val == 'processing') return 'mdi-check'
            else if (val == 'Approved' || val == 'approved' || val == 'Approved by Admin' || val.startsWith('Approved by')) return 'mdi-check'
            else if (val == 'Cancelled' || val == 'cancelled') return 'mdi-close'
            else if (val == 'Cancelled by Admin' || val == 'Rejected by Admin') return 'mdi-close'
            else return 'mdi-close'
        },
        approvalStatusColor(val) {
            if (val == 'Processing') return "#F2B626"
            else if (val == 'Approved' || val == 'Approved by Admin' || val.startsWith('Approved by')) return "#00E67A"
            else if (val == 'Cancelled by Admin' || val == 'Rejected by Admin') return '#FD5959'
            else if (val == 'Cancelled' || val == 'Rejected') return "#FD5959"
            else return 'grey'
        },
        getStatusName(requestStatus, approvalStatus) {
            if (requestStatus == 'withdrawn' && approvalStatus == 'Pending') {
                return 'Withdrawn by User'
            } else if (approvalStatus == 'Cancelled by Admin') {
                return 'Rejected by Admin'
            } else {
                return approvalStatus
            }
        },
        updateReason(data) {
            this.reason = data
        },
        approveText(data) {
            return data.hasOwnProperty('leave_type') ? this.approveLeaveText : this.approveLetterText
        },
        rejectText(data) {
            return data.hasOwnProperty('leave_type') ? this.rejectLeaveText : this.RejectText
        },
        isApprovalCommentIsLong(msg) {
            if (!msg) return false;
            return (msg).length > 200 ? true : false;
        },
        getFormattedText(key) {
            return key?.length ? key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
        },
    },
    computed: {
        getPayroll() {
            return this.data.payroll_process ? 'Through Payroll' : 'Outside Payroll'
        },
        computeDateRequest() {
            return moment(String(this.data.date_created)).format(this.data.previewStyles ? this.data.previewStyles.date_format : 'DD-MM-YYYY')
        },
        replaceLetterkey() {
            this.request.letter_keys = this.filterLetterFormats.letterKeys
            this.request.user_keys = this.filterLetterFormats.user_keys
            let userInfo = this.getUserDetails.length > 0 ? this.getUserDetails[0] : {}
            let letter_template = this.filterLetterFormats
            let requestInfo = this.request
            let bln_newLetter = true
            let arr_companies = this.companyData

            const Letter = new Letters()
            let LetterContent = Letter.computeLetterContent(userInfo, letter_template, requestInfo, bln_newLetter, arr_companies)
            return LetterContent
        },

        computeExistingLetterSubject() {
            let addressee = this.data.letter_fields.subject
            return addressee
        },
        replaceComputedHeader() {
            if (this.data != "") {
                let userInfo = this.users.filter(ele => ele._id == this.data.user_id)[0]
                let letter_template = this.data
                let requestInfo = this.data
                let arr_companies = this.companyData
                let bln_newLetter = false
                const Letter = new Letters()
                let Addressee = Letter.computeLetterAddressee(userInfo, letter_template, requestInfo, bln_newLetter, arr_companies)
                return Addressee
            }
        },
        replaceComputedLetterKey() {
            if (this.data != "") {
                let userInfo = this.users.filter(ele => ele._id == this.data.user_id)[0]
                let letter_template = this.data
                let requestInfo = this.data
                let arr_companies = this.companyData
                let bln_newLetter = false
                const Letter = new Letters()
                let LetterContent = Letter.computeLetterContent(userInfo, letter_template, requestInfo, bln_newLetter, arr_companies)
                return LetterContent
            }
        },
        computeinlineStyleExistingLetter() {
            return {
                backgroundImage: `url(${this.data.letterImages ? this.data.letterImages.waterMarkLink : ''})`
            }
        },
        leftSidebarLinkExistingLetter() {
            return {
                backgroundImage: `url(${this.data.letterImages ? this.data.letterImages.leftSideBarLink : ''})`
            }
        },
        rightSidebarLinkExistingLetter() {
            return {
                backgroundImage: `url(${this.data.letterImages ? this.data.letterImages.rightSideBarLink : ''})`
            }
        },
        filterLetterFormat() {
            if (this.computedServiceList) {
                /*let result =this.configData[0].letterRequest.filter(a=> a.letterDescription.requestType == this.computedServiceList.letter_type)
                return result[0]*/
                let result = this.configData[0].letterRequest.filter(a => {
                    if (a.letterDescription.requestSubType == "") {
                        return a.letterDescription.requestType == this.computedServiceList.letter_type
                    }
                    else {
                        return (a.letterDescription.requestSubType == this.computedServiceList.letter_sub_type && a.letterDescription.requestType == this.computedServiceList.letter_type)
                    }
                })
                return result[0]
            }
        },

        filterLetterFormats() {
            let result = this.configData[0].letterRequest.filter(a => {
                if (a.letterDescription.requestSubType == "") {
                    return a.letterDescription.requestType == this.request.letter_type
                }
                else {
                    return (a.letterDescription.requestSubType == this.request.letter_sub_type && a.letterDescription.requestType == this.request.letter_type)
                }
            })
            return result[0]
        },
        computedServiceList() {
            if (
                this.data == "" ||
                this.data == null ||
                this.data == undefined
            ) {
                return "";
            } else {
                return this.data;
            }
        },
        computedLeavesForHistory() {
            let abc = this.users.filter(
                (a) => a._id == this.data.user_id
            );

            return abc.length > 0 ? abc[0].leaves : {};
        },
        approvalAccess() {
            if (this.adminCentral == true) {
                if (this.data.status.toLowerCase() != "withdrawn" && this.data.status.toLowerCase() != "cancelled") {

                    return true
                }
            } else if (this.userType == 'SELF') {
                if (this.data.status.toLowerCase() != "withdrawn" && this.data.status.toLowerCase() != "cancelled" && this.data.status.toLowerCase() != "completed" && this.data.status.toLowerCase() != "Completed") {
                    return true
                }
            }
            else {
                let approvals = this.data.approvals.filter(item => item.status == 'Processing');
                if (approvals.length > 0 && approvals[0].approver_id == this.user._id) {
                    return true
                } else {
                    return false
                }
            }
        }
    }
}
</script>
<style >
#leave-request-tab .v-tabs-slider-wrapper {
    display: none;
}

.v-autocomplete__content.v-menu__content {
    margin-top: 0 !important;
}

#leave-request-tab .v-tab--active {
    color: #0064D7 !important;
    background-color: #F0F8FF !important;
}

.letterApproval .v-timeline-item__dot {
    box-shadow: none !important;
}
</style>
<style  lang="scss">
.redTextForm {
    .v-text-field__details {
        display: block !important;

        .v-messages {
            .v-messages__wrapper {
                .v-messages__message {
                    color: #f42121 !important;
                }
            }
        }
    }
}

.rounded-circle {
    background-color: rgb(92, 126, 239);
    color: #fff;
}
</style>
