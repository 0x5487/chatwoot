import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';

const state = {
  conversations: {},
  meta: {
    userLastSeenAt: undefined,
  },
  uiFlags: {
    allMessagesLoaded: false,
    isFetchingList: false,
    isAgentTyping: false,
    isCreating: false,
    isStartingNewConversation: false,
    isSending: false,
  },
  lastMessageId: null,
  savedConversationState: null,
  pendingCustomAttributes: {},
  pendingLabels: [],
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
