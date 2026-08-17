<script>
import { mapGetters } from 'vuex';
import { getContrastingTextColor } from '@chatwoot/utils';
import { mix, toHex } from 'color2k';

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
    optionBackgroundColor() {
      return toHex(mix(this.widgetColor, '#fff', 0.9));
    },
    textColor() {
      return getContrastingTextColor(this.optionBackgroundColor);
    },
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
    :style="{
      backgroundColor: optionBackgroundColor,
      borderColor: widgetColor,
    }"
  >
    <button
      type="button"
      class="option-button flex min-h-7 w-full cursor-pointer items-center !rounded-lg !border-0 !px-3 !py-1 text-sm whitespace-normal ltr:text-left rtl:text-right transition duration-150 hover:brightness-110"
      :style="{ backgroundColor: optionBackgroundColor, color: textColor }"
      @click="onClick"
    >
      <span>{{ action.title }}</span>
    </button>
  </li>
</template>
