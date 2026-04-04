import "./App.css";
import { useState } from "react";
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
import Deudores from "./pages/Deudores";

function App() {
  const [Autenticacion, setAutenticacion] = useState(false);

  return (
    <>
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
              element={Autenticacion ? <Layout /> : <Navigate to="/login" />}
            >
              <Route path="/" element={<Home />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/informes" element={<Informes />} />
              <Route path="/proveedores" element={<Proveedores />} />
              <Route path="/egresos" element={<Egresos />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/deudores" element={<Deudores />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
