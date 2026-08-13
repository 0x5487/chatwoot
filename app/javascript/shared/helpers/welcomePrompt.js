export const WELCOME_PROMPT_ICON_OPTIONS = [
  {
    value: 'chat',
    emoji: '💳',
    label:
      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.CREDIT_CARD',
  },
  {
    value: 'document',
    emoji: '💵',
    label:
      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.CURRENCY',
  },
  {
    value: 'link',
    emoji: '🎁',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.GIFT',
  },
  {
    value: 'search',
    emoji: '👤',
    label:
      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.ACCOUNT',
  },
  {
    value: 'arrow-reply',
    emoji: '🎮',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.GAME',
  },
  {
    value: 'attach',
    emoji: '🤝',
    label:
      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.PARTNERSHIP',
  },
  {
    value: 'globe',
    emoji: '❓',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.FAQ',
  },
  {
    value: 'more-vertical',
    emoji: '🎧',
    label:
      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.HUMAN_AGENT',
  },
  {
    value: 'receipt',
    emoji: '🧾',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.ORDER',
  },
];

export const DEFAULT_WELCOME_PROMPT_ICON = WELCOME_PROMPT_ICON_OPTIONS[0].value;

const cleanText = value => (typeof value === 'string' ? value.trim() : '');

export const getWelcomePromptIconOption = icon =>
  WELCOME_PROMPT_ICON_OPTIONS.find(option => option.value === icon) ||
  WELCOME_PROMPT_ICON_OPTIONS[0];

export const getWelcomePromptIcon = icon =>
  getWelcomePromptIconOption(icon).value;

export const getWelcomePromptIconEmoji = icon =>
  getWelcomePromptIconOption(icon).emoji;

export const normalizeWelcomePrompt = (prompt = {}) => {
  const safePrompt = prompt && typeof prompt === 'object' ? prompt : {};
  const quickActions = Array.isArray(safePrompt.quick_actions)
    ? safePrompt.quick_actions
    : [];
  const suggestedQuestions = Array.isArray(safePrompt.suggested_questions)
    ? safePrompt.suggested_questions
    : [];

  return {
    quickActions: quickActions
      .map(action => {
        const label = cleanText(action?.label);
        return label
          ? { label, icon: getWelcomePromptIcon(action?.icon) }
          : null;
      })
      .filter(Boolean),
    suggestedQuestions: suggestedQuestions.map(cleanText).filter(Boolean),
  };
};

export const serializeWelcomePrompt = ({
  quickActions = [],
  suggestedQuestions = '',
} = {}) => {
  let questionLines = [];
  if (Array.isArray(suggestedQuestions)) {
    questionLines = suggestedQuestions;
  } else if (typeof suggestedQuestions === 'string') {
    questionLines = suggestedQuestions.split(/\r?\n/);
  }

  return {
    quick_actions: quickActions
      .map(action => {
        const label = cleanText(action?.label);
        return label
          ? { label, icon: getWelcomePromptIcon(action?.icon) }
          : null;
      })
      .filter(Boolean),
    suggested_questions: questionLines.map(cleanText).filter(Boolean),
  };
};
