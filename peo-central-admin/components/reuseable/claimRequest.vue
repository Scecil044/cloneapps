<template>
  <div>
    <div style="position: relative">
      <div class="loader-wrapper" v-if="showLoader || isDraftRequest">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
      <v-row class="mx-auto" style="max-width: 80%">
        <v-col cols="12" sm="12" md="12">
          <v-form ref="form">
            <v-row
              class="pt-5 mx-0 mx-auto"
              style="max-width: 80%"
              v-if="claimRequest"
            >
              <v-col cols="6" class="pb-0 my-0">
                <v-select
                  dense
                  persistent-hint
                  item-value="_id"
                  class="customMdiMenuDown"
                  hint="Employee"
                  placeholder="Employee Preview"
                  :disabled="showLoader || isDraftRequest"
                  v-model="request.letter_fields.user_id"

                  :item-text="(item) => `${item.first_name} ${item.last_name}`"
                >
                </v-select>
              </v-col>
            </v-row>
            <template v-if="request.letter_sub_type?.length">
              <template v-for="(claimreq, reqInd) in request.letter_sub_type">
                <v-row class="pt-4" v-if="reqInd === 0">
                  <v-col cols="12" sm="6" md="6">
                    <p
                      class="grey-heading-text font-weight-medium textFontSize"
                    >
                      Requested Date
                    </p>
                    {{ requested_date }}
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <p
                      class="grey-heading-text font-weight-medium textFontSize"
                    >
                      Total Amount
                    </p>
                    {{ total_claim_amount }}
                  </v-col>
                  <v-col cols="12">
                    <p
                      class="grey-heading-text font-weight-medium textFontSize"
                    >
                      <span>Application Description</span>
                      <span class="red--text">*</span>
                    </p>
                    <v-textarea
                      dense
                      rows="2"
                      class="redTextForm"
                      :rules="genericRule"
                      :disabled="showLoader || isDraftRequest"
                      v-model.trim="description"
                    ></v-textarea>
                  </v-col>
                </v-row>
                <v-row class="pt-2" v-if="reqInd !== 0">
                  <v-tooltip top color="purple">
                    <template v-slot:activator="{ on, attrs }">
                      <v-stepper>
                        <v-stepper-step
                          :step="reqInd + 1"
                          v-bind="attrs"
                          v-on="on"
                        >
                          <v-icon
                            color="red"
                            medium
                            @click="deleteClaimRequest(reqInd)"
                            >mdi-delete</v-icon
                          >
                        </v-stepper-step>
                      </v-stepper>
                    </template>
                    <span>Delete</span>
                  </v-tooltip>
                </v-row>
                <v-row class="pt-4" :key="reqInd">
                  <v-col cols="12" sm="6" md="6">
                    <p
                      class="grey-heading-text font-weight-medium textFontSize"
                    >
                      <span>Claim Type</span> <span class="red--text">*</span>
                    </p>
                    <v-select
                      class="customMdiMenuDown redTextForm"
                      :items="claimTypes"
                      item-text="claimType"
                      :rules="genericRule"
                      return-object
                      :disabled="showLoader || isDraftRequest"
                      v-model="claimreq.letter_type"
                      @change="onChangeClaimType(claimreq, reqInd, false)"
                      dense
                    >
                    </v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <p
                      class="grey-heading-text font-weight-medium textFontSize"
                    >
                      <span>Claim Sub Type</span>
                      <span class="red--text">*</span>
                    </p>
                    <v-select
                      class="customMdiMenuDown redTextForm"
                      :items="claimSubTypes[reqInd]"
                      item-text="claimSubType"
                      :hint="getPayrollHint"
                      :persistent-hint="true"
                      :rules="genericRule"
                      @change="onSelectClaimSubType(reqInd)"
                      :disabled="showLoader || isDraftRequest"
                      v-model="selectedClaimSubType[reqInd]"
                      dense
                    >
                    </v-select>
                  </v-col>
                  <template v-if="claimreq[0]?.claimKeys?.length">
                    <v-row>
                      <template v-for="(claimkey, ind) in claimreq[0].claimKeys">
                        <v-col
                          cols="12"
                          sm="6"
                          md="6"
                          v-if="getClaimKeyType(claimkey.type) === 'textfield'"
                        >
                          <p
                            class="grey-heading-text font-weight-medium textFontSize"
                          >
                            {{ getFormattedText(claimkey.name) }}
                            <span v-if="claimkey.required" class="red--text"
                              >*</span
                            >
                          </p>
                          <v-text-field
                            dense
                            class="redTextForm"
                            v-model.trim="claimkey.value"
                            :disabled="showLoader || isDraftRequest"
                            :rules="claimkey.required ? genericRule : []"
                          ></v-text-field>
                        </v-col>

                        <v-col
                          cols="12"
                          sm="6"
                          md="6"
                          v-if="
                            getClaimKeyType(claimkey.type) === 'numberfield'
                          "
                        >
                          <p
                            class="grey-heading-text font-weight-medium textFontSize"
                          >
                            {{ getFormattedText(claimkey.name) }}
                            <span v-if="claimkey.required" class="red--text"
                              >*</span
                            >
                          </p>
                          <v-text-field
                            dense
                            class="redTextForm"
                            v-model.trim="claimkey.inputvalue"
                            type="number"
                            :disabled="showLoader || isDraftRequest"
                            :rules="claimkey.required ? genericRule : []"
                            @input="getCalculatedValue(claimkey)"
                          >
                          </v-text-field>
                          <p
                            v-if="claimkey.isCalculationNeeded"
                            class="grey-heading-text font-weight-small textFontSize"
                          >
                            Calculated Amount: {{ claimkey.value }}
                          </p>
                        </v-col>
                        <v-col
                          cols="12"
                          sm="6"
                          md="6"
                          v-if="getClaimKeyType(claimkey.type) === 'datepicker'"
                        >
                          <div style="position: relative">
                            <p
                              class="grey-heading-text font-weight-medium textFontSize"
                            >
                              {{ getFormattedText(claimkey.name) }}
                              <span v-if="claimkey.required" class="red--text"
                                >*</span
                              >
                            </p>
                            <v-menu
                              :ref="'menu' + reqInd + ind"
                              :close-on-content-click="false"
                              :return-value.sync="claimkey.value"
                              transition="scale-transition"
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  dense
                                  class="pt-1 redTextForm"
                                  :disabled="showLoader || isDraftRequest"
                                  v-model.trim="claimkey.value"
                                  append-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                  :rules="claimkey.required ? genericRule : []"
                                >
                                </v-text-field>
                              </template>
                              <v-date-picker
                                :disabled="showLoader || isDraftRequest"
                                v-model="claimkey.value"
                                no-title
                              >
                                <v-spacer></v-spacer>
                                <v-btn
                                  text
                                  color="primary"
                                  @click="menu[reqInd][ind] = false"
                                >
                                  Cancel</v-btn
                                >
                                <v-btn
                                  text
                                  color="primary"
                                  @click="
                                    closeDatePickerDialog(
                                      reqInd,
                                      ind,
                                      claimkey.value
                                    )
                                  "
                                  >OK
                                </v-btn>
                              </v-date-picker>
                            </v-menu>
                          </div>
                        </v-col>

                        <v-col
                          cols="12"
                          sm="6"
                          md="6"
                          v-if="getClaimKeyType(claimkey.type) === 'select'"
                        >
                          <p
                            class="grey-heading-text font-weight-medium textFontSize"
                          >
                            {{ getFormattedText(claimkey.name) }}
                            <span v-if="claimkey.required" class="red--text"
                              >*</span
                            >
                          </p>
                          <v-select
                            class="customMdiMenuDown redTextForm"
                            :items="getSelectorValues(claimkey)"
                            item-text="claimkey.name"
                            :rules="claimkey.required ? genericRule : []"
                            :persistent-hint="true"
                            return-object
                            :disabled="showLoader || isDraftRequest"
                            v-model="claimkey.value"
                            dense
                          >
                          </v-select>
                        </v-col>

                        <v-col
                          cols="12"
                          v-if="
                            getClaimKeyType(claimkey.type) === 'attachments'
                          "
                        >
                          <p
                            class="grey-heading-text font-weight-medium textFontSize"
                          >
                            {{ getFormattedText(claimkey.name) }}
                            <span v-if="claimkey.required" class="red--text"
                              >*</span
                            >
                          </p>
                          <v-file-input
                            dense
                            :disabled="showLoader || isDraftRequest"
                            v-model="claimkey.value"
                            class="redTextForm"
                            :rules="
                              claimkey.required
                                ? [
                                    (v) => !!v || 'File is required',
                                    (v) =>
                                      (v && v.length > 0) || 'File is required',
                                    (files) =>
                                      !files ||
                                      !files.some((file) => file.size > 2e6) ||
                                      'File size should be less than 2 MB!',
                                  ]
                                : []
                            "
                            multiple
                          >
                            <template v-slot:selection="{ text }">
                              <v-chip small label color="primary">
                                {{ text }}
                              </v-chip>
                            </template>
                          </v-file-input>
                        </v-col>
                        <v-col
                          cols="12"
                          sm="12"
                          md="12"
                          v-if="getClaimKeyType(claimkey.type) === 'textarea'"
                        >
                          <p
                            class="grey-heading-text font-weight-medium textFontSize"
                          >
                            {{ getFormattedText(claimkey.name) }}
                            <span v-if="claimkey.required" class="red--text"
                              >*</span
                            >
                          </p>
                          <v-textarea
                            dense
                            rows="2"
                            v-model.trim="claimkey.value"
                            class="redTextForm"
                            :disabled="showLoader || isDraftRequest"
                            :rules="claimkey.required ? genericRule : []"
                          ></v-textarea>
                        </v-col>
                      </template>
                    </v-row>
                  </template>
                </v-row>
              </template>
            </template>
          </v-form>
          <!-- snackbar -->
          <v-snackbar
            :disabled="showLoader || isDraftRequest"
            v-model="snack"
            :timeout="3000"
            :color="snackColor"
          >
            {{ snackText }}

            <template v-slot:action="{ attrs }">
              <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
            </template>
          </v-snackbar>
        </v-col>
      </v-row>
    </div>
    <div class="sticky-bottom">
      <v-row>
        <v-col>
          <v-btn
            min-width="90"
            color="primary"
            class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset"
            elevation="0"
            @click="addNewClaimRequest"
            >ADD ANOTHER CLAIM
          </v-btn>
        </v-col>
        <v-col class="text-right d-flex" style="justify-content: end">
          <v-btn
            outlined
            dark
            color="primary"
            @click.prevent="draftClaimRequest()"
            v-if="userType === 'SELF'"
            class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset outlined"
            elevation="0"
          >
            Save As Draft
          </v-btn>
          <v-btn
            dark
            color="primary"
            @click.prevent="createClaimRequest()"
            :disabled="computeLevelApprover"
            class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset"
            elevation="0"
          >
            Submit
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import notificationMethod from '~/plugins/notification'
import moment from 'moment'

export default {
  layout: 'dashboard',
  props: [
    'claimRequest',
    'request',
    'user',
    'selectedEmp',
    'companyData',
    'userType',
    'draftClaimReq',
  ],
  data() {
    return {
      claimInfo: true,
      showLoader: false,
      claimCategoryList: [],
      menu: [],
      genericRule: [(v) => !!v || 'This field is Required'],
      dialog: false,
      snack: false,
      snackColor: '',
      snackText: '',
      userRequests: [],
      selectedService: {
        letter_fields: {},
      },
      emailBody: {
        hr_email: '',
        email: '',
        subjectMsg: '',
        eMessage: '',
      },
      claimTypes: [],
      claimSubTypes: [],
      allClaimSubTypes: [],
      configurations: [],
      description: '',
      total_claim_amount: 0,
      selectedClaimSubType: [],
      requested_date: '',
      isDraftRequest: false,
      groupedClaimSubTypes: [],
      selectedClaimType: null,
    }
  },
  async mounted() {
    this.showLoader = true
    await this.getData()
    this.claimCategoryList = this.$store.getters.getConf[0].ClaimSubTypes
    this.configurations = await this.getClaimConfig()
    console.log('The configurations are', this.configurations)
    this.claimSubTypes =
      this.configurations.data?.[0]?.ClaimSubTypes?.map((subType) => ({
        id: subType.id,
        claimType: subType.claimType,
        claimSubType: subType.claimSubType,
        category: subType.category,
        refPrefix: subType.ref_prefix,
        payrollAutoApproved: subType.payroll_auto_approved,
        access: subType.access,
        claimKeys: subType.claim_keys,
        payroll: subType.payroll,
      })) ?? []
    console.log("The claim keys are", this.claimSubTypes[0].claimKeys)
    this.claimTypes = [
      ...new Set(this.claimSubTypes.map((subType) => subType.claimType)),
    ]
    console.log('WHat are the claim types', this.claimSubTypes)
    this.groupedClaimSubTypes = this.claimSubTypes.reduce((acc, subType) => {
      if (!acc[subType.claimType]) {
        acc[subType.claimType] = [];
      }
      acc[subType.claimType].push(subType);
      return acc;
    }, {});

    console.log("These are the grouped subclaim types", this.groupedClaimSubTypes)
    this.requested_date = moment(new Date()).format('DD/MM/YYYY')
    try {
      await this.getClaimSubTypes()
      if (this.request.status?.toLowerCase() === 'draft') {
        this.setDraftClaimInfo()
      } else if (this.request.letter_sub_type?.length === 0) {
        this.addNewClaimRequest()
      }
      this.showLoader = false
    } catch (error) {
      console.log(error)
      this.showLoader = false
    }
  },
  created() {
    this.$nuxt.$on('user_changed', ($event) => {
      this.getClaimSubTypes()
    })
  },
  beforeDestroy() {
    this.$nuxt.$off('user_changed')
  },
  methods: {
    getFormattedText(key) {
      return key?.length
        ? key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : ''
    },
    async getClaimSubTypes() {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token)

      let claimSubTypes = await this.$axios.$get(
        '/claim/request/subtypes/' + this.companyData[0].id,
        {
          headers: {
            Authorization: AuthStr,
          },
        }
      )
      console.log('What are the claim subtypes', claimSubTypes)
      if (claimSubTypes && claimSubTypes.success) {
        this.allClaimSubTypes = claimSubTypes.data
        this.allClaimSubTypes.sort((a, b) =>
          a.claimSubType.localeCompare(b.claimSubType)
        )
        return claimSubTypes.data
      }
      return []
    },
    async getData() {
      const token = this.$store.state.token
      const AuthStr = 'Bearer '.concat(token)
      this.userRequests = await this.$axios.$get(
        '/claim/request/types/' + this.selectedEmp._id,
        { headers: { Authorization: AuthStr } }
      )
      console.log('These are the user requests', this.userRequests)
      this.selectedService = _.orderBy(
        this.userRequests,
        ['date_created'],
        ['desc']
      )[0]
    },
    async uploadFile(val) {
      const token = this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token)

      const fd = new FormData()
      fd.append('a', val.file, val.name)
      fd.append('b', this.selectedEmp._id + Date.now() + val.file.name)
      fd.append('folder', 'claims')

      await this.$axios
        .$post('/requests/upload-file', fd, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.link_url = res.url
          this.link_filename = res.name
        })
        .catch((e) => console.log(e))
    },
    async createClaimRequest() {
      if (this.$refs.form.validate()) {
        this.showLoader = true
        this.isDraftRequest = false
        const token = this.$store.state.token
        const AuthStr = 'Bearer '.concat(token)
        let reqBody = await this.getClaimRequestBody()
        let apply_claim = await this.$axios.$post('/claim/request/new', reqBody, {
          headers: {
            Authorization: AuthStr,
          },
        })
        this.snack = true
        if (apply_claim && apply_claim.success) {
          if (apply_claim.validate) {
            this.snackText = 'Your Claim is on its way!'
            this.snackColor = 'green'
            await this.getData(this.user._id)
            this.$nuxt.$emit('addNewClaim', false)
            this.showLoader = false
            notificationMethod.new(
              this.user._id,
              reqBody.user_id,
              'Multiple claim',
              'New Claim Request Submitted',
              '/dashboards/myhr#claim'
            )
          } else {
            this.snackText = apply_claim.message
            this.snackColor = 'teal'
            this.showLoader = false
          }
        } else {
          this.showLoader = false
          if (apply_claim && !apply_claim.success) {
            this.snack = true
            this.snackText = apply_claim.message
            this.snackColor = 'error'
          } else {
            this.snack = true
            this.snackText = 'Failed to apply claim'
            this.snackColor = 'error'
          }
        }
      } else {
        this.snack = true
        this.snackText = 'Required fields cannot be empty'
        this.snackColor = 'error'
      }
    },

    async draftClaimRequest() {
      if (this.$refs.form.validate()) {
        this.isDraftRequest = true
        const token = this.$store.getters.getToken
        const AuthStr = 'Bearer '.concat(token)
        let reqBody = await this.getClaimRequestBody()
        let draft_claim = await this.$axios.$post('/claim/add_claim', reqBody, {
          headers: {
            Authorization: AuthStr,
          },
        })
        this.snack = true
        if (draft_claim && draft_claim.success) {
          if (draft_claim.validate) {
            this.snackText = 'Draft claim created successfully!'
            this.snackColor = 'green'
            this.request.letter_sub_type = []
            await this.getData()
            this.isDraftRequest = false
            this.$nuxt.$emit('addNewClaim', false)
          } else {
            this.snackText = draft_claim.message
            this.snackColor = 'teal'
            this.showLoader = false
            this.isDraftRequest = false
          }
        } else {
          this.isDraftRequest = false
          if (draft_claim && !draft_claim.success) {
            this.snack = true
            this.snackText = draft_claim.message
            this.snackColor = 'error'
          } else {
            this.snack = true
            this.snackText = 'Error while drafting Claim request!'
            this.snackColor = 'error'
          }
        }
      } else {
        this.snack = true
        this.snackText = 'Required fields cannot be empty'
        this.snackColor = 'error'
      }
    },

    async getClaimRequestBody() {
      let claimRequests = []
      if (this.request?.letter_sub_type?.length) {
        for (let ind = 0; ind < this.request.letter_sub_type.length; ind++) {
          const subtype = this.request.letter_sub_type[ind]
          console.log("What is the subtype at this point", subtype)
          if (subtype[0].claimKeys?.length) {
            let attachments = []
            const claimkeys = subtype[0].claimKeys
            for (let i = 0; i < claimkeys?.length; i++) {
              if (
                this.getClaimKeyType(claimkeys[i].type) == 'attachments' &&
                claimkeys[i].value?.length
              ) {
                if (claimkeys[i].value[0].name != undefined) {
                  let attach = {}
                  // Check if the file already uploaded
                  if (claimkeys[i].value[0].link?.length) {
                    attach = claimkeys[i].value[0]
                  } else {
                    let upload_meta = {
                      file: claimkeys[i].value[0],
                      filename: claimkeys[i].value[0].name,
                    }
                    await this.uploadFile(upload_meta)
                    attach = {
                      name: claimkeys[i].name,
                      link: this.link_url,
                      filename: this.link_filename,
                      time: new Date(),
                    }
                  }
                  attachments.push(attach)
                }
              }
            }

            // Transform the subtype array into the required object structure
            const transformedSubtype = {
              claimType: subtype[0].claimType,
              claimSubType: subtype[0].claimSubType,
              payroll: subtype[0].payroll || false,
              payroll_auto_approved: subtype[0].payrollAutoApproved || false,
              ref_prefix: subtype[0].refPrefix,
              access: subtype[0].access,
              category: subtype[0].category || "",
              claim_keys: subtype[0].claimKeys.map(key => ({
                name: key.name,
                type: key.type,
                selector_values: key.selector_values || "",
                required: key.required || false,
                disabled: key.disabled || false,
                value: key.value,
                isDefaultKey: key.isDefaultKey,
                inputvalue: key.inputvalue
              })),
              id: subtype[0].id
            }

            claimRequests.push({
              claim_sub_type: transformedSubtype,
              receipts: attachments
            })
          }
        }
        return {
          userType: this.userType,
          applied_manager: this.user._id,
          user_id: this.selectedEmp._id,
          type: this.isDraftRequest ? 'draft' : 'active',
          claims: claimRequests,
          id: this.request.id ? this.request.id : '',
          letter_fields: {
            claim_description: this.description,
            requested_date: this.requested_date,
            total_claim_amount: this.total_claim_amount,
            files: [] // Added files array as shown in second payload
          },
        }
      }
      return {}
    },
    getClaimKeyType(claimkey) {
      return claimkey ? claimkey.split(' ').join('').toLowerCase() : ''
    },
    closeDatePickerDialog(reqind, ind, date) {
      const menu = this.$refs['menu' + reqind + ind]
      if (menu?.length) {
        menu[0].save(date)
      }
    },
    getSelectorValues(claimkey) {
      if (claimkey.selector_values?.length) {
        return claimkey.selector_values.split(',')
      }
      return []
    },
    getCalculatedValue(key) {
      if (key && key.inputvalue) {
        key.inputvalue = key.inputvalue.replace(/[^0-9]/g, '')
        if (key.isCalculationNeeded && key.expression) {
          key.value = eval(key.expression.replace('x', key.inputvalue))
        } else {
          key.value = key.inputvalue
        }
      } else {
        key.value = ''
      }
      this.getTotalClaimAmount()
    },

    getTotalClaimAmount() {
      let total = 0
      if (this.request.letter_sub_type?.length) {
        this.request.letter_sub_type.forEach((subtype) => {
          if (subtype?.claim_keys) {
            subtype.claim_keys.forEach((key) => {
              total =
                key.name?.toLowerCase() === 'amount' && key.value
                  ? total + Number(key.value)
                  : total
            })
          }
        })
      }
      this.total_claim_amount = total
    },
    deleteClaimRequest(ind) {
      this.request.letter_sub_type.splice(ind, 1)
    },
    onChangeClaimType(claimreq, ind, isDraft) {
       this.selectedClaimType = claimreq.letter_type;

      const associatedClaimSubTypes = this.groupedClaimSubTypes[this.selectedClaimType] || [];
      this.claimSubTypes = associatedClaimSubTypes
      this.$set(this.claimSubTypes, ind, _.cloneDeep(associatedClaimSubTypes));
      if (!isDraft) {
        this.request.letter_sub_type[ind] = associatedClaimSubTypes.length > 0 ? associatedClaimSubTypes[0] : {};
        this.selectedClaimSubType[ind] = associatedClaimSubTypes.length > 0 ? associatedClaimSubTypes[0] : {};
      }
    },
    onSelectClaimSubType(ind) {

      const selectedSubType = this.selectedClaimSubType[ind];
      console.log("WHat is the selected SubType", selectedSubType);
      console.log("What is the request leter stuff", this.request.letter_sub_type[ind]);
      if (selectedSubType) {
        const claimTypeGroup = this.selectedClaimType;
        if (claimTypeGroup) {
          const matchingSubType = this.groupedClaimSubTypes[claimTypeGroup][0][0];
          if (!this.request.letter_sub_type[ind]) {
            this.request.letter_sub_type[ind] = {};
          }

          if (matchingSubType) {
            matchingSubType.claimKeys.forEach(key => {
              console.log("Here are the selector values", key.selector_values)
              if (key && key.name) {
                this.request.letter_sub_type[ind][key.name] = {
                  value: null,
                  type: key.type,
                  required: key.required || false,
                  disabled: key.disabled || false,
                  selector_values: key.selector_values.length > 0 ? key.selector_values.split(',') : []
                };
              }
            });
          }
        }
      }
    },
    addNewClaimRequest() {
      if (!('letter_sub_type' in this.request)) {
        this.request.letter_sub_type = [];
      }

      const newClaim = {};
      this.request.letter_sub_type.push(newClaim);

      let claimTypeGroup = this.selectedClaimType;
      console.log('WHt is the claim type group', claimTypeGroup)
      if (claimTypeGroup) {
        const matchingSubType = this.groupedClaimSubTypes[claimTypeGroup][0][0];
        if (matchingSubType) {
          matchingSubType.claimKeys.forEach(key => {
            if (key && key.name) {
              newClaim[key.name] = {
                value: null,
                type: key.type,
                required: key.required || false,
                disabled: key.disabled || false,
                selector_values: key.selector_values.length > 0 ? key.selector_values.split(',') : []
              };
            }
          });
        }
      }
    },
    setDraftClaimInfo() {
      this.total_claim_amount = this.request.letter_fields.amount
      this.description = this.request.letter_fields.description
      this.selectedClaimSubType = []
      this.request.letter_sub_type.forEach((subType, ind) => {
        this.onChangeClaimType(subType, ind, true)
        this.selectedClaimSubType.push(subType)
      })
    },
    async getClaimConfig() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let data = {
        company_ID: this.companyData[0].id,
        ClaimSubTypes: 1,
      }
      console.log('The data here is', data)
      try {
        let config = await this.$axios.post(
          `/claim/config/getClaimConfig`,
          data,
          { headers: { Authorization: AuthStr } }
        )
        console.log('What do i get once I log this', config.data)
        return config.data
      } catch (error) {
        console.error(error)
        throw new Error(error)
      }
    },
  },
  computed: {
    computedClaimSubTypes() {
      if (this.request.letter_type != '') {
        let claims = this.claimTypes.filter(
          (a) => a.claimType == this.request.letter_type
        )
        return claims.sort((a, b) =>
          a.claimSubType.localeCompare(b.claimSubType)
        )
      } else {
        return []
      }
    },
    computeLevelApprover() {
      if (this.user.reporting.claims_approvals.level_1 == '') {
        this.snack = true
        this.snackText =
          'Please contact your HR Department as this request is not linked with an approver.'
        this.snackColor = 'red'
        return true
      }
    },
    getPayrollHint() {
      if (
        this.request &&
        this.request.letter_sub_type &&
        this.request.letter_sub_type.payroll
      ) {
        return 'Selected claim type will be processed with your salary.'
      } else {
        return ''
      }
    },
  },
  beforeDestroy() {
    this.$refs.form.reset()
  },
}
</script>
<style lang="scss">
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

.sticky-bottom {
  position: sticky;
  bottom: 0;
  background-color: #fff;
}

.v-stepper__step {
  padding-left: 0;
}

.v-sheet.v-stepper {
  box-shadow: none !important;
}

.loader-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>
