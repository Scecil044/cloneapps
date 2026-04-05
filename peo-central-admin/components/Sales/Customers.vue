<template>
  <v-row class="customers_wrapper">
    <SnackBar :data="snackbar_data" />
    <CustomerList
      :data="customers_list"
      :customerId="customerId"
      :type="type"
      @getInfo="getCustomerInfo"
      @handleToggleCustomerForm="handleToggleCustomerForm"
      @getData="fetchCustomers"
    />
    <CustomerDetails
      v-if="toggleCustomerForm === false"
      :data="selectedCustomer"
      @editCustomerHandler="editCustomerHandler"
      @submitDoc="submitDoc"
    />
    <CustomerForm
      v-if="toggleCustomerForm === true"
      :customer="customer"
      :type="type"
      :companyLable="companyLable"
      :companies="companies"
      :companyName="companyName"
      @submitForm="submitForm"
      @handleToggleCustomerForm="handleToggleCustomerForm"
      @emitSelected="handleSelectedCompany"
    />
  </v-row>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
import '@/assets/scss/_customers.scss'
import SnackBar from '~/components/utils/SnackBar.vue'
import CustomerList from '~/components/Customers/CustomerList.vue'
import CustomerDetails from '~/components/Customers/CustomerDetails.vue'
import CustomerForm from '~/components/Customers/CustomerForm.vue'
const { first } = require('lodash')

export default {
  layout: 'dashboard',
  components: { SnackBar, CustomerDetails, CustomerList, CustomerForm },
  data() {
    return {
      toggleCustomerForm: false,
      type: '',
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },
      customers_list: [],
      customer: { primary_contact: {}, additional_contact: {} },
      selectedCustomer: {},
      customerId: null,
      documents: [],
      logo: '',
      limit: 8,
      companyLable: true,
      companies: [],
    }
  },
  computed: {
    ...mapState(['companySelection']),
  },
  created() {
    this.$nuxt.$on('attendanceScrollerObserver', () => {
      this.fetchCustomers({ limit: this.limit, page: this.page })
    })
  },
  watch: {
    companySelection: {
      handler() {
        this.customers_list = []
        this.selectedCustomer = {}
        this.fetchCustomers({ limit: 8 })
        if (this.companySelection.length > 1) {
          this.companies = this.companySelection
        } else {
          this.companies = this.companySelection[0]
        }
      },
    },
    deep: true,
  },
  methods: {
    ...mapMutations(['setCustomers']),
    handleSelectedCompany(value) {
      this.companyName = value
    },
    async fetchCustomers({ limit }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const list = this.companySelection.map((item) => item.id)
      // const list = this.companySelection
      const payload = { company: list }
      await this.$axios
        .$post(`customer/all?search=&limit=${limit}&page=0`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          const { customers, total_count } = res.data
          if (customers && customers.length > 0) {
            const id = first(customers)._id
            id && this.getCustomerInfo(id)
            this.customers_list = customers
            if (this.customers_list.length < total_count) {
              this.limit += 8
            }
          }
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },
    async fetchAllCustomers() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let payload = {
        company: this.companySelection.map((item) => item.id),
      }
      await this.$axios
        .$post('customer/list', payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.setCustomers(res.data.customers)
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },

    async getCustomerInfo(id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          '/customer/by-id/' + id,
          {},
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then(async (res) => {
          const { customer } = res.data
          this.selectedCustomer = customer
          this.customerId = customer.id
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },

    async uploadImage(image) {
      var fd = new FormData()
      var result
      fd.append('a', image)
      await this.$axios
        .$post('/customer/upload-image', fd, {
          headers: {
            Authorization: this.AuthStr,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(async (res) => {
          result = res
        })
        .catch((err) => console.log(err.message))
      return result
    },

    async submitForm(data) {
      let logoUrl
      let docUrls
      logoUrl = data.logo && (await this.uploadImage(data.logo))
      docUrls =
        data.documents &&
        (await Promise.all(
          data.documents.map(async (doc) => {
            let url = await this.uploadImage(doc)
            return url
          })
        ))
      // Create the customer
      await this.addNewCustomer(logoUrl, docUrls, data.type)
      await this.fetchAllCustomers()
    },

    async submitDoc(documents) {
      let docUrls = await Promise.all(
        documents.map(async (doc) => {
          let url = await this.uploadImage(doc)
          return url
        })
      )
      const docList = [...this.selectedCustomer.documents, ...docUrls]
      this.selectedCustomer.documents = docList
      // Update the customer
      await this.editCustomer(this.selectedCustomer)
    },

    async addNewCustomer(logoUrl, docUrls, type) {
      if (type == 'add') {
        const payload = {
          ...this.customer,
          logo: logoUrl,
          documents: docUrls,
          company: this.companyName,
          city: this.companySelection.filter(
            (item) => item.id === this.companyName
          )[0].city,
        }
        // console.log('company Name', this.companyName)
        const AuthStr = 'Bearer '.concat(this.$store.state.token)
        await this.$axios
          .$post(`customer`, payload, {
            headers: { Authorization: AuthStr },
          })
          .then(async (res) => {
            this.customer = { primary_contact: {}, additional_contact: {} }
            this.toggleCustomerForm = false
            this.snackbar_data = {
              snackbar: true,
              text: 'Customer Added Successfully',
              color: 'success',
              icon: 'check',
              timeout: 2000,
            }
            await this.fetchCustomers({ limit: 8 })
          })
          .catch((err) => {
            this.snackbar_data = {
              snackbar: true,
              text: 'something went wrong',
              color: 'danger',
              icon: 'check',
              timeout: 2000,
            }
          })
      } else {
        const payload = logoUrl.length
          ? { ...this.customer, logo: logoUrl }
          : this.customer
        await this.editCustomer(payload)
      }
    },

    async editCustomer(customer) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$patch('/customer/by-id/' + this.customerId, customer, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.toggleCustomerForm = false
          this.snackbar_data = {
            snackbar: true,
            text: 'Customer Updated Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          this.customer = { primary_contact: {}, additional_contact: {} }
          await this.fetchCustomers({ limit: 8 })
        })
        .catch((err) => {
          console.log(err)
          this.snackbar_data = {
            snackbar: true,
            text: 'something went wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })
    },

    editCustomerHandler() {
      this.customer = this.selectedCustomer
      this.type = 'edit'
      this.toggleCustomerForm = !this.toggleCustomerForm
    },

    handleToggleCustomerForm(type) {
      this.type = type
      this.customer = { primary_contact: {}, additional_contact: {} }
      this.toggleCustomerForm = !this.toggleCustomerForm
      if (this.companySelection.length > 1) {
        this.companyLable = true
      } else {
        this.companyLable = false
      }
    },
  },
  mounted() {
    if (this.companySelection.length > 1) {
      this.companies = this.companySelection
    } else {
      this.companies = this.companySelection[0]
    }
  },
}
</script>
