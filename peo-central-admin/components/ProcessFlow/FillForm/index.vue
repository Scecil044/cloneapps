
<template>
  <div>
    <v-dialog id="custom_dialog" v-model="fillForm" persistent width="45vw" height="100vh"
      content-class="proposal_dialog">
      <div class="dialog_proposal">
        <v-card id="card" class="dialog_custom">
          <v-card-title id="card-title">
            <v-row>
              <v-col cols="12" class="ma-0 pa-0">
                <div class="d-flex align-center justify-space-between">
                  <h4 class="text--text"></h4>
                  <div class="d-flex align-center justify-end">
                    <v-btn class="tall__btn mr-4 pl-6 pr-6" color="subtext" :disabled="loading" @click="close"><span
                        class="">Cancel</span></v-btn>
                    <v-btn class="tall__btn pl-6 pr-6" color="primary" :disabled="loading"
                      @click="createForm">Submit</v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-title>
          <v-container v-if="loading" class="ma-0 pa-0">
            <v-row style="min-height:100%;align-items:center;justify-content:center;">
              <v-col cols="auto">
                <v-img src="/animated/ring.svg" max-width="fit-content" height="200" contain class="mr-3"></v-img>
              </v-col>
            </v-row>
          </v-container>
          <v-container v-else class="ma-0 pa-0">
            <RenderForm  :form="this.selectedForm" @changeDetection="updateForm"
              v-if="selectedForm && this.selectedForm.fields && selectedForm.fields.length > 0  && module == 'onboardings'" />
              <RenderFormOffboarding  :form="this.selectedForm" @changeDetection="updateForm"
              v-if="selectedForm && this.selectedForm.fields && selectedForm.fields.length > 0 && module == 'offboardings'" />
            <RenderFormRenewals  :form="this.selectedForm" @changeDetection="updateForm"
              v-if="selectedForm && this.selectedForm.fields && selectedForm.fields.length > 0 && module == 'renewals'" />
          </v-container>
        </v-card>
      </div>
    </v-dialog>
    <SnackBar :data="snackbar_data" />
  </div>
</template>
<script>
import SnackBar from '~/components/utils/SnackBar.vue'
import RenderForm from './renderForm.vue'
import RenderFormOffboarding from './renderFormOffboardings.vue'
import RenderFormRenewals from './renderFormRenewals.vue'


export default {
  components: { RenderForm, SnackBar  , RenderFormOffboarding , RenderFormRenewals},
  props: {
    formID: String,
    foreign_id: String, 
    module : String , 
  },
  data() {
    return {
      genericRule: [(v) => !!v || 'This field is Required'],
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      loading: false,
      form: "",
      selectedForm: {},
      proposal_creation: {},
      fillForm: true,
    }
  },
  async mounted() {
    await this.getFormDetails()
  },
  methods: {
    updateForm(event, form) {
      this.selectedForm = event
      this.form = form
    },
    async getFormDetails() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.loading = true
      await this.$axios.$get(`form/fillform?_id=${this.formID}&foreign_id=${this.foreign_id}`, {}, { headers: { Authorization: AuthStr } })
        .then(response => {
          this.selectedForm = response.data
          this.loading = false
        })
        .catch(e => console.log(e))
    },
    async createForm() {
      if (this.form.validate()) {
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        this.loading = true
        console.log(this.selectedForm)
        await this.$axios.$patch(`/form/fillform`, this.selectedForm, { headers: { Authorization: AuthStr } })
          .then(response => {
            this.loading = false
            this.successfull()
          })
          .catch(e => console.log(e))
      }
      else {
        this.snackbar_data = {
          snackbar: true,
          text: 'Looks like you missed something. Please fill in all required fields with valid information.',
          color: 'error',
          icon: 'check',
          timeout: 2000,
        }
      }
    },
    close() {
      this.$emit('close')
    },
    successfull() {
      this.$emit('successfull')
    },
  }
}
</script>