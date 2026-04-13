import React from "react";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Categorias.css";
import {
  consultaCategoria,
  eliminarCategoria,
  crearCategoria,
  editarCategoria,
} from "../js/categoria";

const Categorias = () => {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriasData, setCategoriasData] = useState([]);
  const [eliminacion, setEliminacion] = useState(false);

  const datosFiltrados = categoriasData.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const obtenerCategoria = async () => {
    try {
      const categoriaD = await consultaCategoria();
      if (Array.isArray(categoriaD)) {
        setCategoriasData(categoriaD);
      } else {
        console.error("Respuesta inesperada:", categoriaD);
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerCategoria();
  }, []);

  const [datosForm, setdatosForm] = useState({
    id: "",
    nombre: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombre } = datosForm;

    if (!nombre) {
      setError("Por favor complete todos los campos.");
      return;
    }

    const nuevaCategoria = {
      nombre: nombre,
    };

    try {
      const response = await crearCategoria(nuevaCategoria);
      if (response.status === 201) {
        toast.success("¡Categoria guardado exitosamente!");
        obtenerCategoria();
      }
    } catch (error) {
      console.error("Excepcion al crear la categoria", error);
      toast.error("Error al crear la categoría");
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
    const Seleccionados = categoriasData.filter((c) =>
      seleccionados.includes(c.id),
    );
    if (Seleccionados.length === 0) {
      toast.warning("No hay ninguna categoria seleccionada");
      return;
    } else {
      setShowModalEliminar(true);
    }
  };

  const eliminarCategoriaSelec = async () => {
    try {
      setEliminacion(true);
      const data = { ids: seleccionados };
      const response = await eliminarCategoria(data);
      if (response.status === 204) {
        toast.success("¡Categorias eliminadas exitosamente!");
        obtenerCategoria();
      }
    } catch (error) {
      console.error("Excepcion al eliminar las categorias", error);
      toast.error("Error al eliminar las categorias");
    }

    cerrarModalEliminar();
    setEliminacion(false);
  };

  const cerrarModalEliminar = () => {
    setShowModalEliminar(false);
  };

  const [edicion, setEdicion] = useState(false);
  const [categoriaEditando, setcategoriaEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const verEdicion = () => {
    const Seleccionados = categoriasData.filter((p) =>
      seleccionados.includes(p.id),
    );

    if (Seleccionados.length === 0) {
      toast.warning("No hay ninguna categoria seleccionada");
      return;
    }

    if (Seleccionados.length > 1) {
      toast.warning("Selecciona una sola categoria");
      return;
    }

    const categoriaSeleccionada = Seleccionados[0];

    setEdicion(true);
    Editar(categoriaSeleccionada);
  };

  const ocultarEdicion = () => {
    setEdicion(false);
  };

  const Editar = (categoria) => {
    setcategoriaEditando(categoria.id);
    setDatosEditados({ ...categoria });
  };

  const CancelarEdicion = () => {
    setcategoriaEditando(null);
    setDatosEditados({});
    ocultarEdicion();
    toast.info("Cancelado con exito!");
  };

  const GuardarEdicion = async () => {
    const categoriaE = {
      nombre: datosEditados.nombre,
    };

    try {
      const response = await editarCategoria(categoriaE, categoriaEditando);
      if (response.status === 200) {
        toast.success("¡Categoria actualizada exitosamente!");
        obtenerCategoria();
      }
    } catch (error) {
      console.error("Excepcion al actualizar la categoria", error);
      toast.error("Error al actualizar la categoria");
    }

    setcategoriaEditando(null);
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
      <div className="ca-loading-overlay">
        <div className="ca-loading-inner">
          <div className="ca-loader" />
          <span className="ca-loading-text">Cargando categorías...</span>
        </div>
      </div>
    );
  }

  const allIds = datosFiltrados.map((c) => c.id);
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
    <>
      <section className="ca-page">
        {/* Header */}
        <div className="ca-header">
          <div className="ca-header-accent" />
          <div className="ca-header-content">
            <h1 className="ca-title">CATEGORÍAS</h1>
            <p className="ca-subtitle">
              Clasificación y organización de productos
            </p>
          </div>
          <div className="ca-header-badge">CATEGORÍAS</div>
        </div>

        {/* Toolbar */}
        <div className="ca-toolbar">
          <div className="ca-toolbar-left">
            <div className="ca-search-wrap">
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
                className="ca-search-input"
                placeholder="Buscar categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="ca-toolbar-right">
            {!edicion ? (
              <>
                <button
                  className="ca-btn ca-btn--add"
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
                <button className="ca-btn ca-btn--edit" onClick={verEdicion}>
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
                  className="ca-btn ca-btn--del"
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
                <div className="ca-edit-active-badge">
                  <span className="ca-edit-dot" />
                  MODO EDICIÓN
                </div>
                <button
                  className="ca-btn ca-btn--save"
                  onClick={GuardarEdicion}
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
                    <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
                    <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M14 4l0 4l-6 0l0 -4" />
                  </svg>
                  GUARDAR
                </button>
                <button
                  className="ca-btn ca-btn--cancel"
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
        <div className="ca-info-bar">
          <span className="ca-info-item">
            <span className="ca-info-label">MOSTRANDO</span>
            <span className="ca-info-value">{datosFiltrados.length}</span>
          </span>
          {seleccionados.length > 0 && (
            <span className="ca-info-item ca-info-item--sel">
              <span className="ca-info-label">SELECCIONADAS</span>
              <span className="ca-info-value">{seleccionados.length}</span>
            </span>
          )}
          <span className="ca-info-item ca-info-item--total">
            <span className="ca-info-label">TOTAL CATEGORÍAS</span>
            <span className="ca-info-value">{categoriasData.length}</span>
          </span>
        </div>

        {/* Table Panel */}
        <div className="ca-table-panel">
          <div className="ca-table-wrap">
            <table className="ca-table">
              <thead className="ca-thead">
                <tr className="ca-tr ca-tr--header">
                  <th className="ca-th ca-th--chk">
                    <input
                      type="checkbox"
                      className="ca-checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      disabled={allIds.length === 0}
                      title="Seleccionar todo"
                    />
                  </th>
                  <th className="ca-th ca-th--idx">#</th>
                  <th className="ca-th">NOMBRE</th>
                </tr>
              </thead>
              <tbody>
                {datosFiltrados.length > 0 ? (
                  datosFiltrados.map((Categoria, index) => (
                    <tr
                      key={Categoria.id}
                      className={`ca-tr ca-tr--clickable${seleccionados.includes(Categoria.id) ? " ca-tr--sel" : ""}${categoriaEditando === Categoria.id ? " ca-tr--editando" : ""}`}
                      onClick={() => {
                        if (categoriaEditando === null) {
                          if (seleccionados.includes(Categoria.id)) {
                            setSeleccionados(
                              seleccionados.filter((id) => id !== Categoria.id),
                            );
                          } else {
                            setSeleccionados([...seleccionados, Categoria.id]);
                          }
                        }
                      }}
                    >
                      <td
                        className="ca-td ca-td--chk"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="ca-checkbox"
                          checked={seleccionados.includes(Categoria.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSeleccionados([
                                ...seleccionados,
                                Categoria.id,
                              ]);
                            } else {
                              setSeleccionados(
                                seleccionados.filter(
                                  (id) => id !== Categoria.id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="ca-td ca-td--idx">{index + 1}</td>
                      <td className="ca-td">
                        {categoriaEditando === Categoria.id ? (
                          <input
                            className="ca-input-edit"
                            type="text"
                            name="nombre"
                            value={datosEditados.nombre}
                            onChange={handleChangeEdicion}
                          />
                        ) : (
                          <span className="ca-nombre-txt">
                            {Categoria.nombre}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="ca-td ca-td--empty">
                      <div className="ca-empty-state">
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
                          <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                          <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                          <path d="M9 12h6" />
                          <path d="M9 16h6" />
                        </svg>
                        <span>No hay categorías registradas</span>
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
          <div className="ca-overlay" onClick={cerrarModalAgregar}>
            <div
              className="ca-modal ca-modal--form"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ca-modal-corner ca-modal-corner--tl" />
              <div className="ca-modal-corner ca-modal-corner--br" />
              <form className="ca-form" onSubmit={handleSubmit}>
                <h2 className="ca-modal-title">Agregar nueva categoría</h2>

                <div className="ca-form-row">
                  <label className="ca-form-label">Nombre</label>
                  <input
                    className="ca-form-input"
                    type="text"
                    placeholder="Nombre de la categoría"
                    name="nombre"
                    value={datosForm.nombre}
                    onChange={handleChange}
                  />
                </div>

                {error && <p className="ca-form-error">{error}</p>}

                <div className="ca-modal-actions">
                  <button type="submit" className="ca-btn ca-btn--add">
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="ca-btn ca-btn--cancel"
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
          <div className="ca-overlay" onClick={cerrarModalEliminar}>
            <div
              className="ca-modal ca-modal--danger"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ca-modal-corner ca-modal-corner--tl" />
              <div className="ca-modal-corner ca-modal-corner--br" />
              <div className="ca-modal-icon">
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
              <h2 className="ca-modal-title">Confirmar eliminación</h2>
              <p className="ca-modal-body">
                ¿Eliminar {seleccionados.length} categoría(s) seleccionada(s)?
                Esta acción no se puede deshacer.
              </p>
              <div className="ca-modal-actions">
                <button
                  className="ca-btn ca-btn--del"
                  onClick={eliminarCategoriaSelec}
                  disabled={eliminacion}
                >
                  Confirmar
                </button>
                <button
                  className="ca-btn ca-btn--cancel"
                  onClick={cerrarModalEliminar}
                >
                  Cancelar
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

export default Categorias;
