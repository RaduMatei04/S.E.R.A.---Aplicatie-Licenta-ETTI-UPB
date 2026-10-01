import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { DeviceStatus } from '@/api/types'

/**
 * Starea stației de senzori. Se reinterogează periodic ca plasă de siguranță: dacă
 * WebSocket-ul pică, pagina tot află că device-ul a trecut offline.
 */
export function useDeviceStatus() {
  return useQuery({
    queryKey: queryKeys.device.status,
    queryFn: () => api.get<DeviceStatus>('/api/v1/device/status'),
    refetchInterval: 15_000,
  })
}
