<template>
    <div class="customers_wrapper">
        <CustomerCard :data="CustomerCard"/>
        <CustomerDataDetails/>

     
    </div>

</template>
<script>

import CustomerCard from '~/components/Cards/CustomerTopCard/index.vue'
import CustomerDataDetails from '~/components/CustomersCardData/index.vue'
export default {
    
    components:{
        CustomerCard,
        CustomerDataDetails
    },
    data() {
        return {
            // CustomerCard:[
            //      {
            //   status: 'Total Customer',
            //   count: '15',
             
            //     },
            //     {
            //   status: 'Active Customer',
            //   count: '12',
             
            //     },
            //     {
            //  status: 'Inactive Customers',
            //   count: '25',
             
            //     },
            //     {
            //  status: 'Customers Added Today',
            //   count: '25',
             
            //     },
            // ],
        }
    },
}
</script>