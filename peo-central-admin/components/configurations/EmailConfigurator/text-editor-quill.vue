<template>
  <div>
    <div v-if="dynamicVariables && dynamicVariables.length" class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-2 tw-mb-4">
      <v-btn v-for="(data, index) in dynamicVariables" :key="index" class="pa-4 ma-2 tw-hover:shadow-md tw-transition-all tw-duration-300" color="info" @click="updatePlaceholders(data.key)" elevation="3" plain width="150">
        <span class="dynamic-var-font">{{ data.label }}</span>
      </v-btn>
    </div>
    <div class="pa-0">
      <div class="tw-overflow-y-auto" :style="{ height: `${height ? height : '340px'}` }">
        <quill-editor :content="body" class="editor" style="height:100%" ref="myQuillEditor" v-model="localValue"
          :options="editorOption" @change="onEditorChange($event)" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ["body", "dynamicVariables", "height", "value"],
  data() {
    return {
      quil: null,
      localValue: this.value || this.body, // Initialize local value with prop value
      editorOption: {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ]
        },

      },
    }
  },
  watch: {
    // Watch for changes in the prop and update the local value
    value(newValue) {
      this.localValue = newValue;
    }
  },
  methods: {
    updatePlaceholders(value) {
      const q = this.$refs.myQuillEditor;
      var caretPosition = q.quill.getSelection(true);
      q.quill.insertText(caretPosition, value);
    },
    onEditorChange({ html, text }) {

      this.$emit("texteditor", this.body);
      this.$emit("input", this.localValue);
    }
  },
};
</script>

<style>
.editor-container {
  height: 100%;
}
</style>
