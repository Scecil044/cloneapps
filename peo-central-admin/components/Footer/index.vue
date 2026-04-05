<template>
  <v-row class="footer">
    <v-col cols="12" style="min-height: 320px">
      <v-card color="card_bg" id="card" style="width: 100%">
        <v-card-text class="flex_row align-center justify-space-between px-5">
          <div class="flex_column justify-center">
            <div class="d-flex align-start" style="gap: 1.5rem">
              <v-btn icon><FacebookIcon /></v-btn>
              <v-btn icon><InstaIcon /></v-btn>
              <v-btn icon><LinkedInIcon /></v-btn>
              <v-btn icon><FacebookIcon /></v-btn>
            </div>
            <p class="text--text pt-2">
              © Eat and Drink Restaurant, all rights reserved.
            </p>
          </div>
          <div class="flex_column align-center justify-center">
            <v-img
              src="/eat_and_drink_logo2.webp"
              class="mx-auto"
              max-width="140"
              max-height="75"
              style=""
            ></v-img>
            <p class="text--text pt-2">Accounting Software</p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import NathanDigitalDarkLogo from '@/assets/images/nathandigital-dark-logo.svg'
import FacebookIcon from '@/assets/images/icons/fb-icon.svg'
import LinkedInIcon from '@/assets/images/icons/linkedin-icon.svg'
import InstaIcon from '@/assets/images/icons/insta-icon.svg'

export default {
  components: { NathanDigitalDarkLogo, FacebookIcon, LinkedInIcon, InstaIcon },
  data: () => ({}),
}
</script>

<style></style>
