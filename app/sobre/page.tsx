import { Metadata } from 'next'
import SobreClient from './SobreClient'

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça o Blog do Eletricista — sua fonte de conhecimento técnico sobre instalações elétricas, normas e segurança.',
}

export default function SobrePage() {
  return <SobreClient />
}
