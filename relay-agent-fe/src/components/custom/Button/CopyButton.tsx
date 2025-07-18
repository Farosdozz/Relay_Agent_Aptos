import Icons from '@/components/main/Icons';
import { useState } from 'react';

const CopyButton = ({
  value,
  text,
  className,
}: {
  value: string;
  text: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };

  return (
    <div
      className={`flex cursor-pointer flex-row items-center gap-2 text-sm hover:opacity-80 ${className}`}
      onClick={handleCopy}
    >
      <Icons icon="copy" size={16} />
      <span className="text-[#719FFB]">{copied ? 'Copied!' : text}</span>
    </div>
  );
};

export default CopyButton;
