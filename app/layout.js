import './globals.css';

export const metadata = {
  title: 'Vibelog',
  description: 'Your journey to mindful living begins here.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}