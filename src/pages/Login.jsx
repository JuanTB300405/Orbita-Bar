import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/orbitafondo.jpeg";
import galaxia from "../assets/images/galaxia3.png";
import "../styles/Login.css";
import { authentication } from "../js/login";

const Login = ({ setAutenticacion }) => {
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(false);

  const [error, setError] = useState(null);

  const ValidacionLogin = async () => {
    setCargando(true);

    setAutenticacion(false);
    const response = await authentication({
      contrasena: document.getElementById("contrasena").value,
    });

    if (response.status == 200) {
      //quitar 'true' esto es para que no me esté pidiendo token de auth
      setAutenticacion(true);
      navigate("/");
      setCargando(false);
    } else {
      setError("Contraseña incorrecta, verifique por favor.");
      setCargando(false);
    }
  };

  const [verContraseña, setverContraseña] = useState(false);

  // /////////////////////////////////////////////////////////////////////////////////////////////////////

  // /////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <section className="login">
      <div className="cont-img">
        <img src={galaxia} alt="" />
      </div>
      {/* este div es de la imagen que parte a la mitad la pantalla*/}
      <div className="cont-rest">
        <br />
        <img src={logo} alt="Logo de Q'SaboresS" id="logo" />
        <br />
        <br />
        <h1>Bienvenido de nuevo!</h1>
        <br />
        <div className="contraseña-vision">
          <label htmlFor="contrasena">Contraseña</label>
          <input
            type={verContraseña ? "text" : "password"}
            placeholder="Ingrese su contraseña"
            id="contrasena"
          />
          <span
            className="icono"
            onClick={() => setverContraseña(!verContraseña)}
          >
            {verContraseña ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-eye-off"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
                <path d="M3 3l18 18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon icon-tabler icons-tabler-outline icon-tabler-eye"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
              </svg>
            )}
          </span>
        </div>
        {error && <h3 className="error-login">{error}</h3>}
        <br />
        <button onClick={ValidacionLogin}>Iniciar Sesion</button>
      </div>
      {cargando && (
        <div className="modal-cargando-l">
          <div className="modal-contenido-l">
            <div class="loader-l"></div>
          </div>
        </div>
      )}
      ;
    </section>
  );
};

export default Login;
