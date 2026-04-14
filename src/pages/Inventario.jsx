import "../styles/Inventario.css";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { consultaInventario } from "../js/inventario";
import { consultaProveedores } from "../js/proveedores";
import { consultaCategoria } from "../js/categoria";
import { crearProductos, eliminarProductos, editarProductos } from "../js/inventario";

const Inventario = () => {
  // ── Estado principal ─────────────────────────────
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [productosData, setProductosData] = useState([]);
  const [proveedoresData, setProveedoresData] = useState([]);
  const [categoriaData, setCategoriaData] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [dropdownCatAbierto, setDropdownCatAbierto] = useState(false);
  const dropdownCatRef = useRef(null);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });

  // Productos con stock bajo: cantidad_actual <= topeMin (calculado localmente)
  const productosStockBajo = productosData.filter(
    (p) => p.topeMin > 0 && p.cantidad_actual <= p.topeMin
  );
  const idsStockBajo = new Set(productosStockBajo.map((p) => p.id));

  // Datos filtrados
  const datosFiltrados = productosData.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      p.categoria.nombre
        .toLowerCase()
        .includes(categoriaSeleccionada.toLowerCase())
  );

  // Datos ordenados
  const datosOrdenados = [...datosFiltrados].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let va, vb;
    switch (sortConfig.key) {
      case "nombre":    va = a.nombre;             vb = b.nombre;             break;
      case "categoria": va = a.categoria.nombre;   vb = b.categoria.nombre;   break;
      case "precio":    va = Number(a.precio);      vb = Number(b.precio);     break;
      case "proveedor": va = a.proveedor.nombre;   vb = b.proveedor.nombre;   break;
      case "cantidad":  va = a.cantidad_actual;    vb = b.cantidad_actual;    break;
      default: return 0;
    }
    if (va < vb) return sortConfig.dir === "asc" ? -1 : 1;
    if (va > vb) return sortConfig.dir === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  // Header sortable
  const SortTh = ({ label, sortKey, center }) => {
    const activo = sortConfig.key === sortKey;
    return (
      <th
        className={`inv-th inv-th--sort ${activo ? "inv-th--sorted" : ""} ${center ? "inv-th--center" : ""}`}
        onClick={() => toggleSort(sortKey)}
        title={`Ordenar por ${label.toLowerCase()}`}
      >
        <span className="inv-th-inner">
          {label}
          <span className="inv-sort-icon">
            {activo ? (
              sortConfig.dir === "asc" ? (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
                  <path d="M4.5 1.5 L8 7 L1 7 Z" />
                </svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
                  <path d="M4.5 7.5 L1 2 L8 2 Z" />
                </svg>
              )
            ) : (
              <svg width="9" height="11" viewBox="0 0 9 11" fill="currentColor" opacity="0.35">
                <path d="M4.5 0.5 L7.5 4 L1.5 4 Z" />
                <path d="M4.5 10.5 L1.5 7 L7.5 7 Z" />
              </svg>
            )}
          </span>
        </span>
      </th>
    );
  };

  // ── Fetch ────────────────────────────────────────
  const obtenerInventario = async () => {
    try {
      const data = await consultaInventario();
      if (Array.isArray(data)) setProductosData(data);
      else console.error("Respuesta inesperada:", data);
    } catch (er) {
      console.error("Error en la consulta:", er);
    } finally {
      setCargando(false);
    }
  };


  const obtenerProveedores = async () => {
    try {
      const data = await consultaProveedores();
      if (Array.isArray(data)) setProveedoresData(data);
    } catch (er) {
      console.error("Error consultando proveedores:", er);
    }
  };

  const obtenerCategoria = async () => {
    try {
      const data = await consultaCategoria();
      if (Array.isArray(data)) setCategoriaData(data);
    } catch (er) {
      console.error("Error consultando categorías:", er);
    }
  };

  useEffect(() => {
    obtenerInventario();
    obtenerProveedores();
    obtenerCategoria();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownCatRef.current && !dropdownCatRef.current.contains(e.target)) {
        setDropdownCatAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Formulario nuevo producto ─────────────────────
  const [datosForm, setdatosForm] = useState({
    nombre: "",
    precio: "",
    tope: "",
    proveedor: "",
    categoria: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, precio, tope, proveedor, categoria } = datosForm;

    if (!nombre || !precio || !tope) {
      setError("Por favor complete todos los campos.");
      return;
    }
    if (!proveedor) {
      setError("Debe seleccionar un proveedor.");
      return;
    }
    if (!categoria) {
      setError("Debe seleccionar una categoría.");
      return;
    }

    const data = {
      nombre,
      precio,
      cantidad_actual: 0,
      cantidad_inicial: 0,
      foto: null,
      topeMin: tope,
      categoriaid: categoria,
      proveedorid: proveedor,
    };

    try {
      const response = await crearProductos(data);
      if (response.status === 201) {
        toast.success("¡Producto guardado exitosamente!");
        obtenerInventario();
      }
    } catch (er) {
      console.error("Excepción al crear el producto", er);
      toast.error("Error al crear el producto");
    }

    setdatosForm({ nombre: "", precio: "", tope: "", proveedor: "", categoria: "" });
    setError("");
    cerrarModalAgregar();
  };

  // ── Modal agregar ─────────────────────────────────
  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => setShowModalAgregar(true);

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    setdatosForm({ nombre: "", precio: "", tope: "", proveedor: "", categoria: "" });
    setError("");
  };

  // ── Selección de filas ────────────────────────────
  const [seleccionados, setSeleccionados] = useState([]);

  const toggleSeleccion = (id, checked) => {
    setSeleccionados((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  // ── Modal eliminar ────────────────────────────────
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    if (seleccionados.length === 0) {
      toast.warning("Selecciona al menos un producto");
      return;
    }
    setShowModalEliminar(true);
  };

  const eliminarProdSelec = async () => {
    try {
      const response = await eliminarProductos({ ids: seleccionados });
      if (response.status === 204) {
        toast.success("¡Productos eliminados exitosamente!");
        setSeleccionados([]);
        obtenerInventario();
      }
    } catch (er) {
      console.error("Excepción al eliminar", er);
      toast.error("Error al eliminar el producto");
    }
    setShowModalEliminar(false);
  };

  // ── Edición inline ────────────────────────────────
  const [edicion, setEdicion] = useState(false);
  const [ProdEditadoID, setProdEditadoID] = useState(null);
  const [ProdEditado, setProdEditado] = useState({});

  const verEdicion = () => {
    const selec = productosData.filter((p) => seleccionados.includes(p.id));
    if (selec.length === 0) {
      toast.warning("Selecciona un producto para editar");
      return;
    }
    if (selec.length > 1) {
      toast.warning("Selecciona solo un producto para editar");
      return;
    }
    setEdicion(true);
    setProdEditadoID(selec[0].id);
    setProdEditado({ ...selec[0] });
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;
    if (name === "categoria") {
      const cat = categoriaData.find((c) => c.id === parseInt(value));
      setProdEditado((prev) => ({ ...prev, categoria: cat }));
    } else if (name === "proveedor") {
      const prov = proveedoresData.find((p) => p.id === parseInt(value));
      setProdEditado((prev) => ({ ...prev, proveedor: prov }));
    } else {
      setProdEditado((prev) => ({ ...prev, [name]: value }));
    }
  };

  const GuardarEdicion = async () => {
    const productoFormateado = {
      nombre: ProdEditado.nombre,
      precio: ProdEditado.precio,
      cantidad_actual: ProdEditado.cantidad_actual,
      cantidad_inicial: ProdEditado.cantidad_inicial,
      foto: null,
      topeMin: ProdEditado.topeMin,
      categoriaid: ProdEditado.categoria.id,
      proveedorid: ProdEditado.proveedor.id,
    };
    try {
      const response = await editarProductos(productoFormateado, ProdEditadoID);
      if (response.status === 200) {
        toast.success("¡Producto actualizado exitosamente!");
        obtenerInventario();
      }
    } catch (er) {
      console.error("Excepción al actualizar", er);
      toast.error("Error al actualizar el producto");
    }
    setProdEditadoID(null);
    setProdEditado({});
    setEdicion(false);
  };

  const CancelarEdicion = () => {
    setProdEditadoID(null);
    setProdEditado({});
    setEdicion(false);
    toast.info("Edición cancelada");
  };

  // ── Panel de alertas de stock ─────────────────────
  const [noti, setNoti] = useState(false);

  // ── Loading ───────────────────────────────────────
  if (cargando) {
    return (
      <div className="inv-loading">
        <div className="inv-loader" />
        <p className="inv-loading-text">CARGANDO INVENTARIO...</p>
      </div>
    );
  }

  return (
    <>
      <div className="inv-page">

        {/* ── Header ── */}
        <div className="inv-header">
          <div className="inv-header-left">
            <div className="inv-status">
              <span className="inv-status-dot" />
              <span className="inv-status-text">SISTEMA ACTIVO</span>
            </div>
            <h2 className="inv-title">Sistema de Inventario</h2>
          </div>
          <div className="inv-header-right">
            <button className="inv-btn-ghost" onClick={obtenerInventario}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              ACTUALIZAR
            </button>
            {productosStockBajo.length > 0 && (
              <button className="inv-btn-alerta" onClick={() => setNoti(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                ALERTAS DE STOCK
                <span className="inv-alerta-badge">{productosStockBajo.length}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="inv-toolbar">
          <div className="inv-toolbar-left">
            {/* Buscador */}
            <div className="inv-search-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8abb3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="inv-search"
                type="text"
                placeholder="BUSCAR PRODUCTO..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Filtro categoría */}
            <div className="inv-cat-wrap" ref={dropdownCatRef}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8abb3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <div
                className={`inv-cat-trigger${dropdownCatAbierto ? " inv-cat-trigger--open" : ""}`}
                onClick={() => setDropdownCatAbierto((prev) => !prev)}
              >
                <span>{categoriaSeleccionada || "TODAS LAS CATEGORÍAS"}</span>
                <svg className="inv-cat-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2 3.5 5 6.5 8 3.5" />
                </svg>
              </div>
              {dropdownCatAbierto && (
                <div className="inv-cat-dropdown">
                  <div
                    className={`inv-cat-option${categoriaSeleccionada === "" ? " inv-cat-option--active" : ""}`}
                    onMouseDown={() => { setCategoriaSeleccionada(""); setDropdownCatAbierto(false); }}
                  >
                    TODAS LAS CATEGORÍAS
                  </div>
                  {[...categoriaData]
                    .sort((a, b) => a.nombre.localeCompare(b.nombre))
                    .map((cat) => (
                      <div
                        key={cat.id}
                        className={`inv-cat-option${categoriaSeleccionada === cat.nombre ? " inv-cat-option--active" : ""}`}
                        onMouseDown={() => { setCategoriaSeleccionada(cat.nombre); setDropdownCatAbierto(false); }}
                      >
                        {cat.nombre}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="inv-toolbar-right">
            <button className="inv-btn-verde" onClick={abrirModalAgregar}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              AGREGAR
            </button>
            <button className="inv-btn-cyan" onClick={verEdicion}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              EDITAR
            </button>
            <button className="inv-btn-rojo" onClick={abrirModalEliminar}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              ELIMINAR
            </button>
          </div>
        </div>

        {/* ── Info bar ── */}
        <div className="inv-info-bar">
          <span className="inv-info-count">
            <span className="inv-info-num">{datosFiltrados.length}</span> de {productosData.length} productos
          </span>
          {seleccionados.length > 0 && (
            <span className="inv-sel-badge">
              {seleccionados.length} seleccionado(s)
            </span>
          )}
          {edicion && (
            <span className="inv-edit-badge">MODO EDICIÓN ACTIVO</span>
          )}
        </div>

        {/* ── Tabla ── */}
        <div className="inv-table-panel">
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  {/* Select-all */}
                  <th className="inv-th inv-th--check">
                    <input
                      className="inv-checkbox"
                      type="checkbox"
                      title="Seleccionar todos"
                      checked={
                        datosOrdenados.length > 0 &&
                        datosOrdenados.every((p) => seleccionados.includes(p.id))
                      }
                      onChange={(e) =>
                        setSeleccionados(
                          e.target.checked ? datosOrdenados.map((p) => p.id) : []
                        )
                      }
                    />
                  </th>
                  <th className="inv-th inv-th--idx">#</th>
                  <SortTh label="PRODUCTO"    sortKey="nombre"    />
                  <SortTh label="CATEGORÍA"   sortKey="categoria" />
                  <SortTh label="PRECIO"      sortKey="precio"    />
                  <SortTh label="PROVEEDOR"   sortKey="proveedor" />
                  <SortTh label="CANTIDAD"    sortKey="cantidad"  center />
                </tr>
              </thead>
              <tbody>
                {datosOrdenados.map((producto, idx) => {
                  const estaEditando = ProdEditadoID === producto.id;
                  const stockBajo = idsStockBajo.has(producto.id);
                  const sinStock = producto.cantidad_actual === 0;
                  const estaSeleccionado = seleccionados.includes(producto.id);

                  const stockClass = sinStock
                    ? "inv-stock--cero"
                    : stockBajo
                    ? "inv-stock--bajo"
                    : "inv-stock--ok";

                  return (
                    <tr
                      key={producto.id}
                      className={[
                        "inv-tr",
                        estaSeleccionado ? "inv-tr--sel" : "",
                        stockBajo && !estaSeleccionado ? "inv-tr--alerta" : "",
                        estaEditando ? "inv-tr--editando" : "",
                        !edicion ? "inv-tr--clickable" : "",
                      ].join(" ")}
                      onClick={(e) => {
                        if (edicion) return;
                        if (["INPUT", "SELECT", "BUTTON"].includes(e.target.tagName)) return;
                        toggleSeleccion(producto.id, !estaSeleccionado);
                      }}
                    >
                      {/* Checkbox */}
                      <td className="inv-td inv-td--check">
                        <input
                          className="inv-checkbox"
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={(e) => toggleSeleccion(producto.id, e.target.checked)}
                        />
                      </td>

                      {/* Índice */}
                      <td className="inv-td inv-td--idx">{idx + 1}</td>

                      {/* Nombre */}
                      <td className="inv-td inv-td--nombre" data-label="Producto">
                        {estaEditando ? (
                          <input
                            className="inv-input-edit"
                            type="text"
                            name="nombre"
                            value={ProdEditado.nombre}
                            onChange={handleChangeEdicion}
                            autoFocus
                          />
                        ) : (
                          <span className="inv-nombre-txt">
                            {stockBajo && (
                              <span className="inv-nombre-dot" title="Stock bajo" />
                            )}
                            {producto.nombre}
                          </span>
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="inv-td" data-label="Categoría">
                        {estaEditando ? (
                          <select
                            className="inv-select-edit"
                            name="categoria"
                            value={ProdEditado.categoria?.id || ""}
                            onChange={handleChangeEdicion}
                          >
                            {categoriaData.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inv-categoria-tag">{producto.categoria.nombre}</span>
                        )}
                      </td>

                      {/* Precio */}
                      <td className="inv-td inv-td--precio" data-label="Precio">
                        {estaEditando ? (
                          <input
                            className="inv-input-edit"
                            type="number"
                            name="precio"
                            value={ProdEditado.precio}
                            onChange={handleChangeEdicion}
                          />
                        ) : (
                          <span className="inv-precio-txt">
                            <span className="inv-precio-sym">$</span>
                            {Number(producto.precio).toLocaleString("es-CO")}
                          </span>
                        )}
                      </td>

                      {/* Proveedor */}
                      <td className="inv-td inv-td--prov" data-label="Proveedor">
                        {estaEditando ? (
                          <select
                            className="inv-select-edit"
                            name="proveedor"
                            value={ProdEditado.proveedor?.id || ""}
                            onChange={handleChangeEdicion}
                          >
                            {proveedoresData.map((p) => (
                              <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                          </select>
                        ) : (
                          producto.proveedor.nombre
                        )}
                      </td>

                      {/* Cantidad */}
                      <td className="inv-td inv-td--cantidad" data-label="Cantidad">
                        {estaEditando ? (
                          <input
                            className="inv-input-edit inv-input-edit--sm"
                            type="number"
                            name="cantidad_actual"
                            value={ProdEditado.cantidad_actual}
                            onChange={handleChangeEdicion}
                          />
                        ) : (
                          <span className={`inv-stock-badge ${stockClass}`}>
                            {sinStock ? "SIN STOCK" : producto.cantidad_actual}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {datosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="inv-td inv-td--empty" data-label="">
                      {busqueda || categoriaSeleccionada
                        ? `Sin resultados para la búsqueda actual`
                        : "No hay productos registrados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Barra de acciones de edición ── */}
        {edicion && (
          <div className="inv-edit-bar">
            <p className="inv-edit-bar-text">
              Editando: <strong>{ProdEditado.nombre}</strong>
            </p>
            <div className="inv-edit-bar-btns">
              <button className="inv-btn-verde" onClick={GuardarEdicion}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                GUARDAR
              </button>
              <button className="inv-btn-rojo" onClick={CancelarEdicion}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                CANCELAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Agregar producto ── */}
      {showModalAgregar && (
        <div className="inv-overlay" onClick={cerrarModalAgregar}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-header">
              <div>
                <p className="inv-modal-label">NUEVO REGISTRO</p>
                <h3 className="inv-modal-title">Agregar Producto</h3>
              </div>
              <button className="inv-modal-close" onClick={cerrarModalAgregar}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form className="inv-form" onSubmit={handleSubmit}>
              <div className="inv-form-row">
                <label className="inv-label">Nombre del producto</label>
                <input
                  className="inv-input"
                  type="text"
                  placeholder="Ej: Ron Medellín 750ml"
                  name="nombre"
                  value={datosForm.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="inv-form-row">
                <label className="inv-label">Precio unitario</label>
                <input
                  className="inv-input"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  name="precio"
                  value={datosForm.precio}
                  onChange={handleChange}
                />
              </div>

              <div className="inv-form-row">
                <label className="inv-label">Tope mínimo de stock</label>
                <input
                  className="inv-input"
                  type="number"
                  placeholder="Cantidad mínima"
                  name="tope"
                  value={datosForm.tope}
                  onChange={handleChange}
                />
              </div>

              <div className="inv-form-row">
                <label className="inv-label">Proveedor</label>
                <div className="inv-select-field">
                  <select
                    className="inv-select-modal"
                    name="proveedor"
                    value={datosForm.proveedor}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedoresData.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="inv-form-row">
                <label className="inv-label">Categoría</label>
                <div className="inv-select-field">
                  <select
                    className="inv-select-modal"
                    name="categoria"
                    value={datosForm.categoria}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categoriaData.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="inv-form-error">{error}</p>}

              <div className="inv-form-btns">
                <button type="submit" className="inv-btn-verde inv-btn-lg">
                  GUARDAR PRODUCTO
                </button>
                <button type="button" className="inv-btn-ghost inv-btn-lg" onClick={cerrarModalAgregar}>
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar eliminar ── */}
      {showModalEliminar && (
        <div className="inv-overlay" onClick={() => setShowModalEliminar(false)}>
          <div className="inv-modal inv-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-warning-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="inv-modal-title inv-modal-title--center">Confirmar Eliminación</h3>
            <p className="inv-modal-warn-text">
              Se eliminarán <strong>{seleccionados.length}</strong> producto(s) de forma permanente. Esta acción no se puede deshacer.
            </p>
            <div className="inv-form-btns">
              <button className="inv-btn-rojo inv-btn-lg" onClick={eliminarProdSelec}>
                SÍ, ELIMINAR
              </button>
              <button className="inv-btn-ghost inv-btn-lg" onClick={() => setShowModalEliminar(false)}>
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Panel: Alertas de stock bajo ── */}
      {noti && (
        <div className="inv-noti-overlay" onClick={() => setNoti(false)}>
          <div className="inv-noti-panel" onClick={(e) => e.stopPropagation()}>
            <div className="inv-noti-header">
              <div>
                <p className="inv-modal-label">SISTEMA DE ALERTAS</p>
                <h3 className="inv-noti-title">Stock Bajo</h3>
              </div>
              <button className="inv-modal-close" onClick={() => setNoti(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="inv-noti-sub">
              {productosStockBajo.length} producto(s) con existencias próximas a terminar
            </p>
            <div className="inv-noti-list">
              {productosStockBajo.map((p) => (
                <div key={p.id} className="inv-noti-item">
                  <div className="inv-noti-item-left">
                    <span className="inv-noti-dot" />
                    <span className="inv-noti-nombre">{p.nombre}</span>
                  </div>
                  <span className="inv-noti-cantidad">
                    {p.cantidad_actual} / {p.topeMin} uds.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          background: "#151a21",
          border: "1px solid rgba(156,255,147,0.2)",
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "0.8rem",
        }}
      />
    </>
  );
};

export default Inventario;
