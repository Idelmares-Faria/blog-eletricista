import { Metadata } from 'next'
import BuscaClient from './BuscaClient'

export const metadata: Metadata = {
  title: 'Buscar',
  description: 'Busque artigos técnicos sobre instalações elétricas, normas, segurança e manutenção no Blog do Eletricista.',
}

export default function BuscaPage() {
  return <BuscaClient />
}
