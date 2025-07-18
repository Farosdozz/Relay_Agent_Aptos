import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap', // Add display swap to prevent FOIT
  preload: true, // Ensure font is preloaded
});

interface OrbitronTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const OrbitronText: React.FC<OrbitronTextProps> = ({ children, ...props }) => {
  return (
    <div {...props} className={`${orbitron.className} ${props.className ?? ''}`}>
      {children}
    </div>
  );
};

export default OrbitronText;
