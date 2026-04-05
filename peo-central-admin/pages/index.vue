<template>
  <div class="login_wrapper">
    <SnackBar :data="snackbar_data" />
    <v-card flat class="login_wrapper">
      <v-row>
        <!-- LEFT SIDE -->
        <v-col sm="0" md="6" lg="6" class="d-none d-sm-none d-md-flex" id="ls__col">
          <v-row class="py-9">
            <v-col cols="12" class="ls__con">
              <v-row style="min-height: 20% !important">
                <v-col cols="4">
                  <div class="header__sec">
                    <!-- <v-img src="/nathandigital-slogo.svg" min-width="50" max-width="100"></v-img> -->
                    <!-- <v-divider vertical class="divider white"></v-divider> -->
                    <v-img src="/eor_central_logo.svg" />
                  </div>
                </v-col>
              </v-row>
              <v-spacer></v-spacer>
              <v-row style="min-height: 20% !important">
                <v-col cols="12" class="img__sec">
                  <v-img src="/Login/peo-preview.svg"></v-img>
                </v-col>
              </v-row>
              <v-spacer></v-spacer>
              <v-row style="min-height: 20% !important">
                <!-- <v-col cols="12" class="text-center">
                  <h2 class="text_light--text">
                    Simple yet powerful accounting software for businesses
                  </h2>
                  <p class="mt-5 subtitle subtext--text text-center">
                    Track expenses, customize invoices, run reports and even
                    more all from one place.
                  </p>
                </v-col> -->
              </v-row>
            </v-col>
          </v-row>
        </v-col>
        <!-- LOGIN CARD -->
        <v-col sm="12" md="6" lg="6" id="rs" class="ma-auto text-center justify-center align-center d-flex flex-column">
          <v-card class="my-5 borderRadiusCards eventCard boxShadowCard" width="550" min-height="450">
            <v-img class="eventCardImg" style="background: #505771" height="245"
              src="https://erp.nathanhr.com/login/bg-image.png">
              <v-img width="180" height="100%" style="margin: auto"
                src="https://www.nathandigital.com/static/media/LogoLogo.c6dea5d239143387d7fe95dee7c1e554.svg"
                contain></v-img>
            </v-img>
            <div class="curve-parent pa-xl-5">
              <div class="curve">
                <v-img class="curveImage2" width="70" height="70" src="/Login/lock-icon.svg" contain></v-img>
              </div>
              <v-row justify="center" align="center" v-if="isOutlookLogin">
                <v-col class="px-13 ">
                  <v-btn block style="min-height: 51px;justify-content:space-between" v-if="azureloading == true"
                    class="buttonBackgroundShade d-flex justify-center loginButton">
                    <v-progress-circular color="dark-blue" indeterminate></v-progress-circular>
                  </v-btn>
                  <v-btn v-else @click="loginWithAzure" elevation="0"
                    style="min-height: 51px;justify-content:space-between; background: transparent !important;">
                    <v-img class="mx-2" height="48" width="48" src="/login/outlook.png"> </v-img>
                    <span class="black--text">Sign In with Outlook</span> </v-btn>
                </v-col>
              </v-row>
              <div v-if="isOutlookLogin" class="" style="width: 100%">
                <p class="fontSize1 mb-0" style="cursor: pointer" @click="isOutlookLogin = false">
                  Don't have outlook account? Click to sign in with credentials.
                </p>
              </div>
              <!-- <v-row class="pt-3" wrap no-gutters>
                <v-divider class="text-center my-3 mx-1" />
                <p class="mb-0 text-center font-weight-normal grey-heading-text textFontSize px-3">Or</p> <v-divider
                  class="text-center my-3 mx-1" />
              </v-row> -->
              <v-form ref="form" @submit.prevent="userLogin" id="check-login-form" style="padding-top: 20px"
                v-if="!isForgotPassword && !isOutlookLogin">
                <v-card-text class="pb-0 pt-7 pr-0 px-13">
                  <v-row>
                    <v-col cols="12" class="pl-0" style="text-align: start">
                      <p class="font-weight-medium fontSize15">Login</p>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text class="py-0 px-13 my-0">
                  <p class="mb-0 text-left font-weight-normal grey-heading-text textFontSize">
                    User Name<span class="red--text">*</span>
                  </p>
                  <v-text-field name="Username" class="pt-0" prepend-inner-icon="mdi-username" placeholder="Username"
                    type="text" v-model="input.email" :rules="emailRules"></v-text-field>
                  <p class="mb-0 mt-3 text-left font-weight-normal grey-heading-text textFontSize">
                    Password<span class="red--text">*</span>
                  </p>
                  <v-text-field class="pt-0" id="password" prepend-inner-icon="mdi-password" name="password"
                    placeholder="Password"
                    :append-icon="showPassword ? 'fa-duotone fa-eye-slash' : 'fa-duotone fa-eye fa-2xs'"
                    @click:append="showPassword = !showPassword" :type="showPassword ? 'password' : 'text'"
                    v-model="input.password"></v-text-field>
                  <p class="mb-0 text-right">
                    <a href="#" style="text-decoration: none" class="ml-2 font-weight-normal fontSize15 grey-heading-text"
                      @click.prevent="clickForgotPassword">Forgot Password?</a>
                  </p>
                </v-card-text>
                <v-card-actions class="px-13 mt-4 mb-5">
                  <v-btn type="submit" block form="check-login-form" :loading="loading"
                    style="min-height: 51px; justify-content: space-between"
                    class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"><span
                      class="white--text">Login</span><v-icon color="#fff" class="mx-4">fa-chevron-right</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-form>
              <!-- FORGET PASSWORD FORM -->
              <v-form ref="form" @submit.once.prevent="forgotPassword" style="padding-top: 25px" id="check-login-form"
                v-else>
                <v-card-text class="px-13">
                  <v-row>
                    <v-col cols="auto" @click.prevent="backToLogin" class="pl-0 pt-7 cursor-pointer"
                      style="text-align: start">
                      <p class="font-weight-medium fontSize15" @click.prevent="backToLogin">
                        <v-icon color="#0064D7" class="mr-2">fa-arrow-left</v-icon>Back
                      </p>
                    </v-col>
                  </v-row>
                  <p class="textFontSize font-weight-normal" style="text-align: start">
                    <span class="font-weight-medium" style="color: #0064d7">Forgot Password?</span>
                    Enter your email address you're using for your account.
                  </p>
                  <v-text-field name="Email Address" v-model="forgot.email" placeholder="Email Address" type="text"
                    prepend-inner-icon="mdi-forgot" :rules="emailRules"></v-text-field>
                  <v-alert outlined style="border:solid 1px #009966;background-color:#FFF6F5"
                    class="borderRadiusInfo align-center pa-3 mb-0" v-if="alertTypeSuccess" :value="alert" color="green"
                    dense type="success" transition="scale-transition">
                    <strong>{{ alertMessage.strong }}</strong> {{ alertMessage.normal }}
                  </v-alert>
                </v-card-text> 
              <!-- FORGET PASSWORD BUTTON -->
              <v-card-actions class="px-13 mt-4 mb-5">
                  <v-btn type="submit" block form="check-login-form" v-if="loading == true"
                    style="min-height: 51px; justify-content: space-between"
                    class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset">
                    <span class="white--text">Send</span>
                    <v-icon color="#fff" class="mx-4">fa-thin fa-loader</v-icon>
                  </v-btn>
                  <v-btn type="submit" block form="check-login-form" v-else
                    style="min-height: 51px; justify-content: space-between"
                    class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"><span
                      class="white--text">Send</span><v-icon color="#fff" class="mx-4">mdi-customSend</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-form> 
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import '@/assets/scss/_login.scss'
import SnackBar from '@/components/utils/SnackBar.vue'

export default {
  name: 'LoginPage',
  layout: 'login',
  components: { SnackBar },
  data() {
    return {

      isOutlookLogin: true,
      azureloading: false,
      input: {
        email: '',
        password: '',
        type: '',
        otp: '',
      },
      snackbar_data: {
        snackbar: false,
        text: '',
        color: '',
        icon: '',
        timeout: 2000,
      },
      loading: false,
      showPassword: '',
      AuthErrMsg: 'Incorrect username or password',
      isAuth: '',
      showPassword: true,
      isForgotPassword: '',
      requiredRules: [(v) => !!v || 'This field is required'],
      emailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],
      forgot: {
        email: '',
      },
      alert: false,
      alertTypeSuccess: false,
      alertMessage: {
        strong: '',
        normal: ''
      },
    }
  },
  async mounted() {
    this.resetFormState()
    await this.msAzureLogin()
  },
  watch: {
  '$route': {
    immediate: true,
    handler(to, from) {
      if (to.path === '/login' || to.path === '/') {
        this.isForgotPassword = false;
        this.isOutlookLogin = false;
      }
    }
  }
},
  computed: {
    ...mapState(['firstTimeLogin', 'companySelection', 'addCompany']),
    ...mapGetters(['getFirstTimeLogin']),
  },
  methods: {
    ...mapActions(['getWelcomeDialog']),
    ...mapMutations([
      'setWelcomeDialog',
      'setHiValue',
      'setCompanySelection',
      'setFirstTimeLogin',
      'setAddCompany',
      'setCustomers',
    ]),
    resetFormState() {
      this.isForgotPassword = false;
      this.isOutlookLogin = false;
      this.input.email = '';
      this.input.password = '';
      this.forgot.email = '';
      this.alert = false;
    },
    updateFirstTimeLogin(newValue) {
      this.setFirstTimeLogin(newValue)
    },
    updateWelcomeDialog(newValue) {
      this.setWelcomeDialog(newValue)
      this.setHiValue(newValue)
    },
    updateSelectedCompanies(newValue) {
      this.setCompanySelection(newValue)
    },
    updateAddCompany(newValue) {
      this.setAddCompany(newValue)
    },
    clickForgotPassword() {
      this.isForgotPassword = true
      this.isOutlookLogin = false
      this.alert = false
      this.forgot.email = ''
      this.alertTypeSuccess = false
      this.alertMessage = {
        strong: '',
        normal: ''
      }
    },
    backToLogin() {
      this.isForgotPassword = false
      this.isOutlookLogin = false
    },
    async loginWithAzure() {
      this.azureloading = true
      let response = await this.$axios.$get("/azure/login")
      location.href = response.loginURL
    },
    async msAzureLogin() {
      const params = new URLSearchParams(window.location.search)
      if (params.has("idToken")) {
        try {
          this.azureloading = true
          let response = await this.$axios.$post("/azure/authorize", { idToken: params.get("idToken") })
          const data = response.data
          await this.$auth.setUserToken(data.tokens.access.token, data.tokens.refresh.token)
          this.$auth.setUser(data.user)
          this.$store.dispatch('saveUserSessionInfo', data)
          this.$router.push('/dashboard')
        } catch (error) {
          this.snackbar_data = {
            snackbar: true,
            text: 'No user found.',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
          this.azureloading = false
        }
      }
    },
    async forgotPassword() {
      this.loading = true
      if (this.$refs.form.validate()) {

        this.alert = true

        let obj = {
          'email': this.forgot.email
        }

        await this.$axios.$post('/users/auth/forgot-password', obj)
          .then((response) => {
            this.alertTypeSuccess = true
            this.alertMessage = {
              strong: 'Email Sent!',
              normal: 'Please check your email and click the reset password link.'
            }
            this.snackbar_data = {
              snackbar: true,
              text: 'Email Has Been Sent Successfully!',
              color: 'success',
              icon: 'info',
              timeout: 2000,
            }
            this.loading = false
            this.forgot.email = ''
          })

        setTimeout(() => {
          this.alert = false
          this.alertMessage = {
            strong: '',
            normal: ''
          }
          this.alertTypeSuccess = false
        }, 4000);

        this.$refs.form.reset()
      }
    },
    async userLogin() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          const response = await this.$auth.loginWith('local', {
            data: this.input,
          })

          // console.log('response', response)
          const { data } = response.data
          const { refresh } = data.tokens
          const { access } = data.tokens
          this.$auth.setUser(data.user)
          // this.$auth.strategy.refreshToken.set(refresh.token)
          // this.$auth.strategy.token.set(access.token)

          this.$store.dispatch('saveUserSessionInfo', data)
          this.$router.push('/dashboard')

          await this.$axios.$post('/users/setup')
          await this.$axios.$post('/set/setCompanies')
          await this.$axios.$post('/set/setConfiguration')

          // const AuthStr = 'Bearer '.concat(this.$store.state.token)
          // await this.$axios
          //   .$post(
          //     `/company/all`,
          //     {},
          //     {
          //       headers: { Authorization: AuthStr },
          //     }
          //   )
          //   .then(async (res) => {
          //     console.log(res.data, 'companies')
          //     if (res.data.length > 0) {
          //       // go to dashboard,  select the parent company
          //       function flat(array) {
          //         var result = []
          //         array.forEach(function (a) {
          //           result.push(a)
          //           if (Array.isArray(a.children)) {
          //             result = result.concat(flat(a.children))
          //           }
          //         })
          //         return result
          //       }
          //       let array_nodes = []
          //       for (let index = 0; index < flat(res.data).length; index++) {
          //         const element = flat(res.data)[index]
          //         array_nodes.push({
          //           id: element.id,
          //           name: element.name,
          //           city: element.city,
          //           email: element.email,
          //           country: element.location,
          //           phone: element.phone,
          //           website: element.website,
          //         })
          //       }
          //       console.log('here')

          //       this.updateSelectedCompanies(array_nodes)
          //       let payload = {
          //         company: [res.data[0].id],
          //       }
          //       await this.$axios
          //         .$post('customer/list', payload, {
          //           headers: { Authorization: AuthStr },
          //         })
          //         .then((res2) => {
          //           this.setCustomers(res2.data.customers)
          //         })
          //         .catch((err) => {
          //           this.loading = false
          //           this.snackbar_data = {
          //             snackbar: true,
          //             text: 'Something Went Wrong',
          //             color: 'danger',
          //             icon: 'info',
          //             timeout: 2000,
          //           }
          //         })
          //       this.$router.push('/dashboard')
          //       this.updateFirstTimeLogin(false)
          //       console.log('firstTimeLogin', this.getFirstTimeLogin)
          //       this.updateWelcomeDialog(false)
          //       this.updateAddCompany(false)
          //     } else {
          //       // show welcome dialog
          //       this.updateWelcomeDialog(false)
          //       this.updateFirstTimeLogin(true)
          //       this.updateAddCompany(false)

          //       this.$router.push('/dashboard')
          //     }
          //   })
          //   .catch((err) => {
          //     console.log(err, "--err")
          //     this.loading = false
          //     this.snackbar_data = {
          //       snackbar: true,
          //       text: 'Server is in Maintenance, Try again Later.',
          //       color: 'danger',
          //       icon: 'info',
          //       timeout: 2000,
          //     }
          //   })
        } catch (err) {
          this.snackbar_data = {
            snackbar: true,
            text: 'Invalid User Name or Password',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
          console.log(err)
          this.loading = false
        }
      }
    },
  },
}
</script>
<style lang="scss"></style>
