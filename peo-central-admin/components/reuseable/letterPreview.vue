<template>
    <v-card class="my-0 rounded-xl" min-height="1200">

        <v-col cols="12" class="pt-5 pr-0" v-if="$route.path.startsWith('/configuration')">
            <h3>Preview</h3>
        </v-col>
        <!-- Header -->
        <v-col cols="12" class="mt-3 " v-if="getCompanyDetails && header">
            <img style="width: 100%;" contain :src="getCompanyDetails ? getCompanyDetails.headerImageLink : ''" />
        </v-col>
        <!-- Letter body -->
        <v-row class="ma-5">
            <!-- left sidebar -->
            <v-col cols="12" :md="leftSidebarCol" :sm="leftSidebarCol" :lg="leftSidebarCol" class="pa-0 pt-30 caption"
                v-if="leftsidebar">
                <div>
                    <div class="backgroundImg ml-0 pl-0" :style="leftSidebarLink" v-html="emptyhtml"
                        style="background-position: left"> </div>
                </div>
            </v-col>

            <v-col cols="12" :md="bodyCol" :sm="bodyCol" :lg="bodyCol" class="pt-5 pr-0 caption">
                <!-- Date -->
                <v-col cols="12" md="12" sm="12" lg="12" class="pa-0 caption">
                    <div :class="dateClass" class="pt-5" v-html="date"></div>
                </v-col>
                <!-- To address -->
                <v-col cols="12" md="12" sm="12" lg="12" class="pa-0 caption">
                    <!-- <span :class="toAddressClass">To,</span><br /> -->
                    <div :class="toAddressClass" class="pt-5" v-html="toAddress"></div>
                </v-col>
                <!-- Subject -->
                <v-col cols="12" md="12" sm="12" lg="12" class="pa-0 caption">
                    <pre :class="subjectClass" class="pt-5" style="" v-html="subject"></pre>
                </v-col>
                <!-- body -->
                <v-col cols="12" md="12" sm="12" lg="12" class="pa-0 caption">
                    <div :style="inlineStyle" v-if="watermark"
                        style="background-size: cover; background-repeat: no-repeat;height:100%">
                        <div class="text_alignment_left pt-5" v-html="body"> </div>
                    </div>
                    <div v-else class="text_alignment_left pt-5" v-html="body"> </div>
                </v-col>
                <v-row>
                    <!-- Signature -->
                    <v-col cols="12" md="4" sm="4" lg="4" class="caption pa-0 text_alignment_left">
                        <v-img v-if="signatureShow" :src="signature"
                            style="width : 100%; height : 100%; float:   right;"></v-img>
                    </v-col>
                    <!-- Stamp -->
                    <v-col cols="12" md="4" sm="4" lg="4" class="text_alignment_left" v-if="getCompanyDetails && stamp">
                        <v-img :src="getCompanyDetails ? getCompanyDetails.companyStampLink : ''"
                            style="max-width : 103px; max-height : 103px"></v-img>
                    </v-col>
                    <br />

                    <br />
                </v-row>
                <!-- Manager name -->
                <v-col cols="12" md="12" sm="12" lg="12" class="pa-0 caption" v-if="signatory">
                    <div class="pt-5 text_alignment_left">
                        <span><b>{{ managerName }}</b></span>
                        <br />
                        <!-- Manager designation -->
                        <span><b>{{ designation }}</b></span><br />
                        <br /><br />
                    </div>
                </v-col>
            </v-col>
            <!-- right sidebar -->
            <v-col cols="12" :md="rightSidebarCol" :sm="rightSidebarCol" :lg="rightSidebarCol" class="pa-0 pt-30 caption"
                v-if="rightsidebar">
                <div>
                    <div class="backgroundImg ml-0 pl-0" :style="rightSidebarLink" v-html="emptyhtml"
                        style="background-position: right"> </div>
                </div>
            </v-col>
        </v-row>


        <v-row>
            <v-col cols="12" md="12" sm="12" lg="12">
                <div class="pb-3" style="position: absolute; bottom:0; width: 100%;">
                    <v-row class="" style=" ">
                        <!-- Footer -->
                        <v-col cols="12" sm="12" lg="12" md="12" class="text_alignment_center"
                            v-if="getCompanyDetails && footer">
                            <hr style="color: #1976d2" />
                            <img style="width : 100%;" contain
                                :src="getCompanyDetails ? getCompanyDetails.footerImageLink : ''" />
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>

    </v-card>
</template>

<script>
export default {
    layout: 'dashboard',
    props: ['date', 'toAddress', 'toAddressClass', 'subject', 'subjectClass', 'body',
        'signature', 'managerName', 'designation', 'getCompanyDetails', 'inlineStyle',
        'height', 'customerLetter', 'dateClass', 'header', 'footer', 'stamp', 'signatureShow',
        'watermark', 'signatory', 'leftSidebarCol', 'rightSidebarCol', 'bodyCol', 'rightsidebar',
        'leftsidebar', 'leftSidebarLink', 'rightSidebarLink'],
    data() {
        return {
            emptyhtml: "<p></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></br></p>"
        }
    },
}
</script>
<style scoped>
.backgroundImg {
    margin-left: 20px;
    margin-right: 20px;
    background-size: 18px;
    /* background-position: right; */
}

.email.v-input #input-68 {
    text-transform: lowercase;
}

.v-messages__message {
    color: rgb(61, 24, 226) !important;
}

pre {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
}

.text_alignment_right {
    text-align: right;
}

.text_alignment_left {
    text-align: left;
}

.text_alignment_center {
    text-align: center;
}

.desc ::v-deep p {
    margin: 0px;
    padding: 0px;
}

.border-1 {
    border: 1px solid #eee;
}

.cat-input,
.title-input {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.post-inputs {
    display: grid;
    width: 90%;
    grid-gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    padding-bottom: 15px;
    padding-top: 15px;
    /* padding: 20px; */
}

.ql-editor {
    min-height: 300px !important;
}

.ql-container {
    min-height: 200px !important;

}

.inner-image-input {
    display: flex;
    align-items: center;
}

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.post-actions-row {
    display: flex;
    justify-content: space-between;
    padding: 10px;
}

.ivu-icon-ios-camera-outline {
    font-size: 16px;
}

.btn-delete {
    color: #2d8cf0 !important;
    border: 1px solid #2d8cf0 !important;
}

.btn-delete:hover {
    color: red !important;
    border: 1px solid red !important;
}
</style> 