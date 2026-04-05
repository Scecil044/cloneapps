<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <SnackBar :data="snackbar_data" />
    <v-card>
      <v-card-title class="text-h5"> Configure Payment Terms </v-card-title>
      <v-card-text class="pa-0">
        <v-form v-model="valid" ref="form">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <CustomInputContainer label="Term Name*">
                  <div slot="input">
                    <v-text-field
                      placeholder="Enter name"
                      outlined
                      dense
                      :rules="requiredRule"
                      required
                      v-model="term.name"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
              <v-col cols="12" md="6">
                <CustomInputContainer label="Number of Days*">
                  <div slot="input">
                    <v-text-field
                      placeholder="Enter number"
                      outlined
                      dense
                      :rules="requiredRule"
                      required
                      v-model="term.days"
                    ></v-text-field>
                  </div>
                </CustomInputContainer>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary darken-1" text @click="toggle_dialog">
          Cancel
        </v-btn>
        <v-btn
          color="primary darken-1"
          text
          @click="addTerm"
          :disabled="!valid"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
export default {
  props: ['dialog'],
  components: { CustomInputContainer },
  data: () => ({
    valid: false,
    term: { is_fixed: true },
    requiredRule: [(v) => !!v || 'This field is required'],
    snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
  }),
  methods: {
    toggle_dialog() {
      this.$refs.form.reset()
      this.$emit('close')
    },
    async addTerm() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post('/term', this.term, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.$emit('close')
          this.snackbar_data = {
            snackbar: true,
            text: 'Term Added Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },
  },
}
</script>
