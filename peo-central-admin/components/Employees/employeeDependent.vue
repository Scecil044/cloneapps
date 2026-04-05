<template>
    <div style="width: 100%">
      <v-row class="pt-2">
        <v-col cols="12" sm="12" class="text-right pt-0 d-flex justify-end align-center">
          <v-btn elevation="0" max-width="35" @click="addDependentDialog = true" min-width="35"  class="white--text border-radius-medium mr-3">
            <v-img src="/directory/add_plus.svg"  max-width="35" height="auto" class=" cursor-pointer" contain></v-img> 
          </v-btn>
          <v-btn elevation="0" width="150px" color="#0064D7" v-if="dependentEdit" @click="updateDependentDetails()" class="white--text border-radius-medium">Update</v-btn>
          <v-btn elevation="'0" width="150px" class="border-radius-medium" v-if="dependentEdit" @click="dependentEdit = !dependentEdit">Cancel</v-btn>
          <v-btn color="#5C7EEF" v-else class="rounded-xl" small outlined @click="dependentEdit = true,onEditClick('dependentEdit')">
            <v-img src="/profile/edit.svg" max-width="fit-content" height="fit-content" class="mr-2" contain></v-img>
            Edit
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="row1">
        <v-col cols="12" class="pt-6 pb-0" v-if="!dependentEdit">
          <v-data-table id="coa_table" class="main__table elevation-0 document_table" :headers="employee_dependents_headers" :items="employee_dependents_data" :footer-props="{ 'items-per-page-options': [10, 20] }" hide-default-footer>
          <template v-slot:item="{ item }">
            <tr>
              <td class="" >
                <span class="sub_text">
                  {{ item.title }}
                </span>
            </td>
              <td class="">
                <span class="">
                  {{ item.relation }}
                </span>
              </td>
            </tr>
          </template>
          </v-data-table>
        </v-col>

        <v-col cols="12" class="pt-6 pb-0" v-else>
          <v-col cols="12">
            <v-simple-table dense class="dynamic_table">
              <template v-slot:default>
                <thead class="dynamic_table_thead">
                  <tr class="" style="height: 35px !important">
                    <th v-for="item in table_headers" :key="item" class="text-center text--text font-weight-bold" style="font-size: 12px !important;font-weight: 500 !important;">{{ item }}</th>
                  </tr>
                </thead>
                <tbody class="dynamic_table_tbody" v-for="(item, index) in employeeDetails[0].dependent_details" :key="index">
                  <tr class="dynamic_table_body_rows" style="border-bottom: 0.5 solid red !important">
                    <td class="py-2 text-center">
                      <v-text-field class="rounded-lg" placeholder="Enter Name" solo flat hide-details dense v-model="item.dependent_name" />
                    </td>
                    <td class="py-2 text-center">
                      <v-text-field class="rounded-lg" placeholder="Enter Relation" solo flat hide-details dense v-model="item.relation" />
                    </td>
                    <td class="py-2 text-center">
                      <v-btn :disabled="employeeDetails[0].dependent_details.length == 1" icon color="error" class="mx-3 text-center" @click="updateHandleDeleteProduct(index)">
                        <v-icon class="" color="error" x-small>fa-light fa-trash-can</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
          <v-col cols="12">
            <div class="d-flex justify-space-between align-start">
              <v-btn @click="updateHandleAddProduct()" class="small__btn" outlined color="subtext">
                <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
                <span class="text--text">Add Dependents</span>
              </v-btn>
            </div>
          </v-col>
        </v-col>
      </v-row>



      <!--Add Dependent-->
      <v-dialog v-model="addDependentDialog" max-width="750" >
        <v-card style="overflow-x : hidden;">
          <v-card-title class="px-6">
            <v-row>
              <v-col class="py-0">Add Dependents</v-col>
              <v-spacer></v-spacer>
              <v-btn class="tall__btn mr-2" color="lightgray" outlined @click="addDependentDialog = false">Close</v-btn>
              <v-btn class="tall__btn px-6" color="primary" @click="addNewDependent()">Add</v-btn>
            </v-row>
          </v-card-title>
          <!-- <v-divider></v-divider> -->
          <v-col cols="12">
            <v-form ref="addForm">
              <v-simple-table dense class="dynamic_table">
                <template v-slot:default>
                  <thead class="dynamic_table_thead">
                    <tr class="" style="height: 35px !important">
                      <th v-for="item in table_headers" :key="item" class="text-center text--text font-weight-bold" style="font-size: 12px !important;font-weight: 500 !important;">{{ item }}</th>
                    </tr>
                  </thead>
                  <tbody class="dynamic_table_tbody" v-for="(item, index) in existingUser.dependent_details" :key="index">
                    <tr class="dynamic_table_body_rows" style="border-bottom: 0.5 solid red !important">
                      <td class="py-2 text-center">
                        <v-text-field class="rounded-lg" placeholder="Enter Name" solo flat :rules="main_rule" dense v-model="item.dependent_name" />
                      </td>
                      <td class="py-2 text-center">
                        <v-text-field class="rounded-lg" placeholder="Enter Relation" solo flat :rules="main_rule" dense v-model="item.relation" />
                      </td>
                      <td class="py-2 text-center">
                        <v-btn :disabled="existingUser.dependent_details.length == 1" icon color="error" class="mx-3 text-center" @click="handleDeleteProduct(index)">
                          <v-icon class="" color="error" x-small>fa-light fa-trash-can</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-form>
          </v-col>
          <v-col cols="12">
            <div class="d-flex justify-space-between align-start">
              <v-btn @click="handleAddProduct()" class="small__btn" outlined color="subtext">
                <v-icon x-small color="subtext" class="mr-2">fa-plus</v-icon>
                <span class="text--text">Add Dependents</span>
              </v-btn>
            </div>
          </v-col>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  import '@/assets/scss/utils/_customerDocumentsTable.scss'
  import PdfSvg from '@/assets/images/icons/pdf.svg'
  import DeleteSvg from '@/assets/images/icons/delete-icon.svg'
  import UploadSvg from '@/assets/images/icons/upload-icon.svg'
  import DownloadSvg from '@/assets/images/icons/download-icon.svg'
  import SnackBar from '~/components/utils/SnackBar.vue'
  import DarkArrow from '@/assets/images/icons/Dark-Arrow-icon.svg'
  export default {
    components: {
      SnackBar,
      DarkArrow,
      PdfSvg,
      DeleteSvg,
      UploadSvg,
      DownloadSvg,
    },
    props: { employeeDetails: Array},
    data() {
      return {
        employee_dependents_headers: [
          { text: 'Name', value: 'name', align: 'start', sortable: false },
          { text: 'Relation', value: 'relation', align: 'start', sortable: false  },
        ],
        employee_dependents_data: [],
        table_headers: [
          'Dependent Name',
          'Relation',
          'Actions',
        ],
        dependentEdit:false,
        addDependentDialog:false,
        existingUser:{
          dependent_details: [
            {
              dependent_name: '',
              relation: ''
            },
          ],
        },
      main_rule: [(v) => !!v || 'This filed is required'],
      }
    },
    methods: {
      getDependentDetails(){
        this.employee_dependents_data = []
        if(this.employeeDetails && this.employeeDetails.length > 0 && this.employeeDetails[0].dependent_details.length > 0){
          for (let i = 0; i < this.employeeDetails[0].dependent_details.length; i++) {
            const dependentDetail = this.employeeDetails[0].dependent_details[i];
            const dependent = {
              title: dependentDetail.dependent_name,
              relation: dependentDetail.relation
            };

            this.employee_dependents_data.push(dependent);
          }
        }
      },
      onEditClick(val){
        if(val != 'dependentEdit') this.dependentEdit = false
      },
      handleDeleteProduct(index) {
        this.existingUser.dependent_details.splice(index, 1)
      },
      handleAddProduct() {
        this.existingUser.dependent_details.push({
          dependent_name: '',
          relation: ''
        })
      },
      updateHandleDeleteProduct(index) {
        this.employeeDetails[0].dependent_details.splice(index, 1)
      },
      updateHandleAddProduct() {
        this.employeeDetails[0].dependent_details.push({
          dependent_name: '',
          relation: ''
        })
      },
      async addNewDependent(){
        if(this.$refs.addForm.validate()){
          const AuthStr = 'Bearer '.concat(this.$store.state.token)
      
          for(let i = 0; i < this.existingUser.dependent_details.length; i++){
            const element = this.existingUser.dependent_details[i]
            this.employeeDetails[0].dependent_details.push(element)
          }

          let obj = {
            "dependent_details": this.employeeDetails[0].dependent_details
          }

          await this.$axios.$patch(`/users/${this.employeeDetails[0]._id}`, obj, { headers: { Authorization: AuthStr } })
          .then((response) => {
            this.addDependentDialog = false
            this.$emit('fetchUpdatedDependents', this.employeeDetails[0]._id)
          })
          this.getDependentDetails()
        }
      },
      async updateDependentDetails(){
        const AuthStr = 'Bearer '.concat(this.$store.state.token)

        let obj = {
          "dependent_details": this.employeeDetails[0].dependent_details
        }

        await this.$axios.$patch(`/users/${this.employeeDetails[0]._id}`, obj, { headers: { Authorization: AuthStr } })
        .then((response) => {
          this.dependentEdit = false
          this.$emit('fetchUpdatedDependents', this.employeeDetails[0]._id)
        })
        this.getDependentDetails()
      }
    },
    mounted() {
      // console.log(this.employeeDetails, '---------employeeDetails Dependent props')

      this.getDependentDetails();
    },
  }
  </script>
  