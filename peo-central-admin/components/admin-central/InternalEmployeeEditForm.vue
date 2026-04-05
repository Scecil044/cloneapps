<template>
  <v-card class="tw-p-0 tw-rounded-xl tw-shadow-sm tw-bg-white tw-h-full">
    <div class="tw-p-6 tw-border-b tw-border-gray-200">
      <h2 class="tw-text-xl tw-font-bold tw-text-gray-800">
        {{ employee ? 'Edit Employee' : 'Add New Employee' }}
      </h2>
      <p class="tw-text-gray-500 tw-mt-1">
        {{ employee ? 'Update employee details and access permissions' : 'Create a new internal employee account' }}
      </p>
    </div>

    <form class="tw-p-6 tw-flex tw-flex-col" @submit.prevent="validateAndSubmit">
      <div class="tw-flex tw-items-center tw-space-x-4 tw-mb-6">
        <div class="tw-relative">
          <v-avatar size="80" class="tw-border-4 tw-border-gray-200">
            <img :src="form.avatar" :alt="form.firstName || 'Avatar'" @error="handleAvatarError" />
          </v-avatar>
          <div class="tw-absolute tw-bottom-0 tw-right-0 tw-bg-white tw-rounded-full tw-shadow-md">
            <v-btn fab x-small color="primary" @click="openAvatarSelector">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="tw-flex tw-flex-col">
          <div class="tw-text-sm tw-font-medium tw-text-gray-500 tw-mb-1">Employee Avatar</div>
          <div class="tw-text-xs tw-text-gray-400">
            Click the edit button to change the avatar
          </div>
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.firstName"
            label="First Name*"
            outlined
            dense
            :rules="[(v) => !!v || 'First name is required']"
            :error-messages="errors.firstName"
            @input="clearError('firstName')"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.lastName"
            label="Last Name*"
            outlined
            dense
            :rules="[(v) => !!v || 'Last name is required']"
            :error-messages="errors.lastName"
            @input="clearError('lastName')"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.middleName"
            label="Middle Name"
            outlined
            dense
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.email"
            label="Email Address*"
            outlined
            dense
            type="email"
            :rules="[
              (v) => !!v || 'Email is required',
              (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
              (v) => v === v.toLowerCase() || 'Email must be in lowercase'
            ]"
            :error-messages="errors.email"
            @input="handleEmailInput"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
                            v-model="form.designation"
            label="Internal Designation*"
            outlined
            dense
            :rules="[(v) => !!v || 'Internal Designation is required']"
                          :error-messages="errors.designation"
              @input="clearError('designation')"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="form.department"
            :items="departments"
            label="Department*"
            outlined
            dense
            :rules="[(v) => !!v || 'Department is required']"
            :error-messages="errors.department"
            @input="clearError('department')"
          />
        </v-col>

        <v-col cols="12" md="6">
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
                {{ slotProps.item.dialCode }}
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
              v-model="form.phone"
              label="Phone Number"
              outlined
              dense
              class="tw-flex-1"
              :error-messages="errors.phone"
              @input="clearError('phone')"
            />
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.password"
            label="Password"
            outlined
            dense
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            :rules="[
              (v) => !employee || !!v || 'Password is required for new employees',
              (v) => !v || v.length >= 8 || 'Password must be at least 8 characters'
            ]"
            :error-messages="errors.password"
            @input="clearError('password')"
            @click:append="showPassword = !showPassword"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.confirmPassword"
            label="Confirm Password"
            outlined
            dense
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            :rules="[
              (v) => !form.password || v === form.password || 'Passwords must match'
            ]"
            :error-messages="errors.confirmPassword"
            @input="clearError('confirmPassword')"
            @click:append="showPassword = !showPassword"
          />
        </v-col>

        <v-col cols="12">
          <v-switch
            v-model="form.access"
            label="Grant Portal Access"
            color="primary"
            class="tw-mt-0"
          />
          <div class="tw-text-xs tw-text-gray-500 tw--mt-4">
            Enable to allow this employee to access the EOR Central admin portal
          </div>
        </v-col>

        <!-- Email Automation Section -->
        <v-col cols="12" v-if="employee">
          <v-divider class="tw-my-4"></v-divider>
          <h4 class="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-3">Email Notification</h4>
          <v-radio-group v-model="emailAutomation" class="tw-mb-4">
            <v-radio
              value="send"
              label="Send email notification with updated credentials"
              color="primary"
            ></v-radio>
            <v-radio
              value="dont_send"
              label="Don't send email notification"
              color="primary"
            ></v-radio>
          </v-radio-group>
          <div class="tw-text-xs tw-text-gray-500 tw-mb-4">
            If selected, an email will be sent to the employee with their updated portal credentials.
          </div>
        </v-col>
      </v-row>

      <div class="tw-flex tw-justify-end tw-space-x-4 tw-mt-6">
        <v-btn color="grey darken-1" text @click="$emit('cancel')">Cancel</v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="submitting"
          :disabled="submitting"
        >
          {{ employee ? 'Update Employee' : 'Create Employee' }}
        </v-btn>
      </div>

      <!-- Avatar selection dialog -->
      <v-dialog v-model="showAvatarDialog" max-width="400">
        <v-card>
          <v-card-title>Select Avatar</v-card-title>
          <v-card-text>
            <div class="tw-grid tw-grid-cols-4 tw-gap-3">
              <v-avatar
                v-for="(avatar, index) in avatarOptions"
                :key="index"
                size="60"
                class="tw-cursor-pointer tw-transition-all tw-duration-200 hover:tw-scale-110"
                :class="{'tw-border-4 tw-border-primary': form.avatar === avatar}"
                @click="selectAvatar(avatar)"
              >
                <img :src="avatar" />
              </v-avatar>
            </div>

            <div class="tw-mt-6 tw-flex tw-justify-center">
              <v-btn color="primary" outlined @click="uploadAvatar">
                <v-icon left>mdi-upload</v-icon>
                Upload Custom Avatar
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showAvatarDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </form>
  </v-card>
</template>

<script>
import countryFlagsDialCode from 'country-flags-dial-code'

export default {
  props: {
    employee: Object,
    submitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      countryList: countryFlagsDialCode.getCountryListMap(),
      countryCode: [],
      phoneCountryCode: null,
      form: {
        firstName: this.employee?.firstName || '',
        lastName: this.employee?.lastName || '',
        middleName: this.employee?.middleName || '',
        email: this.employee?.email || '',
                  designation: this.employee?.designation || '',
        department: this.employee?.department || 'Administration',
        password: '',
        confirmPassword: '',
        avatar: this.employee?.avatar || 'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_681af1c08b004d0495d430cd_1754487344802_image2.jpg/image2.jpg',
        access: this.employee ? this.employee.access : true,
        newAvatar: null, // For storing the File object when uploading a custom avatar
        phone: this.employee?.phone || '',
        phone_code: '+971',
      },
      showPassword: false,
      errors: {},
      showAvatarDialog: false,
      departments: [
        'Administration',
        'Human Resources',
        'Finance',
        'Operations',
        'Sales',
        'Marketing',
        'IT',
        'Customer Support'
      ],
      avatarOptions: [
        'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg',
        'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_681af1c08b004d0495d430cd_1754487290734_images.png/images.png',
        'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_681af1c08b004d0495d430cd_1754487344802_image2.jpg/image2.jpg',
      ],
      emailAutomation: 'dont_send', // Default to not sending email for updates
    };
  },
  mounted() {
    // Initialize country codes
    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }

    // Set default country code
    this.phoneCountryCode = this.countryCode.find(country => country.dialCode === '+971') || this.countryCode[0]

    // Extract phone code from existing phone number if editing
    if (this.employee && this.employee.phone) {
      let phone = this.employee.phone
      if (phone && phone.includes('+')) {
        const phoneParts = phone.split(' ')
        if (phoneParts.length > 1) {
          const phone_code = phoneParts[0]
          this.form.phone = phoneParts.slice(1).join(' ')
          this.form.phone_code = phone_code
          this.phoneCountryCode = this.countryCode.find(country => country.dialCode === phone_code) || this.countryCode[0]
        }
      }
    }
  },
  methods: {
    validateAndSubmit() {
      this.errors = {};
      let isValid = true;

      // Basic validation
      if (!this.form.firstName) {
        this.errors.firstName = 'First name is required';
        isValid = false;
      }

      if (!this.form.lastName) {
        this.errors.lastName = 'Last name is required';
        isValid = false;
      }

      if (!this.form.email) {
        this.errors.email = 'Email is required';
        isValid = false;
      } else if (!/.+@.+\..+/.test(this.form.email)) {
        this.errors.email = 'Email must be valid';
        isValid = false;
      }

              if (!this.form.designation) {
          this.errors.designation = 'Internal Designation is required';
        isValid = false;
      }

      if (!this.form.department) {
        this.errors.department = 'Department is required';
        isValid = false;
      }

      // Password validation for new employees
      if (!this.employee && !this.form.password) {
        this.errors.password = 'Password is required for new employees';
        isValid = false;
      } else if (this.form.password && this.form.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters';
        isValid = false;
      }

      // Password match validation
      if (this.form.password && this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords must match';
        isValid = false;
      }

      if (isValid) {
        // Create a simplified payload with only necessary fields
        const formData = {
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          middleName: this.form.middleName,
          email: this.form.email,
          designation: this.form.designation,
          department: this.form.department,
          phone: this.form.phone,
          newAvatar: this.form.newAvatar,
          access: this.form.access
        };

        // Combine phone code with phone number
        if (formData.phone && this.form.phone_code) {
          formData.phone = `${this.form.phone_code} ${formData.phone}`
        }

        // Add password only if it's provided
        if (this.form.password) {
          formData.password = this.form.password;
        }

        // Include avatar only if it's been changed
        if (this.form.avatar !== this.employee?.avatar) {
          formData.avatar = this.form.avatar;
        }

        // Add email automation option for updates
        if (this.employee) {
          formData.emailAutomation = this.emailAutomation;
        }

        this.$emit('save', formData);
      }
    },
    clearError(field) {
      if (this.errors[field]) {
        this.$delete(this.errors, field);
      }
    },

    handleCountryCodeChange() {
      if (this.phoneCountryCode) {
        this.form.phone_code = this.phoneCountryCode.dialCode
      }
    },

    handleEmailInput() {
      // Convert email to lowercase and trim
      if (this.form.email) {
        this.form.email = this.form.email.toLowerCase().trim()
      }
      this.clearError('email')
    },
    handleAvatarError(e) {
      // Fallback to a default avatar if image fails to load
      e.target.src = 'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg';
    },
    openAvatarSelector() {
      this.showAvatarDialog = true;
    },
    selectAvatar(avatar) {
      this.form.avatar = avatar;
      // Remove any previously selected file since we're using a pre-defined avatar
      this.form.newAvatar = null;
    },
    // Allow users to upload their own avatar
    uploadAvatar() {
      // Create a hidden file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; // Only accept image files

      // When a file is selected
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Validate that the file is an image
          if (!file.type.startsWith('image/')) {
            this.$toast.error('Please select an image file');
            return;
          }

          // Store the file for later API upload
          this.form.newAvatar = file;

          // Create a temporary preview URL
          const reader = new FileReader();
          reader.onload = (event) => {
            this.form.avatar = event.target.result;
            this.showAvatarDialog = false;
          };
          reader.readAsDataURL(file);
        }
      };

      // Trigger file selection dialog
      fileInput.click();
    }
  },
};
</script>

<style scoped>
.v-text-field >>> .v-text-field__details {
  min-height: 18px;
}
</style>
