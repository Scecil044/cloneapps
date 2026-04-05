<template>
    <v-card color="px-5 pb-5" flat>

    <v-data-table :headers="headers" :items="ClaimSubTypes" class="elevation-1">

      <template v-slot:[`item.view`]="{ item }">
        <v-icon small color="grey" class="mr-2" @click="editClaimType(item), getCategories(editedItem.access),viewOnlyEditedItems=true;">
          mdi-eye
        </v-icon>
      </template>

      <template v-slot:[`item.edit`]="{ item }">
        <v-icon small color="grey" class="mr-2" @click="editClaimType(item), getCategories(editedItem.access)">
          mdi-pencil
        </v-icon>
      </template>

      <template v-slot:[`item.delete`]="{ item }">
        <v-icon small color="red" class="mr-2" @click="deleteClaimType(item)">
          mdi-delete
        </v-icon>
      </template>

      <template v-slot:[`item.payroll`]="{ item }">
        <v-chip :color="getColorPayroll(item.payroll)" dark>
          <div v-if="item.payroll">
            Through Payroll
          </div> 
          <div v-else>
            Outside Payroll
          </div>
        </v-chip>
      </template>

      <template v-slot:[`item.payroll_auto_approved`]="{ item }">
        <v-chip :color="getColorPayroll(item.payroll_auto_approved)" dark>
          <div v-if="item.payroll_auto_approved">
            Auto Approved
          </div> 
          <div v-else>
            Manually Approved
          </div>
        </v-chip>
      </template>

      <template v-slot:[`item.category`]="{ item }">
        {{ getListCategories(item.category) || "---" }}
      </template>
      
      <template v-slot:top>
        <h3 class="px-5 pt-5">Setup Claim Types for the Company</h3>
        <p class="px-5 mb-0 caption grey--text">
          You can add Claim types.
        </p>
        <v-divider></v-divider>
        <v-toolbar flat>
          <v-toolbar-title>Claim Types</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog scrollable v-model="dialog_create" width="1000">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on" @click="addClaimKeyHint">
                New Claim Type
              </v-btn>
            </template>
            <v-card width="1000">
              <v-row>
                <v-toolbar class="text-h6" color="grey darken-3" dark>
                  <v-col cols="12" sm="6" lg="6" md="6">
                    New Claim Type
                  </v-col>
                  <v-col cols="12" sm="6" lg="6" md="6">
                    <div style="float: right">
                      <v-tooltip top color="blue-grey darken-3">
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn elevation="0" small fab @click.prevent="closeCreateDialog()"
                            class="blue-grey darken-3 white--text ml-2" v-bind="attrs" v-on="on"
                            :disabled="create_claim_progress">
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                        </template>
                        Close
                      </v-tooltip>
                    </div>
                  </v-col>
                </v-toolbar>
                <v-progress-linear :active="create_claim_progress" :indeterminate="create_claim_progress" top color="deep-purple accent-4"></v-progress-linear>
              </v-row>
              <v-card-text>
                <v-form ref="createForm">
                  <v-row>
                    <v-col cols="12">
                      <div class="d-flex flex-row align-center">
                        <h3 style="width: max-content;"> Add New Claim Type</h3>
                        <v-btn @click="showAddClaimTypeDialog=true" width="33" height="33" fab color="blue" class="ml-3"
                          large outlined :disabled="create_claim_progress">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </div>
                    </v-col>

                    <v-col lg="6" md="6" sm="12">
                      <v-autocomplete :items="claimTypes" item-text="name" item-value="_id" dense
                        v-model.trim="claim_type" :disabled="create_claim_progress" label="Claim Type" :rules="genericRule" outlined></v-autocomplete>
                    </v-col>

                    <v-col lg="6" md="6" sm="12">
                      <v-text-field label="Claim Sub Type" v-model.trim="claim_sub_type"
                        :rules="[checkDuplicateSubTypes]" :disabled="create_claim_progress" dense outlined></v-text-field>
                    </v-col>

                    <v-col lg="6" md="6" sm="12">
                      <v-select :items="eligibilityList" @change="getCategories(access)" item-text="name"
                        item-value="_id" dense v-model="access"  :disabled="create_claim_progress" label="Access" :rules="genericRule" outlined></v-select>
                    </v-col>

                    <v-col lg="6" md="6" sm="12">
                      <v-select v-if="access!=='All'" :items="categoryList" multiple dense v-model="category"
                        label="Category" :rules="genericRule" outlined :disabled="create_claim_progress"></v-select>
                    </v-col>

                    <v-col lg="6" md="6" sm="12">
                      <v-text-field label="Reference Number Prefix" v-model="ref_prefix" :disabled="create_claim_progress" dense outlined></v-text-field>
                    </v-col>

                    <v-col lg="6" md="6" sm="12">
                      <div class="pt-2" v-if="ref_prefix != ''">Eg: {{referenceNumber}}</div>
                    </v-col>

                    <v-col lg="6" md="6" sm="12">
                      <v-checkbox v-model="payroll" :disabled="create_claim_progress" label="Process through Payroll"></v-checkbox>
                    </v-col>

                    <v-col lg="6" md="6" sm="12" class="text-right">
                      <v-checkbox v-if="payroll" :disabled="create_claim_progress" v-model="payroll_auto_approved" label="Payroll Auto Approved">
                      </v-checkbox>
                    </v-col>

                    <!-- Claim Key Hints -->
                    <v-col lg="6" md="6" sm="12">
                      <h3>Add Claim Key Hints</h3>
                    </v-col>
                    <v-col cols="12" lg="6" md="6" sm="12" class="text-right">
                      <v-btn @click="addClaimKeyHint"  :disabled="create_claim_progress" width="33" height="33" style="float: right;" fab color="blue"
                        class="ml-3" large outlined>
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </v-col>
                    <v-row class="py-0 pt-0" v-if="defaultKeyHints?.length > 0" style="width: 100%;">
                      <v-chip class="ma-2" v-for="(key , i) in defaultKeyHints" :key="i" @click="addClaimKeyHint(key)">
                        {{key.name}}
                      </v-chip>
                    </v-row>
                    <v-row class="py-0 pt-0" v-if="selectedClaimKeys?.length > 0" style="width: 100%;">
                      <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
                        <p class="p-0 mt-5">Claim Key</p>
                      </v-col>
                      <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-2">
                        <p class="p-0 mt-5">Input type</p>
                      </v-col>
                      <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
                        <p class="p-0 mt-5">Selector Values</p>
                      </v-col>
                      <v-col row cols="12" sm="2" md="2" lg="2" class="pa-0 pl-2">
                        <p class="p-0 mt-5">Required</p>
                      </v-col>
                      <v-col row cols="12" sm="1" md="1" lg="1" class="pa-0 pl-2">
                        <p class="p-0 mt-5">Delete</p>
                      </v-col>
                    </v-row>
                    <hr style="color: #1976d2" />
                    <v-row cols="12" class="py-0 pt-5" v-for="(claimKey , index) in selectedClaimKeys" :key="index"
                      style="width: 100%;">
                      <!-- Claim key name -->
                      <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
                        <v-text-field label="Claim Key Hint" :rules="genericRule" dense outlined
                          v-model.trim="claimKey.name" :disabled="create_claim_progress">
                        </v-text-field>
                      </v-col>
                      <!-- Claim key type select -->
                      <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-2">
                        <v-select :items="array_types" :rules="genericRule" small-chips dense outlined item-value="_id"
                          label="Value Type" v-model="claimKey.type" class="pl-1" :disabled="create_claim_progress">
                        </v-select>
                        <v-checkbox v-if="claimKey.type == 'Number Field'" v-model="claimKey.isCalculationNeeded"
                          :disabled="create_claim_progress"> <template v-slot:label>
                            <div>Need Calculation</div>
                          </template></v-checkbox>
                        <v-text-field v-if="claimKey.isCalculationNeeded" label="Expression" dense outlined
                          :rules="expressionRule" v-model.trim="claimKey.expression" :disabled="create_claim_progress"
                          hint="Enter the expression to calculate the amount based on the user's input (x), e.g: x * 90.">
                        </v-text-field>
                      </v-col>
                      <!-- if selected a dropdown ask for a key -->
                      <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
                        <v-textarea v-if="claimKey.type == 'Select'" :rules="genericRule"
                          hint="Add your values separated by a comma." outlined dense rows="1" auto-grow class="py-0"
                          label="Selector values" v-model.trim="claimKey.selector_values" :disabled="create_claim_progress">
                        </v-textarea>
                      </v-col>
                      <!-- Claim key Mandatory button -->
                      <v-col row cols="12" sm="2" md="2" lg="2" class="pa-0 pl-2">
                        <v-checkbox v-model="claimKey.required" :disabled="create_claim_progress"></v-checkbox>
                      </v-col>
                      <!-- Claim key delete button -->
                      <v-col row cols="12" sm="1" md="1" lg="1" class="pa-0 pl-2">
                        <v-icon medium color="red" @click="removeCliamKey(index)"
                          :disabled="selectedClaimKeys?.length===1 || create_claim_progress">mdi-delete</v-icon>
                      </v-col>
                    </v-row>


                    <v-row class="positionSticky">
                      <v-col cols="12" class="text-right">
                        <v-btn depressed elevation="2" :disabled="create_claim_progress" color="blue" dark
                          @click.prevent="addClaimType">ADD CLAIM</v-btn>
                      </v-col>
                    </v-row>

                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
    </v-data-table>
      <!-- Add New claim Type Dialog -->
      <v-dialog scrollable v-model="showAddClaimTypeDialog" width="500">
        <v-card width="500">
          <v-row>
            <v-toolbar class="text-h6" color="grey darken-3" dark>
              <v-col cols="12" sm="6" lg="6" md="6">
                 Add Claim Type
              </v-col>
              <v-col cols="12" sm="6" lg="6" md="6">
                <div style="float: right">
                  <v-tooltip top color="blue-grey darken-3">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn elevation="0" small fab @click.prevent="showAddClaimTypeDialog=false" class="blue-grey darken-3 white--text ml-2"
                        v-bind="attrs"
                        v-on="on"
                        ><v-icon>mdi-close</v-icon></v-btn
                      >
                    </template>
                    Close
                  </v-tooltip>
                </div>
              </v-col>
            </v-toolbar>
          </v-row>
          <v-progress-linear :active="isNewClaimTypeSaving" :indeterminate="isNewClaimTypeSaving" top color="deep-purple accent-4"></v-progress-linear>
          <v-card-text>
            <v-form ref="addClaimTypeForm">
            <v-row>
              <v-col lg="12" md="12" sm="12">
                <v-text-field label="Claim Type" v-model.trim="newClaimType" :rules="[checkDuplicateClaimTypeRule]" :disabled="isNewClaimTypeSaving" dense outlined></v-text-field>
              </v-col> 
              <v-col lg="8" md="8" sm="12" class="text-right">
                <v-row style="float: right;">
                  <v-btn class="ma-2" depressed elevation="2" color="grey" dark @click.prevent="showAddClaimTypeDialog = false;" :disabled="isNewClaimTypeSaving">CANCEL</v-btn>
                  <v-btn class="ma-2" depressed elevation="2" color="blue" dark @click.prevent="addNewClaimType" :disabled="isNewClaimTypeSaving">ADD</v-btn>
                </v-row>
              </v-col>
            </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog> 
  <!-- Delete dialog -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Are you sure you want to delete?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialogDelete = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="deleteClaimTypeConfirm">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog> 
  <!-- Edit dialog  -->
    <v-dialog scrollable v-model="dialogEdit" width="1000">
      <v-card width="1000">
        <v-row>
          <v-toolbar class="text-h6" color="grey darken-3" dark>
            <v-col cols="12" sm="6" lg="6" md="6">
              {{viewOnlyEditedItems ? 'View' : 'Edit'}} Claim Type
            </v-col>
            <v-col cols="12" sm="6" lg="6" md="6">
              <div style="float: right">
                <v-tooltip top color="blue-grey darken-3">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn elevation="0" small fab @click.prevent="closeEditDialog" class="blue-grey darken-3 white--text ml-2"
                      v-bind="attrs"
                      v-on="on" :disabled="edit_claim_progress"
                      ><v-icon>mdi-close</v-icon></v-btn
                    >
                  </template>
                  Close
                </v-tooltip>
              </div>
            </v-col>
          </v-toolbar>
          <v-progress-linear :active="edit_claim_progress" :indeterminate="edit_claim_progress" top color="deep-purple accent-4"></v-progress-linear>
        </v-row>
        <v-card-text>
          <v-form ref="editForm">
          <v-row>
            <v-col cols="12" v-if="!viewOnlyEditedItems">
              <div class="d-flex flex-row align-center">
                <h3 style="width: max-content;"> Add New Claim Type</h3>
                <v-btn @click="showAddClaimTypeDialog=true;newClaimType=''" width="33" height="33" fab color="blue"
                  class="ml-3" large outlined :disabled="edit_claim_progress">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </v-col>
            <v-col lg="6" md="6" sm="12">
              <v-autocomplete :items="claimTypes" item-text="name" item-value="_id" dense v-model.trim="editedItem.claimType" :disabled="viewOnlyEditedItems || edit_claim_progress" label="Claim Type" :rules="genericRule" outlined></v-autocomplete>                      
            </v-col>

            <v-col lg="6" md="6" sm="12">
              <v-text-field label="Claim Sub Type" v-model.trim="editedItem.claimSubType" :rules="[checkDuplicateSubTypes]" :disabled="viewOnlyEditedItems || edit_claim_progress" dense outlined></v-text-field>
            </v-col>

            <v-col lg="6" md="6" sm="12">
              <v-select  :items="eligibilityList" @change="getCategories(editedItem.access)" item-text="name" item-value="_id" :disabled="viewOnlyEditedItems || edit_claim_progress" dense v-model="editedItem.access" label="Access" :rules="genericRule" outlined></v-select>                      
            </v-col>

            <v-col lg="6" md="6" sm="12">
              <v-select v-if="editedItem.access!=='All'"  :items="categoryList" multiple dense v-model="editedItem.category" label="Category" :rules="genericRule" :disabled="viewOnlyEditedItems || edit_claim_progress" outlined></v-select>
            </v-col>

            <v-col lg="6" md="6" sm="12">
              <v-text-field label="Reference Number Prefix" :disabled="viewOnlyEditedItems || edit_claim_progress" v-model="editedItem.ref_prefix" dense outlined></v-text-field>
            </v-col>

            <v-col lg="6" md="6" sm="12">
              <div class="pt-2" v-if="editedItem.ref_prefix != ''">Eg: {{referenceNumber}}</div>
            </v-col>

            <v-col lg="6" md="6" sm="12">
              <v-checkbox v-model="editedItem.payroll" label="Process through Payroll" :disabled="viewOnlyEditedItems || edit_claim_progress"></v-checkbox>
            </v-col>

            <v-col lg="6" md="6" sm="12" class="text-right">
              <v-checkbox v-if="editedItem.payroll" v-model="editedItem.payroll_auto_approved" label="Payroll Auto Approved" :disabled="viewOnlyEditedItems || edit_claim_progress"></v-checkbox>
            </v-col>

         <!-- Claim Key Hints -->
         <v-col lg="6" md="6" sm="12" v-if="!viewOnlyEditedItems">
           <h3>Add Claim Key Hints</h3>
         </v-col>
         <v-col cols="12" lg="6" md="6" sm="12" class="text-right"  v-if="!viewOnlyEditedItems">
           <v-btn @click="addClaimKeyHint" width="33" height="33" style="float: right;" fab color="blue" class="ml-3"
             large outlined :disabled="edit_claim_progress">
             <v-icon>mdi-plus</v-icon>
           </v-btn>
         </v-col>
         <v-row class="py-0 pt-0" v-if="defaultKeyHints?.length > 0" style="width: 100%;">
           <v-chip class="ma-2" v-for="(key , i) in defaultKeyHints" :key="i" @click="addClaimKeyHint(key)">
             {{key.name}}
           </v-chip>
         </v-row>
         <v-row class="py-0 pt-0" v-if="selectedClaimKeys.length > 0" style="width: 100%;">
           <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
             <p class="p-0 mt-5">Claim Key</p>
           </v-col>
           <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-2">
             <p class="p-0 mt-5">Input type</p>
           </v-col>
           <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-2">
             <p class="p-0 mt-5">Selector Values</p>
           </v-col>
           <v-col row cols="12" sm="2" md="2" lg="2" class="pa-0 pl-2">
             <p class="p-0 mt-5">Required</p>
           </v-col>
           <v-col row cols="12" sm="1" md="1" lg="1" class="pa-0 pl-2">
             <p class="p-0 mt-5">Delete</p>
           </v-col>
         </v-row>
         <hr style="color: #1976d2" />
         <v-row cols="12" class="py-0 pt-5" v-for="(claimKey , index) in selectedClaimKeys" :key="index"
           style="width: 100%;">
           <!-- Claim key name -->
           <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
             <v-text-field label="Claim Key Hint" :rules="genericRule" dense outlined v-model.trim="claimKey.name" :disabled="viewOnlyEditedItems || edit_claim_progress">
             </v-text-field>
           </v-col>
          <!-- Claim key type select -->
          <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-2">
            <v-select :items="array_types" :rules="genericRule" small-chips dense outlined item-value="_id" label="Value Type"
              v-model="claimKey.type" class="pl-1" :disabled="viewOnlyEditedItems || edit_claim_progress"></v-select>
            <v-checkbox v-if="claimKey.type == 'Number Field'" v-model="claimKey.isCalculationNeeded"
              :disabled="viewOnlyEditedItems || edit_claim_progress"> <template v-slot:label>
                <div>Need Calculation</div>
              </template></v-checkbox>
            <v-text-field v-if="claimKey.isCalculationNeeded" label="Expression" dense outlined
              :rules="expressionRule" v-model.trim="claimKey.expression" :disabled="viewOnlyEditedItems || edit_claim_progress"
              hint="Type expression here with 'X' as the number.">
            </v-text-field>
          </v-col>
           <!-- if selected a dropdown ask for a key -->
           <v-col row cols="12" sm="3" md="3" lg="3" class="pa-0 pl-3">
             <v-textarea v-if="claimKey.type == 'Select'" :rules="genericRule" hint="Add your values separated by a comma." outlined dense
               rows="1" auto-grow class="py-0" label="Selector values" v-model.trim="claimKey.selector_values" :disabled="viewOnlyEditedItems || edit_claim_progress"></v-textarea>
           </v-col>
           <!-- Claim key Mandatory button -->
           <v-col row cols="12" sm="2" md="2" lg="2" class="pa-0 pl-2">
             <v-checkbox v-model="claimKey.required" :disabled="viewOnlyEditedItems || edit_claim_progress"></v-checkbox>
           </v-col>

           <!-- Claim key delete button -->
           <v-col row cols="12" sm="1" md="1" lg="1" class="pa-0 pl-2">
             <v-icon medium color="red" @click="removeCliamKey(index)" :disabled="selectedClaimKeys?.length===1 || viewOnlyEditedItems || edit_claim_progress">mdi-delete</v-icon>
           </v-col>
         </v-row>

        <v-row class="positionSticky" style="float: right;">
          <v-col cols="12" class="text-right">
            <v-btn class="ma-2" depressed elevation="2" :disabled="edit_claim_progress" color="grey" dark
              @click.prevent="closeEditDialog">CANCEL</v-btn>
            <v-btn class="ma-2" depressed elevation="2" :disabled="edit_claim_progress || viewOnlyEditedItems"
              color="blue" dark @click.prevent="editClaimTypeConfirm">EDIT CLAIM</v-btn>
          </v-col>
        </v-row>
          </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>     
    <!-- Snack -->
    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
     {{ snackText }}
     <template v-slot:action="{ attrs }">
       <v-btn v-bind="attrs" text @click="snack = false" small>
         <v-icon>mdi-close</v-icon>
       </v-btn>
     </template>
    </v-snackbar>      
  </v-card>
</template>
<script>
export default {
  // props: ['configuration'],
  data() {
    return {
      configuration: [],
      edit_claim_progress: false,
      create_claim_progress: false,
      dialog_create: false, 
      claim_type: "",
      access: "",
      eligibilityList: [],
      category: "",
      claim_sub_type: "",
      payroll: false,
      payroll_auto_approved: false,
      dialogDelete: false,
      dialogEdit: false,
      ref_prefix: "",
      categoryList: [],
      editedItem: {},
      editedItemFromDb: {},
      claimTypes: [],
      ClaimSubTypes: [],
      headers: [
        {
          text: 'Claim Type',
          align: 'start',
          sortable: false,
          value: 'claimType',
        },
        { text: 'Claim Sub Type', value: 'claimSubType' },
        { text: 'Access', value: 'access' },
        { text: 'Category', value: 'category' },
        { text: 'Prefix', value: 'ref_prefix' },
        { text: 'Process Type', value: 'payroll' },
        { text: 'Payroll Approval', value: 'payroll_auto_approved' },
        { text: "View", value: "view", sortable: false },
        { text: "Edit", value: "edit", sortable: false },
        { text: "Delete", value: "delete", sortable: false },
      ],
    selectedClaimKeys:[],
    array_types: ['Select', 'Date Picker', 'Text Field','Number Field', 'Textarea', 'Attachments'],
    viewOnlyEditedItems: false,
    genericRule: [
      v => !!v || 'This field is Required'
    ],
    expressionRule: [
      (v) => !!v || 'This field is Required',
      (v) => (/^[-+*/()\s\d.xX]*$/.test(v) && /(?:(?:^|[-+_*/])(?:\s*-?\d+(\.\d+)?(?:[eE][+-]?\d+)?\s*))+$/.test(v)) || "Enter a valid mathematical expression using 'x'. For example, use: x * (10 + 5) / 2",
    ],
    snack: false,
    snackText: "",
    snackColor: "",
    newClaimType: "",
    showAddClaimTypeDialog: false,
    isNewClaimTypeSaving: false,
    defaultKeyHints: [{
      name: 'Amount',
      field: 'Number Field'
    }, {
      name: 'Receipts',
      field: 'Attachments'
    }, {
      name: 'Claim Description',
      field: 'Textarea'
    }]
  }
},
  mounted() {
    this.configuration = this.$store.getters.getConf
    this.ClaimSubTypes = this.configuration[0].ClaimSubTypes;
    this.claimTypes = this.configuration[0].claim_types;
    this.eligibilityList = this.configuration[0].eligibility;
  },
watch: {
    dialog_create(val) {
      if (val && this.$refs.createForm) {
        this.$refs.createForm.reset();
      }
    }
},
  methods: {
    async getCategories(eligibility) {
      this.categoryList = [];
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      let body = {
        company_id: this.$store.getters.getUserInfo.company_id
      }
      let categories = await this.$axios.$post("/leaves/category/" + eligibility, body, { headers: { Authorization: AuthStr } });

      if (categories && categories.length > 0) {
        this.categoryList = categories;
        if (eligibility === "Department") {

          this.categoryList = categories[0].departments;

        } else if (eligibility === "Company name") {

          this.companies = categories;

          let array = [];
          categories.forEach((element) => {
            array.push(element.company_name);
          });
          this.categoryList = array;

        } else if (eligibility === "Teams") {

          let array = [];
          categories[0].teams.forEach((element, index) => {
            if (element.length > 0) {
              element.forEach((ele2) => {
                if (ele2 != "") {
                  array.push(ele2);
                }
              });
            }
          });
          _.uniq(array);
          this.categoryList = array;

        } else if (eligibility === "Employee type") {

          this.categoryList = categories;
          
        } else if (eligibility === "Cost center") {

          this.categoryList = categories[0].costCenters;

        } else if (eligibility === "Gender") {

          this.categoryList = categories;

        } else if (eligibility === "Religion") {

          this.categoryList = categories[0].religions;

        } else if (eligibility === "Designation") {

          this.categoryList = categories[0].designations;

        }
      } else {
        this.categoryList = [];
      }
    },
    addClaimType() {
    if (this.$refs.createForm?.validate()) {
      const token = this.$store.getters.getToken;
      const AuthStr = 'Bearer '.concat(token);

      this.create_claim_progress = true;
      let configure = this.configuration[0]
      this.payroll == false ? this.payroll_auto_approved = false : this.payroll_auto_approved

      // Check for claim keys
      if (this.selectedClaimKeys) {
        this.selectedClaimKeys = this.selectedClaimKeys.filter(el => el.name?.length && el.type?.length && (el.type !== 'Select' ||
          (el.type === 'Select' && el.selector_values?.length)));
      }
    if (this.selectedClaimKeys?.length) {
      configure.ClaimSubTypes.push({
        claimType: this.claim_type,
        claimSubType: this.claim_sub_type,
        payroll: this.payroll,
        payroll_auto_approved: this.payroll_auto_approved,
        ref_prefix: this.ref_prefix,
        access: this.access,
        category: this.category,
        claim_keys: this.selectedClaimKeys,
        id: this.getUid()
      })
      _.uniq(configure.ClaimSubTypes)

      let arr = []
      arr.push(configure)

      this.$axios.$put('/configuration/update/'+ this.configuration[0]._id, arr, {headers: { Authorization: AuthStr }})
      .then(async(res) => {
          let configData = await this.$axios.$get("/configuration/all", {headers: { Authorization: AuthStr }})
          if (configData) {
            this.configuration = configData;
            this.dialog_create = false
            this.create_claim_progress = false
            this.ClaimSubTypes = configData[0].ClaimSubTypes;
            this.claim_type = ''
            this.claim_sub_type = ""
            this.payroll = false
            this.payroll_auto_approved = false
            this.ref_prefix = ""
            this.selectedClaimKeys = [],
            this.access = ""
            this.category = ""
            this.snack = true;
            this.snackText = 'Claim Sub Type added successfully!';
            this.snackColor = 'green';
            this.$refs.createForm.reset();
          }
        })
        .catch((e) => {
          console.log(e);
          this.create_claim_progress = false
          this.snack = true
          this.snackText = 'Error while creating Claim Sub Type!'
          this.snackColor = 'red'
        });
    } else {
      this.snack = true
      this.snackText = 'Please add Claim Keys!'
      this.snackColor = 'red'
    }
    } else {
      this.snack = true
      this.snackText = 'Please enter all Required Fields!'
      this.snackColor = 'red'
    }
  },
    editClaimType(item) {
      this.editedItemFromDb = JSON.parse(JSON.stringify(item));
      this.editedIndex = this.ClaimSubTypes.indexOf(item)
      this.editedItem = Object.assign({}, item);
      this.dialogEdit = true
      this.ref_prefix = this.editedItem.ref_prefix;
      this.selectedClaimKeys = this.editedItem.claim_keys ? this.editedItem.claim_keys : [];
      if(this.selectedClaimKeys.length===0){
        this.addClaimKeyHint();
      }
  },
  editClaimTypeConfirm() {
    if (JSON.stringify(this.editedItemFromDb) === JSON.stringify(this.editedItem) && this.selectedClaimKeys?.length === this.editedItemFromDb.claim_keys?.length) {
      this.dialogEdit = false
      this.editedIndex = -1
      this.ref_prefix = ""
      this.selectedClaimKeys = [];
      return;
    }
    if (this.$refs.editForm?.validate()) {
      this.editedItem.payroll == false ? this.editedItem.payroll_auto_approved = false : this.editedItem.payroll_auto_approved
      const token =  this.$store.getters.getToken
      const AuthStr = 'Bearer '.concat(token);
      this.edit_claim_progress = true

      Object.assign(this.ClaimSubTypes[this.editedIndex], this.editedItem)
      let configure = this.configuration[0]
      configure.ClaimSubTypes = this.ClaimSubTypes

      let arr = []
      arr.push(configure)

      this.$axios.$put('/configuration/update/'+ this.configuration[0]._id, arr, {headers: { Authorization: AuthStr }})
      .then(async(res) => {
        let configData = await this.$axios.$get("/configuration/all", {headers: { Authorization: AuthStr }})
        if (configData) {
            this.configuration = configData;
            this.ClaimSubTypes = configData[0].ClaimSubTypes;
            this.dialogEdit = false
            this.editedIndex = -1
            this.ref_prefix = ""
            this.selectedClaimKeys = [];
            this.edit_claim_progress = false;
            this.snack = true
            this.snackText = 'Claim Sub Type updated successfully!'
            this.snackColor = 'green'
          }
        })
        .catch((e) => {
          console.log(e);
          this.edit_claim_progress = false;
          this.snack = true
          this.snackText = 'Error while updating Claim Type!'
          this.snackColor = 'red'
        });
    } else {
      this.snack = true
      this.snackText = 'Please enter all Required Fields!'
      this.snackColor = 'red'
    }
  },
  deleteClaimType(item) {
    this.editedIndex = this.ClaimSubTypes.indexOf(item)
    this.dialogDelete = true
  },
  deleteClaimTypeConfirm() {
    const token = this.$store.getters.getToken;
    const AuthStr = 'Bearer '.concat(token);
    this.ClaimSubTypes.splice(this.editedIndex, 1)
    let configure = this.configuration[0]
    configure.ClaimSubTypes = this.ClaimSubTypes

    let arr = []
    arr.push(configure)

      this.$axios.$put('/configuration/update/'+ this.configuration[0]._id, arr, {headers: { Authorization: AuthStr }})
      .then(async(res) => {
        let configData = await this.$axios.$get("/configuration/all", {headers: { Authorization: AuthStr }})
        if (configData) {
            this.ClaimSubTypes = configData[0].ClaimSubTypes;
            this.editedIndex = -1;
            this.snack = true;
            this.snackColor = "green";
            this.snackText = "Claim type deleted successfully";
            this.dialogDelete = false
          }
        })
        .catch(e => {
          console.log(err);
          this.snack = true
          this.snackText = 'Error while adding Claim type!'
          this.snackColor = 'red';
          this.dialogDelete = false
        });
  },
    getColorPayroll (item) {
      if (item) {
        return "green"
      } else {
        return "red"
      }      
    },
    getListCategories(category) {
      let categories = ''
      if (category && category.length) {
        category.forEach((element, index) => {
          if (category.length != 1 && index + 1 == category.length) {
            categories += 'and ' + element;
          } else if (index + 1 == category.length - 1) {
            categories += element + ' ';
          } else if (category.length == 1) {
            categories += element
          } else {
            categories += element + ', ';
          }
        });
      }

      return categories
  },
  addClaimKeyHint(key) {
    key = key || {};
    this.selectedClaimKeys.push({
      name: key.name?.length ? key.name : '',
      type: key.field?.length ? key.field: '',
      selector_values: key.selector_values?.length ? key.selector_values: ''
    })
  },
  removeCliamKey(index) {
    if (this.selectedClaimKeys.length) {
      this.selectedClaimKeys.splice(index, 1)
    }
  },
  checkDuplicateSubTypes() {
    if (this.ClaimSubTypes.length) {
      if (this.editedItem && this.editedItem.claimType && this.editedItem.claimSubType) {
        if (this.editedItem.claimSubType?.length) {
          return !this.ClaimSubTypes.some((key) => key && key?.id !== this.editedItem?.id && key.claimType?.toLowerCase() === this.editedItem.claimType?.toLowerCase() && key.claimSubType?.toLowerCase() === this.editedItem.claimSubType?.toLowerCase()) || "Duplicate Claim Sub Type Found!";
        }
        return this.editedItem.claimSubType.length || 'This field is required';
      }
      if (this.claim_sub_type?.length) {
        return !this.ClaimSubTypes.some((key) => key && key.claimType?.toLowerCase() === this.claim_type?.toLowerCase() && key.claimSubType?.toLowerCase() === this.claim_sub_type?.toLowerCase()) || "Duplicate Claim Sub Type Found!";
      }
    }
      return this.claim_sub_type?.length || 'This field is required';
  },
  checkDuplicateClaimTypeRule() {
    if (this.newClaimType?.length) {
      return !this.claimTypes.some((claim) => claim.toLowerCase() === this.newClaimType.toLowerCase()) || 'Duplicate Claim Type Found!'
    }
    return 'This field is required'
  },
  getUid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  closeCreateDialog() {
    this.dialog_create = false;
    this.selectedClaimKeys = [];
  },
  closeEditDialog() {
    this.dialogEdit = false;
    this.viewOnlyEditedItems = false;
    this.selectedClaimKeys = [];
    this.editedItem = {};
  },
  addNewClaimType() {
    this.$refs.addClaimTypeForm.validate();
    if (this.newClaimType?.length) {
      this.isNewClaimTypeSaving = true;
      this.claimTypes.push(this.newClaimType);
      const token = this.$store.getters.getToken;
      const AuthStr = 'Bearer '.concat(token);
      let configure = this.configuration[0];
      configure.claimTypes = this.claimTypes
      let arr = []
      arr.push(configure)
      this.$axios.$put('/configuration/update/' + this.configuration[0]._id, arr, {
          headers: {
            Authorization: AuthStr
          }
        })
        .then(async (res) => {
            this.showAddClaimTypeDialog = false;
            this.newClaimType ='';
            this.snack = true;
            this.snackColor = "green";
            this.snackText = "Claim type added successfully";
            this.isNewClaimTypeSaving = false;
        }).catch((err) => {
          console.log(err);
          this.snack = true
          this.snackText = 'Error while adding Claim type!'
          this.snackColor = 'red';
          this.isNewClaimTypeSaving = false;
        })
    }
  }

},

computed: {
  referenceNumber() {
    let month = new Date().getMonth() + 1
    let year = new Date().getFullYear().toString().slice(-2);
    month.length > 0 ? month = month : month = '0' + month;
    if (this.editedItem?.ref_prefix?.length) {
      this.editedItem.ref_prefix = this.editedItem.ref_prefix.toUpperCase();
      return this.editedItem.ref_prefix + month + year + "1234";
    } else if (this.ref_prefix?.length) {
      this.ref_prefix = this.ref_prefix?.toUpperCase()
      return this.ref_prefix + month + year + "1234";
    }
    return month + year + "1234";
  }
}
}
</script>

<style>
.v-input--selection-controls {
  margin-top: 0 !important;
}

*:disabled,*[disabled], [class*="-disabled"] {
  cursor: not-allowed !important;
}

.v-card__text {
  padding-bottom: 0 !important;
}

.positionSticky {
  position: sticky;
  background-color: #fff;
  bottom: 0;
}
</style>