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
             {{ is_deleting ? 'Confirm Deletion': 'Add Product' }}</span
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

        <v-card-text v-if="is_deleting" class="tw-px-6 tw-py-8">
          Confirm That you want to delete <span class="tw-underline tw-font-semibold tw-blue-500">{{ product?.name  }}</span>. This action cannot be undone
        </v-card-text>
        <v-card-text v-else class="tw-px-6 tw-py-8">
          <v-row>
            <v-col cols="12" class="pl-0 pb-0">
              <CustomInputContainer label="Name" :mandatory="true">
                <div slot="input">
                  <v-text-field
                    class="inputField"
                    v-model="productObj.name"
                    solo
                    dense
                    :rules="main_rule"
                  />
                </div>
              </CustomInputContainer>
            </v-col>
            <v-col cols="12" class="pl-0 pb-0">
              <CustomInputContainer :mandatory="true" label="Product Description">
                <div slot="input">
                  <v-textarea
                    v-model="productObj.description"
                    :rules="main_rule"
                    dense
                    outlined
                    required
                  ></v-textarea>
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <!-- <div class="d-flex align-center justify-end"> -->
          <v-btn
            flat
            text
            :disabled="loading"
            @click="handleClose"
            large
            ><span class="">Cancel</span></v-btn
          >

          <v-btn
            :color="is_deleting ? 'red' : 'primary'"
            outlined
            large
            :disabled="loading"
            :loading="loading"
            @click="saveProducts"
            >{{ is_deleting ? 'Delete Product' : is_edit ? 'Save Changes' : 'Create Product'}}</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'

export default {
  name: 'add-invoice-products',
  components: {
    CustomInputContainer
  },
  props: ['open', 'product', 'is_edit', 'products', 'is_deleting'],
  watch: {
    open(val) {
      if (val) {
        if (this.is_edit) {
          this.productObj = {
            name: this.product.name,
            description: this.product.description,
          }
        } else {
          this.productObj = {
            name: '',
            description: '',
          }
        }
      }
    },
  },
  data() {
    return {
      validTask: false,
       productObj: {
        name: '',
        description: '',
      },
      loading: false,
      main_rule: [(v) => !!v || 'This field is required'],
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    async saveProducts() {
      try {
        this.loading = true

        const isValid = this.$refs.taskForm.validate()
        if (!isValid) return

        // const productNames = this.products
        //   .filter((product) => product.name.trim() !== '')
        //   .map((product) => product.name.trim())
        let products = this.products.map(pr => {
          if (this.is_edit) {
            if (this.product.name === pr.name && this.product.description === pr.description) {
              return this.productObj;
            }
            return { name: pr.name, description: pr.description };
          } else {
            return { name: pr.name, description: pr.description };
          }
        });

        if (!this.is_edit && !this.is_deleting) products.push(this.productObj)

        if (products.length === 0) {
          return
        }

        if (this.is_deleting) {
          products = products.filter((pr) => !(this.product.name === pr.name && this.product.description === pr.description))
        }

        await this.$axios.put('configuration/update/products/and/services', {
          products_and_services: products,
        })

      } catch (error) {
        console.error('Error saving products:', error)
      } finally {
        this.loading = false
        this.$emit('reload')
        this.handleClose()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
</style>
