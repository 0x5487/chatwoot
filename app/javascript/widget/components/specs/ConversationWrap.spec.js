import ConversationWrap from '../ConversationWrap.vue';

describe('ConversationWrap', () => {
  it('starts at the Welcome prompt before scrolling an existing conversation', () => {
    const component = {
      $el: { scrollTop: 240, scrollHeight: 800 },
      allMessagesLoaded: true,
      conversationSize: 4,
      initialScrollPositionSet: false,
      previousScrollHeight: 0,
      welcomeMessage: 'Welcome',
    };

    ConversationWrap.methods.scrollToBottom.call(component);

    expect(component.$el.scrollTop).toBe(0);
    expect(component.initialScrollPositionSet).toBe(true);
  });

  it('scrolls to the latest message after the initial Welcome position', () => {
    const component = {
      $el: { scrollTop: 0, scrollHeight: 800 },
      allMessagesLoaded: true,
      conversationSize: 4,
      initialScrollPositionSet: true,
      previousScrollHeight: 0,
      welcomeMessage: 'Welcome',
    };

    ConversationWrap.methods.scrollToBottom.call(component);

    expect(component.$el.scrollTop).toBe(800);
  });
});
