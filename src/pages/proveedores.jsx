import React from "react";
import Button from "../components/Button";
import { useState } from "react";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/proveedores.css";
import {
  consultaProveedores,
  crearProveedores,
  editarProveedor,
  eliminarProveedores,
} from "../js/proveedores";

const Proveedores = () => {
  // Lista de proveedores

  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [proveedoresData, setProveedoresData] = useState([]);

  const datosFitrados = proveedoresData.filter((provedor) =>
    provedor.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const obtenerProveedores = async () => {
    try {
      const provedoresD = await consultaProveedores();
      if (Array.isArray(provedoresD)) {
        setProveedoresData(provedoresD);
      } else {
        console.error("Respuesta inesperada:", provedoresD);
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProveedores();
  }, []);

  // Logica para verificar los cambios del formulario & guardar los datos

  const [datosForm, setdatosForm] = useState({
    id: "",
    nombre: "",
    telefono: "",
    email: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setdatosForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos
    const { nombre, telefono, email } = datosForm;

    if (!nombre || !telefono || !email) {
      setError("Por favor complete todos los campos.");
      return;
    }

    // Agregar el proveedor a la tabla

    const nuevoProveedor = {
      nombre: nombre,
      telefono: telefono,
      email: email,
    };

    try {
      const response = await crearProveedores(nuevoProveedor);
      if (response.status === 201) {
        toast.success("¡Proveedor guardado exitosamente!");
        obtenerProveedores();
      }
    } catch (error) {
      console.error("Excepcion al crear el pproveedor", error);
      toast.error("Error al crear el proveedor");
    }

    // Reset
    setdatosForm({ nombre: "", telefono: "", email: "" });
    setError("");
    cerrarModalAgregar();
  };

  // Logica para el modal de agregar nuevo proveedor

  const [showModalAgregar, setShowModalAgregar] = useState(false);

  const abrirModalAgregar = () => {
    setShowModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setShowModalAgregar(false);
    setdatosForm({ nombre: "", telefono: "", email: "" });
    setError("");
  };

  // Filas de tabla seleccionadas

  const [seleccionados, setSeleccionados] = useState([]);

  // Logica para el modal de eliminar

  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const abrirModalEliminar = () => {
    const Seleccionados = proveedoresData.filter((p) =>
      seleccionados.includes(p.id)
    );
    if (Seleccionados.length === 0) {
      toast.warning("No hay ningun producto seleccionado");
      return;
    } else {
      setShowModalEliminar(true);
    }
  };

  const eliminarProveeSelec = async () => {
    try {
      const data = { ids: seleccionados };
      const response = await eliminarProveedores(data);
      if (response.status === 204) {
        toast.success("¡Proveedores eliminados exitosamente!");
        obtenerProveedores();
      }
    } catch (error) {
      console.error("Excepcion al eliminar el proveedores", error);
      toast.error("Error al eliminar el proveedores");
    }

    cerrarModalEliminar();
  };

  const cerrarModalEliminar = () => {
    setShowModalEliminar(false);
  };

  // Logica para la edicion de los proveedores

  const [edicion, setEdicion] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState(null);
  const [datosEditados, setDatosEditados] = useState({});

  const verEdicion = () => {
    const Seleccionados = proveedoresData.filter((p) =>
      seleccionados.includes(p.id)
    );

    if (Seleccionados.length === 0) {
      toast.warning("No hay ningun proveedor seleccionado");
      return;
    }

    if (Seleccionados.length > 1) {
      toast.warning("Selecciona solo un proveedor para editar");
      return;
    }

    const proveedorSeleccionado = Seleccionados[0];

    setEdicion(true);
    Editar(proveedorSeleccionado);
  };

  const ocultarEdicion = () => {
    setEdicion(false);
  };

  const Editar = (proveedor) => {
    setProveedorEditando(proveedor.id);
    setDatosEditados({ ...proveedor });
  };

  const CancelarEdicion = () => {
    setProveedorEditando(null);
    setDatosEditados({});
    ocultarEdicion();
    toast.info("Cancelado con exito!");
  };

  const GuardarEdicion = async () => {
    const proveedorE = {
      nombre: datosEditados.nombre,
      telefono: datosEditados.telefono,
      email: datosEditados.email,
    };

    console.log("proveedor editado", proveedorE);

    try {
      const response = await editarProveedor(proveedorE, proveedorEditando);
      if (response.status === 200) {
        toast.success("¡Proveedor actualizado exitosamente!");
        obtenerProveedores();
      } else {
        console.log("respuesta :", response);
      }
    } catch (error) {
      console.error("Excepcion al actualizar el proveedor", error);
      toast.error("Error al actualizar el proveedor");
    }

    setProveedorEditando(null);
    setDatosEditados({});
    ocultarEdicion();
  };

  const handleChangeEdicion = (e) => {
    const { name, value } = e.target;
    setDatosEditados((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // //////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (cargando) {
    return (
      <div className="modal-cargando">
        <div className="modal-contenido-c">
          <div class="loader"></div>
        </div>
      </div>
    );
  }

  // /////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <>
      <section className="proveedores">
        <h1>PROVEEDORES</h1>
        <div id="cont">
          <div className="buscador">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-search"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <Button variant="rojo" onClick={abrirModalEliminar}>
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
              class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
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
          <Button variant="azul" onClick={verEdicion}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-edit"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
            Editar
          </Button>
          <Button variant="verde" onClick={abrirModalAgregar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-square-rounded-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
              <path d="M15 12h-6" />
              <path d="M12 9v6" />
            </svg>
            Agregar
          </Button>
        </div>
        <br />
        <div className="proveedores-tabla">
          <table class="tabla-P">
            <thead className="t-P">
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Telefono</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {datosFitrados.map((proveedor) => (
                <tr key={proveedor.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(proveedor.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados([...seleccionados, proveedor.id]);
                        } else {
                          setSeleccionados(
                            seleccionados.filter((id) => id !== proveedor.id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td>
                    {proveedorEditando === proveedor.id ? (
                      <input
                        className="inputss"
                        type="text"
                        name="nombre"
                        value={datosEditados.nombre}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      proveedor.nombre
                    )}
                  </td>
                  <td>
                    {proveedorEditando === proveedor.id ? (
                      <input
                        className="inputss"
                        type="tel"
                        name="telefono"
                        value={datosEditados.telefono}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      proveedor.telefono
                    )}
                  </td>
                  <td>
                    {proveedorEditando === proveedor.id ? (
                      <input
                        className="inputss"
                        type="email"
                        name="email"
                        value={datosEditados.email}
                        onChange={handleChangeEdicion}
                      />
                    ) : (
                      proveedor.email
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {edicion && (
          <div id="botoness-edicion">
            <Button variant="verde" onClick={GuardarEdicion}>
              Guardar
            </Button>
            <Button variant="rojo" onClick={CancelarEdicion}>
              Cancelar
            </Button>
          </div>
        )}

        {/* Modal de agregar producto */}
        {showModalAgregar && (
          <div className="modal" onClick={cerrarModalAgregar}>
            <div
              className="modal-contenedor-p"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-contenido-p">
                <h2>Agregar nuevo proveedor</h2>
                <form className="formulario-p" onSubmit={handleSubmit}>
                  <div className="bloque-p">
                    <label>Nombre</label>
                    <input
                      type="text"
                      placeholder="Nombre del proovedor"
                      name="nombre"
                      value={datosForm.nombre}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque-p">
                    <label>Telefono</label>
                    <input
                      type="tel"
                      placeholder="Numero de contacto"
                      name="telefono"
                      value={datosForm.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bloque-p">
                    <label>Email</label>
                    <input
                      type="email"
                      step="0.01"
                      placeholder="Email del proveedor"
                      name="email"
                      value={datosForm.email}
                      onChange={handleChange}
                    />
                  </div>

                  {error && <p className="error-p">{error}</p>}

                  <div className="botones">
                    <Button type="submit" variant="verde" class="btn">
                      Guardar
                    </Button>
                    <Button
                      variant="rojo"
                      onClick={cerrarModalAgregar}
                      class="btn"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de eliminar producto */}
        {showModalEliminar && (
          <div className="modal" onClick={cerrarModalEliminar}>
            <div
              className="modal-contenedor-eliminar-p"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>
                ¿Esta completamente seguro que desea eliminar el/los
                proveedores?
              </h2>
              <div id="botoness">
                <Button variant="verde" onClick={eliminarProveeSelec}>
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

export default Proveedores;
