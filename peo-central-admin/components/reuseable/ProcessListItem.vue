<template>
  <v-list-item  selectable  class="py-0" :class="{ 'active-item': active }" @click="$emit('clicked')">
    <v-list-item-avatar size="40" v-if="avatarSrc">
      <v-img :src="avatarSrc" cover />
    </v-list-item-avatar>
    <div v-else class="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-semibold tw-text-sm tw-shrink-0" :class="getAvatarColorClass()">
      {{ getInitialLetter() }}
    </div>
    <v-list-item-content class="d-flex justify-space-between pl-4 align-center">
      <v-list-item-title class="font-weight-bold">
        <slot name="title"></slot>
      </v-list-item-title>
      <v-list-item-subtitle>
        <slot name="subtitle"></slot>&emsp;
        <v-row class="flex-nowrap gap " :class="hasSubtitleSlot ? 'mt-3' : ''">
          <slot name="tags"></slot>
        </v-row>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action v-if="hasActionSlot">
      <v-list-item-action-text>
        <slot name="action-text"></slot>
      </v-list-item-action-text>
      <slot name="action"></slot>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import customerDefaultIcon from '@/assets/images/icons/customer_default_icon.svg'

export default {
  components: {
    customerDefaultIcon,
  },
  props: {
    avatarSrc: String,
    active: Boolean,
    companyName: String,
  },
  computed: {
    hasSubtitleSlot () {
      return this.$slots['subtitle']
    },
    hasActionSlot () {
      return this.$slots['action']
    },
    hasActionTextSlot () {
      return this.$slots['action-text']
    }
  },
  methods: {
    getInitialLetter() {
      // Get the company name first, with proper fallback handling
      let name = this.companyName;
      
      // If no company name, try to get from title slot
      if (!name && this.$slots.title && this.$slots.title[0] && this.$slots.title[0].text) {
        name = this.$slots.title[0].text;
      }
      
      // Clean and validate the name
      if (name && typeof name === 'string') {
        name = name.trim();
        if (name.length > 0) {
          // Get first alphabetic character
          const firstChar = name.match(/[a-zA-Z]/);
          if (firstChar) {
            return firstChar[0].toUpperCase();
          }
        }
      }
      
      // Default fallback
      return 'C';
    },
    getAvatarColorClass() {
      const letter = this.getInitialLetter();
      const colors = [
        'tw-bg-blue-500',
        'tw-bg-green-500',
        'tw-bg-purple-500',
        'tw-bg-pink-500',
        'tw-bg-indigo-500',
        'tw-bg-red-500',
        'tw-bg-yellow-500',
        'tw-bg-teal-500',
        'tw-bg-orange-500',
        'tw-bg-cyan-500',
        'tw-bg-lime-500',
        'tw-bg-emerald-500',
        'tw-bg-violet-500',
        'tw-bg-fuchsia-500',
        'tw-bg-rose-500',
        'tw-bg-amber-500',
        'tw-bg-sky-500',
        'tw-bg-blue-600',
        'tw-bg-green-600',
        'tw-bg-purple-600',
        'tw-bg-pink-600',
        'tw-bg-indigo-600',
        'tw-bg-red-600',
        'tw-bg-yellow-600',
        'tw-bg-teal-600',
        'tw-bg-orange-600'
      ];

      // Ensure we have a valid letter for color calculation
      if (!letter || typeof letter !== 'string') {
        return 'tw-bg-gray-500'; // Default color for invalid letters
      }

      const charCode = letter.charCodeAt(0);
      const colorIndex = charCode % colors.length;
      return colors[colorIndex];
    }
  }
}
</script>

<style scoped>
.active-item {
  background-color: rgba(25, 118, 210, 0.08) !important;
  border-left: 4px solid #1976d2 !important;
}

.active-item:hover {
  background-color: rgba(25, 118, 210, 0.12) !important;
}
</style>
