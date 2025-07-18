import { useChatContext } from '@/providers/ChatProvider';
import { useMemo, useState, useEffect } from 'react';
import TypingMarkdown from './TypingAnimation';

interface ChatHistoryProps {
  onItemClick?: () => void;
}

export const ChatHistory = ({ onItemClick }: ChatHistoryProps = {}) => {
  const { currentSessionId, handleSetCurrentSession, sessions } = useChatContext();
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [isNewSessionTitleChanging, setIsNewSessionTitleChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use useEffect to update client-side state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      // Check if the newest session title has changed
      const newestSession = sessions[0];
      const previousNewestSession = previousSessions.length > 0 ? previousSessions[0] : null;

      if (
        previousNewestSession &&
        newestSession &&
        previousNewestSession.sessionId === newestSession.sessionId
      ) {
        if (previousNewestSession.title !== newestSession.title) {
          setIsNewSessionTitleChanging(true);
          // Reset the animation after 2 seconds
          const timeout = setTimeout(() => setIsNewSessionTitleChanging(false), 2000);
          return () => clearTimeout(timeout);
        }
      }

      setPreviousSessions(sessions);
    }
  }, [sessions]);

  const localSessions = useMemo(() => {
    if (!currentSessionId) {
      const newSession = {
        createdAt: new Date().toISOString(),
        sessionId: '',
        title: 'New conversation',
        updatedAt: new Date().toISOString(),
      };
      return [newSession, ...(sessions || [])];
    }
    return sessions;
  }, [sessions, currentSessionId]);

  // Ensure consistent rendering regardless of server or client render
  const baseClasses = 'cursor-pointer rounded-lg p-2 text-xs text-black md:text-white lg:text-sm';
  const activeClass = 'bg-background-gray text-white';
  const hoverClass = mounted ? 'hover:bg-background-gray/50' : '';

  // If not mounted yet (server rendering), don't show dynamic content
  if (!mounted) {
    return (
      <div className="flex flex-1 flex-col gap-1">
        <div className={`${baseClasses} ${activeClass}`}>New conversation</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-1">
      {localSessions && localSessions.length > 0 ? (
        localSessions.map((session, index) => (
          <div
            className={`${baseClasses} ${
              currentSessionId === session.sessionId ? activeClass : ''
            } ${hoverClass}`}
            key={index}
            onClick={() => {
              handleSetCurrentSession(session.sessionId);
              if (onItemClick) onItemClick();
            }}
          >
            {index === 0 && isNewSessionTitleChanging ? (
              <TypingMarkdown text={session.title} delay={25} isSessionTitle />
            ) : (
              session.title
            )}
          </div>
        ))
      ) : (
        <div className={`${baseClasses} ${activeClass}`}>New conversation</div>
      )}
    </div>
  );
};
