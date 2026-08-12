<script setup>
import { computed } from 'vue';
import { useMessageFormatter } from 'shared/composables/useMessageFormatter';

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
});

const { formatMessage } = useMessageFormatter();
const formattedMessage = computed(() => formatMessage(props.message, false));
</script>

<template>
  <div
    v-show="message && message.trim()"
    class="welcome-prompt px-4 py-3 text-sm leading-5 text-n-slate-12"
  >
    <div
      v-dompurify-html="formattedMessage"
      class="[&_a]:text-n-blue-11 [&_a]:underline [&_a]:hover:brightness-75"
    />
  </div>
</template>
