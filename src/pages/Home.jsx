import "../styles/Home.css";
import React, { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
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

        setVentaActual(ventaCompleta); // guardamos venta
        setTimeout(() => {
          printRef.current?.print(); // ✅ imprime automáticamente
        }, 300);

        // Limpieza de datos (después de imprimir)
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
      0,
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
        if (cantidadNueva < 1) {
          cantidadNueva = 1;
        }
        const nuevoSubtotal = p.Precio * cantidadNueva;
        const nuevoTotal = p.Precio * cantidadNueva;
        return {
          ...p,
          cantidad: cantidadNueva,
          subtotal: nuevoSubtotal,
          total: nuevoTotal,
        };
      }
      return p;
    });
    setProductosSeleccionados(nuevosP);
  };

  const ConsultarProductos = async () => {
    try {
      const data = await consultaInventario();
      if (Array.isArray(data)) {
        setProductos(data);
      }
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
        setError(
          "Error al acceder a las Existencias de los productos porximos a terminar",
        );
        console.error("Respuesta inesperada:", data);
      }
    } catch (err) {
      setError(
        "Error al acceder a las Existencias de los productos porximos a terminar",
      );
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
      p.nombre.toLowerCase().includes(texto.toLowerCase()),
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
        (p) => p.id === productoSeleccionado.id,
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

  //****************************************************************************************************** */
  // Notificacion de existencias

  const [noti, setNoti] = useState(false);
  const [condicion, setCondicion] = useState(false);

  useEffect(() => {
    if (existencias.length === 0) {
      setCondicion(false);
    } else {
      setCondicion(true);
    }
  }, [existencias]);

  const verNoti = () => {
    setNoti(true);
  };

  const ocultarNoti = () => {
    setNoti(false);
  };

  // /////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <section className="rata">
      <div className="rata2">
        {condicion && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="#7c0000ff"
            className="alertIcon"
            onClick={verNoti}
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12 2c5.523 0 10 4.477 10 10a10 
              10 0 0 1 -19.995 .324l-.005 -.324l.004 -.28c.148 
              -5.393 4.566 -9.72 9.996 -9.72zm.01 13l-.127 .007a1 1 0 0 0 0 
              1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 
              -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0
              1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z"
            />
          </svg>
        )}
      </div>
      <section className="Contenedor_principal">
        <section className="Principal_contenido">
          <div className="Contenido_superior">
            <div className="Superior_busqueda">
              <label>Producto</label>
              <input
                type="text"
                value={busqueda}
                placeholder={"Buscar producto"}
                id="Busqueda_buscador"
                onChange={(e) => handleBusqueda(e.target.value)}
              />

              {sugerencia.length > 0 && (
                <div className="Sugerencia_Productos">
                  {sugerencia.map((producto) => (
                    <div
                      key={producto.id}
                      className="sugerencia-item"
                      onClick={() => handleSeleccionarProducto(producto)}
                    >
                      <span>{producto.nombre}</span>

                      <span className="stock-producto">
                        ({producto.cantidad_actual})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="Superior_Cantidad_Agregar">
              <div className="Superior_Cantidad">
                <label>Cantidad</label>
                <input
                  type="text"
                  id="Busqueda_buscador"
                  value={cantidad}
                  onChange={(e) => handlechange(e)}
                />
              </div>
              <Button
                variant="verde"
                className="homeB"
                onClick={AgregarProducto}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-shopping-cart"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M17 17h-11v-14h-2" />
                  <path d="M6 5l14 1l-1 7h-13" />
                </svg>
                Agregar
              </Button>
            </div>
          </div>

          <div className="Contenido_Tabla">
            <table className="Tabla_productos">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th id="c">Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {productosSeleccionados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>
                      <div className="Cantidades">
                        <div
                          className="Cantidades_A"
                          onClick={() => actualizarCantidad(p.id, "sumar")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 5l0 14" />
                            <path d="M5 12l14 0" />
                          </svg>
                        </div>

                        <input
                          type="number"
                          className="Cantidades_numero"
                          value={p.cantidad}
                          readOnly
                        />

                        <div
                          className="Cantidades_B"
                          onClick={() => actualizarCantidad(p.id, "restar")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-minus"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 12l14 0" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td>{p.Precio}</td>
                    <td>{p.subtotal}</td>
                    <td>{p.total}</td>

                    <td>
                      <svg
                        onClick={() => eliminarP(p.id)}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-trash-x"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 7h16" />
                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        <path d="M10 12l4 4m0 -4l-4 4" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="Principal_valores">
          <section className="labels">
            <div className="label_Contenido">
              <div className="Contenido_labels">
                <label htmlFor="">Total</label>
                <input
                  type="text"
                  className="Labels_input"
                  value={calcularTotal().toFixed(2)}
                  readOnly
                />
              </div>

              <div className="Contenido_labels">
                <label htmlFor="">Pago</label>
                <input
                  type="number"
                  min="0"
                  className="Labels_input"
                  value={pago}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setPago(valor);
                    devolucion(valor);
                  }}
                />
              </div>

              <div className="Contenido_labels">
                <label htmlFor="">{Tdevuelve}</label>
                <input
                  type="text"
                  className="Labels_input"
                  value={devuelta}
                  readOnly
                />
              </div>
            </div>
            <div className="label_Botones">
              <Button variant="verde" onClick={() => vender()}>
                Vender
              </Button>

              {/* El componente de impresión invisible */}
              {ventaActual && (
                <ImprimirFacturaPOS ref={printRef} venta={ventaActual} />
              )}

              <Button variant="rojo" onClick={() => cancelarPago()}>
                Cancelar
              </Button>
            </div>
          </section>
          <ToastContainer position="top-center" autoClose={3000} />
        </section>
      </section>
      {noti && (
        <div className="modal-noti-p" onClick={ocultarNoti}>
          <div className="modal-noti" onClick={(e) => e.stopPropagation()}>
            <div className="modal-noti-header">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="closeIcon"
                onClick={ocultarNoti}
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 21a9 9 0 0 0 9 -9a9 9 0 0 0 -9 -9a9 9 0 0 0 -9 9a9 9 0 0 0 9 9z" />
                <path d="M9 8l6 8" />
                <path d="M15 8l-6 8" />
              </svg>
              <h1>Productos con existencias próximas a terminar</h1>
            </div>
            <div className="modal-body-noti">
              {existencias.map((producto) => (
                <div className="noti-prod" key={producto.producto.id}>
                  <p>{producto.producto.nombre}</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-right"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12l14 0" />
                    <path d="M13 18l6 -6" />
                    <path d="M13 6l6 6" />
                  </svg>
                  <p>{producto.producto.cantidad_actual}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* {mostrarFactura && ventaActual && (
            console.log("ventaActual", ventaActual),
            <ImprimirFacturaPOS
              venta={ventaActual}
              isOpen={mostrarFactura}
              onClose={() => setMostrarFactura(false)}
            />
          )} */}
    </section>
  );
};

export default Home;
