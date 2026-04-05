<template lang="">
  <div class="bg-loader" >
        <div class="loader-circle-bar"></div>
  </div>
</template>
<script>

export default {
}
</script>
<style scoped>
.bg-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.loader-circle-bar {
      width: 50px;
      aspect-ratio: 1;
      display: grid;
      border-radius: 50%;
      background:
        linear-gradient(0deg, rgb(0 0 0/50%) 30%, #0000 0 70%, rgb(0 0 0/100%) 0) 50%/8% 100%,
        linear-gradient(90deg, rgb(0 0 0/25%) 30%, #0000 0 70%, rgb(0 0 0/75%) 0) 50%/100% 8%;
      background-repeat: no-repeat;
      animation: l23 1s infinite steps(12);
    }

    .loader-circle-bar::before,
    .loader-circle-bar::after {
      content: "";
      grid-area: 1/1;
      border-radius: 50%;
      background: inherit;
      opacity: 0.915;
      transform: rotate(30deg);
    }

    .loader-circle-bar::after {
      opacity: 0.83;
      transform: rotate(60deg);
    }

    @keyframes l23 {
      100% {
        transform: rotate(1turn)
      }
    }


</style>
