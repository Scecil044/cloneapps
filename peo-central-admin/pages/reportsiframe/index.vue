<template fluid>
  <div>
    <iframe name="devFrame" id="devFrame" frameborder="0" width="100%" height="100%" scrolling="yes"></iframe>
  </div>

</template>

<script>

export default {
  layout: "dashboard",
  components: {
  },
  data: () => ({
  }),
  async asyncData({ app, store }) {
    const token = store.getters.getToken;
    const AuthStr = "Bearer ".concat(token);
  },
  mounted() {
    this.redirectToReport();
  },
  methods: {
    redirectToReport() {
      const token = this.$store.getters.getToken;
      const AuthStr = "Bearer ".concat(token);
      this.$axios.$get("/reports-configurators/report/token", this.emailBody, {
        headers: { Authorization: AuthStr },
      })
        .then((response) => {
          let url = `${process.env.REPORT_URL}/?token=${response.token}`
          const iframe = document.getElementById('devFrame')
          if (iframe) {
            iframe.src = url
          } else {
            console.error('Iframe not found')
          }
          iframe.onload = () => {
            console.log('Iframe loaded successfully')
          }
        })
        .catch((e) => console.log(e));
    }
  },
  computed: {
  },
};
</script>

<style lang="scss" scoped>
.grad1 {
  //   height: 350px;
  background-color: #1565c0;
  /* For browsers that do not support gradients */
  background-image: linear-gradient(#1565c0, #f5f5f5);
}

.colorBackgrnd {
  background-color: #237abc;
}

.bckgndimg {
  background-image: url("https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260");
  background-size: cover;
}

.swiperCustom {
  height: 150px;
}
</style>
<style scoped>
.swiper-container .swiper-container-initialized .swiper-container-horizontal {
  width: 100% !important;
}

.bgaliceblue {
  background: aliceblue;
}

.clients-image {
  mix-blend-mode: multiply;
  object-fit: contain !important;
  height: 100%;
}

.cardSingle {
  background-color: transparent;
  box-shadow: none;
}

.clientsText {
  font-size: 1.3rem;
  margin-bottom: 0;
}

.reportSkeleton .v-skeleton-loader__image .v-skeleton-loader__bone {
  height: 300px !important;
}

.swiperCustom {
  max-height: fit-content;
}

@media screen and (max-width: 900px) {
  .swiperOverflow {
    overflow: hidden !important;
  }
}

#navbar .swiper-container {
  max-width: 100% !important;
}
</style>