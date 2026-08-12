import { shallowMount } from '@vue/test-utils';
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
});
