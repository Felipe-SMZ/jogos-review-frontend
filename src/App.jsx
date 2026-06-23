import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { GuestRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import JogoDetalhe from './pages/JogoDetalhe'
import Login from './pages/Login'
import Registro from './pages/Registro'
import NotFound from './pages/NotFound'
import ImportarJogo from './pages/ImportarJogo'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jogos/:id" element={<JogoDetalhe />} />
            <Route path="/login" element={
              <GuestRoute><Login /></GuestRoute>
            } />
            <Route path="/registro" element={
              <GuestRoute><Registro /></GuestRoute>
            } />
            <Route path="/admin/importar" element={
              <AdminRoute><ImportarJogo /></AdminRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}