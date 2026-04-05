<template>
    <v-row>
    <v-col sm="12" md="4" lg="4">
      <v-card color='card_bg'  id="card">
        <v-card-title id="card-title">
          <h4 class="text--text">Expense Breakdown</h4>
          <div class="flex_row justify-space-between">
            <v-btn class="short__btn mr-2" outlined>Year</v-btn>
          </div>
        </v-card-title>
        <v-card-text id="card-text">
          <div class="ex_br__con flex_row align-center justify-space-around">
            <div style="min-width: 100px; min-height: 100px;"></div>
            <div class="flex_column">
              <div class="flex_row align-center pa-2" v-for="item in breakdown_data" :key="item">
                <div :class="item.color" class="dote mr-2" style="min-width: 15px;min-height: 6px;border-radius: 3px;"></div>
                <span class="subtext--text">{{ item.name }} - {{ item.amount }} - {{ item.percentage }}%</span>
              </div>
          </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
</v-row>
</template>

<script>
import '@/assets/scss/_expenses.scss'
export default {
    components: { TotalsCard },
    data() {
        return {
            breakdown_data: [
                { name: 'Business', amount: '35.1k', percentage: '43', color: 'accent2'},
                { name: 'Office maintained', amount: '5.1k', percentage: '30', color: 'primary'},
                { name: 'Salary', amount: '102k', percentage: '25', color: 'accent4'},
                { name: 'DEWA', amount: '10k', percentage: '2', color: 'accent1'},
                { name: 'Office Rent', amount: '10k', percentage: '5', color: 'accent3'},
            ],
        }
    }
}