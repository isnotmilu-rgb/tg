import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import { RequireAdmin } from './auth/RequireAdmin'
import { RequireAuth } from './auth/RequireAuth'
import { ChoferesPage } from './pages/ChoferesPage'
import { ConfiguracionPage } from './pages/ConfiguracionPage'
import { DashboardPage } from './pages/DashboardPage'
import { FlotaPage } from './pages/FlotaPage'
import { LoginPage } from './pages/LoginPage'
import { NuevoViajePage } from './pages/NuevoViajePage'
import { ViajesPage } from './pages/ViajesPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<App />}>
              <Route index element={<DashboardPage />} />
              <Route path="viajes" element={<ViajesPage />} />
              <Route path="flota" element={<FlotaPage />} />

              <Route element={<RequireAdmin />}>
                <Route path="viajes/nuevo" element={<NuevoViajePage />} />
                <Route path="choferes" element={<ChoferesPage />} />
                <Route path="configuracion" element={<ConfiguracionPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
