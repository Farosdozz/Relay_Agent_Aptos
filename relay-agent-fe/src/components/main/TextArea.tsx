import React, { HTMLAttributes, useRef, useEffect, forwardRef, ForwardedRef } from 'react';

interface InputProps extends HTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  classes?: string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
}

export const TextArea = forwardRef(
  (
    { value, classes, disabled, onChange, placeholder, error, ...rest }: InputProps,
    ref: ForwardedRef<HTMLTextAreaElement>,
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Use the provided ref if available, otherwise use our internal ref
    const resolvedRef = ref || textareaRef;

    useEffect(() => {
      // Get the textarea element from the resolvedRef
      const textarea = 'current' in resolvedRef ? resolvedRef.current : null;

      if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.min(scrollHeight, 240)}px`;
      }
    }, [value, resolvedRef]);

    return (
      <div className="h-full w-full">
        <textarea
          ref={resolvedRef}
          value={value}
          className={`min-h-[40px] w-full resize-none appearance-none bg-transparent px-4 text-sm text-black outline-none transition-all duration-200 lg:text-base ${error ? 'border border-red-500' : ''} ${classes}`}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
          {...rest}
        />
        {/* {error && <div className="mt-1 text-xs text-red-500">{error}</div>} */}
      </div>
    );
  },
);
