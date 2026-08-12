# Web Widget 直接進入對話 Spec

## Problem Statement

目前 Web Widget 在沒有既有對話時，使用者點擊 Widget icon 後會先進入 Pre-chat form。使用者必須先輸入內容並送出，才會建立 conversation 並進入 messages view。

這造成使用者需要經過兩個步驟才能看到對話視窗，也讓「查看歡迎提示」與「開始傳送訊息」被綁定在同一次操作。需求是讓使用者點擊 Widget icon 後直接進入 messages view，同時維持 Chatwoot 原有的 Conversation、Resolved conversation、Pre-chat 設定與 Webhook event 行為。

## Solution

所有標準 Web Widget 開啟路徑都直接進入 messages view。Conversation 不在 Widget icon、首頁按鈕或 SDK 開啟事件發生時建立，而是在使用者送出第一則實際文字或附件訊息時建立。

既有的 `allow_messages_after_resolved` Inbox 設定仍是 Resolved conversation 行為的唯一依據：

- 設定允許繼續傳訊息時，使用者可以直接在原本的 Resolved conversation 中傳訊息，該 conversation 依既有流程重新開啟。
- 設定不允許繼續傳訊息時，使用者會先看到原本的 Resolved conversation 與「開始新對話」操作。只有點擊該操作後，才會進入新的空白 messages state，第一則文字或附件訊息才會建立新的 Conversation。

管理員設定的 Pre-chat message 會以 frontend-only 的 Welcome prompt 顯示在 messages view 的第一個位置。它不是 Message、不會建立 Conversation、不會呼叫 Webhook，也會隨訊息內容自然滾動離開視窗。

## User Stories

1. As a visitor, I want to open the Web Widget directly to the messages view, so that I can see the conversation interface without completing a separate Pre-chat step.
2. As a visitor, I want the Widget icon to open the messages view even when no Conversation exists, so that I can decide what to write before starting a support thread.
3. As a visitor, I want no empty Conversation to be created when I only open the Widget, so that my inbox history contains only actual support requests.
4. As a visitor, I want to send my first text message from the messages view, so that the system creates a Conversation only when I actually contact the organization.
5. As a visitor, I want to send an attachment as my first message, so that I can start a Conversation with the relevant file without first sending text.
6. As an anonymous visitor, I want to send my first message without completing the Pre-chat form, so that I can contact support even when no contact identity is available.
7. As a visitor, I want the existing contact identity from the Widget SDK or browser session to be reused, so that direct entry does not create a duplicate contact flow.
8. As a visitor, I want an existing active Conversation to open directly in the messages view, so that I can continue reading and replying immediately.
9. As a visitor, I want unread Conversation content to open directly in the messages view, so that I do not have to pass through the Home or Pre-chat screen first.
10. As a visitor, I want an active campaign to retain priority over direct message entry, so that campaign interactions continue to work as configured.
11. As a visitor, I want to be able to send a message outside business hours, so that direct entry does not prevent me from contacting support.
12. As an administrator, I want the existing Pre-chat form settings to remain available, so that existing configuration and integrations remain compatible.
13. As an administrator, I want to configure an optional Welcome prompt, so that visitors can receive contextual guidance when they enter the messages view.
14. As an administrator, I want the Welcome prompt to appear only when Pre-chat is enabled and a nonblank prompt is configured, so that an incomplete configuration does not display unintended content.
15. As an administrator, I want an empty or whitespace-only prompt to be treated as absent, so that the Widget does not show a blank greeting item.
16. As a visitor, I want the Welcome prompt to appear before the conversation messages, so that I see the configured guidance when the messages view first opens.
17. As a visitor, I want the Welcome prompt to scroll away with the message list, so that it does not permanently occupy the conversation viewport.
18. As a visitor, I want the Welcome prompt to appear while viewing an existing, unread, or Resolved conversation, so that the configured guidance is consistent across entry states.
19. As an administrator, I want to use the existing Pre-chat editor and Markdown rendering behavior for the Welcome prompt, so that existing formatted content can be reused.
20. As an administrator, I want uploaded images in the Welcome prompt to use the existing storage URL flow, so that image content follows the current upload and sanitization model.
21. As an administrator, I do not need arbitrary raw HTML or inline Base64 image support in the Welcome prompt, so that the existing safe rendering and storage behavior remains unchanged.
22. As a visitor, I want a Resolved conversation that allows messages after resolution to open with its composer available, so that I can continue the same support thread without an extra confirmation.
23. As a visitor, I want my first message in an allowed Resolved conversation to reopen that existing Conversation through the current lifecycle, so that agents see the continuation in the same thread.
24. As a visitor, I want a Resolved conversation that disallows messages after resolution to show its transcript and a clear “Start new conversation” action, so that I understand why I cannot reply in the old thread.
25. As a visitor, I want the old Resolved transcript to remain visible until I explicitly choose “Start new conversation”, so that I can review the previous support context before creating a new thread.
26. As a visitor, I want the messages view to become a new blank conversation state only after choosing “Start new conversation”, so that merely opening a Resolved conversation never creates a new Conversation.
27. As a visitor, I want the first text or attachment sent after choosing “Start new conversation” to create a new Conversation, so that both supported message types follow the same new-thread behavior.
28. As a visitor, I want closing, going back, or pressing Escape before sending the first message of a replacement Conversation to cancel that unsent state, so that I can return to the original Resolved conversation without creating a new thread.
29. As a visitor, I want a replacement Conversation to use the same message composer and attachment behavior as a normal new Conversation, so that the direct-entry flow feels consistent.
30. As an SDK integrator, I want the existing `on_start_conversation` event to remain available, so that integrations depending on it continue to work.
31. As an SDK integrator, I want `on_start_conversation` to be emitted after the first actual message successfully creates a Conversation, so that opening the Widget alone is not reported as a started conversation.
32. As a visitor, I want the existing optimistic message and failure behavior to remain unchanged when sending fails, so that this feature does not introduce a new retry or draft workflow.
33. As an organization, I want persisted Conversation and Message lifecycle callbacks to remain unchanged, so that Webhook events continue to be emitted through the existing mechanism.
34. As an organization, I want the Welcome prompt to produce no persisted Message or Webhook event, so that UI guidance is not mistaken for visitor activity.
35. As an organization, I want the existing API behavior to remain compatible for clients that do not request a replacement Conversation while continuation is valid, so that current Widget clients continue to work. When the latest Conversation is Resolved and the Inbox disallows messages after resolution, a client must explicitly request the replacement flow instead of bypassing the “Start new conversation” choice.
36. As an administrator, I want this behavior to apply consistently to all standard Web Widgets, so that the product does not expose different direct-entry rules based on an unconfigured per-Inbox option.
37. As a product owner, I want this change to avoid database migrations, so that deployment does not require schema coordination or data backfills.

## Implementation Decisions

- Direct entry is implemented in the standard Web Widget frontend navigation for the Widget icon, Home action, and SDK open/toggle paths.
- Active campaign presentation retains priority over the direct messages entry behavior.
- The existing Pre-chat form configuration, API, and rendering components remain available for compatibility, but the Pre-chat form is no longer a blocking step before the first message in the standard Web Widget flow.
- Conversation creation remains lazy: opening the Widget and displaying the messages view do not create a Conversation. The first persisted visitor text or attachment message creates it.
- The existing `POST /api/v1/widget/messages` endpoint remains the backend seam for both ordinary first messages and replacement Conversations after resolution. No new endpoint is introduced.
- The endpoint accepts an optional one-shot `new_conversation` intent for the first message after the visitor explicitly chooses “Start new conversation”. The intent applies to both JSON text requests and multipart attachment requests.
- For an active Conversation, or for a Resolved Conversation whose Inbox allows messages after resolution, an absent or false intent preserves the existing message behavior. When the latest Conversation is Resolved and the Inbox disallows messages after resolution, an absent or false intent is rejected; only an explicit true intent after “Start new conversation” creates the replacement Conversation. Once consumed, the intent must not affect later messages in the same Conversation.
- The existing `allow_messages_after_resolved` Inbox setting remains authoritative. The frontend only exposes the replacement flow when the setting disallows continuing a Resolved conversation; the explicit new-Conversation intent must not become a second persisted setting or override the Inbox configuration.
- When continuing a Resolved conversation is allowed, the existing Conversation and Message callbacks reopen it through the current incoming-message lifecycle.
- When a replacement Conversation is requested, the backend creates the new Conversation before persisting the first visitor Message, while preserving existing contact, inbox, custom-attribute, label, and attachment handling.
- Existing Conversation and Message callbacks, Webhook event listeners, event names, and payload contracts are not changed.
- The existing `on_start_conversation` SDK event is retained and emitted after the first actual message has successfully created a Conversation, rather than when the Widget icon is clicked. The former pre-Conversation `hasConversation: false` click notification is intentionally not emitted.
- The Welcome prompt is derived from existing Widget configuration at render time. It is not stored as a Message, does not enter Vuex Conversation data, and does not call a backend endpoint.
- The Welcome prompt is rendered only when `pre_chat_form_enabled` is true and the configured Pre-chat message is nonblank. There is no fallback or default prompt added by this feature.
- The Welcome prompt uses the existing Pre-chat Markdown serialization, Markdown rendering, and sanitization behavior. Raw arbitrary HTML rendering is not added.
- Welcome-prompt images use the existing storage upload flow and URL-based Markdown. Inline Base64 image support is not added.
- The Welcome prompt is the first scrollable item in the messages view, not a sticky header and not an Agent Message bubble. Normal message-list scrolling determines when it leaves the viewport.
- The direct-entry behavior applies to standard Web Widgets only. Popout behavior and React Native WebView behavior remain unchanged.
- No database schema, migration, new persisted setting, or data backfill is required.
- Existing send-failure behavior is preserved. This feature does not add draft restoration, retry controls, or new failure semantics.

## Testing Decisions

- Tests should assert externally observable behavior: the route shown to the visitor, whether a Conversation or Message is persisted, which existing Conversation is used, the request contract for a replacement Conversation, and whether the Welcome prompt is visible. Tests should not assert private helper names or implementation-specific state transitions when the same behavior can be observed at a higher seam.
- The primary backend seam is the existing Widget messages request contract. Request tests should cover the default first-message path, the explicit replacement-Conversation path, text and attachment first messages, existing active Conversations, Resolved Conversations under both Inbox settings, custom attributes, labels, and preservation of the normal persisted Message lifecycle.
- Backend tests should verify that omitting or explicitly setting the replacement intent to false preserves existing behavior for active or continuation-allowed Conversations, rejects a Resolved Conversation when continuation is disabled, and that an explicit true intent creates a distinct new Conversation rather than appending to the Resolved one.
- Backend tests should verify that replacement requests preserve normal attachment persistence and that no separate endpoint or schema state is required.
- The primary frontend API seam is the existing Widget endpoint builder and conversation store actions. Tests should verify that text and multipart attachment requests can carry the replacement intent, that the intent is sent only for the first message after the explicit user action, and that subsequent messages omit it.
- Widget navigation and component tests should cover direct entry from the Widget icon, Home action, and SDK open/toggle paths; campaign priority; existing/unread Conversations; the Resolved allow/disallow branches; cancellation through close, back, and Escape; and the timing of the SDK start event.
- Welcome prompt component tests should cover the enabled-and-configured case, disabled configuration, missing or blank configuration, Markdown formatting, safe HTML handling, placement as the first scrollable item, and visibility across existing and Resolved Conversation states.
- Existing tests for Widget messages, Widget endpoint serialization, Conversation store actions, and the Pre-chat form are the prior art to extend. The implementation should add focused cases to these seams rather than introducing a parallel API or a new persistence test harness.
- Manual acceptance testing should confirm the complete flow in a real Widget: open without sending, send first text, send first attachment, open an existing conversation, test both Resolved setting values, cancel a replacement flow, verify campaign priority, and confirm that the Welcome prompt scrolls away and never appears as a Webhook-triggering Message.

## Out of Scope

- Publishing an issue, creating a Pull Request, pushing a branch, or making any GitHub change is out of scope for this document.
- Changing database schema, adding migrations, backfilling data, or adding a new persisted configuration is out of scope.
- Adding a new Widget API endpoint or changing the existing `/api/v1/widget/conversations` contract is out of scope.
- Changing Webhook event listeners, event names, payloads, delivery behavior, or persisted Conversation and Message callbacks is out of scope.
- Removing the existing Pre-chat form configuration, API, or components is out of scope.
- Adding arbitrary raw HTML rendering, inline Base64 image support, a new image storage system, or a new Markdown dialect is out of scope.
- Adding a default Welcome prompt, making the prompt sticky, persisting it as a Message, or sending it to a Webhook is out of scope.
- Adding retry controls, draft restoration, or new send-failure behavior is out of scope.
- Changing popout Widget behavior or React Native WebView behavior is out of scope.
- Adding a per-Inbox switch for direct entry is out of scope; the existing Resolved-message setting remains the only relevant Inbox-level choice.

## Further Notes

- The backend change is intentionally narrow: production backend behavior is concentrated in the existing Widget messages endpoint, with request coverage added around that contract. Frontend navigation and request construction still need coordinated changes because the endpoint must know when the visitor explicitly started a replacement Conversation.
- Existing clients that do not send the optional replacement intent continue to use the established message flow for active Conversations and Resolved Conversations where continuation is allowed. For a Resolved Conversation where continuation is disabled, the explicit replacement intent is required so the backend enforces the Widget's “Start new conversation” decision.
- A client-visible send failure continues to follow the current optimistic-message behavior. It does not guarantee that no server-side Conversation or Webhook event occurred if the request reached the server before the failure was observed.
- This spec is a local project document generated from the agreed conversation design. It is intentionally not published to GitHub.
