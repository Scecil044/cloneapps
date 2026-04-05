<template>
  <v-row class="alerts_wrapper">
    <v-row class="notify_me_row">
      <v-spacer />
      <v-col sm="12" md="9" lg="9">
        <v-card color="card_bg"  id="card">
          <v-card-title id="card-title" style="padding: 0 10px">
            <h4>Notify me</h4>
            <v-switch
            v-model="notify_me"
            class="mt-0"
            inset
            :label="`${notify_me.toString()}`"
            color="primary"
            hide-details
            ></v-switch>
          </v-card-title>
        </v-card>
      </v-col>
      <v-spacer />
    </v-row>
    <v-row class="alerts_row">
      <v-spacer />
      <v-col sm="12" md="9" lg="9">
        <v-card color="card_bg"  id="card">
            <v-card-text id="card-text" style="margin: 5px 0 !important;padding: 10px;">
              <!-- Today -->
              <div class="tody_con">
                <h4 class="text--text">Today</h4>
                  <div class="alert__con mt-5" >
                    <div v-for="item in alerts_data" :key="item.id">
                      <div class="flex_row my-3" >
                        <RedBellIcon v-if="item.priority == 'High Priority'" />
                        <YellowBellIcon v-if="item.priority == 'Low Priority'" />
                        <div class="flex_column ml-3">
                          <h5 class="text--text">{{ item.title }}</h5>
                          <span class="text--subtitle pt-1">{{ item.subtitle }}</span>
                        </div>
                        <v-spacer></v-spacer>
                        <p class="accent2--text mb-0" v-if="item.priority=='High Priority'">{{ item.priority }}</p>
                        <p class="primary--text mb-0" v-if="item.priority=='Med Priority'">{{ item.priority }}</p>
                        <p class="accent3--text mb-0" v-if="item.priority=='Low Priority'">{{ item.priority }}</p>
                      </div>
                      <v-divider id="divider" class="" style=""></v-divider>
                    </div>
                  </div>
              </div>
              <v-spacer style="margin:3rem;"></v-spacer>
              <!-- Yesterday -->
              <div class="tody_con">
                <h4 class="text--text">Yesterday</h4>
                  <div class="alert__con mt-5" >
                    <div v-for="item in alerts_data" :key="item.id">
                      <div class="flex_row my-3" >
                        <RedBellIcon v-if="item.priority == 'High Priority'" />
                        <YellowBellIcon v-if="item.priority == 'Low Priority'" />
                        <div class="flex_column ml-3">
                          <h5 class="text--text">{{ item.title }}</h5>
                          <span class="text--subtitle pt-1">{{ item.subtitle }}</span>
                        </div>
                        <v-spacer></v-spacer>
                        <p class="accent2--text mb-0" v-if="item.priority=='High Priority'">{{ item.priority }}</p>
                        <p class="primary--text mb-0" v-if="item.priority=='Med Priority'">{{ item.priority }}</p>
                        <p class="accent3--text mb-0" v-if="item.priority=='Low Priority'">{{ item.priority }}</p>
                      </div>
                      <v-divider id="divider" class=""></v-divider>
                    </div>
                  </div>
              </div>
              <v-spacer style="margin:3rem;"></v-spacer>
              <!-- June 21, 2022 -->
              <div class="tody_con">
                <h4 class="text--text">June 21, 2022</h4>
                  <div class="alert__con mt-5" >
                    <div v-for="item in alerts_data" :key="item.id">
                      <div class="flex_row my-3" >
                        <RedBellIcon v-if="item.priority == 'High Priority'" />
                        <YellowBellIcon v-if="item.priority == 'Low Priority'" />
                        <div class="flex_column ml-3">
                          <h5 class="text--text">{{ item.title }}</h5>
                          <span class="text--subtitle pt-1">{{ item.subtitle }}</span>
                        </div>
                        <v-spacer></v-spacer>
                        <p class="accent2--text mb-0" v-if="item.priority=='High Priority'">{{ item.priority }}</p>
                        <p class="primary--text mb-0" v-if="item.priority=='Med Priority'">{{ item.priority }}</p>
                        <p class="accent3--text mb-0" v-if="item.priority=='Low Priority'">{{ item.priority }}</p>
                      </div>
                      <v-divider id="divider" class=""></v-divider>
                    </div>
                  </div>
              </div>
            </v-card-text>
        </v-card>
      </v-col>
      <v-spacer />
    </v-row>
  </v-row>
</template>
  
<script>
import '@/assets/scss/_alerts.scss'
import RedBellIcon from '@/assets/images/Alerts/red-bell-icon.svg'
import YellowBellIcon from '@/assets/images/Alerts/yellow-bell-icon.svg'

export default {
  layout: 'dashboard',
  components: { RedBellIcon, YellowBellIcon },
  data() {
    return {
      notify_me: false,
      alerts_data: [
        { title: 'Receivable Alerts !', subtitle: 'Recievable exceeds 3 months', priority: 'High Priority' },
        { title: 'Overdue Alert', subtitle: 'You have 100k overdue.', priority: 'High Priority' },
        { title: 'Bank Notification', subtitle: 'Monthly service charges', priority: 'Low Priority' },
      ],
    }
  },
}
</script>
  