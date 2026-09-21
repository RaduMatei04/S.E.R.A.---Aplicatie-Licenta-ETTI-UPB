import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedApp } from '@/app/layout/ProtectedApp'
import { StartPage } from '@/features/start/StartPage'
import { HomePage } from '@/features/home/HomePage'
import { StatusPage } from '@/features/status/StatusPage'
import { ChartsPage } from '@/features/charts/ChartsPage'
import { HistoryPage } from '@/features/history/HistoryPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { ProfilePage } from '@/features/profile/ProfilePage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/start" replace />} />
        <Route path="/start" element={<StartPage />} />
        <Route element={<ProtectedApp />}>
          <Route path="/acasa" element={<HomePage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/grafice" element={<ChartsPage />} />
          <Route path="/istoric" element={<HistoryPage />} />
          <Route path="/setari" element={<SettingsPage />} />
          <Route path="/profil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
