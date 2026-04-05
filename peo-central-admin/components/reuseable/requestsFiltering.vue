<template>
    <div>
        <v-row class="mx-0" style="max-width:100%">
            <v-col cols="12" sm="6" md="4">
                <v-btn style="width:100%;height:150px" @click="selectFilter('ALL')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'ALL' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'ALL' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">All Requests</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium">{{ computedTotalReqCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4"
                v-if="configData && configData.length > 0 && configData[0].requestTypes && configData[0].requestTypes.includes('Leave')">
                <v-btn style="width:100%;height:150px" @click="selectFilter('Leave')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'Leave' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'Leave' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">Leave</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/leaveReq.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#5C7EEF !important">
                                        {{ computedAllReqCountObj.leaveCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4" v-if="adminCentral || teamCentral">
                <v-btn style="width:100%;height:150px" @click="selectFilter('attendance')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'attendance' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'attendance' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">Attendance</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/attendanceReq.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#5C7EEF !important">
                                        {{ computedAllReqCountObj.attendanceCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4"
                v-if="configData && configData.length > 0 && configData[0].requestTypes && configData[0].requestTypes.includes('wfh')">
                <v-btn style="width:100%;height:150px" @click="selectFilter('wfh')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'wfh' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'wfh' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">WFH</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/wfhReq.svg" max-width="fit-content" height="fit-content" class="mr-2"
                                        contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#008E48 !important">
                                        {{ computedAllReqCountObj.wfhCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4"
                v-if="configData && configData.length > 0 && configData[0].requestTypes && configData[0].requestTypes.includes('Letters')">
                <v-btn style="width:100%;height:150px" @click="selectFilter('letters')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'letters' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'letters' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">Letter</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/letterReq.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#E5CCC2 !important">
                                        {{ computedAllReqCountObj.letterCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4"
                v-if="configData && configData.length > 0 && configData[0].requestTypes && configData[0].requestTypes.includes('Claims')">
                <v-btn style="width:100%;height:150px" @click="selectFilter('claims')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'claims' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'claims' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">Claims</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/claimsReq.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#B7BDE5 !important">
                                        {{ computedAllReqCountObj.claimsCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4"
                v-if="configData && configData.length > 0 && configData[0].requestTypes && configData[0].requestTypes.includes('Loan')">
                <v-btn style="width:100%;height:150px" @click="selectFilter('loan')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'loan' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'loan' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">Loan</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/claimsReq.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#B7BDE5 !important">
                                        {{ computedAllReqCountObj.loanCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4"
                v-if="configData && configData.length > 0 && configData[0].requestTypes && configData[0].requestTypes.includes('Education Allowance')">
                <v-btn style="width:100%;height:150px" @click="selectFilter('education')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'education' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'education' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">Education</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/claimsReq.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#B7BDE5 !important">
                                        {{ computedAllReqCountObj.educationCount }}</p>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="6" md="4"
                v-if="configData && configData.length > 0 && configData[0].requestTypes && (configData[0].requestTypes.includes('Passport Release/Safekeep'))">
                <v-btn style="width:100%;height:150px" @click="selectFilter('passport')"
                    :class="loading ? 'filterButtonDisable' : ''" class="borderRadiusCards textTransformUnset "
                    :style="selectedFilter == 'passport' ? 'border:solid 1px #ddd8ff' : ''" elevation="0"
                    :color="selectedFilter == 'passport' ? '#FFF' : '#F8F9FD'">
                    <v-row class="mx-0" style="max-width:100%">
                        <v-col cols="12">
                            <p style="text-align:start">Passport</p>
                            <v-row class="mx-0 pt-3" style="max-width:100%">
                                <v-col cols="6" class="pa-0">
                                    <v-img src="/team/claimsReq.svg" max-width="fit-content" height="fit-content"
                                        class="mr-2" contain></v-img>
                                </v-col>
                                <v-col cols="6" class="px-0">
                                    <p class="headingFontSize font-weight-medium" style="color:#B7BDE5 !important">
                                    {{computedAllReqCountObj.passportCount}}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="4"
            v-if="configData && configData.length > 0 && configData[0].requestTypes && (configData[0].requestTypes.includes('Salary Adjustment') ) && (adminCentral || teamCentral)">
            <v-btn style="width:100%;height:150px" @click="selectFilter('salary')"
                :class="loading ? 'filterButtonDisable':''" class="borderRadiusCards textTransformUnset "
                :style="selectedFilter == 'salary' ? 'border:solid 1px #ddd8ff':''" elevation="0"
                :color="selectedFilter == 'salary' ? '#FFF':'#F8F9FD'">
                <v-row class="mx-0" style="max-width:100%">
                    <v-col cols="12">
                        <p style="text-align:start"><span>Salary</span> <br> <span
                                >Adjustment</span></p>
                        <v-row class="mx-0 pt-3" style="max-width:100%">
                            <v-col cols="6" class="pa-0">
                                <v-img src="/team/claimsReq.svg" max-width="fit-content" height="fit-content"
                                    class="mr-2" contain></v-img>
                            </v-col>
                            <v-col cols="6" class="px-0">
                                <p class="headingFontSize font-weight-medium" style="color:#B7BDE5 !important">
                                    {{computedAllReqCountObj.salaryCount}}</p>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-btn>
        </v-col>
    </v-row>
</div></template>
<script>

export default {
    props: ['configData', 'selectedFilter', 'computedTotalReqCount', 'computedAllReqCountObj', 'adminCentral', 'teamCentral', 'loading'],
    data() {
        return {

        }
    },
    methods: {
        selectFilter(data) {
            this.$emit("selectFilter", data);
        }
    }
}
</script>
<style scoped>.filterButtonDisable {
    pointer-events: none;
    /* mix-blend-mode: luminosity !important; */
}</style>