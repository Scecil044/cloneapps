<template>
    <div>
        <v-card  flat class="px-3 rounded-xl" min-height="800" v-if="upgradeLoading">
            <v-card-title class="px-1 px-6" >
                <v-img src="/hr/employee.svg"  max-width="fit-content" height="20" contain class="mr-3"></v-img>
                <span class="darkBlue-heading-text subHeadingFontSize">Loading...</span>
            </v-card-title>
            <v-card-text class="text-center" style="height: 800px; display: flex; justify-content: center;">
                <v-img src="/animated/ring.svg" max-width="fit-content" class="mr-3" contain ></v-img>
            </v-card-text>
        </v-card>
        <v-card flat class="px-3 rounded-xl" min-height="800" v-if="insuranceUpgradeValidation && insuranceUpgradeValidation.status == 'Error'">
            <v-card-title class="pa-6">
                <h2 class="headline font-weight-light grey-heading-text">Upgrade <span>&nbsp;Principal/Dependents</span> Details</h2>
                <v-spacer></v-spacer>
                <v-img @click="close()" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" class="notificationBanner">
                        <div class="py-0 px-4 fontSize2 font-weight-normal darkBlue-heading-text">
                            <ul>
                                <li>{{ insuranceUpgradeValidation.result[0] }}</li>
                            </ul>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-card class="pa-0 rounded-xl" :height="this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.md || this.$vuetify.breakpoint.lg ? '580px':'840px'" style="overflow-x: hidden;" v-if="insuranceUpgradeValidation && insuranceUpgradeValidation.status == 'Success'">
            <v-card-title class="pa-6">
                <h2 class="headline font-weight-light grey-heading-text">Upgrade <span>&nbsp;Principal/Dependents</span> Details</h2>
                <v-spacer></v-spacer>
                <v-img @click="close()" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
            </v-card-title>
            <v-card-text>
                <v-form ref="my_form">
                    <v-row class="">
                        <v-col cols="12" sm="12" md="12" lg="12">
                            <!-- <v-row> -->
                                <v-col cols="12" class="d-flex justify-space-between align-center">
                                    <h3 class="darkBlue-heading-text subHeadingFontSize">Principal Information
                                        <!-- <v-tooltip top v-if="userInsuranceDetails.length > 0">
                                            <template v-slot:activator="{ on: attrs }">
                                                <v-icon @click="openUserDetailsDialogOpen = true" v-on="{...attrs}">mdi-information-outline</v-icon>
                                            </template>
                                            Click to View Existing Details
                                        </v-tooltip> -->
                                    </h3>
                                </v-col>
                                <v-row v-if="userInsuranceDetails.length > 0">
                                    <v-col cols="4">
                                        <h5 class="grey-heading-text textFontSize font-weight-medium">Employee Name</h5>
                                        <p class="pb-0">{{employee.first_name + " " + employee.last_name}}</p>
                                    </v-col>
                                    <v-col cols="4">
                                        <h5 class="grey-heading-text textFontSize font-weight-medium">Category</h5>
                                        <p class="pb-0">{{userInsuranceDetails[0].category_name}}</p>
                                    </v-col>
                                    <v-col cols="4">
                                        <h5 class="grey-heading-text textFontSize font-weight-medium">Plan Name</h5>
                                        <p class="pb-0">{{userInsuranceDetails[0].plan}}</p>
                                    </v-col>
                                </v-row>
                                <v-row v-if="userInsuranceDetails.length > 0">
                                    <v-col cols="4">
                                        <h5 class="grey-heading-text textFontSize font-weight-medium">Renewal Status</h5>
                                        <p class="pb-0">{{ userInsuranceDetails[0].renewal_status }}</p>
                                    </v-col>
                                    <v-col cols="4">
                                        <h5 class="grey-heading-text textFontSize font-weight-medium">Payment Mode</h5>
                                        <p class="pb-0">{{ userInsuranceDetails[0].payment_mode }}</p>
                                    </v-col>
                                    <v-col cols="4">
                                        <h5 class="grey-heading-text textFontSize font-weight-medium">Payment Status</h5>
                                        <p class="pb-0">{{ userInsuranceDetails[0].payment_status }}</p>
                                    </v-col>
                                </v-row>
                            <!-- </v-row> -->
                            <v-row class="mx-0" style="max-width:100%">
                                <v-col cols="12" class="px-5">
                                    <v-row>
                                        <v-col cols="3" v-if="userInsuranceDetails.length > 0 && cycle != ''">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Category</p>
                                            <v-select :items="sortedLowerCategories" item-text="name" item-value="_id" dense outlined v-model="principalObj.category" :rules="genericRule"></v-select>
                                        </v-col>
                                        <v-col cols="3">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Payment Status</p>
                                            <v-select dense outlined :items="['Paid','Not Paid']" v-model=principalObj.payment_status :rules="genericRule"></v-select>
                                        </v-col>
                                        <!-- <v-col cols="3">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Renewal Status</p>
                                            <v-select dense outlined :items="['Renew','Hold','Cancel']" v-model="principalObj.renewal_status" :rules="genericRule"></v-select>
                                        </v-col> -->
                                        <v-col cols="3">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Payment Mode</p>
                                            <v-select dense outlined :items="['Department', 'Principal', 'Partial', 'Customer']" v-model="principalObj.payment_mode" :rules="genericRule"></v-select>
                                        </v-col>
                                        <v-col cols="3" v-if="principalObj.payment_mode == 'Partial'">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Department Amount</p>
                                            <v-text-field dense outlined v-model="principalObj.payment_details.department_amount" :rules="genericRule"></v-text-field>
                                        </v-col>
                                        <v-col cols="3" v-if="principalObj.payment_mode == 'Partial'">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Other Amount</p>
                                            <v-text-field dense outlined v-model="principalObj.payment_details.other_amount" :rules="genericRule"></v-text-field>
                                        </v-col>
                                        <v-col cols="3" v-if="principalObj.payment_mode == 'Partial'">
                                            <p class="grey-heading-text font-weight-medium textFontSize">Paid By</p>
                                            <v-select dense outlined :items="['Principal','Customer','Department']" v-model="principalObj.payment_details.paid_by" :rules="genericRule"></v-select>
                                        </v-col>
                                    </v-row>
                                    <p class="grey-heading-text font-weight-medium textFontSize">Attachments</p>
                                    <v-row>
                                        <v-col cols="4" class="pb-3">
                                            <v-btn outlined text color="blue" :disabled="disabledPrincipalPromotionButton == true" @click="uploadPrincipalDocumentDialogOpen = !uploadPrincipalDocumentDialogOpen">
                                                Upload Promotion Letter
                                            </v-btn>
                                        </v-col>
                                        <v-col cols="4" class="pb-3">
                                            <v-btn outlined text color="blue" :disabled="disabledPrincipalMAFButton == true" @click="uploadMAFDialogOpen = !uploadMAFDialogOpen">Upload MAF</v-btn>
                                        </v-col>
                                    </v-row>
                                    <v-col class="pt-2 px-2">
                                    <h3 class="font-weight-medium textFontSize grey-heading-text">Principal Attachments</h3>
                                    </v-col>
                                    <v-row v-if="principalObj && principalObj.attachments">
                                        <v-col cols="3" v-for="(item,index) in principalObj.attachments" :key="index">
                                            <span class="darkBlue-heading-text font-weight-normal textFontSize" v-if="item !== '' && item !== undefined">
                                                <v-tooltip top>
                                                    <template v-slot:activator = "{ on: attrs }">
                                                    <v-btn v-on="{...attrs}" color="primary" small class="rounded-xl" outlined @click="openDocument(item.link)">
                                                        <v-icon small>mdi-file-document-outline</v-icon>{{item.filename | truncateText(10, '..')}}
                                                    </v-btn>
                                                    <v-icon small v-if="item.documentType == 'Promotion Letter' || item.documentType == 'Medical Application Form'" color="red" style="margin-left:-10px;margin-top:-20px" @click="deletePrincipalDoc(item)">mdi-close-circle-outline</v-icon>
                                                    </template>
                                                    {{ item.documentType }}
                                                </v-tooltip>
                                            </span>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-divider></v-divider>
                        <v-col cols="12" sm="12" md="12" lg="12" v-if="dependentList.length > 0">
                            <v-list>
                                <v-list-item dense v-for="(item, index) in dependentList" :key="index" class="mb-2">
                                    <v-row>
                                        <v-col cols="12">
                                            <v-col cols="12" class="d-flex justify-space-between align-center">
                                                <h3 class="darkBlue-heading-text subHeadingFontSize">Dependent Information
                                                    <v-tooltip top v-if="dependentList.length > 0">
                                                        <template v-slot:activator="{ on: attrs }">
                                                            <v-icon @click="fetchDependentDetails(item, index)" v-on="{...attrs}">mdi-information-outline</v-icon>
                                                        </template>
                                                        Click to View Existing Details
                                                    </v-tooltip>
                                                </h3>
                                            </v-col>
                                        </v-col>
                                        <v-col cols="12" class="px-5" v-if="clonedDependentList.length > 0">
                                            <v-row>
                                                <!-- <v-col cols="3" v-if="clonedDependentList.length > 0">
                                                    <p class="grey-heading-text font-weight-medium textFontSize">Category</p>
                                                    <v-text-field dense outlined :readonly="true" v-model="clonedDependentList[index].new_category" :value="getCategoryNameByID(category_list.filter(a => a._id == principalObj.category))"></v-text-field>
                                                    <v-select :items="category_list.filter(a => a._id == principalObj.category)" item-text="name" item-value="_id" dense outlined v-model="clonedDependentList[index].new_category" :rules="genericRule"></v-select>
                                                </v-col> -->
                                                <v-col cols="3">
                                                    <p class="grey-heading-text font-weight-medium textFontSize">Payment Status</p>
                                                    <v-select dense outlined :items="['Paid','Not Paid']" v-model="clonedDependentList[index].new_payment_status" :rules="genericRule"></v-select>
                                                </v-col>
                                                <!-- <v-col cols="3">
                                                    <p class="grey-heading-text font-weight-medium textFontSize">Renewal Status</p>
                                                    <v-select dense outlined :items="['Renew','Hold','Cancel']" v-model="clonedDependentList[index].new_renewal_status" :rules="genericRule"></v-select>
                                                </v-col> -->
                                                <v-col cols="3">
                                                    <p class="grey-heading-text font-weight-medium textFontSize">Payment Mode</p>
                                                    <v-select dense outlined :items="['Department', 'Principal', 'Partial', 'Customer']" v-model="clonedDependentList[index].new_payment_mode" :rules="genericRule"></v-select>
                                                </v-col>
                                                <v-col cols="3" v-if="clonedDependentList[index].new_payment_mode == 'Partial'">
                                                    <p class="grey-heading-text font-weight-medium textFontSize">Department Amount</p>
                                                    <v-text-field dense outlined v-model="clonedDependentList[index].new_department_amount" :rules="genericRule"></v-text-field>
                                                </v-col>
                                                <v-col cols="3" v-if="clonedDependentList[index].new_payment_mode == 'Partial'">
                                                    <p class="grey-heading-text font-weight-medium textFontSize">Other Amount</p>
                                                    <v-text-field dense outlined v-model="clonedDependentList[index].new_other_amount" :rules="genericRule"></v-text-field>
                                                </v-col>
                                                <v-col cols="3" v-if="clonedDependentList[index].new_payment_mode == 'Partial'">
                                                    <p class="grey-heading-text font-weight-medium textFontSize">Paid By</p>
                                                    <v-select dense outlined :items="['Principal','Customer','Department']" v-model="clonedDependentList[index].new_paid_by" :rules="genericRule"></v-select>
                                                </v-col>
                                            </v-row>
                                            <v-col class="pt-1 px-2">
                                                <h4 class="font-weight-medium textFontSize grey-heading-text">Dependent Attachments</h4>
                                            </v-col>
                                            <v-row v-if="item.attachments.length > 0">
                                                <v-col cols="3" v-for="(data,idx) in item.attachments" :key="idx">
                                                    <span class="darkBlue-heading-text font-weight-normal textFontSize" v-if="data !== '' && data !== undefined">
                                                        <v-tooltip top>
                                                            <template v-slot:activator = "{ on: attrs }">
                                                            <v-btn v-on="{...attrs}" color="primary" small class="rounded-xl" outlined @click="openDocument(data.link)">
                                                                <v-icon small>mdi-file-document-outline</v-icon>{{data.filename | truncateText(10, '..')}}
                                                            </v-btn>
                                                            </template>
                                                            {{ data.documentType }}
                                                        </v-tooltip>
                                                    </span>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </v-list-item>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-row>
                    <v-spacer></v-spacer>
                    <v-btn elevation="0" width="150px" color="#0064D7" class="white--text border-radius-medium" @click="upgradeRequest()">Upgrade</v-btn>
                </v-row>
            </v-card-actions>
        </v-card>

        <!--Upload Insurance Medical Application Form For Principal-->
        <v-dialog v-model="uploadMAFDialogOpen" max-width="800">
            <v-card style="overflow-x: hidden;">
                <v-card-title class="primary white--text">
                    <v-row>
                        <v-col class="py-0">
                            Upload Documents
                        </v-col>
                        <v-col class="text-right py-0">
                            <v-btn text @click="uploadMAFDialogOpen = false"><v-icon color="white">mdi-close</v-icon></v-btn>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-row class="pt-4 pl-4 pr-4">
                    <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
                        <p class="mb-0 caption blue-grey--text font-weight-bold">Medical Application Form</p>
                        <div v-if="!medicalFile">
                            <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                <div class="dropZone-info" @drag="onMedicalFile">
                                    <span class="fa fa-cloud-upload dropZone-title"></span>
                                    <span class="dropZone-title">Drop file or click to upload</span>
                                    <div class="dropZone-upload-limit-info">
                                        <div>maximum file size: 10 MB</div>
                                    </div>
                                </div>
                                <input type="file" accept=".pdf,.jpg,.jpeg" @change="onMedicalFile" multiple>
                            </div>
                        </div>
                        <div v-else class="dropZone-uploaded">
                            <div class="dropZone-uploaded-info">
                                <span class="dropZone-title">Added</span>
                                <button type="button" class="btn btn-primary removeFile" @click="removeFile('medicalApplicationForm')">Remove File</button>
                            </div>
                        </div>
                    </v-col>
                </v-row>
                <v-row class="pa-4">
                  <v-col class="text-center pt-0">
                    <v-btn outlined class="primary--text " :disabled="disableUpload" @click="attachFile1">Upload</v-btn>
                  </v-col>
                </v-row>
            </v-card>
        </v-dialog>

        <!--Upload Insurance Promotion Letter For Principal-->
        <v-dialog v-model="uploadPrincipalDocumentDialogOpen" max-width="800">
              <v-card max-width="800" style="overflow-x:hidden">
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
                <v-row class="pt-4 pl-4 pr-4">
                    <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
                        <p class="mb-0 caption blue-grey--text font-weight-bold">Promotion Letter</p>
                        <div v-if="!promotionFile">
                            <div :class="['dropZone', dragging ? 'dropZone-over' : '']" @dragenter="dragging = true" @dragleave="dragging = false">
                                <div class="dropZone-info" @drag="onPromotionLetterFile">
                                    <span class="fa fa-cloud-upload dropZone-title"></span>
                                    <span class="dropZone-title">Drop file or click to upload</span>
                                    <div class="dropZone-upload-limit-info">
                                        <div>maximum file size: 10 MB</div>
                                    </div>
                                </div>
                                <input type="file" accept=".pdf,.jpg,.jpeg" @change="onPromotionLetterFile" multiple>
                            </div>
                        </div>
                        <div v-else class="dropZone-uploaded">
                            <div class="dropZone-uploaded-info">
                                <span class="dropZone-title">Added</span>
                                <button type="button" class="btn btn-primary removeFile" @click="removeFile('promotionLetter')">Remove File</button>
                            </div>
                        </div>
                    </v-col>
                </v-row>
                <v-row class="pa-4">
                  <v-col class="text-center pt-0">
                    <v-btn outlined class="primary--text " :disabled="disableUpload" @click="attachFile1">Upload</v-btn>
                  </v-col>
                </v-row>
              </v-card>
        </v-dialog>


        <!--View Principal Details-->
        <v-dialog v-model="openUserDetailsDialogOpen" class="pa-0 rounded-xl" max-width="900" style="overflow-x: hidden;" v-if="userInsuranceDetails.length > 0">
            <v-card>
            <v-card-title class="pa-6">
                <span style="color: #4190ed;">View User Details</span>
                <v-spacer></v-spacer>
                <v-img @click="openUserDetailsDialogOpen = false" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
            </v-card-title>
            <v-card-text>
                <v-row class="mx-0" style="max-width:100%">
                <v-col cols="12" class="px-5">
                    <v-row>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize">Employee Name</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ employee.first_name + " " + employee.last_name }}</span>
                        </v-col>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize">Category</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{userInsuranceDetails[0].category_name}}</span>
                        </v-col>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize">Plan Name</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{userInsuranceDetails[0].plan}}</span>
                        </v-col>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize">Renewal Status</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ userInsuranceDetails[0].renewal_status }}</span>
                        </v-col>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize">Payment Mode</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{userInsuranceDetails[0].payment_mode}}</span>
                        </v-col>
                        <v-col cols="3">
                            <p class="grey-heading-text font-weight-medium textFontSize">Payment Status</p>
                            <span class="darkBlue-heading-text font-weight-normal textFontSize">{{userInsuranceDetails[0].payment_status}}</span>
                        </v-col>
                    </v-row>
                </v-col>
                </v-row>
            </v-card-text>
            </v-card>
        </v-dialog>


        <!--View Dependents Details-->
        <v-dialog v-model="openDependentDetailsDialogOpen" class="pa-0 rounded-xl" max-width="900" style="overflow-x: hidden;" v-if="dependentList.length > 0">
            <v-card>
                <v-card-title class="pa-6">
                    <span style="color: #4190ed;">View Dependent Details</span>
                    <v-spacer></v-spacer>
                    <v-img @click="openDependentDetailsDialogOpen = false" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25" height="auto" contain></v-img>
                </v-card-title>
                <v-card-text>
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12" class="px-5">
                            <v-row>
                                <v-col cols="3">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Employee Name</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ selectedList.first_name }}</span>
                                </v-col>
                                <v-col cols="3">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Principal Name</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ selectedList.principal_name }}</span>
                                </v-col>
                                <v-col cols="3">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Category</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{selectedList.category_name}}</span>
                                </v-col>
                                <v-col cols="3">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Plan Name</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{selectedList.plan}}</span>
                                </v-col>
                                <v-col cols="3">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Renewal Status</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{ selectedList.renewal_status }}</span>
                                </v-col>
                                <v-col cols="3">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Payment Mode</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{selectedList.payment_mode}}</span>
                                </v-col>
                                <v-col cols="3">
                                    <p class="grey-heading-text font-weight-medium textFontSize">Payment Status</p>
                                    <span class="darkBlue-heading-text font-weight-normal textFontSize">{{selectedList.payment_status}}</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-text>
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
    export default {
        props:['employee', 'clonedDependentList', 'dependentList','userInsuranceDetails', 'parent_company_id', 'parent_company', 'principal_type'],
        components: { },
        data() {
            return {
                category_list:[],
                principalObj: {
                    payment_status: '',
                    payment_mode: '',
                    renewal_status:'Renew',
                    category:'',
                    payment_details: {
                        department_amount: 0,
                        other_amount: 0,
                        paid_by: 'Principal'
                    },
                    attachments:[],
                },
                genericRule: [
                    v => !!v || 'This field is Required'
                ],
                disabledPrincipalPromotionButton:false,
                disabledPrincipalMAFButton: false,
                uploadPrincipalDocumentDialogOpen: false,
                uploadMAFDialogOpen: false,
                dragging: false,
                file:'',
                uploadFiles:'',
                filename_attach: [],
                disableUpload:false,
                link_url:'',
                link_filename:'',
                userID: {},
                medicalAttach: {},
                cycle: {},
                openUserDetailsDialogOpen: false,
                openDependentDetailsDialogOpen: false,
                selectedList: {},
                userIndex: 0,
                sortedLowerCategories: [],
                upgradeLoading: false,
                insuranceUpgradeValidation:[],
                snack: false,
                snackColor:'',
                snackText:'',
                attachedFiles: {
                    promotionLetter: {},
                    medicalApplicationForm: {}
                },
                promotionFile: '',
                medicalFile: '',
            }
        },
        async mounted(){
            const token =  this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            this.category_list = await this.$axios.$get(process.env.insurancePortalUrl+ 'company/insurance/' + this.parent_company_id + '/categories/all', {}, {headers: { Authorization: AuthStr }})

            await this.checkUpgradeRequest(this.employee)

            this.fetchUserAttachments(this.employee)
            this.fetchCycleDetails(this.parent_company)

            // console.log(this.userInsuranceDetails, '-------userInsuranceDetails')
            // console.log(this.category_list, '----------category_list')
        },
        methods:{
            close(){
                this.$emit('close',{})
            },
            async checkUpgradeRequest(user){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
                let obj = {
                    'company_id': user.parent_company,
                    'user_id': user._id,
                    'parent_company_id': user.parent_company_id
                }
                await this.$axios.$post(process.env.insurancePortalUrl+ 'company/insurance/upgradation/'+ this.parent_company_id + '/checkupgraderequest', obj, { headers : { Authorization: AuthStr } })
                .then((res) => {
                    this.insuranceUpgradeValidation = res
                })
            },
            fetchDependentDetails(item,index){
                this.userIndex = index
                this.selectedList = item
                this.openDependentDetailsDialogOpen = item
            },
            openDocument(fileUrl){
                window.open(fileUrl)
            },
            async fetchCycleDetails(id){
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
                this.upgradeLoading = true
                await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/cycles/getCycleDetails/'+id, { 'provider_id': this.userInsuranceDetails[0].provider_id, 'user_id': this.userInsuranceDetails[0].user_id } ,{headers: { Authorization: AuthStr }})
                .then(res => {
                    this.cycle = res[0]
                    // console.log(this.cycle, '---------this.cycle')
                    this.filteredCategories()
                    this.upgradeLoading = false
                })
            },
            async upgradeRequest(){
                if(this.$refs.my_form.validate()){
                    const token =  this.$store.getters.getToken
                    const AuthStr = 'Bearer '.concat(token);

                    if(this.principalObj.attachments.filter(a => a.documentType == 'Promotion Letter')[0] == '' || this.principalObj.attachments.filter(a => a.documentType == 'Promotion Letter')[0] == undefined) {
                        this.snack = true
                        this.snackColor = 'error'
                        this.snackText = 'Please Upload Promotion Letter'
                    } else if(this.principalObj.attachments.filter(a => a.documentType == 'Medical Application Form')[0] == '' || this.principalObj.attachments.filter(a => a.documentType == 'Medical Application Form')[0] == undefined) {
                        this.snack = true
                        this.snackColor = 'error'
                        this.snackText = 'Please Upload Medical Application Form'
                    } else {
                        this.principalObj.user_id = this.employee._id
                        this.principalObj.parent_company_id = this.parent_company_id
            
                        let newObj = {
                            status: 'processing',
                            deleted: false,
                            userObj: this.principalObj,
                            attachments: this.principalObj.attachments,
                            dependents: [],
                            parent_id: this.userInsuranceDetails[0].provider_id,
                            user_id: this.employee._id,
                            company_id: this.parent_company,
                            insurance_type: 'Group',
                            process:[],
                            request_type: 'Upgrade',
                            has_dependency: this.clonedDependentList.length > 0 ? 'true' : 'false',
                            principal_type: this.principal_type,
                            category_id: this.userInsuranceDetails[0].category,
                            parent_company_id: this.parent_company_id,
                            requested_mail_id: this.$store.getters.getThisUser,
                        }
                    
                        if(this.clonedDependentList.length > 0) {
                            for(let i = 0; i < this.clonedDependentList.length; i++) {
                                let depObj = {}
                                const element = this.clonedDependentList[i]
                                // depObj.category= element.new_category
                                depObj.category= this.principalObj.category
                                depObj.payment_mode= element.new_payment_mode
                                depObj.payment_status= element.new_payment_status
                                depObj.renewal_status= element.renewal_status
                                depObj.user_id = element.user_id
                                depObj.principal_type = element.principal_type
                                depObj.upgrade_status = 'inprogress'
                                depObj.parent_company_id = this.parent_company_id
                                depObj.attachments = []
                
                                const old_payment_details = {
                                    department_amount: element.payment_details.department_amount,
                                    other_amount: element.payment_details.other_amount,
                                    paid_by: element.payment_details.paid_by
                                }
                
                                const new_payment_details = {
                                    department_amount: element.new_department_amount,
                                    other_amount: element.new_other_amount,
                                    paid_by: element.new_paid_by
                                }
                
                                if(element.new_payment_mode == 'Partial') {
                                    depObj.payment_details = new_payment_details
                                } else {
                                    depObj.payment_details = old_payment_details
                                }
                
                                newObj.dependents.push(depObj)
                            }
                        }


                        await this.$axios.$post(process.env.insurancePortalUrl+ 'insurance/upgradation/new', newObj, {headers: { Authorization: AuthStr }})
                        .then(res => {
                            if(res.success || res.success == true || res.success == 'true') {
                                this.$emit('close', 'Upgrade Request Has Been Successfully Created.')                                
                            }else if(res.success == false || res.success == 'false'){
                                this.$emit('close', 'Already Request Is Existing!')
                            }
                        })
                        .catch();
                    }
                }
            },
            removeFile(val) {
                if(val == 'promotionLetter')  this.promotionFile = ''
                if(val == 'medicalApplicationForm')  this.medicalFile = ''
                // this.file = '';
            },
            onPromotionLetterFile(event){
                this.onChange(event, 'promotionLetter')
                this.attachedFiles.promotionLetter = this.uploadFiles
            },
            onMedicalFile(event){
                this.onChange(event, 'medicalApplicationForm')
                this.attachedFiles.medicalApplicationForm = this.uploadFiles
            },
            onChange(e, type) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length) {
                    this.dragging = false;
                    return;
                }
                this.createPromotionLetterFile(e, files, type);
            },
            createPromotionLetterFile(e,file, type) {
                if (file.size > 10000000) {
                    alert('please check file size is not more than 10 MB.')
                    this.dragging = false;
                    return;
                }
                this.onUploadFiles(file)
                if(type == 'promotionLetter') this.promotionFile = file
                if(type == 'medicalApplicationForm') this.medicalFile = file

                // this.file = file;
                this.dragging = false;
            },
            onUploadFiles(event) {
                this.uploadFiles = event;
                this.dragging = false;
                for(let i=0;i< this.uploadFiles.length; i++){
                    this.filename_attach.push(event[i].name)
                }
            },
            async attachFile1(){
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                let attach = {}
                this.disableUpload = true

                for (var key in this.attachedFiles){
                    if (!_.isEmpty(this.attachedFiles[key])){
                        for (let i = 0; i < this.attachedFiles[key].length; i++){
                            if (this.attachedFiles[key][i].name != undefined){
                                let upload_meta = {
                                    file: this.attachedFiles[key][i],
                                    filename: this.attachedFiles[key][i].name
                                } 
                                await this.uploadImage(upload_meta, key)
                                attach = {
                                    link: this.link_url,
                                    filename: this.link_filename,
                                    created_by: this.employee._id,
                                    time: new Date(),
                                    deleted: false
                                }

                                if(key == 'promotionLetter'){
                                    this.disabledPrincipalPromotionButton = true
                                    attach.documentType = 'Promotion Letter' 
                                } 
                                else if(key == 'medicalApplicationForm'){
                                    this.disabledPrincipalMAFButton = true
                                    attach.documentType = 'Medical Application Form' 
                                }
                            }else {
                                console.log('null')
                            }
                        }
                    }
                    
                    this.removeFile(key)
                }

                this.principalObj.attachments.push(attach)

                this.attachedFiles = {
                    promotionLetter: {},
                    medicalApplicationForm: {},
                }
                this.medicalFile = ''
                this.filename_attach =  []
                this.link_url = ''
                this.link_filename = ''
                this.disableUpload = false
                this.snack = true
                this.snackColor = 'green'
                this.snackText = "Files uploaded successfully."
                this.uploadPrincipalDocumentDialogOpen = false
                this.uploadMAFDialogOpen = false
                attach = {}
            },
            deletePrincipalDoc(item){
                this.principalObj.attachments = this.principalObj.attachments.filter(a => a !== item)
                if(item.documentType == 'Promotion Letter'){
                    this.disabledPrincipalPromotionButton = false
                } else if(item.documentType == 'Medical Application Form'){
                    this.disabledPrincipalMAFButton = false
                }
            },
            async fetchUserAttachments(user){
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                this.upgradeLoading = true

                let obj = {
                    parent_id: this.parent_company,
                    user_id: user._id,
                    company_id: this.parent_company
                }

                await this.$axios.$post(process.env.insurancePortalUrl+ 'company/insurance/upgradation/' + this.parent_company_id + '/fetchuserattachments', obj, { headers: { Authorization: AuthStr } })
                    .then(res => {
                    if(this.principalObj) {

                        if(res[0].attachments.length > 0) {
                            const checkDocumentType = ['passport','visa','emiratesID','labourCard']
    
                            const foundDocuments = res[0].attachments.filter(document => checkDocumentType.includes(document.documentType))
                            this.principalObj.attachments = []
                            for(let i = 0; i < foundDocuments.length; i++) {
                                const element = foundDocuments[i]
                                this.principalObj.attachments.push(element)
                            }
                        }
                    }
                    if(this.userInsuranceDetails[0].ecard != ''){
                        this.principalObj.attachments.push(this.userInsuranceDetails[0].attachments.filter(a => a.documentType == 'ecard')[0])
                    }
                    this.upgradeLoading= false
                })
            },
            async uploadImage(val ,folder) {
                const token =  this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);
                const fd = new FormData();
                fd.append('a',val.file,val.name)
                fd.append('folder', folder)
                // fd.append('folder','users/'+this.employee.first_name + ' '+ this.employee.last_name)
                await this.$axios.$post("/users/upload-files", fd, {headers: { Authorization: AuthStr }})
                .then(res => {
                    this.link_url = res.url
                    this.link_filename = res.name
                })
                .catch();
            },
            filteredCategories(){
                if(this.userInsuranceDetails.length > 0 && this.cycle != undefined) {
                    const userIDCategory = this.userInsuranceDetails[0].category;
                    const filteredCat = this.category_list.filter(category => this.cycle.categories.includes(category._id));
                    const mycategory = this.category_list.find(category => category._id === userIDCategory);

                    const lowerCategories = filteredCat.filter(category => category.name < mycategory.name);

                    // this.sortedLowerCategories = lowerCategories.sort((a, b) => b.name.localeCompare(a.name)).slice(0, 2);
                    this.sortedLowerCategories = lowerCategories.sort((a, b) => b.name.localeCompare(a.name));
                }
            }
        },
        computed: {
            
        }
    }
</script>
<style scoped>

.dropZone {
  width: 220px;
  height: 135px;
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
  width: 220px;
  height: 135px;
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