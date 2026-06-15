import { notFound } from 'next/navigation'
import CardGenerator from '@/components/CardGenerator'

type TemplateType = 'attendee' | 'speaker' | 'volunteer' | 'staff'

function resolveToken(token: string): TemplateType | null {
  const map: Record<string, TemplateType> = {
    [process.env.TOKEN_ATTENDEE  ?? '']: 'attendee',
    [process.env.TOKEN_SPEAKER   ?? '']: 'speaker',
    [process.env.TOKEN_VOLUNTEER ?? '']: 'volunteer',
    [process.env.TOKEN_STAFF     ?? '']: 'staff',
  }
  return map[token] ?? null
}

export default async function TokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const templateType = resolveToken(token)

  if (!templateType) notFound()

  return <CardGenerator templateType={templateType} />
}

export const dynamic = 'force-dynamic'
