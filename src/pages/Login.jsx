import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { authentication } from "../js/login";
import alien from "../assets/images/alien.png";

const Login = ({ setAutenticacion }) => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [verContraseña, setverContraseña] = useState(false);

  const ValidacionLogin = async () => {
    setCargando(true);
    setAutenticacion(false);
    const response = await authentication({
      contrasena: document.getElementById("contrasena").value,
    });

    if (response.status == 200) {
      setAutenticacion(true);
      navigate("/");
      setCargando(false);
    } else {
      setError("Contraseña incorrecta, verifique por favor.");
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") ValidacionLogin();
  };

  return (
    <section className="lg-page">
      <div className="lg-bg-overlay" />
      <div className="lg-grid-lines" />

      <div className="lg-card">
        <span className="lg-corner lg-corner--tl" />
        <span className="lg-corner lg-corner--br" />
        <div className="lg-scan-line" />

        {/* ── Branding ── */}
        <div className="lg-brand">
          <div className="lg-alien-wrap">
            <img src={alien} alt="Alien" className="lg-alien-img" />
            <div className="lg-alien-ring" />
            <div className="lg-alien-ring lg-alien-ring--2" />
          </div>
          <p className="lg-system-label">SISTEMA DE ACCESO</p>
          <h1 className="lg-title">ÓRBITA BAR</h1>
          <p className="lg-subtitle">Ingresa tu contraseña para continuar</p>
        </div>

        <div className="lg-divider" />

        {/* ── Formulario ── */}
        <div className="lg-form">
          <div className="lg-field">
            <input
              type={verContraseña ? "text" : "password"}
              id="contrasena"
              className="lg-input"
              placeholder=" "
              onKeyDown={handleKeyDown}
              onChange={() => error && setError(null)}
            />
            <label htmlFor="contrasena" className="lg-label">
              Contraseña
            </label>
            <button
              type="button"
              className="lg-eye-btn"
              onClick={() => setverContraseña(!verContraseña)}
              tabIndex={-1}
            >
              {verContraseña ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                  <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
                  <path d="M3 3l18 18" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                  <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div className="lg-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            className={`lg-submit${cargando ? " lg-submit--loading" : ""}`}
            onClick={ValidacionLogin}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="lg-spinner" />
                VERIFICANDO...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                INICIAR SESIÓN
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Login;
