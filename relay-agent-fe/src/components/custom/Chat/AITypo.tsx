import Image from 'next/image';

export const AITypo = () => {
  return (
    <div className={'flex items-center gap-2'}>
      <Image src={'/icons/avt-ai.svg'} alt={''} width={32} height={32} />
      <p>"Decentralized AI agent automating blockchain tasks seamlessly."</p>
    </div>
  );
};
