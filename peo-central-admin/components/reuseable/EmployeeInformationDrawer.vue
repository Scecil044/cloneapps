<template>
  <div class="new vs_custom">
    <v-toolbar elevation="0" dark class="blue-grey darken-2">
      <v-toolbar-title>Employee Details</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <div class="d-flex align-center">
          <v-btn icon rounded fab dark @click="closeDrawer">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-toolbar-items>
    </v-toolbar>
    <v-divider></v-divider>
    <v-progress-linear
      v-if="loading"
      :indeterminate="loading"
      color="deep-purple accent-4"
    ></v-progress-linear>
    <v-card :rounded="false" elevation="0" v-if="employee" flat>
      <v-card-text class="text-center">
        <!-- Drawer header -->
        <v-row class="align-center pb-3" dense>
          <v-col cols="2">
            <v-avatar
              v-if="employee.image_url"
              size="100"
              color="blue"
              class="lighten-5 mr-0"
            >
              <v-img :src="employee.image_url"></v-img>
            </v-avatar>
            <div class="v-avatar" v-else>
              <customerDefaultIcon
                height="100px"
                width="100px"
                style="border-radius: 50px"
              />
            </div>
          </v-col>
          <v-col cols="10" class="text-left">
            <h4 class="py-1 h1 font-weight-bold d-flex flex-column">
              {{ employee.first_name }} {{ employee.last_name }}
              <span class="body-2 pt-0"></span>
            </h4>
            <p>{{ employee.email }}</p>
            <p class="mt-2 font-weight-light grey--text text--darken-1 body-2">{{ employee.employment.designation }}</p>
          </v-col>
        </v-row>
        <v-divider></v-divider>

        <v-tabs
          v-model="currentTab"
          grow
          class="grey--text pt-2"
          next-icon="mdi-arrow-right-bold-box-outline"
          prev-icon="mdi-arrow-left-bold-box-outline"
          show-arrows
        >
          <!-- Personal info -->
          <v-tab
            href="#personal"
            class="blue-grey--text text--darken-2 font-weight-bold"
          >
            <v-icon small class="mr-2">mdi-account</v-icon>
            Personal
          </v-tab>
          <!-- contract info -->
          <v-tab
            href="#contract"
            class="blue-grey--text text--darken-2 font-weight-bold"
          >
            <v-icon small class="mr-2">mdi-file-sign</v-icon>
            Contract Info
          </v-tab>
          <!-- Emergency Contact info -->
          <v-tab
            href="#emergencyContact"
            class="blue-grey--text text--darken-2 font-weight-bold"
          >
            <v-icon small class="mr-2">mdi-car-emergency</v-icon>
            Emergency Contact
          </v-tab>
          <!-- documents -->
          <v-tab
            href="#documents"
            class="blue-grey--text text--darken-2 font-weight-bold"
          >
            <v-icon small class="mr-2">mdi-text-box-multiple-outline</v-icon>
            Documents
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="currentTab">
          <v-tab-item id="personal">
            <v-row class="pt-4">
              <v-col
                cols="12"
                sm="6"
                class="px-5 font weight-bold pt-0 text-left"
              >
                <h2 class="body-1 font-weight-bold blue-grey--text">
                  Activity & Categories
                </h2>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <div class="text-left">
              <v-container>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Activity :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{
                        employee.employment.designation | hyphenate_empty_string
                      }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Skills :</span
                    >
                  </v-col>
                  <v-col
                    v-if="
                      employee.hasOwnProperty('skill_sets') &&
                      employee.skill_sets
                    "
                    cols="4"
                    sm="6"
                    md="4"
                    class="pb-0"
                  >
                    <h5
                      v-for="(data, index) in employee.personal.skill_sets"
                      :key="index"
                      class="mb-0 body-2 blue-grey--text font-weight-bold"
                    >
                      {{ data }}
                    </h5>
                  </v-col>
                  <v-col v-else>
                    <p>-</p>
                  </v-col>
                </v-row>
              </v-container>
            </div>

            <!-- Employee Details -->

            <v-row class="pt-5">
              <v-col
                cols="12"
                sm="6"
                class="px-5 font weight-bold pt-0 text-left"
              >
                <h2 class="body-1 font-weight-bold blue-grey--text">
                  Employee Details
                </h2>
              </v-col>
            </v-row>
            <v-divider></v-divider>

            <div class="text-left">
              <v-container>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Employment Type :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0" v-if="employee.employment">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.employment.employment_type
                            | hyphenate_empty_string
                        }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >First Name :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.first_name | hyphenate_empty_string }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Middle Name :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.middle_name | hyphenate_empty_string }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Last Name :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.last_name | hyphenate_empty_string }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Email :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.email | hyphenate_empty_string }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Gender :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.gender | hyphenate_empty_string }}
                      </span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Mobile Number :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0" v-if="employee.personal">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.personal.phone | hyphenate_empty_string }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Date of Birth :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span
                        v-if="employee.hasOwnProperty('dob')"
                        class="mb-0 body-2 blue-grey--text font-weight-bold"
                      >
                        {{ employee.dob | formatDateWithoutTime }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Allergies :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0" v-if="employee.employment">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.personal.allergies | hyphenate_empty_string }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Marital Status :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.marital_status | hyphenate_empty_string }}
                      </span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Speed Dial :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.personal.speed_dial | hyphenate_empty_string
                        }}
                      </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Nationality :</span
                      >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.nationality | hyphenate_empty_string }}
                      </span>
                  </v-col>
                 <v-row v-if="employee.onBoardingDetails">
                   <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Assigned PRO :</span
                      >
                   </v-col>
                   <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ employee.onBoardingDetails?.assignedPro?.name | hyphenate_empty_string }}
                      </span>
                   </v-col>
                   <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >EID Center :</span
                      >
                   </v-col>
                   <v-col cols="12 d-flex flex_column" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        Name: {{ employee.onBoardingDetails.eid_center.name | hyphenate_empty_string }}
                      </span>
                     <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        Address: {{ employee.onBoardingDetails.eid_center.address | hyphenate_empty_string }}
                      </span>
                   </v-col>
                   <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Medical Center :</span
                      >
                   </v-col>
                   <v-col cols="12 d-flex flex_column" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        Name: {{ employee.onBoardingDetails?.medical_center?.name | hyphenate_empty_string }}
                      </span>
                     <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        Address: {{ employee.onBoardingDetails?.medical_center?.address | hyphenate_empty_string }}
                      </span>
                   </v-col>
                   <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Tawjeeh Center :</span
                      >
                   </v-col>
                   <v-col cols="12 d-flex flex_column" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        Name: {{ employee.onBoardingDetails?.tawjeeh_center?.name | hyphenate_empty_string }}
                      </span>
                     <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        Address: {{ employee.onBoardingDetails?.tawjeeh_center.address | hyphenate_empty_string }}
                      </span>
                   </v-col>
                 </v-row>
                </v-row>
                <v-row></v-row>
              </v-container>
            </div>

            <!-- dependent Details -->
            <template v-if="employee.dependent">

              <v-row class="pt-5">
                <v-col
                  cols="12"
                  sm="6"
                  class="px-5 font weight-bold pt-0 text-left"
                >
                  <h2 class="body-1 font-weight-bold blue-grey--text">
                    Dependents Details
                  </h2>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <div class="text-left">
                <v-container>
                  <v-row
                    :class="
                      index !== employee.dependent_details.length - 1
                        ? 'border-b-sm'
                        : ''
                    "
                    v-for="(dependent, index) in employee.dependent_details"
                    :key="index"
                  >
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Name :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ dependent.dependent_name | hyphenate_empty_string }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Relation :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{ dependent.relation | hyphenate_empty_string }}
                      </span>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </template>

            <!-- Company Details -->

            <v-row class="pt-5">
              <v-col
                cols="12"
                sm="6"
                class="px-5 font weight-bold pt-0 text-left"
              >
                <h2 class="body-1 font-weight-bold blue-grey--text">
                  Company Details
                </h2>
              </v-col>
            </v-row>

            <v-divider></v-divider>
            <div class="text-left">
              <v-container>
                <v-row>
                  <v-col cols="12" md="2" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Company name :</span
                    >
                  </v-col>
                  <v-col
                    cols="12"
                    md="4"
                    class="pa-0 pa-2 docs_upload d-flex align-center"
                  >
                    <v-avatar size="30">
                      <v-img :src="employee.company_logo" />
                    </v-avatar>
                    <h5 class="mx-3 body-2 font-weight-bold">
                      {{ employee.company_name | hyphenate_empty_string }}
                    </h5>
                  </v-col>

                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Company legal Name :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.company_legal_name | hyphenate_empty_string }}
                    </span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Company Address :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.company_address | hyphenate_empty_string }}
                    </span>
                  </v-col>

                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Company Country :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.company_country | hyphenate_empty_string }}
                    </span>
                  </v-col>
                </v-row>
              </v-container>
            </div>
          </v-tab-item>

          <v-tab-item id="contract">
            <v-row class="pt-5">
              <v-col
                cols="12"
                sm="6"
                class="px-5 font weight-bold pt-0 text-left"
              >
                <h2 class="body-1 font-weight-bold blue-grey--text">
                  Current Visa Information
                </h2>
              </v-col>
            </v-row>
            <v-divider></v-divider>

            <div class="text-left">
              <v-container>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Current Status :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.user_location | hyphenate_empty_string }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Visa Type :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.visa_type | hyphenate_empty_string }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Visa Sponsor :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" lass="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.visa_sponsor | hyphenate_empty_string }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Visa Designation :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.visa_designation | hyphenate_empty_string }}
                    </span>
                  </v-col>
                </v-row>
              </v-container>
            </div>

            <!-- Employment Status -->

            <template v-if="employee.employment">

              <v-row class="pt-1">
                <v-col cols="12" class="px-5 font weight-bold pt-0 text-left">
                  <h2 class="body-1 font-weight-bold blue-grey--text">
                    Employment Status
                  </h2>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <div class="text-left">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Joined Date :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.employment.date_of_joining
                            | formatDateWithoutTime
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Next Renewal Date :
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.employment.contract_end_date
                            | formatDateWithoutTime
                        }}
                      </span>
                    </v-col>
                  </v-row>
                  <v-row></v-row>
                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Designation :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.employment.designation | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Nationality :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.personal.nationality | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Probation period :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        v-if="employee.vip"
                        class="mb-0 body-2 blue-grey--text font-weight-bold"
                      >
                        {{ employee.probation_period | hyphenate_empty_string }}
                      </span>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </template>

            <!-- salary -->
            <template v-if="employee.salary">

              <v-row class="pt-1">
                <v-col cols="12" class="px-5 font weight-bold pt-0 text-left">
                  <h2 class="body-1 font-weight-bold blue-grey--text">Salary</h2>
                </v-col>
              </v-row>

              <v-divider></v-divider>

              <div class="text-left">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Basic Salary :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.salary.basic_salary | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Housing Allowance :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.salary.housing_allowance
                            | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Emiratization fee:
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.salary.emiratization_fee | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Car allowance:
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.salary.car_allowance | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Petrol allowance:
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.salary.petrol_allowance
                            | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Living support allowance:
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.salary.living_support_allowance
                            | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Total monthly fee:
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.salary.total_monthly_fee
                            | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Total Salary :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-bold"
                      >{{
                          employee.salary.total_fixed | hyphenate_empty_string
                        }}</span
                      >
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </template>

            <!-- Payroll Schedule -->
            <template v-if="employee.payroll_details">

              <v-row class="pt-1">
                <v-col cols="12" class="px-5 font weight-bold pt-0 text-left">
                  <h2 class="body-1 font-weight-bold blue-grey--text">
                    Payroll Schedule
                  </h2>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <div class="text-left">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Invoice Date :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.payroll_details.invoice_date
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Payment Due Notification :
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.payroll_details.payment_due_notification
                        }}
                      </span>
                    </v-col>
                  </v-row>
                  <v-row></v-row>
                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Salary Payment Date :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.payroll_details.salary_payment_date | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>
                  </v-row>
                </v-container>
              </div>
            </template>

            <!-- Reporting to -->
            <template v-if="employee.reporting">

              <v-row class="pt-1">
                <v-col cols="12" class="px-5 font weight-bold pt-0 text-left">
                  <h2 class="body-1 font-weight-bold blue-grey--text">
                    Reporting To
                  </h2>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <div class="text-left">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Team :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.reporting.team
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Department :
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.reporting.department
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Manager :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.reporting.manager | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Senior manager :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.reporting.senior_manager | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Type :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.reporting.type | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                  </v-row>
                </v-container>
              </div>
            </template>

            <!-- leaves -->
            <template v-if="employee.leaves">

              <v-row class="pt-1">
                <v-col cols="12" class="px-5 font weight-bold pt-0 text-left">
                  <h2 class="body-1 font-weight-bold blue-grey--text">
                    Leaves
                  </h2>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <div class="text-left">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Annual Leaves :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.leaves.annual_leaves
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span
                        class="mb-0 body-2 blue-grey--text font-weight-light"
                      >
                        Medical leaves :
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.leaves.medical_leaves
                        }}
                      </span>
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Emergency Leaves :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.leaves.emergency_leaves | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Leave taken :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.leaves.leave_taken | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Leave balance :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.leaves.leave_balance | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-light"
                      >Leave encashment :</span
                      >
                    </v-col>
                    <v-col cols="12" md="3" class="pb-0">
                      <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                        {{
                          employee.leaves.leave_encashment | hyphenate_empty_string
                        }}
                      </span>
                    </v-col>

                  </v-row>
                </v-container>
              </div>
            </template>

          </v-tab-item>
          <v-tab-item id="documents">
            <Documents :employeeDetails="[employee]" />
          </v-tab-item>

          <!-- Emergency Contact -->
          <v-tab-item id="emergencyContact">
            <v-row class="pt-5">
              <v-col
                cols="12"
                sm="6"
                class="px-5 font weight-bold pt-0 text-left"
              >
                <h2 class="body-1 font-weight-bold blue-grey--text">
                  Emergency Contact Information
                </h2>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <div class="text-left">
              <v-container>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Contact Full Name :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.emergency.name | hyphenate_empty_string }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Relationship :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{
                        employee.emergency.relationship | hyphenate_empty_string
                      }}
                    </span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Email :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.emergency.email | hyphenate_empty_string }}
                    </span>
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Mobile No. :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.emergency.phone | hyphenate_empty_string }}
                    </span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-light"
                    >Address :</span
                    >
                  </v-col>
                  <v-col cols="12" md="3" class="pb-0">
                    <span class="mb-0 body-2 blue-grey--text font-weight-bold">
                      {{ employee.emergency.address | hyphenate_empty_string }}
                    </span>
                  </v-col>
                </v-row>
              </v-container>
            </div>
          </v-tab-item>

          <!-- <v-tab-item id="history"></v-tab-item> -->
        </v-tabs-items>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Documents from '../Visa/ProcessDetails/Documents.vue'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'

export default {
  data() {
    return {
      currentTab: 0,
      employee: null,
      loading: false
    }
  },
  components: {
    Documents,
    customerDefaultIcon
  },
  props: {
    employeeId: null
  },

  methods: {
    async getEmployeeDetails() {
      this.loading = true
      const AuthStr = 'Bearer '.concat(this.$store.state.token)

      try {

        const response = await this.$axios.$post(
          `/users/employee/details/${this.employeeId}`,
          {},  // Empty object for POST body
          { headers: { Authorization: AuthStr } }
        )


        this.employee = response[0]


        try {
          const onBoardingDetails = await this.$axios.$get(
            `/users/${this.employeeId}`,
            { headers: { Authorization: AuthStr } }
          )

          if (onBoardingDetails && onBoardingDetails.onboardingDetails) {
            this.employee.onBoardingDetails = onBoardingDetails.onboardingDetails
          } else {
            console.warn('onboardingDetails not found in response')
            this.employee.onBoardingDetails = {}
          }
        } catch (error) {
          console.error('Error fetching onboarding details:', error)
          this.employee.onBoardingDetails = {}
        }
        return this.employee
      } catch (error) {
        console.error('Error fetching employee details:', error)

        throw error
      } finally {
        this.loading = false
      }
    },

    closeDrawer() {
      this.$emit('onCloseDrawer')
    }
  },

  mounted() {
    if (this.employeeId) this.getEmployeeDetails()
  }
}
</script>
