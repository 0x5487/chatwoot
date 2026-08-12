<script setup>
import { computed, ref } from 'vue';
import { OnClickOutside } from '@vueuse/components';
import { useI18n } from 'vue-i18n';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';
import {
  getWelcomePromptIconOption,
  WELCOME_PROMPT_ICON_OPTIONS,
} from 'shared/helpers/welcomePrompt';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();
const isOpen = ref(false);

const selectedOption = computed(() =>
  getWelcomePromptIconOption(props.modelValue)
);

const selectIcon = icon => {
  emit('update:modelValue', icon);
  isOpen.value = false;
};
</script>

<template>
  <OnClickOutside @trigger="isOpen = false">
    <div class="relative">
      <button
        type="button"
        class="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-n-weak bg-n-alpha-black2 px-3 text-sm text-n-slate-12 hover:border-n-slate-6 focus:border-n-brand focus:outline-none"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="
          t('INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICON')
        "
        @click="isOpen = !isOpen"
        @keydown.esc="isOpen = false"
      >
        <span class="flex items-center gap-2">
          <span class="text-xl leading-none" aria-hidden="true">
            {{ selectedOption.emoji }}
          </span>
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys -->
          <span>{{ t(selectedOption.label) }}</span>
        </span>
        <FluentIcon icon="chevron-down" size="16" />
      </button>

      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-n-strong bg-n-solid-1 p-1 shadow-lg"
        role="listbox"
      >
        <button
          v-for="option in WELCOME_PROMPT_ICON_OPTIONS"
          :key="option.value"
          type="button"
          role="option"
          class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-n-slate-12 hover:bg-n-alpha-2"
          :aria-selected="option.value === selectedOption.value"
          @click="selectIcon(option.value)"
        >
          <span class="text-xl leading-none" aria-hidden="true">
            {{ option.emoji }}
          </span>
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys -->
          <span>{{ t(option.label) }}</span>
        </button>
      </div>
    </div>
  </OnClickOutside>
</template>
