<template>
  <div class="observer" />
</template>

<script>
export default {
  props: ['options'],
  data: () => ({
    observer: null,
  }),
  mounted() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      console.error('IntersectionObserver not supported in this browser');
      return;
    }

    const options = this.options || {}
    try {
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry && entry.isIntersecting) {
          this.$emit('intersect')
        }
      }, options)

      this.observer.observe(this.$el)
    } catch (error) {
      console.error('Error creating IntersectionObserver:', error);
    }
  },
  destroyed() {
    this.observer.disconnect()
  },
}
</script>
<style scoped>
.observer {
  height: 20px;
  width: 100%;
  background: transparent;
}
</style>
