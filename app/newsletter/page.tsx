import { Metadata } from 'next'
import NewsletterClient from './NewsletterClient'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Inscreva-se na newsletter do Blog do Eletricista e receba artigos técnicos, normas e dicas práticas no seu email.',
}

export default function NewsletterPage() {
  return <NewsletterClient />
}
