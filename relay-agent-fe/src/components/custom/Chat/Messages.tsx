import MessageRenderer from '@/components/custom/Chat/MessageRenderer';
import { Message, MessageRole } from '@/interfaces/chat.interface';
import { useChatContext } from '@/providers/ChatProvider';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef } from 'react';

interface Props {
  data: Message[];
}

// Don't specify children as required since it's optional in React components

export const Messages = ({ data }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isTyping, setIsTyping, isSending } = useChatContext();

  // Ensure messages are in the correct order (newest at bottom)
  const chatData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Clone the array to avoid modifying the original
    const sortedData = [...data];

    // Sort messages by creation time
    sortedData.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return sortedData;
  }, [data]);

  // Define scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll to bottom when messages change or when a new chunk is received
  useEffect(() => {
    // Immediate scroll
    scrollToBottom();

    // Also set a small timeout to ensure scroll happens after DOM updates
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [
    chatData,
    chatData.length,
    chatData.length > 0 ? chatData[chatData.length - 1]?.content : null,
    isSending,
    isTyping,
    scrollToBottom,
  ]);

  if (!chatData) return null;

  // Find the last assistant message index
  const lastAssistantIndex = chatData.reduce((lastIndex, item, index) => {
    return item.role === MessageRole.Assistant ? index : lastIndex;
  }, -1);

  return (
    <div className={`flex ${chatData.length > 0 ? 'h-full' : ''} flex-col`}>
      {chatData.length <= 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* <Image src={'/icons/relay-logo-white.svg'} alt="" width={68} height={80} className="mb-6" /> */}
          <div className="text-center text-base lg:text-xl">
            <span className="text-black">Hello! </span>
            <span className="font-semibold text-black">How can</span> {''}
            <span className="font-semibold text-components-buttons-primary">Relay</span> {''}
            <span className="font-semibold text-black">help you today?</span>
          </div>
        </div>
      ) : (
        <motion.div ref={scrollRef} className="flex-1 overflow-y-auto p-5">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-x-hidden text-sm lg:text-base">
            {chatData.map((item, index) => (
              <MessageRenderer
                key={item.id}
                message={item}
                isLastAssistantMessage={index === lastAssistantIndex}
                onTypingComplete={() => {
                  setIsTyping(false);
                }}
                onTextUpdate={scrollToBottom}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
