import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import ActionCableConnector from '../actionCable';

vi.mock('@rails/actioncable', () => ({
  createConsumer: () => ({
    subscriptions: { create: () => ({}) },
    disconnect: vi.fn(),
  }),
}));

describe('Widget ActionCableConnector', () => {
  let app;
  let mockDispatch;
  let connector;

  beforeEach(() => {
    vi.useFakeTimers();
    mockDispatch = vi.fn();
    app = {
      $store: {
        dispatch: mockDispatch,
        getters: {
          getCurrentAccountId: 1,
          getCurrentUserID: 1,
          'conversation/getIsStartingNewConversation': false,
        },
      },
    };
    connector = new ActionCableConnector(app, 'test-token');
    mockDispatch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('registers the conversation.status_changed event handler', () => {
    expect(connector.events['conversation.status_changed']).toBe(
      connector.onStatusChange
    );
  });

  it('re-fetches conversation attributes on reconnect so a status change missed while disconnected is reflected', () => {
    connector.onReconnect();

    expect(mockDispatch).toHaveBeenCalledWith(
      'conversation/syncLatestMessages'
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      'conversationAttributes/getAttributes'
    );
  });

  it('does not reconnect or sync the previous conversation while starting a new one', () => {
    app.$store.getters['conversation/getIsStartingNewConversation'] = true;

    connector.onReconnect();

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('ignores messages from the previous conversation while starting a new one', () => {
    app.$store.getters['conversation/getIsStartingNewConversation'] = true;

    connector.onMessageCreated({
      id: 42,
      conversation_id: 7,
      content: 'old message',
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
