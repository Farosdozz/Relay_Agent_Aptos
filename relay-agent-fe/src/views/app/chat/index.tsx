import Loading from '@/components/custom/Animations/Loading';
import { ChatForm } from '@/components/custom/Chat/ChatForm';
import { Messages } from '@/components/custom/Chat/Messages';
import { CHAINS } from '@/constants';
import { useEmbeddedWallet } from '@/hooks';
import { useChatContext } from '@/providers/ChatProvider';
import { Suspense, useEffect } from 'react';

const ChatContent = () => {
  const { messages, isLoadingCurrentSessionMessages, isLoadingSessions } = useChatContext();
  const wallet = useEmbeddedWallet();

  return (
    <div className={'flex h-full w-full flex-col overflow-hidden'}>
      <div
        className={`relative mx-auto flex h-full w-full flex-col gap-4 ${messages?.length <= 0 || !messages ? 'mb-10 justify-end md:mb-0 md:justify-center' : 'pb-[120px]'} z-40`}
      >
        {isLoadingCurrentSessionMessages || isLoadingSessions ? (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loading
              borderColor="border-components-buttons-primary"
              style={{ width: 75, height: 75 }}
            />
          </div>
        ) : (
          <>
            <Messages data={messages!} />
            <ChatForm messages={messages} />
          </>
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  return (
    <Suspense
      fallback={
        <Loading
          borderColor="border-components-buttons-primary"
          className="absolute left-1/2 top-1/2"
          style={{ width: 75, height: 75 }}
        />
      }
    >
      <ChatContent />
    </Suspense>
  );
};

export default Chat;
