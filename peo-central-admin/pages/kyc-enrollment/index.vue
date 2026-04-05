<template>
  <div class="tw-min-h-screen card-background">
    <!-- Header -->
    <div class="tw-bg-white tw-shadow-sm tw-border-b tw-border-gray-200">
      <div class="tw-max-w-6xl tw-mx-auto tw-px-4 tw-py-6">
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-6">
          <div class="tw-flex tw-items-center tw-space-x-4">
            <img src="/nathan-logo.svg" alt="Nathan & Nathan" class="tw-h-12 tw-w-auto" />
            <div>
              <h1 class="tw-text-2xl tw-font-bold tw-text-blue-600">Nathan & Nathan</h1>
              <p class="tw-text-sm tw-text-gray-600">Professional Employer Organization</p>
            </div>
          </div>

          <div class="tw-hidden md:tw-flex tw-items-center tw-space-x-6 tw-text-sm tw-text-gray-600">
            <div class="tw-flex tw-items-center tw-space-x-2">
              <v-icon size="16" color="blue">mdi-phone</v-icon>
              <span>+971 4 354 4466</span>
            </div>
            <div class="tw-flex tw-items-center tw-space-x-2">
              <v-icon size="16" color="blue">mdi-email</v-icon>
              <span>info@nathanhr.com</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="tw-mt-4">
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
            <span class="tw-text-sm tw-font-semibold tw-text-gray-700">Step {{ currentStep }} of {{ totalSteps }}</span>
            <span class="tw-text-sm tw-text-gray-500 tw-bg-gray-100 tw-px-3 tw-py-1 tw-rounded-full">
              {{ Math.round(progressPercentage) }}% Complete
            </span>
          </div>
          <div class="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-3 tw-overflow-hidden">
            <div
              class="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-600 tw-h-full tw-rounded-full tw-transition-all tw-duration-500 tw-ease-out"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-32">
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-12 tw-text-center tw-max-w-md tw-mx-4">
        <v-progress-circular indeterminate size="80" color="blue" class="tw-mb-6" />
        <h2 class="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Loading KYC Form</h2>
        <p class="tw-text-gray-600">Please wait while we prepare your form...</p>
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="submitSuccess" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-32 tw-px-4">
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-p-12 tw-max-w-lg tw-w-full tw-text-center">
        <div class="tw-bg-green-100 tw-rounded-full tw-w-24 tw-h-24 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6">
          <v-icon size="48" color="success">mdi-check-circle</v-icon>
        </div>
        <h1 class="tw-text-3xl tw-font-bold tw-text-gray-900 tw-mb-4">KYC Form Submitted Successfully!</h1>
        <p class="tw-text-gray-600 tw-mb-8 tw-leading-relaxed">
          Thank you for completing your KYC form. Our team will review your information
          and contact you if any additional details are required.
        </p>
        <v-btn color="primary" large @click="downloadReceipt" class="tw-rounded-xl tw-px-8 tw-py-3">
          <v-icon left>mdi-download</v-icon>
          Download Receipt
        </v-btn>
      </div>
    </div>

    <!-- Form Content -->
    <div v-else class="tw-max-w-6xl tw-mx-auto tw-px-4 tw-py-8">
      <!-- Main Card -->
      <div class="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border tw-border-gray-100 tw-overflow-hidden">
        <!-- Card Header -->
        <div class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-700 tw-px-8 tw-py-6">
          <h2 class="tw-text-2xl tw-font-bold tw-text-white tw-mb-2">{{ currentSectionTitle }}</h2>
          <p class="tw-text-blue-100">{{ currentSectionDescription }}</p>
        </div>

        <!-- Global Error Alert -->
        <div v-if="globalError" class="tw-mx-8 tw-mt-6">
          <v-alert
            type="error"
            dismissible
            @input="globalError = null"
            class="tw-rounded-xl tw-border-l-4 tw-border-red-500"
          >
            <div class="tw-flex tw-items-center">
              <v-icon left>mdi-alert-circle</v-icon>
              {{ globalError }}
            </div>
          </v-alert>
        </div>

        <!-- Validation Summary -->
        <div v-if="validationErrors.length > 0" class="tw-mx-8 tw-mt-6">
          <v-alert type="warning" class="tw-rounded-xl tw-border-l-4 tw-border-yellow-500">
            <div>
              <h4 class="tw-font-semibold tw-mb-3 tw-text-gray-900">Please correct the following errors:</h4>
              <ul class="tw-list-disc tw-list-inside tw-space-y-1">
                <li v-for="error in validationErrors" :key="error" class="tw-text-sm tw-text-gray-700">
                  {{ error }}
                </li>
              </ul>
            </div>
          </v-alert>
        </div>

        <!-- Card Content -->
        <div class="tw-p-8">
          <v-form ref="kycForm" v-model="formValid">

            <!-- Step 1: Client Type Selection -->
            <div v-if="currentStep === 1" class="tw-space-y-6">
              <div class="tw-text-center tw-mb-8">
                <h3 class="tw-text-2xl tw-font-semibold tw-text-gray-900 tw-mb-2">Client Type</h3>
                <p class="tw-text-gray-600">Select the type of client you are</p>
              </div>

              <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-max-w-2xl tw-mx-auto">
                <div
                  class="tw-border tw-rounded-lg tw-p-4 tw-cursor-pointer tw-transition-all tw-duration-200 tw-text-center tw-group"
                  :class="kycData.clientType === 'individual'
                    ? 'tw-border-blue-500 tw-bg-blue-50 tw-shadow-sm'
                    : 'tw-border-gray-200 hover:tw-border-blue-300 hover:tw-bg-gray-50'"
                  @click="selectClientType('individual')"
                >
                  <div class="tw-flex tw-items-center tw-justify-center tw-mb-3">
                    <div class="tw-bg-blue-100 tw-rounded-full tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center">
                      <v-icon size="24" color="blue">mdi-account</v-icon>
                    </div>
                  </div>
                  <h4 class="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-1">Individual</h4>
                  <p class="tw-text-sm tw-text-gray-600 tw-mb-3">
                    Personal KYC for individual clients
                  </p>
                  <v-radio
                    :value="kycData.clientType === 'individual'"
                    @click="selectClientType('individual')"
                    color="blue"
                    class="tw-scale-110"
                  />
                </div>

                <div
                  class="tw-border tw-rounded-lg tw-p-4 tw-cursor-pointer tw-transition-all tw-duration-200 tw-text-center tw-group"
                  :class="kycData.clientType === 'company'
                    ? 'tw-border-blue-500 tw-bg-blue-50 tw-shadow-sm'
                    : 'tw-border-gray-200 hover:tw-border-blue-300 hover:tw-bg-gray-50'"
                  @click="selectClientType('company')"
                >
                  <div class="tw-flex tw-items-center tw-justify-center tw-mb-3">
                    <div class="tw-bg-blue-100 tw-rounded-full tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center">
                      <v-icon size="24" color="blue">mdi-domain</v-icon>
                    </div>
                  </div>
                  <h4 class="tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-1">Company</h4>
                  <p class="tw-text-sm tw-text-gray-600 tw-mb-3">
                    Corporate KYC for business entities
                  </p>
                  <v-radio
                    :value="kycData.clientType === 'company'"
                    @click="selectClientType('company')"
                    color="blue"
                    class="tw-scale-110"
                  />
                </div>
              </div>
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
                    {{ kycData.clientType === 'individual' ? 'Nationality' : 'Country of Incorporation' }}
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-select
                    v-model="kycData.nationality"
                    :items="countryList"
                    :rules="[v => !!v || 'This field is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    :placeholder="kycData.clientType === 'individual' ? 'Select nationality' : 'Select country'"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    {{ kycData.clientType === 'individual' ? 'Date of Birth' : 'Date of Incorporation' }}
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="kycData.dateOfBirth"
                    :rules="[v => !!v || 'This field is required']"
                    type="date"
                    outlined
                    dense
                    class="tw-rounded-xl"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    {{ kycData.clientType === 'individual' ? 'Place of Birth' : 'Place of Registration' }}
                    <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="kycData.placeOfBirth"
                    :rules="[v => !!v || 'This field is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter place"
                  />
                </div>

                <div v-if="kycData.clientType === 'individual'">
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    Gender <span class="tw-text-red-500">*</span>
                  </label>
                  <v-radio-group v-model="kycData.gender" row class="tw-mt-2">
                    <v-radio label="Male" value="Male" color="blue"></v-radio>
                    <v-radio label="Female" value="Female" color="blue"></v-radio>
                    <v-radio label="Other" value="Other" color="blue"></v-radio>
                  </v-radio-group>
                </div>
              </div>

              <!-- Address Information -->
              <div class="tw-mt-12 tw-pt-8 tw-border-t tw-border-gray-200">
                <h4 class="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-6">
                  {{ kycData.clientType === 'individual' ? 'Residential Address' : 'Business Address' }}
                </h4>

                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      City <span class="tw-text-red-500">*</span>
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
                      Country <span class="tw-text-red-500">*</span>
                    </label>
                    <v-select
                      v-model="kycData.residentialAddress.country"
                      :items="countryList"
                      :rules="[v => !!v || 'Country is required']"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Select country"
                    />
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      Postal Code / PO Box <span class="tw-text-red-500">*</span>
                    </label>
                    <v-text-field
                      v-model="kycData.residentialAddress.postalCode"
                      :rules="[v => !!v || 'Postal code is required']"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
              </div>

              <!-- Mailing Address -->
              <div class="tw-mt-8 tw-pt-8 tw-border-t tw-border-gray-200">
                <h4 class="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-6">
                  Mailing / Correspondence Address (if different)
                </h4>

                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">City</label>
                    <v-text-field
                      v-model="kycData.mailingAddress.city"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Country</label>
                    <v-select
                      v-model="kycData.mailingAddress.country"
                      :items="countryList"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Select country"
                    />
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Postal Code / PO Box</label>
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

              <!-- Contact Information -->
              <div class="tw-mt-8 tw-pt-8 tw-border-t tw-border-gray-200">
                <h4 class="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-6">Contact Information</h4>

                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      Email Address <span class="tw-text-red-500">*</span>
                    </label>
                    <v-text-field
                      v-model="kycData.email"
                      :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                      Phone Number <span class="tw-text-red-500">*</span>
                    </label>
                    <div class="tw-flex tw-space-x-2">
                      <div class="tw-w-32">
                        <v-select
                          v-model="selectedPhoneCode"
                          :items="phoneCodes"
                          item-text="name"
                          item-value="phone"
                          outlined
                          dense
                          class="tw-rounded-xl"
                          placeholder="Code"
                        />
                      </div>
                      <div class="tw-flex-1">
                        <v-text-field
                          v-model="kycData.phone"
                          :rules="[v => !!v || 'Phone number is required']"
                          outlined
                          dense
                          class="tw-rounded-xl"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Mobile Number</label>
                    <div class="tw-flex tw-space-x-2">
                      <div class="tw-w-32">
                        <v-select
                          v-model="selectedMobileCode"
                          :items="phoneCodes"
                          item-text="name"
                          item-value="phone"
                          outlined
                          dense
                          class="tw-rounded-xl"
                          placeholder="Code"
                        />
                      </div>
                      <div class="tw-flex-1">
                        <v-text-field
                          v-model="kycData.mobile"
                          outlined
                          dense
                          class="tw-rounded-xl"
                          placeholder="Enter mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Website (if any)</label>
                    <v-text-field
                      v-model="kycData.website"
                      outlined
                      dense
                      class="tw-rounded-xl"
                      placeholder="Enter website URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Company-specific fields (UBO) -->
            <div v-if="currentStep === 3 && kycData.clientType === 'company'" class="tw-space-y-8">
              <div class="tw-mb-8">
                <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Ultimate Beneficial Owners</h3>
                <p class="tw-text-gray-600">Please provide details of all Ultimate Beneficial Owners</p>
              </div>

              <div class="tw-bg-gray-50 tw-rounded-2xl tw-p-6">
                <div class="tw-flex tw-items-center tw-justify-between tw-mb-6">
                  <div>
                    <h4 class="tw-text-lg tw-font-bold tw-text-gray-900">UBO Information</h4>
                    <p class="tw-text-sm tw-text-gray-600">Add all individuals who own 25% or more of the company</p>
                  </div>
                  <v-btn
                    @click="addUBORow"
                    color="primary"
                    outlined
                    class="tw-rounded-xl tw-px-6"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Add UBO
                  </v-btn>
                </div>

                <!-- UBO Validation Alert -->
                <div v-if="hasUBOValidationErrors" class="tw-mb-6">
                  <v-alert type="warning" class="tw-rounded-xl tw-border-l-4 tw-border-yellow-500">
                    <div class="tw-flex tw-items-start">
                      <v-icon left color="warning">mdi-alert-circle</v-icon>
                      <div>
                        <h4 class="tw-font-semibold tw-mb-2 tw-text-gray-900">UBO Validation Required</h4>
                        <ul class="tw-list-disc tw-list-inside tw-space-y-1 tw-text-sm">
                          <li>All UBOs must own 25% or more of the company</li>
                          <li>Please ensure all percentage fields are valid</li>
                        </ul>
                      </div>
                    </div>
                  </v-alert>
                </div>

                <div class="tw-overflow-x-auto">
                  <div class="tw-min-w-full tw-bg-white tw-rounded-xl tw-border tw-overflow-hidden">
                    <div class="tw-grid tw-grid-cols-6 tw-gap-4 tw-bg-gray-100 tw-p-4 tw-text-sm tw-font-semibold tw-text-gray-700">
                      <div class="tw-text-nowrap">Name</div>
                      <div class="tw-text-nowrap">Nationality</div>
                      <div class="tw-text-nowrap"><p class="tw-text-nowrap">ID Number / Passport</p></div>
                      <div class="tw-text-nowrap">% Ownership</div>
                      <div class="tw-text-nowrap">Position / Role</div>
                      <div class="tw-text-center tw-text-nowrap">Actions</div>
                    </div>

                    <div v-for="(row, index) in kycData.ultimateBeneficialOwners" :key="index"
                         class="tw-grid tw-grid-cols-6 tw-gap-4 tw-p-4 tw-border-b tw-border-gray-200 last:tw-border-b-0 tw-items-center">
                      <div>
                        <v-text-field
                          v-model="row.name"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <v-select
                          v-model="row.nationality"
                          :items="countryList"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="Select nationality"
                        />
                      </div>
                      <div>
                        <v-text-field
                          v-model="row.idNumber"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="ID/Passport"
                        />
                      </div>
                      <div>
                        <v-text-field
                          v-model="row.ownershipPercentage"
                          type="number"
                          min="0"
                          max="100"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="%"
                          @input="validateOwnershipPercentage(row, index)"
                        />
                        <div v-if="row.ownershipError" class="tw-text-xs tw-text-red-500 tw-mt-1">
                          {{ row.ownershipError }}
                        </div>
                      </div>
                      <div>
                        <v-text-field
                          v-model="row.position"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="Position"
                        />
                      </div>
                      <div class="tw-flex tw-justify-center tw-items-center">
                        <v-btn
                          @click="removeUBORow(index)"
                          icon
                          small
                          color="error"
                          :disabled="kycData.ultimateBeneficialOwners.length <= 1"
                          class="tw-rounded-xl"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Board of Directors / Authorized Signatories -->
            <div v-if="currentStep === 4" class="tw-space-y-8">
              <div class="tw-mb-8">
                <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Board of Directors / Authorized Signatories</h3>
                <p class="tw-text-gray-600">Please provide details of all authorized signatories</p>
              </div>

              <div class="tw-bg-gray-50 tw-rounded-2xl tw-p-6">
                <div class="tw-flex tw-items-center tw-justify-between tw-mb-6">
                  <div>
                    <h4 class="tw-text-lg tw-font-bold tw-text-gray-900">Signatory Information</h4>
                    <p class="tw-text-sm tw-text-gray-600">Add all individuals authorized to sign on behalf of the company</p>
                  </div>
                  <v-btn
                    @click="addBoardMemberRow"
                    color="primary"
                    outlined
                    class="tw-rounded-xl tw-px-6"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Add Signatory
                  </v-btn>
                </div>

                <div class="tw-overflow-x-auto">
                  <div class="tw-min-w-full tw-bg-white tw-rounded-xl tw-border tw-overflow-hidden">
                    <div class="tw-grid tw-grid-cols-6 tw-gap-4 tw-bg-gray-100 tw-p-4 tw-text-sm tw-font-semibold tw-text-gray-700">
                      <div class="tw-text-nowrap">Name</div>
                      <div class="tw-text-nowrap">Nationality</div>
                      <div class="tw-text-nowrap">ID Number / Passport</div>
                      <div class="tw-text-nowrap">Position / Role</div>
                      <div class="tw-text-nowrap">Initials</div>
                      <div class="tw-text-center tw-text-nowrap">Actions</div>
                    </div>

                    <div v-for="(row, index) in kycData.boardMembers" :key="index"
                         class="tw-grid tw-grid-cols-6 tw-gap-4 tw-p-4 tw-border-b tw-border-gray-200 last:tw-border-b-0 tw-items-center">
                      <div>
                        <v-text-field
                          v-model="row.name"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <v-select
                          v-model="row.nationality"
                          :items="countryList"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="Select nationality"
                        />
                      </div>
                      <div>
                        <v-text-field
                          v-model="row.idNumber"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="ID/Passport"
                        />
                      </div>
                      <div>
                        <v-text-field
                          v-model="row.position"
                          outlined
                          dense
                          hide-details="auto"
                          class="tw-rounded-xl"
                          placeholder="Position"
                        />
                      </div>
                      <div>
                        <div class="tw-flex tw-items-center tw-space-x-3">
                          <div v-if="row.initials" class="tw-bg-blue-100 tw-text-blue-800 tw-px-4 tw-py-2 tw-rounded-full tw-text-sm tw-font-bold">
                            {{ row.initials }}
                          </div>
                          <v-btn @click="openInitialsModal(index)" small outlined class="tw-rounded-xl">
                            {{ row.initials ? 'Edit' : 'Set' }}
                          </v-btn>
                        </div>
                      </div>
                      <div class="tw-flex tw-justify-center tw-items-center">
                        <v-btn
                          @click="removeBoardMemberRow(index)"
                          icon
                          small
                          color="error"
                          :disabled="kycData.boardMembers.length <= 1"
                          class="tw-rounded-xl"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 5: Financial Information -->
            <div v-if="currentStep === 5" class="tw-space-y-8">
              <div class="tw-mb-8">
                <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Financial Information</h3>
                <p class="tw-text-gray-600">Please provide your financial details</p>
              </div>

              <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                <div class="tw-col-span-full">
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    Nature of Business / Source of Funds <span class="tw-text-red-500">*</span>
                  </label>
                  <v-textarea
                    v-model="kycData.financialInfo.natureOfBusiness"
                    :rules="[v => !!v || 'This field is required']"
                    outlined
                    dense
                    rows="4"
                    class="tw-rounded-xl"
                    placeholder="Describe your business nature and source of funds"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    Expected Annual Turnover / Transaction Volume <span class="tw-text-red-500">*</span>
                  </label>
                  <div class="tw-flex tw-space-x-2">
                    <div class="tw-w-32">
                      <v-select
                        v-model="kycData.financialInfo.currency"
                        :items="currencies"
                        outlined
                        dense
                        class="tw-rounded-xl"
                        placeholder="Currency"
                        searchable
                      />
                    </div>
                    <div class="tw-flex-1">
                      <v-text-field
                        v-model="kycData.financialInfo.expectedTurnover"
                        :rules="[v => !!v || 'This field is required']"
                        outlined
                        dense
                        class="tw-rounded-xl"
                        placeholder="Enter expected turnover"
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    Bank Name <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="kycData.financialInfo.bankName"
                    :rules="[v => !!v || 'This field is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter bank name"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    Branch <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="kycData.financialInfo.branch"
                    :rules="[v => !!v || 'This field is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter branch"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                    Account Number <span class="tw-text-red-500">*</span>
                  </label>
                  <v-text-field
                    v-model="kycData.financialInfo.accountNumber"
                    :rules="[v => !!v || 'This field is required']"
                    outlined
                    dense
                    class="tw-rounded-xl"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">IBAN (if applicable)</label>
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

            <!-- Step 6: Supporting Documents -->
            <div v-if="currentStep === 6" class="tw-space-y-8">
              <div class="tw-mb-8">
                <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Supporting Documents / Identification Documents</h3>
                <p class="tw-text-gray-600">Please upload the required documents for verification</p>
              </div>

              <!-- Document Upload Grid -->
              <div class="tw-gap-6 tw-min-w-full">
                <!-- Individual Documents -->
                <div v-if="kycData.clientType === 'individual'" class="tw-space-y-6 tw-min-w-full ">
                  <div class="tw-bg-gray-50 tw-rounded-2xl tw-p-6 tw-min-w-full">
                    <div class="tw-flex tw-items-center tw-mb-6">
                      <v-icon class="tw-mr-2" color="primary">mdi-account</v-icon>
                      <h4 class="tw-text-lg tw-font-bold tw-text-gray-900">Individual Documents</h4>
                    </div>

                  <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-5 tw-min-w-full">
                    <!-- Passport Upload -->
                    <div class="tw-mb-6">
                      <h5 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Passport (Valid) <span class="tw-text-red-500">*</span></h5>
                      <div v-if="kycData.documents.passport === ''" class="tw-relative">
                        <div
                          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-p-6 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-200"
                          :class="uploadStates.passport ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'"
                          @click="!uploadStates.passport && $refs.passportInput.click()"
                        >
                          <div v-if="uploadStates.passport" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                            <v-progress-circular indeterminate color="primary" class="tw-mb-3"></v-progress-circular>
                            <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                          </div>
                          <div v-else>
                            <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                            <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                            <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                          </div>
                        </div>
                        <input
                          ref="passportInput"
                          type="file"
                          @change="onUploadPassport"
                          :rules="fileRules"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style="display: none"
                        />
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-justify-between tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-xl tw-p-4">
                        <div class="tw-flex tw-items-center tw-flex-1 tw-min-w-0 tw-mr-3">
                          <v-icon color="green" class="tw-mr-2 tw-flex-shrink-0">mdi-file-pdf-box</v-icon>
                          <span
                            class="tw-text-sm tw-font-medium tw-truncate tw-cursor-pointer"
                            :title="getNameFromLink(kycData.documents.passport)"
                            @click="openDocument(kycData.documents.passport)"
                          >{{ getNameFromLink(kycData.documents.passport) }}</span>
                        </div>
                        <v-btn @click="kycData.documents.passport = ''" icon small color="error" class="tw-flex-shrink-0">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>

                    <!-- Emirates ID Upload -->
                    <div class="tw-mb-6">
                      <h5 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Emirates ID (For UAE residents)</h5>
                      <div v-if="kycData.documents.emirates_id === ''" class="tw-relative">
                        <div
                          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-p-6 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-200"
                          :class="uploadStates.emirates_id ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'"
                          @click="!uploadStates.emirates_id && $refs.emiratesIdInput.click()"
                        >
                          <div v-if="uploadStates.emirates_id" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                            <v-progress-circular indeterminate color="primary" class="tw-mb-3"></v-progress-circular>
                            <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                          </div>
                          <div v-else>
                            <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                            <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                            <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                          </div>
                        </div>
                        <input
                          ref="emiratesIdInput"
                          type="file"
                          @change="onUploadEmiratesId"
                          :rules="fileRules"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style="display: none"
                        />
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-justify-between tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-xl tw-p-4">
                        <div class="tw-flex tw-items-center tw-flex-1 tw-min-w-0 tw-mr-3">
                          <v-icon color="green" class="tw-mr-2 tw-flex-shrink-0">mdi-file-pdf-box</v-icon>
                          <span
                            class="tw-text-sm tw-font-medium tw-truncate tw-cursor-pointer"
                            :title="getNameFromLink(kycData.documents.emirates_id)"
                            @click="openDocument(kycData.documents.emirates_id)"
                          >{{ getNameFromLink(kycData.documents.emirates_id) }}</span>
                        </div>
                        <v-btn @click="kycData.documents.emirates_id = ''" icon small color="error" class="tw-flex-shrink-0">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>

                    <!-- National ID Upload -->
                    <div class="tw-mb-6">
                      <h5 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">National ID / Government-issued ID (For non-UAE residents)</h5>
                      <div v-if="kycData.documents.national_id === ''" class="tw-relative">
                        <div
                          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-p-6 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-200"
                          :class="uploadStates.national_id ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'"
                          @click="!uploadStates.national_id && $refs.nationalIdInput.click()"
                        >
                          <div v-if="uploadStates.national_id" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                            <v-progress-circular indeterminate color="primary" class="tw-mb-3"></v-progress-circular>
                            <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                          </div>
                          <div v-else>
                            <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                            <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                            <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                          </div>
                        </div>
                        <input
                          ref="nationalIdInput"
                          type="file"
                          @change="onUploadNationalId"
                          :rules="fileRules"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style="display: none"
                        />
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-justify-between tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-xl tw-p-4">
                        <div class="tw-flex tw-items-center tw-flex-1 tw-min-w-0 tw-mr-3">
                          <v-icon color="green" class="tw-mr-2 tw-flex-shrink-0">mdi-file-pdf-box</v-icon>
                          <span
                            class="tw-text-sm tw-font-medium tw-truncate tw-cursor-pointer"
                            :title="getNameFromLink(kycData.documents.national_id)"
                            @click="openDocument(kycData.documents.national_id)"
                          >{{ getNameFromLink(kycData.documents.national_id) }}</span>
                        </div>
                        <v-btn @click="kycData.documents.national_id = ''" icon small color="error" class="tw-flex-shrink-0">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                <!-- Company Documents -->
                <div v-if="kycData.clientType === 'company'" class="tw-space-y-6">
                  <div class="tw-bg-gray-50 tw-rounded-2xl tw-p-6">
                    <div class="tw-flex tw-items-center tw-mb-6">
                      <v-icon class="tw-mr-2" color="primary">mdi-domain</v-icon>
                      <h4 class="tw-text-lg tw-font-bold tw-text-gray-900">Company Documents</h4>
                    </div>

                   <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-5 tw-w-full">
                     <!-- Certificate of Incorporation Upload -->
                     <div class="tw-mb-6">
                      <h5 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Certificate of Incorporation / Trade License <span class="tw-text-red-500">*</span></h5>
                      <div v-if="kycData.documents.certificate_of_incorporation === ''" class="tw-relative">
                        <div
                          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-p-6 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-200"
                          :class="uploadStates.certificate_of_incorporation ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'"
                          @click="!uploadStates.certificate_of_incorporation && $refs.certificateInput.click()"
                        >
                          <div v-if="uploadStates.certificate_of_incorporation" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                            <v-progress-circular indeterminate color="primary" class="tw-mb-3"></v-progress-circular>
                            <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                          </div>
                          <div v-else>
                            <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                            <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                            <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                          </div>
                        </div>
                        <input
                          ref="certificateInput"
                          type="file"
                          @change="onUploadCertificate"
                          :rules="fileRules"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style="display: none"
                        />
                      </div>
                       <div v-else class="tw-flex tw-items-center tw-justify-between tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-xl tw-p-4">
                         <div class="tw-flex tw-items-center tw-flex-1 tw-min-w-0 tw-mr-3">
                           <v-icon color="green" class="tw-mr-2 tw-flex-shrink-0">mdi-file-pdf-box</v-icon>
                           <span
                             class="tw-text-sm tw-font-medium tw-truncate tw-cursor-pointer"
                             :title="getNameFromLink(kycData.documents.certificate_of_incorporation)"
                             @click="openDocument(kycData.documents.certificate_of_incorporation)"
                           >{{ getNameFromLink(kycData.documents.certificate_of_incorporation) }}</span>
                         </div>
                         <v-btn @click="kycData.documents.certificate_of_incorporation = ''" icon small color="error" class="tw-flex-shrink-0">
                           <v-icon>mdi-delete</v-icon>
                         </v-btn>
                       </div>
                    </div>

                    <!-- Memorandum & Articles Upload -->
                    <div class="tw-mb-6">
                      <h5 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Memorandum & Articles of Association</h5>
                      <div v-if="kycData.documents.memorandum_articles === ''" class="tw-relative">
                        <div
                          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-p-6 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-200"
                          :class="uploadStates.memorandum_articles ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'"
                          @click="!uploadStates.memorandum_articles && $refs.memorandumInput.click()"
                        >
                          <div v-if="uploadStates.memorandum_articles" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                            <v-progress-circular indeterminate color="primary" class="tw-mb-3"></v-progress-circular>
                            <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                          </div>
                          <div v-else>
                            <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                            <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                            <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                          </div>
                        </div>
                        <input
                          ref="memorandumInput"
                          type="file"
                          @change="onUploadMemorandum"
                          :rules="fileRules"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style="display: none"
                        />
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-justify-between tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-xl tw-p-4">
                        <div class="tw-flex tw-items-center tw-flex-1 tw-min-w-0 tw-mr-3">
                          <v-icon color="green" class="tw-mr-2 tw-flex-shrink-0">mdi-file-pdf-box</v-icon>
                          <span
                            class="tw-text-sm tw-font-medium tw-truncate tw-cursor-pointer"
                            :title="getNameFromLink(kycData.documents.memorandum_articles)"
                            @click="openDocument(kycData.documents.memorandum_articles)"
                          >{{ getNameFromLink(kycData.documents.memorandum_articles) }}</span>
                        </div>
                        <v-btn @click="kycData.documents.memorandum_articles = ''" icon small color="error" class="tw-flex-shrink-0">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>

                    <!-- VAT Certificate Upload -->
                    <div class="tw-mb-6">
                      <h5 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">VAT Registration Certificate / TIN</h5>
                      <div v-if="kycData.documents.vat_certificate === ''" class="tw-relative">
                        <div
                          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-p-6 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-200"
                          :class="uploadStates.vat_certificate ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'"
                          @click="!uploadStates.vat_certificate && $refs.vatInput.click()"
                        >
                          <div v-if="uploadStates.vat_certificate" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                            <v-progress-circular indeterminate color="primary" class="tw-mb-3"></v-progress-circular>
                            <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                          </div>
                          <div v-else>
                            <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                            <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                            <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                          </div>
                        </div>
                        <input
                          ref="vatInput"
                          type="file"
                          @change="onUploadVatCertificate"
                          :rules="fileRules"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style="display: none"
                        />
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-justify-between tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-xl tw-p-4">
                        <div class="tw-flex tw-items-center tw-flex-1 tw-min-w-0 tw-mr-3">
                          <v-icon color="green" class="tw-mr-2 tw-flex-shrink-0">mdi-file-pdf-box</v-icon>
                          <span
                            class="tw-text-sm tw-font-medium tw-truncate tw-cursor-pointer"
                            :title="getNameFromLink(kycData.documents.vat_certificate)"
                            @click="openDocument(kycData.documents.vat_certificate)"
                          >{{ getNameFromLink(kycData.documents.vat_certificate) }}</span>
                        </div>
                        <v-btn @click="kycData.documents.vat_certificate = ''" icon small color="error" class="tw-flex-shrink-0">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>

                    <!-- Authorized Signatory ID Upload -->
                    <div class="tw-mb-6">
                      <h5 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Authorized Signatory ID <span class="tw-text-red-500">*</span></h5>
                      <div v-if="kycData.documents.authorized_signatory_id === ''" class="tw-relative">
                        <div
                          class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-p-6 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-200"
                          :class="uploadStates.authorized_signatory_id ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'"
                          @click="!uploadStates.authorized_signatory_id && $refs.signatoryInput.click()"
                        >
                          <div v-if="uploadStates.authorized_signatory_id" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                            <v-progress-circular indeterminate color="primary" class="tw-mb-3"></v-progress-circular>
                            <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                          </div>
                          <div v-else>
                            <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                            <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                            <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                          </div>
                        </div>
                        <input
                          ref="signatoryInput"
                          type="file"
                          @change="onUploadSignatoryId"
                          :rules="fileRules"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style="display: none"
                        />
                      </div>
                      <div v-else class="tw-flex tw-items-center tw-justify-between tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-xl tw-p-4">
                        <div class="tw-flex tw-items-center tw-flex-1 tw-min-w-0 tw-mr-3">
                          <v-icon color="green" class="tw-mr-2 tw-flex-shrink-0">mdi-file-pdf-box</v-icon>
                          <span
                            class="tw-text-sm tw-font-medium tw-truncate tw-cursor-pointer"
                            :title="getNameFromLink(kycData.documents.authorized_signatory_id)"
                            @click="openDocument(kycData.documents.authorized_signatory_id)"
                          >{{ getNameFromLink(kycData.documents.authorized_signatory_id) }}</span>
                        </div>
                        <v-btn @click="kycData.documents.authorized_signatory_id = ''" icon small color="error" class="tw-flex-shrink-0">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                   </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 7: Compliance & Declarations -->
            <div v-if="currentStep === 7" class="tw-space-y-8">
              <div class="tw-mb-8">
                <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Compliance & Declarations</h3>
                <p class="tw-text-gray-600">Please complete the following declarations</p>
              </div>

              <div class="tw-bg-gray-50 tw-rounded-2xl tw-p-8">
                <h4 class="tw-text-lg tw-font-bold tw-text-gray-900 tw-mb-6">Politically Exposed Person (PEP) Status</h4>
                <v-radio-group v-model="kycData.pepStatus" class="tw-mt-4">
                  <v-radio
                    label="I confirm that I am not a Politically Exposed Person (PEP)."
                    value="not_pep"
                    color="blue"
                  />
                  <v-radio
                    label="I am a Politically Exposed Person (PEP) / Family Member / Close Associate of a PEP. (Provide details separately)"
                    value="pep"
                    color="blue"
                  />
                </v-radio-group>
              </div>
            </div>

            <!-- Step 8: Consent & Signatures -->
            <div v-if="currentStep === 8" class="tw-space-y-8">
              <div class="tw-mb-8">
                <h3 class="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-3">Consent & Acknowledgements</h3>
                <p class="tw-text-gray-600">Please read and agree to the following terms</p>
              </div>

              <div class="tw-bg-gray-50 tw-rounded-2xl tw-p-8">
                <div class="tw-space-y-6">
                  <v-checkbox
                    v-model="kycData.consent.dataProcessing"
                    label="I consent to the collection, processing, and secure storage of my data in accordance with UAE and international data protection regulations."
                    color="blue"
                  />
                  <v-checkbox
                    v-model="kycData.consent.regulatorySharing"
                    label="I acknowledge that my information may be shared with regulatory authorities where legally required."
                    color="blue"
                  />
                  <v-checkbox
                    v-model="kycData.consent.ongoingMonitoring"
                    label="I understand that KYC information is subject to ongoing monitoring and periodic updates, and I agree to provide updated information upon request."
                    color="blue"
                  />
                  <v-checkbox
                    v-model="kycData.consent.falseInformation"
                    label="I understand that providing false or misleading information may result in refusal of services or reporting to relevant authorities."
                    color="blue"
                  />
                </div>
              </div>

              <!-- Signature Section -->
              <div class="tw-mt-12 tw-pt-8 tw-border-t tw-border-gray-200">
                <div class="tw-mb-8">
                  <h4 class="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-3">Digital Signature</h4>
                  <p class="tw-text-gray-600">Please provide your signature below</p>
                </div>

                <div class="tw-space-y-8">
                  <!-- Signature Type Selection -->
                  <div>
                    <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-4">Signature Type</label>
                    <v-radio-group v-model="signatureType" row>
                      <v-radio label="Type Name" value="typed" color="blue"></v-radio>
                      <v-radio label="Draw Signature" value="drawn" color="blue"></v-radio>
                    </v-radio-group>
                  </div>

                  <!-- Typed Signature -->
                  <div v-if="signatureType === 'typed'" class="tw-bg-gray-50 tw-rounded-2xl tw-p-8">
                    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6 tw-mb-6">
                      <div>
                        <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                          Full Name <span class="tw-text-red-500">*</span>
                        </label>
                        <v-text-field
                          v-model="kycData.signature.fullName"
                          :rules="[v => !!v || 'Full name is required']"
                          outlined
                          dense
                          class="tw-rounded-xl"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div v-if="kycData.clientType === 'company'">
                        <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                          Designation (for Company) <span class="tw-text-red-500">*</span>
                        </label>
                        <v-text-field
                          v-model="kycData.signature.designation"
                          :rules="[v => !!v || 'Designation is required']"
                          outlined
                          dense
                          class="tw-rounded-xl"
                          placeholder="Enter designation"
                        />
                      </div>
                    </div>

                    <div v-if="kycData.signature.fullName" class="tw-text-center tw-mt-6">
                      <div class="tw-bg-blue-100 tw-text-blue-800 tw-px-8 tw-py-4 tw-rounded-xl tw-text-xl tw-font-bold tw-inline-block tw-border-2 tw-border-blue-200">
                        {{ kycData.signature.fullName }}
                      </div>
                      <p class="tw-text-sm tw-text-gray-600 tw-mt-3">This will be your digital signature</p>
                    </div>
                  </div>

                  <!-- Drawn Signature -->
                  <div v-if="signatureType === 'drawn'" class="tw-bg-gray-50 tw-rounded-2xl tw-p-8">
                    <div class="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-h-64 tw-relative tw-mb-6">
                      <canvas
                        ref="signatureCanvas"
                        @mousedown="startDrawing"
                        @mousemove="draw"
                        @mouseup="stopDrawing"
                        @touchstart="startDrawing"
                        @touchmove="draw"
                        @touchend="stopDrawing"
                        class="tw-w-full tw-h-full tw-cursor-crosshair tw-rounded-xl"
                      ></canvas>

                      <div v-if="!hasSignature" class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-text-gray-400 tw-pointer-events-none">
                        <div class="tw-text-center">
                          <v-icon size="64" color="grey">mdi-pencil</v-icon>
                          <p class="tw-mt-3 tw-text-lg">Sign here</p>
                        </div>
                      </div>
                    </div>

                    <div class="tw-flex tw-space-x-4">
                      <v-btn @click="clearSignature" outlined class="tw-rounded-xl tw-px-6">
                        <v-icon left>mdi-refresh</v-icon>
                        Clear
                      </v-btn>
                      <v-btn @click="saveSignature" color="primary" class="tw-rounded-xl tw-px-6">
                        <v-icon left>mdi-check</v-icon>
                        Save Signature
                      </v-btn>
                    </div>
                  </div>

                  <!-- Signature Details -->
                  <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                    <div>
                      <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                        Date <span class="tw-text-red-500">*</span>
                      </label>
                      <v-text-field
                        v-model="kycData.signature.date"
                        :rules="[v => !!v || 'Date is required']"
                        type="date"
                        outlined
                        dense
                        class="tw-rounded-xl"
                      />
                    </div>

                    <div>
                      <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                        Place <span class="tw-text-red-500">*</span>
                      </label>
                      <v-text-field
                        v-model="kycData.signature.place"
                        :rules="[v => !!v || 'Place is required']"
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

          </v-form>
        </div>

        <!-- Card Footer -->
        <div class="tw-bg-gray-50 tw-px-8 tw-py-6 tw-border-t tw-border-gray-200 tw-flex tw-justify-between tw-items-center">
          <v-btn
            v-if="currentStep > 1"
            @click="previousStep"
            outlined
            large
            class="tw-rounded-xl tw-px-8"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Previous
          </v-btn>
          <div v-else></div>

          <v-btn
            @click="nextStep"
            color="primary"
            large
            :loading="isSubmitting"
            :disabled="!canProceed"
            class="tw-rounded-xl tw-px-12 tw-py-3 tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-600 tw-shadow-lg"
          >
            <span v-if="currentStep < totalSteps" class="tw-font-semibold">Next</span>
            <span v-else class="tw-font-semibold">Submit KYC Form</span>
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Initials Modal -->
    <v-dialog v-model="showInitialsModal" max-width="600">
      <v-card class="tw-rounded-2xl tw-overflow-hidden">
        <v-card-title class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-700 tw-text-white tw-text-xl tw-font-bold tw-pb-4">
          Set Initials for {{ currentBoardMember?.name }}
        </v-card-title>
        <v-card-text class="tw-p-8">
          <div class="tw-space-y-6">
            <p class="tw-text-gray-600 tw-leading-relaxed">
              Please enter the initials that will serve as the digital signature for this signatory.
            </p>

            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">
                Initials <span class="tw-text-red-500">*</span>
              </label>
              <v-text-field
                v-model="tempInitials"
                placeholder="e.g., SC for Spencer Cecil"
                outlined
                dense
                :rules="[v => !!v || 'Initials are required', v => v.length <= 5 || 'Maximum 5 characters']"
                class="tw-rounded-xl"
                maxlength="5"
              />
            </div>

            <div v-if="tempInitials" class="tw-bg-gray-50 tw-p-6 tw-rounded-xl">
              <p class="tw-text-sm tw-text-gray-600 tw-mb-3 tw-font-semibold">Preview:</p>
              <div class="tw-bg-blue-100 tw-text-blue-800 tw-px-6 tw-py-3 tw-rounded-xl tw-text-xl tw-font-bold tw-inline-block tw-border-2 tw-border-blue-200">
                {{ tempInitials.toUpperCase() }}
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="tw-px-8 tw-pb-8">
          <v-btn @click="showInitialsModal = false" outlined class="tw-rounded-xl tw-px-6">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveInitials"
            :disabled="!tempInitials"
            class="tw-rounded-xl tw-px-8 tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-600"
          >
            Save Initials
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import countries from 'countries-list'

export default {
  layout: 'login',
  data() {
    return {
      loading: true,
      isSubmitting: false,
      submitSuccess: false,
      globalError: null,
      validationErrors: [],
      formValid: false,

      // Form state
      currentStep: 1,
      totalSteps: 8,
      leadId: null,

      // KYC Data
      kycData: {
        // Client Type
        clientType: 'individual', // 'individual' | 'company'

        // Basic Information
        fullName: '',
        tradingName: '',
        nationality: '',
        dateOfBirth: null,
        placeOfBirth: '',

        // Addresses
        residentialAddress: {
          city: '',
          country: '',
          postalCode: ''
        },
        mailingAddress: {
          city: '',
          country: '',
          postalCode: ''
        },

        // Contact Information
        email: '',
        phone: '',
        mobile: '',
        website: '',

        // Individual-specific
        gender: '', // if clientType === 'individual'

        // Company-specific
        ultimateBeneficialOwners: [],

        // Board of Directors / Authorized Signatories
        boardMembers: [],

        // Financial Information
        financialInfo: {
          natureOfBusiness: '',
          expectedTurnover: '',
          currency: '',
          bankName: '',
          branch: '',
          accountNumber: '',
          iban: ''
        },

        // Supporting Documents
        supportingDocuments: {
          individual: [], // array of document types
          company: []    // array of document types
        },

        // Documents - actual uploaded files
        documents: {
          passport: '',
          emirates_id: '',
          national_id: '',
          certificate_of_incorporation: '',
          memorandum_articles: '',
          vat_certificate: '',
          authorized_signatory_id: ''
        },

        // Compliance
        pepStatus: '', // 'not_pep' | 'pep' | 'pep_family'

        // Consent & Signatures
        consent: {
          dataProcessing: false,
          regulatorySharing: false,
          ongoingMonitoring: false,
          falseInformation: false
        },

        signature: {
          signature: '', // base64 or file path
          fullName: '',
          designation: '', // only for companies
          date: null,
          place: '',
          signatureType: 'typed' // 'typed' | 'drawn'
        },

        // Metadata
        submittedAt: null,
        isComplete: false
      },

      // Initials handling
      showInitialsModal: false,
      currentBoardMember: null,
      tempInitials: '',

      // Signature handling
      signatureType: 'typed',
      hasSignature: false,

      // File upload
      uploadedFiles: [],
      uploadingFiles: false,

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
      selectedPhoneCode: '',
      selectedMobileCode: '',

      // Currency data
      currencies: [
        'AED', 'USD', 'EUR', 'GBP', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP',
        'CAD', 'AUD', 'CHF', 'JPY', 'CNY', 'INR', 'PKR', 'BDT', 'LKR', 'NPR', 'PHP', 'THB',
        'SGD', 'MYR', 'IDR', 'VND', 'KRW', 'TWD', 'HKD', 'NZD', 'ZAR', 'BRL', 'MXN', 'ARS',
        'CLP', 'COP', 'PEN', 'UYU', 'TRY', 'RUB', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK',
        'SEK', 'NOK', 'DKK', 'ISK', 'RUB', 'UAH', 'BYN', 'KZT', 'UZS', 'KGS', 'TJS', 'TMT',
        'AFN', 'IRR', 'IQD', 'SYP', 'YER', 'ILS', 'JOD', 'LBP', 'EGP', 'LYD', 'TND', 'DZD',
        'MAD', 'MUR', 'SCR', 'KES', 'UGX', 'TZS', 'ETB', 'NGN', 'GHS', 'XOF', 'XAF', 'ZAR'
      ],

      // Upload states
      uploadingFile: null,
      uploadingFileType: '',
      uploadStates: {
        passport: false,
        emirates_id: false,
        national_id: false,
        certificate_of_incorporation: false,
        memorandum_articles: false,
        vat_certificate: false,
        authorized_signatory_id: false
      },

      // File validation rules
      fileRules: [
        (v) => !!v || 'File is required',
        (v) => (v && v.size > 0) || 'File is required',
        (v) => !v || v.size < 10 * 1024 * 1024 || 'File size should be less than 10 MB'
      ]
    }
  },

  computed: {
    progressPercentage() {
      return (this.currentStep / this.totalSteps) * 100
    },

    currentSectionTitle() {
      const titles = {
        1: 'Client Type Selection',
        2: 'Basic Information',
        3: 'Ultimate Beneficial Owners',
        4: 'Board of Directors',
        5: 'Financial Information',
        6: 'Supporting Documents',
        7: 'Compliance & Declarations',
        8: 'Consent & Signatures'
      }
      return titles[this.currentStep] || 'KYC Form'
    },

    currentSectionDescription() {
      const descriptions = {
        1: 'Select the type of client you are',
        2: 'Provide your basic personal or company information',
        3: this.kycData.clientType === 'company' ? 'Add details of all Ultimate Beneficial Owners' : 'This step is skipped for individual clients',
        4: this.kycData.clientType === 'company' ? 'Add authorized signatories and their details' : 'This step is skipped for individual clients',
        5: 'Provide financial and banking information',
        6: 'Select and upload required documents',
        7: 'Complete compliance declarations',
        8: 'Review and sign the form'
      }
      return descriptions[this.currentStep] || 'Complete the required information'
    },

    canProceed() {
      switch (this.currentStep) {
        case 1:
          return !!this.kycData.clientType
        case 2:
          return this.validateStep2()
        case 3:
          return this.kycData.clientType === 'company' ? this.validateStep3() : true
        case 4:
          return this.kycData.clientType === 'company' ? this.validateStep4() : true
        case 5:
          return this.validateStep5()
        case 6:
          return this.validateStep6()
        case 7:
          return this.validateStep7()
        case 8:
          return this.validateStep8()
        default:
          return false
      }
    },

    hasUBOValidationErrors() {
      return this.kycData.ultimateBeneficialOwners.some(ubo => ubo.ownershipError)
    }
  },

  methods: {
    async initializeForm() {
      try {
        this.loading = true

        // Get lead ID from URL (support both 'leadId' and 'id' parameters)
        this.leadId = this.$route.query.leadId || this.$route.query.id

        if (!this.leadId) {
          this.globalError = 'Lead ID is required'
          return
        }

        // Fetch existing KYC data
        const response = await this.$axios.get(`/enrollments/${this.leadId}`)

        if (response.data.kycDetails) {
          // Merge existing data
          Object.assign(this.kycData, response.data.kycDetails)

          // Initialize arrays if they don't exist
          if (!this.kycData.ultimateBeneficialOwners) {
            this.kycData.ultimateBeneficialOwners = []
          }
          if (!this.kycData.boardMembers) {
            this.kycData.boardMembers = []
          }
          if (!this.kycData.supportingDocuments) {
            this.kycData.supportingDocuments = { individual: [], company: [] }
          }
          if (!this.kycData.consent) {
            this.kycData.consent = {
              dataProcessing: false,
              regulatorySharing: false,
              ongoingMonitoring: false,
              falseInformation: false
            }
          }
          if (!this.kycData.signature) {
            this.kycData.signature = {
              signature: '',
              fullName: '',
              designation: '',
              date: null,
              place: '',
              signatureType: 'typed'
            }
          }
        } else {
          // Initialize with default values
          this.initializeDefaultData()
        }
      } catch (error) {
        console.error('Error fetching KYC data:', error)
        this.globalError = 'Error loading KYC form. Please try again.'
      } finally {
        this.loading = false
      }
    },

    initializeDefaultData() {
      // Initialize UBO with one empty row
      this.kycData.ultimateBeneficialOwners = [{
        name: '',
        nationality: '',
        idNumber: '',
        ownershipPercentage: '',
        position: ''
      }]

      // Initialize board members with one empty row
      this.kycData.boardMembers = [{
        name: '',
        nationality: '',
        idNumber: '',
        position: '',
        initials: ''
      }]
    },

    selectClientType(type) {
      this.kycData.clientType = type
      this.$nextTick(() => {
        this.$refs.kycForm.validate()
      })
    },

    nextStep() {
      if (this.canProceed) {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++
          // Skip company-specific steps for individual clients
          while (
            this.kycData.clientType === 'individual' &&
            (this.currentStep === 3 || this.currentStep === 4) &&
            this.currentStep < this.totalSteps
          ) {
            this.currentStep++
          }
        } else {
          this.submitForm()
        }
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
        // Skip company-specific steps for individual clients when going back
        while (
          this.kycData.clientType === 'individual' &&
          (this.currentStep === 3 || this.currentStep === 4) &&
          this.currentStep > 1
        ) {
          this.currentStep--
        }
      }
    },

    async submitForm() {
      try {
        this.isSubmitting = true

        // Validate all steps
        this.validationErrors = []
        if (!this.validateAllSteps()) {
          this.currentStep = 1 // Go back to first step with errors
          return
        }

        // Mark as complete
        this.kycData.isComplete = true
        this.kycData.submittedAt = new Date()

        // Format phone numbers with country codes
        this.formatPhoneNumbers()

        // Prepare submission data - remove supportingDocuments as we're using documents object
        const submitData = {
          ...this.kycData,
          supportingDocuments: undefined
        }

        // Submit to backend
        await this.$axios.post(`/kyc-enrollments/${this.leadId}/submit`, submitData)

        // Redirect to success page
        this.$router.push('/kyc-enrollment/success')
      } catch (error) {
        console.error('Error submitting form:', error)
        this.globalError = 'Error submitting form. Please try again.'
      } finally {
        this.isSubmitting = false
      }
    },

    validateAllSteps() {
      const errors = []

      if (!this.validateStep1()) errors.push('Please select a client type')
      if (!this.validateStep2()) errors.push('Please complete basic information')
      if (this.kycData.clientType === 'company' && !this.validateStep3()) errors.push('Please complete UBO information')
      if (this.kycData.clientType === 'company' && !this.validateStep4()) errors.push('Please complete board members information')
      if (!this.validateStep5()) errors.push('Please complete financial information')
      if (!this.validateStep6()) errors.push('Please complete document information')
      if (!this.validateStep7()) errors.push('Please complete compliance declarations')
      if (!this.validateStep8()) errors.push('Please complete consent and signature')

      this.validationErrors = errors
      return errors.length === 0
    },

    validateStep1() {
      return !!this.kycData.clientType
    },

    validateStep2() {
      return !!(
        this.kycData.fullName &&
        this.kycData.nationality &&
        this.kycData.dateOfBirth &&
        this.kycData.placeOfBirth &&
        this.kycData.residentialAddress.city &&
        this.kycData.residentialAddress.country &&
        this.kycData.residentialAddress.postalCode &&
        this.kycData.email &&
        this.kycData.phone &&
        (this.kycData.clientType === 'individual' ? this.kycData.gender : true)
      )
    },

    validateStep3() {
      return this.kycData.ultimateBeneficialOwners.length > 0 &&
        this.kycData.ultimateBeneficialOwners.every(ubo =>
          ubo.name &&
          ubo.nationality &&
          ubo.idNumber &&
          ubo.ownershipPercentage &&
          ubo.position &&
          !ubo.ownershipError
        )
    },

    validateStep4() {
      return this.kycData.boardMembers.length > 0 &&
        this.kycData.boardMembers.every(member =>
          member.name && member.nationality && member.idNumber && member.position && member.initials
        )
    },

    validateStep5() {
      return !!(
        this.kycData.financialInfo.natureOfBusiness &&
        this.kycData.financialInfo.expectedTurnover &&
        this.kycData.financialInfo.bankName &&
        this.kycData.financialInfo.branch &&
        this.kycData.financialInfo.accountNumber
      )
    },

    validateStep6() {
      if (this.kycData.clientType === 'individual') {
        return !!this.kycData.documents.passport
      } else {
        return !!this.kycData.documents.certificate_of_incorporation &&
               !!this.kycData.documents.authorized_signatory_id
      }
    },

    validateStep7() {
      return !!this.kycData.pepStatus
    },

    validateStep8() {
      return !!(
        this.kycData.consent.dataProcessing &&
        this.kycData.consent.regulatorySharing &&
        this.kycData.consent.ongoingMonitoring &&
        this.kycData.consent.falseInformation &&
        this.kycData.signature.fullName &&
        this.kycData.signature.date &&
        this.kycData.signature.place
      )
    },

    // UBO Management
    addUBORow() {
      this.kycData.ultimateBeneficialOwners.push({
        name: '',
        nationality: '',
        idNumber: '',
        ownershipPercentage: '',
        position: ''
      })
    },

    removeUBORow(index) {
      if (this.kycData.ultimateBeneficialOwners.length > 1) {
        this.kycData.ultimateBeneficialOwners.splice(index, 1)
      }
    },

    // Board Members Management
    addBoardMemberRow() {
      this.kycData.boardMembers.push({
        name: '',
        nationality: '',
        idNumber: '',
        position: '',
        initials: ''
      })
    },

    removeBoardMemberRow(index) {
      if (this.kycData.boardMembers.length > 1) {
        this.kycData.boardMembers.splice(index, 1)
      }
    },

    // Initials handling
    openInitialsModal(index) {
      this.currentBoardMember = this.kycData.boardMembers[index]
      this.tempInitials = this.currentBoardMember.initials || ''
      this.showInitialsModal = true
    },

    saveInitials() {
      if (this.currentBoardMember && this.tempInitials) {
        this.currentBoardMember.initials = this.tempInitials.toUpperCase()
        this.showInitialsModal = false
        this.tempInitials = ''
      }
    },

    // Signature handling methods
    startDrawing(e) {
      this.isDrawing = true
      const canvas = this.$refs.signatureCanvas
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')

      ctx.beginPath()
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    },

    draw(e) {
      if (!this.isDrawing) return

      const canvas = this.$refs.signatureCanvas
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')

      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
      ctx.stroke()
    },

    stopDrawing() {
      this.isDrawing = false
      this.hasSignature = true
    },

    clearSignature() {
      const canvas = this.$refs.signatureCanvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.hasSignature = false
    },

    saveSignature() {
      if (this.signatureType === 'drawn') {
        const canvas = this.$refs.signatureCanvas
        this.kycData.signature.signature = canvas.toDataURL()
        this.kycData.signature.signatureType = 'drawn'
      } else {
        this.kycData.signature.signatureType = 'typed'
      }
    },

    // File upload handling
    async handleFileUpload(files) {
      if (!files || files.length === 0) return

      try {
        this.uploadingFiles = true
        const formData = new FormData()

        for (let file of files) {
          formData.append('files', file)
        }

        const response = await this.$axios.post(`/kyc-enrollments/${this.leadId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.uploadedFiles = []
        // Handle successful upload
        console.log('Files uploaded successfully:', response.data)
      } catch (error) {
        console.error('Error uploading files:', error)
        this.globalError = 'Error uploading files. Please try again.'
      } finally {
        this.uploadingFiles = false
      }
    },

    downloadReceipt() {
      // Implement receipt download functionality
      console.log('Download receipt')
    },

    // Format phone numbers with country codes
    formatPhoneNumbers() {
      if (this.selectedPhoneCode && this.kycData.phone) {
        this.kycData.phone = `+${this.selectedPhoneCode}${this.kycData.phone}`
      }
      if (this.selectedMobileCode && this.kycData.mobile) {
        this.kycData.mobile = `+${this.selectedMobileCode}${this.kycData.mobile}`
      }
    },

    // Validate ownership percentage
    validateOwnershipPercentage(row, index) {
      const percentage = parseFloat(row.ownershipPercentage)

      if (isNaN(percentage)) {
        row.ownershipError = 'Please enter a valid number'
        return false
      }

      if (percentage < 0 || percentage > 100) {
        row.ownershipError = 'Percentage must be between 0 and 100'
        return false
      }

      if (percentage < 25) {
        row.ownershipError = 'UBO must own 25% or more of the company'
        return false
      }

      row.ownershipError = null
      return true
    },

    // Document upload methods
    onUploadPassport(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'passport'
      this.uploadStates.passport = true
      this.uploadFile()
    },

    onUploadEmiratesId(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'emirates_id'
      this.uploadStates.emirates_id = true
      this.uploadFile()
    },

    onUploadNationalId(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'national_id'
      this.uploadStates.national_id = true
      this.uploadFile()
    },

    onUploadCertificate(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'certificate_of_incorporation'
      this.uploadStates.certificate_of_incorporation = true
      this.uploadFile()
    },

    onUploadMemorandum(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'memorandum_articles'
      this.uploadStates.memorandum_articles = true
      this.uploadFile()
    },

    onUploadVatCertificate(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'vat_certificate'
      this.uploadStates.vat_certificate = true
      this.uploadFile()
    },

    onUploadSignatoryId(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'authorized_signatory_id'
      this.uploadStates.authorized_signatory_id = true
      this.uploadFile()
    },

    uploadFile() {
      const formData = new FormData()
      for (let i = 0; i < this.uploadingFile.length; i++) {
        formData.append(
          'documents',
          this.uploadingFile[i],
          this.uploadingFile[i].name
        )
      }
      let id = this.$route.query.leadId || this.$route.query.id
      this.$axios
        .post(`/enrollments/upload/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          let link = response.data[0]
          if (this.uploadingFileType === 'passport') {
            this.kycData.documents.passport = link
            this.uploadStates.passport = false
          } else if (this.uploadingFileType === 'emirates_id') {
            this.kycData.documents.emirates_id = link
            this.uploadStates.emirates_id = false
          } else if (this.uploadingFileType === 'national_id') {
            this.kycData.documents.national_id = link
            this.uploadStates.national_id = false
          } else if (this.uploadingFileType === 'certificate_of_incorporation') {
            this.kycData.documents.certificate_of_incorporation = link
            this.uploadStates.certificate_of_incorporation = false
          } else if (this.uploadingFileType === 'memorandum_articles') {
            this.kycData.documents.memorandum_articles = link
            this.uploadStates.memorandum_articles = false
          } else if (this.uploadingFileType === 'vat_certificate') {
            this.kycData.documents.vat_certificate = link
            this.uploadStates.vat_certificate = false
          } else if (this.uploadingFileType === 'authorized_signatory_id') {
            this.kycData.documents.authorized_signatory_id = link
            this.uploadStates.authorized_signatory_id = false
          }
        })
        .catch((error) => {
          console.error('Upload error:', error)
          this.$toast.error('Failed to upload document. Please try again.')

          // Reset upload state
          if (this.uploadingFileType === 'passport') {
            this.uploadStates.passport = false
          } else if (this.uploadingFileType === 'emirates_id') {
            this.uploadStates.emirates_id = false
          } else if (this.uploadingFileType === 'national_id') {
            this.uploadStates.national_id = false
          } else if (this.uploadingFileType === 'certificate_of_incorporation') {
            this.uploadStates.certificate_of_incorporation = false
          } else if (this.uploadingFileType === 'memorandum_articles') {
            this.uploadStates.memorandum_articles = false
          } else if (this.uploadingFileType === 'vat_certificate') {
            this.uploadStates.vat_certificate = false
          } else if (this.uploadingFileType === 'authorized_signatory_id') {
            this.uploadStates.authorized_signatory_id = false
          }
        })
    },

    openDocument(url) {
      if (url) {
        window.open(url, '_blank')
      }
    },

    getNameFromLink(link) {
      if (!link) return ''
      const parts = link.split('/')
      return parts[parts.length - 1] || 'Document'
    }
  },

  async mounted() {
    await this.initializeForm()
  }
}
</script>

<style scoped>
/* Minimal custom styles - most styling handled by Tailwind */
.v-input__slot {
  border-radius: 12px !important;
}

.card-background {
  background-color: #fdfaf5
}

.v-btn {
  border-radius: 12px !important;
}

.v-card {
  border-radius: 16px !important;
}

.v-alert {
  border-radius: 12px !important;
}

.v-text-field__details {
  padding-left: 16px !important;
  padding-right: 16px !important;
}
</style>
