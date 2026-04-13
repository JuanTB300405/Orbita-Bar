import React from "react";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Deudores.css";
import {
  consultarDeudores,
  crearDeudores,
  editarDeudores,
  eliminarDeudores,
} from "../js/deudores";

const Deudores = () => {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [deudoresData, setDeudoresData] = useState([]);

  const datosFiltrados = deudoresData.filter((deudor) =>
    deudor.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const obtenerDeudores = async () => {
    try {
      const data = await consultarDeudores();
      if (Array.isArray(data)) {
        setDeudoresData(data);
      } else {
        console.error("Respuesta inesperada:", data);
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDeudores();
  }, []);

  // Formulario agregar
  const [datosForm, setDatosForm] = useState({
    nombre: "",
    celular: "",
    deuda: "",
    autorizacion: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, celular, deuda } = datosForm;

    if (!nombre || !celular || !deuda) {
      setError("Por favor complete todos los campos obligatorios.");
      return;
    }

    const nuevoDeudor = {
      nombre,
      celular,
      deuda: parseFloat(deuda),
      autorizacion: datosForm.autorizacion,
    };

    try {
      const response = await crearDeudores(nuevoDeudor);
      if (response.status === 201) {
        toast.success("¡Deudor registrado exitosamente!");
        obtenerDeudores();
      }
    } catch (error) {
      console.error("Excepción al crear el deudor:", error);
      toast.error("Error al registrar el deudor");
    }

    setDatosForm({ nombre: "", celular: "", deuda: "", autorizacion: false });
    setError("");
    cerrarModalAgregar();
  };

  // Modal agregar
  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => setShowModalAgregar(true);

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    setDatosForm({ nombre: "", celular: "", deuda: "", autorizacion: false });
    setError("");
  };

  // Selección de filas
  const [seleccionados, setSeleccionados] = useState([]);

  // Modal eliminar
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    if (seleccionados.length === 0) {
      toast.warning("No hay ningún deudor seleccionado");
      return;
    }
    setShowModalEliminar(true);
  };

  const eliminarDeudoresSelec = async () => {
    try {
      const data = { ids: seleccionados };
      const response = await eliminarDeudores(data);
      if (response.status === 204) {
        toast.success("¡Deudores eliminados exitosamente!");
        setSeleccionados([]);
        obtenerDeudores();
      }
    } catch (error) {
      console.error("Excepción al eliminar deudores:", error);
      toast.error("Error al eliminar los deudores");
    }
    cerrarModalEliminar();
  };

  const cerrarModalEliminar = () => setShowModalEliminar(false);

  // Edición inline
  const [edicion, setEdicion] = useState(false);
  const [deudorEditando, setDeudorEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const verEdicion = () => {
    const selec = deudoresData.filter((d) => seleccionados.includes(d.id));

    if (selec.length === 0) {
      toast.warning("No hay ningún deudor seleccionado");
      return;
    }
    if (selec.length > 1) {
      toast.warning("Selecciona solo un deudor para editar");
      return;
    }

    setEdicion(true);
    setDeudorEditando(selec[0].id);
    setDatosEditados({ ...selec[0] });
  };

  const CancelarEdicion = () => {
    setDeudorEditando(null);
    setDatosEditados({});
    setEdicion(false);
    toast.info("Cancelado con éxito");
  };

  const GuardarEdicion = async () => {
    const deudorE = {
      nombre: datosEditados.nombre,
      celular: datosEditados.celular,
      deuda: parseFloat(datosEditados.deuda),
      autorizacion: datosEditados.autorizacion,
      pagado: datosEditados.pagado,
    };

    try {
      const response = await editarDeudores(deudorE, deudorEditando);
      if (response.status === 200) {
        toast.success("¡Deudor actualizado exitosamente!");
        obtenerDeudores();
      } else {
        toast.warning("No se pudo actualizar el deudor");
      }
    } catch (error) {
      console.error("Excepción al actualizar el deudor:", error);
      toast.error("Error al actualizar el deudor");
    }

    setDeudorEditando(null);
    setDatosEditados({});
    setEdicion(false);
  };

  const handleChangeEdicion = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosEditados((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatFecha = (fechaStr) => {
    const d = new Date(fechaStr);
    return d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="de-loading">
        <div className="de-loader"></div>
        <p className="de-loading-text">CARGANDO DEUDORES...</p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <section className="de-page">

        {/* ── Header ── */}
        <div className="de-header">
          <div className="de-header-left">
            <div className="de-status">
              <span className="de-status-dot"></span>
              <span className="de-status-text">MÓDULO ACTIVO</span>
            </div>
            <h1 className="de-title">DEUDORES</h1>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="de-toolbar">
          <div className="de-toolbar-left">
            <div className="de-search-wrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a8abb3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="de-search"
                type="text"
                value={busqueda}
                placeholder="BUSCAR DEUDOR..."
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="de-toolbar-right">
            {edicion ? (
              <>
                <span className="de-edit-active-badge">MODO EDICIÓN</span>
                <button className="de-btn de-btn--verde" onClick={GuardarEdicion}>
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
                    <path d="M5 12l5 5l10 -10" />
                  </svg>
                  GUARDAR
                </button>
                <button className="de-btn de-btn--rojo" onClick={CancelarEdicion}>
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
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                  CANCELAR
                </button>
              </>
            ) : (
              <>
                <button className="de-btn de-btn--verde" onClick={abrirModalAgregar}>
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  AGREGAR
                </button>
                <button className="de-btn de-btn--cyan" onClick={verEdicion}>
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  EDITAR
                </button>
                <button className="de-btn de-btn--rojo" onClick={abrirModalEliminar}>
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  ELIMINAR
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Info bar ── */}
        <div className="de-info-bar">
          <span className="de-info-count">
            <span className="de-info-num">{datosFiltrados.length}</span> de{" "}
            {deudoresData.length} deudores
          </span>
          {seleccionados.length > 0 && (
            <span className="de-sel-badge">
              {seleccionados.length} seleccionado(s)
            </span>
          )}
          {edicion && (
            <span className="de-edit-badge">MODO EDICIÓN ACTIVO</span>
          )}
          {/* Contador de deudas pendientes */}
          {deudoresData.filter((d) => !d.pagado).length > 0 && (
            <span className="de-deuda-badge">
              {deudoresData.filter((d) => !d.pagado).length} deuda(s) pendiente(s)
            </span>
          )}
        </div>

        {/* ── Tabla ── */}
        <div className="de-table-panel">
          <div className="de-table-wrap">
            <table className="de-table">
              <thead>
                <tr>
                  <th className="de-th de-th--check">
                    <input
                      className="de-checkbox"
                      type="checkbox"
                      title="Seleccionar todos"
                      checked={
                        datosFiltrados.length > 0 &&
                        datosFiltrados.every((d) => seleccionados.includes(d.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados(datosFiltrados.map((d) => d.id));
                        } else {
                          setSeleccionados([]);
                        }
                      }}
                    />
                  </th>
                  <th className="de-th de-th--idx">#</th>
                  <th className="de-th">NOMBRE</th>
                  <th className="de-th">CELULAR</th>
                  <th className="de-th">DEUDA</th>
                  <th className="de-th">FECHA</th>
                  <th className="de-th de-th--center">AUTORIZADO</th>
                  <th className="de-th de-th--center">PAGADO</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map((deudor, idx) => {
                  const estaSeleccionado = seleccionados.includes(deudor.id);
                  const estaEditando = deudorEditando === deudor.id;
                  return (
                    <tr
                      key={deudor.id}
                      className={[
                        "de-tr",
                        estaSeleccionado ? "de-tr--sel" : "",
                        estaEditando ? "de-tr--editando" : "",
                        deudor.pagado && !estaEditando ? "de-tr--pagado" : "",
                        !edicion ? "de-tr--clickable" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={(e) => {
                        if (edicion) return;
                        if (["INPUT", "BUTTON"].includes(e.target.tagName))
                          return;
                        setSeleccionados((prev) =>
                          estaSeleccionado
                            ? prev.filter((id) => id !== deudor.id)
                            : [...prev, deudor.id],
                        );
                      }}
                    >
                      {/* Checkbox */}
                      <td className="de-td de-td--check">
                        <input
                          className="de-checkbox"
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSeleccionados([...seleccionados, deudor.id]);
                            } else {
                              setSeleccionados(
                                seleccionados.filter((id) => id !== deudor.id),
                              );
                            }
                          }}
                        />
                      </td>

                      {/* Índice */}
                      <td className="de-td de-td--idx">{idx + 1}</td>

                      {/* Nombre */}
                      <td className="de-td de-td--nombre">
                        {estaEditando ? (
                          <input
                            className="de-input-edit"
                            type="text"
                            name="nombre"
                            value={datosEditados.nombre}
                            onChange={handleChangeEdicion}
                            autoFocus
                          />
                        ) : (
                          <span className="de-nombre-txt">
                            {!deudor.pagado && (
                              <span className="de-deuda-dot" title="Deuda pendiente" />
                            )}
                            {deudor.nombre}
                          </span>
                        )}
                      </td>

                      {/* Celular */}
                      <td className="de-td de-td--celular">
                        {estaEditando ? (
                          <input
                            className="de-input-edit"
                            type="tel"
                            name="celular"
                            value={datosEditados.celular}
                            onChange={handleChangeEdicion}
                          />
                        ) : (
                          deudor.celular
                        )}
                      </td>

                      {/* Deuda */}
                      <td className="de-td">
                        {estaEditando ? (
                          <input
                            className="de-input-edit de-input-edit--sm"
                            type="number"
                            name="deuda"
                            step="0.01"
                            value={datosEditados.deuda}
                            onChange={handleChangeEdicion}
                          />
                        ) : (
                          <span className="de-deuda-txt">
                            ${parseFloat(deudor.deuda).toLocaleString("es-CO")}
                          </span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="de-td de-td--fecha">
                        {formatFecha(deudor.fecha)}
                      </td>

                      {/* Autorizado */}
                      <td className="de-td de-td--center">
                        {estaEditando ? (
                          <input
                            className="de-checkbox de-checkbox--edit"
                            type="checkbox"
                            name="autorizacion"
                            checked={datosEditados.autorizacion}
                            onChange={handleChangeEdicion}
                          />
                        ) : (
                          <span
                            className={`de-badge ${
                              deudor.autorizacion
                                ? "de-badge--si"
                                : "de-badge--no"
                            }`}
                          >
                            {deudor.autorizacion ? "SÍ" : "NO"}
                          </span>
                        )}
                      </td>

                      {/* Pagado */}
                      <td className="de-td de-td--center">
                        {estaEditando ? (
                          <input
                            className="de-checkbox de-checkbox--edit"
                            type="checkbox"
                            name="pagado"
                            checked={datosEditados.pagado}
                            onChange={handleChangeEdicion}
                          />
                        ) : (
                          <span
                            className={`de-badge ${
                              deudor.pagado ? "de-badge--pagado" : "de-badge--pendiente"
                            }`}
                          >
                            {deudor.pagado ? "PAGADO" : "PENDIENTE"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {datosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} className="de-td--empty">
                      SIN REGISTROS
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Modal agregar deudor ── */}
        {showModalAgregar && (
          <div className="de-overlay" onClick={cerrarModalAgregar}>
            <div
              className="de-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="de-corner de-corner--tl"></span>
              <span className="de-corner de-corner--br"></span>

              <div className="de-modal-header">
                <p className="de-modal-title">REGISTRAR NUEVO DEUDOR</p>
                <button className="de-close-btn" onClick={cerrarModalAgregar}>
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
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="de-form" onSubmit={handleSubmit}>
                <div className="de-field">
                  <label className="de-label">Nombre completo</label>
                  <input
                    className="de-input"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    name="nombre"
                    value={datosForm.nombre}
                    onChange={handleChange}
                  />
                </div>

                <div className="de-field">
                  <label className="de-label">Celular</label>
                  <input
                    className="de-input"
                    type="tel"
                    placeholder="Número de celular"
                    name="celular"
                    value={datosForm.celular}
                    onChange={handleChange}
                  />
                </div>

                <div className="de-field">
                  <label className="de-label">Deuda ($)</label>
                  <input
                    className="de-input"
                    type="number"
                    step="0.01"
                    placeholder="Monto de la deuda"
                    name="deuda"
                    value={datosForm.deuda}
                    onChange={handleChange}
                  />
                </div>

                <div className="de-field de-field--toggle">
                  <span className="de-label">Autorizado</span>
                  <label className="de-toggle">
                    <input
                      type="checkbox"
                      name="autorizacion"
                      checked={datosForm.autorizacion}
                      onChange={handleChange}
                      className="de-toggle-input"
                    />
                    <span className="de-toggle-track">
                      <span className="de-toggle-thumb"></span>
                    </span>
                    <span className="de-toggle-text">
                      {datosForm.autorizacion ? "SÍ" : "NO"}
                    </span>
                  </label>
                </div>

                {error && <p className="de-error">{error}</p>}

                <div className="de-modal-footer">
                  <button
                    type="button"
                    className="de-btn de-btn--ghost"
                    onClick={cerrarModalAgregar}
                  >
                    CANCELAR
                  </button>
                  <button type="submit" className="de-btn de-btn--verde">
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
                      <path d="M5 12l5 5l10 -10" />
                    </svg>
                    GUARDAR
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal eliminar ── */}
        {showModalEliminar && (
          <div className="de-overlay" onClick={cerrarModalEliminar}>
            <div
              className="de-modal de-modal--danger"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="de-corner de-corner--tl de-corner--rojo"></span>
              <span className="de-corner de-corner--br de-corner--rojo"></span>

              <div className="de-modal-header de-modal-header--danger">
                <div className="de-modal-danger-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff4d4f"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p className="de-modal-title de-modal-title--danger">
                  CONFIRMAR ELIMINACIÓN
                </p>
              </div>

              <div className="de-modal-body">
                <p className="de-confirm-text">
                  ¿Está seguro que desea eliminar el/los deudores seleccionados?
                  Esta acción no se puede deshacer.
                </p>
                <p className="de-confirm-count">
                  <span>{seleccionados.length}</span> deudor(es) serán
                  eliminados permanentemente.
                </p>
              </div>

              <div className="de-modal-footer">
                <button
                  className="de-btn de-btn--ghost"
                  onClick={cerrarModalEliminar}
                >
                  CANCELAR
                </button>
                <button
                  className="de-btn de-btn--rojo"
                  onClick={eliminarDeudoresSelec}
                >
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default Deudores;
