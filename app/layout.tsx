import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from './components/navigation/navbar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BudgetKing',
  description: 'Manage deine Ausgaben',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
