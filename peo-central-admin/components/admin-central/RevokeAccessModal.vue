<template>
  <CommonModal 
    :open="open"
    title="Revoke Portal Access"
    :message="message"
    type="warning"
    confirmText="Revoke Access"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  >
    <template v-slot:icon>
      <svg class="tw-w-full tw-h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </template>
  </CommonModal>
</template>

<script>
import CommonModal from '@/components/Common/CommonModal.vue';

export default {
  components: {
    CommonModal
  },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    employee: {
      type: Object,
      default: null
    }
  },
  computed: {
    message() {
      if (!this.employee) return 'Are you sure you want to revoke this employee\'s portal access?';
      
      return `Are you sure you want to revoke portal access for ${this.employee.firstName} ${this.employee.lastName}? 
      This action will prevent them from logging into the EOR Central admin portal.`;
    }
  }
}
</script>
