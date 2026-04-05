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
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">Collection</span>
                </v-col>
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">Field</span>
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
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">{{data.collection}}</span>
                </v-col>
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">{{data.field}}</span>
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
                <v-col cols="3">
                    <span class="grey-heading-text textFontSize font-weight-medium">Collection</span>
                </v-col>
                <v-col cols="2">
                    <span class="grey-heading-text textFontSize font-weight-medium">Field</span>
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
                <v-col cols="3" v-if="fieldKeys.length > 0">
                    <v-autocomplete :items="fieldKeys.map(item => item.module)" v-model="data.collection" @change="updateFields"></v-autocomplete>
                </v-col>
                <v-col cols="2"  v-if="fieldKeys.length > 0">
                    <v-autocomplete :items="fieldKeys.filter(item => item.module == data.collection)[0].keys"  v-model="data.field" @change="updateFields"></v-autocomplete>
                </v-col>
                <v-col cols="1"  v-if="fieldKeys.length > 0" style="display: flex;justify-content: center;">
                    <v-icon color="red" class="mr-2" small @click="removeFields(index)">fa-trash</v-icon>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12" class="text-right"  v-if="fieldKeys.length > 0">
            <v-btn class="short__btn " color="primary" @click="addNewKey();updateFields()">New</v-btn>
        </v-col>
    </v-row>
</template>

<script>


export default {
    props:["keys","module","edit"],
    data() {
        return {
            fieldKeys:[]
        }   
    },
    async mounted(){
        await this.getFields(this.module)
    },
    methods: {
        removeFields(index){
            this.keys.splice(index,1)
            this.updateFields()
        },
        updateFields(){
            this.$emit('updatefeilds',{keys:this.keys})
        },
        addNewKey(){
            this.keys.push(
                {
                    label:"",
                    key:"",
                    collection:this.fieldKeys[0].module,
                    field:this.fieldKeys[0].keys[0],
                }
            )
        },
        async getFields(module){
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.$axios.get(`form/getallfields?module=${module}`, { headers: { Authorization: AuthStr }})
            .then((response) => {
               this.fieldKeys = response.data.data
            })
            .catch(e => console.log(e))
        }
    },
}
</script>
