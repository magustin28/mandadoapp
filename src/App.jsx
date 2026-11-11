import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ListForm from "./pages/ListForm";
import ListDetail from "./pages/ListDetail";
import Categories from "./pages/Categories";
import MisItems from "./pages/MisItems";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import LoadingScreen from "./components/layout/LoadingScreen";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { useAuth } from "./hooks/authContext";
import { ListsProvider } from "./hooks/useLists";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <ListsProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nueva"
          element={
            <ProtectedRoute>
              <ListForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lista/:id"
          element={
            <ProtectedRoute>
              <ListDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lista/:id/editar"
          element={
            <ProtectedRoute>
              <ListForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-items"
          element={
            <ProtectedRoute>
              <MisItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ListsProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
