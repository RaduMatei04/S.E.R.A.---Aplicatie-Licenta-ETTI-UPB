import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { API_BASE_URL } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import type { CurrentTelemetry, DeviceStatus } from '@/api/types'
import { keycloak } from '@/auth/keycloak'

/**
 * Singurul loc din aplicație care atinge `@stomp/stompjs`.
 *
 * Backend-ul trimite un mesaj la fiecare citire de la ESP32 (aproximativ o dată pe
 * secundă). Valorile curente se scriu direct în cache-ul TanStack Query, fără a
 * declanșa o cerere HTTP; pentru evenimente se invalidează lista, pentru că ele apar
 * rar și au nevoie de paginare din server.
 */
export function useSeraSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const client = new Client({
      brokerURL: `${API_BASE_URL.replace(/^http/, 'ws')}/ws`,
      // Token-ul merge în CONNECT, nu în URL: un query string ajunge în logurile de
      // proxy și în istoricul browserului.
      connectHeaders: { Authorization: `Bearer ${keycloak.token ?? ''}` },
      reconnectDelay: 5000,
      beforeConnect: async () => {
        try {
          await keycloak.updateToken(30)
        } catch {
          // Reconectarea va eșua și va fi reîncercată; nu blocăm aici.
        }
        client.connectHeaders = { Authorization: `Bearer ${keycloak.token ?? ''}` }
      },
    })

    client.onConnect = () => {
      client.subscribe('/topic/telemetry', (message) => {
        queryClient.setQueryData<CurrentTelemetry>(
          queryKeys.telemetry.current(),
          JSON.parse(message.body) as CurrentTelemetry,
        )
      })

      client.subscribe('/topic/device', (message) => {
        queryClient.setQueryData<DeviceStatus>(
          queryKeys.device.status,
          JSON.parse(message.body) as DeviceStatus,
        )
      })

      client.subscribe('/topic/events', () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
      })
    }

    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [queryClient])
}
