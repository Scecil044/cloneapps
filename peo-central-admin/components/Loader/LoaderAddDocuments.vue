<template>
  <div style="min-height: 30rem; width: 100%;" class="d-flex justify-center align-center">
    <div class="loader-circle-bar"></div>
  </div>
</template>

<script>
  export default {
  }
</script>

<style lang="css" scoped>
/* HTML: <div class="loader"></div> */
.loader-circle-bar {
  width: 100px;
  aspect-ratio: 1;
  display: grid;
  border: 4px solid #0000;
  border-radius: 50%;
  border-color: #ccc #0000;
  animation: l226 1s infinite linear;
}

.loader-circle-bar::before,
.loader-circle-bar::after {
  content: "";
  grid-area: 1/1;
  margin: 2px;
  border: inherit;
  border-radius: 50%;
}

.loader-circle-bar::before {
  border-color: #f03355 #0000;
  animation: inherit;
  animation-duration: .5s;
  animation-direction: reverse;
}

.loader-circle-bar::after {
  margin: 8px;
}

@keyframes l226 {
  100% {
    transform: rotate(1turn)
  }
}
</style>
