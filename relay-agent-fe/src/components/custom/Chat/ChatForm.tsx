import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useEventListener, useMediaQuery } from 'usehooks-ts';
import { ActionButton } from '@/components/custom/Chat/ActionButton';
import { ActionContainer } from '@/components/custom/Chat/ActionContainer';
import { ActionHint } from '@/components/custom/Chat/ActionHint';
import { ActionsButton } from '@/components/custom/Chat/ActionsButton';
import { Button } from '@/components/main/Button';
import { APTOS_ACTIONS } from '@/constants/actions';
import { useActions } from '@/hooks/useActions';
import { IAction } from '@/interfaces/actions.interface';
import { Message } from '@/interfaces/chat.interface';
import { useChatContext } from '@/providers/ChatProvider';
import { TextArea } from '@/components/main/TextArea';


interface Props {
  messages: Message[];
}

export const ChatForm = ({ messages }: Props) => {
  const { userMessage, setUserMessage, isTyping, isSending, onSubmit, currentSessionId } =
    useChatContext();
  const [action, setAction] = useState<IAction | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Add the hook from useActions
  const actionHook = useActions({
    action,
    onChange: setUserMessage,
    inputValues,
    setInputValues,
  });

  const actions = APTOS_ACTIONS;

  const handleSubmit = async () => {
    if (!action) {
      await onSubmit({ value: userMessage });
      return;
    }
    // Check if all fields are valid using our new validation logic
    if (actionHook.areAllFieldsValid()) {
      await onSubmit({ action });
      setAction(null);
      actionHook.handleReset();
    } else {
      console.log('Invalid fields');
      toast.error('Please fill in all fields');
    }
  };

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping && !isSending) {
      e.preventDefault();
      handleSubmit();
    }
  });

  // Focus textarea when session changes or on initial load
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [currentSessionId]);

  // Global key press handler to focus textarea when typing starts
  useEventListener('keydown', (e: KeyboardEvent) => {
    // Skip if user is typing in an input, textarea, or if it's a modifier key
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      e.key === 'Shift' ||
      e.key === 'Control' ||
      e.key === 'Alt' ||
      e.key === 'Meta' ||
      e.key === 'Tab' ||
      e.ctrlKey ||
      e.altKey ||
      e.metaKey
    ) {
      return;
    }

    // Focus the textarea if it's not already focused and the chat is not in action mode
    if (textAreaRef.current && !action) {
      textAreaRef.current.focus();
    }
  });

  const isDisabled = isTyping || isSending;
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div
      className={`${messages.length > 0 ? 'absolute bottom-0 left-0' : ''} flex w-full flex-col gap-6 px-3 py-2 md:px-0`}
    >
      <div
        className={
          'relative mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-solid border-border-divider bg-white p-2 transition-colors duration-200 focus-within:border-border-focus'
        }
      >
        {!action && (
          <ActionHint
            inputValue={userMessage || ''}
            onSelectAction={(action) => setAction(action)}
          />
        )}
        <div className="flex items-center gap-4">
          {!action ? (
            <div className="relative flex flex-1 items-center">
              <TextArea
                ref={textAreaRef}
                value={userMessage}
                placeholder={'Ask me anything'}
                onChange={(e) => setUserMessage(e.target.value)}
                classes={'h-8 flex-1'}
                disabled={isDisabled}
              />
            </div>
          ) : (
            <ActionContainer
              action={action}
              setAction={setAction}
              onChange={setUserMessage}
              renderInput={actionHook.renderInput}
              handleReset={actionHook.handleReset}
            />
          )}
          <div className={'h-8 w-8'}>
            <Button
              color={'primary'}
              onClick={handleSubmit}
              classes={'h-full w-8'}
              disabled={isDisabled || !userMessage}
              prefixIcon={<Image alt={'send'} src={'/icons/send.svg'} width={32} height={32} />}
            />
          </div>
        </div>
        <div className="relative flex gap-2 py-1">
          {actions.slice(0, isMobile ? 2 : 4).map((actionItem) => (
            <ActionButton
              key={actionItem.label}
              action={actionItem}
              disabled={isDisabled || !!action}
              setAction={(action) => {
                // Reset input values when selecting a new action
                setInputValues({});
                setAction(action);
              }}
            />
          ))}
          {actions.length > 3 && (
            <ActionsButton
              actions={actions}
              disabled={isDisabled || !!action}
              setAction={setAction}
            />
          )}
        </div>
      </div>
    </div>
  );
};
