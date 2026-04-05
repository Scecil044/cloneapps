<template>
    <div>
        <v-card class="pa-0 rounded-xl" :height="this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.md || this.$vuetify.breakpoint.lg ? '580px':'830px'" style="overflow-x: hidden;">
            <v-card-title class="pa-6">
                <h2 class="headline font-weight-light grey-heading-text">NEW <span class="font-weight-bold">&nbsp;APPLICATION</span> FORM</h2>
                <v-spacer></v-spacer>
                <v-img @click="close()" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
            </v-card-title>
            <v-card-text>
                <v-row class="">
                    <v-col cols="12">
                        <v-form ref="form">
                            <v-row >
                                <v-col class="mb-5 px-12 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Beneficiary Name (As per Passport)<span class="red--text">&ast;</span></div>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-text-field dense placeholder="First Name" v-model="users.first_name" :rules="genericRule"></v-text-field>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-text-field dense placeholder="Middle Name" v-model="users.middle_name"></v-text-field>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-text-field dense placeholder="Last Name" v-model="users.last_name" :rules="genericRule"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row class="pt-3">
                                <v-col class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text" cols="4">
                                    <div dense>Legal Entity<span class="red--text">&ast;</span></div>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text" cols="4">
                                    <div dense>Date of Birth<span class="red--text">&ast;</span></div>
                                </v-col>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Gender</div>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="12" md="4" class="py-0 px-12 mb-5">
                                    <v-select :items="legal_entity"  item-text="name" item-value="value" dense placeholder="Select Legal Entity" v-model="users.legal_entity" :rules="genericRule"></v-select>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Date of Birth" dense v-model="users.personal.dob" v-bind="attrs" v-on="on" :rules="genericRule"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.personal.dob" @input="menu2 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-select :items="gender" item-text="name" item-value="value" dense placeholder="Select Gender" v-model="users.personal.gender"></v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Marital Status<span class="red--text">&ast;</span></div>
                                </v-col>
                                <v-col v-if="users.principal_type != 'principal'" cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Relation</div>
                                </v-col>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Nationality<span class="red--text">&ast;</span></div>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-select :items="marital_status"  item-text="name"  item-value="value" dense placeholder="Select Marital Status" v-model="users.personal.marital_status" :rules="genericRule"></v-select>
                                </v-col>
                                <v-col v-if="users.principal_type != 'principal'" class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-select :items="sortedArray" item-text="name"  item-value="value" dense placeholder="Select Relation" v-model="users.relation_to_principal" :rules="genericRule"></v-select>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-select :items="countryList" item-text="nationality" item-value="nationality" dense placeholder="Select Nationality" v-model="users.personal.nationality" :rules="genericRule"></v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Passport Number<span class="red--text">&ast;</span></div>
                                </v-col>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Passport Expiry Date</div>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text" cols="4">
                                    <div dense>Emirates ID<span class="red--text">&ast;</span>
                                        <v-tooltip top>
                                            <template v-slot:activator = "{ on: attrs }">
                                                <v-icon v-on="{...attrs}" >mdi-information</v-icon>
                                            </template>
                                            <span>For Example: </span><br>
                                            <span>Emirates ID Number: 784-XXXX-XXXXXXX-X</span><br>
                                            <span>Application Number: 21 Digits 800XXXXXXXXXXXXXXXXXX</span>
                                        </v-tooltip>
                                    </div>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-text-field dense placeholder="Enter Your Passport Number" :maxlength="10" v-model="users.documents.passport_number" :rules="genericRule"></v-text-field>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-menu v-model="menu3" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Date of Expiry" dense v-model="users.documents.passport_expiry" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.documents.passport_expiry" @input="menu3 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" sm="12" md="4" class="py-0 px-12 mb-5">
                                    <v-text-field dense placeholder="Enter Your Emirates ID" :maxlength="30" v-model="users.documents.emiratesID_number" :rules="genericRule"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text" cols="4">
                                    <div dense>Emirates Expiry</div>
                                </v-col>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Visa UID Number<span class="red--text">&ast;</span>
                                        <v-tooltip top>
                                            <template v-slot:activator = "{ on: attrs }">
                                                <v-icon v-on="{...attrs}" >mdi-information</v-icon>
                                            </template>
                                            <span>For Example: </span><br>
                                            <span>Visa UID Number: XXXXXXXXX</span>
                                        </v-tooltip>
                                    </div>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text" cols="4">
                                    <div dense>Visa File Number<span class="red--text">&ast;</span>
                                        <v-tooltip top>
                                            <template v-slot:activator = "{ on: attrs }">
                                                <v-icon v-on="{...attrs}" >mdi-information</v-icon>
                                            </template>
                                            <span>For Example: </span><br>
                                            <span>Visa File Number: 201/XXXX/XXXXXXX</span>
                                        </v-tooltip>
                                    </div>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-menu v-model="menu4" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Date of Expiry" dense v-model="users.documents.emirates_expiry" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.documents.emirates_expiry" @input="menu4 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-text-field dense placeholder="Enter Your UID" :maxlength="30" v-model="users.documents.visa_uid_number" :rules="genericRule"></v-text-field>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-text-field dense placeholder="Enter Your File Number" :maxlength="50" v-model="users.documents.file_number" :rules="genericRule"></v-text-field>
                                </v-col>
                            </v-row>



                            <v-row>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Visa Expiry</div>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-menu v-model="menu5" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Date of Expiry" dense v-model="users.documents.visa_expiry" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.documents.visa_expiry" @input="menu5 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>









                            <!--Dubai Logic-->
                            <v-row v-if="parent_company_id == '62fb3df39f14e35fe7ed9c9a'">
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Current Status</div>
                                </v-col>
                                <v-col cols="4" v-if="users.onboarding.user_location == 'Inside UAE'" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Visa Status Change Date</div>
                                </v-col>
                                <v-col cols="4" v-if="users.onboarding.user_location == 'Outside UAE'" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Visa Entry</div>
                                </v-col>
                            </v-row>
                            <v-row v-if="parent_company_id == '62fb3df39f14e35fe7ed9c9a'">
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-select dense :items="['Inside UAE','Outside UAE']" v-model="users.onboarding.user_location"></v-select>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" v-if="users.onboarding.user_location == 'Inside UAE'">
                                    <v-menu v-model="menu6" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Visa Change Status" dense v-model="users.documents.visa_change_status_date" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.documents.visa_change_status_date" @input="menu6 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" v-if="users.onboarding.user_location == 'Outside UAE'">
                                    <v-menu v-model="menu7" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Date of Visa Entry" dense v-model="users.documents.visa_entry_date" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.documents.visa_entry_date" @input="menu7 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>




                            <!--Abu Dhabhi Logic-->
                            <v-row v-if="parent_company_id == '62fb68ad9f14e35fe7eda269'">
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Current Status</div>
                                </v-col>
                                <v-col cols="4" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text" v-if="users.onboarding.user_location == 'Inside UAE'">
                                    <div dense>Previous Visa Type</div>
                                </v-col>
                            </v-row>

                            <v-row v-if="parent_company_id == '62fb68ad9f14e35fe7eda269'">
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4">
                                    <v-select dense :items="['Inside UAE','Outside UAE']" v-model="users.onboarding.user_location"></v-select>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" v-if="users.onboarding.user_location == 'Inside UAE'">
                                    <v-select dense :items="['Dubai Visa','AUH Visa','New Applicant Visa','Tourist Visa']" v-model="previous_visa_type" />
                                </v-col>
                            </v-row>
                            
                            <v-row v-if="parent_company_id == '62fb68ad9f14e35fe7eda269'">
                                <v-col cols="4" v-if="users.onboarding.user_location == 'Inside UAE' && previous_visa_type" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Visa Status Change Date</div>
                                </v-col>
                                <v-col cols="4" v-if="(users.onboarding.user_location == 'Inside UAE' && previous_visa_type == 'AUH Visa') || users.onboarding.user_location == 'Outside UAE'" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Certificate of Continuity</div>
                                </v-col>
                                <v-col cols="4" v-if="users.onboarding.user_location == 'Outside UAE'" class="py-0 px-12 mb-5 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Visa Entry</div>
                                </v-col>
                            </v-row>
                            <v-row v-if="parent_company_id == '62fb68ad9f14e35fe7eda269'">
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" v-if="users.onboarding.user_location == 'Inside UAE' && previous_visa_type">
                                    <v-menu v-model="menu6" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Visa Change Status" dense v-model="users.documents.visa_change_status_date" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.documents.visa_change_status_date" @input="menu6 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" v-if="(users.onboarding.user_location == 'Inside UAE' && previous_visa_type == 'AUH Visa') || users.onboarding.user_location == 'Outside UAE'">
                                    <v-menu v-model="menu8" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Certificate of Continuity" dense v-model="principal_certificate_of_continuity" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="principal_certificate_of_continuity" @input="menu8 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col class="py-0 px-12 mb-5" cols="12" sm="12" md="4" v-if="users.onboarding.user_location == 'Outside UAE'">
                                    <v-menu v-model="menu7" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field placeholder="Date of Visa Entry" dense v-model="users.documents.visa_entry_date" v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="users.documents.visa_entry_date" @input="menu7 = false" no-title scrollable></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row v-if="parent_company_id == '62fb68ad9f14e35fe7eda269'">
                                <span v-if="(users.onboarding.user_location == 'Inside UAE' || users.onboarding.user_location == 'Outside UAE') && computeAUHVisaChangeStatusDate">
                                    Note: <b style="color:red">Fine of 300 AED Shall Be Applicable As Visa Change Status Date Has Been Exceeded More Than 11 Days.</b>
                                </span>
                                <span v-if="users.onboarding.user_location == 'Outside UAE' && computeAUHVisaEntryDate">
                                    Note: <b style="color:red">Fine of 300 AED Shall Be Applicable As Visa Entry Date Has Been Exceeded More Than 11 Days.</b>
                                </span>
                                <span v-if="((users.onboarding.user_location == 'Inside UAE' && previous_visa_type == 'AUH Visa') || users.onboarding.user_location == 'Outside UAE')  && computeAUHCertificateOfContinuityCheck">
                                    Note: <b style="color:red">Fine of 300 AED Shall Be Applicable As Certificate of Continuity Has Been Exceeded More Than 30 Days.</b>
                                </span>
                            </v-row>
                            <v-row>
                                <v-col class="mb-0 font-weight-medium textFontSize grey-heading-text">
                                    <div dense>Attach Documents</div>
                                </v-col>
                            </v-row>
                        </v-form>
                        <v-row>
                            <v-col class="pt-2" cols="12" sm="12" md="4">
                                <v-btn class="primary white--text" @click="dialog_attach = true"><v-icon>mdi-paperclip</v-icon>ATTACH</v-btn>
                            </v-col>
                            <v-col class="text-right pt-2" cols="12" sm="12" md="12">
                                <v-btn class="primary white--text" v-if="uploadEducationDoc == false" @click.prevent="addInsuranceDependentRequest()">Submit</v-btn>
                                <v-btn class="primary white--text" v-else :disabled="uploadEducationDoc == true">Submit</v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>

                <!-- Upload Dialog-->
                <v-dialog v-model="dialog_attach" max-width="600">
                    <v-card max-width="600" style="overflow-x:hidden;">
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
                                <v-btn class="primary white--text" @click="dialog_attach = false">Cancel</v-btn>
                                <v-btn  class="primary white--text" v-if="!uploading" @click.once.prevent="attachFile">Upload</v-btn>
                                <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-dialog>

                <!-- Snackbar -->
                <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
                    {{ snackText }}
                    <template v-slot:action="{ attrs }">
                        <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
                    </template>
                </v-snackbar>

            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import countries from "countries-list";

    export default {
        props:['employee','parent_company_id', 'parent_company'],
        components: {countries},
        data () {
            return {
                previous_visa_type: '',
                deptloading: false,
                educationfile: '',
                passportfile:'',
                emiratesfile:'',
                visafile:'',
                otherfile:'',
                dragging: false,
                dialog_attach:false,
                uploading:false,
                snack:false,
                snackText:'',
                snackColor:'',
                menu2:false,
                menu3:false,
                menu4:false,
                menu5:false,
                menu6:false,
                menu7: '',
                menu8: '',
                principal_certificate_of_continuity: '',
                legal_entity:[
                    {"name":"Dynamic Employment Service","value": this.employee.parent_company_id},
                    {"name":"Executive Employment Service","value":"Executive Employment Services"},
                ],
                gender: [
                    {"name":"Male","value":"male"},
                    {"name":"Female","value":"female"},
                ],
                marital_status: [
                    {"name":"Single","value":"single"},
                    {"name":"Married","value":"married"},
                ],
                principal_type: [
                    {"name":"Principal","value":"principal"},
                    {"name":"Dependent","value":"dependent"},
                ],
                relation_to_principal: [
                    // { "name": "Mother", "value": "Mother"},
                    // { "name": "Father", "value": "Father"},
                    // { "name": "Brother", "value": "Brother"},
                    // { "name": "Sister", "value": "Sister"},
                    // { "name": "Employee", "value": "Employee"},  
                    { "name": "Spouse", "value": "Spouse"},
                    { "name": "Child", "value": "Child"},
                ],
                genericRule: [
                    v => !!v || 'This field is Required'
                ],
                users: {
                    insured_type: '',
                    legal_entity: this.employee.parent_company_id,
                    departments: this.parent_company,
                    first_name: '',
                    middle_name: '',
                    last_name: '',
                    documents: {
                        passport_number: '',
                        passport_expiry: '',
                        emiratesID_number: '',
                        emirates_expiry:'',
                        visa_uid_number: '',
                        visa_expiry:'',
                        file_number: '',
                        visa_change_status_date: '',
                        visa_entry_date:''
                    },
                    employment: {
                        visa_sponsor_type: 'Dynamic Employment Services'
                    },
                    attachments:[],
                    personal: {
                        gender: '',
                        marital_status: '',
                        dob: '',
                        nationality: ''
                    },
                    onboarding: {
                        user_location:''
                    },
                    principal_type:'dependent',
                    relation_to_principal:'',
                    insurance:'',
                    principal_id:this.employee._id,
                    image_url:'',
                    company_ID:'5fa397eb1ddd3b46d8e756ac'
                },
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
                departments:[],
                userDetails:[],
                companyDetails:[],
                insuranceplans:[],
                departmentValue :'',
                userDetail:{},
                fields: [],
                temp:{},
                field:{},
                date: new Date().toISOString().substr(0, 10),
                filename_attach: [],
                uploadFiles:'',
                isAdminRole: false,
                isHRAdminRole: false,
                isHRMgrRole: false,
                employeeRole: false,
                isFinanceMgrRole: false,
                isManagerRole:false,
                uploadEducationDoc: false,
            }
        },
        mounted() {
            this.getDepartmentNames(this.parent_company_id);
            this.getInsurancePlans(this.parent_company_id);
            this.getRole()
            // this.getDeptValue(this.users.departments)
            this.userDetail = this.$store.getters.getUser
        },
        computed:{
            countryList(){
                const countryCodes = Object.keys(countries.countries);
                const countryNames = countryCodes.map(code => countries.countries[code].name);
                return countryNames;
            },
            computedCheckAge(){
                if(this.users.relation_to_principal == 'Child' && this.users.personal.dob != ''){
                    const age = this.calculateAge(this.users.personal.dob)
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
            computedCategories() {
                    if(this.users.departments == '63493cb4491224c1c039536a' || this.users.departments == this.parent_company){
                        return this.insuranceplans
                    }
                    else {
                        return this.insuranceplans.filter(a => a._id != '6351765b3e4ea9412c829f64')
                    }
            },
            sortedArray() {
                function compare(a, b) {
                    if (a.name < b.name)
                        return -1;
                    if (a.name > b.name)
                        return 1;
                    return 0;
                }
                return this.relation_to_principal.sort(compare);
            },
            computeAUHCertificateOfContinuityCheck(){
                if(this.calculateNoOfDays(this.principal_certificate_of_continuity) > 30) {
                    return this.visaCOCCheck = true
                } else {
                    return this.visaCOCCheck = false
                }
            },
            computeAUHVisaChangeStatusDate(){
                if(this.calculateNoOfDays(this.users.documents.visa_change_status_date) > 11) {
                    return true
                }
            },
            computeAUHVisaEntryDate(){
                if(this.calculateNoOfDays(this.users.documents.visa_entry_date) > 11) {
                    return true
                }  
            },
        },
        methods: {
            close(){
                this.$emit('close',{})
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
                this.attachFiles.others= this.uploadFiles;
            },
            getSnack(){
                if((this.users.departments == '630dc350b4b520589c16e5e0' && this.users.principal_type == 'principal') || (this.users.departments == this.parent_company && this.users.principal_type == 'principal')) {
                    this.snack = true
                    this.snackColor = 'error'
                    this.snackText = 'Go to your respective portal for further process - In House/Freelancers'
                }
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
                if (val == 'offerLetter') this.offerfile = '';
                if (val == 'medical') this.medicalfile = '';
                if (val == 'visa') this.visafile = '';
                if (val == 'passportSizePhoto') this.passportphotofile = '';
                if (val == 'academicCertificate') this.academicfile = '';
                if (val == 'emiratesID') this.emiratesfile = '';
                if (val == 'passport') this.passportfile = '';
                if(val == 'educationIdentity') this.educationfile = '';
            },
            onChange(e,type) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length) {
                    this.dragging = false;
                    return;
                }
                this.createFile(e, files,type);
            },
            calculateNoOfDays(dateString){
                const currentDate = new Date();
                const inputDate = new Date(dateString);
                const oneDay = 24 * 60 * 60 * 1000; // number of milliseconds in one day

                // Calculate the difference in days between the input date and the current date
                const diffDays = Math.round(Math.abs((currentDate - inputDate) / oneDay));

                return diffDays;
            },
            createFile(e,file,type) {
                if (file.size > 10000000) {
                    alert('please check file size is not more than 10 MB.')
                    this.dragging = false;
                    return;
                }
                this.onUploadFiles(file)
                if (type == 'otherDocs') this.otherfile = file;
                if (type == 'offerLetter') this.offerfile = file;
                if (type == 'medical') this.medicalfile = file;
                if (type == 'visa') this.visafile = file;
                if (type == 'passportSizePhoto') this.passportphotofile = file;
                if (type == 'academicCertificate') this.academicfile = file;
                if (type == 'emiratesID') this.emiratesfile = file;
                if (type == 'passport') this.passportfile = file;
                if (type == 'educationIdentity') this.educationfile = file;
                this.dragging = false;
            },
            getRole() {
                this.isHRMgrRole = this.$store.getters.isHRMgr
                this.isFinanceMgrRole = this.$store.getters.isFinanceMgr
                this.isManagerRole = this.$store.getters.isManager
                this.isHRAdminRole = this.$store.getters.isHR
                this.isAdminRole = this.$store.getters.isAdmin
                this.employeeRole = this.$store.getters.isEmployee
            },
            async attachFile() {
                this.uploading = true
                let attachments = []
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
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
                                    created_by: this.users._id,
                                    time: new Date(),
                                    documentType: key
                                }
                                this.users.attachments.push(attach)

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
                // this.users.attachments = attachments
                this.uploading = false
                this.dialog_attach = false
            },
            async uploadImage(val) {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                const fd = new FormData();
                fd.append('a',val.file,val.name)
                fd.append('folder','users/'+this.users.first_name + ' '+ this.users.last_name)

                await this.$axios.$post("/users/upload-files", fd, {headers: { Authorization: AuthStr }})
                .then(res => {
                    this.link_url = res.url
                    this.link_filename = res.name
                })
                .catch();
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
            async addInsuranceDependentRequest() {
                if(this.$refs.form.validate()){
                    const token = this.$store.getters.getToken;
                    const AuthStr = "Bearer ".concat(token);
                    

                    let onboarding = {
                        user_location : this.users.onboarding.user_location
                    }
                    let employment = {
                        visa_sponsor_type : this.users.employment.visa_sponsor_type
                    }

                    const newObj = {
                        legal_entity: this.users.legal_entity,
                        departments: this.users.departments,
                        first_name: this.users.first_name,
                        middle_name: this.users.middle_name,
                        last_name: this.users.last_name,
                        documents: this.users.documents,
                        personal: this.users.personal,
                        principal_type: this.users.principal_type,
                        relation_to_principal: this.users.relation_to_principal,
                        principal_id: this.users.principal_id,
                        attachments: this.users.attachments,
                        image_url: this.users.image_url,
                        onboarding: onboarding,
                        employment: employment
                    }
                    
                    await this.$axios.$post(process.env.insurancePortalUrl+ 'insuranceaddition/addUser', newObj, {headers: {Authorization: AuthStr}})
                    .then((res)=> {
                        this.$emit('add',{})   
                    })

                    // for(const [key, value] of Object.entries(this.users)){ 
                    //     this.field[key] = {
                    //         'new_value' : this.users[key]
                    //     }
                    // }

                    // let obj = {
                    //     fields: this.fields,
                    //     createdBy: this.userDetail._id,
                    //     deleted:false,
                    //     modelType: 'Insuranceaddition',
                    //     createdAt: this.date,
                    //     operation: 'Create'
                    // }

                    // this.fields.push(this.field)

                    // await this.$axios.$post(process.env.insurancePortalUrl+ 'insurancelogs/new', obj, {headers: {Authorization: AuthStr}})
                    // .then((res)=> {
                    // })

                }
            },
            async getDeptValue(event){
                this.deptloading = true
                const token = this.$store.getters.getToken;
                const AuthStr = "Bearer ".concat(token);
                this.departmentValue = event

                let tempObj = {
                    department_value: this.departmentValue
                }
                await this.$axios.$post(process.env.insurancePortalUrl+ 'insuranceaddition/getAllUsers', tempObj,{ headers: { Authorization: AuthStr } })
                .then((res)=> {
                    this.userDetails = res
                })

                await this.$axios.$post(process.env.insurancePortalUrl+ 'insuranceaddition/getCompany', tempObj, {headers: { Authorization: AuthStr }})
                .then((res)=> {
                    this.companyDetails = res
                })
                this.deptloading = false
            },
            async getDepartmentNames(company_id){
                const token = this.$store.getters.getToken;
                const AuthStr = "Bearer ".concat(token);
                await this.$axios.$get(process.env.insurancePortalUrl+ 'insuranceaddition/department/'+company_id, { headers: { Authorization: AuthStr } })
                .then((res)=> {
                    this.departments = res
                })
            },
            async getInsurancePlans(company_id) {
                const token = this.$store.getters.getToken;
                const AuthStr = "Bearer ".concat(token);
                await this.$axios.$get(process.env.insurancePortalUrl+ 'insuranceaddition/insuranceplan/'+ company_id, { headers: { Authorization: AuthStr } })
                .then((res)=> {
                    this.insuranceplans = res
                })
            }
        }
    }
</script>

<style>
.v-dialog--fullscreen{
    background: #f5f5f5 !important;
}
.dropZone {
  width: 220px;
  height: 60px;
  position: relative;
  border: 2px dashed #eee;
  margin: auto;
}

.dropZone:hover {
  border: 2px solid #2e94c4;
}

.dropZone:hover .dropZone-title {
  color: #1975A0;
}

.dropZone-info {
  color: #A8A8A8;
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
  background: #5C5C5C;
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
  color: #A8A8A8;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translate(0, -50%);
  text-align: center;
}
</style>