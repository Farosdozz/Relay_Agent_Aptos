import { IPromptOption } from '@/interfaces/actions.interface';
import * as motion from 'motion/react-client';
import Image from 'next/image';
import { RefObject, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

type SelectProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  options: IPromptOption[];
  onSelect: (value: string) => void;
  className?: string;
  formatOptionLabel?: (option: IPromptOption) => React.ReactNode;
};

export const Select = ({
  open,
  setOpen,
  options,
  onSelect,
  className,
  formatOptionLabel,
}: SelectProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref as RefObject<HTMLElement>, () => setOpen(false));

  return (
    <>
      {open && (
        <motion.div
          className={`absolute bottom-10 left-1/2 h-auto rounded-lg border border-solid border-border-divider bg-background-secondary shadow-[0_4px_16px_0_rgba(0,0,0,0.25)] ${className || ''}`}
          initial={{ opacity: 0, y: 10, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.3 }}
          ref={ref}
        >
          {options.map((option, index) => (
            <motion.div
              whileHover={{
                backgroundColor: '#C2C2C2',
              }}
              className="flex cursor-pointer items-center gap-2 px-3 py-2"
              key={index}
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              {option.icon && !formatOptionLabel && (
                <Image
                  src={option.icon}
                  alt={option.label}
                  width={16}
                  height={16}
                  className="rounded-full bg-background-gray"
                />
              )}
              {formatOptionLabel ? (
                formatOptionLabel(option)
              ) : (
                <p className="text-sm font-medium text-black">{option.label}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
};
