<template>
    <!-- <p>{{ emailHistory }}</p> -->
    <span v-if="emailHistory.length < 1">No Emails Sent out for this User</span>
    <v-row class="scroll" style="max-height : 880px;" v-else>
        <v-expansion-panels focusable>
            <v-expansion-panel v-for="(data, index) in emailHistory" :key="index">
                <v-expansion-panel-header>{{ index + 1 }}.&nbsp;{{ data.subject }} -
                    {{ data.createdAt | formatDate }}</v-expansion-panel-header>
                <v-expansion-panel-content style="text-align: initial;">
                    <p class="font-weight-bold">From: &nbsp;<span class="font-weight-light">
                            {{ data.to }}</span></p>
                    <p class="font-weight-bold">To: &nbsp;<span class="font-weight-light">
                            {{ data.cc }}</span></p>
                    <p class="font-weight-bold">Subject &nbsp;<span class="font-weight-light">
                            {{ data.subject }}</span></p>
                    <p class="font-weight-bold">Date Send: &nbsp;<span class="font-weight-light"> {{ data.createdAt |
                        formatDate }}</span></p>
                    <p class="font-weight-bold" v-if="data.body != ''">Body:</p>
                    <div class="grey lighten-3" v-html="data.body">
                    </div>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-row>
</template>


<script>


export default {
    props: ['employeeEmail'],
    data() {
        return {
            emailHistory: [],
        }
    },
    methods: {
        formatDate(value) {
            if (value) {
                return moment(String(value)).format('MMM DD, YYYY - h:mm a')
            }
        },
        async getAllEmails() {
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            await this.$axios.$post(`/emaillog/employees/` + this.employeeEmail, { headers: { Authorization: AuthStr } })
                .then((response) => {
                    this.emailHistory = response
                })
                .catch((err) => console.log(err))
        }
    },
    mounted() {
        this.getAllEmails()
    }
}


</script>


<style></style>