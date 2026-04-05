<template>
  <v-row class="px-0 py-0">
    <v-col cols="12">
      <!-- style="min-height: 90vh !important" -->
      <v-card color="card_bg" id="card">
        <v-row class="">
          <v-col cols="12">
            <div class=" d-flex align-center justify-space-between ">
              <div slot="input" style="width: 20% !important;">
                    <v-select
                      :items="leaves"
                      placeholder="Select Leaves"
                      solo
                      dense
                      hide-details
                      multiple
                      class="proposalDialog_date_field2"
                      :menu-props="{ offsetY: 50 }"
                      v-if="leaves.length >= 1"
                      append-icon="fa-chevron-down"
                    >
                    </v-select>

                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Company
                    </p>
                  </div>
          
                <span class="span_data">
            for the month of
        </span>
        <div slot="input" style="width: 20% !important;">
                    <v-select
                    v-model="months"
                    :items="month"
                      placeholder="Select Month"
                      solo
                      dense
                      hide-details
                      multiple
                      class="proposalDialog_date_field2"
                      :menu-props="{ offsetY: 50 }"
                      v-if="leaves.length >= 1"
                      append-icon="fa-chevron-down"
                    >
                    </v-select>

                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Company
                    </p>
                  </div>
           
          
          <div slot="input" style="width: 20% !important;">
                    <v-select
                    v-model="year"
              :items="years"
                      placeholder="Select Year"
                      solo
                      dense
                      hide-details
                      multiple
                      class="proposalDialog_date_field2"
                      :menu-props="{ offsetY: 50 }"
                      v-if="leaves.length >= 1"
                      append-icon="fa-chevron-down"
                    >
                    </v-select>

                    <p v-else class="error--text mb-5 mt-5">
                      Please Select Company
                    </p>
                  </div>
           
           
          <v-checkbox
                    color="accent4"
                    label="Show Approved"
                    dense
                  />

            </div>
           
          </v-col>
           
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import '@/assets/scss/utils/_leadTimeLine.scss'
import checkBoxSvg from '@/assets/images/icons/check-box.svg'
import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'

export default {
  components: {
    checkBoxSvg,
    CustomInputContainer,
    LightArrow,
  },
  data() {
    return {
      selected: 'All Leaves',
      months: 'Select',
      year: 'Select',
      leaves: ['All Leaves', 'Annual Leave', 'Sick Leave', 'Half Leave'],
      month: ['January', 'February', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December',],
      all_leaves_menu: [
        // { title: 'Invoice', value: 'new invoice', locked: false },
        { title: 'All Leave', value: 'all', locked: false },
        { title: 'Sick Leave', value: 'sick', locked: false },
        { title: 'Annual Leave', value: 'annual', locked: false },
      ],
    }
  },
  methods: {},
  computed:{
    years () {
      const year = new Date().getFullYear()
      return Array.from({length: year - 1900}, (value, index) => 1901 + index)
    }
  },
}
</script>
