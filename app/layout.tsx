import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Octopus Deploy Dashboard',
  description: 'Dashboard per visualizzare i deployment di Octopus Deploy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
