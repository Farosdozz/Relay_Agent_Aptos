import { Roboto_Condensed } from 'next/font/google';

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap', // Add display swap to prevent FOIT
  preload: true, // Ensure font is preloaded
  adjustFontFallback: true, // Automatically adjust the fallback font
  variable: '--font-roboto-condensed', // Add CSS variable for use in styles
});

interface RobotoCondensedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const RobotoCondensedText: React.FC<RobotoCondensedTextProps> = ({ children, ...props }) => {
  return (
    <span
      {...props}
      className={`${robotoCondensed.className} ${robotoCondensed.variable} ${props.className ?? ''}`}
    >
      {children}
    </span>
  );
};

export default RobotoCondensedText;
