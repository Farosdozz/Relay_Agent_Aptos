import { ACTION_TYPES, IPromptOption } from '@/interfaces/actions.interface';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Select } from '../../main/Select';

export const SelectAction = ({
  options,
  wrapperClassName,
  value,
  onChange,
  error,
  contextFilter,
  actionType,
}: {
  options: IPromptOption[];
  wrapperClassName: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  contextFilter?: {
    actionType?: ACTION_TYPES;
    validValues?: string[];
  }[];
  actionType: ACTION_TYPES;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!contextFilter || !contextFilter.length) return options;

    // Find filters that match the current action type
    const matchingFilters = contextFilter.filter(
      (filter) => !filter.actionType || filter.actionType === actionType,
    );

    // If no matching filters, return all options
    if (matchingFilters.length === 0) return options;

    // Collect valid values from matching filters
    const validValues = matchingFilters.reduce<string[]>((acc, filter) => {
      if (filter.validValues && filter.validValues.length) {
        return [...acc, ...filter.validValues];
      }
      return acc;
    }, []);

    // If no valid values specified in matching filters, return all options
    if (validValues.length === 0) return options;

    // Filter options to only include those with values in the valid values list
    return options.filter((option) => validValues.includes(option.value));
  }, [options, contextFilter, actionType]);
  console.log('🚀 ~ filteredOptions ~ filteredOptions:', filteredOptions);

  // Find the selected option in all options (for display)
  const selectedOption = options.find((option) => option.value === value);

  // Check if the selected option is valid in the current context
  const isSelectedOptionValid = useMemo(() => {
    return filteredOptions.some((option) => option.value === value);
  }, [filteredOptions, value]);

  // Update selection if current value is not valid in the context
  useEffect(() => {
    if (!isSelectedOptionValid && filteredOptions.length > 0 && value) {
      onChange(filteredOptions[0].value);
    }
  }, [isSelectedOptionValid, filteredOptions, onChange, value]);

  return (
    <div className={`${wrapperClassName} relative ${error ? 'border border-red-500' : ''}`}>
      <div
        className="relative flex h-full w-full cursor-pointer items-center gap-2 px-2"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {selectedOption?.icon && (
          <Image
            src={selectedOption.icon}
            alt={value}
            width={16}
            height={16}
            className="rounded-full"
          />
        )}
        <p className="text-sm font-medium text-black">{selectedOption?.label}</p>
      </div>
      <Select
        options={filteredOptions}
        onSelect={onChange}
        open={isOpen}
        setOpen={setIsOpen}
        className={'w-full min-w-[150px]'}
      />
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
};
