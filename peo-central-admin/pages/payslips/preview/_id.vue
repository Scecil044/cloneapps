<template>
    <div>
        <div v-if="show_payslips">
            <v-row>
                <v-col cols="12">
                    <h1 class="blue-grey--text text-center display-1  pt-6 font-weight-thin">Welcome to Payslips Central
                    </h1>
                    <h1 class="blue-grey--text text-center display-1  pt-3 font-weight-bold">{{ company_data.company_name }}
                    </h1>
                    <p class="mb-0 blue-grey--text caption text-right pt-3 mr-2"><span class="mt-n2 grey--text">Powered
                            By</span>&nbsp;
                        <img src="/nathandigital-dark-logo.svg" class="" alt="" style="width:130px">
                    </p>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="12" md="6" class="">
                    <v-card class="rounded-xl pa-5" flat min-height="800">
                        <v-row>
                            <v-col cols="12" sm="12" md="8" class="py-0">
                                <h3 class="px-3 pt-1 blue-grey--text font-weight-bold">Your Payslips</h3>
                            </v-col>
                        </v-row>
                        <v-divider class="mt-4"></v-divider>
                        <div v-if="show_payslips && visiblePages.length > 0">
                            <v-list two-line v-if="visiblePages != ''">
                                <template v-for="(data, index) in visiblePages">
                                    <v-list-item :key="index" @click="loadServiceList(data)">
                                        <v-list-item-content class="py-0">
                                            <v-list-item-title class="font-weight-bold body-1 blue-grey--text"><v-icon
                                                    class="mt-n1" color="pink" size="25">mdi-calendar-outline</v-icon>&nbsp;
                                                <span class="mt-3">{{ data.pay_month | PayslipDateFormatter }} </span>
                                            </v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-content class="py-0">
                                            <p class="mb-1 font-weight-light caption blue-grey--text"><v-icon class="mt-n1"
                                                    color="green" size="20">mdi-cash</v-icon>&nbsp;
                                                {{ parseFloat(data.users.total_fixed).toFixed(2) + ' AED' }}</p>
                                        </v-list-item-content>
                                        <v-list-item-action class="py-0" v-if="configuration && configuration.length > 0">
                                            <PayslipTemplate :payslip="payslipData" :userData='user'
                                                :fixed_salary_config="services_general.getFixedSalaryConfig(configuration)"
                                                :variable_salary_config="services_general.variableSalaryConfig(configuration)"
                                                :company_data="company_data" />
                                        </v-list-item-action>
                                    </v-list-item>
                                    <v-divider :key="data._id"></v-divider>
                                </template>
                            </v-list>
                            <v-row justify="center">
                                <v-col md="12" align-self="center">
                                    <div class="pb-3" style="position: absolute; bottom:0;">
                                        <v-pagination class="pt-2" v-model="page"
                                            :length="Math.ceil(payslips.length / perPage)" circle
                                            v-if="payslips != undefined"></v-pagination>
                                    </div>
                                </v-col>
                            </v-row>
                        </div>
                        <div v-else>
                            <h3 class="px-3 pt-4 font-weight-light">There are no Payslips to display!</h3>
                        </div>

                    </v-card>
                </v-col>
                <v-col cols="12" sm="12" md="6" class="">
                    <v-card class="rounded-xl pa-5" flat min-height="800">
                        <v-row class="">
                            <v-col cols="12" sm="12" md="8" class="py-0">
                                <h3 class="px-3 pt-1 blue-grey--text font-weight-bold">Payslip Preview</h3>
                            </v-col>
                            <v-col cols="12" sm="12" md="4" class="py-0 text-right my-auto">
                            </v-col>
                        </v-row>
                        <v-divider class="my-4"></v-divider>
                        <div v-if="show_payslips && visiblePages.length > 0">
                            <Payslip v-if="services_general" :payslipData='payslipData' :user="user"
                                :fixed_salary_config="services_general.getFixedSalaryConfig(configuration)"
                                :variable_salary_config="services_general.variableSalaryConfig(configuration)"
                                :company_data="company_data" />
                        </div>
                        <div v-else>
                            <h3 class="px-3 pt-4 font-weight-light">There are no Payslips to display</h3>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        <div v-if="!dialog_password_check && !show_payslips && !payslipFirstLogin">
            <v-container>
                <v-layout align-center justify-center>
                    <img src="/login/page_not_found.jpg" contain height="650" />
                </v-layout>
            </v-container>
            <p class="text-center"><v-btn class="primary white--text" @click="reload">Reload</v-btn></p>

        </div>

        <v-dialog overlay-color="black" v-model="dialog_password_check" width="500" style="overflow-x : hidden" persistent>
            <v-card style="overflow-x : hidden">
                <v-form v-model="valid" ref="form">
                    <v-card-title class="indigo--text">Password Verification</v-card-title>
                    <div class="px-7">
                        <v-alert prominent type="error" class="py-0" v-show="password_mismatch_alert">
                            {{ message }}
                        </v-alert>
                        <v-row class="">
                            <v-col cols="12" sm="12" class="pb-0">
                                <p class="mb-0 font-weight-bold blue-grey--text caption">Please enter your Passport Number
                                    For verification.</p>
                                <v-text-field :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="show ? 'text' : 'password'" v-model="checkPassword" class=""
                                    @click:append="show = !show" @keydown.enter.prevent="showPayslipDialog"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="">
                            <v-col class="text-right">
                                <v-btn outlined @click="PassWordChecker" class="primary--text" text>Submit</v-btn>
                            </v-col>
                        </v-row>
                    </div>
                </v-form>
            </v-card>
        </v-dialog>
        <!-- password Check -->
        <!-- <v-dialog overlay-color="black" fullscreen v-model="dialog_password_check" width="500"
            style="overflow-x : hidden;border-radius:0 !important">

            <v-card style="overflow-x : hidden;background:#f4f7f7">
                <v-form v-model="valid" ref="form">
                    <v-row style="min-height: 100vh;" class="ml-0 mr-0">
                        <v-col cols="12" sm="12" md="6" class="pa-0 backgroundImg" style="min-height:100%">
                            <v-layout column align-center justify-center style="height:30%">
                                <div style="min-width:58%">
                                    <v-img v-if="currentCompanyLogo == ''" src="/payslip/NDLOGO.svg" max-width="80"
                                        height="auto" cover></v-img>
                                    <v-img v-else :src="currentCompanyLogo" max-width="180"
                                        style="mix-blend-mode: multiply;" height="auto" contain></v-img>
                                </div>
                            </v-layout>
                            <v-row style="margin:auto;height:50%">
                                <v-col cols="12" sm="0" md="12" class="pa-0 center-align d-flex">
                                    <v-layout column align-center justify-center style="padding-bottom: 136px;">
                                        <div style="min-width:58%">
                                
                                            <p class="  fontWeight400 fontSize18 pb-10" style="color:#0064D7 !important">A
                                                secure digital payslip solution</p>
                                            <v-alert v-show="password_mismatch_alert" outlined
                                                style="border:solid 1px #E59B96;background-color:#FFF6F5"
                                                class="borderRadiusInfo align-center pa-3" type="error"
                                                transition="scale-transition">
                                                Passwords do not Match !!
                                            </v-alert>
                                            <v-alert outlined style="border:solid 1px #009966;background-color:#FFF6F5"
                                                class="borderRadiusInfo align-center pa-3" :value="forgotPayslipPassword"
                                                color="green" dense type="success" transition="scale-transition">
                                                <strong>Email Sent!</strong> Please check your email and click the reset
                                                password link. <br>
                                            </v-alert>
                                            <v-alert outlined style="border:solid 1px #009966;background-color:#FFF6F5"
                                                class="borderRadiusInfo align-center pa-3"
                                                :value="forgotPayslipPasswordError" color="green" dense type="success"
                                                transition="scale-transition">
                                                there is an error sending an email please contact @ spnair@nathanhr.com
                                            </v-alert>

                                            <v-card-text class="pa-0 my-0" v-if="!signInWithOkta" style="max-width:62%">
                                                <div v-if="payslipFirstLogin">
                                                    <ul style="list-style: none;" class="customTickk">
                                                        <v-row class="">
                                                            <v-col cols="1" class="pa-0 py-0 customIconSize mr-1">
                                                                <v-icon class="" color="#009966"
                                                                    v-if="contains_eight_characters"
                                                                    style="font-size: 19px !important;">mdi-check-circle-outline</v-icon>
                                                            </v-col>
                                                            <v-col cols="11" class="pa-0 py-0">
                                                                <p class="mb-0 grey-heading-text font-italic">At least 8
                                                                    characters</p>
                                                            </v-col>
                                                        </v-row>
                                                        <v-row class="">
                                                            <v-col cols="1" class="pa-0 py-0 customIconSize mr-1">
                                                                <v-icon class="" color="#009966" v-if="contains_number"
                                                                    style="font-size: 19px !important;">mdi-check-circle-outline</v-icon>
                                                            </v-col>
                                                            <v-col cols="11" class="pa-0 py-0">
                                                                <p class="mb-0 grey-heading-text font-italic">Contains
                                                                    Number</p>
                                                            </v-col>
                                                        </v-row>
                                                        <v-row class="">
                                                            <v-col cols="1" class="pa-0 py-0 customIconSize mr-1">
                                                                <v-icon class="" color="#009966"
                                                                    v-if="contains_uppercase_lowercase"
                                                                    style="font-size: 19px !important;">mdi-check-circle-outline</v-icon>
                                                            </v-col>
                                                            <v-col cols="11" class="pa-0 py-0">
                                                                <p class="mb-0 grey-heading-text font-italic">Contains
                                                                    Uppercase and Lowercase</p>
                                                            </v-col>
                                                        </v-row>
                                                        <v-row class="">
                                                            <v-col cols="1" class="pa-0 py-0 customIconSize mr-1">
                                                                <v-icon class="" color="#009966"
                                                                    v-if="contains_special_character"
                                                                    style="font-size: 19px !important;">mdi-check-circle-outline</v-icon>
                                                            </v-col>
                                                            <v-col cols="11" class="pa-0 py-0">
                                                                <p class="mb-0 grey-heading-text font-italic">Contains
                                                                    Special Character</p>
                                                            </v-col>
                                                        </v-row>
                                                    </ul>
                                                    <p
                                                        class="mb-0 mt-3 mb-3 text-left font-weight-normal grey-heading-text textFontSize">
                                                        Please enter new password<span class="red--text">*</span></p>
                                                    <v-text-field dense prepend-inner-icon="mdi-password"
                                                        label="New Password" :type="show1 ? 'text' : 'password'"
                                                        v-model="password_new"
                                                        :rules="[checkPasswordNew || 'Password does not meet requirements']"
                                                        :append-icon="show1 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                                                        @click:append="show1 = !show1"></v-text-field>
                                                    <v-text-field class="pt-2" dense prepend-inner-icon="mdi-password"
                                                        label="Renter New Password" :type="show2 ? 'text' : 'password'"
                                                        v-model="password_match"
                                                        :rules="[password_new == password_match || 'Passwords Dont Match']"
                                                        :append-icon="show2 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                                                        @click:append="show2 = !show2"></v-text-field>

                                                </div>
                                                <div v-else>
                                                    <template v-if="!forgotPayslipPassword">
                                                        <p
                                                            class="mb-0 mt-3 text-left font-weight-normal grey-heading-text textFontSize">
                                                            Please enter your password to proceed<span
                                                                class="red--text">*</span></p>
                                                        <v-text-field class="pt-0" id="password"
                                                            prepend-inner-icon="mdi-password" name="password"
                                                            placeholder="Password"
                                                            :append-icon="show ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                                                            @keydown.enter.prevent="validatePayslipUser"
                                                            @click:append="show = !show" :type="show ? 'text' : 'password'"
                                                            v-model="checkPassword"></v-text-field>
                                                        <p class="mb-0 text-right" v-if="isInternalCompany"><a href="#"
                                                                style="text-decoration:none;"
                                                                class="ml-2 font-weight-normal fontSize15 grey-heading-text"
                                                                @click.prevent="clickForgotPassword">Forgot Password?</a>
                                                        </p>
                                                    </template>
                                                    <template v-if="forgotPayslipPassword">
                                                        <p
                                                            class="mb-0 mt-3 text-left font-weight-normal grey-heading-text textFontSize">
                                                            Email:</p>
                                                        <v-text-field persistent-hint
                                                            hint="If you haven't received an email, please get in touch with spnair@nathanhr.com"
                                                            class="pt-0" id="password" prepend-inner-icon="mdi-forgot"
                                                            name="email" placeholder="Email" :type="forgotPayslipPassword"
                                                            v-model="forgot.email" disabled></v-text-field>

                                                    </template>
                                                </div>
                                            </v-card-text>
                                            <v-card-actions class="pa-0 pt-2" v-if="!signInWithOkta" style="max-width:62%">
                                                <v-btn style="min-height: 51px;justify-content:space-between"
                                                    v-if="loading == true"
                                                    class="buttonBackgroundShade  pl-0 textTransformUnset loginButton">
                                                    <v-icon class="circle" color="#fff"
                                                        style="position: absolute;left: 13px;">mdi-loading</v-icon>
                                                </v-btn>
                                                <div v-else style="min-width:100%">
                                                    <v-btn v-if="payslipFirstLogin" @click="updateUserPayslipPassword()"
                                                        style="min-height: 51px;min-width:100%;justify-content:space-between"
                                                        class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"><span
                                                            class="white--text">Update Password</span><v-icon color="#fff"
                                                            class="mx-4">mdi-chevron-right</v-icon> </v-btn>
                                                    <v-btn v-else-if="!forgotPayslipPassword"
                                                        :disabled='checkPassword == ""' @click="validatePayslipUser"
                                                        style="min-height: 51px;min-width:100%;justify-content:space-between"
                                                        class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"><span
                                                            class="white--text">Submit</span><v-icon color="#fff"
                                                            class="mx-4">mdi-chevron-right</v-icon> </v-btn>
                                                    <v-btn v-else @click="forgotPayslipPassword = !forgotPayslipPassword"
                                                        style="min-height: 51px;min-width:100%;justify-content:space-between;"
                                                        class="white--text buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"><span
                                                            class="white--text">Back</span><v-icon color="#fff"
                                                            class="mx-4 white--text">mdi-chevron-left</v-icon> </v-btn>
                                                </div>
                                            </v-card-actions>
                                            <v-card-actions class=" mt-4 mb-0" v-else v-on:click="authorizeWithOkta"
                                                style="max-width:62%">
                                                <v-btn type="submit" block
                                                    style="min-height: 51px;justify-content:space-between"
                                                    v-if="oktaloading"
                                                    class="buttonBackgroundShade  pl-0 textTransformUnset loginButton">
                                                    <v-icon class="circle" color="#fff"
                                                        style="position: absolute;left: 13px;">mdi-loading</v-icon>
                                                </v-btn>
                                                <v-btn type="submit" block
                                                    style="min-height: 51px;justify-content:space-between"
                                                    v-if="!oktaloading"
                                                    class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"><span
                                                        class="white--text">Login with Okta</span><v-icon color="#fff"
                                                        class="mx-4">mdi-chevron-right</v-icon> </v-btn>
                                            </v-card-actions>
                                        </div>
                                    </v-layout>
                                </v-col>
                            </v-row>
                            <v-layout column align-center justify-center style="height:20%">
                                <div style="min-width:58%" class="px-1">
                                    <v-img src="/payslip/footerimg.svg" max-width="150" height="auto" contain></v-img>
                                </div>
                            </v-layout>
                        </v-col>
                        <v-col cols="0" sm="0" md="6" class="pa-0 d-none d-md-block backgroundImg2 ">
                            <div class="py-12">
                                <img src="/payslip/stat1.png" width="auto" height="auto" contain
                                    style="max-height: 83Vh;" />
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card>


        </v-dialog> -->
    </div>
</template>

<script>
import PayslipTemplate from '~/components/invoice/template_payslip'
import Payslip from '~/components/payslips/payslip'
// import bcrypt from 'bcryptjs'
import general from '~/plugins/general'
// import { CONFIG_DETAIL } from '~/plugins/constants'
import CryptoJS from "crypto-js"
import getPkce from "oauth-pkce";

export default {
    components: { PayslipTemplate, Payslip },
    layout: 'payslip-download-no-auth',
    data() {
        return {
            password_match: '',
            // password validation
            contains_eight_characters: false,
            contains_number: false,
            contains_uppercase_lowercase: false,
            contains_special_character: false,
            valid_password: false,
            password_new: '',
            payslipFirstLogin: false,
            oktaloading: false,
            signInWithOkta: false,
            currentCompany: '',
            currentCompanyLogo: '',
            loading: false,
            visiblePages: [],
            // config_details: CONFIG_DETAIL,
            services_general: general,
            dialog_password_check: true,
            show_payslips: false,
            valid: '',
            payslips: [],
            payslipData: {},
            forgotPayslipPassword: false,
            user: {
                _id: '',
                personal: {},
                bank: {},
                education: {},
                work_experience: {},
                documents: {},
                emergency: {},
                reporting: {},
                leaves: {},
                salary: {},
                config: {},
                socials: {},
                payslip_first_login: false
            },
            checkPassword: '',
            show: false,
            show1: false,
            show2: false,
            password_mismatch_alert: false,
            message: '',
            configuration: [],
            company_data: {
                letterDetail: {}
            },
            completedFlag: false,
            token: "",
            page: 1,
            perPage: 9,
            selectedCompany: {},
            company_id: "",
            user_id: "",
            internal_company: false,
            urlParams: null,
            forgot: {
                email: '',
                unique_token: '',
                url: '',
            },
            forgotPayslipPasswordError: false,
            email: "",
            isInternalCompany: false
        }
    },
    // async beforeMount() {
    //     // Decrypt mechanism

    //     var reb64 = CryptoJS.enc.Hex.parse(this.$route.params.id);
    //     var bytes = reb64.toString(CryptoJS.enc.Base64);
    //     var decrypt = CryptoJS.AES.decrypt(bytes, "@PC_*NATHAN!0*&");
    //     var plain = decrypt.toString(CryptoJS.enc.Utf8);
    //     this.urlParams = plain
    //     let companyId = this.urlParams.split('-')[0]
    //     if (companyId == '628b4eb7366e6c1c71c6e163') {
    //         this.signInWithOkta = true
    //     }

    // },
    async mounted() {

        // console.log(this.$route.params, "IDDD")
        // this.getCompany()
        // let user = await this.$axios.$get('/users/info/' + this.urlParams.split('-')[1])
        // if (user.length > 0 && user[0] && user[0].email) {
        //     this.forgot.email = user[0].email
        //     this.forgot.url = this.$route.params.id
        // }

        // localStorage.setItem('payslip', this.$route.params.id)
    },
    methods: {
        async PassWordChecker() {
            const body = {
                _id: this.$route.params.id,
                password: this.checkPassword
            }
            await this.$axios.$post("users/payslip/password-Checker", body)
                .then(async res => {
                    if (res && res == 'success') {
                        // this.getPayrollDetails();
                        this.getAllPaySlips();
                        this.checkPassword = ''
                    } else {
                        this.message = res
                        this.password_mismatch_alert = true
                    }
                }).catch()
        },
        async getAllPaySlips() {

            await this.getPayrollDetails()
            await this.getUserDetails();
            await this.$axios.$post(`payslips/payslipsUser/${this.$route.params.id}`)
                .then(async res => {
                    this.show_payslips = true
                    this.visiblePages = res.data
                    this.payslipData = res.data[0]
                    this.dialog_password_check = false

                }).catch()
        },
        async getUserDetails() {
            await this.$axios.$post(`users/payslip/userDetails/${this.$route.params.id}`)
                .then(async res => {
                    this.user = res
                }).catch()
        },
        async getPayrollDetails() {
            // const token = this.$store.getters.getToken
            // const AuthStr = 'Bearer '.concat(token)
            const payroll_body = {
                fixed: 1,
                earning: 1,
                deduction: 1,
                recurring_earning: 1,
                recurring_deduction: 1,
                PAYSLIP_DOWNLOAD_BASE_URL: 1,
                SYSTEM_EMAIL_ID: 1,
                company_ID: "All"
            }
            await this.$axios.$post('payrollconfig/getPayrollConfig', payroll_body)
                .then(res => {
                    this.configuration = res.data

                }).catch(err => console.log(err))
        },
        clickForgotPassword() {
            this.forgot.unique_token = Math.random().toString(36).substr(2, 7)
            this.$axios.$post('/users/payslip-forgot-password', this.forgot)
                .then(res => {
                    console.log(this.forgot)
                    this.forgotPayslipPassword = true
                    this.$axios.$put('/users/add-unique-token', this.forgot)
                        .then(res => {
                            console.log("email sent")
                        })
                        .catch(e => console.log(e));
                })
                .catch(e => {
                    this.forgotPayslipPasswordError = true
                })
        },
        async updateUserPayslipPassword() {
            const token = this.token
            const AuthStr = "Bearer ".concat(token);
            const CryptoJS = require("crypto-js")
            let val = CryptoJS.SHA256('seGSXTIca123c').toString(CryptoJS.enc.Hex)
            if (this.password_new === this.password_match) {

                let body = {
                    _id: this.user_id,
                    pwd: this.password_new,
                    enc: val
                }

                await this.$axios.$post("users/update-payslip-pwd", body, { headers: { Authorization: AuthStr } })
                    .then(async res => {
                        if (res.success && res.success == true) {
                            this.dialog_password_check = false
                            this.payslipFirstLogin = false
                            this.show_payslips = true
                            this.password_match = ''
                            this.password_new = ''
                        } else {
                            console.log(res.message)
                        }
                    }).catch()
            } else {
                this.password_mismatch_alert = true
            }


        },
        async loginWithOkta(emailParam) {
            this.oktaloading = true

            console.log('here')

            user = await this.$axios.$get('users/payslip-validation/okta/' + emailParam)



            if (user.hasOwnProperty('token')) {
                this.token = user.token
                await this.getSelectedCompany()
                await this.getPayslips()
                this.password_mismatch_alert = false
                this.show_payslips = true
                this.dialog_password_check = false
                this.oktaloading = false

            } else {
                this.oktaloading = false
                this.password_mismatch_alert = true
            }

        },

        async authorizeWithOkta() {
            const { verifier, challenge } = await new Promise((resolve) => {
                getPkce(43, (error, { verifier, challenge }) => {
                    if (error) throw error;
                    resolve({ verifier, challenge });
                });
            });
            // window.location = `https://trial-7566090.okta.com/oauth2/default/v1/authorize?client_id=0oa5wthwamzXUR63H697&redirect_uri=http://localhost:4501/users/callback&response_type=code&scope=openid email&state=${verifier}&code_challenge=${challenge}&code_challenge_method=S256`;
            window.location = `https://Schonfeld.okta.com/oauth2/v1/authorize?client_id=0oa3xjx4dm5nJnclq697&redirect_uri=https://payrollapi.nathanhr.com/users/callback&response_type=code&scope=openid email profile&state=${verifier}&code_challenge=${challenge}&code_challenge_method=S256`;
        },
        async getCompany() {
            let companyId = this.urlParams.split('-')[0]
            let company = await this.$axios.$get('companies/get_company_name/no_validation/' + companyId).then(res => {
                if (res.length > 0) {
                    // this.currentCompany = res[0].company_name
                    // this.currentCompanyLogo = res[0].logo
                }
            })

        },
        loadServiceList(data) {
            this.payslipData = data;
        },
        compare(a, b) {
            if (a === b) {
                return true
            } else return false
        },
        reload() {
            this.$router.go()
        },
        // getUserinfo(){
        //     this.user = this.$store.getters.getUser
        // },

        async showPayslipDialog() {
            let password_match = await this.compare(this.checkPassword, this.user.emp_id)
            if (password_match == true) {
                this.password_mismatch_alert = false
                this.show_payslips = true
                this.dialog_password_check = false
            }
            else {
                this.password_mismatch_alert = true
            }
        },
        async validatePayslipUser() {
            if (this.checkPassword != '') {
                this.loading = true
                let user = {}
                if (this.urlParams.split('-').length > 1) {
                    user = await this.$axios.$get('users/payslip-validation/uniq_password/' + this.checkPassword + "/" + this.urlParams.split("-")[1])
                    console.log(user)
                    console.log(this.urlParams.split("-")[1])
                } else {
                    user = await this.$axios.$get('users/payslip-validation/' + this.checkPassword)
                }
                if (user.hasOwnProperty('token')) {
                    this.token = user.token
                    await this.getSelectedCompany()
                    await this.getPayslips()
                    if (this.urlParams.split('-').length > 1) {
                        if (user.isPayslipFirstLogin) {
                            console.log("here")
                            this.payslipFirstLogin = true
                        } else {
                            console.log("nothere")
                            this.dialog_password_check = false
                            this.payslipFirstLogin = false
                            this.show_payslips = true
                        }
                    } else {
                        this.show_payslips = true
                        this.dialog_password_check = false
                    }
                    this.password_mismatch_alert = false


                    this.loading = false

                } else {
                    this.loading = false
                    this.password_mismatch_alert = true
                }
            }
        },
        async getPayslips() {
            const token = this.token
            const AuthStr = "Bearer ".concat(token);
            const CryptoJS = require("crypto-js")
            let val = CryptoJS.SHA256('seGSXTIca123c').toString(CryptoJS.enc.Hex)

            if (this.urlParams.split('-')[2]) {
                await this.$axios.$post("payslips/user/crypto-val/" + this.user_id, { enc: val }, { headers: { Authorization: AuthStr } })
                    .then(async res => {
                        this.payslips = _.orderBy(res, ['pay_month'], ['desc'])
                        this.payslipData = this.payslips[0]
                        if (res.length > 0) {
                            await this.$axios.$post("users/crypto-val/" + this.payslips[0].user_id, { enc: val }, { headers: { Authorization: AuthStr } })
                                .then(async res1 => {
                                    this.user = res1[0]
                                    await this.$axios.$post("companies/crypto-val/" + this.payslips[0].company_id, { enc: val }, { headers: { Authorization: AuthStr } })
                                        .then(async res3 => {
                                            this.company_data = res3[0]
                                            this.completedFlag = true
                                            await this.configuration.push(this.company_data.configuration)
                                        }).catch()
                                }).catch()
                        }
                    }).catch()
            }
            else {
                await this.$axios.$post(this.selectedCompany[0].base_url + "/payslips/user/crypto-val/" + this.user_id, { enc: val }, { headers: { Authorization: AuthStr } })
                    .then(async res => {
                        this.payslips = _.orderBy(res, ['pay_month'], ['desc'])
                        this.payslipData = this.payslips[0]
                        if (res.length > 0) {
                            await this.$axios.$post(this.selectedCompany[0].base_url + "/users/crypto-val/" + this.payslips[0].user_id, { enc: val }, { headers: { Authorization: AuthStr } })
                                .then(async res1 => {
                                    this.user = res1[0]
                                    await this.$axios.$post(this.selectedCompany[0].base_url + "/configuration/crypto-val/all", { enc: val }, { headers: { Authorization: AuthStr } })
                                        .then(async res2 => {
                                            this.configuration = res2
                                            await this.$axios.$post(this.selectedCompany[0].base_url + "/companies/crypto-val/" + this.payslips[0].company_id, { enc: val }, { headers: { Authorization: AuthStr } })
                                                .then(res3 => {
                                                    this.company_data = res3[0]
                                                    this.completedFlag = true
                                                }).catch()
                                        }).catch()
                                }).catch()
                        }
                    }).catch()
            }
        },
        async getSelectedCompany() {
            const token = this.token
            const AuthStr = "Bearer ".concat(token);

            this.company_id = this.urlParams.split("-")[0]
            this.user_id = this.urlParams.split("-")[1]

            if (this.urlParams.split("-") && this.urlParams.split("-")[2]) {
                this.internal_company = this.urlParams.split("-")[2]
                this.selectedCompany = await this.$axios.$get('companies/' + this.company_id, { headers: { Authorization: AuthStr } })
            } else {
                this.selectedCompany = await this.$axios.$get('companies/' + this.company_id, { headers: { Authorization: AuthStr } })
            }
            console.log(this.selectedCompany)





        },
        tolower(val) {
            return val.replace(/(?: |&)/g, "_").toLowerCase()
        },
    },
    computed: {
        // checkPasswordNew() {
        //     let password_length = this.password_new.length;
        //     const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        //     if (password_length > 7) {
        //         this.contains_eight_characters = true;
        //     }
        //     else {
        //         this.contains_eight_characters = false;
        //     }
        //     this.contains_number = /\d/.test(this.password_new);
        //     this.contains_uppercase_lowercase = (/[A-Z]/.test(this.password_new) && /[a-z]/.test(this.password_new));
        //     this.contains_special_character = format.test(this.password_new);
        //     if (this.contains_eight_characters === true && this.contains_special_character === true && this.contains_uppercase_lowercase === true && this.contains_number === true) {
        //         this.valid_password = true;
        //     }
        //     else {
        //         this.valid_password = false;
        //     }
        //     return this.valid_password
        // },
        // visiblePages() {
        //     let abc = _.orderBy(this.payslips, ['pay_month'], ['desc'])
        //     return abc.slice((this.page - 1) * this.perPage, this.page * this.perPage)
        // },
        // hashIt() {
        //     var salt = bcrypt.genSaltSync(10);
        //     var ress
        //     bcrypt.hash(this.user.emp_id, salt, (err, res) => {

        //         // hash = res
        //         ress = res
        //     });
        //     return ress
        // },
    }
}
</script>

<style scoped>
.height-vh {
    height: 100vh
}

.center-align {
    display: flex;
    align-items: center;
    /* Vertical center alignment */
    justify-content: center;
}
</style> 
<style>
.v-dialog {
    border-radius: 0 !important;
}

.mdi-password::before {
    content: url('/login/password.svg') !important;
    ;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(359deg);
    }
}

.circle {
    animation: spin 1s linear infinite;

}

@keyframes shrink {
    0% {
        max-width: 150px !important;
        min-width: 150px !important;
        border-radius: 90% !important;
    }

    25% {
        max-width: 110px !important;
        min-width: 110px !important;
        border-radius: 80% !important;
    }

    50% {
        max-width: 80px !important;
        min-width: 80px !important;
        border-radius: 70% !important;
    }

    100% {
        max-width: 50px !important;
        min-width: 50px !important;
        border-radius: 50% !important;
    }
}

.loginButton {
    transition: all 250ms ease-in-out;
    margin: 0 auto;
}

.loginButton {
    max-width: 50px !important;
    min-width: 50px !important;
    border-radius: 50% !important;

}

.backgroundImg {
    background: url("/payslip/NNB.svg") no-repeat center;
    background-size: contain;
    background-blend-mode: multiply;
}

.backgroundImg2 {
    background: url("/payslip/blueb.svg") no-repeat center;
    background-size: cover;
}

.customIconSize {
    min-width: 22px;
    max-width: 22px;
    min-height: 22px;
    max-height: 22px;
}

.customTickk .mdi-check-circle-outline::before {
    content: url("/payslip/tick.svg") !important;
    background-size: cover;
}
</style>