<template>
  <div class="tw-bg-white tw-rounded-xl tw-shadow-sm tw-p-6 tw-h-full tw-flex tw-flex-col tw-items-start">
    <!-- Header -->
    <div class="tw-flex tw-justify-between tw-items-center tw-mb-6">
      <h2 class="tw-text-2xl tw-font-bold tw-text-gray-800">
        {{ isEdit ? 'Edit Contact' : 'Add New Contact' }}
      </h2>
      <v-btn
        text
        color="primary"
        @click="$emit('cancel')"
        :disabled="submitting"
      >
        <v-icon left>mdi-close</v-icon>
        Cancel
      </v-btn>
    </div>

    <!-- Form -->
    <v-form ref="form" @submit.prevent="handleSubmit" class="tw-flex-1 tw-flex tw-flex-col">
      <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6 tw-mb-4">
        <!-- Left Column -->
        <div class="tw-space-y-3">
          <!-- Avatar Upload -->
          <div class="tw-flex tw-items-start tw-space-x-3">
            <v-avatar size="60" class="tw-border-4 tw-border-gray-100 tw-flex-shrink-0">
              <img
                v-if="formData.image_url"
                :src="formData.image_url"
                :alt="formData.name"
              />
              <v-icon v-else size="30" color="grey lighten-1">mdi-account</v-icon>
            </v-avatar>
            <div class="tw-flex-1">
              <v-btn
                color="primary"
                outlined
                small
                @click="$refs.fileInput.click()"
                :loading="uploading"
              >
                <v-icon left small>mdi-camera</v-icon>
                {{ formData.image_url ? 'Change Photo' : 'Upload Photo' }}
              </v-btn>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileUpload"
              />
              <p class="tw-text-xs tw-text-gray-500 tw-mt-1">JPG, PNG up to 2MB</p>
            </div>
          </div>

          <!-- Name -->
          <v-text-field
            v-model="formData.name"
            label="Full Name *"
            outlined
            dense
            :rules="[v => !!v || 'Name is required']"
            required
          />

          <!-- Email -->
          <v-text-field
            v-model="formData.email"
            label="Email Address *"
            type="email"
            outlined
            dense
            :rules="[
              v => !!v || 'Email is required',
              v => /.+@.+\..+/.test(v) || 'Email must be valid',
              v => v === v.toLowerCase() || 'Email must be in lowercase'
            ]"
            @input="handleEmailInput"
            required
          />

          <!-- Phone -->
          <div class="tw-flex tw-space-x-2">
            <v-autocomplete
              v-model="phoneCountryCode"
              :items="countryCode"
              :item-text="(item) => item.dialCode + ' ' + item.country"
              return-object
              style="max-width: 150px"
              dense
              outlined
              placeholder="Country Code"
              @change="handleCountryCodeChange"
            >
              <template #selection="slotProps">
                <div class="tw-flex tw-items-center tw-space-x-2">
                  <span class="tw-font-medium">{{ slotProps.item.dialCode }}</span>
                  <span class="tw-text-xs tw-text-gray-500">({{ slotProps.item.country }})</span>
                </div>
              </template>
              <template #item="slotProps">
                <v-avatar left class="mr-3">
                  <svg v-html="slotProps.item.flag"></svg>
                </v-avatar>
                {{ slotProps.item.dialCode }}
                {{ slotProps.item.country }}
              </template>
            </v-autocomplete>
            <v-text-field
              v-model="formData.phone"
              label="Phone Number *"
              outlined
              dense
              class="tw-flex-1"
              :rules="[
                v => !!v || 'Phone number is required',
                v => /^\d+$/.test(v) || 'Phone number should contain only digits',
                v => v.length >= 7 || 'Phone number too short',
                v => v.length <= 15 || 'Phone number too long'
              ]"
              required
              placeholder="phone number"
              persistent-hint
              @input="handlePhoneInput"
            />
            <!-- <div v-if="formData.phone && phoneCountryCode" class="tw-text-xs tw-text-gray-500 tw-mt-1">
              Complete number: {{ formattedPhoneNumber }}
            </div> -->
          </div>
        </div>

        <!-- Right Column -->
        <div class="tw-space-y-3">
          <!-- Company Selection -->
          <v-autocomplete
            v-model="formData.company_id"
            :items="companies"
            item-text="company_name"
            item-value="_id"
            label="Company *"
            outlined
            dense
            :loading="loadingCompanies"
            :rules="[v => !!v || 'Company is required']"
            required
            clearable
            @change="handleCompanyChange"
          >
            <template v-slot:item="{ item }">
              <div class="tw-flex tw-items-center tw-space-x-3">
                <v-icon color="primary" small>mdi-office-building</v-icon>
                <span>{{ item.company_name }}</span>
              </div>
            </template>
          </v-autocomplete>

          <!-- Department -->
          <v-select
            v-model="formData.department"
            :items="departmentOptions"
            label="Department *"
            outlined
            dense
            :rules="[v => !!v || 'Department is required']"
            required
          />

          <!-- Designation -->
          <v-text-field
            v-model="formData.designation"
            label="Designation *"
            outlined
            dense
            :rules="[v => !!v || 'Designation is required']"
            required
          />

          <!-- Status -->
          <v-select
            v-model="formData.status"
            :items="statusOptions"
            label="Status"
            outlined
            dense
            :rules="[v => !!v || 'Status is required']"
            required
          />
        </div>
      </div>

      <!-- Send Mail Option -->
      <div class="tw-mb-4 tw-p-3 tw-bg-gray-50 tw-rounded-lg">
        <v-checkbox
          v-model="formData.sendMail"
          label="Send welcome email to this contact"
          color="primary"
          hide-details
        >
          <template v-slot:label>
            <div class="tw-flex tw-items-center tw-space-x-2">
              <v-icon color="primary" small>mdi-email</v-icon>
              <span class="tw-text-sm tw-font-medium">Send welcome email to this contact</span>
            </div>
          </template>
        </v-checkbox>
      </div>

      <!-- Action Buttons -->
      <div class="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-200 tw-flex tw-justify-end tw-space-x-3">
        <v-btn
          text
          @click="$emit('cancel')"
          :disabled="submitting"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="submitting"
          :disabled="!valid"
          @click="handleSubmit"
        >
          <v-icon left>mdi-content-save</v-icon>
          {{ isEdit ? 'Update Contact' : 'Create Contact' }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import countryFlagsDialCode from 'country-flags-dial-code'

export default {
  name: 'PointsOfContactEditForm',
  props: {
    contact: {
      type: Object,
      default: null
    },
    submitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valid: true, // Initialize as true to enable the submit button by default for editing
      uploading: false,
      loadingCompanies: false,
      companies: [],
      countryList: countryFlagsDialCode.getCountryListMap(),
      countryCode: [],
      phoneCountryCode: null,
      originalStatus: 'active', // Track original status to detect changes
      originalFormData: {}, // Store original form data to detect changes
      formData: {
        name: '',
        email: '',
        phone: '',
        phone_code: '+971',
        department: '',
        designation: '',
        company_id: null,
        status: 'active',
        image_url: null,
        sendMail: false
      },
      departmentOptions: [
        'Escalation Point of Contact',
        'Financial Point of Contact',
        'HR Point of Contact'
      ],
      statusOptions: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' }
      ]
    }
  },
  computed: {
    isEdit() {
      return !!this.contact
    },

    formattedPhoneNumber() {
      if (this.formData.phone && this.phoneCountryCode) {
        return `${this.phoneCountryCode.dialCode}${this.formData.phone}`
      }
      return ''
    }
  },
  watch: {
    contact: {
      handler(newContact) {
        if (newContact) {
          // Extract phone code from phone number if it exists
          let phone = newContact.phone || ''
          let phone_code = '+971' // default

          if (phone && phone.includes('+')) {
            // Handle both formats: "+971000000777" and "+971 000000777"
            if (phone.includes(' ')) {
              // Format: "+971 000000777"
              const phoneParts = phone.split(' ')
              if (phoneParts.length > 1) {
                phone_code = phoneParts[0]
                phone = phoneParts.slice(1).join(' ')
              }
            } else {
              // Format: "+971000000777" - extract country code
              // Find the first sequence of digits after the +
              const match = phone.match(/^\+(\d{1,4})(\d+)$/)
              if (match) {
                phone_code = '+' + match[1]
                phone = match[2]
              } else {
                // Fallback: try to extract common country codes
                const commonCodes = ['+971', '+1', '+44', '+91', '+86', '+81', '+49', '+33', '+39', '+34']
                for (const code of commonCodes) {
                  if (phone.startsWith(code)) {
                    phone_code = code
                    phone = phone.substring(code.length)
                    break
                  }
                }
              }
            }
          }

          // Store the original status to detect changes
          this.originalStatus = newContact.status || 'active'

          // Determine the correct company ID - handle all possible data structures
          let companyId = null;
          if (newContact.company && typeof newContact.company === 'object') {
            // If company is an object, use its _id property
            companyId = newContact.company._id;
          } else if (newContact.company_id) {
            // If company_id is directly on the contact
            companyId = newContact.company_id;
          } else if (newContact.companyDetails && newContact.companyDetails._id) {
            // If company is nested in companyDetails
            companyId = newContact.companyDetails._id;
          }

          this.formData = {
            name: newContact.name || '',
            email: newContact.email || '',
            phone: phone,
            phone_code: phone_code,
            department: newContact.department || '',
            designation: newContact.designation || '',
            company_id: companyId,
            status: newContact.status || 'active',
            image_url: newContact.image_url || null,
            sendMail: false
          }

          // Store a copy of the original form data to detect changes
          this.originalFormData = JSON.parse(JSON.stringify(this.formData));

          // Set the country code selector
          this.phoneCountryCode = this.countryCode.find(country => country.dialCode === phone_code) || this.countryCode[0]

          // Fallback: if no country code found, use default
          if (!this.phoneCountryCode) {
            this.phoneCountryCode = this.countryCode.find(country => country.dialCode === '+971') || this.countryCode[0]
            phone_code = '+971'
            console.warn('Country code not found, using default:', phone_code)
          }

          // Debug logging to verify phone parsing
          console.log('Phone parsing:', {
            original: newContact.phone,
            extractedCode: phone_code,
            extractedPhone: phone,
            selectedCountry: this.phoneCountryCode
          })

          // Validate form after setting data
          this.$nextTick(() => {
            this.validateForm()
          })
        } else {
          this.resetForm()
        }
      },
      immediate: true
    },
    'formData.sendMail': {
      handler(newVal) {
        if (newVal) {
          // Emit event to parent to show email modal
          this.$emit('showEmailModal')
          // Reset the checkbox after triggering the modal
          this.$nextTick(() => {
            this.formData.sendMail = false
          })
        }
      }
    },
    // Watch form data changes to update validation and detect changes
    formData: {
      handler() {
        this.$nextTick(() => {
          this.validateForm()
        })
      },
      deep: true
    }
  },
  async mounted() {
    // Initialize country codes
    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }

    // Set default country code
    this.phoneCountryCode = this.countryCode.find(country => country.dialCode === '+971') || this.countryCode[0]

    await this.loadCompanies()
  },
  methods: {
    validateForm() {
      // Check if all required fields are filled
      const requiredFields = [
        this.formData.name,
        this.formData.email,
        this.formData.phone,
        this.formData.company_id,
        this.formData.department,
        this.formData.designation
      ]

      const allFieldsFilled = requiredFields.every(field => field && field.toString().trim() !== '')

      // Check email format
      const emailValid = this.formData.email && /.+@.+\..+/.test(this.formData.email)

      // For edit mode, always consider the form valid if all fields are filled correctly
      // This ensures the update button is enabled when editing
      if (this.isEdit && allFieldsFilled && emailValid) {
        this.valid = true;
      } else {
        // For new contacts, require all fields to be filled and email valid
        this.valid = allFieldsFilled && emailValid;
      }
    },
    resetForm() {
      this.formData = {
        name: '',
        email: '',
        phone: '',
        phone_code: '+971',
        department: '',
        designation: '',
        company_id: null,
        status: 'active',
        image_url: null,
        sendMail: false
      }
      // Reset original form data as well
      this.originalFormData = JSON.parse(JSON.stringify(this.formData));
      this.phoneCountryCode = this.countryCode.find(country => country.dialCode === '+971') || this.countryCode[0]
      this.$refs.form?.resetValidation()
      this.validateForm()
    },
    async loadCompanies() {
      try {
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        this.loadingCompanies = true
        const response = await this.$axios.$get('/companies/paginated/list', {
          params: { limit: 100 },
          headers: { Authorization: AuthStr }
        })
        this.companies = response.results || []
      } catch (error) {
        console.error('Error loading companies:', error)
        this.$emit('error', 'Failed to load companies')
      } finally {
        this.loadingCompanies = false
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.$emit('error', 'File size must be less than 2MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.$emit('error', 'Please select an image file')
        return
      }

      try {
        this.uploading = true
        const token = this.$store.state.token;
        const AuthStr = 'Bearer '.concat(token);
        const formData = new FormData()
        formData.append('documents', file)

        const response = await this.$axios.post('/documents/simpleupload', formData, {
          headers: {
            Authorization: AuthStr,
            'Content-Type': 'multipart/form-data'
          }
        })

        // Check if we have a valid response with the image URL
        if (response.data && response.data.length > 0) {
          this.formData.image_url = response.data[0]
          this.$emit('success', 'Image uploaded successfully')
        } else {
          throw new Error('No image URL returned from upload')
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        this.$emit('error', 'Failed to upload image')
      } finally {
        this.uploading = false
      }
    },
    handleCompanyChange() {
      // You can add additional logic here when company changes
    },

    handleCountryCodeChange() {
      if (this.phoneCountryCode) {
        this.formData.phone_code = this.phoneCountryCode.dialCode
        // Trigger validation update
        this.$nextTick(() => {
          this.validateForm()
        })
      }
    },

    handleEmailInput() {
      // Convert email to lowercase and trim
      if (this.formData.email) {
        this.formData.email = this.formData.email.toLowerCase().trim()
      }
    },

    handlePhoneInput() {
      // Remove any non-digit characters from phone input
      if (this.formData.phone) {
        this.formData.phone = this.formData.phone.replace(/\D/g, '')
      }
    },
    handleSubmit() {
      // Run our custom validation
      this.validateForm()

      if (!this.valid) {
        this.$emit('error', 'Please fill in all required fields')
        return
      }

      const submitData = { ...this.formData }

      // Validate required fields manually to ensure all are filled
      if (!submitData.name || !submitData.email || !submitData.phone ||
          !submitData.company_id || !submitData.department || !submitData.designation) {
        this.$emit('error', 'Please fill in all required fields')
        return
      }

      // Combine phone code with phone number
      if (submitData.phone && submitData.phone_code) {
        // Ensure phone number doesn't already have country code
        if (!submitData.phone.startsWith('+')) {
          submitData.phone = `${submitData.phone_code}${submitData.phone}`
        }
        delete submitData.phone_code

        // Debug logging for phone formatting
        console.log('Phone formatting:', {
          originalPhone: this.formData.phone,
          phoneCode: this.formData.phone_code,
          finalPhone: submitData.phone
        })
      }

      // Remove sendMail from payload (it's just for UI, not backend)
      delete submitData.sendMail

      // Remove null/undefined values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key]
        }
      })

      // Check if status has changed from active to inactive
      const statusChanged = this.contact && this.originalStatus === 'active' && submitData.status === 'inactive'

      // Add status change info to the emitted data
      this.$emit('save', submitData, { statusChanged })
    }
  }
}
</script>
