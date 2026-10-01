import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { Settings, UpdateSettingsPayload } from '@/api/types'

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.all,
    queryFn: () => api.get<Settings>('/api/v1/settings'),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) =>
      api.put<Settings>('/api/v1/settings', payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings.all, settings)
    },
  })
}
