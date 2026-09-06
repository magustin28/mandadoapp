import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ListForm from "./pages/ListForm";
import ListDetail from "./pages/ListDetail";
import Categories from "./pages/Categories";
import MisItems from "./pages/MisItems";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ListsProvider } from "./hooks/useLists";

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F2EC",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: "#4A6741",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          color: "#F5F2EC",
          fontWeight: 600,
          fontFamily: "Nunito, sans-serif",
        }}
      >
        MA
      </div>
      <p
        style={{
          fontFamily: "Nunito, sans-serif",
          fontSize: 14,
          color: "#8C7E6E",
        }}
      >
        Cargando...
      </p>
    </div>
  );
}

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
