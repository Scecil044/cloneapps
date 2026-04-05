<template>
  <v-list-item :key="comment.created_at" class="comment-card elevation-1 mb-2">
    <v-list-item-avatar size="44">
      <v-img
        :src="comment?.author?.image_url"
        class="elevation-2"
        :alt="comment?.author?.first_name || 'User'"
        v-if="comment?.author?.image_url"
      />
      <v-avatar v-else color="primary" class="white--text">
        {{ getInitials(comment?.author) }}
      </v-avatar>
    </v-list-item-avatar>

    <v-list-item-content>
      <div class="d-flex align-center justify-space-between mb-1">
        <div>
          <span class="font-weight-bold text--primary">{{ comment?.author?.first_name }} {{ comment?.author?.last_name }}</span>
          <span class="grey--text text--darken-1 ml-2">{{ comment?.author?.email }}</span>
        </div>
        <div class="d-flex align-center">
          <v-icon class="mr-1" small color="grey">mdi-calendar</v-icon>
          <span class="caption grey--text">{{ comment.created_at | formatDateWithoutTime }}</span>
        </div>
      </div>
      <v-list-item-subtitle>
        <p class="mb-2 comment-text">{{ comment?.text }}</p>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action class="d-flex flex-column align-end">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon small color="primary" class="mb-1" v-bind="attrs" v-on="on" @click="editComment">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>Edit</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon small color="error" v-bind="attrs" v-on="on" @click="deleteComment">
            <v-icon small>mdi-delete-outline</v-icon>
          </v-btn>
        </template>
        <span>Delete</span>
      </v-tooltip>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
export default {
  name: 'comment-card',
  props: {
    comment: {
      type: Object,
      required: true
    }
  },
  methods: {
    editComment() {
      return this.$emit('click:edit', this.comment)
    },
    deleteComment() {
      return this.$emit('click:delete', this.comment)
    },
    getInitials(author) {
      if (!author) return ''
      const first = author.first_name ? author.first_name.charAt(0) : ''
      const last = author.last_name ? author.last_name.charAt(0) : ''
      return (first + last).toUpperCase()
    }
  }
}
</script>

<style lang="scss" scoped>
.comment-card {
  border-radius: 12px;
  background: #fafbfc;
  transition: box-shadow 0.2s, background 0.2s;
  &:hover {
    background: #f0f4f8;
    box-shadow: 0 2px 12px rgba(60,60,60,0.07);
  }
  padding: 8px 0 8px 8px;
}
.comment-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0;
  word-break: break-word;
}
.v-list-item__avatar {
  margin-right: 16px;
}
.v-list-item-action {
  min-width: 48px;
}
</style>
