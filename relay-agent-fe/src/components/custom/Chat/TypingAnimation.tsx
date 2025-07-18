import { useEffect, useState, useRef, useCallback } from 'react';
import { CustomMarkDown } from '@/components/custom/Chat/CustomMarkDown';

interface Props {
  text: string;
  delay?: number;
  infinite?: boolean;
  className?: string;
  onTyping?: () => void;
  onTextUpdate?: () => void;
  isSessionTitle?: boolean;
}

const TypingMarkdown = ({
  text,
  delay = 20,
  infinite = false,
  className,
  onTyping,
  onTextUpdate,
  isSessionTitle = false,
}: Props) => {
  const [currentText, setCurrentText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const currentIndexRef = useRef(0);
  const previousTextRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textBufferRef = useRef('');

  // Adjust delay based on text length - longer texts should type a bit faster
  const getTypingDelay = useCallback(() => {
    // Base delay
    let typingDelay = delay;

    // For very long text, gradually decrease the delay to avoid too slow animation
    const textLength = textBufferRef.current.length;
    if (textLength > 100) {
      // Scale down to minimum 5ms for very long text
      typingDelay = Math.max(5, delay * (1 - Math.min(0.75, textLength / 1000)));
    }

    // Add small random variation for more natural typing (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    return Math.round(typingDelay * randomFactor);
  }, [delay]);

  // Keep the latest text in the buffer to prevent rapid changes
  useEffect(() => {
    // Store the new text
    textBufferRef.current = text;

    // If this is a completely new text (not just an addition), reset animation
    if (!text.startsWith(previousTextRef.current)) {
      console.log('Text changed completely, resetting animation');
      setCurrentText('');
      currentIndexRef.current = 0;
      setIsAnimating(true);
    }

    previousTextRef.current = text;
  }, [text]);

  // The core typing animation loop using useCallback for stability
  const animateTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If we have more text to show
    if (currentIndexRef.current < textBufferRef.current.length) {
      // Calculate a dynamic delay for this character
      const typingDelay = getTypingDelay();

      timeoutRef.current = setTimeout(() => {
        // Get current character position
        const nextPosition = currentIndexRef.current + 1;

        // Ensure we're only rendering up to where we've animated
        setCurrentText(textBufferRef.current.substring(0, nextPosition));

        // Update position for next character
        currentIndexRef.current = nextPosition;

        if (onTextUpdate) {
          onTextUpdate();
        }

        // Continue animation
        animateTyping();
      }, typingDelay);
    } else {
      // We've reached the end of the current text
      setIsAnimating(false);
      if (infinite) {
        // Reset for infinite loop
        currentIndexRef.current = 0;
        setCurrentText('');
        setIsAnimating(true);
        animateTyping();
      } else if (onTyping) {
        onTyping();
      }
    }
  }, [getTypingDelay, infinite, onTextUpdate, onTyping]);

  // Start/restart animation when necessary
  useEffect(() => {
    if (isAnimating) {
      animateTyping();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAnimating, animateTyping]);

  return isSessionTitle ? (
    <p className="text-xs font-normal lg:text-sm">{currentText}</p>
  ) : (
    <CustomMarkDown content={currentText || ''} />
  );
};

export default TypingMarkdown;
