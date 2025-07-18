import { Button } from '@/components/main/Button';
import { DISPLAY_PROMPT_CONFIG } from '@/constants/actions';
import { ACTION_TYPES, IAction } from '@/interfaces/actions.interface';
import Image from 'next/image';
type ActionProps = {
  action: IAction | null;
  setAction: (action: IAction | null) => void;
  onChange: (value: string) => void;
  renderInput: (key: string, index: number) => React.ReactNode;
  handleReset: () => void;
};

export const ActionContainer = ({
  action,
  setAction,
  onChange,
  renderInput,
  handleReset,
}: ActionProps) => {
  return (
    <div className="flex h-full flex-1 items-center gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-auto flex-wrap items-center gap-1">
          {action &&
            action.actionPrompt &&
            action.actionPrompt.split(' ').map((part, index) => {
              if (
                part.startsWith('$') &&
                Object.keys(DISPLAY_PROMPT_CONFIG).includes(part.substring(1))
              ) {
                return renderInput(`${part}_${index}`, index);
              }
              return (
                <span key={`${part}_${index}`} className="text-black">
                  {part}
                </span>
              );
            })}
        </div>
        {action && action.actionType === ACTION_TYPES.PROVIDE_LIQUIDITY && (
          <div
            className="flex h-6 max-w-[330px] items-center justify-center rounded-lg bg-border-divider px-2"
            style={{
              background: 'rgba(241, 194, 27, 0.16)',
            }}
          >
            <span className="text-sm text-yellow-500">
              {`Action will be executed immediately upon request`}
            </span>
          </div>
        )}
      </div>
      <div className="flex h-full items-center gap-1">
        <Button
          color={'black'}
          onClick={handleReset}
          classes={'h-full bg-opacity-10'}
          prefixIcon={
            <Image
              src={'/icons/actions/reset-action.svg'}
              alt={'Reset Action'}
              width={20}
              height={20}
            />
          }
        />
        <Button
          color={'black'}
          onClick={() => {
            onChange('');
            setAction(null);
          }}
          classes={'h-full bg-opacity-10'}
          prefixIcon={
            <Image
              src={'/icons/actions/delete-action.svg'}
              alt={'Delete Action'}
              width={20}
              height={20}
            />
          }
        />
      </div>
    </div>
  );
};
