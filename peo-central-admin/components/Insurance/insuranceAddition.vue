<template>
    <div>
        <v-card class="pa-0 rounded-xl" :height="this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.md || this.$vuetify.breakpoint.lg ? '580px':'900px'" style="overflow-x: hidden;">
            <v-card-title class="pa-6">
                <v-avatar size="30">
                    <v-img src="/adminCentral/add.svg" height="30" width="30"></v-img>
                </v-avatar>
                    &nbsp;<span style="color: #4190ed;">Add Insurance</span>
                <v-spacer></v-spacer>
                <v-tooltip left color="#9fbef3" v-if="selectedInsurnace.status == 'Success' && computeVisaIssueDateCheck && user_location == 'Inside Country' && parent_company_id == '62fb3df39f14e35fe7ed9c9a'">
                    <template v-slot:activator="{ on, attrs }">
                        <a href="https://nn-insurance.s3.eu-central-1.amazonaws.com/MAF/MAF_Application_24_F2-_Edited_English.pdf" target="_blank" v-bind="attrs" v-on="on" >
                            <v-img src="/assets/download.svg"  max-width="fit-content" height="20" contain class="mr-3"></v-img>
                        </a>
                    </template>
                    Download MAF
                </v-tooltip>
                <v-tooltip left color="#9fbef3" v-if="selectedInsurnace.status == 'Success' && computeVisaEntryDateCheck && user_location == 'Outside Country' && parent_company_id == '62fb3df39f14e35fe7ed9c9a'">
                    <template v-slot:activator="{ on, attrs }">
                        <a href="https://nn-insurance.s3.eu-central-1.amazonaws.com/MAF/MAF_Application_24_F2-_Edited_English.pdf" target="_blank" v-bind="attrs" v-on="on" >
                            <v-img src="/assets/download.svg"  max-width="fit-content" height="20" contain class="mr-3"></v-img>
                        </a>
                    </template>
                    Download MAF
                </v-tooltip>
                <v-img @click="close()" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-form ref="action_form" v-if="!isIndividual">
                    <v-row v-if="insuranceAdditionLoading" style="min-height:100%;align-items:center;justify-content:center;">
                        <v-col cols="auto">
                            <v-img src="/animated/refresh.svg"  max-width="fit-content" height="200" contain class="mr-3"></v-img>
                        </v-col>
                    </v-row>
                    <v-row v-if="insuranceAdditionLoading" style="min-height:100%;align-items:center;justify-content:center;">
                        <v-col cols="auto">
                            validating please wait
                        </v-col>
                    </v-row>
                    <v-row v-else>
                        <v-col cols="4">
                            <v-select outlined dense label="Provider Name" :items="insuranceAdditionValidation" item-text="_id.provider_name" item-value="_id.provider_id" v-model="insuranceAddition.provider_id" @change="selectInsurance(insuranceAddition.provider_id);getAddsOnList(parent_company_id,insuranceAddition.provider_id);getRulesSet(parent_company_id,insuranceAddition.provider_id)"></v-select>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && parent_company_id == '62fb3df39f14e35fe7ed9c9a'">
                            <v-autocomplete outlined dense label="Category Name" :items="selectedInsurnace.result[0].categories" item-text="name" item-value="category_id" v-model="insuranceAddition.category" @change="selectInsuranceCategory(insuranceAddition.provider_id, insuranceAddition.category)"></v-autocomplete>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && parent_company_id == '62fb68ad9f14e35fe7eda269'">
                            <v-autocomplete outlined disabled dense label="Category Name" :items="AUHSelectedCategory" item-text="name" item-value="category_id" v-model="insuranceAddition.category" @change="selectInsuranceCategory(insuranceAddition.provider_id, insuranceAddition.category)"></v-autocomplete>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success'">
                            <v-select outlined dense label="Insurance Type" :items="insurance_type_array" item-text="name" v-model="insurance_type" @change="computePrincipalType(insurance_type)"></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-select outlined dense label="Insurance Agent" :items="agentList" item-text="full_name" item-value="_id" v-model="agent_id" :rules="[v => !!v || 'Insurance Agent is required']"></v-select>
                        </v-col>
                        <!-- <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && (addsOnList && addsOnList.length > 0) && parent_company_id == '62fb3df39f14e35fe7ed9c9a'">
                            <v-select outlined dense label="AddsOn" :items="addsOnList" item-text="name" item-value="_id" v-model="addson"></v-select>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && (addsOnList && addsOnList.length > 0) && parent_company_id == '62fb68ad9f14e35fe7eda269'">
                            <v-select outlined dense label="AddsOn" :items="addsOnList" item-text="name" item-value="_id" v-model="addson"></v-select>
                        </v-col> -->
                        <!-- <v-col cols="4" v-if="selectedInsurnace.status == 'Success'">
                            <v-select outlined dense label="Renewal Status" :items="renewal_status" item-text="name" v-model="payment_details.renewal_status"></v-select>
                        </v-col> -->
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success'">
                            <v-select outlined dense label="Payment Status" :items="payment_status" item-text="name" v-model="payment_details.payment_status"></v-select>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success'">
                            <v-select outlined dense label="Payment Mode" :items="payment_mode" item-text="name" v-model="payment_details.payment_mode"></v-select>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && payment_details.payment_mode == 'Partial'">
                            <v-text-field outlined dense auto-grow class="py-0" label="Department Amount" v-model="payment_details.department_amount"></v-text-field>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && payment_details.payment_mode == 'Partial'">
                            <v-text-field outlined dense auto-grow class="py-0" label="Other Amount" v-model="payment_details.other_amount"></v-text-field>
                        </v-col>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && payment_details.payment_mode == 'Partial'">
                            <v-select outlined dense label="Paid By" :items="paid_by" item-text="name" v-model="payment_details.paid_by"></v-select>
                        </v-col>
                        <!--Dubai Logic-->
                        <v-row v-if="parent_company_id == '62fb3df39f14e35fe7ed9c9a'">
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success'">
                                <v-select outlined dense label="Current Status" :items="['Inside Country','Outside Country']" v-model="user_location"></v-select>
                            </v-col>
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && user_location == 'Inside Country'">
                                <v-menu v-model="menu1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field outlined dense label="Visa Status Change Date" v-model="principal_visa_change_status_date" v-bind="attrs" v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker outlined dense v-model="principal_visa_change_status_date" @input="menu1 = false" no-title scrollable></v-date-picker>
                                </v-menu>
                            </v-col>

                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && user_location == 'Outside Country'">
                                <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field outlined dense label="Visa Entry Date" v-model="principal_visa_entry_date" v-bind="attrs" v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker outlined dense v-model="principal_visa_entry_date" @input="menu2 = false" no-title scrollable></v-date-picker>
                                </v-menu>
                            </v-col>

                            <v-col cols="12" class="pb-2" v-if="selectedInsurnace.status == 'Success' && computeVisaIssueDateCheck && user_location == 'Inside Country'">
                                <v-img src="/animated/ripple.svg"  max-width="fit-content" height="fit-content" contain v-if="disableUpload"></v-img>
                                <div v-else>
                                    <v-icon :disabled="disabledPrincipalButton == true" @click="uploadPrincipalDocumentDialogOpen = !uploadPrincipalDocumentDialogOpen" color="blue">mdi-cloud-upload</v-icon><br />
                                    <span>Note: <i>The visa issuance/entry stamp date has passed 30 days or more. Please submit the <strong><a href="https://nn-insurance.s3.eu-central-1.amazonaws.com/MAF/MAF_Application_24_F2-_Edited_English.pdf" target="_blank"> Medical Application Form (MAF).</a></strong> <br /> Kindly keep in mind that any pre-existing conditions disclosed will be assessed by the insurance underwriter, and the final cost may vary.</i> </span>
                                </div>
                                <!-- <v-tooltip top color="grey" v-else>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on" :disabled="disabledPrincipalButton == true" @click="uploadPrincipalDocumentDialogOpen = !uploadPrincipalDocumentDialogOpen" color="blue">mdi-cloud-upload</v-icon>
                                    </template>
                                The visa issuance/entry stamp has passed 30 days or more. <br />Please submit the <a target="_blank">Medical Application Form (MAF).</a>
                                </v-tooltip> -->
                            </v-col>

                            <v-col cols="12" class="pb-2" v-if="selectedInsurnace.status == 'Success' && computeVisaEntryDateCheck && user_location == 'Outside Country'">
                                <v-img src="/animated/ripple.svg"  max-width="fit-content" height="fit-content" contain v-if="disableUpload"></v-img>
                                <div v-else>
                                    <v-icon :disabled="disabledPrincipalButton == true" @click="uploadPrincipalDocumentDialogOpen = !uploadPrincipalDocumentDialogOpen" color="blue">mdi-cloud-upload</v-icon><br />
                                    <span>Note: <i>The visa issuance/entry stamp date has passed 30 days or more. Please submit the <strong><a href="https://nn-insurance.s3.eu-central-1.amazonaws.com/MAF/MAF_Application_24_F2-_Edited_English.pdf" target="_blank"> Medical Application Form (MAF).</a></strong> <br /> Kindly keep in mind that any pre-existing conditions disclosed will be assessed by the insurance underwriter, and the final cost may vary.</i> </span>
                                </div>
                                <!-- <v-tooltip top color="grey" v-else>
                                    <template v-slot:activator="{ on }">
                                        <v-icon v-on="on" :disabled="disabledPrincipalButton == true" @click="uploadPrincipalDocumentDialogOpen = !uploadPrincipalDocumentDialogOpen" color="blue">mdi-cloud-upload</v-icon>
                                    </template>
                                The visa issuance/entry stamp has passed 30 days or more. <br />Please submit the <a target="_blank">Medical Application Form (MAF).</a>
                                </v-tooltip> -->
                            </v-col>

                            <v-col cols="2" class="pb-2" v-if="principalAttach.link">
                                <span class="mx-2 d-flex">
                                    <v-btn color="primary" small class="rounded-xl" outlined @click="openDocument(principalAttach.link)">
                                        <v-icon small>mdi-file-document-outline</v-icon>{{principalAttach.filename}}
                                    </v-btn>
                                    <v-icon small color="red" style="margin-left:-10px;margin-top:-20px" @click="deletePrincipalDoc(principalAttach)">mdi-close-circle-outline</v-icon>
                                </span>
                            </v-col>
                        </v-row>
                        <!--Abu Dhabi Logic-->
                        <v-row v-if="parent_company_id == '62fb68ad9f14e35fe7eda269'">
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success'">
                                <v-select outlined dense label="Current Status" :items="['Inside Country','Outside Country']" v-model="user_location"></v-select>
                            </v-col>
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && user_location == 'Inside Country'">
                                <v-select outlined dense label="Visa Type" :items="['Dubai Visa','AUH Visa','New Applicant Visa','Tourist Visa']" v-model="previous_visa_type"></v-select>
                            </v-col>
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && user_location == 'Inside Country' && previous_visa_type">
                                <v-menu v-model="menu3" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field outlined dense label="Visa Status Change Date" v-model="principal_visa_change_status_date" v-bind="attrs" v-on="on" />
                                    </template>
                                    <v-date-picker outlined dense v-model="principal_visa_change_status_date" @input="menu3 = false" no-title scrollable></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && user_location == 'Inside Country' && previous_visa_type == 'AUH Visa'">
                                <v-menu v-model="menu4" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field outlined dense label="Certificate of Continuity" v-model="principal_certificate_of_continuity" v-bind="attrs" v-on="on" />
                                    </template>
                                    <v-date-picker outlined dense v-model="principal_certificate_of_continuity" @input="menu4 = false" no-title scrollable></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && user_location == 'Outside Country'">
                                <v-menu v-model="menu5" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field outlined dense label="Visa Entry Date" v-model="principal_visa_entry_date" v-bind="attrs" v-on="on" />
                                    </template>
                                    <v-date-picker outlined dense v-model="principal_visa_entry_date" @input="menu5 = false" no-title scrollable></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="4" v-if="selectedInsurnace.status == 'Success' && user_location == 'Outside Country'">
                                <v-menu v-model="menu6" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field outlined dense label="Certificate of Continuity" v-model="principal_certificate_of_continuity" v-bind="attrs" v-on="on" />
                                    </template>
                                    <v-date-picker outlined dense v-model="principal_certificate_of_continuity" @input="menu6 = false" no-title scrollable></v-date-picker>
                                </v-menu>
                            </v-col>
                            <span v-if="selectedInsurnace.status == 'Success' && (user_location == 'Inside Country' || user_location == 'Outside Country') && computeAUHVisaChangeStatusDate">
                                Note: <b style="color:red">Fine of 300 AED Shall Be Applicable As Visa Change Status Date Has Been Exceeded More Than 11 Days.</b>
                            </span>
                            <span v-if="selectedInsurnace.status == 'Success' && user_location == 'Outside Country' && computeAUHVisaEntryDate">
                                Note: <b style="color:red">Fine of 300 AED Shall Be Applicable As Visa Entry Date Has Been Exceeded More Than 11 Days.</b>
                            </span>
                            <span v-if="selectedInsurnace.status == 'Success' && ((user_location == 'Inside Country' && previous_visa_type == 'AUH Visa') || user_location == 'Outside Country')  && computeAUHCertificateOfContinuityCheck">
                                Note: <b style="color:red">Fine of 300 AED Shall Be Applicable As Certificate of Continuity Has Been Exceeded More Than 30 Days.</b>
                            </span>
                        </v-row>
                        <v-col class="mx-0" cols="12" sm="12" md="12" v-if="selectedInsurnace.status == 'Success' && principal_type == 'Principal'">
                            <v-row>
                                <v-col cols="4" v-if="dependentList != ''">
                                    <v-select outlined dense label="Insure Dependents?" :items="['Yes', 'No']" @change="chooseAddDependent($event)"></v-select>
                                </v-col>
                            </v-row>
                            <v-row  v-if="addDependent">
                                <v-col cols="12" class="d-flex justify-space-between align-center">
                                    <h3 class="darkBlue-heading-text subHeadingFontSize">{{ dependentList != '' ? 'Dependent List' : 'Add New Dependent' }}</h3>
                                    <v-spacer></v-spacer>
                                    <v-tooltip top color="secondary">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn @click="insuranceDependentAdditionFlag = true" v-bind="attrs" fab x-small v-on="on" width="33" height="33" color="blue" class="ml-3" large outlined><v-icon>fa-solid fa-plus</v-icon></v-btn>   
                                        </template>
                                        Add New Dependent
                                    </v-tooltip>
                                </v-col>
                                <v-col cols="12">
                                    <v-data-table :loading="insuranceAdditionLoading" loading-text="Loading... Please wait" :headers="computedDependentHeader" :footer-props="{'items-per-page-options': [5,10,15]}" :items="clonedDependentList" item-key="_id" multi-sort hide-default-footer disable-pagination style="cursor:pointer;border-radius: 20px !important">
                                        <template v-slot:item="{ item,index }">
                                            <tr>
                                                <td class="font-weight-medium mb-0">{{ item.first_name + " " + item.last_name }}</td>
                                                <td class="font-weight-medium mb-0">{{ item.principal_name }}</td>
                                                <td class="font-weight-medium mb-0">{{ item.relation_to_principal }}</td>
                                                <!-- <td class="font-weight-medium mb-0">
                                                    <v-select v-if="payment_details.renewal_status" style="width:120px" class="pl-1 rounded-xl pt-1" :items="[payment_details.renewal_status]" item-text="name" v-model="item.renewal_status" outlined dense></v-select>
                                                </td> -->
                                                <td class="font-weight-medium mb-0">
                                                    <v-select outlined dense style="width:120px" class="pl-1 rounded-xl pt-1" :items="addsOnList" item-text="name" item-value="_id" v-model="item.addson" :rules="genericRule"></v-select>
                                                </td>
                                                <td class="font-weight-medium mb-0">
                                                    <v-select style="width:120px" class="pl-1 rounded-xl pt-1" outlined dense :items="['Paid','Not Paid']" v-model="item.payment_status" :rules="genericRule"></v-select>
                                                </td>
                                                <td class="font-weight-medium mb-0">
                                                    <v-select style="width:120px" class="pl-1 rounded-xl pt-1" outlined dense :items="['Department', 'Principal', 'Partial', 'Customer']" v-model="item.payment_mode" :rules="genericRule"></v-select>
                                                </td>
                                                <td class="font-weight-medium mb-0" v-if="item.payment_mode == 'Partial'">
                                                    <v-text-field dense style="width:150px" outlined auto-grow class="py-0" v-model="item.department_amount" :rules="genericRule"></v-text-field>
                                                </td>
                                                <td class="font-weight-medium mb-0" v-if="item.payment_mode == 'Partial'">
                                                    <v-text-field outlined dense style="width:150px" auto-grow class="py-0" v-model="item.other_amount" :rules="genericRule"></v-text-field>
                                                </td>
                                                <td class="font-weight-medium mb-0" v-if="item.payment_mode == 'Partial'">
                                                    <v-select outlined dense style="width:120px" :items="['Department', 'Principal','Partial','Customer']" item-text="name" v-model="item.paid_by" :rules="genericRule"></v-select>
                                                </td>
                                                <td class="font-weight-medium mb-0">
                                                    <!-- <v-btn class="mx-2" icon @click="confirmAddDialogOpen(item, index)">
                                                        <v-icon small color="green">mdi-check</v-icon>
                                                    </v-btn>  -->
                                                    <v-tooltip top color="red">
                                                        <template v-slot:activator="{ on }">
                                                            <v-icon v-on="on" :disabled="disabledDependButton == true && userIndex == index && item.attachments.filter(a => a.deleted == false)[0] != ''" color="blue" @click="openDependentAttach(item,index) " v-if="calculateNoOfDays(item.documents.visa_change_status_date) > 30 || calculateNoOfDays(item.documents.visa_entry_date)">mdi-cloud-upload</v-icon>
                                                        </template>
                                                            Need To Upload Medical Document <br>Because Visa Issue/Entry Date Has Been Exceeded More Than 30 Days
                                                        </v-tooltip>
                                                    <v-icon @click="showDependentsDetailsDialog = true; openDependentDialogDetails(item,index)">mdi-information-outline</v-icon>
                                                </td>
                                            </tr>
                                        </template>
                                    </v-data-table>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="12" v-if="selectedInsurnace.status == 'Success'">
                            <v-col cols="12" class="d-flex justify-space-between align-center">
                                <h3 class="darkBlue-heading-text subHeadingFontSize">Principal Information</h3>
                            </v-col>
                            <v-row>
                                <v-col cols="4">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Provider Name </h5>
                                    <p class="pb-0">{{selectedInsurnace._id.provider_name}}</p>
                                </v-col>
                                <v-col cols="4">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Network Name </h5>
                                    <p class="pb-0">{{selectedInsurnaceCategory.network}}</p>
                                </v-col>
                                <v-col cols="4">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Plan Name </h5>
                                    <p class="pb-0">{{selectedInsurnaceCategory.plan}}</p>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Insurance Type</h5>
                                    <p class="pb-0">{{ insurance_type }}</p>
                                </v-col>
                                <!-- <v-col cols="4" v-if="addsOnList && addsOnList.length > 0">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">AddsOn</h5>
                                    <p class="pb-0">{{ getAddsOnName(addson._id) }}</p>
                                </v-col> -->
                                <!-- <v-col cols="4">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Renewal Status</h5>
                                    <p class="pb-0">{{ payment_details.renewal_status }}</p>
                                </v-col> -->
                                <v-col cols="4">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Payment Status</h5>
                                    <p class="pb-0">{{ payment_details.payment_status }}</p>
                                </v-col>
                                <v-col cols="4">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Payment Mode</h5>
                                    <p class="pb-0">{{ payment_details.payment_mode }}</p>
                                </v-col>
                                <v-col cols="4" v-if="payment_details.payment_mode == 'Partial'">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Department Amount</h5>
                                    <p class="pb-0">{{ payment_details.department_amount }}</p>
                                </v-col>
                                <v-col cols="4" v-if="payment_details.payment_mode == 'Partial'">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Other Amount</h5>
                                    <p class="pb-0">{{ payment_details.other_amount }}</p>
                                </v-col>
                                <v-col cols="4" v-if="payment_details.payment_mode == 'Partial'">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Paid By</h5>
                                    <p class="pb-0">{{ payment_details.paid_by }}</p>
                                </v-col>
                                <v-col cols="4" v-if="principal_visa_change_status_date">
                                    <h5 class="grey-heading-text textFontSize font-weight-medium">Visa Status Change Date</h5>
                                    <p class="pb-0">{{ principal_visa_change_status_date || employee.document.visa_change_status_date }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="12" v-if="selectedInsurnace.status == 'Error'"  class="notificationBanner">
                                <div class="py-0 px-4 fontSize2 font-weight-normal darkBlue-heading-text " >
                                <ul>
                                    <li v-for="item,index in selectedInsurnace.result" :key="index">{{item}}</li>
                                </ul>
                                </div>
                        </v-col>
                        <v-col cols="12" v-else style="display: flex;justify-content: end;">
                            <v-progress-circular v-if="addRequestLoading" indeterminate color="primary"></v-progress-circular>
                            <!-- <v-btn v-else-if="calculateNoOfDays(employee.documents.visa_change_status_date) > 30 || processAttachFlag == true" elevation="0" width="150px" color="#0064D7"  @click="addInsuranceRequest()" class="white--text border-radius-medium" :disabled="addRequestFlag == false && disabledPrincipalButton == false">
                                Add
                            </v-btn> -->
                            <v-btn v-else-if="calculateNoOfDays(employee.documents.visa_change_status_date) > 30 || processAttachFlag == true" elevation="0" width="150px" color="#0064D7"  @click="addInsuranceRequest()" class="white--text border-radius-medium">
                                Add
                            </v-btn>
                            <v-btn v-else-if="clonedDependentList.length > 0" :disabled="(dependentCheck == true && disabledDependButton == false)" elevation="0" width="150px" color="#0064D7" @click="addInsuranceRequest()" class="white--text border-radius-medium">
                                Add
                            </v-btn>
                            <v-btn v-else elevation="0" width="150px" color="#0064D7" @click="addInsuranceRequest()" class="white--text border-radius-medium">
                                Add
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>

                <v-form v-else>
                    <v-row>
                        <v-col cols="4" v-if="selectedInsurnace.status == 'Success'">
                            <v-select outlined dense label="Insurance Type" :items="insurance_type_array" item-text="name" v-model="insurance_type" @change="computePrincipalType(insurance_type)"></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <p>Please click the following <a :href="userUrl" class="text-button text-blue" target="_blank">link</a> to explore your insurance options</p>
                        </v-col>
                    </v-row>
                </v-form>

            </v-card-text>


            <v-dialog v-model="insuranceDependentAdditionFlag" max-width="1000" min-width='1000' style="overflow-x: hidden;">
                <AdditionForm :employee="employee" @close="closeInsuranceDependentAddition" @add="addInsuranceDependentRequest" :parent_company_id="parent_company_id" :parent_company="parent_company" v-if="insuranceDependentAdditionFlag"/>
            </v-dialog>

            <!-- Display Dependent List -->
            <v-dialog v-model="showDependentsDetailsDialog" class="pa-0 rounded-xl" max-width="900" style="overflow-x: hidden;" persistent>
                <v-card>
                    <v-card-title class="pa-6">
                        <span style="color: #4190ed;">View Dependent Details</span>
                        <v-spacer></v-spacer>
                        <v-img @click="showDependentsDetailsDialog = false" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
                    </v-card-title>
                    <v-card-text>
                        <v-row class="mx-0" style="max-width:100%">
                            <v-col cols="12" class="px-5">
                                 <v-row>
                                    <v-col cols="3">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Department</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.company_name}}</span>
                                    </v-col>
                                    <v-col cols="3">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Client Name</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.client_name}}</span>
                                    </v-col>
                                    <v-col cols="3">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Employee Name</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ showDetails.first_name + " " + showDetails.last_name }}</span>
                                    </v-col>
                                    <v-col cols="3">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Principal Name</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ showDetails.principal_name }}</span>
                                    </v-col>
                                    <v-col cols="3">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Relation to Principal</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ showDetails.relation_to_principal }}</span>
                                    </v-col>
                                    <!-- <v-col cols="3" v-if="showDetails.onboarding.user_location">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Users location</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ showDetails.onboarding.user_location }}</span>
                                    </v-col> -->
                                    <v-col cols="3">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Principal Type</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.principal_type}}</span>
                                    </v-col>
                                    <!-- <v-col cols="3" v-if="showDetails.renewal_status">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Renewal Status</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.renewal_status}}</span>
                                    </v-col> -->
                                    <v-col cols="3" v-if="showDetails.payment_status">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Payment Status</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.payment_status}}</span>
                                    </v-col>
                                    <v-col cols="3" v-if="showDetails.payment_mode">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Payment Mode</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.payment_mode}}</span>
                                    </v-col>
                                    <v-col cols="3" v-if="showDetails.department_amount">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Department Amount</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.department_amount}}</span>
                                    </v-col>
                                    <v-col cols="3" v-if="showDetails.other_amount">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Other Amount</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.other_amount}}</span>
                                    </v-col>
                                    <v-col cols="3" v-if="showDetails.paid_by">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Paid By</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.paid_by}}</span>
                                    </v-col>
                                    <v-col cols="3">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Has Dependency</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">{{showDetails.has_dependency}}</span>
                                    </v-col>
                                    <v-col cols="3" v-if="dependentAttach.link">
                                        <p class="grey-heading-text font-weight-medium textFontSize">Attachments</p>
                                        <span class="darkBlue-heading-text font-weight-normal textFontSize">
                                            <v-btn color="primary" small class="rounded-xl" outlined @click="openDocument(dependentAttach.link)">
                                                <v-icon small>mdi-file-document-outline</v-icon>{{dependentAttach.filename}}
                                            </v-btn>
                                            <v-icon small color="red" style="margin-left:-10px;margin-top:-20px" @click="deleteDependentDoc()">mdi-close-circle-outline</v-icon>
                                        </span>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <v-dialog v-model="dialogAddDependent" class="pa-0 rounded-xl" max-width="800" min-width='800' persistent v-if="selectedItem">
                <v-card style="overflow-x: hidden;">
                    <v-card-title class="red white--text">
                        <v-row>
                            <v-col class="py-0">Read Carefully!</v-col>
                            <v-col class="text-right py-0">
                            <v-btn text @click="dialogAddDependent = false;"><v-icon color="white">mdi-close</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-row class="pt-5">
                        <v-col></v-col>
                        <div>
                            <p class="px-6 pt-0">Do You Want To Add <strong color="black">{{ selectedItem.first_name + " " + selectedItem.last_name }}</strong> as Dependent to Principal <strong color="black">{{ selectedItem.principal_name }}</strong> ?</p><br />
                            <p class="px-6 pt-1">If Yes, then click on "Add Dependent Request" button, A request will be generated for this dependent in request addition component.</p>
                        </div>
                        <v-col></v-col>
                    </v-row>
                    <v-row class="pt-4">
                      <v-col class="text-right pt-0">
                        <v-btn color="#5C7EEF" :disabled="true" outlined  v-if="createRequestLoading" >
                          <v-img src="/animated/refresh.svg" height="20" width="20" contain></v-img>
                        </v-btn>
                        <v-btn class="primary--text" @click="addDependentRequest(selectedItem)" text v-else>Add Dependent Request</v-btn>
                        <v-btn class="" @click="dialogAddDependent = false;" text>Close</v-btn>
                      </v-col>
                    </v-row>
                </v-card>
            </v-dialog>

            <!--Upload Principal Document Certificate-->
            <v-dialog v-model="uploadPrincipalDocumentDialogOpen" max-width="800">
                <v-card style="overflow-x:hidden">
                    <v-card-title class="primary white--text">
                        <v-row>
                            <v-col class="py-0">
                                Upload Documents
                            </v-col>
                            <v-col class="text-right py-0">
                                <v-btn text @click="uploadPrincipalDocumentDialogOpen = false"><v-icon color="white">mdi-close</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-row class="pt-5">
                        <v-col></v-col>
                        <div v-if="!file">
                            <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                <div class="dropZone-info" @drag="onChange">
                                    <span class="fa fa-cloud-upload dropZone-title"></span>
                                    <span class="dropZone-title">Drop file or click to upload</span>
                                    <div class="dropZone-upload-limit-info">
                                        <div>maximum file size: 10 MB</div>
                                    </div>
                                </div>
                                <input type="file" accept=".pdf,.jpg,.jpeg" @change="onChange" multiple>
                            </div>
                        </div>
                        <div v-else class="dropZone-uploaded">
                            <div class="dropZone-uploaded-info">
                                <span class="dropZone-title">Added</span>
                                <button type="button" class="btn btn-primary removeFile" @click="removeFile">Remove File</button>
                            </div>
                        </div>
                        <v-col></v-col>
                    </v-row>
                    <v-row class="pt-4">
                        <v-col class="text-center pt-0">
                            <v-btn outlined class="primary--text " :disabled="disableUpload" @click="attachFile">Upload</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </v-dialog>

            <!--Upload Dependents Document Certificates-->
            <v-dialog v-model="uploadDependentDocumentDialogOpen" max-width="800">
                <v-card style="overflow-x:hidden">
                    <v-card-title class="primary white--text">
                        <v-row>
                            <v-col class="py-0">
                                Upload Documents
                            </v-col>
                            <v-col class="text-right py-0">
                                <v-btn text @click="uploadDependentDocumentDialogOpen = false"><v-icon color="white">mdi-close</v-icon></v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-row class="pt-5">
                        <v-col></v-col>
                        <div v-if="!file">
                            <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                <div class="dropZone-info" @drag="onChange">
                                    <span class="fa fa-cloud-upload dropZone-title"></span>
                                    <span class="dropZone-title">Drop file or click to upload</span>
                                    <div class="dropZone-upload-limit-info">
                                        <div>maximum file size: 10 MB</div>
                                    </div>
                                </div>
                                <input type="file" accept=".pdf,.jpg,.jpeg" @change="onChange" multiple>
                            </div>
                        </div>
                        <div v-else class="dropZone-uploaded">
                            <div class="dropZone-uploaded-info">
                                <span class="dropZone-title">Added</span>
                                <button type="button" class="btn btn-primary removeFile" @click="removeFile">Remove File</button>
                            </div>
                        </div>
                        <v-col></v-col>
                    </v-row>
                    <v-row class="pt-4">
                        <v-col class="text-center pt-0">
                            <v-btn outlined class="primary--text " :disabled="disableUpload" @click="attachFile1">Upload</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </v-dialog>

        </v-card>
        <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
            {{ snackText }}
            <template v-slot:action="{ attrs }">
                <v-btn v-bind="attrs" text @click="snack = false" small><v-icon>mdi-close</v-icon></v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
    import AdditionForm from "~/components/Insurance/additionform.vue";
    import moment from 'moment'

    export default {
        props:['employee', 'parent_company_id', 'parent_company', 'legal_entity', 'principal_type', 'insuranceAgent'],
        components: {AdditionForm},
        data () {
            return {
                visaCOCCheck: false,
                visaStatusDateCheck:false,
                previous_visa_type: '',
                AUHSelectedCategory: [],
                clonedDependentList:[],
                snack: false,
                snackColor:'',
                snackText:'',
                payment_details:{
                    renewal_status: 'Renew',
                    payment_mode:'',
                    payment_status:'',
                    department_amount:0,
                    other_amount:0,
                    paid_by:'',
                },
                dependents_payment_details:{
                    renewal_status: 'Renew',
                    payment_mode:'',
                    payment_status:'',
                    department_amount:'',
                    other_amount:'',
                    paid_by:'',
                },
                user_location: '',
                selectedInsurnace:{},
                selectedInsurnaceCategory:{},
                insuranceAddition:{},
                insuranceAdditionLoading:false,
                insuranceAdditionValidation:[],
                renewal_status:['Renew','Hold','Cancel'],
                payment_status:['Paid','Not Paid'],
                payment_mode:['Department', 'Principal','Partial','Customer'],
                paid_by:['Principal','Customer','Department'],
                insurance_type_array: ['Group','Individual'],
                insurance_type:'',
                dependentList: [],
                principal_visa_change_status_date: '',
                principal_visa_entry_date: '',
                dependent_visa_issuance_data: '',
                principal_certificate_of_continuity: '',
                menu1: '',
                menu2: '',
                menu3: '',
                menu4: '',
                menu5: '',
                menu6: '',
                // json_dependents_header:[
                //     { text: "Employee Name" ,value: "dependentList.first_name" },
                //     { text: "Principal Name" ,value: "dependentList.principal_name" },
                //     { text: "Relation to Principal", value: "dependentList.relation_to_principal" },
                //     { text: "Renewal Status", value: "" },
                //     { text: "Payment Status", value: "" },
                //     { text: "Payment Mode", value: "" },
                //     { text: "Action" ,value: "" },
                // ],
                insuranceDependentAdditionFlag: false,
                showDetails:{},
                showDependentsDetailsDialog:false,
                selectedItem: {},
                dialogAddDependent: false,
                createRequestLoading: false,
                addRequestLoading: false,
                uploadPrincipalDocumentDialogOpen: false,
                uploadDependentDocumentDialogOpen: false,
                processAttachFlag: false,
                dragging: false,
                file:'',
                uploadFiles:'',
                filename_attach: [],
                disableUpload:false,
                link_url:'',
                link_filename:'',
                principalAttach: {},
                dependentAttach: {},
                addRequestFlag: false,
                selectedList: {},
                disabledDependButton: false,
                disabledPrincipalButton: false,
                userIndex: 0,
                genericRule: [
                    v => !!v || 'This field is Required'
                ],
                dependentCheck: false,
                ruleSet:[],
                updateUser :{
                    payment_details:{}
                },
                addsOnList: [],
                addson: '',
                isIndividual: false,
                userUrl: '',
                userObj: '',
                addDependent: false,
                agentList: [],
                agent_id: ''
            }
        },
        mounted(){

            if(this.employee.documents && this.employee.documents.hasOwnProperty('visa_change_status_date') && this.employee.documents.visa_change_status_date != null){
                this.principal_visa_change_status_date = this.employee.documents.visa_change_status_date
            } else {
                this.principal_visa_change_status_date = ''
            }


            if(this.employee.documents && this.employee.documents.hasOwnProperty('visa_entry_date') && this.employee.documents.visa_entry_date != null){
                this.principal_visa_entry_date = this.employee.documents.visa_entry_date
            } else {
                this.principal_visa_entry_date = ''
            }

            this.addInsurance(this.employee);

            this.userObj = {
                first_name: this.employee.first_name,
                middle_name: this.employee.middle_name,
                last_name: this.employee.last_name,
                attachments: this.employee.attachments,
                documents: this.employee.documents,
                email: this.employee.personal.email,
                dob: this.employee.personal.dob,
                phone: this.employee.personal.phone,
                nationality: this.employee.personal.nationality,
                marital_status: this.employee.personal.marital_status,
                address: this.employee.personal.address,
                gender: this.employee.personal.gender,
                user_id: this.employee._id,
                dependents: this.dependentList,
                legal_entity: this.legal_entity,
                company_id: this.parent_company,
            };
            
            const userString = JSON.stringify(this.userObj);
            const base64UserString = btoa(userString);
            const encodedUserString = encodeURIComponent(base64UserString);
            this.userUrl = `${process.env.individualInsurancePortalUrl}enrollment-form?user=${JSON.stringify(encodedUserString)}`;
        },
        watch:{
            // principal_certificate_of_continuity(val){
            //     if(val){
            //         console.log(val, '------val')
            //         this.computeAUHCertificateOfContinuityCheck
            //     }
            // },
            // previous_visa_type(val){
            //     if(val != 'AUH Visa') {
            //         this.computeAUHVisaChangeStatusDate
            //     }
            // },
            principal_visa_change_status_date(val){
                console.log(val, '-------val')
                if(val){
                    this.principal_visa_entry_date = ''
                }
            },
            principal_visa_entry_date(val){
                if(val) {
                    this.principal_visa_change_status_date = ''
                }
            }
        },
        methods: {
            chooseAddDependent(val){
                if(val === "No"){
                    this.addDependent = false;
                    this.clonedDependentList = [];
                    this.dependentList = '';
                } else {
                    this.addDependent = true;
                }
            },
            calculateAge(dob) {
                const currentYear = moment().year();
                const currentMonth = moment().month() + 1; 
                let dobYear = moment(dob, 'YYYY-MM-DD').year();
                let dobMonth = moment(dob, 'YYYY-MM-DD').month() + 1;
            
                let age = currentYear - dobYear
                let month = currentMonth - dobMonth
                
                
                if(month >= 6) {
                    return age = age + 1
                } else {
                    return age
                }
            },
            removeFile() {
                this.file = '';
            },
            onChange(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length) {
                    this.dragging = false;
                    return;
                }
                this.createFile(e, files);
            },
            createFile(e,file) {
                if (file.size > 10000000) {
                    alert('please check file size is not more than 10 MB.')
                    this.dragging = false;
                    return;
                }
                this.onUploadFiles(file)
                this.file = file;
                this.dragging = false;
            },
            onUploadFiles(event) {
                this.uploadFiles = event;
                this.dragging = false;
                for(let i=0;i< this.uploadFiles.length; i++){
                    this.filename_attach.push(event[i].name)
                }
            },
            openDependentAttach(item,index){
                this.uploadDependentDocumentDialogOpen = !this.uploadDependentDocumentDialogOpen;
                this.selectedList = item
                this.userIndex = index
            },
            openDocument(fileUrl){
                window.open(fileUrl)
            },
            async attachFile1() {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                this.disableUpload = true
                if(this.uploadFiles == undefined || this.uploadFiles == '' || this.uploadFiles == null){
                  
                }else {
                    for(let i=0;i< this.uploadFiles.length; i++) {
                        if(this.uploadFiles[i].name != undefined) {
                            let upload_meta = {
                                file: this.uploadFiles[i],
                                filename: this.uploadFiles[i].name
                            }
                            await this.uploadImage1(upload_meta)

                            this.dependentAttach = {}
                            this.dependentAttach.link = this.link_url
                            this.dependentAttach.filename = this.link_filename
                            this.dependentAttach.created_by = this.selectedList._id,
                            this.dependentAttach.time = new Date()
                            this.dependentAttach.deleted = false
                            this.dependentAttach.documentType = 'Medical/Copy of Ecard'

                            this.processAttachFlag = true
                            this.addRequestFlag = true
                            this.disabledDependButton = true

                            this.selectedList.attachments.push(this.dependentAttach)
                            
                            await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/cycles/updateEmpDetails',this.selectedList)
                            .then(res => {
                                this.snack = true
                                this.snackColor = 'success'
                                this.snackText = 'Dependents Details Have Been Updated Successfully.'
                            })
                            .catch();
                        }
                    }
                    this.uploadFiles = ''
                    this.file = '';
                    this.filename_attach =  []
                    this.link_url = ''
                    this.link_filename = ''
                    this.disableUpload = false
                    this.snack = true
                    this.snackColor = 'green'
                    this.snackText = "File uploaded successfully."
                    this.processAttachFlag = false
                    this.uploadDependentDocumentDialogOpen = false
                    this.selectedList = {}
                    // this.userIndex = 0
                    // this.dependentAttach = {}
                    // this.addRequestFlag = false
                }

            },
            async uploadImage1(val) {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                const fd = new FormData();
                fd.append('a',val.file,val.name)
                fd.append('folder','users/'+this.selectedList.first_name + ' '+ this.selectedList.last_name)

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

                this.disableUpload = true
                if(this.uploadFiles == undefined || this.uploadFiles == '' || this.uploadFiles == null){
                  
                }else {
                    for(let i=0;i< this.uploadFiles.length; i++) {
                        if(this.uploadFiles[i].name != undefined) {
                            let upload_meta = {
                                file: this.uploadFiles[i],
                                filename: this.uploadFiles[i].name
                            }
                            await this.uploadImage(upload_meta)

                            this.principalAttach = {}
                            this.principalAttach.link = this.link_url
                            this.principalAttach.filename = this.link_filename
                            this.principalAttach.created_by = this.employee._id,
                            this.principalAttach.time = new Date()
                            this.principalAttach.deleted = false
                            this.principalAttach.documentType = 'Medical Application Form'

                            this.processAttachFlag = true
                            this.addRequestFlag = true
                            this.disabledPrincipalButton = true
                        }
                    }
                    this.uploadFiles = ''
                    this.file = '';
                    this.filename_attach =  []
                    this.link_url = ''
                    this.link_filename = ''
                    this.disableUpload = false
                    this.snack = true
                    this.snackColor = 'green'
                    this.snackText = "Files uploaded successfully."
                    this.processAttachFlag = false
                    this.uploadPrincipalDocumentDialogOpen = false
                    // this.addRequestFlag = false
                }
            },
            async uploadImage(val) {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                const fd = new FormData();
                fd.append('a',val.file,val.name)
                fd.append('folder','users/'+this.employee.first_name + ' '+ this.employee.last_name)

                await this.$axios.$post("/users/upload-files", fd, {headers: { Authorization: AuthStr }})
                .then(res => {
                    this.link_url = res.url
                    this.link_filename = res.name
                })
                .catch();
            },
            deletePrincipalDoc(item){
                this.principalAttach = {}
                this.disabledPrincipalButton = false
            },
            deleteDependentDoc(){
                this.dependentAttach = {}
                this.disabledDependButton = false
            },
            async addDependentRequest(user){
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                this.createRequestLoading = true

                let obj = {
                    status: 'processing',
                    deleted: false,
                    category_id: '',
                    parent_id: '',
                    user_id: user._id,
                    company_id: user.parent_id, 
                    principal_type: user.principal_type,
                    insurance_type: user.insurance_type,
                    process:[],
                    request_type: 'Addition',
                    has_dependency: user.has_dependency,
                    payment_details: {},
                    principal_id: user.principal_id
                }

                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/addition/new',obj)
                .then(res => {
                    this.$emit('add',{})
                    this.dialogAddDependent = false
                    this.createRequestLoading = false
                    this.selectedItem = {}
                    this.snack = true
                    this.snackColor = 'success'
                    this.snackText = 'Insurance Dependent Request Has Been Created'
                })
                .catch();

            },
            confirmAddDialogOpen(item, index){
                this.selectedItem = item
                this.dialogAddDependent = true
            },
            openDependentDialogDetails(item,index){
                this.showDetails = item
            },
            addInsuranceDependentRequest(){
                this.insuranceDependentAdditionFlag = false
                this.snack = true
                this.snackColor = 'success'
                this.snackText = 'Insurance Dependent Successfully Added'
                this.checkDependentList(this.employee)
            },
            closeInsuranceDependentAddition(event) {
                this.insuranceDependentAdditionFlag = false
            },
            close(){
                this.$emit('close',{})
            },
            selectInsurance(provider_id){
                this.selectedInsurnace = this.insuranceAdditionValidation.filter( item => item._id.provider_id == provider_id)[0]
                if(this.selectedInsurnace.status == 'Success') {
                    this.selectedInsurnaceCategory = this.selectedInsurnace.result.filter( item => item._id.provider_id == provider_id)[0].categories[0]
                    this.insuranceAddition.category = this.selectedInsurnaceCategory.category_id
                    
                    if(this.parent_company_id == '62fb68ad9f14e35fe7eda269'){

                        let ageFound = this.calculateAge(this.employee.personal.dob)
                        this.AUHSelectedCategory = this.selectedInsurnace.result[0].categories.filter(category => {
                            const ageRange = category.name.split('-');
                            const minAge = parseInt(ageRange[0]);
                            const maxAge = parseInt(ageRange[1]);
                            
                            return ageFound >= minAge && ageFound <= maxAge;
                        });
                        
                        this.insuranceAddition.category = this.AUHSelectedCategory[0].category_id
                    }
                }
                else{
                    this.selectedInsurnaceCategory = {}
                    this.insuranceAddition.category = ''
                }
            },
            selectInsuranceCategory(provider_id, category_id){
                this.selectedInsurnaceCategory = this.selectedInsurnace.result.filter( item => item._id.provider_id == provider_id)[0].categories.filter(category => category.category_id == category_id)[0]
            },
            calculateNoOfDays(dateString){
                const currentDate = new Date();
                const inputDate = new Date(dateString);
                const oneDay = 24 * 60 * 60 * 1000; // number of milliseconds in one day

                // Calculate the difference in days between the input date and the current date
                const diffDays = Math.round(Math.abs((currentDate - inputDate) / oneDay));

                return diffDays;
            },
            async addInsuranceRequest(){
                if(this.$refs.action_form.validate()) {
                    const token =  this.$store.getters.getToken
                    const AuthStr = 'Bearer '.concat(token);
                
                    let dependentArray = []
                    dependentArray = this.clonedDependentList.map(obj => ({
                        _id: obj._id,
                        attachments: obj.attachments,
                        payment_details: {
                            renewal_status: obj.renewal_status ? obj.renewal_status : 'Renew',
                            payment_status: obj.payment_status,
                            payment_mode: obj.payment_mode,
                            ...(obj.department_amount && { department_amount: obj.department_amount }),
                            ...(obj.other_amount && { other_amount: obj.other_amount }),
                            ...(obj.paid_by && { paid_by: obj.paid_by })
                        },
                        addition_status: 'inprogress',
                        addson: obj.addson,
                        category: this.insuranceAddition.category
                    }))

                    let obj = {
                        approvals: [
                            {
                            "approver_id": "",
                            "status": "Processing",
                            "approved_date": "",
                            "reason": ""
                            }
                        ],
                        previous_visa: this.previous_visa_type,
                        certificate_of_continuity: this.principal_certificate_of_continuity,
                        category_id: this.insuranceAddition.category,
                        parent_id:this.selectedInsurnace._id.provider_id,
                        user_id:this.employee._id,
                        payment_details: this.payment_details,
                        process:[],
                        insurance_type: this.insurance_type,
                        principal_type: this.principal_type,
                        principal_id:  this.employee._id,
                        dependents: dependentArray,
                        attachments: [],
                        user_location: this.user_location,
                        addson: this.addson._id,
                        company_id: this.parent_company,
                        parent_company_id: this.parent_company_id,
                        agent_id: this.agent_id,
                        requested_mail_id: this.$store.getters.getThisUser,
                        // company_id:"6447d4a333e143886ebb712a",
                        // parent_company_id: '62fb68ad9f14e35fe7eda269'
                    }

                    if(this.parent_company_id == '62fb3df39f14e35fe7ed9c9a') {
                        //It will fetch all keys values
                        const matchKeys = this.ruleSet.reduce((acc, rule) => {
                            Object.keys(rule.match).forEach(key => {
                                if (!acc.includes(key)) {
                                acc.push(key);
                                }
                            });
                            return acc;
                        }, []);

                        //cloning original obj to updateUser variable
                        this.updateUser = this.updateFields(_.cloneDeep(obj), matchKeys)

                        //this for loop will run on ruleSet array and update the fields in updateUser obj.Here this object will get updated
                        for(let index = 0; index < this.ruleSet.length; index++) {
                            const rule = this.ruleSet[index];
                            this.snack = true
                            this.snackColor = 'error'
                            this.snackText = rule.message 


                            let matchFound = true;
                            for(let [key, value] of Object.entries(rule.match)) {
                                if(key === 'payment_details') {
                                    for(let [innerKey, innerValue] of Object.entries(value)) {
                                        if(this.updateUser[key][innerKey] !== innerValue) {
                                            matchFound = false;
                                            break;
                                        }
                                    }
                                } else if(this.updateUser[key] !== value) {
                                    matchFound = false;
                                    break;
                                }
                            }
                            if(matchFound) {
                                this.updateUser.payment_details = Object.assign({}, this.updateUser.payment_details, rule.output.payment_details);
                                this.updateUser.payment_details.payment_mode = rule.output.payment_mode;
                                break;
                            }
                        }


                        //This method will undo the fields names where we converted the fields in above updateUser initialization
                        obj = this.NewObjUpdateFields(_.cloneDeep(this.updateUser))


                    
                        if((this.calculateNoOfDays(this.principal_visa_change_status_date) > 30 || this.calculateNoOfDays(this.principal_visa_entry_date) > 30) && this.disabledPrincipalButton == false) {
                            this.snack = 'true'
                            this.snackColor = 'error'
                            this.snackText = 'Please Upload Document for Principal/Dependent'
                        }else {
                            let empObj = this.employee
                            empObj.documents.visa_change_status_date = this.principal_visa_change_status_date
                            empObj.documents.visa_entry_date = this.principal_visa_entry_date
                            // empObj.onboarding.user_location = this.user_location

                            // let arr = []
                            // arr.push(empObj)
                            
                            let documentObj = {
                                visa_change_status_date: this.principal_visa_change_status_date,
                                visa_entry_date: this.principal_visa_entry_date
                            }
                            
                            
                            if(this.principal_type == 'Principal'){

                                this.employee.documents.push(documentObj)
    
                                let obj1 = {
                                    'documents': this.employee.documents
                                } 

                                await this.$axios.$patch(`/users/${this.employee._id}`, obj1, { headers: { Authorization: AuthStr } })
                                .then((res) => {
                                    this.snack = true
                                    this.snackColor = 'success'
                                    this.snackText = 'User Visa Issuance Date Has Been Updated'
                                })
                            } else if(this.principal_type == 'Dependent'){
                                let depObj = {
                                    'dependent': empObj,
                                    'parent_company': this.parent_company
                                }
                                await this.$axios.post(process.env.insurancePortalUrl+'insuranceaddition/updatedependents', depObj)
                                .then((res) => {
                                    this.snack = true
                                    this.snackColor = 'success'
                                    this.snackText = 'Dependent Visa Issuance Date Has Been Updated'
                                })
                            }



                            // await this.$axios.$put("/users/update/"+empObj._id, arr, {headers: { Authorization: AuthStr }})
                            // .then(res => {
                            //     this.snack = true
                            //     this.snackColor = 'success'
                            //     this.snackText = 'User Visa Issuance Date Has Been Updated'
                            // })
                            // .catch();

                            if(this.calculateNoOfDays(this.principal_visa_change_status_date) > 30 ) {
                                obj.attachments.push(this.principalAttach)
                                // console.log(obj, '-------------else ifobj with Pushed')
                                this.addRequestLoading = true

                                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/addition/new',obj)
                                .then(res => {
                                    this.$emit('add',{})
                                    dependentArray = []
                                    this.addRequestLoading = false
                                    this.processAttachFlag = false
                                    this.addRequestFlag = false
                                })


                            } else if(this.calculateNoOfDays(this.principal_visa_entry_date) > 30) {
                                obj.attachments.push(this.principalAttach)

                                this.addRequestLoading = true

                                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/addition/new',obj)
                                .then(res => {
                                    this.$emit('add',{})
                                    dependentArray = []
                                    this.addRequestLoading = false
                                    this.processAttachFlag = false
                                    this.addRequestFlag = false
                                })

                            }
                            else {
                                obj.attachments = []
                                // console.log(obj, '----------else else obj without push')
                                this.addRequestLoading = true

                                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/addition/new',obj)
                                .then(res => {
                                    this.$emit('add',{})
                                    dependentArray = []
                                    this.addRequestLoading = false
                                    this.processAttachFlag = false
                                    this.addRequestFlag = false

                                })
                                .catch();
                            }
                        }
                    } else if(this.parent_company_id == '62fb68ad9f14e35fe7eda269'){
                        
                        this.employee.personal.provider_id = this.insuranceAddition.provider_id
                        for(let index = 0; index < this.ruleSet.length; index++) {
                            const element = this.ruleSet[index]
                            let flag = true
                            for(let [key, value] of Object.entries(element.match)) {
                                if(this.employee.personal[key] != value){
                                    flag = false
                                }
                            }
                            if(flag) {
                                this.snack = true
                                this.snackColor = 'error'
                                this.snackText = element.message
                                for(let [key, value] of Object.entries(element.output)) {
                                    obj[key] = value
                                }
                            }
                        }

                        let empObj = this.employee
                        empObj.documents.visa_change_status_date = this.principal_visa_change_status_date ? this.principal_visa_change_status_date : ''
                        empObj.documents.visa_entry_date = this.principal_visa_entry_date ? this.principal_visa_entry_date : ''

                        // let arr = []
                        // arr.push(empObj)


                        let documentObj = {
                            visa_change_status_date: this.principal_visa_change_status_date,
                            visa_entry_date: this.principal_visa_entry_date
                        }
                        
                        
                        if(this.principal_type == 'Principal'){
                            this.employee.documents.push(documentObj)
    
                            let obj1 = {
                                'documents': this.employee.documents
                            }

                            await this.$axios.$patch(`/users/${this.employee._id}`, obj1, { headers: { Authorization: AuthStr } })
                            .then((res) => {
                                this.snack = true
                                this.snackColor = 'success'
                                this.snackText = 'User Visa Issuance Date Has Been Updated'
                            })
                        }else if(this.principal_type == 'Dependent'){
                            let depObj = {
                                'dependent': empObj,
                                'parent_company': this.parent_company
                            }
                            await this.$axios.post(process.env.insurancePortalUrl+'insuranceaddition/updatedependents', depObj)
                            .then((res) => {
                                this.snack = true
                                this.snackColor = 'success'
                                this.snackText = 'Dependent Visa Issuance Date Has Been Updated'
                            })
                        }

                        // await this.$axios.$put("/users/update/"+empObj._id, arr, {headers: { Authorization: AuthStr }})
                        // .then(res => {
                        //     this.snack = true
                        //     this.snackColor = 'success'
                        //     this.snackText = 'User Visa Issuance Date Has Been Updated'
                        // })

                        obj.attachments = []
                        this.addRequestLoading = true

                        await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/addition/new',obj)
                        .then(res => {
                            this.$emit('add',{})
                            dependentArray = []
                            this.addRequestLoading = false
                            this.processAttachFlag = false
                            this.addRequestFlag = false
                        })
                    }
                }
            },
            updateFields(obj,matchKeys) {
                for(let i = 0; i < matchKeys.length; i++) {
                    const element = matchKeys[i]
                    
                    if(element == 'category') {
                        obj['category'] = obj.category_id
                        obj['provider_id'] = obj.parent_id
                    }
                    obj['parent_id'] = obj.company_id

                }
                //   obj.category = obj.category_id;
                //   obj.provider_id = obj.parent_id;
                //   obj.parent_id = obj.company_id;

                delete obj.category_id
                delete obj.company_id;
                //   delete obj.parent_id;
                
                return obj;
            },
            NewObjUpdateFields(obj) {
                obj.company_id = obj.parent_id
                obj.category_id = obj.category;
                obj.parent_id = obj.provider_id

                delete obj.category;
                delete obj.provider_id
                
                return obj;
            },
            async checkDependentList(employee){
                this.insuranceAdditionLoading = true

                let checkObj = {
                    "user_id": employee._id,
                    "parent_id": this.parent_company,
                }

                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/validation/checkdependentlist',checkObj)
                .then(res => {
                    this.dependentList = res
                    this.clonedDependentList = _.cloneDeep(this.dependentList)

                    if(this.clonedDependentList.length > 0) {
                        this.clonedDependentList.forEach(obj => {
                            const newDays = this.calculateNoOfDays(obj.documents.visa_change_status_date)
                            if(newDays > 30) {
                                this.dependentCheck = true
                            }
                        });
                    }
                    this.insuranceAdditionLoading = false
                })
            },
            async addInsurance(employee){
                this.insuranceAdditionLoading = true;

                const token =  this.$store.getters.getToken;
                const AuthStr = 'Bearer '.concat(token);

                function getAge(dateString) {
                    var today = new Date();
                    var birthDate = new Date(dateString);
                    var age = today.getFullYear() - birthDate.getFullYear();
                    var m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return age;
                }
                
                let passport_number = ''
                let emiratesID_number = ''

                if(this.principal_type == 'Principal'){
                    passport_number = employee.document?.passport_no?.document_number
                    emiratesID_number = employee.document?.emirates_no?.document_number
                } else if(this.principal_type == 'Dependent'){
                    passport_number = employee.documents.passport_number
                    emiratesID_number = employee.documents.emiratesID_number
                }

                let addObj = {
                    "user_id":employee._id,
                    "age":getAge(employee.personal.dob),
                    "insured_type": this.principal_type,
                    "legal_entity": this.legal_entity,
                    "passport_number": passport_number ? passport_number: '',
                    "emiratesID_number": emiratesID_number ? emiratesID_number : '',
                    "company_id": this.parent_company,
                    "parent_company_id": this.parent_company_id,
                    // "company_id":"6447d4a333e143886ebb712a",
                    // "parent_company_id": '62fb68ad9f14e35fe7eda269'
                }
                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/validation/checkvalidation',addObj)
                .then(async res => {
                    await this.$axios.$get(process.env.insurancePortalUrl+ 'insurance/getinsuranceagents')
                    .then( response => {
                        if(this.employee.insurance_agent){
                            this.agentList = response.map(agent => agent._id === this.employee.insurance_agent._id);
                            this.agent_id = this.agentList[0]._id;
                        } else {
                            this.agentList = this.insuranceAgent 
                            ? response.filter(agent => agent._id === Object.keys(this.insuranceAgent)[0]) 
                            : response;
                            if(this.insuranceAgent) this.agent_id = this.agentList[0]._id;
                        }
                    });
                    this.insuranceAdditionLoading = false
                    this.insuranceAdditionValidation = res
                    this.insuranceAddition.provider_id = this.insuranceAdditionValidation[0]._id.provider_id
                    this.selectInsurance(this.insuranceAdditionValidation[0]._id.provider_id)
                    this.checkDependentList(employee)
                    this.getRulesSet(this.parent_company_id, this.insuranceAddition.provider_id)
                    this.getAddsOnList(this.parent_company_id, this.insuranceAddition.provider_id)
                })
                .catch();
            },
            async getRulesSet(parent_company_id, provider_id) {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
                await this.$axios.$post(process.env.insurancePortalUrl+ 'company/insurance/cycles/' + parent_company_id + '/getRules/' + provider_id,{headers: { Authorization: AuthStr }})
                .then((res) => {
                    this.ruleSet = res
                })
            },
            async getAddsOnList(parent_company_id, provider_id) {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
                await this.$axios.$get(process.env.insurancePortalUrl+ 'company/insurance/' + parent_company_id + '/listallAddson/' + provider_id,{headers: { Authorization: AuthStr }})
                .then((res) => {
                    this.addsOnList = res
                    this.addsOnList.unshift('none')
                })

                // if(parent_company_id == '62fb68ad9f14e35fe7eda269' && this.employee.personal.gender.toLowerCase() == 'female' && this.employee.personal.marital_status.toLowerCase() == 'married') {
                //     this.addsOnList = this.addsOnList.filter((a) => a.plan == 'Married')
                //     this.addson = this.addsOnList[0]
                // }
            },
            getAddsOnName(val){
                if(val) {
                let abc = this.addsOnList.filter(a => a._id == val)
                    return abc.length > 0 ? abc[0].name : val
                } else {
                    return val
                }
            },
            computePrincipalType (insurance_type){
                if(insurance_type === "Individual"){
                    this.isIndividual  = true;
                } else {
                    this.isIndividual  = false;
                }
            },
            getBack(){
                this.isIndividual  = false;
            }
        },
        computed: {
            computeAUHCertificateOfContinuityCheck(){
                if(this.calculateNoOfDays(this.principal_certificate_of_continuity) > 30) {
                    return this.visaCOCCheck = true
                } else {
                    return this.visaCOCCheck = false
                }
            },
            computeAUHVisaChangeStatusDate(){
                if(this.calculateNoOfDays(this.principal_visa_change_status_date) > 11) {
                    return true
                }
            },
            computeAUHVisaEntryDate(){
                if(this.calculateNoOfDays(this.principal_visa_entry_date) > 11) {
                    return true
                }  
            },
            computeVisaIssueDateCheck(){
                if(this.calculateNoOfDays(this.principal_visa_change_status_date) > 30) {
                    return true
                }
            },
            computeVisaEntryDateCheck(){
                if(this.calculateNoOfDays(this.principal_visa_entry_date) > 30) {
                    return true
                }
            },
            computedDependentHeader(){
                if(this.clonedDependentList.filter((a) => a.payment_mode == 'Partial').length > 0) {
                    return [
                        { text: "Employee Name" ,value: "dependentList.first_name" },
                        { text: "Principal Name" ,value: "dependentList.principal_name" },
                        { text: "Relation to Principal", value: "dependentList.relation_to_principal" },
                        // { text: "Renewal Status", value: "" },
                        { text: "AddOns", value: ''},
                        { text: "Payment Status", value: "" },
                        { text: "Payment Mode", value: "" },
                        { text: "Department Amount", value: "" },
                        { text: "Other Amount", value: "" },
                        { text: "Paid by", value: "" },
                        { text: "Action" ,value: "" },
                    ]
                } else {
                    return [
                        { text: "Employee Name" ,value: "dependentList.first_name" },
                        { text: "Principal Name" ,value: "dependentList.principal_name" },
                        { text: "Relation to Principal", value: "dependentList.relation_to_principal" },
                        // { text: "Renewal Status", value: "" },
                        { text: "AddOns", value: ''},
                        { text: "Payment Status", value: "" },
                        { text: "Payment Mode", value: "" },
                        { text: "Action" ,value: "" },
                    ]
                }
            }
        }
    }
</script>
<style>

    .phonePersonal{
        display: none !important;
    }
    .phoneHover:hover .phonePersonal{
        display: block !important;
    }
    .phoneHover:hover .phoneWork{
        display: none !important;
    }
    .directoryCard{
        transition: all .2s ease-in-out; 
        position: relative;
        overflow: hidden;
    }
    .directorySwitch{
        transition: all .2s ease-in-out; 
        cursor: pointer;
        position: absolute;
        bottom: -62px;
        right: -47px;
        width: 90px;
        height: 90px;
        border-radius: 50px;
        background-color: transparent;
    }
    
    .directoryCard:hover{
        box-shadow: rgb(45 45 45 / 5%) 0px 2px 2px, rgb(49 49 49 / 5%) 0px 4px 4px, rgb(42 42 42 / 5%) 0px 8px 8px, rgb(32 32 32 / 5%) 0px 16px 16px, rgb(49 49 49 / 5%) 0px 32px 32px, rgb(35 35 35 / 5%) 0px 64px 64px !important;
        transform: scale(1.025);
    }
    .directoryCard:hover .directorySwitch{
        background-color: #6182F0;
    }
    .directorySearch .v-input__slot:before,.directorySearch .v-input__slot:after{
        border-color: transparent !important;
        border-style: none !important;
    }
    .directorySearch .v-input input{
        color: #0A2C4F !important;;
    }
    .directorySearch .v-text-field__details{
        display: none;
    }
    .customCommentSection {
        padding: 2px 0px 17px 24px;
        background-color: #f5f5f5;
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }
    .addComment .v-input{
        padding-top: 0;
    }
    .addComment .v-input__slot:before,.attendanceSearch .v-input__slot:after{
        border-color: transparent !important;
        border-style: none !important;
    }
    .addComment .v-input__slot:before,.attendanceSearch .v-input__slot:before{
        border-color: transparent !important;
        border-style: none !important;
    }
    .addComment .v-input--is-focused{
        color: transparent !important;
        caret-color: transparent !important;
    }
    .insideSearch .v-list-item--link:before{
        border-color: transparent !important;
    }
    .editProfileTab .v-tabs-slider-wrapper{
    display: none;
    }
    .editProfileTab .v-tab--active{
        color:#0064D7 !important ;
        background-color: #F0F8FF !important;
    }
    .editSection .v-text-field > .v-input__control > .v-input__slot:before {
        border-color: rgb(211 211 211 / 42%) !important;
    }
    .insuranceEdit .v-file-input{
        padding-top: 0;
        margin-top: 0;
    }
    
</style>
<style scoped>
.selectcus{
    --vs-dropdown-option-padding: 3px 20px;

}
.todayStatusChipDirectory{
    position: absolute;
    bottom: -11px;
    z-index: 4;
    left:29%;
    align-items: center !important;
}

.todayLeaveStatusChipDirectory{
    align-items: center !important;
    position: absolute;
    bottom: -11px;
    z-index: 4;
    left:29%;
    background-color:#C97C7C !important

}
.ChatFileInput .mdi-paperclip::before {
    content: url('/header/paperclip-2.svg') !important;
}
</style>
<style lang="scss" scoped>
.grad1 {
//   height: 350px;
  background-color: #1565C0; /* For browsers that do not support gradients */
  background-image: linear-gradient(#1565C0, #F5F5F5);
}
.outline_upload{
    border: 00.0312rem dotted #1565C0;
}
.colorBackgrnd{
    background-color: #237ABC;
}

.grey-text-color{
     color: #707070;
}

.scroll {
    max-height: 160px;
    overflow-y: auto;
}
.dropZone {
  width: 250px;
  height: 200px;
  position: relative;
  border: 2px dashed #eee;
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
  width: 80%;
  height: 200px;
  position: relative;
  border: 2px dashed #eee;
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
