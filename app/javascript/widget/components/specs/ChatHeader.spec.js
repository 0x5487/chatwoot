import { shallowMount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createStore } from 'vuex';
import { h } from 'vue';
import ChatHeader from '../ChatHeader.vue';
import HeaderActions from '../HeaderActions.vue';
import AvailabilityContainer from '../Availability/AvailabilityContainer.vue';

const createWrapper = widgetColor => {
  const store = createStore({
    modules: {
      appConfig: {
        namespaced: true,
        state: () => ({ widgetColor }),
        getters: {
          getWidgetColor: state => state.widgetColor,
        },
      },
      conversation: {
        namespaced: true,
        getters: {
          getIsStartingNewConversation: () => false,
          getIsSending: () => false,
        },
      },
    },
  });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { name: 'home', path: '/', component: { render: () => h('div') } },
    ],
  });

  window.chatwootWebChannel = {
    workingHours: [],
    workingHoursEnabled: false,
    timezone: 'UTC',
    utcOffset: 'UTC',
    replyTime: 'in_a_few_minutes',
  };

  return shallowMount(ChatHeader, {
    props: {
      title: 'Acme Support',
      availableAgents: [{ id: 1 }],
    },
    global: {
      plugins: [router, store],
      directives: {
        dompurifyHtml: (element, binding) => {
          element.innerHTML = binding.value;
        },
      },
    },
  });
};

describe('ChatHeader', () => {
  it('uses the widget color for the header and a contrasting text color', () => {
    const wrapper = createWrapper('#e60012');

    expect(wrapper.find('header').element.style.backgroundColor).toBe(
      'rgb(230, 0, 18)'
    );
    expect(wrapper.find('.text-base').element.style.color).toBe(
      'rgb(255, 255, 255)'
    );
    expect(
      wrapper.findComponent(AvailabilityContainer).props('textColor')
    ).toBe('#FFFFFF');
    expect(wrapper.findComponent(HeaderActions).props('iconColor')).toBe(
      '#FFFFFF'
    );
  });

  it('uses dark text for a light widget color', () => {
    const wrapper = createWrapper('#f5f5f5');

    expect(wrapper.find('.text-base').element.style.color).toBe('rgb(0, 0, 0)');
    expect(wrapper.findComponent(HeaderActions).props('iconColor')).toBe(
      '#000000'
    );
  });
});
