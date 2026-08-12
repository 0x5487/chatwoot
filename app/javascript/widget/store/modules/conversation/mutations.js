import { MESSAGE_TYPE } from 'widget/helpers/constants';
import { findUndeliveredMessage } from './helpers';

export const mutations = {
  clearConversations($state) {
    $state.conversations = {};
    $state.savedConversationState = null;
    if ($state.uiFlags) {
      $state.uiFlags.isStartingNewConversation = false;
      $state.uiFlags.isSending = false;
    }
    $state.pendingCustomAttributes = {};
    $state.pendingLabels = [];
  },

  startNewConversation($state) {
    if ($state.savedConversationState) return;

    $state.savedConversationState = {
      conversations: $state.conversations,
      meta: $state.meta,
      lastMessageId: $state.lastMessageId,
      uiFlags: {
        allMessagesLoaded: $state.uiFlags.allMessagesLoaded,
        isFetchingList: $state.uiFlags.isFetchingList,
        isAgentTyping: $state.uiFlags.isAgentTyping,
      },
    };
    $state.conversations = {};
    $state.meta = { userLastSeenAt: undefined };
    $state.lastMessageId = null;
    $state.uiFlags = {
      ...$state.uiFlags,
      allMessagesLoaded: true,
      isFetchingList: false,
      isAgentTyping: false,
      isStartingNewConversation: true,
    };
  },

  cancelNewConversation($state) {
    if (!$state.savedConversationState) {
      $state.uiFlags.isStartingNewConversation = false;
      $state.uiFlags.isSending = false;
      return;
    }

    const { conversations, meta, lastMessageId, uiFlags } =
      $state.savedConversationState;
    $state.conversations = conversations;
    $state.meta = meta;
    $state.lastMessageId = lastMessageId;
    $state.uiFlags = {
      ...$state.uiFlags,
      ...uiFlags,
      isStartingNewConversation: false,
      isSending: false,
    };
    $state.savedConversationState = null;
  },

  completeNewConversation($state) {
    $state.savedConversationState = null;
    $state.uiFlags.isStartingNewConversation = false;
    $state.uiFlags.isSending = false;
  },
  pushMessageToConversation($state, message) {
    const { id, status, message_type: type } = message;

    const messagesInbox = $state.conversations;
    const isMessageIncoming = type === MESSAGE_TYPE.INCOMING;
    const isTemporaryMessage = status === 'in_progress';

    if (!isMessageIncoming || isTemporaryMessage) {
      messagesInbox[id] = message;
      return;
    }

    const [messageInConversation] = findUndeliveredMessage(
      messagesInbox,
      message
    );
    if (!messageInConversation) {
      messagesInbox[id] = message;
    } else {
      // [VITE] instead of leaving undefined behind, we remove it completely
      // remove the temporary message and replace it with the new message
      // messagesInbox[messageInConversation.id] = undefined;
      delete messagesInbox[messageInConversation.id];
      messagesInbox[id] = message;
    }
  },

  updateAttachmentMessageStatus($state, { message, tempId }) {
    const { id } = message;
    const messagesInbox = $state.conversations;

    const messageInConversation = messagesInbox[tempId];

    if (messageInConversation) {
      // [VITE] instead of leaving undefined behind, we remove it completely
      // remove the temporary message and replace it with the new message
      // messagesInbox[tempId] = undefined;
      delete messagesInbox[tempId];
      messagesInbox[id] = { ...message };
    }
  },

  setConversationUIFlag($state, uiFlags) {
    $state.uiFlags = {
      ...$state.uiFlags,
      ...uiFlags,
    };
  },

  setConversationListLoading($state, status) {
    $state.uiFlags.isFetchingList = status;
  },

  setMessagesInConversation($state, payload) {
    if (!payload.length) {
      $state.uiFlags.allMessagesLoaded = true;
      return;
    }

    payload.forEach(message => {
      $state.conversations[message.id] = message;
    });
  },

  setMissingMessagesInConversation($state, payload) {
    $state.conversation = payload;
  },

  updateMessage($state, { id, content_attributes }) {
    $state.conversations[id] = {
      ...$state.conversations[id],
      content_attributes: {
        ...($state.conversations[id].content_attributes || {}),
        ...content_attributes,
      },
    };
  },

  updateMessageMeta($state, { id, meta }) {
    const message = $state.conversations[id];
    if (!message) return;

    const newMeta = message.meta ? { ...message.meta, ...meta } : { ...meta };
    message.meta = { ...newMeta };
  },

  deleteMessage($state, id) {
    delete $state.conversations[id];
    // [VITE] In Vue 3 proxy objects, we can't delete properties by setting them to undefined
    // Instead, we have to use the delete operator
    // $state.conversations[id] = undefined;
  },

  toggleAgentTypingStatus($state, { status }) {
    $state.uiFlags.isAgentTyping = status === 'on';
  },

  setMetaUserLastSeenAt($state, lastSeen) {
    $state.meta.userLastSeenAt = lastSeen;
  },

  setLastMessageId($state) {
    const { conversations } = $state;
    const lastMessage = Object.values(conversations).pop();
    if (!lastMessage) return;
    const { id } = lastMessage;
    $state.lastMessageId = id;
  },

  setPendingCustomAttributes($state, data) {
    $state.pendingCustomAttributes = {
      ...$state.pendingCustomAttributes,
      ...data,
    };
  },

  setPendingLabels($state, label) {
    if (!$state.pendingLabels.includes(label)) {
      $state.pendingLabels.push(label);
    }
  },

  removePendingCustomAttribute($state, key) {
    const { [key]: _, ...rest } = $state.pendingCustomAttributes;
    $state.pendingCustomAttributes = rest;
  },

  removePendingLabel($state, label) {
    $state.pendingLabels = $state.pendingLabels.filter(l => l !== label);
  },

  clearPendingConversationMetadata($state) {
    $state.pendingCustomAttributes = {};
    $state.pendingLabels = [];
  },
};
