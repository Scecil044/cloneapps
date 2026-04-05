<template>
  <div
    class="login_wrapper"
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #ececec;
      min-width: 100vw;
      min-height: 100vh;
    "
  >
    <div
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 55vw;
        height: 90vh;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 24px 30px #959ea51a !important;
      "
      v-if="loading"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else>
      <div v-if="submitSuccess">
        <div class="thank-you-container">
          <img
            src="/client/image.png"
            height="40"
            style="height: 70%; width: 75%"
            alt="Thank You"
            class="thank-you-image"
          />
          <h1>Thank You for Completing Your Setup!!</h1>
          <p>What happens next?</p>
          <p>
            Our team will now review your company details and once approved, you
            can begin onboarding with us.
          </p>
        </div>
      </div>
      <div
        v-else-if="enrollmentDetails.is_editable"
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          width: 55vw;
          height: 90vh;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0px 24px 30px #959ea51a !important;
        "
      >
        <v-alert v-if="submitError" type="error" class="mb-4">
          {{ submitError }}
        </v-alert>
        <div v-if="submitting" style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%; background: rgba(255,255,255,0.7); position: absolute; z-index: 10;">
          <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
          <span style="margin-left: 16px; font-size: 1.2rem; color: #333;">Submitting your enrollment...</span>
        </div>
        <div
          style="
            display: flex;
            width: 100%;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
          "
        >
          <h3>Add Company Details</h3>
        </div>
        <div
          v-if="count == 1"
          style="
            width: 100%;
            padding: 20px;
            height: 85%;
            justify-content: center;
            align-items: baseline;
          "
        >
          <v-container
            fluid
            class="scroll"
            v-if="enrollmentDetails.is_editable"
            style="max-height: 68vh"
          >
            <v-form
              ref="stepOneValid"
              v-model="form.stepOneValid"
              lazy-validation
            >
              <v-row class="scrollDark">
                <v-col
                  cols="12"
                  style="display: flex; justify-content: center"
                  class="ma-0 pa-0"
                >
                  <span class="mb-3">Company Details</span>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="Company Name">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.company_name"
                        placeholder="Company Name"
                        dense
                        :rules="validation.companyName"
                        required
                        outlined
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="Legal Name">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.legal_name"
                        placeholder="Legal Name"
                        outlined
                        :rules="validation.LegalName"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="Company Address">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.company_address"
                        placeholder="Company Address"
                        outlined
                        :rules="validation.address('Company Address')"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="Industry">
                    <div slot="input">
                      <v-select
                        v-model="enrollmentDetails.business_industry"
                        placeholder="Select Industry"
                        outlined
                        :items="industries"
                        item-text="industry_name"
                        :rules="validation.Industry"
                        required
                        dense
                      ></v-select>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="Registration Number">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.registration_number"
                        placeholder="Registration Number"
                        :rules="validation.RegistrationNumber"
                        required
                        outlined
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="GRN Number">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.GRN_number"
                        placeholder="GRN Number"
                        outlined
                        :rules="validation.GRN_number"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="TRN Number">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.trn_number"
                        placeholder="TRN Number"
                        outlined
                        :rules="validation.TRN_number"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6" class="mb-0 pb-0">
                  <CustomInputContainer label="Company Email Address">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.email"
                        placeholder="Company Email Address"
                        outlined
                        :rules="validation.email('Company Email')"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="mb-0 pb-0">
                  <CustomInputContainer label="Phone Number">
                    <div slot="input" class="d-flex">
                      <v-select
                        class="mr-2"
                        style="width: 120px"
                        v-model="selectedCountry.phone_number"
                        :items="countries"
                        item-text="name"
                        item-value="phone"
                        outlined
                        dense
                        required
                        :rules="validation.selectField('Country Code')"
                      ></v-select>
                      <v-text-field
                        v-model="enrollmentDetails.phone_number"
                        placeholder="Phone Number"
                        outlined
                        :rules="validation.phoneNumber"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="12" md="6">
                  <CustomInputContainer label="Country">
                    <div slot="input">
                      <v-select
                        :items="countryList"
                        placeholder="Country"
                        outlined
                        dense
                        :rules="validation.selectField('Country')"
                        required
                        v-model="enrollmentDetails.country"
                      >
                      </v-select>
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <v-row v-else>
            <v-col cols="12" style="display: flex; justify-content: center">
              <span class="mb-3">Company Details</span>
            </v-col>
            <v-col sm="6" md="6" lg="6">
              <div class="text-left">
                <span class="caption subtext--text">Customer Name</span>
              </div>
            </v-col>
            <v-col sm="6" md="6" lg="6">
              <div class="text-left">
                <h6 class="text--text">{{ enrollmentDetails.company_name }}</h6>
              </div>
            </v-col>
          </v-row>
        </div>
        <div
          v-if="count == 2"
          style="
            width: 100%;
            padding: 20px;
            height: 85%;
            justify-content: center;
            align-items: baseline;
          "
        >
          <v-container
            fluid
            class="scroll"
            style="max-height: 68vh"
            v-if="enrollmentDetails.is_editable"
          >
            <v-form
              ref="stepTwoValid"
              v-model="form.stepTwoValid"
              lazy-validation
            >
              <v-row class="scrollDark">
                <v-col
                  cols="12"
                  style="display: flex; justify-content: start"
                  class="ma-0 pa-0 pr-2"
                >
                  <span class="mb-3">Billing Address</span>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Address Line 1">
                    <div slot="input">
                      <v-text-field
                        v-model="billing_address.address_line1"
                        placeholder="Address Line 1"
                        outlined
                        dense
                        :rules="validation.address('Address Line 1')"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Address Line 2">
                    <div slot="input">
                      <v-text-field
                        v-model="billing_address.address_line2"
                        placeholder="Address Line 2"
                        outlined
                        dense
                        :rules="validation.address('Address Line 2')"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="City">
                    <div slot="input">
                      <v-text-field
                        v-model="billing_address.city"
                        placeholder="City"
                        outlined
                        dense
                        :rules="validation.custom('City')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="State">
                    <div slot="input">
                      <v-text-field
                        v-model="billing_address.state"
                        placeholder="State"
                        outlined
                        dense
                        :rules="validation.address('Billing Address')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Zip">
                    <div slot="input">
                      <v-text-field
                        v-model="billing_address.zip"
                        placeholder="Zip"
                        outlined
                        dense
                        :rules="validation.custom('Zip')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Phone">
                    <div slot="input" class="d-flex">
                      <v-select
                        class="mr-2"
                        style="width: 120px"
                        v-model="selectedCountry.billing_phone"
                        :items="countries"
                        item-text="name"
                        item-value="phone"
                        outlined
                        dense
                        required
                        :rules="validation.selectField('Country Code')"
                      ></v-select>
                      <v-text-field
                        v-model="billing_address.phone"
                        placeholder="Phone"
                        outlined
                        :rules="validation.phoneNumber"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Email">
                    <div slot="input">
                      <v-text-field
                        v-model="billing_address.email"
                        placeholder="Email"
                        outlined
                        dense
                        :rules="validation.email('Email')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col
                  cols="8"
                  style="display: flex; justify-content: start"
                  class="ma-0 pa-0"
                >
                  <span class="mb-3">Shipping Address</span>
                </v-col>
                <v-col
                  cols="4"
                  style="
                    display: flex;
                    justify-content: start;
                    align-items: center;
                  "
                  class="ma-0 pa-0"
                >
                  <span class="mb-3 mr-2">Same as Billing Address</span>
                  <v-checkbox
                    v-model="sameAsBilling"
                    @change="changeSameAs()"
                  ></v-checkbox>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Address Line 1">
                    <div slot="input">
                      <v-text-field
                        v-model="shipping_address.address_line1"
                        placeholder="Address Line 1"
                        outlined
                        dense
                        :rules="validation.address('Address Line 1')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Address Line 2">
                    <div slot="input">
                      <v-text-field
                        v-model="shipping_address.address_line2"
                        placeholder="Address Line 2"
                        outlined
                        :rules="validation.address('Address Line 2')"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="City">
                    <div slot="input">
                      <v-text-field
                        v-model="shipping_address.city"
                        placeholder="City"
                        outlined
                        dense
                        :rules="validation.custom('City')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="State">
                    <div slot="input">
                      <v-text-field
                        v-model="shipping_address.state"
                        placeholder="State"
                        outlined
                        dense
                        :rules="validation.custom('State')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Zip">
                    <div slot="input">
                      <v-text-field
                        v-model="shipping_address.zip"
                        placeholder="Zip"
                        outlined
                        dense
                        :rules="validation.custom('Zip')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Phone">
                    <div slot="input" class="d-flex">
                      <v-select
                        class="mr-2"
                        style="width: 120px"
                        v-model="selectedCountry.shipping_phone"
                        :items="countries"
                        item-text="name"
                        item-value="phone"
                        outlined
                        dense
                        required
                        :rules="validation.selectField('Country Code')"
                      ></v-select>
                      <v-text-field
                        v-model="shipping_address.phone"
                        placeholder="Phone"
                        outlined
                        :rules="validation.phoneNumber"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Special Instructions">
                    <div slot="input">
                      <v-text-field
                        v-model="shipping_address.special_instructions"
                        placeholder="Special Instructions"
                        outlined
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <v-row v-else>
            <v-col cols="12" style="display: flex; justify-content: center">
              <span class="mb-3">Company Address</span>
            </v-col>
            <v-col sm="6" md="6" lg="6">
              <div class="text-left">
                <span class="caption subtext--text">Customer Name</span>
              </div>
            </v-col>
            <v-col sm="6" md="6" lg="6">
              <div class="text-left">
                <h6 class="text--text">{{ enrollmentDetails.company_name }}</h6>
              </div>
            </v-col>
          </v-row>
        </div>
        <div
          v-if="count == 3"
          style="
            width: 100%;
            padding: 20px;
            height: 85%;
            justify-content: center;
            align-items: baseline;
          "
        >
          <v-container
            fluid
            class="scroll"
            style="max-height: 68vh"
            v-if="enrollmentDetails.is_editable"
          >
            <v-form
              ref="stepThreeValid"
              v-model="form.stepThreeValid"
              lazy-validation
            >
              <v-row class="scrollDark">
                <v-col
                  cols="12"
                  style="display: flex; justify-content: center"
                  class="ma-0 pa-0 pr-2"
                >
                  <v-banner
                    color="#f9dafb"
                    icon="fa-info"
                    rounded
                    shaped
                    sticky
                    tile
                    style="width: 100%"
                  >
                    The more information you are able to provide about your
                    business, the easier will be able to fully verify your
                    account
                  </v-banner>
                </v-col>
                <v-col
                  cols="12"
                  style="display: flex; justify-content: center"
                  class="ma-0 pa-0 pr-2"
                >
                  <v-toolbar flat>
                    <span
                      >{{ enrollmentDetails.company_name }} has a company
                      website</span
                    >
                    <v-spacer></v-spacer>
                    <div>
                      <v-switch v-model="websiteToggle" hide-details></v-switch>
                    </div>
                  </v-toolbar>
                </v-col>
                <v-col cols="12" class="ma-0 pa-0 pr-2" v-if="websiteToggle">
                  <CustomInputContainer label="Website">
                    <div slot="input">
                      <v-text-field
                        v-model="website"
                        placeholder="Website"
                        outlined
                        dense
                        :rules="websiteRules"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col
                  cols="12"
                  style="display: flex; justify-content: center"
                  class="ma-0 pa-0 pr-2"
                >
                  <v-toolbar flat>
                    <span
                      >{{ enrollmentDetails.company_name }} has a company
                      LinkedIn</span
                    >
                    <v-spacer></v-spacer>
                    <div>
                      <v-switch
                        v-model="linkedInToggle"
                        hide-details
                      ></v-switch>
                    </div>
                  </v-toolbar>
                </v-col>
                <v-col cols="12" class="ma-0 pa-0 pr-2" v-if="linkedInToggle">
                  <CustomInputContainer label="LinkedIn">
                    <div slot="input">
                      <v-text-field
                        v-model="linkedIn"
                        placeholder="LinkedIn"
                        outlined
                        dense
                        :rules="linkedInRules"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col
                  cols="12"
                  style="display: flex; justify-content: start"
                  Mutter
                  class="ma-0 pa-0 pr-2"
                >
                  <span class="mb-3">Banking Information</span>
                </v-col>
                <v-col cols="12" md="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Country">
                    <div slot="input">
                      <v-select
                        :items="countryList"
                        placeholder="Country"
                        outlined
                        dense
                        :rules="validation.selectField('Country')"
                        required
                        v-model="enrollmentDetails.bank_details[0].country"
                      >
                      </v-select>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Bank Name">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.bank_details[0].bank_name"
                        placeholder="Bank Name"
                        outlined
                        dense
                        :rules="validation.bankName"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Account Number">
                    <div slot="input">
                      <v-text-field
                        v-model="
                          enrollmentDetails.bank_details[0].account_number
                        "
                        placeholder="Account Number"
                        outlined
                        dense
                        :rules="validation.AccountNumber"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="IBAN">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.bank_details[0].iban"
                        placeholder="IBAN"
                        outlined
                        dense
                        :rules="validation.IBAN"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Bank Address">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.bank_details[0].bank_address"
                        placeholder="Bank Address"
                        outlined
                        dense
                        :rules="validation.address('Bank Address')"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Swift Code">
                    <div slot="input">
                      <v-text-field
                        v-model="enrollmentDetails.bank_details[0].swift_code"
                        placeholder="Swift Code"
                        outlined
                        dense
                        :rules="validation.swiftCode"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </div>
        <div
          v-if="count == 4"
          style="
            width: 100%;
            padding: 20px;
            height: 85%;
            justify-content: center;
            align-items: baseline;
          "
        >
          <v-container
            fluid
            class="scroll"
            style="max-height: 68vh"
            v-if="enrollmentDetails.is_editable"
          >
            <v-form
              ref="stepFourValid"
              v-model="form.stepFourValid"
              lazy-validation
            >
              <v-row class="scrollDark">
                <v-col
                  cols="12"
                  style="display: flex; justify-content: center"
                  class="ma-0 pa-0 pr-2"
                >
                  <v-banner
                    color="#f9dafb"
                    icon="fa-info"
                    rounded
                    shaped
                    sticky
                    tile
                    style="width: 100%"
                  >
                    Warning: The added point of contact will have access to
                    NathanHR PEO Central. Please ensure you enter the correct
                    email to prevent any issues or unauthorized access. The
                    login Details will be sent to the provided email addresses.
                  </v-banner>
                </v-col>
                <v-col
                  cols="12"
                  style="display: flex; justify-content: start"
                  class="ma-0 pa-0 pr-2"
                >
                  <span class="mb-3">Financial Point of Contact Details</span>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Name">
                    <div slot="input">
                      <v-text-field
                        v-model="financial_poc.name"
                        placeholder="Name"
                        outlined
                        dense
                        :rules="validation.custom('Name')"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Phone">
                    <div slot="input" class="d-flex">
                      <v-select
                        class="mr-2"
                        style="width: 120px"
                        v-model="selectedCountry.financial_poc_phone"
                        :items="countries"
                        item-text="name"
                        item-value="phone"
                        outlined
                        dense
                        required
                        :rules="validation.selectField('Country Code')"
                      ></v-select>
                      <v-text-field
                        v-model="financial_poc.phone"
                        placeholder="Phone"
                        outlined
                        :rules="validation.phoneNumber"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Email">
                    <div slot="input">
                      <v-text-field
                        v-model="financial_poc.email"
                        placeholder="Email"
                        outlined
                        dense
                        :rules="validation.email('Email')"
                        required
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Designation">
                    <div slot="input">
                      <v-text-field
                        v-model="financial_poc.designation"
                        placeholder="Designation"
                        outlined
                        dense
                        :rules="validation.custom('Designation')"
                        required
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col
                  cols="12"
                  style="display: flex; justify-content: start"
                  class="ma-0 pa-0 pr-2"
                >
                  <span class="mb-3">HR Point of Contact Details</span>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Name">
                    <div slot="input">
                      <v-text-field
                        v-model="hr_poc.name"
                        placeholder="Name"
                        outlined
                        dense
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Phone">
                    <div slot="input" class="d-flex">
                      <v-select
                        class="mr-2"
                        style="width: 120px"
                        v-model="selectedCountry.hr_poc_phone"
                        :items="countries"
                        item-text="name"
                        item-value="phone"
                        outlined
                        dense
                        required
                      ></v-select>
                      <v-text-field
                        v-model="hr_poc.phone"
                        placeholder="Phone"
                        outlined
                        :rules="validation.phoneNumber"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Email">
                    <div slot="input">
                      <v-text-field
                        v-model="hr_poc.email"
                        :rules="validation.email('Company Email')"
                        placeholder="Email"
                        outlined
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Designation">
                    <div slot="input">
                      <v-text-field
                        v-model="hr_poc.designation"
                        placeholder="Designation"
                        outlined
                        dense
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col
                  cols="12"
                  style="display: flex; justify-content: start"
                  class="ma-0 pa-0 pr-2"
                >
                  <span class="mb-3">Escalation Point of Contact Details</span>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Name">
                    <div slot="input">
                      <v-text-field
                        v-model="escalation_poc.name"
                        placeholder="Name"
                        outlined
                        dense
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Phone">
                    <div slot="input" class="d-flex">
                      <v-select
                        class="mr-2"
                        style="width: 120px"
                        v-model="selectedCountry.escalation_poc_phone"
                        :items="countries"
                        item-text="name"
                        item-value="phone"
                        outlined
                        dense
                        required
                      ></v-select>
                      <v-text-field
                        v-model="escalation_poc.phone"
                        placeholder="Phone"
                        outlined
                        :rules="validation.phoneNumber"
                        required
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0 pr-2">
                  <CustomInputContainer label="Email">
                    <div slot="input">
                      <v-text-field
                        v-model="escalation_poc.email"
                        :rules="validation.email('Company Email')"
                        placeholder="Email"
                        outlined
                        dense
                      ></v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
                <v-col cols="6" class="ma-0 pa-0">
                  <CustomInputContainer label="Designation">
                    <div slot="input">
                      <v-text-field
                        v-model="escalation_poc.designation"
                        placeholder="Designation"
                        outlined
                        dense
                      >
                      </v-text-field>
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <v-row v-else>
            <v-col cols="12" style="display: flex; justify-content: center">
              <span class="mb-3">Company Address</span>
            </v-col>
            <v-col sm="6" md="6" lg="6">
              <div class="text-left">
                <span class="caption subtext--text">Customer Name</span>
              </div>
            </v-col>
            <v-col sm="6" md="6" lg="6">
              <div class="text-left">
                <h6 class="text--text">{{ enrollmentDetails.company_name }}</h6>
              </div>
            </v-col>
          </v-row>
        </div>
        <div
          v-if="count == 5"
          class="tw-w-full tw-p-5 tw-h-85 tw-flex tw-justify-center tw-items-baseline"
        >
          <v-container
            fluid
            class="scroll tw-max-h-68vh"
            v-if="enrollmentDetails.is_editable"
          >
            <v-row class="scrollDark">
              <v-col
                cols="12"
                class="tw-flex tw-justify-start tw-mb-6 tw-pa-0"
              >
                <h4 class="tw-text-xl tw-font-semibold tw-text-gray-800 tw-flex tw-items-center">
                  <v-icon class="tw-mr-2" color="primary">mdi-file-document-multiple</v-icon>
                  Company Documents
                </h4>
              </v-col>

              <!-- Company Incorporation Certificate -->
              <v-col
                cols="12"
                md="6"
                class="tw-mb-6 tw-pa-0 tw-pr-3"
              >
                <div class="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-4 tw-shadow-sm">
                  <h5 class="tw-text-lg tw-font-medium tw-text-gray-800 tw-mb-3 tw-flex tw-items-center">
                    <v-icon class="tw-mr-2" color="primary" small>mdi-certificate</v-icon>
                    Company Incorporation Certificate
                  </h5>

                  <!-- Upload Area -->
                  <div v-if="enrollmentDetails.documents.certification == ''" class="tw-relative">
                    <div
                      :class="[
                        'tw-border-2 tw-border-dashed tw-rounded-lg tw-p-6 tw-text-center tw-transition-all tw-duration-200 tw-cursor-pointer',
                        dragging ? 'tw-border-blue-400 tw-bg-blue-50' : 'tw-border-gray-300 tw-bg-gray-50',
                        uploadStates.certification ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'
                      ]"
                      @dragenter="dragging = true"
                      @dragleave="dragging = false"
                      @click="!uploadStates.certification && $refs.certificationInput.click()"
                    >
                      <!-- Loading State -->
                      <div v-if="uploadStates.certification" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="40"
                          class="tw-mb-3"
                        ></v-progress-circular>
                        <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                        <p class="tw-text-xs tw-text-gray-500 tw-mt-1">Please wait</p>
                      </div>

                      <!-- Upload Icon and Text -->
                      <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                        <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                        <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                        <p class="tw-text-xs tw-text-gray-400 tw-mt-1">PDF, DOC, DOCX</p>
                      </div>
                    </div>
                    <input
                      ref="certificationInput"
                      type="file"
                      @change="onUploadCertification"
                      :rules="fileRules"
                      accept=".pdf,.doc,.docx"
                      class="tw-hidden"
                    />
                  </div>

                  <!-- Uploaded File Display -->
                  <div v-else class="tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg tw-p-3">
                    <div class="tw-flex tw-items-center tw-justify-between">
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer tw-text-green-700 tw-hover:text-green-800"
                        @click="openDocument(enrollmentDetails.documents.certification)"
                      >
                        <v-icon color="green" class="tw-mr-2">mdi-file-pdf-box</v-icon>
                        <span class="tw-text-sm tw-font-medium">{{ getNameFromLink(enrollmentDetails.documents.certification) }}</span>
                      </div>
                      <v-btn
                        icon
                        small
                        color="red"
                        @click="enrollmentDetails.documents.certification = ''"
                        class="tw-ml-2"
                      >
                        <v-icon small>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Signatory's Passport Copy -->
              <v-col
                cols="12"
                md="6"
                class="tw-mb-6 tw-pa-0 tw-pl-3"
              >
                <div class="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-4 tw-shadow-sm">
                  <h5 class="tw-text-lg tw-font-medium tw-text-gray-800 tw-mb-3 tw-flex tw-items-center">
                    <v-icon class="tw-mr-2" color="primary" small>mdi-passport</v-icon>
                    Signatory's Passport Copy
                  </h5>

                  <!-- Upload Area -->
                  <div v-if="enrollmentDetails.documents.passport_copy == ''" class="tw-relative">
                    <div
                      :class="[
                        'tw-border-2 tw-border-dashed tw-rounded-lg tw-p-6 tw-text-center tw-transition-all tw-duration-200 tw-cursor-pointer',
                        dragging ? 'tw-border-blue-400 tw-bg-blue-50' : 'tw-border-gray-300 tw-bg-gray-50',
                        uploadStates.passport_copy ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'
                      ]"
                      @dragenter="dragging = true"
                      @dragleave="dragging = false"
                      @click="!uploadStates.passport_copy && $refs.passportInput.click()"
                    >
                      <!-- Loading State -->
                      <div v-if="uploadStates.passport_copy" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="40"
                          class="tw-mb-3"
                        ></v-progress-circular>
                        <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                        <p class="tw-text-xs tw-text-gray-500 tw-mt-1">Please wait</p>
                      </div>

                      <!-- Upload Icon and Text -->
                      <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                        <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                        <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                        <p class="tw-text-xs tw-text-gray-400 tw-mt-1">PDF, JPG, PNG</p>
                      </div>
                    </div>
                    <input
                      ref="passportInput"
                      type="file"
                      @change="onUploadPassportCopy"
                      :rules="fileRules"
                      accept=".pdf,.jpg,.jpeg,.png"
                      class="tw-hidden"
                    />
                  </div>

                  <!-- Uploaded File Display -->
                  <div v-else class="tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg tw-p-3">
                    <div class="tw-flex tw-items-center tw-justify-between">
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer tw-text-green-700 tw-hover:text-green-800"
                        @click="openDocument(enrollmentDetails.documents.passport_copy)"
                      >
                        <v-icon color="green" class="tw-mr-2">mdi-file-pdf-box</v-icon>
                        <span class="tw-text-sm tw-font-medium">{{ getNameFromLink(enrollmentDetails.documents.passport_copy) }}</span>
                      </div>
                      <v-btn
                        icon
                        small
                        color="red"
                        @click="enrollmentDetails.documents.passport_copy = ''"
                        class="tw-ml-2"
                      >
                        <v-icon small>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Signed KYC Form -->
              <v-col
                cols="12"
                md="6"
                class="tw-mb-6 tw-pa-0 tw-pr-3"
              >
                <div class="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-4 tw-shadow-sm">
                  <h5 class="tw-text-lg tw-font-medium tw-text-gray-800 tw-mb-3 tw-flex tw-items-center">
                    <v-icon class="tw-mr-2" color="primary" small>mdi-file-sign</v-icon>
                    Signed KYC Form
                  </h5>

                  <!-- Upload Area -->
                  <div v-if="enrollmentDetails.documents.signed_kyc == ''" class="tw-relative">
                    <div
                      :class="[
                        'tw-border-2 tw-border-dashed tw-rounded-lg tw-p-6 tw-text-center tw-transition-all tw-duration-200 tw-cursor-pointer',
                        dragging ? 'tw-border-blue-400 tw-bg-blue-50' : 'tw-border-gray-300 tw-bg-gray-50',
                        uploadStates.signed_kyc ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'
                      ]"
                      @dragenter="dragging = true"
                      @dragleave="dragging = false"
                      @click="!uploadStates.signed_kyc && $refs.kycInput.click()"
                    >
                      <!-- Loading State -->
                      <div v-if="uploadStates.signed_kyc" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="40"
                          class="tw-mb-3"
                        ></v-progress-circular>
                        <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                        <p class="tw-text-xs tw-text-gray-500 tw-mt-1">Please wait</p>
                      </div>

                      <!-- Upload Icon and Text -->
                      <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                        <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                        <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                        <p class="tw-text-xs tw-text-gray-400 tw-mt-1">PDF, DOC, DOCX</p>
                      </div>
                    </div>
                    <input
                      ref="kycInput"
                      type="file"
                      @change="onUploadSignedKyc"
                      :rules="fileRules"
                      accept=".pdf,.doc,.docx"
                      class="tw-hidden"
                    />
                  </div>

                  <!-- Uploaded File Display -->
                  <div v-else class="tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg tw-p-3">
                    <div class="tw-flex tw-items-center tw-justify-between">
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer tw-text-green-700 tw-hover:text-green-800"
                        @click="openDocument(enrollmentDetails.documents.signed_kyc)"
                      >
                        <v-icon color="green" class="tw-mr-2">mdi-file-pdf-box</v-icon>
                        <span class="tw-text-sm tw-font-medium">{{ getNameFromLink(enrollmentDetails.documents.signed_kyc) }}</span>
                      </div>
                      <v-btn
                        icon
                        small
                        color="red"
                        @click="enrollmentDetails.documents.signed_kyc = ''"
                        class="tw-ml-2"
                      >
                        <v-icon small>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- VAT Certificate -->
              <v-col
                cols="12"
                md="6"
                class="tw-mb-6 tw-pa-0 tw-pl-3"
              >
                <div class="tw-bg-white tw-rounded-lg tw-border tw-border-gray-200 tw-p-4 tw-shadow-sm">
                  <h5 class="tw-text-lg tw-font-medium tw-text-gray-800 tw-mb-3 tw-flex tw-items-center">
                    <v-icon class="tw-mr-2" color="primary" small>mdi-receipt</v-icon>
                    VAT Certificate
                  </h5>

                  <!-- Upload Area -->
                  <div v-if="enrollmentDetails.documents.vat_certificate == ''" class="tw-relative">
                    <div
                      :class="[
                        'tw-border-2 tw-border-dashed tw-rounded-lg tw-p-6 tw-text-center tw-transition-all tw-duration-200 tw-cursor-pointer',
                        dragging ? 'tw-border-blue-400 tw-bg-blue-50' : 'tw-border-gray-300 tw-bg-gray-50',
                        uploadStates.vat_certificate ? 'tw-opacity-50 tw-pointer-events-none' : 'tw-hover:border-blue-400 tw-hover:bg-blue-50'
                      ]"
                      @dragenter="dragging = true"
                      @dragleave="dragging = false"
                      @click="!uploadStates.vat_certificate && $refs.vatInput.click()"
                    >
                      <!-- Loading State -->
                      <div v-if="uploadStates.vat_certificate" class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="40"
                          class="tw-mb-3"
                        ></v-progress-circular>
                        <p class="tw-text-sm tw-text-gray-600 tw-font-medium">Uploading document...</p>
                        <p class="tw-text-xs tw-text-gray-500 tw-mt-1">Please wait</p>
                      </div>

                      <!-- Upload Icon and Text -->
                      <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center">
                        <v-icon size="48" color="gray" class="tw-mb-3">mdi-cloud-upload</v-icon>
                        <p class="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">Click to upload or drag and drop</p>
                        <p class="tw-text-xs tw-text-gray-500">Maximum file size: 10 MB</p>
                        <p class="tw-text-xs tw-text-gray-400 tw-mt-1">PDF, JPG, PNG</p>
                      </div>
                    </div>
                    <input
                      ref="vatInput"
                      type="file"
                      @change="onUploadVatCertificate"
                      :rules="fileRules"
                      accept=".pdf,.jpg,.jpeg,.png"
                      class="tw-hidden"
                    />
                  </div>

                  <!-- Uploaded File Display -->
                  <div v-else class="tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg tw-p-3">
                    <div class="tw-flex tw-items-center tw-justify-between">
                      <div
                        class="tw-flex tw-items-center tw-cursor-pointer tw-text-green-700 tw-hover:text-green-800"
                        @click="openDocument(enrollmentDetails.documents.vat_certificate)"
                      >
                        <v-icon color="green" class="tw-mr-2">mdi-file-pdf-box</v-icon>
                        <span class="tw-text-sm tw-font-medium">{{ getNameFromLink(enrollmentDetails.documents.vat_certificate) }}</span>
                      </div>
                      <v-btn
                        icon
                        small
                        color="red"
                        @click="enrollmentDetails.documents.vat_certificate = ''"
                        class="tw-ml-2"
                      >
                        <v-icon small>mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- KYC Form Download Link -->
              <v-col cols="12" class="tw-mt-6 tw-pa-0">
                <div class="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
                  <div class="tw-flex tw-items-center tw-justify-center">
                    <v-icon color="blue" class="tw-mr-2">mdi-download</v-icon>
                    <span class="tw-text-sm tw-text-blue-700">
                      Click
                      <a
                        @click="openFile"
                        class="tw-text-blue-600 tw-font-medium tw-underline tw-cursor-pointer tw-hover:text-blue-800"
                      >
                        here
                      </a>
                      to download KYC form (kindly fill and sign the KYC form before uploading)
                    </span>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-right: 20px;
            width: 100%;
          "
        >
          <div class="pl-5">
            <v-btn class="mr-2" @click="count--" v-if="count > 1"
              >Previous</v-btn
            >
          </div>
          <div>
            <span class="mr-2"> Step {{ count }} of {{ total }}</span>
            <v-btn color="primary" @click="getNextStep" v-if="count < total"
              >Next</v-btn
            >
            <v-btn
              color="primary"
              @click="submit()"
              v-if="count === total && enrollmentDetails.is_editable"
              >Submit</v-btn
            >
          </div>
        </div>
      </div>
      <div v-else>
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 55vw;
          height: 90vh;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0px 24px 30px #959ea51a !important;
          padding: 40px;
          text-align: center;
        ">
          <h2>Enrollment Form</h2>
          <p style="margin-top: 20px; font-size: 16px; color: #666;">
            This enrollment form is currently not editable. 
            Please contact support if you need to make changes.
          </p>
          <div style="margin-top: 30px;">
            <p><strong>Company:</strong> {{ enrollmentDetails.company_name || 'N/A' }}</p>
            <p><strong>Status:</strong> {{ enrollmentDetails.status || 'N/A' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import ThankYouSvg from '@/assets/images/thank_you.svg'
import countries from 'countries-list'
import PdfSvg from '@/assets/images/icons/pdf.svg'
import CancelSvg from '@/assets/images/icons/cancel.svg'



export default {
  layout: 'login',
  components: {
    CustomInputContainer,
    ThankYouSvg,
    PdfSvg,
    CancelSvg,
  },
  data() {
    return {
      loading: true,
      submitting: false,
      submitSuccess: false,
      submitError: '',
      dragging: false,
      uploadingFile: null,
      industries: [],
      uploadingFileType: 'certification',
      uploadStates: {
        certification: false,
        passport_copy: false,
        vat_certificate: false,
        signed_kyc: false,
      },
      selectedCountry: {
        phone_number: '',
        billing_phone: '',
        shipping_phone: '',
        financial_poc_phone: '',
        hr_poc_phone: '',
        escalation_poc_phone: '',
      },
      countries: Object.keys(countries.countries).map((code) => ({
        name: `${countries.countries[code].name} (+${countries.countries[code].phone})`,
        phone: countries.countries[code].phone,
      })),
      enrollmentDetails: {
        documents: {
          certification: '',
          passport_copy: '',
          vat_certificate: '',
          signed_kyc: '',
        },
        bank_details: [
          {
            bank_name: '',
            account_number: '',
            iban: '',
            swift_code: '',
            bank_address: '',
            country: '',
            salary_payment_mode: '',
          },
        ],
        company_name: '',
        legal_name: '',
        company_address: '',
        business_industry: '',
        registration_number: '',
        GRN_number: '',
        trn_number: '',
        email: '',
        phone_number: '',
        country: '',
        website: '',
        linkedIn: '',
        billing_address: null,
        shipping_address: null,
        contact_persons: [],
      },
      count: 1,
      total: 5,
      websiteToggle: false,
      linkedInToggle: false,
      sameAsBilling: false,
      billing_address: {
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
      },
      shipping_address: {
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        special_instructions: '',
      },
      financial_poc: {
        name: '',
        phone: '',
        email: '',
        designation: '',
      },
      hr_poc: {
        name: '',
        phone: '',
        email: '',
        designation: '',
      },
      escalation_poc: {
        name: '',
        phone: '',
        email: '',
        designation: '',
      },
      website: '',
      linkedIn: '',
      form: {
        stepOneValid: false,
        stepTwoValid: false,
        stepThreeValid: false,
        stepFourValid: false,
      },
      fileRules: [
        (v) => !!v || 'File is required',
        (v) => (v && v.size > 0) || 'File is required',
      ],
      validation: {
        companyName: [(v) => !!v || 'Company Name is required'],
        LegalName: [(v) => !!v || 'Legal Name is required'],
        address: (field) => [(v) => !!v || `${field} is required`],
        custom: (field) => [(v) => !!v || `${field} is required`],
        Industry: [(v) => !!v || 'Industry is required'],
        RegistrationNumber: [(v) => !!v || 'Registration Number is required'],
        GRN_number: [
          (v) => !!v || 'GRN Number is required',
          (v) => /^[0-9]+$/.test(v) || 'Only numbers are allowed',
        ],
        TRN_number: [
          (v) => !!v || 'TRN Number is required',
          (v) => /^[0-9]+$/.test(v) || 'Only numbers are allowed',
        ],
        bankName: [
          (v) => !!v || 'Bank Name is required',
          (v) => /^[a-zA-Z\s]+$/.test(v) || 'Only letters and spaces allowed',
          (v) => v.length >= 3 || 'Must be at least 3 characters',
        ],
        IBAN: [
          (v) => !!v || 'IBAN is required',
          (v) =>
            /^[A-Z0-9]+$/.test(v) ||
            'Only uppercase letters and numbers allowed',
        ],
        swiftCode: [
          (v) => !!v || 'SWIFT Code is required',
          (v) => !v || /^[A-Z0-9]+$/.test(v) || 'Only uppercase letters and numbers allowed',
        ],
        AccountNumber: [
          (v) => !!v || 'Account Number is required',
          (v) => /^[0-9]+$/.test(v) || 'Only numbers are allowed',
        ],
        phoneNumber: [
          (v) =>
            (v !== undefined && v !== null && v !== '') ||
            'Phone Number is required',
          (v) => (v && /^[0-9]+$/.test(v)) || 'Only numbers are allowed',
          (v) =>
            (v && v.length >= 8 && v.length <= 15) ||
            'Must be between 8-15 digits',
        ],
        selectField: (field) => [(v) => !!v || `${field} is required`],
        email: (field) => [
          (v) => !!v || `${field} is required`,
          (v) => {
            if (!v) return true
            const value = v.trim()
            const isValid = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(
              value
            )
            return isValid || `Please enter a valid ${field}`
          },
          (v) => {
            if (!v) return true
            return (
              (v === v.trim() && v === v.toLowerCase()) ||
              `${field} must be in lowercase with no leading/trailing spaces`
            )
          },
        ],
      },
      stepError: '',
    }
  },
  computed: {
    countryList() {
      const countryCodes = Object.keys(countries.countries)
      const countryNames = countryCodes.map((code) => countries.countries[code].name)
      return countryNames
    },
    debugInfo() {
      console.log('🔵 Computed debugInfo - loading:', this.loading)
      console.log('🔵 Computed debugInfo - submitSuccess:', this.submitSuccess)
      console.log('🔵 Computed debugInfo - enrollmentDetails.is_editable:', this.enrollmentDetails?.is_editable)
      console.log('🔵 Computed debugInfo - count:', this.count)
      return {
        loading: this.loading,
        submitSuccess: this.submitSuccess,
        isEditable: this.enrollmentDetails?.is_editable,
        count: this.count
      }
    },
    websiteRules() {
      return this.websiteToggle
        ? [
            (v) => !!v || 'Website Url is required',
            (v) =>
              /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i.test(
                v
              ) || 'Please enter a valid URL',
          ]
        : []
    },
    linkedInRules() {
      return this.linkedInToggle
        ? [
            (v) => !!v || 'LinkedIn Url is required',
            (v) =>
              /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i.test(
                v
              ) || 'Please enter a valid URL',
          ]
        : []
    },
    detailsAreValid() {
      return (
        this.form.stepOneValid &&
        this.form.stepTwoValid &&
        this.form.stepThreeValid &&
        this.form.stepFourValid
      )
    },
  },
  watch: {
    loading(newVal, oldVal) {
      console.log('🔵 Loading state changed from', oldVal, 'to', newVal)
    },
    submitSuccess(newVal, oldVal) {
      console.log('🔵 SubmitSuccess state changed from', oldVal, 'to', newVal)
    },
    'enrollmentDetails.is_editable': {
      handler(newVal, oldVal) {
        console.log('🔵 is_editable changed from', oldVal, 'to', newVal)
      },
      deep: true
    }
  },
  methods: {
    openFile() {
      window.open(
        'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_67b58ee6e6f2fe003052d37e_1740044023512_IMSP09%20F01%20KYC%20Form.pdf/IMSP09%20F01%20KYC%20Form.pdf'
      )
    },
    getNameFromLink(link) {
      return link.split('/').pop()
    },
    openDocument(url) {
      window.open(url)
    },
    onUploadCertification(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'certification'
      this.uploadStates.certification = true
      this.uploadFile()
    },
    onUploadPassportCopy(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'passport_copy'
      this.uploadStates.passport_copy = true
      this.uploadFile()
    },
    onUploadVatCertificate(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'vat_certificate'
      this.uploadStates.vat_certificate = true
      this.uploadFile()
    },
    onUploadSignedKyc(e) {
      this.uploadingFile = e.target.files || e.dataTransfer.files
      this.uploadingFileType = 'signed_kyc'
      this.uploadStates.signed_kyc = true
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
      let id = this.$route.query.id
      this.$axios
        .post(`/enrollments/upload/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          let link = response.data[0]
          if (this.uploadingFileType === 'certification') {
            this.enrollmentDetails = {
              ...this.enrollmentDetails,
              documents: {
                ...this.enrollmentDetails.documents,
                certification: link,
              },
            }
            this.uploadStates.certification = false
          } else if (this.uploadingFileType === 'passport_copy') {
            this.enrollmentDetails = {
              ...this.enrollmentDetails,
              documents: {
                ...this.enrollmentDetails.documents,
                passport_copy: link,
              },
            }
            this.uploadStates.passport_copy = false
          } else if (this.uploadingFileType === 'vat_certificate') {
            this.enrollmentDetails = {
              ...this.enrollmentDetails,
              documents: {
                ...this.enrollmentDetails.documents,
                vat_certificate: link,
              },
            }
            this.uploadStates.vat_certificate = false
          } else if (this.uploadingFileType === 'signed_kyc') {
            this.enrollmentDetails = {
              ...this.enrollmentDetails,
              documents: {
                ...this.enrollmentDetails.documents,
                signed_kyc: link,
              },
            }
            this.uploadStates.signed_kyc = false
          }
        })
        .catch((error) => {
          console.log(error)
          // Reset loading state on error
          if (this.uploadingFileType === 'certification') {
            this.uploadStates.certification = false
          } else if (this.uploadingFileType === 'passport_copy') {
            this.uploadStates.passport_copy = false
          } else if (this.uploadingFileType === 'vat_certificate') {
            this.uploadStates.vat_certificate = false
          } else if (this.uploadingFileType === 'signed_kyc') {
            this.uploadStates.signed_kyc = false
          }
        })
    },
    validateForm(field) {
      try {
        this.$refs[field].validate()
        return this.form[field]
      } catch (e) {
        this.stepError = 'There was a validation error. Please check your input.'
        return false
      }
    },
    getNextStep() {
      switch (this.count) {
        case 1:
          if (this.validateForm('stepOneValid')) {
            this.count++
          }
          break
        case 2:
          if (this.validateForm('stepTwoValid')) {
            this.count++
          }
          break
        case 3:
          if (this.validateForm('stepThreeValid')) {
            this.count++
          }
          break
        case 4:
          if (this.validateForm('stepFourValid')) {
            this.count++
          }
          break
        default:
          break
      }
    },
    changeSameAs() {
      if (this.sameAsBilling) {
        this.shipping_address = {
          address_line1: this.billing_address.address_line1,
          address_line2: this.billing_address.address_line2,
          city: this.billing_address.city,
          state: this.billing_address.state,
          zip: this.billing_address.zip,
          phone: this.billing_address.phone,
          special_instructions: this.shipping_address.special_instructions,
        }
        this.selectedCountry.shipping_phone = this.selectedCountry.billing_phone
      } else {
        this.shipping_address = {
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          special_instructions: '',
        }
        this.selectedCountry.shipping_phone = ''
      }
    },
    async fetchIndustries() {
      try {
        console.log('🔵 fetchIndustries: Starting...')
        this.loading = true

        console.log('🔵 fetchIndustries: Making API call to /industries?limit=10000')
        const response = await this.$axios.get(`/industries?limit=10000`)
        console.log('🔵 fetchIndustries: API response received:', response.data)
        
        const results = response.data?.results || []
        console.log('🔵 fetchIndustries: Results extracted:', results.length, 'items')

        const reconstructedIndustries = results.map((item) => ({
          industry_name: item.industry_name,
        }))

        this.industries = reconstructedIndustries
        console.log('🔵 fetchIndustries: Industries processed:', this.industries.length)
      } catch (error) {
        console.error('🔴 fetchIndustries: Error occurred:', error)
        console.error('🔴 fetchIndustries: Error message:', error.message)
        console.error('🔴 fetchIndustries: Error response:', error.response)
      } finally {
        console.log('🔵 fetchIndustries: Setting loading to false')
        this.loading = false
      }
    },
    async getCompanyDetails() {
      try {
        console.log('🔵 getCompanyDetails: Starting...')
        this.loading = true
        let id = this.$route.query.id
        console.log('🔵 getCompanyDetails: ID from route:', id)
        
        console.log('🔵 getCompanyDetails: Making API call to /enrollments/' + id)
        const response = await this.$axios.get(`/enrollments/${id}`)
        console.log('🔵 getCompanyDetails: API response received:', response.data)
        
        this.enrollmentDetails = response.data
        console.log('🔵 getCompanyDetails: enrollmentDetails updated:', this.enrollmentDetails)
        if (!this.enrollmentDetails.documents) {
          this.enrollmentDetails.documents = {
            certification: '',
            passport_copy: '',
            vat_certificate: '',
            signed_kyc: '',
          }
        }
        if (
          !this.enrollmentDetails.bank_details ||
          this.enrollmentDetails.bank_details?.length <= 0
        ) {
          this.enrollmentDetails.bank_details = [
            {
              bank_name: '',
              account_number: '',
              iban: '',
              swift_code: '',
              bank_address: '',
              country: '',
              salary_payment_mode: '',
            },
          ]
        }
        if (this.enrollmentDetails.billing_address) {
          this.billing_address = this.enrollmentDetails.billing_address
          this.selectedCountry.billing_phone = this.billing_address.phone
            ? this.countries.find((c) =>
                this.billing_address.phone.startsWith('+' + c.phone)
              )?.phone || ''
            : ''
        }
        if (this.enrollmentDetails.shipping_address) {
          this.shipping_address = this.enrollmentDetails.shipping_address
          this.selectedCountry.shipping_phone = this.shipping_address.phone
            ? this.countries.find((c) =>
                this.shipping_address.phone.startsWith('+' + c.phone)
              )?.phone || ''
            : ''
        }
        if (this.enrollmentDetails.contact_persons.length > 0) {
          if (this.enrollmentDetails.contact_persons[0]) {
            this.financial_poc = this.enrollmentDetails.contact_persons[0]
            this.selectedCountry.financial_poc_phone = this.financial_poc.phone
              ? this.countries.find((c) =>
                  this.financial_poc.phone.startsWith('+' + c.phone)
                )?.phone || ''
              : ''
          }
          if (this.enrollmentDetails.contact_persons[1]) {
            this.hr_poc = this.enrollmentDetails.contact_persons[1]
            this.selectedCountry.hr_poc_phone = this.hr_poc.phone
              ? this.countries.find((c) =>
                  this.hr_poc.phone.startsWith('+' + c.phone)
                )?.phone || ''
              : ''
          }
          if (this.enrollmentDetails.contact_persons[2]) {
            this.escalation_poc = this.enrollmentDetails.contact_persons[2]
            this.selectedCountry.escalation_poc_phone = this.escalation_poc
              .phone
              ? this.countries.find((c) =>
                  this.escalation_poc.phone.startsWith('+' + c.phone)
                )?.phone || ''
              : ''
          }
        }
        if (this.enrollmentDetails.website) {
          this.websiteToggle = true
          this.website = this.enrollmentDetails.website
        }
        if (this.enrollmentDetails.linkedIn) {
          this.linkedInToggle = true
          this.linkedIn = this.enrollmentDetails.linkedIn
        }
        this.selectedCountry.phone_number = this.enrollmentDetails.phone_number
          ? this.countries.find((c) =>
              this.enrollmentDetails.phone_number.startsWith('+' + c.phone)
            )?.phone || ''
          : ''
        console.log('🔵 getCompanyDetails: Processing completed successfully')
        this.loading = false
        console.log('🔵 getCompanyDetails: Loading set to false')
      } catch (error) {
        console.error('🔴 getCompanyDetails: Error occurred:', error)
        console.error('🔴 getCompanyDetails: Error message:', error.message)
        console.error('🔴 getCompanyDetails: Error response:', error.response)
        this.loading = false
      }
    },
    async submit() {
      this.submitError = ''
      this.submitSuccess = false
      if (!this.detailsAreValid) {
        return
      }
      this.submitting = true
      try {
        let id = this.$route.query.id
        this.enrollmentDetails.billing_address = this.billing_address
        this.enrollmentDetails.shipping_address = this.shipping_address
        this.enrollmentDetails.contact_persons = []
        this.enrollmentDetails.website = this.website
        this.enrollmentDetails.linkedIn = this.linkedIn
        this.enrollmentDetails.status = 'Processing'
        this.enrollmentDetails.phone_number = this.selectedCountry.phone_number
          ? `+${this.selectedCountry.phone_number}${this.enrollmentDetails.phone_number}`
          : this.enrollmentDetails.phone_number
        this.enrollmentDetails.billing_address.phone = this.selectedCountry
          .billing_phone
          ? `+${this.selectedCountry.billing_phone}${this.billing_address.phone}`
          : this.billing_address.phone
        this.enrollmentDetails.shipping_address.phone = this.selectedCountry
          .shipping_phone
          ? `+${this.selectedCountry.shipping_phone}${this.shipping_address.phone}`
          : this.shipping_address.phone
        this.financial_poc.phone = this.selectedCountry.financial_poc_phone
          ? `+${this.selectedCountry.financial_poc_phone}${this.financial_poc.phone}`
          : this.financial_poc.phone
        this.hr_poc.phone = this.selectedCountry.hr_poc_phone
          ? `+${this.selectedCountry.hr_poc_phone}${this.hr_poc.phone}`
          : this.hr_poc.phone
        this.escalation_poc.phone = this.selectedCountry.escalation_poc_phone
          ? `+${this.selectedCountry.escalation_poc_phone}${this.escalation_poc.phone}`
          : this.escalation_poc.phone
        this.enrollmentDetails.contact_persons.push(
          this.financial_poc,
          this.hr_poc,
          this.escalation_poc
        )
        await this.$axios.put(
          `/enrollments/${id}`,
          this.enrollmentDetails
        )
        this.submitSuccess = true
        this.enrollmentDetails.is_editable = false
        this.getCompanyDetails()
      } catch (error) {
        this.submitError = `There was an error submitting your enrollment. Please try again. ${error?.message}`
      } finally {
        this.submitting = false
      }
    },
  },
  created() {
    console.log('🔵 Enrollment Form Component Created')
  },
  beforeDestroy() {
    console.log('🔵 Enrollment Form Component Before Destroy')
  },
  async mounted() {
    console.log('🔵 Enrollment Form Component Mounted')
    console.log('🔵 Route query:', this.$route.query)
    console.log('🔵 Initial loading state:', this.loading)
    console.log('🔵 Initial enrollment details:', this.enrollmentDetails)
    
    try {
      console.log('🔵 Starting getCompanyDetails...')
      await this.getCompanyDetails()
      console.log('🔵 getCompanyDetails completed')
      console.log('🔵 Enrollment details after getCompanyDetails:', this.enrollmentDetails)
      
      console.log('🔵 Starting fetchIndustries...')
      await this.fetchIndustries()
      console.log('🔵 fetchIndustries completed')
      console.log('🔵 Industries loaded:', this.industries.length)
      
      console.log('🔵 Final loading state:', this.loading)
      console.log('🔵 Component fully loaded')
    } catch (error) {
      console.error('🔴 Error in mounted lifecycle:', error)
      this.loading = false
    }
  },
}
</script>

<style scoped>
.thank-you-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
  background-color: #fffbf3;
  padding: 20px;
}

.thank-you-image {
  width: 120px;
  height: auto;
  margin-bottom: 20px;
}

h1 {
  font-size: 2rem;
  color: #333;
}

p {
  font-size: 1.2rem;
  color: #555;
}
</style>
