import "./App.css";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inventario from "./pages/Inventario";
import Informes from "./pages/Informes";
import Layout from "./Layouts/Layout";
import Proveedores from "./pages/proveedores";
import Egresos from "./pages/Egresos";
import Categorias from "./pages/Categoria";
import Ventas from "./pages/Ventas";
import GestionMesas from "./pages/GestionMesas";
import Deudores from "./pages/Deudores";
import IngresosExternos from "./pages/IngresosExternos";
import Inicio from "./pages/Inicio";
import Mesa from "./pages/Mesa";
import Pedidos from "./pages/pedidos";
import CierreCaja from "./pages/CierreCaja";
function App() {
  const [Autenticacion, setAutenticacion] = useState(false);
  const [verificandoToken, setVerificandoToken] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAutenticacion(true);
    }
    setVerificandoToken(false);
  }, []);

  return (
    <>
      {verificandoToken ? null : (
        <div id="app">
          <Router>
            <Routes>
              {/* Ruta de login */}
              <Route
                path="/login"
                element={<Login setAutenticacion={setAutenticacion} />}
              />

              {/* Rutas protegidas */}
              <Route
                path="/"
                element={
                  Autenticacion ? (
                    <Layout setAutenticacion={setAutenticacion} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              >
                <Route path="/" element={<Inicio />} />
                <Route path="/home" element={<Home />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/informes" element={<Informes />} />
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/egresos" element={<Egresos />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/gestionMesas" element={<GestionMesas />} />
                <Route path="/deudores" element={<Deudores />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route
                  path="/ingresosExternos"
                  element={<IngresosExternos />}
                />
                <Route path="/mesa" element={<Mesa />} />
                <Route path="/cierreCaja" element={<CierreCaja />} />
              </Route>
            </Routes>
          </Router>
        </div>
      )}
    </>
  );
}

export default App;
