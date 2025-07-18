'use client';

import { ChatHistory } from '@/components/custom/Chat/ChatHistory';
import { Button } from '@/components/main/Button';
import { CustomSkeleton } from '@/components/main/CustomSkeleton';
import { useChatAction } from '@/hooks/useChatAction';
import { useChatContext } from '@/providers/ChatProvider';
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas';
import { Orbitron } from "next/font/google";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Props { }

const orbitronFont = Orbitron({ display: 'swap', weight: ['700'], subsets: ['latin'] });

const clipPathStyle = {
  clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)',
};

const Sidebar = (props: Props) => {
  const router = useRouter();
  const { isLoadingSessions, sessions, createNewSession } = useChatContext();

  const { rive: rivePointButton, RiveComponent: PointButton } = useRive({
    stateMachines: 'State Machine 1',
    src: `/rive/point-program.riv`,
    autoplay: true,
    layout: new Layout({
      alignment: Alignment.Center,
      fit: Fit.FitHeight,
    }),
  });

  const { rive: riveNewChat, RiveComponent: NewChatButton } = useRive({
    stateMachines: 'button',
    src: `/rive/new-chat.riv`,
    autoplay: true,
    layout: new Layout({
      alignment: Alignment.Center,
      fit: Fit.FitHeight,
    }),
  });

  const handleClick = () => {
    router.push('/app/campaign');
  };

  const handleCreateNewSession = async () => {
    try {
      if (!sessions || sessions.length <= 0) {
        // toast.error('You need to have at least one chat history to create a new session');
        return;
      }
      createNewSession('New conversation', true);
    } catch (error) {
      toast.error('Failed to create new chat');
      console.error(error);
    }
  };

  return (
    <div
      className={
        'black-linear-gradient relative z-50 hidden h-screen w-[180px] flex-col gap-8 rounded-r-3xl border border-[#2F3E37] px-3 py-5 lg:flex lg:w-[280px]'
      }
    >
      <Link href={'/'} className={'flex items-center gap-2.5'}>
        <Image src={'/icons/relay-logo-transparent.svg'} alt={''} width={128} height={36} />
      </Link>
      <div
        className={
          'relative h-[40px] w-full disabled:cursor-not-allowed disabled:opacity-10 aria-disabled:cursor-not-allowed aria-disabled:opacity-30'
        }
      >
        <div className={'absolute left-0 top-0 flex w-full gap-2'}>
          <button
            onClick={handleCreateNewSession}
            className="cursor-pointer rounded-lg bg-black p-2"
          >
            New chat
          </button>
        </div>
      </div>
      <div className={'hide-scrollbar z-10 flex flex-1 flex-col gap-2 overflow-y-scroll'}>
        {isLoadingSessions ? <CustomSkeleton count={6} /> : <ChatHistory />}
      </div>
      {/* <div className="w-full">
        <Image src={`/images/relay-tv.svg`} alt="relay tv" width={2000} height={2000} />
        <div className="relative p-[2px] shadow-2xl" style={clipPathStyle}>
          <div
            className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-500"
            style={clipPathStyle}
          ></div>
        </div>
      </div> */}
      <div className={'z-10 flex h-8 flex-row gap-2'}>
        <div className={'h-8 w-8'}>
          <Button
            color={'white'}
            classes={'h-full'}
            prefixIcon={<Image alt={'docs'} src={'/icons/docs.svg'} width={14} height={14} />}
            onClick={() => window.open('https://relay-agent.gitbook.io/relay', '_blank')}
          />
        </div>
        <div className={'h-8 w-8'}>
          <Button
            color={'white'}
            classes={'h-full'}
            prefixIcon={<Image alt={'docs'} src={'/icons/help.svg'} width={14} height={14} />}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
