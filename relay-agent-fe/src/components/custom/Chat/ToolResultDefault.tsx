import { Tool } from '@/interfaces/chat.interface';
import { formatEllipsisText } from '@/utils/format';
import { CustomMarkDown } from './CustomMarkDown';

export const ToolResultDefault = ({ tool }: { tool: Tool }) => {
  let parsedArguments;
  try {
    parsedArguments = JSON.parse(tool.arguments);
  } catch (e) {
    parsedArguments = tool.arguments;
  }

  // Format the display of arguments
  const formatArguments = () => {
    if (!parsedArguments) return '';
    let args = parsedArguments;
    try {
      args = JSON.parse(parsedArguments);
    } catch (e) {
      args = parsedArguments;
    }

    // Handle wallet + tokenName pattern
    if (args.wallet && args.tokenName) {
      return (
        <span>
          Wallet: <strong>{formatEllipsisText(args.wallet)}</strong>
          {args.tokenName && (
            <span>
              , Token: <strong>{args.tokenName}</strong>
            </span>
          )}
        </span>
      );
    }

    // Handle single wallet (for get_balance)
    if (args.wallet && !args.tokenName) {
      return (
        <span>
          Wallet: <strong>{formatEllipsisText(args.wallet)}</strong>
        </span>
      );
    }

    // Default to JSON
    return <pre className="whitespace-pre-wrap">{JSON.stringify(args, null, 2)}</pre>;
  };

  // Format result for display
  const formatResult = (result: string | undefined) => {
    if (!result) return 'No result';

    // Transaction hash handling
    if (
      typeof result === 'string' &&
      result.startsWith('0x') &&
      result.length >= 42 &&
      result.length <= 66
    ) {
      return result;
    }

    // Number formatting
    if (typeof result === 'string' && !isNaN(Number(result))) {
      const num = Number(result);
      return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }

    // JSON parsing
    if (typeof result === 'string' && (result.startsWith('{') || result.startsWith('['))) {
      try {
        const parsed = JSON.parse(result);
        if ('error' in parsed) {
          return <CustomMarkDown content={parsed.error} />;
        }
        return <pre className="whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>;
      } catch (e) {
        // Not valid JSON, return as is
      }
    }

    return result;
  };

  return (
    <div className="my-2 w-full rounded-md border border-border-divider bg-background-secondary p-3">
      <div className="flex items-center gap-2 font-medium text-black">
        <span>{tool.name}</span>
      </div>

      <div className="mt-2 w-full space-y-2">
        <div className="w-full">
          <div className="text-sm text-text-gray">Arguments:</div>
          <div className="break-words text-black">{formatArguments()}</div>
        </div>

        <div className="w-full">
          <div className="text-sm text-text-gray">Result:</div>
          {tool.result ? (
            <div className="whitespace-pre-wrap break-words text-black">
              {formatResult(tool.result)}
            </div>
          ) : (
            <div className="italic text-text-gray">No result</div>
          )}
        </div>
      </div>
    </div>
  );
};
