import {
  getWelcomePromptIcon,
  normalizeWelcomePrompt,
  serializeWelcomePrompt,
} from '../welcomePrompt';

describe('welcome prompt helpers', () => {
  it('normalizes configured actions and questions without inventing content', () => {
    expect(
      normalizeWelcomePrompt({
        quick_actions: [
          { label: '  Billing  ', icon: 'document' },
          { label: '', icon: 'chat' },
        ],
        suggested_questions: ['  How long?  ', '', 'Where is my order?'],
      })
    ).toEqual({
      quickActions: [{ label: 'Billing', icon: 'document' }],
      suggestedQuestions: ['How long?', 'Where is my order?'],
    });
  });

  it('serializes one question per line and keeps every configured action', () => {
    expect(
      serializeWelcomePrompt({
        quickActions: [
          { label: 'Billing', icon: 'document' },
          { label: 'Support', icon: 'invalid-icon' },
        ],
        suggestedQuestions: 'How long?\n\nWhere is my order?',
      })
    ).toEqual({
      quick_actions: [
        { label: 'Billing', icon: 'document' },
        { label: 'Support', icon: 'chat' },
      ],
      suggested_questions: ['How long?', 'Where is my order?'],
    });
  });

  it('falls back to a supported icon for stale configuration', () => {
    expect(getWelcomePromptIcon('invalid-icon')).toBe('chat');
  });

  it('treats missing prompt values as empty configuration', () => {
    expect(normalizeWelcomePrompt(null)).toEqual({
      quickActions: [],
      suggestedQuestions: [],
    });
    expect(
      serializeWelcomePrompt({ quickActions: [], suggestedQuestions: null })
    ).toEqual({
      quick_actions: [],
      suggested_questions: [],
    });
  });
});
