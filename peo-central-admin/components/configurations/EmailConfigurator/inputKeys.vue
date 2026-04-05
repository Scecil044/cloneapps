<template>
    <v-row v-if="!edit">
        <v-col cols="12">
            <v-row >
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">Label</span>
                </v-col>
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">Key</span>
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row v-for="(data,index) in keys" :key="index">
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">{{data.label}}</span>
                </v-col>
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">{{data.key}}</span>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
    <v-row v-else>
        <v-col cols="12">
            <v-row >
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">Label</span>
                </v-col>
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">Key</span>
                </v-col>
                <v-col cols="5">
                
            </v-col>
                <v-col cols="1">
                <span class="grey-heading-text textFontSize font-weight-medium">Actions</span>
            </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row v-for="(data,index) in keys" :key="index">
                <v-col cols="3">
                    <v-text-field v-model="data.label" @input="updateFields"></v-text-field>
                </v-col>
                <v-col cols="3">
                    <v-text-field v-model="data.key" @input="updateFields"></v-text-field>
                </v-col>
                <v-col cols="5">
                
            </v-col>
                <v-col cols="1"  v-if="keys.length > 0" style="display: flex;justify-content: center;">
                <v-icon color="red" class="mr-2" small @click="removeFields(index)">fa-trash</v-icon>
            </v-col>
            </v-row>
        </v-col>
        <v-col cols="12" class="text-right" >
            <v-btn class="short__btn " color="primary" @click="addNewKey();updateFields()">New</v-btn>
        </v-col>
    </v-row>
 </template>
 
 <script>
 
 
 export default {
     props:["keys" ,"edit"],
     data() {
         return {
         }   
     },
     methods: {
        updateFields(){
            this.$emit('updatefeilds',{keys:this.keys})
        },
        addNewKey(){
            this.keys.push(
                {
                    label:"",
                    key:"",
                }
            )
        },
        removeFields(index){
            this.keys.splice(index,1)
            this.updateFields()
        },
     },
 }
 </script>
 