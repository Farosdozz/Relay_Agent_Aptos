'use client';
import { CustomMarkDown } from '@/components/custom/Chat/CustomMarkDown';
import { GeneratingChat } from '@/components/custom/Chat/GeneratingChat';
import { Portfolio } from '@/components/custom/Chat/Portfolio';
import { SwapPreview } from '@/components/custom/Chat/Swap/SwapPreview';
import { TokenBalance } from '@/components/custom/Chat/TokenBalance';
import { ToolResultDefault } from '@/components/custom/Chat/ToolResultDefault';
import TypingMarkdown from '@/components/custom/Chat/TypingAnimation';
import { SUPPORTED_TOOLS } from '@/constants/tools';
import { Message, MessageRole, Tool } from '@/interfaces/chat.interface';
import { useChatContext } from '@/providers/ChatProvider';
import Image from 'next/image';
import React from 'react';
import { useMediaQuery } from 'usehooks-ts';

interface MessageRendererProps {
  message: Message;
  isLastAssistantMessage?: boolean;
  onTypingComplete?: () => void;
  onTextUpdate?: () => void;
}

// Component for a single tool item
const ToolItem = ({
  tool,
  isLastAssistantMessage,
}: {
  tool: Tool;
  isLastAssistantMessage?: boolean;
}) => {
  // Parse tool arguments
  if (Object.values(SUPPORTED_TOOLS).includes(tool.name as SUPPORTED_TOOLS) && tool.result) {
    try {
      const parsedResult = JSON.parse(tool.result);
      // console.log("🚀 ~ ToolItem ~ parsedResult:", parsedResult)
      if (!parsedResult.error) {
        if (tool.name === SUPPORTED_TOOLS.GET_TOKEN_BALANCE) {
          return <TokenBalance tool={tool} />;
        }
        if (tool.name === SUPPORTED_TOOLS.GET_BALANCE) {
          return <TokenBalance tool={tool} />;
        }
        // Skip Portfolio tools as they'll be handled by the Portfolio component
        if (tool.name === SUPPORTED_TOOLS.GET_PORTFOLIO_BALANCE) {
          return <Portfolio tool={tool} />;
        }
        if (tool.name.includes(SUPPORTED_TOOLS.SWAP_PREVIEW)) {
          return <SwapPreview tool={tool} isLastAssistantMessage={isLastAssistantMessage} />;
        }
      }
    } catch (e) {
      // If parsing fails, continue to default renderer
    }
  }

  return <ToolResultDefault tool={tool} />;
};

// Helper function to format message content
const formatMessageContent = (content: any): string => {
  if (typeof content === 'string') return content;
  return JSON.stringify(content, null, 2);
};

// Full message renderer component
const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  isLastAssistantMessage,
  onTypingComplete,
  onTextUpdate,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { isSending, isTyping } = useChatContext();
  // For system messages
  if (message.role === MessageRole.System) {
    return (
      <div className="flex items-start gap-2 italic text-black">
        <CustomMarkDown content={message.content} />
      </div>
    );
  }

  // For user messages
  if (message.role === MessageRole.User) {
    return (
      <div className="black-linear-gradient ml-auto max-w-[90%] break-words rounded-[20px] px-4 py-1.5 text-white md:max-w-[60%]">
        <CustomMarkDown content={message.content} />
      </div>
    );
  }

  // For assistant messages
  if (message.role === MessageRole.Assistant) {
    const showAvatar = !(isLastAssistantMessage && isSending);

    return (
      <div className={'flex items-start gap-2 text-black'}>
        {showAvatar && (
          <Image
            src={'/icons/logo-outlined.png'}
            alt={'AI Assistant Avatar'}
            width={isMobile ? 20 : 32}
            height={isMobile ? 20 : 32}
            className="translate-y-1 md:translate-y-0"
          />
        )}
        {isLastAssistantMessage ? (
          isSending ? (
            <GeneratingChat />
          ) : message.content ? (
            // If we have content and we're either still typing or done typing,
            // show either the typing animation or the final content
            <div className="flex w-full max-w-[90%] flex-1 flex-col gap-4">
              {isTyping ? (
                <TypingMarkdown
                  className="mt-1 whitespace-pre-wrap"
                  text={formatMessageContent(message.content)}
                  onTyping={onTypingComplete}
                  onTextUpdate={onTextUpdate}
                  delay={25}
                />
              ) : (
                <CustomMarkDown content={message.content} />
              )}

              {message.tools && message.tools.length > 0 && (
                <div className="mt-2 w-full space-y-2">
                  {message.tools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      isLastAssistantMessage={isLastAssistantMessage}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // No content yet
            <div className="flex w-full max-w-[90%] flex-1 flex-col gap-4">
              <CustomMarkDown content="" />
            </div>
          )
        ) : (
          <div className="flex w-full max-w-[90%] flex-1 flex-col gap-4">
            <CustomMarkDown content={message.content} />
            {message.tools && message.tools.length > 0 && (
              <div className="mt-2 w-full space-y-2">
                {message.tools.map((tool) => (
                  <ToolItem key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback for other roles or if role is undefined
  return null;
};

export default MessageRenderer;
