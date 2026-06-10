import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Serif_Ethiopic } from 'next/font/google'
import { PwaRegister } from '@/components/PwaRegister'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const notoSerifEthiopic = Noto_Serif_Ethiopic({
  variable: '--font-ethiopic',
  subsets: ['ethiopic'],
})

export const metadata: Metadata = {
  title: 'RAAFAT Dictionary - Harari Language',
  description: 'Explore and contribute to the Harari language dictionary. Search, learn, and help preserve this rich linguistic heritage.',
  generator: 'v0.app',
  metadataBase: new URL('https://raafat-dictionary.vercel.app'),
  keywords: ['Harari', 'dictionary', 'language', 'Ethiopia', 'linguistic', 'heritage'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${notoSerifEthiopic.variable} bg-background dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light' || (!('theme' in localStorage) && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.remove('dark')
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
