<template>
  <div>
    <v-row class="leads_wrapper">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row>
              <v-col cols="6">
                <h3>Client Onboarding</h3>
              </v-col>
              <v-col cols="6" class="text-right">
                <v-btn class="mr-2" color="primary" @click="goToClient()"
                  >Clients</v-btn
                >
                <v-btn
                  color="primary"
                  @click="isCreateEnrollmentDialogVisible = true"
                  >Client Onboarding Link</v-btn
                >
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Name</th>
                    <th class="text-left">Email</th>
                    <th class="text-left">Status</th>
                    <th class="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="enrollment in enrollments" :key="enrollment.id">
                    <td>{{ enrollment.company_name }}</td>
                    <td>{{ enrollment.email }}</td>
                    <td>{{ enrollment.status }}</td>
                    <td>
                      <v-btn
                        color="primary"
                        text
                        @click="copyURL(enrollment.id)"
                        >Copy URL</v-btn
                      >
                      <v-btn
                        color="error"
                        text
                        @click="deleteEnrollment(enrollment)"
                        >Delete</v-btn
                      >
                      <v-btn
                        v-if="enrollment.status != 'Completed'"
                        color="orange"
                        text
                        @click="sendInitialEmail(enrollment)"
                        >Send Initial Email</v-btn
                      >
                      <v-btn
                        v-if="enrollment.status == 'Completed'"
                        color="orange"
                        text
                        @click="sendConfirmationEmail(enrollment)"
                        >Send Confirmation Email</v-btn
                      >
                      <v-btn
                        v-if="enrollment.status != 'Pending'"
                        color="blue"
                        text
                        @click="selectEnrollment(enrollment)"
                        >View Details</v-btn
                      >
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="isCreateEnrollmentDialogVisible" max-width="600">
      <v-form ref="createEnrollmentForm" v-model="valid" lazy-validation>
        <v-card class="p-3" style="width: 600px; min-height: 300px">
          <v-card-title>
            <h3>Create Enrollment</h3>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newEnrollment.company_name"
                  :rules="validation.companyName"
                  required
                  label="Company Name"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="ma-0">
                <v-text-field
                  v-model="newEnrollment.email"
                  :rules="validation.email"
                  required
                  label="Email"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="mb-5">
                <v-btn
                  color="secondary"
                  @click="
                    isCreateEnrollmentDialogVisible = false
                    clearEnrollmentForm()
                  "
                  >Cancel</v-btn
                >
                <v-btn
                  color="primary"
                  :disabled="isCreationLoading"
                  @click="createEnrollment()"
                  >Create</v-btn
                >
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-form>
    </v-dialog>

    <EnrollmentDetailsDialog
      v-model="enrollmentDetailsDialog"
      :enrollment="selectedEnrollment"
      @close="close"
      @enable-editing="enableEditing"
      @visit-link="visitLink"
      @verify-enrollment="verify"
    />
    <SnackBar :data="snackbar_data" />
  </div>
</template>
<script>
import { get } from 'lodash'
import SnackBar from '~/components/utils/SnackBar.vue'
import EnrollmentDetailsDialog from '~/components/Dialogs/EnrollmentDetailsDialog.vue'

export default {
  layout: 'dashboard',
  components: {
    SnackBar,
    EnrollmentDetailsDialog,
  },
  data() {
    return {
      enrollments: [],
      enrollmentDetailsDialog: false,
      selectedEnrollment: {
        contact_persons: [],
        billing_address: {},
        shipping_address: {},
        bank_details: [],
      },
      isCreationLoading: false,
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      isCreateEnrollmentDialogVisible: false,
      valid: false,
      validation: {
        companyName: [(v) => !!v || 'Company Name is required'],
        email: [
          (v) => !!v || 'Email is required',
          (v) =>
            /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v) ||
            'Please enter a valid lowercase email only',
        ],
      },
      newEnrollment: {
        company_name: '',
        email: '',
      },
    }
  },
  methods: {
    validate() {
      this.$refs.createEnrollmentForm.validate()
    },
    reset() {
      this.$refs.createEnrollmentForm.reset()
    },
    goToClient() {
      this.$router.push('/employer')
    },
    getEnrollments() {
      this.$axios
        .get('/enrollments')
        .then((response) => {
          this.enrollments = response.data
        })
        .catch((error) => {
          console.log(error)
        })
    },
    clearEnrollmentForm() {
      this.reset()
      this.newEnrollment = {
        company_name: '',
        email: '',
      }
    },
    createEnrollment() {
      // validate first
      this.validate()
      if (!this.valid) {
        return
      }

      this.isCreationLoading = true
      this.$axios
        .post('/enrollments', this.newEnrollment)
        .then((response) => {
          this.isCreationLoading = false
          this.isCreateEnrollmentDialogVisible = false
          this.getEnrollments()
          this.clearEnrollmentForm()
          this.snackbar_data = {
            snackbar: true,
            text: 'Enrollment created successfully',
            color: 'success',
          }
        })
        .catch((error) => {
          this.isCreationLoading = false
          console.log(error)
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to create enrollment',
            color: 'error',
          }
        })
    },
    deleteEnrollment(enrollment) {
      this.$axios
        .delete(`/enrollments/${enrollment.id}`)
        .then((response) => {
          this.getEnrollments()
          this.snackbar_data = {
            snackbar: true,
            text: 'Enrollment deleted successfully',
            color: 'success',
          }
        })
        .catch((error) => {
          console.log(error)
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to delete enrollment',
            color: 'error',
          }
        })
    },
    selectEnrollment(enrollment) {
      this.selectedEnrollment = enrollment
      this.enrollmentDetailsDialog = true
    },
    sendInitialEmail(enrollment) {
      this.$axios
        .post(`/enrollments/initialEmail/${enrollment.id}`)
        .then((response) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Initial email sent successfully',
            color: 'success',
          }
        })
        .catch((error) => {
          console.log(error)
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to send initial email',
            color: 'error',
          }
        })
    },
    sendConfirmationEmail(enrollment) {
      this.$axios
        .post(`/enrollments/confirmationemail/${enrollment.id}`)
        .then((response) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Confirmation email sent successfully',
            color: 'success',
          }
        })
        .catch((error) => {
          console.log(error)
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to send Confirmation email',
            color: 'error',
          }
        })
    },
    enableEditing(id) {
      this.selectedEnrollment.is_editable = true
      this.$axios
        .put(`/enrollments/${id}`, { is_editable: true })
        .then((response) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Editing enabled successfully',
            color: 'success',
          }
        })
        .catch((error) => {
          console.log(error)
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to enable editing',
            color: 'error',
          }
        })
    },
    close() {
      this.enrollmentDetailsDialog = false
      this.getEnrollments()
    },
    copyURL(id) {
      var clipboard = navigator.clipboard
      if (clipboard == undefined) {
        console.log('clipboard is undefined')
      } else {
        clipboard
          .writeText(`${process.env.HOST_URL}enrollment-form?id=${id}`)
          .then(() => {
            this.snackbar_data = {
              snackbar: true,
              text: 'URL copied to clipboard',
              color: 'success',
            }
          })
          .catch((error) => {
            console.error('Error copying URL to clipboard:', error)
          })
      }
    },
    visitLink(id) {
      window.open(`enrollment-form?id=${id}`, '_blank')
    },
    verify(id) {
      this.$axios
        .put(`/enrollments/verify/${id}`)
        .then((response) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Enrollment verified successfully',
            color: 'success',
          }
          this.getEnrollments()
        })
        .catch((error) => {
          console.log(error)
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to verify enrollment',
            color: 'error',
          }
        })
      this.enrollmentDetailsDialog = false
      this.getEnrollments()
    },
  },
  async mounted() {
    await this.getEnrollments()
  },
}
</script>
