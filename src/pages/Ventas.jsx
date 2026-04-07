// src/pages/Ventas.jsx
import { useState, useEffect, useRef, createRef } from "react";
import "../styles/Ventas.css";
import Button from "../components/Button";
import { ConsultarVentas } from "../js/ventas.js";
import { consultaMesas } from "../js/mesa.js";
import Select from "react-select";
import ImprimirFacturaPOS from "../components/imprimirFactura";

const Ventas = () => {
  const [ventasData, setventasData] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [Panel, setPanel] = useState(false);
  const [VentaSeleccionada, setVentaSeleccionada] = useState(null);
  const [Filtracion, setFiltracion] = useState(false);
  const [SelectAll, setSelectAll] = useState(false);
  const [Seleccionados, setSeleccionados] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const printRefs = useRef({});
  const [descargarTodo, setDescargarTodo] = useState(false);
  const [Total, setTotal] = useState(0);
  const [mesasData, setMesasData] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState("");

  const getPrintRef = (id) => {
    if (!printRefs.current[id]) {
      printRefs.current[id] = createRef();
    }
    return printRefs.current[id];
  };

  useEffect(() => {
    const totalCalculado = ventasFiltradas
      .filter((venta) => Seleccionados.includes(venta.id))
      .reduce((acc, venta) => acc + Number(venta.total), 0);
    setTotal(totalCalculado);
    if (Seleccionados.length > 1) {
      setDescargarTodo(true);
    } else {
      setDescargarTodo(false);
    }
  }, [Seleccionados, ventasFiltradas]);

  const handleDescargarTodo = async () => {
    if (Seleccionados.length === 0) return;

    const ventasSeleccionadas = ventasFiltradas.filter((v) =>
      Seleccionados.includes(v.id),
    );

    for (const venta of ventasSeleccionadas) {
      const ref = getPrintRef(venta.id);

      await new Promise((resolve) => {
        ref.current?.print(resolve);
      });
    }
  };

  const regitroVentas = async () => {
    try {
      const response = await ConsultarVentas();
      if (Array.isArray(response)) {
        setventasData(response);
        setVentasFiltradas(response);
      } else {
        setError("Error: formato inesperado en ventas");
        console.error("Respuesta inesperada:", response);
      }
    } catch (err) {
      setError("Error al consultar las ventas");
      console.error("Error en la consulta:", err);
    } finally {
      setCargando(false);
    }
  };

  const registroMesas = async () => {
    try {
      const response = await consultaMesas();
      if (Array.isArray(response.data)) {
        setMesasData(response.data);
      } else {
        setError("Error: formato inesperado en mesas");
        console.error("Respuesta inesperada:", response);
      }
    } catch (err) {
      setError("Error al consultar las ventas");
      console.error("Error en la consulta:", err);
    } finally {
      setCargando(false);
    }
  };
  console.log("MesasData:", mesasData);

  const DetallesVenta = (Venta) => {
    console.log(Venta);
    setVentaSeleccionada(Venta);
    setPanel(true);
  };

  const CambioSeleccion = (id) => {
    setSeleccionados(
      (items) =>
        items.includes(id)
          ? items.filter((item) => item !== id)
          : [...items, id],
    );
  };

  const imprimirVenta = () => {
    if (!VentaSeleccionada) return;

    const ref = getPrintRef(VentaSeleccionada.id);
    setTimeout(() => {
      ref.current?.print();
    }, 200);
  };

  const aplicarFiltroFechas = () => {
    const inicio = fechaDesde ? new Date(fechaDesde) : null;
    const fin = fechaHasta ? new Date(fechaHasta) : null;
    if (fin) fin.setHours(23, 59, 59, 999);

    const resultado = ventasData.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const dentroFecha =
        (!inicio || fechaVenta >= inicio) && (!fin || fechaVenta <= fin);
      const coincideMesa =
        mesaSeleccionada === "" || venta.mesa?.id == mesaSeleccionada;

      return dentroFecha && coincideMesa;
    });

    setVentasFiltradas(resultado);
    setSeleccionados([]);
    setSelectAll(false);
    setFiltracion(false);
  };

  const filtrarPorRango = (inicio, fin) => {
    const resultado = ventasData.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      const dentroFecha = fechaVenta >= inicio && fechaVenta <= fin;
      const coincideMesa =
        mesaSeleccionada === "" || venta.mesa?.id == mesaSeleccionada;

      return dentroFecha && coincideMesa;
    });

    setVentasFiltradas(resultado);
    setSeleccionados([]);
    setSelectAll(false);
    setFiltracion(false);
  };

  const filtroHoy = () => {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(hoy);
    fin.setHours(23, 59, 59, 999);
    filtrarPorRango(inicio, fin);
  };

  const filtroAyer = () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const inicio = new Date(ayer);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(ayer);
    fin.setHours(23, 59, 59, 999);
    filtrarPorRango(inicio, fin);
  };

  const filtroUltimos7Dias = () => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - 6);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    filtrarPorRango(inicio, fin);
  };

  const filtroEsteMes = () => {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    filtrarPorRango(inicio, fin);
  };

  const filtroMesPasado = () => {
    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    fin.setHours(23, 59, 59, 999);
    filtrarPorRango(inicio, fin);
  };

  const mostrarTodo = () => {
    setVentasFiltradas(ventasData);
    setFechaDesde("");
    setFechaHasta("");
    setMesaSeleccionada("");
    setSeleccionados([]);
    setSelectAll(false);
    setFiltracion(false);
  };

  console.log("esto es lo que agrega el state", Seleccionados);

  useEffect(() => {
    regitroVentas();
    registroMesas();
  }, []);

  if (cargando) {
    return (
      <div className="vt-loading">
        <div className="vt-loader"></div>
        <p className="vt-loading-text">CARGANDO VENTAS...</p>
      </div>
    );
  }

  return (
    <section className="vt-page">

      {/* Componentes de impresión ocultos */}
      {ventasFiltradas.map((v) => (
        <ImprimirFacturaPOS key={v.id} ref={getPrintRef(v.id)} venta={v} />
      ))}

      {/* ── Header ── */}
      <div className="vt-header">
        <div className="vt-header-left">
          <div className="vt-status">
            <span className="vt-status-dot"></span>
            <span className="vt-status-text">REGISTRO ACTIVO</span>
          </div>
          <h1 className="vt-title">VENTAS</h1>
        </div>
      </div>

      {error && <p className="vt-error">{error}</p>}

      {/* ── Toolbar ── */}
      <div className="vt-toolbar">
        <div className="vt-toolbar-left">
          <button
            className="vt-btn vt-btn--ghost"
            onClick={() => setFiltracion(!Filtracion)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M16 2c.183 0 .355 .05 .502 .135l.033 .02c.28 .177 .465 .49 .465 .845v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 .514 -.874l.093 -.046l.066 -.025l.1 -.029l.107 -.019l.12 -.007q .083 0 .161 .013l.122 .029l.04 .012l.06 .023c.328 .135 .568 .44 .61 .806l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16z" />
              <path d="M9.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
              <path d="M13.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
              <path d="M17.02 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
              <path d="M12.02 15a1 1 0 0 1 0 2a1.001 1.001 0 1 1 -.005 -2z" />
              <path d="M9.015 16a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
            </svg>
            FILTRAR VENTAS
          </button>
        </div>

        <div className="vt-toolbar-right">
          {descargarTodo && (
            <button className="vt-btn vt-btn--verde" onClick={handleDescargarTodo}>
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
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 11l5 5l5 -5" />
                <path d="M12 4l0 12" />
              </svg>
              DESCARGAR TODO
            </button>
          )}
          <div className="vt-total-badge">
            <span className="vt-total-label">SELECCIÓN</span>
            <span className="vt-total-value">${Total}</span>
          </div>
        </div>
      </div>

      {/* ── Info bar ── */}
      <div className="vt-info-bar">
        <span className="vt-info-count">
          <span className="vt-info-num">{ventasFiltradas.length}</span> de{" "}
          {ventasData.length} ventas
        </span>
        {Seleccionados.length > 0 && (
          <span className="vt-sel-badge">
            {Seleccionados.length} seleccionada(s)
          </span>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="vt-table-panel">
        <div className="vt-table-wrap">
          <table className="vt-table">
            <thead>
              <tr>
                <th className="vt-th vt-th--check">
                  <input
                    className="vt-checkbox"
                    type="checkbox"
                    title="Seleccionar todos"
                    checked={
                      ventasFiltradas.length > 0 &&
                      ventasFiltradas.every((v) => Seleccionados.includes(v.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = ventasFiltradas.map((v) => v.id);
                        setSeleccionados(allIds);
                        setSelectAll(true);
                        setDescargarTodo(true);
                      } else {
                        setSeleccionados([]);
                        setSelectAll(false);
                        setDescargarTodo(false);
                      }
                    }}
                  />
                </th>
                <th className="vt-th vt-th--idx">#</th>
                <th className="vt-th">ID</th>
                <th className="vt-th">FECHA</th>
                <th className="vt-th">TOTAL GANANCIA</th>
                <th className="vt-th">MESA</th>
                <th className="vt-th vt-th--center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((Venta, index) => {
                const estaSeleccionado = Seleccionados.includes(Venta.id);
                return (
                  <tr
                    key={index}
                    className={`vt-tr vt-tr--clickable ${estaSeleccionado ? "vt-tr--sel" : ""}`}
                    onClick={(e) => {
                      if (["BUTTON", "INPUT"].includes(e.target.tagName)) return;
                      CambioSeleccion(Venta.id);
                    }}
                  >
                    <td className="vt-td vt-td--check">
                      <input
                        className="vt-checkbox"
                        type="checkbox"
                        checked={estaSeleccionado}
                        onChange={() => CambioSeleccion(Venta.id)}
                      />
                    </td>
                    <td className="vt-td vt-td--idx">{index + 1}</td>
                    <td className="vt-td">
                      <span className="vt-id-tag">#{Venta.id}</span>
                    </td>
                    <td className="vt-td vt-td--fecha">
                      {new Date(Venta.fecha).toLocaleString()}
                    </td>
                    <td className="vt-td">
                      <span className="vt-precio-txt">
                        <span className="vt-precio-sym">$</span>
                        {Venta.total}
                      </span>
                    </td>
                    <td className="vt-td">
                      <span className="vt-mesa-tag">
                        {Venta.mesa ? `Mesa ${Venta.mesa.numero}` : "N/A"}
                      </span>
                    </td>
                    <td className="vt-td vt-td--center">
                      <button
                        className="vt-detail-btn"
                        onClick={() => DetallesVenta(Venta)}
                      >
                        Ver más
                      </button>
                    </td>
                  </tr>
                );
              })}
              {ventasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="vt-td--empty">
                    SIN REGISTROS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Panel de detalle ── */}
      {Panel && VentaSeleccionada && (
        <div className="vt-overlay" onClick={() => setPanel(false)}>
          <div className="vt-modal" onClick={(e) => e.stopPropagation()}>
            <span className="vt-corner vt-corner--tl"></span>
            <span className="vt-corner vt-corner--br"></span>

            <div className="vt-modal-header">
              <div className="vt-modal-meta">
                <p className="vt-modal-id">VENTA #{VentaSeleccionada.id}</p>
                <p className="vt-modal-fecha">
                  {new Date(VentaSeleccionada.fecha).toLocaleString()}
                </p>
              </div>
              <div className="vt-modal-totales">
                <span className="vt-modal-total-label">TOTAL</span>
                <span className="vt-modal-total-valor">
                  ${VentaSeleccionada.total}
                </span>
                {VentaSeleccionada.devuelta != null && (
                  <div className="vt-modal-devuelta">
                    <span className="vt-modal-devuelta-label">DEVUELTA</span>
                    <span className="vt-modal-devuelta-valor">
                      ${VentaSeleccionada.devuelta}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="vt-modal-body">
              <p className="vt-modal-section-title">DETALLE DE PRODUCTOS</p>
              <ul className="vt-productos-list">
                {VentaSeleccionada.detallesVentas?.map((detalle, index) => (
                  <li key={index} className="vt-producto-item">
                    <span className="vt-producto-nombre">
                      {detalle.producto.nombre}
                    </span>
                    <span className="vt-producto-qty">×{detalle.cantidad}</span>
                    <span className="vt-producto-precio">
                      ${detalle.producto.precio}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="vt-modal-footer">
              <button className="vt-btn vt-btn--rojo" onClick={() => setPanel(false)}>
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
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 14l-4 -4l4 -4" />
                  <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
                </svg>
                CERRAR
              </button>
              <button className="vt-btn vt-btn--verde" onClick={imprimirVenta}>
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
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <path d="M7 11l5 5l5 -5" />
                  <path d="M12 4l0 12" />
                </svg>
                DESCARGAR FACTURA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Panel de filtro ── */}
      {Filtracion && (
        <div className="vt-overlay" onClick={() => setFiltracion(false)}>
          <div className="vt-filter-panel" onClick={(e) => e.stopPropagation()}>
            <span className="vt-corner vt-corner--tl"></span>
            <span className="vt-corner vt-corner--br"></span>

            <div className="vt-filter-header">
              <div className="vt-filter-title-wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ color: "#9cff93" }}
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M16 2c.183 0 .355 .05 .502 .135l.033 .02c.28 .177 .465 .49 .465 .845v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 .514 -.874l.093 -.046l.066 -.025l.1 -.029l.107 -.019l.12 -.007q .083 0 .161 .013l.122 .029l.04 .012l.06 .023c.328 .135 .568 .44 .61 .806l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16z" />
                  <path d="M9.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
                  <path d="M13.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
                  <path d="M17.02 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
                  <path d="M12.02 15a1 1 0 0 1 0 2a1.001 1.001 0 1 1 -.005 -2z" />
                  <path d="M9.015 16a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
                </svg>
                <p className="vt-filter-title">FILTRAR VENTAS</p>
              </div>
              <button className="vt-close-btn" onClick={() => setFiltracion(false)}>
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

            <div className="vt-filter-body">
              <p className="vt-filter-section-label">Acceso rápido</p>
              <div className="vt-quick-filters">
                <button className="vt-quick-btn" onClick={filtroHoy}>Hoy</button>
                <button className="vt-quick-btn" onClick={filtroAyer}>Ayer</button>
                <button className="vt-quick-btn" onClick={filtroUltimos7Dias}>7 días</button>
                <button className="vt-quick-btn" onClick={filtroEsteMes}>Este mes</button>
                <button className="vt-quick-btn" onClick={filtroMesPasado}>Mes pasado</button>
                <button className="vt-quick-btn" onClick={mostrarTodo}>Todo</button>
              </div>

              <p className="vt-filter-section-label">Rango de fechas</p>
              <div className="vt-date-range">
                <div className="vt-date-field">
                  <label className="vt-date-label">Desde</label>
                  <input
                    className="vt-date-input"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                <div className="vt-date-field">
                  <label className="vt-date-label">Hasta</label>
                  <input
                    className="vt-date-input"
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
              </div>

              <p className="vt-filter-section-label">Mesa</p>
              <select
                className="vt-select"
                value={mesaSeleccionada}
                onChange={(e) => setMesaSeleccionada(e.target.value)}
              >
                <option value="">Todas las mesas</option>
                {mesasData.map((mesa) => (
                  <option key={mesa.id} value={mesa.id}>
                    Mesa {mesa.numero}
                  </option>
                ))}
              </select>

              <button
                className="vt-btn vt-btn--verde vt-btn--full"
                onClick={aplicarFiltroFechas}
              >
                APLICAR FILTROS
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Ventas;
