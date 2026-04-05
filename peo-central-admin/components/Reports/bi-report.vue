<template>
    <div class="pt-1">
        <v-row class="pt-0 ml-lg-5 ml-1">
            <v-col cols="12" sm="12" md="6" lg="6">
                <v-card class="pa-3 rounded-xl" min-height="800" flat>
                    <v-card-title class="px-0 py-0" style="display: inline;">
                        <v-row>
                            <v-col class="d-flex align-center ml-1">
                                <v-img src="/team/requestsDark.svg" max-width="fit-content" height="fit-content"
                                    class="mr-2" contain></v-img>
                                <span class="darkBlue-heading-text subHeadingFontSize ml-2">Reports</span>
                            </v-col>
                            <v-col>
                                <v-text-field solo flat dense hide-details v-model="searchText"
                                    prepend-inner-icon="mdi-magnify" class="rounded-xl" placeholder="Search by Name or Tags"
                                    style="background: #FFFFFF 0% 0% no-repeat padding-box;box-shadow: 0px 24px 30px #959EA51A;border: 0.5px solid #EFF1F3;border-radius: 18px;opacity: 1;"></v-text-field>
                            </v-col>
                            <!-- <v-col cols="auto" class="pa-0" align-self="center">
                                <v-img style="cursor: pointer" src="/directory/add_plus.svg" max-width="35" height="auto"
                                    @click="addReport = true" class="cursor-pointer" contain></v-img>
                            </v-col> -->
                        </v-row>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-divider class="pt-0 pb-3"></v-divider>
                    <div v-if="skeleton == true">
                        <v-skeleton-loader v-for="n in  5" :key="n" type="article, actions"></v-skeleton-loader>
                    </div>
                    <v-list two-line v-else-if="visiblePages.length > 0" class="scroll mt-n3"
                        style="width:100%;max-height : 700px;">
                        <template v-for="(data, index) in visiblePages">
                            <v-list-item :key="index" style="height: 42px;" justify='center' @click="selectReport(index)">
                                <v-list-item-action class="mr-0">
                                    <v-list-item-action-text class="caption ml-0">
                                        <v-list-item-action-text class="caption mt-0 d-flex">
                                            <v-list-item-avatar size="50" class="">
                                                <v-img src="/reports/book.svg" max-width="fit-content" height="fit-content"
                                                    class="mr-2" contain> </v-img>
                                            </v-list-item-avatar>
                                        </v-list-item-action-text>
                                    </v-list-item-action-text>
                                </v-list-item-action>
                                <v-list-item-content class="py-0 customLineHeight">
                                    <v-list-item-title class="pt-0 font-weight-normal body-1 darkBlue-heading-text">{{
                                        data.name }}&nbsp;
                                    </v-list-item-title>
                                    <h5 class="grey-heading-text caption font-weight-normal pt-1">{{ data.process_type }}
                                    </h5>
                                </v-list-item-content>
                                <v-list-item-action class="py-0" style="align-self: start;margin-top:0;">
                                    <div>
                                    </div>
                                </v-list-item-action>
                                <v-list-item-action class="my-auto ">
                                    <v-list-item-action-text class="caption mt-2 ml-4">
                                        <v-list-item-action-text class="caption mt-0 d-flex">
                                            <div style="min-width:45px" class="darkBlue-heading-text text-right">
                                            </div>
                                            <div style="min-width:45px" class="darkBlue-heading-text pl-3">
                                                <v-card-text class="mb-0 pa-0 font-weight-medium grey-heading-text"
                                                    style="font-size:18px !important">{{ data.createdDate |
                                                        dateToDay }}</v-card-text>
                                                <v-card-text class="mb-0 pa-0 textFontSize grey-heading-text">{{
                                                    data.createdDate |
                                                    dateToMonth }}</v-card-text>
                                            </div>
                                        </v-list-item-action-text>
                                    </v-list-item-action-text>
                                </v-list-item-action>
                            </v-list-item>
                            <v-divider class="my-2" :key="data._id"></v-divider>
                        </template>
                    </v-list>
                </v-card>

                <!-- adding report dialog -->
                <v-dialog persistent v-model="addReport" max-width="600px">
                    <v-form ref="form">
                        <v-card class="rounded-xl pa-0 pt-0" flat min-height="230">
                            <v-row>
                                <v-col cols="12" sm="12" class="pb-2">
                                    <v-card-title class="py-0">
                                        <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content"
                                            class="mr-2" contain></v-img>
                                        <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">Add
                                            Report</span>
                                    </v-card-title>
                                </v-col>
                            </v-row>
                            <v-divider></v-divider>
                            <v-row justify="center" class="px-5 mt-7">
                                <v-col cols="12" class="pb-2 ">
                                    <v-row>
                                        <v-col cols="4">
                                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Creator
                                                Name:</p>
                                        </v-col>
                                        <v-col cols="8">
                                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                                this.user.first_name }} {{ this.user.last_name }}</span>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">
                                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Export
                                                Type:</p>
                                        </v-col>
                                        <v-col cols="8">
                                            <span
                                                class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">xls</span>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">
                                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Report
                                                Name:</p>
                                        </v-col>
                                        <v-col cols="8">
                                            <v-text-field dense placeholder="Report Name"
                                                class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0 py-0"
                                                v-model="report.report_name" :rules="genericRule"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">
                                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Access
                                                Rights:</p>
                                        </v-col>
                                        <v-col cols="8">
                                            <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                                access }}</span>
                                            <!-- <v-autocomplete class="rounded-xl" placeholder="Select Employee" dense flat
                                                multiple :items="adminsList"
                                                :item-text="item => `${item.first_name} ${item.last_name}`" item-value="_id"
                                                v-model="access" :rules="genericRule" @input="handleAutocompleteInput"
                                                outlined style="border-radius: 18px; border-color: #000">
                                            </v-autocomplete> -->
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">
                                            <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">
                                                Description:</p>
                                        </v-col>
                                        <v-col cols="8">
                                            <v-textarea dense placeholder="Description"
                                                class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0 py-0"
                                                v-model="report.report_desc" :rules="genericRule"></v-textarea>
                                        </v-col>
                                    </v-row>
                                    <v-row class="justify-end">
                                        <v-col cols="auto">
                                            <v-btn elevation="0" width="100px" height="31px" color="#0064D7"
                                                @click="toAddReport()" class="white--text border-radius-medium">
                                                Add
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="auto">
                                            <v-btn elevation="'0" width="100px" height="31px" class="border-radius-medium"
                                                @click="addReport = !addReport">Cancel</v-btn>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-form>
                </v-dialog>

            </v-col>
            <v-col cols="12" sm="12" md="12" lg="6">
                <v-card flat class="pa-3 rounded-xl" min-height="800">
                    <v-card-title class="px-0 py-0" style="display: inline;">
                        <v-row style="height: 64px;">
                            <v-col class="d-flex align-center ml-1" style="padding: 11px 12px !important;">
                                <v-img src="/hr/claim.svg" max-width="fit-content" height="20" contain></v-img>
                                <span class="darkBlue-heading-text subHeadingFontSize">Report Details</span>
                            </v-col>
                            <v-col class="d-flex justify-end align-center ml-1" style="padding: 11px 12px !important;">
                                <v-btn elevation="0" width="100px" height="31px" color="#0064D7"
                                    @click="updateReport(selectedReport)" v-if="editReport"
                                    class="white--text border-radius-medium">
                                    Update
                                </v-btn>
                                <v-btn elevation="'0" width="100px" height="31px" class="border-radius-medium"
                                    v-if="editReport" @click="editReport = !editReport">Cancel</v-btn>
                                <v-img src="/shift/edit.svg" @click="editReport = true"
                                    v-if="(selectedReport && Object.keys(selectedReport).length > 0 && !editReport && selectedReport.access_rights.includes(this.user._id)) || selectedReport.access_rights == 'All'"
                                    max-width="fit-content" height="20" class="mr-2 mt-1" contain></v-img>
                                <span class="ml-2"
                                    v-if="(selectedReport && Object.keys(selectedReport).length > 0 && !editReport && selectedReport.access_rights.includes(this.user._id)) || selectedReport.access_rights == 'All'">
                                    <svg id="vuesax_bulk_direct-inbox" data-name="vuesax/bulk/direct-inbox"
                                        xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 24"
                                        @click="checkSelectedReport" class="mt-3">
                                        <g id="direct-inbox">
                                            <path id="Vector"
                                                d="M14.19,0H5.81C2.17,0,0,2.17,0,5.81v6.37C0,15.83,2.17,18,5.81,18h8.37c3.64,0,5.81-2.17,5.81-5.81V5.81C20,2.17,17.83,0,14.19,0Z"
                                                transform="translate(2 4)" fill="#293ff4" opacity="0.4" />
                                            <path id="Vector-2" data-name="Vector"
                                                d="M19.3,0H15.82a2.538,2.538,0,0,0-2.29,1.42l-.84,1.66a1.162,1.162,0,0,1-1.04.65H8.37a1.066,1.066,0,0,1-1.04-.65L6.49,1.43A2.567,2.567,0,0,0,4.2.01H.7a.7.7,0,0,0-.7.7V3.97c0,3.63,2.18,5.8,5.82,5.8H14.2c3.43,0,5.54-1.88,5.8-5.22V.7A.7.7,0,0,0,19.3,0Z"
                                                transform="translate(2 12.23)" fill="#293ff4" />
                                            <path id="Vector-3" data-name="Vector"
                                                d="M5.277,5.22a.754.754,0,0,0-1.06,0l-.72.72V.75A.75.75,0,0,0,2,.75V5.94l-.72-.72A.75.75,0,0,0,.218,6.28l2,2c.01.01.02.01.02.02a.855.855,0,0,0,.22.15.982.982,0,0,0,.29.05.671.671,0,0,0,.28-.06.963.963,0,0,0,.25-.16l2-2A.754.754,0,0,0,5.277,5.22Z"
                                                transform="translate(9.253 1.25)" fill="#293ff4" />
                                            <path id="Vector-4" data-name="Vector" d="M0,0H24V24H0Z" fill="none"
                                                opacity="0" />
                                        </g>
                                    </svg>
                                </span>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-spacer></v-spacer>
                    <!-- report download dialog -->
                    <v-dialog persistent v-model="downloadReport" max-width="750px">
                        <v-card class="rounded-xl pa-0 pt-0" flat min-height="300">
                            <v-row>
                                <v-col cols="12" sm="12" class="pb-2">
                                    <v-card-title class="py-0">
                                        <v-img src="/shift/build.svg" max-width="fit-content" height="fit-content"
                                            class="mr-2" contain></v-img>
                                        <span class="darkBlue-heading-text font-weight-normal subHeadingFontSize">Download
                                            Report</span>
                                    </v-card-title>
                                </v-col>
                            </v-row>
                            <v-divider></v-divider>
                            <v-row justify="center" class="px-5 mt-7">
                                <v-col cols="12" class="pb-2">
                                    <v-card-title class="py-0 ml-3">
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-icon color="blue-grey" dark v-bind="attrs" v-on="on"
                                                    @click="expandFilterForm = !expandFilterForm">
                                                    mdi-account-filter-outline
                                                </v-icon>
                                            </template>
                                            <span>Advance Search</span>
                                        </v-tooltip>
                                        <span
                                            class="darkBlue-heading-text font-weight-normal subHeadingFontSize ml-3">Filter
                                            By:</span>
                                        <v-chip
                                            v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'"
                                            v-show="filterBy.status" @click:close="filterBy.status = ''" small label
                                            outlined close color="primary" class="pa-2 ma-1">Status:
                                            {{ filterBy.status }}</v-chip>
                                        <v-chip v-show="filterBy.company" @click:close="filterBy.company = ''" small label
                                            outlined close color="primary" class="pa-2 ma-1">Company:
                                            {{ getCompanyDetails(filterBy.company) }}</v-chip>
                                        <v-chip v-show="filterBy.department" @click:close="filterBy.department = ''" small
                                            label outlined close color="primary" class="pa-2 ma-1">Department:
                                            {{ filterBy.department }}</v-chip>
                                        <v-chip v-show="filterBy.team" @click:close="filterBy.team = ''" small label
                                            outlined close color="primary" class="pa-2 ma-1">Team:
                                            {{ filterBy.team }}</v-chip>
                                        <v-chip v-show="filterBy.gender" @click:close="filterBy.gender = ''" small label
                                            outlined close color="primary" class="pa-2 ma-1">Gender:
                                            {{ filterBy.gender }}</v-chip>
                                        <v-chip v-show="filterBy.nationality" @click:close="filterBy.nationality = ''" small
                                            label outlined close color="primary" class="pa-2 ma-1">Nationality:
                                            {{ filterBy.nationality }}</v-chip>
                                        <v-chip v-show="filterBy.line_manager" @click:close="filterBy.line_manager = ''"
                                            small label outlined close color="primary" class="pa-2 ma-1">Line Manager:
                                            {{ getManagerDetails(filterBy.line_manager) }}</v-chip>
                                        <v-chip v-show="filterBy.designation" @click:close="filterBy.designation = ''" small
                                            label outlined close color="primary" class="pa-2 ma-1">Designation:
                                            {{ filterBy.designation }}</v-chip>
                                        <v-chip v-show="filterBy.work_location" @click:close="filterBy.work_location = ''"
                                            small label outlined close color="primary" class="pa-2 ma-1">Work Location:
                                            {{ filterBy.work_location }}</v-chip>
                                        <v-chip v-show="filterBy.employment_type"
                                            @click:close="filterBy.employment_type = ''" small label outlined close
                                            color="primary" class="pa-2 ma-1">Employment Type:
                                            {{ filterBy.employment_type }}</v-chip>
                                        <v-chip v-show="filterBy.cost_center" @click:close="filterBy.cost_center = ''" small
                                            label outlined close color="primary" class="pa-2 ma-1">Cost Center: {{
                                                getCostCenterName(filterBy.cost_center) }}</v-chip>
                                        <v-chip v-show="filterBy.doj_filter" @click:close="filterBy.doj_filter = ''" small
                                            label outlined close color="primary" class="pa-2 ma-1">{{ filterSummaryDoj
                                            }}</v-chip>
                                        <v-expand-transition>
                                            <v-card elevation="0" outlined class="my-1 mx-auto px-5 pt-1 rounded-xl"
                                                style="border:solid 1px #0000001f;background-color: transparent;"
                                                v-show="expandFilterForm">
                                                <v-row class="pt-1 pb-2">
                                                    <v-col class="py-2 px-1" lg="12" sm="12" xs="12">
                                                        <p class="mb-0 blue-grey--text">Select Fields: </p>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Status" single-line :items="userStatusList"
                                                            placeholder="Status" dense v-model="filterBy.status"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Company" :items="companyData"
                                                            :item-text="item => `${item.company_name}`" item-value="_id"
                                                            dense v-model="filterBy.company"
                                                            placeholder="Company"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12">
                                                        <v-select @input="checkSelectedReport()" hide-details="false"
                                                            label="Department" :items="fetchUniqueDepartments"
                                                            item-text="name" item-value="name" placeholder="Department"
                                                            dense v-model="filterBy.department"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Team" :items="fetchTeams" item-text="name"
                                                            item-value="name" placeholder="Team" dense
                                                            v-model="filterBy.team"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Gender" :items="genderList" item-text="name"
                                                            item-value="name" placeholder="Gender" dense
                                                            v-model="filterBy.gender"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Nationality" :items="countryList" dense
                                                            v-model="filterBy.nationality"
                                                            placeholder="Nationality"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Line Manager" :items="managersList"
                                                            :item-text="item => `${item.first_name} ${item.last_name}`"
                                                            item-value="_id" placeholder="Line Manager" dense
                                                            v-model="filterBy.line_manager"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Designation" :items="configuration[0].designations"
                                                            placeholder="Designation" dense
                                                            v-model="filterBy.designation"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Work Location" :items="workLocationList" item-text="name"
                                                            item-value="name" placeholder="Work Location" dense
                                                            v-model="filterBy.work_location"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Employment Type" :items="employment_types"
                                                            item-text="name" item-value="name" placeholder="Employment Type"
                                                            dense v-model="filterBy.employment_type"></v-select>
                                                    </v-col>
                                                    <!-- Advance Filter | Employee Information -->
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="6" xs="12"
                                                        v-if="selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select @input="checkSelectedReport()" hide-details="true"
                                                            label="Cost Center" :items="fetchCostcenters"
                                                            :item-text="item => `${item.name}`" item-value="id"
                                                            placeholder="Select Cost Center" dense
                                                            v-model="filterBy.cost_center"
                                                            class="text-capitalize"></v-select>
                                                    </v-col>
                                                    <!-- Advance Filter | Date of Joining -->
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="4" xs="12"
                                                        v-if="selectedReport.name != 'New Joiner Report' && selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-select hide-details="true" label="DOJ" :items="doj_filters"
                                                            item-text="name" item-value="name" placeholder="DOJ" dense
                                                            v-model="filterBy.doj_filter"></v-select>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="4" xs="12"
                                                        v-if="selectedReport.name != 'New Joiner Report' && selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-menu v-model="date_doj" :close-on-content-click="false"
                                                            :nudge-right="40" transition="scale-transition" offset-y
                                                            min-width="290px">
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-text-field hide-details="true" label="From"
                                                                    placeholder="From" dense v-model="filterBy.doj_from"
                                                                    v-bind="attrs" v-on="on"
                                                                    :disabled="!disableDateJoinedFields"
                                                                    append-icon="mdi-calendar"></v-text-field>
                                                            </template>
                                                            <v-date-picker v-model="filterBy.doj_from"
                                                                @input="date_doj = false, checkSelectedReport()" no-title
                                                                :max="filterBy.doj_filter != 'Between' ? dateNow : filterBy.doj_to"
                                                                scrollable></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                    <v-col class="py-2 px-1" cols="12" lg="4" sm="4" xs="12"
                                                        v-if="selectedReport.name != 'New Joiner Report' && selectedReport.name != 'Approved & Rejected Requests Report (Department-wise)' && selectedReport.name != 'Pending Requests Report (Department-wise)'">
                                                        <v-menu v-model="date_doj_to" :close-on-content-click="false"
                                                            :nudge-right="40" transition="scale-transition" offset-y
                                                            min-width="290px">
                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-text-field hide-details="true" label="To"
                                                                    placeholder="To" dense v-model="filterBy.doj_to"
                                                                    v-bind="attrs" v-on="on" append-icon="mdi-calendar"
                                                                    :disabled="filterBy.doj_filter != 'Between'"></v-text-field>
                                                            </template>
                                                            <v-date-picker v-model="filterBy.doj_to"
                                                                @input="date_doj_to = false, checkSelectedReport()" no-title
                                                                :min="filterBy.doj_from" :max="dateNow"
                                                                scrollable></v-date-picker>
                                                        </v-menu>
                                                    </v-col>
                                                </v-row>
                                            </v-card>
                                        </v-expand-transition>
                                    </v-card-title>
                                </v-col>
                                <v-col cols="12" class="pb-2" v-if="selectedReport.name != 'Employee Information Report'">
                                    <v-card-title class="py-0">
                                        <v-row class="">
                                            <v-col cols="3" style="max-width: 19% !important;">
                                                <span
                                                    class="darkBlue-heading-text font-weight-normal subHeadingFontSize mt-3">Date
                                                    Range:</span>
                                            </v-col>
                                            <v-col cols="5" style="max-width: 30% !important;" class="pa-0">
                                                <v-select :items="taskFilters" placeholder="Select Date Range"
                                                    v-model="selectedFilterDate" item-text="name" item-value="value" dense
                                                    outlined class="customMdiMenuDown rounded-xl  textFieldDetailsCuttom"
                                                    style="max-width: 100%; margin-top: 13px;"
                                                    @input="fetchDataForExcelDownload()"></v-select>
                                            </v-col>
                                            <v-col cols="6" v-if="selectedFilterDate == 'Custom Date'">
                                                <v-menu ref="menu_calendar_button2" v-model="menu_calendar_button2"
                                                    :close-on-content-click="false"
                                                    :return-value.sync="date_calendar_download"
                                                    transition="scale-transition" min-width="auto">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field attach solo flat dense readonly hide-details
                                                            label="Date range" class="rounded-xl text-field__small"
                                                            v-model="dateRangeTextExcel"
                                                            prepend-inner-icon="mdi-calendar-outline" v-bind="attrs"
                                                            v-on="on"
                                                            style="background: #FFFFFF 0% 0% no-repeat padding-box; box-shadow: 0px 24px 30px #959EA51A;border: 0.5px solid #000;border-radius: 18px;opacity: 1;max-width:250px">
                                                        </v-text-field>
                                                    </template>
                                                    <v-date-picker range v-model="date_calendar_download" no-title
                                                        scrollable :min="date_calendar_download[0]">
                                                        <v-btn text color="red"
                                                            @click="resetCalendarFilterDateDownload">Clear</v-btn>
                                                        <v-spacer></v-spacer>
                                                        <v-btn text color="grey"
                                                            @click="menu_calendar_button2 = false">Cancel</v-btn>
                                                        <v-btn text color="primary"
                                                            @click="$refs.menu_calendar_button2.save(date_calendar_download), fetchDataForExcelDownload()">OK</v-btn>
                                                    </v-date-picker>
                                                </v-menu>
                                            </v-col>
                                        </v-row>
                                    </v-card-title>
                                </v-col>
                                <v-col cols="12" class="mt-5" style="text-align: end;">
                                    <v-row justify="end">
                                        <v-btn outlined elevation="0"
                                            @click="date_calendar_download = [], selectedFilterDate = '', downloadReport = false, excel_downloaded_data = []"
                                            class="border-radius-medium fontWeight300 fontSize7 mx-2"
                                            style="min-width:105px; color:#0059ff;height: 35px;text-align: center;text-transform: unset !important;">
                                            Cancel
                                        </v-btn>
                                        <download-excel :data="getInfoForDownload"
                                            :name="`${selectedReport.name} (${from_date_excel} - ${to_date_excel})`"
                                            :fields='getFields()'>
                                            <v-btn outlined elevation="0"
                                                :disabled="excelLoading || excel_downloaded_data.length == 0"
                                                class="border-radius-medium fontWeight300 fontSize7 mx-2"
                                                @click="clearField"
                                                style="min-width:105px; color:#0059ff;height: 35px;text-align: center;text-transform: unset !important;">
                                                {{ excelLoading ? 'Loading...'
                                                    : excel_downloaded_data.length == 0
                                                        ? 'No data available to download'
                                                        : 'Download Report' }}
                                            </v-btn>
                                        </download-excel>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-dialog>
                    <v-divider class="pt-0"></v-divider>
                    <div v-if="skeleton">
                        <v-skeleton-loader type="table-heading, list-item-two-line, image, table-tfoot"></v-skeleton-loader>
                    </div>
                    <v-row class="pa-4" v-else>
                        <v-col cols="12" sm="12" md="10" lg="10" class="py-0 px-3">
                            <v-row>
                                <v-col cols="4">
                                    <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Creator Name</p>
                                </v-col>
                                <v-col cols="8">
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                        selectedReport.createdBy }}</span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4">
                                    <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Date Created</p>
                                </v-col>
                                <v-col cols="8">
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                        formatedDate(selectedReport.createdDate) }}</span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4">
                                    <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Export Type</p>
                                </v-col>
                                <v-col cols="8" v-if="selectedReport && Object.keys(selectedReport).length > 0">
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">xls</span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4">
                                    <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Report Name</p>
                                </v-col>
                                <v-col cols="8" v-if="!editReport">
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                        selectedReport.name }}</span>
                                </v-col>
                                <v-col cols="8" v-else>
                                    <v-text-field dense placeholder="Report Name"
                                        class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0 py-0"
                                        v-model="selectedReport.name" :rules="genericRule"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4">
                                    <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Access Rights</p>
                                </v-col>
                                <v-col cols="8" v-if="editReport == false">
                                    <span v-if="selectedReport && Object.keys(selectedReport).length > 0"
                                        class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">
                                        <div style="display: flex;">
                                            <template v-if="selectedReport.access_rights.includes('All')">
                                                <span>All</span>
                                            </template>
                                            <template v-for="(img_id, ind) in selectedReport.access_rights" v-else>
                                                <span :key="img_id">
                                                    <v-tooltip top color="primary">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-avatar v-bind="attrs" v-on="on" size="33"
                                                                style="border: 1px solid black;">
                                                                <v-img aspect-ratio="1" :src="getImage(img_id)"></v-img>
                                                            </v-avatar>
                                                        </template>
                                                        {{ services_general.getUserName(img_id, users) }}
                                                    </v-tooltip>
                                                </span>
                                            </template>
                                        </div>
                                    </span>
                                </v-col>
                                <v-col cols="8" v-if="editReport == true">
                                    <v-autocomplete class="rounded-xl" placeholder="Select Employee" dense flat multiple
                                        :items="adminsList" :item-text="item => `${item.first_name} ${item.last_name}`"
                                        item-value="_id" v-model="selectedReport.access_rights" :rules="genericRule"
                                        @input="handleAutocompleteInput" outlined
                                        style="border-radius: 18px; border-color: #000">
                                    </v-autocomplete>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4">
                                    <p class="grey-heading-text font-weight-medium textFontSize pa-0 ma-0">Description</p>
                                </v-col>
                                <v-col cols="8" v-if="!editReport">
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0">{{
                                        selectedReport.desc }}</span>
                                </v-col>
                                <v-col cols="8" v-else>
                                    <v-textarea dense placeholder="Description"
                                        class="darkBlue-heading-text font-weight-normal textFontSize pa-0 ma-0 py-0"
                                        v-model="selectedReport.desc" :rules="genericRule"></v-textarea>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>

        <!-- snackbar -->
        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}

            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
            </template>
        </v-snackbar>

    </div>
</template>
<script>
import general from "~/plugins/general";
import countries from "countries-list";
import moment from 'moment'
export default {
    props: ['users', 'user', 'configuration'],
    components: { countries },
    data() {
        return {
            roles: [],
            attTotal: 0,
            otTotal: 0,
            lateEntries: [],
            earlyEntries: [],
            services_general: general,
            isAdminAllChecked: false,
            from_date_excel: '',
            to_date_excel: '',
            excel_downloaded_data: [],
            date_lwd: false,
            date_lwd_to: false,
            date_doj: false,
            date_doj_to: false,
            dateNow: new Date().toISOString().substr(0, 10),
            taskFilters: ['Current Month', 'Custom Date', 'Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'Last 1 Year', 'YTD'],
            selectedFilterDate: '',
            doj_filters: ['On', 'Before', 'After', 'Between'],
            employment_types: ['Contract Position', 'Full Time Position', 'Temporary Position'],
            workLocationList: ['Marina Plaza, Dubai', 'Sky Tower, Abu Dhabi', 'Jafza, Jebel Ali', 'Dubai Investments Park'],
            genderList: ['Male', "Female", 'Not Disclosed'],
            companyData: [],
            userStatusList: ['Active', 'Hold', 'Inactive'],
            filterBy: {
                status: 'Active',
                company: '',
                department: '',
                team: '',
                gender: '',
                nationality: '',
                line_manager: '',
                designation: '',
                work_location: '',
                employment_type: '',
                cost_center: '',
                doj_filter: '',
                doj_from: '',
                doj_to: '',
            },
            expandFilterForm: false,
            snack: false,
            snackColor: "",
            snackText: "",
            addReport: false,
            excelLoading: false,
            date_calendar_download: [],
            menu_calendar_button2: false,
            downloadReport: false,
            genericRule: [
                v => !!v || 'This field is Required'
            ],
            editReport: false,
            selectedMonth: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)),
            skeleton: true,
            searchText: '',
            report: {},
            selectedReport: {},
            access: '',
            reports: [
            ],

            companies: [],

            bankDetailsReport: [],
            leaverReport: [],
            newOfferReport: [],
            newJoinerReport: [],
            additionReport: [],
            deductionReport: [],


            offboardings: [],
            onboardings: [],
            json_fields_absence: {
                //Absence Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Absent Date': "absent_date",
                'Clock In Time': "clock_in",
                'Clock Out Time': "clock_out",
                'Work Schedule': "work_schedule",
                'Gender': "gender",
                'Nationality': "nationality",
                'Department': "dept",
                'Designation': "designation",
                'Team': "team",
                'Line Manager': "line_manager",
                'Company': "company",
                'Cost Center': "cost_center",
                'Employment Type': "employment_type",
                'Contract Type': "contract_type",
            },
            json_fields_approve_request_dept: {
                //Approved & Rejected Requests Report (Department-wise)
                'Company Name': "company_name",
                'Department': "department",
                'Request Type': "request_type",
                'Request Status': "request_status",
                'Total Count': "total_count",
            },
            json_fields_approve_request_emp: {
                //Approved & Rejected Requests Report (Employee-wise)
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                'Designation': "designation",
                'Department': "dept",
                'Company': "company",
                'Cost Center': "cost_center",
                'Line Manager': "line_manager",
                'Request Type': "req_type",
                'Requested Date': "req_date",
                'Request Status': "req_status",
                'Approver 1 (Name & Status)': "app_1",
                'Approver 2 (Name & Status)': "app_2",
                'Approver 3 (Name & Status)': "app_3",
                'Approver 4 (Name & Status)': "app_4",
            },
            json_fields_attendance: {
                //Attendance Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Designation': "designation",
                'Department': "department",
                'Work Schedule': "work_schedule",
                'On Duty': 'on_duty',
                'Off Duty': "off_duty",
                'Duty Hours': "duty_hours",
                'Clock In Date': "clock_in_date",
                'Clock In Day': "clock_in_day",
                'Clock In Location': "clock_in_loc",
                'Clock In Time': "clock_in_time",
                'LATE': "late",
                'Clock Out Date': "clock_out_date",
                'Clock Out Day': "clock_out_day",
                'Clock Out Location': "clock_out_loc",
                'Clock Out Time': "clock_out_time",
                'Early': "early",
                'Total Hours': "total_hours",
                'OT Hours': "ot_hours",
                'Attendance Type': "att_type",
                'Remarks': "remarks",
                'Required': "required",
                'Total Present': "total_present",
                'Total Weekend': "total_weekend",
                'Total Absent': "total_absent",
                'Total Medical Leave': "total_sick_leave",
                'Total Annual Leave': "total_annual_leave",
                'Total Other Leave': "total_other_leave",
                'Total Leave Days': "total_leave_days",
            },
            json_fields_claims: {
                //Claims Reimbursement Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Gender': "gender",
                'Nationality': "nationality",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                'Designation': "designation",
                'Department': "dept",
                'Company': "company",
                'Cost Center': "cost_center",
                'Line Manager': "line_manager",
                'Claim Type': "claim_type",
                'Amount': "amount",
                'Status': "status",
                'Claim Date': "claim_date",
                'Closed Date': "closed_date",
                'Approver 1 (Name & Status)': "app_1",
                'Approver 2 (Name & Status)': "app_2",
                'Approver 3 (Name & Status)': "app_3",
                'Approver 4 (Name & Status)': "app_4",
            },
            json_fields_emp_inf_rep: {
                //Employee Information Report
                'Employee ID': "emp_id",
                'First Name': "first_name",
                'Middle Name': "middle_name",
                'Last Name': "last_name",
                'Nick Name': "nick_name",
                'Gender': "gender",
                'Marital Status': "marital_status",
                'Nationality': "nationality",
                'Religion': "religion",
                'DOB': "dob",
                'Phone': "personal_phone",
                'Personal Mobile Number': "personal_mobile",
                'WHATSAPP': "whatsapp",
                'Personal WHATSAPP': "personal_whatsapp",
                'EXT': "ext",
                'Speed Dial': "speed_dial",
                'Email': "email",
                'Personal Email': "personal_email",
                'Role Type': "role_type",
                'Employee Type': "employee_type",
                'Address': "address",
                'Allergies': "allergies",
                'User Status': "user_status",
                'DOJ': "date_of_joining",
                'Designation': "designation",
                'Department': "dept",
                'Team': "team",
                'Company': "company",
                'Manager Name': "line_manager",
                'Employment Type': "employment_type",
                'Contract Type': "contract_type",
                'Work Schedule': "work_schedule",
                'Work Location': "work_location",
                'Probation Days': "prob_days",
                'Termination Data': "termination_data",
                'Probation End Date': "probation_end_date",
                'Cost Center': "cost_center",
                'Speciality': "speciality",
                'Skills': "skills",
                'Primary Emergency Contact Person Name': "primary_contact_name",
                'Primary Emergency Contact Person Relationship': "primary_contact_rel",
                'Primary Emergency Contact Person Number': "primary_contact_num",
                'Primary Emergency Contact Person Country': "primary_contact_country",
                'Secondary Emergency Contact Person Name': "secondary_contact_name",
                'Secondary Emergency Contact Person Relationship': "secondary_contact_rel",
                'Secondary Emergency Contact Person Number': "secondary_contact_num",
                'Secondary Emergency Contact Person Country': "secondary_contact_country",
                'Passport Number': "passport_number",
                'Passport Expiration Date': "passport_expiration",
                'Emirates ID': "emirates_number",
                'Emirates ID Expiration Date': "emirates_expiration",
                'Insurance': "insurance_number",
                'Insurance Expiry Date': "insurance_expiration",
                'Labour Card': "labour_number",
                'Labour Card Expiry Date': "labour_expiration",
                'Visa Number': "visa_number",
                'Visa Expiration Date': "visa_expiration",
                'Visa Sponsor': "visa_sponsor",
                'Visa UID': "visa_uid",
                'Covid Status': "covid_status",
                'Not Vaccinated Reason': "not_vacc_reason",
                'Sponsored Dependent': "sponsored_dep",
                'Signed Asset Form': "sign_asset",
                'Medical Leaves': "medical_leave",
                'Annual Leaves': "annual_leave",
                'Unpaid Leaves': "unpaid_leave",
                'Compassionate Leaves': "compassionate_leave",
                'Study Leaves': "study_leave",
                'Maternity Leaves': "maternity_leave",
                'Hajj Leaves': "hajj_leave",
                'Parental Leaves': "parental_leave",
            },
            json_fields_emp_letters_rep: {
                //Employee Letters Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Gender': "gender",
                'Nationality': "nationality",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                'Designation': "designation",
                'Department': "dept",
                'Company': "company",
                'Cost Center': "cost_center",
                'Line Manager': "line_manager",
                'Letter Type': "letter_type",
                'Letter Sub-Type': "letter_sub_type",
                'Status': "letter_status",
                'Requested Date': "req_date",
                'Closed Date': "closed_date",
                'Approver 1 (Name & Status)': "app_1",
                'Approver 2 (Name & Status)': "app_2",
                'Approver 3 (Name & Status)': "app_3",
                'Approver 4 (Name & Status)': "app_4",
            },
            json_fields_leave: {
                //Leave Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Gender': "gender",
                'Nationality': "nationality",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                'Designation': "designation",
                'Department': "dept",
                'Company': "company",
                'Cost Center': "cost_center",
                'Line Manager': "line_manager",
                'Leave Type': "leave_type",
                'Status': "status",
                'Requested Date': "req_date",
                'From Date': "from_date",
                'To Date': "to_date",
                'No. of Days': "no_days",
                'Closed Date': "closed_date",
                'Approver 1 (Name & Status)': "app_1",
                'Approver 2 (Name & Status)': "app_2",
                'Approver 3 (Name & Status)': "app_3",
                'Approver 4 (Name & Status)': "app_4",
            },
            json_fields_leaver: {
                //Leaver Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Gender': "gender",
                'Nationality': "nationality",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                'Last Working Day': 'last_work_day',
                'Exit Type': 'exit_type',
                'Department': "dept",
                'Designation': "designation",
                'Team': "team",
                'Company': "company",
                'Cost Center': "cost_center",
                'Employment Type': "employment_type",
                'Contract Type': "contract_type",
                'Line Manager': "line_manager",
            },
            json_fields_new_joiner: {
                // New Joiner Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Gender': "gender",
                'Nationality': "nationality",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                'Department': "dept",
                'Designation': "designation",
                'Team': "team",
                'Company': "company",
                'Cost Center': "cost_center",
                'Employment Type': "employment_type",
                'Contract Type': "contract_type",
                'Line Manager': "line_manager",
            },
            json_fields_vol_inv_leave_rep: {
                // Voluntary & Involuntary Leave Report
                'Company Name': "company_name",
                'Department': "department",
                'Voluntary Leaves': "voluntary_leaves",
                'Involuntary Leaves': "involuntary_leaves",
                'Total': "total",
            },
            json_fields_overtime: {
                // Overtime Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Overtime Date': "ot_date",
                'Clock In': 'ot_start_time',
                'Clock Out': "ot_end_time",
                'Overtime Hours': "ot_hours",
                'Gender': "gender",
                'Nationality': "nationality",
                'Department': "dept",
                'Designation': "designation",
                'Team': "team",
                'Line Manager': "line_manager",
                'Company': "company",
                'Cost Center': "cost_center",
                'Employment Type': "employment_type",
                'Contract Type': "contract_type",
            },
            json_fields_req_dept: {
                // Pending Requests Report (Department-wise)
                'Company Name': "company_name",
                'Department': "department",
                'Request Type': "request_type",
                'Total Count': "total_count",
            },
            json_fields_req_emp: {
                // Pending Requests Report (Employee-wise)
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                'Designation': "designation",
                'Department': "dept",
                'Company': "company",
                'Cost Center': "cost_center",
                'Line Manager': "line_manager",
                'Request Type': "req_type",
                'Requested Date': "req_date",
                'Approver 1 (Name & Status)': "app_1",
                'Approver 2 (Name & Status)': "app_2",
                'Approver 3 (Name & Status)': "app_3",
                'Approver 4 (Name & Status)': "app_4",
            },
            json_fields_salary_adjustment: {
                // Salary Adjustments Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Gender': "gender",
                'Nationality': "nationality",
                'DOJ': "date_of_joining",
                'Designation': "designation",
                'Department': "dept",
                'Company': "company",
                'Cost Center': "cost_center",
                'Effective Date': "effec_date",
                'Type': "type",
                'Created By': "created_by",
                'Status': "status",
                'Approvers': "approvers",
                'Total Salary - Before Adjustment': "old_salary",
                'Total Salary - After Adjustment': "new_salary",
                'Total Salary - Difference': "diff_salary",
                'Salary Proration (Y/N)': "proration",
                'Salary Arrears (Y/N)': "arrears",
            },
            json_fields_wfh: {
                // WFH Report
                'Employee ID': "emp_id",
                'Employee Name': "full_name",
                'Gender': "gender",
                'Nationality': "nationality",
                'DOJ': "date_of_joining",
                'Probation End Date': 'prob_end',
                // 'Department': "dept",
                'Designation': "designation",
                'Team': "team",
                'Company': "company",
                'Cost Center': "cost_center",
                'Line Manager': "line_manager",
                'Status': "status",
                'Requested Date': "req_date",
                'From Date': "from_date",
                'To Date': "to_date",
                'No. of Days': "no_days",
                'Closed Date': "closed_date",
                'Approver 1 (Name & Status)': "app_1",
                'Approver 2 (Name & Status)': "app_2",
                'Approver 3 (Name & Status)': "app_3",
                'Approver 4 (Name & Status)': "app_4",
            },
        }
    },
    async mounted() {
        await this.getRoles()
        await this.getAllReport()
        await this.getAllCompany()
        this.skeleton = false
    },
    methods: {
        async getRoles() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            this.roles = await this.$axios.$post("roles/filterkeys", { headers: { Authorization: AuthStr } })
        },
        getRoleName(val) {
            let role = this.roles.filter(a => a._id == val)
            return role.length > 0 ? role[0].role_name : ''
        },
        checkSelectedReport() {
            if (this.selectedReport.name == 'Employee Information Report') {
                this.selectedFilterDate = 'e'
                this.fetchDataForExcelDownload()
            }
            this.downloadReport = true
        },
        clearField() {
            setTimeout(() => {
                this.selectedFilterDate = '';
                this.filterBy = {
                    status: 'Active',
                    company: '',
                    department: '',
                    team: '',
                    gender: '',
                    nationality: '',
                    line_manager: '',
                    designation: '',
                    work_location: '',
                    employment_type: '',
                    cost_center: '',
                    doj_filter: '',
                    doj_from: '',
                    doj_to: '',
                };
                this.excel_downloaded_data = []
            }, 1000);
            this.downloadReport = false
        },
        getImage(val) {
            let image = "https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png";
            if (this.users.length > 0) {
                let abc = this.users.filter((a) => a._id == val);
                if (abc.length > 0) {
                    if (abc[0].hasOwnProperty("image_url")) {
                        if (abc[0].image_url != "") image = abc[0].image_url;
                    }
                }
            }
            return image;
        },
        handleAutocompleteInput(value) {
            if (value.includes('All')) {
                this.isAdminAllChecked = true;
                const adminIDs = this.adminsList.filter((item) => item._id !== 'All').map((item) => item._id);
                this.selectedReport.access_rights = ['All', ...adminIDs];
            } else if (this.isAdminAllChecked) {
                this.isAdminAllChecked = false;
                this.selectedReport.access_rights = [];
            } else {
                this.selectedReport.access_rights = value;
            }
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
        formatDate(date) {
            if (!date) return null
            date = date.substr(0, 10)
            return moment(String(date)).format('DD MMM YYYY')
        },
        convertTo12HourFormat(time24hr) {
            return moment(String(time24hr)).format('h:mm A')
        },
        getFields() {
            if (this.selectedReport.name == 'Absence Report') {
                return this.json_fields_absence
            } else if (this.selectedReport.name == 'Approved & Rejected Requests Report (Department-wise)') {
                return this.json_fields_approve_request_dept
            } else if (this.selectedReport.name == 'Approved & Rejected Requests Report (Employee-wise)') {
                return this.json_fields_approve_request_emp
            } else if (this.selectedReport.name == 'Attendance Report') {
                return this.json_fields_attendance
            } else if (this.selectedReport.name == 'Claims Reimbursement Report') {
                return this.json_fields_claims
            } else if (this.selectedReport.name == 'Employee Information Report') {
                return this.json_fields_emp_inf_rep
            } else if (this.selectedReport.name == 'Employee Letters Report') {
                return this.json_fields_emp_letters_rep
            } else if (this.selectedReport.name == 'Leave Report') {
                return this.json_fields_leave
            } else if (this.selectedReport.name == 'Leaver Report') {
                return this.json_fields_leaver
            } else if (this.selectedReport.name == 'New Joiner Report') {
                return this.json_fields_new_joiner
            } else if (this.selectedReport.name == 'Voluntary & Involuntary Leave Report') {
                return this.json_fields_vol_inv_leave_rep
            } else if (this.selectedReport.name == 'Overtime Report') {
                return this.json_fields_overtime
            } else if (this.selectedReport.name == 'Pending Requests Report (Department-wise)') {
                return this.json_fields_req_dept
            } else if (this.selectedReport.name == 'Pending Requests Report (Employee-wise)') {
                return this.json_fields_req_emp
            } else if (this.selectedReport.name == 'Salary Adjustments Report') {
                return this.json_fields_salary_adjustment
            } else if (this.selectedReport.name == 'WFH Report') {
                return this.json_fields_wfh
            }
        },
        getYTDRanges() {
            const today = new Date();
            const year = today.getFullYear();

            const fromDate = this.toBeFormatDate(new Date(year, 0, 1));

            const toDate = this.toBeFormatDate(today);

            return { fromDate, toDate };
        },
        getLastOneYearRange() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const firstDayOfLastYear = new Date(year - 1, month, 1);
            const fromDate = this.toBeFormatDate(firstDayOfLastYear);

            const lastDayOfLastYear = new Date(year - 1, 12, 0);
            const toDate = this.toBeFormatDate(lastDayOfLastYear);

            return { fromDate, toDate };
        },
        getLastSixMonthsRange() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const firstDayOfSixthLastMonth = new Date(year, month - 6, 1);
            const fromDate = this.toBeFormatDate(firstDayOfSixthLastMonth);

            const lastDayOfLastMonth = new Date(year, month, 0);
            const toDate = this.toBeFormatDate(lastDayOfLastMonth);

            return { fromDate, toDate };
        },
        getLastThreeMonthsRange() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const firstDayOfThirdLastMonth = new Date(year, month - 3, 1);
            const fromDate = this.toBeFormatDate(firstDayOfThirdLastMonth);

            const lastDayOfLastMonth = new Date(year, month, 0);
            const toDate = this.toBeFormatDate(lastDayOfLastMonth);

            return { fromDate, toDate };
        },
        getLastMonthRange() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();

            const firstDayOfLastMonth = new Date(year, month - 1, 1);
            const fromDate = this.toBeFormatDate(firstDayOfLastMonth);

            const lastDayOfLastMonth = new Date(year, month, 0);
            const toDate = this.toBeFormatDate(lastDayOfLastMonth);

            return { fromDate, toDate }
        },
        getCurrentMonthRange() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);
            const fromDate = this.toBeFormatDate(firstDayOfMonth);

            const lastDayOfMonth = new Date(year, month + 1, 0);
            const toDate = this.toBeFormatDate(lastDayOfMonth);

            return { fromDate, toDate };
        },
        toBeFormatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        getUsersInfoForExcel(val) {
            let user = this.users.filter(a => a._id == val)
            return user.length > 0 ? user[0] : []
        },
        async fetchDataForExcelDownload() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            this.excelLoading = true
            let from_date = ''
            let to_date = ''

            if (this.selectedFilterDate == 'Custom Date') {
                if (this.date_calendar_download.length == 1) {
                    from_date = this.date_calendar_download[0]
                    to_date = this.date_calendar_download[0]
                } else if (this.date_calendar_download.length > 1) {
                    let dates = _.orderBy(this.date_calendar_download)
                    from_date = dates[0]
                    to_date = dates[1]
                }
            } else if (this.selectedFilterDate == 'Current Month') {
                let { fromDate, toDate } = this.getCurrentMonthRange();
                from_date = fromDate
                to_date = toDate
            } else if (this.selectedFilterDate == 'Last 1 Month') {
                let { fromDate, toDate } = this.getLastMonthRange();
                from_date = fromDate
                to_date = toDate
            } else if (this.selectedFilterDate == 'Last 3 Months') {
                let { fromDate, toDate } = this.getLastThreeMonthsRange();
                from_date = fromDate
                to_date = toDate
            } else if (this.selectedFilterDate == 'Last 6 Months') {
                let { fromDate, toDate } = this.getLastSixMonthsRange();
                from_date = fromDate
                to_date = toDate
            } else if (this.selectedFilterDate == 'Last 1 Year') {
                let { fromDate, toDate } = this.getLastOneYearRange();
                from_date = fromDate
                to_date = toDate
            } else if (this.selectedFilterDate == 'YTD') {
                let { fromDate, toDate } = this.getYTDRanges();
                from_date = fromDate
                to_date = toDate
            }
            this.from_date_excel = from_date
            this.to_date_excel = to_date

            let body = {
                "type": this.selectedReport.name,
                "filter": {
                    user_status: this.filterBy.status,
                    company: this.filterBy.company,
                    department: this.filterBy.department,
                    team: this.filterBy.team,
                    gender: this.filterBy.gender,
                    nationality: this.filterBy.nationality,
                    line_manager: this.filterBy.line_manager,
                    designation: this.filterBy.designation,
                    work_location: this.filterBy.work_location,
                    employment_type: this.filterBy.employment_type,
                    cost_center: this.filterBy.cost_center,
                },
                "date_range": [from_date, to_date]
            }
            try {
                let data = await this.$axios.$post('/reports/get-filtered-report', body, { headers: { Authorization: AuthStr } })
                if (data.data && data.data.length > 0) {
                    this.excel_downloaded_data = data.data
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
        getCostCenterName(val) {
            if (this.fetchCostcenters) {
                let cost_centers = this.fetchCostcenters.filter((a) => a.id == val);
                return cost_centers.length > 0 ? cost_centers[0].name : "";
            }
        },
        getCompanyDetails(val) {
            if (val) {
                let abc = this.companyData.filter(a => a._id == val)
                return abc.length > 0 ? abc[0].company_name : ''
            }
            else {
                return ''
            }
        },
        async updateReport(data) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token)

            let selectedReport = data
            if (selectedReport) {
                let arr_report = []
                arr_report.push(selectedReport)

                await this.$axios.$put('/bi_report/update-report/' + selectedReport._id, arr_report, { headers: { Authorization: AuthStr } })
                    .then(async res => {
                        this.snack = true;
                        this.snackText = 'Report updated successfully';
                        this.snackColor = "green";
                        this.editReport = false
                        await this.getAllReport()
                    }).catch();
            }
        },
        formatedDate(dateString) {
            if (!dateString) { return '' }
            const dateObj = new Date(dateString);
            if (isNaN(dateObj.getTime())) { return '' }
            return dateObj.toISOString().split('T')[0];
        },
        async getAllReport() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            await this.$axios.$get("/bi_report/all", { headers: { Authorization: AuthStr } })
                .then(res => {
                    this.reports = res.map(elem => (
                        {
                            createdBy: elem.creator_name,
                            user_id: elem.user_id,
                            export_type: elem.export_type,
                            name: elem.report_name,
                            access_rights: elem.access_rights,
                            desc: elem.description,
                            createdDate: elem.dateCreated,
                            id: elem._id,
                        }
                    ))
                })
                .catch()
        },
        async getAllCompany() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            await this.$axios.$get("/companies/all", { headers: { Authorization: AuthStr } }).then(res => {
                this.companyData = res
            })
        },
        async toAddReport() {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            if (this.$refs.form.validate()) {
                let fullName = this.user.first_name + ' ' + this.user.last_name
                let body = {
                    creator_name: fullName,
                    user_id: this.user._id,
                    export_type: 'xls',
                    report_name: this.report.report_name,
                    access_rights: this.access,
                    description: this.report.report_desc,
                    date_created: new Date(),
                };

                let add_report = await this.$axios.$post("/bi_report/add_report", body, {
                    headers: { Authorization: AuthStr },
                });
                if (add_report) {
                    this.snack = true;
                    this.snackText = 'Report added successfully';
                    this.snackColor = "green";
                    this.report = {}
                    this.addReport = false
                } else {
                    this.snack = true;
                    this.snackText = "Unable to add report, Please try again later.";
                    this.snackColor = "red";
                    this.report = {}
                    this.addReport = false
                }
            }
            // this.getAllReport()
        },
        resetCalendarFilterDateDownload() {
            this.date_calendar = []
            this.$refs.menu_calendar_button2.save(this.date_calendar)
        },
        selectReport(index) {
            this.selectedReport = this.visiblePages[index]
        },
        getCompanyName(company_id) {
            let company = this.companies.filter(a => a._id == company_id)[0]
            return company ? company.company_name : 'Missing Company'
        },
    },
    computed: {
        getInfoForDownload() {
            if (this.selectedFilterDate != '') {
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

                    if (this.selectedReport.name == 'Absence Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let absence_obj = {
                                emp_id: "",
                                full_name: "",
                                absent_date: "",
                                clock_in: "",
                                clock_out: "",
                                work_schedule: "",
                                gender: "",
                                nationality: "",
                                dept: "",
                                designation: "",
                                team: "",
                                line_manager: "",
                                company: "",
                                cost_center: "",
                                employment_type: "",
                                contract_type: "",
                            }
                            for (let index_attendance = 0; index_attendance < abc[index].attendance.length; index_attendance++) {
                                const element = abc[index].attendance[index_attendance];
                                absence_obj.emp_id = abc[index].emp_id
                                absence_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                absence_obj.absent_date = this.formatDate(element.date)
                                absence_obj.clock_in = element.startTime == null ? 'No clock in time' : this.convertTo12HourFormat(element.startTime)
                                absence_obj.clock_out = element.endTime == null ? 'No clock out time' : this.convertTo12HourFormat(element.endTime)
                                absence_obj.work_schedule = abc[index].work_schedule
                                absence_obj.gender = abc[index].gender
                                absence_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                                absence_obj.dept = abc[index].department
                                absence_obj.designation = abc[index].designation
                                absence_obj.team = abc[index].team
                                absence_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                absence_obj.company = abc[index].company_name
                                absence_obj.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                absence_obj.employment_type = abc[index].employment_type
                                absence_obj.contract_type = abc[index].contract_type
                                arr.push({ ...absence_obj })
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Approved & Rejected Requests Report (Department-wise)') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let app_rej_dept = {
                                company_name: "",
                                department: "",
                                request_type: "",
                                request_status: "",
                                total_count: "",
                            }
                            if (abc[index].departments && abc[index].departments.length > 0) {
                                for (let department_index = 0; department_index < abc[index].departments.length; department_index++) {
                                    const element_departments = abc[index].departments[department_index];
                                    if (abc[index].departments[department_index].requests.completed && abc[index].departments[department_index].requests.completed.length > 0) {
                                        for (let completed_index = 0; completed_index < abc[index].departments[department_index].requests.completed.length; completed_index++) {
                                            const element = abc[index].departments[department_index].requests.completed[completed_index];
                                            let status = Object.keys(abc[index].departments[department_index].requests)[0]
                                            app_rej_dept.company_name = abc[index].company_name
                                            app_rej_dept.department = abc[index].departments[department_index].department
                                            app_rej_dept.request_type = element.request_type
                                            app_rej_dept.request_status = status
                                            app_rej_dept.total_count = element.count
                                            arr.push({ ...app_rej_dept })
                                        }
                                    }
                                    if (abc[index].departments[department_index].requests.cancelled && abc[index].departments[department_index].requests.cancelled.length > 0) {
                                        for (let cancelled_index = 0; cancelled_index < abc[index].departments[department_index].requests.cancelled.length; cancelled_index++) {
                                            const element = abc[index].departments[department_index].requests.cancelled[cancelled_index];
                                            let status = Object.keys(abc[index].departments[department_index].requests)[0]
                                            app_rej_dept.company_name = abc[index].company_name
                                            app_rej_dept.department = abc[index].departments[department_index].department
                                            app_rej_dept.request_type = element.request_type
                                            app_rej_dept.request_status = 'cancelled'
                                            app_rej_dept.total_count = element.count
                                            arr.push({ ...app_rej_dept })
                                        }
                                    }
                                }
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Approved & Rejected Requests Report (Employee-wise)') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let app_rej_emp = {
                                emp_id: "",
                                full_name: "",
                                date_of_joining: "",
                                prob_end: "",
                                designation: "",
                                dept: "",
                                company: "",
                                cost_center: "",
                                line_manager: "",
                                req_type: "",
                                req_date: "",
                                req_status: "",
                                app_1: "",
                                app_2: "",
                                app_3: "",
                                app_4: "",
                            }
                            if (abc[index].requests.attendance && abc[index].requests.attendance.length > 0) {
                                for (let attendanceIndex = 0; attendanceIndex < abc[index].requests.attendance.length; attendanceIndex++) {
                                    const element = abc[index].requests.attendance[attendanceIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = this.formatDate(element.letter_fields.date)
                                    app_rej_emp.req_status = element.status
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.claims && abc[index].requests.claims.length > 0) {
                                for (let claimsIndex = 0; claimsIndex < abc[index].requests.claims.length; claimsIndex++) {
                                    const element = abc[index].requests.claims[claimsIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = element.letter_fields.date
                                    app_rej_emp.req_status = element.status
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.letters && abc[index].requests.letters.length > 0) {
                                for (let lettersIndex = 0; lettersIndex < abc[index].requests.letters.length; lettersIndex++) {
                                    const element = abc[index].requests.letters[lettersIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = element.letter_fields.date
                                    app_rej_emp.req_status = element.status
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.leave && abc[index].requests.leave.length > 0) {
                                for (let leaveIndex = 0; leaveIndex < abc[index].requests.leave.length; leaveIndex++) {
                                    const element = abc[index].requests.leave[leaveIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = this.formatDate(element.date_created)
                                    app_rej_emp.req_status = element.status
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.wfh && abc[index].requests.wfh.length > 0) {
                                for (let wfhIndex = 0; wfhIndex < abc[index].requests.wfh.length; wfhIndex++) {
                                    const element = abc[index].requests.wfh[wfhIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = this.formatDate(element.date_created)
                                    app_rej_emp.req_status = element.status
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }

                        }
                        return arr
                    } else if (this.selectedReport.name == 'Attendance Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            this.attTotal = 0
                            this.otTotal = 0
                            this.lateEntries = []
                            this.earlyEntries = []
                            function getTimeFromHour(n) {
                                let num = n;
                                let hours = num;
                                let rhours = Math.floor(hours);
                                let minutes = (hours - rhours) * 60;
                                let rminutes = Math.round(minutes);
                                return rhours + ":" + rminutes;
                            }
                            function sumTime(times) {
                                let totalMinutes = 0;
                                for (let time of times) {
                                    let hours = parseInt(time.split(':')[0]);
                                    let minutes = parseInt(time.split(':')[1]);
                                    totalMinutes += hours * 60 + minutes;
                                }
                                let hours = Math.floor(totalMinutes / 60);
                                let minutes = totalMinutes % 60;
                                return `${hours}:${minutes}`;
                            }
                            let attendance_obj = {
                                emp_id: "",
                                full_name: "",
                                designation: "",
                                department: "",
                                work_schedule: "",
                                on_duty: "",
                                off_duty: "",
                                duty_hours: "",
                                clock_in_date: "",
                                clock_in_day: "",
                                clock_in_loc: "",
                                clock_in_time: "",
                                late: "",
                                clock_out_date: "",
                                clock_out_day: "",
                                clock_out_loc: "",
                                clock_out_time: "",
                                early: "",
                                total_hours: "",
                                ot_hours: "",
                                att_type: "",
                                remarks: "",
                                required: "",
                                total_present: "",
                                total_weekend: "",
                                total_absent: "",
                                total_sick_leave: "",
                                total_annual_leave: "",
                                total_other_leave: "",
                                total_leave_days: "",
                            }
                            for (let attendance_index = 0; attendance_index < abc[index].attendances.length; attendance_index++) {
                                const element = abc[index].attendances[attendance_index];
                                attendance_obj.emp_id = abc[index].emp_id
                                attendance_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                attendance_obj.designation = abc[index].designation
                                attendance_obj.department = abc[index].reporting.department
                                attendance_obj.work_schedule = abc[index].work_schedule
                                attendance_obj.on_duty = abc[index].onDuty
                                attendance_obj.off_duty = abc[index].offDuty
                                attendance_obj.duty_hours = abc[index].dutyHours
                                attendance_obj.clock_in_date = element.clockInDate == null ? '' : element.clockInDate
                                attendance_obj.clock_in_day = element.clockInDay == null ? '' : element.clockInDay
                                attendance_obj.clock_in_loc = element.in_address == '' || element.in_address == null ? '' : element.in_address
                                attendance_obj.clock_in_time = element.clockInTime == null ? '' : element.clockInTime
                                attendance_obj.late = element.late
                                attendance_obj.clock_out_date = element.clockOutDate == null ? '' : element.clockOutDate
                                attendance_obj.clock_out_day = element.clockOutDay == null ? '' : element.clockOutDay
                                attendance_obj.clock_out_loc = element.out_address == '' || element.out_address == null ? '' : element.out_address
                                attendance_obj.clock_out_time = element.clockOutTime == null ? '' : element.clockOutTime
                                attendance_obj.early = element.early
                                attendance_obj.total_hours = element.totalHours == null ? '' : element.totalHours
                                attendance_obj.ot_hours = element.ot_hours == null ? '' : element.ot_hours
                                attendance_obj.att_type = element.attendance_type
                                attendance_obj.remarks = element.remarks

                                if (element.late != '00:00') this.lateEntries.push(element.late)
                                if (element.early != '00:00') this.earlyEntries.push(element.early)
                                if (Math.sign(element.totalHours) == 1) {
                                    this.attTotal += parseFloat(element.totalHours)
                                }

                                if (Math.sign(element.ot_hours) == 1) {
                                    this.otTotal += parseFloat(element.ot_hours)
                                }

                                arr.push({ ...attendance_obj })
                            }
                            let att_report = {
                                emp_id: "",
                                full_name: abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name,
                                designation: "",
                                department: "",
                                work_schedule: "",
                                on_duty: "",
                                off_duty: "",
                                duty_hours: "",
                                clock_in_date: "",
                                clock_in_day: "",
                                clock_in_loc: "",
                                clock_in_time: "",
                                late: sumTime(this.lateEntries),
                                clock_out_date: "",
                                clock_out_day: "",
                                clock_out_loc: "",
                                clock_out_time: "",
                                early: sumTime(this.earlyEntries),
                                total_hours: getTimeFromHour(this.attTotal) || '0',
                                ot_hours: getTimeFromHour(this.otTotal) || '0',
                                att_type: '',
                                remarks: "",
                                required: abc[index].total_required,
                                total_present: abc[index].total_present,
                                total_weekend: abc[index].total_weekend,
                                total_absent: abc[index].total_absent,
                                total_sick_leave: abc[index].total_medical_leave,
                                total_annual_leave: abc[index].total_annual_leave,
                                total_other_leave: abc[index].total_other_leave,
                                total_leave_days: abc[index].total_leaves,
                            }

                            arr.push(att_report)
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Claims Reimbursement Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let claims_obj = {
                                emp_id: "",
                                full_name: "",
                                gender: "",
                                nationality: "",
                                date_of_joining: "",
                                prob_end: "",
                                designation: "",
                                dept: "",
                                company: "",
                                cost_center: "",
                                line_manager: "",
                                claim_type: "",
                                status: "",
                                claim_date: "",
                                closed_date: "",
                                app_1: "",
                                app_2: "",
                                app_3: "",
                                app_4: "",
                            }
                            for (let claim_index = 0; claim_index < abc[index].requests.length; claim_index++) {
                                const element = abc[index].requests[claim_index];
                                claims_obj.emp_id = abc[index].emp_id
                                claims_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                claims_obj.gender = abc[index].gender
                                claims_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                                claims_obj.date_of_joining = abc[index].date_of_joining
                                claims_obj.prob_end = abc[index].probation_end_date
                                claims_obj.dept = abc[index].reporting.department
                                claims_obj.designation = abc[index].designation
                                claims_obj.team = abc[index].team
                                claims_obj.company = abc[index].company_name
                                claims_obj.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                claims_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                claims_obj.claim_type = element.letter_sub_type
                                claims_obj.amount = element.letter_fields.amount
                                claims_obj.status = element.status
                                claims_obj.claim_date = element.letter_fields.date
                                claims_obj.closed_date = this.formatDate(element.approvals[element.approvals.length - 1].approved_date)
                                if (element.approvals.length == 1) {
                                    claims_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                } else if (element.approvals.length == 2) {
                                    claims_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    claims_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                } else if (element.approvals.length == 3) {
                                    claims_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    claims_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    claims_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                } else if (element.approvals.length == 4) {
                                    claims_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    claims_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    claims_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    claims_obj.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                }
                                arr.push({ ...claims_obj })
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Employee Information Report') {
                        let arr = []
                        function calculateProbation(doj, pd) {
                            return moment(doj, "YYYY-MM-DD").add(pd, 'days').format('YYYY-MM-DD')
                        }
                        for (let index = 0; index < abc.length; index++) {
                            let emp_obj = {
                                emp_id: "",
                                first_name: "",
                                middle_name: "",
                                last_name: "",
                                nick_name: "",
                                gender: "",
                                marital_status: "",
                                nationality: "",
                                religion: "",
                                dob: "",
                                personal_phone: "",
                                personal_mobile: "",
                                whatsapp: "",
                                personal_whatsapp: "",
                                ext: "",
                                speed_dial: "",
                                email: "",
                                personal_email: "",
                                role_type: "",
                                employee_type: "",
                                address: "",
                                allergies: "",
                                user_status: "",
                                date_of_joining: "",
                                designation: "",
                                dept: "",
                                team: "",
                                company: "",
                                line_manager: "",
                                employment_type: "",
                                contract_type: "",
                                work_schedule: "",
                                work_location: "",
                                prob_days: "",
                                termination_data: "",
                                probation_end_date: "",
                                cost_center: "",
                                speciality: "",
                                skills: "",
                                primary_contact_name: "",
                                primary_contact_rel: "",
                                primary_contact_num: "",
                                primary_contact_country: "",
                                secondary_contact_name: "",
                                secondary_contact_rel: "",
                                secondary_contact_num: "",
                                secondary_contact_country: "",
                                passport_number: "",
                                passport_expiration: "",
                                emirates_number: "",
                                emirates_expiration: "",
                                insurance_number: "",
                                insurance_expiration: "",
                                labour_number: "",
                                labour_expiration: "",
                                visa_number: "",
                                visa_expiration: "",
                                visa_sponsor: "",
                                visa_uid: "",
                                covid_status: "",
                                not_vacc_reason: "",
                                sponsored_dep: "",
                                sign_asset: "",
                                medical_leave: "",
                                annual_leave: "",
                                unpaid_leave: "",
                                compassionate_leave: "",
                                study_leave: "",
                                maternity_leave: "",
                                hajj_leave: "",
                                parental_leave: "",
                            }
                            emp_obj.emp_id = abc[index].emp_id
                            emp_obj.first_name = abc[index].first_name
                            emp_obj.middle_name = abc[index].middle_name
                            emp_obj.last_name = abc[index].last_name
                            emp_obj.nick_name = abc[index].personal.nick_name
                            emp_obj.gender = abc[index].personal.gender
                            emp_obj.marital_status = abc[index].personal.marital_status
                            emp_obj.nationality = abc[index].personal.nationality
                            emp_obj.religion = abc[index].personal.religion
                            emp_obj.dob = abc[index].personal.dob
                            emp_obj.personal_phone = abc[index].personal.phone
                            emp_obj.personal_mobile = abc[index].personal.personal_phone
                            emp_obj.whatsapp = abc[index].personal.whatsapp
                            emp_obj.personal_whatsapp = abc[index].personal.personal_whatsapp
                            emp_obj.ext = abc[index].personal.ext
                            emp_obj.speed_dial = abc[index].personal.speed_dial
                            emp_obj.email = abc[index].email
                            emp_obj.personal_email = abc[index].personal.email
                            emp_obj.role_type = this.getRoleName(abc[index].role_ID)
                            emp_obj.employee_type = abc[index].reporting.type
                            emp_obj.address = abc[index].personal.address
                            emp_obj.allergies = abc[index].personal.allergies
                            emp_obj.user_status = abc[index].user_status
                            emp_obj.date_of_joining = abc[index].date_of_joining
                            emp_obj.designation = abc[index].personal.designation
                            emp_obj.dept = abc[index].reporting.department
                            emp_obj.team = abc[index].reporting.team
                            emp_obj.company = abc[index].company.company_name
                            emp_obj.line_manager = this.getManagerDetails(abc[index].reporting.manager)
                            emp_obj.employment_type = abc[index].employment_type
                            emp_obj.contract_type = abc[index].contract_type
                            emp_obj.work_schedule = abc[index].personal.work_schedule
                            emp_obj.work_location = abc[index].personal.work_location
                            emp_obj.prob_days = calculateProbation(abc[index].date_of_joining, abc[index].probation_end_date)
                            emp_obj.termination_data = abc[index].employment.termination_date
                            emp_obj.probation_end_date = abc[index].probation_end_date
                            emp_obj.cost_center = abc[index].personal.cost_center
                            emp_obj.speciality = abc[index].personal.speciality
                            emp_obj.skills = abc[index].personal.skills
                            emp_obj.primary_contact_name = abc[index].emergency.name
                            emp_obj.primary_contact_rel = abc[index].emergency.relationship
                            emp_obj.primary_contact_num = abc[index].emergency.phone
                            emp_obj.primary_contact_country = abc[index].emergency.country
                            emp_obj.secondary_contact_name = abc[index].emergency.name_1
                            emp_obj.secondary_contact_rel = abc[index].emergency.relationship_1
                            emp_obj.secondary_contact_num = abc[index].emergency.phone_1
                            emp_obj.secondary_contact_country = abc[index].emergency.country_1
                            emp_obj.passport_number = abc[index].documents.passport_number
                            emp_obj.passport_expiration = abc[index].documents.passport_expiry
                            emp_obj.emirates_number = abc[index].documents.emiratesID_number
                            emp_obj.emirates_expiration = abc[index].documents.emiratesID_expiry
                            emp_obj.insurance_number = abc[index].insurance.insurance_card
                            emp_obj.insurance_expiration = abc[index].insurance.expiry_date
                            emp_obj.labour_number = abc[index].documents.labour_card_number
                            emp_obj.labour_expiration = abc[index].documents.labour_card_expiry
                            emp_obj.visa_number = abc[index].documents.visa_number
                            emp_obj.visa_expiration = abc[index].documents.visa_expiry
                            emp_obj.visa_sponsor = abc[index].employment.visa_sponsor
                            emp_obj.visa_uid = abc[index].documents.visa_uid_number
                            emp_obj.covid_status = abc[index].covid_details.vaccination_status
                            emp_obj.not_vacc_reason = abc[index].covid_details.reason
                            emp_obj.sponsored_dep = abc[index].sponsored_dependents.length > 0 ? abc[index].sponsored_dependents[0].name : ''
                            emp_obj.sign_asset = abc[index].documents.asset_form_signed == false ? 'No' : 'Yes'
                            emp_obj.medical_leave = abc[index].leaves.medical_leaves
                            emp_obj.annual_leave = abc[index].leaves.annual_leaves
                            emp_obj.unpaid_leave = abc[index].leaves.unpaid_leaves
                            emp_obj.compassionate_leave = abc[index].leaves.compassionate_leaves
                            emp_obj.study_leave = abc[index].leaves.study_leaves
                            emp_obj.maternity_leave = abc[index].leaves.maternity_leaves
                            emp_obj.hajj_leave = abc[index].leaves.hajj_leaves
                            emp_obj.parental_leave = abc[index].leaves.parental_leaves
                            arr.push({ ...emp_obj })
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Employee Letters Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let letter_obj = {
                                emp_id: "",
                                full_name: "",
                                gender: "",
                                nationality: "",
                                date_of_joining: "",
                                prob_end: "",
                                designation: "",
                                dept: "",
                                company: "",
                                cost_center: "",
                                line_manager: "",
                                letter_type: "",
                                letter_sub_type: "",
                                letter_status: "",
                                req_date: "",
                                closed_date: "",
                                app_1: "",
                                app_2: "",
                                app_3: "",
                                app_4: "",
                            }
                            for (let letterIndex = 0; letterIndex < abc[index].requests.length; letterIndex++) {
                                const element = abc[index].requests[letterIndex];
                                letter_obj.emp_id = abc[index].emp_id
                                letter_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                letter_obj.gender = abc[index].gender
                                letter_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                                letter_obj.date_of_joining = abc[index].date_of_joining
                                letter_obj.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                letter_obj.dept = abc[index].reporting.department
                                letter_obj.designation = abc[index].designation
                                letter_obj.team = abc[index].team
                                letter_obj.company = abc[index].company_name
                                letter_obj.cost_center = abc[index].cost_center
                                letter_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                letter_obj.letter_type = element.letter_type
                                letter_obj.letter_sub_type = element.letter_sub_type
                                letter_obj.letter_status = element.status
                                letter_obj.req_date = this.formatDate(element.date_created)
                                letter_obj.closed_date = this.formatDate(element.approvals[element.approvals.length - 1].approved_date)
                                if (element.approvals.length == 1) {
                                    letter_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                } else if (element.approvals.length == 2) {
                                    letter_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    letter_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                } else if (element.approvals.length == 3) {
                                    letter_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    letter_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    letter_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                } else if (element.approvals.length == 4) {
                                    letter_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    letter_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    letter_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    letter_obj.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                }
                                arr.push({ ...letter_obj })
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Leave Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let leave_obj = {
                                emp_id: "",
                                full_name: "",
                                gender: "",
                                nationality: "",
                                date_of_joining: "",
                                prob_end: "",
                                dept: "",
                                designation: "",
                                team: "",
                                company: "",
                                cost_center: "",
                                line_manager: "",
                                leave_type: "",
                                status: "",
                                req_date: "",
                                from_date: "",
                                to_date: "",
                                no_days: "",
                                closed_date: "",
                                app_1: "",
                                app_2: "",
                                app_3: "",
                                app_4: "",
                            }
                            for (let leaveIndex = 0; leaveIndex < abc[index].leaves.length; leaveIndex++) {
                                const element = abc[index].leaves[leaveIndex];
                                leave_obj.emp_id = abc[index].emp_id
                                leave_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                leave_obj.gender = abc[index].gender
                                leave_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                                leave_obj.date_of_joining = abc[index].date_of_joining
                                leave_obj.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                leave_obj.designation = abc[index].designation
                                leave_obj.dept = abc[index].reporting.department
                                leave_obj.company = abc[index].company_name
                                leave_obj.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                leave_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                leave_obj.leave_type = element.leave_type
                                leave_obj.status = element.status
                                leave_obj.req_date = this.formatDate(element.date_created)
                                leave_obj.from_date = this.formatDate(element.from_date)
                                leave_obj.to_date = this.formatDate(element.to_date)
                                leave_obj.no_days = element.no_of_days
                                leave_obj.closed_date = this.formatDate(element.approvals[element.approvals.length - 1].approved_date)
                                if (element.approvals.length == 1) {
                                    leave_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                } else if (element.approvals.length == 2) {
                                    leave_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    leave_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                } else if (element.approvals.length == 3) {
                                    leave_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    leave_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    leave_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                } else if (element.approvals.length == 4) {
                                    leave_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    leave_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    leave_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    leave_obj.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                }
                                arr.push({ ...leave_obj })
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Leaver Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let leaver_obj = {
                                emp_id: "",
                                full_name: "",
                                gender: "",
                                nationality: "",
                                date_of_joining: "",
                                prob_end: "",
                                last_work_day: "",
                                exit_type: "",
                                dept: "",
                                designation: "",
                                team: "",
                                company: "",
                                cost_center: "",
                                employment_type: "",
                                contract_type: "",
                                line_manager: "",
                            }
                            leaver_obj.emp_id = abc[index].emp_id
                            leaver_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                            leaver_obj.gender = abc[index].gender
                            leaver_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                            leaver_obj.date_of_joining = abc[index].date_of_joining
                            leaver_obj.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                            leaver_obj.last_work_day = abc[index].employment.termination_date
                            leaver_obj.exit_type = abc[index].exit_type
                            leaver_obj.dept = abc[index].reporting.department
                            leaver_obj.designation = abc[index].designation
                            leaver_obj.team = abc[index].team
                            leaver_obj.company = abc[index].company_name
                            leaver_obj.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                            leaver_obj.employment_type = abc[index].employment_type == '' ? 'No employment type inputed yet' : abc[index].employment_type
                            leaver_obj.contract_type = abc[index].contract_type == '' ? 'No contract type inputed yet' : abc[index].contract_type
                            leaver_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                            arr.push({ ...leaver_obj })
                        }
                        return arr
                    } else if (this.selectedReport.name == 'New Joiner Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let new_joiner_obj = {
                                emp_id: "",
                                full_name: "",
                                gender: "",
                                nationality: "",
                                date_of_joining: "",
                                prob_end: "",
                                dept: "",
                                designation: "",
                                team: "",
                                company: "",
                                cost_center: "",
                                employment_type: "",
                                contract_type: "",
                                line_manager: "",
                            }
                            new_joiner_obj.emp_id = abc[index].emp_id
                            new_joiner_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                            new_joiner_obj.gender = abc[index].gender
                            new_joiner_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                            new_joiner_obj.date_of_joining = abc[index].date_of_joining
                            new_joiner_obj.prob_end = abc[index].probation_end_date
                            new_joiner_obj.dept = abc[index].department == '' ? 'No Department inputed' : abc[index].department
                            new_joiner_obj.designation = abc[index].designation
                            new_joiner_obj.team = abc[index].team == '' ? 'No team inputed' : abc[index].team
                            new_joiner_obj.company = abc[index].company_name
                            new_joiner_obj.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                            new_joiner_obj.employment_type = abc[index].employment_type == '' ? 'No employment type inputed yet' : abc[index].employment_type
                            new_joiner_obj.contract_type = abc[index].contract_type == '' ? 'No contract type inputed yet' : abc[index].contract_type
                            new_joiner_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                            arr.push({ ...new_joiner_obj })
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Voluntary & Involuntary Leave Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let vol_inv_leave_obj = {
                                company_name: "",
                                department: "",
                                voluntary_leaves: "",
                                involuntary_leaves: "",
                                total: "",
                            }
                            if (abc[index].departments && abc[index].departments.length > 0) {
                                for (let departmentIndex = 0; departmentIndex < abc[index].departments.length; departmentIndex++) {
                                    const element = abc[index].departments[departmentIndex];
                                    vol_inv_leave_obj.company_name = abc[index].company_name
                                    vol_inv_leave_obj.department = element.department
                                    vol_inv_leave_obj.voluntary_leaves = element.voluntary_leaves
                                    vol_inv_leave_obj.involuntary_leaves = element.involuntary_leaves
                                    vol_inv_leave_obj.total = element.total
                                    arr.push({ ...vol_inv_leave_obj })
                                }
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Overtime Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let ot_obj = {
                                emp_id: "",
                                full_name: "",
                                ot_date: "",
                                ot_start_time: "",
                                ot_end_time: "",
                                ot_hours: "",
                                gender: "",
                                nationality: "",
                                dept: "",
                                designation: "",
                                team: "",
                                line_manager: "",
                                company: "",
                                cost_center: "",
                                employment_type: "",
                                contract_type: "",
                            }
                            for (let otIndex = 0; otIndex < abc[index].attendance.length; otIndex++) {
                                const element = abc[index].attendance[otIndex];
                                ot_obj.emp_id = abc[index].emp_id
                                ot_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                ot_obj.ot_date = this.formatDate(element.date)
                                ot_obj.ot_start_time = this.convertTo12HourFormat(element.startTime)
                                ot_obj.ot_end_time = this.convertTo12HourFormat(element.endTime)
                                ot_obj.ot_hours = element.overTime.toFixed(2)
                                ot_obj.gender = abc[index].gender
                                ot_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                                ot_obj.dept = abc[index].department
                                ot_obj.designation = abc[index].designation
                                ot_obj.team = abc[index].team
                                ot_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                ot_obj.company = abc[index].company_name
                                ot_obj.cost_center = abc[index].cost_center
                                ot_obj.employment_type = abc[index].employment_type
                                ot_obj.contract_type = abc[index].contract_type
                                arr.push({ ...ot_obj })
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Pending Requests Report (Department-wise)') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let pending_req_dep = {
                                company_name: "",
                                department: "",
                                request_type: "",
                                total_count: "",
                            }
                            if (abc[index].departments && abc[index].departments.length > 0) {
                                for (let department_index = 0; department_index < abc[index].departments.length; department_index++) {
                                    const element_departments = abc[index].departments[department_index];
                                    if (abc[index].departments[department_index].requests && abc[index].departments[department_index].requests.length > 0) {
                                        for (let requests_index = 0; requests_index < abc[index].departments[department_index].requests.length; requests_index++) {
                                            const element = abc[index].departments[department_index].requests[requests_index];
                                            pending_req_dep.company_name = abc[index].company_name
                                            pending_req_dep.department = abc[index].departments[department_index].department
                                            pending_req_dep.request_type = element.request_type
                                            pending_req_dep.total_count = element.count
                                            arr.push({ ...pending_req_dep })
                                        }
                                    }
                                }
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Pending Requests Report (Employee-wise)') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let app_rej_emp = {
                                emp_id: "",
                                full_name: "",
                                date_of_joining: "",
                                prob_end: "",
                                designation: "",
                                dept: "",
                                company: "",
                                cost_center: "",
                                line_manager: "",
                                req_type: "",
                                req_date: "",
                                app_1: "",
                                app_2: "",
                                app_3: "",
                                app_4: "",
                            }
                            if (abc[index].requests.attendance && abc[index].requests.attendance.length > 0) {
                                for (let attendanceIndex = 0; attendanceIndex < abc[index].requests.attendance.length; attendanceIndex++) {
                                    const element = abc[index].requests.attendance[attendanceIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = this.formatDate(element.letter_fields.date)
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.claims && abc[index].requests.claims.length > 0) {
                                for (let claimsIndex = 0; claimsIndex < abc[index].requests.claims.length; claimsIndex++) {
                                    const element = abc[index].requests.claims[claimsIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = element.letter_fields.date
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.letters && abc[index].requests.letters.length > 0) {
                                for (let lettersIndex = 0; lettersIndex < abc[index].requests.letters.length; lettersIndex++) {
                                    const element = abc[index].requests.letters[lettersIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = element.letter_fields.date
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.leave && abc[index].requests.leave.length > 0) {
                                for (let leaveIndex = 0; leaveIndex < abc[index].requests.leave.length; leaveIndex++) {
                                    const element = abc[index].requests.leave[leaveIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = this.formatDate(element.date_created)
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                            if (abc[index].requests.wfh && abc[index].requests.wfh.length > 0) {
                                for (let wfhIndex = 0; wfhIndex < abc[index].requests.wfh.length; wfhIndex++) {
                                    const element = abc[index].requests.wfh[wfhIndex];
                                    app_rej_emp.emp_id = abc[index].emp_id
                                    app_rej_emp.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                    app_rej_emp.date_of_joining = abc[index].date_of_joining
                                    app_rej_emp.prob_end = abc[index].probation_end_date == null ? 'No probation end date inputed yet' : abc[index].probation_end_date
                                    app_rej_emp.designation = abc[index].designation
                                    app_rej_emp.dept = abc[index].reporting.department
                                    app_rej_emp.company = abc[index].company_name
                                    app_rej_emp.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                    app_rej_emp.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                    app_rej_emp.req_type = element.request_type
                                    app_rej_emp.req_date = this.formatDate(element.date_created)
                                    if (element.approvals.length == 1) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    } else if (element.approvals.length == 2) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    } else if (element.approvals.length == 3) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    } else if (element.approvals.length == 4) {
                                        app_rej_emp.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                        app_rej_emp.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                        app_rej_emp.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                        app_rej_emp.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                    }
                                    arr.push({ ...app_rej_emp })
                                }
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'Salary Adjustments Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let salary_adj_obj = {
                                emp_id: "",
                                full_name: "",
                                gender: "",
                                nationality: "",
                                date_of_joining: "",
                                designation: "",
                                dept: "",
                                company: "",
                                cost_center: "",
                                effec_date: "",
                                type: "",
                                created_by: "",
                                status: "",
                                approvers: "",
                                old_salary: "",
                                new_salary: "",
                                diff_salary: "",
                                proration: "",
                                arrears: "",
                            }
                            for (let salary_adj_index = 0; salary_adj_index < abc[index].salaryadjustments.length; salary_adj_index++) {
                                const element = abc[index].salaryadjustments[salary_adj_index];
                                salary_adj_obj.emp_id = abc[index].emp_id
                                salary_adj_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                salary_adj_obj.gender = abc[index].gender
                                salary_adj_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                                salary_adj_obj.date_of_joining = abc[index].date_of_joining
                                salary_adj_obj.designation = abc[index].designation
                                salary_adj_obj.dept = abc[index].reporting.department
                                salary_adj_obj.company = abc[index].company_name
                                salary_adj_obj.cost_center = abc[index].cost_center
                                salary_adj_obj.effec_date = this.formatDate(element.effective_date)
                                salary_adj_obj.type = element.salaryPercentageChanges[0].adjustment_type
                                salary_adj_obj.created_by = this.getManagerDetails(element.createdBy)
                                salary_adj_obj.status = element.status
                                salary_adj_obj.approvers = this.getManagerDetails(element.approvals[0].approver_id)
                                salary_adj_obj.old_salary = element.total_salary_before
                                salary_adj_obj.new_salary = element.total_salary_after
                                salary_adj_obj.diff_salary = element.total_salary_difference
                                salary_adj_obj.proration = element.proratingCalculation.length > 0 ? 'Y' : 'N'
                                salary_adj_obj.arrears = 'N'
                                arr.push({ ...salary_adj_obj })
                            }
                        }
                        return arr
                    } else if (this.selectedReport.name == 'WFH Report') {
                        let arr = []
                        for (let index = 0; index < abc.length; index++) {
                            let wfh_obj = {
                                emp_id: "",
                                full_name: "",
                                gender: "",
                                nationality: "",
                                date_of_joining: "",
                                prob_end: "",
                                // dept: "",
                                designation: "",
                                team: "",
                                company: "",
                                cost_center: "",
                                line_manager: "",
                                status: "",
                                req_date: "",
                                from_date: "",
                                to_date: "",
                                no_days: "",
                                closed_date: "",
                                app_1: "",
                                app_2: "",
                                app_3: "",
                                app_4: "",
                            }
                            for (let wfhIndex = 0; wfhIndex < abc[index].wfhs.length; wfhIndex++) {
                                const element = abc[index].wfhs[wfhIndex];
                                wfh_obj.emp_id = abc[index].emp_id
                                wfh_obj.full_name = abc[index].first_name + ' ' + abc[index].middle_name + ' ' + abc[index].last_name
                                wfh_obj.gender = abc[index].gender
                                wfh_obj.nationality = abc[index].nationality == '' ? 'No nationality inputed' : abc[index].nationality
                                wfh_obj.date_of_joining = abc[index].date_of_joining
                                wfh_obj.prob_end = abc[index].probation_end_date
                                // wfh_obj.dept = abc[index].reporting.department
                                wfh_obj.designation = abc[index].designation
                                wfh_obj.team = abc[index].team
                                wfh_obj.company = abc[index].company_name
                                wfh_obj.cost_center = abc[index].cost_center == '' ? 'No cost center inputed yet' : abc[index].cost_center
                                wfh_obj.line_manager = abc[index].manager.first_name + ' ' + abc[index].manager.middle_name + ' ' + abc[index].manager.last_name
                                wfh_obj.status = element.status
                                wfh_obj.req_date = this.formatDate(element.date_created)
                                wfh_obj.from_date = this.formatDate(element.from_date)
                                wfh_obj.to_date = this.formatDate(element.to_date)
                                wfh_obj.no_days = element.no_of_days
                                wfh_obj.closed_date = this.formatDate(element.approvals[element.approvals.length - 1].approved_date)
                                if (element.approvals.length == 1) {
                                    wfh_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                } else if (element.approvals.length == 2) {
                                    wfh_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    wfh_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                } else if (element.approvals.length == 3) {
                                    wfh_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    wfh_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    wfh_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                } else if (element.approvals.length == 4) {
                                    wfh_obj.app_1 = this.getManagerDetails(element.approvals[0].approver_id) + ' - ' + element.approvals[0].status
                                    wfh_obj.app_2 = this.getManagerDetails(element.approvals[1].approver_id) + ' - ' + element.approvals[1].status
                                    wfh_obj.app_3 = this.getManagerDetails(element.approvals[2].approver_id) + ' - ' + element.approvals[2].status
                                    wfh_obj.app_4 = this.getManagerDetails(element.approvals[3].approver_id) + ' - ' + element.approvals[3].status
                                }
                                arr.push({ ...wfh_obj })
                            }
                        }
                        return arr
                    }
                    this.excelLoading = false
                }
            }
        },
        dateRangeTextExcel() {
            let toFormatDate = function (date) {
                return moment(String(date)).format('DD MMM YYYY')
            }
            if (this.date_calendar_download.length == 1) {
                return `${toFormatDate(this.date_calendar_download[0])} - ${toFormatDate(this.date_calendar_download[0])}`
            }
            else if (this.date_calendar_download.length > 1) {
                let abc = _.orderBy(this.date_calendar_download)
                return `${toFormatDate(abc[0])} - ${toFormatDate(abc[1])}`
            }
            else {
                return ''
            }
        },
        filterSummaryDoj() {
            let filter_text = 'DOJ: ';
            if (this.filterBy.doj_filter && this.filterBy.doj_from) {
                filter_text = filter_text + this.filterBy.doj_filter + " " + moment(String(this.filterBy.doj_from)).format('MMM-DD-YY')

                if (this.filterBy.doj_filter == 'Between' && this.filterBy.doj_to) {
                    filter_text = filter_text + " To " + moment(String(this.filterBy.doj_to)).format('MMM-DD-YY')
                }
            }
            return filter_text
        },
        disableDateJoinedFields() {
            if (!this.filterBy.doj_filter) {
                this.filterBy.doj_from = ''
                this.filterBy.doj_to = ''
            }
            return this.filterBy.doj_filter ? true : false
        },
        fetchCostcenters() {
            if (this.configuration[0]) {
                let abc = this.configuration[0].costCenterOptions;
                let arr = [];
                for (let i in abc) {
                    arr.push({ id: i, name: abc[i] });
                }
                return _.uniq(arr);
            }
        },
        managersList() {
            return this.users.filter(a => (a.role_ID == '640f05febe01c2e00bd95080' || a.role_ID == '640f1c93be01c2e00bd95084')).sort((a, b) => a.first_name.localeCompare(b.first_name))
        },
        adminsList() {
            let admin = this.users.filter(a => (a.role_ID == '640f1c93be01c2e00bd95084')).sort((a, b) => a.first_name.localeCompare(b.first_name))
            return ['All', ...admin]
        },
        fetchTeams() {
            if (!this.filterBy.department) {
                return null
            }
            else {
                const dept = this.filterBy.department
                let abc = this.configuration[0].dept.filter(function (value) {
                    return value.name == dept ? value.teams : ''
                })
                if (abc.length > 0) {
                    let arr = []
                    let dteams = abc[0].teams
                    for (let i in dteams) {
                        arr.push({ id: i, name: dteams[i].name })
                    }
                    return _.uniq(arr)
                }
                else return null;
            }
        },
        fetchUniqueDepartments() {

        if (this.configuration[0].dept) {
            let abc = this.configuration[0].dept
            let arr = []
            for (let i = 0; i < abc.length; i++) {
                arr.push({ id: abc[i].id, name: abc[i].name })
            }
            return _.uniq(arr)
        }
        },
        countryList() {
            const countryCodes = Object.keys(countries.countries);
            const countryNames = countryCodes.map(code => countries.countries[code].name);
            return _.orderBy(countryNames, [], ['asc']);
        },
        visiblePages() {
            let returnData = []
            let reports = this.reports
            if (this.searchText) {
                var s = this.searchText;
                returnData = _.filter(reports, function (value) {
                    return (
                        value.name && value.name.toLowerCase().indexOf(s.toLowerCase()) > -1
                    )
                })
                return returnData
            }
            else {
                return reports
            }
        }
    },
}
</script>

<style scoped>
.curve {

    position: absolute;
    transform: rotate(-45deg);
    border-radius: 0 50% 0 50%;
    box-shadow: 0 0 0 10px #fff;
    background: #fff;
    top: -10%;
    left: 10%;
}

.curve::before {
    border-bottom-right-radius: 20px;
}

.curve2 {

    position: absolute;
    transform: rotate(-45deg);
    border-radius: 0 50% 0 50%;
    box-shadow: 0 0 0 10px #0A2C4F;
    background: #0A2C4F;
    top: -10%;
    left: 10%;
}

.curve2::before {
    border-bottom-right-radius: 20px;
}

.curve-parent {
    position: relative;
}

.curveImage {
    transform: rotate(45deg);
    z-index: 6;
}

@media screen and (max-width:1540px) {
    .eventCard {
        max-height: 420px !important;
        min-height: 420px !important;
    }

    .eventCardImg {
        max-height: 240px !important;
    }

    .newsCardText,
    .newsCardTitle {
        padding-left: 0 !important;
        padding-right: 0 !important;
    }
}
</style>