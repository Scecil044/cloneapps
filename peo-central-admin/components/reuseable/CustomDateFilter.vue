<template>
    <div :class="fullWidth ? '' : 'px-1'">
      <v-menu v-model="dateMenu" :close-on-content-click="false" offset-y :nudge-left="popupNudgeLeft">
        <template v-slot:activator="{ on, attrs }">

          <v-text-field
            :label="label"
            outlined
            v-bind="attrs"
            v-on="on"
            append-icon="mdi-menu-down"
            :value="inclusive_dates.start === null || inclusive_dates.end === null ? 'Date Range' : `${inclusive_dates.start} - ${inclusive_dates.end}` "
            readonly
            dense
          ></v-text-field>
          
        </template>
        <v-list tile>
          <v-list-item class="py-2">
            <v-list-item-title>
              <v-menu
                v-model="startMenu"
                :close-on-content-click="false"
                :nudge-left="48"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    class="py-2"
                    v-model="inclusive_dates.start"
                    label="Start date"
                    append-icon="mdi-calendar"
                    outlined
                    dense
                    hide-details
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  :max="inclusive_dates.end ? inclusive_dates.end : ''"
                  v-model="inclusive_dates.start"
                  @input="startMenu = false"
                ></v-date-picker>
              </v-menu>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="py-2">
            <v-list-item-title>
              <v-menu
                v-model="endMenu"
                :close-on-content-click="false"
                :nudge-left="48"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    class="py-2"
                    v-model="inclusive_dates.end"
                    label="End date"
                    append-icon="mdi-calendar"
                    outlined
                    dense
                    hide-details
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  :min="inclusive_dates.start ? inclusive_dates.start : ''"
                  v-model="inclusive_dates.end"
                  @input="endMenu = false"
                ></v-date-picker>
              </v-menu>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="pt-2" v-if="enableClearDateFilter">
            <v-list-item-title>
              <v-btn
                block
                color="primary"
                outlined
                depressed
                elevation="2"
                rounded
                @click="emitClearDateFilter()"
              >
                Clear date filter
              </v-btn>
            </v-list-item-title>
          </v-list-item>
          <v-list-item :class="enableClearDateFilter ? '' : 'py-2'" >
            <v-list-item-title>
              <v-btn block color="primary" depressed elevation="2" rounded @click="emitSelectedDateRange()">
                Proceed
              </v-btn>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </template>
  
  <script>
  import moment from "moment";
  export default {
    props: {
      label: {
        type: String,
        default: "Label",
      },
      enableClearDateFilter: {
        type: Boolean,
        default: false,
      },
      initialFilter: {
        type: String,
        default: "",
      },
      initialStartDate: {
        type: String,
        default: null,
      },
      initialEndDate: {
        type: String,
        default: null,
      },
      popupNudgeLeft: {
        type: Number,
        default: 148,
      },
      fullWidth: {
        type: Boolean,
        default: false,
      }
    },
    data() {
      return {
        dateMenu: false,
        startMenu: false,
        endMenu: false,
        inclusive_dates: {
          start: null,
          end: null,
        },
      };
    },
    computed: {},
    mounted() {
      // If explicit initialStartDate and initialEndDate are provided, use them
      if (this.initialStartDate && this.initialEndDate) {
        this.inclusive_dates = {
          start: this.initialStartDate,
          end: this.initialEndDate,
        };
        // Emit the initial date range on mount
        this.$nextTick(() => {
          this.$emit("selectedDateRanges", this.inclusive_dates);
        });
        return;
      }

      // Otherwise use the preset filters
      if (this.initialFilter === "month") {
        this.inclusive_dates = {
          start: moment().startOf("month").format("YYYY-MM-DD"),
          end: moment().endOf("month").format("YYYY-MM-DD"),
        };
      }
      else if (this.initialFilter === "year") {
        this.inclusive_dates = {
          start: moment().startOf("year").format("YYYY-MM-DD"),
          end: moment().endOf("year").format("YYYY-MM-DD"),
        };
      }
      else if (this.initialFilter === "custom") {
        // Default to current year if no specific dates are provided
        this.inclusive_dates = {
          start: moment().startOf("year").format("YYYY-MM-DD"),
          end: moment().endOf("year").format("YYYY-MM-DD"),
        };
      }

      // Emit the initial date range on mount for preset filters too
      if (this.inclusive_dates.start && this.inclusive_dates.end) {
        this.$nextTick(() => {
          this.$emit("selectedDateRanges", this.inclusive_dates);
        });
      }
    },
    methods: {
      emitSelectedDateRange() {
        this.dateMenu = false;
        this.$emit("selectedDateRanges", this.inclusive_dates);
      },
      emitClearDateFilter() {
        this.dateMenu = false;
        this.inclusive_dates = {
          start: null,
          end: null,
        };
        this.$emit("selectedDateRanges", this.inclusive_dates);
      },
    },
  };
  </script>
  
  <style scoped lang="scss">
  .xss-border-radius {
    border-radius: 4px !important;
  }
  </style>
  