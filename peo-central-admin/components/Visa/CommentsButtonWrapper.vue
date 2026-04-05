<template>
  <div>
    <template v-if="hasUnread">
      <v-badge color="pink" dot mode="" offset-x="10" offset-y="10">
        <v-btn icon color="purple" title="load comments" @click="loadComments">
          <v-icon small color="">
            mdi-chat-processing-outline
          </v-icon>
        </v-btn>
      </v-badge>
    </template>
    <template v-else>
      <v-btn icon color="purple" title="load comments" @click="loadComments">
        <v-icon small color="">
          mdi-chat-processing-outline
        </v-icon>
      </v-btn>
    </template>
  </div>
</template>

<script>
export default {
  name: 'comments-button-wrapper',
  props: {
    comments: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      showComments: false
    }
  },
  computed: {
    hasUnread() {
      const unread = this.comments.filter(comment => !comment.isRead)
      return unread.length > 0
    }
  },
  methods: {
    toggleComments() {
      this.showComments = !this.showComments
    },
    async loadComments(event) {
      this.$emit('click:loadComments', event)
    }
  }
}
</script>

<style lang="scss" scoped></style>
