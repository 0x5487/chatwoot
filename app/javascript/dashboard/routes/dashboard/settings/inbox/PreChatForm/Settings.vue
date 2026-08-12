<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useMapGetter } from 'dashboard/composables/store';
import { useAlert } from 'dashboard/composables';
import PreChatFields from './PreChatFields.vue';
import { getPreChatFields } from 'dashboard/helper/preChat';
import WootMessageEditor from 'dashboard/components/widgets/WootWriter/Editor.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import SettingsToggleSection from 'dashboard/components-next/Settings/SettingsToggleSection.vue';
import {
  DEFAULT_WELCOME_PROMPT_ICON,
  normalizeWelcomePrompt,
  serializeWelcomePrompt,
} from 'shared/helpers/welcomePrompt';
import QuickActionIconPicker from './QuickActionIconPicker.vue';

const props = defineProps({
  inbox: {
    type: Object,
    default: () => ({}),
  },
});

const { t } = useI18n();
const store = useStore();

const uiFlags = useMapGetter('inboxes/getUIFlags');
const customAttributes = useMapGetter('attributes/getAttributes');

const preChatFormEnabled = ref(false);
const preChatMessage = ref('');
const preChatFields = ref([]);
const quickActions = ref([]);
const suggestedQuestions = ref('');

const preChatFieldOptions = computed(() => {
  const { pre_chat_form_options: preChatFormOptions } = props.inbox;
  return getPreChatFields({
    preChatFormOptions,
    customAttributes: customAttributes.value,
  });
});

const tableHeaders = computed(() => [
  '',
  '',
  t('INBOX_MGMT.PRE_CHAT_FORM.SET_FIELDS_HEADER.KEY'),
  t('INBOX_MGMT.PRE_CHAT_FORM.SET_FIELDS_HEADER.TYPE'),
  t('INBOX_MGMT.PRE_CHAT_FORM.SET_FIELDS_HEADER.REQUIRED'),
  t('INBOX_MGMT.PRE_CHAT_FORM.SET_FIELDS_HEADER.LABEL'),
  t('INBOX_MGMT.PRE_CHAT_FORM.SET_FIELDS_HEADER.PLACE_HOLDER'),
]);

const setDefaults = () => {
  const { pre_chat_form_enabled: formEnabled } = props.inbox;
  preChatFormEnabled.value = formEnabled;
  const { pre_chat_message: message, pre_chat_fields: fields } =
    preChatFieldOptions.value || {};
  preChatMessage.value = message || '';
  preChatFields.value = fields || [];

  const welcomePrompt = normalizeWelcomePrompt(
    props.inbox.pre_chat_form_options?.welcome_prompt
  );
  quickActions.value = welcomePrompt.quickActions;
  suggestedQuestions.value = welcomePrompt.suggestedQuestions.join('\n');
};

const addQuickAction = () => {
  quickActions.value.push({
    label: '',
    icon: DEFAULT_WELCOME_PROMPT_ICON,
  });
};

const removeQuickAction = index => {
  quickActions.value.splice(index, 1);
};

const handlePreChatFieldOptions = (event, type, item) => {
  preChatFields.value.forEach((field, index) => {
    if (field.name === item.name) {
      preChatFields.value[index][type] = !item[type];
    }
  });
};

const changePreChatFieldFieldsOrder = updatedPreChatFieldOptions => {
  preChatFields.value = updatedPreChatFieldOptions;
};

const updateInbox = async () => {
  try {
    const payload = {
      id: props.inbox.id,
      formData: false,
      channel: {
        pre_chat_form_enabled: preChatFormEnabled.value,
        pre_chat_form_options: {
          pre_chat_message: preChatMessage.value,
          pre_chat_fields: preChatFields.value,
          welcome_prompt: serializeWelcomePrompt({
            quickActions: quickActions.value,
            suggestedQuestions: suggestedQuestions.value,
          }),
        },
      },
    };
    await store.dispatch('inboxes/updateInbox', payload);
    useAlert(t('INBOX_MGMT.EDIT.API.SUCCESS_MESSAGE'));
  } catch (error) {
    useAlert(t('INBOX_MGMT.EDIT.API.ERROR_MESSAGE'));
  }
};

watch(() => props.inbox, setDefaults);

onMounted(() => {
  setDefaults();
});
</script>

<template>
  <div class="mx-6">
    <SettingsToggleSection
      v-model="preChatFormEnabled"
      :header="$t('INBOX_MGMT.PRE_CHAT_FORM.ENABLE.LABEL')"
      :description="$t('INBOX_MGMT.PRE_CHAT_FORM.DESCRIPTION')"
    >
      <template v-if="preChatFormEnabled" #editor>
        <WootMessageEditor
          v-model="preChatMessage"
          :placeholder="
            $t('INBOX_MGMT.PRE_CHAT_FORM.PRE_CHAT_MESSAGE.PLACEHOLDER')
          "
        />
      </template>
    </SettingsToggleSection>
    <SettingsToggleSection
      v-if="preChatFormEnabled"
      class="mt-6"
      :header="$t('INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.TITLE')"
      :description="$t('INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.DESCRIPTION')"
      hide-toggle
    >
      <template #editor>
        <div class="flex flex-col gap-6">
          <div>
            <label
              for="suggested-questions"
              class="mb-1 block text-sm font-medium text-n-slate-12"
            >
              {{
                $t(
                  'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.SUGGESTED_QUESTIONS.LABEL'
                )
              }}
            </label>
            <textarea
              id="suggested-questions"
              v-model="suggestedQuestions"
              rows="8"
              :placeholder="
                $t(
                  'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.SUGGESTED_QUESTIONS.PLACEHOLDER'
                )
              "
              class="w-full min-h-32 max-h-48 resize-y overflow-y-auto rounded-lg border border-n-weak bg-n-alpha-black2 px-3 py-2 text-sm text-n-slate-12 placeholder:text-n-slate-10 focus:border-n-brand focus:outline-none"
            />
            <p class="mt-1.5 text-xs text-n-slate-11">
              {{
                $t(
                  'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.SUGGESTED_QUESTIONS.DESCRIPTION'
                )
              }}
            </p>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="mb-1 text-sm font-medium text-n-slate-12">
                  {{
                    $t(
                      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.LABEL'
                    )
                  }}
                </p>
                <p class="text-xs text-n-slate-11">
                  {{
                    $t(
                      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.DESCRIPTION'
                    )
                  }}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                :label="
                  $t(
                    'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ADD'
                  )
                "
                @click="addQuickAction"
              />
            </div>

            <div v-if="quickActions.length" class="flex flex-col gap-2">
              <div
                v-for="(action, index) in quickActions"
                :key="index"
                class="grid grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)_auto] items-end gap-2"
              >
                <label class="flex flex-col gap-1 text-xs text-n-slate-11">
                  {{
                    $t(
                      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.DISPLAY_NAME'
                    )
                  }}
                  <input
                    v-model="action.label"
                    type="text"
                    :placeholder="
                      $t(
                        'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.DISPLAY_NAME_PLACEHOLDER'
                      )
                    "
                    class="h-10 w-full rounded-lg border border-n-weak bg-n-alpha-black2 px-3 text-sm text-n-slate-12 placeholder:text-n-slate-10 focus:border-n-brand focus:outline-none"
                  />
                </label>
                <div class="flex flex-col gap-1 text-xs text-n-slate-11">
                  <span>
                    {{
                      $t(
                        'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.ICON'
                      )
                    }}
                  </span>
                  <QuickActionIconPicker v-model="action.icon" />
                </div>
                <button
                  type="button"
                  class="mb-1 flex size-8 items-center justify-center rounded-md text-n-ruby-9 hover:bg-n-ruby-9/10"
                  :aria-label="
                    $t(
                      'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.REMOVE'
                    )
                  "
                  @click="removeQuickAction(index)"
                >
                  <span class="i-lucide-trash-2 size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <p v-else class="text-sm text-n-slate-11">
              {{
                $t(
                  'INBOX_MGMT.PRE_CHAT_FORM.WELCOME_PROMPT.QUICK_ACTIONS.EMPTY'
                )
              }}
            </p>
          </div>
        </div>
      </template>
    </SettingsToggleSection>
    <div v-if="preChatFormEnabled" class="flex items-center my-8 py-1">
      <div class="flex-1 h-px bg-n-weak" />
      <span class="text-body-main text-n-slate-11 px-2">
        {{ $t('INBOX_MGMT.PRE_CHAT_FORM.SET_FIELDS') }}
      </span>
      <div class="flex-1 h-px bg-n-weak" />
    </div>
    <form class="flex flex-col" @submit.prevent="updateInbox">
      <div v-if="preChatFormEnabled">
        <div class="w-full">
          <table
            class="min-w-full table-auto outline outline-1 -outline-offset-1 outline-n-weak rounded-xl"
          >
            <thead>
              <tr class="border-b border-n-weak">
                <th
                  v-for="(header, index) in tableHeaders"
                  :key="index"
                  class="py-3 ltr:pr-4 rtl:pl-4 text-start text-heading-3 text-n-slate-12"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <PreChatFields
              :pre-chat-fields="preChatFields"
              @update="handlePreChatFieldOptions"
              @drag-end="changePreChatFieldFieldsOrder"
            />
          </table>
        </div>
      </div>
      <div class="w-full flex justify-end items-center py-4 mt-2">
        <Button
          type="submit"
          :label="$t('INBOX_MGMT.SETTINGS_POPUP.UPDATE_PRE_CHAT_FORM_SETTINGS')"
          :is-loading="uiFlags.isUpdating"
        />
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.message-editor {
  @apply px-3;

  :deep(.ProseMirror-menubar) {
    @apply rounded-tl-[4px];
  }
}
</style>
