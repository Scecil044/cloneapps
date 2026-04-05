<template>
  <v-row class="accounts_wrapper">
    <SnackBar :data="snackbar_data" />
    <ChartOfAccounts
      :data="accounts"
      :totalCount="totalCount"
      :totalPage="totalPage"
      :accountsTypes="accountsTypes"
      :account="account"
      :companyLable="companyLable"
      :companies="companies"
      :companyName="companyName"
      @add="addAccount"
      @edit="editAccount"
      @bulkUpload="bulkUpload"
      @getData="fetchChartOfAccounts"
      @emitSelected="handleSelectedCompany"
      @clearData="clearData"
      v-if="currentTab == 'all'"
    />
    <CostCenter
      v-if="currentTab == 'cost'"
      :data="cost_centers"
      :cost_center="cost_center"
      :totalCount="totalCountCostCenter"
      :totalPage="totalPageCostCenter"
      :companyLable="companyLable"
      :companies="companies"
      :companyName="companyName"
      @add="addCostCenter"
      @edit="editCostCenter"
      @delete="deleteCostCenter"
      @bulkUpload="bulkCostCenterUpload"
      @getData="fetchCostCenter"
      @emitSelected="handleSelectedCompany"
    />
    <TaxRate
      v-if="currentTab == 'tax'"
      :data="taxCodes"
      :taxCode="taxCode"
      :totalCount="totalCountTaxCode"
      :totalPage="totalPageTaxCode"
      @add="addTaxCode"
      @edit="editTaxCode"
      @delete="deleteTaxCode"
      @bulkUpload="bulkTaxRateUpload"
      @getData="fetchTaxRate"
    />
  </v-row>
</template>

<script>
import { mapState } from 'vuex'
import '@/assets/scss/_accounts.scss'
import SnackBar from '@/components/utils/SnackBar.vue'
import ChartOfAccounts from '@/components/Accounts/ChartOfAccounts.vue'
import CostCenter from '@/components/Accounts/CostCenter.vue'
import TaxRate from '@/components/Accounts/TaxRate.vue'

export default {
  layout: 'dashboard',
  components: {
    CostCenter,
    ChartOfAccounts,
    TaxRate,
    SnackBar,
  },
  data() {
    return {
      // TAX RATE DATA
      fetchingAccount: false,
      new_tax: { name: '', code: '', rate: '' },
      taxCodes: [],
      taxCode: {
        name: '',
        code: '',
        rate: '',
        _id: '',
      },
      totalCountTaxCode: 0,
      totalPageTaxCode: 0,

      // COST CENTER DATA
      new_cost_center: { name: '', code: '', description: '' },
      cost_centers: [],
      cost_center: {
        name: '',
        code: '',
        description: '',
        _id: '',
      },
      totalCountCostCenter: 0,
      totalPageCostCenter: 0,

      // CHART OF ACCOUNTS DATA
      new_account: {
        name: '',
        account_type: '',
        details_type: '',
        uid_number: '',
        description: '',
        currency: '',
        is_sub: '',
      },
      accounts: [],
      accountsTypes: [],
      account: {
        name: '',
        account_type: '',
        details_type: '',
        currency: '',
        uid_number: '',
        description: '',
        is_sub: '',
        _id: '',
      },
      totalCount: 0,
      totalPage: 0,

      // OTHERS
      snackbar_data: {
        snackbar: false,
        text: '',
        color: '',
        icon: '',
        timeout: 2000,
      },
      currentTab: 'all',
      companyLable: true,
      companies: [],
      companyName: '',
    }
  },
  mounted() {
    this.fetchConfiguration()
    if (this.companySelection.length > 1) {
      this.companyLable = true
      this.companies = this.companySelection.map((item) => {
        return item.name
      })
    } else {
      this.companyLable = false
      if (this.companySelection.length > 0) {
        this.companyName = this.companySelection[0].name
      }
    }
  },
  computed: {
    ...mapState(['companySelection']),
  },
  watch: {
    companySelection: {
      handler() {
        this.accounts = []
        this.cost_centers = []
        // this.fetchChartOfAccounts()
        // this.fetchCostCenter()
        if (this.companySelection.length > 1) {
          this.companyLable = true
          this.companies = this.companySelection.map((item) => {
            return item.name
          })
        } else {
          this.companyLable = false
          this.companyName = this.companySelection[0].name
        }
      },
    },
    deep: true,
  },
  methods: {
    handleSelectedCompany(value) {
      this.companyName = value
    },
    clearData() {
      this.accounts = []
    },
    // FETCH CONFIGURATION
    async fetchConfiguration() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`account/config`, {}, { headers: { Authorization: AuthStr } })
        .then(async (res) => {
          const { fields } = res.data
          this.accountsTypes = res.data
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },

    // CHART OF ACCOUNTS FUNCTION
    async fetchChartOfAccounts({ page, type, search, limit, status, code }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      const list = this.companySelection.map((item) => item.id)
      const payload = { company: list }
      this.cost_centers = []
      await this.$axios
        .$post(
          `account/all?type=${type}&status=${status}&code=${code}&search=${search}&limit=${limit}&page=${page}`,
          payload,
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { accounts, total_page, total_count } = res.data
          if (this.accounts.length < total_count) {
            // this.accounts = this.accounts.concat(accounts)
            this.accounts = accounts
          }
          // this.accounts = this.accounts.concat(accounts)
          this.accounts = accounts
          this.totalPage = total_page
          this.totalCount = total_count
          this.new_account = { account_type: '' }
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
          // console.log(err)
        })
    },

    async addAccount({ account, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      delete account['_id']
      let companyId = this.companySelection.find(
        (company) => company.name == this.companyName
      )
      await this.$axios
        .$post(
          `account`,
          { ...account, company: companyId.id },
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          this.account = {
            name: '',
            account_type: '',
            details_type: '',
            currency: '',
            uid_number: '',
            description: '',
            is_sub: '',
            _id: '',
          }
          this.snackbar_data = {
            snackbar: true,
            text: 'Account Added Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          this.accounts = []
          await this.fetchChartOfAccounts(values)
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

    async bulkUpload({ file, ...values }) {
      const formData = new FormData()
      formData.append('file', file)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`account/bulk-upload`, formData, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Your File Has Been Uploaded Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchChartOfAccounts(values)
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

    async editAccount({ account, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$patch('/account/by-id/' + account._id, account, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.account = {
            name: '',
            account_type: '',
            details_type: '',
            currency: '',
            uid_number: '',
            description: '',
            is_sub: '',
            _id: '',
          }
          this.snackbar_data = {
            snackbar: true,
            text: 'Account Updated Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchChartOfAccounts(values)
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

    async deleteAccount({ account, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$delete('/account/by-id/' + account._id, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Account Deleted Successfully',
            color: 'error',
            icon: 'close',
            timeout: 2000,
          }
          await this.fetchChartOfAccounts(values)
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

    // COST CENTER FUNCTIONS

    async fetchCostCenter({ page, search, limit }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.accounts = []

      const list = this.companySelection.map((item) => item.id)
      const payload = { company: list }
      await this.$axios
        .$post(
          `cost-center/all?&search=${search}&limit=${limit}&page=${page}`,
          payload,
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { costCenters, total_page, total_count } = res.data
          if (this.cost_centers.length < total_count) {
            this.cost_centers = this.cost_centers.concat(costCenters)
          }
          this.totalPageCostCenter = total_page
          this.totalCountCostCenter = total_count
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

    async addCostCenter({ costCenter, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      delete costCenter['_id']
      let companyId = this.companySelection.find(
        (company) => company.name == this.companyName
      )
      await this.$axios
        .$post(
          `cost-center`,
          { ...costCenter, company: companyId.id },
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then(async (res) => {
          this.cost_center = {
            name: '',
            code: '',
            description: '',
            _id: '',
          }
          this.snackbar_data = {
            snackbar: true,
            text: 'Cost Center Added Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchCostCenter(values)
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

    async editCostCenter({ costCenter, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$patch('/cost-center/by-id/' + costCenter._id, costCenter, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.cost_center = {
            name: '',
            code: '',
            description: '',
            _id: '',
          }
          this.snackbar_data = {
            snackbar: true,
            text: 'Cost Center Updated Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchCostCenter(values)
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

    async deleteCostCenter({ costCenter, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$delete('/cost-center/by-id/' + costCenter._id, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Account Deleted Successfully',
            color: 'error',
            icon: 'close',
            timeout: 2000,
          }
          await this.fetchCostCenter(values)
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

    async bulkCostCenterUpload({ file, ...values }) {
      const formData = new FormData()
      formData.append('file', file)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`cost-center/bulk-upload`, formData, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Your File Has Been Uploaded Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchCostCenter(values)
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

    // TAX RATE FUNCTIONS

    async fetchTaxRate({ page, search, limit }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `tax-code/all?&search=${search}&limit=${limit}&page=${page}`,
          {},
          { headers: { Authorization: AuthStr } }
        )
        .then(async (res) => {
          const { taxCodes, total_page, total_count } = res.data
          this.taxCodes = taxCodes
          this.totalPageTaxCode = total_page
          this.totalCountTaxCode = total_count
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

    async addTaxCode({ taxCode, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      delete taxCode['_id']
      await this.$axios
        .$post(`tax-code`, taxCode, { headers: { Authorization: AuthStr } })
        .then(async (res) => {
          this.taxCode = {
            name: '',
            code: '',
            rate: '',
            _id: '',
          }
          this.snackbar_data = {
            snackbar: true,
            text: 'Tax Code Added Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchTaxRate(values)
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

    async editTaxCode({ taxCode, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$patch('/tax-code/by-id/' + taxCode._id, taxCode, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.cost_center = {
            name: '',
            code: '',
            rate: '',
            _id: '',
          }
          this.snackbar_data = {
            snackbar: true,
            text: 'Tax Code Updated Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchTaxRate(values)
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

    async deleteTaxCode({ taxCode, ...values }) {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$delete('/tax-code/by-id/' + taxCode._id, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Tax Code Deleted Successfully',
            color: 'error',
            icon: 'close',
            timeout: 2000,
          }
          await this.fetchTaxRate(values)
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

    async bulkTaxRateUpload({ file, ...values }) {
      const formData = new FormData()
      formData.append('file', file)
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(`tax-code/bulk-upload`, formData, {
          headers: { Authorization: AuthStr },
        })
        .then(async (res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Your File Has Been Uploaded Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          await this.fetchTaxRate(values)
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

    changeTab(event) {
      this.currentTab = event
    },
  },
  created() {
    this.$nuxt.$on('tabChanged', ($event) => {
      this.changeTab($event)
    })
  },
  beforeDestroy() {
    this.$nuxt.$off('tabChanged')
  },
}
</script>
