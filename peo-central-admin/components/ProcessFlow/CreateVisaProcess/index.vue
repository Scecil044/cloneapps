
<template></template>
<script>
export default {
    props: {
        process_type: String,
        module: String,
        foreign_id: String,
        identifier: String,
    },
    data() {
        return {

        }
    },
    async mounted() {
        await this.creatVisaProcess()
    },
    methods: {
        successfull() {
            this.$emit('successfull')
        },
        async creatVisaProcess() {
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            this.loading = true
            const proDetails = await this.$axios.$post(`/generic/process/proDetails/${this.module}/` + this.foreign_id, { headers: { Authorization: AuthStr } })

            let obj = {
                process_type: this.process_type,
                id: this.foreign_id,
                process_id: this.identifier,
                module: this.module,
                identifier: this.identifier,
                foreign_id: this.foreign_id,
                assigned_pro : proDetails.assigned_pro ? proDetails.assigned_pro : ""
            }

            await this.$axios.$post(`/generic/process/createVisaProcess`, obj, { headers: { Authorization: AuthStr } })
                .then(response => {
                    this.successfull()
                })
                .catch(e => console.log(e))
        },
    },
}
</script>