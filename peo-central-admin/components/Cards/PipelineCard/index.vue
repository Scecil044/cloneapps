<template>
  <v-row>
    <v-col v-if="leadsData" cols="12" class="py-0 px-0">
      <div>
        <!-- {{ item2 }} -->
        <div class="lead_title d-flex align-center justify-space-between mb-5 pr-12">
          <div class="d-flex flex-column">
            <h5 class="mb-2">{{ leadsData._id }}</h5>
            <span class="span_text">{{ `Avg Duration* - ${leadsData.avgDays} Days` }}</span>
          </div>
          <div>
            <span :class="`smart_btn light_accent${index % 4 + 1} accent${index % 4 + 1}--text`">{{
              leadsData.count
            }}</span>
          </div>
        </div>
        <div class="d-flex flex-column pr-12" style="gap: 12px; width: 100% !important">
          <v-card v-for="(sub, i) in leads" :key="i" @click="changeLeadBorder(i, sub)" :style="sub.borderColor"
            color="card_bg" class="pipeline_card d-flex align-center pl-4">
            <div class=" d-flex align-center ">
              <v-avatar class="" size="48px">
                <v-img alt="Avatar" :src="sub.logo" v-if="sub.logo" />
                <customerDefaultIcon style="border-radius: 50px" v-else />
              </v-avatar>
              <div class=" d-flex flex-column  ml-6">
                <div class="">
                  <span class="span_data">
                    {{ sub.leadName }}
                  </span>
                </div>
                <div>
                  <span :class="{ 'colored': sub.isColored }" class="span_text"> {{ sub.leadGettingTime }} </span>
                  <span class="span_text">in stage</span>
                </div>
              </div>

            </div>
          </v-card>
        </div>
      </div>

    </v-col>
  </v-row>
</template>

<script>
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'

export default {
  components: { customerDefaultIcon },
  props: { leadsData: Object, index: Number ,module:String},
  data() {
    return {
      limit: '10',
      page: 0,
      leads: []
    }
  },
  mounted() {
    this.getPipeLineData()
  },
  methods: {
    async getPipeLineData() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      await this.$axios.$get(`/${this.module}/pipeline/list?page=${1}&limit=${9999}&stage_name=${encodeURIComponent(this.leadsData._id)}`, { headers: { Authorization: AuthStr } })
        .then((response1) => {
          response1.results.forEach((elem) => {
            this.leads.push({
              logo: elem.user.image_url,
              leadName: elem.user.first_name,
              leadGettingTime: elem.days_since,
              leadGettingTime: '5 days',
              isColored: false,
              borderColor: { borderLeft: '8px solid #f9fafc !important', borderTop: '2px solid #f9fafc !important', borderRight: '2px solid #f9fafc !important', borderBottom: '2px solid #f9fafc !important', }
            });
          });
        })
    },
    changeLeadBorder(leadIndex, sub) {
      const borderColor = this.leads[leadIndex].borderColor;
      const isOrange = borderColor.borderLeft === '10px solid #f3654a !important';
      if (isOrange) {
        // if current border color is orange, toggle back to original color
        borderColor.borderLeft = '10px solid #f9fafc !important';
        borderColor.borderTop = '1px solid #f9fafc !important';
        borderColor.borderRight = '1px solid #f9fafc !important';
        borderColor.borderBottom = '1px solid #f9fafc !important';
      } else {
        // if current border color is not orange, toggle to orange color
        borderColor.borderLeft = '10px solid #f3654a !important';
        borderColor.borderTop = '1px solid #f3654a !important';
        borderColor.borderRight = '1px solid #f3654a !important';
        borderColor.borderBottom = '1px solid #f3654a !important';
      }
      sub.isColored = !sub.isColored;
    },
    // toggleColor(sub) {

    // },
  },
}
</script>
<style>
.colored {
  color: #f3654a !important;
}
</style>


