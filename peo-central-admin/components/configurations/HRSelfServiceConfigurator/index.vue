<template>
    <div class="pt-0">
        <div v-if="isAdminRole !== false" class="px-10">
            <h2 class="py-5">HR Self Service Configurator</h2>

            <v-btn class="mt-3" :class="button_name == 'leave' ? 'primary' : 'grey'" dark
                @click="button_name = 'leave', tabSelected()">Leave Config</v-btn>
            <v-btn class="mt-3" :class="button_name == 'wfh' ? 'primary' : 'grey'" dark
                @click="button_name = 'wfh', tabSelected()">WFH Config</v-btn>
            <v-btn class="mt-3" :class="button_name == 'letter' ? 'primary' : 'grey'" dark
                @click="button_name = 'letter', tabSelected()">Letter Config</v-btn>
            <v-btn class="mt-3" :class="button_name == 'claims' ? 'primary' : 'grey'" dark
                @click="button_name = 'claims', tabSelected()">Claim Config</v-btn>
            <v-btn class="mt-3" :class="button_name == 'user' ? 'primary' : 'grey'" dark
                @click="button_name = 'user', tabSelected()">User Config</v-btn>

            <!-- Leave Config -->
            <v-card class="my-5 rounded-xl" v-if="button_name == 'leave'" flat min-height="500">
                <!-- <v-tabs v-model="tab_leave" grow class="justify-center grey--text">
                    <v-tab href="#tab_leave">Leaves Setup</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab_leave">
                    <v-tab-item id="tab_leave"> -->
                <LeaveCondition :configurations="configuration" :users="users" />
                <!-- </v-tab-item>
                </v-tabs-items> -->
            </v-card>
            <!-- WFH Config -->
            <v-card class="my-5 rounded-xl" v-if="button_name == 'wfh'" flat min-height="500">
                <v-tabs v-model="tab_wfh" grow class="justify-center grey--text">
                    <v-tab href="#tab_wfh">WFH Setup</v-tab>
                </v-tabs>
                <v-tabs-items v-model="tab_wfh">
                    <v-tab-item id="tab_wfh">
                        <WfhCondition :configurations="configuration" :users="users" />
                    </v-tab-item>
                </v-tabs-items>
            </v-card>
            <!-- Letter config -->
            <v-col cols="12" sm="12" lg="12" md="12" v-if="button_name == 'letter'" min-height="1000">
                <v-card class="my-5 rounded-xl">
                    <v-tabs v-model="tab" grow class="grey--text">
                        <v-tab href="#letterNew" @click="createNewLetterType('new'), getColumn()">CREATE NEW LETTER</v-tab>
                        <v-tab href="#letterUpdate" @click="createNewLetterType('existing'), getColumnExisting()">CHOOSE
                            EXISTING LETTER</v-tab>
                        <v-tab href="#letterKeyHint">Letter Key Hints</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab">
                        <v-tab-item id="letterNew">
                            <v-row class="px-3">
                                <v-col cols="12" sm="12" md="12" lg="12" v-if="!letterNewPreview">
                                    <v-card color="px-5 pb-5">
                                        <div class="pr-2">
                                            <!-- style="max-height : 900px" -->
                                            <v-row class="ml-1 py-0 pt-0 mb-5">
                                                <v-col cols="12" sm="11" md="11" lg="11" class="py-0 pt-0">
                                                    <v-card-title class="primary--text">Letter Request</v-card-title>
                                                </v-col>

                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5"
                                                    v-if="letterRequest.letterDescription.requestType">
                                                    <v-tooltip bottom color="primary">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn style="float: right;" v-bind="attrs" v-on="on" fab
                                                                x-small color="primary" @click="addLetterPreview">
                                                                <v-icon color="white">mdi-eye</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        Preview
                                                    </v-tooltip>
                                                    <!-- <v-btn style="float: right;" color="blue" elevation="5" @click="saveLetterFormat"><span class="letter_delete_button">Update Request</span></v-btn>             -->
                                                </v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-switch inset :label="`Letter Category: ${letterRequest.category}`"
                                                        dense outlined true-value="selfService" false-value="Internal"
                                                        v-model="letterRequest.category" class="py-0 pt-0"></v-switch>
                                                </v-col>
                                            </v-row>

                                            <v-row class="ml-1 py-0 pt-0">
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-select :items="letterType" dense outlined label="Choose Letter Type"
                                                        v-model="letterRequest.letterDescription.requestType"
                                                        persistent-hint class="py-0 pt-0" v-if="!isNewletter"></v-select>
                                                    <v-text-field label="New Letter Type" dense outlined
                                                        v-model="letterRequest.letterDescription.requestType"
                                                        v-on:input="isLetterTypeUnique" persistent-hint class="py-0 pt-0"
                                                        v-else></v-text-field>
                                                    <!-- <span style="font-size : 11px; color: red">{{text}}</span> -->
                                                </v-col>
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0"
                                                    v-if="letterRequest.letterDescription.requestType == 'NOC'">
                                                    <v-text-field label="New Letter Sub Type" dense outlined
                                                        v-model="letterRequest.letterDescription.requestSubType"
                                                        v-on:input="isLetterTypeUnique" persistent-hint class="py-0 pt-0"
                                                        v-if="isNewletter"></v-text-field>
                                                    <v-select label="Letter SubType" dense outlined :items="letterSubType"
                                                        v-model="letterRequest.letterDescription.requestSubType"
                                                        persistent-hint class="py-0 pt-0" v-else></v-select>
                                                </v-col>


                                            </v-row>



                                            <v-row class="ml-1 py-0 pt-0">
                                                <!-- Date format -->
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-select dense outlined v-if="isNewletter" :items="dateFormat"
                                                        small-chips item-value="_id" label="Date format"
                                                        v-model="letterRequest.dateFormat"></v-select>
                                                </v-col>
                                                <!-- <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                        <v-radio-group class="mt-0"  label="Date Alignment" v-model="letterRequest.formattedText.dateAlignment" v-if="isNewletter">                       
                          <v-radio v-for="(n,index) in radioOption" :key="index" :label="n" :value="n" @change="formatDate(n ,letterRequest.formattedText.dateAlignment)"></v-radio>
                        </v-radio-group>
                      </v-col> -->
                                            </v-row>



                                            <!-- END -->
                                            <!-- <v-row class="ml-1 py-0 pt-0">
                      <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                        <client-only placeholder="loading...">
                          <quill-editor v-model="letterRequest.letterDescription.header" ref="myQuillEditor" :options="editorOptionAddressee " v-if="isNewletter" :style="{'border': '1px solid rgb(68 68 68)','border-radius': '5px' }"></quill-editor>
                        </client-only> -->
                                            <!-- <v-textarea label="Addressee" rows="3" auto-grow dense outlined v-model="letterRequest.letterDescription.header" persistent-hint class="py-0 pt-0" v-if="isNewletter"></v-textarea> -->
                                            <!-- </v-col>
                      <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                        <v-radio-group class="mt-0"  label="Addressee Alignment" v-model="letterRequest.formattedText.headerAlignment" v-if="isNewletter">                       
                          <v-radio v-for="(n,index) in radioOption" :key="index" :label="n" :value="n" @change="formatHeader(n ,letterRequest.formattedText.headerAlignment)"></v-radio>
                        </v-radio-group>
                      </v-col>
                    </v-row>                       -->

                                            <!-- <v-row class="ml-1 py-0 pt-0" style="margin-bottom : 30px;">
                      <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                        <client-only placeholder="loading...">
                          <quill-editor v-model="letterRequest.letterDescription.subject" ref="myQuillEditor" :options="editorOptionSubject " v-if="isNewletter" :style="{'border': '1px solid rgb(68 68 68)','border-radius': '5px' }"></quill-editor>
                        </client-only>
                      </v-col>
                      <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                        <v-radio-group class="mt-0"  label="Subject Alignment" v-model="letterRequest.formattedText.subjectAlignment" v-if="isNewletter">                       
                          <v-radio v-for="(n,index) in radioOptionForSubject" :key="index" :label="n" :value="n" @change="formatSubject(n ,letterRequest.formattedText.subjectAlignment)"></v-radio>
                        </v-radio-group>
                      </v-col>
                    </v-row>  -->

                                            <!-- <v-row class="ml-1 py-0 pt-3" v-if="isNewletter">
                      <v-col cols="12" sm="10" md="10" lg="10" class="py-0 pt-0">
                          <p>Use Company Signatory</p>                
                      </v-col>
                      <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">  
                        <v-tooltip bottom color="grey">
                            <template v-slot:activator="{ on, attrs }">
                              <v-icon v-bind="attrs" style="float: right;" color="grey" v-on="on">mdi-help-circle</v-icon>
                            </template>
                            <span>Checking the box will automatically capture the Company signatory:<br>If unchecked, please select the signatory for the letter and upload the signature.</span>
                          </v-tooltip>
                      </v-col>
                      <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">
                        <v-checkbox style="float: right;" class="mt-0" v-if="isNewletter" v-model="letterRequest.company_signatory"></v-checkbox>
                      </v-col>
                    </v-row> -->

                                            <v-row v-if="isNewletter && !letterRequest.company_signatory">
                                                <!-- Signatory -->
                                                <v-col cols="12" sm="6" md="6" xl="6" class="py-0">
                                                    <v-select :items="approvalManagers" item-text="name" item-value="_id"
                                                        return-object dense v-model="letterRequest.signatory_manager"
                                                        label="Signatory" outlined></v-select>
                                                </v-col>
                                                <!-- Signature -->
                                                <v-col cols="12" sm="6" md="6" xl="6" class="py-0">
                                                    <v-file-input @change="uploadFile" outlined dense label="Signature"
                                                        prepend-icon="mdi-paperclip">
                                                        <template v-slot:selection="{ text }">
                                                            <v-chip small label color="primary">{{ text }} </v-chip>
                                                        </template>
                                                    </v-file-input>
                                                </v-col>
                                            </v-row>

                                            <!-- <hr style="color: #1976d2" />   -->

                                            <!-- <v-row class="ml-1 py-0 pt-3">
                      <v-col cols="12" sm="10" md="10" lg="10" class="py-0 pt-0">
                          <p>Capture Employee Data</p>                
                      </v-col>
                      <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">  
                        <v-tooltip bottom color="grey">
                            <template v-slot:activator="{ on, attrs }">       
                              <v-icon v-bind="attrs" style="float: right;" color="grey" v-on="on">mdi-help-circle</v-icon>
                            </template>
                            <span>Checking the box will automatically capture the following employee data: <br><b>[name], [nationality], [passport], [designation], [doj], [bank], [iban], [totalFixed], [title]</b>. <br>If unchecked, please manually add the data fields below.</span>
                          </v-tooltip>
                      </v-col>
                      <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">
                        <v-checkbox style="float: right;" class="mt-0" v-if="isNewletter" v-model="letterRequest.user_keys"></v-checkbox>
                      </v-col>
                    </v-row> -->

                                            <!-- <v-row class="ml-1 py-0 pt-0 pb-5">
                      <v-col cols="12" sm="10" md="10" lg="10" class="py-0 pt-0"> 
                          <h3>Add Letter keys</h3>
                      </v-col>
                      <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0"> 
                        <v-btn @click="addLeterKeyHint" width="33"  height="33" style="float: right;" fab color="blue" class="ml-3" large outlined><v-icon>mdi-plus</v-icon></v-btn>          
                      </v-col>
                      <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0"> 
                        <v-btn @click="removeLeterKeyHint" width="33" height="33" style="float: right;" fab color="red" class="ml-3" large outlined><v-icon>mdi-close</v-icon></v-btn>          
                      </v-col>
                    </v-row>    -->

                                            <v-row class="ml-1 py-0 pt-0" v-if="letterKeys.length > 0">
                                                <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
                                                    <p class="p-0 mt-5">Letter Key</p>
                                                </v-col>
                                                <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0">
                                                    <p class="p-0 mt-5">Input type</p>
                                                </v-col>
                                                <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0">
                                                    <p class="p-0 mt-5">Selecter Values</p>
                                                </v-col>
                                                <v-col row cols="12" sm="2" md="2" lg="2" class="pa-0">
                                                    <p class="p-0 mt-5">Delete</p>
                                                </v-col>
                                            </v-row>

                                            <hr style="color: #1976d2" />

                                            <v-row class="ml-1 py-0 pt-5" v-for="(data, index) in letterKeys" :key="index">
                                                <!-- Letter key hint -->
                                                <v-col cols="12" sm="3" md="3" lg="3" class="py-0 pt-0">
                                                    <v-select :items="fetchLetterKey()" dense return-object outlined
                                                        item-text="key" item-value="key" small-chips label="Letter Key Hint"
                                                        v-model="data.name"></v-select>
                                                </v-col>
                                                <!-- Letter key type select -->
                                                <v-col cols="12" sm="3" md="3" lg="3" class="py-0 pt-0">
                                                    <v-select :items="array_types" small-chips dense outlined
                                                        item-value="_id" label="Value Type" v-model="data.type"></v-select>
                                                </v-col>
                                                <!-- if selected a dropdown ask for a key -->
                                                <v-col cols="12" sm="4" md="4" lg="4" class="py-0 pt-0">
                                                    <v-textarea
                                                        v-if="data.type == 'Select' && data.name.key != '[travelDestination]' && data.name.key != '[companyName]'"
                                                        hint="Add your values separated by a comma." outlined dense rows="3"
                                                        auto-grow class="py-0" label="Selector values"
                                                        v-model="data.selector_values"></v-textarea>
                                                </v-col>
                                                <!-- Letter key delete button -->
                                                <v-col cols="12" sm="2" md="2" lg="2" class="py-0 pt-2">
                                                    <v-icon medium color="red"
                                                        @click="removeLeterKeyHint(index)">mdi-delete</v-icon>
                                                </v-col>
                                            </v-row>




                                            <!-- <v-row style="margin-bottom : 80px;"  class="pl-4">
                    <v-col  cols="12"  sm="12" md="12" lg="12">
                      <client-only placeholder="loading...">
                        <quill-editor v-model="letterRequest.letterDescription.body" ref="myQuillEditor" :options="editorOption " v-if="isNewletter" :style="{'height': '200px'}"></quill-editor>
                      </client-only>
                    </v-col>
                    </v-row> -->

                                            <!-- <hr style="color: #1976d2" />       -->
                                            <v-col class="text-right pr-10 mt-13 mb-13">
                                                <v-btn style="float: right;" color="blue" elevation="5"
                                                    @click="saveLetterFormat"><span class="letter_delete_button">Update
                                                        Request</span></v-btn>
                                            </v-col>

                                        </div>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" sm="5" md="5" lg="5" v-if="letterNewPreview">
                                    <v-card color="px-5 pb-5">
                                        <v-row class="ml-1 py-0 pt-0 mb-5">
                                            <v-col cols="12" sm="11" md="11" lg="11" class="py-0 pt-0">
                                                <v-card-title class="primary--text">Letter
                                                    Request</v-card-title>
                                            </v-col>

                                            <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5" v-if="isNewletter">
                                                <v-tooltip bottom color="grey">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-btn style="float: right;" v-bind="attrs" v-on="on" fab x-small
                                                            color="primary" @click="letterNewPreview = false">
                                                            <v-icon color="white">mdi-eye-arrow-left</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    Preview
                                                </v-tooltip>
                                            </v-col>
                                        </v-row>

                                        <v-row class="ml-1 py-0 pt-0">
                                            <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0">
                                                <v-radio-group class="mt-0" label="Date Alignment"
                                                    v-model="letterRequest.formattedText.dateAlignment" v-if="isNewletter">
                                                    <v-row>
                                                        <v-col cols="4" sm="4" md="4" lg="4"
                                                            v-for="(n, index) in radioOption" :key="index">
                                                            <v-radio :label="n" :value="n"
                                                                @change="formatDate(n, letterRequest.formattedText.dateAlignment)"></v-radio>
                                                        </v-col>
                                                    </v-row>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>

                                        <v-row class="ml-1 py-0 pt-0">
                                            <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0">
                                                <v-radio-group class="mt-0" label="Addressee Alignment"
                                                    v-model="letterRequest.formattedText.headerAlignment"
                                                    v-if="isNewletter">
                                                    <v-row>
                                                        <v-col cols="4" sm="4" md="4" lg="4"
                                                            v-for="(n, index) in radioOption" :key="index">
                                                            <v-radio :label="n" :value="n"
                                                                @change="formatHeader(n, letterRequest.formattedText.headerAlignment)"></v-radio>
                                                        </v-col>
                                                    </v-row>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>

                                        <v-row class="ml-1 py-0 pt-0" style="margin-bottom : 30px;">
                                            <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0">
                                                <v-radio-group class="mt-0" label="Subject Alignment"
                                                    v-model="letterRequest.formattedText.subjectAlignment"
                                                    v-if="isNewletter">
                                                    <v-row>
                                                        <v-col v-for="(n2, index2) in radioOptionForSubject" :key="index2">
                                                            <v-radio :label="n2" :value="n2"
                                                                @change="formatSubject(n2, letterRequest.formattedText.subjectAlignment)"></v-radio>
                                                        </v-col>
                                                    </v-row>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>

                                        <!-- Title -->
                                        <v-row class="ml-1 py-0 pt-0">
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-5">Title</p>
                                            </v-col>
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0">
                                                <p class="p-0 mt-5">Preview</p>
                                            </v-col>
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0 ">
                                                <p class="p-0 mt-5">PDF</p>
                                            </v-col>
                                        </v-row>

                                        <hr style="color: #1976d2" />

                                        <!-- Header-show -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="isNewletter">
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-5">Header</p>
                                            </v-col>
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox v-model="letterRequest.headerShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0 ">
                                                <v-checkbox v-model="letterRequest.headerShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Footer show -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Footer</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.footerShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.footerShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                        <!-- Signatory -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Signatory</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.signatory.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.signatory.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Left side bar -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Left-sidebar</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0" @change="getColumn()"
                                                    v-model="letterRequest.leftSideBar.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.leftSideBar.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Right side bar -->
                                        <v-row v-if="isNewletter" class="ml-1 py-0 pt-0">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Right-sidebar</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0" @change="getColumn()"
                                                    v-model="letterRequest.rightSideBar.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.rightSideBar.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Signature -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">e-Signature</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.signatureShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.signatureShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                        <!-- Stamp -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">e-Stamp</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.stampShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.stampShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- watermark -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Watermark</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="letterRequest.watermarkShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0" error-count=""
                                                    v-model="letterRequest.watermarkShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" sm="7" md="7" lg="7" v-if="letterNewPreview">
                                    <v-card color="px-5 pb-5">
                                        <v-card-title class="primary--text">Request
                                            Preview</v-card-title>
                                        <div class="pr-3 pl-3">
                                            <!-- style="max-height : 900px;" -->
                                            <v-row>
                                                <v-col cols="12" md="12" sm="12" lg="12" style="margin: 0px"
                                                    class="table-section white font_stye">
                                                    <LetterPreview v-if="isNewletter" :date="computeDateFormat"
                                                        :dateClass="letterRequest.formattedText.formatDate"
                                                        :toAddress="letterRequest.letterDescription.header"
                                                        :toAddressClass="letterRequest.formattedText.formatHeader"
                                                        :subject="letterRequest.letterDescription.subject"
                                                        :subjectClass="letterRequest.formattedText.formatStyle"
                                                        :body="letterRequest.letterDescription.body"
                                                        :signature="letterRequest.company_signatory ? getCompanyDetails.letterDetail.signatureLink : getUserCompanyManager(letterRequest).signature"
                                                        :managerName="getUserCompanyManager(letterRequest) ? getUserCompanyManager(letterRequest).name : ''"
                                                        :designation="getUserCompanyManager(letterRequest) ? getUserCompanyManager(letterRequest).designation : ''"
                                                        :getCompanyDetails="getCompanyDetails.letterDetail"
                                                        :inlineStyle="inlineStyle" :leftSidebarLink="leftSidebarLink"
                                                        :rightSidebarLink="rightSidebarLink"
                                                        :leftSidebarCol="letterRequest.leftSidebarCol"
                                                        :bodyCol="letterRequest.bodyCol"
                                                        :rightSidebarCol="letterRequest.rightSidebarCol"
                                                        :leftsidebar="letterRequest.leftSideBar.preview"
                                                        :rightsidebar="letterRequest.rightSideBar.preview"
                                                        :header="letterRequest.headerShow.preview"
                                                        :footer="letterRequest.footerShow.preview"
                                                        :stamp="letterRequest.stampShow.preview"
                                                        :signatureShow="letterRequest.signatureShow.preview"
                                                        :watermark="letterRequest.watermarkShow.preview"
                                                        :signatory="letterRequest.signatory.preview" />
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-tab-item>
                        <v-tab-item id="letterUpdate">
                            <v-row class="px-3" v-if="letterType.length > 0">
                                <v-col cols="12" sm="12" md="12" lg="12" v-if="!letterUpdatePreview">
                                    <v-card color="px-5 pb-5">
                                        <div class="pr-2">
                                            <!-- style="max-height : 900px" -->
                                            <v-row class="ml-1 py-0 pt-0 mb-5">
                                                <v-col cols="12" sm="7" md="7" lg="7" class="py-0 pt-0">
                                                    <v-card-title class="primary--text">Letter Request</v-card-title>
                                                </v-col>

                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5" v-if="!isNewletter">
                                                    <v-dialog v-model="dialog" transition="dialog-bottom-transition"
                                                        max-width="600">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <!-- <v-btn style="float: right;"  v-bind="attrs" v-on="on" color="red" elevation="5" @click="delete_confirm_dialog = true"><span class="letter_delete_button">Delete</span></v-btn> -->
                                                            <!-- <v-tooltip bottom color="red">
                            <template> -->
                                                            <v-btn style="float: right;" v-bind="attrs" v-on="on" fab
                                                                x-small color="red" @click="delete_confirm_dialog = true">
                                                                <v-icon color="white">mdi-close</v-icon>
                                                            </v-btn>
                                                            <!-- </template>
                            Delete
                          </v-tooltip>                    -->
                                                        </template>
                                                        <template v-slot:default="dialog">
                                                            <v-card>
                                                                <v-card-title class="text-white red darken-2">
                                                                    <h5 class="letter_delete_button"> Delete Letter Template
                                                                    </h5>
                                                                </v-card-title>
                                                                <v-card-text>
                                                                    <div class="pt-5 letter_delete_text">
                                                                        <h4>Are you sure want to delete the letter template?
                                                                        </h4>
                                                                    </div>
                                                                </v-card-text>
                                                                <v-divider></v-divider>
                                                                <v-card-actions class="justify-end">
                                                                    <v-spacer></v-spacer>
                                                                    <v-btn text color="primary"
                                                                        @click="dialog.value = false">Close</v-btn>
                                                                    <v-btn text color="red"
                                                                        @click="deleteLetter()">Delete</v-btn>
                                                                </v-card-actions>
                                                            </v-card>
                                                        </template>
                                                    </v-dialog>
                                                </v-col>

                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5" v-if="!isNewletter">
                                                    <v-tooltip bottom color="green">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn style="float: right;" v-bind="attrs" v-on="on" fab
                                                                x-small color="green" @click="saveLetterFormat">
                                                                <v-icon color="white">mdi-check</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        Update Request
                                                    </v-tooltip>
                                                    <!-- <v-btn style="float: right;" color="blue" elevation="5" @click="saveLetterFormat"><span class="letter_delete_button">Update Request</span></v-btn>             -->
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5" v-if="!isNewletter">
                                                    <v-tooltip bottom color="primary">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn style="float: right;" v-bind="attrs" v-on="on" fab
                                                                x-small color="primary" @click="letterUpdatePreview = true">
                                                                <v-icon color="white">mdi-eye</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        Preview
                                                    </v-tooltip>
                                                    <!-- <v-btn style="float: right;" color="blue" elevation="5" @click="saveLetterFormat"><span class="letter_delete_button">Update Request</span></v-btn>             -->
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5" v-if="!isNewletter">
                                                    <v-tooltip bottom color="purple">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn style="float: right;" v-bind="attrs" v-on="on" fab
                                                                x-small color="purple" @click="openDocumentEditor">
                                                                <v-icon color="white">mdi-eye</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        PDF Preview
                                                    </v-tooltip>
                                                    <!-- <v-btn style="float: right;" color="blue" elevation="5" @click="saveLetterFormat"><span class="letter_delete_button">Update Request</span></v-btn>             -->
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5" v-if="!isNewletter">
                                                    <v-tooltip bottom color="grey">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-btn style="float: right;" v-bind="attrs" v-on="on" fab
                                                                x-small color="grey" @click="openDocumentEditorbefore">
                                                                <v-icon color="white">mdi-eye</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        Before Approve Preview
                                                    </v-tooltip>
                                                    <!-- <v-btn style="float: right;" color="blue" elevation="5" @click="saveLetterFormat"><span class="letter_delete_button">Update Request</span></v-btn>             -->
                                                </v-col>


                                            </v-row>

                                            <v-row class="ml-1 py-0 pt-0">
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-select :items="letterType" dense outlined label="Choose Letter Type"
                                                        v-model="letterRequest.letterDescription.requestType"
                                                        persistent-hint class="py-0 pt-0" v-if="!isNewletter"></v-select>
                                                    <v-text-field label="New Letter Type" dense outlined
                                                        v-model="letterRequest.letterDescription.requestType"
                                                        v-on:input="isLetterTypeUnique" persistent-hint class="py-0 pt-0"
                                                        v-else></v-text-field>
                                                    <!-- <span style="font-size : 11px; color: red">{{text}}</span> -->
                                                </v-col>
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0"
                                                    v-if="letterRequest.letterDescription.requestType == 'NOC'">
                                                    <v-text-field label="New Letter Sub Type" dense outlined
                                                        v-model="letterRequest.letterDescription.requestSubType"
                                                        v-on:input="isLetterTypeUnique" persistent-hint class="py-0 pt-0"
                                                        v-if="isNewletter"></v-text-field>
                                                    <v-select label="Letter SubType" dense outlined :items="letterSubType"
                                                        v-model="letterRequest.letterDescription.requestSubType"
                                                        persistent-hint class="py-0 pt-0" v-else></v-select>
                                                </v-col>
                                            </v-row>


                                            <v-row class="ml-1 py-0 pt-0">
                                                <!-- Date format -->
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-select v-if="!isNewletter" dense outlined :items="dateFormat"
                                                        small-chips item-value="_id" label="Date format"
                                                        v-model="selectedLetterRequest.dateFormat"></v-select>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-radio-group class="mt-0" label="Date Alignment"
                                                        v-model="selectedLetterRequest.formattedText.dateAlignment"
                                                        v-if="!isNewletter">
                                                        <v-radio v-for="(n, index) in radioOption" :key="index" :label="n"
                                                            :value="n"
                                                            @change="formatDate(n, selectedLetterRequest.formattedText.dateAlignment)"></v-radio>
                                                    </v-radio-group>
                                                </v-col>
                                            </v-row>


                                            <!-- END -->
                                            <v-row class="ml-1 py-0 pt-0" style="margin-bottom : 30px;">
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <client-only placeholder="loading...">
                                                        <quill-editor
                                                            v-model="selectedLetterRequest.letterDescription.header"
                                                            ref="myQuillEditor" :options="editorOptionAddressee"
                                                            v-if="!isNewletter"
                                                            :style="{ 'border': '1px solid rgb(68 68 68)', 'border-radius': '5px' }"></quill-editor>
                                                    </client-only>
                                                    <!-- <v-textarea label="Addressee" dense rows="3" auto-grow outlined persistent-hint class="py-0 pt-0" v-model="selectedLetterRequest.letterDescription.header" v-if=" selectedLetterRequest && !isNewletter"></v-textarea> -->
                                                </v-col>
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-radio-group class="mt-0" label="Addressee Alignment"
                                                        v-model="selectedLetterRequest.formattedText.headerAlignment"
                                                        v-if="!isNewletter">
                                                        <v-radio v-for="(n, index) in radioOption" :key="index" :label="n"
                                                            :value="n"
                                                            @change="formatHeader(n, selectedLetterRequest.formattedText.headerAlignment)"></v-radio>
                                                    </v-radio-group>
                                                </v-col>
                                            </v-row>

                                            <v-row class="ml-1 py-0 pt-0" style="margin-bottom : 30px;">
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <client-only placeholder="loading...">
                                                        <quill-editor
                                                            v-model="selectedLetterRequest.letterDescription.subject"
                                                            ref="myQuillEditor" :options="editorOptionSubject"
                                                            :style="{ 'border': '1px solid rgb(68 68 68)' }"
                                                            v-if="selectedLetterRequest && selectedLetterRequest.letterDescription && !isNewletter">
                                                        </quill-editor>
                                                    </client-only>
                                                </v-col>
                                                <v-col cols="12" sm="6" md="6" lg="6" class="py-0 pt-0">
                                                    <v-radio-group class="mt-0" label="Subject Alignment"
                                                        v-model="selectedLetterRequest.formattedText.subjectAlignment"
                                                        v-if="!isNewletter">
                                                        <v-radio v-for="(n, index) in radioOptionForSubject" :key="index"
                                                            :label="n" :value="n"
                                                            @change="formatSubject(n, selectedLetterRequest.formattedText.subjectAlignment)"></v-radio>
                                                    </v-radio-group>
                                                </v-col>
                                            </v-row>

                                            <v-row class="ml-1 py-0 pt-3" v-if="!isNewletter">
                                                <v-col cols="12" sm="10" md="10" lg="10" class="py-0 pt-0">
                                                    <p>Use Company Signatory</p>
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">
                                                    <v-tooltip bottom color="grey">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-icon v-bind="attrs" style="float: right;" color="grey"
                                                                v-on="on">mdi-help-circle</v-icon>
                                                        </template>
                                                        <span>Checking the box will automatically capture the Company
                                                            signatory:<br>If unchecked, please select the signatory for the
                                                            letter and upload the signature.</span>
                                                    </v-tooltip>
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">
                                                    <v-checkbox style="float: right;" class="mt-0"
                                                        v-model="selectedLetterRequest.company_signatory"></v-checkbox>
                                                </v-col>
                                            </v-row>

                                            <v-row v-if="!isNewletter && !selectedLetterRequest.company_signatory">
                                                <!-- Signatory -->
                                                <v-col cols="12" sm="6" md="6" xl="6" class="py-0">
                                                    <v-select :items="approvalManagers" item-text="name" item-value="_id"
                                                        return-object dense
                                                        v-model="selectedLetterRequest.signatory_manager" label="Signatory"
                                                        outlined></v-select>
                                                </v-col>
                                                <!-- Signature -->
                                                <v-col cols="12" sm="6" md="6" xl="6" class="py-0">
                                                    <v-file-input @change="uploadFile" outlined dense label="Signature"
                                                        prepend-icon="mdi-paperclip">
                                                        <template v-slot:selection="{ text }">
                                                            <v-chip small label color="primary">{{ text }} </v-chip>
                                                        </template>
                                                    </v-file-input>
                                                </v-col>
                                            </v-row>


                                            <hr style="color: #1976d2" />
                                            <v-row class="ml-1 py-0 pt-3">
                                                <v-col cols="12" sm="10" md="10" lg="10" class="py-0 pt-0">
                                                    <p>Capture Employee Data</p>
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">
                                                    <v-tooltip bottom color="grey">
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-icon v-bind="attrs" color="grey" style="float: right;"
                                                                v-on="on">mdi-help-circle</v-icon>
                                                        </template>
                                                        <span>Checking the box will automatically capture the following
                                                            employee data: <br><b>[name], [nationality], [passport],
                                                                [designation], [doj], [bank], [iban], [totalFixed],
                                                                [title]</b>. <br>If unchecked, please manually add the data
                                                            fields below.</span>
                                                    </v-tooltip>
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">
                                                    <v-checkbox style="float: right;" class="mt-0" v-if="!isNewletter"
                                                        v-model="selectedLetterRequest.user_keys"></v-checkbox>
                                                </v-col>
                                            </v-row>

                                            <v-row class="ml-1 py-0 pt-0 pb-5">
                                                <v-col cols="12" sm="10" md="10" lg="10" class="py-0 pt-0">
                                                    <h3>Add Letter Key Hints</h3>
                                                </v-col>
                                                <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0">
                                                    <v-btn @click="addLeterKeyHint" width="33" height="33"
                                                        style="float: right;" fab color="blue" class="ml-3" large
                                                        outlined><v-icon>mdi-plus</v-icon></v-btn>
                                                </v-col>
                                                <!-- <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-0"> 
                        <v-btn @click="removeLeterKeyHint" width="33" height="33" style="float: right;" fab color="red" class="ml-3" large outlined><v-icon>mdi-close</v-icon></v-btn>          
                      </v-col> -->
                                            </v-row>

                                            <v-row class="ml-1 py-0 pt-0" v-if="letterKeys.length > 0">
                                                <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
                                                    <p class="p-0 mt-5">Letter Key</p>
                                                </v-col>
                                                <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0">
                                                    <p class="p-0 mt-5">Input type</p>
                                                </v-col>
                                                <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0">
                                                    <p class="p-0 mt-5">Selecter Values</p>
                                                </v-col>
                                                <v-col row cols="12" sm="2" md="2" lg="2" class="pa-0">
                                                    <p class="p-0 mt-5">Delete</p>
                                                </v-col>
                                            </v-row>

                                            <hr style="color: #1976d2" />

                                            <v-row class="ml-1 py-0 pt-5" v-for="(data, index) in letterKeys" :key="index">
                                                <!-- Letter key hint -->
                                                <v-col cols="12" sm="3" md="3" lg="3" class="py-0 pt-0">
                                                    <v-select :items="fetchLetterKey()" dense return-object outlined
                                                        item-text="key" item-value="key" small-chips label="Letter Key Hint"
                                                        v-model="data.name"></v-select>
                                                </v-col>
                                                <!-- Letter key type select -->
                                                <v-col cols="12" sm="3" md="3" lg="3" class="py-0 pt-0">
                                                    <v-select :items="array_types" small-chips dense outlined
                                                        item-value="_id" label="Value Type" v-model="data.type"></v-select>
                                                </v-col>
                                                <!-- if selected a dropdown ask for a key -->
                                                <v-col cols="12" sm="4" md="4" lg="4" class="py-0 pt-0">
                                                    <v-textarea
                                                        v-if="data.type == 'Select' && data.name.key != '[travelDestination]' && data.name.key != '[companyName]'"
                                                        hint="Add your values separated by a comma." outlined dense rows="3"
                                                        auto-grow class="py-0" label="Selector values"
                                                        v-model="data.selector_values"></v-textarea>
                                                </v-col>
                                                <!-- Letter key delete button -->
                                                <v-col cols="12" sm="2" md="2" lg="2" class="py-0 pt-2">
                                                    <v-icon medium color="red"
                                                        @click="removeLeterKeyHint(index)">mdi-delete</v-icon>
                                                </v-col>
                                            </v-row>




                                            <!-- <v-row style="margin-bottom : 80px;"  class="pl-4">
                    <v-col  cols="12"  sm="12" md="12" lg="12">
                      <client-only placeholder="loading...">                       
                        <quill-editor v-model="selectedLetterRequest.letterDescription.body" ref="myQuillEditor" :options="editorOption" v-if="selectedLetterRequest && selectedLetterRequest.letterDescription && !isNewletter">
                        </quill-editor>
                      </client-only>
                    </v-col>
                  </v-row> -->



                                            <!-- <hr style="color: #1976d2" />       -->
                                            <v-col class="text-right pr-10 mt-13 mb-13">
                                                <v-btn style="float: right;" color="blue" elevation="5"
                                                    @click="saveLetterFormat"><span class="letter_delete_button">Update
                                                        Request</span></v-btn>
                                            </v-col>

                                        </div>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" sm="5" md="5" lg="5" v-if="letterUpdatePreview">
                                    <v-card color="px-5 pb-5">
                                        <v-row class="ml-1 py-0 pt-0 mb-5">
                                            <v-col cols="12" sm="11" md="11" lg="11" class="py-0 pt-0">
                                                <v-card-title class="primary--text">Letter
                                                    Request</v-card-title>
                                            </v-col>

                                            <v-col cols="12" sm="1" md="1" lg="1" class="py-0 pt-5" v-if="!isNewletter">
                                                <v-tooltip bottom color="grey">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-btn style="float: right;" v-bind="attrs" v-on="on" fab x-small
                                                            color="primary" @click="letterUpdatePreview = false">
                                                            <v-icon color="white">mdi-eye-arrow-left</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    Letter Request
                                                </v-tooltip>
                                            </v-col>
                                        </v-row>


                                        <v-row class="ml-1 py-0 pt-0">
                                            <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0">
                                                <v-radio-group class="mt-0" label="Date Alignment"
                                                    v-model="selectedLetterRequest.formattedText.dateAlignment"
                                                    v-if="!isNewletter">
                                                    <v-row>
                                                        <v-col cols="4" sm="4" md="4" lg="4"
                                                            v-for="(n, index) in radioOption" :key="index">
                                                            <v-radio :label="n" :value="n"
                                                                @change="formatDate(n, selectedLetterRequest.formattedText.dateAlignment)"></v-radio>
                                                        </v-col>
                                                    </v-row>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>

                                        <v-row class="ml-1 py-0 pt-0">
                                            <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0">
                                                <v-radio-group class="mt-0" label="Addressee Alignment"
                                                    v-model="selectedLetterRequest.formattedText.headerAlignment"
                                                    v-if="!isNewletter">
                                                    <v-row>
                                                        <v-col cols="4" sm="4" md="4" lg="4"
                                                            v-for="(n, index) in radioOption" :key="index">
                                                            <v-radio :label="n" :value="n"
                                                                @change="formatHeader(n, selectedLetterRequest.formattedText.headerAlignment)"></v-radio>
                                                        </v-col>
                                                    </v-row>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>

                                        <v-row class="ml-1 py-0 pt-0" style="margin-bottom : 30px;">
                                            <v-col cols="12" sm="12" md="12" lg="12" class="py-0 pt-0">
                                                <v-radio-group class="mt-0" label="Subject Alignment"
                                                    v-model="selectedLetterRequest.formattedText.subjectAlignment"
                                                    v-if="!isNewletter">
                                                    <v-row>
                                                        <v-col v-for="(n2, index2) in radioOptionForSubject" :key="index2">
                                                            <v-radio :label="n2" :value="n2"
                                                                @change="formatSubject(n2, selectedLetterRequest.formattedText.subjectAlignment)"></v-radio>
                                                        </v-col>
                                                    </v-row>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>
                                        <!-- Title -->
                                        <v-row class="ml-1 py-0 pt-0">
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-5">Title</p>
                                            </v-col>
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0">
                                                <p class="p-0 mt-5">Preview</p>
                                            </v-col>
                                            <v-col row cols="12" sm="4" md="4" lg="4" class="pa-0 ">
                                                <p class="p-0 mt-5">PDF</p>
                                            </v-col>
                                        </v-row>

                                        <hr style="color: #1976d2" />

                                        <!-- Header-show -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="!isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-5">Header</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox v-model="selectedLetterRequest.headerShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox v-model="selectedLetterRequest.headerShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Footer show -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="!isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Footer</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.footerShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.footerShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                        <!-- Signatory -->
                                        <v-row v-if="!isNewletter" class="ml-1 py-0 pt-0">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Signatory</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.signatory.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.signatory.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Left side bar -->
                                        <v-row class="ml-1 py-0 pt-0" v-if="!isNewletter">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Left-sidebar</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0" @change="getColumnExisting()"
                                                    v-model="selectedLetterRequest.leftSideBar.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.leftSideBar.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Right side bar -->
                                        <v-row v-if="!isNewletter" class="ml-1 py-0 pt-0">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Right-sidebar</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0" @change="getColumnExisting()"
                                                    v-model="selectedLetterRequest.rightSideBar.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.rightSideBar.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                        <!-- Signature -->
                                        <v-row v-if="!isNewletter" class="ml-1 py-0 pt-0">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">e-Signature</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.signatureShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.signatureShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                        <!-- Stamp -->
                                        <v-row v-if="!isNewletter" class="ml-1 py-0 pt-0">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">e-Stamp</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.stampShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.stampShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                        <!-- watermark -->
                                        <v-row v-if="!isNewletter" class="ml-1 py-0 pt-0">
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0 pl-3">
                                                <p class="p-0 mt-0">Watermark</p>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.watermarkShow.preview"></v-checkbox>
                                            </v-col>
                                            <v-col row cols="4" sm="4" md="4" lg="4" class="pa-0">
                                                <v-checkbox class="p-0 mt-0"
                                                    v-model="selectedLetterRequest.watermarkShow.pdf"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" sm="7" md="7" lg="7" v-if="letterUpdatePreview">
                                    <v-card color="px-5 pb-5">
                                        <v-card-title class="primary--text">Request
                                            Preview</v-card-title>
                                        <div class="pr-3 pl-3">
                                            <!-- style="max-height : 900px;" -->
                                            <v-row>
                                                <v-col cols="12" md="12" sm="12" lg="12" style="margin: 0px"
                                                    class="table-section white font_stye">
                                                    <LetterPreview v-if="!isNewletter" :date="computeDateFormat"
                                                        :dateClass="selectedLetterRequest.formattedText.formatDate"
                                                        :toAddress="selectedLetterRequest.letterDescription.header"
                                                        :toAddressClass="selectedLetterRequest.formattedText.formatHeader"
                                                        :subject="selectedLetterRequest.letterDescription.subject"
                                                        :subjectClass="selectedLetterRequest.formattedText.formatStyle"
                                                        :body="selectedLetterRequest.letterDescription.body"
                                                        :signature="selectedLetterRequest.company_signatory ? getCompanyDetails.letterDetail.signatureLink : getUserCompanyManager(selectedLetterRequest).signature"
                                                        :managerName="getUserCompanyManager(selectedLetterRequest) ? getUserCompanyManager(selectedLetterRequest).name : ''"
                                                        :designation="getUserCompanyManager(selectedLetterRequest) ? getUserCompanyManager(selectedLetterRequest).designation : ''"
                                                        :getCompanyDetails="getCompanyDetails.letterDetail"
                                                        :inlineStyle="inlineStyle" :leftSidebarLink="leftSidebarLink"
                                                        :rightSidebarLink="rightSidebarLink"
                                                        :leftSidebarCol="selectedLetterRequest.leftSidebarCol"
                                                        :bodyCol="selectedLetterRequest.bodyCol"
                                                        :rightSidebarCol="selectedLetterRequest.rightSidebarCol"
                                                        :leftsidebar="selectedLetterRequest.leftSideBar.preview"
                                                        :rightsidebar="selectedLetterRequest.rightSideBar.preview"
                                                        :header="selectedLetterRequest.headerShow.preview"
                                                        :footer="selectedLetterRequest.footerShow.preview"
                                                        :stamp="selectedLetterRequest.stampShow.preview"
                                                        :signatureShow="selectedLetterRequest.signatureShow.preview"
                                                        :watermark="selectedLetterRequest.watermarkShow.preview"
                                                        :signatory="selectedLetterRequest.signatory.preview" />
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                            <v-row v-else>
                                <v-card-title class="primary--text">No Letter Templates Found.</v-card-title>
                            </v-row>
                        </v-tab-item>
                        <v-tab-item id="letterKeyHint">
                            <v-row class="px-3">
                                <v-col cols="6" sm="12" md="6">
                                    <v-card color="px-5 pb-5" flat>
                                        <v-card-title class="pl-0 primary--text">Add New Letter Key Hint</v-card-title>
                                        <v-row class="">
                                            <v-col cols="12">
                                                <v-text-field outlined dense hint="Add one at a time" auto-grow class="py-0"
                                                    label="Letter key" v-model="str_letter_key"></v-text-field>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-textarea outlined dense rows="3" auto-grow class="py-0"
                                                    label="Add letter key hint" v-model="str_letter_key_hint"></v-textarea>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="text-right">
                                                <v-btn color="blue darken-2" class="mr-4 " :loading="processStarted"
                                                    @click.prevent="addLetterKeyHint" dark>Add Letter Key Hint</v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                                <v-col cols="6" sm="12" md="6">
                                    <v-card class="px-5 pb-3" flat>
                                        <v-card-title class="primary--text">View Letter Key Hints</v-card-title>
                                        <v-row>
                                            <v-simple-table height="300px">
                                                <template v-slot:default>
                                                    <thead>
                                                        <tr>
                                                            <th class="text-left">
                                                                No.
                                                            </th>
                                                            <th class="text-left">
                                                                Name
                                                            </th>
                                                            <th class="text-left">
                                                                Hint
                                                            </th>
                                                            <th class="text-left">
                                                                Delete
                                                            </th>
                                                            <th class="text-left">
                                                                Edit
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="(data, index) in LetterKeyHints" :key="data.name">
                                                            <td>{{ index + 1 }}</td>
                                                            <td>{{ data.key }}</td>
                                                            <td>{{ data.hint }}</td>
                                                            <td><v-icon small color="red"
                                                                    @click="deleteLetterKey(data)">mdi-delete</v-icon></td>
                                                            <td><v-icon small color="grey"
                                                                    @click="editLetterKey(data)">mdi-pencil</v-icon></td>
                                                        </tr>
                                                    </tbody>
                                                </template>
                                            </v-simple-table>
                                            <v-dialog v-model="dialogDelete" max-width="500px">
                                                <v-card>
                                                    <v-card-title class="text-h5">Are you sure you want to
                                                        delete?</v-card-title>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn color="blue darken-1" text :disabled="processStarted"
                                                            @click="dialogDelete = false">Cancel</v-btn>
                                                        <v-btn color="blue darken-1" text :disabled="processStarted"
                                                            @click="deleteLetterKeyConfirm">OK</v-btn>
                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <v-dialog v-model="dialogEdit" max-width="500px">
                                                <v-card>
                                                    <v-card-title class="text-h5">Edit Letter Key Hint</v-card-title>
                                                    <v-divider></v-divider>
                                                    <v-card-text class="pt-5">
                                                        <v-text-field label="Letter Key" dense outlined
                                                            v-model="editedItem.key"></v-text-field>
                                                        <v-textarea outlined dense rows="3" auto-grow
                                                            label="Letter key hint" v-model="editedItem.hint"></v-textarea>
                                                        <v-spacer></v-spacer>
                                                    </v-card-text>
                                                    <v-card-actions>
                                                        <v-btn color="blue darken-1" :disabled="processStarted" text
                                                            @click="dialogEdit = false">
                                                            Cancel
                                                        </v-btn>
                                                        <v-btn color="blue darken-1" :disabled="processStarted" text
                                                            @click="editLetterKeyConfirm">Save</v-btn>
                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-dialog>
                                            <!-- <v-col cols="12" class="pa-2 py-1" v-for="(data, index) in LetterKeyHints" :key="index">{{index + 1 }}.&nbsp;{{data.key}}: {{data.hint}} <v-icon>mdi-delete</v-icon> </v-col> -->
                                        </v-row>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>
            </v-col>
            <!-- Claim config -->
            <v-col cols="12" sm="12" lg="12" md="12" v-if="button_name == 'claims'" min-height="1000">
                <v-card class="my-5 rounded-xl">
                    <!-- <v-tabs v-model="tab" grow class="grey--text">
                        <v-tab href="#claimTypes">CLAIM TYPES</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab">
                        <v-tab-item id="claimTypes"> -->
                    <ClaimTypes />
                    <!-- </v-tab-item>
                    </v-tabs-items> -->
                </v-card>
            </v-col>


            <v-col cols="12" sm="12" lg="12" md="12" v-if="button_name == 'user'" min-height="1000">
                <v-card class="my-5 rounded-xl" v-if="button_name == 'user'" flat min-height="500">

                    <v-tabs v-model="tab1" grow class="justify-center grey--text">

                        <v-tab href="#approval_flow">Approval Flow Manager</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab1">
                        <v-tab-item id="approval_flow">
                            <v-row class="px-5">
                                <v-spacer></v-spacer>
                                <v-col cols="auto" class="pb-0">
                                    <v-switch v-model="viewApprovalFlow" class="pt-0 mt-0" inset color="indigo darken-3"
                                        hide-details></v-switch>
                                </v-col>
                            </v-row>
                            <h3 class="px-5 pt-5">Approval Flow Manager</h3>
                            <p class="px-5 mb-0 caption grey--text">Here you can add the approval flow for multiple
                                employees for each applications at once. You need to select the Employee Name, then select
                                the application for the list and finally select the approving members. For all applications,
                                approval flow is based on the fields selected in this section.</p>
                            <v-row class="pa-5" v-if="!viewApprovalFlow">
                                <v-col cols="12" sm="12" md="6" style="border-right: 1px dotted black;">
                                    <h3 class="blue-grey--text-custom text-center pb-3">Select Employee & Applications</h3>
                                    <v-divider></v-divider>
                                    <h4 class="blue-grey--text-custom font-weight-light pt-5">1. Select Setup Type</h4>
                                    <v-row class="pt-3">
                                        <v-col class="py-0" cols="12" sm="12">
                                            <v-radio-group v-model="bulk_update.employee_type" row class="mt-0">
                                                <v-radio v-for="n in radioOptions" :key="n" :label="n" :value="n"
                                                    @change="resetEmpDetails"></v-radio>
                                            </v-radio-group>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col class="font-weight-bold caption primary--text text--darken-2 pt-0">
                                            <div outlined dense v-if="bulk_update.employee_type == 'Employee'">Select
                                                Employee Names</div>
                                            <div outlined dense v-else-if="bulk_update.employee_type == 'Department'">Select
                                                Department</div>
                                            <div outlined dense v-else>Select Department & Team</div>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col class="py-0" cols="12" sm="12"
                                            v-if="bulk_update.employee_type == 'Employee'">
                                            <v-combobox multiple :items="getActiveUsers(users)" outlined dense
                                                :item-text="item => `${item.first_name} ${item.last_name}`" item-value="_id"
                                                placeholder="Employee Name" v-model="bulk_update.list_of_employees" row
                                                class="mt-0">
                                                <template v-slot:selection="{ item, index }">
                                                    <v-chip v-if="index === 0">
                                                        <span>{{ `${item.emp_id ? item.emp_id : ''} ${item.first_name}
                                                                                                                    ${item.last_name}` }}</span>
                                                    </v-chip>
                                                    <span v-if="index === 1"
                                                        class="grey--text caption">(+{{ bulk_update.list_of_employees.length
                                                            - 1 }} others)</span>
                                                </template>
                                                <template v-slot:prepend-item>
                                                    <v-list-item ripple @click="toggle">
                                                        <v-list-item-action>
                                                            <v-icon
                                                                :color="bulk_update.list_of_employees.length > 0 ? 'indigo darken-4' : ''">{{
                                                                    icon }}</v-icon>
                                                        </v-list-item-action>
                                                        <v-list-item-content>
                                                            <v-list-item-title>Select All</v-list-item-title>
                                                        </v-list-item-content>
                                                    </v-list-item>
                                                    <v-divider class="mt-2"></v-divider>
                                                </template>
                                            </v-combobox>
                                        </v-col>
                                        <v-col class="py-0" cols="12" sm="12"
                                            v-if="bulk_update.employee_type == 'Department'">
                                            <v-combobox outlined dense :items="getDepartMentName()" v-model="dept_name"
                                                label="Select Department"></v-combobox>
                                            <v-combobox multiple :items="getActiveUsers(fecthOnlyDept)" outlined dense
                                                :item-text="item => `${item.first_name} ${item.last_name}`" item-value="_id"
                                                placeholder="Employee Name" v-model="bulk_update.list_of_employees" row
                                                class="mt-0">
                                                <template v-slot:selection="{ item, index }">
                                                    <v-chip v-if="index === 0">
                                                        <span>{{ `${item.emp_id ? item.emp_id : ''} ${item.first_name}
                                                                                                                    ${item.last_name}` }}</span>
                                                    </v-chip>
                                                    <span v-if="index === 1"
                                                        class="grey--text caption">(+{{ bulk_update.list_of_employees.length
                                                            - 1 }} others)</span>
                                                </template>
                                                <template v-slot:prepend-item>
                                                    <v-list-item ripple @click="toggle2">
                                                        <v-list-item-action>
                                                            <v-icon
                                                                :color="bulk_update.list_of_employees.length > 0 ? 'indigo darken-4' : ''">{{
                                                                    icon2 }}</v-icon>
                                                        </v-list-item-action>
                                                        <v-list-item-content>
                                                            <v-list-item-title>Select All</v-list-item-title>
                                                        </v-list-item-content>
                                                    </v-list-item>
                                                    <v-divider class="mt-2"></v-divider>
                                                </template>
                                            </v-combobox>
                                        </v-col>
                                        <v-col class="py-0" cols="12" sm="12" v-if="bulk_update.employee_type == 'Team'">
                                            <v-combobox outlined dense :items="getDepartMentName()" v-model="dept_name"
                                                label="Select Department" @change="clearTeam"></v-combobox>
                                            <v-combobox outlined dense :items="fetchTeam" v-model="team_name"
                                                label="Select Team"></v-combobox>
                                            <v-combobox multiple :items="getActiveUsers(dept_users)" outlined dense
                                                :item-text="item => `${item.first_name} ${item.last_name}`" item-value="_id"
                                                placeholder="Employee Name" v-model="bulk_update.list_of_employees" row
                                                class="mt-0">
                                                <template v-slot:selection="{ item, index }">
                                                    <v-chip v-if="index === 0">
                                                        <span>{{ `${item.emp_id ? item.emp_id : ''} ${item.first_name}
                                                                                                                    ${item.last_name}` }}</span>
                                                    </v-chip>
                                                    <span v-if="index === 1"
                                                        class="grey--text caption">(+{{ bulk_update.list_of_employees.length
                                                            - 1 }} others)</span>
                                                </template>
                                                <template v-slot:prepend-item>
                                                    <v-list-item ripple @click="toggle3">
                                                        <v-list-item-action>
                                                            <v-icon
                                                                :color="bulk_update.list_of_employees.length > 0 ? 'indigo darken-4' : ''">{{
                                                                    icon3 }}</v-icon>
                                                        </v-list-item-action>
                                                        <v-list-item-content>
                                                            <v-list-item-title>Select All</v-list-item-title>
                                                        </v-list-item-content>
                                                    </v-list-item>
                                                    <v-divider class="mt-2"></v-divider>
                                                </template>
                                            </v-combobox>
                                        </v-col>
                                    </v-row>
                                    <div v-if="bulk_update.list_of_employees.length > 0">
                                        <!-- <v-divider></v-divider> -->
                                        <h4 class="blue-grey--text-custom font-weight-light pt-5">2. Select Applications
                                        </h4>
                                        <v-row class="">
                                            <v-col cols="12" sm="12" md="3" class="py-0">
                                                <v-checkbox v-model="bulk_update.list_of_application" label="Letters"
                                                    value="Letters"></v-checkbox>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="3" class="py-0">
                                                <v-checkbox v-model="bulk_update.list_of_application" label="Leaves"
                                                    value="Leaves"></v-checkbox>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="3" class="py-0">
                                                <v-checkbox v-model="bulk_update.list_of_application" label="Claims"
                                                    value="Claims"></v-checkbox>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="3" class="py-0">
                                                <v-checkbox v-model="bulk_update.list_of_application" label="Attendance"
                                                    value="Attendance"></v-checkbox>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="3" class="py-0">
                                                <v-checkbox v-model="bulk_update.list_of_application" label="Wfh"
                                                    value="Wfh"></v-checkbox>
                                            </v-col>
                                        </v-row>

                                    </div>
                                    <div v-if="bulk_update.list_of_application.length > 0">
                                        <h4 class="blue-grey--text-custom font-weight-light pt-3">3. Select Level &
                                            Approvers</h4>
                                        <v-row class="pt-3">
                                            <v-col cols="12" sm="12" md="6" class="py-0">
                                                <v-select outlined dense :items="number_of_approvers"
                                                    v-model='bulk_update.levels.approver_levels' persistent-hint
                                                    hint="Level of Approvals"></v-select>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="pb-0">
                                                <h4 class="blue-grey--text-custom pt-3">Line Manager Approver Level</h4>
                                                <v-radio-group v-model="lineMgrValue" row class="mt-0">
                                                    <v-radio v-for="n in lineMgrLevels" :key="n" :label="n" :value="n"
                                                        @click="resetApprovers"></v-radio>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="pb-0">
                                                <h4 class="blue-grey--text-custom pt-3">2nd Line Manager Approver Level</h4>
                                                <v-radio-group v-model="lineMgrValue1" row class="mt-0">
                                                    <v-radio v-for="n in lineMgrLevels" :key="n" :label="n" :value="n"
                                                        @click="resetApprovers"></v-radio>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>
                                        <v-row class="pt-3">
                                            <v-col cols="12" sm="12" md="6" class="py-0"
                                                v-if="bulk_update.levels.approver_levels == 1 || bulk_update.levels.approver_levels == 2 || bulk_update.levels.approver_levels == 3 || bulk_update.levels.approver_levels == 4">
                                                <v-select outlined dense v-model="bulk_update.levels.level_1"
                                                    :items="getActiveUsers(managers)"
                                                    :item-text="item => `${item.first_name} ${item.last_name}`"
                                                    item-value="_id" persistent-hint hint="Level 1 Approver"
                                                    :disabled='lineMgrValue == "Approver 1" || lineMgrValue1 == "Approver 1"'></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="6" class="py-0"
                                                v-if="bulk_update.levels.approver_levels == 2 || bulk_update.levels.approver_levels == 3 || bulk_update.levels.approver_levels == 4">
                                                <v-select outlined dense v-model="bulk_update.levels.level_2"
                                                    :items="getActiveUsers(managers)"
                                                    :item-text="item => `${item.first_name} ${item.last_name}`"
                                                    item-value="_id" persistent-hint hint="Level 2 Approver"
                                                    :disabled='lineMgrValue == "Approver 2" || lineMgrValue1 == "Approver 2"'></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="6" class="py-0"
                                                v-if="bulk_update.levels.approver_levels == 3 || bulk_update.levels.approver_levels == 4">
                                                <v-select outlined dense v-model="bulk_update.levels.level_3"
                                                    :items="getActiveUsers(managers)"
                                                    :item-text="item => `${item.first_name} ${item.last_name}`"
                                                    item-value="_id" persistent-hint hint="Level 3 Approver"
                                                    :disabled='lineMgrValue == "Approver 3" || lineMgrValue1 == "Approver 3"'></v-select>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="6" class="py-0"
                                                v-if="bulk_update.levels.approver_levels == 4">
                                                <v-select outlined dense v-model="bulk_update.levels.level_4"
                                                    :items="getActiveUsers(managers)"
                                                    :item-text="item => `${item.first_name} ${item.last_name}`"
                                                    item-value="_id" persistent-hint hint="Level 4 Approver"
                                                    :disabled='lineMgrValue == "Approver 4" || lineMgrValue1 == "Approver 4"'></v-select>
                                            </v-col>
                                        </v-row>
                                    </div>
                                    <v-row>
                                        <v-col class="text-right">
                                            <v-btn class="primary" depressed @click="userUpdate"
                                                :disabled="bulk_update.levels.level_1 == '' && lineMgrValue != 'Approver 1'">Update</v-btn>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <!-- <v-divider vertical></v-divider> -->
                                <!-- <v-col class="px-5" cols="12" sm="12" md="4" style="border-right: 1px dotted black;">
                        <h3 class="primary--text">1. Employee Names</h3>
                        <v-row >
                            <v-col>
                            <span v-if="bulk_update.list_of_employees.length > 0" >
                                <span v-for="(item,ind) in bulk_update.list_of_employees" :key="ind">
                                    <v-chip label class="mr-2" small outlined color="primary">{{item.first_name}} {{item.last_name}}</v-chip>
                                </span>
                            </span>
                            </v-col>
                        </v-row>

                        <h3 class="primary--text">2. Application Names</h3>
                        <v-row >
                            <v-col>
                            <span v-if="bulk_update.list_of_application.length > 0" >
                                <span v-for="(item,ind) in bulk_update.list_of_application" :key="ind">
                                    <v-chip label class="mr-2" small outlined color="primary">{{item}}</v-chip>
                                </span>
                            </span>
                            </v-col>
                        </v-row>

                        <h3 class="primary--text">3. Levels & Approvals</h3>
                        <v-row >
                            <v-col >
                            <div class="pb-3" v-if="bulk_update.levels.level_1 != ''">
                                Level 1 Approver : <v-chip label class="mr-2" small outlined color="primary">{{getEmployeeName(bulk_update.levels.level_1)}}</v-chip>
                            </div>
                            <div class="pb-3" v-if="bulk_update.levels.level_2 != ''">
                                Level 2 Approver : <v-chip label class="mr-2" small outlined color="primary">{{getEmployeeName(bulk_update.levels.level_2)}}</v-chip>
                            </div>
                            <div class="pb-3" v-if="bulk_update.levels.level_3 != ''">
                                Level 3 Approver : <v-chip label class="mr-2" small outlined color="primary">{{getEmployeeName(bulk_update.levels.level_3)}}</v-chip>
                            </div>
                            <div class="pb-3" v-if="bulk_update.levels.level_4 != ''">
                                Level 4 Approver : <v-chip label class="mr-2" small outlined color="primary">{{getEmployeeName(bulk_update.levels.level_4)}}</v-chip>
                            </div>

                            </v-col>
                        </v-row>
                        </v-col> -->
                                <v-col class="px-5" cols="12" sm="12" md="6">
                                    <h3 class="blue-grey--text-custom text-center pb-3">Preview</h3>
                                    <v-divider class="mb-5"></v-divider>
                                    <v-expansion-panels focusable>
                                        <v-expansion-panel v-for="(data, index) in bulk_update.list_of_employees"
                                            :key="index" class="mb-3">
                                            <v-expansion-panel-header>{{ index + 1 }}.&nbsp;{{ data.first_name }}
                                                {{ data.last_name }}</v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <!-- <span class="caption">Team :</span>  {{data.reporting.team}} <br>
                            <span class="caption">Department :</span>  {{data.reporting.department}} <br> -->
                                                <span class="caption">Line Manager :</span> {{ getEmployeeName(data &&
                                                    data.reporting ? data.reporting.manager : '') }} <br>
                                                <div
                                                    v-if="data && data.reporting ? data.reporting.hasOwnProperty('letters_approvals') : false">
                                                    <span class="caption">Letter Approval Levels :</span>
                                                    {{ data.reporting.letters_approvals.approver_levels }} [ <span
                                                        v-if="data.reporting.letters_approvals.level_1 != ''">{{ getEmployeeName(data.reporting.letters_approvals.level_1) }}</span><span
                                                        v-if="data.reporting.letters_approvals.level_2 != ''">,
                                                        {{ getEmployeeName(data.reporting.letters_approvals.level_2) }}</span><span
                                                        v-if="data.reporting.letters_approvals.level_3 != ''">,
                                                        {{ getEmployeeName(data.reporting.letters_approvals.level_3) }}</span><span
                                                        v-if="data.reporting.letters_approvals.level_4 != ''">,
                                                        {{ getEmployeeName(data.reporting.letters_approvals.level_4) }}</span>]
                                                </div>
                                                <div
                                                    v-if="data && data.reporting ? data.reporting.hasOwnProperty('leaves_approvals') : false">
                                                    <span class="caption">Leaves Approval Levels :</span>
                                                    {{ data.reporting.leaves_approvals.approver_levels }} [ <span
                                                        v-if="data.reporting.leaves_approvals.level_1 != ''">{{ getEmployeeName(data.reporting.leaves_approvals.level_1) }}</span><span
                                                        v-if="data.reporting.leaves_approvals.level_2 != ''">,
                                                        {{ getEmployeeName(data.reporting.leaves_approvals.level_2) }}</span><span
                                                        v-if="data.reporting.leaves_approvals.level_3 != ''">,
                                                        {{ getEmployeeName(data.reporting.leaves_approvals.level_3) }}</span><span
                                                        v-if="data.reporting.leaves_approvals.level_4 != ''">,
                                                        {{ getEmployeeName(data.reporting.leaves_approvals.level_4) }}</span>]
                                                </div>
                                                <div
                                                    v-if="data && data.reporting ? data.reporting.hasOwnProperty('claims_approvals') : false">
                                                    <span class="caption">Claims Approval Levels :</span>
                                                    {{ data.reporting.claims_approvals.approver_levels }} [ <span
                                                        v-if="data.reporting.claims_approvals.level_1 != ''">{{ getEmployeeName(data.reporting.claims_approvals.level_1) }}</span><span
                                                        v-if="data.reporting.claims_approvals.level_2 != ''">,
                                                        {{ getEmployeeName(data.reporting.claims_approvals.level_2) }}</span><span
                                                        v-if="data.reporting.claims_approvals.level_3 != ''">,
                                                        {{ getEmployeeName(data.reporting.claims_approvals.level_3) }}</span><span
                                                        v-if="data.reporting.claims_approvals.level_4 != ''">,
                                                        {{ getEmployeeName(data.reporting.claims_approvals.level_4) }}</span>]
                                                </div>
                                                <div
                                                    v-if="data && data.reporting ? data.reporting.hasOwnProperty('attendance_approvals') : false">
                                                    <span class="caption">Attendance Approval Levels :</span>
                                                    {{ data.reporting.attendance_approvals.approver_levels }} [ <span
                                                        v-if="data.reporting.attendance_approvals.level_1 != ''">{{ getEmployeeName(data.reporting.attendance_approvals.level_1) }}</span><span
                                                        v-if="data.reporting.attendance_approvals.level_2 != ''">,
                                                        {{ getEmployeeName(data.reporting.attendance_approvals.level_2) }}</span><span
                                                        v-if="data.reporting.attendance_approvals.level_3 != ''">,
                                                        {{ getEmployeeName(data.reporting.attendance_approvals.level_3) }}</span><span
                                                        v-if="data.reporting.attendance_approvals.level_4 != ''">,
                                                        {{ getEmployeeName(data.reporting.attendance_approvals.level_4) }}</span>]
                                                </div>
                                                <div
                                                    v-if="data && data.reporting ? data.reporting.hasOwnProperty('wfh_approvals') : false">
                                                    <span class="caption">WFH Approval Levels :</span>
                                                    {{ data.reporting.wfh_approvals.approver_levels }} [ <span
                                                        v-if="data.reporting.wfh_approvals.level_1 != ''">{{ getEmployeeName(data.reporting.wfh_approvals.level_1) }}</span><span
                                                        v-if="data.reporting.wfh_approvals.level_2 != ''">,
                                                        {{ getEmployeeName(data.reporting.wfh_approvals.level_2) }}</span><span
                                                        v-if="data.reporting.wfh_approvals.level_3 != ''">,
                                                        {{ getEmployeeName(data.reporting.wfh_approvals.level_3) }}</span><span
                                                        v-if="data.reporting.wfh_approvals.level_4 != ''">,
                                                        {{ getEmployeeName(data.reporting.wfh_approvals.level_4) }}</span>]
                                                </div>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>
                            </v-row>
                            <v-row class="pa-5" v-else>
                                <v-col cols="12" sm="12" md="12" style="border-right: 1px dotted black;">
                                    <ApprovalFlowTable :users='users' :configuration="configuration[0]" :roles="roles"
                                        :company="company" />
                                </v-col>
                            </v-row>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>

            </v-col>

            <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
                {{ snackText }}
                <template v-slot:action="{ attrs }">
                    <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
                </template>
            </v-snackbar>
            <v-snackbar v-model="duplicate" timeout="3000" color="red">
                There is already a Letter template in this name.
                <template v-slot:action="{ attrs }">
                    <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
                </template>
            </v-snackbar>
        </div>

    </div>
</template>
 
<script>
import moment from 'moment'
import LetterPreview from '~/components/reuseable/letterPreview.vue'
import LeaveCondition from '~/components/reuseable/leaveCondition.vue'
import WfhCondition from '~/components/reuseable/wfhCondition.vue'
import ClaimTypes from '~/components/reuseable/claimTypes.vue'

export default {
    components: {
        WfhCondition,
        ClaimTypes,
        LeaveCondition,
        LetterPreview,
    },
    props: ['users', 'configurations'],
    data() {
        return {
            holidayLoader: false,
            arr_priority: ['Critical', 'High', 'Medium', 'Low'],
            abb_items: ['ES', 'MS', 'AS'],
            shift_headers: [
                { text: 'Shift Type', value: 'shiftType' },
                { text: 'Required Employees', value: 'required_employees' },
                { text: 'Priority', value: 'priority' },
                { text: 'Abbreviation', value: 'abbreviation' },
                { text: 'Start Time', value: 'start_time' },
                { text: 'End Time', value: 'end_time' },
                { text: '', value: 'action' },
                { text: '', value: 'view' },
            ],
            shift_location: '',
            processStarted: false,
            //syncfucion starts
            letteredit: false,
            lettereditbefore: false,
            letterAdd: false,
            document: {
                elements: {
                    text: [],
                    table: [],
                    image: [],
                },
            },
            //syncfucion ends
            json_fields_designations: {
                Designations: 'designations'
            },
            json_fields_department: {
                Department: 'department'
            },
            json_fields_team: {
                Department: 'department',
                Team: 'team'
            },
            json_fields_religion: {
                Religion: 'religion'
            },
            vFileDesignationModel: undefined,
            vFileDepartmentModel: undefined,
            vFileTeamModel: undefined,
            vFileReligionModel: undefined,
            designation_location_index: '',
            shift_id: 0,
            team_location_index: '',
            department_location_index: '',
            religion_location_index: '',
            bulkUploadDesignationDialog: false,
            bulkUploadDepartmentDialog: false,
            bulkUploadTeamDialog: false,
            isEditDesignation: false,
            isEditShift: false,
            isEditTeam: false,
            isEditReligion: false,
            selectedDepartment: '',
            dialogDeleteDept: false,
            deleteDesignationDialog: false,
            deleteShiftDialog: false,
            deleteTeamDialog: false,
            bulkUploadReligionDialog: false,
            deleteReligionDialog: false,
            editDepartment: false,
            viewApprovalFlow: false,
            assets: {
                assetTab: null,
                asset_name: null,
                asset_desc: null,
                asset_uniq_id: null,
                asset_keys: [{}],
                asset_listing: [],
                asset_description_listing: [],
                asset_temp_store: {
                    asset_name: null,
                    asset_desc: null,
                    asset_uniq_id: null,
                    asset_keys: [],
                },
                assetInfoUpdateDialogToggle: false,
                assetInfoViewDialogToggle: false,
                existingOrNewAssetInfoDialog: true,
                asset_new: true,
                uniqueAssetTextFieldMatch: [],
                asset_uniq_id_temp: null/* ,
        selectedAssetInfo:[],
        selectedAssetKey:[],
        assetKeysForExpiry:[],
        selectedAssetKeyForExpiry:[] */
            },
            validationRules: {
                required: value => !!value || 'Required.',
                uniqueIdMatch: value => value !== this.assets.asset_uniq_id_temp || "This unique ID already exists"
            },
            holiday_yearly_filter: [],
            holiday_company_filter: [],
            holidayYears: [],
            cronjobsList: [],
            addOrEditCronJob: false,
            errorMessages: [],
            edit_request_progress: false,
            allRequestTypes: ['Leave', 'Letters', 'Claims', 'wfh', 'Loan', 'Education Allowance', 'Passport Release/Safekeep', 'Attendance'],
            stepperStep: 1,
            overlapLeaves: [],
            delcared_holidays: [],
            holiday_yearly_filter: [],
            holiday_company_filter: [],
            holidayYears: [],
            policyloading: false,
            hrpolicyfiles: undefined,
            tab_wfh: false,
            /* New Keys Starts */
            newsShortDesc: '',
            newsCategories: [
                'newClient',
                'regionalNews',
                'nathanNews',
                'teamNews',
                'spotlight'
            ],
            storiesImage: false,
            newsImage: false,
            newsAttachments: false,
            dialog_location: false,
            schedule_name: '',
            off_days: [],
            days: [],
            work_schedule: [],
            company_work_schedules: [],
            leaveType: ['Annual Leaves', 'Medical Leaves', 'Half Day Leave', 'Emergency Leaves', 'Paternal Leaves', 'Maternity Leaves'],
            letterNewPreview: false,
            letterUpdatePreview: false,
            dialogDelete: false,
            letterKeys: [],
            array_types: ['Select', 'Date Picker', 'Text Feild', 'Textarea'],
            duplicate: false,
            dialog: false,
            delete_confirm_dialog: false,
            array_fonts: ['Arial', 'Times New Roman', '"Lucida Console", "Courier New", monospace'],
            previewOptions: ["Preview", "PDF"],
            dateFormat: ["YYYY-MM-DD", "YYYY-DD-MM", "DD-MM-YYYY", "D MMMM YYYY"],
            str_letter_key_hint: '',
            str_letter_key: '',
            editorOptionAddressee: {
                debug: 'info',
                placeholder: 'Type Your Addressee here...',
                // theme: 'snow',
                readOnly: true,
                modules: {
                    toolbar: [['bold', 'underline', 'italic']],

                }
            },
            editorOptionSubject: {
                debug: 'info',
                placeholder: 'Type Your Subject here...',
                // theme: 'snow',
                readOnly: true,
                modules: {
                    toolbar: [['bold', 'underline', 'italic']],
                }
            },
            editorOption: {
                debug: 'info',
                placeholder: 'Type Your Letter...',
                readOnly: true,
                // theme: 'snow',
                modules: {
                    toolbar: [['bold', 'underline', 'italic'], [{ 'indent': '-1' }, { 'indent': '+1' }], [{ 'align': [] }], [{ 'list': 'ordered' }, { 'list': 'bullet' }],],
                }
            },
            letterRequest: {
                category: 'selfService',
                leftSidebarCol: 0,
                bodyCol: 12,
                rightSidebarCol: 0,
                newkey: "",
                company_signatory: true,
                signatory_manager: {},
                user_keys: true,
                letterKeys: [],
                dateFormat: "YYYY-MM-DD",
                headerShow: {
                    preview: true,
                    pdf: false
                },
                footerShow: {
                    preview: true,
                    pdf: false
                },
                signatureShow: {
                    preview: false,
                    pdf: false
                },
                signatory: {
                    preview: true,
                    pdf: false
                },
                leftSideBar: {
                    preview: false,
                    pdf: false
                },
                rightSideBar: {
                    preview: false,
                    pdf: false
                },
                stampShow: {
                    preview: false,
                    pdf: false
                },
                watermarkShow: {
                    preview: true,
                    pdf: false
                },
                formattedText: {
                    formatStyle: "text_alignment_left",
                    formatHeader: "text_alignment_left",
                    formatDate: "text_alignment_left",
                    subjectAlignment: 'Left',
                    headerAlignment: 'Left',
                    dateAlignment: "Left"
                },
                letterDescription: {
                    header: '',
                    subject: '',
                    date: new Date().toISOString().substr(0, 10),
                    body: '',
                    requestType: '',
                    requestSubType: '',
                    managers: ''
                }
            },
            editedIndex: -1,
            editedItem: {
                key: '',
                hint: ''
            },
            dialogEdit: false,
            /* New Keys End */
            config_details: {},
            addLeaveTypes: [],
            leaveAccessList: ['Always', 'After Probation', 'After 6 Months', 'After 1 Year'],
            bulkUpload: [],
            emp_id_str: '',
            failed_ids: [],
            dialog_overlay: false,
            isSent: false,
            leave: {
                leave_type: 'Annual Leaves',
                from_date: new Date().toISOString().substr(0, 10),
                to_date: new Date().toISOString().substr(0, 10),
                no_of_days: '0',
                remaining_leaves: '',
                reason: '',
                status: '',
                approver_id: '',
                certificate: [],
                user_id: '',
                approvals: []
            },
            leaveType: ['Annual Leaves', 'Medical Leaves', 'Emergency Leaves', 'Paternal Leaves', 'Maternity Leaves', 'Compassionate Leaves', 'Hajj Leaves'],
            leaveTypeList: [{ name: 'Annual Leaves', access: '' }, { name: 'Medical Leaves', access: '' }, { name: 'Emergency Leaves', access: '' }, { name: 'Paternal Leaves', access: '' }, { name: 'Maternity Leaves', access: '' }, { name: 'Compassionate Leaves', access: '' }, { name: 'Hajj Leaves', access: '' }, , { name: 'Priviledge Leaves', access: '' }],
            radioOptions: ['Employee', 'Department', 'Team'],
            bankConfigRadioOptions: ["Add", "Select Existing"],
            bankRadioSelection: 'Add',
            application_names: ['Letters', 'Leaves', 'Claims', 'Attendance'],
            number_of_approvers: ['1', '2', '3', '4'],
            button_name: 'general',
            tab: '',
            tab1: 'approval_flow',
            tab_company: '',
            tab_leave: false,
            alertForTitle: false,
            fromDate: false,
            from: false,
            to: false,
            valid: '',
            user: {
                personal: {},
                bank: {},
                education: {},
                work_experience: {},
                documents: {},
                emergency: {},
                reporting: {},
                leaves: {},
                salary: {}
            },
            quotes: {
                created_by: '',
                quote_text: '',
                created_date: new Date().toISOString().substring(0, 10)
            },
            events: {
                created_by: '',
                event_text: '',
                event_date: new Date().toISOString().substr(0, 10),
                created_date: new Date().toISOString().substr(0, 10)
            },
            stories: {
                id: '',
                type: 'Tips',
                header_image: '',
                title: '',
                short_desc: '',
                sub_header1: '',
                sub_header2: '',
                sub_header3: '',
                sub_header4: '',
                sub_header5: '',
                sub_header6: '',
                sub_header7: '',
                sub_header8: '',
                sub_header9: '',
                sub_header10: '',
                text1: '',
                text2: '',
                text3: '',
                text4: '',
                text5: '',
                text6: '',
                text7: '',
                text8: '',
                text9: '',
                text10: '',
                text11: '',
                created_date: new Date().toISOString().substr(0, 10),
                created_by: '',
            },
            config: {
                costCenterOptions: '',
                sendPayslipOptions: '',
                paymentModeOptions: '',
                bankName: '',
                routingCode: '',
                fixed: '',
                earning: '',
                deduction: '',
                recurring_earning: '',
                recurring_deduction: '',
                nationality: '',
                work_location: '',
                imported_bank_list: ''
            },
            holiday_calendar: {
                company_ID: '',
                created_by: '',
                holiday_name: '',
                deleted: false,
                from_date: new Date().toISOString().substr(0, 10),
                to_date: new Date().toISOString().substr(0, 10),
                created_date: new Date().toISOString().substring(0, 10)
            },
            cron_job: {
                cronExpression: '',
                taskName: '',
                created_date: new Date().toISOString().substring(0, 10)
            },
            surveys: {
                survey_name: '',
                survey_question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                option5: '',
                option6: '',
                survey_options: [],
                page: '',
                created_by: '',
                created_date: new Date().toISOString().substring(0, 10)
            },
            news: {
                title: '',
                header_image: '',
                attachments: [],
                short_desc: '',
                created_date: new Date().toISOString().substr(0, 10),
                category: 'nathanNews',
                highlight: false,
                created_by: '',
                status: "N",
                delete: false
            },
            from: false,
            email: {
                hr_manager: '',
                finance_manager: '',
                payslip_sender_email: ''
            },
            genericRule: [
                v => !!v || 'This field is Required'
            ],
            configure: [],
            //upload
            uploadFiles: '',
            filename_attach: '',
            link_url: '',
            link_filename: '',
            selectedItem: [],
            dragging: false,
            dialog_attach: false,
            story_type: ['Tips', 'News', 'Social Quotient', 'Launch', 'Groups Info'],
            pages: ['dashboard', 'myhr'],
            teamName: '',
            showValue: false,
            dept: {
                id: 0,
                name: '',
                teams: [],
                created_by: '',
                created_date: new Date().toISOString()
            },
            isAdminRole: false,
            isManagerRole: false,
            isHRMgrRole: false,
            isFinanceMgrRole: false,
            onboardingRole: false,
            employeeRole: false,
            dept_name: '',
            team_name: '',
            dept_users: [],
            lineMgrChecks: ['Approver 1', 'Approver 2', 'Approver 3', 'Approver 4', 'None'],
            lineMgrValue: 'None',
            lineMgrValue1: 'None',
            bulk_update: {
                employee_type: 'Employee',
                list_of_employees: [],
                list_of_application: [],
                levels: {
                    approver_levels: 1,
                    level_1: '',
                    level_2: '',
                    level_3: '',
                    level_4: ''
                }
            },
            radioOption: ['Left', 'Right'],
            radioOptionForSubject: ['Left', 'Right', 'Center'],
            dataLetter: "",
            letterType: [],
            letterSubType: [],
            isNewletter: true,
            addKey: false,
            userLineManagerUpdate: {
                list_of_employees: [],
                line_manager: [],
                senior_line_manager: ''
            },
            bulkReassignment: {
                to_be_replaced: '',
                replaced_by: ''
            },
            csvUpload: [],
            bulkpasswordfile: undefined,
            csvUploadForLeaves: [],
            csvUploadUser: [],
            csvUploadDesignation: [],
            csvUploadDepartment: [],
            csvUploadTeam: [],
            csvUploadReligion: [],
            csvUploadUserData: [],
            data: [],
            update: false,
            search: '',
            headers: [
                { text: 'ID', value: 'emp_id' },
            ],
            dialog_password_gen: false,
            number_of_employees: 0,
            // Excel
            json_fields_roles: {
                Role_Names: "role_name",
            },
            json_fields_companies: {
                Company_Names: "company_name",
            },
            json_fields_passwords: {
                Password: "password",
            },
            userNewData: [],
            snack: false,
            snackText: '',
            snackColor: '',
            shift: {
                start_time: '',
                end_time: '',
                shiftType: '',
                colors: '#2196F3'
            },
            shiftTypes: [],
            text: '',
            add_schedule_progress: false,
            add_designation_progress: false,
            str_designation_name: '',
            add_religion_progress: false,
            str_religion_name: '',
            location_name: "",
            radius: 0,
            lattitude: 25.075366,
            longitude: 55.139988,
            location: {
                location_name: '',
                radius: 10,
                company_location: {
                    type: "Point",
                    coordinates: [
                        55.139988,
                        25.075366
                    ]
                },
            },
            arr_locations: [],
            locationIndex: -1,
            dialog_location_delete: false,
            managers: [],
            centralConfig: [],
            centralConfigBanks: [],
            company: [],
            roles: [],
            depts: [],
            pages: [],
            headers: [
                {
                    text: 'Log Type',
                    align: 'start',
                    sortable: false,
                    value: 'logType',
                },
                { text: 'Details', sortable: false, value: 'message' },
                { text: 'Created', sortable: false, value: 'createdAt' },
            ],
            category_search: "",
            logs: [],
            categoryItems: [
                "USER_UPDATED_BY",
                "USER_CREATED_BY",
                "USER_LOGIN_SUCCESS",
                "USER_LOGIN_FAILED",
                "USER_LOGOUT",
                "USER_FORGOT_PASSWORD",
                "USER_NEW_PASSWORD",
                "USER_NEW_ACCOUNT",
                "ANNOUNCEMENTS",
                "HOLIDAY_CALENDAR",
                "POLICIES",
                "DEPARTMENT_TEAMS",
                "SHIFT",
                "BULK_USER_UPLOAD",
                "BULK_PASSWORD_EMAIL",
                "LINE_MANAGER_CONFIGURATION",
                "APPROVAL_FLOW_MANAGER",
                "REASSIGNMENT_MANAGER",
                "LEAVES_MANAGER",
                "DOCUMENT_UPLOADER",
            ],
            approvalManagers: [],
            uploadPolicy: [],
            json_holiday_calendar_table: [
                { text: "Company Name", value: "company_name" },
                { text: "Holiday Name", value: "holiday_name" },
                { text: "From", value: "from_date" },
                { text: "To", value: "to_date" },
                { text: "Action", value: "" },
            ],
            json_cron_job_table: [
                { text: "Expression", value: "cronExpression" },
                { text: "Text", value: '' },
                { text: "Task Name", value: "taskName" },
                { text: "Action", value: "" },
            ],
            holidayLoading: false,
            cronJobLoading: false,
            cronGetLoading: false,
            editedIndex: -1,
            dialogHolidayDelete: false,
            deletedCronJob: false,
            dialogHolidayEdit: false,
            editedItem: {},
            loading: false,
            selectedHoliday: {},
            selectedCronJob: {},
            editCronJobflag: false,
            menu0: '',
            menu1: '',
            new_holiday_filter: [],
            gradeSystem: {
                grades: [],
                gradeInput: {
                    title: "",
                    description: "",
                    order: 0
                },
                flags: {
                    isEdit: false
                },
                validation: {
                    genericRule: [
                        v => !!v || 'This field is Required'
                    ],
                }
            },
            configuration: [],
        }
    },
    created() {
        this.$nuxt.$on('enableProcess', () => {
            this.processStarted = true
        })
        this.$nuxt.$on('confUpdate', () => {
            this.getConf()
        })
        this.$nuxt.$on('LatLongSync', ($event) => {
            this.lattitude = $event.lat
            this.longitude = $event.lng
            this.radius = 0
        })
    },
    beforeDestroy() {
        this.$nuxt.$off('enableProcess')
        this.$nuxt.$off('confUpdate')
        this.$nuxt.$off('LatLongSync')
    },
    mounted() {
        // console.log(this.configurations)
        this.configuration = this.configurations
        this.config_details = this.configurations[0]
        this.getData()
        this.getRole(),
            this.pageLoad(),
            this.getUserInfo(),
            this.letterTypeList()
        this.showData('New')
        // this.getWorkSchdeule(),
        // this.getLocations()
        // this.getCoordinates()
        // this.getLogs()
        // this.getCronJobsList()
        this.holiday_calendar = {}
        this.cron_job = {}
        let d = new Date()
        let year = d.getFullYear().toString()
        this.holiday_yearly_filter = year
        // this.fetchGrade()
        this.$router.push({ query: { tab: this.button_name } })
        if (this.$route.query.tab) {
            this.button_name = this.$route.query.tab
            this.$router.push({ query: { tab: this.button_name } })
        }
    },
    async beforeMount() {
        // this.handleGetAssetDescriptionListing()
        // this.handleGetAssetInfoListing()
    },
    methods: {
        async getData() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            this.approvalManagers = await this.$axios.$get("/users/approval/managers/" + "60291131ba0fa610587e0f08", { headers: { Authorization: AuthStr } })
            this.roles = await this.$axios.$get("/roles/", { headers: { Authorization: AuthStr } })
            // this.pages = await this.$axios.$get("/pages/all", { headers: { Authorization: AuthStr } });
            this.managers = await this.$axios.$get("/users/manager", { headers: { Authorization: AuthStr } })
            this.centralConfig = await this.$axios.$get("/configuration/NNCentralSalaryConfigurations")
            this.centralConfigBanks = await this.$axios.$get("/configuration/NNCentralConfigurations/banks")
            this.company = await this.$axios.$get("/companies/all", { headers: { Authorization: AuthStr } })
        },
        async getConf() {
            this.configuration = this.$store.getters.getConf
            this.processStarted = false
        },
        resetEmpDetails() {
            this.team_name = ''
            this.dept_name = ''
            this.bulk_update.list_of_employees = ''
        },
        toggle2() {
            this.$nextTick(() => {
                if (this.selectAllEmployee2) {
                    this.bulk_update.list_of_employees = []
                }
                else {
                    let id = []
                    for (var i = 0; i < this.getActiveUsers(this.fecthOnlyDept).length; i++) {
                        id.push(this.getActiveUsers(this.fecthOnlyDept)[i])
                    }
                    this.bulk_update.list_of_employees = id
                }
            })
        },
        toggle() {
            this.$nextTick(() => {
                if (this.selectAllEmployee) {
                    this.bulk_update.list_of_employees = []
                }
                else {
                    let id = []
                    for (var i = 0; i < this.getActiveUsers(this.users).length; i++) {
                        id.push(this.getActiveUsers(this.users)[i])
                    }
                    this.bulk_update.list_of_employees = id
                }
            })
        },
        async userUpdate() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            let update = this.bulk_update

            let userArr = []
            for (let index = 0; index < update.list_of_employees.length; index++) {
                userArr.push(update.list_of_employees[index]._id)
            }

            for (let index = 0; index < userArr.length; index++) {
                let abc = this.users.filter(a => a._id == userArr[index])
                let def = this.bulk_update.levels
                // Assigning Line Managers
                if (this.lineMgrValue == 'Approver 1') {
                    def.level_1 = abc[0].reporting.manager
                }
                if (this.lineMgrValue == 'Approver 2') {
                    def.level_2 = abc[0].reporting.manager
                }
                if (this.lineMgrValue == 'Approver 3') {
                    def.level_3 = abc[0].reporting.manager
                }
                if (this.lineMgrValue == 'Approver 4') {
                    def.level_4 = abc[0].reporting.manager
                }

                // Assigning Senior Manager
                if (this.lineMgrValue1 == 'Approver 1') {
                    def.level_1 = abc[0].reporting.senior_manager
                }
                if (this.lineMgrValue1 == 'Approver 2') {
                    def.level_2 = abc[0].reporting.senior_manager
                }
                if (this.lineMgrValue1 == 'Approver 3') {
                    def.level_3 = abc[0].reporting.senior_manager
                }
                if (this.lineMgrValue1 == 'Approver 4') {
                    def.level_4 = abc[0].reporting.senior_manager
                }

                // Adding levels of approval list 
                if (this.bulk_update.list_of_application.includes('Letters')) {
                    abc[0].reporting.letters_approvals = def
                }
                if (this.bulk_update.list_of_application.includes('Leaves')) {
                    abc[0].reporting.leaves_approvals = def
                }
                if (this.bulk_update.list_of_application.includes('Claims')) {
                    abc[0].reporting.claims_approvals = def
                }
                if (this.bulk_update.list_of_application.includes('Attendance')) {
                    abc[0].reporting.attendance_approvals = def
                }
                if (this.bulk_update.list_of_application.includes('Wfh')) {
                    abc[0].reporting.wfh_approvals = def
                }

                await this.$axios.$put('users/update/' + abc[0]._id, abc, { headers: { Authorization: AuthStr } })
                    .then(res => {
                    })
                    .catch();
            }
            setTimeout(() => {
                let routerStr = '/configuration?tab=' + this.button_name
                this.$router.go(routerStr)
            }, 1000);
        },
        getEmployeeName(val) {
            if (!val) {
                return ''
            }
            else {
                let abc = this.users.filter(a => a._id == val)
                if (abc.length > 0) {
                    return abc[0].first_name + ' ' + abc[0].last_name
                }
                else {
                    return ''
                }
            }
        },
        resetApprovers() {
            this.bulk_update.levels.level_1 = ''
            this.bulk_update.levels.level_2 = ''
            this.bulk_update.levels.level_3 = ''
            this.bulk_update.levels.level_4 = ''
        },
        getActiveUsers(users) {
            if (users && users.length > 0) {
                let activeUsers = []
                activeUsers = users.filter(a => a.user_status != 'Inactive')
                return _.sortBy(activeUsers, ["first_name", "middle_name", "last_name"])
            }
            else {
                return users
            }
        },
        getDepartMentName() {
            let department = []
            this.configuration[0].dept.forEach(element => {
                department.push(element.name)
            });
            return department
        },
        getRole() {
            this.isManagerRole = this.$store.getters.getUser
            this.isAdminRole = this.$store.getters.isAdmin
            this.isHRMgrRole = this.$store.getters.isHRMgr
            this.isFinanceMgrRole = this.$store.getters.isFinanceMgr
            this.employeeRole = this.$store.getters.isEmployee
            // if(this.isAdminRole === 'false'){
            //   this.$router.push('/payroll')
            // }
            this.getLetterConfig()
        },
        getLetterConfig() {
            if (!this.isNewletter) {
                if (this.configuration[0].letterRequest && this.configuration[0].letterRequest.length > 0) {
                    this.letterRequest.letterDescription.requestType = this.configuration[0].letterRequest[0].letterDescription.requestType
                    this.letterRequest.letterDescription.requestSubType = this.configuration[0].letterRequest[0].letterDescription.requestSubType
                }
                // let shift = []
                // this.configuration[0].shifts.forEach(function (data) {
                //     shift.push(data.shiftType)
                // })
                // this.shiftTypes = shift
            }
        },
        pageLoad() {
            if (this.isAdminRole == true || this.isManagerRole == true) {
                this.$router.go(-1)
            }
        },
        async getUserInfo() {
            this.user = this.$store.getters.getThisUser
        },
        letterTypeList() {
            // console.log("letterTypeList", this.configuration[0].letterRequest)
            let letterType = [];
            let letterSubType = [];
            if (this.configuration[0].letterRequest) {
                this.configuration[0].letterRequest.forEach(function (letter) {
                    if (letterType.indexOf(letter.letterDescription.requestType) == -1) {
                        letterType.push(letter.letterDescription.requestType);
                    }
                    if (letterType.indexOf(letter.letterDescription.requestSubType) == -1) {
                        if (letter.letterDescription.requestSubType != "") {
                            letterSubType.push(letter.letterDescription.requestSubType)
                        }
                    }
                })
                this.letterType = letterType
                this.letterSubType = letterSubType
            }
        },
        showData(data) {
            if (data == 'New') {
                this.showValue = true
            }
        },
        getWorkSchdeule() {
            this.days = this.configuration[0].days
            this.work_schedule = this.configuration[0].work_schedule
            this.company_work_schedules = this.configuration[0].company_work_schedules
        },
        async getLogs() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            this.logs = await this.$axios.$get('/logs', { headers: { Authorization: AuthStr } })
        },
        tabSelected() {
            this.$router.push({ query: { tab: this.button_name } })
        },
        createNewLetterType(data) {
            if (data == 'new') {
                this.letterKeys = []
                this.letterRequest.letterDescription.requestSubType = ''
                this.isNewletter = true;
                this.letterRequest = {
                    category: 'selfService',
                    dateFormat: "YYYY-MM-DD",
                    leftSidebarCol: 0,
                    bodyCol: 12,
                    rightSidebarCol: 0,
                    user_keys: true,
                    company_signatory: true,
                    signatory_manager: {},
                    letterKeys: [],
                    headerShow: {
                        preview: true,
                        pdf: false
                    },
                    footerShow: {
                        preview: true,
                        pdf: false
                    },
                    signatureShow: {
                        preview: false,
                        pdf: false
                    },
                    signatory: {
                        preview: true,
                        pdf: false
                    },
                    leftSideBar: {
                        preview: false,
                        pdf: false
                    },
                    rightSideBar: {
                        preview: false,
                        pdf: false
                    },
                    stampShow: {
                        preview: false,
                        pdf: false
                    },
                    watermarkShow: {
                        preview: true,
                        pdf: false
                    },
                    formattedText: {
                        formatStyle: "text_alignment_left",
                        formatHeader: "text_alignment_left",
                        formatDate: "text_alignment_left",
                        subjectAlignment: 'Left',
                        headerAlignment: 'Left',
                        dateAlignment: "Left"
                    },
                    letterDescription: {
                        header: '',
                        subject: '',
                        date: new Date().toISOString().substr(0, 10),
                        body: '',
                        requestType: '',
                        requestSubType: '',
                        managers: ''
                    },
                }
            } else {
                this.letterRequest.letterDescription.requestSubType = this.letterSubType.length > 0 ? this.letterSubType[0] : ''
                this.isNewletter = false;
                this.getRole()
            }
        },
        getColumn() {
            if (this.letterRequest.rightSideBar.preview && this.letterRequest.leftSideBar.preview) {
                this.letterRequest.leftSidebarCol = "1"
                this.letterRequest.bodyCol = "10"
                this.letterRequest.rightSidebarCol = "1"
            } else if (this.letterRequest.rightSideBar.preview || this.letterRequest.leftSideBar.preview) {
                if (this.letterRequest.rightSideBar.preview) {
                    this.letterRequest.leftSidebarCol = "0"
                    this.letterRequest.bodyCol = "11"
                    this.letterRequest.rightSidebarCol = "1"
                } else if (this.letterRequest.leftSideBar.preview) {
                    this.letterRequest.leftSidebarCol = "1"
                    this.letterRequest.bodyCol = "11"
                    this.letterRequest.rightSidebarCol = "0"
                }
            } else {
                this.letterRequest.leftSidebarCol = "0"
                this.letterRequest.bodyCol = "12"
                this.letterRequest.rightSidebarCol = "0"
            }
        },
        getColumnExisting() {
            if (this.letterType.length > 0) {
                if (this.selectedLetterRequest.rightSideBar.preview && this.selectedLetterRequest.leftSideBar.preview) {
                    this.selectedLetterRequest.leftSidebarCol = '1'
                    this.selectedLetterRequest.bodyCol = '10'
                    this.selectedLetterRequest.rightSidebarCol = '1'
                } else if (this.selectedLetterRequest.rightSideBar.preview || this.selectedLetterRequest.leftSideBar.preview) {
                    if (this.selectedLetterRequest.rightSideBar.preview) {
                        this.selectedLetterRequest.leftSidebarCol = '0'
                        this.selectedLetterRequest.bodyCol = '11'
                        this.selectedLetterRequest.rightSidebarCol = "1"
                    } else if (this.selectedLetterRequest.leftSideBar.preview) {
                        this.selectedLetterRequest.leftSidebarCol = '1'
                        this.selectedLetterRequest.bodyCol = '11'
                        this.selectedLetterRequest.rightSidebarCol = '0'
                    }
                } else {
                    this.selectedLetterRequest.leftSidebarCol = '0'
                    this.selectedLetterRequest.bodyCol = '12'
                    this.selectedLetterRequest.rightSidebarCol = '0'
                }
            }
        },
        fetchLetterKey() {
            return this.configuration[0].letter_key_hint ? this.configuration[0].letter_key_hint : ''
        },
        editLetterKey(item) {
            this.editedIndex = this.LetterKeyHints.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogEdit = true
        },
        editLetterKeyConfirm() {
            this.processStarted = true
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            Object.assign(this.letter_key_hint[this.editedIndex], this.editedItem)
            let configure = this.configuration[0]
            configure.letter_key_hint = this.letter_key_hint

            let arr = []
            arr.push(configure)

            this.$axios.$put('/configuration/update/' + this.configuration[0]._id, arr, { headers: { Authorization: AuthStr } })
                .then(async (res) => {
                    let configData = await this.$axios.$get("/configuration/all", { headers: { Authorization: AuthStr } })
                    if (configData) {
                        this.snack = true
                        this.snackColor = 'success'
                        this.snackText = 'Key updated Successfully'
                        this.processStarted = false
                        this.configuration = configData
                        this.dialogEdit = false
                        this.editedIndex = -1
                    }
                })
                .catch();
        },
        deleteLetterKey(item) {
            this.editedIndex = this.LetterKeyHints.indexOf(item)
            this.dialogDelete = true
        },
        deleteLetterKeyConfirm() {
            this.processStarted = true
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            this.letter_key_hint.splice(this.editedIndex, 1)
            let configure = this.configuration[0]
            configure.letter_key_hint = this.letter_key_hint

            let arr = []
            arr.push(configure)

            this.$axios.$put('/configuration/update/' + this.configuration[0]._id, arr, { headers: { Authorization: AuthStr } })
                .then(async (res) => {
                    let configData = await this.$axios.$get("/configuration/all", { headers: { Authorization: AuthStr } })
                    if (configData) {
                        this.dialogDelete = false
                        this.snack = true
                        this.snackColor = 'success'
                        this.snackText = 'Key Deleted'
                        this.processStarted = false
                        this.configuration = configData
                        this.dialogDelete = false
                        this.editedIndex = -1
                    }
                })
                .catch();
        },
        addLeterKeyHint() {
            this.letterKeys.push({
                name: '',
                type: '',
                selector_values: ''
            })
        },
        removeLeterKeyHint(index) {
            if (this.letterKeys.length > 0) {
                this.letterKeys.splice(index, 1)
            }
        },
        async deleteLetter() {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);

            let selected = this.selectedLetterRequest

            for (var i = 0; i < this.configuration[0].letterRequest.length; i++) {
                if (this.configuration[0].letterRequest[i].letterDescription.requestType == selected.letterDescription.requestType &&
                    this.configuration[0].letterRequest[i].letterDescription.requestSubType == selected.letterDescription.requestSubType) {
                    this.configuration[0].letterRequest.splice(i, 1);
                }
            }
            this.dialog = false
            this.letterTypeList()
            this.letterRequest.letterDescription.requestType = this.letterType[0]
            this.letterRequest.letterDescription.requestSubType = this.letterSubType[0]

            let configure = this.configuration[0]
            let arr = []
            arr.push(configure)

            let updateConfig = await this.$axios.$put('/configuration/update/' + this.configuration[0]._id, arr, { headers: { Authorization: AuthStr } })

            if (updateConfig) {
                this.configuration = await this.$axios.$get("/configuration/all", { headers: { Authorization: AuthStr } })
            }
        },
        saveLetterFormat() {

            this.duplicate = false
            this.uploadFiles ? this.uploadFile(this.uploadFiles) : '';
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            let configure = this.configuration[0]
            let arr = []
            if (this.isNewletter) {

                this.letterRequest.letterKeys = this.letterKeys

                //duplicate checking
                for (let index = 0; index < configure.letterRequest.length; index++) {
                    const element = configure.letterRequest[index];
                    if (this.letterRequest.letterDescription.requestType == element.letterDescription.requestType &&
                        this.letterRequest.letterDescription.requestSubType == element.letterDescription.requestSubType) {
                        this.duplicate = true
                        break;
                    }
                }
                if (!this.duplicate) {
                    configure.letterRequest.push(this.letterRequest)
                    arr = []
                    arr.push(configure)
                }
            }
            else {
                this.selectedLetterRequest.letterKeys = this.letterKeys
                configure.letterRequest.forEach(data => {
                    if (data.letterDescription.requestSubType) {
                        if (data.letterDescription.requestType == this.selectedLetterRequest.letterDescription.requestType && data.letterDescription.requestSubType == this.selectedLetterRequest.letterDescription.requestSubType) {
                            data = this.selectedLetterRequest.letterDescription.requestType
                        }
                        else {
                            if (data.letterDescription.requestType == this.selectedLetterRequest.letterDescription.requestType) {
                                data = this.selectedLetterRequest.letterDescription.requestType
                            }
                        }
                    }
                })
                arr = []
                arr.push(configure)
            }
            if (!this.duplicate) {
                this.$axios.$put('/configuration/update/' + this.configuration[0]._id, arr, { headers: { Authorization: AuthStr } })
                    .then(res => {
                        this.letterTypeList()
                        setTimeout(() => {
                            let routerStr = '/configuration?tab=' + this.button_name
                            this.$router.go(routerStr)
                        }, 1000);
                    })
            }
        },
        addLetterPreview() {
            let defultkeys = ['[managername]', '[manageremail]', '[managerphone]', '[managerheshe]', '[name]', '[day]', '[date]', '[nationality]', '[passport]', '[designation]', '[department]', '[doj]', '[bank]', '[iban]', '[bankAccountNumber]', '[totalFixed]', '[salaryInWords]', '[title]', '[companyName]', '[gender]', '[passportNumber]', '[passportIssueDate]', '[passportExpiryDate]', '[dob]', '[his/her]', '[he/she]', '[him/her]', '[basicSalary]', '[transportallowance]', '[accommodationallowance]', '[otherallowance]', '[medicalallowance]', '[basicSalaryInWords]', '[empBasicSalary]', '[empTotalFixed]', '[totalFixedWord]', '[loanAmountInWords]']
            let keys = _.uniq(this.config_details.letter_key_hint.map(a => a.key).concat(defultkeys)).sort()
            // let keys = ['[name]','[day]', '[date]', '[nationality]', '[passport]', '[designation]', '[doj]', '[bank]', '[iban]', '[bankAccountNumber]', '[totalFixed]', '[salaryInWords]', '[title]', '[companyName]', '[gender]', '[passportNumber]', '[passportIssueDate]', '[passportExpiryDate]', '[dob]', '[his/her]', '[him/her]', '[basicSalary]','[basicSalaryInWords]','[empBasicSalary]','[empTotalFixed]','[totalFixedWord]','[loanAmountInWords]']
            this.document.documentName = this.letterRequest.letterDescription.requestType
            this.document.contentbefore = ''
            this.document.elements.text = keys.concat(this.letterKeys.map(a => a.name.key))
            this.letterAdd = true
        },
        isLetterTypeUnique() {
            let result = this.configuration[0].letterRequest.filter(a => a.letterDescription.requestType.indexOf(this.letterRequest.letterDescription.requestType) > -1)
            this.text = ''
            if (result.length > 0) {
                this.text = 'This Letter Already exist in the system. Please Choose existing Letter.'
            }
        },
        formatDate(value, formatType) {
            if (this.isNewletter) {
                if (value == 'Right') {
                    this.letterRequest.formattedText.formatDate = "text_alignment_right"
                }
                else {
                    this.letterRequest.formattedText.formatDate = "text_alignment_left"
                }
            } else {
                if (value == 'Right') {
                    this.selectedLetterRequest.formattedText.formatDate = "text_alignment_right"
                }
                else {
                    this.selectedLetterRequest.formattedText.formatDate = "text_alignment_left"
                }
            }

        },
        formatHeader(value, formatType) {
            if (this.isNewletter) {
                if (value == 'Right') {
                    this.letterRequest.formattedText.formatHeader = "text_alignment_right"
                }
                else {
                    this.letterRequest.formattedText.formatHeader = "text_alignment_left"
                }
            } else {
                if (value == 'Right') {
                    this.selectedLetterRequest.formattedText.formatHeader = "text_alignment_right"
                }
                else {
                    this.selectedLetterRequest.formattedText.formatHeader = "text_alignment_left"
                }
            }

        },
        formatSubject(value, formatType) {
            if (this.isNewletter) {
                if (value == 'Left') {
                    this.letterRequest.formattedText.formatStyle = "text_alignment_left"
                }
                if (value == 'Right') {
                    this.letterRequest.formattedText.formatStyle = "text_alignment_right"
                }
                if (value == 'Center') {
                    this.letterRequest.formattedText.formatStyle = "text_alignment_center"
                }
            } else {
                if (value == 'Left') {
                    this.selectedLetterRequest.formattedText.formatStyle = "text_alignment_left"
                }
                if (value == 'Right') {
                    this.selectedLetterRequest.formattedText.formatStyle = "text_alignment_right"
                }
                if (value == 'Center') {
                    this.selectedLetterRequest.formattedText.formatStyle = "text_alignment_center"
                }
            }

        },
        getUserCompanyManager(letterType) {
            if (letterType.company_signatory) {
                let userCompany = this.company.filter((ele) => ele._id == this.user.company_ID)
                return userCompany.length ? userCompany[0].letterDetail.manager : " "
            } else {
                return letterType.signatory_manager
            }
        },
        openDocumentEditor() {
            let defultkeys = ['[managername]', '[manageremail]', '[managerphone]', '[managerheshe]', '[name]', '[day]', '[date]', '[nationality]', '[passport]', '[designation]', '[department]', '[doj]', '[bank]', '[iban]', '[bankAccountNumber]', '[totalFixed]', '[salaryInWords]', '[title]', '[companyName]', '[gender]', '[passportNumber]', '[passportIssueDate]', '[passportExpiryDate]', '[dob]', '[his/her]', '[he/she]', '[him/her]', '[basicSalary]', '[transportallowance]', '[accommodationallowance]', '[otherallowance]', '[medicalallowance]', '[basicSalaryInWords]', '[empBasicSalary]', '[empTotalFixed]', '[totalFixedWord]', '[loanAmountInWords]']
            let keys = _.uniq(this.config_details.letter_key_hint.map(a => a.key).concat(defultkeys)).sort()
            this.document.documentName = this.selectedLetterRequest.letterDescription.requestType + ' - ' + this.selectedLetterRequest.letterDescription.requestSubType
            this.document.content = this.selectedLetterRequest.content
            this.document.elements.text = keys.concat(this.letterKeys.map(a => a.name.key))
            this.letteredit = true
        },
        openDocumentEditorbefore() {
            let defultkeys = ['[managername]', '[manageremail]', '[managerphone]', '[managerheshe]', '[name]', '[day]', '[date]', '[nationality]', '[passport]', '[designation]', '[department]', '[doj]', '[bank]', '[iban]', '[bankAccountNumber]', '[totalFixed]', '[salaryInWords]', '[title]', '[companyName]', '[gender]', '[passportNumber]', '[passportIssueDate]', '[passportExpiryDate]', '[dob]', '[his/her]', '[he/she]', '[him/her]', '[basicSalary]', '[transportallowance]', '[accommodationallowance]', '[otherallowance]', '[medicalallowance]', '[basicSalaryInWords]', '[empBasicSalary]', '[empTotalFixed]', '[totalFixedWord]', '[loanAmountInWords]']
            let keys = _.uniq(this.config_details.letter_key_hint.map(a => a.key).concat(defultkeys)).sort()
            // let keys = ['[name]','[day]', '[date]', '[nationality]', '[passport]', '[designation]', '[doj]', '[bank]', '[iban]', '[bankAccountNumber]', '[totalFixed]', '[salaryInWords]', '[title]', '[companyName]', '[gender]', '[passportNumber]', '[passportIssueDate]', '[passportExpiryDate]', '[dob]', '[his/her]', '[him/her]', '[basicSalary]','[basicSalaryInWords]','[empBasicSalary]','[empTotalFixed]','[totalFixedWord]','[loanAmountInWords]']
            this.document.documentName = this.selectedLetterRequest.letterDescription.requestType + ' - ' + this.selectedLetterRequest.letterDescription.requestSubType
            this.document.contentbefore = this.selectedLetterRequest.contentbefore
            this.document.elements.text = keys.concat(this.letterKeys.map(a => a.name.key))
            this.lettereditbefore = true
        },
        async uploadFile(file) {
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);
            const fd = new FormData();
            fd.append('a', file)
            await this.$axios.$post("/companies/upload-files", fd, { headers: { Authorization: AuthStr } })
                .then(res => {
                    if (this.isNewletter) {
                        this.letterRequest.signatory_manager.signature = res.url
                    } else {
                        this.selectedLetterRequest.signatory_manager.signature = res.url
                    }

                })
                .catch();
        },
        addLetterKeyHint() {
            this.processStarted = true
            const token = this.$store.getters.getToken
            const AuthStr = 'Bearer '.concat(token);


            let configure = this.configuration[0]
            configure.letter_key_hint.splice(0, 0, {
                key: this.str_letter_key,
                hint: this.str_letter_key_hint
            })
            _.uniq(configure.letter_key_hint)

            let arr = []
            arr.push(configure)

            this.$axios.$put('/configuration/update/' + this.configuration[0]._id, arr, { headers: { Authorization: AuthStr } })
                .then(async (res) => {
                    let configData = await this.$axios.$get("/configuration/all", { headers: { Authorization: AuthStr } })
                    if (configData) {
                        this.snack = true
                        this.snackColor = 'success'
                        this.snackText = 'Key Added'
                        this.processStarted = false
                        this.configuration = configData
                        this.str_letter_key = ''
                        this.str_letter_key_hint = ''
                    }
                })
                .catch();
        },
    },
    computed: {
        formattedFromDate() {
            const isoDate = this.selectedHoliday.from_date;
            const dateOnly = isoDate.split("T")[0];
            return dateOnly;
        },
        formattedToDate() {
            const isoDate = this.selectedHoliday.to_date;
            const dateOnly = isoDate.split("T")[0];
            return dateOnly;
        },
        computedShifts() {
            let shifts = this.configuration[0].work_locations.find(
                (loc) => loc.work_location === this.shift_location
            );
            if (shifts) {
                return shifts.shifts.map((shiftInfo) => {
                    const shift = shiftInfo.shift;
                    return {
                        shiftType: shift.shiftType,
                        required_employees: shiftInfo.required_employees,
                        priority: shiftInfo.priority,
                        abbreviation: shift.abbreviation,
                        start_time: shift.start_time,
                        end_time: shift.end_time,
                        id: shift.id
                    };
                });
            }
            return [];
        },
        fetchWorkLocations() {
            let work_location = []
            for (let index = 0; index < this.configuration[0].work_locations.length; index++) {
                const element = this.configuration[0].work_locations[index];
                work_location.push(element.work_location)
            }

            function sortByWorkLocation(a, b) {
                const locationA = a.toUpperCase();
                const locationB = b.toUpperCase();

                if (locationA < locationB) {
                    return -1;
                } else if (locationA > locationB) {
                    return 1;
                }
                return 0;
            }
            return work_location != [] ? work_location.sort(sortByWorkLocation) : ''
        },
        fetchUniqueDepartments() {
            if (this.depts) {
                let abc = this.depts
                let arr = []
                for (let i = 0; i < abc.length; i++) {
                    arr.push({ id: abc[i].id, name: abc[i].name })
                }
                return _.orderBy(_.uniq(arr), ['name'], ['asc'])
            }
        },
        fetchSelectedDepts() {
            if (this.selectedDepartment && this.configuration && this.configuration.length > 0) {
                const department = this.configuration[0].dept.find(dept => dept.name === this.selectedDepartment);

                if (department && department.teams) {
                    return department.teams;
                }
            }
            return [];
        },
        // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
        /*     mapAssetInfoSelection(){
              return this.assets.asset_listing.map(el=>{return el.asset_uniq_id})
            }, */
        // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
        computedCheckTaskName() {
            return true
        },
        icon() {
            if (this.selectAllEmployee) return 'mdi-close-box'
            if (this.selectSomeEmployee) return 'mdi-minus-box'
            return 'mdi-checkbox-blank-outline'
        },
        selectAllEmployee() {
            return this.bulk_update.list_of_employees ? this.bulk_update.list_of_employees.length === this.getActiveUsers(this.users).length : false
        },
        selectSomeEmployee() {
            return this.bulk_update.list_of_employees.length > 0 && !this.selectAllEmployee
        },
        icon2() {
            if (this.selectAllEmployee2) return 'mdi-close-box'
            if (this.selectSomeEmployee2) return 'mdi-minus-box'
            return 'mdi-checkbox-blank-outline'
        },
        selectAllEmployee2() {
            return this.bulk_update.list_of_employees ? this.bulk_update.list_of_employees.length === this.getActiveUsers(this.fecthOnlyDept).length : false
        },
        selectSomeEmployee2() {
            return this.bulk_update.list_of_employees.length > 0 && !this.selectAllEmployee2
        },
        icon3() {
            if (this.selectAllEmployee3) return 'mdi-close-box'
            if (this.selectSomeEmployee3) return 'mdi-minus-box'
            return 'mdi-checkbox-blank-outline'
        },
        selectAllEmployee3() {
            return this.bulk_update.list_of_employees ? this.bulk_update.list_of_employees.length === this.getActiveUsers(this.dept_users).length : false
        },
        selectSomeEmployee3() {
            return this.bulk_update.list_of_employees.length > 0 && !this.selectAllEmployee3
        },


        /* New Compute starts here */
        googleMapMarkers() {
            let markers = [{
                position: { lat: this.lattitude, lng: this.longitude },
            }]
            return markers
        },
        LetterKeyHints() {
            return _.reverse(this.configuration[0].letter_key_hint)
        },
        inlineStyle() {
            return {
                backgroundImage: `url(${this.getCompanyDetails.letterDetail ? this.getCompanyDetails.letterDetail.waterMarkLink : ''})`
            }
        },
        leftSidebarLink() {
            return {
                backgroundImage: `url(${this.getCompanyDetails.letterDetail ? this.getCompanyDetails.letterDetail.leftSideBarLink : ''})`
            }
        },
        rightSidebarLink() {
            return {
                backgroundImage: `url(${this.getCompanyDetails.letterDetail ? this.getCompanyDetails.letterDetail.rightSideBarLink : ''})`
            }
        },
        computeDateFormat() {
            if (this.letterType.length > 0 && !this.isNewletter) {
                return moment(this.letterRequest.letterDescription.date).format(this.selectedLetterRequest.dateFormat)
            } else {
                return moment(this.letterRequest.letterDescription.date).format(this.letterRequest.dateFormat)
            }
        },
        selectedLetterRequest() {
            if (!this.isNewletter) {

                if (this.letterRequest.letterDescription.requestSubType == '') {
                    this.letterRequest.letterDescription.requestSubType = this.letterSubType.length > 0 ? this.letterSubType[0] : ''
                }
                let result = this.configuration[0].letterRequest.filter(a => {
                    if (a.letterDescription.requestSubType == "") {
                        return a.letterDescription.requestType == this.letterRequest.letterDescription.requestType
                    }
                    else {
                        return (a.letterDescription.requestSubType == this.letterRequest.letterDescription.requestSubType && a.letterDescription.requestType == this.letterRequest.letterDescription.requestType)
                    }
                })
                this.letterKeys = result.length > 0 ? result[0].letterKeys : []
                return result[0]
            } else {

                let result = this.configuration[0].letterRequest.filter(a => {
                    if (a.letterDescription.requestSubType == "") {
                        return a.letterDescription.requestType == this.letterRequest.letterDescription.requestType
                    }
                    else {
                        return (a.letterDescription.requestSubType == this.letterRequest.letterDescription.requestSubType && a.letterDescription.requestType == this.letterRequest.letterDescription.requestType)
                    }
                })
                return result[0]
            }
        },
        /* New Compute ends here */
        getCompanyDetails() {
            let result = this.company.filter(data => {
                return data.id = this.user.company_ID
            })
            return result.length > 0 ? result[0] : ""
        },
        getHrDetails() {
            if (this.isNewletter) {
                let filterReportingManager = this.users.filter(a => a._id == this.letterRequest.letterDescription.manager)
                return filterReportingManager.length > 0 ? filterReportingManager[0] : ""
            }
            else {
                if (this.selectedLetterRequest) {
                    let filterReportingManager = this.users.filter(a => a._id == this.selectedLetterRequest.letterDescription.manager)
                    return filterReportingManager.length > 0 ? filterReportingManager[0] : ""
                }
                return []
            }
        },
        getManagerDetails() {
            let result = this.users.filter(data => {
                return data.role_ID != "5e438bda1c9d4400000db544"
            })
            return result
        },
        config_rev() {
            return _.reverse(this.configuration[0].stories)
        },
        reversed() {
            return _.reverse(this.configuration[0].quotes)
        },
        hol_order() {
            return _.orderBy(this.configuration[0].holiday_calendar, 'from_date', 'asc')
        },
        survey_order() {
            return _.orderBy(this.configuration[0].surveys, 'created_date', 'desc')
        },
        deptGrouyBy() {
            let abc = _.groupBy(this.configuration[0].dept, function (item) { return item.name })
            return abc
        },
        fetchTeam() {
            if (this.dept_name != '') {
                let abc = this.configuration[0].dept.filter(a => a.name == this.dept_name)
                let arr = []
                if (abc.length > 0) {
                    // dept and
                    for (let index = 0; index < abc.length; index++) {
                        for (let i = 0; i < abc[index].teams.length; i++) {
                            arr.push(abc[index].teams[i].name)
                        }
                    }
                    if (arr.length > 0 && this.team_name != '') {
                        for (let a = 0; a < arr.length; a++) {
                            this.dept_users = this.users.filter(f => f.reporting?.department == this.dept_name && f.reporting?.team == this.team_name)
                        }
                    }
                    return arr
                }
                else return []
            }
        },
        fecthOnlyDept() {
            if (this.dept_name != '') {
                let abc = this.users.filter(f => f.reporting?.department == this.dept_name)
                return abc
            }
            else return []
        },
        lineMgrLevels() {
            let abc = this.lineMgrChecks
            abc = abc.slice(0, this.bulk_update.levels.approver_levels)
            abc.push('None')
            return abc
        },
        generatePassword() {
            let arr = []
            for (let i = 0; i < this.number_of_employees; i++) {
                let abc = {
                    password: ''
                }
                abc.password = String.fromCodePoint(...Array.from({ length: 16 }, () => Math.floor(Math.random() * 57) + 65))
                arr.push(abc)
            }
            return arr
        },
        calculateLeaveDays() {
            let dt1 = new Date(this.leave.from_date)
            let dt2 = new Date(this.leave.to_date)
            let no_of_days = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24)) + 1;

            if (this.leave.leave_type == 'Half Day Leave') {
                this.leave.no_of_days = parseFloat((no_of_days) / 2)
            } else {
                this.leave.no_of_days = parseFloat(no_of_days)
            }
            return this.leave.no_of_days
        },
        fetchEmployeesForManagerReplacement() {
            if (this.bulkReassignment.to_be_replaced == undefined || this.bulkReassignment.to_be_replaced == '' || this.bulkReassignment.replaced_by == undefined || this.bulkReassignment.replaced_by == '') {
                return ''
            }
            else {
                let arr = []
                for (let index = 0; index < this.users.length; index++) {
                    if (this.users[index].reporting.hasOwnProperty('letters_approvals')) {
                        if (this.users[index].reporting.letters_approvals.hasOwnProperty('approver_levels') && this.users[index].reporting.letters_approvals.approver_levels != '0' && this.users[index].reporting.letters_approvals.approver_levels != '') {
                            if (this.users[index].reporting.letters_approvals.level_1 != '') {
                                if (this.users[index].reporting.letters_approvals.level_1 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.letters_approvals.level_2 != '') {
                                if (this.users[index].reporting.letters_approvals.level_2 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.letters_approvals.level_3 != '') {
                                if (this.users[index].reporting.letters_approvals.level_3 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.letters_approvals.level_4 != '') {
                                if (this.users[index].reporting.letters_approvals.level_4 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                        }
                    }
                    if (this.users[index].reporting.hasOwnProperty('leaves_approvals')) {
                        if (this.users[index].reporting.leaves_approvals.hasOwnProperty('approver_levels') && this.users[index].reporting.leaves_approvals.approver_levels != '0' && this.users[index].reporting.leaves_approvals.approver_levels != '') {
                            if (this.users[index].reporting.leaves_approvals.level_1 != '') {
                                if (this.users[index].reporting.leaves_approvals.level_1 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.leaves_approvals.level_2 != '') {
                                if (this.users[index].reporting.leaves_approvals.level_2 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.leaves_approvals.level_3 != '') {
                                if (this.users[index].reporting.leaves_approvals.level_3 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.leaves_approvals.level_4 != '') {
                                if (this.users[index].reporting.leaves_approvals.level_4 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                        }
                    }
                    if (this.users[index].reporting.hasOwnProperty('claims_approvals')) {
                        if (this.users[index].reporting.claims_approvals.hasOwnProperty('approver_levels') && this.users[index].reporting.claims_approvals.approver_levels != '0' && this.users[index].reporting.claims_approvals.approver_levels != '') {
                            if (this.users[index].reporting.claims_approvals.level_1 != '') {
                                if (this.users[index].reporting.claims_approvals.level_1 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.claims_approvals.level_2 != '') {
                                if (this.users[index].reporting.claims_approvals.level_2 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.claims_approvals.level_3 != '') {
                                if (this.users[index].reporting.claims_approvals.level_3 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                            if (this.users[index].reporting.claims_approvals.level_4 != '') {
                                if (this.users[index].reporting.claims_approvals.level_4 == this.bulkReassignment.to_be_replaced) {
                                    arr.push(this.users[index])
                                }
                            }
                        }
                    }
                }
                return _.uniq(arr, '_id')
            }
        },
        computedLeaveTypeList() {
            let abc = this.leaveTypeList
            let config = this.configuration
            if (this.configuration[0].hasOwnProperty('leaveTypes') && this.configuration[0].leaveTypes.length > 0) {
                let filtered = this.configuration[0].leaveTypes.map(a => a.name)
                return abc.filter(a => !filtered.includes(a.name))
            }
            else {
                return this.leaveTypeList
            }
        }
    }
}
</script>
<style>
.e-treeview .e-popup {
    display: none !important;
}

.e-grid .e-gridpopup {
    display: none !important;
}

.e-ganttpopup {
    display: none !important;
}

.e-schedule .e-content-placeholder {
    display: none !important;
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

/* .ql-editor {
    min-height:300px !important;
}
 
.ql-container {
    min-height:200px !important;
 
} */

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

/* New Styles starts here */
.letter_delete_button {
    color: white;
}

.letter_delete_text {
    color: black;
}

.v-application p {
    margin-bottom: 0;
}

.v-dialog {
    overflow-y: hidden !important
}

/* New Styles ends here */</style> 