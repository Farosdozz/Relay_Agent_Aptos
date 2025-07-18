import { INPUT_TYPES, IPromptOption } from '@/interfaces/actions.interface';
import { RefObject, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { Input } from './Input';
import { Select } from './Select';
import { BERACHAIN_TOKENS } from '@/constants/actions';
import Image from 'next/image';
import useTokens from '@/hooks/useTokens';

export const AutoComplete = ({
  autoCompleteOptions,
  wrapperClassName,
  onChange,
  value,
  placeholder,
  inputClassName,
  inputType,
  error,
  maxOptions,
  filterOption,
  formatOptionLabel,
}: {
  autoCompleteOptions: IPromptOption[];
  wrapperClassName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputClassName: string;
  inputType: INPUT_TYPES;
  error?: string;
  maxOptions?: number;
  filterOption?: (inputValue: string, option: IPromptOption) => boolean;
  formatOptionLabel?: (option: IPromptOption) => React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const TOKENS = useTokens();

  useOnClickOutside(ref as RefObject<HTMLElement>, () => setIsOpen(false));

  let filteredOptions = value
    ? autoCompleteOptions.filter((option) =>
        filterOption
          ? filterOption(value, option)
          : option.label.toLowerCase().includes(value.toLowerCase()),
      )
    : [];

  // Apply maxOptions limit if provided
  if (maxOptions && filteredOptions.length > maxOptions) {
    filteredOptions = filteredOptions.slice(0, maxOptions);
  }

  return (
    <div className={`${wrapperClassName} relative flex items-center justify-center`} ref={ref}>
      {value && TOKENS.find((token) => token.value === value)?.icon && (
        <Image
          src={TOKENS.find((token) => token.value === value)?.icon || ''}
          alt={value}
          width={16}
          height={16}
          className="ml-2 rounded-full"
        />
      )}
      <Input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setIsOpen(true);
          onChange(e.target.value);
        }}
        classes={inputClassName}
        error={error}
      />
      {filteredOptions.length > 0 && (
        <Select
          options={filteredOptions}
          onSelect={onChange}
          open={isOpen}
          setOpen={setIsOpen}
          className="min-w-[100px]"
          formatOptionLabel={formatOptionLabel}
        />
      )}
    </div>
  );
};
