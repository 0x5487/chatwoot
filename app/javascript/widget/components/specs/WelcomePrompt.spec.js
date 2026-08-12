import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import WelcomePrompt from '../WelcomePrompt.vue';

describe('WelcomePrompt', () => {
  it('renders configured Markdown as a non-message prompt', () => {
    const wrapper = shallowMount(WelcomePrompt, {
      props: { message: '**Hello**' },
      global: {
        directives: {
          dompurifyHtml: (element, binding) => {
            element.innerHTML = binding.value;
          },
        },
      },
    });

    expect(wrapper.text()).toContain('Hello');
    expect(wrapper.find('.welcome-prompt').exists()).toBe(true);
  });

  it('does not render an empty prompt', () => {
    const wrapper = shallowMount(WelcomePrompt, {
      props: { message: '   ' },
      global: {
        directives: {
          dompurifyHtml: () => {},
        },
      },
    });

    expect(wrapper.find('.welcome-prompt').isVisible()).toBe(false);
  });

  it('renders only configured actions and suggested questions', () => {
    const wrapper = shallowMount(WelcomePrompt, {
      props: {
        message: 'Welcome',
        quickActions: [{ label: 'Billing', icon: 'chat' }],
        suggestedQuestions: ['How long does it take?'],
      },
    });

    expect(wrapper.text()).toContain('Billing');
    expect(wrapper.text()).toContain('💳');
    expect(wrapper.text()).toContain('How long does it take?');
    expect(wrapper.text()).not.toContain('充值问题');
  });

  it('sends the configured display name when a quick action is selected', async () => {
    const sendMessage = vi.fn().mockResolvedValue({});
    const store = createStore({
      modules: {
        conversation: {
          namespaced: true,
          actions: { sendMessage },
        },
      },
    });
    const wrapper = shallowMount(WelcomePrompt, {
      props: {
        quickActions: [{ label: 'Billing', icon: 'chat' }],
      },
      global: { plugins: [store] },
    });

    await wrapper.get('button[aria-label="Billing"]').trigger('click');

    expect(sendMessage).toHaveBeenCalledWith(expect.anything(), {
      content: 'Billing',
      replyTo: null,
    });
  });

  it('sends the configured question when a suggested question is selected', async () => {
    const sendMessage = vi.fn().mockResolvedValue({});
    const store = createStore({
      modules: {
        conversation: {
          namespaced: true,
          actions: { sendMessage },
        },
      },
    });
    const wrapper = shallowMount(WelcomePrompt, {
      props: { suggestedQuestions: ['Where is my order?'] },
      global: { plugins: [store] },
    });

    await wrapper.get('button').trigger('click');

    expect(sendMessage).toHaveBeenCalledWith(expect.anything(), {
      content: 'Where is my order?',
      replyTo: null,
    });
  });
});
