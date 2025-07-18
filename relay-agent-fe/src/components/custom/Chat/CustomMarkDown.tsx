import { ReactNode } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CodeComponentProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

/**
 * Parse message content, handling different formats
 */
const parseMessageContent = (content: any): string => {
  // Fallback for any other case
  return String(content || '');
};

export const CustomMarkDown = ({ content }: { content: string }) => {
  const messageContent = parseMessageContent(content);

  return (
    <div className="mt-1 whitespace-pre-wrap">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ children, ...props }) => (
            <a className="text-components-buttons-primary" {...props}>
              {children}
            </a>
          ),
          p: ({ children }) => <div className="mb-1">{children}</div>,
          code: ({ inline, className, children, ...props }: CodeComponentProps) => {
            return inline ? (
              <strong className="rounded bg-background-secondary p-2 text-black" {...props}>
                {children}
              </strong>
            ) : (
              <div className="overflow-auto rounded bg-background-secondary p-2 text-black">
                <pre className="text-left" {...props}>
                  {children}
                </pre>
              </div>
            );
          },
          pre: ({ children }) => <pre className="pre-wrapper whitespace-pre-wrap">{children}</pre>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          ul: ({ children }) => {
            const processedChildren =
              typeof children === 'string'
                ? children.replace(/\n/g, '')
                : Array.isArray(children)
                  ? children.map((child) =>
                      typeof child === 'string' ? child.replace(/\n/g, '') : child,
                    )
                  : children;
            return <ul className="list-disc pl-6">{processedChildren}</ul>;
          },
          ol: ({ children }) => {
            const processedChildren =
              typeof children === 'string'
                ? children.replace(/\n/g, '')
                : Array.isArray(children)
                  ? children.map((child) =>
                      typeof child === 'string' ? child.replace(/\n/g, '') : child,
                    )
                  : children;
            return <ol className="list-decimal pl-6">{processedChildren}</ol>;
          },
          li: ({ children }) => {
            // Process children to remove newline characters if it's a string
            const processedChildren =
              typeof children === 'string'
                ? children.replace(/\n/g, '')
                : Array.isArray(children)
                  ? children.map((child) =>
                      typeof child === 'string' ? child.replace(/\n/g, '') : child,
                    )
                  : children;
            return <li className="">{processedChildren}</li>;
          },
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse border border-border-divider">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#C2C2C2]">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border-divider">{children}</tr>,
          th: ({ children }) => (
            <th className="border border-border-divider p-2 text-left">{children}</th>
          ),
          td: ({ children }) => <td className="border border-border-divider p-2">{children}</td>,
        }}
      >
        {messageContent}
      </Markdown>
    </div>
  );
};
