<script>
import { mapGetters } from 'vuex';

export default {
  components: {},
  props: {
    action: {
      type: Object,
      default: () => {},
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['optionSelect'],
  computed: {
    ...mapGetters({
      widgetColor: 'appConfig/getWidgetColor',
    }),
  },
  methods: {
    onClick() {
      this.$emit('optionSelect', this.action);
    },
  },
};
</script>

<template>
  <li
    class="option list-none rounded-lg border border-solid border-n-brand"
    :class="{ 'bg-n-slate-2 dark:bg-n-solid-2': isSelected }"
    :style="{ borderColor: widgetColor }"
  >
    <button
      type="button"
      class="option-button flex min-h-10 w-full cursor-pointer items-center !rounded-lg !border-0 !bg-transparent !px-3 !py-2 text-sm whitespace-normal ltr:text-left rtl:text-right transition-colors hover:bg-n-slate-2 dark:hover:bg-n-solid-2"
      @click="onClick"
    >
      <span :style="{ color: widgetColor }">{{ action.title }}</span>
    </button>
  </li>
</template>
