<template>
<div>
  <v-row>
    <v-col cols="12">
      <quill-editor class="editor" :style="{'height': '340px'}" ref="myQuillEditor"  :content="body" :options="editorOption" @change="onEditorChange($event)"/>
    </v-col>
  </v-row>
  <v-divider></v-divider>
    <v-row>
      <v-col cols="4" v-for="(item, index) of dynamicVariables" :key="index">
        <v-btn
          class="pa-4"
          color="info"
          elevation="3"
          plain
          @click="updatePlaceholders(item.key)"
          width="150"
        >
          <span class="dynamic-var-font">{{ item.label }}</span>
        </v-btn>
      </v-col>
    </v-row>
</div>
</template>

<script>

  export default {
    props:["body","dynamicVariables"],
    data () {
      return {
        quil : null,
        editorOption: {
          modules: {
            toolbar: [ 
              ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],               // custom button values
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
              [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
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
    methods:  {
                           

      updatePlaceholders(value) {
          const q = this.$refs.myQuillEditor;
          var caretPosition = q.quill.getSelection(true);
          q.quill.insertText(caretPosition, `<<${value}>>`);
      },
      onEditorChange({ html, text }) {
        this.$emit("texteditor", html)
      }
    },
    computed:{
      
    }
  };
</script>

<style>
.editor-container {
  height: 100%;
}
</style>