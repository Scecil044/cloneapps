<template>
    <div class="pa-0">
        <v-row class="">
            <v-col cols="2" class="text-right">
                <v-select outlined dense :items="pipelineList"  item-text="text" item-value="value" v-model="selectedPipelineList" placeholder="Select Duration" class="rounded-xl proposalDialog_date_field2" append-icon="fa-chevron-down" @change="getPipelineCount(selectedPipelineList)"></v-select>
            </v-col>
        </v-row>
        <v-overlay v-if="pipelineLoading" style="z-index:15 !important" opacity="0.5">
            <v-img src="/animated/gear.svg" max-width="fit-content" height="937" class="mr-2" contain></v-img>
        </v-overlay>
        <v-row class="d-flex flex-nowrap visa_pipeline_cards" v-else>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineMOL" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineUserAccept" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineMOLPreApproval" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineEVisa" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineStampedEvisa" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineMedicalTest" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineEidRegister" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineHealthIns" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelinePassportCollection" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineVisaStamping" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelinePassportStamped" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineEIDIssuance" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineMedicalCardIssuance" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'new visa process'">
                <pipelineCard :leadsData="VisaProcessPipelineLabourCardIssuance" />
            </v-col>

            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineMolLetter" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineMedicalTestApplication" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineMedicalTestCompleted" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineMedicalTestResult" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineEIDApplication" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineResidencyApproval" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineStampedResidenceVisa" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineEIDIssuance" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineLaborContractIssuance" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa renewal'">
                <pipelineCard :leadsData="VisaRenewPipelineLaborCardIssuance" />
            </v-col>

            <v-col cols="3" v-if="selectedPipelineList == 'visa cancellation'">
                <pipelineCard :leadsData="VisaCancelPipelineLaborCancellationTyping" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa cancellation'">
                <pipelineCard :leadsData="VisaCancelPipelineLaborCancellationSignature" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa cancellation'">
                <pipelineCard :leadsData="VisaCancelPipelineLaborCancellationApproval" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa cancellation'">
                <pipelineCard :leadsData="VisaCancelPipelineResidenceCancellation" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa cancellation'">
                <pipelineCard :leadsData="VisaCancelPipelineHealthInsuranceCancellation" />
            </v-col>
            <v-col cols="3" v-if="selectedPipelineList == 'visa cancellation'">
                <pipelineCard :leadsData="VisaCancelPipelinePortalAccessRevoked" />
            </v-col>
        </v-row>
    </div>
</template>
<script>
import '@/assets/scss/utils/_leadsPipeline.scss'
import pipelineCard from '~/components/Cards/PipelineCard/index.vue'
export default {
    components:{ pipelineCard },
    data(){
        return {
            pipelineLoading: false,
            pipelineList:[
                {
                    'text': 'New Visa Process',
                    'value': 'new visa process'
                },
                {
                    'text': 'Visa Renewal',
                    'value': 'visa renewal'
                },
                {
                    'text': 'Visa Cancellation',
                    'value': 'visa cancellation'
                }
            ],
            selectedPipelineList: 'new visa process',
            limit: '10',
            page: 0,
            VisaProcessPipelineMOL:[
                {
                    title: 'MOL Offer Letter',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineUserAccept:[
                {
                    title: 'User Accept of Job Offer',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineMOLPreApproval:[
                {
                    title: 'MOL Pre-Approval',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineEVisa:[
                {
                    title: 'E-Visa Application',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineStampedEvisa:[
                {
                    title: 'Stamped E-Visa',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineMedicalTest:[
                {
                    title: 'Medical Test Application',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineEidRegister:[
                {
                    title: 'E-ID Registration',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineHealthIns:[
                {
                    title: 'Health Insurance',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelinePassportCollection:[
                {
                    title: 'Passport Collections',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineVisaStamping:[
                {
                    title: 'Visa Stamping',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelinePassportStamped:[
                {
                    title: 'Passport Stamped Collection',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineEIDIssuance:[
                {
                    title: 'Emirates ID Card Issuance',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineMedicalCardIssuance:[
                {
                    title: 'Medical Card Issuance',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaProcessPipelineLabourCardIssuance:[
                {
                    title: 'Labour card & Contract',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineMolLetter:[
                {
                    title: 'MOL Letter',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineMedicalTestApplication:[
                {
                    title: 'Medical Tests Application',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineMedicalTestCompleted:[
                {
                    title: 'Medical Tests Completed',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineMedicalTestResult:[
                {
                    title: 'Medical Tests Result',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineEIDApplication:[
                {
                    title: 'EID Application',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineResidencyApproval:[
                {
                    title: 'Residency Approval',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineStampedResidenceVisa:[
                {
                    title: 'Stamped Residence Visa',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineEIDIssuance:[
                {
                    title: 'EID Issuance',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineLaborContractIssuance:[
                {
                    title: 'Labor Contract Issuance',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaRenewPipelineLaborCardIssuance:[
                {
                    title: 'Labor Card Issuance',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaCancelPipelineLaborCancellationTyping:[
                {
                    title: 'Labor Cancellation Typing',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaCancelPipelineLaborCancellationSignature:[
                {
                    title: 'Labor Cancellation Signature',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaCancelPipelineLaborCancellationApproval:[
                {
                    title: 'Labor Cancellation Approval',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaCancelPipelineResidenceCancellation:[
                {
                    title: 'Residence Cancellation',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaCancelPipelineHealthInsuranceCancellation:[
                {
                    title: 'Health Insurance Cancellation',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
            VisaCancelPipelinePortalAccessRevoked:[
                {
                    title: 'Portal Access Revoked',
                    timeDuration: '',
                    status: '',
                    count: '',
                    leads: [],
                },
            ],
        }
    },
    mounted(){
        this.getPipelineCount(this.selectedPipelineList)
    },
    methods: {
        async getPipelineCount(data){
            this.pipelineLoading = true
            this.page = 1
            const AuthStr = 'Bearer '.concat(this.$store.state.token)

            const obj = {
                "process_name": data
            }

            await this.$axios.$post('/visaprocess/pipeline/process', obj ,{ headers: { Authorization: AuthStr } })
            .then(async (response) => {
                if(data == 'new visa process') {
                    for(let i = 0; i < response.length; i++) {
                        const element = response[i]
                        if(element._id == 'MOL Offer Letter'){
                            this.VisaProcessPipelineMOL[0].title = element._id
                            this.VisaProcessPipelineMOL[0].count = element.count
                            this.VisaProcessPipelineMOL[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineMOL[0].leads = []
    
                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineMOL[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'User Accept of Job Offer'){
                            this.VisaProcessPipelineUserAccept[0].title = element._id
                            this.VisaProcessPipelineUserAccept[0].count = element.count
                            this.VisaProcessPipelineUserAccept[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineUserAccept[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineUserAccept[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '4 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'MOL Pre-Approval'){
                            this.VisaProcessPipelineMOLPreApproval[0].title = element._id
                            this.VisaProcessPipelineMOLPreApproval[0].count = element.count
                            this.VisaProcessPipelineMOLPreApproval[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineMOLPreApproval[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineMOLPreApproval[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '3 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'E-Visa Application'){
                            this.VisaProcessPipelineEVisa[0].title = element._id
                            this.VisaProcessPipelineEVisa[0].count = element.count
                            this.VisaProcessPipelineEVisa[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineEVisa[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineEVisa[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '2 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Stamped E-Visa'){
                            this.VisaProcessPipelineStampedEvisa[0].title = element._id
                            this.VisaProcessPipelineStampedEvisa[0].count = element.count
                            this.VisaProcessPipelineStampedEvisa[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineStampedEvisa[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineStampedEvisa[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '1 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Medical Test Application'){
                            this.VisaProcessPipelineMedicalTest[0].title = element._id
                            this.VisaProcessPipelineMedicalTest[0].count = element.count
                            this.VisaProcessPipelineMedicalTest[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineMedicalTest[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineMedicalTest[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '2 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'E-ID Registration'){
                            this.VisaProcessPipelineEidRegister[0].title = element._id
                            this.VisaProcessPipelineEidRegister[0].count = element.count
                            this.VisaProcessPipelineEidRegister[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineEidRegister[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineEidRegister[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '3 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Health Insurance'){
                            this.VisaProcessPipelineHealthIns[0].title = element._id
                            this.VisaProcessPipelineHealthIns[0].count = element.count
                            this.VisaProcessPipelineHealthIns[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineHealthIns[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineHealthIns[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '4 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Passport Collections'){
                            this.VisaProcessPipelinePassportCollection[0].title = element._id
                            this.VisaProcessPipelinePassportCollection[0].count = element.count
                            this.VisaProcessPipelinePassportCollection[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelinePassportCollection[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelinePassportCollection[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
                        
                        if(element._id == 'Visa Stamping'){
                            this.VisaProcessPipelineVisaStamping[0].title = element._id
                            this.VisaProcessPipelineVisaStamping[0].count = element.count
                            this.VisaProcessPipelineVisaStamping[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineVisaStamping[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineVisaStamping[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '4 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Passport Stamped Collection'){
                            this.VisaProcessPipelinePassportStamped[0].title = element._id
                            this.VisaProcessPipelinePassportStamped[0].count = element.count
                            this.VisaProcessPipelinePassportStamped[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelinePassportStamped[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelinePassportStamped[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '3 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Emirates ID Card Issuance'){
                            this.VisaProcessPipelineEIDIssuance[0].title = element._id
                            this.VisaProcessPipelineEIDIssuance[0].count = element.count
                            this.VisaProcessPipelineEIDIssuance[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineEIDIssuance[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineEIDIssuance[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '2 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Medical Card Issuance'){
                            this.VisaProcessPipelineMedicalCardIssuance[0].title = element._id
                            this.VisaProcessPipelineMedicalCardIssuance[0].count = element.count
                            this.VisaProcessPipelineMedicalCardIssuance[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineMedicalCardIssuance[0].lead = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineMedicalCardIssuance[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '1 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
    
                        if(element._id == 'Labour card & Contract'){
                            this.VisaProcessPipelineLabourCardIssuance[0].title = element._id
                            this.VisaProcessPipelineLabourCardIssuance[0].count = element.count
                            this.VisaProcessPipelineLabourCardIssuance[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaProcessPipelineLabourCardIssuance[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaProcessPipelineLabourCardIssuance[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
                    }
                }else if(data == 'visa renewal') {
                    for(let i = 0; i < response.length; i++){
                        const element = response[i]
                        if(element._id == 'MOL Letter'){
                            this.VisaRenewPipelineMolLetter[0].title = element._id
                            this.VisaRenewPipelineMolLetter[0].count = element.count
                            this.VisaRenewPipelineMolLetter[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineMolLetter[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineMolLetter[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'Medical Tests Application'){
                            this.VisaRenewPipelineMedicalTestApplication[0].title = element._id
                            this.VisaRenewPipelineMedicalTestApplication[0].count = element.count
                            this.VisaRenewPipelineMedicalTestApplication[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineMedicalTestApplication[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineMedicalTestApplication[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'Medical Tests Completed'){
                            this.VisaRenewPipelineMedicalTestCompleted[0].title = element._id
                            this.VisaRenewPipelineMedicalTestCompleted[0].count = element.count
                            this.VisaRenewPipelineMedicalTestCompleted[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineMedicalTestCompleted[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineMedicalTestCompleted[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'Medical Tests Result'){
                            this.VisaRenewPipelineMedicalTestResult[0].title = element._id
                            this.VisaRenewPipelineMedicalTestResult[0].count = element.count
                            this.VisaRenewPipelineMedicalTestResult[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineMedicalTestResult[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineMedicalTestResult[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'EID Application'){
                            this.VisaRenewPipelineEIDApplication[0].title = element._id
                            this.VisaRenewPipelineEIDApplication[0].count = element.count
                            this.VisaRenewPipelineEIDApplication[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineEIDApplication[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineEIDApplication[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'Residency Approval'){
                            this.VisaRenewPipelineResidencyApproval[0].title = element._id
                            this.VisaRenewPipelineResidencyApproval[0].count = element.count
                            this.VisaRenewPipelineResidencyApproval[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineResidencyApproval[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineResidencyApproval[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'Stamped Residence Visa'){
                            this.VisaRenewPipelineStampedResidenceVisa[0].title = element._id
                            this.VisaRenewPipelineStampedResidenceVisa[0].count = element.count
                            this.VisaRenewPipelineStampedResidenceVisa[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineStampedResidenceVisa[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineStampedResidenceVisa[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'EID Issuance'){
                            this.VisaRenewPipelineEIDIssuance[0].title = element._id
                            this.VisaRenewPipelineEIDIssuance[0].count = element.count
                            this.VisaRenewPipelineEIDIssuance[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineEIDIssuance[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineEIDIssuance[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'Labor Contract Issuance'){
                            this.VisaRenewPipelineLaborContractIssuance[0].title = element._id
                            this.VisaRenewPipelineLaborContractIssuance[0].count = element.count
                            this.VisaRenewPipelineLaborContractIssuance[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineLaborContractIssuance[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineLaborContractIssuance[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }

                        if(element._id == 'Labor Card Issuance'){
                            this.VisaRenewPipelineLaborCardIssuance[0].title = element._id
                            this.VisaRenewPipelineLaborCardIssuance[0].count = element.count
                            this.VisaRenewPipelineLaborCardIssuance[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaRenewPipelineLaborCardIssuance[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) => {
                                response1.results.forEach((elem) => {
                                    this.VisaRenewPipelineLaborCardIssuance[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    })
                                })
                            })
                        }
                    }
                } else if(data == 'visa cancellation'){
                    for(let i = 0; i < response.length; i++){
                        const element = response[i]
                        if(element._id == 'Labor Cancellation Typing'){
                            this.VisaCancelPipelineLaborCancellationTyping[0].title = element._id
                            this.VisaCancelPipelineLaborCancellationTyping[0].count = element.count
                            this.VisaCancelPipelineLaborCancellationTyping[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaCancelPipelineLaborCancellationTyping[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaCancelPipelineLaborCancellationTyping[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }

                        if(element._id == 'Labor Cancellation Signature'){
                            this.VisaCancelPipelineLaborCancellationSignature[0].title = element._id
                            this.VisaCancelPipelineLaborCancellationSignature[0].count = element.count
                            this.VisaCancelPipelineLaborCancellationSignature[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaCancelPipelineLaborCancellationSignature[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaCancelPipelineLaborCancellationSignature[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }

                        if(element._id == 'Labor Cancellation Approval'){
                            this.VisaCancelPipelineLaborCancellationApproval[0].title = element._id
                            this.VisaCancelPipelineLaborCancellationApproval[0].count = element.count
                            this.VisaCancelPipelineLaborCancellationApproval[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaCancelPipelineLaborCancellationApproval[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaCancelPipelineLaborCancellationApproval[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }

                        if(element._id == 'Residence Cancellation'){
                            this.VisaCancelPipelineResidenceCancellation[0].title = element._id
                            this.VisaCancelPipelineResidenceCancellation[0].count = element.count
                            this.VisaCancelPipelineResidenceCancellation[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaCancelPipelineResidenceCancellation[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaCancelPipelineResidenceCancellation[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }

                        if(element._id == 'Health Insurance Cancellation'){
                            this.VisaCancelPipelineHealthInsuranceCancellation[0].title = element._id
                            this.VisaCancelPipelineHealthInsuranceCancellation[0].count = element.count
                            this.VisaCancelPipelineHealthInsuranceCancellation[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaCancelPipelineHealthInsuranceCancellation[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaCancelPipelineHealthInsuranceCancellation[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }

                        if(element._id == 'Portal Access Revoked'){
                            this.VisaCancelPipelinePortalAccessRevoked[0].title = element._id
                            this.VisaCancelPipelinePortalAccessRevoked[0].count = element.count
                            this.VisaCancelPipelinePortalAccessRevoked[0].timeDuration = 'Avg Duration* -' + element.avgDays + ' Days'
                            this.VisaCancelPipelinePortalAccessRevoked[0].leads = []

                            await this.$axios.$get(`/visaprocess/pipeline/list?page=${this.page}&limit=${this.limit}&stage_name=${element._id}`, { headers: { Authorization: AuthStr } })
                            .then((response1) =>{
                                response1.results.forEach((elem) => {
                                    this.VisaCancelPipelinePortalAccessRevoked[0].leads.push({
                                        logo: elem.user.image_url,
                                        leadName: elem.user.first_name,
                                        leadGettingTime: elem.days_since,
                                        leadGettingTime: '5 days',
                                        isColored: false,
                                        borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
                                    });
                                });
                            })
                        }
                    }
                }
                

                this.pipelineLoading = false
            })
        }
    }
}
</script>
<style>
    .scroll {
        overflow-y: auto;
        overflow-x: hidden;
    }
</style>