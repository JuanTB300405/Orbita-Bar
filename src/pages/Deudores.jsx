import React from "react";
import Button from "../components/Button";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Deudores.css";
import {
  consultarDeudores,
  crearDeudores,
  editarDeudores,
  eliminarDeudores,
} from "../js/deudores";

const Deudores = () => {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [deudoresData, setDeudoresData] = useState([]);

  const datosFiltrados = deudoresData.filter((deudor) =>
    deudor.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const obtenerDeudores = async () => {
    try {
      const data = await consultarDeudores();
      if (Array.isArray(data)) {
        setDeudoresData(data);
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
    obtenerDeudores();
  }, []);

  // Formulario agregar
  const [datosForm, setDatosForm] = useState({
    nombre: "",
    celular: "",
    deuda: "",
    autorizacion: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, celular, deuda } = datosForm;

    if (!nombre || !celular || !deuda) {
      setError("Por favor complete todos los campos obligatorios.");
      return;
    }

    const nuevoDeudor = {
      nombre,
      celular,
      deuda: parseFloat(deuda),
      autorizacion: datosForm.autorizacion,
    };

    try {
      const response = await crearDeudores(nuevoDeudor);
      if (response.status === 201) {
        toast.success("¡Deudor registrado exitosamente!");
        obtenerDeudores();
      }
    } catch (error) {
      console.error("Excepción al crear el deudor:", error);
      toast.error("Error al registrar el deudor");
    }

    setDatosForm({ nombre: "", celular: "", deuda: "", autorizacion: false });
    setError("");
    cerrarModalAgregar();
  };

  // Modal agregar
  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => setShowModalAgregar(true);

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    setDatosForm({ nombre: "", celular: "", deuda: "", autorizacion: false });
    setError("");
  };

  // Selección de filas
  const [seleccionados, setSeleccionados] = useState([]);

  // Modal eliminar
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    if (seleccionados.length === 0) {
      toast.warning("No hay ningún deudor seleccionado");
      return;
    }
    setShowModalEliminar(true);
  };

  const eliminarDeudoresSelec = async () => {
    try {
      const data = { ids: seleccionados };
      const response = await eliminarDeudores(data);
      if (response.status === 204) {
        toast.success("¡Deudores eliminados exitosamente!");
        setSeleccionados([]);
        obtenerDeudores();
      }
    } catch (error) {
      console.error("Excepción al eliminar deudores:", error);
      toast.error("Error al eliminar los deudores");
    }
    cerrarModalEliminar();
  };

  const cerrarModalEliminar = () => setShowModalEliminar(false);

  // Edición inline
  const [edicion, setEdicion] = useState(false);
  const [deudorEditando, setDeudorEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const verEdicion = () => {
    const selec = deudoresData.filter((d) => seleccionados.includes(d.id));

    if (selec.length === 0) {
      toast.warning("No hay ningún deudor seleccionado");
      return;
    }
    if (selec.length > 1) {
      toast.warning("Selecciona solo un deudor para editar");
      return;
    }

    setEdicion(true);
    setDeudorEditando(selec[0].id);
    setDatosEditados({ ...selec[0] });
  };

  const CancelarEdicion = () => {
    setDeudorEditando(null);
    setDatosEditados({});
    setEdicion(false);
    toast.info("Cancelado con éxito");
  };

  const GuardarEdicion = async () => {
    const deudorE = {
      nombre: datosEditados.nombre,
      celular: datosEditados.celular,
      deuda: parseFloat(datosEditados.deuda),
      autorizacion: datosEditados.autorizacion,
      pagado: datosEditados.pagado,
    };

    try {
      const response = await editarDeudores(deudorE, deudorEditando);
      if (response.status === 200) {
        toast.success("¡Deudor actualizado exitosamente!");
        obtenerDeudores();
      } else {
        toast.warning("No se pudo actualizar el deudor");
      }
    } catch (error) {
      console.error("Excepción al actualizar el deudor:", error);
      toast.error("Error al actualizar el deudor");
    }

    setDeudorEditando(null);
    setDatosEditados({});
    setEdicion(false);
    console.log("datos enviados al back", deudorE);
  };

  const handleChangeEdicion = (e) => {
    const { name, value, type, checked } = e.target;
    setDatosEditados((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatFecha = (fechaStr) => {
    const d = new Date(fechaStr);
    return d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // //////////////////////////////////////////////////////////////////////

  if (cargando) {
    return (
      <div className="modal-cargando-d">
        <div className="modal-contenido-d">
          <div className="loader-d"></div>
        </div>
      </div>
    );
  }

  // //////////////////////////////////////////////////////////////////////

  return (
    <>
      <section className="deudores">
        <h1>DEUDORES</h1>
        <div className="deudores-titulo-linea"></div>
        <div id="cont-d">
          <div className="buscador-d">
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
              placeholder="Buscar deudor..."
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
        <div className="deudores-tabla">
          <table className="tabla-D">
            <thead className="t-D">
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Celular</th>
                <th>Deuda</th>
                <th>Fecha</th>
                <th>Autorizado</th>
                <th>Pagado</th>
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.map((deudor) => (
                <tr key={deudor.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(deudor.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados([...seleccionados, deudor.id]);
                        } else {
                          setSeleccionados(
                            seleccionados.filter((id) => id !== deudor.id),
                          );
                        }
                      }}
                    />
                  </td>
                  <td className="table-Nombre">
                    {deudorEditando === deudor.id ? (
                      <input
                        className="inputss-d"
                        type="text"
                        name="nombre"
                        value={datosEditados.nombre}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      deudor.nombre
                    )}
                  </td>
                  <td>
                    {deudorEditando === deudor.id ? (
                      <input
                        className="inputss-d"
                        type="tel"
                        name="celular"
                        value={datosEditados.celular}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      deudor.celular
                    )}
                  </td>
                  <td>
                    {deudorEditando === deudor.id ? (
                      <input
                        className="inputss-d"
                        type="number"
                        name="deuda"
                        step="0.01"
                        value={datosEditados.deuda}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      <span className="deuda-monto">
                        ${parseFloat(deudor.deuda).toLocaleString("es-CO")}
                      </span>
                    )}
                  </td>
                  <td>{formatFecha(deudor.fecha)}</td>
                  <td>
                    {deudorEditando === deudor.id ? (
                      <input
                        type="checkbox"
                        name="autorizacion"
                        checked={datosEditados.autorizacion}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      <span
                        className={`badge ${deudor.autorizacion ? "badge-si" : "badge-no"}`}
                      >
                        {deudor.autorizacion ? "Sí" : "No"}
                      </span>
                    )}
                  </td>
                  <td>
                    {deudorEditando === deudor.id ? (
                      <input
                        type="checkbox"
                        name="pagado"
                        checked={datosEditados.pagado}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      <span
                        className={`badge ${deudor.pagado ? "badge-si" : "badge-no"}`}
                      >
                        {deudor.pagado ? "SI" : "NO"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {edicion && (
          <div id="botoness-edicion-d">
            <Button variant="verde" onClick={GuardarEdicion}>
              Guardar
            </Button>
            <Button variant="rojo" onClick={CancelarEdicion}>
              Cancelar
            </Button>
          </div>
        )}

        {/* Modal agregar deudor */}
        {showModalAgregar && (
          <div className="modal-d" onClick={cerrarModalAgregar}>
            <div
              className="modal-contenedor-d"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-contenido-form-d">
                <h2>Registrar nuevo deudor</h2>
                <form className="formulario-d" onSubmit={handleSubmit}>
                  <div className="bloque-d">
                    <label>Nombre</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      name="nombre"
                      value={datosForm.nombre}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque-d">
                    <label>Celular</label>
                    <input
                      type="tel"
                      placeholder="Número de celular"
                      name="celular"
                      value={datosForm.celular}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque-d">
                    <label>Deuda ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Monto de la deuda"
                      name="deuda"
                      value={datosForm.deuda}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque-d bloque-check">
                    <label>Autorizado</label>
                    <input
                      type="checkbox"
                      name="autorizacion"
                      checked={datosForm.autorizacion}
                      onChange={handleChange}
                      className="checkbox-d"
                    />
                  </div>

                  {error && <p className="error-d">{error}</p>}

                  <div className="botones-d">
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

        {/* Modal eliminar */}
        {showModalEliminar && (
          <div className="modal-d" onClick={cerrarModalEliminar}>
            <div
              className="modal-contenedor-eliminar-d"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>¿Está seguro que desea eliminar el/los deudores?</h2>
              <div id="botoness-d">
                <Button variant="verde" onClick={eliminarDeudoresSelec}>
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

export default Deudores;
