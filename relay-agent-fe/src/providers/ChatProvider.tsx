import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { MIXPANEL_EVENTS } from '@/constants/mix-panel';
import { QUERY_KEY } from '@/constants/query';
import { useEmbeddedWallet, useAptosAuth } from '@/hooks';
import { useAuthQuery } from '@/hooks/useAuthQuery';
import { useChatAction } from '@/hooks/useChatAction';
import { IAction } from '@/interfaces/actions.interface';
import {
  Message,
  Session,
  SessionsResponse,
  StreamResponse,
  StreamResponseType,
} from '@/interfaces/chat.interface';
import { apiBackend, setAuthToken, isUserAuthenticated } from '@/utils/axios';
import { trackingEvent } from '@/utils/mix-panel';

interface ChatContextType {
  sessions: Session[] | undefined;
  isLoadingSessions: boolean;
  currentSessionMessages: Message[];
  isLoadingCurrentSessionMessages: boolean;
  currentSessionId: string;
  currentSession: Session | null;
  messages: Message[];
  handleSetCurrentSession: (id: string) => void;
  setCurrentSession: (session: Session) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  createNewSession: (title?: string, skipNewSession?: boolean) => Promise<string>;
  isCreatingSession: boolean;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  userMessage: string;
  setUserMessage: React.Dispatch<React.SetStateAction<string>>;
  isSending: boolean;
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: ({ value, action }: { value?: string; action?: IAction }) => void;
}

const ChatContext = createContext<ChatContextType>({
  sessions: [],
  isLoadingSessions: true,
  currentSessionMessages: [],
  isLoadingCurrentSessionMessages: true,
  currentSessionId: '',
  currentSession: null,
  messages: [],
  handleSetCurrentSession: () => { },
  setCurrentSession: () => { },
  setMessages: () => { },
  createNewSession: async () => '',
  isCreatingSession: false,
  isTyping: false,
  setIsTyping: () => { },
  userMessage: '',
  setUserMessage: () => { },
  isSending: false,
  setIsSending: () => { },
  onSubmit: () => { },
});

export const useChatContext = () => useContext(ChatContext);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatContextProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { connected, account } = useWallet();
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAptosAuth();
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : '',
  );
  const id = searchParams.get('id') || '';
  const router = useRouter();

  const embeddedWallet = useEmbeddedWallet();

  const [currentSessionId, setCurrentSessionId] = useState(id);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setCurrentMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const submitRef = useRef(false);
  const skipMessageFetchRef = useRef(false);
  const skipFetchSessionIdRef = useRef('');

  const { createNewSession: createNewSessionMutation } = useChatAction();

  // Fetch all sessions
  const {
    data: sessionResponse,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useAuthQuery<SessionsResponse, AxiosError>(
    [QUERY_KEY.SESSIONS, account?.address],
    () =>
      apiBackend
        .get('/ai/sessions', {
          params: {
            page,
            limit: 20,
            sort: 'updatedAt',
            order: 'desc',
          },
        })
        .then((res) => res.data),
    {
      enabled: isAuthenticated && connected && !!account?.address,
      refetchOnWindowFocus: true,
      staleTime: Infinity, // Consider data stale after 5 minutes
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  );

  // Fetch messages for the current session with improved logic to prevent refetch
  const {
    data: sessionMessages,
    isLoading: isLoadingCurrentSessionMessages,
    refetch: refetchSessionMessages,
  } = useAuthQuery<{ messages: Message[] }, AxiosError>(
    [QUERY_KEY.MESSAGES, currentSessionId, account?.address],
    () =>
      apiBackend.get(`/ai/sessions/${currentSessionId}/messages`).then((res) => {
        return res.data;
      }),
    {
      enabled:
        !!currentSessionId &&
        isAuthenticated &&
        connected &&
        !!account?.address &&
        !(skipMessageFetchRef.current && skipFetchSessionIdRef.current === currentSessionId),
      staleTime: Infinity,
      notifyOnChangeProps: messages.length > 0 ? ['data', 'error'] : undefined,
    },
  );

  // Update local messages state when session messages are loaded
  useEffect(() => {
    if (
      sessionMessages?.messages &&
      currentSessionId &&
      !(skipMessageFetchRef.current && skipFetchSessionIdRef.current === currentSessionId)
    ) {
      setCurrentMessages(sessionMessages.messages);
    } else if (!currentSessionId) {
      setCurrentMessages([]);
    }
  }, [sessionMessages, currentSessionId]);

  // Update current session when sessions are loaded or refreshed
  useEffect(() => {
    if (sessionResponse?.sessions && sessionResponse.sessions.length > 0 && window.location.pathname.includes('/app')) {
      if (!currentSessionId && !currentSession) {
        // TODO: need to find another way to handle this
        const firstSession = sessionResponse.sessions[0];
        // console.log('Setting first session:', firstSession.sessionId);
        setCurrentSession(firstSession);
        handleSetCurrentSession(firstSession.sessionId);
      } else if (currentSessionId && !currentSession) {
        const matchingSession = sessionResponse.sessions.find(
          (s) => s.sessionId === currentSessionId,
        );
        if (matchingSession) {
          console.log('Matching session found for ID:', currentSessionId);
          setCurrentSession(matchingSession);
        }
      }
    }
  }, [sessionResponse?.sessions, currentSessionId, currentSession]);

  // Create a new session with an optional title
  const createNewSession = async (title?: string, skipNewSession?: boolean): Promise<string> => {
    try {
      if (skipNewSession) {
        handleSetCurrentSession('');
        setCurrentMessages([]);
        return '';
      }
      setIsCreatingSession(true);
      const defaultTitle = title || `New Chat ${new Date().toLocaleString()}`;
      const response = await createNewSessionMutation.mutateAsync(defaultTitle);
      const newSessionId = response.sessionId;

      // Update the URL and current session
      handleSetCurrentSession(newSessionId);

      return newSessionId;
    } catch (error) {
      toast.error('Failed to create new session');
      console.error('Error creating session:', error);
      return '';
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSetCurrentSession = (id: string) => {
    if (
      skipMessageFetchRef.current &&
      skipFetchSessionIdRef.current === id &&
      id === currentSessionId
    ) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set('id', id);
    } else {
      params.delete('id');
    }
    router.replace(`/app?${params.toString()}`);

    if (currentSessionId !== id) {
      refetchSessionMessages();
    }

    if (skipFetchSessionIdRef.current !== id) {
      skipMessageFetchRef.current = false;
      skipFetchSessionIdRef.current = '';
    }

    setCurrentSessionId(id);
    setCurrentMessages([]);
    setIsTyping(false);
    setIsSending(false);
    setUserMessage('');
  };

  const { sendMessage: sendMessageMutation } = useChatAction();

  const onSubmit = async ({ value, action }: { value?: string; action?: IAction }) => {
    const trimmedMessage = value ? value.trim() : userMessage.trim();

    if (!connected || !isAuthenticated || !account?.address) {
      if (!connected) {
        toast.error('Please connect your wallet first');
        return;
      }
      
      // Try to login if connected but not authenticated
      if (connected && !isAuthenticated) {
        try {
          await login();
          
          // Wait for authentication state to be fully updated
          // Check localStorage directly as it's updated synchronously
          const maxRetries = 10;
          let retries = 0;
          let isAuthValid = false;
          
          while (retries < maxRetries && !isAuthValid) {
            isAuthValid = isUserAuthenticated();
            if (!isAuthValid) {
              await new Promise(resolve => setTimeout(resolve, 200));
              retries++;
            }
          }
          
          if (!isAuthValid) {
            console.error('Authentication not valid after login');
            toast.error('Authentication failed. Please try again.');
            return;
          }
        } catch (error) {
          console.error('Login failed:', error);
          toast.error('Authentication failed. Please try again.');
          return;
        }
      }
    }

    if (!trimmedMessage) {
      toast.error("Please enter a message");
      return;
    }
    
    if (isSending) {
      toast.info("Please wait for the previous message to complete");
      return;
    }

    if (submitRef.current) {
      return;
    }
    submitRef.current = true;

    try {
      // Double-check authentication before sending
      const authToken = localStorage.getItem('aptos_access_token');
      if (!authToken) {
        console.error('No auth token found when trying to send message');
        toast.error('Please authenticate first');
        return;
      }
      
      console.log('Sending message with auth token:', authToken.substring(0, 20) + '...');
      
      setIsSending(true);
      setIsTyping(true);

      setUserMessage('');

      let sessionId = currentSessionId;
      const isNewChat = !sessionId;

      if (isNewChat) {
        skipMessageFetchRef.current = true;
      } else {
        skipMessageFetchRef.current = true;
        skipFetchSessionIdRef.current = sessionId;
      }

      trackingEvent(MIXPANEL_EVENTS.SEND_MESSAGE, {
        message: trimmedMessage,
        walletAddress: account?.address,
        sessionId: sessionId || '',
        action: action?.label || '',
      });

      await sendMessageMutation.mutateAsync({
        message: trimmedMessage,
        currentSession: { sessionId } as Session,
        sessionId: sessionId,
        setCurrentSession: async (session: Session | null) => {
          if (session) {
            setCurrentSession(session);
          }
        },
        setMessages: setCurrentMessages,
        walletAddress: account?.address,
        onStream: async (data: StreamResponse) => {
          if (data.type === StreamResponseType.Error) {
            toast.error('Error in chat response');
          }

          // For Message type, set isSending to false and isTyping to true
          // This allows the content to be rendered immediately with typing animation
          if (data.type === StreamResponseType.Message) {
            setIsSending(false);
            setIsTyping(true);
          }

          if (
            isNewChat &&
            data.type === StreamResponseType.SessionInfo &&
            typeof data.content === 'object' &&
            'sessionId' in data.content
          ) {
            const sessionContent = data.content as { sessionId: string };
            if (sessionContent.sessionId) {
              await refetchSessions();
              sessionId = sessionContent.sessionId;
              const params = new URLSearchParams(window.location.search);
              params.set('id', sessionId);
              router.replace(`/app?${params.toString()}`);
              setCurrentSessionId(sessionId);
              skipFetchSessionIdRef.current = sessionId;
            }
          }
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          toast.error('Failed to send message');
          setIsSending(false);
          setIsTyping(false);

          skipMessageFetchRef.current = false;
          skipFetchSessionIdRef.current = '';
        },
        onComplete: async () => {
          try {
            await refetchSessions();

            if (isNewChat) {
              setCurrentSessionId(sessionId);
              // const response = await apiBackend.get('/ai/sessions', {
              //   params: {
              //     page: 1,
              //     limit: 20,
              //     sort: 'updatedAt',
              //     order: 'desc',
              //   },
              // });

              // const sessions = response.data.sessions as Session[];

              // if (isNewChat && sessionId && sessions && sessions.length > 0) {
              //   const newSession = sessions.find((s) => s.sessionId === sessionId);
              //   if (newSession) {
              //     console.log('Setting current session to new session:', newSession.sessionId);
              //     setCurrentSession(newSession);

              //     if (currentSessionId !== sessionId) {
              //       setCurrentSessionId(sessionId);
              //     }
              //   }
              // }
            }
          } catch (error) {
            console.error('Error refetching sessions:', error);
          } finally {
            // Only disable isTyping here, isSending was already set to false when stream began
            setIsTyping(false);
          }
        },
      });
    } catch (error) {
      console.error('Error in send message:', error);
      toast.error('Failed to send message');
      setIsSending(false);
      setIsTyping(false);
      skipMessageFetchRef.current = false;
      skipFetchSessionIdRef.current = '';
    } finally {
      submitRef.current = false;
    }
  };

  const value: ChatContextType = {
    currentSession,
    currentSessionId,
    currentSessionMessages: sessionMessages?.messages || [],
    createNewSession,
    handleSetCurrentSession,
    isCreatingSession,
    isLoadingCurrentSessionMessages,
    isLoadingSessions,
    messages: messages.length > 0 ? messages : sessionMessages?.messages || [],
    sessions: sessionResponse?.sessions,
    setCurrentSession,
    setMessages: setCurrentMessages,
    isTyping,
    setIsTyping,
    userMessage,
    setUserMessage,
    isSending,
    setIsSending,
    onSubmit,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
