<template>
  <v-dialog v-model="open" max-width="500px" min-width="350px" persistent>
    <v-card class="rounded-xl pa-0 pt-0" flat max-height="600" min-height="200">
      <v-form ref="taskForm" v-model="validTask" lazy-validation>
        <v-row class="tw-py-3 tx-pr-3">
          <v-card-title class="py-0">
            <v-img
              src="/shift/build.svg"
              max-width="fit-content"
              height="fit-content"
              class="mr-2"
              contain
            ></v-img>
            <span
              class="darkBlue-heading-text font-weight-normal subHeadingFontSize"
            >
              Add Custom Term</span
            >
          </v-card-title>
          <v-spacer />
          <v-btn
            @click="handleClose"
            outlined
            icon
            color="red accent-4"
            class="tw-mr-3"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-divider></v-divider>

        <v-card-text class="tw-px-6 tw-py-8">
          <v-row>
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer label="Term Name" :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    v-model="term.name"
                    solo
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="pl-0 py-0">
              <CustomInputContainer :mandatory="true" label="No. of Days">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    v-model="term.days"
                    dense
                    type="number"
                    solo
                    :rules="main_rule"
                  ></v-text-field>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <!-- <div class="d-flex align-center justify-end"> -->
          <v-btn flat text :disabled="loading" @click="handleClose" large
            ><span class="">Cancel</span></v-btn
          >

          <v-btn
            color="primary"
            outlined
            large
            :disabled="loading"
            :loading="loading"
            @click="addTerm"
            >Add Term</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

export default {
  name: 'billing-add-custom-term',
  components: {
    CustomInputContainer,
  },
  props: ['open'],
  watch: {
    open(val) {
      if (val) {
        this.term = {
          name: '',
          days: '',
        }
      }
    },
  },
  data() {
    return {
      validTask: false,
      term: {
        name: '',
        days: '',
      },
      loading: false,
      main_rule: [(v) => !!v || 'This field is required'],
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    requestReload() {
      this.$emit('reload')
    },
    async addTerm() {
      try {
        this.loading = true
        if (this.$refs.taskForm.validate()) {
          await this.$axios.post('/terms', { ...this.term, is_fixed: true })

          this.requestReload()
          this.handleClose()
        }
      } catch (error) {
        console.log('Error adding term: ', error?.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
