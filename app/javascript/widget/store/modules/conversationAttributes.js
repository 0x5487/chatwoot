import {
  SET_CONVERSATION_ATTRIBUTES,
  UPDATE_CONVERSATION_ATTRIBUTES,
  CLEAR_CONVERSATION_ATTRIBUTES,
} from '../types';
import { getConversationAPI } from '../../api/conversation';

const state = {
  id: '',
  status: '',
  previous: null,
};

export const getters = {
  getConversationParams: $state => $state,
};

export const actions = {
  startNewConversation: ({ commit }) => {
    commit('START_NEW_CONVERSATION');
  },
  cancelNewConversation: ({ commit }) => {
    commit('CANCEL_NEW_CONVERSATION');
  },
  completeNewConversation: ({ commit }) => {
    commit('COMPLETE_NEW_CONVERSATION');
  },
  getAttributes: async ({ commit }) => {
    try {
      const { data } = await getConversationAPI();
      const { contact_last_seen_at: lastSeen } = data;
      commit(SET_CONVERSATION_ATTRIBUTES, data);
      commit('conversation/setMetaUserLastSeenAt', lastSeen, { root: true });
    } catch (error) {
      // Ignore error
    }
  },
  update({ commit }, data) {
    commit(UPDATE_CONVERSATION_ATTRIBUTES, data);
  },
  clearConversationAttributes: ({ commit }) => {
    commit('CLEAR_CONVERSATION_ATTRIBUTES');
  },
};

export const mutations = {
  [SET_CONVERSATION_ATTRIBUTES]($state, data) {
    $state.id = data.id;
    $state.status = data.status;
  },
  [UPDATE_CONVERSATION_ATTRIBUTES]($state, data) {
    if (data.id === $state.id) {
      $state.id = data.id;
      $state.status = data.status;
    }
  },
  [CLEAR_CONVERSATION_ATTRIBUTES]($state) {
    $state.id = '';
    $state.status = '';
    $state.previous = null;
  },
  START_NEW_CONVERSATION($state) {
    $state.previous = { id: $state.id, status: $state.status };
    $state.id = '';
    $state.status = '';
  },
  CANCEL_NEW_CONVERSATION($state) {
    if (!$state.previous) return;

    $state.id = $state.previous.id;
    $state.status = $state.previous.status;
    $state.previous = null;
  },
  COMPLETE_NEW_CONVERSATION($state) {
    $state.previous = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
