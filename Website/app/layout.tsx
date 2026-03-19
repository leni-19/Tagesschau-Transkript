import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tagesschau KI Zusammenfassungen',
  description: 'Tägliche Zusammenfassungen der 20-Uhr Sendung, generiert von Gemini 3.1 Flash.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}
