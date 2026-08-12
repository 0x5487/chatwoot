<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useMessageFormatter } from 'shared/composables/useMessageFormatter';
import FluentIcon from 'shared/components/FluentIcon/Index.vue';

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
});

const store = useStore();
const { formatMessage } = useMessageFormatter();
const formattedMessage = computed(() => formatMessage(props.message, false));
const isSendingSuggestion = ref(false);

const prototypeCopy = {
  quickActionsTitle: '您可以点击下方快捷入口获取帮助',
  suggestedQuestionsTitle: '猜你想问',
};

// Prototype content: this will move to the widget configuration after the layout is approved.
const quickActions = [
  {
    label: '充值问题',
    text: '我想咨询充值问题',
    icon: '💳',
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    label: '提款问题',
    text: '我想咨询提款问题',
    icon: '💵',
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: '优惠活动',
    text: '我想了解优惠活动',
    icon: '🎁',
    iconClass: 'bg-orange-50 text-orange-600',
  },
  {
    label: '账户问题',
    text: '我想咨询账户问题',
    icon: '👤',
    iconClass: 'bg-indigo-50 text-indigo-600',
  },
  {
    label: '游戏问题',
    text: '我想咨询游戏问题',
    icon: '🎮',
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    label: '代理合作',
    text: '我想咨询代理合作',
    icon: '🤝',
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    label: '常见问题',
    text: '我想查看常见问题',
    icon: '❓',
    iconClass: 'bg-rose-50 text-rose-600',
  },
  {
    label: '转人工客服',
    text: '我想转人工客服',
    icon: '🎧',
    iconClass: 'bg-red-50 text-red-600',
  },
];

const suggestedQuestions = [
  '提款未到账怎么办？',
  '如何修改登录密码？',
  '如何绑定银行卡？',
];

const isPromptVisible = computed(() => {
  if (!props.message || !props.message.trim()) return false;

  const status =
    store?.getters?.['conversationAttributes/getConversationParams']?.status;
  const { allowMessagesAfterResolved } = window.chatwootWebChannel || {};
  return !(status === 'resolved' && !allowMessagesAfterResolved);
});

const selectSuggestion = async text => {
  if (isSendingSuggestion.value) return;

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
    <div class="flex items-start gap-2">
      <div
        class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-n-slate-4 text-n-slate-12"
        aria-hidden="true"
      >
        <FluentIcon icon="chat" size="16" />
      </div>
      <div
        class="max-w-[calc(100%-2.25rem)] rounded-2xl rounded-tl-md bg-n-slate-3 px-3 py-2 text-sm text-n-slate-12"
      >
        <div
          v-dompurify-html="formattedMessage"
          class="[&_a]:text-n-blue-11 [&_a]:underline [&_a]:hover:brightness-75"
        />
      </div>
    </div>

    <div class="mt-3 rounded-xl border border-n-slate-4 bg-n-background p-3">
      <p class="mb-2 text-xs font-medium text-n-slate-12">
        {{ prototypeCopy.quickActionsTitle }}
      </p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="action in quickActions"
          :key="action.label"
          type="button"
          class="flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-n-slate-4 bg-n-background px-1 py-2 text-center text-xs text-n-slate-12 transition hover:border-n-brand hover:bg-n-slate-2"
          :aria-label="action.label"
          :disabled="isSendingSuggestion"
          @click="selectSuggestion(action.text)"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-lg text-base"
            :class="action.iconClass"
            aria-hidden="true"
          >
            {{ action.icon }}
          </span>
          <span class="truncate">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <div class="mt-3">
      <p class="mb-2 text-xs font-semibold text-n-slate-12">
        {{ prototypeCopy.suggestedQuestionsTitle }}
      </p>
      <div
        class="overflow-hidden rounded-xl border border-n-slate-4 bg-n-background"
      >
        <button
          v-for="question in suggestedQuestions"
          :key="question"
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
