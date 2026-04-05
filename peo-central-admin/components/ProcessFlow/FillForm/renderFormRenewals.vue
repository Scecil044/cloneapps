
<template>
    <div>
      <v-form ref="form" class="pa-0 ma-0" style="display: contents !important;" v-if="computeTotalSalary">
        <div v-if="form.fields.length > 1">
          <v-row>
            <v-col cols="11" class="pa-0">
              <v-tabs v-model="tab" background-color="transparent" grow
                class="justify-center darkBlue-heading-text rounded-0 px-5 py-6">
                <v-tab v-for="(item, index) in form.fields" :key="index" :href=getTabName(item.tab_name)
                  style="background-color:#fff;overflow: hidden;" class="mr-2 rounded-xl darkBlue-heading-text">{{
                    item.tab_name }}</v-tab>
              </v-tabs>
            </v-col>
          </v-row>
  
          <v-divider></v-divider>
          <v-tabs-items v-model="tab">
            <v-tab-item :id="item.tab_name.toLowerCase()" v-for="(item, index) in form.fields" :key="index" class="">
              <v-row class=" pt-12" v-for="(header, headerindex ) in item.header" :key="headerindex">
                <v-col cols="12" class="pl-0 pt-0 pb-0">
                  <div class="mt-6 mb-4">
                    <span class="span_leadHeading">{{ header.header_name }}</span>
                  </div>
                </v-col>
                <v-col cols="4" class=" pl-0 pt-0 pb-0" v-for="(field, fieldindex ) in header.fields" :key="fieldindex">
                  <CustomInputContainer :label="field.label" :mandatory="field.required">
                    <div slot="input">
                      <v-text-field v-if="field.field_type == 'textfield'"
                        v-model="form.fields[index].header[headerindex].fields[fieldindex].value" @input="changeDetection"
                        hide-details :placeholder="field.label" solo dense class="proposalDialog_date_field2"
                        :rules="field.required ? main_rule : []" />
  
                      <v-autocomplete v-if="field.field_type == 'select'" :items="field.item" item-text="key"
                        item-value="value" v-model="form.fields[index].header[headerindex].fields[fieldindex].value"
                        @change="changeDetection" :placeholder="field.label" outlined dense
                        :rules="field.required ? main_rule : []" />
                    </div>
                  </CustomInputContainer>
                </v-col>
              </v-row>
            </v-tab-item>
          </v-tabs-items>
        </div>
        <div v-else>
          <v-row class=" pa-0 ma-0" v-for="(header, headerindex ) in     form.fields[0].header    " :key="headerindex">
            <v-col cols="12" class="pl-0 pt-0 pb-0">
              <div class="mt-0 mb-4">
                <span class="span_leadHeading">{{ header.header_name }}</span>
              </div>
            </v-col>
            <v-col cols="6" class=" pl-0 pt-0 pb-0" v-for="(field, fieldindex ) in     header.fields    " :key="fieldindex">
              <CustomInputContainer :label="field.label" :mandatory="field.required">
                <div slot="input">
                  <v-autocomplete v-if="field.label == 'Eid Test Location'" :items="field.item" item-text="key"
                    item-value="value" v-model="form.fields[0].header[headerindex].fields[fieldindex].value"
                    @change="changeDetection" :placeholder="field.label" outlined dense  />
  
                  <v-text-field v-else-if="field.field_type == 'textfield'"
                    v-model="form.fields[0].header[headerindex].fields[fieldindex].value" @input="changeDetection"
                    hide-details :placeholder="field.label" solo dense class="proposalDialog_date_field2"
                    :rules="field.required ? main_rule : []" />
  
                  <v-autocomplete v-else-if="field.field_type == 'select'" :items="field.item" item-text="key"
                    item-value="value" v-model="form.fields[0].header[headerindex].fields[fieldindex].value"
                    @change="changeDetection" :placeholder="field.label" outlined dense
                    :rules="field.required ? main_rule : []" />
                  <v-text-field v-else v-model="form.fields[0].header[headerindex].fields[fieldindex].value" disabled solo
                    dense class="proposalDialog_date_field2" />
                </div>
              </CustomInputContainer>
            </v-col>
          </v-row>
        </div>
      </v-form>
    </div>
  </template>
  <script>
  import CustomInputContainer from '@/components/utils/CustomInputContainer.vue'
  export default {
    components: {
      CustomInputContainer
    },
    props: {
      form: Object,
    },
    data() {
      return {
        tab: '',
        main_rule: [(v) => !!v || 'This filed is required'],
      }
    },
    async mounted() {
  
      this.changeDetection()
    },
    methods: {
      getTabName(val) {
        if (val && val != '') {
          return ('#' + val.toLowerCase())
        }
      },
      findIndex(array, value) {
        var index = array.findIndex(function (element) {
          return element.label.toString().trim().toLowerCase() == value.toString().trim().toLowerCase()
        });
        return index
      },
      changeDetection() {
        this.$emit('changeDetection', this.form, this.$refs.form)
      },
    },
    computed: {
      computeTotalSalary() {
        let total = 0
        if (this.form.fields.length > 0) {
          if (this.form.fields[0].header[1] && this.form.fields[0].header[1].fields.length > 0) {
            for (let index = 0; index < this.form.fields[0].header[1].fields.length; index++) {
              const element = this.form.fields[0].header[1].fields[index];
              if (element.label != 'Total Salary') {
                total += parseFloat(element.value)
              }
            }
            this.form.fields[0].header[1].fields[this.findIndex(this.form.fields[0].header[1].fields, 'Total Salary')].value = total
          }
  
        }
        return true
      },
    }
  }
  </script>