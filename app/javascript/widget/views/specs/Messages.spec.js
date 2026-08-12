import Messages from '../Messages.vue';

describe('Messages welcome prompt', () => {
  it('uses the configured pre-chat message when pre-chat is enabled', () => {
    expect(
      Messages.computed.welcomeMessage.call({
        preChatFormEnabled: true,
        preChatFormOptions: { preChatMessage: '  Welcome **here**  ' },
      })
    ).toBe('Welcome **here**');
  });

  it('does not expose the pre-chat message when pre-chat is disabled', () => {
    expect(
      Messages.computed.welcomeMessage.call({
        preChatFormEnabled: false,
        preChatFormOptions: { preChatMessage: 'Welcome' },
      })
    ).toBe('');
  });

  it('does not expose the Welcome prompt in legacy Widget contexts', () => {
    expect(
      Messages.computed.welcomeMessage.call({
        isLegacyWidgetContext: true,
        preChatFormEnabled: true,
        preChatFormOptions: { preChatMessage: 'Welcome' },
      })
    ).toBe('');
  });

  it('passes configured welcome prompt content when pre-chat is enabled', () => {
    expect(
      Messages.computed.welcomePrompt.call({
        isLegacyWidgetContext: false,
        preChatFormEnabled: true,
        welcomeMessage: 'Welcome',
        welcomePromptOptions: {
          quickActions: [{ label: 'Billing', icon: 'chat' }],
          suggestedQuestions: ['Where is my order?'],
        },
      })
    ).toEqual({
      message: 'Welcome',
      quickActions: [{ label: 'Billing', icon: 'chat' }],
      suggestedQuestions: ['Where is my order?'],
    });
  });

  it('hides all welcome prompt content when pre-chat is disabled', () => {
    expect(
      Messages.computed.welcomePrompt.call({
        isLegacyWidgetContext: false,
        preChatFormEnabled: false,
        welcomeMessage: 'Welcome',
        welcomePromptOptions: {
          quickActions: [{ label: 'Billing', icon: 'chat' }],
          suggestedQuestions: ['Where is my order?'],
        },
      })
    ).toEqual({ message: '', quickActions: [], suggestedQuestions: [] });
  });
});
