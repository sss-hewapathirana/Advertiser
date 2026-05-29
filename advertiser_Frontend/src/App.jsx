import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ui/ErrorBoundary'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import AdList from './pages/AdList'
import AdForm from './pages/AdForm'
import AdDetailPage from './pages/AdDetailPage'
import Inbox from './pages/Inbox'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <CurrencyProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route path="/" element={<AppLayout><Landing /></AppLayout>} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
                  } />
                  <Route path="/ads" element={
                    <ProtectedRoute><AppLayout><AdList /></AppLayout></ProtectedRoute>
                  } />
                  <Route path="/ads/new" element={
                    <ProtectedRoute><AppLayout><AdForm /></AppLayout></ProtectedRoute>
                  } />
                  <Route path="/ads/:id" element={
                    <ProtectedRoute><AppLayout><AdForm /></AppLayout></ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute><AppLayout><Inbox /></AppLayout></ProtectedRoute>
                  } />
                  <Route path="/ad/:id" element={<AppLayout><AdDetailPage /></AppLayout>} />

                  <Route path="/404" element={<AppLayout><NotFound /></AppLayout>} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </CurrencyProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
