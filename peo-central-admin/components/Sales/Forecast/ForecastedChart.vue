<template>
    <v-card color="card_bg" id="card">
        <v-card-title id="card-title">
        <h4>Forecasted & Target Sales</h4>
        <div class="flex_row justify-space-between align-center">
            <v-btn class="small__btn" style="border-radius: 5px !important;" color="primary" x-small>M</v-btn>
            <v-btn class="small__btn ml-1" style="border-radius: 5px !important;" outlined color="outline" x-small>W</v-btn>
            <v-btn class="small__btn ml-1" style="border-radius: 5px !important;" outlined color="outline" x-small>Y</v-btn>
        </div>
        </v-card-title>
        <v-card-text id="card-text">
        <div class="flex_row align-center justify-space-around">
            <h5 class="flex_row align-center">
            <div class="dote mr-3 accent2" style="min-width: 5px;max-width: 5px;min-height: 25px;border-radius: 3px;"></div>
            Closed Sales (29)
            </h5>
            <h5 class="flex_row align-center">
            <div class="dote mr-3 primary" style="min-width: 5px;max-width: 5px;min-height: 25px;border-radius: 3px;"></div>
            Forecasted Sales (15)
            </h5>
        </div>
        <div class="graph__con pt-9">
            <div style="background: #E2E7F1; min-width: 85%; min-height: 50px;border-radius: 10px;border: 3px solid #E2E7F1;">
            <div class="flex_row align-center justify-end" style="background: #F3654A; max-width: 80%; min-height: 50px;border-radius: 10px;border: 3px solid #E2E7F1;">
                <div style="margin-right: -30px;background: yellowgreen; min-width: 50%; min-height: 50px;border-radius: 10px;border: 5px solid yellowgreen;"></div>
            </div>
            </div>
        </div>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: [],
    data() {
        return {}
    }

}
</script>

<style>

</style>