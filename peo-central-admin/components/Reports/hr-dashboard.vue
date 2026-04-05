<template>
    <div class="pt-1">
        <v-row class="pt-0 pl-5 mr-5 ml-0 mb-10 align-center">
            <div class="d-flex justify-space-between" style="width:220px">
                <button style="width:20px;height:20px" @click="prevDate(selectedMonth)"
                    :disabled="disablePrev == true ? true : false">
                    <v-icon small
                        style="font-size:27px;background-color:#fff;border-radius:6px;box-shadow: rgb(149 158 164 / 10%) 5px 12px 20px;"
                        class="mr-2">
                        mdi-chevron-left
                    </v-icon>
                </button>
                <h3 class="mb-0">
                    {{ selectedMonth.toISOString().substr(0, 7) }}
                </h3>
                <button style="width:20px;height:20px" @click="nextDate(selectedMonth)"
                    :disabled="disableNext == true ? true : false">
                    <v-icon small
                        style="font-size:27px;background-color:#fff;border-radius:6px;box-shadow: rgb(149 158 164 / 10%) 5px 12px 20px;"
                        class="mr-2">
                        mdi-chevron-right
                    </v-icon>
                </button>
            </div>
            <v-select hide-details="true" single-line :items="date_filters" outlined rounded dense
                class="ml-4 mr-2 filter-select" v-model="dateSelected_filter">
                <template v-slot:prepend>
                    <svg id="tag_outline" data-name="tag/outline" xmlns="http://www.w3.org/2000/svg" width="20.164"
                        height="20.164" viewBox="0 0 20.164 20.164">
                        <g id="vuesax_outline_tag" data-name="vuesax/outline/tag">
                            <g id="tag">
                                <path id="Vector"
                                    d="M8.115,16.118a4.453,4.453,0,0,1-3.15-1.3L1.305,11.159A4.481,4.481,0,0,1,0,7.79L.2,3.751A3.722,3.722,0,0,1,3.753.2L7.792,0A4.513,4.513,0,0,1,11.16,1.3l3.659,3.659a4.47,4.47,0,0,1,0,6.309l-3.546,3.546A4.472,4.472,0,0,1,8.115,16.118ZM2.161,10.294l3.659,3.659a3.237,3.237,0,0,0,4.588,0l3.546-3.546a3.237,3.237,0,0,0,0-4.588L10.3,2.16a3.235,3.235,0,0,0-2.448-.945l-4.039.194A2.5,2.5,0,0,0,1.4,3.8L1.208,7.839A3.278,3.278,0,0,0,2.161,10.294Z"
                                    transform="translate(2.024 2.026)" fill="#0a2c4f" />
                                <path id="Vector-2" data-name="Vector"
                                    d="M3.25,6.5A3.25,3.25,0,1,1,6.5,3.25,3.256,3.256,0,0,1,3.25,6.5Zm0-5A1.75,1.75,0,1,0,5,3.25,1.758,1.758,0,0,0,3.25,1.5Z"
                                    transform="translate(4.88 4.88)" fill="#0a2c4f" />
                                <path id="Vector-3" data-name="Vector" d="M0,0H20.164V20.164H0Z" fill="none" opacity="0" />
                            </g>
                        </g>
                    </svg>
                </template>
            </v-select>
            <v-select hide-details="true" single-line :items="dateList_filters" outlined rounded dense
                class="mx-2 filter-select" v-model="dateListSelected_filter">
                <template v-slot:prepend>
                    <svg id="vuesax_linear_task-square" data-name="vuesax/linear/task-square"
                        xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
                        <g id="task-square">
                            <path id="Vector" d="M0,0H5.25" transform="translate(9.071 7.03)" fill="none" stroke="#292d32"
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="1" />
                            <path id="Vector-2" data-name="Vector" d="M0,1.5l.75.75L3,0" transform="translate(4.861 5.683)"
                                fill="none" stroke="#292d32" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="1" />
                            <path id="Vector-3" data-name="Vector" d="M0,0H5.25" transform="translate(9.071 12.572)"
                                fill="none" stroke="#292d32" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="1" />
                            <path id="Vector-4" data-name="Vector" d="M0,1.5l.75.75L3,0" transform="translate(4.861 11.074)"
                                fill="none" stroke="#292d32" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="1" />
                            <path id="Vector-5" data-name="Vector"
                                d="M5.25,15h4.5C13.5,15,15,13.5,15,9.75V5.25C15,1.5,13.5,0,9.75,0H5.25C1.5,0,0,1.5,0,5.25v4.5C0,13.5,1.5,15,5.25,15Z"
                                transform="translate(2 2)" fill="none" stroke="#292d32" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="1" />
                            <path id="Vector-6" data-name="Vector" d="M0,0H19V19H0Z" fill="none" opacity="0" />
                        </g>
                    </svg>
                </template>
            </v-select>
            <v-spacer></v-spacer>
            <v-col cols="3" class="text-right">
                <v-btn outlined class="rounded-xl" color="#293FF4" style="text-transform: unset !important;">
                    <svg id="vuesax_bulk_direct-inbox" data-name="vuesax/bulk/direct-inbox"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <g id="direct-inbox">
                            <path id="Vector"
                                d="M14.19,0H5.81C2.17,0,0,2.17,0,5.81v6.37C0,15.83,2.17,18,5.81,18h8.37c3.64,0,5.81-2.17,5.81-5.81V5.81C20,2.17,17.83,0,14.19,0Z"
                                transform="translate(2 4)" fill="#293ff4" opacity="0.4" />
                            <path id="Vector-2" data-name="Vector"
                                d="M19.3,0H15.82a2.538,2.538,0,0,0-2.29,1.42l-.84,1.66a1.162,1.162,0,0,1-1.04.65H8.37a1.066,1.066,0,0,1-1.04-.65L6.49,1.43A2.567,2.567,0,0,0,4.2.01H.7a.7.7,0,0,0-.7.7V3.97c0,3.63,2.18,5.8,5.82,5.8H14.2c3.43,0,5.54-1.88,5.8-5.22V.7A.7.7,0,0,0,19.3,0Z"
                                transform="translate(2 12.23)" fill="#293ff4" />
                            <path id="Vector-3" data-name="Vector"
                                d="M5.277,5.22a.754.754,0,0,0-1.06,0l-.72.72V.75A.75.75,0,0,0,2,.75V5.94l-.72-.72A.75.75,0,0,0,.218,6.28l2,2c.01.01.02.01.02.02a.855.855,0,0,0,.22.15.982.982,0,0,0,.29.05.671.671,0,0,0,.28-.06.963.963,0,0,0,.25-.16l2-2A.754.754,0,0,0,5.277,5.22Z"
                                transform="translate(9.253 1.25)" fill="#293ff4" />
                            <path id="Vector-4" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
                        </g>
                    </svg>
                    <download-excel style="text-transform: unset !important" class="v-btn text-center outlined"
                        :data="getUserDetails" :fields="json_fields_employees" name="Employees Info" color="green">Download
                        Report</download-excel>
                </v-btn>
                <v-btn outlined class="rounded-xl ml-2" color="#293FF4" style="text-transform: unset !important;">
                    <svg id="recovery-convert_bulk" data-name="recovery-convert/bulk" xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24" viewBox="0 0 24 24">
                        <g id="vuesax_bulk_recovery-convert" data-name="vuesax/bulk/recovery-convert">
                            <g id="recovery-convert">
                                <path id="Vector"
                                    d="M.746,8.51A.752.752,0,0,1,.1,8.13a.764.764,0,0,1,.01-.76l1.05-1.75a.751.751,0,0,1,1.29.77l-.27.45A6.272,6.272,0,0,0,7.006.75a.75.75,0,0,1,1.5,0A7.78,7.78,0,0,1,.746,8.51Z"
                                    transform="translate(14.254 14.24)" fill="#293ff4" />
                                <path id="Vector-2" data-name="Vector"
                                    d="M.75,8.5A.755.755,0,0,1,0,7.75,7.763,7.763,0,0,1,7.75,0,.752.752,0,0,1,8.4.38a.764.764,0,0,1-.01.76L7.34,2.89a.749.749,0,0,1-1.28-.78l.27-.45A6.261,6.261,0,0,0,1.5,7.75.755.755,0,0,1,.75,8.5Z"
                                    transform="translate(1.25 1.25)" fill="#293ff4" />
                                <path id="Vector-3" data-name="Vector"
                                    d="M9.8,3.43V6.37c0,2.45-.98,3.43-3.43,3.43H3.43C.98,9.8,0,8.82,0,6.37V3.43C0,.98.98,0,3.43,0H6.37C8.82,0,9.8.98,9.8,3.43Z"
                                    transform="translate(5 9.2)" fill="#293ff4" opacity="0.4" />
                                <path id="Vector-4" data-name="Vector"
                                    d="M6.36,0H3.42C1.01,0,.03.96,0,3.32H2.16c2.94,0,4.3,1.37,4.3,4.3V9.78c2.37-.03,3.32-1.01,3.32-3.42V3.43C9.79.98,8.81,0,6.36,0Z"
                                    transform="translate(9.21 5)" fill="#293ff4" opacity="0.4" />
                                <path id="Vector-5" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
                            </g>
                        </g>
                    </svg>
                    <span>Compare</span>
                </v-btn>
            </v-col>
        </v-row>
        <v-row fluid class="pt-0 pl-5 mr-5 ml-0" v-for="(data, index) in monthlyReport" :key="index">
            <v-col cols="2" align-self="center" style="border-right: solid 1px #BFC8D1;padding-right: 17px;">
                <h1 style="line-height:25px">{{ data.report.totalEmployees }}</h1>
                <p class="mb-0">Total Employees</p>
                <p style="line-height:17px;color:#00C983 !important;" class="mb-0 caption">{{ data.report.totalNewEmployess
                    ? data.report.totalNewEmployess : '0' }} <span>New employee</span>
                </p>
            </v-col>
            <v-col cols="2" align-self="center" style="border-right: solid 1px #BFC8D1;padding-right: 17px;">
                <h2 style="line-height:25px" class="font-weight-regular">{{ data.report.turnoverRate ?
                    data.report.turnoverRate : '0' }}%</h2>
                <p class="mb-0">Turnover Rate</p>

                <span v-if="data.report.totalPercentageTurnOverRate > 0">
                    <span style="color:#00C983;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15.343" height="9.467" viewBox="0 0 15.343 9.467">
                            <g id="Component_369_1" data-name="Component 369 – 1" transform="translate(1.061 1.061)">
                                <g id="Vector">
                                    <path id="Vector-2" data-name="Vector" d="M13.221,0,7.051,6.17,4.7,2.644,0,7.346"
                                        fill="none" stroke="#00C983" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5" />
                                </g>
                                <path id="Vector-3" data-name="Vector" d="M0,0H2.938V2.938" transform="translate(10.283)"
                                    fill="none" stroke="#00C983" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="1.5" />
                            </g>
                        </svg>
                        {{ data.report.totalPercentageTurnOverRate ? data.report.totalPercentageTurnOverRate : '0' }}%
                    </span>
                    <span>than last month</span>
                </span>

                <span v-else>
                    <span style="color:#e21141;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15.343" height="9.467" viewBox="0 0 15.343 9.467">
                            <g id="Component_370_1" data-name="Component 370 – 1" transform="translate(1.061 1.061)">
                                <path id="Vector" d="M13.221,0,7.051,6.17,4.7,2.644,0,7.346"
                                    transform="translate(13.221 7.346) rotate(180)" fill="none" stroke="#e21141"
                                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                                <path id="Vector-2" data-name="Vector" d="M0,0H2.938V2.938"
                                    transform="translate(2.938 7.346) rotate(180)" fill="none" stroke="#e21141"
                                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                            </g>
                        </svg>
                        {{ data.report.totalPercentageTurnOverRate ? data.report.totalPercentageTurnOverRate : '0' }}%
                    </span> <span>than last month</span>
                </span>
            </v-col>
            <v-col cols="2">
                <h2 style="line-height:25px" class="font-weight-regular">{{ data.report.totalExitedEmployeesLength ?
                    data.report.totalExitedEmployeesLength : '0' }}</h2>
                <p class="mb-0">Exited Employees</p>

                <span v-if="data.report.totalPercentExitedEmployees > 0">
                    <span style="color:#00C983;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15.343" height="9.467" viewBox="0 0 15.343 9.467">
                            <g id="Component_369_1" data-name="Component 369 – 1" transform="translate(1.061 1.061)">
                                <g id="Vector">
                                    <path id="Vector-2" data-name="Vector" d="M13.221,0,7.051,6.17,4.7,2.644,0,7.346"
                                        fill="none" stroke="#00C983" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5" />
                                </g>
                                <path id="Vector-3" data-name="Vector" d="M0,0H2.938V2.938" transform="translate(10.283)"
                                    fill="none" stroke="#00C983" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="1.5" />
                            </g>
                        </svg>
                        {{ data.report.totalPercentExitedEmployees ? data.report.totalPercentExitedEmployees : '0' }}%
                    </span>
                    <span>than last month</span>
                </span>

                <span v-else>
                    <span style="color:#e21141;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15.343" height="9.467" viewBox="0 0 15.343 9.467">
                            <g id="Component_370_1" data-name="Component 370 – 1" transform="translate(1.061 1.061)">
                                <path id="Vector" d="M13.221,0,7.051,6.17,4.7,2.644,0,7.346"
                                    transform="translate(13.221 7.346) rotate(180)" fill="none" stroke="#e21141"
                                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                                <path id="Vector-2" data-name="Vector" d="M0,0H2.938V2.938"
                                    transform="translate(2.938 7.346) rotate(180)" fill="none" stroke="#e21141"
                                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                            </g>
                        </svg>
                        {{ data.report.totalPercentExitedEmployees ? data.report.totalPercentExitedEmployees : '0' }}%
                    </span> <span>than last month</span>
                </span>
            </v-col>
            <!-- <v-col cols="auto"  class="mx-auto">
                <div style="border-left: solid 1px #BFC8D1;padding-left: 17px;">
                    <h2 style="line-height:25px">{{data.turn_over_rate}}</h2>
                    <p class="mb-0">Turnover Rate</p>
                    <p style="line-height:17px" class="mb-0 caption">
                        <span style="color:#E21141;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15.343" height="9.467" viewBox="0 0 15.343 9.467">
                                <g id="Component_369_1" data-name="Component 369 – 1" transform="translate(1.061 1.061)">
                                    <g id="Vector">
                                    <path id="Vector-2" data-name="Vector" d="M13.221,0,7.051,6.17,4.7,2.644,0,7.346" fill="none" stroke="#e21141" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                    </g>
                                    <path id="Vector-3" data-name="Vector" d="M0,0H2.938V2.938" transform="translate(10.283)" fill="none" stroke="#e21141" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                </g>
                            </svg>
                            {{data.turn_over_increment}}
                        </span> <span >than last month</span>
                    </p>
                </div>
            </v-col> -->
            <!-- <v-col cols="auto"  class="mx-auto">
                <div style="border-left: solid 1px #BFC8D1;padding-left: 17px;">
                    <h2 style="line-height:25px">{{data.exited_employees}}</h2>
                    <p class="mb-0">Exited Employees</p>
                    <p style="line-height:17px" class="mb-0 caption">
                        <span style="color:#00C983;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15.343" height="9.467" viewBox="0 0 15.343 9.467">
                                <g id="Component_370_1" data-name="Component 370 – 1" transform="translate(1.061 1.061)">
                                    <path id="Vector" d="M13.221,0,7.051,6.17,4.7,2.644,0,7.346" transform="translate(13.221 7.346) rotate(180)" fill="none" stroke="#00c983" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                    <path id="Vector-2" data-name="Vector" d="M0,0H2.938V2.938" transform="translate(2.938 7.346) rotate(180)" fill="none" stroke="#00c983" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                </g>
                            </svg>
                            {{data.exited_employees_rate}}
                        </span> <span >than last month</span>
                    </p>
                </div>
            </v-col> -->
            <v-col cols="3">
                <div style="border-left: solid 1px #BFC8D1;padding-left: 17px;">
                    <v-row>
                        <v-col cols="2">
                            <svg id="Component_371_1" data-name="Component 371 – 1" xmlns="http://www.w3.org/2000/svg"
                                width="21.087" height="55.399" viewBox="0 0 21.087 55.399">
                                <path id="Path_7018" data-name="Path 7018"
                                    d="M9.435,7.874A6.876,6.876,0,1,0,18.318.361C17.854.214,17.374.119,16.9,0H15.5c-.175.049-.348.113-.527.146A6.882,6.882,0,0,0,9.435,7.874m6.752-6.161a5.191,5.191,0,1,1-5.152,5.215,5.2,5.2,0,0,1,5.152-5.215"
                                    transform="translate(-5.686)" fill="#4c66c2" />
                                <path id="Path_7019" data-name="Path 7019"
                                    d="M21.423,48.218q0-2.979,0-5.958c0-.047,0-.093,0-.14a3.911,3.911,0,0,0-4.02-3.969q-6.519-.017-13.037,0a3.919,3.919,0,0,0-4,3.992C.34,46.232.355,50.321.353,54.409a2.745,2.745,0,0,0,.876,2.066c.574.55,1.129,1.12,1.726,1.643a3.493,3.493,0,0,1,1.173,2.453q.692,7.464,1.428,14.924a2.619,2.619,0,0,0,2.719,2.475q2.628.021,5.257,0a2.58,2.58,0,0,0,2.674-2.428c.474-4.787.963-9.573,1.383-14.365a4.376,4.376,0,0,1,1.616-3.411c.388-.294.695-.695,1.07-1.008a3.2,3.2,0,0,0,1.16-2.72q-.017-.727-.02-1.454c-.01-1.454.008-2.909.008-4.364m-2.251,7.255c-.4.353-.751.774-1.17,1.108a5.769,5.769,0,0,0-2.086,4.333c-.383,4.585-.855,9.162-1.292,13.742-.02.209-.064.416-.08.625a.976.976,0,0,1-1.1,1c-1.706,0-3.412.009-5.117,0a.973.973,0,0,1-1.093-1.017c-.478-4.9-.968-9.808-1.411-14.716A4.715,4.715,0,0,0,4.06,56.88a4.979,4.979,0,0,1-2.066-4.81c.167-3.193.042-6.4.045-9.6a2.323,2.323,0,0,1,2.619-2.637q3.12-.006,6.239,0c2.1,0,4.206,0,6.309,0a2.268,2.268,0,0,1,2.52,2.509c.008,3.949,0,7.9.012,11.848a1.565,1.565,0,0,1-.567,1.284"
                                    transform="translate(-0.349 -22.582)" fill="#4c66c2" />
                            </svg>
                        </v-col>
                        <v-col cols="10">
                            <h2 style="line-height:25px" class="font-weight-regular">{{ data.report.totalMaleEmployees ?
                                data.report.totalMaleEmployees : '0' }} ({{ data.report.totalMaleEmployeesInPercentage ?
        data.report.totalMaleEmployeesInPercentage : '0' }}%)</h2>
                            <p class="mb-0">Male Employees</p>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
            <v-col cols="3">
                <v-row style="border-left: solid 1px #BFC8D1;padding-left: 17px;">
                    <v-col cols="2">
                        <svg id="Component_372_1" data-name="Component 372 – 1" xmlns="http://www.w3.org/2000/svg"
                            width="23.528" height="54.941" viewBox="0 0 23.528 54.941">
                            <g id="Group_9041" data-name="Group 9041" transform="translate(-916.591 -285.001)">
                                <path id="Path_7021" data-name="Path 7021"
                                    d="M96.169,56.225a48.476,48.476,0,0,1-1.39-6.384c-.248-2.507-.069-5.055-.09-7.585a3.872,3.872,0,0,0-4.112-4.1q-3.968-.007-7.936,0a3.881,3.881,0,0,0-4.18,4.173c-.01,2.324.019,4.648-.014,6.97a12.727,12.727,0,0,1-.255,2.393c-.979,4.724-1.993,9.44-2.99,14.16-.231,1.1.05,1.432,1.171,1.434q1.415,0,2.83,0h2.07c0,2.632-.008,5.161,0,7.69a2.617,2.617,0,0,0,2.765,2.781q2.829.029,5.659,0a2.592,2.592,0,0,0,2.751-2.78c.007-2.3,0-4.6,0-6.9v-.789c1.711,0,3.341-.018,4.968.01a1.307,1.307,0,0,0,1.238-.563v-.552c-.053-.15-.119-.3-.157-.45-.78-3.167-1.571-6.331-2.329-9.5m-4.109,9.4c-1.065,0-1.272.213-1.272,1.3q0,3.934,0,7.869c0,.982-.3,1.292-1.26,1.295q-2.658.01-5.315,0c-.967,0-1.281-.319-1.283-1.285,0-2.669,0-5.338,0-8.007,0-.945-.233-1.176-1.184-1.178-1.562,0-3.125,0-4.791,0,.595-2.831,1.1-5.589,1.764-8.308a43.1,43.1,0,0,0,1.41-12.969c-.045-.733-.019-1.472,0-2.208a2.873,2.873,0,0,1,.142-.876,2.168,2.168,0,0,1,2.137-1.446c2.784-.012,5.568-.017,8.352,0a2.182,2.182,0,0,1,2.26,2.271c.022,1.242.063,2.488,0,3.727a28.969,28.969,0,0,0,1.131,9.26c.912,3.345,1.668,6.733,2.491,10.1.032.129.044.263.075.45-1.575,0-3.114,0-4.653,0"
                                    transform="translate(841.465 262.174)" fill="#c258b2" />
                                <path id="Path_7022" data-name="Path 7022"
                                    d="M87.489,7.636a6.768,6.768,0,1,0,8.4-7.382c-.305-.08-.608-.169-.912-.253H93.457c-.172.049-.342.112-.517.145a6.772,6.772,0,0,0-5.451,7.49m6.723-5.95A5.125,5.125,0,0,1,99.3,6.856,5.111,5.111,0,0,1,89.081,6.83a5.158,5.158,0,0,1,5.131-5.144"
                                    transform="translate(834.099 285)" fill="#ca4fa0" />
                            </g>
                        </svg>

                    </v-col>
                    <v-col cols="10">
                        <h2 style="line-height:25px" class="font-weight-regular">{{ data.report.totalFemaleEmployees ?
                            data.report.totalFemaleEmployees : '0' }}({{ data.report.totalFemaleEmployeesInPercentage ?
        data.report.totalFemaleEmployeesInPercentage : '0' }}%)</h2>
                        <p class="mb-0">Female Employees</p>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-row class="pt-0 pl-5 mr-5 ml-0">
            <v-col cols="12" md="8">
                <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4" min-height="360"
                    max-height="360">
                    <div class="d-flex">
                        <svg id="chart-success_outline" data-name="chart-success/outline" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" viewBox="0 0 24 24">
                            <g id="vuesax_outline_chart-success" data-name="vuesax/outline/chart-success">
                                <g id="chart-success">
                                    <path id="Vector"
                                        d="M11.75,21.5h-4C2.32,21.5,0,19.18,0,13.75v-6C0,2.32,2.32,0,7.75,0h6c5.43,0,7.75,2.32,7.75,7.75v4a.75.75,0,0,1-1.5,0v-4c0-4.61-1.64-6.25-6.25-6.25h-6C3.14,1.5,1.5,3.14,1.5,7.75v6C1.5,18.36,3.14,20,7.75,20h4a.75.75,0,0,1,0,1.5Z"
                                        transform="translate(1.25 1.25)" fill="#292d32" />
                                    <path id="Vector-2" data-name="Vector"
                                        d="M11.75,21.5h-4C2.32,21.5,0,19.18,0,13.75v-6C0,2.32,2.32,0,7.75,0h6c5.43,0,7.75,2.32,7.75,7.75v4a.75.75,0,0,1-1.5,0v-4c0-4.61-1.64-6.25-6.25-6.25h-6C3.14,1.5,1.5,3.14,1.5,7.75v6C1.5,18.36,3.14,20,7.75,20h4a.75.75,0,0,1,0,1.5Z"
                                        transform="translate(1.25 1.25)" fill="#292d32" />
                                    <path id="Vector-3" data-name="Vector"
                                        d="M.75,4.71A.755.755,0,0,1,0,3.96V.75A.755.755,0,0,1,.75,0,.755.755,0,0,1,1.5.75V3.96A.749.749,0,0,1,.75,4.71Z"
                                        transform="translate(6.25 9.98)" fill="#292d32" />
                                    <path id="Vector-4" data-name="Vector"
                                        d="M.75,4.71A.755.755,0,0,1,0,3.96V.75A.755.755,0,0,1,.75,0,.755.755,0,0,1,1.5.75V3.96A.749.749,0,0,1,.75,4.71Z"
                                        transform="translate(16.25 9.98)" fill="#292d32" />
                                    <path id="Vector-5" data-name="Vector"
                                        d="M11.75,21.5h-4C2.32,21.5,0,19.18,0,13.75v-6C0,2.32,2.32,0,7.75,0h6c5.43,0,7.75,2.32,7.75,7.75v4a.75.75,0,0,1-1.5,0v-4c0-4.61-1.64-6.25-6.25-6.25h-6C3.14,1.5,1.5,3.14,1.5,7.75v6C1.5,18.36,3.14,20,7.75,20h4a.75.75,0,0,1,0,1.5Z"
                                        transform="translate(1.25 1.25)" fill="#292d32" />
                                    <path id="Vector-6" data-name="Vector"
                                        d="M2.331,5.5a.749.749,0,0,1-.53-.22L.221,3.713a.75.75,0,0,1,1.06-1.06l1.01,1,2.9-3.39a.747.747,0,0,1,1.06-.08.756.756,0,0,1,.08,1.06l-3.42,4a.754.754,0,0,1-.54.26Z"
                                        transform="translate(15.249 16.247)" fill="#292d32" />
                                    <path id="Vector-7" data-name="Vector"
                                        d="M.75,4.5A.755.755,0,0,1,0,3.75v-3A.755.755,0,0,1,.75,0,.755.755,0,0,1,1.5.75v3A.755.755,0,0,1,.75,4.5Z"
                                        transform="translate(11.25 9.75)" fill="#292d32" />
                                    <path id="Vector-8" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
                                </g>
                            </g>
                        </svg>
                        <h3 class="ml-3">Department Distribution</h3>
                    </div>
                    <chartjs-bar :height=300 :bind="true" :datasets="datasets_distribution" :labels="datasets_labels"
                        :option="option_distribution" class="d-flex" />
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4" min-height="360"
                    max-height="360">
                    <div class="d-flex">
                        <svg id="sidebar-top_outline" data-name="sidebar-top/outline" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" viewBox="0 0 24 24">
                            <g id="vuesax_outline_sidebar-top" data-name="vuesax/outline/sidebar-top">
                                <g id="sidebar-top">
                                    <path id="Vector"
                                        d="M13.75,21.5h-6C2.32,21.5,0,19.18,0,13.75v-6C0,2.32,2.32,0,7.75,0h6c5.43,0,7.75,2.32,7.75,7.75v6C21.5,19.18,19.19,21.5,13.75,21.5Zm-6-20C3.14,1.5,1.5,3.14,1.5,7.75v6C1.5,18.36,3.14,20,7.75,20h6C18.36,20,20,18.36,20,13.75v-6c0-4.61-1.64-6.25-6.25-6.25Z"
                                        transform="translate(1.22 1.25)" fill="#292d32" />
                                    <path id="Vector-2" data-name="Vector"
                                        d="M20.75,1.5H.75A.755.755,0,0,1,0,.75.755.755,0,0,1,.75,0h20a.755.755,0,0,1,.75.75A.755.755,0,0,1,20.75,1.5Z"
                                        transform="translate(1.25 7.75)" fill="#292d32" />
                                    <path id="Vector-3" data-name="Vector"
                                        d="M5.868,4.058a.742.742,0,0,1-.53-.22l-2.03-2.03-2.03,2.03a.75.75,0,0,1-1.06-1.06L2.778.218a.754.754,0,0,1,1.06,0L6.4,2.778a.754.754,0,0,1,0,1.06A.742.742,0,0,1,5.868,4.058Z"
                                        transform="translate(8.693 12.193)" fill="#292d32" />
                                    <path id="Vector-4" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
                                </g>
                            </g>
                        </svg>
                        <h3 class="ml-3">Absence Statistic</h3>
                    </div>
                    <chartjs-bar :height=300 :bind="true" v-if="delay_1 == true" :datasets="datasets_absence"
                        :labels="absence_labels" :option="option_absence" class="d-flex" />
                </v-card>
            </v-col>
        </v-row>
        <v-row class="pt-0 pl-5 mr-5 ml-0">
            <v-col cols="12" md="8">
                <div style="background-color: #FFF; border-radius: 24px !important; box-shadow: 0px 24px 30px #959EA51A;">
                    <v-card style="box-shadow: none;" class="rounded-xl px-5 py-4" min-height="380" max-height="380">
                        <div class="d-flex">
                            <v-col cols="12" sm="11" lg="11" md="11">
                                <v-row>
                                    <svg id="clipboard-import" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                        viewBox="0 0 24 24">
                                        <path id="Vector"
                                            d="M6.75,5.5h-4C1.79,5.5,0,5.5,0,2.75S1.79,0,2.75,0h4C7.71,0,9.5,0,9.5,2.75,9.5,3.71,9.5,5.5,6.75,5.5Zm-4-4c-.99,0-1.25,0-1.25,1.25S1.76,4,2.75,4h4C8,4,8,3.74,8,2.75,8,1.5,7.74,1.5,6.75,1.5Z"
                                            transform="translate(7.25 1.25)" fill="#292d32" />
                                        <path id="Vector-2" data-name="Vector"
                                            d="M11.75,19.471h-5c-5.62,0-6.75-2.58-6.75-6.75v-6C0,2.161,1.65.211,5.71,0a.756.756,0,0,1,.79.71.742.742,0,0,1-.71.78C2.95,1.651,1.5,2.5,1.5,6.721v6c0,3.7.73,5.25,5.25,5.25h5a.75.75,0,0,1,0,1.5Z"
                                            transform="translate(2.25 3.279)" fill="#292d32" />
                                        <path id="Vector-3" data-name="Vector"
                                            d="M5.751,12.481a.755.755,0,0,1-.75-.75v-5c0-4.22-1.45-5.07-4.29-5.23A.757.757,0,0,1,0,.711.763.763,0,0,1,.791,0c4.06.22,5.71,2.17,5.71,6.72v5A.758.758,0,0,1,5.751,12.481Z"
                                            transform="translate(15.249 3.27)" fill="#292d32" />
                                        <path id="Vector-4" data-name="Vector"
                                            d="M3.75,4.5h-3A.75.75,0,0,1,.75,3H3V.75a.75.75,0,0,1,1.5,0v3A.755.755,0,0,1,3.75,4.5Z"
                                            transform="translate(17.25 18.25)" fill="#292d32" />
                                        <path id="Vector-5" data-name="Vector"
                                            d="M6.707,7.457a.742.742,0,0,1-.53-.22L.218,1.278A.75.75,0,0,1,1.277.218l5.96,5.96a.754.754,0,0,1,0,1.06A.786.786,0,0,1,6.707,7.457Z"
                                            transform="translate(14.252 15.253)" fill="#292d32" />
                                        <path id="Vector-6" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
                                    </svg>
                                    <h3 class="ml-3 mb-2">Document Expiry</h3>
                                </v-row>
                            </v-col>
                            <v-col cols="12" sm="1" lg="1" md="1">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn to="/expiry_documents" class="ma-0 pa-0" text icon v-bind="attrs" v-on="on">
                                            <v-icon class="ma-0 pa-0"
                                                style="float: right; cursor: pointer;">mdi-text-box-remove </v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Dashboard</span>
                                </v-tooltip>

                            </v-col>
                        </div>
                        <chartjs-bar :height=300 :width="100" :bind="true" v-if="delay_1 == true"
                            :datasets="datasets_document_expiry" :labels="document_expiry_labels"
                            :option="option_document_expiry" class="d-flex" />
                    </v-card>
                    <p class="pl-10 pb-8">December</p>
                </div>
            </v-col>
            <v-col cols="12" md="4">
                <v-card style="box-shadow: 0px 24px 30px #959EA51A;" class="rounded-xl px-5 py-4 pb-15" min-height="380">
                    <div class="d-flex">
                        <svg id="video-tick_linear" data-name="video-tick/linear" xmlns="http://www.w3.org/2000/svg"
                            width="24" height="24" viewBox="0 0 24 24">
                            <g id="vuesax_linear_video-tick" data-name="vuesax/linear/video-tick">
                                <g id="video-tick">
                                    <path id="Vector"
                                        d="M20,7v6c0,.22,0,.44-.02.65a4.5,4.5,0,0,0-7.33,5.17,4.334,4.334,0,0,0,1.01,1.16c-.21.02-.43.02-.66.02H7c-5,0-7-2-7-7V7C0,2,2,0,7,0h6C18,0,20,2,20,7Z"
                                        transform="translate(2 2)" fill="none" stroke="#292d32" stroke-linecap="round"
                                        stroke-linejoin="round" stroke-width="1.5" />
                                    <path id="Vector-2" data-name="Vector" d="M0,0H18.96" transform="translate(2.52 7.11)"
                                        fill="none" stroke="#292d32" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5" />
                                    <g id="Group">
                                        <path id="Vector-3" data-name="Vector" d="M0,0V4.86"
                                            transform="translate(8.52 2.11)" fill="none" stroke="#292d32"
                                            stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                                        <path id="Vector-4" data-name="Vector" d="M0,0V4.41"
                                            transform="translate(15.48 2.11)" fill="none" stroke="#292d32"
                                            stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                                    </g>
                                    <g id="Group-2" data-name="Group">
                                        <path id="Vector-5" data-name="Vector"
                                            d="M9,4.5a4.5,4.5,0,0,1-.65,2.32,4.327,4.327,0,0,1-.89,1.06,4.454,4.454,0,0,1-5.79.1H1.66A4.334,4.334,0,0,1,.65,6.82,4.5,4.5,0,0,1,0,4.5,4.448,4.448,0,0,1,1.69.99a4.49,4.49,0,0,1,6.29.66A4.451,4.451,0,0,1,9,4.5Z"
                                            transform="translate(14 14)" fill="none" stroke="#292d32" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="1.5" />
                                        <path id="Vector-6" data-name="Vector" d="M0,1.11,1.11,2.22,3.51,0"
                                            transform="translate(16.75 17.39)" fill="none" stroke="#292d32"
                                            stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                                    </g>
                                    <path id="Vector-7" data-name="Vector" d="M0,0H24V24H0Z" fill="none" opacity="0" />
                                </g>
                            </g>
                        </svg>
                        <h3 class="ml-3">Self Service Request</h3>
                    </div>
                    <chartjs-pie :height=300 :bind="true" :datasets="datasets_self_service" :labels="self_service_labels"
                        :option="option_self_service" class="d-flex pb-4 pt-4" />
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import { directive } from "vue-awesome-swiper";

export default {
    props: ['user', 'configuration'],

    name: "Slider",
    directives: {
        swiper: directive,
    },
    data() {
        return {
            delay_1: false,
            menu: "",
            date_filters: ['Monthly', 'Yearly'],
            dateSelected_filter: 'Monthly',
            dateList_filters: ['December', 'October', 'November'],
            dateListSelected_filter: 'December',
            json_fields_employees: {
                EMP_ID: "emp_id",
                FIRST_NAME: "first_name",
                MIDDLE_NAME: "middle_name",
                LAST_NAME: "last_name",
                GENDER: "personal.gender",
                MARITAL_STATUS: "personal.marital_status",
                NATIONALITY: "personal.nationality",
                DOB: "personal.dob",
                PHONE: "personal.phone",
                EXT: "personal.ext",
                EMAIL: "email",
                ADDRESS: "personal.address",
                USER_STATUS: "user_status",
                DATE_OF_JOINING: "date_of_joining",
                DESIGNATION: "personal.designation",
                DEPARTMENT: "department",
                EMPLOYMENT_TYPE: "employment_type",
                CONTRACT_TYPE: "contract_type",
                WORK_LOCATION: "personal.work_location",
                PROBATION_DAYS: "employment.probation_days",
                PROBATION_END_DATE: "probation_end_date",
                COST_CENTER: "personal.cost_center",
                PRIMARY_EMERGENCY_CONTACT_PERSON_NAME: "emergency.name",
                PRIMARY_EMERGENCY_CONTACT_PERSON_RELATIONSHIP: "emergency.relationship",
                PRIMARY_EMERGENCY_CONTACT_PERSON_NUMBER: "emergency.phone",
                SECONDARY_EMERGENCY_CONTACT_PERSON_NAME: "emergency.name_1",
                SECONDARY_EMERGENCY_CONTACT_PERSON_RELATIONSHIP:
                    "emergency.relationship_1",
                SECONDARY_EMERGENCY_CONTACT_PERSON_NUMBER: "emergency.phone_1",
                ANNUAL_LEAVES: "leaves.annual_leaves",
                MEDICAL_LEAVES: "leaves.medical_leaves",
                BASIC_SALARY: "salary.basic_salary",
                HOUSING_ALLOWANCE: "salary.housing_allowance",
                TRANSPORT_ALLOWANCE: "salary.transport_allowance",
                FOOD_ALLOWANCE: "salary.food_allowance",
                OTHER_ALLOWANCE: "salary.other_allowance",
                FIXED_SALARY: "salary.total_fixed",
                BANK_NAME: "bank.bank_name",
                ACCOUNT_NUMBER: "bank.account_number",
                IBAN: "bank.iban",
                PASSPORT_NUMBER: "documents.passport_number",
                PASSPORT_EXPIRATION_DATE: "documents.passport_expiry",
                EMIRATES_ID: "documents.emiratesID_number",
                EMIRATES_ID_EXPIRATION_DATE: "documents.emiratesID_expiry",
                MOL_NUMBER: "documents.mol_number",
                MOL_EXPIRY_DATE: "documents.mol_expiry",
                VISA_NUMBER: "documents.visa_number",
                VISA_EXPIRATION_DATE: "documents.visa_expiry",
            },

            option_distribution: {
                plugins: {
                    datalabels: {
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex];
                        }
                    },
                    legend: {
                        align: 'start'
                    },
                    title: {

                    }
                },
                legend: {
                    display: true,
                    align: 'start'

                },
                title: {
                    display: false,
                    text: 'Department Distribution',
                    align: 'start'
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            display: true
                        },
                        stacked: true,
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            maxTicksLimit: 6
                        },
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }]
                }
            },
            option_absence: {
                plugins: {
                    datalabels: {
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex];
                        }
                    },
                    legend: {
                        align: 'start'
                    },
                    title: {

                    }
                },
                legend: {
                    display: true,
                    align: 'start'

                },
                title: {
                    display: false,
                    text: 'Department Distribution',
                    align: 'start'
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            display: true
                        },
                        stacked: true,
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            maxTicksLimit: 6
                        },
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }]
                }
            },
            option_document_expiry: {
                plugins: {
                    datalabels: {
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex];
                        }
                    },
                    legend: {
                        align: 'start'
                    },
                    title: {

                    }
                },
                legend: {
                    display: false,
                    align: 'start',
                },
                title: {
                    display: false,
                    align: 'start'
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            display: true
                        },
                        stacked: true,
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            maxTicksLimit: 6
                        },
                        gridLines: {
                            drawOnChartArea: false
                        }
                    }]
                }
            },
            option_self_service: {
                plugins: {
                    datalabels: {
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex];
                        }
                    },
                    legend: {
                        align: 'start'
                    },
                    title: {

                    }
                },
                legend: {
                    display: true,
                    align: 'start',
                    position: 'bottom',

                },
                title: {
                    display: false,
                    align: 'start'
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        display: false,
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            display: true
                        },
                        stacked: true,
                        gridLines: {
                            display: false
                        }
                    }],
                    yAxes: [{
                        display: false,
                        stacked: true,
                        ticks: {
                            fontFamily: "sans-serif",
                            fontSize: 11,
                            beginAtZero: false,
                            maxTicksLimit: 6
                        },
                        gridLines: {
                            display: false
                        }
                    }]
                }
            },
            datasets_labels: [],
            document_expiry_labels: ['Passport', 'Emirates Id', 'Visa', 'Insurance'],
            absence_labels: ['week 1', 'week 2', 'week 3', 'week 4'],
            self_service_labels: ["Letters", 'Claims', 'Leave', 'Attendance', 'WFH'],
            datasets_document_expiry: [
                {
                    // barPercentage: 0.2,
                    barThickness: 30,
                    data: [],
                    backgroundColor: ['#86C6CB', '#BBC8C5', '#B1C722', '#9B9ED7'],
                },
            ],
            datasets_distribution: [
                {
                    type: "line",
                    label: 'Average Contract tenure',
                    data: [],
                    backgroundColor: '#DDB200',
                    borderColor: '#DDB200',
                    borderWidth: 1,
                    pointBackgroundColor: '#F4E5AA',
                    fill: false,
                    order: 1,
                    tension: 0
                },
                {
                    label: 'Male',
                    data: [],
                    barThickness: 30,
                    backgroundColor: '#4C66C2',
                    order: 2
                },
                {
                    label: 'Female',
                    data: [],
                    barThickness: 30,
                    backgroundColor: '#C258B2',
                    order: 3
                },

            ],
            datasets_absence: [],
            datasets_self_service: [
                {
                    // labels:["Letter",'Expense Claims','Leave','Attendance','Support','Custom'],
                    data: [],
                    backgroundColor: ['#4C66C2', '#B5548A', '#FF9F74', '#9BCC61', '#FAD77F']
                }
            ],
            selectedMonth: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)),
            disableNext: false,
            disablePrev: false,
            monthlyReport: [],
            users: []
        }
    },
    mounted() {
        // this.getData()
        setTimeout(() => {
            // this.getMonthlyData()
            this.delay_1 = true
        }, 500)
        this.getMonthlyRequestReport()
        let active_ = []
        this.$store.getters.getUsers.forEach(user => {
            if (user.user_status == "active" || user.user_status == "Hold") {
                active_.push(user)
            }
        })
        this.users = active_

        this.getMonthlyReport(this.selectedMonth.toISOString().substring(0, 10))
    },
    async asyncData({ app, store }) {
        const token = store.getters.getToken;
        const AuthStr = "Bearer ".concat(token);

        let companyData = await app.$axios.$get("companies/all", {
            headers: { Authorization: AuthStr },
        });
        let managersData = await app.$axios.$get("users/manager", {
            headers: { Authorization: AuthStr },
        });

        let rolesData = await app.$axios.$get("/roles/all", {
            headers: { Authorization: AuthStr },
        });

        return {
            companies: companyData,
            managers: managersData,
            roles: rolesData,
            depts: configData[0].dept,
        };
    },
    methods: {
        async getMonthlyReport(range) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            this.monthlyReport = []

            await this.$axios.$get('/reports/get-monthly-report/' + range, {}, { headers: { Authorization: AuthStr } })
                .then((res) => {
                    console.log('get-monthly-report',res)
                    this.monthlyReport = res.data

                    this.datasets_document_expiry[0].data = []
                    this.datasets_self_service[0].data = []
                    this.datasets_labels = []
                    this.datasets_distribution.filter(a => a.label == 'Average Contract tenure')[0].data = []
                    this.datasets_distribution.filter(a => a.label == 'Male')[0].data = []
                    this.datasets_distribution.filter(a => a.label == 'Female')[0].data = []

                    for (let i = 0; i < this.monthlyReport.length; i++) {
                        const element = this.monthlyReport[i]
                        this.datasets_document_expiry[0].data.push(element.report.expiryDocument.passport, element.report.expiryDocument.emiratesId, element.report.expiryDocument.visa, element.report.expiryDocument.insurance)
                        this.datasets_self_service[0].data.push(element.report.pendingRequest.letters, element.report.pendingRequest.claims, element.report.pendingRequest.leave, element.report.pendingRequest.attendance, element.report.pendingRequest.wfh)

                        element.report.allDepartment.forEach(obj => {
                            this.datasets_labels.push(obj.name)
                            this.datasets_distribution.filter(a => a.label == 'Average Contract tenure')[0].data.push(obj.avgContractTenure)
                            this.datasets_distribution.filter(a => a.label == 'Male')[0].data.push(obj.male)
                            this.datasets_distribution.filter(a => a.label == 'Female')[0].data.push(obj.female)
                        });
                    }
                })

            let colors = ['#DCE2EB', '#91687B', '#D5B066']
            this.datasets_absence = []

            for (let i = 0; i < this.configuration[0].leaveList.length; i++) {
                let obj = {
                    type: "line",
                    label: this.configuration[0].leaveList[i].substring(0, this.configuration[0].leaveList[i].length - 1),
                    data: [],
                    backgroundColor: colors[i],
                    borderColor: colors[i],
                    fill: false,
                }

                let body = {
                    "month": this.selectedMonth,
                    "letterType": this.configuration[0].leaveList[i].substring(0, this.configuration[0].leaveList[i].length - 1)
                }

                let leave = await this.$axios.$post("requests/each_leave_count_weekly", body, { headers: { Authorization: AuthStr } })

                obj.data = leave.arr.map(a => a[0] ? a[0].count : 0)
                this.datasets_absence.push(obj)

            }
        },
        async getMonthlyRequestReport() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            // this.datasets_self_service[0].data = []

            let body = {
                month: this.selectedMonth
            }
            let requests = await this.$axios.$post("requests/each_request_count", body, { headers: { Authorization: AuthStr } })

            // this.datasets_self_service[0].data.push(requests.letterRequests[0] && requests.letterRequests[0].count,requests.claimsRequests[0] && requests.claimsRequests[0].count,requests.leaveRequests[0] && requests.leaveRequests[0].count,requests.attendanceRequests[0] && requests.attendanceRequests[0].count,requests.wfhRequests[0] && requests.wfhRequests[0].count)




        },
        getData() {
            for (let i = 0; i < this.configuration[0].dept.length; i++) {
                this.datasets_labels.push(this.configuration[0].dept[i].name)
                let maleCount = this.users.filter(a => a.reporting.department == this.configuration[0].dept[i].name && a.personal.gender == 'Male').length
                let femaleCount = this.users.filter(a => a.reporting.department == this.configuration[0].dept[i].name && a.personal.gender == 'Female').length
                this.datasets_distribution.filter(a => a.label == 'Male')[0].data.push(maleCount)
                this.datasets_distribution.filter(a => a.label == 'Female')[0].data.push(femaleCount)
            }
        },
        async getMonthlyData() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            this.datasets_document_expiry[0].data = []


            let expiryDocument = {
                passport: 0,
                emiratesId: 0,
                visa: 0,
                insurance: 0
            }
            for (let i = 0; i < this.users.length; i++) {
                let passportExpiry = new Date(this.users[i].documents.passport_expiry)
                let monthYearSelected = _.cloneDeep(this.selectedMonth)
                let selectedMonth = new Date(monthYearSelected.setMonth(monthYearSelected.getMonth() + 3))

                if (passportExpiry < selectedMonth) {
                    expiryDocument.passport += 1
                }

                let emiratesIdExpiry = new Date(this.users[i].documents.emiratesID_expiry)
                if (emiratesIdExpiry < selectedMonth) {
                    expiryDocument.emiratesId += 1
                }

                let visaExpiry = new Date(this.users[i].documents.visa_expiry)
                if (visaExpiry < selectedMonth) {
                    expiryDocument.visa += 1
                }

                let insuranceExpiry = new Date(this.users[i].documents.insurance_expiry)
                if (insuranceExpiry < selectedMonth) {
                    expiryDocument.insurance += 1
                }
            }
            this.datasets_document_expiry[0].data.push(expiryDocument.passport, expiryDocument.emiratesId, expiryDocument.visa, expiryDocument.insurance)

            let colors = ['#DCE2EB', '#91687B', '#D5B066']

            this.datasets_absence = []

            for (let i = 0; i < this.configuration[0].leaveList.length; i++) {

                let obj = {
                    type: "line",
                    label: this.configuration[0].leaveList[i].substring(0, this.configuration[0].leaveList[i].length - 1),
                    data: [],
                    backgroundColor: colors[i],
                    borderColor: colors[i],
                    fill: false,
                }

                let body = {
                    "month": this.selectedMonth,
                    "letterType": this.configuration[0].leaveList[i].substring(0, this.configuration[0].leaveList[i].length - 1)
                }

                let leave = await this.$axios.$post("requests/each_leave_count_weekly", body, { headers: { Authorization: AuthStr } })

                obj.data = leave.arr.map(a => a[0] ? a[0].count : 0)


                this.datasets_absence.push(obj)



            }

        },
        nextDate(month) {
            var newDate = new Date(month.setMonth(month.getMonth() + 1));
            this.selectedMonth = newDate
            // setTimeout(()=>{
            //     this.getMonthlyData()
            //     this.delay_1 = true
            // },500)
            // this.getMonthlyRequestReport()
            this.getMonthlyReport(this.selectedMonth.toISOString().substring(0, 10))
        },
        prevDate(month) {
            var newDate = new Date(month.setMonth(month.getMonth() - 1));
            this.selectedMonth = newDate
            // setTimeout(()=>{
            //     this.getMonthlyData()
            //     this.delay_1 = true
            // },500)
            // // this.getMonthlyRequestReport()
            this.getMonthlyReport(this.selectedMonth.toISOString().substring(0, 10))
        },
        downloadReport(month) {
        },
        getCompanyDetails(val) {
            if (val) {
                let abc = this.companies.filter((a) => a._id == val);
                return abc.length > 0 ? abc[0].company_name : "";
            } else {
                return "";
            }
        },
        getManagerDetails(val) {
            if (val) {
                let abc = this.managers.filter((a) => a._id == val);
                return abc.length > 0 ? abc[0].first_name + " " + abc[0].last_name : "";
            } else {
                return "";
            }
        },
    },
    computed: {
        computedMaleEmployees() {
            return this.users.filter(a => a.personal.gender == 'Male')
        },
        computedFemaleEmployees() {
            return this.users.filter(a => a.personal.gender == 'Female')
        },
        computedMaleEmployeesPercentage() {
            return (this.computedMaleEmployees.length * 100 / this.users.length).toFixed(2)
        },
        computedFemaleEmployeesPercentage() {
            return (this.computedFemaleEmployees.length * 100 / this.users.length).toFixed(2)
        },
        getUserDetails() {
            let abc = this.users;
            let user_arr = [];
            for (let i = 0; i < abc.length; i++) {
                let user_Obj = {
                    personal: {},
                    bank: {},
                    documents: {},
                    emergency: {},
                    bank: {},
                    reporting: {},
                    leaves: {},
                    salary: {},
                    employment: {},
                    date_of_joining: "",
                };
                user_Obj = abc[i];
                user_Obj.department = abc[i].reporting.department;
                user_Obj.team = abc[i].reporting.team;
                user_arr.push(user_Obj);
            }
            return user_arr;
        },
    }
}
</script>

<style scoped>
.curve {

    position: absolute;
    transform: rotate(-45deg);
    border-radius: 0 50% 0 50%;
    box-shadow: 0 0 0 10px #fff;
    background: #fff;
    top: -10%;
    left: 10%;
}

.curve::before {
    border-bottom-right-radius: 20px;
}

.curve2 {

    position: absolute;
    transform: rotate(-45deg);
    border-radius: 0 50% 0 50%;
    box-shadow: 0 0 0 10px #0A2C4F;
    background: #0A2C4F;
    top: -10%;
    left: 10%;
}

.curve2::before {
    border-bottom-right-radius: 20px;
}

.curve-parent {
    position: relative;
}

.curveImage {
    transform: rotate(45deg);
    z-index: 6;
}

@media screen and (max-width:1540px) {
    .eventCard {
        max-height: 420px !important;
        min-height: 420px !important;
    }

    .eventCardImg {
        max-height: 240px !important;
    }

    .newsCardText,
    .newsCardTitle {
        padding-left: 0 !important;
        padding-right: 0 !important;
    }
}
</style>