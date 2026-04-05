<template>
  <CommonModal
    :open="open"
    title="Revoke Contact Access"
    message="Are you sure you want to revoke access for this contact? This action will mark the contact as inactive and they will no longer have access to the system."
    confirm-text="Revoke Access"
    cancel-text="Cancel"
    type="warning"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
  >
    <template #icon>
      <svg class="tw-w-full tw-h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </template>
  </CommonModal>
</template>

<script>
import CommonModal from '@/components/Common/CommonModal.vue'

export default {
  name: 'RevokeContactAccessModal',
  components: {
    CommonModal
  },
  props: {
    open: {
      type: Boolean,
      default: false
    }
  }
}
</script>
