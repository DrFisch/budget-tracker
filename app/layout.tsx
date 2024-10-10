
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from './components/navigation/navbar';
import { checkRecurringExpenses } from './hooks/useRecurringExpenses';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SigmaSavings',
  description: 'Manage deine Moneten wie ein Sigma Gigachad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  checkRecurringExpenses();

  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
