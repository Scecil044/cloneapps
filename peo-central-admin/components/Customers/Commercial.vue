<template>
  <div class="vs_custom py-8">
    <v-progress-linear class="mb-2" indeterminate v-if="loadingClient"></v-progress-linear>
    <template v-if="commercialsTable">
      <!-- section header -->
      <div class="mb-8 d-flex justify-center">
        <v-btn-toggle
          v-model="employment_type"
          class="overflow-hidden"
          rounded
          mandatory
        >
          <v-btn
            small
            class="rounded-0 border-0"
            :class="employment_type === 'DES' ? 'indigo white--text' : ''"
            value="DES"
          >
            DES
          </v-btn>
          <v-btn
            small
            class="rounded-0 border-0"
            :class="employment_type === 'EES' ? 'indigo white--text' : ''"
            value="EES"
          >
            EES
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- table -->
      <div class="rounded-0 mb-8">
        <h4 class="mb-4">
          <v-btn elevation="0" class="mx-2 full--rounded" fab small>
            <v-icon> mdi-cash-refund</v-icon>
          </v-btn>
          Upfront costs ({{ employment_type }})
        </h4>
        <v-data-table
          :items="commercialsTable.upfront_costs"
          hide-default-footer
          elevation="0"
        >
          <template v-slot:item="{ item, index }">
            <tr>
              <td>
                <p style="text-transform: capitalize">{{ item.label }}</p>
              </td>
              <td align="right">
                <div class="d-flex align-center justify-end">
                  <span>{{ item.value }}</span>
                  <div class="ml-2">
                    <v-icon
                      small
                      class="mr-2"
                      @click="openEditDialog(item, 'upfront_costs', index)"
                      >mdi-pencil</v-icon
                    >
                    <v-icon
                      small
                      @click="deleteItem('upfront_costs', item.slug, index)"
                      >mdi-delete</v-icon
                    >
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <template v-slot:footer>
            <div class="d-flex my-6 align-center">
              <v-divider class="mr-4"></v-divider>
              <v-btn
                elevation="0"
                outlined
                left
                @click="openAddDialog('upfront_costs')"
              >
                <v-icon small class="mr-2">mdi-bank-plus</v-icon>
                Add additional costs
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>

      <div class="rounded-0 mb-8">
        <h4 class="mb-4">
          <v-btn elevation="0" class="mx-2 full--rounded" fab small>
            <v-icon> mdi-calendar-month</v-icon>
          </v-btn>
          Monthly costs ({{ employment_type }})
        </h4>
        <v-data-table
          :items="commercialsTable.monthly_costs"
          hide-default-footer
          elevation="0"
        >
          <template v-slot:item="{ item, index }">
            <tr>
              <td><p style="text-transform: capitalize">{{ item.label }}</p></td>
              <td align="right">
                <div class="d-flex align-center justify-end">
                  <span>{{ item.value }}</span>
                  <div class="ml-2">
                    <v-icon
                      small
                      class="mr-2"
                      @click="openEditDialog(item, 'monthly_costs', index)"
                      >mdi-pencil</v-icon
                    >
                    <v-icon
                      small
                      @click="deleteItem('monthly_costs', item.slug, index)"
                      >mdi-delete</v-icon
                    >
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <template v-slot:footer>
            <div class="d-flex my-6 align-center">
              <v-divider class="mr-4"></v-divider>
              <v-btn
                elevation="0"
                @click="openAddDialog('monthly_costs')"
                outlined
                left
              >
                <v-icon small class="mr-2">mdi-bank-plus</v-icon>
                Add additional costs
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </template>

    <!-- dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-form ref="formClientCosts">
        <v-card class="pa-4">
          <v-card-title class="d-flex mb-2">
            <span class="headline font-weight-bold"
              >{{ activeDialog }} Item</span
            >
            <v-divider class="ms-4"></v-divider>
          </v-card-title>
          <v-card-text>
            <v-container class="pa-0">
              <v-row class="m-0">
                <v-col class="pa-0" cols="12">
                  <v-text-field
                    v-model="editedItem.label"
                    @change="handleChange"
                    label="Label"
                    :rules="valueRule"
                  ></v-text-field>
                </v-col>
                <v-col class="pa-0" cols="12" v-if="editedItem.label === 'Security Deposit'">
                  <v-select
                    v-model="editedItem.value"
                    :items="['1 month', '2 months']"
                    label="Value"

                  ></v-select>
                </v-col>
                <v-col class="pa-0" cols="12" v-else>
                  <v-text-field
                    v-model="editedItem.value"
                    label="Value"
                    :rules="costRule"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDialog"
              >Cancel</v-btn
            >
            <v-btn
              color="blue darken-1"
              elevation="0"
              class="white--text"
              @click="saveEdit"
              :loading="isUpdating"
              >Save</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    selectedCustomer: String,
  },
  data() {
    return {
      employment_type: 'DES',
      dialog: false,
      headers: [
        {
          text: 'Dessert (100g serving)',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: 'Calories',
          value: 'calories',
          align: 'end',
          sortable: false,
        },
      ],
      commercialsTable: null,
      loadingClient: true,
      clientData: {},
      editedItem: {},
      editedIndex: -1,
      editedCategory: '',
      activeDialog: 'Add',
      valueRule: [(v) => !!v || 'This field is required'],
      costRule: [
        (v) => !!v || 'This field is required',
        (v) => !!/^\d+(\.\d{1,2})?$|^As actuals$|^[0-9]{1,2} months employee's salary$/.test(v) || "Should be a currency digit or 'As actuals' or 'x months employee's salary' "
      ],
      // valueRule: (v) => v.test(/^([0-9]*[\.]{0,2})|(As actuals)$/),
      debounceFunc: null,
      isUpdating: false
    }
  },
  methods: {
    async fetchClient() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$get(`/companies/detailsonid/${this.selectedCustomer}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          // this.clientData = response[0]
          const { upfront_costs, upfront_costs_ees, monthly_costs, monthly_costs_ees } = response[0]

          this.clientData.upfront_costs = upfront_costs || {}
          this.clientData.upfront_costs_ees = upfront_costs_ees || {}
          this.clientData.monthly_costs = monthly_costs || {}
          this.clientData.monthly_costs_ees = monthly_costs_ees || {}

          this.commercialsTable = this.convertToTableData(this.clientData)
        })

      this.loadingClient = false
    },

    convertToTableData(data) {

      const temp = {}

      //append items to custom table data
      const prefill = (_val, _key) => {
        Object.entries(_val).forEach(([ikey, ivalue]) => {
          temp[`${_key}`].push({
            label: ikey.split('_')?.join(' '),
            value: ivalue,
            slug: ikey,
          })
        })
      }

      temp['upfront_costs'] = []
      temp['monthly_costs'] = []

      Object.entries(data).forEach(([key, value]) => {
        if (this.employment_type === 'DES') {
          if (key === 'upfront_costs') {
            prefill(value, key)
          }
          if (key === 'monthly_costs') {
            prefill(value, key)
          }
        } else {
          if (key === 'upfront_costs_ees') {
            prefill(value, 'upfront_costs')
          }
          if (key === 'monthly_costs_ees') {
            prefill(value, 'monthly_costs')
          }
        }
      })
      return temp
    },

    handleChange() {},

    openEditDialog(item, category, index) {
      this.activeDialog = 'Edit'
      this.editedItem = { ...item }
      this.editedCategory = category
      this.editedIndex = index
      this.dialog = true
    },

    closeDialog() {
      this.dialog = false
      this.editedItem = {}
    },

    openDeleteDialog() {},

    generateSlug() {
      const lab = this.editedItem.label.split(' ')
      //append undescore to slug
      return lab.reduce((v, i) => {
        //as long as it is not the last item
        if (i !== lab.length - 1) {
          return i === 0 ? i : v + '_' + i
        }
      })
    },

    appendEmploymentType(category) {
      return this.employment_type === 'EES' ? `${category}_ees` : category
    },

    async saveEdit() {
      //add ees conditionally to category name
      if (!this.$refs.formClientCosts.validate()) return

      const categ = this.appendEmploymentType(this.editedCategory)

      if (this.activeDialog === 'Edit') {
        //remove
        delete this.clientData[categ][this.editedItem.slug]
      }
      // new / re-add
      if (!this.clientData[categ]) this.clientData[categ] = {}
      this.clientData[categ][this.generateSlug()] = this.editedItem.value
      this.commercialsTable = this.convertToTableData(this.clientData)

      await this.submitForm()

      this.closeDialog()
    },

    deleteItem(category, slug) {
      const categ = this.appendEmploymentType(category)

      delete this.clientData[categ][slug]
      this.commercialsTable = this.convertToTableData(this.clientData)
      this.submitForm(true)
    },

    openAddDialog(category) {
      this.activeDialog = 'Add'
      this.editedCategory = category
      this.editedItem = {
        label: '',
        value: '',
      }
      this.dialog = true
    },

    async submitForm(deleting = false) {
      if(deleting) this.loadingClient = true
      this.isUpdating = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      console.log(AuthStr, "auth stru")
      // http://localhost:4100/companies/66a797308e02804dae161c49
      await this.$axios
        .$patch(`/companies/${this.selectedCustomer}`, this.clientData, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
        })

      this.isUpdating = false
      if(deleting) this.loadingClient = false
    }
  },
  mounted() {
    this.fetchClient()
  },
  watch: {
    employment_type() {
      this.commercialsTable = this.convertToTableData(this.clientData)
    },
  },
}
</script>
