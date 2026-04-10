import "../styles/Home.css";
import React, { useState, useEffect, useRef } from "react";
import { consultaInventario, consultaExistencias } from "../js/inventario";
import { PrefetchPageLinks } from "react-router-dom";
import { venderProducto } from "../js/venta";
import { ToastContainer, toast } from "react-toastify";
import ImprimirFacturaPOS from "../components/imprimirFactura";
import Print from "../components/imprimirFactura";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [sugerencia, setSugerencia] = useState([]);
  const [existencias, setExistencias] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [devuelta, setDevuelta] = useState("");
  const [ventaActual, setVentaActual] = useState(null);
  const printRef = useRef();

  const [pago, setPago] = useState(0);
  const [Tdevuelve, setTdevuelve] = useState("--");

  const handlechange = (e) => {
    const valor = e.target.value;
    if (/^-?\d*$/.test(valor)) {
      setCantidad(valor);
    } else {
      alert("Por favor, ingresa un número válido");
    }
  };

  const cancelarPago = () => {
    exito("Venta cancelada con exito");
    setProductosSeleccionados([]);
    setPago(0);
    setDevuelta("");
    setBusqueda("");
    setCantidad("");
  };

  const exito = (texto) => {
    toast.success(texto);
  };

  const vender = async () => {
    if (pago < calcularTotal()) {
      alert("El pago es insuficiente");
      return;
    }
    if (productosSeleccionados.length === 0) {
      alert("No hay productos seleccionados para vender.");
      return;
    }
    const ahoraUTC = new Date();
    const ahoraColombia = new Date(ahoraUTC.getTime() - 5 * 60 * 60 * 1000);
    const [fecha, hora] = ahoraColombia.toISOString().split("T");

    const data = {
      fecha: ahoraUTC,
      devuelta: parseFloat(devuelta) || 0,
      detallesVentas: productosSeleccionados.map((p) => ({
        idproducto: p.id,
        subtotal: p.Precio,
        cantidad: p.cantidad,
      })),
    };

    try {
      const respuesta = await venderProducto(data);
      if (respuesta.status === 201) {
        const ventaCompleta = {
          id: respuesta.data?.id || Date.now(),
          fecha: fecha,
          hora: hora.split(".")[0],
          total: calcularTotal(),
          pago: parseFloat(pago) || 0,
          devuelta: parseFloat(devuelta) || 0,
          detallesVentas: productosSeleccionados.map((p) => ({
            id: p.id,
            cantidad: p.cantidad,
            subtotal: p.Precio * p.cantidad,
            producto: { nombre: p.nombre, precio: p.Precio },
          })),
        };

        exito("Venta realizada con éxito");
        setVentaActual(ventaCompleta);
        setTimeout(() => {
          printRef.current?.print();
        }, 300);

        setTimeout(() => {
          setProductosSeleccionados([]);
          setPago(0);
          setDevuelta("");
          setBusqueda("");
          setCantidad("");
          consultaExistencias();
        }, 1000);
      } else {
        alert("Error al realizar la venta");
      }
    } catch (error) {
      console.error("Error al realizar la venta:", error.response?.data);
      alert("Error al realizar la venta. Por favor, inténtelo de nuevo.");
    }
  };

  const devolucion = (valor) => {
    const total = calcularTotal();
    const pagoNumero = Number(valor);
    if (isNaN(pagoNumero) || pagoNumero < total) {
      setTdevuelve("Falta");
      setDevuelta((pagoNumero - total).toFixed(2));
      return;
    } else {
      setTdevuelve("Devuelve");
      setDevuelta((pagoNumero - total).toFixed(2));
    }
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce(
      (total, producto) => total + producto.total,
      0
    );
  };

  const eliminarP = (id) => {
    const nuevosP = productosSeleccionados.filter((p) => p.id !== id);
    setProductosSeleccionados(nuevosP);
  };

  const actualizarCantidad = (id, operacion) => {
    const nuevosP = productosSeleccionados.map((p) => {
      if (p.id === id) {
        let cantidadActual = Number(p.cantidad);
        let cantidadNueva =
          operacion === "sumar" ? cantidadActual + 1 : cantidadActual - 1;
        if (cantidadNueva < 1) cantidadNueva = 1;
        const nuevoSubtotal = p.Precio * cantidadNueva;
        const nuevoTotal = p.Precio * cantidadNueva;
        return { ...p, cantidad: cantidadNueva, subtotal: nuevoSubtotal, total: nuevoTotal };
      }
      return p;
    });
    setProductosSeleccionados(nuevosP);
  };

  const ConsultarProductos = async () => {
    try {
      const data = await consultaInventario();
      if (Array.isArray(data)) setProductos(data);
    } catch (error) {
      console.error("Error al consultar productos:", error);
    }
  };

  const obtenerExistencias = async () => {
    try {
      const data = await consultaExistencias();
      if (Array.isArray(data)) {
        setExistencias(data);
      } else {
        setError("Error al acceder a las Existencias de los productos porximos a terminar");
        console.error("Respuesta inesperada:", data);
      }
    } catch (err) {
      setError("Error al acceder a las Existencias de los productos porximos a terminar");
      console.error("Error en la consulta:", err);
    }
  };

  useEffect(() => {
    ConsultarProductos();
    obtenerExistencias();
  }, []);

  const handleBusqueda = (texto) => {
    setBusqueda(texto);
    const filtracion = productos.filter((p) =>
      p.nombre.toLowerCase().includes(texto.toLowerCase())
    );
    setSugerencia(filtracion);
  };

  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setBusqueda(producto.nombre);
    setSugerencia([]);
  };

  const AgregarProducto = () => {
    if (productoSeleccionado && cantidad > 0) {
      const Existe = productosSeleccionados.find(
        (p) => p.id === productoSeleccionado.id
      );
      if (Existe) {
        alert("El producto ya está en la lista");
        return;
      }
      const nuevo = {
        id: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        Precio: productoSeleccionado.precio,
        cantidad: cantidad,
        subtotal: productoSeleccionado.precio * cantidad,
        total: productoSeleccionado.precio * cantidad,
      };
      setProductosSeleccionados([...productosSeleccionados, nuevo]);
      setCantidad(0);
      setProductoSeleccionado(null);
      setSugerencia([]);
      setBusqueda("");
    } else {
      alert("Por favor, selecciona un producto y una cantidad válida.");
    }
  };

  console.log("esta es la sugerencia", sugerencia);

  const [noti, setNoti] = useState(false);
  const [condicion, setCondicion] = useState(false);

  useEffect(() => {
    if (existencias.length === 0) setCondicion(false);
    else setCondicion(true);
  }, [existencias]);

  const verNoti = () => setNoti(true);
  const ocultarNoti = () => setNoti(false);

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="hm-page">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="hm-header">
        <div className="hm-header-accent" />
        <div className="hm-header-content">
          <h1 className="hm-title">VENTAS</h1>
          <p className="hm-subtitle">Punto de venta — registro de transacciones</p>
        </div>
        <div className="hm-header-actions">
          {/* Ventas por mesas — próximo módulo */}
          <button className="hm-btn hm-btn--mesas" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 10v8l7 -3v-2.6z" />
              <path d="M3 6l9 3l9 -3l-9 -3z" />
              <path d="M14 12.3v8.7l7 -3v-8z" />
            </svg>
            <span>Ventas por Mesas</span>
            <span className="hm-soon-badge">PRÓXIMO</span>
          </button>

          {/* Stock alert bell */}
          {condicion && (
            <button className="hm-alert-btn" onClick={verNoti} title="Productos con stock bajo">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                <path d="M12 16h.01" />
              </svg>
              <span className="hm-alert-count">{existencias.length}</span>
            </button>
          )}

          <span className="hm-header-badge">POS</span>
        </div>
      </div>

      {/* ── POS Body ────────────────────────────────────────── */}
      <div className="hm-pos">

        {/* ── Cart Panel ───────────────────────────────────── */}
        <div className="hm-cart-panel">

          {/* Input bar */}
          <div className="hm-input-bar">
            {/* Product search */}
            <div className="hm-search-group">
              <label className="hm-label">Producto</label>
              <div className="hm-search-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                  <path d="M21 21l-6 -6" />
                </svg>
                <input
                  type="text"
                  className="hm-input"
                  value={busqueda}
                  placeholder="Buscar producto..."
                  onChange={(e) => handleBusqueda(e.target.value)}
                />
              </div>
              {sugerencia.length > 0 && (
                <div className="hm-suggestions">
                  {sugerencia.map((producto) => (
                    <div
                      key={producto.id}
                      className="hm-suggestion-item"
                      onClick={() => handleSeleccionarProducto(producto)}
                    >
                      <span className="hm-sug-name">{producto.nombre}</span>
                      <span className="hm-sug-stock">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
                          <path d="M12 12l8 -4.5" />
                          <path d="M12 12l0 9" />
                          <path d="M12 12l-8 -4.5" />
                        </svg>
                        {producto.cantidad_actual}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="hm-qty-group">
              <label className="hm-label">Cantidad</label>
              <input
                type="text"
                className="hm-input hm-input--qty"
                value={cantidad}
                onChange={(e) => handlechange(e)}
              />
            </div>

            {/* Add button */}
            <button className="hm-btn hm-btn--add" onClick={AgregarProducto}>
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

          {/* Cart table */}
          <div className="hm-table-wrap">
            <table className="hm-table">
              <thead className="hm-thead">
                <tr>
                  <th className="hm-th hm-th--idx">#</th>
                  <th className="hm-th">Producto</th>
                  <th className="hm-th hm-th--center">Cantidad</th>
                  <th className="hm-th hm-th--right">Precio</th>
                  <th className="hm-th hm-th--right">Subtotal</th>
                  <th className="hm-th hm-th--right">Total</th>
                  <th className="hm-th hm-th--del"></th>
                </tr>
              </thead>
              <tbody>
                {productosSeleccionados.map((p, i) => (
                  <tr key={p.id} className="hm-tr">
                    <td className="hm-td hm-td--idx">{i + 1}</td>
                    <td className="hm-td hm-td--name">{p.nombre}</td>
                    <td className="hm-td hm-td--center">
                      <div className="hm-qty-ctrl">
                        <button
                          className="hm-qty-btn"
                          onClick={() => actualizarCantidad(p.id, "restar")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 12l14 0" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          className="hm-qty-val"
                          value={p.cantidad}
                          readOnly
                        />
                        <button
                          className="hm-qty-btn"
                          onClick={() => actualizarCantidad(p.id, "sumar")}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 5l0 14" />
                            <path d="M5 12l14 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="hm-td hm-td--right hm-td--price">${p.Precio}</td>
                    <td className="hm-td hm-td--right">${p.subtotal}</td>
                    <td className="hm-td hm-td--right hm-td--total">${p.total}</td>
                    <td className="hm-td hm-td--del">
                      <button className="hm-del-btn" onClick={() => eliminarP(p.id)}>
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
                    <td colSpan={7} className="hm-td hm-td--empty">
                      <div className="hm-empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                          <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                          <path d="M17 17h-11v-14h-2" />
                          <path d="M6 5l14 1l-1 7h-13" />
                        </svg>
                        <span>Agrega productos para comenzar una venta</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Payment Panel ────────────────────────────────── */}
        <div className="hm-payment-panel">
          <div className="hm-payment-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" />
              <path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5m2 0v1.5m0 -9v1.5" />
            </svg>
            <span>Resumen de Pago</span>
          </div>

          <div className="hm-payment-total-display">
            <span className="hm-payment-total-label">TOTAL</span>
            <span className="hm-payment-total-value">${calcularTotal().toFixed(2)}</span>
            <span className="hm-payment-items-count">{productosSeleccionados.length} producto{productosSeleccionados.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="hm-payment-divider" />

          <div className="hm-payment-fields">
            <div className="hm-pay-row">
              <label className="hm-pay-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M6 5h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2" />
                </svg>
                Pago del cliente
              </label>
              <input
                type="number"
                min="0"
                className="hm-pay-input"
                value={pago}
                onChange={(e) => {
                  const valor = e.target.value;
                  setPago(valor);
                  devolucion(valor);
                }}
              />
            </div>

            {devuelta !== "" && (
              <div className={`hm-pay-row hm-pay-row--result ${Tdevuelve === "Falta" ? "hm-pay-row--falta" : "hm-pay-row--devuelve"}`}>
                <span className="hm-pay-label">
                  {Tdevuelve === "Falta" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l5 5l10 -10" />
                    </svg>
                  )}
                  {Tdevuelve === "Falta" ? "Falta" : "Devuelve"}
                </span>
                <input
                  type="text"
                  className="hm-pay-input hm-pay-input--result"
                  value={devuelta}
                  readOnly
                />
              </div>
            )}
          </div>

          <div className="hm-payment-actions">
            <button className="hm-btn hm-btn--vender" onClick={() => vender()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12l5 5l10 -10" />
              </svg>
              Confirmar Venta
            </button>
            <button className="hm-btn hm-btn--cancelar" onClick={() => cancelarPago()}>
              Cancelar
            </button>
          </div>

          {ventaActual && (
            <ImprimirFacturaPOS ref={printRef} venta={ventaActual} />
          )}
          <ToastContainer position="top-center" autoClose={3000} />
        </div>
      </div>

      {/* ── Stock Notification Modal ─────────────────────── */}
      {noti && (
        <div className="hm-overlay" onClick={ocultarNoti}>
          <div className="hm-noti-panel" onClick={(e) => e.stopPropagation()}>
            <div className="hm-noti-corner hm-noti-corner--tl" />
            <div className="hm-noti-corner hm-noti-corner--br" />
            <div className="hm-noti-header">
              <div className="hm-noti-title-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4" />
                  <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                  <path d="M12 16h.01" />
                </svg>
                <h2 className="hm-noti-title">Stock Bajo</h2>
              </div>
              <button className="hm-noti-close" onClick={ocultarNoti}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="hm-noti-subtitle">Productos próximos a agotarse</p>
            <div className="hm-noti-body">
              {existencias.map((producto) => (
                <div className="hm-noti-item" key={producto.producto.id}>
                  <span className="hm-noti-name">{producto.producto.nombre}</span>
                  <span className="hm-noti-qty">{producto.producto.cantidad_actual}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
