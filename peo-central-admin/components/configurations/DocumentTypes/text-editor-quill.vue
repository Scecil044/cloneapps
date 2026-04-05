<template>
  <div>
    <v-row>
      <v-col cols="4">
        <v-list two-line class="mt-n3" style="width:100%" v-if="dynamicVariables != ''">
          <v-list-item-group color="primary" v-for="(data, index) in dynamicVariables" :key="index">
            <template>
              <v-btn class="pa-4 ma-4" color="info" @click="updatePlaceholders(data.key)" elevation="3" plain width="150">
                <span class="dynamic-var-font">{{ data.label }}</span>
              </v-btn>
            </template>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="8">
        <quill-editor class="editor" :style="{ 'height': '340px' }" ref="myQuillEditor" :content="body"
          :options="editorOption" @change="onEditorChange($event)" />
      </v-col>
    </v-row>
    <v-row>

    </v-row>
  </div>
</template>

<script>

export default {
  props: ["body", "dynamicVariables"],
  data() {
    return {
      quil: null,
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
  mounted() {
    console.log(this.dynamicVariables)
  },
  methods: {


    updatePlaceholders(value) {
      const q = this.$refs.myQuillEditor;
      var caretPosition = q.quill.getSelection(true);
      q.quill.insertText(caretPosition, value);
    },
    onEditorChange({ html, text }) {
      this.$emit("texteditor", html)
    }
  },
  computed: {

  }
};
</script>

<style>
.editor-container {
  height: 100%;
}
</style>