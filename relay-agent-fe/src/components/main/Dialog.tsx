import { Button } from '@/components/main/Button';
import * as motion from 'motion/react-client';
import Image from 'next/image';
import React, { SetStateAction, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import clsx from 'clsx';
import Icons from './Icons';

export const Dialog = ({
  open,
  setOpen,
  header,
  body,
  footer,
  wrapperClassName,
  className,
}: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  header?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
  wrapperClassName?: string;
  className?: string;
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dialogRef as React.RefObject<HTMLElement>, () => setOpen(false));

  return (
    open && (
      <motion.div
        className={clsx(
          'fixed inset-0 bottom-0 z-[100] flex h-full w-full flex-col justify-end bg-background-primary bg-opacity-80',
          wrapperClassName,
        )}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1 }}
      >
        <motion.div
          className={clsx(
            'flex h-4/5 w-full flex-col gap-8 rounded-t-[32px] bg-background-secondary p-4 shadow-lg',
            className,
          )}
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: -50 }}
          ref={dialogRef}
        >
          <div className="relative flex items-center">
            {header}
            <div className="absolute right-0 top-0 h-8 w-8 rounded-full">
              <Button
                color={'black'}
                onClick={() => setOpen(false)}
                classes={'h-full bg-opacity-10'}
                prefixIcon={<Icons icon="close" size={14} />}
              />
            </div>
          </div>
          <div className={'flex-1 overflow-auto'}>{body}</div>
          {footer && <div>{footer}</div>}
        </motion.div>
      </motion.div>
    )
  );
};
