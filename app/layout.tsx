import type { ReactNode } from 'react';

export const metadata = {
  title: 'AGSP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
