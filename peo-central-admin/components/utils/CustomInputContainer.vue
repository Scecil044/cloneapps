<template>
    <div class="cic__container">
        <label class="text--text">
        <slot name="label">
            {{ label }}
        </slot>
        <span class=" tw-ml-2 red--text" v-if="mandatory"> *</span></label>
        <div class="tw-mt-2">
          <slot name="input"></slot>
        </div>
    </div>
</template>

<script>
// import '@/assets/scss/utils/_customInput.scss'
export default {
    props: {
        mandatory:{
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: 'Label'
        }
    }
}
</script>
