import React from "react";
import Button from "../components/Button";
import { useState } from "react";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/IngresosExternos.css";
import {
  consultarIngresosExternos,
  crearIngresosExternos,
  editarIngresosExternos,
  eliminarIngresosExternos,
} from "../js/ingresosExternos";

const IngresosExternos = () => {
  // Lista de ingresos externos

  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ingresosData, setIngresosData] = useState([]);

  const datosFiltrados = ingresosData.filter((ingreso) =>
    (ingreso.tipoIngreso ?? "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  const obtenerIngresosExternos = async () => {
    try {
      const data = await consultarIngresosExternos();
      if (Array.isArray(data)) {
        setIngresosData(data);
      } else {
        console.error("Respuesta inesperada:", data);
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerIngresosExternos();
  }, []);

  // Logica para verificar los cambios del formulario & guardar los datos

  const [datosForm, setdatosForm] = useState({
    tipoIngreso: "",
    ganancia: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { tipoIngreso, ganancia } = datosForm;

    if (!tipoIngreso.trim() || !ganancia) {
      setError("Por favor complete todos los campos.");
      return;
    }

    const gananciaNum = Number(ganancia);
    if (isNaN(gananciaNum) || gananciaNum <= 0) {
      setError("La ganancia debe ser un valor numerico mayor a 0.");
      return;
    }

    const nuevoIngreso = {
      tipoIngreso: tipoIngreso.trim(),
      ganancia: gananciaNum,
    };

    try {
      const response = await crearIngresosExternos(nuevoIngreso);
      if (response.status === 201) {
        toast.success("¡Ingreso externo guardado exitosamente!");
        obtenerIngresosExternos();
        setdatosForm({ tipoIngreso: "", ganancia: "" });
        setError("");
        cerrarModalAgregar();
      } else {
        toast.error("No se pudo guardar el ingreso externo");
      }
    } catch (error) {
      console.error("Excepcion al crear el ingreso externo", error);
      toast.error("Error al crear el ingreso externo");
    }
  };

  // Logica para el modal de agregar nuevo ingreso externo

  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => {
    setShowModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    setdatosForm({ tipoIngreso: "", ganancia: "" });
    setError("");
  };

  // Filas de tabla seleccionadas

  const [seleccionados, setSeleccionados] = useState([]);

  // Logica para el modal de eliminar

  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    const seleccionadosFiltrados = ingresosData.filter((i) =>
      seleccionados.includes(i.id),
    );
    if (seleccionadosFiltrados.length === 0) {
      toast.warning("No hay ningun ingreso seleccionado");
      return;
    } else {
      setShowModalEliminar(true);
    }
  };

  const eliminarIngresosSelec = async () => {
    try {
      const data = { ids: seleccionados };
      const response = await eliminarIngresosExternos(data);
      if (response.status === 204) {
        toast.success("¡Ingresos externos eliminados exitosamente!");
        setSeleccionados([]);
        obtenerIngresosExternos();
      } else {
        toast.error("No se pudieron eliminar los ingresos externos");
      }
    } catch (error) {
      console.error("Excepcion al eliminar ingresos externos", error);
      toast.error("Error al eliminar los ingresos externos");
      setSeleccionados([]);
    }

    cerrarModalEliminar();
  };

  const cerrarModalEliminar = () => {
    setShowModalEliminar(false);
  };

  // Logica para la edicion de los ingresos externos

  const [edicion, setEdicion] = useState(false);
  const [ingresoEditando, setIngresoEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const verEdicion = () => {
    const seleccionadosFiltrados = ingresosData.filter((i) =>
      seleccionados.includes(i.id),
    );

    if (seleccionadosFiltrados.length === 0) {
      toast.warning("No hay ningun ingreso externo seleccionado");
      return;
    }

    if (seleccionadosFiltrados.length > 1) {
      toast.warning("Selecciona solo un ingreso externo para editar");
      return;
    }

    const ingresoSeleccionado = seleccionadosFiltrados[0];
    setEdicion(true);
    editarFila(ingresoSeleccionado);
  };

  const ocultarEdicion = () => {
    setEdicion(false);
  };

  const editarFila = (ingreso) => {
    setIngresoEditando(ingreso.id);
    setDatosEditados({ ...ingreso });
  };

  const CancelarEdicion = () => {
    setIngresoEditando(null);
    setDatosEditados({});
    ocultarEdicion();
    toast.info("Cancelado con exito!");
  };

  const GuardarEdicion = async () => {
    if (!datosEditados.tipoIngreso?.trim()) {
      toast.warning("El tipo de ingreso no puede estar vacio");
      return;
    }

    const gananciaNum = Number(datosEditados.ganancia);
    if (isNaN(gananciaNum) || gananciaNum <= 0) {
      toast.warning("La ganancia debe ser un valor numerico mayor a 0");
      return;
    }

    const ingresoEditado = {
      tipoIngreso: datosEditados.tipoIngreso.trim(),
      ganancia: gananciaNum,
    };

    try {
      const response = await editarIngresosExternos(
        ingresoEditado,
        ingresoEditando,
      );
      if (response.status === 200) {
        toast.success("¡Ingreso externo actualizado exitosamente!");
        obtenerIngresosExternos();
        setIngresoEditando(null);
        setDatosEditados({});
        ocultarEdicion();
      } else {
        toast.warning("No se pudo actualizar el ingreso externo");
      }
    } catch (error) {
      console.error("Excepcion al actualizar el ingreso externo", error);
      toast.error("Error al actualizar el ingreso externo");
    }
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;
    setDatosEditados((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatearGanancia = (valor) => {
    return Number(valor).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  // //////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (cargando) {
    return (
      <div className="modal-cargando-ie">
        <div className="modal-contenido-cargando-ie">
          <div className="loader-ie"></div>
        </div>
      </div>
    );
  }

  // /////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <>
      <section className="ingresos-externos">
        <h1>INGRESOS EXTERNOS</h1>
        <div className="ingresos-externos-titulo-linea"></div>
        <div id="cont">
          <div className="buscador">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
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
              value={busqueda}
              placeholder="Buscar tipo de ingreso..."
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <Button variant="verde" onClick={abrirModalAgregar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6aff00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
              <path d="M15 12h-6" />
              <path d="M12 9v6" />
            </svg>
            Agregar
          </Button>
          <Button variant="azul" onClick={verEdicion}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="cyan"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
            Editar
          </Button>
          <Button variant="rojo" onClick={abrirModalEliminar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff0000"
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
            Eliminar
          </Button>
        </div>
        <br />
        <div className="ingresos-externos-tabla">
          <table className="tabla-IE">
            <thead className="t-IE">
              <tr>
                <th></th>
                <th>Tipo de Ingreso</th>
                <th>Ganancia</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.map((ingreso) => (
                <tr key={ingreso.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(ingreso.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados([...seleccionados, ingreso.id]);
                        } else {
                          setSeleccionados(
                            seleccionados.filter((id) => id !== ingreso.id),
                          );
                        }
                      }}
                    />
                  </td>
                  <td>
                    {ingresoEditando === ingreso.id ? (
                      <input
                        className="inputss-ie"
                        type="text"
                        name="tipoIngreso"
                        value={datosEditados.tipoIngreso}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      ingreso.tipoIngreso
                    )}
                  </td>
                  <td>
                    {ingresoEditando === ingreso.id ? (
                      <input
                        className="inputss-ie"
                        type="number"
                        name="ganancia"
                        value={datosEditados.ganancia}
                        onChange={handleChangeEdicion}
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      formatearGanancia(ingreso.ganancia)
                    )}
                  </td>
                  <td>{formatearFecha(ingreso.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {edicion && (
          <div id="botoness-edicion-ie">
            <Button variant="verde" onClick={GuardarEdicion}>
              Guardar
            </Button>
            <Button variant="rojo" onClick={CancelarEdicion}>
              Cancelar
            </Button>
          </div>
        )}

        {/* Modal de agregar ingreso externo */}
        {showModalAgregar && (
          <div className="modal-ie" onClick={cerrarModalAgregar}>
            <div
              className="modal-contenedor-ie"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-contenido-ie">
                <h2>Agregar ingreso externo</h2>
                <form className="formulario-ie" onSubmit={handleSubmit}>
                  <div className="bloque-ie">
                    <label>Tipo de Ingreso</label>
                    <input
                      type="text"
                      placeholder="Ej: Propina, Descorche..."
                      name="tipoIngreso"
                      value={datosForm.tipoIngreso}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque-ie">
                    <label>Ganancia</label>
                    <input
                      type="number"
                      placeholder="Valor en pesos"
                      name="ganancia"
                      value={datosForm.ganancia}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {error && <p className="error-ie">{error}</p>}

                  <div className="botones-ie">
                    <Button type="submit" variant="verde">
                      Guardar
                    </Button>
                    <Button variant="rojo" onClick={cerrarModalAgregar}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de eliminar ingresos externos */}
        {showModalEliminar && (
          <div className="modal-ie" onClick={cerrarModalEliminar}>
            <div
              className="modal-contenedor-eliminar-ie"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>
                ¿Esta completamente seguro que desea eliminar el/los ingresos
                externos seleccionados?
              </h2>
              <div id="botoness">
                <Button variant="verde" onClick={eliminarIngresosSelec}>
                  Aceptar
                </Button>
                <Button variant="rojo" onClick={cerrarModalEliminar}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default IngresosExternos;
