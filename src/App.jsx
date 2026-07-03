import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ListForm from './pages/ListForm'
import Categories from './pages/Categories'
import MisItems from './pages/MisItems'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Perfil from './pages/Perfil'
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/nueva" element={<ProtectedRoute><ListForm /></ProtectedRoute>} />
      <Route path="/lista/:id" element={<ProtectedRoute><ListForm /></ProtectedRoute>} />
      <Route path="/categorias" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/mis-items" element={<ProtectedRoute><MisItems /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
    </Routes>
  )
}

export default App