
<template></template>
<script>
export default {
    props: {
        updateModuleData: Object,
        module: String,
        foreign_id: String,
        identifier: String,
    },
    data() {
        return {

        }
    },
    async mounted() {
        await this.updateModule()
    },
    methods: {
        successfull() {
            this.$emit('successfull')
        },
        async updateModule() {
            const AuthStr = 'Bearer '.concat(this.$store.state.token)
            let project = {}
            project[this.updateModuleData.foreign_id] = 1
            await this.$axios.$post(`/generic/process/getmoduledata`, { "module": this.module, "filter": { "_id": this.foreign_id }, 'project': project }, { headers: { Authorization: AuthStr } })
                .then(async (res) => {
                    let updateID = res[0][this.updateModuleData.foreign_id]
                    await this.$axios.$post(`/generic/process/updatemoduledata`, { "module": this.updateModuleData.module, "filter": { "_id": updateID }, 'update': this.updateModuleData.data }, { headers: { Authorization: AuthStr } })
                        .then(async (response) => {
                            this.successfull()
                        })
                })
                .catch(e => { console.log(e) })
        },
    },
}
</script>