# Web Widget Conversation Context

This context defines the visitor-facing Web Widget conversation experience and the language used when a visitor starts or resumes a conversation.

## Language

**Web Widget**:
The customer-facing chat experience embedded in a website.
_Avoid_: dashboard chat, agent inbox

**Pre-chat form**:
A form configured to collect visitor identity or custom information before a conversation begins.
_Avoid_: start conversation page

**Welcome prompt**:
An optional administrator-written greeting shown as the first item in the conversation view when the pre-chat experience is enabled; it scrolls away with the conversation content.
_Avoid_: welcome message, first message

**Conversation**:
A support thread between a visitor and an organization, created when the visitor sends an actual message.
_Avoid_: chat session

**Resolved conversation**:
A conversation that has been closed. Depending on the inbox setting, the visitor may continue it and reopen it, or must choose to start a new conversation.
_Avoid_: closed chat

**New conversation**:
A fresh support thread started after a visitor chooses to continue from a resolved conversation.
_Avoid_: reopened conversation

**Webhook event**:
An externally delivered notification about persisted conversation or message activity; a welcome prompt is not a webhook event.
_Avoid_: UI event
