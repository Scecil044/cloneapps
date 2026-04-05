<template>
    <div>
        <v-progress-linear indeterminate v-if="newProgress"></v-progress-linear>
        <v-row class="mx-auto" style="max-width:80%">
            <v-col cols="12" sm="12" md="12">
                <v-form ref="form">
                    <v-row class="pt-4">
                        <v-col class="" cols="12" sm="12" md="12">
                            <p class="grey-heading-text font-weight-medium textFontSize">Description <span
                                    class="red--text">*</span></p>
                            <v-textarea dense rows="2" v-model="request.letter_fields.description" class="redTextForm"
                                :rules="genericRule"></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="text-right">
                            <v-btn dark color="primary" @click.prevent="createPassportSafekeepRequest()"
                                v-if="!passportRequestAdding"
                                class="ml-3 border-radius-medium font-weight-medium subHeadingFontSize textTransformUnset"
                                elevation="0">Submit</v-btn>
                            <v-progress-circular indeterminate color="primary"
                                v-if="passportRequestAdding"></v-progress-circular>
                        </v-col>
                    </v-row>
                </v-form>
                <!-- snackbar -->
                <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
                    {{ snackText }}

                    <template v-slot:action="{ attrs }">
                        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
                    </template>
                </v-snackbar>
            </v-col>
        </v-row>
    </div>
</template>

<script>
// import notificationMethod from "~/plugins/notification";
import moment from 'moment'

export default {
    layout: "dashboard",
    props: [
        "request",
        'user',
        'selectedEmp',
        'companyData',
        'userType'
    ],
    data() {
        return {
            passportRequestAdding: false,
            snack: false,
            snackColor: "",
            snackText: "",
            newProgress: false,
            genericRule: [(v) => !!v || "This field is Required"],
            uploadFiles: '',
        };
    },
    mounted() {
    },
    created() {

    },
    methods: {
        async createPassportSafekeepRequest() {
            if (this.$refs.form.validate()) {

                this.passportRequestAdding = true
                const token = this.$store.getters.getToken
                const AuthStr = 'Bearer '.concat(token);

                let body = {
                    date: moment(new Date()).format("YYYY-MM-DD"),
                    description: this.request.letter_fields.description,
                    userType: this.userType,
                    applied_manager: this.user._id,
                    user_id: this.selectedEmp._id
                }

                let apply_passport_request = await this.$axios.$post("/passport/safekeep_request", body, { headers: { Authorization: AuthStr } })

                if (apply_passport_request && apply_passport_request.success) {
                    this.snack = true
                    this.snackText = 'Your request is on its way!'
                    this.snackColor = 'green'
                    this.$refs.form.reset()
                    this.passportRequestAdding = false
                    this.$nuxt.$emit("refreshRequests", false);
                    // notificationMethod.new(this.user._id,body.user_id,body.loan_type,'New Loan Request Submitted','/dashboards/myhr#loan')
                } else {
                    if (apply_passport_request && !apply_passport_request.success) {
                        this.snack = true
                        this.snackText = apply_passport_request.message
                        this.snackColor = 'error'
                        this.passportRequestAdding = false
                    } else {
                        this.snack = true
                        this.snackText = 'Request Failed'
                        this.snackColor = 'error'
                        this.passportRequestAdding = false
                    }
                }
            } else {
                this.snack = true
                this.snackText = 'Required fields cannot be empty'
                this.snackColor = 'error'
            }
        },

        onUploadFiles(event) {
            this.uploadFiles = event;
        },
        async uploadFile(val) {
            const token = this.$store.getters.getToken;
            const AuthStr = "Bearer ".concat(token);

            const fd = new FormData();
            fd.append("a", val.file, val.name);
            fd.append("b", this.selectedEmp._id + Date.now() + val.file.name);
            fd.append("folder", "loans");

            await this.$axios
                .$post("/requests/upload-file", fd, {
                    headers: { Authorization: AuthStr },
                })
                .then((res) => {
                    this.link_url = res.url;
                    this.link_filename = res.name;
                })
                .catch((e) => console.log(e));
        },

    },

    computed: {
    }
};
</script>
<style  lang="scss">
.redTextForm {
    .v-text-field__details {
        display: block !important;

        .v-messages {
            .v-messages__wrapper {
                .v-messages__message {
                    color: #f42121 !important;
                }
            }
        }
    }
}</style>