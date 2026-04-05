<template>
    <div class="login_wrapper">
        <SnackBar :data="snackbar_data" />
        <v-card flat class="login_wrapper">
            <v-row>
                <!--LEFT SIDE-->
                <v-col sm="0" md="6" lg="6" class="d-none d-sm-none d-md-flex" id="ls__col">
                    <v-row class="py-9">
                        <v-col cols="12" class="ls__con">
                            <v-row style="min-height: 20% !important">
                                <v-col cols="4">
                                    <div class="header__sec">
                                        <v-img src="/nathandigital-slogo.svg" min-width="50" max-width="100"></v-img>
                                        <v-divider vertical class="divider white"></v-divider>
                                        <v-img src="/accountingtext.png" min-width="50" max-width="100" />
                                    </div>
                                </v-col>
                            </v-row>
                            <v-spacer></v-spacer>
                            <v-row style="min-height: 20% !important">
                                <v-col cols="12" class="img__sec">
                                    <v-img src="/Login/accounting-preview.png"></v-img>
                                </v-col>
                            </v-row>
                            <v-spacer></v-spacer>
                            <v-row style="min-height: 20% !important">
                                <!-- <v-col cols="12" class="text-center">
                                    <h2 class="text_light--text">Simple yet powerful accounting software for businesses</h2>
                                    <p class="mt-5 subtitle subtext--text text-center">Track expenses, customize invoices, run reports and even more all from one place.</p>
                                </v-col> -->
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
                <!--LOGIN CARD-->
                <v-col sm="12" md="6" lg="6" id="rs" class="ma-auto text-center justify-center align-center d-flex flex-column">
                    <v-card class="my-5 borderRadiusCards eventCard boxShadowCard" width="550" min-height="670">
                        <v-img class="eventCardImg" style="background: #505771" height="245" src="https://erp.nathanhr.com/login/bg-image.png">
                            <v-img width="180" height="100%" style="margin: auto" src="https://www.nathandigital.com/static/media/LogoLogo.c6dea5d239143387d7fe95dee7c1e554.svg" contain></v-img>
                        </v-img>
                        <div class="curve-parent pa-xl-5">
                            <div class="curve">
                                <v-img class="curveImage2" width="70" height="70" src="/Login/lock-icon.svg" contain></v-img>
                            </div>
                            <v-row justify="center" align="center">
                                <v-col class="px-13">
                                    <v-form @submit.prevent="setNewPassword" id="check-login-form" ref="form" style="padding-top:20px">
                                        <v-card-text class="pb-0 pt-7 pr-0 px-13">
                                            <v-row>
                                                <v-col cols="12" class="pl-0" style="text-align:start">
                                                    <p class="textFontSize font-weight-normal" style="text-align: start;">Please enter your new password</p>
                                                </v-col>
                                            </v-row>
                                        </v-card-text>
                                        <v-card-text  class="py-0 px-13 my-0">
                                            <p class="mb-0 text-left font-weight-normal grey-heading-text textFontSize">New Password<span class="red--text">*</span></p>
                                            <v-text-field name="New Password" label=""  :append-icon="show1 ? 'fa-duotone fa-eye-slash' : 'fa-duotone fa-eye fa-2xs'" @click:append ="show1 = !show1" :type="show1 ? 'password' : 'text'" v-model="user.password"  :rules="checkPassword" v-if="!isNewPasswordSaved"></v-text-field>
                                            <p class="mb-0 mt-3 text-left font-weight-normal grey-heading-text textFontSize">Re-enter New Password<span class="red--text">*</span></p>
                                            <v-text-field  name="Re-enter New Password" label=""  :append-icon="show2 ? 'fa-duotone fa-eye-slash' : 'fa-duotone fa-eye fa-2xs'" @click:append ="show2 = !show2" :type="show2 ? 'password' : 'text'" v-model="password_match"  :rules="checkPassword" v-if="!isNewPasswordSaved"></v-text-field>
                                            <v-alert :value="isNewPasswordSaved" outlined style="border:solid 1px #009966;background-color:#009966" class="borderRadiusInfo align-center pa-3" type="success" transition="scale-transition">
                                                Password Reset Successful! 
                                            </v-alert>
                                            <v-alert :value="isNotSaved" outlined style="border:solid 1px #E59B96;background-color:#FFF6F5" class="borderRadiusInfo align-center pa-3" type="error" transition="scale-transition">
                                                Cannot save new password.ID expired. <a href="" class="white--text" @click.prevent="backToLogin">Click here</a> to request a new one.
                                            </v-alert>
                                        </v-card-text>
                                        <v-card-actions class="px-13">
                                            <v-btn type="submit" block form="check-login-form" style="min-height: 51px;justify-content:space-between" class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"  v-if="!isNewPasswordSaved"><span class="white--text">Send</span><v-icon color="#fff" class="mx-4">mdi-chevron-right</v-icon> </v-btn>
                                            <v-btn type="submit" @click.prevent="backToLogin" block form="check-login-form" style="min-height: 51px;justify-content:space-between" class="buttonBackgroundShade borderRadiusInfo pl-5 textTransformUnset"  v-else><span class="white--text">Back to login</span><v-icon color="#fff" class="mx-4">mdi-chevron-right</v-icon> </v-btn>
                                        </v-card-actions>
                                    </v-form>
                                </v-col>
                            </v-row>
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
        components: { SnackBar },
        name: 'LoginPage',
        layout: 'login',
        data(){
            return {
                snackbar_data: {
                    snackbar: false,
                    text: '',
                    color: '',
                    icon: '',
                    timeout: 2000,
                },
                show1: true,
                show2: true,
                user: {
                    id: "",
                    password: '',
                    unique_token: '',
                },
                checkPassword: [
                    v => !!v || 'Password is required'
                ],
                isNewPasswordSaved: false,
                password_match: "",
                isNotSaved: false,

            }
        },
        mounted(){

        },
        methods:{
            backToLogin(){
                this.$router.push("/")
            },
            async setNewPassword(){
                if(this.user.password == this.password_match) {
                    if (this.$refs.form.validate()) {
                        this.user.unique_token = this.$route.query.q
                        let obj = {
                            "password": this.user.password
                        }
                        await this.$axios.$post(`/users/auth/reset-password?token=${this.user.unique_token}`, obj)
                        .then((res) => {
                            this.isNewPasswordSaved = true
                            this.isNotSaved = false
                            this.$refs.form.reset()
                            this.snackbar_data = {
                                snackbar: true,
                                text: 'Password Has Been Reset Successfully!',
                                color: 'success',
                                icon: 'info',
                                timeout: 2000,
                            }
                        })
                    }
                } else {
                    this.snackbar_data = {
                        snackbar: true,
                        text: 'No Password Match.',
                        color: 'danger',
                        icon: 'info',
                        timeout: 2000,
                    }
                }
            }
        },
        computed: {

        }
    }
</script>
<style lang="scss"></style>