<template>
  <div>
    <v-row v-if="!showEditModel">
      <div v-for="(companyData, index) in companiesDetails" :key="index">

        <v-row>
          <v-col cols="12" class="pa-0">
            <!-- Top-Cards -->
            <CustomerCard class="mb-6" :data="DetailsCard" />
          </v-col>
          <v-col cols="12" class="pa-0">
            <div class="mb-6 d-flex align-center customer_icon">
              <v-hover v-slot="{ hover }">
                <v-avatar size="100" class="lighten-5 mr-0 mt-0 pt-0" v-if="companyData.logo">
                  <v-img :src="companyData.logo" contain>
                    <v-expand-transition>
                      <div v-if="hover" @click="imageEdit = true"
                        class="d-flex transition-fast-in-fast-out black v-card--reveal white--text"
                        style="height: 35%;">
                        Edit
                      </div>
                    </v-expand-transition>
                  </v-img>
                </v-avatar>
                <v-avatar size="100" class="lighten-5 mr-0 mt-0 pt-0" v-else>
                  <v-img src="./customer_default_icon.svg" contain>
                    <v-expand-transition>
                      <div v-if="hover" @click="imageEdit = true"
                        class="d-flex transition-fast-in-fast-out black v-card--reveal white--text"
                        style="height: 35%;">
                        Edit
                      </div>
                    </v-expand-transition>
                  </v-img>
                </v-avatar>
              </v-hover>

              <div>
                <h4 class="ml-5">{{ companyData.company_name }}</h4>
                <span class="cardBtn accent4 white--text" style="margin-left:20px !important"
                  v-if="companyData.status?.toLowerCase() == 'active'">{{ companyData.status
                  }}</span>
                <span class="cardBtn accent2 white--text" style="margin-left:20px !important"
                  v-if="companyData.status?.toLowerCase() == 'inactive'">{{ companyData.status
                  }}</span>
                <span class="cardBtn accent3 white--text" style="margin-left:20px !important"
                  v-if="companyData.status?.toLowerCase() == 'new'">{{ companyData.status
                  }}</span>
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row>
          <!-- COMPANY DETAILS TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
            :headers="companyHeaders" :items="companiesDetails" hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <InfoSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
                <v-btn class="customer_table_btn" outlined color="primary"
                  @click="handleEditModel(companyHeaders[0].text)">{{ header.text
                  }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item }">

              <tr>
                <td class="pr-0">Legal Name</td>
                <td class="pb-2">{{ item.legal_name }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Company Name</td>
                <td class="pb-2">{{ item.company_name }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Registration Number</td>
                <td class="pb-2">{{ item.registration_number }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Phone No</td>
                <td class="pb-2">{{ item.phone }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Email Address</td>
                <td class="pb-2">{{ item.email }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Billing Address</td>
                <td class="pb-2">
                  <v-btn small text color="primary" @click="handleAddressDialog(item, 'billing')">
                    View Details
                  </v-btn>
                </td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Shipping Address</td>
                <td class="pb-2">
                  <v-btn small text color="primary" @click="handleAddressDialog(item, 'shipping')">
                    View Details
                  </v-btn>
                </td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Company Country</td>
                <td class="pb-2">{{ item.country }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Website</td>
                <td class="pb-2">{{ item.website }}</td>
                <td class=""></td>
              </tr>
              <tr>
                <td class="pr-0">Created At:</td>
                <td class="pb-2">{{ item.createdDate | formatDate }}</td>
              </tr>
              <tr>
                <td class="pr-0">Unique Code : </td>
                <td class="pb-2">{{ item.unique_code }}</td>
              </tr>
              <tr>
                <td class="pr-0">PO Number : </td>
                <td class="pb-2">{{ item?.PO_number }}</td>
              </tr>
              <tr>
                <td class="pr-0">Reference Number : </td>
                <td class="pb-2">{{ item?.reference_number }}</td>
              </tr>
              <tr>
                <td class="pr-0">TRN Number : </td>
                <td class="pb-2">{{ item?.trn_number }}</td>
              </tr>
              <tr>
                <td class="pr-0">GRN Number : </td>
                <td class="pb-2">{{ item?.GRN_number }}</td>
              </tr>

              <v-dialog v-model="addressModalOpen" max-width="500">
                <v-card>
                  <v-card-title>
                    {{ addressModalType === 'billing' ? 'Billing' : 'Shipping' }} Address
                  </v-card-title>
                  <v-card-text>
                    <v-simple-table>
                      <template v-slot:default>
                        <tbody>
                          <tr v-for="(value, key) in addressModalData" :key="key">

                            <td class="text-capitalize">{{ key.replace('_', ' ') }}</td>
                            <td>{{ value }}</td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="addressModalOpen = false">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="noAddressDialog" max-width="500">
                <v-card>
                  <v-card-title class="headline">No Address Available</v-card-title>
                  <v-card-text>There is no address available for this company. Click on the Edit button to add
                    one.</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="noAddressDialog = false">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>


            <!-- <template v-slot:item="{ item }">
            <tr>
              <td class="pr-0">{{ item.title}}</td>
              <td class="pb-2">{{ item.description}}</td>
              <td class=""></td>
            </tr>
          </template> -->
          </v-data-table>
          <!-- PAYROLL DETAILS TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5 mt-5"
            :headers="payrollHeaders" :items="payrollDetails" :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <WalletSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
                <v-btn class="customer_table_btn" outlined color="primary"
                  @click="handleEditModel(payrollHeaders[0].text)">{{
                    header.text
                  }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">{{ item.title }} </td>
                <td class="pb-2">{{ item.description.display }}</td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table>
          <!-- COMPANY CONTACTS TABLE -->
          <!-- <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
            :headers="contact_headers" :items="contact_details" :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <phoneSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
                <v-btn class="customer_table_btn" outlined color="primary" @click="handleEditModel('CONTACT PERSON')">{{
                  header.text }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item }">
              <tr v-for="(value, key) in item" :key="key">
                <td class="pr-0" style="text-transform: capitalize;">{{ key }}</td>
                <td class="pb-2 pt-2">
                  {{ value }}
                </td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table> -->

          <!-- CONTACT PERSONS BY DEPARTMENT -->
          <div class="tw-mb-5">
            <div class="d-flex align-center justify-lg-space-between mb-4">
              <div class="d-flex align-center">
                <phoneSVG />
                <span class="span_heading pl-2">CONTACT PERSONS</span>
              </div>
              <v-btn class="customer_table_btn" outlined color="primary" @click="handleEditModel('CONTACT PERSON')">
                Edit
              </v-btn>
            </div>

            <!-- HR Point of Contact -->
            <div v-if="getContactsByDepartment('HR Point of Contact').length > 0" class="tw-mb-4">
              <div class="tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-p-4 tw-rounded-r-lg">
                <h4 class="tw-text-lg tw-font-semibold tw-text-blue-800 tw-mb-3">
                  <v-icon color="blue" class="tw-mr-2">mdi-account-tie</v-icon>
                  HR Point of Contact
                </h4>
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                  <div v-for="(contact, index) in getContactsByDepartment('HR Point of Contact')" :key="index"
                       class="tw-bg-white tw-p-3 tw-rounded-lg tw-border tw-border-blue-200">
                    <div class="tw-flex tw-items-center tw-mb-2">
                      <v-avatar size="32" color="blue" class="tw-bg-blue-100 tw-mr-3">
                        <v-icon color="blue" size="16">mdi-account</v-icon>
                      </v-avatar>
                      <div>
                        <h5 class="tw-font-medium tw-text-gray-800">{{ contact.name }}</h5>
                        <p class="tw-text-sm tw-text-gray-600">{{ contact.designation }}</p>
                      </div>
                    </div>
                    <div class="tw-space-y-1">
                      <div class="tw-flex tw-items-center tw-text-sm">
                        <v-icon size="16" color="gray" class="tw-mr-2">mdi-email</v-icon>
                        <span class="tw-text-gray-700">{{ contact.email }}</span>
                      </div>
                      <div class="tw-flex tw-items-center tw-text-sm">
                        <v-icon size="16" color="gray" class="tw-mr-2">mdi-phone</v-icon>
                        <span class="tw-text-gray-700">{{ contact.phone }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Point of Contact -->
            <div v-if="getContactsByDepartment('Financial Point of Contact').length > 0" class="tw-mb-4">
              <div class="tw-bg-green-50 tw-border-l-4 tw-border-green-500 tw-p-4 tw-rounded-r-lg">
                <h4 class="tw-text-lg tw-font-semibold tw-text-green-800 tw-mb-3">
                  <v-icon color="green" class="tw-mr-2">mdi-currency-usd</v-icon>
                  Financial Point of Contact
                </h4>
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                  <div v-for="(contact, index) in getContactsByDepartment('Financial Point of Contact')" :key="index"
                       class="tw-bg-white tw-p-3 tw-rounded-lg tw-border tw-border-green-200">
                    <div class="tw-flex tw-items-center tw-mb-2">
                      <v-avatar size="32" color="green" class="tw-bg-green-100 tw-mr-3">
                        <v-icon color="green" size="16">mdi-account</v-icon>
                      </v-avatar>
                      <div>
                        <h5 class="tw-font-medium tw-text-gray-800">{{ contact.name }}</h5>
                        <p class="tw-text-sm tw-text-gray-600">{{ contact.designation }}</p>
                      </div>
                    </div>
                    <div class="tw-space-y-1">
                      <div class="tw-flex tw-items-center tw-text-sm">
                        <v-icon size="16" color="gray" class="tw-mr-2">mdi-email</v-icon>
                        <span class="tw-text-gray-700">{{ contact.email }}</span>
                      </div>
                      <div class="tw-flex tw-items-center tw-text-sm">
                        <v-icon size="16" color="gray" class="tw-mr-2">mdi-phone</v-icon>
                        <span class="tw-text-gray-700">{{ contact.phone }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Escalation Point of Contact -->
            <div v-if="getContactsByDepartment('Escalation Point of Contact').length > 0" class="tw-mb-4">
              <div class="tw-bg-orange-50 tw-border-l-4 tw-border-orange-500 tw-p-4 tw-rounded-r-lg">
                <h4 class="tw-text-lg tw-font-semibold tw-text-orange-800 tw-mb-3">
                  <v-icon color="orange" class="tw-mr-2">mdi-alert-circle</v-icon>
                  Escalation Point of Contact
                </h4>
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                  <div v-for="(contact, index) in getContactsByDepartment('Escalation Point of Contact')" :key="index"
                       class="tw-bg-white tw-p-3 tw-rounded-lg tw-border tw-border-orange-200">
                    <div class="tw-flex tw-items-center tw-mb-2">
                      <v-avatar size="32" color="orange" class="tw-bg-orange-100 tw-mr-3">
                        <v-icon color="orange" size="16">mdi-account</v-icon>
                      </v-avatar>
                      <div>
                        <h5 class="tw-font-medium tw-text-gray-800">{{ contact.name }}</h5>
                        <p class="tw-text-sm tw-text-gray-600">{{ contact.designation }}</p>
                      </div>
                    </div>
                    <div class="tw-space-y-1">
                      <div class="tw-flex tw-items-center tw-text-sm">
                        <v-icon size="16" color="gray" class="tw-mr-2">mdi-email</v-icon>
                        <span class="tw-text-gray-700">{{ contact.email }}</span>
                      </div>
                      <div class="tw-flex tw-items-center tw-text-sm">
                        <v-icon size="16" color="gray" class="tw-mr-2">mdi-phone</v-icon>
                        <span class="tw-text-gray-700">{{ contact.phone }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No contacts message -->
            <div v-if="!hasAnyContacts" class="tw-text-center tw-py-8 tw-text-gray-500">
              <v-icon size="48" color="grey lighten-1">mdi-account-group-outline</v-icon>
              <p class="tw-mt-2">No contact persons added yet</p>
              <v-btn color="primary" outlined small class="tw-mt-2" @click="handleEditModel('CONTACT PERSON')">
                Add Contact Person
              </v-btn>
            </div>
          </div>
          <!-- COMPANY CONFIGURATIONS TABLE
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
            :headers="configuration_headers" :items="configuration_details"
            :footer-props="{ 'items-per-page-options': [10, 20] }" hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <settingSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
              </th>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="" style="width: 25% !important">{{ item.title }}</td>
                <td class="">{{ item.description }}</td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table> -->
          <!--MODULES & SERVICES  -->
          <v-row id="chip_wrap" class="">
            <v-col class="pa-0" cols="12">
              <div class="d-flex align-center justify-lg-space-between mb-4">
                <div class="d-flex align-center">
                  <settingSVG />
                  <span class="span_heading pl-2">MODULES & SERVICES</span>
                </div>

                <v-btn class="customer_table_btn" style="font-weight: 600 !important" outlined color="primary"
                  @click="handleEditModel('Modules')">Edit</v-btn>
              </div>
              <div class="chip_wrapper mb-3">
                <!-- <p class="chip_heading ml-6">Modules</p>
                <br /> -->
                <v-chip v-for="item in Modules" :key="item.id" size="small"
                  class="cu_detail_chips ml-6 mb-4 light_primary primary--text">{{ item }}</v-chip>
              </div>
            </v-col>
          </v-row>
          <div></div>
          <!-- COMPANY LOCATION TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
            :headers="location_headers" :items="location_details" :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <locationSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
                <v-btn class="customer_table_btn" outlined color="primary"
                  @click="handleEditModel(location_headers[0].text)">{{
                    header.text
                  }}</v-btn>
              </th>
            </template>
            <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">{{ item.title }}</td>
                <td class="pb-2" style="width: 65% !important">
                  {{ item.address }}
                </td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table>
          <!-- COMPANY BANK TABLE -->
          <v-data-table id="coa_table" class="main__table elevation-0 customDataTabel th_customer mb-5"
            :headers="bank_headers" :items="bank_details" :footer-props="{ 'items-per-page-options': [10, 20] }"
            hide-default-footer>
            <template v-slot:header.title="{ header }">
              <div class="d-flex align-center pa-0">
                <div>
                  <bankSVG />
                </div>
                <div>
                  <th class="pl-2">{{ header.text }}</th>
                </div>
              </div>
            </template>
            <template v-slot:header.action="{ header }">
              <th class="d-flex justify-end">
                <v-btn class="customer_table_btn" outlined color="primary"
                  @click="handleEditModel(bank_headers[0].text)">{{
                    header.text
                  }}</v-btn>
              </th>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td class="pr-0">{{ item.title }} </td>
                <td class="pb-2">{{ item.description.display }}</td>
                <td class=""></td>
              </tr>
            </template>
          </v-data-table>
        </v-row>
      </div>
    </v-row>

    <EditModel v-if="showEditModel" :selectedCustomer="selectedCustomer" :headerTitle="headerTitle"
      :companiesDetails="companiesDetails" @close="updateEmployeeData()" :handleModel="handleEditModel" />


    <!-- Upload Picture-->
    <ImageCrop @croped-image="imagecroped" @close-corp="closecrop" :show="imageEdit" v-if="imageEdit" />
    <v-dialog v-model="uploadPicture" max-width="600">
      <v-card max-width="600" style="overflow-x:hidden">
        <v-row class="pt-4 pl-4 pr-4">
          <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0 text-center">
            <p class="mb-0 caption blue-grey--text font-weight-bold">Upload Profile Pic</p>
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
                <input type="file" @change="onUploadFile">
              </div>
            </div>
            <div v-else class="dropZone-uploaded">
              <div class="dropZone-uploaded-info">
                <span class="dropZone-title">Added</span>
                <button type="button" class="btn btn-primary removeFile" @click="removeFile('uploadDoc')">Remove
                  File</button>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row class="pa-4">
          <v-col class="text-right pt-0">
            <v-btn color="grey" text @click="uploadPicture = false">Close</v-btn>
            <v-btn color="blue darken-1" text v-if="uploading">
              <v-img src="/animated/refresh.svg" height="20" width="20" class="mr-2" contain></v-img>
            </v-btn>
            <v-btn color="blue darken-1" text v-else @click="attachFile()">Upload Profile</v-btn>
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
import ImageCrop from "~/components/utils/imageCrop.vue"
import '@/assets/scss/utils/_customerListDetails.scss'
import InfoSVG from '@/assets/images/Customer/info.svg'
import WalletSVG from '@/assets/images/Customer/wallet.svg'
import phoneSVG from '@/assets/images/Customer/phone.svg'
import settingSVG from '@/assets/images/Customer/setting.svg'
import locationSVG from '@/assets/images/Customer/location.svg'
import bankSVG from '@/assets/images/Customer/bank.svg'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'
import CustomerCard from '~/components/Cards/CustomerDetailCard/index.vue'
import EditModel from '~/components/EditModel/index.vue'

export default {
  components: {
    CustomerCard,
    EditModel,
    customerDefaultIcon,
    InfoSVG,
    phoneSVG,
    settingSVG,
    locationSVG,
    ImageCrop,
    bankSVG,
    WalletSVG,
  },
  props: {
    selectedCustomer: String,
  },

  data() {
    return {
      imageEdit: false,
      avatar: '/1.jpg',
      showEditModel: false,
      uploadPicture: false,
      companiesDetails: [],
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
      addressModalOpen: false,
      addressModalType: '',
      addressModalData: {},
      uploading: false,
      snack: false,
      snackText: '',
      snackColor: '',
      headerTitle: '',
      noAddressDialog: false,
      Modules: [
        // 'My Work',
        // 'HR Self Services',
        // 'Team Central',
        // 'Reports',
        // 'Onboardings',
        // 'Invoice Central',
        // 'Payroll Central',
        // 'Offboardings',
      ],

      companyHeaders: [
        {
          text: 'COMPANY DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: 'Edit',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      companyDetails: [
        {
          title: 'Legal Name',
          description: 'Binance Ex',
        },
        {
          title: 'Company Name',
          description: 'Binance Exchange',
        },
        {
          title: 'Registration Number',
          description: '454-778-554-589',
        },
        {
          title: 'Phone No',
          description: '00971 -0589754125',
        },
        {
          title: 'Email Address',
          description: 'contact@binance.com',
        },
        {
          title: 'Registration Number',
          description: '454-778-554-589',
        },
        {
          title: 'Company Address',
          description:
            'Bay Square 3, 03, Al Asayel Street, Business Bay, Dubai',
        },
        {
          title: 'Company Country',
          description: 'United Arab Emirates',
        },
        {
          title: 'Website',
          description: 'www.binance.com',
        },
      ],
      payrollHeaders: [
        {
          text: 'PAYROLL DETAILS',
          value: 'title',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: '',
          value: 'description',
          align: 'center',
          hideSortIcon: true,
          sortable: false,
        },
        {
          text: 'Edit',
          value: 'action',
          align: 'start',
          hideSortIcon: true,
          sortable: false,
        },
      ],
      payrollDetails: [
        {
          title: 'Invoice date',
          description: 'Every 15th ',
        },
        {
          title: 'Payment Due Date',
          description: 'Every 20th',
        },
        {
          title: 'Salary Date',
          description: 'Every 28th',
        },
        {
          title: 'Invoice Format',
          description: ''
        }
      ],
      contact_headers: [
        { text: 'CONTACT PERSON', value: 'title', align: 'center', sortable: false },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      contact_details: [],
      configuration_headers: [
        {
          text: 'CONFIGURATIONS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'New', value: 'action', align: 'start', sortable: false },
      ],
      configuration_details: [
        {
          title: 'Portal Type',
          description: 'Internal Portal',
          align: 'start',
        },
        {
          title: 'Customer Type',
          description: 'Child',
        },
        {
          title: 'parent Company',
          description: 'Binance Inc',
        },
        {
          title: 'Category',
          description: 'PEO',
        },
      ],
      location_headers: [
        {
          text: 'COMPANY LOCATIONS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      location_details: [
        {
          title: '',
          address: '',
          phone: '',
          email: '',
        },
      ],
      billing_address: [
        {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          email: ''
        }
      ],
      shipping_address: [
        {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          special_instructions: ''
        }
      ],
      bank_headers: [
        {
          text: 'BANK DETAILS',
          value: 'title',
          align: 'start',
          sortable: false,
        },
        { text: '', value: 'description', align: 'start', sortable: false },
        { text: 'Edit', value: 'action', align: 'start', sortable: false },
      ],
      bank_details: [
        {
          title: 'Emirates NBD',
          accTitle: 'AC No.',
          accountNo: ' 0000000000',
          itemTitle: 'Bank Address',
          itemValue: 'value',
          itemTitle1: 'IBan',
          itemValue1: '',
          itemTitle2: 'Payment Mode',
          itemValue2: '',
        },
      ],

      DetailsCard: [
        {
          status: 'Unpaid Invoice',
          count: '01',
        },
        {
          status: 'Active Oboarding',
          count: '03',
        },
        {
          status: 'Active Visa Process',
          count: '05',
        },
      ],
      details_counts: []
    }
  },
  methods: {
    async imagecroped(event) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let obj = {
        "name": `${this.selectedCustomer.company_name}_logo.png`,
        "base64": event,
        "mimetype": "application/png"
      }
      await this.$axios.$post(`/documents/simpleuploadbase64`, obj, { headers: { Authorization: AuthStr } })
        .then(async (response) => {

          let obj = {
            logo: response
          }

          await this.$axios.$patch(`/companies/${this.selectedCustomer}`, obj, { headers: { Authorization: AuthStr } })
            .then((res) => {
              this.snack = true
              this.snackColor = 'success'
              this.snackText = 'Profile Has Been Updated Successfully.'
              this.$nuxt.$emit('updatedEmployerClicked', this.selectedCustomer)
              this.employersDetails(this.selectedCustomer)
            })
        })
    },
    closecrop(event) {
      this.imageEdit = event
    },
    openAddressModal(item, type) {
      if (type === 'billing') {
        this.addressModalType = 'billing';
        this.addressModalData = item.billing_address;
      } else if (type === 'shipping') {
        this.addressModalType = 'shipping';
        this.addressModalData = item.shipping_address;
      }
      this.addressModalData.country = item.country;
      this.addressModalOpen = true;

    },
    showNoAddressDialog() {
      this.noAddressDialog = true;
    },
    handleAddressDialog(item, type) {
      if (!item.billing_address || !item.shipping_address) {
        this.showNoAddressDialog()
      } else {
        this.openAddressModal(item, type)
      }
    },
    //EMPLOYERS DETAILS
    async employersDetails(user_id) {
      console.log("What is the user id at now", user_id)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/companies/comp/${user_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          // new arr obj
          this.companiesDetails = [response];
          console.log('employer details', this.companiesDetails)
          this.getPayrollDetails()
          this.getContactDetails()
          this.getModules()
          this.getCompanyLocations()
          this.getBankDetails()
        })
    },
    onUploadFile(event) {
      this.onChange(event, 'uploadDoc')
      this.attachFiles.uploadDoc = this.uploadFiles
    },
    onChange(e, type) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) {
        this.dragging = false;
        return;
      }
      this.createFile(e, files, type);
    },
    removeFile(val) {
      if (val == 'uploadDoc') this.uploadFile = '';
      // if (val == 'ecard') this.ecardFile = '';
      // if (val == 'bulk') this.bulkFile = '';
    },
    createFile(e, file, type) {
      if (file.size > 10000000) {
        alert('please check file size is not more than 10 MB.')
        this.dragging = false;
        return;
      }
      this.onUploadFiles(file)
      if (type == 'uploadDoc') this.uploadFile = file;
      // if (type == 'ecard') this.ecardFile = file
      // if (type == 'bulk') this.bulkFile = file
      this.dragging = false;
    },
    onUploadFiles(event) {
      this.uploadFiles = event;
      this.dragging = false;
      for (let i = 0; i < this.uploadFiles.length; i++) {
        this.filename_attach.push(event[i].name)
      }
    },
    async attachFile() {
      this.uploading = true
      let attach = {}

      this.page = 1;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      for (var key in this.attachFiles) {
        if (!_.isEmpty(this.attachFiles[key])) {
          for (let i = 0; i < this.attachFiles[key].length; i++) {
            if (this.attachFiles[key][i].name != undefined) {
              attach.file = this.attachFiles[key][i]
            } else {
              console.log('null')
            }
          }
        }
        this.removeFile(key)
      }

      const fd = new FormData();

      fd.append('documents', attach.file)

      await this.$axios.$post(`/documents/simpleupload`, fd, { headers: { Authorization: AuthStr } })
        .then(async (response) => {

          let obj = {
            logo: response[0]
          }

          await this.$axios.$patch(`/companies/${this.selectedCustomer}`, obj, { headers: { Authorization: AuthStr } })
            .then((res) => {
              this.snack = true
              this.snackColor = 'success'
              this.snackText = 'Profile Has Been Updated Successfully.'
              this.$nuxt.$emit('updatedEmployerClicked', this.selectedCustomer)
              this.employersDetails(this.selectedCustomer)
              this.uploadPicture = false
              this.uploading = false
            })
        })
    },
    handleEditModel(title) {
      this.headerTitle = title
      this.showEditModel = !this.showEditModel
    },
    async updateEmployeeData() {
      this.showEditModel = !this.showEditModel
      this.headerTitle = ''
      await this.$nuxt.$emit('updatedEmployerClicked', this.selectedCustomer)
      await this.employersDetails(this.selectedCustomer)
    },
    getPayrollDetails() {
      if (this.companiesDetails && this.companiesDetails.length > 0) {
        this.payrollDetails = Object.keys(this.companiesDetails[0].payroll_schedule).map((key) => {
          return {
            title: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), // Format the title
            description: {
              display: this.companiesDetails[0].payroll_schedule[key]?.display || this.companiesDetails[0].payroll_schedule[key],
              value: this.companiesDetails[0].payroll_schedule[key]
            }
          };
        });
        // this.payrollDetails.forEach((item) => {
        //   const lowercaseTitle = item.title.toLowerCase();
        //   switch (lowercaseTitle) {
        //     case 'invoice date':
        //       item.description = this.companiesDetails[0].payroll_schedule.invoice_date;
        //       break;
        //     case 'payment due date':
        //       item.description = this.companiesDetails[0].payroll_schedule.payment_due_notification;
        //       break;
        //     case 'salary date':
        //       item.description = this.companiesDetails[0].payroll_schedule.salary_payment_date;
        //       break;
        //     case 'invoice format':
        //       // First check if it's in payroll_schedule, otherwise use the root level field
        //       if (this.companiesDetails[0].payroll_schedule.invoice_format) {
        //         item.description = {
        //           display: this.companiesDetails[0].payroll_schedule.invoice_format,
        //           value: this.companiesDetails[0].payroll_schedule.invoice_format
        //         };
        //       } else if (this.companiesDetails[0].invoice_format) {
        //         item.description = {
        //           display: this.companiesDetails[0].invoice_format,
        //           value: this.companiesDetails[0].invoice_format
        //         };
        //       }
        //       break;
        //     default:
        //       break;
        //   }
        // });
      }
    },
    getContactDetails() {
      if (this.companiesDetails && this.companiesDetails.length > 0) {
        this.contact_details = this.companiesDetails[0].contact_persons
        // for (let i = 0; i < this.companiesDetails[0].contact_person.length; i++) {
        //   const contact = {
        //     name: this.companiesDetails[0].contact_person[i].name,
        //     phone: this.companiesDetails[0].contact_person[i].phone,
        //     email: this.companiesDetails[0].contact_person[i].email,
        //     designation: this.companiesDetails[0].contact_person[i].designation
        //   };

        //   this.contact_details.push(contact);
        // }
      }
    },
    getModules() {
      this.Modules = []
      if (this.companiesDetails && this.companiesDetails.length > 0) {
        for (let i = 0; i < this.companiesDetails[0].configurations.modules.length; i++) {
          const element = this.companiesDetails[0].configurations.modules[i]
          this.Modules.push(element)
        }
      }
    },
    getCompanyLocations() {
      if (this.companiesDetails && this.companiesDetails.length > 0) {
        this.location_details[0].title = this.companiesDetails[0].country;
        this.location_details[0].address = this.companiesDetails[0].address;
        this.location_details[0].phone = this.companiesDetails[0].phone;
        this.location_details[0].email = this.companiesDetails[0].email;
      }
    },

    getBankDetails() {
      console.log(this.companiesDetails)
      if (this.companiesDetails && this.companiesDetails.length > 0) {
        const updatedBankArray = [
          {
            title: this.companiesDetails[0]?.bank_details[0]?.bank_name || '-',
            accTitle: this.bank_details[0].accTitle,
            accountNo: ' ' + (this.companiesDetails[0]?.bank_details[0]?.account_number || '-'),
            itemTitle: this.bank_details[0].itemTitle,
            itemValue: ' ' + (this.companiesDetails[0]?.bank_details[0]?.bank_address || '-'),
            itemTitle1: this.bank_details[0].itemTitle1,
            itemValue1: this.companiesDetails[0]?.bank_details[0]?.iban || '-',
            itemTitle2: this.bank_details[0].itemTitle2,
            itemValue2: this.companiesDetails[0]?.bank_details[0]?.salary_payment_mode || '-'
          }
        ]
        const bank_info = this.companiesDetails[0]?.bank_details[0]
        this.bank_details = Object.keys(bank_info).map((key) => {
          return {
            title: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), // Format the title
            description: {
              display: bank_info[key]?.display || bank_info[key],
              value: bank_info[key]
            }
          };
        });
      }
    },
    async getDetailsCardDetailsCount() {
      this.DetailsCard[0].count = 0
      this.DetailsCard[1].count = 0
      this.DetailsCard[2].count = 0
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/users/counts/companyid/${this.selectedCustomer}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.details_counts = response
          if (this.details_counts && this.details_counts.length > 0) {
            this.DetailsCard[0].count = this.details_counts[0].unpaid_invoice
            this.DetailsCard[1].count = this.details_counts[0].onboarding_users
            this.DetailsCard[2].count = this.details_counts[0].active_visa_process
          }
        })
    },
    getContactsByDepartment(department) {
      if (!this.contact_details || !Array.isArray(this.contact_details)) {
        return [];
      }
      return this.contact_details.filter(contact => contact && contact.department === department);
    },
    hasAnyContacts() {
      return this.contact_details && Array.isArray(this.contact_details) && this.contact_details.length > 0;
    }
  },
  mounted() {
    this.employersDetails(this.selectedCustomer)
    this.getDetailsCardDetailsCount()
    // console.log(this.selectedCustomer, '------- props cusDetails')
  },
}
</script>
<style lang="scss" scoped>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: .5;
  position: absolute;
  width: 100%;
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
