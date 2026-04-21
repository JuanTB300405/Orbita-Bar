import "../styles/Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/orbitafondo.jpeg";
import { Link } from "react-router-dom";
import { useState } from "react";

const Sidebar = ({ setAutenticacion }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [modal, setModal] = useState(false);

  const CerrarSesion = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setAutenticacion(false);
  };

  const abrirmodal = () => setModal(true);
  const cerrarmodal = () => setModal(false);

  const act = (path) => (pathname === path ? " sb-item--active" : "");

  return (
    <div className="sb-sidebar">
      {/* ── Brand ─────────────────────────────────────── */}
      <div className="sb-brand">
        <div className="sb-logo-wrap">
          <img src={logo} alt="Orbita Logo" className="sb-logo-img" />
        </div>
        <p className="sb-brand-name">ORBITA BAR</p>
        <div className="sb-brand-status">
          <span className="sb-status-dot" />
          <span className="sb-status-txt">Orbit Control System</span>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────── */}
      <nav className="sb-nav">
        <ul className="sb-list">
          {/* Inicio */}
          <li className={`sb-item${act("/")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                <path d="M10 12h4v4h-4z" />
              </svg>
            </span>
            <Link className="sb-link" to="/">
              Inicio
            </Link>
          </li>

          {/* ─── VENTAS ─── */}
          <li className="sb-section">
            <span className="sb-section-label">VENTAS</span>
          </li>

          <li className={`sb-item${act("/home")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M17 17h-11v-14h-2" />
                <path d="M6 5l14 1l-1 7h-13" />
              </svg>
            </span>
            <Link className="sb-link" to="/home">
              Ventas
            </Link>
          </li>

          <li className={`sb-item${act("/ventas")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 12v-4" />
                <path d="M15 12v-2" />
                <path d="M12 12v-1" />
                <path d="M3 4h18" />
                <path d="M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-10" />
                <path d="M12 16v4" />
                <path d="M9 20h6" />
              </svg>
            </span>
            <Link className="sb-link" to="/ventas">
              Registro Ventas
            </Link>
          </li>

          <li className={`sb-item${act("/gestionmesas")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10v8l7 -3v-2.6z" />
                <path d="M3 6l9 3l9 -3l-9 -3z" />
                <path d="M14 12.3v8.7l7 -3v-8z" />
              </svg>
            </span>
            <Link className="sb-link" to="/gestionmesas">
              Gestión de Mesas
            </Link>
          </li>
          <li className={`sb-item${act("/home")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15h-2.5c-.398 0 -.779 .158 -1.061 .439c-.281 .281 -.439 .663 -.439 1.061c0 .398 .158 .779 .439 1.061c.281 .281 .663 .439 1.061 .439h1c.398 0 .779 .158 1.061 .439c.281 .281 .439 .663 .439 1.061c0 .398 -.158 .779 -.439 1.061c-.281 .281 -.663 .439 -1.061 .439h-2.5" />
                <path d="M19 21v1m0 -8v1" />
                <path d="M13 21h-7c-.53 0 -1.039 -.211 -1.414 -.586c-.375 -.375 -.586 -.884 -.586 -1.414v-10c0 -.53 .211 -1.039 .586 -1.414c.375 -.375 .884 -.586 1.414 -.586h2m12 3.12v-1.12c0 -.53 -.211 -1.039 -.586 -1.414c-.375 -.375 -.884 -.586 -1.414 -.586h-2" />
                <path d="M16 10v-6c0 -.53 -.211 -1.039 -.586 -1.414c-.375 -.375 -.884 -.586 -1.414 -.586h-4c-.53 0 -1.039 .211 -1.414 .586c-.375 .375 -.586 .884 -.586 1.414v6m8 0h-8m8 0h1m-9 0h-1" />
                <path d="M8 14v.01" />
                <path d="M8 17v.01" />
                <path d="M12 13.99v.01" />
                <path d="M12 17v.01" />
              </svg>
            </span>
            <Link className="sb-link" to="/cierreCaja">
              Cierres de Caja
            </Link>
          </li>

          {/* ─── STOCK ─── */}
          <li className="sb-section">
            <span className="sb-section-label">STOCK</span>
          </li>

          <li className={`sb-item${act("/inventario")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                <path d="M9 12l.01 0" />
                <path d="M13 12l2 0" />
                <path d="M9 16l.01 0" />
                <path d="M13 16l2 0" />
              </svg>
            </span>
            <Link className="sb-link" to="/inventario">
              Inventario
            </Link>
          </li>

          <li className={`sb-item${act("/ingresosExternos")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
                <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
              </svg>
            </span>
            <Link className="sb-link" to="/ingresosExternos">
              Ingresos Externos
            </Link>
          </li>

          {/* ─── FINANZAS ─── */}
          <li className="sb-section">
            <span className="sb-section-label">FINANZAS</span>
          </li>

          <li className={`sb-item${act("/egresos")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 2.66a1 1 0 0 0 -1 1a3 3 0 1 0 0 6v2a1.024 1.024 0 0 1 -.866 -.398l-.068 -.101a1 1 0 0 0 -1.732 .998a3 3 0 0 0 2.505 1.5h.161a1 1 0 0 0 .883 .994l.117 .007a1 1 0 0 0 1 -1l.176 -.005a3 3 0 0 0 -.176 -5.995v-2c.358 -.012 .671 .14 .866 .398l.068 .101a1 1 0 0 0 1.732 -.998a3 3 0 0 0 -2.505 -1.501h-.161a1 1 0 0 0 -1 -1zm1 7a1 1 0 0 1 0 2v-2zm-2 -4v2a1 1 0 0 1 0 -2z" />
              </svg>
            </span>
            <Link className="sb-link" to="/egresos">
              Egresos
            </Link>
          </li>

          <li className={`sb-item${act("/deudores")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4c.348 0 .686 .045 1.009 .128" />
                <path d="M16 19h6" />
              </svg>
            </span>
            <Link className="sb-link" to="/deudores">
              Deudores
            </Link>
          </li>

          {/* ─── GESTIÓN ─── */}
          <li className="sb-section">
            <span className="sb-section-label">GESTIÓN</span>
          </li>

          <li className={`sb-item${act("/informes")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                <path d="M9 17v-5" />
                <path d="M12 17v-1" />
                <path d="M15 17v-3" />
              </svg>
            </span>
            <Link className="sb-link" to="/informes">
              Informes
            </Link>
          </li>

          <li className={`sb-item${act("/proveedores")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
                <path d="M12 12l8 -4.5" />
                <path d="M12 12l0 9" />
                <path d="M12 12l-8 -4.5" />
              </svg>
            </span>
            <Link className="sb-link" to="/proveedores">
              Proveedores
            </Link>
          </li>

          <li className={`sb-item${act("/categorias")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 4h6v6h-6z" />
                <path d="M14 4h6v6h-6z" />
                <path d="M4 14h6v6h-6z" />
                <path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
              </svg>
            </span>
            <Link className="sb-link" to="/categorias">
              Categorias
            </Link>
          </li>

          <li className={`sb-item${act("/mesa")}`}>
            <span className="sb-item-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10v8l7 -3v-2.6z" />
                <path d="M3 6l9 3l9 -3l-9 -3z" />
                <path d="M14 12.3v8.7l7 -3v-8z" />
              </svg>
            </span>
            <Link className="sb-link" to="/mesa">
              Mesas
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── Pedidos fijo (fuera del scroll) ───────────── */}
      <div className="sb-pedidos-fixed">
        <div className="sb-section">
          <span className="sb-section-label">PEDIDOS</span>
        </div>
        <div className={`sb-item${act("/pedidos")}`}>
          <span className="sb-item-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
              <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
              <path d="M9 12l.01 0" />
              <path d="M13 12l2 0" />
              <path d="M9 16l.01 0" />
              <path d="M13 16l2 0" />
            </svg>
          </span>
          <Link className="sb-link" to="/pedidos">
            Pedidos
          </Link>
        </div>
      </div>

      {/* ── Logout ────────────────────────────────────── */}
      <button className="sb-logout" onClick={abrirmodal}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" />
          <path d="M15 12h-12l3 -3" />
          <path d="M6 15l-3 -3" />
        </svg>
        <span>Cerrar Sesión</span>
      </button>

      {/* ── Modal ─────────────────────────────────────── */}
      {modal && (
        <div className="sb-overlay" onClick={cerrarmodal}>
          <div className="sb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sb-modal-corner sb-modal-corner--tl" />
            <div className="sb-modal-corner sb-modal-corner--br" />
            <div className="sb-modal-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h2 className="sb-modal-title">¿Cerrar sesión?</h2>
            <p className="sb-modal-body">
              ¿Está completamente seguro que desea cerrar sesión?
            </p>
            <div className="sb-modal-actions">
              <button className="sb-btn sb-btn--confirm" onClick={CerrarSesion}>
                Aceptar
              </button>
              <button className="sb-btn sb-btn--dismiss" onClick={cerrarmodal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
