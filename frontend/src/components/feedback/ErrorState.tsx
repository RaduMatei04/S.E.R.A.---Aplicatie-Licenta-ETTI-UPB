import { TriangleAlert } from 'lucide-react'
import { StateCard } from '@/components/feedback/StateCard'

type ErrorStateProps = {
  title?: string
  error?: unknown
}

export function ErrorState({ title = 'Datele nu au putut fi încărcate', error }: ErrorStateProps) {
  const description = error instanceof Error ? error.message : undefined
  return <StateCard icon={TriangleAlert} title={title} description={description} fullWidth />
}
