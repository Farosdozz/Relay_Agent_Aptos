import { Select } from '@/components/main/Select';
import { APTOS_ACTIONS } from '@/constants/actions';
import { IAction } from '@/interfaces/actions.interface';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type ActionHintProps = {
  inputValue: string;
  onSelectAction?: (action: IAction) => void;
};

export const ActionHint = ({ inputValue, onSelectAction }: ActionHintProps) => {
  const [matchedActions, setMatchedActions] = useState<IAction[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const actions: IAction[] = APTOS_ACTIONS;

  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setMatchedActions([]);
      setIsOpen(false);
      return;
    }

    // Filter actions that match the input value
    const lowerInput = inputValue.toLowerCase();
    const filteredActions = actions.filter(
      (action) =>
        action.label.toLowerCase().includes(lowerInput) ||
        action.description?.toLowerCase().includes(lowerInput) ||
        action.actionType.toLowerCase().includes(lowerInput),
    );

    setMatchedActions(filteredActions);
    setIsOpen(filteredActions.length > 0);
  }, [inputValue]);

  if (matchedActions.length === 0) return null;

  const formatOptionLabel = (option: IAction) => (
    <div className="flex items-center gap-2">
      {option.icon && (
        <Image
          src={option.icon}
          alt={option.label}
          width={16}
          height={16}
          className="rounded-full"
        />
      )}
      <div className="flex flex-col">
        <p className="text-sm font-medium text-white">{option.label}</p>
        <p className="text-sm text-text-gray">{option.description}</p>
      </div>
    </div>
  );

  return (
    <Select
      options={matchedActions.map((action) => ({
        label: action.label,
        value: action.label,
        icon: action.icon,
        description: action.description,
      }))}
      onSelect={(value) => {
        const selectedAction = matchedActions.find((action) => action.label === value);
        if (selectedAction && onSelectAction) {
          onSelectAction(selectedAction);
        }
        setIsOpen(false);
      }}
      open={isOpen}
      setOpen={setIsOpen}
      className="!bottom-[100px] w-full"
      formatOptionLabel={(option) => formatOptionLabel(option as unknown as IAction)}
    />
  );
};
