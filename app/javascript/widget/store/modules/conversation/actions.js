import {
  createConversationAPI,
  sendMessageAPI,
  getMessagesAPI,
  sendAttachmentAPI,
  toggleTyping,
  setUserLastSeenAt,
  toggleStatus,
  setCustomAttributes,
  deleteCustomAttribute,
} from 'widget/api/conversation';

import { ON_CONVERSATION_CREATED } from 'widget/constants/widgetBusEvents';
import {
  createTemporaryMessage,
  getNonDeletedMessages,
  hasPersistedMessages,
} from './helpers';
import { emitter } from 'shared/helpers/mitt';
import { IFrameHelper, RNHelper } from 'widget/helpers/utils';
import { CHATWOOT_ON_START_CONVERSATION } from 'widget/constants/sdkEvents';
import { isPopout } from 'widget/helpers/urlParamsHelper';

const isLegacyWidgetContext = () =>
  (!IFrameHelper.isIFrame() && isPopout(window.location.search)) ||
  !!RNHelper.isRNWebView();

const notifyConversationCreated = () => {
  emitter.emit(ON_CONVERSATION_CREATED);
  if (isLegacyWidgetContext()) return;

  IFrameHelper.sendMessage({
    event: 'onEvent',
    eventIdentifier: CHATWOOT_ON_START_CONVERSATION,
    data: { hasConversation: true },
  });
};

export const actions = {
  startNewConversation: ({ commit, dispatch }) => {
    commit('startNewConversation');
    dispatch('conversationAttributes/startNewConversation', {}, { root: true });
  },
  cancelNewConversation: ({ commit, dispatch, getters }) => {
    if (getters.getIsSending) return;

    commit('cancelNewConversation');
    dispatch(
      'conversationAttributes/cancelNewConversation',
      {},
      { root: true }
    );
  },
  completeNewConversation: ({ commit, dispatch }) => {
    commit('completeNewConversation');
    dispatch(
      'conversationAttributes/completeNewConversation',
      {},
      { root: true }
    );
  },
  createConversation: async ({ commit, dispatch }, params) => {
    commit('setConversationUIFlag', { isCreating: true });
    try {
      const { data } = await createConversationAPI(params);
      const { messages } = data;
      const [message = {}] = messages;
      commit('pushMessageToConversation', message);
      dispatch('conversationAttributes/getAttributes', {}, { root: true });
      // Emit event to notify that conversation is created and show the chat screen
      notifyConversationCreated();
    } catch (error) {
      // Ignore error
    } finally {
      commit('setConversationUIFlag', { isCreating: false });
    }
  },
  sendMessage: async ({ dispatch, state: conversationState }, params) => {
    const { content, replyTo } = params;
    const newConversation =
      conversationState.uiFlags?.isStartingNewConversation || false;
    if (newConversation && conversationState.uiFlags?.isSending) {
      return undefined;
    }

    const message = createTemporaryMessage({
      content,
      replyTo,
      newConversation,
    });
    const { pendingCustomAttributes, pendingLabels } = conversationState;
    const sendMessageParams = {
      message,
      pendingCustomAttributes,
      pendingLabels,
    };
    if (newConversation) {
      sendMessageParams.newConversation = true;
    }
    return dispatch('sendMessageWithData', sendMessageParams);
  },
  sendMessageWithData: async (
    { commit, dispatch, rootGetters, state: conversationState },
    {
      message,
      pendingCustomAttributes = {},
      pendingLabels = [],
      newConversation = false,
    }
  ) => {
    const { id, content, replyTo, meta = {} } = message;
    const shouldCreateNewConversation =
      newConversation || message.newConversation;
    if (shouldCreateNewConversation && conversationState.uiFlags?.isSending) {
      return undefined;
    }

    const hasPendingMetadata =
      Object.keys(pendingCustomAttributes).length > 0 ||
      pendingLabels.length > 0;
    const isFirstMessage =
      !rootGetters?.['conversationAttributes/getConversationParams']?.id &&
      !hasPersistedMessages(conversationState?.conversations);

    if (shouldCreateNewConversation) {
      commit('setConversationUIFlag', { isSending: true });
    }
    commit('pushMessageToConversation', message);
    commit('updateMessageMeta', { id, meta: { ...meta, error: '' } });
    try {
      const { data } = await sendMessageAPI(content, replyTo, {
        customAttributes: hasPendingMetadata
          ? pendingCustomAttributes
          : undefined,
        labels: hasPendingMetadata ? pendingLabels : undefined,
        newConversation: shouldCreateNewConversation,
      });
      if (hasPendingMetadata) {
        commit('clearPendingConversationMetadata');
      }

      // [VITE] Don't delete this manually, since `pushMessageToConversation` does the replacement for us anyway
      // commit('deleteMessage', message.id);
      commit('pushMessageToConversation', { ...data, status: 'sent' });
      if (isFirstMessage) {
        commit('completeNewConversation');
        dispatch(
          'conversationAttributes/completeNewConversation',
          {},
          { root: true }
        );
        dispatch('conversationAttributes/getAttributes', {}, { root: true });
        notifyConversationCreated();
        return { conversationCreated: true, hasConversation: true };
      }
      return { conversationCreated: false, hasConversation: true };
    } catch (error) {
      commit('pushMessageToConversation', { ...message, status: 'failed' });
      commit('updateMessageMeta', {
        id,
        meta: { ...meta, error: '' },
      });
      return undefined;
    } finally {
      if (shouldCreateNewConversation) {
        commit('setConversationUIFlag', { isSending: false });
      }
    }
  },

  setLastMessageId: async ({ commit }) => {
    commit('setLastMessageId');
  },

  sendAttachment: async (
    { commit, dispatch, rootGetters, state: conversationState },
    params
  ) => {
    const {
      attachment: { thumbUrl, fileType },
      meta = {},
    } = params;
    const newConversation =
      conversationState.uiFlags?.isStartingNewConversation || false;
    if (newConversation && conversationState.uiFlags?.isSending) {
      return undefined;
    }

    const attachment = {
      thumb_url: thumbUrl,
      data_url: thumbUrl,
      file_type: fileType,
      status: 'in_progress',
    };
    const tempMessage = createTemporaryMessage({
      attachments: [attachment],
      replyTo: params.replyTo,
      newConversation,
    });
    const isFirstMessage =
      !rootGetters?.['conversationAttributes/getConversationParams']?.id &&
      !hasPersistedMessages(conversationState.conversations);
    const { pendingCustomAttributes, pendingLabels } = conversationState;
    const hasPendingMetadata =
      Object.keys(pendingCustomAttributes).length > 0 ||
      pendingLabels.length > 0;

    if (newConversation) {
      commit('setConversationUIFlag', { isSending: true });
    }
    commit('pushMessageToConversation', tempMessage);
    try {
      const { data } = await sendAttachmentAPI(params, {
        customAttributes: hasPendingMetadata
          ? pendingCustomAttributes
          : undefined,
        labels: hasPendingMetadata ? pendingLabels : undefined,
        newConversation,
      });
      if (hasPendingMetadata) {
        commit('clearPendingConversationMetadata');
      }
      commit('updateAttachmentMessageStatus', {
        message: data,
        tempId: tempMessage.id,
      });
      commit('pushMessageToConversation', { ...data, status: 'sent' });
      if (isFirstMessage) {
        commit('completeNewConversation');
        dispatch(
          'conversationAttributes/completeNewConversation',
          {},
          { root: true }
        );
        dispatch('conversationAttributes/getAttributes', {}, { root: true });
        notifyConversationCreated();
      }
    } catch (error) {
      commit('pushMessageToConversation', { ...tempMessage, status: 'failed' });
      commit('updateMessageMeta', {
        id: tempMessage.id,
        meta: { ...meta, error: '' },
      });
      // Show error
    } finally {
      if (newConversation) {
        commit('setConversationUIFlag', { isSending: false });
      }
    }
    return undefined;
  },
  fetchOldConversations: async ({ commit }, { before } = {}) => {
    try {
      commit('setConversationListLoading', true);
      const {
        data: { payload, meta },
      } = await getMessagesAPI({ before });
      const { contact_last_seen_at: lastSeen } = meta;
      const formattedMessages = getNonDeletedMessages({ messages: payload });
      commit('conversation/setMetaUserLastSeenAt', lastSeen, { root: true });
      commit('setMessagesInConversation', formattedMessages);
      commit('setConversationListLoading', false);
    } catch (error) {
      commit('setConversationListLoading', false);
    }
  },

  syncLatestMessages: async ({ state, commit, rootGetters }) => {
    if (rootGetters?.['conversation/getIsStartingNewConversation']) return;

    try {
      const { lastMessageId, conversations } = state;

      const {
        data: { payload, meta },
      } = await getMessagesAPI({ after: lastMessageId });

      const { contact_last_seen_at: lastSeen } = meta;
      const formattedMessages = getNonDeletedMessages({ messages: payload });
      const missingMessages = formattedMessages.filter(
        message => conversations?.[message.id] === undefined
      );
      if (!missingMessages.length) return;
      missingMessages.forEach(message => {
        conversations[message.id] = message;
      });
      // Sort conversation messages by created_at
      const updatedConversation = Object.fromEntries(
        Object.entries(conversations).sort(
          (a, b) => a[1].created_at - b[1].created_at
        )
      );
      commit('conversation/setMetaUserLastSeenAt', lastSeen, { root: true });
      commit('setMissingMessagesInConversation', updatedConversation);
    } catch (error) {
      // IgnoreError
    }
  },

  clearConversations: ({ commit }) => {
    commit('clearConversations');
  },

  addOrUpdateMessage: async ({ commit }, data) => {
    const { id, content_attributes } = data;
    if (content_attributes && content_attributes.deleted) {
      commit('deleteMessage', id);
      return;
    }
    commit('pushMessageToConversation', data);
  },

  toggleAgentTyping({ commit }, data) {
    commit('toggleAgentTypingStatus', data);
  },

  toggleUserTyping: async (_, data) => {
    try {
      await toggleTyping(data);
    } catch (error) {
      // IgnoreError
    }
  },

  setUserLastSeen: async ({ commit, getters: appGetters }) => {
    if (!appGetters.getConversationSize) {
      return;
    }

    const lastSeen = Date.now() / 1000;
    try {
      commit('setMetaUserLastSeenAt', lastSeen);
      await setUserLastSeenAt({ lastSeen });
    } catch (error) {
      // IgnoreError
    }
  },

  resolveConversation: async () => {
    await toggleStatus();
  },

  setCustomAttributes: async (
    { commit, rootGetters },
    customAttributes = {}
  ) => {
    if (!rootGetters['conversationAttributes/getConversationParams']?.id) {
      commit('setPendingCustomAttributes', customAttributes);
      return;
    }
    try {
      await setCustomAttributes(customAttributes);
    } catch (error) {
      // IgnoreError
    }
  },

  deleteCustomAttribute: async ({ commit, rootGetters }, customAttribute) => {
    if (!rootGetters['conversationAttributes/getConversationParams']?.id) {
      commit('removePendingCustomAttribute', customAttribute);
      return;
    }
    try {
      await deleteCustomAttribute(customAttribute);
    } catch (error) {
      // IgnoreError
    }
  },
};
