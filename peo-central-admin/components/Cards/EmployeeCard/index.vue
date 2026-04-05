<template>
  <v-row>
    <v-col cols="12" class="pl-0 pr-0">
      <div class="custom_customer_cards">
        <template>
          <v-card v-for="employees in employeeCardData" :key="employees.id" class="customer_card mb-5" style="text-align: center" @click="EmployeeDialog(),ClickedId(employees.id)">
            <template>
              <div class=" d-flex align-center flex-column justify-start " >
                <v-avatar class="mt-6" size="100px">
                  <v-img alt="Avatar" :src="employees.image_url" v-if="employees.image_url" />
                  <customerDefaultIcon style="border-radius: 50px" v-else />
                </v-avatar>
                <div>
                  <span class="cardBtn accent4 white--text" v-if="employees.user_status == 'active'">{{ employees.user_status }}</span >
                  <span class="cardBtn subtext white--text" v-else-if="employees.user_status == 'inactive'">{{ employees.user_status }}</span >
                  <span class="cardBtn accent3 white--text" v-else-if="employees.user_status == 'onboarding'">{{ employees.user_status }}</span >
                  <span class="cardBtn light_accent1 white--text" v-else-if="employees.user_status == 'offboarding'">{{ employees.user_status }}</span >
                  <span class="cardBtn primary white--text" v-else-if="employees.user_status == 'visa process'">{{ employees.user_status }}</span >
                  <span class="cardBtn secondary white--text" v-else>{{ employees.user_status }}</span >

                </div>
              </div>
            </template>
            <v-card-title class="d-flex align-center justify-center pt-0 customerCard__title">
              {{ employees.first_name }} {{ employees.middle_name }} {{ employees.last_name }}
            </v-card-title>
          </v-card>
        </template>
            <!-- Observer -->
            <!-- <Observer @intersect="intersectedEmployees" /> -->
      </div>
    </v-col>
  </v-row>
</template>
<script>
import Observer from '~/components/Observer.vue'
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'


export default {
  components:{
    Observer,
    customerDefaultIcon,
  },
  props: { employeeCardData: Array, EmployeeDialog: Function ,
    selectedCustomer: String },
  data() {
    return {
    

    
    }
  },
  methods:{
    ClickedId(val){
      this.$emit('employeeClickedId', val)
      // console.log('employee id ==?', val);
    }
  },
  mounted() {

  },
}
</script>
