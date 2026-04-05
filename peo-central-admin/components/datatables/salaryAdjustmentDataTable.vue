<template lang="">
    <div>
        <v-data-table :headers='getUserSalaryHeaders(newsalary)' :items="compensationAdjustmentComputed(oldsalary, newsalary)" :hide-default-footer="true" multi-sort>
            <template v-slot:item="{ item }">
            <tr>
                <template v-for="(column, index) in getUserSalaryHeaders(newsalary)">
                    <template v-if="item.id == 3">
                        <td :class="getColoredCompensationDifference(oldsalary, newsalary, column.value)" :key="index">
                            {{ item[column.value] }}
                            <template v-if="column.value != 'emptyCol' && item[column.value] != 0">
                            (<v-icon class="mt-n2" size="18" :color="getPercentage(column.value) >= 0 ? 'green' : 'red'">
                                {{getPercentage(column.value) >= 0 ? "mdi-arrow-up" : "mdi-arrow-down"}}
                            </v-icon>{{!isFinite(Math.abs(getPercentage(column.value))) ? "100" : Math.abs(getPercentage(column.value))}}%)
                            </template>
                        </td>
                    </template>
                    <template v-else>
                        <td :key="index">
                            {{ item[column.value] }}
                        </td>
                    </template>
                </template>
            </tr>
            </template>
        </v-data-table>
    </div>
</template>
<script>
import general from "~/plugins/general";
export default {
    props: ["headers", "newsalary", "oldsalary", "salaryPercentageChanges"],
    data() {
        return {
            services_general: general,
        }
    },
    methods: {
        getPercentage(Column) {
            let oldVal = _.cloneDeep(this.oldsalary[Column])
            let newVal = _.cloneDeep(this.newsalary[Column])
            let diff = Math.abs(Number(oldVal) - Number(newVal))
            if(oldVal - newVal <= 0){
                return Number((100 * (Number(diff) / Number(oldVal))).toFixed(2))
            }else{
                return -Number((100 * (Number(diff) / Number(oldVal))).toFixed(2))
                
            }
        },

        keyNameRegex(val) {
            return val ? _.startCase(val.replace(/_/g, " ")) : ''
        },

        getUserSalaryHeaders(data) {
            let arr = [{ text: '', value: 'emptyCol' }]
            let temp = {}
            for (const [key, value] of Object.entries(data)) {
                if (key != "total_fixed" && key != "")
                    arr.push({ text: this.keyNameRegex(key), value: key, salary_key: key })
                else if (key != "")
                    temp = { text: this.keyNameRegex(key), value: key, salary_key: key }
            }
            arr.push(temp)
            return arr
        },
        getColoredCompensationDifference(oldData, newData, column) {
            let difference = { "id": 3, "emptyCol": "Difference" }
            for (const [key1, value] of Object.entries(newData)) {
                for (const [key2, value] of Object.entries(oldData)) {
                    if (key1 == key2) {
                        difference[key1] = Number(newData[key1]) - Number(oldData[key2])
                    }
                }
            }
            if (difference[column] == 0) {
                return 'blue--text'
            } else if (difference[column] < 0) {
                return 'red--text'
            } else if (difference[column] > 0) {
                return 'green--text'
            }
        },
        compensationAdjustmentComputed(oldData, newData) {
            let oldresult = { "id": 1, "emptyCol": "Before Adjustment" }
            for (const [key, value] of Object.entries(oldData)) {
                oldresult[key] = this.services_general.thousandSeparator(oldData[key])
            }
            let newresult = { "id": 2, "emptyCol": "After Adjustment" }
            for (const [key, value] of Object.entries(newData)) {
                newresult[key] = this.services_general.thousandSeparator(newData[key])
            }
            let difference = { "id": 3, "emptyCol": "Difference" }
            for (const [key1, value] of Object.entries(newData)) {
                for (const [key2, value] of Object.entries(oldData)) {
                    if (key1 == key2) {
                        difference[key1] = this.services_general.thousandSeparator(Number(newData[key1]) - Number(oldData[key2]))
                    }
                }
            }
            return [oldresult, newresult, difference]
        },
    },
}
</script>
<style lang="">
    
</style>