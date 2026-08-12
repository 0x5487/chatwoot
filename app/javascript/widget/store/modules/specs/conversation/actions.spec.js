import { actions } from '../../conversation/actions';
import getUuid from '../../../../helpers/uuid';
import { API } from 'widget/helpers/axios';

vi.mock('../../../../helpers/uuid');
vi.mock('widget/helpers/axios');

const commit = vi.fn();
const dispatch = vi.fn();

describe('#actions', () => {
  describe('#createConversation', () => {
    it('sends correct mutations', async () => {
      API.post.mockResolvedValue({
        data: {
          contact: { name: 'contact-name' },
          messages: [{ id: 1, content: 'This is a test message' }],
        },
      });

      let windowSpy = vi.spyOn(window, 'window', 'get');
      windowSpy.mockImplementation(() => ({
        WOOT_WIDGET: {
          $root: {
            $i18n: {
              locale: 'el',
            },
          },
        },
        location: {
          search: '?param=1',
        },
      }));
      await actions.createConversation(
        { commit },
        { contact: {}, message: 'This is a test message' }
      );
      expect(commit.mock.calls).toEqual([
        ['setConversationUIFlag', { isCreating: true }],
        [
          'pushMessageToConversation',
          { id: 1, content: 'This is a test message' },
        ],
        ['setConversationUIFlag', { isCreating: false }],
      ]);
      windowSpy.mockRestore();
    });
  });

  describe('#addOrUpdateMessage', () => {
    it('sends correct actions for non-deleted message', () => {
      actions.addOrUpdateMessage(
        { commit },
        {
          id: 1,
          content: 'Hey',
          content_attributes: {},
        }
      );
      expect(commit).toBeCalledWith('pushMessageToConversation', {
        id: 1,
        content: 'Hey',
        content_attributes: {},
      });
    });
    it('sends correct actions for non-deleted message', () => {
      actions.addOrUpdateMessage(
        { commit },
        {
          id: 1,
          content: 'Hey',
          content_attributes: { deleted: true },
        }
      );
      expect(commit).toBeCalledWith('deleteMessage', 1);
    });

    it('plays audio when agent sends a message', () => {
      actions.addOrUpdateMessage({ commit }, { id: 1, message_type: 1 });
      expect(commit).toBeCalledWith('pushMessageToConversation', {
        id: 1,
        message_type: 1,
      });
    });
  });

  describe('#toggleAgentTyping', () => {
    it('sends correct mutations', () => {
      actions.toggleAgentTyping({ commit }, { status: true });
      expect(commit).toBeCalledWith('toggleAgentTypingStatus', {
        status: true,
      });
    });
  });

  describe('#sendMessage', () => {
    it('sends correct mutations', async () => {
      const mockDate = new Date(1466424490000);
      getUuid.mockImplementationOnce(() => '1111');
      const spy = vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
      const windowSpy = vi.spyOn(window, 'window', 'get');
      windowSpy.mockImplementation(() => ({
        WOOT_WIDGET: {
          $root: {
            $i18n: {
              locale: 'ar',
            },
          },
        },
        location: {
          search: '?param=1',
        },
      }));
      const state = { pendingCustomAttributes: {}, pendingLabels: [] };
      await actions.sendMessage(
        { commit, dispatch, state },
        { content: 'hello', replyTo: 124 }
      );
      spy.mockRestore();
      windowSpy.mockRestore();
      expect(dispatch).toBeCalledWith('sendMessageWithData', {
        message: {
          attachments: undefined,
          content: 'hello',
          created_at: 1466424490,
          id: '1111',
          message_type: 0,
          replyTo: 124,
          status: 'in_progress',
        },
        pendingCustomAttributes: {},
        pendingLabels: [],
      });
    });

    it('includes pending metadata when available', async () => {
      const mockDate = new Date(1466424490000);
      getUuid.mockImplementationOnce(() => '2222');
      const spy = vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
      const state = {
        pendingCustomAttributes: { plan: 'enterprise' },
        pendingLabels: ['vip'],
      };
      await actions.sendMessage(
        { commit, dispatch, state },
        { content: 'hello' }
      );
      spy.mockRestore();
      expect(dispatch).toBeCalledWith('sendMessageWithData', {
        message: expect.objectContaining({ content: 'hello' }),
        pendingCustomAttributes: { plan: 'enterprise' },
        pendingLabels: ['vip'],
      });
    });

    it('marks the first message as starting a new conversation', async () => {
      const mockDate = new Date(1466424490000);
      getUuid.mockImplementationOnce(() => '3333');
      const spy = vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
      const state = {
        pendingCustomAttributes: {},
        pendingLabels: [],
        uiFlags: { isStartingNewConversation: true },
      };

      await actions.sendMessage(
        { commit, dispatch, state },
        { content: 'new thread' }
      );

      spy.mockRestore();
      expect(dispatch).toBeCalledWith(
        'sendMessageWithData',
        expect.objectContaining({ newConversation: true })
      );
    });

    it('does not dispatch while a message request is in progress', async () => {
      const localDispatch = vi.fn();
      const state = {
        pendingCustomAttributes: {},
        pendingLabels: [],
        uiFlags: { isStartingNewConversation: true, isSending: true },
      };

      await actions.sendMessage(
        { commit: vi.fn(), dispatch: localDispatch, state },
        { content: 'second message' }
      );

      expect(localDispatch).not.toHaveBeenCalled();
    });
  });

  describe('#sendAttachment', () => {
    it('sends correct mutations', () => {
      const mockDate = new Date(1466424490000);
      getUuid.mockImplementationOnce(() => '1111');
      const spy = vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
      const thumbUrl = '';
      const attachment = { thumbUrl, fileType: 'file' };
      const state = { pendingCustomAttributes: {}, pendingLabels: [] };

      actions.sendAttachment(
        { commit, dispatch, state },
        { attachment, replyTo: 135 }
      );
      spy.mockRestore();
      expect(commit).toBeCalledWith('pushMessageToConversation', {
        id: '1111',
        content: undefined,
        status: 'in_progress',
        created_at: 1466424490,
        message_type: 0,
        replyTo: 135,
        attachments: [
          {
            thumb_url: '',
            data_url: '',
            file_type: 'file',
            status: 'in_progress',
          },
        ],
      });
    });
  });

  describe('#sendMessageWithData', () => {
    it('does not send while another message request is in progress', async () => {
      API.post.mockClear();
      const state = {
        conversations: {},
        uiFlags: { isStartingNewConversation: true, isSending: true },
      };

      const result = await actions.sendMessageWithData(
        { commit: vi.fn(), dispatch: vi.fn(), state },
        {
          message: {
            id: 'temporary-id',
            content: 'second message',
            status: 'in_progress',
            newConversation: true,
          },
        }
      );

      expect(result).toBeUndefined();
      expect(API.post).not.toHaveBeenCalled();
    });

    it('does not block a regular message while a replacement request is in progress', async () => {
      API.post.mockResolvedValue({
        data: {
          id: 11,
          content: 'second message',
          message_type: 0,
          status: 'sent',
        },
      });
      const state = {
        conversations: {
          10: { id: 10, status: 'sent' },
        },
        uiFlags: { isSending: true },
      };
      window.WOOT_WIDGET = {
        $root: { $i18n: { locale: 'en' } },
      };

      await actions.sendMessageWithData(
        {
          commit: vi.fn(),
          dispatch: vi.fn(),
          rootGetters: {
            'conversationAttributes/getConversationParams': { id: 1 },
          },
          state,
        },
        {
          message: {
            id: 'temporary-id',
            content: 'second message',
            status: 'in_progress',
          },
        }
      );

      expect(API.post).toHaveBeenCalled();
    });

    it('sends the replacement intent and reports a created conversation', async () => {
      API.post.mockResolvedValue({
        data: {
          id: 10,
          content: 'new thread',
          message_type: 0,
          status: 'sent',
        },
      });
      const localCommit = vi.fn();
      const localDispatch = vi.fn();
      const state = {
        conversations: {},
        uiFlags: { isStartingNewConversation: true },
      };
      window.WOOT_WIDGET = {
        $root: { $i18n: { locale: 'en' } },
      };

      const result = await actions.sendMessageWithData(
        { commit: localCommit, dispatch: localDispatch, state },
        {
          message: {
            id: 'temporary-id',
            content: 'new thread',
            message_type: 0,
            status: 'in_progress',
          },
          newConversation: true,
        }
      );

      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/widget/messages'),
        expect.objectContaining({ new_conversation: true })
      );
      expect(result).toEqual({
        conversationCreated: true,
        hasConversation: true,
      });
    });
  });

  describe('#cancelNewConversation', () => {
    it('does not restore the previous conversation while sending', () => {
      const localCommit = vi.fn();
      const localDispatch = vi.fn();

      actions.cancelNewConversation({
        commit: localCommit,
        dispatch: localDispatch,
        getters: { getIsSending: true },
      });

      expect(localCommit).not.toHaveBeenCalled();
      expect(localDispatch).not.toHaveBeenCalled();
    });
  });

  describe('#setUserLastSeen', () => {
    it('sends correct mutations', async () => {
      API.post.mockResolvedValue({ data: { success: true } });
      await actions.setUserLastSeen({
        commit,
        getters: { getConversationSize: 2 },
      });
      expect(commit.mock.calls[0][0]).toEqual('setMetaUserLastSeenAt');
    });
    it('sends correct mutations', async () => {
      API.post.mockResolvedValue({ data: { success: true } });
      await actions.setUserLastSeen({
        commit,
        getters: { getConversationSize: 0 },
      });
      expect(commit.mock.calls).toEqual([]);
    });
  });

  describe('#setCustomAttributes', () => {
    it('queues to pending state when no conversation exists', async () => {
      const rootGetters = {
        'conversationAttributes/getConversationParams': { id: '' },
      };
      await actions.setCustomAttributes(
        { commit, rootGetters },
        { plan: 'enterprise' }
      );
      expect(commit).toBeCalledWith('setPendingCustomAttributes', {
        plan: 'enterprise',
      });
    });

    it('calls API when conversation exists', async () => {
      API.post.mockResolvedValue({ data: {} });
      const rootGetters = {
        'conversationAttributes/getConversationParams': { id: 123 },
      };
      await actions.setCustomAttributes(
        { commit, rootGetters },
        { plan: 'enterprise' }
      );
      expect(commit).not.toBeCalledWith(
        'setPendingCustomAttributes',
        expect.anything()
      );
    });
  });

  describe('#deleteCustomAttribute', () => {
    it('removes from pending state when no conversation exists', async () => {
      const rootGetters = {
        'conversationAttributes/getConversationParams': { id: '' },
      };
      await actions.deleteCustomAttribute({ commit, rootGetters }, 'plan');
      expect(commit).toBeCalledWith('removePendingCustomAttribute', 'plan');
    });

    it('calls API when conversation exists', async () => {
      API.post.mockResolvedValue({ data: {} });
      const rootGetters = {
        'conversationAttributes/getConversationParams': { id: 123 },
      };
      await actions.deleteCustomAttribute({ commit, rootGetters }, 'plan');
      expect(commit).not.toBeCalledWith(
        'removePendingCustomAttribute',
        expect.anything()
      );
    });
  });

  describe('#clearConversations', () => {
    it('sends correct mutations', () => {
      actions.clearConversations({ commit });
      expect(commit).toBeCalledWith('clearConversations');
    });
  });

  describe('#fetchOldConversations', () => {
    it('sends correct actions', async () => {
      API.get.mockResolvedValue({
        data: {
          payload: [
            {
              id: 1,
              text: 'hey',
              content_attributes: {},
            },
            {
              id: 2,
              text: 'welcome',
              content_attributes: { deleted: true },
            },
          ],
          meta: {
            contact_last_seen_at: 1466424490,
          },
        },
      });
      await actions.fetchOldConversations({ commit }, {});
      expect(commit.mock.calls).toEqual([
        ['setConversationListLoading', true],
        ['conversation/setMetaUserLastSeenAt', 1466424490, { root: true }],
        [
          'setMessagesInConversation',
          [
            {
              id: 1,
              text: 'hey',
              content_attributes: {},
            },
          ],
        ],
        ['setConversationListLoading', false],
      ]);
    });
  });

  describe('#syncLatestMessages', () => {
    it('does not sync the previous conversation while starting a new one', async () => {
      const localCommit = vi.fn();
      const state = {
        conversations: {},
        lastMessageId: null,
      };

      await actions.syncLatestMessages(
        {
          state,
          commit: localCommit,
          rootGetters: {
            'conversation/getIsStartingNewConversation': true,
          },
        },
        {}
      );

      expect(API.get).not.toHaveBeenCalled();
      expect(localCommit).not.toHaveBeenCalled();
    });

    it('latest message should append to end of list', async () => {
      const state = {
        uiFlags: { allMessagesLoaded: false },
        conversations: {
          454: {
            id: 454,
            content: 'hi',
            message_type: 0,
            content_type: 'text',
            content_attributes: {},
            created_at: 1682244355, //  Sunday, 23 April 2023 10:05:55
            conversation_id: 20,
          },
          463: {
            id: 463,
            content: 'ss',
            message_type: 0,
            content_type: 'text',
            content_attributes: {},
            created_at: 1682490729, // Wednesday, 26 April 2023 06:32:09
            conversation_id: 20,
          },
        },
        lastMessageId: 463,
      };
      API.get.mockResolvedValue({
        data: {
          payload: [
            {
              id: 465,
              content: 'hi',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682504326, // Wednesday, 26 April 2023 10:18:46
              conversation_id: 20,
            },
          ],
          meta: {
            contact_last_seen_at: 1466424490,
          },
        },
      });
      await actions.syncLatestMessages({ state, commit }, {});
      expect(commit.mock.calls).toEqual([
        ['conversation/setMetaUserLastSeenAt', 1466424490, { root: true }],
        [
          'setMissingMessagesInConversation',

          {
            454: {
              id: 454,
              content: 'hi',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682244355,
              conversation_id: 20,
            },
            463: {
              id: 463,
              content: 'ss',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682490729,
              conversation_id: 20,
            },
            465: {
              id: 465,
              content: 'hi',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682504326,
              conversation_id: 20,
            },
          },
        ],
      ]);
    });

    it('old message should insert to exact position', async () => {
      const state = {
        uiFlags: { allMessagesLoaded: false },
        conversations: {
          454: {
            id: 454,
            content: 'hi',
            message_type: 0,
            content_type: 'text',
            content_attributes: {},
            created_at: 1682244355, //  Sunday, 23 April 2023 10:05:55
            conversation_id: 20,
          },
          463: {
            id: 463,
            content: 'ss',
            message_type: 0,
            content_type: 'text',
            content_attributes: {},
            created_at: 1682490729, // Wednesday, 26 April 2023 06:32:09
            conversation_id: 20,
          },
        },
        lastMessageId: 463,
      };
      API.get.mockResolvedValue({
        data: {
          payload: [
            {
              id: 460,
              content: 'Hi how are you',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682417926, // Tuesday, 25 April 2023 10:18:46
              conversation_id: 20,
            },
          ],
          meta: {
            contact_last_seen_at: 14664223490,
          },
        },
      });
      await actions.syncLatestMessages({ state, commit }, {});

      expect(commit.mock.calls).toEqual([
        ['conversation/setMetaUserLastSeenAt', 14664223490, { root: true }],
        [
          'setMissingMessagesInConversation',

          {
            454: {
              id: 454,
              content: 'hi',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682244355,
              conversation_id: 20,
            },
            460: {
              id: 460,
              content: 'Hi how are you',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682417926,
              conversation_id: 20,
            },
            463: {
              id: 463,
              content: 'ss',
              message_type: 0,
              content_type: 'text',
              content_attributes: {},
              created_at: 1682490729,
              conversation_id: 20,
            },
          },
        ],
      ]);
    });

    it('abort syncing if there is no missing messages ', async () => {
      const state = {
        uiFlags: { allMessagesLoaded: false },
        conversation: {
          454: {
            id: 454,
            content: 'hi',
            message_type: 0,
            content_type: 'text',
            content_attributes: {},
            created_at: 1682244355, //  Sunday, 23 April 2023 10:05:55
            conversation_id: 20,
          },
          463: {
            id: 463,
            content: 'ss',
            message_type: 0,
            content_type: 'text',
            content_attributes: {},
            created_at: 1682490729, // Wednesday, 26 April 2023 06:32:09
            conversation_id: 20,
          },
        },
        lastMessageId: 463,
      };
      API.get.mockResolvedValue({
        data: {
          payload: [],
          meta: {
            contact_last_seen_at: 14664223490,
          },
        },
      });
      await actions.syncLatestMessages({ state, commit }, {});

      expect(commit.mock.calls).toEqual([]);
    });
  });
});
