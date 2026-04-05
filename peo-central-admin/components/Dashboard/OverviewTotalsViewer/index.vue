<template>
    <div class="d-flex flex-row justify-space-between flex-wrap">
        <div class="mb-6 mr-6" v-for="item in data" :key="item.name" style="width: 150px !important;">
            <p>{{ item.name }}</p>
            <h4 class="text--text total__lb pl-3" style="border-left: 3px solid red" :style="{ borderColor: item.color }">{{ item.amount| twoDecimals}}</h4>
        </div>
    </div>
</template>

<script>
export default {
    props: { data: Array },
    data() {
        return {
            red: 'red',
            data: ['red', 'black']
        }
    }
}
</script>