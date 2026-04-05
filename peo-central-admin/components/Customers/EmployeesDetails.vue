<template >
  <div>
    <v-row v-if="!addNewEmployee" >
      <!-- employee details dialog -->
      <v-dialog v-model="ShowDialog" width="45vw" content-class="employee_dialog" scrollable>
        <div class="dialog_emp pt-7" style="overflow-y: auto">
          <EmployeeDialog :selectedEmployee="selectedEmployee" :selectedCustomer="selectedCustomer" v-if="showDetails"/>
        </div>

      </v-dialog>

      <v-col cols="12" class="pt-0 pb-0">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h5>{{ employeesList.length }} Employees</h5>
          </div>
          <template>
            <v-btn class="tall__btn" color="primary" @click="addNewEmployee = true">Add Employee</v-btn>
          </template>
        </div>
      </v-col>
      <v-col cols="12" class="pt-0 pb-0">

        <EmployeeCard @employeeClickedId="employeeClickID($event)" :selectedCustomer="selectedCustomer"
          :EmployeeDialog="showEmployeeDialog" :employeeCardData="employeesList" />
      </v-col>
    </v-row>

    <NewEmployee v-if="addNewEmployee" :selectedCustomer="selectedCustomer" @close="closeAddNewEmployeeDialog()" />
  </div>
</template>
<script>
import '@/assets/scss/utils/_employeeDialog.scss'
import EmployeeCard from '~/components/Cards/EmployeeCard/index.vue'
import EmployeeDialog from '@/components/EmployeeDialog/index.vue'
import Observer from '~/components/Observer.vue'
import NewEmployee from '~/components/Employees/addNewEmployees.vue'

export default {
  components: {
    EmployeeCard,
    EmployeeDialog,
    Observer,
    NewEmployee
  },
  props: { selectedCustomer: String },
  data() {
    return {
      ShowDialog: false,
      employeesList: [],
      selectedEmployee: '',
      // EmployeeDetails: [],
      addNewEmployee: false,
      showDetails: false
    }
  },
  methods: {
    employeeClickID($event) {
      this.showDetails = false
      setTimeout(() => {
        this.selectedEmployee = $event
        this.showDetails = true
      }, 1);

      // const AuthStr = 'Bearer '.concat(this.$store.state.token)
      // this.$axios.$post(`/users/employee/details/${this.selectedEmployee}`, { headers: { Authorization: AuthStr } })
      // .then((response) => {
      //   this.EmployeeDetails = response;
      // })
      // .catch((err) => console.log(err))
    },
    showEmployeeDialog() {
      this.ShowDialog = !this.ShowDialog
    },
    async intersectedEmployees(customer_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/users/employees/companyid/${customer_id}`, { headers: { Authorization: AuthStr } })
      .then((response) => {
        this.employeesList = response;
      })
      .catch((err) => console.log(err))
    },
    routeToOnboarding(){
      this.$router.push('/Onboarding/new-employee')
    },
    async closeAddNewEmployeeDialog(){
      this.addNewEmployee = false
      await this.intersectedEmployees(this.selectedCustomer)
    }
  },
  mounted() {
    // console.log(this.selectedCustomer ,'---------selectedCustomer Employees Tab')
    this.intersectedEmployees(this.selectedCustomer)
  },
}
</script>
