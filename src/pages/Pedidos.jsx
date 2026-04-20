import { useState, useEffect } from "react";
import "../styles/Pedidos.css";
import BarcodeScanner from "../components/BardcodeScanner";
import beepSound from "../assets/sonidos/beepSound.mp3";
import {
  consultarPedidos,
  crearPedido,
  agregarProducto,
  quitarProducto,
  confirmarPago,
  cancelarPedido,
} from "../js/pedidos.js";
import { consultaMesas } from "../js/mesa.js";
import { consultaInventario } from "../js/inventario.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Pedidos = () => {
  /* ── Data ── */
  const [pedidosData, setPedidosData] = useState([]);
  const [mesasData, setMesasData] = useState([]);
  const [productosData, setProductosData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  /* ── Filtros ── */
  const [filtroTipo, setFiltroTipo] = useState("mesa");
  const [filtroEstado, setFiltroEstado] = useState("pendiente");

  /* ── Panel detalle ── */
  const [pedidoSel, setPedidoSel] = useState(null);
  const [panelDetalle, setPanelDetalle] = useState(false);

  /* ── Modal: agregar productos ── */
  const [modalAgregar, setModalAgregar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [productoActivo, setProductoActivo] = useState(null);
  const [cantidadAgregar, setCantidadAgregar] = useState(1);
  const [carrito, setCarrito] = useState([]);

  /* ── Modal: confirmar pago ── */
  const [modalPago, setModalPago] = useState(false);
  const [pago, setPago] = useState("");
  const [devuelta, setDevuelta] = useState("");
  const [estadoPago, setEstadoPago] = useState("--");

  /* ── Modal: cancelar ── */
  const [modalCancelar, setModalCancelar] = useState(false);

  /* ── Modal: nuevo pedido ── */
  const [modalNuevo, setModalNuevo] = useState(false);
  const [mesaNuevo, setMesaNuevo] = useState("");
  const [carritoNuevo, setCarritoNuevo] = useState([]);
  const [busquedaNuevo, setBusquedaNuevo] = useState("");
  const [sugerenciasNuevo, setSugerenciasNuevo] = useState([]);
  const [productoNuevo, setProductoNuevo] = useState(null);
  const [cantidadNuevo, setCantidadNuevo] = useState(1);
  const [scanner, setScanner] = useState(false);

  /* ── Derived ── */
  const pedidosFiltrados = pedidosData.filter((p) => {
    const tipoOk = p.proveniencia === filtroTipo;
    const estadoOk = filtroEstado === "" || p.estado === filtroEstado;
    return tipoOk && estadoOk;
  });

  const mesasDisponibles = mesasData.filter((m) => m.disponible);

  const contadores = {
    pendiente: pedidosData.filter((p) => p.proveniencia === filtroTipo && p.estado === "pendiente").length,
    pagado: pedidosData.filter((p) => p.proveniencia === filtroTipo && p.estado === "pagado").length,
    cancelado: pedidosData.filter((p) => p.proveniencia === filtroTipo && p.estado === "cancelado").length,
  };

  const totalCarritoNuevo = carritoNuevo.reduce((acc, p) => acc + p.subtotal, 0);

  /* ── Fetch ── */
  const cargarDatos = async () => {
    try {
      const [pedidos, mesas, productos] = await Promise.all([
        consultarPedidos(),
        consultaMesas(),
        consultaInventario(),
      ]);
      if (Array.isArray(pedidos)) setPedidosData(pedidos);
      if (Array.isArray(mesas)) setMesasData(mesas);
      if (Array.isArray(productos)) setProductosData(productos);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const refrescarTodo = async () => {
    const pedidos = await consultarPedidos();
    if (Array.isArray(pedidos)) {
      setPedidosData(pedidos);
      if (pedidoSel) {
        const updated = pedidos.find((p) => p.id === pedidoSel.id);
        if (updated) setPedidoSel(updated);
      }
    }
  };

  /* ── Panel detalle ── */
  const abrirDetalle = (pedido) => {
    setPedidoSel(pedido);
    setPanelDetalle(true);
    setPago("");
    setDevuelta("");
    setEstadoPago("--");
  };

  const cerrarDetalle = () => {
    setPanelDetalle(false);
    setPedidoSel(null);
    setPago("");
    setDevuelta("");
    setEstadoPago("--");
  };

  /* ── Quitar producto ── */
  const handleQuitarProducto = async (detalleId) => {
    if (!pedidoSel) return;
    const res = await quitarProducto(pedidoSel.id, { detalle_id: detalleId });
    if (res?.status === 200 || res?.status === 204) {
      toast.success("Producto eliminado del pedido");
      await refrescarTodo();
    } else {
      toast.error("No se pudo eliminar el producto");
    }
  };

  /* ── Modal agregar productos ── */
  const abrirModalAgregar = () => {
    setCarrito([]);
    setBusqueda("");
    setSugerencias([]);
    setProductoActivo(null);
    setCantidadAgregar(1);
    setModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setModalAgregar(false);
    setCarrito([]);
    setBusqueda("");
    setSugerencias([]);
    setProductoActivo(null);
    setCantidadAgregar(1);
    setScanner(false);
  };

  const handleBusquedaAgregar = (texto) => {
    setBusqueda(texto);
    if (!texto.trim()) { setSugerencias([]); return; }
    setSugerencias(productosData.filter((p) => p.nombre.toLowerCase().includes(texto.toLowerCase())));
  };

  const seleccionarProductoAgregar = (p) => {
    setProductoActivo(p);
    setBusqueda(p.nombre);
    setSugerencias([]);
  };

  const agregarAlCarrito = () => {
    if (!productoActivo || Number(cantidadAgregar) <= 0) {
      toast.error("Selecciona un producto y una cantidad válida");
      return;
    }
    if (carrito.find((p) => p.id === productoActivo.id)) {
      toast.warning("Ese producto ya está en la lista");
      return;
    }
    setCarrito([...carrito, {
      id: productoActivo.id,
      nombre: productoActivo.nombre,
      precio: productoActivo.precio,
      cantidad: Number(cantidadAgregar),
      subtotal: productoActivo.precio * Number(cantidadAgregar),
    }]);
    setProductoActivo(null);
    setBusqueda("");
    setSugerencias([]);
    setCantidadAgregar(1);
  };

  const actualizarCantidadCarrito = (id, op) => {
    setCarrito(carrito.map((p) => {
      if (p.id !== id) return p;
      const nueva = op === "+" ? p.cantidad + 1 : Math.max(1, p.cantidad - 1);
      return { ...p, cantidad: nueva, subtotal: p.precio * nueva };
    }));
  };

  const eliminarDelCarrito = (id) => setCarrito(carrito.filter((p) => p.id !== id));

  const enviarAgregarProductos = async () => {
    if (!pedidoSel || carrito.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    const items = carrito.map((p) => ({ producto_id: p.id, cantidad: p.cantidad }));
    const res = await agregarProducto(pedidoSel.id, { productos: items });
    if (res?.status === 200 || res?.status === 201) {
      toast.success("Productos agregados al pedido");
      cerrarModalAgregar();
      await refrescarTodo();
    } else {
      toast.error("Error al agregar productos. Verifica el stock disponible.");
    }
  };

  /* ── Modal confirmar pago ── */
  const abrirModalPago = () => {
    setPago("");
    setDevuelta("");
    setEstadoPago("--");
    setModalPago(true);
  };

  const cerrarModalPago = () => {
    setModalPago(false);
    setPago("");
    setDevuelta("");
    setEstadoPago("--");
  };

  const calcularDevuelta = (valor) => {
    const total = parseFloat(pedidoSel?.total || 0);
    const pagoNum = Number(valor);
    if (isNaN(pagoNum) || pagoNum < total) {
      setEstadoPago("Falta");
      setDevuelta(Math.abs(total - pagoNum).toFixed(2));
    } else {
      setEstadoPago("Devuelve");
      setDevuelta((pagoNum - total).toFixed(2));
    }
  };

  const handleConfirmarPago = async () => {
    const total = parseFloat(pedidoSel?.total || 0);
    if (Number(pago) < total) {
      toast.error("El pago es insuficiente");
      return;
    }
    const devueltaVal = Number(pago) - total;
    const res = await confirmarPago(pedidoSel.id, { devuelta: devueltaVal });
    if (res?.status === 201 || res?.status === 200) {
      toast.success("Pago confirmado. Pedido convertido a venta.");
      cerrarModalPago();
      cerrarDetalle();
      await cargarDatos();
    } else {
      toast.error("Error al confirmar el pago. Revisa el stock.");
    }
  };

  /* ── Modal cancelar ── */
  const handleCancelarPedido = async () => {
    if (!pedidoSel) return;
    const res = await cancelarPedido(pedidoSel.id);
    if (res?.status === 200 || res?.status === 201) {
      toast.success("Pedido cancelado correctamente");
      setModalCancelar(false);
      cerrarDetalle();
      await cargarDatos();
    } else {
      toast.error("Error al cancelar el pedido");
    }
  };

  /* ── Modal nuevo pedido ── */
  const abrirModalNuevo = () => {
    setMesaNuevo("");
    setCarritoNuevo([]);
    setBusquedaNuevo("");
    setSugerenciasNuevo([]);
    setProductoNuevo(null);
    setCantidadNuevo(1);
    setModalNuevo(true);
  };

  const cerrarModalNuevo = () => {
    setModalNuevo(false);
    setMesaNuevo("");
    setCarritoNuevo([]);
    setBusquedaNuevo("");
    setSugerenciasNuevo([]);
    setProductoNuevo(null);
    setCantidadNuevo(1);
    setScanner(false);
  };

  const handleBusquedaNuevo = (texto) => {
    setBusquedaNuevo(texto);
    if (!texto.trim()) { setSugerenciasNuevo([]); return; }
    setSugerenciasNuevo(productosData.filter((p) => p.nombre.toLowerCase().includes(texto.toLowerCase())));
  };

  const seleccionarProductoNuevo = (p) => {
    setProductoNuevo(p);
    setBusquedaNuevo(p.nombre);
    setSugerenciasNuevo([]);
  };

  const reproducirBeep = () => {
    const audio = new Audio(beepSound);
    audio.volume = 0.5;
    audio.play();
  };

  const agregarPorCodigo = (codigo) => {
    const producto = productosData.find((p) => p.codigoBarras === codigo);
    if (!producto) {
      toast.error("Producto no encontrado");
      setScanner(false);
      return;
    }
    reproducirBeep();
    if (modalAgregar) seleccionarProductoAgregar(producto);
    else if (modalNuevo) seleccionarProductoNuevo(producto);
    setScanner(false);
  };

  const agregarAlCarritoNuevo = () => {
    if (!productoNuevo || Number(cantidadNuevo) <= 0) {
      toast.error("Selecciona un producto y una cantidad válida");
      return;
    }
    if (carritoNuevo.find((p) => p.id === productoNuevo.id)) {
      toast.warning("Ese producto ya está en la lista");
      return;
    }
    setCarritoNuevo([...carritoNuevo, {
      id: productoNuevo.id,
      nombre: productoNuevo.nombre,
      precio: productoNuevo.precio,
      cantidad: Number(cantidadNuevo),
      subtotal: productoNuevo.precio * Number(cantidadNuevo),
    }]);
    setProductoNuevo(null);
    setBusquedaNuevo("");
    setSugerenciasNuevo([]);
    setCantidadNuevo(1);
  };

  const actualizarCantidadNuevo = (id, op) => {
    setCarritoNuevo(carritoNuevo.map((p) => {
      if (p.id !== id) return p;
      const nueva = op === "+" ? p.cantidad + 1 : Math.max(1, p.cantidad - 1);
      return { ...p, cantidad: nueva, subtotal: p.precio * nueva };
    }));
  };

  const eliminarDelCarritoNuevo = (id) => setCarritoNuevo(carritoNuevo.filter((p) => p.id !== id));

  const handleCrearPedido = async () => {
    if (carritoNuevo.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    if (filtroTipo === "mesa" && !mesaNuevo) {
      toast.error("Selecciona una mesa disponible");
      return;
    }
    const productos = carritoNuevo.map((p) => ({ producto_id: p.id, cantidad: p.cantidad }));
    const body = { proveniencia: filtroTipo, productos };
    if (filtroTipo === "mesa") body.mesa_id = Number(mesaNuevo);

    const res = await crearPedido(body);
    if (res?.status === 201) {
      toast.success(`Pedido ${filtroTipo === "mesa" ? "de mesa" : "web"} creado exitosamente`);
      cerrarModalNuevo();
      await cargarDatos();
    } else {
      const errMsg = res?.data?.detail || res?.data?.error || "Error al crear el pedido. Verifica disponibilidad.";
      toast.error(errMsg);
    }
  };

  /* ── Helper ── */
  const estadoBadgeClass = (estado) => {
    if (estado === "pendiente") return "pd-badge pd-badge--pendiente";
    if (estado === "pagado") return "pd-badge pd-badge--pagado";
    if (estado === "cancelado") return "pd-badge pd-badge--cancelado";
    return "pd-badge";
  };

  /* ── Loading ── */
  if (cargando) {
    return (
      <div className="pd-loading">
        <div className="pd-loader" />
        <p className="pd-loading-text">CARGANDO PEDIDOS...</p>
      </div>
    );
  }

  return (
    <section className="pd-page">

      {scanner && (
        <div className="Scan--active">
          <BarcodeScanner onResult={(valor) => agregarPorCodigo(valor)} />
        </div>
      )}

      {/* ── Header ── */}
      <div className="pd-header">
        <div className="pd-header-left">
          <div className="pd-status">
            <span className="pd-status-dot" />
            <span className="pd-status-text">GESTIÓN ACTIVA</span>
          </div>
          <h1 className="pd-title">PEDIDOS</h1>
        </div>
        <div className="pd-header-right">
          <button className="pd-btn pd-btn--ghost" onClick={cargarDatos}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            ACTUALIZAR
          </button>
          <button className="pd-btn pd-btn--verde" onClick={abrirModalNuevo}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5l0 14" />
              <path d="M5 12l14 0" />
            </svg>
            NUEVO PEDIDO
          </button>
        </div>
      </div>

      {error && <p className="pd-error">{error}</p>}

      {/* ── Tabs: Mesa / Web ── */}
      <div className="pd-tabs">
        <button
          className={`pd-tab ${filtroTipo === "mesa" ? "pd-tab--active" : ""}`}
          onClick={() => { setFiltroTipo("mesa"); setFiltroEstado("pendiente"); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10v8l7 -3v-2.6z" />
            <path d="M3 6l9 3l9 -3l-9 -3z" />
            <path d="M14 12.3v8.7l7 -3v-8z" />
          </svg>
          MESA / LOCAL
        </button>
        <button
          className={`pd-tab ${filtroTipo === "web" ? "pd-tab--active" : ""}`}
          onClick={() => { setFiltroTipo("web"); setFiltroEstado("pendiente"); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
            <path d="M3.6 9h16.8" />
            <path d="M3.6 15h16.8" />
            <path d="M11.5 3a17 17 0 0 0 0 18" />
            <path d="M12.5 3a17 17 0 0 1 0 18" />
          </svg>
          WEB / ONLINE
        </button>
      </div>

      {/* ── Filtros de estado ── */}
      <div className="pd-estado-bar">
        {[
          { key: "", label: "TODOS", count: null },
          { key: "pendiente", label: "PENDIENTE", count: contadores.pendiente },
          { key: "pagado", label: "PAGADO", count: contadores.pagado },
          { key: "cancelado", label: "CANCELADO", count: contadores.cancelado },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            className={`pd-chip pd-chip--${key || "todos"} ${filtroEstado === key ? "pd-chip--active" : ""}`}
            onClick={() => setFiltroEstado(key)}
          >
            {label}
            {count !== null && <span className="pd-chip-count">{count}</span>}
          </button>
        ))}
        <div className="pd-estado-spacer" />
        <span className="pd-count-info">
          <strong>{pedidosFiltrados.length}</strong> resultado(s)
        </span>
      </div>

      {/* ── Tabla ── */}
      <div className="pd-table-panel">
        <div className="pd-table-wrap">
          <table className="pd-table">
            <thead>
              <tr>
                <th className="pd-th pd-th--idx">#</th>
                <th className="pd-th">ID</th>
                {filtroTipo === "mesa" && <th className="pd-th">MESA</th>}
                <th className="pd-th">ESTADO</th>
                <th className="pd-th">TOTAL</th>
                <th className="pd-th">FECHA</th>
                <th className="pd-th pd-th--center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido, index) => (
                <tr
                  key={pedido.id}
                  className="pd-tr pd-tr--clickable"
                  onClick={() => abrirDetalle(pedido)}
                >
                  <td className="pd-td pd-td--idx">{index + 1}</td>
                  <td className="pd-td">
                    <span className="pd-id-tag">#{pedido.id}</span>
                  </td>
                  {filtroTipo === "mesa" && (
                    <td className="pd-td">
                      <span className="pd-mesa-tag">
                        {pedido.mesa ? `Mesa ${pedido.mesa.numero}` : "—"}
                      </span>
                    </td>
                  )}
                  <td className="pd-td">
                    <span className={estadoBadgeClass(pedido.estado)}>
                      {pedido.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="pd-td">
                    <span className="pd-precio-txt">
                      <span className="pd-precio-sym">$</span>
                      {parseFloat(pedido.total).toFixed(2)}
                    </span>
                  </td>
                  <td className="pd-td pd-td--fecha">
                    {new Date(pedido.fecha_creacion).toLocaleString()}
                  </td>
                  <td className="pd-td pd-td--center">
                    <button
                      className="pd-detail-btn"
                      onClick={(e) => { e.stopPropagation(); abrirDetalle(pedido); }}
                    >
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={filtroTipo === "mesa" ? 7 : 6} className="pd-td--empty">
                    SIN PEDIDOS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════
          MODAL: DETALLE DE PEDIDO
          ════════════════════════════════════════ */}
      {panelDetalle && pedidoSel && (
        <div className="pd-overlay" onClick={cerrarDetalle}>
          <div className="pd-modal pd-modal--detalle" onClick={(e) => e.stopPropagation()}>
            <span className="pd-corner pd-corner--tl" />
            <span className="pd-corner pd-corner--br" />

            <div className="pd-modal-header">
              <div className="pd-modal-header-left">
                <p className="pd-modal-id">PEDIDO #{pedidoSel.id}</p>
                <p className="pd-modal-fecha">
                  {new Date(pedidoSel.fecha_creacion).toLocaleString()}
                </p>
                <div className="pd-modal-meta-tags">
                  <span className={estadoBadgeClass(pedidoSel.estado)}>
                    {pedidoSel.estado.toUpperCase()}
                  </span>
                  {pedidoSel.proveniencia === "mesa" ? (
                    <span className="pd-tipo-tag pd-tipo-tag--mesa">
                      {pedidoSel.mesa ? `MESA ${pedidoSel.mesa.numero}` : "MESA"}
                    </span>
                  ) : (
                    <span className="pd-tipo-tag pd-tipo-tag--web">
                      WEB
                    </span>
                  )}
                </div>
              </div>
              <div className="pd-modal-header-right">
                <div className="pd-modal-totales">
                  <span className="pd-modal-total-label">TOTAL</span>
                  <span className="pd-modal-total-valor">
                    ${parseFloat(pedidoSel.total).toFixed(2)}
                  </span>
                </div>
                <button className="pd-close-btn" onClick={cerrarDetalle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6l-12 12" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pd-modal-body">
              <p className="pd-modal-section-title">PRODUCTOS DEL PEDIDO</p>
              {pedidoSel.detalles && pedidoSel.detalles.length > 0 ? (
                <ul className="pd-productos-list">
                  {pedidoSel.detalles.map((detalle) => (
                    <li key={detalle.id} className="pd-producto-item">
                      <span className="pd-producto-nombre">{detalle.producto.nombre}</span>
                      <span className="pd-producto-qty">×{detalle.cantidad}</span>
                      <span className="pd-producto-precio">
                        ${parseFloat(detalle.subtotal).toFixed(2)}
                      </span>
                      {pedidoSel.estado === "pendiente" && (
                        <button
                          className="pd-remove-btn"
                          title="Quitar producto del pedido"
                          onClick={() => handleQuitarProducto(detalle.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7l16 0" />
                            <path d="M10 11l0 6" />
                            <path d="M14 11l0 6" />
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                          </svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="pd-productos-empty">Sin productos registrados</div>
              )}
            </div>

            <div className="pd-modal-footer">
              <button className="pd-btn pd-btn--ghost" onClick={cerrarDetalle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 14l-4 -4l4 -4" />
                  <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
                </svg>
                CERRAR
              </button>
              {pedidoSel.estado === "pendiente" && (
                <>
                  <button className="pd-btn pd-btn--ghost" onClick={abrirModalAgregar}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5l0 14" />
                      <path d="M5 12l14 0" />
                    </svg>
                    AGREGAR
                  </button>
                  <button className="pd-btn pd-btn--rojo" onClick={() => setModalCancelar(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6l-12 12" />
                      <path d="M6 6l12 12" />
                    </svg>
                    CANCELAR
                  </button>
                  <button className="pd-btn pd-btn--verde" onClick={abrirModalPago}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5l10 -10" />
                    </svg>
                    CONFIRMAR PAGO
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MODAL: AGREGAR PRODUCTOS
          ════════════════════════════════════════ */}
      {modalAgregar && pedidoSel && (
        <div className="pd-overlay" onClick={cerrarModalAgregar}>
          <div className="pd-cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="pd-cart-header">
              <div>
                <p className="pd-cart-title">AGREGAR PRODUCTOS</p>
                <p className="pd-cart-sub">
                  Pedido #{pedidoSel.id}
                  {pedidoSel.mesa ? ` · Mesa ${pedidoSel.mesa.numero}` : " · Web"}
                </p>
              </div>
              <button className="pd-close-btn" onClick={cerrarModalAgregar}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pd-input-bar">
              <div className="pd-search-group">
                <label className="pd-label">Producto</label>
                <div className="pd-search-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                    <path d="M21 21l-6 -6" />
                  </svg>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => handleBusquedaAgregar(e.target.value)}
                  />
                  <div className="Scanner" title="Escanear código de barras" onClick={() => setScanner(!scanner)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 8v8" /><path d="M14 8v8" /><path d="M8 10h8" /><path d="M8 14h8" />
                      <path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                    </svg>
                  </div>
                </div>
                {sugerencias.length > 0 && (
                  <div className="pd-suggestions">
                    {sugerencias.map((p) => (
                      <div key={p.id} className="pd-suggestion-item" onClick={() => seleccionarProductoAgregar(p)}>
                        <span className="pd-sug-name">{p.nombre}</span>
                        <span className="pd-sug-stock">Stock: {p.cantidad_actual}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pd-qty-group">
                <label className="pd-label">Cantidad</label>
                <input
                  type="number"
                  className="pd-input pd-input--qty"
                  min="1"
                  value={cantidadAgregar}
                  onChange={(e) => setCantidadAgregar(e.target.value)}
                />
              </div>
              <button className="pd-btn pd-btn--verde" onClick={agregarAlCarrito}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M17 17h-11v-14h-2" />
                  <path d="M6 5l14 1l-1 7h-13" />
                </svg>
                Agregar
              </button>
            </div>

            <div className="pd-table-wrap pd-table-wrap--cart">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th className="pd-th pd-th--idx">#</th>
                    <th className="pd-th">Producto</th>
                    <th className="pd-th pd-th--center">Cantidad</th>
                    <th className="pd-th pd-th--right">Subtotal</th>
                    <th className="pd-th pd-th--del"></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((p, i) => (
                    <tr key={p.id} className="pd-tr">
                      <td className="pd-td pd-td--idx">{i + 1}</td>
                      <td className="pd-td">{p.nombre}</td>
                      <td className="pd-td pd-td--center">
                        <div className="pd-qty-ctrl">
                          <button className="pd-qty-btn" onClick={() => actualizarCantidadCarrito(p.id, "-")}>−</button>
                          <span className="pd-qty-val">{p.cantidad}</span>
                          <button className="pd-qty-btn" onClick={() => actualizarCantidadCarrito(p.id, "+")}>+</button>
                        </div>
                      </td>
                      <td className="pd-td pd-td--right">
                        <span className="pd-precio-txt">${p.subtotal.toFixed(2)}</span>
                      </td>
                      <td className="pd-td pd-td--del">
                        <button className="pd-del-btn" onClick={() => eliminarDelCarrito(p.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7l16 0" />
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                            <path d="M10 12l4 4m0 -4l-4 4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {carrito.length === 0 && (
                    <tr>
                      <td colSpan={5} className="pd-td--empty">
                        Agrega productos para continuar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pd-cart-footer">
              <button className="pd-btn pd-btn--ghost" onClick={cerrarModalAgregar}>
                CANCELAR
              </button>
              <button className="pd-btn pd-btn--verde" onClick={enviarAgregarProductos}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 14l11 -11" />
                  <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                </svg>
                AGREGAR AL PEDIDO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MODAL: CONFIRMAR PAGO
          ════════════════════════════════════════ */}
      {modalPago && pedidoSel && (
        <div className="pd-overlay" onClick={cerrarModalPago}>
          <div className="pd-modal pd-modal--pago" onClick={(e) => e.stopPropagation()}>
            <span className="pd-corner pd-corner--tl" />
            <span className="pd-corner pd-corner--br" />

            <div className="pd-modal-header">
              <div className="pd-modal-header-left">
                <p className="pd-modal-id">CONFIRMAR PAGO</p>
                <p className="pd-modal-fecha">Pedido #{pedidoSel.id}</p>
              </div>
              <button className="pd-close-btn" onClick={cerrarModalPago}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pd-modal-body pd-pago-body">
              <div className="pd-pago-total-row">
                <span className="pd-pago-total-label">TOTAL DEL PEDIDO</span>
                <span className="pd-pago-total-valor">
                  ${parseFloat(pedidoSel.total).toFixed(2)}
                </span>
              </div>

              <div className="pd-pay-field">
                <label className="pd-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 5h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
                  </svg>
                  Pago del cliente
                </label>
                <input
                  type="number"
                  min="0"
                  className="pd-input pd-input--pago"
                  value={pago}
                  placeholder="0"
                  onChange={(e) => { setPago(e.target.value); calcularDevuelta(e.target.value); }}
                />
              </div>

              {devuelta !== "" && (
                <div className={`pd-devuelta-row ${estadoPago === "Falta" ? "pd-devuelta--falta" : "pd-devuelta--devuelve"}`}>
                  <span className="pd-devuelta-label">
                    {estadoPago === "Falta" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v4" />
                        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                        <path d="M12 16h.01" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    )}
                    {estadoPago === "Falta" ? "Falta" : "Devuelve"}
                  </span>
                  <span className="pd-devuelta-valor">${devuelta}</span>
                </div>
              )}
            </div>

            <div className="pd-modal-footer">
              <button className="pd-btn pd-btn--ghost" onClick={cerrarModalPago}>
                CANCELAR
              </button>
              <button className="pd-btn pd-btn--verde pd-btn--lg" onClick={handleConfirmarPago}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5l10 -10" />
                </svg>
                CONFIRMAR PAGO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MODAL: CANCELAR PEDIDO
          ════════════════════════════════════════ */}
      {modalCancelar && pedidoSel && (
        <div className="pd-overlay" onClick={() => setModalCancelar(false)}>
          <div className="pd-modal pd-modal--sm pd-modal--danger" onClick={(e) => e.stopPropagation()}>
            <span className="pd-corner pd-corner--tl pd-corner--danger" />
            <span className="pd-corner pd-corner--br pd-corner--danger" />
            <div className="pd-modal-warning-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="pd-modal-confirm-title">¿Cancelar pedido?</h3>
            <p className="pd-modal-warn-text">
              Se cancelará el Pedido <strong>#{pedidoSel.id}</strong>. El stock de los productos será restaurado
              {pedidoSel.mesa ? " y la mesa quedará libre" : ""}. Esta acción no se puede deshacer.
            </p>
            <div className="pd-modal-confirm-btns">
              <button className="pd-btn pd-btn--rojo pd-btn--lg" onClick={handleCancelarPedido}>
                SÍ, CANCELAR
              </button>
              <button className="pd-btn pd-btn--ghost pd-btn--lg" onClick={() => setModalCancelar(false)}>
                VOLVER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MODAL: NUEVO PEDIDO
          ════════════════════════════════════════ */}
      {modalNuevo && (
        <div className="pd-overlay" onClick={cerrarModalNuevo}>
          <div className="pd-cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="pd-cart-header">
              <div>
                <p className="pd-cart-title">NUEVO PEDIDO</p>
                <p className="pd-cart-sub">
                  {filtroTipo === "mesa" ? "Pedido presencial / mesa" : "Pedido web / online"}
                </p>
              </div>
              <button className="pd-close-btn" onClick={cerrarModalNuevo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {filtroTipo === "mesa" && (
              <div className="pd-nuevo-mesa-row">
                <label className="pd-label">Mesa disponible</label>
                <select
                  className="pd-select"
                  value={mesaNuevo}
                  onChange={(e) => setMesaNuevo(e.target.value)}
                >
                  <option value="">— Seleccionar mesa —</option>
                  {mesasDisponibles.map((m) => (
                    <option key={m.id} value={m.id}>
                      Mesa {m.numero}
                    </option>
                  ))}
                </select>
                {mesasDisponibles.length === 0 && (
                  <p className="pd-mesa-aviso">No hay mesas disponibles en este momento</p>
                )}
              </div>
            )}

            <div className="pd-input-bar">
              <div className="pd-search-group">
                <label className="pd-label">Producto</label>
                <div className="pd-search-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                    <path d="M21 21l-6 -6" />
                  </svg>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="Buscar producto..."
                    value={busquedaNuevo}
                    onChange={(e) => handleBusquedaNuevo(e.target.value)}
                  />
                  <div className="Scanner" title="Escanear código de barras" onClick={() => setScanner(!scanner)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 8v8" /><path d="M14 8v8" /><path d="M8 10h8" /><path d="M8 14h8" />
                      <path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                    </svg>
                  </div>
                </div>
                {sugerenciasNuevo.length > 0 && (
                  <div className="pd-suggestions">
                    {sugerenciasNuevo.map((p) => (
                      <div key={p.id} className="pd-suggestion-item" onClick={() => seleccionarProductoNuevo(p)}>
                        <span className="pd-sug-name">{p.nombre}</span>
                        <span className="pd-sug-stock">Stock: {p.cantidad_actual}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pd-qty-group">
                <label className="pd-label">Cantidad</label>
                <input
                  type="number"
                  className="pd-input pd-input--qty"
                  min="1"
                  value={cantidadNuevo}
                  onChange={(e) => setCantidadNuevo(e.target.value)}
                />
              </div>
              <button className="pd-btn pd-btn--verde" onClick={agregarAlCarritoNuevo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5l0 14" />
                  <path d="M5 12l14 0" />
                </svg>
                Agregar
              </button>
            </div>

            <div className="pd-table-wrap pd-table-wrap--cart">
              <table className="pd-table">
                <thead>
                  <tr>
                    <th className="pd-th pd-th--idx">#</th>
                    <th className="pd-th">Producto</th>
                    <th className="pd-th pd-th--center">Cantidad</th>
                    <th className="pd-th pd-th--right">Precio</th>
                    <th className="pd-th pd-th--right">Subtotal</th>
                    <th className="pd-th pd-th--del"></th>
                  </tr>
                </thead>
                <tbody>
                  {carritoNuevo.map((p, i) => (
                    <tr key={p.id} className="pd-tr">
                      <td className="pd-td pd-td--idx">{i + 1}</td>
                      <td className="pd-td">{p.nombre}</td>
                      <td className="pd-td pd-td--center">
                        <div className="pd-qty-ctrl">
                          <button className="pd-qty-btn" onClick={() => actualizarCantidadNuevo(p.id, "-")}>−</button>
                          <span className="pd-qty-val">{p.cantidad}</span>
                          <button className="pd-qty-btn" onClick={() => actualizarCantidadNuevo(p.id, "+")}>+</button>
                        </div>
                      </td>
                      <td className="pd-td pd-td--right">${p.precio}</td>
                      <td className="pd-td pd-td--right">
                        <span className="pd-precio-txt">${p.subtotal.toFixed(2)}</span>
                      </td>
                      <td className="pd-td pd-td--del">
                        <button className="pd-del-btn" onClick={() => eliminarDelCarritoNuevo(p.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 7l16 0" />
                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                            <path d="M10 12l4 4m0 -4l-4 4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {carritoNuevo.length === 0 && (
                    <tr>
                      <td colSpan={6} className="pd-td--empty">
                        Agrega productos para crear el pedido
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {carritoNuevo.length > 0 && (
              <div className="pd-cart-total">
                <span className="pd-cart-total-label">TOTAL ESTIMADO</span>
                <span className="pd-precio-txt pd-cart-total-valor">
                  <span className="pd-precio-sym">$</span>
                  {totalCarritoNuevo.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pd-cart-footer">
              <button className="pd-btn pd-btn--ghost" onClick={cerrarModalNuevo}>
                CANCELAR
              </button>
              <button className="pd-btn pd-btn--verde" onClick={handleCrearPedido}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5l10 -10" />
                </svg>
                CREAR PEDIDO
              </button>
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
    </section>
  );
};

export default Pedidos;
