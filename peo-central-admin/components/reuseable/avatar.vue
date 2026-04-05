<template>
    <v-avatar color="orange" :size="size"  v-if="data.image_url">
      <img :src="data.image_url" >
    </v-avatar>
    <v-avatar  color="orange" :size="size" v-else>
      <span class="white--text">
        {{data.first_name | firstLetter}} {{data.last_name | firstLetter}}
      </span>
    </v-avatar>                          
</template>
<script>
  export default {
    props:['size','data'],
    data: () => ({

    }),
    methods:{
        firstLetter(s){
            if (typeof s !== 'string') return ''
            return s.charAt(0).toUpperCase()
        },
    }
  }
</script>
