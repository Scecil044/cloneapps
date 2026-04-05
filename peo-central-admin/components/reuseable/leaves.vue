<template>
    <div class="">
        <v-container class="pa-0">
            <v-card class="white " flat>
                <v-row justify="center" class="">
                    <v-col cols="4" sm="12" md="3" class="text-center caption px-0" v-for="(leave, key) in filteredLeave"
                        :key="key">
                        <v-btn fab large class="text-h5 white--text" elevation="0"
                            :color="getLeaveColor(keyNameRegex(key))">{{ leaves[key] }}</v-btn>
                        <p class="mb-0 mt-1 textFontSize font-weight-normal darkBlue-heading-text"
                            v-if="key != 'unpaid_leaves'">{{ keyNameRegex(key) }}</p>
                        <p class="mb-0 mt-1 textFontSize font-weight-normal darkBlue-heading-text"
                            v-else-if="showUnpaid == true">{{ keyNameRegex(key) }} <span style="color:#FF0B00">*</span></p>
                    </v-col>
                </v-row>
            </v-card>
        </v-container>
    </div>
</template>


<script>
import moment from 'moment'

export default {
    props: ['leaves', 'profilePage', 'showUnpaid', 'user'],
    data() {
        return {

        }
    },

    mounted() {

    },
    methods: {
        keyNameRegex(val) {
            if (val != undefined) {
                return _.startCase(val.replace(/_/g, " "))
            }
            else {
                return ''
            }
        },
        getLeaveColor(val) {
            // if(val == "Annual Leaves") return '#5C7EEF'
            if (val == "Annual Leaves") {
                let today = moment(new Date()).format('YYYY-MM-DD')
                let doj = moment(this.user.date_of_joining)
                let pd = doj.add(this.user.employment.probation_days, 'days').format('YYYY-MM-DD')
                return today < pd ? '#dfdbdb' : '#5C7EEF'
            }
            if (val == "Medical Leaves") return '#6869AC'
            if (val == "Emergency Leaves") return '#7B658B'
            if (val == "Parental Leaves") return '#5C7EEF'
            if (val == "Maternity Leaves") return '#5C7EEF'
            if (val == "Unpaid Leaves") return '#94879A'
            // if(val == "Study Leaves") return '#6869AC'
            if (val == "Study Leaves") {
                let today = moment(new Date()).format('YYYY-MM-DD')
                let doj = moment(this.user.date_of_joining)
                let canAvail = doj.add(730, 'days').format('YYYY-MM-DD')
                return today < canAvail ? '#dfdbdb' : '#6869AC'
            }
            // if(val == "Hajj Leaves") return '#5C7EEF'
            if (val == "Hajj Leaves") {
                let today = moment(new Date()).format('YYYY-MM-DD')
                let doj = moment(this.user.date_of_joining)
                let canAvail = doj.add(365, 'days').forfilteredLeavemarital_statusmat('YYYY-MM-DD')
                return today < canAvail ? '#dfdbdb' : '#6869AC'
            }
            if (val == "Compassionate Leaves") return '#7B658B'
        }
    },
    computed: {
        filteredLeave() {
            let allLeave = _.cloneDeep(this.leaves)
            if (this.showUnpaid != true) {

                delete allLeave['unpaid_leaves']
            }
            // if(this.user && this.user.personal && this.user.personal.gender && this.user.personal.gender.toLowerCase() != 'female'){
            //     delete allLeave['maternity_leaves']
            // }
            if (this.user && this.user.personal && this.user.personal.gender && this.user.personal.gender.toLowerCase() != 'female') {
                delete allLeave['maternity_leaves']
            } else if (this.user && this.user.personal && this.user.personal.marital_status && this.user.personal.marital_status.toLowerCase() != 'married') {
                delete allLeave['maternity_leaves']
            }
            if (this.user && this.user.personal && this.user.personal.religion && this.user.personal.religion.toLowerCase() != 'muslim') {
                delete allLeave['hajj_leaves']
            }
            if (this.user && this.user.personal && this.user.personal.marital_status && this.user.personal.marital_status.toLowerCase() == 'single') {
                delete allLeave['parental_leaves']
            }
            return allLeave
        }
    }
}
</script>

<style lang="scss" scoped></style>