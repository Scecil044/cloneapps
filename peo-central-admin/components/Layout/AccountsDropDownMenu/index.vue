<template>
  <div class="text-center tree-menu" >
    <SnackBar :data="snackbar_data" />
    <v-dialog v-model="dialog" width="500" persistent>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="tall__btn"
          color="primary"
          outlined
          v-bind="attrs"
          v-on="on"
          @click="allCompanies"
        >
          <div class="flex_row justify-space-around">
            <NDProfile />
            <span class="n_text text--text mx-2">{{  getMenuName  }}</span>
            <LightArrow style="max-width: 10px" />
          </div>
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <h4 v-if="!addNewMode">Companies {{addNewMode}}</h4>
          <div v-else class="d-flex">
            <v-icon
              small
              color="black"
              class="mr-2"
              style="cursor: pointer"
              @click="prevView"
              >fa-arrow-left</v-icon
            >
            <h4 v-if="addNewMode">Add New Company {{addNewMode}}</h4>
          </div>
          <v-icon x-small color="#D6D6D6" @click="closeMenu">fa-close</v-icon>
        </v-card-title>

        <v-card-text :class="{ newMode: addNewMode }">
          <div>
            <v-flex v-for="(gParent,index) in companies" :key="index" >
              <v-expansion-panels>
                <v-expansion-panel :clickable="true" class="customBoxShadow">
                  <v-expansion-panel-header>
                    <v-row align="center">
                      <v-col class="pa-0" cols="10">
                        <v-checkbox class="textFieldDetailsCuttom mt-0 " :input-value="selectedCompany.includes(gParent) ? true : false" light :label="gParent.company_name" @click.stop="addCompanyToSelected(gParent)">
                        </v-checkbox>
                      </v-col>
                      <v-col class="pa-0" cols="2">
                        <v-span class="textFieldDetailsCuttom mt-0 rounedCheckBox" light  @click.stop="selectAllChild(gParent.children)" >All</v-span>
                        <v-btn class="setting-btn add-btn ml-1" @click="addNewCompany(gParent)" v-if="addNewMode"> 
                          <v-icon x-small color="#D6D6D6">fa-plus</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-flex v-for="(parent,i) in gParent.children" :key="i"  class="px-7">
                      <v-expansion-panels>
                        <v-expansion-panel :clickable="true"  class="customBoxShadow">
                          <v-expansion-panel-header>
                            <v-row align="center">
                              <v-col class="pa-0" cols="10">
                                <v-checkbox class="textFieldDetailsCuttom mt-0" light :input-value="selectedCompany.includes(parent) ? true : false" :label="parent.company_name" @click.stop="addCompanyToSelected(parent)">
                                </v-checkbox>
                              </v-col>
                              <v-col class="pa-0" cols="2">
                                <v-span class="textFieldDetailsCuttom mt-0 rounedCheckBox" light  @click.stop="selectAllSubChild(parent.children)" >All</v-span>
                                <v-btn class="setting-btn add-btn ml-1" @click="addNewCompany(parent)" v-if="addNewMode"> 
                                  <v-icon x-small color="#D6D6D6">fa-plus</v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-expansion-panel-header>
                          <v-expansion-panel-content>
                            <v-flex v-for="(child,j) in parent.children" :key="j"  class="px-7">
                              <v-checkbox class="textFieldDetailsCuttom mt-0" light  :input-value="selectedCompany.includes(child) ? true : false"  :label="child.company_name" @click.stop="addCompanyToSelected(child)">
                              </v-checkbox>
                            </v-flex>
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-flex>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              
             
            </v-flex>
          </div>
          <!-- <v-treeview
            v-model="selection"
            selectable
            :items="companies"
            return-object
            expand-icon="fa-chevron-down"
            @input="checkChildrenSelection"
            ref="tree"
          >
            <template v-slot:prepend="{ item }">
              <img :src="item.company_logo" alt="" />
            </template>
            <template v-slot:append="{ item }" v-if="addNewMode">
              <v-btn class="setting-btn">
                <v-icon x-small color="#D6D6D6">fa-pen</v-icon>
              </v-btn>
              <v-btn class="setting-btn add-btn ml-1" @click="addNewCompany(item)">
                <v-icon x-small color="#D6D6D6">fa-plus</v-icon>
              </v-btn>
            </template>
          </v-treeview> -->

        </v-card-text>
        <!-- <v-card-text v-if="editMode && !confirmation">
          <div class="file-group">
            <input type="file" id="companyLogo" @change="onFileChange" />
            <label for="companyLogo" class="companyLogo">
              <div class="edit-img">
                <v-icon x-small>fa-pen</v-icon>
              </div>
            </label>
          </div>
          <input type="text" class="company-name" id="companyName" />
          <v-btn
            color="primary"
            class="save-company"
            @click="confirmation = true"
            >Save</v-btn
          >
        </v-card-text> -->

        <v-card-actions class="d-flex justify-space-between">
          <v-btn
            class="add-company"
            text
            :disabled="!selectedCompany.length"
            v-if="!addNewMode"
            @click="handleApplyFiltering"
            >Apply</v-btn
          >
          <v-btn
            class="add-company"
            text
            @click="addCompanyBtn"
            v-if="!addNewMode"
            >Add New Company</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <ApplyFilteringDialog
      :selectedCompany="selectedCompany"
      :applyFiltering="applyFiltering"
      @close="close"
      @apply="apply"
    />
    <SnackBar :data="snackbar_data" />
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
import NDProfile from '@/assets/images/DashboardLayout/NathanDigital-profilepic.svg'
import LightArrow from '@/assets/images/Light-Arrow-icon.svg'
import ApplyFilteringDialog from '@/components/Layout/AccountsDropDownMenu/ApplyFilteringDialog.vue'
import SnackBar from '~/components/utils/SnackBar.vue'

export default {
  props: {
    accounts: Array,
  },
  components: { NDProfile, LightArrow, ApplyFilteringDialog, SnackBar },
  computed: {
    ...mapState([
      'welcomeDialog',
      'addCompany',
      'hi',
      'companySelection',
      'companySelectionState',
      'parentSelectedCompany'
    ]),
    getMenuName() {
      return this.selectedCompany.length > 1 ? 'Consolidated' : this.selectedCompany.length  === 1 ? this.selectedCompany[0].company_name : 'None'
    } 
  },
  data() {
    return {
      selectedCompany:[],
      dialog: false,
      addNewMode: false,
      applyFiltering: false,
      url: null,
      selection: [],
      selectAllSubChildren:true,
      selectAllChildren:true,
      logos: {
        nathan: '/cust_default_icon.svg',
        dynamicFreelance: '/cust_default_icon.svg',
        nathanDigital: '/cust_default_icon.svg',
      },
      companies: [],
      snackbar_data: {
        snackbar: false,
        text: '',
        color: '',
        timeout: 2000,
      },
    }
  },

  async mounted() {
    // await this.allCompanies()
    // console.log("here at header")
  },
  
  methods: {
    selectAllSubChild(val){
      let flag = true
      for (let index = 0; index < val.length; index++) {
        const element = val[index];
        if(!this.selectedCompany.includes(element)){
          flag = false
          this.selectedCompany.push(element)
        }
      }
      this.selectAllSubChildren = flag
      if(flag){
        for (let index = 0; index < val.length; index++) {
          const element = val[index];
         this.selectedCompany = _.without(this.selectedCompany, element)
        }
      }
    },
    
    selectAllChild(val){
      function flat(array) {
        var result = [];
        array.forEach(function (a) {
            result.push(a);
            if (Array.isArray(a.children)) {
                result = result.concat(flat(a.children));
            }
        });
        return result;
      }
      let arr = val.concat(flat(val))
      let flag = true
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if(!this.selectedCompany.includes(element)){
          flag = false
          this.selectedCompany.push(element)
        }
      }
      this.selectAllChildren = flag
      if(flag){
        for (let index = 0; index < arr.length; index++) {
          const element = arr[index];
         this.selectedCompany = _.without(this.selectedCompany, element)
        }
      }
    },
    addCompanyToSelected(val){
      this.selectedCompany.includes(val) ? this.selectedCompany = _.without(this.selectedCompany, val) : this.selectedCompany.push(val)
    },
    mapping(array, value) {
      array.map((item) => {
        if (item.parent_company_id !== value) {
          item.locked = true
        }
        if (value === '0' && item.parent_company_id === '0') {
          item.locked = false
        }
        // if(item.children){
        //   array.map((child) => {
        //     this.$refs.tree.updateSelected(child);
        //   })
        // }
        this.mapping(item.children, value)
      })
    },
    mappingChildren(array, value) {
      let arr = [];
      array.map((item) => {
        if (item._id === value) {
          if(item.children.length){
            item.children.map((child)=> {
              // this.$refs.tree.updateSelected(child);
              // this.selectedCompany.push(child)
              // this.$refs.tree.select(child);
            })
          }
          // console.log('arr', arr);
          // this.selectedCompany = this.selectedCompany.concat(arr)
        }
        // if(item.children){
        //   array.map((child) => {
        //     this.$refs.tree.updateSelected(child);
        //   })
        // }
        this.mappingChildren(item.children, value)
      })
    },
    checkChildrenSelection(value) {
      // console.log('selected',value[0]['parent_company_id']);
      // console.log('selected',value);

      if (value.length > 0) {
        // this.mapping(this.companies, value[0]['parent_company_id'])
        // this.mappingChildren(this.companies, value[0]['_id'])
        // console.log(this.mappingChildren(this.companies, value[0]['_id']));
        // this.selectedCompany = this.mappingChildren(this.companies, value[0]['_id'])
      }
      if (this.selectedCompany.length === 0) {
        this.allCompanies()
      }
    },
    async allCompanies() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios
        .$post(
          `/company/all`,
          {},
          {
            headers: { Authorization: AuthStr },
          }
        )
        .then(async (res) => {
          this.companies = res.data
          function flat(array) {
            var result = [];
            array.forEach(function (a) {
                result.push(a);
                if (Array.isArray(a.children)) {
                    result = result.concat(flat(a.children));
                }
            });
            return result;
          }
          let companyIds = this.$store.getters.getSelectedCompanies.map(a=>a.id)
          let allCompaniesWithChild = flat(this.companies)
          this.selectedCompany = allCompaniesWithChild.filter(a=>companyIds.includes(a._id))
          
        })
    },
    ...mapMutations([
      'setWelcomeDialog',
      'setAddCompany',
      'setHiValue',
      'setCompanySelection',
      'setCustomers',
    ]),
    ...mapActions(['setParentSelectedCompany']),
    updateWelcomeDialog(newValue, newValue2) {
      this.setWelcomeDialog(newValue)
      this.setAddCompany(newValue)
      this.setHiValue(newValue2)
    },
    updateSelectedCompanies(newValue) {
      this.setCompanySelection(newValue)
    },
    addNewCompany(item) {
      // console.log(item,"jfjhgf")
      this.updateWelcomeDialog(true, false)
      this.closeMenu();
      this.setParentSelectedCompany(item);
    },
    prevView() {
      if (this.addNewMode) {
        this.addNewMode = false
      } else {
        this.addNewMode = true
      }
    },
    handleApplyFiltering() {
      this.applyFiltering = true
    },
    async apply() {
      // const getAncestors = (target, children, ancestors = []) => {
      //   for (let node of children) {
      //     if (node.id === target) {
      //       return ancestors.concat(node.id);
      //     }
      //     const found = getAncestors(target, node.children, ancestors.concat(node.id));
      //     if (found) {
      //       return found;
      //     }
      //   }
      //   return undefined;
      // };
      // let array_nodes = []
      let parent_ids = []
      // for (let index = 0; index < this.selectedCompany.length; index++) {
      //   const d = this.selectedCompany[index];
      //   parent_ids = parent_ids.concat(getAncestors(d.id,this.companies))
      //   array_nodes.push({
      //    id: d.id,
      //    name: d.name,
      //  })
      // }
      // function flat(array) {
      //     var result = [];
      //     array.forEach(function (a) {
      //         result.push(a);
      //         if (Array.isArray(a.children)) {
      //             result = result.concat(flat(a.children));
      //         }
      //     });
      //     return result;
      // }
      // for (let i = 0; i < parent_ids.length; i++) {
      //   const element = (flat(this.companies)).filter(item => item.id == parent_ids[i])[0];
      //   array_nodes.push({
      //    id: element.id,
      //    name: element.name,
      //  })
      // }
      // let uniqarr = _.uniqBy(array_nodes, function (e) {
      //   return e.id;
      // });
      let array_nodes = []
      this.selectedCompany.forEach(function (d) {
        array_nodes.push({
          id: d.id,
          name: d.name,
        })
      })

      this.updateSelectedCompanies(array_nodes)

      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      let payload = {
        company: this.selectedCompany.map((item) => item._id),
      }
      await this.$axios
        .$post('customer/list', payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.setCustomers(res.data.customers)
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Something Went Wrong',
            color: 'danger',
            icon: 'check',
            timeout: 2000,
          }
        })

      this.close()
    },
    closeMenu() {
      this.dialog = false
      this.addNewMode = false
      // this.selection = []
    },
    addCompanyBtn() {
      this.addNewMode = true
    },
    close() {
      this.applyFiltering = false
      this.dialog = false
      this.addNewMode = false
      // this.allCompanies()
      // this.selection = []
    },
  },
}
</script>
<style>
.textFieldDetailsCuttom .v-messages{
  display: none;
}
.customBoxShadow{
  box-shadow: none !important;
  border: solid 1px #ececec;
}
.rounedCheckBox i .fa-square{
  border-radius: 50% !important;
}
</style>
<style lang="scss">

.add-company {
  width: 49%;
  border: 1px solid #e2e7f1;
  color: #0a94ff !important;
  background-color: #fff;
  font-weight: bold;
}
.setting-btn {
  height: 18px !important;
  width: 18px;
  min-width: unset !important;
  padding: 0 !important;
  background-color: transparent !important;
  box-shadow: none;
  &.add-btn {
    border-radius: 50% !important;
    border: 1px solid #d6d6d6;
  }
}
.company-name {
  width: 100%;
  height: 50px;
  margin: 25px 0 20px;
  border: 1px solid #e2e7f1 !important;
  border-radius: 12px;
}
.save-company {
  width: 100%;
  height: 42px !important;
}
.fa-chevron-down {
  font-size: 13px !important;
}
.v-treeview-node {
  &__content {
    color: #8d98a9;
    &:hover {
      color: #000;
    }
  }
  &__toggle {
    width: auto;
  }
}
.v-treeview-node__root {
  transition: all 0.4s ease-in-out;
  &:hover {
    & > .v-treeview-node__checkbox {
      opacity: 1;
      width: auto;
    }
  }
}
.v-treeview-node__checkbox {
  opacity: 0;
  width: 0;
  transition: all 0.4s ease-in-out;
  &.fa-check-square {
    opacity: 1;
    width: auto;
  }
}
.newMode {
  .v-treeview-node__checkbox {
    display: none;
  }
}
</style>
