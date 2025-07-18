import Image from 'next/image';
import { Input } from '@/components/main/Input';
import { Button } from '@/components/main/Button';
import { SOCIALS } from '@/constants';
import Link from 'next/link';

export const RefCode = () => {
  return (
    <div className={'relative flex w-full flex-1 flex-col items-center justify-center px-4'}>
      <div className={'relative aspect-square w-[100px]'}>
        <Image src={'/icons/logo.svg'} alt={''} fill />
      </div>
      <p className={'mt-4 text-xl font-bold md:text-[28px]'}>Relay is referral only.</p>
      <p className={'text-sm font-normal md:text-lg'}>Please enter a ref code to get started</p>
      <div
        className={
          'mx-auto mt-12 flex w-full max-w-[400px] flex-col items-center gap-3 sm:flex-row'
        }
      >
        <div
          className={
            'w-full max-w-2xl flex-1 gap-4 rounded-xl border border-solid border-border-primary bg-background-secondary md:h-11'
          }
        >
          <Input placeholder={'Ref code'} classes={'h-11'} type={'text'} />
        </div>
        <div className={'h-11 w-full sm:w-[95px]'}>
          <Button color={'primary'} label={'Submit'} classes={'h-full rounded-xl'} />
        </div>
      </div>
      <div className={'absolute bottom-4 flex w-full flex-col items-center gap-2 md:bottom-10'}>
        <p className={'text-base font-bold'}>Get your ref code here</p>
        <div className={'flex gap-2'}>
          {SOCIALS.map((social) => (
            <Link href={social.href} key={social.name} className={'appearance-none'}>
              <Image src={social.icon} alt={''} width={32} height={32} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
