import React from "react";
import "../styles/Egresos.css";
import { useState, useEffect } from "react";
import Gastos from "./Gastos";
import Compras from "./Compras";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getEgresos,
  createEgreso,
  deleteEgreso,
  updateEgreso,
  getProductos,
} from "../js/egresosService";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const normalizarTexto = (texto) => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const formatearFechaHumana = (fecha) => {
  if (!fecha) return "";
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj)) return "";
  return fechaObj.toLocaleDateString("es-ES", opciones);
};

const Egresos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("gastos");
  const [egresoData, setEgresoData] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [error, setError] = useState("");
  const [edicion, setEdicion] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const animatedComponents = makeAnimated();

  const [productosOptions, setProductosOptions] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const obtenerProductos = async () => {
    try {
      const productos = await getProductos();
      const options = productos.map((producto) => ({
        value: producto.id,
        label: `${producto.nombre} (${producto.proveedor.nombre})`,
        nombre: producto.nombre,
        proveedor: producto.proveedor.nombre,
      }));
      setProductosOptions(options);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("Error al cargar los productos");
    }
  };

  const filtrarEgresos = () => {
    const termino = normalizarTexto(busqueda.trim());
    const matchCampo = termino.match(/^(\w+)=(.*)$/);

    return egresoData.filter((item) => {
      const nombre = item.nombre || item.producto?.nombre || "";
      const proveedor =
        item.proveedor || item.producto?.proveedor?.nombre || "";
      const estado = item.estado || "";
      const fecha = item.fecha || "";
      const fechaNormal = normalizarTexto(fecha);
      const fechaHumana = normalizarTexto(formatearFechaHumana(fecha));

      if (matchCampo) {
        const campo = matchCampo[1];
        const valor = matchCampo[2].trim();

        switch (campo) {
          case "nombre":
            return normalizarTexto(nombre).includes(normalizarTexto(valor));
          case "detalles":
            return normalizarTexto(nombre).includes(normalizarTexto(valor));
          case "proveedor":
            return normalizarTexto(proveedor).includes(normalizarTexto(valor));
          case "estado":
            return normalizarTexto(estado).includes(normalizarTexto(valor));
          case "fecha":
            return (
              fechaNormal.includes(normalizarTexto(valor)) ||
              fechaHumana.includes(normalizarTexto(valor))
            );
          default:
            return true;
        }
      }

      return (
        normalizarTexto(nombre).includes(termino) ||
        normalizarTexto(proveedor).includes(termino) ||
        fechaNormal.includes(termino) ||
        fechaHumana.includes(termino)
      );
    });
  };

  const [datosForm, setDatosForm] = useState({
    nombre: "",
    precio: "",
    estado: "",
    fecha_de_pago: "",
    cantidad: "",
    proveedor: "",
    fecha_de_compra: "",
  });

  const obtenerEgresos = async () => {
    try {
      setCargando(true);
      const data = await getEgresos(vista);
      const datosNormalizados = data.map((item) => ({
        id: item.id || "",
        nombre: item.nombre || "",
        precio: item.precio || item.subtotal || 0,
        estado: item.estado || "",
        fecha_de_pago: item.fecha_de_pago || "",
        idDetalle:
          item.detallesCompra?.id ||
          (item.detallesCompra && item.detallesCompra[0]?.id) ||
          "",
        producto:
          item.idproducto ||
          (item.detallesCompra && item.detallesCompra[0]?.producto) ||
          "",
        cantidad:
          item.cantidad ||
          (item.detallesCompra && item.detallesCompra[0]?.cantidad) ||
          0,
        fecha: item.fecha || item.fecha_de_compra || "",
        proveedor: item.proveedor || "",
        productoInfo: item.productoInfo || "",
      }));
      setEgresoData(datosNormalizados);
    } catch (error) {
      console.error("Error en la consulta:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      vista === "gastos" &&
      (!datosForm.nombre ||
        !datosForm.precio ||
        !datosForm.estado ||
        !datosForm.fecha_de_pago)
    ) {
      setError("Todos los campos son obligatorios para gastos");
      return;
    }

    if (
      vista === "compras" &&
      (!datosForm.idproducto ||
        !datosForm.precio ||
        !datosForm.cantidad ||
        !datosForm.fecha_de_compra)
    ) {
      setError("Todos los campos son obligatorios para compras");
      return;
    }

    try {
      let dataToSend;

      if (vista === "gastos") {
        dataToSend = {
          nombre: datosForm.nombre,
          precio: datosForm.precio,
          estado: datosForm.estado,
          fecha_de_pago: datosForm.fecha_de_pago,
        };
      } else {
        dataToSend = {
          subtotal: datosForm.precio,
          fecha: datosForm.fecha_de_compra,
          detallesCompra: [
            {
              idproducto: datosForm.idproducto,
              cantidad: datosForm.cantidad,
            },
          ],
        };
      }

      const response = await createEgreso(vista, dataToSend);
      if (response.status === 201) {
        toast.success(
          `${vista === "gastos" ? "Gasto" : "Compra"} creado exitosamente!`,
        );
        obtenerEgresos();
        cerrarModalAgregar();
        setProductoSeleccionado(null);
      }
    } catch (error) {
      toast.error(`Error al crear ${vista === "gastos" ? "gasto" : "compra"}`);
      console.error(error);
    }
  };

  const eliminarEgresoSeleccionado = async () => {
    try {
      const response = await deleteEgreso(vista, seleccionados);
      if (response.status === 204) {
        toast.success("¡Egreso eliminado exitosamente!");
        obtenerEgresos();
      }
    } catch (error) {
      toast.error(`Error al eliminar ${vista}`);
    }
    setShowModalEliminar(false);
  };

  const obtenerFechaColombia = () => {
    const hoy = new Date();
    const offsetColombia = hoy.getTimezoneOffset() + 300;
    hoy.setMinutes(hoy.getMinutes() - offsetColombia);
    return hoy.toISOString().slice(0, 10);
  };

  const abrirModalAgregar = () => {
    setDatosForm({
      nombre: "",
      precio: "",
      estado: "",
      fecha_de_pago: obtenerFechaColombia(),
      idproducto: "",
      cantidad: "",
      fecha_de_compra: obtenerFechaColombia(),
    });
    setProductoSeleccionado(null);
    setError("");
    setShowModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
  };

  const verEdicion = () => {
    const itemsSeleccionados = egresoData.filter((item) =>
      seleccionados.includes(item.id),
    );

    if (itemsSeleccionados.length === 0) {
      toast.warning(
        `No hay ningún ${vista === "gastos" ? "gasto" : "compra"} seleccionado`,
      );
      return;
    }

    if (itemsSeleccionados.length > 1) {
      toast.warning(
        `Selecciona solo un ${vista === "gastos" ? "gasto" : "compra"} para editar`,
      );
      return;
    }

    const itemSeleccionado = itemsSeleccionados[0];
    setEdicion(true);
    setItemEditando(itemSeleccionado.id);
    setDatosEditados({ ...itemSeleccionado });
  };

  const cancelarEdicion = () => {
    setEdicion(false);
    setItemEditando(null);
    setDatosEditados({});
    toast.info("Edición cancelada");
  };

  const guardarEdicion = async () => {
    try {
      let datosActualizados;
      if (vista == "gastos") {
        datosActualizados = {
          id: datosEditados.id,
          nombre: datosEditados.nombre,
          precio: datosEditados.precio,
          estado: datosEditados.estado,
          fecha_de_pago: datosEditados.fecha_de_pago,
        };
      } else {
        datosActualizados = {
          id: datosEditados.id,
          subtotal: Number(datosEditados.precio),
          fecha: datosEditados.fecha,
          detallesCompra: [
            {
              id: Number(datosEditados.idDetalle),
              idproducto: Number(
                datosEditados.producto?.id ?? datosEditados.idproducto,
              ),
              cantidad: Number(datosEditados.cantidad),
            },
          ],
        };
      }
      const response = await updateEgreso(
        vista,
        datosActualizados.id,
        datosActualizados,
      );

      if (response.status == 200) {
        toast.success("¡Egreso actualizado exitosamente!");
        obtenerEgresos();
        cancelarEdicion();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast.error("Error al guardar los cambios");
    }
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;
    setDatosEditados((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (vista === "compras") {
      obtenerProductos();
    }
    obtenerEgresos();
    setSeleccionados([]);
    setEdicion(false);
    setItemEditando(null);
  }, [vista]);

  if (cargando) {
    return (
      <div className="eg-loading-overlay">
        <div className="eg-loading-inner">
          <div className="eg-loader" />
          <span className="eg-loading-text">
            Cargando {vista}...
          </span>
        </div>
      </div>
    );
  }

  const egFiltrados = filtrarEgresos();
  const totalMonto = egFiltrados.reduce(
    (sum, item) => sum + Number(item.precio || 0),
    0,
  );

  return (
    <section className="eg-page">
      {/* Header */}
      <div className="eg-header">
        <div className="eg-header-accent" />
        <div className="eg-header-content">
          <h1 className="eg-title">EGRESOS</h1>
          <p className="eg-subtitle">
            {vista === "gastos"
              ? "Registro de gastos fijos y variables"
              : "Registro de compras y proveedores"}
          </p>
        </div>
        <div className={`eg-header-badge eg-header-badge--${vista}`}>
          {vista === "gastos" ? "GASTOS" : "COMPRAS"}
        </div>
      </div>

      {/* View Tabs */}
      <div className="eg-tabs">
        <button
          className={`eg-tab${vista === "gastos" ? " eg-tab--active" : ""}`}
          onClick={() => setVista("gastos")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
            <path d="M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2" />
          </svg>
          Gastos
        </button>
        <button
          className={`eg-tab${vista === "compras" ? " eg-tab--active" : ""}`}
          onClick={() => setVista("compras")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M17 17h-11v-14h-2" />
            <path d="M6 5l14 1l-1 7h-13" />
          </svg>
          Compras
        </button>
      </div>

      {/* Toolbar */}
      <div className="eg-toolbar">
        <div className="eg-toolbar-left">
          <div className="eg-search-wrap">
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
              className="eg-search-input"
              placeholder={`Buscar ${vista === "gastos" ? "gastos" : "compras"}...`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <div className="eg-toolbar-right">
          {!edicion ? (
            <>
              <button className="eg-btn eg-btn--add" onClick={abrirModalAgregar}>
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
              <button className="eg-btn eg-btn--edit" onClick={verEdicion}>
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
                className="eg-btn eg-btn--del"
                onClick={() =>
                  seleccionados.length > 0
                    ? setShowModalEliminar(true)
                    : toast.warning(
                        `Seleccione ${vista === "gastos" ? "gastos" : "compras"} para eliminar`,
                      )
                }
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
              <div className="eg-edit-active-badge">
                <span className="eg-edit-dot" />
                MODO EDICIÓN
              </div>
              <button className="eg-btn eg-btn--save" onClick={guardarEdicion}>
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
                className="eg-btn eg-btn--cancel"
                onClick={cancelarEdicion}
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
      <div className="eg-info-bar">
        <span className="eg-info-item">
          <span className="eg-info-label">
            {vista === "gastos" ? "GASTOS" : "COMPRAS"}
          </span>
          <span className="eg-info-value">{egFiltrados.length}</span>
        </span>
        {seleccionados.length > 0 && (
          <span className="eg-info-item eg-info-item--sel">
            <span className="eg-info-label">SELECCIONADOS</span>
            <span className="eg-info-value">{seleccionados.length}</span>
          </span>
        )}
        <span className="eg-info-item eg-info-item--total">
          <span className="eg-info-label">TOTAL</span>
          <span className="eg-info-value eg-info-monto">
            $
            {totalMonto.toLocaleString("es-CO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </span>
      </div>

      {/* Table Panel */}
      <div className="eg-table-panel">
        {vista === "gastos" && (
          <Gastos
            seleccionados={seleccionados}
            setSeleccionados={setSeleccionados}
            gastosData={egFiltrados}
            itemEditando={itemEditando}
            datosEditados={datosEditados}
            handleChangeEdicion={handleChangeEdicion}
          />
        )}
        {vista === "compras" && (
          <Compras
            seleccionados={seleccionados}
            setSeleccionados={setSeleccionados}
            comprasData={egFiltrados}
            itemEditando={itemEditando}
            datosEditados={datosEditados}
            handleChangeEdicion={handleChangeEdicion}
          />
        )}
      </div>

      {/* Delete Modal */}
      {showModalEliminar && (
        <div
          className="eg-overlay"
          onClick={() => setShowModalEliminar(false)}
        >
          <div
            className="eg-modal eg-modal--danger"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="eg-modal-corner eg-modal-corner--tl" />
            <div className="eg-modal-corner eg-modal-corner--br" />
            <div className="eg-modal-icon">
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
            <h2 className="eg-modal-title">Confirmar eliminación</h2>
            <p className="eg-modal-body">
              ¿Eliminar {seleccionados.length}{" "}
              {vista === "gastos" ? "gasto(s)" : "compra(s)"} seleccionado(s)?
              Esta acción no se puede deshacer.
            </p>
            <div className="eg-modal-actions">
              <button
                className="eg-btn eg-btn--del"
                onClick={eliminarEgresoSeleccionado}
              >
                Confirmar
              </button>
              <button
                className="eg-btn eg-btn--cancel"
                onClick={() => setShowModalEliminar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModalAgregar && (
        <div className="eg-overlay" onClick={cerrarModalAgregar}>
          <div
            className="eg-modal eg-modal--form"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="eg-modal-corner eg-modal-corner--tl" />
            <div className="eg-modal-corner eg-modal-corner--br" />
            <form className="eg-form" onSubmit={handleSubmit}>
              <h2 className="eg-modal-title">
                Agregar {vista === "gastos" ? "Gasto" : "Compra"}
              </h2>

              {vista === "gastos" ? (
                <>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Nombre del gasto</label>
                    <input
                      className="eg-form-input"
                      type="text"
                      placeholder="Ej: Arriendo"
                      name="nombre"
                      value={datosForm.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Precio</label>
                    <input
                      className="eg-form-input"
                      type="number"
                      placeholder="Ej: 500000"
                      name="precio"
                      value={datosForm.precio}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Estado</label>
                    <div className="eg-select-wrap">
                      <select
                        className="eg-form-select"
                        name="estado"
                        value={datosForm.estado}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        <option value="Fijo">Fijo</option>
                        <option value="Variable">Variable</option>
                      </select>
                    </div>
                  </div>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Fecha de pago</label>
                    <input
                      className="eg-form-input"
                      type="date"
                      name="fecha_de_pago"
                      value={datosForm.fecha_de_pago}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Producto</label>
                    <div className="eg-select-wrap eg-select-wrap--react">
                      <Select
                        className="eg-react-select"
                        classNamePrefix="eg-rs"
                        menuPlacement="auto"
                        options={productosOptions}
                        value={productoSeleccionado}
                        onChange={(selectedOption) => {
                          setProductoSeleccionado(selectedOption);
                          setDatosForm((prev) => ({
                            ...prev,
                            idproducto: selectedOption.value,
                            nombre: selectedOption.nombre,
                            proveedor: selectedOption.proveedor,
                          }));
                        }}
                        placeholder="Buscar producto..."
                        isSearchable
                        noOptionsMessage={() => "No se encontraron productos"}
                        components={animatedComponents}
                        required
                      />
                    </div>
                  </div>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Subtotal</label>
                    <input
                      className="eg-form-input"
                      type="number"
                      placeholder="Ej: 500000"
                      name="precio"
                      value={datosForm.precio}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Cantidad</label>
                    <input
                      className="eg-form-input"
                      type="text"
                      pattern="[0-9]*"
                      placeholder="Ej: 100"
                      name="cantidad"
                      value={datosForm.cantidad}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="eg-form-row">
                    <label className="eg-form-label">Fecha de compra</label>
                    <input
                      className="eg-form-input"
                      type="date"
                      name="fecha_de_compra"
                      value={datosForm.fecha_de_compra}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {error && <p className="eg-form-error">{error}</p>}

              <div className="eg-modal-actions">
                <button type="submit" className="eg-btn eg-btn--add">
                  Guardar
                </button>
                <button
                  type="button"
                  className="eg-btn eg-btn--cancel"
                  onClick={cerrarModalAgregar}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </section>
  );
};

export default Egresos;
