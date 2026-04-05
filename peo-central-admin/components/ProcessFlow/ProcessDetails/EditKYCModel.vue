<template>
  <div>
    <v-card color="card_bg" flat>
      <v-card-title class="tw-flex tw-items-center tw-justify-between tw-px-6 tw-py-4">
        <h3 class="tw-text-xl tw-font-semibold tw-text-gray-900">
          {{ isEditMode ? 'Edit KYC Details' : 'KYC Enrollment' }}
        </h3>
        <v-btn
          icon
          @click="closeModal"
          class="tw-text-gray-500 hover:tw-text-gray-700"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="tw-px-6 tw-pb-6">
        <v-form ref="form" v-model="valid">
          <!-- Step 1: Client Type -->
          <div v-if="currentStep === 1" class="tw-space-y-6">
            <div class="tw-mb-6">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Client Type</h3>
              <p class="tw-text-gray-600">Please select the type of client</p>
            </div>

            <v-radio-group v-model="kycData.clientType" class="tw-space-y-4">
              <v-radio
                label="Individual"
                value="individual"
                class="tw-p-4 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-border-blue-300 hover:tw-bg-blue-50"
              ></v-radio>
              <v-radio
                label="Company"
                value="company"
                class="tw-p-4 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-border-blue-300 hover:tw-bg-blue-50"
              ></v-radio>
            </v-radio-group>
          </div>

          <!-- Step 2: Basic Information -->
          <div v-if="currentStep === 2" class="tw-space-y-8">
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Client Information</h3>
              <p class="tw-text-gray-600">Please provide your basic information</p>
            </div>

            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  {{ kycData.clientType === 'individual' ? 'Full Name' : 'Registered Name' }}
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-text-field
                  v-model="kycData.fullName"
                  :rules="[v => !!v || 'This field is required']"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter your full name"
                />
              </div>

              <div v-if="kycData.clientType === 'company'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Trading Name / Alias (if any)
                </label>
                <v-text-field
                  v-model="kycData.tradingName"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter trading name"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Email Address
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-text-field
                  v-model="kycData.email"
                  :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Phone Number
                  <span class="tw-text-red-500">*</span>
                </label>
                <div class="tw-flex tw-gap-2">
                  <v-select
                    v-model="selectedPhoneCode"
                    :items="phoneCodes"
                    item-text="name"
                    item-value="phone"
                    outlined
                    dense
                    class="tw-w-32"
                    placeholder="Code"
                  ></v-select>
                  <v-text-field
                    v-model="kycData.phone"
                    :rules="[v => !!v || 'Phone number is required']"
                    outlined
                    dense
                    class="tw-rounded-xl tw-flex-1"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Mobile Number (Optional)
                </label>
                <div class="tw-flex tw-gap-2">
                  <v-select
                    v-model="selectedMobileCode"
                    :items="phoneCodes"
                    item-text="name"
                    item-value="phone"
                    outlined
                    dense
                    class="tw-w-32"
                    placeholder="Code"
                  ></v-select>
                  <v-text-field
                    v-model="kycData.mobile"
                    outlined
                    dense
                    class="tw-rounded-xl tw-flex-1"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>

              <div v-if="kycData.clientType === 'individual'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Gender
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-select
                  v-model="kycData.gender"
                  :items="['Male', 'Female', 'Other']"
                  :rules="[v => !!v || 'Gender is required']"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Select gender"
                ></v-select>
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Nationality
                </label>
                <v-select
                  v-model="kycData.nationality"
                  :items="countryList"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Select nationality"
                ></v-select>
              </div>

              <div v-if="kycData.clientType === 'individual'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Date of Birth
                </label>
                <v-date-picker
                  v-model="kycData.dateOfBirth"
                  outlined
                  dense
                  class="tw-rounded-xl"
                ></v-date-picker>
              </div>

              <div v-if="kycData.clientType === 'individual'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Place of Birth
                </label>
                <v-text-field
                  v-model="kycData.placeOfBirth"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter place of birth"
                />
              </div>
            </div>
          </div>

          <!-- Step 3: Address Information -->
          <div v-if="currentStep === 3" class="tw-space-y-8">
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Address Information</h3>
              <p class="tw-text-gray-600">Please provide your address details</p>
            </div>

            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Residential Address - City
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-text-field
                  v-model="kycData.residentialAddress.city"
                  :rules="[v => !!v || 'City is required']"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Residential Address - Country
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-select
                  v-model="kycData.residentialAddress.country"
                  :items="countryList"
                  :rules="[v => !!v || 'Country is required']"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Select country"
                ></v-select>
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Residential Address - Postal Code
                </label>
                <v-text-field
                  v-model="kycData.residentialAddress.postalCode"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter postal code"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Mailing Address - City
                </label>
                <v-text-field
                  v-model="kycData.mailingAddress.city"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Mailing Address - Country
                </label>
                <v-select
                  v-model="kycData.mailingAddress.country"
                  :items="countryList"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Select country"
                ></v-select>
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Mailing Address - Postal Code
                </label>
                <v-text-field
                  v-model="kycData.mailingAddress.postalCode"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>

          <!-- Step 4: Financial Information -->
          <div v-if="currentStep === 4" class="tw-space-y-8">
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Financial Information</h3>
              <p class="tw-text-gray-600">Please provide your financial details</p>
            </div>

            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Nature of Business
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-text-field
                  v-model="kycData.financialInfo.natureOfBusiness"
                  :rules="[v => !!v || 'Nature of business is required']"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter nature of business"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Expected Turnover
                </label>
                <div class="tw-flex tw-gap-2">
                  <v-text-field
                    v-model="kycData.financialInfo.expectedTurnover"
                    outlined
                    dense
                    class="tw-rounded-xl tw-flex-1"
                    placeholder="Enter amount"
                  />
                  <v-select
                    v-model="kycData.financialInfo.currency"
                    :items="currencies"
                    outlined
                    dense
                    class="tw-w-24"
                    placeholder="Currency"
                  ></v-select>
                </div>
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Bank Name
                </label>
                <v-text-field
                  v-model="kycData.financialInfo.bankName"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Branch
                </label>
                <v-text-field
                  v-model="kycData.financialInfo.branch"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter branch"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Account Number
                </label>
                <v-text-field
                  v-model="kycData.financialInfo.accountNumber"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  IBAN
                </label>
                <v-text-field
                  v-model="kycData.financialInfo.iban"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  placeholder="Enter IBAN"
                />
              </div>
            </div>
          </div>

          <!-- Step 5: Company-specific Information -->
          <div v-if="currentStep === 5 && kycData.clientType === 'company'" class="tw-space-y-8">
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Ultimate Beneficial Owners</h3>
              <p class="tw-text-gray-600">Please provide information about ultimate beneficial owners</p>
            </div>

            <div v-for="(ubo, index) in kycData.ultimateBeneficialOwners" :key="index" class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-mb-4">
              <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
                <h4 class="tw-text-lg tw-font-semibold tw-text-gray-800">UBO {{ index + 1 }}</h4>
                <v-btn
                  v-if="kycData.ultimateBeneficialOwners.length > 1"
                  small
                  color="red"
                  outlined
                  @click="removeUBO(index)"
                >
                  <v-icon small>mdi-delete</v-icon>
                  Remove
                </v-btn>
              </div>

              <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
                    Name
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="ubo.name"
                    :rules="[v => !!v || 'Name is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
                    Ownership %
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="ubo.ownershipPercentage"
                    :rules="[v => !!v || 'Ownership percentage is required']"
                    type="number"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter percentage"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
                    Nationality
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-select
                    v-model="ubo.nationality"
                    :items="countryList"
                    :rules="[v => !!v || 'Nationality is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Select nationality"
                  ></v-select>
                </div>
              </div>
            </div>

            <v-btn
              color="primary"
              outlined
              @click="addUBO"
              class="tw-mb-6"
            >
              <v-icon left>mdi-plus</v-icon>
              Add UBO
            </v-btn>

            <!-- Board Members -->
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Board Members</h3>
              <p class="tw-text-gray-600">Please provide information about board members</p>
            </div>

            <div v-for="(member, index) in kycData.boardMembers" :key="index" class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-mb-4">
              <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
                <h4 class="tw-text-lg tw-font-semibold tw-text-gray-800">Board Member {{ index + 1 }}</h4>
                <v-btn
                  v-if="kycData.boardMembers.length > 1"
                  small
                  color="red"
                  outlined
                  @click="removeBoardMember(index)"
                >
                  <v-icon small>mdi-delete</v-icon>
                  Remove
                </v-btn>
              </div>

              <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
                    Name
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="member.name"
                    :rules="[v => !!v || 'Name is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
                    Position
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="member.position"
                    :rules="[v => !!v || 'Position is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter position"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
                    Nationality
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-select
                    v-model="member.nationality"
                    :items="countryList"
                    :rules="[v => !!v || 'Nationality is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Select nationality"
                  ></v-select>
                </div>
              </div>
            </div>

            <v-btn
              color="primary"
              outlined
              @click="addBoardMember"
              class="tw-mb-6"
            >
              <v-icon left>mdi-plus</v-icon>
              Add Board Member
            </v-btn>
          </div>

          <!-- Step 6: Documents -->
          <div v-if="currentStep === 6" class="tw-space-y-8">
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Supporting Documents</h3>
              <p class="tw-text-gray-600">Please upload the required documents</p>
            </div>

            <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
              <div v-if="kycData.clientType === 'individual'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Passport Copy
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-file-input
                  v-model="kycData.documents.passport"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  accept="image/*,.pdf"
                  show-size
                />
              </div>

              <div v-if="kycData.clientType === 'individual'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Emirates ID Copy
                </label>
                <v-file-input
                  v-model="kycData.documents.emirates_id"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  accept="image/*,.pdf"
                  show-size
                />
              </div>

              <div v-if="kycData.clientType === 'company'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Certificate of Incorporation
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-file-input
                  v-model="kycData.documents.certificate_of_incorporation"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  accept="image/*,.pdf"
                  show-size
                />
              </div>

              <div v-if="kycData.clientType === 'company'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Memorandum & Articles
                </label>
                <v-file-input
                  v-model="kycData.documents.memorandum_articles"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  accept="image/*,.pdf"
                  show-size
                />
              </div>

              <div v-if="kycData.clientType === 'company'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  VAT Certificate
                </label>
                <v-file-input
                  v-model="kycData.documents.vat_certificate"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  accept="image/*,.pdf"
                  show-size
                />
              </div>

              <div v-if="kycData.clientType === 'company'">
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  Authorized Signatory ID
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-file-input
                  v-model="kycData.documents.authorized_signatory_id"
                  outlined
                  dense
                  class="tw-rounded-xl"
                  accept="image/*,.pdf"
                  show-size
                />
              </div>
            </div>
          </div>

          <!-- Step 7: Compliance -->
          <div v-if="currentStep === 7" class="tw-space-y-8">
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Compliance Declarations</h3>
              <p class="tw-text-gray-600">Please complete the compliance declarations</p>
            </div>

            <div class="tw-space-y-6">
              <div>
                <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                  PEP Status
                  <span class="tw-text-red-500">*</span>
                </label>
                <v-radio-group v-model="kycData.pepStatus" class="tw-space-y-2">
                  <v-radio
                    label="Not PEP"
                    value="not_pep"
                  ></v-radio>
                  <v-radio
                    label="PEP"
                    value="pep"
                  ></v-radio>
                  <v-radio
                    label="PEP Family Member"
                    value="pep_family"
                  ></v-radio>
                </v-radio-group>
              </div>
            </div>
          </div>

          <!-- Step 8: Consent & Signature -->
          <div v-if="currentStep === 8" class="tw-space-y-8">
            <div class="tw-mb-8">
              <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Consent & Signature</h3>
              <p class="tw-text-gray-600">Please provide your consent and signature</p>
            </div>

            <div class="tw-space-y-6">
              <div>
                <h4 class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4">Consent Declarations</h4>
                <div class="tw-space-y-4">
                  <v-checkbox
                    v-model="kycData.consent.dataProcessing"
                    label="I consent to the processing of my personal data for KYC purposes"
                    :rules="[v => !!v || 'Data processing consent is required']"
                  ></v-checkbox>
                  <v-checkbox
                    v-model="kycData.consent.regulatorySharing"
                    label="I consent to sharing information with regulatory authorities as required"
                    :rules="[v => !!v || 'Regulatory sharing consent is required']"
                  ></v-checkbox>
                  <v-checkbox
                    v-model="kycData.consent.ongoingMonitoring"
                    label="I consent to ongoing monitoring and updates of my information"
                    :rules="[v => !!v || 'Ongoing monitoring consent is required']"
                  ></v-checkbox>
                  <v-checkbox
                    v-model="kycData.consent.falseInformation"
                    label="I declare that all information provided is true and accurate"
                    :rules="[v => !!v || 'False information declaration is required']"
                  ></v-checkbox>
                </div>
              </div>

              <div>
                <h4 class="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-4">Signature</h4>
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      Full Name
                      <span class="tw-text-red-500">*</span>
                    </label>
                    <v-text-field
                      v-model="kycData.signature.fullName"
                      :rules="[v => !!v || 'Signature full name is required']"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div v-if="kycData.clientType === 'company'">
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      Designation
                    </label>
                    <v-text-field
                      v-model="kycData.signature.designation"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Enter designation"
                    />
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      Date
                      <span class="tw-text-red-500">*</span>
                    </label>
                    <v-date-picker
                      v-model="kycData.signature.date"
                      outlined
                      dense
                      class="tw-rounded-xl"
                    ></v-date-picker>
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      Place
                      <span class="tw-text-red-500">*</span>
                    </label>
                    <v-text-field
                      v-model="kycData.signature.place"
                      :rules="[v => !!v || 'Signature place is required']"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Enter place"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="tw-flex tw-justify-between tw-items-center tw-mt-8 tw-pt-6 tw-border-t tw-border-gray-200">
            <v-btn
              v-if="currentStep > 1"
              outlined
              @click="previousStep"
              class="tw-px-6"
            >
              <v-icon left>mdi-arrow-left</v-icon>
              Previous
            </v-btn>
            <div v-else></div>

            <div class="tw-flex tw-gap-3">
              <v-btn
                v-if="currentStep < totalSteps"
                color="primary"
                @click="nextStep"
                class="tw-px-6"
              >
                Next
                <v-icon right>mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn
                v-else
                color="primary"
                @click="submitForm"
                :loading="isSubmitting"
                class="tw-px-6"
              >
                <v-icon left>mdi-check</v-icon>
                {{ isEditMode ? 'Update KYC' : 'Submit KYC' }}
              </v-btn>
            </div>
          </div>

          <!-- Progress Indicator -->
          <div class="tw-mt-6">
            <div class="tw-flex tw-items-center tw-justify-between tw-text-sm tw-text-gray-600">
              <span>Step {{ currentStep }} of {{ totalSteps }}</span>
              <span>{{ Math.round((currentStep / totalSteps) * 100) }}% Complete</span>
            </div>
            <v-progress-linear
              :value="(currentStep / totalSteps) * 100"
              color="primary"
              height="4"
              class="tw-mt-2"
            ></v-progress-linear>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import countries from 'countries-list'

export default {
  props: {
    kycData: {
      type: Object,
      default: () => ({})
    },
    leadId: {
      type: String,
      required: true
    },
    handleModel: {
      type: Function,
      required: true
    },
    isEditMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: false,
      currentStep: 1,
      isSubmitting: false,
      selectedPhoneCode: '',
      selectedMobileCode: '',

      // Country and phone code data
      countries: Object.keys(countries.countries).map((code) => ({
        name: countries.countries[code].name,
        code: code,
        phone: countries.countries[code].phone
      })),
      countryList: Object.keys(countries.countries).map((code) => countries.countries[code].name),
      phoneCodes: Object.keys(countries.countries).map((code) => ({
        name: `${countries.countries[code].name} (+${countries.countries[code].phone})`,
        phone: countries.countries[code].phone
      })),

      // Currency data
      currencies: [
        'AED', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP',
        'CAD', 'AUD', 'CHF', 'JPY', 'CNY', 'INR', 'PKR', 'BDT', 'LKR', 'NPR', 'PHP', 'THB',
        'SGD', 'MYR', 'IDR', 'VND', 'KRW', 'TWD', 'HKD', 'NZD', 'ZAR', 'BRL', 'MXN', 'ARS'
      ]
    }
  },
  computed: {
    totalSteps() {
      if (this.kycData.clientType === 'company') {
        return 8
      }
      return 7
    }
  },
  mounted() {
    this.initializeForm()
  },
  methods: {
    initializeForm() {
      // Initialize form with default values if not in edit mode
      if (!this.isEditMode) {
        this.kycData.clientType = 'individual'
        this.kycData.residentialAddress = { city: '', country: '', postalCode: '' }
        this.kycData.mailingAddress = { city: '', country: '', postalCode: '' }
        this.kycData.financialInfo = {
          natureOfBusiness: '',
          expectedTurnover: '',
          currency: 'AED',
          bankName: '',
          branch: '',
          accountNumber: '',
          iban: ''
        }
        this.kycData.documents = {
          passport: '',
          emirates_id: '',
          national_id: '',
          certificate_of_incorporation: '',
          memorandum_articles: '',
          vat_certificate: '',
          authorized_signatory_id: ''
        }
        this.kycData.consent = {
          dataProcessing: false,
          regulatorySharing: false,
          ongoingMonitoring: false,
          falseInformation: false
        }
        this.kycData.signature = {
          signature: '',
          fullName: '',
          designation: '',
          date: null,
          place: '',
          signatureType: 'typed'
        }
        this.kycData.ultimateBeneficialOwners = []
        this.kycData.boardMembers = []
      }

      // Pre-fill phone codes if phone numbers exist
      if (this.kycData.phone) {
        this.extractPhoneCode(this.kycData.phone, 'phone')
      }
      if (this.kycData.mobile) {
        this.extractPhoneCode(this.kycData.mobile, 'mobile')
      }

      // Add default UBO and Board Member if company
      if (this.kycData.clientType === 'company') {
        if (!this.kycData.ultimateBeneficialOwners || this.kycData.ultimateBeneficialOwners.length === 0) {
          this.kycData.ultimateBeneficialOwners = [{
            name: '',
            ownershipPercentage: '',
            nationality: ''
          }]
        }
        if (!this.kycData.boardMembers || this.kycData.boardMembers.length === 0) {
          this.kycData.boardMembers = [{
            name: '',
            position: '',
            nationality: ''
          }]
        }
      }
    },

    extractPhoneCode(phoneNumber, type) {
      if (!phoneNumber || !phoneNumber.startsWith('+')) return

      for (const code of this.phoneCodes) {
        if (phoneNumber.startsWith(`+${code.phone}`)) {
          if (type === 'phone') {
            this.selectedPhoneCode = code.phone
          } else if (type === 'mobile') {
            this.selectedMobileCode = code.phone
          }
          break
        }
      }
    },

    nextStep() {
      if (this.validateCurrentStep()) {
        this.currentStep++
      }
    },

    previousStep() {
      this.currentStep--
    },

    validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          return !!this.kycData.clientType
        case 2:
          return this.validateBasicInfo()
        case 3:
          return this.validateAddress()
        case 4:
          return this.validateFinancialInfo()
        case 5:
          return this.validateCompanyInfo()
        case 6:
          return this.validateDocuments()
        case 7:
          return !!this.kycData.pepStatus
        case 8:
          return this.validateConsentAndSignature()
        default:
          return true
      }
    },

    validateBasicInfo() {
      const required = ['fullName', 'email', 'phone']
      for (const field of required) {
        if (!this.kycData[field]) return false
      }
      if (this.kycData.clientType === 'individual' && !this.kycData.gender) return false
      return true
    },

    validateAddress() {
      return !!(this.kycData.residentialAddress?.city && this.kycData.residentialAddress?.country)
    },

    validateFinancialInfo() {
      return !!this.kycData.financialInfo?.natureOfBusiness
    },

    validateCompanyInfo() {
      if (this.kycData.clientType !== 'company') return true

      // Validate UBOs
      for (const ubo of this.kycData.ultimateBeneficialOwners) {
        if (!ubo.name || !ubo.ownershipPercentage || !ubo.nationality) return false
      }

      // Validate Board Members
      for (const member of this.kycData.boardMembers) {
        if (!member.name || !member.position || !member.nationality) return false
      }

      return true
    },

    validateDocuments() {
      if (this.kycData.clientType === 'individual') {
        return !!this.kycData.documents?.passport
      } else if (this.kycData.clientType === 'company') {
        return !!(this.kycData.documents?.certificate_of_incorporation && this.kycData.documents?.authorized_signatory_id)
      }
      return true
    },

    validateConsentAndSignature() {
      const consent = this.kycData.consent
      const signature = this.kycData.signature

      return !!(consent.dataProcessing && consent.regulatorySharing &&
                consent.ongoingMonitoring && consent.falseInformation &&
                signature.fullName && signature.date && signature.place)
    },

    addUBO() {
      this.kycData.ultimateBeneficialOwners.push({
        name: '',
        ownershipPercentage: '',
        nationality: ''
      })
    },

    removeUBO(index) {
      this.kycData.ultimateBeneficialOwners.splice(index, 1)
    },

    addBoardMember() {
      this.kycData.boardMembers.push({
        name: '',
        position: '',
        nationality: ''
      })
    },

    removeBoardMember(index) {
      this.kycData.boardMembers.splice(index, 1)
    },

    formatPhoneNumbers() {
      if (this.selectedPhoneCode && this.kycData.phone) {
        this.kycData.phone = `+${this.selectedPhoneCode}${this.kycData.phone}`
      }
      if (this.selectedMobileCode && this.kycData.mobile) {
        this.kycData.mobile = `+${this.selectedMobileCode}${this.kycData.mobile}`
      }
    },

    async submitForm() {
      if (!this.validateAllSteps()) {
        this.$emit('error', 'Please complete all required fields')
        return
      }

      try {
        this.isSubmitting = true

        // Format phone numbers with country codes
        this.formatPhoneNumbers()

        // Prepare submission data
        const submitData = {
          ...this.kycData,
          leadId: this.leadId
        }

        // Submit to backend
        if (this.isEditMode) {
          await this.$axios.put(`/kyc-enrollments/${this.leadId}`, submitData)
        } else {
          await this.$axios.post(`/kyc-enrollments/${this.leadId}/submit`, submitData)
        }

        this.$emit('success', 'KYC details saved successfully')
        this.closeModal()
      } catch (error) {
        console.error('Error submitting KYC form:', error)
        this.$emit('error', 'Error saving KYC details. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    },

    validateAllSteps() {
      for (let step = 1; step <= this.totalSteps; step++) {
        this.currentStep = step
        if (!this.validateCurrentStep()) {
          return false
        }
      }
      return true
    },

    closeModal() {
      this.handleModel()
    }
  }
}
</script>

<style lang="scss" scoped>
.tw-rounded-xl {
  border-radius: 0.75rem;
}
</style>
