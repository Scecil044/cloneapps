<template>
  <v-row>
    <!-- form column -->
    <v-col sm="12" md="12" lg="12">
      <v-card color="card_bg" class="carddd" id="card"
        style=" max-height: 92vh !important; min-height: 92vh !important;  overflow: auto;  "><v-row>
          <v-col sm="12" md="12" lg="12" class="d-flex align-right justify-end">
            <v-img @click="close()" src="/dashboard/close.svg" style="cursor:pointer;" justify-self="end" max-width="25"
              height="auto" contain></v-img>
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="12" md="12" lg="12">

            <div class="d-flex align-center justify-space-between overflow-autos">
              <Tabs :custom_class="'tabs_wrapper_alt'" @tabValue="handleTabValue($event)" :data="customer_tabs.Customer" :tab_value="tab_current_val" />
            </div>
            <hr class="mb-3" style="color: #e2e7f1 !important" />
            <CustomerDetails :selectedCustomer="selectedCustomer" v-if="tab_current_val == 'all'" />
            <EmployeesDetails :selectedCustomer="selectedCustomer" v-if="tab_current_val == 'employees'" />
            <Commercial :selectedCustomer="selectedCustomer" v-if="tab_current_val == 'commercial'" />
            <customerDocuments :selectedCustomer="selectedCustomer" v-if="tab_current_val == 'documents'" />
            <customerInvoices :selectedCustomer="selectedCustomer" v-if="tab_current_val == 'invoices'" />
            <customerInsight :selectedCustomer="selectedCustomer" v-if="tab_current_val == 'insight'" />
            <customerPayroll :selectedCustomer="selectedCustomer" v-if="tab_current_val == 'payroll'" />
          </v-col>
        </v-row>

      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import Tabs from '@/components/Tabs/index.vue'
import CustomerDetails from '@/components/Customers/CusDetails.vue'
import EmployeesDetails from '@/components/Customers/EmployeesDetails.vue'
import customerInvoices from '@/components/Customers/CustomerInvoices.vue'
import customerInsight from '@/components/Customers/CustomerInsight.vue'
import customerPayroll from '@/components/Customers/customerPayroll.vue'
import customerDocuments from '@/components/Customers/CustomerDocuments.vue'
import Commercial from '@/components/Customers/Commercial.vue'
export default {
  components: {
    Tabs,
    CustomerDetails,
    EmployeesDetails,
    customerDocuments,
    customerInvoices,
    customerInsight,
    customerPayroll,
    Commercial
  },
  props: {
    selectedCustomer: String,
    tab_current: String,
  },

  data() {
    return {
      //Tabs Data
      tab_current_val: this.tab_current,
      customer_tabs: {
        Customer: [
          { title: 'Details', value: 'all' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Employees', value: 'employees' },
          { title: 'Documents', value: 'documents' },
          { title: 'Invoices', value: 'invoices' },
          { title: 'Insight', value: 'insight' },
          { title: 'Payroll Schedule', value: 'payroll' },
        ],
      },
    }
  },
  mounted() {
  },
  methods: {
    //Tabs
    close() {
      this.$emit('close', {})
    },
    handleTabValue(payload) {
      this.tab_current_val = payload
      this.$emit('EmployerTabClicked', payload)
    }
  },
}
</script>