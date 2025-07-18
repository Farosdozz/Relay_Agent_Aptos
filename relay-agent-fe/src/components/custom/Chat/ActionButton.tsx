import Image from 'next/image';
import { IAction } from '@/interfaces/actions.interface';
import { RefObject, useRef, useState } from 'react';
import * as motion from 'motion/react-client';
import { useOnClickOutside } from 'usehooks-ts';

export const ActionButton = ({
  action,
  disabled,
  setAction,
}: {
  action: IAction;
  disabled: boolean;
  setAction: (action: IAction) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref as RefObject<HTMLElement>, () => {
    setIsOpen(false);
  });

  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (action.children && !isOpen) {
          setIsOpen(true);
          return;
        }

        if (action) {
          setAction(action);
        }
      }}
      className="relative flex h-6 appearance-none items-center justify-center gap-1 rounded-md bg-background-action px-2 text-sm disabled:opacity-35 lg:gap-2 lg:px-3 lg:text-base"
    >
      <Image
        src={action.whiteIcon ? action.whiteIcon : action.icon}
        alt={action.label}
        width={16}
        height={16}
      />
      <p className="text-xs md:text-sm">{action.label}</p>
      {action.children && (
        <Image src={'/icons/chevron-down.svg'} alt={action.label} width={14} height={14} />
      )}
      {action.children && isOpen && (
        <motion.div
          className="absolute bottom-10 left-1/2 h-[250px] w-[250px] overflow-auto rounded-lg border border-solid border-border-divider bg-background-secondary"
          initial={{ opacity: 0, y: 10, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.3 }}
          ref={ref}
        >
          {action.children.map((child) => (
            <motion.div
              whileHover={{
                backgroundColor: '#0E3647',
              }}
              className="flex cursor-pointer flex-col items-start px-3 py-2"
              key={child.label}
              onClick={() => {
                if (child.actionPrompt) {
                  setAction(child);
                  setIsOpen(false);
                }
              }}
            >
              <p className="text-xs font-medium text-white lg:text-sm">{child.label}</p>
              <p className="text-sm text-text-gray lg:text-sm">{child.description}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </button>
  );
};
