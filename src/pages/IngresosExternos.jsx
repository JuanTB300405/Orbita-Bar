import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/IngresosExternos.css";
import {
  consultarIngresosExternos,
  crearIngresosExternos,
  editarIngresosExternos,
  eliminarIngresosExternos,
} from "../js/ingresosExternos";

const IngresosExternos = () => {
  // Lista de ingresos externos
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ingresosData, setIngresosData] = useState([]);

  const datosFiltrados = ingresosData.filter((ingreso) =>
    (ingreso.tipoIngreso ?? "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  const obtenerIngresosExternos = async () => {
    try {
      const data = await consultarIngresosExternos();
      if (Array.isArray(data)) {
        setIngresosData(data);
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
    obtenerIngresosExternos();
  }, []);

  // Logica para verificar los cambios del formulario & guardar los datos
  const [datosForm, setdatosForm] = useState({
    tipoIngreso: "",
    ganancia: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { tipoIngreso, ganancia } = datosForm;

    if (!tipoIngreso.trim() || !ganancia) {
      setError("Por favor complete todos los campos.");
      return;
    }

    const gananciaNum = Number(ganancia);
    if (isNaN(gananciaNum) || gananciaNum <= 0) {
      setError("La ganancia debe ser un valor numerico mayor a 0.");
      return;
    }

    const nuevoIngreso = {
      tipoIngreso: tipoIngreso.trim(),
      ganancia: gananciaNum,
    };

    try {
      const response = await crearIngresosExternos(nuevoIngreso);
      if (response.status === 201) {
        toast.success("¡Ingreso externo guardado exitosamente!");
        obtenerIngresosExternos();
        setdatosForm({ tipoIngreso: "", ganancia: "" });
        setError("");
        cerrarModalAgregar();
      } else {
        toast.error("No se pudo guardar el ingreso externo");
      }
    } catch (error) {
      console.error("Excepcion al crear el ingreso externo", error);
      toast.error("Error al crear el ingreso externo");
    }
  };

  // Logica para el modal de agregar nuevo ingreso externo
  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => {
    setShowModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    setdatosForm({ tipoIngreso: "", ganancia: "" });
    setError("");
  };

  // Filas de tabla seleccionadas
  const [seleccionados, setSeleccionados] = useState([]);

  // Logica para el modal de eliminar
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    const seleccionadosFiltrados = ingresosData.filter((i) =>
      seleccionados.includes(i.id),
    );
    if (seleccionadosFiltrados.length === 0) {
      toast.warning("No hay ningun ingreso seleccionado");
      return;
    } else {
      setShowModalEliminar(true);
    }
  };

  const eliminarIngresosSelec = async () => {
    try {
      const data = { ids: seleccionados };
      const response = await eliminarIngresosExternos(data);
      if (response.status === 204) {
        toast.success("¡Ingresos externos eliminados exitosamente!");
        setSeleccionados([]);
        obtenerIngresosExternos();
      } else {
        toast.error("No se pudieron eliminar los ingresos externos");
      }
    } catch (error) {
      console.error("Excepcion al eliminar ingresos externos", error);
      toast.error("Error al eliminar los ingresos externos");
      setSeleccionados([]);
    }

    cerrarModalEliminar();
  };

  const cerrarModalEliminar = () => {
    setShowModalEliminar(false);
  };

  // Logica para la edicion de los ingresos externos
  const [edicion, setEdicion] = useState(false);
  const [ingresoEditando, setIngresoEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const verEdicion = () => {
    const seleccionadosFiltrados = ingresosData.filter((i) =>
      seleccionados.includes(i.id),
    );

    if (seleccionadosFiltrados.length === 0) {
      toast.warning("No hay ningun ingreso externo seleccionado");
      return;
    }

    if (seleccionadosFiltrados.length > 1) {
      toast.warning("Selecciona solo un ingreso externo para editar");
      return;
    }

    const ingresoSeleccionado = seleccionadosFiltrados[0];
    setEdicion(true);
    editarFila(ingresoSeleccionado);
  };

  const ocultarEdicion = () => {
    setEdicion(false);
  };

  const editarFila = (ingreso) => {
    setIngresoEditando(ingreso.id);
    setDatosEditados({ ...ingreso });
  };

  const CancelarEdicion = () => {
    setIngresoEditando(null);
    setDatosEditados({});
    ocultarEdicion();
    toast.info("Cancelado con exito!");
  };

  const GuardarEdicion = async () => {
    if (!datosEditados.tipoIngreso?.trim()) {
      toast.warning("El tipo de ingreso no puede estar vacio");
      return;
    }

    const gananciaNum = Number(datosEditados.ganancia);
    if (isNaN(gananciaNum) || gananciaNum <= 0) {
      toast.warning("La ganancia debe ser un valor numerico mayor a 0");
      return;
    }

    const ingresoEditado = {
      tipoIngreso: datosEditados.tipoIngreso.trim(),
      ganancia: gananciaNum,
    };

    try {
      const response = await editarIngresosExternos(
        ingresoEditado,
        ingresoEditando,
      );
      if (response.status === 200) {
        toast.success("¡Ingreso externo actualizado exitosamente!");
        obtenerIngresosExternos();
        setIngresoEditando(null);
        setDatosEditados({});
        ocultarEdicion();
      } else {
        toast.warning("No se pudo actualizar el ingreso externo");
      }
    } catch (error) {
      console.error("Excepcion al actualizar el ingreso externo", error);
      toast.error("Error al actualizar el ingreso externo");
    }
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;
    setDatosEditados((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatearGanancia = (valor) => {
    return Number(valor).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="ie-loading">
        <div className="ie-loader"></div>
        <p className="ie-loading-text">CARGANDO INGRESOS...</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <section className="ie-page">

        {/* ── Header ── */}
        <div className="ie-header">
          <div className="ie-header-left">
            <div className="ie-status">
              <span className="ie-status-dot"></span>
              <span className="ie-status-text">MÓDULO ACTIVO</span>
            </div>
            <h1 className="ie-title">INGRESOS EXTERNOS</h1>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="ie-toolbar">
          <div className="ie-toolbar-left">
            <div className="ie-search-wrap">
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
                className="ie-search"
                type="text"
                value={busqueda}
                placeholder="BUSCAR TIPO DE INGRESO..."
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="ie-toolbar-right">
            {edicion ? (
              <>
                <span className="ie-edit-active-badge">MODO EDICIÓN</span>
                <button className="ie-btn ie-btn--verde" onClick={GuardarEdicion}>
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
                <button className="ie-btn ie-btn--rojo" onClick={CancelarEdicion}>
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
                <button className="ie-btn ie-btn--verde" onClick={abrirModalAgregar}>
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
                <button className="ie-btn ie-btn--cyan" onClick={verEdicion}>
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
                <button className="ie-btn ie-btn--rojo" onClick={abrirModalEliminar}>
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
        <div className="ie-info-bar">
          <span className="ie-info-count">
            <span className="ie-info-num">{datosFiltrados.length}</span> de{" "}
            {ingresosData.length} ingresos
          </span>
          {seleccionados.length > 0 && (
            <span className="ie-sel-badge">
              {seleccionados.length} seleccionado(s)
            </span>
          )}
          {edicion && (
            <span className="ie-edit-badge">MODO EDICIÓN ACTIVO</span>
          )}
        </div>

        {/* ── Tabla ── */}
        <div className="ie-table-panel">
          <div className="ie-table-wrap">
            <table className="ie-table">
              <thead>
                <tr>
                  <th className="ie-th ie-th--check">
                    <input
                      className="ie-checkbox"
                      type="checkbox"
                      title="Seleccionar todos"
                      checked={
                        datosFiltrados.length > 0 &&
                        datosFiltrados.every((i) => seleccionados.includes(i.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados(datosFiltrados.map((i) => i.id));
                        } else {
                          setSeleccionados([]);
                        }
                      }}
                    />
                  </th>
                  <th className="ie-th ie-th--idx">#</th>
                  <th className="ie-th">TIPO DE INGRESO</th>
                  <th className="ie-th">GANANCIA</th>
                  <th className="ie-th">FECHA</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.map((ingreso, idx) => {
                  const estaSeleccionado = seleccionados.includes(ingreso.id);
                  const estaEditando = ingresoEditando === ingreso.id;
                  return (
                    <tr
                      key={ingreso.id}
                      className={[
                        "ie-tr",
                        estaSeleccionado ? "ie-tr--sel" : "",
                        estaEditando ? "ie-tr--editando" : "",
                        !edicion ? "ie-tr--clickable" : "",
                      ].join(" ")}
                      onClick={(e) => {
                        if (edicion) return;
                        if (["INPUT", "BUTTON"].includes(e.target.tagName)) return;
                        setSeleccionados((prev) =>
                          estaSeleccionado
                            ? prev.filter((id) => id !== ingreso.id)
                            : [...prev, ingreso.id],
                        );
                      }}
                    >
                      <td className="ie-td ie-td--check">
                        <input
                          className="ie-checkbox"
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSeleccionados([...seleccionados, ingreso.id]);
                            } else {
                              setSeleccionados(
                                seleccionados.filter((id) => id !== ingreso.id),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="ie-td ie-td--idx">{idx + 1}</td>
                      <td className="ie-td ie-td--nombre">
                        {estaEditando ? (
                          <input
                            className="ie-input-edit"
                            type="text"
                            name="tipoIngreso"
                            value={datosEditados.tipoIngreso}
                            onChange={handleChangeEdicion}
                            autoFocus
                          />
                        ) : (
                          ingreso.tipoIngreso
                        )}
                      </td>
                      <td className="ie-td">
                        {estaEditando ? (
                          <input
                            className="ie-input-edit ie-input-edit--sm"
                            type="number"
                            name="ganancia"
                            value={datosEditados.ganancia}
                            onChange={handleChangeEdicion}
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className="ie-precio-txt">
                            {formatearGanancia(ingreso.ganancia)}
                          </span>
                        )}
                      </td>
                      <td className="ie-td ie-td--fecha">
                        {formatearFecha(ingreso.fecha)}
                      </td>
                    </tr>
                  );
                })}
                {datosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="ie-td--empty">
                      SIN REGISTROS
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Modal agregar ingreso externo ── */}
        {showModalAgregar && (
          <div className="ie-overlay" onClick={cerrarModalAgregar}>
            <div
              className="ie-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="ie-corner ie-corner--tl"></span>
              <span className="ie-corner ie-corner--br"></span>

              <div className="ie-modal-header">
                <p className="ie-modal-title">NUEVO INGRESO EXTERNO</p>
                <button className="ie-close-btn" onClick={cerrarModalAgregar}>
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

              <form className="ie-form" onSubmit={handleSubmit}>
                <div className="ie-field">
                  <label className="ie-label">Tipo de Ingreso</label>
                  <input
                    className="ie-input"
                    type="text"
                    placeholder="Ej: Propina, Descorche..."
                    name="tipoIngreso"
                    value={datosForm.tipoIngreso}
                    onChange={handleChange}
                  />
                </div>
                <div className="ie-field">
                  <label className="ie-label">Ganancia</label>
                  <input
                    className="ie-input"
                    type="number"
                    placeholder="Valor en pesos"
                    name="ganancia"
                    value={datosForm.ganancia}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                {error && <p className="ie-error">{error}</p>}
                <div className="ie-modal-footer">
                  <button
                    type="button"
                    className="ie-btn ie-btn--ghost"
                    onClick={cerrarModalAgregar}
                  >
                    CANCELAR
                  </button>
                  <button type="submit" className="ie-btn ie-btn--verde">
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

        {/* ── Modal eliminar ingresos externos ── */}
        {showModalEliminar && (
          <div className="ie-overlay" onClick={cerrarModalEliminar}>
            <div
              className="ie-modal ie-modal--danger"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="ie-corner ie-corner--tl ie-corner--rojo"></span>
              <span className="ie-corner ie-corner--br ie-corner--rojo"></span>

              <div className="ie-modal-header ie-modal-header--danger">
                <div className="ie-modal-danger-icon">
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
                <p className="ie-modal-title ie-modal-title--danger">
                  CONFIRMAR ELIMINACIÓN
                </p>
              </div>

              <div className="ie-modal-body">
                <p className="ie-confirm-text">
                  ¿Está completamente seguro que desea eliminar el/los ingresos
                  externos seleccionados?
                </p>
                <p className="ie-confirm-count">
                  <span>{seleccionados.length}</span> registro(s) serán
                  eliminados permanentemente.
                </p>
              </div>

              <div className="ie-modal-footer">
                <button
                  className="ie-btn ie-btn--ghost"
                  onClick={cerrarModalEliminar}
                >
                  CANCELAR
                </button>
                <button
                  className="ie-btn ie-btn--rojo"
                  onClick={eliminarIngresosSelec}
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

export default IngresosExternos;
