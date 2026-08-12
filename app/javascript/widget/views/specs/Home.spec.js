import { shallowMount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createStore } from 'vuex';
import Home from '../Home.vue';

describe('Home view', () => {
  it('opens the messages view without showing the Pre-chat form', async () => {
    window.chatwootWebChannel = {
      preChatFormEnabled: true,
      preChatFormOptions: { pre_chat_fields: [], pre_chat_message: 'Hello' },
      enabledFeatures: [],
    };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/messages', name: 'messages', component: Home },
      ],
    });
    const store = createStore({
      modules: {
        agent: {
          namespaced: true,
          getters: { availableAgents: () => [] },
        },
        conversation: {
          namespaced: true,
          getters: {
            getConversationSize: () => 0,
            getUnreadMessageCount: () => 0,
          },
        },
      },
    });
    const wrapper = shallowMount(Home, {
      global: { plugins: [router, store] },
    });

    await wrapper.vm.startConversation();

    expect(router.currentRoute.value.name).toBe('messages');
  });

  it('keeps the Pre-chat form for popout entry', async () => {
    window.history.replaceState({}, '', '/widget?cw_conversation=token');
    window.chatwootWebChannel = {
      preChatFormEnabled: true,
      preChatFormOptions: { pre_chat_fields: [], pre_chat_message: 'Hello' },
      enabledFeatures: [],
    };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/messages', name: 'messages', component: Home },
        { path: '/prechat', name: 'prechat-form', component: Home },
      ],
    });
    const store = createStore({
      modules: {
        agent: {
          namespaced: true,
          getters: { availableAgents: () => [] },
        },
        conversation: {
          namespaced: true,
          getters: {
            getConversationSize: () => 0,
            getUnreadMessageCount: () => 0,
          },
        },
      },
    });
    const wrapper = shallowMount(Home, {
      global: { plugins: [router, store] },
    });

    await wrapper.vm.startConversation();

    expect(router.currentRoute.value.name).toBe('prechat-form');
    window.history.replaceState({}, '', '/');
  });

  it('keeps the Pre-chat form for React Native entry', async () => {
    window.ReactNativeWebView = { postMessage: vi.fn() };
    window.chatwootWebChannel = {
      preChatFormEnabled: true,
      preChatFormOptions: { pre_chat_fields: [], pre_chat_message: 'Hello' },
      enabledFeatures: [],
    };
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/messages', name: 'messages', component: Home },
        { path: '/prechat', name: 'prechat-form', component: Home },
      ],
    });
    const store = createStore({
      modules: {
        agent: {
          namespaced: true,
          getters: { availableAgents: () => [] },
        },
        conversation: {
          namespaced: true,
          getters: {
            getConversationSize: () => 0,
            getUnreadMessageCount: () => 0,
          },
        },
      },
    });
    const wrapper = shallowMount(Home, {
      global: { plugins: [router, store] },
    });

    await wrapper.vm.startConversation();

    expect(router.currentRoute.value.name).toBe('prechat-form');
    delete window.ReactNativeWebView;
  });
});
