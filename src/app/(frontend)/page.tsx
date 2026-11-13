import { redirect } from 'next/navigation'

// O CMS é apenas o painel + API. O portal institucional é outro projeto.
export default function Home() {
  redirect('/admin')
}
