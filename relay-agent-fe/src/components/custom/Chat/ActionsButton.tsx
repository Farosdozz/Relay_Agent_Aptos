import { IAction } from '@/interfaces/actions.interface';
import * as motion from 'motion/react-client';
import Image from 'next/image';
import { RefObject, useRef, useState } from 'react';
import { useMediaQuery, useOnClickOutside } from 'usehooks-ts';

export const ActionsButton = ({
  actions,
  disabled,
  setAction,
}: {
  actions: IAction[];
  disabled: boolean;
  setAction: (action: IAction) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref as RefObject<HTMLElement>, () => {
    setIsOpen(false);
    setKeyword('');
  });

  const filteredActions = keyword.trim()
    ? actions.filter(
        (action) =>
          action.label.toLowerCase().includes(keyword.toLowerCase()) ||
          (action.description && action.description.toLowerCase().includes(keyword.toLowerCase())),
      )
    : actions;

  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (!isOpen) {
          setIsOpen(true);
          setKeyword('');
        }
      }}
      className="relative flex h-6 appearance-none items-center justify-center gap-2 rounded-md bg-background-action px-3 disabled:opacity-35"
    >
      <Image src={'/icons/three-dot.svg'} alt={'actions'} width={16} height={16} />
      {!isMobile && <p className="text-xs lg:text-sm">{'Actions'}</p>}
      {actions && isOpen && (
        <>
          {isMobile ? (
            <motion.div
              className="fixed bottom-0 left-0 z-50 h-[80vh] w-full rounded-t-xl border border-solid border-border-divider bg-background-secondary py-4 pl-4"
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{
                duration: 0.3,
                type: 'spring',
                damping: 25,
                stiffness: 200,
              }}
              ref={ref}
            >
              <div className="relative flex h-full w-full flex-col gap-1.5 overflow-auto lg:pr-4">
                <div className="mb-2 flex items-center gap-2 pr-5">
                  <p className="text-base font-medium text-white">Actions</p>
                  <div className="flex flex-1 items-center overflow-hidden rounded-full border border-solid border-border-divider bg-background-action px-3">
                    <Image src={'/icons/search-gray.svg'} alt={'search'} width={14} height={14} />
                    <input
                      value={keyword}
                      className={`h-8 flex-1 appearance-none bg-transparent px-2 focus:outline-none`}
                      type={'text'}
                      disabled={disabled}
                      placeholder={'Search actions...'}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>
                {filteredActions.length > 0 ? (
                  filteredActions.map((action) => (
                    <motion.div
                      whileHover={{
                        backgroundColor: '#424242',
                      }}
                      className="mr-4 flex cursor-pointer flex-row items-center gap-2 rounded-md bg-background-action p-2"
                      key={action.label}
                      onClick={() => {
                        setAction(action);
                        setIsOpen(false);
                        setKeyword('');
                      }}
                    >
                      <Image src={action.icon} alt={action.label} width={16} height={16} />
                      <div className="flex flex-col items-start justify-start">
                        <p className="text-sm font-medium text-white">{action.label}</p>
                        <p className="text-sm text-text-gray">{action.description}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex h-20 items-center justify-center">
                    <p className="text-sm text-text-gray">No actions found</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="absolute bottom-10 left-1/2 h-[400px] w-[360px] rounded-xl border border-solid border-border-divider bg-background-third py-4 pl-4"
              initial={{ opacity: 0, y: 10, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 10, x: '-50%' }}
              transition={{ duration: 0.3 }}
              ref={ref}
            >
              <div className="relative flex h-full w-full flex-col gap-1.5 overflow-auto">
                <div className="mb-2 flex items-center gap-2 pr-5">
                  <p className="text-base font-medium text-white">Actions</p>
                  <div className="flex flex-1 items-center overflow-hidden rounded-full border border-solid border-border-divider bg-background-action px-3">
                    <Image src={'/icons/search-gray.svg'} alt={'search'} width={14} height={14} />
                    <input
                      value={keyword}
                      className={`h-8 flex-1 appearance-none bg-transparent px-2 focus:outline-none`}
                      type={'text'}
                      disabled={disabled}
                      placeholder={'Search actions...'}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>
                {filteredActions.length > 0 ? (
                  filteredActions.map((action) => (
                    <motion.div
                      whileHover={{
                        backgroundColor: '#424242',
                      }}
                      className="mr-4 flex cursor-pointer flex-row items-center gap-2 rounded-md bg-background-action p-2"
                      key={action.label}
                      onClick={() => {
                        setAction(action);
                        setIsOpen(false);
                        setKeyword('');
                      }}
                    >
                      <Image src={action.icon} alt={action.label} width={16} height={16} />
                      <div className="flex flex-col items-start justify-start">
                        <p className="text-sm font-medium text-white">{action.label}</p>
                        <p className="text-sm text-text-gray">{action.description}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex h-20 items-center justify-center">
                    <p className="text-sm text-text-gray">No actions found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </button>
  );
};
