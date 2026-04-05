<template lang="">
    <AddLeadsForm @close="closeLead" :handleModel="closeLead" :is-page='true' />
</template>

<script>
import '@/assets/scss/utils/_newLead.scss'
import AddLeadsForm from '@/components/EditModel/editLeads.vue'
import countries from 'countries-list'
import _ from 'lodash'

export default {
  layout: 'dashboard',
  components: {
    AddLeadsForm,
  },
  data() {
    return {
      employees: [],
      employers: [],
      comPage: 0,
      countryCode: [],
      countryList: {},
      companyDetails: {},
      contact_person: {
        name: '',
        phone: '',
        email: '',
      },
      loading: false,
      phoneNumberText: '',
      company_id: '',
      company_details: {
        email: '',
        phone: '',
      },
      leadsObj: {
        client_type: 'new client',
        company_id: '',
        contact_person: {},
        company_details: {},
      },
    }
  },
  methods: {
    closeLead() {
      this.$router.push('/leads')
    },
    async getEmployeesList() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$get(`/users/admin/users?module=leads`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.employees = response
        })
    },
    async getEmployersList() {
      this.comPage++;
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      await this.$axios.$post(`/companies/list/dropdown?page=${this.comPage}&limit=${10000}`, {}, { headers: { Authorization: AuthStr } })
        .then((response) => {
          const lists = response;
          this.employers = [...this.employers, ...lists];

          // this.employers = response
        })
    },
    getCompanyDetails(company_id) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      this.$axios.$get(`/companies/comp/${company_id}`, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.companyDetails = response
          this.contact_person.name = this.companyDetails.contact_person[0].name
          this.contact_person.phone = this.companyDetails.contact_person[0].phone ? this.companyDetails.contact_person[0].phone : '-'
          this.contact_person.email = this.companyDetails.contact_person[0].email

        })
    },
    async createNewLeads() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      try {
        this.loading = true

        if (this.leadsObj.client_type == 'existing client') {
          this.leadsObj.company_id = this.company_id
          this.leadsObj.contact_person = this.contact_person
        } else {
          this.leadsObj.client_type = 'new client'
          this.company_details.phone = this.phoneNumberText + this.company_details.phone
          this.leadsObj.company_details = this.company_details
          this.leadsObj.contact_person = {
            email: this.company_details.email,
            name: this.contact_person.name,
            phone: this.company_details.phone,
          }
        }

        await this.$axios.$post('/leads/', this.leadsObj, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.loading = false
            this.$nuxt.$emit('fetchLeadsList', true)
            this.closeLead()
          })
      } catch (error) {
        console.log('Error happend')
      }
    }
  },
  mounted() {
    this.getEmployeesList()
    this.getEmployersList()

    for (var [key, value] of Object.entries(this.countryList)) {
      this.countryCode.push(value)
    }
  },
  computed: {
    computedCountryList() {
      const countryCodes = Object.keys(countries.countries);
      const countryNames = countryCodes.map(code => countries.countries[code].name);
      return _.orderBy(countryNames, [], ['asc']);
    },
  }
}
</script>
