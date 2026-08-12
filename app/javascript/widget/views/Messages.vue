<script>
import { mapGetters } from 'vuex';

import ChatFooter from '../components/ChatFooter.vue';
import ConversationWrap from '../components/ConversationWrap.vue';
import configMixin from 'widget/mixins/configMixin';
import { IFrameHelper, RNHelper } from 'widget/helpers/utils';
import { isPopout } from 'widget/helpers/urlParamsHelper';

export default {
  components: { ChatFooter, ConversationWrap },
  mixins: [configMixin],
  computed: {
    ...mapGetters({
      groupedMessages: 'conversation/getGroupedConversation',
    }),
    isLegacyWidgetContext() {
      return (
        (!IFrameHelper.isIFrame() && isPopout(window.location.search)) ||
        !!RNHelper.isRNWebView()
      );
    },
    welcomeMessage() {
      if (this.isLegacyWidgetContext || !this.preChatFormEnabled) return '';
      return this.preChatFormOptions.preChatMessage?.trim() || '';
    },
    welcomePrompt() {
      if (this.isLegacyWidgetContext || !this.preChatFormEnabled) {
        return {
          message: '',
          quickActions: [],
          suggestedQuestions: [],
        };
      }

      return {
        message: this.welcomeMessage,
        ...this.welcomePromptOptions,
      };
    },
  },
  mounted() {
    this.$store.dispatch('conversation/setUserLastSeen');
  },
};
</script>

<template>
  <div
    class="flex flex-col flex-1 overflow-hidden rounded-b-lg bg-n-slate-2 dark:bg-n-solid-1"
  >
    <div class="flex flex-1 overflow-auto">
      <ConversationWrap
        :grouped-messages="groupedMessages"
        :welcome-message="welcomeMessage"
        :welcome-prompt="welcomePrompt"
      />
    </div>
    <ChatFooter class="px-5" />
  </div>
</template>
