import React from "react";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/proveedores.css";
import { consultaProveedores, crearProveedores } from "../js/proveedores";

const CierreCaja = () => {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [proveedoresData, setProveedoresData] = useState([]);
  const [eliminacion, setEliminacion] = useState(false);

  const datosFiltrados = proveedoresData.filter((provedor) =>
    provedor.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const obtenerProveedores = async () => {
    try {
      const provedoresD = await consultaProveedores();
      if (Array.isArray(provedoresD)) {
        setProveedoresData(provedoresD);
      } else {
        console.error("Respuesta inesperada:", provedoresD);
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const [datosForm, setdatosForm] = useState({
    id: "",
    nombre: "",
    telefono: "",
    email: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombre, telefono, email } = datosForm;

    if (!nombre || !telefono || !email) {
      setError("Por favor complete todos los campos.");
      return;
    }

    const nuevoProveedor = {
      nombre: nombre,
      telefono: telefono,
      email: email,
    };

    try {
      const response = await crearProveedores(nuevoProveedor);
      if (response.status === 201) {
        toast.success("¡Proveedor guardado exitosamente!");
        obtenerProveedores();
      }
    } catch (error) {
      console.error("Excepcion al crear el proveedor", error);
      toast.error("Error al crear el proveedor");
    }

    setdatosForm({ nombre: "", telefono: "", email: "" });
    setError("");
    cerrarModalAgregar();
  };

  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => {
    setShowModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    setdatosForm({ nombre: "", telefono: "", email: "" });
    setError("");
  };

  const [seleccionados, setSeleccionados] = useState([]);

  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    const Seleccionados = proveedoresData.filter((p) =>
      seleccionados.includes(p.id),
    );
    if (Seleccionados.length === 0) {
      toast.warning("No hay ningún proveedor seleccionado");
      return;
    } else {
      setShowModalEliminar(true);
    }
  };

  const cerrarModalEliminar = () => {
    setShowModalEliminar(false);
  };

  const [edicion, setEdicion] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const verEdicion = () => {
    const Seleccionados = proveedoresData.filter((p) =>
      seleccionados.includes(p.id),
    );

    if (Seleccionados.length === 0) {
      toast.warning("No hay ningun proveedor seleccionado");
      return;
    }

    if (Seleccionados.length > 1) {
      toast.warning("Selecciona solo un proveedor para editar");
      return;
    }

    const proveedorSeleccionado = Seleccionados[0];

    setEdicion(true);
    Editar(proveedorSeleccionado);
  };

  const ocultarEdicion = () => {
    setEdicion(false);
  };

  const Editar = (proveedor) => {
    setProveedorEditando(proveedor.id);
    setDatosEditados({ ...proveedor });
  };

  const CancelarEdicion = () => {
    setProveedorEditando(null);
    setDatosEditados({});
    ocultarEdicion();
    toast.info("Cancelado con exito!");
  };

  const GuardarEdicion = async () => {
    const proveedorE = {
      nombre: datosEditados.nombre,
      telefono: datosEditados.telefono,
      email: datosEditados.email,
    };

    try {
      const response = await editarProveedor(proveedorE, proveedorEditando);
      if (response.status === 200) {
        toast.success("¡Proveedor actualizado exitosamente!");
        obtenerProveedores();
      } else {
        toast.warning("No se pudo actualizar el proveedor");
      }
    } catch (error) {
      console.error("Excepcion al actualizar el proveedor", error);
      toast.error("Error al actualizar el proveedor");
    }

    setProveedorEditando(null);
    setDatosEditados({});
    ocultarEdicion();
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;
    setDatosEditados((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
          <h1 className="pv-title">Registro Cierre Caja</h1>
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
              placeholder="Buscar proveedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <div className="pv-toolbar-right">
          {!edicion ? (
            <>
              <button
                className="pv-btn pv-btn--add"
                onClick={abrirModalAgregar}
              >
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
                  <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
                  <path d="M15 12h-6" />
                  <path d="M12 9v6" />
                </svg>
                AGREGAR
              </button>
              <button className="pv-btn pv-btn--edit" onClick={verEdicion}>
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
                  <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                  <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                  <path d="M16 5l3 3" />
                </svg>
                EDITAR
              </button>
              <button
                className="pv-btn pv-btn--del"
                onClick={abrirModalEliminar}
              >
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
                  <path d="M4 7l16 0" />
                  <path d="M10 11l0 6" />
                  <path d="M14 11l0 6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
                ELIMINAR
              </button>
            </>
          ) : (
            <>
              <div className="pv-edit-active-badge">
                <span className="pv-edit-dot" />
                MODO EDICIÓN
              </div>
              <button className="pv-btn pv-btn--save" onClick={GuardarEdicion}>
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
                  <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
                  <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M14 4l0 4l-6 0l0 -4" />
                </svg>
                GUARDAR
              </button>
              <button
                className="pv-btn pv-btn--cancel"
                onClick={CancelarEdicion}
              >
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
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
                CANCELAR
              </button>
            </>
          )}
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
          <span className="pv-info-label">TOTAL PROVEEDORES</span>
          <span className="pv-info-value">{proveedoresData.length}</span>
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
                <th className="pv-th">NOMBRE</th>
                <th className="pv-th">TELÉFONO</th>
                <th className="pv-th">EMAIL</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length > 0 ? (
                datosFiltrados.map((proveedor, index) => (
                  <tr
                    key={proveedor.id}
                    className={`pv-tr pv-tr--clickable${seleccionados.includes(proveedor.id) ? " pv-tr--sel" : ""}${proveedorEditando === proveedor.id ? " pv-tr--editando" : ""}`}
                    onClick={() => {
                      if (proveedorEditando === null) {
                        if (seleccionados.includes(proveedor.id)) {
                          setSeleccionados(
                            seleccionados.filter((id) => id !== proveedor.id),
                          );
                        } else {
                          setSeleccionados([...seleccionados, proveedor.id]);
                        }
                      }
                    }}
                  >
                    <td
                      className="pv-td pv-td--chk"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="pv-checkbox"
                        checked={seleccionados.includes(proveedor.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSeleccionados([...seleccionados, proveedor.id]);
                          } else {
                            setSeleccionados(
                              seleccionados.filter((id) => id !== proveedor.id),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="pv-td pv-td--idx">{index + 1}</td>
                    <td className="pv-td">
                      {proveedorEditando === proveedor.id ? (
                        <input
                          className="pv-input-edit"
                          type="text"
                          name="nombre"
                          value={datosEditados.nombre}
                          onChange={handleChangeEdicion}
                        />
                      ) : (
                        <span className="pv-nombre-txt">
                          {proveedor.nombre}
                        </span>
                      )}
                    </td>
                    <td className="pv-td">
                      {proveedorEditando === proveedor.id ? (
                        <input
                          className="pv-input-edit pv-input-edit--sm"
                          type="tel"
                          name="telefono"
                          value={datosEditados.telefono}
                          onChange={handleChangeEdicion}
                        />
                      ) : (
                        <span className="pv-tel-txt">{proveedor.telefono}</span>
                      )}
                    </td>
                    <td className="pv-td">
                      {proveedorEditando === proveedor.id ? (
                        <input
                          className="pv-input-edit"
                          type="email"
                          name="email"
                          value={datosEditados.email}
                          onChange={handleChangeEdicion}
                        />
                      ) : (
                        <span className="pv-email-txt">{proveedor.email}</span>
                      )}
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

      {/* Add Modal */}
      {showModalAgregar && (
        <div className="pv-overlay" onClick={cerrarModalAgregar}>
          <div
            className="pv-modal pv-modal--form"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pv-modal-corner pv-modal-corner--tl" />
            <div className="pv-modal-corner pv-modal-corner--br" />
            <form className="pv-form" onSubmit={handleSubmit}>
              <h2 className="pv-modal-title">Agregar nuevo proveedor</h2>

              <div className="pv-form-row">
                <label className="pv-form-label">Nombre</label>
                <input
                  className="pv-form-input"
                  type="text"
                  placeholder="Nombre del proveedor"
                  name="nombre"
                  value={datosForm.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="pv-form-row">
                <label className="pv-form-label">Teléfono</label>
                <input
                  className="pv-form-input"
                  type="tel"
                  placeholder="Número de contacto"
                  name="telefono"
                  value={datosForm.telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="pv-form-row">
                <label className="pv-form-label">Email</label>
                <input
                  className="pv-form-input"
                  type="email"
                  placeholder="Email del proveedor"
                  name="email"
                  value={datosForm.email}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="pv-form-error">{error}</p>}

              <div className="pv-modal-actions">
                <button type="submit" className="pv-btn pv-btn--add">
                  Guardar
                </button>
                <button
                  type="button"
                  className="pv-btn pv-btn--cancel"
                  onClick={cerrarModalAgregar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showModalEliminar && (
        <div className="pv-overlay" onClick={cerrarModalEliminar}>
          <div
            className="pv-modal pv-modal--danger"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pv-modal-corner pv-modal-corner--tl" />
            <div className="pv-modal-corner pv-modal-corner--br" />
            <div className="pv-modal-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 9v4" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.871l-8.106 -13.534a1.914 1.914 0 0 0 -3.274 0z" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h2 className="pv-modal-title">Confirmar eliminación</h2>
            <p className="pv-modal-body">
              ¿Eliminar {seleccionados.length} proveedor(es) seleccionado(s)?
              Esta acción no se puede deshacer.
            </p>
            <div className="pv-modal-actions">
              <button
                className="pv-btn pv-btn--del"
                onClick={eliminarProveeSelec}
                disabled={eliminacion}
              >
                Confirmar
              </button>
              <button
                className="pv-btn pv-btn--cancel"
                onClick={cerrarModalEliminar}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </section>
  );
};

export default CierreCaja;
