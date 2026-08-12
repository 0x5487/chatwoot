---
status: accepted
---

# Direct Web Widget Conversation Entry

The Web Widget should open directly to the messages view for all widgets, while creating a conversation only when the visitor sends the first actual message. The existing pre-chat configuration remains available for the optional welcome prompt, the inbox setting for messages after resolution remains authoritative, and the existing webhook lifecycle remains unchanged because only persisted conversations and messages emit webhook events.

## Consequences

- Visitors no longer need to complete the pre-chat form before seeing the composer.
- Anonymous visitors can send the first message when no contact identity is available.
- When messages after resolution are allowed, the existing resolved conversation remains reusable and is reopened by the incoming message.
- When messages after resolution are disabled, the visitor must explicitly start a new conversation.
- The welcome prompt is frontend-only and scrolls with the message list.
- Message-send failures retain the existing Widget behavior rather than adding a new retry flow.
- The change must not alter the database schema or add a migration.
- The direct-entry behavior applies to all standard Web Widget opening paths, including SDK open/toggle calls.
- A replacement conversation after resolution uses the existing widget messages endpoint only when the inbox disallows messages after resolution and the visitor explicitly starts a new conversation.
- Cancelling an unsent replacement conversation restores the resolved conversation in the Widget.
- The optional welcome prompt keeps the existing Pre-chat text rendering and sanitization behavior.
- Welcome-prompt images use the existing storage-upload URL flow; inline Base64 images are not added.
