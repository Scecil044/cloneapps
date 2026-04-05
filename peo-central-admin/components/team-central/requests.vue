<template>
    <div class="pt-3">
        <v-row class="pt-0 ml-0 pr-5">
            <v-col cols="12" md="6" class="pa-0 pr-5">
                <v-card class="rounded-xl allRequests" style="box-shadow: 0px  24px 30px #959EA51A;" min-height="720px"
                    max-height="720px" v-if="createRequest == true">
                    <v-row class="mx-0" style="max-width:100%" justify="center">
                        <v-col cols="12" class="pa-0 ">
                            <v-card-title>
                                <v-select :items="computeRequestTypeList(requestTypeList)"
                                    placeholder="Request Type" v-model="requestType" item-text="name"
                                    item-value="value" dense outlined class="customMdiMenuDown rounded-xl mt-5"
                                    style="max-width: 43%;margin: 0 auto;"></v-select>
                                <v-row style="float: right;">
                                    <v-spacer></v-spacer>
                                    <v-tooltip bottom color="primary" v-if="requestType == 'Claims'">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-img @click="newClaim = false" src="/hr/information.png" class="mx-2"
                                                style="cursor:pointer;" justify-self="end" v-bind="attrs" v-on="on"
                                                max-width="25" height="auto" contain></v-img>
                                        </template>
                                        <span>
                                            <p style="color: white !important;"
                                                class="mb-0 font-weight-light grey-heading-text caption"
                                                >Here, you can raise a claim request
                                                for the expenses you made. Make sure that all the below points are followed.
                                            </p>
                                            <ul class="pt-0 font-weight-light white-text caption">
                                                <li class="">All fields are mandatory.
                                                </li>
                                                <li class="" >If you don't find
                                                    your claim type, please select "Others" category and mention the details
                                                    in the description.</li>
                                                <li class="">Attaching a
                                                    receipt is compulsory. Make sure the file size is not more than 2MB.
                                                </li>
                                            </ul>
                                        </span>
                                    </v-tooltip>
                                    <v-img
                                        @click="createRequest = false, leavePlanner = false, resetLeaveFormFn(), resetClaimConfig()"
                                        src="/dashboard/close.svg" style="cursor:pointer;align-self:start"
                                        justify-self="end" max-width="25" height="auto" contain></v-img>
                                </v-row>
                            </v-card-title>
                        </v-col>
                        <v-col cols="12" sm="12" md="12" class="py-0 mb-5 scroll" style="max-height:600px" align="left"
                            v-if="requestType == 'Leave'">
                            <v-select :items="getEmployee" :item-text="(item) => `${item.first_name} ${item.last_name}`"
                                item-value="_id" hint="Employee" persistent-hint placeholder="Employee"
                                v-model="selectedEmployeeId" dense class="customMdiMenuDown" @change="fetchUserInfo()"
                                style="max-width: 73%;margin: 0 auto;">
                            </v-select>
                            <CreateLeaves v-if="fetchedEmployee.length > 0" :selectedEmp="fetchedEmployee[0]" :user="user"
                                :userType="'MANAGER'" :userCompany="getCompanyInformation" :configuration="configData"
                                :users="users" :leave='leave' />
                        </v-col>
                        <v-col cols="12" sm="12" md="12" class="py-0 mb-5 scroll" style="max-height:600px" align="left"
                            v-if="requestType == 'wfh'">
                            <v-select @change="fetchUserInfo()" :items="getEmployee"
                                :item-text="(item) => `${item.first_name} ${item.last_name}`" item-value="_id"
                                hint="Employee" persistent-hint placeholder="Employee"
                                v-model="selectedEmployeeId" dense class="customMdiMenuDown"
                                style="max-width: 73%;margin: 0 auto;"></v-select>
                            <CreateWfh v-if="fetchedEmployee.length > 0" :selectedEmp="fetchedEmployee[0]"
                                :request="request_wfh" :employees="[]" :user="user" :configuration="configData"
                                :users="users" :userType="'MANAGER'" />
                        </v-col>
                        <v-col cols="12" sm="12" md="12" class="py-0 mb-5 scroll" style="max-height:600px" align="left"
                            v-if="requestType == 'Claims'">
                            <v-select @change="fetchUserInfo()" :items="getEmployee"
                                :item-text="(item) => `${item.first_name} ${item.last_name}`" item-value="_id"
                                hint="Employee" persistent-hint placeholder="Employee"
                                v-model="selectedEmployeeId" dense class="customMdiMenuDown"
                                style="max-width: 73%;margin: 0 auto;"></v-select>
                            <ClaimRequest v-if="fetchedEmployee.length > 0" :claimRequest="false" :employees="[]"
                                :userType="'MANAGER'" :request='request_claims' :user='user'
                                :selectedEmp="fetchedEmployee[0]" :companyData='companyData' />
                        </v-col>
                        <v-col cols="12" sm="12" md="12" class="py-0 mb-5 scroll" style="max-height:600px" align="left"
                            v-if="requestType == 'Attendance'">
                            <v-select @change="selectedDateForAttendance = ''" :items="getEmployee"
                                :item-text="(item) => `${item.first_name} ${item.last_name}`" item-value="_id"
                                hint="Employee" persistent-hint placeholder="Employee"
                                v-model="selectedEmployeeId" dense class="customMdiMenuDown"
                                style="max-width: 73%;margin: 0 auto;"></v-select>
                            <v-row v-if="getSelectedEmployee != ''">
                                <v-col cols="12" style="text-align:center">
                                    <v-date-picker @change="getAttendanceData()" v-model="selectedDateForAttendance"
                                        @input="from1 = false" no-title scrollable></v-date-picker>
                                </v-col>
                            </v-row>


                            <EditAttendance
                                v-if="getSelectedEmployee != '' && selectedDateForAttendance != '' && selectedAttendance.length > 0"
                                :data='selectedAttendance[0]' :companyData='companyData' :users='users'
                                :userType='"MANAGER"' :selectedEmp="getSelectedEmployee[0]" :user='user'
                                @on-submitted="resetLeaveFormFn(); arr_letters = []; skipCount = 0; getAllRequestsCount()" />
                        </v-col>
                        <v-col cols="12" sm="12" md="12" class="py-0 mb-5 scroll" style="max-height:600px" align="left"
                            v-else-if="requestType == 'Letters'">
                            <!-- <v-select
                        
                        :items="getEmployee" :item-text="(item) => `${item.first_name} ${item.last_name}`" item-value="_id" hint="Employee" persistent-hint placeholder="Employee" v-model="selectedEmployeeId"
                        dense
                        class="customMdiMenuDown"
                        style="max-width: 73%;margin: 0 auto;"
                        ></v-select> -->
                            <LetterRequest v-if="configData[0].letterRequest.length > 0" :countryList="countryList"
                                :NOCOptions="NOCOptions" :employees="getEmployee" :letterRequest="true"
                                :letterOptions="letterOptions" :users="users" :request="request" :getUserDetails="[user]"
                                :emailBodyHR="emailBodyHR" :emailBody="emailBody" :user="user"
                                :addressee="this.filterLetterFormats.letterDescription.header = ! '' ? this.filterLetterFormats.letterDescription.header : replaceLetterkey"
                                :subject="computeNewLetterSubject"
                                :body="this.filterLetterFormats.letterDescription.body = ! '' ? this.filterLetterFormats.letterDescription.body : replaceLetterkey"
                                :computeCompanyLetterImages="computeCompanyLetterImages"
                                :computeLetterPDFStyles="computeLetterPDFStyles"
                                :computeLetterPreviewStyles="computeLetterPreviewStyles"
                                :computeSigantoryManager="computeSigantoryManager"
                                :letterKeys="this.filterLetterFormats.letterKeys ? this.filterLetterFormats.letterKeys : []"
                                :companyData="companyData" :totalFixedWord="totalFixedWord"
                                :basicSalaryInWords="basicSalaryInWords" :loanAmountInWords="loanAmountInWords"
                                :compensationTable="compensationTable" :personalLoanTable="personalLoanTable"
                                :personalLoanTable2="personalLoanTable2" :personalLoanTable3="personalLoanTable3"
                                :userType="'MANAGER'" />
                        </v-col>

                        <v-col cols="12" sm="12" md="12" class="py-0 mb-5 scroll" style="max-height:600px" align="left"
                            v-if="requestType == 'Salary Adjustment'">
                            <v-select :items="getEmployee" :item-text="(item) => `${item.first_name} ${item.last_name}`"
                                item-value="_id" hint="Employee" persistent-hint placeholder="Employee"
                                v-model="selectedEmployeeId" dense class="customMdiMenuDown" @change="fetchUserInfo()"
                                style="max-width: 73%;margin: 0 auto;">
                            </v-select>

                            <CreateSalaryAdjustment v-if="fetchedEmployee.length > 0" :selectedEmp="fetchedEmployee[0]"
                                :configuration="configData" />
                        </v-col>
                    </v-row>
                </v-card>
                <v-card class="rounded-xl allRequests" style="box-shadow: 0px  24px 30px #959EA51A;" min-height="720px"
                    v-else>
                    <v-card-title class="px-1 px-6">
                        <v-row class="pt-0 pl-0 mr-0 ml-0" style="align-items: center;">
                            <v-col cols="auto" class="pa-0">
                                <v-img src="/team/requestsDark.svg" max-width="fit-content" height="fit-content"
                                    class="mr-2" contain></v-img>
                            </v-col>
                            <v-col cols="auto" class="pa-0">
                                <span class="darkBlue-heading-text subHeadingFontSize">
                                    {{ viewRequestHistory == true ? 'All Requests' :
                                        "All Pending Request"
                                    }}
                                </span>
                            </v-col>
                            <v-col cols="auto" class="py-0 ">
                                <v-text-field v-model="searchRequests" @input="searchFn()" solo flat dense hide-details
                                    prepend-inner-icon="mdi-magnify" class="rounded-xl" placeholder="Search"
                                    style="background: #FFFFFF 0% 0% no-repeat padding-box;border: 0.5px solid #EFF1F3;border-radius: 18px;opacity: 1;"></v-text-field>
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-col cols="auto" class="pa-0" align-self="end">
                                <v-img src="/directory/add_plus.svg" max-width="35" height="auto"
                                    @click="createRequest = true, requestInfo = false, leavePlanner = true, showHeaderPlanner = false"
                                    class=" cursor-pointer" contain></v-img>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-divider></v-divider>
                    <div class="scroll" style="max-height:620px;min-height:620px;">
                        <div v-if="visibleData.length > 0">
                            <template>
                                <v-list two-line class="py-0" v-if="visibleData != []">
                                    <v-list-item-group v-model="selectedItem" color="blue-grey darken-3">
                                        <div v-for="data in visibleData" :key="data._id">
                                            <RequestListing :data="data" :users="users" :user="user" :emailBody="emailBody"
                                                :computedServiceList="computedServiceList"
                                                @getTeamRequestPreview="getTeamRequestPreview($event)"
                                                :viewRequestHistory='viewRequestHistory' />
                                        </div>
                                    </v-list-item-group>
                                </v-list>
                            </template>
                            <Observer @intersect="requestListScrollerObserver()" />
                            <div v-intersect>
                                <v-card class="text-center" elevation="0">
                                    <v-progress-circular v-if="loading" indeterminate color="primary"></v-progress-circular>
                                </v-card>
                            </div>
                            <!-- <Observer  v-if="showScrollObserver" @intersect="getAllRequests(false)"/> -->
                            <!-- <v-card v-intersect="getAllRequests(false)"></v-card> -->
                        </div>
                        <div v-else style="max-width:100%;min-height:100%;">
                            <v-row class="mx-0" style="max-width:100%;min-height:620px">
                                <v-col cols="12" v-if="loading == true" justify="center" align="center" class="ma-auto">
                                    <v-img
                                        src="https://i.pinimg.com/originals/6f/1a/9f/6f1a9f9d0b98384d9ae0e57c1428e67f.gif"
                                        max-width="40" height="40" class="" contain></v-img>
                                </v-col>
                                <v-col cols="12" v-else justify="center" align="center" class="ma-auto">
                                    <v-img src="/hr/empty.svg" max-width="fit-content" height="fit-content" class=""
                                        contain></v-img>
                                    <p class="font-weight-normal largeHeadingFontSize mt-3" >
                                        No Request</p>
                                    <p class="mb-0 grey-heading-text textFontSize mt-5"
                                        >You did not apply any
                                        request yet!</p>
                                </v-col>
                            </v-row>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="6" class="pa-0 pr-3">
                <v-card class="rounded-xl " style="box-shadow: 0px  24px 30px #959EA51A;" min-height="720px"
                    v-if="createRequest == true && requestType == 'Letters'">
                    <v-row class="mx-0" style="max-width:100%" justify="center">
                        <v-col cols="12" class="pa-0 ">
                            <v-card-title>
                                <span class="darkBlue-heading-text subHeadingFontSize"
                                    >Letter Preview</span>
                                <v-spacer></v-spacer>
                            </v-card-title>
                        </v-col>
                    </v-row>
                    <div>
                        <div class="scroll" style="max-height:620px;min-height:620px;">
                            <div style="max-width:100%;min-height:100%;">
                                <v-row class="mx-0" style="max-width:100%;min-height:620px">
                                    <v-col cols="12" class="px-5" v-if="getSelectedEmployee.length > 0">
                                        <v-row v-if="letterLoadingNew && filterLetterFormats"
                                            style="min-height:100%;align-items:center;justify-content:center;">
                                            <v-col cols="auto" :hint="replaceLetterkey">
                                                <div style="justify-content: center;align-items: center;display: flex;">
                                                    <v-img src="/animated/refresh.svg" max-width="fit-content" height="40"
                                                        contain class="mr-3"></v-img>
                                                </div>
                                                <div style="justify-content: center;align-items: center;display: flex;">
                                                    <p style="align-items:center;justify-content:center;"
                                                        class="mb-0 caption grey--text"
                                                       >Generating Preview</p>
                                                </div>
                                            </v-col>
                                        </v-row>
                                        <v-row v-else
                                            style="min-height:100%; min-width: 100%;align-items:center;justify-content:center;">
                                            <PreviewLetter :content='LetterPreviewContent' height='620px' />
                                        </v-row>
                                        <!-- <div v-for="(format, index2) in configData[0].letterRequest" :key="index2">
                                        <LetterPreview v-if="isLetterRequest(format)"
                                            
                                            :date="computeDateNewRequest"
                                            :dateClass="format.formattedText.formatDate"
                                            :toAddress="replaceHeader"
                                            :toAddressClass="format.formattedText.formatHeader"
                                            :subject="format.letterDescription.subject ? format.letterDescription.subject: request.letter_fields.other_requests_subject"
                                            :subjectClass="format.formattedText.formatStyle"
                                            :body="replaceLetterkey"                       
                                            :inlineStyle="inlineStyle"

                                            :leftSidebarLink="leftSidebarLink"
                                            :rightSidebarLink="rightSidebarLink"
                                            :leftSidebarCol="format.leftSidebarCol"
                                            :bodyCol="format.bodyCol"
                                            :rightSidebarCol="format.rightSidebarCol"
                                            :leftsidebar="format.leftSideBar.preview"
                                            :rightsidebar="format.rightSideBar.preview"

                                            :getCompanyDetails="getCompanyInformation.letterDetail"
                                            :managerName="getUserCompanyManager(format) ?getUserCompanyManager(format).name: ''"
                                            :designation="getUserCompanyManager(format) ? getUserCompanyManager(format).designation: ''"
                                            :signature="format.company_signatory ? getCompanyDetails.letterDetail.signatureLink : getUserCompanyManager(format).signature"
                                            :signatory="format.signatory.preview"
                                            :header="format.headerShow.preview"
                                            :footer="format.footerShow.preview"
                                            :stamp="format.stampShow.preview"
                                            :signatureShow="format.signatureShow.preview"
                                            :watermark="format.watermarkShow.preview"
                                        />
                                        </div> -->
                                    </v-col>
                                </v-row>
                            </div>
                        </div>
                    </div>
                </v-card>
                <v-card class="rounded-xl scroll" style="box-shadow: 0px  24px 30px #959EA51A;overflow-x:hidden;"
                    min-height="720px" max-height="720px" v-else-if="requestType == 'Leave' && leavePlanner == true">
                    <v-card-title class="px-1 px-6" v-if="showHeaderPlanner == true">
                        <v-img src="/hr/leavePlanner.svg" max-width="fit-content" height="fit-content" class="mr-2"
                            contain></v-img>
                        <span class="darkBlue-heading-text subHeadingFontSize" >Team
                            Calendar</span>
                        <v-spacer></v-spacer>
                        <v-btn class="pa-0 border-radius-medium" color="#FF0000" outlined @click="leavePlanner = false"
                            style="min-width:30px;max-width:30px;height: 30px;text-align: center;">
                            <v-icon small>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-sheet height="64">
                        <v-toolbar flat>
                            <!-- <v-btn text class="mr-4" color="grey darken-2" @click="setToday">Today</v-btn> -->
                            <v-btn fab text color="#258BFF" @click="prev">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-toolbar-title class="darkBlue-heading-text  " v-if="$refs.calendar" align-center>
                                &nbsp;{{ $refs.calendar.title }}
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn @click="type = 'month'" class="blue-grey--text" outlined dense small v-if="type == 'day'"
                                >Month</v-btn>
                            <v-btn fab text color="#258BFF" @click="next">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>
                        </v-toolbar>
                    </v-sheet>
                    <v-sheet class="rounded-lg scroll" height="650" max-height="590">
                        <v-calendar ref="calendar" v-model="focus" color="primary" :events="events"
                            :event-color="getEventColor" :start="computedCurrentMonth" :type="type" @click:event="showEvent"
                            @click:more="viewDay" @click:date="viewDay" @change="updateRange"
                            title-position="right"></v-calendar>
                        <v-menu v-model="selectedOpen" :close-on-content-click="false" :activator="selectedElement"
                            offset-x>
                            <v-card color="grey lighten-4" min-width="300px" flat>
                                <v-toolbar :color="selectedEvent.color" dark>
                                    <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                                    <span class="pt-1">&nbsp; - {{ changeName(selectedEvent.status) }}</span>
                                </v-toolbar>
                                <v-row class="pl-2 pr-2">
                                    <v-col><span >Leave Type</span> : </v-col>
                                    <v-col>{{ selectedEvent.leave_type }}</v-col>
                                </v-row>
                                <v-row class="pl-2 pr-2">
                                    <v-col><span >From</span> : </v-col>
                                    <v-col>{{ selectedEvent.start }}</v-col>
                                </v-row>
                                <v-row class="pl-2 pr-2">
                                    <v-col><span >To</span> : </v-col>
                                    <v-col>{{ selectedEvent.end }}</v-col>
                                </v-row>
                            </v-card>
                        </v-menu>
                    </v-sheet>
                </v-card>
                <v-card class="rounded-xl overflow-hidden" style="box-shadow: 0px  24px 30px #959EA51A;" min-height="720px"
                    max-height="720px" v-else-if="leavePlanner == true && requestType == 'wfh'">
                    <v-card-title class="px-1 px-6" v-if="showHeaderPlanner == true">
                        <v-img src="/hr/leavePlanner.svg" max-width="fit-content" height="fit-content" class="mr-2"
                            contain></v-img>
                        <span class="darkBlue-heading-text subHeadingFontSize" >Team
                            Calendar</span>
                        <v-spacer></v-spacer>
                        <v-btn class="pa-0 border-radius-medium" color="#FF0000" outlined @click="leavePlanner = false"
                            style="min-width:30px;max-width:30px;height: 30px;text-align: center;">
                            <v-icon small>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-sheet height="64">
                        <v-toolbar flat>
                            <!-- <v-btn text class="mr-4" color="grey darken-2" @click="setToday">Today</v-btn> -->
                            <v-btn fab text color="#258BFF" @click="prev_wfh">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-toolbar-title class="darkBlue-heading-text  " v-if="$refs.calendar_wfh" align-center>
                                &nbsp;{{ $refs.calendar_wfh.title }}
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn @click="type_wfh = 'month'" class="blue-grey--text" outlined dense small
                                v-if="type_wfh == 'day'" >Month</v-btn>
                            <v-btn fab text color="#258BFF" @click="next_wfh">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>
                        </v-toolbar>
                    </v-sheet>
                    <v-sheet class="rounded-lg scroll" height="650" max-height="590">
                        <v-calendar ref="calendar_wfh" v-model="focus_wfh" :start="computedCurrentMonth" color="primary"
                            :events="events_wfh" :event-color="getEventColor" :type="type_wfh" @click:event="showEvent_wfh"
                            @click:more="viewDay_wfh" @click:date="viewDay_wfh" @change="updateRange_wfh"
                            title-position="right"></v-calendar>
                        <v-menu v-model="selectedOpen_wfh" :close-on-content-click="false" :activator="selectedElement_wfh"
                            offset-x>
                            <v-card color="grey lighten-4" min-width="300px" flat>
                                <v-toolbar :color="selectedEvent_wfh.color" dark>
                                    <v-toolbar-title v-html="selectedEvent_wfh.name"></v-toolbar-title>
                                    <span class="pt-1">&nbsp; - {{ changeName(selectedEvent_wfh.status) }}</span>
                                </v-toolbar>
                                <v-row class="pl-2 pr-2">
                                    <v-col><span >WFH </span></v-col>
                                </v-row>
                                <v-row class="pl-2 pr-2">
                                    <v-col><span >From</span> : </v-col>
                                    <v-col>{{ selectedEvent_wfh.start }}</v-col>
                                </v-row>
                                <v-row class="pl-2 pr-2">
                                    <v-col><span >To</span> : </v-col>
                                    <v-col>{{ selectedEvent_wfh.end }}</v-col>
                                </v-row>
                            </v-card>
                        </v-menu>
                    </v-sheet>
                </v-card>
                <v-card class="rounded-xl " style="box-shadow: 0px  24px 30px #959EA51A;" min-height="720px"
                    v-else-if="requestInfo == false">
                    <v-row class="mx-0" style="max-width:100%" justify="center">
                        <!-- This is the view serction need to copy to get the download excel and period selection dropdown -->
                        <v-col cols="12" class="pa-0 ">
                            <v-card-title>
                                <v-col cols="4" class="pa-0">
                                    <v-btn outlined min-width="90" color="#5C7EEF"
                                        class=" textTransformUnset borderRadiusButtons" :disabled='loading'
                                        @click="loadHistory()">
                                        {{ viewRequestHistory == true ?
                                            "View Pending" :
                                            "View History" }}
                                    </v-btn>
                                </v-col>
                                <v-spacer></v-spacer>
                                <v-col cols="5" class="pa-0">
                                    <v-select class="rounded-xl w-50 customMdiMenuDown customA" :items="taskFilters"
                                        outlined v-model="selectedFilterDate">
                                        <template v-slot:selection="{ item }">
                                            <span>{{ item }}</span>
                                        </template>
                                        <template v-slot:item="{ item, attrs, on }">
                                            <v-list-item v-on="on" v-bind="attrs" @click="changedDate(item)">
                                                <v-list-item-content>
                                                    <v-list-item-title>
                                                        <span>{{ item }}</span>
                                                    </v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>
                                        </template>
                                    </v-select>
                                </v-col>
                                <v-col cols="2" class="py-0">
                                    <div>
                                        <v-img src="/dashboard/excel.svg" max-width="35" height="auto"
                                            class="ml-4 cursor-pointer" v-if="downloadexcel" contain
                                            @click="downloadReqReport = true"></v-img>
                                    </div>
                                </v-col>
                                <!-- <download-excel class="v-btn green--text outlined" :data="fetchRequests" :fields="requests_json_fields" name="" > -->
                                <!-- </download-excel> -->

                            </v-card-title>
                        </v-col>
                        <v-col cols="10" class="pt-0">
                            <v-row class="mx-0" style="max-width:100%">
                                <v-col sm="5" md="5" lg="6" xl="7">
                                    <p class="font-weight-medium subHeadingFontSize mb-0" v-if="viewRequestHistory == false">Recent Request</p>
                                    <p class="font-weight-medium subHeadingFontSize mb-0" v-else>Request History</p>
                                    <p class="font-weight-normal fontSize1" v-if="viewRequestHistory == false"><span
                                            class="customRed fontWeight600">{{ this.totalCount || 0 }}</span>
                                        {{ totalCount != 1 ?
                                            "Requests are pending" :
                                            "Request is Pending" }}</p>
                                    <p class="font-weight-normal fontSize1" v-else>
                                        <span class="customRed fontWeight600">{{
                                            visibleData.length }}</span>
                                        <span >total requests</span>
                                    </p>
                                </v-col>
                                <v-col sm="7" md="7" lg="6" xl="5" style="min-height:70px">
                                    <span>
                                        <v-tooltip bottom color="blue-grey" v-if="filterReqByUser != ''">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-badge class="daysbadge" color="red" icon="mdi-close" offset-x="24"
                                                    offset-y="15" @click.native="removeUserFilter()">
                                                    <v-avatar bordered size="45" class="mr-3" v-bind="attrs" v-on="on"
                                                        style="border:2px solid #00FF66; ">
                                                        <v-img aspect-ratio="1" :src="getImage(filterReqByUser)"></v-img>
                                                    </v-avatar>
                                                </v-badge>
                                            </template>
                                            {{ getUserName(filterReqByUser) }}
                                        </v-tooltip>
                                        <span v-for="(items, ind) in computedRequestUsersSliced" :key="ind">
                                            <v-tooltip bottom color="white blue-grey--text"
                                                v-if="filterReqByUser != items._id">
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-avatar size="45" class="ml-n3" v-bind="attrs" v-on="on"
                                                        style="border:2px solid white; ">
                                                        <v-img aspect-ratio="1" :src="getImage(items._id)"></v-img>
                                                    </v-avatar>
                                                </template>
                                                {{ getUserName(items._id) }}
                                            </v-tooltip>
                                        </span>
                                        <v-menu nudge-left="100" v-if="requests_users.length > 0">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-icon v-bind="attrs" v-on="on">mdi-menu-down</v-icon>
                                            </template>
                                            <v-list max-height="281px" class="scroll">
                                                <v-text-field v-model="filterName" label="Filter Name"
                                                    @click.stop autofocus
                                                    style="opacity:0 !important; height: 0 !important;"></v-text-field>
                                                <v-list-item v-for="(item, index) in filteredRequestsUsers" :key="index"
                                                    @click="fetchUserFilteredReq(item._id)">
                                                    <v-list-item-action class="my-auto mr-0">
                                                        <v-list-item-action-text class="caption mt-2 ml-4">
                                                            <v-avatar size="45" class="ml-n3"
                                                                style="border:2px solid white; ">
                                                                <v-img aspect-ratio="1" :src="getImage(item._id)"></v-img>
                                                            </v-avatar>
                                                        </v-list-item-action-text>
                                                    </v-list-item-action>
                                                    <v-list-item-content class="pl-2 mt-2">
                                                        <v-list-item-title>{{ getUserName(item._id) }}</v-list-item-title>
                                                    </v-list-item-content>
                                                    <v-list-item-action class="ma-0">
                                                        <v-list-item-action-text class="caption mt-2 ml-4">
                                                            <v-list-item-action-text
                                                                class="font-weight-medium fontSize18 mt-0 d-flex outlineIndigoButton">
                                                                <p class="mb-0 customRed">{{ item.totalCount }}</p>
                                                            </v-list-item-action-text>
                                                        </v-list-item-action-text>
                                                    </v-list-item-action>
                                                </v-list-item>
                                                <v-list-item v-if="filteredRequestsUsers.length === 0">
                                                    <v-list-item-content>
                                                        <v-list-item-title >No user
                                                            found</v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="10" class="pt-2">
                            <RequestsFiltering :teamCentral='true' :loading='loading' :configData='configData'
                                :selectedFilter='selectedFilter' :computedAllReqCountObj='computedAllReqCountObj'
                                :computedTotalReqCount='computedTotalReqCount' @selectFilter="selectFilter($event)" />
                        </v-col>
                    </v-row>

                </v-card>
                <v-card class="rounded-xl " style="box-shadow: 0px  24px 30px #959EA51A;" min-height="720px" v-else>
                    <v-card-title class="px-1 px-6 py-5">
                        <v-img src="/hr/eye.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                        <h3 class="darkBlue-heading-text subHeadingFontSize"><span
                               >Request Information</span> {{
                                    changeRequestTypeText(requestType) }}</h3>
                        <v-spacer></v-spacer>
                        <template v-if="isDraftClaimRequest">
                            <v-btn color="error" class="mr-2" @click="deleteDraftClaimReq" >
                                DELETE
                            </v-btn>
                            <v-btn color="primary" class="mr-2" @click.prevent="openEditClaimReq"
                                >
                                EDIT
                            </v-btn>
                        </template>
                        <v-btn v-if="requestType == 'Leave' || requestType == 'wfh'" outlined
                            class="rounded-xl blue-heading-text mr-2" color="#5A7DEF" @click="leavePlanner = true;">
                            <v-img src="/hr/team.svg" max-width="fit-content" height="fit-content" class="" contain></v-img>
                            <span >Team Calendar</span>
                        </v-btn>
                        <v-img @click="downloadLetterPDF" src="/profile/download.svg" max-width="fit-content"
                            height="fit-content" class="mr-2 cursor-pointer"
                            v-if="computedServiceList.request_type == 'letters' && (computedServiceList.status == 'Completed' || computedServiceList.status == 'completed') && letterLoading == false"
                            contain></v-img>
                        <v-img src="/animated/refresh.svg" max-width="30" height="fit-content" class="mr-2 mt-1"
                            v-if="computedServiceList.request_type == 'letters' && (computedServiceList.status == 'Completed' || computedServiceList.status == 'completed') && letterLoading == true"
                            contain></v-img>
                        <v-img @click="requestInfo = false" src="/dashboard/close.svg" style="cursor:pointer;"
                            justify-self="end" max-width="25" height="auto" contain></v-img>
                    </v-card-title>
                    <v-divider></v-divider>
                    <div class="scroll" style="max-height:620px;min-height:620px;" v-if="arr_letters.length > 0">
                        <div style="max-width:100%;min-height:100%;">
                            <v-row class="mx-0" style="max-width:100%;min-height:620px">
                                <v-col cols="12" class="px-5">
                                    <TeamRequestInfo :users="users" :countryList="countryList" :configData='configData'
                                        :user="user" :data="computedServiceList" :companyData='companyData'
                                        :emailBody="emailBody" :selectedEmp="getSelectedEmployee[0]" :teamCentral='true'
                                        :userType="'MANAGER'" />
                                </v-col>
                            </v-row>
                        </div>
                    </div>
                </v-card>
                <LetterDownload v-if="downloadLetters"
                    :logos="computedServiceList.letterImages && computedServiceList.letterImages.headerImageLink"
                    :stampUrl="computedServiceList.letterImages && computedServiceList.letterImages.companyStampLink"
                    :request="computedServiceList" :companyData="companyData"
                    :footerLogo="computedServiceList.letterImages && computedServiceList.letterImages.footerImageLink"
                    :users="user" :user="users" :download_letter="downloadLetters"
                    :pdfStyles="computedServiceList.pdfStyles"
                    :letterImages="computedServiceList.letterImages && computedServiceList.letterImages"
                    :signatory="computedServiceList.signatory" :computedServiceList="computedServiceList"
                    :letterUpload="letterUpload" />
            </v-col>
        </v-row>
        <!-- Select Custom Date Range -->
        <v-dialog v-model="customdatedial" max-width="600px">
            <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
                <v-row>
                    <v-col cols="6" sm="6" class="pb-2">
                        <v-card-title class="py-0">
                            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize"
                                > Select Custom
                                Date</span>
                        </v-card-title>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row justify="center" class="px-5 mt-7">
                    <v-col cols="12" class="pb-2 ">
                        <v-card-title class="py-0">
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize mr-5"
                                >Date Range </span>
                            <v-menu ref="menu_calendar_button" v-model="menu_calendar_button"
                                :close-on-content-click="false" :return-value.sync="date_calendar"
                                transition="scale-transition" min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field attach solo flat dense readonly v-model="dateRangeText" hide-details
                                        label="Date Range" class="rounded-xl text-field__small"
                                        prepend-inner-icon="mdi-calendar-outline" v-bind="attrs" v-on="on"
                                        style="background: #FFFFFF 0% 0% no-repeat padding-box;box-shadow: 0px 24px 30px #959EA51A;border: 0.5px solid #000;border-radius: 18px;opacity: 1;max-width:250px">
                                    </v-text-field>
                                </template>
                                <v-date-picker range v-model="date_calendar" no-title scrollable>
                                    <v-btn text color="red" @click="resetCalendarFilterDate"
                                        >Clear</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="grey" @click="menu_calendar_button = false"
                                        >Cancel</v-btn>
                                    <v-btn text color="primary"
                                        @click="$refs.menu_calendar_button.save(date_calendar); customdate(date_calendar);"
                                        >OK</v-btn>
                                </v-date-picker>
                            </v-menu>
                        </v-card-title>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
        <!-- report download dialog -->
        <v-dialog persistent v-model="downloadReqReport" max-width="600px">
            <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
                <v-row>
                    <v-col cols="12" sm="12" class="pb-2">
                        <v-card-title class="py-0">
                            <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                contain></v-img>
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize"><span
                                    >Download Report</span> -
                                {{ requestFilterDownload(selectedFilter) }}</span>
                        </v-card-title>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row justify="center" class="px-5 mt-7">
                    <v-col cols="12" class="pb-2 ">
                        <v-card-title class="py-0">
                            <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize mr-5"
                               >Date Range </span>
                            <v-menu ref="menu_calendar_button2" v-model="menu_calendar_button2"
                                :close-on-content-click="false" :return-value.sync="date_calendar_download"
                                transition="scale-transition" min-width="auto">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field attach solo flat dense readonly v-model="dateRangeTextExcel" hide-details
                                        label="Date Range" class="rounded-xl text-field__small"
                                        prepend-inner-icon="mdi-calendar-outline" v-bind="attrs" v-on="on"
                                        style="background: #FFFFFF 0% 0% no-repeat padding-box;box-shadow: 0px 24px 30px #959EA51A;border: 0.5px solid #000;border-radius: 18px;opacity: 1;max-width:250px">
                                    </v-text-field>
                                </template>
                                <v-date-picker range v-model="date_calendar_download" no-title scrollable
                                    @input="fetchDataForExcelDownload()">
                                    <v-btn text color="red" @click="resetCalendarFilterDateDownload"
                                        >Clear</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="grey" @click="menu_calendar_button2 = false"
                                        >Cancel</v-btn>
                                    <v-btn text color="primary"
                                        @click="$refs.menu_calendar_button2.save(date_calendar_download)"
                                        >OK</v-btn>
                                </v-date-picker>
                            </v-menu>
                        </v-card-title>


                    </v-col>

                    <v-col cols="12" class="pb-2" style="text-align: end;">
                        <v-row justify="end">
                            <v-btn outlined elevation="0" @click="date_calendar_download = [], downloadReqReport = false"
                                class="border-radius-medium fontWeight300 fontSize7 mx-2"
                                style="min-width:105px; color:#0059ff;height: 35px;text-align: center;text-transform: unset !important;"
                                >
                                Cancel
                            </v-btn>
                            <download-excel v-if="dateRangeTextExcel != ''" :data="getInfoForDownload"
                                :name="selectedFilter == 'ALL' ? `Self Service Requests (${dateRangeTextExcel})` : `Self Service Requests - ${getReqName(selectedFilter)} (${dateRangeTextExcel})`"
                                :fields='getFields()'>

                                <v-btn outlined elevation="0"
                                    :disabled="dateRangeTextExcel == '' || getInfoForDownload.length == 0 || excelLoading"
                                    @click="downloadReqReportButton"
                                    class="border-radius-medium fontWeight300 fontSize7 mx-2"
                                    style="min-width:105px; color:#0059ff;height: 35px;text-align: center;text-transform: unset !important;">
                                    {{
                                        excelLoading ? 'Loading' :
                                        getInfoForDownload.length == 0 ?
                                            "No Data" : "Download Report"
                                    }}
                                </v-btn>
                            </download-excel>
                        </v-row>
                    </v-col>


                </v-row>
            </v-card>
        </v-dialog>
        <!-- snackbar -->
        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}

            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false" >Close</v-btn>
            </template>
        </v-snackbar>

    </div>
</template>
<script>
import RequestListing from '~/components/reuseable/requestListing.vue'
import TeamRequestInfo from '~/components/reuseable/teamRequestInfo.vue'
import { Letters } from '@nathangroup/letter'
import { Leave } from "@nathangroup/leave";
import countries from "countries-list";
import Observer from '~/components/Observer.vue'
import moment from "moment"
import CreateLeaves from "~/components/reuseable/createLeaves.vue";
import CreateWfh from '~/components/reuseable/createWfh.vue'
import ClaimRequest from '~/components/reuseable/claimRequest.vue'
import EditAttendance from '~/components/reuseable/editAttendance.vue'
import LetterRequest from '~/components/reuseable/letterRequest.vue'
import LetterPreview from "~/components/reuseable/letterPreview.vue"
import LetterDownload from '~/components/letters/letterDownload.vue'
import RequestsFiltering from '~/components/reuseable/requestsFiltering.vue'
// import { ResourceTimelineLane } from '@fullcalendar/resource-timeline';
import 'numbers2words'
import general from "~/plugins/general.js";
import CreateSalaryAdjustment from "~/components/reuseable/createSalaryAdjustment"

export default {
    components: {
        RequestListing, LetterDownload, TeamRequestInfo, Observer, CreateLeaves, CreateWfh, ClaimRequest, RequestsFiltering,
        EditAttendance, LetterRequest, LetterPreview, CreateSalaryAdjustment,
        PreviewLetter: () => { if (process.client) { return import('~/components/document-editor/wordsimplepreview.vue') } }
    },
    props: ['configData', 'companyData', 'users', 'user', 'teamList'],
    data() {
        return {
            filterName: '',
            compensationTable: "",
            personalLoanTable: "",
            personalLoanTable2: "",
            personalLoanTable3: "",
            requests_users: [],
            excel_downloaded_data: [],
            excelLoading: false,
            totalFixedWord: '',
            basicSalaryInWords: "",
            loanAmountInWords: "",
            services_general: general,
            letterLoading: false,
            letterUpload: false,
            breakloop: false,
            customdatedial: false,
            curDate: new Date(),
            furDate: new Date(),
            backDate: new Date(),
            monthOld: 6,
            taskFilters: ['All', 'Last 3 Months', 'Last 6 Months', 'Last 12 Months', 'Custom'],
            selectedFilterDate: 'Last 6 Months',
            downloadexcel: false,
            totalCount: 0,
            menu_calendar_button2: false,

            json_fields_all: {
                EMP_ID: "emp_id",
                FIRST_NAME: "first_name",
                LAST_NAME: "last_name",
                GENDER: "gender",
                MARITAL_STATUS: "marital_status",
                DATE_OF_JOINING: "doj",
                DESIGNATION: "designation",
                DEPARTMENT: 'department',
                COMPANY_NAME: "company",
                MANAGER_NAME: "manager",
                REQUEST_TYPE: "request_type",
                STATUS: 'status',
                LETTER_TYPE: 'letter_type',
                LETTER_SUB_TYPE: 'letter_sub_type',
                CLAIM_TYPE: 'claim_type',
                CLAIM_SUB_TYPE: 'claim_sub_type',
                REFERNCE_NUMBER: 'reference_number',
                LEAVE_TYPE: 'leave_type',
                NUMBER_OF_DAYS: "no_of_days",
                REQUESTED_FROM_DATE: "date_created",
                TO_DATE: "to_date",
                AMOUNT: "amount",
                DESCRIPTION: "description",
                LOGIN: "startTime",

                LOGOUT: "endTime",

            },


            from1: false,
            selectedDateForAttendance: '',
            searchRequests: '',
            json_fields_leaves: {
                EMP_ID: "EMD_ID",
                FULL_NAME: "USER_NAME",
                DATE_OF_JOINING: "DOJ",
                DESIGNATION: "DESIGNATION",
                DEPARTMENT: "DEPT",
                COMPANY_NAME: "COMAPNY",
                MANAGER_NAME: "MANAGER",
                NUMBER_OF_DAYS: "NO_OF_DAYS",
                REQUESTED_DATE: "REQUESTED_DATE",
                FROM_DATE: "FROM_DATE",
                TO_DATE: "TO_DATE",
                APPROVED_DATE: "APPROVED_DATE",
                STATUS: 'STATUS',
                LEAVE_TYPE: 'LEAVE_TYPE'
            },
            json_fields_wfh: {
                EMP_ID: "emp_id",
                FULL_NAME: "full_name",
                DATE_OF_JOINING: "doj",
                DESIGNATION: "designation",
                DEPARTMENT: "dept",
                COMPANY_NAME: "company",
                MANAGER_NAME: "manager",
                NUMBER_OF_DAYS: "no_of_days",
                REQUESTED_DATE: "requestedDate",
                FROM_DATE: "fromDate",
                TO_DATE: "toDate",
                APPROVED_DATE: "approvedDate",
                STATUS: 'status',
            },
            json_fields_letters: {
                EMP_ID: "emp_id",
                FULL_NAME: "full_name",
                DATE_OF_JOINING: "doj",
                DESIGNATION: "designation",
                DEPARTMENT: "dept",
                COMPANY_NAME: "company",
                MANAGER_NAME: "manager",
                LETTER_TYPE: 'letter_type',
                LETTER_SUB_TYPE: "letter_sub_type",
                REQUESTED_DATE: "requestedDate",
                APPROVED_DATE: "approvedDate",
                STATUS: 'status',
            },
            json_fields_claims: {
                EMP_ID: "emp_id",
                FIRST_NAME: "first_name",
                MIDDLE_NAME: "middle_name",
                LAST_NAME: "last_name",
                GENDER: "gender",
                MARITAL_STATUS: "marital_status",
                DATE_OF_JOINING: "doj",
                DESIGNATION: "designation",
                DEPARTMENT: "dept",
                COMPANY_NAME: "company",
                MANAGER_NAME: "manager",
                CLAIM_TYPE: 'claim_type',
                CLAIM_SUB_TYPE: "claim_sub_type",
                REFERNCE_NUMBER: 'reference_number',
                AMOUNT: "amount",
                COMMENTS: "comments",
                REQUESTED_DATE: "requestedDate",
                APPROVED_DATE: "approvedDate",
                STATUS: 'status',
            },
            json_fields_attendance: {
                EMP_ID: "emp_id",
                FIRST_NAME: "first_name",
                MIDDLE_NAME: "middle_name",
                LAST_NAME: "last_name",
                GENDER: "gender",
                MARITAL_STATUS: "marital_status",
                DATE_OF_JOINING: "doj",
                DESIGNATION: "designation",
                DEPARTMENT: "dept",
                COMPANY_NAME: "company",
                MANAGER_NAME: "manager",
                REQUEST_TYPE: "request_type",
                LOGIN_DATE: "login_date",
                LOGIN_TIME: "login_time",
                LOGOUT_DATE: "logout_date",
                LOGOUT_TIME: "logout_time",
                USER_COMMENTS: "user_comments",
                STATUS: 'status',
                CREATION_DATE: "requestCreationDate"
            },
            snack: false,
            snackColor: "",
            snackText: "",
            date_calendar: [],
            date_calendar_download: [],
            menu_calendar_button: false,

            downloadReqReport: false,
            fetchedEmployee: [],
            showHeaderPlanner: false,
            leavePlanner: false,
            letterUpload: false,
            events: [],
            selectedOpen: false,
            leaveList_team: [],
            focus: "",
            type: "month",
            selectedEvent: {},
            selectedElement: null,
            selectedAttendance: [],

            events_wfh: [],
            selectedOpen_wfh: false,
            wfhList_team: [],
            focus_wfh: "",
            type_wfh: "month",
            selectedEvent_wfh: {},
            selectedElement_wfh: null,

            downloadLetters: false,
            requests_json_fields: {
                FIRST_NAME: "first_name",
                REQUESTED_DATE: "date_created",
                REQUEST_TYPE: 'request_type',
                FROM_DATE: 'from_date',
                TO_DATE: 'to_date',
                STATUS: 'status',
            },
            requestType: '',
            requestTypeList: ['Leave', 'Letters', 'Claims', 'Attendance', 'wfh', 'Salary Adjustment'],
            leave: {
                appliction_log: [],
                leave_condition: {},
                leave_type: "",
                from_date: new Date().toISOString().substr(0, 10),
                to_date: new Date().toISOString().substr(0, 10),
                no_of_days: "",
                remaining_leaves: "",
                reason: "",
                status: "",
                approver_id: "",
                certificate: [],
                user_id: "",
                approvals: [],
                resume_duty_flag: false,
            },
            selectedEmployeeId: '',
            createRequest: false,
            loading: false,
            showScrollObserver: true,
            viewRequestHistory: false,
            emailBodyHR: {
                hr_email: "",
                email: "",
                subjectMsg: "",
                eMessage: "",
                email: ""
            },
            emailBody: {
                hr_email: "",
                email: "",
                subjectMsg: "",
                eMessage: "",
                email: ""
            },
            selectedService: {
                letter_fields: {}
            },
            requestInfo: false,
            letterCount: "",
            leaveCount: "",
            wfhCount: "",
            attendanceCount: "",
            claimsCount: "",
            loanCount: "",
            educationCount: "",
            passportCount: "",
            salaryCount: 0,
            pageLimit: 30,
            skipCount: 0,
            arr_letters: [],
            nextReq: false,
            filterLetterOptions: ["ALL"],
            selectedFilter: 'ALL',
            config_details: {},
            isPreview: true,
            filterReqByUser: '',
            teamListData: [],
            /* Letter Requests New fields starts here*/
            letterOptions: [],
            NOCOptions: [],
            selectedItem: 0,
            isPreview: true,
            obj_letter_preview_styles: {
                leftSidebarCol: "0",
                bodyCol: "12",
                rightSidebarCol: "0",
                header: true,
                date_format: 'D MMMM YYYY',
                date_position: 'text_alignment_left',
                addressee_position: 'text_alignment_left',
                subject_position: 'text_alignment_left',
                left_sideBar: false,
                right_sideBar: false,
                signature: false,
                stamp: false,
                watermark: false,
                footer: false,
                signatory: false
            },
            obj_letter_pdf_styles: {
                leftSidebarCol: "0",
                bodyCol: "12",
                rightSidebarCol: "0",
                header: true,
                date_format: 'D MMMM YYYY',
                addressee_position: 'text_alignment_left',
                subject_position: 'text_alignment_left',
                body_position: 'text_alignment_left',
                left_sideBar: false,
                right_sideBar: false,
                signature: false,
                stamp: false,
                watermark: false,
                footer: false,
                signatory: false
            },
            obj_company_images_link: {
                headerImageLink: "",
                footerImageLink: "",
                companyStampLink: "",
                waterMarkLink: "",
                leftSideBarLink: "",
                rightSideBarLink: "",
                signatureLink: "",
            },
            obj_signatory: {
                _id: "",
                name: "",
                designation: ""
            },
            editorToAddress: {
                debug: 'info',
                placeholder: 'Type Addressee here...',
                readOnly: true,
                theme: 'snow'
            },
            editorBody: {
                debug: 'info',
                placeholder: 'Type Request here...',
                readOnly: true,
                theme: 'snow'
            },
            request_claims: {},
            request_wfh: {
                request_type: 'wfh',
                from_date: new Date().toISOString().substr(0, 10),
                to_date: new Date().toISOString().substr(0, 10),
                status: '',
                approvals: [],
                user_id: '',
                assigned_to: '',
                reason: ''
            },
            request: {
                request_type: 'letters',
                user_open_msg: "closed",
                admin_open_msg: "closed",
                letter_type: "NOC",
                letter_sub_type: "Travel",
                status: "processing",
                approvals: [],
                pdfStyles: {},
                previewStyles: {},
                letterImages: {},
                signatory: {},
                user_keys: false,
                letter_keys: [],
                letter_fields: {
                    addressee: "",
                    subject: "",
                    body: "",
                    noc_country: "",
                    noc_travel_dates: new Date().toISOString().substr(0, 10),
                    noc_reason_travel: "",
                    noc_driving: "",
                    salary_addressee_name: "",
                    transfer_bank_name: "",
                    transfer_account_number: "",
                    transfer_iban_number: "",
                    pay_slip_month: "",
                    pay_slip_year: "",
                    other_requests: "",
                    replies: {},
                    company_id: "",
                    user_name: "",
                    passport: "",
                    role: "",
                    work_start_date: new Date().toISOString().substr(0, 10),
                    noc_travel_return_dates: new Date().toISOString().substr(0, 10),
                    work_for: "",
                    monthly_salary: "",
                    version: "1.0",
                    post_box_no: "",
                    transfer_bank_address: "",
                    license_type: "",
                    date: new Date().toISOString().substr(0, 10),
                    starting_date: new Date().toISOString().substr(0, 10),
                    noc_travel_destination: "",
                    other_requests_to_address_1: "",
                    other_requests_to_address_2: "",
                    other_requests_to_address_3: "",
                    other_requests_subject: "",
                    other_requests_body_1: "",
                    other_requests_body_2: "",
                    other_requests_body_3: "",
                },
                admin_open_msg: "closed",
                user_open_msg: "closed",
                user_id: "",

            },
            letterLoadingNew: true,
            letterTemplate: {},
            timer: {},
            LetterPreviewContent: {
                "sections": [
                    {
                        "blocks": [
                            {
                                "inlines": [
                                    {
                                        "characterFormat": {
                                            "bold": true,
                                            "italic": true
                                        },
                                        "text": ""
                                    }
                                ]
                            }
                        ],
                        "headersFooters": {
                        }
                    }
                ]
            },
            /* Letter Requests Ends New fields */
        }
    },
    watch: {
        request: {
            handler(val) {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                this.timer = setTimeout(() => {
                    this.getNewLetterPreview()
                }, 500);
            },
            deep: true
        },
        getSelectedEmployee: function () {
            this.getTeamLeaveList()
            this.getTeamWfhList()
        }
    },
    created() {
        this.$nuxt.$on('userSelected_letter', ($event) => {
            this.selectedEmployeeId = $event
            this.getSelectedEmployee
        }),
            this.$nuxt.$on('resetLeaveForm', async ($event) => {
                this.resetLeaveFormFn()
                this.arr_letters = []
                this.skipCount = 0
                this.getAllRequestsCount()
                this.fetchRequestsUsers()

            })
        this.$nuxt.$on('refreshRequests', async ($event) => {
            // this.getAllRequests(false)
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()
            this.fetchRequestsUsers()
            // this.getAllSalaryRequest()
            this.requestInfo = false
        })

        this.$nuxt.$on('addNewClaim', async ($event) => {
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()
            this.fetchRequestsUsers()
            this.fetchedEmployee = [],
                this.requestType = '',
                this.createRequest = false
            this.selectedEmployeeId = ''
            this.resetClaimConfig();
        })

        this.$nuxt.$on('newWfhRequestCreated', () => {
            this.resetLeaveFormFn()
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()
            this.fetchRequestsUsers()

            this.getTeamWfhList()
        })

        this.$nuxt.$on('newLetterRequest', async ($event) => {
            this.resetLeaveFormFn()
            // this.getAllRequests(false)
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()
            this.fetchRequestsUsers()
        })

        // this.$nuxt.$on('reloadAllPendingRequests', () => {
        //     this.createRequest = false,
        //     this.leavePlanner = false

        //     this.getAllRequestsCount()
        // })

    },
    mounted() {
        this.config_details = this.$store.getters.getConf[0]
        if (this.configData && this.configData[0].letterRequest && this.configData[0].letterRequest.length > 0) {
            this.request.letter_type = this.configData[0].letterRequest[0].letterDescription.requestType
            this.request.letter_sub_type = this.configData[0].letterRequest[0].letterDescription.requestSubType
        }
        this.resetClaimConfig();
        this.getUserInfo()
        this.backDate.setMonth(this.curDate.getMonth() - this.monthOld)
        this.getAllRequestsCount()
        this.fetchRequestsUsers()
        this.computedServiceList
        this.isAdmin()
        this.getLetterTypeList()
        this.getTeamWfhList()
    },
    beforeDestroy() {
        this.$nuxt.$off(
            'addNewClaim',
            'resetLeaveForm',
            'userSelected_letter',
            'refreshRequests',
            'newWfhRequestCreated',
            'newLetterRequest',
            'reloadAllPendingRequests'
        )
        this.breakloop = true;
    },
    methods: {
        downloadReqReportButton() {
            setTimeout(() => {
                this.date_calendar_download = []
            }, 1000);
            this.downloadReqReport = false
        },
        async downloadLetterPDF() {
            this.letterLoading = true
            let data = this.computedServiceList
            let obj = this.services_general.getLetterObject(data)
            await this.$axios.$post(process.env.documenturl + 'api/DocumentEditor/ReplaceContentToPDF', JSON.stringify(obj), { headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf' }, responseType: 'arraybuffer', })
                .then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', this.getUserName(data.user_id) + " " + data.letter_type + '.pdf'); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                    this.letterLoading = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        async getNewLetterPreview() {

            let sampleRequest = _.cloneDeep(this.request)
            this.letterLoadingNew = true

            this.request.letter_keys = this.filterLetterFormats.letterKeys
            this.request.user_keys = this.filterLetterFormats.user_keys

            let obj_userInfo = this.getSelectedEmployee[0]
            let obj_letterInfo = this.filterLetterFormats
            let obj_requestInfo = this.request
            let arr_companies = this.companyData
            let bln_newLetter = true

            if (obj_userInfo.salary.total_fixed <= 0) {
                obj_userInfo.salary.total_fixed = '0.00'
            }

            let getContent = function (localconfigData, localRequest) {
                for (let index = 0; index < localconfigData[0].letterRequest.length; index++) {
                    const data = localconfigData[0].letterRequest[index];
                    if (data.letterDescription.requestSubType !== '') {
                        if (localRequest.letter_type == data.letterDescription.requestType && localRequest.letter_sub_type == data.letterDescription.requestSubType) return data.contentbefore
                    }
                    else if (localRequest.letter_type == data.letterDescription.requestType) return data.contentbefore
                }
            }
            let funGetUserTitle = function (gender, marital_status) {
                var title = "";
                if (gender == 'Male') {
                    title = 'Mr.';
                }
                else if (gender == 'Female') {
                    if (marital_status == 'Married') {
                        title = 'Mrs.';
                    }
                    else {
                        title = 'Ms.';
                    }
                }
                return title;
            }
            let funGetCompanyDetails = function (company_id, arr_companies) {
                var user_compnay = arr_companies.filter(function (ele) {
                    return ele._id == company_id;
                });
                if (user_compnay.length > 0)
                    return user_compnay[0];
                else
                    return {};
            }
            let funGetUserInfo = function (bln_newLetter, obj_userInfo, obj_requestInfo) {
                var obj_user = {
                    first_name: '',
                    last_name: '',
                    user_name: '',
                    nationality: "",
                    passport_no: '',
                    designation: "",
                    department: "",
                    date_of_joining: "",
                    bank_name: "",
                    iban: "",
                    account_number: "",
                    total_fixed_salary: "",
                    salary_currency: "",
                    basic_salary: "",
                    accommodation_allowance: "",
                    medical_allowance: "",
                    transport_allowance: "",
                    other_allowance: "",
                    fixed_overtime: "",
                    emp_id: '',
                };
                obj_user.user_name = bln_newLetter ? '' : obj_requestInfo.letter_fields.user_name;
                obj_user.nationality = bln_newLetter ? obj_userInfo.personal.nationality : obj_requestInfo.letter_fields.nationality;
                obj_user.first_name = bln_newLetter ? obj_userInfo.first_name : obj_requestInfo.letter_fields.first_name;
                obj_user.last_name = bln_newLetter ? obj_userInfo.last_name : obj_requestInfo.letter_fields.last_name;
                obj_user.passport_no = bln_newLetter ? obj_userInfo.documents.passport_number : obj_requestInfo.letter_fields.passport;
                obj_user.emp_id = bln_newLetter ? obj_userInfo.emp_id : obj_requestInfo.letter_fields.emp_id;
                obj_user.designation = bln_newLetter ? obj_userInfo.personal.designation : obj_requestInfo.letter_fields.role;
                obj_user.department = bln_newLetter ? obj_userInfo.reporting.department : obj_requestInfo.letter_fields.department;
                obj_user.date_of_joining = bln_newLetter ? obj_userInfo.date_of_joining : obj_requestInfo.letter_fields.work_start_date;
                obj_user.bank_name = bln_newLetter ? obj_userInfo.bank.bank_name : obj_requestInfo.letter_fields.transfer_bank_name;
                obj_user.account_number = bln_newLetter ? obj_userInfo.bank.account_number : obj_requestInfo.letter_fields.account_number;
                obj_user.department = bln_newLetter ? obj_userInfo.reporting.department : obj_requestInfo.letter_fields.department;
                obj_user.iban = bln_newLetter ? obj_userInfo.bank.iban : obj_requestInfo.letter_fields.transfer_iban_number;
                obj_user.total_fixed_salary = bln_newLetter ? obj_userInfo.salary.total_fixed || obj_userInfo.salary.get('total_fixed') : obj_requestInfo.letter_fields.total_fixed;
                obj_user.salary_currency = bln_newLetter ? obj_userInfo.bank.salary_currency : obj_userInfo.bank.salary_currency;
                obj_user.accommodation_allowance = bln_newLetter ? obj_userInfo.salary.accommodation_allowance : obj_requestInfo.letter_fields.accommodation_allowance;
                obj_user.medical_allowance = bln_newLetter ? obj_userInfo.salary.housing_allowance : obj_requestInfo.letter_fields.medical_allowance;
                obj_user.transport_allowance = bln_newLetter ? obj_userInfo.salary.transport_allowance : obj_requestInfo.letter_fields.transport_allowance;
                obj_user.other_allowance = bln_newLetter ? obj_userInfo.salary.other_allowance : obj_requestInfo.letter_fields.other_allowance;
                obj_user.fixed_overtime = bln_newLetter ? obj_userInfo.salary.fixed_overtime : obj_requestInfo.letter_fields.fixed_overtime;
                return obj_user;
            }
            let funGetUserName = function (obj_userInfo) {
                var name = "";
                if (obj_userInfo.first_name != undefined) {
                    name += obj_userInfo.first_name + ' ';
                }
                if (obj_userInfo.middle_name != undefined) {
                    name += obj_userInfo.middle_name + ' ';
                }
                if (obj_userInfo.last_name != undefined) {
                    name += obj_userInfo.last_name;
                }
                return name;
            }
            var name_2 = funGetUserName(obj_userInfo);
            var company_id = bln_newLetter ? obj_userInfo.company_ID : obj_requestInfo.company_id;
            var company_details = funGetCompanyDetails(company_id, arr_companies);
            var title = funGetUserTitle(obj_userInfo.personal.gender, obj_userInfo.personal.marital_status);
            var adjective = 'her';
            if (title == 'Mr.') {
                adjective = 'his';
            }
            var pronoun = 'her';
            if (title == 'Mr.') {
                pronoun = 'him';
            }
            var user_data = funGetUserInfo(bln_newLetter, obj_userInfo, obj_requestInfo);
            var converter = require("number-to-words");
            var salary_to_words = converter.toWords(user_data.total_fixed_salary);
            this.replaceCustomKeys(obj_userInfo, 'sampleRequest', bln_newLetter)
            sampleRequest.content = getContent(this.configData, sampleRequest)
            let linemanagerdetails = this.getUsersInfoForExcel(obj_userInfo.reporting.manager)
            sampleRequest.letter_fields['managername'] = funGetUserName(linemanagerdetails)
            sampleRequest.letter_fields['manageremail'] = linemanagerdetails.email
            sampleRequest.letter_fields['managerphone'] = linemanagerdetails.personal.phone
            sampleRequest.letter_fields['managerheshe'] = linemanagerdetails.personal.gender == 'Male' ? 'he' : 'she'
            sampleRequest.letter_fields['totalFixedWord'] = this.totalFixedWord
            sampleRequest.letter_fields['basicSalaryInWords'] = this.basicSalaryInWords
            sampleRequest.letter_fields['loanAmountInWords'] = this.loanAmountInWords
            sampleRequest.letter_fields['personalLoanTable'] = this.personalLoanTable
            sampleRequest.letter_fields['personalLoanTable2'] = this.personalLoanTable2
            sampleRequest.letter_fields['personalLoanTable3'] = this.personalLoanTable3
            sampleRequest.letter_fields['name'] = name_2
            sampleRequest.letter_fields['date'] = new Date()
            sampleRequest.letter_fields['department'] = user_data.department
            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            sampleRequest.letter_fields["day"] = weekday[new Date().getDay()]
            sampleRequest.letter_fields['nationality'] = user_data.nationality
            sampleRequest.letter_fields['passport'] = user_data.passport_no
            sampleRequest.letter_fields['passportNumber'] = user_data.passport_no
            sampleRequest.letter_fields['role'] = user_data.designation
            sampleRequest.letter_fields['work_start_date'] = moment(user_data.date_of_joining).format('D MMMM YYYY')
            sampleRequest.letter_fields['bank'] = user_data.bank_name
            sampleRequest.letter_fields['iban'] = user_data.iban
            sampleRequest.letter_fields['bankAccountNumber'] = user_data.account_number
            sampleRequest.letter_fields['totalFixed'] = parseFloat(user_data.total_fixed_salary).toFixed(2)
            sampleRequest.letter_fields['salaryInWords'] = salary_to_words.charAt(0).toUpperCase() + salary_to_words.slice(1)
            sampleRequest.letter_fields['title'] = title
            sampleRequest.letter_fields['companyName'] = company_details.company_name
            sampleRequest.letter_fields['gender'] = obj_userInfo.personal.gender
            sampleRequest.letter_fields['passportIssueDate'] = moment(obj_userInfo.documents.passport_issue).format('D MMMM YYYY')
            sampleRequest.letter_fields['passportExpiryDate'] = moment(obj_userInfo.documents.passport_expiry).format('D MMMM YYYY')
            sampleRequest.letter_fields['dob'] = moment(obj_userInfo.personal.dob).format('D MMMM YYYY')
            sampleRequest.letter_fields['his/her'] = adjective
            sampleRequest.letter_fields['him/her'] = pronoun
            sampleRequest.letter_fields['he/she'] = ""
            sampleRequest.letter_fields['basicSalary'] = user_data.basic_salary
            sampleRequest.letter_fields['accommodation_allowance'] = user_data.accommodation_allowance
            sampleRequest.letter_fields['medical_allowance'] = user_data.medical_allowance
            sampleRequest.letter_fields['transport_allowance'] = user_data.transport_allowance
            sampleRequest.letter_fields['other_allowance'] = user_data.other_allowance
            sampleRequest.letter_fields['basic_salary'] = user_data.basic_salary
            sampleRequest.letter_fields['total_fixed'] = user_data.total_fixed_salary
            sampleRequest.letter_fields['emp_id'] = user_data.emp_id
            delete sampleRequest.letter_fields.replies
            let obj = this.services_general.getLetterObject(sampleRequest)
            await this.$axios.$post(process.env.documenturl + 'api/DocumentEditor/ReplaceContent', JSON.stringify(obj), { headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf' } })
                .then((response) => {
                    this.LetterPreviewContent = response
                    this.letterLoadingNew = false
                })
                .catch(err => {
                    console.log(err)
                })
        },
        replaceCustomKeys(userLetterInfo, letterInfo, bln_newLetter) {
            let result = letterInfo

            /**
             * Title entity based on letter fields data
             * Update Title for Female Married
            */
            if (bln_newLetter) {
                if (userLetterInfo.personal.gender == 'Female' && userLetterInfo.personal.marital_status == 'Married') result = result.replaceAll('Ms.', 'Mrs.');
            } else {
                let title = userLetterInfo.hasOwnProperty('title') ? userLetterInfo.title : ''
                result = result.replaceAll('[title].', title);
                result = result.replaceAll('Mr.', title);
                result = result.replaceAll('Ms.', title);
            }

            /**
             * First Name
             */
            let first_name = bln_newLetter ?
                userLetterInfo.hasOwnProperty('first_name') ? userLetterInfo.first_name : '' :
                userLetterInfo.hasOwnProperty('first_name') ? userLetterInfo.first_name : ''

            result = result.replaceAll('[firstname]', first_name)

            /**
             * Last Name
             */
            let last_name = bln_newLetter ?
                userLetterInfo.hasOwnProperty('last_name') ? userLetterInfo.last_name : '' :
                userLetterInfo.hasOwnProperty('last_name') ? userLetterInfo.last_name : ''

            result = result.replaceAll('[lastname]', last_name)

            /**
             * Employee ID
             */
            let emp_id = bln_newLetter ?
                userLetterInfo.hasOwnProperty('emp_id') ? userLetterInfo.emp_id : '' :
                userLetterInfo.hasOwnProperty('emp_id') ? userLetterInfo.emp_id : ''

            result = result.replaceAll('[employeeId]', emp_id)

            /**
             * Address
             */
            let address = bln_newLetter ?
                userLetterInfo.personal.hasOwnProperty('address') ? userLetterInfo.personal.address : '' :
                userLetterInfo.hasOwnProperty('address') ? userLetterInfo.address : ''

            result = result.replaceAll('[address]', address)

            /**
             * Branch
             */
            let branch = bln_newLetter ?
                userLetterInfo.reporting.hasOwnProperty('branch') ? userLetterInfo.reporting.branch : '' :
                userLetterInfo.hasOwnProperty('branch') ? userLetterInfo.branch : ''

            result = result.replaceAll('[branch]', branch)

            /**
             * Gender Pronounce Keys
             */
            let pronoun_1 = ''
            let pronoun_2 = ''

            let gender = bln_newLetter ?
                userLetterInfo.personal.hasOwnProperty('gender') ? userLetterInfo.personal.gender : '' :
                userLetterInfo.hasOwnProperty('gender') ? userLetterInfo.gender : ''

            if (gender.toLowerCase() == 'female') {
                pronoun_1 = 'her'
                pronoun_2 = 'she'
                result = result.replaceAll('[him/her]', 'her')

            } else if (gender.toLowerCase() == 'male') {
                pronoun_1 = 'his'
                pronoun_2 = 'he'
                result = result.replaceAll('[him/her]', 'him')
            }

            result = result.replaceAll('[his/her]', pronoun_1)
            result = result.replaceAll('[he/she]', pronoun_2)
            result = result.replaceAll('[He/She]', _.capitalize(pronoun_2))
            result = result.replaceAll('[His/Her]', _.capitalize(pronoun_1))

            /**
            * Total Salary in Words
            */

            // Text to words
            const T2W = require('numbers2words');
            var translator = new T2W("EN_US");

            let total_fixed_word = ''
            let basic_salary = ''
            let total_fixed_amount = ''
            let basic_salary_word = ''
            let loan_amount_word = ''
            if (bln_newLetter) {
                let loanAmount = 0
                // Total Fixed
                let total_compensation = userLetterInfo.salary.hasOwnProperty('total_fixed') ? userLetterInfo.salary.total_fixed : 0;
                var t2w = translator.toWords(parseInt(total_compensation));
                var t2wFils = translator.toWords(parseInt((parseFloat(total_compensation).toFixed(2) + "").split(".")[1]));

                // Basic Salary
                let basicSalary = userLetterInfo.salary.hasOwnProperty('basic_salary') ? userLetterInfo.salary.basic_salary : 0;
                var t2w_basicSalary = translator.toWords(parseInt(basicSalary));
                var t2wFils_basicSalary = translator.toWords(parseInt((parseFloat(basicSalary).toFixed(2) + "").split(".")[1]));

                if (this.request.letter_type == "Salary Certificate" && this.request.letter_sub_type == "Car Loan") {
                    loanAmount = this.request.letter_keys[1].hasOwnProperty('value') ? Number(this.request.letter_keys[1].value) : 0;
                } else if (this.request.letter_type == "Salary Certificate" && this.request.letter_sub_type == "Personal Loan") {
                    loanAmount = this.request.letter_keys[2].hasOwnProperty('value') ? Number(this.request.letter_keys[2].value) : 0;
                }

                // Loan Amount
                var t2w_loanAmount = translator.toWords(parseInt(loanAmount));
                var t2wFils_loanAmount = translator.toWords(parseInt((parseFloat(loanAmount).toFixed(2) + "").split(".")[1]));

                total_fixed_amount = total_compensation
                basic_salary = basicSalary
                // loan_amount = loanAmount.toLocaleString("en-US") 
                if (!isNaN(total_compensation)) {
                    if (t2wFils.toString().toLowerCase() != 'zero') {
                        total_fixed_word = t2w.replace(/(^\w{1})|(\s{1}\w{1}|-)/g, function (match) { return match.toUpperCase(); }) + " " + "UAE Dirhams" + " and " + t2wFils + " " + "Fils";
                    } else {
                        total_fixed_word = t2w.replace(/(^\w{1})|(\s{1}\w{1}|-)/g, function (match) { return match.toUpperCase(); }) + " " + "UAE Dirhams";
                    }
                }
                if (!isNaN(basicSalary)) {
                    if (t2wFils_basicSalary.toString().toLowerCase() != 'zero') {
                        basic_salary_word = t2w_basicSalary.replace(/(^\w{1})|(\s{1}\w{1}|-)/g, function (match) { return match.toUpperCase(); }) + " " + "UAE Dirhams" + " and " + t2wFils_basicSalary + " " + "Fils";
                    } else {
                        basic_salary_word = t2w_basicSalary.replace(/(^\w{1})|(\s{1}\w{1}|-)/g, function (match) { return match.toUpperCase(); }) + " " + "UAE Dirhams";
                    }
                }
                if (!isNaN(loanAmount)) {
                    if (t2wFils_loanAmount.toString().toLowerCase() != 'zero') {
                        loan_amount_word = t2w_loanAmount.replace(/(^\w{1})|(\s{1}\w{1}|-)/g, function (match) { return match.toUpperCase(); }) + " " + "UAE Dirhams" + " and " + t2wFils_loanAmount + " " + "Fils";
                    } else {
                        loan_amount_word = t2w_loanAmount.replace(/(^\w{1})|(\s{1}\w{1}|-)/g, function (match) { return match.toUpperCase(); }) + " " + "UAE Dirhams";
                    }
                }

            } else {
                total_fixed_word = userLetterInfo.hasOwnProperty('total_fixed_word') ? userLetterInfo.total_fixed_word : ''
                total_fixed_amount = userLetterInfo.hasOwnProperty('total_fixed') ? userLetterInfo.total_fixed : 0;
                basic_salary_word = userLetterInfo.hasOwnProperty('basic_salary_word') ? userLetterInfo.basic_salary_word : ''
                basic_salary = userLetterInfo.hasOwnProperty('basic_salary') ? userLetterInfo.basic_salary : 0;
                loan_amount_word = userLetterInfo.hasOwnProperty('loan_amount_word') ? userLetterInfo.loan_amount_word : 0;
                // loan_amount = userLetterInfo.hasOwnProperty('loan_amount_word') ? userLetterInfo.loan_amount_word : 0 ;  
            }
            this.totalFixedWord = total_fixed_word
            this.basicSalaryInWords = basic_salary_word
            this.loanAmountInWords = loan_amount_word
            this.empBasicSalary = basic_salary.toLocaleString("en-US")
            this.total_fixed_amount = total_fixed_amount.toLocaleString("en-US")
            result = result.replaceAll('[basicSalaryInWords]', basic_salary_word)
            result = result.replaceAll('[empBasicSalary]', basic_salary.toLocaleString("en-US"))
            result = result.replaceAll('[empTotalFixed]', total_fixed_amount.toLocaleString("en-US"))
            result = result.replaceAll('[totalFixedWord]', total_fixed_word)
            result = result.replaceAll('[loanAmountInWords]', loan_amount_word)


            /**
             * Bank Account Number Key
             */
            let acc_number = bln_newLetter ?
                userLetterInfo.bank.hasOwnProperty('account_number') ? userLetterInfo.bank.account_number : '' :
                userLetterInfo.hasOwnProperty('bank_account_number') ? userLetterInfo.bank_account_number : ''

            result = result.replaceAll('[bankNumber]', acc_number)

            /**
             * Compensation Table
             */
            let compensation_table = bln_newLetter ?
                this.computedSalaryTable :
                userLetterInfo.hasOwnProperty('compensation_table') ? userLetterInfo.compensation_table : ''

            this.compensationTable = result.includes('compensationTable') ? this.computedSalaryTable : ''
            result = result.replaceAll('[compensationTable]', compensation_table)

            /**
             * Personal Loan Table
             */
            let personalLoan_table = bln_newLetter ?
                this.computedPersonalLoanTable :
                userLetterInfo.hasOwnProperty('personalLoan_table') ? userLetterInfo.personalLoan_table : ''

            this.personalLoanTable = result.includes('personalLoanTable') ? this.computedPersonalLoanTable : ''
            result = result.replaceAll('[personalLoanTable]', personalLoan_table)

            /**
             * Personal Loan Table 2
             */
            let personalLoan_table2 = bln_newLetter ?
                this.computedPersonalLoanTable2 :
                userLetterInfo.hasOwnProperty('personalLoan_table2') ? userLetterInfo.personalLoan_table2 : ''

            this.personalLoanTable2 = result.includes('personalLoanTable2') ? this.computedPersonalLoanTable2 : ''
            result = result.replaceAll('[personalLoanTable2]', personalLoan_table2)

            /**
             * Personal Loan Table 3
             */
            let personalLoan_table3 = bln_newLetter ?
                this.computedPersonalLoanTable3 :
                userLetterInfo.hasOwnProperty('personalLoan_table3') ? userLetterInfo.personalLoan_table3 : ''

            this.personalLoanTable3 = result.includes('personalLoanTable3') ? this.computedPersonalLoanTable3 : ''
            result = result.replaceAll('[personalLoanTable3]', personalLoan_table3)

            return result;
        },
        removeUserFilter() {
            // this.selectedFilter = event
            this.filterReqByUser = ''
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()
            this.fetchRequestsUsers()
        },

        fetchUserFilteredReq(id) {
            this.filterReqByUser = id
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()

        },
        async fetchRequestsUsers() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            let body = {
                "history": this.viewRequestHistory,
                "requestType": this.selectedFilter,
                "userType": "MANAGER",
                "user_id": this.user._id,
                "endDate": this.selectedFilterDate == "All" ? this.furDate.toISOString() : this.curDate.toISOString(),
                "startDate": this.backDate.toISOString(),
            }

            try {
                let user_reqs = await this.$axios.$post('requests/get_requests_users_info', body, { headers: { Authorization: AuthStr } })

                if (user_reqs.data && user_reqs.data.length > 0) {
                    this.requests_users = user_reqs.data
                } else {
                    this.requests_users = []
                }

            } catch {
                e => {
                    console.log(e)
                }
            }

        },
        async fetchDataForExcelDownload() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            this.excelLoading = true
            let fromDate = ''
            let toDate = ''

            if (this.date_calendar_download.length == 1) {
                fromDate = new Date(this.date_calendar_download[0])
                toDate = new Date(this.date_calendar_download[0])
            }
            else if (this.date_calendar_download.length > 1) {
                let dates = _.orderBy(this.date_calendar_download)
                fromDate = new Date(dates[0])
                toDate = new Date(dates[1])
            }

            let body = {
                "skip": 0,
                "limit": 9999,
                "history": this.viewRequestHistory,
                "requestType": this.selectedFilter,
                "userType": "MANAGER",
                "user_id": this.user._id,
                "endDate": toDate.toISOString(),
                "startDate": fromDate.toISOString(),
                str_search_tag: "",
                req_user_id: ""
                // "2023-04-27T11:06:52.790Z"
            }

            try {
                let user_letters = await this.$axios.$post('requests/get_all_requests', body, { headers: { Authorization: AuthStr } })

                if (user_letters.data.results && user_letters.data.results.length > 0) {
                    this.excel_downloaded_data = user_letters.data.results
                    this.excelLoading = false
                } else {
                    this.excelLoading = false
                }

            } catch {
                e => {
                    console.log(e)
                }
            }

        },
        searchFn() {
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()
        },
        selectFilter(event) {

            // if(event == "salary"){
            //     if(event)
            //         this.selectedFilter = event
            //     this.arr_letters = []
            //     this.skipCount = 0
            //     this.getAllSalaryRequest()

            // }else{
            //     if(event)
            this.selectedFilter = event
            // this.filterReqByUser = ''
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequests(false)
            this.fetchRequestsUsers()
            // if(event == "ALL")
            //     this.getAllSalaryRequest()
            // }
        },
        changeRequestTypeText(val) {
            if (val) {
                if (val == 'wfh') {
                    return 'WFH'
                } else {
                    return val
                }
            }
        },
        getReqName(filterName) {
            if (filterName == 'Leave') return 'Leaves'
            if (filterName == 'wfh') return 'WFH'
            if (filterName == 'letters') return 'Letters'
            if (filterName == 'claims') return 'Claims'
            if (filterName == 'attendance') return 'Attendances'
        },
        requestFilterDownload(filterName) {
            if (filterName == 'Leave') return 'Leave'
            if (filterName == 'wfh') return 'WFH'
            if (filterName == 'letters') return 'Letters'
            if (filterName == 'claims') return 'Claims'
            if (filterName == 'attendance') return 'Attendance'
            if (filterName == 'ALL') return 'All'
        },
        async getAttendanceData() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            let body = {
                "date": this.selectedDateForAttendance,
                "user": this.getSelectedEmployee[0]
            }
            this.selectedAttendance = []
            await this.$axios.$post('attendance/get-user-attendance', body, { headers: { Authorization: AuthStr } }).then(res => {
                this.selectedAttendance = res
            }).catch(err => {
                console.log(err)
            })
        },
        formatDate(date) {
            if (!date) return null
            date = date.substr(0, 10)
            return moment(String(date)).format('DD MMM YYYY')
        },
        getCompanyDetails(val) {

            if (val) {
                let abc = this.companyData.filter(a => a._id == val)
                if (abc.length > 0) {
                    return abc[0].company_name
                }
                else {
                    return ''
                }
            }
            else {
                return ''
            }
        },
        getUsersInfoForExcel(val) {
            let abc = this.users.filter(a => a._id == val)
            return abc.length > 0 ? abc[0] : []
        },
        getManagerDetails(val) {
            if (val) {

                let abc = this.users.filter(a => a._id == val)
                if (abc.length > 0) {
                    return abc[0].first_name + ' ' + abc[0].last_name
                }
                else {
                    return ''
                }
            }
            else {
                return ''
            }
        },

        resetCalendarFilterDate() {
            this.date_calendar = []
            this.$refs.menu_calendar_button.save(this.date_calendar)
        },
        resetCalendarFilterDateDownload() {
            this.date_calendar = []
            this.$refs.menu_calendar_button2.save(this.date_calendar)
        },
        resetLeaveFormFn() {
            this.leave.appliction_log = [],
                this.leave_condition = {},
                this.leave.no_of_days = '',
                this.leave.remaining_leaves = '',
                this.leave.reason = '',
                this.leave.status = '',
                this.leave.approver_id = '',
                this.leave.certificate = [],
                this.leave.approvals = [],
                this.leave.resume_duty_flag = false,
                this.fetchedEmployee = [],
                this.requestType = '',

                this.createRequest = false
            this.selectedEmployeeId = ''

        },
        async fetchUserInfo() {
            this.fetchedEmployee = []
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            // selectedEmployeeId
            await this.$axios.$get("/users/info/" + this.selectedEmployeeId, {
                headers: { Authorization: AuthStr },
            }).then((res) => {
                this.$nuxt.$emit('user_changed', res)
                this.fetchedEmployee = res;
            }).catch();

            // this.getUserInfo()
        },
        changeName(status) {
            if (status == "Completed") return "Approved";
            if (status == "Cancelled") return "Rejected";
            if (status == "Processing") return "In Progress";
            if (status == "Withdrawn") return "Withdrawn";
        },
        async getTeamLeaveList() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            if (this.getSelectedEmployee.length > 0) {
                await this.$axios.$get("/leaves/department/" + this.getSelectedEmployee[0].reporting.department, {
                    headers: { Authorization: AuthStr },
                }).then((res) => {
                    this.leaveList_team = res;
                    this.updateRange();
                }).catch();
            }
        },
        async getTeamWfhList() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);
            if (this.getSelectedEmployee.length > 0) {

                let body = {
                    "dept": this.getSelectedEmployee[0].reporting.department,
                    "user_id": this.getSelectedEmployee[0]._id
                }


                this.$axios.$get("/wfh/users/" + this.getSelectedEmployee[0]._id, { headers: { Authorization: AuthStr } })
                    .then((res) => {
                        this.wfhList_team = res;
                        for (let i = 0; i < this.wfhList_team.length; i++) {
                            const first = this.wfhList_team[i].from_date.substr(0, 10);
                            const second = this.wfhList_team[i].to_date.substr(0, 10);
                            this.events_wfh.push({
                                name: this.getName(this.wfhList_team[i].user_id),
                                start: first,
                                end: second,
                                leave_type: this.wfhList_team[i].leave_type,
                                status: this.wfhList_team[i].status,
                                color: this.getCalendarColor(this.wfhList_team[i].status),
                            });
                        }
                        this.updateRange_wfh()

                    })
                    .catch();
            }
        },
        prev() {
            this.$refs.calendar.prev();
        },
        next() {
            this.$refs.calendar.next();
        },
        prev_wfh() {
            this.$refs.calendar_wfh.prev();
        },
        next_wfh() {
            this.$refs.calendar_wfh.next();
        },
        getEventColor(event) {
            return event.color;
        },
        showEvent({ nativeEvent, event }) {
            const open = () => {
                this.selectedEvent = event;
                this.selectedElement = nativeEvent.target;
                setTimeout(() => {
                    this.selectedOpen = true;
                }, 10);
            };

            if (this.selectedOpen) {
                this.selectedOpen = false;
                setTimeout(open, 10);
            } else {
                open();
            }

            nativeEvent.stopPropagation();
        },
        showEvent_wfh({ nativeEvent, event }) {
            const open = () => {
                this.selectedEvent_wfh = event;
                this.selectedElement_wfh = nativeEvent.target;
                setTimeout(() => {
                    this.selectedOpen_wfh = true;
                }, 10);
            };

            if (this.selectedOpen_wfh) {
                this.selectedOpen_wfh = false;
                setTimeout(open, 10);
            } else {
                open();
            }

            nativeEvent.stopPropagation();
        },
        setToday() {
            this.focus = "";
        },
        viewDay({ date }) {
            this.focus = date;
            this.type = "day";
        },
        viewDay_wfh({ date }) {
            this.focus_wfh = date;
            this.type_wfh = "day";
        },
        getName(val) {
            let abc = this.users.filter((a) => a._id == val);
            return abc[0].first_name + " " + abc[0].last_name;
        },
        getCalendarColor(val, type) {
            if (val == "Submitted") return "teal--text";
            else if ((val == "Processing" || val == "processing") && type == 'leaves') return "amber";
            else if ((val == "Processing" || val == "processing") && type == 'wfh') return "#ff5722";
            else if ((val == "Completed" || val == "completed") && type == 'leaves') return "green";
            else if ((val == "Completed" || val == "completed") && type == 'wfh') return "#2196f3";
            else if (val == "Cancelled" || val == "cancelled") return "red";
            else if (val == "Withdrawn" || val == "withdrawn") return "grey";
            else return "white";
        },
        updateRange() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);


            let events = [];
            setTimeout(() => {
                for (let i = 0; i < this.leaveList_team.length; i++) {
                    const first = this.leaveList_team[i].from_date.substr(0, 10);
                    const second = this.leaveList_team[i].to_date.substr(0, 10);
                    events.push({
                        name: this.getName(this.leaveList_team[i].user_id),
                        start: first,
                        end: second,
                        leave_type: this.leaveList_team[i].leave_type,
                        status: this.leaveList_team[i].status,
                        color: this.getCalendarColor(this.leaveList_team[i].status, 'leaves'),
                    });
                }
            }, 1000);
            this.events = events;
        },
        updateRange_wfh() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);


            let events = [];
            setTimeout(() => {
                for (let i = 0; i < this.wfhList_team.length; i++) {
                    const first = this.wfhList_team[i].from_date.substr(0, 10);
                    const second = this.wfhList_team[i].to_date.substr(0, 10);
                    events.push({
                        name: this.getName(this.wfhList_team[i].user_id),
                        start: first,
                        end: second,
                        leave_type: this.wfhList_team[i].leave_type,
                        status: this.wfhList_team[i].status,
                        color: this.getCalendarColor(this.wfhList_team[i].status, 'wfh'),
                    });
                }
            }, 1000);
            this.events_wfh = events;
        },
        downloadLetter(event) {
            this.downloadLetters = true
        },
        // letter req
        isLetterRequest(data) {
            if (data.letterDescription.requestSubType !== '') {
                return this.request.letter_type == data.letterDescription.requestType && this.request.letter_sub_type == data.letterDescription.requestSubType
            }
            return this.request.letter_type == data.letterDescription.requestType
        },
        viewLetterInfo(data) {
            this.viewInfo = true
            this.selectedService = data;
        },
        getLetterPreview(data) {
            this.viewInfo = false
            this.selectedService = data;
        },
        getLetterTypeList() {
            let letterType = [];
            let letterSubType = [];
            if (this.configData[0]) {
                this.configData[0].letterRequest.filter(a => a.category == 'selfService').forEach(function (letter) {
                    if (letterType.indexOf(letter.letterDescription.requestType) == -1) {
                        letterType.push(letter.letterDescription.requestType);
                    }
                    if (letter.letterDescription.requestSubType && letterType.indexOf(letter.letterDescription.requestSubType) == -1) {
                        letterSubType.push(letter.letterDescription.requestSubType)
                    }
                })
            }
            this.letterOptions = letterType
            this.NOCOptions = letterSubType
        },
        //letter req ends

        getTeamRequestPreview(data) {
            if (data.hasOwnProperty('leave_type')) {
                this.requestType = 'Leave'
                this.showHeaderPlanner = true
            } else if (data.request_type == 'wfh') {
                this.requestType = 'wfh'
                this.showHeaderPlanner = true
            } else {
                this.requestType = ''
            }
            this.selectedEmployeeId = data.user_id
            this.requestInfo = true
            this.selectedService = data
        },
        getTeamRequest(id) {
            return this.filterValue.filter(a => a.user_id == id)
        },
        getUserName(val) {
            if (val == '' || val == undefined || val == null) {
                return ''
            }
            else {
                let abc = this.users.filter(a => a._id == val)
                return abc.length > 0 ? abc[0].first_name + " " + abc[0].last_name : ''
            }
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
        dateFormatter(val) {
            return val ? moment(val).format("DD-MM-YYYY") : "";
        },

        customdate(data) {
            this.customdatedial = false
            let d1 = new Date(data[0])
            let d2 = new Date(data[1])

            if (d1.getTime() < d2.getTime()) {
                this.curDate = d2
                this.backDate = d1
            } else if (d1.getTime() > d2.getTime()) {
                this.curDate = d1
                this.backDate = d2
            } else {
                this.backDate = d1
                this.curDate = d1
            }
            this.arr_letters = []
            this.skipCount = 0
            this.getAllRequestsCount()
            this.fetchRequestsUsers()

        },
        changedDate(event) {

            if (event == "All") {
                this.arr_letters = []
                this.skipCount = 0

                let start = new Date(86399)
                this.monthOld = (this.curDate.getMonth() - start.getMonth())
                this.backDate.setMonth(this.curDate.getMonth() - this.monthOld)
                this.backDate.setFullYear(start.getFullYear())
                // this.curDate.setFullYear(2050)
                this.furDate.setFullYear(this.curDate.getFullYear() + 99)
                this.getAllRequestsCount()
                this.fetchRequestsUsers()

            } else if (event == "Custom") {

                this.customdatedial = true

            } else if (event.split(" ").length > 0) {
                this.curDate = new Date(),
                    this.arr_letters = []
                this.skipCount = 0
                this.monthOld = event.split(" ")[1]
                this.backDate.setFullYear(this.curDate.getFullYear())
                this.backDate.setMonth(this.curDate.getMonth() - this.monthOld)
                this.getAllRequestsCount()
                this.fetchRequestsUsers()
            }

        },
        // get the count of the record and then get the data using the total count inside a loop.
        async getAllRequestsCount() {
            this.requestInfo = false
            this.arr_letters = []
            let body = {
                "history": this.viewRequestHistory,
                "userType": "MANAGER",
                "user_id": this.user._id,
                "endDate": this.selectedFilterDate == "ALL" ? this.furDate.toISOString() : this.curDate.toISOString(),
                "startDate": this.backDate.toISOString(),
                str_search_tag: this.searchRequests,
                req_user_id: this.filterReqByUser
            }
            try {
                await this.$axios.$post('requests/get_all_requests_count/' + this.user._id, body)
                    .then(res => {
                        this.letterCount = res.data.lettersCount ? res.data.lettersCount : 0;
                        this.wfhCount = res.data.wfhCount ? res.data.wfhCount : 0;
                        this.attendanceCount = res.data.attendanceCount ? res.data.attendanceCount : 0;
                        this.claimsCount = res.data.claimCount ? res.data.claimCount : 0;
                        this.leaveCount = res.data.leaveCount ? res.data.leaveCount : 0;
                        this.loanCount = res.data.loanCount ? res.data.loanCount : 0;
                        this.educationCount = res.data.educationCount ? res.data.educationCount : 0;
                        this.passportCount = res.data.passportCount ? res.data.passportCount : 0;
                        this.totalCount = this.letterCount + this.wfhCount + this.attendanceCount + this.claimsCount + this.leaveCount + this.loanCount + this.educationCount + this.passportCount + this.salaryCount
                        this.getAllRequests(false)
                    })

                // await this.$axios.$post('salaryAdjustment/get_all_requests_count/'+this.user._id, {"history": this.viewRequestHistory})
                // .then(res => {
                //     this.salaryCount = res
                //     this.totalCount = this.totalCount+this.salaryCount
                //     this.getAllSalaryRequest()
                // })

            } catch { e => { console.log(e) } }
        },

        async getAllSalaryRequest() {
            await this.$axios.$post('salaryAdjustment/get_all_requests/' + this.user._id, { "history": this.viewRequestHistory })
                .then(res => {
                    if (this.searchRequests != null) {
                        let result = res.map(e => {
                            let abc = _.cloneDeep(this.users)
                            if (abc) {
                                e.full_name = (abc.filter(ab => ab._id == e.user_id)[0].first_name + " " + abc.filter(ab => ab._id == e.user_id)[0].last_name).trim().replace(/\s+/g, ' ')
                            }
                            return e
                        })
                        let salAdjArr = result.filter(e => {
                            return e.full_name.toLowerCase().includes(this.searchRequests.toLowerCase())
                        })
                        this.arr_letters = this.arr_letters.concat(salAdjArr)
                    } else {
                        this.arr_letters = this.arr_letters.concat(res)
                    }
                })
        },
        // get all data
        async getAllRequests(filterSelected) {
            // for(let x = 0 ; x < Math.ceil(this.totalCount/this.pageLimit)  ; x++ ){
            //     if(this.breakloop) break

            this.loading = true

            // this.arr_letters = []

            if (filterSelected) {

                this.skipCount = 0
                this.arr_letters = []
                this.nextReq = false
            }
            if (this.nextReq) return
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            let body = {
                "skip": this.skipCount,
                "limit": this.pageLimit,
                "history": this.viewRequestHistory,
                "requestType": this.selectedFilter,
                "userType": "MANAGER",
                "user_id": this.user._id,
                "endDate": this.selectedFilterDate == "ALL" ? this.furDate.toISOString() : this.curDate.toISOString(),
                "startDate": this.backDate.toISOString(),
                str_search_tag: this.searchRequests,
                req_user_id: this.filterReqByUser
            }
            this.nextReq = true

            try {
                let url = ''
                if (this.selectedFilter == 'ALL') {
                    url = 'requests/get_requests_all'
                } else if (this.selectedFilter == 'Leave') {
                    url = 'requests/get_all_leave_requests'
                } else if (this.selectedFilter == 'attendance') {
                    url = 'requests/get_all_attendance_and_claim_requests'
                } else if (this.selectedFilter == 'wfh') {
                    url = 'requests/get_all_wfh_requests'
                } else if (this.selectedFilter == 'letters') {
                    url = 'requests/get_all_letter_requests'
                } else if (this.selectedFilter == 'claims') {
                    url = 'requests/get_all_attendance_and_claim_requests'
                } else if (this.selectedFilter == 'education') {
                    url = 'requests/get_all_requests'
                } else {
                    url = 'requests/get_all_requests'
                }
                let user_letters = await this.$axios.$post(url, body, { headers: { Authorization: AuthStr } })

                if (user_letters.data.results && user_letters.data.results.length > 0) {

                    user_letters = user_letters.data.results

                    this.nextReq = false
                    this.skipCount += this.pageLimit

                    if (this.arr_letters.length > 0) {
                        this.arr_letters = this.arr_letters.concat(user_letters)
                    }
                    else this.arr_letters = user_letters

                    this.arr_letters = _.orderBy(this.arr_letters, ['date_created'], ['asc'])
                    _.uniq(this.arr_letters)
                    // this.getServiceRequestOnLoad()
                    this.loading = false

                } else {
                    // this.getServiceRequestOnLoad()

                    this.loading = false
                    this.nextReq = false
                    // this.viewRequestHistory = this.viewRequestHistory
                }

            } catch {
                e => {
                    console.log(e)
                }
            }
            // }


            this.downloadexcel = true

        },
        // invoke when click view history
        loadHistory() {
            this.downloadexcel = false
            this.viewRequestHistory = !this.viewRequestHistory
            this.arr_letters = []
            this.skipCount = 0

            // this.monthOld = 6
            // this.backDate.setMonth( this.curDate.getMonth() - this.monthOld)
            this.getAllRequestsCount()
            this.fetchRequestsUsers()
        },
        // add when new request type is added for excel
        getFields() {
            if (this.selectedFilter == 'letters') {
                return this.json_fields_letters
            } else if (this.selectedFilter == 'claims') {
                return this.json_fields_claims
            } else if (this.selectedFilter == 'Leave') {
                return this.json_fields_leaves
            } else if (this.selectedFilter == 'attendance') {
                return this.json_fields_attendance
            } else if (this.selectedFilter == 'wfh') {
                return this.json_fields_wfh
            } else {
                return this.json_fields_all
            }
        },

        requestListScrollerObserver() {
            if (this.totalCount > this.arr_letters.length) this.getAllRequests()
        },


        getServiceRequestOnLoad() {
            if (this.arr_letters && this.arr_letters.length > 0) {
                this.selectedService = this.arr_letters[0];
            }
        },
        isAdmin() {
            this.isAdminRole = this.$store.getters.isAdmin
        },
        getUserInfo() {
            this.emp = this.user
        },
        unique(value, index, self) {
            return self.indexOf(value) === index
        },
        getUserCompanyManager(letterType) {
            if (letterType.company_signatory) {
                let userCompany = this.companyData.filter((ele) => ele._id == this.user.company_ID)
                return userCompany.length ? userCompany[0].letterDetail.manager : " "
            } else {
                return letterType.signatory_manager
            }
        },
        dateFormatter(val) {
            return val ? moment(val).format('YYYY-MM-DD') : ''
        },
        computeRequestTypeList(val) {
            let arr = []
            for (let index = 0; index < val.length; index++) {
                let obj = {}
                const element = val[index];
                if (element == 'wfh') {
                    obj.name = 'WFH'
                    obj.value = 'wfh'
                } else {
                    obj.name = element
                    obj.value = element
                }
                arr.push(obj)
            }
            return arr
        },
        openEditClaimReq() {
            this.createRequest = true;
            this.requestInfo = false;
            this.requestType = 'Claims';
            this.getDraftClaimReq();
        },
        getDraftClaimReq() {
            if (this.computedServiceList.status?.toLowerCase() === 'draft') {
                const allClaimSubTypes = this.config_details.ClaimSubTypes;
                this.request_claims.status = this.computedServiceList.status;
                this.request_claims.id = this.computedServiceList._id;
                this.request_claims.letter_fields = this.computedServiceList.letter_fields;
                const claims = this.computedServiceList.claims ? this.computedServiceList.claims : [];
                let letterSubTypes = [];
                claims.forEach((claim) => {
                    let subType = {};
                    subType.letter_type = claim.letter_type;
                    let claimDetails = _.cloneDeep(allClaimSubTypes.find((el) => el.claimType === claim.letter_type && el.claimSubType === claim.letter_sub_type));
                    if (claimDetails) {
                        const claimKeys = [];
                        claimDetails.claim_keys.forEach((claimKey) => {
                            let key = {
                                ...claimKey
                            };
                            if (key.type.toLowerCase() === "attachments") {
                                const file = claim.details.files.find((file) => this.getFormattedKeyName(file.name) === this.getFormattedKeyName(key.name));
                                if (file) {
                                    key.value = [];
                                    key.value.push(file)
                                }
                            } else if (key.type.toLowerCase() === "number field") {
                                // For number field there is calculated value will be there
                                key.value = claim.details['calculated_' + this.getFormattedKeyName(key.name)] ? claim.details['calculated_' + this.getFormattedKeyName(key.name)] : claim.details[this.getFormattedKeyName(key.name)] ? claim.details[this.getFormattedKeyName(key.name)] : '';
                                key.inputvalue = claim.details[this.getFormattedKeyName(key.name)] ? claim.details[this.getFormattedKeyName(key.name)] : '';
                            } else {
                                key.value = claim.details[this.getFormattedKeyName(key.name)] ? claim.details[this.getFormattedKeyName(key.name)] : '';
                            }
                            claimKeys.push(key)
                        })
                        claimDetails.claim_keys = claimKeys;
                        Object.assign(subType, claimDetails);
                    }
                    letterSubTypes.push(subType);
                })
                this.request_claims.letter_sub_type = letterSubTypes;
            }
        },
        getFormattedKeyName(key) {
            return key.toLowerCase().replace(" ", "_");
        },
        getFormattedText(key) {
            return key?.length ? key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
        },
        resetClaimConfig() {
            this.request_claims = {
                request_type: 'claims',
                letter_type: '',
                letter_sub_type: [],
                status: '',
                approvals: [],
                letter_fields: {
                    date: new Date().toISOString().substr(0, 10),
                    amount: '',
                    description: ''
                },
                admin_open_msg: 'closed',
                user_open_msg: 'closed',
                user_id: '',
                assigned_to: '',
                company_id: ''
            }
        },
        async deleteDraftClaimReq() {
            try {
                if (this.computedServiceList?.status?.toLowerCase() === 'draft' && this.computedServiceList._id) {
                    const token = this.$store.getters.getToken;
                    const AuthStr = 'Bearer '.concat(token);
                    const response = await this.$axios.$delete("/claim/delete_draft/" + this.computedServiceList._id, {
                        headers: {
                            Authorization: AuthStr
                        }
                    });
                    this.snack = true;
                    if (response) {
                        if (response.success) {
                            this.snackText = 'Claim Request Deleted Successfully!';
                            this.snackColor = 'green';
                            this.arr_letters = []
                            this.skipCount = 0
                            this.getAllRequestsCount()
                            this.fetchRequestsUsers()
                        } else {
                            this.snackText = response.message;
                            this.snackColor = red;
                        }
                    }
                }
            } catch (error) {
                console.error("Error:", error);
                this.snack = true;
                this.snackText = 'Error deleting claim request.';
                this.snackColor = 'red';
            }
        },
    },
    computed: {
        filteredRequestsUsers() {
            if (!this.filterName) {
                return this.requests_users.sort((a, b) => {
                    const nameA = a.user_name.toLowerCase();
                    const nameB = b.user_name.toLowerCase();

                    if (nameA < nameB) { return -1 }
                    if (nameA > nameB) { return 1 }
                    return 0
                });
            }
            const filterText = this.filterName.toLowerCase();
            return this.requests_users.filter(item => {
                const userName = this.getUserName(item._id).toLowerCase();
                return userName.includes(filterText);
            });
        },
        computedCurrentMonth() {
            if (this.selectedService.from_date) {
                return this.dateFormatter(this.selectedService.from_date)
            } else {
                return moment(this.selectedService.from_date).format('YYYY-MM-DD')
            }
        },
        getInfoForDownload() {
            if (this.dateRangeTextExcel != '') {
                if (this.excel_downloaded_data == '' || this.excel_downloaded_data == undefined || this.excel_downloaded_data == null) {
                    return []
                }
                else {
                    let fromDate = ''
                    let toDate = ''
                    if (this.date_calendar_download.length == 1) {
                        fromDate = new Date(this.date_calendar_download[0])
                    }
                    else if (this.date_calendar_download.length > 1) {
                        let dates = _.orderBy(this.date_calendar_download)
                        fromDate = new Date(dates[0])
                        toDate = new Date(dates[1])
                    }
                    let clonedData = _.cloneDeep(this.excel_downloaded_data)
                    let abc = clonedData
                    if (this.selectedFilter == 'letters' || this.selectedFilter == 'claims' || this.selectedFilter == 'attendance') {
                        // if(this.date_calendar_download.length == 1){
                        //     abc = clonedData.filter(a=>{
                        //         let CDate = moment(String(a.letter_fields.date)).format('DD MMM, YYYY')
                        //         let FDate = moment(String(this.date_calendar_download[0])).format('DD MMM, YYYY')
                        //         return CDate == FDate
                        //     })
                        // }
                        // else  if(this.date_calendar_download.length > 1){
                        //     abc = clonedData.filter(a=>{
                        //         let CDate = new Date(a.letter_fields.date)
                        //         return CDate >= fromDate && CDate <= toDate
                        //     })
                        // }
                    } else if (this.selectedFilter == 'Leave' || this.selectedFilter == 'wfh') {
                        // if(this.date_calendar_download.length == 1){
                        //     abc = clonedData.filter(a=>{
                        //         let CDate = moment(String(a.date_created)).format('DD MMM, YYYY')
                        //         let FDate = moment(String(this.date_calendar_download[0])).format('DD MMM, YYYY')
                        //         return CDate == FDate
                        //     })
                        // }
                        // else  if(this.date_calendar_download.length > 1){
                        //     abc = clonedData.filter(a=>{
                        //         let CDate = new Date(a.date_created)
                        //         return CDate >= fromDate && CDate <= toDate
                        //     })
                        // }
                    } else if (this.selectedFilter == 'ALL') {
                        // if(this.date_calendar_download.length == 1){
                        //     abc = clonedData.filter(a=>{
                        //         let CDate = a.request_type == 'attendance' ? moment(String(a.letter_fields.startTime)).format('DD MMM, YYYY') : a.request_type == 'leaves' || a.request_type == 'wfh' ? moment(String(a.from_date)).format('DD MMM, YYYY') : moment(String(a.letter_fields.date)).format('DD MMM, YYYY')
                        //         let FDate = moment(String(this.date_calendar_download[0])).format('DD MMM, YYYY')
                        //         return CDate == FDate
                        //     })
                        // }
                        // else  if(this.date_calendar_download.length > 1){
                        //     abc = clonedData.filter(a=>{
                        //         let CDate = a.request_type == 'attendance' ? moment(String(a.letter_fields.startTime)).format('DD MMM, YYYY') : a.request_type == 'leaves' || a.request_type == 'wfh' ? new Date(a.from_date) : new Date(a.letter_fields.date)
                        //         return CDate >= fromDate && CDate <= toDate
                        //     })
                        // }
                    }

                    if (this.selectedFilter == 'letters') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {

                            let status = ''

                            // if (abc[index].status == 'completed') {
                            //     status = 'Approved'
                            // } else if (abc[index].status == 'processing') {
                            //     status = 'In Progress'
                            // } else if (abc[index].status == 'Cancelled') {
                            //     status = 'Rejected'
                            // } else if (abc[index].status == 'withdrawn') {
                            //     status = 'Withdrawn'
                            // } 

                            let lettersObj = {
                                emp_id: "",
                                full_name: "",
                                doj: "",
                                designation: "",
                                dept: "",
                                company: "",
                                manager: "",
                                letter_type: '',
                                letter_sub_type: "",
                                requestedDate: "",
                                approvedDate: "",
                                status: ''
                            }
                            lettersObj.emp_id = this.getUsersInfoForExcel(abc[index].user_id).emp_id
                            lettersObj.full_name = this.getUsersInfoForExcel(abc[index].user_id).first_name + ' ' + this.getUsersInfoForExcel(abc[index].user_id).middle_name + ' ' + this.getUsersInfoForExcel(abc[index].user_id).last_name
                            lettersObj.doj = this.getUsersInfoForExcel(abc[index].user_id).date_of_joining
                            lettersObj.designation = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.designation : ""
                            lettersObj.dept = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.department : ""
                            lettersObj.company = this.getCompanyDetails(this.getUsersInfoForExcel(abc[index].user_id).company_ID)
                            lettersObj.manager = this.getManagerDetails(this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.manager : "")
                            lettersObj.letter_type = abc[index].letter_type
                            lettersObj.letter_sub_type = abc[index].letter_sub_type
                            lettersObj.requestedDate = this.formatDate(abc[index].letter_fields.date)
                            lettersObj.approvedDate = this.formatDate(abc[index].approvals.length > 0 ? abc[index].approvals[abc[index].approvals.length - 1].approved_date : "")
                            lettersObj.status = abc[index].status

                            arr.push({ ...lettersObj })
                        }

                        return arr
                    } else if (this.selectedFilter == 'Leave') {
                        let array_leave_data = abc;
                        // const leaveObj = new Leave();

                        // let getReportData = leaveObj.funLeavesReport(
                        // array_leave_data,
                        // this.users,
                        // this.users,///managers
                        // this.companyData
                        // );
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let leaveObj = {
                                "APPROVED_DATE": "",
                                "APPROVERS": "",
                                "COMAPNY": "",
                                "DEPT": "",
                                "DESIGNATION": "",
                                "DOJ": "",
                                "EMD_ID": "",
                                "FROM_DATE": "",
                                "LEAVE_TYPE": "",
                                "MANAGER": "",
                                "NO_OF_DAYS": "",
                                "REASON": "",
                                "REQUESTED_DATE": "",
                                "STATUS": "",
                                "TO_DATE": "",
                                "USER_NAME": ""
                            }
                            leaveObj.APPROVED_DATE = this.formatDate(abc[index].approvals.length > 0 ? abc[index].approvals[abc[index].approvals.length - 1].approved_date : "")
                            leaveObj.COMAPNY = this.getCompanyDetails(this.getUsersInfoForExcel(abc[index].user_id).company_ID)
                            leaveObj.DEPT = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.department : ""
                            leaveObj.DESIGNATION = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.designation : ""
                            leaveObj.DOJ = this.getUsersInfoForExcel(abc[index].user_id).date_of_joining
                            leaveObj.EMD_ID = this.getUsersInfoForExcel(abc[index].user_id).emp_id
                            leaveObj.FROM_DATE = this.formatDate(abc[index].from_date)
                            leaveObj.LEAVE_TYPE = abc[index].leave_type
                            leaveObj.MANAGER = this.getManagerDetails(this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.manager : "")
                            leaveObj.NO_OF_DAYS = abc[index].no_of_days
                            leaveObj.REASON = abc[index].reason
                            leaveObj.REQUESTED_DATE = this.formatDate(abc[index].date_created)
                            leaveObj.STATUS = abc[index].status
                            leaveObj.TO_DATE = this.formatDate(abc[index].to_date)
                            leaveObj.USER_NAME = this.getUsersInfoForExcel(abc[index].user_id).first_name + ' ' + this.getUsersInfoForExcel(abc[index].user_id).middle_name + ' ' + this.getUsersInfoForExcel(abc[index].user_id).last_name
                            arr.push({ ...leaveObj })
                        }
                        return arr
                    } else if (this.selectedFilter == 'claims') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            const claims = abc[index].claims;
                            if (claims?.length) {
                                for (let i = 0; i < claims.length; i++) {
                                    let claimsObj = {
                                        emp_id: "",
                                        first_name: "",
                                        last_name: "",
                                        gender: "",
                                        marital_status: "",
                                        doj: "",
                                        designation: "",
                                        dept: "",
                                        company: "",
                                        manager: "",
                                        reference_number: "",
                                        claim_type: '',
                                        claim_sub_type: "",
                                        amount: "",
                                        comments: "",
                                        requestedDate: "",
                                        status: ''
                                    }
                                    claimsObj.emp_id = this.getUsersInfoForExcel(abc[index].user_id).emp_id
                                    claimsObj.first_name = this.getUsersInfoForExcel(abc[index].user_id).first_name
                                    claimsObj.middle_name = this.getUsersInfoForExcel(abc[index].user_id).middle_name
                                    claimsObj.last_name = this.getUsersInfoForExcel(abc[index].user_id).last_name
                                    claimsObj.gender = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.gender : ""
                                    claimsObj.marital_status = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.marital_status : ''
                                    claimsObj.doj = this.getUsersInfoForExcel(abc[index].user_id).date_of_joining
                                    claimsObj.designation = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.designation : ""
                                    claimsObj.dept = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.department : ""
                                    claimsObj.company = this.getCompanyDetails(this.getUsersInfoForExcel(abc[index].user_id).company_ID)
                                    claimsObj.manager = this.getManagerDetails(this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.manager : "")
                                    claimsObj.reference_number = abc[index].letter_fields.reference_number
                                    claimsObj.claim_type = claims[i].letter_type
                                    claimsObj.claim_sub_type = claims[i].letter_sub_type
                                    claimsObj.amount = claims[i].details.amount
                                    claimsObj.comments = abc[index].letter_fields.description
                                    claimsObj.requestedDate = abc[index].letter_fields.date
                                    claimsObj.approvedDate = this.formatDate(abc[index].approvals.length > 0 ? abc[index].approvals[abc[index].approvals.length - 1].approved_date : "")
                                    claimsObj.status = abc[index].status

                                    arr.push({ ...claimsObj })
                                }
                            }
                        }

                        return arr
                    } else if (this.selectedFilter == 'attendance') {


                        let timeFormat = function (value) {
                            if (value) {
                                return moment(String(value)).format('hh:mm')
                            }
                        }
                        let dayFormat = function (value) {
                            if (value) {
                                return moment(String(value)).format('dddd')
                            }
                        }
                        let dateFormat = function (value) {
                            if (value) {
                                return moment(String(value)).format('DD MMM, YYYY')
                            }
                        }
                        let arr = []

                        for (let index = 0; index < abc.length; index++) {


                            let attendanceObj = {
                                emp_id: "",
                                first_name: "",
                                last_name: "",
                                gender: "",
                                marital_status: "",
                                doj: "",
                                designation: "",
                                dept: "",
                                company: "",
                                manager: "",
                                request_type: "",
                                letter_type: "",
                                request_date: "",
                                login_date: "",
                                login_time: "",
                                logout_date: "",
                                logout_time: "",
                                user_comments: "",
                                status: '',
                                requestCreationDate: ""
                            }
                            attendanceObj.emp_id = this.getUsersInfoForExcel(abc[index].user_id).emp_id
                            attendanceObj.first_name = this.getUsersInfoForExcel(abc[index].user_id).first_name
                            attendanceObj.middle_name = this.getUsersInfoForExcel(abc[index].user_id).middle_name
                            attendanceObj.last_name = this.getUsersInfoForExcel(abc[index].user_id).last_name
                            attendanceObj.gender = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.gender : ""
                            attendanceObj.marital_status = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.marital_status : ''
                            attendanceObj.doj = this.getUsersInfoForExcel(abc[index].user_id) ? this.getUsersInfoForExcel(abc[index].user_id).date_of_joining : ''
                            attendanceObj.designation = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.designation : ""
                            attendanceObj.dept = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.department : ""
                            attendanceObj.company = this.getCompanyDetails(this.getUsersInfoForExcel(abc[index].user_id).company_ID)
                            attendanceObj.manager = this.getManagerDetails(this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.manager : "")
                            attendanceObj.request_type = abc[index].request_type
                            attendanceObj.letter_type = abc[index].letter_type
                            attendanceObj.login_date = dateFormat(abc[index].letter_fields.startTime)
                            attendanceObj.login_time = timeFormat(abc[index].letter_fields.startTime)
                            attendanceObj.logout_date = dateFormat(abc[index].letter_fields.endTime)
                            attendanceObj.logout_time = timeFormat(abc[index].letter_fields.endTime)
                            attendanceObj.user_comments = abc[index].letter_fields.comments
                            attendanceObj.status = abc[index].status
                            attendanceObj.requestCreationDate = new Date(abc[index].date_created).toLocaleString()
                            arr.push({ ...attendanceObj })
                        }

                        return arr
                    }
                    else if (this.selectedFilter == 'wfh') {
                        let arr = []

                        for (let index = 0; index < abc.length; index++) {
                            let wfhObj = {
                                emp_id: "",
                                full_name: "",
                                doj: "",
                                designation: "",
                                dept: "",
                                company: "",
                                manager: "",
                                no_of_days: "",
                                requestedDate: "",
                                fromDate: "",
                                toDate: "",
                                approvedDate: "",
                                status: ''
                            }
                            wfhObj.emp_id = this.getUsersInfoForExcel(abc[index].user_id).emp_id
                            wfhObj.full_name = this.getUsersInfoForExcel(abc[index].user_id).first_name + ' ' + this.getUsersInfoForExcel(abc[index].user_id).middle_name + ' ' + this.getUsersInfoForExcel(abc[index].user_id).last_name
                            wfhObj.doj = this.getUsersInfoForExcel(abc[index].user_id).date_of_joining
                            wfhObj.designation = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.designation : ""
                            wfhObj.manager = this.getManagerDetails(this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.manager : "")
                            wfhObj.dept = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.department : ""
                            wfhObj.company = this.getCompanyDetails(this.getUsersInfoForExcel(abc[index].user_id).company_ID)
                            wfhObj.no_of_days = abc[index].no_of_days
                            wfhObj.requestedDate = this.formatDate(abc[index].date_created)
                            wfhObj.fromDate = this.formatDate(abc[index].from_date)
                            wfhObj.toDate = this.formatDate(abc[index].to_date)
                            wfhObj.approvedDate = this.formatDate(abc[index].approvals.length > 0 ? abc[index].approvals[abc[index].approvals.length - 1].approved_date : "")
                            wfhObj.status = abc[index].status

                            arr.push({ ...wfhObj })
                        }

                        return arr
                    } else if (this.selectedFilter == 'passport') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let loanObj = {
                                emp_id: "",
                                first_name: "",
                                last_name: "",
                                gender: "",
                                marital_status: "",
                                doj: "",
                                designation: "",
                                dept: "",
                                company: "",
                                manager: "",
                                comments: "",
                                requestedDate: "",
                                status: ''
                            }
                            loanObj.emp_id = this.getUsersInfoForExcel(abc[index].user_id).emp_id
                            loanObj.first_name = this.getUsersInfoForExcel(abc[index].user_id).first_name
                            loanObj.middle_name = this.getUsersInfoForExcel(abc[index].user_id).middle_name
                            loanObj.last_name = this.getUsersInfoForExcel(abc[index].user_id).last_name
                            loanObj.gender = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.gender : ""
                            loanObj.marital_status = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.marital_status : ''
                            loanObj.doj = this.getUsersInfoForExcel(abc[index].user_id).date_of_joining
                            loanObj.designation = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.designation : ""
                            loanObj.dept = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.department : ""
                            loanObj.company = this.getCompanyDetails(this.getUsersInfoForExcel(abc[index].user_id).company_ID)
                            loanObj.manager = this.getManagerDetails(this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.manager : "")
                            loanObj.comments = abc[index].letter_fields.description
                            loanObj.requestedDate = this.formatDate(abc[index].letter_fields.date)
                            loanObj.approvedDate = this.formatDate(abc[index].approvals.length > 0 ? abc[index].approvals[abc[index].approvals.length - 1].approved_date : "")
                            loanObj.status = abc[index].status

                            arr.push({ ...loanObj })
                        }

                        return arr
                    }
                    else if (this.selectedFilter == 'education') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let loanObj = {
                                emp_id: "",
                                first_name: "",
                                last_name: "",
                                gender: "",
                                marital_status: "",
                                doj: "",
                                designation: "",
                                dept: "",
                                company: "",
                                manager: "",
                                comments: "",
                                requestedDate: "",
                                status: ''
                            }
                            loanObj.emp_id = this.getUsersInfoForExcel(abc[index].user_id).emp_id
                            loanObj.first_name = this.getUsersInfoForExcel(abc[index].user_id).first_name
                            loanObj.middle_name = this.getUsersInfoForExcel(abc[index].user_id).middle_name
                            loanObj.last_name = this.getUsersInfoForExcel(abc[index].user_id).last_name
                            loanObj.gender = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.gender : ""
                            loanObj.marital_status = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.marital_status : ''
                            loanObj.doj = this.getUsersInfoForExcel(abc[index].user_id).date_of_joining
                            loanObj.designation = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).personal ? this.getUsersInfoForExcel(abc[index].user_id).personal.designation : ""
                            loanObj.dept = this.getUsersInfoForExcel(abc[index].user_id) && this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.department : ""
                            loanObj.company = this.getCompanyDetails(this.getUsersInfoForExcel(abc[index].user_id).company_ID)
                            loanObj.manager = this.getManagerDetails(this.getUsersInfoForExcel(abc[index].user_id).reporting ? this.getUsersInfoForExcel(abc[index].user_id).reporting.manager : "")
                            loanObj.comments = abc[index].letter_fields.description
                            loanObj.requestedDate = this.formatDate(abc[index].letter_fields.date)
                            loanObj.approvedDate = this.formatDate(abc[index].approvals.length > 0 ? abc[index].approvals[abc[index].approvals.length - 1].approved_date : "")
                            loanObj.status = abc[index].status

                            arr.push({ ...loanObj })
                        }

                        return arr
                    } else if (this.selectedFilter == 'ALL') {
                        let arr = []
                        let allObj = {
                            emp_id: "",
                            first_name: "",
                            last_name: "",
                            gender: "",
                            marital_status: "",
                            doj: "",
                            designation: "",
                            department: '',
                            dept: "",
                            company: "",
                            manager: "",
                            status: '',
                            request_type: "",
                            letter_type: '',
                            letter_sub_type: "",
                            reference_number: "",
                            claim_type: '',
                            claim_sub_type: "",
                            leave_type: "",
                            no_of_days: '',
                            date_created: '',
                            to_date: '',
                            amount: '',
                            description: '',
                            startTime: '',
                            endTime: ''
                        }

                        for (let index = 0; index < abc.length; index++) {
                            allObj.emp_id = abc[index].user_data.emp_id
                            allObj.first_name = abc[index].user_data.first_name
                            allObj.last_name = abc[index].user_data.last_name
                            allObj.gender = abc[index].user_data.gender
                            allObj.marital_status = abc[index].user_data.marital_status
                            allObj.doj = abc[index].user_data.date_of_joining
                            allObj.designation = abc[index].user_data.designation || ' '
                            allObj.dept = abc[index].user_data.department || ""
                            allObj.company = this.getCompanyDetails(abc[index].user_data.company_ID)
                            allObj.manager = this.getManagerDetails(abc[index].user_data.manager || "")
                            allObj.request_type = abc[index].request_type
                            allObj.department = abc[index].user_data.department
                            allObj.no_of_days = abc[index].no_of_days
                            allObj.date_created = this.formatDate(abc[index].from_date) || this.formatDate(abc[index].date_created)

                            allObj.to_date = this.formatDate(abc[index].to_date)
                            allObj.letter_type = abc[index].request_type == 'letters' ? abc[index].letter_type : ''
                            allObj.letter_sub_type = abc[index].request_type == 'letters' ? abc[index].letter_sub_type : ''
                            allObj.leave_type = abc[index].request_type == 'leaves' ? abc[index].leave_type : ''
                            allObj.amount = abc[index].hasOwnProperty('letter_fields') ? abc[index].letter_fields.amount : ""
                            allObj.description = abc[index].request_type == 'attendance' ? abc[index].letter_fields.comments : abc[index].hasOwnProperty('letter_fields') ? abc[index].letter_fields.description : ""
                            allObj.startTime = abc[index].request_type == 'attendance' ? moment(String(abc[index].letter_fields.startTime)).format('DD MMM, YYYY') + " " + moment(String(abc[index].letter_fields.startTime)).format('hh:mm') : ""
                            allObj.endTime = abc[index].request_type == 'attendance' ? moment(String(abc[index].letter_fields.endTime)).format('DD MMM, YYYY') + " " + moment(String(abc[index].letter_fields.endTime)).format('hh:mm') : ""
                            allObj.status = abc[index].status

                            if (abc[index].request_type == 'claims' && abc[index].claims?.length) {
                                const claims = abc[index].claims;
                                for (let i = 0; i < claims.length; i++) {
                                    allObj.reference_number = abc[index].letter_fields.reference_number
                                    allObj.claim_type = claims[i].letter_type ? claims[i].letter_type : ''
                                    allObj.claim_sub_type = claims[i].letter_sub_type ? claims[i].letter_sub_type : ''
                                    arr.push({
                                        ...allObj
                                    })
                                }
                            } else {
                                allObj.reference_number = '';
                                allObj.claim_type = '';
                                allObj.claim_sub_type = '';
                                arr.push({ ...allObj })
                            }
                        }
                        this.excel_downloaded_data = []
                        return arr
                    }
                    this.excelLoading = false
                }
            } else {
                return []
            }
        },
        dateRangeText() {
            var formatDate = function (date) {
                return moment(String(date)).format('DD MMM YYYY')
            }
            if (this.date_calendar.length == 1) {
                return `${formatDate(this.date_calendar[0])} - ${formatDate(this.date_calendar[0])}`
            }
            else if (this.date_calendar.length > 1) {
                let abc = _.orderBy(this.date_calendar)
                return `${formatDate(abc[0])} - ${formatDate(abc[1])}`
            }
            else {
                return ''
            }
        },
        dateRangeTextExcel() {
            var formatDate = function (date) {
                return moment(String(date)).format('DD MMM YYYY')
            }
            if (this.date_calendar_download.length == 1) {
                return `${formatDate(this.date_calendar_download[0])} - ${formatDate(this.date_calendar_download[0])}`
            }
            else if (this.date_calendar_download.length > 1) {
                let abc = _.orderBy(this.date_calendar_download)
                return `${formatDate(abc[0])} - ${formatDate(abc[1])}`
            }
            else {
                return ''
            }
        },
        computeDateNewRequest() {
            return moment(new Date().toISOString().substr(0, 10)).format(this.filterLetterFormats.dateFormat)
        },
        replaceHeader() {
            this.request.letter_keys = this.filterLetterFormats.letterKeys
            this.request.user_keys = this.filterLetterFormats.user_keys
            let userInfo = this.getSelectedEmployee[0]
            let letter_template = this.filterLetterFormats
            let requestInfo = this.request
            let arr_companies = this.companyData
            let bln_newLetter = true
            const Letter = new Letters()
            let Addressee = Letter.computeLetterAddressee(userInfo, letter_template, requestInfo, bln_newLetter, arr_companies)
            return Addressee
        },
        inlineStyle() {
            return {
                backgroundImage: `url(${this.getCompanyInformation.letterDetail ? this.getCompanyInformation.letterDetail.waterMarkLink : ''})`
            }
        },
        leftSidebarLink() {
            return {
                backgroundImage: `url(${this.getCompanyInformation.letterDetail ? this.getCompanyInformation.letterDetail.leftSideBarLink : ''})`
            }
        },
        rightSidebarLink() {
            return {
                backgroundImage: `url(${this.getCompanyInformation.letterDetail ? this.getCompanyInformation.letterDetail.rightSideBarLink : ''})`
            }
        },
        filterLetterFormats() {
            if (this.configData[0].letterRequest.length > 0 && this.request.letter_type == '') {
                this.request.letter_type = this.configData[0].letterRequest[0].letterDescription.requestType
                this.request.letter_sub_type = this.configData[0].letterRequest[0].letterDescription.requestSubType
            }
            if (this.request.letter_type == 'NOC' && this.request.letter_sub_type == '') this.request.letter_sub_type = 'Travel'
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
        replaceLetterkey() {
            this.request.letter_keys = this.filterLetterFormats.letterKeys
            this.request.user_keys = this.filterLetterFormats.user_keys
            let userInfo = this.getSelectedEmployee[0]
            let letter_template = this.filterLetterFormats
            let requestInfo = this.request
            let arr_companies = this.companyData
            let bln_newLetter = true
            const Letter = new Letters()
            let LetterContent = Letter.computeLetterContent(userInfo, letter_template, requestInfo, bln_newLetter, arr_companies)
            return LetterContent
        },
        computeNewLetterSubject() {
            if (this.request.letter_type == 'Custom Letter Requests') {
                let subject = this.request.letter_fields.other_requests_subject
                return subject
            } else {
                let subject = this.filterLetterFormats.letterDescription.subject
                return subject
            }
        },
        computeCompanyLetterImages() {
            let images = this.getCompanyInformation.letterDetail
            this.obj_company_images_link.companyStampLink = images.companyStampLink
            this.obj_company_images_link.headerImageLink = images.headerImageLink
            this.obj_company_images_link.footerImageLink = images.footerImageLink
            this.obj_company_images_link.signatureLink = images.signatureLink
            this.obj_company_images_link.waterMarkLink = images.waterMarkLink
            this.obj_company_images_link.leftSideBarLink = images.leftSideBarLink
            this.obj_company_images_link.rightSideBarLink = images.rightSideBarLink
            return this.obj_company_images_link
        },
        computeLetterPDFStyles() {
            if (this.filterLetterFormats) {
                let letterFomat = this.filterLetterFormats
                this.obj_letter_preview_styles.leftSidebarCol = letterFomat.leftSidebarCol
                this.obj_letter_preview_styles.bodyCol = letterFomat.bodyCol
                this.obj_letter_preview_styles.rightSidebarCol = letterFomat.rightSidebarCol
                this.obj_letter_pdf_styles.header = letterFomat.headerShow && letterFomat.headerShow.pdf
                this.obj_letter_pdf_styles.date_format = letterFomat.dateFormat
                this.obj_letter_pdf_styles.date_position = letterFomat.formattedText.formatDate
                this.obj_letter_pdf_styles.addressee_position = letterFomat.formattedText.formatHeader
                this.obj_letter_pdf_styles.subject_position = letterFomat.formattedText.formatStyle
                this.obj_letter_pdf_styles.left_sideBar = letterFomat.leftSideBar && letterFomat.leftSideBar.pdf
                this.obj_letter_pdf_styles.right_sideBar = letterFomat.rightSideBar && letterFomat.rightSideBar.pdf
                this.obj_letter_pdf_styles.signature = letterFomat.signatureShow && letterFomat.signatureShow.pdf
                this.obj_letter_pdf_styles.stamp = letterFomat.stampShow && letterFomat.stampShow.pdf
                this.obj_letter_pdf_styles.watermark = letterFomat.watermarkShow.pdf
                this.obj_letter_pdf_styles.footer = letterFomat.footerShow.pdf
                this.obj_letter_pdf_styles.signatory = letterFomat.signatory.pdf
                return this.obj_letter_pdf_styles
            }
        },
        computeLetterPreviewStyles() {
            let letterFomat = this.filterLetterFormats
            this.obj_letter_preview_styles.leftSidebarCol = letterFomat.leftSidebarCol
            this.obj_letter_preview_styles.bodyCol = letterFomat.bodyCol
            this.obj_letter_preview_styles.rightSidebarCol = letterFomat.rightSidebarCol
            this.obj_letter_preview_styles.header = letterFomat.headerShow.preview
            this.obj_letter_preview_styles.date_format = letterFomat.dateFormat
            this.obj_letter_preview_styles.date_position = letterFomat.formattedText.formatDate
            this.obj_letter_preview_styles.addressee_position = letterFomat.formattedText.formatHeader
            this.obj_letter_preview_styles.subject_position = letterFomat.formattedText.formatStyle
            this.obj_letter_preview_styles.left_sideBar = letterFomat.leftSideBar.preview
            this.obj_letter_preview_styles.right_sideBar = letterFomat.rightSideBar.preview
            this.obj_letter_preview_styles.signature = letterFomat.signatureShow.preview
            this.obj_letter_preview_styles.stamp = letterFomat.stampShow.preview
            this.obj_letter_preview_styles.watermark = letterFomat.watermarkShow.preview
            this.obj_letter_preview_styles.footer = letterFomat.footerShow.preview
            this.obj_letter_preview_styles.signatory = letterFomat.signatory.preview
            return this.obj_letter_preview_styles
        },
        computeSigantoryManager() {
            this.obj_signatory = this.getCompanyInformation.letterDetail.manager
            return this.obj_signatory
        },
        // letter req
        fetchRequests() {
            let abc = this.arr_letters
            let req_arr = [];

            for (let i = 0; i < abc.length; i++) {
                let req_Obj = {
                    first_name: {},
                    date_created: {},
                    request_type: {},
                    from_date: {},
                    to_date: {},
                    status: {},
                }
                req_Obj.first_name = this.getUserName(abc[i].user_id)
                req_Obj.date_created = this.dateFormatter(abc[i].date_created)
                req_Obj.from_date = this.dateFormatter(abc[i].from_date)
                req_Obj.to_date = this.dateFormatter(abc[i].to_date)
                req_Obj.request_type = abc[i].request_type
                req_Obj.status = abc[i].status

                req_arr.push(req_Obj);
            }
            return req_arr;
        },
        countryList() {
            const countryCodes = Object.keys(countries.countries);
            const countryNames = countryCodes.map(
                (code) => countries.countries[code].name
            );
            return countryNames;
        },
        getSelectedEmployee() {
            return this.users.filter((a) => a._id == this.selectedEmployeeId)
        },
        getCompanyInformation() {
            let company = this.companyData.filter((a) => a._id == this.user.company_id)
            if (this.selectedEmployeeId != '') {
                company = this.companyData.filter((a) => a._id == this.getSelectedEmployee[0].company_id)
            }
            return company.length > 0 ? company[0] : ''
        },
        getEmployee() {
            let abc = []
            // if(this.isAdminRole =='true'){
            //     abc=this.users.filter(a=>a.user_status != "Inactive" && a._id != this.user._id)
            // }
            // else{
            abc = this.users.filter((a) => a.reporting?.manager == this.user._id && a.user_status != "Inactive" && a._id != this.user._id);
            // }
            return _.orderBy(abc, ['first_name'], ['asc']);;
        },
        visibleData() {
            let users = this.users
            let requests = [];
            // if (this.filterReqByUser == '') {
            requests = _.orderBy(this.filterValue, ['date_created'], ['desc']);
            // } else {
            //     let userFilteredReq = this.filterValue.filter((letter) => letter.user_id == this.filterReqByUser);
            //     requests = _.orderBy(userFilteredReq, ['date_created'], ['desc']);
            // }
            var getUserName = function (val) {
                if (val == null || val == undefined || val == '') {
                    return ''
                }
                else {
                    let abc = users.filter(a => a._id == val)
                    return abc.length > 0 ? abc[0].first_name + ' ' + abc[0].last_name : ''
                }
            }
            // if (this.searchRequests) {
            // 	var s = this.searchRequests;
            // 	let returnData = _.filter(requests, function (value) {
            // 		if(value){
            // 			let b = _.filter(value, function (val) {
            // 				return getUserName(val).toLowerCase().indexOf(s.toLowerCase()) > -1;
            // 			});

            // 			let result = _.filter(b, function (val) {
            // 				return getUserName(val) != null;
            // 			});
            // 			return (
            // 				value.request_type && value.request_type.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // 				value.letter_sub_type && value.letter_sub_type.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // 				value.letter_type && value.letter_type.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // 				value.leave_type && value.leave_type.toLowerCase().indexOf(s.toLowerCase()) > -1 ||
            // 				result.length != 0
            // 			)
            // 		}
            // 	})
            // 	requests = returnData
            // }
            return requests;
        },
        filterValue() {
            return this.arr_letters
            // if (this.selectedFilter == "ALL") {
            //     this.filterReqByUser = ''
            //     return this.arr_letters;
            // }
            // else if(this.selectedFilter == "Leave"){
            //     this.filterReqByUser = ''
            //     return this.arr_letters.filter(a=>a.hasOwnProperty('leave_type'))
            // }else if(this.selectedFilter == "passport"){
            //     this.filterReqByUser = ''
            //     return this.arr_letters.filter(a=>(a.request_type == 'passport safekeep'||a.request_type == 'passport release'))
            // }else{
            //     this.filterReqByUser = ''
            //     let req
            //     req = this.arr_letters.filter(value=>{
            //         return value.request_type == this.selectedFilter
            //     })
            //     return req
            // }

        },
        computedAllReqCountObj() {
            let obj = {
                letterCount: this.letterCount,
                wfhCount: this.wfhCount,
                claimsCount: this.claimsCount,
                leaveCount: this.leaveCount,
                loanCount: this.loanCount,
                educationCount: this.educationCount,
                passportCount: this.passportCount,
                attendanceCount: this.attendanceCount,
                salaryCount: this.salaryCount
            }
            return obj
        },
        computedServiceList() {
            if (this.selectedService == '' || this.selectedService == null || this.selectedService == undefined) {
                return ''
            }
            else {

                return this.selectedService;
            }
        },
        computedTotalReqCount() {
            return this.letterCount + this.wfhCount + this.attendanceCount + this.claimsCount + this.leaveCount + this.loanCount + this.educationCount + this.salaryCount + this.passportCount
        },
        computedRequestUsers() {
            let arr = []
            for (let i = 0; i < this.filterValue.length; i++) {
                arr.push({ _id: this.filterValue[i].user_id, name: this.getUserName(this.filterValue[i].user_id) })
            }
            arr = _.sortBy(arr, 'name')
            arr = arr.map(element => element._id)
            return arr.filter(this.unique)
        },
        computedRequestUsersSliced() {
            return this.requests_users.slice(0, 3)
        }

    },
}
</script>
<style lang="scss">
/* .allRequests .v-text-field__details{
    display: none;
} */
.customA .v-text-field__details {
    display: none !important;
}

.teamRequestSelect .v-input__slot {
    margin-bottom: 0 !important;
}

.customA .v-select__selections {
    padding: 5px 0 !important
}

.customA .v-select__selections .v-select__selection {
    font-size: 15px !important
}

.customA .v-input__append-inner {
    margin-top: 9px !important
}

.customA .v-input__slot {
    min-height: 20px !important;
    margin-bottom: 0 !important;
}

.teamRequestSelect .v-input__slot {
    margin-bottom: 0 !important;
}

.redTextForm {
    .v-text-field__details {
        .v-messages {
            .v-messages__wrapper {
                .v-messages__message {
                    color: #f42121 !important;
                }
            }
        }
    }
}
</style>