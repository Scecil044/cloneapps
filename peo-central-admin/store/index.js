import Vuex from 'vuex'
import Cookie from 'js-cookie'
const CryptoJS = require('crypto-js')

// Helper function to safely decrypt and parse JSON
function safeDecrypt(encryptedStr, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedStr, key)
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedStr)
  } catch (e) {
    console.error('Decryption failed:', e.message)
    return null
  }
}

const createStore = () => {
  return new Vuex.Store({
    state: {
      sendEmailForm: 'leads',
      progressStep: 0,
      renewalReqConfirm: false,
      userRole: '',
      selectedCompany: '',
      token: null,
      refreshToken: null,
      firstTimeLogin: false,
      user: {},
      productAccess: [],
      Companies: [],
      hi: false,
      welcomeDialog: false,
      addCompany: false,
      companySelection: [],
      companySelectionState: false,
      parentSelectedCompany: {},
      parentSelectedCompanyId: '',
      parentSelectedCompanyName: '',
      customers: [],
      is_show_loader: false,
      conf: null,
      users: null,
      userInfo: {},
      initialLoadDone: false,
      lastFetchTime: null,
      invoice_add_edit_toggler: false,
    },
    mutations: {
      setSendEmailForm(state, payload) {
        state.sendEmailForm = payload
      },
      setProgressStep(state, payload) {
        state.progressStep = payload
      },
      setRenewalReqConfirm(state, payload) {
        state.renewalReqConfirm = payload
      },
      setUserInfo(state, payload) {
        state.userInfo = payload
      },
      setToken(state, payload) {
        state.token = payload
      },
      setRefreshToken(state, payload) {
        state.refreshToken = payload
      },
      setUser(state, payload) {
        state.user = payload
      },
      setUserStatus(state, payload) {
        state.userRole = payload
      },
      setSelectedCompany(state, payload) {
        state.selectedCompany = payload
      },
      setShowLoader(state, payload) {
        state.is_show_loader = payload
      },
      setInvoiceAddEditToggler(state, payload) {
        state.invoice_add_edit_toggler = payload
      },
      encryptLocalStorage(state, payload) {
        if (process.client) {
          localStorage.setItem(payload.key, payload.value)
        }
      },
      setSessionStorage(state, payload) {
        if (process.client) {
          sessionStorage.setItem(payload.key, payload.value)
        }
      },
      setProductAccess(state, payload) {
        state.productAccess = payload
      },
      setFirstTimeLogin(state, payload) {
        state.firstTimeLogin = payload
      },
      setParentSelectedCompany(state, payload) {
        state.parentSelectedCompany = payload
        state.parentSelectedCompanyId = payload.id
        state.parentSelectedCompanyName = payload.company_name
      },
      setWelcomeDialog(state, payload) {
        state.welcomeDialog = payload
      },
      setAddCompany(state, payload) {
        state.addCompany = payload
      },
      setHiValue(state, payload) {
        state.hi = payload
      },
      setAllCompanies(state, payload) {
        const data = safeDecrypt(
          payload.companies,
          'a3477557f0f7f078c880186b56564a5a508e1611b11a79ccff5a7adbdf9a1c8d'
        )
        if (data) state.Companies = data
      },
      setConf(state, payload) {
        const data = safeDecrypt(
          payload.conf,
          'a3477557f0f7f078c880186b56564a5a508e1611b11a79ccff5a7adbdf9a1c8d'
        )
        if (data) state.conf = data
      },
      setUsers(state, payload) {
        if (payload?.users) {
          const data = safeDecrypt(
            payload.users,
            'a3477557f0f7f078c880186b56564a5a508e1611b11a79ccff5a7adbdf9a1c8d'
          )
          if (data) state.users = data
        }
      },
      setCompanySelection(state, payload) {
        state.companySelection = payload
        state.companySelectionState = !state.companySelectionState

        let companies = ''
        payload.forEach((element) => {
          companies += ',' + element.id
        })
        Cookie.set('selected-company', companies, { expires: 100 })
      },
      setCustomers(state, payload) {
        state.customers = payload
      },
      setInitialLoadDone(state, payload) {
        state.initialLoadDone = payload
      },
      setLastFetchTime(state, payload) {
        state.lastFetchTime = payload
      },
    },
    actions: {
      setSendEmailForm({ commit }, pages) {
        commit('setSendEmailForm', pages)
      },
      setProgressStep({ commit }, pages) {
        commit('setProgressStep', pages)
      },
      setRenewalReqConfirm({ commit }, pages) {
        commit('setRenewalReqConfirm', pages)
      },
      setCompanySelection({ commit }, pages) {
        commit('setCompanySelection', pages)
      },
      setCustomers({ commit }, pages) {
        commit('setCustomers', pages)
      },
      initAuth(context, req) {
        let token
        let refreshToken

        if (req && req.headers?.cookie) {
          const theCookie = req.headers.cookie
            .split(';')
            .find((c) => c.trim().startsWith('nathandigital-cookie='))
          if (theCookie) {
            token = theCookie.split('=')[1]
            context.commit('setToken', token)
          }
        }

        // Load refresh token from localStorage on client side
        if (process.client) {
          const encryptedRefreshToken = localStorage.getItem('nathandigital-refresh-token')
          if (encryptedRefreshToken) {
            const decryptedRefreshToken = safeDecrypt(
              encryptedRefreshToken,
              'a3477557f0f7f078c880186b56564a5a508e1611b11a79ccff5a7adbdf9a1c8d'
            )
            if (decryptedRefreshToken) {
              context.commit('setRefreshToken', decryptedRefreshToken)
            }
          }
        }
      },
      async saveUserSessionInfo({ commit }, res) {
        const getUserRole = (data) => {
          for (const [key, value] of Object.entries(data)) {
            if (value === true) return key
          }
        }

        commit('setToken', res.tokens.access.token)
        commit('setRefreshToken', res.tokens.refresh.token)
        commit('setUser', res.user.email)
        commit('setUserInfo', res.user)
        commit('setSelectedCompany', res.user.company_id)
        commit('setUserStatus', getUserRole(res))
        commit('setProductAccess', res.product_access)
        commit('encryptLocalStorage', {
          key: 'nathandigital-token',
          value: res.tokens.access.token,
        })
        commit('encryptLocalStorage', {
          key: 'nathandigital-refresh-token',
          value: res.tokens.refresh.token,
        })
        Cookie.set('nathandigital-cookie', res.tokens.access.token)
      },
      logout() {
        Cookie.remove('nathandigital-cookie')
        if (process.client) {
          localStorage.removeItem('nathandigital-token')
          localStorage.removeItem('nathandigital-refresh-token')
          localStorage.removeItem('tokenExpiration')
        }
        // Clear store state
        this.commit('setToken', null)
        this.commit('setRefreshToken', null)
      },
      setRefreshToken({ commit }, payload) {
        commit('setRefreshToken', payload)
      },
      setParentSelectedCompany({ commit }, payload) {
        commit('setParentSelectedCompany', payload)
      },
      getWelcomeDialog({ commit }, value) {
        commit('setWelcomeDialog', value)
      },
      getAddCompany({ commit }, value) {
        commit('setAddCompany', value)
      },
      getHiValue({ commit }, value) {
        commit('setHiValue', value)
      },
      getCompanySelection({ commit }, value) {
        commit('setCompanySelection', value)
      },
      setConf({ commit }, res) {
        commit('setConf', res)
      },
      setAllCompanies({ commit }, res) {
        commit('setAllCompanies', res)
      },
      setupUsers({ commit }, res) {
        commit('setUsers', res)
      },
    },
    getters: {
      getSendEmailForm: (state) => state.sendEmailForm,
      getProgressStep: (state) => state.progressStep,
      getRenewalReqConfirm: (state) => state.renewalReqConfirm,
      getProductAccess: (state) => state.productAccess,
      getSelectedCompanies: (state) => state.companySelection,
      getCustomers: (state) => state.customers,
      getFirstTimeLogin: (state) => state.firstTimeLogin,
      getParentSelectedCompany: (state) => state.parentSelectedCompany,
      getParentSelectedCompanyName: (state) => state.parentSelectedCompanyName,
      getParentSelectedCompanyId: (state) => state.parentSelectedCompanyId,
      getShowLoader: (state) => state.is_show_loader,
      getInvoiceAddEditToggler: (state) => state.invoice_add_edit_toggler,
      getThisUser: (state) => state.user,
      getThisUserRole: (state) => state.userRole,
      getSelectedCompany: (state) => state.selectedCompany,
      getRefreshToken: (state) => state.refreshToken,
      getConf: (state) => state.conf,
      getUsers: (state) => state.users,
      getUserInfo: (state) => state.userInfo,
      getAllCompanies: (state) => state.Companies,
      isInitialLoadDone: (state) => state.initialLoadDone,
      getLastFetchTime: (state) => state.lastFetchTime,
    },
  })
}

export default createStore
