<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useMessageFormatter } from 'shared/composables/useMessageFormatter';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';
import { getWelcomePromptIconEmoji } from 'shared/helpers/welcomePrompt';

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  quickActions: {
    type: Array,
    default: () => [],
  },
  suggestedQuestions: {
    type: Array,
    default: () => [],
  },
});

const store = useStore();
const { t } = useI18n();
const { formatMessage } = useMessageFormatter();
const formattedMessage = computed(() => formatMessage(props.message, false));
const isSendingSuggestion = ref(false);

const configuredQuickActions = computed(() =>
  props.quickActions.filter(
    action => typeof action?.label === 'string' && action.label.trim()
  )
);

const configuredSuggestedQuestions = computed(() =>
  props.suggestedQuestions.filter(
    question => typeof question === 'string' && question.trim()
  )
);

const isPromptVisible = computed(() => {
  const hasConfiguredContent =
    props.message.trim() ||
    configuredQuickActions.value.length ||
    configuredSuggestedQuestions.value.length;

  if (!hasConfiguredContent) return false;

  const status =
    store?.getters?.['conversationAttributes/getConversationParams']?.status;
  const { allowMessagesAfterResolved } = window.chatwootWebChannel || {};
  return !(status === 'resolved' && !allowMessagesAfterResolved);
});

const selectSuggestion = async text => {
  if (isSendingSuggestion.value || !text?.trim()) return;

  isSendingSuggestion.value = true;
  try {
    await store.dispatch('conversation/sendMessage', {
      content: text,
      replyTo: null,
    });
  } finally {
    isSendingSuggestion.value = false;
  }
};
</script>

<template>
  <div
    v-show="isPromptVisible"
    class="welcome-prompt px-3 pb-3 pt-4 text-sm leading-5 text-n-slate-12"
  >
    <div v-if="message.trim()" class="flex items-start">
      <div
        class="max-w-full rounded-2xl rounded-tl-md bg-n-slate-3 px-3 py-2 text-sm text-n-slate-12"
      >
        <div
          v-dompurify-html="formattedMessage"
          class="[&_a]:text-n-blue-11 [&_a]:underline [&_a]:hover:brightness-75"
        />
      </div>
    </div>

    <div
      v-if="configuredQuickActions.length"
      class="mt-3 rounded-xl border border-n-slate-4 bg-n-background p-3"
    >
      <p class="mb-2 text-xs font-medium text-n-slate-12">
        {{ t('WELCOME_PROMPT.QUICK_ACTIONS_TITLE') }}
      </p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="(action, index) in configuredQuickActions"
          :key="`${action.label}-${index}`"
          type="button"
          class="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-n-slate-10 bg-n-background px-1 py-2 text-center text-xs text-n-slate-12 transition hover:border-n-brand hover:bg-n-slate-2"
          :aria-label="action.label"
          :disabled="isSendingSuggestion"
          @click="selectSuggestion(action.label)"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-n-slate-3 text-xl leading-none"
            aria-hidden="true"
          >
            {{ getWelcomePromptIconEmoji(action.icon) }}
          </span>
          <span class="truncate">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="configuredSuggestedQuestions.length" class="mt-3">
      <p class="mb-2 text-xs font-semibold text-n-slate-12">
        {{ t('WELCOME_PROMPT.SUGGESTED_QUESTIONS_TITLE') }}
      </p>
      <div
        class="overflow-hidden rounded-xl border border-n-slate-4 bg-n-background"
      >
        <button
          v-for="(question, index) in configuredSuggestedQuestions"
          :key="`${question}-${index}`"
          type="button"
          class="flex w-full items-center justify-between border-b border-n-slate-4 px-3 py-2.5 text-left text-xs text-n-slate-12 last:border-b-0 hover:bg-n-slate-2"
          :disabled="isSendingSuggestion"
          @click="selectSuggestion(question)"
        >
          <span>{{ question }}</span>
          <FluentIcon icon="chevron-right" size="14" class="text-n-slate-10" />
        </button>
      </div>
    </div>
  </div>
</template>
