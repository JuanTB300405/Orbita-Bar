import React from "react";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/CierreCaja.css";
import { ConsultarRegistros, CrearRegistro } from "../js/cierreCajaBack";
import { generarCierrePDFDesdeRegistro } from "../js/generarCierrePDFDesdeRegistro";

const CierreCaja = () => {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [registrosData, setRegistrosData] = useState([]);
  const datosFiltrados = registrosData.filter((registro) =>
    registro.fecha.toLowerCase().includes(busqueda.toLowerCase()),
  );
  console.log("datos filtrados", datosFiltrados);
  const obtenerRegistros = async () => {
    try {
      const response = await ConsultarRegistros();
      if (response) {
        setRegistrosData(response);
      } else {
        console.log("Error al traer los datos", response);
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
    } finally {
      setCargando(false);
    }
  };
  console.log("pedidos obtenidos", registrosData);
  useEffect(() => {
    obtenerRegistros();
  }, []);

  const [seleccionados, setSeleccionados] = useState([]);

  if (cargando) {
    return (
      <div className="pv-loading-overlay">
        <div className="pv-loading-inner">
          <div className="pv-loader" />
          <span className="pv-loading-text">Cargando proveedores...</span>
        </div>
      </div>
    );
  }

  const allIds = datosFiltrados.map((p) => p.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => seleccionados.includes(id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSeleccionados((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSeleccionados((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  return (
    <section className="pv-page">
      {/* Header */}
      <div className="pv-header">
        <div className="pv-header-accent" />
        <div className="pv-header-content">
          <h1 className="pv-title">REGISTRO DE CIERRE DE CAJA</h1>
          <p className="pv-subtitle">Gestión de cierres diarios</p>
        </div>
        <div className="pv-header-badge">Registros Cierre de Caja</div>
      </div>

      {/* Toolbar */}
      <div className="pv-toolbar">
        <div className="pv-toolbar-left">
          <div className="pv-search-wrap">
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
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
            <input
              type="text"
              className="pv-search-input"
              placeholder="Buscar Cierre de venta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="pv-info-bar">
        <span className="pv-info-item">
          <span className="pv-info-label">MOSTRANDO</span>
          <span className="pv-info-value">{datosFiltrados.length}</span>
        </span>
        {seleccionados.length > 0 && (
          <span className="pv-info-item pv-info-item--sel">
            <span className="pv-info-label">SELECCIONADOS</span>
            <span className="pv-info-value">{seleccionados.length}</span>
          </span>
        )}
        <span className="pv-info-item pv-info-item--total">
          <span className="pv-info-label">TOTAL REGISTROS DE CIERRE</span>
          <span className="pv-info-value">{registrosData.length}</span>
        </span>
      </div>

      {/* Table Panel */}
      <div className="pv-table-panel">
        <div className="pv-table-wrap">
          <table className="pv-table">
            <thead className="pv-thead">
              <tr className="pv-tr pv-tr--header">
                <th className="pv-th pv-th--chk">
                  <input
                    type="checkbox"
                    className="pv-checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    disabled={allIds.length === 0}
                    title="Seleccionar todo"
                  />
                </th>
                <th className="pv-th pv-th--idx">#</th>
                <th className="pv-th">FECHA</th>
                <th className="pv-th">HORA</th>
                <th className="pv-th">ACCION</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length > 0 ? (
                datosFiltrados.map((registro, index) => (
                  <tr
                    key={registro.id}
                    className={`pv-tr pv-tr--clickable${seleccionados.includes(registro.id) ? " pv-tr--sel" : ""}`}
                    onClick={() => {
                      console.log("clickeado registro", registro.id);
                    }}
                  >
                    <td
                      className="pv-td pv-td--chk"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="pv-checkbox"
                        checked={seleccionados.includes(registro.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSeleccionados([...seleccionados, registro.id]);
                          } else {
                            setSeleccionados(
                              seleccionados.filter((id) => id !== registro.id),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="pv-td pv-td--idx">{index + 1}</td>
                    <td className="pv-td">
                      <span className="pv-email-txt">{registro.fecha}</span>
                    </td>
                    <td className="pv-td">
                      <span className="pv-email-txt">{registro.hora}</span>
                    </td>
                    <td className="pv-td">
                      <div
                        className="pv-td-btn"
                        className="pv-td-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          generarCierrePDFDesdeRegistro(registro);
                        }}
                      >
                        Descargar
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="pv-td pv-td--empty">
                    <div className="pv-empty-state">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M17 20h-14a1 1 0 0 1 -1 -1v-11a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v2" />
                        <path d="M16 6v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v2" />
                        <path d="M15 15m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                        <path d="M21 21l-1.5 -1.5" />
                      </svg>
                      <span>No hay proveedores registrados</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </section>
  );
};

export default CierreCaja;
