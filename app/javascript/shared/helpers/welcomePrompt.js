export const WELCOME_PROMPT_ICON_OPTIONS = [
  {
    value: 'chat',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.CHAT',
  },
  {
    value: 'document',
    label:
      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.DOCUMENT',
  },
  {
    value: 'link',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.LINK',
  },
  {
    value: 'search',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.SEARCH',
  },
  {
    value: 'arrow-reply',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.REPLY',
  },
  {
    value: 'attach',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.ATTACH',
  },
  {
    value: 'globe',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.GLOBE',
  },
  {
    value: 'more-vertical',
    label: 'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICONS.MORE',
  },
];

export const DEFAULT_WELCOME_PROMPT_ICON = WELCOME_PROMPT_ICON_OPTIONS[0].value;

const cleanText = value => (typeof value === 'string' ? value.trim() : '');

export const getWelcomePromptIcon = icon => {
  const isSupportedIcon = WELCOME_PROMPT_ICON_OPTIONS.some(
    option => option.value === icon
  );
  return isSupportedIcon ? icon : DEFAULT_WELCOME_PROMPT_ICON;
};

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
