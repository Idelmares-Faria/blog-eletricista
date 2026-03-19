import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Blog do Eletricista — Dicas e Tutoriais de Elétrica',
    template: '%s — Blog do Eletricista',
  },
  description: 'Artigos técnicos, tutoriais e dicas sobre instalações elétricas, normas NBR, segurança e manutenção.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  },
  openGraph: {
    type: 'website',
    siteName: 'Blog do Eletricista',
    title: 'Blog do Eletricista — Dicas e Tutoriais de Elétrica',
    description: 'Artigos técnicos, tutoriais e dicas sobre instalações elétricas, normas NBR, segurança e manutenção.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-T8D4CJ9M'

  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&display=swap"
          rel="stylesheet"
        />
        {/* Theme initialization - runs before React hydration to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('blogeletricista-theme');
            if (t) { document.documentElement.setAttribute('data-theme', t); }
            else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `}} />
        {/* GTM */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}} />
      </head>
      <body className="font-sans">
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
