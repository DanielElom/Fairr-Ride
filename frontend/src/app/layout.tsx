import type { Metadata, Viewport } from 'next'
import { Manrope, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Fair-Ride',
  description: 'On-demand logistics and delivery — fast, fair, reliable.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#003418',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
              borderRadius: '0.75rem',
              background: '#ffffff',
              color: '#191d19',
            },
          }}
        />
      </body>
    </html>
  )
}
