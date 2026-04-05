<template lang="">
  <v-container fluid>
    <SnackBar :data="snackbar_data" />
    <v-row>
      <v-card id="card">
        <v-row>
          <v-col cols="12" class="mb-5">
            <h4>Send Mail</h4>
          </v-col>
          <v-col cols="12">
            <div class="d-flex align-center" style="gap: 1rem">
              <h6 class="mb-5" style="min-width: 100px">From</h6>
              <v-text-field
                placeholder="example@mail.com"
                single-line
                outlined
                dense
                v-model="from_email"
                :rules="email_rule"
              ></v-text-field>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="d-flex align-center" style="gap: 1rem">
              <h6 class="mb-5" style="min-width: 100px">Send To</h6>
              <v-combobox
                placeholder="example@mail.com"
                single-line
                outlined
                dense
                chips
                clearable
                multiple
                v-model="to_email"
                :rules="main_rule"
              >
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip
                    v-bind="attrs"
                    :model-value="selected"
                    closable
                    label
                    small
                    @click="select"
                    @click:close="removeToEmail(item)"
                  >
                    {{ item }}
                  </v-chip>
                </template>
              </v-combobox>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="d-flex align-center" style="gap: 1rem">
              <h6 class="mb-5" style="min-width: 100px">Cc</h6>
              <v-combobox
                placeholder="example@mail.com"
                single-line
                outlined
                dense
                chips
                clearable
                multiple
                v-model="cc_email"
                :rules="main_rule"
              >
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip
                    v-bind="attrs"
                    :model-value="selected"
                    closable
                    label
                    small
                    @click="select"
                    @click:close="removeCCEmail(item)"
                  >
                    {{ item }}
                  </v-chip>
                </template>
              </v-combobox>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="d-flex align-center" style="gap: 1rem">
              <h6 class="mb-5" style="min-width: 100px">Subject</h6>
              <v-text-field
                placeholder="Enter Subject"
                single-line
                outlined
                dense
                v-model="subject_email"
                :rules="main_rule"
              ></v-text-field>
            </div>
          </v-col>
          <v-col cols="12" class="quill-col">
            <client-only>
              <quill-editor
                ref="editor"
                :value="content"
                @change="onEditorChange"
                :options="editorOption"
                @blur="onEditorBlur($event)"
                @focus="onEditorFocus($event)"
                @ready="onEditorReady($event)"
              />
            </client-only>
          </v-col>
          <v-col cols="12">
            <div class="d-flex align-center" style="gap: 1rem">
              <v-checkbox
                v-model="attach_customer_statement"
                label="Attach Customer Statement"
              ></v-checkbox>
            </div>
          </v-col>
          <v-col cols="12">
            <div class="d-flex align-center" style="gap: 1rem">
              <v-btn
                class="tall__btn"
                color="primary"
                outlined
                @click.prevent="handleCancel"
                >Cancel</v-btn
              >
              <v-btn
                class="tall__btn"
                color="primary"
                @click.prevent="handleSendMail"
                >Send Mail</v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-row>
  </v-container>
</template>
<script>
import debounce from 'lodash/debounce'
import { mapMutations } from 'vuex'
import SnackBar from '@/components/utils/SnackBar.vue'
export default {
  layout: 'dashboard',
  data() {
    return {
      //rules
      main_rule: [(v) => !!v || 'This filed is required'],
      email_rule: [
        (v) => !!v || 'Email is required',
        (v) => /.+@.+/.test(v) || 'E-mail must be valid',
        (v) => v === v.toLowerCase() || 'E-mail must be in lowercase',
      ],

      //snackbar
      snackbar_data: { snackbar: false, text: '', color: '', timeout: 2000 },

      //email details
      from_email: '',
      invoice_id: '',
      to_email: [],
      cc_email: [],
      subject_email: '',
      body_email: '',
      attach_customer_statement: false,
      //quill editor on save and mail
      content: '',
      editorOption: {
        // Some Quill options...
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
            [{ indent: '-1' }, { indent: '+1' }],
            [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            [{ color: [] }, { background: [] }], // dropdown with defaults from theme
            [{ font: [] }],
            [{ align: [] }],
            ['link', 'image'],
          ],
        },
      },
    }
  },
  mounted() {
    this.setShowLoader(true)
    const { params } = this.$route
    if (Object.keys(params).length > 1) {
      console.log('params', params)
      this.from_email = params.from
      this.to_email.push(params.send_to)
      params.cc !== null && this.cc_email.push(params.cc)
      this.content = params.emailTemplate
      this.subject_email = params.Subject
      this.invoice_id = params.invoice_id
      this.setShowLoader(false)
    } else {
      this.setShowLoader(false)
      this.snackbar_data = {
        snackbar: true,
        text: 'Failed to Load Data',
        color: 'danger',
        icon: 'info',
        timeout: 2000,
      }
    }
  },
  methods: {
    ...mapMutations(['setShowLoader']),

    //quill methods onEditorBlur, onEditorFocus, onEditorReady
    onEditorBlur(editor) {
      console.log('editor blur!', editor)
    },
    onEditorFocus(editor) {
      console.log('editor focus!', editor)
    },
    onEditorReady(editor) {
      console.log('editor ready!', editor)
    },
    onEditorChange: debounce(function (value) {
      this.content = value.html
    }, 466),
    removeToEmail(item) {
      this.to_email.splice(this.to_email.indexOf(item), 1)
    },
    removeCCEmail(item) {
      this.cc_email.splice(this.cc_email.indexOf(item), 1)
    },
    handleCancel() {
      this.$router.replace('/sales')
    },
    handleSendMail() {
      const AuthStr = 'Bearer '.concat(this.$store.state.token)
      this.setShowLoader(true)
      let payload = {
        from: this.from_email,
        send_to: this.to_email,
        cc: this.cc_email.length ? this.cc_email : null,
        Subject: this.subject_email,
        emailTemplate: this.content,
      }
      this.$axios
        .$post(`invoice/send-email?invoice=${this.invoice_id}`, payload, {
          headers: { Authorization: AuthStr },
        })
        .then((res) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Mail has been sent Successfully',
            color: 'success',
            icon: 'check',
            timeout: 2000,
          }
          setTimeout(() => {
            this.$router.replace('/sales')
          }, 1500)
        })
        .catch((err) => {
          this.snackbar_data = {
            snackbar: true,
            text: 'Failed to Send Mail',
            color: 'danger',
            icon: 'info',
            timeout: 2000,
          }
        })
        .finally(() => {
          this.setShowLoader(false)
        })
    },
  },
  watch: {
    to_email: {
      handler(newVal) {
        let isMatching = true
        newVal.forEach((item) => {
          let match = /.+@.+/.test(item)
          if (!match) {
            isMatching = false
            return
          }
        })
        //remove duplicate emails
        // newVal.filter((item, index) => newVal.indexOf(item) === index)

        if (!isMatching) {
          this.snackbar_data = {
            snackbar: true,
            text: 'Please give valid Email',
            color: 'orange',
            icon: 'info',
            timeout: 2000,
          }
        }
      },
      deep: true,
    },
  },
}
</script>
<style lang="scss"></style>
