<template>
  <div style="width: 100%">
    <v-row class="row1">
      <!-- Employers List column (12 - 5) -->
      <v-col cols="12">
        <v-card color="card_bg" id="card" style="min-height: 90vh !important">
          <v-card-text id="card-text" style="margin-top: 0 !important">
            <!-- Customer Card -->
            <CustomerCard :AllCustomers="AllCustomers" @customerClicked="customerID($event)" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import '@/assets/scss/utils/_customerDataDetails.scss'
import SnackBar from '~/components/utils/SnackBar.vue'
import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
// import CusList from '~/components/Customers/CusList.vue'
import CustomerCard from '~/components/Customers/CustomerCard.vue'

export default {
  components: {
    SnackBar,
    DarkArrow,
    // CusList,
    CustomerCard,
  },
  props: {
    AllCustomers: Function,
  },

  data() {
    return {

    }
  },
  methods: {
    // Clicked Card Id
    customerID($event) {
      this.$emit('SelectedCustomer', $event);
    },
  },
}
</script>
