import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { consultaInventario } from "../js/inventario";
import { confirmarPago } from "../js/pedidos";
import { consultaMesas } from "../js/mesa";
import { crearIngresosExternos } from "../js/ingresosExternos";
import { crearDeudores } from "../js/deudores";
import { consultarPedidos, agregarProducto } from "../js/pedidos";
import '../styles/GestionMesas.css';

const GestionMesas = () => {

    const [cargando, setCargando] = useState(true);
    const [ModalDetalle, setModalDetalle] = useState(false);
    const [ModalAgregar, setModalAgregar] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [sugerencia, setSugerencia] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [cantidad, setCantidad] = useState("");
    const [devuelta, setDevuelta] = useState("");
    const [Tdevuelve, setTdevuelve] = useState("--");
    const [pago, setPago] = useState(0);
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    const [pedidoId, setPedidoId] = useState(null);

    const [MesasData, setMesasData] = useState([]);
    const [Pedidos, setPedidos] = useState([]);
    const [productos, setProductos] = useState([]);

    const obtenerMesas = async () => {
        try {
            const MesasD = await consultaMesas();
            if (MesasD != null) setMesasData(MesasD);
        } catch (error) {
            console.error("Error en la consulta:", error);
        } finally {
            setCargando(false);
        }
    };

    const obtenerPedidos = async () => {
        try {
            const PedidosD = await consultarPedidos();
            if (PedidosD != null) {
                setPedidos(PedidosD.filter(p => p.estado === "activo" || p.estado === "pendiente"));
            }
        } catch (error) {
            console.error("Error en la consulta:", error);
        }
    };

    const ConsultarProductos = async () => {
        try {
            const data = await consultaInventario();
            if (Array.isArray(data)) setProductos(data);
        } catch (error) {
            console.error("Error al consultar productos:", error);
        }
    };

    useEffect(() => {
        obtenerPedidos();
        obtenerMesas();
        ConsultarProductos();
    }, []);

    /* Modal detalles ----------------------------------------------------------------*/
    const AbrirMD = (Mesa) => { setMesaSeleccionada(Mesa); setModalDetalle(true); };
    const CerrarMD = () => { setMesaSeleccionada(null); setModalDetalle(false); setDevuelta(""); setPago(0); };

    /* Modal agregar -----------------------------------------------------------------*/
    const AbrirMA = (id) => { setPedidoId(id); setModalAgregar(true); };
    const CerrarMA = () => {
        setPedidoId(null); setModalAgregar(false);
        setProductosSeleccionados([]); setBusqueda(""); setCantidad("");
    };

    const handleBusqueda = (texto) => {
        setBusqueda(texto);
        setSugerencia(productos.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase())));
    };

    const handleSeleccionarProducto = (producto) => {
        setProductoSeleccionado(producto);
        setBusqueda(producto.nombre);
        setSugerencia([]);
    };

    const handlechange = (e) => {
        const valor = e.target.value;
        if (/^-?\d*$/.test(valor)) setCantidad(valor);
        else toast.error("Por favor, ingresa un número válido");
    };

    const actualizarCantidad = (id, operacion) => {
        setProductosSeleccionados(productosSeleccionados.map(p => {
            if (p.id === id) {
                const nueva = operacion === "sumar" ? Number(p.cantidad) + 1 : Math.max(1, Number(p.cantidad) - 1);
                return { ...p, cantidad: nueva, subtotal: p.Precio * nueva, total: p.Precio * nueva };
            }
            return p;
        }));
    };

    const eliminarP = (id) => setProductosSeleccionados(productosSeleccionados.filter(p => p.id !== id));

    const AgregarProducto = () => {
        if (!productoSeleccionado || cantidad <= 0) {
            toast.error("Selecciona un producto y una cantidad válida.");
            return;
        }
        if (productosSeleccionados.find(p => p.id === productoSeleccionado.id)) {
            toast.warning("El producto ya está en la lista");
            return;
        }
        setProductosSeleccionados([...productosSeleccionados, {
            id: productoSeleccionado.id,
            nombre: productoSeleccionado.nombre,
            Precio: productoSeleccionado.precio,
            cantidad,
            subtotal: productoSeleccionado.precio * cantidad,
            total: productoSeleccionado.precio * cantidad,
        }]);
        setCantidad(0); setProductoSeleccionado(null); setSugerencia([]); setBusqueda("");
    };

    const enviarProductosPedido = async (id) => {
        const items = productosSeleccionados.map(p => ({ producto_id: p.id, cantidad: p.cantidad }));
        try {
            const respuesta = await agregarProducto(id, items);
            if (respuesta.status === 200) {
                toast.success("Pedido actualizado con éxito.");
                obtenerPedidos();
            } else {
                toast.error("Error al actualizar el pedido.");
            }
        } catch (error) {
            console.error("Error al actualizar el pedido:", error.response?.data);
        }
        CerrarMA();
    };

    /* Vender ------------------------------------------------------------------------*/
    const vender = async () => {
        if (pago < calcularTotal()) { toast.error("El pago es insuficiente"); return; }
        const pedidoDeMesa = Pedidos.find(p => p.mesa.id === mesaSeleccionada.id);
        if (!pedidoDeMesa) { toast.error("Esta mesa no tiene pedidos activos."); return; }
        try {
            const respuesta = await confirmarPago(pedidoDeMesa.id, { devuelta: parseFloat(devuelta) });
            if (respuesta.status === 201) {
                toast.success("Venta realizada con éxito");
                setTimeout(() => { setPago(0); setDevuelta(""); }, 1000);
                obtenerPedidos();
                CerrarMD();
            } else {
                toast.error("Error, revise el stock de los productos o intente nuevamente.");
            }
        } catch (error) {
            console.error("Error al realizar la venta:", error.response?.data);
            toast.error("Error al realizar la venta. Por favor, inténtelo de nuevo.");
        }
    };

    const devolucion = (valor) => {
        const total = calcularTotal();
        const pagoNum = Number(valor);
        setTdevuelve(isNaN(pagoNum) || pagoNum < total ? "Falta" : "Devuelve");
        setDevuelta((pagoNum - total).toFixed(2));
    };

    const calcularTotal = () => {
        const pedidoDeMesa = Pedidos.find(p => p.mesa.id === mesaSeleccionada?.id);
        return pedidoDeMesa ? parseFloat(pedidoDeMesa.total) : 0;
    };

    /* Modal Propina -----------------------------------------------------------------*/
    const [ModalIE, setModalIE] = useState(false);
    const [error, setError] = useState("");
    const [datosForm, setdatosForm] = useState({ ganancia: "" });

    const abrirModalIE = () => setModalIE(true);
    const cerrarModalIE = () => { setModalIE(false); setdatosForm({ ganancia: "" }); setError(""); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setdatosForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { ganancia } = datosForm;
        if (!ganancia) { setError("Por favor ingrese el valor de la propina."); return; }
        const gananciaNum = Number(ganancia);
        if (isNaN(gananciaNum) || gananciaNum <= 0) { setError("La ganancia debe ser un valor numérico mayor a 0."); return; }
        try {
            const response = await crearIngresosExternos({ tipoIngreso: 'propina', ganancia: gananciaNum });
            if (response.status === 201) {
                toast.success("¡Propina guardada exitosamente!");
                cerrarModalIE();
            } else {
                toast.error("No se pudo guardar la propina");
            }
        } catch (err) {
            console.error("Excepcion al crear la propina", err);
            toast.error("Error al crear la propina");
        }
    };

    /* Modal Deudor ------------------------------------------------------------------*/
    const [ModalDeudor, setModalDeudor] = useState(false);
    const [errorD, setErrorD] = useState("");
    const pedidoDeMesa = Pedidos.find(p => p.mesa.id === mesaSeleccionada?.id);
    const [datosFormD, setDatosFormD] = useState({ nombre: "", celular: "", autorizacion: false });

    const abrirMdeudor = (mesa) => { setMesaSeleccionada(mesa); setModalDeudor(true); };
    const cerrarMdeudor = () => {
        setModalDeudor(false);
        setDatosFormD({ nombre: "", celular: "", autorizacion: false });
        setErrorD("");
    };

    const handleChangeD = (e) => {
        const { name, value, type, checked } = e.target;
        setDatosFormD(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmitD = async (e) => {
        e.preventDefault();
        const { nombre, celular } = datosFormD;
        if (!nombre || !celular) { setErrorD("Por favor complete todos los campos obligatorios."); return; }
        const pedido = Pedidos.find(p => p.mesa.id === mesaSeleccionada.id);
        try {
            const response = await crearDeudores({
                nombre,
                celular,
                deuda: parseFloat(pedido?.total || 0),
                autorizacion: datosFormD.autorizacion,
            });
            if (response.status === 201) toast.success("¡Deudor registrado exitosamente!");
        } catch (err) {
            console.error("Excepción al crear el deudor:", err);
            toast.error("Error al registrar el deudor");
        }
        setDatosFormD({ nombre: "", celular: "", autorizacion: false });
        setErrorD("");
        cerrarMdeudor();
    };

    /* ═══════════════════════════════════════════════════════ */

    if (cargando) {
        return (
            <div className="gm-loading">
                <div className="gm-loader" />
                <p className="gm-loading-text">CARGANDO GESTIÓN DE MESAS...</p>
            </div>
        );
    }

    return (
        <>
            <div className="gm-page">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="gm-header">
                    <div className="gm-header-left">
                        <div className="gm-header-accent" />
                        <div>
                            <div className="gm-status">
                                <span className="gm-status-dot" />
                                <span className="gm-status-text">SISTEMA ACTIVO</span>
                            </div>
                            <h2 className="gm-title">Gestión de Mesas</h2>
                            <p className="gm-subtitle">
                                {MesasData.length} mesas configuradas · {Pedidos.length} con pedido activo
                            </p>
                        </div>
                    </div>
                    <div className="gm-header-right">
                        <button className="gm-btn-ghost" onClick={() => { obtenerPedidos(); obtenerMesas(); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            ACTUALIZAR
                        </button>
                    </div>
                </div>

                {/* ── Stats bar ────────────────────────────────────────── */}
                <div className="gm-stats-bar">
                    <div className="gm-stat">
                        <span className="gm-stat-value">{MesasData.length}</span>
                        <span className="gm-stat-label">TOTAL</span>
                    </div>
                    <div className="gm-stat-divider" />
                    <div className="gm-stat gm-stat--libre">
                        <span className="gm-stat-value">{MesasData.length - Pedidos.length}</span>
                        <span className="gm-stat-label">LIBRES</span>
                    </div>
                    <div className="gm-stat-divider" />
                    <div className="gm-stat gm-stat--ocupada">
                        <span className="gm-stat-value">{Pedidos.length}</span>
                        <span className="gm-stat-label">OCUPADAS</span>
                    </div>
                </div>

                {/* ── Mesa grid ────────────────────────────────────────── */}
                <div className="gm-contenido">
                    {MesasData.length > 0 ? MesasData.map((mesa) => {
                        const tienePedido = Pedidos.some(p => p.mesa.id === mesa.id);
                        const pedidoMesa = Pedidos.find(p => p.mesa.id === mesa.id);
                        return (
                            <div key={mesa.id} className={`gm-mesa ${tienePedido ? 'gm-mesa--ocupada' : 'gm-mesa--libre'}`}>
                                {/* Top row: badge + quick actions */}
                                <div className="gm-mesa-top">
                                    <span className={`gm-mesa-badge ${tienePedido ? 'gm-mesa-badge--ocupada' : 'gm-mesa-badge--libre'}`}>
                                        {tienePedido ? 'OCUPADA' : 'LIBRE'}
                                    </span>
                                    <div className="gm-mesa-quick">
                                        <button className="gm-mesa-icon-btn" onClick={() => abrirModalIE()} title="Registrar propina">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                                <path d="M12 5v2" /><path d="M17 7l-1.4 1.4" /><path d="M19 12h-2" />
                                                <path d="M17 17l-1.4 -1.4" /><path d="M12 17v2" />
                                                <path d="M7 17l1.4 -1.4" /><path d="M5 12h2" /><path d="M7 7l1.4 1.4" />
                                            </svg>
                                        </button>
                                        <button className="gm-mesa-icon-btn" onClick={() => abrirMdeudor(mesa)} title="Registrar deudor">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                                                <path d="M16 19h6" /><path d="M19 16v6" />
                                                <path d="M6 21a6 6 0 0 1 9.156 -5.154" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Center: number + total */}
                                <button className="gm-mesa-body" onClick={() => AbrirMD(mesa)}>
                                    <span className="gm-mesa-numero">#{mesa.numero}</span>
                                    {tienePedido && pedidoMesa ? (
                                        <span className="gm-mesa-total">${parseFloat(pedidoMesa.total).toFixed(2)}</span>
                                    ) : (
                                        <span className="gm-mesa-libre-hint">Sin pedido</span>
                                    )}
                                </button>

                                {/* Footer: detail button */}
                                <div className="gm-mesa-footer">
                                    <button
                                        className={`gm-mesa-detail-btn ${tienePedido ? 'gm-mesa-detail-btn--ocupada' : ''}`}
                                        onClick={() => AbrirMD(mesa)}
                                    >
                                        {tienePedido ? 'Ver pedido' : 'Ver detalle'}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 6l6 6l-6 6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="gm-empty-mesas">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-4z" />
                                <path d="M3 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-4z" />
                                <path d="M15 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-4z" />
                                <path d="M9 15h6" />
                            </svg>
                            <p>No hay mesas configuradas</p>
                        </div>
                    )}
                </div>

                {/* ── Modal Detalle ─────────────────────────────────────── */}
                {ModalDetalle && mesaSeleccionada && (
                    <div className="gm-modal-d" onClick={CerrarMD}>
                        <div className="gm-modal-content" onClick={e => e.stopPropagation()}>

                            <div className="gm-modal-header">
                                <div className="gm-modal-header-left">
                                    <span className="gm-modal-mesa-label">MESA</span>
                                    <span className="gm-modal-mesa-num">#{mesaSeleccionada.numero}</span>
                                    {Pedidos.some(p => p.mesa.id === mesaSeleccionada.id) && (
                                        <span className="gm-mesa-badge gm-mesa-badge--ocupada">OCUPADA</span>
                                    )}
                                </div>
                                <button className="gm-close-btn" onClick={CerrarMD}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="gm-modal-body">
                                {Pedidos.filter(p => p.mesa.id === mesaSeleccionada.id).length === 0 ? (
                                    <div className="gm-modal-empty">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                            <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                            <path d="M17 17h-11v-14h-2" />
                                            <path d="M6 5l14 1l-1 7h-13" />
                                        </svg>
                                        <p>Esta mesa no tiene pedidos activos</p>
                                    </div>
                                ) : (
                                    Pedidos.filter(p => p.mesa.id === mesaSeleccionada.id).map(pedido => (
                                        <div key={pedido.id} className="gm-pedido">
                                            <div className="gm-pedido-header">
                                                <div className="gm-pedido-header-left">
                                                    <span className="gm-pedido-estado">{pedido.estado}</span>
                                                    <button className="gm-btn-agregar" onClick={() => AbrirMA(pedido.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 5l0 14" /><path d="M5 12l14 0" />
                                                        </svg>
                                                        Agregar productos
                                                    </button>
                                                </div>
                                                <span className="gm-pedido-total">${parseFloat(pedido.total).toFixed(2)}</span>
                                            </div>

                                            <div className="gm-detalle-header">
                                                <span>Producto</span>
                                                <span>Cant.</span>
                                                <span>Subtotal</span>
                                            </div>

                                            {pedido.detalles.map(d => (
                                                <div key={d.id} className="gm-detalle-row">
                                                    <span>{d.producto.nombre}</span>
                                                    <span>{d.cantidad}</span>
                                                    <span>${d.subtotal}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>

                            {Pedidos.some(p => p.mesa.id === mesaSeleccionada.id) && (
                                <div className="gm-modal-payment">
                                    <div className="gm-payment-total">
                                        <span className="gm-payment-total-label">TOTAL DEL PEDIDO</span>
                                        <span className="gm-payment-total-value">${calcularTotal().toFixed(2)}</span>
                                    </div>

                                    <div className="gm-pay-row">
                                        <label className="gm-pay-label">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M6 5h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
                                            </svg>
                                            Pago del cliente
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="gm-pay-input"
                                            value={pago}
                                            onChange={e => { const v = e.target.value; setPago(v); devolucion(v); }}
                                        />
                                    </div>

                                    {devuelta !== "" && (
                                        <div className={`gm-pay-row gm-pay-row--result ${Tdevuelve === "Falta" ? "gm-pay-row--falta" : "gm-pay-row--devuelve"}`}>
                                            <span className="gm-pay-label">
                                                {Tdevuelve === "Falta" ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 9v4" />
                                                        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                                                        <path d="M12 16h.01" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                        <path d="M5 12l5 5l10 -10" />
                                                    </svg>
                                                )}
                                                {Tdevuelve === "Falta" ? "Falta" : "Devuelve"}
                                            </span>
                                            <input type="text" className="gm-pay-input gm-pay-input--result" value={devuelta} readOnly />
                                        </div>
                                    )}

                                    <div className="gm-modal-actions">
                                        <button className="gm-btn gm-btn--cancelar" onClick={CerrarMD}>CANCELAR</button>
                                        <button className="gm-btn gm-btn--vender" onClick={vender}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M5 12l5 5l10 -10" />
                                            </svg>
                                            CONFIRMAR PAGO
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Modal Agregar ─────────────────────────────────────── */}
                {ModalAgregar && pedidoId && mesaSeleccionada && (
                    <div className="gm-modal-ap" onClick={CerrarMA}>
                        <div className="gm-cart-panel" onClick={e => e.stopPropagation()}>

                            <div className="gm-cart-header">
                                <div>
                                    <p className="gm-cart-title">AGREGAR PRODUCTOS</p>
                                    <p className="gm-cart-mesa-label">Mesa #{mesaSeleccionada.numero}</p>
                                </div>
                                <button className="gm-close-btn" onClick={CerrarMA}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="gm-input-bar">
                                <div className="gm-search-group">
                                    <label className="gm-label">Producto</label>
                                    <div className="gm-search-wrap">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                                            <path d="M21 21l-6 -6" />
                                        </svg>
                                        <input type="text" className="gm-input" value={busqueda} placeholder="Buscar producto..." onChange={e => handleBusqueda(e.target.value)} />
                                    </div>
                                    {sugerencia.length > 0 && (
                                        <div className="gm-suggestions">
                                            {sugerencia.map(producto => (
                                                <div key={producto.id} className="gm-suggestion-item" onClick={() => handleSeleccionarProducto(producto)}>
                                                    <span className="gm-sug-name">{producto.nombre}</span>
                                                    <span className="gm-sug-stock">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
                                                            <path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" />
                                                        </svg>
                                                        {producto.cantidad_actual}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="gm-qty-group">
                                    <label className="gm-label">Cantidad</label>
                                    <input type="text" className="gm-input gm-input--qty" value={cantidad} onChange={handlechange} />
                                </div>
                                <button className="gm-btn gm-btn--add" onClick={AgregarProducto}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                        <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                        <path d="M17 17h-11v-14h-2" />
                                        <path d="M6 5l14 1l-1 7h-13" />
                                    </svg>
                                    Agregar
                                </button>
                            </div>

                            <div className="gm-table-wrap">
                                <table className="gm-table">
                                    <thead className="gm-thead">
                                        <tr>
                                            <th className="gm-th gm-th--idx">#</th>
                                            <th className="gm-th">Producto</th>
                                            <th className="gm-th gm-th--center">Cantidad</th>
                                            <th className="gm-th gm-th--right">Precio</th>
                                            <th className="gm-th gm-th--right">Subtotal</th>
                                            <th className="gm-th gm-th--right">Total</th>
                                            <th className="gm-th gm-th--del"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosSeleccionados.map((p, i) => (
                                            <tr key={p.id} className="gm-tr">
                                                <td className="gm-td gm-td--idx">{i + 1}</td>
                                                <td className="gm-td gm-td--name">{p.nombre}</td>
                                                <td className="gm-td gm-td--center">
                                                    <div className="gm-qty-ctrl">
                                                        <button className="gm-qty-btn" onClick={() => actualizarCantidad(p.id, "restar")}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l14 0" />
                                                            </svg>
                                                        </button>
                                                        <input type="number" className="gm-qty-val" value={p.cantidad} readOnly />
                                                        <button className="gm-qty-btn" onClick={() => actualizarCantidad(p.id, "sumar")}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                                <path d="M12 5l0 14" /><path d="M5 12l14 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="gm-td gm-td--right gm-td--price">${p.Precio}</td>
                                                <td className="gm-td gm-td--right">${p.subtotal}</td>
                                                <td className="gm-td gm-td--right gm-td--total">${p.total}</td>
                                                <td className="gm-td gm-td--del">
                                                    <button className="gm-del-btn" onClick={() => eliminarP(p.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M4 7h16" />
                                                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                                            <path d="M10 12l4 4m0 -4l-4 4" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {productosSeleccionados.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="gm-td gm-td--empty">
                                                    <div className="gm-empty-state">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                                            <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                                            <path d="M17 17h-11v-14h-2" />
                                                            <path d="M6 5l14 1l-1 7h-13" />
                                                        </svg>
                                                        <span>Agrega productos para comenzar</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="gm-cart-footer">
                                <button className="gm-btn gm-btn--cancelar" onClick={CerrarMA}>CANCELAR</button>
                                <button className="gm-btn gm-btn--vender" onClick={() => enviarProductosPedido(pedidoId)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M10 14l11 -11" />
                                        <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                                    </svg>
                                    AGREGAR AL PEDIDO
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Modal Propina ─────────────────────────────────────── */}
                {ModalIE && (
                    <div className="gm-overlay" onClick={cerrarModalIE}>
                        <div className="gm-modal" onClick={e => e.stopPropagation()}>
                            <span className="gm-corner gm-corner--tl"></span>
                            <span className="gm-corner gm-corner--br"></span>
                            <div className="gm-modal-header">
                                <p className="gm-modal-title">NUEVA PROPINA</p>
                                <button className="gm-close-btn" onClick={cerrarModalIE}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form className="gm-form" onSubmit={handleSubmit}>
                                <div className="gm-field">
                                    <label className="gm-label">Valor de la propina</label>
                                    <input className="gm-input" type="number" placeholder="Valor en pesos" name="ganancia" value={datosForm.ganancia} onChange={handleChange} min="0" step="0.01" />
                                </div>
                                {error && <p className="gm-error">{error}</p>}
                                <div className="gm-modal-footer">
                                    <button type="button" className="gm-btn gm-btn--ghost" onClick={cerrarModalIE}>CANCELAR</button>
                                    <button type="submit" className="gm-btn gm-btn--verde">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12l5 5l10 -10" />
                                        </svg>
                                        GUARDAR
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Modal Deudor ──────────────────────────────────────── */}
                {ModalDeudor && (
                    <div className="de-overlay-gm" onClick={cerrarMdeudor}>
                        <div className="de-modal-gm" onClick={e => e.stopPropagation()}>
                            <span className="de-corner de-corner--tl-gm"></span>
                            <span className="de-corner de-corner--br-gm"></span>
                            <div className="de-modal-header-gm">
                                <p className="de-modal-title-gm">REGISTRAR NUEVO DEUDOR</p>
                                <button className="de-close-btn-gm" onClick={cerrarMdeudor}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6l-12 12" /><path d="M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form className="de-form-gm" onSubmit={handleSubmitD}>
                                <div className="de-field-gm">
                                    <label className="de-label-gm">Nombre completo</label>
                                    <input className="de-input-gm" type="text" placeholder="Ej: Juan Pérez" name="nombre" value={datosFormD.nombre} onChange={handleChangeD} />
                                </div>
                                <div className="de-field-gm">
                                    <label className="de-label-gm">Celular</label>
                                    <input className="de-input-gm" type="tel" placeholder="Número de celular" name="celular" value={datosFormD.celular} onChange={handleChangeD} />
                                </div>
                                <div className="de-field-gm">
                                    <label className="de-label-gm">Deuda ($)</label>
                                    {pedidoDeMesa && <input className="de-input-gm" value={pedidoDeMesa.total} readOnly />}
                                </div>
                                <div className="de-field--toggle-gm">
                                    <span className="de-label-gm">Autorizado</span>
                                    <label className="de-toggle-gm">
                                        <input type="checkbox" name="autorizacion" checked={datosFormD.autorizacion} onChange={handleChangeD} className="de-toggle-input-gm" />
                                        <span className="de-toggle-track-gm">
                                            <span className="de-toggle-thumb-gm"></span>
                                        </span>
                                        <span className="de-toggle-text-gm">{datosFormD.autorizacion ? "SÍ" : "NO"}</span>
                                    </label>
                                </div>
                                {errorD && <p className="de-error-gm">{errorD}</p>}
                                <div className="de-modal-footer-gm">
                                    <button type="button" className="de-btn de-btn--ghost" onClick={cerrarMdeudor}>CANCELAR</button>
                                    <button type="submit" className="de-btn de-btn--verde">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12l5 5l10 -10" />
                                        </svg>
                                        GUARDAR
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </>
    );
};

export default GestionMesas;
