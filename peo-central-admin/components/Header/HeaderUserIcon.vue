<template>
  <div class="tw-flex tw-relative tw-items-center md:tw-order-2 tw-space-x-1 md:tw-space-x-0 rtl:tw-space-x-reverse user-email-container">
    <!-- User button -->
    <button type="button"
      class="tw-inline-flex tw-border tw-border-gray-200 tw-shadow-lg tw-items-center tw-font-medium tw-justify-center tw-px-4 tw-py-2 tw-text-sm tw-text-gray-900 dark:tw-text-white tw-rounded-lg tw-cursor-pointer tw-bg-gradient-to-r tw-from-blue-50 tw-to-green-50 tw-hover:bg-gradient-to-r tw-hover:tw-from-blue-100 tw-hover:tw-to-green-100 dark:tw-hover:bg-gray-700 dark:tw-hover:text-white tw-gap-2 tw-transition-all tw-duration-200 tw-hover:tw-shadow-xl tw-hover:tw-scale-105 tw-hover:tw-border-blue-400 tw-group"
      @click="toggleLanguageDropdown">
      <img :src="userAvatar" class="tw-h-7 tw-w-7 tw-mr-2 tw-rounded-full tw-border tw-border-gray-300 tw-object-cover tw-shadow-md tw-transition-all tw-duration-200 group-hover:tw-shadow-lg group-hover:tw-scale-110 user-avatar" alt="User Icon">
      <span class="tw-font-semibold tw-mr-1">{{ userEmail }}</span>
      <svg class="tw-w-4 tw-h-4 tw-ml-1 tw-text-blue-500 group-hover:tw-text-green-500 tw-transition-colors tw-duration-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
    </button>

    <!-- Dropdown menu -->
    <div
      class="tw-z-50 tw-my-4 tw-absolute tw-top-8 tw-border tw-border-gray-200 tw-right-0 tw-text-base tw-list-none tw-bg-white tw-divide-y tw-divide-gray-100 tw-rounded-lg tw-shadow-sm dark:tw-bg-gray-700"
      :class="{ 'tw-hidden': !isDropdownOpen }">
      <ul class="tw-py-2 tw-px-2 tw-font-medium" role="menu">
        <li  class="tw-border-b tw-border-gray-100 tw-w-full">
          <NuxtLink to="/settings"
            class="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 dark:tw-text-gray-400 dark:tw-hover:bg-gray-600 dark:tw-hover:text-white"
            role="menuitem" >
            <div class="tw-inline-flex tw-items-center tw-gap-2">
              <span class="tw-inline-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-purple-100 tw-p-1">
                <svg class="tw-w-5 tw-h-5 tw-text-purple-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.4a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.22.65.22 1v.09A1.65 1.65 0 0 0 21 12c0 .35-.08.69-.22 1z"/></svg>
              </span>
              <span>Configurator</span>
            </div>
          </NuxtLink>
        </li>
        <li  class="tw-w-full">
          <button @click="$emit('logout')"
            class="tw-block tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 dark:tw-text-gray-400 dark:tw-hover:bg-gray-600 dark:tw-hover:text-white"
            role="menuitem" >
            <div class="tw-inline-flex tw-items-center tw-gap-2">
              <span class="tw-inline-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-red-100 tw-p-1">
                <svg class="tw-w-5 tw-h-5 tw-text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
              </span>
              <span>Log out</span>
            </div>
          </button>
        </li>
      </ul>
    </div>

    <!-- Mobile menu toggle button -->
    <button type="button"
      class="tw-inline-flex tw-items-center tw-p-2 tw-w-10 tw-h-10 tw-justify-center tw-text-sm tw-text-gray-500 tw-rounded-lg md:tw-hidden tw-hover:bg-gray-100 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-gray-200 dark:tw-text-gray-400 dark:tw-hover:bg-gray-700 dark:tw-focus:ring-gray-600"
      aria-controls="navbar-language" aria-expanded="false" @click="toggleMobileMenu">
      <span class="tw-sr-only">Open main menu</span>
      <svg class="tw-w-5 tw-h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M1 1h15M1 7h15M1 13h15" />
      </svg>
    </button>
  </div>
</template>

<script>

export default {
  name: 'UserMenu',
  data() {
    return {
      isDropdownOpen: false,
      isMobileMenuOpen: false,
      selectedLanguage: 'en',
    };
  },
  computed: {
    userEmail() {
      return this.$store.getters.getThisUser
    },
    userAvatar() {
      const user = this.$store.state.user || this.$store.getters.getUserInfo || {};
      return user.image_url || 'https://peo-central.s3.eu-central-1.amazonaws.com/doc-attachment_636b84fbc6eafb0d4e67f8e1_1753350626269_user.jpg/user.jpg';
    }
  },
  methods: {
    toggleLanguageDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      this.$emit('toggle-mobile-menu', this.isMobileMenuOpen);
    },
    selectLanguage(code) {
      this.selectedLanguage = code;
      this.isDropdownOpen = false;
      this.$emit('language-changed', code);
    },
    closeDropdown(e) {
      if (!this.$el.contains(e.target)) {
        this.isDropdownOpen = false;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.closeDropdown);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDropdown);
  }
};
</script>
