import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingCard } from '@/components/feedback/LoadingCard'
import { PageSection } from '@/components/layout/PageSection'
import { SettingsForm } from '@/features/settings/components/SettingsForm'
import { useSettings } from '@/features/settings/hooks/useSettings'

export function SettingsPage() {
  const { data, isPending, isError, error } = useSettings()

  if (isError) {
    return (
      <div className="space-y-12">
        <ErrorState error={error} />
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="space-y-12">
        <PageSection columns={2}>
          <LoadingCard />
          <LoadingCard />
        </PageSection>
        <PageSection columns={3}>
          {Array.from({ length: 6 }, (_, index) => (
            <LoadingCard key={index} />
          ))}
        </PageSection>
      </div>
    )
  }

  // `key` leagă starea formularului de versiunea datelor: după o salvare reușită,
  // formularul se remontează cu valorile confirmate de server.
  return <SettingsForm key={data.updatedAt} settings={data} />
}
