import App from '../App.vue';

const registerToggleOpenListener = component => {
  const addEventListener = vi
    .spyOn(window, 'addEventListener')
    .mockImplementation(() => {});

  App.methods.registerListeners.call(component);

  const listener = addEventListener.mock.calls.find(
    ([eventName]) => eventName === 'message'
  )[1];
  addEventListener.mockRestore();
  return listener;
};

describe('App widget toggle navigation', () => {
  beforeEach(() => {
    window.chatwootWebChannel = { websiteToken: 'widget-token' };
  });

  it('opens the messages view directly from the SDK toggle event', () => {
    const router = { replace: vi.fn() };
    const component = {
      $route: { name: 'home' },
      $store: { dispatch: vi.fn() },
      activeCampaign: {},
      isIFrame: true,
      router,
      unsetUnreadView: vi.fn(),
    };
    const listener = registerToggleOpenListener(component);

    listener({
      data: `chatwoot-widget:${JSON.stringify({
        event: 'toggle-open',
        isOpen: true,
      })}`,
    });

    expect(router.replace).toHaveBeenCalledWith({ name: 'messages' });
    expect(component.unsetUnreadView).toHaveBeenCalled();
  });

  it('keeps campaign priority when the widget is opened', () => {
    const router = { replace: vi.fn() };
    const component = {
      $route: { name: 'home' },
      $store: { dispatch: vi.fn() },
      activeCampaign: { id: 1 },
      isIFrame: true,
      router,
      unsetUnreadView: vi.fn(),
    };
    const listener = registerToggleOpenListener(component);

    listener({
      data: `chatwoot-widget:${JSON.stringify({
        event: 'toggle-open',
        isOpen: true,
      })}`,
    });

    expect(router.replace).not.toHaveBeenCalled();
  });

  it('opens a stale pre-chat route when no campaign is active', () => {
    const router = { replace: vi.fn() };
    const component = {
      $route: { name: 'prechat-form' },
      $store: { dispatch: vi.fn() },
      activeCampaign: {},
      isIFrame: true,
      router,
      unsetUnreadView: vi.fn(),
    };
    const listener = registerToggleOpenListener(component);

    listener({
      data: `chatwoot-widget:${JSON.stringify({
        event: 'toggle-open',
        isOpen: true,
      })}`,
    });

    expect(router.replace).toHaveBeenCalledWith({ name: 'messages' });
  });

  it('cancels an unsent replacement when the SDK closes the widget', () => {
    const component = {
      $route: { name: 'messages' },
      $store: {
        dispatch: vi.fn(),
        getters: {
          'conversation/getIsStartingNewConversation': true,
          'conversation/getIsSending': false,
        },
      },
      activeCampaign: {},
      isIFrame: true,
      router: { replace: vi.fn() },
      resetCampaign: vi.fn(),
      unsetUnreadView: vi.fn(),
      cancelNewConversation() {
        return App.methods.cancelNewConversation.call(this);
      },
    };
    const listener = registerToggleOpenListener(component);

    listener({
      data: `chatwoot-widget:${JSON.stringify({
        event: 'toggle-open',
        isOpen: false,
      })}`,
    });

    expect(component.$store.dispatch).toHaveBeenCalledWith(
      'conversation/cancelNewConversation'
    );
    expect(component.resetCampaign).toHaveBeenCalled();
  });

  it('does not cancel an unsent replacement for non-iframe widget contexts', () => {
    const component = {
      $route: { name: 'messages' },
      $store: {
        dispatch: vi.fn(),
        getters: {
          'conversation/getIsStartingNewConversation': true,
          'conversation/getIsSending': false,
        },
      },
      activeCampaign: {},
      isIFrame: false,
      router: { replace: vi.fn() },
      resetCampaign: vi.fn(),
      unsetUnreadView: vi.fn(),
      cancelNewConversation() {
        return App.methods.cancelNewConversation.call(this);
      },
    };
    const listener = registerToggleOpenListener(component);

    listener({
      data: `chatwoot-widget:${JSON.stringify({
        event: 'toggle-open',
        isOpen: false,
      })}`,
    });

    expect(component.$store.dispatch).not.toHaveBeenCalledWith(
      'conversation/cancelNewConversation'
    );
    expect(component.resetCampaign).toHaveBeenCalled();
  });

  it('keeps an in-flight replacement while the SDK closes the widget', () => {
    const component = {
      $route: { name: 'messages' },
      $store: {
        dispatch: vi.fn(),
        getters: {
          'conversation/getIsStartingNewConversation': true,
          'conversation/getIsSending': true,
        },
      },
      activeCampaign: {},
      isIFrame: true,
      router: { replace: vi.fn() },
      resetCampaign: vi.fn(),
      unsetUnreadView: vi.fn(),
      cancelNewConversation() {
        return App.methods.cancelNewConversation.call(this);
      },
    };
    const listener = registerToggleOpenListener(component);

    listener({
      data: `chatwoot-widget:${JSON.stringify({
        event: 'toggle-open',
        isOpen: false,
      })}`,
    });

    expect(component.$store.dispatch).not.toHaveBeenCalledWith(
      'conversation/cancelNewConversation'
    );
    expect(component.resetCampaign).toHaveBeenCalled();
  });
});
