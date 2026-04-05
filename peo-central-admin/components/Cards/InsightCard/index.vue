
<template>
    <div class="tw-flex tw-flex-wrap tw-gap-4 tw-mb-4 tw-w-full">
      <div
        v-for="item in data"
        :key="item.id"
        class="tw-bg-white tw-border-2 tw-rounded-xl tw-shadow-sm tw-py-3 tw-px-3 tw-flex tw-flex-1 tw-items-center tw-justify-between tw-transition-transform tw-duration-300 hover:tw--translate-y-1 hover:tw-shadow-lg tw-cursor-pointer tw-group tw-relative tw-m-2 tw-min-w-[160px] tw-max-w-[220px]"
      >
        <div class="tw-flex tw-flex-col tw-space-y-1">
          <span class="tw-text-sm tw-font-medium tw-text-gray-500">{{ item.status }}</span>
          <span class="tw-text-3xl tw-font-bold tw-text-gray-800 tw-transition-all tw-duration-500 group-hover:tw-text-blue-600">{{ item.count || '0' }}</span>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-left-0 tw-h-1 tw-w-full tw-bg-blue-400 tw-rounded-b-xl tw-transition-all tw-duration-300 group-hover:tw-bg-blue-600"></div>
      </div>
    </div>
    </template>

    <script>

    export default {
      props: { data: Array },
    }
    </script>
