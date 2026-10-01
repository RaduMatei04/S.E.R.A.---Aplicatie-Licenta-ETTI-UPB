import { Inbox } from 'lucide-react'
import { StateCard } from '@/components/feedback/StateCard'

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <StateCard icon={Inbox} title={title} description={description} fullWidth />
}
