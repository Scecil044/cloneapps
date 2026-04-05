<template>
    <div class="">
        <v-overlay v-if="dependentsLoading" style="z-index:15 !important" opacity="0.5">
            <v-img src="/animated/gear.svg" max-width="fit-content" height="937" class="mr-2" contain></v-img>
        </v-overlay>
        <div v-if="addUserFlag == true" max-width="1000" min-width='1000' style="overflow-x: hidden;">
            <AdditionForm :employee="employee" :parent_company="parent_company" :parent_company_id="parent_company_id" @close="addUserFlag = false" @add="confirmDependentAddition()" />
        </div>
        <div v-else>
            <v-row fluid class="pt-3 ml-0" v-if="emp_cards">
                <v-spacer />
                <v-col cols="auto" class="my-auto text-right">
                    <v-img src="/directory/add_plus.svg"  max-width="30" height="auto" @click="addUserFlag = true;" class="ml-4 cursor-pointer" contain></v-img>
                </v-col>
            </v-row>
            <v-row class="pt-0 ml-1" v-if="emp_cards && dependents.length > 0">
                <v-col cols="12" class="px-0" md="12">
                    <v-row class="mx-0" style="max-height:100%" v-if="dependents.length > 0">
                        <v-col cols="12" md="3" lg="3" xl="2" v-for="(data, index) in dependents" :key="index">
                            <v-card class="borderRadiusCards directoryCard" style="box-shadow: 0px  24px 30px #959EA51A;" min-height="220px" @click="getDependentDetails(data), emp_cards = !emp_cards;getInsurance(data);model_select_list= index">
                                <div style="min-height:220px !important;max-height:325px !important" class=" d-flex flex-column justify-space-between">
                                    <v-row class="pa-4 mx-0 pb-0" style="max-width: 100%">
                                        <v-col cols="7" class="pa-0" />
                                        <v-spacer></v-spacer>
                                        <v-col cols="5" class="pa-0 my-auto" align="center" style="color:#5C7EEF">
                                            <v-chip label x-small elevation="0" class="white--text" v-if="data.personal && data.personal.gender">{{data.personal.gender}}</v-chip>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="auto" class="mx-auto" >
                                            <v-avatar class=""  size="100" style="position:relative">
                                                <v-img aspect-ratio="1" :src="getImage(data)" alt="data" :gradient="data.user_status == 'Inactive'? 'to bottom right, rgba(189,195,199,.33), rgba(189,195,199,.7)':''"></v-img>
                                            </v-avatar>
                                        </v-col>
                                    </v-row>
                                    <v-row class="pt-0 mx-0" style="max-height:100%">
                                        <v-col cols="auto" class="mx-auto pb-0 pt-0">
                                            <v-list-item-content class="pt-0 text-left pb-0" >
                                                <v-list-item-title class="title darkBlue-heading-text font-weight-bold text-center headingFontSize" :class="data.user_status == 'Inactive' ? 'grey--text' : 'darkBlue-heading-text'">{{data.first_name}} {{data.last_name}} </v-list-item-title>
                                                <v-list-item-subtitle  class=" text-left caption text-center grey--text text--lighten-1" style="height:60px;white-space: pre-wrap !important;">{{data.relation_to_principal}}</v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <div v-else>
                        <p class="darkBlue-heading-text font-weight-bold headingFontSize">Dependent Not Found</p>
                    </div>
                </v-col>
            </v-row>
            <v-row v-else-if="dependents.length > 0">
                <v-col cols="12" sm="12" md="3">
                    <v-card class="rounded-xl py-4 px-0" flat min-height="900">
                        <v-card-title class=" pt-0">
                            <v-img src="/adminCentral/employees.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                            <h3 class="darkBlue-heading-text subHeadingFontSize">Dependents</h3>
                            <v-spacer></v-spacer>
                        </v-card-title>
                        <v-divider></v-divider>
                        <div class="">
                            <v-list two-line class="scroll" style="max-height : 820px;">
                                <v-list-item-group v-model="model_select_list" color="purple" v-if="dependents.length > 0">
                                    <template v-for="(data, index) in dependents">
                                        <v-divider :key="data._id" class="grey lighten-3 mx-0" v-if="index != 0"></v-divider>
                                        <v-list-item :key="index" active-class="light-blue--text text--lighten-2" style="cursor:pointer;" @click="getDependentDetails(data);getInsurance(data);model_select_list= index">
                                            <v-list-item-avatar size="50" class="">
                                                <v-img :src="getImage(data)" cover></v-img>
                                            </v-list-item-avatar>
                                            <v-list-item-content class="pl-2" width="70%"  >
                                                <v-list-item-title class="pt-0 font-weight-medium textFontSize mb-0 darkBlue-heading-text">{{data.first_name}} {{data.last_name}}</v-list-item-title>
                                                <h5 class="grey-heading-text caption font-weight-normal">{{data.relation_to_principal}}</h5>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </template>
                                </v-list-item-group>
                                <div v-else>
                                    No Dependents found.
                                </div>
                            </v-list>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" sm="12" md="9">
                    <v-card v-if="selectedDependent" class="rounded-xl editProfileTab pb-6 px-0" style="box-shadow: 0px  24px 30px #959EA51A;overflow:hidden" min-height="900px" max-height="900px">
                        <v-row>
                            <v-col cols="11" class="pa-0">
                                <v-tabs v-model="tab" background-color="transparent" grow class="justify-center darkBlue-heading-text rounded-0 px-5 py-6">
                                    <v-tab href="#personal" style="background-color:#fff;overflow: hidden;" class="mr-2 rounded-xl darkBlue-heading-text">Personal</v-tab>
                                    <v-tab href="#documents" style="background-color:#fff;overflow: hidden;" class="mr-2 rounded-xl darkBlue-heading-text">Documents</v-tab>
                                    <v-tab href="#insurance" style="background-color:#fff;overflow: hidden;" class="mr-2 rounded-xl darkBlue-heading-text">Insurance</v-tab>
                                </v-tabs>
                            </v-col>
                            <v-col cols="1" class="pa-0 d-flex justify-center">
                                <v-img @click="emp_cards = true" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
                            </v-col>
                        </v-row>
                        <v-divider></v-divider>
                        <v-tabs-items v-model="tab">
                            <v-tab-item id="personal" class="">
                                <v-row class="pt-5">
                                    <v-col cols="12" sm="6" class="px-5 font weight-bold pt-0 text-left">
                                        <v-card-title class=" pa-0">
                                            <v-img src="/adminCentral/employees.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                            <h2 class="darkBlue-heading-text subHeadingFontSize">{{empdetEdit ? 'Edit ' : ''}}Dependent Details</h2>
                                            <v-spacer></v-spacer>
                                        </v-card-title>
                                    </v-col>
                                    <v-col cols="12" sm="6" class="text-right pt-0">
                                        <v-btn elevation="0" width="150px" color="#0064D7"  @click="updateDependent()" v-if="empdetEdit" class="white--text border-radius-medium">Update</v-btn>
                                        <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="empdetEdit" @click="empdetEdit = !empdetEdit">Cancel</v-btn>
                                        <v-btn color="#5C7EEF" v-else-if="!empdetEdit" class="rounded-xl" small outlined @click="empdetEdit = true,onEditClick('empdetEdit')"  >
                                            <v-img src="/profile/edit.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                        Edit</v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                                <!--Edit Dependent Info-->
                                <div class="text-left editSection scroll" v-if="empdetEdit" style="max-height : 700px;">
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">First Name</p>
                                                <v-text-field  dense placeholder="First Name" class="py-0" v-model="selectedDependent.first_name"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Middle Name</p>
                                                <v-text-field  dense placeholder="Middle Name" class="py-0" v-model="selectedDependent.middle_name"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Last Name</p>
                                                <v-text-field  dense placeholder="Last Name" class="py-0" v-model="selectedDependent.last_name"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Relation to Principal</p>
                                                <v-text-field  dense placeholder="Relation" class="py-0" v-model="selectedDependent.relation_to_principal"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Gender</p>
                                                <v-select :items="['Male', 'Female']" dense persistent-hint v-model="selectedDependent.personal.gender" :rules="genericRule" />
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Address</p>
                                                <v-text-field dense placeholder="Address" class="py-0" v-model="selectedDependent.personal.address"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Phone No</p>
                                                <v-text-field dense placeholder="Phone" class="py-0" v-model="selectedDependent.personal.phone"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Designation</p>
                                                <v-text-field dense placeholder="Designation" class="py-0" v-model="selectedDependent.personal.designation"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Marital Status</p>
                                                <v-text-field dense placeholder="Marital Status" class="py-0" v-model="selectedDependent.personal.marital_status"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Nationality</p>
                                                <v-select :items="countryList" dense  persistent-hint class="py-0" item-text="nationality" item-value="nationality" v-model="selectedDependent.personal.nationality" :rules="genericRule"></v-select>                                                
                                            </v-col>
                                            <v-col cols="12" sm="12" md="4" class="px-12 mb-5" align="left">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Date of Birth</p>
                                                <v-menu v-model="menu0" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field dense v-model="selectedDependent.personal.dob" persistent-hint v-bind="attrs" v-on="on" :rules="genericRule"></v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="selectedDependent.personal.dob" @input="menu0 = false" no-title scrollable></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </div>
                                <!--View Dependent Info-->
                                <div class="text-left scroll" v-if="!empdetEdit" style="max-height : 700px;">
                                    <v-container>
                                        <v-row>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">First Name</h5>
                                                <p class="pb-0">{{selectedDependent.first_name}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Middle Name </h5>
                                                <p class="pb-0">{{selectedDependent.middle_name}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Last Name </h5>
                                                <p class="pb-0">{{selectedDependent.last_name}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Relation to Principal </h5>
                                                <p class="pb-0">{{selectedDependent.relation_to_principal}}</p>
                                            </v-col>

                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Gender </h5>
                                                <p class="pb-0">{{selectedDependent.personal.gender}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Address </h5>
                                                <p class="pb-0">{{selectedDependent.personal.address}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Phone No </h5>
                                                <p class="pb-0">{{selectedDependent.personal.phone}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Designation</h5>
                                                <p class="pb-0">{{selectedDependent.personal.designation}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Marital Status</h5>
                                                <p class="pb-0">{{selectedDependent.personal.marital_status}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Nationality</h5>
                                                <p class="pb-0">{{selectedDependent.personal.nationality}}</p>
                                            </v-col>
                                            <v-col cols="4">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Date of Birth</h5>
                                                <p class="pb-0">{{selectedDependent.personal.dob}}</p>
                                            </v-col>
                                        </v-row>   
                                    </v-container>
                                </div>
                            </v-tab-item>
                            <v-tab-item id="documents" class="">
                                <v-row class="pt-5">
                                    <v-col cols="12" sm="6" class="px-5 font weight-bold pt-0 text-left">
                                        <v-card-title class=" pa-0">
                                            <v-img src="/adminCentral/employment.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                            <h2 class="darkBlue-heading-text subHeadingFontSize">{{docEdit ? 'Edit' : ''}} Documents</h2>
                                            <v-spacer></v-spacer>
                                        </v-card-title>
                                    </v-col>
                                    <v-col cols="12" sm="6" class="text-right pt-0">
                                        <v-btn elevation="0" width="150px" color="#0064D7"  @click="updateDependent()" v-if="docEdit" class="white--text border-radius-medium">Update</v-btn>
                                        <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="docEdit" @click="docEdit = !docEdit">Cancel</v-btn>
                                        <v-btn color="#5C7EEF" v-else class="rounded-xl" small outlined @click="docEdit = true,onEditClick('docEdit')" >
                                            <v-img src="/profile/edit.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                        Edit</v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                                <!--View Dependent Document-->
                                <div v-if="!docEdit" class="text-left">
                                    <v-container>
                                        <v-row>
                                            <v-col cols="4" >
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Passport Number :</h5>
                                                <p class="mb-0 caption blue-grey--text font-weight-bold">{{selectedDependent.documents.passport_number}}</p>
                                            </v-col> 
                                            <v-col cols="4" v-if="selectedDependent.documents.hasOwnProperty('passport_expiry') && selectedDependent.documents.passport_expiry">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Passport Expiry Date </h5>
                                                <p class="mb-0 caption blue-grey--text font-weight-bold">{{selectedDependent.documents.passport_expiry | ticketingDateFormatter}}</p>
                                            </v-col>
                                            <v-col cols="4" >
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Emirates ID Number </h5>
                                                <p class="mb-0 caption blue-grey--text font-weight-bold">{{selectedDependent.documents.emiratesID_number}}</p>
                                            </v-col>
                                            <v-col cols="4" v-if="selectedDependent.documents.hasOwnProperty('emiratesID_expiry') && selectedDependent.documents.emiratesID_expiry">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Emirates Expiry Date </h5>
                                                <p class="mb-0 caption blue-grey--text font-weight-bold">{{selectedDependent.documents.emiratesID_expiry | ticketingDateFormatter}}</p>
                                            </v-col>
                                            <v-col cols="4" >
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Visa Number </h5>
                                                <p class="mb-0 caption blue-grey--text font-weight-bold">{{selectedDependent.documents.visa_number}}</p>
                                            </v-col>
                                            <v-col cols="4" v-if="selectedDependent.documents.hasOwnProperty('visa_expiry') && selectedDependent.documents.visa_expiry">
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Visa Expiry Date </h5>
                                                <p class="mb-0 caption blue-grey--text font-weight-bold">{{selectedDependent.documents.visa_expiry | ticketingDateFormatter}}</p>
                                            </v-col> 
                                            <v-col cols="4" >
                                                <h5 class="grey-heading-text textFontSize font-weight-medium">Visa UID Number </h5>
                                                <p class="mb-0 caption blue-grey--text font-weight-bold">{{selectedDependent.documents.visa_uid_number}}</p>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </div>
                                <!--Edit Dependent Document-->
                                <div v-if="docEdit" class="text-left editSection">
                                    <v-container>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="4"  class="py-0 px-12 mb-5">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Passport Number</p>
                                                <v-text-field dense placeholder="Passport Number" class="" v-model="selectedDependent.documents.passport_number" :rules="genericRule"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4"  class="py-0 px-12 mb-5">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Passport Expiry Date</p>
                                                <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field  dense placeholder="Passport Expiry Date" v-model="selectedDependent.documents.passport_expiry" v-bind="attrs" v-on="on" :rules="genericRule"></v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="selectedDependent.documents.passport_expiry" @input="menu2 = false" no-title scrollable></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4"  class="py-0 px-12 mb-5">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Emirates ID Number</p>
                                                <v-text-field  dense placeholder="Emirates ID Number" class="" v-model="selectedDependent.documents.emiratesID_number"  ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4" class="py-0 px-12 mb-5">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Emirates ID Expiry Date</p>
                                                <v-menu v-model="menu3" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field  dense placeholder="Emirates ID Expiry Date" v-model="selectedDependent.documents.emiratesID_expiry" v-bind="attrs" v-on="on" :rules="genericRule"></v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="selectedDependent.documents.emiratesID_expiry" @input="menu3 = false" no-title scrollable></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4"  class="py-0 px-12 mb-5">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Visa Number</p>
                                                <v-text-field  dense placeholder="Visa Number" class="" v-model="selectedDependent.documents.visa_number"  ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4"  class="py-0 px-12 mb-5">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Visa Expiry Date</p>
                                                <v-menu v-model="menu4" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field  dense placeholder="Visa Expiry Date" v-model="selectedDependent.documents.visa_expiry" v-bind="attrs" v-on="on" :rules="genericRule"></v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="selectedDependent.documents.visa_expiry" @input="menu4 = false" no-title scrollable></v-date-picker>
                                                </v-menu>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="4"  class="py-0 px-12 mb-5">
                                                <p class="mb-0 font-weight-medium textFontSize grey-heading-text">Visa UID Number</p>
                                                <v-text-field  dense placeholder="Visa Number" class="" v-model="selectedDependent.documents.visa_uid_number"  ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-container>
                                </div>
                                <v-row class="pt-5">
                                    <v-col cols="12" sm="6" class="px-5 font weight-bold pt-0 text-left">
                                        <h2 class="darkBlue-heading-text subHeadingFontSize">Upload Documents</h2>
                                    </v-col>
                                    <v-col cols="12" sm="6" class="text-right d-flex justify-end align-center">
                                        <v-btn small outlined dense color="red" class="text-right mr-3 rounded-xl" @click="dialog_delete_attachments = true" :disabled="selectedDependent.attachments && !selectedDependent.attachments.length > 0">Delete Documents</v-btn>
                                        <v-btn color="#5C7EEF" class="rounded-xl" small outlined @click="uploadNewDocument = !uploadNewDocument;" v-if="!uploadNewDocument">Upload</v-btn>
                                        <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="uploadNewDocument" @click="uploadNewDocument = false">Cancel</v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                                <v-card flat class="col-12 px-3 pt-5 rounded-xl scroll" min-height="360" max-height="360">
                                    <v-row>
                                        <v-col cols="12" sm="12" md="12" lg="12" v-if="!uploadNewDocument">
                                            <div v-if="selectedDependent.attachments && selectedDependent.attachments.length > 0">
                                                <v-row>
                                                    <v-col cols="12">
                                                        <v-data-table :headers="document_headers" disable-pagination :items="selectedDependent.attachments" hide-default-footer style="border-radius: 20px !important">
                                                            <template v-slot:item="{ item, index }">
                                                                <tr>
                                                                    <td class="font-weight-medium subHeadingFontSize mb-0">{{ item.documentType.toUpperCase() }}</td>
                                                                    <td class="font-weight-medium subHeadingFontSize mb-0" v-if="item.link != ''">
                                                                        <v-btn color="primary" small class="rounded-xl" outlined @click="openAttachments(item.link)">
                                                                            <v-icon small>mdi-file-document-outline</v-icon>{{item.documentType}}
                                                                        </v-btn>
                                                                    </td>
                                                                    <td class="font-weight-medium subHeadingFontSize mb-0">{{ getDocumentNumber(item.documentType) }}</td>
                                                                    <td class="font-weight-medium subHeadingFontSize mb-0">{{ getDocumentExpiry(item.documentType) | ticketingDateFormatter }}</td>
                                                                </tr>
                                                            </template>
                                                        </v-data-table>
                                                    </v-col>
                                                </v-row>
                                            </div>
                                            <div v-else>
                                                <h3 class="px-3">There are no Attachments to display</h3>
                                            </div>
                                        </v-col>
                                        <v-col cols="12" sm="12" lg="12" class="py-0 pt-0" v-if="uploadNewDocument">
                                            <v-row class="pt-4 pl-4 pr-4">
                                                <v-col cols="6" sm="6" md="6" lg="6" class="py-0 pt-0 text-center">
                                                    <p class="mb-0 caption blue-grey--text font-weight-bold">Passport</p>
                                                    <div v-if="!passportfile">
                                                        <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                                            <div class="dropZone-info" @drag="onPassportFile">
                                                                <span class="fa fa-cloud-upload dropZone-title"></span>
                                                                <span class="dropZone-title">Drop file or click to upload</span>
                                                                <div class="dropZone-upload-limit-info">
                                                                    <div>maximum file size: 10 MB</div>
                                                                </div>
                                                            </div>
                                                            <input type="file" @change="onPassportFile" multiple>
                                                        </div>
                                                    </div>
                                                    <div v-else class="dropZone-uploaded">
                                                        <div class="dropZone-uploaded-info">
                                                        <span class="dropZone-title">Added</span>
                                                        <button type="button" class="btn btn-primary removeFile" @click="removeFile('passport')">Remove File</button>
                                                        </div>
                                                    </div>
                                                </v-col>
                                                <v-col cols="6" sm="6" md="6" lg="6" class="py-0 pt-0 text-center">
                                                    <p class="mb-0 caption blue-grey--text font-weight-bold">Emirates ID</p>
                                                    <div v-if="!emiratesfile">
                                                        <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                                            <div class="dropZone-info" @drag="onEmiratesIDFile">
                                                                <span class="fa fa-cloud-upload dropZone-title"></span>
                                                                <span class="dropZone-title">Drop file or click to upload</span>
                                                                <div class="dropZone-upload-limit-info">
                                                                    <div>maximum file size: 10 MB</div>
                                                                </div>
                                                            </div>
                                                            <input type="file" @change="onEmiratesIDFile" multiple>
                                                        </div>
                                                    </div>
                                                    <div v-else class="dropZone-uploaded">
                                                        <div class="dropZone-uploaded-info">
                                                        <span class="dropZone-title">Added</span>
                                                        <button type="button" class="btn btn-primary removeFile" @click="removeFile('emiratesID')">Remove File</button>
                                                        </div>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <v-row class="pl-4 pr-4">
                                                <v-col cols="6" sm="6" md="6" lg="6" class="py-0 pt-0 text-center">
                                                    <p class="mb-0 caption blue-grey--text font-weight-bold">Visa</p>
                                                    <div v-if="!visafile">
                                                        <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                                            <div class="dropZone-info" @drag="onVisaFile">
                                                                <span class="fa fa-cloud-upload dropZone-title"></span>
                                                                <span class="dropZone-title">Drop file or click to upload</span>
                                                                <div class="dropZone-upload-limit-info">
                                                                    <div>maximum file size: 10 MB</div>
                                                                </div>
                                                            </div>
                                                            <input type="file" @change="onVisaFile" multiple>
                                                        </div>
                                                    </div>
                                                    <div v-else class="dropZone-uploaded">
                                                        <div class="dropZone-uploaded-info">
                                                        <span class="dropZone-title">Added</span>
                                                        <button type="button" class="btn btn-primary removeFile" @click="removeFile('visa')">Remove File</button>
                                                        </div>
                                                    </div>
                                                </v-col>
                                                <v-col cols="6" sm="6" md="6" lg="6" class="py-0 pt-0 text-center">
                                                    <p class="mb-0 caption blue-grey--text font-weight-bold">Other Documents</p>
                                                    <div v-if="!otherfile">
                                                        <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                                            <div class="dropZone-info" @drag="onOtherDocsFile">
                                                                <span class="fa fa-cloud-upload dropZone-title"></span>
                                                                <span class="dropZone-title">Drop file or click to upload</span>
                                                                <div class="dropZone-upload-limit-info">
                                                                    <div>maximum file size: 10 MB</div>
                                                                </div>
                                                            </div>
                                                            <input type="file" @change="onOtherDocsFile" multiple>
                                                        </div>
                                                    </div>
                                                    <div v-else class="dropZone-uploaded">
                                                        <div class="dropZone-uploaded-info">
                                                        <span class="dropZone-title">Added</span>
                                                        <button type="button" class="btn btn-primary removeFile" @click="removeFile('otherDocs')">Remove File</button>
                                                        </div>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <v-row class="pl-4 pr-4">
                                                <v-col cols="6" sm="6" md="6" lg="6" class="py-0 pt-0 text-center" v-if="computedCheckAge">
                                                    <p class="mb-0 caption blue-grey--text font-weight-bold">School/College ID</p>
                                                    <div v-if="!educationfile">
                                                        <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                                            <div class="dropZone-info" @drag="onEducationFile">
                                                                <span class="fa fa-cloud-upload dropZone-title"></span>
                                                                <span class="dropZone-title">Drop file or click to upload</span>
                                                                <div class="dropZone-upload-limit-info">
                                                                    <div>maximum file size: 10 MB</div>
                                                                </div>
                                                            </div>
                                                            <input type="file" @change="onEducationFile" multiple>
                                                        </div>
                                                    </div>
                                                    <div v-else class="dropZone-uploaded">
                                                        <div class="dropZone-uploaded-info">
                                                        <span class="dropZone-title">Added</span>
                                                        <button type="button" class="btn btn-primary removeFile" @click="removeFile('educationIdentity')">Remove File</button>
                                                        </div>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <v-row class="pa-4">
                                                <v-col class="text-right pt-0">
                                                    <v-btn  class="primary white--text" v-if="!uploading" @click.once.prevent="attachFile()">Upload</v-btn>
                                                    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-tab-item>
                            <v-tab-item id="insurance" class="">
                                <v-row class="pt-5">
                                    <v-col cols="12" sm="4" class="px-5 font weight-bold pt-0 text-left">
                                        <v-card-title class=" pa-0">
                                            <v-img src="/adminCentral/employees.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                            <h2 class="darkBlue-heading-text subHeadingFontSize">Insurance Details</h2>
                                            <v-spacer></v-spacer>
                                        </v-card-title>
                                    </v-col>
                                    <v-col cols="12" sm="8" class="text-right pt-0">
                                        <v-tooltip top color="grey" v-if="parent_company_id == '62fb3df39f14e35fe7ed9c9a' && userInsuranceDetails && userInsuranceDetails.length > 0 && userInsuranceDetails[0].update_flag">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn color="#5C7EEF" class="mr-2 rounded-xl" small outlined v-bind="attrs" v-on="on">
                                                    <v-img src="/adminCentral/add.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Upgrade Insurance
                                                </v-btn>
                                            </template>
                                            Please Contact Insurance Broker for Upgrade Request As Your Plan Has Already Been Updated Once.
                                        </v-tooltip>
                                        <!--&& calculateNoOfDays(userInsuranceDetails[0].start_date.toString().slice(0,10)) > 90 && calculateNoOfDays(userInsuranceDetails[0].user_start_date.toString().slice(0,10)) > 90-->
                                        <v-btn color="#5C7EEF" class="mr-2 rounded-xl" small outlined @click="upgradeDialogOpen = true" v-else-if="parent_company_id == '62fb3df39f14e35fe7ed9c9a' && userInsuranceDetails && userInsuranceDetails.length > 0">
                                            <v-img src="/adminCentral/add.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Upgrade Insurance
                                        </v-btn>
                                        <v-btn color="#ff4d4d" class="mr-2 rounded-xl" @click="dialogDeleteRequest = true;" small outlined v-if="userInsuranceDetails && userInsuranceDetails.length > 0">
                                            <v-img src="/client/inactive.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Cancel Insurance
                                        </v-btn>
                                        <v-btn color="#5C7EEF" class="mr-2 rounded-xl" @click="insuranceAdditionFlag = true" small outlined v-else>
                                            <v-img src="/adminCentral/add.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>Add Insurance
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                                <v-row>
                                    <v-col cols="8" class="mx-auto">
                                        <v-card class="borderRadiusCards pa-6 mt-6" style="box-shadow: 0px 24px 30px #959EA51A;background-image:url('/profile/insurance_background.svg');background-size:cover;position:relative" min-height="240" color="#99C8FE" v-if="userInsuranceDetails && userInsuranceDetails.length > 0">
                                                <v-row>
                                                    <v-col cols="2" class="pa-0" style="position:absolute;top:10%;z-index: 2;right:5%">
                                                        <v-img :src="userInsuranceDetails[0].logo"  max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                                    </v-col>
                                                </v-row>
                                                <v-row :style="{ 'margin-top': '3.75rem' }">
                                                    <v-col cols="6">
                                                        <v-card-text class="py-0 pl-1 mb-3">
                                                            <p class="white--text mb-0">Network Name</p>
                                                            <p class="darkBlue-heading-text mb-0">{{ userInsuranceDetails[0].network }}</p>
                                                        </v-card-text>
                                                    </v-col>
                                                    <v-col cols="6">
                                                        <v-card-text class="py-0 pl-1">
                                                            <p class="white--text mb-0">Expiry Date</p>
                                                            <p class="darkBlue-heading-text mb-0">{{ userInsuranceDetails[0].expiry_date | textDate}}</p>
                                                        </v-card-text>
                                                    </v-col>
                                                </v-row>
                                                <v-row class="px-4 pl-1">
                                                    <v-col cols="auto" class="py-0">
                                                        <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="userInsuranceDetails[0].attachments && userInsuranceDetails[0].attachments.length > 0 ">
                                                            <v-btn elevation="0" small :href="userInsuranceDetails[0].attachments.filter((a) => a.documentType == 'ecard')[0].link" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">E-Card</v-btn>
                                                        </v-btn>
                                                    </v-col>
                                                    <v-col cols="auto" class="py-0">
                                                        <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="userInsuranceDetails[0].tob">
                                                            <v-btn elevation="0" small :href="userInsuranceDetails[0].tob" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Coverage</v-btn>
                                                        </v-btn>
                                                    </v-col>
                                                    <v-col cols="auto" class="py-0">
                                                        <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="userInsuranceDetails[0].networklist">
                                                            <v-btn elevation="0" small :href="userInsuranceDetails[0].networklist" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Network</v-btn>
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                        </v-card>
                                        <v-card class="borderRadiusCards  pa-6 mt-6" style="box-shadow: 0px  24px 30px #959EA51A;background-image:url('/profile/insurance_background.svg');background-size:cover;position:relative" min-height="240" color="#99C8FE" v-else>
                                            <!---if="employee.hasOwnProperty('insurance')"-->
                                            <v-row>
                                                <v-spacer></v-spacer>
                                                <v-col cols="2" class="pa-0" style="position:absolute;top:10%;z-index: 2;right:5%">
                                                    <v-img src="/profile/lorem.png"  max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
                                                </v-col>
                                            </v-row>
                                            <v-row :style="{ 'margin-top': '3.75rem' }">
                                                <v-col cols="6">
                                                    <v-card-text class="py-0 pl-1 mb-3">
                                                        <p class="white--text mb-0">Network Name</p>
                                                        <p class="darkBlue-heading-text mb-0" v-if="selectedDependent.hasOwnProperty('insurance') && selectedDependent.insurance && selectedDependent.insurance.network_name">{{selectedDependent.insurance.network_name}}</p>
                                                    </v-card-text>
                                                </v-col>
                                                <v-col cols="6">
                                                    <v-card-text class="py-0 pl-1">
                                                        <p class="white--text mb-0">Expiry Date</p>
                                                        <p class="darkBlue-heading-text mb-0" v-if="selectedDependent.hasOwnProperty('insurance') && selectedDependent.insurance && selectedDependent.insurance.expiry_date">{{selectedDependent.insurance.expiry_date | textDate}}</p>
                                                    </v-card-text>
                                                </v-col>
                                            </v-row>
                                            <v-row class="px-4 pl-1">
                                                <v-col cols="auto" class="py-0">
                                                    <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="selectedDependent.hasOwnProperty('insurance') && selectedDependent.insurance && selectedDependent.insurance.insurance_card">
                                                        <v-btn elevation="0" small :href="selectedDependent.insurance && selectedDependent.insurance.insurance_card" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">E-Card</v-btn>
                                                        <!-- <v-card-text style="font-size:13px;color:#0064D7" class="py-0">E-card</v-card-text > -->
                                                    </v-btn>
                                                </v-col>
                                                <v-col cols="auto" class="py-0">
                                                    <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="selectedDependent.hasOwnProperty('insurance') && selectedDependent.insurance && selectedDependent.insurance.coverage_list">
                                                        <v-btn elevation="0" small :href="selectedDependent.insurance && selectedDependent.insurance.coverage_list" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Coverage</v-btn>
                                                    </v-btn>
                                                </v-col>
                                                <v-col cols="auto" class="py-0">
                                                    <v-btn class="rounded-lg pa-0" color="#C7DFFF" elevation="0" v-if="selectedDependent.hasOwnProperty('insurance') && selectedDependent.insurance && selectedDependent.insurance.network_list">
                                                        <v-btn elevation="0" small :href="selectedDependent.insurance && selectedDependent.insurance.network_list" target="_blank" text style="font-size:13px;color:#0064D7" class="fontWeight400">Network</v-btn>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-tab-item>
                        </v-tabs-items>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <v-dialog v-model="insuranceAdditionFlag" max-width="1000" min-width='1000' max-height="900" style="overflow-x : hidden;">
            <InsuranceAddition :employee="selectedDependent" :principal_type="'Dependent'" :parent_company_id="parent_company_id" :parent_company="parent_company" :legal_entity="legal_entity" @close="closeInsuranceAddition" @add="addInsuranceRequest" v-if="insuranceAdditionFlag"/>
        </v-dialog>

        <v-dialog v-model="dialogDeleteRequest" max-width="720" max-height="350px" style="overflow-x : hidden;">
            <InsuranceCancellation :employee="selectedDependent" :principal_type="'Dependent'" :parent_company_id="parent_company_id" :userInsuranceDetails="userInsuranceDetails" :parent_company="parent_company" @close="closeInsuranceCancellation" v-if="dialogDeleteRequest"/>
        </v-dialog>

        <v-dialog v-model="upgradeDialogOpen" max-width="1000" min-width='1000' max-height="1000px" style="overflow-x : hidden;">
            <InsuranceUpgradation :employee="selectedDependent" :principal_type="'Dependent'" :parent_company_id="parent_company_id" :dependentList="[]" :userInsuranceDetails="userInsuranceDetails" :parent_company="parent_company" :clonedDependentList="[]" @close="closeInsuranceUpgradation" v-if="upgradeDialogOpen" />
        </v-dialog>

        <!--Delete Attachments-->
        <v-dialog v-model="dialog_delete_attachments" max-width="600">
            <v-card style="box-shadow: 0px 24px 30px #959EA51A;overflow-x: hidden" class="borderRadiusCards px-0">
                <v-card-title class=" px-6">
                    <v-row>
                        <v-col class="py-0">
                            <span>Delete Attachments</span>
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-img @click="dialog_delete_attachments = false" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
                    </v-row>
                </v-card-title>
                <v-divider class=""></v-divider>
                <v-list two-line v-if="selectedDependent.attachments && selectedDependent.attachments.length > 0" class="scroll py-0" style="max-height:500px;">
                    <v-list-item-group v-model="selected" active-class="primary--text" multiple>
                        <template v-for="(item, index) in selectedDependent.attachments">
                            <v-list-item :key="item._id">
                                <template v-slot:default="{ active }">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.filename }}</v-list-item-title>
                                        <v-list-item-title class="fontSize1">- {{ item.time | requestsDateFormat }} ({{ item.documentType }} ) </v-list-item-title>
                                    </v-list-item-content>
                                    <v-list-item-action>
                                        <v-icon v-if="!active" color="grey lighten-1">mdi-checkbox-marked-circle-outline</v-icon>
                                        <v-icon v-else color="primary darken-3">mdi-checkbox-marked-circle</v-icon>
                                    </v-list-item-action>
                                </template>
                            </v-list-item>
                            <v-divider v-if="index < selectedDependent.attachments.length" :key="index"></v-divider>
                        </template>
                    </v-list-item-group>
                </v-list>
                <v-row>
                    <v-col class="text-right pr-4 my-3">
                        <v-btn class="mr-3" small outlined color="red darken-2" :disabled="selected.length == 0" @click.prevent="deleteAttachments(selected)">Delete</v-btn>
                        <p class="mb-0 font-weight-bold caption blue-grey--text text-right"><span class="red--text">*</span>
                            <span>This action is irreversible.</span>
                        </p>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>

        <!-- Snack -->
        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}
            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
<script>
    import countries from "countries-list";
    import AdditionForm from '@/components/Insurance/additionform.vue'
    import InsuranceAddition from "@/components/Insurance/insuranceAddition.vue";
    import InsuranceCancellation from "@/components/Insurance/insuranceCancellation.vue";
    import InsuranceUpgradation from "@/components/Insurance/insuranceUpgradation.vue";

    export default {
        props: ['employee', 'parent_company','parent_company_id', 'legal_entity' ],
        components: {countries,AdditionForm,InsuranceAddition,InsuranceCancellation,InsuranceUpgradation},
        data(){
            return {
                emp_cards: true,
                addUserFlag: false,
                snack: false,
                snackColor:'',
                snackText:'',
                dependents: [],
                selectedDependent: {
                    personal: {},
                    documents:{},
                    attachments:[],
                },
                model_select_list: 0,
                tab:'',
                empdetEdit:false,
                docEdit: false,
                genericRule: [
                    v => !!v || 'This field is Required'
                ],
                menu0: false,
                menu2: false,
                menu3: false,
                menu4: false,
                userInsuranceDetails: [],
                dialogDeleteRequest:false,
                insuranceAdditionFlag:false,
                upgradeDialogOpen: false,
                dialog_delete_attachments: false,
                uploadNewDocument: false,
                document_headers: [
                    { text: 'Name', value: 'document_name' },
                    { text: 'File', value: 'link' },
                    { text: 'Document Number', value: 'document_number' },
                    { text: 'Expiry Date', value: 'expiry_date' },
                ],
                educationfile: '',
                passportfile:'',
                emiratesfile:'',
                visafile:'',
                otherfile:'',
                dragging: false,
                uploading:false,
                attachFiles:{
                    passport:{},
                    passportSizePhoto:{},
                    academicCertificate:{},
                    emiratesID:{},
                    molID:{},
                    visa:{},
                    offerLetter:{},
                    medical:{},
                    otherDocs:{},
                    educationIdentity: {}
                },
                filename_attach: [],
                uploadFiles:'',
                link_filename:'',
                link_url:'',
                uploadEducationDoc: false,
                selected: [],
                dependentsLoading: false,
            }
        },
        async mounted(){
            await this.getDependents(this.employee._id)
        },
        methods: {
            closeInsuranceAddition(event){
                this.insuranceAdditionFlag = false
            },
            addInsuranceRequest(event){
                this.insuranceAdditionFlag = false
                this.snack = true
                this.snackColor = 'success'
                this.snackText = 'Insurance request successfully created'
            },
            closeInsuranceCancellation(event){
                if(event == 'Already Request Is Existing') {
                    this.dialogDeleteRequest = false
                    this.snack = true
                    this.snackColor = 'error'
                    this.snackText = 'Already Request Is Existing'
                } else if(event == 'Insurance Delete request successfully created') {
                    this.dialogDeleteRequest = false
                    this.snack = true
                    this.snackColor = 'success'
                    this.snackText = 'Insurance Delete request successfully created'
                } else if(event == 'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !') {
                    this.dialogDeleteRequest = false
                    this.snack = true
                    this.snackColor = 'error'
                    this.snackText = 'Respective Dependents Is Not Existing in any Insurance Yearly Cycle. Kindly Contact With Respective Insurance Broker !'
                }
                else {
                    this.dialogDeleteRequest = false
                }
            },
            closeInsuranceUpgradation(event) {
                if(event == 'Upgrade Request Has Been Successfully Created.'){
                    this.upgradeDialogOpen = false
                    this.snack = true
                    this.snackColor = 'primary'
                    this.snackText = 'Upgrade Request Has Been Successfully Created.'
                }else {
                    this.upgradeDialogOpen = false
                }
            },
            calculateNoOfDays(dateString){
                const currentDate = new Date();
                const inputDate = new Date(dateString);
                const oneDay = 24 * 60 * 60 * 1000; // number of milliseconds in one day

                // Calculate the difference in days between the input date and the current date
                const diffDays = Math.round(Math.abs((currentDate - inputDate) / oneDay));

                return diffDays;
            },
            async getInsurance(user){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token)
                
                this.userInsuranceDetails = []
                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/cycles/external/getdetails', { "user_id": user._id, 'parent_company': this.parent_company}, { headers: { Authorization: AuthStr } } )
                .then((res) => {
                    this.userInsuranceDetails = res
                }).catch((error) => {
                    this.userInsuranceDetails = [];
                });
            },
            async confirmDependentAddition(){
                this.snack = true
                this.snackColor = 'success'
                this.snackText = 'Dependent added Successfully'
                await this.getDependents(this.employee._id)
                this.addUserFlag = false
            },
            async getDependents(principal_id){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token)

                this.dependentsLoading = true

                let obj = {
                    'parent_company': this.parent_company,
                    'principal_id': this.employee._id,
                    'parent_company_id': this.parent_company_id
                }

                await this.$axios.$post(process.env.insurancePortalUrl+ 'insuranceaddition/getdependents', obj, { headers: { Authorization: AuthStr } } )
                .then((res) => {
                    this.dependents = res
                    this.dependentsLoading = false
                })
            },
            getFullName(user){
                if(!user){
                    return ''
                }
                else{
                    return user.first_name + " " + user.last_name
                }
            },
            getImage(val){
                let image = 'https://nathanhroperations.s3.amazonaws.com/profile_pics/Sahiba_T/avatar-7.png'
                if(val.hasOwnProperty('image_url') && val.image_url != ''){
                    return val.image_url
                }
                return image
            },
            onEditClick(val){
                if(val != 'empdetEdit')this.empdetEdit = false
                if(val != 'docEdit')this.docEdit = false
            },
            async updateDependent(){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token)

                let obj = {
                    'dependent': this.selectedDependent,
                    'parent_company': this.parent_company
                }

                await this.$axios.post(process.env.insurancePortalUrl+'insuranceaddition/updatedependents', obj)
                .then(async (res) => {
                    this.snack = true
                    this.snackColor = 'success'
                    this.snackText = 'Dependent Details Updated Successfully'
                    // this.emp_cards = true
                    this.empdetEdit = false
                    this.docEdit = false
                    await this.getDependentDetails(this.selectedDependent)
                })
            },
            onPassportFile(event) {
                this.onChange(event, 'passport')
                this.attachFiles.passport = this.uploadFiles;;
            },
            onEducationFile(event) {
                this.onChange(event, 'educationIdentity')
                this.attachFiles.educationIdentity = this.uploadFiles;;
            },
            onEmiratesIDFile(event) {
                this.onChange(event, 'emiratesID')
                this.attachFiles.emiratesID = this.uploadFiles;
            },
            onVisaFile(event) {
                this.onChange(event, 'visa')
                this.attachFiles.visa = this.uploadFiles;
            },
            onOtherDocsFile(event){
                this.onChange(event, 'otherDocs')
                this.attachFiles.otherDocs= this.uploadFiles;
            },
            onChange(e,type) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length) {
                    this.dragging = false;
                    return;
                }
                this.createFile(e, files,type);
            },
            createFile(e,file,type) {
                if (file.size > 10000000) {
                    alert('please check file size is not more than 10 MB.')
                    this.dragging = false;
                    return;
                }
                this.onUploadFiles(file)
                if (type == 'otherDocs') this.otherfile = file;
                if (type == 'visa') this.visafile = file;
                // if (type == 'passportSizePhoto') this.passportphotofile = file;
                // if (type == 'academicCertificate') this.academicfile = file;
                if (type == 'emiratesID') this.emiratesfile = file;
                if (type == 'passport') this.passportfile = file;
                if (type == 'educationIdentity') this.educationfile = file;
                this.dragging = false;
            },
            onUploadFiles(event) {
                this.uploadFiles = event;
                this.dragging = false;
                for(let i=0;i< this.uploadFiles.length; i++){
                    this.filename_attach.push(event[i].name)
                }
            },
            removeFile(val) {
                if (val == 'otherDocs') this.otherfile = '';
                if (val == 'visa') this.visafile = '';
                // if (val == 'passportSizePhoto') this.passportphotofile = '';
                // if (val == 'academicCertificate') this.academicfile = '';
                if (val == 'emiratesID') this.emiratesfile = '';
                if (val == 'passport') this.passportfile = '';
                if(val == 'educationIdentity') this.educationfile = '';
            },
            async uploadImage(val) {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
                const fd = new FormData();
                fd.append('a',val.file,val.name)
                fd.append('folder','users/'+this.selectedDependent.first_name + ' '+ this.selectedDependent.last_name)
                await this.$axios.$post("/users/upload-files", fd, {headers: { Authorization: AuthStr }})
                .then(res => {
                    this.link_url = res.url
                    this.link_filename = res.name
                })
                .catch();
            },
            async attachFile() {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
                this.uploading = true
                for (var key in this.attachFiles) {
                    if (!_.isEmpty(this.attachFiles[key])) {
                        for(let i=0;i< this.attachFiles[key].length; i++){
                            if(this.attachFiles[key][i].name != undefined){
                                let upload_meta = {
                                    file: this.attachFiles[key][i],
                                    filename: this.attachFiles[key][i].name
                                }
                                await this.uploadImage(upload_meta)
                                let attach = {
                                    link:this.link_url,
                                    filename:this.link_filename,
                                    created_by: this.selectedDependent._id,
                                    time: new Date(),
                                    documentType: key
                                }
                                this.selectedDependent.attachments.push(attach)
                                if(key == 'educationIdentity') {
                                    this.uploadEducationDoc = false
                                }
                            }
                            else{
                                console.log('null')
                            }
                        }
                    }
                }
                let obj = {
                    'dependent': this.selectedDependent,
                    'parent_company': this.parent_company
                }
                await this.$axios.$post(process.env.insurancePortalUrl+'insuranceaddition/updatedependents', obj)
                .then(async (res) => {
                    this.uploading = false
                    this.snack = true
                    this.snackColor= 'success'
                    this.snackText = 'Attachments Uploaded Successfully'
                    this.uploadNewDocument = !this.uploadNewDocument
                    // this.emp_cards = true
                    await this.getDependentDetails(this.selectedDependent)
                    this.educationfile = ''
                    this.passportfile = ''
                    this.emiratesfile = ''
                    this.visafile = ''
                    this.otherfile = ''
                    this.link_filename = ''
                    this.link_url = ''
                })
            },
            async getDependentDetails(data){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token)
                let obj = {
                    'parent_company': this.parent_company
                }
                await this.$axios.$post(process.env.insurancePortalUrl+'insuranceaddition/getdependentdetails/'+data._id, obj)
                .then((res) => {
                    this.selectedDependent = res[0]
                    this.selectedDependent.parent_company = this.parent_company
                    this.selectedDependent.parent_company_id = this.parent_company_id
                    // this.getDocuments(this.selectedDependent)
                })
            },
            async deleteAttachments(selected){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token)
                this.selectedDependent.attachments = this.selectedDependent.attachments.filter(function (value, index) {
                    return selected.indexOf(index) == -1;
                })
                let obj = {
                    'dependent': this.selectedDependent,
                    'parent_company': this.parent_company
                }
                await this.$axios.$post(process.env.insurancePortalUrl+'insuranceaddition/updatedependents', obj)
                .then(async (res) => {
                    this.dialog_delete_attachments = false
                    // this.emp_cards = true
                    this.snack = true
                    this.snackColor= 'success'
                    this.snackText = 'Attachments Deleted Successfully'
                    this.selected = []
                    await this.getDependentDetails(this.selectedDependent)
                })
            },
            openAttachments(fileUrl) {
                window.open(fileUrl)
            },
            calculateAge(birthDate) {
                const birthDateObj = new Date(birthDate);
                const currentDate = new Date();
                const yearsDiff = currentDate.getFullYear() - birthDateObj.getFullYear();
                const monthsDiff = currentDate.getMonth() - birthDateObj.getMonth();
                const daysDiff = currentDate.getDate() - birthDateObj.getDate();
                // Check if the birth date for the current year has already occurred
                if (monthsDiff < 0 || (monthsDiff === 0 && daysDiff < 0)) {
                    return yearsDiff - 1;
                } else {
                    return yearsDiff;
                }
            },
            getDocumentNumber(type){
                if(type == 'passport'){
                    return this.selectedDependent.documents.passport_number
                }else if(type == 'emiratesID'){
                    return this.selectedDependent.documents.emiratesID_number
                } else if(type == 'visa'){
                    return this.selectedDependent.documents.visa_uid_number
                } else return '---'
            },
            getDocumentExpiry(type){
                if(type == 'passport'){
                    return this.selectedDependent.documents.passport_expiry
                }else if(type == 'emiratesID'){
                    return this.selectedDependent.documents.emirates_expiry
                } else if(type == 'visa'){
                    return this.selectedDependent.documents.visa_expiry
                } else return '---'
            },
        },
        computed:{
            computedCheckAge(){
                if(this.selectedDependent.relation_to_principal == 'Child' && this.selectedDependent.personal.dob != ''){
                    const age = this.calculateAge(this.selectedDependent.personal.dob)
                    if(age >= 18 && age <= 21){
                        this.snack = true
                        this.snackColor = 'secondary'
                        this.snackText = 'Kindly attach School/College ID as an attachment'
                        return this.uploadEducationDoc = true
                    }
                    else if(age > 21){
                        this.snack = true
                        this.snackColor = 'error'
                        this.snackText = 'This dependent is not eligible for insurance as age is greater than 21 years'
                        return this.uploadEducationDoc = true
                    } else {
                        this.uploadEducationDoc = false
                    }
                } else {
                    this.uploadEducationDoc = false
                }
            },
            countryList(){
                const countryCodes = Object.keys(countries.countries);
                const countryNames = countryCodes.map(code => countries.countries[code].name);
                return countryNames;
            },
        }
    }
</script>