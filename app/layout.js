import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Vibelog',
  description: 'Your journey to mindful living begins here.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
