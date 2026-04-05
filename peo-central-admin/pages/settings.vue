<template>
  <v-row class="wrapper_row">
    <v-row>
      <v-col sm="12" md="12" lg="12">
        <v-card color='card_bg' id="card">
          <v-card-title id="card-title">
            <h4>Settings</h4>
            <v-icon small color="outline">fa-check</v-icon>
          </v-card-title>
          <v-card-text id="card-text">
            <v-tabs v-model="tab" grow class="justify-center grey--text" @change="changeTabs()">
              <v-tab href="#emails">Email Configurator</v-tab>
              <v-tab href="#Sms">Sms Configurator</v-tab>
              <v-tab href="#documents">Document Configurator</v-tab>
              <v-tab href="#flow">Flow Configurator</v-tab>
              <v-tab href="#documentTypes">Document Types</v-tab>
              <v-tab href="#hrSelfService">HR Self Service Config</v-tab>
            </v-tabs>
            <v-divider></v-divider>
            <v-tabs-items v-model="tab">
              <v-tab-item id="emails">
                <emailConfigurator v-if="viewTab" />
              </v-tab-item>
              <v-tab-item id="Sms">
                <smsConfigurator v-if="viewTab" />
              </v-tab-item>
              <v-tab-item id="documents">
                <documentConfigurator v-if="viewTab" />
              </v-tab-item>
              <v-tab-item id="flow">
                <flowConfigurator v-if="viewTab" />
              </v-tab-item>
              <v-tab-item id="documentTypes">
                <documentTypeConfigurator v-if="viewTab" />
              </v-tab-item>
              <v-tab-item id="hrSelfService">
                <hrConfigurator :users="users" :configurations="configuration" v-if="viewTab" />
              </v-tab-item>
            </v-tabs-items>

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-row>
</template>
<script>
import emailConfigurator from '@/components/configurations/EmailConfigurator'
import documentTypeConfigurator from '@/components/configurations/DocumentTypes'
import documentConfigurator from '@/components/configurations/DocumentConfigurator'
import flowConfigurator from '@/components/configurations/FlowConfigurator'
import hrConfigurator from '@/components/configurations/HRSelfServiceConfigurator'
import smsConfigurator from '@/components/configurations/SmsConfigurator'


export default {
  layout: 'dashboard',
  components: { emailConfigurator, documentConfigurator, flowConfigurator, documentTypeConfigurator, hrConfigurator , smsConfigurator },
  data() {
    return {
      tab: '',
      viewTab: true,
    }
  },
  async asyncData({ app, store }) {
    let configuration = await store.getters.getConf
    let users = await store.getters.getUsers

    return {
      configuration: configuration,
      users: users
    }
  },
  methods: {
    changeTabs() {
      this.viewTab = false
      setTimeout(() => {
        this.viewTab = true
      }, 100);
    },
  }
}
</script>
  