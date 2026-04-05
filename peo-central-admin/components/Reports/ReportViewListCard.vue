<template>
    <div class="wrapper">
        <div v-for="(item, index) in data" :key="index" class="cards__con d-inline-block mr-5 mb-5" @click="handleClicked(value)">
            <v-card class="cards_card d-flex flex-row align-center justify-space-around px-5" max-width="370" min-width="370" height="75" style="border: 1px solid #E2E7F1;box-shadow: none;">
                <div class="flex_row align-center justify-space-between">
                    <div class="lighten-3 primary ma-0 mr-3" style="border-radius: 10px;padding: 10px 15px;"><v-icon color="primary" class="ma-0 mx-auto pa-0">fa-regular fa-file</v-icon></div>
                    <h5 class="text--text ma-0 pa-0">{{ item.name }}</h5>
                </div>
                <v-spacer></v-spacer>
                <v-btn icon color="yellow">
                    <v-icon v-if="item.isFav" color="yellow" class="ma-0 pa-0" small>fa-star</v-icon>
                    <v-icon v-else color="outline" class="ma-0 pa-0" small>fa-regular fa-star</v-icon>
                </v-btn>
            </v-card>
        </div>
    </div>
</template>

<script>
export default {
    props:{ data: Array },
    methods: {
        handleClicked(value) {
            if(value==='Trial Balance') {
                this.$emit('clicked', value)
            }
        },
    }
}
</script>

<style>

</style>