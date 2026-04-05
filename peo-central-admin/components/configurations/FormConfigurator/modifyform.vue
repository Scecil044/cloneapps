<template>
  <div>
    <fm-generate-form :data="jsonData" :remote="remoteFuncs" :value="editData" ref="generateForm">
      
    </fm-generate-form>
    <!-- <el-button type="primary" @click="handleSubmit">提交</el-button> -->
  </div>
</template>

<script>
import Vue from 'vue'
import FormMaking from 'form-making'
import 'form-making/dist/FormMaking.css'
Vue.use(FormMaking)

  export default {
    data () {
      return {
        jsonData: {"list":[],"config":{"labelWidth":100,"labelPosition":"right","size":"small"}},
        editData: {},
        remoteFuncs: {
          
        }
      }
    },
    methods: {
      handleSubmit () {
        this.$refs.generateForm.getData().then(data => {
          // data check success
          // data - form data
        }).catch(e => {
          // data check failed
        })
      }
    }
  }
</script>