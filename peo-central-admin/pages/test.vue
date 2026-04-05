<template>
  <div>
    <client-only>
      <ModifyDocument :documentName="'test'" :content="''" :elements="{ 'text': [], table: [], image: [], }" />
    </client-only>
  </div>
</template>

<script>

export default {
  components: {
    ModifyDocument: () => { if (process.client) { return import('@/components/configurations/word-editor/wordeditor.vue') } },
  },
  data() {
    return {}
  },
}
</script>
<style>
@import "https://cdn.syncfusion.com/ej2/material.css";
</style>