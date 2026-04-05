// src/pages/Informes.jsx
import { useState, useEffect, useRef, createRef } from "react";
import "../styles/Ventas.css";
import Button from "../components/Button";
import { ConsultarVentas } from "../js/ventas.js";
import ImprimirFacturaPOS from "../components/imprimirFactura";

const Ventas = () => {
  const [ventasData, setventasData] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true); // <-- Loader activado
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
      setCargando(false); // <-- Desactivar loader cuando termina
    }
  };


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
          : // si en los items esta la id entonces devuelve el array con los items menos ese id
            [...items, id], // sino esta entonces lo añade
    );
  };

  const imprimirVenta = () => {
    if (!VentaSeleccionada) return;

    const ref = getPrintRef(VentaSeleccionada.id);
    setTimeout(() => {
      ref.current?.print();
    }, 200);
  };

  // función para mostrar todas las ventas sin filtro
  const aplicarFiltroFechas = () => {
    const inicio = fechaDesde ? new Date(fechaDesde) : null;
    const fin = fechaHasta ? new Date(fechaHasta) : null;
    if (fin) fin.setHours(23, 59, 59, 999);

    const resultado = ventasData.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      return (!inicio || fechaVenta >= inicio) && (!fin || fechaVenta <= fin);
    });

    setVentasFiltradas(resultado);
    setSeleccionados([]);
    setSelectAll(false);
    setFiltracion(false);
  };

  const filtrarPorRango = (inicio, fin) => {
    const resultado = ventasData.filter((venta) => {
      const fechaVenta = new Date(venta.fecha);
      return fechaVenta >= inicio && fechaVenta <= fin;
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

    // reset selección
    setSeleccionados([]);
    setSelectAll(false);
    setFiltracion(false);
  };

  useEffect(() => {
    regitroVentas();
  }, []);

  //console.log("Ventas cargadas:", ventasData);

  if (cargando) {
    return (
      <div className="modal-cargando-ve">
        <div className="modal-contenido-ve">
          <div className="loader-ve"></div>
        </div>
      </div>
    );
  }

  // ✔ Si ya cargó, se muestra la tabla
  return (
    <section className="Ventas">
      <div className="superior">
        <h1>VENTAS</h1>
        <div className="ventas-titulo-linea" />

        <div className="superiorBotones">
          <div
            className="BotonFiltro"
            onClick={() => setFiltracion(!Filtracion)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon icon-tabler icons-tabler-filled icon-tabler-calendar-week"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M16 2c.183 0 .355 .05 .502 .135l.033 .02c.28 .177 .465 .49 .465 .845v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 .514 -.874l.093 -.046l.066 -.025l.1 -.029l.107 -.019l.12 -.007q .083 0 .161 .013l.122 .029l.04 .012l.06 .023c.328 .135 .568 .44 .61 .806l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16z" />
              <path d="M9.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
              <path d="M13.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
              <path d="M17.02 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
              <path d="M12.02 15a1 1 0 0 1 0 2a1.001 1.001 0 1 1 -.005 -2z" />
              <path d="M9.015 16a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
            </svg>
            <p>Filtrar Ventas</p>
          </div>

          <div
            className="BotonSeleccion"
            onClick={() => {
              // toggle select all and flag for downloading
              if (Seleccionados.length === ventasData.length) {
                setSeleccionados([]);
                setSelectAll(false);
                setDescargarTodo(false);
              } else {
                const allIds = ventasData.map((v) => v.id);
                setSeleccionados(allIds);
                setSelectAll(true);
                setDescargarTodo(true);
              }
            }}
          >
            <div
              className={`Cuadro ${SelectAll ? "Cuadro0" : "CuadroC"}`}
            ></div>
            <p>Seleccionar todo</p>
          </div>
          <div
            className={`Descargar ${descargarTodo ? "DescargarO" : "DescargarC"}`}
            onClick={handleDescargarTodo}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
              <path d="M7 11l5 5l5 -5" />
              <path d="M12 4l0 12" />
            </svg>
            <p>Descargar Todo</p>
          </div>

          <div className="Total">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
              <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
              <path d="M14 11h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
              <path d="M12 17v1m0 -8v1" />
            </svg>
            <p>{Total}</p>
          </div>
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {/* componentes de impresión ocultos para cada venta */}
      {ventasFiltradas.map((v) => (
        <ImprimirFacturaPOS key={v.id} ref={getPrintRef(v.id)} venta={v} />
      ))}

      <section className="TablaVentas">
        <table className="tabla ">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Fecha</th>
              <th>Total Ganancia</th>
              <th>Ver más</th>
            </tr>
          </thead>

          <tbody>
            {ventasFiltradas.map((Venta, index) => (
              <tr key={index} className="tablaTd">
                <td>
                  <input
                    type="checkbox"
                    id="check"
                    checked={Seleccionados.includes(Venta.id)}
                    onChange={() => CambioSeleccion(Venta.id)}
                  />
                </td>
                <td>{Venta.id}</td>
                <td>{new Date(Venta.fecha).toLocaleString()}</td>
                <td>{Venta.total}</td>
                <td>
                  <button onClick={() => DetallesVenta(Venta)}>Ver mas</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={Panel ? "Cubierta" : ""}>
          {Panel && VentaSeleccionada && (
            <div className="panel panel-open">
              <div className="contenidoP">
                <div className="headerVenta">
                  <h1>Venta #{VentaSeleccionada.id}</h1>
                  <h2>{new Date(VentaSeleccionada.fecha).toLocaleString()}</h2>
                  <h2 id="Total">
                    Total <span>${VentaSeleccionada.total}</span>
                  </h2>
                  {VentaSeleccionada.devuelta != null && (
                    <h2>
                      Devuelta <span>${VentaSeleccionada.devuelta}</span>
                    </h2>
                  )}
                </div>

                <h3>Detalles de Venta</h3>
                <ul className="ListaProductos">
                  {VentaSeleccionada.detallesVentas?.map((detalle, index) => (
                    <li key={index} className="ListaProductos_producto">
                      {detalle.producto.nombre}({detalle.cantidad}){" "}
                      <span>{detalle.producto.precio}</span>
                    </li>
                  ))}
                </ul>

                <div className="botones">
                  <button
                    className="botones_Salir"
                    onClick={() => setPanel(false)}
                  >
                    Salir
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-back-up"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M9 14l-4 -4l4 -4" />
                      <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
                    </svg>
                  </button>
                  <button className="botones_Descargar" onClick={imprimirVenta}>
                    Descargar
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-download"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                      <path d="M7 11l5 5l5 -5" />
                      <path d="M12 4l0 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <div className={Filtracion ? "Cubierta" : ""}>
        <div className={Filtracion ? "PanelF" : "PanelO"}>
          <div className="PF_Header">
            <div className="Header_Titulo">
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="icon icon-tabler icons-tabler-filled icon-tabler-calendar-week"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M16 2c.183 0 .355 .05 .502 .135l.033 .02c.28 .177 .465 .49 .465 .845v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 .514 -.874l.093 -.046l.066 -.025l.1 -.029l.107 -.019l.12 -.007q .083 0 .161 .013l.122 .029l.04 .012l.06 .023c.328 .135 .568 .44 .61 .806l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 7h-14v9.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16z" />
                <path d="M9.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
                <path d="M13.015 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
                <path d="M17.02 13a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
                <path d="M12.02 15a1 1 0 0 1 0 2a1.001 1.001 0 1 1 -.005 -2z" />
                <path d="M9.015 16a1 1 0 0 1 -1 1a1.001 1.001 0 1 1 -.005 -2c.557 0 1.005 .448 1.005 1" />
              </svg>
              Filtrar Ventas
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              id="CerrarF"
              onClick={() => setFiltracion(!Filtracion)}
            >
              <path d="M11.676 2.001l.324 -.001c7.752 0 10 2.248 10 10l-.005 .642c-.126 7.235 -2.461 9.358 -9.995 9.358l-.642 -.005c-7.13 -.125 -9.295 -2.395 -9.358 -9.67v-.325c0 -7.643 2.185 -9.936 9.676 -9.999m2.771 5.105a1 1 0 0 0 -1.341 .447l-1.106 2.21l-1.106 -2.21a1 1 0 0 0 -1.234 -.494l-.107 .047a1 1 0 0 0 -.447 1.341l1.774 3.553l-1.775 3.553a1 1 0 0 0 .345 1.283l.102 .058a1 1 0 0 0 1.341 -.447l1.107 -2.211l1.106 2.211a1 1 0 0 0 1.234 .494l.107 -.047a1 1 0 0 0 .447 -1.341l-1.776 -3.553l1.776 -3.553a1 1 0 0 0 -.345 -1.283z" />
            </svg>
          </div>

          <div className="BotonesAtajo">
            <div className="BA Bhoy" onClick={filtroHoy}>
              Hoy
            </div>
            <div className="BA Bayer" onClick={filtroAyer}>
              Ayer
            </div>
            <div className="BA B7D" onClick={filtroUltimos7Dias}>
              Ultimos 7 dias{" "}
            </div>
            <div className="BA BEM" onClick={filtroEsteMes}>
              Este mes{" "}
            </div>
            <div className="BA BMP" onClick={filtroMesPasado}>
              Mes Pasado
            </div>
            <div className="BA BMP" onClick={mostrarTodo}>
              Todo
            </div>
          </div>

          <div className="PF_Fechas">
            <div className="Fechas">
              <p>Desde</p>
              <div className="Fechas_input">
                <input
                  className="Dinput"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </div>
            </div>

            <div className="Fechas">
              <p>Hasta</p>
              <div className="Fechas_input">
                <input
                  className="Dinput"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="ButtonA">
            <button id="BAplicar" onClick={aplicarFiltroFechas}>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ventas;
