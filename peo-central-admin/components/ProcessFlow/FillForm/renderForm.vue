<template>
  <div style="height: 90vh; overflow-y: auto;">
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
            <v-row class=" pt-12" v-for="(header, headerindex) in item.header" :key="headerindex">
              <v-col cols="12" class="pl-0 pt-0 pb-0">
                <div class="mt-6 mb-4">
                  <span class="span_leadHeading">{{ header.header_name }}</span>
                </div>
              </v-col>
              <v-col cols="4" class=" pl-0 pt-0 pb-0" v-for="(field, fieldindex) in header.fields" :key="fieldindex">
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
        <v-row class=" pa-0 ma-0" v-for="(header, headerindex) in form.fields[0].header" :key="headerindex">
          <v-col cols="12" class="pl-0 pt-0 pb-0">
            <div class="mt-0 mb-4">
              <span class="span_leadHeading">{{ header.header_name }}</span>
            </div>
          </v-col>

          <v-col cols="6" class=" pl-0 pt-0 pb-0" v-for="(field, fieldindex) in header.fields" :key="fieldindex">
            <div v-if="field.label == 'Eid Test Location'">
              <CustomInputContainer v-if="(form.fields[0].header[headerindex].fields[findIndex(form.fields[0].header[headerindex].fields,
                'Held Emirates ID Before')]?.value == 'No')" :label="field.label" :mandatory="field.required">
                <div slot="input">
                  <v-autocomplete :items="field.item" item-text="key" item-value="value"
                    v-model="form.fields[0].header[headerindex].fields[fieldindex].value" @change="changeDetection"
                    :placeholder="field.label" outlined dense :rules="main_rule" />
                </div>
              </CustomInputContainer>
            </div>
            <div slot="input" v-else>
              <CustomInputContainer :label="field.label" :mandatory="field.required">
                <div slot="input">
                  <v-text-field v-if="field.field_type == 'textfield'"
                    v-model="form.fields[0].header[headerindex].fields[fieldindex].value" @input="changeDetection"
                    hide-details :placeholder="field.label" solo dense class="proposalDialog_date_field2"
                    :rules="field.required ? main_rule : []" />

                  <v-autocomplete v-else-if="field.field_type == 'select'" :items="field.item" item-text="key"
                    item-value="value" v-model="form.fields[0].header[headerindex].fields[fieldindex].value"
                    @change="changeDetection" :placeholder="field.label" outlined dense
                    :rules="field.required ? main_rule : []" />

                  <!-- Date Picker Menu -->
                  <v-menu elevation v-model="showDateMenu" v-else-if="field.field_type == 'date'" rounded="xl"
                    transition="scale-transition" :close-on-content-click="false" offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-bind="attrs" v-on="on"
                        :value="form.fields[0].header[headerindex].fields[fieldindex].value | formatDateWithoutTime"
                        readonly solo dense label="Select Date" class="proposalDialog_date_field2"></v-text-field>
                    </template>
                    <v-card class="pa-0" elevation="0">
                      <v-card-text class="pa-0">
                        <v-date-picker elevation="0" @change="changeDetection"
                          v-model="form.fields[0].header[headerindex].fields[fieldindex].value"></v-date-picker>
                      </v-card-text>
                      <v-card-actions class="d-flex align-center justify-space-between">
                        <p class="font-weight-bold blue--text ml-4 text--lighten-1">{{
                          form.fields[0].header[headerindex].fields[fieldindex].value }}</p>
                        <v-btn class="ml-2" fab dark small title="save" color="primary" @click="showDateMenu = false">
                          <div>
                            <v-icon dark>
                              mdi-check
                            </v-icon>
                          </div>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>

                  <!-- Time Picker Menu -->
                  <v-menu v-else-if="field.field_type == 'time'" v-model="showTimeMenu" transition="scale-transition"
                    :close-on-content-click="false" offset-y max-width="290px">
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field v-bind="attrs" v-on="on"
                        :value="form.fields[0].header[headerindex].fields[fieldindex].value" readonly solo dense
                        label="Select Time" class="proposalDialog_date_field2"></v-text-field>
                    </template>
                    <v-card class="time-picker-card" elevation="0">
                      <v-card-text class="pa-0">
                        <v-time-picker v-model="form.fields[0].header[headerindex].fields[fieldindex].value"
                          @change="changeDetection" format="24hr" width="290"
                          class="custom-time-picker"></v-time-picker>
                        <v-card-actions class="d-flex align-center justify-space-between px-2 py-1">
                          <p class="caption blue--text text--lighten-1 mb-0">
                            {{ form.fields[0].header[headerindex].fields[fieldindex].value }}
                          </p>
                          <v-btn x-small fab dark color="primary" @click="showTimeMenu = false">
                            <v-icon small>mdi-check</v-icon>
                          </v-btn>
                        </v-card-actions>
                      </v-card-text>
                    </v-card>
                  </v-menu>

                  <v-text-field v-else v-model="form.fields[0].header[headerindex].fields[fieldindex].value" disabled
                    solo dense class="proposalDialog_date_field2" />
                </div>
              </CustomInputContainer>
            </div>
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
      showDateMenu: false,
      showTimeMenu: false,
    }
  },
  async mounted() {
    if (this.form?.fields[0]?.header[0]?.fields[this.findIndex(this.form.fields[0].header[0].fields,
      'Employment Type')] && this.form?.fields[0]?.header[0]?.fields[this.findIndex(this.form.fields[0].header[0].fields,
        'Employment Type')]?.value != 'Employment Visa (2-Year)') {
      console.log('test')
      this.form.fields[0].header[0].fields = this.form.fields[0].header[0].fields.filter(a => { return a.label != 'Medical Test Location' && a.label != 'Eid Test Location' && a.label != 'Tawjeeh Test Location' })
    }
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
      if (this.form.name != 'New Visa Process PRO Form"') {
        return true
      }
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
